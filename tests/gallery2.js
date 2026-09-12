const { chromium } = require('/home/user/.tools/node_modules/playwright');
const OUT = '/home/user/finance-tracker/screenshots';
(async () => {
  const b = await chromium.launch({ args: ['--no-sandbox'] });
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const p = await ctx.newPage(); p.setDefaultTimeout(12000);
  p.on('pageerror', e => console.log('[PAGEERROR]', e.message));
  await p.goto('http://localhost:8080/index.html'); await p.waitForTimeout(800);
  if (await p.$('[data-ob=skip]')) { await p.click('[data-ob=skip]'); await p.waitForTimeout(2600); }
  const S = async n => { await p.waitForTimeout(400);
    await p.evaluate(() => { const t = document.querySelector('#toast'); t.classList.remove('on'); t.style.display='none'; });
    await p.waitForTimeout(120); await p.screenshot({ path: `${OUT}/${n}.png` }); };
  await p.evaluate(() => window._rf.go('cust')); await p.waitForTimeout(500);
  for (const [tab, name] of [['layout','15-customise-layout'],['fields','16-customise-fields'],['templates','17-customise-templates'],['rules','18-customise-rules'],['format','19-customise-format'],['theme','20-customise-theme'],['dev','21-customise-dev']]) {
    await p.click(`#s-cust [data-ctab=${tab}]`); await S(name);
  }
  // rule editor + JSON
  await p.click('#s-cust [data-ctab=rules]'); await p.waitForTimeout(300);
  await p.click('#s-cust [data-act="rule-new"]'); await p.waitForTimeout(500); await S('22-rule-editor');
  await p.click('[data-x=c]'); await p.waitForTimeout(300);
  await p.click('#s-cust [data-rule-json]'); await p.waitForTimeout(500); await S('23-rule-json');
  await p.click('[data-x=c]'); await p.waitForTimeout(300);
  // add sheet with templates + custom fields visible
  await p.evaluate(() => window._rf.go('home')); await p.waitForTimeout(400);
  await p.click('.fab'); await p.waitForTimeout(600);
  await p.evaluate(() => { const el = document.querySelector('#sheetBody'); el.scrollTop = el.scrollHeight; });
  await S('24-add-sheet-custom');
  await p.click('#sheetClose'); await p.waitForTimeout(300);
  // layout applied: custom nav + custom KPI + custom theme
  await p.evaluate(() => { window.RF.setPref('navTabs', ['budgets','records','analytics']); window.RF.setPref('kpis', ['networth','budgetLeft','savingsRate','subsBurn']); window.RF.setPref('theme', { name:'QA Dev', accent:'#ff0055', accent2:'#7C3AED', hue: 285 }); window.RF.setPref('cycleStart', 25); });
  await p.waitForTimeout(600); await p.evaluate(() => window._rf.go('home')); await p.waitForTimeout(600); await S('25-dashboard-customised');
  console.log('extra screenshots written');
  await b.close();
})();
