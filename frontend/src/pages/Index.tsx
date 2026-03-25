import { useState } from "react";
import heroBg from "@/assets/hero-bg.jpg";
import PredictionForm from "@/components/PredictionForm";
import PredictionResult from "@/components/PredictionResult";
import type { HousingInput } from "@/lib/prediction";
import { Brain } from "lucide-react";

interface PriceResult {
  predicted: number;
  low: number;
  high: number;
  confidence: number;
}

export default function Index() {
  const [result, setResult] = useState<PriceResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handlePredict = async (input: HousingInput) => {
    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data);
    } catch (err) {
      console.error("Prediction failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <img src={heroBg} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40" width={1920} height={800} />
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 to-background" />
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
          <div className="flex items-center gap-2 mb-3">
            <Brain className="h-8 w-8 text-primary" />
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              Housing Price <span className="text-primary glow-text">Predictor</span>
            </h1>
          </div>
          <p className="text-muted-foreground max-w-lg text-sm md:text-base">
            Multiple Linear Regression model trained on real housing data. Enter property features to get an instant price estimate.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container max-w-6xl mx-auto px-4 -mt-8 relative z-20 pb-16">
        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2">
            <PredictionForm onPredict={handlePredict} isLoading={isLoading} />
          </div>
          <div className="lg:col-span-3">
            <PredictionResult result={result} />
          </div>
        </div>
      </div>
    </div>
  );
}
