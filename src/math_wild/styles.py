# math_wild.styles
# Shared visual constants for ManimCE scenes.

import os

BG = "#03070C"
TEAL = "#4DE5C8"
BLUE = "#38B2EE"
GREEN = "#65CD7A"
YELLOW = "#F2C558"
GOLD = "#E8AB40"
WHITE = "#EEEADB"
MUTED = "#96A0A5"
RED = "#FF6858"

# Override when needed:
#   MATH_WILD_CJK_FONT="Microsoft YaHei" uv run python render_local.py
CJK_FONT = os.environ.get("MATH_WILD_CJK_FONT", "Noto Sans CJK SC")
SERIF_FONT = os.environ.get("MATH_WILD_SERIF_FONT", "DejaVu Serif")
