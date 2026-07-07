import { site } from "@/lib/site";

type GeocodeResult = {
  lat: string;
  lon: string;
  display_name: string;
};

type Coordinates = {
  lat: number;
  lon: number;
  label: string;
};

export type DistanceEstimate = {
  distanceKm: number;
  source: "route" | "straight-line";
};

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const OSRM_ROUTE_URL = "https://router.project-osrm.org/route/v1/driving";
const DISTANCE_USER_AGENT = `${site.name}/1.0 (${site.url}; contact: ${site.operationsEmail})`;

const globalForDistance = globalThis as typeof globalThis & {
  __surftmoveGeocodeCache?: Map<string, Coordinates | null>;
  __surftmoveDistanceCache?: Map<string, DistanceEstimate | null>;
  __surftmoveLastNominatimRequestAt?: number;
};

function getGeocodeCache() {
  globalForDistance.__surftmoveGeocodeCache ??= new Map<string, Coordinates | null>();
  return globalForDistance.__surftmoveGeocodeCache;
}

function getDistanceCache() {
  globalForDistance.__surftmoveDistanceCache ??= new Map<string, DistanceEstimate | null>();
  return globalForDistance.__surftmoveDistanceCache;
}

function normalizeAddress(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function createPairKey(origin: string, destination: string) {
  return `${normalizeAddress(origin).toLowerCase()} -> ${normalizeAddress(destination).toLowerCase()}`;
}

async function waitForNominatimSlot() {
  const now = Date.now();
  const lastRequestAt = globalForDistance.__surftmoveLastNominatimRequestAt ?? 0;
  const waitMs = Math.max(0, 1100 - (now - lastRequestAt));

  if (waitMs > 0) {
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }

  globalForDistance.__surftmoveLastNominatimRequestAt = Date.now();
}

async function geocodeAddress(address: string) {
  const normalized = normalizeAddress(address);
  const cache = getGeocodeCache();

  if (cache.has(normalized)) {
    return cache.get(normalized) ?? null;
  }

  const params = new URLSearchParams({
    q: normalized,
    format: "jsonv2",
    limit: "1",
    email: site.operationsEmail,
  });

  await waitForNominatimSlot();

  const response = await fetch(`${NOMINATIM_URL}?${params.toString()}`, {
    headers: {
      "User-Agent": DISTANCE_USER_AGENT,
      "Accept-Language": "en-CA,en;q=0.9",
    },
  });

  if (!response.ok) {
    throw new Error(`Geocoder responded ${response.status}`);
  }

  const results = (await response.json()) as GeocodeResult[];
  const first = results[0];

  if (!first?.lat || !first?.lon) {
    cache.set(normalized, null);
    return null;
  }

  const coordinates = {
    lat: Number(first.lat),
    lon: Number(first.lon),
    label: first.display_name || normalized,
  };

  if (!Number.isFinite(coordinates.lat) || !Number.isFinite(coordinates.lon)) {
    cache.set(normalized, null);
    return null;
  }

  cache.set(normalized, coordinates);
  return coordinates;
}

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function calculateStraightLineDistanceKm(origin: Coordinates, destination: Coordinates) {
  const earthRadiusKm = 6371;
  const latDelta = toRadians(destination.lat - origin.lat);
  const lonDelta = toRadians(destination.lon - origin.lon);
  const lat1 = toRadians(origin.lat);
  const lat2 = toRadians(destination.lat);

  const haversine =
    Math.sin(latDelta / 2) * Math.sin(latDelta / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(lonDelta / 2) * Math.sin(lonDelta / 2);

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

async function fetchRouteDistanceKm(origin: Coordinates, destination: Coordinates) {
  const coordinates = `${origin.lon},${origin.lat};${destination.lon},${destination.lat}`;
  const url = `${OSRM_ROUTE_URL}/${coordinates}?overview=false`;
  const response = await fetch(url, {
    headers: {
      "User-Agent": DISTANCE_USER_AGENT,
    },
  });

  if (!response.ok) {
    throw new Error(`Route service responded ${response.status}`);
  }

  const payload = (await response.json()) as {
    code?: string;
    routes?: Array<{ distance?: number }>;
  };

  const meters = payload.routes?.[0]?.distance;
  if (payload.code !== "Ok" || !Number.isFinite(meters)) {
    throw new Error("Route distance unavailable");
  }

  return Math.max(0, Math.round((meters ?? 0) / 1000));
}

export async function estimateDistanceKm(originAddress: string, destinationAddress: string): Promise<DistanceEstimate | null> {
  const origin = normalizeAddress(originAddress);
  const destination = normalizeAddress(destinationAddress);

  if (!origin || !destination) {
    return null;
  }

  const cache = getDistanceCache();
  const pairKey = createPairKey(origin, destination);
  if (cache.has(pairKey)) {
    return cache.get(pairKey) ?? null;
  }

  const originCoordinates = await geocodeAddress(origin);
  const destinationCoordinates = await geocodeAddress(destination);

  if (!originCoordinates || !destinationCoordinates) {
    cache.set(pairKey, null);
    return null;
  }

  try {
    const routeDistance = await fetchRouteDistanceKm(originCoordinates, destinationCoordinates);
    const estimate = { distanceKm: routeDistance, source: "route" as const };
    cache.set(pairKey, estimate);
    return estimate;
  } catch {
    const straightLineDistance = Math.round(calculateStraightLineDistanceKm(originCoordinates, destinationCoordinates));
    const estimate = { distanceKm: Math.max(0, straightLineDistance), source: "straight-line" as const };
    cache.set(pairKey, estimate);
    return estimate;
  }
}
