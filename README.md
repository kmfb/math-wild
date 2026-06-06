# Math Wild

A Manim-based math visual scene compiler prototype for exploratory math lessons.

Current chapter:

> 平衡与方程：等号不是答案，而是关系。

## What this repo does

This repo compiles a structured chapter spec into a Manim scene, renders a lesson video, exports keyframes, and composes a poster from those keyframes.

```text
chapter_spec.json
→ verify.py
→ compile_to_manim.py
→ generated/balance_equations_scene.py
→ render_local.py
→ renders/
```

## Install with uv

### macOS

```bash
bash scripts/setup_macos_uv.sh
uv run python render_local.py --quality ql
```

### Ubuntu / Debian

```bash
bash scripts/setup_ubuntu_uv.sh
uv run python render_local.py --quality ql
```

### Windows PowerShell

Install FFmpeg first:

```powershell
winget install Gyan.FFmpeg
```

Then:

```powershell
.\scripts\setup_windows_uv.ps1
uv run python render_local.py --quality ql
```

## Minimal commands

```bash
uv sync
uv run python verify.py
uv run python compile_to_manim.py chapter_spec.json --out generated/balance_equations_scene.py
uv run python render_local.py --quality ql
```

High-quality render:

```bash
uv run python render_local.py --quality qh
```

Only render still keyframes and poster:

```bash
uv run python render_local.py --quality ql --skip-video
```

## Outputs

After rendering:

```text
renders/
├─ balance_equations_manim.mp4
├─ keyframes/
│  ├─ KF01MainBalance.png
│  ├─ KF02SubtractThree.png
│  ├─ KF03XEqualsFive.png
│  ├─ KF04TwoX.png
│  ├─ KF05SplitTwoX.png
│  └─ KF06Summary.png
└─ balance_equations_poster_from_manim.png
```

## Push this repo to GitHub

Create a new GitHub repo and push:

```bash
bash scripts/push_new_github_repo.sh math-wild private
```

Or push to an existing repo:

```bash
bash scripts/push_existing_github_repo.sh git@github.com:USER/REPO.git
```

## GitHub Actions

This repo includes:

```text
.github/workflows/render.yml
```

After pushing to GitHub, you can run the workflow manually from the Actions tab. It uses uv, installs system dependencies on Ubuntu, renders the Manim scene, and uploads `renders/` as an artifact.

## Font note

The default CJK font is:

```text
Noto Sans CJK SC
```

Override it when needed:

```bash
MATH_WILD_CJK_FONT="Microsoft YaHei" uv run python render_local.py --quality ql
```

## Core principle

```text
scene spec controls math facts
Manim controls visual expression
poster composer only combines Manim keyframes
```
