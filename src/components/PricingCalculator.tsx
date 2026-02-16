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

const PricingCalculator = () => {
  const navigate = useNavigate();
  const [inputs, setInputs] = useState<PricingInputs>({
    dataType: "commercial-imagery",
    coverageArea: 100,
    frequency: "one-time",
  });

  const calculatePrice = (): number => {
    const dataType = dataTypePricing[inputs.dataType as keyof typeof dataTypePricing];
    const frequency = frequencyMultipliers[inputs.frequency as keyof typeof frequencyMultipliers];
    
    if (!dataType || !frequency) return 0;
    
    const basePrice = dataType.base + (dataType.perSqKm * inputs.coverageArea);
    const finalPrice = basePrice * frequency.multiplier;
    
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
          <p className="text-sm text-muted-foreground mb-4">
            {inputs.frequency !== "one-time" && "per " + frequencyMultipliers[inputs.frequency as keyof typeof frequencyMultipliers].name.toLowerCase()}
          </p>
          <Button className="w-full" size="lg" onClick={handleRequestQuote}>
            Request Quote
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PricingCalculator;
