"use client";

import Link from "@/components/SiteLink";
import { useEffect, useState } from "react";
import { getBookmarks, getStreak, getWrongQuestionIds, StreakInfo } from "@/lib/history";
import { getSrsStats } from "@/lib/srs";

export default function StudyPulse() {
  const [hydrated, setHydrated] = useState(false);
  const [streak, setStreak] = useState<StreakInfo>({ current: 0, longest: 0, studiedToday: false });
  const [wrongCount, setWrongCount] = useState(0);
  const [bookmarkCount, setBookmarkCount] = useState(0);
  const [dueCount, setDueCount] = useState(0);

  useEffect(() => {
    setStreak(getStreak());
    setWrongCount(getWrongQuestionIds().length);
    setBookmarkCount(getBookmarks().length);
    setDueCount(getSrsStats().due);
    setHydrated(true);
  }, []);

  if (!hydrated) return null;
  if (streak.current === 0 && wrongCount === 0 && bookmarkCount === 0 && dueCount === 0) return null;

  return (
    <section className="mb-4 grid grid-cols-2 gap-2.5 lg:grid-cols-4">
      <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-3.5 shadow-sm">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-xs font-medium text-[var(--muted)]">連続学習</span>
          <span className="text-lg" aria-hidden>🔥</span>
        </div>
        <p className="text-2xl font-bold tabular-nums">{streak.current}日</p>
        <p className="mt-1 text-xs text-[var(--muted)]">
          最長 {streak.longest}日 · {streak.studiedToday ? "今日は学習済み" : "今日のクイズはまだ"}
        </p>
      </div>

      <Link
        href="/quiz?source=review"
        className={`block rounded-2xl border p-3.5 shadow-sm transition-shadow hover:shadow-md ${dueCount > 0 ? "border-[var(--primary)] bg-[var(--option-selected-bg)]" : "border-[var(--card-border)] bg-[var(--card)] opacity-70 pointer-events-none"}`}
      >
        <div className="mb-1 flex items-center justify-between">
          <span className="text-xs font-medium text-[var(--muted)]">復習（間隔反復）</span>
          <span className="text-lg" aria-hidden>🔁</span>
        </div>
        <p className="text-2xl font-bold tabular-nums">{dueCount}問</p>
        <p className="mt-1 text-xs text-[var(--muted)]">
          {dueCount > 0 ? "復習の時期です →" : "今日の復習はありません"}
        </p>
      </Link>

      <Link
        href="/quiz?source=wrong"
        className={`block rounded-2xl border p-3.5 shadow-sm transition-shadow hover:shadow-md ${wrongCount > 0 ? "border-[var(--danger-border)] bg-[var(--danger-bg)]" : "border-[var(--card-border)] bg-[var(--card)] opacity-70 pointer-events-none"}`}
      >
        <div className="mb-1 flex items-center justify-between">
          <span className="text-xs font-medium text-[var(--muted)]">間違えた問題</span>
          <span className="text-lg" aria-hidden>🎯</span>
        </div>
        <p className="text-2xl font-bold tabular-nums">{wrongCount}問</p>
        <p className="mt-1 text-xs text-[var(--muted)]">
          {wrongCount > 0 ? "ここから復習を始める →" : "まだ間違えた問題はありません"}
        </p>
      </Link>

      <Link
        href="/quiz?source=bookmarks"
        className={`block rounded-2xl border p-3.5 shadow-sm transition-shadow hover:shadow-md ${bookmarkCount > 0 ? "border-amber-300 bg-amber-50 dark:border-amber-300/30 dark:bg-amber-400/10" : "border-[var(--card-border)] bg-[var(--card)] opacity-70 pointer-events-none"}`}
      >
        <div className="mb-1 flex items-center justify-between">
          <span className="text-xs font-medium text-[var(--muted)]">ブックマーク</span>
          <span className="text-lg" aria-hidden>⭐️</span>
        </div>
        <p className="text-2xl font-bold tabular-nums">{bookmarkCount}問</p>
        <p className="mt-1 text-xs text-[var(--muted)]">
          {bookmarkCount > 0 ? "ブックマーク問題で復習 →" : "問題画面の☆で追加できます"}
        </p>
      </Link>
    </section>
  );
}
