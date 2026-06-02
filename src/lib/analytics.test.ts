import { describe, expect, it } from "vitest";
import { analyzeHistory } from "./analytics";
import { questions } from "@/data/questions";
import { QuizResult } from "./types";

// Pick a real question id from each category so the id -> domain lookup resolves.
function firstIdOfCategory(category: string): number {
  const q = questions.find((q) => q.category === category);
  if (!q) throw new Error(`no question for category ${category}`);
  return q.id;
}

const strategyId = firstIdOfCategory("strategy");
const technologyId = firstIdOfCategory("technology");

function result(partial: Partial<QuizResult>): QuizResult {
  return {
    id: Math.random().toString(),
    date: new Date().toISOString(),
    category: "all",
    score: 0,
    total: 0,
    percentage: 0,
    timeSeconds: 60,
    passed: false,
    ...partial,
  };
}

describe("analyzeHistory", () => {
  it("returns empty analytics for empty history", () => {
    const a = analyzeHistory([]);
    expect(a.trend).toEqual([]);
    expect(a.totalAnswered).toBe(0);
    expect(a.weakest).toBeNull();
  });

  it("builds a chronological (oldest-first) trend from newest-first history", () => {
    // getHistory() stores newest first.
    const history = [
      result({ date: "2026-01-03T00:00:00Z", percentage: 90 }),
      result({ date: "2026-01-02T00:00:00Z", percentage: 50 }),
      result({ date: "2026-01-01T00:00:00Z", percentage: 30 }),
    ];
    const a = analyzeHistory(history);
    expect(a.trend.map((p) => p.percentage)).toEqual([30, 50, 90]);
  });

  it("aggregates per-domain accuracy across all outcomes", () => {
    const history = [
      result({
        outcomes: [
          { id: strategyId, answeredIndex: 0, correctIndex: 0, isCorrect: true },
          { id: strategyId, answeredIndex: 1, correctIndex: 0, isCorrect: false },
          { id: technologyId, answeredIndex: 1, correctIndex: 0, isCorrect: false },
        ],
      }),
    ];
    const a = analyzeHistory(history);
    expect(a.totalAnswered).toBe(3);
    expect(a.totalCorrect).toBe(1);

    const strategy = a.categoryAccuracy.find((d) => d.query === "category=strategy");
    expect(strategy).toMatchObject({ correct: 1, total: 2, percentage: 50 });

    // Sorted ascending by percentage, so the weakest domain is first.
    expect(a.categoryAccuracy[0].percentage).toBeLessThanOrEqual(
      a.categoryAccuracy[a.categoryAccuracy.length - 1].percentage
    );
  });

  it("ignores unknown question ids", () => {
    const a = analyzeHistory([
      result({
        outcomes: [{ id: -1, answeredIndex: 0, correctIndex: 0, isCorrect: true }],
      }),
    ]);
    expect(a.totalAnswered).toBe(0);
  });

  it("only flags a weakest domain once enough answers exist", () => {
    const a = analyzeHistory([
      result({
        outcomes: [{ id: strategyId, answeredIndex: 1, correctIndex: 0, isCorrect: false }],
      }),
    ]);
    // A single answered question is below the sampling threshold.
    expect(a.weakest).toBeNull();
  });

  it("counts practice and exam attempts separately", () => {
    const a = analyzeHistory([
      result({ mode: "exam", examType: "it-passport" }),
      result({ mode: "practice" }),
      result({}),
    ]);
    expect(a.examCount).toBe(1);
    expect(a.practiceCount).toBe(2);
  });
});
