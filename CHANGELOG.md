# Changelog

All notable changes to Glyphy are documented here.

---

## [1.1.0] — fix/rtl-youtube → master

### Fixed

- **RTL rendering on YouTube & YouTube Studio** — comments, video titles, and descriptions written in Arabic, Persian, Hebrew, Urdu, and other RTL scripts now render right-to-left. The fix injects `unicode-bidi: plaintext; text-align: start` via a scoped `<style>` tag, letting the browser's built-in bidi algorithm determine direction from the first strong character in each element — no JS text scanning required.
  - Affected elements: `yt-formatted-string`, `#content-text`, `#video-title` (watch page), `ytcp-mention-textbox`, `tp-yt-paper-input`, `.ytcp-comment-dialog-detail` (Studio).

### Added

- **Export / import font settings** — back up all per-domain font rules as a JSON file and restore them on another machine (Options page).
- **Active font subtitle in popup header** — the currently applied font name is displayed as a subtitle below the site hostname in the popup.
- **Alt+Shift+G keyboard shortcut** — opens the Glyphy popup without clicking the toolbar icon. Customizable via `chrome://extensions/shortcuts`.

---

_Older changes are tracked in git history (`git log --oneline`)._
