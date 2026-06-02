import { describe, it, expect } from "vitest";
import { questions } from "./questions";
import { explanationsEn } from "./explanationsEn";

describe("English explanations coverage", () => {
  it("has a non-empty English explanation for every question", () => {
    const missing = questions
      .filter((q) => !explanationsEn[q.id] || explanationsEn[q.id].trim() === "")
      .map((q) => q.id);
    expect(missing).toEqual([]);
  });

  it("has no English entries for non-existent question ids", () => {
    const ids = new Set(questions.map((q) => q.id));
    const orphans = Object.keys(explanationsEn)
      .map(Number)
      .filter((id) => !ids.has(id));
    expect(orphans).toEqual([]);
  });
});
