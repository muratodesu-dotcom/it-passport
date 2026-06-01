"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { getTermsByExam, TermPair } from "@/data/terms";
import { ExamType, examShortLabels, ipFieldLabels } from "@/lib/types";
import TermFeed from "@/components/TermFeed";

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

export default function ScrollPage() {
  const [exam, setExam] = useState<ExamType>("it-passport");
  const [filter, setFilter] = useState<FieldFilter>("all");
  const [query, setQuery] = useState("");
  const [revealMode, setRevealMode] = useState(false);

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

  const switchExam = (next: ExamType) => {
    setExam(next);
    setFilter("all");
  };

  // Remounting TermFeed on these changes resets and reshuffles the feed cleanly.
  const feedKey = `${exam}-${filter}-${normalizedQuery}`;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between gap-3">
        <Link href="/" className="text-sm text-[var(--muted)] transition-colors hover:text-[var(--foreground)]">
          ← 戻る
        </Link>
        <h1 className="text-xl font-bold">用語フィード</h1>
        <Link href="/glossary" className="text-sm text-[var(--muted)] transition-colors hover:text-[var(--foreground)]">
          一覧で見る
        </Link>
      </div>

      <p className="mb-5 text-sm leading-relaxed text-[var(--muted)]">
        用語と解説が無限に流れてくる学習フィードです。スキマ時間に指を動かすだけで、頻出用語をテンポよくインプットできます。
      </p>

      <div className="mb-5 rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-5 shadow-sm">
        <div className="mb-4 flex gap-2">
          {(["it-passport", "chizai"] as const).map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => switchExam(e)}
              className={`flex-1 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors ${
                exam === e
                  ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                  : "border-[var(--card-border)] bg-[var(--background)] text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              {examShortLabels[e]}
            </button>
          ))}
        </div>

        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="用語・英語名・説明で絞り込み…"
          className="w-full rounded-xl border border-[var(--card-border)] bg-[var(--background)] px-4 py-3 text-sm outline-none transition focus:border-[var(--primary)]"
        />

        <div className="mt-3 flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                filter === f.id
                  ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                  : "border-[var(--card-border)] bg-[var(--background)] text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <label className="mt-4 flex cursor-pointer items-center justify-between gap-3 rounded-xl bg-[var(--badge-bg)] px-4 py-3">
          <span className="text-sm font-medium">
            自己テストモード
            <span className="ml-1 text-xs text-[var(--muted)]">説明を隠して思い出す</span>
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={revealMode}
            onClick={() => setRevealMode((v) => !v)}
            className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${revealMode ? "bg-[var(--primary)]" : "bg-[var(--progress-bg)]"}`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${revealMode ? "translate-x-5" : "translate-x-0.5"}`}
            />
          </button>
        </label>
      </div>

      <TermFeed key={feedKey} terms={filtered} exam={exam} revealMode={revealMode} />
    </div>
  );
}
