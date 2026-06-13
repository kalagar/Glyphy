# Glyphy

A Chrome extension (Manifest V3) that lets you apply any installed system font to specific websites — configured per-domain. Visit a site, pick a font, and it sticks.

## Features

- **Per-domain font overrides** — LinkedIn, GitHub, and ChatGPT can each use a different font
- **System fonts only** — the dropdown reflects fonts actually installed on your machine
- **Live updates** — font changes apply instantly without a page reload
- **Enable / disable toggle** — pause the override without losing your font choice
- **Reset** — clear a site's setting entirely with one click
- **www-prefix fallback** — a rule saved for `google.com` also applies on `www.google.com` and vice versa
- **Icon font protection** — glyph/icon fonts (Material Icons, Font Awesome, etc.) are excluded from the override so icons keep rendering correctly
- **Options page** — manage all configured sites in one place; includes quick-access rows for popular sites (Google, YouTube, Gmail, LinkedIn, ChatGPT, X, and more) plus a form to add any custom domain
- **Export / import settings** — back up all your per-domain font rules as a JSON file or restore them on another machine
- **Per-site RTL toggle** — enable RTL text support (`unicode-bidi: plaintext; text-align: start`) per site from the Options page or directly from the popup; covers Arabic, Persian, Hebrew, Urdu, and other RTL scripts with regional subtag support (e.g. `ar-SA`, `fa-IR`); YouTube and YouTube Studio default to on

## Screenshots

> _Add screenshots here once the extension is loaded in Chrome._

## Installation

This extension is not published to the Chrome Web Store. Load it as an unpacked extension:

1. Clone or download this repository.
2. Open `chrome://extensions` in Chrome.
3. Toggle **Developer mode** on (top-right corner).
4. Click **Load unpacked** and select the project folder.
5. The **G** icon appears in the toolbar — pin it for quick access.

## Usage

### Popup

1. Navigate to any website.
2. Click the **Glyphy** toolbar icon.
3. Select a font from the dropdown (your installed system fonts).
4. Click **Save** — the page updates live and the choice is remembered for this domain.
5. Use the **Enabled** checkbox to toggle the override on/off.
6. Use the **RTL text support** checkbox to enable right-to-left rendering for the current site.
7. Click **Reset** to clear the site's setting entirely.

### Keyboard shortcut

Press **Alt+Shift+G** to open the popup without clicking the toolbar icon.

To customize the shortcut, go to `chrome://extensions/shortcuts`.

### Options page

Click **Manage all sites** in the popup, or go to `chrome://extensions` → Glyphy → **Extension options**.

- **Popular sites** section — pre-listed rows for common sites; pick a font and toggle RTL support per site.
- **Custom sites** section — shows any domains you've configured that aren't in the popular list.
- **Add custom site** form — enter a domain (or full URL) and a font to add a new override.

## How it works

| File | Role |
| --- | --- |
| `manifest.json` | Extension manifest (MV3), declares permissions and entry points |
| `content.js` | Runs at `document_start` on every page; reads the saved font and RTL setting from `chrome.storage.local`; injects a `<style>` for the font override (excluding icon-font selectors) and, when RTL is enabled for the site, injects `unicode-bidi: plaintext; text-align: start` for elements with RTL `lang` or `dir` attributes |
| `popup.js` / `popup.html` | Toolbar popup; lists system fonts via `chrome.fontSettings.getFontList()` and writes `{ font, enabled }` per hostname; shows the active font name as a subtitle in the header |
| `options.js` / `options.html` | Full management page; supports popular-site quick rows, custom domain entry, and JSON export/import of all settings |
| `options.css` / `popup.css` | Styles for the respective pages |

The `!important` rule is required to override site-specific font declarations. If a site's icons break after enabling a font, extend the `ICON_EXCLUSIONS` selector constant in `content.js`.

## Permissions

| Permission | Why |
| --- | --- |
| `storage` | Persist per-domain font settings |
| `fontSettings` | Enumerate fonts installed on the system |
| `activeTab` | Read the current tab's hostname in the popup |
| `<all_urls>` (host) | Inject the content script on every page |

## Contributing

1. Fork the repo and create a branch named by **type** (this drives the version bump).
2. Load the extension from your fork as described in [Installation](#installation).
3. Make your changes and test across a few sites.
4. Open a pull request with a **conventional-commit title matching the branch type**
   (e.g. `feat: …`). The PR title becomes the squash commit and
   [Release Please](https://github.com/googleapis/release-please) bumps the version
   automatically on merge to `master`.

### Versioning automation

Branch type and PR title together decide the semver bump. A PR Title Guard check
enforces that they match:

| Branch prefix                     | PR title      | Version bump |
| --------------------------------- | ------------- | ------------ |
| `feature/`, `feat/`               | `feat: …`     | MINOR        |
| `fix/`, `bug/`, `bugfix/`         | `fix: …`      | PATCH        |
| `hotfix/`                         | `fix: …`      | PATCH        |
| `breaking/`                       | `feat!: …`    | MAJOR        |
| `chore/`, `docs/`, `ci/`, `test/` | matching type | no release   |

Release Please updates `manifest.json`, `CHANGELOG.md`, the git tag, and the built
`.zip` artifact — no manual version edits needed.

## License

MIT
