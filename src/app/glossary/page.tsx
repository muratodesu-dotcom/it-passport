"use client";

import Link from "@/components/SiteLink";
import { useEffect, useMemo, useState } from "react";
import { getTermsByExam, sameName, TermPair } from "@/data/terms";
import { ExamType, examShortLabels } from "@/lib/types";
import { fieldLabel, fieldOptions, itemField } from "@/lib/examFields";
import { parseExam } from "@/lib/examFields";
import Furigana from "@/components/Furigana";
import { fieldStyle } from "@/lib/fieldColors";

type FieldFilter = "all" | string;

// Field filters for the selected exam, with "すべて" in place of "全分野".
function filtersFor(exam: ExamType): { id: FieldFilter; label: string }[] {
  return fieldOptions(exam).map((o) => (o.id === "all" && exam !== "dev" ? { id: "all", label: "すべて" } : o));
}

function groupKey(exam: ExamType, t: TermPair): string {
  return itemField(exam, t);
}

function groupLabel(exam: ExamType, key: string): string {
  return fieldLabel(exam, key);
}

export default function GlossaryPage() {
  const [exam, setExam] = useState<ExamType>("it-passport");
  // Links such as /glossary?exam=dev open on that track.
  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("exam");
    if (requested) setExam(parseExam(requested));
  }, []);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FieldFilter>("all");
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
  const toggleExpanded = (k: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });

  const normalizedQuery = query.trim().toLowerCase();
  const baseTerms = useMemo(() => getTermsByExam(exam), [exam]);
  const filters = filtersFor(exam);

  const filtered = useMemo(() => {
    return baseTerms.filter((t) => {
      if (filter !== "all" && groupKey(exam, t) !== filter) return false;
      if (!normalizedQuery) return true;
      return (
        t.term.toLowerCase().includes(normalizedQuery) ||
        t.english.toLowerCase().includes(normalizedQuery) ||
        t.description.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [baseTerms, exam, filter, normalizedQuery]);

  const grouped = useMemo(() => {
    const map = new Map<string, TermPair[]>();
    for (const t of filtered) {
      const key = groupKey(exam, t);
      const list = map.get(key) || [];
      list.push(t);
      map.set(key, list);
    }
    return map;
  }, [filtered, exam]);

  const totalCount = baseTerms.length;

  const switchExam = (next: ExamType) => {
    setExam(next);
    setFilter("all");
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between gap-3">
        <Link href="/" className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
          ← 戻る
        </Link>
        <h1 className="text-xl font-bold">用語集</h1>
        <Link href="/scroll" className="text-sm text-[var(--primary)] transition-colors hover:underline">
          🌀 フィードで学ぶ
        </Link>
      </div>

      <div className="mb-6 flex gap-2">
        {(["it-passport", "chizai", "dev"] as const).map((e) => (
          <button
            key={e}
            type="button"
            onClick={() => switchExam(e)}
            className={`min-h-11 flex-1 whitespace-nowrap rounded-xl border px-2 py-2 text-[13px] font-medium transition-colors sm:px-4 sm:text-sm ${exam === e ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--on-primary)]" : "border-[var(--card-border)] bg-[var(--card)] text-[var(--muted)] hover:text-[var(--foreground)]"}`}
          >
            {examShortLabels[e]}
          </button>
        ))}
      </div>

      <div className="mb-6 rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-5 shadow-sm">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="用語・英語名・説明から検索…"
          className="w-full rounded-xl border border-[var(--card-border)] bg-[var(--background)] px-4 py-3 text-sm outline-none transition focus:border-[var(--primary)]"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${filter === f.id ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--on-primary)]" : "border-[var(--card-border)] bg-[var(--background)] text-[var(--muted)] hover:text-[var(--foreground)]"}`}
            >
              {f.id !== "all" && (
                <span aria-hidden="true" className="mr-1">
                  {fieldStyle(f.id).icon}
                </span>
              )}
              {f.label}
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs text-[var(--muted)]">
          {filtered.length} / {totalCount}語を表示中
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--card-border)] p-10 text-center text-sm text-[var(--muted)]">
          条件に一致する用語がありませんでした。
        </div>
      ) : (
        <div className="space-y-8">
          {(Array.from(grouped.entries()) as [string, TermPair[]][]).map(([key, items]) => (
            <section key={key}>
              <h2 className="mb-2 flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-sm leading-none text-white"
                  style={{ backgroundColor: fieldStyle(key).color }}
                >
                  {fieldStyle(key).icon}
                </span>
                <span className="text-[15px] font-bold text-[var(--foreground)]">{groupLabel(exam, key)}</span>
                <span className="text-xs text-[var(--muted)]">{items.length}</span>
              </h2>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((t) => {
                  const k = `${t.term}-${t.english}`;
                  const open = expanded.has(k);
                  return (
                    <button
                      key={k}
                      type="button"
                      aria-expanded={open}
                      onClick={() => toggleExpanded(k)}
                      className="block w-full cursor-pointer rounded-xl border border-[var(--card-border)] bg-[var(--card)] px-3 py-2.5 text-left transition-colors hover:border-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
                    >
                      <div className="mb-1 flex items-baseline justify-between gap-2">
                        <Furigana term={t.term} className="font-semibold" />
                        {!sameName(t.term, t.english) && <span className="text-[10px] text-[var(--muted)]">{t.english}</span>}
                      </div>
                      <p className={`text-[13px] leading-snug text-[var(--muted)] ${open ? "" : "line-clamp-2"}`}>{t.description}</p>
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
