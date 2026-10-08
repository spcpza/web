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
  // ⭐ DETAIL PASS (Sep 8): the field was 560 slabs at lw 8 with follow 0.7 — rounded pills
  // floating apart on a flat rect, which on the page read as litter in the dark. Now it is
  // thousands of flowing strokes, EVERY ONE ITS OWN WIDTH AND LENGTH (free hashes, no rule),
  // and every drawing of the boil is a DIFFERENT PAINTING of the field (drng salted by the
  // frame, displacement 0 in BOIL_BAND_PAGE.made) — never the same marks nudged.
  const free = (x, y, salt) => { const n = Math.sin(x * 12.9898 + y * 78.233 + salt) * 43758.5453; return n - Math.floor(n); };
  const widthOf  = (x, y, salt) => 0.40 + 3.2 * Math.pow(free(x, y, salt), 2.6);
  const lengthOf = (x, y, salt) => 0.40 + 1.5 * Math.pow(free(x, y, salt + 17), 1.5);
  // ⚠ softer, with intent (Fred): the SAME field in every drawing; what differs is a slow
  // breath toward the spark (length swells with a phase set by distance from the gap).
  const drng = mulberry32(seed + 4409);
  const _bb = E.boilBeat ? E.boilBeat() : 0;
  const breatheM = (x, y) => 1 + 0.28 * Math.cos(2 * Math.PI * (_bb - Math.hypot(x - spark[0], y - spark[1]) / 380));
  const deepCol = (x, y, r) => {
      const g = gS(x, y);
      // diagonal blend: blue in the lower-left, violet toward the upper-right
      const diag = (x / 800) * 0.55 + (1 - y / 500) * 0.45;
      let c = ramp(['#141c44', '#1f2a64', '#33307e', '#4a3a8e', '#5a4498'], diag * 0.85 + fbm(x / 150, y / 150, 17) * 0.2);
      if (r() < 0.02 && g < 0.2) return jig('#7a5ac0', r, 14);   // soft violet flicker in the deep
      c = mix(c, '#fff0c8', g * 0.55);                            // only the gap warms toward gold
      const edge = Math.max(0, (Math.hypot(x - spark[0], y - spark[1]) - 250) / 300);
      c = mix(c, '#0b0f2a', Math.min(0.6, edge));                 // VIGNETTE — deepen the corners so the gap holds the eye
      return jig(c, r, 9);
  };
  // ⚠ the deep is too dark for the site's 1-in-10 complementary fleck — every flipped mark
  // is a lime or orange chip on violet (rainbow confetti). The field paints at the approved
  // 0.012; the glow and the arm keep the plate's own rate.
  const _MD = E.getManifold(); E.setManifold(0.012);
  strokes(out, counter, {
    rng: drng, n: 3400, sample: rej(-10, -10, 810, 510),
    dir: dir0, col: deepCol,
    len: (x, y) => 30 * lengthOf(x, y, 101) * breatheM(x, y), lw: (x, y) => 3.6 * widthOf(x, y, 103),
    steps: 4, follow: 0.9, wild: 0.04, lenJ: 0.3, wJ: 0.3, impasto: 0.45, relief: 0.5,
    aJ: (x, y) => 0.08 + gS(x, y) * 0.25,
  });
  // the crests: hair-fine strokes riding the same drift, a shade lit — the field has grain
  strokes(out, counter, {
    rng: drng, n: 1800, sample: rej(-10, -10, 810, 510),
    dir: dir0,
    col: (x, y, r) => jig(mix(deepCol(x, y, r), mix('#6a66c0', '#8a78d0', free(x, y, 211)), 0.14 + 0.1 * free(x, y, 213)), r, 6),
    len: (x, y) => 20 * lengthOf(x, y, 107) * breatheM(x, y), lw: (x, y) => 1.3 * widthOf(x, y, 109),
    steps: 4, follow: 0.92, lenJ: 0.3, wJ: 0.3, impasto: 0.0, relief: 0.25, op: 0.8,
  });
  E.setManifold(_MD);

  /* ---------------- 1b. THE BEAUTY PASS (Sep 12) — "he made the stars also" ----------------
     John 1:3: "All things were made by him." Genesis 1:16 adds, almost as an aside, "he made
     the stars also." The deep field was an even violet noise from edge to edge, so the spark
     had nothing to be the ONE light against. Two moves, one idea: the field goes DARK at its
     corners (chiaroscuro — the dark deepens so the light can read) and it is seeded with stars,
     brightest near the spark and fainter far off — every one of them a thing He made. */
  {
    const _MD2 = E.getManifold(); E.setManifold(0);
    strokes(out, counter, {                 // the corners deepen — a vignette laid as paint, not a filter
      rng, n: 1400,
      sample: r => { const x = -14 + r() * 828, y = -14 + r() * 528; const d = Math.hypot((x - spark[0]) / 1.2, y - spark[1]); return d > 190 && r() < Math.min(1, (d - 190) / 260) ? [x, y] : null; },
      dir: (x, y) => { const [a, b] = curlV(x, y, 41, 160); return Math.atan2(b + 0.12, a + 0.9); },
      col: (x, y, r) => jig(mix('#1c1a4a', '#26225a', r() * 0.6), r, 4),
      len: (x, y) => 26 * lengthOf(x, y, 131), lw: (x, y) => 4.5 * (0.5 + widthOf(x, y, 133) * 0.5), steps: 3, follow: 0.92, lenJ: 0.4, wJ: 0.3, impasto: 0, relief: 0.1,
      op: 0.34,
    });
    const strng = mulberry32(seed + 1616);
    for (let k = 0; k < 90; k++) {
      const sx = -6 + strng() * 812, sy = -6 + strng() * 512;
      const d = Math.hypot(sx - spark[0], sy - spark[1]);
      if (d < 120) continue;                                            // the spark keeps its own space
      if (sy < 0.55 * sx - 20 && sx < 400) continue;                   // not over the arm's lane (upper-left diagonal)
      const near = Math.max(0, 1 - d / 520);
      const sz = 0.5 + Math.pow(strng(), 2) * 1.4 + near * 0.8;
      const bright = 0.35 + near * 0.55;
      strokes(out, counter, { rng: strng, n: 1, sample: () => [sx, sy], dir: () => strng() * Math.PI,
        col: (x, y, r) => jig(mix('#fff8e6', '#ffe08a', r() * 0.5), r, 3), len: sz * 1.5, lw: sz * 1.1, steps: 1, impasto: 0, relief: 0, op: bright });
      if (strng() < 0.22 && near > 0.3) {                               // a few glint as four-point stars
        for (const a of [0, Math.PI / 2]) paintPath(out, counter, strng, [[sx - Math.cos(a) * sz * 3, sy - Math.sin(a) * sz * 3], [sx + Math.cos(a) * sz * 3, sy + Math.sin(a) * sz * 3]],
          (x, y, r) => jig('#fff4d0', r, 3), { lw: 0.5, len: 2, density: 0.9, jitter: 0.1 });
      }
    }
    E.setManifold(_MD2);
  }

  /* ---------------- 2. THE WARM GLOW BLOOMING FROM THE SPARK ---------------- */
  // gold blooming out of the gap into the field — the first light. A HORIZONTAL
  // lens (wider than tall, strokes laid roughly along the arm-axis), NOT a spiral.
  strokes(out, counter, {
    rng, n: 900,
    sample: r => { const a = r() * Math.PI * 2, d = 8 + Math.pow(r(), 1.5) * 88; return [spark[0] + Math.cos(a) * d * 1.35, spark[1] + Math.sin(a) * d * 0.7]; },
    dir: (x, y) => 0.3 + (fbm(x / 26, y / 26, 67) - 0.5) * 0.7,   // near-horizontal lay-in (the axis of the touch), gently rippling
    col: (x, y, r) => {
      const d = Math.hypot((x - spark[0]) / 1.35, (y - spark[1]) / 0.7);
      return gj(ramp(['#fffdf2', GOLD_HOT, GOLD_PALE, GOLD, GOLD_DEEP, '#7a5a40', '#3a3678'], d / 130), r);
    },
    len: (x, y) => 11 * lengthOf(x, y, 121), lw: (x, y) => 1.7 * widthOf(x, y, 123), steps: 2, lenJ: 0.3, wJ: 0.3, aJ: 0.2, wild: 0.06, impasto: 0.6,
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

  /* ---------------- 2c. THE GROUND HE WAS MADE FROM (Sep 23) --[MID plane]--
     Gen 2:7 — "the LORD God formed man of the dust of the ground, and breathed into his
     nostrils the breath of life." In Hebrew the man is 'āḏām and the ground is 'ăḏāmâ, the
     RED earth, and "formed" (yāṣar) is the potter's word. The child used to stand on
     nothing — a figure hung in a purple field. Now a small round hill of red earth rises
     from below the frame to his feet: warm terracotta where the spark's light falls on its
     crown, going down into the violet of the field on its far flanks, and grass just waking
     on the top where the light touches first. In MID, the plane the child's sprite moves
     with, so he stands on it when the phone tilts. Own rng. */
  const _hill = out.length;
  {
    const hr = mulberry32(seed + 207);
    const HX = 470, HY = 392 + 2;                           // the child's feet (C.feet, CAST1[3].y)
    /* ⚠ first cut was a round DOME with a lit rim line and short cobbled marks — it read as a
       dark planet. A hill is broad and flat-crowned, it has no outline, and the light on it is
       COLOUR (warm on the crown and the side facing the Light), not a drawn edge. */
    const hillY = x => HY + 106 * Math.pow((x - HX) / 236, 2) + 4 * Math.sin(x / 53 + 0.7) * Math.min(1, Math.abs(x - HX) / 90);
    const warm = (x, y) => Math.max(0, Math.min(1, 1 - (y - HY) / 95 - (x - HX) / 520 + 0.12));   // the crown and the Light's side
    const _MH = E.getManifold(); E.setManifold(0);
    strokes(out, counter, {
      rng: hr, n: 1300,
      sample: rej(200, HY - 4, 760, 512, (x, y) => y > hillY(x)),
      dir: x => { const e = 4; return Math.atan2(hillY(x + e) - hillY(x - e), 2 * e) + (fbm(x / 40, 1, 207) - 0.5) * 0.3; },
      col: (x, y, r) => {
        const w = warm(x, y);
        let c = ramp(['#4a2548', '#7a3440', '#b04e36', '#d8743e', '#f0a060', '#f8c888'], 0.1 + w * 0.82 + (fbm(x / 30, y / 14, 209) - 0.5) * 0.22);
        c = mix(c, '#fff0c8', Math.pow(gS(x, y), 1.5) * 0.35);
        return jig(c, r, 5);
      },
      len: (x, y) => 9 + 7 * Math.min(1, (y - HY) / 80), lw: (x, y) => 2.2 + 1.6 * Math.min(1, (y - HY) / 80), steps: 3, follow: 0.9, lenJ: 0.4, wJ: 0.4, relief: 0.12, impasto: 0.12, flow: 0,   // low: relief tiles a dark ground into cobbles
    });
    // the first grass, waking where the light falls — thickest on the crown, gone by the flanks
    for (let i = 0; i < 170; i++) {
      const x = HX - 150 + hr() * 300, y0 = hillY(x) + 1 + hr() * 10, g = Math.max(gS(x, y0), warm(x, y0) * 0.5);
      if (hr() > g * 1.6 || (Math.abs(x - HX) < 12 && y0 < HY + 4)) continue;   // thickest where the light is; not under his feet
      const h = 3 + hr() * 6 * (0.6 + g), lean = (hr() - 0.5) * 3;
      paintPath(out, counter, hr, [[x, y0], [x + lean * 0.4, y0 - h * 0.6], [x + lean, y0 - h]], (xx, yy, r) => jig(mix('#5aa85a', '#c6ec8a', Math.min(1, g * 1.5 + (y0 - yy) / (h + 1) * 0.3)), r, 7), { lw: 0.9, len: 2.5, density: 0.95, jitter: 0.3 });
    }
    // and he stands ON it: a contact shadow thrown away from the spark (down-right)
    E.groundShadow(out, counter, HX + 3, HY + 1, 13, 3.2, { dir: 0.7, reach: 1, op: 0.9, tint: '#3b1b3a' });
    E.setManifold(_MH);
  }
  midRanges.push([_hill, out.length]);

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
    rng, n: 420, sample: rej(-14, 30, 330, 230, (x, y) => fore.some(c => inCap(x, y, c)) && !fore.some(c => inCap(x, y - 5, c))),
    dir: () => 0.42, col: (x, y, r) => gj(mix(GOLD_PALE, '#fff6df', r() * 0.5), r), len: (x, y) => 6 * lengthOf(x, y, 131), lw: (x, y) => 1.4 * widthOf(x, y, 133), steps: 2, lenJ: 0.3, wJ: 0.3, relief: 0.4,
  });
  strokes(out, counter, {
    rng, n: 400, sample: rej(-14, 30, 330, 240, (x, y) => fore.some(c => inCap(x, y, c)) && !fore.some(c => inCap(x, y + 6, c))),
    dir: () => 0.42, col: (x, y, r) => gj(mix('#9a6f30', '#5e3f1a', r() * 0.6), r), len: (x, y) => 6 * lengthOf(x, y, 141), lw: (x, y) => 1.5 * widthOf(x, y, 143), steps: 2, lenJ: 0.3, wJ: 0.3, relief: 0.5,
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
  // THE MAIN CHARACTER — the little pilgrim, newly made, face lifted to his
  // Maker, one thin arm reaching UP toward the Light's fingertip and the spark
  E.paintMask(out, counter, rng, {
    x: C.x, y: C.feet, h: 116, facing: -1, lean: -6,
    armL: childTip, armR: [C.x + 24, C.feet - 44],
    eye: [-1, -1], mood: 'wonder',
  });

  /* ---------------- 5. THE REACH — the fingertip at the gap ---------------- */
  // a hot fingertip rim where the child's hand reaches the gap
  strokes(out, counter, {
    rng, n: 20,
    sample: r => { const a = r() * Math.PI * 2, d = r() * 5; return [childTip[0] + Math.cos(a) * d, childTip[1] + Math.sin(a) * d]; },
    dir: () => -Math.PI / 2,
    col: (x, y, r) => jig(mix(GOLD_HOT, '#e88a4a', r() * 0.5), r, 8),
    len: 3.5, lw: 1.4, steps: 2,
  });

  /* ---------------- 6. THE SPARK — the brightest point, leaping the GAP ----------------
     ⚠ DE-BAKED FOR THE PLANES, exactly as `beginning`'s star is (Fred: "make the starburst
     the same as the one before"). The spark is the one thing on this plate that should be
     alive, so it is not painted into the depth planes at all: the rigs stand on it and
     draw the heart, the arms and the light leaving it. What stays painted is everything
     that should hold still — the deep field, the two reaching arms, the child.
     It stays PAINTED in the flat desktop plate and the contact sheet, which have no rig.
     The arcing licks across the gap and the drifting sparks stay painted too: they belong
     to the two hands, not to the star. */
  const sparkArt = (LAYER === 'full') ? out : [];
  strokes(sparkArt, counter, {
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
  sparkArt.push(`<circle cx="${R1(spark[0])}" cy="${R1(spark[1])}" r="6" fill="#fffffa"/>`);
  sparkArt.push(`<circle cx="${R1(spark[0])}" cy="${R1(spark[1])}" r="3" fill="#ffffff"/>`);
  counter.n += 2;
  // radiating light RAYS — a crisp starburst so the spark reads as a POINT of light,
  // not a cloud (4 long cardinal rays, alternating medium/short between)
  {
    const nrays = 16;
    for (let i = 0; i < nrays; i++) {
      const a = (i / nrays) * Math.PI * 2 + 0.25;
      const long = (i % 4 === 0) ? 48 : (i % 2 === 0 ? 30 : 19);
      const ex = spark[0] + Math.cos(a) * long, ey = spark[1] + Math.sin(a) * long;
      sparkArt.push(ribbon([[spark[0], spark[1]], [spark[0] + Math.cos(a) * long * 0.5, spark[1] + Math.sin(a) * long * 0.5], [ex, ey]], 2.6, jig(mix('#fffef6', GOLD_HOT, 0.4), rng, 5), [0.95, 0.4, 0.0]));
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

  const ALT = 'From the upper-left a great radiant gold arm of the Light reaches in, index finger extended; below it a small child stands on the crown of a little round hill of red earth, reaching up toward the Light, grass just waking on the hilltop where the light falls. Between the Light\'s fingertip and the child a brilliant white-gold spark leaps the gap — life being kindled — against a deep blue-and-violet sky full of stars. Made from the dust of the ground, and given the breath of life.';

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
