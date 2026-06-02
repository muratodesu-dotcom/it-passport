import { explanationEnFor } from "@/data/explanationsEn";

// Renders the English explanation for a question beneath the Japanese one.
// Returns null when no English text exists yet, so it is safe to drop in
// anywhere the Japanese explanation is shown.
export default function ExplanationEn({ id }: { id: number }) {
  const en = explanationEnFor(id);
  if (!en) return null;
  return (
    <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
      <span className="mr-1.5 inline-block rounded bg-[var(--badge-bg)] px-1.5 py-0.5 text-[10px] font-semibold align-[1px]">
        EN
      </span>
      {en}
    </p>
  );
}
