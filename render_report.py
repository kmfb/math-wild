#!/usr/bin/env python3
from __future__ import annotations

import argparse
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SRC = ROOT / "src"
if str(SRC) not in sys.path:
    sys.path.insert(0, str(SRC))

from math_wild.chapters import load_chapter, load_chapters
from render import render_report


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--chapter", default="balance_equations")
    ap.add_argument("--all", action="store_true")
    args = ap.parse_args()

    chapters = load_chapters() if args.all else [load_chapter(args.chapter)]
    reports = [render_report(chapter) for chapter in chapters]
    return 0 if all(report["status"] == "PASS" for report in reports) else 1


if __name__ == "__main__":
    raise SystemExit(main())
