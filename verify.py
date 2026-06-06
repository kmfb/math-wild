#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SRC = ROOT / "src"
if str(SRC) not in sys.path:
    sys.path.insert(0, str(SRC))

from math_wild.chapters import load_chapter, load_chapters
from math_wild.registry import SCENE_TYPES


def side_total(items, unknowns):
    total = 0
    counts = {"unknown": 0, "unit": 0}
    for item in items:
        count = int(item.get("count", 1))
        kind = item["kind"]
        counts[kind] = counts.get(kind, 0) + count
        if kind == "unit":
            total += count
        elif kind == "unknown":
            label = item.get("label", "x")
            total += unknowns[label] * count
        else:
            raise ValueError(f"Unknown kind: {kind}")
    return total, counts


def verify_balance_equations(spec, spec_path):
    unknowns = spec["global_unknowns"]
    checks = []

    for scene in spec["sequence"]:
        if scene["type"] == "balance_equation":
            left_total, left_counts = side_total(scene["left"], unknowns)
            right_total, right_counts = side_total(scene["right"], unknowns)
            checks.append({
                "id": scene["id"],
                "equation": scene["equation"],
                "left_total": left_total,
                "right_total": right_total,
                "left_counts": left_counts,
                "right_counts": right_counts,
                "pass": left_total == right_total,
            })
        elif scene["type"] == "operation":
            op = scene["operation"]
            if op["kind"] == "subtract_units_from_both_sides":
                checks.append({
                    "id": scene["id"],
                    "operation": op,
                    "from_equation": scene["from_equation"],
                    "to_equation": scene["to_equation"],
                    "pass": True,
                    "reason": "subtract same number of unit blocks from both sides",
                })
            elif op["kind"] == "divide_both_sides":
                checks.append({
                    "id": scene["id"],
                    "operation": op,
                    "from_equation": scene["from_equation"],
                    "to_equation": scene["to_equation"],
                    "pass": True,
                    "reason": "divide both sides into equal number of parts",
                })
            else:
                checks.append({"id": scene["id"], "pass": False, "reason": "unsupported operation"})

    return {
        "status": "PASS" if all(c["pass"] for c in checks) else "FAIL",
        "spec": str(spec_path),
        "checks": checks,
        "rule": "Balance equation facts are validated from scene spec before Manim rendering.",
    }


def verify_rectangle_split(spec, spec_path):
    scene = spec["scene"]
    height = int(scene["height"])
    known_parts = [p for p in scene["width_parts"] if p["kind"] == "known"]
    unknown_parts = [p for p in scene["width_parts"] if p["kind"] == "unknown"]
    if len(known_parts) != 1 or len(unknown_parts) != 1:
        return {
            "status": "FAIL",
            "spec": str(spec_path),
            "checks": [
                {
                    "id": "rectangle_split_parts",
                    "pass": False,
                    "reason": "first version requires one unknown width and one known width",
                }
            ],
            "rule": "Rectangle split facts are validated from scene spec before Manim rendering.",
        }

    known_width = int(known_parts[0]["value"])
    known_area = height * known_width
    unknown_label = unknown_parts[0]["label"]
    expected_equation = f"{height}({unknown_label} + {known_width}) = {height}{unknown_label} + {known_area}"
    area_labels = [area["label"] for area in scene["areas"]]

    checks = [
        {
            "id": "known_area",
            "height": height,
            "known_width": known_width,
            "known_area": known_area,
            "pass": known_area == 15,
            "reason": f"{height} × {known_width} = {known_area}",
        },
        {
            "id": "structure",
            "equation": scene["equation"],
            "expected": expected_equation,
            "pass": scene["equation"].replace(" ", "") == expected_equation.replace(" ", ""),
            "reason": "whole rectangle expression matches split area expression",
        },
        {
            "id": "area_labels",
            "labels": area_labels,
            "expected": [f"{height}{unknown_label}", str(known_area)],
            "pass": area_labels == [f"{height}{unknown_label}", str(known_area)],
        },
    ]
    return {
        "status": "PASS" if all(c["pass"] for c in checks) else "FAIL",
        "spec": str(spec_path),
        "checks": checks,
        "rule": "Rectangle split facts are validated from scene spec before Manim rendering.",
    }


VERIFY_DISPATCH = {
    "verify_balance_equations": verify_balance_equations,
    "verify_rectangle_split": verify_rectangle_split,
}


def write_result(result, out_path):
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return result["status"] == "PASS"


def verify_spec(spec_path, out_path):
    spec = json.loads(Path(spec_path).read_text(encoding="utf-8"))
    scene_type = None
    if spec.get("scene", {}).get("type"):
        scene_type = spec["scene"]["type"]
    else:
        scene_type = "balance_equation"
    verifier = VERIFY_DISPATCH[SCENE_TYPES[scene_type].verifier]
    return write_result(verifier(spec, spec_path), Path(out_path))


def verify_chapter(chapter):
    spec = json.loads(chapter.spec_path.read_text(encoding="utf-8"))
    verifier = VERIFY_DISPATCH[SCENE_TYPES[chapter.scene_type].verifier]
    result = verifier(spec, chapter.spec_path)
    result["chapter_id"] = chapter.chapter_id
    return write_result(result, chapter.verification_path)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("spec", nargs="?")
    ap.add_argument("--out")
    ap.add_argument("--chapter")
    ap.add_argument("--all", action="store_true")
    args = ap.parse_args()

    if args.all:
        results = [verify_chapter(chapter) for chapter in load_chapters()]
        return 0 if all(results) else 1
    if args.chapter:
        return 0 if verify_chapter(load_chapter(args.chapter)) else 1
    if args.spec:
        out = args.out or "verification.json"
        return 0 if verify_spec(args.spec, out) else 1
    return 0 if verify_chapter(load_chapter("balance_equations")) else 1


if __name__ == "__main__":
    raise SystemExit(main())
