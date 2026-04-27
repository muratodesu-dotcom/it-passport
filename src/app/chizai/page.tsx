import Link from "next/link";
import {
  chizaiQuestions,
  chizaiCategoryLabels,
  ChizaiCategory,
} from "@/data/chizaiQuestions";

const categoryDefinitions: {
  id: ChizaiCategory | "all";
  description: string;
  color: string;
  icon: string;
}[] = [
  {
    id: "all",
    description: `特許・意匠・商標・著作権など全分野の${chizaiQuestions.length}問`,
    color: "from-amber-500 to-rose-500",
    icon: "📚",
  },
  {
    id: "patent",
    description: "特許権の取得要件、存続期間、審査請求など",
    color: "from-blue-500 to-cyan-500",
    icon: "🔬",
  },
  {
    id: "design",
    description: "意匠の定義、登録要件、関連制度",
    color: "from-violet-500 to-fuchsia-500",
    icon: "🎨",
  },
  {
    id: "trademark",
    description: "商標登録の要件、存続期間と更新",
    color: "from-emerald-500 to-teal-500",
    icon: "🏷️",
  },
  {
    id: "copyright",
    description: "著作物の定義、保護期間、権利制限",
    color: "from-orange-500 to-red-500",
    icon: "📖",
  },
  {
    id: "unfair",
    description: "営業秘密、不正競争行為",
    color: "from-slate-500 to-zinc-600",
    icon: "🛡️",
  },
  {
    id: "treaty",
    description: "PCT、マドプロ、ハーグ協定など",
    color: "from-indigo-500 to-purple-600",
    icon: "🌐",
  },
];

const categories = categoryDefinitions.map((category) => ({
  ...category,
  title:
    category.id === "all"
      ? "全分野"
      : chizaiCategoryLabels[category.id as ChizaiCategory],
  count:
    category.id === "all"
      ? chizaiQuestions.length
      : chizaiQuestions.filter((q) => q.category === category.id).length,
}));

export default function ChizaiHome() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <header className="mb-10 rounded-[2rem] border border-[var(--card-border)] bg-[var(--card)] p-8 shadow-sm">
        <p className="mb-3 inline-flex rounded-full bg-[var(--badge-bg)] px-3 py-1 text-sm font-medium text-[var(--primary)]">
          知財分野の基礎を体系的に
        </p>
        <h1
          className="mb-4 text-3xl md:text-4xl font-bold leading-tight bg-clip-text text-transparent"
          style={{
            backgroundImage: `linear-gradient(to right, var(--gradient-from), var(--gradient-via), var(--gradient-to))`,
          }}
        >
          知的財産管理技能検定 3級 対策
        </h1>
        <p className="max-w-2xl text-base md:text-lg leading-relaxed text-[var(--muted)]">
          特許・意匠・商標・著作権など、3級試験で問われる知財の基礎を一問一答で確認できます。
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/chizai/quiz?category=all"
            className="rounded-xl bg-[var(--primary)] px-6 py-3 font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-[var(--primary-hover)]"
          >
            総合クイズに挑戦
          </Link>
          <Link
            href="/"
            className="rounded-xl border border-[var(--card-border)] bg-[var(--background)] px-6 py-3 font-medium transition-all hover:-translate-y-0.5 hover:bg-[var(--card-hover)]"
          >
            ITパスポートに戻る
          </Link>
        </div>
      </header>

      <section className="mb-12">
        <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
          <h2 className="text-xl font-semibold">分野別に挑戦</h2>
          <p className="text-sm text-[var(--muted)]">
            気になる分野からテンポよく確認できます。
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/chizai/quiz?category=${cat.id}`}
              className="group block rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6 transition-all hover:shadow-lg hover:-translate-y-0.5"
            >
              <div className="flex items-start gap-4">
                <span className="text-3xl">{cat.icon}</span>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-1 group-hover:text-[var(--primary)]">
                    {cat.title}
                  </h3>
                  <p className="text-sm text-[var(--muted)] mb-2">
                    {cat.description}
                  </p>
                  <span
                    className={`inline-block text-xs text-white px-2 py-1 rounded-full bg-gradient-to-r ${cat.color}`}
                  >
                    {cat.count}問
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-2">このセクションについて</h2>
        <p className="text-sm leading-relaxed text-[var(--muted)]">
          知的財産管理技能検定 3級は、知的財産の基本的な内容を理解しているかを問う国家検定です。
          ここでは試験で頻出のテーマからサンプル問題を収録しています。問題は順次追加していく予定です。
        </p>
      </section>
    </div>
  );
}
