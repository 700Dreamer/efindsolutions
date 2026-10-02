from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class Delivery(Base):
    __tablename__ = "deliveries"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    delivery_person_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    status = Column(
        String(50), 
        default="pending", 
        index=True
    )  # 'pending', 'assigned', 'picked_up', 'in_transit', 'delivered', 'undelivered', 'failed'
    pickup_location = Column(Text, nullable=True)
    delivery_address = Column(Text, nullable=False)
    estimated_time = Column(DateTime(timezone=True), nullable=True)
    actual_delivery_time = Column(DateTime(timezone=True), nullable=True)
    started_at = Column(DateTime(timezone=True), nullable=True)
    rating = Column(Integer, nullable=True)  # 1 to 5
    delivery_notes = Column(Text, nullable=True)
    signature = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    order = relationship("Order", back_populates="delivery")
    rider = relationship("User", back_populates="deliveries", foreign_keys=[delivery_person_id])
    address_updates = relationship("DeliveryAddressUpdate", back_populates="delivery", cascade="all, delete-orphan")
    rider_location = relationship("RiderLocation", back_populates="delivery", uselist=False, cascade="all, delete-orphan")

class DeliveryAddressUpdate(Base):
    __tablename__ = "delivery_address_updates"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    delivery_id = Column(Integer, ForeignKey("deliveries.id", ondelete="CASCADE"), nullable=False, index=True)
    old_address = Column(Text, nullable=True)
    new_address = Column(Text, nullable=False)
    reason = Column(String(255), nullable=True)
    updated_by = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    delivery = relationship("Delivery", back_populates="address_updates")
    updater = relationship("User")
