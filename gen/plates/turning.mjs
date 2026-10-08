// gen/plates/turning.mjs — "The turning" — the first refusal (§ between)
//
// THE MOMENT SIN ENTERED. Romans 5:12 — "by one man sin entered into the world."
//
// ⚠ REBUILT AROUND ONE QUESTION. Fred: "how do i show the reader that the main
// character is walking towards the dark?" The old plate could not answer it, and no
// animation laid over it could either: it was a chiaroscuro FIELD — gold swirling on
// the left, cobalt-violet on the right, a seam between them — and a field has no
// ground to walk on and no direction to walk in. Standing in it, the figure could
// only ever be standing.
//
// So the page gets BONES, and scripture names them. Isaiah 53:6 — "we have turned
// every one to his own WAY." Not a mood: a road. Five things now say it, and only the
// last of them moves:
//   · a HORIZON, so there is a world with a far side;
//   · a ROAD, ruled and narrowing (Munch: a made thing runs straight) that comes out
//     of the light behind us, passes under his feet, and vanishes into the violet;
//   · his BACK — a face poses, a back leaves, and it sets the reader at his shoulder;
//   · his SHADOW thrown FORWARD, long and low, arriving at the vanishing point before
//     he does — the light is behind us, so the shadow can only point where he is going;
//   · his FOOTPRINTS behind him on the lit stone, dimming, so the eye reads backwards
//     to the gold and understands he came OUT of it and is already well gone.
//
// The Light itself is never in frame and never dies: it is at our backs, blazing on
// the near ground, on the road, on his back as he walks away from it. Isaiah 53:6
// does not end at the straying — "and the LORD hath laid on him the iniquity of us
// all" — so this page may show a refusal but must never show an abandonment.
//
// No pure black: the dark is deep cobalt going violet, alive and cold.
export const name = 'turning';
export const title = 'The turning';
export const caption = 'But you turned away.';
export const seed = 20260617;
export const focal = { x: 400, y: 262 };  // him on the road, mid-stride
// MOBILE 3D — depth planes (FAR→NEAR): sky, ground, road, shadow and verse are the
// opaque BACKGROUND; the small figure walking away is the FOREGROUND, nearest,
// parallaxing free of the road he walks on.
export const layers = [
  { name: 'bg', opaque: true },  // sky + ground + road + cast shadow + verse (backmost, opaque)
  { name: 'fg' },                // the little pilgrim, walking away (nearest)
];

export function paint(E, opts = {}) {
  const {
    mulberry32, fbm, curlV, lightRadial, mix, ramp, jig,
    strokes, rej, paintPath, segDist, ribbon,
    inscriptionText, greekRef, svgWrap, W, H,
    GOLD, GOLD_PALE, GOLD_DEEP, GOLD_HOT,
  } = E;

  const rng = mulberry32(seed);
  const out = [];
  const counter = { n: 0 };
  const LAYER = opts.layer || 'full';
  const fgRanges = [];
  // ⭐ DETAIL PASS (Sep 8). EVERY STROKE DRAWS ITS OWN WIDTH AND LENGTH (Fred: "use no
  // rules, a paint stroke just exist because it exist"): two independent hashes per mark.
  // The deficit here: beds at lw 18–20, detail at lw 5–7, relief 0.6 — a night plate tiled
  // into flagstones, and a wall of fat lumps along the horizon.
  const free = (x, y, salt) => { const n = Math.sin(x * 12.9898 + y * 78.233 + salt) * 43758.5453; return n - Math.floor(n); };
  const widthOf  = (x, y, salt) => 0.40 + 3.2 * Math.pow(free(x, y, salt), 2.6);
  const lengthOf = (x, y, salt) => 0.40 + 1.5 * Math.pow(free(x, y, salt + 17), 1.5);

  out.push(`<rect width="${W}" height="${H}" fill="#171232"/>`);

  /* ====================== THE BONES ====================== */
  const HZ = 232;                        // the horizon: the far side of the world he chose
  const VPX = 620, VPY = HZ + 4;         // where his way disappears
  const FX = 388, FY = 318;              // his feet, on the road, past the middle of the way
  // ⚠ THE LIGHT IS BEHIND THE READER, LOW AND NEAR — and that one decision is what
  // makes the whole page legible. A shadow falls AWAY from its light, so a source
  // above or beside him throws his shadow sideways and the picture says nothing about
  // direction. Put it at our backs and every shadow in the frame points the same way:
  // into the distance, into the dark. It is also true to the story — the world he came
  // from is the one at our shoulder, and it is still shining on him.
  const LX = 120, LY = 528;
  const gL = lightRadial(LX, LY, 470);
  const warm = (x, y) => Math.min(1, gL(x, y) * 1.15);

  /* ====================== 1. THE SKY HE WALKS UNDER ====================== */
  // deep cobalt ripening to violet, deepest at the top-right — the cold he is heading
  // into, curling (Munch: living dark is never ruled). Low on the LEFT, just over the
  // horizon, the last warmth of the light behind us still catches the far air.
  // ⚠ UNDERPAINT FIRST. Detail marks alone leave gaps, and every gap shows the deep
  // violet ground as a chip of the wrong colour — which reads as confetti, not as
  // paint. A bed of big slow marks goes down before anything fine.
  // ⚠ the sky at the plate's 0.014 fleck rate now carries 3× the marks it did, so 3× the
  // lime chips — the exact litter Fred named on this page. The sky paints at 0.005.
  const _MS = E.getManifold(); E.setManifold(0.005);
  strokes(out, counter, {
    rng, n: 700,
    sample: rej(-14, -14, 814, HZ + 8),
    dir: (x, y) => { const [a, b] = curlV(x, y, 60, 200); return Math.atan2(-0.2 + b * 1.6, 0.6 + a * 1.6); },
    col: (x, y, r) => jig(ramp(['#2a3474', '#28286e', '#2e2070', '#382066', '#3e1f56'],
      Math.max(0, Math.min(1, x / W * 0.8 + (1 - y / HZ) * 0.3))), r, 7),
    len: (x, y) => 40 * lengthOf(x, y, 11), lw: (x, y) => 5 + 5 * free(x, y, 13), steps: 3, follow: 0.9, lenJ: 0.3, wJ: 0.3, impasto: 0.3, relief: 0.2,   // a bed: its own width each, but no giants — the giants were the lumps on the horizon
  });
  strokes(out, counter, {
    rng, n: 3200,
    sample: rej(-14, -14, 814, HZ + 6),
    dir: (x, y) => { const [a, b] = curlV(x, y, 34, 150); return Math.atan2(-0.25 + b * 2.2, 0.55 + a * 2.2); },
    col: (x, y, r) => {
      const t = Math.max(0, Math.min(1, x / W * 0.75 + (1 - y / HZ) * 0.35 + fbm(x / 120, y / 110, 61) * 0.25));
      let c = ramp(['#27306e', '#252668', '#2b1e6a', '#341f60', '#3b1d50'], t);
      const glow = Math.max(0, 1 - Math.hypot((x - 90) / 300, (y - (HZ - 26)) / 70));   // the dying warmth, low-left
      c = mix(c, '#b98a48', glow * 0.55);
      return jig(c, r, 5);
    },
    len: (x, y) => 22 * lengthOf(x, y, 21), lw: (x, y) => 3.2 * widthOf(x, y, 23), steps: 4, follow: 0.88, wild: 0.06, lenJ: 0.3, wJ: 0.3, impasto: 0.4, relief: 0.3,
  });
  // the crests of the cold: hair-fine strokes riding the same curl, a shade lifted — the
  // sky he walks under has grain, not a wash
  strokes(out, counter, {
    rng, n: 1600,
    sample: rej(-14, -14, 814, HZ + 4),
    dir: (x, y) => { const [a, b] = curlV(x, y, 34, 150); return Math.atan2(-0.25 + b * 2.2, 0.55 + a * 2.2); },
    col: (x, y, r) => {
      const t = Math.max(0, Math.min(1, x / W * 0.75 + (1 - y / HZ) * 0.35));
      let c = ramp(['#2f3a80', '#2c2a7a', '#3a2a80', '#452a74', '#4a2a62'], t);
      const glow = Math.max(0, 1 - Math.hypot((x - 90) / 300, (y - (HZ - 26)) / 70));
      c = mix(c, '#c89a58', glow * 0.5);
      return jig(c, r, 5);
    },
    len: (x, y) => 16 * lengthOf(x, y, 25), lw: (x, y) => 1.2 * widthOf(x, y, 27), steps: 4, follow: 0.9, lenJ: 0.3, wJ: 0.3, impasto: 0, relief: 0.2, op: 0.75,
  });

  E.setManifold(_MS);
  /* ====================== 2. THE GROUND ====================== */
  // one plane, running from blazing lit earth at our feet to cold violet at the far
  // side. Every mark lies along the recession (all of them pointing the way the road
  // goes), so the ground itself leans toward the vanishing point.
  const rec = (x, y) => Math.atan2(y - VPY, x - VPX);
  // ⚠ NO COMPLEMENTARY FLECK ON THE EARTH. jig()'s flip turns gold ground and road-stone
  // TURQUOISE (the "manifold goes cyan" trap) — the fat cyan chips on the lit road were that.
  // The bow-in-the-field pass below adds its own chosen accents; the sky keeps the plate's rate.
  const _MG = E.getManifold(); E.setManifold(0);
  strokes(out, counter, {   // the bed
    rng, n: 1200,
    sample: rej(-14, HZ + 4, 814, 514),
    dir: (x, y) => rec(x, y),
    col: (x, y, r) => jig(ramp(['#2e2558', '#3e3160', '#644a52', '#946c3e', '#c8933c', '#efc472'],
      Math.min(1, warm(x, y) * 1.22)), r, 7),
    len: (x, y) => 36 * lengthOf(x, y, 31), lw: (x, y) => (4 + 5 * free(x, y, 33)) * Math.min(1, 0.3 + (y - HZ) / 90), steps: 3, follow: 0.95, lenJ: 0.3, wJ: 0.3, impasto: 0.3, relief: 0.2,   // thin at the far edge (1/Z), no giants
  });
  strokes(out, counter, {
    rng, n: 5200,
    sample: rej(-14, HZ - 8, 814, 514),
    dir: (x, y) => { const [a, b] = curlV(x, y, 40, 120); return rec(x, y) + (a + b) * 0.30; },
    col: (x, y, r) => {
      const w = warm(x, y);
      let c = ramp(['#2c2358', '#3c2f60', '#5b4358', '#8a6440', '#c08c38', '#e6b455', '#ffdf9e'], Math.min(1, w * 1.22));
      // broken colour, and a minority of it: the shadow between the lit marks is made
      // of marks that keep their own value, never a wash laid over the top
      if (w < 0.30 && r() < 0.05) return jig(mix('#2a2358', '#5f4a8e', r() * 0.7), r, 12);
      return jig(c, r, 6);
    },
    len: (x, y) => (10 + 22 * Math.min(1, (y - HZ) / (H - HZ) + 0.15)) * lengthOf(x, y, 41), lw: (x, y) => 2.8 * widthOf(x, y, 43),
    steps: 3, follow: 0.92, wild: 0.06, lenJ: 0.3, wJ: 0.3, impasto: 0.5, relief: 0.35,
  });
  // the far edge of the ground: a thin cold fringe so the horizon is a MEETING, not a cut
  strokes(out, counter, {
    rng, n: 420,
    sample: rej(-14, HZ - 10, 814, HZ + 26),
    dir: (x, y) => (fbm(x / 26, y / 12, 77) - 0.5) * 1.1,
    col: (x, y, r) => jig(mix(ramp(['#4a4478', '#3c3068', '#342556'], x / W), '#b98a48', Math.max(0, 1 - x / 300) * 0.45), r, 11),
    len: (x, y) => 10 * lengthOf(x, y, 51), lw: (x, y) => 1.8 * widthOf(x, y, 53), steps: 2, lenJ: 0.3, wJ: 0.3, impasto: 0.35, relief: 0.3,
  });
  // the fine tooth over both — what makes paint look like paint at arm's length
  strokes(out, counter, {
    rng, n: 3000,
    sample: rej(-10, -10, 810, 520, () => true),
    dir: (x, y) => (y > HZ ? rec(x, y) : 0) + (fbm(x / 9, y / 7, 319) - 0.5) * 1.5,
    col: (x, y, r) => {
      const w = warm(x, y);
      const c = y > HZ ? ramp(['#33285e', '#6a4e48', '#c08c38', GOLD_PALE], Math.min(1, w * 1.25))
                       : ramp(['#27306e', '#2b1e6a', '#3b1d50'], Math.min(1, x / W));
      return jig(c, r, 6);
    },
    len: (x, y) => 5.5 * lengthOf(x, y, 61), lw: (x, y) => 1.2 * widthOf(x, y, 63), steps: 2, lenJ: 0.3, wJ: 0.3, wild: 0.12, impasto: 0.5, relief: 0.3,
  });
  // the bow hidden in the field (Rev 4:3) — warm sparks on the lit ground, cold jewels
  // in the violet. A fleck, not a bead: each is mixed most of the way back to its bed.
  const WARM_ACC = ['#ff9a3c', '#ffd34a', '#ff6f61', '#c2ff6a'];
  const COLD_ACC = ['#4ad2ff', '#7c6bff', '#9a7cff', '#5f8fff'];   // the cold side keeps to cold: green chips in a night sky read as litter
  strokes(out, counter, {
    rng, n: 70,
    sample: rej(-10, -10, 810, 520, () => true),
    dir: (x, y) => (fbm(x / 11, y / 8, 323) - 0.5) * 3.2,
    col: (x, y, r) => {
      const w = warm(x, y);
      const pal = w > 0.28 ? WARM_ACC : COLD_ACC;
      return jig(mix(pal[(r() * pal.length) | 0], w > 0.28 ? GOLD_DEEP : '#2f1f7a', 0.66), r, 13);
    },
    len: 4.5, lw: 2.4, steps: 2, lenJ: 0.6, impasto: 0.6, op: 0.9,
  });

  /* ====================== 3. HIS OWN WAY (Isaiah 53:6) ======================
     "All we like sheep have gone astray; we have turned every one to his own WAY."
     Two converging straight lines are the oldest way a picture says away-from-here.
     The road is the one MADE thing on the page, so it alone is ruled; it keeps its
     stone colour and loses its warmth as it goes, because distance takes COLOUR
     first — never a grey veil over the top. */
  const RD0 = [-155, 510];                                   // out of the light, past us
  const roadC = t => [VPX + (RD0[0] - VPX) * t, VPY + (RD0[1] - VPY) * t];   // t=0 far, t=1 near
  const roadW = t => 3 + 78 * t;                             // 1/Z: it widens toward us
  const rdAng = Math.atan2(RD0[1] - VPY, RD0[0] - VPX);
  const rdPerp = [-Math.sin(rdAng), Math.cos(rdAng)];
  const roadPt = (t, u) => { const c = roadC(t), w = roadW(t); return [c[0] + rdPerp[0] * u * w, c[1] + rdPerp[1] * u * w]; };
  strokes(out, counter, {
    rng, n: 2000,
    sample: r => roadPt(Math.pow(r(), 0.62), r() * 2 - 1),
    dir: () => rdAng + (rng() - 0.5) * 0.10,                 // the paving runs the way he walks
    col: (x, y, r) => {
      const w = warm(x, y);
      // paler and cooler than the earth beside it — a road is stone, the ground is
      // earth, and the reader has to be able to tell them apart at a glance
      return jig(mix(ramp(['#3a3468', '#4d4372', '#83737a', '#bda078', '#ecd6a6', '#fdf0cf'], Math.min(1, w * 1.5)),
                     '#ffffff', 0.10), r, 7);
    },
    len: (x, y) => 13 * lengthOf(x, y, 71), lw: (x, y) => 3.0 * widthOf(x, y, 73), steps: 3, follow: 0.95, wild: 0.04, lenJ: 0.3, wJ: 0.3, impasto: 0.45, relief: 0.35,
  });
  // the verges: the earth right at the road's shoulder goes a shade deeper, so the
  // stone lifts off it instead of dissolving into it
  strokes(out, counter, {
    rng, n: 800,
    sample: r => roadPt(Math.pow(r(), 0.6), (r() < 0.5 ? -1 : 1) * (1.05 + r() * 0.55)),
    dir: (x, y) => rec(x, y),
    col: (x, y, r) => jig(mix(ramp(['#2c2358', '#3c2f60', '#7a5636', '#b07f34'], Math.min(1, warm(x, y) * 1.2)), '#170f30', 0.38), r, 8),
    len: (x, y) => 12 * lengthOf(x, y, 81), lw: (x, y) => 3.0 * widthOf(x, y, 83), steps: 2, lenJ: 0.3, wJ: 0.3, impasto: 0.4, relief: 0.3,
  });
  [-1, 1].forEach(sd => {
    const pts = [];
    for (let i = 0; i <= 10; i++) { const t = 0.02 + (i / 10) * 0.98; pts.push(roadPt(t, sd)); }
    paintPath(out, counter, rng, pts,
      (x, y, r) => jig(mix('#3c3462', '#f0cd86', Math.min(1, warm(x, y) * 1.6)), r, 9),
      { lw: 2.0, len: 5, density: 0.85, jitter: 0.3 });
  });

  /* 3b. THE FOOTPRINTS — the walk he has already made. Behind him on the lit stone,
     each one fainter than the one before, so the eye runs back down them into the
     gold and knows where he set out from. This is not the first step: he is past the
     middle of his own road. */
  for (let k = 0; k < 6; k++) {
    const t = 0.40 + k * 0.085, side = k % 2 ? 0.24 : -0.26;
    const p = roadPt(t, side), sc = 0.55 + t * 1.4;
    strokes(out, counter, {
      rng, n: Math.round(10 * sc),
      sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 0.6); return [p[0] + Math.cos(a) * 5.6 * sc * d, p[1] + Math.sin(a) * 2.7 * sc * d]; },
      dir: () => rdAng,
      col: (x, y, r) => jig(mix('#7a5c33', '#241a44', 0.30 + k * 0.10), r, 9),
      len: 4.5 * sc, lw: 2.2 * sc, steps: 2, lenJ: 0.4, impasto: 0.4,
    });
  }

  /* ====================== 4. THE LONG SHADOW ======================
     It runs from his heels to the vanishing point — away from the light at our backs,
     up his own road, into the violet. Long and low, because the light is low; it is
     the first shadow a body casts when it turns from the light, and it gets where he
     is going before he does. */
  const shadowSpine = t => [FX + t * 246, FY - t * 84];
  const shadow = (x, y) => {
    let g = 0;
    for (let i = 0; i <= 9; i++) {
      const t = i / 9, p = shadowSpine(t);
      const w = 13 - t * 8.6;                      // it narrows away with the road (1/Z)
      g = Math.max(g, (1.0 - t * 0.55) * Math.exp(-segDist(x, y, p[0], p[1], p[0] + 0.1, p[1]) / w));
    }
    return g;
  };
  strokes(out, counter, {
    rng, n: 1600,
    sample: rej(FX - 30, 200, 660, 380, (x, y) => shadow(x, y) > 0.12),
    dir: () => Math.atan2(-80, 232) + 0.04,
    col: (x, y, r) => {
      const s = shadow(x, y);
      // it takes its bed's own colour down with it rather than laying one grey over
      // lit stone and cold ground alike
      // ⚠ DEEPER (Fred: "the shadow is too quiet, deepen it"). It was mixed barely half
      // the way to the dark, on ground blazing gold — a bright bed showing through a thin
      // veil reads as a smudge on the road, not as an absence of light. Chiaroscuro is
      // the whole page's engine here: the dark he is walking into only reads as dark
      // because the gold behind him is fierce, and his shadow is the first piece of that
      // dark to arrive. It keeps its bed's colour, but it goes down nearly all the way.
      // ⭐ Sep 12 (Fred: "make it beautiful"): deep, still — but not a brown-black smear. A
      // shadow on gold at dusk is COOL: deep indigo, not soot; and it is not a hole — the
      // stones under it still show, a minority of marks keeping a little of the lit bed, so
      // the road runs on under the dark. The edge softens with distance (the s falloff).
      const bed = ramp(['#2e2758', '#4a3f66', '#a8814a', '#dcb265'], Math.min(1, warm(x, y) * 1.45));
      const keep = r() < 0.16 ? 0.28 : 0;                                   // a stone catching the ambient
      return jig(mix(bed, '#1a1448', Math.min(0.92, 0.5 + s * 0.6) - keep), r, 7);
    },
    len: (x, y) => 15 * lengthOf(x, y, 91), lw: (x, y) => 2.8 * widthOf(x, y, 93), steps: 3, follow: 0.94, lenJ: 0.3, wJ: 0.3, relief: 0.3,
  });

  E.setManifold(_MG);
  const bgEnd = out.length;   // BG plane: sky, ground, road, footprints, shadow, verse

  /* ====================== 4b. THE HAND HE LET GO OF (Isaiah 65:2) ======================
     "But you let go of His hand" — and the hand was not in the picture. Isaiah 65:2 says
     where it is: "I have spread out my hands all the day unto a rebellious people, which
     walketh in a way that was not good, after their own thoughts." The page's rule stands —
     the Light is never in frame, He is at our backs — so what comes in is only His REACH:
     a forearm of radiant gold entering low from the left, from the side the light shines
     from, and an open hand, palm up, fingers spread, EMPTY. It stops far short of the
     child: the gap is the sentence. It is still held out ("all the day"), so this page shows
     a refusal and never an abandonment. Bg plane (still). Own rng — nothing else re-rolls. */
  {
    const hr = mulberry32(seed + 652);
    const gj = (c, r) => mix(c, r() < 0.5 ? '#fff7e0' : '#3a2a10', r() * 0.1);
    // ⚠ first cut came in LOW, over the lit road — gold on the brightest gold on the page, and
    // it vanished. A radiant thing only reads against dark: the reach comes in HIGH, across
    // the violet sky above the horizon. ⚠ second cut was a straight pale plank ending in a
    // splash of spread fingers; the hand is now `made`'s hand of Light (the one Fred kept),
    // scaled to this arm and turned to its angle — open, fingers out toward him, holding nothing.
    const DY = 0;
    const arm = [
      { ax: -40, ay: 84, bx: 40, by: 104, r: 26 },         // near us, so LARGE — His reach comes from our side of the picture
      { ax: 40, ay: 104, bx: 98, by: 128, r: 21 },          // the elbow's bend
      { ax: 98, ay: 128, bx: 150, by: 140, r: 17 },
    ];
    const WR = [148, 134], K = 1.0, RA = 0.28;             // wrist, scale, turn of the hand (fingers down-right, toward him)
    const HT = ([dx, dy]) => [WR[0] + (dx * Math.cos(RA) - dy * Math.sin(RA)) * K, WR[1] + (dx * Math.sin(RA) + dy * Math.cos(RA)) * K];
    const hcap = (a, b2, r) => { const [ax, ay] = HT(a), [bx, by] = HT(b2); return { ax, ay, bx, by, r: r * K }; };
    const hand = [
      hcap([0, -10], [26, 0], 16), hcap([24, 0], [42, 8], 14.5),
      // ⚠ the fingers are as long as the palm (a hand, not a paw) and a little apart — open, holding nothing
      hcap([44, -2], [72, -6], 4.6), hcap([47, 8], [78, 9], 4.4), hcap([45, 18], [75, 23], 4.1), hcap([40, 26], [64, 35], 3.6),
      hcap([22, -10], [38, -24], 4.8),
    ];
    const HC = HT([44, 8]);                                 // the middle of the open hand
    // the light the hand is made of spills round it onto the air first
    strokes(out, counter, {
      rng: hr, n: 160,
      sample: r => { const a = r() * Math.PI * 2, d = 8 + Math.pow(r(), 0.7) * 34; return [HC[0] + Math.cos(a) * d, HC[1] + Math.sin(a) * d * 0.8]; },
      dir: (x, y) => Math.atan2(y - HC[1], x - HC[0]) + Math.PI / 2, col: (x, y, r) => jig(mix('#e9b86a', '#5a3f6a', Math.hypot(x - HC[0], y - HC[1]) / 42), r, 6),
      len: 6, lw: 2.2, steps: 2, lenJ: 0.5, relief: 0.1, op: 0.35, flow: 0,   // a soft warm air round it — tangential, never a splash
    });
    E.underpaintCapsules(out, counter, arm, '#7a5a26');
    E.paintFigure(out, counter, hr, arm, (x, y, r) => gj(ramp(['#a87428', '#d09a40', GOLD, GOLD_PALE], fbm(x / 22, y / 22, 43) * 0.3 + (x + 30) / 260), r), 1.6);
    // round, not flat: lit along the top of the forearm, deep along its underside
    strokes(out, counter, {
      rng: hr, n: 260, sample: rej(-40, 50, 170, 175, (x, y) => arm.some(c => E.inCap(x, y, c)) && !arm.some(c => E.inCap(x, y - 5, c))),
      dir: () => -0.2, col: (x, y, r) => gj(mix(GOLD_PALE, '#fff6df', r() * 0.5), r), len: 5, lw: 1.3, steps: 2, lenJ: 0.4, relief: 0.3, flow: 0,
    });
    strokes(out, counter, {
      rng: hr, n: 240, sample: rej(-40, 50, 170, 175, (x, y) => arm.some(c => E.inCap(x, y, c)) && !arm.some(c => E.inCap(x, y + 5, c))),
      dir: () => -0.2, col: (x, y, r) => gj(mix('#9a6f30', '#6a4620', r() * 0.6), r), len: 5, lw: 1.4, steps: 2, lenJ: 0.4, relief: 0.4, flow: 0,
    });
    E.underpaintCapsules(out, counter, hand, '#7a5a2a');
    E.paintFigure(out, counter, hr, hand, (x, y, r) => gj(ramp([GOLD_HOT, GOLD_PALE, GOLD, '#c89a50'], fbm(x / 12, y / 12, 47) * 0.4 + 0.2), r), 1.9);
    // the gaps between the spread fingers stay open: a line of the dark air between each
    for (const [ax, ay, bx, by] of [[48, 3, 76, 2], [48, 13, 77, 16], [44, 22, 70, 29]]) {
      paintPath(out, counter, hr, [HT([ax, ay]), HT([bx, by])], (x, y, r) => jig(mix('#3a2a4a', '#241a36', r()), r, 4), { lw: 1.5, len: 2.4, density: 0.95, jitter: 0.2 });   // the dark air between the fingers
    }
    // and the hot rim on the fingertips, the edge that faces the child
    strokes(out, counter, {
      rng: hr, n: 60, sample: rej(140, 110, 230, 200, (x, y) => hand.some(c => E.inCap(x, y, c)) && !hand.some(c => E.inCap(x + 2.5, y, c))),
      dir: () => -0.6, col: (x, y, r) => jig(mix('#fffef6', GOLD_HOT, r() * 0.5), r, 6), len: 3.5, lw: 1.3, steps: 2, flow: 0,
    });
  }

  /* ====================== 5. THE FIGURE — you, walking away (FG plane) ====================== */
  const _fgChild = out.length;
  // ⚠ FROM BEHIND. A face reads as posing; a back reads as LEAVING — and it puts the
  // reader over his shoulder, going with him, which is what a second-person story
  // needs on the page where "you walked into the dark". The light at our backs falls
  // on that back: he is still lit by the thing he is walking out of.
  E.paintMask(out, counter, rng, {
    x: FX + 4, y: FY, h: 74, facing: 1, back: 1,
    lean: 5, stride: 0.9, lift: 0.6, wind: -0.7,
    eye: [1, 0.5], mood: 'open',
  });
  if (!globalThis.__SKIP_FIG) {
    // the gold still on his shoulders — the light he is refusing has not gone out
    paintPath(out, counter, rng, [[FX - 9, FY - 62], [FX - 2, FY - 66], [FX + 8, FY - 62]],
      (x, y, r) => jig(mix(GOLD_DEEP, GOLD_PALE, r() * 0.5), r, 9), { lw: 1.5, len: 3, density: 0.6, jitter: 0.9 });
    // and the cold ahead already on his outer edges
    paintPath(out, counter, rng, [[FX + 15, FY - 56], [FX + 17, FY - 34], [FX + 18, FY - 12]],
      (x, y, r) => jig(mix('#3a4a82', '#6a5a9a', r() * 0.6), r, 9), { lw: 1.2, len: 3, density: 0.55, jitter: 1.0 });
  }
  fgRanges.push([_fgChild, out.length]);

  /* ====================== 6. EASTER EGG — Romans 5:12 ====================== */
  // "By one man sin entered into the world" — in Greek numerals (Εʹ·ΙΒʹ = 5:12), cut
  // light into the cold he is walking toward.
  inscriptionText(out, greekRef(5, 12), { x: 648, y: 424, h: 15, body: '#cdbce6', edge: '#1a153a', op: 0.5, edgeOp: 0.55 });

  const ALT = 'A road runs out of a warm gold light behind the viewer, passes under the feet of a small hooded figure and narrows away into a deep cobalt-violet dark, vanishing at the horizon. The figure is seen from behind, mid-stride, walking away from the light; the last of the gold still catches his shoulders while the cold touches his far side. His long shadow is thrown forward up the road ahead of him, reaching the vanishing point before he does, and behind him a line of dimming footprints leads back into the blaze he came out of. The near ground burns gold, the far ground and the sky go cold and violet — the first turning, the great refusal. High on the left, out of the dark sky on our side of the picture, a great arm of gold light reaches after him, its hand open and empty, still held out.';

  const RAW = { undercoat: 0, weave: 0, varnish: 0, oil: 0 };   // no baked surface — the live filter unifies the planes
  const setOf = ranges => { const s = new Set(); for (const [a, b] of ranges) for (let i = a; i < b; i++) s.add(i); return s; };
  const pick = ranges => ranges.map(([a, b]) => out.slice(a, b).join('\n')).join('\n');
  const fgSet = setOf(fgRanges);
  if (LAYER === 'fg') return svgWrap(ALT, pick(fgRanges), RAW);
  if (LAYER === 'bg') {
    const body = out.filter((_, i) => !fgSet.has(i)).join('\n');
    return svgWrap(ALT, body, RAW);
  }
  return svgWrap(ALT, out.join('\n'));
}
