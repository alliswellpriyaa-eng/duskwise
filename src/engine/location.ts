import type { Coordinates } from "./types";

/**
 * Approximate coordinates for common time zones. Good enough for sunset times
 * (an error of a few hundred km shifts sunset by minutes) and needs no permission.
 */
const ZONES: Record<string, [number, number]> = {
  "America/New_York": [40.7, -74.0],
  "America/Chicago": [41.9, -87.6],
  "America/Denver": [39.7, -105.0],
  "America/Phoenix": [33.4, -112.1],
  "America/Los_Angeles": [34.1, -118.2],
  "America/Anchorage": [61.2, -149.9],
  "Pacific/Honolulu": [21.3, -157.9],
  "America/Toronto": [43.7, -79.4],
  "America/Vancouver": [49.3, -123.1],
  "America/Mexico_City": [19.4, -99.1],
  "America/Bogota": [4.7, -74.1],
  "America/Lima": [-12.0, -77.0],
  "America/Santiago": [-33.4, -70.7],
  "America/Sao_Paulo": [-23.6, -46.6],
  "America/Argentina/Buenos_Aires": [-34.6, -58.4],
  "Europe/London": [51.5, -0.1],
  "Europe/Dublin": [53.3, -6.3],
  "Europe/Paris": [48.9, 2.4],
  "Europe/Madrid": [40.4, -3.7],
  "Europe/Berlin": [52.5, 13.4],
  "Europe/Rome": [41.9, 12.5],
  "Europe/Amsterdam": [52.4, 4.9],
  "Europe/Stockholm": [59.3, 18.1],
  "Europe/Istanbul": [41.0, 29.0],
  "Europe/Moscow": [55.8, 37.6],
  "Africa/Cairo": [30.0, 31.2],
  "Africa/Lagos": [6.5, 3.4],
  "Africa/Nairobi": [-1.3, 36.8],
  "Africa/Johannesburg": [-26.2, 28.0],
  "Asia/Dubai": [25.2, 55.3],
  "Asia/Karachi": [24.9, 67.0],
  "Asia/Kolkata": [19.1, 72.9],
  "Asia/Calcutta": [19.1, 72.9],
  "Asia/Dhaka": [23.8, 90.4],
  "Asia/Bangkok": [13.8, 100.5],
  "Asia/Singapore": [1.35, 103.8],
  "Asia/Jakarta": [-6.2, 106.8],
  "Asia/Manila": [14.6, 121.0],
  "Asia/Shanghai": [31.2, 121.5],
  "Asia/Hong_Kong": [22.3, 114.2],
  "Asia/Seoul": [37.6, 127.0],
  "Asia/Tokyo": [35.7, 139.7],
  "Australia/Perth": [-31.95, 115.9],
  "Australia/Brisbane": [-27.5, 153.0],
  "Australia/Sydney": [-33.9, 151.2],
  "Australia/Melbourne": [-37.8, 145.0],
  "Pacific/Auckland": [-36.8, 174.8],
};

/**
 * Estimate where the user is from their time zone alone: no prompt, no network.
 * Unknown zones fall back to longitude from the UTC offset and a mid-northern latitude.
 */
export function estimateLocation(
  timeZone: string | undefined = safeTimeZone(),
  utcOffsetMinutes: number = -new Date().getTimezoneOffset()
): Coordinates {
  const known = timeZone ? ZONES[timeZone] : undefined;
  if (known) return { latitude: known[0], longitude: known[1] };
  return { latitude: 35, longitude: Math.max(-180, Math.min(180, utcOffsetMinutes / 4)) };
}

function safeTimeZone(): string | undefined {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return undefined;
  }
}
