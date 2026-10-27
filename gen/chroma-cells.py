#!/usr/bin/env python3
"""Cut a GREEN-SCREEN character sheet of Fred's into named cells.

Oct 27: his angel sheet (white robes, silver hair, white wings, silver halos) could not
be lifted off cream paper by brightness — gen/cut-cells.py kept only the faces. Fred
re-sent it on a green screen, which makes the job pure chroma:

  · alpha  = how far a pixel is from being "background green" (g above both r and b)
  · spill  = green bounced onto a white edge is clamped back (g <= max(r, b)), so robes and
             hair stay neutral silver instead of picking up a green rim
  · figures are split by connected component, left to right; a part that floats free of its
    body (a HALO above the hair) joins the nearest figure

  python3 gen/chroma-cells.py <sheet> <outdir> name1 name2 ...      → <outdir>/kid-<name>.webp
"""
import sys, os
import numpy as np
from PIL import Image, ImageFilter
from collections import deque

src, outdir, names = sys.argv[1], sys.argv[2], sys.argv[3:]
A = np.asarray(Image.open(src).convert('RGB')).astype(np.float32)
H, W, _ = A.shape
r, g, b = A[..., 0], A[..., 1], A[..., 2]
green = g - np.maximum(r, b)                       # ~170 on the screen, <= ~10 on the figures
LO, HI = float(os.environ.get('LO', 28)), float(os.environ.get('HI', 110))
alpha = 1 - np.clip((green - LO) / (HI - LO), 0, 1)
# despill: no pixel of a figure is greener than its own red/blue allow
D = A.copy()
D[..., 1] = np.minimum(g, np.maximum(r, b) + 4)

fig = alpha > 0.5
lab = np.zeros((H, W), np.int32); n = 0; sizes = {}
for y0, x0 in zip(*np.where(fig)):
    if lab[y0, x0]:
        continue
    n += 1; lab[y0, x0] = n; q = deque([(y0, x0)]); c = 1
    while q:
        y, x = q.popleft()
        for dy in (-1, 0, 1):
            for dx in (-1, 0, 1):
                ny, nx = y + dy, x + dx
                if 0 <= ny < H and 0 <= nx < W and fig[ny, nx] and not lab[ny, nx]:
                    lab[ny, nx] = n; q.append((ny, nx)); c += 1
    sizes[n] = c
big = sorted([k for k, v in sizes.items() if v > 4000], key=lambda k: np.where(lab == k)[1].mean())
print('figures:', len(big), [sizes[k] for k in big])
keep = {k: (lab == k) for k in big}
for k, v in sizes.items():
    if k in big or v < 40:
        continue
    ys, xs = np.where(lab == k); cy, cx = ys.mean(), xs.mean()
    best, bd = None, 1e9
    for bb in big:
        by, bx = np.where(keep[bb])
        d = np.min((by - cy) ** 2 + (bx - cx) ** 2)
        if d < bd:
            best, bd = bb, d
    if bd < 60 ** 2:
        keep[best] |= (lab == k)
os.makedirs(outdir, exist_ok=True)
for name, k in zip(names, big):
    m = keep[k]
    # grow the figure's region a few px so its soft (part-green) edge comes with it, then let alpha decide
    reg = np.asarray(Image.fromarray((m * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(7))) > 0
    ys, xs = np.where(reg); pad = 2
    y0, y1, x0, x1 = max(0, ys.min() - pad), min(H, ys.max() + 1 + pad), max(0, xs.min() - pad), min(W, xs.max() + 1 + pad)
    a = (alpha * reg)[y0:y1, x0:x1]
    out = np.dstack([np.clip(D[y0:y1, x0:x1], 0, 255), a * 255]).astype(np.uint8)
    Image.fromarray(out).save(os.path.join(outdir, 'kid-%s.webp' % name), quality=94, method=6)
    print('  kid-%-12s %dx%d' % (name, x1 - x0, y1 - y0))
