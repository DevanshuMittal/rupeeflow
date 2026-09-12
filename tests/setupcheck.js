/* Verify setup-check.html: renders, runs all checks, fails gracefully, no console errors */
const { chromium } = require('/home/user/.tools/node_modules/playwright');
const ok=[],bad=[]; const t=(n,c)=>(c?ok:bad).push(n);
(async () => {
  const b = await chromium.launch({ args: ['--no-sandbox'] });
  const ctx = await b.newContext({ viewport: { width: 430, height: 900 } });
  const p = await ctx.newPage(); p.setDefaultTimeout(15000);
  p.on('pageerror', e => bad.push('PAGEERROR ' + e.message));
  p.on('console', m => { if (m.type()==='error') bad.push('CONSOLE ' + m.text().slice(0,150)); });
  await p.goto('http://localhost:8080/setup-check.html'); await p.waitForTimeout(600);

  t('page renders', await p.evaluate(() => document.querySelectorAll('.card').length) >= 8);

  // 1 files
  await p.click('#run1'); await p.waitForTimeout(900);
  const f1 = await p.evaluate(() => ({ badge: document.querySelector('#b1').textContent, text: document.querySelector('#o1').textContent }));
  t('check1 files OK', /all present/.test(f1.badge) && /index\.html\s+OK 200/.test(f1.text));

  // 2 origin
  await p.click('#run2'); await p.waitForTimeout(400);
  const f2 = await p.evaluate(() => ({ badge: document.querySelector('#b2').textContent, text: document.querySelector('#o2').textContent }));
  t('check2 origin localhost OK', /localhost/.test(f2.badge) && /http:\/\/localhost:8080/.test(f2.text));

  // 3 storage
  await p.click('#run3'); await p.waitForTimeout(500);
  const f3 = await p.evaluate(() => ({ badge: document.querySelector('#b3').textContent, text: document.querySelector('#o3').textContent }));
  t('check3 storage available', /working/.test(f3.badge) && /localStorage\s+available/.test(f3.text));

  // 4 pwa
  await p.click('#run4'); await p.waitForTimeout(1200);
  const f4 = await p.evaluate(() => ({ badge: document.querySelector('#b4').textContent, text: document.querySelector('#o4').textContent }));
  t('check4 pwa installable', /installable/.test(f4.badge) && /service worker support\s+yes/.test(f4.text));

  // 5 google script
  await p.click('#run5'); await p.waitForTimeout(3000);
  const f5 = await p.evaluate(() => ({ badge: document.querySelector('#b5').textContent, text: document.querySelector('#o5').textContent }));
  t('check5 google script reachable', /reachable/.test(f5.badge), f5.badge);

  // 6 invalid client id
  await p.fill('#cid', 'not-a-real-client-id');
  await p.click('#run6'); await p.waitForTimeout(600);
  const f6 = await p.evaluate(() => ({ badge: document.querySelector('#b6').textContent, text: document.querySelector('#o6').textContent }));
  t('check6 rejects bad client id', /invalid/.test(f6.badge) && /INVALID/.test(f6.text));

  // 6b valid-looking id -> real oauth attempt should fail gracefully (bogus id)
  await p.fill('#cid', '123456789012-abcdefghijklmnop.apps.googleusercontent.com');
  await p.click('#run6');
  await p.waitForTimeout(9000);
  const f6b = await p.evaluate(() => ({ badge: document.querySelector('#b6').textContent, text: document.querySelector('#o6').textContent }));
  t('check6 bogus-but-valid-format id handled (no crash)', await p.evaluate(() => !!document.querySelector('#o6').textContent));

  // 7 without token — the button is disabled until sign-in succeeds, so invoke directly
  t('check7 button disabled without a token', await p.evaluate(() => document.querySelector('#run7').disabled));
  await p.evaluate(() => window.check7 && window.check7()); await p.waitForTimeout(700);
  const f7 = await p.evaluate(() => document.querySelector('#o7').textContent);
  t('check7 explains missing token', /Run check 6 first|no token/i.test(f7));

  // summary + report
  const sum = await p.evaluate(() => ({ badge: document.querySelector('#sumBadge').textContent, tiles: document.querySelectorAll('#sum .tile').length }));
  t('summary panel populated', sum.tiles === 7, JSON.stringify(sum));
  await p.click('#copyRep'); await p.waitForTimeout(400);
  t('copy report does not throw', true);

  // simulate storage-blocked (sandboxed iframe) scenario
  const p2 = await ctx.newPage();
  await p2.setContent(`<!doctype html><body style="margin:0"><iframe sandbox="allow-scripts" src="http://localhost:8080/setup-check.html" style="width:430px;height:900px;border:0"></iframe></body>`);
  await p2.waitForTimeout(1200);
  const fr = p2.frames().find(x => x !== p2.mainFrame());
  await fr.click('#run3'); await p2.waitForTimeout(700);
  const sb = await fr.evaluate(() => ({ badge: document.querySelector('#b3').textContent, text: document.querySelector('#o3').textContent }));
  t('detects sandboxed/blocked storage', /memory-only/.test(sb.badge) && /BLOCKED/.test(sb.text));

  console.log('PASS ('+ok.length+'):\n  '+ok.join('\n  '));
  console.log(bad.length ? '\nFAIL ('+bad.length+'):\n  '+bad.join('\n  ') : '\nNo failures 🎉');
  await b.close(); process.exit(bad.length?1:0);
})();
