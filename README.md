# Major-Project-
Title : Emotion and sentiment analysis using in Students Advance AI

*Run project using : pip install -r requirements.txt (No neend to install libraries again)
*http://127.0.0.1:5000/

📌 Overview

This backend is built using Flask and provides a REST API for analyzing user mental health based on:

Text input (emotion + sentiment)
Questionnaire data (stress/risk assessment)

It combines Natural Language Processing (NLP) and Machine Learning (ML) to generate a final risk level along with recommendations.

# Features
🔹 Emotion Detection using Transformer-based model
🔹 Stress/Risk Prediction using ML model
🔹 Hybrid Intelligence (combines emotion + risk score)
🔹 Recommendation System based on final risk
🔹 REST API for frontend integration
🔹 Robust error handling

🧱 Project Structure
backend/
│
├── data/
│   ├── bert/
│   │   ├── dev.tsv
│   │   ├── test.tsv
│   │   ├── emotions.txt
│   │   └── sentiment140_clean.csv
│   │
│   └── risk/
│       └── StressLevelDataset.csv
│
├── services/
│   ├── bert_model.py        # Emotion detection model
│   ├── risk_model.py        # Stress prediction model
│   ├── data_preprocessing.py
│   ├── test_bert.py
│   └── test_data.py
│
├── app.py                  # Main Flask API
├── models.py
├── utils.py
├── requirements.txt
└── venv/ (ignored)

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

*API Testing:<img width="500" height="150" alt="image" src="https://github.com/user-attachments/assets/57759cf7-6df0-42e4-aa31-5206233d2112" />

<img width="746" height="243" alt="image" src="https://github.com/user-attachments/assets/f0c8fe7f-c946-4558-8b8f-3fca387a2ede" />

The system gracefully handles invalid inputs and ensures stability.
<img width="705" height="692" alt="image" src="https://github.com/user-attachments/assets/13870196-ba64-47a6-9f7c-23826051e64a" />



