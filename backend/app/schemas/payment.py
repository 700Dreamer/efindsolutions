from typing import Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from decimal import Decimal

class PaymentInitiateRequest(BaseModel):
    order_id: int
    payment_method: str = "pesapal"  # 'pesapal', 'mtn_momo', 'airtel_money', 'cash_on_delivery'
    phone_number: Optional[str] = None

class PaymentInitiateResponse(BaseModel):
    payment_id: int
    order_id: int
    order_number: str
    amount: Decimal
    redirect_url: Optional[str] = None
    transaction_id: Optional[str] = None
    reference_id: Optional[str] = None
    status: str
    message: Optional[str] = None
    is_simulation: bool = False

class MomoInitiateRequest(BaseModel):
    order_id: int
    phone_number: str
    payer_message: Optional[str] = "Payment for Order"

class MomoInitiateResponse(BaseModel):
    payment_id: int
    order_id: int
    order_number: str
    reference_id: str
    phone_number: str
    amount: Decimal
    currency: str = "UGX"
    status: str
    message: str
    is_simulation: bool = False

class MomoStatusResponse(BaseModel):
    reference_id: str
    status: str  # 'SUCCESSFUL', 'PENDING', 'FAILED'
    financial_transaction_id: Optional[str] = None
    amount: Optional[Decimal] = None
    currency: Optional[str] = "UGX"
    is_simulation: bool = False
    message: Optional[str] = None

class PaymentVerifyRequest(BaseModel):
    order_tracking_id: str
    order_number: str

class PaymentOut(BaseModel):
    id: int
    order_id: int
    payment_method: str
    amount: Decimal
    transaction_id: Optional[str] = None
    status: str
    payment_details: Optional[str] = None
    paid_at: Optional[datetime] = None
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

