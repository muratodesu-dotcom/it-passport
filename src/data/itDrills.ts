import { DrillDef, DrillQuestion } from "@/lib/drills";

// ITパスポートに特化した計算ドリル。正解は index 0 に置き、出題時にシャッフルする。
export const calcQuestions: DrillQuestion[] = [
  { id: "k1", prompt: "2進数 1010 を10進数にすると？", options: ["10", "12", "8", "5"], correctIndex: 0, explanation: "1010₂ = 8 + 0 + 2 + 0 = 10" },
  { id: "k2", prompt: "10進数の 13 を2進数で表すと？", options: ["1101", "1011", "1110", "1001"], correctIndex: 0, explanation: "13 = 8 + 4 + 1 = 1101₂" },
  { id: "k3", prompt: "16進数 1A を10進数にすると？", options: ["26", "16", "10", "32"], correctIndex: 0, explanation: "1A = 1×16 + 10 = 26" },
  { id: "k4", prompt: "2進数 1111 は10進数で？", options: ["15", "16", "7", "14"], correctIndex: 0, explanation: "8 + 4 + 2 + 1 = 15" },
  { id: "k5", prompt: "MTBF=80時間、MTTR=20時間 のときの稼働率は？", options: ["0.8", "0.2", "0.25", "0.95"], correctIndex: 0, explanation: "稼働率 = MTBF /(MTBF + MTTR) = 80 / 100 = 0.8" },
  { id: "k6", prompt: "稼働率 0.9 の装置を2台直列に接続したときの稼働率は？", options: ["0.81", "0.9", "0.99", "0.18"], correctIndex: 0, explanation: "直列は積。0.9 × 0.9 = 0.81" },
  { id: "k7", prompt: "稼働率 0.9 の装置を2台並列に接続したときの稼働率は？", options: ["0.99", "0.81", "0.9", "1.0"], correctIndex: 0, explanation: "並列は 1 −(1−0.9)² = 1 − 0.01 = 0.99" },
  { id: "k8", prompt: "100Mバイトのデータを 80Mbps の回線で転送する時間は（オーバーヘッド無視）？", options: ["10秒", "1.25秒", "8秒", "80秒"], correctIndex: 0, explanation: "100Mバイト = 800Mビット。800 / 80 = 10秒（bitとbyteの違いに注意）" },
  { id: "k9", prompt: "1バイトは何ビット？", options: ["8ビット", "4ビット", "16ビット", "1024ビット"], correctIndex: 0, explanation: "1バイト = 8ビット" },
  { id: "k10", prompt: "論理演算 1 AND 0 の結果は？", options: ["0", "1", "2", "10"], correctIndex: 0, explanation: "AND は両方が 1 のときだけ 1。1 AND 0 = 0" },
  { id: "k11", prompt: "論理演算 1 OR 0 の結果は？", options: ["1", "0", "2", "11"], correctIndex: 0, explanation: "OR はどちらかが 1 なら 1。1 OR 0 = 1" },
];

export const itPassportDrillList: DrillDef[] = [
  { kind: "calc", title: "計算スピードドリル", description: "2進数・稼働率・転送速度などの計算", icon: "🧮", usesField: false },
  { kind: "cat3", title: "3分野分類", description: "用語をストラテジ/マネジメント/テクノロジに分類", icon: "🗂️", usesField: false },
  { kind: "acronym", title: "頭字語フラッシュ", description: "略語の正式名称を当てる", icon: "🔠", usesField: true },
];

export const itPassportDrillMap: Record<string, DrillDef> = Object.fromEntries(
  itPassportDrillList.map((d) => [d.kind, d])
);

export const itCuratedSets: Record<string, DrillQuestion[]> = {
  calc: calcQuestions,
};
