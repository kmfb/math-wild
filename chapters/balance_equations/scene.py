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

TITLE = "平衡与方程"
SUBTITLE = "等号不是答案，而是关系"


def make_header(title=TITLE, subtitle=SUBTITLE):
    return chapter_header(title, subtitle)


def make_main_balance():
    return balance_from_items(
        [{"kind": "unknown", "label": "x", "count": 1}, {"kind": "unit", "count": 3}],
        [{"kind": "unit", "count": 8}],
        scale=1.05,
    )


def make_after_balance():
    return balance_from_items(
        [{"kind": "unknown", "label": "x", "count": 1}],
        [{"kind": "unit", "count": 5}],
        scale=1.05,
    )


def make_two_x_balance():
    return balance_from_items(
        [{"kind": "unknown", "label": "x", "count": 2}],
        [{"kind": "unit", "count": 10}],
        scale=1.02,
    )


class BalanceEquationScene(Scene):
    def construct(self):
        header = make_header()
        title, subtitle = header
        self.play(FadeIn(title, shift=DOWN * 0.2), FadeIn(subtitle, shift=DOWN * 0.15))
        self.wait(0.3)

        eq = formula_card("x + 3 = 8", size=52).next_to(header, DOWN, buff=0.35)
        self.play(Write(eq))

        balance = make_main_balance().shift(DOWN * 0.55)
        self.play(Create(balance), run_time=1.25)
        self.wait(0.7)

        note = label_text("两边同时去掉 3：不是搬家，而是保持平衡。", size=26, color=YELLOW, weight=BOLD).to_edge(DOWN)
        self.play(FadeIn(note, shift=UP * 0.2))

        eq2 = formula_card("x + 3 − 3 = 8 − 3", size=42).move_to(eq)
        self.play(Transform(eq, eq2))
        self.wait(0.4)

        balance_after = make_after_balance().shift(DOWN * 0.55)
        self.play(Transform(balance, balance_after), run_time=1.2)

        eq3 = formula_card("x = 5", size=52).move_to(eq)
        self.play(Transform(eq, eq3), FadeOut(note))
        self.wait(0.8)

        title2 = label_text("另一种平衡", size=44, color=WHITE, weight=BOLD).move_to(title)
        subtitle2 = subtitle_text("2x = 10 也只是同一个规则", size=26).move_to(subtitle)
        eq4 = formula_card("2x = 10", size=50).move_to(eq)
        balance_two = make_two_x_balance().shift(DOWN * 0.55)

        self.play(
            Transform(title, title2),
            Transform(subtitle, subtitle2),
            Transform(eq, eq4),
            Transform(balance, balance_two),
            run_time=1.2,
        )
        self.wait(0.7)

        note2 = label_text("两边平均分成 2 份", size=28, color=YELLOW, weight=BOLD).to_edge(DOWN)
        self.play(FadeIn(note2, shift=UP * 0.2))

        eq5 = formula_card("x = 5", size=52).move_to(eq)
        balance_result = make_after_balance().shift(DOWN * 0.55)
        self.play(Transform(eq, eq5), Transform(balance, balance_result), run_time=1.2)
        self.wait(0.8)

        self.play(FadeOut(balance), FadeOut(note2), eq.animate.shift(UP * 0.15))
        summary = label_text("解方程不是搬家，而是保持平衡。", size=34, color=YELLOW, weight=BOLD).next_to(eq, DOWN, buff=0.65)
        self.play(Write(summary))
        self.wait(1.4)


class KF01MainBalance(Scene):
    def construct(self):
        header = make_header()
        self.add(header)
        eq = formula_card("x + 3 = 8", size=52).next_to(header, DOWN, buff=0.35)
        self.add(eq, make_main_balance().shift(DOWN * 0.55))


class KF02SubtractThree(Scene):
    def construct(self):
        header = make_header(TITLE, "两边同变，关系不变")
        self.add(header)
        eq = formula_card("x + 3 − 3 = 8 − 3", size=42).next_to(header, DOWN, buff=0.35)
        self.add(eq, make_main_balance().shift(DOWN * 0.55))
        self.add(label_text("两边同时去掉 3", size=30, color=YELLOW, weight=BOLD).to_edge(DOWN))


class KF03XEqualsFive(Scene):
    def construct(self):
        header = make_header(TITLE, "隐藏量显现")
        self.add(header)
        eq = formula_card("x = 5", size=52).next_to(header, DOWN, buff=0.35)
        self.add(eq, make_after_balance().shift(DOWN * 0.55))


class KF04TwoX(Scene):
    def construct(self):
        header = make_header("另一种平衡", "2x = 10 也只是同一个规则")
        self.add(header)
        eq = formula_card("2x = 10", size=50).next_to(header, DOWN, buff=0.35)
        self.add(eq, make_two_x_balance().shift(DOWN * 0.55))


class KF05SplitTwoX(Scene):
    def construct(self):
        header = make_header("另一种平衡", "两边平均分，关系仍然保持")
        self.add(header)
        eq = formula_card("x = 5", size=52).next_to(header, DOWN, buff=0.35)
        self.add(eq, make_after_balance().shift(DOWN * 0.55))
        self.add(label_text("每一份：x = 5", size=34, color=YELLOW, weight=BOLD).to_edge(DOWN))


class KF06Summary(Scene):
    def construct(self):
        header = make_header("本章收束", "等号是一种关系，不是一个终点")
        self.add(header)
        eq = formula_card("x + 3 = 8  →  x = 5", size=46).shift(UP * 0.15)
        summary = label_text("解方程不是搬家，而是保持平衡。", size=34, color=YELLOW, weight=BOLD).next_to(eq, DOWN, buff=0.65)
        self.add(eq, summary)


if __name__ == "__main__":
    env = os.environ.copy()
    env["PYTHONPATH"] = SRC + os.pathsep + ROOT + os.pathsep + env.get("PYTHONPATH", "")
    raise SystemExit(
        subprocess.call(
            [sys.executable, "-m", "manim", "-ql", __file__, "BalanceEquationScene"],
            cwd=ROOT,
            env=env,
        )
    )
