// Glyphy options page — thin entry point.
// Wires DOM rows to storage; all business logic lives in src/lib/.

import { DEFAULT_RTL_HOSTNAMES } from './lib/config.js';
import { setConfig, removeConfig, getAllConfigs, setAllConfigs } from './lib/storage.js';
import { getInstalledFonts, FALLBACK_FONTS } from './lib/fonts.js';

const POPULAR = [
  { label: 'Google',           hostname: 'www.google.com' },
  { label: 'Bing',             hostname: 'www.bing.com' },
  { label: 'Yahoo',            hostname: 'www.yahoo.com' },
  { label: 'ChatGPT',          hostname: 'chatgpt.com' },
  { label: 'YouTube',          hostname: 'www.youtube.com' },
  { label: 'Gmail',            hostname: 'mail.google.com' },
  { label: 'Google Calendar',  hostname: 'calendar.google.com' },
  { label: 'X (Twitter)',      hostname: 'x.com' },
  { label: 'LinkedIn',         hostname: 'www.linkedin.com' },
  { label: 'Reddit',           hostname: 'www.reddit.com' },
  { label: 'GitHub',           hostname: 'github.com' },
  { label: 'Twitch',           hostname: 'www.twitch.tv' },
  { label: 'Netflix',          hostname: 'www.netflix.com' },
  { label: 'Spotify',          hostname: 'open.spotify.com' },
  { label: 'Notion',           hostname: 'www.notion.so' },
  { label: 'Discord',          hostname: 'discord.com' },
  { label: 'Medium',           hostname: 'medium.com' },
];

const POPULAR_HOSTNAMES = new Set(POPULAR.map(p => p.hostname));

let fonts = [];

// ── font select helpers ───────────────────────────────────────────────────────

function buildFontOptions(sel, selected) {
  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.textContent = '— not set —';
  sel.appendChild(placeholder);
  for (const f of fonts) {
    const opt = document.createElement('option');
    opt.value = f.fontId;
    opt.textContent = f.displayName;
    if (f.fontId === selected) opt.selected = true;
    sel.appendChild(opt);
  }
}

// ── row rendering ─────────────────────────────────────────────────────────────

function buildRow(hostname, cfg, isPopular, label) {
  const tr = document.createElement('tr');
  tr.dataset.hostname = hostname;
  if (cfg) tr.classList.add('configured');

  // Site / hostname cell
  const tdLabel = document.createElement('td');
  tdLabel.className = 'td-label';
  if (label) {
    const nameSpan = document.createElement('span');
    nameSpan.className = 'site-name';
    nameSpan.textContent = label;
    const hostSpan = document.createElement('span');
    hostSpan.className = 'site-host';
    hostSpan.textContent = hostname;
    tdLabel.appendChild(nameSpan);
    tdLabel.appendChild(hostSpan);
  } else {
    tdLabel.textContent = hostname;
  }
  tr.appendChild(tdLabel);

  // Font select cell
  const tdFont = document.createElement('td');
  const sel = document.createElement('select');
  buildFontOptions(sel, cfg?.font);
  tdFont.appendChild(sel);
  tr.appendChild(tdFont);

  // Enabled toggle cell
  const tdOn = document.createElement('td');
  tdOn.className = 'td-on';
  const cb = document.createElement('input');
  cb.type = 'checkbox';
  cb.className = 'cb-enabled';
  cb.checked = cfg ? cfg.enabled !== false : true;
  tdOn.appendChild(cb);
  tr.appendChild(tdOn);

  // RTL toggle cell
  const tdRtl = document.createElement('td');
  tdRtl.className = 'td-rtl';
  const rtlCb = document.createElement('input');
  rtlCb.type = 'checkbox';
  rtlCb.className = 'cb-rtl';
  rtlCb.checked = cfg && typeof cfg === 'object' && Object.prototype.hasOwnProperty.call(cfg, 'rtl')
    ? cfg.rtl
    : DEFAULT_RTL_HOSTNAMES.has(hostname);
  tdRtl.appendChild(rtlCb);
  tr.appendChild(tdRtl);

  // Actions cell
  const tdAct = document.createElement('td');
  tdAct.className = 'td-actions';

  const saveBtn = document.createElement('button');
  saveBtn.textContent = 'Save';
  saveBtn.className = 'primary btn-sm';
  saveBtn.addEventListener('click', () => saveRow(tr, hostname, isPopular));
  tdAct.appendChild(saveBtn);

  const removeBtn = document.createElement('button');
  removeBtn.textContent = 'Remove';
  removeBtn.className = 'btn-sm';
  removeBtn.style.visibility = cfg ? 'visible' : 'hidden';
  removeBtn.addEventListener('click', () => removeRow(tr, hostname, isPopular));
  tdAct.appendChild(removeBtn);

  tr.appendChild(tdAct);
  return tr;
}

// ── save / remove ─────────────────────────────────────────────────────────────

async function saveRow(tr, hostname, isPopular) {
  const sel = tr.querySelector('select');
  const enabledCb = tr.querySelector('.cb-enabled');
  const rtlCb = tr.querySelector('.cb-rtl');
  const config = { font: sel.value, enabled: enabledCb.checked, rtl: rtlCb.checked };
  try {
    await setConfig(hostname, config);
  } catch (err) {
    alert('Save failed: ' + err.message);
    return false;
  }
  tr.classList.add('configured');
  const removeBtn = tr.querySelectorAll('.td-actions button')[1];
  removeBtn.style.visibility = 'visible';
  flash(tr, 'saved');
  return true;
}

async function removeRow(tr, hostname, isPopular) {
  try {
    await removeConfig(hostname);
  } catch (err) {
    alert('Remove failed: ' + err.message);
    return;
  }
  if (isPopular) {
    tr.classList.remove('configured');
    tr.querySelector('select').value = '';
    tr.querySelector('.cb-enabled').checked = true;
    tr.querySelector('.cb-rtl').checked = DEFAULT_RTL_HOSTNAMES.has(hostname);
    tr.querySelectorAll('.td-actions button')[1].style.visibility = 'hidden';
    flash(tr, 'removed');
  } else {
    tr.remove();
    refreshCustomSection();
  }
}

function flash(tr, type) {
  tr.classList.add('flash-' + type);
  setTimeout(() => tr.classList.remove('flash-' + type), 900);
}

function refreshCustomSection() {
  const sec = document.getElementById('custom-section');
  sec.hidden = document.getElementById('custom-body').children.length === 0;
}

// ── export / import ───────────────────────────────────────────────────────────

function exportSettings() {
  getAllConfigs().then(all => {
    const json = JSON.stringify(all, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'glyphy-settings.json';
    a.click();
    URL.revokeObjectURL(url);
  }).catch(err => {
    alert('Export failed: ' + err.message);
  });
}

function importSettings(file) {
  const errorEl = document.getElementById('import-error');
  errorEl.hidden = true;

  const reader = new FileReader();
  reader.onerror = () => {
    errorEl.textContent = 'Import failed: could not read the file.';
    errorEl.hidden = false;
  };
  reader.onload = (e) => {
    let data;
    try {
      data = JSON.parse(e.target.result);
    } catch (_) {
      errorEl.textContent = 'Import failed: the file is not valid JSON.';
      errorEl.hidden = false;
      return;
    }
    if (typeof data !== 'object' || data === null || Array.isArray(data)) {
      errorEl.textContent = 'Import failed: expected a JSON object.';
      errorEl.hidden = false;
      return;
    }
    setAllConfigs(data).then(() => {
      location.reload();
    }).catch(err => {
      errorEl.textContent = 'Import failed: ' + err.message;
      errorEl.hidden = false;
    });
  };
  reader.readAsText(file);
}

// ── init ──────────────────────────────────────────────────────────────────────

async function init() {
  fonts = await getInstalledFonts();
  const isFallback = fonts === FALLBACK_FONTS;

  // Load all saved configs
  let all;
  try {
    all = await getAllConfigs();
  } catch (err) {
    all = {};
  }

  // Popular rows (always visible)
  const popularBody = document.getElementById('popular-body');
  for (const site of POPULAR) {
    popularBody.appendChild(buildRow(site.hostname, all[site.hostname], true, site.label));
  }

  // Custom rows (non-popular configured sites)
  const customBody = document.getElementById('custom-body');
  for (const [host, cfg] of Object.entries(all)) {
    if (!POPULAR_HOSTNAMES.has(host)) {
      customBody.appendChild(buildRow(host, cfg, false, null));
    }
  }
  refreshCustomSection();

  // Populate "Add custom" font select
  const newFontSel = document.getElementById('new-font');
  const newFontTextEl = document.getElementById('new-font-text');
  for (const f of fonts) {
    const opt = document.createElement('option');
    opt.value = f.fontId;
    opt.textContent = f.displayName;
    newFontSel.appendChild(opt);
  }

  // In fallback mode (Safari/Firefox), reveal the free-text input so the user
  // can type any installed font name not in the curated list.
  if (isFallback) {
    newFontTextEl.hidden = false;
  }

  // Enable Add button only when both domain and font are filled
  const newDomain = document.getElementById('new-domain');
  const addBtn = document.getElementById('add-btn');
  const updateAddBtn = () => {
    const fontVal = (!newFontTextEl.hidden && newFontTextEl.value.trim()) || newFontSel.value;
    addBtn.disabled = !newDomain.value.trim() || !fontVal;
  };
  newDomain.addEventListener('input', updateAddBtn);
  newFontSel.addEventListener('change', updateAddBtn);
  newFontTextEl.addEventListener('input', updateAddBtn);

  addBtn.addEventListener('click', async () => {
    // Strip protocol + path, normalise to lowercase
    let host = newDomain.value.trim().toLowerCase()
      .replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    // In fallback mode (Safari/Firefox) prefer the free-text input when set.
    const font = (!newFontTextEl.hidden && newFontTextEl.value.trim()) || newFontSel.value;
    if (!host || !font) return;

    const enabled = document.getElementById('new-enabled').checked;

    // If it's a popular site, update that row instead of creating a custom one
    if (POPULAR_HOSTNAMES.has(host)) {
      const row = popularBody.querySelector(`[data-hostname="${CSS.escape(host)}"]`);
      if (row) {
        row.querySelector('select').value = font;
        row.querySelector('.cb-enabled').checked = enabled;
        if (!await saveRow(row, host, true)) return;
        row.scrollIntoView({ behavior: 'smooth', block: 'center' });
        newDomain.value = '';
        updateAddBtn();
        return;
      }
    }

    // Update existing custom row if already present
    const existing = customBody.querySelector(`[data-hostname="${CSS.escape(host)}"]`);
    if (existing) {
      existing.querySelector('select').value = font;
      existing.querySelector('.cb-enabled').checked = enabled;
      if (!await saveRow(existing, host, false)) return;
      newDomain.value = '';
      updateAddBtn();
      return;
    }

    // New custom row
    const cfg = { font, enabled };
    try {
      await setConfig(host, cfg);
    } catch (err) {
      alert('Save failed: ' + err.message);
      return;
    }
    customBody.appendChild(buildRow(host, cfg, false, null));
    refreshCustomSection();
    newDomain.value = '';
    newFontSel.value = '';
    if (!newFontTextEl.hidden) newFontTextEl.value = '';
    updateAddBtn();
  });

  // Export / import
  document.getElementById('export-btn').addEventListener('click', exportSettings);

  const importFile = document.getElementById('import-file');
  document.getElementById('import-btn').addEventListener('click', () => importFile.click());
  importFile.addEventListener('change', () => {
    if (importFile.files.length > 0) {
      importSettings(importFile.files[0]);
      importFile.value = '';
    }
  });
}

init();
