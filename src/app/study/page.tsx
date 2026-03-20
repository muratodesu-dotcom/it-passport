"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, Suspense, useMemo, useRef } from "react";
import { getQuestionsByCategory } from "@/data/questions";
import { categoryLabels, Category } from "@/lib/types";
import LoadingSpinner from "@/components/LoadingSpinner";

type FeedItem = {
  feedId: string;
  questionIndex: number;
};

type ExamTipSection = {
  title: string;
  points: string[];
};

type LessonSection = {
  title: string;
  summary: string;
  bullets: string[];
};

type LessonHighlight = {
  label: string;
  value: string;
};

type QuickCheck = {
  prompt: string;
  answer: string;
};

type CategoryLesson = {
  overview: string;
  highlights: LessonHighlight[];
  sections: LessonSection[];
  quickChecks: QuickCheck[];
};

const examTipMap: Record<Category, ExamTipSection[]> = {
  strategy: [
    {
      title: "頻出キーワードのつながり",
      points: [
        "SWOT・PPM・BSC・PDCAは『経営分析→戦略立案→評価→改善』の流れで整理すると覚えやすいです。",
        "CRMは顧客との関係強化、SCMは供給の全体最適化、経営理念は企業の存在意義と目的、という役割の違いを区別しましょう。",
        "著作権・個人情報保護法は『何が保護対象か』『何が対象外か』を対比で覚えるとひっかけに強くなります。",
      ],
    },
    {
      title: "本番での見抜き方",
      points: [
        "選択肢に『短期的な売上目標』『給与体系』のような限定的な説明が出たら、経営理念や戦略概念ではない可能性が高いです。",
        "法務問題は用語の定義を問うことが多いため、『個人』『法人』『著作物そのもの』など主語に注目すると正答しやすくなります。",
      ],
    },
  ],
  management: [
    {
      title: "工程と管理手法の整理",
      points: [
        "WBSは作業分解、ガントチャートは進捗の見える化、SLAは品質水準の合意、というように『何を管理するものか』で覚えましょう。",
        "V字モデルは上流工程と対応するテスト工程をセットで暗記すると得点源になります。",
        "インシデント管理と問題管理は混同しやすいので、『まず復旧、次に原因究明』の順で整理するのがコツです。",
      ],
    },
    {
      title: "迷いやすい論点",
      points: [
        "ISO/IEC 27001、ISO/IEC 20000、ISO 9001は用途の違いを表で比較する感覚で覚えると混乱しません。",
        "見積もり問題では『機能で測るのか』『コード量で測るのか』を判別すると正解を選びやすくなります。",
      ],
    },
  ],
  technology: [
    {
      title: "テクノロジ系の得点パターン",
      points: [
        "計算・ネットワーク・セキュリティは頻出です。公式や仕組みを丸暗記するだけでなく、『なぜそうなるか』を1行で説明できる状態を目指しましょう。",
        "CPU、メモリ、OS、データベース、ネットワーク機器は『役割の違い』を整理すると選択肢の消去がしやすくなります。",
        "セキュリティは攻撃手法・対策・認証方式をセットで覚えると応用問題にも対応しやすいです。",
      ],
    },
    {
      title: "計算問題の対策",
      points: [
        "2進数変換、論理演算、稼働率、転送速度は途中式を紙に残す習慣をつけるとケアレスミスを減らせます。",
        "単位は bit と byte、k と K、Mbps と MB/s を取り違えないことが重要です。",
      ],
    },
  ],
};

const lessonMap: Record<Category, CategoryLesson> = {
  strategy: {
    overview:
      "ストラテジ系は『会社が何を目指し、どう競争し、どのルールに従うか』を整理する分野です。用語だけを暗記するより、経営判断の流れに沿って並べると定着しやすくなります。",
    highlights: [
      { label: "軸", value: "経営・戦略・法務を1本の流れで理解" },
      { label: "頻出", value: "SWOT / PPM / CRM / SCM / 著作権 / 個人情報" },
      { label: "解き方", value: "目的・対象・主語の違いで選択肢を切る" },
    ],
    sections: [
      {
        title: "1. 経営戦略の基本線を作る",
        summary: "まずは企業の全体像をつかみます。",
        bullets: [
          "経営理念は企業の存在意義、経営戦略はその実現方法、売上目標はその途中の数値指標です。",
          "SWOTでは内部要因の強み・弱みと、外部要因の機会・脅威を分けて考えます。",
          "PPMは『成長率』と『市場占有率』で事業の立ち位置を判断します。",
        ],
      },
      {
        title: "2. 業務全体を最適化する視点を持つ",
        summary: "企業活動のどこを改善する用語なのかを区別します。",
        bullets: [
          "CRMは顧客との関係強化、SCMは調達から販売までの全体最適です。",
          "BSCは財務だけでなく顧客・業務プロセス・学習と成長も評価対象に含めます。",
          "PDCAは改善の循環なので、単なる実行手順ではなく『評価と改善』が重要です。",
        ],
      },
      {
        title: "3. 法務は保護対象を対比で覚える",
        summary: "似ている言葉ほど『何が守られるのか』を明確にします。",
        bullets: [
          "個人情報は生存する個人を識別できる情報で、法人情報そのものは含みません。",
          "著作権は表現を保護しますが、アルゴリズムやプログラム言語そのものは保護対象外です。",
          "法務問題では主語と対象を丁寧に読むだけで正答率が上がります。",
        ],
      },
    ],
    quickChecks: [
      { prompt: "CRMとSCMの違いを一言で言うと？", answer: "CRMは顧客関係、SCMは供給連鎖の最適化です。" },
      { prompt: "SWOTのOとTは何を表す？", answer: "Opportunity（機会）とThreat（脅威）です。" },
      { prompt: "著作権が守るのはアイデアか表現か？", answer: "表現です。" },
    ],
  },
  management: {
    overview:
      "マネジメント系は『どう進め、どう品質を守り、どう運用するか』を扱う分野です。工程・役割・目的を結び付けると、似た用語の混同を防げます。",
    highlights: [
      { label: "軸", value: "開発工程・運用管理・品質保証の対応関係" },
      { label: "頻出", value: "WBS / V字モデル / ITIL / SLA / ISO規格" },
      { label: "解き方", value: "何を管理し、誰と合意し、どこで使うかで判別" },
    ],
    sections: [
      {
        title: "1. 工程ごとの役割を切り分ける",
        summary: "管理手法は『何を見える化するか』で覚えます。",
        bullets: [
          "WBSは作業の分解、ガントチャートは日程と進捗の可視化です。",
          "V字モデルは上流工程とテスト工程が対応していることがポイントです。",
          "アジャイルは短い反復で価値を出す考え方で、要件固定型とは逆です。",
        ],
      },
      {
        title: "2. サービス管理は目的の違いで区別する",
        summary: "似た管理プロセスでも優先事項が異なります。",
        bullets: [
          "インシデント管理は素早い復旧、問題管理は根本原因の究明です。",
          "SLAはサービス提供者と利用者の品質合意であり、内部向け工程表ではありません。",
          "システム監査は独立した立場で信頼性・安全性・効率性を評価します。",
        ],
      },
      {
        title: "3. 規格と見積もりはセットで整理する",
        summary: "番号暗記ではなく、用途と対象で覚えます。",
        bullets: [
          "ISO/IEC 27001はISMS、ISO/IEC 20000はITサービス、ISO 9001は品質です。",
          "ファンクションポイント法は機能数から規模を見積もり、LOC法はコード量を基準にします。",
          "共通フレームの計画段階では、開発前に業務分析やシステム化方針を固めます。",
        ],
      },
    ],
    quickChecks: [
      { prompt: "インシデント管理の最優先は？", answer: "サービスの迅速な復旧です。" },
      { prompt: "外部設計に対応するテストは？", answer: "結合テストです。" },
      { prompt: "ISO/IEC 27001は何の規格？", answer: "情報セキュリティマネジメントシステムの規格です。" },
    ],
  },
  technology: {
    overview:
      "テクノロジ系は『計算の基礎』『コンピュータの構成』『ネットワークとセキュリティ』を横断する分野です。公式暗記よりも、仕組みを短く説明できる状態を目指すと強くなります。",
    highlights: [
      { label: "軸", value: "基礎理論→システム構成→通信・安全対策" },
      { label: "頻出", value: "2進数 / CPU / OS / DB / ネットワーク / 暗号" },
      { label: "解き方", value: "役割・単位・処理順序を明確にして消去法" },
    ],
    sections: [
      {
        title: "1. 計算分野は途中式で勝つ",
        summary: "数字に強くなるだけで安定して点が取れます。",
        bullets: [
          "2進数や論理演算は、桁ごとに丁寧に書き出すとミスが減ります。",
          "性能や転送速度は、bitとbyte、秒と分など単位変換を先に確認します。",
          "稼働率・処理時間は、式の意味を理解していれば応用問題にも対応できます。",
        ],
      },
      {
        title: "2. コンピュータの役割分担を整理する",
        summary: "装置やソフトウェアの違いを一問一答で言えるようにします。",
        bullets: [
          "CPUは演算と制御、メモリは一時記憶、補助記憶装置は長期保存です。",
          "OSはハードウェア資源の管理、DBMSはデータの効率的な管理を担います。",
          "アプリケーション層とOS層の役割差を押さえると、選択肢の見分けが速くなります。",
        ],
      },
      {
        title: "3. セキュリティは攻撃と対策を対で覚える",
        summary: "単語単体ではなく、防御の意図まで理解します。",
        bullets: [
          "マルウェア、フィッシング、DoSなどは被害の出方の違いで区別します。",
          "認証・暗号・アクセス制御は、どの脅威に効くかまで考えると忘れにくいです。",
          "ネットワーク機器やプロトコルは、接続経路のどこで働くかを意識すると整理できます。",
        ],
      },
    ],
    quickChecks: [
      { prompt: "CPUと主記憶の役割の違いは？", answer: "CPUは処理、主記憶は作業中データの一時保存です。" },
      { prompt: "MbpsとMB/sは同じ単位？", answer: "違います。bitとbyteで8倍の差があります。" },
      { prompt: "セキュリティ対策は何とセットで覚える？", answer: "対応する攻撃手法や脅威とセットです。" },
    ],
  },
};

const commonExamTips = [
  "ITパスポート本番は『知っているか』より『似た用語を区別できるか』が問われやすいため、正解と不正解の差分を意識して復習しましょう。",
  "1問に時間をかけすぎず、迷ったら消去法で仮置きし、最後に戻るのが得点を落としにくい進め方です。",
  "学習モードで理解→クイズモードで瞬発力確認→履歴で弱点洗い出し、の3段階で回すと定着しやすいです。",
];

function StudyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const category = searchParams.get("category") || "strategy";

  const questions = useMemo(() => getQuestionsByCategory(category), [category]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [doomScrollMode, setDoomScrollMode] = useState(false);
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [revealedFeedItems, setRevealedFeedItems] = useState<number[]>([]);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  const question = questions[currentIndex];
  const categoryKey = (category as Category) in categoryLabels ? (category as Category) : "strategy";
  const categoryLabel = categoryLabels[categoryKey] || category;
  const studiedCount = showAnswer ? currentIndex + 1 : currentIndex;
  const mastery = questions.length > 0 ? Math.round((studiedCount / questions.length) * 100) : 0;
  const categoryExamTips = examTipMap[categoryKey] || [];
  const categoryLesson = lessonMap[categoryKey];

  useEffect(() => {
    setCurrentIndex(0);
    setShowAnswer(false);
    setFeedItems(
      questions.slice(0, Math.min(4, questions.length)).map((_, index) => ({
        feedId: `${category}-${index}`,
        questionIndex: index,
      }))
    );
    setRevealedFeedItems([]);
  }, [category, questions]);

  useEffect(() => {
    if (!doomScrollMode) return;

    const node = loaderRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];
        if (!firstEntry?.isIntersecting) return;

        setFeedItems((prev) => {
          if (prev.length >= questions.length) return prev;
          const nextIndex = prev.length;
          return [
            ...prev,
            {
              feedId: `${category}-${nextIndex}`,
              questionIndex: nextIndex,
            },
          ];
        });
      },
      { rootMargin: "320px 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [doomScrollMode, category, questions.length]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (doomScrollMode) return;
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        if (!showAnswer) {
          setShowAnswer(true);
        }
      }
      if (e.key === "ArrowRight" && showAnswer && currentIndex < questions.length - 1) {
        setCurrentIndex((i) => i + 1);
        setShowAnswer(false);
      }
      if (e.key === "ArrowLeft" && showAnswer && currentIndex > 0) {
        setCurrentIndex((i) => i - 1);
        setShowAnswer(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [doomScrollMode, showAnswer, currentIndex, questions.length]);

  if (!question) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-lg">問題が見つかりません</p>
        <button
          onClick={() => router.push("/")}
          className="text-[var(--primary)] hover:underline"
        >
          ホームに戻る
        </button>
      </div>
    );
  }

  const focusTips = [
    `${categoryLabel}は全${questions.length}問。短時間の周回で定着しやすい構成です。`,
    "答えを見る前に、なぜその選択肢が正しいかを1文で説明すると記憶に残りやすくなります。",
    "不安な問題は後でクイズモードでもう一度解き、瞬発力を確認しましょう。",
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8 rounded-3xl border border-[var(--card-border)] bg-[var(--card)] p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <button
              onClick={() => router.push("/")}
              className="mb-4 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
            >
              ← 戻る
            </button>
            <p className="text-sm font-medium text-[var(--primary)] mb-2">
              学習モード - {categoryLabel}
            </p>
            <h1 className="text-3xl font-bold mb-3">一問ずつでも、ひたすら流し見でも。</h1>
            <p className="text-[var(--muted)] max-w-2xl leading-relaxed">
              通常モードは集中して1問ずつ確認、Doom Scrollモードは次々にカードをめくりながら連続復習できます。
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 min-w-full lg:min-w-[320px] lg:max-w-[360px]">
            <div className="rounded-2xl bg-[var(--badge-bg)] p-4">
              <p className="text-xs text-[var(--muted)] mb-1">進捗</p>
              <p className="text-2xl font-bold">{mastery}%</p>
            </div>
            <div className="rounded-2xl bg-[var(--badge-bg)] p-4">
              <p className="text-xs text-[var(--muted)] mb-1">見た問題</p>
              <p className="text-2xl font-bold">{studiedCount}</p>
            </div>
            <div className="rounded-2xl bg-[var(--badge-bg)] p-4 col-span-2">
              <div className="flex items-center justify-between mb-2 text-xs text-[var(--muted)]">
                <span>学習トラック</span>
                <span>{studiedCount} / {questions.length}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-[var(--progress-bg)] overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-cyan-500 to-blue-500 transition-all duration-500"
                  style={{ width: `${mastery}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            onClick={() => setDoomScrollMode(false)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${!doomScrollMode ? "bg-[var(--primary)] text-white" : "bg-[var(--secondary-btn-bg)] hover:bg-[var(--secondary-btn-hover)]"}`}
          >
            集中モード
          </button>
          <button
            onClick={() => setDoomScrollMode(true)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${doomScrollMode ? "bg-[var(--accent)] text-white" : "bg-[var(--secondary-btn-bg)] hover:bg-[var(--secondary-btn-hover)]"}`}
          >
            Doom Scrollモード ∞
          </button>
          <span className="text-xs text-[var(--muted)]">
            {doomScrollMode ? "下へスクロールすると問題が自動追加されます。" : "Space / Enter で答え表示、← → で移動できます。"}
          </span>
        </div>
      </div>

      <div className="mb-8 rounded-3xl border border-sky-200/70 bg-sky-50/80 p-6 shadow-sm dark:border-sky-400/20 dark:bg-sky-400/10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-sky-700 dark:text-sky-200">レッスンを拡張しました</p>
            <h2 className="mt-2 text-2xl font-bold">{categoryLabel}の全体像を先に理解する</h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[var(--muted)]">
              {categoryLesson.overview}
            </p>
          </div>
          <div className="rounded-2xl bg-white/70 px-4 py-3 text-sm shadow-sm dark:bg-black/10">
            <p className="text-xs text-[var(--muted)]">おすすめ順</p>
            <p className="mt-1 font-medium">全体像 → 問題演習 → クイック確認</p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {categoryLesson.highlights.map((highlight) => (
            <div key={highlight.label} className="rounded-2xl border border-sky-200/80 bg-white/80 p-4 dark:border-sky-400/20 dark:bg-black/10">
              <p className="text-xs text-[var(--muted)]">{highlight.label}</p>
              <p className="mt-2 text-sm font-semibold leading-relaxed">{highlight.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          {categoryLesson.sections.map((section) => (
            <section
              key={section.title}
              className="rounded-2xl border border-sky-200/70 bg-white/80 p-5 dark:border-sky-400/20 dark:bg-black/10"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-sky-700 dark:text-sky-200">Lesson</p>
              <h3 className="mt-2 font-semibold">{section.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{section.summary}</p>
              <ul className="mt-4 space-y-2 text-sm leading-relaxed text-[var(--muted)]">
                {section.bullets.map((bullet) => (
                  <li key={bullet} className="flex gap-2">
                    <span className="mt-0.5">•</span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>

      <div className="mb-8 rounded-3xl border border-amber-200/70 bg-amber-50/70 p-6 shadow-sm dark:border-amber-400/20 dark:bg-amber-400/10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-amber-700 dark:text-amber-200">試験で点を取りやすくするコツ</p>
            <h2 className="mt-2 text-2xl font-bold">{categoryLabel}の頻出論点を先に整理</h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[var(--muted)]">
              問題をただ読むだけでなく、出題パターン・間違えやすい語句・本番での判断軸も合わせて確認できるようにしました。
            </p>
          </div>
          <div className="rounded-2xl bg-white/70 px-4 py-3 text-sm shadow-sm dark:bg-black/10">
            <p className="text-xs text-[var(--muted)]">おすすめの使い方</p>
            <p className="mt-1 font-medium">要点確認 → 各問題の解説 → クイズで再確認</p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {categoryExamTips.map((section) => (
            <section
              key={section.title}
              className="rounded-2xl border border-amber-200/70 bg-white/80 p-5 dark:border-amber-400/20 dark:bg-black/10"
            >
              <h3 className="font-semibold">{section.title}</h3>
              <ul className="mt-3 space-y-2 text-sm leading-relaxed text-[var(--muted)]">
                {section.points.map((point) => (
                  <li key={point} className="flex gap-2">
                    <span className="mt-0.5">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>

      <div className="mb-8 rounded-3xl border border-[var(--card-border)] bg-[var(--card)] p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-[var(--primary)]">クイック確認</p>
            <h2 className="mt-2 text-2xl font-bold">3問だけ口頭で答えてから先に進む</h2>
          </div>
          <p className="max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
            画面を読むだけで終わらせず、短くでも自分の言葉で説明すると理解が定着しやすくなります。
          </p>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {categoryLesson.quickChecks.map((check) => (
            <section key={check.prompt} className="rounded-2xl border border-[var(--card-border)] bg-[var(--background)] p-4">
              <p className="text-xs font-semibold text-[var(--muted)]">Q</p>
              <p className="mt-2 font-medium leading-relaxed">{check.prompt}</p>
              <p className="mt-4 text-xs font-semibold text-[var(--muted)]">答えの軸</p>
              <p className="mt-1 text-sm leading-relaxed text-[var(--muted)]">{check.answer}</p>
            </section>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          {!doomScrollMode ? (
            <>
              <div className="w-full h-2 bg-[var(--progress-bg)] rounded-full mb-8">
                <div
                  className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-500"
                  style={{
                    width: `${((currentIndex + 1) / questions.length) * 100}%`,
                  }}
                />
              </div>

              <div className="bg-[var(--card)] rounded-xl border border-[var(--card-border)] p-6 mb-6 shadow-sm fade-in" key={currentIndex}>
                <span className="text-xs px-2 py-1 rounded-full bg-[var(--badge-bg)] text-[var(--muted)]">
                  問{currentIndex + 1}
                </span>
                <p className="text-lg font-medium leading-relaxed mt-4">
                  {question.question}
                </p>
              </div>

              <div className="space-y-3 mb-6">
                {question.options.map((option, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-xl border-2 transition-all bg-[var(--card)] ${
                      showAnswer && index === question.correctIndex
                        ? "border-[var(--success)] bg-[var(--success-bg)]"
                        : showAnswer
                          ? "border-[var(--card-border)] opacity-50"
                          : "border-[var(--card-border)]"
                    }`}
                  >
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[var(--badge-bg)] text-sm font-medium mr-3">
                      {String.fromCharCode(65 + index)}
                    </span>
                    {option}
                  </div>
                ))}
              </div>

              {!showAnswer ? (
                <div>
                  <button
                    onClick={() => setShowAnswer(true)}
                    className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl transition-colors mb-2"
                  >
                    答えと解説を見る
                  </button>
                  <p className="text-center text-xs text-[var(--muted)] opacity-60">
                    キーボード: Space / Enterで表示
                  </p>
                </div>
              ) : (
                <>
                  <div className="bg-[var(--explanation-bg)] border border-[var(--explanation-border)] rounded-xl p-5 mb-4 fade-in">
                    <p className="font-bold mb-2 text-[var(--explanation-title)]">
                      正解: {String.fromCharCode(65 + question.correctIndex)}.{" "}
                      {question.options[question.correctIndex]}
                    </p>
                    <p className="text-sm leading-relaxed text-[var(--explanation-text)]">
                      {question.explanation}
                    </p>
                  </div>

                  <div className="mb-6 rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
                    <p className="text-sm font-semibold">試験での確認ポイント</p>
                    <ul className="mt-3 space-y-2 text-sm leading-relaxed text-[var(--muted)]">
                      <li className="flex gap-2">
                        <span className="mt-0.5">✓</span>
                        <span>正解の根拠を10秒以内で言い換えられるか確認しましょう。</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="mt-0.5">✓</span>
                        <span>誤答の選択肢がなぜ違うかも1つだけ説明できると、類題に強くなります。</span>
                      </li>
                    </ul>
                  </div>

                  <div className="flex gap-3">
                    {currentIndex > 0 && (
                      <button
                        onClick={() => {
                          setCurrentIndex((i) => i - 1);
                          setShowAnswer(false);
                        }}
                        className="flex-1 py-3 bg-[var(--secondary-btn-bg)] hover:bg-[var(--secondary-btn-hover)] font-medium rounded-xl transition-colors"
                      >
                        ← 前の問題
                      </button>
                    )}
                    {currentIndex < questions.length - 1 ? (
                      <button
                        onClick={() => {
                          setCurrentIndex((i) => i + 1);
                          setShowAnswer(false);
                        }}
                        className="flex-1 py-3 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-medium rounded-xl transition-colors"
                      >
                        次の問題 →
                      </button>
                    ) : (
                      <button
                        onClick={() => router.push("/")}
                        className="flex-1 py-3 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-medium rounded-xl transition-colors"
                      >
                        ホームに戻る
                      </button>
                    )}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="space-y-4">
              {feedItems.map((item, feedPosition) => {
                const feedQuestion = questions[item.questionIndex];
                const revealed = revealedFeedItems.includes(feedQuestion.id);

                return (
                  <article
                    key={item.feedId}
                    className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-5 shadow-sm slide-in"
                  >
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs text-[var(--muted)] mb-1">
                          {categoryLabel} / フィード {feedPosition + 1}
                        </p>
                        <h2 className="font-semibold text-lg">{feedQuestion.question}</h2>
                      </div>
                      <span className="rounded-full bg-[var(--badge-bg)] px-3 py-1 text-xs text-[var(--muted)]">
                        問{item.questionIndex + 1}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {feedQuestion.options.map((option, optionIndex) => {
                        const isCorrect = optionIndex === feedQuestion.correctIndex;
                        return (
                          <div
                            key={`${item.feedId}-${optionIndex}`}
                            className={`rounded-xl border p-4 transition-all ${revealed && isCorrect ? "border-[var(--success)] bg-[var(--success-bg)]" : "border-[var(--card-border)]"}`}
                          >
                            <span className="mr-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-[var(--badge-bg)] text-sm font-medium">
                              {String.fromCharCode(65 + optionIndex)}
                            </span>
                            {option}
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-4 rounded-xl bg-[var(--badge-bg)] p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold">{revealed ? "答えを表示中" : "まだ答えは隠れています"}</p>
                          <p className="text-xs text-[var(--muted)] mt-1">
                            {revealed ? `正解は ${String.fromCharCode(65 + feedQuestion.correctIndex)} です。` : "スクロールの勢いに飲まれず、まず自分で考えてみましょう。"}
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            setRevealedFeedItems((prev) =>
                              revealed ? prev.filter((id) => id !== feedQuestion.id) : [...prev, feedQuestion.id]
                            )
                          }
                          className="rounded-full bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary-hover)] transition-colors"
                        >
                          {revealed ? "答えを閉じる" : "答えを見る"}
                        </button>
                      </div>

                      {revealed && (
                        <div className="fade-in">
                          <p className="mt-3 text-sm leading-relaxed text-[var(--explanation-text)]">
                            {feedQuestion.explanation}
                          </p>
                          <p className="mt-2 text-xs leading-relaxed text-[var(--muted)]">
                            本番では、正解の理由だけでなく他の選択肢との違いも一緒に確認すると記憶が安定します。
                          </p>
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}

              <div ref={loaderRef} className="rounded-2xl border border-dashed border-[var(--card-border)] p-5 text-center text-sm text-[var(--muted)]">
                {feedItems.length < questions.length
                  ? "さらに下へスクロールすると次の問題が流れてきます…"
                  : "ここまでで全問題を読み切りました。上に戻って復習してもOKです。"}
              </div>
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-5 shadow-sm">
            <h2 className="font-semibold mb-3">学習を濃くするヒント</h2>
            <ul className="space-y-3 text-sm text-[var(--muted)] leading-relaxed">
              {focusTips.map((tip) => (
                <li key={tip} className="flex gap-2">
                  <span className="mt-0.5 text-base">✨</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-5 shadow-sm">
            <h2 className="font-semibold mb-3">本番向けチェックリスト</h2>
            <ul className="space-y-3 text-sm text-[var(--muted)] leading-relaxed">
              {commonExamTips.map((tip) => (
                <li key={tip} className="flex gap-2">
                  <span className="mt-0.5 text-base">📝</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-5 shadow-sm">
            <h2 className="font-semibold mb-3">次のアクション</h2>
            <div className="space-y-3">
              <button
                onClick={() => router.push(`/quiz?category=${category}`)}
                className="w-full rounded-xl bg-[var(--primary)] px-4 py-3 font-medium text-white transition-colors hover:bg-[var(--primary-hover)]"
              >
                この分野でクイズに挑戦
              </button>
              <button
                onClick={() => router.push("/history")}
                className="w-full rounded-xl bg-[var(--secondary-btn-bg)] px-4 py-3 font-medium transition-colors hover:bg-[var(--secondary-btn-hover)]"
              >
                学習履歴を確認
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default function StudyPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <StudyContent />
    </Suspense>
  );
}
