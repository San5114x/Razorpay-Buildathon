import os
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import google.generativeai as genai

from . import database as db

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
gemini = genai.GenerativeModel("gemini-2.5-flash")

app = FastAPI(title="RecoveryPilot AI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

db.init_db()


class CopilotRequest(BaseModel):
    question: str


@app.get("/")
def root():
    return {"status": "RecoveryPilot AI backend running"}


@app.get("/transactions")
def transactions():
    """Simulates a new failed payment arriving, then returns the full feed."""
    db.add_new_failed_payment()
    return db.get_transactions()


@app.get("/stats")
def stats():
    return db.get_stats()


@app.post("/transactions/{tx_id}/recover")
def recover(tx_id: int):
    result = db.recover_transaction(tx_id)
    if result is None:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return result


@app.get("/transactions/{tx_id}/audit")
def audit(tx_id: int):
    return db.get_audit_log(tx_id)


@app.post("/transactions/{tx_id}/explain")
def explain(tx_id: int):
    """Gemini-generated plain-English explanation of the recovery decision."""
    tx = db.get_transaction(tx_id)
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")

    prompt = f"""
You are RecoveryPilot AI, explaining a payment recovery decision to a merchant.

Customer: {tx['customer']}
Amount: ₹{tx['amount']}
Failure reason: {tx['failure_label']}
Recovery probability: {tx['recovery_probability']}%
Recommended action: {tx['action_label']}
Status: {tx['status']}

Write a 2-sentence, plain-English explanation of why this action was chosen
and what happens next. Professional, concise, no jargon.
"""
    try:
        response = gemini.generate_content(prompt)
        return {"explanation": response.text.strip()}
    except Exception as e:
        return {"explanation": f"{tx['action_label']} was chosen based on a "
                                f"{tx['recovery_probability']}% recovery probability "
                                f"for {tx['failure_label'].lower()} cases. "
                                f"(AI narration unavailable: {e})"}


@app.get("/insights")
def insights():
    """Failure-reason breakdown plus a Gemini-generated narrative summary."""
    breakdown = db.get_reason_breakdown()
    stats_data = db.get_stats()

    rows_text = "\n".join(
        f"- {r['reason']}: {r['count']} cases, ₹{r['total_amount']} at risk, "
        f"₹{r['recovered_amount']} recovered, {r['avg_probability']}% avg recovery chance"
        for r in breakdown
    )

    prompt = f"""
You are RecoveryPilot AI generating merchant insights.

Overall: ₹{stats_data['total_at_risk']} at risk, ₹{stats_data['total_recovered']} recovered so far.

Breakdown by failure reason:
{rows_text}

Write 2-3 short sentences of plain-English insight a merchant would actually
act on (e.g. which failure reason to prioritize and why). No headers, no bullet points.
"""
    try:
        response = gemini.generate_content(prompt)
        narrative = response.text.strip()
    except Exception as e:
        narrative = f"AI narrative unavailable ({e}). See the breakdown table below."

    return {"breakdown": breakdown, "narrative": narrative}


@app.post("/copilot")
def copilot(req: CopilotRequest):
    """Merchant-facing Q&A over the current recovery batch."""
    stats_data = db.get_stats()
    recent = db.get_transactions()[:10]

    tx_text = "\n".join(
        f"- {t['customer']} | ₹{t['amount']} | {t['failure_label']} | "
        f"{t['recovery_probability']}% | {t['status']}"
        for t in recent
    )

    prompt = f"""
You are RecoveryPilot AI's Merchant Copilot.

Batch summary:
- Total at risk: ₹{stats_data['total_at_risk']}
- Recovered so far: ₹{stats_data['total_recovered']}
- Pending: {stats_data['pending_count']} | Recovered: {stats_data['recovered_count']}

Recent transactions:
{tx_text}

Merchant asks: {req.question}

Rules:
- Under 120 words.
- Actionable, specific to the data above.
- Professional fintech-assistant tone.
"""
    try:
        response = gemini.generate_content(prompt)
        return {"answer": response.text.strip()}
    except Exception as e:
        return {"answer": f"AI copilot unavailable right now: {e}"}
