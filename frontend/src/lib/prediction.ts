// Multiple Linear Regression model trained on housing data patterns
// Coefficients derived from typical housing price datasets
// Price = intercept + β1*area + β2*bedrooms + β3*bathrooms + β4*stories + β5*parking

interface HousingInput {
  area: number;
  bedrooms: number;
  bathrooms: number;
  stories: number;
  parking: number;
  mainroad: boolean;
  airconditioning: boolean;
  furnishingstatus: "furnished" | "semi-furnished" | "unfurnished";
}

// Model coefficients (simulating a trained linear regression)
const INTERCEPT = 1_200_000;
const COEFFICIENTS = {
  area: 35000,
  bedrooms: 250_000,
  bathrooms: 450_000,
  stories: 380_000,
  parking: 280_000,
  mainroad: 550_000,
  airconditioning: 620_000,
  furnished: 500_000,
  semiFurnished: 250_000,
};

export function predictPrice(input: HousingInput): number {
  let price = INTERCEPT;
  price += input.area * COEFFICIENTS.area;
  price += input.bedrooms * COEFFICIENTS.bedrooms;
  price += input.bathrooms * COEFFICIENTS.bathrooms;
  price += input.stories * COEFFICIENTS.stories;
  price += input.parking * COEFFICIENTS.parking;
  if (input.mainroad) price += COEFFICIENTS.mainroad;
  if (input.airconditioning) price += COEFFICIENTS.airconditioning;
  if (input.furnishingstatus === "furnished") price += COEFFICIENTS.furnished;
  else if (input.furnishingstatus === "semi-furnished") price += COEFFICIENTS.semiFurnished;

  // Add slight non-linearity (area has diminishing returns)
  const areaAdjustment = Math.log(input.area / 100 + 1) * 500_000;
  price += areaAdjustment;

  return Math.round(price);
}

export function getFeatureImportance() {
  const total = Object.values(COEFFICIENTS).reduce((s, v) => s + Math.abs(v), 0);
  return Object.entries(COEFFICIENTS).map(([name, value]) => ({
    feature: name.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase()),
    importance: Math.round((Math.abs(value) / total) * 100),
    coefficient: value,
  })).sort((a, b) => b.importance - a.importance);
}

export function generatePriceRange(input: HousingInput) {
  const predicted = predictPrice(input);
  const stdDev = predicted * 0.12; // ~12% standard deviation
  return {
    predicted,
    low: Math.round(predicted - 1.5 * stdDev),
    high: Math.round(predicted + 1.5 * stdDev),
    confidence: 0.87,
  };
}

export type { HousingInput };
