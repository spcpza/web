#!/usr/bin/env python3
"""Strip the paper that survives at the edge of a cut cell.

Fred: "i can still see remnants of the background cropping. some white from the
sprite background leaked."  He is right, and it is visible on any dark plate as a
fine dotted PALE FRINGE lying just outside his ink outline — the last row or two
of sheet paper that the cutter's threshold kept, plus the colour bleed inside the
feathered alpha, which composites as a white halo however correct the alpha is.

Two jobs, and they are different:

  1 · REMOVE the paper pixels.  A pixel on the rim is paper when it is markedly
      LIGHTER and less coloured than the drawing just inside it.  Judging it
      against a reference taken from the interior is what keeps this from eating
      the cell's own pale parts — his white socks and the bread are pale too, but
      they are pale all the way in, so they have no lighter neighbour to betray
      them.

  2 · DECONTAMINATE the colour under the feather.  Semi-transparent pixels keep
      whatever RGB they were cut with, and if that is paper they glow white when
      composited no matter what the alpha says.  Their colour is replaced with the
      drawing's own, so the feather fades the FIGURE out, not the sheet.

⚠ Non-destructive: the first run copies each cell to cast/.orig/ and every later
run re-reads from there, so this can be re-tuned without compounding.

  python3 gen/clean-edges.py            # every cast/kid-*.webp
  python3 gen/clean-edges.py welcome    # just these
"""
import sys, os, glob, shutil
import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CAST = os.path.join(ROOT, 'cast')
ORIG = os.path.join(CAST, '.orig')

def shifts(m):
    for dy, dx in ((1,0),(-1,0),(0,1),(0,-1),(1,1),(1,-1),(-1,1),(-1,-1)):
        yield np.roll(np.roll(m, dy, 0), dx, 1)

def erode(mask, n):
    m = mask.copy()
    for _ in range(n):
        acc = m.copy()
        for s in shifts(m): acc &= s
        m = acc
    return m

def clean(path, out_path):
    im = Image.open(path).convert('RGBA')
    a = np.asarray(im).astype(np.float32)
    h, w, _ = a.shape
    R, G, B, A = a[...,0], a[...,1], a[...,2], a[...,3]
    L = R*0.299 + G*0.587 + B*0.114
    solid = A > 200
    deep  = erode(solid, 3)                       # safely inside the drawing
    if deep.sum() < 500:
        shutil.copy(path, out_path); return 0, 0

    # ── the drawing's own colour, grown outward from the interior ──────────────
    known = deep.copy()
    ref = np.stack([np.where(known, R, 0), np.where(known, G, 0), np.where(known, B, 0)], -1)
    for _ in range(8):
        nxt = known.copy(); acc = np.zeros_like(ref); cnt = np.zeros((h, w), np.float32)
        for dy, dx in ((1,0),(-1,0),(0,1),(0,-1)):
            ks = np.roll(np.roll(known, dy, 0), dx, 1)
            rs = np.roll(np.roll(ref, dy, 0), dx, 1)
            acc += np.where(ks[...,None], rs, 0); cnt += ks
        fill = (~known) & (cnt > 0)
        for c in range(3):
            ref[...,c] = np.where(fill, acc[...,c]/np.maximum(cnt,1), ref[...,c])
        known = known | fill
    refL = ref[...,0]*0.299 + ref[...,1]*0.587 + ref[...,2]*0.114

    # ── 1 · the paper on the rim ──────────────────────────────────────────────
    # ⚠ NOT "pixels that look like paper". Reading the values across a hood edge shows
    # why a brightness test fails: the leak is a pale GREY-BLUE at luma 78..182 — paper
    # already mixed with the drawing's own shadow — so no threshold separates it from
    # the cloth without eating the cloth.
    #   What does separate them is STRUCTURE. Every cell of Fred's is bounded by a dark
    # ink contour, and the leak always lies OUTSIDE it: transparent, then one or two pale
    # low-chroma pixels, then the ink line, then the drawing. So paper is not a colour, it
    # is "solid, but reachable from the outside without crossing the ink" — the same
    # reachability idea the cutter already uses on the sheet, applied at the outline.
    #   Bounded to two pixels, so a place where his outline is thin or open cannot let it
    # run inward, and gated on low chroma, so a saturated edge of cloth is never eaten.
    chroma = np.maximum(np.abs(R-G), np.abs(G-B))
    ink = solid & (L < 70)
    paper = np.zeros_like(solid)
    frontier = ~solid
    for _ in range(2):
        nb = np.zeros_like(solid)
        for s in shifts(frontier): nb |= s
        nb &= solid & ~ink & ~paper & (chroma < 34)
        if not nb.any(): break
        paper |= nb
        frontier = nb
    # ── 1b · AND THE FLECKS THAT SIT *IN* THE OUTLINE ─────────────────────────
    # Fred, on the curly child: "i still see very little white background here. let's be
    # very detailed about this."  What was left is a scatter of one- and two-pixel pale
    # dots lying along the edge of her hair. The structural rule above cannot reach them:
    # it walks inward from the transparent side and stops after two steps, and these sit
    # in the little bays between locks where the walk is blocked or already spent.
    #   The test the docstring at the top describes — and which was never actually coded —
    # catches them: a pixel is paper when it is markedly LIGHTER AND LESS COLOURED THAN THE
    # DRAWING JUST INSIDE IT. `ref` above already holds the drawing's own colour grown out
    # from the interior, so the margin is free. A fleck in her hair is luma 240 against a
    # reference of ~100; her cheek at the same distance from the edge is 215 against 210,
    # and the bread and the socks are pale ALL THE WAY IN, so none of them has a lighter
    # neighbour to betray them. That is the whole reason this is safe where a plain
    # brightness threshold is not.
    # ⚠ kept within 4px of the outside, so nothing in the middle of a face is ever eligible.
    near = np.zeros_like(solid)
    frontier2 = ~solid
    for _ in range(4):
        nb2 = np.zeros_like(solid)
        for s in shifts(frontier2): nb2 |= s
        nb2 &= solid & ~near
        if not nb2.any(): break
        near |= nb2
        frontier2 = nb2
    flecks = near & (L - refL > 46) & (chroma < 40) & (L > 170)
    paper |= flecks

    A2 = np.where(paper, 0.0, A)

    # ── 2 · the colour under the feather ──────────────────────────────────────
    feather = (A2 > 0) & (A2 < 250)
    out = a.copy()
    for c in range(3):
        out[...,c] = np.where(feather, ref[...,c], a[...,c])
    out[...,3] = A2
    Image.fromarray(out.astype(np.uint8), 'RGBA').save(out_path, 'WEBP', quality=95, method=6)
    return int(paper.sum()), int(feather.sum())

def main():
    os.makedirs(ORIG, exist_ok=True)
    names = sys.argv[1:]
    # ⚠⚠ THIS IS NOT IDEMPOTENT, AND THE SAFETY NET IS THE .orig CACHE. Measured: cleaning an
    # already-cleaned cell strips a further 195 pixels off it, and it will do that again every
    # time. The cache is what stops it — each run re-reads the RAW CUT — but a cell whose
    # .orig copy is missing gets its already-cleaned file adopted as the baseline, and from
    # then on every run eats another rim.
    #   Sep 1: I ran `rm -rf cast/.orig` to force four re-cut cells through cleanly, and took
    # the originals for every OTHER cell with it. `cast/` is not in git, so they are simply
    # gone. So the bare form — clean every cell — is refused: after a re-cut, name the cells
    # you re-cut. Nothing else needs cleaning twice.
    if not names:
        print('clean-edges: name the cells to clean, e.g. `python3 gen/clean-edges.py sit-take`.\n'
              '  Cleaning every cell would re-clean cells whose .orig baseline no longer exists,\n'
              '  and each pass eats another pixel off the rim. See the note in main().')
        return
    files = [os.path.join(CAST, 'kid-%s.webp' % n) for n in names]
    for f in files:
        base = os.path.basename(f)
        src = os.path.join(ORIG, base)
        if not os.path.exists(src): shutil.copy(f, src)   # keep the cut as it was
        p, d = clean(src, f)
        print('  %-26s paper removed %5d   feather decontaminated %5d' % (base, p, d))

main()
