#!/usr/bin/env python3
"""gen/page-colors.py — the journey strip and the scrims, measured from the paintings.

index.html carries two per-page colour tables:
  PAGE_LIGHT  the journey strip: each mark wears its own page's colour, so the reader can
              see the arc (dark -> the resurrection -> the light) in the interface itself
  PAGE_DARK   the scrim under the poem: each page darkens with ITS OWN deepest bottom-band
              colour, so the poem sits in a shadow the picture already had

⚠ Both were pasted in by hand from one measurement in August. Found Sep 21: they held 32
entries for a 33-page book and sat ONE PAGE OFF, so every page wore its neighbour's colours
(and the strip showed the resurrection a page early) — and the book has been repainted
twice since they were measured. A table keyed by position rots the moment a page moves.
This reads the page ORDER from index.html and the COLOURS from the plates as they are now.

Run: python3 gen/page-colors.py   (after a plate rebuild; safe to run any time)
"""
import re, os, colorsys, sys
from PIL import Image
import numpy as np
np.seterr(all='ignore')   # Accelerate raises spurious matmul warnings on float inputs

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
html_path = os.path.join(ROOT, 'index.html')
html = open(html_path).read()

names = [re.search(r'/plates-vg/([a-z0-9]+)', m).group(1)
         for m in re.findall(r'<section class="page[^>]*>\s*<picture><img[^>]*src="[^"]+"', html)]
assert len(names) >= 30, 'could not read the page order'

light_raw, dark = [], []
for n in names:
    im = Image.open(os.path.join(ROOT, 'plates-vg', n + '.jpg')).convert('RGB').resize((320, 200))
    a = np.asarray(im).astype(float)
    # the page's own colour: the mean of the picture (the middle 80%, so a vignette can't vote)
    core = a[20:180, 32:288].reshape(-1, 3)
    light_raw.append(core.mean(axis=0))
    # the scrim: the deepest colour the picture already has along its bottom band
    band = a[156:200].reshape(-1, 3)
    lum = band @ np.array([0.3, 0.59, 0.11])
    deep = band[lum <= np.percentile(lum, 12)].mean(axis=0)
    k = min(1.0, 58.0 / max(1.0, deep.max()))          # never brighter than a shadow
    dark.append(tuple(int(round(v * k)) for v in deep))

# the strip: hue kept, RELATIVE value kept, the whole range lifted into a band the eye
# can read on dark chrome (the darkest page stays the darkest mark)
lums = [c @ np.array([0.3, 0.59, 0.11]) for c in light_raw]
lo, hi = min(lums), max(lums)
light = []
for c, L in zip(light_raw, lums):
    h, s, v = colorsys.rgb_to_hsv(*(c / 255.0))
    t = (L - lo) / max(1e-6, hi - lo)
    v2 = 0.40 + 0.56 * t
    s2 = min(0.72, max(0.30, s * 1.25))
    r, g, b = colorsys.hsv_to_rgb(h, s2, v2)
    light.append('#%02x%02x%02x' % (int(r * 255), int(g * 255), int(b * 255)))

L_js = 'var PAGE_LIGHT = [' + ','.join("'%s'" % c for c in light) + '];'
D_js = 'var PAGE_DARK = [' + ','.join("'%d,%d,%d'" % d for d in dark) + '];'
html2, n1 = re.subn(r'var PAGE_LIGHT = \[[^\]]*\];', L_js, html, count=1)
html2, n2 = re.subn(r'var PAGE_DARK = \[[^\]]*\];', D_js, html2, count=1)
assert n1 == 1 and n2 == 1, 'tables not found in index.html'
open(html_path, 'w').write(html2)
print('page-colors: %d pages measured' % len(names))
for i, n in enumerate(names):
    if '-v' in sys.argv: print('  %2d %-10s strip %s  scrim %s' % (i, n, light[i], dark[i]))
