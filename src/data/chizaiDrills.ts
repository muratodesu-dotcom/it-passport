import { DrillDef, DrillQuestion } from "@/lib/drills";

// 知財3級に特化したドリル。用語集から自動生成せず、内容を作り込む。
// 各MCQは正解を index 0 に置き、出題時にシャッフルする。

export const durationQuestions: DrillQuestion[] = [
  { id: "d1", prompt: "特許権の存続期間は？", options: ["出願から20年", "出願から25年", "登録から10年", "著作者の死後70年"], correctIndex: 0, explanation: "特許権は出願日から20年（一部延長あり）。" },
  { id: "d2", prompt: "意匠権の存続期間は？", options: ["出願から25年", "出願から20年", "登録から10年", "公表後70年"], correctIndex: 0, explanation: "意匠権は出願日から25年（2020年施行の改正）。" },
  { id: "d3", prompt: "商標権の存続期間は？", options: ["登録から10年（更新で半永久）", "出願から20年", "出願から25年", "著作者の死後70年"], correctIndex: 0, explanation: "商標権は設定登録から10年。更新登録で半永久的に維持できる。" },
  { id: "d4", prompt: "実用新案権の存続期間は？", options: ["出願から10年", "出願から20年", "出願から25年", "登録から10年"], correctIndex: 0, explanation: "実用新案権は出願日から10年。無審査で登録される。" },
  { id: "d5", prompt: "著作権（著作財産権）の原則的な保護期間は？", options: ["著作者の死後70年", "公表後25年", "出願から20年", "登録から10年"], correctIndex: 0, explanation: "原則として著作者の死後70年まで。" },
  { id: "d6", prompt: "育成者権（種苗法）の存続期間は？", options: ["登録から25年（一部30年）", "出願から20年", "登録から10年", "著作者の死後70年"], correctIndex: 0, explanation: "育成者権は品種登録から25年（樹木等は30年）。" },
  { id: "d7", prompt: "特許出願が出願公開されるのは出願から？", options: ["1年6か月後", "6か月後", "3年後", "20年後"], correctIndex: 0, explanation: "原則として出願日から1年6か月経過後に出願公開される。" },
  { id: "d8", prompt: "特許の出願審査請求ができる期間は？", options: ["出願から3年以内", "出願から1年以内", "出願から6か月以内", "登録から3年以内"], correctIndex: 0, explanation: "出願日から3年以内に審査請求しないと取り下げたものとみなされる。" },
  { id: "d9", prompt: "登録商標が不使用取消審判の対象となる不使用期間は？", options: ["継続して3年以上", "継続して1年以上", "継続して5年以上", "継続して10年以上"], correctIndex: 0, explanation: "継続して3年以上、国内で使用していない登録商標は取り消され得る。" },
  { id: "d10", prompt: "不正競争防止法で商品形態模倣（デッドコピー）が規制される期間は？", options: ["最初の販売から3年", "最初の販売から1年", "最初の販売から10年", "期間の定めなし"], correctIndex: 0, explanation: "日本国内で最初に販売された日から3年間規制される。" },
];

export const classifyQuestions: DrillQuestion[] = [
  { id: "c1", prompt: "特許権はどの分類に属する？", options: ["産業財産権（特許庁が所管）", "著作権（文化庁が所管）", "その他の知的財産（種苗法・不競法など）"], correctIndex: 0, explanation: "特許権・実用新案権・意匠権・商標権が産業財産権。" },
  { id: "c2", prompt: "商標権はどの分類に属する？", options: ["産業財産権（特許庁が所管）", "著作権（文化庁が所管）", "その他の知的財産（種苗法・不競法など）"], correctIndex: 0, explanation: "商標権は産業財産権の一つ。" },
  { id: "c3", prompt: "意匠権はどの分類に属する？", options: ["産業財産権（特許庁が所管）", "著作権（文化庁が所管）", "その他の知的財産（種苗法・不競法など）"], correctIndex: 0, explanation: "意匠権は産業財産権の一つ。" },
  { id: "c4", prompt: "実用新案権はどの分類に属する？", options: ["産業財産権（特許庁が所管）", "著作権（文化庁が所管）", "その他の知的財産（種苗法・不競法など）"], correctIndex: 0, explanation: "実用新案権は産業財産権の一つ。" },
  { id: "c5", prompt: "小説などの著作物に生じる権利はどの分類？", options: ["著作権（文化庁が所管）", "産業財産権（特許庁が所管）", "その他の知的財産（種苗法・不競法など）"], correctIndex: 0, explanation: "著作権は著作権法で保護され、文化庁が所管する。" },
  { id: "c6", prompt: "植物の新品種を保護する育成者権はどの分類？", options: ["その他の知的財産（種苗法・不競法など）", "産業財産権（特許庁が所管）", "著作権（文化庁が所管）"], correctIndex: 0, explanation: "育成者権は種苗法に基づく権利で、産業財産権には含まれない。" },
  { id: "c7", prompt: "営業秘密の保護はどの分類に基づく？", options: ["その他の知的財産（種苗法・不競法など）", "産業財産権（特許庁が所管）", "著作権（文化庁が所管）"], correctIndex: 0, explanation: "営業秘密は不正競争防止法で保護される。" },
  { id: "c8", prompt: "産業財産権を所管する官庁は？", options: ["特許庁", "文化庁", "公正取引委員会", "総務省"], correctIndex: 0, explanation: "特許・実用新案・意匠・商標は特許庁が所管。著作権は文化庁。" },
];

export const treatyQuestions: DrillQuestion[] = [
  { id: "t1", prompt: "特許の国際出願に関する条約は？", options: ["特許協力条約（PCT）", "マドリッド協定議定書", "ハーグ協定", "ベルヌ条約"], correctIndex: 0, explanation: "PCTは一つの国際出願で全加盟国に出願した効果を得る制度。" },
  { id: "t2", prompt: "著作権の国際的保護に関する基本条約は？", options: ["ベルヌ条約", "パリ条約", "PCT", "マドリッド協定議定書"], correctIndex: 0, explanation: "ベルヌ条約は無方式主義・内国民待遇を定める著作権の条約。" },
  { id: "t3", prompt: "商標の国際登録に関する制度は？", options: ["マドリッド協定議定書", "ハーグ協定", "PCT", "ベルヌ条約"], correctIndex: 0, explanation: "マドリッドプロトコルは商標の国際登録を一括出願できる制度。" },
  { id: "t4", prompt: "意匠の国際登録に関する条約は？", options: ["ハーグ協定", "マドリッド協定議定書", "PCT", "ベルヌ条約"], correctIndex: 0, explanation: "ハーグ協定は意匠の国際登録に関する制度。" },
  { id: "t5", prompt: "内国民待遇・優先権・特許独立を定める産業財産権の条約は？", options: ["パリ条約", "ベルヌ条約", "TRIPS協定", "ハーグ協定"], correctIndex: 0, explanation: "パリ条約の三原則は内国民待遇・優先権・特許独立。" },
  { id: "t6", prompt: "WTOで知的財産保護の最低基準を定めた協定は？", options: ["TRIPS協定", "パリ条約", "ベルヌ条約", "PCT"], correctIndex: 0, explanation: "TRIPS協定はWTO設立協定の一部で知財保護の最低基準を定める。" },
];

export interface FlowSet {
  id: string;
  title: string;
  steps: string[];
}

export const flowSets: FlowSet[] = [
  {
    id: "patent",
    title: "特許取得の流れ",
    steps: ["特許出願", "出願公開（1年6か月）", "出願審査請求（3年以内）", "実体審査", "特許査定", "設定登録"],
  },
  {
    id: "trademark",
    title: "商標登録の流れ",
    steps: ["商標登録出願", "方式審査", "実体審査", "登録査定", "設定登録（10年）", "更新登録"],
  },
];

export const chizaiDrillList: DrillDef[] = [
  { kind: "duration", title: "存続期間ドリル", description: "各権利の存続期間・期間を当てる", icon: "⏳", usesField: false },
  { kind: "classify", title: "権利の分類", description: "産業財産権・著作権・その他に分類", icon: "🗂️", usesField: false },
  { kind: "treaty", title: "条約マッチング", description: "条約と対象（特許・商標・著作権…）を対応", icon: "🌐", usesField: false },
  { kind: "flow", title: "手続フロー並べ替え", description: "出願から登録までの手順を順に並べる", icon: "🔢", usesField: false },
];

export const chizaiDrillMap: Record<string, DrillDef> = Object.fromEntries(
  chizaiDrillList.map((d) => [d.kind, d])
);

export const curatedQuestionSets: Record<string, DrillQuestion[]> = {
  duration: durationQuestions,
  classify: classifyQuestions,
  treaty: treatyQuestions,
};
