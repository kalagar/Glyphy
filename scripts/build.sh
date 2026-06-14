#!/usr/bin/env bash
# Packages the Glyphy extension into installable artifacts for Chrome/Edge and Firefox.
# Output: ~/Downloads/glyphy/glyphy-<version>-chrome.zip
#         ~/Downloads/glyphy/glyphy-<version>-firefox.xpi
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$ROOT_DIR"

# Verify required tools are available
if ! command -v zip &>/dev/null; then
  echo "Error: 'zip' is not installed. Install it (e.g. 'brew install zip' on macOS or 'apt-get install zip' on Debian/Ubuntu) and re-run." >&2
  exit 1
fi

# Read version from manifest.json
if [[ ! -f manifest.json ]]; then
  echo "Error: manifest.json not found in $(pwd)" >&2
  exit 1
fi
VERSION=$(python3 -c "
import json, sys
try:
    v = json.load(open('manifest.json'))['version']
    print(v)
except Exception as e:
    print('Error reading version from manifest.json: ' + str(e), file=sys.stderr)
    sys.exit(1)
") || exit 1

OUT_DIR="$HOME/Downloads/glyphy"
mkdir -p "$OUT_DIR"

CHROME_OUT="$OUT_DIR/glyphy-${VERSION}-chrome.zip"
FIREFOX_OUT="$OUT_DIR/glyphy-${VERSION}-firefox.xpi"

# Stage extension files in a temp directory so we have an explicit, clean set.
TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

# Copy extension runtime files only (no dev/tooling files).
# The list is intentionally explicit: only files that belong in the browser
# extension are shipped, so accidentally added dev files are never packaged.
cp manifest.json content.js popup.js options.js \
   popup.html options.html popup.css options.css \
   LICENSE "$TMP_DIR/"
cp -r icons "$TMP_DIR/"

# Build Chrome zip (Web Store upload format).
rm -f "$CHROME_OUT"
(cd "$TMP_DIR" && zip -r "$CHROME_OUT" .)

# Firefox .xpi is structurally identical to a zip — just a different extension.
cp "$CHROME_OUT" "$FIREFOX_OUT"

echo "✓ Chrome:  $CHROME_OUT"
echo "✓ Firefox: $FIREFOX_OUT"
