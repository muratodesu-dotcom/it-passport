import { readingFor } from "@/data/termReadings";

// Renders a glossary term with furigana (a <ruby> reading) above the kanji
// when a reading exists for it; otherwise renders the term as plain text.
// Safe to use anywhere a term string is shown — flashcards, the feed, the
// glossary — so kanji-heavy terms stay readable.
export default function Furigana({
  term,
  className,
}: {
  term: string;
  className?: string;
}) {
  const reading = readingFor(term);
  if (!reading) {
    return className ? <span className={className}>{term}</span> : <>{term}</>;
  }
  return (
    <ruby className={className}>
      {term}
      <rt className="furigana-rt text-[0.55em] font-normal tracking-tight text-[var(--muted)]">
        {reading}
      </rt>
    </ruby>
  );
}
