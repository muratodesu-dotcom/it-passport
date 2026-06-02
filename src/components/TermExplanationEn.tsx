import { descriptionEnFor } from "@/data/termsEn";

// Renders the English description for a glossary term beneath the Japanese one
// (in drills, flashcards and the feed). Returns null when no English text
// exists for the term. Carries the same `explanation-en` class as the question
// bank's ExplanationEn, so the "英語の解説を表示" setting hides it too.
export default function TermExplanationEn({ term }: { term?: string }) {
  const en = term ? descriptionEnFor(term) : undefined;
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
