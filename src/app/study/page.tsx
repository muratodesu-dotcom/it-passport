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
  examAngles: string[];
  commonTraps: string[];
  example: string;
  quickCheck: string[];
  memoryHook: string;
};

type QuestionCoaching = {
  takeaway: string;
  trap: string;
  checkpoint: string;
};

type CoverageFocus = {
  title: string;
  whyItMatters: string;
  topics: string[];
  studyActions: string[];
};


type ReadinessAudit = {
  area: string;
  currentCoverage: string;
  thinSpots: string[];
  upgradeAdded: string[];
  examPriority: string;
};

type DeepDiveModule = {
  title: string;
  whyImportant: string;
  mustKnow: string[];
  scenarioDrill: string;
  finalCheck: string[];
};

const examTipMap: Record<Category, ExamTipSection[]> = {
  strategy: [
    {
      title: "頻出キーワードのつながり",
      points: [
        "SWOT・PPM・BSC・PDCAは『経営分析→戦略立案→評価→改善』の流れで整理すると覚えやすいです。",
        "CRMは顧客との関係強化、SCMは供給の全体最適化、経営理念は企業の存在意義と目的、という役割の違いを区別しましょう。",
        "著作権・個人情報保護法・不正競争防止法は『何が保護対象か』『何が対象外か』を対比で覚えるとひっかけに強くなります。",
      ],
    },
    {
      title: "本番での見抜き方",
      points: [
        "選択肢に『短期的な売上目標』『給与体系』のような限定的な説明が出たら、経営理念や戦略概念ではない可能性が高いです。",
        "法務問題は用語の定義を問うことが多いため、『個人』『法人』『著作物そのもの』など主語に注目すると正答しやすくなります。",
        "財務指標は分子と分母を逆にしたひっかけが定番なので、利益率・回転率・資本利益率の『何を何で割るか』を口に出して確認しましょう。",
      ],
    },
    {
      title: "追加で深掘りしたい論点",
      points: [
        "企業会計では損益分岐点、売上総利益、営業利益、ROE、ROA、付加価値などの関係を整理すると得点源になります。",
        "経営管理ではKPI・KGI・CSF、ERP、アウトソーシング、EA、DXなど『目的と効果』を問う問題にも備えましょう。",
        "ガバナンス分野では内部統制、コーポレートガバナンス、CSR、コンプライアンスの違いを説明できる状態を目指しましょう。",
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
        "レビュー、単体テスト、結合テスト、システムテスト、受入テストの担当者と目的を横並びで整理すると失点を減らせます。",
      ],
    },
    {
      title: "追加で深掘りしたい論点",
      points: [
        "プロジェクト管理ではクリティカルパス、EVMS、品質・コスト・納期のトレードオフ、リスク対応策の違いを復習すると実戦的です。",
        "運用管理では可用性、キャパシティ、変更管理、構成管理、バックアップ、ジョブ管理、監視の役割を整理しましょう。",
        "BCP、RTO、RPO、監査証跡、内部統制は、災害対策・統制・監査をまとめて出題されやすい周辺論点です。",
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
        "CPUクロック・MIPS・キャッシュ・主記憶容量は混同しやすいので、性能指標と記憶容量を別の概念として区別しましょう。",
      ],
    },
    {
      title: "追加で深掘りしたい論点",
      points: [
        "ハードウェアでは論理回路、メモリ階層、入出力装置、RAID、仮想化を押さえると取りこぼしを減らせます。",
        "ネットワークではTCP/IP、HTTP、DNS、DHCP、NAT、VPN、無線LAN、サブネットの基本まで広げると本番向きです。",
        "データベースでは主キー・外部キー・正規化・トランザクション、セキュリティでは認証・認可・暗号・署名・マルウェア対策まで押さえたいです。",
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
      examAngles: [
        "『理念・戦略・目標・施策』の階層を区別する設問",
        "SWOT・PPM・BSCの目的と使いどころを対応させる設問",
        "PDCAの各段階を別の英単語でひっかける設問",
      ],
      commonTraps: [
        "理念を短期売上目標や人事制度と取り違える。",
        "SWOTのSをStrategyと読み違える。",
        "BSCの4視点に『技術革新』のようなもっともらしい語を混ぜられる。",
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
        "4P、STP、BSCの顧客視点と関連づけると、企業活動のどこに位置づくか見えやすくなります。",
        "選択肢に『社内効率化』『勤怠管理』があれば、顧客戦略とズレていないかを確認しましょう。",
      ],
      examAngles: [
        "CRM・SCM・ERPを業務対象で見分ける設問",
        "STP・4Pを用いてターゲットと施策の違いを問う設問",
        "KGIとKPIの関係から、評価指標の位置づけを答えさせる設問",
      ],
      commonTraps: [
        "CRMを単なる顧客データ保管システムとみなす。",
        "広告施策と市場細分化を同じ段階だと思い込む。",
        "KPIを最終目標、KGIを途中指標として逆に覚える。",
      ],
      example: "購入履歴を分析しておすすめ商品を提案する施策は、顧客との関係強化につながるのでCRMらしい施策と判断できます。",
      quickCheck: [
        "その施策は顧客との接点を良くするものか。",
        "売上向上だけでなく満足度向上まで説明できるか。",
      ],
      memoryHook: "CRMは『顧客との関係』、社内効率化は別テーマと分けて考える。",
    },
    {
      title: "法務・知的財産・企業責任",
      summary:
        "ストラテジ系では、個人情報保護法・著作権法・不正競争防止法・コンプライアンスのように、保護対象と目的を言い分けられるかが鍵になります。",
      bullets: [
        "個人情報は『生存する個人を識別できるか』が軸で、法人情報は通常含まれません。",
        "著作権法は作品そのものを守る一方、言語・規約・解法のようなアイデアやルールそのものは対象外です。",
        "営業秘密は秘密管理性・有用性・非公知性の3要件、コンプライアンスは法令と社会規範の遵守です。",
      ],
      examAngles: [
        "個人情報・個人データ・匿名加工情報の違いを問う設問",
        "著作権の保護対象と対象外を対比させる設問",
        "営業秘密・特許・商標・著作権の守る対象を比較する設問",
      ],
      commonTraps: [
        "『情報』という言葉だけで何でも個人情報と考える。",
        "プログラムとプログラム言語を同じ著作物として扱う。",
        "営業秘密に特許の要件である新規性を混ぜられて迷う。",
      ],
      example: "『プログラム言語』『営業秘密』『個人データ』『CSR』が並んだら、何を法が守るのか、企業に何を求めるのかで切り分けます。",
      quickCheck: [
        "個人情報かどうかを『個人識別』で判断できるか。",
        "著作物と営業秘密の違いを説明できるか。",
      ],
      memoryHook: "法務問題は『誰を守るか』『何を守るか』を先に決める。",
    },
    {
      title: "会計・収益性・経営指標",
      summary:
        "ITパスポートのストラテジ系は文系知識だけではなく、収益性や費用構造を問う計算・指標問題も出ます。式の意味まで理解すると安定します。",
      bullets: [
        "損益分岐点は売上高と総費用が一致する点で、固定費・変動費・利益の関係を整理して覚えます。",
        "ROEは自己資本に対する利益、ROAは総資産に対する利益、売上高利益率は売上に対する利益と、分母の違いが重要です。",
        "売上総利益、営業利益、経常利益、当期純利益は、どの費用や収益が差し引かれた後かを段階で理解しましょう。",
      ],
      examAngles: [
        "利益率・資本効率の分母を入れ替えたひっかけ設問",
        "固定費と変動費から損益分岐点や利益の有無を判断させる設問",
        "各利益の段階を見て、何の費用が含まれるかを選ばせる設問",
      ],
      commonTraps: [
        "ROEとROAの分母を逆にする。",
        "損益分岐点を『利益最大』の点だと思い込む。",
        "売上総利益と営業利益を、販管費の有無を見ずに混同する。",
      ],
      example: "売上が増えても固定費が大きければ損益分岐点を超えないことがあります。指標問題でも、どの資源に対して利益を測っているかを見れば判断しやすくなります。",
      quickCheck: [
        "ROEの分母が自己資本だと即答できるか。",
        "損益分岐点を『利益ゼロの売上高』と言い換えられるか。",
      ],
      memoryHook: "利益率は『利益÷何か』。分母が何かを最優先で確認する。",
    },
    {
      title: "業務改善・DX・全体最適",
      summary:
        "BPR、SCM、ERP、DXはどれも『業務を良くする』言葉ですが、対象範囲と変革の深さが違います。そこを区別できると本番で強いです。",
      bullets: [
        "BPRは業務プロセスの抜本的再設計、SCMは供給連鎖全体の最適化、ERPは基幹業務の統合管理です。",
        "DXは単なるデジタル化ではなく、データや技術を使ってビジネスモデルや組織を変革する考え方です。",
        "部分最適か全体最適か、既存改善か抜本改革かを見分けると類似語に強くなります。",
      ],
      examAngles: [
        "BPR・ERP・SCM・CRM・DXを目的と対象範囲で見分ける設問",
        "KPI/KGI/CSFの上下関係を整理させる設問",
        "『単なるIT化』と『変革』の違いを説明させるDX設問",
      ],
      commonTraps: [
        "DXを紙の電子化やPC更新レベルで考える。",
        "ERPを顧客管理、CRMを基幹業務統合と取り違える。",
        "BPRを『少しずつ改善』と誤解してKaizen系と混ぜる。",
      ],
      example: "紙をPDF化するだけなら単なるデジタル化ですが、顧客行動データを活用してサービス提供方法そのものを変えるならDXに近い発想です。",
      quickCheck: [
        "BPR・SCM・ERP・DXの違いを1文ずつ説明できるか。",
        "その施策が部分改善か全体変革かを判断できるか。",
      ],
      memoryHook: "改善の対象を見る。業務手順、供給網、基幹業務、ビジネスモデルは全部別。",
    },
    {
      title: "市場分析・競争戦略・数値目標",
      summary:
        "試験ではフレームワーク名の暗記だけでなく、『どの場面で使うのか』『数値目標と評価指標はどう違うのか』まで理解しているかが問われます。",
      bullets: [
        "STPは市場細分化→狙う市場の選定→自社の立ち位置決定、4Pはその後に打つ具体策です。",
        "KGIは最終目標、KPIは進捗確認の中間指標、CSFは成功の重要要因で、役割がそれぞれ異なります。",
        "自社の強みを活かす競争戦略では、価格競争・差別化・集中戦略などの方向性も関連づけて理解すると応用が利きます。",
      ],
      examAngles: [
        "STPと4Pの順序・役割を比べる設問",
        "KGI・KPI・CSFの意味と関係を日本語で説明させる設問",
        "市場シェアや優位性を踏まえた競争戦略の方向を選ぶ設問",
      ],
      commonTraps: [
        "4Pを市場選定のフレームワークだと思い込む。",
        "KPIを最終ゴール、KGIを途中経過と逆に覚える。",
        "強みを活かす話なのに、外部環境だけで判断してしまう。",
      ],
      example: "若年層に絞って低価格サブスクを出すなら、若年層を選ぶのがターゲティング、低価格は4PのPrice、継続率80%はKPI、会員10万人達成はKGIです。",
      quickCheck: [
        "STPと4Pの違いを順番込みで説明できるか。",
        "KGI・KPI・CSFを1つの施策例に当てはめられるか。",
      ],
      memoryHook: "誰に売るかがSTP、どう売るかが4P、どこまで届いたかがKPI/KGI。",
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
      examAngles: [
        "管理手法ごとに『何を管理するか』を問う設問",
        "インシデント管理と問題管理の役割差を選ばせる設問",
        "SLA・監査・運用・開発のような立場の違いを問う設問",
      ],
      commonTraps: [
        "WBSを役割分担表、ガントチャートを依存関係図と混同する。",
        "障害発生時に最初から原因究明へ進んでしまう。",
        "監査人を開発担当者の一種だと思ってしまう。",
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
      examAngles: [
        "外部設計↔結合テストのような対応関係を答えさせる設問",
        "ウォーターフォールとアジャイルの向き不向きを比較する設問",
        "プロトタイプ、スプリント、リリース単位を絡めた設問",
      ],
      commonTraps: [
        "アジャイルでも計画が不要だと思い込む。",
        "V字モデルを単なるウォーターフォールの別名として雑に覚える。",
        "受入テストとシステムテストの担当者を取り違える。",
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
      examAngles: [
        "規格番号と管理対象を組み合わせる設問",
        "LOC法とFP法の違いを対比させる設問",
        "システム化計画・要件定義・設計以降の境目を問う設問",
      ],
      commonTraps: [
        "27001と20000を『なんとなくISO』で片づけて用途を覚えない。",
        "FP法をソースコード行数ベースだと勘違いする。",
        "上流工程の作業にテストやマニュアル作成を紛れ込ませた選択肢に引っかかる。",
      ],
      example: "規格問題では『何を管理する規格か』、見積もり問題では『何を数えるか』、工程問題では『何を決める段階か』を先に決めると迷いにくくなります。",
      quickCheck: [
        "27001・20000・9001の用途を即答できるか。",
        "FP法が機能量ベースだと説明できるか。",
      ],
      memoryHook: "規格は『何を管理するか』、見積もりは『何を数えるか』を確認する。",
    },
    {
      title: "プロジェクト管理の定番論点",
      summary:
        "スケジュール・コスト・品質・リスクの管理は、ITパスポートでも定番の出題領域です。公式よりも『管理目的』を理解すると対応しやすくなります。",
      bullets: [
        "クリティカルパスは最も所要時間が長い経路で、遅れると全体日程が遅れます。",
        "リスク対応は回避・低減・移転・受容の違いを、何をするかで区別します。",
        "レビューは成果物の欠陥を早期に見つける静的な確認、テストは実行して確認する動的な確認です。",
      ],
      examAngles: [
        "クリティカルパス上の遅延影響を問う設問",
        "回避・低減・移転・受容の具体例を選ばせる設問",
        "レビューとテストの違いを、実行有無と目的で問う設問",
      ],
      commonTraps: [
        "最もコストが高い経路をクリティカルパスだと思い込む。",
        "保険加入を低減と答えてしまう。",
        "レビューとテストをどちらも『品質確認』として雑に覚える。",
      ],
      example: "保険加入は移転、危険な機能を取りやめるのは回避、二重化で障害確率を下げるのは低減というように、行動レベルで言い換えると覚えやすくなります。",
      quickCheck: [
        "クリティカルパスを『最長経路』と言えるか。",
        "レビューとテストの違いを説明できるか。",
      ],
      memoryHook: "遅延はクリティカルパス、未然防止はレビュー、動作確認はテスト。",
    },
    {
      title: "運用・統制・事業継続",
      summary:
        "障害対応、変更管理、内部統制、BCPは、運用開始後にサービスを安定して続けるための知識として出題されます。",
      bullets: [
        "BCPは災害や障害時の事業継続と早期復旧の計画で、RTOは復旧目標時間、RPOは許容できるデータ損失時点です。",
        "内部統制は業務の有効性・効率性、財務報告の信頼性、法令遵守、資産保全を支えます。",
        "構成管理・変更管理・監視・バックアップは、サービス品質を落とさないための運用の土台です。",
      ],
      examAngles: [
        "BCP・RTO・RPOをセットで区別させる設問",
        "内部統制の4目的と具体例を結びつける設問",
        "変更管理・構成管理・問題管理の役割差を問う設問",
      ],
      commonTraps: [
        "RTOとRPOをどちらも『復旧時間』だと誤認する。",
        "内部統制を監査そのものと同一視する。",
        "変更管理を問い合わせ管理や障害復旧と混同する。",
      ],
      example: "大規模障害が起きても受注業務を4時間以内に復旧する、と決めるならBCPとRTOの考え方が必要です。変更管理が甘いと、復旧したはずのサービスが別の変更で再び不安定になります。",
      quickCheck: [
        "BCPの目的を『継続と早期復旧』と言えるか。",
        "内部統制の4目的を1つでも具体例で説明できるか。",
      ],
      memoryHook: "運用は止めない工夫、統制は暴走させない工夫、BCPは非常時でも続ける工夫。",
    },
    {
      title: "サービスマネジメントと保守運用の実務感覚",
      summary:
        "試験では開発後の世界、つまり運用・保守・サービス提供の考え方もよく問われます。『日々の安定提供をどう守るか』という視点で整理すると理解しやすいです。",
      bullets: [
        "サービスデスクは利用者の問い合わせ窓口、変更管理は変更の安全性確保、構成管理は資産や設定の把握という役割分担です。",
        "可用性管理は止まりにくさ、キャパシティ管理は性能余力、バックアップは復旧可能性の確保に関わります。",
        "SLAは外部への約束、運用設計や監視はその約束を守るための内部活動と考えるとつながります。",
      ],
      examAngles: [
        "問い合わせ対応・障害対応・変更対応の担当や目的を見分ける設問",
        "可用性・性能・保守性のどれを高める施策かを問う設問",
        "SLAと運用管理活動の関係を説明させる設問",
      ],
      commonTraps: [
        "サービスデスクを障害の根本原因分析部門だと考える。",
        "バックアップさえあれば可用性が高い、と短絡的に判断する。",
        "SLAを単なる技術仕様書として扱う。",
      ],
      example: "『問い合わせ窓口を一本化する』はサービスデスク、『週末に本番設定変更を審査して実施する』は変更管理、『稼働率99.9%を約束する』はSLAと整理できます。",
      quickCheck: [
        "サービスデスク・変更管理・構成管理の違いを言えるか。",
        "可用性向上策と性能向上策を区別できるか。",
      ],
      memoryHook: "利用者対応、変更統制、資産把握、品質約束は全部別の役割。",
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
      examAngles: [
        "2進数変換や論理回路の基礎計算を行う設問",
        "機器や装置の役割を層や用途で見分ける設問",
        "CPU性能・記憶容量・転送速度の単位を区別させる設問",
      ],
      commonTraps: [
        "bitとbyteの変換を忘れて8倍の誤差を出す。",
        "ルータとスイッチの役割を『つなぐ機械』として一括りにしてしまう。",
        "クロック周波数を記憶容量の指標だと誤解する。",
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
      examAngles: [
        "CIAのどれを守る対策かを答えさせる設問",
        "公開鍵暗号・ハッシュ・電子署名・多要素認証を区別する設問",
        "DoS・XSS・SQLインジェクションなど攻撃と対策を対応させる設問",
      ],
      commonTraps: [
        "暗号化と認証をどちらも『セキュリティ対策』として同じに扱う。",
        "電子署名を機密性確保の技術と誤解する。",
        "多要素認証を『パスワードを2回入れること』だと思ってしまう。",
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
      examAngles: [
        "通信速度と容量から所要時間を求める設問",
        "稼働率や平均故障間隔など、単位整理が必要な設問",
        "答えの妥当性を桁感で見抜かせる設問",
      ],
      commonTraps: [
        "MbpsをそのままMB/sとして扱う。",
        "ミリ秒や時間の単位換算を省略する。",
        "式を途中で書かないまま暗算し、見直せなくなる。",
      ],
      example: "転送速度の問題なら、まずMbpsかMB/sかを見て単位をそろえてから計算すれば、8倍違いのミスを防げます。",
      quickCheck: [
        "単位をそろえてから式を書く習慣があるか。",
        "答えが大きすぎる・小さすぎると感じたら見直せるか。",
      ],
      memoryHook: "数値は『書き出す→単位をそろえる→式→桁感チェック』で固定する。",
    },
    {
      title: "ネットワーク・プロトコル・クラウド",
      summary:
        "ネットワーク分野は機器名だけでなく、プロトコルがどの場面で使われるかまで分かると一気に解きやすくなります。クラウドも提供範囲の違いが定番です。",
      bullets: [
        "HTTP/HTTPSはWeb、SMTPはメール送信、DNSは名前解決、DHCPはIPアドレス自動配布と、役割で覚えます。",
        "VPNは公衆回線上に安全な仮想専用線を作る技術で、リモートアクセスや拠点間接続に使われます。",
        "IaaS・PaaS・SaaSは、利用者がどこまで管理するかで区別すると理解しやすいです。",
      ],
      examAngles: [
        "プロトコル名と用途を対応させる設問",
        "クラウドのサービスモデルごとの管理範囲を問う設問",
        "サブネットやIPアドレスに関する基礎知識を問う設問",
      ],
      commonTraps: [
        "DNSとDHCPをどちらも『ネットワーク設定』として混同する。",
        "VPNを単なる無線LANだと思ってしまう。",
        "SaaSでも利用者がOS管理を行うと勘違いする。",
      ],
      example: "『サーバ証明書でWeb通信を暗号化』はHTTPS、『名前をIPアドレスへ変換』はDNS、『仮想マシン提供』はIaaS、というように用途ベースで判別します。",
      quickCheck: [
        "DNS・DHCP・HTTPS・VPNの役割を1行ずつ言えるか。",
        "IaaSとSaaSの違いを利用者の管理範囲で説明できるか。",
      ],
      memoryHook: "通信は『何をするプロトコルか』、クラウドは『どこまで借りるか』で覚える。",
    },
    {
      title: "データベース・認証・最新技術",
      summary:
        "データ管理とセキュリティはITパスポートで毎回のように顔を出す重要分野です。最近よく見るAIやIoTも、基本概念として整理しておくと安心です。",
      bullets: [
        "主キーは一意かつNULL不可、外部キーは他テーブルとの関連付け、正規化は冗長性や更新不整合の削減を目的にします。",
        "公開鍵暗号、電子署名、多要素認証、ハッシュ化は『暗号化なのか、本人確認なのか、改ざん検知なのか』で区別しましょう。",
        "AI・機械学習・IoTは、データ収集→分析→活用の流れと実務例を結びつけると、用語問題に対応しやすくなります。",
      ],
      examAngles: [
        "主キー・外部キー・正規化の目的を問う設問",
        "電子署名・ハッシュ・暗号の役割を比較する設問",
        "AI・IoT・クラウド・DBを組み合わせた実務事例の設問",
      ],
      commonTraps: [
        "外部キーを『外部公開用の列』のように誤解する。",
        "ハッシュ化を復号できる暗号だと思う。",
        "機械学習を『人がルールを書き切る方式』として説明してしまう。",
      ],
      example: "パスワード保管にはハッシュ化、Webサイトの本人確認には認証、文書の改ざん検知には電子署名、家電の接続にはIoTというように、目的ごとに技術を割り当てます。",
      quickCheck: [
        "主キーと外部キーの違いを説明できるか。",
        "暗号・署名・認証・ハッシュの役割を区別できるか。",
      ],
      memoryHook: "DBは『表の関係』、認証は『誰か確認』、署名は『改ざん検知』、AI/IoTは『データ活用』。",
    },
    {
      title: "OS・仮想化・システム構成の整理",
      summary:
        "テクノロジ系では『この技術は何を便利にするのか』を理解すると、単語の暗記だけよりずっと解きやすくなります。OS・仮想化・冗長化は特に役割整理が重要です。",
      bullets: [
        "OSはハードウェア資源管理とアプリ実行の土台、ミドルウェアはOSとアプリの中間で共通機能を提供します。",
        "仮想化は1台の物理資源を論理的に分割・集約して利用効率を高める考え方で、クラウド基盤ともつながります。",
        "RAID、バックアップ、冗長化はどれも『止まりにくさ・失いにくさ』に関係しますが、故障対策・復旧対策・可用性向上で役割が異なります。",
      ],
      examAngles: [
        "OS・ミドルウェア・アプリケーションの役割差を問う設問",
        "仮想化やコンテナの目的を問う設問",
        "RAID・バックアップ・二重化の違いを比較する設問",
      ],
      commonTraps: [
        "RAIDがあるからバックアップ不要だと考える。",
        "仮想化を単なるクラウドの言い換えだと思う。",
        "OSとDBMSやWebサーバを同じ層のものとして混同する。",
      ],
      example: "1台の物理サーバ上で複数の仮想サーバを動かすのは仮想化、DBMSを動かす土台はOS、障害時に業務継続性を高めるのは冗長化というように整理します。",
      quickCheck: [
        "OS・ミドルウェア・アプリの役割を言い分けられるか。",
        "RAIDとバックアップの違いを説明できるか。",
      ],
      memoryHook: "動かす土台がOS、共通機能がミドル、使う目的がアプリ、止まりにくくするのが冗長化。",
    },
  ],
};

const coverageFocusMap: Record<Category, CoverageFocus[]> = {
  strategy: [
    {
      title: "会計・指標の計算問題",
      whyItMatters: "既存の問題は概念中心で、計算や財務指標の比較にやや薄さがありました。試験ではROE、利益、費用構造を問う設問が出やすいです。",
      topics: ["損益分岐点", "ROE/ROA", "売上総利益・営業利益", "固定費と変動費"],
      studyActions: [
        "式を暗記するだけでなく、分母が何を意味するかを声に出して確認する。",
        "数値がなくても『利益ゼロ』『資本に対する効率』のように日本語へ言い換える。",
      ],
    },
    {
      title: "法務・ガバナンスの切り分け",
      whyItMatters: "著作権と個人情報はある程度カバー済みですが、営業秘密、コンプライアンス、CSR、内部統制とのつながりは薄めでした。",
      topics: ["営業秘密3要件", "コンプライアンス", "CSR", "コーポレートガバナンス"],
      studyActions: [
        "各法制度について『何を守るか』『誰に義務があるか』で比較表を作る。",
        "似た用語を1問1答ではなく、表形式で横比較して覚える。",
      ],
    },
    {
      title: "全体最適を扱う経営手法",
      whyItMatters: "CRMやSCMはあるものの、ERP、BPR、KPI/KGI、DXなど実務寄りの重要テーマが不足していました。",
      topics: ["ERP", "BPR", "DX", "KPI/KGI/CSF"],
      studyActions: [
        "『顧客』『供給網』『基幹業務』『変革』のように対象範囲で見分ける。",
        "具体例を自分の職場や架空の会社に当てはめて分類する。",
      ],
    },
  ],
  management: [
    {
      title: "テストとレビューの体系化",
      whyItMatters: "V字モデルはありましたが、レビュー・単体/結合/システム/受入テストの整理が不十分でした。",
      topics: ["デザインレビュー", "単体テスト", "結合テスト", "受入テスト"],
      studyActions: [
        "『誰が何を確認するか』の軸で一覧化する。",
        "静的レビューと動的テストを混同しないよう、実行の有無で区別する。",
      ],
    },
    {
      title: "運用・継続・統制",
      whyItMatters: "障害復旧の基礎はある一方で、BCP、RTO/RPO、内部統制、変更管理など継続運用の重要論点がまだ薄い状態でした。",
      topics: ["BCP", "RTO/RPO", "内部統制", "変更管理"],
      studyActions: [
        "災害対策・日常運用・監査の3つに分けて学ぶ。",
        "『止めない』『元に戻せる』『証跡を残す』観点で各手法を説明する。",
      ],
    },
    {
      title: "リスクとプロジェクト管理",
      whyItMatters: "WBSやクリティカルパスはありますが、リスク対応・品質管理・進捗遅延の考え方をもう一段深く押さえる必要があります。",
      topics: ["リスク回避/低減/移転/受容", "クリティカルパス", "品質管理", "SLA"],
      studyActions: [
        "各対応策を『何をする行動か』で覚える。",
        "作業が遅れたときに全体日程へ影響するか、クリティカルパスで確認する癖をつける。",
      ],
    },
  ],
  technology: [
    {
      title: "プロトコルとネットワークの幅",
      whyItMatters: "ルータやサブネットはあるものの、DNS、DHCP、HTTP/SMTP、NAT、無線LANなどの周辺知識が不足していました。",
      topics: ["DNS", "DHCP", "HTTP/HTTPS", "VPN"],
      studyActions: [
        "各プロトコルを『何を解決するためのものか』で覚える。",
        "通信の流れを図にして、名前解決→接続→暗号化の順に整理する。",
      ],
    },
    {
      title: "セキュリティの基本セット",
      whyItMatters: "DoSやXSSはありますが、認証、ハッシュ、電子署名、多要素認証など守りの土台知識が薄めでした。",
      topics: ["多要素認証", "ハッシュ化", "公開鍵暗号", "電子署名"],
      studyActions: [
        "機密性・完全性・可用性のどれに効くかで技術を分類する。",
        "『暗号化』『認証』『改ざん検知』を別物として整理する。",
      ],
    },
    {
      title: "ハードウェア・DB・論理思考",
      whyItMatters: "2進数の導入はありますが、論理演算、メモリ階層、主キー/外部キー、SQLの周辺知識はまだ伸ばせます。",
      topics: ["AND/OR/NOT", "キャッシュと主記憶", "主キー/外部キー", "正規化"],
      studyActions: [
        "数表や真理値表を手で書いて慣れる。",
        "データベースは『一意性』『関連付け』『重複削減』の目的で整理する。",
      ],
    },
  ],
};

const readinessAuditMap: Record<Category, ReadinessAudit[]> = {
  strategy: [
    {
      area: "経営戦略とフレームワーク",
      currentCoverage: "理念・SWOT・PPM・BSC・PDCAの基礎は押さえられており、主要フレームワークの見分けはしやすい状態です。",
      thinSpots: [
        "競争戦略の選び方とフレームワーク同士の接続が薄く、問題文の場面設定に落とし込む練習が不足していました。",
        "KPI・KGI・CSF・4P・STPを1つの施策ストーリーにまとめる学習導線が少なめでした。",
      ],
      upgradeAdded: [
        "市場分析・競争戦略・数値目標のレッスンを追加し、STP→4P→KPI/KGIの流れを学べるようにしました。",
        "各フレームワークを『何の場面で使うか』という試験視点で横断整理しました。",
      ],
      examPriority: "High",
    },
    {
      area: "法務・ガバナンス",
      currentCoverage: "個人情報と著作権は扱えていましたが、法務分野全体では守る対象の比較が十分ではありませんでした。",
      thinSpots: [
        "営業秘密、CSR、コーポレートガバナンス、内部統制の関係が断片的でした。",
        "『誰を守るか』『何を守るか』の切り分け練習が少なく、ひっかけに弱い構成でした。",
      ],
      upgradeAdded: [
        "法務・知的財産・企業責任のレッスンを厚くし、保護対象と制度目的を並べて整理できるようにしました。",
        "ガバナンス系の追加フォーカスで、法令・企業責任・統制の違いを復習しやすくしました。",
      ],
      examPriority: "High",
    },
    {
      area: "会計・DX・全体最適",
      currentCoverage: "損益分岐点やCRM/SCMはあったものの、会計指標とDX・ERP・BPRの広がりに偏りがありました。",
      thinSpots: [
        "財務指標の比較問題、利益段階、全体最適を問う経営手法の選び分けが不足していました。",
        "DXを単なるIT化と見分けるための実務ケースが少なめでした。",
      ],
      upgradeAdded: [
        "会計・収益性・経営指標、業務改善・DX・全体最適のレッスンを追加済みです。",
        "ROE/ROAやERP/BPR/DXの違いをケースベースで確認できる深掘りモジュールを追加しました。",
      ],
      examPriority: "High",
    },
  ],
  management: [
    {
      area: "開発モデルとテスト体系",
      currentCoverage: "WBS、V字モデル、アジャイルなど主要語句は揃っていました。",
      thinSpots: [
        "レビュー、単体・結合・システム・受入テストの体系化が弱く、担当者と目的の比較が不足していました。",
        "ウォーターフォールとアジャイルの向き不向きを状況で判断する練習が少なめでした。",
      ],
      upgradeAdded: [
        "開発モデルの比較とテスト/レビュー整理の導線を強化し、工程対応を繰り返し確認できる構成にしました。",
        "深掘りモジュールで『誰が何を確認するか』を本番向けに整理しました。",
      ],
      examPriority: "High",
    },
    {
      area: "プロジェクト管理",
      currentCoverage: "WBS、ガントチャート、クリティカルパス、SLAなど定番論点は一通りありました。",
      thinSpots: [
        "リスク対応、品質管理、EVMS的な進捗感覚など『管理の意味』まで踏み込む説明が薄めでした。",
        "レビューとテストの違い、遅延影響の読み取りが単発で終わりがちでした。",
      ],
      upgradeAdded: [
        "プロジェクト管理の定番論点レッスンを追加し、最長経路・品質確認・リスク対応をまとめて復習できるようにしました。",
        "追加問題でレビュー/受入テスト/リスク判断の瞬発力も補強しました。",
      ],
      examPriority: "High",
    },
    {
      area: "運用・統制・事業継続",
      currentCoverage: "インシデント管理や監査はあった一方、運用継続性を支える知識は厚みに差がありました。",
      thinSpots: [
        "BCP、RTO/RPO、変更管理、内部統制、サービスデスクなど運用保守分野が不足していました。",
        "『障害対応』『変更統制』『監査』『継続計画』の役割差を横断比較する材料が少なめでした。",
      ],
      upgradeAdded: [
        "運用・統制・事業継続、サービスマネジメントと保守運用の実務感覚を追加しました。",
        "災害時と平常時の管理論点を分けて学べる構成へ拡張しました。",
      ],
      examPriority: "High",
    },
  ],
  technology: [
    {
      area: "ネットワークとプロトコル",
      currentCoverage: "ルータ、HTTPS、IaaS、サブネットなど主要キーワードは入っていました。",
      thinSpots: [
        "DNS、DHCP、NAT、VPN、無線LANなど周辺定番をまとめて整理する流れが不足していました。",
        "機器・プロトコル・サービスモデルを同じ場面図で結びつける学習が薄めでした。",
      ],
      upgradeAdded: [
        "ネットワーク・プロトコル・クラウドのレッスンを追加し、用途と管理範囲で見分ける導線を作りました。",
        "新しい確認問題でDNSや多要素認証など頻出周辺テーマも補いました。",
      ],
      examPriority: "High",
    },
    {
      area: "セキュリティ基礎",
      currentCoverage: "公開鍵暗号やHTTPSの基礎はありましたが、守る目的別の整理が十分ではありませんでした。",
      thinSpots: [
        "ハッシュ、電子署名、多要素認証、攻撃と対策の対応関係が薄く、暗号化との違いが曖昧になりやすい状態でした。",
        "CIAと技術要素を対応づける復習材料が少なめでした。",
      ],
      upgradeAdded: [
        "セキュリティとシステム基礎、データベース・認証・最新技術のレッスンを追加しました。",
        "暗号・認証・認可・改ざん検知を区別する深掘りモジュールを追加しました。",
      ],
      examPriority: "High",
    },
    {
      area: "計算・DB・システム構成",
      currentCoverage: "2進数、RAID、主キーなどは学べる一方、計算手順やDB設計の背景説明に伸びしろがありました。",
      thinSpots: [
        "論理演算、単位換算、正規化、外部キー、OS/ミドルウェア/仮想化の比較が不足していました。",
        "公式を覚えるだけでなく、なぜその答えになるかを説明する練習が薄めでした。",
      ],
      upgradeAdded: [
        "学習を伸ばす計算手順、OS・仮想化・システム構成の整理を追加しました。",
        "DBとシステム構成を目的ベースで確認できるチェック項目を増やしました。",
      ],
      examPriority: "High",
    },
  ],
};

const deepDiveModulesMap: Record<Category, DeepDiveModule[]> = {
  strategy: [
    {
      title: "会計指標を一気につなぐ",
      whyImportant: "ROE・ROA・利益率は単独暗記だと混ざりやすく、分母の違いを理解しているかが本番でよく問われます。",
      mustKnow: [
        "ROE = 当期純利益 ÷ 自己資本 × 100",
        "ROA = 利益 ÷ 総資産 × 100。自己資本ではなく会社全体の資産効率を見る指標です。",
        "売上総利益→営業利益→経常利益→当期純利益の順に、差し引く費用や損益の範囲が広がります。",
      ],
      scenarioDrill: "『売上は増えたが販管費も増えた』という場面では、売上総利益だけでなく営業利益がどう変わるかを確認すると、利益段階の違いが整理できます。",
      finalCheck: [
        "分母が自己資本か総資産かを即答できるか。",
        "利益段階を上から順に説明できるか。",
      ],
    },
    {
      title: "マーケティングをストーリーで覚える",
      whyImportant: "STP、4P、KPI/KGIは別々に覚えるより、1つの施策の流れに載せると圧倒的に忘れにくくなります。",
      mustKnow: [
        "STPは『誰に売るか』を決める流れ、4Pは『どう売るか』を決める施策です。",
        "KGIは最終到達点、KPIは途中の進捗計測、CSFは成功の鍵です。",
        "CRMは顧客との関係強化、SCMは供給網の最適化、ERPは基幹業務の統合です。",
      ],
      scenarioDrill: "『学生向けに価格を抑えた新サービスをSNS中心で拡販し、3か月継続率をKPIに置く』という文を見たら、ターゲティング・Price・Promotion・KPIの要素に分解してみましょう。",
      finalCheck: [
        "STPの後に4Pが来る理由を説明できるか。",
        "CRM/SCM/ERPを対象範囲で見分けられるか。",
      ],
    },
    {
      title: "法務を保護対象で切り分ける",
      whyImportant: "法務は用語だけ追うと混ざりやすく、『何を守る制度か』で整理できる人が強い分野です。",
      mustKnow: [
        "著作権は表現された著作物を守り、アイデアや言語そのものは通常守りません。",
        "営業秘密は秘密管理性・有用性・非公知性の3要件です。",
        "個人情報、コンプライアンス、CSR、ガバナンスは、法律・倫理・統制の観点が少しずつ異なります。",
      ],
      scenarioDrill: "『顧客名簿の持ち出し』『新製品ロゴの模倣』『社内ルール違反の放置』を見たとき、個人情報・商標/不正競争・コンプライアンスのどれが中心かを判定してみましょう。",
      finalCheck: [
        "営業秘密の3要件を言えるか。",
        "著作権と営業秘密の違いを保護対象で説明できるか。",
      ],
    },
  ],
  management: [
    {
      title: "テスト工程を担当者込みで整理する",
      whyImportant: "V字モデルは暗記しやすい反面、テストの目的と担当者まで意識しないと選択肢で迷いやすくなります。",
      mustKnow: [
        "単体テストは詳細設計に対応し、モジュール単位の確認です。",
        "結合テストは外部設計に対応し、モジュール間の連携やインタフェースを確認します。",
        "受入テストは利用者側視点で、業務要件を満たすかを最終確認します。",
      ],
      scenarioDrill: "『発注担当者が実業務シナリオで確認する』なら受入テスト、『プログラム部品を組み合わせて確認する』なら結合テスト、と場面から逆引きできるようにしましょう。",
      finalCheck: [
        "結合テストに対応する上流工程を即答できるか。",
        "レビューとテストの違いを実行有無で説明できるか。",
      ],
    },
    {
      title: "リスク対応を行動で覚える",
      whyImportant: "回避・低減・移転・受容は日本語だけだと似て見えるため、具体的な行動に変換できることが重要です。",
      mustKnow: [
        "回避は危険要因そのものをなくすこと、低減は起こりにくくすることです。",
        "移転は保険や外部委託などで影響を他へ分散すること、受容は対策コストと比較して受け入れることです。",
        "クリティカルパスは遅延が全体日程へ直撃する最長経路です。",
      ],
      scenarioDrill: "『障害が怖いので新機能を見送る』『バックアップ回線を用意する』『サイバー保険へ加入する』をそれぞれ回避・低減・移転に分類してみましょう。",
      finalCheck: [
        "保険加入を移転と即答できるか。",
        "最長経路が遅れると何が起きるか説明できるか。",
      ],
    },
    {
      title: "運用・統制・BCPを平常時と非常時で分ける",
      whyImportant: "運用保守は用語が多いため、『普段の安定運用』と『非常時の継続』に分けると一気に整理しやすくなります。",
      mustKnow: [
        "インシデント管理は早期復旧、問題管理は再発防止、変更管理は安全な変更統制です。",
        "BCPは事業継続計画、RTOは復旧目標時間、RPOは許容データ損失時点です。",
        "内部統制は業務の有効性・効率性、財務報告の信頼性、法令遵守、資産保全を支えます。",
      ],
      scenarioDrill: "『災害後4時間以内に受注再開』『本番変更は事前審査』『問い合わせ窓口を一本化』を見て、BCP/RTO・変更管理・サービスデスクに切り分けましょう。",
      finalCheck: [
        "RTOとRPOを言い分けられるか。",
        "変更管理とインシデント管理の違いを説明できるか。",
      ],
    },
  ],
  technology: [
    {
      title: "ネットワークを通信の流れで覚える",
      whyImportant: "DNS、DHCP、HTTPS、VPNは単体暗記より、接続の流れに並べる方が本番で迷いません。",
      mustKnow: [
        "DNSは名前解決、DHCPはIPアドレス配布、HTTPSはWeb通信の暗号化です。",
        "VPNは公衆網上に安全な仮想専用線を作る技術です。",
        "ルータは第3層で経路制御し、L2スイッチは同一ネットワーク内のフレーム転送を担います。",
      ],
      scenarioDrill: "『URLを入力してから安全にWebページを開くまで』を、DNS→IP取得済み確認→HTTPS通信確立の順で口頭説明してみましょう。",
      finalCheck: [
        "DNSとDHCPを混同せず説明できるか。",
        "VPNの用途をリモートアクセスで説明できるか。",
      ],
    },
    {
      title: "セキュリティ技術を守る目的で分類する",
      whyImportant: "暗号化・ハッシュ・電子署名・多要素認証は頻出ですが、目的を取り違えると一気に失点しやすいです。",
      mustKnow: [
        "暗号化は内容秘匿、ハッシュは改ざん検知や照合、電子署名は本人性と完全性の確認に使います。",
        "多要素認証は知識・所持・生体など異なる要素を組み合わせる認証です。",
        "機密性・完全性・可用性のどれを高める技術かを意識すると整理しやすくなります。",
      ],
      scenarioDrill: "『保存パスワード』『送信文書の改ざん確認』『ログイン時のスマホ確認コード』を見て、ハッシュ・電子署名/完全性・多要素認証へ割り当てましょう。",
      finalCheck: [
        "電子署名を機密性対策と誤認していないか。",
        "多要素認証の『異なる要素』を説明できるか。",
      ],
    },
    {
      title: "計算とDBを手順で固める",
      whyImportant: "計算問題とDB問題は、正しい手順を固定するだけで得点が安定しやすい領域です。",
      mustKnow: [
        "2進数変換では桁の重みを書き、通信計算ではbit/byteと秒の単位をそろえます。",
        "主キーは一意でNULL不可、外部キーは表同士の関連付けです。",
        "RAIDは故障対策、バックアップは消失後の復旧対策で、役割が同じではありません。",
      ],
      scenarioDrill: "『500MBのファイルを100Mbps回線で送る』問題では、まずbyteをbitへそろえるか、MB/s換算するかを決めてから計算しましょう。DB問題では、顧客テーブルと注文テーブルの関係を外部キーで表せるか考えます。",
      finalCheck: [
        "bit/byte換算を省略していないか。",
        "主キーと外部キーを役割で言い分けられるか。",
      ],
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
  const coverageFocuses = coverageFocusMap[category as Category] || [];
  const readinessAudits = readinessAuditMap[category as Category] || [];
  const deepDiveModules = deepDiveModulesMap[category as Category] || [];
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
              <div className="mt-4 rounded-xl border border-emerald-200/80 bg-emerald-50/70 px-4 py-3 text-sm dark:border-emerald-400/20 dark:bg-emerald-500/10">
                <p className="font-semibold text-emerald-900 dark:text-emerald-100">試験で問われやすい角度</p>
                <ul className="mt-2 space-y-2 leading-relaxed text-emerald-900/80 dark:text-emerald-50">
                  {lesson.examAngles.map((angle) => (
                    <li key={angle} className="flex gap-2">
                      <span className="mt-0.5">→</span>
                      <span>{angle}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-4 rounded-xl border border-rose-200/80 bg-rose-50/70 px-4 py-3 text-sm dark:border-rose-400/20 dark:bg-rose-500/10">
                <p className="font-semibold text-rose-900 dark:text-rose-100">ひっかけ注意</p>
                <ul className="mt-2 space-y-2 leading-relaxed text-rose-900/80 dark:text-rose-50">
                  {lesson.commonTraps.map((trap) => (
                    <li key={trap} className="flex gap-2">
                      <span className="mt-0.5">!</span>
                      <span>{trap}</span>
                    </li>
                  ))}
                </ul>
              </div>
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

      <div className="mb-8 rounded-3xl border border-violet-200/70 bg-violet-50/70 p-6 shadow-sm dark:border-violet-400/20 dark:bg-violet-400/10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-violet-700 dark:text-violet-200">弱点になりやすい範囲を先回り</p>
            <h2 className="mt-2 text-2xl font-bold">{categoryLabel}の薄かった論点と、追加した学習テーマ</h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[var(--muted)]">
              既存コンテンツを見直し、出題範囲に対して相対的に薄かったテーマを整理しました。どこを重点的に復習すべきか、理由と学習アクションまで一緒に確認できます。
            </p>
          </div>
          <div className="rounded-2xl bg-white/70 px-4 py-3 text-sm shadow-sm dark:bg-black/10">
            <p className="text-xs text-[var(--muted)]">使いどころ</p>
            <p className="mt-1 font-medium">レッスン前の棚卸し / 試験前の総点検</p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 xl:grid-cols-3">
          {coverageFocuses.map((focus) => (
            <section
              key={focus.title}
              className="rounded-2xl border border-violet-200/70 bg-white/85 p-5 dark:border-violet-400/20 dark:bg-black/10"
            >
              <h3 className="font-semibold text-lg">{focus.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">{focus.whyItMatters}</p>
              <div className="mt-4">
                <p className="text-sm font-semibold text-violet-900 dark:text-violet-100">重点トピック</p>
                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  {focus.topics.map((topic) => (
                    <span key={topic} className="rounded-full bg-violet-100 px-3 py-1 font-medium text-violet-700 dark:bg-violet-500/10 dark:text-violet-100">{topic}</span>
                  ))}
                </div>
              </div>
              <div className="mt-4 rounded-xl border border-dashed border-violet-200/80 px-4 py-3 dark:border-violet-400/20">
                <p className="text-sm font-semibold">すすめる勉強アクション</p>
                <ul className="mt-2 space-y-2 text-sm leading-relaxed text-[var(--muted)]">
                  {focus.studyActions.map((action) => (
                    <li key={action} className="flex gap-2">
                      <span className="mt-0.5">→</span>
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          ))}
        </div>
      </div>

      <div className="mb-8 rounded-3xl border border-fuchsia-200/70 bg-fuchsia-50/70 p-6 shadow-sm dark:border-fuchsia-400/20 dark:bg-fuchsia-400/10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-fuchsia-700 dark:text-fuchsia-200">現状分析 → 補強ポイント</p>
            <h2 className="mt-2 text-2xl font-bold">{categoryLabel}の現行レッスン監査</h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[var(--muted)]">
              既存の出題とレッスンをもとに、どこまでカバーできていて、どこが薄かったかを試験視点で整理しました。追加した内容がどの弱点を埋めるのかまで一覧で確認できます。
            </p>
          </div>
          <div className="rounded-2xl bg-white/70 px-4 py-3 text-sm shadow-sm dark:bg-black/10">
            <p className="text-xs text-[var(--muted)]">見るポイント</p>
            <p className="mt-1 font-medium">今ある強み / 薄い論点 / 追加補強</p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 xl:grid-cols-3">
          {readinessAudits.map((audit) => (
            <section
              key={audit.area}
              className="rounded-2xl border border-fuchsia-200/70 bg-white/85 p-5 dark:border-fuchsia-400/20 dark:bg-black/10"
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-semibold text-lg">{audit.area}</h3>
                <span className="rounded-full bg-fuchsia-100 px-3 py-1 text-[11px] font-medium text-fuchsia-700 dark:bg-fuchsia-500/10 dark:text-fuchsia-100">{audit.examPriority}</span>
              </div>
              <div className="mt-4 rounded-xl border border-emerald-200/80 bg-emerald-50/70 px-4 py-3 text-sm dark:border-emerald-400/20 dark:bg-emerald-500/10">
                <p className="font-semibold text-emerald-900 dark:text-emerald-100">現在のカバー状況</p>
                <p className="mt-1 leading-relaxed text-emerald-900/80 dark:text-emerald-50">{audit.currentCoverage}</p>
              </div>
              <div className="mt-4 rounded-xl border border-rose-200/80 bg-rose-50/70 px-4 py-3 text-sm dark:border-rose-400/20 dark:bg-rose-500/10">
                <p className="font-semibold text-rose-900 dark:text-rose-100">薄かった点</p>
                <ul className="mt-2 space-y-2 leading-relaxed text-rose-900/80 dark:text-rose-50">
                  {audit.thinSpots.map((spot) => (
                    <li key={spot} className="flex gap-2">
                      <span className="mt-0.5">!</span>
                      <span>{spot}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-4 rounded-xl border border-dashed border-fuchsia-200/80 px-4 py-3 dark:border-fuchsia-400/20">
                <p className="text-sm font-semibold">今回追加した補強</p>
                <ul className="mt-2 space-y-2 text-sm leading-relaxed text-[var(--muted)]">
                  {audit.upgradeAdded.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-0.5">→</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          ))}
        </div>
      </div>

      <div className="mb-8 rounded-3xl border border-teal-200/70 bg-teal-50/70 p-6 shadow-sm dark:border-teal-400/20 dark:bg-teal-400/10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-teal-700 dark:text-teal-200">本番対応の深掘り</p>
            <h2 className="mt-2 text-2xl font-bold">{categoryLabel}の深掘りモジュール</h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[var(--muted)]">
              単語暗記で終わらせず、理由・場面・チェックポイントまで確認できるように、試験で差がつく論点をミニ講義形式で追加しました。
            </p>
          </div>
          <div className="rounded-2xl bg-white/70 px-4 py-3 text-sm shadow-sm dark:bg-black/10">
            <p className="text-xs text-[var(--muted)]">おすすめ</p>
            <p className="mt-1 font-medium">弱点1つにつき1モジュール集中</p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 xl:grid-cols-3">
          {deepDiveModules.map((module) => (
            <section
              key={module.title}
              className="rounded-2xl border border-teal-200/70 bg-white/85 p-5 dark:border-teal-400/20 dark:bg-black/10"
            >
              <h3 className="font-semibold text-lg">{module.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">{module.whyImportant}</p>
              <div className="mt-4 rounded-xl border border-teal-200/80 bg-teal-50/70 px-4 py-3 text-sm dark:border-teal-400/20 dark:bg-teal-500/10">
                <p className="font-semibold text-teal-900 dark:text-teal-100">絶対に押さえたいこと</p>
                <ul className="mt-2 space-y-2 leading-relaxed text-teal-900/80 dark:text-teal-50">
                  {module.mustKnow.map((point) => (
                    <li key={point} className="flex gap-2">
                      <span className="mt-0.5">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-4 rounded-xl border border-sky-200/70 bg-sky-50/80 px-4 py-3 text-sm dark:border-sky-400/20 dark:bg-sky-500/10">
                <p className="font-semibold text-sky-900 dark:text-sky-100">場面で確認する</p>
                <p className="mt-1 leading-relaxed text-sky-900/80 dark:text-sky-50">{module.scenarioDrill}</p>
              </div>
              <div className="mt-4 rounded-xl border border-dashed border-teal-200/80 px-4 py-3 dark:border-teal-400/20">
                <p className="text-sm font-semibold">仕上げチェック</p>
                <ul className="mt-2 space-y-2 text-sm leading-relaxed text-[var(--muted)]">
                  {module.finalCheck.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-0.5">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
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
