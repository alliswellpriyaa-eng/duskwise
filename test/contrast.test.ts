import { describe, expect, it } from "vitest";
// @ts-expect-error - plain JS token modules
import { buildPrimitives, MOODS, CONTRAST_PAIRS, COLORS, PRESETS, deriveRoles } from "../tokens/tokens.mjs";
// @ts-expect-error - plain JS token modules
import { contrast } from "../tokens/color.mjs";

type Triple = [number, number, number];
type Pair = [string, string, number];
interface MoodDef {
  colors: Record<string, string>;
  light: Record<string, number>;
  primary: Triple;
  highlight: Triple;
}

const primitives = buildPrimitives() as Record<string, Triple>;
const moods = MOODS as Record<string, MoodDef>;
const colors = COLORS as Record<string, Triple>;
const roles = Object.keys(moods.day.colors);

function resolve(mood: MoodDef, primary: Triple, highlight: Triple): Record<string, Triple> {
  const base = Object.fromEntries(Object.entries(mood.colors).map(([k, v]) => [k, primitives[v]]));
  return { ...base, ...deriveRoles(mood.light, primary, "accent"), ...deriveRoles(mood.light, highlight, "highlight") };
}

describe.each(Object.keys(moods))("%s mood", (moodName) => {
  const mood = moods[moodName];

  it("defines every color role", () => {
    expect(Object.keys(mood.colors).sort()).toEqual([...roles].sort());
  });

  it("only points at primitives that exist", () => {
    for (const prim of Object.values(mood.colors)) expect(primitives[prim], prim).toBeDefined();
  });

  it.each(CONTRAST_PAIRS as Pair[])("default colors: %s on %s meets %s:1", (fg, bg, min) => {
    const r = resolve(mood, mood.primary, mood.highlight);
    expect(contrast(r[fg], r[bg])).toBeGreaterThanOrEqual(min);
  });

  // Every one of the 28 theme colors, in both the primary and the highlight slot.
  it.each(Object.keys(colors))("theme color %s stays readable in both slots", (name) => {
    const r = resolve(mood, colors[name], colors[name]);
    const failures = (CONTRAST_PAIRS as Pair[])
      .map(([fg, bg, min]) => ({ fg, bg, min, ratio: contrast(r[fg], r[bg]) }))
      .filter((x) => x.ratio < x.min)
      .map((x) => `${x.fg} on ${x.bg}: ${x.ratio.toFixed(2)} < ${x.min}`);
    expect(failures).toEqual([]);
  });
});

describe("presets", () => {
  it.each(Object.entries(PRESETS as Record<string, [string, string]>))("%s uses real colors", (_id, [p, h]) => {
    expect(colors[p]).toBeDefined();
    expect(colors[h]).toBeDefined();
    expect(p).not.toBe(h);
  });
});
