import Link from "@/components/SiteLink";

export default function NotFound() {
  return (
    <main className="mx-auto flex max-w-md flex-col items-center px-4 py-16 text-center">
      <span className="mb-3 text-4xl" aria-hidden>🧭</span>
      <h1 className="mb-1 text-xl font-bold">ページが見つかりません</h1>
      <p className="mb-6 text-sm text-[var(--muted)]">URLが変わったか、削除された可能性があります。</p>
      <Link
        href="/"
        className="inline-flex min-h-11 items-center rounded-xl bg-[var(--primary)] px-5 font-medium text-[var(--on-primary)] transition-colors hover:bg-[var(--primary-hover)]"
      >
        ホームへ戻る
      </Link>
    </main>
  );
}
