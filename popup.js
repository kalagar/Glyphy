// Glyphy popup logic.

const domainEl = document.getElementById("domain");
const fontEl = document.getElementById("font");
const fontTextEl = document.getElementById("font-text");
const enabledEl = document.getElementById("enabled");
const rtlEl = document.getElementById("rtl");
const saveEl = document.getElementById("save");
const resetEl = document.getElementById("reset");
const statusEl = document.getElementById("status");
const activeFontEl = document.getElementById("active-font");

const DEFAULT_RTL_HOSTNAMES = new Set(["www.youtube.com", "youtube.com", "studio.youtube.com"]);
// FALLBACK_FONTS is defined in fonts.js (loaded before this script).

let hostname = null;
let configKey = null; // actual storage key (may differ from hostname via www-fallback)
let currentCfg = {}; // last-loaded config; preserved on save to avoid dropping unknown fields

function getCandidateKeys(h) {
  return h.startsWith("www.") ? [h, h.slice(4)] : [h, "www." + h];
}

function setStatus(msg) {
  statusEl.textContent = msg;
  if (msg) setTimeout(() => (statusEl.textContent = ""), 1500);
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
function loadFontList() {
  return new Promise((resolve) => {
    if (chrome.fontSettings) {
      chrome.fontSettings.getFontList((fonts) => {
        // Deduplicate by displayName, keep alphabetical order.
        const seen = new Set();
        for (const f of fonts) {
          if (seen.has(f.displayName)) continue;
          seen.add(f.displayName);
          const opt = document.createElement("option");
          // fontId is the actual family name to use in CSS.
          opt.value = f.fontId;
          opt.textContent = f.displayName;
          fontEl.appendChild(opt);
        }
        resolve();
      });
    } else {
      // fontSettings unavailable: populate with curated list and reveal the
      // free-text input so the user can type any installed font name.
      for (const f of FALLBACK_FONTS) {
        const opt = document.createElement("option");
        opt.value = f.fontId;
        opt.textContent = f.displayName;
        fontEl.appendChild(opt);
      }
      fontTextEl.hidden = false;
      resolve();
    }
  });
}

async function init() {
  hostname = await getHostname();

  if (!hostname) {
    domainEl.textContent = "(no website)";
    fontEl.disabled = enabledEl.disabled = saveEl.disabled = resetEl.disabled = true;
    setStatus("Open a website to configure its font.");
    return;
  }

  domainEl.textContent = hostname;
  await loadFontList();

  // Load config — try exact hostname first, then www-prefix variant.
  const keys = getCandidateKeys(hostname);
  chrome.storage.local.get(keys, (data) => {
    configKey = keys.find(k => data[k] !== undefined) || hostname;
    const cfg = data[configKey];
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
      rtlEl.checked = typeof cfg === 'object' && Object.prototype.hasOwnProperty.call(cfg, 'rtl') ? cfg.rtl : DEFAULT_RTL_HOSTNAMES.has(hostname);
    } else {
      rtlEl.checked = DEFAULT_RTL_HOSTNAMES.has(hostname);
    }
    activeFontEl.textContent = cfg?.font ? cfg.font : "No override set";
  });
}

saveEl.addEventListener("click", () => {
  if (!hostname) return;
  const key = configKey || hostname;
  // In fallback mode (Firefox) prefer the free-text input when it has a value.
  const font = (!fontTextEl.hidden && fontTextEl.value.trim()) || fontEl.value;
  const config = { ...currentCfg, font, enabled: enabledEl.checked, rtl: rtlEl.checked };
  chrome.storage.local.set({ [key]: config }, () => {
    activeFontEl.textContent = font ? font : "No override set";
    setStatus("Saved.");
  });
});

resetEl.addEventListener("click", () => {
  if (!hostname) return;
  const key = configKey || hostname;
  chrome.storage.local.remove(key, () => {
    configKey = hostname;
    currentCfg = {};
    enabledEl.checked = true;
    rtlEl.checked = DEFAULT_RTL_HOSTNAMES.has(hostname);
    activeFontEl.textContent = "No override set";
    setStatus("Reset.");
  });
});

document.getElementById("manage").addEventListener("click", (e) => {
  e.preventDefault();
  chrome.runtime.openOptionsPage();
});

init();
