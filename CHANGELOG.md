# Changelog

All notable changes to RupeeFlow. The build stamp shown in **Settings → About** matches the entries here,
so you can confirm at a glance which version your phone is running.

## 1.4.6 — 2026-09-19  ·  build `1.4.6+2026-09-19.1`

Quick templates can be pass-through too.

- **A template can belong to a person.** In **Customise → Templates** the editor now has the same
  **🤝 Pass-through** switch as the add sheet: turn it on, pick who the money is for (or type a new
  name right there), and every tap of that template books the entry straight into that person's
  pass-through block. It stays out of your income, expenses, budgets and savings rate, exactly like a
  hand-entered pass-through — so *"Papa medicines ₹4,000"* is one tap, in the right bucket, with no
  chance of it being counted as your own spending.
- **You can see it is for them before you tap it.** The template row in Customise, the dashboard tile,
  and the chip at the top of the add sheet all carry the person — *"Papa medicines · ₹4,000 🤝 Father"*.
  Logging shows a toast that names them, and tapping the chip in the add sheet pre-fills the
  pass-through toggle *and* the person, so you can still change the amount and save.
- **Refuses to guess**: a pass-through template with nobody named is refused ("Say whose money it is
  — pick a person or type a name"), and a name typed into the template is registered with the other
  people so it appears in the add sheet, the pass screen and the person registry.
- Two bugs the new tests caught along the way: filling the add sheet from a pass-through template
  dropped the person (the chip wrote the draft, but the sheet re-read the name from its own input —
  the entry saved as "Unnamed"); and a person typed into a template was never registered.
- `tests/options.js` grew from 138 to **156 tests** (group **I**: the template switch, the person
  picker, refusal without a person, running it from Customise and from the dashboard, the marked
  chip, the pre-filled add sheet, and that an ordinary template is untouched). `tests/options.js`'s
  D-group settle check was also made deterministic — it used to click "the first row", which depends
  on sort ties. Totals now **392 tests** across the suites. A `tools/setup-tests.sh` script now sets
  up the test browser in one command on a fresh machine.

## 1.4.5 — 2026-09-19  ·  build `1.4.5+2026-09-19.1`

Two things you hit while using 1.4.4.

- **The budget total is now exact.** Spreading ₹15,000 evenly across 23 categories used to save
  ₹14,950 — every category was rounded on its own and the remainders simply vanished. The wizard now
  hands the last rupees to whoever was cut the most, so the categories always add up to the figure you
  typed (₹15,000 → 23 × ₹652, exactly ₹15,000). Whole totals still come out in tidy ₹10 steps
  (and ₹14,950 in ₹5s); a total that cannot be split evenly stays exact rupee-for-rupee, and the
  editor shows "Adds up to exactly ₹15,000 across 23 categories" *before* you apply it. Fixes all
  three modes — by last month's spending, evenly, and keep-current-split.
- **Every pass-through person now has a running summary: this month and overall.** The person's block
  on the pass screen shows **THIS MONTH** (spent for them, received from them, entries, still open)
  beside **OVERALL** (the same figures for all time, plus since when). Opening the person gives a
  **Summary** table with month and all-time columns — spent, received, net (with the sign), and entry
  counts — and the running-balance list now has a **THIS MONTH** divider above the current month's
  rows, so the balance you are looking at is never mixed up with last month's. The screen header does
  the same: all-time received/spent for them, with the month figures on the line below.
- `tests/options.js` grew from 117 to **138 tests**: group **G** (exact budget totals — even, odd,
  indivisible, all three modes, through the real editor and across a reload) and group **H**
  (per-person month/overall summaries, separate totals per person, the ledger's month divider and
  zero state, and that none of it touches income/expenses). The E- and H-groups' income/expense
  baselines are captured from the loaded month instead of hard-coded, so they no longer drift as the
  demo data ages.

## 1.4.4 — 2026-09-16  ·  build `1.4.4+2026-09-16.2`

Three follow-ups from using 1.4.3 for real: pass-through needed to handle *several* people, money that
arrives in either order, and signing in once instead of every time the app opens.

- **Pass-through now works for as many people as you need — and one payment can cover two of them.**
  Father and Mother each get their own block with their own balance. A single UPI transfer can be
  **split** between people (`Split between people` in the add sheet): type the shares, the last row
  always holds the rest, a repeated name is merged instead of losing money, and over-allocating is
  refused before anything saves. Each person can be renamed (across every entry at once), added
  without an entry yet, or opened as a **ledger**.
- **Both orders are handled, because real life is not chronological.** Pay for their medicines before
  their money arrives and the block flips to **"you are out of pocket"**; record their transfer later
  and it clears. Nothing becomes your income or expense either way — and the per-person **ledger with
  a running balance** (−₹6,600 → +₹6,000 → −₹600) makes the swing visible instead of confusing.
- **Settling is per person.** "Settle 3" on Mother's block closes her share of a shared payment and
  leaves Father's part open; an entry only counts as fully closed when every share is. Settling never
  creates an income entry (unlike reimbursements, which do).
- **Sign in once, stay signed in.** Setting a PIN asks it once and remembers the phone — no PIN at
  launch, after backgrounding, or after an update. The record is **device-local** (never in your Sheet,
  never on another phone), is tied to the current PIN, so **changing the PIN asks again**, and each
  profile (including a decoy) keeps its own. `Lock now` hands the phone over without losing the memory;
  the toggle in Settings → Security turns the behaviour off for anyone who wants the old every-launch
  lock. Google gets the same treatment: a linked account re-signs-in silently on launch, on focus and
  on reconnect, retries quietly every 15 minutes, and refreshes its token every 45 — no second sign-in.
- Bugs caught by the new tests: renaming a person rewrote the copy of the shares instead of the stored
  data (the rename looked like it worked and did nothing); `passEl` was read before its declaration in
  the add sheet (a dead save button with a `Cannot access 'passEl' before initialization` error in the
  console); the share editor's remainder column needed the same re-bind treatment as the pass toggle.
- `tests/qa.js` updated for the new sign-in default (setting a PIN remembers the phone; the suite now
  turns that off to exercise the every-launch lock). `tests/options.js` grew from 74 to **117 tests**
  (multi-person blocks, splits, negative and positive orderings, per-person settling, rename, share
  normalisation, sign-in-once, silent reconnect). Totals now **353 tests** across nine suites.

## 1.4.3 — 2026-09-16  ·  build `1.4.3+2026-09-16.1`

Three things the app got wrong that a user could see, fixed at the root — plus the money rule that was missing.

- **Hide balances now hides *every* amount, everywhere.** Masking used to be applied call-site by call-site
  (`money()` here, `M()` there) and newer screens were written with plain `inr()` — which is why hiding the
  totals still left "Rent ₹12,000", the KPI pills, the spend bars, the bills list and the reports table in
  plain sight. Masking is now a single pass over the rendered DOM (inputs, the keypad and anything you are
  typing stay readable), it runs on *every* render path including modal sheets, and a MutationObserver keeps
  masking anything written later — charts, rewritten cards, toasts. `₹1.06L`/`₹31k` compact forms are covered
  too. Navigation through `RF.go()` used to skip the mask entirely; that hole is closed.
- **The ₹93,200 budget is no longer a mystery number.** It was simply the sum of the per-category limits —
  but nothing said so and the only editor lived on the Budgets screen. The Home card now states its own
  source (your month / your defaults / the built-in **example limits**, with that badge visible when nothing
  has been set) and offers **Edit budget** right on the card: one total, spread by last month's spending,
  evenly, or keeping the current split, with a live preview and per-category shortcuts. The Budgets screen
  gained **Set total budget** and **Restore defaults**.
- **Clear, reset and start over.** A single **Settings → Data & backup → Clear data…** sheet with eight
  ticks — transactions, pass-through entries only, reimbursement claims, account opening balances, budget
  limits, bills, goals, loans — a live "will change" summary, and a cancel that changes nothing. Clearing
  anything offers to overwrite the Sheet right after, because otherwise the next merge brings it back.
- **Fresh start (guided).** Erase everything, then a four-step wizard puts it back together: **payment
  modes** (with presets, rename/add/remove, opening balances) → **categories** (30-set / 10 essentials /
  empty) → **budget** (total + how to split it) → **Drive backup**. Nothing is left half-blank.
- **Pass-through money — someone else's money is no longer your income or expense.** When your father sends
  money for his own rent, mark the entry **🤝 Pass-through** and name the person. Balances still move
  (the money is really in your account) but the entry is excluded from income, expenses, category spend,
  budgets, savings rate, charts and the forecast. **More → Pass-through** shows what you hold per person,
  lets you settle single entries or everything, Records tags them and offers a filter chip, and the CSV
  export plus the Drive sheet carry the person's name. `pass: 1` = open, `pass: 2` = settled (still excluded).
- Bugs found and fixed while validating the above: the pass-through toggle re-rendered the add sheet without
  re-binding its handlers (the keypad went dead after flipping the switch); `RF.setPref('hideBalances')` wrote
  to custom prefs instead of settings, so the documented API could not hide anything; the pass-through Home
  widget was never added to the widget order; Cancel did nothing in the clear sheet and the budget wizard;
  a long sheet pushed its footer button off-screen (flexbox `min-height:auto`) — while the wizard footer was
  additionally left `display:none`; settling a pass-through entry left its stale detail sheet open.
- New suite `tests/options.js` — **74 tests** covering all of it: no amount on any of the 15 screens while
  hidden (plus keypad/toast/compact-number cases), budget source detection and editing with reload
  persistence, every clear option on its own, the full guided wizard including "start empty" and skipped
  backup, and pass-through against totals, category spend, transfers, budgets, stats, settling, records,
  CSV and the Drive sheet. Totals now **308 tests** across nine suites.

## 1.4.2 — 2026-09-13  ·  build `1.4.2+2026-09-13.1`

- **Fixed: `INVALID PROPERTIES: UNSUPPORTED LOCALE: EN_IN` — sync could never start.** Creating the
  spreadsheet asked Google for an `en_IN` locale; the Sheets API supports only a short list (`en`, `en_US`, …)
  and rejects the entire create request, so no sheet was ever made. RupeeFlow now sends **no locale** (the app
  writes RAW values and formats the currency itself, so the sheet's locale is irrelevant) and falls back to a
  bare create if a property is ever refused.
- **Sync failures can no longer masquerade as success.** `reconcile()` used to publish and then report
  "synced" even when the publish had thrown — which is why a broken setup looked merely "Local-only". It now
  propagates the failure, keeps the Drive copy locked, and stays in a visible error state until a sync works.
- **Errors are translated, not shouted.** The status pill is a short "Needs attention"; the sync screen shows a
  plain-English card (cause + what to do) with the raw Google message available under "What does this mean?",
  covering unsupported-property, rate limit, Drive full, permission, stale session and missing-spreadsheet cases.
- `RF.status()` added — one obvious place to read sync state (`G_` is the API, `G` holds status; getting that
  wrong tripped up two of my own tests).
- Demo data no longer shows activity **later today** than the current time (seeded clock times are clamped).
- New suite `tests/sheetsetup.js` — 31 tests with a mock backend that rejects unsupported locales exactly like
  Google: no locale is ever sent, setup survives a locale-rejecting backend, the failure is reported honestly,
  error wording is right for six kinds of API error, and the recovery path (fix → "Sync now (merge)" → sheet
  created, data seeded, lock released) works end to end.

## 1.4.1 — 2026-09-12  ·  build `1.4.1+2026-09-12.5`

- **Google sign-in failures are now explained in the app.** `Error 403: access_denied` — the most common
  OAuth setup mistake (an unpublished "Testing" app with no test user added) — now opens a help sheet with
  the exact Cloud Console steps instead of leaving you on Google's bare error page. Wrong-origin, blocked
  pop-up, blocked cookies and "the window just closed" are diagnosed too, and a sign-in that never calls
  back is detected after 25s and explained. The in-app setup list and `SETUP.md` gained the missing
  Test-users / Publish-app step.
- 6 new tests in `qa.js` covering both failure paths (explicit `access_denied` callback, and total silence)
  and that a failed connect leaves the app usable and unguarded.

## 1.4.0 — 2026-09-12  ·  build `1.4.0+2026-09-12.4`

- **Laptop layout.** From 1000px wide the app stops being a stretched phone: the bottom bar becomes a
  left rail with labelled nav, the dashboard becomes a two-column grid with a wider hero and KPI row,
  tables use the full width, and bottom sheets turn into centred dialogs. The phone layout is untouched —
  it is the same markup with `.hcol` collapsing to `display:contents` and the custom widget order
  preserved by inline `order`.
- **Profile login / logout + decoy mode.** Tap the avatar to switch between profiles: each is a fully
  separate local dataset with its own optional 4-digit PIN. Create a decoy profile and you can hand your
  phone over showing plausible sample data — the decoy carries no Google credentials, cannot write to your
  sheet, and can be configured to open at launch. Your real profile is untouched and stays PIN-protected.
- **Fixed a state-leak bug** found while testing the above: `loadState()` merged saved data into the live
  state object, so a profile switch could carry entries from the previous profile. It now rebuilds state
  from a blank object, and `window._rf.S` is a getter (it used to hand out a stale reference after a switch).
- New suites: `tests/profiles.js` (33 tests — proves the decoy never leaks real data, gates on PIN, keeps
  its data across reloads, and writes nothing to Drive; includes a negative control) and `tests/desktop.js`
  (23 tests — the laptop rail/grid/dialog layout on 15 routes plus the 999→1001px breakpoint, and that the
  phone layout and custom widget order are unchanged).

## 1.3.0 — 2026-09-12  ·  build `1.3.0+2026-09-12.3`

- **Phone + laptop on one Google account.** Connecting a second device used to *overwrite* the sheet
  with that device's local copy — a fresh install could wipe months of entries. The app now **merges**:
  entries are matched by id (newest edit wins), deletions sync as tombstones, and a device that has never
  synced adopts the sheet's copy instead of replacing it.
- **Launch sync** — the app signs in silently with your remembered account and reconciles on open, so the
  laptop shows what you entered on the phone without any tapping. “Sync now” merges; the old one-way
  buttons are now explicitly “Force this device → Drive” / “Force Drive → this device”.
- **Concurrency guard** — the sheet carries a revision counter; a push that discovers a newer remote
  revision merges first instead of clobbering the other device. This fixed a real lost-update race found
  by the new test (phone's entry was overwritten by the laptop's next auto-sync).
- **Safety nets** — “↩︎ Undo last sync” restores this device's pre-merge copy; new devices show
  “Drive copy locked until first merge”; the sync screen shows this device's id and revision.
- Customisation (fields, templates, rules, formatting prefs) now travels with the sync snapshot.
- New suite `tests/twodevice.js` — 19 tests driving two simulated devices against a mocked Google Drive,
  proving: fresh device can't clobber the sheet, both devices converge after edits on either side,
  deletions propagate and stay deleted, and a third device sees identical data.

## 1.2.1 — 2026-09-12  ·  build `1.2.1+2026-09-12.2`

- **Fixed:** toasts (e.g. “Theme mode: light”, “−₹20 · chai”) never disappeared — they lingered above the
  bottom bar until something replaced them. The hide was a transform-only slide (`translateY(140%)`) that
  left the pill ~35px above the bottom of the screen, still fully painted. Now hidden with
  `opacity:0; visibility:hidden` (plus a larger exit slide), with `transition: none` respected in
  reduce-motion mode.
- Added 7 regression tests covering toast show/hide geometry in both short and 2-line forms.

## 1.2.0 — 2026-09-12  ·  build `1.2.0+2026-09-12.1`

- **In-app updates**: the app now compares its build stamp against the deployed one and shows a
  “New version is available → Update now” bar; the service worker uses network-first for the app
  document, so a GitHub push reaches your phone on the next launch.
- **Customisation suite** (More → Customise): custom fields, quick-add templates, an automation rule
  engine with regex + dry-run + history back-fill, layout builder (nav slots, 14 KPI cards, dashboard
  sections, hidden modules), format controls, salary-cycle budgeting and a custom theme builder.
- **Developer API** (`window.RF`) and JSON editors in the Dev panel.
- **GitHub Pages deploy + CI**: automatic deployment on push, integrity checks, changelog tooling.

## 1.1.0 — 2026-09-12  ·  build `1.1.0`

- Setup checker (`setup-check.html`), full setup guide (`SETUP.md`), screenshot gallery.
- Drive sync hardening: chunked backup payload, read-back verification, tab self-healing.

## 1.0.0 — 2026-09-12  ·  build `1.0.0`

- First release: dashboard, records, 5-mode analytics, budgets, accounts, categories, bills,
  goals, loans/EMI, reimbursements, reports (CSV/PDF/JSON), 22 themes, PIN lock, Google Sheets sync.
