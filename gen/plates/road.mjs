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
export const SKY_SHEETS = [
  { n: 405, len: 42, lw: 6.5, lift: 0.00 },
  { n: 440, len: 37, lw: 6.0, lift: 0.07 },
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
    paintFigure, paintPath, underpaintCapsules, paintChild, castShadow, personCaps, inCap, lightRadial,
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
  const EDDIES = [[140, 78, -60], [360, 60, 58], [640, 96, -52], [470, 168, 46]];
  const nearE = (x, y) => { let m = 1e9; for (const [ex, ey] of EDDIES) m = Math.min(m, Math.hypot(x - ex, y - ey) / 80); return m; };
  const skyDir = (x, y) => {
    let vx = 0, vy = 0;
    { const [a, b] = goldenSpiralV(x, y, 548, 150, 115, 260); vx += a; vy += b; }   // MACRO — the great wheel, centred on the home
    for (const [ex, ey, s] of EDDIES) { const [a, b] = goldenSpiralV(x, y, ex, ey, s, 80); vx += a; vy += b; }   // MID — eddies turning inside it
    const [cx2, cy2] = curlV(x, y, 31, 120); vx += cx2 * 26; vy += cy2 * 26;        // MICRO — fine turbulence in every stroke
    vy -= 12; vx += 5;                                                              // a gentle rising drift (the arising)
    return Math.atan2(vy, vx);
  };
  const EGLOW = [[140, 78, '#3f549e'], [360, 60, '#41337e'], [640, 96, '#2f5a92'], [470, 168, '#4a3f92']];
  const skyCol = (x, y, r, lift) => {
    const near = nearE(x, y);
    const g = lightAt(x, y);
    if (g > 0.16 && g < 0.3 && r() < 0.03) return jig('#d96f2e', r, 18);            // a breath of the home's warmth
    if (near < 0.7 && r() < 0.05) return jig(mix(GOLD_DEEP, '#9a8a5a', r()), r, 12); // a faint warm knot at an eddy core
    let c = ramp(NIGHT, Math.max(0, Math.min(1, 0.6 + fbm(x / 85, y / 85, 13) * 0.3)));
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
    rng, n: 610, sample: rej(-10, -10, 810, 250, (x, y) => y < farRim(x) + 8), dir: skyDir,
    col: (x, y, r) => skyCol(x, y, r, 0),
    len: 44, lw: 10, steps: 4, follow: 0.91, wild: 0.05, lenJ: 0.5, impasto: 0.5, relief: 0.6,
  });
  const skyGroundEnd = out.length;   // the smooth sky ground (the SKY plane); plateau/home/gulf follow and stay IN FRONT of the sheets

  /* ---------------- 2. THE FAR PLATEAU + HOME (across the gulf) ---------------- */
  strokes(out, counter, {
    rng, n: 460, sample: rej(-10, 220, 810, 320, (x, y) => y > farRim(x) - 4 && y < farRim(x) + 30),
    dir: x => { const e = 7; return Math.atan2(farRim(x + e) - farRim(x - e), 2 * e); },
    col: (x, y, r) => jig(ramp(['#2c2c4e', '#41384e', '#5c4a36', '#85692f', '#a8863e'], Math.min(1, homeLight(x, y) * 1.5 + fbm(x / 70, y / 70, 19) * 0.25)), r, 7),
    len: 26, lw: 4.4, steps: 3, wild: 0.07, lenJ: 0.5, impasto: 0.66,
  });
  { // the Father's house — a RADIANT BEACON of light across the gulf, the home
    //  of the Light (it always blazes, even across the dark — Rev 21:23)
    const [hx, hy] = home;
    // a great glory of light all around the home — bright, reaching across the dark
    strokes(out, counter, {
      rng, n: 440, sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 0.92) * 142; return [hx + Math.cos(a) * d, hy + 4 + Math.sin(a) * d * 0.66]; },
      dir: () => 0.05, col: (x, y, r) => jig(ramp([GOLD_HOT, GOLD_PALE, GOLD, GOLD_DEEP, '#a8843e', '#5a4a3a'], Math.hypot(x - hx, (y - hy - 4) / 0.66) / 142), r, 8), len: 12, lw: 3.2, steps: 2, impasto: 0.5,
    });
    // a clearly DRAWN little house — gold walls, a distinct roof, bright windows,
    //  a glowing door (so it reads as a HOUSE, not a soft blur)
    const hw3 = 24, bTop = hy - 3, bBot = hy + 16, peak = hy - 24;
    out.push(`<path d="M${hx - hw3} ${R1(bBot)}L${hx - hw3} ${R1(bTop)}L${hx + hw3} ${R1(bTop)}L${hx + hw3} ${R1(bBot)}Z" fill="#f0d894"/>`); counter.n++;
    out.push(`<path d="M${hx - hw3 - 4} ${R1(bTop + 1)}L${hx} ${R1(peak)}L${hx + hw3 + 4} ${R1(bTop + 1)}Z" fill="#c87a44"/>`); counter.n++;
    strokes(out, counter, { rng, n: 56, sample: rej(hx - hw3 + 1, bTop + 1, hx + hw3 - 1, bBot - 1), dir: () => 0, col: (x, y, r) => jig(ramp([GOLD_PALE, GOLD, '#e0c068'], fbm(x / 10, y / 10, 23) * 0.5 + 0.2), r, 6), len: 5, lw: 2, steps: 2, impasto: 0.3 });
    paintPath(out, counter, rng, [[hx - hw3 - 4, bTop + 1], [hx, peak], [hx + hw3 + 4, bTop + 1]], (x, y, r) => jig(mix('#a85e30', '#d89456', r() * 0.5), r, 8), { lw: 2, len: 4, density: 0.6, jitter: 0.6 });
    out.push(`<rect x="${R1(hx - 16)}" y="${R1(bTop + 4)}" width="8" height="10" rx="1.4" fill="#fffaf0"/>`);
    out.push(`<rect x="${R1(hx + 8)}" y="${R1(bTop + 4)}" width="8" height="10" rx="1.4" fill="#fffaf0"/>`);
    out.push(`<rect x="${R1(hx - 4)}" y="${R1(bBot - 11)}" width="8" height="11" rx="1.2" fill="#fff2c8"/>`); // a glowing door
    counter.n += 3;
  }

  /* ---------------- 3. THE GREAT VALLEY — the gulf you cannot cross ----------------
     a huge plunge of deep blue, the far wall catching a breath of the home's gold
     near the rim, the depth lost in night-blue (no black). Strokes fall steeply,
     dragging the eye DOWN into it — this is the divide. */
  strokes(out, counter, {
    rng, n: 1500,
    sample: rej(-10, 232, 810, 376, inGulf),
    dir: (x, y) => Math.PI / 2 + Math.sin(x / 90) * 0.18 + (fbm(x / 70, y / 70, 23) - 0.5) * 0.5,
    col: (x, y, r) => {
      const v = (y - farRim(x)) / Math.max(1, nearRim(x) - farRim(x));   // 0 far wall → 1 near rim
      const mid = Math.abs(v - 0.5);                                     // darkest in the deep middle
      let c = ramp(['#3a3f70', '#283561', '#1b2750', '#141d40', '#10182f'], (0.5 - mid) * 1.6 + fbm(x / 60, y / 60, 29) * 0.2);
      if (v < 0.28) c = mix(c, '#6e5536', homeLight(x, y) * 0.55 * (1 - v / 0.28));   // far wall lit by home
      if (v > 0.5 && v < 0.62 && r() < 0.02) c = mix(c, '#5a4a86', 0.6);              // a violet shudder in the depth
      return jig(c, r, 8);
    },
    len: 22, lw: 4, steps: 3, follow: 0.85, wild: 0.1, lenJ: 0.5,
  });
  // the far wall's lip — a kinked seam where home's ground breaks into the gulf
  paintPath(out, counter, rng,
    Array.from({ length: 28 }, (_, i) => { const x = -10 + i * 30; return [x, farRim(x) + 6 + Math.sin(x / 21) * 2]; }),
    (x, y, r) => jig(mix('#2a2546', mix(GOLD_DEEP, '#6e5026', 0.4), homeLight(x, y) * 0.8), r, 8), { lw: 2, len: 5, density: 0.5, jitter: 0.8 });
  /* -------- 3.5 HOMING DOVES — they cross the gulf the child cannot --------
     a loose rising line of pale wings over the deep, arrowing for the far
     house: the road runs out, but the dove flies home (Luke 15:18; Ps 55:6
     "Oh that I had wings like a dove! for then would I fly away, and be at
     rest"). Pale against the gulf's night-blue; curved wingbeats (living =
     curved). They ride the opaque SKY plane with the gulf + home, so they
     parallax as part of the far world.  [SKY plane] */
  {
    const drng = mulberry32(seed + 55006);   // own rng: downstream texture untouched
    const doves = [
      [340, 306, 1.20, 1.00],   // nearest, biggest, full upbeat
      [394, 293, 1.05, 0.72],   // mid-beat glide
      [452, 287, 0.92, 1.05],
      [504, 273, 0.82, 0.88],   // farthest, almost at the far wall's light
    ];
    for (const [dx, dy, s, k] of doves) {
      const a = Math.atan2(home[1] - 6 - dy, home[0] - dx);     // heading for the house
      const ca = Math.cos(a), sa = Math.sin(a);
      const P = (u, v) => [dx + u * ca - v * sa, dy + u * sa + v * ca];
      const wing = (sd, col, lw) => paintPath(out, counter, drng,
        [P(0.5 * s, sd * 1.4 * s), P(-1.4 * s, sd * 5.8 * s * k), P(-5.4 * s, sd * 10.5 * s * k)],
        col, { lw, len: 3, density: 0.95, jitter: 0.45 });
      // upper wing pale-bright, lower a breath greyer (form) — both curved
      wing(-1, (x, y, r) => jig(mix('#e9e4d2', '#f8f2de', lightAt(x, y) * 0.8 + r() * 0.2), r, 7), 2.1 * s);
      wing(1, (x, y, r) => jig(mix('#a9a8bc', '#d8d4d2', r() * 0.5), r, 6), 1.8 * s);
      // the little body arrowing home — one warm gold accent on the breast
      paintPath(out, counter, drng, [P(-2.6 * s, 0), P(1.4 * s, 0), P(3.6 * s, 0.3 * s)],
        (x, y, r) => jig(mix('#efe9d4', GOLD_PALE, 0.25 + lightAt(x, y) * 0.6), r, 6),
        { lw: 2.0 * s, len: 2.6, density: 1, jitter: 0.3 });
    }
  }
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
      len: e.len, lw: e.lw, steps: 5, follow: 0.91, wild: 0.08, lenJ: 0.55, impasto: 0.6, relief: 0.5,
      aJ: (x, y) => 0.1 + Math.max(0, 0.7 - nearE(x, y)) * 0.3,
    });
    return sh.join('\n');
  });

  /* ---------------- 4. NEAR WHEAT HILLS (the road's country) ---------------- */
  out.push(`<path d="M-2 ${R1(nearRim(-2))}L805 ${R1(nearRim(805))}V504H-2Z" fill="#7a5a26"/>`); counter.n++; // near hills base — MID plane
  strokes(out, counter, {
    rng, n: 1180,
    sample: rej(-10, 336, 810, 510, (x, y) => y > nearRim(x) - 6 && !onRoad(x, y)),
    dir: (x, y) => { const [vx, vy] = curlV(x, y, 37, 90); return Math.atan2(vy * 0.5 - 0.06, Math.abs(vx) + 0.8); },
    col: (x, y, r) => {
      const g = lightAt(x, y);
      if (r() < 0.05) return jig('#52487e', r, 11);                       // night-violet shadow flecks
      let c = ramp(['#6b4e1d', '#8a6526', '#a3762a', '#c98e2e', '#d9a93f'], fbm(x / 60, y / 60, 31) * 0.7 + (y - nearRim(x)) / 240);
      return jig(mix(c, '#473d52', (1 - g) * 0.22), r, 11);
    },
    len: 20, lw: 4.2, steps: 3, wild: 0.16, lenJ: 0.55, impasto: 0.72, aJ: 0.2,
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
    rng, n: 540,
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
    len: 14, lw: 3, steps: 3, lenJ: 0.5, wild: 0.1,
  });
  // sparse dark wheat leaning over the road edges
  strokes(out, counter, {
    rng, n: 120,
    sample: r => { const t = r(); const p = crP(t); const a = roadDir(t) + Math.PI / 2; const side = r() < 0.5 ? 1 : -1; const off = roadW(t) / 2 + 1 + r() * 4; return [p[0] + Math.cos(a) * off * side, p[1] + Math.sin(a) * off * side]; },
    dir: (x, y) => roadDir(roadInfo(x, y).t) + 0.5,
    col: (x, y, r) => jig(mix('#6b4e1d', '#52401e', r()), r, 9), len: 8, lw: 2.2, steps: 2,
  });

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
  cypress(706, 432, 60, 9); cypress(92, 472, 40, 6.5);
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
  fruitTree(out, counter, rng, 104, 492, 60, 27, LEAF_PALETTES[0], lightAt);  // violet, near-left
  const taRange = [_t, out.length];
  _t = out.length;
  fruitTree(out, counter, rng, 700, 498, 64, 29, LEAF_PALETTES[2], lightAt);  // teal, near-right
  const tbRange = [_t, out.length];
  _t = out.length;
  fruitTree(out, counter, rng, 556, 466, 48, 23, LEAF_PALETTES[1], lightAt);  // pink, mid
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
    const caps = personCaps(cx2 + 1, cy2 - 32, 33, {
      lean: 1, headTilt: 1,
      rightHand: [cx2 + 13, cy2 - 17],   // reaching forward toward home across the gulf
      leftHand: [cx2 - 5, cy2 - 7],      // other hand low at the side
      leftFoot: [cx2 - 5, cy2 + 1],
      rightFoot: [cx2 + 5, cy2 + 1],
    });
    // THE MAIN CHARACTER — "you": consistent deep-red clothes + dark outline so the
    // reader can follow the same child across the whole book.
    castShadow(out, counter, caps, { dir: 0.3 });
    paintChild(out, counter, rng, caps, { outlineW: 4 });
    // the home's gold catching the child's reaching flank
    strokes(out, counter, {
      rng, n: 13,
      sample: rej(cx2 - 1, cy2 - 30, cx2 + 10, cy2 - 4, (x, y) => caps.some(c => inCap(x, y, c)) && !caps.some(c => inCap(x + 3, y - 2, c))),
      dir: () => -0.5, col: (x, y, r) => jig(GOLD_DEEP, r, 10), len: 3.5, lw: 1.4, steps: 2,
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
