# 資格学習 (it-passport)

Multi-exam Japanese certification study app. Supports ITパスポート (IT Passport) and 知的財産管理技能検定 3級 (IP Management Level 3) out of the box. Quiz, study mode, five game modes, wrong-answer review, term index, study streak, and offline PWA.

## Stack

- **Next.js 16** (App Router, Turbopack, static export per route where possible)
- **React 19**, **TypeScript 5**
- **Tailwind CSS v4** via `@tailwindcss/postcss`
- All persistence is client-side `localStorage` — no backend.

Commands:

```bash
npm run dev      # next dev (defaults to :3000)
npm run build    # next build
npm run start    # next start (production server)
```

## Repo layout

```
src/
  app/
    layout.tsx                    Root layout: ExamProvider, nav, SW register
    page.tsx                      Home (client) — hero, today's pick, sections
    icon.svg, manifest.ts         PWA assets
    quiz/page.tsx                 Length-picker quiz w/ keyboard shortcuts
    results/page.tsx              Persists QuizResult to history
    review/page.tsx               Pools missed Qs, drills them
    study/page.tsx                Doom Scroll learning mode (~2k lines, ITP-specific lesson content)
    terms/page.tsx                Searchable term index
    history/page.tsx              Stats, per-category mastery, streak
    settings/page.tsx             AI settings (optional generate-study-note endpoint)
    games/
      page.tsx                    Games hub
      term-quiz/                  Description → term MCQ
      memory/                     Concentration / 神経衰弱
      matching/                   Term ↔ description pairs
      flashcards/                 Flip cards
      speed/                      60s rapid-fire
    api/generate-study-note/      Server route to call user's own LLM (uses Settings)
  components/
    ExamSelector.tsx              Top-nav exam dropdown
    ThemeSelector.tsx             Color theme + dark-mode toggle
    ServiceWorkerRegister.tsx     Registers /sw.js on window load
    ScoreRing.tsx, LoadingSpinner.tsx, DarkModeToggle.tsx
  data/
    terms.ts                      IT Passport: RawTermPair[]
    questions.ts                  IT Passport: RawQuestion[]
    terms-ip3.ts                  知財3級: RawTermPair[]
    questions-ip3.ts              知財3級: RawQuestion[]
    index.ts                      Aggregator — stamps `exam`, exposes getQuestions/getTermPairs
  lib/
    types.ts                      Exam, Category, Question, TermPair, QuizResult, labels
    examContext.tsx               useExam() hook + localStorage persistence
    history.ts                    save/getHistory + getStudyStreak
    appSettings.ts                AI settings persistence
  app/globals.css                 Theme tokens (5 color themes × light/dark)
public/
  sw.js                           Service worker
```

## Multi-exam architecture

The whole app is parameterized by an `Exam`. Adding a new one is a contained change.

### Type layer (`src/lib/types.ts`)

```ts
export type Exam = "it-passport" | "ip-3";

export type Category =
  | "strategy" | "management" | "technology"       // IT Passport
  | "patent" | "design" | "trademark"
  | "copyright" | "unfair-competition" | "treaty"; // 知財3級

export const categoryByExam: Record<Exam, Category[]> = { ... };
export const categoryLabels: Record<Category, string> = { ... };
export const examLabels: Record<Exam, string> = { ... };
```

`Question` and `TermPair` carry the `exam` field. `RawQuestion` / `RawTermPair` are the same types without `exam` — used inside the raw data files.

### Data layer

**Raw files** (`data/{terms,questions,terms-ip3,questions-ip3}.ts`) export untagged arrays. They never reference an `Exam` value themselves.

**Aggregator** (`data/index.ts`) stamps the exam field and exposes the canonical API:

```ts
allQuestions: Question[]
allTermPairs: TermPair[]
getQuestions(exam: Exam): Question[]
getTermPairs(exam: Exam): TermPair[]
getQuestionsByCategory(exam: Exam, category: string): Question[]
```

**All pages import from `@/data`, never from `@/data/questions` or `@/data/terms` directly** (except `study/page.tsx`'s TermHighlighter which uses `allTermPairs` for the hover map, and a small `shuffleQuestions` helper still exported from `data/questions.ts`).

### Current exam at runtime

```tsx
import { useExam } from "@/lib/examContext";
const { exam } = useExam();
const questions = useMemo(() => getQuestions(exam), [exam]);
```

`ExamProvider` wraps the app from `layout.tsx`. Selection persists to `localStorage["it-passport-current-exam"]`. The top-nav `<ExamSelector />` lets users switch.

### Adding a new exam

1. In `lib/types.ts`: extend `Exam` union and `Category` union, add entries to `categoryLabels`, `categoryColors`, `categoryByExam`, `examLabels`, `examLongLabels`.
2. Add `data/terms-{newexam}.ts` and `data/questions-{newexam}.ts` exporting `RawTermPair[]` / `RawQuestion[]`.
3. In `data/index.ts`: import the new arrays and stamp them with the new exam id in the `allQuestions` / `allTermPairs` spreads.
4. In `app/page.tsx`: add entries to `categoryIcons`, `categoryColors`, `categoryDescriptions` for the new categories.
5. Verify `study/page.tsx` — the IT-Passport-specific lesson maps (`examTipMap`, `lessonBlocksMap`, etc.) are `Partial<Record<Category, ...>>`, so new categories without lesson content fall through silently (questions still work).

## History schema

`localStorage["it-passport-history"]` is `QuizResult[]` (newest first, capped at 50):

```ts
interface QuizResult {
  id: string;
  date: string;        // ISO timestamp
  exam: Exam;
  category: string;    // either a Category or "all"
  score: number;
  total: number;
  percentage: number;
  timeSeconds: number;
  passed: boolean;
  // Optional, present on entries saved since 2026-05:
  questionIds?: number[];
  answers?: (number | null)[];
}
```

Older entries lack `questionIds`/`answers`. Code that depends on them (review pool, mastery) skips entries where either is missing.

## Wrong-answer review pool (`/review`)

Built client-side on each visit:

1. For the current exam, walk `getHistory()` filtering by `result.exam === exam`.
2. For each `(qid, i)`, look up the question by id in `getQuestions(exam)` to find `correctIndex`.
3. Tally `right` / `wrong` per question id.
4. Include any qid where `wrong > 0 && wrong >= right` in the pool.

When a review-round completes, it's saved as a normal `QuizResult`, so passing a question twice naturally drops it from the pool on the next visit. No separate "review storage".

## Per-category mastery + today's recommendation

Same join: history entries with `questionIds`/`answers` get matched against the exam's question pool to compute per-question category accuracy. Aggregated into `correct/total/percentage` per `Category`.

- `/history` renders this as a tier-colored bar chart.
- `/` picks the category with the lowest percentage as today's drill target. First-time users get the exam's first category.

## Study streak

`getStudyStreak()` in `lib/history.ts`:
- Compute the set of unique YYYY-MM-DD dates in history.
- Current streak: count back from today, allowing yesterday as a fallback start so morning-of-day-2 still shows yesterday's streak.
- Longest streak: scan sorted unique dates for the longest run of consecutive days.

Surfaced as `🔥 N日連続` on home hero (when > 0) and as a stat card on `/history`.

## Routes

Static unless noted:

| Path | Purpose |
|---|---|
| `/` | Home (hero, today's pick, category grid, games row, history CTA) |
| `/quiz?category=&length=` | Quiz (length default 20, also accepts `all`) |
| `/results?...` | Quiz results screen, persists to history |
| `/study?category=` | Doom Scroll + Coaching view (IT-Passport-rich, 知財3級-minimal) |
| `/review` | Missed-question drill (per-category or aggregate) |
| `/terms` | Searchable term index |
| `/history` | Streak + mastery + session list, exam filter |
| `/games` | Game hub |
| `/games/{term-quiz,memory,matching,flashcards,speed}` | Individual games |
| `/settings` | Optional AI key for `/api/generate-study-note` |
| `/api/generate-study-note` | Dynamic; server route that calls user's own LLM provider |

## PWA

`manifest.ts` exports the web manifest. `icon.svg` is the home-screen icon (Android home screen, iOS via `metadata.icons.apple`).

`public/sw.js` strategies:
- Same-origin GET only; cross-origin and non-GET pass through.
- Navigation requests: **network-first**, fall back to cache, then to `/`.
- Static assets: **cache-first** with background revalidate.
- `/_next/webpack-hmr` and `/api/*` skip cache so dev HMR and live API still work.
- Cache versioned via `CACHE_VERSION` in the SW — bump it to invalidate all cached responses on next activate.

`ServiceWorkerRegister` (client component, rendered from root layout) calls `navigator.serviceWorker.register("/sw.js")` after `window 'load'`.

App shortcuts (long-press the home icon on Android):
- 今日の20問 → `/quiz?category=all&length=20`
- 復習モード → `/review`
- 用語インデックス → `/terms`

## Theme system

`globals.css` defines five themes (default blue, sakura, forest, sunset, ocean, lavender) × light/dark via CSS variables. Theme classes (`theme-sakura`, etc.) live on `<html>`; dark mode is a separate `.dark` class. `ThemeSelector.tsx` floats fixed in the corner.

All UI uses `var(--…)` tokens (e.g. `bg-[var(--card)] border-[var(--card-border)]`) so swapping themes is instant and consistent across pages.

## Gotchas

- **Per-exam id namespacing**: question `id`s are local to each exam's array. `allQuestions` contains overlapping ids across exams. Always filter by `exam` first (`getQuestions(exam).find(q => q.id === id)`). `results/page.tsx` was previously broken on this.
- **`study/page.tsx` IT-Passport bias**: `examTipMap`, `lessonBlocksMap`, etc. are `Partial<Record<Category, ...>>`. Adding 知財3級 lesson content means adding entries keyed by the IP categories.
- **Quiz `?length` default is 20**. Passing `length=all` (or unsupported value) gates the slice off. The picker chip strip only renders on Q1 before the first answer.
- **History is capped at 50 entries.** Once full, oldest results are dropped — including their `questionIds`/`answers`. The review pool and mastery degrade silently as old data ages out.
- **Hover terms** in `study/page.tsx` use a precomputed `termLookup` of *all* exams' terms. A term in the wrong exam can theoretically appear as a hover target inside an explanation; in practice the question pool is exam-scoped so the substrings rarely match.
