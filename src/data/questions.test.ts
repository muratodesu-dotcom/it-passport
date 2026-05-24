import { describe, it, expect } from "vitest";
import { questions, getQuestionsByExam, itPassportQuestions, chizaiQuestions } from "./questions";
import { examRules } from "@/lib/scoring";

describe("question bank integrity", () => {
  it("has unique ids", () => {
    const ids = questions.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every question has a valid correctIndex and ≥2 options", () => {
    for (const q of questions) {
      expect(q.options.length).toBeGreaterThanOrEqual(2);
      expect(q.correctIndex).toBeGreaterThanOrEqual(0);
      expect(q.correctIndex).toBeLessThan(q.options.length);
    }
  });
});

describe("exam pools", () => {
  it("provides enough questions for each exam's question count", () => {
    expect(itPassportQuestions.length).toBeGreaterThanOrEqual(examRules["it-passport"].questionCount);
    expect(chizaiQuestions.length).toBeGreaterThanOrEqual(examRules.chizai.questionCount);
  });

  it("keeps 知財3級専用問題 out of the ITパスポート pool", () => {
    const chizaiOnly = chizaiQuestions.filter((q) => !(q.exams ?? ["it-passport"]).includes("it-passport"));
    expect(chizaiOnly.length).toBeGreaterThan(0);
    const itPassportIds = new Set(itPassportQuestions.map((q) => q.id));
    for (const q of chizaiOnly) {
      expect(itPassportIds.has(q.id)).toBe(false);
    }
  });

  it("tags every 知財3級 question with an ipField for the breakdown", () => {
    for (const q of getQuestionsByExam("chizai")) {
      expect(q.ipField).toBeDefined();
    }
  });

  it("untagged questions default to ITパスポート only", () => {
    const untagged = questions.find((q) => q.exams === undefined);
    expect(untagged).toBeDefined();
    expect(getQuestionsByExam("it-passport")).toContain(untagged);
    expect(getQuestionsByExam("chizai")).not.toContain(untagged);
  });
});
