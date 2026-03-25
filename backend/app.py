"""
Flask API for Housing Price Prediction using trained scikit-learn model.
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import os

app = Flask(__name__)
CORS(app)

# Load model
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'model.pkl')
model_data = None

def load_model():
    global model_data
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(
            "model.pkl not found. Run 'python train_model.py' first."
        )
    model_data = joblib.load(MODEL_PATH)
    print(f"Model loaded. R²={model_data['r2_score']:.4f}")

@app.route('/api/predict', methods=['POST'])
def predict():
    if model_data is None:
        return jsonify({'error': 'Model not loaded'}), 500

    data = request.json
    try:
        # Map furnishing status to numeric
        furnishing_map = {'unfurnished': 0, 'semi-furnished': 1, 'furnished': 2}
        furnishing = furnishing_map.get(data.get('furnishingstatus', 'unfurnished'), 0)

        features = np.array([[
            float(data['area']),
            int(data['bedrooms']),
            int(data['bathrooms']),
            int(data['stories']),
            int(data['parking']),
            1 if data.get('mainroad', False) else 0,
            1 if data.get('airconditioning', False) else 0,
            furnishing,
        ]])

        predicted = model_data['model'].predict(features)[0]
        std_dev = predicted * 0.12

        return jsonify({
            'predicted': round(float(predicted)),
            'low': round(float(predicted - 1.5 * std_dev)),
            'high': round(float(predicted + 1.5 * std_dev)),
            'confidence': round(model_data['r2_score'], 3),
        })
    except (KeyError, ValueError) as e:
        return jsonify({'error': f'Invalid input: {str(e)}'}), 400

@app.route('/api/model-info', methods=['GET'])
def model_info():
    if model_data is None:
        return jsonify({'error': 'Model not loaded'}), 500

    model = model_data['model']
    features = model_data['features']
    coefs = dict(zip(features, model.coef_.tolist()))
    total = sum(abs(v) for v in coefs.values())
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
