// Shared theme + appearance logic used by the header controls and the
// settings page. Keeping it in one place avoids duplicating the localStorage
// keys and the class-application rules across components.

export const COLOR_THEME_KEY = "color-theme";
export const DARK_MODE_KEY = "theme";

export type ThemeId =
  | "default"
  | "sakura"
  | "forest"
  | "sunset"
  | "ocean"
  | "lavender"
  | "midnight"
  | "mono";

export type ThemeDef = {
  id: ThemeId;
  label: string;
  color: string;
  icon: string;
};

export const THEMES: ThemeDef[] = [
  { id: "default", label: "インディゴ", color: "#4f46e5", icon: "💙" },
  { id: "sakura", label: "さくら", color: "#ec4899", icon: "🌸" },
  { id: "forest", label: "フォレスト", color: "#10b981", icon: "🌿" },
  { id: "sunset", label: "サンセット", color: "#f97316", icon: "🌅" },
  { id: "ocean", label: "オーシャン", color: "#06b6d4", icon: "🌊" },
  { id: "lavender", label: "ラベンダー", color: "#8b5cf6", icon: "💜" },
  { id: "midnight", label: "ミッドナイト", color: "#6366f1", icon: "🌌" },
  { id: "mono", label: "モノクロ", color: "#71717a", icon: "🩶" },
];

const THEME_IDS = THEMES.map((t) => t.id);

export function isThemeId(value: string | null): value is ThemeId {
  return value != null && (THEME_IDS as string[]).includes(value);
}

export function applyTheme(themeId: ThemeId, dark: boolean) {
  if (typeof document === "undefined") return;
  const html = document.documentElement;
  THEMES.forEach((t) => {
    if (t.id !== "default") html.classList.remove(`theme-${t.id}`);
  });
  html.classList.toggle("dark", dark);
  if (themeId !== "default") html.classList.add(`theme-${themeId}`);
}

export function loadThemeId(): ThemeId {
  if (typeof window === "undefined") return "default";
  const saved = window.localStorage.getItem(COLOR_THEME_KEY);
  return isThemeId(saved) ? saved : "default";
}

export function loadDarkMode(): boolean {
  if (typeof window === "undefined") return false;
  const saved = window.localStorage.getItem(DARK_MODE_KEY);
  if (saved === "dark") return true;
  if (saved === "light") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function saveThemeId(themeId: ThemeId) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(COLOR_THEME_KEY, themeId);
}

export function saveDarkMode(dark: boolean) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(DARK_MODE_KEY, dark ? "dark" : "light");
}

export type ThemeMode = "light" | "dark" | "system";

export function loadThemeMode(): ThemeMode {
  if (typeof window === "undefined") return "system";
  const saved = window.localStorage.getItem(DARK_MODE_KEY);
  if (saved === "dark") return "dark";
  if (saved === "light") return "light";
  return "system";
}

export function resolveDark(mode: ThemeMode): boolean {
  if (mode === "dark") return true;
  if (mode === "light") return false;
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function saveThemeMode(mode: ThemeMode) {
  if (typeof window === "undefined") return;
  if (mode === "system") {
    window.localStorage.removeItem(DARK_MODE_KEY);
  } else {
    window.localStorage.setItem(DARK_MODE_KEY, mode);
  }
}

// Inline script (stringified) run before paint to avoid a flash of the
// default theme on first load. Injected from the root layout.
export const themeBootScript = `
(function(){
  try {
    var t = localStorage.getItem('${COLOR_THEME_KEY}') || 'default';
    var m = localStorage.getItem('${DARK_MODE_KEY}');
    var dark = m === 'dark' || (!m && window.matchMedia('(prefers-color-scheme: dark)').matches);
    var el = document.documentElement;
    if (t && t !== 'default') el.classList.add('theme-' + t);
    if (dark) el.classList.add('dark');
  } catch (e) {}
})();
`;
