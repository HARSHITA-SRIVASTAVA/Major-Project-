# Fixed test_risk.py
from services.risk_model import predict_risk

# Define the questionnaire data properly
questionnaire = {
    "anxiety_level": 14,
    "self_esteem": 20,
    "sleep_quality": 2,
    "academic_pressure": 3,
    "social_support": 2
}

# Convert to list for prediction
sample_input = list(questionnaire.values())
risk = predict_risk(sample_input)

print(f"Predicted risk level: {risk}")