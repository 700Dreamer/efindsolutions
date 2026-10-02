import asyncio
import json
from decimal import Decimal
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import AsyncSessionLocal, engine, Base
from app.core.security import get_password_hash
from app.models.user import User
from app.models.service import Service
from app.models.order import Order, OrderStatusHistory
from app.models.delivery import Delivery
from app.models.tracking import RiderLocation
from app.models.payment import Payment
from app.models.communication import Review, ContactMessage

async def seed_data():
    # Ensure tables exist
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        # Check if users already seeded
        res = await db.execute(select(User).limit(1))
        if res.scalar_one_or_none():
            print("[Seed] Database already contains data. Skipping.")
            return

        print("[Seed] Seeding database with initial data...")

        # 1. Seed Users
        admin_user = User(
            id=1,
            name="Administrator",
            email="admin@efind.com",
            password=get_password_hash("admin123"),
            phone="+256700000000",
            role="admin",
            avatar="default-avatar.png",
            city="Kampala",
            is_active=True
        )
        rider_user = User(
            id=2,
            name="John Rider",
            email="rider@efind.com",
            password=get_password_hash("rider123"),
            phone="+256700000001",
            role="delivery",
            avatar="default-avatar.png",
            address="456 Delivery Lane",
            city="Kampala",
            is_active=True
        )
        customer_user = User(
            id=3,
            name="Kuzanya Johnbosco",
            email="kuzijohnbosco@gmail.com",
            password=get_password_hash("customer123"),
            phone="0757156578",
            role="customer",
            avatar="default-avatar.png",
            address="Kampala Road, Plot 14",
            city="Kampala",
            is_active=True
        )
        db.add_all([admin_user, rider_user, customer_user])
        await db.flush()

        # 2. Seed Services
        services_data = [
            {
                "id": 1,
                "name": "Premium Metal Engraving",
                "slug": "metal-engraving",
                "description": "Professional metal engraving services for trophies, plaques, and personalized gifts with precision laser technology.",
                "long_description": "Our metal engraving service uses state-of-the-art laser technology to create precise, permanent markings on various metals. Perfect for corporate awards, personalized gifts, and commemorative items.",
                "icon": "fa-trophy",
                "image_path": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80",
                "image": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80",
                "category": "engraving",
                "base_price": Decimal("15000.00"),
                "features": json.dumps(["Laser precision engraving", "Multiple metal types supported", "Custom designs accepted", "Quick turnaround time", "Bulk order discounts"]),
                "is_active": True,
                "is_featured": True
            },
            {
                "id": 2,
                "name": "Custom Embroidery",
                "slug": "custom-embroidery",
                "description": "High-quality embroidery for uniforms, caps, corporate wear, and promotional items with vibrant thread colors.",
                "long_description": "Professional embroidery service using industrial-grade machines. We handle everything from single items to bulk corporate orders with consistent quality.",
                "icon": "fa-tshirt",
                "image_path": "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80",
                "image": "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80",
                "category": "embroidery",
                "base_price": Decimal("10000.00"),
                "features": json.dumps(["Industrial quality stitching", "Wide color selection", "Logo digitizing included", "Fast production time", "Sample approval process"]),
                "is_active": True,
                "is_featured": True
            },
            {
                "id": 3,
                "name": "GPS Vehicle Tracking",
                "slug": "vehicle-tracking",
                "description": "Real-time GPS tracking solutions for cars, motorcycles, and fleet management with mobile app access.",
                "long_description": "Advanced GPS tracking with real-time location updates, geofencing, speed alerts, and comprehensive reporting. Monitor your vehicles 24/7.",
                "icon": "fa-map-marker-alt",
                "image_path": "https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=1200&q=80",
                "image": "https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=1200&q=80",
                "category": "tracking",
                "base_price": Decimal("50000.00"),
                "features": json.dumps(["Real-time tracking", "Geofence alerts", "Speed monitoring", "Travel history", "Mobile app access"]),
                "is_active": True,
                "is_featured": True
            },
            {
                "id": 4,
                "name": "Professional Calligraphy",
                "slug": "calligraphy-services",
                "description": "Elegant handcrafted calligraphy for wedding invitations, certificates, and decorative art pieces.",
                "long_description": "Our skilled calligraphers create beautiful hand-lettered pieces using traditional and modern techniques. Each piece is a unique work of art.",
                "icon": "fa-paint-brush",
                "image_path": "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=1200&q=80",
                "image": "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=1200&q=80",
                "category": "calligraphy",
                "base_price": Decimal("8000.00"),
                "features": json.dumps(["Hand-crafted designs", "Multiple script styles", "Custom ink colors", "Digital proofs provided", "Premium paper options"]),
                "is_active": True,
                "is_featured": False
            },
            {
                "id": 5,
                "name": "Corporate Branding Package",
                "slug": "corporate-branding",
                "description": "Complete branding solutions including logo design, business cards, letterheads, and brand guidelines.",
                "long_description": "Comprehensive branding package that creates a cohesive visual identity for your business. Includes multiple design concepts and revisions.",
                "icon": "fa-palette",
                "image_path": "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80",
                "image": "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80",
                "category": "branding",
                "base_price": Decimal("25000.00"),
                "features": json.dumps(["Logo design (3 concepts)", "Business card design", "Letterhead design", "Brand guidelines document", "Social media kit", "3 revision rounds"]),
                "is_active": True,
                "is_featured": True
            },
            {
                "id": 6,
                "name": "Custom T-Shirt Printing",
                "slug": "tshirt-printing",
                "description": "High-quality DTG and screen printing for custom t-shirts with vibrant, long-lasting prints.",
                "long_description": "Professional t-shirt printing using both Direct-to-Garment and traditional screen printing methods. Eco-friendly inks and premium garments.",
                "icon": "fa-print",
                "image_path": "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1200&q=80",
                "image": "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1200&q=80",
                "category": "printing",
                "base_price": Decimal("12000.00"),
                "features": json.dumps(["DTG & Screen printing", "Premium quality shirts", "Eco-friendly inks", "Bulk order pricing", "Multiple color options"]),
                "is_active": True,
                "is_featured": True
            }
        ]
        for s_data in services_data:
            svc = Service(**s_data)
            db.add(svc)
        await db.flush()

        # 3. Seed Demo Order in transit with live rider
        order1 = Order(
            id=1,
            user_id=customer_user.id,
            service_id=1,
            order_number="EF-20260513-C2A193",
            status="in_transit",
            customization_details=json.dumps({"details": "Laser engrave 'Orlins Tech' on gold-plated plaque"}),
            quantity=2,
            unit_price=Decimal("15000.00"),
            total_amount=Decimal("30000.00"),
            delivery_method="door_delivery",
            delivery_address="Kampala Road, Plot 14",
            delivery_notes="Call before arrival"
        )
        db.add(order1)
        await db.flush()

        history1 = OrderStatusHistory(order_id=order1.id, status="pending", notes="Order placed successfully", created_by=customer_user.id)
        history2 = OrderStatusHistory(order_id=order1.id, status="in_transit", notes="Rider on the way", created_by=rider_user.id)
        db.add_all([history1, history2])

        delivery1 = Delivery(
            id=1,
            order_id=order1.id,
            delivery_person_id=rider_user.id,
            status="in_transit",
            delivery_address="Kampala Road, Plot 14",
            delivery_notes="Call before arrival"
        )
        db.add(delivery1)
        await db.flush()

        # Rider location in Kampala coordinates (0.3476, 32.5825)
        rider_loc = RiderLocation(
            delivery_id=delivery1.id,
            rider_id=rider_user.id,
            latitude=Decimal("0.34760000"),
            longitude=Decimal("32.58250000")
        )
        db.add(rider_loc)

        payment1 = Payment(
            order_id=order1.id,
            payment_method="pesapal",
            amount=Decimal("30000.00"),
            transaction_id="PESA-DEMO-1001",
            status="completed",
            paid_at=datetime.now(timezone.utc)
        )
        db.add(payment1)

        # 4. Seed Reviews & Contact messages
        review1 = Review(
            user_id=customer_user.id,
            order_id=order1.id,
            rating=5,
            comment="Remarkable laser precision and swift delivery across Kampala! Highly recommended.",
            is_approved=True
        )
        msg1 = ContactMessage(
            name="Sarah Nansubuga",
            email="sarah.n@example.com",
            subject="Bulk Corporate T-Shirt Order",
            message="Hello, we need 150 branded shirts for our annual tech summit next month. Please provide a quote.",
            is_read=False
        )
        db.add_all([review1, msg1])

        await db.commit()
        print("[Seed] Successfully seeded initial database records!")

if __name__ == "__main__":
    asyncio.run(seed_data())
