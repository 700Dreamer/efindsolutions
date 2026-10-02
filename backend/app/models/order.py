from sqlalchemy import Column, Integer, String, DateTime, Text, Numeric, ForeignKey, Date, BigInteger
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    service_id = Column(Integer, ForeignKey("services.id", ondelete="CASCADE"), nullable=False, index=True)
    order_number = Column(String(50), unique=True, index=True, nullable=False)
    status = Column(
        String(50), 
        default="pending", 
        index=True
    )  # 'pending', 'confirmed', 'processing', 'ready', 'in_transit', 'delivered', 'completed', 'cancelled'
    customization_details = Column(Text, nullable=True)  # JSON string
    quantity = Column(Integer, default=1)
    unit_price = Column(Numeric(10, 2), nullable=False)
    total_amount = Column(Numeric(10, 2), nullable=False)
    delivery_method = Column(String(50), default="door_delivery")  # 'door_delivery', 'pickup'
    delivery_address = Column(Text, nullable=True)
    delivery_notes = Column(Text, nullable=True)
    estimated_delivery = Column(Date, nullable=True)
    actual_delivery = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="orders")
    service = relationship("Service", back_populates="orders")
    files = relationship("OrderFile", back_populates="order", cascade="all, delete-orphan")
    status_history = relationship("OrderStatusHistory", back_populates="order", cascade="all, delete-orphan", order_by="OrderStatusHistory.created_at.desc()")
    delivery = relationship("Delivery", back_populates="order", uselist=False, cascade="all, delete-orphan")
    payments = relationship("Payment", back_populates="order", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="order", cascade="all, delete-orphan")

class OrderFile(Base):
    __tablename__ = "order_files"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, index=True)
    file_path = Column(String(500), nullable=False)
    original_name = Column(String(255), nullable=False)
    mime_type = Column(String(100), nullable=True)
    size = Column(BigInteger, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    order = relationship("Order", back_populates="files")

class OrderStatusHistory(Base):
    __tablename__ = "order_status_history"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, index=True)
    status = Column(String(50), nullable=False)
    notes = Column(Text, nullable=True)
    created_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    order = relationship("Order", back_populates="status_history")
    creator = relationship("User")
