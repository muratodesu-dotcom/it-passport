"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import { AiSettings, defaultAiSettings, loadAiSettings, saveAiSettings } from "@/lib/appSettings";

export default function SettingsPage() {
  const [settings, setSettings] = useState<AiSettings>(defaultAiSettings);
  const [savedMessage, setSavedMessage] = useState("");
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    setSettings(loadAiSettings());

    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const showTemporaryMessage = (message: string) => {
    setSavedMessage(message);

    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = window.setTimeout(() => setSavedMessage(""), 2500);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedSettings: AiSettings = {
      apiKey: settings.apiKey.trim(),
      model: settings.model.trim() || defaultAiSettings.model,
    };

    setSettings(normalizedSettings);
    saveAiSettings(normalizedSettings);
    showTemporaryMessage("保存しました。Doom Scroll学習などのAI生成機能でこの設定が使われます。");
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <p className="mb-2 text-sm font-medium text-[var(--primary)]">Settings</p>
          <h1 className="text-3xl font-bold">AI生成の設定</h1>
          <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
            OpenAI APIキーとモデル名を保存すると、学習ページから最新情報を交えた補足解説や追加コンテンツを生成できます。
          </p>
        </div>
        <Link
          href="/"
          className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] px-4 py-2 text-sm font-medium transition-colors hover:bg-[var(--card-hover)]"
        >
          ← ホームへ
        </Link>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-[var(--card-border)] bg-[var(--card)] p-6 shadow-sm"
      >
        <div className="grid gap-6">
          <label className="grid gap-2">
            <span className="text-sm font-semibold">OpenAI API Key</span>
            <input
              type="password"
              value={settings.apiKey}
              onChange={(event) => setSettings((current) => ({ ...current, apiKey: event.target.value }))}
              placeholder="sk-..."
              className="rounded-xl border border-[var(--card-border)] bg-[var(--background)] px-4 py-3 outline-none transition focus:border-[var(--primary)]"
              autoComplete="off"
            />
            <span className="text-xs leading-relaxed text-[var(--muted)]">
              キーはこのブラウザのlocalStorageに保存されます。サーバーに恒久保存はしません。
            </span>
            <div className="rounded-xl border border-amber-400/40 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-900 dark:border-amber-300/30 dark:bg-amber-400/10 dark:text-amber-100">
              <p className="font-semibold mb-1">⚠ セキュリティ上の注意</p>
              <ul className="list-disc space-y-0.5 pl-4">
                <li>localStorageは同じブラウザの他スクリプト（拡張機能含む）から参照できます。共用端末では使用しないでください。</li>
                <li>キーはAI生成リクエストごとに自端末のAPI Routeを経由してOpenAIに送信されます。</li>
                <li>不要になったら必ず「リセット」で削除し、OpenAIダッシュボードで利用上限を設定することを推奨します。</li>
              </ul>
            </div>
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-semibold">Model</span>
            <input
              type="text"
              value={settings.model}
              onChange={(event) => setSettings((current) => ({ ...current, model: event.target.value }))}
              placeholder="gpt-4.1-mini"
              className="rounded-xl border border-[var(--card-border)] bg-[var(--background)] px-4 py-3 outline-none transition focus:border-[var(--primary)]"
            />
            <span className="text-xs leading-relaxed text-[var(--muted)]">
              例: <code>gpt-4.1-mini</code> / <code>gpt-4.1</code>。設定したモデル名がAI生成リクエストにそのまま使われます。
            </span>
          </label>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            className="rounded-xl bg-[var(--primary)] px-5 py-3 font-medium text-white transition-colors hover:bg-[var(--primary-hover)]"
          >
            設定を保存
          </button>
          <button
            type="button"
            onClick={() => {
              setSettings(defaultAiSettings);
              saveAiSettings(defaultAiSettings);
              showTemporaryMessage("設定をリセットしました。");
            }}
            className="rounded-xl bg-[var(--secondary-btn-bg)] px-5 py-3 font-medium transition-colors hover:bg-[var(--secondary-btn-hover)]"
          >
            リセット
          </button>
          {savedMessage ? <p className="text-sm text-emerald-600">{savedMessage}</p> : null}
        </div>
      </form>

      <div className="mt-6 rounded-2xl border border-sky-200/70 bg-sky-50/70 p-5 text-sm leading-relaxed text-[var(--muted)] dark:border-sky-400/20 dark:bg-sky-500/10">
        <p className="font-semibold text-sky-900 dark:text-sky-100">この設定でできること</p>
        <ul className="mt-3 space-y-2">
          <li>• 学習中のトピックに対して、Web検索を含む補足ノートを生成。</li>
          <li>• Doom Scrollモードで流しているテーマに追加の背景説明を付与。</li>
          <li>• 今後ほかのエリアにも同じ設定を横展開しやすい共通ストレージとして利用。</li>
        </ul>
      </div>
    </div>
  );
}
