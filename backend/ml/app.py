from flask import Flask, request, jsonify
from transformers import MobileNetV2ImageProcessor, AutoModelForImageClassification


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
MODEL_ID = "linkanjarad/mobilenet_v2_1.0_224-plant-disease-identification"
try:
    processor = MobileNetV2ImageProcessor.from_pretrained(MODEL_ID)
except Exception:
    # Fallback to base MobileNetV2 processor
    processor = MobileNetV2ImageProcessor.from_pretrained("google/mobilenet_v2_1.0_224")

model = AutoModelForImageClassification.from_pretrained(MODEL_ID)
model.eval()

# Load Disease Data
disease_descriptions = {}
if os.path.exists(JSON_PATH):
    with open(JSON_PATH, "r") as f:
        disease_descriptions = json.load(f)

# The ID mapping (truncated for brevity - use your full 0-37 map from the original app.py)
id2label = {
    "0": "Apple Scab",
    "1": "Apple with Black Rot",
    "2": "Cedar Apple Rust",
    "3": "Healthy Apple",
    "4": "Healthy Blueberry Plant",
    "5": "Cherry with Powdery Mildew",
    "6": "Healthy Cherry Plant",
    "7": "Corn (Maize) with Cercospora and Gray Leaf Spot",
    "8": "Corn (Maize) with Common Rust",
    "9": "Corn (Maize) with Northern Leaf Blight",
    "10": "Healthy Corn (Maize) Plant",
    "11": "Grape with Black Rot",
    "12": "Grape with Esca (Black Measles)",
    "13": "Grape with Isariopsis Leaf Spot",
    "14": "Healthy Grape Plant",
    "15": "Orange with Citrus Greening",
    "16": "Peach with Bacterial Spot",
    "17": "Healthy Peach Plant",
    "18": "Bell Pepper with Bacterial Spot",
    "19": "Healthy Bell Pepper Plant",
    "20": "Potato with Early Blight",
    "21": "Potato with Late Blight",
    "22": "Healthy Potato Plant",
    "23": "Healthy Raspberry Plant",
    "24": "Healthy Soybean Plant",
    "25": "Squash with Powdery Mildew",
    "26": "Strawberry with Leaf Scorch",
    "27": "Healthy Strawberry Plant",
    "28": "Tomato with Bacterial Spot",
    "29": "Tomato with Early Blight",
    "30": "Tomato with Late Blight",
    "31": "Tomato with Leaf Mold",
    "32": "Tomato with Septoria Leaf Spot",
    "33": "Tomato with Spider Mites",
    "34": "Tomato with Target Spot",
    "35": "Tomato with Yellow Leaf Curl Virus",
    "36": "Tomato Mosaic Virus",
    "37": "Healthy Tomato Plant"
}

@app.route("/predict", methods=["POST"])
def predict():
    print("Received prediction request")
    if 'file' not in request.files:
        print("Error: No file provided")
        return jsonify({"error": "No file provided"}), 400

    file = request.files['file']
    try:
        image = Image.open(io.BytesIO(file.read())).convert("RGB")
        print(f"Image opened successfully: {image.size}, {image.mode}")
        
        # Process Image
        inputs = processor(images=image, return_tensors="pt")
        with torch.no_grad():
            outputs = model(**inputs)
            predicted_class = outputs.logits.argmax(-1).item()
            confidence = outputs.logits.softmax(dim=-1).max().item() * 100

        predicted_label = id2label.get(str(predicted_class), "Unknown")
        print(f"Prediction: {predicted_label} ({confidence:.2f}%)")
        
        return jsonify({
            "predicted_disease": predicted_label,
            "confidence": round(confidence, 2)
        })
    except Exception as e:
        print(f"Prediction Error in Flask: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(port=5000, debug=True)