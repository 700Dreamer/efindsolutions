from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=True)
    role = Column(String(50), default="customer")  # 'customer', 'admin', 'delivery' / 'rider'
    avatar = Column(String(500), default="default-avatar.png")
    address = Column(Text, nullable=True)
    city = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True)
    email_verified_at = Column(DateTime(timezone=True), nullable=True)
    remember_token = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    orders = relationship("Order", back_populates="user", cascade="all, delete-orphan")
    deliveries = relationship("Delivery", back_populates="rider", foreign_keys="Delivery.delivery_person_id")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="user", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="user")
