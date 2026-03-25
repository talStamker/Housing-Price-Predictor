# Housing Price Predictor - Backend

## Setup
```bash
pip install -r requirements.txt
python train_model.py   # Train model & create model.pkl
python app.py           # Start API on port 5000
```

## Endpoints
- `POST /api/predict` — Send property features, get price prediction
- `GET /api/model-info` — Get model metrics (R², MAE, feature importance)
- `GET /api/health` — Health check
