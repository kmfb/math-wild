#!/usr/bin/env bash
set -euo pipefail

if ! command -v brew >/dev/null 2>&1; then
  echo "Homebrew is not installed. Install it first: https://brew.sh"
  exit 1
fi

brew install ffmpeg cairo pango pkg-config || true
# Chinese font for Manim Text. This cask may already exist or be installed.
brew install --cask font-noto-sans-cjk-sc || true

if ! command -v uv >/dev/null 2>&1; then
  curl -LsSf https://astral.sh/uv/install.sh | sh
  export PATH="$HOME/.local/bin:$PATH"
fi

uv sync
echo "Ready. Run: uv run python render.py --all --quality ql"
