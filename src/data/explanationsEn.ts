// English explanations for the question bank, keyed by question id. Shown
// beneath the Japanese explanation so learners get both languages. Kept in a
// separate map (rather than on each Question) so the large questions.ts stays
// the single source of the Japanese content and stays easy to edit.
//
// Coverage is enforced by src/data/explanationsEn.test.ts: every question id
// must have an entry here.
export const explanationsEn: Record<number, string> = {
  // ===== ITパスポート: ストラテジ・マネジメント・テクノロジ (1-40) =====
  1: "A management philosophy expresses a company's fundamental values and vision — what value it offers society and what it aspires to be — not short-term sales targets, pay scales, or product specs.",
  2: "In SWOT analysis the letters stand for Strength, Weakness, Opportunity, and Threat, so \"S\" is Strength; it analyzes a firm's internal and external environment.",
  3: "The four Balanced Scorecard perspectives are Financial, Customer, Internal Business Process, and Learning & Growth; an \"innovation perspective\" is not one of them.",
  4: "The break-even point (BEP) is where total sales equal total cost (fixed + variable); above it you earn a profit, below it a loss.",
  5: "In the PDCA cycle, \"C\" is Check (evaluate); Plan → Do → Check → Act repeats to drive continuous improvement.",
  6: "PPM sorts businesses into four quadrants by market growth rate and market share; a \"Star\" is high in both and needs aggressive investment.",
  7: "Under the Personal Information Protection Act, personal information identifies a living individual; a corporation's address is not personal information.",
  8: "Copyright law does not protect programming languages, protocols, or algorithms themselves, although the program (its code) is protected as a work.",
  9: "CRM (Customer Relationship Management) builds, maintains, and strengthens customer relationships to raise satisfaction and repeat business.",
  10: "SCM (Supply Chain Management) integrates the entire chain — procurement, production, distribution, and sales — to optimize the overall flow.",
  11: "A WBS (Work Breakdown Structure) hierarchically decomposes all project work into manageable units, clarifying scope and underpinning scheduling.",
  12: "ITIL incident management aims to restore service as quickly as possible; finding the root cause is the role of problem management.",
  13: "In the V-model, integration testing corresponds to external (basic) design, just as requirements ↔ system test and internal design ↔ unit test.",
  14: "Agile development delivers working software incrementally in short iterations, responding flexibly to change.",
  15: "ISO/IEC 27001 is the international standard for an ISMS; ISO 9001 is quality, ISO 14001 environment, and ISO/IEC 20000 IT service management.",
  16: "A Gantt chart puts time on the horizontal axis and tasks on the vertical, showing each task's start/end and progress as horizontal bars.",
  17: "A systems audit has an independent auditor objectively evaluate an information system's reliability, safety, and efficiency.",
  18: "An SLA (Service Level Agreement) documents the agreed service content and quality levels (e.g., availability, response time) between provider and user.",
  19: "Function Point analysis estimates software size from five function types: external inputs, outputs, inquiries, internal logical files, and external interface files.",
  20: "System planning analyzes the target business and decides the scope, purpose, and basic policy for building the system.",
  21: "Binary 1010 = 1×2³ + 0×2² + 1×2¹ + 0×2⁰ = 8 + 2 = 10 in decimal.",
  22: "A router works at the network layer (Layer 3), routing packets by IP address; repeaters/hubs are Layer 1 and L2 switches Layer 2.",
  23: "SQL's SELECT statement searches for and retrieves data from tables, unlike INSERT, UPDATE, or CREATE TABLE.",
  24: "HTTPS encrypts HTTP traffic with TLS (Transport Layer Security)/SSL, preventing eavesdropping and impersonation.",
  25: "A higher CPU clock frequency (cycles per second) generally means faster processing, though architecture and other factors also matter.",
  26: "RAID 5 stripes data and parity across three or more disks, so the data can be rebuilt if one disk fails.",
  27: "Public-key cryptography uses a key pair — one key encrypts and the other decrypts; RSA is a representative algorithm.",
  28: "IaaS (Infrastructure as a Service) provides infrastructure such as virtual machines, storage, and networks; PaaS provides a runtime and SaaS the application.",
  29: "A \"/24\" prefix means the first 24 bits of the subnet mask are 1, i.e., 255.255.255.0.",
  30: "A primary key uniquely identifies each row, so it must be unique and must not contain NULL.",
  31: "The marketing mix's 4Ps are Product, Price, Place, and Promotion; \"Person\" is not one of them.",
  32: "Compliance means conducting business in accordance with laws, regulations, and social norms.",
  33: "ROE (Return on Equity) = net income ÷ shareholders' equity × 100, showing how much profit is generated on equity.",
  34: "BPR (Business Process Reengineering) fundamentally redesigns business processes to achieve dramatic gains in cost, quality, service, and speed.",
  35: "A trade secret's three requirements are secret management, usefulness, and non-public status; \"novelty\" is a patent requirement, not a trade-secret one.",
  36: "ABC analysis (based on the Pareto principle) ranks items by value and sorts them into A (important), B, and C for prioritized management.",
  37: "DX (Digital Transformation) uses digital technology and data to transform products, services, and business models for competitive advantage — more than mere digitization.",
  38: "ITIL problem management investigates and identifies the root cause of incidents to find a permanent fix and prevent recurrence.",
  39: "The critical path is the longest path from project start to finish; any delay on it delays the whole project.",
  40: "The waterfall model proceeds through requirements → design → implementation → testing → operation in order, in principle without returning to earlier phases.",
};

export function explanationEnFor(id: number): string | undefined {
  return explanationsEn[id];
}
