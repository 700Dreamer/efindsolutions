from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token, get_current_user
from app.models.user import User
from app.schemas.user import UserCreate, UserOut, Token, LoginRequest

router = APIRouter()

@router.post("/register", response_model=Token)
async def register(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    # Check if email exists
    result = await db.execute(select(User).where(User.email == user_in.email))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists."
        )
    
    hashed_pwd = get_password_hash(user_in.password)
    user = User(
        name=user_in.name,
        email=user_in.email,
        password=hashed_pwd,
        phone=user_in.phone,
        role=user_in.role or "customer",
        address=user_in.address,
        city=user_in.city,
        is_active=True
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    token = create_access_token(subject=user.id, role=user.role)
    return Token(access_token=token, token_type="bearer", user=UserOut.model_validate(user))

@router.post("/login", response_model=Token)
async def login(credentials: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == credentials.email))
    user = result.scalar_one_or_none()
    
    if not user or not verify_password(credentials.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Account is inactive."
        )

    token = create_access_token(subject=user.id, role=user.role)
    return Token(access_token=token, token_type="bearer", user=UserOut.model_validate(user))

@router.get("/me", response_model=UserOut)
async def get_me(current_user: User = Depends(get_current_user)):
    return UserOut.model_validate(current_user)
