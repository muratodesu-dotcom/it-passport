"use client";

import { useEffect } from "react";
import Link from "@/components/SiteLink";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex max-w-md flex-col items-center px-4 py-16 text-center">
      <span className="mb-3 text-4xl" aria-hidden>⚠️</span>
      <h1 className="mb-1 text-xl font-bold">表示中にエラーが発生しました</h1>
      <p className="mb-6 text-sm text-[var(--muted)]">学習履歴はこの端末に保存されたままです。もう一度試してください。</p>
      <div className="flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={reset}
          className="inline-flex min-h-11 items-center rounded-xl bg-[var(--primary)] px-5 font-medium text-[var(--on-primary)] transition-colors hover:bg-[var(--primary-hover)]"
        >
          再試行
        </button>
        <Link
          href="/"
          className="inline-flex min-h-11 items-center rounded-xl border border-[var(--card-border)] bg-[var(--card)] px-5 font-medium transition-colors hover:bg-[var(--card-hover)]"
        >
          ホームへ
        </Link>
      </div>
    </main>
  );
}
