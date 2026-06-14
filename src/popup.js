// Glyphy popup — thin entry point.
// Wires DOM elements to storage; all business logic lives in src/lib/.

import { DEFAULT_RTL_HOSTNAMES } from './lib/config.js';
import { getCandidateKeys, getConfig, setConfig, removeConfig } from './lib/storage.js';
import { getInstalledFonts, FALLBACK_FONTS } from './lib/fonts.js';

const domainEl    = document.getElementById('domain');
const fontEl      = document.getElementById('font');
const fontTextEl  = document.getElementById('font-text');
const enabledEl   = document.getElementById('enabled');
const rtlEl       = document.getElementById('rtl');
const saveEl      = document.getElementById('save');
const resetEl     = document.getElementById('reset');
const statusEl    = document.getElementById('status');
const activeFontEl = document.getElementById('active-font');

let hostname  = null;
let configKey = null; // actual storage key (may differ from hostname via www-fallback)
let currentCfg = {}; // last-loaded config; preserved on save to avoid dropping unknown fields

function setStatus(msg) {
  statusEl.textContent = msg;
  if (msg) setTimeout(() => (statusEl.textContent = ''), 1500);
}

// Get the active tab's hostname.
async function getHostname() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.url) return null;
  try {
    return new URL(tab.url).hostname || null;
  } catch {
    return null;
  }
}

// Populate the <select> with installed system fonts.
// Falls back to a curated list + free-text input when chrome.fontSettings is
// unavailable (e.g. Firefox).
async function loadFontList() {
  const fonts = await getInstalledFonts();
  const isFallback = fonts === FALLBACK_FONTS;

  for (const f of fonts) {
    const opt = document.createElement('option');
    opt.value = f.fontId;
    opt.textContent = f.displayName;
    fontEl.appendChild(opt);
  }

  if (isFallback) {
    // fontSettings unavailable: reveal the free-text input so the user can
    // type any installed font name.
    fontTextEl.hidden = false;
  }
}

async function init() {
  hostname = await getHostname();

  if (!hostname) {
    domainEl.textContent = '(no website)';
    fontEl.disabled = enabledEl.disabled = saveEl.disabled = resetEl.disabled = true;
    setStatus('Open a website to configure its font.');
    return;
  }

  domainEl.textContent = hostname;
  await loadFontList();

  // Load config — try exact hostname first, then www-prefix variant.
  const { cfg, key } = await getConfig(hostname);
  configKey = key;
  currentCfg = cfg && typeof cfg === 'object' ? cfg : {};

  if (cfg) {
    if (cfg.font) {
      fontEl.value = cfg.font;
      // In fallback mode the curated list may not contain the saved font;
      // show it in the free-text input so the value is preserved.
      if (!fontTextEl.hidden && fontEl.value !== cfg.font) {
        fontTextEl.value = cfg.font;
      }
    }
    enabledEl.checked = cfg.enabled !== false;
    rtlEl.checked = typeof cfg === 'object' && Object.prototype.hasOwnProperty.call(cfg, 'rtl')
      ? cfg.rtl
      : DEFAULT_RTL_HOSTNAMES.has(hostname);
  } else {
    rtlEl.checked = DEFAULT_RTL_HOSTNAMES.has(hostname);
  }

  activeFontEl.textContent = cfg?.font ? cfg.font : 'No override set';
}

// In fallback mode, clear the free-text input when the user picks a curated
// font from the dropdown so the selection reliably takes effect on save.
fontEl.addEventListener('change', () => {
  if (!fontTextEl.hidden) fontTextEl.value = '';
});

saveEl.addEventListener('click', async () => {
  if (!hostname) return;
  const key = configKey || hostname;
  // In fallback mode (Firefox) prefer the free-text input when it has a value.
  const font = (!fontTextEl.hidden && fontTextEl.value.trim()) || fontEl.value;
  const config = { ...currentCfg, font, enabled: enabledEl.checked, rtl: rtlEl.checked };
  await setConfig(key, config);
  activeFontEl.textContent = font ? font : 'No override set';
  setStatus('Saved.');
});

resetEl.addEventListener('click', async () => {
  if (!hostname) return;
  const key = configKey || hostname;
  try {
    await removeConfig(key);
  } catch (err) {
    setStatus('Reset failed.');
    return;
  }
  configKey = hostname;
  currentCfg = {};
  enabledEl.checked = true;
  rtlEl.checked = DEFAULT_RTL_HOSTNAMES.has(hostname);
  activeFontEl.textContent = 'No override set';
  setStatus('Reset.');
});

document.getElementById('manage').addEventListener('click', (e) => {
  e.preventDefault();
  chrome.runtime.openOptionsPage();
});

init();
