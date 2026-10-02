from fastapi import APIRouter
from app.api.v1 import (
    auth,
    users,
    services,
    orders,
    deliveries,
    tracking,
    payments,
    admin,
    contact,
    notifications,
    reviews,
    websocket,
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(services.router, prefix="/services", tags=["Services"])
api_router.include_router(orders.router, prefix="/orders", tags=["Orders"])
api_router.include_router(deliveries.router, prefix="/deliveries", tags=["Deliveries"])
api_router.include_router(tracking.router, prefix="/tracking", tags=["Tracking"])
api_router.include_router(payments.router, prefix="/payments", tags=["Payments"])
api_router.include_router(admin.router, prefix="/admin", tags=["Admin"])
api_router.include_router(contact.router, prefix="/contact", tags=["Contact"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["Notifications"])
api_router.include_router(reviews.router, prefix="/reviews", tags=["Reviews"])
api_router.include_router(websocket.router, tags=["WebSockets"])
