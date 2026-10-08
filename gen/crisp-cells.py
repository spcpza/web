#!/usr/bin/env python3
"""gen/crisp-cells.py — make the CUT EDGE of Fred's cast cells crisp, never the drawing.

Fred, Sep 26: "the edges of the character is very bad… check all of the character's edges and make sure it
is crisp!" At phone density the kid is shown at ~1:1 with his cell (the source sheets are 1792x1008 — there is
no sharper original to recut from), so the cutter's ragged alpha edge — chewed fingers, 1-px nicks, stair-steps,
loose specks of ink or paper floating just outside him — is exactly what a reader sees.

This touches ONLY the band within a few pixels of the outline:
  1. the alpha is lightly blurred and re-thresholded with a smooth ramp — specks too small to be part of him
     fall below the threshold and vanish, 1-px nicks fill, stair-steps become one clean anti-aliased contour;
  2. every pixel whose coverage changed (or was already partial) takes its colour from the drawing right beside
     it (an opacity-weighted average of the solid pixels around it), so no paper-white or black bleeds in;
  3. everything more than 3 px inside the outline is copied back EXACTLY as he drew it.
His drawing is never regenerated (see cast_cells_pipeline: four attempts at that all failed).

Run:  python3 gen/crisp-cells.py cast/kid-joy.webp [more…]       (writes in place; back up first)
      python3 gen/crisp-cells.py --preview cast/kid-joy.webp /tmp/out.png
After re-running on shipped cells, bump kidImage's ?v= in engine/character.js.
"""
import sys
import numpy as np
from PIL import Image, ImageFilter

SIGMA = 1.3          # px — how far the edge is smoothed
CLOSE = 3            # MaxFilter→MinFilter size: fills notches the cutter bit into fingers and hood before smoothing
LO, HI = 0.40, 0.62  # the ramp the blurred coverage is re-thresholded with (a hair above ½ → no fattening)
KEEP = 7             # MinFilter size: pixels this far inside a solid run are copied back untouched

def crisp(im):
    im = im.convert('RGBA')
    a = np.asarray(im).astype(np.float32)
    rgb, al = a[..., :3], a[..., 3] / 255.0
    # 0 · paper left clinging to the OUTLINE (near-white, unsaturated) is background, not him. Only in the
    #     edge band — the whites INSIDE him (teeth, eye glints) are protected by the interior copy-back below.
    mx, mn = rgb.max(-1), rgb.min(-1)
    paper = (mn > 200) & ((mx - mn) < 26)
    # ⚠ only paper that TOUCHES THE OUTSIDE: his teeth and eye glints are white too, but enclosed by the drawing
    #   (first cut stripped the teeth and the night showed through his smile). Grow "outside" inward through
    #   paper pixels only, a few steps — a fleck on the outline is reached, an enclosed white never is.
    outside = al < 0.5
    for _ in range(4):
        grown = np.asarray(Image.fromarray(outside.astype(np.uint8) * 255).filter(ImageFilter.MaxFilter(3))) > 0
        outside = outside | (grown & paper)
    al = np.where(paper & outside, 0.0, al)
    # 1 · close the notches, then smooth coverage
    A8 = Image.fromarray((al * 255).astype(np.uint8))
    if CLOSE: A8 = A8.filter(ImageFilter.MaxFilter(CLOSE)).filter(ImageFilter.MinFilter(CLOSE))
    blur = np.asarray(A8.filter(ImageFilter.GaussianBlur(SIGMA))).astype(np.float32) / 255.0
    t = np.clip((blur - LO) / (HI - LO), 0, 1)
    new = t * t * (3 - 2 * t)
    # 3 · the solid interior stays exactly as drawn
    solid = Image.fromarray(((al > 0.98) * 255).astype(np.uint8)).filter(ImageFilter.MinFilter(KEEP))
    interior = np.asarray(solid) > 0
    new = np.where(interior, al, new)
    # 2 · colour for the edge band from the solid drawing beside it (opacity-weighted neighbour average)
    w = (al > 0.85).astype(np.float32)
    def blur3(x, r):
        return np.asarray(Image.fromarray(np.clip(x, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(r))).astype(np.float32)
    acc = np.zeros_like(rgb); wsum = np.zeros_like(al)
    for r in (1.2, 2.5, 5.0):     # widen until every edge pixel has solid neighbours to borrow from
        wb = blur3(w * 255, r) / 255.0
        cb = np.stack([blur3(rgb[..., c] * w, r) for c in range(3)], -1)
        take = (wsum < 1e-3) & (wb > 0.02)
        acc[take] = cb[take] / wb[take, None]
        wsum[take] = 1
    band = (~interior) & ((al < 0.85) | (np.abs(new - al) > 0.02))
    out_rgb = np.where(band[..., None] & (wsum[..., None] > 0), acc, rgb)
    out = np.dstack([out_rgb, new * 255]).clip(0, 255).astype(np.uint8)
    return Image.fromarray(out)

if __name__ == '__main__':
    args = sys.argv[1:]
    if args and args[0] == '--preview':
        crisp(Image.open(args[1])).save(args[2]); sys.exit(0)
    for f in args:
        src = Image.open(f)
        crisp(src).save(f, 'WEBP', lossless=True) if f.endswith('.webp') else crisp(src).save(f)
        print('crisp', f)
