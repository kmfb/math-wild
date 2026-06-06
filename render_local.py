# uv-compatible local renderer
#!/usr/bin/env python3
"""
Local no-Docker renderer for Math Wild.

This script runs the same pipeline as the Docker version, but directly on your local
Python environment:

chapter_spec.json
→ verify.py
→ compile_to_manim.py
→ Manim render
→ keyframes
→ poster_composer.py

Usage:
  python render_local.py
  python render_local.py --quality ql
  python render_local.py --skip-video
"""

from __future__ import annotations

import argparse
import os
import shutil
import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parent
MEDIA = ROOT / "media"
RENDERS = ROOT / "renders"
KEYFRAMES = RENDERS / "keyframes"


def run(cmd: list[str], *, env: dict[str, str] | None = None) -> None:
    print("\n$ " + " ".join(cmd))
    subprocess.run(cmd, cwd=ROOT, env=env, check=True)


def find_latest(patterns: list[str], base: Path = MEDIA) -> Path:
    matches: list[Path] = []
    for pattern in patterns:
        matches.extend(base.rglob(pattern))
    if not matches:
        raise FileNotFoundError(f"No files found under {base} for patterns: {patterns}")
    return max(matches, key=lambda p: p.stat().st_mtime)


def manim_cmd() -> list[str]:
    # Prefer `python -m manim` to ensure the current venv is used.
    try:
        subprocess.run(
            [sys.executable, "-m", "manim", "--version"],
            cwd=ROOT,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            check=True,
        )
        return [sys.executable, "-m", "manim"]
    except Exception:
        if shutil.which("manim"):
            return ["manim"]
    raise SystemExit(
        "Manim is not available. Run one of:\n"
        "  bash scripts/setup_venv.sh\n"
        "  python -m pip install -r requirements.txt\n"
        "Also make sure FFmpeg is installed."
    )


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--quality", default="qh", choices=["ql", "qm", "qh", "qk"], help="Manim quality preset.")
    parser.add_argument("--skip-video", action="store_true", help="Only render still keyframes and poster.")
    parser.add_argument("--scene", default="GeneratedBalanceEquations")
    args = parser.parse_args()

    env = os.environ.copy()
    src_path = str(ROOT / "src")
    env["PYTHONPATH"] = src_path + os.pathsep + str(ROOT) + os.pathsep + env.get("PYTHONPATH", "")

    RENDERS.mkdir(exist_ok=True)
    KEYFRAMES.mkdir(parents=True, exist_ok=True)

    run([sys.executable, "verify.py"], env=env)
    run([sys.executable, "compile_to_manim.py", "chapter_spec.json", "--out", "generated/balance_equations_scene.py"], env=env)

    m = manim_cmd()
    scene_file = "generated/balance_equations_scene.py"

    if not args.skip_video:
        run(m + [f"-{args.quality}", scene_file, args.scene], env=env)
        video = find_latest([f"*{args.scene}*.mp4", f"{args.scene}.mp4"])
        out_video = RENDERS / "balance_equations_manim.mp4"
        shutil.copy2(video, out_video)
        print(f"Copied video → {out_video}")

    keyframe_scenes = [
        "KF01MainBalance",
        "KF02SubtractThree",
        "KF03XEqualsFive",
        "KF04TwoX",
        "KF05SplitTwoX",
        "KF06Summary",
    ]

    for scene in keyframe_scenes:
        # ManimCE: -s / --save_last_frame writes a PNG still.
        run(m + [f"-{args.quality}", "-s", scene_file, scene], env=env)
        png = find_latest([f"*{scene}*.png"])
        out_png = KEYFRAMES / f"{scene}.png"
        shutil.copy2(png, out_png)
        print(f"Copied keyframe → {out_png}")

    run([sys.executable, "poster_composer.py", "--keyframes", str(KEYFRAMES), "--out", str(RENDERS / "balance_equations_poster_from_manim.png")], env=env)
    print("\nDone. Outputs are in ./renders/")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
