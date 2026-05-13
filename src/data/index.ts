import { Exam, Question, TermPair } from "@/lib/types";
import { questions as itQuestions } from "./questions";
import { termPairs as itTerms } from "./terms";
import { ip3Questions } from "./questions-ip3";
import { ip3TermPairs } from "./terms-ip3";

const stampQuestions = (qs: { id: number; category: string; question: string; options: string[]; correctIndex: number; explanation: string }[], exam: Exam): Question[] =>
  qs.map((q) => ({ ...q, exam } as Question));

const stampTerms = (ts: { term: string; english: string; description: string; category: string }[], exam: Exam): TermPair[] =>
  ts.map((t) => ({ ...t, exam } as TermPair));

export const allQuestions: Question[] = [
  ...stampQuestions(itQuestions, "it-passport"),
  ...stampQuestions(ip3Questions, "ip-3"),
];

export const allTermPairs: TermPair[] = [
  ...stampTerms(itTerms, "it-passport"),
  ...stampTerms(ip3TermPairs, "ip-3"),
];

export function getQuestions(exam: Exam): Question[] {
  return allQuestions.filter((q) => q.exam === exam);
}

export function getTermPairs(exam: Exam): TermPair[] {
  return allTermPairs.filter((t) => t.exam === exam);
}

export function getQuestionsByCategory(exam: Exam, category: string): Question[] {
  const pool = getQuestions(exam);
  if (category === "all") return pool;
  return pool.filter((q) => q.category === category);
}
