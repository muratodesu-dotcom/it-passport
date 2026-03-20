import { QuizResult } from "./types";

const STORAGE_KEY = "it-passport-history";

export function getHistory(): QuizResult[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveResult(result: QuizResult): void {
  if (typeof window === "undefined") return;

  try {
    const history = getHistory();
    history.unshift(result);
    // Keep last 50 results
    if (history.length > 50) history.length = 50;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch {
    // Ignore storage errors so quiz completion still works.
  }
}

export function clearHistory(): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage errors so the page remains usable.
  }
}
