#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import os
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SRC = ROOT / "src"
if str(SRC) not in sys.path:
    sys.path.insert(0, str(SRC))

from math_wild.chapters import Chapter, load_chapter, load_chapters


MEDIA = ROOT / "media"


def run(cmd: list[str], *, env: dict[str, str] | None = None) -> None:
    print("\n$ " + " ".join(cmd))
    subprocess.run(cmd, cwd=ROOT, env=env, check=True)


def env_with_paths() -> dict[str, str]:
    env = os.environ.copy()
    env["PYTHONPATH"] = str(SRC) + os.pathsep + str(ROOT) + os.pathsep + env.get("PYTHONPATH", "")
    return env


def find_latest(patterns: list[str], base: Path = MEDIA) -> Path:
    matches: list[Path] = []
    for pattern in patterns:
        matches.extend(base.rglob(pattern))
    if not matches:
        raise FileNotFoundError(f"No files found under {base} for patterns: {patterns}")
    return max(matches, key=lambda p: p.stat().st_mtime)


def manim_cmd() -> list[str]:
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
    raise SystemExit("Manim is not available. Run `uv sync` and make sure FFmpeg is installed.")


def poster_labels(chapter: Chapter) -> list[str]:
    if chapter.chapter_id == "balance_equations":
        return ["两边同变", "隐藏量显现", "同一规则"]
    if chapter.chapter_id == "distributive_law":
        return ["整体面积", "标出尺寸", "切成两块"]
    return ["关键帧一", "关键帧二", "关键帧三"]


def poster_note(chapter: Chapter) -> str:
    return f"海报由 Manim 关键帧组合而成；数学对象来自 {chapter.scene_type} spec。"


def render_report(chapter: Chapter) -> dict[str, object]:
    verification_status = None
    if chapter.verification_path.exists():
        verification_status = json.loads(chapter.verification_path.read_text(encoding="utf-8")).get("status")
    keyframes = list(chapter.keyframes_dir.glob("*.png")) if chapter.keyframes_dir.exists() else []
    report = {
        "chapter_id": chapter.chapter_id,
        "status": "PASS"
        if (
            chapter.video_path.exists()
            and chapter.video_path.stat().st_size > 0
            and chapter.poster_path.exists()
            and chapter.poster_path.stat().st_size > 0
            and len(keyframes) == len(chapter.keyframe_scenes)
            and verification_status == "PASS"
        )
        else "FAIL",
        "video": chapter.video_path.exists() and chapter.video_path.stat().st_size > 0,
        "keyframes": len(keyframes),
        "poster": chapter.poster_path.exists() and chapter.poster_path.stat().st_size > 0,
        "verification": verification_status,
    }
    chapter.report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return report


def render_chapter(chapter: Chapter, quality: str, skip_video: bool = False) -> dict[str, object]:
    env = env_with_paths()
    chapter.render_dir.mkdir(parents=True, exist_ok=True)
    chapter.keyframes_dir.mkdir(parents=True, exist_ok=True)

    run([sys.executable, "verify.py", "--chapter", chapter.chapter_id], env=env)
    m = manim_cmd()

    if not skip_video:
        run(m + [f"-{quality}", str(chapter.scene_path), chapter.video_scene], env=env)
        video = find_latest([f"*{chapter.video_scene}*.mp4", f"{chapter.video_scene}.mp4"])
        shutil.copy2(video, chapter.video_path)
        print(f"Copied video -> {chapter.video_path}")

    for scene in chapter.keyframe_scenes:
        run(m + [f"-{quality}", "-s", str(chapter.scene_path), scene], env=env)
        png = find_latest([f"*{scene}*.png"])
        out_png = chapter.keyframes_dir / f"{scene}.png"
        shutil.copy2(png, out_png)
        print(f"Copied keyframe -> {out_png}")

    run(
        [
            sys.executable,
            "poster_composer.py",
            "--keyframes",
            str(chapter.keyframes_dir),
            "--out",
            str(chapter.poster_path),
            "--title",
            chapter.title,
            "--subtitle",
            chapter.subtitle,
            "--note",
            poster_note(chapter),
            "--labels",
            *poster_labels(chapter),
        ],
        env=env,
    )
    return render_report(chapter)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--chapter")
    ap.add_argument("--all", action="store_true")
    ap.add_argument("--quality", default="qh", choices=["ql", "qm", "qh", "qk"])
    ap.add_argument("--skip-video", action="store_true")
    args = ap.parse_args()

    chapters = load_chapters() if args.all else [load_chapter(args.chapter or "balance_equations")]
    reports = [render_chapter(chapter, args.quality, skip_video=args.skip_video) for chapter in chapters]
    return 0 if all(report["status"] == "PASS" for report in reports) else 1


if __name__ == "__main__":
    raise SystemExit(main())
