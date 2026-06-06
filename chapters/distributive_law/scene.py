#!/usr/bin/env python3
from __future__ import annotations

import os
import subprocess
import sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
SRC = os.path.join(ROOT, "src")
if SRC not in sys.path:
    sys.path.insert(0, SRC)
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

from manim import *
from math_wild import *


config.background_color = BG


def make_rect():
    return RectangleSplit(height_value=3, unknown_label="x", known_value=5).shift(DOWN * 0.35)


def make_formula(text="3(x + 5) = 3x + 15", size=48):
    return formula_text(text, size=size, color=WHITE)


class DistributiveLawScene(Scene):
    def construct(self):
        header = area_header()
        title, subtitle = header
        self.play(FadeIn(title, shift=DOWN * 0.2), FadeIn(subtitle, shift=DOWN * 0.15))

        formula = make_formula("3(x + 5)", size=54).next_to(header, DOWN, buff=0.35)
        self.play(Write(formula))

        rect = make_rect()
        self.play(Create(rect.outline), FadeIn(rect.blocks, shift=UP * 0.15), run_time=1.1)
        self.wait(0.35)

        self.play(FadeIn(rect.height_label), FadeIn(rect.width_label))
        self.wait(0.45)

        self.play(Create(rect.split), FadeIn(rect.left_brace), FadeIn(rect.right_brace), run_time=1.0)
        self.wait(0.35)

        self.play(FadeIn(rect.left_block.label, scale=0.95), run_time=0.6)
        self.play(FadeIn(rect.right_block.label, scale=0.95), run_time=0.6)

        formula2 = make_formula("3(x + 5) = 3x + 15", size=46).move_to(formula)
        note = label_text("整体面积 = 两块面积相加", size=30, color=YELLOW, weight=BOLD).to_edge(DOWN)
        self.play(Transform(formula, formula2), FadeIn(note, shift=UP * 0.15))
        self.wait(1.2)


class KF01WholeRectangle(Scene):
    def construct(self):
        header = area_header()
        rect = make_rect()
        self.add(header)
        self.add(make_formula("3(x + 5)", size=54).next_to(header, DOWN, buff=0.35))
        self.add(rect.blocks, rect.outline)


class KF02HeightWidth(Scene):
    def construct(self):
        header = area_header()
        rect = make_rect()
        self.add(header)
        self.add(make_formula("3(x + 5)", size=54).next_to(header, DOWN, buff=0.35))
        self.add(rect.blocks, rect.outline, rect.height_label, rect.width_label)


class KF03SplitRectangle(Scene):
    def construct(self):
        header = area_header()
        rect = make_rect()
        self.add(header)
        self.add(make_formula("x 和 5 被切开", size=44).next_to(header, DOWN, buff=0.35))
        self.add(rect.blocks, rect.outline, rect.split, rect.height_label, rect.width_label, rect.left_brace, rect.right_brace)


class KF04AreaParts(Scene):
    def construct(self):
        header = area_header()
        rect = make_rect()
        self.add(header)
        self.add(make_formula("左块 3x，右块 15", size=42).next_to(header, DOWN, buff=0.35))
        self.add(rect)


class KF05FormulaSummary(Scene):
    def construct(self):
        header = area_header("本章收束", "分配律来自同一个面积")
        formula = make_formula("3(x + 5) = 3x + 15", size=50).shift(UP * 0.2)
        note = label_text("公式只是长方形被切开", size=34, color=YELLOW, weight=BOLD).next_to(formula, DOWN, buff=0.65)
        self.add(header, formula, note)


if __name__ == "__main__":
    env = os.environ.copy()
    env["PYTHONPATH"] = SRC + os.pathsep + ROOT + os.pathsep + env.get("PYTHONPATH", "")
    raise SystemExit(
        subprocess.call(
            [sys.executable, "-m", "manim", "-ql", __file__, "DistributiveLawScene"],
            cwd=ROOT,
            env=env,
        )
    )
