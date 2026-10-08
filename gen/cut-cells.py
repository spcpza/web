#!/usr/bin/env python3
"""Cut a character sheet of Fred's into named cells.

His art is the art.  Everything I tried that REGENERATED it — redrawn, cut-out
rig, skinned mesh, 3D model — came out visibly not his character.  So the only
job here is engineering: lift each pose off the paper cleanly, drop the drawn
cast shadow, feather the edge so it sits in a painted plate, and hand the book
his own drawing untouched.

  python3 gen/cut-cells.py <sheet.jpg> name1 name2 name3 ...

Figures are found by their own silhouette (left to right), so the names are just
given in the order they appear on the sheet.
"""
from PIL import Image, ImageFilter
import numpy as np, sys, os
from collections import deque


def _dark_ringed_paper(cand, lum, rgb, pap):
    """Enclosed pockets that are RINGED BY DARK — paper caught between locks of hair.

    ⚠⚠⚠ WHAT SETTLES IT IS WHAT SURROUNDS THE POCKET, NOT ITS OWN COLOUR. Five rounds went
    around this loop: tighten the colour test and the eye whites survive but paper stays in
    the hair; loosen it and the paper goes and the eyes come out notched. Colour cannot
    decide it, because a scrap of paper trapped in a fringe and the white of an eye are
    genuinely the same colour — measured on the fireside sheet, BOTH read (246,245,248),
    r-b = -2. The `warm_enough` guard below is what was keeping those two scraps.

    What is never the same is their NEIGHBOURHOOD. A gap between two locks of hair is ringed
    by HAIR, dark on every side. An eye white is ringed by lashes and SKIN. Measured on the
    same two children: the paper pockets ring at luma 47, 51, 78, 78, 85 — the eye white
    rings at 101. So each pocket is judged by the band of pixels just outside it.

    The size cap keeps the torn loaf out of it: the crumb is 2,457px, every paper scrap here
    is under 350.
    """
    H, W = cand.shape
    done = np.zeros((H, W), bool)
    out = np.zeros((H, W), bool)
    d = np.abs(rgb.astype(int) - pap).max(2)
    ys, xs = np.where(cand)
    for y0, x0 in zip(ys, xs):
        if done[y0, x0]:
            continue
        q = deque([(y0, x0)]); done[y0, x0] = True; pts = [(y0, x0)]
        while q:
            cy, cx = q.popleft()
            for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                ny, nx = cy + dy, cx + dx
                if 0 <= ny < H and 0 <= nx < W and cand[ny, nx] and not done[ny, nx]:
                    done[ny, nx] = True; q.append((ny, nx)); pts.append((ny, nx))
        _dbg = os.environ.get('CUT_DEBUG2')
        if not (18 <= len(pts) <= 900):
            if _dbg and len(pts) > 900:
                idx0 = np.array(pts)
                _l0 = lum[idx0[:,0], idx0[:,1]].mean()
                _c0 = (rgb.max(2)-rgb.min(2))[idx0[:,0], idx0[:,1]].mean()
                if _l0 > 190 and _c0 < 30 and len(pts) < 40000:
                    print('      [big] n=%d y=%d-%d x=%d-%d L=%.0f C=%.0f' % (len(pts),
                        idx0[:,0].min(), idx0[:,0].max(), idx0[:,1].min(), idx0[:,1].max(), _l0, _c0))
            continue
        idx = np.array(pts)
        # ⚠ AND IT NEED NOT MATCH THE SHEET'S CORNER. This is what made the pass find nothing
        # at all: Fred's paper reads (255,228,217) in the corner, warm, but the scraps caught
        # in these fringes read (246,245,248) — cool white, 31 away — because paper in a deep
        # shadowed notch takes its colour from the room, not from the lamp. Blank paper is
        # blank paper wherever its cast falls: BRIGHT and with almost no colour in it. (The
        # torn loaf is chroma 60 and never qualifies.)
        _l = lum[idx[:, 0], idx[:, 1]].mean()
        _c = (rgb.max(2) - rgb.min(2))[idx[:, 0], idx[:, 1]].mean()
        if d[idx[:, 0], idx[:, 1]].mean() > 26 and not (_l > 190 and _c < 30):
            continue
        m = np.zeros((H, W), bool); m[idx[:, 0], idx[:, 1]] = True
        grow = m.copy()
        for _ in range(4):
            g = grow.copy()
            for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                g |= np.roll(np.roll(grow, dy, 0), dx, 1)
            grow = g
        ring = grow & ~m
        if ring.sum() and lum[ring].mean() < 92:      # ringed by hair, not by skin
            out |= m
    return out


def _reachable_from_border(paperish, lum=None, rgb=None, pap=None):
    """Background is paper you can walk to from the edge of the sheet.

    Anything paper-coloured the outside cannot reach is enclosed by the drawing — a white
    sock, a white mitten, the white of an eye — and belongs to him.
    """
    H, W = paperish.shape
    seen = np.zeros((H, W), bool)
    q = deque()
    for x in range(W):
        for y in (0, H - 1):
            if paperish[y, x] and not seen[y, x]:
                seen[y, x] = True; q.append((y, x))
    for y in range(H):
        for x in (0, W - 1):
            if paperish[y, x] and not seen[y, x]:
                seen[y, x] = True; q.append((y, x))
    while q:
        cy, cx = q.popleft()
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            ny, nx = cy + dy, cx + dx
            if 0 <= ny < H and 0 <= nx < W and paperish[ny, nx] and not seen[ny, nx]:
                seen[ny, nx] = True; q.append((ny, nx))
    if lum is None:
        return seen
    # ⚠ AND PAPER TRAPPED INSIDE THE PICTURE IS STILL PAPER. Reachability alone keeps every
    # enclosed pocket — right for a sock or an eye white, wrong for the wedge of background
    # caught between one child's arm and the next child's body, which no route from the
    # border can get to.
    # What tells them apart is that ANYTHING THE ARTIST DREW HAS SHADING IN IT and blank
    # paper does not. Measured on the trio: the trapped background wedge means 254.2, while
    # the faces, socks and mittens all mean 233-243. So an enclosed pocket that is flat,
    # unshaded, paper-white is background wherever it sits.
    enc = paperish & ~seen
    if not enc.any() or rgb is None or pap is None:
        return seen
    # ⚠⚠ JUDGE ENCLOSED PAPER PER PIXEL, NOT PER POCKET. Traced on the fireside sheet, the
    # wedge caught in the curly child's fringe came out as TWO pockets: a clean one of 52
    # pixels that passed every test but the minimum size, and a 227-pixel one that was a
    # MIXTURE of that paper and the pale edge of her skin — so its mean and its spread were
    # both contaminated and the whole thing was kept. Averaging a pocket only works when the
    # pocket is one thing, and a gap between a hood and a lock of hair never is.
    #   Each pixel answers for itself now: is it the sheet's own colour, and is it no warmer
    # than the sheet? Mixtures resolve correctly — the paper half goes, the drawn half stays
    # — and the size threshold disappears with the problem it was there to paper over.
    # ⚠ The two guards that keep this safe are the same ones as before: an EYE WHITE is 33
    # from the sheet colour and SILVER HAIR is 62, so neither is ever close enough; and the
    # BREAD CRUMB is warmer than the sheet (b 201 against 217), which is the one thing paper
    # can never be.
    d = np.abs(rgb.astype(int) - pap).max(2)
    not_warmer = (rgb[:, :, 2] >= pap[2] - 6) & (rgb[:, :, 1] >= pap[1] - 6)
    # and still warm enough to BE paper — an eye white is neutral (see fill_holes)
    warm_enough = (rgb[:, :, 0].astype(int) - rgb[:, :, 2].astype(int)) >= 12
    seen |= enc & (d < 22) & not_warmer & warm_enough
    seen |= _dark_ringed_paper(enc & ~seen, lum, rgb, pap)
    return seen


def cutout_mask(a):
    """Keep everything that is NOT his paper.

    The first version listed what to KEEP — blue cloth, dark hair, grey skin — and
    so it quietly deleted every prop he drew: the book, the pizza, the bat, the
    teddy, leaving holes in his lap where his hands were still closed around them.
    Invert it.  His paper is a warm pink cream (253,229,217) and the shadow he
    draws under each figure is the same hue a few steps darker; nothing else on
    the sheet is warm AND that light.  So: drop that, keep the rest."""
    r, g, b = a[:,:,0], a[:,:,1], a[:,:,2]
    lum = a.sum(axis=2) / 3
    mx0 = a.max(axis=2); mn0 = a.min(axis=2)

    # ⚠⚠ TWO KINDS OF SHEET, AND THEY NEED OPPOSITE TESTS. Fred's own paper is a warm pink
    # cream, so it is found by "warm AND light". A commissioned pose comes back on NEUTRAL
    # WHITE, which that test cannot see at all — hence the `neutral` term below.
    # But leaving BOTH switched on is worse than either: on a white sheet, "warm and light"
    # no longer describes the background, it describes every warm pale OBJECT in the
    # drawing. Measured on IMG_9522 it silently deleted 21,139 pixels — the torn crumb faces
    # of the bread the whole pose exists to show, and part of the children's pale skin.
    # So: look at the corners and decide which sheet this is, then use only the right test.
    H0, W0 = lum.shape
    k = max(8, min(H0, W0) // 24)
    corners = np.concatenate([a[:k, :k].reshape(-1, 3), a[:k, -k:].reshape(-1, 3),
                              a[-k:, :k].reshape(-1, 3), a[-k:, -k:].reshape(-1, 3)])
    cr, cg, cb = corners[:, 0].mean(), corners[:, 1].mean(), corners[:, 2].mean()
    neutral_sheet = (max(cr, cg, cb) - min(cr, cg, cb)) < 9 and (cr + cg + cb) / 3 > 236
    print('  sheet: %s (corner rgb %.0f,%.0f,%.0f)'
          % ('NEUTRAL white' if neutral_sheet else "Fred's warm paper", cr, cg, cb))
    # ⚠⚠ COLOUR ALONE CANNOT SEPARATE A WHITE SOCK FROM WHITE PAPER. Fred: "some is still
    # transparent which is not should be. maybe it is because it is the same colour as the
    # background." Exactly — the blonde child's socks and mittens, and the white of every
    # eye, ARE the background colour, so no threshold can keep one and drop the other.
    # Tightening it (232 -> 246) only traded big holes for small ones.
    # The signal that DOES separate them is REACHABILITY: the background touches the edge of
    # the sheet; a sock inside a figure does not. So paper is not "pixels that look like
    # paper" — it is "pixels that look like paper AND can be walked to from the border
    # without leaving paper". Everything else is his drawing, whatever colour it happens
    # to be. This is also why the threshold can now be GENEROUS (226): over-including
    # near-white costs nothing once the flood decides what is actually outside.
    if neutral_sheet:
        return ~_reachable_from_border(((mx0 - mn0) < 30) & (lum > 226), lum)
    # ⚠⚠ AND THE HUE TEST IS TOO BROAD FOR A CAST WITH PALE CHILDREN IN IT. Fred's fireside
    # sheet has a torn loaf (247,215,187), silver hair (193,173,170) and a fair face
    # (252,197,156) — every one of them "warm and pale", so `r > b+14 & r > g+8 & pale` ate
    # the bread out of his hand and punched holes through a face. Measured, the sheet's paper
    # is FLAT: 99% of the border sits within 3 of its own median and the worst pixel within
    # 11, while the nearest thing he drew is 30 away and everything else 60 or more. So paper
    # is not a hue family, it is ONE COLOUR — take the median off the border and keep what is
    # close to it. 16 sits in the middle of that gap with a clean margin on both sides.
    _bd = np.concatenate([a[:14].reshape(-1, 3), a[-14:].reshape(-1, 3),
                          a[:, :14].reshape(-1, 3), a[:, -14:].reshape(-1, 3)])
    _pap = np.median(_bd.astype(int), 0)
    # THE FLAT SHEET ITSELF. Measured: 99% of the border sits within 3 of its own median and
    # the worst pixel within 11, while the nearest thing Fred drew is 30 away.
    strict = (np.abs(a.astype(int) - _pap).max(2) < 16)
    # ⚠⚠ AND THE SAME PAPER LYING IN THE FIGURE'S SHADE. Fred: "your cutting is bad, i still
    # see a lot of the white background got pasted" — and mapping the survivors showed what
    # they were: the strip of ground UNDER each seated child, plus slivers down their sides.
    # That is paper, but paper in shadow, so it is nowhere near the flat border colour and a
    # strict test cannot see it. It is still the same warm, low-chroma hue, just darker.
    # ⚠⚠ AND IT MUST NOT REQUIRE WARMTH. The wedge trapped in the curly child's fringe reads
    # 251,239,235 — near NEUTRAL, because paper in deep shade loses the sheet's warm cast
    # rather than keeping it. So `r > b+6` excluded it from the candidates entirely and no
    # later rule ever got to look at it: it was not "kept", it was never considered.
    # Pale and low-chroma is enough to be a CANDIDATE; what it actually is gets decided by
    # the flood and the pocket test below, both of which are far better judges than hue.
    generous = ((mx0 - mn0) < 62) & (lum > 120)
    # ⚠⚠ WHICH ALONE WOULD EAT THE DRAWING — that mask also describes the torn loaf
    # (247,215,187) and the silver-haired child's hair (193,173,170). What separates them is
    # not colour, it is that FRED OUTLINES EVERYTHING HE DRAWS: paper can never walk into a
    # drawn thing without crossing that line. So the ink is a WALL for the flood, and the
    # generous mask is safe — the bread and the hair are enclosed by their own contours and
    # the border can never reach them, while the paper under the child runs straight out to
    # the edge of the sheet.
    # ⚠ AND THE WALL MUST BE SEALED. The bread IS outlined — measured across it, the contour
    # bottoms out at luma 17 — and the flood still got inside and ate it, because a contour
    # drawn by hand has hairline gaps in it, and ONE pixel is all a flood needs. The same gap
    # is what took the silver-haired child's hair. So the ink is thickened by a pixel before
    # it is used as a barrier: it closes the hairline breaks without closing anything a real
    # background can travel through.
    # ⚠ 135 AND TWO PIXELS, measured up from 112/1px which still let the flood hollow the
    # bread into a ring. A hand-drawn contour is not a hard edge — it has a soft anti-aliased
    # shoulder, and the flood walks in along that shoulder wherever the core of the line
    # thins. Taking the shoulder into the wall and thickening it twice closes those.
    ink = lum < 135
    wall = ink.copy()
    for _ in range(2):
        g2 = wall.copy()
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            g2 |= np.roll(np.roll(wall, dy, 0), dx, 1)
        wall = g2
    keep = ~_reachable_from_border((strict | generous) & ~wall, lum, a, _pap)
    # ⚠⚠ AND THE WALL ITSELF HIDES PAPER. The scraps caught in these two children's fringes
    # are 5 and 6 pixels wide, and the ink wall is dilated twice — so the wall swallowed them
    # whole and they were never offered to the paper test at all. Every tuning of that test
    # left them sitting there, because the test never saw them.
    #   So the pockets are judged against the RAW paper mask, before the wall: anything
    # paper-coloured and ringed by dark is paper wherever the wall put it.
    # ⚠⚠⚠ AND THE CANDIDATES MUST BE GENUINELY INSIDE HIM. This is what defeated three
    # straight attempts, and nothing about the pockets was ever wrong: EVERY pale scrap on
    # this child — the two in his fringe, the white of his eye, and the pale rim of
    # anti-aliasing that runs right round his silhouette — came out as ONE connected
    # component of 5,971 pixels spanning the entire figure. Judging it as a pocket is
    # meaningless; it is the outline of a boy.
    #   Peeling three pixels off the kept region cuts that rim away, and the scraps fall
    # apart into the small enclosed pockets they actually are.
    _inner = keep.copy()
    for _ in range(3):
        _e = _inner.copy()
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            _e &= np.roll(np.roll(_inner, dy, 0), dx, 1)
        _inner = _e
    _pk = _dark_ringed_paper((strict | generous) & _inner, lum, a, _pap)
    if os.environ.get('CUT_DEBUG'):
        print('    [dbg] raw-paper=%d kept=%d ring-removed=%d' % ((strict|generous).sum(), keep.sum(), _pk.sum()))
    return keep & ~_pk

def largest_only(mask):
    """Keep only the biggest connected piece — by its pixels, not its box, or a
    stray fleck beside a figure rides along inside the crop."""
    H, W = mask.shape
    seen = np.zeros((H, W), bool)
    best = None
    for sy in range(0, H, 2):
        for sx in range(0, W, 2):
            if not mask[sy, sx] or seen[sy, sx]:
                continue
            q = deque([(sy, sx)]); seen[sy, sx] = True; pts = [(sy, sx)]
            while q:
                cy, cx = q.popleft()
                for dy, dx in ((1,0),(-1,0),(0,1),(0,-1)):
                    ny, nx = cy+dy, cx+dx
                    if 0 <= ny < H and 0 <= nx < W and not seen[ny,nx] and mask[ny,nx]:
                        seen[ny,nx] = True; q.append((ny,nx)); pts.append((ny,nx))
            if best is None or len(pts) > len(best):
                best = pts
    out = np.zeros((H, W), bool)
    if best:
        idx = np.array(best)
        out[idx[:,0], idx[:,1]] = True
    return out

def blobs(mask, min_px):
    H, W = mask.shape
    seen = np.zeros((H, W), bool)
    out = []
    for sy in range(0, H, 3):
        for sx in range(0, W, 3):
            if not mask[sy, sx] or seen[sy, sx]:
                continue
            q = deque([(sy, sx)]); seen[sy, sx] = True
            y0 = y1 = sy; x0 = x1 = sx; n = 0
            while q:
                cy, cx = q.popleft(); n += 1
                if cy < y0: y0 = cy
                if cy > y1: y1 = cy
                if cx < x0: x0 = cx
                if cx > x1: x1 = cx
                for dy, dx in ((1,0),(-1,0),(0,1),(0,-1)):
                    ny, nx = cy+dy, cx+dx
                    if 0 <= ny < H and 0 <= nx < W and not seen[ny,nx] and mask[ny,nx]:
                        seen[ny,nx] = True; q.append((ny,nx))
            if n >= min_px:
                out.append((x0, y0, x1, y1, n))
    return _reading_order(out)


def _reading_order(boxes):
    """Left to right, and TOP TO BOTTOM when a sheet has more than one row.

    ⚠ This used to be `sorted(by x0)`, which is correct for the one-row sheets Fred had
    drawn so far and silently scrambles anything else: on a 2x4 sheet, sorting by x alone
    interleaves the columns, so the names you pass on the command line land on the wrong
    figures. Nothing errors — you just get `look-up-back` written out as `run-open`.

    Figures are grouped into rows by whether their vertical spans overlap (a row is a band
    of figures standing on roughly the same line), then ordered within each row by x.
    """
    if not boxes:
        return boxes
    rows, rest = [], sorted(boxes, key=lambda t: t[1])
    for b in rest:
        placed = False
        for row in rows:
            # same row if this figure's vertical span overlaps the row's by more than half
            top = max(b[1], min(r[1] for r in row))
            bot = min(b[3], max(r[3] for r in row))
            if bot - top > 0.5 * min(b[3] - b[1], max(r[3] for r in row) - min(r[1] for r in row)):
                row.append(b); placed = True; break
        if not placed:
            rows.append([b])
    out = []
    for row in rows:
        out.extend(sorted(row, key=lambda t: t[0]))
    return out

# ⚠ HIS EYES ARE RED, EVEN WHEN HE IS DAZED. Fred: "i saw some pages have the eyes as
# transparent and not red. if you can make it red low opacity that would be nice." The
# closed-eye cells are fine — those are drawn shut. The offender is `dizzy`, whose spiral
# eyes came out a washed pink (187,129,118) against his real eye colour (194,70,37), so
# they read as holes. Push them toward the red but not all the way: he is still reeling.
EYE_TINT = {'dizzy': 0.62}

def strip_shallow_paper(alpha, rgb):
    """The last of the sheet: bright scraps caught in a fringe, just under the silhouette.

    ⚠⚠⚠ THE ONE THING THAT TELLS THEM APART IS HOW DEEP THEY SIT. Four passes were spent
    tuning colour, then warmth, then the ring of pixels around each pocket, and every one of
    them failed for a different reason — the last because EVERY pale scrap on a child, the
    two in his fringe, the white of his eye and the pale rim of anti-aliasing all round his
    silhouette, comes out as ONE connected component of 5,971 pixels. It is not a pocket; it
    is the outline of a boy.

    Measured instead as distance from the transparent outside, on all four fireside cells:

        paper in the fringe   10, 11, 11, 12, 23 px deep
        eye whites, teeth     deeper than 40 px (never reached)

    Paper only ever gets a little way under the edge, because it comes in through a notch
    between two locks of hair. Anything the artist DREW white sits in the middle of a face.

    The brightness bar is what keeps the silver-haired child: her lit strands are shallow
    too — 6 to 35 px — but they are hair, luma 195-203, and the sheet never reads below 225.
    """
    H, W = alpha.shape
    op = alpha > 90
    lum = rgb[:, :, 0] * 0.299 + rgb[:, :, 1] * 0.587 + rgb[:, :, 2] * 0.114
    chroma = rgb.max(2) - rgb.min(2)
    # distance from the outside, in 4-connected steps, given up past 60
    depth = np.full((H, W), 999.0)
    cur = ~op
    depth[cur] = 0
    for k in range(1, 61):
        g = cur.copy()
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            g |= np.roll(np.roll(cur, dy, 0), dx, 1)
        new = g & ~cur
        if not new.any():
            break
        depth[new] = k
        cur = g
    cand = op & (lum > 220) & (chroma < 45)
    seen = np.zeros((H, W), bool)
    cut = np.zeros((H, W), bool)
    ys, xs = np.where(cand)
    for y0, x0 in zip(ys, xs):
        if seen[y0, x0]:
            continue
        q = deque([(y0, x0)]); seen[y0, x0] = True; pts = [(y0, x0)]
        while q:
            cy, cx = q.popleft()
            for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                ny, nx = cy + dy, cx + dx
                if 0 <= ny < H and 0 <= nx < W and cand[ny, nx] and not seen[ny, nx]:
                    seen[ny, nx] = True; q.append((ny, nx)); pts.append((ny, nx))
        idx = np.array(pts)
        _why = None
        # ⚠ MEASURED AGAIN, WIDER. Fred: "i still see very little white background here.
        # let's be very detailed about this." Two of the survivors were rejected by numbers I
        # had set from too small a sample: a patch of sheet on her shoulder sits 26px in (my
        # cut-off was 24), and the specks along the edge of her hair are 8-14px (my floor was
        # 15). Re-measured across all four cells, every drawn white — eye whites, catchlights,
        # teeth — is deeper than 45, so the bar can go to 34 with room to spare.
        if not (5 <= len(pts) <= 400): _why = 'size'
        elif depth[idx[:, 0], idx[:, 1]].max() > 34: _why = 'deep %.0f' % depth[idx[:, 0], idx[:, 1]].max()
        if os.environ.get('CUT_DEBUG3') and len(pts) >= 8:
            print('      [sp] n=%-4d y=%d x=%d L=%.0f %s' % (len(pts), idx[:,0].min(), idx[:,1].min(),
                  lum[idx[:,0], idx[:,1]].mean(), _why or 'candidate'))
        if _why:
            continue
        m = np.zeros((H, W), bool); m[idx[:, 0], idx[:, 1]] = True
        grow = m.copy()
        for _ in range(4):
            g = grow.copy()
            for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                g |= np.roll(np.roll(grow, dy, 0), dx, 1)
            grow = g
        ring = grow & ~m & op
        if not ring.sum():
            continue
        # ⚠⚠⚠ "WALLED IN BY DARK" IS ONLY HALF OF IT. Fred, on the blonde child: "white stuff
        # on hair still exist". Measured, the trapped paper there is luma 227-242 at chroma
        # 23-36 and the hair around it is luma ~200 at chroma 82-150 — so the ring is BRIGHT,
        # and a test that asks "is this pocket surrounded by dark?" says no and keeps the
        # paper. Every earlier sheet had dark hair, which is why it had never come up.
        #   What actually separates them there is CHROMA: paper is neutral and hair is a
        # colour, and the gap is enormous. So a pocket is paper if it is ringed by dark OR if
        # it is markedly LESS COLOURED than what rings it — the second clause is what handles
        # paper caught in blonde, red or pink hair.
        # ⚠ Drawn whites (eye whites, teeth) are also neutral and would trip the second
        # clause; they are safe because they sit DEEPER than 40px, which is tested above.
        ring_lum = lum[ring].mean()
        ring_chroma = chroma[ring].mean()
        pocket_chroma = chroma[idx[:, 0], idx[:, 1]].mean()
        if ring_lum < 105 or (ring_chroma - pocket_chroma) > 40:
            cut |= m
    # feather one pixel so the removal does not leave a hard staircase
    edge = cut.copy()
    for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        edge |= np.roll(np.roll(cut, dy, 0), dx, 1)
    a2 = np.where(cut, 0, alpha)
    return np.where(edge & ~cut & op, np.minimum(a2, 120), a2)


def tint_eyes(rgb, alpha, name):
    k = EYE_TINT.get(name)
    if k is None:
        return rgb
    r, g, b = rgb[:,:,0], rgb[:,:,1], rgb[:,:,2]
    H = rgb.shape[0]
    band = np.zeros(alpha.shape, bool)
    band[:int(H * 0.45)] = True                      # the face, never the body
    # pale and pink: his skin is 111,102,103 and his hood is blue, so nothing else matches
    pale = band & (alpha > 150) & (r > 150) & (r > b) & (np.abs(r - g) > 18)
    if not pale.any():
        return rgb
    out = rgb.astype(float).copy()
    for i, t in enumerate((194.0, 70.0, 37.0)):
        out[:,:,i] = np.where(pale, out[:,:,i] * (1 - k) + t * k, out[:,:,i])
    return np.clip(out, 0, 255).astype(int)

def fill_holes(alpha, rgb=None, pap=None):
    """Anything the OUTSIDE cannot reach is inside him, and must stay opaque.

    ⚠ THE WHITES OF HIS EYES ARE NEARLY PAPER-COLOURED. `cutout_mask` keeps whatever is
    not paper — which is right for the background and catastrophic for every white detail
    drawn INSIDE him: the ring around each iris, his teeth, the catchlights. They were
    punched clean out, so his eyes read as holes with the plate showing through. Fred:
    "why are the eyes transparent? ... i think when you remove the white for the
    background, you removed the white from the eyes as well."

    Paper only exists OUTSIDE the figure, so the test is reachability, not colour: flood
    the transparent region inward from the border and keep whatever it never reaches.
    Real gaps — between his legs, under an arm — connect to the border and stay open.
    """
    # ⚠⚠ AND IT MUST NOT UNDO THE CUTTER. This is what kept putting the pale wedge back into
    # the curly child's fringe no matter how the paper test was tuned: `cutout_mask` was
    # removing it correctly, and then this function — whose whole job is "anything the outside
    # cannot reach is inside him" — filled it straight back in as an eye-white would be.
    # A hole that is the SHEET'S OWN COLOUR is the one kind that must stay open. His eye
    # whites are 33 from the sheet colour and his teeth further still, so they are untouched.
    solid = alpha > 90
    H, W = alpha.shape
    trans = ~solid
    lum = (rgb[:, :, 0] * 0.299 + rgb[:, :, 1] * 0.587 + rgb[:, :, 2] * 0.114) if rgb is not None \
        else np.zeros((H, W))
    if rgb is not None and pap is not None:
        _d = np.abs(rgb.astype(int) - pap).max(2)
        # AND IT MUST KEEP SOME OF THE SHEET'S WARMTH. Without this the rule bit a notch
        # out of an EYE WHITE, which is near-neutral (r-b about 2) while the sheet is warm
        # (r-b about 38) and paper lying in shade still holds roughly half of that (the wedge
        # reads 16). So a paper hole has to be warm; a white the child is drawn with is not.
        _warm = (rgb[:, :, 0].astype(int) - rgb[:, :, 2].astype(int)) >= 12
        _paper_hole = (_d < 22) & (rgb[:, :, 2] >= pap[2] - 6) & (rgb[:, :, 1] >= pap[1] - 6) & _warm
    else:
        _paper_hole = np.zeros((H, W), bool)
    seen = np.zeros((H, W), bool)
    q = deque()
    for x in range(W):
        for y in (0, H - 1):
            if trans[y, x] and not seen[y, x]:
                seen[y, x] = True; q.append((y, x))
    for y in range(H):
        for x in (0, W - 1):
            if trans[y, x] and not seen[y, x]:
                seen[y, x] = True; q.append((y, x))
    while q:
        cy, cx = q.popleft()
        for dy, dx in ((1,0),(-1,0),(0,1),(0,-1)):
            ny, nx = cy + dy, cx + dx
            if 0 <= ny < H and 0 <= nx < W and trans[ny, nx] and not seen[ny, nx]:
                seen[ny, nx] = True; q.append((ny, nx))
    # ⚠ ONLY FILL HOLES BIG ENOUGH TO BE A FEATURE. A one-pixel pocket pinched between
    # the contour and the background is not the white of an eye — it is a rounding
    # artefact, and filling it plants a speck of PAPER on his outline, which is the
    # halo this cutter exists to remove. Eye whites and teeth run to hundreds of pixels.
    # ⚠⚠ AND ONLY NEAR THE OUTSIDE. Colour alone could not separate the wedge from an EYE
    # WHITE — that eye is warm too, and the rule bit a notch out of it. What does separate
    # them is WHERE THEY ARE: a scrap of trapped background lies right against the outside,
    # cut off from it by one thin line of hood or hair, while an eye is deep inside a face.
    # So a hole may only be treated as paper if the outside is within reach of it.
    _paper_hole = _dark_ringed_paper(trans & ~seen, lum, rgb, pap)
    inner = trans & ~seen & ~_paper_hole
    if not inner.any():
        return alpha
    _sy = np.where(solid.any(axis=1))[0]
    fy0, fy1 = (int(_sy.min()), int(_sy.max())) if _sy.size else (0, H)
    out = alpha.copy()
    lab = np.zeros((H, W), np.int32)
    for sy in range(H):
        for sx in range(W):
            if not inner[sy, sx] or lab[sy, sx]:
                continue
            q2 = deque([(sy, sx)]); lab[sy, sx] = 1; pts = [(sy, sx)]
            while q2:
                cy, cx = q2.popleft()
                for dy, dx in ((1,0),(-1,0),(0,1),(0,-1)):
                    ny, nx = cy + dy, cx + dx
                    if 0 <= ny < H and 0 <= nx < W and inner[ny, nx] and not lab[ny, nx]:
                        lab[ny, nx] = 1; q2.append((ny, nx)); pts.append((ny, nx))
            # ⚠ AND ONLY WHERE A FEATURE COULD BE. "Unreachable from the border" is the
            # right test for the whites of his eyes and dead wrong for a pose that CLOSES
            # a loop: on `sowing` he cups a handful of seeds against his chest, so the
            # gaps between arm, hand and body never touch the border, and this function
            # dutifully filled all three with paper — three white wedges sitting inside
            # his silhouette. (The docstring above assumed real gaps always reach the
            # edge, which held for every pose on the sheet until this one.)
            # Everything this exists to rescue — eye whites, catchlights, teeth — is in
            # his FACE. So: fill freely in the top of the figure, and below it only
            # pockets too small to be anything but a rounding artefact.
            ys = [p2[0] for p2 in pts]
            inFace = (sum(ys) / len(ys)) < (fy0 + (fy1 - fy0) * 0.45)
            if len(pts) >= 6 and (inFace or len(pts) <= 250):
                for (py, px) in pts:
                    out[py, px] = 255
    return out

def decontaminate(rgb, alpha):
    """Push figure colour out under the soft edge.

    Zeroing alpha does not remove the PAPER — a half-transparent edge pixel still
    carries cream RGB, and over a dark plate that composites as a white halo round
    him. (It was invisible on the pale pages, which is why it survived so long; it
    showed the moment he knelt on the dark cross page.) So every pixel that is not
    fully opaque takes its colour from the nearest opaque neighbour instead.
    """
    out = rgb.astype(float).copy()
    solid = alpha > 200
    # ⚠ PAPER ON THE OUTLINE IS NOT KNOWN-GOOD COLOUR. fill_holes() makes enclosed pockets
    # opaque and keeps their colour — right for the whites of his eyes, wrong for a pocket
    # that opens onto his contour (between fingers, inside a fold), which plants paper on
    # his edge. 20% of every outline was paper after the fill. So: an opaque pixel that is
    # BOTH paper-coloured AND within 2px of the outside is treated as unknown and repainted
    # from its neighbours. Interior whites are nowhere near the edge, so they survive.
    inner2 = np.asarray(Image.fromarray((solid * 255).astype('uint8'))
                        .filter(ImageFilter.MinFilter(5))) > 127
    shell = solid & ~inner2
    r0, g0, b0 = rgb[:,:,0], rgb[:,:,1], rgb[:,:,2]
    paperish = (r0 > 200) & (g0 > 185) & (b0 > 175)
    known = solid & ~(shell & paperish)
    for _ in range(8):
        if known.all():
            break
        # ⚠ TAKE A NEIGHBOUR'S COLOUR, DO NOT AVERAGE. Averaging every known neighbour
        # drifts toward grey as the fill spreads, so the ring ends up a pale halo again
        # — the very thing this exists to remove. Copy the nearest known colour instead.
        newly = np.zeros(known.shape, bool)
        for dy, dx in ((1,0),(-1,0),(0,1),(0,-1),(1,1),(1,-1),(-1,1),(-1,-1)):
            msk = np.roll(np.roll(known, dy, 0), dx, 1) & (~known) & (~newly)
            if not msk.any():
                continue
            src = np.roll(np.roll(out, dy, 0), dx, 1)
            out[msk] = src[msk]
            newly |= msk
        if not newly.any():
            break
        known = known | newly
    return np.clip(out, 0, 255).astype(int)

def main():
    sheet, names = sys.argv[1], sys.argv[2:]
    im = Image.open(sheet).convert('RGB')
    a = np.asarray(im).astype(int)
    # the sheet's own paper colour, taken once off its border — fill_holes needs it so it
    # never re-opens a hole the cutter deliberately closed (see the note there)
    _bd0 = np.concatenate([a[:14].reshape(-1, 3), a[-14:].reshape(-1, 3),
                           a[:, :14].reshape(-1, 3), a[:, -14:].reshape(-1, 3)])
    _PAP = np.median(_bd0.astype(int), 0)
    m = cutout_mask(a)
    # close him up so a figure is one blob, not a hood and two paws
    mi = Image.fromarray((m * 255).astype('uint8'))
    mi = mi.filter(ImageFilter.MaxFilter(9)).filter(ImageFilter.MinFilter(7))
    m2 = np.asarray(mi) > 127
    found = blobs(m2, min_px=int(0.004 * a.shape[0] * a.shape[1]))
    print('found %d figures on %s' % (len(found), os.path.basename(sheet)))
    if len(found) != len(names):
        print('  (expected %d: %s)' % (len(names), ', '.join(names)))
    os.makedirs('cast', exist_ok=True)
    for i, (x0, y0, x1, y1, n) in enumerate(found):
        name = names[i] if i < len(names) else 'cell-%d' % i
        pad = 8
        sx0, sy0 = max(0, x0-pad), max(0, y0-pad)
        sx1, sy1 = min(a.shape[1], x1+pad+1), min(a.shape[0], y1+pad+1)
        sub = a[sy0:sy1, sx0:sx1]
        sm = cutout_mask(sub)
        # keep only THIS figure, then soften the edge so it sits in a painted plate
        # ⚠ A SOFT CUT IS A FUZZY CHARACTER. MaxFilter(5)+MinFilter(5) rounds every
        # corner at radius 2 and a 0.7 blur smears the edge over ~2px — on his drawn
        # contour that reads as fuzz. Close at radius 1 and feather barely enough to
        # stop the alpha stair-stepping.
        #
        # ⚠⚠ THEN PULL BACK OFF THE PAPER. Fred: "why can i still see the border of the
        # character... this issue is on the dark pages." The closing grows the mask a
        # pixel into the cream he drew on, so his outermost OPAQUE pixels were paper —
        # a real 1px light outline baked into every cell. Invisible on the pale plates,
        # a halo on the dark ones. Eroding one pixel costs a sliver of his own contour,
        # which nobody can see; keeping it costs a border round every child.
        smi = Image.fromarray((sm * 255).astype('uint8'))
        smi = smi.filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.MinFilter(3))
        smi = smi.filter(ImageFilter.MinFilter(3))
        smi = smi.filter(ImageFilter.GaussianBlur(0.35))
        alpha = np.asarray(smi).astype(int)
        alpha = np.where(largest_only(alpha > 90), alpha, 0)
        alpha = fill_holes(alpha, sub[:, :, :3] if sub.ndim == 3 else None, _PAP)
        ys, xs = np.where(alpha > 60)
        if not len(ys): continue
        sub = decontaminate(sub, alpha)
        alpha = strip_shallow_paper(alpha, sub[:, :, :3])
        sub = tint_eyes(sub, alpha, name)
        rgba = np.dstack([sub, alpha]).astype('uint8')[ys.min():ys.max()+1, xs.min():xs.max()+1]
        out = Image.fromarray(rgba)
        # ⚠ DO NOT THROW HIS RESOLUTION AWAY. He is drawn 600-760px tall on the sheets,
        # and on a phone a large actor wants ~580 device px — capping at 460 meant every
        # big placement was an upscale, which is fuzz you can never sharpen later.
        if out.height > 700:
            out = out.resize((round(out.width * 700 / out.height), 700), Image.LANCZOS)
        out.save('cast/kid-%s.webp' % name, quality=94, method=6)
        print('  kid-%-10s %3dx%-3d  %s' % (name, out.width, out.height, facing_of(rgba)))

def facing_of(rgba):
    """Which way is this drawing looking?

    His cells do NOT all face the same way — `walk` and `side` face left, `running`
    and `teddy` face right — so the engine cannot mirror on one rule. Fred caught
    it on 'he ran': the child was walking away from the Father instead of toward
    him. His eyes are a saturated red-orange and nothing else on him is, so their
    offset from the body's centre says which way he looks.
    """
    a = rgba.astype(int)
    al = a[:,:,3]; r, g, b = a[:,:,0], a[:,:,1], a[:,:,2]
    body = al > 120
    if not body.any():
        return 'facing: -'
    bx = np.where(body.any(axis=0))[0]
    cx = (bx.min() + bx.max()) / 2
    eye = (al > 150) & (r > 150) & (g < 130) & (b < 110) & ((r - g) > 60)
    if eye.sum() < 30:
        return 'facing: none (no face shown)'
    off = (np.where(eye)[1].mean() - cx) / max(1, bx.max() - bx.min())
    if off > 0.04:  return 'facing: RIGHT (%+.3f)' % off
    if off < -0.04: return 'facing: LEFT  (%+.3f)' % off
    return 'facing: front (%+.3f)' % off

main()
