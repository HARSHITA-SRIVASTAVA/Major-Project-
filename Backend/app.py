from services.risk_model import predict_risk
from services.bert_model import predict_emotion

from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

def calculate_final_risk(emotion, risk_score):
    if emotion in ["sadness", "fear", "anger"] and risk_score == 2:
        return "High"
    elif risk_score == 1:
        return "Medium"
    else:
        return "Low"

@app.route("/")
def home():
    return "Backend is running!"

@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.json
        text = data.get("text")
        questionnaire = data.get("questionnaire")

        if not text:
            return jsonify({"error": "No text provided"}), 400
        
        if not questionnaire:
            return jsonify({"error": "Questionnaire data is required"}), 400


        # Convert questionnaire to model input
        sample_input = [
            questionnaire.get("anxiety_level", 0),
            questionnaire.get("self_esteem", 0),
            0,  # mental_health_history
            0,  # depression
            0,  # headache
            0,  # blood_pressure
            questionnaire.get("sleep_quality", 0),
            0,  # breathing_problem
            0,  # noise_level
            0,  # living_conditions
            0,  # safety
            0,  # basic_needs
            questionnaire.get("academic_pressure", 0),
            0,  # study_load
            0,  # teacher_student_relationship
            0,  # future_career_concerns
            questionnaire.get("social_support", 0),
            0,  # peer_pressure
            0,  # extracurricular_activities
            0   # bullying
        ]

        emotion = predict_emotion(text)
        risk = predict_risk(sample_input)

        final_risk = calculate_final_risk(emotion, risk)

        return jsonify({
            "input": text,
            "analysis": {
                "emotion": emotion,
                "risk_score": risk,
                "final_risk": final_risk,
                "recommendation": get_recommendation(final_risk)
            },
            "status": "success"
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
def get_recommendation(level):
    if level == "High":
        return "We recommend talking to a trusted person or seeking professional help."
    elif level == "Medium":
        return "Try relaxation techniques and take regular breaks."
    else:
        return "You seem to be doing well. Keep maintaining your mental health."

if __name__ == "__main__":
    app.run(debug=True)