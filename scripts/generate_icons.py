"""
Generate PWA app icons for The List.

Why drawn natively in Pillow (not converted from SVG): cairosvg pulls in
cairocffi, which on this Mac hits the documented x86_64/arm64 mismatch
from CLAUDE.md. Drawing the icon natively sidesteps the whole issue.

Design:
  - Near-black rounded square (#0a0a0a) to match app's dark-mode surface.
    Stays readable on light home screens, blends naturally on dark ones.
  - White checkmark (#fafafa) scaled from the same 64-unit SVG path as
    favicon.svg so the browser tab and the home-screen icon feel related.
  - Corners are pre-rounded. iOS will round again; Android may mask to a
    circle — both cases still look fine because the corner area is just
    background color.

Rerun:
    python3 scripts/generate_icons.py

Safe to delete after the PNGs are in the repo; this file is a scaffold
tool, not a runtime dependency.
"""

from pathlib import Path
from PIL import Image, ImageDraw

# Checkmark geometry in a 64-unit canvas (matches favicon.svg)
CHECK_POINTS = [(16, 33), (28, 45), (49, 21)]
BG = (10, 10, 10, 255)        # --ink from CSS
FG = (250, 250, 250, 255)     # --surface from CSS
CORNER_RADIUS_RATIO = 0.22    # iOS-ish rounded-rect ratio
STROKE_RATIO = 0.095          # matches favicon stroke weight (~7/64)

OUT_DIR = Path(__file__).resolve().parent.parent


def draw_icon(size: int) -> Image.Image:
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Background
    radius = int(size * CORNER_RADIUS_RATIO)
    draw.rounded_rectangle([0, 0, size, size], radius=radius, fill=BG)

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
