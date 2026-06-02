"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  THEMES,
  ThemeId,
  applyTheme,
  loadDarkMode,
  loadThemeId,
  saveDarkMode,
  saveThemeId,
} from "@/lib/theme";

type NavLink = {
  href: string;
  label: string;
  // Used to highlight the active section regardless of query string.
  match: string;
};

const NAV_LINKS: NavLink[] = [
  { href: "/study?category=strategy", label: "学習", match: "/study" },
  { href: "/scroll", label: "フィード", match: "/scroll" },
  { href: "/games", label: "ゲーム", match: "/games" },
  { href: "/glossary", label: "用語集", match: "/glossary" },
  { href: "/history", label: "履歴", match: "/history" },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const [themeId, setThemeId] = useState<ThemeId>("default");
  const [dark, setDark] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const themeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = loadThemeId();
    const d = loadDarkMode();
    setThemeId(t);
    setDark(d);
    applyTheme(t, d);
  }, []);

  // Close popovers when navigating between pages.
  useEffect(() => {
    setMenuOpen(false);
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

  // Prevent body scroll while the mobile drawer is open.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

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

  const isActive = (match: string) =>
    pathname === match || pathname.startsWith(`${match}/`);

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

        {/* Desktop navigation */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                isActive(link.match)
                  ? "bg-[var(--primary-light)] text-[var(--primary)]"
                  : "text-[var(--muted)] hover:bg-[var(--card-hover)] hover:text-[var(--foreground)]"
              }`}
            >
              {link.label}
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
                      className={`flex flex-col items-center gap-1.5 rounded-xl p-2 text-xs transition-all ${
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
            className="hidden h-9 items-center rounded-full border border-[var(--card-border)] bg-[var(--card)] px-3 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--card-hover)] md:inline-flex"
          >
            設定
          </Link>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="メニューを開く"
            aria-expanded={menuOpen}
            className="grid h-9 w-9 place-items-center rounded-full border border-[var(--card-border)] bg-[var(--card)] transition-colors hover:bg-[var(--card-hover)] md:hidden"
          >
            <span className="relative block h-3.5 w-4">
              <span
                className={`absolute left-0 block h-0.5 w-4 rounded bg-[var(--foreground)] transition-all ${
                  menuOpen ? "top-1.5 rotate-45" : "top-0"
                }`}
              />
              <span
                className={`absolute left-0 top-1.5 block h-0.5 w-4 rounded bg-[var(--foreground)] transition-all ${
                  menuOpen ? "opacity-0" : "opacity-100"
                }`}
              />
              <span
                className={`absolute left-0 block h-0.5 w-4 rounded bg-[var(--foreground)] transition-all ${
                  menuOpen ? "top-1.5 -rotate-45" : "top-3"
                }`}
              />
            </span>
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <>
          <button
            aria-label="メニューを閉じる"
            onClick={() => setMenuOpen(false)}
            className="fixed inset-0 top-14 z-30 bg-black/40 md:hidden"
          />
          <nav className="fade-in absolute inset-x-0 top-14 z-40 border-b border-[var(--card-border)] bg-[var(--card)] p-3 shadow-xl md:hidden">
            <div className="grid gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-xl px-4 py-3 text-base font-medium transition-colors ${
                    isActive(link.match)
                      ? "bg-[var(--primary-light)] text-[var(--primary)]"
                      : "text-[var(--foreground)] hover:bg-[var(--card-hover)]"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/settings"
                className={`rounded-xl px-4 py-3 text-base font-medium transition-colors ${
                  isActive("/settings")
                    ? "bg-[var(--primary-light)] text-[var(--primary)]"
                    : "text-[var(--foreground)] hover:bg-[var(--card-hover)]"
                }`}
              >
                設定
              </Link>
            </div>
          </nav>
        </>
      )}
    </header>
  );
}
