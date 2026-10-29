import type { Coordinates, Weather } from "./types";

const CACHE_KEY = "dw-weather";
const CACHE_MS = 45 * 60_000;
const TIMEOUT_MS = 5_000;

/** Map a WMO weather code (as returned by Open-Meteo) to a simple condition. */
export function weatherFromCode(code: number): Weather {
  if (code <= 2) return "clear"; // clear, mainly clear, partly cloudy
  if (code === 3) return "cloudy"; // overcast
  if (code === 45 || code === 48) return "fog";
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return "snow";
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82) || code >= 95) return "rain";
  return "unknown";
}

interface Cached {
  at: number;
  key: string;
  weather: Weather;
}

let memory: Cached | null = null;

/**
 * Current weather from Open-Meteo (free, no API key).
 * Coordinates are rounded to 1 decimal (about 10 km) before leaving the browser.
 * Never throws: failures resolve to "unknown" so the theme falls back to time only.
 */
export async function getWeather(
  location: Coordinates,
  fetchImpl: typeof fetch | undefined = globalThis.fetch,
  now = Date.now()
): Promise<Weather> {
  const lat = location.latitude.toFixed(1);
  const lon = location.longitude.toFixed(1);
  const key = `${lat},${lon}`;

  const cached = memory ?? readStorage();
  if (cached && cached.key === key && now - cached.at < CACHE_MS) return cached.weather;
  if (!fetchImpl) return "unknown";

  const controller = typeof AbortController !== "undefined" ? new AbortController() : undefined;
  const timer = setTimeout(() => controller?.abort(), TIMEOUT_MS);
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=weather_code`;
    const res = await fetchImpl(url, { signal: controller?.signal });
    if (!res.ok) return "unknown";
    const data = (await res.json()) as { current?: { weather_code?: number } };
    const code = data.current?.weather_code;
    const weather = typeof code === "number" ? weatherFromCode(code) : "unknown";
    memory = { at: now, key, weather };
    writeStorage(memory);
    return weather;
  } catch {
    return "unknown";
  } finally {
    clearTimeout(timer);
  }
}

/** Clear cached weather (used by tests). */
export function clearWeatherCache() {
  memory = null;
  try {
    globalThis.localStorage?.removeItem(CACHE_KEY);
  } catch {
    /* storage unavailable */
  }
}

function readStorage(): Cached | null {
  try {
    const raw = globalThis.localStorage?.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as Cached) : null;
  } catch {
    return null;
  }
}

function writeStorage(value: Cached) {
  try {
    globalThis.localStorage?.setItem(CACHE_KEY, JSON.stringify(value));
  } catch {
    /* storage unavailable or full */
  }
}
