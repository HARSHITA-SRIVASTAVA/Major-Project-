import os

from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai

from services.risk_model import predict_risk
from services.bert_model import predict_emotion

load_dotenv()

app = Flask(__name__)
CORS(app)

# ── Gemini (light / flash) for dynamic recommendation text ────────────────────
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
GEMINI_MODEL = os.environ.get("GEMINI_MODEL", "gemini-1.5-flash")
llm = None

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    llm = genai.GenerativeModel(
        GEMINI_MODEL,
        generation_config={
            "temperature": 0.6,
            "max_output_tokens": 120,
        },
    )
else:
    print("WARNING: GEMINI_API_KEY not set — using CASTLE rule-based recommendations only.")

# Expanded to catch distress types across the GoEmotions spectrum
NEGATIVE_EMOTIONS = {
    "sadness", "fear", "anger", "disgust", "anxious", "nervousness",
    "annoyance", "disapproval", "grief", "remorse", "disappointment", "embarrassment",
}

# High-risk environmental triggers based on CASTLE's taxonomy
CRITICAL_ENVIRONMENTAL_RISKS = {
    "bullying", "bullied", "strict parents", "abusive",
    "scared to go home", "harassment", "cyberbullying",
}

# CASTLE: Virtual Emotional Dependence / Social Withdrawal (VE)
ISOLATION_TRIGGERS = (
    "lonely", "no friends", "haven't spoken", "havent spoken",
    "haven't left my room", "havent left my room",
    "only thing that listens", "only thing that actually listens",
    "only thing that actually listens to me",
)

# CASTLE: AI-Induced Self-Perception Bias / Fixed Mindset (CB)
SELF_WORTH_CRASH_TRIGGERS = (
    "stupid", "dumb", "failure", "not good enough", "give up",
    "too stupid", "i am genuinely just too stupid",
)


def _matches_any(text_lower, triggers):
    return any(t in text_lower for t in triggers)


def has_academic_misconduct(text_lower):
    if _matches_any(text_lower, ("cheat", "cheating", "plagiarize", "plagiarism", "chatgpt write")):
        return True
    if "copy" in text_lower and ("code" in text_lower or "github" in text_lower):
        return True
    return False


def has_career_despair(text_lower):
    if _matches_any(text_lower, ("hate coding", "family forced", "forced me", "feel trapped", "trapped in this degree")):
        return True
    
    # Adding spaces ensures we check for whole words, preventing false matches on substrings like 'in'
    path_words = (" degree ", " career ", " engineering ", " coding ")
    despair_words = (" forced ", " trapped ", " hate ", " misaligned ")
    
    # Pad the text with spaces to handle edge cases where words start or end the entry
    padded_text = f" {text_lower} "
    return any(p in padded_text for p in path_words) and any(d in padded_text for d in despair_words)


def calculate_final_risk(emotion_result, risk_score):
    """
    Combine BERT emotion label with RF stress score into a final risk level.
    emotion_result is a dict: { "label": "fear", "score": 0.91 }
    risk_score is an int: 0, 1, or 2
    """
    emotion_label = emotion_result.get("label", "neutral").lower()
    is_negative = emotion_label in NEGATIVE_EMOTIONS

    if is_negative and risk_score >= 1:
        return "High"
    elif risk_score == 2:
        return "High"
    elif risk_score == 1 or is_negative:
        return "Medium"
    else:
        return "Low"


def get_castle_aligned_recommendation(final_risk, emotion_label, text, days_until_deadline, is_weekend):
    """CASTLE-aligned fallback when the LLM is unavailable or fails."""
    text_lower = text.lower()
    emotion_label = (emotion_label or "").lower()

    has_critical_risk = any(trigger in text_lower for trigger in CRITICAL_ENVIRONMENTAL_RISKS)
    if has_critical_risk:
        if _matches_any(text_lower, ("bullying", "bullied", "cyberbullying", "harassment")):
            return (
                "Please remember that you do not have to go through this alone, and being mistreated "
                "is never your fault. Your physical and emotional safety is infinitely more important "
                "than any exam score. We strongly encourage you to step away from your studies and "
                "connect with a trusted institutional counselor, anti-bullying cell, or helpline."
            )
        if "parent" in text_lower or "home" in text_lower:
            return (
                "It sounds like your current home environment is creating an overwhelming amount of "
                "emotional pressure right now. When family expectations feel crushing, taking a step "
                "back to protect your peace of mind is responsible self-care. Please speak to an "
                "academic advisor or campus counselor who can provide an objective, safe space to support you."
            )
        return (
            "Your emotional health is our absolute priority. Please take an intentional break from "
            "academic tasks and reach out to someone you trust."
        )

    if has_academic_misconduct(text_lower):
        return (
            "It sounds like the pressure is pushing you toward a shortcut. Remember that submitting "
            "unoriginal work can risk your entire academic standing. Instead of copying, try submitting "
            "what you have completed honestly and ask your professor for an extension or partial credit."
        )

    if _matches_any(text_lower, ISOLATION_TRIGGERS):
        return (
            "I am glad you have a safe space to vent here, but I am just an AI. Human connection is "
            "vital for your well-being. Please make a small goal today to reach out to one person in "
            "the real world—even just a quick text to a classmate, a sibling, or an old school friend."
        )

    if _matches_any(text_lower, SELF_WORTH_CRASH_TRIGGERS):
        return (
            "A harsh review does not define your intelligence or your future. It is a single data "
            "point in a long learning process. Every expert has faced brutal feedback. Give yourself "
            "grace today, and tomorrow, look at the feedback as a tool for growth, not a judgment of your worth."
        )

    if has_career_despair(text_lower):
        return (
            "Feeling misaligned with your current path is a heavy burden. Your passions for other "
            "fields are highly valid! Many tech careers beautifully blend logic with visual design "
            "and management. Consider speaking to a campus career counselor to explore how to "
            "integrate your true interests into your degree."
        )

    is_distressed_emotion = emotion_label in {
        "sadness", "fear", "anxious", "depression", "nervousness", "grief",
    }
    if final_risk == "High" and is_distressed_emotion:
        return (
            "Your emotional health is our absolute priority. Please take an intentional break from "
            "academic tasks and reach out to someone you trust."
        )

    if days_until_deadline is not None and days_until_deadline <= 2:
        if final_risk in ["High", "Medium"]:
            return (
                f"You have an upcoming assignment or exam in {days_until_deadline} day(s). "
                "To help manage your anxiety, try resting intentionally for 1 hour first, "
                "then break your tasks into tiny, manageable steps."
            )
        return (
            f"Reminder: You have a deadline in {days_until_deadline} day(s). You're channeled "
            "in a balanced mindset right now—harness this calm energy to finish up early!"
        )

    if is_weekend:
        return (
            "Happy weekend! The models show you are in a stable headspace. "
            "Go out, have fun, and enjoy your time off!"
        )

    return "Maintain your healthy routines, protect your rest intervals, and check in again tomorrow."


def generate_dynamic_recommendation(text, emotion_label, final_risk, days_until_deadline, is_weekend):
    """
    Use Gemini Flash to write a short empathetic recommendation from BERT + RF + calendar context.
    Falls back to CASTLE rules if the API key is missing or the call fails.
    """
    if llm is None:
        return get_castle_aligned_recommendation(
            final_risk, emotion_label, text, days_until_deadline, is_weekend
        )

    deadline_str = "none" if days_until_deadline is None else str(days_until_deadline)

    prompt = f"""
You are an empathetic wellness assistant for university students.

A student just wrote this journal entry: "{text}"

Our internal diagnostic models evaluated this entry and concluded:
- Primary Emotion: {emotion_label}
- Structural Stress Risk: {final_risk}
- Days until next academic deadline: {deadline_str}
- Is it the weekend? {is_weekend}

Task: Write a highly empathetic, 2-to-3 sentence response to the student.

CRITICAL SAFETY RULES:
1. If the text implies severe psychological distress, bullying, isolation, abuse, or home fear, ignore academic deadlines. Prioritize safety and strongly encourage a campus counselor or trusted adult.
2. If the text implies cheating, plagiarism, or copying code to submit as their own, do NOT encourage finishing the work that way. Warn about academic standing and suggest honesty, an extension, or partial credit.
3. If the text shows social withdrawal or depending only on an app for connection, set a gentle boundary and urge real-world human contact.
4. If the text shows a fixed-mindset crash ("stupid", "failure", "not good enough"), reframe feedback as growth, not identity.
5. If the text shows career/degree misalignment or family pressure into a path they hate, validate passions and suggest a campus career counselor.
6. Do not sound robotic or use generic phrases like "As an AI...".
7. If they are happy or calm, encourage enjoying the weekend or using clear headspace for their deadline.
8. If they are stressed about a deadline (and none of the safety rules above apply), give actionable bite-sized study advice.
""".strip()

    try:
        response = llm.generate_content(prompt)
        generated = (getattr(response, "text", None) or "").strip()
        if generated:
            return generated
        raise ValueError("Empty LLM response")
    except Exception as e:
        print(f"LLM Generation Error: {e}")
        return get_castle_aligned_recommendation(
            final_risk, emotion_label, text, days_until_deadline, is_weekend
        )


def scale_slider(value, out_max):
    """
    Map a 1-5 slider value to the dataset's actual feature range (0 → out_max).
    """
    v = max(1, min(5, int(value)))
    return round((v - 1) / 4 * out_max)


def scale_slider_inv(value, out_max):
    """
    Inverted scale — for fields where a HIGH dataset value means HIGH stress.
    """
    v = max(1, min(5, int(value)))
    return round((5 - v) / 4 * out_max)


@app.route("/")
def home():
    return "Backend is running!"


@app.route("/api/predict", methods=["POST"])
def predict():
    try:
        data = request.json
        text = data.get("text", "")
        questionnaire = data.get("questionnaire", {})

        days_until_deadline = data.get("days_until_deadline")  # int or None
        is_weekend = data.get("is_weekend", False)

        if not text:
            return jsonify({"error": "No text provided"}), 400

        emotion = predict_emotion(text)

        s_anxiety = questionnaire.get("anxiety_level", 3)
        s_esteem = questionnaire.get("self_esteem", 3)
        s_sleep = questionnaire.get("sleep_quality", 3)
        s_academic = questionnaire.get("academic_pressure", 3)
        s_social = questionnaire.get("social_support", 3)

        anxiety_level = scale_slider_inv(s_anxiety, 21)
        self_esteem = scale_slider(s_esteem, 30)
        sleep_quality = scale_slider(s_sleep, 5)
        social_support = scale_slider(s_social, 3)
        academic_pres = scale_slider_inv(s_academic, 27)
        study_load = scale_slider_inv(s_academic, 5)
        future_concern = scale_slider_inv(s_academic, 5)
        blood_pressure = scale_slider_inv(s_anxiety, 3)

        sample_input = [
            anxiety_level, self_esteem, 0, academic_pres, 0, blood_pressure,
            sleep_quality, 0, 0, 0, 0, 0, 0, study_load, 0, future_concern,
            social_support, 0, 0, 0,
        ]

        risk = predict_risk(sample_input)
        final_risk = calculate_final_risk(emotion, risk)
        emotion_label = emotion.get("label", "neutral").lower()

        recommendation = generate_dynamic_recommendation(
            text=text,
            emotion_label=emotion_label,
            final_risk=final_risk,
            days_until_deadline=days_until_deadline,
            is_weekend=is_weekend,
        )

        return jsonify({
            "input": text,
            "analysis": {
                "emotion": emotion,
                "risk_score": risk,
                "final_risk": final_risk,
                "recommendation": recommendation,
            },
            "status": "success",
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)
