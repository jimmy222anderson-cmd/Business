import { Check, X } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface PlanFeature {
  name: string;
  starter: boolean | string;
  professional: boolean | string;
  enterprise: boolean | string;
}

const plans = [
  {
    name: "Starter",
    price: "$99",
    period: "per month",
    description: "Perfect for small projects and testing",
    highlighted: false,
  },
  {
    name: "Professional",
    price: "$499",
    period: "per month",
    description: "For growing businesses and regular use",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "contact us",
    description: "Tailored solutions for large organizations",
    highlighted: false,
  },
];

const features: PlanFeature[] = [
  {
    name: "Coverage Area",
    starter: "Up to 1,000 sq km",
    professional: "Up to 10,000 sq km",
    enterprise: "Unlimited",
  },
  {
    name: "Data Types",
    starter: "Open Data only",
    professional: "All data types",
    enterprise: "All data types + Custom",
  },
  {
    name: "API Access",
    starter: true,
    professional: true,
    enterprise: true,
  },
  {
    name: "Historical Data",
    starter: "6 months",
    professional: "2 years",
    enterprise: "Full archive",
  },
  {
    name: "Support",
    starter: "Email",
    professional: "Priority email + Chat",
    enterprise: "24/7 Dedicated support",
  },
  {
    name: "Custom Analytics",
    starter: false,
    professional: true,
    enterprise: true,
  },
  {
    name: "White-label Options",
    starter: false,
    professional: false,
    enterprise: true,
  },
  {
    name: "SLA Guarantee",
    starter: false,
    professional: "99.5%",
    enterprise: "99.9%",
  },
];

const FeatureCell = ({ value }: { value: boolean | string }) => {
  if (typeof value === "boolean") {
    return value ? (
      <Check className="h-5 w-5 text-green-500 mx-auto" />
    ) : (
      <X className="h-5 w-5 text-muted-foreground mx-auto" />
    );
  }
  return <span className="text-sm text-center block">{value}</span>;
};

const PlanComparison = () => {
  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={`relative ${
              plan.highlighted
                ? "border-primary shadow-lg scale-105"
                : "border-border"
            }`}
          >
            {plan.highlighted && (
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                Most Popular
              </Badge>
            )}
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              <div className="pt-4">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground ml-2">
                  {plan.period}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full"
                variant={plan.highlighted ? "default" : "outline"}
                asChild
              >
                {plan.name === "Enterprise" ? (
                  <Link to="/contact">Contact Sales</Link>
                ) : (
                  <Link to="/demo">Get Started</Link>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Feature Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle>Feature Comparison</CardTitle>
          <CardDescription>
            Compare features across all plans
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium">Feature</th>
                  <th className="text-center py-3 px-4 font-medium">Starter</th>
                  <th className="text-center py-3 px-4 font-medium">
                    Professional
                  </th>
                  <th className="text-center py-3 px-4 font-medium">
                    Enterprise
                  </th>
                </tr>
              </thead>
              <tbody>
                {features.map((feature, index) => (
                  <tr
                    key={feature.name}
                    className={`border-b border-border ${
                      index % 2 === 0 ? "bg-muted/20" : ""
                    }`}
                  >
                    <td className="py-3 px-4 font-medium">{feature.name}</td>
                    <td className="py-3 px-4">
                      <FeatureCell value={feature.starter} />
                    </td>
                    <td className="py-3 px-4">
                      <FeatureCell value={feature.professional} />
                    </td>
                    <td className="py-3 px-4">
                      <FeatureCell value={feature.enterprise} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlanComparison;
