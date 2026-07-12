import { roundDistanceKm } from "@/lib/distance-format";

export type LoadSizeKey =
  | "studio"
  | "1-bedroom"
  | "2-bedroom"
  | "3-bedroom"
  | "4-bedroom"
  | "office";

export type LoadSizeOption = {
  key: LoadSizeKey;
  label: string;
  description: string;
  baseFee: number; // flat handling fee
  hourlyRate: number; // labour rate
  estHours: number; // estimated labour hours
  movers: number;
};

export type DistancePricingBand = {
  label: string;
  startKm: number;
  endKm: number | null;
  rate: number;
};

export type AppliedDistanceBand = {
  label: string;
  rate: number;
  distanceKm: number;
  cost: number;
};

export const LOAD_SIZES: LoadSizeOption[] = [
  {
    key: "studio",
    label: "Studio / Small Load",
    description: "A few boxes, studio apartment or single room.",
    baseFee: 120,
    hourlyRate: 110,
    estHours: 2,
    movers: 2,
  },
  {
    key: "1-bedroom",
    label: "1 Bedroom",
    description: "1 bedroom apartment or condo.",
    baseFee: 150,
    hourlyRate: 130,
    estHours: 3,
    movers: 2,
  },
  {
    key: "2-bedroom",
    label: "2 Bedroom",
    description: "2 bedroom apartment or small house.",
    baseFee: 190,
    hourlyRate: 160,
    estHours: 4,
    movers: 3,
  },
  {
    key: "3-bedroom",
    label: "3 Bedroom",
    description: "3 bedroom house with full furnishings.",
    baseFee: 240,
    hourlyRate: 190,
    estHours: 6,
    movers: 3,
  },
  {
    key: "4-bedroom",
    label: "4+ Bedroom",
    description: "Large home, 4+ bedrooms.",
    baseFee: 320,
    hourlyRate: 240,
    estHours: 8,
    movers: 4,
  },
  {
    key: "office",
    label: "Office / Commercial",
    description: "Office or commercial relocation.",
    baseFee: 350,
    hourlyRate: 260,
    estHours: 7,
    movers: 4,
  },
];

export const HST_RATE = 0.13; // Ontario HST
export const FRAGILE_ITEM_SURCHARGE = 14;
export const HEAVY_ITEM_SURCHARGE = 35;
export const STAIR_FLIGHT_SURCHARGE = 18;
export const PACKING_HELP_SURCHARGE = 140;
export const ASSEMBLY_HELP_SURCHARGE = 95;
export const CARRY_FLOOR_SURCHARGE = 16;
export const ELEVATOR_FLOOR_SURCHARGE = 7;
export const DISTANCE_PRICING_BANDS: DistancePricingBand[] = [
  { label: "1-5 km", startKm: 0, endKm: 5, rate: 45 },
  { label: "5-15 km", startKm: 5, endKm: 15, rate: 35 },
  { label: "15-50 km", startKm: 15, endKm: 50, rate: 25 },
  { label: "Over 50 km", startKm: 50, endKm: null, rate: 15 },
];

export type LongCarryKey = "standard" | "medium" | "long";
export type BuildingTypeKey = "house-ground" | "condo" | "story-building";

export const LONG_CARRY_OPTIONS: Array<{
  key: LongCarryKey;
  label: string;
  description: string;
  surcharge: number;
}> = [
  {
    key: "standard",
    label: "Standard access",
    description: "Normal curb-to-door access with a short walking distance.",
    surcharge: 0,
  },
  {
    key: "medium",
    label: "Medium long carry",
    description: "Some extra walking distance from truck to entrance.",
    surcharge: 45,
  },
  {
    key: "long",
    label: "Long carry",
    description: "A long carry or difficult access that adds extra handling time.",
    surcharge: 90,
  },
];

export const BUILDING_TYPE_OPTIONS: Array<{
  key: BuildingTypeKey;
  label: string;
  description: string;
  surcharge: number;
}> = [
  {
    key: "house-ground",
    label: "House / ground-level access",
    description: "A standard home or ground-level move with simpler pickup access.",
    surcharge: 0,
  },
  {
    key: "condo",
    label: "Condo / apartment",
    description: "Condo or apartment access that may involve elevators, booking windows, or loading rules.",
    surcharge: 32,
  },
  {
    key: "story-building",
    label: "Story building / walk-up",
    description: "A multi-storey building or walk-up with more complicated carrying conditions.",
    surcharge: 48,
  },
];

export type PriceBreakdown = {
  loadLabel: string;
  baseFee: number;
  labour: number;
  movers: number;
  estHours: number;
  hourlyRate: number;
  billableKm: number;
  travelCost: number;
  travelBands: AppliedDistanceBand[];
  subtotal: number;
  hst: number;
  total: number;
};

export type DetailedQuoteOptions = {
  fragileItems: number;
  heavyItems: number;
  stairFlights: number;
  elevatorAccess: boolean;
  packingHelp: boolean;
  assemblyHelp: boolean;
  longCarry: LongCarryKey;
  buildingType: BuildingTypeKey;
  carryFloor: number;
};

type DetailedQuoteOptionsInput = Partial<Omit<DetailedQuoteOptions, "longCarry" | "buildingType">> & {
  longCarry?: string | null;
  buildingType?: string | null;
};

export type QuoteAdjustment = {
  label: string;
  amount: number;
};

export type DetailedPriceBreakdown = PriceBreakdown & {
  adjustments: QuoteAdjustment[];
  adjustmentsTotal: number;
};

function roundMoney(amount: number) {
  return Math.round(amount * 100) / 100;
}

function normalizeCount(value: unknown) {
  return Math.max(0, Math.round(Number(value) || 0));
}

export function normalizeLongCarry(value: string | null | undefined): LongCarryKey {
  return LONG_CARRY_OPTIONS.some((option) => option.key === value) ? (value as LongCarryKey) : "standard";
}

export function getLongCarryLabel(value: string | null | undefined) {
  return LONG_CARRY_OPTIONS.find((option) => option.key === normalizeLongCarry(value))?.label ?? "Standard access";
}

export function normalizeBuildingType(value: string | null | undefined): BuildingTypeKey {
  return BUILDING_TYPE_OPTIONS.some((option) => option.key === value)
    ? (value as BuildingTypeKey)
    : "house-ground";
}

export function getBuildingTypeLabel(value: string | null | undefined) {
  return (
    BUILDING_TYPE_OPTIONS.find((option) => option.key === normalizeBuildingType(value))?.label ??
    "House / ground-level access"
  );
}

export function normalizeDetailedQuoteOptions(input: DetailedQuoteOptionsInput | null | undefined): DetailedQuoteOptions {
  return {
    fragileItems: normalizeCount(input?.fragileItems),
    heavyItems: normalizeCount(input?.heavyItems),
    stairFlights: normalizeCount(input?.stairFlights),
    elevatorAccess: Boolean(input?.elevatorAccess),
    packingHelp: Boolean(input?.packingHelp),
    assemblyHelp: Boolean(input?.assemblyHelp),
    longCarry: normalizeLongCarry(input?.longCarry),
    buildingType: normalizeBuildingType(input?.buildingType),
    carryFloor: normalizeCount(input?.carryFloor),
  };
}

export function calculatePrice(loadKey: string, distanceKm: number): PriceBreakdown | null {
  const load = LOAD_SIZES.find((l) => l.key === loadKey);
  if (!load) return null;

  const km = roundDistanceKm(distanceKm || 0);
  const billableKm = km;
  const travelBands = DISTANCE_PRICING_BANDS.reduce<AppliedDistanceBand[]>((bands, band) => {
    const upperBound = band.endKm ?? Number.POSITIVE_INFINITY;
    const bandDistance = roundDistanceKm(Math.max(0, Math.min(km, upperBound) - band.startKm));
    if (bandDistance <= 0) {
      return bands;
    }

    bands.push({
      label: band.label,
      rate: band.rate,
      distanceKm: bandDistance,
      cost: roundMoney(bandDistance * band.rate),
    });

    return bands;
  }, []);
  const travelCost = roundMoney(travelBands.reduce((sum, band) => sum + band.cost, 0));
  const labour = roundMoney(load.hourlyRate * load.estHours);
  const subtotal = roundMoney(load.baseFee + labour + travelCost);
  const hst = roundMoney(subtotal * HST_RATE);
  const total = roundMoney(subtotal + hst);

  return {
    loadLabel: load.label,
    baseFee: load.baseFee,
    labour,
    movers: load.movers,
    estHours: load.estHours,
    hourlyRate: load.hourlyRate,
    billableKm,
    travelCost,
    travelBands,
    subtotal,
    hst,
    total,
  };
}

export function calculateDetailedPrice(
  loadKey: string,
  distanceKm: number,
  optionsInput?: DetailedQuoteOptionsInput | null,
): DetailedPriceBreakdown | null {
  const baseQuote = calculatePrice(loadKey, distanceKm);
  if (!baseQuote) return null;

  const options = normalizeDetailedQuoteOptions(optionsInput);
  const longCarry = LONG_CARRY_OPTIONS.find((option) => option.key === options.longCarry) ?? LONG_CARRY_OPTIONS[0];
  const buildingType =
    BUILDING_TYPE_OPTIONS.find((option) => option.key === options.buildingType) ?? BUILDING_TYPE_OPTIONS[0];
  const adjustments: QuoteAdjustment[] = [];

  if (options.fragileItems > 0) {
    adjustments.push({
      label: `Fragile handling (${options.fragileItems} item${options.fragileItems === 1 ? "" : "s"})`,
      amount: roundMoney(options.fragileItems * FRAGILE_ITEM_SURCHARGE),
    });
  }

  if (options.heavyItems > 0) {
    adjustments.push({
      label: `Heavy / oversized pieces (${options.heavyItems})`,
      amount: roundMoney(options.heavyItems * HEAVY_ITEM_SURCHARGE),
    });
  }

  if (options.stairFlights > 0) {
    adjustments.push({
      label: `Stair access (${options.stairFlights} flight${options.stairFlights === 1 ? "" : "s"})`,
      amount: roundMoney(options.stairFlights * STAIR_FLIGHT_SURCHARGE),
    });
  }

  if (longCarry.surcharge > 0) {
    adjustments.push({
      label: longCarry.label,
      amount: roundMoney(longCarry.surcharge),
    });
  }

  if (buildingType.surcharge > 0) {
    adjustments.push({
      label: buildingType.label,
      amount: roundMoney(buildingType.surcharge),
    });
  }

  if (options.carryFloor > 0) {
    const perFloorRate = options.elevatorAccess ? ELEVATOR_FLOOR_SURCHARGE : CARRY_FLOOR_SURCHARGE;
    adjustments.push({
      label: options.elevatorAccess
        ? `Pickup floor ${options.carryFloor} (elevator assisted)`
        : `Pickup floor ${options.carryFloor}`,
      amount: roundMoney(options.carryFloor * perFloorRate),
    });
  }

  if (options.packingHelp) {
    adjustments.push({
      label: "Packing assistance",
      amount: roundMoney(PACKING_HELP_SURCHARGE),
    });
  }

  if (options.assemblyHelp) {
    adjustments.push({
      label: "Furniture assembly help",
      amount: roundMoney(ASSEMBLY_HELP_SURCHARGE),
    });
  }

  const adjustmentsTotal = roundMoney(adjustments.reduce((sum, adjustment) => sum + adjustment.amount, 0));
  const subtotal = roundMoney(baseQuote.subtotal + adjustmentsTotal);
  const hst = roundMoney(subtotal * HST_RATE);
  const total = roundMoney(subtotal + hst);

  return {
    ...baseQuote,
    adjustments,
    adjustmentsTotal,
    subtotal,
    hst,
    total,
  };
}

export function formatCAD(amount: number): string {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
  }).format(amount);
}
