/** The look the page is in right now. Each mood is a token set in tokens.css. */
type Mood = "day" | "dusk" | "night" | "soft";
/** What the user chose. "auto" follows time and weather; the others are fixed. */
type Mode = "auto" | "light" | "dark" | "warm";
type Weather = "clear" | "cloudy" | "rain" | "snow" | "fog" | "unknown";
/** How components are drawn. Independent of mood and colors. */
type Look = "clean" | "sketch" | "paint";
/** Two theme colors: primary (buttons, links) and highlight (badges, marks, selection). */
interface Palette {
    primary: string;
    highlight: string;
}
/** A preset id like "pistachio-pink", a [primary, highlight] pair, or null for the mood's defaults. */
type PaletteInput = string | readonly [string, string] | Palette | null;
interface Coordinates {
    latitude: number;
    longitude: number;
}
interface SunTimes {
    sunrise: Date | null;
    sunset: Date | null;
    /** Set near the poles, when the sun doesn't rise or doesn't set today. */
    polar?: "day" | "night";
}
interface AmbientState {
    mood: Mood;
    mode: Mode;
    /** 0 to 1: how far into evening/night we are. Multiplied by nightWarmth for the overlay. */
    warmth: number;
    sun: SunTimes;
    weather: Weather;
    location: Coordinates;
    /** null = the mood's own default colors. */
    palette: Palette | null;
    look: Look;
}
interface AmbientOptions {
    /** Starting mode. A mode the user saved earlier wins. Default "auto". */
    mode?: Mode;
    /** "timezone" (default) estimates location with no permission prompt. Or pass coordinates. */
    location?: "timezone" | Coordinates;
    /** false (default) = no network. true = fetch Open-Meteo. Or a fixed condition (handy for previews). */
    weather?: boolean | Weather;
    /** Two theme colors. A palette the user saved earlier wins. Default null (mood defaults). */
    palette?: PaletteInput;
    /** "clean" (default), "sketch" or "paint". A look the user saved earlier wins. */
    look?: Look;
    /** Strength of the warm overlay at night, 0 to 0.3. Default 0.12. */
    nightWarmth?: number;
    /** Element that receives data-dw-mood. Default document.documentElement. */
    root?: HTMLElement;
    /** localStorage key prefix for the user's choices, or false to not persist. Default "dw-mode"
     *  (palette and look are saved under "<key>-palette" and "<key>-look"). */
    storageKey?: string | false;
    /** How often to re-check, in minutes. Default 5. */
    refreshMinutes?: number;
    /** Clock override, for tests and previews. */
    now?: () => Date;
    /** fetch override, for tests. */
    fetch?: typeof fetch;
}
interface AmbientTheme {
    getState(): AmbientState;
    subscribe(listener: (state: AmbientState) => void): () => void;
    setMode(mode: Mode): void;
    /** setPalette("pistachio-pink"), setPalette("lemon", "leaf"), or setPalette(null) to reset. */
    setPalette(palette: PaletteInput, highlight?: string): void;
    setLook(look: Look): void;
    /** Re-read the clock (and weather, if cached data expired) and re-apply. */
    refresh(): void;
    destroy(): void;
}

interface MoodInput {
    now: Date;
    sun: SunTimes | null;
    weather?: Weather;
    mode?: Mode;
    /** OS dark mode, used only when sun times are unknown. */
    prefersDark?: boolean;
}
/** Pure function: given the signals, which mood should the page show? */
declare function pickMood({ now, sun, weather, mode, prefersDark }: MoodInput): Mood;
/**
 * How warm the page should be, 0 (day) to 1 (full night).
 * Ramps up over the two hours around sunset and down over the hour around sunrise.
 */
declare function warmthAt(now: Date, sun: SunTimes | null): number;

/**
 * Sunrise and sunset for the solar day closest to `date` at a location.
 * Uses the standard sunrise equation; accurate to about a minute, which is plenty for theming.
 * Longitude is east-positive (Austin is about -97.7).
 */
declare function getSunTimes(date: Date, latitude: number, longitude: number): SunTimes;

/**
 * Estimate where the user is from their time zone alone: no prompt, no network.
 * Unknown zones fall back to longitude from the UTC offset and a mid-northern latitude.
 */
declare function estimateLocation(timeZone?: string | undefined, utcOffsetMinutes?: number): Coordinates;

/** Map a WMO weather code (as returned by Open-Meteo) to a simple condition. */
declare function weatherFromCode(code: number): Weather;
/**
 * Current weather from Open-Meteo (free, no API key).
 * Coordinates are rounded to 1 decimal (about 10 km) before leaving the browser.
 * Never throws: failures resolve to "unknown" so the theme falls back to time only.
 */
declare function getWeather(location: Coordinates, fetchImpl?: typeof fetch | undefined, now?: number): Promise<Weather>;
/** Clear cached weather (used by tests). */
declare function clearWeatherCache(): void;

declare const COLOR_NAMES: readonly ["red", "tomato", "coral", "orange", "apricot", "amber", "mustard", "lemon", "lime", "pistachio", "sage", "leaf", "emerald", "mint", "teal", "aqua", "sky", "ocean", "cobalt", "indigo", "lavender", "violet", "plum", "magenta", "pink", "rose", "sand", "slate"];
type ColorName = (typeof COLOR_NAMES)[number];
declare const PRESETS: Record<string, readonly [ColorName, ColorName]>;

/**
 * Turn a preset id, a pair or a Palette into a validated Palette (or null).
 * Throws with a helpful message on unknown names.
 */
declare function resolvePalette(input: PaletteInput, highlight?: string): Palette | null;
/**
 * Start the ambient engine (optional - the CSS works without it). Its only job is to
 * write the user's choices and the current mood to the page:
 *   <html data-dw-mood="dusk" data-dw-primary="pistachio" data-dw-highlight="pink"
 *         data-dw-look="sketch" style="--dw-warmth: 0.06">
 * All visual changes come from the CSS reading those values.
 */
declare function createAmbientTheme(options?: AmbientOptions): AmbientTheme;
/**
 * A tiny script for <head> that applies saved choices and a best-guess mood before the
 * page paints, so users never see a flash of the wrong theme. The engine refines it once loaded.
 */
declare function noFlashScript(storageKey?: string): string;

export { COLOR_NAMES, PRESETS, clearWeatherCache, createAmbientTheme, estimateLocation, getSunTimes, getWeather, noFlashScript, pickMood, resolvePalette, warmthAt, weatherFromCode };
export type { AmbientOptions, AmbientState, AmbientTheme, Coordinates, Look, Mode, Mood, Palette, PaletteInput, SunTimes, Weather };
