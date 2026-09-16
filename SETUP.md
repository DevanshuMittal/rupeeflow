# RupeeFlow — Complete Setup Guide

Everything needed to go from "files on disk" to "app on my phone, syncing to my own Google Sheet".
Work through it top to bottom the first time; after that you only ever need §9 (routine upkeep).

**Time:** ~5 minutes to use the app, ~10 minutes to get Drive sync + phone install working.
**Cost:** ₹0. Nothing here requires a paid plan, a server, or a subscription.

---

## Contents

| § | Section | Who needs it |
|---|---|---|
| 1 | What you need before you start | Everyone |
| 2 | Choose your path (decision table) | Everyone |
| 3 | Open the app on your computer | Everyone |
| 4 | Host it free so your phone can reach it | Everyone with a phone |
| 5 | Install it on your phone (Android / iPhone) | Everyone with a phone |
| 6 | Google Cloud project + OAuth Client ID | Anyone wanting Drive sync |
| 7 | Connect Drive inside the app | Same |
| 8 | Verify everything works (checklist) | Same |
| 9 | Routine upkeep & backups | Everyone |
| 10 | Moving to a new phone / second phone | Optional |
| 11 | Troubleshooting (exact error messages) | When stuck |
| 12 | Security, privacy and limits | Worth reading once |
| 13 | Uninstall / start over / revoke access | Optional |
| 14 | Interactive setup checker | When stuck |

---

## 1. What you need before you start

| Item | Notes |
|---|---|
| A computer (Windows / Mac / Linux) | Only for the one-time setup. Daily use is phone-only. |
| A smartphone | Android 8+ (Chrome) or iPhone iOS 15+ (Safari) |
| A Google account | Any free Gmail account. This is where your spreadsheet lives. |
| Internet | Needed for setup, hosting and sync. The app itself works offline afterwards. |
| The `finance-tracker` folder | `index.html`, `manifest.webmanifest`, `sw.js`, `icon-192.png`, `icon-512.png` |

**Files that matter**

```
finance-tracker/
├─ index.html              ← the entire app (must be uploaded)
├─ manifest.webmanifest    ← makes it installable to the home screen
├─ sw.js                   ← offline cache
├─ icon-192.png            ← home-screen icon
├─ icon-512.png            ← home-screen icon (large)
├─ setup-check.html        ← optional diagnostics page (safe to upload too)
├─ README.md · SETUP.md · CUSTOMIZE.md   ← documentation (optional to upload)
├─ serve.sh / serve.bat    ← local server helpers
└─ screenshots/  tests/    ← optional; do not need to be uploaded
```

---

## 2. Choose your path

| You want… | Do this | Time |
|---|---|---|
| Just to try it on a computer | §3 only (double-click `index.html`) | 1 min |
| To use it daily on your phone | §3 → §4 → §5 | 10 min |
| Two phones kept in sync, or a safe backup | §3 → §4 → §5 → §6 → §7 → §8 | 20 min |

> Drive sync is optional. Without it the app is still completely functional — your data just lives only
> on that one device (and is still exportable as CSV / JSON backup at any time).

---

## 3. Open the app on your computer

### 3a. Simplest — just open the file
1. Open the `finance-tracker` folder.
2. **Double-click `index.html`.**
3. The app opens in your browser. Pick a theme, tap the **+** button, log a test expense.

*Expected result:* the dashboard appears with the starter kit loaded (net worth ≈ ₹4.84 L). The app is
fully usable. Google sign-in will **not** work from a `file://` page — that's normal, see §4.

### 3b. Local server (recommended — enables Drive sync testing)
**Mac / Linux**
```bash
cd finance-tracker
chmod +x serve.sh
./serve.sh
```
**Windows** — double-click `serve.bat`, or in Command Prompt:
```bat
cd finance-tracker
python -m http.server 8080
```
Then open **http://localhost:8080**

*Expected result:* the same app, but now at a real `http://localhost` origin. Google accepts
`localhost` for OAuth, so this is the only non-HTTPS address that can sync.

> Keep this terminal window open while you use the app locally. Press `Ctrl+C` to stop.

---

## 4. Host it free so your phone can reach it

Your phone needs a **web address**. All three options below are free and identical for our purposes —
pick whichever you find least frightening.

### Option A — GitHub Pages (most transparent, recommended)
> Want the push-to-update loop (auto-deploy + in-app “Update now” on your phone)?
> Follow **[`GITHUB.md`](GITHUB.md)** instead — it's the same hosting with the automation wired in.

1. Create a free account at <https://github.com> if you don't have one.
2. Click **+ → New repository**.
   * Repository name: `rupeeflow` (or anything)
   * Visibility: **Public** ¹
   * Tick **Add a README file** → **Create repository**
3. In the new repo: **Add file → Upload files**. Drag in:
   `index.html`, `manifest.webmanifest`, `sw.js`, `icon-192.png`, `icon-512.png`
   *(optionally `setup-check.html`, `README.md`, `SETUP.md`)* → **Commit changes**.
4. Go to **Settings → Pages** (left sidebar).
   * **Source:** Deploy from a branch
   * **Branch:** `main` · folder `/ (root)` → **Save**
5. Wait 1–2 minutes, then reload that page. Your address appears at the top:
   **`https://YOUR-USERNAME.github.io/rupeeflow/`**

*Expected result:* opening that URL on any device shows RupeeFlow.

> ¹ Keep the repo public for the free Pages plan; your financial data is **not** in the repo — only the
> app code. Data lives on your phone and in your private Google Sheet. (Prefer private? Use Netlify
> with a password, or GitHub Pro.)

### Option B — Netlify Drop (fastest, no account needed to test)

1. Go to <https://app.netlify.com/drop>
2. Drag the **whole `finance-tracker` folder** onto the page.
3. You get a URL like `https://sparkly-panda-123456.netlify.app` within seconds.
4. Create a free account when prompted to **keep** the site permanently (otherwise it expires).
   Site settings → *Change site name* → `rupeeflow-yourname`.

### Option C — Cloudflare Pages

1. <https://dash.cloudflare.com> → **Workers & Pages → Create → Pages → Upload assets**
2. Name the project `rupeeflow`, upload the folder, **Deploy**.
3. URL: `https://rupeeflow.pages.dev`

### Write down your origin
Whatever you chose, note the **origin** — scheme + host only, **no path, no trailing slash**:

| Your URL | Origin to register in Google |
|---|---|
| `https://aditya.github.io/rupeeflow/` | `https://aditya.github.io` |
| `https://sparkly-panda.netlify.app` | `https://sparkly-panda.netlify.app` |
| `https://rupeeflow.pages.dev` | `https://rupeeflow.pages.dev` |
| `http://localhost:8080/index.html` | `http://localhost:8080` |

---

## 5. Install it on your phone

Open your hosted URL **in the phone's real browser** — Chrome on Android, Safari on iPhone. Do **not**
use an in-app browser (Instagram / LinkedIn / Gmail viewers block Google sign-in).

### Android — Chrome
1. Open the URL.
2. Tap the **⋮** menu → **Add to Home screen** (may read *Install app*).
3. Confirm. RupeeFlow now has its own icon and opens full-screen with no browser bars.

### iPhone — Safari
1. Open the URL in **Safari** (iOS requires Safari for this).
2. Tap the **Share** icon → **Add to Home Screen** → **Add**.

*Expected result:* the icon appears on your home screen. Tap it — the app opens standalone.

> **Why installing matters on iPhone:** Safari clears website storage after ~7 days of inactivity, but
> an app **added to the home screen is exempt**. Installing also removes the URL bar, so it feels native.
> Either way, your Drive sheet is the permanent copy.

### Optional — desktop shortcut
Chrome on a computer: open the URL → **⋮ → Cast, save and share → Install page as app**.

---

## 6. Google Cloud project + OAuth Client ID

This is the only genuinely fiddly part. Do it once; it takes ~6 minutes. You are creating a *public
identifier* for the app in **your own** Google account — no billing, no credit card, no verification.

### 6a. Create the project
1. Go to <https://console.cloud.google.com/>
2. Top bar → project selector → **New project**.
3. Name: `rupeeflow` · Location: *No organisation* → **Create**.
4. Make sure the project selector now shows **rupeeflow** before continuing.

### 6b. Enable the two APIs
5. Left menu → **APIs & Services → Library**.
6. Search **Google Sheets API** → open it → **Enable**.
7. Back to Library, search **Google Drive API** → open it → **Enable**.

*Expected result:* both show "API enabled" / a **Manage** button.

### 6c. Configure the consent screen (Google Auth Platform)
8. Left menu → **APIs & Services → OAuth consent screen** (may redirect to *Google Auth Platform*).
9. **Get started** / **Branding**:
   * App name: `RupeeFlow`
   * User support email: your Gmail
   * Developer contact email: your Gmail
   * Logo and links: leave blank → **Save and continue**
10. **Audience**:
    * User type: **External**
    * **Add users → Test users → + Add users** → add **your own Gmail address** → Save
    *(Without this, sign-in fails with "Access blocked: RupeeFlow has not completed the Google
    verification process".)*
11. **Data Access → Add or remove scopes** → add these two, exactly:
    * `https://www.googleapis.com/auth/drive.file`
    * `https://www.googleapis.com/auth/userinfo.email`
    → **Update → Save**
12. Leave **Publishing status: Testing**. That is fine forever for personal use.

### 6d. Create the Client ID
13. Left menu → **Clients** (or *Credentials*) → **Create client** / **+ Create credentials → OAuth client ID**.
14. Application type: **Web application**.
15. Name: `RupeeFlow Web`.
16. **Authorised JavaScript origins → + Add URI** — add every origin you will use, one per line:
    ```
    https://YOUR-USERNAME.github.io          ← your §4 address, host only
    http://localhost:8080                    ← for testing on your computer
    ```
    Rules that people trip over:
    * no trailing slash
    * no path (`/rupeeflow` must **not** be included)
    * scheme must match (`https`, or `http` for localhost only)
    * if you use a custom port, include it
17. **Authorised redirect URIs:** leave empty (RupeeFlow uses Google's token client, not redirects).
17b. **Let your account sign in.** OAuth consent screen → **Audience**:
    * **Either** add every Google account you'll sign in with under **Test users** *(Testing mode only allows
      accounts on this list — skipping it is the cause of `Error 403: access_denied`)*,
    * **or** press **Publish app** so any account can sign in. You do **not** need Google verification for
      `drive.file` + `userinfo.email`; you'll see an “unverified app” warning once — choose
      **Advanced → Go to RupeeFlow (unsafe)**.
    * Testing-mode grants expire after **7 days** (you'd reconnect weekly) — publishing avoids that.
18. **Create** → copy the **Client ID**: it looks like
    `123456789012-abcdefghijklmnop.apps.googleusercontent.com`

*Expected result:* a Client ID in your clipboard. Copy it into a note — you'll paste the **same Client ID**
into every device you use.

> **Phone + laptop together:** the Client ID is per *app*, not per device, so the same one configures all of
> them. When both devices connect with the **same Google account**, they share one spreadsheet and stay in
> step automatically — see §7b.

> **Optional:** if you want the consent screen to stop saying "unverified app" every 7 days, click
> **Publish app** in the Audience tab. You do not need Google verification — with `drive.file` +
> `userinfo.email` there is nothing sensitive to review.

---

## 7. Connect Drive inside the app

Do this **on the origin you registered in step 6d** (the hosted URL, or localhost).

1. Open RupeeFlow.
2. Go to **More → Drive Sync**.
3. Paste your Client ID into **Google OAuth Client ID** → **Save ID**.
4. Tap **Connect Google account** → choose your Google account.
5. Consent screen: *"Google hasn't verified this app"* → **Advanced → Go to RupeeFlow (unsafe)** → **Continue / Allow**.
6. The app creates a spreadsheet named
   **`RupeeFlow — Personal Finance (do not rename tabs)`** in your Drive and pushes everything.

*Expected result:* the status pill turns green — **✅ Synced just now** — and a link
**"Open in Drive ↗"** appears. Click it: you should see 8 tabs —
`Backup · Transactions · Accounts · Categories · Budgets · Recurring · Goals · Summary`.

> If your data is > 1 MB the first push takes a few seconds. Auto-sync is **on** by default: every edit
> pushes again ~4 seconds later.

### Copying an existing setup to a second phone
1. Install RupeeFlow there (§5) using the **same hosted URL**.
2. **More → Drive Sync** → paste the **same Client ID** → **Connect** with the **same Google account**.
3. Tap **⬇ Load Drive → phone**.

---

## 7b. Using the same data on phone and laptop

RupeeFlow keeps the data in **your Google Sheet**, so any device signed into the same Google account reads
the same numbers. Two things have to line up:

| | Phone | Laptop |
|---|---|---|
| Opens the app at | your Pages URL | the **same** URL (`http://localhost:8080` also works for local testing, but then it is a third sheet unless you connect the same account) |
| OAuth Client ID | the same ID | the same ID |
| Google account | your account | your account |

**Steps**

1. Set up Drive sync on the first device (below) — it creates
   `RupeeFlow — Personal Finance (do not rename tabs)` in your Drive.
2. On the second device, open the same URL, paste the **same Client ID**, tap **Connect**, choose the
   **same Google account**.
3. Done. The second device notices the existing sheet and **merges** into it — it never overwrites it.

**What happens on every launch**

The app signs in silently with the remembered account and reconciles: it reads the sheet, merges it with
whatever is on the device (newest edit wins per entry), and publishes the result. So:

* add an expense on the phone → open the laptop → it's there (usually within a few seconds)
* edits to the same entry → the newer edit wins, with the device you're holding breaking exact ties
* deletions sync too — a deleted entry doesn't come back on the next merge
* a **brand-new device** (or one still showing starter data) can never wipe the sheet; it adopts the
  sheet's copy first. Until that first merge the app shows *“Drive copy locked until first merge”*.

**If something looks off**

| Symptom | Fix |
|---|---|
| Laptop shows old numbers | Tap **Settings → Drive sync → 🔄 Sync now (merge)**. Auto-sync only pushes; the merge is what pulls. |
| Two devices fought over the data | They can't now, but **↩︎ Undo last sync** on the sync screen restores that device's pre-merge copy. |
| You want one device to win outright | **⬆ Force this device → Drive** (it asks for confirmation, because it replaces the sheet). |
| Signed out after a while | Google tokens last ~1 hour; the app refreshes silently. If a browser blocks the refresh, tap **Reconnect Google account** once. |

> **Note:** RupeeFlow merges *entries*, not field-by-field within an entry. If you edit the same
> transaction on both devices at the same moment, the more recent save wins whole.

---

## 7c. Login, logout and decoy profiles (hiding your real data)

RupeeFlow has no server account — so "login" means **switching local profiles**.
Each profile is a completely separate dataset in the same browser: your real books, and any number of
decoy ones you can show someone else.

**Two ways to use it**

| You want | Do this |
|---|---|
| Hand your phone to a friend/cabbie and show *something* | Tap the **avatar** (top-right) → **Sign out to Demo** |
| Come back to your real data | Tap the avatar → **Switch to Personal** → enter your PIN |

**Setting it up (once, 2 minutes)**

1. Tap the **avatar** → **Profiles & privacy**.
2. **＋ New profile** → name it (e.g. *Demo*), leave **Decoy profile** on, give it a **4-digit PIN** → Create.
   *A decoy is created with its own realistic sample data, so it looks inhabited rather than empty.*
3. You'll be asked for that PIN and signed straight into it. Tap the avatar → **Switch to Personal** to return.

**What makes a decoy safe**

| Guarantee | How |
|---|---|
| Your real entries are never in it | Separate storage keys per profile; entries are not copied across |
| It can never reach your Google Sheet | A decoy carries no Client ID, no account and no sheet id, and sync is disabled |
| Your PIN can't unlock it by accident | Each profile has its own PIN (or none) |
| Launching the app can't expose you | **Open on a decoy at launch** (Settings → Security, or avatar menu) makes the app start in the decoy |
| Nothing is lost | Switching saves the outgoing profile first; switch back any time with its PIN |

**If you forget a profile's PIN** there is no recovery — the data is local to that browser (that's the
point of it). Sign into the other profile, or use **More → Customise → Dev → Profiles** to manage them
from the developer API: `RF.profiles.list()`, `RF.profiles.switch(id, pin)`, `RF.profiles.boot(id)`,
`RF.profiles.remove(id)`.

> **What a decoy does *not* do:** it isn't encryption. Someone technical with full access to the browser's
> storage could still find the real dataset. For real protection, keep **PIN at launch** on, and remember
> your data is safe in Google Drive anyway — erasing the app never erases your sheet.

---

## 8. Verify everything works

Run this checklist once, in order. Each step is a real end-to-end test, not a cosmetic check.

| # | Action | Expected result |
|---|---|---|
| 1 | Tap **+**, enter `125`, pick *Food Delivery*, note "setup test", **Add expense** | Toast shows `−₹125 · setup test`; the entry appears on Home |
| 2 | Wait ~5 s | Sync pill goes **🔄 Syncing…** then **✅ Synced** |
| 3 | Open the sheet from **Drive Sync → Open in Drive ↗** | A new row with today's date, `expense`, `Food Delivery`, `125`, `setup test` |
| 4 | On the phone, **Records → tap the row → Edit** → change 125 to 150 → **Save changes** | Row updates; sheet updates within ~5 s |
| 5 | Turn on **Airplane mode**, add another expense | App works normally; pill shows **⚠️ Offline — changes stored locally** |
| 6 | Turn airplane mode off | Within a few seconds the pill returns to **✅ Synced**, and the sheet catches up |
| 7 | Second device (or open the URL in another browser), connect, **⬇ Load Drive → phone** | Both entries appear with full history |
| 8 | **More → Reports → Print/PDF report** | A clean statement opens with your real numbers |
| 9 | Close the app completely, reopen from the home-screen icon | Data still there; PIN asked if you set one |
| 10 | (Optional) **More → Appearance** → pick a theme, reload | Theme persists |
| 11 | (Optional) **More → Customise → 🤖 Rules** → New rule → 🧪 Test on last 30 days | Shows how many entries would match |
| 12 | (Optional) **More → Customise → 🎛️ Layout** → change a nav slot | Bottom bar updates instantly |

If steps 1–2 work but 3 fails, the problem is API/permission — go to §11 and match your error text.
Still stuck? Open **`setup-check.html`** on the same device (§14) — it pinpoints the failing layer.

---

## 9. Routine upkeep & backups

RupeeFlow needs almost no maintenance, but three habits keep you safe:

| Frequency | Action | Where |
|---|---|---|
| Monthly | Skim the sheet — it is your statement | Drive → the RupeeFlow sheet |
| Monthly | Log reimbursements, clear credit-card bills | **More → Reimbursements**, **Accounts** |
| Quarterly | **Reports → Backup JSON** (download to Drive/email) | **More → Reports** |
| Quarterly | Check **More → Reports → CSV · all data** opens in Excel/Sheets | — |
| After any big change | Add a few transactions, verify the sync pill goes green | Home |

**Customising:** the app is designed to be re-shaped without touching code — fields, rules, templates,
layout, KPIs, theme and money formats all live in **More → Customise** (full guide: `CUSTOMIZE.md`).
For scripting, `window.RF` is exposed in Dev mode.

**Updating the app:** replace `index.html` (and friends) at your host — e.g. GitHub → upload the new
file → Commit. Your data is untouched because it lives in the browser + your sheet, never in the file.
Nothing is lost if you forget to update; the old version keeps working.

**Changing phones?** §10. **Erasing everything?** §13.

---

## 10. Moving to a new phone

### With Drive sync (recommended)
1. Install RupeeFlow on the new phone from the same URL (§5).
2. **More → Drive Sync** → paste the same Client ID → **Connect** with the same Google account.
3. Tap **⬇ Load Drive → phone**. Accounts, budgets, bills, goals, loans and full history return.
4. Only once the new phone has everything: use the **old** phone one last time if you want, or just
   stop using it. (Do your editing on one phone at a time — see §12.)

### Without Drive sync
1. On the old phone: **More → Backup** (JSON) and **Reports → CSV · all data** → save both somewhere
   (email them to yourself, or save to Drive).
2. On the new phone: install the app → **More → Reports → Restore JSON** → paste the JSON (or pick the
   file) → **Restore**.

### Resetting a forgotten PIN
You cannot recover a PIN (it is stored hashed). Options, best first:
1. If Drive sync is configured: on the lock screen tap **"Forgot PIN? Unlock with Google Drive"** →
   sign in with your Google account → the PIN is removed.
2. Otherwise: clear the app's browser data (Chrome → site settings → Clear & reset, or delete the
   home-screen app and its storage) and then **⬇ Load Drive → phone** to restore your money data.
   *Your spreadsheet is never affected by this.*

---

## 11. Troubleshooting

Match the **exact text** you see. All of these are Google-side or browser-side, never data loss.

| What you see | Cause | Fix |
|---|---|---|
| `INVALID PROPERTIES: UNSUPPORTED LOCALE: EN_IN` | Older RupeeFlow builds asked Google for an `en_IN` spreadsheet locale; the Sheets API only supports a short list (`en`, `en_US`, …) and rejects the *whole create*, so the sheet was never made | Update the app, then tap **Sync now (merge)** — it no longer sends a locale. Nothing is lost; local data is untouched. |
| "Needs attention" badge on Drive sync | Any Sheets/Drive API refusal; the card beneath explains it in plain English | Read the card (the raw Google message is under **What does this mean?**), fix, then **Sync now (merge)** |
| `Error 403: access_denied` when connecting | The OAuth app is still in **Testing** and your Google account isn't a test user | OAuth consent screen → **Audience** → add the exact account under **Test users** (or **Publish app**). RupeeFlow now detects this and shows the steps in-app. |
| Sign-in works on the laptop but not the phone | Different Google account signed in, or that account isn't a test user | Add that account under **Test users**, or publish the app so any account works |
| Asked to reconnect roughly every week | Testing-mode grants expire after 7 days | **Publish app** (Audience tab) |
| `Error 400: origin_mismatch` | The page's origin isn't registered on the OAuth client | Add the **exact origin** (no path, no trailing slash) in Google Cloud → Clients → your client → Authorised JavaScript origins. Changes can take ~5 minutes to propagate. |
| `idpiframe_initialization_failed` | Third-party cookies/storage blocked, or origin mismatch | Allow third-party cookies for `accounts.google.com`, and confirm the origin. Try a normal (non-incognito) window. |
| "Google sign-in script could not load" | Offline, or the page is in an in-app/sandboxed browser | Open the URL directly in Chrome or Safari (not inside Instagram/LinkedIn/Gmail). |
| "Access blocked: RupeeFlow has not completed the Google verification process" | Your account isn't a Test user | Google Cloud → OAuth consent screen → **Audience → Test users → add your Gmail**. |
| "Google hasn't verified this app" warning | Normal for personal apps | **Advanced → Go to RupeeFlow (unsafe) → Continue**. |
| `API has not been used in project … or it is disabled` | Sheets/Drive API not enabled | Enable **Google Sheets API** and **Google Drive API** (§6b). |
| `403 PERMISSION_DENIED` / "The caller does not have permission" | Same as above, or a stale token | Enable the APIs, then **Disconnect → Connect** again. |
| `Session expired — reconnect` | Access tokens last ~1 hour | Tap **Reconnect** (or **Sync now**). The app refreshes silently every 45 min when it can. |
| `Sync failed: Verification failed — the sheet did not read back correctly` | Rare race on very large data, or a broken tab | Tap **Sync now** twice. If it persists: **Drive Sync → Create fresh sheet** (old sheet is left untouched). |
| "Timed out loading Google sign-in" | Slow network / blocked googleapis | Retry; else use **Drive Sync → Advanced → paste an access token** (see §12). |
| Sync works but I can't find the sheet | It's in the Drive of the account you connected | Search Drive for `RupeeFlow`. Bookmark the **Open in Drive ↗** link. |
| Two RupeeFlow sheets appeared | One was created per device/account | Keep the one with your data, delete the other; the app reuses the first match by name. |
| Sheet tabs renamed/deleted by hand | RupeeFlow owns the structure | **Create fresh sheet** and re-push; don't rename tabs. |
| "running in memory-only mode" in the console | Page inside a sandboxed iframe (preview pane) | Open the real URL in a browser tab. |
| Nothing appears — blank page | A preview host blocked JavaScript | Open the file directly or from your hosted URL; a fallback card is shown in that case. |
| iPhone: "Add to Home Screen" missing | Wrong browser | Use **Safari** (iOS only allows Safari for home-screen installs). |
| Data vanished after ~a week on iPhone | Site storage eviction | Install to the home screen (§5); restore from Drive. |
| Sliders/insights show ₹0 | Demo data was wiped | **Settings → Load starter kit** to restore the sample, or just add entries. |
| App feels slow with thousands of entries | Very large local dataset | It's still fine up to ~20 k transactions; export a CSV and archive old years in the sheet. |

**The universal fallback:** RupeeFlow can also work with a **hand-pasted access token** —
**Drive Sync → Advanced → paste token → Use token**.
Get a token at <https://developers.google.com/oauthplayground>:
gear icon → *Use your own OAuth credentials* → paste Client ID + secret → Step 1: select
`https://www.googleapis.com/auth/drive.file` → *Authorise APIs* → Step 3 → *Exchange authorization
code for tokens* → copy `access_token`. Tokens last ~1 hour and are only for that session.

---

## 12. Security, privacy and limits

**Privacy**
* No server of ours exists. The app is a static file; the browser talks straight to `googleapis.com`.
* Scope `drive.file` means RupeeFlow can only see the spreadsheet **it created** — never the rest of
  your Drive, Gmail, Photos or contacts.
* Nothing is sent anywhere for analytics, ads or telemetry. No account on our side, ever.
* Your Client ID is a public identifier, not a secret. You may safely keep it in a note.

**On-device protection**
* Data sits in the browser's `localStorage` under the key `rupeeflow.v1`. It is **not encrypted** —
  the PIN is a convenience lock, not cryptography. Rely on your phone's own lock/biometrics, and use
  **Settings → Hide balances** in public.
* Anyone who unlocks your phone and opens the app can see the data; anyone with your Google password
  can see the sheet. Google's own 2-step verification is your real protection.

**Two devices**
* Sync is *last-write-wins per push*: whichever phone syncs last overwrites the sheet. Edit on one
  device at a time (the app pushes ~4 s after a change). This is intentional simplicity, not a merge
  engine.
* Both phones keep working offline; nothing is lost locally.

**Quotas & capacity**

| Limit | Value | Is it a problem? |
|---|---|---|
| Google Drive storage | 15 GB free | No — a text-only sheet is a few hundred KB |
| Sheets cells per file | 10,000,000 | No — ~10 years of data |
| Sheets API reads/writes | 300/min per project, 60/min per user | No — a sync is ~4 calls, debounced 4 s |
| One cell of text | 50,000 characters | Handled — the restore payload is chunked across rows |
| Local browser storage | ~5–10 MB typical | No — ~20 k transactions ≈ 2 MB |

---

## 13. Uninstall, reset and revoke

| Goal | Steps |
|---|---|
| Stop syncing | **Drive Sync → Disconnect**. Local data stays. |
| Delete everything local | **Settings → Erase everything**. Your sheet is untouched. |
| Reset to a fresh start (keep categories) | **Settings → Start blank**. |
| Remove the sheet | Delete it in Drive manually. The app recreates a new one on the next sync. |
| Revoke Google access | <https://myaccount.google.com/permissions> → RupeeFlow → **Delete access**. |
| Remove the phone app | Long-press icon → Uninstall / Remove from Home Screen. Clear site data to delete local copies. |
| Take your data elsewhere | **Reports → CSV · all data** (opens in Excel/Sheets) and **More → Backup** (JSON). |

---

## 14. Interactive setup checker

Open **`setup-check.html`** from the same folder/URL as the app — for a fully clean run use the hosted
URL or `http://localhost:8080` (some checks legitimately fail under `file://`, which is itself useful
information). It runs seven live checks and tells you
which layer is broken:

1. **Files** — are `index.html`, the manifest, the service worker and icons reachable?
2. **Origin** — is the page on HTTPS or localhost (required for Google + PWA)? Shows the exact origin
   string you must paste into Google Cloud.
3. **Storage** — does `localStorage` work (i.e. are you inside a sandboxed frame?).
4. **Offline/PWA** — service worker support and whether the app can be installed.
5. **Google script** — can the browser reach `accounts.google.com`?
6. **Client ID** — format validation + a real sign-in test, reporting the account it connects as.
7. **Drive + Sheets API** — creates (or finds) the RupeeFlow spreadsheet, writes a test row, reads it
   back, and prints the sheet URL.

It also has a **Copy diagnostic report** button — paste that report anywhere when asking for help.

---

## Appendix A — Cheat sheet

```
Local run            cd finance-tracker && ./serve.sh          →  http://localhost:8080
App structure        8 sheet tabs: Backup, Transactions, Accounts, Categories,
                     Budgets, Recurring, Goals, Summary
OAuth scopes         drive.file  ·  userinfo.email
Origins to register  host only, no path, no trailing slash
Add to home screen   Android: Chrome ⋮ → Add to Home screen
                     iPhone:  Safari Share → Add to Home Screen
Sync                 More → Drive Sync → Connect   (auto-sync on)
Restore on new phone More → Drive Sync → ⬇ Load Drive → phone
Backups              More → Reports → CSV / Print-PDF   ·   More → Backup (JSON)
Customise            More → 🎛️ Customise   (fields · templates · rules · layout · format · theme · dev)
  nav shortcut       g then o          (console: window.RF — see CUSTOMIZE.md)
Reset                Settings → Start blank / Erase everything
Revoke access        myaccount.google.com/permissions
Diagnostics          setup-check.html
```

## Appendix B — Keyboard & gesture map (desktop / tablet)

| Action | Shortcut |
|---|---|
| Add expense | Tap the **+** in the bottom bar (or `More → Add expense`) |
| Search all history | The 🔍 icon in the top bar |
| Cycle light/dark/auto | The 🌗 icon in the top bar |
| Change month | ‹ › beside the month name; tap the month name to jump |
| Edit a transaction | Tap any row → **Edit** / **Duplicate** / 🗑 |
| Drill into a category | **Charts → Categories → tap a bar** |
| Hide balances quickly | Settings → Hide balances (survives reload until toggled back) |
