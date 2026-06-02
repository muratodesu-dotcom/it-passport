import { describe, it, expect } from "vitest";
import {
  questions,
  getQuestionsByExam,
  getChizaiQuestionsByField,
  itPassportQuestions,
  chizaiQuestions,
  withShuffledOptions,
} from "./questions";
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

  it("getChizaiQuestionsByField filters the chizai pool by IP field", () => {
    expect(getChizaiQuestionsByField("all").length).toBe(chizaiQuestions.length);
    const fields = ["patent", "design-trademark", "copyright", "other"] as const;
    let sum = 0;
    for (const f of fields) {
      const qs = getChizaiQuestionsByField(f);
      expect(qs.length).toBeGreaterThan(0);
      for (const q of qs) expect(q.ipField ?? "other").toBe(f);
      sum += qs.length;
    }
    // The four fields partition the whole chizai pool.
    expect(sum).toBe(chizaiQuestions.length);
  });

  it("untagged questions default to ITパスポート only", () => {
    const untagged = questions.find((q) => q.exams === undefined);
    expect(untagged).toBeDefined();
    expect(getQuestionsByExam("it-passport")).toContain(untagged);
    expect(getQuestionsByExam("chizai")).not.toContain(untagged);
  });
});

describe("withShuffledOptions", () => {
  it("keeps the same options and points correctIndex at the same answer", () => {
    for (const q of questions) {
      const s = withShuffledOptions(q);
      // Same multiset of options, just reordered.
      expect([...s.options].sort()).toEqual([...q.options].sort());
      // correctIndex still resolves to the original correct answer text.
      expect(s.options[s.correctIndex]).toBe(q.options[q.correctIndex]);
      // Identity and metadata are preserved.
      expect(s.id).toBe(q.id);
      expect(s.explanation).toBe(q.explanation);
    }
  });

  it("is deterministic for a given seed", () => {
    const q = questions[0];
    expect(withShuffledOptions(q)).toEqual(withShuffledOptions(q));
    expect(withShuffledOptions(q, 42)).toEqual(withShuffledOptions(q, 42));
  });

  it("spreads the correct answer across positions instead of always 'A'", () => {
    // The raw bank authors almost every correct answer as the first option, so
    // without shuffling ~96% of answers would be "A". After shuffling, no single
    // position should dominate.
    const counts = new Map<number, number>();
    for (const q of itPassportQuestions) {
      const i = withShuffledOptions(q).correctIndex;
      counts.set(i, (counts.get(i) ?? 0) + 1);
    }
    const total = itPassportQuestions.length;
    const maxShare = Math.max(...counts.values()) / total;
    expect(maxShare).toBeLessThan(0.45);
    // The four-option questions that dominate the bank fill all four slots.
    expect([...counts.keys()].filter((k) => (counts.get(k) ?? 0) > 0).length).toBeGreaterThanOrEqual(4);
  });
});
