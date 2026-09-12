# Changelog

All notable changes to RupeeFlow. The build stamp shown in **Settings → About** matches the entries here,
so you can confirm at a glance which version your phone is running.

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
