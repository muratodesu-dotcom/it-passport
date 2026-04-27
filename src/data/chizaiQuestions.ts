export type ChizaiCategory =
  | "patent"
  | "design"
  | "trademark"
  | "copyright"
  | "unfair"
  | "treaty";

export interface ChizaiQuestion {
  id: number;
  category: ChizaiCategory;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export const chizaiCategoryLabels: Record<ChizaiCategory, string> = {
  patent: "特許法・実用新案法",
  design: "意匠法",
  trademark: "商標法",
  copyright: "著作権法",
  unfair: "不正競争防止法",
  treaty: "条約・国際出願",
};

export const chizaiQuestions: ChizaiQuestion[] = [
  {
    id: 1,
    category: "patent",
    question:
      "特許権の存続期間として、最も適切なものはどれか。",
    options: [
      "出願日から20年",
      "登録日から20年",
      "出願日から10年",
      "登録日から10年",
    ],
    correctIndex: 0,
    explanation:
      "特許権の存続期間は、原則として特許出願の日から20年です（特許法第67条第1項）。なお、医薬品など一部については延長登録の制度があります。",
  },
  {
    id: 2,
    category: "patent",
    question:
      "特許を受けるための要件として、誤っているものはどれか。",
    options: [
      "発明者本人が日本人であること",
      "産業上利用できる発明であること",
      "新規性があること",
      "進歩性があること",
    ],
    correctIndex: 0,
    explanation:
      "特許要件は、産業上の利用可能性、新規性、進歩性、先願であること等です。発明者の国籍は要件ではありません。",
  },
  {
    id: 3,
    category: "design",
    question:
      "意匠法における意匠の定義に含まれないものはどれか。",
    options: [
      "音楽の旋律",
      "物品の形状",
      "物品の模様",
      "物品の色彩",
    ],
    correctIndex: 0,
    explanation:
      "意匠とは、物品（建築物・画像を含む）の形状、模様若しくは色彩又はこれらの結合であって、視覚を通じて美感を起こさせるものをいいます。音楽は対象外です。",
  },
  {
    id: 4,
    category: "trademark",
    question:
      "商標権の存続期間と更新に関する記述として、最も適切なものはどれか。",
    options: [
      "設定登録の日から10年で、何度でも更新登録できる",
      "出願日から20年で、更新はできない",
      "設定登録の日から5年で、1回のみ更新できる",
      "登録日から永久に存続する",
    ],
    correctIndex: 0,
    explanation:
      "商標権は設定登録の日から10年で消滅しますが、更新登録の申請により10年ごとに何度でも更新できます（商標法第19条）。",
  },
  {
    id: 5,
    category: "copyright",
    question:
      "著作権の保護期間として、現行法における原則的な期間はどれか。",
    options: [
      "著作者の死後70年",
      "著作者の死後50年",
      "公表後20年",
      "創作後100年",
    ],
    correctIndex: 0,
    explanation:
      "著作権の保護期間は、原則として著作者の死後70年です（2018年TPP整備法施行により50年から70年に延長）。",
  },
  {
    id: 6,
    category: "copyright",
    question:
      "次のうち、著作権法上の著作物に該当しないものはどれか。",
    options: [
      "単なる事実の伝達にすぎない時事の報道",
      "小説",
      "絵画",
      "コンピュータプログラム",
    ],
    correctIndex: 0,
    explanation:
      "著作物は思想又は感情を創作的に表現したものであり、単なる事実の伝達にすぎない雑報及び時事の報道は著作物に該当しません（著作権法第10条第2項）。",
  },
  {
    id: 7,
    category: "unfair",
    question:
      "不正競争防止法における「営業秘密」の要件として、必要でないものはどれか。",
    options: [
      "特許庁への登録",
      "秘密管理性",
      "有用性",
      "非公知性",
    ],
    correctIndex: 0,
    explanation:
      "営業秘密の3要件は、秘密管理性・有用性・非公知性です。営業秘密は登録によって発生する権利ではありません。",
  },
  {
    id: 8,
    category: "treaty",
    question:
      "1つの願書で複数の国に特許出願の効果を得られる国際出願制度はどれか。",
    options: [
      "PCT（特許協力条約）に基づく国際出願",
      "ベルヌ条約に基づく国際出願",
      "マドリッド協定議定書に基づく国際出願",
      "ハーグ協定に基づく国際出願",
    ],
    correctIndex: 0,
    explanation:
      "PCT（Patent Cooperation Treaty）に基づく国際出願は、1つの願書で複数の締約国への特許出願の効果が得られる制度です。マドプロは商標、ハーグ協定は意匠の国際出願制度です。",
  },
  {
    id: 9,
    category: "patent",
    question:
      "特許出願の審査請求ができる期間として、正しいものはどれか。",
    options: [
      "出願日から3年以内",
      "出願日から1年以内",
      "出願公開後6か月以内",
      "出願日から10年以内",
    ],
    correctIndex: 0,
    explanation:
      "特許出願の審査請求は、出願日から3年以内に行わなければなりません。期間内に請求がない場合、その出願は取り下げたものとみなされます。",
  },
  {
    id: 10,
    category: "trademark",
    question:
      "商標登録を受けることができないものとして、最も適切なものはどれか。",
    options: [
      "商品の普通名称を普通に用いられる方法で表示する標章のみからなる商標",
      "造語からなる商標",
      "図形と文字を組み合わせた商標",
      "立体的形状からなる商標",
    ],
    correctIndex: 0,
    explanation:
      "商品の普通名称を普通に用いられる方法で表示する標章のみからなる商標は、識別力がないため商標登録を受けることができません（商標法第3条第1項第1号）。",
  },
];

export function getChizaiQuestionsByCategory(
  category: string,
): ChizaiQuestion[] {
  if (category === "all") return chizaiQuestions;
  return chizaiQuestions.filter((q) => q.category === category);
}

export function shuffleChizaiQuestions(
  questions: ChizaiQuestion[],
): ChizaiQuestion[] {
  const shuffled = [...questions];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
