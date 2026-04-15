from services.risk_model import predict_risk

sample = [14,20,0,11,2,1,2,4,2,3,3,2,3,2,3,3,2,3,3,2]

print(predict_risk(sample))