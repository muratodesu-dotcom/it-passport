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

export function getStudyStreak(): { current: number; longest: number; lastStudyDate: string | null } {
  const dateKeys = new Set<string>();
  for (const result of getHistory()) {
    const d = new Date(result.date);
    if (Number.isNaN(d.getTime())) continue;
    dateKeys.add(d.toISOString().slice(0, 10));
  }
  if (dateKeys.size === 0) return { current: 0, longest: 0, lastStudyDate: null };

  const sortedDays = Array.from(dateKeys).sort();
  const lastStudyDate = sortedDays[sortedDays.length - 1];

  let longest = 1;
  let runRunning = 1;
  for (let i = 1; i < sortedDays.length; i++) {
    const prev = new Date(sortedDays[i - 1]);
    const cur = new Date(sortedDays[i]);
    const diffDays = Math.round((cur.getTime() - prev.getTime()) / 86_400_000);
    if (diffDays === 1) {
      runRunning += 1;
      longest = Math.max(longest, runRunning);
    } else {
      runRunning = 1;
    }
  }

  // Current streak: count back from today
  const today = new Date();
  const todayKey = today.toISOString().slice(0, 10);
  let cursor = new Date(todayKey);
  let current = 0;
  if (dateKeys.has(todayKey)) {
    current = 1;
    cursor.setDate(cursor.getDate() - 1);
    while (dateKeys.has(cursor.toISOString().slice(0, 10))) {
      current += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
  } else {
    // Allow yesterday as "current streak" continuation
    cursor.setDate(cursor.getDate() - 1);
    if (dateKeys.has(cursor.toISOString().slice(0, 10))) {
      current = 1;
      cursor.setDate(cursor.getDate() - 1);
      while (dateKeys.has(cursor.toISOString().slice(0, 10))) {
        current += 1;
        cursor.setDate(cursor.getDate() - 1);
      }
    }
  }

  return { current, longest, lastStudyDate };
}
