# RecoveryPilot AI

Built for the **Razorpay Buildathon — Track 03: AI Revenue Recovery**.

RecoveryPilot AI detects failed payments, diagnoses why each one failed, scores its
recovery probability, decides the right recovery action, executes it, and tracks the
recovered revenue — end to end, with an audit trail.

## What it does

For every failed payment, RecoveryPilot AI:

1. **Detects** the failure and its reason (UPI timeout, insufficient balance, expired
   card, checkout abandonment, failed subscription renewal, overdue B2B receivable,
   bank server issue).
2. **Scores** a recovery probability and priority based on the failure type and amount.
3. **Decides** the recovery action — instant retry link, delayed retry, WhatsApp
   reminder, email + retry, update-payment-method prompt, or an escalating chase
   sequence for receivables.
4. **Executes** the action and tracks the outcome (recovered / retry failed).
5. **Explains** every decision in plain English via Gemini, and surfaces batch-level
   insights on which failure reasons to prioritize.

## Tech stack

| Layer      | Technology                          |
|------------|--------------------------------------|
| Frontend   | React (Vite), Tailwind CSS, Recharts |
| Backend    | FastAPI                              |
| Database   | SQLite                               |
| AI         | Gemini 2.5 Flash                     |

## Project structure

```
razorpay-buildathon/
├── backend/
│   ├── app/
│   │   ├── main.py             # API routes
│   │   ├── database.py         # SQLite storage, synthetic data, stats
│   │   └── recovery_engine.py  # detect → score → decide logic
│   ├── requirements.txt
│   └── .env                    # GEMINI_API_KEY (not committed)
└── frontend/
    └── src/
        ├── pages/              # Dashboard, Insights, Reports, Settings
        └── components/         # Sidebar, RecoveryQueue, charts, AI Copilot
```

## Running locally

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # then add your own GEMINI_API_KEY
uvicorn app.main:app --reload
```

Runs on `http://127.0.0.1:8000`. Seeds 25 synthetic failed payments on first run.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs on `http://localhost:5173`.

## API

| Endpoint                              | Method | Description                              |
|----------------------------------------|--------|-------------------------------------------|
| `/transactions`                        | GET    | Failed-payment feed                       |
| `/stats`                                | GET    | Batch totals (at risk, recovered, etc.)   |
| `/transactions/{id}/recover`           | POST   | Executes the recovery action              |
| `/transactions/{id}/explain`           | POST   | AI explanation of the recovery decision   |
| `/transactions/{id}/audit`             | GET    | Audit trail for a transaction             |
| `/insights`                            | GET    | Failure-reason breakdown + AI narrative   |
| `/copilot`                             | POST   | Merchant Q&A over the current batch       |

## Notes

- Transaction data is synthetic, generated for demo purposes — no real merchant or
  payment data is used.
- `.env` is git-ignored; you'll need your own Gemini API key to run the AI features.
