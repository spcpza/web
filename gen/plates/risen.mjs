// gen/plates/risen.mjs — "He is risen" (the empty tomb)
//
// Dawn on the third day. A low hill, and set in it a great cave — the tomb.
// The huge round stone has been ROLLED CLEAR of the mouth. The grave is
// empty: where a body should lie, LIGHT pours out instead, streaming across
// the waking sky. The Light did not stay dead.
//
//   "And that he rose again the third day according to the scriptures."
//                                                      — 1 Corinthians 15:4
//
// No black — the dark is deep blue and violet; the dawn is gold, rose, blue.
// Light: the tomb mouth itself is the source, answered by the rising sun.
export const name = 'risen';
export const title = 'He is risen';
export const caption = 'The grave could not hold the Light.';
export const seed = 20263004;
export const focal = { x: 392, y: 300 }; // portrait window: the open tomb pouring light
// MOBILE 3D — depth planes (FAR→NEAR): the dawn sky + rising sun behind; the
// hill, the empty tomb, the rolled stone and the rays of light in the middle (the
// rays anchor to the tomb, so they stay with it); the fruit-trees nearest. A hill
// fringe textures the sky↔hill seam.
// stacked SKY-SWIRL SHEETS — paint on paint, gapped, each its own depth plane
export const SKY_SHEETS = [
  { n: 158, len: 22, lw: 9.1, lift: 0.00 },
  { n: 173, len: 20, lw: 8.4, lift: 0.07 },
];
export const layers = [
  { name: 'sky', opaque: true },  // smooth dawn-sky ground + sun (backmost, opaque)
  ...SKY_SHEETS.map((_, i) => ({ name: 'sky' + (i + 1) })),   // stacked sky-swirl sheets
  { name: 'far' },                // distant rolling hills (the moving horizon)
  { name: 'mid' },                // hill, empty tomb, rays, PLANTED fruit-trees
  { name: 'near' },               // THE STONE — a near foreground boulder, rolled clear (John 20:1)
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
  // MOBILE 3D LAYERS: tag ranges per band; MID = the hill + tomb + rays.
  const LAYER = opts.layer || 'full';
  const farRanges = [], nearRanges = [];
  out.push(`<rect width="${W}" height="${H}" fill="#241e52"/>`);   // deep violet — never black

  // the tomb mouth — the plate's one light — answered by the dawn above it
  const TX = 392, TY = 322;
  const tomb = lightRadial(TX, TY, 300);
  const dawnC = { x: 392, y: 150 };
  const dawn = lightRadial(dawnC.x, dawnC.y, 320);
  const lightAt = (x, y) => Math.min(1, tomb(x, y) * 1.15 + dawn(x, y) * 0.6);
  const horizon = x => 296 + 7 * Math.sin(x / 150) + (x - 400) * 0.01;

  /* ---------------- 1. DAWN SKY — light swirling loose ----------------
     the sky is nature, so it swirls (Munch) — but this is GLORY, not storm:
     a GENTLE radiant turn out of the rising sun, over a bright dawn that streams
     upward. A luminous gradient underpaints the sky so every gap glows (no dark
     violet showing through) — the Light breaking free of the grave. */
  out.push(`<defs><linearGradient id="dawn30" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#8fb8e8"/>
<stop offset="0.42" stop-color="#8f8cc8"/>
<stop offset="0.68" stop-color="#c290ad"/>
<stop offset="0.88" stop-color="#e6a868"/>
<stop offset="1" stop-color="#f4c86a"/>
</linearGradient></defs>`);
  out.push(`<rect x="-12" y="-12" width="${W + 24}" height="324" fill="url(#dawn30)"/>`);
  counter.n += 1;
  // THE ALIVE DAWN (the fractal sky — motion at three scales): the whole waking
  // sky WHEELS in one great spiral around the risen Light (macro), a few eddies
  // turn inside the wheel (mid), and every stroke curves with its parent current
  // (micro). The rising sun still spirals radiant at its core, and the tomb below
  // still bursts its rays across the sky — radiance AND swirl together, as in
  // Starry Night. Swirls within swirls: the dawn is deep moving water, waking.
  const EDDIES = [[210, 92, -64], [572, 96, 62], [648, 208, -56], [140, 202, 52]];
  const skyDir = (x, y) => {
    let vx = 8, vy = -2;   // a faint up-and-out drift beneath the wheel (the light rising)
    { const [a, b] = goldenSpiralV(x, y, 392, 210, 118, 275); vx += a; vy += b; }   // the great wheel of the dawn, on the tomb-burst axis
    { const [a, b] = goldenSpiralV(x, y, 392, 150, 70, 90); vx += a; vy += b; }      // the rising sun still spirals radiant at its core
    for (const [ex, ey, s] of EDDIES) { const [a, b] = goldenSpiralV(x, y, ex, ey, s, 82); vx += a; vy += b; }   // eddies turning inside the wheel
    const [c, d] = curlV(x, y, 31, 120); vx += c * 26; vy += d * 26;                 // fine turbulence — every stroke curves with its parent current
    return Math.atan2(vy, vx);
  };
  const EGLOW = [[210, 92, '#c290ad'], [572, 96, '#e6a868'], [648, 208, '#8f8cc8'], [140, 202, '#c8a0b8']];   // dawn jewels at the eddy cores: rose / gold / violet
  const skyCol = (x, y, r, lift) => {
    const t = Math.max(0, Math.min(1, 0.05 + (y / 300) * 0.5 + fbm(x / 130, y / 120, 11) * 0.28));
    let c = ramp(['#8fb8e8', '#7a9ad8', '#8a82c4', '#c290ad', '#e6a868', '#f4c86a'], t); // blue high → rose → gold low
    for (const [ex, ey, ec] of EGLOW) { const d2 = Math.hypot(x - ex, y - ey); c = mix(c, ec, Math.exp(-d2 / 95) * 0.5); }   // the eddy cores breathe faint dawn-jewel light
    c = mix(c, GOLD_PALE, dawn(x, y) * 0.6);
    if (lift) c = mix(c, '#ffffff', lift);
    return jig(c, r, 7);
  };
  // the smooth dawn-sky GROUND — broad soft masses (opaque base); the swirling
  // brushwork lives in the stacked sheets above, so their gaps reveal paint
  strokes(out, counter, { rng, n: 320, sample: rej(-12, -12, 812, 312, (x, y) => y < horizon(x) + 8), dir: skyDir, col: (x, y, r) => skyCol(x, y, r, 0), len: 44, lw: 9.5, steps: 4, follow: 0.91, wild: 0.05, lenJ: 0.5, impasto: 0.5 });
  // VAN GOGH ARMS — streaming light: long curling filaments riding the dawn,
  // bright (rose into gold) so they read as glory pouring up, not night turbulence.
  strokes(out, counter, {
    rng, n: 210,
    sample: rej(-12, -12, 812, 300, (x, y) => y < horizon(x) + 2),
    dir: skyDir,
    col: (x, y, r) => jig(mix(mix('#bcd2f2', '#f0cdd2', Math.min(1, y / 220)), GOLD_PALE, Math.min(0.8, 0.2 + lightAt(x, y) * 0.8)), r, 6),
    len: 48, lw: 2, steps: 6, follow: 0.96, wild: 0.02, lenJ: 0.5, relief: 0,
  });
  // the rising sun's small radiant core, high
  strokes(out, counter, {
    rng, n: 80, sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 0.8) * 30; return [dawnC.x + Math.cos(a) * d, dawnC.y + Math.sin(a) * d]; },
    dir: () => 0.2, col: (x, y, r) => jig(mix(GOLD_HOT, GOLD_PALE, Math.hypot(x - dawnC.x, y - dawnC.y) / 30), r, 5), len: 7, lw: 3, steps: 2, impasto: 0.5,
  });
  const skyEnd = out.length;   // the smooth dawn-sky ground is the SKY plane (opaque)
  // the stacked SKY-SWIRL SHEETS — each an independent bold, gapped pass of the
  // dawn's gentle turn (paint on paint), own rng per sheet.
  const skySheets = SKY_SHEETS.map((e, k) => {
    const srng = mulberry32(seed + 1009 * (k + 1));
    const sh = [];
    strokes(sh, { n: 0 }, {
      rng: srng, n: e.n, sample: rej(-12, -12, 812, 312, (x, y) => y < horizon(x) + 8),
      dir: skyDir, col: (x, y, r) => skyCol(x, y, r, e.lift),
      len: e.len, lw: e.lw, steps: 5, follow: 0.9, wild: 0.2, lenJ: 0.55, impasto: 0.6, relief: 0.5,
    });
    return sh.join('\n');
  });

  /* ---------------- 2. THE HILL ---------------- */
  // a green-blue rise, warming gold toward the tomb's glow
  strokes(out, counter, {
    rng, n: 720,
    sample: rej(-12, 286, 812, 512, (x, y) => y > horizon(x) - 4),
    dir: (x, y) => 0.04 + (fbm(x / 70, y / 50, 27) - 0.5) * 0.5,
    col: (x, y, r) => jig(mix(ramp(['#2a4a64', '#2f5a54', '#3a6a50', '#4a7e52'], fbm(x / 80, y / 50, 29)), GOLD_DEEP, lightAt(x, y) * 0.85), r, 8),
    len: 16, lw: 5.4, steps: 2, follow: 0.95, wild: 0.05, lenJ: 0.45, relief: 0.6,
  });

  /* ---------------- 3. THE EMPTY TOMB ---------------- */
  // a great cave in the hill — and LIGHT pours out of the open mouth
  {
    const cw = 64, ch = 92, cy = TY + 18;
    // the glow spilled out across the hill around the mouth
    strokes(out, counter, {
      rng, n: 280,
      sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 0.75) * 130; return [TX + Math.cos(a) * d, cy + Math.sin(a) * d * 0.8]; },
      dir: () => -Math.PI / 2,
      col: (x, y, r) => jig(ramp([GOLD_HOT, GOLD_PALE, GOLD, GOLD_DEEP, '#8a6a40'], Math.hypot(x - TX, (y - cy) / 0.8) / 130), r, 8),
      len: 12, lw: 3.2, steps: 2, impasto: 0.5,
    });
    // the dark mouth of the tomb (empty)
    out.push(`<path d="M${R1(TX - cw)} ${R1(cy + ch * 0.5)}Q${R1(TX - cw)} ${R1(cy - ch)} ${TX} ${R1(cy - ch)}Q${R1(TX + cw)} ${R1(cy - ch)} ${R1(TX + cw)} ${R1(cy + ch * 0.5)}Z" fill="#1a1640"/>`);
    counter.n++;
    // brilliant light bursting from inside — He is not here
    strokes(out, counter, {
      rng, n: 200,
      sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 0.6) * 54; return [TX + Math.cos(a) * d * 0.9, cy - ch * 0.25 + Math.sin(a) * d]; },
      dir: () => -Math.PI / 2,
      col: (x, y, r) => jig(mix(GOLD_HOT, GOLD_PALE, Math.hypot(x - TX, y - (cy - ch * 0.25)) / 54), r, 5),
      len: 8, lw: 2.4, steps: 2, impasto: 0.55,
    });
    // the folded grave-cloth, left behind — a small fold of white, lit
    paintPath(out, counter, rng, [[TX - 14, cy + 14], [TX + 2, cy + 10], [TX + 16, cy + 15]],
      (x, y, r) => jig(mix('#f4ecd8', GOLD_PALE, r() * 0.4), r, 6), { lw: 3, len: 4, density: 0.9, jitter: 0.5 });
  }

  /* ---------------- 4. THE STONE — rolled clear, on its OWN NEAR plane ----------------
     "And she ... seeth the stone taken away from the sepulchre" (John 20:1). The great
     round stone is the NEAREST plane — a foreground boulder rolled clear of the mouth,
     half across the spilling light. As the reader TILTS to look in (John 20:11, "she
     stooped down, and looked into the sepulchre"), the stone rolls further aside and
     more of the tomb-light floods past it. Our medium enacts what a flat canvas froze. */
  const sx = TX + 118, sy = horizon(TX + 118) + 76;
  {
    const _near = out.length;
    strokes(out, counter, {
      rng, n: 150,
      sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 0.7) * 40; return [sx + Math.cos(a) * d, sy + Math.sin(a) * d * 0.92]; },
      dir: (x, y) => Math.atan2(y - sy, x - sx) + Math.PI / 2,
      col: (x, y, r) => {
        const g = lightAt(x, y);
        return jig(mix(ramp(['#3a3a64', '#4a4870', '#5e5a82'], fbm(x / 30, y / 30, 41)), GOLD_DEEP, g * 0.7), r, 7);
      },
      len: 9, lw: 3, steps: 2, relief: 0.7,
    });
    nearRanges.push([_near, out.length]);   // ← the stone is the near foreground plane
  }
  // a curved drag-track in the grass behind it — it was rolled, not lifted (stays in the hill/MID)
  paintPath(out, counter, rng, [[TX + 56, sy + 6], [sx - 38, sy + 12], [sx - 12, sy + 8]],
    (x, y, r) => jig(mix('#3a5a48', GOLD_DEEP, lightAt(x, y) * 0.5), r, 8), { lw: 2.4, len: 5, density: 0.6, jitter: 1.0 });

  /* ---------------- BACKGROUND LIFE — birds rising into the dawn (Matt 6:26) ---------------- */
  for (const [bx, by, s] of [[140, 78, 1], [176, 92, 0.85], [114, 96, 0.8], [664, 88, 0.85], [696, 74, 0.7]]) {
    paintPath(out, counter, rng, [[bx - 6 * s, by + 2.6 * s], [bx, by - 1.8 * s], [bx + 6 * s, by + 2.6 * s]], (x, y, r) => jig('#4a4666', r, 6), { lw: 1.5 * s, len: 3.4, density: 0.9, jitter: 0.5 });
  }

  /* ---------------- 5. RAYS — the LIGHT OF LIFE pours out (John 8:12) ----------------
     "I am the light of the world: he that followeth me shall not walk in
     darkness, but shall have the light of life." A glorious sunburst streams
     from the empty tomb across the whole waking sky — death turned to dawn. */
  strokes(out, counter, {
    rng, n: 210,
    sample: r => { const a = -Math.PI * (0.07 + r() * 0.86); const d = (0.38 + 0.82 * r()) * 232; return [TX + Math.cos(a) * d, TY + Math.sin(a) * d * 0.92]; },
    dir: (x, y) => Math.atan2(y - TY, x - TX),
    col: (x, y, r) => { const d = Math.hypot(x - TX, y - TY); return jig(mix(mix(GOLD_HOT, GOLD_PALE, r()), '#fff7e2', Math.max(0, 1 - d / 210)), r, 7); },
    len: (x, y) => 9 + Math.hypot(x - TX, y - TY) / 13, lw: 1.5, steps: 2, lenJ: 0.7, relief: 0,
  });
  // a few long radiant shafts reaching for the frame edges — faint, glorious
  strokes(out, counter, {
    rng, n: 46,
    sample: r => { const a = -Math.PI * (0.04 + r() * 0.92); const d = 70 + r() * 250; return [TX + Math.cos(a) * d, TY + Math.sin(a) * d * 0.92]; },
    dir: (x, y) => Math.atan2(y - TY, x - TX),
    col: (x, y, r) => jig('#fff3d2', r, 5),
    len: 28, lw: 0.9, steps: 2, lenJ: 0.85, relief: 0,
  });

  /* ---------------- EGG: ΙΧΘΥΣ — the secret sign of JESUS ----------------
     the fish the first believers scratched in the dark: Iēsous CHristos THeou
     Yios Sōtēr — JESUS Christ, Son of God, Saviour. He is risen; the sign is His.
     Two arcs meeting at the nose, crossing at the tail, hidden in the dawn. */
  {
    const fx = 150, fy = 96;
    const fc = (x, y, r) => jig(mix('#7a5224', '#a8742c', r() * 0.6), r, 6);   // bronze, reads on the bright dawn
    paintPath(out, counter, rng, [[fx + 30, fy], [fx + 6, fy - 13], [fx - 24, fy - 3], [fx - 40, fy + 10]], fc, { lw: 2, len: 4.5, density: 0.85, jitter: 0.7 }); // body, over the top → tail
    paintPath(out, counter, rng, [[fx + 30, fy], [fx + 6, fy + 13], [fx - 24, fy + 3], [fx - 40, fy - 10]], fc, { lw: 2, len: 4.5, density: 0.85, jitter: 0.7 }); // body, under → tail (crosses)
    paintPath(out, counter, rng, [[fx + 12, fy - 4], [fx + 13.5, fy - 2.5]], fc, { lw: 1.6, len: 1.8, density: 1, jitter: 0.2 }); // a tiny eye
  }

  // FRUITFUL dawn — the new creation blazes: fruit-trees in crazy free colour
  // on the resurrection hillside (Isa 35:1)  [FG plane]
  // a bright grass FRINGE along the hill crest so the dawn-sky↔hill seam reads
  // organic, not a ruled line (MID — it edges the hill)
  // DISTANT HILLS on their own FAR plane — the rolling skyline parallaxes against
  // both the sky and the hill, so the horizon has real moving depth.
  const _far = out.length;
  E.distantHills(out, counter, rng, { topFn: E.ridge(horizon, { amp: 26, freq: 195, bumps: 0.5, seed: 30 }), horizonFn: horizon, cols: ['#3a6a64', '#4a7e5c', '#6a9a58'], depth: 62, lightFn: lightAt, seed: 30 });
  farRanges.push([_far, out.length]);
  E.horizonFringe(out, counter, rng, { horizonFn: horizon, x0: -10, x1: 810, cols: ['#2f5a54', '#3a6a50', '#4a7e52', '#6a9a58'], hMax: 18, lightFn: lightAt, seed: 304 });
  // resurrection fruit-trees PLANTED in the hill (MID) — base stays with the ground
  E.fruitTree(out, counter, rng, 86, 384, 60, 28, E.LEAF_PALETTES[1], lightAt);
  E.fruitTree(out, counter, rng, 716, 392, 66, 31, E.LEAF_PALETTES[4], lightAt);
  E.fruitTree(out, counter, rng, 150, 356, 44, 21, E.LEAF_PALETTES[3], lightAt);

  // EASTER EGG — the "I AM" of this page in ORIGINAL KOINE GREEK numerals, ΙΑʹ·ΚΕʹ
  // (11, 25), cut faint into the hill, lower-left. John 11:25, "I am the resurrection,
  // and the life: he that believeth in me, though he were dead, yet shall he live."
  E.inscriptionText(out, E.greekRef(11, 25), { x: 312, y: 452, h: 14, body: '#e6ecd6', edge: '#101a26', op: 0.82, edgeOp: 0.55 });

  /* ---------------- 6. THE GARDENER'S GARDEN (John 20:15) ----------------
     "She, supposing him to be the gardener…" — Mary's mistake deserves a garden.
     LILIES blaze white on the resurrection hill (Matt 6:28-29 "consider the
     lilies"; Hos 14:5 "he shall grow as the lily"); BUTTERFLIES — the creature
     that leaves its own grave changed (2 Cor 5:17) — flank the tomb-light; and
     MORNING BIRDS swing low across the waking dawn (Matt 6:26). Appended at
     plate end → all of it lives in the MID plane, planted with the hill.
     (Munch: living things in curved strokes.) */
  {
    // -- a white trumpet-lily cluster: dark leaf pocket, curved stems, flaring heads
    const lily = (lx, ly, s, heads) => {
      // dark foliage pocket behind — the white needs a shadow to blaze against
      strokes(out, counter, {
        rng, n: Math.round(30 * s),
        sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 0.7) * 14 * s; return [lx + Math.cos(a) * d, ly + Math.sin(a) * d * 0.5]; },
        dir: (x, y) => -Math.PI / 2 + (fbm(x / 9, y / 9, 71) - 0.5) * 1.7,
        col: (x, y, r) => jig(mix('#1e4238', '#2f5e46', fbm(x / 12, y / 12, 73)), r, 7),
        len: 8, lw: 2.2, steps: 3, follow: 0.85, wild: 0.15, relief: 0.4,
      });
      for (let i = 0; i < heads; i++) {
        const hx = lx + (i - (heads - 1) / 2) * 9 * s + (rng() - 0.5) * 3;
        const hh = (22 + rng() * 9) * s;
        const lean = (rng() - 0.5) * 6 * s;
        // curved stem
        paintPath(out, counter, rng, [[hx, ly + 2], [hx + lean, ly - hh * 0.55], [hx + lean * 1.6, ly - hh + 2 * s]],
          (x, y, r) => jig(mix('#2f6a46', GOLD_DEEP, lightAt(x, y) * 0.45), r, 6), { lw: 1.6 * s, len: 4, density: 0.9, jitter: 0.4 });
        const tx = hx + lean * 1.6, ty = ly - hh;
        const pc = (x, y, r) => jig(mix('#f8f4e6', GOLD_PALE, lightAt(x, y) * 0.3), r, 4);
        // the trumpet: three white petals flaring up and out
        paintPath(out, counter, rng, [[tx, ty + 2 * s], [tx - 3.8 * s, ty - 5.5 * s]], pc, { lw: 2.5 * s, len: 3, density: 1, jitter: 0.35 });
        paintPath(out, counter, rng, [[tx, ty + 2 * s], [tx + 0.4 * s, ty - 7 * s]], pc, { lw: 2.6 * s, len: 3, density: 1, jitter: 0.35 });
        paintPath(out, counter, rng, [[tx, ty + 2 * s], [tx + 4 * s, ty - 5.5 * s]], pc, { lw: 2.5 * s, len: 3, density: 1, jitter: 0.35 });
        // gold anthers at the throat
        paintPath(out, counter, rng, [[tx - 0.8 * s, ty], [tx + 0.9 * s, ty - 0.8 * s]],
          (x, y, r) => jig(GOLD, r, 5), { lw: 1.3 * s, len: 1.6, density: 1, jitter: 0.2 });
      }
    };
    lily(296, 412, 1.1, 3);   // left of the tomb mouth, catching the spilled gold
    lily(452, 428, 1.05, 3);  // right of the mouth, clear of the rolled stone
    lily(244, 470, 1.5, 3);   // near foreground, bottom-left (portrait window)
    lily(642, 438, 1.3, 3);   // by the right fruit-tree
    lily(176, 430, 1.0, 2);   // under the small left tree

    // -- a butterfly: four bold curved wing-lobes + a dark stitched body
    const butterfly = (bx, by, s, wing, body) => {
      const wc = (x, y, r) => jig(wing, r, 6);
      paintPath(out, counter, rng, [[bx - 1.2 * s, by - 0.5 * s], [bx - 5.5 * s, by - 4.5 * s], [bx - 8 * s, by - 1 * s], [bx - 3.5 * s, by + 0.8 * s]], wc, { lw: 2.4 * s, len: 3, density: 0.95, jitter: 0.4 });
      paintPath(out, counter, rng, [[bx + 1.2 * s, by - 0.5 * s], [bx + 5.5 * s, by - 4.5 * s], [bx + 8 * s, by - 1 * s], [bx + 3.5 * s, by + 0.8 * s]], wc, { lw: 2.4 * s, len: 3, density: 0.95, jitter: 0.4 });
      paintPath(out, counter, rng, [[bx - 1 * s, by + 1 * s], [bx - 4 * s, by + 4 * s], [bx - 1.5 * s, by + 4.8 * s]], wc, { lw: 2 * s, len: 2.5, density: 0.95, jitter: 0.4 });
      paintPath(out, counter, rng, [[bx + 1 * s, by + 1 * s], [bx + 4 * s, by + 4 * s], [bx + 1.5 * s, by + 4.8 * s]], wc, { lw: 2 * s, len: 2.5, density: 0.95, jitter: 0.4 });
      paintPath(out, counter, rng, [[bx, by - 3 * s], [bx + 0.6 * s, by], [bx, by + 3.5 * s]],
        (x, y, r) => jig(body, r, 5), { lw: 1.1 * s, len: 2.5, density: 1, jitter: 0.2 });
    };
    butterfly(306, 372, 1.2, '#d05a72', '#5a2440');  // coral — reads on the gold glow, left
    butterfly(482, 318, 1.35, '#c8404e', '#401830'); // crimson — pops on the green band, upper right of the mouth
    butterfly(248, 392, 1.1, '#f6efe0', '#2f4a3e');  // white — on the dark green hill

    // -- a closer trio of morning birds, low over the dawn (Matt 6:26)
    const bird = (bx, by, s, colr) => paintPath(out, counter, rng,
      [[bx - 6 * s, by + 2.6 * s], [bx, by - 1.8 * s], [bx + 6 * s, by + 2.6 * s]],
      (x, y, r) => jig(colr, r, 6), { lw: 1.5 * s, len: 3.4, density: 0.9, jitter: 0.5 });
    bird(586, 178, 1.5, '#3e3a5e');
    bird(622, 160, 1.15, '#443f62');
    bird(556, 190, 0.95, '#4a4666');
  }

  // MULTIPLANE: assemble the requested depth plane. Each is its own cel —
  // transparent where it has no content — so they stack and parallax apart.
  const ALT = 'Dawn on the third day: a hillside with a great open cave — the empty tomb — its huge round stone rolled clear to the side; instead of a body, brilliant light pours out of the mouth and streams across a gold-and-rose dawn sky. He is risen. Hidden in the dawn is the ICHTHYS fish — the first believers’ secret sign for Jesus.';
  const RAW = { undercoat: 0, weave: 0, varnish: 0, oil: 0 };   // no baked surface — the live filter unifies the planes
  const setOf = ranges => { const s = new Set(); for (const [a, b] of ranges) for (let i = a; i < b; i++) s.add(i); return s; };
  const pick = ranges => ranges.map(([a, b]) => out.slice(a, b).join('\n')).join('\n');
  const farSet = setOf(farRanges), nearSet = setOf(nearRanges);
  if (LAYER === 'sky') return svgWrap(ALT, out.slice(0, skyEnd).join('\n'), RAW);   // smooth dawn-sky ground (opaque)
  const sm = LAYER.match(/^sky(\d+)$/);
  if (sm) return svgWrap(ALT, '<g>' + skySheets[+sm[1] - 1] + '</g>', RAW);         // one sky-swirl sheet
  if (LAYER === 'far') return svgWrap(ALT, pick(farRanges), RAW);                   // distant rolling hills
  if (LAYER === 'near') return svgWrap(ALT, pick(nearRanges), RAW);                 // the rolled stone (nearest)
  if (LAYER === 'mid') {                                                            // hill, tomb, rays, planted trees
    const body = out.filter((_, i) => i >= skyEnd && !farSet.has(i) && !nearSet.has(i)).join('\n');
    return svgWrap(ALT, body, RAW);
  }
  // full painting (desktop): sky ground, the stacked sky-sheets, then everything else
  return svgWrap(ALT, out.slice(0, skyEnd).concat(skySheets, out.slice(skyEnd)).join('\n'));
}
