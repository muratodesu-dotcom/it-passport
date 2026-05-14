import { QuizResult } from "./types";

const STORAGE_KEY = "it-passport-history";
const BOOKMARKS_KEY = "it-passport-bookmarks";

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

// Returns question IDs the user has answered incorrectly at least once.
// Filters out ones whose most recent answer was correct.
export function getWrongQuestionIds(): number[] {
  const history = getHistory();
  const latestOutcome = new Map<number, boolean>();
  // history is newest-first; iterate oldest-first so newer answers overwrite.
  for (let i = history.length - 1; i >= 0; i--) {
    const result = history[i];
    if (!result.outcomes) continue;
    for (const outcome of result.outcomes) {
      latestOutcome.set(outcome.id, outcome.isCorrect);
    }
  }
  const wrong: number[] = [];
  latestOutcome.forEach((isCorrect, id) => {
    if (!isCorrect) wrong.push(id);
  });
  return wrong;
}

export function getBookmarks(): number[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(BOOKMARKS_KEY);
    if (!data) return [];
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === "number") : [];
  } catch {
    return [];
  }
}

export function isBookmarked(id: number): boolean {
  return getBookmarks().includes(id);
}

export function toggleBookmark(id: number): boolean {
  if (typeof window === "undefined") return false;
  const bookmarks = getBookmarks();
  const idx = bookmarks.indexOf(id);
  if (idx >= 0) {
    bookmarks.splice(idx, 1);
  } else {
    bookmarks.unshift(id);
  }
  try {
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
  } catch {
    // ignore
  }
  return idx < 0;
}

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

export interface StreakInfo {
  current: number;
  longest: number;
  studiedToday: boolean;
}

export function getStreak(): StreakInfo {
  const history = getHistory();
  if (history.length === 0) return { current: 0, longest: 0, studiedToday: false };

  const days = new Set<string>();
  history.forEach((h) => {
    const d = new Date(h.date);
    if (!Number.isNaN(d.getTime())) days.add(dateKey(d));
  });

  const today = new Date();
  const todayKey = dateKey(today);
  const studiedToday = days.has(todayKey);

  let current = 0;
  const cursor = new Date(today);
  if (!studiedToday) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (days.has(dateKey(cursor))) {
    current++;
    cursor.setDate(cursor.getDate() - 1);
  }

  let longest = 0;
  const sortedDays = Array.from(days)
    .map((k) => {
      const [y, m, d] = k.split("-").map(Number);
      return new Date(y, m - 1, d).getTime();
    })
    .sort((a, b) => a - b);
  let run = 0;
  let prev = -Infinity;
  const oneDay = 24 * 60 * 60 * 1000;
  for (const t of sortedDays) {
    if (t - prev === oneDay) run++;
    else run = 1;
    if (run > longest) longest = run;
    prev = t;
  }

  return { current, longest, studiedToday };
}
