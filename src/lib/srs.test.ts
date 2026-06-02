import { describe, it, expect } from "vitest";
import { schedule, SrsCard } from "./srs";

const t0 = new Date("2026-01-01T00:00:00.000Z");
const daysBetween = (a: string, b: Date) =>
  Math.round((new Date(a).getTime() - b.getTime()) / (24 * 60 * 60 * 1000));

describe("srs scheduler", () => {
  it("starts a new correct card at a 1-day interval", () => {
    const c = schedule(undefined, true, t0, 5);
    expect(c.id).toBe(5);
    expect(c.reps).toBe(1);
    expect(c.intervalDays).toBe(1);
    expect(daysBetween(c.due, t0)).toBe(1);
  });

  it("expands the interval on successive correct answers", () => {
    let c = schedule(undefined, true, t0, 1); // reps1 -> 1d
    c = schedule(c, true, t0, 1); // reps2 -> 3d
    expect(c.intervalDays).toBe(3);
    const before = c.intervalDays;
    c = schedule(c, true, t0, 1); // reps3 -> interval*ease
    expect(c.intervalDays).toBeGreaterThan(before);
  });

  it("resets interval and lowers ease on a wrong answer", () => {
    let c = schedule(undefined, true, t0, 1);
    c = schedule(c, true, t0, 1);
    c = schedule(c, true, t0, 1); // build up some interval
    const easeBefore = c.ease;
    c = schedule(c, false, t0, 1);
    expect(c.reps).toBe(0);
    expect(c.lapses).toBe(1);
    expect(c.intervalDays).toBe(1);
    expect(c.ease).toBeLessThan(easeBefore);
    expect(c.ease).toBeGreaterThanOrEqual(1.3);
  });

  it("never drops ease below the 1.3 floor", () => {
    let c: SrsCard | undefined;
    for (let i = 0; i < 20; i++) c = schedule(c, false, t0, 1);
    expect(c!.ease).toBeGreaterThanOrEqual(1.3);
  });
});
