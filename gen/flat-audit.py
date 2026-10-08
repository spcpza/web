#!/usr/bin/env python3
"""
FLAT-FILL AUDIT — find fills that are acting as SURFACES.

    python3 gen/flat-audit.py                 # every page of the book
    python3 gen/flat-audit.py comes nonight   # named plates

WHY THIS EXISTS
  Sep 6, 2026. Fred, on the far ridge of `comes`, after I had "fixed" it by changing its
  colour: "maybe that is not the problem. the problem is that the ground looks just like
  painting everything 1 block of color instead of painting."
  He was right. That ridge was an SVG <path> FILL — one flat area of colour with a drawn edge
  — in a picture where everything else is thousands of visible brush marks. It did not matter
  what colour it was: a filled shape among painted ones reads as COLOURED IN, and the eye
  catches that instantly even when it cannot name it.
  A fill is only ever allowed to be a FLOOR: deeper in value than the paint that goes over it,
  so gaps read as depth. The moment the strokes are too sparse to cover it, the fill IS the
  picture there — and it is a different medium from the rest of the plate.

HOW IT MEASURES
  A painted region has texture at BRUSH scale; a filled one does not, however good its colour
  or its gradient. So: local variation over small blocks, then the biggest connected run of
  near-zero blocks, as a fraction of the plate.

  ⚠ SCALE IS EVERYTHING. The first cut measured 10px blocks on the @2x rasters — 2.5 plate
  units, i.e. INSIDE a single brush mark — and reported every plate as 96% flat. A mark here
  is ~2-4 units wide and 5-15 long, so the window must be ~8 PLATE UNITS to contain several.
  Every plate is normalised to 800x500 (1px = 1 plate unit) first.

  ⚠ AND A DARK PAGE IS NOT A FLAT PAGE. Absolute std punishes every nocturne — on near-black
  ground real marks differ by two or three levels. The measure is local sd / (local mean + 8),
  which is fair to `lost` and `paid` as well as to `gift`.

READING THE OUTPUT
  Numbers rank candidates; they do not convict. Crop the flagged box and LOOK before changing
  anything (see the `look-before-fixing` memory — two reverts in one day came from inferring
  art defects out of code). On the Sep 6 run the top six were all deliberate quiet passages —
  `comes` was the only real case, and it scored 3.9% once fixed.
"""
import sys, numpy as np
from PIL import Image
from pathlib import Path

BLK  = 8       # plate units per block — must be a few brush marks wide
FLAT = 0.035   # local contrast below this = no brush texture in that block
MIN  = 0.012   # ignore flat regions under this fraction of the plate

PAGES = ("beginning born bread bridge candle come comes family flame garden gift grave hands "
         "light looking lost love made nonight paid prayer ran risen road seeds storm string "
         "together turning twoways washed word").split()

def _blocks(a, b=BLK):
    h, w = a.shape; h -= h % b; w -= w % b
    return a[:h, :w].reshape(h//b, b, w//b, b).swapaxes(1, 2).reshape(h//b, w//b, b*b)

def _components(mask):
    H, W = mask.shape; seen = np.zeros_like(mask, bool); out = []
    for sy in range(H):
        for sx in range(W):
            if not mask[sy, sx] or seen[sy, sx]: continue
            st = [(sy, sx)]; seen[sy, sx] = True; cells = []
            while st:
                y, x = st.pop(); cells.append((y, x))
                for dy, dx in ((1,0), (-1,0), (0,1), (0,-1)):
                    ny, nx = y+dy, x+dx
                    if 0 <= ny < H and 0 <= nx < W and mask[ny, nx] and not seen[ny, nx]:
                        seen[ny, nx] = True; st.append((ny, nx))
            out.append(cells)
    return out

def audit(path):
    im = Image.open(path).convert('L').resize((800, 500), Image.LANCZOS)
    b = _blocks(np.asarray(im).astype(np.float32))
    rel = b.std(axis=2) / (b.mean(axis=2) + 8.0)
    flat = rel < FLAT
    keep = []
    for c in sorted(_components(flat), key=len, reverse=True)[:3]:
        if len(c) / flat.size < MIN: break
        ys = [p[0] for p in c]; xs = [p[1] for p in c]
        keep.append((len(c)/flat.size,
                     (min(xs)*BLK, min(ys)*BLK, (max(xs)+1)*BLK, (max(ys)+1)*BLK)))
    return keep, flat.mean(), rel.mean()

def main(names):
    root = Path(__file__).resolve().parent.parent / 'plates-vg'
    rows = []
    for n in names:
        p = root / f'{n}.jpg'
        if not p.exists():
            print(f'  (no plate: {n})'); continue
        keep, ff, rc = audit(p)
        rows.append((keep[0][0] if keep else 0, ff, rc, n, keep))
    rows.sort(reverse=True)
    print(f"{'page':<12} {'biggest flat region':>20} {'flat%':>7} {'rel.contrast':>13}   where (x0,y0,x1,y1)")
    for big, ff, rc, n, keep in rows:
        where = ' | '.join(str(b) for _, b in keep) if keep else '-'
        print(f"{n:<12} {big*100:>19.1f}% {ff*100:>6.1f}% {rc:>13.3f}   {where}")
    print("\n  Numbers rank candidates, they do not convict. Crop the box and LOOK before editing.")

if __name__ == '__main__':
    main(sys.argv[1:] or PAGES)
