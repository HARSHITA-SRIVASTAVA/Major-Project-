from services.bert_model import predict_emotion

from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route("/")
def home():
    return "Backend is running!"

@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()
    text = data.get("text", "")

    if not text:
        return jsonify({"error": "No text provided"}), 400

    # BERT Prediction
    emotion_result = predict_emotion(text)

    return jsonify({
        "emotion": emotion_result["label"],
        "confidence": emotion_result["score"]
    })

if __name__ == "__main__":
    app.run(debug=True)