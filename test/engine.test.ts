// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { COLOR_NAMES, PRESETS, createAmbientTheme, noFlashScript } from "../src/engine";
import { clearWeatherCache, weatherFromCode } from "../src/engine/weather";
import type { AmbientTheme } from "../src/engine/types";

// Austin. On 2026-03-20 the sun rises ~12:37Z and sets ~00:46Z (next day).
const austin = { latitude: 30.27, longitude: -97.74 };
const noonAustin = () => new Date("2026-03-20T18:00:00Z"); // 1pm CDT
const midnightAustin = () => new Date("2026-03-21T05:00:00Z"); // midnight CDT

let theme: AmbientTheme | undefined;
const root = () => document.documentElement;

beforeEach(() => {
  localStorage.clear();
  clearWeatherCache();
  root().removeAttribute("data-dw-mood");
  root().style.removeProperty("--dw-warmth");
});
afterEach(() => theme?.destroy());

describe("createAmbientTheme", () => {
  it("writes the mood and warmth to <html>", () => {
    theme = createAmbientTheme({ location: austin, now: midnightAustin, nightWarmth: 0.2 });
    expect(root().getAttribute("data-dw-mood")).toBe("night");
    expect(root().style.getPropertyValue("--dw-warmth")).toBe("0.200");
  });

  it("shows the day mood with no warmth at noon", () => {
    theme = createAmbientTheme({ location: austin, now: noonAustin });
    expect(root().getAttribute("data-dw-mood")).toBe("day");
    expect(root().style.getPropertyValue("--dw-warmth")).toBe("0.000");
  });

  it("caps night warmth at 0.3", () => {
    theme = createAmbientTheme({ location: austin, now: midnightAustin, nightWarmth: 0.9 });
    expect(root().style.getPropertyValue("--dw-warmth")).toBe("0.300");
  });

  it("lets the user override the mood and remembers the choice", () => {
    theme = createAmbientTheme({ location: austin, now: noonAustin });
    theme.setMode("dark");
    expect(root().getAttribute("data-dw-mood")).toBe("night");
    expect(localStorage.getItem("dw-mode")).toBe("dark");
    theme.destroy();

    theme = createAmbientTheme({ location: austin, now: noonAustin });
    expect(theme.getState().mode).toBe("dark");
  });

  it("rejects unknown modes", () => {
    theme = createAmbientTheme({ location: austin, now: noonAustin });
    // @ts-expect-error - testing a bad value
    expect(() => theme!.setMode("sepia")).toThrow(/Unknown mode/);
  });

  it("notifies subscribers immediately and on change", () => {
    theme = createAmbientTheme({ location: austin, now: noonAustin });
    const seen: string[] = [];
    theme.subscribe((s) => seen.push(s.mood));
    theme.setMode("warm");
    expect(seen).toEqual(["day", "dusk"]);
  });

  it("accepts a fixed weather condition for previews", () => {
    theme = createAmbientTheme({ location: austin, now: noonAustin, weather: "rain" });
    expect(root().getAttribute("data-dw-mood")).toBe("soft");
  });

  it("fetches weather once, caches it, and switches to soft when overcast", async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ current: { weather_code: 3 } })));
    theme = createAmbientTheme({ location: austin, now: noonAustin, weather: true, fetch: fetchMock as typeof fetch });
    await vi.waitFor(() => expect(root().getAttribute("data-dw-mood")).toBe("soft"));

    const url = String((fetchMock.mock.calls[0] as unknown[])[0]);
    expect(url).toContain("latitude=30.3&longitude=-97.7"); // rounded for privacy

    theme.refresh();
    await Promise.resolve();
    expect(fetchMock).toHaveBeenCalledTimes(1); // served from cache
  });

  it("falls back to time-only when the weather request fails", async () => {
    const fetchMock = vi.fn(async () => {
      throw new Error("offline");
    });
    theme = createAmbientTheme({ location: austin, now: noonAustin, weather: true, fetch: fetchMock as typeof fetch });
    await new Promise((r) => setTimeout(r, 0));
    expect(root().getAttribute("data-dw-mood")).toBe("day");
  });
});

describe("palettes and looks", () => {
  beforeEach(() => {
    root().removeAttribute("data-dw-primary");
    root().removeAttribute("data-dw-highlight");
    root().removeAttribute("data-dw-look");
  });

  it("applies a preset by id", () => {
    theme = createAmbientTheme({ location: austin, now: noonAustin, palette: "pistachio-pink" });
    expect(root().getAttribute("data-dw-primary")).toBe("pistachio");
    expect(root().getAttribute("data-dw-highlight")).toBe("pink");
  });

  it("accepts any two colors and remembers them", () => {
    theme = createAmbientTheme({ location: austin, now: noonAustin });
    theme.setPalette("lemon", "leaf");
    expect(root().getAttribute("data-dw-primary")).toBe("lemon");
    expect(localStorage.getItem("dw-mode-palette")).toBe("lemon,leaf");
    theme.destroy();

    theme = createAmbientTheme({ location: austin, now: noonAustin });
    expect(theme.getState().palette).toEqual({ primary: "lemon", highlight: "leaf" });
  });

  it("resets to the mood's default colors with null", () => {
    theme = createAmbientTheme({ location: austin, now: noonAustin, palette: ["ocean", "coral"] });
    theme.setPalette(null);
    expect(root().hasAttribute("data-dw-primary")).toBe(false);
    expect(localStorage.getItem("dw-mode-palette")).toBeNull();
  });

  it("keeps the palette when the mood changes", () => {
    theme = createAmbientTheme({ location: austin, now: noonAustin, palette: "indigo-amber" });
    theme.setMode("dark");
    expect(root().getAttribute("data-dw-mood")).toBe("night");
    expect(root().getAttribute("data-dw-primary")).toBe("indigo");
  });

  it("rejects unknown colors and presets with a helpful message", () => {
    theme = createAmbientTheme({ location: austin, now: noonAustin });
    expect(() => theme!.setPalette("neon", "pink")).toThrow(/Unknown color "neon"/);
    expect(() => theme!.setPalette("not-a-preset")).toThrow(/Unknown preset/);
  });

  it("ignores a saved palette whose color no longer exists", () => {
    localStorage.setItem("dw-mode-palette", "neon,pink");
    theme = createAmbientTheme({ location: austin, now: noonAustin });
    expect(theme.getState().palette).toBeNull();
  });

  it("sets and clears the look", () => {
    theme = createAmbientTheme({ location: austin, now: noonAustin, look: "sketch" });
    expect(root().getAttribute("data-dw-look")).toBe("sketch");
    theme.setLook("paint");
    expect(root().getAttribute("data-dw-look")).toBe("paint");
    theme.setLook("clean");
    expect(root().hasAttribute("data-dw-look")).toBe(false);
    // @ts-expect-error - testing a bad value
    expect(() => theme!.setLook("neon")).toThrow(/Unknown look/);
  });

  it("offers hundreds of combinations", () => {
    expect(COLOR_NAMES.length * (COLOR_NAMES.length - 1)).toBeGreaterThanOrEqual(700);
    expect(Object.keys(PRESETS).length).toBeGreaterThanOrEqual(20);
  });
});

describe("weatherFromCode", () => {
  it.each([
    [0, "clear"], [2, "clear"], [3, "cloudy"], [45, "fog"],
    [61, "rain"], [81, "rain"], [95, "rain"], [73, "snow"], [86, "snow"],
  ])("code %i is %s", (code, expected) => {
    expect(weatherFromCode(code)).toBe(expected);
  });
});

describe("noFlashScript", () => {
  it("applies saved mode, palette and look before the engine loads", () => {
    localStorage.setItem("dw-mode", "dark");
    localStorage.setItem("dw-mode-palette", "pistachio,pink");
    localStorage.setItem("dw-mode-look", "sketch");
    new Function(noFlashScript())();
    expect(root().getAttribute("data-dw-mood")).toBe("night");
    expect(root().getAttribute("data-dw-primary")).toBe("pistachio");
    expect(root().getAttribute("data-dw-highlight")).toBe("pink");
    expect(root().getAttribute("data-dw-look")).toBe("sketch");
  });
});
