// Single source of truth for Duskwise's design tokens.
//
// Tier 1 - primitives: color scales generated from a hue + chroma.
// Tier 2 - semantic:   each mood maps roles (bg, text, danger...) to primitives,
//                      and lights the two theme colors (primary + highlight) for that mood.
// Tier 3 - component:  defined in the component CSS with fallbacks to semantic tokens.

/** Lightness for each shade step. Same steps for every palette = predictable contrast. */
export const STEPS = {
  50: 0.985,
  100: 0.955,
  200: 0.905,
  300: 0.83,
  400: 0.74,
  500: 0.645,
  600: 0.555,
  700: 0.465,
  800: 0.37,
  900: 0.28,
  950: 0.205,
};

/** How much of the palette's chroma each step keeps (vivid in the middle, calmer at the ends). */
const CHROMA_CURVE = {
  50: 0.18, 100: 0.3, 200: 0.5, 300: 0.72, 400: 0.9, 500: 1,
  600: 1, 700: 0.92, 800: 0.8, 900: 0.62, 950: 0.5,
};

/** Primitive scales: [hue, peak chroma]. Used for neutrals and status colors. */
export const PALETTES = {
  slate: [262, 0.03],   // cool neutral (day)
  sand: [78, 0.045],    // warm neutral (dusk, night text)
  ember: [55, 0.03],    // warm dark neutral (night surfaces)
  mist: [235, 0.014],   // grey neutral (soft / cloudy)
  red: [27, 0.2],
  tomato: [33, 0.19],   // night danger
  green: [150, 0.14],
  yellow: [92, 0.16],
};

export function buildPrimitives() {
  const out = { white: [1, 0, 0], black: [0, 0, 0] };
  for (const [name, [hue, chroma]] of Object.entries(PALETTES)) {
    for (const [step, L] of Object.entries(STEPS)) {
      out[`${name}-${step}`] = [L, chroma * CHROMA_CURVE[step], hue];
    }
  }
  return out;
}

/**
 * Theme colors people can pick as primary or highlight: [hue, chroma, bright].
 * bright = 1 means the color is naturally light (lemon, pistachio): in light moods its
 * fills stay light with dark text on top. bright = 0 colors get deep fills with light text.
 * 28 colors x 27 partners = 756 combinations.
 */
export const COLORS = {
  red: [25, 0.2, 0],
  tomato: [33, 0.19, 0],
  coral: [40, 0.14, 1],
  orange: [55, 0.17, 0],
  apricot: [68, 0.12, 1],
  amber: [78, 0.16, 1],
  mustard: [92, 0.13, 0],
  lemon: [102, 0.18, 1],
  lime: [128, 0.19, 1],
  pistachio: [132, 0.12, 1],
  sage: [145, 0.05, 1],
  leaf: [145, 0.16, 0],
  emerald: [160, 0.14, 0],
  mint: [168, 0.11, 1],
  teal: [188, 0.11, 0],
  aqua: [205, 0.11, 1],
  sky: [232, 0.12, 1],
  ocean: [245, 0.15, 0],
  cobalt: [262, 0.19, 0],
  indigo: [277, 0.17, 0],
  lavender: [298, 0.1, 1],
  violet: [302, 0.18, 0],
  plum: [325, 0.14, 0],
  magenta: [345, 0.2, 0],
  pink: [355, 0.13, 1],
  rose: [12, 0.15, 0],
  sand: [75, 0.035, 1],
  slate: [255, 0.03, 0],
};

/** Curated two-color templates: [primary, highlight]. Any other pair works too. */
export const PRESETS = {
  "pistachio-pink": ["pistachio", "pink"],
  "lemon-leaf": ["lemon", "leaf"],
  "ocean-coral": ["ocean", "coral"],
  "indigo-amber": ["indigo", "amber"],
  "plum-mint": ["plum", "mint"],
  "teal-apricot": ["teal", "apricot"],
  "cobalt-lemon": ["cobalt", "lemon"],
  "rose-sage": ["rose", "sage"],
  "lavender-lime": ["lavender", "lime"],
  "magenta-sky": ["magenta", "sky"],
  "emerald-pink": ["emerald", "pink"],
  "violet-mustard": ["violet", "mustard"],
  "tomato-aqua": ["tomato", "aqua"],
  "slate-tomato": ["slate", "tomato"],
  "sand-teal": ["sand", "teal"],
  "leaf-lavender": ["leaf", "lavender"],
  "coral-indigo": ["coral", "indigo"],
  "mint-violet": ["mint", "violet"],
  "amber-ocean": ["amber", "ocean"],
  "sky-rose": ["sky", "rose"],
  "orange-cobalt": ["orange", "cobalt"],
  "pink-emerald": ["pink", "emerald"],
  "lime-plum": ["lime", "plum"],
  "apricot-slate": ["apricot", "slate"],
};

/**
 * Semantic tokens per mood.
 *  colors: role -> primitive name.
 *  light:  how this mood lights the theme colors (OKLCH lightness and chroma scales).
 *  primary / highlight: the mood's own default theme colors when none are chosen.
 */
export const MOODS = {
  day: {
    colors: {
      bg: "slate-50",
      surface: "white",
      "surface-2": "slate-100",
      text: "slate-950",
      muted: "slate-700",
      border: "slate-200",
      "border-strong": "slate-500",
      success: "green-700",
      warning: "yellow-800",
      danger: "red-700",
      "on-danger": "white",
      "success-soft": "green-100",
      "warning-soft": "yellow-100",
      "danger-soft": "red-100",
    },
    light: { fill: 0.53, fillBright: 0.86, on: 0.99, onBright: 0.22, ink: 0.48, inkC: 0.85, soft: 0.94, softC: 0.32 },
    primary: [256, 0.19, 0],
    highlight: [78, 0.16, 1],
    other: {
      shadow: "0 1px 2px oklch(0.25 0.02 262 / 0.06), 0 6px 16px oklch(0.25 0.02 262 / 0.07)",
      "image-dim": "1",
      duration: "180ms",
    },
  },
  dusk: {
    colors: {
      bg: "sand-100",
      surface: "sand-50",
      "surface-2": "sand-200",
      text: "ember-950",
      muted: "ember-700",
      border: "sand-300",
      "border-strong": "sand-500",
      success: "green-700",
      warning: "yellow-800",
      danger: "red-700",
      "on-danger": "sand-50",
      "success-soft": "green-200",
      "warning-soft": "yellow-200",
      "danger-soft": "red-200",
    },
    light: { fill: 0.5, fillBright: 0.86, on: 0.985, onBright: 0.22, ink: 0.46, inkC: 0.85, soft: 0.91, softC: 0.4 },
    primary: [48, 0.17, 0],
    highlight: [355, 0.13, 1],
    other: {
      shadow: "0 1px 2px oklch(0.3 0.04 55 / 0.07), 0 6px 16px oklch(0.3 0.04 55 / 0.08)",
      "image-dim": "0.96",
      duration: "220ms",
    },
  },
  night: {
    colors: {
      bg: "ember-950",
      surface: "ember-900",
      "surface-2": "ember-800",
      text: "sand-200",
      muted: "sand-400",
      border: "ember-800",
      "border-strong": "ember-600",
      success: "green-400",
      warning: "yellow-400",
      danger: "tomato-400",
      "on-danger": "ember-950",
      "success-soft": "green-900",
      "warning-soft": "yellow-900",
      "danger-soft": "tomato-900",
    },
    light: { fill: 0.8, fillBright: 0.82, on: 0.2, onBright: 0.2, ink: 0.82, inkC: 0.75, soft: 0.31, softC: 0.45 },
    primary: [78, 0.16, 1],
    highlight: [12, 0.15, 0],
    other: {
      // Shadows barely show on dark backgrounds; borders do the work instead.
      shadow: "0 0 0 1px oklch(0.37 0.024 55 / 0.6)",
      "image-dim": "0.86",
      duration: "260ms",
    },
  },
  soft: {
    colors: {
      bg: "mist-100",
      surface: "mist-50",
      "surface-2": "mist-200",
      text: "mist-950",
      muted: "mist-700",
      border: "mist-300",
      "border-strong": "mist-500",
      success: "green-700",
      warning: "yellow-800",
      danger: "red-700",
      "on-danger": "mist-50",
      "success-soft": "green-200",
      "warning-soft": "yellow-200",
      "danger-soft": "red-200",
    },
    light: { fill: 0.5, fillBright: 0.86, on: 0.985, onBright: 0.22, ink: 0.47, inkC: 0.8, soft: 0.92, softC: 0.35 },
    primary: [240, 0.1, 0],
    highlight: [168, 0.11, 1],
    other: {
      shadow: "0 1px 2px oklch(0.3 0.01 235 / 0.05), 0 4px 12px oklch(0.3 0.01 235 / 0.05)",
      "image-dim": "0.97",
      duration: "220ms",
    },
  },
};

/**
 * The theme-color roles, computed exactly the way the CSS computes them.
 * prefix "accent" for the primary color, "highlight" for the second color.
 */
export function deriveRoles(light, [h, c, bright], prefix) {
  return {
    [prefix]: [light.fill + bright * (light.fillBright - light.fill), c, h],
    [`on-${prefix}`]: [light.on + bright * (light.onBright - light.on), 0.02, h],
    [`${prefix}-ink`]: [light.ink, c * light.inkC, h],
    [`${prefix}-soft`]: [light.soft, c * light.softC, h],
  };
}

/** Text/background pairs that must meet WCAG contrast in every mood. [fg, bg, minimum] */
export const CONTRAST_PAIRS = [
  ["text", "bg", 7],
  ["text", "surface", 7],
  ["text", "surface-2", 4.5],
  ["muted", "bg", 4.5],
  ["muted", "surface", 4.5],
  ["muted", "surface-2", 4.5],
  ["danger", "surface", 4.5],
  ["on-danger", "danger", 4.5],
  ["success", "surface", 4.5],
  ["warning", "surface", 4.5],
  ["text", "danger-soft", 4.5],
  ["text", "success-soft", 4.5],
  ["text", "warning-soft", 4.5],
  ["border-strong", "surface", 3],
  // Theme colors: checked for every one of the 28 colors in both slots.
  ["accent-ink", "bg", 4.5],
  ["accent-ink", "surface", 4.5],
  ["on-accent", "accent", 4.5],
  ["text", "accent-soft", 4.5],
  ["highlight-ink", "surface", 4.5],
  ["on-highlight", "highlight", 4.5],
  ["text", "highlight-soft", 4.5],
];

/** Tokens that don't change with mood. */
export const STATIC = {
  "font-sans": 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  "font-serif": 'ui-serif, Georgia, "Iowan Old Style", serif',
  "font-mono": 'ui-monospace, "SF Mono", Menlo, Consolas, monospace',
  "font-hand": '"Patrick Hand", "Kalam", "Comic Neue", "Segoe Print", "Bradley Hand", "Chalkboard SE", cursive',
  "text-xs": "0.75rem",
  "text-sm": "0.875rem",
  "text-md": "1rem",
  "text-lg": "1.125rem",
  "text-xl": "1.375rem",
  "text-2xl": "1.75rem",
  "text-3xl": "2.25rem",
  "leading-tight": "1.2",
  "leading-normal": "1.6",
  "space-0": "0",
  "space-1": "0.25rem",
  "space-2": "0.5rem",
  "space-3": "0.75rem",
  "space-4": "1rem",
  "space-5": "1.5rem",
  "space-6": "2rem",
  "space-7": "3rem",
  "space-8": "4rem",
  "radius-sm": "0.375rem",
  radius: "0.625rem",
  "radius-lg": "1rem",
  "radius-full": "999px",
  measure: "68ch",
  warmth: "0",
  "warmth-color": "oklch(0.75 0.15 60)",
};
