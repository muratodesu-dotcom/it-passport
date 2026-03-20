import { Category } from "@/lib/types";

export interface TermPair {
  term: string;
  description: string;
  category: Category;
}

export const termPairs: TermPair[] = [
  // ===== ストラテジ系 =====
  { term: "経営理念", description: "企業が目指す将来像や存在意義を示したもの", category: "strategy" },
  { term: "SWOT分析", description: "強み・弱み・機会・脅威で内部/外部環境を分析する手法", category: "strategy" },
  { term: "BSC", description: "財務・顧客・業務プロセス・学習と成長の4視点で評価する手法", category: "strategy" },
  { term: "損益分岐点", description: "売上高と総費用が等しくなり利益がゼロになる点", category: "strategy" },
  { term: "PDCAサイクル", description: "計画→実行→評価→改善を繰り返す継続的改善手法", category: "strategy" },
  { term: "PPM", description: "市場成長率と市場占有率で事業を花形・金のなる木等に分類する手法", category: "strategy" },
  { term: "CRM", description: "顧客との関係を管理・維持・強化するための手法", category: "strategy" },
  { term: "SCM", description: "原材料調達から消費者への販売までの流れを最適化する管理手法", category: "strategy" },
  { term: "ERP", description: "企業の経営資源を統合的に管理する計画・システム", category: "strategy" },
  { term: "ROE", description: "自己資本に対する当期純利益の割合を示す指標", category: "strategy" },
  { term: "コンプライアンス", description: "企業が法令や社会規範を遵守すること", category: "strategy" },
  { term: "SLA", description: "サービスの品質水準を数値で定めた合意文書", category: "strategy" },
  { term: "BPR", description: "業務プロセスを根本的に見直し再設計する手法", category: "strategy" },
  { term: "マーケティングミックス", description: "Product・Price・Place・Promotionの4Pで構成される戦略", category: "strategy" },
  { term: "著作権", description: "創作物の著作者に自動的に発生する知的財産権", category: "strategy" },
  { term: "個人情報保護法", description: "個人情報の適切な取扱いを事業者に義務付ける法律", category: "strategy" },

  // ===== マネジメント系 =====
  { term: "WBS", description: "プロジェクト作業を階層的に細分化した構成図", category: "management" },
  { term: "ガントチャート", description: "作業の開始日・終了日を横棒で示すスケジュール図", category: "management" },
  { term: "ITIL", description: "ITサービスマネジメントのベストプラクティス集", category: "management" },
  { term: "インシデント管理", description: "サービスへの障害発生時に迅速に復旧させるプロセス", category: "management" },
  { term: "問題管理", description: "インシデントの根本原因を特定し再発を防止するプロセス", category: "management" },
  { term: "アジャイル開発", description: "短い反復サイクルで段階的にソフトウェアを開発する手法", category: "management" },
  { term: "ウォーターフォールモデル", description: "要件定義から運用まで各工程を順番に進める開発モデル", category: "management" },
  { term: "単体テスト", description: "モジュール単位で動作を検証するテスト工程", category: "management" },
  { term: "結合テスト", description: "モジュール間のインターフェースを検証するテスト工程", category: "management" },
  { term: "BCP", description: "災害等の緊急事態でも事業を継続するための計画", category: "management" },
  { term: "RTO", description: "障害発生からシステム復旧までの目標時間", category: "management" },
  { term: "RPO", description: "障害時にどの時点までのデータを復旧するかの目標", category: "management" },
  { term: "構成管理", description: "IT資産のバージョンや変更履歴を管理するプロセス", category: "management" },
  { term: "SysMLテスト", description: "システム全体が要件を満たすか確認するテスト工程", category: "management" },

  // ===== テクノロジ系 =====
  { term: "OSI参照モデル", description: "ネットワーク通信を7つの階層に分けた標準モデル", category: "technology" },
  { term: "TCP/IP", description: "インターネットで使われる通信プロトコルの総称", category: "technology" },
  { term: "DNS", description: "ドメイン名をIPアドレスに変換するシステム", category: "technology" },
  { term: "DHCP", description: "ネットワーク上の機器にIPアドレスを自動割り当てする仕組み", category: "technology" },
  { term: "SQL", description: "リレーショナルデータベースを操作するための言語", category: "technology" },
  { term: "RAID", description: "複数のディスクを組み合わせて信頼性や性能を向上させる技術", category: "technology" },
  { term: "公開鍵暗号方式", description: "暗号化と復号に異なる鍵ペアを使う暗号方式", category: "technology" },
  { term: "ファイアウォール", description: "外部ネットワークからの不正アクセスを遮断する仕組み", category: "technology" },
  { term: "クラウドコンピューティング", description: "インターネット経由でITリソースをオンデマンドで利用する形態", category: "technology" },
  { term: "IoT", description: "あらゆるモノをインターネットに接続して情報交換する技術", category: "technology" },
  { term: "CPU", description: "プログラムの命令を解読・実行するコンピュータの中央処理装置", category: "technology" },
  { term: "フィッシング", description: "偽サイトに誘導して個人情報を騙し取る攻撃手法", category: "technology" },
  { term: "二進法", description: "0と1の2つの数字だけで数値を表現する記数法", category: "technology" },
  { term: "VPN", description: "公衆回線上に仮想的な専用ネットワークを構築する技術", category: "technology" },
  { term: "SaaS", description: "ソフトウェアをインターネット経由でサービスとして提供する形態", category: "technology" },
  { term: "デジタル署名", description: "送信者の本人確認とデータの改ざん検知を行う仕組み", category: "technology" },
];
