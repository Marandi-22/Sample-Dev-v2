# server/app.py
import datetime, json
import re


from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# In-memory history
history = []

# A small set of phishing keywords:
PHISH_KEYWORDS = [
    "verify", "account", "password", "login", "click", "urgent",
    "bank", "ssn", "social security", "expire", "update",
    "pay", "send money", "transfer", "loan", "offer",
]

CRED_PATTERN = re.compile(r'https?://[^/\s]+@')

def classify_text_local(text: str, scenario: str):
    text_l = text.lower()

    # 1) Check for credential‐style URL
    if CRED_PATTERN.search(text):
        return (
            "phish",
            1.0,
            "URL contains embedded credentials (user@host)—very suspicious."
        )

    # 2) Keyword matching (updated list)
    matches = [kw for kw in PHISH_KEYWORDS if kw in text_l]
    score = min(1.0, len(matches) / len(PHISH_KEYWORDS))
    label = "phish" if score >= 0.3 else "safe"
    explanation = (
        f"Found keywords: {', '.join(matches)}."
        if matches else
        "No typical phishing keywords found."
    )
    return label, score, explanation


@app.route("/classify", methods=["POST"])
def classify_endpoint():
    body = request.json or {}
    text = body.get("text", "")
    scenario = body.get("scenario", "generic")
    label, score, explanation = classify_text_local(text, scenario)

    record = {
        "text": text,
        "scenario": scenario,
        "label": label,
        "score": score,
        "explanation": explanation,
        "timestamp": datetime.datetime.utcnow().isoformat(),
    }
    history.insert(0, record)
    return jsonify(record)

@app.route("/history", methods=["GET"])
def get_history():
    scn = request.args.get("scenario")
    if scn:
        return jsonify([r for r in history if r["scenario"] == scn])
    return jsonify(history)

if __name__ == "__main__":
    # Serve on all interfaces so emulator/device can reach it
    app.run(host="0.0.0.0", port=5000, debug=True)
