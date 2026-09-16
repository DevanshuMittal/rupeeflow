# Changelog

All notable changes to RupeeFlow. The build stamp shown in **Settings → About** matches the entries here,
so you can confirm at a glance which version your phone is running.

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
