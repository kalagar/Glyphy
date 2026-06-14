(() => {
  // src/lib/config.js
  var DEFAULT_RTL_HOSTNAMES = /* @__PURE__ */ new Set([
    "www.youtube.com",
    "youtube.com",
    "studio.youtube.com"
  ]);

  // src/lib/storage.js
  function getCandidateKeys(h) {
    return h.startsWith("www.") ? [h, h.slice(4)] : [h, "www." + h];
  }
  function getConfig(host) {
    return new Promise((resolve) => {
      const keys = getCandidateKeys(host);
      chrome.storage.local.get(keys, (data) => {
        const key = keys.find((k) => data[k] !== void 0) || host;
        const cfg = data[key] !== void 0 ? data[key] : null;
        resolve({ cfg, key });
      });
    });
  }
  function setConfig(key, cfg) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.set({ [key]: cfg }, () => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        resolve();
      });
    });
  }
  function removeConfig(key) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.remove(key, () => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        resolve();
      });
    });
  }

  // src/lib/fonts.js
  var FALLBACK_FONTS = [
    { fontId: "Arial", displayName: "Arial" },
    { fontId: "Arial Black", displayName: "Arial Black" },
    { fontId: "Calibri", displayName: "Calibri" },
    { fontId: "Cambria", displayName: "Cambria" },
    { fontId: "Comic Sans MS", displayName: "Comic Sans MS" },
    { fontId: "Consolas", displayName: "Consolas" },
    { fontId: "Courier New", displayName: "Courier New" },
    { fontId: "DejaVu Sans", displayName: "DejaVu Sans" },
    { fontId: "DejaVu Serif", displayName: "DejaVu Serif" },
    { fontId: "Franklin Gothic Medium", displayName: "Franklin Gothic Medium" },
    { fontId: "Futura", displayName: "Futura" },
    { fontId: "Garamond", displayName: "Garamond" },
    { fontId: "Geneva", displayName: "Geneva" },
    { fontId: "Georgia", displayName: "Georgia" },
    { fontId: "Gill Sans", displayName: "Gill Sans" },
    { fontId: "Helvetica", displayName: "Helvetica" },
    { fontId: "Helvetica Neue", displayName: "Helvetica Neue" },
    { fontId: "Impact", displayName: "Impact" },
    { fontId: "Liberation Mono", displayName: "Liberation Mono" },
    { fontId: "Liberation Sans", displayName: "Liberation Sans" },
    { fontId: "Liberation Serif", displayName: "Liberation Serif" },
    { fontId: "Lucida Console", displayName: "Lucida Console" },
    { fontId: "Lucida Sans Unicode", displayName: "Lucida Sans Unicode" },
    { fontId: "Noto Sans", displayName: "Noto Sans" },
    { fontId: "Noto Serif", displayName: "Noto Serif" },
    { fontId: "Open Sans", displayName: "Open Sans" },
    { fontId: "Palatino Linotype", displayName: "Palatino Linotype" },
    { fontId: "Roboto", displayName: "Roboto" },
    { fontId: "Segoe UI", displayName: "Segoe UI" },
    { fontId: "Tahoma", displayName: "Tahoma" },
    { fontId: "Times New Roman", displayName: "Times New Roman" },
    { fontId: "Trebuchet MS", displayName: "Trebuchet MS" },
    { fontId: "Ubuntu", displayName: "Ubuntu" },
    { fontId: "Verdana", displayName: "Verdana" }
  ];
  function getInstalledFonts() {
    return new Promise((resolve) => {
      if (chrome.fontSettings) {
        chrome.fontSettings.getFontList((list) => {
          const seen = /* @__PURE__ */ new Set();
          const out = [];
          for (const f of list) {
            if (!seen.has(f.displayName)) {
              seen.add(f.displayName);
              out.push(f);
            }
          }
          resolve(out);
        });
      } else {
        resolve(FALLBACK_FONTS);
      }
    });
  }

  // src/popup.js
  var domainEl = document.getElementById("domain");
  var fontEl = document.getElementById("font");
  var fontTextEl = document.getElementById("font-text");
  var enabledEl = document.getElementById("enabled");
  var rtlEl = document.getElementById("rtl");
  var saveEl = document.getElementById("save");
  var resetEl = document.getElementById("reset");
  var statusEl = document.getElementById("status");
  var activeFontEl = document.getElementById("active-font");
  var hostname = null;
  var configKey = null;
  var currentCfg = {};
  function setStatus(msg) {
    statusEl.textContent = msg;
    if (msg) setTimeout(() => statusEl.textContent = "", 1500);
  }
  async function getHostname() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.url) return null;
    try {
      return new URL(tab.url).hostname || null;
    } catch {
      return null;
    }
  }
  async function loadFontList() {
    const fonts = await getInstalledFonts();
    const isFallback = fonts === FALLBACK_FONTS;
    for (const f of fonts) {
      const opt = document.createElement("option");
      opt.value = f.fontId;
      opt.textContent = f.displayName;
      fontEl.appendChild(opt);
    }
    if (isFallback) {
      fontTextEl.hidden = false;
    }
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
    const { cfg, key } = await getConfig(hostname);
    configKey = key;
    currentCfg = cfg && typeof cfg === "object" ? cfg : {};
    if (cfg) {
      if (cfg.font) {
        fontEl.value = cfg.font;
        if (!fontTextEl.hidden && fontEl.value !== cfg.font) {
          fontTextEl.value = cfg.font;
        }
      }
      enabledEl.checked = cfg.enabled !== false;
      rtlEl.checked = typeof cfg === "object" && Object.prototype.hasOwnProperty.call(cfg, "rtl") ? cfg.rtl : DEFAULT_RTL_HOSTNAMES.has(hostname);
    } else {
      rtlEl.checked = DEFAULT_RTL_HOSTNAMES.has(hostname);
    }
    activeFontEl.textContent = cfg?.font ? cfg.font : "No override set";
  }
  fontEl.addEventListener("change", () => {
    if (!fontTextEl.hidden) fontTextEl.value = "";
  });
  saveEl.addEventListener("click", async () => {
    if (!hostname) return;
    const key = configKey || hostname;
    const font = !fontTextEl.hidden && fontTextEl.value.trim() || fontEl.value;
    const config = { ...currentCfg, font, enabled: enabledEl.checked, rtl: rtlEl.checked };
    await setConfig(key, config);
    activeFontEl.textContent = font ? font : "No override set";
    setStatus("Saved.");
  });
  resetEl.addEventListener("click", async () => {
    if (!hostname) return;
    const key = configKey || hostname;
    try {
      await removeConfig(key);
    } catch (err) {
      setStatus("Reset failed.");
      return;
    }
    configKey = hostname;
    currentCfg = {};
    enabledEl.checked = true;
    rtlEl.checked = DEFAULT_RTL_HOSTNAMES.has(hostname);
    activeFontEl.textContent = "No override set";
    setStatus("Reset.");
  });
  document.getElementById("manage").addEventListener("click", (e) => {
    e.preventDefault();
    chrome.runtime.openOptionsPage();
  });
  init();
})();
