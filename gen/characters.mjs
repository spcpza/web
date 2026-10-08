// ═══════════════════════════════════════════════════════════════════════════
//  THE CHARACTER LIBRARY
//  ─────────────────────
//  Fred: "if you change the light figure to gold-ish, you need to change the
//  light figure for the WHOLE BOOK. is there a way where we can just create a
//  character library and we use the assets from that library for the whole
//  book? this would make us be able to create a story book easier in the
//  future."
//
//  Yes — and this is it. Every person in the book is defined ONCE here: their
//  palette, their proportions, how they are built and lit. A plate never
//  decides what the Light looks like; it says WHERE he stands and what he is
//  doing. Change a colour in CAST below and it changes everywhere the next
//  time a plate is built.
//
//  ⚠ THIS IS THE ONLY PLACE A CHARACTER'S LOOK MAY BE DECIDED. If a plate
//  starts hand-painting a figure's colours, the book drifts apart page by
//  page — which is exactly what happened before this file existed: the Light
//  was white on one page, gold on another, a smear on a third.
// ═══════════════════════════════════════════════════════════════════════════

import * as E from './engine.mjs';   // (circular by design: only used inside the functions below)

export const CAST = {
  // THE LIGHT — the Father, the Son, the walking radiance. One Person, one look,
  // from creation to the homecoming. He is LIGHT, but he must read as somebody:
  // white alone disappears against his own glory, so his light is woven with gold.
  light: {
    body:    ['#8a6a22', '#c39a3c', '#efd07a', '#fdf0c2', '#fffdf2'],
    contour: '#2a1608',      // ⚠ a radiant figure still needs an EDGE or it dissolves
    halo:    ['#fff8dc', '#ffe6a2', '#e8c268'],
    haloR:   0.34,           // × height — modest; a big halo erases the figure it haloes
    contourK: 1.42,          // how much fatter than the body the contour sits
  },
  // THE CHILD — the little pilgrim, and the READER. Deep red cloak, ivory face.
  // The one character who appears on nearly every page, so the one that most
  // needs to be identical every time (see character.js for the runtime twin).
  // ⚠ HER TRUE PALETTE LIVES IN engine/character.js (`RED` / `MASKC`), because she is drawn
  // at RUNTIME, not painted into the plates (see the DEBAKE note in paintTheChild). These are
  // the same values, mirrored here so the library can state the whole cast in one place and
  // so the character sheet at /characters can show them. Change both together.
  child: {
    cloak:  ['#dc3f2c', '#b0271c', '#7a160e'],   // lit · base · shade   (= RED)
    mask:   ['#f6efdc', '#e8dfc4', '#c4b898'],   // face                 (= MASKC)
    pocket: ['#5a3a14', '#7a5220', '#9a6c2c'],   // the warm shade behind the face
  },
};

/**
 * THE LIGHT, standing or striding. Returns the capsules, so a plate can hang
 * things off him (a hand, a lamp, a child on the shoulders).
 */
export function paintTheLight(out, counter, rng, o) {
  const { x, y, h, hands, feet, headTilt = 0 } = o;
  const L = CAST.light;
  const top = y - h, shY = top + h * 0.25;
  const caps = E.personCaps(x, top, h, {
    headTilt, armLen: o.armLen, headK: o.headK, shoulderK: o.shoulderK,
    leftHand:  (hands && hands[0]) || [x - 20, top - 20],
    rightHand: (hands && hands[1]) || [x + 20, top - 18],
    leftFoot:  (feet && feet[0]) || [x - 16, y],
    rightFoot: (feet && feet[1]) || [x + 17, y - 2],
  });
  E.castShadow(out, counter, caps, { dir: o.shadowDir != null ? o.shadowDir : 0.5 });
  // ⚠ NO ROBE. HE IS A FIGURE OF LIGHT, AND NOTHING ELSE. I gave him a robe to fix his
  // spindly build; Fred: "no to the robe. i want to keep it stickman because the father is
  // really just light… but the light became human so this is why my original idea was a
  // stickman. consult scripture." Scripture is plain, and it rules against the robe:
  //   1 John 1:5 — "God is LIGHT, and in him is no darkness at all."  He does not WEAR
  //                light; a garment would be a thing about him that is not light.
  //   John 1:14  — "And the Word was made FLESH, and dwelt among us."  So the light takes
  //                a HUMAN shape — which is why a ball of light is wrong too: it denies the
  //                incarnation, the very thing this book is about.
  // A human figure made only of light is therefore the correct form, and it is Fred's.
  // What was actually wrong was never the robe's absence — it was that the light had no
  // MASS, so it read as a stalk. That is fixed by giving the limbs and body real weight
  // (below), not by dressing him.

  // the halo, small on purpose
  E.strokes(out, counter, {
    rng, n: Math.round(h * 0.9),
    sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 1.3) * h * L.haloR;
                   return [x + Math.cos(a) * d, (y - h * 0.42) + Math.sin(a) * d * 1.05]; },
    dir: () => 0,
    col: (px, py, r) => E.jig(E.ramp(L.halo, Math.hypot(px - x, (py - (y - h * 0.42)) / 1.05) / (h * L.haloR)), r, 8),
    // ⚠ relief:0 — A HALO IS LIGHT, IT CANNOT CAST A SHADOW. With the default relief every
    // halo mark got a shadow edge, and the halo's top rim drew a dark arc straight across
    // his neck: the second half of the "dirt" Fred pointed at, and not paint on his face
    // at all — it was the glow shading itself.
    len: 7, lw: 2.1, steps: 2, impasto: 0.4, relief: 0,
  });
  // ⚠ ALL OF HIM IS PAINTED — there is no garment to hide behind. What stops him reading as
  // a stalk is WEIGHT: the contour is thick, and the torso and limbs are widened below,
  // because personCaps gives a figure a torso narrower than its own head.
  const shown = caps.map(c => ({ ax: c.ax, ay: c.ay, bx: c.bx, by: c.by,
    r: c.r * (c === caps[2] ? 1.55 : c.r < h * 0.09 ? 1.35 : 1.15) }));
  E.underpaintCapsules(out, counter,
    shown.map(c => ({ ax: c.ax, ay: c.ay, bx: c.bx, by: c.by, r: c.r * L.contourK })), L.contour);
  // ⚠ A SOLID BODY BEFORE ANY BRUSHWORK — the lesson this book has now learned three
  // times (the held apple, the discarded hand prop, and finally his own shoulders).
  // strokes() lays discrete marks at partial opacity: they NEVER tile a shape completely,
  // so whatever sits underneath shows through the gaps. Underneath him were two dark
  // things — his own contour, and twoways' dark-green chiaroscuro pocket — and they came
  // up through his shoulders as a band of olive hooks that read as filth. (Those hooks
  // were literally the pocket's own tangential strokes, seen through him.) So: fill the
  // capsules solid and warm FIRST. Now a gap in the brushwork shows gold, not ground.
  E.underpaintCapsules(out, counter, shown, '#e8c268');
  E.paintLight(out, counter, rng, shown);
  E.paintFigure(out, counter, rng, shown, (px, py, r) => {
    // ⚠ A SHALLOWER SHADOW SIDE. At side*0.5 the ramp bottomed out at 0.22 — near
    // L.body's darkest — and with relief on, the shaded flank came out SPECKLED dark.
    // Right under a bright head that reads as a dirty collar (the last of the marks
    // Fred pointed at). He is light: he may turn, but he must not go muddy.
    const side = Math.max(0, Math.min(1, (px - (x - h * 0.2)) / (h * 0.4)));
    return E.jig(E.ramp(L.body, 0.72 - side * 0.32 + r() * 0.28), r, 9);
  }, 1.15, 1, 1, 0.86);
  // ⚠ A HEAD THAT DOES NOT SEPARATE. Painted as one radiant mass, his head merged straight
  // into his shoulders and he read as a glowing pillar — visible on the character sheet the
  // moment the cast was lined up against a plain ground. Two marks fix it: the crown catches
  // the most light (it is nearest the sky), and the jaw throws a shadow onto the neck. That
  // is all a head needs to become a head.
  const head = caps[0];
  if (head) {
    // the shoulders, drawn as their own mass under the head — without them a standing figure
    // has no width where a person is widest, and reads as a pillar
    // ⚠ SHOULDERS, NOT A SLAB. These were widened to h*0.21 to bury the dark contour
    // collar at his neck — but that is far wider than the arm joints (h*0.072×shoulderK),
    // so he grew a hard square overhang with the arms dangling underneath it. Fred: "the
    // right arm of light kind of look weird" — it was never the arm, it was this. The
    // solid body underpaint covers the collar now, so the shoulders can go back to just
    // over-reaching the joints, and taper into the arms the way a shoulder does.
    const shW = h * 0.155, shY2 = top + h * 0.275;
    E.strokes(out, counter, {
      rng, n: Math.round(h * 1.35),
      sample: r => [x + (r() + r() - 1) * shW, shY2 + (r() - 0.5) * h * 0.105],
      dir: () => 0.05,
      col: (px, py, r) => E.jig(E.ramp(L.body, 0.52 + r() * 0.36), r, 6),
      len: 7, lw: 3.2, steps: 2, impasto: 0.15, relief: 0,   // relief:0 — see the note on his face below
    });
    const hx = (head.ax + head.bx) / 2, hy = (head.ay + head.by) / 2, hr = head.r;
    // ⚠ NOTHING DARK MAY LAND ON HIS FACE. Fred, pointing at the head: "can you first
    // remove this dirt?" The specks were not a colour bug — they were RELIEF. strokes()
    // defaults to `relief = 1`, so every single mark gets a lit edge AND a shadow edge
    // (gen/engine.mjs reliefPair). That is what makes foliage and stone read as form, and
    // it is exactly wrong on a small pale head: a few hundred little shadow edges scattered
    // over cream is indistinguishable from grime. Two more things piled on: jig()'s
    // manifold accent (the complement of gold is BLUE, so the "rainbow fleck" reads as
    // dirt on a face) and the body ramp's dark end landing on the brow.
    // He is a figure of LIGHT — "God is light, and in him is no darkness at all" (1 John
    // 1:5). His face is the last surface in this book that may go muddy. So the head is
    // repainted LAST, flat and clean: relief off, impasto off, no flecks, and a ramp that
    // starts high and only goes paler. Form still comes from the contour and the crown.
    {
      const mf = E.getManifold();
      E.setManifold(0);
      // the same clean coat across the neck and shoulders. The head's contour skirt and
      // the torso's shaded top meet here, and whatever exact mark wins, the result was a
      // grubby collar on a figure who is supposed to BE light. Covering the seam is more
      // reliable than chasing which stroke group drew it.
      E.strokes(out, counter, {
        rng, n: Math.round(h * 1.15),
        sample: r => [x + (r() + r() - 1) * shW * 0.98, shY2 + (r() + r() - 1) * h * 0.06],
        dir: () => 0.05,
        col: (px, py, r) => E.jig(E.ramp(L.body, 0.58 + r() * 0.32), r, 5),
        len: 6, lw: 3, steps: 2, relief: 0, impasto: 0, op: 1,
      });
      const hc = shown[0];
      const bx0 = Math.min(hc.ax, hc.bx) - hc.r, bx1 = Math.max(hc.ax, hc.bx) + hc.r;
      const by0 = Math.min(hc.ay, hc.by) - hc.r, by1 = Math.max(hc.ay, hc.by) + hc.r;
      E.strokes(out, counter, {
        rng, n: Math.round(hr * 9),
        sample: E.rej(bx0, by0, bx1, by1, (px, py) => E.inCap(px, py, hc)),
        dir: () => 0.1,
        col: (px, py, r) => E.jig(E.ramp(L.body, 0.66 + r() * 0.3), r, 4),
        len: 5, lw: 2.6, steps: 2, relief: 0, impasto: 0, op: 1,
      });
      E.strokes(out, counter, {                                // the lit crown
        rng, n: Math.round(hr * 2.6),
        sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 0.6) * hr * 0.8;
                       return [hx + Math.cos(a) * d, hy - hr * 0.36 + Math.sin(a) * d * 0.6]; },
        dir: () => 0,
        col: (px, py, r) => E.jig(E.mix('#fdf0c2', '#fffdf2', r()), r, 4),
        len: 4, lw: 1.7, steps: 2, relief: 0, impasto: 0, op: 0.8,
      });
      E.setManifold(mf);   // ⚠ put the PLATE's rate back, not a hardcoded default
    }
    // ⚠ THE UNDER-JAW SHADOW IS GONE. It was #6b4c14 — dark BROWN — brushed across the
    // chin and neck to separate the head from the shoulders, and at plate scale it read
    // as a smear of dirt under his face (the thing Fred pointed at). The separation it
    // was doing is already carried by the silhouette now that shoulderK widens him past
    // his own skull, so the band bought nothing and cost his face.
  }
  return { caps, top, shY };
}

/** THE CHILD — the little pilgrim. `y` is the foot line, `h` the height. */
export function paintTheChild(out, counter, rng, o) {
  const { x, y, h, facing = 1, mood = 'joy', eye = [0.4, -0.6], arms } = o;
  const C = CAST.child, top = y - h;
  // ⚠ DEBAKE IS ON BY DEFAULT: `paintMask` refuses to paint into a plate (build.mjs sets
  // globalThis.__SKIP_FIG unless DEBAKE=0), because every pilgrim in this book is a RUNTIME
  // SPRITE in engine/character.js, not baked art. So the pocket behind her face must skip
  // too — otherwise the plate keeps a brown smudge with nobody in front of it, which is
  // exactly what was sitting over the Father's head on `twoways`.
  if (globalThis.__SKIP_FIG) return;
  E.strokes(out, counter, {                       // the warm pocket the ivory face reads against
    rng, n: Math.round(h * 1.7),
    sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 0.7) * h * 0.46;
                   return [x + Math.cos(a) * d, (y - h * 0.55) + Math.sin(a) * d * 0.95]; },
    dir: () => 0,
    col: (px, py, r) => E.jig(E.ramp(C.pocket, Math.hypot(px - x, py - (y - h * 0.55)) / (h * 0.46)), r, 8),
    len: 9, lw: 3, steps: 2, impasto: 0.4,
  });
  E.paintMask(out, counter, rng, {
    x, y, h, facing, shadow: 0, mood, eye,
    armL: (arms && arms[0]) || [x - h * 0.36, top + 2],
    armR: (arms && arms[1]) || [x + h * 0.36, top + 4],
  });
}

/**
 * CARRIED HOME — the Light bearing the child on his shoulders (Luke 15:5).
 * A recurring motif, so it lives here rather than being re-derived per page.
 * ⚠ The child rides CLEAR of his head: the pilgrim's cloak flares well below
 * its own base, and placed at the shoulder line it swallows his head whole.
 */
/**
 * WHERE THE CARRIED CHILD RIDES. The plate bakes the Light; the child is a runtime sprite
 * in engine/character.js — two different files that must describe the SAME pose. This is
 * the one place that pose is defined, so when the Light moves, the sprite's numbers come
 * from here rather than from somebody's memory of where he used to stand.
 */
export function carriedChildAt(x, y, h, childH) {
  const top = y - h, kH = childH || h * 0.52, kBase = top - h * 0.1;
  return { x, y: +kBase.toFixed(1), h: +kH.toFixed(1),
           armL: [+(x - kH * 0.44).toFixed(1), +(kBase - kH + 2).toFixed(1)],
           armR: [+(x + kH * 0.44).toFixed(1), +(kBase - kH + 4).toFixed(1)] };
}

export function paintCarried(out, counter, rng, o) {
  const { x, y, h } = o;
  const top = y - h;
  // ⚠ THE CARRIER HAS TO READ AS A BODY, or nothing you do with the child will make sense.
  // Fred, twice, on renders of this page: "this is totally weird. this is not how you piggy
  // back someone." He was right, and the child's coordinates were never the problem — the
  // Father below him had no head and no shoulders, just a column of light. His hands now
  // reach to where a child's KNEES would be if that child sat on his shoulders (beside his
  // own head, not above it), which is the gesture that says "carrying" rather than "reaching".
  // ⚠ A PIGGYBACK IS HELD UNDER THE THIGHS, not up by the head.  These hands used to
  // reach beside his own head, which is a SHOULDER ride — right for the older pose where
  // the child sat up on him, wrong now that the child rides his back.  Fred: "can you also
  // make the light's hand to be holding the child?"  The child's thighs land at about
  // top + 0.375h once he is sized as a child (0.56 of the carrier), so that is where the
  // hands go — out at his sides, taking the weight.
  const { shY } = paintTheLight(out, counter, rng, {
    x, y, h, headTilt: o.headTilt ?? 2, armLen: o.armLen, headK: o.headK, shoulderK: o.shoulderK,
    // ⚠ AT HIS LEGS, NOT HIS ARMS. At 0.375h these landed level with the child's own
    // outstretched paws and read as gold discs pasted over them. A carry is held lower
    // — the hands come round the child's thighs, well below where his arms are. And
    // they are centred on the CHILD, who sits a little off the carrier's centre line so
    // the Light's own head stays visible (see CAST1[17]).
    hands: o.hands || [[x - h * 0.235, top + h * 0.505], [x + h * 0.235, top + h * 0.495]],
    // ⚠ feet are overridable now — a carrier who is taking someone HOME has to be
    // walking, and a stride is set from the plate that knows where the road runs.
    feet:  o.feet || [[x - 16, y], [x + 17, y - 2]],
    shadowDir: o.shadowDir,
  });
  const kH = o.childH || h * 0.52, kBase = top - h * 0.1;
  paintTheChild(out, counter, rng, {
    x, y: kBase, h: kH,
    arms: [[x - kH * 0.44, kBase - kH + 2], [x + kH * 0.44, kBase - kH + 4]],
  });
  return { shY, kBase, kH };
}
