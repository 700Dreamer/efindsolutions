import base64
import uuid
import httpx
from typing import Dict, Any, Optional
from datetime import datetime, timedelta, timezone
from app.core.config import settings

class MTNMoMoClient:
    def __init__(self):
        self.subscription_key = settings.MTN_MOMO_SUBSCRIPTION_KEY
        self.api_user_id = settings.MTN_MOMO_API_USER_ID
        self.api_key = settings.MTN_MOMO_API_KEY
        self.env = settings.MTN_MOMO_ENV.lower()  # "sandbox" or "live"
        self.target_env = settings.MTN_MOMO_TARGET_ENV  # "sandbox" or "mtnuganda"
        self.currency = settings.MTN_MOMO_CURRENCY or "UGX"
        self.callback_url = settings.MTN_MOMO_CALLBACK_URL

        self.base_url = (
            "https://sandbox.momodeveloper.mtn.com"
            if self.env == "sandbox"
            else "https://proxy.momoapi.mtn.com"
        )

        self._token: Optional[str] = None
        self._token_expiry: Optional[datetime] = None

    def _format_phone_number(self, phone: str) -> str:
        """
        Validates and formats phone number to standard Ugandan MSISDN (e.g., 256770000000).
        Validates 10-digit Ugandan formats (077..., 078..., 076..., 079...).
        """
        clean = (phone or "").replace(" ", "").replace("-", "").replace("+", "").strip()
        if clean.startswith("0"):
            clean = "256" + clean[1:]
        elif not clean.startswith("256"):
            clean = "256" + clean

        # Validate length and format (256 + 9 digits = 12 digits)
        if len(clean) != 12 or not clean.isdigit() or not clean.startswith("2567"):
            # If not a standard Ugandan mobile number (2567...)
            raise ValueError(f"Invalid phone number '{phone}'. Please provide a valid Ugandan mobile number (e.g. 0770 123456).")

        return clean


    async def provision_sandbox_user_and_key(self) -> Optional[Dict[str, str]]:
        """
        Helper for Sandbox environments: automatically provisions an API User and generates an API Key
        using the Subscription Key.
        """
        if not self.subscription_key or "sample" in self.subscription_key:
            return None

        new_user_id = str(uuid.uuid4())
        create_user_url = f"{self.base_url}/v1_0/apiuser"
        headers = {
            "X-Reference-Id": new_user_id,
            "Ocp-Apim-Subscription-Key": self.subscription_key,
            "Content-Type": "application/json",
        }
        payload = {"providerCallbackHost": "localhost"}

        print(f"\n[MTN MoMo] 🛠️ Auto-provisioning Sandbox API User: {new_user_id}")
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                # 1. Create API User
                res_user = await client.post(create_user_url, json=payload, headers=headers)
                print(f"[MTN MoMo] 📥 Create API User HTTP {res_user.status_code}")
                if res_user.status_code not in (201, 200):
                    print(f"[MTN MoMo] ❌ Failed to create sandbox user: {res_user.text}")
                    return None

                # 2. Create API Key for this user
                key_url = f"{self.base_url}/v1_0/apiuser/{new_user_id}/apikey"
                res_key = await client.post(
                    key_url,
                    headers={"Ocp-Apim-Subscription-Key": self.subscription_key},
                )
                print(f"[MTN MoMo] 📥 Create API Key HTTP {res_key.status_code}")
                if res_key.status_code in (200, 201):
                    key_data = res_key.json()
                    api_key = key_data.get("apiKey")
                    print(f"[MTN MoMo] ✅ Sandbox User & API Key provisioned successfully!")
                    self.api_user_id = new_user_id
                    self.api_key = api_key
                    return {"api_user_id": new_user_id, "api_key": api_key}
        except Exception as e:
            print(f"[MTN MoMo] ⚠️ Sandbox provisioning exception: {e}")

        return None

    async def get_token(self) -> str:
        """
        Retrieves OAuth Bearer Token using Basic Auth base64(api_user_id:api_key).
        Caches the token and automatically refreshes prior to expiration.
        """
        if self._token and self._token_expiry and datetime.now(timezone.utc) < self._token_expiry:
            return self._token

        # If missing API User or Key in sandbox, attempt auto-provisioning
        if self.env == "sandbox" and self.subscription_key and (not self.api_user_id or not self.api_key):
            provisioned = await self.provision_sandbox_user_and_key()
            if provisioned:
                self.api_user_id = provisioned["api_user_id"]
                self.api_key = provisioned["api_key"]

        # Simulation fallback if no credentials supplied
        if not self.subscription_key or not self.api_user_id or not self.api_key:
            print("[MTN MoMo] Warning: Missing credentials. Operating in simulation mode.")
            self._token = "simulated_mtn_momo_token"
            self._token_expiry = datetime.now(timezone.utc) + timedelta(hours=1)
            return self._token

        auth_str = f"{self.api_user_id}:{self.api_key}"
        encoded_auth = base64.b64encode(auth_str.encode()).decode("utf-8")

        url = f"{self.base_url}/collection/token/"
        headers = {
            "Authorization": f"Basic {encoded_auth}",
            "Ocp-Apim-Subscription-Key": self.subscription_key,
        }

        print(f"\n[MTN MoMo] 🔐 Requesting OAuth Token from: {url}")
        print(f"[MTN MoMo] 🔑 API User: {self.api_user_id} | Env: {self.env.upper()}")

        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                resp = await client.post(url, headers=headers)
                print(f"[MTN MoMo] 📥 Token Response HTTP {resp.status_code}")
                if resp.status_code == 200:
                    data = resp.json()
                    self._token = data.get("access_token")
                    expires_in = int(data.get("expires_in", 3600))
                    # Set expiry buffer
                    self._token_expiry = datetime.now(timezone.utc) + timedelta(seconds=max(60, expires_in - 120))
                    print("[MTN MoMo] ✅ OAuth Bearer Token acquired successfully!")
                    return self._token

                print(f"[MTN MoMo] ❌ Auth failed with status {resp.status_code}: {resp.text}")
        except Exception as e:
            print(f"[MTN MoMo] ⚠️ Exception during token request: {e}")

        self._token = "simulated_mtn_momo_token"
        return self._token

    def _clean_text(self, text: str, max_len: int = 30) -> str:
        """
        Sanitizes text fields to avoid triggering MTN WAF (Web Application Firewall) rules.
        Removes special characters like #, <, >, ;, ', ", etc.
        """
        import re
        clean = re.sub(r"[^a-zA-Z0-9\s\-_]", "", text or "")
        return clean.strip()[:max_len]

    async def request_to_pay(
        self,
        amount: float,
        phone_number: str,
        external_id: str,
        payer_message: str = "Payment for Order",
        payee_note: str = "E-Find Services",
        reference_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Triggers a Request-to-Pay (USSD PIN Push Prompt) to the customer's MTN Mobile Money phone.
        """
        ref_id = reference_id or str(uuid.uuid4())
        try:
            msisdn = self._format_phone_number(phone_number)
        except ValueError as e:
            return {
                "reference_id": ref_id,
                "status": "FAILED",
                "error": "INVALID_PHONE",
                "is_simulation": False,
                "message": str(e),
            }

        token = await self.get_token()


        if token == "simulated_mtn_momo_token":
            print(f"[MTN MoMo SIMULATION] 📱 USSD Push Prompt sent to {msisdn} for UGX {amount:,.0f} (Ref: {ref_id})")
            return {
                "reference_id": ref_id,
                "status": "PENDING",
                "phone_number": msisdn,
                "amount": amount,
                "currency": self.currency,
                "is_simulation": True,
                "message": f"USSD PIN prompt sent to +{msisdn}. Please authorize on your phone.",
            }

        url = f"{self.base_url}/collection/v1_0/requesttopay"
        headers = {
            "Authorization": f"Bearer {token}",
            "X-Reference-Id": ref_id,
            "X-Target-Environment": self.target_env,
            "Ocp-Apim-Subscription-Key": self.subscription_key,
            "Content-Type": "application/json",
        }
        if self.callback_url:
            headers["X-Callback-Url"] = self.callback_url

        # MTN Sandbox requires EUR currency; Live accepts UGX/local currency
        api_currency = "EUR" if self.env == "sandbox" and self.currency == "UGX" else self.currency

        clean_payer_msg = self._clean_text(payer_message, 30) or "Order Payment"
        clean_payee_note = self._clean_text(payee_note, 30) or "EFIND"
        clean_ext_id = self._clean_text(external_id, 30)

        payload = {
            "amount": str(int(amount) if int(amount) == amount else f"{amount:.2f}"),
            "currency": api_currency,
            "externalId": clean_ext_id,
            "payer": {
                "partyIdType": "MSISDN",
                "partyId": msisdn,
            },
            "payerMessage": clean_payer_msg,
            "payeeNote": clean_payee_note,
        }

        print(f"\n[MTN MoMo] 🚀 Dispatching Request-to-Pay: Ref {ref_id} -> {msisdn} ({api_currency} {amount:,.0f}) [Env: {self.env.upper()}]")
        print(f"[MTN MoMo] 📤 Payload: {payload}")

        try:
            async with httpx.AsyncClient(timeout=20.0) as client:
                resp = await client.post(url, json=payload, headers=headers)
                print(f"[MTN MoMo] 📥 Request-to-Pay HTTP Status: {resp.status_code}")
                print(f"[MTN MoMo] 📥 Response Body: {resp.text}")

                # Check if WAF rejected with HTML page
                if "<html" in resp.text.lower() or "request rejected" in resp.text.lower():
                    print(f"[MTN MoMo] ❌ MTN WAF Rejected Request: {resp.text}")
                    return {
                        "reference_id": ref_id,
                        "status": "FAILED",
                        "error": "WAF_REJECTED",
                        "is_simulation": False,
                        "message": "MTN Gateway rejected payload format.",
                    }

                # MTN MoMo returns 202 Accepted on success
                if resp.status_code in (202, 201):
                    return {
                        "reference_id": ref_id,
                        "status": "PENDING",
                        "phone_number": msisdn,
                        "amount": amount,
                        "currency": self.currency,
                        "is_simulation": False,
                        "message": f"USSD PIN prompt dispatched for +{msisdn}." if self.env == "live" else f"[Sandbox] Prompt simulated for +{msisdn}.",
                    }

                print(f"[MTN MoMo] ❌ Request-to-Pay returned status {resp.status_code}: {resp.text}")
                return {
                    "reference_id": ref_id,
                    "status": "FAILED",
                    "error": resp.text,
                    "is_simulation": False,
                    "message": f"Failed to dispatch USSD prompt: {resp.status_code}",
                }
        except Exception as e:
            print(f"[MTN MoMo] ⚠️ Request-to-Pay exception: {e}")
            return {
                "reference_id": ref_id,
                "status": "FAILED",
                "error": str(e),
                "is_simulation": False,
                "message": f"Network error sending payment request: {str(e)}",
            }


    async def get_transaction_status(self, reference_id: str) -> Dict[str, Any]:
        """
        Polls the status of a specific Request-to-Pay transaction from MTN MoMo API.
        Returns dictionary with status ('SUCCESSFUL', 'PENDING', 'FAILED'), financialTransactionId, etc.
        """
        token = await self.get_token()

        if token == "simulated_mtn_momo_token":
            return {
                "financialTransactionId": f"MTN-SIM-{reference_id[:8]}",
                "externalId": "SIMULATED",
                "amount": "0",
                "currency": self.currency,
                "status": "SUCCESSFUL",
                "is_simulation": True,
            }

        url = f"{self.base_url}/collection/v1_0/requesttopay/{reference_id}"
        headers = {
            "Authorization": f"Bearer {token}",
            "X-Target-Environment": self.target_env,
            "Ocp-Apim-Subscription-Key": self.subscription_key,
            "Accept": "application/json",
        }

        print(f"\n[MTN MoMo] 🔍 Polling Transaction Status for Ref: {reference_id}")
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                resp = await client.get(url, headers=headers)
                print(f"[MTN MoMo] 📥 Status Check HTTP {resp.status_code}: {resp.text}")
                if resp.status_code == 200:
                    data = resp.json()
                    data["is_simulation"] = False
                    return data
                elif resp.status_code == 404:
                    return {
                        "status": "FAILED",
                        "reason": "Transaction not found on MTN Gateway",
                        "is_simulation": False,
                    }
                elif resp.status_code in (400, 401, 403, 500):
                    return {
                        "status": "FAILED",
                        "reason": f"MTN Gateway error ({resp.status_code})",
                        "is_simulation": False,
                    }
        except Exception as e:
            print(f"[MTN MoMo] ⚠️ GetTransactionStatus exception: {e}")

        return {
            "status": "PENDING",
            "reason": "Status check in progress",
            "is_simulation": False,
        }

mtn_momo_client = MTNMoMoClient()


