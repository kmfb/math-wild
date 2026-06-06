from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
CHAPTERS_DIR = ROOT / "chapters"


@dataclass(frozen=True)
class Chapter:
    chapter_id: str
    root: Path
    spec_path: Path
    scene_path: Path
    render_dir: Path
    video_scene: str
    keyframe_scenes: list[str]
    title: str
    subtitle: str
    scene_type: str

    @property
    def keyframes_dir(self) -> Path:
        return self.render_dir / "keyframes"

    @property
    def verification_path(self) -> Path:
        return self.render_dir / "verification.json"

    @property
    def report_path(self) -> Path:
        return self.render_dir / "render_report.json"

    @property
    def video_path(self) -> Path:
        return self.render_dir / "lesson.mp4"

    @property
    def poster_path(self) -> Path:
        return self.render_dir / "poster.png"


def scene_type_for(spec: dict) -> str:
    if spec.get("scene", {}).get("type"):
        return spec["scene"]["type"]
    for scene in spec.get("sequence", []):
        if scene.get("type") == "balance_equation":
            return "balance_equation"
    raise ValueError("Cannot infer scene type from chapter spec")


def load_chapter(chapter_id: str) -> Chapter:
    root = CHAPTERS_DIR / chapter_id
    spec_path = root / "chapter_spec.json"
    scene_path = root / "scene.py"
    if not spec_path.exists():
        raise FileNotFoundError(f"Unknown chapter: {chapter_id}")
    spec = json.loads(spec_path.read_text(encoding="utf-8"))
    exports = spec["exports"]
    return Chapter(
        chapter_id=chapter_id,
        root=root,
        spec_path=spec_path,
        scene_path=scene_path,
        render_dir=ROOT / "renders" / chapter_id,
        video_scene=exports["video_scene"],
        keyframe_scenes=list(exports["keyframe_scenes"]),
        title=spec["title"],
        subtitle=spec["subtitle"],
        scene_type=scene_type_for(spec),
    )


def list_chapters() -> list[str]:
    if not CHAPTERS_DIR.exists():
        return []
    return sorted(
        path.name
        for path in CHAPTERS_DIR.iterdir()
        if path.is_dir() and (path / "chapter_spec.json").exists()
    )


def load_chapters(chapter_ids: list[str] | None = None) -> list[Chapter]:
    return [load_chapter(chapter_id) for chapter_id in (chapter_ids or list_chapters())]
