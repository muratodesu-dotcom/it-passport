import { descriptionEnFor } from "@/data/termsEn";
import type { ExamType } from "@/lib/types";

// Renders the English description for a glossary term beneath the Japanese one
// (in drills, flashcards and the feed). Returns null when no English text
// exists for the term. Carries the same `explanation-en` class as the question
// bank's ExplanationEn, so the "英語の解説を表示" setting hides it too.
// The AI Engineer track ("dev") is written in English already, so it gets no
// second English line (and an English headword such as "API" must not pick up
// the ITパスポート entry of the same name).
export default function TermExplanationEn({ term, exam }: { term?: string; exam?: ExamType }) {
  const en = term && exam !== "dev" ? descriptionEnFor(term) : undefined;
  if (!en) return null;
  return (
    <p className="explanation-en mt-2 text-sm leading-relaxed text-[var(--muted)]">
      <span className="mr-1.5 inline-block rounded bg-[var(--badge-bg)] px-1.5 py-0.5 text-[10px] font-semibold align-[1px]">
        EN
      </span>
      {en}
    </p>
  );
}
