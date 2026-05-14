"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { termPairs, TermPair } from "@/data/terms";
import { Category, categoryLabels } from "@/lib/types";

type Filter = "all" | Category;

const filters: { id: Filter; label: string }[] = [
  { id: "all", label: "すべて" },
  { id: "strategy", label: "ストラテジ系" },
  { id: "management", label: "マネジメント系" },
  { id: "technology", label: "テクノロジ系" },
];

export default function GlossaryPage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const normalizedQuery = query.trim().toLowerCase();

  const filtered = useMemo(() => {
    return termPairs.filter((t: TermPair) => {
      if (filter !== "all" && t.category !== filter) return false;
      if (!normalizedQuery) return true;
      return (
        t.term.toLowerCase().includes(normalizedQuery) ||
        t.english.toLowerCase().includes(normalizedQuery) ||
        t.description.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [filter, normalizedQuery]);

  const grouped = useMemo(() => {
    const map = new Map<Category, TermPair[]>();
    for (const t of filtered) {
      const list = map.get(t.category) || [];
      list.push(t);
      map.set(t.category, list);
    }
    return map;
  }, [filtered]);

  const totalCount = termPairs.length;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between gap-3">
        <Link href="/" className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
          ← 戻る
        </Link>
        <h1 className="text-xl font-bold">用語集</h1>
        <span className="text-xs text-[var(--muted)]">{totalCount}語</span>
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
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${filter === f.id ? "border-[var(--primary)] bg-[var(--primary)] text-white" : "border-[var(--card-border)] bg-[var(--background)] text-[var(--muted)] hover:text-[var(--foreground)]"}`}
            >
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
          {(Array.from(grouped.entries()) as [Category, TermPair[]][]).map(([cat, items]) => (
            <section key={cat}>
              <h2 className="mb-3 text-sm font-semibold text-[var(--muted)]">
                {categoryLabels[cat]} <span className="text-[var(--muted)]">({items.length})</span>
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {items.map((t) => (
                  <div
                    key={`${t.category}-${t.term}`}
                    className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 shadow-sm"
                  >
                    <div className="mb-1 flex items-baseline justify-between gap-2">
                      <span className="font-semibold">{t.term}</span>
                      <span className="text-[10px] text-[var(--muted)]">{t.english}</span>
                    </div>
                    <p className="text-sm leading-relaxed text-[var(--muted)]">{t.description}</p>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
