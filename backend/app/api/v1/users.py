from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.security import get_current_user, get_password_hash, verify_password
from app.core.storage import storage_service
from app.models.user import User
from app.schemas.user import UserUpdate, UserOut

router = APIRouter()

@router.put("/profile", response_model=UserOut)
async def update_profile(
    user_in: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if user_in.name is not None:
        current_user.name = user_in.name
    if user_in.phone is not None:
        current_user.phone = user_in.phone
    if user_in.address is not None:
        current_user.address = user_in.address
    if user_in.city is not None:
        current_user.city = user_in.city
    if user_in.avatar is not None:
        current_user.avatar = user_in.avatar
    if user_in.password:
        current_user.password = get_password_hash(user_in.password)

    await db.commit()
    await db.refresh(current_user)
    return UserOut.model_validate(current_user)

@router.post("/avatar", response_model=UserOut)
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    avatar_url, _ = await storage_service.upload_file(file, subfolder="avatars")
    current_user.avatar = avatar_url
    await db.commit()
    await db.refresh(current_user)
    return UserOut.model_validate(current_user)
