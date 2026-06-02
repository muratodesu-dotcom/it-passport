"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { questions as allQuestions, withShuffledOptions } from "@/data/questions";
import { categoryLabels, Category, examLabels, ipFieldLabels, IpField, Question, QuestionOutcome } from "@/lib/types";
import {
  buildGradeItems,
  DomainResult,
  ExamEvaluation,
  examRules,
  gradeExam,
  PRACTICE_PASS_PERCENT,
  questionDomain,
} from "@/lib/scoring";
import { isBookmarked, saveResult, toggleBookmark } from "@/lib/history";
import { clearQuizSession, loadQuizSession, QuizSessionPayload } from "@/lib/quizSession";
import ScoreRing from "@/components/ScoreRing";

export default function ResultsPage() {
  const router = useRouter();
  const saved = useRef(false);
  const [session, setSession] = useState<QuizSessionPayload | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [bookmarkTick, setBookmarkTick] = useState(0);

  useEffect(() => {
    setSession(loadQuizSession());
    setHydrated(true);
  }, []);

  const { questions, outcomes, correctCount, total, percentage, passed, domainResults, evaluation, wrongIds } = useMemo(() => {
    const empty = {
      questions: [] as Question[],
      outcomes: [] as QuestionOutcome[],
      correctCount: 0,
      total: 0,
      percentage: 0,
      passed: false,
      domainResults: [] as DomainResult[],
      evaluation: null as ExamEvaluation | null,
      wrongIds: [] as number[],
    };
    if (!session) return empty;

    const qs = session.questionIds
      .map((id) => allQuestions.find((q) => q.id === id))
      .filter((q): q is Question => Boolean(q))
      // クイズ画面と同じ並びを再現する（idで決まる）。保存された回答indexは
      // 並び替え後の選択肢に対するものなので、ここで揃えないと採点がずれる。
      .map((q) => withShuffledOptions(q));
    const oc: QuestionOutcome[] = qs.map((q, i) => {
      const answeredIndex = session.answers[i] ?? null;
      return {
        id: q.id,
        answeredIndex,
        correctIndex: q.correctIndex,
        isCorrect: answeredIndex === q.correctIndex,
      };
    });
    const correct = oc.reduce((c, o) => c + (o.isCorrect ? 1 : 0), 0);
    const totalCount = qs.length;
    const wrong = oc.filter((o) => !o.isCorrect).map((o) => o.id);

    // 本番試験モードは試験種別ごとの合格基準で判定する。
    if (session.mode === "exam" && session.examType) {
      const evalResult = gradeExam(session.examType, buildGradeItems(session.examType, qs, oc));
      return {
        questions: qs,
        outcomes: oc,
        correctCount: correct,
        total: totalCount,
        percentage: evalResult.percentage,
        passed: evalResult.passed,
        domainResults: evalResult.domainResults,
        evaluation: evalResult,
        wrongIds: wrong,
      };
    }

    // 練習モードは分野別正答率を参考表示し、汎用の合格ラインで判定する。
    // 知財3級は分野（IpField）別、ITパスポートはカテゴリ別に集計する。
    const pct = totalCount > 0 ? Math.round((correct / totalCount) * 100) : 0;
    const domainExam = session.examType ?? "it-passport";
    const buckets = new Map<string, { label: string; correct: number; total: number }>();
    qs.forEach((q, i) => {
      const d = questionDomain(domainExam, q);
      const b = buckets.get(d.key) ?? { label: d.label, correct: 0, total: 0 };
      b.total++;
      if (oc[i].isCorrect) b.correct++;
      buckets.set(d.key, b);
    });
    const domains: DomainResult[] = Array.from(buckets.entries()).map(([key, v]) => ({
      key,
      label: v.label,
      correct: v.correct,
      total: v.total,
      percentage: v.total > 0 ? Math.round((v.correct / v.total) * 100) : 0,
      passed: true,
    }));
    return {
      questions: qs,
      outcomes: oc,
      correctCount: correct,
      total: totalCount,
      percentage: pct,
      passed: pct >= PRACTICE_PASS_PERCENT,
      domainResults: domains,
      evaluation: null,
      wrongIds: wrong,
    };
  }, [session]);

  useEffect(() => {
    if (!session || saved.current || total === 0) return;
    saved.current = true;
    saveResult({
      id: Date.now().toString(),
      date: new Date().toISOString(),
      category: session.category,
      score: correctCount,
      total,
      percentage,
      timeSeconds: session.timeSeconds,
      passed,
      mode: session.mode,
      examType: session.examType,
      outcomes,
    });
    return () => {
      clearQuizSession();
    };
  }, [session, correctCount, total, percentage, passed, outcomes]);

  if (hydrated && !session) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 fade-in">
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6 text-center shadow-sm">
          <p className="text-lg font-medium mb-3">結果データが見つかりません。</p>
          <p className="text-sm text-[var(--muted)] mb-4">クイズを最初からやり直してください。</p>
          <button
            onClick={() => router.push("/")}
            className="rounded-xl bg-[var(--primary)] px-5 py-3 font-medium text-white transition-colors hover:bg-[var(--primary-hover)]"
          >
            ホームに戻る
          </button>
        </div>
      </div>
    );
  }

  if (!session) return null;

  const minutes = Math.floor(session.timeSeconds / 60);
  const seconds = session.timeSeconds % 60;
  // 分野別合格基準は本番試験モードだけに適用する（練習では参考表示にとどめる）。
  const examRule = session.mode === "exam" && session.examType ? examRules[session.examType] : null;
  const domainThreshold = examRule?.domainPassPercent;

  const categoryLabel = session.mode === "exam" && session.examType
    ? examLabels[session.examType]
    : session.source === "wrong"
      ? "間違えた問題のみ"
      : session.source === "bookmarks"
        ? "ブックマーク"
        : session.examType === "chizai"
          ? session.field && session.field !== "all"
            ? `知財3級 · ${ipFieldLabels[session.field as IpField] ?? session.field}`
            : "知財3級 全分野"
          : session.category === "all"
            ? "全分野"
            : categoryLabels[session.category as Category] || session.category;

  const encouragement = percentage === 100
    ? "パーフェクト！素晴らしい！🎉"
    : percentage >= 80
      ? "とても良い成績です！💪"
      : passed
        ? "合格ライン達成！この調子で頑張りましょう！"
        : percentage >= 40
          ? "もう少しで合格ラインです。復習して再挑戦しましょう！"
          : "基礎からしっかり復習しましょう。学習モードがおすすめです。";

  const handleToggleBookmark = (id: number) => {
    toggleBookmark(id);
    setBookmarkTick((t) => t + 1);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 fade-in">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">テスト結果</h1>
        <p className="text-[var(--muted)]">
          {categoryLabel}
          {session.mode === "exam" ? " · 本番試験モード" : ""}
        </p>
      </div>

      <div className="bg-[var(--card)] rounded-xl border border-[var(--card-border)] p-8 mb-6 text-center shadow-sm">
        <ScoreRing percentage={percentage} passed={passed} />
        <p className="text-lg mb-1 mt-4">
          {correctCount} / {total} 問正解
        </p>
        <p className="text-sm text-[var(--muted)] mb-4">
          所要時間: {minutes}分{seconds}秒
        </p>
        <span
          className={`inline-block px-4 py-2 rounded-full text-white font-medium ${passed ? "bg-[var(--success)]" : "bg-[var(--danger)]"}`}
        >
          {encouragement}
        </span>
      </div>

      {evaluation && examRule && (
        <div
          className={`rounded-xl border p-5 mb-6 shadow-sm ${passed ? "border-[var(--success-border)] bg-[var(--success-bg)]" : "border-[var(--danger-border)] bg-[var(--danger-bg)]"}`}
        >
          <p className="font-semibold mb-1">
            {passed ? "✅ 合格基準を満たしています" : "⚠ 合格基準に届きませんでした"}
          </p>
          <p className="text-sm leading-relaxed text-[var(--muted)]">{examRule.criteriaNote}</p>
          {!passed && evaluation.failReasons.length > 0 && (
            <ul className="mt-2 list-disc space-y-0.5 pl-5 text-sm">
              {evaluation.failReasons.map((reason, i) => (
                <li key={i}>{reason}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {domainResults.length > 1 && (
        <div className="bg-[var(--card)] rounded-xl border border-[var(--card-border)] p-6 mb-6 shadow-sm">
          <h2 className="font-semibold mb-4">
            分野別正答率
            {domainThreshold !== undefined && (
              <span className="ml-2 text-xs font-normal text-[var(--muted)]">（各分野{domainThreshold}%以上が必要）</span>
            )}
          </h2>
          <div className="space-y-3">
            {domainResults.map((d) => {
              const barColor = domainThreshold !== undefined
                ? d.passed
                  ? "bg-[var(--success)]"
                  : "bg-[var(--danger)]"
                : "bg-[var(--primary)]";
              return (
                <div key={d.key}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>
                      {domainThreshold !== undefined && (
                        <span className="mr-1">{d.passed ? "⭕" : "❌"}</span>
                      )}
                      {d.label}
                    </span>
                    <span>
                      {d.correct}/{d.total} ({d.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[var(--progress-bg)] rounded-full">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${barColor}`}
                      style={{ width: `${d.percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="bg-[var(--card)] rounded-xl border border-[var(--card-border)] p-6 mb-6 shadow-sm">
        <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
          <h2 className="font-semibold">回答一覧</h2>
          {wrongIds.length > 0 && (
            <Link
              href="/quiz?source=wrong"
              className="text-xs font-medium text-[var(--primary)] hover:underline"
            >
              間違えた{wrongIds.length}問だけ復習 →
            </Link>
          )}
        </div>
        <div className="space-y-3">
          {questions.map((q, i) => {
            const outcome = outcomes[i];
            const correct = outcome.isCorrect;
            void bookmarkTick;
            const starred = isBookmarked(q.id);
            return (
              <div
                key={q.id}
                className={`p-3 rounded-lg border ${correct ? "border-[var(--success-border)] bg-[var(--success-bg)]" : "border-[var(--danger-border)] bg-[var(--danger-bg)]"}`}
              >
                <div className="flex items-start gap-2">
                  <span className="mt-0.5">{correct ? "⭕" : "❌"}</span>
                  <div className="flex-1 text-sm">
                    <p className="font-medium mb-1">
                      問{i + 1}: {q.question}
                    </p>
                    {!correct && (
                      <p className="text-[var(--muted)]">
                        正解: {q.options[q.correctIndex]}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleBookmark(q.id)}
                    className={`shrink-0 rounded-full border px-2 py-1 text-xs transition-colors ${starred ? "border-amber-400 bg-amber-100 text-amber-900 dark:border-amber-300/40 dark:bg-amber-400/20 dark:text-amber-100" : "border-[var(--card-border)] text-[var(--muted)] hover:border-amber-400"}`}
                    aria-label={starred ? "ブックマークを外す" : "ブックマークに追加"}
                  >
                    {starred ? "★" : "☆"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          onClick={() => {
            const params = new URLSearchParams();
            if (session.mode === "exam") {
              params.set("mode", "exam");
              params.set("exam", session.examType ?? "it-passport");
            } else if (session.source !== "category") {
              params.set("source", session.source);
            } else if (session.examType === "chizai") {
              params.set("exam", "chizai");
              params.set("field", session.field ?? "all");
            } else {
              params.set("category", session.category);
            }
            router.push(`/quiz?${params.toString()}`);
          }}
          className="flex-1 py-3 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-medium rounded-xl transition-colors"
        >
          もう一度挑戦
        </button>
        <button
          onClick={() => router.push("/")}
          className="flex-1 py-3 bg-[var(--secondary-btn-bg)] hover:bg-[var(--secondary-btn-hover)] font-medium rounded-xl transition-colors"
        >
          ホームに戻る
        </button>
      </div>
    </div>
  );
}
