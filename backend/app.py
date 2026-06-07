"""
Flask API for Housing Price Prediction (Israeli housing data).
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'model.pkl')
model_data = None

# מפת קומות בעברית (אם הפרונט שולח טקסט)
FLOOR_MAP = {
    'מרתף': -1, 'קרקע': 0, 'ראשונה': 1, 'שניה': 2, 'שנייה': 2,
    'שלישית': 3, 'רביעית': 4, 'חמישית': 5, 'שישית': 6,
    'שביעית': 7, 'שמינית': 8, 'תשיעית': 9, 'עשירית': 10,
}

def parse_floor(val):
    if val is None or val == '':
        return 2  # ברירת מחדל
    if isinstance(val, (int, float)):
        return int(val)
    s = str(val).strip()
    if s in FLOOR_MAP:
        return FLOOR_MAP[s]
    try:
        return int(s)
    except ValueError:
        return 2

def load_model():
    global model_data
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError("model.pkl not found. Run 'python train_model.py' first.")
    model_data = joblib.load(MODEL_PATH)
    print(f"Model loaded. R²={model_data['r2_score']:.4f}")
    print(f"Features: {model_data['features']}")

@app.route('/api/predict', methods=['POST'])
def predict():
    if model_data is None:
        return jsonify({'error': 'Model not loaded'}), 500

    data = request.json
    try:
        area = float(data['area'])
        rooms = float(data.get('rooms') or area / 25)
        floor = parse_floor(data.get('floor'))
        build_year = int(data.get('buildingyear') or data.get('build_year') or 2000)
        age = max(0, datetime.now().year - build_year)
        total_floors = int(data.get('total_floors') or data.get('buildingfloors') or 4)

        # סדר ה-features חייב להיות זהה לאימון
        feature_order = model_data['features']
        feature_values = {
            'area': area,
            'rooms': rooms,
            'floor': floor,
            'age': age,
            'total_floors': total_floors,
        }
        features = np.array([[feature_values[f] for f in feature_order]])

        predicted = model_data['model'].predict(features)[0]
        std_dev = predicted * 0.12

        return jsonify({
            'predicted': round(float(predicted)),
            'low': round(float(predicted - 1.5 * std_dev)),
            'high': round(float(predicted + 1.5 * std_dev)),
            'confidence': round(model_data['r2_score'], 3),
            'currency': 'ILS',
        })
    except (KeyError, ValueError, TypeError) as e:
        return jsonify({'error': f'Invalid input: {str(e)}'}), 400

@app.route('/api/model-info', methods=['GET'])
def model_info():
    if model_data is None:
        return jsonify({'error': 'Model not loaded'}), 500

    model = model_data['model']
    features = model_data['features']
    coefs = dict(zip(features, model.coef_.tolist()))
    total = sum(abs(v) for v in coefs.values()) or 1
    importance = [
        {'feature': k, 'importance': round(abs(v) / total * 100), 'coefficient': round(v, 2)}
        for k, v in sorted(coefs.items(), key=lambda x: -abs(x[1]))
    ]

    return jsonify({
        'algorithm': 'Linear Regression (scikit-learn)',
        'r2_score': round(model_data['r2_score'], 3),
        'mae': round(model_data['mae'], 0),
        'features_count': len(features),
        'intercept': round(float(model.intercept_), 2),
        'feature_importance': importance,
    })

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'model_loaded': model_data is not None})

if __name__ == '__main__':
    load_model()
    app.run(host='0.0.0.0', port=5000, debug=True)
