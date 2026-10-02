from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from decimal import Decimal

from app.core.database import get_db
from app.core.security import get_current_user, require_roles
from app.models.user import User
from app.models.order import Order
from app.models.delivery import Delivery
from app.models.tracking import RiderLocation
from app.schemas.tracking import LocationPing, RiderLocationOut, TrackingInfoOut

router = APIRouter()

@router.post("/ping", response_model=RiderLocationOut)
async def update_rider_location(
    ping: LocationPing,
    current_user: User = Depends(require_roles("delivery", "rider", "admin")),
    db: AsyncSession = Depends(get_db)
):
    # Verify delivery
    del_res = await db.execute(select(Delivery).where(Delivery.id == ping.delivery_id))
    delivery = del_res.scalar_one_or_none()
    if not delivery:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Delivery not found")

    # Update or insert rider location
    loc_res = await db.execute(select(RiderLocation).where(RiderLocation.delivery_id == ping.delivery_id))
    loc = loc_res.scalar_one_or_none()

    if loc:
        loc.latitude = ping.latitude
        loc.longitude = ping.longitude
        loc.rider_id = current_user.id
        loc.updated_at = datetime.now(timezone.utc)
    else:
        loc = RiderLocation(
            delivery_id=ping.delivery_id,
            rider_id=current_user.id,
            latitude=ping.latitude,
            longitude=ping.longitude,
            updated_at=datetime.now(timezone.utc)
        )
        db.add(loc)

    # Ensure delivery status is in_transit
    if delivery.status != "in_transit":
        delivery.status = "in_transit"

    try:
        await db.commit()
    except Exception:
        await db.rollback()
        # Fallback in case of concurrent insert race condition
        retry_res = await db.execute(select(RiderLocation).where(RiderLocation.delivery_id == ping.delivery_id))
        loc = retry_res.scalar_one_or_none()
        if loc:
            loc.latitude = ping.latitude
            loc.longitude = ping.longitude
            loc.rider_id = current_user.id
            loc.updated_at = datetime.now(timezone.utc)
            await db.commit()
        else:
            raise

    await db.refresh(loc)
    return RiderLocationOut(
        id=loc.id,
        delivery_id=loc.delivery_id,
        rider_id=loc.rider_id,
        latitude=float(loc.latitude),
        longitude=float(loc.longitude),
        updated_at=loc.updated_at
    )

@router.get("/delivery/{delivery_id}", response_model=RiderLocationOut)
async def get_delivery_location(delivery_id: int, db: AsyncSession = Depends(get_db)):
    loc_res = await db.execute(select(RiderLocation).where(RiderLocation.delivery_id == delivery_id))
    loc = loc_res.scalar_one_or_none()
    if not loc:
        # Check if delivery exists
        del_res = await db.execute(select(Delivery).where(Delivery.id == delivery_id))
        delivery = del_res.scalar_one_or_none()
        if not delivery:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Delivery not found")

        # Return default workshop dispatch coordinates (Plot 14 Kampala Road)
        return RiderLocationOut(
            id=0,
            delivery_id=delivery_id,
            rider_id=delivery.delivery_person_id,
            latitude=0.3476,
            longitude=32.5825,
            updated_at=delivery.created_at
        )

    return RiderLocationOut(
        id=loc.id,
        delivery_id=loc.delivery_id,
        rider_id=loc.rider_id,
        latitude=float(loc.latitude),
        longitude=float(loc.longitude),
        updated_at=loc.updated_at
    )

@router.get("/order/{order_number}", response_model=TrackingInfoOut)
async def track_order_public(order_number: str, db: AsyncSession = Depends(get_db)):
    query = (
        select(Order)
        .options(
            selectinload(Order.service),
            selectinload(Order.delivery).selectinload(Delivery.rider),
            selectinload(Order.delivery).selectinload(Delivery.rider_location)
        )
        .where(Order.order_number == order_number.strip())
    )
    res = await db.execute(query)
    order = res.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found. Please check order number.")

    delivery = order.delivery
    rider_loc = delivery.rider_location if delivery else None

    return TrackingInfoOut(
        order_number=order.order_number,
        order_status=order.status,
        service_name=order.service.name if order.service else "Service",
        service_icon=order.service.icon if order.service else "fa-box",
        total_amount=order.total_amount,
        delivery_id=delivery.id if delivery else None,
        delivery_status=delivery.status if delivery else None,
        delivery_address=delivery.delivery_address if delivery else order.delivery_address,
        rider_name=delivery.rider.name if (delivery and delivery.rider) else None,
        rider_phone=delivery.rider.phone if (delivery and delivery.rider) else None,
        rider_lat=float(rider_loc.latitude) if rider_loc else None,
        rider_lng=float(rider_loc.longitude) if rider_loc else None,
        estimated_delivery=delivery.estimated_time if delivery else None
    )
