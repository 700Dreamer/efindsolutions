import os
import sys
import uvicorn

# Ensure the backend directory is in the Python path
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

def main():
    print("=" * 60)
    print("  🚀 Starting E-Find & Soft Solutions FastAPI Backend")
    print("=" * 60)
    print("  • API Server:         http://localhost:8000")
    print("  • Swagger Docs:       http://localhost:8000/docs")
    print("  • ReDoc:              http://localhost:8000/redoc")
    print("  • Live WebSocket:     ws://localhost:8000/api/v1/ws/tracking/{id}")
    print("-" * 60)
    print("  Demo Accounts:")
    print("    - Admin:     admin@efind.com / admin123")
    print("    - Rider:     rider@efind.com / rider123")
    print("    - Customer:  kuzijohnbosco@gmail.com / customer123")
    print("=" * 60 + "\n")

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        reload_dirs=[BACKEND_DIR],
    )

if __name__ == "__main__":
    main()
