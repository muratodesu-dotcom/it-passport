export type Category = "strategy" | "management" | "technology";

export interface Question {
  id: number;
  category: Category;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface QuizState {
  questions: Question[];
  currentIndex: number;
  answers: (number | null)[];
  isFinished: boolean;
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
