#!/usr/bin/env python3
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import argparse, os

def font(size, bold=False):
    candidates = [
        "/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc" if bold else "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc",
        "/usr/share/fonts/truetype/noto/NotoSansCJK-Bold.ttc" if bold else "/usr/share/fonts/truetype/noto/NotoSansCJK-Regular.ttc",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    ]
    for p in candidates:
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()

def compose(keyframes_dir, out):
    keyframes_dir = Path(keyframes_dir)
    imgs = sorted(keyframes_dir.glob("*.png"))
    if len(imgs) < 3:
        raise SystemExit(f"Need at least 3 keyframes in {keyframes_dir}, got {len(imgs)}")

    W, H = 1600, 900
    bg = Image.new("RGB", (W, H), (3, 7, 12))
    d = ImageDraw.Draw(bg)
    d.text((W//2, 62), "平衡与方程", font=font(66, True), fill=(238,234,219), anchor="mm")
    d.text((W//2, 122), "等号不是答案，而是关系", font=font(34, True), fill=(77,229,200), anchor="mm")
    d.text((W//2, 172), "海报由 Manim 关键帧组合而成；数学对象来自 scene spec。", font=font(22), fill=(150,160,165), anchor="mm")

    main = Image.open(imgs[0]).convert("RGB")
    main.thumbnail((930, 520), Image.Resampling.LANCZOS)
    x = (W - main.width)//2
    bg.paste(main, (x, 220))

    smalls = imgs[1:4]
    xs = [220, 650, 1080]
    labels = ["两边同变", "隐藏量显现", "同一规则"]
    for p, x, label in zip(smalls, xs, labels):
        im = Image.open(p).convert("RGB")
        im.thumbnail((310, 180), Image.Resampling.LANCZOS)
        bg.paste(im, (x, 685))
        d.text((x + im.width//2, 875), label, font=font(24, True), fill=(238,234,219), anchor="mm")

    out = Path(out)
    out.parent.mkdir(parents=True, exist_ok=True)
    bg.save(out, quality=95)
    print(out)

if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--keyframes", default="renders/keyframes")
    ap.add_argument("--out", default="renders/poster.png")
    args = ap.parse_args()
    compose(args.keyframes, args.out)
