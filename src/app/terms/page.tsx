"use client";

import { useMemo, useState, useDeferredValue } from "react";
import Link from "next/link";
import { getTermPairs } from "@/data";
import { useExam } from "@/lib/examContext";
import { categoryByExam, categoryLabels, Category } from "@/lib/types";

export default function TermsIndexPage() {
  const { exam } = useExam();
  const allTerms = useMemo(() => getTermPairs(exam), [exam]);

  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [category, setCategory] = useState<Category | "all">("all");

  const filtered = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    return allTerms.filter((t) => {
      if (category !== "all" && t.category !== category) return false;
      if (!q) return true;
      return (
        t.term.toLowerCase().includes(q) ||
        t.english.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q)
      );
    });
  }, [allTerms, deferredQuery, category]);

  const groupedByCategory = useMemo(() => {
    const groups: Record<string, typeof filtered> = {};
    for (const t of filtered) {
      if (!groups[t.category]) groups[t.category] = [];
      groups[t.category].push(t);
    }
    return groups;
  }, [filtered]);

  const displayCategories =
    category === "all" ? categoryByExam[exam] : [category];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-4">
        <Link href="/" className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">&larr; ホーム</Link>
      </div>

      <h1 className="text-2xl font-bold mb-1">用語インデックス</h1>
      <p className="text-sm text-[var(--muted)] mb-6">
        全{allTerms.length}件の用語を検索・閲覧できます
      </p>

      {/* Search */}
      <div className="mb-4">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="用語・英語名・説明を検索..."
          className="w-full rounded-xl border border-[var(--card-border)] bg-[var(--card)] px-4 py-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
        />
      </div>

      {/* Category chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setCategory("all")}
          className={`rounded-full px-3.5 py-1.5 text-sm transition-colors ${
            category === "all"
              ? "bg-[var(--primary)] text-white"
              : "bg-[var(--badge-bg)] text-[var(--muted)] hover:text-[var(--foreground)]"
          }`}
        >
          全分野 ({allTerms.length})
        </button>
        {categoryByExam[exam].map((cat) => {
          const count = allTerms.filter((t) => t.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`rounded-full px-3.5 py-1.5 text-sm transition-colors ${
                category === cat
                  ? "bg-[var(--primary)] text-white"
                  : "bg-[var(--badge-bg)] text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              {categoryLabels[cat]} ({count})
            </button>
          );
        })}
      </div>

      {/* Results count */}
      <p className="text-xs text-[var(--muted)] mb-4">
        {filtered.length === allTerms.length
          ? `${filtered.length}件`
          : `${filtered.length}件 / 全${allTerms.length}件`}
      </p>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-10 text-center">
          <p className="text-3xl mb-3">🔍</p>
          <p className="text-sm text-[var(--muted)]">該当する用語が見つかりません</p>
        </div>
      ) : (
        <div className="space-y-6">
          {displayCategories.map((cat) => {
            const terms = groupedByCategory[cat];
            if (!terms || terms.length === 0) return null;
            return (
              <section key={cat}>
                <div className="flex items-baseline gap-2 mb-3 pb-2 border-b border-[var(--card-border)]">
                  <h2 className="font-semibold">{categoryLabels[cat as Category] ?? cat}</h2>
                  <span className="text-xs text-[var(--muted)]">{terms.length}件</span>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {terms.map((t) => (
                    <div
                      key={`${cat}-${t.term}`}
                      className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] px-4 py-3 transition-colors hover:bg-[var(--card-hover)]"
                    >
                      <div className="flex items-baseline gap-2 mb-1">
                        <p className="font-semibold text-sm">{t.term}</p>
                        <p className="text-[0.65rem] text-[var(--muted)] truncate">{t.english}</p>
                      </div>
                      <p className="text-xs text-[var(--muted)] leading-relaxed">
                        {t.description}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
