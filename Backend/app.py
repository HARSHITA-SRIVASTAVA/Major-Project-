from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route("/")
def home():
    return "Backend is running!"

@app.route("/predict", methods=["POST"])
def predict():
    data = request.json
    text = data.get("text")

    # Temporary dummy output
    return jsonify({
        "text": text,
        "emotion": "Stress",
        "sentiment": "Negative",
        "risk": "High"
    })

if __name__ == "__main__":
    app.run(debug=True)