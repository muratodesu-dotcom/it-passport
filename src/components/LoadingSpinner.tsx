"use client";

export default function LoadingSpinner({ message = "読み込み中..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <div className="spinner" />
      <p className="text-[var(--muted)] text-sm">{message}</p>
    </div>
  );
}
