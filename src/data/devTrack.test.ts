import { describe, it, expect } from "vitest";
import { devQuestions, itPassportQuestions, chizaiQuestions, getQuestionsByExamField, questions } from "./questions";
import { devTerms } from "./terms";
import { gitCommandQuestions } from "./devDrills";
import { fieldOptions, hasExamMode, itemField, parseExam } from "@/lib/examFields";
import type { DevField } from "@/lib/types";
import { analyzeHistory } from "@/lib/analytics";

const FIELDS: DevField[] = ["git", "database", "vercel", "web", "ai"];

describe("AIエンジニア track", () => {
  it("has questions and terms in every field", () => {
    for (const f of FIELDS) {
      expect(devQuestions.filter((q) => q.devField === f).length).toBeGreaterThanOrEqual(15);
      expect(devTerms.filter((t) => t.devField === f).length).toBeGreaterThanOrEqual(20);
    }
  });

  it("tags every dev question and term with a field", () => {
    expect(devQuestions.every((q) => q.devField && FIELDS.includes(q.devField))).toBe(true);
    expect(devTerms.every((t) => t.devField && FIELDS.includes(t.devField))).toBe(true);
  });

  it("keeps dev-only questions out of the exam banks", () => {
    const devOnly = new Set(devQuestions.map((q) => q.id));
    expect(itPassportQuestions.some((q) => devOnly.has(q.id))).toBe(false);
    expect(chizaiQuestions.some((q) => devOnly.has(q.id))).toBe(false);
  });

  it("has unique headwords within the track", () => {
    const terms = devTerms.map((t) => t.term);
    expect(new Set(terms).size).toBe(terms.length);
  });

  it("is written in English", () => {
    const jp = /[\u3040-\u30ff\u4e00-\u9fff]/;
    for (const q of devQuestions) {
      expect(jp.test([q.question, q.explanation, ...q.options].join(" "))).toBe(false);
    }
    for (const t of devTerms) {
      expect(jp.test([t.term, t.english, t.description].join(" "))).toBe(false);
    }
    for (const q of gitCommandQuestions) {
      expect(jp.test([q.prompt, q.explanation ?? ""].join(" "))).toBe(false);
    }
  });

  it("uses unique question ids across the whole bank", () => {
    const ids = questions.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("filters practice pools by field", () => {
    expect(getQuestionsByExamField("dev", "all")).toHaveLength(devQuestions.length);
    for (const f of FIELDS) {
      expect(getQuestionsByExamField("dev", f).every((q) => q.devField === f)).toBe(true);
    }
  });

  it("has four distinct options per question and a valid answer", () => {
    for (const q of devQuestions) {
      expect(q.options).toHaveLength(4);
      expect(new Set(q.options).size).toBe(4);
      expect(q.correctIndex).toBeGreaterThanOrEqual(0);
      expect(q.correctIndex).toBeLessThan(4);
    }
    for (const q of gitCommandQuestions) {
      expect(new Set(q.options).size).toBe(q.options.length);
    }
  });

  it("parses the track and offers practice only", () => {
    expect(parseExam("dev")).toBe("dev");
    expect(hasExamMode("dev")).toBe(false);
    expect(hasExamMode("it-passport")).toBe(true);
    expect(fieldOptions("dev").map((o) => o.id)).toEqual(["all", ...FIELDS]);
    expect(itemField("dev", { category: "technology", devField: "ai" })).toBe("ai");
  });

  it("keeps dev answers out of the ITパスポート category breakdown", () => {
    const q = devQuestions.find((x) => x.devField === "database")!;
    const a = analyzeHistory([
      {
        id: "1", date: new Date().toISOString(), category: "database", score: 1, total: 1,
        percentage: 100, timeSeconds: 10, passed: true, mode: "practice", examType: "dev",
        outcomes: [{ id: q.id, answeredIndex: 0, correctIndex: 0, isCorrect: true }],
      },
    ]);
    expect(a.categoryAccuracy).toEqual([]);
    expect(a.devFieldAccuracy.map((d) => d.query)).toEqual(["exam=dev&field=database"]);
  });
});
