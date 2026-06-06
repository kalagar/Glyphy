// FontFreedom content script.
// Runs at document_start on every page. Looks up the saved font for this
// page's hostname and injects a global <style> that overrides font-family.

const STYLE_ID = "font-changer-style";
const hostname = location.hostname;

// Also try www-prefix variant so a rule saved as "google.com" applies on
// "www.google.com" and vice versa.
function getCandidateKeys(h) {
  return h.startsWith("www.") ? [h, h.slice(4)] : [h, "www." + h];
}
const candidateKeys = getCandidateKeys(hostname);

// Selectors excluded from the override so glyph/icon fonts keep working.
const ICON_EXCLUSIONS =
  ':not([class*="icon"]):not([class*="Icon"]):not(.material-icons)' +
  ':not(.material-icons-outlined):not(.fa):not(.fas):not(.far)' +
  ':not(.fab):not(.fal):not(i):not(.glyphicon)';

function buildCss(font) {
  // Escape any embedded quotes in the font name, then wrap in quotes.
  const safe = String(font).replace(/["\\]/g, "\\$&");
  return `*${ICON_EXCLUSIONS} { font-family: "${safe}" !important; }`;
}

function applyFont(font) {
  let style = document.getElementById(STYLE_ID);
  if (!style) {
    style = document.createElement("style");
    style.id = STYLE_ID;
    // documentElement exists at document_start even before <head>.
    (document.head || document.documentElement).appendChild(style);
  }
  style.textContent = buildCss(font);
}

function removeFont() {
  const style = document.getElementById(STYLE_ID);
  if (style) style.remove();
}

function render(config) {
  if (config && config.enabled && config.font) {
    applyFont(config.font);
  } else {
    removeFont();
  }
}

// Initial load: read this hostname's config (try www-prefix variant too).
chrome.storage.local.get(candidateKeys, (data) => {
  const cfg = candidateKeys.map(k => data[k]).find(v => v !== undefined);
  render(cfg);
});

// Live updates: re-render when the popup/options saves/resets for this hostname.
chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "local") return;
  const hit = candidateKeys.find(k => Object.prototype.hasOwnProperty.call(changes, k));
  if (hit) render(changes[hit].newValue);
});
