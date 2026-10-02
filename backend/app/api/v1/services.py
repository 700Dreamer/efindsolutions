from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from app.core.database import get_db
from app.core.security import require_roles
from app.core.storage import storage_service
from app.models.service import Service
from app.models.user import User
from app.schemas.service import ServiceOut, ServiceCreate, ServiceUpdate

router = APIRouter()

@router.get("", response_model=List[ServiceOut])
async def get_services(
    category: Optional[str] = None,
    search: Optional[str] = None,
    featured_only: bool = False,
    active_only: bool = True,
    db: AsyncSession = Depends(get_db)
):
    query = select(Service)
    if active_only:
        query = query.where(Service.is_active == True)
    if featured_only:
        query = query.where(Service.is_featured == True)
    if category and category.lower() != "all":
        query = query.where(Service.category == category)
    if search:
        query = query.where(
            or_(
                Service.name.ilike(f"%{search}%"),
                Service.description.ilike(f"%{search}%")
            )
        )
    query = query.order_by(Service.id.asc())
    result = await db.execute(query)
    services = result.scalars().all()
    return [ServiceOut.model_validate(s) for s in services]

@router.get("/slug/{slug}", response_model=ServiceOut)
async def get_service_by_slug(slug: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Service).where(Service.slug == slug))
    service = result.scalar_one_or_none()
    if not service:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service not found")
    return ServiceOut.model_validate(service)

@router.get("/{service_id}", response_model=ServiceOut)
async def get_service_by_id(service_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Service).where(Service.id == service_id))
    service = result.scalar_one_or_none()
    if not service:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service not found")
    return ServiceOut.model_validate(service)

# Admin Endpoints
@router.post("/upload-image")
async def upload_service_image(
    file: UploadFile = File(...),
    current_admin: User = Depends(require_roles("admin")),
):
    file_url, _ = await storage_service.upload_file(file, subfolder="services")
    return {"url": file_url}

@router.post("/{service_id}/image", response_model=ServiceOut)
async def upload_service_image_by_id(
    service_id: int,
    file: UploadFile = File(...),
    current_admin: User = Depends(require_roles("admin")),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Service).where(Service.id == service_id))
    service = result.scalar_one_or_none()
    if not service:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service not found")

    # Delete old image if it was stored locally/GCS
    if service.image_path:
        storage_service.delete_file(service.image_path)
    if service.image and service.image != service.image_path:
        storage_service.delete_file(service.image)

    file_url, _ = await storage_service.upload_file(file, subfolder="services")
    service.image_path = file_url
    service.image = file_url
    await db.commit()
    await db.refresh(service)
    return ServiceOut.model_validate(service)

@router.post("", response_model=ServiceOut)
async def create_service(
    service_in: ServiceCreate,
    current_admin: User = Depends(require_roles("admin")),
    db: AsyncSession = Depends(get_db)
):
    # Check slug uniqueness
    existing = await db.execute(select(Service).where(Service.slug == service_in.slug))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Service slug already exists")

    service_data = service_in.model_dump()
    # Sync image and image_path if one is provided
    if service_data.get("image_path") and not service_data.get("image"):
        service_data["image"] = service_data["image_path"]
    elif service_data.get("image") and not service_data.get("image_path"):
        service_data["image_path"] = service_data["image"]

    service = Service(**service_data)
    db.add(service)
    await db.commit()
    await db.refresh(service)
    return ServiceOut.model_validate(service)

@router.put("/{service_id}", response_model=ServiceOut)
async def update_service(
    service_id: int,
    service_in: ServiceUpdate,
    current_admin: User = Depends(require_roles("admin")),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Service).where(Service.id == service_id))
    service = result.scalar_one_or_none()
    if not service:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service not found")

    update_data = service_in.model_dump(exclude_unset=True)

    # Clean up old file if image is replaced or removed
    if "image_path" in update_data and update_data["image_path"] != service.image_path:
        if service.image_path:
            storage_service.delete_file(service.image_path)
        if "image" not in update_data:
            update_data["image"] = update_data["image_path"]
    elif "image" in update_data and update_data["image"] != service.image:
        if service.image:
            storage_service.delete_file(service.image)
        if "image_path" not in update_data:
            update_data["image_path"] = update_data["image"]

    for field, value in update_data.items():
        setattr(service, field, value)

    await db.commit()
    await db.refresh(service)
    return ServiceOut.model_validate(service)

@router.delete("/{service_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_service(
    service_id: int,
    current_admin: User = Depends(require_roles("admin")),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Service).where(Service.id == service_id))
    service = result.scalar_one_or_none()
    if not service:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service not found")

    # Delete associated stored images
    if service.image_path:
        storage_service.delete_file(service.image_path)
    if service.image and service.image != service.image_path:
        storage_service.delete_file(service.image)

    await db.delete(service)
    await db.commit()
    return None

