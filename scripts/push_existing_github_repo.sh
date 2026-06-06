#!/usr/bin/env bash
set -euo pipefail

REMOTE_URL="${1:?Usage: bash scripts/push_existing_github_repo.sh git@github.com:USER/REPO.git}"

if [ ! -d ".git" ]; then
  git init
fi

git add .
if ! git diff --cached --quiet; then
  git commit -m "Initial math-wild Manim/uv pipeline"
fi

if git remote get-url origin >/dev/null 2>&1; then
  git remote set-url origin "$REMOTE_URL"
else
  git remote add origin "$REMOTE_URL"
fi

git branch -M main
git push -u origin main
