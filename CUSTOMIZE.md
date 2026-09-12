# RupeeFlow — Customisation & Developer Guide

RupeeFlow is built to be **un-rigid**. Every list, every layout, every calculation input is yours to
change — and for the parts you'd rather script, there's an automation rule engine and a `window.RF` JS API.

Open **More → Customise** (or press `g` then `o` on a keyboard). Seven tabs live there:

| Tab | What you can change |
|---|---|
| 🎛️ **Layout** | Bottom nav slots, dashboard KPI cards, dashboard section order/visibility, hidden modules |
| 🧩 **Fields** | Your own transaction fields (text / number / date / select) |
| ⚡ **Templates** | One-tap quick-add presets, pinned to the dashboard |
| 🤖 **Rules** | The automation engine: when X → then Y, applied on save and over history |
| 🔢 **Format** | Currency symbol, decimals, negatives, compaction, salary-cycle period |
| 🎨 **Theme** | Build a custom palette (accent/secondary/base hue) on top of the 22 built-ins |
| 👩‍💻 **Dev** | `window.RF` API, settings/data JSON editors, stats, shortcuts, diagnostics |

---

## 1. Custom fields — make the schema yours

**More → Customise → 🧩 Fields → New field**

| Property | Notes |
|---|---|
| Label | Shown on the form, detail view and CSV header (e.g. `Project`) |
| Key | Machine name used in JSON/sheet exports (`project`) — auto-derived from the label |
| Type | `text`, `number`, `date`, or `select` (with your own option list) |
| Applies to | all entries, expenses only, or income only |
| Show in rows | Print the value in list views |

They appear at the bottom of the add-transaction sheet, in the transaction detail sheet, in CSV exports
and inside the JSON backup that syncs to Drive.

**Field recipes for a developer**

| Field | Type | Options | Why |
|---|---|---|---|
| `Project` | select | Day job, Side project, Personal, Family | Split personal vs side-project spend |
| `Payment mode` | select | UPI, Card, Cash, Auto-debit, Netbanking | Track float and card build-up |
| `Client` | select | Acme, Initech, Umbrella | Tag billable freelance costs |
| `Billable` | select | yes, no, partial | Claim back from a client or your employer |
| `Environment` | select | prod, staging, dev | Attribute cloud spend per environment |
| `Split with` | text | — | Note who owes you for dinner |

**Scripting them instead:** `RF.fields.add({ label: 'Client', type: 'select', options: ['Acme','Initech'] })`

---

## 2. Quick-add templates

Templates turn a 6-tap flow into a single tap. They appear **at the top of the add sheet** and on the
**dashboard's Quick actions** grid, and they run through the automation rules like any other entry.

**More → Customise → ⚡ Templates → New template** — label, icon, amount, type, category, account, note.

```
Chai ☕ ₹20      Metro 🚇 ₹45     Lunch 🍱 ₹250
Uber office 🚕 ₹320   Groceries 🛒 ₹1,200
```

**Scripting:** `RF.templates.add({ label:'Coffee', amount: 180, cat:'c_food', acc:'a_upi' })` then
`RF.templates.run(id)` to log one.

---

## 3. Automation rules — the interesting part

A rule is `{ when, then }`. Rules run **on every save** (add and edit), can be **dry-run tested**, and can be
**back-filled over your whole history**.

### The builder
**More → Customise → 🤖 Rules → New rule** gives you dropdowns plus a **🧪 Test on last 30 days** button
that shows exactly which existing entries a rule would match before you enable it.

### The JSON editor
There's a `{ } JSON` button on every rule for full control (complex regexes, `from`/`to` date windows).

```jsonc
{
  "id": "ru_cloud",
  "name": "Cloud & AI tools → work",
  "enabled": true,
  "when": {
    "type": "expense",
    "note": "aws|vercel|openai|anthropic|github|copilot|cloudflare|digitalocean",
    "amountMin": 100
  },
  "then": {
    "cat": "c_cloud",
    "tags": "work, infra",
    "addTags": true,
    "fieldKey": "project",
    "fieldVal": "Day job"
  }
}
```

### `when` (all conditions are AND-ed)
| Key | Type | Meaning |
|---|---|---|
| `type` | `expense` \| `income` \| `transfer` | Entry type |
| `note` | regex string | Case-insensitive match on the note |
| `cat` / `acc` | category / account id | Exact match |
| `amountMin` / `amountMax` | number | Amount window |
| `tagAny` | comma list | True if any of these tags are present |
| `from` / `to` | `YYYY-MM-DD` | Date window |

### `then` (empty keys are ignored)
| Key | Effect |
|---|---|
| `cat`, `acc`, `to` | Set category / account / transfer target |
| `tags` + `addTags` | Replace tags, or append when `addTags: true` |
| `reimb` | Mark expenses as reimbursable |
| `notePrefix` / `noteSuffix` | Prefix or suffix the note (e.g. `Office — `) |
| `fieldKey` + `fieldVal` | Write a value into one of your custom fields |

### Recipes worth stealing
```jsonc
// 1. Anything with "office"/"team" is a reimbursable work expense
{ "when": { "note": "office|team|conference|client dinner", "type": "expense" },
  "then": { "reimb": true, "tags": "work", "addTags": true } }

// 2. Freelance income gets tagged and attributed
{ "when": { "type": "income", "cat": "i_free" },
  "then": { "tags": "side-project", "addTags": true, "fieldKey": "project", "fieldVal": "Side project" } }

// 3. Card spends over ₹5,000 get a review flag
{ "when": { "type": "expense", "acc": "a_card", "amountMin": 5000 },
  "then": { "tags": "review", "addTags": true } }

// 4. Delhi-trip keywords auto-categorise as travel
{ "when": { "note": "indigo|air india|del|blr|train|irctc", "type": "expense" },
  "then": { "cat": "c_travel", "tags": "delhi, trip", "addTags": true } }

// 5. Late-night orders get a "late-night" tag (weekends pattern)
{ "when": { "note": "3\\.am|midnight|post-midnight" },
  "then": { "tags": "late", "addTags": true } }
```

**Back-fill:** `🤖 Rules → ▶ Run on history` re-scans every transaction and reports how many changed,
per rule. Idempotent — running it twice won't pile up duplicates (tags are de-duped by `uniq`).
**Dry run:** `RF.rules.run(true)` returns `{ matches, sample }` without touching anything.

---

## 4. Layout — nav, KPIs, dashboard, modules

### Bottom navigation (3 slots, + More)
Choose from Home, Records, Charts, Budgets, Accounts, Goals, Bills, Categories, Reports, Customise.
Presets: **Classic** (Home · Records · Charts), **Money** (Home · Budgets · Accounts),
**Power** (Records · Charts · Customise). The centre **+** and the final **More** tab are always there, so
you can never lock yourself out.

### Dashboard KPI cards (up to 6)
14 metrics available: income, expenses, saved, month-end estimate, net worth, liquid cash, budget left,
daily average, savings rate, subscriptions & tools burn, reimbursements due, investments, top category,
entry count. **Tap any KPI card on the dashboard** to swap it on the spot.

### Dashboard sections
11 sections (hero, KPIs, accounts, budget health, spend donut, 6-month bars, insights, upcoming bills,
recent transactions, goals, quick actions) — reorder with ↑/↓, toggle with the switch, or
**Reset dashboard**.

### Modules
Hide Loans & EMI, Goals, Reimbursements, Bills, Categories, Reports, Budgets or Themes from the More hub
if you don't use them. Data is never deleted by hiding.

---

## 5. Format & money rules

| Setting | Options |
|---|---|
| Currency symbol | any 1–3 characters (`₹`, `$`, `€`, `S$`) |
| Decimals | 0 (round) or 2 (show paise) |
| Negatives | `-1,200` or accounting `(1,200)` |
| Compaction | Indian (`1.45L`, `2.3Cr`) or Western (`145k`, `2.3M`) |
| **Salary-cycle start day** | 1–28 |

**Salary-cycle budgeting** is the sleeper feature: set the day your salary lands (e.g. `25`) and your whole
app re-bases — dashboards, forecasts, budgets, records, reports and the period label (`25 Aug – 24 Sep`).
Now "this month" means *your* month.

Also here: hide balances (privacy mode), monospace numbers, reduce motion.

---

## 6. Custom themes

**More → Customise → 🎨 Theme**: accent + secondary colour + base hue + name. RupeeFlow derives every
surface, border, shadow and contrast value for light, dark and AMOLED from those three inputs — so a custom
palette looks deliberate in all modes, not just one. Presets included (Dev tools, Terminal, Magenta, Amber,
Slate, Gold), and the Dashboard/Other screens keep working with it everywhere. Remove it any time to fall
back to the 22 built-ins.

---

## 7. Developer panel

**More → Customise → 👩‍💻 Dev**

* **Dev mode** toggle — logs the API availability to the console
* **Settings JSON** — edit and apply theme, prefs, kpis, nav, hidden modules, custom fields, templates and
  rules as one document (invalid JSON is rejected with the parse error, nothing is applied)
* **Data JSON** — read-only snapshot viewer
* **Import JSON** — restore a backup file/paste
* **Run rules now** — same as the back-fill
* **Export backup** — download the JSON
* **Keyboard shortcuts** — the list below
* **Data stats** — counts, storage size, busiest tags, period in use

### Keyboard shortcuts (desktop/tablet)
`n` new expense · `i` new income · `/` search · `t` cycle light/dark/auto · `Esc` close · `?` this list
`g` then `h/r/c/b/a/m/o/g/l` → Home · Records · Charts · Budgets · Accounts · More · **Customise** · Goals · Loans

Shortcuts are ignored while you're typing in a field, and released properly when a sheet closes.

### `window.RF` API

```js
/* --- data --- */
RF.data                        // live state object (S)
RF.add({ type:'expense', amount:120, cat:'c_food', acc:'a_upi', note:'chai' })
                               // → { transaction, rulesApplied: ['Swiggy / Zomato → Food Delivery'] }
RF.addMany([...])              // bulk insert, rules run per entry
RF.update(id, { amount: 150 })
RF.remove(id)
RF.find(t => /aws/i.test(t.note || ''))
RF.totals('2026-04-01', '2026-09-30')      // { inc, exp, net, rate, count }

/* --- automation --- */
RF.rules.list()
RF.rules.add({ name, when, then })
RF.rules.run(true)             // dry run → { matches, sample }
RF.rules.run()                 // back-fill history

/* --- customisation --- */
RF.fields.add({ label:'Client', type:'select', options:['Acme'] })
RF.templates.add({ label:'Coffee', amount:180, cat:'c_food', acc:'a_upi' })
RF.templates.run(id)
RF.prefs()                     // the customisation object
RF.setPref('cycleStart', 25)

/* --- io / control --- */
RF.export()                    // full snapshot (incl. fields, templates, rules, prefs)
RF.import(jsonOrObject)
RF.csv(from, to)               // CSV string with your custom columns
RF.go('records'); RF.screen(); RF.render(); RF.toast('hi')
RF.stats()                     // counts + storage bytes
RF.vars()                      // computed CSS variables of the active theme
RF.on('save' | 'route' | 'change', fn)   // returns an unsubscribe fn
```

### Scripted examples
```js
// Bulk-import a bank export you pasted into the console
const rows = `2026-09-01,120.5,swiggy dinner
2026-09-02,45,metro`;
rows.split('\n').map(l => l.split(',')).forEach(([date, amount, note]) =>
  RF.add({ date, amount: +amount, note, type: 'expense', cat: 'c_food', acc: 'a_upi' }));

// Auto-tag everything from a merchant list
RF.rules.add({ name: 'Grocery merchants', when: { note: 'dmart|more supermarket|kirana' }, then: { cat: 'c_groc', tags: 'grocery', addTags: true } });

// Nightly audit: how much went to side-project costs?
const sp = RF.find(t => (t.fields || {}).project === 'Side project');
console.log(sp.length, 'entries,', RF.totals('0000-01-01','9999-12-31').exp);
```

---

## 8. What syncs and what stays local

| Thing | Synced to Drive? | Why |
|---|---|---|
| Transactions (with custom field values) | ✅ | Data |
| Accounts, categories, budgets, bills, goals, loans, tags | ✅ | Data |
| Custom fields, templates, rules | ✅ | Shared definitions |
| Money prefs (symbol, decimals, cycle start, negatives, compaction) | ✅ | They change meaning of the data |
| Nav slots, KPI picks, widget order, hidden modules, custom theme, PIN | ❌ device-local | Phone-specific comfort settings |

So your second phone gets your **rules, fields and templates** automatically, but keeps its own layout.

---

## 9. Guardrails (why this stays safe to tinker with)

* Invalid JSON is rejected with a visible parse error — nothing is applied.
* Rules are additive and idempotent; back-fill reports exactly what changed.
* Hidden ≠ deleted; templates and fields never touch existing transactions.
* **Settings → Erase everything** and **Drive Sync → Create fresh sheet** are always one tap away.
* `RF.export()` before any experiment gives you a complete, restorable snapshot — and
  **Reports → Restore JSON** puts it back.

---

## 10. Roadmap (not built yet — say the word)

| Idea | Value | Effort |
|---|---|---|
| **CSV import with column mapping** | Paste a bank/HDFC statement, map columns visually, preview, import | M |
| **Split transactions** (one expense across categories) | Accurate mixed baskets (groceries + household) | M |
| **Plugin hooks** (drop a `.js` file next to `index.html`) | Custom widgets/metrics without forking | M |
| **Custom report builder** | Choose sections, date ranges, group-by; save report presets | M |
| **Multi-currency + live rates** | Travel spend in USD/EUR with INR conversion | S–M |
| **Recurring rule for budgets** | "Every month from my rent bill, set this envelope" | S |
| **Natural-language quick add** ("chai 20 cash") | Parse free text into a transaction | M |
| **Shared sheet / 2-account mode** | Household budgets with per-person attribution | L |
| **Receipt attachments** | Photos stored in a Drive folder, linked to entries | M |
| **Rule simulator UI** | Visual what-if preview across the whole dataset | M |

Tell me which ones you want and I'll build them next.
