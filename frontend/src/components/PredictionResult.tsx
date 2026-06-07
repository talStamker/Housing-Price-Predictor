import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, ArrowDown, ArrowUp, Target } from "lucide-react";

interface PriceResult {
  predicted: number;
  low: number;
  high: number;
  confidence: number;
}

interface Props {
  result: PriceResult | null;
}

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);


export default function PredictionResult({ result }: Props) {
  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-muted-foreground/50">
        <TrendingUp className="h-16 w-16 mb-4" />
        <p className="text-lg font-medium">Enter property details to get a prediction</p>
        <p className="text-sm mt-1">Our regression model will estimate the price</p>
      </div>
    );
  }

  return (
    <Card className="glass-card overflow-hidden">
      <div className="gradient-border p-[1px] rounded-lg">
        <CardContent className="p-6 bg-card rounded-lg">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Estimated Price</p>
          <p className="text-4xl md:text-5xl font-bold glow-text text-primary font-mono">
            {formatCurrency(result.predicted)}
          </p>
          <div className="flex items-center gap-4 mt-4 text-sm">
            <span className="flex items-center gap-1 text-muted-foreground">
              <ArrowDown className="h-3.5 w-3.5 text-destructive" />
              {formatCurrency(result.low)}
            </span>
            <span className="text-muted-foreground/40">—</span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <ArrowUp className="h-3.5 w-3.5 text-green-400" />
              {formatCurrency(result.high)}
            </span>
            <span className="ml-auto flex items-center gap-1 text-primary/80">
              <Target className="h-3.5 w-3.5" />
              {Math.round(result.confidence * 100)}% confidence
            </span>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
