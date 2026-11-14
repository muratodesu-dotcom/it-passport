# Changelog

All notable changes to this app are listed here, newest first.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions follow [Semantic Versioning](https://semver.org/).

## [1.2.0] - 2026-11-15

### Added
- Progress backup in Settings: **書き出す** saves your quiz history, bookmarks, review schedule, known terms and speed bests to a file; **読み込む** merges such a file into this device's progress without overwriting it, with an Undo. Your OpenAI API key is never included.

## [1.1.0] - 2026-11-15

### Added
- A third track, **AI Engineer**, written in English, for the engineering around building AI apps, in five fields: Git & GitHub, Supabase & DB, Vercel, Web & HTTP, and AI & LLMs.
  - 100 quiz questions (20 per field) with explanations.
  - 170 glossary terms, including Vercel's current platform (Fluid Compute, Instant Rollback, Skew Protection, Global Config, AI Gateway).
  - Study mode with tips per field, the term feed, glossary, matching, flashcards, the speed challenge and term drills all work for the track.
  - A Git command drill (pick the command for the situation) and an acronym drill.
  - A home screen section with each field's quiz and study buttons.
- Commands written in backticks show as inline code in quizzes, study, results and drills.
- Speed challenge keeps your best score for each exam and field on this device, and tells you when you beat it.
- An update button appears when a new version is ready during a quiz, study session or game; other screens update quietly in the background.
- Settings shows the app version.
- Pages for "not found" and unexpected errors, with a way back home.
- App icons for the home screen on iPhone and Android.

### Changed
- Home screen redesigned: tabs for the three tracks (remembered), one "next step" card with the most useful thing to do now, the track's extra modes as icon tiles, and its fields with progress rings showing your accuracy.
- Phones get a bottom tab bar (ホーム, 学習, クイズ, 用語集, 履歴) that opens the track you chose; the ☰ menu is gone and Settings has a gear button. Computers get the same links with icons in the header.
- Quiz: after answering, a bar pinned to the bottom shows Correct or Incorrect and the Next button, so there's no scrolling between questions. Field quizzes take the field's colour, and a streak chip counts correct answers in a row.
- Glossary is compact: three columns on computers, two-line descriptions that open on tap, and coloured field headings.
- History shows a separate breakdown for the AI Engineer fields, and practice results remember which field was practised (also for 知財3級).
- Buttons, tags and cards across the app use flat colours and calmer hover effects.
- A saved OpenAI API key is shown only by its last four characters, with Change and Delete buttons.
- Links load the next pages only after the current page has appeared, and not at all on slow connections until you head for them.
- Updated Next.js to 16.4, React to 19.3 and the test tools.

### Fixed
- After an update, the offline copy of the app could keep loading parts of the old version.
- Button text was hard to read in dark themes, and almost invisible in monochrome dark.
- The speed challenge timer kept running out while the app was in the background, and an answer from a finished round could move the next round on.
- In the matching game, a wrong pair from the previous round could clear a new selection.
- Theme and settings no longer stop the page from loading when the browser blocks saved data.

## [1.0.0]

First version, before this changelog was kept.

[1.1.0]: https://github.com/muratodesu-dotcom/it-passport/pull/36
