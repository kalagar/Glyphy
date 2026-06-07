# Changelog

All notable changes to Glyphy are documented here.

---

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
