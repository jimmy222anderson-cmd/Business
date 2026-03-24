import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

interface PricingInputs {
  dataType: string;
  coverageArea: number; // in sq km
  frequency: string;
  urgency: 'standard' | 'urgent' | 'emergency';
  collection: 'archive' | 'tasking';
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
  });

  const calculatePrice = (): number => {
    const dataType = dataTypePricing[inputs.dataType as keyof typeof dataTypePricing];
    const frequency = frequencyMultipliers[inputs.frequency as keyof typeof frequencyMultipliers];
    const urgency = urgencyMultipliers[inputs.urgency];
    const collection = collectionMultipliers[inputs.collection];
    
    if (!dataType || !frequency || !urgency || !collection) return 0;
    
    const basePrice = dataType.base + (dataType.perSqKm * inputs.coverageArea);
    const finalPrice = basePrice * frequency.multiplier * urgency.multiplier * collection.multiplier;
    
    return Math.max(0, finalPrice);
  };

  const handleRequestQuote = () => {
    // Navigate to quote request page with calculator data
    navigate('/quote', {
      state: {
        estimatedPrice: calculatePrice(),
        dataType: dataTypePricing[inputs.dataType as keyof typeof dataTypePricing].name,
        coverageArea: inputs.coverageArea,
        frequency: frequencyMultipliers[inputs.frequency as keyof typeof frequencyMultipliers].name,
        urgency: urgencyMultipliers[inputs.urgency].name,
        collection: collectionMultipliers[inputs.collection].name,
      }
    });
  };

  const price = calculatePrice();

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
          <Label htmlFor="coverage-area">
            Coverage Area: {inputs.coverageArea} sq km
          </Label>
          <Slider
            id="coverage-area"
            min={10}
            max={10000}
            step={10}
            value={[inputs.coverageArea]}
            onValueChange={(value) => setInputs({ ...inputs, coverageArea: value[0] })}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>10 sq km</span>
            <span>10,000 sq km</span>
          </div>
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

        <div className="pt-6 border-t border-border">
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg font-medium">Estimated Price:</span>
            <span className="text-3xl font-bold text-primary">
              ${price.toFixed(2)}
            </span>
          </div>
          <div className="space-y-2 mb-4">
            <p className="text-sm text-muted-foreground">
              {inputs.frequency !== "one-time" && "per " + frequencyMultipliers[inputs.frequency as keyof typeof frequencyMultipliers].name.toLowerCase()}
            </p>
            <p className="text-xs text-muted-foreground">
              This is a non-binding estimate for planning purposes. Final pricing may vary based on provider quotes, availability, licensing, tasking windows, and your specific requirements.
            </p>
          </div>
          <Button className="w-full" size="lg" onClick={handleRequestQuote}>
            Request Quote
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PricingCalculator;
