// Shared pricing logic used by PricingCalculator and ExplorerPage

export const BASE_PRICING = {
  "commercial-imagery": { base: 5, perSqKm: 0.5 },
  "open-data": { base: 0, perSqKm: 0 },
  "analytics": { base: 10, perSqKm: 1.2 },
  "ais-data": { base: 3, perSqKm: 0.3 },
};

export const RESOLUTION_MULTIPLIERS: Record<string, number> = {
  vhr: 1.5,
  high: 1.2,
  medium: 1.0,
  low: 0.8,
};

export const URGENCY_MULTIPLIERS: Record<string, number> = {
  standard: 1.0,
  urgent: 1.25,
  emergency: 1.5,
};

export const COLLECTION_MULTIPLIERS = {
  archive: 1.0,
  tasking: 1.4,
};

export function cloudMultiplier(maxCloud: number): number {
  if (maxCloud <= 10) return 1.3;
  if (maxCloud <= 20) return 1.2;
  if (maxCloud <= 30) return 1.1;
  return 1.0;
}

export interface PriceEstimate {
  archive: number;
  tasking: number;
}

export function estimatePrices(params: {
  areaSqKm: number;
  dataType?: string;
  resolution?: string;
  urgency?: string;
  maxCloud?: number;
}): PriceEstimate {
  const { areaSqKm, dataType = "commercial-imagery", resolution = "high", urgency = "standard", maxCloud = 100 } = params;

  const dt = BASE_PRICING[dataType as keyof typeof BASE_PRICING] ?? BASE_PRICING["commercial-imagery"];
  const basePrice = dt.base + dt.perSqKm * areaSqKm;
  const resMult = RESOLUTION_MULTIPLIERS[resolution] ?? 1.0;
  const urgMult = URGENCY_MULTIPLIERS[urgency] ?? 1.0;
  const cloudMult = cloudMultiplier(maxCloud);

  const shared = basePrice * resMult * urgMult * cloudMult;

  return {
    archive: Math.max(0, shared * COLLECTION_MULTIPLIERS.archive),
    tasking: Math.max(0, shared * COLLECTION_MULTIPLIERS.tasking),
  };
}
