import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Home, BedDouble, Bath, Building2, Car, Zap } from "lucide-react";
import type { HousingInput } from "@/lib/prediction";

interface Props {
  onPredict: (input: HousingInput) => void;
  isLoading: boolean;
}

export default function PredictionForm({ onPredict, isLoading }: Props) {
  const [form, setForm] = useState<HousingInput>({
    area: 80,
    bedrooms: 3,
    bathrooms: 2,
    stories: 2,
    parking: 1,
    mainroad: true,
    airconditioning: true,
    furnishingstatus: "semi-furnished",
  });

  const update = <K extends keyof HousingInput>(key: K, value: HousingInput[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <Home className="h-5 w-5 text-primary" />
          Property Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Area */}
        <div className="space-y-2">
          <Label className="text-muted-foreground text-xs uppercase tracking-wider">
            Area (m²)
          </Label>
          <div className="flex items-center gap-3">
            <Slider
              value={[form.area]}
              onValueChange={([v]) => update("area", v)}
              min={25}
              max={400}
              step={5}
              className="flex-1"
            />
            <Input
              type="number"
              value={form.area}
              onChange={(e) => update("area", Number(e.target.value))}
              className="w-24 bg-secondary/50 border-border/50 font-mono text-sm"
            />
          </div>
        </div>

        {/* Bedrooms & Bathrooms */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider flex items-center gap-1.5">
              <BedDouble className="h-3.5 w-3.5" /> Bedrooms
            </Label>
            <Select value={String(form.bedrooms)} onValueChange={(v) => update("bedrooms", Number(v))}>
              <SelectTrigger className="bg-secondary/50 border-border/50"><SelectValue /></SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Bath className="h-3.5 w-3.5" /> Bathrooms
            </Label>
            <Select value={String(form.bathrooms)} onValueChange={(v) => update("bathrooms", Number(v))}>
              <SelectTrigger className="bg-secondary/50 border-border/50"><SelectValue /></SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4].map((n) => (
                  <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stories & Parking */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5" /> Stories
            </Label>
            <Input
              type="number"
              min={1}
              value={form.stories}
              onChange={(e) => update("stories", Number(e.target.value))}
              className="bg-secondary/50 border-border/50 font-mono text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Car className="h-3.5 w-3.5" /> Parking
            </Label>
            <Select value={String(form.parking)} onValueChange={(v) => update("parking", Number(v))}>
              <SelectTrigger className="bg-secondary/50 border-border/50"><SelectValue /></SelectTrigger>
              <SelectContent>
                {[0, 1, 2, 3].map((n) => (
                  <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Toggles */}
        <div className="flex items-center justify-between">
          <Label className="text-muted-foreground text-xs uppercase tracking-wider">Main Road</Label>
          <Switch checked={form.mainroad} onCheckedChange={(v) => update("mainroad", v)} />
        </div>
        <div className="flex items-center justify-between">
          <Label className="text-muted-foreground text-xs uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5" /> Air Conditioning
          </Label>
          <Switch checked={form.airconditioning} onCheckedChange={(v) => update("airconditioning", v)} />
        </div>

        {/* Furnishing */}
        <div className="space-y-2">
          <Label className="text-muted-foreground text-xs uppercase tracking-wider">Furnishing Status</Label>
          <Select value={form.furnishingstatus} onValueChange={(v: HousingInput["furnishingstatus"]) => update("furnishingstatus", v)}>
            <SelectTrigger className="bg-secondary/50 border-border/50"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="furnished">Furnished</SelectItem>
              <SelectItem value="semi-furnished">Semi-Furnished</SelectItem>
              <SelectItem value="unfurnished">Unfurnished</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={() => onPredict(form)}
          disabled={isLoading}
          className="w-full h-12 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
        >
          {isLoading ? "Analyzing..." : "Predict Price"}
        </Button>
      </CardContent>
    </Card>
  );
}
