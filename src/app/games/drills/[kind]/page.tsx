"use client";

import { Suspense, useCallback, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getTermsByExam, TermPair } from "@/data/terms";
import { examShortLabels } from "@/lib/types";
import { FieldId, fieldOptions, itemField, parseExam } from "@/lib/examFields";
import {
  DrillKind,
  DrillQuestion,
  drillMap,
  genDefToTerm,
  genEnJp,
  genOddOneOut,
  genTermToDef,
  genTrueFalse,
  prepareCurated,
} from "@/lib/drills";
import { chizaiDrillMap, curatedQuestionSets, flowSets } from "@/data/chizaiDrills";
import { addMissedTerms, getMissedTerms, removeMissedTerms } from "@/lib/history";
import DrillRunner from "@/components/DrillRunner";
import OrderRunner from "@/components/OrderRunner";

const DRILL_COUNT = 10;

function buildQuestions(kind: DrillKind, exam: ReturnType<typeof parseExam>, field: FieldId, allTerms: TermPair[]): DrillQuestion[] {
  if (kind === "odd") {
    const groups = fieldOptions(exam)
      .filter((o) => o.id !== "all")
      .map((o) => ({ key: o.id, label: o.label, terms: allTerms.filter((t) => itemField(exam, t) === o.id) }));
    return genOddOneOut(groups, DRILL_COUNT);
  }

  if (curatedQuestionSets[kind]) {
    return prepareCurated(curatedQuestionSets[kind], DRILL_COUNT);
  }

  let pool = allTerms;
  if (kind === "review") {
    const missed = new Set(getMissedTerms());
    pool = allTerms.filter((t) => missed.has(t.term));
  } else if (field !== "all") {
    pool = allTerms.filter((t) => itemField(exam, t) === field);
  }

  switch (kind) {
    case "term-def":
    case "review":
      return genTermToDef(pool, DRILL_COUNT);
    case "cloze":
      return genDefToTerm(pool, DRILL_COUNT);
    case "en-jp":
      return genEnJp(pool, DRILL_COUNT);
    case "truefalse":
      return genTrueFalse(pool, DRILL_COUNT);
    default:
      return [];
  }
}

function DrillContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const kind = (Array.isArray(params.kind) ? params.kind[0] : params.kind) as DrillKind;
  const exam = parseExam(searchParams.get("exam"));
  const def = drillMap[kind] ?? chizaiDrillMap[kind];

  const [field, setField] = useState<FieldId>("all");
  const [questions, setQuestions] = useState<DrillQuestion[]>([]);
  const [playing, setPlaying] = useState(false);
  const [nonce, setNonce] = useState(0);

  const allTerms = useMemo(() => getTermsByExam(exam), [exam]);

  const start = useCallback(() => {
    setQuestions(buildQuestions(kind, exam, field, allTerms));
    setPlaying(true);
  }, [kind, exam, field, allTerms]);

  const regenerate = useCallback(() => {
    setQuestions(buildQuestions(kind, exam, field, allTerms));
    setNonce((n) => n + 1);
  }, [kind, exam, field, allTerms]);

  const handleComplete = useCallback(
    (result: { correct: string[]; wrong: string[] }) => {
      addMissedTerms(result.wrong);
      if (kind === "review") removeMissedTerms(result.correct);
    },
    [kind]
  );

  if (!def) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <p className="mb-4">ドリルが見つかりません。</p>
        <Link href="/games" className="text-[var(--primary)] hover:underline">ゲーム一覧へ</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/games" className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">&larr; ゲーム一覧</Link>
      </div>

      <div className="mb-2 flex items-center gap-2">
        <h1 className="text-2xl font-bold">{def.title}</h1>
        <span className="rounded-full bg-[var(--badge-bg)] px-2.5 py-0.5 text-xs font-medium text-[var(--primary)]">{examShortLabels[exam]}</span>
      </div>
      <p className="text-[var(--muted)] mb-6">{def.description}</p>

      {kind === "flow" && <OrderRunner sets={flowSets} />}

      {kind !== "flow" && def.usesField && (
        <div className="flex flex-wrap gap-2 mb-6">
          {fieldOptions(exam).map((opt) => (
            <button
              key={opt.id}
              onClick={() => { setField(opt.id); setPlaying(false); }}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                field === opt.id ? "bg-[var(--primary)] text-white" : "bg-[var(--badge-bg)] text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {kind !== "flow" && (!playing ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">{def.icon}</div>
          {def.source === "missed" && getMissedTerms().length === 0 ? (
            <p className="text-[var(--muted)] mb-6">
              まだ間違えた用語がありません。ほかのドリルに挑戦すると、ここに復習対象がたまります。
            </p>
          ) : (
            <p className="text-[var(--muted)] mb-6">キーボード(1〜)で素早く回答できます</p>
          )}
          <button
            onClick={start}
            disabled={def.source === "missed" && getMissedTerms().length === 0}
            className="rounded-xl bg-[var(--primary)] px-8 py-3 font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-[var(--primary-hover)] disabled:opacity-40"
          >
            スタート
          </button>
        </div>
      ) : (
        <DrillRunner key={nonce} questions={questions} onRestart={regenerate} onComplete={handleComplete} />
      ))}
    </div>
  );
}

export default function DrillPage() {
  return (
    <Suspense fallback={null}>
      <DrillContent />
    </Suspense>
  );
}
