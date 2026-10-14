#!/usr/bin/env python3
"""Make eShow vertical WebP assets transparent where the flat lavender fill shows."""
from __future__ import annotations

import math
import sys
from pathlib import Path

from PIL import Image

# Box fill in CSS (#eaddff) — keyed pixels become transparent so only the character shows.
BOX_RGB = (234, 217, 255)
TOLERANCE = 42


def corner_bg_rgb(im: Image.Image) -> tuple[int, int, int]:
    w, h = im.size
    pts = [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)]
    rs, gs, bs = [], [], []
    for x, y in pts:
        r, g, b = im.convert("RGB").getpixel((x, y))
        rs.append(r)
        gs.append(g)
        bs.append(b)
    return (sum(rs) // 4, sum(gs) // 4, sum(bs) // 4)


def dist(a: tuple[int, int, int], b: tuple[int, int, int]) -> float:
    return math.sqrt(sum((x - y) ** 2 for x, y in zip(a, b)))


def key_to_alpha(path: Path, out: Path) -> None:
    im = Image.open(path).convert("RGBA")
    bg = corner_bg_rgb(im)
    px = im.load()
    w, h = im.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a == 0:
                continue
            rgb = (r, g, b)
            if dist(rgb, bg) <= TOLERANCE or dist(rgb, BOX_RGB) <= TOLERANCE:
                px[x, y] = (r, g, b, 0)
    out.parent.mkdir(parents=True, exist_ok=True)
    im.save(out, "WEBP", lossless=False, quality=92, method=6)


def main() -> int:
    root = Path(__file__).resolve().parents[1] / "public" / "images" / "blog"
    names = [
        "eshow-madrid-2026-cabecera.webp",
        "eshow-madrid-2026-fig1.webp",
        "eshow-madrid-2026-programa.webp",
    ]
    for name in names:
        src = root / name
        if not src.exists():
            print(f"missing {src}", file=sys.stderr)
            return 1
        key_to_alpha(src, src)
        print(f"keyed {src}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
