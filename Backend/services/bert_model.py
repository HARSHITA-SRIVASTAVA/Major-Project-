from transformers import pipeline

# Load model once (VERY IMPORTANT)
emotion_pipeline = pipeline(
    "text-classification",
    model="j-hartmann/emotion-english-distilroberta-base",
    return_all_scores=False
)


def predict_emotion(text):
    result = emotion_pipeline(text)

    return {
        "label": result[0]["label"],
        "score": round(result[0]["score"], 3)
    }