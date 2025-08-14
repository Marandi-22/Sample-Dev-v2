# server/app.py
import datetime, json, re, os, sqlite3
from flask import Flask, request, jsonify

# --- New imports for OCR ---
import pytesseract
from PIL import Image
# --- End new imports ---

from flask_cors import CORS

pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

# ... (rest of your existing code up to the routes) ...
app = Flask(__name__)
CORS(app)


# --- Your classify_text_advanced function (Unchanged) ---
def classify_text_advanced(text: str):
    text_l = text.lower()
    findings = []
    score = 0.0

    # Rule 1: Sense of Urgency (Score: +0.3)
    urgency_keywords = ['urgent', 'immediate action required', 'account suspended', 'act now', 'limited time']
    if any(keyword in text_l for keyword in urgency_keywords):
        findings.append("Creates a false sense of urgency.")
        score += 0.3

    # Rule 2: Threats or Warnings (Score: +0.3)
    threat_keywords = ['unauthorized access', 'suspicious activity', 'security alert', 'problem with your account']
    if any(keyword in text_l for keyword in threat_keywords):
        findings.append("Uses threats or warnings to scare you.")
        score += 0.3

    # Rule 3: Requests for Personal Information (Score: +0.4 - High risk!)
    personal_info_keywords = ['password', 'social security', 'ssn', 'credit card', 'login details', 'verify your account']
    if any(keyword in text_l for keyword in personal_info_keywords):
        findings.append("Asks for sensitive personal information.")
        score += 0.4

    # Rule 4: Contains URLs (Score: +0.2)
    urls = re.findall(r'https?://[^\s]+', text_l)
    if urls:
        findings.append("Contains URL(s). Be careful where you click.")
        score += 0.2

    # Rule 5: Generic Greetings (Score: +0.1)
    generic_greetings = ['dear customer', 'dear user', 'valued member']
    if any(greeting in text_l for greeting in generic_greetings):
        findings.append("Uses a generic greeting instead of your name.")
        score += 0.1
    
    # Rule 6: Promises of money or prizes (Score: +0.3)
    prize_keywords = ['you have won', 'congratulations you won', 'claim your prize', 'lottery']
    if any(keyword in text_l for keyword in prize_keywords):
        findings.append("Promises an unexpected prize or reward.")
        score += 0.3

    # Calculate final result
    final_score = min(1.0, score) # Cap the score at 1.0
    label = "phish" if final_score >= 0.4 else "safe"
    
    if not findings:
        explanation = "No common red flags were found. However, always remain cautious."
    else:
        explanation = "Potential red flags identified:\n- " + "\n- ".join(findings)
        
    return label, final_score, explanation

# --- Your existing /classify route (Unchanged) ---
@app.route("/classify", methods=["POST"])
def classify_endpoint():
    # This route for text input remains the same.
    # ... (code for text classification) ...
    body = request.json or {}
    text = body.get("text", "")
    if not text:
        return jsonify({"error": "text_is_empty"}), 400
    label, score, explanation = classify_text_advanced(text)
    record = { "text": text, "label": label, "score": score, "explanation": explanation, "timestamp": datetime.datetime.utcnow().isoformat() + "Z" }
    return jsonify(record)


# --- NEW: ROUTE FOR IMAGE CLASSIFICATION ---
@app.route("/classify-image", methods=["POST"])
def classify_image_endpoint():
    # 1. Check if an image file was uploaded
    if 'image' not in request.files:
        return jsonify({"error": "no_image_provided"}), 400
    
    file = request.files['image']
    
    # 2. Perform OCR on the image
    try:
        # Open the image file using Pillow
        img = Image.open(file.stream)
        # Use Pytesseract to extract text from the image
        extracted_text = pytesseract.image_to_string(img)

        if not extracted_text.strip():
            return jsonify({"error": "no_text_found_in_image"}), 400

    except Exception as e:
        print(f"OCR Error: {e}")
        return jsonify({"error": "image_processing_failed"}), 500

    # 3. Reuse your existing analysis logic on the extracted text
    label, score, explanation = classify_text_advanced(extracted_text)
    
    # 4. Return the result
    record = {
        "text": extracted_text, # Return the detected text for user to see
        "label": label, 
        "score": score, 
        "explanation": explanation,
        "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
    }
    return jsonify(record)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)