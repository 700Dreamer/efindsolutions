import os
import shutil
import uuid
from typing import Tuple, Optional
from fastapi import UploadFile
from app.core.config import settings

class StorageService:
    def __init__(self):
        self.use_gcs = settings.USE_GCS
        self.bucket_name = settings.GCS_BUCKET_NAME
        self.upload_dir = settings.UPLOAD_DIR
        os.makedirs(self.upload_dir, exist_ok=True)

    async def upload_file(self, file: UploadFile, subfolder: str = "general") -> Tuple[str, int]:
        """
        Uploads a file to GCS or local disk.
        Returns: (file_url_or_path, file_size_bytes)
        """
        filename = file.filename or "uploaded_file"
        file_ext = os.path.splitext(filename)[1]
        unique_name = f"{uuid.uuid4().hex}{file_ext}"
        
        contents = await file.read()
        file_size = len(contents)
        await file.seek(0)

        if self.use_gcs:
            try:
                from google.cloud import storage
                client = storage.Client()
                bucket = client.bucket(self.bucket_name)
                blob_path = f"{subfolder}/{unique_name}"
                blob = bucket.blob(blob_path)
                blob.upload_from_string(contents, content_type=file.content_type)
                # Public URL or GCS URI
                return blob.public_url, file_size
            except Exception as e:
                # Log error and fallback to local storage
                print(f"[StorageService] GCS upload failed, falling back to local: {e}")

        # Local storage fallback
        target_dir = os.path.join(self.upload_dir, subfolder)
        os.makedirs(target_dir, exist_ok=True)
        file_path = os.path.join(target_dir, unique_name)
        with open(file_path, "wb") as f:
            f.write(contents)
            
        relative_url = f"/uploads/{subfolder}/{unique_name}"
        return relative_url, file_size

    def delete_file(self, file_url_or_path: Optional[str]) -> bool:
        """
        Deletes a previously uploaded file from local storage or GCS.
        Returns True if a file was found and deleted, False otherwise.
        Safely ignores None, empty paths, and external third-party URLs.
        """
        if not file_url_or_path:
            return False

        path_str = str(file_url_or_path).strip()
        if not path_str:
            return False

        # Handle GCS
        if self.use_gcs:
            try:
                from google.cloud import storage
                client = storage.Client()
                bucket = client.bucket(self.bucket_name)
                blob_name = path_str
                if self.bucket_name in blob_name:
                    blob_name = blob_name.split(f"{self.bucket_name}/")[-1]
                blob = bucket.blob(blob_name)
                if blob.exists():
                    blob.delete()
                    return True
            except Exception as e:
                print(f"[StorageService] GCS delete failed: {e}")

        # Handle Local Storage
        local_rel = None
        if "/uploads/" in path_str:
            local_rel = path_str.split("/uploads/", 1)[1]
        elif path_str.startswith("uploads/"):
            local_rel = path_str[len("uploads/"):]
        elif path_str.startswith(self.upload_dir):
            local_rel = os.path.relpath(path_str, self.upload_dir)
        elif not (path_str.startswith("http://") or path_str.startswith("https://")):
            local_rel = path_str.lstrip("/")

        if not local_rel:
            return False

        norm_upload_dir = os.path.abspath(self.upload_dir)
        target_path = os.path.abspath(os.path.join(norm_upload_dir, local_rel))

        if not target_path.startswith(norm_upload_dir):
            return False

        if os.path.exists(target_path) and os.path.isfile(target_path):
            try:
                os.remove(target_path)
                return True
            except Exception as e:
                print(f"[StorageService] Failed to remove local file {target_path}: {e}")
                return False

        return False

storage_service = StorageService()

