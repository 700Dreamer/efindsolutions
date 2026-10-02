from sqlalchemy import Column, Integer, String, DateTime, Text, Numeric, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, index=True)
    payment_method = Column(String(50), nullable=False)  # 'pesapal', 'mtn_momo', 'airtel_money', 'cash_on_delivery', 'card'
    amount = Column(Numeric(10, 2), nullable=False)
    transaction_id = Column(String(255), unique=True, nullable=True, index=True)
    status = Column(String(50), default="pending", index=True)  # 'pending', 'completed', 'failed', 'refunded'
    payment_details = Column(Text, nullable=True)  # JSON string
    paid_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)

    # Relationships
    order = relationship("Order", back_populates="payments")
