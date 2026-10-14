#!/usr/bin/env python3
"""Export eShow vertical WebPs from design sources with flood-filled lavender backgrounds."""
from __future__ import annotations

import math
from collections import deque
from pathlib import Path

from PIL import Image

BOX_RGB = (234, 217, 255)
TOLERANCE = 36
UPLOADS = Path('/home/ubuntu/.cursor/projects/workspace/uploads')
OUT = Path(__file__).resolve().parents[1] / 'public' / 'images' / 'blog'

EXPORTS = {
    'eshow-madrid-2026-cabecera.webp': UPLOADS / '01-cabecera-fan-presentando-w4MaKJT7EI_e4d2.png',
    'eshow-madrid-2026-fig1.webp': UPLOADS / '04-fig1-fan-paquete-WDFgNBncXe_ab04.jpg',
    'eshow-madrid-2026-programa.webp': UPLOADS / '06-fig2-fan-portatil-w4MaK9e7EI_9b18.jpg',
}


def dist(a: tuple[int, int, int], b: tuple[int, int, int]) -> float:
    return math.sqrt(sum((x - y) ** 2 for x, y in zip(a, b)))


def corner_bg_rgb(im: Image.Image) -> tuple[int, int, int]:
    w, h = im.size
    pts = [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)]
    rs, gs, bs = [], [], []
    for x, y in pts:
        r, g, b = im.convert('RGB').getpixel((x, y))
        rs.append(r)
        gs.append(g)
        bs.append(b)
    return (sum(rs) // 4, sum(gs) // 4, sum(bs) // 4)


def is_background(rgb: tuple[int, int, int], bg: tuple[int, int, int]) -> bool:
    return dist(rgb, bg) <= TOLERANCE or dist(rgb, BOX_RGB) <= TOLERANCE


def flood_transparent(im: Image.Image) -> Image.Image:
    rgb_im = im.convert('RGB')
    bg = corner_bg_rgb(rgb_im)
    w, h = rgb_im.size
    rgba = im.convert('RGBA')
    px = rgba.load()
    visited = bytearray(w * h)
    q: deque[tuple[int, int]] = deque()

    def push(x: int, y: int) -> None:
        idx = y * w + x
        if visited[idx]:
            return
        if not is_background(rgb_im.getpixel((x, y)), bg):
            return
        visited[idx] = 1
        q.append((x, y))

    for x in range(w):
        push(x, 0)
        push(x, h - 1)
    for y in range(h):
        push(0, y)
        push(w - 1, y)

    while q:
        x, y = q.popleft()
        r, g, b, _a = px[x, y]
        px[x, y] = (r, g, b, 0)
        if x > 0:
            push(x - 1, y)
        if x + 1 < w:
            push(x + 1, y)
        if y > 0:
            push(x, y - 1)
        if y + 1 < h:
            push(x, y + 1)

    return rgba


def export_pair(name: str, src: Path) -> None:
    if not src.exists():
        raise FileNotFoundError(src)
    out = OUT / name
    keyed = flood_transparent(Image.open(src))
    out.parent.mkdir(parents=True, exist_ok=True)
    keyed.save(out, 'WEBP', lossless=True, method=6)
    print(f'wrote {out} from {src.name}')


def main() -> None:
    for name, src in EXPORTS.items():
        export_pair(name, src)


if __name__ == '__main__':
    main()
