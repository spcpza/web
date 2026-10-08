// gen/plates/road.mjs — "The long road home" (§7) — REDESIGNED FOR THE GULF.
//
//   "I will arise and go to my father."                        — Luke 15:18
//
// You turn for home and the Light sets you on the road. It climbs the wheat
// hills — over a rise, down through a hollow ("hills and valleys") — and brings
// you to the brink of a GREAT VALLEY: a huge gulf plunging into blue depth. The
// home glows warm and gold on the FAR rim, across the gulf, close enough to see
// and too far to reach. The road stops at the near rim. You cannot walk across,
// and you will not go back. This is the gulf the very next page bridges — the
// Light becomes the way over, and the bridge is a cross. The two pages are one
// canyon, seen twice: here without the bridge, there with it.
//
// Paint order: sky (eddy swirl) -> far plateau + home across the gulf ->
// THE GREAT VALLEY (deep plunging blue) -> near wheat hills -> the winding road
// (ends at the near rim) -> cypress egg -> the child at the brink -> alpha/omega.

export const name = 'road';
export const title = 'The long road home';
export const caption = 'The road brought you to the brink — the Light makes the way across.';
export const seed = 20260707;
export const focal = { x: 430, y: 300 }; // portrait window: the brink, the child, the home across the gulf
// MOBILE 3D — depth planes (FAR→NEAR): the whole far half across the gulf (sky,
// plateau, home, the plunge) is the opaque backdrop; the near wheat hills + road
// + an organic wheat fringe at the brink in the middle; the foreground fruit-
// trees nearer; the child at the very brink, closest.
// the SKY is a smooth opaque GROUND plus two independent bold, gapped swirl-
// SHEETS (paint on paint, like the covers); each sheet is its own depth plane
// so their gaps reveal the paint beneath as the view turns.
// ⭐ DETAIL PASS (Sep 8): finer sheets, every stroke its own width and length (free hashes,
// no rule — see widthOf/lengthOf in paint()); the sky is still drawn fresh per frame.
export const SKY_SHEETS = [
  { n: 1000, len: 34, lw: 3.2, lift: 0.00 },
  { n: 1080, len: 30, lw: 3.0, lift: 0.07 },
];
export const layers = [
  { name: 'sky', opaque: true },  // smooth sky ground + far plateau + home + the whole gulf (backmost)
  ...SKY_SHEETS.map((_, i) => ({ name: 'sky' + (i + 1) })),   // stacked sky-swirl sheets
  { name: 'mid' },                // near wheat hills, road, brink fringe (the GROUND-projected plane)
  { name: 'tc' },                 // pink tree, mid  (base 556,466) — own billboard so the ground map never shears it
  { name: 'ta' },                 // violet tree, near-left  (base 104,492)
  { name: 'tb' },                 // teal tree, near-right   (base 700,498)
  { name: 'fg' },                 // the child at the brink (anchored at his feet 380,361)
];

export function paint(E, opts = {}) {
  const {
    mulberry32, fbm, curlV, goldenSpiralV, mix, ramp, jig, strokes, rej,
    paintFigure, paintPath, underpaintCapsules, paintChild, castShadow, personCaps, inCap, lightRadial, setReliefLight,
    svgWrap, R1, W, H,
    GOLD, GOLD_PALE, GOLD_DEEP, GOLD_HOT, NIGHT, DARKEST,
    fruitTree, LEAF_PALETTES, horizonFringe,
  } = E;

  const rng = mulberry32(seed);
  const out = [];
  const counter = { n: 0 };
  // MOBILE 3D LAYERS: tag index ranges per band. MID = whatever is unclaimed
  // below the opaque far backdrop.
  const LAYER = opts.layer || 'full';
  const fgRanges = [];
  // ⭐ EVERY STROKE DRAWS ITS OWN WIDTH AND LENGTH (Fred: "use no rules, a paint stroke
  // just exist because it exist") — two independent hashes per mark, no field, no coupling.
  const free = (x, y, salt) => { const n = Math.sin(x * 12.9898 + y * 78.233 + salt) * 43758.5453; return n - Math.floor(n); };
  const widthOf  = (x, y, salt) => 0.40 + 3.2 * Math.pow(free(x, y, salt), 2.6);
  const lengthOf = (x, y, salt) => 0.40 + 1.5 * Math.pow(free(x, y, salt + 17), 1.5);
  out.push(`<rect width="${W}" height="${H}" fill="${DARKEST}"/>`);

  /* ---------------- GEOMETRY ---------------- */
  // far rim: the top of the far plateau, where home sits across the gulf
  const farRim = x => 236 + 8 * Math.sin((x - 360) / 150) - 6 * Math.sin(x / 70);
  // near rim: the foreground brink where the road stops and the gulf begins
  const nearRim = x => 352 + 16 * Math.sin((x - 250) / 180) + 7 * Math.sin(x / 64);
  // the gulf is everything between the two rims
  const inGulf = (x, y) => y > farRim(x) && y < nearRim(x);

  // the home, warm and gold, on the far rim across the gulf — the destination
  const home = [556, 212];
  const homeLight = lightRadial(home[0], home[1], 250);
  setReliefLight({ x: home[0], y: home[1] });   // nocturne: every form's shadow falls away from the glowing home
  const lightAt = (x, y) => Math.min(1, homeLight(x, y));

  // THE ROAD — one way only. It climbs from the far country (lower-left), over a
  // wheat rise and down through a hollow, and ENDS at the near rim of the gulf.
  const RP = [
    [60, 498], [128, 452], [196, 470], [262, 420], [320, 392], [382, 360],
  ];
  const crP = t => {
    const n = RP.length - 1;
    const f = Math.max(0, Math.min(n - 1e-4, t * n));
    const i = Math.floor(f), u = f - i;
    const p0 = RP[Math.max(0, i - 1)], p1 = RP[i], p2 = RP[Math.min(n, i + 1)], p3 = RP[Math.min(n, i + 2)];
    const cr = (a, b, c, d) => 0.5 * ((2 * b) + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u * u + (-a + 3 * b - 3 * c + d) * u * u * u);
    return [cr(p0[0], p1[0], p2[0], p3[0]), cr(p0[1], p1[1], p2[1], p3[1])];
  };
  const roadW = t => 4 + 16 * t * t;                  // wide in the foreground, narrowing uphill
  const roadInfo = (x, y) => {
    let bt = 0, bd = 1e9;
    for (let t = 0; t <= 1.0001; t += 0.02) { const p = crP(t); const d = Math.hypot(x - p[0], y - p[1]); if (d < bd) { bd = d; bt = t; } }
    return { t: bt, d: bd };
  };
  const onRoad = (x, y) => { const { t, d } = roadInfo(x, y); return d < roadW(t) / 2; };
  const roadDir = t => { const a = crP(Math.max(0, t - 0.015)), b = crP(Math.min(1, t + 0.015)); return Math.atan2(b[1] - a[1], b[0] - a[0]); };

  // solid regional underpaints (gaps must read as land/depth, never void)
  out.push(`<path d="M-2 -2H802V250H-2Z" fill="#3a3560"/>`);                       // sky
  out.push(`<path d="M-2 ${R1(farRim(-2))}H802V${R1(nearRim(802))}H-2Z" fill="#1a2348"/>`); // gulf band base
  counter.n += 2;
  // (the near-hills base underpaint is pushed in §4 below so it rides the MID plane)

  /* ---------------- 1. SKY — the ALIVE jewel-swirl (motion at three scales) ----
     One GREAT WHEEL organises the whole twilight sky, its centre near the home's
     light across the gulf (so the sky wheels around the destination); a few EDDIES
     turn inside the wheel; and a fine micro-curl bends every stroke with its parent
     current. Deep twilight blue/violet, jewel cores breathing faint colour, only
     the crest edges catching silver — swirls within swirls, the deep moving water,
     the same alive hand as looking/garden. Kept twilight-DARK; the far home stays
     the brightest thing. */
  /* ⚠ THIS SKY IS DRAWN FRESH FOR EVERY FRAME. The phase below comes from the build
     (globalThis.__FRAME of __FRAME_N), and everything that makes the sky's shape is moved
     by it: the eddies travel their own small closed orbits, the fine turbulence field is
     sampled from a moving point, and the jewel cores go with them. So frame 3 is not frame
     0 shifted — it is the same sky a moment later, with every stroke drawn where that
     moment puts it. The orbits are CLOSED, so the last frame runs back into the first and
     the loop never jumps. */
  const _FRN = Math.max(1, globalThis.__FRAME_N || 6);
  const PH = ((globalThis.__FRAME || 0) % _FRN) / _FRN * Math.PI * 2;
  const orb = (r, k = 1) => [Math.cos(PH * k) * r, Math.sin(PH * k) * r * 0.55];
  const [ox1, oy1] = orb(13), [ox2, oy2] = orb(9, 1), [ox3, oy3] = orb(11), [ox4, oy4] = orb(8);
  const [tx, ty] = orb(46);            // the turbulence field itself travels
  const EDDIES = [[140 + ox1, 78 + oy1, -60], [360 - ox2, 60 - oy2, 58],
                  [640 + ox3, 96 + oy3, -52], [470 - ox4, 168 - oy4, 46]];
  const nearE = (x, y) => { let m = 1e9; for (const [ex, ey] of EDDIES) m = Math.min(m, Math.hypot(x - ex, y - ey) / 80); return m; };
  const skyDir = (x, y) => {
    let vx = 0, vy = 0;
    { const [a, b] = goldenSpiralV(x, y, 548 + ox1 * 0.5, 150 + oy1 * 0.5, 115, 260); vx += a; vy += b; }   // MACRO — the great wheel, turning on its own axle
    for (const [ex, ey, s] of EDDIES) { const [a, b] = goldenSpiralV(x, y, ex, ey, s, 80); vx += a; vy += b; }   // MID — eddies turning inside it
    const [cx2, cy2] = curlV(x + tx, y + ty, 31, 120); vx += cx2 * 26; vy += cy2 * 26;   // MICRO — fine turbulence, and it TRAVELS between frames
    vy -= 12; vx += 5;                                                              // a gentle rising drift (the arising)
    return Math.atan2(vy, vx);
  };
  const EGLOW = [[140 + ox1, 78 + oy1, '#3f549e'], [360 - ox2, 60 - oy2, '#41337e'],
                 [640 + ox3, 96 + oy3, '#2f5a92'], [470 - ox4, 168 - oy4, '#4a3f92']];   // the jewels ride with their eddies
  const skyCol = (x, y, r, lift) => {
    const near = nearE(x, y);
    const g = lightAt(x, y);
    if (g > 0.16 && g < 0.3 && r() < 0.03) return jig('#d96f2e', r, 18);            // a breath of the home's warmth
    if (near < 0.7 && r() < 0.05) return jig(mix(GOLD_DEEP, '#9a8a5a', r()), r, 12); // a faint warm knot at an eddy core
    let c = ramp(NIGHT, Math.max(0, Math.min(1, 0.6 + fbm((x + tx) / 85, (y + ty) / 85, 13) * 0.3)));
    c = g > 0.05 ? mix(c, '#b08a40', g * 0.45) : mix(c, '#1a2340', 0.16);           // luminous, never black
    for (const [ex, ey, ec] of EGLOW) { const d2 = Math.hypot(x - ex, y - ey); c = mix(c, ec, Math.exp(-d2 / 95) * 0.5); }   // eddy cores breathe deep jewel light
    if (lift) c = mix(c, '#ffffff', lift);
    return jig(c, r, 10);
  };
  // the smooth sky GROUND — one broad soft opaque pass of long flowing strokes that
  // FOLLOW the wheel (the deep moving water); the brighter turbulent brushwork and
  // the silver crests live in the stacked sheets above, so their gaps reveal this
  // paint beneath (paint on paint, like the covers)
  strokes(out, counter, {
    rng, n: 1500, sample: rej(-10, -10, 810, 250, (x, y) => y < farRim(x) + 8), dir: skyDir,
    col: (x, y, r) => skyCol(x, y, r, 0),
    len: (x, y) => 30 * lengthOf(x, y, 11), lw: (x, y) => 4.6 * widthOf(x, y, 13), steps: 4, follow: 0.91, wild: 0.05, lenJ: 0.3, wJ: 0.3, impasto: 0.5, relief: 0.4,
  });
  const skyGroundEnd = out.length;   // the smooth sky ground (the SKY plane); plateau/home/gulf follow and stay IN FRONT of the sheets

  /* ⚠ THE RANGES ARE PAINTED FIRST, because they stand BEHIND everything across the gulf.
     My first cut of them ran after the plateau and buried the house and its whole glow —
     the one thing on this page that must never be covered. Depth is an ORDER, not just a
     set of colours: what is furthest away goes down first. */
  /* -------- 3.6 THE NIGHT GETS ITS DEPTH ------------------------------------------
     Fred: "add few more layers in the background for the night." Distance in a night
     landscape is not one far plateau and then sky — it is RANGE BEHIND RANGE, each one
     paler, cooler and flatter than the one in front, until the last is barely separable
     from the air. Four of them now stand behind the home's plateau, plus a band of low
     night haze along their feet, so the dark has somewhere to go. Nothing here is bright:
     they are read by their EDGES against each other, which is how you see hills at night. */
  for (let g = 0; g < 4; g++) {
    const t = g / 3;                                   // 0 nearest range → 1 furthest
    const base = farRim(400) - 8 - g * 15;
    const ridge = x => base - (16 - g * 3) * Math.sin(x / (150 + g * 60) + g * 2.1)
                            - (9 - g * 2) * Math.sin(x / (61 + g * 17) + g);
    strokes(out, counter, {
      rng, n: 1000 - g * 140,
      sample: r => {
        const x = -12 + r() * 824;
        const top = ridge(x);
        const y = top + Math.pow(r(), 0.7) * (34 - g * 6);
        return y < farRim(x) - 2 ? [x, y] : null;
      },
      dir: x => 0.03 + Math.sin(x / 130) * 0.12,
      col: (x, y, r) => {
        // each range further off is paler and cooler — aerial perspective, at night
        const c = ramp(['#232a52', '#2b3160', '#343a6c', '#3f4478'], t + fbm(x / 90, y / 30, 361) * 0.18);
        return jig(mix(c, '#6a5a3c', homeLight(x, y) * 0.30 * (1 - t)), r, 5);
      },
      len: (x, y) => (28 - g * 4) * lengthOf(x, y, 21 + g), lw: (x, y) => (3.6 - g * 0.5) * widthOf(x, y, 25 + g), steps: 3, follow: 0.97, lenJ: 0.3, wJ: 0.3, impasto: 0.12, relief: 0.3, op: 0.9 - t * 0.3,
    });
    // the lit edge of each range: at night a hill is its own top line, nothing else
    paintPath(out, counter, rng,
      Array.from({ length: 30 }, (_, i) => { const x = -12 + i * 28; return [x, ridge(x)]; }),
      (x, y, r) => jig(mix(ramp(['#3d4478', '#4a5088', '#585d96'], t), '#8a7448', homeLight(x, y) * 0.5 * (1 - t)), r, 6),
      { lw: 1.6, len: 5, density: 0.55, jitter: 0.7 });
  }
  // and the haze lying at their feet, so the ranges stack instead of touching
  strokes(out, counter, {
    rng, n: 520,
    sample: r => { const x = -12 + r() * 824; const y = farRim(x) - 10 - Math.pow(r(), 0.8) * 26; return [x, y]; },
    dir: x => 0.01 + Math.sin(x / 110) * 0.09,
    col: (x, y, r) => jig(mix('#39406e', '#59608e', Math.abs(fbm(x / 100, y / 22, 367))), r, 5),
    len: 54, lw: 5, steps: 3, follow: 0.99, lenJ: 0.6, impasto: 0, op: 0.22,
  });

  /* ---------------- 2. THE FAR PLATEAU + HOME (across the gulf) ---------------- */
  strokes(out, counter, {
    rng, n: 900, sample: rej(-10, 220, 810, 320, (x, y) => y > farRim(x) - 4 && y < farRim(x) + 30),
    dir: x => { const e = 7; return Math.atan2(farRim(x + e) - farRim(x - e), 2 * e); },
    col: (x, y, r) => jig(ramp(['#1e1e3c', '#332a46', '#5c4a36', '#8f7030', '#cc9e46'], Math.min(1, homeLight(x, y) * 1.7 + fbm(x / 70, y / 70, 19) * 0.18)), r, 7),
    len: (x, y) => 22 * lengthOf(x, y, 31), lw: (x, y) => 2.6 * widthOf(x, y, 33), steps: 3, wild: 0.05, lenJ: 0.3, wJ: 0.3, impasto: 0.66, relief: 0.35,
  });
  { // the Father's house — a RADIANT BEACON of light across the gulf, the home
    //  of the Light (it always blazes, even across the dark — Rev 21:23)
    const [hx, hy] = home;
    // a great glory of light all around the home — bright, reaching across the dark
    strokes(out, counter, {
      rng, n: 440, sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 0.92) * 142; return [hx + Math.cos(a) * d, hy + 4 + Math.sin(a) * d * 0.66]; },
      dir: () => 0.05, col: (x, y, r) => jig(ramp([GOLD_HOT, GOLD_PALE, GOLD, GOLD_DEEP, '#a8843e', '#5a4a3a'], Math.hypot(x - hx, (y - hy - 4) / 0.66) / 142), r, 8), len: 12, lw: 3.2, steps: 2, impasto: 0.5,
    });
    // ⚠ IT IS THE CITY, NOT A COTTAGE. Fred: "the house there is still not updated to the
    // castle we worked on." Right, and it matters more than a detail: what he is walking
    // toward is the Father's house — "in my Father's house are many mansions" (John 14:2),
    // the City with gates that are never shut (Rev 21:25) — and we built that as
    // `paintPalace` for `ran` and `gift`. A little red-roofed cottage on the far rim tells
    // a child the destination is somebody's bungalow. Same palace as those pages, small
    // with distance, its gate lit.
    E.paintPalace(out, counter, rng, hx, hy + 20, 0.30, { gate: true });
  }

  /* ---------------- 3. THE GREAT VALLEY — the gulf you cannot cross ----------------
     a huge plunge of deep blue, the far wall catching a breath of the home's gold
     near the rim, the depth lost in night-blue (no black). Strokes fall steeply,
     dragging the eye DOWN into it — this is the divide. */
  strokes(out, counter, {
    rng, n: 3000,
    sample: rej(-10, 232, 810, 376, inGulf),
    /* ⚠ Sep 23 — A GULF IS A FAR WALL AND A DEPTH, not a curtain. Luke 16:26: "between us and
       you there is a great gulf fixed: so that they which would pass from hence to you cannot."
       On the page this band was a wall of vertical blue strokes — reeds, a drape — and read as
       a dark stripe behind the wheat, not as a drop. Now the upper part is the FAR CLIFF: rock
       in horizontal strata, warm where the home's light falls over the rim, going down into
       shadow; below it the depth, near-black blue, where the marks do fall. (Same rng draws in
       the same order — only direction and colour changed — so nothing after this re-rolls.) */
    dir: (x, y) => {
      const v = (y - farRim(x)) / Math.max(1, nearRim(x) - farRim(x));
      return v < 0.52 ? 0.05 + Math.sin(x / 70) * 0.06 + (fbm(x / 50, y / 20, 23) - 0.5) * 0.35   // strata
                      : Math.PI / 2 + Math.sin(x / 90) * 0.18 + (fbm(x / 70, y / 70, 23) - 0.5) * 0.5;   // the plunge
    },
    col: (x, y, r) => {
      const v = (y - farRim(x)) / Math.max(1, nearRim(x) - farRim(x));   // 0 far wall → 1 near rim
      let c;
      if (v < 0.52) {                                                    // the far cliff face
        const lit = homeLight(x, y) * (1 - v / 0.52), band = fbm(x / 80, y / 5.5, 29);
        c = ramp(['#141c3e', '#23295a', '#383a6e', '#5a4e7c', '#8a6e74', '#b08a66'], Math.min(1, 0.12 + (1 - v / 0.52) * 0.42 + lit * 0.55 + (band - 0.5) * 0.3));
      } else {                                                           // the depth
        c = ramp(['#1a2246', '#131a38', '#0f152e', '#121a36'], (v - 0.52) / 0.48 + fbm(x / 60, y / 60, 31) * 0.15);
      }
      if (v > 0.5 && v < 0.62 && r() < 0.02) c = mix(c, '#5a4a86', 0.6);              // a violet shudder in the depth
      return jig(c, r, 8);
    },
    len: (x, y) => 20 * lengthOf(x, y, 41), lw: (x, y) => 2.4 * widthOf(x, y, 43), steps: 3, follow: 0.85, wild: 0.06, lenJ: 0.3, wJ: 0.3, relief: 0.3,
  });
  // the far wall's lip — a kinked seam where home's ground breaks into the gulf
  paintPath(out, counter, rng,
    Array.from({ length: 28 }, (_, i) => { const x = -10 + i * 30; return [x, farRim(x) + 6 + Math.sin(x / 21) * 2]; }),
    (x, y, r) => jig(mix('#2a2546', mix(GOLD_DEEP, '#6e5026', 0.4), homeLight(x, y) * 0.8), r, 8), { lw: 2, len: 5, density: 0.5, jitter: 0.8 });
  /* -------- 3.2 REFINEMENT (Sep 12): the gulf has a BODY — strata on the far wall, and mist
     rising out of the deep. Fred: "check the art and refine it and make it more artistic and
     detailed". A wall of blue strokes is a curtain; rock has layers, and a canyon at dusk
     breathes mist up out of its dark. Both stay inside the gulf's own blues. */
  {
    // strata: thin bands following the far rim's line, stepping down the far wall
    // (v2 still read as four power-lines across the wall: continuous, evenly spaced. Strata are
    //  BROKEN — a ledge shows for a stretch, then the rock face hides it — so each band is
    //  drawn only where a slow noise says the ledge is exposed, and the bands are uneven.)
    for (let k = 0; k < 4; k++) {
      const drop = 9 + k * 9 + (k % 2) * 4;
      let run = [];
      const flush = () => { if (run.length > 2) paintPath(out, counter, rng, run, (x, y, r) => jig(mix(mix('#4a4f86', '#232c58', k / 6), '#8a6a3a', homeLight(x, y) * 0.5 * (1 - k / 6)), r, 6), { lw: 0.9 + (k % 2) * 0.4, len: 5, density: 0.35, jitter: 1.0 }); run = []; };
      for (let i = 0; i < 60; i++) {
        const x = -10 + i * 14;
        if (fbm(x / 55 + k * 3.1, k * 1.7, 311) < 0.5) { flush(); continue; }
        run.push([x, farRim(x) + drop + Math.sin(x / 33 + k) * 1.6 + (fbm(x / 40, k, 313) - 0.5) * 3]);
      }
      flush();
    }
    // mist: three soft bands lying across the gulf, palest where the home's light reaches
    // ⚠ first cut was a fog WALL — three dense bands hid the plunge, the very thing the page is
    // about. Mist here is a few torn wisps, low, near the near rim, and the gulf stays visible.
    for (const [yf, op, n] of [[0.68, 0.07, 160], [0.86, 0.10, 240]]) {
      strokes(out, counter, {
        rng, n,
        sample: r => { const x = -10 + r() * 820; if (fbm(x / 120, yf * 10, 349) < 0.42) return null; const y = farRim(x) + (nearRim(x) - farRim(x)) * (yf + (r() - 0.5) * 0.10); return inGulf(x, y) ? [x, y] : null; },
        dir: (x, y) => 0.03 + (fbm(x / 90, y / 30, 331) - 0.5) * 0.35,
        col: (x, y, r) => jig(mix(ramp(['#4e5596', '#6a70ae', '#8a90c4'], fbm(x / 80, y / 24, 337)), '#e6cfa0', homeLight(x, y) * 0.45), r, 4),
        len: (x, y) => 18 * lengthOf(x, y, 341), lw: (x, y) => 2.6 * (0.5 + widthOf(x, y, 343) * 0.5), steps: 3, follow: 0.97, lenJ: 0.5, wJ: 0.4, impasto: 0, relief: 0, op,
      });
    }
  }

  /* -------- 3.5 THE DOVES ARE GONE (Fred: "remove the bird emoji") --------
     They were meant as Ps 55:6 — the dove flies home over the gulf the child cannot cross
     — but at that size a pale two-stroke wing IS a glyph, and a glyph in a painting reads
     as a sticker, not as a bird. The three birds I added inside the gulf on the previous
     attempt went with them. If this page ever wants a bird again it should be a runtime
     sprite that actually flies, like the flock on `ran`. -------- */

  const skyEnd = out.length;   // FAR plane: sky + far plateau + home + gulf + doves (down to the near rim)
  // the stacked SKY-SWIRL SHEETS — each an independent bold, gapped pass of the
  // turbulent eddies + bright cloud crests + curling Van Gogh arms (paint on
  // paint), own rng per sheet. Woven in just above the sky GROUND, BELOW the
  // far plateau/home/gulf, so those stay in front as the sheets parallax.
  const skySheets = SKY_SHEETS.map((e, k) => {
    const srng = mulberry32(seed + 1009 * (k + 1));
    const sh = [];
    strokes(sh, { n: 0 }, {
      rng: srng, n: e.n, sample: rej(-10, -10, 810, 250, (x, y) => y < farRim(x) + 8),
      dir: skyDir,
      col: (x, y, r) => {
        const near = nearE(x, y);
        if (near < 0.55 && r() < 0.06) return jig(r() < 0.5 ? '#e6ecfb' : '#e6c98a', r, 12);   // pale-silver sparks at the eddy knots (a touch of the home's gold)
        const k2 = fbm(x / 92, y / 92, 71) + (r() - 0.5) * 0.2;
        if (k2 > 0.76) return jig('#d4ddf4', r, 8);                                          // pale-silver twilight cloud-crests (only the crest edges catch light)
        return skyCol(x, y, r, e.lift);
      },
      len: (x, y) => e.len * lengthOf(x, y, 51 + k), lw: (x, y) => e.lw * widthOf(x, y, 57 + k),
      steps: 5, follow: 0.91, wild: 0.06, lenJ: 0.3, wJ: 0.3, impasto: 0.6, relief: 0.4,
      aJ: (x, y) => 0.1 + Math.max(0, 0.7 - nearE(x, y)) * 0.3,
    });
    return sh.join('\n');
  });

  /* ---------------- 4. NEAR WHEAT HILLS (the road's country) ---------------- */
  out.push(`<path d="M-2 ${R1(nearRim(-2))}L805 ${R1(nearRim(805))}V504H-2Z" fill="#7a5a26"/>`); counter.n++; // near hills base — MID plane
  strokes(out, counter, {
    rng, n: 2600,
    sample: rej(-10, 336, 810, 510, (x, y) => y > nearRim(x) - 6 && !onRoad(x, y)),
    dir: (x, y) => { const [vx, vy] = curlV(x, y, 37, 90); return Math.atan2(vy * 0.5 - 0.06, Math.abs(vx) + 0.8); },
    col: (x, y, r) => {
      const g = lightAt(x, y);
      if (r() < 0.05) return jig('#52487e', r, 11);                       // night-violet shadow flecks
      let c = ramp(['#6b4e1d', '#8a6526', '#a3762a', '#c98e2e', '#d9a93f'], fbm(x / 60, y / 60, 31) * 0.7 + (y - nearRim(x)) / 240);
      return jig(mix(c, '#473d52', (1 - g) * 0.22), r, 11);
    },
    len: (x, y) => 16 * lengthOf(x, y, 61), lw: (x, y) => 2.6 * widthOf(x, y, 63), steps: 3, wild: 0.1, lenJ: 0.3, wJ: 0.3, impasto: 0.72, aJ: 0.2, relief: 0.35,   // ⚠ relief was the default 1
  });
  // the near rim's lip — the brink the road stops at, dark earth
  paintPath(out, counter, rng,
    Array.from({ length: 28 }, (_, i) => { const x = -10 + i * 30; return [x, nearRim(x) - 2 + Math.sin(x / 24) * 2]; }),
    (x, y, r) => jig(mix('#33283a', '#52402e', r() * 0.5), r, 8), { lw: 2.2, len: 5, density: 0.55, jitter: 0.8 });
  // a ragged wheat FRINGE along the brink so the rim↔gulf seam reads organic (MID)
  horizonFringe(out, counter, rng, { horizonFn: nearRim, x0: -10, x1: 810, cols: ['#6b4e1d', '#8a6526', '#a3762a', '#c98e2e'], hMax: 18, lightFn: lightAt, seed: 707 });

  /* ---------------- 5. THE ROAD — climbs to the brink, and stops ---------------- */
  { // pale underpaint ribbon
    const L2 = [], R2 = [];
    for (let t = 0; t <= 1.0001; t += 0.025) {
      const p = crP(t), a = roadDir(t);
      const nx = -Math.sin(a), ny = Math.cos(a), hw = roadW(t) / 2;
      L2.push([p[0] + nx * hw, p[1] + ny * hw]); R2.push([p[0] - nx * hw, p[1] - ny * hw]);
    }
    let d = `M${R1(L2[0][0])} ${R1(L2[0][1])}`;
    for (let i = 1; i < L2.length; i++) d += `L${R1(L2[i][0])} ${R1(L2[i][1])}`;
    for (let i = R2.length - 1; i >= 0; i--) d += `L${R1(R2[i][0])} ${R1(R2[i][1])}`;
    out.push(`<path d="${d}Z" fill="#c2ab7d"/>`);
    counter.n++;
  }
  strokes(out, counter, {
    rng, n: 1000,
    sample: r => { const t = r(); const p = crP(t); const a = roadDir(t) + Math.PI / 2; const off = (r() + r() - 1) * roadW(t) * 0.46; return [p[0] + Math.cos(a) * off, p[1] + Math.sin(a) * off]; },
    dir: (x, y) => roadDir(roadInfo(x, y).t),
    col: (x, y, r) => {
      const { t, d } = roadInfo(x, y);
      const edge = d / (roadW(t) / 2 + 0.01);
      const g = lightAt(x, y);
      let c = ramp(['#e8d6a8', '#d4bd8c', '#b3a075'], edge * 0.85 + fbm(x / 45, y / 45, 41) * 0.25);
      c = mix(c, ramp([GOLD_PALE, GOLD, '#e0c478'], edge), g * 0.6);      // warms toward the brink/home
      return jig(c, r, 8);
    },
    len: (x, y) => 12 * lengthOf(x, y, 71), lw: (x, y) => 2.0 * widthOf(x, y, 73), steps: 3, lenJ: 0.3, wJ: 0.3, wild: 0.06, relief: 0.3,
  });
  // sparse dark wheat leaning over the road edges
  strokes(out, counter, {
    rng, n: 120,
    sample: r => { const t = r(); const p = crP(t); const a = roadDir(t) + Math.PI / 2; const side = r() < 0.5 ? 1 : -1; const off = roadW(t) / 2 + 1 + r() * 4; return [p[0] + Math.cos(a) * off * side, p[1] + Math.sin(a) * off * side]; },
    dir: (x, y) => roadDir(roadInfo(x, y).t) + 0.5,
    col: (x, y, r) => jig(mix('#6b4e1d', '#52401e', r()), r, 9), len: 8, lw: 2.2, steps: 2,
  });

  /* ---------------- 5.2 REFINEMENT (Sep 12): WHEAT you can name, and a road that has been used --
     The near hills were a bed of gold strokes; a child should be able to say "wheat". So:
     stalks with heads, all leaning one way (the sky's turn comes from the left), thickest at
     the brink and beside the road; two wheel-ruts down the road and stones kicked to its
     edges — a road somebody has travelled, going the way he is going. */
  {
    const LEAN_W = 0.30;
    const stalk = (bx, by, hh, lit) => {
      const a = -Math.PI / 2 + LEAN_W + (fbm(bx / 30, by / 30, 401) - 0.5) * 0.5;
      const tip = [bx + Math.cos(a) * hh, by + Math.sin(a) * hh];
      const mid = [bx + Math.cos(a - 0.12) * hh * 0.5, by + Math.sin(a - 0.12) * hh * 0.5];
      paintPath(out, counter, rng, [[bx, by], mid, tip],
        (x, y, r) => jig(mix(mix('#6b4e1d', '#a3762a', r() * 0.6), '#e2b95a', lit * 0.5), r, 7), { lw: 0.8, len: 3, density: 0.7, jitter: 0.4 });
      // the head: a few short dabs either side of the top of the stalk
      strokes(out, counter, {   // (first cut: heads too big and pale — matchsticks along the brink)
        rng, n: 3, sample: r => [tip[0] + (r() - 0.5) * 1.6, tip[1] + r() * hh * 0.18],
        dir: () => a + (rng() - 0.5) * 0.5,
        col: (x, y, r) => jig(mix(mix('#7a5a22', '#b07f2a', r()), '#e6c060', lit * 0.4), r, 6),
        len: 1.6, lw: 1.0, steps: 1, impasto: 0.2, relief: 0.3,
      });
    };
    for (let i = 0; i < 380; i++) {
      const x = -10 + rng() * 820;
      const yTop = nearRim(x) - 6, y = yTop + Math.pow(rng(), 0.95) * (504 - yTop);   // spread over the hills, not piled on the brink
      if (onRoad(x, y) || y < nearRim(x) - 8) continue;
      const depth = (y - 340) / 164;
      stalk(x, y, 6 + depth * 12 * (0.6 + rng() * 0.8), lightAt(x, y));
    }
    // ruts: two darker lines the width of a cart apart, following the road
    for (const side of [-1, 1]) {
      const pts = [];
      for (let t = 0.02; t <= 0.98; t += 0.03) { const p = crP(t); const a = roadDir(t) + Math.PI / 2; const off = side * roadW(t) * 0.26; pts.push([p[0] + Math.cos(a) * off, p[1] + Math.sin(a) * off]); }
      paintPath(out, counter, rng, pts, (x, y, r) => jig(mix('#9a8660', '#7a6a4a', r() * 0.7), r, 6), { lw: 1.1, len: 4, density: 0.55, jitter: 0.5 });
    }
    // stones kicked to the road's edges, each with a lit crown toward home
    for (let i = 0; i < 34; i++) {
      const t = 0.1 + rng() * 0.88; const p = crP(t); const a = roadDir(t) + Math.PI / 2; const side = rng() < 0.5 ? 1 : -1;
      const off = roadW(t) * (0.42 + rng() * 0.2) * side; const sx = p[0] + Math.cos(a) * off, sy = p[1] + Math.sin(a) * off;
      const sw = 0.8 + t * 2.4 * (0.5 + rng()), lit = lightAt(sx, sy);
      strokes(out, counter, {
        rng, n: 5, sample: r => { const q = r() * Math.PI * 2, d = Math.sqrt(r()); return [sx + Math.cos(q) * sw * d, sy - Math.abs(Math.sin(q)) * sw * 0.6 * d]; },
        dir: () => 0.1, col: (x, y, r) => jig(mix(mix('#4a3f36', '#7a6a58', (sy - y) / (sw * 0.6 + 0.1)), '#e0c078', lit * Math.max(0, (sy - y) / (sw * 0.6 + 0.1) - 0.4)), r, 5),
        len: 2, lw: 1.3, steps: 1, impasto: 0.2, relief: 0.4,
      });
    }
  }

  /* ---------------- 5.5 BACKGROUND LIFE — the world filled out ----------------
     the fowls of the air (Matt 6:26), trees of the field that clap their hands
     on the way home (Isa 55:12), and sheep come home from going astray
     (Isa 53:6 / Luke 15). The road home runs through a living country. */
  // a small flock of birds riding the swirl sky
  for (const [bx, by, s] of [[210, 86, 1], [244, 98, 0.85], [276, 82, 0.92], [250, 114, 0.72], [302, 96, 0.8]]) {
    paintPath(out, counter, rng, [[bx - 6 * s, by + 2.6 * s], [bx, by - 1.8 * s], [bx + 6 * s, by + 2.6 * s]],
      (x, y, r) => jig('#2a3052', r, 6), { lw: 1.5 * s, len: 3.4, density: 0.9, jitter: 0.5 });
  }
  // cypress trees on the near hills — dark green flames, dusk-gold rim
  const cypress = (cx, cby, ch, w) => {
    strokes(out, counter, {
      rng, n: Math.round(w * ch / 12),
      sample: r => { const v = Math.pow(r(), 0.85); const wr = w * Math.sin(Math.PI * Math.min(1, v * 1.15)) + 0.7; return [cx + (r() + r() - 1) * wr, cby - v * ch]; },
      dir: (x, y) => -Math.PI / 2 + Math.sin((cby - y) / 9) * 0.45 + (fbm(x / 8, y / 8, 47) - 0.5) * 0.6,
      col: (x, y, r) => jig(ramp(['#142420', '#1d3424', '#284430'], fbm(x / 10, y / 10, 53) + r() * 0.3), r, 7),
      len: 9, lw: 2.2, steps: 3, follow: 0.95, lenJ: 0.5,
    });
  };
  cypress(706, 432, 96, 13); cypress(92, 472, 66, 10);   // and the cypresses grow with them
  // low round bushes scattered on the hillsides
  const bush = (bx, by, w, h) => strokes(out, counter, {
    rng, n: Math.round(w * 1.5),
    sample: r => { const a = r() * Math.PI * 2, dd = Math.pow(r(), 0.7); return [bx + Math.cos(a) * w * dd, by - Math.abs(Math.sin(a)) * h * dd]; },
    dir: (x, y) => -Math.PI / 2 + (fbm(x / 10, y / 10, 59) - 0.5) * 1.2,
    col: (x, y, r) => jig(ramp(['#1a2c20', '#26402a', '#345036'], fbm(x / 12, y / 12, 61) + r() * 0.25), r, 8),
    len: 6, lw: 2, steps: 2, lenJ: 0.5,
  });
  bush(470, 440, 16, 12); bush(606, 460, 18, 13); bush(724, 484, 14, 10); bush(158, 494, 15, 11);
  // fruitful trees on the near hills — even on the hard road the land bears fruit
  // in crazy free colour, jewels in the dark, warming toward the home's light  [FG plane]
  // fruit-trees as TRUE-DEPTH BILLBOARDS (each its own band, anchored at its base:
  // the ground map would vertically shear an upright, a billboard scales it whole)
  let _t = out.length;
  // Sep 15, Fred (the proportion pass): "on road the trees should be bigger" — at 48–64 units beside a
  // 46-unit child they were bushes. A near fruit tree stands two to three of him.
  // ⚠ Sep 26, Fred: "why are the trees' proportion off?" — still toys. Measured by perspective: the child is 46 at
  // y 361 (125 below the far rim at 236); a fruit tree at y ~500 is twice as near, so a 4 m tree is ~300 there.
  // The two near trees are now FRAMING trees at the plate's edges (the road, gulf and home stay open between
  // them); the pomegranate went back onto the far rim, sized for that distance.
  fruitTree(out, counter, rng, 96, 504, 300, 130, ['#2a5f30','#4b8f3c','#79b74d','#b77ce0'], lightAt, 1, { species: 'olive' });  // green + violet accent, near-left — an olive (after his kind, Sep 15)
  const taRange = [_t, out.length];
  _t = out.length;
  fruitTree(out, counter, rng, 724, 508, 320, 140, ['#265a3a','#3f8a4a','#6fae52','#5ad8b8'], lightAt, 1, { species: 'fig' });  // green + teal accent, near-right — a fig
  const tbRange = [_t, out.length];
  _t = out.length;
  fruitTree(out, counter, rng, 760, 370, 108, 48, ['#2f6b34','#57993f','#86c055','#f07ab0'], lightAt, 1, { species: 'pomegranate' });  // green + pink accent, on the far rim — a pomegranate
  const tcRange = [_t, out.length];
  // sheep come home — small woolly forms grazing on the near hill
  const sheep = (sx, sy, s) => {
    strokes(out, counter, { rng, n: Math.round(22 * s), sample: r => { const a = r() * Math.PI * 2, dd = Math.pow(r(), 0.7); return [sx + Math.cos(a) * 9 * s * dd, sy + Math.sin(a) * 5 * s * dd]; }, dir: (x, y) => (fbm(x / 5, y / 5, 67) - 0.5) * 2, col: (x, y, r) => jig(mix('#a89a7e', '#c6b894', r() * 0.6), r, 7), len: 3 * s, lw: 2 * s, steps: 2 });
    paintPath(out, counter, rng, [[sx - 8 * s, sy - 1 * s], [sx - 11 * s, sy + 1.5 * s]], (x, y, r) => jig('#2a241e', r, 5), { lw: 2 * s, len: 2, density: 1 });
    for (const lx of [-5, 0, 5]) paintPath(out, counter, rng, [[sx + lx * s, sy + 3 * s], [sx + lx * s, sy + 6 * s]], (x, y, r) => jig('#2a241e', r, 4), { lw: 1.2 * s, len: 2, density: 0.9 });
  };
  sheep(540, 420, 1); sheep(612, 440, 0.9); sheep(684, 460, 0.82);

  /* ---------------- 6. EGG: the cypress at the road's first rise ---------------- */
  {
    const ft = crP(0.34), cx = ft[0] - 16, cby = ft[1] - 2, ch = 48;
    strokes(out, counter, {
      rng, n: 100,
      sample: r => { const v = Math.pow(r(), 0.85); const wRad = 6 * Math.sin(Math.PI * Math.min(1, v * 1.15)) + 0.8; return [cx + (r() + r() - 1) * wRad, cby - v * ch]; },
      dir: (x, y) => -Math.PI / 2 + Math.sin((cby - y) / 9) * 0.5 + (fbm(x / 8, y / 8, 47) - 0.5) * 0.6,
      col: (x, y, r) => jig(ramp(['#10202a', '#1a2e30', '#264034'], fbm(x / 10, y / 10, 53) + r() * 0.3), r, 7),
      len: 9, lw: 2.2, steps: 3, follow: 0.95, lenJ: 0.5,
    });
  }

  /* ---------------- 7. THE CHILD — at the brink, facing home across the gulf -----  [FG plane] */
  const _fgChild = out.length;
  {
    const cp = crP(0.985);
    const cx2 = cp[0], cy2 = cp[1] - 1;
    // articulated child at the brink, one hand reaching OUT toward distant home,
    // the other low at its side — longing, leaning toward the far valley edge
    // the little pilgrim at the brink, one arm reaching OUT toward the far home —
    // longing across the gulf, face lifted to the warm windows
    E.paintMask(out, counter, rng, {
      x: cx2 + 1, y: cy2 + 1, h: 33, facing: 1,
      lean: 2, armR: [cx2 + 14, cy2 - 16],
      eye: [1, -0.4], mood: 'wonder',
    });
  }
  fgRanges.push([_fgChild, out.length]);   // ← the child at the brink is foreground

  /* ---------------- 8. EGG: alpha & omega stones at the brink ---------------- */
  // where the road began (far back, left) a stone scratched α; where it ends at
  // the brink, Ω — the same Light is the beginning and the end (Rev 22:13), and
  // the way across the end is the next page.
  {
    const aP = crP(0.04), oP = crP(0.96);
    const pebCol = (x, y, r) => jig(mix('#6b6050', '#8a7a64', r()), r, 6);
    const markCol = (x, y, r) => jig(mix('#332e24', '#453e30', r()), r, 5);
    paintPath(out, counter, rng, [[aP[0] - 11, aP[1] + 7], [aP[0] - 4, aP[1] + 4], [aP[0] - 1, aP[1] + 8], [aP[0] - 8, aP[1] + 10], [aP[0] - 11, aP[1] + 7]], pebCol, { lw: 2.8, len: 3, density: 0.9, jitter: 0.6 });
    paintPath(out, counter, rng, [[aP[0] - 8.5, aP[1] + 5.5], [aP[0] - 5.6, aP[1] + 8.6], [aP[0] - 3.6, aP[1] + 5.6], [aP[0] - 6, aP[1] + 5.4], [aP[0] - 7.6, aP[1] + 8.4]], markCol, { lw: 1, len: 2, density: 0.85, jitter: 0.3 });
    paintPath(out, counter, rng, [[oP[0] + 4, oP[1] + 7], [oP[0] + 9, oP[1] + 5], [oP[0] + 12, oP[1] + 8], [oP[0] + 7, oP[1] + 10], [oP[0] + 4, oP[1] + 7]], pebCol, { lw: 2.6, len: 3, density: 0.9, jitter: 0.6 });
    paintPath(out, counter, rng, [[oP[0] + 5.6, oP[1] + 9], [oP[0] + 5.6, oP[1] + 7.2], [oP[0] + 7, oP[1] + 5.4], [oP[0] + 9.4, oP[1] + 7.2], [oP[0] + 9.4, oP[1] + 9]], markCol, { lw: 1, len: 2, density: 0.85, jitter: 0.3 });
  }

  // MULTIPLANE: assemble the requested depth plane. Each is its own cel —
  // transparent where it has no content — so they stack and parallax apart.
  const ALT = 'Wheat hills at dusk under a rising spiral sky; a road climbs from the far country, over a rise and through a hollow, and ends at the near rim of a huge valley — a great gulf plunging into deep blue. A small child in red stands at the brink, reaching toward a warm gold home that glows on the far rim, across the gulf, too far to reach on foot. The road home has run out; only a bridge from the other side can cross.';
  const RAW = { undercoat: 0, weave: 0, varnish: 0, oil: 0 };   // no baked surface — the live filter unifies the planes
  const setOf = ranges => { const s = new Set(); for (const [a, b] of ranges) for (let i = a; i < b; i++) s.add(i); return s; };
  const pick = ranges => ranges.map(([a, b]) => out.slice(a, b).join('\n')).join('\n');
  const fgSet = setOf(fgRanges);
  if (LAYER === 'sky') return svgWrap(ALT, out.slice(0, skyEnd).join('\n'), RAW);   // smooth sky ground + plateau + home + gulf (opaque)
  const sm = LAYER.match(/^sky(\d+)$/);
  if (sm) return svgWrap(ALT, '<g>' + skySheets[+sm[1] - 1] + '</g>', RAW);         // one sky-swirl sheet
  if (LAYER === 'fg') return svgWrap(ALT, pick(fgRanges), RAW);                     // the child at the brink
  if (LAYER === 'ta') return svgWrap(ALT, pick([taRange]), RAW);                    // tree billboards
  if (LAYER === 'tb') return svgWrap(ALT, pick([tbRange]), RAW);
  if (LAYER === 'tc') return svgWrap(ALT, pick([tcRange]), RAW);
  if (LAYER === 'mid') {                                                            // near hills, road, brink fringe (the ground plane)
    const cut = setOf([...fgRanges, taRange, tbRange, tcRange]);
    const body = out.filter((_, i) => i >= skyEnd && !cut.has(i)).join('\n');
    return svgWrap(ALT, body, RAW);
  }
  // full painting (desktop): sky ground, the stacked sky-sheets (above the ground,
  // below the plateau/home/gulf), then everything else
  return svgWrap(ALT, out.slice(0, skyGroundEnd).concat(skySheets, out.slice(skyGroundEnd)).join('\n'));
}
