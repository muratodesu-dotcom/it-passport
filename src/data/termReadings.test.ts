import { describe, it, expect } from "vitest";
import { termPairs } from "./terms";
import { termReadings } from "./termReadings";

const hasKanji = (s: string) => /[一-鿿々]/.test(s);
const hasLatin = (s: string) => /[A-Za-z0-9]/.test(s);
const hasKatakana = (s: string) => /[゠-ヿー]/.test(s);
// A term needs furigana when it is written purely in kanji (+ hiragana
// okurigana): no katakana loanwords and no Latin acronyms, which read fine
// on their own.
const needsReading = (s: string) => hasKanji(s) && !hasLatin(s) && !hasKatakana(s);

describe("term readings (furigana)", () => {
  it("has a reading for every kanji-only term", () => {
    const uniq = [...new Set(termPairs.map((t) => t.term))];
    const missing = uniq.filter((t) => needsReading(t) && !termReadings[t]);
    expect(missing).toEqual([]);
  });

  it("has no readings for terms that don't exist in the glossary", () => {
    const terms = new Set(termPairs.map((t) => t.term));
    const orphans = Object.keys(termReadings).filter((k) => !terms.has(k));
    expect(orphans).toEqual([]);
  });

  it("readings contain only hiragana", () => {
    const bad = Object.entries(termReadings)
      .filter(([, r]) => !/^[ぁ-ゟ]+$/.test(r))
      .map(([k]) => k);
    expect(bad).toEqual([]);
  });
});
