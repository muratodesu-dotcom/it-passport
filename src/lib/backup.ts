// Progress backup: export everything the app keeps on this device to one file,
// and merge such a file back in on another device (or after clearing data).
//
// Importing MERGES rather than overwrites, so studying on two devices and
// moving a file between them never loses work on either side:
//   - quiz history: union by result id and time, newest first, capped like the app (50)
//   - question / term bookmarks, known terms, missed terms: union
//   - spaced-repetition cards: per card, the one reviewed most recently wins
//   - speed-challenge bests: the higher score wins
//   - preferences (theme, text size, last track): this device keeps its own;
//     the file's are used only where this device has none
// The OpenAI API key (it-passport-ai-settings) is never exported.

export const BACKUP_FORMAT = "it-passport-progress";
export const BACKUP_VERSION = 1;
export const HISTORY_LIMIT = 50;

type MergeRule = "history" | "union" | "latest-card" | "max" | "keep-current";

// Every key worth backing up, with how two copies combine.
export const BACKUP_KEYS: Record<string, MergeRule> = {
  "it-passport-history": "history",
  "it-passport-bookmarks": "union",
  "it-passport-missed-terms": "union",
  "it-passport-srs": "latest-card",
  "it-passport-term-bookmarks": "union",
  "it-passport-known-terms": "union",
  "it-passport-term-srs": "latest-card",
  "it-passport-speed-best": "max",
  "it-passport-home-track": "keep-current",
  "it-passport-appearance": "keep-current",
  "color-theme": "keep-current",
  theme: "keep-current",
};

/** Raw storage values, exactly as localStorage holds them. */
export type RawStore = Record<string, string>;

export interface BackupFile {
  format: typeof BACKUP_FORMAT;
  version: number;
  appVersion: string;
  exportedAt: string;
  data: RawStore;
}

export function buildBackup(read: (key: string) => string | null, appVersion: string, now = new Date()): BackupFile {
  const data: RawStore = {};
  for (const key of Object.keys(BACKUP_KEYS)) {
    const value = read(key);
    if (value !== null) data[key] = value;
  }
  return { format: BACKUP_FORMAT, version: BACKUP_VERSION, appVersion, exportedAt: now.toISOString(), data };
}

export type ParseResult = { ok: true; backup: BackupFile } | { ok: false; error: string };

export function parseBackup(text: string): ParseResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { ok: false, error: "ファイルを読み込めませんでした（JSONではありません）。" };
  }
  const b = parsed as Partial<BackupFile>;
  if (!b || typeof b !== "object" || b.format !== BACKUP_FORMAT || typeof b.data !== "object" || b.data === null) {
    return { ok: false, error: "このアプリのバックアップファイルではありません。" };
  }
  if (typeof b.version !== "number" || b.version > BACKUP_VERSION) {
    return { ok: false, error: "新しいバージョンのアプリで作られたファイルです。アプリを更新してから読み込んでください。" };
  }
  // Keep only known keys with string values; anything else is ignored.
  const data: RawStore = {};
  for (const [key, value] of Object.entries(b.data)) {
    if (key in BACKUP_KEYS && typeof value === "string") data[key] = value;
  }
  return {
    ok: true,
    backup: {
      format: BACKUP_FORMAT,
      version: b.version,
      appVersion: typeof b.appVersion === "string" ? b.appVersion : "",
      exportedAt: typeof b.exportedAt === "string" ? b.exportedAt : "",
      data,
    },
  };
}

function parseJson(raw: string | undefined): unknown {
  if (raw === undefined) return undefined;
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);

function mergeHistory(current: unknown, incoming: unknown): unknown[] {
  const a = Array.isArray(current) ? current : [];
  const b = Array.isArray(incoming) ? incoming : [];
  const byId = new Map<string, unknown>();
  for (const r of [...a, ...b]) {
    if (!isRecord(r) || typeof r.id !== "string" || typeof r.date !== "string") continue;
    // A result is the same one only if both its id and its time match.
    const key = `${r.id}|${r.date}`;
    if (!byId.has(key)) byId.set(key, r);
  }
  return [...byId.values()]
    .sort((x, y) => String((y as { date: string }).date).localeCompare(String((x as { date: string }).date)))
    .slice(0, HISTORY_LIMIT);
}

function mergeUnion(current: unknown, incoming: unknown): unknown[] {
  const a = Array.isArray(current) ? current : [];
  const b = Array.isArray(incoming) ? incoming : [];
  const seen = new Set<string>();
  const out: unknown[] = [];
  for (const v of [...a, ...b]) {
    if (typeof v !== "string" && typeof v !== "number") continue;
    const k = `${typeof v}:${v}`;
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(v);
  }
  return out;
}

function mergeLatestCard(current: unknown, incoming: unknown): Record<string, unknown> {
  const a = isRecord(current) ? current : {};
  const b = isRecord(incoming) ? incoming : {};
  const out: Record<string, unknown> = { ...a };
  for (const [key, card] of Object.entries(b)) {
    if (!isRecord(card) || typeof card.last !== "string") continue;
    const mine = out[key];
    if (!isRecord(mine) || typeof mine.last !== "string" || card.last > mine.last) out[key] = card;
  }
  return out;
}

function mergeMax(current: unknown, incoming: unknown): Record<string, number> {
  const out: Record<string, number> = {};
  for (const src of [current, incoming]) {
    if (!isRecord(src)) continue;
    for (const [key, v] of Object.entries(src)) {
      if (typeof v === "number" && Number.isFinite(v)) out[key] = Math.max(out[key] ?? 0, v);
    }
  }
  return out;
}

/** Merge an imported store into the current one. Pure: returns the new raw values. */
export function mergeStores(current: RawStore, incoming: RawStore): RawStore {
  const out: RawStore = { ...current };
  for (const [key, rule] of Object.entries(BACKUP_KEYS)) {
    const mine = current[key];
    const theirs = incoming[key];
    if (theirs === undefined) continue;
    if (rule === "keep-current") {
      if (mine === undefined) out[key] = theirs;
      continue;
    }
    const a = parseJson(mine);
    const b = parseJson(theirs);
    if (b === undefined) continue;
    const merged =
      rule === "history"
        ? mergeHistory(a, b)
        : rule === "union"
          ? mergeUnion(a, b)
          : rule === "latest-card"
            ? mergeLatestCard(a, b)
            : mergeMax(a, b);
    out[key] = JSON.stringify(merged);
  }
  return out;
}

export interface BackupSummary {
  results: number;
  bookmarks: number;
  reviewCards: number;
  knownTerms: number;
}

/** Counts for the confirmation message ("クイズ結果 12件…"). */
export function summarize(store: RawStore): BackupSummary {
  const arr = (k: string) => {
    const v = parseJson(store[k]);
    return Array.isArray(v) ? v.length : 0;
  };
  const obj = (k: string) => {
    const v = parseJson(store[k]);
    return isRecord(v) ? Object.keys(v).length : 0;
  };
  return {
    results: arr("it-passport-history"),
    bookmarks: arr("it-passport-bookmarks") + arr("it-passport-term-bookmarks"),
    reviewCards: obj("it-passport-srs") + obj("it-passport-term-srs"),
    knownTerms: arr("it-passport-known-terms"),
  };
}

export function backupFileName(now = new Date()): string {
  const d = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  return `it-passport-progress-${d}.json`;
}
