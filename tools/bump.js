#!/usr/bin/env node
/* ============================================================================
   Bump the RupeeFlow build stamp. Run this for every release, then commit.
     node tools/bump.js            → patch bump, e.g. 1.2.0+2026-09-12.1 → .2
     node tools/bump.js minor      → 1.2.0 → 1.3.0
     node tools/bump.js major      → 1.2.0 → 2.0.0
     node tools/bump.js 1.4.2      → explicit version
   Updates index.html (APP_BUILD), sw.js (BUILD cache name) and CHANGELOG.md.
   ========================================================================== */
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const today = new Date().toISOString().slice(0, 10);

const idx = path.join(ROOT, 'index.html');
const sw = path.join(ROOT, 'sw.js');
const html = fs.readFileSync(idx, 'utf8');
const swSrc = fs.readFileSync(sw, 'utf8');

const current = (html.match(/APP_BUILD\s*=\s*'([^']+)'/) || [])[1];
if (!current) { console.error('Could not find APP_BUILD in index.html'); process.exit(1); }

const [semver, stamp] = current.split('+');
let [maj, min, pat] = semver.split('.').map(Number);
const arg = (process.argv[2] || '').trim();
let next;
if (/^\d+\.\d+\.\d+$/.test(arg)) next = arg;
else if (arg === 'major') { maj++; min = 0; pat = 0; next = `${maj}.${min}.${pat}`; }
else if (arg === 'minor') { min++; pat = 0; next = `${maj}.${min}.${pat}`; }
else { pat++; next = `${maj}.${min}.${pat}`; }

/* keep a per-day counter so several deploys in one day are distinguishable */
let serial = 1;
if (stamp && stamp.startsWith(today + '.')) serial = (parseInt(stamp.split('.')[1], 10) || 1) + 1;
const build = `${next}+${today}.${serial}`;

fs.writeFileSync(idx, html.replace(/APP_BUILD\s*=\s*'[^']+'/, `APP_BUILD = '${build}'`));
fs.writeFileSync(sw, swSrc.replace(/BUILD = '[^']+'/, `BUILD = '${build}'`));

const log = path.join(ROOT, 'CHANGELOG.md');
const header = fs.existsSync(log) ? fs.readFileSync(log, 'utf8') : '# Changelog\n\nAll notable changes to RupeeFlow. Build stamps match the app footer (Settings → About).\n';
const entry = `## ${next} — ${today}  ·  build \`${build}\`\n\n- _describe your change here_\n`;
/* newest first: insert directly above the first existing release heading */
let out = header;
if (!header.includes(`build \`${build}\``)) {
  const first = header.search(/^## /m);
  out = first === -1
    ? header.trimEnd() + '\n\n' + entry
    : header.slice(0, first) + entry + '\n' + header.slice(first);
  out = out.replace(/^(_describe your change here_)\n\n(?=## )/m, '$1\n\n');
}
fs.writeFileSync(log, out);

console.log(`\n  build: ${current}  →  ${build}`);
console.log('  updated: index.html, sw.js, CHANGELOG.md');
console.log('\n  Next:\n    git add -A && git commit -m "release ' + build + '" && git push\n');
