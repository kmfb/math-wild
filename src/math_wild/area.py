from manim import *

from .styles import *
from .components import formula_text, label_text


class AreaBlock(VGroup):
    def __init__(
        self,
        width=2.4,
        height=2.0,
        label="3x",
        fill_color=BLUE,
        stroke_color=WHITE,
        **kwargs,
    ):
        super().__init__(**kwargs)
        rect = Rectangle(
            width=width,
            height=height,
            stroke_color=stroke_color,
            stroke_width=3,
            fill_color=fill_color,
            fill_opacity=0.45,
        )
        text = formula_text(label, size=42, color=WHITE).move_to(rect)
        self.rect = rect
        self.label = text
        self.add(rect, text)


class DimensionLabel(VGroup):
    def __init__(self, start, end, label, direction=UP, buff=0.22, **kwargs):
        super().__init__(**kwargs)
        line = DoubleArrow(
            start,
            end,
            buff=0,
            color=MUTED,
            stroke_width=3,
            max_tip_length_to_length_ratio=0.08,
        )
        text = formula_text(label, size=32, color=WHITE).next_to(line, direction, buff=buff)
        self.add(line, text)


class BraceLabel(VGroup):
    def __init__(self, mob, label, direction=DOWN, **kwargs):
        super().__init__(**kwargs)
        brace = Brace(mob, direction=direction, color=YELLOW)
        text = formula_text(label, size=32, color=YELLOW).next_to(brace, direction, buff=0.12)
        self.add(brace, text)


class RectangleSplit(VGroup):
    def __init__(
        self,
        height_value=3,
        unknown_label="x",
        known_value=5,
        unknown_width=3.2,
        known_width=1.6,
        rect_height=2.2,
        **kwargs,
    ):
        super().__init__(**kwargs)
        self.height_value = height_value
        self.unknown_label = unknown_label
        self.known_value = known_value
        self.unknown_width = unknown_width
        self.known_width = known_width
        self.rect_height = rect_height

        left = AreaBlock(
            width=unknown_width,
            height=rect_height,
            label=f"{height_value}{unknown_label}",
            fill_color=BLUE,
        )
        right = AreaBlock(
            width=known_width,
            height=rect_height,
            label=str(height_value * known_value),
            fill_color=GREEN,
        )
        left.rect.set_stroke(width=0)
        right.rect.set_stroke(width=0)
        blocks = VGroup(left, right).arrange(RIGHT, buff=0)

        outline = Rectangle(
            width=unknown_width + known_width,
            height=rect_height,
            stroke_color=WHITE,
            stroke_width=4,
            fill_opacity=0,
        ).move_to(blocks)
        split_x = outline.get_left()[0] + unknown_width
        split = Line(
            [split_x, outline.get_top()[1], 0],
            [split_x, outline.get_bottom()[1], 0],
            color=YELLOW,
            stroke_width=5,
        )

        height_label = DimensionLabel(
            outline.get_left() + DOWN * rect_height / 2,
            outline.get_left() + UP * rect_height / 2,
            str(height_value),
            direction=LEFT,
        )
        width_label = DimensionLabel(
            outline.get_top() + LEFT * (unknown_width + known_width) / 2,
            outline.get_top() + RIGHT * (unknown_width + known_width) / 2,
            f"{unknown_label} + {known_value}",
            direction=UP,
        )
        left_brace = BraceLabel(left.rect, unknown_label, direction=DOWN)
        right_brace = BraceLabel(right.rect, str(known_value), direction=DOWN)

        self.left_block = left
        self.right_block = right
        self.blocks = blocks
        self.outline = outline
        self.split = split
        self.height_label = height_label
        self.width_label = width_label
        self.left_brace = left_brace
        self.right_brace = right_brace
        self.add(blocks, outline, split, height_label, width_label, left_brace, right_brace)


def area_header(title="拆开与分配", subtitle="公式只是长方形被切开"):
    t = label_text(title, size=56, color=WHITE, weight=BOLD)
    st = label_text(subtitle, size=28, color=TEAL, weight=BOLD)
    return VGroup(t, st).arrange(DOWN, buff=0.12).to_edge(UP)
