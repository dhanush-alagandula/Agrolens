from flask import Flask, request, jsonify
from transformers import AutoImageProcessor, AutoModelForImageClassification
from PIL import Image
import io
import os
import json
import torch

app = Flask(__name__)

# Portable Pathing
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# Note: You need to move your disease_details.json to backend/ml/
JSON_PATH = os.path.join(BASE_DIR, "disease_details.json")

# Load Models
processor = AutoImageProcessor.from_pretrained("linkanjarad/mobilenet_v2_1.0_224-plant-disease-identification")
model = AutoModelForImageClassification.from_pretrained("linkanjarad/mobilenet_v2_1.0_224-plant-disease-identification")
model.eval()

# Load Disease Data
disease_descriptions = {}
if os.path.exists(JSON_PATH):
    with open(JSON_PATH, "r") as f:
        disease_descriptions = json.load(f)

# The ID mapping (truncated for brevity - use your full 0-37 map from the original app.py)
id2label = {
    "0": "Apple Scab",
    # ... (Paste your full label list here)
}

@app.route("/predict", methods=["POST"])
def predict():
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files['file']
    image = Image.open(io.BytesIO(file.read())).convert("RGB")
    
    # Process Image
    inputs = processor(images=image, return_tensors="pt")
    with torch.no_grad():
        outputs = model(**inputs)
        predicted_class = outputs.logits.argmax(-1).item()
        confidence = outputs.logits.softmax(dim=-1).max().item() * 100

    predicted_label = id2label.get(str(predicted_class), "Unknown")
    
    return jsonify({
        "predicted_disease": predicted_label,
        "confidence": round(confidence, 2)
    })

if __name__ == "__main__":
    app.run(port=5000, debug=True)