# Changelog

All notable changes to RupeeFlow. The build stamp shown in **Settings → About** matches the entries here,
so you can confirm at a glance which version your phone is running.

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
