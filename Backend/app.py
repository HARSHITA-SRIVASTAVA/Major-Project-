from services.risk_model import predict_risk
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
    try:
        data = request.json
        text = data.get("text")

        if not text:
            return jsonify({"error": "No text provided"}), 400

        emotion = predict_emotion(text)

        sample_input = [14,20,0,11,2,1,2,4,2,3,3,2,3,2,3,3,2,3,3,2]
        risk = predict_risk(sample_input)

        return jsonify({
            "input": text,
            "analysis": {
                "emotion": emotion,
                "risk_level": risk
            },
            "status": "success"
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)