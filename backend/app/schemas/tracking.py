from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from decimal import Decimal
from app.schemas.user import UserOut

class LocationPing(BaseModel):
    delivery_id: int
    latitude: float
    longitude: float

class RiderLocationOut(BaseModel):
    id: Optional[int] = 0
    delivery_id: int
    rider_id: Optional[int] = None
    latitude: float
    longitude: float
    updated_at: Optional[datetime] = None
    rider: Optional[UserOut] = None

    model_config = ConfigDict(from_attributes=True)

class TrackingInfoOut(BaseModel):
    order_number: str
    order_status: str
    service_name: str
    service_icon: Optional[str] = None
    total_amount: Decimal
    delivery_id: Optional[int] = None
    delivery_status: Optional[str] = None
    delivery_address: Optional[str] = None
    rider_name: Optional[str] = None
    rider_phone: Optional[str] = None
    rider_lat: Optional[float] = None
    rider_lng: Optional[float] = None
    estimated_delivery: Optional[datetime] = None
