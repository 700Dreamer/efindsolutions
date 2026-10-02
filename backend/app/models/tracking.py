from sqlalchemy import Column, Integer, Numeric, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class RiderLocation(Base):
    __tablename__ = "rider_locations"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    delivery_id = Column(Integer, ForeignKey("deliveries.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    rider_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    latitude = Column(Numeric(10, 8), nullable=False)
    longitude = Column(Numeric(11, 8), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    delivery = relationship("Delivery", back_populates="rider_location")
    rider = relationship("User")
