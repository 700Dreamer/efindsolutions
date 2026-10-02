from typing import List, Optional
from datetime import datetime, date, timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_, case, distinct, desc
from sqlalchemy.orm import selectinload
from decimal import Decimal

from app.core.database import get_db
from app.core.security import require_roles, get_password_hash
from app.models.user import User
from app.models.service import Service
from app.models.order import Order, OrderStatusHistory
from app.models.delivery import Delivery
from app.models.payment import Payment
from app.models.communication import ContactMessage, AuditLog
from app.schemas.user import UserOut, UserCreate, UserUpdate
from app.schemas.order import OrderOut, OrderUpdateStatus
from app.schemas.payment import PaymentOut
from app.schemas.communication import AuditLogOut, ContactMessageOut
from app.schemas.admin import DashboardStats, DailyPerformance, TopService, RiderPerformance, UndeliveredReason, MonthlyTrend, LocationStat

router = APIRouter()

@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    current_admin: User = Depends(require_roles("admin")),
    db: AsyncSession = Depends(get_db)
):
    # Core Counts
    tot_orders = await db.scalar(select(func.count(Order.id))) or 0
    tot_users = await db.scalar(select(func.count(User.id))) or 0
    pend_orders = await db.scalar(select(func.count(Order.id)).where(Order.status == "pending")) or 0
    unread_msgs = await db.scalar(select(func.count(ContactMessage.id)).where(ContactMessage.is_read == False)) or 0

    # Date range filters (default to current month)
    today = date.today()
    start_dt = datetime.strptime(start_date, "%Y-%m-%d") if start_date else datetime(today.year, today.month, 1)
    end_dt = (datetime.strptime(end_date, "%Y-%m-%d") + timedelta(days=1)) if end_date else (datetime(today.year, today.month, today.day) + timedelta(days=1))

    # Aggregate stats in range
    rev_q = select(
        func.count(Order.id).label("total_orders"),
        func.coalesce(func.sum(Order.total_amount), 0).label("total_revenue"),
        func.coalesce(func.sum(case((Order.status.in_(["completed", "delivered"]), 1), else_=0)), 0).label("completed_orders"),
        func.coalesce(func.sum(case((Order.status == "cancelled", 1), else_=0)), 0).label("cancelled_orders"),
    ).where(Order.created_at >= start_dt, Order.created_at <= end_dt)
    
    rev_res = await db.execute(rev_q)
    rev_row = rev_res.one()
    
    total_rev = float(rev_row.total_revenue)
    completed_ords = int(rev_row.completed_orders)
    cancelled_ords = int(rev_row.cancelled_orders)
    total_ords_range = int(rev_row.total_orders)
    completion_rate = round((completed_ords / total_ords_range * 100)) if total_ords_range > 0 else 0

    # Daily breakdown
    daily_q = (
        select(
            func.date(Order.created_at).label("order_date"),
            func.count(Order.id).label("orders"),
            func.coalesce(func.sum(case((Order.status.in_(["completed", "delivered"]), 1), else_=0)), 0).label("completed"),
            func.coalesce(func.sum(case((Order.status == "cancelled", 1), else_=0)), 0).label("cancelled"),
            func.coalesce(func.sum(Order.total_amount), 0).label("revenue")
        )
        .where(Order.created_at >= start_dt, Order.created_at <= end_dt)
        .group_by(func.date(Order.created_at))
        .order_by(func.date(Order.created_at).asc())
    )
    daily_res = await db.execute(daily_q)
    daily_rows = daily_res.all()
    daily_list = [
        DailyPerformance(
            order_date=str(r.order_date),
            orders=int(r.orders),
            completed=int(r.completed),
            cancelled=int(r.cancelled),
            revenue=float(r.revenue)
        )
        for r in daily_rows
    ]

    # Top Services
    top_q = (
        select(
            Service.name,
            func.count(Order.id).label("count"),
            func.coalesce(func.sum(Order.total_amount), 0).label("revenue")
        )
        .join(Order, Service.id == Order.service_id)
        .group_by(Service.id, Service.name)
        .order_by(desc("count"))
        .limit(5)
    )
    top_res = await db.execute(top_q)
    top_rows = top_res.all()
    top_services_list = [
        TopService(name=r.name, count=int(r.count), revenue=float(r.revenue))
        for r in top_rows
    ]

    # Rider Performance
    rider_q = (
        select(
            User.name,
            func.count(Delivery.id).label("total_deliveries"),
            func.coalesce(func.sum(case((Delivery.status == "delivered", 1), else_=0)), 0).label("completed"),
            func.coalesce(func.sum(case((Delivery.status.in_(["undelivered", "failed"]), 1), else_=0)), 0).label("failed"),
            func.coalesce(func.avg(Delivery.rating), 5.0).label("avg_rating")
        )
        .join(Delivery, User.id == Delivery.delivery_person_id)
        .group_by(User.id, User.name)
        .order_by(desc("completed"))
    )
    rider_res = await db.execute(rider_q)
    rider_rows = rider_res.all()
    rider_list = [
        RiderPerformance(
            name=r.name,
            total_deliveries=int(r.total_deliveries),
            completed=int(r.completed),
            failed=int(r.failed),
            avg_rating=round(float(r.avg_rating), 1)
        )
        for r in rider_rows
    ]

    # Undelivered Reasons
    undel_q = (
        select(
            Delivery.delivery_notes.label("reason"),
            func.count(Delivery.id).label("count"),
            func.coalesce(func.sum(Order.total_amount), 0).label("total_loss")
        )
        .join(Order, Delivery.order_id == Order.id)
        .where(Delivery.status.in_(["undelivered", "failed"]))
        .group_by(Delivery.delivery_notes)
        .order_by(desc("count"))
    )
    undel_res = await db.execute(undel_q)
    undel_rows = undel_res.all()
    undel_list = [
        UndeliveredReason(
            reason=r.reason or "No reason specified",
            count=int(r.count),
            total_loss=float(r.total_loss)
        )
        for r in undel_rows
    ]

    # Monthly Trends (12 months)
    month_names = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    monthly_sales_list = [
        MonthlyTrend(month=m, orders=0, revenue=0.0) for m in month_names
    ]

    # Location Sales
    loc_q = (
        select(
            User.city,
            func.count(Order.id).label("orders"),
            func.coalesce(func.sum(Order.total_amount), 0).label("revenue")
        )
        .join(Order, User.id == Order.user_id)
        .where(User.city.isnot(None), User.city != "")
        .group_by(User.city)
        .order_by(desc("orders"))
        .limit(8)
    )
    loc_res = await db.execute(loc_q)
    loc_rows = loc_res.all()
    loc_list = [
        LocationStat(city=r.city or "Unknown", orders=int(r.orders), revenue=float(r.revenue))
        for r in loc_rows
    ]

    return DashboardStats(
        total_orders=tot_orders,
        total_users=tot_users,
        pending_orders=pend_orders,
        unread_messages=unread_msgs,
        total_revenue=total_rev,
        completed_orders=completed_ords,
        cancelled_orders=cancelled_ords,
        completion_rate=completion_rate,
        daily_performance=daily_list,
        top_services=top_services_list,
        rider_performance=rider_list,
        undelivered_reasons=undel_list,
        monthly_sales=monthly_sales_list,
        location_sales=loc_list
    )

# All Orders Management
@router.get("/orders", response_model=List[OrderOut])
async def get_all_orders(
    status: Optional[str] = None,
    search: Optional[str] = None,
    current_admin: User = Depends(require_roles("admin")),
    db: AsyncSession = Depends(get_db)
):
    query = (
        select(Order)
        .options(
            selectinload(Order.service),
            selectinload(Order.user),
            selectinload(Order.files),
            selectinload(Order.delivery).selectinload(Delivery.rider),
            selectinload(Order.status_history)
        )
    )
    if status and status.lower() != "all":
        query = query.where(Order.status == status)
    if search:
        query = query.where(
            or_(
                Order.order_number.ilike(f"%{search}%"),
                Order.delivery_address.ilike(f"%{search}%")
            )
        )
    query = query.order_by(Order.created_at.desc())
    res = await db.execute(query)
    orders = res.scalars().all()
    return [OrderOut.model_validate(o) for o in orders]

@router.put("/orders/{order_id}/status", response_model=OrderOut)
async def update_order_status_admin(
    order_id: int,
    status_update: OrderUpdateStatus,
    current_admin: User = Depends(require_roles("admin")),
    db: AsyncSession = Depends(get_db)
):
    query = (
        select(Order)
        .options(
            selectinload(Order.service),
            selectinload(Order.user),
            selectinload(Order.files),
            selectinload(Order.status_history)
        )
        .where(Order.id == order_id)
    )
    res = await db.execute(query)
    order = res.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    order.status = status_update.status
    if status_update.estimated_delivery:
        order.estimated_delivery = status_update.estimated_delivery

    history = OrderStatusHistory(
        order_id=order.id,
        status=status_update.status,
        notes=status_update.notes or "Status updated by admin",
        created_by=current_admin.id
    )
    db.add(history)

    # Audit log
    audit = AuditLog(
        user_id=current_admin.id,
        user_name=current_admin.name,
        user_role=current_admin.role,
        action="UPDATE_ORDER_STATUS",
        description=f"Updated order #{order.order_number} to {status_update.status}"
    )
    db.add(audit)

    await db.commit()
    await db.refresh(order)
    return OrderOut.model_validate(order)

# Users Management
@router.get("/users", response_model=List[UserOut])
async def get_all_users(
    role: Optional[str] = None,
    current_admin: User = Depends(require_roles("admin")),
    db: AsyncSession = Depends(get_db)
):
    query = select(User)
    if role and role.lower() != "all":
        query = query.where(User.role == role)
    query = query.order_by(User.id.desc())
    res = await db.execute(query)
    users = res.scalars().all()
    return [UserOut.model_validate(u) for u in users]

@router.post("/users", response_model=UserOut)
async def create_user_admin(
    user_in: UserCreate,
    current_admin: User = Depends(require_roles("admin")),
    db: AsyncSession = Depends(get_db)
):
    existing = await db.execute(select(User).where(User.email == user_in.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    user = User(
        name=user_in.name,
        email=user_in.email,
        password=get_password_hash(user_in.password),
        phone=user_in.phone,
        role=user_in.role or "customer",
        address=user_in.address,
        city=user_in.city,
        is_active=True
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return UserOut.model_validate(user)

@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user_admin(
    user_id: int,
    current_admin: User = Depends(require_roles("admin")),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(select(User).where(User.id == user_id))
    user = res.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    if user.id == current_admin.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot delete your own account")

    await db.delete(user)
    
    audit = AuditLog(
        user_id=current_admin.id,
        user_name=current_admin.name,
        user_role=current_admin.role,
        action="DELETE_USER",
        description=f"Deleted user #{user.id} ({user.email})"
    )
    db.add(audit)
    
    await db.commit()
    return None

@router.put("/users/{user_id}/status", response_model=UserOut)
async def update_user_status_admin(
    user_id: int,
    is_active: bool,
    current_admin: User = Depends(require_roles("admin")),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(select(User).where(User.id == user_id))
    user = res.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        
    if user.id == current_admin.id and not is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot deactivate your own account")

    user.is_active = is_active
    
    audit = AuditLog(
        user_id=current_admin.id,
        user_name=current_admin.name,
        user_role=current_admin.role,
        action="UPDATE_USER_STATUS",
        description=f"Changed status of user #{user.id} to {'active' if is_active else 'inactive'}"
    )
    db.add(audit)
    
    await db.commit()
    await db.refresh(user)
    return UserOut.model_validate(user)

# Audit Logs
@router.get("/audit-logs", response_model=List[AuditLogOut])
async def get_audit_logs(
    current_admin: User = Depends(require_roles("admin")),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(select(AuditLog).order_by(AuditLog.created_at.desc()).limit(100))
    logs = res.scalars().all()
    return [AuditLogOut.model_validate(l) for l in logs]
