from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class ContactMessage(Base):
    __tablename__ = "contact_messages"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False)
    subject = Column(String(255), nullable=True)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    order_id = Column(Integer, nullable=True)
    type = Column(String(50), nullable=False)  # 'delivery_date', 'order_status', 'payment', 'system'
    title = Column(String(255), nullable=False, default="")
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    data = Column(Text, nullable=True)  # JSON string
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="notifications")

class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, index=True)
    rating = Column(Integer, nullable=False)  # 1 to 5
    comment = Column(Text, nullable=True)
    is_approved = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="reviews")
    order = relationship("Order", back_populates="reviews")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    user_name = Column(String(255), nullable=True)
    user_role = Column(String(50), nullable=True)
    action = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    ip_address = Column(String(45), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="audit_logs")
