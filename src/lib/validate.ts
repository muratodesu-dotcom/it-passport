// Shape checks for what the app keeps in browser storage. Data normally comes
// from the app itself, but an imported backup file (or a damaged store) can
// hold anything, and a malformed record must never be able to crash a page.
// Readers filter with these; the backup import refuses anything that fails.

import type { QuestionOutcome, QuizResult } from "./types";
import type { SrsCard } from "./srs";
import type { TermSrsCard } from "./termProgress";

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
const isNum = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);
const isDate = (v: unknown): v is string => typeof v === "string" && !Number.isNaN(Date.parse(v));

export function isQuestionOutcome(v: unknown): v is QuestionOutcome {
  return (
    isObj(v) &&
    isNum(v.id) &&
    (v.answeredIndex === null || isNum(v.answeredIndex)) &&
    isNum(v.correctIndex) &&
    typeof v.isCorrect === "boolean"
  );
}

export function isQuizResult(v: unknown): v is QuizResult {
  return (
    isObj(v) &&
    typeof v.id === "string" &&
    isDate(v.date) &&
    typeof v.category === "string" &&
    isNum(v.score) &&
    isNum(v.total) &&
    isNum(v.percentage) &&
    isNum(v.timeSeconds) &&
    typeof v.passed === "boolean" &&
    (v.mode === undefined || v.mode === "practice" || v.mode === "exam") &&
    (v.examType === undefined || v.examType === "it-passport" || v.examType === "chizai" || v.examType === "dev") &&
    (v.outcomes === undefined || (Array.isArray(v.outcomes) && v.outcomes.every(isQuestionOutcome)))
  );
}

function hasSchedule(v: Record<string, unknown>): boolean {
  return (
    isNum(v.ease) &&
    v.ease >= 1 &&
    isNum(v.intervalDays) &&
    v.intervalDays >= 0 &&
    isDate(v.due) &&
    isNum(v.reps) &&
    isNum(v.lapses) &&
    isDate(v.last)
  );
}

export function isSrsCard(v: unknown): v is SrsCard {
  return isObj(v) && isNum(v.id) && hasSchedule(v);
}

export function isTermSrsCard(v: unknown): v is TermSrsCard {
  return isObj(v) && typeof v.term === "string" && hasSchedule(v);
}

/** Keep only the valid entries of a stored card map. */
export function validCards<T>(raw: unknown, isCard: (v: unknown) => v is T): Record<string, T> {
  const out: Record<string, T> = {};
  if (!isObj(raw)) return out;
  for (const [key, card] of Object.entries(raw)) if (isCard(card)) out[key] = card;
  return out;
}
