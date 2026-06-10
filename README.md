# 🌍 WanderWise

Smart Trip Budget Planner powered by AI.

WanderWise helps travelers track expenses, monitor budgets, receive AI-powered spending advice, and generate smart packing recommendations for their trips.

## ✨ Features

### 💰 Budget Management
- Create multiple trips
- Set trip budgets
- Track expenses in real-time
- View remaining budget instantly

### 📊 Expense Tracking
- Add expenses by category
- Monitor spending progress
- Visual budget utilization

### 🤖 AI Travel Advisor
Powered by Google Gemini AI.

- Personalized spending suggestions
- Budget-saving recommendations
- Smart travel tips based on destination and spending patterns

### 🎒 AI Packing List
Generate packing recommendations based on your destination and travel details.

---

## 🛠️ Tech Stack

### Frontend
- HTML
- CSS
- JavaScript

### Backend
- Flask (Python)

### AI Integration
- Google Gemini API
- Gemini 2.5 Flash Lite

---

## 📂 Project Structure

```text
wanderwise/
│
├── app.py
├── data.json
├── requirements.txt
├── Procfile
├── .gitignore
│
├── static/
│   ├── script.js
│   └── style.css
│
└── templates/
    └── index.html
```

---

## ⚙️ Installation

### Clone Repository

```bash
git clone https://github.com/shreyatrivedi20/WanderWise
cd WanderWise
```

### Create Virtual Environment

```bash
python -m venv .venv
```

### Activate Environment

Windows:

```bash
.venv\Scripts\activate
```

### Install Dependencies

```bash
pip install -r requirements.txt
```

---

## 🔑 Environment Variables

Create a `.env` file:

```env
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```

Never upload the `.env` file to GitHub.

---

## ▶️ Run Locally

```bash
python app.py
```

Open:

```text
http://127.0.0.1:5000
```

---

## 🚀 Deployment

This project is deployment-ready for:

- Render
- Railway
- PythonAnywhere

### Render Settings

Build Command:

```bash
pip install -r requirements.txt
```

Start Command:

```bash
gunicorn app:app
```

Environment Variable:

```text
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```


---

## 🔮 Future Improvements

- User Authentication
- Cloud Database
- Expense Analytics
- Trip Sharing
- Currency Conversion
- PDF Trip Reports
- Hotel and Transport Bookings
- season and weather suitabilty suggestions 
- Info about local cuisine , tourist attractions and a complete guide

---

## 👩‍💻 Author

**Shreya Trivedi**

Built as a smart travel budgeting project using Flask and Google Gemini AI.
