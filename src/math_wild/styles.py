# math_wild.styles
# Shared visual constants for ManimCE scenes.

import os
from pathlib import Path

BG = "#03070C"
TEAL = "#4DE5C8"
BLUE = "#38B2EE"
GREEN = "#65CD7A"
YELLOW = "#F2C558"
GOLD = "#E8AB40"
WHITE = "#EEEADB"
MUTED = "#96A0A5"
RED = "#FF6858"

def default_cjk_font():
    if Path("/System/Library/Fonts/PingFang.ttc").exists():
        return "PingFang SC"
    if Path("/System/Library/Fonts/STHeiti Medium.ttc").exists():
        return "Heiti SC"
    return "Noto Sans CJK SC"


def default_serif_font():
    if Path("/System/Library/Fonts/Times.ttc").exists():
        return "Times New Roman"
    return "DejaVu Serif"


# Override when needed:
#   MATH_WILD_CJK_FONT="Microsoft YaHei" uv run python render.py --all --quality ql
CJK_FONT = os.environ.get("MATH_WILD_CJK_FONT", default_cjk_font())
SERIF_FONT = os.environ.get("MATH_WILD_SERIF_FONT", default_serif_font())
