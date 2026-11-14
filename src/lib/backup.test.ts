import { describe, it, expect } from "vitest";
import { buildBackup, HISTORY_LIMIT, mergeStores, parseBackup, summarize, type RawStore } from "./backup";

const result = (id: string, date: string) => ({ id, date, category: "all", score: 1, total: 1, percentage: 100, timeSeconds: 1, passed: true });
const card = (id: number, last: string, intervalDays: number) => ({ id, ease: 2.5, intervalDays, due: last, reps: 1, lapses: 0, last });

describe("progress backup", () => {
  it("never exports the API key", () => {
    const store: Record<string, string> = {
      "it-passport-ai-settings": JSON.stringify({ apiKey: "sk-secret", model: "x" }),
      "it-passport-bookmarks": "[1]",
    };
    const backup = buildBackup((k) => store[k] ?? null, "1.2.0");
    expect(JSON.stringify(backup)).not.toContain("sk-secret");
    expect(backup.data["it-passport-bookmarks"]).toBe("[1]");
  });

  it("round-trips through a file and drops unknown keys", () => {
    const backup = buildBackup((k) => (k === "it-passport-known-terms" ? '["RAG"]' : null), "1.2.0");
    const text = JSON.stringify({ ...backup, data: { ...backup.data, "it-passport-ai-settings": '{"apiKey":"x"}' } });
    const parsed = parseBackup(text);
    expect(parsed.ok).toBe(true);
    if (parsed.ok) expect(Object.keys(parsed.backup.data)).toEqual(["it-passport-known-terms"]);
  });

  it("rejects files that are not backups or come from a newer format", () => {
    expect(parseBackup("not json").ok).toBe(false);
    expect(parseBackup('{"format":"other","data":{}}').ok).toBe(false);
    expect(parseBackup('{"format":"it-passport-progress","version":99,"data":{}}').ok).toBe(false);
  });

  it("merges history by id, newest first, within the app's limit", () => {
    const mine: RawStore = { "it-passport-history": JSON.stringify([result("a", "2026-11-03"), result("b", "2026-11-01")]) };
    const theirs: RawStore = { "it-passport-history": JSON.stringify([result("b", "2026-11-01"), result("c", "2026-11-02")]) };
    const merged = JSON.parse(mergeStores(mine, theirs)["it-passport-history"]);
    expect(merged.map((r: { id: string }) => r.id)).toEqual(["a", "c", "b"]);

    // Same id but a different time is a different result and is kept.
    const twin = JSON.parse(mergeStores(mine, { "it-passport-history": JSON.stringify([result("a", "2026-11-02")]) })["it-passport-history"]);
    expect(twin).toHaveLength(3);

    const many = Array.from({ length: 40 }, (_, i) => result(`m${i}`, `2026-10-${String(i % 28 + 1).padStart(2, "0")}`));
    const more = Array.from({ length: 40 }, (_, i) => result(`t${i}`, `2026-09-${String(i % 28 + 1).padStart(2, "0")}`));
    const capped = JSON.parse(mergeStores({ "it-passport-history": JSON.stringify(many) }, { "it-passport-history": JSON.stringify(more) })["it-passport-history"]);
    expect(capped).toHaveLength(HISTORY_LIMIT);
  });

  it("keeps the most recently reviewed SRS card and the best speed score", () => {
    const mine: RawStore = {
      "it-passport-srs": JSON.stringify({ 1: card(1, "2026-11-10", 3), 2: card(2, "2026-11-01", 1) }),
      "it-passport-speed-best": JSON.stringify({ "dev:all": 12, "dev:git": 5 }),
    };
    const theirs: RawStore = {
      "it-passport-srs": JSON.stringify({ 1: card(1, "2026-11-02", 9), 2: card(2, "2026-11-05", 7), 3: card(3, "2026-11-04", 2) }),
      "it-passport-speed-best": JSON.stringify({ "dev:all": 9, "dev:git": 8 }),
    };
    const out = mergeStores(mine, theirs);
    const srs = JSON.parse(out["it-passport-srs"]);
    expect(srs[1].intervalDays).toBe(3);
    expect(srs[2].intervalDays).toBe(7);
    expect(srs[3]).toBeDefined();
    expect(JSON.parse(out["it-passport-speed-best"])).toEqual({ "dev:all": 12, "dev:git": 8 });
  });

  it("unions bookmarks and keeps this device's preferences", () => {
    const out = mergeStores(
      { "it-passport-bookmarks": "[1,2]", theme: "dark" },
      { "it-passport-bookmarks": "[2,3]", theme: "light", "color-theme": "sakura" }
    );
    expect(JSON.parse(out["it-passport-bookmarks"])).toEqual([1, 2, 3]);
    expect(out.theme).toBe("dark");
    expect(out["color-theme"]).toBe("sakura");
  });

  it("ignores corrupt values in the file instead of wiping progress", () => {
    const out = mergeStores({ "it-passport-bookmarks": "[1]" }, { "it-passport-bookmarks": "{oops" });
    expect(out["it-passport-bookmarks"]).toBe("[1]");
  });

  it("summarizes a store", () => {
    expect(
      summarize({
        "it-passport-history": JSON.stringify([result("a", "2026-11-01")]),
        "it-passport-bookmarks": "[1,2]",
        "it-passport-term-bookmarks": '["RAG"]',
        "it-passport-srs": JSON.stringify({ 1: card(1, "x", 1) }),
      })
    ).toEqual({ results: 1, bookmarks: 3, reviewCards: 1, knownTerms: 0 });
  });
});
