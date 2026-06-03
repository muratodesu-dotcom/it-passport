import { describe, it, expect } from "vitest";
import { scheduleTerm, TermSrsCard } from "./termProgress";

const t0 = new Date("2026-01-01T00:00:00.000Z");
const daysBetween = (a: string, b: Date) =>
  Math.round((new Date(a).getTime() - b.getTime()) / (24 * 60 * 60 * 1000));

describe("term SRS scheduler", () => {
  it("starts a new 'known' card at a 1-day interval", () => {
    const c = scheduleTerm(undefined, "known", t0, "特許権");
    expect(c.term).toBe("特許権");
    expect(c.reps).toBe(1);
    expect(c.intervalDays).toBe(1);
    expect(daysBetween(c.due, t0)).toBe(1);
  });

  it("expands the interval on successive 'known' grades", () => {
    let c = scheduleTerm(undefined, "known", t0, "x"); // reps1 -> 1d
    c = scheduleTerm(c, "known", t0, "x"); // reps2 -> 3d
    expect(c.intervalDays).toBe(3);
    const before = c.intervalDays;
    c = scheduleTerm(c, "known", t0, "x"); // reps3 -> interval*ease
    expect(c.intervalDays).toBeGreaterThan(before);
  });

  it("'forgot' resets reps, adds a lapse, and lowers ease", () => {
    let c = scheduleTerm(undefined, "known", t0, "x");
    c = scheduleTerm(c, "known", t0, "x");
    c = scheduleTerm(c, "known", t0, "x"); // build up some interval
    const easeBefore = c.ease;
    c = scheduleTerm(c, "forgot", t0, "x");
    expect(c.reps).toBe(0);
    expect(c.lapses).toBe(1);
    expect(c.intervalDays).toBe(1);
    expect(c.ease).toBeLessThan(easeBefore);
    expect(c.ease).toBeGreaterThanOrEqual(1.3);
  });

  it("'vague' keeps the term coming back soon without counting as a lapse", () => {
    let c = scheduleTerm(undefined, "known", t0, "x");
    c = scheduleTerm(c, "known", t0, "x"); // 3d
    const easeBefore = c.ease;
    c = scheduleTerm(c, "vague", t0, "x");
    expect(c.lapses).toBe(0);
    expect(c.reps).toBe(0);
    expect(c.intervalDays).toBe(2);
    expect(c.ease).toBeLessThan(easeBefore);
  });

  it("never drops ease below the 1.3 floor", () => {
    let c: TermSrsCard | undefined;
    for (let i = 0; i < 20; i++) c = scheduleTerm(c, "forgot", t0, "x");
    expect(c!.ease).toBe(1.3);
  });
});
