#!/usr/bin/env bash
# Packages the Glyphy extension into installable artifacts for Chrome/Edge and Firefox.
# Output: ~/Downloads/glyphy/glyphy-<version>-chrome.zip
#         ~/Downloads/glyphy/glyphy-<version>-firefox.xpi
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$ROOT_DIR"

# Read version from manifest.json
VERSION=$(python3 -c "import json; print(json.load(open('manifest.json'))['version'])")

OUT_DIR="$HOME/Downloads/glyphy"
mkdir -p "$OUT_DIR"

CHROME_OUT="$OUT_DIR/glyphy-${VERSION}-chrome.zip"
FIREFOX_OUT="$OUT_DIR/glyphy-${VERSION}-firefox.xpi"

# Stage extension files in a temp directory so we have an explicit, clean set.
TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

# Copy extension runtime files only (no dev/tooling files).
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
