$ErrorActionPreference = "Stop"

if (-not (Get-Command uv -ErrorAction SilentlyContinue)) {
  irm https://astral.sh/uv/install.ps1 | iex
}

Write-Host "Make sure FFmpeg is installed:"
Write-Host "  winget install Gyan.FFmpeg"
Write-Host ""

uv sync
Write-Host "Ready. Run:"
Write-Host "  uv run python render.py --all --quality ql"
