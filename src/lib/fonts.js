// Font helpers — curated fallback list and installer-font loader with dedup.

/**
 * Curated fallback font list used when chrome.fontSettings is unavailable
 * (e.g. Firefox). Each entry matches the {fontId, displayName} shape returned
 * by chrome.fontSettings.getFontList().
 */
export const FALLBACK_FONTS = [
  { fontId: 'Arial', displayName: 'Arial' },
  { fontId: 'Arial Black', displayName: 'Arial Black' },
  { fontId: 'Calibri', displayName: 'Calibri' },
  { fontId: 'Cambria', displayName: 'Cambria' },
  { fontId: 'Comic Sans MS', displayName: 'Comic Sans MS' },
  { fontId: 'Consolas', displayName: 'Consolas' },
  { fontId: 'Courier New', displayName: 'Courier New' },
  { fontId: 'DejaVu Sans', displayName: 'DejaVu Sans' },
  { fontId: 'DejaVu Serif', displayName: 'DejaVu Serif' },
  { fontId: 'Franklin Gothic Medium', displayName: 'Franklin Gothic Medium' },
  { fontId: 'Futura', displayName: 'Futura' },
  { fontId: 'Garamond', displayName: 'Garamond' },
  { fontId: 'Geneva', displayName: 'Geneva' },
  { fontId: 'Georgia', displayName: 'Georgia' },
  { fontId: 'Gill Sans', displayName: 'Gill Sans' },
  { fontId: 'Helvetica', displayName: 'Helvetica' },
  { fontId: 'Helvetica Neue', displayName: 'Helvetica Neue' },
  { fontId: 'Impact', displayName: 'Impact' },
  { fontId: 'Liberation Mono', displayName: 'Liberation Mono' },
  { fontId: 'Liberation Sans', displayName: 'Liberation Sans' },
  { fontId: 'Liberation Serif', displayName: 'Liberation Serif' },
  { fontId: 'Lucida Console', displayName: 'Lucida Console' },
  { fontId: 'Lucida Sans Unicode', displayName: 'Lucida Sans Unicode' },
  { fontId: 'Noto Sans', displayName: 'Noto Sans' },
  { fontId: 'Noto Serif', displayName: 'Noto Serif' },
  { fontId: 'Open Sans', displayName: 'Open Sans' },
  { fontId: 'Palatino Linotype', displayName: 'Palatino Linotype' },
  { fontId: 'Roboto', displayName: 'Roboto' },
  { fontId: 'Segoe UI', displayName: 'Segoe UI' },
  { fontId: 'Tahoma', displayName: 'Tahoma' },
  { fontId: 'Times New Roman', displayName: 'Times New Roman' },
  { fontId: 'Trebuchet MS', displayName: 'Trebuchet MS' },
  { fontId: 'Ubuntu', displayName: 'Ubuntu' },
  { fontId: 'Verdana', displayName: 'Verdana' },
];

/**
 * Returns the list of installed system fonts, deduplicated by displayName.
 * Falls back to FALLBACK_FONTS when chrome.fontSettings is unavailable.
 *
 * @returns {Promise<Array<{fontId: string, displayName: string}>>}
 */
export function getInstalledFonts() {
  return new Promise(resolve => {
    if (chrome.fontSettings) {
      chrome.fontSettings.getFontList(list => {
        const seen = new Set();
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
