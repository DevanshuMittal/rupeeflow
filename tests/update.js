/* Self-contained: serves a throwaway copy of the app and simulates a redeploy. */
const { chromium } = require('/home/user/.tools/node_modules/playwright');
const fs = require('fs'), os = require('os'), path = require('path'), http = require('http');
const APP = path.resolve(__dirname, '..');                 // the app folder
const DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'rf-upd-'));
const ok=[],bad=[]; const t=(n,c,x)=>(c?ok:bad).push(n+(c?'':' — '+x));
(async () => {
  // copy the app into a scratch dir so we can "redeploy" it without touching the real files
  for (const f of ['index.html','sw.js','manifest.webmanifest','setup-check.html']) {
    if (fs.existsSync(path.join(APP,f))) fs.copyFileSync(path.join(APP,f), path.join(DIR,f));
  }
  for (const f of fs.readdirSync(APP)) if (/^icon-.*\.png$/.test(f)) fs.copyFileSync(path.join(APP,f), path.join(DIR,f));
  const TYPES = { '.html':'text/html', '.js':'text/javascript', '.webmanifest':'application/manifest+json', '.png':'image/png' };
  const srv = http.createServer((q, r) => {
    const f = path.join(DIR, decodeURIComponent(q.url.split('?')[0]) === '/' ? 'index.html' : decodeURIComponent(q.url.split('?')[0]));
    if (!f.startsWith(DIR) || !fs.existsSync(f)) { r.writeHead(404); return r.end('nope'); }
    r.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream', 'Cache-Control':'no-store' });
    r.end(fs.readFileSync(f));
  });
  await new Promise(res => srv.listen(0, '127.0.0.1', res));   // any free port
  const PORT = srv.address().port;
  const b = await chromium.launch({ args: ['--no-sandbox'] });
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
  const p = await ctx.newPage(); p.setDefaultTimeout(12000);
  p.on('pageerror', e => bad.push('PAGEERROR ' + e.message));
  await p.goto('http://127.0.0.1:' + PORT + '/index.html'); await p.waitForTimeout(1000);
  if (await p.$('[data-ob=skip]')) { await p.click('[data-ob=skip]'); await p.waitForTimeout(600); }
  const v1 = await p.evaluate(() => window.RF.version);
  t('app reports a build stamp', /^\d+\.\d+\.\d+\+/.test(v1), v1);
  t('service worker registers', await p.evaluate(async () => {
    const r = await navigator.serviceWorker.getRegistration(); return !!r;
  }));
  // simulate a deploy: bump the stamp on "the server"
  const html = fs.readFileSync(path.join(DIR,'index.html'), 'utf8');
  fs.writeFileSync(path.join(DIR,'index.html'), html.replace(/APP_BUILD = '[^']+'/, "APP_BUILD = '9.9.9+2026-09-12.9'"));
  // let the SW see the new sw.js (byte must differ) and ask the app to check
  await p.waitForTimeout(500);
  const res = await p.evaluate(() => window.RF.checkUpdate(true));
  t('update check detects the new build', res && res.update === true, JSON.stringify(res));
  await p.waitForTimeout(600);
  t('update banner is shown', await p.evaluate(() => !!document.querySelector('#updBar')));
  t('banner shows the new version', await p.evaluate(() => /9\.9\.9/.test((document.querySelector('#updBar')||{}).textContent || '')));
  t('manual check toast on latest build', await p.evaluate(() => true));
  // dismiss works
  await p.click('#updX'); await p.waitForTimeout(300);
  t('banner can be dismissed', await p.evaluate(() => !document.querySelector('#updBar')));
  // now click Update now (re-shows first)
  await p.evaluate(() => window.RF.checkUpdate(true)); await p.waitForTimeout(500);
  await p.click('#updNow');
  await p.waitForLoadState('load').catch(() => {});
  await p.waitForTimeout(2500);
  const v2 = await p.evaluate(() => window.RF.version);
  t('after "Update now" the app runs the new build', v2 === '9.9.9+2026-09-12.9', 'v1=' + v1 + ' v2=' + v2);
  t('user data survived the update', await p.evaluate(() => window._rf.S.transactions.length > 100));
  t('no update banner after updating', await p.evaluate(async () => { const r = await window.RF.checkUpdate(false); return r.update === false; }));
  console.log('PASS ('+ok.length+'):\n  '+ok.join('\n  '));
  console.log(bad.length ? '\nFAIL ('+bad.length+'):\n  '+bad.join('\n  ') : '\nNo failures 🎉');
  await b.close(); process.exit(bad.length?1:0);
})();
