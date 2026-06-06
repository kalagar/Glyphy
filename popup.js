// Glyphy popup logic.

const domainEl = document.getElementById("domain");
const fontEl = document.getElementById("font");
const enabledEl = document.getElementById("enabled");
const saveEl = document.getElementById("save");
const resetEl = document.getElementById("reset");
const statusEl = document.getElementById("status");
const activeFontEl = document.getElementById("active-font");

let hostname = null;
let configKey = null; // actual storage key (may differ from hostname via www-fallback)

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
function loadFontList() {
  return new Promise((resolve) => {
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
    if (cfg) {
      if (cfg.font) fontEl.value = cfg.font;
      enabledEl.checked = cfg.enabled !== false;
    }
    activeFontEl.textContent = cfg?.font ? cfg.font : "No override set";
  });
}

saveEl.addEventListener("click", () => {
  if (!hostname) return;
  const key = configKey || hostname;
  const config = { font: fontEl.value, enabled: enabledEl.checked };
  chrome.storage.local.set({ [key]: config }, () => {
    activeFontEl.textContent = fontEl.value ? fontEl.value : "No override set";
    setStatus("Saved.");
  });
});

resetEl.addEventListener("click", () => {
  if (!hostname) return;
  const key = configKey || hostname;
  chrome.storage.local.remove(key, () => {
    configKey = hostname;
    enabledEl.checked = true;
    activeFontEl.textContent = "No override set";
    setStatus("Reset.");
  });
});

document.getElementById("manage").addEventListener("click", (e) => {
  e.preventDefault();
  chrome.runtime.openOptionsPage();
});

init();
