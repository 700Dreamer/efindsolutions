from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr, ConfigDict

class ContactMessageCreate(BaseModel):
    name: str
    email: EmailStr
    subject: Optional[str] = None
    message: str

class ContactMessageOut(ContactMessageCreate):
    id: int
    is_read: bool
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class NotificationOut(BaseModel):
    id: int
    user_id: int
    order_id: Optional[int] = None
    type: str
    title: str
    message: str
    is_read: bool
    data: Optional[str] = None
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class ReviewCreate(BaseModel):
    order_id: int
    rating: int
    comment: Optional[str] = None

class ReviewOut(ReviewCreate):
    id: int
    user_id: int
    user_name: Optional[str] = None
    is_approved: bool
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class AuditLogOut(BaseModel):
    id: int
    user_id: Optional[int] = None
    user_name: Optional[str] = None
    user_role: Optional[str] = None
    action: str
    description: Optional[str] = None
    ip_address: Optional[str] = None
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
