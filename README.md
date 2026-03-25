# 🏠 Housing Price Predictor

A full-stack web application that predicts housing prices using a **Multiple Linear Regression** model. Users enter property features through an interactive form and receive an estimated price from the trained AI model.

---

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [AI Model Explanation](#ai-model-explanation)
- [Backend Files](#backend-files)
- [Frontend Files](#frontend-files)
- [How It Works (End-to-End Flow)](#how-it-works-end-to-end-flow)
- [Setup & Installation](#setup--installation)

---

## 🧠 AI Model Explanation

### Algorithm: Multiple Linear Regression

The model predicts housing prices using the formula:

```
Price = β₀ + β₁·area + β₂·bedrooms + β₃·bathrooms + β₄·stories + β₅·parking + β₆·mainroad + β₇·airconditioning + β₈·furnishing
```

- **β₀** = Intercept (base price)
- **β₁–β₈** = Learned coefficients (weights) for each feature
- The model is trained using **scikit-learn's `LinearRegression`** on the `Housing.csv` dataset.

### Input Features

| Feature | Type | Description |
|---------|------|-------------|
| `area` | Numeric | Property area in square meters |
| `bedrooms` | Numeric | Number of bedrooms (1–6) |
| `bathrooms` | Numeric | Number of bathrooms (1–4) |
| `stories` | Numeric | Number of floors |
| `parking` | Numeric | Parking spaces (0–3) |
| `mainroad` | Boolean | Is property on a main road? |
| `airconditioning` | Boolean | Has air conditioning? |
| `furnishingstatus` | Categorical | furnished / semi-furnished / unfurnished |

### Model Output

- **Predicted price**: Single point estimate
- **Price range**: Low and high bounds (±1.5 standard deviations)
- **Confidence**: Model's R² score from training

---

## 🔧 Backend Files

### `Housing.csv`
- **Purpose**: The raw dataset used for training the model.
- **Contains**: 545 rows of real housing data with columns for price, area, bedrooms, bathrooms, stories, mainroad, airconditioning, parking, furnishingstatus, and more.

### `train_model.py`
- **Purpose**: Trains the Multiple Linear Regression model and saves it to disk.
- **What it does**:
  1. Loads `Housing.csv` using pandas.
  2. Preprocesses data: converts boolean columns (`yes`/`no` → `1`/`0`), one-hot encodes `furnishingstatus`.
  3. Splits data into training (80%) and testing (20%) sets.
  4. Trains a `LinearRegression` model from scikit-learn.
  5. Evaluates the model (prints R² score and MAE).
  6. Saves the trained model to `model.pkl` using `joblib`.
- **Run**: `python train_model.py` (only needed once, or when retraining).

### `model.pkl`
- **Purpose**: The serialized (saved) trained model file.
- **What it does**: Stores the learned coefficients so the model doesn't need to be retrained every time the server starts. Loaded by `app.py` at startup.

### `app.py`
- **Purpose**: The Flask web server that serves the prediction API.
- **What it does**:
  1. Loads `model.pkl` at startup.
  2. Exposes API endpoints:
     - **`POST /api/predict`**: Accepts property features as JSON, preprocesses them into the same format used during training, runs prediction, and returns `{ predicted, low, high, confidence }`.
     - **`GET /api/model-info`** *(if available)*: Returns model metadata like R² score, MAE, and feature names.
  3. Handles CORS so the frontend can call the API from a different port.
- **Key function**: Takes raw user input → converts booleans → one-hot encodes furnishing → feeds to `model.predict()` → calculates price range → returns JSON response.

### `requirements.txt`
- **Purpose**: Lists Python dependencies needed for the backend.
- **Packages**: `flask`, `flask-cors`, `scikit-learn`, `pandas`, `numpy`, `joblib`.

---

## 🎨 Frontend Files

### `src/main.tsx`
- **Purpose**: The entry point of the React application.
- **What it does**: Creates the React root and renders the `<App />` component. Also imports the global CSS (`index.css`).

### `src/App.tsx`
- **Purpose**: The root component that sets up routing and global providers.
- **What it does**:
  - Wraps the app in `QueryClientProvider` (for data fetching with React Query).
  - Wraps in `TooltipProvider` (for UI tooltips).
  - Sets up `BrowserRouter` with routes: `/` → Index page, `*` → 404 NotFound page.
  - Renders toast notification components (`Toaster`, `Sonner`).

### `src/pages/Index.tsx`
- **Purpose**: The main landing page — the core of the application.
- **What it does**:
  - Manages two state variables: `result` (prediction data) and `isLoading`.
  - Defines `handlePredict()`: sends a POST request to `http://localhost:5000/api/predict` with the user's property data, then stores the response in `result`.
  - Renders the hero section with title and description.
  - Renders `<PredictionForm>` (left column) and `<PredictionResult>` (right column) in a responsive grid layout.

### `src/pages/NotFound.tsx`
- **Purpose**: The 404 error page shown when a user visits an invalid URL.
- **What it does**: Displays a "Page Not Found" message with a link back to the home page.

### `src/components/PredictionForm.tsx`
- **Purpose**: The interactive form where users enter property details.
- **What it does**:
  - Maintains form state with all 8 input features using `useState`.
  - Provides UI controls for each feature:
    - **Area**: Slider (25–400 m²) + number input.
    - **Bedrooms**: Dropdown select (1–6).
    - **Bathrooms**: Dropdown select (1–4).
    - **Stories**: Number input.
    - **Parking**: Dropdown select (0–3).
    - **Main Road**: Toggle switch (on/off).
    - **Air Conditioning**: Toggle switch (on/off).
    - **Furnishing Status**: Dropdown select (furnished / semi-furnished / unfurnished).
  - Has a "Predict Price" button that calls `onPredict(form)` to send data to the parent (`Index.tsx`).
  - Shows "Analyzing..." while the request is loading.

### `src/components/PredictionResult.tsx`
- **Purpose**: Displays the prediction results returned from the backend.
- **What it does**:
  - If no result yet: shows a placeholder with an icon and "Enter property details to get a prediction" message.
  - If result exists: displays:
    - **Estimated Price**: Large formatted currency number (e.g., `$3,450,000`).
    - **Price Range**: Low estimate (with red down arrow) and high estimate (with green up arrow).
    - **Confidence**: Percentage score with a target icon.
  - Uses `Intl.NumberFormat` to format numbers as USD currency.

### `src/components/NavLink.tsx`
- **Purpose**: A reusable navigation link component.
- **What it does**: Wraps React Router's `NavLink` to support custom `className`, `activeClassName`, and `pendingClassName` props using the `cn()` utility for conditional class merging.

### `src/lib/prediction.ts`
- **Purpose**: Client-side fallback prediction logic (NOT the real model).
- **What it does**:
  - Contains hardcoded coefficients that mimic a linear regression model.
  - `predictPrice()`: Calculates an estimated price using fixed weights — this is a **fallback** if the backend is unavailable.
  - `getFeatureImportance()`: Returns each feature's relative importance as a percentage.
  - `generatePriceRange()`: Generates low/high bounds using ±18% of predicted price and returns a fixed 87% confidence.
- **⚠️ Note**: This file is NOT the trained model. The real predictions come from the Flask backend (`app.py` + `model.pkl`).

### `src/lib/utils.ts`
- **Purpose**: Shared utility functions.
- **What it does**: Exports `cn()` — a function that merges Tailwind CSS class names using `clsx` and `tailwind-merge`, preventing class conflicts.

### `src/index.css`
- **Purpose**: Global styles and design system tokens.
- **What it does**:
  - Imports Google Fonts (Space Grotesk + JetBrains Mono).
  - Defines CSS custom properties (variables) for the dark theme: colors, borders, radius, shadows, and glow effects.
  - Sets up Tailwind base/components/utilities layers.
  - Defines custom utility classes like `.glass-card`, `.glow-text`, `.gradient-border`.

### `src/App.css`
- **Purpose**: Additional app-level styles (mostly unused, kept for potential custom animations).

### `src/hooks/use-mobile.tsx`
- **Purpose**: A React hook to detect mobile screen sizes.
- **What it does**: Uses `window.matchMedia` to return `true` if the viewport width is below the mobile breakpoint (768px).

### `src/hooks/use-toast.ts`
- **Purpose**: A React hook for managing toast notifications.
- **What it does**: Provides `toast()` function to show temporary notification messages (success, error, info) in the UI.

### `src/assets/hero-bg.jpg`
- **Purpose**: The hero background image displayed at the top of the landing page.
- **What it does**: A decorative housing/architecture photo shown behind the title with reduced opacity (40%) and a gradient overlay to create a cinematic header effect.

### `src/vite-env.d.ts`
- **Purpose**: TypeScript type declarations for Vite.
- **What it does**: References Vite's built-in client types so TypeScript understands Vite-specific features like importing images, CSS modules, and environment variables.

### `src/test/setup.ts`
- **Purpose**: Test environment setup file.
- **What it does**: Configures the testing environment (jsdom) before tests run. Loaded automatically by Vitest.

### `src/test/example.test.ts`
- **Purpose**: Example/sample test file.
- **What it does**: Contains a basic test to verify the testing setup works correctly. Serves as a template for writing new tests.

### `src/components/ui/` (UI Component Library)
- **Purpose**: Reusable UI components based on **shadcn/ui** (built on Radix UI primitives).
- **Includes**: `button`, `card`, `input`, `select`, `slider`, `switch`, `label`, `dialog`, `toast`, `tooltip`, `tabs`, `table`, `badge`, `avatar`, `accordion`, `dropdown-menu`, `popover`, `separator`, `skeleton`, `progress`, and more.
- **What they do**: Each file exports a styled, accessible React component. They use Tailwind CSS classes and the design tokens from `index.css`. These are the building blocks used by `PredictionForm` and `PredictionResult`.

### Config Files (Root)

| File | Purpose |
|------|---------|
| `index.html` | The HTML entry point. Contains the `<div id="root">` where React mounts. |
| `vite.config.ts` | Vite bundler configuration. Sets dev server port (8080), path aliases (`@/` → `src/`), and plugins. |
| `tailwind.config.ts` | Tailwind CSS configuration. Defines custom colors, fonts, animations, and extends the default theme. |
| `tsconfig.json` | Root TypeScript config. References `tsconfig.app.json` and `tsconfig.node.json`. |
| `tsconfig.app.json` | TypeScript config for the app source code (`src/`). Sets strict mode, JSX support, and path aliases. |
| `tsconfig.node.json` | TypeScript config for Node-side files like `vite.config.ts`. |
| `postcss.config.js` | PostCSS config. Enables Tailwind CSS and Autoprefixer plugins. |
| `eslint.config.js` | ESLint config for code linting rules (React hooks, refresh, TypeScript). |
| `components.json` | shadcn/ui configuration. Defines component paths, style preferences, and aliases. |
| `vitest.config.ts` | Vitest test runner configuration. Sets up jsdom environment and test file patterns. |
| `playwright.config.ts` | Playwright end-to-end test configuration. |
| `public/robots.txt` | Tells search engine crawlers which pages to index. |
| `public/placeholder.svg` | A generic placeholder image used as a fallback in UI components. |

---

## 🔄 How It Works (End-to-End Flow)

```
User fills form → Clicks "Predict Price"
        ↓
PredictionForm calls onPredict(formData)
        ↓
Index.tsx sends POST /api/predict to Flask backend
        ↓
app.py receives JSON → preprocesses features → model.predict()
        ↓
Returns { predicted, low, high, confidence }
        ↓
PredictionResult displays the estimated price + range
```

---

## 🚀 Setup & Installation

### Backend (Python)

```bash
cd backend
pip install -r requirements.txt
python train_model.py      # Train the model (creates model.pkl)
python app.py               # Start Flask server on port 5000
```

### Frontend (React)

```bash
cd frontend
npm install
npm run dev                 # Start dev server on port 8080
```

### Usage

1. Start the backend server (port 5000).
2. Start the frontend dev server (port 8080).
3. Open `http://localhost:8080` in your browser.
4. Fill in property details and click **Predict Price**.
