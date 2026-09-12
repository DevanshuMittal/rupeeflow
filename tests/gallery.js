/* Capture the gallery screenshots into ./screenshots (used for the README + preview) */
const { chromium } = require('/home/user/.tools/node_modules/playwright');
const fs = require('fs');
const OUT = '/home/user/finance-tracker/screenshots';
(async () => {
  const b = await chromium.launch({ args: ['--no-sandbox'] });
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const p = await ctx.newPage(); p.setDefaultTimeout(12000);
  p.on('pageerror', e => console.log('[PAGEERROR]', e.message));
  await p.goto('http://localhost:8080/index.html'); await p.waitForTimeout(800);
  if (await p.$('[data-ob=skip]')) { await p.click('[data-ob=skip]'); await p.waitForTimeout(2600); }  // let the toast expire
  const S = async n => {
    await p.waitForTimeout(400);
    /* hide toasts instantly (class removal alone leaves the exit transition on screen) */
    await p.evaluate(() => { const t = document.querySelector('#toast'); t.classList.remove('on'); t.style.display = 'none'; });
    await p.waitForTimeout(120);
    await p.screenshot({ path: `${OUT}/${n}.png` });
  };
  await S('01-dashboard');
  await p.evaluate(() => window.scrollTo(0, 660)); await S('02-budget-insights');
  await p.click('.navb[data-nav=records]'); await p.evaluate(() => window.scrollTo(0, 0)); await S('03-records');
  await p.click('.navb[data-nav=analytics]'); await S('04-analytics-flow');
  await p.click('#s-analytics [data-an=cal]'); await S('05-calendar-heatmap');
  await p.click('.navb[data-nav=more]'); await S('06-more-hub');
  await p.click('#s-more .tile[data-nav=budgets]'); await S('07-budgets');
  await p.click('.screen.active [data-act=back]');
  await p.click('#s-more .tile[data-nav=goals]'); await S('08-goals');
  await p.click('.screen.active [data-act=back]');
  await p.click('#s-more .tile[data-nav=loans]'); await S('09-loans');
  await p.click('.screen.active [data-act=back]');
  await p.click('#s-more .tile[data-nav=themes]'); await S('10-themes');
  await p.click('.navb[data-nav=home]');
  await p.click('.fab'); await p.waitForTimeout(400); await S('11-add-expense');
  await p.click('#sheetClose');
  // dark + AMOLED
  await p.click('.navb[data-nav=more]'); await p.click('#s-more .tile[data-nav=themes]'); await p.waitForTimeout(300);
  await p.click('#s-themes [data-mode=dark]'); await p.click('#s-themes [data-theme=amoled]'); await p.waitForTimeout(400);
  await p.click('.navb[data-nav=home]'); await p.evaluate(() => window.scrollTo(0, 0)); await S('12-dashboard-amoled-dark');
  await p.click('.navb[data-nav=analytics]'); await S('13-analytics-dark');
  console.log('gallery written to', OUT);
  await b.close();
})();
