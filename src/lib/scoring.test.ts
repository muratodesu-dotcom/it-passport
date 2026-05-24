import { describe, it, expect } from "vitest";
import { gradeExam, GradeItem } from "./scoring";

function makeItems(domainKey: string, domainLabel: string, correct: number, wrong: number): GradeItem[] {
  return [
    ...Array.from({ length: correct }, () => ({ isCorrect: true, domainKey, domainLabel })),
    ...Array.from({ length: wrong }, () => ({ isCorrect: false, domainKey, domainLabel })),
  ];
}

describe("gradeExam – ITパスポート", () => {
  it("passes when overall ≥60% and every domain ≥30%", () => {
    const items = [
      ...makeItems("strategy", "ストラテジ系", 7, 3),
      ...makeItems("management", "マネジメント系", 7, 3),
      ...makeItems("technology", "テクノロジ系", 7, 3),
    ];
    const result = gradeExam("it-passport", items);
    expect(result.percentage).toBe(70);
    expect(result.overallPassed).toBe(true);
    expect(result.passed).toBe(true);
    expect(result.failReasons).toHaveLength(0);
  });

  it("fails when a single domain is below 30% even if overall ≥60%", () => {
    const items = [
      ...makeItems("strategy", "ストラテジ系", 2, 8), // 20%
      ...makeItems("management", "マネジメント系", 10, 0),
      ...makeItems("technology", "テクノロジ系", 10, 0),
    ];
    const result = gradeExam("it-passport", items);
    expect(result.overallPassed).toBe(true);
    expect(result.passed).toBe(false);
    expect(result.failReasons.join("")).toContain("ストラテジ系");
  });

  it("fails when overall is below 60%", () => {
    const items = [
      ...makeItems("strategy", "ストラテジ系", 3, 7),
      ...makeItems("management", "マネジメント系", 3, 7),
      ...makeItems("technology", "テクノロジ系", 3, 7),
    ];
    const result = gradeExam("it-passport", items);
    expect(result.percentage).toBe(30);
    expect(result.passed).toBe(false);
    expect(result.failReasons.join("")).toContain("総合");
  });
});

describe("gradeExam – 知財3級", () => {
  it("passes at exactly 70%", () => {
    const result = gradeExam("chizai", makeItems("patent", "特許・実用新案", 21, 9));
    expect(result.percentage).toBe(70);
    expect(result.passed).toBe(true);
  });

  it("fails below 70% and has no per-domain requirement", () => {
    const result = gradeExam("chizai", [
      ...makeItems("patent", "特許・実用新案", 0, 10),
      ...makeItems("copyright", "著作権", 20, 0),
    ]);
    expect(result.passed).toBe(false);
    // 知財3級 has no domain threshold, so a 0% domain must not appear as a fail reason.
    expect(result.domainResults.every((d) => d.passed)).toBe(true);
  });
});
