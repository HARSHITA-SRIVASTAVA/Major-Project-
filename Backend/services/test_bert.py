from services.bert_model import predict_emotion

text = "I feel very sad and lonely today"

result = predict_emotion(text)

print(result)