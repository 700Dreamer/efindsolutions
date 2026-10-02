from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.order import Order
from app.models.communication import Review
from app.schemas.communication import ReviewCreate, ReviewOut

router = APIRouter()

@router.post("", response_model=ReviewOut)
async def submit_review(
    rev_in: ReviewCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Verify order ownership
    order_res = await db.execute(select(Order).where(Order.id == rev_in.order_id))
    order = order_res.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    if order.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot review an order that does not belong to you")

    review = Review(
        user_id=current_user.id,
        order_id=rev_in.order_id,
        rating=max(1, min(5, rev_in.rating)),
        comment=rev_in.comment,
        is_approved=True
    )
    db.add(review)
    await db.commit()
    await db.refresh(review)

    return ReviewOut(
        id=review.id,
        order_id=review.order_id,
        user_id=review.user_id,
        user_name=current_user.name,
        rating=review.rating,
        comment=review.comment,
        is_approved=review.is_approved,
        created_at=review.created_at
    )

@router.get("/public", response_model=List[ReviewOut])
async def get_public_reviews(db: AsyncSession = Depends(get_db)):
    query = (
        select(Review)
        .options(selectinload(Review.user))
        .where(Review.is_approved == True)
        .order_by(Review.created_at.desc())
        .limit(10)
    )
    res = await db.execute(query)
    reviews = res.scalars().all()
    return [
        ReviewOut(
            id=r.id,
            order_id=r.order_id,
            user_id=r.user_id,
            user_name=r.user.name if r.user else "Customer",
            rating=r.rating,
            comment=r.comment,
            is_approved=r.is_approved,
            created_at=r.created_at
        )
        for r in reviews
    ]
