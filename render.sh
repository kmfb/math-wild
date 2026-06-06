#!/usr/bin/env bash
set -euo pipefail

uv run python render.py --all --quality ql "$@"
