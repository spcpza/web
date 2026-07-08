// gen/plates/seeds.mjs — "Seeds" (§12, storybook page 9)
// "Whatever the child planted, grew. (The rock? The rock wasn't from a seed.)"
// — Galatians 6:7, "Whatsoever a man soweth, that shall he also reap."
//
// A furrowed garden field under a swirling golden morning sun (upper-left).
// A small child in deep red kneels mid-sow; behind the child, arcs of young
// olive-green shoots stand in rows, each sprung from where a seed was laid,
// every one leaning toward the light. Out along one row sits a single gray
// rock — nothing grows from it, bare dirt all around: it wasn't from a seed.
//
// Paint order (= rng order — append only):
//   1. SKY FIELD   — vortex around the sun, citron near it, night-blue far
//   2. THE SUN     — rays, ring-swirls, dense disk core (upper-left)
//   3. GROUND      — furrowed field, furrows arcing with the rows
//   4. THE ROCK    — gray capsules + cold shadow + bare-dirt halo
//   5. SHOOTS      — rows of young green sprouts, all leaning sunward
//   6. EASTER EGGS — seven gold seeds mid-air off the child's hand;
//                    a faint "6:7" hiding in the lower-right furrows
//   7. THE CHILD   — deep red sower: halo + underpaint + bright strokes +
//                    warm light pool + rim-light (per love §7)

export const name = 'seeds';
export const title = 'Seeds';
export const caption = 'Whatever the child planted, grew.';
export const seed = 20260312;
export const focal = { x: 330, y: 392 }; // portrait window: the red sower
// MOBILE 3D — depth planes, drawn WITH INTENTION (FAR→NEAR). Sun+sky behind; the
// distant fruit-trees + birds + an organic horizon fringe on the far plane; the
// furrowed field in the middle; the red sower closest of all.
// the SKY is a smooth opaque ground + stacked swirl-sheets (PAINT ON PAINT, like
// the covers); each sheet is its own gapped depth plane so its gaps reveal paint.
export const SKY_SHEETS = [
  { n: 180, len: 30, lw: 6.8, lift: 0.00 },
  { n: 197, len: 27, lw: 6.2, lift: 0.07 },
];
export const layers = [
  { name: 'sky', opaque: true },  // smooth sun-vortex sky ground + the sun (backmost, opaque)
  ...SKY_SHEETS.map((_, i) => ({ name: 'sky' + (i + 1) })),   // stacked sky-swirl sheets
  { name: 'far' },                // distant fruit-trees, birds, cypress, horizon fringe
  { name: 'mid' },                // the furrowed field, shoots, rock, blooms
  { name: 'fg' },                 // the red sower (closest)
];

export function paint(E, opts = {}) {
  const {
    mulberry32, fbm, curlV, goldenSpiralV, mix, ramp, jig, strokes, rej,
    lightRadial, paintFigure, underpaintCapsules, paintChild, lightEdge, castShadow, personCaps, paintPath, inCap, segDist,
    ribbon, svgWrap, R1, W, H,
    GOLD, GOLD_PALE, GOLD_DEEP, GOLD_HOT, NIGHT, DARKEST,
    fruitTree, LEAF_PALETTES, horizonFringe, ridge, distantHills,
  } = E;

  const rng = mulberry32(seed);
  const out = [];
  const counter = { n: 0 };
  // MOBILE 3D LAYERS: tag index ranges per depth band (far / fg). MID = whatever
  // is unclaimed below the sky. The build emits one cel per band.
  const LAYER = opts.layer || 'full';
  const farRanges = [], fgRanges = [];

  /* ---------------- 1. SKY FIELD ---------------- */
  // POST-RESURRECTION: the new life is a VIBRANT, joyful day — happy light blue
  // and pink; the sower is a small dark figure planting in the colour.
  out.push(`<rect width="${W}" height="${H}" fill="#6ecaf7"/>`);

  const SUN = { x: 186, y: 112, r: 54 };          // the ONE light source — morning, upper-left
  const light = lightRadial(SUN.x, SUN.y, 270);
  const horizon = x => 308 + 12 * Math.sin(x / 190 + 1.2) + x * 0.012;

  // THE ALIVE DAY SKY (the fractal sky — motion at three scales): the whole
  // bright morning WHEELS in one great spiral around the SUN (macro), a few
  // eddies turn inside the wheel (mid), and every stroke curves with its parent
  // current (micro). Swirls within swirls — the day sky is deep moving light.
  const WHEEL = { x: 210, y: 128 };               // the great wheel's heart, hard by the morning sun
  const SKY_EDDIES = [[440, 66, -60], [664, 132, 58], [556, 232, -50], [92, 188, 46]];
  const skyDir = (x, y) => {
    let vx = 0, vy = 0;
    { const [a, b] = goldenSpiralV(x, y, WHEEL.x, WHEEL.y, 115, 260); vx += a; vy += b; }   // the great wheel of the morning
    for (const [ex, ey, s] of SKY_EDDIES) { const [a, b] = goldenSpiralV(x, y, ex, ey, s, 80); vx += a; vy += b; }
    const [c, d] = curlV(x, y, 31, 120); vx += c * 26; vy += d * 26;
    return Math.atan2(vy, vx);
  };
  const skySlash = (x, y) => 0.1 + light(x, y) * 0.18;
  // warm citron near the sun dying into deep blue toward the right corner;
  // violet flicks exactly where the gold gives out
  // a COLOURFUL sunrise over the new life — deep blue far out, through teal and
  // coral and rose, warming to gold near the morning sun
  // a VIBRANT morning: pink + sky-blue far out, warming through yellow to
  // white at the rising sun; bright joy sparks, yellow patches blowing through
  // jewel eddy-glow: each mid-eddy core breathes a faint soft-day jewel (gold by
  // the sun, teal + rose out in the blue) — the alive richness, kept subtle
  const SKY_EGLOW = [[440, 66, '#f4c24e'], [664, 132, '#5cc0cf'], [556, 232, '#f28fb4'], [92, 188, '#7fd2c2']];
  const skyCol = (x, y, r, lift) => {
    const g = light(x, y);
    if (g > 0.14 && g < 0.3 && r() < 0.05) return jig(r() < 0.5 ? '#fff4d2' : '#f79ac6', r, 16);
    let c = ramp(['#54c6f7', '#7cccf4', '#f8a4c2', '#fbd862', '#fff2cc', '#fffaf0'],
      Math.min(1, 0.08 + g * 1.7 + fbm(x / 115, y / 115, 23) * 0.18));
    for (const [ex, ey, ec] of SKY_EGLOW) { const d2 = Math.hypot(x - ex, y - ey); c = mix(c, ec, Math.exp(-d2 / 95) * 0.5); }   // the eddy cores breathe faint jewel light
    if (lift) c = mix(c, '#ffffff', lift);
    return jig(c, r, 6);
  };
  // the SKY SAMPLE — reused by the ground pass and every sky-swirl sheet
  const skySample = rej(-10, -10, 810, 340, (x, y) => y < horizon(x) + 10);
  // the smooth sky GROUND — one broad soft pass (opaque base); the swirling
  // brushwork lives in the stacked sheets above, so their gaps reveal paint
  strokes(out, counter, {
    rng, n: 500, sample: skySample,
    dir: skyDir, col: (x, y, r) => skyCol(x, y, r, 0),
    len: 44, lw: 9.5, steps: 4, follow: 0.91, wild: 0.05, aJ: skySlash, lenJ: 0.5,
  });
  const skyGroundEnd = out.length;   // the smooth sky ground (the sun is drawn over it below)

  /* ---------------- 2. THE SUN ---------------- */
  // long leaning rays under the disk — a spiral, not spokes
  strokes(out, counter, {
    rng, n: 400,
    sample: r => { const a = r() * Math.PI * 2, d = SUN.r + 6 + Math.pow(r(), 1.35) * 150; return [SUN.x + Math.cos(a) * d, SUN.y + Math.sin(a) * d]; },
    dir: (x, y) => Math.atan2(y - SUN.y, x - SUN.x) + 0.55,
    col: (x, y, r) => {
      const d = Math.hypot(x - SUN.x, y - SUN.y);
      if (r() < 0.04 && d > SUN.r + 115) return jig('#6b54a8', r, 14);
      return jig(ramp([GOLD_PALE, GOLD, GOLD_DEEP, '#9a8440', '#6b7060'], (d - SUN.r) / 158), r, 8);
    },
    len: 28, lw: 3.4, steps: 3, follow: 0.95, wild: 0.08, lenJ: 0.5,
  });
  // concentric ray-swirl rings
  strokes(out, counter, {
    rng, n: 280,
    sample: r => { const a = r() * Math.PI * 2, d = SUN.r + 2 + r() * 32; return [SUN.x + Math.cos(a) * d, SUN.y + Math.sin(a) * d]; },
    dir: (x, y) => Math.atan2(y - SUN.y, x - SUN.x) + Math.PI / 2 + 0.12,
    col: (x, y, r) => jig(ramp([GOLD_HOT, GOLD_PALE, GOLD], (Math.hypot(x - SUN.x, y - SUN.y) - SUN.r) / 34), r, 8),
    len: 14, lw: 2.8, steps: 3, follow: 0.95,
  });
  // a soft dark CONTRAST ring at the sun's rim, so its brightness pops (drawn
  // under the disk core, which paints over the inner edge)
  lightEdge(out, counter, SUN.x, SUN.y, SUN.r);
  // dense bright disk core
  strokes(out, counter, {
    rng, n: 310,
    sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 0.7) * SUN.r; return [SUN.x + Math.cos(a) * d, SUN.y + Math.sin(a) * d]; },
    dir: (x, y) => Math.atan2(y - SUN.y, x - SUN.x) + Math.PI / 2,
    col: (x, y, r) => jig(ramp(['#fffdf0', GOLD_HOT, GOLD_PALE, GOLD], Math.hypot(x - SUN.x, y - SUN.y) / SUN.r), r, 6),
    len: 11, lw: 3, steps: 2, wJ: 0.5, lenJ: 0.5,
  });
  const skyEnd = out.length;   // sky ground + the morning sun → the opaque SKY plane
  // the stacked SKY-SWIRL SHEETS — each an independent bold, gapped pass of the
  // sun-vortex (paint on paint), own rng per sheet; woven over the ground, under the sun.
  const skySheets = SKY_SHEETS.map((e, k) => {
    const srng = mulberry32(seed + 1009 * (k + 1));
    const sh = [];
    strokes(sh, { n: 0 }, {
      rng: srng, n: e.n, sample: skySample,
      dir: skyDir, col: (x, y, r) => skyCol(x, y, r, e.lift),
      len: e.len, lw: e.lw, steps: 5, follow: 0.9, wild: 0.2, lenJ: 0.55, impasto: 0.6, relief: 0.5,
    });
    return sh.join('\n');
  });

  /* ---------------- 3. GROUND — the furrowed field ---------------- */
  const CHILD = [330, 410]; // where the red sower kneels
  const ROCK = [592, 436];  // the seedless rock, out along a row
  // furrows arc gently — long curves bowing toward the sun side, like rows
  // plowed around the slope; curl keeps them hand-drawn
  const groundDir = (x, y) => {
    const bow = -0.16 - (y - 320) * 0.0012; // rows bow up-left toward the light
    const [c, d] = curlV(x, y, 29, 95);
    return Math.atan2(Math.sin(bow) + d * 0.45, Math.cos(bow) + c * 0.45);
  };
  const groundCol = (x, y, r) => {
    const g = light(x, y);
    const band = fbm(x / 46, y / 22, 43); // furrow striping
    let c = ramp(['#3a6a3e', '#4e8240', '#6e9a40', '#9ab048', '#c4c252'], Math.min(1, g * 1.4 + band * 0.2 + 0.2)); // a FLOURISHING green field
    c = mix(c, '#356e4e', Math.max(0, 0.12 - g) * 1.0);
    return jig(c, r, 7);
  };
  strokes(out, counter, { rng, n: 760, sample: rej(-10, 296, 810, 510, (x, y) => y > horizon(x)), dir: groundDir, col: groundCol, len: 46, lw: 6, steps: 3, follow: 0.9, wild: 0.06, lenJ: 0.4 });
  // horizon crest catching the morning
  strokes(out, counter, {
    rng, n: 240,
    sample: rej(-10, 286, 810, 356, (x, y) => y > horizon(x) && y < horizon(x) + 24),
    dir: x => { const e = 6; return Math.atan2(horizon(x + e) - horizon(x - e), 2 * e); },
    col: (x, y, r) => jig(mix('#3a4060', GOLD_DEEP, light(x, y) * 0.6), r, 8),
    len: 22, lw: 3.2, steps: 3, wild: 0.06,
  });
  // darker furrow shadow bands between the rows (texture pass) — warm earth
  // shadow, not night blue, so the field keeps its morning
  strokes(out, counter, {
    rng, n: 260,
    sample: rej(-10, 330, 810, 510, (x, y) => y > horizon(x) + 14 && fbm(x / 40, y / 16, 61) < 0.4),
    dir: groundDir,
    col: (x, y, r) => jig(mix('#2c2a3c', '#473e2e', fbm(x / 55, y / 30, 67) + light(x, y) * 0.4), r, 6),
    len: 30, lw: 3.2, steps: 3, follow: 0.92, lenJ: 0.5,
  });

  /* ---------------- 4. THE ROCK — not from a seed ---------------- */
  {
    const [rx, ry] = ROCK;
    // bare-dirt halo first: a cold, packed ring of earth where nothing took —
    // the row's green simply skips this place
    strokes(out, counter, {
      rng, n: 130,
      sample: r => { const a = r() * Math.PI * 2, d = 14 + Math.pow(r(), 0.8) * 34; return [rx + Math.cos(a) * d * 1.5, ry + 4 + Math.sin(a) * d * 0.5]; },
      dir: groundDir,
      col: (x, y, r) => jig(mix('#23283e', '#383a48', fbm(x / 30, y / 30, 71)), r, 5),
      len: 16, lw: 3, steps: 2, relief: 0.4,
    });
    // the rock mass: squat gray capsules, gray underpaint, gray strokes —
    // the same dead gray family as the prizes in love
    const rockCaps = [
      { ax: rx - 13, ay: ry - 8, bx: rx + 12, by: ry - 9, r: 15 },  // main boulder
      { ax: rx - 4, ay: ry - 20, bx: rx + 8, by: ry - 18, r: 8 },   // hump
      { ax: rx - 18, ay: ry + 1, bx: rx + 17, by: ry + 2, r: 7 },   // base spread
    ];
    // dark halo behind the boulder so its gray reads against the field
    underpaintCapsules(out, counter, rockCaps.map(c => ({ ...c, r: c.r + 2.6 })), '#14182c');
    underpaintCapsules(out, counter, rockCaps, '#474952');
    paintFigure(out, counter, rng, rockCaps, (x, y, r) => jig(mix('#42444c', '#5d5f66', fbm(x / 14, y / 14, 79)), r, 5), 1.6, 0.45, 0.8);
    // a dull cold top edge — even its highlight is gray, never gold
    strokes(out, counter, {
      rng, n: 40,
      sample: r => [rx - 16 + r() * 30, ry - 26 + r() * 7],
      dir: () => -0.12,
      col: (x, y, r) => jig('#6e7077', r, 4),
      len: 7, lw: 2.1, steps: 2, relief: 0,
    });
    // cold shadow leaning away from the sun (down-right)
    strokes(out, counter, {
      rng, n: 70,
      sample: r => [rx + 10 + r() * 50, ry + 6 + r() * 14],
      dir: () => 0.2,
      col: (x, y, r) => jig(mix('#161b34', '#3c3252', r() * 0.4), r, 8),
      len: 14, lw: 2.8, steps: 2, relief: 0,
    });
  }

  /* ---------------- 5. SHOOTS — every seed grew ---------------- */
  // rows of young sprouts behind/beside the child, in arcs that follow the
  // furrows; each shoot = a short curved stem + two leaf flicks, painted as
  // tapered ribbons, all leaning toward the sun. Muted olive — Van Gogh green.
  const lean = (x, y) => Math.atan2(SUN.y - y, SUN.x - x); // toward the light
  const shoot = (x, y, s) => { // s = size scale ~0.8-1.4
    const a = lean(x, y);
    // stem leans a third of the way from straight-up toward the sun
    const up = -Math.PI / 2, sa = up + (a - up) * 0.34 + (rng() - 0.5) * 0.16;
    const hgt = (20 + rng() * 12) * s;            // taller, so the GROWTH reads as the subject
    const tip = [x + Math.cos(sa) * hgt, y + Math.sin(sa) * hgt];
    const mid = [(x + tip[0]) / 2 + (rng() - 0.5) * 2, (y + tip[1]) / 2 + (rng() - 0.5) * 2];
    // dark seat under the sprout so the green reads against lit earth
    out.push(ribbon([[x - 3, y + 2], [x + 3, y + 2.5]], 3.4 * s, jig('#1e2438', rng, 5))); counter.n++;
    const dk = jig(mix('#566a22', '#74902c', rng()), rng, 8);     // brighter, fresher green
    out.push(ribbon([[x, y + 1], mid, tip], 3.4 * s, dk, [0.55, 0.45, 0.2])); counter.n++;
    // two leaves flicking off the stem — the sun-side leaf brighter
    for (const side of [-1, 1]) {
      const la = sa + side * (0.85 + rng() * 0.3);
      const ll = (11 + rng() * 6) * s;
      const lb = [mid[0] + (rng() - 0.5) * 1.5, mid[1] + (rng() - 0.5) * 1.5];
      const lt = [lb[0] + Math.cos(la) * ll, lb[1] + Math.sin(la) * ll];
      const sunSide = Math.cos(la - a) > 0;
      const lc = jig(sunSide ? mix('#92a83a', '#b8ca50', rng()) : mix('#647a2c', '#82983a', rng()), rng, 9);
      out.push(ribbon([lb, [(lb[0] + lt[0]) / 2 + side * 1.6, (lb[1] + lt[1]) / 2], lt], 2.8 * s, lc, [0.45, 0.5, 0.12])); counter.n++;
    }
    // a tiny warm fleck at the base — the place the seed was laid
    if (rng() < 0.5) {
      out.push(ribbon([[x - 1, y + 2], [x + 1.2, y + 2.4]], 1.5, jig(mix(GOLD_DEEP, '#6e5e2c', 0.55), rng, 8))); counter.n++;
    }
  };
  // three arced rows sweeping the field; spacing breathes; the row that
  // passes the rock leaves it a wide, barren gap
  const rows = [
    { y0: 352, amp: 8, ph: 0.8, x0: 60, x1: 770, step: 26, s: 0.85 },
    { y0: 390, amp: 12, ph: 2.1, x0: 30, x1: 786, step: 30, s: 1.15 },
    { y0: 438, amp: 15, ph: 4.0, x0: 16, x1: 790, step: 36, s: 1.55 },
    { y0: 486, amp: 12, ph: 5.6, x0: 8, x1: 796, step: 44, s: 1.9 },
  ];
  for (const rw of rows) {
    for (let x = rw.x0 + rng() * rw.step; x < rw.x1; x += rw.step * (0.82 + rng() * 0.4)) {
      const y = rw.y0 + Math.sin(x / 150 + rw.ph) * rw.amp + (rng() - 0.5) * 4;
      if (y < horizon(x) + 12) continue;
      if (Math.hypot((x - ROCK[0]) / 1.5, y - ROCK[1]) < 44) continue;   // the rock's barren gap
      if (Math.hypot(x - CHILD[0], y - CHILD[1]) < 42) continue;          // room for the sower
      shoot(x, y, rw.s * (0.85 + rng() * 0.3));
    }
  }
  // freshly-sown stretch just ahead of the child's hand: seeds in the furrow,
  // a few barely-broken sprouts — the youngest growth nearest the sower
  for (let i = 0; i < 7; i++) {
    const x = CHILD[0] - 58 - i * 17 + (rng() - 0.5) * 6;
    const y = CHILD[1] + 6 + Math.sin(i * 1.3) * 5 + rng() * 4;
    if (rng() < 0.55) shoot(x, y, 0.55 + rng() * 0.25);
    else { out.push(ribbon([[x, y], [x + 2, y + 0.6]], 1.7, jig(GOLD_DEEP, rng, 10))); counter.n++; }
  }

  /* ---------------- 5.5 THE BLOOMS — new life bursts into COLOUR ----------------
     the planted life did not only grow, it BLOOMED: flowers of every colour
     open across the field. A new life began, and it is colourful. */
  for (let i = 0; i < 240; i++) {
    const x = 18 + rng() * 772;
    const y = 336 + rng() * 166;
    if (y < horizon(x) + 14) continue;
    if (Math.hypot((x - ROCK[0]) / 1.5, y - ROCK[1]) < 46) continue;   // nothing blooms on the barren rock
    if (Math.hypot(x - CHILD[0], y - CHILD[1]) < 30) continue;          // room for the sower
    const k = rng();
    const c = k < 0.22 ? '#ee5c84' : k < 0.42 ? '#a47ce0' : k < 0.6 ? '#f6c63e' : k < 0.78 ? '#5ab4ec' : '#f29ad0';
    const s = 1.9 + rng() * (2.0 + (y - 340) / 160 * 1.9);             // bigger toward the viewer
    for (let p = 0; p < 5; p++) {                                       // a few petals around a bright heart
      const a = p / 5 * Math.PI * 2 + rng() * 0.5;
      out.push(ribbon([[x, y], [x + Math.cos(a) * s, y + Math.sin(a) * s]], 1.8, jig(c, rng, 13))); counter.n++;
    }
    out.push(ribbon([[x - 0.7, y], [x + 0.8, y + 0.2]], 1.8, jig(mix(c, GOLD_HOT, 0.55), rng, 8))); counter.n++;
  }

  /* ---------------- 6. EASTER EGGS ---------------- */
  // egg: Galatians 6:7 ("whatsoever a man soweth, that shall he also reap") in
  // ORIGINAL KOINE GREEK numerals, Ϛʹ·Ζʹ (Ϛ=6, Ζ=7), hiding in the lower-right furrow.
  {
    E.inscriptionText(out, E.greekRef(6, 7), { x: 726, y: 486, h: 22, body: '#e4e8d8', edge: '#1a1f2e', op: 0.82, edgeOp: 0.5 });
  }

  /* ---------------- BACKGROUND LIFE + the distant trees + horizon fringe ----------------
     all at/near the horizon → the FAR plane (barely parallaxes). */
  const _far = out.length;
  // DISTANT HILLS — a rolling-land silhouette; its undulating skyline is the
  // sky↔field boundary (never a ruled line) and slides against the sky on the pan.
  distantHills(out, counter, rng, { topFn: ridge(horizon, { amp: 26, freq: 190, bumps: 0.5, seed: 121 }), horizonFn: horizon, cols: ['#5f8e5a', '#73a258', '#8fb858'], depth: 64, lightFn: light, seed: 121 });
  for (const [bx, by, s] of [[300, 58, 1], [338, 72, 0.85], [378, 54, 0.9], [620, 78, 0.78]]) {
    paintPath(out, counter, rng, [[bx - 6 * s, by + 2.6 * s], [bx, by - 1.8 * s], [bx + 6 * s, by + 2.6 * s]], (x, y, r) => jig('#34364a', r, 6), { lw: 1.5 * s, len: 3.4, density: 0.9, jitter: 0.5 });
  }
  farRanges.push([_far, out.length]);   // ← distant hills + birds (FAR plane)
  // the HORIZON FRINGE rises from the field's edge (MID — planted with the field)
  horizonFringe(out, counter, rng, { horizonFn: horizon, x0: -10, x1: 810, cols: ['#3a6a3e', '#4e8240', '#6e9a40', '#9ab048'], hMax: 20, lightFn: light });
  // what the child sowed GREW — fruit-trees rooted across the field, each PLANTED
  // in the MID field so its base stays with the ground (Gal 6:7; Isa 35:1)
  fruitTree(out, counter, rng, 74, 344, 60, 28, LEAF_PALETTES[5], light);   // amber, back-left
  fruitTree(out, counter, rng, 470, 332, 46, 22, LEAF_PALETTES[1], light);  // pink, mid-back
  fruitTree(out, counter, rng, 748, 348, 64, 30, LEAF_PALETTES[0], light);  // violet, back-right

  /* ---------------- 7. THE CHILD — the red sower ----------------  [FG plane] */
  const _fgChild = out.length;
  const fy = CHILD[1] + 8; // ground line under the knees
  const cx = CHILD[0];
  // kneeling, body turned left toward the fresh furrow, sowing arm flung out
  // articulated child tending the garden: bowed, one hand reaching DOWN to the
  // soil (planting), the other steadying the seed pouch at the hip
  const childCaps = personCaps(cx + 2, fy - 48, 48, {
    lean: -2, headTilt: 1,
    leftHand: [cx - 15, fy - 13],   // planting hand, down toward the fresh furrow
    rightHand: [cx + 12, fy - 16],  // near hand steadying the seed pouch
    leftFoot: [cx - 4, fy - 1],     // kneeling, feet tucked low
    rightFoot: [cx + 11, fy - 1],
  });
  // warm light pool around the sower first (relief:0 — calm flat paint)
  const nearChild = (x, y, m) => childCaps.some(c => segDist(x, y, c.ax, c.ay, c.bx, c.by) <= c.r + m);
  strokes(out, counter, {
    rng, n: 300,
    sample: rej(cx - 92, fy - 52, cx + 88, fy + 46,
      (x, y) => y > horizon(x) + 4 && Math.hypot((x - cx) / 88, (y - fy + 4) / 46) <= 1 && !nearChild(x, y, 2.5)),
    dir: groundDir,
    col: (x, y, r) => jig(ramp([mix(GOLD, '#7d6c30', 0.35), '#6e602e', '#4a4530', '#323a50'],
      Math.hypot((x - cx) / 88, (y - fy + 4) / 46)), r, 6),
    len: 22, lw: 4.4, steps: 2, follow: 0.9, aJ: 0.07, lenJ: 0.35, relief: 0,
  });
  // THE MAIN CHARACTER — "you": consistent deep-red clothes + bold dark outline so
  // the reader can follow the same child across the whole book (was a dark-mulberry form here).
  castShadow(out, counter, childCaps, { dir: 0.6 });
  paintChild(out, counter, rng, childCaps, { whiteAura: true, outlineW: 4 });
  // the seed pouch at the hip: a small dun sack
  {
    const px = cx + 14, py = fy - 13;
    strokes(out, counter, {
      rng, n: 30,
      sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 1.3) * 5.5; return [px + Math.cos(a) * d, py + Math.sin(a) * d * 1.15]; },
      dir: () => -0.3,
      col: (x, y, r) => jig(mix('#8a7044', '#a8895a', r() * 0.6), r, 8),
      len: 4, lw: 1.9, steps: 2, relief: 0,
    });
  }
  // egg: exactly SEVEN gold seeds mid-air, arcing off the flung hand toward
  // the open furrow — sown in sevens, the perfect count
  {
    const hand = [cx - 15, fy - 13];
    for (let i = 0; i < 7; i++) {
      const t = (i + 1) / 8;
      const sx = hand[0] - t * 52 + (rng() - 0.5) * 5;
      const sy = hand[1] - Math.sin(t * Math.PI) * 17 + t * 24 + (rng() - 0.5) * 4;
      out.push(ribbon([[sx, sy], [sx + 1.6, sy + 0.7], [sx + 3, sy + 1.6]], 1.9,
        jig(ramp([GOLD_HOT, GOLD_PALE, GOLD_DEEP], t * 0.8), rng, 8))); counter.n++;
    }
  }
  // gold rim-light on the sun side (upper-left flank — the morning touches the sower)
  strokes(out, counter, {
    rng, n: 24,
    sample: rej(cx - 22, fy - 52, cx + 12, fy, (x, y) => childCaps.some(c => inCap(x, y, c)) && !childCaps.some(c => inCap(x - 3.5, y - 3.5, c))),
    dir: () => -Math.PI * 0.72,
    col: (x, y, r) => jig(mix(GOLD_DEEP, '#a8742c', r() * 0.5), r, 9),
    len: 3.8, lw: 1.4, steps: 2, relief: 0,
  });

  /* ---------------- 8. SOWER PROMINENCE (append-only) ----------------
     At thumbnail size the red needs one more push: a brighter warm core in
     the pool right at the sower's knees, a deeper halo, and a final brighter
     red pass over the body — same recipe as love §7. */
  strokes(out, counter, {
    rng, n: 110,
    sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 1.5) * 40; const x = cx + Math.cos(a) * d * 1.5, y = fy + 4 + Math.sin(a) * d * 0.4; return nearChild(x, y, 2) ? null : [x, y]; },
    dir: groundDir,
    col: (x, y, r) => jig(ramp([mix(GOLD, '#a8923e', 0.25), '#94803a', '#6e602e'], Math.hypot((x - cx) / 1.5, (y - fy) * 1.5) / 52), r, 7),
    len: 12, lw: 2.6, steps: 2, aJ: 0.06, relief: 0,
  });
  // re-assert the main character over the prominence pool (consistent red + outline)
  paintChild(out, counter, rng, childCaps, { whiteAura: true, outlineW: 4 });
  // re-fling the seven seeds over the repaint, and refresh the rim-light
  {
    const hand = [cx - 15, fy - 13];
    for (let i = 0; i < 7; i++) {
      const t = (i + 1) / 8;
      const sx = hand[0] - t * 52 + (rng() - 0.5) * 5;
      const sy = hand[1] - Math.sin(t * Math.PI) * 17 + t * 24 + (rng() - 0.5) * 4;
      out.push(ribbon([[sx, sy], [sx + 1.6, sy + 0.7], [sx + 3, sy + 1.6]], 2,
        jig(ramp([GOLD_HOT, GOLD_PALE, GOLD_DEEP], t * 0.8), rng, 8))); counter.n++;
    }
  }
  strokes(out, counter, {
    rng, n: 26,
    sample: rej(cx - 22, fy - 52, cx + 12, fy, (x, y) => childCaps.some(c => inCap(x, y, c)) && !childCaps.some(c => inCap(x - 3.5, y - 3.5, c))),
    dir: () => -Math.PI * 0.72,
    col: (x, y, r) => jig(mix(GOLD_DEEP, '#b87e2e', r() * 0.5), r, 9),
    len: 3.8, lw: 1.5, steps: 2, relief: 0,
  });
  fgRanges.push([_fgChild, out.length]);   // ← the red sower is foreground

  /* ---------------- 9. THE LIVING FIELD (append-only) ----------------
     Matt 13:4 — "and when he sowed... the fowls came": gleaning birds follow
     a few steps behind the sower, pecking the open furrow — here they are not
     thieves but part of the living field the sowing woke (Ps 104:24). And
     POPPIES — red jewels with dark hearts — bloom through the gold-green. */
  // POPPIES first (the birds paint over them where they meet): bold red dabs,
  // bigger toward the viewer, skipping the rock, the sower, and the eggs.
  for (let i = 0; i < 78; i++) {
    const x = 14 + rng() * 776;
    const y = 338 + rng() * 160;
    if (y < horizon(x) + 16) continue;
    if (Math.hypot((x - ROCK[0]) / 1.5, y - ROCK[1]) < 48) continue;   // the barren rock stays barren
    if (Math.hypot(x - CHILD[0], y - CHILD[1]) < 36) continue;          // room for the sower
    if (x > 252 && x < 322 && y > 388 && y < 430) continue;             // the seven-seed arc stays legible
    if (x > 692 && y > 458) continue;                                   // the hidden 6:7 furrow
    const s = 2.1 + rng() * (1.5 + (y - 338) / 160 * 2.4);              // size grows toward the viewer
    const red = jig(rng() < 0.3 ? '#e8452e' : '#d2342c', rng, 11);
    for (let p = 0; p < 4; p++) {                                       // four bold petal dabs
      const a = p / 4 * Math.PI * 2 + 0.4 + rng() * 0.7;
      out.push(ribbon([[x + Math.cos(a) * s * 0.35, y + Math.sin(a) * s * 0.3],
                       [x + Math.cos(a) * s, y + Math.sin(a) * s * 0.85]], 2.4 + s * 0.4, red)); counter.n++;
    }
    out.push(ribbon([[x - 0.9, y], [x + 0.9, y + 0.2]], 1.6 + s * 0.22, jig('#26122a', rng, 6))); counter.n++;  // dark heart
  }
  // a GLEANING BIRD — bold curved silhouette (Munch: living = curved lines),
  // one warm accent, facing LEFT toward the sower's row. peck → head in the furrow.
  const glean = (bx, by, s, peck) => {
    // pale seat under the bird so the dark shape reads on the furrow shadows too
    out.push(ribbon([[bx - 9 * s, by + 1.6 * s], [bx + 8 * s, by + 2.2 * s]], 3.4 * s, jig('#c2c47e', rng, 9))); counter.n++;
    const dk = () => jig(mix('#1d2238', '#2e3450', rng() * 0.7), rng, 6);
    // tail → back, one long curve
    out.push(ribbon([[bx + 11 * s, by - 10 * s], [bx + 3 * s, by - 9 * s], [bx - 3.5 * s, by - 6.5 * s]], 4.6 * s, dk(), [0.3, 0.55, 0.5])); counter.n++;
    // breast + belly
    out.push(ribbon([[bx + 6 * s, by - 5.5 * s], [bx - 0.5 * s, by - 4.6 * s], [bx - 5 * s, by - 4.8 * s]], 4.4 * s, dk(), [0.35, 0.55, 0.4])); counter.n++;
    // neck + head: pecking = down into the open furrow; else up, watching the sower
    const hd = peck ? [bx - 8.5 * s, by - 1.6 * s] : [bx - 7 * s, by - 11 * s];
    out.push(ribbon([[bx - 3.5 * s, by - 6 * s], [(bx - 3.5 * s + hd[0]) / 2 - s, (by - 6 * s + hd[1]) / 2], hd], 3.1 * s, dk(), [0.5, 0.5, 0.55])); counter.n++;
    // beak — to the seed, or level
    const bk = peck ? [hd[0] - 1.6 * s, hd[1] + 2.6 * s] : [hd[0] - 3.4 * s, hd[1] + 0.6 * s];
    out.push(ribbon([[hd[0], hd[1]], bk], 1.3 * s, jig('#9a7a2e', rng, 8))); counter.n++;
    // one pale wing-stripe along the back
    out.push(ribbon([[bx + 7 * s, by - 8.6 * s], [bx + 0.5 * s, by - 7.4 * s]], 1.7 * s, jig('#9aa0c0', rng, 8))); counter.n++;
    // gold eye dot
    out.push(ribbon([[hd[0] + 0.4 * s, hd[1] - 0.8 * s], [hd[0] + 1.2 * s, hd[1] - 0.7 * s]], 1.1 * s, jig(GOLD_HOT, rng, 6))); counter.n++;
    // legs
    for (const lx of [-1.2, 2.2]) {
      out.push(ribbon([[bx + lx * s, by - 3.6 * s], [bx + (lx - 0.6) * s, by + 1.4 * s]], 0.9 * s, jig('#3a3020', rng, 6))); counter.n++;
    }
  };
  glean(398, 431, 1.0, true);    // pecking the furrow, a few steps behind the sower
  glean(440, 447, 1.2, true);    // the nearest gleaner, head deep in the row
  glean(474, 421, 0.9, false);   // one alert, watching the sower
  // two more fowls coming in low (Matt 13:4), gliding down toward the rows —
  // above the horizon → they ride the FAR plane with the other birds
  const _fly = out.length;
  for (const [fx2, fy2, fs] of [[448, 260, 1.1], [472, 247, 0.85]]) {
    const w = jig('#232942', rng, 7);
    out.push(ribbon([[fx2 - 8 * fs, fy2 - 2 * fs], [fx2 - 3.6 * fs, fy2 - 5.4 * fs], [fx2, fy2]], 2.2 * fs, w, [0.25, 0.5, 0.55])); counter.n++;
    out.push(ribbon([[fx2, fy2], [fx2 + 3.8 * fs, fy2 - 4.2 * fs], [fx2 + 8 * fs, fy2 - 0.6 * fs]], 2.2 * fs, w, [0.55, 0.5, 0.25])); counter.n++;
    out.push(ribbon([[fx2 - 1.6 * fs, fy2 + 0.2 * fs], [fx2 + 2 * fs, fy2 + 0.9 * fs]], 2.5 * fs, jig('#1c2136', rng, 6))); counter.n++; // body
  }
  farRanges.push([_fly, out.length]);   // ← the incoming pair joins the FAR bird plane

  // MULTIPLANE: assemble the requested depth plane. Each is its own cel —
  // transparent where it has no content — so they stack and parallax apart.
  const ALT = 'Under a swirling golden morning sun, a small child in deep red kneels sowing on a furrowed field; rows of young green shoots lean toward the light, and one gray rock sits in a row with nothing growing from it.';
  const RAW = { undercoat: 0, weave: 0, varnish: 0, oil: 0 };   // no baked surface — the live filter unifies the planes
  const setOf = ranges => { const s = new Set(); for (const [a, b] of ranges) for (let i = a; i < b; i++) s.add(i); return s; };
  const pick = ranges => ranges.map(([a, b]) => out.slice(a, b).join('\n')).join('\n');
  const farSet = setOf(farRanges), fgSet = setOf(fgRanges);
  if (LAYER === 'sky') return svgWrap(ALT, out.slice(0, skyEnd).join('\n'), RAW);   // sky ground + sun (opaque)
  const sm = LAYER.match(/^sky(\d+)$/);
  if (sm) return svgWrap(ALT, '<g>' + skySheets[+sm[1] - 1] + '</g>', RAW);          // one sky-swirl sheet
  if (LAYER === 'far') return svgWrap(ALT, pick(farRanges), RAW);                   // birds, fringe, distant trees
  if (LAYER === 'fg') return svgWrap(ALT, pick(fgRanges), RAW);                     // the red sower
  if (LAYER === 'mid') {                                                            // field, furrows, rock, shoots, blooms
    const body = out.filter((_, i) => i >= skyEnd && !farSet.has(i) && !fgSet.has(i)).join('\n');
    return svgWrap(ALT, body, RAW);
  }
  // full painting (desktop): sky ground, the stacked sky-sheets, then the sun + everything else
  return svgWrap(ALT, out.slice(0, skyGroundEnd).concat(skySheets, out.slice(skyGroundEnd)).join('\n'));
}
