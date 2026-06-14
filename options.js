(() => {
  // src/lib/config.js
  var DEFAULT_RTL_HOSTNAMES = /* @__PURE__ */ new Set([
    "www.youtube.com",
    "youtube.com",
    "studio.youtube.com"
  ]);

  // src/lib/storage.js
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
  function getAllConfigs() {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(null, (data) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        resolve(data);
      });
    });
  }
  function setAllConfigs(data) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.set(data, () => {
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

  // src/options.js
  var POPULAR = [
    { label: "Google", hostname: "www.google.com" },
    { label: "Bing", hostname: "www.bing.com" },
    { label: "Yahoo", hostname: "www.yahoo.com" },
    { label: "ChatGPT", hostname: "chatgpt.com" },
    { label: "YouTube", hostname: "www.youtube.com" },
    { label: "Gmail", hostname: "mail.google.com" },
    { label: "Google Calendar", hostname: "calendar.google.com" },
    { label: "X (Twitter)", hostname: "x.com" },
    { label: "LinkedIn", hostname: "www.linkedin.com" },
    { label: "Reddit", hostname: "www.reddit.com" },
    { label: "GitHub", hostname: "github.com" },
    { label: "Twitch", hostname: "www.twitch.tv" },
    { label: "Netflix", hostname: "www.netflix.com" },
    { label: "Spotify", hostname: "open.spotify.com" },
    { label: "Notion", hostname: "www.notion.so" },
    { label: "Discord", hostname: "discord.com" },
    { label: "Medium", hostname: "medium.com" }
  ];
  var POPULAR_HOSTNAMES = new Set(POPULAR.map((p) => p.hostname));
  var fonts = [];
  function buildFontOptions(sel, selected) {
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "\u2014 not set \u2014";
    sel.appendChild(placeholder);
    for (const f of fonts) {
      const opt = document.createElement("option");
      opt.value = f.fontId;
      opt.textContent = f.displayName;
      if (f.fontId === selected) opt.selected = true;
      sel.appendChild(opt);
    }
  }
  function buildRow(hostname, cfg, isPopular, label) {
    const tr = document.createElement("tr");
    tr.dataset.hostname = hostname;
    if (cfg) tr.classList.add("configured");
    const tdLabel = document.createElement("td");
    tdLabel.className = "td-label";
    if (label) {
      const nameSpan = document.createElement("span");
      nameSpan.className = "site-name";
      nameSpan.textContent = label;
      const hostSpan = document.createElement("span");
      hostSpan.className = "site-host";
      hostSpan.textContent = hostname;
      tdLabel.appendChild(nameSpan);
      tdLabel.appendChild(hostSpan);
    } else {
      tdLabel.textContent = hostname;
    }
    tr.appendChild(tdLabel);
    const tdFont = document.createElement("td");
    const sel = document.createElement("select");
    buildFontOptions(sel, cfg?.font);
    tdFont.appendChild(sel);
    tr.appendChild(tdFont);
    const tdOn = document.createElement("td");
    tdOn.className = "td-on";
    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.className = "cb-enabled";
    cb.checked = cfg ? cfg.enabled !== false : true;
    tdOn.appendChild(cb);
    tr.appendChild(tdOn);
    const tdRtl = document.createElement("td");
    tdRtl.className = "td-rtl";
    const rtlCb = document.createElement("input");
    rtlCb.type = "checkbox";
    rtlCb.className = "cb-rtl";
    rtlCb.checked = cfg && typeof cfg === "object" && Object.prototype.hasOwnProperty.call(cfg, "rtl") ? cfg.rtl : DEFAULT_RTL_HOSTNAMES.has(hostname);
    tdRtl.appendChild(rtlCb);
    tr.appendChild(tdRtl);
    const tdAct = document.createElement("td");
    tdAct.className = "td-actions";
    const saveBtn = document.createElement("button");
    saveBtn.textContent = "Save";
    saveBtn.className = "primary btn-sm";
    saveBtn.addEventListener("click", () => saveRow(tr, hostname, isPopular));
    tdAct.appendChild(saveBtn);
    const removeBtn = document.createElement("button");
    removeBtn.textContent = "Remove";
    removeBtn.className = "btn-sm";
    removeBtn.style.visibility = cfg ? "visible" : "hidden";
    removeBtn.addEventListener("click", () => removeRow(tr, hostname, isPopular));
    tdAct.appendChild(removeBtn);
    tr.appendChild(tdAct);
    return tr;
  }
  async function saveRow(tr, hostname, isPopular) {
    const sel = tr.querySelector("select");
    const enabledCb = tr.querySelector(".cb-enabled");
    const rtlCb = tr.querySelector(".cb-rtl");
    const config = { font: sel.value, enabled: enabledCb.checked, rtl: rtlCb.checked };
    try {
      await setConfig(hostname, config);
    } catch (err) {
      alert("Save failed: " + err.message);
      return false;
    }
    tr.classList.add("configured");
    const removeBtn = tr.querySelectorAll(".td-actions button")[1];
    removeBtn.style.visibility = "visible";
    flash(tr, "saved");
    return true;
  }
  async function removeRow(tr, hostname, isPopular) {
    try {
      await removeConfig(hostname);
    } catch (err) {
      alert("Remove failed: " + err.message);
      return;
    }
    if (isPopular) {
      tr.classList.remove("configured");
      tr.querySelector("select").value = "";
      tr.querySelector(".cb-enabled").checked = true;
      tr.querySelector(".cb-rtl").checked = DEFAULT_RTL_HOSTNAMES.has(hostname);
      tr.querySelectorAll(".td-actions button")[1].style.visibility = "hidden";
      flash(tr, "removed");
    } else {
      tr.remove();
      refreshCustomSection();
    }
  }
  function flash(tr, type) {
    tr.classList.add("flash-" + type);
    setTimeout(() => tr.classList.remove("flash-" + type), 900);
  }
  function refreshCustomSection() {
    const sec = document.getElementById("custom-section");
    sec.hidden = document.getElementById("custom-body").children.length === 0;
  }
  function exportSettings() {
    getAllConfigs().then((all) => {
      const json = JSON.stringify(all, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "glyphy-settings.json";
      a.click();
      URL.revokeObjectURL(url);
    }).catch((err) => {
      alert("Export failed: " + err.message);
    });
  }
  function importSettings(file) {
    const errorEl = document.getElementById("import-error");
    errorEl.hidden = true;
    const reader = new FileReader();
    reader.onerror = () => {
      errorEl.textContent = "Import failed: could not read the file.";
      errorEl.hidden = false;
    };
    reader.onload = (e) => {
      let data;
      try {
        data = JSON.parse(e.target.result);
      } catch (_) {
        errorEl.textContent = "Import failed: the file is not valid JSON.";
        errorEl.hidden = false;
        return;
      }
      if (typeof data !== "object" || data === null || Array.isArray(data)) {
        errorEl.textContent = "Import failed: expected a JSON object.";
        errorEl.hidden = false;
        return;
      }
      setAllConfigs(data).then(() => {
        location.reload();
      }).catch((err) => {
        errorEl.textContent = "Import failed: " + err.message;
        errorEl.hidden = false;
      });
    };
    reader.readAsText(file);
  }
  async function init() {
    fonts = await getInstalledFonts();
    const isFallback = fonts === FALLBACK_FONTS;
    let all;
    try {
      all = await getAllConfigs();
    } catch (err) {
      all = {};
    }
    const popularBody = document.getElementById("popular-body");
    for (const site of POPULAR) {
      popularBody.appendChild(buildRow(site.hostname, all[site.hostname], true, site.label));
    }
    const customBody = document.getElementById("custom-body");
    for (const [host, cfg] of Object.entries(all)) {
      if (!POPULAR_HOSTNAMES.has(host)) {
        customBody.appendChild(buildRow(host, cfg, false, null));
      }
    }
    refreshCustomSection();
    const newFontSel = document.getElementById("new-font");
    const newFontTextEl = document.getElementById("new-font-text");
    for (const f of fonts) {
      const opt = document.createElement("option");
      opt.value = f.fontId;
      opt.textContent = f.displayName;
      newFontSel.appendChild(opt);
    }
    if (isFallback) {
      newFontTextEl.hidden = false;
    }
    const newDomain = document.getElementById("new-domain");
    const addBtn = document.getElementById("add-btn");
    const updateAddBtn = () => {
      const fontVal = !newFontTextEl.hidden && newFontTextEl.value.trim() || newFontSel.value;
      addBtn.disabled = !newDomain.value.trim() || !fontVal;
    };
    newDomain.addEventListener("input", updateAddBtn);
    newFontSel.addEventListener("change", updateAddBtn);
    newFontTextEl.addEventListener("input", updateAddBtn);
    addBtn.addEventListener("click", async () => {
      let host = newDomain.value.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
      const font = !newFontTextEl.hidden && newFontTextEl.value.trim() || newFontSel.value;
      if (!host || !font) return;
      const enabled = document.getElementById("new-enabled").checked;
      if (POPULAR_HOSTNAMES.has(host)) {
        const row = popularBody.querySelector(`[data-hostname="${CSS.escape(host)}"]`);
        if (row) {
          row.querySelector("select").value = font;
          row.querySelector(".cb-enabled").checked = enabled;
          if (!await saveRow(row, host, true)) return;
          row.scrollIntoView({ behavior: "smooth", block: "center" });
          newDomain.value = "";
          updateAddBtn();
          return;
        }
      }
      const existing = customBody.querySelector(`[data-hostname="${CSS.escape(host)}"]`);
      if (existing) {
        existing.querySelector("select").value = font;
        existing.querySelector(".cb-enabled").checked = enabled;
        if (!await saveRow(existing, host, false)) return;
        newDomain.value = "";
        updateAddBtn();
        return;
      }
      const cfg = { font, enabled };
      try {
        await setConfig(host, cfg);
      } catch (err) {
        alert("Save failed: " + err.message);
        return;
      }
      customBody.appendChild(buildRow(host, cfg, false, null));
      refreshCustomSection();
      newDomain.value = "";
      newFontSel.value = "";
      if (!newFontTextEl.hidden) newFontTextEl.value = "";
      updateAddBtn();
    });
    document.getElementById("export-btn").addEventListener("click", exportSettings);
    const importFile = document.getElementById("import-file");
    document.getElementById("import-btn").addEventListener("click", () => importFile.click());
    importFile.addEventListener("change", () => {
      if (importFile.files.length > 0) {
        importSettings(importFile.files[0]);
        importFile.value = "";
      }
    });
  }
  init();
})();
