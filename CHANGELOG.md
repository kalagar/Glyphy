# Changelog

All notable changes to Glyphy are documented here.

---

## [1.4.1](https://github.com/kalagar/Glyphy/compare/v1.4.0...v1.4.1) (2026-06-20)


### Bug Fixes

* RTL support broken on chatgpt.com — responses in RTL languages render LTR ([#36](https://github.com/kalagar/Glyphy/issues/36)) ([65f938f](https://github.com/kalagar/Glyphy/commit/65f938f8a9ba0d13d01f894a195f4db59c24b78d))

## [Unreleased]

### Fixed

- **RTL support on chatgpt.com** — ChatGPT does not add `lang` or `dir` attributes to its response containers, so the generic RTL selector never matched. A new `CHATGPT_RTL_CSS` constant targets `[data-message-author-role="assistant"] .markdown` and its block-level descendants (`p`, `li`, `h1`–`h6`, `blockquote`, `pre`, `td`, `th`) with `unicode-bidi: plaintext; text-align: start`, letting the browser's bidi algorithm determine direction per element from the text content ([#35](https://github.com/kalagar/Glyphy/issues/35)).

---

## [1.4.0](https://github.com/kalagar/Glyphy/compare/v1.3.2...v1.4.0) (2026-06-14)


### Features

* add packaging script for Chrome/Firefox extension artifacts ([#33](https://github.com/kalagar/Glyphy/issues/33)) ([94a5c5c](https://github.com/kalagar/Glyphy/commit/94a5c5cef8eb3b955c50813e96c196c78e154be9))

## [1.3.2](https://github.com/kalagar/Glyphy/compare/v1.3.1...v1.3.2) (2026-06-14)


### Bug Fixes

* clear free-text font on dropdown change in options; fix PR title guard for copilot branches ([#30](https://github.com/kalagar/Glyphy/issues/30)) ([fa97188](https://github.com/kalagar/Glyphy/commit/fa97188200d265527fd4bee07862b57e0b46d490))

## [1.3.1](https://github.com/kalagar/Glyphy/compare/v1.3.0...v1.3.1) (2026-06-14)


### Bug Fixes

* Firefox support — fall back to curated font list when fontSettings unavailable ([#23](https://github.com/kalagar/Glyphy/issues/23)) ([4a87923](https://github.com/kalagar/Glyphy/commit/4a879236074d4a3cff89126ed7fe3c6b23221ffc))

## [1.3.0](https://github.com/kalagar/Glyphy/compare/v1.2.2...v1.3.0) (2026-06-13)


### Features

* add Alt+Shift+F keyboard shortcut to open popup ([#7](https://github.com/kalagar/Glyphy/issues/7)) ([b5ad66c](https://github.com/kalagar/Glyphy/commit/b5ad66ce50e6718f27d72097e7f888d1ce850b4b))
* add per-site RTL toggle and popup support for RTL text ([ab9d5f1](https://github.com/kalagar/Glyphy/commit/ab9d5f1c86f750482009b652e4df5cd269c3116d))
* export/import font settings as JSON ([#6](https://github.com/kalagar/Glyphy/issues/6)) ([8110896](https://github.com/kalagar/Glyphy/commit/8110896d771d2fe21449422f685fa2e95a4ad67b))
* GitHub Action to auto-create Release on master push ([#13](https://github.com/kalagar/Glyphy/issues/13)) ([9829017](https://github.com/kalagar/Glyphy/commit/9829017e9438471a062460a2a50ac30cc70452bf))
* per-site RTL support toggle in options page for all popular sites ([#15](https://github.com/kalagar/Glyphy/issues/15)) ([0dd92be](https://github.com/kalagar/Glyphy/commit/0dd92be8cd1c551accec540b57cc15bbf81bc133))
* prepare 1.2.2 release cleanup ([ed62668](https://github.com/kalagar/Glyphy/commit/ed62668e2bda2ec96ff913fbdd854860bbb0c7a3))
* prepare 1.2.2 release cleanup ([fdfb8ac](https://github.com/kalagar/Glyphy/commit/fdfb8ace4d43cb4e45993752cbcfe6f17f6a36a9))


### Bug Fixes

* exclude google-material-icons descendants from font override ([#18](https://github.com/kalagar/Glyphy/issues/18)) ([b95cf53](https://github.com/kalagar/Glyphy/commit/b95cf53e1bdc593def23dbe0354a2a50e28cf31d))
* RTL text direction for YouTube comments/titles with config-aware injection ([#11](https://github.com/kalagar/Glyphy/issues/11)) ([c7acf00](https://github.com/kalagar/Glyphy/commit/c7acf0007e38c2430e4e93beb64b1c4702254481))
* support copilot branch prefixes in PR title guard ([#20](https://github.com/kalagar/Glyphy/issues/20)) ([b40c82f](https://github.com/kalagar/Glyphy/commit/b40c82f0d8004051c5c7166037b1e7b8990be12e))

## [1.2.0] — copilot/feat-per-site-rtl-support-toggle → master

### Added

- **Per-site RTL toggle in Options page** — every site in the Popular list (and custom sites) now has an RTL checkbox. Enabling it injects `unicode-bidi: plaintext; text-align: start` for elements with `[lang|="ar/fa/he/ur"]` or `[dir="rtl"]` attributes, covering regional subtags like `ar-SA` and `fa-IR`. YouTube and YouTube Studio default to on; all other sites default to off.
- **RTL toggle in popup** — the "RTL text support" checkbox in the popup lets you flip RTL support for the current site without opening the Options page. Defaults follow the same hostname rules as the Options page and content script.

---

## [1.1.0] — fix/rtl-youtube → master

### Fixed

- **RTL rendering on YouTube & YouTube Studio** — comments, video titles, and descriptions written in Arabic, Persian, Hebrew, Urdu, and other RTL scripts now render right-to-left. The fix injects `unicode-bidi: plaintext; text-align: start` via a scoped `<style>` tag, letting the browser's built-in bidi algorithm determine direction from the first strong character in each element — no JS text scanning required.
  - Affected elements: `ytd-comment-renderer yt-formatted-string`, `ytd-comment-renderer #content-text`, `h1.ytd-video-primary-info-renderer yt-formatted-string`, `#description yt-formatted-string`, `ytd-channel-about-metadata-renderer yt-formatted-string`, `ytcp-mention-textbox [contenteditable]`, `tp-yt-paper-input .input-content`, `.ytcp-comment-dialog-detail .ytcp-ve`.

### Added

- **Export / import font settings** — back up all per-domain font rules as a JSON file and restore them on another machine (Options page).
- **Active font subtitle in popup header** — the currently applied font name is displayed as a subtitle below the site hostname in the popup.
- **Alt+Shift+G keyboard shortcut** — opens the Glyphy popup without clicking the toolbar icon. Customizable via `chrome://extensions/shortcuts`.

---

_Older changes are tracked in git history (`git log --oneline`)._
