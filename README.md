# 🔑 BioKey — Biometric Authentication System

![Python](https://img.shields.io/badge/Python-3.10+-blue.svg)
![React](https://img.shields.io/badge/React-18.0+-61DAFB.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688.svg)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.0+-38B2AC.svg)
![Docker](https://img.shields.io/badge/Docker-Supported-2496ED.svg)

*BioKey* is a full-stack security and authentication application that leverages *keystroke dynamics and biometric analysis* to continuously authenticate users based on their unique typing patterns.

---

## 🛠️ Project Architecture

The project is structured as a decoupled full-stack application managed via Docker Compose:

```
BIOKEY/
├── backend/                  # FastAPI Python backend
│   ├── app.py                # Main application entry point & routing
│   ├── auth.py               # Authentication & token verification
│   ├── biometrics.py         # Keystroke dynamics & ML models processing
│   ├── config.py             # Server configuration
│   ├── models.py             # Database models
│   └── requirements.txt      # Python dependencies
├── frontend/                 # React + Tailwind CSS client
│   ├── src/
│   │   ├── api/              # Axios/Fetch API client wrapper
│   │   ├── components/       # React UI components
│   │   ├── hooks/            # Custom hooks (e.g., keystroke capture)
│   │   ├── App.jsx           # Master React layout
│   │   └── main.jsx          # Entry mount
│   └── package.json          # Node dependencies
└── docker-compose.yml        # Orchestration service configuration
```

---

## 💡 Key Features

* *Biometric Keystroke Dynamics:* Real-time capture and evaluation of user typing speed, dwell time, and flight time.
* *Secure Authentication:* JWT-based user authorization flow.
* *Interactive Dashboard:* Live visual metrics of access states and biometrics enrollment.
* *Containerized Deployment:* Ready-to-go Docker configuration for production-like execution.

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed locally:
* *Python* 3.10+
* *Node.js* 18+ & npm
* *Docker Desktop* (optional, for containerized run)

---

### Local Development Setup

#### 1. Clone the Repository
bash
git clone [https://github.com/your-username/biokey.git](https://github.com/your-username/biokey.git)
cd biokey


#### 2. Backend Setup
bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env.txt   # Update values inside .env.txt as needed

# Run the API server
uvicorn app:app --reload

The backend API will run at http://localhost:8000.

#### 3. Frontend Setup
bash
# Open a new terminal and navigate to frontend
cd frontend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env.txt   # Update values inside .env.txt as needed

# Start dev server
npm run dev

The frontend app will run at http://localhost:5173.

---

## 🐳 Running with Docker

To spin up both the frontend and backend services simultaneously:

bash
docker-compose up --build


Access the application:
* *Frontend:* http://localhost:3000 (or configured Docker port)
* *Backend Docs:* http://localhost:8000/docs

---

## 👥 Team & Contributions

This project is developed and maintained by:
* *Aeman Nadeem* — Backend Architecture & Biometric Processing Logic
* *Amna Arshad* — Frontend Engineering & Keystroke Capture Hooks

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
