# 💰 Datafle — Smart Finance Tracker

> A modern, full-stack personal finance tracker with AI-powered insights, interactive analytics, and a neo-futuristic dark UI.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi)
![Python](https://img.shields.io/badge/Python-3.14-3776AB?logo=python)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![Pandas](https://img.shields.io/badge/Pandas-3.0-150458?logo=pandas)
![License](https://img.shields.io/badge/License-MIT-green)

---

## ✨ Features

### Core Functionality
- **Expense Management** — Add, edit, delete expenses with category assignment
- **Category System** — 8 default categories + custom category creation with icons & colors
- **Search & Filter** — Full-text search and category-based filtering
- **Pagination** — Efficient browsing for large expense lists

### Analytics & Data Science
- **Dashboard** — At-a-glance financial overview with stat cards
- **Monthly Spending Chart** — Bar chart showing spending trends over time
- **Category Distribution** — Interactive donut chart with legend
- **Spending Trend** — Line chart with gradient fill for daily trends
- **ML Predictions** — NumPy polynomial regression for next-month spending prediction

### AI-Powered Insights
- **Rule-Based Engine** — Instant insights based on financial patterns
- **Google Gemini AI** — Personalized, contextual financial advice
- **Strategy Pattern** — Seamless switching between providers

### Design & UX
- **Neo-Futuristic Dark Theme** — Glassmorphism, gradients, micro-animations
- **Responsive Design** — Desktop sidebar + mobile bottom navigation
- **PWA Ready** — Installable as a native app on mobile/desktop
- **Skeleton Loading** — Smooth loading states throughout

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16, TypeScript, Vanilla CSS |
| **Charts** | Recharts (Bar, Pie, Line) |
| **Backend** | Python FastAPI |
| **Database** | SQLite + SQLAlchemy ORM |
| **Data Analysis** | Pandas 3.0, NumPy 2.4 |
| **ML** | NumPy polyfit + scikit-learn |
| **AI** | Google Gemini API (google-genai SDK) |
| **Auth** | JWT (python-jose) + bcrypt |
| **Icons** | Lucide React |

---

## 📁 Project Structure

```
finance-tracker/
├── frontend/                     # Next.js Application
│   ├── public/                   # Static assets & PWA
│   │   ├── manifest.json
│   │   └── icons/
│   └── src/
│       ├── app/                  # Pages (App Router)
│       │   ├── page.tsx          # Dashboard
│       │   ├── expenses/         # Expense management
│       │   ├── analytics/        # Charts & predictions
│       │   ├── insights/         # AI insights
│       │   ├── categories/       # Category management
│       │   ├── login/            # Authentication
│       │   └── register/
│       ├── components/
│       │   ├── layout/           # Sidebar, MobileNav, AppShell
│       │   └── charts/           # Recharts components
│       ├── context/              # AuthContext (JWT)
│       ├── hooks/                # Custom data hooks
│       ├── services/             # API client
│       ├── types/                # TypeScript interfaces
│       └── utils/                # Formatters, constants
│
├── backend/                      # FastAPI Application
│   ├── app/
│   │   ├── main.py               # App entry point
│   │   ├── config.py             # Environment config
│   │   ├── database.py           # SQLAlchemy setup
│   │   ├── models/               # ORM models
│   │   ├── schemas/              # Pydantic schemas
│   │   ├── services/             # Business logic
│   │   ├── routers/              # API endpoints
│   │   ├── analysis/             # Pandas aggregation + ML
│   │   └── ai/                   # Gemini + rule-based insights
│   ├── requirements.txt
│   └── .env
└── .gitignore
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+
- **Python** 3.11+
- **Google Gemini API Key** (optional, for AI insights)

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
./venv/Scripts/activate

# Activate (macOS/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your settings

# Start server
uvicorn app.main:app --reload --port 8000
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# Start development server
npm run dev
```

### Access the App
Open **http://localhost:3000** in your browser.

---

## 🔑 Environment Variables

### Backend (`backend/.env`)
```env
DATABASE_URL=sqlite:///./datafle.db
SECRET_KEY=your-jwt-secret-key
ALGORITHM=HS256
GEMINI_API_KEY=your-gemini-api-key  # Optional
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login (returns JWT) |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/categories/` | List categories |
| POST | `/api/categories/` | Create category |
| PUT | `/api/categories/{id}` | Update category |
| DELETE | `/api/categories/{id}` | Delete category |
| GET | `/api/expenses/` | List expenses (paginated) |
| GET | `/api/expenses/recent` | Recent expenses |
| POST | `/api/expenses/` | Create expense |
| PUT | `/api/expenses/{id}` | Update expense |
| DELETE | `/api/expenses/{id}` | Delete expense |
| GET | `/api/analytics/summary` | Dashboard summary |
| GET | `/api/analytics/monthly` | Monthly totals |
| GET | `/api/analytics/category-distribution` | Category breakdown |
| GET | `/api/analytics/trends` | Daily spending trends |
| GET | `/api/analytics/prediction` | ML prediction |
| GET | `/api/insights/` | AI/rule-based insights |

---

## 🧠 Architecture Principles

This project follows **SOLID**, **DRY**, **KISS**, and **YAGNI** principles:

- **Single Responsibility** — Each service/module has one clear purpose
- **Open/Closed** — AI providers use Strategy Pattern for extensibility
- **Dependency Inversion** — FastAPI dependency injection throughout
- **DRY** — Shared hooks, formatters, and design tokens
- **KISS** — SQLite for simplicity, direct bcrypt for auth
- **YAGNI** — Only features that serve the core use case

---

## 📄 License

MIT License — feel free to use this project in your portfolio.

---

## 👤 Author

Built with ❤️ as a portfolio project showcasing full-stack development skills.
