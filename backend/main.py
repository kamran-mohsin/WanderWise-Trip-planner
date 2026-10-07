import sqlite3
import os
import uuid
from datetime import datetime
from fastapi import FastAPI, File, UploadFile, Form, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse

app = FastAPI(title="WanderWise Payment API", version="3.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

ADMIN_SECRET = "wanderwise-admin-2024"
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

DB_PATH = os.path.join(os.path.dirname(__file__), "payments.db")


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS payments (
            id TEXT PRIMARY KEY,
            sender_info TEXT NOT NULL,
            proof_filename TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'pending',
            submitted_at TEXT NOT NULL,
            reviewed_at TEXT,
            notes TEXT
        )
    """)
    conn.commit()
    conn.close()


init_db()


def check_admin(x_admin_secret: str | None):
    if x_admin_secret != ADMIN_SECRET:
        raise HTTPException(status_code=401, detail="Invalid admin credentials")


@app.get("/")
def root():
    return {"app": "WanderWise Payment API", "status": "running", "version": "3.0"}


@app.post("/api/submit-payment")
async def submit_payment(
    sender_info: str = Form(...),
    proof: UploadFile = File(...),
):
    if not proof.filename:
        raise HTTPException(status_code=400, detail="No file uploaded")

    allowed_types = ["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"]
    if proof.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Only image or PDF files are accepted")

    submission_id = str(uuid.uuid4())
    file_ext = os.path.splitext(proof.filename)[1] or ".jpg"
    saved_filename = f"{submission_id}{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, saved_filename)

    contents = await proof.read()
    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large. Maximum 10MB allowed.")

    with open(file_path, "wb") as f:
        f.write(contents)

    conn = get_db()
    conn.execute(
        "INSERT INTO payments (id, sender_info, proof_filename, status, submitted_at) VALUES (?, ?, ?, 'pending', ?)",
        (submission_id, sender_info, saved_filename, datetime.utcnow().isoformat()),
    )
    conn.commit()
    conn.close()

    # ── Admin notification record ──────────────────────────────────────────
    admin_msg = (
        f"🔔 NEW PRO PAYMENT RECEIVED!\n"
        f"━━━━━━━━━━━━━━━━━━━━━━━━\n"
        f"Submission ID: {submission_id}\n"
        f"Sender Info: {sender_info}\n"
        f"Amount: Rs 100 PKR (PRO Lifetime)\n"
        f"Screenshot: {saved_filename}\n"
        f"Time: {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}\n"
        f"━━━━━━━━━━━━━━━━━━━━━━━━\n"
        f"Admin Panel: http://127.0.0.1:8000/admin"
    )
    # Write notification to a log file for admin reference
    notif_path = os.path.join(os.path.dirname(__file__), "admin_notifications.log")
    with open(notif_path, "a", encoding="utf-8") as nf:
        nf.write(f"\n{'='*50}\n{admin_msg}\n")

    return {
        "submission_id": submission_id,
        "status": "pending",
        "message": "Payment proof submitted. Admin will verify within 24 hours.",
        "admin_notified": True,
        "admin_whatsapp": f"https://wa.me/923046942398?text={admin_msg.replace(chr(10), '%0A').replace(' ', '%20')}"
    }


@app.get("/api/payment-status/{submission_id}")
def payment_status(submission_id: str):
    conn = get_db()
    row = conn.execute(
        "SELECT id, status, submitted_at, reviewed_at FROM payments WHERE id = ?",
        (submission_id,)
    ).fetchone()
    conn.close()

    if not row:
        raise HTTPException(status_code=404, detail="Submission not found")

    return {
        "submission_id": row["id"],
        "status": row["status"],
        "submitted_at": row["submitted_at"],
        "reviewed_at": row["reviewed_at"]
    }


@app.get("/api/admin/payments")
def list_payments(x_admin_secret: str = Header(None)):
    check_admin(x_admin_secret)
    conn = get_db()
    rows = conn.execute("SELECT * FROM payments ORDER BY submitted_at DESC").fetchall()
    conn.close()
    return [dict(r) for r in rows]


@app.get("/api/admin/stats")
def admin_stats(x_admin_secret: str = Header(None)):
    check_admin(x_admin_secret)
    conn = get_db()
    total = conn.execute("SELECT COUNT(*) as c FROM payments").fetchone()["c"]
    pending = conn.execute("SELECT COUNT(*) as c FROM payments WHERE status='pending'").fetchone()["c"]
    approved = conn.execute("SELECT COUNT(*) as c FROM payments WHERE status='approved'").fetchone()["c"]
    rejected = conn.execute("SELECT COUNT(*) as c FROM payments WHERE status='rejected'").fetchone()["c"]
    revoked = conn.execute("SELECT COUNT(*) as c FROM payments WHERE status='revoked'").fetchone()["c"]
    conn.close()
    return {"total": total, "pending": pending, "approved": approved, "rejected": rejected, "revoked": revoked}


@app.post("/api/admin/approve/{submission_id}")
def approve_payment(submission_id: str, x_admin_secret: str = Header(None)):
    check_admin(x_admin_secret)
    conn = get_db()
    row = conn.execute("SELECT id FROM payments WHERE id = ?", (submission_id,)).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Submission not found")
    conn.execute(
        "UPDATE payments SET status = 'approved', reviewed_at = ? WHERE id = ?",
        (datetime.utcnow().isoformat(), submission_id),
    )
    conn.commit()
    conn.close()
    return {"status": "approved", "submission_id": submission_id}


@app.post("/api/admin/reject/{submission_id}")
def reject_payment(submission_id: str, x_admin_secret: str = Header(None)):
    check_admin(x_admin_secret)
    conn = get_db()
    row = conn.execute("SELECT id FROM payments WHERE id = ?", (submission_id,)).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Submission not found")
    conn.execute(
        "UPDATE payments SET status = 'rejected', reviewed_at = ? WHERE id = ?",
        (datetime.utcnow().isoformat(), submission_id),
    )
    conn.commit()
    conn.close()
    return {"status": "rejected", "submission_id": submission_id}


@app.post("/api/admin/revoke/{submission_id}")
def revoke_payment(submission_id: str, x_admin_secret: str = Header(None)):
    check_admin(x_admin_secret)
    conn = get_db()
    row = conn.execute("SELECT id FROM payments WHERE id = ?", (submission_id,)).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Submission not found")
    conn.execute(
        "UPDATE payments SET status = 'revoked', reviewed_at = ? WHERE id = ?",
        (datetime.utcnow().isoformat(), submission_id),
    )
    conn.commit()
    conn.close()
    return {"status": "revoked", "submission_id": submission_id}


@app.post("/api/admin/reset-all-pro")
def reset_all_pro(x_admin_secret: str = Header(None)):
    check_admin(x_admin_secret)
    conn = get_db()
    conn.execute("UPDATE payments SET status = 'revoked', reviewed_at = ? WHERE status = 'approved'", (datetime.utcnow().isoformat(),))
    conn.commit()
    conn.close()
    return {"status": "all_revoked", "message": "All active PRO memberships have been revoked"}


@app.delete("/api/admin/delete/{submission_id}")
def delete_payment(submission_id: str, x_admin_secret: str = Header(None)):
    check_admin(x_admin_secret)
    conn = get_db()
    row = conn.execute("SELECT id FROM payments WHERE id = ?", (submission_id,)).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Submission not found")
    conn.execute("DELETE FROM payments WHERE id = ?", (submission_id,))
    conn.commit()
    conn.close()
    return {"status": "deleted", "submission_id": submission_id}


@app.get("/admin", response_class=HTMLResponse)
def admin_panel():
    html_path = os.path.join(os.path.dirname(__file__), "admin.html")
    with open(html_path, encoding="utf-8") as f:
        return f.read()