// gen/plates/flame.mjs — "He made the world"
//
//   "And God said, Let there be light: and there was light." — Genesis 1:3
//   "And God saw the light, that it was good." — Genesis 1:4
//
// The FIRST MORNING. A bright, radiant NEW WORLD being made — light pouring
// over the face of the waters, breaking over fresh land, filling a vibrant
// young sky. The Light speaks and the world wakes good: gold dawn high above,
// the great deep gathered below catching fire with the morning, green earth
// rising new. No night, no candle, no child — only the world, newly made,
// and the light that made it, "and it was good."
//
// House style: radiant gold light, Munch curves (waters swirl, land curves,
// made-nothing here is straight), vibrant, no black; painterly density.
//
// MOBILE 3D — depth planes (FAR→NEAR): the radiant dawn sky with the rising
// light-source rides backmost (opaque); distant new hills on the FAR plane
// parallax along the horizon; the MID plane is the new land and the gathered
// waters with their swirling light; the FG plane is the near shore bursting
// with the first fruit-life. `full`/desktop = the original draw order.

export const name = 'flame';
export const title = 'He made the world';
export const caption = 'He made the world, and filled it with light.';
export const seed = 20260611;
export const focal = { x: 400, y: 250 }; // portrait window: the rising light over the waters
// stacked SKY-SWIRL SHEETS — paint on paint, gapped, each its own depth plane
export const SKY_SHEETS = [
  { n: 168, len: 22, lw: 9.0, lift: 0.00 },
  { n: 184, len: 20, lw: 8.3, lift: 0.07 },
];
export const layers = [
  { name: 'sky', opaque: true },  // smooth radiant dawn-sky ground + the rising light (backmost)
  ...SKY_SHEETS.map((_, i) => ({ name: 'sky' + (i + 1) })),   // stacked sky-swirl sheets
  { name: 'far' },                // distant new hills (the moving horizon)
  { name: 'mid' },                // the gathered waters + the new land + swirling light
  { name: 'fg' },                 // the near shore + the first fruit-life (closest)
];

export function paint(E, opts = {}) {
  const {
    mulberry32, fbm, curlV, goldenSpiralV, mix, ramp, jig, strokes, rej,
    paintPath, lightRadial, svgWrap, R1, W, H,
    GOLD, GOLD_PALE, GOLD_DEEP, GOLD_HOT,
  } = E;

  const rng = mulberry32(seed);
  const out = [];
  const counter = { n: 0 };
  const LAYER = opts.layer || 'full';
  const farRanges = [], fgRanges = [];
  out.push(`<rect width="${W}" height="${H}" fill="#7fc6f2"/>`);   // bright young sky — never black

  // the rising LIGHT — the plate's one source: "Let there be light." It rises
  // low and central over the waters, answered by a great glory overhead.
  const lightC = { x: 400, y: 226 };
  const rise = lightRadial(lightC.x, lightC.y, 320);
  const glory = lightRadial(400, 80, 360);
  const lightAt = (x, y) => Math.min(1, rise(x, y) * 1.15 + glory(x, y) * 0.55);
  // the firmament between waters: the sea-line where gathered waters meet sky
  const seaY = x => 268 + 10 * Math.sin(x / 150) + (x - 400) * 0.008;

  /* ---------------- 1. THE FIRST-MORNING SKY — light, swirling, made ----------------
     the sky is nature, so it swirls (Munch) — a gentle radiant turn out of the
     rising light, the morning of the world, joyful, not storm. A luminous
     gradient underpaints it so every gap glows. */
  out.push(`<defs><linearGradient id="dawn02" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#a9e1fb"/>
<stop offset="0.42" stop-color="#8fcaf2"/>
<stop offset="0.7" stop-color="#f3b0c2"/>
<stop offset="0.88" stop-color="#ffce7a"/>
<stop offset="1" stop-color="#ffe49a"/>
</linearGradient></defs>`);
  out.push(`<rect x="-12" y="-12" width="${W + 24}" height="296" fill="url(#dawn02)"/>`);
  counter.n++;
  // THE ALIVE DAWN SKY (the fractal sky — motion at three scales): the whole
  // morning WHEELS in one great spiral around the rising light (macro), a few
  // eddies turn inside the wheel (mid), and every stroke curves with its parent
  // current (micro). Swirls within swirls — the dawn is deep moving light, the
  // same alive hand as looking/garden (kept warm/gentle, first-morning, not storm).
  const WHEEL_X = 400, WHEEL_Y = 226;                 // the great wheel turns on the rising light
  const EDDIES = [[150, 92, 54], [560, 72, -58], [672, 176, 50], [280, 150, -48]];
  const nearV = (x, y) => { let m = 1e9; for (const [ex, ey] of EDDIES) m = Math.min(m, Math.hypot(x - ex, y - ey) / 52); return m; };
  const skyDir = (x, y) => {
    let vx = 14, vy = -5;   // a gentle upward breath (the light rising); the wheel rides on top
    { const [a, b] = goldenSpiralV(x, y, WHEEL_X, WHEEL_Y, 115, 260); vx += a; vy += b; }   // MACRO — the great wheel of the dawn
    for (const [ex, ey, s] of EDDIES) { const [a, b] = goldenSpiralV(x, y, ex, ey, s, 80); vx += a; vy += b; } // MID — eddies turning inside
    const [c, d] = curlV(x, y, 31, 120); vx += c * 26; vy += d * 26;   // MICRO — fine turbulence on every stroke
    return Math.atan2(vy, vx);
  };
  // jewel eddy-glows — each mid-eddy core breathes a deep dawn tint (rose/violet/
  // gold), the alive richness (kept subtle; the rising light still overrides)
  const EGLOW = [[150, 92, '#e28aa6'], [560, 72, '#e6b45a'], [672, 176, '#a07cc0'], [280, 150, '#d087b0']];
  const skyCol = (x, y, r, lift) => {
    const t = Math.max(0, Math.min(1, 0.05 + (y / 268) * 0.5 + fbm(x / 130, y / 120, 13) * 0.28));
    let c = ramp(['#a9e1fb', '#8fcaf2', '#8fb8e8', '#f3b0c2', '#ffce7a', '#ffe49a'], t); // blue high → rose → gold low
    for (const [ex, ey, ec] of EGLOW) { const d2 = Math.hypot(x - ex, y - ey); c = mix(c, ec, Math.exp(-d2 / 95) * 0.5); }   // the eddy cores breathe faint jewel light
    c = mix(c, GOLD_PALE, (rise(x, y) * 0.5 + glory(x, y) * 0.3));
    if (lift) c = mix(c, '#ffffff', lift);
    return jig(c, r, 6);
  };
  // the smooth dawn-sky GROUND — broad soft masses (opaque base); the swirling
  // brushwork lives in the stacked sheets above, so their gaps reveal this paint
  strokes(out, counter, {
    rng, n: 250, sample: rej(-12, -12, 812, 296, (x, y) => y < seaY(x) + 8),
    dir: skyDir, col: (x, y, r) => skyCol(x, y, r, 0),
    len: 44, lw: 10, steps: 4, follow: 0.91, wild: 0.05, lenJ: 0.5, impasto: 0.5,
  });
  // VAN GOGH ARMS — streaming light: long curling filaments riding the new dawn,
  // bright (rose into gold), glory pouring up across the firmament
  strokes(out, counter, {
    rng, n: 230,
    sample: rej(-12, -12, 812, 282, (x, y) => y < seaY(x) + 2),
    dir: skyDir,
    col: (x, y, r) => {
      const k2 = fbm(x / 88, y / 88, 17) + (r() - 0.5) * 0.2;
      if (k2 > 0.78) return jig('#fffdf6', r, 8);  // bright cloud crests
      return jig(mix(mix('#bfe6fb', '#f4b6c6', Math.min(1, y / 220)), GOLD_PALE, Math.min(0.8, 0.2 + lightAt(x, y) * 0.8)), r, 6);
    },
    len: 30, lw: 4.4, steps: 6, follow: 0.94, wild: 0.18, lenJ: 0.55, impasto: 0.6, relief: 0.5,
  });
  // the rising light's radiant core, low and central — the source of the first day
  strokes(out, counter, {
    rng, n: 150,
    sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 0.78) * 52; return [lightC.x + Math.cos(a) * d, lightC.y + Math.sin(a) * d * 0.92]; },
    dir: () => 0.2,
    col: (x, y, r) => jig(ramp([GOLD_HOT, GOLD_PALE, GOLD], Math.hypot(x - lightC.x, (y - lightC.y) / 0.92) / 52), r, 5),
    len: 8, lw: 3, steps: 2, impasto: 0.55,
  });
  // bold rays of the first morning streaming up and out across the sky
  strokes(out, counter, {
    rng, n: 96,
    sample: r => { const a = -Math.PI * (0.05 + r() * 0.9); const d = (0.4 + 0.82 * r()) * 252; return [lightC.x + Math.cos(a) * d, lightC.y + Math.sin(a) * d * 0.9]; },
    dir: (x, y) => Math.atan2(y - lightC.y, x - lightC.x),
    col: (x, y, r) => jig(mix(GOLD_HOT, GOLD_PALE, r() * 0.5), r, 6),
    len: (x, y) => 12 + Math.hypot(x - lightC.x, y - lightC.y) / 14, lw: 1.4, steps: 2, lenJ: 0.7, relief: 0,
  });
  // BIRDS of the fifth day rising into the new morning (Gen 1:20)
  for (const [bx, by, s] of [[166, 76, 1], [202, 90, 0.85], [138, 94, 0.8], [628, 84, 0.9], [668, 70, 0.78], [602, 98, 0.7]]) {
    paintPath(out, counter, rng, [[bx - 6 * s, by + 2.6 * s], [bx, by - 1.8 * s], [bx + 6 * s, by + 2.6 * s]], (x, y, r) => jig('#5a6ea0', r, 6), { lw: 1.5 * s, len: 3.4, density: 0.9, jitter: 0.5 });
  }
  const skyEnd = out.length;   // ← the smooth dawn-sky ground is the SKY plane (opaque)

  // the stacked SKY-SWIRL SHEETS — each an independent bold, gapped pass of the
  // first morning's gentle turn (paint on paint), own rng per sheet.
  const skySheets = SKY_SHEETS.map((e, k) => {
    const srng = mulberry32(seed + 1009 * (k + 1));
    const sh = [];
    strokes(sh, { n: 0 }, {
      rng: srng, n: e.n, sample: rej(-12, -12, 812, 296, (x, y) => y < seaY(x) + 8),
      dir: skyDir,
      col: (x, y, r) => {
        const near = nearV(x, y);
        if (near < 1.1 && r() < 0.06) return jig(r() < 0.5 ? '#fff4d8' : '#f8d6e0', r, 12);   // BRIGHT dawn knot-sparks (gold-white + pale rose)
        const k2 = fbm(x / 92, y / 92, 71) + (r() - 0.5) * 0.2;
        if (k2 > 0.76) return jig('#fff4d8', r, 8);                                            // BRIGHT warm gold-white crests (read against the dawn)
        return skyCol(x, y, r, e.lift);
      },
      len: e.len, lw: e.lw, steps: 5, follow: 0.91, wild: 0.2, lenJ: 0.55, impasto: 0.6, relief: 0.5,
      aJ: (x, y) => 0.16 + Math.max(0, 1.3 - nearV(x, y)) * 0.42,
    });
    return sh.join('\n');
  });

  /* ---------------- 2. THE GATHERED WATERS — "let the waters be gathered" (Gen 1:9) ----------------
     the great deep, below the sea-line, catching fire with the morning. Water is
     nature, so it SWIRLS (Munch) — turning eddies of blue-green and gold under
     the rising light, "and the Spirit moved upon the face of the waters." */
  const waterDir = (x, y) => {
    // gentle ocean swirl: vortices in the deep + the morning glitter streaming out
    let vx = 14, vy = 0;
    const WV = [[300, 360, 70], [560, 392, -64], [180, 430, 56], [640, 446, -52]];
    for (const [vx0, vy0, s] of WV) { const [a, b] = goldenSpiralV(x, y, vx0, vy0, s, 60); vx += a; vy += b; }
    const [c, d] = curlV(x, y, 53, 120); vx += c * 44; vy += d * 44;
    return Math.atan2(vy, vx);
  };
  strokes(out, counter, {
    rng, n: 1500,
    sample: rej(-10, 256, 810, 512, (x, y) => y > seaY(x) - 2),
    dir: waterDir,
    col: (x, y, r) => {
      const depth = Math.max(0, (y - seaY(x)) / (H - seaY(x)));
      let c = ramp(['#bfe6f6', '#7fc3df', '#3f93c0', '#2f6fa6', '#27568c'], 0.1 + fbm(x / 70, y / 60, 29) * 0.7 + depth * 0.4);
      // the morning blazing on the water — a path of gold light across the deep
      c = mix(c, GOLD_PALE, lightAt(x, y) * 0.7);
      // ATMOSPHERIC PERSPECTIVE: the far water dissolves into the dawn air
      c = mix(c, '#d6ecf6', Math.pow(1 - depth, 1.9) * 0.55);
      return jig(c, r, 11);
    },
    // ONE-POINT SCALE GRADIENT: near swells are long and thick, far ripples tiny —
    // the sea itself recedes to the line where the light stands (still Munch-curved)
    len: (x, y) => 5 + Math.max(0, (y - seaY(x)) / (H - seaY(x))) * 22,
    lw: (x, y) => 1.5 + Math.max(0, (y - seaY(x)) / (H - seaY(x))) * 4.6,
    steps: 4, follow: 0.93, wild: 0.14, lenJ: 0.55, impasto: 0.6, relief: 0.5,
  });
  // THE GOLDEN TRACK — the sun's path on the water, drawn as the one-point
  // ORTHOGONAL of the whole page: a road of light running from the near shore
  // straight to the sun on the sea-line, its width and flecks shrinking by 1/Z.
  // The oldest one-point picture there is: light on water, leading to its source.
  strokes(out, counter, {
    rng, n: 280,
    sample: r => {
      const t = Math.pow(r(), 1.25);                    // crowd the near end
      const y = 500 - t * (500 - (seaY(lightC.x) + 3)); // shore → sea-line
      const depth = Math.max(0.02, (y - seaY(lightC.x)) / (H - seaY(lightC.x)));
      const w = 8 + depth * 92;                         // track width ∝ 1/Z
      return [lightC.x + (r() * 2 - 1) * w, y];
    },
    dir: (x, y) => Math.atan2(seaY(lightC.x) - y, lightC.x - x),   // flecks stream toward the sun
    col: (x, y, r) => jig(ramp([GOLD_HOT, GOLD_PALE, GOLD, GOLD_DEEP], Math.abs(x - lightC.x) / 110 + (r() - 0.5) * 0.2), r, 7),
    len: (x, y) => 3 + Math.max(0, (y - seaY(lightC.x)) / (H - seaY(lightC.x))) * 12,
    lw: (x, y) => 1 + Math.max(0, (y - seaY(lightC.x)) / (H - seaY(lightC.x))) * 2.6,
    steps: 2, lenJ: 0.6, impasto: 0.45,
  });

  // EGG (in the waters): the ICHTHYS-less first-creature — leave the water clean;
  // egg goes in the hill below as the Hebrew reference.

  /* ---------------- 3. THE NEW LAND — "let the dry land appear" (Gen 1:9) ----------------
     fresh green earth rising at the near shore, lit gold by the morning, the
     first land of the made world. */
  // THE WATERS BRING FORTH — Gen 1:20-21: "let the waters bring forth abundantly
  // the moving creature that hath life… And God created great whales." The made
  // world TEEMS: a great whale breaks the far sea-line, fish leap the near water
  // with the morning gold on their backs. Simple bold silhouettes (the blade-fish
  // lesson: tiny detail mushes — dark shape + gold rim + splash reads).
  {
    // the GREAT WHALE, far out by the light's track — dark back arc + fluke + spout
    const wx = 612, wy = 302, ws = 74;   // far out on the PALE water right of the track — dark silhouette reads (check the local hue!)
    out.push(`<path d="M${R1(wx - ws / 2)} ${R1(wy)} Q${R1(wx)} ${R1(wy - ws * 0.30)} ${R1(wx + ws / 2)} ${R1(wy - 2)} L${R1(wx + ws * 0.42)} ${R1(wy + 3)} Q${R1(wx)} ${R1(wy - ws * 0.16)} ${R1(wx - ws / 2)} ${R1(wy + 3)} Z" fill="#28486a" opacity="0.92"/>`);
    out.push(`<path d="M${R1(wx - ws / 2 - 9)} ${R1(wy - 7)} Q${R1(wx - ws / 2 - 2)} ${R1(wy - 1)} ${R1(wx - ws / 2 - 10)} ${R1(wy + 4)} Q${R1(wx - ws / 2 + 4)} ${R1(wy + 1)} ${R1(wx - ws / 2 - 9)} ${R1(wy - 7)} Z" fill="#28486a" opacity="0.9"/>`);   // fluke
    out.push(`<path d="M${R1(wx + ws * 0.30)} ${R1(wy - ws * 0.26)} q2 -10 7 -14 M${R1(wx + ws * 0.30)} ${R1(wy - ws * 0.26)} q-1 -11 3 -16" fill="none" stroke="#fdf4d8" stroke-width="2" opacity="0.75" stroke-linecap="round"/>`);   // the spout, catching the gold
    out.push(`<path d="M${R1(wx)} ${R1(wy - ws * 0.23)} q10 -3 20 1" fill="none" stroke="#ffe9a8" stroke-width="1.6" opacity="0.7"/>`);   // morning rim on the back
    counter.n += 4;
    // LEAPING FISH — two arcs of silver-blue joy in the near water
    const fish = (fx, fy, s, flip) => {
      const f = flip ? -1 : 1;
      out.push(`<path d="M${R1(fx - s * f)} ${R1(fy)} Q${R1(fx)} ${R1(fy - s * 0.85)} ${R1(fx + s * f)} ${R1(fy - s * 0.12)} Q${R1(fx)} ${R1(fy + s * 0.3)} ${R1(fx - s * f)} ${R1(fy)} Z" fill="#3a6a92" opacity="0.95"/>`);
      out.push(`<path d="M${R1(fx - s * f)} ${R1(fy)} l${R1(-10 * f)} -7 l${R1(3 * f)} 10 Z" fill="#3a6a92" opacity="0.95"/>`);   // tail
      out.push(`<path d="M${R1(fx - s * 0.55 * f)} ${R1(fy - s * 0.5)} Q${R1(fx)} ${R1(fy - s * 0.8)} ${R1(fx + s * 0.8 * f)} ${R1(fy - s * 0.16)}" fill="none" stroke="#ffe9a8" stroke-width="1.8" opacity="0.85"/>`);   // gold on the back
      out.push(`<circle cx="${R1(fx + s * 0.62 * f)}" cy="${R1(fy - s * 0.22)}" r="1.6" fill="#101c30"/>`);
      counter.n += 4;
    };
    fish(300, 352, 36, false);   // leaping left of the track, toward the sun (in the OPEN water above the shore)
    fish(545, 336, 26, true);    // a smaller one further out, mirrored
    // splashes where they broke the water
    strokes(out, counter, {
      rng, n: 26,
      sample: r => { const p = r() < 0.6 ? [300, 364] : [545, 346]; return [p[0] + (r() - 0.5) * 26, p[1] + (r() - 0.2) * 7]; },
      dir: () => -Math.PI / 2.3,
      col: (x, y, r) => jig(mix('#eaf6fb', '#ffffff', r() * 0.6), r, 5),
      len: 5, lw: 1.5, steps: 2, lenJ: 0.6,
    });
  }

  const landTop = x => 380 + 13 * Math.sin(x / 120 + 1.2) - 8 * Math.exp(-(((x - 180) / 220) ** 2));
  const _fgLand = out.length;
  // underpaint: solid fresh green so gaps read lush
  {
    let d = `M-2 ${R1(landTop(-2))}`;
    for (let x = -2; x <= 802; x += 9) d += `L${R1(x)} ${R1(landTop(x))}`;
    d += `L802 ${H + 2}L-2 ${H + 2}Z`;
    out.push(`<path d="${d}" fill="#3f8a3a"/>`); counter.n++;
  }
  strokes(out, counter, {
    rng, n: 900,
    sample: rej(-10, 364, 810, 512, (x, y) => y > landTop(x) - 1),
    dir: (x, y) => { const [vx, vy] = curlV(x, y, 167, 60); return Math.atan2(vy * 0.8 - 0.1, Math.abs(vx) + 0.7); },
    col: (x, y, r) => {
      const depth = (y - 364) / (H - 364);
      let c = ramp(['#2c7a4a', '#3f8a3a', '#5ea83e', '#86c44a', '#bcd862'], 0.1 + fbm(x / 60, y / 60, 341) * 0.85 + depth * 0.3);
      c = mix(c, GOLD_DEEP, lightAt(x, y) * 0.5);   // warming gold where the new light falls
      return jig(c, r, 12);
    },
    len: 16, lw: 3.6, steps: 3, lenJ: 0.55, wild: 0.16, impasto: 0.7,
  });
  // the shore fringe where land meets water — ragged grass tufts, organic seam
  E.horizonFringe(out, counter, rng, { horizonFn: landTop, x0: -10, x1: 810, cols: ['#2c7a4a', '#3f8a3a', '#5ea83e', '#86c44a'], hMax: 18, lightFn: lightAt, seed: 343 });
  // FLOURISHING — the third day's herb and fruit burst across the new shore
  // (Gen 1:11, "let the earth bring forth grass... the fruit tree yielding fruit")
  E.groundFlowers(out, counter, rng, {
    x0: -6, y0: 382, x1: 812, y1: 510, n: 520,
    lightFn: lightAt,
    depthFn: (x, y) => (y - 364) / (510 - 364),
  });
  // one more fruit tree so the shore reads ABUNDANT, not lawn (Gen 1:11-12)
  E.fruitTree(out, counter, rng, 580, 466, 56, 26, E.LEAF_PALETTES[0], lightAt);
  fgRanges.push([_fgLand, out.length]);   // ← the near shore + its first life are foreground

  /* ---------------- DISTANT NEW HILLS — the far horizon of the made world [FAR plane] ---------------- */
  const _far = out.length;
  E.distantHills(out, counter, rng, { topFn: E.ridge(seaY, { amp: 22, freq: 200, bumps: 0.5, seed: 2 }), horizonFn: seaY, cols: ['#5a9ad0', '#6aa8b8', '#7ab488'], depth: 40, lightFn: lightAt, seed: 2 });
  farRanges.push([_far, out.length]);

  // the first fruit-trees of the made world, planted on the new shore (Gen 1:11)
  // [these grow in the FG land, so they stay with it]
  const _fgTrees = out.length;
  E.fruitTree(out, counter, rng, 92, 470, 64, 30, E.LEAF_PALETTES[1], lightAt);
  E.fruitTree(out, counter, rng, 716, 478, 68, 32, E.LEAF_PALETTES[3], lightAt);
  E.fruitTree(out, counter, rng, 150, 452, 46, 22, E.LEAF_PALETTES[4], lightAt);
  fgRanges.push([_fgTrees, out.length]);

  // HIDDEN EGG — Genesis 1:3 in the ORIGINAL HEBREW numerals, cut faint into the
  // new shore, lower-left. Gen 1:3: "And God said, Let there be light: and there
  // was light." The verse that makes the whole plate.
  E.inscriptionText(out, E.hebrewRef(1, 3), { x: 200, y: 462, h: 15, body: '#1a3a1e', edge: '#eafbe0', op: 0.82, edgeOp: 0.55 });

  // MULTIPLANE: assemble the requested depth plane. Each is its own cel —
  // transparent where it has no content — so they stack and parallax apart.
  const ALT = 'The first morning of creation: a brilliant rising light low over a great gathered sea that swirls blue-green and gold beneath it, under a radiant dawn sky of blue, rose and gold with birds rising; fresh green new land bursts with the first wildflowers and jewel-coloured fruit trees along the near shore. The world, newly made, and the light that made it — and it was good. Hidden faint in the shore is the Hebrew reference for Genesis 1:3, "Let there be light."';
  const RAW = { undercoat: 0, weave: 0, varnish: 0, oil: 0 };   // no baked surface — the live filter unifies the planes
  const setOf = ranges => { const s = new Set(); for (const [a, b] of ranges) for (let i = a; i < b; i++) s.add(i); return s; };
  const pick = ranges => ranges.map(([a, b]) => out.slice(a, b).join('\n')).join('\n');
  const farSet = setOf(farRanges), fgSet = setOf(fgRanges);
  if (LAYER === 'sky') return svgWrap(ALT, out.slice(0, skyEnd).join('\n'), RAW);   // dawn-sky ground (opaque)
  const sm = LAYER.match(/^sky(\d+)$/);
  if (sm) return svgWrap(ALT, '<g>' + skySheets[+sm[1] - 1] + '</g>', RAW);         // one sky-swirl sheet
  if (LAYER === 'far') return svgWrap(ALT, pick(farRanges), RAW);                   // distant new hills
  if (LAYER === 'fg') return svgWrap(ALT, pick(fgRanges), RAW);                     // near shore + first life
  if (LAYER === 'mid') {                                                            // the gathered waters + swirling light
    const body = out.filter((_, i) => i >= skyEnd && !farSet.has(i) && !fgSet.has(i)).join('\n');
    return svgWrap(ALT, body, RAW);
  }
  // full painting (desktop): sky ground, the stacked sky-sheets, then everything else
  return svgWrap(ALT, out.slice(0, skyEnd).concat(skySheets, out.slice(skyEnd)).join('\n'));
}
