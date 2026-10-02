import uuid
from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from decimal import Decimal

from app.core.database import get_db
from app.core.security import get_current_user
from app.core.storage import storage_service
from app.models.user import User
from app.models.service import Service
from app.models.order import Order, OrderFile, OrderStatusHistory
from app.models.delivery import Delivery
from app.models.payment import Payment
from app.models.communication import AuditLog, Notification
from app.schemas.order import OrderOut, OrderCreate

router = APIRouter()

def generate_order_number() -> str:
    now_str = datetime.now().strftime("%Y%m%d")
    short_hex = uuid.uuid4().hex[:6].upper()
    return f"EF-{now_str}-{short_hex}"

@router.post("", response_model=OrderOut)
async def create_order(
    service_id: int = Form(...),
    quantity: int = Form(1),
    customization_details: str = Form("{}"),
    delivery_method: str = Form("door_delivery"),
    delivery_address: Optional[str] = Form(None),
    delivery_notes: Optional[str] = Form(None),
    payment_method: str = Form("pesapal"),
    files: List[UploadFile] = File(default=[]),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Fetch service
    svc_result = await db.execute(select(Service).where(Service.id == service_id))
    service = svc_result.scalar_one_or_none()
    if not service:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Selected service not found")

    unit_price = service.base_price
    total_amount = unit_price * Decimal(quantity)
    order_number = generate_order_number()

    # Create Order
    order = Order(
        user_id=current_user.id,
        service_id=service.id,
        order_number=order_number,
        status="pending",
        customization_details=customization_details,
        quantity=quantity,
        unit_price=unit_price,
        total_amount=total_amount,
        delivery_method=delivery_method,
        delivery_address=delivery_address or current_user.address or "Kampala",
        delivery_notes=delivery_notes,
    )
    db.add(order)
    await db.flush()

    # Initial status history
    history = OrderStatusHistory(
        order_id=order.id,
        status="pending",
        notes="Order placed successfully",
        created_by=current_user.id
    )
    db.add(history)

    # Initial Payment entry
    payment = Payment(
        order_id=order.id,
        payment_method=payment_method,
        amount=total_amount,
        status="pending"
    )
    db.add(payment)

    # Create Delivery record if door delivery
    if delivery_method == "door_delivery":
        delivery = Delivery(
            order_id=order.id,
            status="pending",
            delivery_address=delivery_address or current_user.address or "Kampala",
            delivery_notes=delivery_notes,
        )
        db.add(delivery)

    # Handle file uploads
    for file in files:
        if file.filename:
            file_url, file_size = await storage_service.upload_file(file, subfolder=f"orders/{order.id}")
            order_file = OrderFile(
                order_id=order.id,
                file_path=file_url,
                original_name=file.filename,
                mime_type=file.content_type,
                size=file_size
            )
            db.add(order_file)

    # Audit log
    audit = AuditLog(
        user_id=current_user.id,
        user_name=current_user.name,
        user_role=current_user.role,
        action="ORDER_CREATE",
        description=f"Created order #{order_number} for service {service.name}"
    )
    db.add(audit)

    await db.commit()

    # Re-fetch order with relations loaded
    query = (
        select(Order)
        .options(
            selectinload(Order.service),
            selectinload(Order.user),
            selectinload(Order.files),
            selectinload(Order.status_history).selectinload(OrderStatusHistory.creator)
        )
        .where(Order.id == order.id)
    )
    res = await db.execute(query)
    full_order = res.scalar_one()
    return OrderOut.model_validate(full_order)

@router.get("/my", response_model=List[OrderOut])
async def get_my_orders(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    query = (
        select(Order)
        .options(
            selectinload(Order.service),
            selectinload(Order.user),
            selectinload(Order.files),
            selectinload(Order.status_history)
        )
        .where(Order.user_id == current_user.id)
        .order_by(Order.created_at.desc())
    )
    res = await db.execute(query)
    orders = res.scalars().all()
    return [OrderOut.model_validate(o) for o in orders]

@router.get("/{order_id_or_number}", response_model=OrderOut)
async def get_order_detail(
    order_id_or_number: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    query = (
        select(Order)
        .options(
            selectinload(Order.service),
            selectinload(Order.user),
            selectinload(Order.files),
            selectinload(Order.status_history).selectinload(OrderStatusHistory.creator)
        )
    )
    if order_id_or_number.isdigit():
        query = query.where(Order.id == int(order_id_or_number))
    else:
        query = query.where(Order.order_number == order_id_or_number)

    res = await db.execute(query)
    order = res.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    # Authorize: user must own order or be admin / rider
    if order.user_id != current_user.id and current_user.role not in ["admin", "delivery", "rider"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    return OrderOut.model_validate(order)
