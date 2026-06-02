"use client";

import { TrendPoint } from "@/lib/analytics";

// Lightweight inline SVG line chart of quiz scores over time. No dependencies.
export default function ScoreTrend({ points }: { points: TrendPoint[] }) {
  // A single point can't draw a line; the caller hides the section instead.
  if (points.length < 2) return null;

  const width = 100;
  const height = 40;
  const padY = 4;
  const n = points.length;

  const x = (i: number) => (n === 1 ? width / 2 : (i / (n - 1)) * width);
  const y = (pct: number) => height - padY - (pct / 100) * (height - padY * 2);

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(2)},${y(p.percentage).toFixed(2)}`)
    .join(" ");
  const areaPath = `${linePath} L${width},${height} L0,${height} Z`;

  const latest = points[n - 1];
  const first = points[0];
  const delta = latest.percentage - first.percentage;
  const passLineY = y(60);

  return (
    <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-semibold">スコアの推移</h2>
        <span className="text-xs text-[var(--muted)]">
          直近{n}回
          {delta !== 0 && (
            <span className={delta > 0 ? "ml-1 text-[var(--success)]" : "ml-1 text-[var(--danger)]"}>
              {delta > 0 ? "▲" : "▼"}
              {Math.abs(delta)}pt
            </span>
          )}
        </span>
      </div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className="h-28 w-full"
        role="img"
        aria-label={`スコア推移。最新${latest.percentage}%。`}
      >
        <defs>
          <linearGradient id="score-trend-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* 60% reference line (practice pass mark). */}
        <line
          x1="0"
          y1={passLineY}
          x2={width}
          y2={passLineY}
          stroke="var(--card-border)"
          strokeWidth="0.5"
          strokeDasharray="2 2"
        />
        <path d={areaPath} fill="url(#score-trend-fill)" />
        <path
          d={linePath}
          fill="none"
          stroke="var(--primary)"
          strokeWidth="1.5"
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
        {points.map((p, i) => (
          <circle
            key={i}
            cx={x(i)}
            cy={y(p.percentage)}
            r={i === n - 1 ? 1.8 : 1}
            fill={p.passed ? "var(--success)" : "var(--danger)"}
          />
        ))}
      </svg>
      <p className="mt-2 text-xs text-[var(--muted)]">
        点線は60%ライン。点の色は合否（緑=合格ライン到達 / 赤=未達）。
      </p>
    </div>
  );
}
