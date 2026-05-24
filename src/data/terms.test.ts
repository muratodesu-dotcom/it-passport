import { describe, it, expect } from "vitest";
import { termPairs, getTermsByExam, itPassportTerms, chizaiTerms } from "./terms";

describe("glossary integrity", () => {
  it("has unique (category, term) keys", () => {
    const keys = termPairs.map((t) => `${t.category}|${t.term}`);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("provides a substantial 知財3級 term set tagged with ipField", () => {
    expect(chizaiTerms.length).toBeGreaterThanOrEqual(60);
    for (const t of chizaiTerms) {
      expect(t.ipField).toBeDefined();
    }
  });

  it("keeps 知財3級専用用語 out of the ITパスポート glossary", () => {
    const chizaiOnly = chizaiTerms.filter((t) => !(t.exams ?? ["it-passport"]).includes("it-passport"));
    expect(chizaiOnly.length).toBeGreaterThan(0);
    const itTerms = new Set(itPassportTerms.map((t) => `${t.category}|${t.term}`));
    for (const t of chizaiOnly) {
      expect(itTerms.has(`${t.category}|${t.term}`)).toBe(false);
    }
  });

  it("untagged terms default to ITパスポート only", () => {
    const untagged = termPairs.find((t) => t.exams === undefined);
    expect(untagged).toBeDefined();
    expect(getTermsByExam("it-passport")).toContain(untagged);
    expect(getTermsByExam("chizai")).not.toContain(untagged);
  });
});
