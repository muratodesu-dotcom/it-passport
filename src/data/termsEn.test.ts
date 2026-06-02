import { describe, it, expect } from "vitest";
import { termPairs } from "./terms";
import { termsEn } from "./termsEn";

describe("English term descriptions", () => {
  it("has no entries for terms that don't exist in the glossary", () => {
    const terms = new Set(termPairs.map((t) => t.term));
    const orphans = Object.keys(termsEn).filter((k) => !terms.has(k));
    expect(orphans).toEqual([]);
  });

  it("has no empty descriptions", () => {
    const empty = Object.entries(termsEn)
      .filter(([, v]) => v.trim() === "")
      .map(([k]) => k);
    expect(empty).toEqual([]);
  });

  it("covers the full 知財3級 glossary", () => {
    // The 知財 terms (those tagged with an ipField) are fully translated; this
    // locks that coverage in so a new 知財 term can't ship without English.
    const chizai = termPairs.filter((t) => t.ipField);
    const missing = [...new Set(chizai.map((t) => t.term))].filter((t) => !termsEn[t]);
    expect(missing).toEqual([]);
  });
});
