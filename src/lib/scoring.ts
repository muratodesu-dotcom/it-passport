import {
  categoryLabels,
  Category,
  ExamType,
  ipFieldLabels,
  Question,
  QuestionOutcome,
} from "./types";

// Generic pass line for practice quizzes (not a formal exam).
export const PRACTICE_PASS_PERCENT = 60;

export interface ExamRule {
  label: string;
  questionCount: number;
  timeLimitSeconds: number;
  // Overall pass line, as a percentage of questions answered correctly.
  passPercent: number;
  // Minimum percentage required in every domain. Undefined => no per-domain rule.
  domainPassPercent?: number;
  domainKind: "category" | "ipField";
  // Short note explaining how the criteria map to the official exam.
  criteriaNote: string;
}

// ITパスポート: 総合 600/1000 かつ各分野 300/1000 以上。公式はIRTによる
// スコア方式のため、本アプリは正答率で近似（総合60% / 各分野30%）。
// 知財3級 学科: 30問・45分・満点の70%以上で合格。
export const examRules: Record<ExamType, ExamRule> = {
  "it-passport": {
    label: "ITパスポート",
    questionCount: 100,
    timeLimitSeconds: 120 * 60,
    passPercent: 60,
    domainPassPercent: 30,
    domainKind: "category",
    criteriaNote: "総合60%以上、かつストラテジ・マネジメント・テクノロジ各分野30%以上で合格（公式のIRT方式を正答率で近似）。",
  },
  chizai: {
    label: "知的財産管理技能検定3級",
    questionCount: 30,
    timeLimitSeconds: 45 * 60,
    passPercent: 70,
    domainKind: "ipField",
    criteriaNote: "学科試験は30問・45分、満点の70%以上で合格。",
  },
};

export interface GradeItem {
  isCorrect: boolean;
  domainKey: string;
  domainLabel: string;
}

export interface DomainResult {
  key: string;
  label: string;
  correct: number;
  total: number;
  percentage: number;
  passed: boolean;
}

export interface ExamEvaluation {
  correct: number;
  total: number;
  percentage: number;
  overallPassed: boolean;
  domainResults: DomainResult[];
  passed: boolean;
  failReasons: string[];
}

// Resolve the domain (key + display label) of a question for a given exam.
export function questionDomain(examType: ExamType, q: Question): { key: string; label: string } {
  if (examRules[examType].domainKind === "ipField") {
    const field = q.ipField ?? "other";
    return { key: field, label: ipFieldLabels[field] };
  }
  return { key: q.category, label: categoryLabels[q.category as Category] ?? q.category };
}

export function buildGradeItems(
  examType: ExamType,
  questions: Question[],
  outcomes: QuestionOutcome[]
): GradeItem[] {
  return questions.map((q, i) => {
    const domain = questionDomain(examType, q);
    return {
      isCorrect: Boolean(outcomes[i]?.isCorrect),
      domainKey: domain.key,
      domainLabel: domain.label,
    };
  });
}

// Pure scoring function. Given the exam type and a flat list of graded items,
// returns overall and per-domain results plus a human-readable fail reason list.
export function gradeExam(examType: ExamType, items: GradeItem[]): ExamEvaluation {
  const rule = examRules[examType];
  const total = items.length;
  const correct = items.filter((i) => i.isCorrect).length;
  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
  const overallPassed = total > 0 && percentage >= rule.passPercent;

  const buckets = new Map<string, { label: string; correct: number; total: number }>();
  for (const item of items) {
    const bucket = buckets.get(item.domainKey) ?? { label: item.domainLabel, correct: 0, total: 0 };
    bucket.total += 1;
    if (item.isCorrect) bucket.correct += 1;
    buckets.set(item.domainKey, bucket);
  }

  const domainResults: DomainResult[] = Array.from(buckets.entries()).map(([key, v]) => {
    const pct = v.total > 0 ? Math.round((v.correct / v.total) * 100) : 0;
    const passed = rule.domainPassPercent === undefined ? true : pct >= rule.domainPassPercent;
    return { key, label: v.label, correct: v.correct, total: v.total, percentage: pct, passed };
  });

  const failReasons: string[] = [];
  if (!overallPassed) {
    failReasons.push(`総合${percentage}%（合格には${rule.passPercent}%以上が必要）`);
  }
  if (rule.domainPassPercent !== undefined) {
    for (const d of domainResults) {
      if (!d.passed) {
        failReasons.push(`${d.label} ${d.percentage}%（分野別は${rule.domainPassPercent}%以上が必要）`);
      }
    }
  }

  const passed = overallPassed && domainResults.every((d) => d.passed);
  return { correct, total, percentage, overallPassed, domainResults, passed, failReasons };
}
