# 🎓 AI-Based Student Mental Health & Sentiment Analysis System

## 📌 Overview

This project is a Flask-based backend system that provides a REST API to analyze student mental health using:

* Text input (emotion and sentiment analysis)
* Questionnaire data (stress and risk assessment)

It integrates **Natural Language Processing (NLP)** and **Machine Learning (ML)** techniques to generate a final risk level along with personalized recommendations.

---

## 🚀 Features

🔹 Emotion Detection using a Transformer-based model (BERT)
🔹 Stress & Risk Prediction using Machine Learning
🔹 Hybrid Intelligence (combining emotion analysis + questionnaire score)
🔹 Recommendation System based on predicted risk level
🔹 REST API for seamless frontend integration
🔹 Robust error handling and input validation


🧱 Project Structure

<img width="185" height="748" alt="image" src="https://github.com/user-attachments/assets/87313c10-0492-44ff-9a98-78b10b96ced5" />

⚙️ Setup Instructions
1. Clone Repository
git clone https://github.com/HARSHITA-SRIVASTAVA/Major-Project-
cd Major-Project-/Backend
2. Create Virtual Environment
python -m venv venv
3. Activate Virtual Environment

Windows:

.\venv\Scripts\activate
4. Install Dependencies
pip install -r requirements.txt

#Running the Backend
python app.py

Server will start at:

http://127.0.0.1:5000

# API Endpoint
POST /predict
Request Body
{
  "text": "I feel stressed and anxious",
  "questionnaire": {
    "anxiety_level": 14,
    "self_esteem": 20,
    "sleep_quality": 2,
    "academic_pressure": 3,
    "social_support": 2
  }
}

#Response
{
  "input": "I feel stressed and anxious",
  "analysis": {
    "emotion": "sadness",
    "risk_score": 1,
    "final_risk": "Medium",
    "recommendation": "Try relaxation techniques and take regular breaks."
  },
  "status": "success"
}

#System Workflow
User input (text + questionnaire)
Text → Emotion detection (BERT model)
Questionnaire → Risk prediction (ML model)
Hybrid logic combines both outputs
Final risk level generated
Recommendation provided

#Notes
Datasets are not included in the repository (managed locally)
Virtual environment (venv/) is ignored via .gitignore
Flask development server is used (not for production)
🔮 Future Improvements
Chatbot integration
Multi-language support
Real-time monitoring system
Deployment (AWS / GCP)
Advanced dashboard

👥 Team
Developed as a final year major project by a team of four members.

📄 License
This project is for academic and research purposes.

💡 Note
Datasets are not included in the repository and are managed locally for better performance and version control.

*API Testing:

<img width="500" height="150" alt="image" src="https://github.com/user-attachments/assets/57759cf7-6df0-42e4-aa31-5206233d2112" />

<img width="350" height="250" alt="image" src="https://github.com/user-attachments/assets/f0c8fe7f-c946-4558-8b8f-3fca387a2ede" />

The system gracefully handles invalid inputs and ensures stability.

<img width="300" height="200" alt="image" src="https://github.com/user-attachments/assets/13870196-ba64-47a6-9f7c-23826051e64a" />



