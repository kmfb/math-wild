#!/usr/bin/env bash
set -euo pipefail

python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -r requirements.txt

echo
echo "Python venv is ready."
echo "Activate it with:"
echo "  source .venv/bin/activate"
echo
echo "Then render with:"
echo "  python render_local.py"
