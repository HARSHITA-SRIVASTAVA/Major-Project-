#Training ML model: Predict stress level  & Completes  pipeline

import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier

# Load dataset
df = pd.read_csv("data/risk/StressLevelDataset.csv")

# Features & target
X = df.drop("stress_level", axis=1)
y = df["stress_level"]

# Split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

# Train model
model = RandomForestClassifier()
model.fit(X_train, y_train)

def predict_risk(input_data):
    prediction = model.predict([input_data])
    return int(prediction[0])