from services.risk_model import predict_risk

sample_input = list(questionnaire.values())
risk = predict_risk(sample_input)

print(predict_risk(sample))