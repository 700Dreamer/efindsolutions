from datetime import datetime, timezone
from typing import Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Request, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.security import get_current_user
from app.core.pesapal import pesapal_client
from app.core.mtn_momo import mtn_momo_client
from app.models.user import User
from app.models.order import Order, OrderStatusHistory
from app.models.payment import Payment
from app.schemas.payment import (
    PaymentInitiateRequest,
    PaymentInitiateResponse,
    PaymentVerifyRequest,
    PaymentOut,
    MomoInitiateRequest,
    MomoInitiateResponse,
    MomoStatusResponse,
)

router = APIRouter()

@router.post("/initiate", response_model=PaymentInitiateResponse)
async def initiate_payment(
    req: PaymentInitiateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    query = (
        select(Order)
        .options(selectinload(Order.service), selectinload(Order.user))
        .where(Order.id == req.order_id)
    )
    res = await db.execute(query)
    order = res.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    if order.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    # Check or create payment record
    pay_res = await db.execute(select(Payment).where(Payment.order_id == order.id))
    payment = pay_res.scalar_one_or_none()
    if not payment:
        payment = Payment(
            order_id=order.id,
            payment_method=req.payment_method,
            amount=order.total_amount,
            status="pending"
        )
        db.add(payment)
        await db.flush()
    else:
        payment.payment_method = req.payment_method

    if req.payment_method == "cash_on_delivery":
        payment.status = "pending"
        await db.commit()
        await db.refresh(payment)
        return PaymentInitiateResponse(
            payment_id=payment.id,
            order_id=order.id,
            order_number=order.order_number,
            amount=order.total_amount,
            status="pending",
            redirect_url=f"/track?order={order.order_number}"
        )

    # Direct MTN MoMo Collections
    if req.payment_method == "mtn_momo":
        phone = req.phone_number or current_user.phone or "256770000000"
        momo_res = await mtn_momo_client.request_to_pay(
            amount=float(order.total_amount),
            phone_number=phone,
            external_id=order.order_number,
            payer_message=f"Order {order.order_number}",
            payee_note="E-Find Services"
        )
        ref_id = momo_res.get("reference_id")
        payment.transaction_id = ref_id
        payment.payment_details = f"Phone: {phone}"
        payment.status = "pending"
        await db.commit()
        await db.refresh(payment)

        return PaymentInitiateResponse(
            payment_id=payment.id,
            order_id=order.id,
            order_number=order.order_number,
            amount=order.total_amount,
            reference_id=ref_id,
            transaction_id=ref_id,
            status="pending",
            message=momo_res.get("message", "USSD PIN prompt sent to your phone."),
            is_simulation=momo_res.get("is_simulation", False)
        )

    # Submit to Pesapal v3
    description = f"Payment for Order #{order.order_number} ({order.service.name})"
    pesapal_res = await pesapal_client.submit_order(
        order_number=order.order_number,
        amount=float(order.total_amount),
        description=description,
        customer_email=current_user.email,
        customer_phone=current_user.phone or "256700000000",
        customer_name=current_user.name
    )

    order_tracking_id = pesapal_res.get("order_tracking_id")
    redirect_url = pesapal_res.get("redirect_url")
    is_simulation = pesapal_res.get("is_simulation", False)

    payment.transaction_id = order_tracking_id
    await db.commit()
    await db.refresh(payment)

    return PaymentInitiateResponse(
        payment_id=payment.id,
        order_id=order.id,
        order_number=order.order_number,
        amount=order.total_amount,
        redirect_url=redirect_url,
        transaction_id=order_tracking_id,
        status="pending",
        is_simulation=is_simulation
    )

# =========================================================================
# DIRECT MTN MOMO COLLECTIONS ENDPOINTS
# =========================================================================

@router.post("/momo/request-to-pay", response_model=MomoInitiateResponse)
async def momo_request_to_pay(
    req: MomoInitiateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Direct endpoint to dispatch an MTN Mobile Money USSD push payment prompt.
    """
    query = (
        select(Order)
        .options(selectinload(Order.service), selectinload(Order.user))
        .where(Order.id == req.order_id)
    )
    res = await db.execute(query)
    order = res.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    if order.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    # Check or create payment record
    pay_res = await db.execute(select(Payment).where(Payment.order_id == order.id))
    payment = pay_res.scalar_one_or_none()
    if not payment:
        payment = Payment(
            order_id=order.id,
            payment_method="mtn_momo",
            amount=order.total_amount,
            status="pending"
        )
        db.add(payment)
        await db.flush()
    else:
        payment.payment_method = "mtn_momo"

    momo_res = await mtn_momo_client.request_to_pay(
        amount=float(order.total_amount),
        phone_number=req.phone_number,
        external_id=order.order_number,
        payer_message=req.payer_message or f"Order {order.order_number}",
        payee_note="E-Find Mobile Money"
    )


    if momo_res.get("status") == "FAILED":
        payment.status = "failed"
        await db.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=momo_res.get("message", "Failed to dispatch MTN Mobile Money prompt.")
        )

    ref_id = momo_res.get("reference_id")
    payment.transaction_id = ref_id
    payment.payment_details = f"Phone: {req.phone_number}"
    payment.status = "pending"
    await db.commit()
    await db.refresh(payment)


    return MomoInitiateResponse(
        payment_id=payment.id,
        order_id=order.id,
        order_number=order.order_number,
        reference_id=ref_id,
        phone_number=momo_res.get("phone_number", req.phone_number),
        amount=order.total_amount,
        currency="UGX",
        status=momo_res.get("status", "PENDING"),
        message=momo_res.get("message", "USSD PIN prompt sent to your phone."),
        is_simulation=momo_res.get("is_simulation", False)
    )

@router.get("/momo/status/{reference_id}", response_model=MomoStatusResponse)
async def get_momo_status(
    reference_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Checks the real-time status of an MTN MoMo request-to-pay transaction.
    Automatically confirms and marks order as paid if MTN MoMo returns SUCCESSFUL.
    """
    query = (
        select(Payment)
        .options(selectinload(Payment.order))
        .where(Payment.transaction_id == reference_id)
    )
    res = await db.execute(query)
    payment = res.scalar_one_or_none()

    momo_status_data = await mtn_momo_client.get_transaction_status(reference_id)
    raw_status = momo_status_data.get("status", "PENDING").upper()
    financial_txn_id = momo_status_data.get("financialTransactionId")
    is_simulation = momo_status_data.get("is_simulation", False)

    if payment:
        if raw_status == "SUCCESSFUL":
            if payment.status != "completed":
                payment.status = "completed"
                payment.paid_at = datetime.now(timezone.utc)
                if financial_txn_id:
                    payment.payment_details = f"FinancialTxnID: {financial_txn_id}"

                # Update linked order
                order = payment.order
                if order and order.status == "pending":
                    order.status = "confirmed"
                    history = OrderStatusHistory(
                        order_id=order.id,
                        status="confirmed",
                        notes=f"MTN Mobile Money Payment Confirmed (Ref: {reference_id}, Txn: {financial_txn_id or 'N/A'})"
                    )
                    db.add(history)

                await db.commit()
                await db.refresh(payment)
        elif raw_status == "FAILED":
            if payment.status != "failed":
                payment.status = "failed"
                await db.commit()

    return MomoStatusResponse(
        reference_id=reference_id,
        status=raw_status,
        financial_transaction_id=financial_txn_id,
        amount=payment.amount if payment else None,
        currency="UGX",
        is_simulation=is_simulation,
        message=f"MTN MoMo transaction is currently {raw_status}."
    )

@router.post("/momo/callback")
async def momo_callback_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """
    MTN MoMo async callback webhook endpoint.
    """
    try:
        body = await request.json()
    except Exception:
        body = {}

    ref_id = body.get("referenceId") or request.headers.get("X-Reference-Id")
    status_val = (body.get("status") or "").upper()
    financial_txn_id = body.get("financialTransactionId")

    print(f"\n[MTN MoMo Webhook] 📥 Received callback notification: Ref: {ref_id}, Status: {status_val}")

    if ref_id:
        query = (
            select(Payment)
            .options(selectinload(Payment.order))
            .where(Payment.transaction_id == ref_id)
        )
        res = await db.execute(query)
        payment = res.scalar_one_or_none()

        if payment and status_val == "SUCCESSFUL":
            payment.status = "completed"
            payment.paid_at = datetime.now(timezone.utc)
            if financial_txn_id:
                payment.payment_details = f"FinancialTxnID: {financial_txn_id}"

            order = payment.order
            if order and order.status == "pending":
                order.status = "confirmed"
                history = OrderStatusHistory(
                    order_id=order.id,
                    status="confirmed",
                    notes=f"MTN MoMo Callback Received (Txn: {financial_txn_id})"
                )
                db.add(history)

            await db.commit()

    return {"status": "SUCCESS", "message": "Callback processed"}

# =========================================================================
# PESAPAL VERIFICATION & CALLBACK
# =========================================================================

@router.post("/verify", response_model=PaymentOut)
async def verify_payment(
    req: PaymentVerifyRequest,
    db: AsyncSession = Depends(get_db)
):
    # Fetch payment by transaction ID or order number
    query = (
        select(Payment)
        .join(Order, Payment.order_id == Order.id)
        .where(Order.order_number == req.order_number)
    )
    res = await db.execute(query)
    payment = res.scalar_one_or_none()
    if not payment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payment record not found")

    status_data = await pesapal_client.get_transaction_status(req.order_tracking_id)
    payment_status_desc = status_data.get("payment_status_description", "").lower()

    if "completed" in payment_status_desc or status_data.get("status_code") == 1:
        payment.status = "completed"
        payment.paid_at = datetime.now(timezone.utc)
        payment.transaction_id = req.order_tracking_id

        # Update order status
        order_res = await db.execute(select(Order).where(Order.id == payment.order_id))
        order = order_res.scalar_one()
        if order.status == "pending":
            order.status = "confirmed"
            history = OrderStatusHistory(
                order_id=order.id,
                status="confirmed",
                notes=f"Payment received via Pesapal ({req.order_tracking_id})"
            )
            db.add(history)
    else:
        payment.status = "failed"

    await db.commit()
    await db.refresh(payment)
    return PaymentOut.model_validate(payment)

@router.get("/ipn")
async def pesapal_ipn_callback(
    OrderTrackingId: Optional[str] = None,
    OrderMerchantReference: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """
    Pesapal IPN webhook callback
    """
    if not OrderTrackingId or not OrderMerchantReference:
        return {"status": "200", "message": "Missing parameters"}

    query = (
        select(Payment)
        .join(Order, Payment.order_id == Order.id)
        .where(Order.order_number == OrderMerchantReference)
    )
    res = await db.execute(query)
    payment = res.scalar_one_or_none()
    if payment:
        status_data = await pesapal_client.get_transaction_status(OrderTrackingId)
        if status_data.get("status_code") == 1 or "completed" in status_data.get("payment_status_description", "").lower():
            payment.status = "completed"
            payment.paid_at = datetime.now(timezone.utc)
            payment.transaction_id = OrderTrackingId
            await db.commit()

    return {
        "orderNotificationType": "IPNCHANGE",
        "orderTrackingId": OrderTrackingId,
        "orderMerchantReference": OrderMerchantReference,
        "status": "200"
    }

