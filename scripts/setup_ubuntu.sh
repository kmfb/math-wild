#!/usr/bin/env bash
set -euo pipefail

sudo apt-get update
sudo apt-get install -y ffmpeg build-essential pkg-config libcairo2-dev libpango1.0-dev fonts-noto-cjk fonts-dejavu python3-venv
bash scripts/setup_venv.sh
