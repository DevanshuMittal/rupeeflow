const { chromium } = require('/home/user/.tools/node_modules/playwright');
const fs = require('fs');
const OUT = '/tmp/shots'; fs.mkdirSync(OUT, { recursive: true });
const errs = [];
(async () => {
  const b = await chromium.launch({ args: ['--no-sandbox'] });
  const ctx = await b.newContext({ viewport: { width: 400, height: 860 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const p = await ctx.newPage();
  p.setDefaultTimeout(12000);
  p.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE: ' + m.text()); });
  p.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
  await p.goto('http://localhost:8080/index.html', { waitUntil: 'load' });
  await p.waitForTimeout(900);
  // onboarding → skip
  if (await p.$('[data-ob=skip]')) { await p.click('[data-ob=skip]'); await p.waitForTimeout(600); }
  const shot = async (name, full = true) => { await p.waitForTimeout(450); await p.screenshot({ path: `${OUT}/${name}.png`, fullPage: full }); };
  const stats = async () => p.evaluate(() => ({ tx: window._rf.S.transactions.length, acc: window._rf.S.accounts.length, nw: Math.round(window._rf.S.accounts.reduce((t,a)=>t+0,0)), route: document.querySelector('.screen.active').id, err: 0 }));
  await shot('01_home');
  console.log('after skip:', JSON.stringify(await stats()));
  // navigate each screen
  for (const [nav, name] of [['records','02_records'],['analytics','03_analytics'],['more','04_more']]) {
    await p.click(`.navb[data-nav=${nav}]`); await shot(name);
  }
  // analytics tabs
  await p.click('.navb[data-nav=analytics]'); await p.waitForTimeout(300);
  for (const t of ['pie','bars','cal','deep']) { await p.click(`[data-an=${t}]`); await shot('03b_an_' + t, false); }
  // sub screens via More
  await p.click('.navb[data-nav=more]');
  for (const r of ['budgets','accounts','categories','recurring','goals','loans','reimb','reports','sync','themes','settings']) {
    await p.click(`#s-more .tile[data-nav=${r}]`); await p.waitForTimeout(200); await shot('05_' + r);
    await p.click('.screen.active [data-act=back]').catch(()=>{});
  }
  // add-transaction flow
  await p.click('.navb[data-nav=home]');
  await p.click('.fab'); await p.waitForTimeout(500);
  await p.click('[data-k="4"]'); await p.click('[data-k="5"]'); await p.click('[data-k="0"]');
  await p.click('#catPick button:nth-child(3)');
  await shot('06_add_sheet', false);
  const before = await p.evaluate(() => window._rf.S.transactions.length);
  await p.evaluate(() => { document.querySelector('#fNote').value = 'Playwright test — chai'; });
  await p.click('[data-x=save]'); await p.waitForTimeout(700);
  const after = await p.evaluate(() => window._rf.S.transactions.length);
  console.log('add-tx flow:', before, '->', after, after === before + 1 ? 'OK' : 'FAIL');
  // transaction detail
  await p.click('.navb[data-nav=records]'); await p.waitForTimeout(500);
  console.log('DBG records active=', await p.evaluate(() => document.querySelector('.screen.active').id), 'rows=', await p.evaluate(() => document.querySelectorAll('#s-records .txrow').length), 'sheetOn=', await p.evaluate(() => document.querySelector('#sheet').classList.contains('on')));
  await p.click('#s-records .txrow'); await p.waitForTimeout(500); await shot('07_txdetail', false);
  await p.click('#sheetClose'); await p.waitForTimeout(300);
  // themes: dark + a few palettes
  await p.click('.navb[data-nav=more]'); await p.click('.tile[data-nav=themes]'); await shot('08_themes');
  await p.click('#s-themes [data-mode=dark]'); await p.waitForTimeout(400); await shot('08b_themes_dark', false);
  await p.click('#s-themes [data-theme=cyber]'); await p.waitForTimeout(300);
  await p.click('.navb[data-nav=home]'); await shot('09_home_cyber_dark');
  await p.click('#btnSearch'); await p.waitForTimeout(400); await shot('10_search', false); await p.click('#sheetClose');
  await p.click('.navb[data-nav=more]'); await p.click('#s-more .tile[data-nav=themes]'); await p.click('#s-themes [data-theme=terminal]'); await p.click('.navb[data-nav=home]'); await shot('11_home_terminal');
  // switch to light mode Amoled off, check emerald
  await p.click('.navb[data-nav=more]'); await p.click('.tile[data-nav=themes]'); await p.click('#s-themes [data-mode=light]'); await p.click('#s-themes [data-theme=sunset]');
  await p.click('.navb[data-nav=home]'); await shot('12_home_sunset_light');
  console.log('ERRORS:', errs.length ? errs.join('\n') : 'none');
  await b.close();
})().catch(e => { console.error('TEST FAIL', e); process.exit(1); });
