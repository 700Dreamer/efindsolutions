import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_health_check():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

@pytest.mark.asyncio
async def test_get_services():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/v1/services")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

@pytest.mark.asyncio
async def test_login_and_auth():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/api/v1/auth/login", json={
            "email": "admin@efind.com",
            "password": "admin123"
        })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["role"] == "admin"

@pytest.mark.asyncio
async def test_service_image_lifecycle_and_cleanup():
    import os
    from app.core.config import settings

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # 1. Login as admin
        login_res = await ac.post("/api/v1/auth/login", json={
            "email": "admin@efind.com",
            "password": "admin123"
        })
        assert login_res.status_code == 200
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 2. Create a new service
        create_res = await ac.post("/api/v1/services", json={
            "name": "Test Image Service",
            "slug": "test-image-service",
            "description": "A service to test image cleanup",
            "category": "engraving",
            "base_price": 5000.0,
            "features": "[]",
            "is_active": True,
            "is_featured": False
        }, headers=headers)
        assert create_res.status_code == 200
        svc = create_res.json()
        svc_id = svc["id"]

        # 3. Upload first image
        file_bytes1 = b"fake-png-content-1"
        upload_res1 = await ac.post(
            f"/api/v1/services/{svc_id}/image",
            files={"file": ("img1.png", file_bytes1, "image/png")},
            headers=headers
        )
        assert upload_res1.status_code == 200
        data1 = upload_res1.json()
        img1_path = data1["image_path"]
        assert img1_path.startswith("/uploads/services/")
        
        # Verify img1 exists on disk
        img1_rel = img1_path.split("/uploads/")[1]
        img1_disk_path = os.path.join(settings.UPLOAD_DIR, img1_rel)
        assert os.path.exists(img1_disk_path)

        # 4. Upload second image replacing the first
        file_bytes2 = b"fake-png-content-2"
        upload_res2 = await ac.post(
            f"/api/v1/services/{svc_id}/image",
            files={"file": ("img2.png", file_bytes2, "image/png")},
            headers=headers
        )
        assert upload_res2.status_code == 200
        data2 = upload_res2.json()
        img2_path = data2["image_path"]
        assert img2_path != img1_path
        
        # Verify img1 was deleted from disk and img2 exists
        assert not os.path.exists(img1_disk_path)
        img2_rel = img2_path.split("/uploads/")[1]
        img2_disk_path = os.path.join(settings.UPLOAD_DIR, img2_rel)
        assert os.path.exists(img2_disk_path)

        # 5. Delete service and verify img2 is deleted from disk
        del_res = await ac.delete(f"/api/v1/services/{svc_id}", headers=headers)
        assert del_res.status_code == 204
        assert not os.path.exists(img2_disk_path)

