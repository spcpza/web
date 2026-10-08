"""Pull the CHARACTER'S GEOMETRY out of Fred's own sheet so the book can DRAW him
with its own brushes instead of blitting his raster.

Fred: "now you have the shape and form right, now can you draw that character,
with our brush strokes?"

So: segment his front cell into the parts that matter (hood+body, face, hair,
eyes, paws), trace each part's outline, simplify it to a handful of points, and
emit them normalised to the figure's height. The SHAPE is measured from his
drawing — never guessed — and the PAINT is then ours.
"""
import json, math
import numpy as np
from PIL import Image

im = Image.open('cast/kid-front.png').convert('RGBA')
a = np.asarray(im).astype(int)
H, W = a.shape[0], a.shape[1]
al, rgb = a[:, :, 3], a[:, :, :3]
r, g, b = rgb[:, :, 0], rgb[:, :, 1], rgb[:, :, 2]
on = al > 60
blue = on & (b > r + 30) & (b > 90)
dark = on & (r < 115) & (g < 115) & (b < 135) & ~blue
orange = on & (r > 150) & (r - g > 60) & (r - b > 60)
hair = dark & (r < 70) & (g < 70)

def largest(mask):
    """flood-fill the biggest blob, so stray specks never become geometry"""
    seen = np.zeros_like(mask, bool); best = None
    idx = np.argwhere(mask)
    for sy, sx in idx:
        if seen[sy, sx]: continue
        stack = [(sy, sx)]; seen[sy, sx] = True; blob = []
        while stack:
            y, x = stack.pop(); blob.append((y, x))
            for dy, dx in ((1,0),(-1,0),(0,1),(0,-1)):
                ny, nx = y+dy, x+dx
                if 0 <= ny < H and 0 <= nx < W and mask[ny, nx] and not seen[ny, nx]:
                    seen[ny, nx] = True; stack.append((ny, nx))
        if best is None or len(blob) > len(best): best = blob
    out = np.zeros_like(mask, bool)
    for y, x in (best or []): out[y, x] = True
    return out

def outline(mask, step=6):
    # ⚠ TRIM THE OUTLIERS. One stray scanline — a speck of the same colour out at the
    # shoulder — stretches the traced span across empty space and paints a dark bar
    # through the figure. Rows far wider than the region's own median are dropped.
    """the silhouette, as a left/right pair per scanline — enough to rebuild the
    shape as a path, and immune to the noise a contour follower would trip on"""
    rows = []
    for y in range(0, H, step):
        xs = np.nonzero(mask[y])[0]
        if len(xs) < 2: continue
        rows.append((y, int(xs[0]), int(xs[-1])))
    if not rows: return [], []
    widths = np.array([r[2] - r[1] for r in rows], float)
    med = np.median(widths)
    keep = [r for r, w in zip(rows, widths) if w <= med * 2.1 + 6]
    # ⚠ AND TRIM THE TAILS. Where a region narrows to nothing the scanline spans converge
    # to a spike, and that spike renders as a thin dark spur hanging off the shape — the
    # one hanging under his hair for three rounds. Rows far narrower than the region's own
    # median are its vanishing tail, not its silhouette.
    if keep:
        kw = np.array([r[2] - r[1] for r in keep], float)
        thin = kw < max(3.0, med * 0.26)
        i0 = 0
        while i0 < len(keep) and thin[i0]: i0 += 1
        i1 = len(keep)
        while i1 > i0 and thin[i1 - 1]: i1 -= 1
        keep = keep[i0:i1]
    return [(r[1], r[0]) for r in keep], [(r[2], r[0]) for r in keep]

def bbox(mask):
    ys, xs = np.nonzero(mask)
    return (int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())) if len(xs) else None

body = largest(blue)
face = largest(dark & ~hair)
BB = bbox(on)
FH = BB[3] - BB[1]                      # his full height in this cell
def N(p):                                # normalise: x from the centre, y from the feet, in heights
    cx = (BB[0] + BB[2]) / 2
    return [round((p[0] - cx) / FH, 4), round((p[1] - BB[3]) / FH, 4)]

# ⚠ BOUNDING BOXES ARE NOT SHAPES. Taking only a box for the face gave a grey ball
# inside the hood; his face is an oval framed by hair, and the frame is the character.
# Every region is traced the same way the body is.
L, R = outline(body, 7)
# ⚠ INSIDE THE HOOD, HIS FACE AND HIS HAIR ARE BOTH DARK. Splitting on "near black"
# made the hair swallow the whole opening and he came out as a void again. They part
# by LUMINANCE, not by colour: within the head, the darker half is hair and the
# lighter half is the face he is showing.
fb0 = bbox(dark)
head = dark.copy()
head[int(fb0[1] + (fb0[3] - fb0[1]) * 0.62):, :] = False        # the head, not the paws
head = largest(head)
hl = (rgb[:, :, 0] * .299 + rgb[:, :, 1] * .587 + rgb[:, :, 2] * .114)
# ⚠ CLASSIFY BY COLOUR AGAINST TWO SEEDS I KNOW ARE RIGHT, not by percentile — three
# attempts at splitting the head by value failed, because the hood's inner shadow, his
# hair and his face are all dark and they overlap in brightness. But two spots are never
# in doubt: the point BETWEEN his eyes is face, and the point well ABOVE them is hair.
# Every head pixel then goes to whichever seed it is closer to in colour.
ey, ex = np.nonzero(orange)
eyc_y, eyc_x = int(ey.mean()), int(ex.mean())
face_seed = rgb[eyc_y + int(FH * 0.035), eyc_x].astype(float)      # just below the eyes: cheek
hair_seed = rgb[max(0, eyc_y - int(FH * 0.085)), eyc_x].astype(float)   # well above: fringe
d_face = np.linalg.norm(rgb.astype(float) - face_seed, axis=2)
d_hair = np.linalg.norm(rgb.astype(float) - hair_seed, axis=2)
face = largest(head & (d_face < d_hair))
hm = largest(head & (d_hair <= d_face))
print('  seeds  face', face_seed.astype(int), ' hair', hair_seed.astype(int))
fL, fR = outline(face, 5)
hL, hR = outline(hm, 5)
# the paws: dark blobs below the hem
paws = dark & ~hm
paws[:bbox(body)[3] - int(FH * 0.08), :] = False
pb = bbox(paws)
# ⚠ HIS HANDS. In the front view the sleeves are the same blue as the body, so the
# silhouette already has them — what is missing is the CUFF and the paw at its end.
# Those are the dark blobs at the body's own left and right, halfway down.
bb_body = bbox(body)
# ⚠ MEASURE FROM THE FACE, NOT THE BOX. The body's bounding box starts at the top of the
# HOOD, so "45% down" landed on his cheeks and he got hands growing out of his face.
fbb = bbox(face)
hem_y = bb_body[3]
hands = dark.copy()
hands[:fbb[3] + int(FH * 0.04), :] = False          # below his chin
hands[hem_y - int(FH * 0.06):, :] = False           # above the hem
hy_, hx_ = np.nonzero(hands)
hand_pts = []
if len(hx_):
    midx = (bb_body[0] + bb_body[2]) / 2
    for side in (-1, 1):
        sel = (hx_ - midx) * side > 0
        if sel.sum() > 20:
            hand_pts.append(N((int(np.median(hx_[sel])), int(np.median(hy_[sel])))))

data = {
    'height_px': FH,
    'body_l': [N(p) for p in L], 'body_r': [N(p) for p in R],
    'face_l': [N(p) for p in fL], 'face_r': [N(p) for p in fR],
    'hair_l': [N(p) for p in hL], 'hair_r': [N(p) for p in hR],
    'paws': [N((pb[0], pb[1])), N((pb[2], pb[3]))] if pb else None,
    'hands': hand_pts,
    'eyes': [N((bbox(orange)[0], bbox(orange)[1])), N((bbox(orange)[2], bbox(orange)[3]))],
}
# the palette, taken from HIS pixels rather than picked by eye
def pal(mask, n=3):
    px = rgb[mask]
    lum = px[:, 0] * .299 + px[:, 1] * .587 + px[:, 2] * .114
    q = [np.percentile(lum, p) for p in (80, 50, 22)]
    out = []
    for t in q:
        sel = px[np.abs(lum - t) < 12]
        c = sel.mean(axis=0) if len(sel) else px.mean(axis=0)
        out.append('#%02x%02x%02x' % tuple(int(v) for v in c))
    return out
data['pal'] = { 'hood': pal(blue), 'skin': pal(face), 'hair': pal(hm), 'eye': pal(orange) }
print('regions:', {k: (len(v) if isinstance(v, list) else v) for k, v in data.items() if k != 'pal'})
print('outline points:', len(data['body_l']), '+', len(data['body_r']))
open('cast/kid-geometry.json', 'w').write(json.dumps(data))
print('→ cast/kid-geometry.json')
