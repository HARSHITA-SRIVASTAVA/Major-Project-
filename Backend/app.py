from services.risk_model import predict_risk
from services.bert_model import predict_emotion

from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Negative emotions from the BERT model that indicate distress
NEGATIVE_EMOTIONS = {"sadness", "fear", "anger", "disgust"}

def calculate_final_risk(emotion_result, risk_score):
    """
    Combine BERT emotion label with RF stress score into a final risk level.
    emotion_result is a dict: { "label": "fear", "score": 0.91 }
    risk_score is an int: 0, 1, or 2
    """
    emotion_label = emotion_result.get("label", "neutral").lower()
    is_negative   = emotion_label in NEGATIVE_EMOTIONS

    if is_negative and risk_score >= 1:
        # Negative emotion + any structural stress → High
        return "High"
    elif risk_score == 2:
        # High structural stress even without negative emotion → High
        return "High"
    elif risk_score == 1 or is_negative:
        # Moderate stress OR mild negative emotion alone → Medium
        return "Medium"
    else:
        # Positive/neutral emotion AND no structural stress → Low
        return "Low"


def scale_slider(value, out_max):
    """
    Map a 1-5 slider value to the dataset's actual feature range (0 → out_max).
    Slider 1 = lowest wellbeing  → high risk value for inverse fields
    Slider 5 = highest wellbeing → low risk value for inverse fields
    """
    # Clamp to valid slider range
    v = max(1, min(5, int(value)))
    # Scale linearly: slider 1 → 0, slider 5 → out_max
    return round((v - 1) / 4 * out_max)


def scale_slider_inv(value, out_max):
    """
    Inverted scale — for fields where a HIGH dataset value means HIGH stress
    (e.g. anxiety_level, academic_pressure).
    Slider 1 (bad) → out_max (high stress), Slider 5 (good) → 0 (low stress).
    """
    v = max(1, min(5, int(value)))
    return round((5 - v) / 4 * out_max)


@app.route("/")
def home():
    return "Backend is running!"


@app.route("/predict", methods=["POST"])
def predict():
    try:
        data          = request.json
        text          = data.get("text")
        questionnaire = data.get("questionnaire")

        if not text:
            return jsonify({"error": "No text provided"}), 400
        if not questionnaire:
            return jsonify({"error": "Questionnaire data is required"}), 400

        # ── Pull slider values (1-5 scale from the frontend) ──────────────
        s_anxiety   = questionnaire.get("anxiety_level",     3)  # 1=calm, 5=very anxious
        s_esteem    = questionnaire.get("self_esteem",        3)  # 1=low,  5=high esteem
        s_sleep     = questionnaire.get("sleep_quality",      3)  # 1=poor, 5=great
        s_academic  = questionnaire.get("academic_pressure",  3)  # 1=none, 5=overwhelming
        s_social    = questionnaire.get("social_support",     3)  # 1=none, 5=strong

        # ── Map to dataset feature ranges ─────────────────────────────────
        # Inverse fields (high slider value = low risk number in dataset)
        anxiety_level  = scale_slider_inv(s_anxiety,  21)   # dataset: 0–21
        self_esteem    = scale_slider(s_esteem,        30)   # dataset: 0–30 (high = good)
        sleep_quality  = scale_slider(s_sleep,          5)   # dataset: 0–5  (high = good)
        social_support = scale_slider(s_social,         3)   # dataset: 0–3  (high = good)

        # Academic pressure → depression + academic performance proxies
        academic_pres  = scale_slider_inv(s_academic,  27)   # depression proxy  0–27
        study_load     = scale_slider_inv(s_academic,   5)   # study_load        0–5
        future_concern = scale_slider_inv(s_academic,   5)   # future_career     0–5

        # Derive blood pressure from anxiety (higher anxiety → higher BP)
        blood_pressure = scale_slider_inv(s_anxiety,    3)   # dataset: 1–3, use 0–3

        # Build the full 20-feature vector matching the dataset column order:
        # anxiety_level, self_esteem, mental_health_history, depression,
        # headache, blood_pressure, sleep_quality, breathing_problem,
        # noise_level, living_conditions, safety, basic_needs,
        # academic_performance, study_load, teacher_student_relationship,
        # future_career_concerns, social_support, peer_pressure,
        # extracurricular_activities, bullying
        sample_input = [
            anxiety_level,   # anxiety_level          0–21
            self_esteem,     # self_esteem             0–30
            0,               # mental_health_history   0/1
            academic_pres,   # depression              0–27  (academic pressure proxy)
            0,               # headache                0–5
            blood_pressure,  # blood_pressure          0–3
            sleep_quality,   # sleep_quality           0–5
            0,               # breathing_problem       0–5
            0,               # noise_level             0–5
            0,               # living_conditions       0–5
            0,               # safety                  0–5
            0,               # basic_needs             0–5
            0,               # academic_performance    0–5
            study_load,      # study_load              0–5
            0,               # teacher_student_rel     0–5
            future_concern,  # future_career_concerns  0–5
            social_support,  # social_support          0–3
            0,               # peer_pressure           0–5
            0,               # extracurricular         0–5
            0,               # bullying                0–5
        ]

        emotion = predict_emotion(text)
        risk    = predict_risk(sample_input)

        final_risk = calculate_final_risk(emotion, risk)

        return jsonify({
            "input": text,
            "analysis": {
                "emotion":        emotion,
                "risk_score":     risk,
                "final_risk":     final_risk,
                "recommendation": get_recommendation(final_risk),
            },
            "status": "success",
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


def get_recommendation(level):
    recommendations = {
        "High": (
            "We recommend talking to a trusted friend, family member, or counsellor. "
            "You don't have to face this alone — reaching out is a sign of strength."
        ),
        "Medium": (
            "Try breaking your tasks into smaller steps and scheduling short breaks. "
            "Light exercise, journaling, or talking to a friend can help reset your mood."
        ),
        "Low": (
            "You seem to be in a good place — keep it up! "
            "Maintain your healthy routines and check in again tomorrow."
        ),
    }
    return recommendations.get(level, "Keep monitoring your wellbeing regularly.")


if __name__ == "__main__":
    app.run(debug=True)
