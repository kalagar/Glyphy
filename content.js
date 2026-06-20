(() => {
  // src/lib/storage.js
  function getCandidateKeys(h) {
    return h.startsWith("www.") ? [h, h.slice(4)] : [h, "www." + h];
  }

  // src/lib/config.js
  var DEFAULT_RTL_HOSTNAMES = /* @__PURE__ */ new Set([
    "www.youtube.com",
    "youtube.com",
    "studio.youtube.com"
  ]);
  var CHATGPT_HOSTNAMES = /* @__PURE__ */ new Set([
    "chatgpt.com",
    "www.chatgpt.com"
  ]);
  function resolveRtl(hostname2, cfg, enabled) {
    if (!enabled) return false;
    if (cfg && typeof cfg === "object" && Object.prototype.hasOwnProperty.call(cfg, "rtl")) {
      return cfg.rtl;
    }
    return DEFAULT_RTL_HOSTNAMES.has(hostname2);
  }

  // src/lib/css.js
  var ICON_EXCLUSIONS = ':not([class*="icon"]):not([class*="Icon"]):not(.material-icons):not(.material-icons-outlined):not(.fa):not(.fas):not(.far):not(.fab):not(.fal):not(i):not(.glyphicon):not([class*="gm-"]):not(.google-symbols):not(.material-symbols-outlined):not(.material-symbols-rounded):not(.material-symbols-sharp):not(.material-symbols):not([aria-hidden="true"]):not(.google-material-icons *)';
  function buildFontCss(font) {
    const safe = String(font).replace(/["\\]/g, "\\$&");
    return `*${ICON_EXCLUSIONS} { font-family: "${safe}" !important; }`;
  }
  var RTL_CSS = [
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
    ".ytcp-comment-dialog-detail .ytcp-ve"
  ].join(",\n") + " {\n  unicode-bidi: plaintext !important;\n  text-align: start !important;\n}";
  var GENERAL_RTL_CSS = '[lang|="ar"], [lang|="fa"], [lang|="he"], [lang|="ur"], [dir="rtl"] {\n  unicode-bidi: plaintext !important;\n  text-align: start !important;\n}';
  var CHATGPT_RTL_CSS = [
    '[data-message-author-role="assistant"] .markdown',
    '[data-message-author-role="assistant"] .markdown p',
    '[data-message-author-role="assistant"] .markdown li',
    '[data-message-author-role="assistant"] .markdown h1',
    '[data-message-author-role="assistant"] .markdown h2',
    '[data-message-author-role="assistant"] .markdown h3',
    '[data-message-author-role="assistant"] .markdown h4',
    '[data-message-author-role="assistant"] .markdown h5',
    '[data-message-author-role="assistant"] .markdown h6',
    '[data-message-author-role="assistant"] .markdown blockquote',
    '[data-message-author-role="assistant"] .markdown pre',
    '[data-message-author-role="assistant"] .markdown td',
    '[data-message-author-role="assistant"] .markdown th'
  ].join(",\n") + " {\n  unicode-bidi: plaintext !important;\n  text-align: start !important;\n}";

  // src/content.js
  var STYLE_ID = "font-changer-style";
  var RTL_STYLE_ID = "glyphy-rtl-style";
  var hostname = location.hostname;
  var candidateKeys = getCandidateKeys(hostname);
  function applyFont(font) {
    let style = document.getElementById(STYLE_ID);
    if (!style) {
      style = document.createElement("style");
      style.id = STYLE_ID;
      (document.head || document.documentElement).appendChild(style);
    }
    style.textContent = buildFontCss(font);
  }
  function removeFont() {
    const style = document.getElementById(STYLE_ID);
    if (style) style.remove();
  }
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
    const rtl = resolveRtl(hostname, config, enabled);
    if (rtl) {
      let css;
      if (DEFAULT_RTL_HOSTNAMES.has(hostname)) {
        css = RTL_CSS;
      } else if (CHATGPT_HOSTNAMES.has(hostname)) {
        css = CHATGPT_RTL_CSS;
      } else {
        css = GENERAL_RTL_CSS;
      }
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
  chrome.storage.local.get(candidateKeys, (data) => {
    const cfg = candidateKeys.map((k) => data[k]).find((v) => v !== void 0);
    render(cfg);
  });
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "local") return;
    const hit = candidateKeys.find((k) => Object.prototype.hasOwnProperty.call(changes, k));
    if (hit) render(changes[hit].newValue);
  });
})();
