// gen/plates/ran.mjs — "He ran"
// A churning gold wheat field under a turbulent blue-green sky; a pale road
// cuts a diagonal; a small figure has taken three steps in, while from the
// far house the father, already past halfway, runs with dust flying.

export const name = 'ran';
export const title = 'He ran';
export const caption = 'You walk toward Him. He runs.';
export const seed = 15203121;
export const focal = { x: 290, y: 400 }; // portrait window: the running father (315) with the child (156) in frame
// MOBILE 3D — a DEEP DIORAMA, drawn WITH INTENTION for layers. The whole stage
// is split into planes that parallax at distinct rates (composite-once → cheap):
// the SKY is a smooth ground + stacked swirl-sheets (PAINT ON PAINT, like the
// covers); the distant hills + house sit far; the BIRDS drift in their own air;
// the planted field + trees + sheep ride one ground plane (trees stay PLANTED so
// they don't float); the running Father leads; the near child leads most. Custom
// names → a clean monotonic depth ramp (avoids the fixed sky/far/mid/near/fg ladder).
export const SKY_SHEETS = [
  { n: 320, len: 30, lw: 5.4, lift: 0.00 },
  { n: 340, len: 26, lw: 4.8, lift: 0.06 },
];
export const layers = [
  { name: 'sky', opaque: true },  // smooth sky ground (backmost, opaque)
  ...SKY_SHEETS.map((_, i) => ({ name: 'sky' + (i + 1) })),   // stacked sky-swirl sheets
  { name: 'hills' },              // distant hills, far cypress, the far house
  { name: 'birds' },              // the birds, drifting in their own air
  { name: 'land' },               // the wheat field, road, fruit-trees, sheep, fringe, wildflowers (planted)
  { name: 'dad' },                // the running Father
  { name: 'kid' },                // the near child (closest, leads most)
];

export function paint(E, opts = {}) {
  const {
    mulberry32, fbm, curlV, goldenSpiralV, mix, ramp, jig, strokes, rej,
    paintFigure, radiantHalo, paintLight, paintPath, inCap, underpaintCapsules, paintChild, castShadow, personCaps, svgWrap, R1, W, H,
    GOLD, GOLD_PALE, GOLD_DEEP, GOLD_HOT, klimtGold, goldSparks,
    fruitTree, jewelBush, LEAF_PALETTES, horizonFringe, ridge, distantHills,
  } = E;

  const rng = mulberry32(seed);
  const out = [];
  const counter = { n: 0 };
  // MOBILE 3D LAYERS: everything draws once, in order; we record which out[]
  // index ranges belong to each depth band (far / near / fg). Whatever is not
  // tagged falls to the MID plane (the field). The build emits one cel per band.
  const LAYER = opts.layer || 'full';
  const farRanges = [], nearRanges = [], fgRanges = [], birdRanges = [];
  // POST-RESURRECTION: the new creation is VIBRANT and joyful — a happy sky of
  // light blue, lilac and pink. The FATHER is the Light (He runs radiant, not a
  // dark form); only YOU (the child) are a small dark figure in the bright day.
  out.push(`<rect width="${W}" height="${H}" fill="#6ecaf7"/>`);

  const horizon = 214;   // a bit lower → more sky framing the home, the home reads clearly
  // a JOY sky — vibrant: saturated yellow + pink in swirling patches, white & sky-blue between
  const SKY = ['#7ec4ee', '#fbdf72', '#f586b6', '#fdeef2', '#f3a276'];
  // a FLOURISHING field — the new creation: the desert blossoms (Isa 35:1),
  // deep green and fresh, gold only at the lit crowns
  const WHEAT = ['#3a7a38', '#5e9a40', '#88b84a', '#bcc850', '#e6d266'];
  const SHADOW = '#2c6a48';

  // sky: THE ALIVE JEWEL-SWIRL (looking/garden's hand) — motion at THREE scales.
  // ONE great wheel turns the whole daytime heaven around the Father's home at the
  // right (macro); a few eddies turn inside it (mid); and every stroke curves with
  // its parent current (micro). Swirls within swirls — the bright day is deep
  // moving water, wheeling the way the Father runs.
  const WHEEL = [648, 128, 115, 260];   // great wheel: centre over the home/Father-burst
  const EDDIES = [[180, 70, -60], [430, 102, 58], [560, 56, -52], [92, 132, 48]];   // 4 mid eddies, alternating sign
  const eddyF = 80;
  const nearSK = (x, y) => { let m = 1e9; for (const [ex, ey] of EDDIES) m = Math.min(m, Math.hypot(x - ex, y - ey) / eddyF); return m; };
  const skyDir = (x, y) => {
    let vx = 0, vy = 0;
    // 1 · MACRO — the ONE great wheel organising the whole sky (over the home)
    { const [a, b] = goldenSpiralV(x, y, WHEEL[0], WHEEL[1], WHEEL[2], WHEEL[3]); vx += a; vy += b; }
    // 2 · MID — eddies turning inside the wheel
    for (const [ex, ey, s] of EDDIES) { const [a, b] = goldenSpiralV(x, y, ex, ey, s, eddyF); vx += a; vy += b; }
    // 3 · MICRO — fine turbulence so every stroke curves with its parent current
    const [c, d] = curlV(x, y, 31, 120); vx += c * 26; vy += d * 26;
    return Math.atan2(vy, vx);
  };
  // jewel eddy-glow — the eddy cores breathe faint DAY-sky jewel colour
  // (teal / rose / gold / sky), subtle so the bright day stays bright
  const EGLOW = [[180, 70, '#5bbccb'], [430, 102, '#f5a8c6'], [560, 56, '#f7d47c'], [92, 132, '#8fd2f0']];
  const skyCol = (x, y, r, lift) => {
    // a VIBRANT light-blue sky, warm gold+pink low at the horizon, white at the crown
    const t = Math.max(0, Math.min(1, (horizon - y) / horizon * 1.05 + fbm(x / 120, y / 120, 133) * 0.3 - 0.04));
    let c = ramp(['#fbd24e', '#f8a4c2', '#54c6f7', '#74cef8', '#a6e2fb', '#f0fbff'], t);
    for (const [ex, ey, ec] of EGLOW) { const d2 = Math.hypot(x - ex, y - ey); c = mix(c, ec, Math.exp(-d2 / 95) * 0.42); }
    if (lift) c = mix(c, '#ffffff', lift);
    return jig(c, r, 6);
  };
  // the smooth sky GROUND — broad soft masses (opaque base); the swirling
  // brushwork lives in the stacked sheets above, so their gaps reveal paint
  strokes(out, counter, {
    rng, n: 460, sample: rej(-10, -10, 810, horizon + 6),
    dir: skyDir, col: (x, y, r) => skyCol(x, y, r, 0),
    len: 44, lw: 9.5, steps: 4, follow: 0.91, wild: 0.05, lenJ: 0.5, impasto: 0.5, relief: 0.55,
  });
  const skyEnd = out.length;   // the smooth sky ground is the SKY plane (opaque)
  // the stacked SKY-SWIRL SHEETS — each an independent bold, gapped pass of the
  // turbulent eddies + bright cloud ribbons (paint on paint), own rng per sheet.
  const skySheets = SKY_SHEETS.map((e, k) => {
    const srng = mulberry32(seed + 1009 * (k + 1));
    const sh = [];
    strokes(sh, { n: 0 }, {
      rng: srng, n: e.n, sample: rej(-10, -10, 810, horizon + 6),
      dir: skyDir,
      col: (x, y, r) => {
        const near = nearSK(x, y);
        if (near < 1.1 && r() < 0.06) return jig(r() < 0.5 ? '#fffdf6' : '#f79ac6', r, 12);   // joy sparks at the knots
        const k2 = fbm(x / 88, y / 88, 139) + (r() - 0.5) * 0.2;
        if (k2 > 0.78) return jig('#fffdf6', r, 8);   // bright cloud-ribbon crests
        return skyCol(x, y, r, e.lift);
      },
      len: e.len, lw: e.lw, steps: 5, follow: 0.9, wild: 0.2, lenJ: 0.55, impasto: 0.62, relief: 0.5,
      aJ: (x, y) => 0.16 + Math.max(0, 1.3 - nearSK(x, y)) * 0.42,
    });
    return sh.join('\n');
  });

  // road: pale diagonal, far (655,210) -> near (110,500)
  const far = [652, 226], near = [104, 504];
  const roadP = t => [far[0] + (near[0] - far[0]) * t + Math.sin(t * 5.5) * 9 * t, far[1] + (near[1] - far[1]) * t];
  const roadW = t => 7 + 78 * t * t + 12 * t;
  const roadInfo = (x, y) => { // returns {t,d} for nearest road point
    let bt = 0, bd = 1e9;
    for (let t = 0; t <= 1.001; t += 0.04) { const p = roadP(t); const d = Math.hypot(x - p[0], y - p[1]); if (d < bd) { bd = d; bt = t; } }
    return { t: bt, d: bd };
  };
  const onRoad = (x, y) => { const { t, d } = roadInfo(x, y); return d < roadW(t) / 2; };

  // the field's top is a ROLLING CONTOUR, never a straight line: a gentle hill
  // edge that the sky shows above. (The far plane's distant hills sit behind it,
  // so the horizon is two overlapping undulating lines that shift as you pan.)
  const fieldTop = ridge(horizon, { amp: 22, freq: 150, bumps: 0.35, seed: 131 });
  // underpaint: solid GREEN field with the rolling top — gaps read lush, not bare
  {
    let d = `M-2 ${R1(fieldTop(-2))}`;
    for (let x = -2; x <= 802; x += 9) d += `L${R1(x)} ${R1(fieldTop(x))}`;
    d += `L802 ${H + 2}L-2 ${H + 2}Z`;
    out.push(`<path d="${d}" fill="#477e38"/>`); counter.n++;
  }
  // underpaint: the pale road
  {
    let L2 = [], R2 = [];
    for (let t = 0; t <= 1.001; t += 0.1) {
      const p = roadP(t), q = roadP(Math.min(1, t + 0.04));
      let nx = -(q[1] - p[1]), ny = q[0] - p[0];
      const nl = Math.hypot(nx, ny) || 1; nx /= nl; ny /= nl;
      const hw = roadW(t) / 2;
      L2.push([p[0] + nx * hw, p[1] + ny * hw]); R2.push([p[0] - nx * hw, p[1] - ny * hw]);
    }
    let d = `M${R1(L2[0][0])} ${R1(L2[0][1])}`;
    for (let i = 1; i < L2.length; i++) d += `L${R1(L2[i][0])} ${R1(L2[i][1])}`;
    for (let i = R2.length - 1; i >= 0; i--) d += `L${R1(R2[i][0])} ${R1(R2[i][1])}`;
    out.push(`<path d="${d}Z" fill="#d4bd8c"/>`);
    counter.n++;
  }

  // wheat: churning gold, waves mostly horizontal, dense texture
  strokes(out, counter, {
    rng, n: 2150,
    sample: rej(-10, horizon - 26, 810, 510, (x, y) => y > fieldTop(x) - 1 && !onRoad(x, y)),
    dir: (x, y) => { const [vx, vy] = curlV(x, y, 171, 70); return Math.atan2(vy * 0.9 - 0.18, Math.abs(vx) + 0.7); },
    col: (x, y, r) => {
      if (r() < 0.1) return jig(SHADOW, r, 12); // blue-violet shadow flecks
      const depth = (y - horizon) / (H - horizon);
      return jig(ramp(WHEAT, 0.15 + fbm(x / 60, y / 60, 177) * 0.85 + depth * 0.4), r, 13);
    },
    len: 18, lw: 3.8, steps: 3,
    lenJ: 0.55, wild: 0.18, impasto: 0.8,
  });
  // perspective: shorter strokes near horizon (overlay band)
  strokes(out, counter, {
    rng, n: 500,
    sample: rej(-10, horizon - 26, 810, horizon + 60, (x, y) => y > fieldTop(x) - 1 && !onRoad(x, y)),
    dir: () => 0,
    col: (x, y, r) => jig(ramp(WHEAT, 0.3 + fbm(x / 40, y / 40, 179) * 0.5), r, 10),
    len: 8, lw: 2, steps: 2,
  });
  // FLOURISHING — wildflowers of every colour open across the field (Isa 35:1,
  // "the desert shall rejoice, and blossom as the rose")
  strokes(out, counter, {
    rng, n: 420,
    sample: rej(-6, horizon + 10, 812, 508, (x, y) => !onRoad(x, y)),
    dir: () => -Math.PI / 2,
    col: (x, y, r) => { const k = r(); return jig(k < 0.22 ? '#ee5c84' : k < 0.44 ? '#a47ce0' : k < 0.64 ? '#f6c63e' : k < 0.82 ? '#fafafa' : '#f29ad0', r, 13); },
    len: (x, y) => 3 + (y - horizon) / (510 - horizon) * 4, lw: (x, y) => 2.2 + (y - horizon) / (510 - horizon) * 1.8, steps: 1, lenJ: 0.5, impasto: 0.3,
  });

  // road strokes: along the road direction
  strokes(out, counter, {
    rng, n: 560,
    sample: rej(60, horizon, 720, 510, onRoad),
    dir: (x, y) => { const { t } = roadInfo(x, y); const a = roadP(Math.max(0, t - 0.03)), b = roadP(Math.min(1, t + 0.03)); return Math.atan2(b[1] - a[1], b[0] - a[0]); },
    col: (x, y, r) => { const { t, d } = roadInfo(x, y); return jig(ramp(['#f2e3bd', '#e2cfa0', '#c9b282'], d / (roadW(t) / 2) * 0.7 + fbm(x / 50, y / 50, 191) * 0.4), r, 9); },
    len: 18, lw: 3.4, steps: 3,
  });
  // dark wheat strokes lining the road edges, leaning over it
  strokes(out, counter, {
    rng, n: 260,
    sample: r => { const t = r(); const p = roadP(t); const q = roadP(Math.min(1, t + 0.04)); let nx = -(q[1] - p[1]), ny = q[0] - p[0]; const nl = Math.hypot(nx, ny) || 1; nx /= nl; ny /= nl; const side = r() < 0.5 ? 1 : -1; const off = roadW(t) / 2 + r() * 6 - 2; return [p[0] + nx * off * side, p[1] + ny * off * side]; },
    dir: (x, y) => { const { t } = roadInfo(x, y); const a = roadP(Math.max(0, t - 0.03)), b = roadP(Math.min(1, t + 0.03)); return Math.atan2(b[1] - a[1], b[0] - a[0]) + 0.5; },
    col: (x, y, r) => jig(mix('#8a6526', '#6b4e1d', r()), r, 10),
    len: 10, lw: 2.6, steps: 2,
  });

  // egg: a few wheat stalks beside the road bending into the shape of a tiny crown
  {
    const kx = 472, ky = 362;
    const kCol = (x, y, r) => jig(mix('#6b4e1d', '#8a6526', r() * 0.7), r, 8);
    // two short stalks bending in to hold it up
    paintPath(out, counter, rng, [[kx - 9, ky + 22], [kx - 6, ky + 13], [kx - 5, ky + 7]], kCol, { lw: 1.4, len: 3.5, density: 0.45 });
    paintPath(out, counter, rng, [[kx + 9, ky + 23], [kx + 6, ky + 14], [kx + 5, ky + 7]], kCol, { lw: 1.4, len: 3.5, density: 0.45 });
    // the crown itself: a base band and three peaks, one bent zigzag of wheat
    paintPath(out, counter, rng, [[kx - 11, ky + 6], [kx + 11, ky + 6]], kCol, { lw: 2, len: 3.5, density: 0.8, jitter: 0.6 });
    paintPath(out, counter, rng,
      [[kx - 11, ky + 5], [kx - 7.5, ky - 6], [kx - 4, ky + 3], [kx, ky - 8], [kx + 4, ky + 3], [kx + 7.5, ky - 6], [kx + 11, ky + 5]],
      kCol, { lw: 1.7, len: 3, density: 0.8, jitter: 0.5 });
    // grain heads at the three tips
    for (const [tx2, ty2] of [[-7.5, -7], [0, -9], [7.5, -7]]) {
      paintPath(out, counter, rng, [[kx + tx2 - 2, ky + ty2], [kx + tx2 + 2, ky + ty2 - 1.5]], kCol, { lw: 2.2, len: 2.5, density: 0.9, jitter: 0.4 });
    }
  }

  // the far house — FILLED WITH LIGHT, all good things, like the Father (Rev 21:23:
  // "the city had no need of the sun... for the glory of God did lighten it")  [FAR plane]
  const _farHouse = out.length;
  const hs = { x: 672, y: 214 };   // sits on the (now lower) horizon, bigger + clearer
  // a great glory of light all around the home first
  strokes(out, counter, {
    rng, n: 300,
    sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 0.9) * 104; return [hs.x + Math.cos(a) * d, hs.y - 20 + Math.sin(a) * d * 0.85]; },
    dir: (x, y) => Math.atan2(y - (hs.y - 20), x - hs.x),
    col: (x, y, r) => jig(ramp([GOLD_HOT, GOLD_PALE, GOLD, GOLD_DEEP, '#caa44e'], Math.hypot(x - hs.x, (y - hs.y + 20) / 0.85) / 104), r, 8),
    len: 10, lw: 2.1, steps: 2, impasto: 0.4,
  });
  // BOLD RAYS beaming out + a gilded glory-halo + legible gold SPARKS — the same
  // radiant Father's house glimpsed across the field; it RADIATES (Rev 21:23).
  strokes(out, counter, {
    rng, n: 56,
    sample: r => { const a = r() * Math.PI * 2, d = 18 + r() * 44; return [hs.x + Math.cos(a) * d, hs.y - 18 + Math.sin(a) * d * 0.85]; },
    dir: (x, y) => Math.atan2(y - (hs.y - 18), x - hs.x),
    col: (x, y, r) => jig(mix(GOLD_HOT, GOLD_PALE, r() * 0.5), r, 6),
    len: (x, y) => 16 + Math.hypot(x - hs.x, y - hs.y + 18) * 0.4, lw: 1.4, steps: 2, lenJ: 0.6,
  });
  klimtGold(out, counter, rng, hs.x, hs.y - 16, 46, 104, { rings: 6, opacity: 0.58, squash: 0.82 });
  goldSparks(out, counter, rng, hs.x, hs.y - 16, 22, 112, 70, { squash: 0.85, big: 0.9 });
  // a clearly DRAWN home, full of light: gold walls, a distinct roof, a glowing
  //  door and bright windows — the Father's house (Rev 21:23). Bigger so the
  //  destination is unmistakable across the field.
  const bT = hs.y - 27, bB = hs.y + 3, pk = hs.y - 52, hw4 = 34;
  out.push(`<path d="M${hs.x - hw4} ${R1(bB)}L${hs.x - hw4} ${R1(bT)}L${hs.x + hw4} ${R1(bT)}L${hs.x + hw4} ${R1(bB)}Z" fill="#f4dea2"/>`); counter.n++;
  out.push(`<path d="M${hs.x - hw4 - 6} ${R1(bT + 1)}L${hs.x} ${R1(pk)}L${hs.x + hw4 + 6} ${R1(bT + 1)}Z" fill="#c87a44"/>`); counter.n++;
  strokes(out, counter, { rng, n: 92, sample: rej(hs.x - hw4 + 1, bT + 1, hs.x + hw4 - 1, bB - 1), dir: () => 0, col: (x, y, r) => jig(ramp([GOLD_HOT, GOLD_PALE, GOLD, '#e0c068'], fbm(x / 12, y / 12, 201) * 0.5 + 0.2), r, 6), len: 7, lw: 2.4, steps: 2, impasto: 0.4 });
  paintPath(out, counter, rng, [[hs.x - hw4 - 6, bT + 1], [hs.x, pk], [hs.x + hw4 + 6, bT + 1]], (x, y, r) => jig(mix('#a85e30', '#d89456', r() * 0.5), r, 8), { lw: 2.4, len: 4.5, density: 0.6, jitter: 0.6 });
  out.push(`<rect x="${R1(hs.x - 23)}" y="${R1(bT + 6)}" width="11" height="13" rx="1.6" fill="#fffaf0"/>`);
  out.push(`<rect x="${R1(hs.x + 12)}" y="${R1(bT + 6)}" width="11" height="13" rx="1.6" fill="#fffaf0"/>`);
  out.push(`<rect x="${R1(hs.x - 6)}" y="${R1(bB - 15)}" width="12" height="15" rx="1.6" fill="#fff2c8"/>`); // a glowing door
  counter.n += 3;
  // LIFE beside the home — a tree and a bush (a lived-in, flourishing home)
  strokes(out, counter, { rng, n: 40, sample: r => { const v = Math.pow(r(), 0.85); const wr = 7 * Math.sin(Math.PI * Math.min(1, v * 1.15)) + 0.8; return [hs.x - 40 + (r() + r() - 1) * wr, hs.y + 4 - v * 46]; }, dir: (x, y) => -Math.PI / 2 + (fbm(x / 8, y / 8, 247) - 0.5) * 0.6, col: (x, y, r) => jig(ramp(['#264a2e', '#386a3a', '#4e8244'], fbm(x / 10, y / 10, 251) + r() * 0.3), r, 7), len: 9, lw: 2.2, steps: 3, follow: 0.95, lenJ: 0.5 });
  strokes(out, counter, { rng, n: 22, sample: r => { const a = r() * Math.PI * 2, dd = Math.pow(r(), 0.7); return [hs.x + 36 + Math.cos(a) * 13 * dd, hs.y + 2 - Math.abs(Math.sin(a)) * 9 * dd]; }, dir: () => -Math.PI / 2, col: (x, y, r) => jig(ramp(['#2a5230', '#3a6c3c', '#4e8446'], fbm(x / 12, y / 12, 261) + r() * 0.25), r, 8), len: 6, lw: 2, steps: 2 });
  // its light: the house is FULL OF LIGHT — a warm glow radiates all around it
  strokes(out, counter, {
    rng, n: 140,
    sample: r => { const a = r() * Math.PI * 2, d = 4 + Math.pow(r(), 0.85) * 48; return [hs.x + Math.cos(a) * d, hs.y - 11 + Math.sin(a) * d * 0.72]; },
    dir: (x, y) => Math.atan2(y - (hs.y - 11), x - hs.x) + Math.PI / 2,
    col: (x, y, r) => jig(ramp([GOLD_HOT, GOLD_PALE, GOLD, GOLD_DEEP, '#a8843e'], Math.hypot(x - hs.x, (y - hs.y + 11) / 0.72) / 48), r, 8),
    len: 7, lw: 1.7, steps: 2, impasto: 0.4,
  });
  // brighten the windows back over the glow so the home reads as lit
  out.push(`<rect x="${hs.x - 4}" y="${hs.y - 16}" width="8" height="9" rx="1.5" fill="${GOLD_HOT}"/>`);
  counter.n++;
  farRanges.push([_farHouse, out.length]);   // ← the distant house rides the FAR plane (barely parallaxes)
  // ...and a long warm thread cast down the road toward the walker — brighter than the dust it lies on
  strokes(out, counter, {
    rng, n: 90,
    sample: r => { const t = Math.pow(r(), 1.6) * 0.8; const p = roadP(t); return [p[0] + (r() + r() - 1) * roadW(t) * 0.16, p[1] + (r() - 0.5) * 3]; },
    dir: (x, y) => { const { t } = roadInfo(x, y); const a = roadP(Math.max(0, t - 0.03)), b = roadP(Math.min(1, t + 0.03)); return Math.atan2(b[1] - a[1], b[0] - a[0]); },
    col: (x, y, r) => { const { t } = roadInfo(x, y); return jig(ramp(['#fff3cd', '#ffe9a0', GOLD], t * 1.05 + (r() - 0.5) * 0.25), r, 7); },
    len: 14, lw: 1.7, steps: 3, lenJ: 0.6, wJ: 0.45,
  });

  // FATHER: past halfway, mid-stride, leaning hard toward the child  [NEAR plane]
  const _nearFather = out.length;
  const fp = roadP(0.62); // ~ (315, 392)
  const lean = Math.atan2(near[1] - far[1], near[0] - far[0]); // direction of running
  const fScale = 1.6;   // bigger — he is the heart of the page
  const fx = fp[0], fy = fp[1] - 2;
  // running with ARMS FLUNG WIDE OPEN — the one gesture that says "the Father".
  // an ARTICULATED human (personCaps): head-top high, big forward lean, both
  // arms flung out wide toward the child, legs in a big running stride.
  const fH = 92;                         // full height head-top→feet
  const fTopY = fy - 82;                 // top of head
  const fCaps = personCaps(fx, fTopY, fH, {
    lean: -18,                                            // torso pitched forward (toward the child, down-road = left)
    headTilt: -5,
    leftHand: [fx - 52, fy - 56],                        // front arm flung WIDE toward the child (the embrace)
    rightHand: [fx + 40, fy - 50],                       // back arm flung WIDE — open
    leftFoot: [fx - 34, fy + 6],                         // front leg striding far ahead
    rightFoot: [fx + 36, fy - 6],                        // back leg kicked up behind
  });
  // THE FATHER IS THE LIGHT — he does not run as a dark shape but RADIANT:
  // a soft halo of light around him first (he gives off light, not just reflects)
  const hc = fy - 26 * fScale;
  strokes(out, counter, {
    rng, n: 150,
    sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 0.85) * 50 * fScale; return [fx + Math.cos(a) * d, hc + Math.sin(a) * d * 0.92]; },
    dir: () => lean,
    col: (x, y, r) => jig(ramp([GOLD_PALE, GOLD, GOLD_DEEP, '#9a6e34'], Math.hypot(x - fx, (y - hc) / 0.92) / (50 * fScale)), r, 9),
    len: 8, lw: 2.4, steps: 2, impasto: 0.4,
  });
  // his body: luminous golden-white, the brightest thing in the field — warmth,
  // not a silhouette; the open arms read as welcome, not threat
  // THE WORD MADE FLESH (John 1:14) — the Father wears the child's human form, but
  // RADIANT: brilliant white woven with yellow, glowing. ONE consistent Light.
  castShadow(out, counter, fCaps, { dir: 0.5 });
  paintLight(out, counter, rng, fCaps);   // (paintLight now emits the rays of light consistently)
  // robe flying behind (up-road, toward the house)
  strokes(out, counter, {
    rng, n: 70,
    sample: r => [fx + 12 + r() * 30, fy - 26 + (r() - 0.3) * 24],
    dir: (x, y) => lean + Math.PI + (fbm(x / 20, y / 20, 215) - 0.5) * 0.9,
    col: (x, y, r) => jig(ramp(['#8a4e1c', '#6b3a14', '#4a2810'], (x - fx - 10) / 44), r, 11),
    len: 13, lw: 2.8, steps: 2, lenJ: 0.5,
  });
  // dust kicked up behind his feet — bold, rising, torn by the run
  strokes(out, counter, {
    rng, n: 270,
    sample: r => { const t = Math.pow(r(), 1.4); return [fx + 4 + t * 88 + (r() - 0.5) * 10, fy - 1 - t * 16 + (r() - 0.4) * (10 + t * 22)]; },
    dir: (x, y) => lean + Math.PI - 0.25 - (x - fx) * 0.004 + (fbm(x / 14, y / 14, 219) - 0.5) * 1.4,
    col: (x, y, r) => { const d = (x - fx) / 90; return jig(ramp(['#f7eed6', '#ecdfc0', '#d4bd92', '#bda57a'], d + (r() - 0.5) * 0.3), r, 11); },
    len: 14, lw: 2.9, steps: 2, wild: 0.16, lenJ: 0.65, aJ: 0.55,
  });
  // (the little gold ring on his hand was removed — it read as an odd floating disc)
  nearRanges.push([_nearFather, out.length]);   // ← the running Father leads (NEAR plane)

  /* ---------------- FAR plane — the receding horizon (distant hills, cypress, birds) ----------------
     DISTANT HILLS: a hazy rolling-land silhouette behind the field. Its undulating
     skyline IS the sky↔ground boundary (never a ruled line), and on its own depth
     plane it slides against the sky as you pan — an overlapping, moving horizon. */
  const _far = out.length;
  const hillTop = ridge(horizon - 4, { amp: 34, freq: 205, bumps: 0.55, seed: 137 });
  distantHills(out, counter, rng, { topFn: hillTop, horizonFn: () => horizon, cols: ['#7ba88e', '#8fb98a', '#aac884'], depth: 74, seed: 137 });
  const cyp = (cx, cby, ch, w) => strokes(out, counter, { rng, n: Math.round(w * ch / 12), sample: r => { const v = Math.pow(r(), 0.85); const wr = w * Math.sin(Math.PI * Math.min(1, v * 1.15)) + 0.7; return [cx + (r() + r() - 1) * wr, cby - v * ch]; }, dir: (x, y) => -Math.PI / 2 + (fbm(x / 8, y / 8, 247) - 0.5) * 0.6, col: (x, y, r) => jig(ramp(['#26283a', '#34364e', '#42445e'], fbm(x / 10, y / 10, 251) + r() * 0.3), r, 7), len: 9, lw: 2.2, steps: 3, follow: 0.95, lenJ: 0.5 });
  cyp(108, 234, 42, 6); cyp(728, 246, 46, 7);
  farRanges.push([_far, out.length]);   // ← distant hills + cypress (FAR plane, with the house)
  // the BIRDS — their own plane, drifting in the open air between the hills and
  // the field, so they parallax on their own as the view turns (Matt 6:26)
  const _birds = out.length;
  for (const [bx, by, s] of [[180, 60, 1], [214, 74, 0.85], [250, 56, 0.9], [292, 70, 0.78], [330, 50, 0.7], [560, 80, 0.85], [598, 66, 0.75], [636, 86, 0.7], [120, 88, 0.8], [700, 72, 0.62]]) {
    paintPath(out, counter, rng, [[bx - 6 * s, by + 2.6 * s], [bx, by - 1.8 * s], [bx + 6 * s, by + 2.6 * s]], (x, y, r) => jig('#36405a', r, 6), { lw: 1.5 * s, len: 3.4, density: 0.9, jitter: 0.5 });
  }
  birdRanges.push([_birds, out.length]);   // ← the birds drift in their own air

  /* ---------------- MID plane — the field's own life, PLANTED in the field ----------------
     the fringe and ALL the fruit-trees ride the MID plane with the field, rising
     from its rolling edge, so they move WITH the ground they grow in (planted, not
     floating) while the whole field parallaxes against the far hills and the sky. */
  // the HORIZON FRINGE — ragged grass tufts rising off the field's rolling top
  // grass tufts breaking the seam — but SKIP the column under the Father's house
  // (x≈644..712) so the home (the destination) is never hidden behind the grass.
  horizonFringe(out, counter, rng, { horizonFn: fieldTop, x0: -10, x1: 628, cols: ['#2c6a48', '#3a7a38', '#5e9a40', '#88b84a'], hMax: 22 });
  horizonFringe(out, counter, rng, { horizonFn: fieldTop, x0: 718, x1: 810, cols: ['#2c6a48', '#3a7a38', '#5e9a40', '#88b84a'], hMax: 22, seed: 521 });
  // FRUITFUL TREES rooted across the field (Isa 35:1; Munch free colour) — each
  // planted in the MID field, so its base stays with the ground as the view turns.
  fruitTree(out, counter, rng, 486, 252, 50, 24, LEAF_PALETTES[2]);  // teal, mid-distant
  fruitTree(out, counter, rng, 96, 332, 76, 34, LEAF_PALETTES[3]);   // blue, left
  fruitTree(out, counter, rng, 748, 344, 82, 38, LEAF_PALETTES[1]);  // pink, right
  // white sheep in green pastures (Ps 23) — woolly, pale, dark face + legs
  const shp = (sx, sy, s) => { strokes(out, counter, { rng, n: Math.round(22 * s), sample: r => { const a = r() * Math.PI * 2, dd = Math.pow(r(), 0.7); return [sx + Math.cos(a) * 9 * s * dd, sy + Math.sin(a) * 5 * s * dd]; }, dir: () => 0, col: (x, y, r) => jig(mix('#e6dcc4', '#f6f0de', r() * 0.6), r, 7), len: 3 * s, lw: 2 * s, steps: 2 }); paintPath(out, counter, rng, [[sx - 8 * s, sy - 1 * s], [sx - 11 * s, sy + 1.5 * s]], (x, y, r) => jig('#3a322a', r, 4), { lw: 2 * s, len: 2, density: 1 }); for (const lx of [-5, 0, 5]) paintPath(out, counter, rng, [[sx + lx * s, sy + 3 * s], [sx + lx * s, sy + 6 * s]], (x, y, r) => jig('#3a322a', r, 4), { lw: 1.1 * s, len: 2, density: 0.9 }); };
  shp(150, 360, 1); shp(700, 298, 0.82); shp(744, 358, 0.78); shp(110, 420, 0.9);

  // THE FIELD CELEBRATES (Luke 15:20 "his father saw him... and ran"; Isa 35:1
  // "the desert shall rejoice, and blossom as the rose") — wildflowers crowd
  // THICK along both verges of the homecoming road, richest near the reader:
  // green stems first, then bright heads, so the border reads as growth.
  const vergeAt = (r, spread) => {
    const t = Math.pow(r(), 0.85);
    const p = roadP(t), q = roadP(Math.min(1, t + 0.04));
    let nx = -(q[1] - p[1]), ny = q[0] - p[0];
    const nl = Math.hypot(nx, ny) || 1; nx /= nl; ny /= nl;
    const side = r() < 0.5 ? 1 : -1;
    const off = roadW(t) / 2 + 1.5 + Math.pow(r(), 1.4) * (spread + t * 14);
    return [p[0] + nx * off * side, p[1] + ny * off * side];
  };
  strokes(out, counter, {   // stems: fresh green, leaning up out of the wheat
    rng, n: 170, sample: r => vergeAt(r, 7),
    dir: (x, y) => -Math.PI / 2 + (fbm(x / 16, y / 16, 305) - 0.5) * 0.8,
    col: (x, y, r) => jig(mix('#3a7a38', '#6aa842', r()), r, 9),
    len: (x, y) => 3.5 + (y - horizon) / (510 - horizon) * 5.5, lw: 1.5, steps: 2, lenJ: 0.4,
  });
  strokes(out, counter, {   // heads: joy-coloured, bigger + denser than the field scatter
    rng, n: 430, sample: r => vergeAt(r, 8),
    dir: () => -Math.PI / 2,
    col: (x, y, r) => { const k = r(); return jig(k < 0.24 ? '#f0447a' : k < 0.46 ? '#9a66e8' : k < 0.66 ? '#ffd23e' : k < 0.84 ? '#fffdf4' : '#ff8e5e', r, 12); },
    len: (x, y) => 2.6 + (y - horizon) / (510 - horizon) * 4.6,
    lw: (x, y) => 2.4 + (y - horizon) / (510 - horizon) * 2.6,
    steps: 1, lenJ: 0.45, impasto: 0.45,
  });

  // BUTTERFLIES rising out of the field along the Father's running line — the
  // meadow loosed into the air by His feet (Luke 15:20). Bold four-lobe curved
  // wings + a dark stitched body (the recipe proven on risen); size falls with
  // distance, each colour picked to pop on what is locally behind it.
  const butterfly = (bx, by, s, wing, body) => {
    const wc = (x, y, r) => jig(wing, r, 6);
    paintPath(out, counter, rng, [[bx - 1.2 * s, by - 0.5 * s], [bx - 5.5 * s, by - 4.5 * s], [bx - 8 * s, by - 1 * s], [bx - 3.5 * s, by + 0.8 * s]], wc, { lw: 2.4 * s, len: 3, density: 0.95, jitter: 0.4 });
    paintPath(out, counter, rng, [[bx + 1.2 * s, by - 0.5 * s], [bx + 5.5 * s, by - 4.5 * s], [bx + 8 * s, by - 1 * s], [bx + 3.5 * s, by + 0.8 * s]], wc, { lw: 2.4 * s, len: 3, density: 0.95, jitter: 0.4 });
    paintPath(out, counter, rng, [[bx - 1 * s, by + 1 * s], [bx - 4 * s, by + 4 * s], [bx - 1.5 * s, by + 4.8 * s]], wc, { lw: 2 * s, len: 2.5, density: 0.95, jitter: 0.4 });
    paintPath(out, counter, rng, [[bx + 1 * s, by + 1 * s], [bx + 4 * s, by + 4 * s], [bx + 1.5 * s, by + 4.8 * s]], wc, { lw: 2 * s, len: 2.5, density: 0.95, jitter: 0.4 });
    paintPath(out, counter, rng, [[bx, by - 3 * s], [bx + 0.6 * s, by], [bx, by + 3.5 * s]],
      (x, y, r) => jig(body, r, 5), { lw: 1.1 * s, len: 2.5, density: 1, jitter: 0.2 });
  };
  butterfly(268, 424, 1.6, '#e84a66', '#401830');  // coral-crimson, big + near — hovering over the pale road between Him and you
  butterfly(230, 384, 1.25, '#8f5ce0', '#301a4a'); // violet, higher on His line — risen further, on the green wheat
  butterfly(394, 320, 0.95, '#3d86d8', '#182a4a'); // bold blue, small + far — above the gold-lit wheat behind His shoulder (blue pops on gold)

  // CHILD: three steps in at the near end, walking toward the house  [FG layer]
  const _fgC = out.length;
  const cp = roadP(0.9); // near end
  const cx2 = cp[0] + 26, cy2 = cp[1] - 14;
  // an ARTICULATED little child taking steps toward the Father — small, stepping in
  const cCaps = personCaps(cx2, cy2 - 52, 54, {
    lean: -3,
    leftHand: [cx2 - 12, cy2 - 18],                      // one arm reaching toward Him
    rightHand: [cx2 + 9, cy2 - 14],
    leftFoot: [cx2 - 9, cy2 + 2],                         // mid-step
    rightFoot: [cx2 + 8, cy2 + 1],
  });
  // THE MAIN CHARACTER — "you": consistent deep-red clothes + dark outline so the
  // reader can follow the same child across the whole book (was a dark-blue form here).
  castShadow(out, counter, cCaps, { dir: 0.5 });
  paintChild(out, counter, rng, cCaps);
  // small warm light on the child's front (facing the father/house)
  strokes(out, counter, {
    rng, n: 16,
    sample: rej(cx2 - 10, cy2 - 54, cx2 + 4, cy2 - 10, (x, y) => cCaps.some(c => inCap(x, y, c)) && x < cx2 + 2),
    dir: () => Math.PI / 2.2,
    col: (x, y, r) => jig(GOLD_DEEP, r, 12),
    len: 6, lw: 1.5, steps: 2,
  });
  fgRanges.push([_fgC, out.length]);   // ← the child is foreground

  // MULTIPLANE: assemble the requested depth plane. Each is its own cel —
  // transparent where it has no content — so they stack and parallax like the
  // painted-background-plus-acetate-cels of hand-drawn animation.
  const ALT = 'A churning gold wheat field under a turbulent blue-green sky; a pale road cuts a diagonal; a small figure has taken three steps in, while from the far house the father, already past halfway, runs with dust flying.';
  const RAW = { undercoat: 0, weave: 0, varnish: 0, oil: 0 };   // no baked surface — the live filter unifies the planes
  const setOf = ranges => { const s = new Set(); for (const [a, b] of ranges) for (let i = a; i < b; i++) s.add(i); return s; };
  const pick = ranges => ranges.map(([a, b]) => out.slice(a, b).join('\n')).join('\n');
  const farSet = setOf(farRanges), nearSet = setOf(nearRanges), fgSet = setOf(fgRanges), birdSet = setOf(birdRanges);
  if (LAYER === 'sky') return svgWrap(ALT, out.slice(0, skyEnd).join('\n'), RAW);   // smooth sky ground (opaque backmost)
  const sm = LAYER.match(/^sky(\d+)$/);
  if (sm) return svgWrap(ALT, '<g>' + skySheets[+sm[1] - 1] + '</g>', RAW);         // one sky-swirl sheet
  if (LAYER === 'hills') return svgWrap(ALT, pick(farRanges), RAW);                 // distant hills, cypress, the far house
  if (LAYER === 'birds') return svgWrap(ALT, pick(birdRanges), RAW);                // the birds in their own air
  if (LAYER === 'dad') return svgWrap(ALT, pick(nearRanges), RAW);                  // the running Father
  if (LAYER === 'kid') return svgWrap(ALT, pick(fgRanges), RAW);                    // the near child
  if (LAYER === 'land') {                                                           // field + road + trees + sheep (everything unclaimed)
    const body = out.filter((_, i) => i >= skyEnd && !farSet.has(i) && !nearSet.has(i) && !fgSet.has(i) && !birdSet.has(i)).join('\n');
    return svgWrap(ALT, body, RAW);
  }
  // full painting (desktop): sky ground, the stacked sky-sheets, then everything else
  return svgWrap(ALT, out.slice(0, skyEnd).concat(skySheets, out.slice(skyEnd)).join('\n'));
}
