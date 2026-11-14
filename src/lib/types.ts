export type Category = "strategy" | "management" | "technology";

export type QuizMode = "practice" | "exam";

// The exams (and study tracks) this app prepares for. "dev" is the AI Engineer
// track (Git, Supabase, Vercel, web and AI engineering), written in English.
// It has no official exam, so it offers practice, study and games but no
// 本番試験 mode.
export type ExamType = "it-passport" | "chizai" | "dev";

// Sub-fields of the AI Engineer track.
export type DevField = "git" | "database" | "vercel" | "web" | "ai";

// Sub-fields used to break down 知財3級 (intellectual property) questions.
export type IpField = "patent" | "design-trademark" | "copyright" | "other";

export interface Question {
  id: number;
  category: Category;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  // Which exams this question belongs to. Absent means ITパスポート only.
  exams?: ExamType[];
  // 知財3級 sub-field, used for the per-field breakdown on results.
  ipField?: IpField;
  // AIエンジニア track sub-field.
  devField?: DevField;
}

export interface QuizState {
  questions: Question[];
  currentIndex: number;
  answers: (number | null)[];
  isFinished: boolean;
}

export interface QuestionOutcome {
  id: number;
  answeredIndex: number | null;
  correctIndex: number;
  isCorrect: boolean;
}

export interface QuizResult {
  id: string;
  date: string;
  category: string;
  score: number;
  total: number;
  percentage: number;
  timeSeconds: number;
  passed: boolean;
  mode?: QuizMode;
  examType?: ExamType;
  outcomes?: QuestionOutcome[];
}

export const categoryLabels: Record<Category, string> = {
  strategy: "ストラテジ系",
  management: "マネジメント系",
  technology: "テクノロジ系",
};

export const categoryColors: Record<Category, string> = {
  strategy: "bg-blue-500",
  management: "bg-green-500",
  technology: "bg-purple-500",
};

export const examLabels: Record<ExamType, string> = {
  "it-passport": "ITパスポート",
  chizai: "知的財産管理技能検定3級",
  dev: "AI Engineer (Git · Supabase · Vercel · Web · AI)",
};

export const examShortLabels: Record<ExamType, string> = {
  "it-passport": "ITパスポート",
  chizai: "知財3級",
  dev: "AI Engineer",
};

export const ipFieldLabels: Record<IpField, string> = {
  patent: "特許・実用新案",
  "design-trademark": "意匠・商標",
  copyright: "著作権",
  other: "その他（不競法・契約・条約）",
};

export const devFieldLabels: Record<DevField, string> = {
  git: "Git & GitHub",
  database: "Supabase & DB",
  vercel: "Vercel",
  web: "Web & HTTP",
  ai: "AI & LLMs",
};
