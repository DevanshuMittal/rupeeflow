# Hosting on GitHub & getting updates on your phone

This is the workflow you asked for: **one push → the app updates on your phone.**
Everything here is free (public repo + GitHub Pages + Actions on the free tier).

> **First, an honest note about who pushes.** I can't log into your GitHub account, so I can't push
> commits for you — no tool I have should ever hold your credentials. What I've done instead is make
> the loop one command on your side, and make the app tell you when a new build is live. If you want a
> change, ask me → I hand you the updated file(s) or a `.patch` → you push (or paste it in the GitHub
> web UI, which works fine from a phone).

---

## Contents

| § | What |
|---|---|
| 1 | Create the repo & enable Pages (5 minutes, one time) |
| 2 | Push your code — web UI (no tools) **or** git CLI |
| 3 | The update loop: you push → phone updates |
| 4 | Verify the update landed (build stamps) |
| 5 | Releasing properly: `bump.js` + `push.sh` + CHANGELOG |
| 6 | Asking me for a change (patch workflow) |
| 7 | How the automation works (Actions + CI) |
| 8 | Editing from your phone (GitHub web / mobile app) |
| 9 | Rollback, previews, custom domain, secrets |
| 10 | Troubleshooting the deploy/update loop |

---

## 1. Create the repo & enable Pages (one time)

1. Go to <https://github.com/new>
   * **Repository name:** `rupeeflow`
   * **Visibility:** **Public** (required for free GitHub Pages on a personal account)
   * Don't add a README/licence — you already have them
   * **Create repository**
2. In the empty repo, go to **Settings → Pages**
   * **Source:** `GitHub Actions` ← *not* “Deploy from a branch”
   * Save. That's it — the included workflow does the rest.
3. Your app will live at **`https://YOUR-USERNAME.github.io/rupeeflow/`**
   (this exact origin is what you register in Google Cloud for Drive sync — see `SETUP.md` §6d)

> **Why Public?** Free Pages on personal accounts serves public repos. Your *financial data* is never in
> the repo — it lives on your phone and in your private Google Sheet. Only the app code is public.
> (Prefer private? Netlify Drag & Drop or Cloudflare Pages both deploy private repos free.)

---

## 2. Push your code

### Path A — the web UI (works from your phone, nothing to install)

1. In your repo: **Add file → Upload files**
2. Drag in these (from the `finance-tracker` folder):
   `index.html`, `sw.js`, `manifest.webmanifest`, `icon-192.png`, `icon-512.png`, `setup-check.html`,
   `README.md`, `SETUP.md`, `CUSTOMIZE.md`, `GITHUB.md`, `CHANGELOG.md`, `LICENSE`
3. For the workflows, use **Add file → Create new file** and type the path
   `.github/workflows/deploy.yml`, then paste the contents of that file. (Browsers can't drag into
   subfolders, so this one file needs creating by hand.) Repeat for `.github/workflows/test.yml`.
4. Also upload the `tests/` and `tools/` folders the same way if you want CI to run the full suite
   — or just copy those two workflow files and skip the folders (the deploy workflow's `validate` step
   needs `tests/ci-check.js`, so include at least that file).
5. **Commit changes** → the Deploy workflow starts immediately (watch it in the **Actions** tab).

### Path B — git CLI (recommended for ongoing work)

```bash
cd finance-tracker
git init -b main                     # already done if I set the repo up for you
git add -A
git commit -m "RupeeFlow 1.2.0"
git remote add origin https://github.com/YOUR-USERNAME/rupeeflow.git
git push -u origin main
```

Then, for every future change, just:

```bash
./tools/push.sh "what changed"       # validates, commits, pushes → auto-deploys
```

First time with a fresh clone? `mkdir -p .git` isn't needed — the folder ships as a repo, so
`git remote add origin …` is the only setup step.

**Auth note:** GitHub no longer accepts passwords over HTTPS. Either
* use a **Personal Access Token** as the password when prompted (GitHub → Settings → Developer settings →
  Personal access tokens → *Fine-grained* → repo access → `Contents: Read and write`), or
* set up SSH: `ssh-keygen -t ed25519`, then add `~/.ssh/id_ed25519.pub` under GitHub → Settings → SSH keys,
  and use `git@github.com:YOUR-USERNAME/rupeeflow.git` as the remote.
  On macOS the keychain stores it after the first push; on Windows use Git Credential Manager.

---

## 3. The update loop

```
  you change a file  ──►  git commit + push  ──►  GitHub Actions
                                                      │
                              ci-check (17 assertions) ├─► deploy to Pages (≈30–60 s)
                                                      │
                    phone opens/refreshes the app  ◄───┘
                                 │
                    "New version available → Update now"
```

**On your phone, an update arrives in one of three ways:**

| How | What happens |
|---|---|
| Just open the app | The service worker fetches `index.html` **network-first**, so a fresh deploy loads on the next launch. Data is untouched. |
| The update bar | The app compares its build stamp with the deployed one (on launch, then every 30 min, and when you return to the app). If they differ you get a bar at the top: **“New version 1.2.1 is available — Update now”**. |
| Manually | **Settings → About → ⬆️ Check for updates** (also in **Customise → 👩‍💻 Dev**). |

**iPhone specifics:** iOS is aggressive about caching standalone PWAs. If the update bar doesn't show up
after a push, fully close the app (swipe it away in the app switcher) and reopen — that forces a reload.
The update button handles the rest.

**Offline and in-flight:** the app keeps working on the old build until the new one is fetched; nothing
breaks if you're on a flight when you push.

---

## 4. Verify the update landed

The running build is printed in **Settings → About** (`RupeeFlow v1.2.0+2026-09-12.1`) and in
**Customise → Dev → Data stats** (`build …`). Compare it with:

* the **Actions** tab (the workflow run for that commit), or
* `CHANGELOG.md` in the repo (each release lists its build stamp), or
* the desktop console: `RF.version`. `RF.checkUpdate()` returns
  `{ current, remote, update }`.

---

## 5. Releasing properly

```bash
node tools/bump.js            # 1.2.0+2026-09-12.1 → …-12.2   (also updates sw.js + CHANGELOG.md)
./tools/push.sh "add split transactions"
```

or in one shot:

```bash
./tools/push.sh --bump minor "custom report builder"
```

`bump.js` keeps three things in sync — `APP_BUILD` in `index.html`, the `BUILD`/cache name in `sw.js`
(which is what makes the browser fetch the new shell), and a new `CHANGELOG.md` entry. **Always bump**:
if the stamp doesn't change, phones will keep showing the old build with no update prompt.

CI enforces this — `tests/ci-check.js` fails the workflow if the two stamps disagree.

---

## 6. Asking me for a change

Tell me what you want. I'll give you one of these:

**A. Updated whole files** (usual case — e.g. a new `index.html`)
1. GitHub → the repo → open `index.html` → **pencil (Edit)** → select all → paste the new content →
   **Commit changes**. Works from the phone. Or with git: overwrite the file locally and
   `./tools/push.sh "…"`.
2. Always bump the build stamp in the same change (`node tools/bump.js`) so your phone sees the update.

**B. A patch file** (`0001-add-split-transactions.patch`) when the change is small
```bash
git apply 0001-add-split-transactions.patch     # applies the change to your files
node tests/ci-check.js                          # sanity check
./tools/push.sh "add split transactions"
```
Or if I hand you a commit file: `git am 0001-*.patch`.

**C. A snippet** you paste into a specific spot — I'll always say the exact file + where.

Every change I ship comes with: a bumped build stamp, a CHANGELOG entry, and `node tests/ci-check.js`
green. Phone-visible behaviour always shows up as the update bar.

---

## 7. How the automation works

**`.github/workflows/deploy.yml`** — on every push to `main` (and on manual *Run workflow*):
1. `validate` job runs `node tests/ci-check.js` (17 assertions: HTML integrity, every `<script>` block
   parses, build stamps in sync, all 16 routes have DOM sections, nav/icon references resolve, safety
   nets present, size sane). **If it fails, nothing deploys** — your phone keeps the last good build.
2. `deploy` job copies the app files into `_site/` and publishes them to Pages. Takes ~30–60 s.

**`.github/workflows/test.yml`** — on pull requests: installs Chromium and runs the full browser suite
(32 app + 55 customisation + 13 setup-checker tests, ≈3 minutes). Free minutes are plenty for a repo
this size; if you ever hit limits, drop this workflow and keep the Node-only check.

**`.nojekyll`** is created during deploy so GitHub doesn't try to run Jekyll over the files.

---

## 8. Editing from your phone

Two useful options when you're away from your laptop:

| Method | Good for |
|---|---|
| **GitHub mobile app / mobile web** → open `index.html` → pencil icon → edit → commit | Quick tweaks (a category name, a colour, a default). The raw app is large on a phone screen but the *find* function works well. |
| **github.dev** — press `.` on the repo page in a desktop browser, or open `https://github.dev/YOUR-USERNAME/rupeeflow` | A full VS Code in the browser, with search & replace and multiple files. Works on tablets nicely. |
| **Codespaces** (free monthly quota) | Real terminal + `node tests/ci-check.js` + `git push` from a tablet. |

Whatever you use, the deploy + update loop is identical.

---

## 9. Rollback, previews, custom domain

**Rollback** — the previous deploy is one revert away:
```bash
git revert HEAD            # creates a commit that undoes the last one
git push
```
Or in the UI: **Commits → the bad commit → Revert**. Your data is never in the repo, so a rollback only
changes the app, never your transactions. After the revert, the phone will offer that build again
(build stamps differ) — tap **Update now**.

**Previews** — GitHub Pages serves one branch. For per-branch previews, either
* push to a branch and temporarily point Pages at it (**Settings → Pages → Branch**), or
* connect the repo to Netlify/Vercel, which build a preview URL per pull request automatically, or
* keep it simple: test locally with `./serve.sh` before pushing (that's what the test suite does).

**Custom domain** — **Settings → Pages → Custom domain** (`fin.you.dev`), add the CNAME record your
registrar tells you to, and tick **Enforce HTTPS**. Then **add that new origin in Google Cloud** too
(`SETUP.md` §6d) or Drive sync will start failing with `origin_mismatch`.

**Secrets** — there are none, deliberately. No API keys, no build secrets, nothing to leak: the app talks
to Google with *your* OAuth Client ID, which is public by design.

---

## 10. Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| Actions tab shows nothing after a push | Pages source isn't set to **GitHub Actions**, or the workflow file isn't at `.github/workflows/deploy.yml` (check for a nested folder) | Settings → Pages → Source: GitHub Actions; re-create the file with the exact path |
| Deploy job fails at “Validate app integrity” | `ci-check.js` found a real problem (it prints the exact assertion) | Read the failing line, fix, push again. Nothing is deployed while it's red — your phone keeps the working version |
| Site 404s at `…/rupeeflow/` | Pages not enabled yet, or the deploy is still running (first time takes ~2 min) | Check the Actions run; confirm Settings → Pages shows the URL |
| Push is rejected (auth) | HTTPS password auth is dead | Use a Personal Access Token or SSH key (§2) |
| Phone keeps showing the old build | Build stamp wasn't bumped so the app thinks it's current | `node tools/bump.js` then push; or **Settings → About → Check for updates**; on iPhone close the app fully and reopen |
| Update bar never appears on iPhone | iOS caching of standalone PWAs | Force-quit the app, reopen, then tap the bar or use the in-app check |
| “Update now” seems to do nothing | No service worker (e.g. you opened it over plain HTTP, not localhost/HTTPS) | Serve from Pages/HTTPS; SW only runs in secure contexts |
| CSS/JS looks unstyled after a deploy | mixed cache from an older build | Pull-to-refresh / hard reload on desktop (`Cmd/Ctrl+Shift+R`) |
| Old caches piling up | normal | The service worker deletes every cache whose name isn't the current build during `activate` |

---

## Appendix — files added for this workflow

```
.github/workflows/deploy.yml   validate → publish to GitHub Pages
.github/workflows/test.yml     full browser suite on pull requests
tools/bump.js                  keeps APP_BUILD + sw.js cache name + CHANGELOG in sync
tools/push.sh                  validate → commit → push (one command releases)
tests/ci-check.js              17-assertion integrity gate (Node only, <2s)
tests/update.js                proves the in-app update flow works
CHANGELOG.md                   release history with build stamps
LICENSE                        MIT — change the copyright line to your name
.gitignore                     node_modules, OS noise
```

Quick reference:

```bash
./serve.sh                                  run locally
node tests/ci-check.js                      integrity gate (CI runs this too)
node tools/bump.js [patch|minor|major|x.y.z] release stamp
./tools/push.sh "what changed"              ship it
```
