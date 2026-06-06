from __future__ import annotations

from dataclasses import dataclass

from .area import RectangleSplit
from .components import BalanceScale


@dataclass(frozen=True)
class SceneType:
    name: str
    component: type
    verifier: str


class BalanceEquationScene(SceneType):
    def __init__(self):
        super().__init__(
            name="balance_equation",
            component=BalanceScale,
            verifier="verify_balance_equations",
        )


class RectangleSplitScene(SceneType):
    def __init__(self):
        super().__init__(
            name="rectangle_split",
            component=RectangleSplit,
            verifier="verify_rectangle_split",
        )


SCENE_TYPES = {
    "balance_equation": BalanceEquationScene(),
    "rectangle_split": RectangleSplitScene(),
}
