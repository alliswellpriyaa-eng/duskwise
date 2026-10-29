import { estimateLocation } from "./location";
import { pickMood, warmthAt } from "./mood";
import { COLOR_NAMES, PRESETS } from "./palettes";
import { getSunTimes } from "./sun";
import { getWeather } from "./weather";
import type {
  AmbientOptions,
  AmbientState,
  AmbientTheme,
  Look,
  Mode,
  Palette,
  PaletteInput,
  Weather,
} from "./types";

export * from "./types";
export { pickMood, warmthAt } from "./mood";
export { getSunTimes } from "./sun";
export { estimateLocation } from "./location";
export { getWeather, weatherFromCode, clearWeatherCache } from "./weather";
export { COLOR_NAMES, PRESETS } from "./palettes";

const MODES: Mode[] = ["auto", "light", "dark", "warm"];
const LOOKS: Look[] = ["clean", "sketch", "paint"];
const MAX_WARMTH = 0.3;

/**
 * Turn a preset id, a pair or a Palette into a validated Palette (or null).
 * Throws with a helpful message on unknown names.
 */
export function resolvePalette(input: PaletteInput, highlight?: string): Palette | null {
  if (input === null) return null;
  let pair: readonly [string, string];
  if (typeof input === "string") {
    if (highlight !== undefined) pair = [input, highlight];
    else if (PRESETS[input]) pair = PRESETS[input];
    else throw new Error(`Unknown preset "${input}". Try one of: ${Object.keys(PRESETS).slice(0, 6).join(", ")}…`);
  } else if (Array.isArray(input)) {
    pair = input as readonly [string, string];
  } else {
    const p = input as Palette;
    pair = [p.primary, p.highlight];
  }
  for (const name of pair) {
    if (!(COLOR_NAMES as readonly string[]).includes(name)) {
      throw new Error(`Unknown color "${name}". Available: ${COLOR_NAMES.join(", ")}`);
    }
  }
  return { primary: pair[0], highlight: pair[1] };
}

/**
 * Start the ambient engine (optional - the CSS works without it). Its only job is to
 * write the user's choices and the current mood to the page:
 *   <html data-dw-mood="dusk" data-dw-primary="pistachio" data-dw-highlight="pink"
 *         data-dw-look="sketch" style="--dw-warmth: 0.06">
 * All visual changes come from the CSS reading those values.
 */
export function createAmbientTheme(options: AmbientOptions = {}): AmbientTheme {
  const {
    location: locationOpt = "timezone",
    weather: weatherOpt = false,
    storageKey = "dw-mode",
    refreshMinutes = 5,
    now = () => new Date(),
  } = options;
  const nightWarmth = clamp(options.nightWarmth ?? 0.12, 0, MAX_WARMTH);
  const hasDom = typeof document !== "undefined";
  const root = options.root ?? (hasDom ? document.documentElement : undefined);
  const keys = storageKey
    ? { mode: storageKey, palette: `${storageKey}-palette`, look: `${storageKey}-look` }
    : null;

  const location = locationOpt === "timezone" ? estimateLocation() : locationOpt;
  let mode: Mode = readChoice(keys?.mode, MODES) ?? options.mode ?? "auto";
  let look: Look = readChoice(keys?.look, LOOKS) ?? options.look ?? "clean";
  let palette: Palette | null = readPalette(keys?.palette) ?? resolvePalette(options.palette ?? null);
  let weather: Weather = typeof weatherOpt === "string" ? weatherOpt : "unknown";
  const listeners = new Set<(s: AmbientState) => void>();
  let state = compute();
  let destroyed = false;

  function compute(): AmbientState {
    const at = now();
    const sun = getSunTimes(at, location.latitude, location.longitude);
    const mood = pickMood({ now: at, sun, weather, mode, prefersDark: prefersDark() });
    const warmth = mode === "auto" ? warmthAt(at, sun) : mode === "warm" ? 1 : 0;
    return { mood, mode, warmth, sun, weather, location, palette, look };
  }

  function apply() {
    if (destroyed) return;
    state = compute();
    if (root) {
      root.setAttribute("data-dw-mood", state.mood);
      root.style.setProperty("--dw-warmth", (state.warmth * nightWarmth).toFixed(3));
      setAttr(root, "data-dw-primary", palette?.primary);
      setAttr(root, "data-dw-highlight", palette?.highlight);
      setAttr(root, "data-dw-look", look === "clean" ? undefined : look);
    }
    listeners.forEach((fn) => fn(state));
  }

  async function loadWeather() {
    if (weatherOpt !== true) return;
    const next = await getWeather(location, options.fetch);
    if (next !== weather) {
      weather = next;
      apply();
    }
  }

  const onVisible = () => {
    if (hasDom && document.visibilityState === "visible") theme.refresh();
  };

  const timer = setInterval(() => {
    if (!hasDom || document.visibilityState !== "hidden") theme.refresh();
  }, refreshMinutes * 60_000);
  if (hasDom) document.addEventListener("visibilitychange", onVisible);

  const theme: AmbientTheme = {
    getState: () => state,
    subscribe(listener) {
      listeners.add(listener);
      listener(state);
      return () => listeners.delete(listener);
    },
    setMode(next) {
      if (!MODES.includes(next)) throw new Error(`Unknown mode "${next}". Use one of: ${MODES.join(", ")}`);
      mode = next;
      write(keys?.mode, next);
      apply();
    },
    setPalette(input, highlight) {
      palette = resolvePalette(input, highlight);
      write(keys?.palette, palette ? `${palette.primary},${palette.highlight}` : null);
      apply();
    },
    setLook(next) {
      if (!LOOKS.includes(next)) throw new Error(`Unknown look "${next}". Use one of: ${LOOKS.join(", ")}`);
      look = next;
      write(keys?.look, next);
      apply();
    },
    refresh() {
      apply();
      void loadWeather();
    },
    destroy() {
      destroyed = true;
      clearInterval(timer);
      if (hasDom) document.removeEventListener("visibilitychange", onVisible);
      listeners.clear();
    },
  };

  apply();
  void loadWeather();
  return theme;
}

/**
 * A tiny script for <head> that applies saved choices and a best-guess mood before the
 * page paints, so users never see a flash of the wrong theme. The engine refines it once loaded.
 */
export function noFlashScript(storageKey = "dw-mode"): string {
  const k = JSON.stringify(storageKey);
  return (
    `(function(){try{var d=document.documentElement,s=localStorage,k=${k};` +
    `var mood={light:"day",dark:"night",warm:"dusk"}[s.getItem(k)];` +
    `if(!mood){var h=new Date().getHours();mood=h<6||h>=20?"night":h<7||h>=18?"dusk":"day";}` +
    `d.setAttribute("data-dw-mood",mood);` +
    `var p=(s.getItem(k+"-palette")||"").split(",");` +
    `if(p.length===2){d.setAttribute("data-dw-primary",p[0]);d.setAttribute("data-dw-highlight",p[1]);}` +
    `var l=s.getItem(k+"-look");if(l==="sketch"||l==="paint")d.setAttribute("data-dw-look",l);` +
    `}catch(e){}})();`
  );
}

function setAttr(el: HTMLElement, name: string, value: string | undefined) {
  if (value) el.setAttribute(name, value);
  else el.removeAttribute(name);
}

function prefersDark(): boolean {
  try {
    return typeof matchMedia === "function" && matchMedia("(prefers-color-scheme: dark)").matches;
  } catch {
    return false;
  }
}

function readChoice<T extends string>(key: string | undefined, allowed: T[]): T | undefined {
  if (!key) return undefined;
  try {
    const v = globalThis.localStorage?.getItem(key) as T | null;
    return v && allowed.includes(v) ? v : undefined;
  } catch {
    return undefined;
  }
}

function readPalette(key: string | undefined): Palette | null {
  if (!key) return null;
  try {
    const raw = globalThis.localStorage?.getItem(key);
    if (!raw) return null;
    const [a, b] = raw.split(",");
    return resolvePalette([a, b]);
  } catch {
    return null; // missing, unreadable, or a color that no longer exists
  }
}

function write(key: string | undefined, value: string | null) {
  if (!key) return;
  try {
    if (value === null) globalThis.localStorage?.removeItem(key);
    else globalThis.localStorage?.setItem(key, value);
  } catch {
    /* storage unavailable */
  }
}

function clamp(n: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, n));
}
