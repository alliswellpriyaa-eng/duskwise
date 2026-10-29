import { describe, expect, it } from "vitest";
import { getSunTimes } from "../src/engine/sun";

const minutesBetween = (a: Date, b: Date) => Math.abs(a.getTime() - b.getTime()) / 60_000;

describe("getSunTimes", () => {
  it("matches published Austin times on the June solstice (within 5 minutes)", () => {
    // Austin, TX: sunrise ~6:29 CDT (11:29Z), sunset ~8:36 CDT (01:36Z next day)
    const sun = getSunTimes(new Date("2026-06-21T17:00:00Z"), 30.27, -97.74);
    expect(minutesBetween(sun.sunrise!, new Date("2026-06-21T11:29:00Z"))).toBeLessThan(5);
    expect(minutesBetween(sun.sunset!, new Date("2026-06-22T01:36:00Z"))).toBeLessThan(5);
  });

  it("matches published London times on the December solstice (within 5 minutes)", () => {
    // London: sunrise ~08:04 GMT, sunset ~15:54 GMT
    const sun = getSunTimes(new Date("2026-12-21T12:00:00Z"), 51.51, -0.13);
    expect(minutesBetween(sun.sunrise!, new Date("2026-12-21T08:04:00Z"))).toBeLessThan(5);
    expect(minutesBetween(sun.sunset!, new Date("2026-12-21T15:54:00Z"))).toBeLessThan(5);
  });

  it("returns the same solar day whether asked in the morning or late evening", () => {
    const morning = getSunTimes(new Date("2026-06-21T12:00:00Z"), 30.27, -97.74); // 7am CDT
    const evening = getSunTimes(new Date("2026-06-22T03:00:00Z"), 30.27, -97.74); // 10pm CDT
    expect(minutesBetween(morning.sunset!, evening.sunset!)).toBeLessThan(1);
  });

  it("reports polar night and polar day", () => {
    expect(getSunTimes(new Date("2026-12-21T12:00:00Z"), 78.2, 15.6).polar).toBe("night"); // Svalbard
    expect(getSunTimes(new Date("2026-06-21T12:00:00Z"), 78.2, 15.6).polar).toBe("day");
  });
});
