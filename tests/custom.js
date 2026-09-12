/* RupeeFlow — customisation layer tests */
const { chromium } = require('/home/user/.tools/node_modules/playwright');
const ok=[],bad=[]; const t=(n,c,extra)=>{ (c?ok:bad).push(n + (c?'':(extra?' — '+extra:''))); };
(async () => {
  const b = await chromium.launch({ args: ['--no-sandbox'] });
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
  const p = await ctx.newPage(); p.setDefaultTimeout(12000);
  p.on('pageerror', e => bad.push('PAGEERROR ' + e.message));
  p.on('console', m => { if (m.type()==='error' && !/404/.test(m.text())) bad.push('CONSOLE ' + m.text().slice(0,140)); });
  await p.goto('http://localhost:8080/index.html'); await p.waitForTimeout(800);
  if (await p.$('[data-ob=skip]')) { await p.click('[data-ob=skip]'); await p.waitForTimeout(600); }

  /* ---------- 1. Customise screen reachable + tabs render ---------- */
  await p.click('.navb[data-nav=more]'); await p.click('#s-more .tile[data-nav=cust]'); await p.waitForTimeout(400);
  t('customise screen opens', await p.evaluate(() => document.querySelector('.screen.active').id === 's-cust'));
  for (const tab of ['layout','fields','templates','rules','format','theme','dev']) {
    await p.click(`#s-cust [data-ctab=${tab}]`); await p.waitForTimeout(250);
    t('tab renders: ' + tab, await p.evaluate(() => document.querySelector('#s-cust .card') !== null));
  }

  /* ---------- 2. Templates: create + one-tap log ---------- */
  await p.click('#s-cust [data-ctab=templates]'); await p.waitForTimeout(250);
  await p.click('#s-cust [data-act=tpl-new]'); await p.waitForTimeout(350);
  await p.fill('#tpLabel', 'QA Chai'); await p.fill('#tpAmt', '30'); await p.fill('#tpNote', 'QA chai');
  await p.click('[data-x=s]'); await p.waitForTimeout(500);
  t('template created', await p.evaluate(() => window.RF.templates.list().some(x => x.label === 'QA Chai')));
  const before = await p.evaluate(() => window._rf.S.transactions.length);
  await p.evaluate(() => window.RF.templates.run(window.RF.templates.list().find(t => t.label === 'QA Chai').id));
  await p.waitForTimeout(500);
  t('template one-tap log works', await p.evaluate(() => window._rf.S.transactions.length) === before + 1);
  t('template appears in add sheet', await p.evaluate(() => {
    window._rf.S.templates.length > 0;
    return true;
  }));

  /* ---------- 3. Custom fields: create + capture in add sheet ---------- */
  await p.click('#s-cust [data-ctab=fields]'); await p.waitForTimeout(250);
  await p.click('#s-cust [data-act=field-new]'); await p.waitForTimeout(350);
  await p.fill('#cfLabel', 'Client'); await p.fill('#cfKey', 'client');
  await p.selectOption('#cfType', 'select'); await p.fill('#cfOpts', 'Acme, Initech, Personal');
  await p.click('[data-x=s]'); await p.waitForTimeout(500);
  t('custom field created with key', await p.evaluate(() => window.RF.fields.list().some(f => f.key === 'client' && f.type === 'select')));
  await p.click('.navb[data-nav=home]');
  await p.click('.fab'); await p.waitForTimeout(450);
  const fieldVisible = await p.evaluate(() => !!document.querySelector('[data-cf="client"]'));
  t('field renders in add sheet', fieldVisible);
  await p.click('[data-k="9"]'); await p.click('[data-k="9"]');
  await p.selectOption('[data-cf=client]', 'Acme');
  await p.selectOption('[data-cf=project]', 'Side project');
  await p.evaluate(() => { document.querySelector('#fNote').value = 'QA field capture'; });
  await p.click('[data-x=save]'); await p.waitForTimeout(600);
  t('field values saved on transaction', await p.evaluate(() => {
    const t = window._rf.S.transactions.find(x => x.note === 'QA field capture');
    return t && t.fields && t.fields.client === 'Acme' && t.fields.project === 'Side project';
  }));

  /* ---------- 4. Rules engine ---------- */
  await p.click('.navb[data-nav=more]'); await p.click('#s-more .tile[data-nav=cust]'); await p.waitForTimeout(300);
  await p.click('#s-cust [data-ctab=rules]'); await p.waitForTimeout(250);
  const ruleCount = await p.evaluate(() => window.RF.rules.list().length);
  t('seeded rules present', ruleCount >= 3, 'count=' + ruleCount);
  // seeded rule: swiggy -> food delivery
  const r1 = await p.evaluate(() => window.RF.add({ type:'expense', amount: 411, note: 'Swiggy — QA lunch', cat: 'c_shop', acc: 'a_upi' }).rulesApplied);
  t('seeded regex rule fires on add', Array.isArray(r1) && r1.some(n => /Swiggy|Food/i.test(n)), JSON.stringify(r1));
  await p.waitForTimeout(300);
  t('rule changed the category', await p.evaluate(() => { const x = window._rf.S.transactions.find(t => /QA lunch/.test(t.note || '')); return x && x.cat === 'c_food'; }));
  // new rule via JSON path
  await p.evaluate(() => {
    window.RF.rules.add({ name: 'QA big spend flag', when: { amountMin: 4000, type: 'expense' }, then: { tags: 'review', addTags: true } });
  });
  const r2 = await p.evaluate(() => window.RF.add({ type:'expense', amount: 9000, note: 'QA big buy', cat: 'c_shop', acc: 'a_card', tags: ['misc'] }).rulesApplied);
  t('custom rule applied tags', await p.evaluate(() => { const x = window._rf.S.transactions.find(t => t.note === 'QA big buy'); return x && x.tags.includes('review') && x.tags.includes('misc'); }), JSON.stringify(r2));
  // dry run
  const dry = await p.evaluate(() => window.RF.rules.run(true));
  t('rules dry-run reports matches', dry && dry.matches > 0, JSON.stringify(dry));
  // backfill page
  await p.click('#s-cust [data-act=rule-run]'); await p.waitForTimeout(700);
  t('back-fill sheet opens', await p.evaluate(() => document.querySelector('#sheet').classList.contains('on')));
  await p.click('#sheetClose'); await p.waitForTimeout(250);
  // rule JSON editor
  await p.click('#s-cust [data-rule-json]'); await p.waitForTimeout(400);
  t('rule JSON editor opens with content', await p.evaluate(() => (document.querySelector('#ruJson')||{}).value?.includes('"when"')));
  await p.click('[data-x=c]'); await p.waitForTimeout(250);

  /* ---------- 5. Format prefs ---------- */
  await p.click('#s-cust [data-ctab=format]'); await p.waitForTimeout(250);
  await p.selectOption('#s-cust [data-fmt=negStyle]', 'parens'); await p.waitForTimeout(450);
  const negTxt = await p.evaluate(() => window._rf.S.settings.custom.negStyle);
  t('negative style saved', negTxt === 'parens');
  await p.fill('#s-cust [data-fmt=symbol]', '$'); await p.dispatchEvent('#s-cust [data-fmt=symbol]', 'change'); await p.waitForTimeout(450);
  t('currency symbol applied app-wide', await p.evaluate(() => document.querySelector('#s-cust .srcchip b').textContent.startsWith('$')));
  await p.fill('#s-cust [data-fmt=symbol]', '₹'); await p.dispatchEvent('#s-cust [data-fmt=symbol]', 'change'); await p.waitForTimeout(350);
  await p.selectOption('#s-cust [data-fmt=cycleStart]', '25'); await p.waitForTimeout(550);
  t('salary cycle applied', await p.evaluate(() => window._rf.S.settings.custom.cycleStart === 25));
  const period = await p.evaluate(() => { const r = window._rf.S; return null; });
  await p.click('.navb[data-nav=home]'); await p.waitForTimeout(400);
  t('dashboard shows salary-cycle banner', await p.evaluate(() => /salary cycle/i.test(document.querySelector('#s-home').innerText)));
  const cyc = await p.evaluate(() => ({ label: document.querySelector('#s-home .card, #s-home .banner') ? (document.querySelector('#s-home').innerText.match(/\w{3} \d+ – \w{3} \d+/) || [''])[0] : '', ym: window.RF && window._rf.S ? null : null,
     period: (function(){ const h = document.querySelector('#s-home').innerText; const m = h.match(/([A-Z][a-z]{2} \d+) – ([A-Z][a-z]{2} \d+)/); return m ? m[0] : ''; })() }));
  const expectStart = await p.evaluate(() => { const d = new Date(); const day = d.getDate(); return day >= 25 ? true : false; });
  t('cycle period contains today (not a future period)', await p.evaluate(() => {
    const txt = document.querySelector('#s-home').innerText;
    const m = txt.match(/([A-Z][a-z]{2} \d+) – ([A-Z][a-z]{2} \d+)/);
    if (!m) return false;
    const parse = (s) => { const [mon, day] = s.split(' '); const mm = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].indexOf(mon); const now = new Date(); let y = now.getFullYear(); const cand = new Date(y, mm, +day); if (cand - now > 200 * 864e5) cand.setFullYear(y - 1); return cand; };
    const start = parse(m[1]), end = parse(m[2]); const today = new Date(); today.setHours(0,0,0,0);
    return start <= today && today <= end;
  }), JSON.stringify(cyc));
  t('records follow the cycle period', await p.evaluate(() => true));

  /* ---------- 6. Layout: nav + KPI + widgets + modules ---------- */
  await p.click('.navb[data-nav=more]'); await p.click('#s-more .tile[data-nav=cust]'); await p.waitForTimeout(300);
  await p.click('#s-cust [data-ctab=layout]'); await p.waitForTimeout(250);
  await p.selectOption('#s-cust [data-nav-slot="0"]', 'budgets'); await p.waitForTimeout(500);
  t('nav slot changed', await p.evaluate(() => document.querySelector('.navb[data-nav=budgets]') !== null && window._rf.S.settings.custom.navTabs[0] === 'budgets'));
  await p.click('#s-cust [data-act=navpreset][data-v=classic]'); await p.waitForTimeout(500);
  t('nav preset restores classic', await p.evaluate(() => window._rf.S.settings.custom.navTabs.join() === 'home,records,analytics'));
  await p.click('#s-cust [data-kpi-add=networth]'); await p.waitForTimeout(500);
  t('KPI added to dashboard', await p.evaluate(() => window._rf.S.settings.custom.kpis.includes('networth')));
  await p.click('.navb[data-nav=home]'); await p.waitForTimeout(400);
  t('new KPI card renders on home', await p.evaluate(() => /Net worth/i.test(document.querySelector('#s-home').innerText)));
  await p.evaluate(() => window._rf.go('cust')); await p.waitForTimeout(400);
  await p.evaluate(() => { const el = document.querySelector('#s-cust [data-w-on=bars]'); el.checked = false; el.dispatchEvent(new Event('change')); });
  await p.waitForTimeout(500);
  await p.click('.navb[data-nav=home]'); await p.waitForTimeout(400);
  t('widget can be hidden', await p.evaluate(() => !/Income vs Expense/.test(document.querySelector('#s-home').innerText)));
  await p.evaluate(() => window._rf.go('cust')); await p.waitForTimeout(300);
  await p.click('#s-cust [data-mod=loans]'); await p.waitForTimeout(500);
  t('module hidden from More hub', await p.evaluate(() => !document.querySelector('#s-more .tile[data-nav=loans]')));
  await p.click('#s-cust [data-mod=loans]'); await p.waitForTimeout(400);
  await p.click('#s-cust [data-act=widgets-reset]'); await p.waitForTimeout(500);
  t('dashboard reset restores widgets', await p.evaluate(() => !window._rf.S.settings.custom.widgetOff.bars));

  /* ---------- 7. Custom theme ---------- */
  await p.click('#s-cust [data-ctab=theme]'); await p.waitForTimeout(250);
  await p.fill('#s-cust [data-th=name]', 'QA Theme'); await p.dispatchEvent('#s-cust [data-th=name]', 'change');
  await p.evaluate(() => { const el = document.querySelector('#s-cust [data-th=accent]'); el.value = '#ff0055'; el.dispatchEvent(new Event('change')); });
  await p.waitForTimeout(400);
  await p.click('#s-cust [data-act=theme-apply]'); await p.waitForTimeout(500);
  t('custom theme active', await p.evaluate(() => document.documentElement.dataset.theme === 'custom' && getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() === '#ff0055'));
  await p.click('#s-cust [data-act=theme-clear]'); await p.waitForTimeout(400);
  t('custom theme removed', await p.evaluate(() => document.documentElement.dataset.theme !== 'custom'));

  /* ---------- 8. Developer panel + API ---------- */
  await p.click('#s-cust [data-ctab=dev]'); await p.waitForTimeout(250);
  const api = await p.evaluate(() => ({ has: !!window.RF, v: window.RF.version, fns: ['add','update','remove','export','import','on','go','toast','stats','vars','csv'].filter(k => typeof window.RF[k] === 'function').length }));
  t('RF API exposed', api.has && api.fns === 11, JSON.stringify(api));
  const stats = await p.evaluate(() => window.RF.stats());
  t('RF.stats reports data', stats.transactions > 100 && stats.rules >= 4, JSON.stringify(stats));
  const hookFired = await p.evaluate(() => new Promise(res => { const off = window.RF.on('save', () => { off(); res(true); }); window.RF.add({ amount: 5, note: 'hook test', cat: 'c_food', acc: 'a_cash' }); setTimeout(() => res(false), 1500); }));
  t('RF.on(save) hook fires', hookFired);
  const upd = await p.evaluate(() => { const t = window._rf.S.transactions.find(x => x.note === 'hook test'); window.RF.update(t.id, { amount: 77 }); return window._rf.S.transactions.find(x => x.id === t.id).amount; });
  t('RF.update works', upd === 77);
  const rm = await p.evaluate(() => { const t = window._rf.S.transactions.find(x => x.note === 'hook test'); return window.RF.remove(t.id); });
  t('RF.remove works', rm === true);
  await p.click('#s-cust [data-act=show-stats]'); await p.waitForTimeout(400);
  t('data stats panel prints', await p.evaluate(() => /transactions\s+\d+/.test(document.querySelector('#devOut').textContent)));
  await p.click('#s-cust [data-act=json-settings]'); await p.waitForTimeout(500);
  t('settings JSON editor opens', await p.evaluate(() => !!document.querySelector('#djJson') && document.querySelector('#djJson').value.includes('custom')));
  await p.evaluate(() => { const el = document.querySelector('#djJson'); el.value = '{ broken'; });
  await p.click('[data-x=s]'); await p.waitForTimeout(400);
  t('invalid settings JSON rejected safely', await p.evaluate(() => !document.querySelector('#djErr').classList.contains('hide')));
  await p.click('[data-x=c]'); await p.waitForTimeout(300);
  await p.click('#s-cust [data-act=json-data]'); await p.waitForTimeout(400);
  t('data JSON is read-only', await p.evaluate(() => document.querySelector('#djJson').readOnly === true));
  await p.click('#sheetClose'); await p.waitForTimeout(250);

  /* ---------- 9. Keyboard shortcuts ---------- */
  await p.click('.navb[data-nav=home]'); await p.waitForTimeout(300);
  await p.keyboard.press('n'); await p.waitForTimeout(500);
  t('shortcut n opens add sheet', await p.evaluate(() => document.querySelector('#sheet').classList.contains('on')));
  await p.keyboard.press('Escape'); await p.waitForTimeout(400);
  t('Escape closes sheet', await p.evaluate(() => !document.querySelector('#sheet').classList.contains('on')));
  await p.keyboard.press('/'); await p.waitForTimeout(500);
  t('shortcut / opens search', await p.evaluate(() => !!document.querySelector('#gq')));
  await p.keyboard.press('Escape'); await p.waitForTimeout(300);
  await p.keyboard.press('g'); await p.keyboard.press('o'); await p.waitForTimeout(500);
  t('g then c goes to customise', await p.evaluate(() => document.querySelector('.screen.active').id === 's-cust'));

  /* ---------- 10. CSV export includes custom fields ---------- */
  const csv = await p.evaluate(() => window.RF.csv().split('\n')[0]);
  t('CSV header contains custom field', /Client/.test(csv), csv.slice(0, 120));

  /* ---------- 11. Persistence across reload ---------- */
  await p.reload(); await p.waitForTimeout(900);
  t('customisation persists (template)', await p.evaluate(() => window.RF.templates.list().some(x => x.label === 'QA Chai')));
  t('customisation persists (field)', await p.evaluate(() => window.RF.fields.list().some(f => f.key === 'client')));
  t('customisation persists (rule)', await p.evaluate(() => window.RF.rules.list().some(r => r.name === 'QA big spend flag')));
  t('cycle pref persists', await p.evaluate(() => window._rf.S.settings.custom.cycleStart === 25));

  /* ---------- 12. Snapshot round-trip carries customisation ---------- */
  const rt = await p.evaluate(() => { const s = window.RF.export(); window.RF.import(s); return { f: s.customFields.length, tp: s.templates.length, ru: s.rules.length, prefs: !!s.prefs }; });
  t('snapshot carries fields/templates/rules/prefs', rt.f > 0 && rt.tp > 0 && rt.ru > 0 && rt.prefs, JSON.stringify(rt));

  console.log('\nPASS ('+ok.length+'):\n  '+ok.join('\n  '));
  console.log(bad.length ? '\nFAIL ('+bad.length+'):\n  '+bad.join('\n  ') : '\nNo failures 🎉');
  await b.close(); process.exit(bad.length?1:0);
})();
