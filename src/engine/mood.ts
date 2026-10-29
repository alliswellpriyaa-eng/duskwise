import type { Mode, Mood, SunTimes, Weather } from "./types";

const MIN = 60_000;

/** Dusk starts this long before sunset and lasts until this long after it. */
export const DUSK_BEFORE_SUNSET = 60 * MIN;
export const DUSK_AFTER_SUNSET = 30 * MIN;
/** Dawn (shown as the dusk mood) spans this long either side of sunrise. */
export const DAWN_WINDOW = 30 * MIN;

const GREY_WEATHER: Weather[] = ["cloudy", "rain", "snow", "fog"];

export interface MoodInput {
  now: Date;
  sun: SunTimes | null;
  weather?: Weather;
  mode?: Mode;
  /** OS dark mode, used only when sun times are unknown. */
  prefersDark?: boolean;
}

/** Pure function: given the signals, which mood should the page show? */
export function pickMood({ now, sun, weather = "unknown", mode = "auto", prefersDark = false }: MoodInput): Mood {
  if (mode === "light") return "day";
  if (mode === "dark") return "night";
  if (mode === "warm") return "dusk";

  const daytime = (): Mood => (GREY_WEATHER.includes(weather) ? "soft" : "day");

  if (!sun || sun.polar === "night") return sun ? "night" : prefersDark ? "night" : "day";
  if (sun.polar === "day" || !sun.sunrise || !sun.sunset) return daytime();

  const t = now.getTime();
  const rise = sun.sunrise.getTime();
  const set = sun.sunset.getTime();

  if (t >= set - DUSK_BEFORE_SUNSET && t < set + DUSK_AFTER_SUNSET) return "dusk";
  if (t >= rise - DAWN_WINDOW && t < rise + DAWN_WINDOW) return "dusk";
  if (t < rise - DAWN_WINDOW || t >= set + DUSK_AFTER_SUNSET) return "night";
  return daytime();
}

/**
 * How warm the page should be, 0 (day) to 1 (full night).
 * Ramps up over the two hours around sunset and down over the hour around sunrise.
 */
export function warmthAt(now: Date, sun: SunTimes | null): number {
  if (!sun) return 0;
  if (sun.polar === "night") return 1;
  if (sun.polar === "day" || !sun.sunrise || !sun.sunset) return 0;

  const t = now.getTime();
  const rise = sun.sunrise.getTime();
  const set = sun.sunset.getTime();
  const ramp = (from: number, to: number) => Math.min(1, Math.max(0, (t - from) / (to - from)));

  if (t < rise - DAWN_WINDOW) return 1;
  if (t < rise + DAWN_WINDOW) return 1 - ramp(rise - DAWN_WINDOW, rise + DAWN_WINDOW);
  if (t < set - DUSK_BEFORE_SUNSET) return 0;
  return ramp(set - DUSK_BEFORE_SUNSET, set + 60 * MIN);
}
