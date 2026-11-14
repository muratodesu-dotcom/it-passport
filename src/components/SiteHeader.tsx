"use client";

import Link from "@/components/SiteLink";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { NAV_ITEMS, navHref } from "@/components/BottomNav";
import { TRACK_LINKS, useTrack } from "@/lib/track";
import {
  THEMES,
  ThemeId,
  applyTheme,
  loadDarkMode,
  loadThemeId,
  saveDarkMode,
  saveThemeId,
} from "@/lib/theme";

export default function SiteHeader() {
  const pathname = usePathname();
  const track = useTrack();
  const links = TRACK_LINKS[track];
  const [themeId, setThemeId] = useState<ThemeId>("default");
  const [dark, setDark] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const themeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = loadThemeId();
    const d = loadDarkMode();
    setThemeId(t);
    setDark(d);
    applyTheme(t, d);
  }, []);

  // Close the theme popover when navigating between pages.
  useEffect(() => {
    setThemeOpen(false);
  }, [pathname]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (themeRef.current && !themeRef.current.contains(e.target as Node)) {
        setThemeOpen(false);
      }
    }
    if (themeOpen) document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [themeOpen]);

  const selectTheme = (id: ThemeId) => {
    setThemeId(id);
    saveThemeId(id);
    applyTheme(id, dark);
  };

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    saveDarkMode(next);
    applyTheme(themeId, next);
  };


  const current = THEMES.find((t) => t.id === themeId) ?? THEMES[0];

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--card-border)] bg-[color:color-mix(in_srgb,var(--background)_85%,transparent)] backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-2 px-4">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 whitespace-nowrap text-sm font-bold tracking-tight text-[var(--foreground)]"
        >
          <span
            className="grid h-7 w-7 place-items-center rounded-lg text-white"
            style={{
              backgroundImage:
                "linear-gradient(135deg, var(--gradient-from), var(--gradient-to))",
            }}
            aria-hidden
          >
            <span className="text-xs font-black">IT</span>
          </span>
          <span className="hidden sm:inline">ITパス＆知財3級</span>
        </Link>

        {/* Computer navigation: the same places as the phone tab bar, for the chosen track */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.filter((item) => item.key !== "home").map((item) => (
            <Link
              key={item.key}
              href={navHref(item.key, links)}
              aria-current={item.match(pathname) ? "page" : undefined}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                item.match(pathname)
                  ? "bg-[var(--primary-light)] text-[var(--primary)]"
                  : "text-[var(--muted)] hover:bg-[var(--card-hover)] hover:text-[var(--foreground)]"
              }`}
            >
              <span aria-hidden>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          {/* Theme dropdown */}
          <div className="relative" ref={themeRef}>
            <button
              onClick={() => setThemeOpen((o) => !o)}
              aria-label="テーマを切り替え"
              aria-expanded={themeOpen}
              className="grid h-9 w-9 place-items-center rounded-full border border-[var(--card-border)] bg-[var(--card)] text-lg transition-colors hover:bg-[var(--card-hover)]"
            >
              <span aria-hidden>{current.icon}</span>
            </button>
            {themeOpen && (
              <div className="fade-in absolute right-0 top-11 w-60 rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-3 shadow-xl">
                <p className="mb-2 px-1 text-xs font-semibold text-[var(--muted)]">
                  カラーテーマ
                </p>
                <div className="mb-3 grid grid-cols-3 gap-2">
                  {THEMES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => selectTheme(t.id)}
                      className={`flex flex-col items-center gap-1.5 rounded-xl p-2 text-xs transition-colors ${
                        themeId === t.id
                          ? "bg-[var(--primary-light)] ring-2 ring-[var(--primary)]"
                          : "hover:bg-[var(--card-hover)]"
                      }`}
                    >
                      <span
                        className="h-6 w-6 rounded-full border-2"
                        style={{
                          backgroundColor: t.color,
                          borderColor:
                            themeId === t.id ? "var(--foreground)" : "transparent",
                        }}
                      />
                      <span className="leading-tight">{t.label}</span>
                    </button>
                  ))}
                </div>
                <button
                  onClick={toggleDark}
                  className="flex w-full items-center justify-between rounded-xl border border-[var(--card-border)] px-3 py-2 text-sm transition-colors hover:bg-[var(--card-hover)]"
                >
                  <span>{dark ? "ダークモード" : "ライトモード"}</span>
                  <span className="text-lg" aria-hidden>
                    {dark ? "🌙" : "☀️"}
                  </span>
                </button>
                <Link
                  href="/settings"
                  className="mt-2 block rounded-xl px-3 py-2 text-center text-xs font-medium text-[var(--muted)] transition-colors hover:bg-[var(--card-hover)] hover:text-[var(--foreground)]"
                >
                  詳細な外観設定 →
                </Link>
              </div>
            )}
          </div>

          <Link
            href="/settings"
            aria-label="設定"
            className="inline-flex h-9 min-w-9 items-center justify-center rounded-full border border-[var(--card-border)] bg-[var(--card)] px-2.5 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--card-hover)]"
          >
            <span aria-hidden className="md:hidden">⚙️</span>
            <span className="hidden md:inline">設定</span>
          </Link>

        </div>
      </div>

    </header>
  );
}
