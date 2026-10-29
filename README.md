# Duskwise

A comfort-first CSS library. Components, forms and type that adapt to the time of day:
crisp at noon, warm at dusk, dim and amber at night, softer on grey days. Every mood keeps
WCAG AA contrast, checked by automated tests.

## How it's built (four layers)

| Layer | Where | What it does |
| --- | --- | --- |
| 1. Design tokens | `tokens/tokens.mjs` → `src/css/tokens.css` | OKLCH primitives, 4 moods of semantic tokens, static tokens |
| 2. CSS | `src/css/*.css` → `dist/duskwise.css` | reset, base, classless (`.dw-prose`), components, utilities, in cascade layers |
| 3. Ambient engine | `src/engine/*.ts` → `dist/index.js` | picks the mood from time, sunrise/sunset and weather; writes `data-dw-mood` |
| 4. Adapters | not built yet | React components and a Tailwind preset come next |

Your own CSS always wins: the library lives in `@layer dw.*`, so un-layered CSS overrides it
without `!important`.

## Use it

CSS only (follows the OS dark mode):

```html
<link rel="stylesheet" href="dist/duskwise.css">
<button class="dw-btn">Save</button>
```

With the ambient engine:

```js
import "duskwise/duskwise.css";
import { createAmbientTheme } from "duskwise";

const theme = createAmbientTheme({
  mode: "auto",          // "auto" | "light" | "dark" | "warm"
  location: "timezone",  // no permission prompt; or { latitude, longitude }
  weather: false,        // true = Open-Meteo (free, no key), cached 45 min
  nightWarmth: 0.12,     // warm overlay strength, 0 to 0.3
});

theme.setMode("dark");
theme.subscribe(({ mood }) => console.log(mood));
```

The engine is **optional**: it adds automatic time/weather switching and remembers the user's
choices. Everything below also works by setting attributes on `<html>` yourself.

### Two-color themes

Pick any two of 28 colors (756 combinations), or one of 24 templates. Primary drives buttons and
links; highlight drives badges, `<mark>`, selection and `.dw-btn--highlight`. Each mood re-lights
both colors, and the tests check every color in both slots in every mood.

```html
<html data-dw-primary="pistachio" data-dw-highlight="pink">
```

```js
theme.setPalette("pistachio-pink");  // a template
theme.setPalette("lemon", "leaf");   // any pair
theme.setPalette(null);              // back to the mood's own colors
```

Colors: red, tomato, coral, orange, apricot, amber, mustard, lemon, lime, pistachio, sage, leaf,
emerald, mint, teal, aqua, sky, ocean, cobalt, indigo, lavender, violet, plum, magenta, pink, rose,
sand, slate.

### Looks

```html
<html data-dw-look="sketch">  <!-- hand-drawn ink on dot-grid paper; chalkboard at night -->
<html data-dw-look="paint">   <!-- watercolor washes of your two colors on grainy paper -->
```

The sketch look uses `--dw-font-hand` (Patrick Hand first). Load that font yourself, e.g. from
Google Fonts, or it falls back to system handwriting fonts.

Avoid a flash of the day theme at night by putting `noFlashScript()`'s output in an inline
`<script>` in `<head>`.

Preview a mood anywhere: `<div data-dw-mood="night">…</div>`.

## Components (v0.1)

Button (primary, secondary, ghost, danger, sizes), form fields, checkbox, switch, card, alert,
badge, navbar, tabs, segmented control, modal (`<dialog>`), tooltip, plus classless prose styles
and layout utilities (`dw-stack`, `dw-cluster`, `dw-grid`, `dw-container`).

## Develop

```bash
npm install
npm test            # 278 tests: sun times, mood rules, engine, contrast for every color in every mood
npm run build       # tokens → CSS bundle → ESM/CJS/IIFE + types
npm run build:demo  # self-contained demo at demo/dist/index.html
npm run typecheck
```

To change colors, edit `tokens/tokens.mjs` and run `npm run build`. The contrast tests fail if
any mood drops below its required ratio.

## Roadmap

- [x] Tokens, CSS layers, 12 components, ambient engine, tests, demo
- [ ] Final name + npm availability check
- [ ] React package: `<AmbientThemeProvider>`, `useAmbientTheme()`, components
- [ ] Tailwind v4 preset
- [ ] CI (GitHub Actions), Changesets, publish 0.1.0 beta

MIT License.
