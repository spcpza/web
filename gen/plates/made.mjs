// gen/plates/made.mjs — "Made to shine"
// Michelangelo's "Creation of Adam", HORIZONTAL. From the UPPER-LEFT a great
// RADIANT GOLD hand + forearm of the Light reaches in toward the centre, index
// finger extended. From the LOWER-RIGHT the small recurring RED child reaches UP,
// fingertip extended toward the Light's fingertip. At the CENTRE, in the charged
// GAP between their nearly-touching fingertips, a brilliant white-gold SPARK leaps
// — life being kindled. "All things were made by him; and without him was not any
// thing made that was made." (John 1:3)
//
// Light: ONE source — the spark in the gap. Background a deep blue→violet FIELD
// (a diagonal wash, NOT a centred radial spiral — that look belongs to other
// pages), so the two reaching arms and the spark read clearly across the frame.
// Chiaroscuro; the spark/light in Munch curves; divine = radiant gold; child red.
//
// Easter egg: John 1:3 in koine Greek (Αʹ·Γʹ), cut faint into the deep field.

export const name = 'made';
export const title = 'Made to shine';
export const caption = 'You were made to carry His light.';
export const seed = 10260203;
export const focal = { x: 400, y: 250 }; // the spark in the gap, where the two fingertips almost touch
// MOBILE 3D — depth planes (FAR→NEAR): the deep blue→violet field + the warm glow
// blooming from the gap behind everything (backmost, opaque); the great GOLD ARM of
// Light reaching in (mid); the RED CHILD reaching up + the leaping SPARK closest.
export const layers = [
  { name: 'bg', opaque: true },  // deep field + warm glow (backmost, opaque)
  { name: 'mid' },               // the giving arm of Light
  { name: 'fg' },                // the red child + the spark (nearest)
];

export function paint(E, opts = {}) {
  const {
    mulberry32, fbm, curlV, swirlV, goldenSpiralV, mix, ramp, jig, strokes, rej,
    paintFigure, paintPath, underpaintCapsules, paintChild, personCaps, inCap, lightRadial,
    ribbon, svgWrap, R1, W, H,
    GOLD, GOLD_PALE, GOLD_DEEP, GOLD_HOT, NIGHT, DARKEST,
  } = E;

  const rng = mulberry32(seed);
  const out = [];
  const counter = { n: 0 };
  // gold jitter WITHOUT jig's complementary flip (that flip speckles saturated
  // GOLD with cyan "measles", making the radiant arm read as a cheap plank).
  const gj = (c, r) => mix(c, r() < 0.5 ? '#fff7e0' : '#3a2a10', r() * 0.1);
  // MOBILE 3D LAYERS: tag ranges per band; MID = the gold arm, FG = child + spark.
  const LAYER = opts.layer || 'full';
  const midRanges = [], fgRanges = [];

  /* ---------------- GEOMETRY + LIGHT ---------------- */
  // HORIZONTAL Creation of Adam: gold arm from UPPER-LEFT, red child from
  // LOWER-RIGHT, the SPARK leaping the gap between their fingertips at centre.
  const spark = [400, 250];                          // the charged gap — the subject
  const gS = lightRadial(spark[0], spark[1], 170);   // ONE source — the spark
  const fingerTip = [378, 244];                       // the Light's index fingertip (left of gap)
  const childTip = [424, 258];                        // the child's reaching fingertip (right of gap)

  /* ---------------- 1. THE DEEP FIELD — blue→violet, a diagonal WASH --------- */
  // NOT a centred radial spiral (other pages own that). A broad diagonal field
  // running cool violet (upper-right) to deep blue (lower-left), gently flowing,
  // never pure black — so the two gold/red arms and the central spark read clear.
  out.push(`<rect width="${W}" height="${H}" fill="#1a2150"/>`);
  const dir0 = (x, y) => {
    let [vx, vy] = curlV(x, y, 150, 220);
    vx = vx * 70 + 26; vy = vy * 70 + 13;            // steady diagonal drift, lower-left → upper-right
    return Math.atan2(vy, vx);
  };
  strokes(out, counter, {
    rng, n: 560, sample: rej(-10, -10, 810, 510),
    dir: dir0,
    col: (x, y, r) => {
      const g = gS(x, y);
      // diagonal blend: blue in the lower-left, violet toward the upper-right
      const diag = (x / 800) * 0.55 + (1 - y / 500) * 0.45;
      let c = ramp(['#141c44', '#1f2a64', '#33307e', '#4a3a8e', '#5a4498'], diag * 0.85 + fbm(x / 150, y / 150, 17) * 0.2);
      if (r() < 0.02 && g < 0.2) return jig('#7a5ac0', r, 14);   // soft violet flicker in the deep
      c = mix(c, '#fff0c8', g * 0.55);                            // only the gap warms toward gold
      const edge = Math.max(0, (Math.hypot(x - spark[0], y - spark[1]) - 250) / 300);
      c = mix(c, '#0b0f2a', Math.min(0.6, edge));                 // VIGNETTE — deepen the corners so the gap holds the eye
      return jig(c, r, 9);
    },
    len: 36, lw: 8, steps: 3, follow: 0.7, wild: 0.1, lenJ: 0.55, impasto: 0.45, relief: 0.7,
    aJ: (x, y) => 0.1 + gS(x, y) * 0.3,
  });

  /* ---------------- 2. THE WARM GLOW BLOOMING FROM THE SPARK ---------------- */
  // gold blooming out of the gap into the field — the first light. A HORIZONTAL
  // lens (wider than tall, strokes laid roughly along the arm-axis), NOT a spiral.
  strokes(out, counter, {
    rng, n: 330,
    sample: r => { const a = r() * Math.PI * 2, d = 8 + Math.pow(r(), 1.5) * 88; return [spark[0] + Math.cos(a) * d * 1.35, spark[1] + Math.sin(a) * d * 0.7]; },
    dir: (x, y) => 0.3 + (fbm(x / 26, y / 26, 67) - 0.5) * 0.7,   // near-horizontal lay-in (the axis of the touch), gently rippling
    col: (x, y, r) => {
      const d = Math.hypot((x - spark[0]) / 1.35, (y - spark[1]) / 0.7);
      return gj(ramp(['#fffdf2', GOLD_HOT, GOLD_PALE, GOLD, GOLD_DEEP, '#7a5a40', '#3a3678'], d / 130), r);
    },
    len: 13, lw: 2.6, steps: 2, lenJ: 0.5, aJ: 0.2, wild: 0.1, impasto: 0.6,
  });
  /* ---------------- 2b. LIFE — SWIFTS arcing AROUND the meeting arms ---------- */
  // five curved-wing fliers ring the making, celebrating it — "and fowl that may
  // fly above the earth" (Gen 1:20); every one of them a thing "made by him"
  // (John 1:3). Each flies TANGENT to a circle around the spark — arcing around
  // the meeting arms, never crossing the sacred gap. Wings in Munch curves;
  // warm cream-gold so they read light-on-dark against the deep field.
  const rngL = mulberry32(seed ^ 0x51f7);   // separate stream — downstream texture untouched
  const swift = (cx, cy, s, tw, glow) => {
    const rot = Math.atan2(cy - spark[1], cx - spark[0]) - Math.PI / 2 + tw;   // tangent heading — circling, not diving in
    const cs = Math.cos(rot), sn = Math.sin(rot);
    const P = (dx, dy) => [cx + dx * cs - dy * sn + (rngL() - 0.5) * 1.2, cy + dx * sn + dy * cs + (rngL() - 0.5) * 1.2];
    const wingC = () => jig(mix('#f3e6c0', GOLD_PALE, 0.35 + glow * 0.4), rngL, 8);
    for (const m of [-1, 1]) {   // two sickle wings, swept back — bold simple silhouette
      out.push(ribbon([P(s * 0.08, m * s * 0.05), P(s * 0.10, m * s * 0.30), P(-s * 0.08, m * s * 0.46), P(-s * 0.30, m * s * 0.55)], s * 0.17, wingC(), [0.5, 0.42, 0.26, 0.08]));
      counter.n++;
    }
    out.push(ribbon([P(s * 0.24, 0), P(s * 0.02, 0), P(-s * 0.14, 0)], s * 0.14, jig(mix(GOLD, '#caa25c', 0.5), rngL, 7), [0.24, 0.5, 0.3]));   // body, head into the wind
    out.push(ribbon([P(-s * 0.12, 0), P(-s * 0.30, -s * 0.09)], s * 0.06, wingC(), [0.5, 0.12]));   // forked tail
    out.push(ribbon([P(-s * 0.12, 0), P(-s * 0.30, s * 0.09)], s * 0.06, wingC(), [0.5, 0.12]));
    out.push(ribbon([P(s * 0.14, -s * 0.12), P(-s * 0.02, -s * 0.16)], s * 0.05, jig(GOLD_HOT, rngL, 6), [0.45, 0.15]));   // one accent: hot glint on the spark-facing breast (local −y points at the gap)
    counter.n += 4;
  };
  swift(330, 96, 34, 0.15, 0.9);    // over the great arm — nearest, most lit (size ∝ 1/Z)
  swift(455, 112, 29, -0.1, 0.8);   // high above the gap, well clear of the spark
  swift(612, 208, 25, 0.2, 0.6);    // wheeling wide on the right
  swift(172, 332, 21, -0.15, 0.5);  // low over the deep, lower-left
  swift(688, 84, 17, 0.1, 0.35);    // farthest and smallest, upper-right
  const bgEnd = out.length;   // BG plane: the deep field + the warm glow blooming from the gap (opaque)

  /* ---------------- 3. THE GIVING ARM OF LIGHT — from the UPPER-LEFT, radiant gold --[MID plane]-- */
  const _midArm = out.length;
  // a great forearm + hand reaches in horizontally from the upper-left corner; it is
  // the Light's own — radiant gold, never a dark object. Index finger extended to the gap.
  // a TAPERING, elbow-BENT arm (not a plank): shoulder enters upper-left, bends at
  // the elbow, forearm narrows to the wrist — so it reads as an ARM of Light.
  const fore = [
    { ax: -14, ay: 52, bx: 80, by: 94, r: 35 },     // shoulder / upper arm from the corner
    { ax: 80, ay: 94, bx: 176, by: 130, r: 29 },    // upper arm to the elbow
    { ax: 176, ay: 130, bx: 260, by: 182, r: 22 },  // elbow BEND into the forearm (angle changes here)
    { ax: 260, ay: 182, bx: 324, by: 216, r: 17.5 },// forearm tapering to the wrist
  ];
  underpaintCapsules(out, counter, fore, '#6e5020');
  paintFigure(out, counter, rng, fore, (x, y, r) => gj(ramp(['#b0863c', '#d6a854', GOLD, GOLD_PALE], fbm(x / 22, y / 22, 41) * 0.3 + (x + 14) / 360), r), 1.6);
  // CYLINDER shading so the arm reads round, not flat: bright highlight rippling
  // down its TOP edge, deep shadow along its UNDER edge
  strokes(out, counter, {
    rng, n: 150, sample: rej(-14, 30, 330, 230, (x, y) => fore.some(c => inCap(x, y, c)) && !fore.some(c => inCap(x, y - 5, c))),
    dir: () => 0.42, col: (x, y, r) => gj(mix(GOLD_PALE, '#fff6df', r() * 0.5), r), len: 7, lw: 2.0, steps: 2, relief: 0.4,
  });
  strokes(out, counter, {
    rng, n: 140, sample: rej(-14, 30, 330, 240, (x, y) => fore.some(c => inCap(x, y, c)) && !fore.some(c => inCap(x, y + 6, c))),
    dir: () => 0.42, col: (x, y, r) => gj(mix('#9a6f30', '#5e3f1a', r() * 0.6), r), len: 7, lw: 2.2, steps: 2, relief: 0.5,
  });
  // wrist + open giving hand, the index finger reaching RIGHT toward the gap
  const dHand = [
    { ax: 322, ay: 218, bx: 350, by: 232, r: 17 },     // wrist — overlaps the forearm so the arm reads connected
    { ax: 348, ay: 230, bx: 372, by: 236, r: 17 },     // broad open palm, opening toward the child
    { ax: 366, ay: 240, bx: 380, by: 244, r: 5.4 },    // INDEX finger reaching to the gap (the touch)
    { ax: 366, ay: 250, bx: 382, by: 254, r: 4.4 },    // finger 2
    { ax: 364, ay: 258, bx: 379, by: 262, r: 4.0 },    // finger 3
    { ax: 360, ay: 264, bx: 373, by: 270, r: 3.6 },    // finger 4
    { ax: 350, ay: 224, bx: 364, by: 220, r: 5.0 },    // thumb, up and out
  ];
  underpaintCapsules(out, counter, dHand, '#6e5226');
  paintFigure(out, counter, rng, dHand, (x, y, r) => gj(ramp([GOLD_HOT, GOLD_PALE, GOLD, '#c89a50'], fbm(x / 12, y / 12, 41) * 0.4 + 0.2), r), 1.9);
  // dark grooves between the fingers so distinct fingers read (not a lump)
  for (const [ax, ay, bx, by] of [[364, 246, 379, 250], [362, 254, 377, 258], [358, 261, 371, 266]]) {
    paintPath(out, counter, rng, [[ax, ay], [bx, by]], (x, y, r) => jig(mix('#8a6a34', '#5a3a1c', r()), r, 6), { lw: 1.4, len: 2.6, density: 0.95, jitter: 0.3 });
  }
  // hot rim along the gap-facing edge of the hand + the reaching fingertip
  strokes(out, counter, {
    rng, n: 54,
    sample: rej(348, 214, 384, 272, (x, y) => dHand.some(c => inCap(x, y, c)) && !dHand.some(c => inCap(x + 3, y, c))),
    dir: () => -0.3,
    col: (x, y, r) => jig(mix('#fffef6', GOLD_HOT, r() * 0.5), r, 7),
    len: 5, lw: 1.6, steps: 2,
  });
  midRanges.push([_midArm, out.length]);   // ← the giving arm of Light is the mid plane

  /* ---------------- 4. THE RED CHILD — from the LOWER-RIGHT, reaching UP --[FG plane]-- */
  const _fgChild = out.length;
  // the small recurring protagonist enters from the lower-right, leaning IN and UP,
  // one arm reaching across toward the Light, fingertip extended to the gap.
  // the child reclines/leans in from the lower-right (like Adam): head and shoulder
  // up near the gap, body sweeping down to the lower-right, the near arm reaching across.
  // a clear small UPRIGHT child standing just below the gap, reaching ONE arm UP to
  // the Light's hand — newly made, looking up to his Maker. (The Light reaches DOWN
  // from upper-left; the child reaches UP from lower-right; the spark leaps the gap.)
  const C = { x: 470, feet: 392 };
  const caps = personCaps(C.x, C.feet - 116, 116, {
    leftHand: childTip,                        // the near (left) arm reaching UP-LEFT toward the Light's fingertip / spark
    rightHand: [C.x + 24, C.feet - 44],        // the other arm relaxed at his side
    leftFoot: [C.x - 11, C.feet], rightFoot: [C.x + 11, C.feet],
    lean: -5,                                  // leaning toward the Light
    headTilt: -3,                              // face lifted up to his Maker
  });
  // THE MAIN CHARACTER — "you", newly made: deep red clothes + bold dark outline
  paintChild(out, counter, rng, caps, { outlineW: 4 });
  // rim light up the child's Light-facing flank (the side turned to the spark)
  strokes(out, counter, {
    rng, n: 64,
    sample: rej(childTip[0] - 6, C.feet - 178, C.x - 20, C.feet - 120, (x, y) => caps.some(c => inCap(x, y, c)) && !caps.some(c => inCap(x - 3, y - 3, c))),
    dir: () => -Math.PI / 2 - 0.5,
    col: (x, y, r) => jig(mix(GOLD_DEEP, '#a3552c', r() * 0.5), r, 10),
    len: 6, lw: 1.8, steps: 2,
  });

  /* ---------------- 5. THE FACE, LIFTED toward the Light ---------------- */
  const face = [C.x - 68, C.feet - 170];
  strokes(out, counter, {
    rng, n: 60,
    sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 1.25) * 10; return [face[0] + Math.cos(a) * d * 0.85, face[1] + Math.sin(a) * d]; },
    dir: (x, y) => 0.5 + (fbm(x / 7, y / 7, 79) - 0.5) * 0.8,
    col: (x, y, r) => {
      const d = Math.hypot(x - face[0], y - face[1]);
      return jig(ramp([GOLD_HOT, GOLD_PALE, GOLD, '#c98e4e', '#8a5a34'], d / 12 + (r() - 0.5) * 0.15), r, 7);
    },
    len: 5, lw: 1.8, steps: 2, wJ: 0.5, lenJ: 0.5, impasto: 0.7,
  });
  // a closed, calm eye — one short dark stroke turned toward the Light; reverence
  paintPath(out, counter, rng, [[face[0] - 4, face[1] - 1.5], [face[0], face[1] - 3]], (x, y, r) => jig('#5e3a1e', r, 6), { lw: 1.3, len: 2.2, density: 0.9, jitter: 0.3 });
  // a hot fingertip rim where the child's hand reaches the gap
  strokes(out, counter, {
    rng, n: 20,
    sample: r => { const a = r() * Math.PI * 2, d = r() * 5; return [childTip[0] + Math.cos(a) * d, childTip[1] + Math.sin(a) * d]; },
    dir: () => -Math.PI / 2,
    col: (x, y, r) => jig(mix(GOLD_HOT, '#e88a4a', r() * 0.5), r, 8),
    len: 3.5, lw: 1.4, steps: 2,
  });

  /* ---------------- 6. THE SPARK — the brightest point, leaping the GAP ---------------- */
  // life kindled in the charged gap between the two nearly-touching fingertips:
  // a brilliant white-gold flame, the brightest thing on the plate, leaping in curves.
  strokes(out, counter, {
    rng, n: 150,
    sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 1.5) * 12; return [spark[0] + Math.cos(a) * d, spark[1] + Math.sin(a) * d]; },
    dir: (x, y) => Math.atan2(x - spark[0], -(y - spark[1])) + (fbm(x / 6, y / 6, 83) - 0.5) * 0.6,
    col: (x, y, r) => jig(ramp(['#fffffa', '#fffdf0', GOLD_HOT, GOLD_PALE, GOLD], Math.hypot(x - spark[0], y - spark[1]) / 13), r, 6),
    len: 6, lw: 2, steps: 2, wJ: 0.55, lenJ: 0.55,
  });
  // arcing licks leaping ACROSS the gap from finger to finger (Munch curves)
  const licks = [
    { from: fingerTip, to: childTip, bend: -14 },
    { from: [fingerTip[0] + 2, fingerTip[1] - 4], to: [childTip[0] - 2, childTip[1] - 6], bend: -22 },
    { from: [fingerTip[0] + 1, fingerTip[1] + 4], to: [childTip[0] - 1, childTip[1] + 4], bend: 8 },
  ];
  for (const lk of licks) {
    const b = lk.from, tip = lk.to;
    const mx = (b[0] + tip[0]) / 2, my = (b[1] + tip[1]) / 2;
    const ctl = [mx, my + lk.bend];
    const q = t => { const u = 1 - t; return [u * u * b[0] + 2 * u * t * ctl[0] + t * t * tip[0], u * u * b[1] + 2 * u * t * ctl[1] + t * t * tip[1]]; };
    for (let t = 0; t < 1; t += 0.1) {
      const p = q(t), p2 = q(Math.min(1, t + 0.11));
      const edge = Math.min(t, 1 - t);                 // brightest mid-gap, tapering at both fingers
      const wL = 1.2 + edge * 4.2;
      const cc = jig(ramp([GOLD, GOLD_PALE, GOLD_HOT, '#fffef6'], edge * 2), rng, 7);
      const jx = (rng() - 0.5) * 1.4, jy = (rng() - 0.5) * 1.4;
      out.push(ribbon([[p[0] + jx, p[1] + jy], [(p[0] + p2[0]) / 2 + jx, (p[1] + p2[1]) / 2 + jy], [p2[0] + jx, p2[1] + jy]], wL, cc, [0.5, 0.5, 0.42]));
      counter.n++;
    }
  }
  // the white-hot HEART of the spark — the single brightest mark, in the gap
  strokes(out, counter, {
    rng, n: 44,
    sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 1.6) * 8; return [spark[0] + Math.cos(a) * d, spark[1] + Math.sin(a) * d]; },
    dir: () => -Math.PI / 2,
    col: (x, y, r) => jig(mix('#fffffa', '#fff7d6', r()), r, 5),
    len: 4, lw: 1.5, steps: 2,
  });
  out.push(`<circle cx="${R1(spark[0])}" cy="${R1(spark[1])}" r="6" fill="#fffffa"/>`);
  out.push(`<circle cx="${R1(spark[0])}" cy="${R1(spark[1])}" r="3" fill="#ffffff"/>`);
  counter.n += 2;
  // radiating light RAYS — a crisp starburst so the spark reads as a POINT of light,
  // not a cloud (4 long cardinal rays, alternating medium/short between)
  {
    const nrays = 16;
    for (let i = 0; i < nrays; i++) {
      const a = (i / nrays) * Math.PI * 2 + 0.25;
      const long = (i % 4 === 0) ? 48 : (i % 2 === 0 ? 30 : 19);
      const ex = spark[0] + Math.cos(a) * long, ey = spark[1] + Math.sin(a) * long;
      out.push(ribbon([[spark[0], spark[1]], [spark[0] + Math.cos(a) * long * 0.5, spark[1] + Math.sin(a) * long * 0.5], [ex, ey]], 2.6, jig(mix('#fffef6', GOLD_HOT, 0.4), rng, 5), [0.95, 0.4, 0.0]));
      counter.n++;
    }
  }
  // a few soft sparks drifting up out of the gap
  strokes(out, counter, {
    rng, n: 18,
    sample: r => [spark[0] + (r() - 0.5) * 24, spark[1] - 12 - r() * 28],
    dir: () => -Math.PI / 2 + 0.12,
    col: (x, y, r) => jig(GOLD_PALE, r, 14),
    len: 3.5, lw: 1.2, steps: 2,
  });
  /* ---------------- 6b. LIFE — small flowers budding along the frame base ------ */
  // the newly-made world already sprouting at the edges of the scene — the first
  // green things waking at the frame's foot (Gen 1:11-12 "let the earth bring
  // forth… the herb yielding seed"; John 1:3 — these too were made by him).
  // Nearest of all, so they ride the FG plane; tiny, below the hidden verse-egg,
  // clear of the child's feet and the caption's hero zone.
  const bud = (bx, by, h, petal) => {
    const bend = (rngL() - 0.5) * 6;
    const top = [bx + bend, by - h];
    out.push(ribbon([[bx, by], [bx + bend * 0.5, by - h * 0.55], top], 1.9, jig('#a2d488', rngL, 8), [0.5, 0.42, 0.24]));   // curved stem — a living thing
    out.push(ribbon([[bx + bend * 0.4, by - h * 0.5], [bx + bend * 0.4 + 4, by - h * 0.62]], 2.4, jig('#8cc072', rngL, 8), [0.5, 0.12]));   // one small leaf
    for (const a of [-0.7, 0, 0.7]) {   // three closed petals — a bud just opening
      out.push(ribbon([top, [top[0] + Math.sin(a) * h * 0.34, top[1] - Math.cos(a) * h * 0.38]], h * 0.24, jig(mix(petal, '#fff2da', 0.3), rngL, 8), [0.5, 0.16]));
    }
    out.push(`<circle cx="${R1(top[0])}" cy="${R1(top[1] - h * 0.06)}" r="1.6" fill="${GOLD_PALE}"/>`);
    counter.n += 6;
  };
  const petals = ['#ef8fb6', '#f2b46a', GOLD_PALE, '#c9a9ef', '#f6ead0'];
  [[46, 494, 15], [92, 487, 18], [150, 496, 13], [214, 490, 17], [272, 497, 14],
   [338, 491, 16], [452, 495, 15], [516, 489, 18], [582, 496, 13], [644, 490, 17],
   [702, 497, 14], [756, 492, 16]].forEach(([bx, by, h], i) => bud(bx, by, h, petals[i % petals.length]));
  fgRanges.push([_fgChild, out.length]);   // ← the red child, the face, the spark, and the budding base are foreground

  /* ---------------- 7. EASTER EGG — John 1:3, in koine Greek ----------------
     "All things were made by him; and without him was not any thing made that was
     made." Cut faint into the deep field below the gap — the verse names what the
     art already shows: the kindling of the very first life. */
  const _egg = out.length;
  E.inscriptionText(out, E.greekRef(1, 3), { x: 400, y: 432, h: 14, body: '#1a1430', edge: '#fff0c4', op: 0.8, edgeOp: 0.5 });
  const eggRange = [_egg, out.length];   // the cut verse rides with the deep field (bg)

  const ALT = 'Horizontal Creation of Adam: from the upper-left a great radiant gold hand and forearm of the Light reaches in, index finger extended; from the lower-right a small child in deep red reaches up, fingertip extended toward the Light. Between their nearly-touching fingertips a brilliant white-gold spark leaps across the charged gap — life being kindled — against a deep blue-and-violet field.';

  // MULTIPLANE: assemble the requested depth plane. Each is its own cel —
  // transparent where it has no content — so they stack and parallax apart.
  const RAW = { undercoat: 0, weave: 0, varnish: 0, oil: 0 };   // no baked surface — the live filter unifies the planes
  const pick = ranges => ranges.map(([a, b]) => out.slice(a, b).join('\n')).join('\n');
  if (LAYER === 'bg') return svgWrap(ALT, pick([[0, bgEnd], eggRange]), RAW);   // deep field + warm glow + cut verse (opaque)
  if (LAYER === 'mid') return svgWrap(ALT, pick(midRanges), RAW);               // the giving arm of Light
  if (LAYER === 'fg') return svgWrap(ALT, pick(fgRanges), RAW);                 // the red child + the spark
  // full painting (desktop): the original order, byte-identical
  return svgWrap(ALT, out.join('\n'));
}
