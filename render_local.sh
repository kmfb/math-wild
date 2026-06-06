#!/usr/bin/env bash
set -euo pipefail

if [ -d ".venv" ]; then
  source .venv/bin/activate
fi

export PYTHONPATH="$PWD/src:$PWD:${PYTHONPATH:-}"
python render_local.py "$@"
