"""
Generate PWA app icons for The List.

Why drawn natively in Pillow (not converted from SVG): cairosvg pulls in
cairocffi, which on this Mac hits the documented x86_64/arm64 mismatch
from CLAUDE.md. Drawing the icon natively sidesteps the whole issue.

Design:
  - White circle (#ffffff) with a thin dark hairline border to keep the
    icon legible against pure-white home-screen backgrounds.
  - Near-black checkmark (#0a0a0a) scaled from the same 64-unit SVG path
    as favicon.svg so the browser tab and the home-screen icon feel
    related.
  - We draw on a square PNG but fill only the inscribed circle; the four
    corners stay transparent. iOS will mask to a rounded square and
    Android may mask to a circle — both look clean because the only
    filled pixels are inside the circle.

Rerun:
    python3 scripts/generate_icons.py

Safe to delete after the PNGs are in the repo; this file is a scaffold
tool, not a runtime dependency.
"""

from pathlib import Path
from PIL import Image, ImageDraw

# Checkmark geometry in a 64-unit canvas (matches favicon.svg)
CHECK_POINTS = [(16, 33), (28, 45), (49, 21)]
BG = (255, 255, 255, 255)     # white circle
FG = (10, 10, 10, 255)        # near-black checkmark (--ink)
BORDER = (10, 10, 10, 255)    # same near-black for the circle hairline
BORDER_RATIO = 0.015          # ~1.5/64 — thin, just enough to define edge
STROKE_RATIO = 0.095          # matches favicon stroke weight (~7/64)

OUT_DIR = Path(__file__).resolve().parent.parent


def draw_icon(size: int) -> Image.Image:
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # White circle inscribed in the PNG, with a thin hairline border
    border = max(1, int(size * BORDER_RATIO))
    inset = border / 2
    draw.ellipse(
        [inset, inset, size - inset, size - inset],
        fill=BG,
        outline=BORDER,
        width=border,
    )

    # Checkmark
    scale = size / 64
    stroke = max(2, int(size * STROKE_RATIO))
    pts_scaled = [(x * scale, y * scale) for x, y in CHECK_POINTS]

    # Line segments
    for (x1, y1), (x2, y2) in zip(pts_scaled, pts_scaled[1:]):
        draw.line([(x1, y1), (x2, y2)], fill=FG, width=stroke)

    # Round caps + joints by drawing circles at each vertex
    r = stroke // 2
    for x, y in pts_scaled:
        draw.ellipse([x - r, y - r, x + r, y + r], fill=FG)

    return img


def main() -> None:
    targets = [
        (180, "apple-touch-icon.png"),
        (192, "icon-192.png"),
        (512, "icon-512.png"),
    ]
    for size, name in targets:
        path = OUT_DIR / name
        draw_icon(size).save(path, optimize=True)
        print(f"wrote {path.name} ({size}x{size})")


if __name__ == "__main__":
    main()
