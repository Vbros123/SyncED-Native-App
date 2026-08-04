#!/usr/bin/env bash
set -euo pipefail

REPO="Vbros123/SyncED-Native-App"

if ! command -v gh >/dev/null 2>&1; then
  echo "GitHub CLI is required. Install it with: brew install gh" >&2
  exit 1
fi

if ! gh auth status >/dev/null 2>&1; then
  echo "Sign in first with: gh auth login" >&2
  exit 1
fi

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  git init -b main
  git add .
  git commit -m "Initialize SyncED native app"
fi

if gh repo view "$REPO" >/dev/null 2>&1; then
  if ! git remote get-url origin >/dev/null 2>&1; then
    git remote add origin "https://github.com/${REPO}.git"
  fi
  git push -u origin main
else
  gh repo create "$REPO" \
    --private \
    --description "Offline-first multilingual education app for web, iOS, and Android." \
    --source . \
    --remote origin \
    --push
fi

VISIBILITY="$(gh repo view "$REPO" --json visibility --jq '.visibility')"
if [[ "$VISIBILITY" != "PRIVATE" ]]; then
  gh repo edit "$REPO" --visibility private --accept-visibility-change-consequences
fi

echo "Private repository ready: https://github.com/${REPO}"
