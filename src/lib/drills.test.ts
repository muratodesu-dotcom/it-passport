import { describe, it, expect } from "vitest";
import { chizaiTerms, itPassportTerms } from "@/data/terms";
import { genAcronym, genCategoryClassify, genDefToTerm, genEnJp, genOddOneOut, genTermToDef, genTrueFalse } from "./drills";
import { fieldOptions, itemField } from "./examFields";

function assertValid(qs: ReturnType<typeof genTermToDef>) {
  expect(qs.length).toBeGreaterThan(0);
  for (const q of qs) {
    expect(q.options.length).toBeGreaterThanOrEqual(2);
    expect(q.correctIndex).toBeGreaterThanOrEqual(0);
    expect(q.correctIndex).toBeLessThan(q.options.length);
    expect(new Set(q.options).size).toBe(q.options.length); // no duplicate options
  }
}

describe("drill generators", () => {
  it("term→definition produces valid 4-option questions", () => {
    const qs = genTermToDef(chizaiTerms, 10);
    assertValid(qs);
    expect(qs[0].options.length).toBe(4);
  });

  it("definition→term produces valid questions", () => {
    assertValid(genDefToTerm(chizaiTerms, 10));
  });

  it("EN/JP drill produces valid questions", () => {
    assertValid(genEnJp(chizaiTerms, 10));
  });

  it("true/false drill is a 2-option question", () => {
    const qs = genTrueFalse(chizaiTerms, 10);
    expect(qs.length).toBe(10);
    for (const q of qs) expect(q.options.length).toBe(2);
  });

  it("odd-one-out picks the term from the minority field", () => {
    const groups = fieldOptions("chizai")
      .filter((o) => o.id !== "all")
      .map((o) => ({ key: o.id, label: o.label, terms: chizaiTerms.filter((t) => itemField("chizai", t) === o.id) }));
    const qs = genOddOneOut(groups, 8);
    assertValid(qs);
  });

  it("3分野分類 produces 3-option questions", () => {
    const qs = genCategoryClassify(itPassportTerms, 10);
    expect(qs.length).toBe(10);
    for (const q of qs) expect(q.options.length).toBe(3);
    assertValid(qs);
  });

  it("acronym drill produces valid questions from ITパスポート terms", () => {
    assertValid(genAcronym(itPassportTerms, 10));
  });
});
