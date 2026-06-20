// Shared config constants and helpers — single source of truth.

/** Hostnames that have RTL support enabled by default. */
export const DEFAULT_RTL_HOSTNAMES = new Set([
  'www.youtube.com',
  'youtube.com',
  'studio.youtube.com',
]);

/**
 * Hostnames that require site-specific RTL CSS targeting ChatGPT's
 * response DOM structure rather than the generic lang/dir selectors.
 */
export const CHATGPT_HOSTNAMES = new Set([
  'chatgpt.com',
  'www.chatgpt.com',
]);

/**
 * Resolves whether RTL should be active for a hostname + config pair.
 *   • If enabled is false, always returns false.
 *   • If cfg.rtl is explicitly set, honours it.
 *   • Otherwise falls back to DEFAULT_RTL_HOSTNAMES membership so existing
 *     YouTube users are not affected by the addition of the per-site toggle.
 *
 * @param {string} hostname
 * @param {object|null|undefined} cfg
 * @param {boolean} enabled
 * @returns {boolean}
 */
export function resolveRtl(hostname, cfg, enabled) {
  if (!enabled) return false;
  if (cfg && typeof cfg === 'object' && Object.prototype.hasOwnProperty.call(cfg, 'rtl')) {
    return cfg.rtl;
  }
  return DEFAULT_RTL_HOSTNAMES.has(hostname);
}
