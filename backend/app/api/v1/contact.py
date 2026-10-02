from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.security import require_roles
from app.models.user import User
from app.models.communication import ContactMessage
from app.schemas.communication import ContactMessageCreate, ContactMessageOut

router = APIRouter()

@router.post("", response_model=ContactMessageOut)
async def submit_contact_message(
    msg_in: ContactMessageCreate,
    db: AsyncSession = Depends(get_db)
):
    msg = ContactMessage(
        name=msg_in.name,
        email=msg_in.email,
        subject=msg_in.subject or "Inquiry",
        message=msg_in.message,
        is_read=False
    )
    db.add(msg)
    await db.commit()
    await db.refresh(msg)
    return ContactMessageOut.model_validate(msg)

@router.get("", response_model=List[ContactMessageOut])
async def get_messages_admin(
    current_admin: User = Depends(require_roles("admin")),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(select(ContactMessage).order_by(ContactMessage.created_at.desc()))
    messages = res.scalars().all()
    return [ContactMessageOut.model_validate(m) for m in messages]

@router.put("/{msg_id}/read", response_model=ContactMessageOut)
async def mark_message_read(
    msg_id: int,
    current_admin: User = Depends(require_roles("admin")),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(select(ContactMessage).where(ContactMessage.id == msg_id))
    msg = res.scalar_one_or_none()
    if not msg:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Message not found")

    msg.is_read = True
    await db.commit()
    await db.refresh(msg)
    return ContactMessageOut.model_validate(msg)
