#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# RupeeFlow — one-command release.
#
#   ./tools/push.sh                          commit pending changes and push
#   ./tools/push.sh "add split transactions" commit with that message and push
#   ./tools/push.sh --bump minor "new rules" bump the build, commit, push
#   ./tools/push.sh owner/repo               first run: also set up the GitHub remote
#
# After it finishes, GitHub Actions validates + deploys, and your phone offers
# the update on its next launch (Settings → About → “Check for updates”).
# ---------------------------------------------------------------------------
set -euo pipefail
cd "$(dirname "$0")/.."
cd "$(python3 -c "import os;print(os.path.dirname(os.path.dirname(os.path.abspath('$0'))))" 2>/dev/null || echo .)"

BUMP=""
if [ "${1:-}" = "--bump" ]; then
  BUMP="${2:-patch}"
  if [ $# -ge 2 ]; then shift 2; else shift 1; fi
fi
MSG="${1:-}"
if [ $# -gt 0 ]; then shift; fi

# optional remote setup: ./tools/push.sh owner/repo
if [ -n "${MSG:-}" ] && [[ "$MSG" == */* ]] && ! git remote get-url origin >/dev/null 2>&1; then
  REPO="$MSG"
  git remote add origin "https://github.com/${REPO}.git"
  echo "→ remote origin set to https://github.com/${REPO}.git"
  MSG=""
fi

if ! git rev-parse --git-dir >/dev/null 2>&1; then
  echo "→ initialising git repository"; git init -b main >/dev/null
fi

if [ -n "$BUMP" ]; then node tests/ci-check.js >/dev/null; node tools/bump.js "$BUMP"; fi

if [ -z "$(git status --porcelain)" ]; then
  echo "→ nothing to commit"
else
  node tests/ci-check.js
  git add -A
  git commit -q -m "${MSG:-update $(date -u +%Y-%m-%dT%H:%MZ)}"
  echo "→ committed: ${MSG:-auto}"
fi

BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo main)"
if git remote get-url origin >/dev/null 2>&1; then
  git push -u origin "$BRANCH"
  echo
  echo "✓ pushed to $BRANCH"
  ORIGIN="$(git remote get-url origin)"
  case "$ORIGIN" in
    *github.com*) SLUG="${ORIGIN%.git}"; SLUG="${SLUG##*github.com/}"; SLUG="${SLUG##*github.com:}"; echo "  Actions:  https://github.com/$SLUG/actions" ;;
    *)            echo "  Remote:   $ORIGIN  (not a GitHub remote — CI/deploy will not run here)" ;;
  esac
  echo "  On your phone: open RupeeFlow → Settings → About → 'Check for updates'"
else
  echo
  echo "No git remote yet. Once, do either:"
  echo "  ./tools/push.sh YOUR-USERNAME/rupeeflow        (after creating the repo on github.com)"
  echo "  git remote add origin git@github.com:YOUR-USERNAME/rupeeflow.git"
fi
