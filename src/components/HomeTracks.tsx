"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "@/components/SiteLink";
import { getBookmarks, getHistory, getStreak, getWrongQuestionIds } from "@/lib/history";
import { getSrsStats } from "@/lib/srs";
import { fieldStyle } from "@/lib/fieldColors";
import { setTrack, useTrack } from "@/lib/track";
import type { ExamType } from "@/lib/types";

export interface Tile {
  href: string;
  icon: string;
  label: string;
  sub: string;
  color: string;
}

export interface FieldRow {
  key: string;
  label: string;
  count: number;
  quiz: string;
  study: string;
}

export interface TrackData {
  id: ExamType;
  label: string;
  icon: string;
  count: number;
  lang: "ja" | "en";
  allQuiz: { href: string; label: string };
  tiles: Tile[];
  fields: FieldRow[];
}

/** [question id, ITパスポート category, 知財3級 field, AI Engineer field] */
export type QuestionMeta = [number, string | null, string | null, string | null];

const TRACK_COLUMN: Record<ExamType, 1 | 2 | 3> = { "it-passport": 1, chizai: 2, dev: 3 };
// A field needs this many answers before its ring shows a percentage.
const MIN_ANSWERS = 3;

interface Stats {
  due: number;
  wrong: number;
  bookmarks: number;
  streak: number;
  // track -> field -> [correct, total]
  accuracy: Record<ExamType, Record<string, [number, number]>>;
}

function computeStats(meta: QuestionMeta[]): Stats {
  const byId = new Map(meta.map((m) => [m[0], m]));
  const accuracy: Stats["accuracy"] = { "it-passport": {}, chizai: {}, dev: {} };
  for (const result of getHistory()) {
    for (const o of result.outcomes ?? []) {
      const m = byId.get(o.id);
      if (!m) continue;
      (Object.keys(TRACK_COLUMN) as ExamType[]).forEach((track) => {
        const key = m[TRACK_COLUMN[track]];
        if (!key) return;
        const cell = (accuracy[track][key] ??= [0, 0]);
        cell[1]++;
        if (o.isCorrect) cell[0]++;
      });
    }
  }
  return {
    due: getSrsStats().due,
    wrong: getWrongQuestionIds().length,
    bookmarks: getBookmarks().length,
    streak: getStreak().current,
    accuracy,
  };
}

function Ring({ pct, color }: { pct: number; color: string }) {
  const r = 14;
  const c = 2 * Math.PI * r;
  return (
    <span className="relative grid h-9 w-9 shrink-0 place-items-center" aria-hidden>
      <svg width="36" height="36" viewBox="0 0 36 36" className="absolute inset-0 -rotate-90">
        <circle cx="18" cy="18" r={r} fill="none" stroke="var(--progress-bg)" strokeWidth="4" />
        <circle cx="18" cy="18" r={r} fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" strokeDasharray={`${(c * pct) / 100} ${c}`} />
      </svg>
      <span className="text-[10px] font-extrabold tabular-nums" style={{ color }}>
        {pct}
      </span>
    </span>
  );
}

export default function HomeTracks({ tracks, meta }: { tracks: TrackData[]; meta: QuestionMeta[] }) {
  const trackId = useTrack();
  const track = tracks.find((t) => t.id === trackId) ?? tracks[0];
  const en = track.lang === "en";
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    setStats(computeStats(meta));
  }, [meta]);

  const fieldAcc = useMemo(() => {
    const out: Record<string, number | null> = {};
    for (const f of track.fields) {
      const cell = stats?.accuracy[track.id][f.key];
      out[f.key] = cell && cell[1] >= MIN_ANSWERS ? Math.round((cell[0] / cell[1]) * 100) : null;
    }
    return out;
  }, [stats, track]);

  const weakest = useMemo(() => {
    const scored = track.fields.filter((f) => fieldAcc[f.key] !== null);
    if (scored.length === 0) return null;
    return scored.reduce((min, f) => ((fieldAcc[f.key] ?? 100) < (fieldAcc[min.key] ?? 100) ? f : min));
  }, [track, fieldAcc]);

  // The one thing to do next: due reviews, then mistakes, then this track's quiz.
  const next = !stats
    ? null
    : stats.due > 0
      ? { title: `復習 ${stats.due}問`, sub: `約${Math.max(1, Math.ceil(stats.due * 0.5))}分`, href: "/quiz?source=review", icon: "🔁" }
      : stats.wrong > 0
        ? { title: `間違えた問題 ${stats.wrong}問`, sub: "解き直して定着", href: "/quiz?source=wrong", icon: "🎯" }
        : { title: `${track.label} ${track.allQuiz.label}`, sub: `${track.count}問から出題`, href: track.allQuiz.href, icon: "✏️" };

  return (
    <div className="space-y-3">
      {/* Track tabs */}
      <div role="tablist" aria-label="学習トラック" className="grid grid-cols-3 gap-1 rounded-2xl bg-[var(--badge-bg)] p-1">
        {tracks.map((t) => {
          const active = t.id === track.id;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTrack(t.id)}
              className={`flex min-h-11 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl px-2 text-[13px] transition-colors sm:text-sm ${
                active
                  ? "bg-[var(--card)] font-bold text-[var(--foreground)] shadow-sm"
                  : "font-medium text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              <span aria-hidden>{t.icon}</span>
              <span>{t.label}</span>
              <span className="hidden text-xs font-medium text-[var(--muted)] sm:inline">
                {t.count}
                {t.lang === "en" ? "" : "問"}
              </span>
            </button>
          );
        })}
      </div>

      {/* Next step */}
      <section className="flex min-h-[88px] flex-wrap items-center gap-x-4 gap-y-3 rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-4">
        {next ? (
          <>
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[var(--primary-light)] text-2xl" aria-hidden>
              {next.icon}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-[var(--muted)]">次の一歩</p>
              <p className="truncate text-lg font-extrabold leading-tight sm:text-xl">
                {next.title} <span className="text-sm font-medium text-[var(--muted)]">· {next.sub}</span>
              </p>
            </div>
            <Link
              href={next.href}
              className="inline-flex min-h-11 flex-1 basis-full items-center justify-center rounded-xl bg-[var(--primary)] px-5 font-bold text-[var(--on-primary)] transition-colors hover:bg-[var(--primary-hover)] sm:flex-none sm:basis-auto"
            >
              始める →
            </Link>
            <div className="flex basis-full flex-wrap gap-1.5 text-xs">
              {stats && stats.streak > 0 && (
                <span className="rounded-full bg-[var(--badge-bg)] px-2.5 py-1">🔥 {stats.streak}日連続</span>
              )}
              {stats && stats.wrong > 0 && stats.due > 0 && (
                <Link href="/quiz?source=wrong" className="rounded-full bg-[var(--danger-bg)] px-2.5 py-1 text-[var(--danger)] transition-colors hover:underline">
                  🎯 間違えた問題 {stats.wrong}
                </Link>
              )}
              {stats && stats.bookmarks > 0 && (
                <Link href="/quiz?source=bookmarks" className="rounded-full bg-[var(--badge-bg)] px-2.5 py-1 transition-colors hover:underline">
                  ⭐ ブックマーク {stats.bookmarks}
                </Link>
              )}
              {weakest && (
                <Link href={weakest.quiz} className="rounded-full bg-[var(--badge-bg)] px-2.5 py-1 transition-colors hover:underline">
                  📉 苦手: {weakest.label} {fieldAcc[weakest.key]}%
                </Link>
              )}
            </div>
          </>
        ) : null}
      </section>

      {/* The track's extra modes */}
      <div lang={en ? "en" : "ja"} className="grid grid-cols-4 gap-2 sm:gap-3">
        {track.tiles.map((tile) => (
          <Link
            key={tile.href}
            href={tile.href}
            className="flex flex-col items-center gap-1.5 rounded-2xl border border-[var(--card-border)] bg-[var(--card)] px-1 py-3 text-center transition-colors hover:border-[var(--option-hover-border)] sm:py-4"
          >
            <span className="grid h-11 w-11 place-items-center rounded-xl text-[22px] sm:h-12 sm:w-12" style={{ backgroundColor: tile.color }} aria-hidden>
              {tile.icon}
            </span>
            <span className="w-full truncate px-1 text-xs font-bold sm:text-sm">{tile.label}</span>
            <span className="hidden text-xs text-[var(--muted)] sm:block">{tile.sub}</span>
          </Link>
        ))}
      </div>

      {/* Fields with progress rings */}
      <section lang={en ? "en" : "ja"} className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-3 sm:p-4">
        <div className="mb-2.5 flex items-center justify-between gap-2 px-1">
          <h2 className="text-sm font-bold">{en ? "Fields" : "分野別"}</h2>
          <Link href={track.allQuiz.href} className="text-sm font-medium text-[var(--primary)] transition-colors hover:underline">
            {track.allQuiz.label} →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {track.fields.map((f) => {
            const style = fieldStyle(f.key);
            const pct = fieldAcc[f.key];
            return (
              <div key={f.key} className="flex items-center gap-3 rounded-xl border border-[var(--card-border)] bg-[var(--background)] p-2.5">
                {pct !== null ? (
                  <Ring pct={pct} color={style.color} />
                ) : (
                  <span className="grid h-9 w-9 shrink-0 place-items-center text-xl" aria-hidden>
                    {style.icon}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-bold leading-tight">{f.label}</h3>
                  <p className="text-xs text-[var(--muted)]">
                    {pct !== null ? (en ? `${pct}% correct` : `正答率 ${pct}%`) : en ? `${f.count} questions` : `${f.count}問`}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1.5">
                  <Link
                    href={f.quiz}
                    className="inline-flex min-h-10 items-center rounded-lg px-3 text-xs font-medium text-white transition-opacity hover:opacity-90"
                    style={{ backgroundColor: style.color }}
                  >
                    {en ? "Quiz" : "クイズ"}
                  </Link>
                  <Link
                    href={f.study}
                    className="inline-flex min-h-10 items-center rounded-lg border border-[var(--card-border)] px-3 text-xs font-medium transition-colors hover:bg-[var(--card-hover)]"
                  >
                    {en ? "Study" : "学習"}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
