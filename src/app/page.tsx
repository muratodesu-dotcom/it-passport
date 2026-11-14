import { questions } from "@/data/questions";
import { getTermsByExam } from "@/data/terms";
import { categoryLabels, devFieldLabels, ExamType, ipFieldLabels } from "@/lib/types";
import HomeTracks, { type QuestionMeta, type TrackData } from "@/components/HomeTracks";

// The home screen: track tabs, one "next step" card, the track's extra modes as
// tiles, and its fields with progress rings. Study / quiz / glossary / history
// live in the shared navigation (bottom bar on phones, header on computers).

const inExam = (exam: ExamType) => (q: (typeof questions)[number]) => (q.exams ?? ["it-passport"]).includes(exam);
const itQs = questions.filter(inExam("it-passport"));
const chizaiQs = questions.filter(inExam("chizai"));
const devQs = questions.filter(inExam("dev"));

const tracks: TrackData[] = [
  {
    id: "it-passport",
    label: "ITパスポート",
    icon: "📚",
    count: itQs.length,
    lang: "ja",
    allQuiz: { href: "/quiz?category=all", label: "全分野クイズ" },
    tiles: [
      { href: "/quiz?mode=exam&exam=it-passport", icon: "🎯", label: "本番試験", sub: "100問・120分", color: "#dc2626" },
      { href: "/games/drills/calc", icon: "🧮", label: "計算ドリル", sub: "2進数・稼働率", color: "#2563eb" },
      { href: "/games", icon: "🎮", label: "ゲーム", sub: "マッチングほか", color: "#7c3aed" },
      { href: "/scroll?exam=it-passport", icon: "🌀", label: "フィード", sub: "用語を流し読み", color: "#0891b2" },
    ],
    fields: (["strategy", "management", "technology"] as const).map((key) => ({
      key,
      label: categoryLabels[key],
      count: itQs.filter((q) => q.category === key).length,
      quiz: `/quiz?category=${key}`,
      study: `/study?category=${key}`,
    })),
  },
  {
    id: "chizai",
    label: "知財3級",
    icon: "⚖️",
    count: chizaiQs.length,
    lang: "ja",
    allQuiz: { href: "/quiz?mode=practice&exam=chizai&field=all", label: "全分野クイズ" },
    tiles: [
      { href: "/quiz?mode=exam&exam=chizai", icon: "🎯", label: "本番試験", sub: "30問・45分", color: "#dc2626" },
      { href: "/games/drills/duration?exam=chizai", icon: "⏳", label: "存続期間", sub: "期間ドリル", color: "#b45309" },
      { href: "/games", icon: "🎮", label: "ゲーム", sub: "マッチングほか", color: "#7c3aed" },
      { href: "/scroll?exam=chizai", icon: "🌀", label: "フィード", sub: "用語を流し読み", color: "#0891b2" },
    ],
    fields: (["patent", "design-trademark", "copyright", "other"] as const).map((key) => ({
      key,
      label: ipFieldLabels[key],
      count: chizaiQs.filter((q) => (q.ipField ?? "other") === key).length,
      quiz: `/quiz?mode=practice&exam=chizai&field=${key}`,
      study: `/study?exam=chizai&category=${key}`,
    })),
  },
  {
    id: "dev",
    label: "AI Engineer",
    icon: "🧑‍💻",
    count: devQs.length,
    lang: "en",
    allQuiz: { href: "/quiz?exam=dev&field=all", label: "All-fields quiz" },
    tiles: [
      { href: "/games/drills/gitcmd?exam=dev", icon: "🌿", label: "Git drill", sub: "Pick the command", color: "#c2410c" },
      { href: "/games/flashcards?exam=dev", icon: "🃏", label: "Cards", sub: `${getTermsByExam("dev").length} terms`, color: "#7c3aed" },
      { href: "/games/speed?exam=dev", icon: "⚡", label: "Speed", sub: "60 seconds", color: "#dc2626" },
      { href: "/scroll?exam=dev", icon: "🌀", label: "Feed", sub: "Skim the terms", color: "#0891b2" },
    ],
    fields: (["git", "database", "vercel", "web", "ai"] as const).map((key) => ({
      key,
      label: devFieldLabels[key],
      count: devQs.filter((q) => q.devField === key).length,
      quiz: `/quiz?exam=dev&field=${key}`,
      study: `/study?exam=dev&category=${key}`,
    })),
  },
];

// id -> field key per track, so the client can work out accuracy per field from
// the saved history without loading the question bank.
const meta: QuestionMeta[] = questions.map((q) => {
  const exams = q.exams ?? ["it-passport"];
  return [
    q.id,
    exams.includes("it-passport") ? q.category : null,
    exams.includes("chizai") ? (q.ipField ?? "other") : null,
    exams.includes("dev") ? (q.devField ?? null) : null,
  ];
});

export default function Home() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-5 sm:py-8">
      <h1 className="mb-3 text-xl font-bold leading-tight sm:text-2xl">ITパスポート＆知財3級</h1>
      <HomeTracks tracks={tracks} meta={meta} />
    </div>
  );
}
