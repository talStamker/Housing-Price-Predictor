"""
Train a Linear Regression model on Israeli housing deals data (נדל"ן).
CSV source: עסקאות נדל"ן רשות המסים / data.gov.il
"""

import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score, mean_absolute_error
import joblib
import os

# מילון המרת קומות מעברית למספרים
FLOOR_MAP = {
    'מרתף': -1, 'קרקע': 0,
    'ראשונה': 1, 'שניה': 2, 'שנייה': 2, 'שלישית': 3, 'רביעית': 4,
    'חמישית': 5, 'שישית': 6, 'שביעית': 7, 'שמינית': 8,
    'תשיעית': 9, 'עשירית': 10,
}

def parse_floor(val):
    if pd.isna(val):
        return np.nan
    s = str(val).strip()
    if s in FLOOR_MAP:
        return FLOOR_MAP[s]
    # ניסיון לחלץ מספר ("קומה 5", "11")
    try:
        return float(''.join(c for c in s if c.isdigit() or c == '.'))
    except Exception:
        return np.nan

def load_and_clean(csv_path):
    df = pd.read_csv(csv_path)
    print(f"נטענו {len(df)} שורות גולמיות")

    # 1) מחיר: "750,000" -> 750000
    df['price'] = (
        df['dealamount'].astype(str)
        .str.replace(',', '', regex=False)
        .str.replace('"', '', regex=False)
        .replace('nan', np.nan)
    )
    df['price'] = pd.to_numeric(df['price'], errors='coerce')

    # 2) שטח: dealnature לפעמים מספר, לפעמים טקסט
    df['area'] = pd.to_numeric(df['dealnature'], errors='coerce')

    # 3) קומה
    df['floor'] = df['floorno'].apply(parse_floor)

    # 4) חדרים
    df['rooms'] = pd.to_numeric(df['assetroomno'], errors='coerce')

    # 5) שנת בנייה -> גיל בעת העסקה
    df['build_year'] = pd.to_numeric(df['buildingyear'], errors='coerce')
    df['deal_year'] = pd.to_datetime(df['dealdate'], format='%d.%m.%Y', errors='coerce').dt.year
    df['age'] = df['deal_year'] - df['build_year']

    # 6) קומות בבניין
    df['total_floors'] = pd.to_numeric(df['buildingfloors'], errors='coerce')

    # 7) סינון: רק עסקאות מ-2020 ואילך
    df = df[df['deal_year'] >= 2020]
    print(f"אחרי סינון 2020+: {len(df)} שורות")

    # 8) שדות חובה
    df = df.dropna(subset=['price', 'area'])

    # 9) השלמות הגיוניות
    df['rooms'] = df['rooms'].fillna((df['area'] / 25).round().clip(1, 8))
    df['floor'] = df['floor'].fillna(2)
    df['age'] = df['age'].fillna(df['age'].median())
    df['total_floors'] = df['total_floors'].fillna(df['total_floors'].median())

    # 10) הסרת חריגים
    df = df[(df['price'] > 200_000) & (df['price'] < 20_000_000)]
    df = df[(df['area'] > 15) & (df['area'] < 500)]

    print(f"אחרי ניקוי: {len(df)} שורות")
    return df

def train():
    csv_path = os.path.join(os.path.dirname(__file__), 'housing_data.csv')
    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"לא נמצא: {csv_path}")

    df = load_and_clean(csv_path)

    features = ['area', 'rooms', 'floor', 'age', 'total_floors']
    X = df[features]
    y = df['price']

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    model = LinearRegression()
    model.fit(X_train, y_train)

    preds = model.predict(X_test)
    r2 = r2_score(y_test, preds)
    mae = mean_absolute_error(y_test, preds)

    print(f"\n=== תוצאות ===")
    print(f"R² = {r2:.3f}")
    print(f"MAE = ₪{mae:,.0f}")
    print(f"\nמקדמים:")
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
    print(f"\nנשמר ב-{model_path}")

if __name__ == '__main__':
    train()
