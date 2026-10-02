from typing import Optional, List, Any
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from app.schemas.user import UserOut
from app.schemas.order import OrderOut

class DeliveryAddressUpdateOut(BaseModel):
    id: int
    delivery_id: int
    old_address: Optional[str] = None
    new_address: str
    reason: Optional[str] = None
    updated_by: int
    created_at: Optional[datetime] = None
    updater: Optional[UserOut] = None

    model_config = ConfigDict(from_attributes=True)

class DeliveryAssign(BaseModel):
    delivery_person_id: int
    pickup_location: Optional[str] = None
    delivery_address: Optional[str] = None
    estimated_time: Optional[datetime] = None

class DeliveryStatusUpdate(BaseModel):
    status: str  # 'assigned', 'picked_up', 'in_transit', 'delivered', 'undelivered', 'failed'
    delivery_notes: Optional[str] = None
    signature: Optional[str] = None

class DeliveryOut(BaseModel):
    id: int
    order_id: int
    delivery_person_id: Optional[int] = None
    status: str
    pickup_location: Optional[str] = None
    delivery_address: str
    estimated_time: Optional[datetime] = None
    actual_delivery_time: Optional[datetime] = None
    started_at: Optional[datetime] = None
    rating: Optional[int] = None
    delivery_notes: Optional[str] = None
    signature: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    rider: Optional[UserOut] = None
    address_updates: Optional[List[DeliveryAddressUpdateOut]] = None
    order: Optional[OrderOut] = None

    model_config = ConfigDict(from_attributes=True)
