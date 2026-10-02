from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from decimal import Decimal

class DailyPerformance(BaseModel):
    order_date: str
    orders: int
    completed: int
    cancelled: int
    revenue: float

class TopService(BaseModel):
    name: str
    count: int
    revenue: float

class RiderPerformance(BaseModel):
    name: str
    total_deliveries: int
    completed: int
    failed: int
    avg_rating: float

class UndeliveredReason(BaseModel):
    reason: str
    count: int
    total_loss: float

class MonthlyTrend(BaseModel):
    month: str
    orders: int
    revenue: float

class LocationStat(BaseModel):
    city: str
    orders: int
    revenue: float

class DashboardStats(BaseModel):
    total_orders: int
    total_users: int
    pending_orders: int
    unread_messages: int
    total_revenue: float
    completed_orders: int
    cancelled_orders: int
    completion_rate: int
    daily_performance: List[DailyPerformance]
    top_services: List[TopService]
    rider_performance: List[RiderPerformance]
    undelivered_reasons: List[UndeliveredReason]
    monthly_sales: List[MonthlyTrend]
    location_sales: List[LocationStat]
