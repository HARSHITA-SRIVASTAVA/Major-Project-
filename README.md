# Major-Project-
Title : Emotion and sentiment analysis using in Students Advance AI

*Run project using : pip install -r requirements.txt (No neend to install libraries again)
*http://127.0.0.1:5000/

# 🧠 Mental Health Analysis System

## 📌 Project Overview

This project aims to analyze user text and predict:

* Emotion
* Sentiment
* Stress/Risk level

The system combines NLP techniques and machine learning models.

---

## ⚙️ Tech Stack

* Python
* Flask (Backend API)
* Transformers (BERT - planned)
* Scikit-learn
* Pandas

---

## 📁 Project Structure

```
Major-Project/
 ├── backend/
 │     ├── app.py
 │     ├── model.py
 │     ├── utils.py
 │     ├── requirements.txt
 │     ├── data/
 │           ├── bert/
 │           ├── risk/
 ├── frontend/
```

---

Work Completed (Backend)

🔹 Project Setup
Created structured project folders (backend/, frontend/)
Set up and configured Python virtual environment
Installed required dependencies and generated requirements.txt

🔹 API Development
Built Flask backend (app.py)
Created /predict API endpoint
Tested API using Thunder Client

🔹 Data Preprocessing
Implemented robust text preprocessing
Handled messy dataset using custom parsing
Mapped emotion labels with fallback handling (unknown)

🔹 AI Integration
Integrated pre-trained BERT model for emotion detection
Implemented predict_emotion() using Transformers
Successfully tested real-time predictions

🔹 Git & Collaboration
Initialized GitHub repository
Managed .gitignore (excluded datasets & venv)
Followed proper Git workflow (pull → commit → push)
Synced with team changes

🚀 Current Features
Real-time emotion detection from text
REST API for prediction (/predict)
Clean and scalable backend structure

⏭️ Next Steps
Implement stress/risk prediction model (ML)
Integrate both models into API
Connect frontend with backend

💡 Note
Datasets are not included in the repository and are managed locally for better performance and version control.

*API Testing:<img width="500" height="150" alt="image" src="https://github.com/user-attachments/assets/57759cf7-6df0-42e4-aa31-5206233d2112" />

<img width="746" height="243" alt="image" src="https://github.com/user-attachments/assets/f0c8fe7f-c946-4558-8b8f-3fca387a2ede" />

The system gracefully handles invalid inputs and ensures stability.
<img width="705" height="692" alt="image" src="https://github.com/user-attachments/assets/13870196-ba64-47a6-9f7c-23826051e64a" />



