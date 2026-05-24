import { TermPair } from "@/data/terms";
import { categoryLabels } from "./types";

export interface DrillQuestion {
  id: string;
  prompt: string;
  promptHint?: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
  termKey?: string;
}

export type DrillKind =
  | "term-def"
  | "cloze"
  | "en-jp"
  | "truefalse"
  | "odd"
  | "review"
  | "duration"
  | "classify"
  | "treaty"
  | "flow"
  | "calc"
  | "cat3"
  | "acronym";

export interface DrillDef {
  kind: DrillKind;
  title: string;
  description: string;
  icon: string;
  usesField: boolean;
  crossField?: boolean;
  source?: "missed";
}

export const drillList: DrillDef[] = [
  { kind: "term-def", title: "用語→意味", description: "用語を見て正しい説明を選ぶ", icon: "📖", usesField: true },
  { kind: "cloze", title: "意味→用語", description: "説明を読んで当てはまる用語を当てる", icon: "✍️", usesField: true },
  { kind: "en-jp", title: "英日対応", description: "日本語と英語を対応させる", icon: "🔤", usesField: true },
  { kind: "truefalse", title: "○✕ 正誤判定", description: "説明が正しいかを素早く判定", icon: "⭕", usesField: true },
  { kind: "odd", title: "仲間はずれ", description: "分野が異なる用語を見つける", icon: "🎯", usesField: false, crossField: true },
  { kind: "review", title: "間違えた用語の復習", description: "ドリルで間違えた用語だけを復習", icon: "🔁", usesField: false, source: "missed" },
];

export const drillMap: Record<string, DrillDef> = Object.fromEntries(drillList.map((d) => [d.kind, d]));

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function distractors(terms: TermPair[], exclude: TermPair, n: number): TermPair[] {
  return shuffle(terms.filter((t) => t.term !== exclude.term)).slice(0, n);
}

// Shuffle option order (for curated questions whose correct answer is authored
// at a fixed index) and pick a number of questions.
export function prepareCurated(questions: DrillQuestion[], count: number): DrillQuestion[] {
  return shuffle(questions)
    .slice(0, count)
    .map((q) => {
      const correct = q.options[q.correctIndex];
      const options = shuffle(q.options);
      return { ...q, options, correctIndex: options.indexOf(correct) };
    });
}

export function genTermToDef(terms: TermPair[], count: number): DrillQuestion[] {
  if (terms.length < 4) return [];
  return shuffle(terms).slice(0, count).map((t, i) => {
    const opts = shuffle([t, ...distractors(terms, t, 3)]);
    return {
      id: `${i}`,
      prompt: t.term,
      promptHint: "この用語の説明として正しいものは？",
      options: opts.map((o) => o.description),
      correctIndex: opts.findIndex((o) => o.term === t.term),
      explanation: `${t.term}（${t.english}）：${t.description}`,
      termKey: t.term,
    };
  });
}

export function genDefToTerm(terms: TermPair[], count: number): DrillQuestion[] {
  if (terms.length < 4) return [];
  return shuffle(terms).slice(0, count).map((t, i) => {
    const opts = shuffle([t, ...distractors(terms, t, 3)]);
    return {
      id: `${i}`,
      prompt: t.description,
      promptHint: "この説明に当てはまる用語は？",
      options: opts.map((o) => o.term),
      correctIndex: opts.findIndex((o) => o.term === t.term),
      explanation: `${t.term}（${t.english}）：${t.description}`,
      termKey: t.term,
    };
  });
}

export function genEnJp(terms: TermPair[], count: number): DrillQuestion[] {
  if (terms.length < 4) return [];
  return shuffle(terms).slice(0, count).map((t, i) => {
    const opts = shuffle([t, ...distractors(terms, t, 3)]);
    const correctIndex = opts.findIndex((o) => o.term === t.term);
    if (i % 2 === 0) {
      return {
        id: `${i}`,
        prompt: t.term,
        promptHint: "英語表記はどれ？",
        options: opts.map((o) => o.english),
        correctIndex,
        explanation: `${t.term} = ${t.english}`,
        termKey: t.term,
      };
    }
    return {
      id: `${i}`,
      prompt: t.english,
      promptHint: "日本語の用語はどれ？",
      options: opts.map((o) => o.term),
      correctIndex,
      explanation: `${t.english} = ${t.term}`,
      termKey: t.term,
    };
  });
}

export function genTrueFalse(terms: TermPair[], count: number): DrillQuestion[] {
  if (terms.length < 2) return [];
  return shuffle(terms).slice(0, count).map((t, i) => {
    const makeTrue = Math.random() < 0.5;
    const other = distractors(terms, t, 1)[0] ?? t;
    const shownDesc = makeTrue ? t.description : other.description;
    return {
      id: `${i}`,
      prompt: `「${t.term}」の説明として正しい？`,
      promptHint: shownDesc,
      options: ["⭕ 正しい", "❌ 誤り"],
      correctIndex: makeTrue ? 0 : 1,
      explanation: makeTrue
        ? `正しい説明です。${t.term} = ${t.description}`
        : `誤り。${t.term} = ${t.description}`,
      termKey: t.term,
    };
  });
}

// ITパスポート: 用語を3分野（ストラテジ/マネジメント/テクノロジ）に分類する。
export function genCategoryClassify(terms: TermPair[], count: number): DrillQuestion[] {
  const labels = [categoryLabels.strategy, categoryLabels.management, categoryLabels.technology];
  return shuffle(terms).slice(0, count).map((t, i) => {
    const options = shuffle(labels);
    const correctLabel = categoryLabels[t.category];
    return {
      id: `${i}`,
      prompt: t.term,
      promptHint: "この用語はどの分野？",
      options,
      correctIndex: options.indexOf(correctLabel),
      explanation: `${t.term} は${correctLabel}（${t.description}）`,
      termKey: t.term,
    };
  });
}

// 頭字語（CRM, ERP など）→ 正式名称（英語）を当てる。
export function genAcronym(terms: TermPair[], count: number): DrillQuestion[] {
  const pool = terms.filter((t) => /^[A-Za-z0-9&./+-]{2,14}$/.test(t.term));
  if (pool.length < 4) return [];
  return shuffle(pool).slice(0, count).map((t, i) => {
    const opts = shuffle([t, ...shuffle(pool.filter((x) => x.term !== t.term)).slice(0, 3)]);
    return {
      id: `${i}`,
      prompt: t.term,
      promptHint: "この略語の正式名称は？",
      options: opts.map((o) => o.english),
      correctIndex: opts.findIndex((o) => o.term === t.term),
      explanation: `${t.term} = ${t.english}（${t.description}）`,
      termKey: t.term,
    };
  });
}

export function genOddOneOut(
  groups: { key: string; label: string; terms: TermPair[] }[],
  count: number
): DrillQuestion[] {
  const usable = groups.filter((g) => g.terms.length >= 3);
  if (usable.length < 2) return [];
  const out: DrillQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const [maj, min] = shuffle(usable).slice(0, 2);
    const three = shuffle(maj.terms).slice(0, 3);
    const odd = shuffle(min.terms)[0];
    const opts = shuffle([...three, odd]);
    out.push({
      id: `${i}`,
      prompt: "分野が異なる『仲間はずれ』はどれ？",
      options: opts.map((o) => o.term),
      correctIndex: opts.findIndex((o) => o.term === odd.term),
      explanation: `「${odd.term}」は${min.label}、ほかは${maj.label}の用語です。`,
      termKey: odd.term,
    });
  }
  return out;
}
