# Changelog

All notable changes to this app are listed here, newest first.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions follow [Semantic Versioning](https://semver.org/).

## [1.1.0] - 2026-11-15

### Added
- Speed challenge keeps your best score for each exam and field on this device, and tells you when you beat it.
- An update button appears when a new version is ready during a quiz, study session or game; other screens update quietly in the background.
- Settings shows the app version.
- Pages for "not found" and unexpected errors, with a way back home.
- App icons for the home screen on iPhone and Android.

### Changed
- Home screen is more compact: title, the two main actions and the exam rules as short tags, so the whole menu fits on one desktop screen.
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
