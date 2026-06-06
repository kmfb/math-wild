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

CHAPTERS = {
    "balance_equations": {
        "spec": "chapter_spec.json",
        "verify_out": "verification.json",
        "compile": True,
        "compile_out": "generated/balance_equations_scene.py",
        "scene_file": "generated/balance_equations_scene.py",
        "scene": "GeneratedBalanceEquations",
        "video_out": RENDERS / "balance_equations_manim.mp4",
        "keyframes_dir": KEYFRAMES,
        "keyframes": [
            "KF01MainBalance",
            "KF02SubtractThree",
            "KF03XEqualsFive",
            "KF04TwoX",
            "KF05SplitTwoX",
            "KF06Summary",
        ],
        "poster_out": RENDERS / "balance_equations_poster_from_manim.png",
        "poster_title": "平衡与方程",
        "poster_subtitle": "等号不是答案，而是关系",
        "poster_note": "海报由 Manim 关键帧组合而成；数学对象来自 scene spec。",
        "poster_labels": ["两边同变", "隐藏量显现", "同一规则"],
    },
    "distributive_law": {
        "spec": "chapters/distributive_law/chapter_spec.json",
        "verify_out": "renders/distributive_law_verification.json",
        "compile": False,
        "scene_file": "chapters/distributive_law/scene.py",
        "scene": "DistributiveLawScene",
        "video_out": RENDERS / "distributive_law.mp4",
        "keyframes_dir": KEYFRAMES / "distributive_law",
        "keyframes": [
            "KF01WholeRectangle",
            "KF02HeightWidth",
            "KF03SplitRectangle",
            "KF04AreaParts",
            "KF05FormulaSummary",
        ],
        "poster_out": RENDERS / "distributive_law_poster.png",
        "poster_title": "拆开与分配",
        "poster_subtitle": "公式只是长方形被切开",
        "poster_note": "海报由面积模型关键帧组合而成；数学对象来自 rectangle_split spec。",
        "poster_labels": ["整体面积", "标出尺寸", "切成两块"],
    },
}


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
    parser.add_argument("--chapter", default="balance_equations", choices=sorted(CHAPTERS))
    parser.add_argument("--scene", default=None)
    args = parser.parse_args()
    chapter = CHAPTERS[args.chapter]
    scene_name = args.scene or chapter["scene"]

    env = os.environ.copy()
    src_path = str(ROOT / "src")
    env["PYTHONPATH"] = src_path + os.pathsep + str(ROOT) + os.pathsep + env.get("PYTHONPATH", "")

    RENDERS.mkdir(exist_ok=True)
    chapter["keyframes_dir"].mkdir(parents=True, exist_ok=True)

    run([sys.executable, "verify.py", chapter["spec"], "--out", chapter["verify_out"]], env=env)
    if chapter["compile"]:
        run([sys.executable, "compile_to_manim.py", chapter["spec"], "--out", chapter["compile_out"]], env=env)

    m = manim_cmd()
    scene_file = chapter["scene_file"]

    if not args.skip_video:
        run(m + [f"-{args.quality}", scene_file, scene_name], env=env)
        video = find_latest([f"*{scene_name}*.mp4", f"{scene_name}.mp4"])
        out_video = chapter["video_out"]
        shutil.copy2(video, out_video)
        print(f"Copied video → {out_video}")

    for scene in chapter["keyframes"]:
        # ManimCE: -s / --save_last_frame writes a PNG still.
        run(m + [f"-{args.quality}", "-s", scene_file, scene], env=env)
        png = find_latest([f"*{scene}*.png"])
        out_png = chapter["keyframes_dir"] / f"{scene}.png"
        shutil.copy2(png, out_png)
        print(f"Copied keyframe → {out_png}")

    run([
        sys.executable,
        "poster_composer.py",
        "--keyframes",
        str(chapter["keyframes_dir"]),
        "--out",
        str(chapter["poster_out"]),
        "--title",
        chapter["poster_title"],
        "--subtitle",
        chapter["poster_subtitle"],
        "--note",
        chapter["poster_note"],
        "--labels",
        *chapter["poster_labels"],
    ], env=env)
    print("\nDone. Outputs are in ./renders/")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
