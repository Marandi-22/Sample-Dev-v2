# server/app.py
import os
import re
import datetime
import sqlite3
import jwt

from flask import Flask, request, jsonify, g
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash

# --- OCR deps ---
import pytesseract
from PIL import Image

# Point directly to Tesseract EXE (override via env if you installed elsewhere)
pytesseract.pytesseract.tesseract_cmd = os.environ.get(
    "TESSERACT_CMD",
    r"C:\Program Files\Tesseract-OCR\tesseract.exe"
)

APP_SECRET = os.environ.get("APP_SECRET", "change_this_now")

app = Flask(__name__)
CORS(app)

# ---------- DB ----------
DB_PATH = os.path.join(os.path.dirname(__file__), "users.db")

def get_db():
    if "db" not in g:
        g.db = sqlite3.connect(DB_PATH)
        g.db.row_factory = sqlite3.Row
    return g.db

@app.teardown_appcontext
def close_db(_exc):
    db = g.pop("db", None)
    if db:
        db.close()

def init_db():
    db = get_db()
    db.execute("""
      CREATE TABLE IF NOT EXISTS users(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TEXT NOT NULL
      )
    """)
    db.commit()

with app.app_context():
    init_db()

# ---------- Auth helpers ----------
def make_token(user_id, email):
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(days=7)
    }
    return jwt.encode(payload, APP_SECRET, algorithm="HS256")

def auth_required(fn):
    from functools import wraps
    @wraps(fn)
    def wrapper(*args, **kwargs):
        hdr = request.headers.get("Authorization", "")
        if not hdr.startswith("Bearer "):
            return jsonify({"error": "missing_token"}), 401
        token = hdr.split(" ", 1)[1]
        try:
            data = jwt.decode(token, APP_SECRET, algorithms=["HS256"])
            request.user_id = data["sub"]
            request.user_email = data["email"]
        except Exception:
            return jsonify({"error": "invalid_token"}), 401
        return fn(*args, **kwargs)
    return wrapper

# ---------- AUTH ROUTES ----------
@app.route("/auth/register", methods=["POST"])
def register():
    body = request.json or {}
    name = body.get("name", "").strip()
    email = body.get("email", "").strip().lower()
    password = body.get("password", "")

    if not (name and email and password):
        return jsonify({"error": "missing_fields"}), 400

    db = get_db()
    cur = db.execute("SELECT id FROM users WHERE email=?", (email,))
    if cur.fetchone():
        return jsonify({"error": "email_in_use"}), 409

    pwd = generate_password_hash(password)
    now = datetime.datetime.utcnow().isoformat()
    db.execute(
        "INSERT INTO users(name,email,password_hash,created_at) VALUES(?,?,?,?)",
        (name, email, pwd, now)
    )
    db.commit()
    uid = db.execute("SELECT id FROM users WHERE email=?", (email,)).fetchone()["id"]
    token = make_token(uid, email)
    return jsonify({"token": token, "user": {"id": uid, "name": name, "email": email}})

@app.route("/auth/login", methods=["POST"])
def login():
    body = request.json or {}
    email = body.get("email", "").strip().lower()
    password = body.get("password", "")
    db = get_db()
    row = db.execute("SELECT * FROM users WHERE email=?", (email,)).fetchone()
    if not row or not check_password_hash(row["password_hash"], password):
        return jsonify({"error": "invalid_credentials"}), 401
    token = make_token(row["id"], row["email"])
    return jsonify({"token": token, "user": {"id": row["id"], "name": row["name"], "email": row["email"]}})

@app.route("/auth/me", methods=["GET"])
@auth_required
def me():
    db = get_db()
    row = db.execute("SELECT id,name,email FROM users WHERE id=?", (request.user_id,)).fetchone()
    return jsonify(dict(row))

# ---------- Classification Logic ----------
def classify_text_advanced(text: str):
    text_l = text.lower()
    findings = []
    score = 0.0

    # Sense of urgency
    if any(k in text_l for k in ['urgent', 'immediate action required', 'account suspended', 'act now', 'limited time']):
        findings.append("Creates a false sense of urgency.")
        score += 0.3

    # Threats/warnings
    if any(k in text_l for k in ['unauthorized access', 'suspicious activity', 'security alert', 'problem with your account']):
        findings.append("Uses threats or warnings to scare you.")
        score += 0.3

    # Requests for personal info (high risk)
    if any(k in text_l for k in ['password', 'social security', 'ssn', 'credit card', 'login details', 'verify your account']):
        findings.append("Asks for sensitive personal information.")
        score += 0.4

    # URLs present
    if re.findall(r'https?://[^\s]+', text_l):
        findings.append("Contains URL(s). Be careful where you click.")
        score += 0.2

    # Generic greeting
    if any(k in text_l for k in ['dear customer', 'dear user', 'valued member']):
        findings.append("Uses a generic greeting instead of your name.")
        score += 0.1

    # Prize/bait
    if any(k in text_l for k in ['you have won', 'congratulations you won', 'claim your prize', 'lottery']):
        findings.append("Promises an unexpected prize or reward.")
        score += 0.3

    final_score = min(1.0, score)
    label = "phish" if final_score >= 0.4 else "safe"

    explanation = (
        "No common red flags were found. However, always remain cautious."
        if not findings else
        "Potential red flags identified:\n- " + "\n- ".join(findings)
    )
    return label, final_score, explanation

# ---------- TEXT classify ----------
@app.route("/classify", methods=["POST"])
@auth_required
def classify_endpoint():
    body = request.json or {}
    text = body.get("text", "")
    if not text.strip():
        return jsonify({"error": "text_is_empty"}), 400
    label, score, explanation = classify_text_advanced(text)
    return jsonify({
        "text": text,
        "label": label,
        "score": score,
        "explanation": explanation,
        "timestamp": datetime.datetime.utcnow().isoformat() + "Z"
    })

# ---------- IMAGE classify (OCR + same logic) ----------
@app.route("/classify-image", methods=["POST"])
@auth_required
def classify_image_endpoint():
    if "image" not in request.files:
        return jsonify({"error": "no_image_provided"}), 400
    try:
        img = Image.open(request.files["image"].stream)
        extracted_text = pytesseract.image_to_string(img)
        if not extracted_text.strip():
            return jsonify({"error": "no_text_found_in_image"}), 400
    except Exception as e:
        print("OCR error:", e)
        return jsonify({"error": "image_processing_failed"}), 500

    label, score, explanation = classify_text_advanced(extracted_text)
    return jsonify({
        "text": extracted_text,
        "label": label,
        "score": score,
        "explanation": explanation,
        "timestamp": datetime.datetime.utcnow().isoformat() + "Z"
    })

# ---------- (Optional) in-memory history for demo ----------
history = []

@app.route("/history", methods=["GET"])
@auth_required
def get_history():
    scn = request.args.get("scenario")
    user_hist = [r for r in history if r.get("user_id") == request.user_id]
    return jsonify([r for r in user_hist if not scn or r["scenario"] == scn])

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
