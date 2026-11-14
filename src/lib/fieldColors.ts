// One colour and icon per field, shared by the home field rows, the quiz
// screen and the glossary. Colours are mid-dark so white text on them stays
// readable (≥4.5:1) and they still show as bars on dark backgrounds.

export interface FieldStyle {
  color: string;
  icon: string;
}

export const FIELD_STYLES: Record<string, FieldStyle> = {
  // ITパスポート categories
  strategy: { color: "#2563eb", icon: "💼" },
  management: { color: "#047857", icon: "📋" },
  technology: { color: "#9333ea", icon: "💻" },
  // 知財3級 fields
  patent: { color: "#4f46e5", icon: "🔬" },
  "design-trademark": { color: "#e11d48", icon: "🎨" },
  copyright: { color: "#b45309", icon: "✍️" },
  other: { color: "#0f766e", icon: "📜" },
  // AI Engineer fields
  git: { color: "#c2410c", icon: "🌿" },
  database: { color: "#047857", icon: "🗄️" },
  vercel: { color: "#525252", icon: "🚀" },
  web: { color: "#0369a1", icon: "🌐" },
  ai: { color: "#7c3aed", icon: "🤖" },
};

const FALLBACK: FieldStyle = { color: "var(--primary)", icon: "📚" };

export function fieldStyle(key: string | undefined | null): FieldStyle {
  return (key && FIELD_STYLES[key]) || FALLBACK;
}
