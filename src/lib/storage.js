// Storage helpers — all chrome.storage access goes through this module.

/**
 * Returns candidate storage keys for a hostname:
 * tries both www-prefixed and bare variants so a rule saved as "google.com"
 * also applies on "www.google.com" and vice versa.
 *
 * @param {string} h  hostname
 * @returns {string[]}
 */
export function getCandidateKeys(h) {
  return h.startsWith('www.') ? [h, h.slice(4)] : [h, 'www.' + h];
}

/**
 * Reads the config for a hostname (trying www-fallback key too).
 * Resolves to `{ cfg, key }` where `cfg` is the stored object (or null) and
 * `key` is the actual storage key that matched (or the hostname itself).
 *
 * @param {string} host
 * @returns {Promise<{cfg: object|null, key: string}>}
 */
export function getConfig(host) {
  return new Promise(resolve => {
    const keys = getCandidateKeys(host);
    chrome.storage.local.get(keys, data => {
      const key = keys.find(k => data[k] !== undefined) || host;
      const cfg = data[key] !== undefined ? data[key] : null;
      resolve({ cfg, key });
    });
  });
}

/**
 * Writes a config object for the given storage key.
 *
 * @param {string} key   exact storage key (hostname or www-variant)
 * @param {object} cfg
 * @returns {Promise<void>}
 */
export function setConfig(key, cfg) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ [key]: cfg }, () => {
      if (chrome.runtime.lastError) { reject(new Error(chrome.runtime.lastError.message)); return; }
      resolve();
    });
  });
}

/**
 * Removes the config for the given storage key.
 *
 * @param {string} key
 * @returns {Promise<void>}
 */
export function removeConfig(key) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.remove(key, () => {
      if (chrome.runtime.lastError) { reject(new Error(chrome.runtime.lastError.message)); return; }
      resolve();
    });
  });
}

/**
 * Returns all stored configs as a plain object.
 *
 * @returns {Promise<object>}
 */
export function getAllConfigs() {
  return new Promise(resolve => chrome.storage.local.get(null, resolve));
}
