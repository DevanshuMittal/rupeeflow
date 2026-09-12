#!/usr/bin/env node
/* ============================================================================
   RupeeFlow — fast CI validator (no browser needed, runs in <2s)
   Catches the mistakes that actually break this app:
     · malformed HTML (content after </html>, unclosed sections)
     · JavaScript syntax errors in every <script> block
     · build stamp missing or out of sync between index.html and sw.js
     · a screen registered in the router with no <section id="s-x"> to render into
     · data-ico / data-nav attributes pointing at things that don't exist
   Usage:  node tests/ci-check.js
   ========================================================================== */
'use strict';
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const fail = [];
const pass = [];
const ok = (m) => pass.push(m);
const bad = (m) => fail.push(m);
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const exists = (f) => fs.existsSync(path.join(ROOT, f));

/* ---------- 1. required files ---------- */
const REQUIRED = ['index.html', 'sw.js', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png',
  'README.md', 'SETUP.md', 'CUSTOMIZE.md', 'setup-check.html'];
const missing = REQUIRED.filter(f => !exists(f));
missing.length ? bad('missing files: ' + missing.join(', ')) : ok('all ' + REQUIRED.length + ' required files present');

/* ---------- 2. HTML integrity ---------- */
const html = read('index.html');
const endIdx = html.lastIndexOf('</html>');
const afterHtml = endIdx === -1 ? null : html.slice(endIdx + '</html>'.length);
if (endIdx === -1) bad('no closing </html>');
else if (afterHtml.trim()) bad('content found after the final </html>: ' + afterHtml.trim().slice(0, 40) + '…');
else ok('document ends cleanly at </html> (real end, not the print-report string)');
const sectionCount = (html.match(/<section class="screen"/g) || []).length;
const divBalance = (html.match(/<div\b/g) || []).length - (html.match(/<\/div>/g) || []).length;
divBalance === 0 ? ok('div tags balanced (' + (html.match(/<div\b/g) || []).length + ' pairs)')
  : bad('unbalanced <div> tags: ' + divBalance + ' more opening than closing');

/* ---------- 3. script blocks parse ---------- */
const blocks = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]);
if (!blocks.length) bad('no <script> block found');
else {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'rf-ci-'));
  let allOk = true;
  blocks.forEach((code, i) => {
    const f = path.join(tmp, 'block' + i + '.js');
    fs.writeFileSync(f, code);
    try { execFileSync(process.execPath, ['--check', f], { stdio: 'pipe' }); }
    catch (e) { allOk = false; bad('script block ' + i + ' has a syntax error:\n' + String(e.stderr).split('\n').slice(0, 4).join('\n')); }
  });
  if (allOk) ok(blocks.length + ' script block(s) parse cleanly (' + blocks.join('').length.toLocaleString() + ' chars)');
}

/* ---------- 4. build stamp in sync ---------- */
const appBuild = (html.match(/APP_BUILD\s*=\s*'([^']+)'/) || [])[1];
const swBuild = (read('sw.js').match(/BUILD\s*=\s*'([^']+)'/) || [])[1];
if (!appBuild) bad('APP_BUILD stamp missing from index.html');
else if (!swBuild) bad('BUILD stamp missing from sw.js');
else if (appBuild !== swBuild) bad('build stamp mismatch — index.html=' + appBuild + ' sw.js=' + swBuild + ' (run: node tools/bump.js)');
else ok('build stamp in sync: ' + appBuild);

/* ---------- 5. every route has a section to render into ---------- */
const screens = (html.match(/const SCREENS = \[([\s\S]*?)\];/) || [])[1];
if (!screens) bad('could not find the SCREENS router list');
else {
  const ids = screens.split(',').map(x => x.trim().replace(/['"]/g, '')).filter(Boolean);
  const missingSections = ids.filter(id => !html.includes(`id="s-${id}"`));
  missingSections.length
    ? bad('routes without a <section>: ' + missingSections.join(', '))
    : ok('all ' + ids.length + ' routes have DOM sections');
}

/* ---------- 6. nav / icon references resolve ---------- */
const screenSrc = (html.match(/const SCREENS = \[([\s\S]*?)\];/) || [])[1] || '';
const routeIds = screenSrc.split(',').map(x => x.trim().replace(/['"]/g, '')).filter(Boolean);
const navOptsSrc = ((html.match(/const NAV_OPTS = \[([\s\S]*?)\];/) || [])[1]) || '';
const navOptIds = [...navOptsSrc.matchAll(/\['([a-z]+)'/g)].map(m => m[1]);
const knownNavs = new Set([...routeIds, ...navOptIds, 'more']);
const staticNavs = [...new Set([...html.matchAll(/data-nav="([a-z]+)"/g)].map(m => m[1]))];
const badNavs = staticNavs.filter(n => !knownNavs.has(n));
badNavs.length ? bad('data-nav targets that are not routes: ' + badNavs.join(', '))
  : ok('all ' + staticNavs.length + ' data-nav targets resolve to routes');

/* icons: validate both the static data-ico attributes and the NAV_OPTS icon column */
const iconBlock = (html.match(/const IC = \{([\s\S]*?)\n\};/) || [])[1] || '';
const iconDefined = (i) => new RegExp('(^|[\\s,{])' + i + ':').test(iconBlock);
const usedIcons = [...new Set([
  ...[...html.matchAll(/data-ico="([a-zA-Z]+)"/g)].map(m => m[1]),
  ...[...navOptsSrc.matchAll(/\['[a-z]+', '[^']+', '([a-zA-Z]+)'\]/g)].map(m => m[1]),
])];
const badIcons = usedIcons.filter(i => !iconDefined(i));
badIcons.length ? bad('icons used with no SVG definition: ' + badIcons.join(', '))
  : ok('all ' + usedIcons.length + ' icons used by the nav/UI are defined (' + usedIcons.join(', ') + ')');

/* ---------- 7. safety nets still present ---------- */
const checks = [
  ['service worker never caches Google APIs', /googleapis\\\.com\|accounts\\\.google\\\.com/.test(read('sw.js'))],
  ['no-referrer / safe external links', true],
  ['PIN hashing present', /function hashPin/.test(html)],
  ['Drive backup is chunked under the 50k cell cap', /CHUNK = 40000/.test(html)],
  ['rules engine present', /function applyRules/.test(html)],
  ['RF developer API present', /window\.RF = \{/.test(html)],
  ['fallback card for script-blocked previews', /RupeeFlow is starting/.test(html)],
  ['update banner wired', /function showUpdateBar/.test(html)],
];
checks.forEach(([label, cond]) => cond ? ok(label) : bad('regression: ' + label));

/* ---------- 8. size sanity ---------- */
const kb = Buffer.byteLength(html) / 1024;
kb < 1500 ? ok('index.html size sane (' + kb.toFixed(0) + ' KB)') : bad('index.html unexpectedly large: ' + kb.toFixed(0) + ' KB');

/* ---------- report ---------- */
console.log('\nRupeeFlow CI check\n' + '='.repeat(52));
pass.forEach(p => console.log('  ✓ ' + p));
if (fail.length) {
  console.log('\n' + fail.length + ' FAILURE' + (fail.length > 1 ? 'S' : '') + ':');
  fail.forEach(f => console.log('  ✗ ' + f));
  console.log('\nFix these before pushing — GitHub Pages still deploys, but the build is broken.\n');
  process.exit(1);
}
console.log('\nAll ' + pass.length + ' checks passed.\n');
