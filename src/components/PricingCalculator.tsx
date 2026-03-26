import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface PricingInputs {
  dataType: string;
  coverageArea: number; // in sq km
  frequency: string;
  urgency: 'standard' | 'urgent' | 'emergency';
  collection: 'archive' | 'tasking';
  resolution: 'vhr' | 'high' | 'medium' | 'low';
  maxCloud: number; // percent
}

const dataTypePricing = {
  "commercial-imagery": { base: 5, perSqKm: 0.5, name: "Commercial Imagery" },
  "open-data": { base: 0, perSqKm: 0, name: "Open Data" },
  "analytics": { base: 10, perSqKm: 1.2, name: "Analytics" },
  "ais-data": { base: 3, perSqKm: 0.3, name: "AIS Data" },
};

const frequencyMultipliers = {
  "one-time": { multiplier: 1, name: "One-time" },
  "monthly": { multiplier: 0.8, name: "Monthly" },
  "quarterly": { multiplier: 0.7, name: "Quarterly" },
  "annual": { multiplier: 0.6, name: "Annual" },
};

const urgencyMultipliers: Record<PricingInputs['urgency'], { multiplier: number; name: string }> = {
  standard: { multiplier: 1.0, name: 'Standard (72h+)' },
  urgent: { multiplier: 1.25, name: 'Urgent (24–72h)' },
  emergency: { multiplier: 1.5, name: 'Emergency (<24h, best effort)' },
};

const collectionMultipliers: Record<PricingInputs['collection'], { multiplier: number; name: string }> = {
  archive: { multiplier: 1.0, name: 'Archive (existing imagery)' },
  tasking: { multiplier: 1.4, name: 'Tasking (new collection)' },
};

const PricingCalculator = () => {
  const navigate = useNavigate();
  const [inputs, setInputs] = useState<PricingInputs>({
    dataType: "commercial-imagery",
    coverageArea: 100,
    frequency: "one-time",
    urgency: "standard",
    collection: "archive",
    resolution: "high",
    maxCloud: 30,
  });
  const [areaInput, setAreaInput] = useState("100");
  const [areaError, setAreaError] = useState("");
  const [displayPrice, setDisplayPrice] = useState(0);
  const animationRef = useRef<number | null>(null);

  const resolutionMultipliers: Record<PricingInputs['resolution'], { multiplier: number; name: string }> = {
    vhr: { multiplier: 1.5, name: 'Very High (≤0.5m)' },
    high: { multiplier: 1.2, name: 'High (0.5–2m)' },
    medium: { multiplier: 1.0, name: 'Medium (2–10m)' },
    low: { multiplier: 0.8, name: 'Low (10m+)' },
  };

  const validateArea = (val: string): boolean => {
    const num = Number(val);
    if (!val.trim() || isNaN(num)) { setAreaError("Please enter a valid number."); return false; }
    if (num < 1) { setAreaError("Area must be at least 1 sq km."); return false; }
    if (num > 10000) { setAreaError("Area cannot exceed 10,000 sq km."); return false; }
    setAreaError("");
    return true;
  };

  const handleAreaChange = (val: string) => {
    setAreaInput(val);
    if (validateArea(val)) {
      const num = Math.min(10000, Math.max(1, Number(val)));
      setInputs((prev) => ({ ...prev, coverageArea: num }));
    }
  };

  const cloudMultiplier = (maxCloud: number) => {
    if (maxCloud <= 10) return 1.3;
    if (maxCloud <= 20) return 1.2;
    if (maxCloud <= 30) return 1.1;
    return 1.0;
  };

  const calculatePrice = (): number => {
    const dataType = dataTypePricing[inputs.dataType as keyof typeof dataTypePricing];
    const frequency = frequencyMultipliers[inputs.frequency as keyof typeof frequencyMultipliers];
    const urgency = urgencyMultipliers[inputs.urgency];
    const collection = collectionMultipliers[inputs.collection];
    const resolution = resolutionMultipliers[inputs.resolution];
    if (!dataType || !frequency || !urgency || !collection || !resolution) return 0;
    const basePrice = dataType.base + dataType.perSqKm * inputs.coverageArea;
    return Math.max(
      0,
      basePrice *
        frequency.multiplier *
        urgency.multiplier *
        collection.multiplier *
        resolution.multiplier *
        cloudMultiplier(inputs.maxCloud)
    );
  };

  const getBreakdown = () => {
    const dataType = dataTypePricing[inputs.dataType as keyof typeof dataTypePricing];
    const basePrice = dataType.base + dataType.perSqKm * inputs.coverageArea;
    const freq = frequencyMultipliers[inputs.frequency as keyof typeof frequencyMultipliers];
    const urg = urgencyMultipliers[inputs.urgency];
    const col = collectionMultipliers[inputs.collection];
    const res = resolutionMultipliers[inputs.resolution];
    const cloud = cloudMultiplier(inputs.maxCloud);
    return [
      { label: "Base cost", value: basePrice, multiplier: null },
      { label: "Frequency", value: freq.multiplier, multiplier: freq.multiplier },
      { label: "Urgency", value: urg.multiplier, multiplier: urg.multiplier },
      { label: "Collection", value: col.multiplier, multiplier: col.multiplier },
      { label: "Resolution", value: res.multiplier, multiplier: res.multiplier },
      { label: "Cloud cover", value: cloud, multiplier: cloud },
    ];
  };

  useEffect(() => {
    const target = calculatePrice();
    const start = displayPrice;
    const duration = 400;
    const startTime = performance.now();
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayPrice(start + (target - start) * eased);
      if (progress < 1) animationRef.current = requestAnimationFrame(animate);
    };
    animationRef.current = requestAnimationFrame(animate);
    return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current); };
  }, [inputs]);

  const handleRequestQuote = () => {
    if (!validateArea(areaInput)) return;
    navigate('/quote', {
      state: {
        estimatedPrice: calculatePrice(),
        dataType: dataTypePricing[inputs.dataType as keyof typeof dataTypePricing].name,
        coverageArea: inputs.coverageArea,
        frequency: frequencyMultipliers[inputs.frequency as keyof typeof frequencyMultipliers].name,
        urgency: urgencyMultipliers[inputs.urgency].name,
        collection: collectionMultipliers[inputs.collection].name,
        resolution: resolutionMultipliers[inputs.resolution].name,
        maxCloud: inputs.maxCloud,
      }
    });
  };

  const breakdown = getBreakdown();

  const MultiplierBadge = ({ m }: { m: number | null }) => {
    if (m === null) return null;
    if (m > 1) return <Badge variant="destructive" className="text-xs gap-1"><TrendingUp className="h-3 w-3" />+{((m - 1) * 100).toFixed(0)}%</Badge>;
    if (m < 1) return <Badge className="text-xs gap-1 bg-green-600 hover:bg-green-700"><TrendingDown className="h-3 w-3" />-{((1 - m) * 100).toFixed(0)}%</Badge>;
    return <Badge variant="secondary" className="text-xs gap-1"><Minus className="h-3 w-3" />0%</Badge>;
  };

  return (
    <Card className="w-full max-w-2xl mx-auto bg-card/50 backdrop-blur border-border">
      <CardHeader>
        <CardTitle className="text-2xl">Pricing Calculator</CardTitle>
        <CardDescription>
          Estimate your costs based on data type, coverage area, and frequency
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="data-type">Data Type</Label>
          <Select
            value={inputs.dataType}
            onValueChange={(value) => setInputs({ ...inputs, dataType: value })}
          >
            <SelectTrigger id="data-type">
              <SelectValue placeholder="Select data type" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(dataTypePricing).map(([key, value]) => (
                <SelectItem key={key} value={key}>
                  {value.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="collection">Collection Type</Label>
            <Select
              value={inputs.collection}
              onValueChange={(value: PricingInputs['collection']) => setInputs({ ...inputs, collection: value })}
            >
              <SelectTrigger id="collection">
                <SelectValue placeholder="Select collection type" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(collectionMultipliers).map(([key, value]) => (
                  <SelectItem key={key} value={key}>
                    {value.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="urgency">Urgency</Label>
            <Select
              value={inputs.urgency}
              onValueChange={(value: PricingInputs['urgency']) => setInputs({ ...inputs, urgency: value })}
            >
              <SelectTrigger id="urgency">
                <SelectValue placeholder="Select urgency" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(urgencyMultipliers).map(([key, value]) => (
                  <SelectItem key={key} value={key}>
                    {value.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="coverage-area">Coverage Area (sq km)</Label>
          <div className="flex gap-3 items-center">
            <Input
              id="coverage-area"
              type="number"
              min={1}
              max={10000}
              value={areaInput}
              onChange={(e) => handleAreaChange(e.target.value)}
              className={areaError ? "border-destructive focus-visible:ring-destructive" : ""}
            />
            <Slider
              min={1}
              max={10000}
              step={10}
              value={[inputs.coverageArea]}
              onValueChange={(value) => { setAreaInput(String(value[0])); setInputs({ ...inputs, coverageArea: value[0] }); setAreaError(""); }}
              className="w-full"
            />
          </div>
          {areaError
            ? <p className="text-xs text-destructive">{areaError}</p>
            : <div className="flex justify-between text-xs text-muted-foreground"><span>1 sq km</span><span>10,000 sq km</span></div>
          }
        </div>

        <div className="space-y-2">
          <Label htmlFor="frequency">Frequency</Label>
          <Select
            value={inputs.frequency}
            onValueChange={(value) => setInputs({ ...inputs, frequency: value })}
          >
            <SelectTrigger id="frequency">
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(frequencyMultipliers).map(([key, value]) => (
                <SelectItem key={key} value={key}>
                  {value.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="resolution">Resolution</Label>
            <Select
              value={inputs.resolution}
              onValueChange={(value: PricingInputs['resolution']) => setInputs({ ...inputs, resolution: value })}
            >
              <SelectTrigger id="resolution">
                <SelectValue placeholder="Select resolution" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(resolutionMultipliers).map(([key, value]) => (
                  <SelectItem key={key} value={key}>
                    {value.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="max-cloud">
              Max Cloud Coverage: {inputs.maxCloud}%
            </Label>
            <Slider
              id="max-cloud"
              min={0}
              max={100}
              step={5}
              value={[inputs.maxCloud]}
              onValueChange={(value) => setInputs({ ...inputs, maxCloud: value[0] })}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Clear (0%)</span>
              <span>Flexible (100%)</span>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-border space-y-4">
          {/* Price breakdown */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Price Breakdown</p>
            {breakdown.map((item) => (
              <div key={item.label} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{item.label}</span>
                <div className="flex items-center gap-2">
                  {item.multiplier === null
                    ? <span className="font-medium">${item.value.toFixed(2)}</span>
                    : <MultiplierBadge m={item.multiplier} />
                  }
                </div>
              </div>
            ))}
          </div>

          {/* Animated total */}
          <div className="flex items-center justify-between pt-3 border-t border-border">
            <span className="text-lg font-medium">Estimated Price:</span>
            <span className="text-3xl font-bold text-primary tabular-nums">
              ${displayPrice.toFixed(2)}
            </span>
          </div>

          <p className="text-sm text-muted-foreground">
            {inputs.frequency !== "one-time" && "per " + frequencyMultipliers[inputs.frequency as keyof typeof frequencyMultipliers].name.toLowerCase()}
          </p>
          <p className="text-xs text-muted-foreground border border-border rounded-md px-3 py-2 bg-muted/30">
            <span className="font-medium text-foreground">Estimate Only.</span> This figure is indicative and does not constitute a binding offer or contract. Final pricing is subject to satellite provider availability, licensing terms, tasking windows, area-of-interest complexity, and applicable service agreements. Contact our sales team for a formal quotation.
          </p>
          <Button className="w-full" size="lg" onClick={handleRequestQuote} disabled={!!areaError}>
            Request Quote
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PricingCalculator;
