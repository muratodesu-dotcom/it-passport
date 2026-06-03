// Per-term study progress for the glossary "doom scroll" feed. Three small,
// independent stores keyed by the exact Japanese term string:
//   - bookmarks: terms saved to revisit ("あとで復習")
//   - known:     terms the learner has mastered and wants out of rotation
//   - SRS:       a lightweight spaced-repetition record so the feed can serve
//                weak terms first (mirrors lib/srs.ts, but keyed by string and
//                with three self-graded outcomes instead of correct/incorrect)
// All stores degrade gracefully when localStorage is unavailable.

const BOOKMARKS_KEY = "it-passport-term-bookmarks";
const KNOWN_KEY = "it-passport-known-terms";
const SRS_KEY = "it-passport-term-srs";
const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_INTERVAL_DAYS = 365;

// ---- shared string-set helpers -------------------------------------------

function loadSet(key: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(key);
    if (!data) return [];
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === "string") : [];
  } catch {
    return [];
  }
}

function saveSet(key: string, values: string[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(values));
  } catch {
    // ignore storage errors so studying still works
  }
}

// Toggle a string in a set store; returns true if the term is now present.
function toggleIn(key: string, term: string): boolean {
  const list = loadSet(key);
  const idx = list.indexOf(term);
  if (idx >= 0) {
    list.splice(idx, 1);
    saveSet(key, list);
    return false;
  }
  list.unshift(term);
  saveSet(key, list);
  return true;
}

// ---- bookmarks ------------------------------------------------------------

export function getTermBookmarks(): string[] {
  return loadSet(BOOKMARKS_KEY);
}

export function isTermBookmarked(term: string): boolean {
  return getTermBookmarks().includes(term);
}

export function toggleTermBookmark(term: string): boolean {
  return toggleIn(BOOKMARKS_KEY, term);
}

// ---- "known" archive ------------------------------------------------------

export function getKnownTerms(): string[] {
  return loadSet(KNOWN_KEY);
}

export function isTermKnown(term: string): boolean {
  return getKnownTerms().includes(term);
}

export function toggleTermKnown(term: string): boolean {
  return toggleIn(KNOWN_KEY, term);
}

// ---- spaced repetition ----------------------------------------------------

// Self-graded outcome when reviewing a term card.
export type TermGrade = "forgot" | "vague" | "known";

export interface TermSrsCard {
  term: string;
  ease: number; // ease factor (>= 1.3); shrinks when a term is hard
  intervalDays: number; // current spacing in days
  due: string; // ISO timestamp of the next review
  reps: number; // consecutive confident recalls
  lapses: number; // times the term was forgotten
  last: string; // ISO timestamp of the last review
}

export type TermSrsState = Record<string, TermSrsCard>;

// Pure scheduler: given the existing card (or undefined) and a self-grade,
// return the next card state. "known" expands the interval, "vague" keeps the
// term coming back soon without counting as a lapse, "forgot" relearns it.
export function scheduleTerm(
  card: TermSrsCard | undefined,
  grade: TermGrade,
  now: Date,
  term: string
): TermSrsCard {
  const nowIso = now.toISOString();
  const prev: TermSrsCard =
    card ?? { term, ease: 2.5, intervalDays: 0, due: nowIso, reps: 0, lapses: 0, last: nowIso };

  let { ease, intervalDays, reps, lapses } = prev;

  if (grade === "known") {
    reps += 1;
    if (reps === 1) intervalDays = 1;
    else if (reps === 2) intervalDays = 3;
    else intervalDays = Math.min(MAX_INTERVAL_DAYS, Math.round(intervalDays * ease));
  } else if (grade === "vague") {
    // Not a full lapse, but recall was shaky: pull the term back in soon and
    // nudge the ease down so it doesn't expand too fast.
    reps = 0;
    intervalDays = 2;
    ease = Math.max(1.3, ease - 0.15);
  } else {
    reps = 0;
    lapses += 1;
    intervalDays = 1; // relearn tomorrow
    ease = Math.max(1.3, ease - 0.2);
  }
  intervalDays = Math.max(1, intervalDays);

  return {
    term,
    ease,
    intervalDays,
    due: new Date(now.getTime() + intervalDays * DAY_MS).toISOString(),
    reps,
    lapses,
    last: nowIso,
  };
}

function loadSrs(): TermSrsState {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(SRS_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? (parsed as TermSrsState) : {};
  } catch {
    return {};
  }
}

function saveSrs(state: TermSrsState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SRS_KEY, JSON.stringify(state));
  } catch {
    // ignore storage errors so grading still works
  }
}

export function getTermSrsState(): TermSrsState {
  return loadSrs();
}

// Record a self-grade for a term and persist its updated schedule.
export function gradeTerm(term: string, grade: TermGrade, now: Date = new Date()): void {
  if (typeof window === "undefined") return;
  const state = loadSrs();
  state[term] = scheduleTerm(state[term], grade, now, term);
  saveSrs(state);
}

// Order terms weak-first: never-graded and overdue terms come first, then by
// soonest due date. Stable for terms with no SRS record (kept in input order).
export function weakFirstScore(card: TermSrsCard | undefined, now: Date = new Date()): number {
  // Lower score = study sooner. Ungraded terms sort just after anything overdue.
  if (!card) return now.getTime();
  return new Date(card.due).getTime();
}
