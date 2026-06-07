// Glyphy content script.
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

// RTL fix for YouTube & YouTube Studio.
// Uses unicode-bidi: plaintext so the browser's bidi algorithm determines
// direction from the first strong character in each element — no JS scanning needed.
// Follows the per-site enabled toggle so disabling Glyphy also removes the RTL fix.
const RTL_STYLE_ID = "glyphy-rtl-style";
const RTL_HOSTS = new Set(["www.youtube.com", "youtube.com", "studio.youtube.com"]);
const RTL_CSS = [
  // Watch page: video comments
  "ytd-comment-renderer yt-formatted-string",
  "ytd-comment-renderer #content-text",
  // Watch page: video title and description
  "h1.ytd-video-primary-info-renderer yt-formatted-string",
  "#description yt-formatted-string",
  // Channel about page
  "ytd-channel-about-metadata-renderer yt-formatted-string",
  // YouTube Studio: title/description inputs and comment text
  "ytcp-mention-textbox [contenteditable]",
  "tp-yt-paper-input .input-content",
  ".ytcp-comment-dialog-detail .ytcp-ve",
].join(",\n") + " {\n  unicode-bidi: plaintext !important;\n  text-align: start !important;\n}";

// General RTL fix for non-YouTube sites.
// Targets elements explicitly marked as RTL via lang or dir attributes so
// that Arabic, Persian, Hebrew, Urdu, and other RTL scripts render correctly.
const GENERAL_RTL_CSS =
  '[lang|="ar"], [lang|="fa"], [lang|="he"], [lang|="ur"], [dir="rtl"] {\n' +
  '  unicode-bidi: plaintext !important;\n' +
  '  text-align: start !important;\n' +
  '}';

function applyRtlFix(css) {
  let style = document.getElementById(RTL_STYLE_ID);
  if (!style) {
    style = document.createElement("style");
    style.id = RTL_STYLE_ID;
    (document.head || document.documentElement).appendChild(style);
  }
  style.textContent = css;
}

function removeRtlFix() {
  const style = document.getElementById(RTL_STYLE_ID);
  if (style) style.remove();
}

function render(config) {
  const enabled = config ? config.enabled !== false : false;

  // Determine whether RTL should be active for this page:
  //   • If cfg.rtl is explicitly set, honour it.
  //   • Otherwise fall back to true for legacy YouTube hosts so existing users
  //     are not affected by the addition of the per-site toggle.
  let rtl;
  if (!enabled) {
    rtl = false;
  } else if (config && typeof config === 'object' && Object.prototype.hasOwnProperty.call(config, 'rtl')) {
    rtl = config.rtl;
  } else {
    rtl = RTL_HOSTS.has(hostname);
  }

  if (rtl) {
    const css = RTL_HOSTS.has(hostname) ? RTL_CSS : GENERAL_RTL_CSS;
    applyRtlFix(css);
  } else {
    removeRtlFix();
  }

  if (enabled && config.font) {
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
