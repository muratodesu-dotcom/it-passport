import { Question } from "@/lib/types";

export const questions: Question[] = [
  // ===== ストラテジ系 (Strategy) =====
  {
    id: 1,
    category: "strategy",
    question: "企業の経営理念を説明したものとして、最も適切なものはどれか。",
    options: [
      "企業が目指す将来像や存在意義を示したもの",
      "企業の短期的な売上目標を定めたもの",
      "社員の給与体系を規定したもの",
      "製品の技術仕様を定義したもの",
    ],
    correctIndex: 0,
    explanation:
      "経営理念とは、企業が社会に対してどのような価値を提供し、どのような存在でありたいかという基本的な考え方や信念を示したものです。",
  },
  {
    id: 2,
    category: "strategy",
    question: "SWOT分析の「S」が表すものはどれか。",
    options: ["Strength（強み）", "Strategy（戦略）", "System（システム）", "Service（サービス）"],
    correctIndex: 0,
    explanation:
      "SWOT分析は、Strength（強み）、Weakness（弱み）、Opportunity（機会）、Threat（脅威）の頭文字で、企業の内部環境と外部環境を分析するフレームワークです。",
  },
  {
    id: 3,
    category: "strategy",
    question: "BSC（バランススコアカード）の4つの視点に含まれないものはどれか。",
    options: ["技術革新の視点", "財務の視点", "顧客の視点", "学習と成長の視点"],
    correctIndex: 0,
    explanation:
      "BSCの4つの視点は「財務」「顧客」「業務プロセス」「学習と成長」です。「技術革新の視点」は含まれません。",
  },
  {
    id: 4,
    category: "strategy",
    question: "損益分岐点について正しい説明はどれか。",
    options: [
      "売上高と総費用が等しくなり、利益がゼロになる点",
      "売上高が最大になる点",
      "利益が最大になる点",
      "固定費がゼロになる点",
    ],
    correctIndex: 0,
    explanation:
      "損益分岐点（BEP）とは、売上高と総費用（固定費＋変動費）が等しくなる点で、これを超えると利益が発生し、下回ると損失が発生します。",
  },
  {
    id: 5,
    category: "strategy",
    question: "PDCAサイクルの「C」は何を意味するか。",
    options: ["Check（評価）", "Control（制御）", "Create（創造）", "Change（変更）"],
    correctIndex: 0,
    explanation:
      "PDCAサイクルは Plan（計画）→ Do（実行）→ Check（評価）→ Act（改善）の4段階を繰り返すことで、継続的な改善を図る手法です。",
  },
  {
    id: 6,
    category: "strategy",
    question: "PPM（プロダクトポートフォリオマネジメント）で「花形」に分類される事業の特徴はどれか。",
    options: [
      "市場成長率が高く、市場占有率も高い",
      "市場成長率が低く、市場占有率が高い",
      "市場成長率が高く、市場占有率が低い",
      "市場成長率が低く、市場占有率も低い",
    ],
    correctIndex: 0,
    explanation:
      "PPMでは、市場成長率と市場占有率の高低で4象限に分類します。「花形（Star）」は両方が高い事業で、積極的な投資が必要です。",
  },
  {
    id: 7,
    category: "strategy",
    question: "個人情報保護法において、個人情報に該当しないものはどれか。",
    options: [
      "法人の所在地",
      "氏名と生年月日の組合せ",
      "顔写真",
      "マイナンバー",
    ],
    correctIndex: 0,
    explanation:
      "個人情報保護法における「個人情報」とは、生存する個人に関する情報で、特定の個人を識別できるものです。法人の所在地は個人情報に該当しません。",
  },
  {
    id: 8,
    category: "strategy",
    question: "著作権法で保護されないものはどれか。",
    options: [
      "プログラム言語そのもの",
      "小説",
      "音楽の楽曲",
      "コンピュータプログラム",
    ],
    correctIndex: 0,
    explanation:
      "著作権法ではプログラム言語、規約（プロトコル）、解法（アルゴリズム）は保護の対象外です。ただし、プログラム自体は著作物として保護されます。",
  },
  {
    id: 9,
    category: "strategy",
    question: "CRM（Customer Relationship Management）の目的として最も適切なものはどれか。",
    options: [
      "顧客との関係を管理し、顧客満足度と売上を向上させる",
      "社内のコスト削減を図る",
      "製品の品質管理を行う",
      "従業員の勤怠管理を行う",
    ],
    correctIndex: 0,
    explanation:
      "CRMは顧客との良好な関係を構築・維持・強化することで、顧客満足度の向上やリピート購入の促進を目指す経営手法です。",
  },
  {
    id: 10,
    category: "strategy",
    question: "SCM（サプライチェーンマネジメント）の説明として正しいものはどれか。",
    options: [
      "原材料の調達から消費者への販売までの一連の流れを最適化する手法",
      "社内の人事評価を効率化する手法",
      "ソフトウェア開発のプロセスを管理する手法",
      "顧客からの問い合わせを管理する手法",
    ],
    correctIndex: 0,
    explanation:
      "SCMは、調達・生産・流通・販売というサプライチェーン全体を統合的に管理し、全体最適を図る経営手法です。",
  },

  // ===== マネジメント系 (Management) =====
  {
    id: 11,
    category: "management",
    question: "プロジェクトマネジメントにおけるWBS（Work Breakdown Structure）の説明として正しいものはどれか。",
    options: [
      "プロジェクトの作業を階層的に分解した構成図",
      "プロジェクトの予算を管理するための表",
      "プロジェクトメンバーの役割分担表",
      "プロジェクトのリスク一覧表",
    ],
    correctIndex: 0,
    explanation:
      "WBSは、プロジェクト全体の作業を管理可能な単位に階層的に分解したもので、スコープの明確化やスケジュール管理の基盤となります。",
  },
  {
    id: 12,
    category: "management",
    question: "ITILにおけるインシデント管理の目的はどれか。",
    options: [
      "ITサービスを可能な限り迅速に復旧させること",
      "インシデントの根本原因を究明すること",
      "変更によるリスクを最小化すること",
      "サービスレベルを定義すること",
    ],
    correctIndex: 0,
    explanation:
      "インシデント管理は、ITサービスの中断や品質低下を迅速に復旧させることを目的とします。根本原因の究明は「問題管理」の役割です。",
  },
  {
    id: 13,
    category: "management",
    question: "システム開発のV字モデルで、結合テストに対応する上流工程はどれか。",
    options: ["外部設計（基本設計）", "要件定義", "内部設計（詳細設計）", "プログラミング"],
    correctIndex: 0,
    explanation:
      "V字モデルでは、要件定義→システムテスト、外部設計→結合テスト、内部設計→単体テストのように対応しています。",
  },
  {
    id: 14,
    category: "management",
    question: "アジャイル開発の特徴として最も適切なものはどれか。",
    options: [
      "短い反復期間で開発とリリースを繰り返す",
      "最初に全ての要件を確定してから開発を開始する",
      "テスト工程を省略して開発期間を短縮する",
      "ドキュメントを重視し、詳細な設計書を作成する",
    ],
    correctIndex: 0,
    explanation:
      "アジャイル開発は、短いイテレーション（反復）で動くソフトウェアを段階的に提供し、変化に柔軟に対応する開発手法です。",
  },
  {
    id: 15,
    category: "management",
    question: "情報セキュリティマネジメントシステム（ISMS）の国際規格はどれか。",
    options: ["ISO/IEC 27001", "ISO 9001", "ISO 14001", "ISO/IEC 20000"],
    correctIndex: 0,
    explanation:
      "ISO/IEC 27001は情報セキュリティマネジメントシステム（ISMS）の国際規格です。ISO 9001は品質、ISO 14001は環境、ISO/IEC 20000はITサービスマネジメントの規格です。",
  },
  {
    id: 16,
    category: "management",
    question: "ガントチャートの説明として正しいものはどれか。",
    options: [
      "作業の進捗状況を横棒グラフで時系列に表したもの",
      "作業間の依存関係をネットワーク図で表したもの",
      "データの流れを図式化したもの",
      "組織の階層構造を図で表したもの",
    ],
    correctIndex: 0,
    explanation:
      "ガントチャートは、横軸に時間、縦軸に作業項目を配置し、各作業の開始・終了時期と進捗状況を横棒で視覚的に表現する図です。",
  },
  {
    id: 17,
    category: "management",
    question: "システム監査の目的として最も適切なものはどれか。",
    options: [
      "情報システムの信頼性・安全性・効率性を独立した立場で評価すること",
      "情報システムの開発を代行すること",
      "情報システムの運用を代行すること",
      "情報システムのプログラミングの品質を保証すること",
    ],
    correctIndex: 0,
    explanation:
      "システム監査は、被監査部門から独立した立場のシステム監査人が、情報システムの信頼性・安全性・効率性を客観的に評価することを目的とします。",
  },
  {
    id: 18,
    category: "management",
    question: "SLA（Service Level Agreement）の説明として正しいものはどれか。",
    options: [
      "サービス提供者と利用者の間でサービス品質の水準を合意した文書",
      "システム開発の契約金額を定めた文書",
      "プロジェクトの工程表を記載した文書",
      "システムの技術仕様を定義した文書",
    ],
    correctIndex: 0,
    explanation:
      "SLAは、サービス提供者と利用者の間で、サービスの内容や品質水準（可用性、応答時間など）を明文化して合意する文書です。",
  },
  {
    id: 19,
    category: "management",
    question: "ファンクションポイント法の説明として正しいものはどれか。",
    options: [
      "ソフトウェアの機能の数と複雑さから開発規模を見積もる手法",
      "プログラムのソースコード行数から開発規模を見積もる手法",
      "過去のプロジェクトとの類似性から開発規模を見積もる手法",
      "開発者の経験と直感から開発規模を見積もる手法",
    ],
    correctIndex: 0,
    explanation:
      "ファンクションポイント法は、外部入力・外部出力・外部照会・内部論理ファイル・外部インタフェースファイルの5つの機能から規模を算出する手法です。",
  },
  {
    id: 20,
    category: "management",
    question: "共通フレーム2013において、システム化計画の立案で行う作業はどれか。",
    options: [
      "対象業務の分析とシステム化の方針を決定する",
      "プログラムの詳細設計を行う",
      "テストケースを作成する",
      "利用者マニュアルを作成する",
    ],
    correctIndex: 0,
    explanation:
      "システム化計画の立案では、現行業務の分析、システム化の目的・範囲の明確化、基本方針の策定などを行います。",
  },

  // ===== テクノロジ系 (Technology) =====
  {
    id: 21,
    category: "technology",
    question: "2進数の「1010」を10進数に変換すると何になるか。",
    options: ["10", "8", "12", "5"],
    correctIndex: 0,
    explanation:
      "2進数「1010」= 1×2³ + 0×2² + 1×2¹ + 0×2⁰ = 8 + 0 + 2 + 0 = 10 です。",
  },
  {
    id: 22,
    category: "technology",
    question: "OSI参照モデルの第3層（ネットワーク層）で動作する機器はどれか。",
    options: ["ルータ", "リピータ", "ハブ", "スイッチングハブ（レイヤ2）"],
    correctIndex: 0,
    explanation:
      "ルータはネットワーク層（第3層）で動作し、IPアドレスを使ってパケットの経路制御を行います。リピータとハブは第1層、L2スイッチは第2層で動作します。",
  },
  {
    id: 23,
    category: "technology",
    question: "SQLの「SELECT」文の機能として正しいものはどれか。",
    options: [
      "テーブルからデータを検索・取得する",
      "テーブルにデータを挿入する",
      "テーブルのデータを更新する",
      "テーブルを作成する",
    ],
    correctIndex: 0,
    explanation:
      "SELECT文はデータの検索・取得を行います。INSERT（挿入）、UPDATE（更新）、CREATE TABLE（テーブル作成）とは異なります。",
  },
  {
    id: 24,
    category: "technology",
    question: "HTTPSで使用される暗号化プロトコルはどれか。",
    options: ["TLS/SSL", "FTP", "SMTP", "DHCP"],
    correctIndex: 0,
    explanation:
      "HTTPSはHTTP通信をTLS（Transport Layer Security）/SSLで暗号化したプロトコルです。通信の盗聴やなりすましを防止します。",
  },
  {
    id: 25,
    category: "technology",
    question: "CPUのクロック周波数が高いほど、一般的にどうなるか。",
    options: [
      "処理速度が速くなる",
      "記憶容量が増える",
      "消費電力が減る",
      "画面解像度が上がる",
    ],
    correctIndex: 0,
    explanation:
      "クロック周波数はCPUが1秒間に処理できるサイクル数を表し、高いほど処理速度が一般的に速くなります。ただし、アーキテクチャなど他の要素も影響します。",
  },
  {
    id: 26,
    category: "technology",
    question: "RAID5の特徴として正しいものはどれか。",
    options: [
      "データとパリティを複数のディスクに分散して書き込む",
      "同じデータを2つのディスクに書き込む",
      "データをストライピングのみで書き込む",
      "1つのディスクにデータを順番に書き込む",
    ],
    correctIndex: 0,
    explanation:
      "RAID5はデータとパリティ（誤り訂正符号）を3台以上のディスクに分散して格納します。1台が故障してもデータを復元できます。",
  },
  {
    id: 27,
    category: "technology",
    question: "公開鍵暗号方式の説明として正しいものはどれか。",
    options: [
      "暗号化と復号で異なる鍵を使用する方式",
      "暗号化と復号で同じ鍵を使用する方式",
      "鍵を使用せずにデータを暗号化する方式",
      "パスワードのみでデータを暗号化する方式",
    ],
    correctIndex: 0,
    explanation:
      "公開鍵暗号方式は、公開鍵と秘密鍵のペアを使い、一方で暗号化し他方で復号します。RSAが代表的なアルゴリズムです。",
  },
  {
    id: 28,
    category: "technology",
    question: "クラウドサービスの「IaaS」が提供するものはどれか。",
    options: [
      "仮想マシンやストレージなどのインフラ",
      "アプリケーションの実行環境",
      "完成したアプリケーション",
      "データベースの設計サービス",
    ],
    correctIndex: 0,
    explanation:
      "IaaS（Infrastructure as a Service）は、仮想マシン、ストレージ、ネットワークなどのITインフラをサービスとして提供します。PaaSは実行環境、SaaSはアプリケーションを提供します。",
  },
  {
    id: 29,
    category: "technology",
    question: "IPアドレス「192.168.1.0/24」のサブネットマスクはどれか。",
    options: ["255.255.255.0", "255.255.0.0", "255.0.0.0", "255.255.255.128"],
    correctIndex: 0,
    explanation:
      "「/24」はサブネットマスクの先頭24ビットが1であることを意味し、255.255.255.0（11111111.11111111.11111111.00000000）となります。",
  },
  {
    id: 30,
    category: "technology",
    question: "関係データベースにおいて、主キーの条件として正しいものはどれか。",
    options: [
      "一意であり、NULLを含まないこと",
      "必ず数値型であること",
      "必ず自動採番であること",
      "外部キーと同じ値であること",
    ],
    correctIndex: 0,
    explanation:
      "主キー（Primary Key）はテーブル内の各行を一意に識別するもので、重複がなく（一意性）、NULL値を含まない（非NULL制約）ことが条件です。",
  },
];

export function getQuestionsByCategory(category: string): Question[] {
  if (category === "all") return questions;
  return questions.filter((q) => q.category === category);
}

export function shuffleQuestions(qs: Question[]): Question[] {
  const shuffled = [...qs];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
