"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, Suspense, useMemo, useRef } from "react";
import { getQuestionsByCategory } from "@/data/questions";
import { categoryLabels, Category } from "@/lib/types";
import { defaultAiSettings, loadAiSettings } from "@/lib/appSettings";
import LoadingSpinner from "@/components/LoadingSpinner";

type FeedItem = {
  feedId: string;
  questionIndex: number;
};

type ExamTipSection = {
  title: string;
  points: string[];
};

type LessonBlock = {
  title: string;
  summary: string;
  bullets: string[];
  example: string;
  quickCheck: string[];
  memoryHook: string;
};

type QuestionCoaching = {
  takeaway: string;
  trap: string;
  checkpoint: string;
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


const lessonBlocksMap: Record<Category, LessonBlock[]> = {
  strategy: [
    {
      title: "経営戦略の基本フレーム",
      summary:
        "経営理念・SWOT・PPM・BSC・PDCAは、それぞれ単独で覚えるよりも『現状把握→方針決定→評価→改善』の流れに乗せると理解しやすくなります。",
      bullets: [
        "経営理念は企業の存在意義、戦略は理念を実現するための方向性です。",
        "SWOTは内部環境と外部環境を整理する分析、PPMは事業配分、BSCは評価指標という役割の違いを区別しましょう。",
        "PDCAは改善サイクルなので、単発の計画ではなく継続的な見直しとセットで出題されます。",
      ],
      example: "新規サービスを考えるなら、まず理念に沿って目的を確認し、SWOTで現状を分析し、PPMで投資判断を行い、BSCで成果を測り、PDCAで改善します。",
      quickCheck: [
        "理念と売上目標を言い分けられるか。",
        "SWOT・PPM・BSC・PDCAの役割を1行ずつ説明できるか。",
      ],
      memoryHook: "理念は『なぜ存在するか』、戦略は『どう戦うか』、評価は『どう測るか』で切り分ける。",
    },
    {
      title: "マーケティングと顧客戦略",
      summary:
        "CRMのような顧客接点の考え方は、単なる管理ツールではなく、売上や満足度を伸ばすための戦略として理解すると定着します。",
      bullets: [
        "CRMは顧客情報の蓄積が目的ではなく、関係強化による継続利用や満足度向上が目的です。",
        "BSCの顧客視点や経営理念と関連づけると、企業活動のどこに位置づくか見えやすくなります。",
        "選択肢に『社内効率化』『勤怠管理』があれば、顧客戦略とズレていないかを確認しましょう。",
      ],
      example: "購入履歴を分析しておすすめ商品を提案する施策は、顧客との関係強化につながるのでCRMらしい施策と判断できます。",
      quickCheck: [
        "その施策は顧客との接点を良くするものか。",
        "売上向上だけでなく満足度向上まで説明できるか。",
      ],
      memoryHook: "CRMは『顧客との関係』、社内効率化は別テーマと分けて考える。",
    },
    {
      title: "法務・企業活動の頻出テーマ",
      summary:
        "ストラテジ系では、個人情報保護法・著作権法・SCMのように、対象や目的を正しく言い分けられるかが得点差になります。",
      bullets: [
        "個人情報は『生存する個人を識別できるか』が軸で、法人情報は通常含まれません。",
        "著作権法は作品そのものを守る一方、言語・規約・解法のようなアイデアやルールそのものは対象外です。",
        "SCMは調達から販売までの供給連鎖全体を最適化する考え方で、部分最適ではなく全体最適がキーワードです。",
      ],
      example: "『法人の所在地』『プログラム言語』『問い合わせ管理』のような語が選択肢に出たら、誰を守る法か、どこまでが供給連鎖かを軸に切り分けます。",
      quickCheck: [
        "個人情報かどうかを『個人識別』で判断できるか。",
        "著作物とアイデア・ルールの違いを説明できるか。",
      ],
      memoryHook: "『誰を守る法か』『何を最適化する仕組みか』の2軸で読む。",
    },
  ],
  management: [
    {
      title: "開発と運用の全体像",
      summary:
        "マネジメント系は、開発工程・運用管理・品質保証を別々ではなく、システムのライフサイクル全体として理解すると整理しやすくなります。",
      bullets: [
        "WBSとガントチャートは計画と進捗の可視化、SLAはサービス品質の合意、監査は第三者視点の評価です。",
        "V字モデルは上流工程とテスト工程の対応関係、アジャイルは短い反復で価値を届ける考え方が中心です。",
        "インシデント管理は復旧優先、問題管理は原因分析優先と順番で覚えると迷いません。",
      ],
      example: "開発前にWBSで作業を分け、ガントチャートで進捗を追い、リリース後に障害が起きたらまずインシデント管理で復旧する、という流れで理解するとつながります。",
      quickCheck: [
        "WBS・ガントチャート・SLA・監査の役割を混同せず説明できるか。",
        "『まず復旧、次に原因分析』を即答できるか。",
      ],
      memoryHook: "まず計画、次に提供、問題が起きたら復旧、その後に原因分析。",
    },
    {
      title: "開発モデルの比較",
      summary:
        "V字モデルとアジャイルは、工程の進め方も問題の問われ方も異なります。比較軸を持つと一気に解きやすくなります。",
      bullets: [
        "V字モデルは上流工程と対応するテストを結びつける考え方が中心です。",
        "アジャイルは短い反復とフィードバック重視で、要件変化に強い点が特徴です。",
        "『最初に全要件を固定』『少しずつ作って改善』のどちらかで選択肢を見分けると失点しにくいです。",
      ],
      example: "『顧客の反応を見ながら機能を追加する』ならアジャイル、『外部設計に対応する結合テストを行う』ならV字モデルの話です。",
      quickCheck: [
        "結合テストに対応する上流工程を答えられるか。",
        "アジャイルの特徴をウォーターフォールと対比して言えるか。",
      ],
      memoryHook: "V字は『対応関係』、アジャイルは『反復改善』で覚える。",
    },
    {
      title: "規格・見積もり・計画立案",
      summary:
        "ITパスポートでは、規格名と目的、見積もり手法と評価対象の対応を問う問題が定番です。",
      bullets: [
        "ISO/IEC 27001は情報セキュリティ、ISO/IEC 20000はITサービス、ISO 9001は品質管理です。",
        "ファンクションポイント法はソースコード量ではなく、利用者から見た機能量で規模を見積もります。",
        "共通フレームのシステム化計画では、業務分析・目的整理・方針決定のような上流の検討を行います。",
      ],
      example: "規格問題では『何を管理する規格か』、見積もり問題では『何を数えるか』、工程問題では『何を決める段階か』を先に決めると迷いにくくなります。",
      quickCheck: [
        "27001・20000・9001の用途を即答できるか。",
        "FP法が機能量ベースだと説明できるか。",
      ],
      memoryHook: "規格は『何を管理するか』、見積もりは『何を数えるか』を確認する。",
    },
  ],
  technology: [
    {
      title: "計算・ハードウェア・ネットワーク",
      summary:
        "テクノロジ系は、計算問題と機器の役割問題を同時に押さえると得点が安定します。暗記だけでなく、仕組みを一文で説明できることが重要です。",
      bullets: [
        "2進数、論理演算、処理性能、転送速度は途中式を残しながら確認すると失点を減らせます。",
        "CPU・メモリ・補助記憶装置・OS・DBMS・ルータの役割を対比で覚えると選択肢を素早く消せます。",
        "OSI参照モデルは層の番号だけでなく、ルータ=第3層のように代表機器とセットで覚えるのが有効です。",
      ],
      example: "1010₂を10進数に直すときは 8+2 と分解し、ネットワーク機器の問題では『中継だけか、経路選択するか』で層を見分けます。",
      quickCheck: [
        "2進数の各桁の重みを書き出せるか。",
        "ルータ・L2スイッチ・ハブの違いを層で説明できるか。",
      ],
      memoryHook: "数字問題は式、機器問題は役割、ネットワーク問題は層で整理する。",
    },
    {
      title: "セキュリティとシステム基礎",
      summary:
        "認証方式・攻撃手法・対策技術は単語だけだと混ざりやすいため、『何を防ぐか』『どこで使うか』までセットで押さえましょう。",
      bullets: [
        "暗号化・認証・アクセス制御は目的が違うので、機密性・完全性・可用性との関連も意識すると強いです。",
        "マルウェアや不正アクセスの問題は、攻撃名と対策名を対で確認すると覚えやすくなります。",
        "OSやデータベースの基本用語は、利用者から見たメリットや運用上の役割と結びつけると定着します。",
      ],
      example: "『なりすまし防止』なら認証、『内容を読めなくする』なら暗号化、『利用権限を制限する』ならアクセス制御、のように目的で切り分けます。",
      quickCheck: [
        "攻撃名を見たとき、守るべき性質を答えられるか。",
        "暗号化・認証・アクセス制御を目的で区別できるか。",
      ],
      memoryHook: "攻撃は『何を狙うか』、対策は『何を守るか』で読む。",
    },
    {
      title: "学習を伸ばす計算手順",
      summary:
        "計算問題が苦手でも、式の置き方と単位確認の順番を固定すると安定して点を取れるようになります。",
      bullets: [
        "問題文の数値を書き出す→単位をそろえる→式を立てる→答えの桁感を確認する、の順に進めます。",
        "bitとbyte、Kとk、秒とミリ秒を取り違えると、理解していても失点しやすいです。",
        "途中式を残すだけで、見直し時にどこでズレたかをすぐ発見できます。",
      ],
      example: "転送速度の問題なら、まずMbpsかMB/sかを見て単位をそろえてから計算すれば、8倍違いのミスを防げます。",
      quickCheck: [
        "単位をそろえてから式を書く習慣があるか。",
        "答えが大きすぎる・小さすぎると感じたら見直せるか。",
      ],
      memoryHook: "数値は『書き出す→単位をそろえる→式→桁感チェック』で固定する。",
    },
  ],
};

const questionCoachingMap: Record<Category, QuestionCoaching[]> = {
  strategy: [
    { takeaway: "経営理念は数値目標ではなく、企業の存在意義を示す言葉です。", trap: "売上目標や制度の説明が出たら、理念ではなく個別施策の可能性があります。", checkpoint: "その選択肢は『なぜその会社が存在するか』に答えているかを確認しましょう。" },
    { takeaway: "SWOTのSはStrengthで、内部環境の強みを指します。", trap: "StrategyやSystemのような英単語の印象に引っぱられないことが大切です。", checkpoint: "4語を順番に口に出して言えるか確認しましょう。" },
    { takeaway: "BSCは財務・顧客・業務プロセス・学習と成長の4視点です。", trap: "もっともらしい言葉でも、正式な4視点に含まれないものは誤りです。", checkpoint: "4視点を略さず日本語で言い換えられるか試しましょう。" },
    { takeaway: "損益分岐点は利益ゼロになる売上高のラインです。", trap: "最大利益や固定費ゼロといった極端な表現は誤りになりやすいです。", checkpoint: "売上高と総費用が一致する場面をイメージできるか確認しましょう。" },
    { takeaway: "PDCAのCはCheckで、実行結果の評価です。", trap: "ControlやChangeは語感が似ていますが、正式な用語ではありません。", checkpoint: "P→D→C→Aの各段階を自分の学習にも当てはめてみましょう。" },
    { takeaway: "PPMの花形は高成長・高占有率の事業です。", trap: "成長率と占有率の高低を入れ替えて覚えると失点しやすいです。", checkpoint: "花形・金のなる木・問題児・負け犬の4象限を言えるか確認しましょう。" },
    { takeaway: "法人の所在地は、通常は個人情報保護法の個人情報に当たりません。", trap: "『情報』という言葉だけで個人情報と思い込まないことが重要です。", checkpoint: "生存する個人を識別できるか、という基準で各選択肢を見直しましょう。" },
    { takeaway: "著作権法はプログラム言語そのものを保護しません。", trap: "プログラムとプログラム言語を混同すると引っかかります。", checkpoint: "表現として完成した作品か、ルールや概念かを切り分けましょう。" },
    { takeaway: "CRMは顧客との関係を強化して売上や満足度を高める考え方です。", trap: "社内業務の効率化や品質管理はCRMの中心目的ではありません。", checkpoint: "その施策は顧客との接点を良くするものかを考えましょう。" },
    { takeaway: "SCMは調達から販売までをつなぐ供給連鎖全体の最適化です。", trap: "人事や問い合わせ管理など、チェーン外の業務と混同しやすいです。", checkpoint: "部分最適ではなく全体最適かどうかを判断軸にしましょう。" },
  ],
  management: [
    { takeaway: "WBSは作業を階層的に分解した構成図です。", trap: "予算表や役割表と混同しないようにしましょう。", checkpoint: "大きな作業を小さなタスクへ分解する流れを思い浮かべましょう。" },
    { takeaway: "インシデント管理の目的は、サービスを早く復旧させることです。", trap: "原因究明は問題管理の役割なので順番を混同しないことが大切です。", checkpoint: "『まず復旧、次に分析』と言えるか確認しましょう。" },
    { takeaway: "V字モデルでは結合テストは外部設計に対応します。", trap: "要件定義・内部設計・結合テストの対応を入れ替えやすい点に注意です。", checkpoint: "上流とテストを線で結ぶイメージで復習しましょう。" },
    { takeaway: "アジャイル開発は短い反復で開発と改善を繰り返します。", trap: "要件を最初にすべて固定する考え方はウォーターフォール寄りです。", checkpoint: "少しずつ作って見直す流れがあるかで判断しましょう。" },
    { takeaway: "ISMSの国際規格はISO/IEC 27001です。", trap: "9001や20000は別分野の規格なので用途で区別しましょう。", checkpoint: "規格名を見たら『情報セキュリティか、品質か、ITサービスか』を即答できるか確認しましょう。" },
    { takeaway: "ガントチャートは横棒で進捗を時系列に表します。", trap: "依存関係を強く表すネットワーク図とは役割が異なります。", checkpoint: "横軸が時間、縦軸が作業の図を頭に描けるか確認しましょう。" },
    { takeaway: "システム監査は独立した立場で信頼性や安全性を評価します。", trap: "監査人が開発や運用を直接担当するわけではありません。", checkpoint: "第三者視点で評価しているかを見抜きましょう。" },
    { takeaway: "SLAはサービス品質の水準を合意した文書です。", trap: "契約金額や仕様書そのものとは役割が違います。", checkpoint: "可用性や応答時間のような品質指標が含まれるか確認しましょう。" },
    { takeaway: "ファンクションポイント法は機能量で開発規模を見積もります。", trap: "LOC法のようなコード量ベースと混同しやすいです。", checkpoint: "利用者から見える機能を数える手法かどうかで判断しましょう。" },
    { takeaway: "システム化計画では業務分析と方針決定のような上流検討を行います。", trap: "詳細設計やテストケース作成はもっと後の工程です。", checkpoint: "今その工程は『何を作るか決める段階』かを考えましょう。" },
  ],
  technology: [
    { takeaway: "2進数1010は10進数で10です。", trap: "桁の重みを飛ばして足すと誤りやすいです。", checkpoint: "2³, 2², 2¹, 2⁰の重みを書き出して確認しましょう。" },
    { takeaway: "OSI第3層で動く代表機器はルータです。", trap: "ハブやリピータは下位層、L2スイッチは第2層なので区別が必要です。", checkpoint: "機器名を見たらOSIの層を1つ答えられるようにしましょう。" },
  ],
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
  const [aiSettings, setAiSettings] = useState(defaultAiSettings);
  const [aiNote, setAiNote] = useState("");
  const [aiError, setAiError] = useState("");
  const [isGeneratingAiNote, setIsGeneratingAiNote] = useState(false);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  const question = questions[currentIndex];
  const categoryLabel = categoryLabels[category as Category] || category;
  const studiedCount = showAnswer ? currentIndex + 1 : currentIndex;
  const mastery = questions.length > 0 ? Math.round((studiedCount / questions.length) * 100) : 0;
  const categoryExamTips = examTipMap[category as Category] || [];
  const lessonBlocks = lessonBlocksMap[category as Category] || [];
  const questionCoaching = questionCoachingMap[category as Category]?.[currentIndex];

  const handleGenerateAiNote = async () => {
    if (!aiSettings.apiKey || !aiSettings.model) {
      setAiError("先にSettingsでAPIキーとモデルを保存してください。");
      setAiNote("");
      return;
    }

    setIsGeneratingAiNote(true);
    setAiError("");

    try {
      const response = await fetch("/api/generate-study-note", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: aiSettings.apiKey,
          model: aiSettings.model,
          prompt: `ITパスポート試験の${categoryLabel}について学習中です。現在の問題: ${question.question}
選択肢: ${question.options.join(" / ")}
正解: ${question.options[question.correctIndex]}
既存解説: ${question.explanation}

最新の実務トピックや関連ニュースがあればWeb検索も使いながら、学習者向けに日本語で以下を作ってください。
1. 120〜220文字の要点まとめ
2. 実務でのつながり3点
3. 試験でひっかかりやすいポイント2点
4. Doom Scroll向けの追加ミニテーマ1つ`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(typeof data.error === "string" ? data.error : "AI生成に失敗しました。");
      }

      setAiNote(typeof data.text === "string" ? data.text : "");
    } catch (error) {
      setAiError(error instanceof Error ? error.message : "AI生成に失敗しました。");
      setAiNote("");
    } finally {
      setIsGeneratingAiNote(false);
    }
  };

  useEffect(() => {
    setAiSettings(loadAiSettings());
  }, []);

  useEffect(() => {
    setCurrentIndex(0);
    setShowAnswer(false);
    setAiNote("");
    setAiError("");
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
            <p className="text-sm font-semibold text-sky-700 dark:text-sky-200">レッスン拡張ガイド</p>
            <h2 className="mt-2 text-2xl font-bold">{categoryLabel}を面で理解するミニレッスン</h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[var(--muted)]">
              1問ずつの暗記に偏らないよう、出題テーマをまとまりで理解できるレッスンブロックを追加しました。先に全体像を掴んでから個別問題へ進むと、似た用語の区別がかなり楽になります。
            </p>
          </div>
          <div className="rounded-2xl bg-white/70 px-4 py-3 text-sm shadow-sm dark:bg-black/10">
            <p className="text-xs text-[var(--muted)]">おすすめの進め方</p>
            <p className="mt-1 font-medium">全体像 → 例題 → 解説 → クイズ</p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 xl:grid-cols-3">
          {lessonBlocks.map((lesson, index) => (
            <section
              key={lesson.title}
              className="rounded-2xl border border-sky-200/70 bg-white/85 p-5 dark:border-sky-400/20 dark:bg-black/10"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-600 dark:text-sky-200">Lesson {index + 1}</p>
                <span className="rounded-full bg-sky-100 px-3 py-1 text-[11px] font-medium text-sky-700 dark:bg-sky-500/10 dark:text-sky-100">拡張版</span>
              </div>
              <h3 className="mt-2 font-semibold text-lg">{lesson.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">{lesson.summary}</p>
              <ul className="mt-4 space-y-2 text-sm leading-relaxed text-[var(--muted)]">
                {lesson.bullets.map((point) => (
                  <li key={point} className="flex gap-2">
                    <span className="mt-0.5">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 rounded-xl border border-sky-200/70 bg-sky-50/80 px-4 py-3 text-sm dark:border-sky-400/20 dark:bg-sky-500/10">
                <p className="font-semibold text-sky-900 dark:text-sky-100">ミニケース</p>
                <p className="mt-1 leading-relaxed text-sky-900/80 dark:text-sky-50">{lesson.example}</p>
              </div>
              <div className="mt-4 rounded-xl border border-dashed border-sky-200/80 px-4 py-3 dark:border-sky-400/20">
                <p className="text-sm font-semibold">30秒チェック</p>
                <ul className="mt-2 space-y-2 text-sm leading-relaxed text-[var(--muted)]">
                  {lesson.quickCheck.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-0.5">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-4 rounded-xl bg-sky-50 px-4 py-3 text-sm text-sky-900 dark:bg-sky-500/10 dark:text-sky-100">
                <span className="font-semibold">覚え方:</span> {lesson.memoryHook}
              </div>
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

{questionCoaching && (
                    <div className="mb-4 grid gap-3 rounded-xl border border-sky-200/80 bg-sky-50/80 p-4 text-sm shadow-sm dark:border-sky-400/20 dark:bg-sky-500/10">
                      <div>
                        <p className="font-semibold text-sky-900 dark:text-sky-100">この問題の学習ポイント</p>
                        <p className="mt-1 text-[var(--muted)]">{questionCoaching.takeaway}</p>
                      </div>
                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="rounded-lg bg-white/80 p-3 dark:bg-black/10">
                          <p className="font-medium">ひっかけポイント</p>
                          <p className="mt-1 text-[var(--muted)]">{questionCoaching.trap}</p>
                        </div>
                        <div className="rounded-lg bg-white/80 p-3 dark:bg-black/10">
                          <p className="font-medium">確認のひとこと</p>
                          <p className="mt-1 text-[var(--muted)]">{questionCoaching.checkpoint}</p>
                        </div>
                      </div>
                    </div>
                  )}

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

          <div className="rounded-2xl border border-violet-200/70 bg-violet-50/70 p-5 shadow-sm dark:border-violet-400/20 dark:bg-violet-500/10">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold">AIで補足ノートを生成</h2>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                  Settingsで保存したAPIキーとモデルを使って、現在の問題にひもづく追加学習ノートを生成します。Web検索を使った最新補足も含められます。
                </p>
              </div>
              <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-violet-700 dark:bg-black/10 dark:text-violet-100">{aiSettings.model || "model未設定"}</span>
            </div>
            <div className="mt-4 space-y-3">
              <button
                onClick={handleGenerateAiNote}
                disabled={isGeneratingAiNote}
                className="w-full rounded-xl bg-violet-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isGeneratingAiNote ? "生成中…" : "この問題のAIノートを作る"}
              </button>
              <button
                onClick={() => router.push("/settings")}
                className="w-full rounded-xl bg-white/80 px-4 py-3 text-sm font-medium transition-colors hover:bg-white dark:bg-black/10 dark:hover:bg-black/20"
              >
                Settingsを開く
              </button>
              {aiError ? <p className="text-sm text-rose-600">{aiError}</p> : null}
              {aiNote ? (
                <div className="rounded-xl border border-violet-200/80 bg-white/90 p-4 text-sm leading-relaxed whitespace-pre-wrap dark:border-violet-400/20 dark:bg-black/10">
                  {aiNote}
                </div>
              ) : null}
            </div>
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
