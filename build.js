#!/usr/bin/env node
// Bundles src/ entry points into the extension root directory.

import * as esbuild from 'esbuild';

const watch = process.argv.includes('--watch');

const sharedConfig = {
  bundle: true,
  format: 'iife',
  logLevel: 'info',
  // chrome.* and location are browser globals — not bundled.
};

const entryPoints = [
  { in: 'src/content.js', out: 'content' },
  { in: 'src/popup.js',   out: 'popup'   },
  { in: 'src/options.js', out: 'options' },
];

if (watch) {
  const ctx = await esbuild.context({ ...sharedConfig, entryPoints, outdir: '.' });
  await ctx.watch();
  console.log('Watching for changes…');
} else {
  await esbuild.build({ ...sharedConfig, entryPoints, outdir: '.' });
}
