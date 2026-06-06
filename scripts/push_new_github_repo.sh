#!/usr/bin/env bash
set -euo pipefail

REPO_NAME="${1:-math-wild}"
VISIBILITY="${2:-private}" # private or public

if ! command -v gh >/dev/null 2>&1; then
  echo "GitHub CLI is required. Install it from https://cli.github.com/"
  exit 1
fi

if ! gh auth status >/dev/null 2>&1; then
  gh auth login
fi

if [ ! -d ".git" ]; then
  git init
fi

git add .
if ! git diff --cached --quiet; then
  git commit -m "Initial math-wild Manim/uv pipeline"
fi

VIS_FLAG="--private"
if [ "$VISIBILITY" = "public" ]; then
  VIS_FLAG="--public"
fi

gh repo create "$REPO_NAME" "$VIS_FLAG" --source=. --remote=origin --push
echo "Pushed to GitHub repo: $REPO_NAME"
