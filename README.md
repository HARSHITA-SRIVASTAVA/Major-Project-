# 🧠 MindBloom – Hybrid AI System for Student Emotion Detection & Mental Health Risk Assessment

![Python](https://img.shields.io/badge/Python-3.11-blue)
![Flask](https://img.shields.io/badge/Flask-3.1.3-green)
![React](https://img.shields.io/badge/React-18-blue)
![License](https://img.shields.io/badge/License-Academic-yellow)

**MindBloom** is a hybrid AI system designed to detect student emotions, assess mental health risk, and generate personalized, empathetic recommendations.

It combines **fine-tuned DistilRoBERTa**, **Random Forest classification**, **Google Gemini Flash**, and a **CASTLE-based safety rule engine** to provide responsible, context-aware support for students.

---

## 📌 Table of Contents

* [🌟 Features](#-features)
* [🏗️ System Architecture](#️-system-architecture)
* [📊 Datasets Used](#-datasets-used)
* [⚙️ Technology Stack](#️-technology-stack)
* [📁 Project Structure](#-project-structure)
* [🚀 Installation & Setup](#-installation--setup)
* [🖥️ Running the Application](#️-running-the-application)
* [🔗 API Endpoints](#-api-endpoints)
* [🧪 Testing](#-testing)
* [📈 Results](#-results)
* [🔒 Privacy & Security](#-privacy--security)
* [🛣️ Future Scope](#️-future-scope)
* [👥 Team](#-team)
* [📄 License](#-license)
* [🙏 Acknowledgements](#-acknowledgements)

---

## 🌟 Features

* **🔤 Emotion Detection** – Fine-tuned DistilRoBERTa classifies student text into 7 emotions:

  * Joy
  * Sadness
  * Anger
  * Fear
  * Disgust
  * Surprise
  * Neutral

* **📊 Stress Risk Assessment** – Random Forest classifier predicts stress level (**Low / Medium / High**) using 20 wellness features.

* **🛡️ CASTLE Safety Engine** – Prevents harmful or inappropriate recommendations related to academic misconduct, self-harm, social isolation, and other safety-sensitive situations.

* **🤖 AI-Powered Recommendations** – Google Gemini Flash generates personalized and empathetic 2–3 sentence responses.

* **📈 Analytics Dashboard** – React-based dashboard featuring:

  * Mood trends
  * Risk history
  * Emotion radar
  * Streak tracking

* **🔐 JWT Authentication** – Secure user authentication with 7-day token expiry.

* **💾 SQLite Storage** – Persistent storage of user entries and analysis results.

* **🖥️ CPU-Only Deployment** – Designed to run on standard consumer hardware without requiring a GPU.

---

## 🏗️ System Architecture

MindBloom follows a **three-layer hybrid architecture**.

```text
┌─────────────────────────────────────────────────────────────┐
│                       INPUT LAYER                           │
├─────────────────────────────────────────────────────────────┤
│  Student Text Journal                                       │
│  + Wellness Questionnaire (1–5 Likert Scale)                │
│  + Optional Inputs                                          │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    PROCESSING LAYER                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ┌────────────────────┐       ┌────────────────────┐       │
│   │    Text Channel    │       │     Risk Channel   │       │
│   │                    │       │                    │       │
│   │   DistilRoBERTa    │       │   Random Forest    │       │
│   │    7 Emotions      │       │    Score (0/1/2)   │       │
│   └─────────┬──────────┘       └─────────┬──────────┘       │
│             │                            │                  │
│             └──────────────┬─────────────┘                  │
│                            ▼                                │
│                 ┌──────────────────────┐                    │
│                 │  CASTLE Safety Rules  │                    │
│                 └──────────┬───────────┘                    │
│                            ▼                                │
│                 ┌──────────────────────┐                    │
│                 │  Hybrid Fusion Logic │                    │
│                 └──────────┬───────────┘                    │
│                            │                                │
└────────────────────────────┼────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                      OUTPUT LAYER                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ┌────────────────────┐       ┌────────────────────┐       │
│   │    Gemini Flash    │       │  Recommendation    │       │
│   │       (LLM)        │       │   (Text + TTS)     │       │
│   └────────────────────┘       └────────────────────┘       │
│                                                             │
│                 Dashboard + Analytics                       │
└─────────────────────────────────────────────────────────────┘
```

> **Architecture diagram:** A full Mermaid-generated architecture diagram is available at `docs/architecture.png`.

---

## 📊 Datasets Used

| Dataset                | Purpose                | Samples | Features                            |
| ---------------------- | ---------------------- | ------: | ----------------------------------- |
| **GoEmotions**         | Emotion classification |  58,000 | 27 emotion categories → mapped to 7 |
| **StressLevelDataset** | Stress risk prediction |   1,100 | 20 features, 3-class target (0/1/2) |

---

## ⚙️ Technology Stack

### Backend

* **Python 3.11**
* **Flask 3.1.3** – REST API framework
* **Transformers 5.3.0** – BERT model loading and inference
* **scikit-learn 1.7.2** – Random Forest classifier
* **google-generativeai 0.8.6** – Gemini Flash integration
* **Flask-JWT-Extended** – Authentication
* **Flask-SQLAlchemy** – Database ORM
* **joblib** – Model serialization

### Frontend

* **React 18** – UI framework
* **Vite** – Build tool
* **Recharts** – Data visualization
* **React Router** – Navigation

### Database

* **SQLite** – Local data storage

---

## 📁 Project Structure

```text
mindbloom/
│
├── backend/
│   ├── app.py                         # Main Flask application
│   ├── models.py                      # SQLAlchemy models (User, Entry)
│   ├── utils.py                       # Helper functions
│   ├── requirements.txt               # Python dependencies
│   ├── .env                           # Environment variables (API keys)
│   │
│   ├── services/
│   │   ├── bert_model.py              # Emotion detection (DistilRoBERTa)
│   │   ├── risk_model.py              # Random Forest stress prediction
│   │   ├── castel_rules.py            # CASTLE safety engine
│   │   ├── gemini_service.py          # Gemini Flash integration
│   │   ├── fusion.py                  # Hybrid fusion logic
│   │   └── data_preprocessing.py      # Data preprocessing
│   │
│   ├── data/
│   │   ├── bert/                      # Emotion dataset files
│   │   │   ├── dev.tsv
│   │   │   ├── test.tsv
│   │   │   ├── emotions.txt
│   │   │   └── sentiment140_clean.csv
│   │   │
│   │   └── risk/
│   │       └── StressLevelDataset.csv
│   │
│   └── test/
│       ├── test_castle_recommendations.py
│       ├── test_risk.py
│       └── test_bert.py
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── screens/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── DailyCheckIn.jsx
│   │   │   ├── Journal.jsx
│   │   │   ├── WeeklyReview.jsx
│   │   │   ├── MoodTrends.jsx
│   │   │   └── Analytics.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── package.json
│   └── vite.config.js
│
├── docs/
│   └── architecture.png              # Mermaid-generated architecture diagram
│
└── README.md
```

---

## 🚀 Installation & Setup

### Prerequisites

Make sure the following are installed:

* Python 3.11+
* Node.js 18+
* Google Gemini API key

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/mindbloom.git
cd mindbloom
```

### 2. Backend Setup

```bash
cd backend

# Create a virtual environment
python -m venv venv
```

#### Windows

```bash
venv\Scripts\activate
```

#### macOS / Linux

```bash
source venv/bin/activate
```

Install the required Python dependencies:

```bash
pip install -r requirements.txt
```

### 3. Configure Environment Variables

Create a `.env` file inside the `backend/` directory:

```env
GEMINI_API_KEY=your_google_gemini_api_key_here
PORT=5000
FLASK_DEBUG=True
```

> ⚠️ **Important:** Do not commit your `.env` file or expose your Gemini API key publicly.

### 4. Frontend Setup

Open a new terminal and run:

```bash
cd frontend
npm install
npm run dev
```

---

## 🖥️ Running the Application

### Backend – Flask API

From the `backend/` directory:

```bash
python app.py
```

The backend server starts at:

```text
http://127.0.0.1:5000
```

### Frontend – React

From the `frontend/` directory:

```bash
npm run dev
```

The frontend application loads at:

```text
http://127.0.0.1:5173
```

---

## 🔗 API Endpoints

| Method   | Endpoint            | Description                                             |
| -------- | ------------------- | ------------------------------------------------------- |
| `POST`   | `/api/predict`      | Core analysis: emotion + risk + recommendation          |
| `POST`   | `/api/register`     | User registration                                       |
| `POST`   | `/api/login`        | User authentication                                     |
| `GET`    | `/api/me`           | Get current user profile                                |
| `GET`    | `/api/entries/`     | Get all entries for the current user                    |
| `DELETE` | `/api/entries/<id>` | Delete a specific entry                                 |
| `GET`    | `/api/history/`     | Server-side analytics: streak, trends, and top emotions |
| `GET`    | `/api/metrics`      | Random Forest model evaluation metrics                  |

### Sample Request

**POST `/api/predict`**

```json
{
  "text": "I am so stressed about my exam tomorrow",
  "questionnaire": {
    "anxiety_level": 14,
    "self_esteem": 20,
    "sleep_quality": 2,
    "academic_pressure": 3,
    "social_support": 2
  },
  "days_until_deadline": 1,
  "is_weekend": false
}
```

### Sample Response

```json
{
  "input": "I am so stressed about my exam tomorrow",
  "analysis": {
    "emotion": {
      "label": "fear",
      "score": 0.92
    },
    "risk_score": 1,
    "final_risk": "Medium",
    "recommendation": "It's completely normal to feel anxious before exams. Try breaking your study material into smaller chunks and take short breaks. Remember, resting is productive too—you've got this!"
  },
  "status": "success"
}
```

---

## 🧪 Testing

### Backend Tests

From the `backend/` directory:

#### Test BERT Emotion Model

```bash
python test/test_bert.py
```

#### Test Random Forest Risk Model

```bash
python test/test_risk.py
```

#### Test CASTLE Safety Recommendations

```bash
python test/test_castle_recommendations.py
```

### Manual API Test

You can also test the prediction endpoint using cURL:

```bash
curl -X POST http://127.0.0.1:5000/api/predict \
  -H "Content-Type: application/json" \
  -d '{
    "text": "I feel so happy today!",
    "questionnaire": {
      "anxiety_level": 5,
      "self_esteem": 25,
      "sleep_quality": 8,
      "academic_pressure": 1,
      "social_support": 5
    }
  }'

```
*API Testing:

<img width="500" height="150" alt="image" src="https://github.com/user-attachments/assets/57759cf7-6df0-42e4-aa31-5206233d2112" />

<img width="350" height="250" alt="image" src="https://github.com/user-attachments/assets/f0c8fe7f-c946-4558-8b8f-3fca387a2ede" />

The system gracefully handles invalid inputs and ensures stability.

<img width="300" height="200" alt="image" src="https://github.com/user-attachments/assets/13870196-ba64-47a6-9f7c-23826051e64a" />

---

## 📈 Results

### Random Forest Stress Classifier

| Class                | Precision |   Recall | F1-Score | Support |
| -------------------- | --------: | -------: | -------: | ------: |
| Low (0)              |      0.84 |     0.89 |     0.87 |      76 |
| Medium (1)           |      0.90 |     0.86 |     0.88 |      73 |
| High (2)             |      0.88 |     0.86 |     0.87 |      71 |
| **Weighted Average** |  **0.87** | **0.87** | **0.87** | **220** |

**Overall Accuracy: 87.27%**

### BERT Emotion Detection

Evaluation was performed on **50 manually annotated entries**:

* **Top-1 Accuracy:** 76%
* **Top-2 Accuracy:** 91%

---

## 🔒 Privacy & Security

MindBloom incorporates several privacy and security measures:

* **No Image Persistence:** Facial images, if used, are processed in-memory and discarded.
* **Password Hashing:** Passwords are hashed using Werkzeug's `pbkdf2:sha256`.
* **JWT Expiry:** Authentication tokens expire after 7 days.
* **Data Minimalization:** Only analysis outputs are stored; raw inputs are not retained for privacy.

---

## 🛣️ Future Scope

Potential future enhancements include:

* 🔧 **Fine-tuned DistilRoBERTa** – Train on student-specific text to improve domain accuracy.
* 🕰️ **LSTM Temporal Model** – Forecast mood trends over 7-day windows.
* 🗣️ **Speech Emotion Recognition** – Use Wav2Vec2 for voice-based journal entries.
* 📷 **Facial Emotion Recognition** – Use mini-XCEPTION for multimodal validation.
* ⌚ **Wearable Integration** – Integrate heart-rate and sleep data through Fitbit/Google Fit APIs.
* ☁️ **Cloud Deployment** – Deploy on AWS/GCP for multi-institution access.
* 📊 **Counselor Dashboard** – Provide anonymized class-level analytics.
* 🏫 **Institutional Pilot Testing** – Conduct pilot testing with 50+ students.


---

## 📄 License

This project is developed for **academic and research purposes** as part of the **Major Project (BCS685)** at RV Institute of Technology and Management, Bengaluru.

---

## Acknowledgements

* **Google Gemini** – For the LLM API.
* **Hugging Face** – For the DistilRoBERTa model.
* **Kaggle** – For the StressLevelDataset.

---

<p align="center">
  <strong>© 2025–2026 MindBloom Team. All rights reserved.</strong>
</p>



