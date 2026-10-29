import { describe, expect, it } from "vitest";
import { pickMood, warmthAt } from "../src/engine/mood";
import type { SunTimes } from "../src/engine/types";

// A simple day: sunrise 07:00, sunset 19:00 (UTC, to keep the test readable).
const sun: SunTimes = {
  sunrise: new Date("2026-03-20T07:00:00Z"),
  sunset: new Date("2026-03-20T19:00:00Z"),
};
const at = (hhmm: string) => new Date(`2026-03-20T${hhmm}:00Z`);

describe("pickMood", () => {
  it.each([
    ["03:00", "night"],
    ["06:29", "night"],
    ["06:30", "dusk"], // dawn starts 30 min before sunrise
    ["07:29", "dusk"],
    ["07:30", "day"],
    ["12:00", "day"],
    ["17:59", "day"],
    ["18:00", "dusk"], // dusk starts 60 min before sunset
    ["19:29", "dusk"],
    ["19:30", "night"],
    ["23:59", "night"],
  ])("at %s the mood is %s", (time, mood) => {
    expect(pickMood({ now: at(time), sun })).toBe(mood);
  });

  it("uses the soft mood on grey daytime weather", () => {
    for (const weather of ["cloudy", "rain", "snow", "fog"] as const) {
      expect(pickMood({ now: at("12:00"), sun, weather })).toBe("soft");
    }
    expect(pickMood({ now: at("12:00"), sun, weather: "clear" })).toBe("day");
  });

  it("ignores weather at night", () => {
    expect(pickMood({ now: at("23:00"), sun, weather: "rain" })).toBe("night");
  });

  it("lets the user's mode win over everything", () => {
    expect(pickMood({ now: at("23:00"), sun, mode: "light" })).toBe("day");
    expect(pickMood({ now: at("12:00"), sun, mode: "dark" })).toBe("night");
    expect(pickMood({ now: at("12:00"), sun, mode: "warm" })).toBe("dusk");
  });

  it("handles polar day and night", () => {
    expect(pickMood({ now: at("12:00"), sun: { sunrise: null, sunset: null, polar: "night" } })).toBe("night");
    expect(pickMood({ now: at("02:00"), sun: { sunrise: null, sunset: null, polar: "day" } })).toBe("day");
  });

  it("falls back to the OS preference when sun times are unknown", () => {
    expect(pickMood({ now: at("12:00"), sun: null, prefersDark: true })).toBe("night");
    expect(pickMood({ now: at("12:00"), sun: null, prefersDark: false })).toBe("day");
  });
});

describe("warmthAt", () => {
  it("is 0 by day and 1 at night", () => {
    expect(warmthAt(at("12:00"), sun)).toBe(0);
    expect(warmthAt(at("23:00"), sun)).toBe(1);
    expect(warmthAt(at("03:00"), sun)).toBe(1);
  });

  it("ramps up gradually around sunset", () => {
    expect(warmthAt(at("18:00"), sun)).toBe(0);
    expect(warmthAt(at("19:00"), sun)).toBeCloseTo(0.5);
    expect(warmthAt(at("20:00"), sun)).toBe(1);
  });

  it("ramps down around sunrise", () => {
    expect(warmthAt(at("06:30"), sun)).toBe(1);
    expect(warmthAt(at("07:00"), sun)).toBeCloseTo(0.5);
    expect(warmthAt(at("07:30"), sun)).toBe(0);
  });
});
