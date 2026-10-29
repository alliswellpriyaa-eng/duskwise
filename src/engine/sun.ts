import type { SunTimes } from "./types";

const RAD = Math.PI / 180;
const DAY_MS = 86_400_000;
const J1970 = 2_440_587.5;
const J2000 = 2_451_545;

const toJulian = (date: Date) => date.getTime() / DAY_MS + J1970;
const fromJulian = (j: number) => new Date((j - J1970) * DAY_MS);

/**
 * Sunrise and sunset for the solar day closest to `date` at a location.
 * Uses the standard sunrise equation; accurate to about a minute, which is plenty for theming.
 * Longitude is east-positive (Austin is about -97.7).
 */
export function getSunTimes(date: Date, latitude: number, longitude: number): SunTimes {
  // Day count since J2000, centred on the observer's local solar noon.
  const n = Math.round(toJulian(date) - J2000 - 0.0009 + longitude / 360);
  const jStar = n + 0.0009 - longitude / 360;

  const M = (357.5291 + 0.98560028 * jStar) % 360; // mean anomaly
  const C = 1.9148 * Math.sin(M * RAD) + 0.02 * Math.sin(2 * M * RAD) + 0.0003 * Math.sin(3 * M * RAD);
  const lambda = (M + C + 180 + 102.9372) % 360; // ecliptic longitude
  const jTransit = J2000 + jStar + 0.0053 * Math.sin(M * RAD) - 0.0069 * Math.sin(2 * lambda * RAD);

  const sinDecl = Math.sin(lambda * RAD) * Math.sin(23.4397 * RAD);
  const cosDecl = Math.cos(Math.asin(sinDecl));
  const cosHourAngle =
    (Math.sin(-0.833 * RAD) - Math.sin(latitude * RAD) * sinDecl) / (Math.cos(latitude * RAD) * cosDecl);

  if (cosHourAngle > 1) return { sunrise: null, sunset: null, polar: "night" };
  if (cosHourAngle < -1) return { sunrise: null, sunset: null, polar: "day" };

  const hourAngle = Math.acos(cosHourAngle) / RAD;
  return {
    sunrise: fromJulian(jTransit - hourAngle / 360),
    sunset: fromJulian(jTransit + hourAngle / 360),
  };
}
