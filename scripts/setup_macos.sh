#!/usr/bin/env bash
set -euo pipefail

if ! command -v brew >/dev/null 2>&1; then
  echo "Homebrew is not installed. Install it first: https://brew.sh"
  exit 1
fi

brew install ffmpeg cairo pango pkg-config || true
bash scripts/setup_venv.sh
