"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { getTermsByExam, TermPair } from "@/data/terms";
import { Category, categoryLabels, ExamType, examShortLabels, IpField, ipFieldLabels } from "@/lib/types";

type FieldFilter = "all" | string;

const itFilters: { id: FieldFilter; label: string }[] = [
  { id: "all", label: "すべて" },
  { id: "strategy", label: "ストラテジ系" },
  { id: "management", label: "マネジメント系" },
  { id: "technology", label: "テクノロジ系" },
];

const chizaiFilters: { id: FieldFilter; label: string }[] = [
  { id: "all", label: "すべて" },
  { id: "patent", label: ipFieldLabels.patent },
  { id: "design-trademark", label: ipFieldLabels["design-trademark"] },
  { id: "copyright", label: ipFieldLabels.copyright },
  { id: "other", label: ipFieldLabels.other },
];

function groupKey(exam: ExamType, t: TermPair): string {
  return exam === "chizai" ? t.ipField ?? "other" : t.category;
}

function groupLabel(exam: ExamType, key: string): string {
  return exam === "chizai" ? ipFieldLabels[key as IpField] ?? key : categoryLabels[key as Category] ?? key;
}

export default function GlossaryPage() {
  const [exam, setExam] = useState<ExamType>("it-passport");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FieldFilter>("all");

  const normalizedQuery = query.trim().toLowerCase();
  const baseTerms = useMemo(() => getTermsByExam(exam), [exam]);
  const filters = exam === "chizai" ? chizaiFilters : itFilters;

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
        {(["it-passport", "chizai"] as const).map((e) => (
          <button
            key={e}
            type="button"
            onClick={() => switchExam(e)}
            className={`flex-1 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors ${exam === e ? "border-[var(--primary)] bg-[var(--primary)] text-white" : "border-[var(--card-border)] bg-[var(--card)] text-[var(--muted)] hover:text-[var(--foreground)]"}`}
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
          {(Array.from(grouped.entries()) as [string, TermPair[]][]).map(([key, items]) => (
            <section key={key}>
              <h2 className="mb-3 text-sm font-semibold text-[var(--muted)]">
                {groupLabel(exam, key)} <span className="text-[var(--muted)]">({items.length})</span>
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {items.map((t) => (
                  <div
                    key={`${t.term}-${t.english}`}
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
