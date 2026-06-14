// CSS generation helpers — all injected styles are built here.

/** Selectors excluded from the font override so glyph/icon fonts keep working. */
export const ICON_EXCLUSIONS =
  ':not([class*="icon"]):not([class*="Icon"]):not(.material-icons)' +
  ':not(.material-icons-outlined):not(.fa):not(.fas):not(.far)' +
  ':not(.fab):not(.fal):not(i):not(.glyphicon)' +
  ':not([class*="gm-"]):not(.google-symbols)' +
  ':not(.material-symbols-outlined):not(.material-symbols-rounded)' +
  ':not(.material-symbols-sharp):not(.material-symbols)' +
  ':not([aria-hidden="true"])' +
  ':not(.google-material-icons *)';

/**
 * Builds the CSS rule that overrides font-family for the given font name,
 * excluding icon-font selectors.
 *
 * @param {string} font  font family name
 * @returns {string}
 */
export function buildFontCss(font) {
  const safe = String(font).replace(/["\\]/g, '\\$&');
  return `*${ICON_EXCLUSIONS} { font-family: "${safe}" !important; }`;
}

/**
 * RTL fix for YouTube and YouTube Studio.
 * Uses unicode-bidi: plaintext so the browser's bidi algorithm determines
 * direction from the first strong character in each element — no JS scanning needed.
 */
export const RTL_CSS = [
  // Watch page: video comments
  'ytd-comment-renderer yt-formatted-string',
  'ytd-comment-renderer #content-text',
  // Watch page: video title and description
  'h1.ytd-video-primary-info-renderer yt-formatted-string',
  '#description yt-formatted-string',
  // Channel about page
  'ytd-channel-about-metadata-renderer yt-formatted-string',
  // YouTube Studio: title/description inputs and comment text
  'ytcp-mention-textbox [contenteditable]',
  'tp-yt-paper-input .input-content',
  '.ytcp-comment-dialog-detail .ytcp-ve',
].join(',\n') + ' {\n  unicode-bidi: plaintext !important;\n  text-align: start !important;\n}';

/**
 * General RTL fix for non-YouTube sites.
 * Targets elements explicitly marked as RTL via lang or dir attributes so
 * that Arabic, Persian, Hebrew, Urdu, and other RTL scripts render correctly.
 */
export const GENERAL_RTL_CSS =
  '[lang|="ar"], [lang|="fa"], [lang|="he"], [lang|="ur"], [dir="rtl"] {\n' +
  '  unicode-bidi: plaintext !important;\n' +
  '  text-align: start !important;\n' +
  '}';
