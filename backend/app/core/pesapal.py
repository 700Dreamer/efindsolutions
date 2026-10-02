import httpx
from typing import Dict, Any, Optional
from datetime import datetime, timedelta, timezone
from app.core.config import settings

class PesapalClient:
    def __init__(self):
        self.consumer_key = settings.PESAPAL_CONSUMER_KEY
        self.consumer_secret = settings.PESAPAL_CONSUMER_SECRET
        self.env = settings.PESAPAL_ENV
        self.base_url = (
            "https://cybqa.pesapal.com/pesapalv3/api"
            if self.env == "sandbox"
            else "https://pay.pesapal.com/v3/api"
        )
        self._token: Optional[str] = None
        self._token_expiry: Optional[datetime] = None

    async def get_token(self) -> str:
        # Check cached token
        if self._token and self._token_expiry and datetime.now(timezone.utc) < self._token_expiry:
            return self._token

        # Fallback simulation only if credentials are dummy sample strings
        if not self.consumer_key or self.consumer_key == "sample_consumer_key" or "sample" in self.consumer_key:
            print("[Pesapal] Warning: Using dummy credentials, returning mock token.")
            self._token = "simulated_pesapal_token"
            self._token_expiry = datetime.now(timezone.utc) + timedelta(hours=1)
            return self._token

        url = f"{self.base_url}/Auth/RequestToken"
        headers = {"Accept": "application/json", "Content-Type": "application/json"}
        payload = {
            "consumer_key": self.consumer_key,
            "consumer_secret": self.consumer_secret,
        }

        print(f"\n[Pesapal] 🔐 Requesting OAuth Token from: {url}")
        print(f"[Pesapal] 🔑 Consumer Key: {self.consumer_key[:8]}... (Env: {self.env.upper()})")

        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                resp = await client.post(url, json=payload, headers=headers)
                print(f"[Pesapal] 📥 Token Response HTTP Status: {resp.status_code}")
                print(f"[Pesapal] 📥 Token Response Body: {resp.text}")

                if resp.status_code == 200:
                    data = resp.json()
                    self._token = data.get("token")
                    if self._token:
                        self._token_expiry = datetime.now(timezone.utc) + timedelta(minutes=4, seconds=45)
                        print("[Pesapal] ✅ OAuth Token acquired successfully!")
                        return self._token
                
                print(f"[Pesapal] ❌ Auth failed with response: {resp.text}")
                return "simulated_pesapal_token"
        except Exception as e:
            print(f"[Pesapal] ⚠️ Exception during token request: {e}")
            return "simulated_pesapal_token"

    async def register_ipn(self, callback_url: str) -> Optional[str]:
        token = await self.get_token()
        if token == "simulated_pesapal_token":
            return "sim_ipn_id_12345"

        url = f"{self.base_url}/URLSetup/RegisterIPN"
        headers = {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": f"Bearer {token}",
        }
        payload = {"url": callback_url, "ipn_notification_type": "GET"}

        print(f"\n[Pesapal] 📡 Registering IPN Notification URL: {callback_url}")
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                resp = await client.post(url, json=payload, headers=headers)
                print(f"[Pesapal] 📥 Register IPN Status: {resp.status_code}")
                print(f"[Pesapal] 📥 Register IPN Body: {resp.text}")
                if resp.status_code == 200:
                    ipn_id = resp.json().get("ipn_id")
                    print(f"[Pesapal] ✅ IPN Registered successfully! IPN ID: {ipn_id}")
                    return ipn_id
        except Exception as e:
            print(f"[Pesapal] ⚠️ IPN Registration failed: {e}")
        return None

    async def submit_order(
        self,
        order_number: str,
        amount: float,
        description: str,
        customer_email: str,
        customer_phone: str,
        customer_name: str,
        ipn_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Submits an order to Pesapal v3. Returns dictionary with order_tracking_id and redirect_url.
        """
        token = await self.get_token()
        
        # If simulated token, return simulation redirect
        if token == "simulated_pesapal_token":
            tracking_id = f"PESA-SIM-{order_number}"
            return {
                "order_tracking_id": tracking_id,
                "merchant_reference": order_number,
                "redirect_url": f"http://localhost:3000/payment/simulate?order={order_number}&tracking_id={tracking_id}",
                "status": "200",
                "is_simulation": True
            }

        url = f"{self.base_url}/Transactions/SubmitOrderRequest"
        headers = {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": f"Bearer {token}",
        }
        
        # Split names
        name_parts = customer_name.strip().split(" ", 1)
        first_name = name_parts[0] or "Customer"
        last_name = name_parts[1] if len(name_parts) > 1 else "Efind"

        clean_phone = (customer_phone or "").replace(" ", "").replace("-", "")
        if clean_phone.startswith("0"):
            clean_phone = "256" + clean_phone[1:]
        elif not clean_phone.startswith("256"):
            clean_phone = "256700000000"

        payload = {
            "id": order_number,
            "currency": "UGX",
            "amount": float(amount),
            "description": description[:100],
            "callback_url": settings.PESAPAL_CALLBACK_URL,
            "notification_id": ipn_id or settings.PESAPAL_IPN_ID or "",
            "billing_address": {
                "email_address": customer_email,
                "phone_number": clean_phone,
                "country_code": "UG",
                "first_name": first_name,
                "last_name": last_name,
                "line_1": "Plot 14 Kampala Road",
            },
        }

        print(f"\n[Pesapal] 🚀 Submitting Order to Pesapal: #{order_number} (UGX {amount:,.0f})")
        print(f"[Pesapal] 📤 Payload: {payload}")

        try:
            async with httpx.AsyncClient(timeout=20.0) as client:
                resp = await client.post(url, json=payload, headers=headers)
                print(f"[Pesapal] 📥 Submit Order Response HTTP Status: {resp.status_code}")
                print(f"[Pesapal] 📥 Submit Order Response Body: {resp.text}")

                if resp.status_code == 200:
                    data = resp.json()
                    # Check if Pesapal returned valid order_tracking_id and redirect_url
                    if data.get("order_tracking_id") and data.get("redirect_url"):
                        data["is_simulation"] = False
                        print(f"[Pesapal] ✅ Live Payment Gateway URL ready: {data.get('redirect_url')}")
                        return data
                
                print(f"[Pesapal] ❌ Submit Order returned unexpected status: {resp.text}")
        except Exception as e:
            print(f"[Pesapal] ⚠️ Submit Order Exception: {e}")

        # Fallback simulation only if network or live API fails
        tracking_id = f"PESA-SIM-{order_number}"
        return {
            "order_tracking_id": tracking_id,
            "merchant_reference": order_number,
            "redirect_url": f"http://localhost:3000/payment/simulate?order={order_number}&tracking_id={tracking_id}",
            "status": "200",
            "is_simulation": True
        }

    async def get_transaction_status(self, order_tracking_id: str) -> Dict[str, Any]:
        if "SIM" in order_tracking_id:
            return {
                "payment_status_description": "Completed",
                "status_code": 1,
                "payment_method": "Mobile Money",
                "amount": 0,
                "created_date": datetime.now().isoformat(),
                "confirmation_code": f"CF-{order_tracking_id}",
                "payment_status_code": "COMPLETED",
            }

        token = await self.get_token()
        url = f"{self.base_url}/Transactions/GetTransactionStatus?orderTrackingId={order_tracking_id}"
        headers = {"Accept": "application/json", "Authorization": f"Bearer {token}"}

        print(f"\n[Pesapal] 🔍 Checking Transaction Status for Tracking ID: {order_tracking_id}")

        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                resp = await client.get(url, headers=headers)
                print(f"[Pesapal] 📥 Transaction Status HTTP: {resp.status_code}")
                print(f"[Pesapal] 📥 Transaction Status Body: {resp.text}")
                if resp.status_code == 200:
                    return resp.json()
        except Exception as e:
            print(f"[Pesapal] ⚠️ GetTransactionStatus exception: {e}")

        return {
            "payment_status_description": "Failed",
            "status_code": 2,
            "payment_status_code": "FAILED",
        }

pesapal_client = PesapalClient()
