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

export const PER_KM_RATE = 1.85; // fuel + travel per km
export const FREE_KM = 25; // first 25 km included
export const HST_RATE = 0.13; // Ontario HST

export type PriceBreakdown = {
  loadLabel: string;
  baseFee: number;
  labour: number;
  movers: number;
  estHours: number;
  hourlyRate: number;
  billableKm: number;
  travelCost: number;
  subtotal: number;
  hst: number;
  total: number;
};

export function calculatePrice(loadKey: string, distanceKm: number): PriceBreakdown | null {
  const load = LOAD_SIZES.find((l) => l.key === loadKey);
  if (!load) return null;

  const km = Math.max(0, Math.round(distanceKm || 0));
  const billableKm = Math.max(0, km - FREE_KM);
  const travelCost = +(billableKm * PER_KM_RATE).toFixed(2);
  const labour = +(load.hourlyRate * load.estHours).toFixed(2);
  const subtotal = +(load.baseFee + labour + travelCost).toFixed(2);
  const hst = +(subtotal * HST_RATE).toFixed(2);
  const total = +(subtotal + hst).toFixed(2);

  return {
    loadLabel: load.label,
    baseFee: load.baseFee,
    labour,
    movers: load.movers,
    estHours: load.estHours,
    hourlyRate: load.hourlyRate,
    billableKm,
    travelCost,
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
