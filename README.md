# ₹ RupeeFlow — Finance Tracker

A **premium, mobile-first personal finance app** built for an Indian software developer who lives in
Bengaluru and shuttles home to Delhi. It is a **single HTML file**, works **fully offline**, costs
**nothing**, and uses **your own Google Drive spreadsheet as the database** — so switching phones is a
one-tap restore.

> Inspired by MyMoney — same 5-tab muscle memory, but with a full dashboard, 22 themes, forecasting,
> budgets with projections, bills, goals, EMI tracker, reimbursements, insights and Drive sync.

**🎛️ Want it your way? → [`CUSTOMIZE.md`](CUSTOMIZE.md)** — custom fields, automation rules, templates,
nav/KPI/dashboard builders, salary-cycle budgeting, custom themes and the `window.RF` JS API.
**🚀 Deploying & updating? → [`GITHUB.md`](GITHUB.md)** — host it on GitHub Pages with auto-deploy, and
push updates that land on your phone (in-app “Update now” bar, build stamps, rollback).
**📘 New here? → [`SETUP.md`](SETUP.md)** is the step-by-step setup guide (hosting, phone install,
Google Cloud OAuth, verification checklist, troubleshooting).
**🩺 Something not working? → open [`setup-check.html`](setup-check.html)** — it tests all seven layers
and prints a copyable diagnostic report.

| | |
|---|---|
| **Main file** | `index.html` (~215 KB, no build step, no dependencies) |
| **Works offline** | Yes — everything is cached on the phone (PWA installable) |
| **Backend** | Google Sheets + Drive, called directly from the browser (no server, no fees) |
| **Currency / FY** | ₹ with Indian digit grouping (₹1,45,000 / ₹1.45L / ₹1.2Cr), April–March |
| **Tested** | 353 automated tests passing (48 app + 59 customisation + 117 options + 33 profiles/decoy + 31 sheet setup + 23 desktop layout + 19 two-device sync + 13 setup checker + 10 update pipeline) + a 17-assertion CI gate |

---

## 0. See it first

`screenshots/00-overview.png` is a contact sheet of the main screens; the numbered PNGs in
`screenshots/` are full-resolution:

| File | Screen |
|---|---|
| `01-dashboard.png` | Home dashboard — net worth, KPIs, accounts |
| `02-budget-insights.png` | Budget envelopes by risk + donut + smart insights |
| `03-records.png` | Records list with filters and daily subtotals |
| `04-analytics-flow.png` | Cumulative expense flow vs last month |
| `05-calendar-heatmap.png` | Spending calendar heat-map + weekday averages |
| `06-more-hub.png` | The “More” hub with all modules |
| `07-budgets.png` | Envelope budgeting with projections |
| `08-goals.png` | Savings goals |
| `09-loans.png` | EMI calculator + loan payoff tracking |
| `10-themes.png` | Appearance — 22 themes × light/dark/AMOLED |
| `11-add-expense.png` | Add-transaction sheet with calculator keypad |
| `12-dashboard-amoled-dark.png`, `13-analytics-dark.png` | AMOLED true-black mode |
| `14-setup-checker.png` | The setup diagnostic page |
| `15-customise-overview.png` | Contact sheet of the whole Customise suite |
| `16-customise-modules.png` … `25-dashboard-customised.png` | The 7 Customise tabs in action |
| `26-toast-fix.png` | Before/after: toasts now disappear instead of parking over the bottom nav |
| `27-two-devices.png` | The same stats on phone and laptop, merged through one Google Sheet |
| `28-desktop.png` | The laptop layout — side rail, two-column dashboard, wide tables |
| `29-profiles.png` | Sign-in menu and the PIN gate for a decoy profile |
| `30-budget-card-editable.png`, `33-budget-wizard.png` | The budget that explains itself, and its editor |
| `31-passthrough-card.png`, `32-passthrough-screen.png` | Pass-through money — someone else's money, tracked separately |
| `34-clear-sheet.png`, `35-guided-setup.png`, `36-setup-categories.png` | Clear data and the guided re-setup |
| `37-home-visible.png`, `38-home-hidden.png` | Hide-balances on/off — nothing leaks either way |
| `39-passthrough-people.png`, `40-passthrough-ledger.png` | Father and Mother side by side, running balance, out-of-pocket |
| `41-add-split-pass.png`, `42-signin-once.png` | Splitting one payment between two people · sign in once |
| `15-customise-layout.png` … `21-customise-dev.png` | Layout, fields, templates, rules, format, theme, dev panel |
| `22-rule-editor.png`, `23-rule-json.png` | Rule builder + JSON editor |
| `24-add-sheet-custom.png` | Add sheet with templates + custom fields |
| `25-dashboard-customised.png` | Custom nav + KPIs + theme + salary cycle applied |

Regenerate them any time with `node tests/gallery.js` (server must be on :8080).

> **Note about the in-app preview:** `index.html` is a full application, not a document. In a sandboxed
> preview it renders fine but runs in **memory-only mode** (browser storage and Google sign-in are
> blocked inside sandboxed iframes). If your previewer blocks JavaScript entirely, the page shows a
> short "RupeeFlow is starting…" card instead of going blank. For the real experience open
> `http://localhost:8080` in a browser tab, or double-click `index.html`.

---

## 1. Quick start

### Option A — just open it (30 seconds)
Double-click `index.html`. It runs immediately: pick a theme, tap **+** and start logging.
Data is saved in the browser. (Google sign-in needs a hosted URL — see §3.)

### Option B — local server (recommended on a laptop)
```bash
cd finance-tracker
python3 -m http.server 8080     # or:  ./serve.sh   (Windows: serve.bat)
```
Open <http://localhost:8080> . This origin is accepted by Google for Drive sync.

### Option D — check your setup before you trust it
Open **`setup-check.html`** (same folder / same URL as the app) and click **Run all checks**.
It verifies files, origin/protocol, device storage, offline install support, Google script
reachability, your Client ID and a live Drive+Sheets round-trip, then gives you a one-click
diagnostic report. Full walkthrough: **`SETUP.md`**.

### Option C — free hosting so your phone can use it
Any static host works because there is nothing to build:

| Host | How | Cost |
|---|---|---|
| **GitHub Pages** | create repo → upload the 5 files → Settings → Pages → Branch `main` /root | Free |
| **Netlify / Cloudflare Pages** | drag-and-drop the folder onto the dashboard | Free |
| **Vercel** | `vercel` CLI or import the folder | Free |

You then get an HTTPS URL like `https://yourname.github.io/finance-tracker/`.

---

## 2. Put it on your phone (2 minutes)

**Android (Chrome):** open your URL → ⋮ menu → **Add to Home screen** → it installs as a standalone
app (own icon, full-screen, no browser bars).

**iPhone (Safari):** open your URL → Share → **Add to Home Screen**. Use Safari, not an in-app
browser, or Google sign-in will be blocked.

Once installed it works with **zero network** — the (tiny) service worker caches the shell, all maths
runs on-device, and Drive sync just reconciles when you're online.

---

## 3. Connect Google Drive (the database) — one-time setup, ~3 minutes

RupeeFlow writes a spreadsheet called **“RupeeFlow — Personal Finance (do not rename tabs)”** into your
Drive. That sheet *is* your database: readable, sortable, exportable, and immune to the app dying.

1. Open <https://console.cloud.google.com/> and create a project (e.g. `rupeeflow`).
2. **APIs & Services → Library** → enable **Google Sheets API** and **Google Drive API**.
3. **APIs & Services → Credentials → Create credentials → OAuth client ID**.
   * Application type: **Web application**
   * **Authorised JavaScript origins** → add the exact origin you host on:
     * `https://yourname.github.io` (no trailing slash, no path)
     * `http://localhost:8080` (while testing locally)
4. Copy the **Client ID** (ends in `.apps.googleusercontent.com`).
5. In the app: **More → Drive Sync** → paste the Client ID → **Connect** → approve.
   The spreadsheet is created automatically and everything syncs.

Then tap **⬆ Send phone → Drive** (or leave auto-sync on) and you're done.

### What lands in your sheet

| Tab | Contents |
|---|---|
| `Transactions` | Date, time, type, category, amount, account, to-account, note, tags, reimbursement, id, updated |
| `Accounts` | Every account with opening + current balance |
| `Categories` | All categories with usage counts and this month's spend |
| `Budgets` | Category, this month's limit, default limit, spent, % used |
| `Recurring` | Bills, subscriptions, salary with day-of-month |
| `Goals` | Target, saved, progress % |
| `Summary` | Income, expenses, savings rate, net worth, liquid balance, pending reimbursements |
| `Backup` | Chunked JSON snapshot — this is what powers one-tap restore |

### Switching phones
Install RupeeFlow on the new phone → **More → Drive Sync** → paste the same Client ID → **Connect** →
**⬇ Load Drive → phone**. All history, accounts, budgets, goals and bills come back.

### Troubleshooting

| Symptom | Fix |
|---|---|
| `idpiframe_initialization_failed` / `origin_mismatch` | The origin in Google Cloud doesn't exactly match the URL you opened (scheme, host, port, no path, no trailing slash). Add every origin you use, then wait ~5 min for Google to propagate. |
| "Google sign-in script could not load" | Offline, or the page is open inside an in-app/sandboxed browser. Open the URL directly in Chrome/Safari. |
| Consent screen shows "Google hasn't verified this app" | Normal for a personal app: **Advanced → Go to … (unsafe)**. You are the only user; scopes are `drive.file` + `userinfo.email`. |
| "Session expired — reconnect" | Google access tokens last ~1 hour. The app refreshes silently; if it can't, tap Reconnect. |
| Sync fails with "Verification failed" | Rare race on a huge dataset — tap **Sync now** again. RupeeFlow always re-reads the Backup tab and compares counts before claiming success. |
| Hosted on plain `http://192.168.x.x` | Google only allows `http` for `localhost`. Use HTTPS hosting (GitHub/Netlify) for phone use. |
| Blocked in an office/in-app browser | Use **Drive Sync → Advanced → paste an access token**, or open in Chrome/Safari. |
| Want to start over | **Drive Sync → Create fresh sheet** (old sheet is left untouched). |

---

## 4. Feature tour

### Home dashboard
* Gradient **net-worth hero** with 7-month trend sparkline and month-on-month delta in ₹ / L / Cr
* KPI cards: income, expenses (+ daily average bar), saved (with savings rate), **month-end forecast**
* **Budget health** card: spent vs budgeted, % used, four most-at-risk envelopes
* Donut of where the money went + 6-month income/expense bars
* **Smart insights** — auto-written sentences: pace vs last month, savings-rate verdict, weekend vs
  weekday pressure, subscription burn, pending reimbursements, over-budget envelopes, emergency-fund
  coverage, Delhi↔Bengaluru travel cost
* Account carousel, upcoming bills in the next 10 days, recent transactions, goals, quick actions
* Month switcher (‹ ›) that re-renders every screen for that month

### Records
* Day-grouped list with per-day expense/income subtotals
* Filters: type (expense / income / transfer / reimbursement-due), account, category, tag + free-text search
* Search across **all** history from the app bar
* Tap any row for a detail sheet (edit, duplicate, delete, settle reimbursement)

### Add / edit transaction
* Type switch: Expense · Income · Transfer (between accounts)
* **Calculator keypad** — type `250+40*3=` and it evaluates; ⌫, C, brackets
* Category grid with emoji + colour, “New” category inline
* Account picker, date + Today/Yesterday shortcuts, note, tags (create new tags inline)
* **Reimbursable** toggle for office spends, quick-amount presets

### Analytics (5 modes)
1. **Expense flow** — cumulative this month vs last (dashed), daily burn area chart, biggest/zero-spend
   days, 6-month flow tracker with running total
2. **Categories** — donut, ranked bars with %, income sources, savings rate
3. **Comparison** — grouped income-vs-expense bars, spend by weekday, month-on-month table
4. **Calendar** — GitHub-style heatmap of the month + average spend per weekday
5. **Deep dive** — top spend locations, recurring burn (monthly + annualised), trip costs, budget adherence

### Budgets
* Envelope list sorted by risk with **projected month-end spend** and overshoot for each
* Overall: spent, budgeted, **safe to spend**, daily allowance, days left
* Fixed/committed categories (rent, EMI, subscriptions) are treated as committed spend
* Set limits per month, save as default for future months, copy last month, or auto-fill from averages
* Tap a budget to drill into its transactions
* The home card says **where its number comes from** — your month, your defaults, or the built-in
  examples (“example limits” badge) — and offers **Edit budget** right there: one total, spread by
  last month's spending, evenly, or keeping the current split, plus a shortcut for a single category

### Accounts
* 6 types: bank, cash, wallet/UPI, credit card, investment, loan — with icon + colour
* Live balances from opening balance + full transaction history, transfers move money between accounts
* Net worth, liquid balance and card outstanding at a glance; credit cards count negatively

### Categories
* Fully customisable: emoji, colour, income/expense, and a **fixed/committed** flag
* 30 sensible defaults for Indian life: Namma Metro, Swiggy/Zomato, Cloud & Dev Tools,
  Home Transfer (Delhi), SIP & Investments, Insurance, EMI, Bonus & RSU, Cashback…
* Delete keeps transactions (they move to Miscellaneous)

### Bills & subscriptions
* 10 seeded recurring items (rent, salary, SIP, ACT Fibernet, AWS+Copilot, Netflix+Spotify, BESCOM,
  Cult.fit, term insurance, money home) with day-of-month and account
* Fixed-vs-income ratio progress bar, subscription monthly + annualised burn
* “Not logged yet this month” with one-tap **Log it**

### Goals
* Target, saved, %, ₹/month needed to finish in a year, quick **Add money**
* Seeded: emergency fund, Diwali trip home, MacBook upgrade, Goa trip

### Loans & EMI
* EMI calculator with sliders (amount, rate, tenure) → EMI, total interest, interest as % of principal, year-1 interest
* Track your own loans: outstanding balance, EMIs left, +1 paid, payoff progress

### Reimbursements
* Outstanding vs settled, FY total, one-tap **Settle** (also logs the reimbursement as income)

### Pass-through money (money that isn't yours)
* Father sends ₹25,000 for his own rent and bills? Flip **🤝 Pass-through** on the entry and pick who
  it belongs to. Keep as many people as you need — **Father and Mother each get their own block**
* **One payment can be split between people**: turn on *Split between people*, add Father ₹6,000 and
  Mother ₹4,000, and the last row always holds the remainder. Over-allocating is refused before it
  can save, and a repeated name is merged instead of losing money
* Balances still move — the money really is in your account — but the entry is **left out of your
  income, expenses, category spend, budgets, savings rate and charts**
* **Either order works**: pay for their medicines *before* their money arrives and the block shows
  **"you are out of pocket"**; record their transfer afterwards and it clears. Each person's
  **ledger** shows every entry with a **running balance**, so −₹6,600 → +₹6,000 → −₹600 is obvious
* Settle **per person** ("Settle 3" on their block) or everything at once; settling is state, never an
  income entry
* **More → Pass-through** holds the per-person blocks, rename, add person, and a one-tap
  **+ Entry for <person>**. Records tags them ("🤝 Papa + Mother") with a filter chip, and the CSV
  export plus the Drive sheet write every person with their share

### Sign in once, stay signed in
* Set a PIN and tick **Remember this phone** — the PIN is asked **once**, then never again: not at
  launch, not after the app sits in the background, not after an update
* The memory is stored **on the device only** (never in your Sheet, never on another phone) and is
  tied to the current PIN, so **changing the PIN asks again**; a decoy profile has its own record
* **Lock now** hands the phone over instantly without losing the memory; the toggle in
  *Settings → Security* turns it off if you would rather be asked every time
* Google: once your Drive account is linked, RupeeFlow re-signs-in **silently** on launch, on focus
  and on reconnect, retries quietly in the background, and refreshes the token every 45 minutes —
  you never tap "sign in" twice

### Clear, reset & start again
**Settings → Data & backup** gives you one sheet where you tick exactly what goes — transactions,
pass-through entries only, reimbursement claims, account opening balances, budget limits, bills,
goals, loans — with a live summary and a cancel that really changes nothing.
* **Fresh start (guided)** wipes everything and walks you through **payment modes → categories →
  budget → Drive backup**, so a blank app never stays blank: it ends with real accounts, real
  categories and a working budget
* Anything cleared stays in your Sheet until you sync, so RupeeFlow always asks whether to overwrite
  Drive right after (keep it as a backup, or send the clear through)

### Reports & export
* Full monthly statement (breakdown, income sources, budget compliance, top 8, FY summary) → **Print/PDF**
* **CSV** (this month or everything), **JSON backup** download, **restore from JSON** (paste or file)
* Copy a shareable monthly summary text

### Customisation (Everything is configurable — see [`CUSTOMIZE.md`](CUSTOMIZE.md))
* **Custom fields** — add your own columns (Project, Client, Payment mode, Billable, Environment…) with
  text/number/date/select types; they show on the form, detail sheet, CSV export and Drive backup
* **Automation rules** — a real when→then engine with regex matching, dry-run testing and history
  back-fill (JSON editor for power users)
* **Quick-add templates** — one-tap entries pinned to the dashboard (Chai ₹20, Metro ₹45, Lunch ₹250)
* **Layout builder** — choose your 3 nav tabs, pick from 14 dashboard KPIs (tap a card to swap it),
  reorder/hide all 11 dashboard sections, hide unused modules
* **Salary-cycle budgeting** — set your payday (e.g. 25th) and every screen re-bases to
  `25 Aug – 24 Sep`; forecasts, budgets and reports follow your real month
* **Format control** — currency symbol, decimals, accounting negatives, lakh/crore vs k/M
* **Custom theme builder** — accent + secondary + base hue, derived correctly for light/dark/AMOLED
* **Developer panel** — `window.RF` API (`add`, `update`, `rules.run`, `export/import`, event hooks,
  `stats`, `vars`), settings/data JSON editors, `n` `/` `g o` keyboard shortcuts, data stats

### Appearance — 22 themes
Bangalore Indigo · AMOLED Black · Midnight Pro · Cyberpunk Neon · Terminal Green · Dracula · Nord Frost ·
Solarized Sand · Rose Quartz · Cherry Blossom · Sunset Coral · Ocean Deep · Mint Fresh · Forest Guard ·
Coffee Roast · Lavender Haze · Arctic Ice · Peach Cream · Slate Mono · Regal Gold · Bubblegum Pop · Paper Ink

× **light / dark / auto**, plus **AMOLED true-black**, **monospace numbers** and **reduce motion**.
Every palette recomputes its own surfaces, borders, contrast and money-colours per mode, so all 22 look
deliberate in both light and dark. **🎲 Surprise me** picks one for you.

### Settings & security
Profile (name, work/home city), 4-digit **PIN lock** (asked at launch and after 5 min in background),
**hide balances** toggle, Drive sync, **Clear data…** (granular, with a live summary), **Fresh start
(guided)**, reload starter kit, start blank, erase everything, app info.

### Money rules baked in
* Net worth = assets − credit-card dues; liquid ≠ investments
* Transfers never count as income or expense
* Refunds/cashback are income, reimbursements are tracked separately and settled explicitly
* **Pass-through money is never income or expense** — it only moves account balances
* **Hide balances hides every amount, everywhere** (including toasts and the Sheet-backed screens);
  only the amount you are typing stays readable
* A pass-through entry moves balances but belongs to **its person's block**, split or whole — never
  to your income, expenses, budgets or savings, whichever order the entries arrive in
* Savings rate = (income − expenses) / income; forecast = daily average × days in month
* India: 3-digit grouping, lakh/crore compaction, April–March financial year

---

## 5. Data & privacy

* **No server, ever.** The browser talks straight to `googleapis.com`. Nothing is sent to the app author.
* Google scopes: `drive.file` (RupeeFlow can only see the spreadsheet **it** creates) + `userinfo.email`.
* On-device data lives in `localStorage` under `rupeeflow.v1`; the JSON backup contains everything.
* No ads, no analytics, no accounts, no telemetry. Free forever.
* Losing your phone loses nothing — the spreadsheet holds the truth.

---

## 6. Project layout

```
finance-tracker/
├─ index.html            ← the whole app (UI + logic + charts + Drive sync)
├─ setup-check.html      ← interactive setup diagnostic (7 live checks + report)
├─ manifest.webmanifest  ← PWA: installable to the home screen
├─ sw.js                 ← offline cache (never caches Google API calls)
├─ icon-192.png          ← app icons
├─ icon-512.png
├─ SETUP.md              ← step-by-step setup, verification & troubleshooting guide
├─ CUSTOMIZE.md          ← every customisation point + window.RF developer API
├─ README.md             ← feature tour, Drive sync setup, FAQ
├─ GITHUB.md             ← GitHub Pages deploy + phone update workflow
├─ CHANGELOG.md          ← release history with build stamps
├─ serve.sh / serve.bat  ← one-command local server
├─ .github/workflows/    ← deploy.yml (validate → Pages) · test.yml (browser suite on PRs)
├─ tools/                ← bump.js (release stamp) · push.sh (one-command release)
├─ screenshots/          ← 27 images (screens, customisation, toast fix, two-device proof)
└─ tests/
   ├─ qa.js              ← 48 end-to-end interaction tests (Playwright)
   ├─ custom.js          ← 59 tests for fields / rules / templates / layout / theme / API
   ├─ options.js         ← 117 tests for hidden balances, budgets, clear/reset, pass-through (many people), sign-in-once
   ├─ setupcheck.js      ← 13 tests for the setup checker itself
   ├─ update.js          ← 10 tests proving the in-app update flow works
   ├─ ci-check.js        ← 17-assertion integrity gate used by GitHub Actions
   ├─ gallery.js         ← regenerates screenshots/ on demand
   ├─ shot.js            ← screenshots of every screen
   └─ showcase.js        ← screenshot set per theme/mode
```

Run the tests (needs `playwright` + Chromium, and the app served on port 8080):
```bash
python3 -m http.server 8080 &
node tests/ci-check.js    # integrity gate, no browser   (17 assertions, CI runs this)
node tests/qa.js          # app behaviour                (48 tests)
node tests/custom.js      # customisation layer          (59 tests)
node tests/setupcheck.js  # setup checker behaviour      (13 tests)
node tests/update.js      # in-app update pipeline       (10 tests — see GITHUB.md §10)
node tests/twodevice.js   # phone + laptop sync          (19 tests, mocked Google — no credentials)
node tests/options.js     # hide/budget/clear/pass-through/sign-in (117 tests)
node tests/profiles.js    # profiles, PIN gate, decoy    (33 tests — proves real data never leaks)
node tests/desktop.js     # laptop layout, phone intact  (23 tests)
node tests/sheetsetup.js  # Sheet creation + API errors (31 tests, mocked Google)
node tests/gallery.js     # refresh screenshots/
```

---

## 7. FAQ

**Is it really free?** Yes. Google Drive (15 GB), GitHub Pages hosting and the APIs used here are free
for personal volume, and there is no server to pay for.

**Why does Drive sync need a Client ID?** Google requires an OAuth client per app. It's a public
identifier (not a secret) that you create in your own Cloud project, so the app writes into *your* Drive
without any third party in between.

**Can I use two phones at once?** Yes — same Google account, same Client ID. Each phone keeps working
offline; sync pushes the phone's state and the Backup tab restores it. For a single-user flow this is
safe; do your editing on one phone at a time (each push overwrites the sheet).

**Does it track credit-card dues?** Yes — card spending makes the card balance negative; the bill
payment is a transfer from your bank to the card, which clears it.

**Can I edit the sheet by hand?** Read it freely. RupeeFlow owns the structure of the tabs, so write
changes back via the app (or edit and then don't re-sync) to avoid surprises.

**What if I want to move off Google later?** **Reports → Backup JSON** is a complete, portable dump;
the schema is plain arrays of objects.

---

## 8. Ideas for v1.2

* Split expenses with friends & settle-up ledger
* UPI/SMS import (paste bank SMS → auto-parse)
* Attachments (receipt photos → Drive folder)
* Bill reminders as local notifications (service-worker push)
* Multi-currency for travel with live rates
* Shared household sheet (two Google accounts, one spreadsheet)
