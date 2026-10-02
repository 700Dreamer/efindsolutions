from typing import Optional, List, Any
from datetime import datetime, date
from pydantic import BaseModel, ConfigDict
from decimal import Decimal
from app.schemas.service import ServiceOut
from app.schemas.user import UserOut

class OrderFileOut(BaseModel):
    id: int
    order_id: int
    file_path: str
    original_name: str
    mime_type: Optional[str] = None
    size: Optional[int] = None
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class OrderStatusHistoryOut(BaseModel):
    id: int
    order_id: int
    status: str
    notes: Optional[str] = None
    created_by: Optional[int] = None
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class OrderCreate(BaseModel):
    service_id: int
    quantity: int = 1
    customization_details: Optional[str] = "{}"  # JSON string
    delivery_method: str = "door_delivery"  # 'door_delivery' or 'pickup'
    delivery_address: Optional[str] = None
    delivery_notes: Optional[str] = None
    payment_method: str = "pesapal"  # 'pesapal', 'mtn_momo', 'airtel_money', 'cash_on_delivery'

class OrderUpdateStatus(BaseModel):
    status: str
    notes: Optional[str] = None
    estimated_delivery: Optional[date] = None

class OrderOut(BaseModel):
    id: int
    user_id: int
    service_id: int
    order_number: str
    status: str
    customization_details: Optional[str] = None
    quantity: int
    unit_price: Decimal
    total_amount: Decimal
    delivery_method: str
    delivery_address: Optional[str] = None
    delivery_notes: Optional[str] = None
    estimated_delivery: Optional[date] = None
    actual_delivery: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    service: Optional[ServiceOut] = None
    user: Optional[UserOut] = None
    files: Optional[List[OrderFileOut]] = None
    status_history: Optional[List[OrderStatusHistoryOut]] = None

    model_config = ConfigDict(from_attributes=True)
