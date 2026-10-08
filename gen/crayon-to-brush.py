"""CRAYON → BRUSH.  Fred: "can you just copy paste what i have? that one is drawn
with crayon, change it to paint brush and you are done… it is mine."

This does NOT redraw him.  It takes his sheet as given and re-lays every part of
it in paint: each sample becomes a brush mark carrying that pixel's own colour,
running ALONG the form (across the local gradient), finer and tighter where his
drawing has an edge, looser and longer where it is flat.  The paper drops out to
transparent so the cells go straight into the book.  The drawing stays his; only
the medium changes.
"""
import sys, math
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

src_path = sys.argv[1] if len(sys.argv) > 1 else 'cast/sheets/1-turnaround.jpg'
SC       = int(sys.argv[2]) if len(sys.argv) > 2 else 2      # paint at 2x so marks have body
im = Image.open(src_path).convert('RGB')
W, H = im.size
a = np.asarray(im).astype(float)
lum = a[:, :, 0] * .299 + a[:, :, 1] * .587 + a[:, :, 2] * .114

gx = np.zeros_like(lum); gy = np.zeros_like(lum)
gx[:, 1:-1] = lum[:, 2:] - lum[:, :-2]
gy[1:-1, :] = lum[2:, :] - lum[:-2, :]
mag = np.hypot(gx, gy)

paper = a[3, 3]                                              # his sheet's own paper colour
# ⚠ HIS PAPER'S SHADOW MUST GO TOO. He drew each figure standing on a soft cream shadow;
# at a tight tolerance that shadow survives the cut and travels with him as a pale smudge
# under his feet — which is exactly why he would not sit into a painted page. The tolerance
# is wide enough to take the shadow with the paper, and safe because nothing in the
# character itself is anywhere near that cream.
is_paper = (np.abs(a - paper).max(axis=2) < 26)
# ⚠ AND THE CAST SHADOW HE DREW HIM STANDING ON. It is a warm grey — around [224,206,192]
# fading to [173,155,141] — nowhere near the paper's own colour, so a paper tolerance can
# never catch it, and it travelled with him as a pale smudge under his feet on every page.
# It is identifiable by what it IS and what he is NOT: light, warm and unsaturated. His
# blues run cool (b > r), his face is neutral and much darker, his eyes are saturated.
lum_s = a[:, :, 0] * .299 + a[:, :, 1] * .587 + a[:, :, 2] * .114
warm_s = a[:, :, 0] - a[:, :, 2]
spread = a.max(axis=2) - a.min(axis=2)
paper_shadow = (lum_s > 148) & (warm_s > 10) & (spread < 62)
is_paper = is_paper | paper_shadow

canvas = Image.new('RGBA', (W * SC, H * SC), (0, 0, 0, 0))
d = ImageDraw.Draw(canvas, 'RGBA')
rng = np.random.default_rng(7)

# ⚠ MARKS MUST OVERLAP, AND MUST NOT BE LAID IN ROWS. Sparse strokes leave the
# blotchy speckle that reads as noise instead of paint, and drawing them row by row
# bands the whole figure. The book's plates are thousands of marks laid in no order
# at all, each covering its neighbours — that density IS the medium.
STEP = 1.15
pts = []
for yy in np.arange(1, H - 1, STEP):
    for xx in np.arange(1, W - 1, STEP):
        pts.append((xx, yy))
pts = np.array(pts)
rng.shuffle(pts)
for (xx, yy) in pts:
    px = int(xx + (rng.random() - .5) * 1.9); py = int(yy + (rng.random() - .5) * 1.9)
    if px < 1 or py < 1 or px >= W - 1 or py >= H - 1: continue
    if is_paper[py, px]: continue
    m = mag[py, px]
    ang = math.atan2(gx[py, px], -gy[py, px]) if m > 6 else (rng.random() - .5) * .8 + math.pi / 2
    c = a[py, px]
    j = (rng.random() - .5) * 24
    warm = (rng.random() - .5) * 20
    col = (int(max(0, min(255, c[0] + j + warm))),
           int(max(0, min(255, c[1] + j))),
           int(max(0, min(255, c[2] + j - warm))),
           int(232 + rng.random() * 23))
    edge = m > 26
    L = (11.0 + rng.random() * 8.0) * (.5 if edge else 1) * SC
    wdt = max(1, int(round((3.2 + rng.random() * 1.8) * (.6 if edge else 1) * SC)))
    cxp, cyp = px * SC, py * SC
    d.line([(cxp - math.cos(ang) * L / 2, cyp - math.sin(ang) * L / 2),
            (cxp + math.cos(ang) * L / 2, cyp + math.sin(ang) * L / 2)],
           fill=col, width=wdt)

# ── his linework, kept as HIS and only re-coloured ───────────────────────────
# ⚠ REDRAWING HIS LINE AS STROKES MAKES A SCRIBBLE. Two rounds of laying dark marks
# along every strong gradient gave him a scratchy halo — pencil, not paint, and the
# first thing Fred saw: "the style is still different." His line is already clean and
# precise; what made it look foreign was that it is BLACK. So the line is lifted from
# the source as it is and composited back in the book's deep blue, its strength taken
# from how dark he drew it. Fred: "you can cheat it by using darker blue outline
# rather than black to make it similar to our style."
ink_strength = np.clip((118.0 - lum) / 118.0, 0, 1)            # 0 where light, 1 at his darkest line
ink_strength[is_paper] = 0
INK = np.array([18, 34, 58], float)                            # the book's deep blue, never black
ink_img = np.zeros((H, W, 4), 'uint8')
ink_img[:, :, 0] = INK[0]; ink_img[:, :, 1] = INK[1]; ink_img[:, :, 2] = INK[2]
ink_img[:, :, 3] = (np.clip((ink_strength - 0.30) / 0.70, 0, 1) ** 1.15 * 240).astype('uint8')
ink_layer = Image.fromarray(ink_img, 'RGBA').resize((W * SC, H * SC), Image.LANCZOS)
canvas = Image.alpha_composite(canvas, ink_layer)
d = ImageDraw.Draw(canvas, 'RGBA')

canvas.save('cast/sheet-painted.png')
print('cast/sheet-painted.png', canvas.size)

# ── cut the cells, on the sheet's OWN gaps ──────────────────────────────────
# ⚠ HIS ROWS ARE NOT THIRDS AND HIS FEET ARE NOT ATTACHED. Cutting on a 4x3 grid caught
# a strip of the figure above; cutting to "the tallest unbroken band" then threw his PAWS
# away, because they sit below a gap under the hem — which is why he came out half a kid.
# The sheet tells us where its own rows and columns are: bands of rows and columns with no
# paint in them at all. Cut there, and every cell is a whole figure.
al_full = np.asarray(canvas.split()[3])
row_has = (al_full > 24).sum(axis=1) > 6
col_has = (al_full > 24).sum(axis=0) > 6

def bands(flags, min_len):
    out, cur = [], None
    for i, on in enumerate(flags):
        if on and cur is None: cur = i
        elif not on and cur is not None:
            if i - cur >= min_len: out.append((cur, i))
            cur = None
    if cur is not None and len(flags) - cur >= min_len: out.append((cur, len(flags)))
    return out

rowb = bands(row_has, int(canvas.height * 0.06))
colb = bands(col_has, int(canvas.width * 0.03))
print('rows found:', len(rowb), ' columns found:', len(colb))

NAMES = [['front', 'side', 'three-quarter', 'back'],
         ['hood-down', 'hands-up', 'side-far', 'surprised'],
         ['detail-1', 'detail-2', 'detail-3', 'detail-4', 'detail-5']]
for ri, (y0, y1) in enumerate(rowb[:3]):
    # the columns of THIS row (a row may hold a different number of figures)
    sub = (al_full[y0:y1] > 24).sum(axis=0) > 4
    cb = bands(sub, int(canvas.width * 0.02))
    for ci, (x0, x1) in enumerate(cb):
        if ri < len(NAMES) and ci < len(NAMES[ri]): name = NAMES[ri][ci]
        else: name = 'extra-%d-%d' % (ri, ci)
        pad = 6
        cell = canvas.crop((max(0, x0 - pad), max(0, y0 - pad),
                            min(canvas.width, x1 + pad), min(canvas.height, y1 + pad)))
        # ⚠ FEATHER THE EDGE. A hard cut-out sits ON a painted page like a sticker; a soft
        # last pixel lets the figure settle INTO it.
        # ⚠ SOFTEN THE EDGE OR HE IS A STICKER. Fred: "can you also fix so that the edges of
        # the kid is smoother? we want him to blend in." A hard alpha cut leaves the brush's
        # ragged fringe standing proud of the painting. Pull the edge IN a little first (so
        # the stray outermost bristle marks go), then feather it well: the figure then ends
        # in paint rather than in a cut line.
        aa = cell.split()[3]
        aa = aa.filter(ImageFilter.MinFilter(3))            # erode the loose fringe
        aa = aa.filter(ImageFilter.GaussianBlur(2.2))       # and feather what is left
        aa = aa.point(lambda v: min(255, int(v * 1.18)))    # keep his body solid, edge soft
        cell.putalpha(aa)
        # ⚠ SHIP THEM SMALL. Painted at 2x the sheet, a cell is ~500x940 and 400KB — and a
        # 400KB PNG has not decoded by the time a page builds its actors, so the book
        # silently fell back to the old pilgrim on every page. He is drawn 60-160px tall on
        # a plate; 420px of height is already generous. Quantised too: this is flat painted
        # colour, which is exactly what a palette encodes well.
        target_h = 420
        if cell.height > target_h:
            w2 = max(1, int(round(cell.width * target_h / cell.height)))
            cell = cell.resize((w2, target_h), Image.LANCZOS)
        # ⚠ WEBP, NOT PNG. Quantising a painted figure barely helps — broken colour is
        # thousands of hues by design — and a 150KB PNG still lost the race against the
        # page build. WebP with alpha carries the same picture at a fifth the weight.
        cell.save(f'cast/kid-{name}.webp', quality=86, method=6)
        print('  cast/kid-%s.webp' % name, cell.size)
print('cells written to cast/')
