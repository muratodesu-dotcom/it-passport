import { ExamType, QuizMode } from "./types";

const SESSION_KEY = "it-passport-last-quiz";

export interface QuizSessionPayload {
  category: string;
  mode: QuizMode;
  examType?: ExamType;
  source: "category" | "wrong" | "bookmarks";
  questionIds: number[];
  answers: (number | null)[];
  timeSeconds: number;
}

export function saveQuizSession(payload: QuizSessionPayload): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(payload));
  } catch {
    // ignore
  }
}

export function loadQuizSession(): QuizSessionPayload | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as QuizSessionPayload;
  } catch {
    return null;
  }
}

export function clearQuizSession(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // ignore
  }
}
