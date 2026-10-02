import bcrypt
from datetime import datetime, timedelta, timezone
from typing import Any, Union, Optional
from jose import jwt, JWTError
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.config import settings
from app.core.database import get_db

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login", auto_error=False)
http_bearer = HTTPBearer(auto_error=False)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    if not plain_password or not hashed_password:
        return False
    # If PHP style $2y$, convert to $2b$ for python bcrypt
    if hashed_password.startswith("$2y$"):
        hashed_password = "$2b$" + hashed_password[4:]
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8")[:72],
            hashed_password.encode("utf-8")
        )
    except Exception:
        return False

def get_password_hash(password: str) -> str:
    pwd_bytes = password.encode("utf-8")[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode("utf-8")

def create_access_token(subject: Union[str, Any], role: str, expires_delta: Optional[timedelta] = None) -> str:
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode = {"sub": str(subject), "role": role, "exp": expire}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

async def get_current_user_optional(
    token_bearer: Optional[HTTPAuthorizationCredentials] = Depends(http_bearer),
    token_oauth: Optional[str] = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
):
    token = None
    if token_bearer and token_bearer.credentials:
        token = token_bearer.credentials
    elif token_oauth:
        token = token_oauth
        
    if not token:
        return None
        
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id_str: str = payload.get("sub")
        if user_id_str is None:
            return None
        user_id = int(user_id_str)
    except (JWTError, ValueError):
        return None
        
    from app.models.user import User
    result = await db.execute(select(User).where(User.id == user_id, User.is_active == True))
    return result.scalar_one_or_none()

async def get_current_user(
    current_user = Depends(get_current_user_optional)
):
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials or user inactive",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return current_user

def require_roles(*allowed_roles: str):
    async def role_checker(current_user = Depends(get_current_user)):
        normalized_user_role = 'rider' if current_user.role == 'delivery' else current_user.role
        normalized_allowed = ['rider' if r == 'delivery' else r for r in allowed_roles]
        
        if normalized_user_role not in normalized_allowed and 'admin' != current_user.role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Operation not permitted. Required roles: {allowed_roles}, your role: {current_user.role}"
            )
        return current_user
    return role_checker
