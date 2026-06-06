#!/usr/bin/env python3
from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parent
RENDERS = ROOT / "renders"
KEYFRAMES = RENDERS / "keyframes"
REPORT = RENDERS / "render_report.json"
VERIFICATION = ROOT / "verification.json"

EXPECTED_FILES = {
    "video": RENDERS / "balance_equations_manim.mp4",
    "poster": RENDERS / "balance_equations_poster_from_manim.png",
}

EXPECTED_KEYFRAMES = [
    "KF01MainBalance.png",
    "KF02SubtractThree.png",
    "KF03XEqualsFive.png",
    "KF04TwoX.png",
    "KF05SplitTwoX.png",
    "KF06Summary.png",
]


def file_check(path: Path) -> dict[str, object]:
    exists = path.exists()
    size = path.stat().st_size if exists and path.is_file() else 0
    return {
        "path": str(path.relative_to(ROOT)),
        "exists": exists,
        "size_bytes": size,
        "pass": exists and size > 0,
    }


def verification_check() -> dict[str, object]:
    check = file_check(VERIFICATION)
    if not check["pass"]:
        check["status"] = None
        return check

    try:
        payload = json.loads(VERIFICATION.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        check["pass"] = False
        check["status"] = None
        check["error"] = str(exc)
        return check

    check["status"] = payload.get("status")
    check["pass"] = payload.get("status") == "PASS"
    return check


def build_report() -> dict[str, object]:
    outputs = {name: file_check(path) for name, path in EXPECTED_FILES.items()}
    keyframes = {
        name: file_check(KEYFRAMES / name)
        for name in EXPECTED_KEYFRAMES
    }
    verification = verification_check()

    checks = [
        *outputs.values(),
        *keyframes.values(),
        verification,
    ]
    return {
        "status": "PASS" if all(check["pass"] for check in checks) else "FAIL",
        "outputs": outputs,
        "keyframes": keyframes,
        "verification": verification,
    }


def main() -> int:
    report = build_report()
    REPORT.parent.mkdir(parents=True, exist_ok=True)
    REPORT.write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(json.dumps(report, indent=2))
    return 0 if report["status"] == "PASS" else 1


if __name__ == "__main__":
    raise SystemExit(main())
