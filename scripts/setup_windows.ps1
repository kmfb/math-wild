$ErrorActionPreference = "Stop"

py -3 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r requirements.txt

Write-Host ""
Write-Host "Python venv is ready."
Write-Host "Render with:"
Write-Host "  .\render_local.ps1"
Write-Host ""
Write-Host "If FFmpeg is missing, install it with winget:"
Write-Host "  winget install Gyan.FFmpeg"
