import { useState } from "react";
import { toast, Toaster } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const API_URL = "http://localhost:5000/api/predict";
const CURRENT_YEAR = new Date().getFullYear();

const FLOOR_OPTIONS = [
  { value: "קרקע", label: "קרקע" },
  { value: "ראשונה", label: "ראשונה" },
  { value: "שניה", label: "שניה" },
  { value: "שלישית", label: "שלישית" },
  { value: "רביעית", label: "רביעית" },
  { value: "חמישית", label: "חמישית" },
  { value: "שישית", label: "שישית" },
  { value: "שביעית", label: "שביעית" },
  { value: "שמינית", label: "שמינית" },
];

type RangeInfo = { low: number; high: number; confidence: number };

export default function Index() {
  const [form, setForm] = useState({
    area: "",
    rooms: "",
    floor: "ראשונה",
    buildingyear: "",
    total_floors: "",
  });
  const [price, setPrice] = useState<number | null>(null);
  const [range, setRange] = useState<RangeInfo | null>(null);
  const [loading, setLoading] = useState(false);

  const update = (k: string, v: string) =>
    setForm((p) => ({ ...p, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    const area = parseFloat(form.area);
    const rooms = parseFloat(form.rooms);
    const total_floors = parseInt(form.total_floors);
    const buildingyear = parseInt(form.buildingyear);

    if (!(area > 0)) return toast.error("שטח חייב להיות גדול מ-0");
    if (!(rooms > 0)) return toast.error("מספר חדרים חייב להיות גדול מ-0");
    if (!(total_floors > 0))
      return toast.error("סה״כ קומות בבניין חייב להיות גדול מ-0");
    if (!buildingyear || buildingyear < 1800 || buildingyear > CURRENT_YEAR)
      return toast.error(`שנת בנייה חייבת להיות בין 1800 ל-${CURRENT_YEAR}`);

    setLoading(true);
    setPrice(null);
    setRange(null);
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          area,
          rooms,
          floor: form.floor,
          buildingyear,
          total_floors,
        }),
      });
      if (!res.ok) throw new Error("Prediction failed");
      const data = await res.json();
      console.log("API response:", data);

      const p =
        data.predicted ??
        data.predicted_price ??
        data.price ??
        data.prediction;

      if (typeof p !== "number" || !isFinite(p)) {
        toast.error("תשובה לא תקינה מהשרת");
        return;
      }
      setPrice(p);

      if (typeof data.low === "number" && typeof data.high === "number") {
        setRange({
          low: data.low,
          high: data.high,
          confidence:
            typeof data.confidence === "number" ? data.confidence : 0,
        });
      }
    } catch (err) {
      console.error(err);
      toast.error("שגיאה בחיזוי המחיר");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen flex items-center justify-center bg-background p-4">
      <Toaster richColors position="top-center" />
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-center text-2xl">חיזוי מחיר דירה</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="area">שטח (מ״ר)</Label>
              <Input
                id="area"
                type="number"
                value={form.area}
                onChange={(e) => update("area", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rooms">מספר חדרים</Label>
              <Input
                id="rooms"
                type="number"
                step="0.5"
                value={form.rooms}
                onChange={(e) => update("rooms", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>קומה</Label>
              <Select value={form.floor} onValueChange={(v) => update("floor", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FLOOR_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="total_floors">סה״כ קומות בבניין</Label>
              <Input
                id="total_floors"
                type="number"
                value={form.total_floors}
                onChange={(e) => update("total_floors", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="buildingyear">שנת בנייה</Label>
              <Input
                id="buildingyear"
                type="number"
                value={form.buildingyear}
                onChange={(e) => update("buildingyear", e.target.value)}
                required
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "מחשב..." : "חזה מחיר"}
            </Button>
          </form>

          {typeof price === "number" && (
            <div className="mt-6 rounded-lg border bg-muted p-4 text-center">
              <p className="text-sm text-muted-foreground">מחיר משוער</p>
              <p className="mt-1 text-3xl font-bold">
                ₪{price.toLocaleString("he-IL", { maximumFractionDigits: 0 })}
              </p>
              {range && (
                <p className="mt-2 text-sm text-muted-foreground">
                  טווח: ₪{range.low.toLocaleString("he-IL")} – ₪
                  {range.high.toLocaleString("he-IL")}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
