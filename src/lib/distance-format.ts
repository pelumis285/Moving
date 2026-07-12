const DISTANCE_DECIMAL_PLACES = 3;

export function roundDistanceKm(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  const normalized = Math.max(0, value);
  const factor = 10 ** DISTANCE_DECIMAL_PLACES;
  return Math.round(normalized * factor) / factor;
}

export function parseDistanceKm(value: unknown) {
  if (value == null || value === "") {
    return null;
  }

  const numericValue = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numericValue)) {
    return null;
  }

  return roundDistanceKm(numericValue);
}

export function formatDistanceKm(
  value: number | null | undefined,
  options?: {
    withUnit?: boolean;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  },
) {
  const formatted = new Intl.NumberFormat("en-CA", {
    minimumFractionDigits: options?.minimumFractionDigits ?? 0,
    maximumFractionDigits: options?.maximumFractionDigits ?? DISTANCE_DECIMAL_PLACES,
  }).format(roundDistanceKm(Number(value) || 0));

  return options?.withUnit === false ? formatted : `${formatted} km`;
}
