/* RupeeFlow — end-to-end QA of the interactive flows */
const { chromium } = require('/home/user/.tools/node_modules/playwright');
const ok = [], bad = [];
const t = (name, cond) => (cond ? ok : bad).push(name);
(async () => {
  const b = await chromium.launch({ args: ['--no-sandbox'] });
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
  const p = await ctx.newPage(); p.setDefaultTimeout(10000);
  p.on('pageerror', e => bad.push('PAGEERROR ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/404/.test(m.text())) bad.push('CONSOLE ' + m.text()); });
  await p.goto('http://localhost:8080/index.html'); await p.waitForTimeout(800);

  /* ---------- 1. full onboarding ---------- */
  t('onboarding opens', await p.evaluate(() => document.querySelector('#sheet').classList.contains('on')));
  await p.fill('#obName', 'Aditya'); await p.fill('#obWork', 'Bengaluru'); await p.fill('#obHome', 'Delhi');
  await p.click('[data-ob=next]'); await p.waitForTimeout(300);
  t('onboarding step 2', await p.evaluate(() => /2 of 3/.test(document.querySelector('#sheetTitle').textContent)));
  await p.click('[data-ob-demo="0"]'); await p.waitForTimeout(200);
  await p.click('[data-ob=next]'); await p.waitForTimeout(300);
  t('onboarding step 3', await p.evaluate(() => /3 of 3/.test(document.querySelector('#sheetTitle').textContent)));
  await p.click('[data-ob=back]'); await p.waitForTimeout(250);
  await p.click('[data-ob-demo="1"]'); await p.waitForTimeout(200);
  await p.click('[data-ob=next]'); await p.waitForTimeout(250);
  await p.click('[data-ob=finish], [data-ob=next]'); await p.waitForTimeout(700);
  const st = await p.evaluate(() => ({ onb: window._rf.S.settings.onboarded, name: window._rf.S.settings.name, tx: window._rf.S.transactions.length, sheetOn: document.querySelector('#sheet').classList.contains('on') }));
  t('onboarding finishes with demo data', st.onb && st.name === 'Aditya' && st.tx > 100 && !st.sheetOn);

  /* ---------- 2. add expense via calculator ---------- */
  await p.click('.fab'); await p.waitForTimeout(350);
  await p.click('[data-k="2"]'); await p.click('[data-k="5"]'); await p.click('[data-k="0"]'); await p.click('[data-k="+"]');
  await p.click('[data-k="1"]'); await p.click('[data-k="0"]'); await p.click('[data-k="0"]'); await p.click('[data-k="="]');
  t('calculator evaluates 250+100', /350/.test(await p.evaluate(() => document.querySelector('#kpVal').textContent)));
  await p.click('#catPick button:nth-child(4)');
  await p.click('[data-preset="5000"]');
  t('preset sets amount', /5,000/.test(await p.evaluate(() => document.querySelector('#kpVal').textContent)));
  await p.evaluate(() => { document.querySelector('#fNote').value = 'QA dinner'; });
  const n0 = await p.evaluate(() => window._rf.S.transactions.length);
  await p.click('[data-x=save]'); await p.waitForTimeout(600);
  t('expense saved', await p.evaluate(() => window._rf.S.transactions.length) === n0 + 1);
  t('saved with correct amount', await p.evaluate(() => { const x = window._rf.S.transactions[window._rf.S.transactions.length - 1]; return x.amount === 5000 && x.note === 'QA dinner' && x.type === 'expense'; }));

  /* ---------- 3. edit + delete a transaction ---------- */
  await p.click('.navb[data-nav=records]'); await p.waitForTimeout(400);
  await p.click('#s-records .txrow'); await p.waitForTimeout(400);
  await p.click('[data-x=edit]'); await p.waitForTimeout(400);
  await p.click('[data-k="C"]'); await p.click('[data-k="7"]'); await p.click('[data-k="7"]'); await p.click('[data-k="7"]');
  await p.click('[data-x=save]'); await p.waitForTimeout(500);
  t('transaction edited', await p.evaluate(() => window._rf.S.transactions.some(x => x.amount === 777 && x.note === 'QA dinner')));
  await p.click('#s-records .txrow'); await p.waitForTimeout(400);
  await p.click('[data-x=del]'); await p.waitForTimeout(300);
  await p.click('[data-x=ok]'); await p.waitForTimeout(500);
  t('transaction deleted', await p.evaluate(() => !window._rf.S.transactions.some(x => x.note === 'QA dinner')));

  /* ---------- 4. filters + search ---------- */
  await p.click('#s-records [data-f=type][data-v=income]'); await p.waitForTimeout(350);
  t('type filter renders', await p.evaluate(() => document.querySelectorAll('#s-records .txrow').length > 0));
  await p.click('#s-records [data-act=clearfilter]'); await p.waitForTimeout(300);
  await p.click('#btnSearch'); await p.waitForTimeout(400);
  await p.fill('#gq', 'swiggy'); await p.waitForTimeout(400);
  t('global search finds Swiggy entries', await p.evaluate(() => document.querySelectorAll('#gqOut .txrow').length) > 0);
  await p.click('#sheetClose'); await p.waitForTimeout(250);

  /* ---------- 5. budgets ---------- */
  await p.click('.navb[data-nav=more]');
  await p.click('#s-more .tile[data-nav=budgets]'); await p.waitForTimeout(400);
  await p.click('.screen.active [data-act=recurbudget]').catch(() => { }); await p.waitForTimeout(400);
  await p.click('#s-budgets .card.pad[data-act=budget]'); await p.waitForTimeout(400);
  await p.fill('#bLim', '4500');
  await p.click('[data-x=s]'); await p.waitForTimeout(500);
  t('budget saved', await p.evaluate(() => Object.values(window._rf.S.budgets).some(m => Object.values(m).includes(4500))));

  /* ---------- 6. recurring: log a bill ---------- */
  await p.click('.navb[data-nav=more]'); await p.click('#s-more .tile[data-nav=recurring]'); await p.waitForTimeout(400);
  const n2 = await p.evaluate(() => window._rf.S.transactions.length);
  await p.click('.screen.active [data-act=logrecur]'); await p.waitForTimeout(500);
  t('bill logged to transactions', await p.evaluate(() => window._rf.S.transactions.length) === n2 + 1);

  /* ---------- 7. goal top-up ---------- */
  await p.click('.navb[data-nav=more]'); await p.click('#s-more .tile[data-nav=goals]'); await p.waitForTimeout(400);
  await p.click('#s-goals .card[data-act=goal]'); await p.waitForTimeout(400);
  const g0 = await p.evaluate(() => window._rf.S.goals[0].saved);
  await p.click('[data-x=add]'); await p.waitForTimeout(400);
  await p.fill('#pmV', '5000'); await p.click('[data-x=o]'); await p.waitForTimeout(500);
  t('goal top-up works', await p.evaluate(s => window._rf.S.goals[0].saved === s + 5000, g0));
  await p.click('#sheetClose'); await p.waitForTimeout(250);

  /* ---------- 8. loan add + EMI paid ---------- */
  await p.click('.navb[data-nav=more]'); await p.click('#s-more .tile[data-nav=loans]'); await p.waitForTimeout(400);
  await p.click('.screen.active [data-act=newloan]'); await p.waitForTimeout(400);
  await p.fill('#lnName', 'QA Car Loan'); await p.fill('#lnP', '800000'); await p.fill('#lnM', '60');
  await p.click('[data-x=s]'); await p.waitForTimeout(500);
  t('loan added', await p.evaluate(() => (window._rf.S.loans || []).length === 1));
  await p.click('.screen.active [data-act=paidone]'); await p.waitForTimeout(400);
  t('EMI paid increments', await p.evaluate(() => window._rf.S.loans[0].paid === 1));

  /* ---------- 9. reimbursements ---------- */
  await p.click('.navb[data-nav=more]'); await p.click('#s-more .tile[data-nav=reimb]'); await p.waitForTimeout(400);
  const pendBefore = await p.evaluate(() => window._rf.S.transactions.filter(x => x.reimb === 1).length);
  if (pendBefore) {
    await p.click('.screen.active [data-act=settlereimb]'); await p.waitForTimeout(600);
    t('reimbursement settles + logs income', await p.evaluate(() => window._rf.S.transactions.filter(x => x.reimb === 1).length) === pendBefore - 1 &&
      await p.evaluate(() => window._rf.S.transactions.some(x => x.cat === 'i_reimb' && /^Reimbursement/.test(x.note))));
  } else t('reimbursement settle (none pending — skipped)', true);

  /* ---------- 10. theme + settings persistence ---------- */
  await p.click('.navb[data-nav=more]'); await p.click('#s-more .tile[data-nav=themes]'); await p.waitForTimeout(400);
  await p.click('#s-themes [data-mode=dark]'); await p.click('#s-themes [data-theme=dracula]'); await p.waitForTimeout(400);
  t('theme applied', await p.evaluate(() => document.documentElement.dataset.theme === 'dracula' && document.documentElement.dataset.mode === 'dark'));
  await p.reload(); await p.waitForTimeout(900);
  t('prefs persist across reload', await p.evaluate(() => window._rf.S.settings.theme === 'dracula' && window._rf.S.settings.mode === 'dark' && window._rf.S.settings.name === 'Aditya'));
  t('no onboarding on reload', await p.evaluate(() => !document.querySelector('#sheet').classList.contains('on')));

  /* ---------- 11. PIN lock ---------- */
  await p.click('.navb[data-nav=more]'); await p.click('#s-more .tile[data-nav=settings]'); await p.waitForTimeout(400);
  await p.click('.screen.active [data-act=setpin]'); await p.waitForTimeout(400);
  await p.fill('#pmV', '1379'); await p.click('[data-x=o]'); await p.waitForTimeout(500);
  await p.reload(); await p.waitForTimeout(1000);
  t('lock screen shows on launch', await p.evaluate(() => !document.querySelector('#lock').classList.contains('hide')));
  for (const d of ['1', '1', '1', '1']) await p.click(`[data-pk="${d}"]`);
  await p.waitForTimeout(500);
  t('wrong PIN keeps lock', await p.evaluate(() => !document.querySelector('#lock').classList.contains('hide')));
  for (const d of ['1', '3', '7', '9']) await p.click(`[data-pk="${d}"]`);
  await p.waitForTimeout(800);
  t('correct PIN unlocks', await p.evaluate(() => document.querySelector('#lock').classList.contains('hide')));

  /* ---------- 12. exports ---------- */
  await p.click('.navb[data-nav=more]'); await p.click('#s-more .tile[data-nav=reports]'); await p.waitForTimeout(400);
  const dl = p.waitForEvent('download', { timeout: 8000 }).catch(() => null);
  await p.click('.screen.active [data-act=csvmonth]');
  t('CSV download triggers', !!(await dl));
  const dl2 = p.waitForEvent('download', { timeout: 8000 }).catch(() => null);
  await p.click('.screen.active [data-act=backup]');
  t('JSON backup download triggers', !!(await dl2));
  const dl3 = p.waitForEvent('download', { timeout: 8000 }).catch(() => null);
  await p.click('.screen.active [data-act=csvall]');
  t('CSV all-data download triggers', !!(await dl3));
  await p.click('.screen.active [data-act=copysum]'); await p.waitForTimeout(600);
  t('copy summary handled (toast or fallback sheet)', await p.evaluate(() => /copied/i.test(document.querySelector('#toast').textContent) || document.querySelector('#sheet').classList.contains('on')));
  await p.click('#sheetClose').catch(() => { }); await p.waitForTimeout(300);

  /* ---------- 13. restore from backup round-trip ---------- */
  await p.click('.navb[data-nav=more]'); await p.click('#s-more .tile[data-nav=settings]'); await p.waitForTimeout(300);
  await p.click('.screen.active [data-act=backup]', { force: true }).catch(() => { });
  await p.click('.navb[data-nav=more]'); await p.click('#s-more .tile[data-nav=reports]'); await p.waitForTimeout(300);
  await p.click('.screen.active [data-act=restore]'); await p.waitForTimeout(400);
  const snapJson = await p.evaluate(() => JSON.stringify(window._rf.snapshot()));
  await p.evaluate(j => { document.querySelector('#rsJson').value = j; }, snapJson);
  await p.click('[data-x=s]'); await p.waitForTimeout(600);
  t('restore from JSON works', await p.evaluate(() => window._rf.S.transactions.length > 100));

  /* ---------- 14. Drive sync payload + error handling ---------- */
  const sheet = await p.evaluate(() => {
    const T = window._rf.G_.tables();
    const b = T.find(x => x.tab === 'Backup');
    return { tabs: T.map(x => x.tab), backupMarker: b.rows[0][0], chunks: b.rows.length - 1, maxChunk: Math.max(...b.rows.slice(1).map(r => r[0].length)), txRows: T.find(x => x.tab === 'Transactions').rows.length };
  });
  t('Drive payload has all 8 tabs', sheet.tabs.length === 8 && sheet.tabs.includes('Backup'));
  t('backup chunked under the 50k cell limit', sheet.backupMarker === 'RF-BACKUP-V1' && sheet.maxChunk < 50000 && sheet.chunks >= 1);
  await p.click('.navb[data-nav=more]'); await p.click('#s-more .tile[data-nav=sync]'); await p.waitForTimeout(400);
  await p.fill('#cid', '123456-notreal.apps.googleusercontent.com');
  await p.click('.screen.active [data-act=connect]'); await p.waitForTimeout(4500);
  t('fake client id fails gracefully (page alive)', await p.evaluate(() => !!document.querySelector('#s-sync').innerHTML.length));

  console.log('\nPASS (' + ok.length + '):\n  ' + ok.join('\n  '));
  console.log(bad.length ? '\nFAIL (' + bad.length + '):\n  ' + bad.join('\n  ') : '\nNo failures 🎉');
  await b.close();
  process.exit(bad.length ? 1 : 0);
})();
