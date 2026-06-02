// Lightweight spaced-repetition scheduler (SM-2 inspired, day granularity).
// The IT/IP exams are fact- and number-heavy, so retention matters more than
// one-off exposure. Each answered question becomes a "card" with a due date;
// correct answers push the next review further out, wrong answers bring it
// back to tomorrow. State is stored per-question in localStorage.

const SRS_KEY = "it-passport-srs";
const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_INTERVAL_DAYS = 365;

export interface SrsCard {
  id: number;
  ease: number; // ease factor (>= 1.3); shrinks when a card is forgotten
  intervalDays: number; // current spacing in days
  due: string; // ISO timestamp of the next review
  reps: number; // consecutive correct answers
  lapses: number; // times the card has been forgotten
  last: string; // ISO timestamp of the last review
}

export type SrsState = Record<number, SrsCard>;

function load(): SrsState {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(SRS_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? (parsed as SrsState) : {};
  } catch {
    return {};
  }
}

function save(state: SrsState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SRS_KEY, JSON.stringify(state));
  } catch {
    // ignore storage errors so answering still works
  }
}

// Pure scheduler: given the existing card (or undefined for a new one) and
// whether the latest answer was correct, return the next card state.
export function schedule(
  card: SrsCard | undefined,
  correct: boolean,
  now: Date,
  id: number
): SrsCard {
  const nowIso = now.toISOString();
  const prev: SrsCard =
    card ?? { id, ease: 2.5, intervalDays: 0, due: nowIso, reps: 0, lapses: 0, last: nowIso };

  let { ease, intervalDays, reps, lapses } = prev;

  if (correct) {
    reps += 1;
    if (reps === 1) intervalDays = 1;
    else if (reps === 2) intervalDays = 3;
    else intervalDays = Math.min(MAX_INTERVAL_DAYS, Math.round(intervalDays * ease));
  } else {
    reps = 0;
    lapses += 1;
    intervalDays = 1; // relearn tomorrow
    ease = Math.max(1.3, ease - 0.2);
  }
  intervalDays = Math.max(1, intervalDays);

  return {
    id,
    ease,
    intervalDays,
    due: new Date(now.getTime() + intervalDays * DAY_MS).toISOString(),
    reps,
    lapses,
    last: nowIso,
  };
}

export function getSrsState(): SrsState {
  return load();
}

// Feed finished-quiz outcomes into the scheduler.
export function recordOutcomes(
  outcomes: { id: number; isCorrect: boolean }[],
  now: Date = new Date()
): void {
  if (typeof window === "undefined" || outcomes.length === 0) return;
  const state = load();
  for (const o of outcomes) {
    state[o.id] = schedule(state[o.id], o.isCorrect, now, o.id);
  }
  save(state);
}

// Question ids whose review is due (due timestamp at or before now), soonest first.
export function getDueQuestionIds(now: Date = new Date()): number[] {
  const t = now.getTime();
  return Object.values(load())
    .filter((c) => new Date(c.due).getTime() <= t)
    .sort((a, b) => new Date(a.due).getTime() - new Date(b.due).getTime())
    .map((c) => c.id);
}

export function getSrsStats(now: Date = new Date()): { tracked: number; due: number } {
  const t = now.getTime();
  const cards = Object.values(load());
  return { tracked: cards.length, due: cards.filter((c) => new Date(c.due).getTime() <= t).length };
}
