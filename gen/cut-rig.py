#!/usr/bin/env python3
"""Cut Fred's own character sheet into rig parts.

Fred, on the hand-drawn version: "the drawn version looks like shit... nowhere
close to the drawing i gave you."  He was right, and the reason was the medium:
his figure is PAINTED — soft shading, strand hair, a face with features — and
anything drawn in canvas primitives comes out a flat vector icon.  So we stopped
redrawing him and cut him up instead: his art, hung on joints.

Parts: head (hood + face, one piece), torso (the sleeves removed and the sliver
of body they were hiding rebuilt), and the two sleeves with their paws.

The seam numbers below are read off HIS drawing — the dark line down the inside
of each sleeve — not invented.  See engine/character.js drawKidRig().
"""
from PIL import Image, ImageFilter
import numpy as np, json, os

SHEET = 'cast/sheets/1-turnaround.jpg'
CELL  = (183, 40, 420, 486)            # his front figure
OUT   = 'cast/rig'

SEAM_L = [(228,61),(260,55),(290,50),(320,45),(348,39),(384,42)]
SEAM_R = [(228,176),(260,181),(290,186),(320,191),(348,198),(384,195)]
BODY_L = [(196,50),(240,45),(290,39),(340,34),(380,31),(400,33)]
BODY_R = [(196,187),(240,192),(290,198),(340,203),(380,205),(400,203)]
# the head is cut BELOW where the torso starts, so the two pieces overlap and no
# seam of background can show through at the shoulders (it did, at 2px, once)
HEAD_BOT, ARM_TOP, ARM_BOT, TORSO_TOP = 230, 226, 384, 194
# THE SHOULDER, not the neck.  Fred: "it looks like the hands come from the traps
# instead of the shoulder."  The joint belongs at the top-CENTRE of the sleeve
# tube (his sleeve spans x 26..57 at y 250, so centre 42), not at its inner edge.
PIVOT = {'arm-l': [42, 243], 'arm-r': [196, 243], 'head': [118, 206]}
# where the paw actually sits at rest, so a hand target solves exactly
HAND  = {'arm-l': [22, 361], 'arm-r': [215, 361]}

def lerp(y, pts):
    for i in range(len(pts)-1):
        (y0,v0),(y1,v1) = pts[i], pts[i+1]
        if y <= y1 or i == len(pts)-2:
            t = 0 if y1==y0 else max(0,min(1,(y-y0)/(y1-y0)))
            return v0 + (v1-v0)*t
    return pts[-1][1]

def cutout(cell):
    """Lift him off the paper — and off the cast shadow he was drawn with."""
    a = np.asarray(cell).astype(int)
    r,g,b = a[:,:,0],a[:,:,1],a[:,:,2]; lum = a.sum(axis=2)/3
    blue = (b > r+22) & (b > 80); dark = lum < 130
    skin = (abs(r-b) < 34) & (lum > 80) & (lum < 190)
    ys,xs = np.where(blue|dark); y0,y1,x0,x1 = ys.min(),ys.max(),xs.min(),xs.max()
    head = np.zeros(blue.shape, bool); head[y0:y0+int(0.50*(y1-y0)), x0:x1] = True
    fig = (blue|dark) | (skin & head)
    m = Image.fromarray((fig*255).astype('uint8'))
    m = m.filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.MinFilter(5)).filter(ImageFilter.GaussianBlur(0.6))
    alpha = np.asarray(m).astype(int)
    # keep the largest blob only, so stray marks don't travel with him
    from collections import deque
    A = alpha > 90; H,W = A.shape; seen = np.zeros((H,W), bool); best = None
    for sy in range(0,H,4):
        for sx in range(0,W,4):
            if not A[sy,sx] or seen[sy,sx]: continue
            q=deque([(sy,sx)]); seen[sy,sx]=True; pts=[]
            while q:
                cy,cx=q.popleft(); pts.append((cy,cx))
                for dy,dx in ((1,0),(-1,0),(0,1),(0,-1)):
                    ny,nx=cy+dy,cx+dx
                    if 0<=ny<H and 0<=nx<W and not seen[ny,nx] and A[ny,nx]:
                        seen[ny,nx]=True; q.append((ny,nx))
            if best is None or len(pts)>len(best): best=pts
    keep=np.zeros((H,W),bool)
    for cy,cx in best: keep[cy,cx]=True
    keep = np.asarray(Image.fromarray((keep*255).astype('uint8')).filter(ImageFilter.MaxFilter(3)))>127
    alpha = np.where(keep, alpha, 0)
    ys,xs = np.where(alpha>60)
    return np.dstack([a, alpha]).astype(int)[ys.min():ys.max()+1, xs.min():xs.max()+1]

def main():
    os.makedirs(OUT, exist_ok=True)
    a = cutout(Image.open(SHEET).convert('RGB').crop(CELL))
    H,W = a.shape[:2]
    xs = np.arange(W)[None,:].repeat(H,0); ys = np.arange(H)[:,None].repeat(W,1)
    seamL = np.array([lerp(y,SEAM_L) for y in range(H)])[:,None]
    seamR = np.array([lerp(y,SEAM_R) for y in range(H)])[:,None]
    bodyL = np.array([lerp(y,BODY_L) for y in range(H)])[:,None]
    bodyR = np.array([lerp(y,BODY_R) for y in range(H)])[:,None]
    rig = {'figure': {'w': W, 'h': H}}

    def emit(name, arr):
        yy,xx = np.where(arr[:,:,3] > 40)
        box = [int(xx.min()), int(yy.min()), int(xx.max()-xx.min()+1), int(yy.max()-yy.min()+1)]
        piece = arr[yy.min():yy.max()+1, xx.min():xx.max()+1].astype('uint8')
        Image.fromarray(piece).save(os.path.join(OUT, name+'.webp'), quality=94, method=6)
        rig[name] = {'box': box}
        if name in PIVOT: rig[name]['pivot'] = PIVOT[name]
        if name in HAND:  rig[name]['hand']  = HAND[name]
        print('%-7s %3dx%-3d at %d,%d' % (name, box[2], box[3], box[0], box[1]))

    for side, out in (('l','arm-l'), ('r','arm-r')):
        m = (ys>=ARM_TOP)&(ys<=ARM_BOT)&((xs < seamL) if side=='l' else (xs > seamR))
        p = a.copy(); p[:,:,3] = np.where(m, a[:,:,3], 0)
        # ROUND AND FEATHER THE SHOULDER END.  A straight cut reads as a flag the
        # moment the arm swings up — the tell-tale of every cut-out rig.  Fading
        # the top rows makes the sleeve look like it emerges from under the hood,
        # which is what it does in his drawing anyway.
        px, py = PIVOT[out]
        d = np.sqrt((xs-px)**2 + (ys-py)**2)
        cap = np.clip((50 - d) / 20.0, 0, 1)                  # round it off
        fade = np.clip((ys - ARM_TOP) / 30.0, 0, 1)           # and fade the cut, long
        soft = np.where(ys < py, np.minimum(cap, fade), 1.0)
        p[:,:,3] = (p[:,:,3] * soft).astype(int)
        emit(out, p)

    # the torso: sleeves gone, and the strip they were hiding rebuilt by mirroring
    # the fabric just inside it — his cloth streaks vertically, so this reads
    # THE TORSO KEEPS ITS SHOULDER.  If the whole sleeve leaves with the arm, a
    # raised arm exposes a hole where the garment's shoulder should be.  So down
    # to y=238 the torso keeps the full silhouette, then tapers back to the body's
    # own bell by y=292 — the hoodie has a shoulder whether the arm is up or not.
    # NO SHOULDER STUB.  Giving the body the sleeve's full width down to y=238 and
    # then stepping in left a little T-shirt sleeve with a hard edge — the notch
    # Fred circled.  His body under the sleeve is simply a smooth bell, and that
    # is what a raised arm should reveal.
    outL = bodyL.copy(); outR = bodyR.copy()
    t = a.copy(); inside = (xs>seamL)&(xs<seamR)
    within = (ys>=TORSO_TOP)&(xs>=outL)&(xs<=outR)
    t[:,:,3] = np.where((ys>=TORSO_TOP)&(inside|within|(ys>ARM_BOT)), a[:,:,3], 0)
    patch = ((ys>=TORSO_TOP)&(ys<=ARM_BOT)) & (((xs>=outL)&(xs<=seamL+2))|((xs<=outR)&(xs>=seamR-2))) & (a[:,:,3]<40)
    for yy,xx in zip(*np.where(patch)):
        left = xx < W//2
        edge = outL[yy,0] if left else outR[yy,0]; seam = seamL[yy,0] if left else seamR[yy,0]
        src = max(0, min(W-1, int(round(2*seam-xx))))
        if a[yy,src,3] < 40: src = max(0, min(W-1, int(seam + (6 if left else -6))))
        c = a[yy,src,:3].astype(float) * (0.84 + 0.16*min(1.0, abs(xx-edge)/max(1.0,abs(seam-edge))))
        t[yy,xx,:3] = np.clip(c,0,255); t[yy,xx,3] = 255
    t[:,:,3] = np.where(patch, 255, t[:,:,3])
    em = Image.fromarray((t[:,:,3]>128).astype('uint8')*255)
    rim = (np.asarray(em)>128)&(np.asarray(em.filter(ImageFilter.MinFilter(3)))<128)&((ys>=TORSO_TOP+8)&(ys<=ARM_BOT+6))
    t[:,:,:3] = np.where(rim[:,:,None], t[:,:,:3]*0.55 + np.array([22,50,84])*0.45, t[:,:,:3])
    # the body is COMPLETE — head, torso and legs in one piece, only the sleeves
    # taken off it.  A raised arm is then a separate mesh laid over a body that is
    # already whole, so there is no bat-wing of stretched cloth between them and
    # no cut edge to catch the eye.
    t[:,:,3] = np.where(ys < TORSO_TOP, a[:,:,3], t[:,:,3])
    emit('body', t)
    emit('torso', t)

    # the head last, and cut low so it laps over the torso's shoulders
    hd = a.copy()
    hd[:,:,3] = np.where((ys<HEAD_BOT) | ((ys<HEAD_BOT+16)&inside), a[:,:,3], 0)
    emit('head', hd)

    json.dump(rig, open(os.path.join(OUT,'rig.json'),'w'), indent=1)
    print('->', os.path.join(OUT,'rig.json'))

main()
