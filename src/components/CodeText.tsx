import { Fragment } from "react";

/**
 * Plain text where `backticked` parts render as inline code. The AIエンジニア
 * track writes commands this way (`git rebase main`); other content has no
 * backticks and renders unchanged.
 */
export default function CodeText({ text }: { text: string }) {
  if (!text.includes("`")) return <>{text}</>;
  const parts = text.split(/(`[^`]+`)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.length > 2 && part.startsWith("`") && part.endsWith("`") ? (
          <code
            key={i}
            className="rounded-md bg-[var(--badge-bg)] px-1.5 py-0.5 font-mono text-[0.9em] [overflow-wrap:anywhere]"
          >
            {part.slice(1, -1)}
          </code>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        )
      )}
    </>
  );
}
