"use client";

import { useEffect, useState, useRef } from "react";

const themes = [
  { id: "default", label: "デフォルト", color: "#2563eb", icon: "💙" },
  { id: "sakura", label: "さくら", color: "#db2777", icon: "🌸" },
  { id: "forest", label: "フォレスト", color: "#16a34a", icon: "🌿" },
  { id: "sunset", label: "サンセット", color: "#d97706", icon: "🌅" },
  { id: "ocean", label: "オーシャン", color: "#0891b2", icon: "🌊" },
  { id: "lavender", label: "ラベンダー", color: "#7c3aed", icon: "💜" },
] as const;

type ThemeId = (typeof themes)[number]["id"];

function applyTheme(themeId: ThemeId, dark: boolean) {
  const html = document.documentElement;
  // Remove all theme classes
  themes.forEach((t) => {
    if (t.id !== "default") html.classList.remove(`theme-${t.id}`);
  });
  html.classList.remove("dark");
  // Apply new theme
  if (themeId !== "default") html.classList.add(`theme-${themeId}`);
  if (dark) html.classList.add("dark");
}

export default function ThemeSelector() {
  const [themeId, setThemeId] = useState<ThemeId>("default");
  const [dark, setDark] = useState(false);
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedTheme = (localStorage.getItem("color-theme") || "default") as ThemeId;
    const savedMode = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = savedMode === "dark" || (!savedMode && prefersDark);
    setThemeId(savedTheme);
    setDark(isDark);
    applyTheme(savedTheme, isDark);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const selectTheme = (id: ThemeId) => {
    setThemeId(id);
    localStorage.setItem("color-theme", id);
    applyTheme(id, dark);
  };

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    localStorage.setItem("theme", next ? "dark" : "light");
    applyTheme(themeId, next);
  };

  const current = themes.find((t) => t.id === themeId)!;

  return (
    <div className="fixed top-4 right-4 z-50" ref={panelRef}>
      <button
        onClick={() => setOpen(!open)}
        aria-label="テーマを切り替え"
        className="w-10 h-10 rounded-full bg-[var(--card)] border border-[var(--card-border)] flex items-center justify-center shadow-md hover:shadow-lg transition-all hover:scale-110"
      >
        <span className="text-lg">{current.icon}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-56 rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-3 shadow-xl fade-in">
          <p className="text-xs font-semibold text-[var(--muted)] mb-2 px-1">カラーテーマ</p>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => selectTheme(t.id)}
                className={`flex flex-col items-center gap-1 rounded-lg p-2 text-xs transition-all ${
                  themeId === t.id
                    ? "bg-[var(--primary-light)] ring-2 ring-[var(--primary)]"
                    : "hover:bg-[var(--card-hover)]"
                }`}
              >
                <span
                  className="w-6 h-6 rounded-full border-2 transition-transform"
                  style={{
                    backgroundColor: t.color,
                    borderColor: themeId === t.id ? "var(--foreground)" : "transparent",
                    transform: themeId === t.id ? "scale(1.15)" : "scale(1)",
                  }}
                />
                <span className="leading-tight">{t.label}</span>
              </button>
            ))}
          </div>

          <div className="border-t border-[var(--card-border)] pt-2">
            <button
              onClick={toggleDark}
              className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-sm transition-colors hover:bg-[var(--card-hover)]"
            >
              <span>{dark ? "ダークモード" : "ライトモード"}</span>
              <span className="text-lg">{dark ? "☀️" : "🌙"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
