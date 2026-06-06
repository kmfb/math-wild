# Math Wild

A Manim-based math visual scene compiler prototype for exploratory math lessons.

Current chapters:

```text
balance_equations  → 平衡与方程：等号不是答案，而是关系。
distributive_law   → 拆开与分配：公式只是长方形被切开。
```

Current lab:

```text
apps/lab-web → Equation Lab for x + 3 = 8
```

## What this repo does

This repo renders structured math chapters into Manim lesson videos, exports keyframes, composes posters from those keyframes, and writes a per-chapter render report.
It also includes a React/SVG Equation Lab backed by an invariant-driven math world.

```text
chapters/<chapter>/chapter_spec.json
→ verify.py
→ chapters/<chapter>/scene.py
→ render.py
→ renders/<chapter>/
```

## Install with uv

### macOS

```bash
bash scripts/setup_macos_uv.sh
uv run python render.py --chapter balance_equations --quality ql
```

### Ubuntu / Debian

```bash
bash scripts/setup_ubuntu_uv.sh
uv run python render.py --chapter balance_equations --quality ql
```

### Windows PowerShell

Install FFmpeg first:

```powershell
winget install Gyan.FFmpeg
```

Then:

```powershell
.\scripts\setup_windows_uv.ps1
uv run python render.py --chapter balance_equations --quality ql
```

## Minimal commands

```bash
uv sync
uv run python verify.py --all
uv run python render.py --all --quality ql
```

## Equation Lab

```bash
pnpm install
pnpm test
pnpm dev
```

The Lab uses:

```text
packages/concept-specs/equation_balance_x_plus_3_eq_8.json
→ packages/math-kernel/
→ packages/math-worlds/equation-balance/
→ apps/lab-web/
```

v0.8 makes the Equation Lab invariant-driven:

```text
user input
→ EquationBalanceAction
→ EquationBalanceWorld.act()
→ invariant results
→ feedback
→ trace event
→ web renderer
```

React does not decide whether the equation is balanced. It reads:

```text
world.checkInvariants(state)
world.getFeedback(state)
trace
```

Render one chapter:

```bash
uv run python render.py --chapter balance_equations --quality ql
uv run python render.py --chapter distributive_law --quality ql
```

High-quality render:

```bash
uv run python render.py --all --quality qh
```

Only render still keyframes and poster:

```bash
uv run python render.py --all --quality ql --skip-video
```

## Outputs

After rendering:

```text
renders/
├─ balance_equations/
│  ├─ lesson.mp4
│  ├─ poster.png
│  ├─ keyframes/
│  └─ render_report.json
└─ distributive_law/
   ├─ lesson.mp4
   ├─ poster.png
   ├─ keyframes/
   └─ render_report.json
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

The default CJK font is platform-aware:

```text
macOS: Heiti SC
Linux: Noto Sans CJK SC
```

Override it when needed:

```bash
MATH_WILD_CJK_FONT="Microsoft YaHei" uv run python render.py --all --quality ql
```

## Core principle

```text
math world state and invariants control math facts
React, Manim, and poster export are renderers
trace records the executable path through the world
```
