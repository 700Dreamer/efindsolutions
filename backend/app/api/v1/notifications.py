from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.communication import Notification
from app.schemas.communication import NotificationOut

router = APIRouter()

@router.get("", response_model=List[NotificationOut])
async def get_my_notifications(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(
        select(Notification)
        .where(Notification.user_id == current_user.id)
        .order_by(Notification.created_at.desc())
    )
    notifs = res.scalars().all()
    return [NotificationOut.model_validate(n) for n in notifs]

@router.put("/{notif_id}/read", response_model=NotificationOut)
async def mark_notification_read(
    notif_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(
        select(Notification)
        .where(Notification.id == notif_id, Notification.user_id == current_user.id)
    )
    notif = res.scalar_one_or_none()
    if not notif:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")

    notif.is_read = True
    await db.commit()
    await db.refresh(notif)
    return NotificationOut.model_validate(notif)
