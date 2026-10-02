from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, Numeric
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class Service(Base):
    __tablename__ = "services"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=False)
    long_description = Column(Text, nullable=True)
    icon = Column(String(50), nullable=True)
    image_path = Column(String(500), nullable=True)
    image = Column(String(500), nullable=True)
    category = Column(String(100), nullable=True, index=True)
    base_price = Column(Numeric(10, 2), nullable=False, default=0.00)
    features = Column(Text, nullable=True)  # JSON serialized list of features
    is_active = Column(Boolean, default=True)
    is_featured = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    orders = relationship("Order", back_populates="service", cascade="all, delete-orphan")
