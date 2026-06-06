from manim import *
import numpy as np
from .styles import *

def label_text(s, size=36, color=WHITE, weight=NORMAL):
    return Text(s, font=CJK_FONT, font_size=size, color=color, weight=weight)

def formula_text(s, size=48, color=WHITE):
    # Text is used instead of MathTex so the scene does not require LaTeX.
    # In a full production environment this can be swapped to MathTex.
    return Text(s, font=SERIF_FONT, font_size=size, color=color, slant=ITALIC)

def subtitle_text(s, size=28, color=TEAL):
    return Text(s, font=CJK_FONT, font_size=size, color=color, weight=BOLD)

class UnitBlock(VGroup):
    def __init__(self, side=0.34, **kwargs):
        super().__init__(**kwargs)
        box = RoundedRectangle(
            width=side,
            height=side,
            corner_radius=side * 0.18,
            stroke_color="#7A634A",
            stroke_width=2,
            fill_color="#DBCFBC",
            fill_opacity=1,
        )
        hi = Line(
            box.get_corner(UL) + RIGHT * side * 0.18 + DOWN * side * 0.22,
            box.get_corner(UR) + LEFT * side * 0.18 + DOWN * side * 0.22,
            color="#FFF6E2",
            stroke_width=2,
        )
        self.add(box, hi)

class UnknownBlock(VGroup):
    def __init__(self, label="x", width=0.78, height=0.58, **kwargs):
        super().__init__(**kwargs)
        box = RoundedRectangle(
            width=width,
            height=height,
            corner_radius=0.10,
            stroke_color=GREEN,
            stroke_width=2.5,
            fill_color="#38914B",
            fill_opacity=0.94,
        )
        t = formula_text(label, size=38, color="#EAF8D8")
        self.add(box, t)

def unit_group(count, side=0.34, cols=None, buff=0.08):
    count = int(count)
    if count <= 0:
        g = VGroup()
        g.count = 0
        return g
    if cols is None:
        cols = 4 if count == 8 else (5 if count in [5, 10] else min(count, 5))
    rows = int(np.ceil(count / cols))
    group = VGroup(*[UnitBlock(side=side) for _ in range(count)])
    group.arrange_in_grid(rows=rows, cols=cols, buff=buff)
    group.count = count
    return group

def unknown_group(label="x", count=1):
    count = int(count)
    group = VGroup(*[UnknownBlock(label, width=0.68, height=0.54) for _ in range(count)])
    if count > 0:
        group.arrange(RIGHT, buff=0.15)
    group.count = count
    return group

def side_group(items):
    parts = []
    for item in items:
        kind = item["kind"]
        count = int(item.get("count", 1))
        if kind == "unknown":
            parts.append(unknown_group(item.get("label", "x"), count=count))
        elif kind == "unit":
            cols = max(1, count) if count <= 5 else (4 if count == 8 else 5)
            parts.append(unit_group(count, side=0.34 if count <= 8 else 0.30, cols=cols))
        else:
            raise ValueError(f"Unknown item kind: {kind}")
    group = VGroup(*parts)
    if len(parts) > 1:
        group.arrange(RIGHT, buff=0.16)
    return group

class BalanceScale(VGroup):
    def __init__(self, left_mob, right_mob, scale_width=6.2):
        super().__init__()
        beam = Line(LEFT * scale_width / 2, RIGHT * scale_width / 2, color=GOLD, stroke_width=6)
        pivot = Circle(radius=0.18, color=GOLD, fill_color=GOLD, fill_opacity=1)
        stand = Line(DOWN * 0.15, DOWN * 1.7, color=GOLD, stroke_width=7)
        base = Ellipse(width=1.5, height=0.25, color=GOLD).shift(DOWN * 1.75)
        self.add(beam, pivot, stand, base)

        left_center = LEFT * 2.25 + DOWN * 1.15
        right_center = RIGHT * 2.25 + DOWN * 1.15

        def pan(center):
            arc = ArcBetweenPoints(center + LEFT * 1.15, center + RIGHT * 1.15, angle=-TAU / 8, color=GOLD, stroke_width=4)
            line = Line(center + LEFT * 1.15, center + RIGHT * 1.15, color=GOLD, stroke_width=3)
            return VGroup(arc, line)

        left_anchor = beam.get_left() + RIGHT * 0.35
        right_anchor = beam.get_right() + LEFT * 0.35
        self.add(
            Line(left_anchor, left_center + LEFT * 1.0 + UP * 0.05, color=GOLD),
            Line(left_anchor + RIGHT * 0.7, left_center + RIGHT * 1.0 + UP * 0.05, color=GOLD),
            Line(right_anchor, right_center + LEFT * 1.0 + UP * 0.05, color=GOLD),
            Line(right_anchor + LEFT * 0.7, right_center + RIGHT * 1.0 + UP * 0.05, color=GOLD),
            pan(left_center),
            pan(right_center),
        )

        left_mob.move_to(left_center + UP * 0.42)
        right_mob.move_to(right_center + UP * 0.42)
        self.left_mob = left_mob
        self.right_mob = right_mob
        self.add(left_mob, right_mob)

def balance_from_items(left_items, right_items, scale=1.05):
    return BalanceScale(
        left_mob=side_group(left_items),
        right_mob=side_group(right_items),
    ).scale(scale)

def chapter_header(title, subtitle):
    t = label_text(title, size=56, color=WHITE, weight=BOLD)
    st = subtitle_text(subtitle, size=28, color=TEAL)
    return VGroup(t, st).arrange(DOWN, buff=0.12).to_edge(UP)

def formula_card(text, size=50):
    return formula_text(text, size=size)
