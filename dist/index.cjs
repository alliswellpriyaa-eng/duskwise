"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/engine/index.ts
var engine_exports = {};
__export(engine_exports, {
  COLOR_NAMES: () => COLOR_NAMES,
  PRESETS: () => PRESETS,
  clearWeatherCache: () => clearWeatherCache,
  createAmbientTheme: () => createAmbientTheme,
  estimateLocation: () => estimateLocation,
  getSunTimes: () => getSunTimes,
  getWeather: () => getWeather,
  noFlashScript: () => noFlashScript,
  pickMood: () => pickMood,
  resolvePalette: () => resolvePalette,
  warmthAt: () => warmthAt,
  weatherFromCode: () => weatherFromCode
});
module.exports = __toCommonJS(engine_exports);

// src/engine/location.ts
var ZONES = {
  "America/New_York": [40.7, -74],
  "America/Chicago": [41.9, -87.6],
  "America/Denver": [39.7, -105],
  "America/Phoenix": [33.4, -112.1],
  "America/Los_Angeles": [34.1, -118.2],
  "America/Anchorage": [61.2, -149.9],
  "Pacific/Honolulu": [21.3, -157.9],
  "America/Toronto": [43.7, -79.4],
  "America/Vancouver": [49.3, -123.1],
  "America/Mexico_City": [19.4, -99.1],
  "America/Bogota": [4.7, -74.1],
  "America/Lima": [-12, -77],
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
  "Europe/Istanbul": [41, 29],
  "Europe/Moscow": [55.8, 37.6],
  "Africa/Cairo": [30, 31.2],
  "Africa/Lagos": [6.5, 3.4],
  "Africa/Nairobi": [-1.3, 36.8],
  "Africa/Johannesburg": [-26.2, 28],
  "Asia/Dubai": [25.2, 55.3],
  "Asia/Karachi": [24.9, 67],
  "Asia/Kolkata": [19.1, 72.9],
  "Asia/Calcutta": [19.1, 72.9],
  "Asia/Dhaka": [23.8, 90.4],
  "Asia/Bangkok": [13.8, 100.5],
  "Asia/Singapore": [1.35, 103.8],
  "Asia/Jakarta": [-6.2, 106.8],
  "Asia/Manila": [14.6, 121],
  "Asia/Shanghai": [31.2, 121.5],
  "Asia/Hong_Kong": [22.3, 114.2],
  "Asia/Seoul": [37.6, 127],
  "Asia/Tokyo": [35.7, 139.7],
  "Australia/Perth": [-31.95, 115.9],
  "Australia/Brisbane": [-27.5, 153],
  "Australia/Sydney": [-33.9, 151.2],
  "Australia/Melbourne": [-37.8, 145],
  "Pacific/Auckland": [-36.8, 174.8]
};
function estimateLocation(timeZone = safeTimeZone(), utcOffsetMinutes = -(/* @__PURE__ */ new Date()).getTimezoneOffset()) {
  const known = timeZone ? ZONES[timeZone] : void 0;
  if (known) return { latitude: known[0], longitude: known[1] };
  return { latitude: 35, longitude: Math.max(-180, Math.min(180, utcOffsetMinutes / 4)) };
}
function safeTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return void 0;
  }
}

// src/engine/mood.ts
var MIN = 6e4;
var DUSK_BEFORE_SUNSET = 60 * MIN;
var DUSK_AFTER_SUNSET = 30 * MIN;
var DAWN_WINDOW = 30 * MIN;
var GREY_WEATHER = ["cloudy", "rain", "snow", "fog"];
function pickMood({ now, sun, weather = "unknown", mode = "auto", prefersDark: prefersDark2 = false }) {
  if (mode === "light") return "day";
  if (mode === "dark") return "night";
  if (mode === "warm") return "dusk";
  const daytime = () => GREY_WEATHER.includes(weather) ? "soft" : "day";
  if (!sun || sun.polar === "night") return sun ? "night" : prefersDark2 ? "night" : "day";
  if (sun.polar === "day" || !sun.sunrise || !sun.sunset) return daytime();
  const t = now.getTime();
  const rise = sun.sunrise.getTime();
  const set = sun.sunset.getTime();
  if (t >= set - DUSK_BEFORE_SUNSET && t < set + DUSK_AFTER_SUNSET) return "dusk";
  if (t >= rise - DAWN_WINDOW && t < rise + DAWN_WINDOW) return "dusk";
  if (t < rise - DAWN_WINDOW || t >= set + DUSK_AFTER_SUNSET) return "night";
  return daytime();
}
function warmthAt(now, sun) {
  if (!sun) return 0;
  if (sun.polar === "night") return 1;
  if (sun.polar === "day" || !sun.sunrise || !sun.sunset) return 0;
  const t = now.getTime();
  const rise = sun.sunrise.getTime();
  const set = sun.sunset.getTime();
  const ramp = (from, to) => Math.min(1, Math.max(0, (t - from) / (to - from)));
  if (t < rise - DAWN_WINDOW) return 1;
  if (t < rise + DAWN_WINDOW) return 1 - ramp(rise - DAWN_WINDOW, rise + DAWN_WINDOW);
  if (t < set - DUSK_BEFORE_SUNSET) return 0;
  return ramp(set - DUSK_BEFORE_SUNSET, set + 60 * MIN);
}

// src/engine/palettes.ts
var COLOR_NAMES = ["red", "tomato", "coral", "orange", "apricot", "amber", "mustard", "lemon", "lime", "pistachio", "sage", "leaf", "emerald", "mint", "teal", "aqua", "sky", "ocean", "cobalt", "indigo", "lavender", "violet", "plum", "magenta", "pink", "rose", "sand", "slate"];
var PRESETS = {
  "pistachio-pink": [
    "pistachio",
    "pink"
  ],
  "lemon-leaf": [
    "lemon",
    "leaf"
  ],
  "ocean-coral": [
    "ocean",
    "coral"
  ],
  "indigo-amber": [
    "indigo",
    "amber"
  ],
  "plum-mint": [
    "plum",
    "mint"
  ],
  "teal-apricot": [
    "teal",
    "apricot"
  ],
  "cobalt-lemon": [
    "cobalt",
    "lemon"
  ],
  "rose-sage": [
    "rose",
    "sage"
  ],
  "lavender-lime": [
    "lavender",
    "lime"
  ],
  "magenta-sky": [
    "magenta",
    "sky"
  ],
  "emerald-pink": [
    "emerald",
    "pink"
  ],
  "violet-mustard": [
    "violet",
    "mustard"
  ],
  "tomato-aqua": [
    "tomato",
    "aqua"
  ],
  "slate-tomato": [
    "slate",
    "tomato"
  ],
  "sand-teal": [
    "sand",
    "teal"
  ],
  "leaf-lavender": [
    "leaf",
    "lavender"
  ],
  "coral-indigo": [
    "coral",
    "indigo"
  ],
  "mint-violet": [
    "mint",
    "violet"
  ],
  "amber-ocean": [
    "amber",
    "ocean"
  ],
  "sky-rose": [
    "sky",
    "rose"
  ],
  "orange-cobalt": [
    "orange",
    "cobalt"
  ],
  "pink-emerald": [
    "pink",
    "emerald"
  ],
  "lime-plum": [
    "lime",
    "plum"
  ],
  "apricot-slate": [
    "apricot",
    "slate"
  ]
};

// src/engine/sun.ts
var RAD = Math.PI / 180;
var DAY_MS = 864e5;
var J1970 = 24405875e-1;
var J2000 = 2451545;
var toJulian = (date) => date.getTime() / DAY_MS + J1970;
var fromJulian = (j) => new Date((j - J1970) * DAY_MS);
function getSunTimes(date, latitude, longitude) {
  const n = Math.round(toJulian(date) - J2000 - 9e-4 + longitude / 360);
  const jStar = n + 9e-4 - longitude / 360;
  const M = (357.5291 + 0.98560028 * jStar) % 360;
  const C = 1.9148 * Math.sin(M * RAD) + 0.02 * Math.sin(2 * M * RAD) + 3e-4 * Math.sin(3 * M * RAD);
  const lambda = (M + C + 180 + 102.9372) % 360;
  const jTransit = J2000 + jStar + 53e-4 * Math.sin(M * RAD) - 69e-4 * Math.sin(2 * lambda * RAD);
  const sinDecl = Math.sin(lambda * RAD) * Math.sin(23.4397 * RAD);
  const cosDecl = Math.cos(Math.asin(sinDecl));
  const cosHourAngle = (Math.sin(-0.833 * RAD) - Math.sin(latitude * RAD) * sinDecl) / (Math.cos(latitude * RAD) * cosDecl);
  if (cosHourAngle > 1) return { sunrise: null, sunset: null, polar: "night" };
  if (cosHourAngle < -1) return { sunrise: null, sunset: null, polar: "day" };
  const hourAngle = Math.acos(cosHourAngle) / RAD;
  return {
    sunrise: fromJulian(jTransit - hourAngle / 360),
    sunset: fromJulian(jTransit + hourAngle / 360)
  };
}

// src/engine/weather.ts
var CACHE_KEY = "dw-weather";
var CACHE_MS = 45 * 6e4;
var TIMEOUT_MS = 5e3;
function weatherFromCode(code) {
  if (code <= 2) return "clear";
  if (code === 3) return "cloudy";
  if (code === 45 || code === 48) return "fog";
  if (code >= 71 && code <= 77 || code === 85 || code === 86) return "snow";
  if (code >= 51 && code <= 67 || code >= 80 && code <= 82 || code >= 95) return "rain";
  return "unknown";
}
var memory = null;
async function getWeather(location, fetchImpl = globalThis.fetch, now = Date.now()) {
  const lat = location.latitude.toFixed(1);
  const lon = location.longitude.toFixed(1);
  const key = `${lat},${lon}`;
  const cached = memory ?? readStorage();
  if (cached && cached.key === key && now - cached.at < CACHE_MS) return cached.weather;
  if (!fetchImpl) return "unknown";
  const controller = typeof AbortController !== "undefined" ? new AbortController() : void 0;
  const timer = setTimeout(() => controller?.abort(), TIMEOUT_MS);
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=weather_code`;
    const res = await fetchImpl(url, { signal: controller?.signal });
    if (!res.ok) return "unknown";
    const data = await res.json();
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
function clearWeatherCache() {
  memory = null;
  try {
    globalThis.localStorage?.removeItem(CACHE_KEY);
  } catch {
  }
}
function readStorage() {
  try {
    const raw = globalThis.localStorage?.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
function writeStorage(value) {
  try {
    globalThis.localStorage?.setItem(CACHE_KEY, JSON.stringify(value));
  } catch {
  }
}

// src/engine/index.ts
var MODES = ["auto", "light", "dark", "warm"];
var LOOKS = ["clean", "sketch", "paint"];
var MAX_WARMTH = 0.3;
function resolvePalette(input, highlight) {
  if (input === null) return null;
  let pair;
  if (typeof input === "string") {
    if (highlight !== void 0) pair = [input, highlight];
    else if (PRESETS[input]) pair = PRESETS[input];
    else throw new Error(`Unknown preset "${input}". Try one of: ${Object.keys(PRESETS).slice(0, 6).join(", ")}\u2026`);
  } else if (Array.isArray(input)) {
    pair = input;
  } else {
    const p = input;
    pair = [p.primary, p.highlight];
  }
  for (const name of pair) {
    if (!COLOR_NAMES.includes(name)) {
      throw new Error(`Unknown color "${name}". Available: ${COLOR_NAMES.join(", ")}`);
    }
  }
  return { primary: pair[0], highlight: pair[1] };
}
function createAmbientTheme(options = {}) {
  const {
    location: locationOpt = "timezone",
    weather: weatherOpt = false,
    storageKey = "dw-mode",
    refreshMinutes = 5,
    now = () => /* @__PURE__ */ new Date()
  } = options;
  const nightWarmth = clamp(options.nightWarmth ?? 0.12, 0, MAX_WARMTH);
  const hasDom = typeof document !== "undefined";
  const root = options.root ?? (hasDom ? document.documentElement : void 0);
  const keys = storageKey ? { mode: storageKey, palette: `${storageKey}-palette`, look: `${storageKey}-look` } : null;
  const location = locationOpt === "timezone" ? estimateLocation() : locationOpt;
  let mode = readChoice(keys?.mode, MODES) ?? options.mode ?? "auto";
  let look = readChoice(keys?.look, LOOKS) ?? options.look ?? "clean";
  let palette = readPalette(keys?.palette) ?? resolvePalette(options.palette ?? null);
  let weather = typeof weatherOpt === "string" ? weatherOpt : "unknown";
  const listeners = /* @__PURE__ */ new Set();
  let state = compute();
  let destroyed = false;
  function compute() {
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
      setAttr(root, "data-dw-look", look === "clean" ? void 0 : look);
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
  }, refreshMinutes * 6e4);
  if (hasDom) document.addEventListener("visibilitychange", onVisible);
  const theme = {
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
    }
  };
  apply();
  void loadWeather();
  return theme;
}
function noFlashScript(storageKey = "dw-mode") {
  const k = JSON.stringify(storageKey);
  return `(function(){try{var d=document.documentElement,s=localStorage,k=${k};var mood={light:"day",dark:"night",warm:"dusk"}[s.getItem(k)];if(!mood){var h=new Date().getHours();mood=h<6||h>=20?"night":h<7||h>=18?"dusk":"day";}d.setAttribute("data-dw-mood",mood);var p=(s.getItem(k+"-palette")||"").split(",");if(p.length===2){d.setAttribute("data-dw-primary",p[0]);d.setAttribute("data-dw-highlight",p[1]);}var l=s.getItem(k+"-look");if(l==="sketch"||l==="paint")d.setAttribute("data-dw-look",l);}catch(e){}})();`;
}
function setAttr(el, name, value) {
  if (value) el.setAttribute(name, value);
  else el.removeAttribute(name);
}
function prefersDark() {
  try {
    return typeof matchMedia === "function" && matchMedia("(prefers-color-scheme: dark)").matches;
  } catch {
    return false;
  }
}
function readChoice(key, allowed) {
  if (!key) return void 0;
  try {
    const v = globalThis.localStorage?.getItem(key);
    return v && allowed.includes(v) ? v : void 0;
  } catch {
    return void 0;
  }
}
function readPalette(key) {
  if (!key) return null;
  try {
    const raw = globalThis.localStorage?.getItem(key);
    if (!raw) return null;
    const [a, b] = raw.split(",");
    return resolvePalette([a, b]);
  } catch {
    return null;
  }
}
function write(key, value) {
  if (!key) return;
  try {
    if (value === null) globalThis.localStorage?.removeItem(key);
    else globalThis.localStorage?.setItem(key, value);
  } catch {
  }
}
function clamp(n, lo, hi) {
  return Math.min(hi, Math.max(lo, n));
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  COLOR_NAMES,
  PRESETS,
  clearWeatherCache,
  createAmbientTheme,
  estimateLocation,
  getSunTimes,
  getWeather,
  noFlashScript,
  pickMood,
  resolvePalette,
  warmthAt,
  weatherFromCode
});
//# sourceMappingURL=index.cjs.map