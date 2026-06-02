"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import { AiSettings, defaultAiSettings, loadAiSettings, saveAiSettings } from "@/lib/appSettings";
import {
  Appearance,
  FONT_SCALE_OPTIONS,
  FontScale,
  defaultAppearance,
  loadAppearance,
  saveAppearance,
} from "@/lib/appearance";
import {
  THEMES,
  ThemeId,
  ThemeMode,
  applyTheme,
  loadThemeId,
  loadThemeMode,
  resolveDark,
  saveThemeId,
  saveThemeMode,
} from "@/lib/theme";

const MODE_OPTIONS: { id: ThemeMode; label: string; icon: string }[] = [
  { id: "light", label: "ライト", icon: "☀️" },
  { id: "dark", label: "ダーク", icon: "🌙" },
  { id: "system", label: "システム", icon: "🖥️" },
];

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
        checked ? "bg-[var(--primary)]" : "bg-[var(--progress-bg)]"
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-[22px]" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

export default function SettingsPage() {
  // Appearance state
  const [themeId, setThemeId] = useState<ThemeId>("default");
  const [mode, setMode] = useState<ThemeMode>("system");
  const [appearance, setAppearance] = useState<Appearance>(defaultAppearance);

  // AI state
  const [settings, setSettings] = useState<AiSettings>(defaultAiSettings);
  const [savedMessage, setSavedMessage] = useState("");
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    setThemeId(loadThemeId());
    setMode(loadThemeMode());
    setAppearance(loadAppearance());
    setSettings(loadAiSettings());
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, []);

  const showTemporaryMessage = (message: string) => {
    setSavedMessage(message);
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => setSavedMessage(""), 2500);
  };

  const selectTheme = (id: ThemeId) => {
    setThemeId(id);
    saveThemeId(id);
    applyTheme(id, resolveDark(mode));
  };

  const selectMode = (m: ThemeMode) => {
    setMode(m);
    saveThemeMode(m);
    applyTheme(themeId, resolveDark(m));
  };

  const updateAppearance = (patch: Partial<Appearance>) => {
    setAppearance((current) => {
      const next = { ...current, ...patch };
      saveAppearance(next);
      return next;
    });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedSettings: AiSettings = {
      apiKey: settings.apiKey.trim(),
      model: settings.model.trim() || defaultAiSettings.model,
    };
    setSettings(normalizedSettings);
    saveAiSettings(normalizedSettings);
    showTemporaryMessage("AI設定を保存しました。");
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-10">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <p className="mb-1 text-sm font-medium text-[var(--primary)]">設定</p>
          <h1 className="text-2xl font-bold sm:text-3xl">アプリ設定</h1>
          <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
            見た目のカスタマイズとAI生成の設定をここでまとめて管理できます。
          </p>
        </div>
        <Link
          href="/"
          className="shrink-0 rounded-xl border border-[var(--card-border)] bg-[var(--card)] px-4 py-2 text-sm font-medium transition-colors hover:bg-[var(--card-hover)]"
        >
          ← ホーム
        </Link>
      </div>

      {/* ===== Appearance ===== */}
      <section className="mb-6 rounded-3xl border border-[var(--card-border)] bg-[var(--card)] p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex items-center gap-2">
          <span className="text-xl" aria-hidden>🎨</span>
          <h2 className="text-lg font-bold">外観</h2>
        </div>

        {/* Theme grid */}
        <div className="mb-6">
          <p className="mb-3 text-sm font-semibold">カラーテーマ</p>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {THEMES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => selectTheme(t.id)}
                aria-pressed={themeId === t.id}
                className={`flex items-center gap-2.5 rounded-2xl border p-3 text-left text-sm transition-all ${
                  themeId === t.id
                    ? "border-[var(--primary)] bg-[var(--primary-light)] ring-1 ring-[var(--primary)]"
                    : "border-[var(--card-border)] hover:bg-[var(--card-hover)]"
                }`}
              >
                <span
                  className="h-7 w-7 shrink-0 rounded-full border"
                  style={{ backgroundColor: t.color, borderColor: "var(--card-border)" }}
                />
                <span className="font-medium leading-tight">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Mode */}
        <div className="mb-6">
          <p className="mb-3 text-sm font-semibold">表示モード</p>
          <div className="grid grid-cols-3 gap-2 rounded-2xl border border-[var(--card-border)] bg-[var(--background)] p-1.5">
            {MODE_OPTIONS.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => selectMode(m.id)}
                aria-pressed={mode === m.id}
                className={`flex items-center justify-center gap-1.5 rounded-xl px-2 py-2.5 text-sm font-medium transition-all ${
                  mode === m.id
                    ? "bg-[var(--primary)] text-white shadow-sm"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                <span aria-hidden>{m.icon}</span>
                <span>{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Font size */}
        <div className="mb-6">
          <p className="mb-3 text-sm font-semibold">文字サイズ</p>
          <div className="grid grid-cols-4 gap-2 rounded-2xl border border-[var(--card-border)] bg-[var(--background)] p-1.5">
            {FONT_SCALE_OPTIONS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => updateAppearance({ fontScale: f.id as FontScale })}
                aria-pressed={appearance.fontScale === f.id}
                className={`rounded-xl px-2 py-2.5 font-medium transition-all ${
                  appearance.fontScale === f.id
                    ? "bg-[var(--primary)] text-white shadow-sm"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
                style={{ fontSize: `${Math.max(13, f.px - 2)}px` }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Switches */}
        <div className="divide-y divide-[var(--card-border)] rounded-2xl border border-[var(--card-border)]">
          <div className="flex items-center justify-between gap-4 p-4">
            <div>
              <p className="text-sm font-medium">アニメーションを減らす</p>
              <p className="mt-0.5 text-xs text-[var(--muted)]">
                画面の動きや遷移エフェクトを最小限にします。
              </p>
            </div>
            <Toggle
              checked={appearance.reduceMotion}
              onChange={(v) => updateAppearance({ reduceMotion: v })}
              label="アニメーションを減らす"
            />
          </div>
          <div className="flex items-center justify-between gap-4 p-4">
            <div>
              <p className="text-sm font-medium">高コントラスト</p>
              <p className="mt-0.5 text-xs text-[var(--muted)]">
                境界線と文字をはっきりさせ、視認性を高めます。
              </p>
            </div>
            <Toggle
              checked={appearance.highContrast}
              onChange={(v) => updateAppearance({ highContrast: v })}
              label="高コントラスト"
            />
          </div>
          <div className="flex items-center justify-between gap-4 p-4">
            <div>
              <p className="text-sm font-medium">英語の解説を表示</p>
              <p className="mt-0.5 text-xs text-[var(--muted)]">
                日本語の解説の下に、英語の解説（EN）も表示します。オフにすると日本語のみになります。
              </p>
            </div>
            <Toggle
              checked={appearance.showEnglish}
              onChange={(v) => updateAppearance({ showEnglish: v })}
              label="英語の解説を表示"
            />
          </div>
          <div className="flex items-center justify-between gap-4 p-4">
            <div>
              <p className="text-sm font-medium">ふりがなを表示</p>
              <p className="mt-0.5 text-xs text-[var(--muted)]">
                漢字の用語にふりがな（ルビ）を表示します。オフにすると漢字のみになります。
              </p>
            </div>
            <Toggle
              checked={appearance.showFurigana}
              onChange={(v) => updateAppearance({ showFurigana: v })}
              label="ふりがなを表示"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            saveAppearance(defaultAppearance);
            setAppearance(defaultAppearance);
            selectTheme("default");
            selectMode("system");
            showTemporaryMessage("外観をリセットしました。");
          }}
          className="mt-4 text-xs font-medium text-[var(--muted)] underline-offset-2 hover:text-[var(--foreground)] hover:underline"
        >
          外観を初期設定に戻す
        </button>
      </section>

      {/* ===== AI generation ===== */}
      <section className="rounded-3xl border border-[var(--card-border)] bg-[var(--card)] p-5 shadow-sm sm:p-6">
        <div className="mb-2 flex items-center gap-2">
          <span className="text-xl" aria-hidden>🤖</span>
          <h2 className="text-lg font-bold">AI生成</h2>
        </div>
        <p className="mb-5 text-sm leading-relaxed text-[var(--muted)]">
          OpenAI APIキーとモデル名を保存すると、学習ページから補足解説や追加コンテンツを生成できます。
        </p>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6">
            <label className="grid gap-2">
              <span className="text-sm font-semibold">OpenAI API Key</span>
              <input
                type="password"
                value={settings.apiKey}
                onChange={(event) =>
                  setSettings((current) => ({ ...current, apiKey: event.target.value }))
                }
                placeholder="sk-..."
                className="rounded-xl border border-[var(--card-border)] bg-[var(--background)] px-4 py-3 outline-none transition focus:border-[var(--primary)]"
                autoComplete="off"
              />
              <div className="rounded-xl border border-amber-400/40 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-900 dark:border-amber-300/30 dark:bg-amber-400/10 dark:text-amber-100">
                <p className="mb-1 font-semibold">⚠ セキュリティ上の注意</p>
                <ul className="list-disc space-y-0.5 pl-4">
                  <li>キーはこのブラウザのlocalStorageに保存され、共用端末では他スクリプトから参照され得ます。</li>
                  <li>不要になったら「リセット」で削除し、OpenAI側で利用上限の設定を推奨します。</li>
                </ul>
              </div>
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold">Model</span>
              <input
                type="text"
                value={settings.model}
                onChange={(event) =>
                  setSettings((current) => ({ ...current, model: event.target.value }))
                }
                placeholder="gpt-4.1-mini"
                className="rounded-xl border border-[var(--card-border)] bg-[var(--background)] px-4 py-3 outline-none transition focus:border-[var(--primary)]"
              />
              <span className="text-xs leading-relaxed text-[var(--muted)]">
                例: <code>gpt-4.1-mini</code> / <code>gpt-4.1</code>
              </span>
            </label>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="submit"
              className="rounded-xl bg-[var(--primary)] px-5 py-3 font-medium text-white transition-colors hover:bg-[var(--primary-hover)]"
            >
              AI設定を保存
            </button>
            <button
              type="button"
              onClick={() => {
                setSettings(defaultAiSettings);
                saveAiSettings(defaultAiSettings);
                showTemporaryMessage("AI設定をリセットしました。");
              }}
              className="rounded-xl bg-[var(--secondary-btn-bg)] px-5 py-3 font-medium transition-colors hover:bg-[var(--secondary-btn-hover)]"
            >
              リセット
            </button>
          </div>
        </form>
      </section>

      {savedMessage ? (
        <div className="fade-in fixed inset-x-0 bottom-6 z-50 mx-auto w-fit max-w-[90%] rounded-full bg-[var(--foreground)] px-5 py-2.5 text-sm font-medium text-[var(--background)] shadow-lg">
          {savedMessage}
        </div>
      ) : null}
    </div>
  );
}
