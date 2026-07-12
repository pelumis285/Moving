import { site } from "@/lib/site";
import { roundDistanceKm } from "@/lib/distance-format";

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

export type AddressSuggestion = {
  label: string;
  value: string;
};

type PhotonFeature = {
  properties?: {
    housenumber?: string;
    street?: string;
    city?: string;
    county?: string;
    state?: string;
    country?: string;
    postcode?: string;
    name?: string;
  };
};

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const OSRM_ROUTE_URL = "https://router.project-osrm.org/route/v1/driving";
const PHOTON_URL = "https://photon.komoot.io/api";
const DISTANCE_USER_AGENT = `${site.name}/1.0 (${site.url}; contact: ${site.operationsEmail})`;
const CANADIAN_POSTAL_CODE_PATTERN = /\b[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z][ -]?\d[ABCEGHJ-NPRSTV-Z]\d\b/i;
const CANADIAN_PROVINCE_PATTERN = /\b(AB|BC|MB|NB|NL|NS|NT|NU|ON|PE|QC|SK|YT)\b/i;
const ONTARIO_SERVICE_AREA_SUFFIX = "Ontario, Canada";
const COMMON_ADDRESS_REPLACEMENTS: Array<[RegExp, string]> = [
  [/\bcresent\b/gi, "crescent"],
  [/\bcrecent\b/gi, "crescent"],
  [/\bcres\b/gi, "crescent"],
];
const STREET_SUFFIXES = new Set([
  "ALLEY",
  "AVE",
  "AVENUE",
  "BLVD",
  "BOULEVARD",
  "CIR",
  "CIRCLE",
  "COURT",
  "CRT",
  "CRES",
  "CRESCENT",
  "DR",
  "DRIVE",
  "HWY",
  "LANE",
  "LN",
  "PARKWAY",
  "PATH",
  "PLACE",
  "PL",
  "RD",
  "ROAD",
  "SQ",
  "ST",
  "STREET",
  "TER",
  "TERRACE",
  "TRAIL",
  "WAY",
]);
const DIRECTIONAL_TOKENS = new Set(["N", "S", "E", "W", "NE", "NW", "SE", "SW", "NORTH", "SOUTH", "EAST", "WEST"]);

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
  let normalized = value
    .trim()
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .replace(/\s+,/g, ",")
    .replace(/,\s*/g, ", ")
    .trim();

  for (const [pattern, replacement] of COMMON_ADDRESS_REPLACEMENTS) {
    normalized = normalized.replace(pattern, replacement);
  }

  return normalized;
}

function createPairKey(origin: string, destination: string) {
  return `${normalizeAddress(origin).toLowerCase()} -> ${normalizeAddress(destination).toLowerCase()}`;
}

function stripTrailingPunctuation(value: string) {
  return value.replace(/[.,]+$/g, "");
}

function looksCanadianAddress(address: string) {
  return CANADIAN_PROVINCE_PATTERN.test(address) || CANADIAN_POSTAL_CODE_PATTERN.test(address) || /\bCanada\b/i.test(address);
}

function addCountrySuffix(address: string) {
  if (!address || /\bCanada\b/i.test(address)) {
    return address;
  }

  return `${address}, Canada`;
}

function addOntarioServiceAreaSuffix(address: string) {
  if (!address || looksCanadianAddress(address) || /\bOntario\b/i.test(address)) {
    return address;
  }

  return `${address}, ${ONTARIO_SERVICE_AREA_SUFFIX}`;
}

function stripCanadianPostalCode(address: string) {
  return address
    .replace(CANADIAN_POSTAL_CODE_PATTERN, "")
    .replace(/\s+,/g, ",")
    .replace(/,\s*,/g, ", ")
    .replace(/\s{2,}/g, " ")
    .replace(/[,\s]+$/g, "")
    .trim();
}

function stripStandaloneHouseLetter(address: string) {
  return address.replace(/^(\d+)\s+[A-Z]\s+(?=[A-Za-z])/i, "$1 ");
}

function repairCanadianStreetCitySeparation(address: string) {
  const provinceMatch = CANADIAN_PROVINCE_PATTERN.exec(address);
  const provinceIndex = provinceMatch?.index ?? -1;
  if (provinceIndex <= 0) {
    return address;
  }

  const beforeProvince = address.slice(0, provinceIndex).replace(/,\s*$/g, "").trim();
  if (!beforeProvince || beforeProvince.includes(",")) {
    return address;
  }

  const tokens = beforeProvince.split(/\s+/);
  let suffixIndex = -1;

  for (let index = tokens.length - 1; index >= 0; index -= 1) {
    if (STREET_SUFFIXES.has(stripTrailingPunctuation(tokens[index]).toUpperCase())) {
      suffixIndex = index;
      break;
    }
  }

  if (suffixIndex === -1 || suffixIndex === tokens.length - 1) {
    return address;
  }

  let cityStartIndex = suffixIndex + 1;
  while (cityStartIndex < tokens.length && DIRECTIONAL_TOKENS.has(stripTrailingPunctuation(tokens[cityStartIndex]).toUpperCase())) {
    cityStartIndex += 1;
  }

  if (cityStartIndex >= tokens.length) {
    return address;
  }

  const streetPart = tokens.slice(0, cityStartIndex).join(" ");
  const cityPart = tokens.slice(cityStartIndex).join(" ");
  const afterStreet = address.slice(provinceIndex).replace(/^,\s*/g, "").trim();

  return `${streetPart}, ${cityPart}, ${afterStreet}`.replace(/\s{2,}/g, " ").trim();
}

function buildAddressCandidates(address: string) {
  const normalized = normalizeAddress(address);
  const repaired = repairCanadianStreetCitySeparation(normalized);
  const noPostal = stripCanadianPostalCode(repaired);
  const simplifiedHouse = stripStandaloneHouseLetter(noPostal);
  const baseCandidates = [normalized, repaired, simplifiedHouse, noPostal];
  const regionalCandidates = [
    addOntarioServiceAreaSuffix(repaired),
    addCountrySuffix(repaired),
    addOntarioServiceAreaSuffix(simplifiedHouse),
    addCountrySuffix(simplifiedHouse),
    addOntarioServiceAreaSuffix(noPostal),
    addCountrySuffix(noPostal),
  ];
  const candidates = looksCanadianAddress(normalized)
    ? [...baseCandidates, ...regionalCandidates]
    : [...regionalCandidates, ...baseCandidates];

  return [...new Set(candidates.map((candidate) => candidate.trim()).filter(Boolean))];
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

  for (const candidate of buildAddressCandidates(address)) {
    if (cache.has(candidate)) {
      const cachedCoordinates = cache.get(candidate) ?? null;
      if (cachedCoordinates) {
        cache.set(normalized, cachedCoordinates);
        return cachedCoordinates;
      }

      continue;
    }

    const params = new URLSearchParams({
      q: candidate,
      format: "jsonv2",
      limit: "1",
      email: site.operationsEmail,
    });

    params.set("countrycodes", "ca");

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
      cache.set(candidate, null);
      continue;
    }

    const coordinates = {
      lat: Number(first.lat),
      lon: Number(first.lon),
      label: first.display_name || candidate,
    };

    if (!Number.isFinite(coordinates.lat) || !Number.isFinite(coordinates.lon)) {
      cache.set(candidate, null);
      continue;
    }

    cache.set(candidate, coordinates);
    cache.set(normalized, coordinates);
    return coordinates;
  }

  cache.set(normalized, null);
  return null;
}

export async function suggestAddresses(query: string): Promise<AddressSuggestion[]> {
  const normalized = normalizeAddress(query);
  if (normalized.length < 2) {
    return [];
  }

  const normalizedWithoutPostal = stripCanadianPostalCode(normalized);
  const normalizedWithoutUnitLetter = stripStandaloneHouseLetter(normalizedWithoutPostal);
  const suggestionQuery = looksCanadianAddress(normalizedWithoutUnitLetter)
    ? normalizedWithoutUnitLetter
    : addOntarioServiceAreaSuffix(normalizedWithoutUnitLetter);

  const params = new URLSearchParams({
    q: suggestionQuery,
    limit: "8",
    lang: "en",
  });
  const response = await fetch(`${PHOTON_URL}?${params.toString()}`, {
    headers: {
      "User-Agent": DISTANCE_USER_AGENT,
    },
  });

  if (!response.ok) {
    throw new Error(`Suggestion service responded ${response.status}`);
  }

  const payload = (await response.json()) as { features?: PhotonFeature[] };
  const normalizedQuery = normalized.toLowerCase();
  const uniqueSuggestions = new Map<string, { suggestion: AddressSuggestion; score: number }>();

  function buildSuggestionLabel(feature: PhotonFeature) {
    const properties = feature.properties ?? {};
    const line1 = [properties.housenumber, properties.street ?? properties.name].filter(Boolean).join(" ").trim();
    return [line1 || properties.name, properties.city, properties.county, properties.state, properties.postcode, properties.country]
      .filter(Boolean)
      .join(", ")
      .replace(/\s{2,}/g, " ")
      .trim();
  }

  function scoreSuggestion(feature: PhotonFeature, label: string) {
    const properties = feature.properties ?? {};
    let score = 0;

    if ((properties.country ?? "").toLowerCase() === "canada") score += 20;
    if ((properties.state ?? "").toLowerCase() === "ontario") score += 30;
    if ((properties.city ?? "").toLowerCase() === "barrie") score += 10;
    if (label.toLowerCase().includes(normalizedQuery)) score += 10;
    if ((properties.street ?? "").toLowerCase().includes(normalizedQuery)) score += 5;
    if ((properties.name ?? "").toLowerCase().includes(normalizedQuery)) score += 3;

    return score;
  }

  for (const feature of payload.features ?? []) {
    const label = buildSuggestionLabel(feature);
    if (!label) {
      continue;
    }

    const score = scoreSuggestion(feature, label);
    const existing = uniqueSuggestions.get(label);

    if (!existing || score > existing.score) {
      uniqueSuggestions.set(label, {
        suggestion: {
          label,
          value: label,
        },
        score,
      });
    }
  }

  return [...uniqueSuggestions.values()]
    .sort((a, b) => b.score - a.score || a.suggestion.label.localeCompare(b.suggestion.label))
    .slice(0, 5)
    .map((entry) => entry.suggestion);
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

  return roundDistanceKm((meters ?? 0) / 1000);
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
    const straightLineDistance = roundDistanceKm(calculateStraightLineDistanceKm(originCoordinates, destinationCoordinates));
    const estimate = { distanceKm: straightLineDistance, source: "straight-line" as const };
    cache.set(pairKey, estimate);
    return estimate;
  }
}
