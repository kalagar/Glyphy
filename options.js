// FontFreedom options page.

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
  cb.checked = cfg ? cfg.enabled !== false : true;
  tdOn.appendChild(cb);
  tr.appendChild(tdOn);

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

function saveRow(tr, hostname, isPopular) {
  const sel = tr.querySelector('select');
  if (!sel.value) return;
  const cb = tr.querySelector('input[type=checkbox]');
  const config = { font: sel.value, enabled: cb.checked };
  chrome.storage.local.set({ [hostname]: config }, () => {
    tr.classList.add('configured');
    const removeBtn = tr.querySelectorAll('.td-actions button')[1];
    removeBtn.style.visibility = 'visible';
    flash(tr, 'saved');
  });
}

function removeRow(tr, hostname, isPopular) {
  chrome.storage.local.remove(hostname, () => {
    if (isPopular) {
      tr.classList.remove('configured');
      tr.querySelector('select').value = '';
      tr.querySelector('input[type=checkbox]').checked = true;
      tr.querySelectorAll('.td-actions button')[1].style.visibility = 'hidden';
      flash(tr, 'removed');
    } else {
      tr.remove();
      refreshCustomSection();
    }
  });
}

function flash(tr, type) {
  tr.classList.add('flash-' + type);
  setTimeout(() => tr.classList.remove('flash-' + type), 900);
}

function refreshCustomSection() {
  const sec = document.getElementById('custom-section');
  sec.hidden = document.getElementById('custom-body').children.length === 0;
}

// ── init ──────────────────────────────────────────────────────────────────────

async function init() {
  // Load installed fonts
  fonts = await new Promise(resolve => {
    chrome.fontSettings.getFontList(list => {
      const seen = new Set();
      const out = [];
      for (const f of list) {
        if (!seen.has(f.displayName)) { seen.add(f.displayName); out.push(f); }
      }
      resolve(out);
    });
  });

  // Load all saved configs
  const all = await new Promise(resolve => chrome.storage.local.get(null, resolve));

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
  for (const f of fonts) {
    const opt = document.createElement('option');
    opt.value = f.fontId;
    opt.textContent = f.displayName;
    newFontSel.appendChild(opt);
  }

  // Enable Add button only when both domain and font are filled
  const newDomain = document.getElementById('new-domain');
  const addBtn = document.getElementById('add-btn');
  const updateAddBtn = () => {
    addBtn.disabled = !newDomain.value.trim() || !newFontSel.value;
  };
  newDomain.addEventListener('input', updateAddBtn);
  newFontSel.addEventListener('change', updateAddBtn);

  addBtn.addEventListener('click', () => {
    // Strip protocol + path, normalise to lowercase
    let host = newDomain.value.trim().toLowerCase()
      .replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    if (!host || !newFontSel.value) return;

    const font = newFontSel.value;
    const enabled = document.getElementById('new-enabled').checked;

    // If it's a popular site, update that row instead of creating a custom one
    if (POPULAR_HOSTNAMES.has(host)) {
      const row = popularBody.querySelector(`[data-hostname="${CSS.escape(host)}"]`);
      if (row) {
        row.querySelector('select').value = font;
        row.querySelector('input[type=checkbox]').checked = enabled;
        saveRow(row, host, true);
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
      existing.querySelector('input[type=checkbox]').checked = enabled;
      saveRow(existing, host, false);
      newDomain.value = '';
      updateAddBtn();
      return;
    }

    // New custom row
    const cfg = { font, enabled };
    chrome.storage.local.set({ [host]: cfg }, () => {
      customBody.appendChild(buildRow(host, cfg, false, null));
      refreshCustomSection();
      newDomain.value = '';
      newFontSel.value = '';
      updateAddBtn();
    });
  });
}

init();
