import { questions as allQuestions } from "@/data/questions";
import {
  Category,
  categoryLabels,
  IpField,
  ipFieldLabels,
  QuizMode,
  QuizResult,
} from "./types";

// Minimum number of answered questions before a domain is eligible to be
// flagged as "weakest". Avoids treating a single unlucky answer as a weak area.
const WEAKEST_MIN_ANSWERS = 4;

export interface TrendPoint {
  date: string;
  percentage: number;
  passed: boolean;
  mode: QuizMode;
}

export interface DomainAccuracy {
  // Quiz query that drills this domain, e.g. "category=strategy".
  query: string;
  label: string;
  correct: number;
  total: number;
  percentage: number;
}

export interface HistoryAnalytics {
  // Chronological (oldest first) so charts read left-to-right.
  trend: TrendPoint[];
  categoryAccuracy: DomainAccuracy[];
  ipFieldAccuracy: DomainAccuracy[];
  totalAnswered: number;
  totalCorrect: number;
  weakest: DomainAccuracy | null;
  practiceCount: number;
  examCount: number;
}

interface DomainMeta {
  category: Category;
  ipField?: IpField;
}

// id -> { category, ipField } lookup, built once per module load.
const questionMeta = new Map<number, DomainMeta>(
  allQuestions.map((q) => [q.id, { category: q.category, ipField: q.ipField }])
);

interface Bucket {
  correct: number;
  total: number;
}

function toAccuracy(
  buckets: Map<string, Bucket>,
  label: (key: string) => string,
  query: (key: string) => string
): DomainAccuracy[] {
  return Array.from(buckets.entries())
    .map(([key, b]) => ({
      query: query(key),
      label: label(key),
      correct: b.correct,
      total: b.total,
      percentage: b.total > 0 ? Math.round((b.correct / b.total) * 100) : 0,
    }))
    .sort((a, b) => a.percentage - b.percentage);
}

// Aggregates an entire quiz history into trend + all-time domain accuracy.
// Pure so it can be unit tested without touching localStorage.
export function analyzeHistory(history: QuizResult[]): HistoryAnalytics {
  const trend: TrendPoint[] = [];
  const categoryBuckets = new Map<string, Bucket>();
  const ipFieldBuckets = new Map<string, Bucket>();
  let totalAnswered = 0;
  let totalCorrect = 0;
  let practiceCount = 0;
  let examCount = 0;

  // history is stored newest-first; reverse for a left-to-right timeline.
  for (let i = history.length - 1; i >= 0; i--) {
    const result = history[i];
    const mode: QuizMode = result.mode === "exam" ? "exam" : "practice";
    if (mode === "exam") examCount++;
    else practiceCount++;

    trend.push({
      date: result.date,
      percentage: result.percentage,
      passed: result.passed,
      mode,
    });

    if (!result.outcomes) continue;
    for (const outcome of result.outcomes) {
      const meta = questionMeta.get(outcome.id);
      if (!meta) continue;
      totalAnswered++;
      if (outcome.isCorrect) totalCorrect++;

      const cat = categoryBuckets.get(meta.category) ?? { correct: 0, total: 0 };
      cat.total++;
      if (outcome.isCorrect) cat.correct++;
      categoryBuckets.set(meta.category, cat);

      if (meta.ipField) {
        const ip = ipFieldBuckets.get(meta.ipField) ?? { correct: 0, total: 0 };
        ip.total++;
        if (outcome.isCorrect) ip.correct++;
        ipFieldBuckets.set(meta.ipField, ip);
      }
    }
  }

  const categoryAccuracy = toAccuracy(
    categoryBuckets,
    (key) => categoryLabels[key as Category] ?? key,
    (key) => `category=${key}`
  );
  // 知財3級は分野別の練習導線が無いため、ドリルリンクは本番試験モードに寄せる。
  const ipFieldAccuracy = toAccuracy(
    ipFieldBuckets,
    (key) => ipFieldLabels[key as IpField] ?? key,
    () => `mode=exam&exam=chizai`
  );

  // Weakest area across both breakdowns, ignoring thinly-sampled domains.
  const weakest = [...categoryAccuracy, ...ipFieldAccuracy]
    .filter((d) => d.total >= WEAKEST_MIN_ANSWERS)
    .reduce<DomainAccuracy | null>((min, d) => {
      if (!min || d.percentage < min.percentage) return d;
      return min;
    }, null);

  return {
    trend,
    categoryAccuracy,
    ipFieldAccuracy,
    totalAnswered,
    totalCorrect,
    weakest,
    practiceCount,
    examCount,
  };
}
