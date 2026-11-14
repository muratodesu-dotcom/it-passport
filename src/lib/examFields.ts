import {
  Category,
  categoryLabels,
  DevField,
  devFieldLabels,
  ExamType,
  IpField,
  ipFieldLabels,
} from "./types";

// A "field" is a category (ITパスポート), an IP field (知財3級) or a dev field
// (AI Engineer).
export type FieldId = "all" | Category | IpField | DevField;

export interface FieldOption {
  id: FieldId;
  label: string;
}

export function parseExam(value: string | null | undefined): ExamType {
  if (value === "chizai") return "chizai";
  if (value === "dev") return "dev";
  return "it-passport";
}

/** Exams with an official 本番試験 mode. The AI Engineer track is practice only. */
export function hasExamMode(exam: ExamType): boolean {
  return exam !== "dev";
}

export function fieldOptions(exam: ExamType): FieldOption[] {
  if (exam === "chizai") {
    return [
      { id: "all", label: "全分野" },
      { id: "patent", label: ipFieldLabels.patent },
      { id: "design-trademark", label: ipFieldLabels["design-trademark"] },
      { id: "copyright", label: ipFieldLabels.copyright },
      { id: "other", label: ipFieldLabels.other },
    ];
  }
  if (exam === "dev") {
    return [
      { id: "all", label: "All fields" },
      { id: "git", label: devFieldLabels.git },
      { id: "database", label: devFieldLabels.database },
      { id: "vercel", label: devFieldLabels.vercel },
      { id: "web", label: devFieldLabels.web },
      { id: "ai", label: devFieldLabels.ai },
    ];
  }
  return [
    { id: "all", label: "全分野" },
    { id: "strategy", label: categoryLabels.strategy },
    { id: "management", label: categoryLabels.management },
    { id: "technology", label: categoryLabels.technology },
  ];
}

// Resolve the field key of a term/question for the given exam.
export function itemField(
  exam: ExamType,
  item: { category: Category; ipField?: IpField; devField?: DevField }
): string {
  if (exam === "chizai") return item.ipField ?? "other";
  if (exam === "dev") return item.devField ?? "web";
  return item.category;
}

export function fieldLabel(exam: ExamType, key: string): string {
  if (exam === "chizai") return ipFieldLabels[key as IpField] ?? key;
  if (exam === "dev") return devFieldLabels[key as DevField] ?? key;
  return categoryLabels[key as Category] ?? key;
}
