import sqlite3
import random
import os
from datetime import datetime

from .recovery_engine import FAILURE_PROFILES, diagnose_and_score, execute_recovery

BASE_DIR = os.path.dirname(os.path.dirname(__file__))
DB_PATH = os.path.join(BASE_DIR, "recoverypilot.db")

CUSTOMERS = ["Rahul Sharma", "Priya Nair", "Amit Verma", "Sneha Iyer", "Karan Mehta",
             "Divya Rao", "Vikram Singh", "Ananya Gupta", "Rohan Das", "Meera Pillai"]


def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db(seed_count: int = 25):
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer TEXT,
            amount REAL,
            failure_reason TEXT,
            failure_label TEXT,
            recovery_probability INTEGER,
            priority TEXT,
            recommended_action TEXT,
            action_label TEXT,
            eta TEXT,
            status TEXT DEFAULT 'pending',
            recovered_amount REAL DEFAULT 0,
            created_at TEXT
        )
    """)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS audit_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            transaction_id INTEGER,
            event TEXT,
            detail TEXT,
            timestamp TEXT
        )
    """)
    conn.commit()

    cur.execute("SELECT COUNT(*) FROM transactions")
    count = cur.fetchone()[0]

    if count == 0:
        for _ in range(seed_count):
            _create_synthetic_transaction(cur)
        conn.commit()

    conn.close()


def _create_synthetic_transaction(cur):
    reason = random.choice(list(FAILURE_PROFILES.keys()))
    amount = round(random.uniform(200, 25000), 2)
    plan = diagnose_and_score(amount, reason)

    cur.execute("""
        INSERT INTO transactions
        (customer, amount, failure_reason, failure_label, recovery_probability,
         priority, recommended_action, action_label, eta, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)
    """, (
        random.choice(CUSTOMERS), amount, plan["failure_reason"], plan["failure_label"],
        plan["recovery_probability"], plan["priority"], plan["recommended_action"],
        plan["action_label"], plan["eta"], datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
    ))


def get_transactions():
    conn = get_conn()
    rows = conn.execute("SELECT * FROM transactions ORDER BY id DESC").fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_transaction(tx_id: int):
    conn = get_conn()
    row = conn.execute("SELECT * FROM transactions WHERE id = ?", (tx_id,)).fetchone()
    conn.close()
    return dict(row) if row else None


def log_audit(cur, tx_id, event, detail):
    cur.execute(
        "INSERT INTO audit_log (transaction_id, event, detail, timestamp) VALUES (?, ?, ?, ?)",
        (tx_id, event, detail, datetime.now().strftime("%Y-%m-%d %H:%M:%S")),
    )


def recover_transaction(tx_id: int):
    conn = get_conn()
    cur = conn.cursor()
    tx = cur.execute("SELECT * FROM transactions WHERE id = ?", (tx_id,)).fetchone()

    if not tx:
        conn.close()
        return None

    if tx["status"] != "pending":
        conn.close()
        return dict(tx)

    log_audit(cur, tx_id, "action_executed", f"Executed: {tx['action_label']}")

    success = execute_recovery(tx["recovery_probability"])

    if success:
        cur.execute(
            "UPDATE transactions SET status='recovered', recovered_amount=? WHERE id=?",
            (tx["amount"], tx_id),
        )
        log_audit(cur, tx_id, "payment_recovered", f"Recovered ₹{tx['amount']}")
    else:
        cur.execute("UPDATE transactions SET status='failed_retry' WHERE id=?", (tx_id,))
        log_audit(cur, tx_id, "recovery_failed", "Customer did not complete payment")

    conn.commit()
    updated = dict(cur.execute("SELECT * FROM transactions WHERE id = ?", (tx_id,)).fetchone())
    conn.close()
    return updated


def get_audit_log(tx_id: int = None):
    conn = get_conn()
    if tx_id:
        rows = conn.execute(
            "SELECT * FROM audit_log WHERE transaction_id = ? ORDER BY id DESC", (tx_id,)
        ).fetchall()
    else:
        rows = conn.execute("SELECT * FROM audit_log ORDER BY id DESC LIMIT 50").fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_stats():
    conn = get_conn()
    rows = conn.execute("SELECT status, amount, recovered_amount FROM transactions").fetchall()
    conn.close()

    total_at_risk = sum(r["amount"] for r in rows if r["status"] == "pending")
    total_recovered = sum(r["recovered_amount"] for r in rows if r["status"] == "recovered")
    total_failed_retry = sum(1 for r in rows if r["status"] == "failed_retry")
    total_transactions = len(rows)

    return {
        "total_transactions": total_transactions,
        "pending_count": sum(1 for r in rows if r["status"] == "pending"),
        "recovered_count": sum(1 for r in rows if r["status"] == "recovered"),
        "failed_retry_count": total_failed_retry,
        "total_at_risk": round(total_at_risk, 2),
        "total_recovered": round(total_recovered, 2),
    }


def get_reason_breakdown():
    conn = get_conn()
    rows = conn.execute("""
        SELECT failure_label,
               COUNT(*) as count,
               SUM(amount) as total_amount,
               SUM(CASE WHEN status='recovered' THEN recovered_amount ELSE 0 END) as recovered_amount,
               AVG(recovery_probability) as avg_probability
        FROM transactions
        GROUP BY failure_label
        ORDER BY total_amount DESC
    """).fetchall()
    conn.close()
    return [
        {
            "reason": r["failure_label"],
            "count": r["count"],
            "total_amount": round(r["total_amount"], 2),
            "recovered_amount": round(r["recovered_amount"], 2),
            "avg_probability": round(r["avg_probability"]),
        }
        for r in rows
    ]


def add_new_failed_payment():
    """Simulates a new failed payment arriving (for the live demo feed)."""
    conn = get_conn()
    cur = conn.cursor()
    _create_synthetic_transaction(cur)
    conn.commit()
    conn.close()
