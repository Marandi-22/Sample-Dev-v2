# server/app.py
import datetime, json, re, os, sqlite3
from flask import Flask, request, jsonify, g
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import jwt

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
    if db: db.close()

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
            return jsonify({"error":"missing_token"}), 401
        token = hdr.split(" ",1)[1]
        try:
            data = jwt.decode(token, APP_SECRET, algorithms=["HS256"])
            request.user_id = data["sub"]
            request.user_email = data["email"]
        except Exception:
            return jsonify({"error":"invalid_token"}), 401
        return fn(*args, **kwargs)
    return wrapper

# ---------- AUTH ROUTES ----------
@app.route("/auth/register", methods=["POST"])
def register():
    body = request.json or {}
    name = body.get("name","").strip()
    email = body.get("email","").strip().lower()
    password = body.get("password","")
    if not (name and email and password):
        return jsonify({"error":"missing_fields"}), 400

    db = get_db()
    cur = db.execute("SELECT id FROM users WHERE email=?", (email,))
    if cur.fetchone():
        return jsonify({"error":"email_in_use"}), 409

    pwd = generate_password_hash(password)
    now = datetime.datetime.utcnow().isoformat()
    db.execute(
        "INSERT INTO users(name,email,password_hash,created_at) VALUES(?,?,?,?)",
        (name, email, pwd, now)
    )
    db.commit()
    uid = db.execute("SELECT id FROM users WHERE email=?", (email,)).fetchone()["id"]
    token = make_token(uid, email)
    return jsonify({"token": token, "user":{"id":uid,"name":name,"email":email}})

@app.route("/auth/login", methods=["POST"])
def login():
    body = request.json or {}
    email = body.get("email","").strip().lower()
    password = body.get("password","")
    db = get_db()
    row = db.execute("SELECT * FROM users WHERE email=?", (email,)).fetchone()
    if not row or not check_password_hash(row["password_hash"], password):
        return jsonify({"error":"invalid_credentials"}), 401
    token = make_token(row["id"], row["email"])
    return jsonify({"token": token, "user":{"id":row["id"],"name":row["name"],"email":row["email"]}})

@app.route("/auth/me", methods=["GET"])
@auth_required
def me():
    db = get_db()
    row = db.execute("SELECT id,name,email FROM users WHERE id=?", (request.user_id,)).fetchone()
    return jsonify(dict(row))

# ---------- Your existing ML demo ----------
history = []
PHISH_KEYWORDS = [
    "verify","account","password","login","click","urgent",
    "bank","ssn","social security","expire","update",
    "pay","send money","transfer","loan","offer",
]
CRED_PATTERN = re.compile(r'https?://[^/\s]+@')

def classify_text_local(text: str, scenario: str):
    text_l = text.lower()
    if CRED_PATTERN.search(text):
        return ("phish",1.0,"URL contains embedded credentials (user@host)—very suspicious.")
    matches = [kw for kw in PHISH_KEYWORDS if kw in text_l]
    score = min(1.0, len(matches)/len(PHISH_KEYWORDS))
    label = "phish" if score >= 0.3 else "safe"
    explanation = f"Found keywords: {', '.join(matches)}." if matches else "No typical phishing keywords found."
    return label, score, explanation

@app.route("/classify", methods=["POST"])
@auth_required
def classify_endpoint():
    body = request.json or {}
    text = body.get("text","")
    scenario = body.get("scenario","generic")
    label, score, explanation = classify_text_local(text, scenario)
    record = {
        "text": text, "scenario": scenario,
        "label": label, "score": score, "explanation": explanation,
        "timestamp": datetime.datetime.utcnow().isoformat(),
        "user_id": request.user_id
    }
    history.insert(0, record)
    return jsonify(record)

@app.route("/history", methods=["GET"])
@auth_required
def get_history():
    scn = request.args.get("scenario")
    user_hist = [r for r in history if r.get("user_id")==request.user_id]
    return jsonify([r for r in user_hist if not scn or r["scenario"]==scn])

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
