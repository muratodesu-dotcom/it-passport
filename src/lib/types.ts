export type Exam = "it-passport" | "ip-3";

export type ItPassportCategory = "strategy" | "management" | "technology";
export type Ip3Category = "patent" | "design" | "trademark" | "copyright" | "unfair-competition" | "treaty";

export type Category = ItPassportCategory | Ip3Category;

export interface Question {
  id: number;
  exam: Exam;
  category: Category;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export type RawQuestion = Omit<Question, "exam">;

export interface TermPair {
  term: string;
  english: string;
  description: string;
  exam: Exam;
  category: Category;
}

export type RawTermPair = Omit<TermPair, "exam">;

export interface QuizState {
  questions: Question[];
  currentIndex: number;
  answers: (number | null)[];
  isFinished: boolean;
}

export interface QuizResult {
  id: string;
  date: string;
  exam: Exam;
  category: string;
  score: number;
  total: number;
  percentage: number;
  timeSeconds: number;
  passed: boolean;
  // Per-question outcomes; older entries may not have these.
  questionIds?: number[];
  answers?: (number | null)[];
}

export const examLabels: Record<Exam, string> = {
  "it-passport": "ITパスポート",
  "ip-3": "知財3級",
};

export const examLongLabels: Record<Exam, string> = {
  "it-passport": "ITパスポート試験",
  "ip-3": "知的財産管理技能検定 3級",
};

export const categoryLabels: Record<Category, string> = {
  // IT Passport
  strategy: "ストラテジ系",
  management: "マネジメント系",
  technology: "テクノロジ系",
  // 知財3級
  patent: "特許・実用新案",
  design: "意匠",
  trademark: "商標",
  copyright: "著作権",
  "unfair-competition": "不正競争防止法",
  treaty: "条約・その他",
};

export const categoryColors: Record<Category, string> = {
  strategy: "bg-blue-500",
  management: "bg-green-500",
  technology: "bg-purple-500",
  patent: "bg-indigo-500",
  design: "bg-pink-500",
  trademark: "bg-amber-500",
  copyright: "bg-emerald-500",
  "unfair-competition": "bg-rose-500",
  treaty: "bg-cyan-500",
};

export const categoryByExam: Record<Exam, Category[]> = {
  "it-passport": ["strategy", "management", "technology"],
  "ip-3": ["patent", "design", "trademark", "copyright", "unfair-competition", "treaty"],
};

export const exams: Exam[] = ["it-passport", "ip-3"];
