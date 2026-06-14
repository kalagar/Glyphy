// Glyphy content script — thin entry point.
// Reads this hostname's config and injects CSS overrides; re-renders on live updates.

import { getCandidateKeys } from './lib/storage.js';
import { DEFAULT_RTL_HOSTNAMES, resolveRtl } from './lib/config.js';
import { buildFontCss, RTL_CSS, GENERAL_RTL_CSS } from './lib/css.js';

const STYLE_ID = 'font-changer-style';
const RTL_STYLE_ID = 'glyphy-rtl-style';
const hostname = location.hostname;
const candidateKeys = getCandidateKeys(hostname);

function applyFont(font) {
  let style = document.getElementById(STYLE_ID);
  if (!style) {
    style = document.createElement('style');
    style.id = STYLE_ID;
    // documentElement exists at document_start even before <head>.
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
    style = document.createElement('style');
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
    applyRtlFix(DEFAULT_RTL_HOSTNAMES.has(hostname) ? RTL_CSS : GENERAL_RTL_CSS);
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
  if (area !== 'local') return;
  const hit = candidateKeys.find(k => Object.prototype.hasOwnProperty.call(changes, k));
  if (hit) render(changes[hit].newValue);
});
