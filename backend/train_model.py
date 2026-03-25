"""
Train a Linear Regression model on housing data and save it.
Uses the Kaggle Housing Prices dataset format.
If no CSV is provided, generates synthetic training data.
"""
import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score, mean_absolute_error
import joblib
import os

def generate_synthetic_data(n=1000):
    """Generate synthetic housing data resembling Israeli market."""
    np.random.seed(42)
    area = np.random.uniform(25, 400, n)
    bedrooms = np.random.choice([1, 2, 3, 4, 5, 6], n, p=[0.05, 0.15, 0.35, 0.25, 0.15, 0.05])
    bathrooms = np.random.choice([1, 2, 3, 4], n, p=[0.2, 0.4, 0.3, 0.1])
    stories = np.random.choice(range(1, 10), n)
    parking = np.random.choice([0, 1, 2, 3], n, p=[0.2, 0.4, 0.3, 0.1])
    mainroad = np.random.choice([0, 1], n, p=[0.3, 0.7])
    airconditioning = np.random.choice([0, 1], n, p=[0.4, 0.6])
    furnishing = np.random.choice([0, 1, 2], n, p=[0.3, 0.4, 0.3])  # 0=unfurnished, 1=semi, 2=furnished

    # Generate realistic prices (in ILS-like scale)
    price = (
        1_200_000
        + area * 35_000
        + bedrooms * 250_000
        + bathrooms * 450_000
        + stories * 380_000
        + parking * 280_000
        + mainroad * 550_000
        + airconditioning * 620_000
        + (furnishing == 2) * 500_000
        + (furnishing == 1) * 250_000
        + np.log(area / 100 + 1) * 500_000
        + np.random.normal(0, 300_000, n)  # noise
    )

    df = pd.DataFrame({
        'area': area,
        'bedrooms': bedrooms,
        'bathrooms': bathrooms,
        'stories': stories,
        'parking': parking,
        'mainroad': mainroad,
        'airconditioning': airconditioning,
        'furnishingstatus': furnishing,
        'price': price
    })
    return df

def train():
    csv_path = os.path.join(os.path.dirname(__file__), 'housing_data.csv')

    if os.path.exists(csv_path):
        print(f"Loading data from {csv_path}")
        df = pd.read_csv(csv_path)
        # Convert categorical columns if needed
        if df['mainroad'].dtype == object:
            df['mainroad'] = (df['mainroad'] == 'yes').astype(int)
        if df['airconditioning'].dtype == object:
            df['airconditioning'] = (df['airconditioning'] == 'yes').astype(int)
        if df['furnishingstatus'].dtype == object:
            mapping = {'unfurnished': 0, 'semi-furnished': 1, 'furnished': 2}
            df['furnishingstatus'] = df['furnishingstatus'].map(mapping)
    else:
        print("No housing_data.csv found. Generating synthetic data...")
        df = generate_synthetic_data(1000)
        df.to_csv(csv_path, index=False)
        print(f"Saved synthetic data to {csv_path}")

    features = ['area', 'bedrooms', 'bathrooms', 'stories', 'parking',
                'mainroad', 'airconditioning', 'furnishingstatus']

    X = df[features].values
    y = df['price'].values

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model = LinearRegression()
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    r2 = r2_score(y_test, y_pred)
    mae = mean_absolute_error(y_test, y_pred)

    print(f"\n=== Model Performance ===")
    print(f"R² Score: {r2:.4f}")
    print(f"MAE: {mae:,.0f}")
    print(f"\nCoefficients:")
    for name, coef in zip(features, model.coef_):
        print(f"  {name}: {coef:,.2f}")
    print(f"  intercept: {model.intercept_:,.2f}")

    model_path = os.path.join(os.path.dirname(__file__), 'model.pkl')
    joblib.dump({
        'model': model,
        'features': features,
        'r2_score': r2,
        'mae': mae,
    }, model_path)
    print(f"\nModel saved to {model_path}")

if __name__ == '__main__':
    train()
