#!/usr/bin/env bash
set -euo pipefail

sudo apt-get update
sudo apt-get install -y ffmpeg build-essential pkg-config libcairo2-dev libpango1.0-dev fonts-noto-cjk fonts-dejavu curl

if ! command -v uv >/dev/null 2>&1; then
  curl -LsSf https://astral.sh/uv/install.sh | sh
  export PATH="$HOME/.local/bin:$PATH"
fi

uv sync
echo "Ready. Run: uv run python render.py --all --quality ql"
