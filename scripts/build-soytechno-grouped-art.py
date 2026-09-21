#!/usr/bin/env python3
"""Build opaque, native-sharp SoyTechno grouped arts from handoff assets.

The 1440 José PNG is a 2× upscale of a 720 screenshot — too soft to crop.
This composites the original high-res files onto 2× canvases.
"""

from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

A = Path("/workspace/public/images/casos/soytechno")
OUT = A

LAV = (234, 221, 255)
PAGE = (254, 247, 255)
NAVY = (0, 25, 63)
BLUE = (0, 99, 252)
CREAM = (255, 244, 196)


def load(name, mode="RGBA"):
    return Image.open(A / name).convert(mode)


def fit(im, size, mask=True):
    w, h = size
    src = im.convert("RGBA")
    src.thumbnail((w, h), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    x = (w - src.size[0]) // 2
    y = (h - src.size[1]) // 2
    canvas.paste(src, (x, y), src if mask else None)
    return canvas


def cover(im, size, anchor="center"):
    w, h = size
    src = im.convert("RGBA")
    scale = max(w / src.size[0], h / src.size[1])
    nw, nh = max(1, int(src.size[0] * scale)), max(1, int(src.size[1] * scale))
    src = src.resize((nw, nh), Image.Resampling.LANCZOS)
    x = (nw - w) // 2
    if anchor == "top":
        y = 0
    elif anchor == "face":
        y = int((nh - h) * 0.22)
    else:
        y = (nh - h) // 2
    return src.crop((x, y, x + w, y + h))


def circle(im, d, crop=(0.5, 0.35)):
    src = cover(im, (d, d), anchor="face")
    mask = Image.new("L", (d, d), 0)
    ImageDraw.Draw(mask).ellipse((0, 0, d - 1, d - 1), fill=255)
    out = Image.new("RGBA", (d, d), (0, 0, 0, 0))
    out.paste(src, (0, 0), mask)
    return out


def rounded(im, radius):
    im = im.convert("RGBA")
    mask = Image.new("L", im.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, im.size[0] - 1, im.size[1] - 1), radius=radius, fill=255)
    out = Image.new("RGBA", im.size, (0, 0, 0, 0))
    out.paste(im, (0, 0), mask)
    return out


def paste(base, im, xy, size=None):
    layer = im.convert("RGBA")
    if size:
        layer = fit(layer, size)
    base.paste(layer, (int(xy[0]), int(xy[1])), layer)


def circuito_fill(size, invert=True, opacity=70):
    tex = cover(load("circuito.png"), size)
    if invert:
        r, g, b, a = tex.split()
        tex = Image.merge("RGBA", (Image.eval(r, lambda p: 255 - p), Image.eval(g, lambda p: 255 - p), Image.eval(b, lambda p: 255 - p), a))
    tex.putalpha(opacity)
    return tex


def white_phone(size):
    w, h = size
    im = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    pad = int(w * 0.08)
    d.rounded_rectangle((pad, int(h * 0.04), w - pad, h - int(h * 0.04)), radius=int(w * 0.14), fill=(255, 255, 255, 255))
    cx, notch_w, notch_h = w // 2, int(w * 0.18), int(h * 0.035)
    d.rounded_rectangle((cx - notch_w // 2, int(h * 0.08), cx + notch_w // 2, int(h * 0.08) + notch_h), radius=notch_h, fill=(0, 25, 63, 255))
    d.ellipse((cx - int(w * 0.04), int(h * 0.86), cx + int(w * 0.04), int(h * 0.86) + int(w * 0.08)), fill=(0, 25, 63, 255))
    return im


def iphone(screen_name, dest_h):
    frame = load("iphone-frame-02.png")
    scale = dest_h / frame.size[1]
    fw, fh = int(frame.size[0] * scale), int(dest_h)
    frame = frame.resize((fw, fh), Image.Resampling.LANCZOS)
    screen = load(screen_name)
    # inset matches the HTML IPhoneFrame
    ix, iy = int(fw * 0.036), int(fh * 0.018)
    sw, sh = fw - 2 * ix, fh - 2 * iy
    inner = cover(screen, (sw, sh))
    inner = rounded(inner, radius=int(min(sw, sh) * 0.08))
    out = Image.new("RGBA", (fw, fh), (0, 0, 0, 0))
    out.paste(inner, (ix, iy), inner)
    out.paste(frame, (0, 0), frame)
    return out


def save_rgb(im, name, fill):
    rgb = Image.new("RGB", im.size, fill)
    rgb.paste(im, mask=im.split()[-1] if im.mode == "RGBA" else None)
    dest = OUT / name
    rgb.save(dest, "PNG", compress_level=1)
    print(f"{name:36} {rgb.size[0]:4}x{rgb.size[1]:<4} {dest.stat().st_size/1024:7.1f}KB")


def build_hero():
    # Display ~560px; 2.5× source stays sharp on retina.
    S = 2.5
    W, H = int(440 * S), int(508 * S)
    im = Image.new("RGBA", (W, H), (*LAV, 255))

    navy_xy, navy_wh = (int(36 * S), int(118 * S)), (int(272 * S), int(272 * S))
    navy = Image.new("RGBA", navy_wh, (0, 25, 63, 255))
    overlay = circuito_fill(navy_wh, invert=True, opacity=28)
    navy.paste(overlay, (0, 0), overlay)
    logo = fit(load("soytechno-logo-white.png"), (int(navy_wh[0] * 0.78), int(navy_wh[1] * 0.22)))
    paste(navy, logo, ((navy_wh[0] - logo.size[0]) // 2, (navy_wh[1] - logo.size[1]) // 2))
    im.paste(rounded(navy, int(28 * S)), navy_xy, rounded(navy, int(28 * S)))

    photo_d = int(168 * S)
    photo = circle(load("lifestyle-f.jpg", "RGB"), photo_d)
    # white ring
    ring = Image.new("RGBA", (photo_d + 16, photo_d + 16), (0, 0, 0, 0))
    ImageDraw.Draw(ring).ellipse((0, 0, photo_d + 15, photo_d + 15), fill=(255, 255, 255, 255))
    ring.paste(photo, (8, 8), photo)
    paste(im, ring, (int(150 * S), int(28 * S)))

    paste(im, load("cashea-badge.png"), (int(48 * S), int(16 * S)), (int(86 * S), int(86 * S)))
    paste(im, load("delivery-icon-3.png"), (int(310 * S), int(42 * S)), (int(72 * S), int(72 * S)))
    paste(im, white_phone((int(78 * S), int(140 * S))), (int(18 * S), int(300 * S)))
    paste(im, load("lifestyle-1.png"), (int(148 * S), int(330 * S)), (int(128 * S), int(128 * S)))
    paste(im, load("lifestyle-i.png"), (int(286 * S), int(348 * S)), (int(108 * S), int(108 * S)))
    save_rgb(im, "soytechno-hero-art@2x.png", LAV)


def build_desafio():
    S = 2
    W, H = 1132 * S, 1152 * S
    im = Image.new("RGBA", (W, H), (*LAV, 255))

    # Blue logo card — top right
    bw, bh = 512 * S, 236 * S
    blue = Image.new("RGBA", (bw, bh), (*BLUE, 255))
    blue.paste(circuito_fill((bw, bh), invert=True, opacity=50), (0, 0), circuito_fill((bw, bh), invert=True, opacity=50))
    badge = circle(load("website-capture-01.png"), int(148 * S))
    paste(blue, badge, ((bw - badge.size[0]) // 2, (bh - badge.size[1]) // 2))
    im.paste(rounded(blue, 24 * S), (640 * S, 36 * S), rounded(blue, 24 * S))

    # Laptop cream + catalog
    lw, lh = 620 * S, 430 * S
    cream = Image.new("RGBA", (lw, lh), (*CREAM, 255))
    catalog = fit(load("rectangle-147-catalog.png"), (lw - 28 * S, lh - 28 * S))
    paste(cream, catalog, ((lw - catalog.size[0]) // 2, (lh - catalog.size[1]) // 2))
    im.paste(rounded(cream, 28 * S), (36 * S, 680 * S), rounded(cream, 28 * S))

    # Appliances navy
    aw, ah = 432 * S, 360 * S
    apps = Image.new("RGBA", (aw, ah), (*NAVY, 255))
    apps.paste(circuito_fill((aw, ah), invert=True, opacity=50), (0, 0), circuito_fill((aw, ah), invert=True, opacity=50))
    for file, box in [
        ("electrodomesticos-01.png", (int(0.06 * aw), int(0.28 * ah), int(0.26 * aw), int(0.62 * ah))),
        ("electrodomesticos-02.png", (int(0.30 * aw), int(0.16 * ah), int(0.42 * aw), int(0.74 * ah))),
        ("electrodomesticos-03.png", (int(0.70 * aw), int(0.28 * ah), int(0.24 * aw), int(0.62 * ah))),
    ]:
        x, y, w, h = box
        paste(apps, load(file), (x, y), (w, h))
    im.paste(rounded(apps, 28 * S), (680 * S, 760 * S), rounded(apps, 28 * S))

    # Phone overlapping
    phone = iphone("iphone-frame-01.png", 520 * S)
    paste(im, phone, (760 * S, 300 * S))

    save_rgb(im, "soytechno-desafio-art@2x.png", LAV)


def build_logistica():
    S = 2
    W, H = 720 * S, 800 * S
    im = Image.new("RGBA", (W, H), (*PAGE, 255))

    banner = fit(load("rectangle-144.jpg", "RGB"), (240 * S, 150 * S))
    paste(im, banner, ((W - banner.size[0]) // 2, 8 * S))

    imac = load("rectangle-148.png")
    imac = fit(imac, (620 * S, 560 * S))
    # screen into iMac
    screen = cover(load("rectangle-146.png"), (int(imac.size[0] * 0.90), int(imac.size[1] * 0.46)), anchor="top")
    sx, sy = int(imac.size[0] * 0.05), int(imac.size[1] * 0.032)
    imac.paste(screen, (sx, sy), screen if screen.mode == "RGBA" else None)
    paste(im, imac, ((W - imac.size[0]) // 2, 170 * S))
    save_rgb(im, "soytechno-logistica-art@2x.png", PAGE)


def build_phones():
    # 2× of the 1200-wide Figma strip
    H = 1520
    phones = [
        iphone("mobile-screen-04.png", H),
        iphone("mobile-screen-01.png", H),
        iphone("mobile-screen-02.png", H),
        iphone("mobile-screen-03.png", H),
    ]
    gap = 48
    peek = int(phones[0].size[0] * 0.18)
    widths = [peek] + [p.size[0] for p in phones[1:]]
    W = sum(widths) + gap * 3 + 40
    im = Image.new("RGBA", (W, H + 40), (*PAGE, 255))
    x = 20
    # first phone: right-peek only
    first = phones[0]
    im.paste(first, (20 - (first.size[0] - peek), 20), first)
    x = 20 + peek + gap
    for p in phones[1:]:
        im.paste(p, (x, 20), p)
        x += p.size[0] + gap
    save_rgb(im, "soytechno-phones-strip@2x.png", PAGE)


def build_wizard():
    screen = load("ipad-mockup-01.png")
    # keep screen native-ish; wrap a crisp bezel
    sw, sh = screen.size
    pad = 36
    bezel = 28
    W, H = sw + (pad + bezel) * 2, sh + (pad + bezel) * 2 + 20
    im = Image.new("RGBA", (W, H), (*PAGE, 255))
    # device body
    body = Image.new("RGBA", (sw + bezel * 2, sh + bezel * 2 + 8), (0, 0, 0, 0))
    d = ImageDraw.Draw(body)
    d.rounded_rectangle((0, 0, body.size[0] - 1, body.size[1] - 1), radius=48, fill=(10, 12, 16, 255))
    # screen
    scr = rounded(screen, 18)
    body.paste(scr, (bezel, bezel), scr)
    # camera
    cx = body.size[0] // 2
    d.ellipse((cx - 6, 12, cx + 6, 24), fill=(40, 44, 52, 255))
    paste(im, body, ((W - body.size[0]) // 2, (H - body.size[1]) // 2))
    save_rgb(im, "soytechno-wizard-ipad.png", PAGE)


if __name__ == "__main__":
    build_hero()
    build_desafio()
    build_logistica()
    build_phones()
    build_wizard()
