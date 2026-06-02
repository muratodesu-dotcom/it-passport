// Appearance preferences beyond color theme / dark mode: text size, motion,
// and contrast. Stored separately from the AI settings so the two concerns
// don't collide, and applied before paint via a boot script.

export const APPEARANCE_KEY = "it-passport-appearance";

export type FontScale = "sm" | "md" | "lg" | "xl";

export type Appearance = {
  fontScale: FontScale;
  reduceMotion: boolean;
  highContrast: boolean;
  // When false, the English explanations shown beneath the Japanese ones
  // (the "EN" blurbs) are hidden. Defaults to true so the bilingual study
  // experience is on out of the box.
  showEnglish: boolean;
};

export const defaultAppearance: Appearance = {
  fontScale: "md",
  reduceMotion: false,
  highContrast: false,
  showEnglish: true,
};

export const FONT_SCALE_OPTIONS: { id: FontScale; label: string; px: number }[] = [
  { id: "sm", label: "小", px: 15 },
  { id: "md", label: "標準", px: 16 },
  { id: "lg", label: "大", px: 18 },
  { id: "xl", label: "特大", px: 20 },
];

function fontScaleToPx(scale: FontScale): number {
  return FONT_SCALE_OPTIONS.find((o) => o.id === scale)?.px ?? 16;
}

export function loadAppearance(): Appearance {
  if (typeof window === "undefined") return defaultAppearance;
  try {
    const raw = window.localStorage.getItem(APPEARANCE_KEY);
    if (!raw) return defaultAppearance;
    const parsed = JSON.parse(raw) as Partial<Appearance>;
    return {
      fontScale: (["sm", "md", "lg", "xl"] as FontScale[]).includes(parsed.fontScale as FontScale)
        ? (parsed.fontScale as FontScale)
        : defaultAppearance.fontScale,
      reduceMotion: typeof parsed.reduceMotion === "boolean" ? parsed.reduceMotion : false,
      highContrast: typeof parsed.highContrast === "boolean" ? parsed.highContrast : false,
      showEnglish: typeof parsed.showEnglish === "boolean" ? parsed.showEnglish : defaultAppearance.showEnglish,
    };
  } catch {
    return defaultAppearance;
  }
}

export function applyAppearance(a: Appearance) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.style.fontSize = `${fontScaleToPx(a.fontScale)}px`;
  root.classList.toggle("no-motion", a.reduceMotion);
  root.classList.toggle("high-contrast", a.highContrast);
  root.classList.toggle("hide-en", !a.showEnglish);
}

export function saveAppearance(a: Appearance) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(APPEARANCE_KEY, JSON.stringify(a));
  applyAppearance(a);
}

// Inline boot script applying appearance before first paint.
export const appearanceBootScript = `
(function(){
  try {
    var raw = localStorage.getItem('${APPEARANCE_KEY}');
    var a = raw ? JSON.parse(raw) : {};
    var px = {sm:15,md:16,lg:18,xl:20}[a.fontScale] || 16;
    var root = document.documentElement;
    root.style.fontSize = px + 'px';
    if (a.reduceMotion) root.classList.add('no-motion');
    if (a.highContrast) root.classList.add('high-contrast');
    if (a.showEnglish === false) root.classList.add('hide-en');
  } catch (e) {}
})();
`;
