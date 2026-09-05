from fastapi import APIRouter
from pydantic import BaseModel
import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

model = genai.GenerativeModel("gemini-2.5-flash")

router = APIRouter()


class ChatRequest(BaseModel):
    message: str
    trust_score: int
    risk: str
    merchant: str


@router.post("/chat")
def chat(req: ChatRequest):
    prompt = f"""
You are Razorpay Merchant Copilot.

Merchant: {req.merchant}
Current Trust Score: {req.trust_score}
Risk Level: {req.risk}

Merchant Question:
{req.message}

Rules:
- Keep the answer under 120 words.
- Be professional.
- Explain fraud risk clearly.
- Suggest actionable next steps if appropriate.
"""

    response = model.generate_content(prompt)

    return {
        "reply": response.text.strip()
    }