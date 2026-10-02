from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr, ConfigDict

class UserBase(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    role: Optional[str] = "customer"
    avatar: Optional[str] = "default-avatar.png"
    address: Optional[str] = None
    city: Optional[str] = None
    is_active: Optional[bool] = True

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone: Optional[str] = None
    role: Optional[str] = "customer"
    address: Optional[str] = None
    city: Optional[str] = None

class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    avatar: Optional[str] = None
    password: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None

class UserOut(UserBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

class LoginRequest(BaseModel):
    email: EmailStr
    password: str
