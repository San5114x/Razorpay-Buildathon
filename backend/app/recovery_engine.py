"""
RecoveryPilot AI — core recovery engine.

This is the "brain" the buildathon brief asks for: detect -> diagnose ->
score -> decide -> execute -> track. Deterministic and rule-based so it's
fast, explainable, and demo-safe (no API dependency for the core decision).
Gemini is layered on top only for human-readable narrative explanations.
"""

import random
from datetime import datetime, timedelta

# -----------------------------
# Failure reasons + base recovery probability (learned heuristics,
# stand-in for what would normally come from historical data)
# -----------------------------
FAILURE_PROFILES = {
    "upi_timeout": {
        "label": "UPI Timeout",
        "base_probability": 0.85,
        "action": "instant_retry_link",
        "action_label": "Send instant retry link",
        "delay_hours": 0,
    },
    "bank_server_issue": {
        "label": "Bank Server Issue",
        "base_probability": 0.80,
        "action": "instant_retry_link",
        "action_label": "Send instant retry link",
        "delay_hours": 0,
    },
    "insufficient_balance": {
        "label": "Insufficient Balance",
        "base_probability": 0.55,
        "action": "delayed_retry",
        "action_label": "Retry after salary/payday window",
        "delay_hours": 48,
    },
    "expired_card": {
        "label": "Expired Card",
        "base_probability": 0.30,
        "action": "update_payment_method",
        "action_label": "Prompt to update payment method",
        "delay_hours": 12,
    },
    "checkout_abandonment": {
        "label": "Checkout Abandonment",
        "base_probability": 0.40,
        "action": "whatsapp_reminder",
        "action_label": "Send WhatsApp reminder",
        "delay_hours": 1,
    },
    "subscription_failure": {
        "label": "Failed Subscription Renewal",
        "base_probability": 0.50,
        "action": "email_and_retry",
        "action_label": "Email notice + auto-retry",
        "delay_hours": 24,
    },
    "overdue_receivable": {
        "label": "Overdue B2B Receivable",
        "base_probability": 0.45,
        "action": "escalating_chase",
        "action_label": "Escalating payment-reminder sequence",
        "delay_hours": 72,
    },
}

PRIORITY_ORDER = ["High", "Medium", "Low"]


def diagnose_and_score(amount: float, failure_reason: str) -> dict:
    """Detect + diagnose + score a failed payment. Returns the recovery plan."""
    profile = FAILURE_PROFILES[failure_reason]

    # Amount-based adjustment: very large amounts are slightly harder to
    # recover automatically (more likely to need manual/escalated handling)
    amount_penalty = 0.1 if amount > 20000 else 0.0
    probability = max(0.05, min(0.97, profile["base_probability"] - amount_penalty))

    if probability >= 0.7:
        priority = "High"
    elif probability >= 0.4:
        priority = "Medium"
    else:
        priority = "Low"

    return {
        "failure_reason": failure_reason,
        "failure_label": profile["label"],
        "recovery_probability": round(probability * 100),
        "priority": priority,
        "recommended_action": profile["action"],
        "action_label": profile["action_label"],
        "eta": (datetime.now() + timedelta(hours=profile["delay_hours"])).strftime(
            "%Y-%m-%d %H:%M"
        ),
    }


def execute_recovery(recovery_probability: int) -> bool:
    """
    Simulates executing the recovery action (sending the WhatsApp/SMS/email/
    retry link) and whether the customer completed payment. Weighted by the
    recovery probability so higher-confidence cases succeed more often —
    same principle a real system would use, just simulated for the demo.
    """
    return random.random() < (recovery_probability / 100)
