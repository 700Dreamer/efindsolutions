from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from decimal import Decimal

class ServiceBase(BaseModel):
    name: str
    slug: str
    description: str
    long_description: Optional[str] = None
    icon: Optional[str] = "fa-cube"
    image_path: Optional[str] = None
    image: Optional[str] = None
    category: Optional[str] = "general"
    base_price: Decimal
    features: Optional[str] = "[]"  # JSON list string
    is_active: Optional[bool] = True
    is_featured: Optional[bool] = False

class ServiceCreate(ServiceBase):
    pass

class ServiceUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    long_description: Optional[str] = None
    icon: Optional[str] = None
    image_path: Optional[str] = None
    image: Optional[str] = None
    category: Optional[str] = None
    base_price: Optional[Decimal] = None
    features: Optional[str] = None
    is_active: Optional[bool] = None
    is_featured: Optional[bool] = None

class ServiceOut(ServiceBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
