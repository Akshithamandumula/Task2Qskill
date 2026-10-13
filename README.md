# Estately AI — Intelligent House Price Prediction Platform

![Estately AI Banner](https://img.shields.bg/badge/Platform-Estately%20AI-10b981?style=for-the-badge)
![Python](https://img.shields.io/badge/Python-3.7%2B-blue?style=for-the-badge&logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100%2B-009688?style=for-the-badge&logo=fastapi)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38BDF8?style=for-the-badge&logo=tailwindcss)

Estately AI is a full-stack real-estate property valuation SaaS platform powered by machine learning. The application uses a scikit-learn Linear Regression model trained on historical residential property sales data from **King County, USA** (Seattle, Bellevue, Redmond, Kirkland, Medina) to generate real, reproducible property valuations.

---

## Key Features

1. **Executive Overview Dashboard**: Real-time KPI metrics (Median Price, Avg SqFt, Model R² score, MAE), price distribution histograms, bedroom breakdown charts, actual vs predicted regressions.
2. **Interactive Property Valuation Estimator**: Multi-section property form with live inputs (Bedrooms, Bathrooms, SqFt Living, Lot Size, Construction Grade, Condition, Waterfront, Year Built, ZIP Code), feature contribution breakdown, and model disclaimer.
3. **Scenario Comparison Tool**: Compare side-by-side property variations (e.g. +500 SqFt or Bellevue ZIP 98004 vs Redmond 98052) to analyze price delta predictions.
4. **Dataset Explorer**: Upload custom CSV datasets, tabular search, column sorting, pagination, duplicate row detection, data health scoring, and CSV exports.
5. **Data Preprocessing Control Panel**: Configure numerical median/mean imputation, StandardScaling, log-transformations `log1p(price)`, and duplicate row filtering.
6. **Model Training Lab**: Reproducible train/test split controls, random seed settings, target selection, joblib pipeline persistence, and versioned artifact metadata.
7. **Model Evaluation**: Metrics (R², MAE, RMSE, MAPE), actual vs predicted scatter plot with ideal fit line, and residual error distribution histogram.
8. **Feature Insights**: Model coefficient breakdown (positive/negative price drivers) and interpretability guide.
9. **Prediction History**: Persistent SQLite prediction log with search, filter, detail view modal, CSV export, and record deletion.

---

## Technical Architecture

```
Task2/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app & startup event
│   │   ├── api/                 # API endpoint routers
│   │   │   ├── dataset.py       # Dataset preview & upload routes
│   │   │   ├── model.py         # Model training & metrics routes
│   │   │   ├── predict.py       # Prediction & scenario routes
│   │   │   ├── insights.py      # Feature coefficients route
│   │   │   └── history.py       # Prediction history CRUD
│   │   ├── core/                # Settings & config
│   │   ├── schemas/             # Pydantic data schemas
│   │   ├── services/            # Dataset & ML services
│   │   ├── ml/                  # ML pipeline (train, predict, evaluate, preprocessing)
│   │   └── database/            # SQLite SQLAlchemy models & session
│   ├── data/
│   │   └── kc_house_data.csv    # King County house sales dataset
│   ├── artifacts/               # Joblib trained model & metadata JSON
│   └── requirements.txt         # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/          # Reusable AppShell & UI cards
│   │   ├── pages/               # 9 functional application pages
│   │   ├── services/            # API client service layer
│   │   └── types/               # TypeScript interface definitions
│   ├── package.json
│   └── vite.config.ts
├── tests/
│   └── test_backend.py          # Pytest backend API & ML test suite
├── .gitignore
├── .env.example
└── README.md
```

---

## Kaggle Dataset Reference & Download Instructions

The application is built for the **Kaggle House Sales in King County, USA** dataset:
- Kaggle Dataset URL: [https://www.kaggle.com/datasets/harlfoxem/housesalesprediction](https://www.kaggle.com/datasets/harlfoxem/housesalesprediction)

### Manual Download:
1. Download `kc_house_data.csv` from the Kaggle link above.
2. Place the CSV file into `backend/data/kc_house_data.csv`.

### Kaggle CLI Download (Optional):
```bash
pip install kaggle
# Ensure kaggle.json is configured in ~/.kaggle/
kaggle datasets download -d harlfoxem/housesalesprediction -p backend/data/ --unzip
```

---

## Windows Quick Start Guide

### 1. Backend Setup & Run

Open PowerShell in the project directory (`Task2/`):

```powershell
# Create Python virtual environment
python -m venv .venv

# Activate virtual environment
.venv\Scripts\activate

# Install Python backend dependencies
pip install -r backend/requirements.txt

# Run FastAPI backend server (Server starts at http://127.0.0.1:8000)
$env:PYTHONPATH="backend"
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

### 2. Frontend Setup & Run

Open a second PowerShell terminal window in `Task2/frontend`:

```powershell
# Navigate to frontend
cd frontend

# Install Node dependencies
npm install

# Start Vite dev server (App opens at http://localhost:5173)
npm run dev
```

---

## Testing

Run the automated backend test suite using `pytest`:

```powershell
$env:PYTHONPATH="backend"
python -m pytest tests/test_backend.py
```

### Verification Checklist
- [x] Backend API Health (`GET /api/health`) returns healthy state.
- [x] Dataset loaded out-of-the-box (`backend/data/kc_house_data.csv`).
- [x] Model trained and persisted via `joblib` (`backend/artifacts/trained_model.joblib`).
- [x] Predictions calculated dynamically using Linear Regression pipeline.
- [x] Prediction history persisted in SQLite database (`estately.db`).
- [x] All 8 pytest backend test cases passing 100%.
- [x] Frontend TypeScript production build passing 100% with zero errors.

---

## Interactive API Documentation

Once the backend is running, access the interactive OpenAPI / Swagger UI at:
- Swagger Documentation: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- Redoc Documentation: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)
