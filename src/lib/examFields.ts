import { Category, categoryLabels, ExamType, IpField, ipFieldLabels } from "./types";

// A "field" is a category (ITパスポート) or an IP field (知財3級).
export type FieldId = "all" | Category | IpField;

export interface FieldOption {
  id: FieldId;
  label: string;
}

export function parseExam(value: string | null | undefined): ExamType {
  return value === "chizai" ? "chizai" : "it-passport";
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
  item: { category: Category; ipField?: IpField }
): string {
  return exam === "chizai" ? item.ipField ?? "other" : item.category;
}

export function fieldLabel(exam: ExamType, key: string): string {
  return exam === "chizai"
    ? ipFieldLabels[key as IpField] ?? key
    : categoryLabels[key as Category] ?? key;
}
