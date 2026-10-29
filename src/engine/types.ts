/** The look the page is in right now. Each mood is a token set in tokens.css. */
export type Mood = "day" | "dusk" | "night" | "soft";

/** What the user chose. "auto" follows time and weather; the others are fixed. */
export type Mode = "auto" | "light" | "dark" | "warm";

export type Weather = "clear" | "cloudy" | "rain" | "snow" | "fog" | "unknown";

/** How components are drawn. Independent of mood and colors. */
export type Look = "clean" | "sketch" | "paint";

/** Two theme colors: primary (buttons, links) and highlight (badges, marks, selection). */
export interface Palette {
  primary: string;
  highlight: string;
}

/** A preset id like "pistachio-pink", a [primary, highlight] pair, or null for the mood's defaults. */
export type PaletteInput = string | readonly [string, string] | Palette | null;

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface SunTimes {
  sunrise: Date | null;
  sunset: Date | null;
  /** Set near the poles, when the sun doesn't rise or doesn't set today. */
  polar?: "day" | "night";
}

export interface AmbientState {
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

export interface AmbientOptions {
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

export interface AmbientTheme {
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
