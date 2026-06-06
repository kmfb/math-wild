$ErrorActionPreference = "Stop"

if (Test-Path ".\.venv\Scripts\Activate.ps1") {
  . .\.venv\Scripts\Activate.ps1
}

$env:PYTHONPATH = "$PWD\src;$PWD;$env:PYTHONPATH"
python render_local.py @args
