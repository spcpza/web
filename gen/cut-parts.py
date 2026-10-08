"""CUTOUT RIG — split Fred's artwork into parts so it can be ANIMATED.

Fred: "the purpose of me giving this is so that you can recreate the avatar and
make it do whatever you like the kid to do… find a way on the internet to animate
a character."

The answer the field settled on long ago is CUTOUT (skeletal) animation, which is
what Spine, DragonBones and Rive all do: you do not redraw the character, you cut
the artwork into parts — head, torso, arms, paws — hang each on a joint, and
animate the joints. His drawing survives untouched; only the pieces move.

This cuts the painted front figure into those parts and records each part's pivot
(its joint) normalised to his height, so the runtime can pose him.
"""
import json
import numpy as np
from PIL import Image, ImageFilter

sheet = Image.open('cast/sheet-painted.png').convert('RGBA')
A = np.asarray(sheet)
al = A[:, :, 3]
on = al > 24

def bands(flags, min_len):
    out, cur = [], None
    for i, v in enumerate(flags):
        if v and cur is None: cur = i
        elif not v and cur is not None:
            if i - cur >= min_len: out.append((cur, i))
            cur = None
    if cur is not None and len(flags) - cur >= min_len: out.append((cur, len(flags)))
    return out

rows = bands(on.sum(axis=1) > 6, int(sheet.height * 0.06))
y0, y1 = rows[0]
cols = bands((on[y0:y1].sum(axis=0) > 4), int(sheet.width * 0.02))
x0, x1 = cols[0]                                     # the FRONT figure
fig = sheet.crop((x0, y0, x1, y1))
FW, FH = fig.size
cx = FW / 2
print('front figure %dx%d' % (FW, FH))

def piece(name, mask_fn, pivot):
    """cut one part: everything inside mask_fn, feathered, with its pivot recorded"""
    m = Image.new('L', (FW, FH), 0)
    mask_fn(m)
    m = m.filter(ImageFilter.GaussianBlur(1.2))
    part = fig.copy()
    a2 = np.asarray(part.split()[3]).astype(float) * (np.asarray(m).astype(float) / 255.0)
    part.putalpha(Image.fromarray(a2.astype('uint8'), 'L'))
    bb = part.split()[3].getbbox()
    if not bb: print('  !! empty', name); return None
    part = part.crop(bb)
    part.save('cast/part-%s.webp' % name, quality=88, method=6)
    # pivot, in the PART's own pixels, and the part's offset from the figure's origin
    return {
        'file': 'part-%s.webp' % name,
        'w': round(part.width / FH, 4), 'h': round(part.height / FH, 4),
        'x': round((bb[0] - cx) / FH, 4), 'y': round(bb[1] / FH, 4),
        'px': round((pivot[0] - bb[0]) / part.width, 4),
        'py': round((pivot[1] - bb[1]) / part.height, 4),
    }

from PIL import ImageDraw
def rect(m, x_a, y_a, x_b, y_b):
    ImageDraw.Draw(m).rectangle([x_a * FH + cx, y_a * FH, x_b * FH + cx, y_b * FH], fill=255)

# his measured landmarks (fractions of height, x from centre)
SH = 0.44         # shoulder line
HEM = 0.90
ARM_IN = 0.135    # where a sleeve leaves the body
parts = {}
parts['head']  = piece('head',  lambda m: rect(m, -0.30, -0.02, 0.30, SH + 0.03), (cx, SH * FH))
parts['torso'] = piece('torso', lambda m: rect(m, -ARM_IN - 0.02, SH - 0.02, ARM_IN + 0.02, HEM + 0.04), (cx, SH * FH))
# ⚠ CUT THE SLEEVE, NOT A RECTANGLE. A box cut leaves a squared-off slab at the shoulder,
# and the moment the arm lifts it reads as a plank nailed to his side. The sleeve is rounded
# where it meets the body, so the cut is too: a capsule down the arm's own line.
def sleeve(m, sgn):
    dr = ImageDraw.Draw(m)
    x_top = cx + sgn * (ARM_IN + 0.03) * FH
    x_bot = cx + sgn * 0.245 * FH
    r_top, r_bot = 0.070 * FH, 0.062 * FH
    steps = 22
    for i in range(steps + 1):
        t = i / steps
        px = x_top + (x_bot - x_top) * t
        py = (SH + 0.055) * FH + (0.79 - SH - 0.055) * FH * t
        rr = r_top + (r_bot - r_top) * t
        dr.ellipse([px - rr, py - rr, px + rr, py + rr], fill=255)

parts['armL']  = piece('armL',  lambda m: sleeve(m, -1), (cx - (ARM_IN + 0.03) * FH, (SH + 0.055) * FH))
parts['armR']  = piece('armR',  lambda m: sleeve(m, 1),  (cx + (ARM_IN + 0.03) * FH, (SH + 0.055) * FH))
parts['footL'] = piece('footL', lambda m: rect(m, -0.22, 0.85, -0.01, 1.02), (cx - 0.10 * FH, 0.88 * FH))
parts['footR'] = piece('footR', lambda m: rect(m, 0.01, 0.85, 0.22, 1.02), (cx + 0.10 * FH, 0.88 * FH))

out = {'height_px': FH, 'shoulder': SH, 'hem': HEM, 'parts': parts}
open('cast/kid-parts.json', 'w').write(json.dumps(out, indent=1))
for k, v in parts.items():
    if v: print('  %-6s %sx%s  at (%.3f, %.3f)  pivot (%.2f, %.2f)' % (k, v['w'], v['h'], v['x'], v['y'], v['px'], v['py']))
print('→ cast/kid-parts.json')
