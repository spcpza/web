#!/usr/bin/env python3
"""gen/repaint/flow.py — the FLOW MAP a page's repaint follows (Oct 25).

Fred: "the solichin.org brushstrokes are more refined. can you do another pass on balthazar.sh for the art?"
solichin.org repaints a master image with a GPU brush engine whose strokes run ALONG the image's forms and get
smaller where the image has detail. Here the master is the page's own plate: its planes are composited (back to
front, exactly as the page stacks them) and the structure tensor of that picture says, everywhere, which way the
form runs and how fine the brush must be. Every plane of the page is repainted with this ONE map, so a tree in
`mid` and the sky behind it in `sky` agree about the wind.

usage:  python3 gen/repaint/flow.py <page-name> <out.png> [plane …]   (planes back→front; default: data-layers order)
out:    RGBA PNG, 800×500:  R,G = cos/sin of 2θ (θ = stroke angle, image y-down)   B = coherence   A = detail
"""
import sys, re, os
import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
PV = os.environ.get('FLOW_DIR') or os.path.join(ROOT, 'plates-vg')   # repaint.mjs points this at the ORIGINAL planes

def planes_of(name):
    s = open(os.path.join(ROOT, 'index.html')).read()
    for m in re.finditer(r'<section class="page[^"]*"([^>]*)>\s*<picture><img[^>]*src="/plates-vg/([a-z0-9-]+)\.jpg', s):
        if m.group(2) == name:
            L = re.search(r'data-layers="([^"]*)"', m.group(1))
            return [x.split('@')[0] for x in L.group(1).split(',')] if L else []
    raise SystemExit('no page ' + name)

def plane_file(name, pl):
    for ext in ('.jpg', '.webp', '.png'):
        f = os.path.join(PV, f'{name}-{pl}{ext}')
        if os.path.exists(f): return f
    return None

def blur(a, s):
    r = int(3 * s); k = np.exp(-np.arange(-r, r + 1) ** 2 / (2 * s * s)); k /= k.sum()
    a = np.apply_along_axis(lambda v: np.convolve(np.pad(v, r, mode='edge'), k, 'valid'), 0, a)
    return np.apply_along_axis(lambda v: np.convolve(np.pad(v, r, mode='edge'), k, 'valid'), 1, a)

def composite(name, planes):
    base = None
    for pl in planes:
        f = plane_file(name, pl)
        if not f: continue
        im = Image.open(f).convert('RGBA')
        base = im if base is None else Image.alpha_composite(base, im)
    if base is None: base = Image.open(os.path.join(PV, name + '.jpg')).convert('RGBA')
    return base

if __name__ == '__main__':
    name, out = sys.argv[1], sys.argv[2]
    planes = sys.argv[3:] or planes_of(name)
    comp = composite(name, planes).convert('RGB')
    W = 800; small = comp.resize((W, round(comp.height * W / comp.width)), Image.LANCZOS)
    L = np.asarray(small, dtype=np.float32).mean(2) / 255
    L = blur(L, 1.0)
    gx = np.zeros_like(L); gy = np.zeros_like(L)
    gx[:, 1:-1] = (L[:, 2:] - L[:, :-2]) / 2; gy[1:-1, :] = (L[2:, :] - L[:-2, :]) / 2
    jxx, jxy, jyy = blur(gx * gx, 3.5), blur(gx * gy, 3.5), blur(gy * gy, 3.5)
    phi = 0.5 * np.arctan2(2 * jxy, jxx - jyy)          # the gradient's orientation
    theta = phi + np.pi / 2                              # strokes run ALONG the form, across the gradient
    tr = jxx + jyy; dt = np.sqrt((jxx - jyy) ** 2 + 4 * jxy ** 2)
    coh = np.where(tr > 1e-7, dt / (tr + 1e-7), 0) ** 0.5
    # DETAIL = where the picture has small FORMS (a flower, a blossom, a face, a silhouette) — not merely marks.
    # These plates are already made of strokes, so raw gradient is high everywhere (mean .55 on seeds: useless).
    # Measure contrast that survives a mark-sized blur, against the 99.5th percentile.
    Lb = blur(L, 1.6)
    hx = np.zeros_like(Lb); hy = np.zeros_like(Lb)
    hx[:, 1:-1] = (Lb[:, 2:] - Lb[:, :-2]) / 2; hy[1:-1, :] = (Lb[2:, :] - Lb[:-2, :]) / 2
    rgbS = blur(np.asarray(small, dtype=np.float32).std(2) / 255, 1.6)       # colour contrast too (a pink blossom on green)
    mag = blur(np.sqrt(hx * hx + hy * hy) + .35 * np.abs(rgbS - blur(rgbS, 4)), 1.5)
    detail = np.clip(mag / (np.percentile(mag, 99.5) + 1e-6), 0, 1) ** 0.9
    rgba = np.dstack([(np.cos(2 * theta) * .5 + .5), (np.sin(2 * theta) * .5 + .5), coh, detail])
    Image.fromarray((np.clip(rgba, 0, 1) * 255).astype(np.uint8)).save(out)
    print(out, small.size, 'planes:', ','.join(planes), 'detail mean %.2f' % detail.mean())
