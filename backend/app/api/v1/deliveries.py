from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.security import get_current_user, require_roles
from app.models.user import User
from app.models.order import Order, OrderStatusHistory
from app.models.delivery import Delivery, DeliveryAddressUpdate
from app.models.tracking import RiderLocation
from app.models.communication import AuditLog
from app.schemas.delivery import DeliveryOut, DeliveryAssign, DeliveryStatusUpdate

router = APIRouter()

def delivery_loader_options():
    return (
        selectinload(Delivery.order).selectinload(Order.service),
        selectinload(Delivery.order).selectinload(Order.user),
        selectinload(Delivery.order).selectinload(Order.files),
        selectinload(Delivery.order).selectinload(Order.status_history),
        selectinload(Delivery.rider),
        selectinload(Delivery.address_updates)
    )

@router.get("/rider/my-deliveries", response_model=List[DeliveryOut])
async def get_rider_deliveries(
    current_user: User = Depends(require_roles("delivery", "rider", "admin")),
    db: AsyncSession = Depends(get_db)
):
    query = (
        select(Delivery)
        .options(*delivery_loader_options())
        .where(Delivery.delivery_person_id == current_user.id)
        .order_by(Delivery.created_at.desc())
    )
    res = await db.execute(query)
    deliveries = res.scalars().all()
    return [DeliveryOut.model_validate(d) for d in deliveries]

@router.post("/assign/{delivery_id}", response_model=DeliveryOut)
async def assign_rider(
    delivery_id: int,
    assign_in: DeliveryAssign,
    current_admin: User = Depends(require_roles("admin")),
    db: AsyncSession = Depends(get_db)
):
    del_res = await db.execute(
        select(Delivery)
        .options(*delivery_loader_options())
        .where(Delivery.id == delivery_id)
    )
    delivery = del_res.scalar_one_or_none()
    if not delivery:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Delivery not found")

    delivery.delivery_person_id = assign_in.delivery_person_id
    delivery.status = "assigned"
    if assign_in.pickup_location:
        delivery.pickup_location = assign_in.pickup_location
    if assign_in.delivery_address:
        delivery.delivery_address = assign_in.delivery_address
    if assign_in.estimated_time:
        delivery.estimated_time = assign_in.estimated_time

    # Update Order status
    order_res = await db.execute(select(Order).where(Order.id == delivery.order_id))
    order = order_res.scalar_one()
    order.status = "confirmed"

    # Add order history
    history = OrderStatusHistory(
        order_id=order.id,
        status="confirmed",
        notes=f"Delivery assigned to rider ID {assign_in.delivery_person_id}",
        created_by=current_admin.id
    )
    db.add(history)

    await db.commit()

    # Re-query with eager relationships loaded
    reload_res = await db.execute(
        select(Delivery)
        .options(*delivery_loader_options())
        .where(Delivery.id == delivery_id)
    )
    return DeliveryOut.model_validate(reload_res.scalar_one())

@router.post("/status/{delivery_id}", response_model=DeliveryOut)
async def update_delivery_status(
    delivery_id: int,
    status_in: DeliveryStatusUpdate,
    current_user: User = Depends(require_roles("delivery", "rider", "admin")),
    db: AsyncSession = Depends(get_db)
):
    del_res = await db.execute(
        select(Delivery)
        .options(*delivery_loader_options())
        .where(Delivery.id == delivery_id)
    )
    delivery = del_res.scalar_one_or_none()
    if not delivery:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Delivery not found")

    # Authorize rider
    if current_user.role != "admin" and delivery.delivery_person_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not assigned to this delivery")

    new_status = status_in.status
    delivery.status = new_status
    delivery.updated_at = datetime.now(timezone.utc)

    order = delivery.order

    if new_status == "in_transit":
        delivery.started_at = datetime.now(timezone.utc)
        if order:
            order.status = "in_transit"
            history = OrderStatusHistory(
                order_id=order.id,
                status="in_transit",
                notes="Rider is in transit with your order",
                created_by=current_user.id
            )
            db.add(history)

    elif new_status == "delivered":
        delivery.actual_delivery_time = datetime.now(timezone.utc)
        if status_in.signature:
            delivery.signature = status_in.signature
        if order:
            order.status = "delivered"
            order.actual_delivery = datetime.now(timezone.utc)
            history = OrderStatusHistory(
                order_id=order.id,
                status="delivered",
                notes="Order marked as delivered by rider",
                created_by=current_user.id
            )
            db.add(history)
        
        # Calculate rating based on duration if not set
        if delivery.created_at:
            duration_minutes = (datetime.now(timezone.utc) - delivery.created_at.replace(tzinfo=timezone.utc)).total_seconds() / 60
            delivery.rating = 5 if duration_minutes <= 30 else (4 if duration_minutes <= 60 else (3 if duration_minutes <= 120 else 2))

        # Cleanup rider location entry
        await db.execute(select(RiderLocation).where(RiderLocation.delivery_id == delivery.id))

    elif new_status in ["undelivered", "failed"]:
        delivery.delivery_notes = status_in.delivery_notes or "Delivery failed / client unavailable"
        if order:
            order.status = "cancelled"
            history = OrderStatusHistory(
                order_id=order.id,
                status="cancelled",
                notes=f"Undelivered: {delivery.delivery_notes}",
                created_by=current_user.id
            )
            db.add(history)

    await db.commit()

    # Re-query with eager relationships loaded
    reload_res = await db.execute(
        select(Delivery)
        .options(*delivery_loader_options())
        .where(Delivery.id == delivery_id)
    )
    return DeliveryOut.model_validate(reload_res.scalar_one())
