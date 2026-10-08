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
// ⭐ DETAIL PASS (Sep 8) — the SKY only (the sown field is settled: "seeds: rows + boil").
// Finer sheets, every stroke its own width and length (free hashes, no rule — see
// widthOf/lengthOf in paint()), and every drawing of the ring a DIFFERENT PAINTING of the
// sky (sheet rng salted by the frame, displacement 0) — never the same marks nudged.
export const SKY_SHEETS = [
  { n: 640, len: 28, lw: 3.4, lift: 0.00 },
  { n: 700, len: 25, lw: 3.1, lift: 0.07 },
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
  // ⭐ EVERY STROKE DRAWS ITS OWN WIDTH AND LENGTH (Fred: "use no rules, a paint stroke
  // just exist because it exist") — two independent hashes per mark, no field, no coupling.
  const free = (x, y, salt) => { const n = Math.sin(x * 12.9898 + y * 78.233 + salt) * 43758.5453; return n - Math.floor(n); };
  const widthOf  = (x, y, salt) => 0.40 + 3.2 * Math.pow(free(x, y, salt), 2.6);
  const lengthOf = (x, y, salt) => 0.40 + 1.5 * Math.pow(free(x, y, salt + 17), 1.5);
  const FR = (globalThis.__FRAME | 0);

  /* ---------------- 1. SKY FIELD ---------------- */
  // POST-RESURRECTION: the new life is a VIBRANT, joyful day — happy light blue
  // and pink; the sower is a small dark figure planting in the colour.
  out.push(`<rect width="${W}" height="${H}" fill="#6ecaf7"/>`);

  const SUN = { x: 186, y: 112, r: 54 };          // the ONE light source — morning, upper-left
  const light = lightRadial(SUN.x, SUN.y, 270);
  // ⚠ THE FIELD IS THE SUBJECT AND IT ONLY HAD A THIRD OF THE PICTURE. At 308 the sky
  // took 62% of the frame on a page whose sentence is about what grew in the ground. Lifted,
  // and given a second slower wave so the skyline actually rolls instead of ruling across.
  const horizon = x => 254 + 15 * Math.sin(x / 168 + 1.2) + 9 * Math.sin(x / 61 + 0.4) + x * 0.010;

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
    rng, n: 1300, sample: skySample,
    dir: skyDir, col: (x, y, r) => skyCol(x, y, r, 0),
    len: (x, y) => 30 * lengthOf(x, y, 11), lw: (x, y) => 4.6 * widthOf(x, y, 13), steps: 4, follow: 0.91, wild: 0.05, aJ: skySlash, lenJ: 0.3, wJ: 0.3, relief: 0.4,   // ⚠ relief was the default 1 — slabs
  });
  const skyGroundEnd = out.length;   // the smooth sky ground (the sun is drawn over it below)

  /* ---------------- 2. THE SUN ---------------- */
  // long leaning rays under the disk — a spiral, not spokes
  strokes(out, counter, {
    rng, n: 900,
    sample: r => { const a = r() * Math.PI * 2, d = SUN.r + 6 + Math.pow(r(), 1.35) * 150; return [SUN.x + Math.cos(a) * d, SUN.y + Math.sin(a) * d]; },
    dir: (x, y) => Math.atan2(y - SUN.y, x - SUN.x) + 0.55,
    col: (x, y, r) => {
      const d = Math.hypot(x - SUN.x, y - SUN.y);
      if (r() < 0.04 && d > SUN.r + 115) return jig('#6b54a8', r, 14);
      return jig(ramp([GOLD_PALE, GOLD, GOLD_DEEP, '#9a8440', '#6b7060'], (d - SUN.r) / 158), r, 8);
    },
    len: (x, y) => 24 * lengthOf(x, y, 21), lw: (x, y) => 2.0 * widthOf(x, y, 23), steps: 3, follow: 0.95, wild: 0.06, lenJ: 0.3, wJ: 0.3, relief: 0.4,
  });
  // concentric ray-swirl rings
  strokes(out, counter, {
    rng, n: 560,
    sample: r => { const a = r() * Math.PI * 2, d = SUN.r + 2 + r() * 32; return [SUN.x + Math.cos(a) * d, SUN.y + Math.sin(a) * d]; },
    dir: (x, y) => Math.atan2(y - SUN.y, x - SUN.x) + Math.PI / 2 + 0.12,
    col: (x, y, r) => jig(ramp([GOLD_HOT, GOLD_PALE, GOLD], (Math.hypot(x - SUN.x, y - SUN.y) - SUN.r) / 34), r, 8),
    len: (x, y) => 12 * lengthOf(x, y, 31), lw: (x, y) => 1.7 * widthOf(x, y, 33), steps: 3, follow: 0.95, lenJ: 0.3, wJ: 0.3, relief: 0.4,
  });
  // a soft dark CONTRAST ring at the sun's rim, so its brightness pops (drawn
  // under the disk core, which paints over the inner edge)
  lightEdge(out, counter, SUN.x, SUN.y, SUN.r);
  // dense bright disk core
  strokes(out, counter, {
    rng, n: 600,
    sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 0.7) * SUN.r; return [SUN.x + Math.cos(a) * d, SUN.y + Math.sin(a) * d]; },
    dir: (x, y) => Math.atan2(y - SUN.y, x - SUN.x) + Math.PI / 2,
    col: (x, y, r) => jig(ramp(['#fffdf0', GOLD_HOT, GOLD_PALE, GOLD], Math.hypot(x - SUN.x, y - SUN.y) / SUN.r), r, 6),
    len: (x, y) => 10 * lengthOf(x, y, 41), lw: (x, y) => 1.9 * widthOf(x, y, 43), steps: 2, wJ: 0.3, lenJ: 0.3, relief: 0.35,
  });
  const skyEnd = out.length;   // sky ground + the morning sun → the opaque SKY plane
  // the stacked SKY-SWIRL SHEETS — each an independent bold, gapped pass of the
  // sun-vortex (paint on paint), own rng per sheet; woven over the ground, under the sun.
  const skySheets = SKY_SHEETS.map((e, k) => {
    // ⚠ softer, with intent (Fred): the SAME sheet in every drawing; what travels is a swell
    // going ROUND the great wheel (length swells with a phase set by the angle around it),
    // so across the ring the sky turns — one motion, no churn.
    const srng = mulberry32(seed + 1009 * (k + 1));
    const _NFw = Math.max(1, globalThis.__FRAME_N || 6), _PHw = FR / _NFw;
    const turn = (x, y) => 1 + 0.10 * Math.cos(2 * Math.PI * (_PHw - Math.atan2(y - WHEEL.y, x - WHEEL.x) / (2 * Math.PI)));
    const sh = [];
    strokes(sh, { n: 0 }, {
      rng: srng, n: e.n, sample: skySample,
      dir: skyDir, col: (x, y, r) => skyCol(x, y, r, e.lift),
      len: (x, y) => e.len * lengthOf(x, y, 51 + k) * turn(x, y), lw: (x, y) => e.lw * widthOf(x, y, 57 + k),
      steps: 5, follow: 0.9, wild: 0.12, lenJ: 0.3, wJ: 0.3, impasto: 0.6, relief: 0.4,
    });
    return sh.join('\n');
  });

  /* ---------------- BACKGROUND: the distant hills + their birds (FAR plane) ----------------
     ⚠ MOVED, AND IT WAS A REAL BUG: DESKTOP AND MOBILE WERE SHOWING DIFFERENT PICTURES.
     This block used to run AFTER the field was painted while being tagged into `far`. On
     mobile that is fine — `far` is composited behind `mid` — but the desktop composite
     replays `out` in paint order, so on desktop the hills' filled band painted straight
     over the near field: a flat green slab from the horizon down to y~375 with every row
     and every young plant hidden underneath it. That empty band was the thing that kept
     looking unfixable. Background paints first, in both renderings.
     (`depth` 64 -> 34 as well: at 64 the band reached a third of the way down the field.) */
  const _far = out.length;
  // DISTANT HILLS — a rolling-land silhouette; its undulating skyline is the
  // sky↔field boundary (never a ruled line) and slides against the sky on the pan.
  distantHills(out, counter, rng, { topFn: ridge(horizon, { amp: 26, freq: 190, bumps: 0.5, seed: 121 }), horizonFn: horizon, cols: ['#5f8e5a', '#73a258', '#8fb858'], depth: 34, lightFn: light, seed: 121 });
  for (const [bx, by, s] of [[300, 58, 1], [338, 72, 0.85], [378, 54, 0.9], [620, 78, 0.78]]) {
    paintPath(out, counter, rng, [[bx - 6 * s, by + 2.6 * s], [bx, by - 1.8 * s], [bx + 6 * s, by + 2.6 * s]], (x, y, r) => jig('#34364a', r, 6), { lw: 1.5 * s, len: 3.4, density: 0.9, jitter: 0.5 });
  }
  farRanges.push([_far, out.length]);   // ← distant hills + birds (FAR plane)

  /* ══ 3 · THE SOWN FIELD — ROWS, AND GROWTH ALONG THEM ═══════════════════════
     ⚠ THE PAGE'S SENTENCE IS "Everything you planted grew. Everything you watered came
     into flower" (John 15:5, "he that abideth in me... bringeth forth much fruit"), and
     the old field did not say it: there were no rows at all, only scattered sprouts and
     240 confetti blooms over a muddy dark pass, so the one thing the picture was about —
     GROWTH — was nowhere in it.
     Now the field is sown in real rows running back to a vanishing point on the sun's
     side, and MATURITY IS A FUNCTION OF DEPTH: bare furrow and first shoots at the
     horizon, leaf and bud through the middle, full flower and fruit at the reader's feet.
     You read the whole life of the planting in one look, from the far edge to your own
     toes. Rows are the one MADE thing here so they run straight (Munch); everything
     growing out of them curves. */
  const CHILD = [330, 410]; // where the sower kneels (CAST1[20] draws him; DEBAKE skips the baked one)
  const ROCK = [592, 436];  // the seedless rock, out along a row
  const VP = { x: 236, y: horizon(236) - 6 };      // the rows converge toward the light
  // ⚠ 52 WAS TOO FINE TO SEE. In the middle distance the perspective squeezes the rows
  // to ten pixels and the furrow banding averaged straight out — the field came back a
  // flat green sheet again, which was the whole fault being fixed.
  const ROWW = 78;                                  // row spacing at the reader's feet
  const BOT = H + 46;
  // which row a point sits on, and where across it — the whole field's structure in one
  // cheap function: cast the point back to the bottom edge along its own ray from the VP.
  const rowAt = (x, y) => {
    const dy = y - VP.y; if (dy < 4) return null;
    const xb = VP.x + (x - VP.x) * (BOT - VP.y) / dy;
    const u = xb / ROWW;
    return { i: Math.floor(u), across: u - Math.floor(u), xb };
  };
  const rowDir = (x, y) => Math.atan2(y - VP.y, x - VP.x);
  const groundDir = (x, y) => {                     // still used by the sower's light pool
    const [c, d] = curlV(x, y, 34, 90);
    const a = rowDir(x, y);
    return Math.atan2(Math.sin(a) + d * 0.22, Math.cos(a) + c * 0.22);
  };
  const depth = y => Math.max(0, Math.min(1, (y - 254) / (H - 254)));
  // ⚠ FORM, NOT DETAIL. The old field had no shape term at all — only fbm noise, the light,
  // and flowers — so however much was drawn on it, it stayed a green sheet with things
  // standing on it. Value has to follow where the ground RISES AND FALLS. (Same fix that
  // turned born's meadow into ground; the measured value spread here already matched gift,
  // which is exactly why the numbers said nothing was wrong.)
  const swellF = (x, y) => fbm(x / 152, y / 70, 317);
  const facingF = (x, y) => { const e = 7;
    return (swellF(x - e, y) - swellF(x + e, y)) * 2.0 + (swellF(x, y - e) - swellF(x, y + e)) * 1.3; };
  const dS = y => 0.34 + 1.0 * depth(y);

  // 1 · the field itself — green on the ridges, warm turned earth in the furrows
  {
    let d = `M-2 ${R1(horizon(-2))}`;
    for (let x = -2; x <= 802; x += 2.4) d += `L${R1(x)} ${R1(horizon(x) + (fbm(x / 3.3, 2.4, 613) - 0.5) * 5)}`;
    d += `L802 ${H + 2}L-2 ${H + 2}Z`;
    out.push(`<path d="${d}" fill="#4e8240"/>`); counter.n++;
  }
  const fieldCol = (x, y, r, lift) => {
    const g = light(x, y);
    const rw = rowAt(x, y);
    // ⚠ the furrow is the DARK of this picture and it must keep its colour — warm turned
    // earth, never the blue-grey mud the old shadow pass laid down over everything.
    const fur = rw ? Math.pow(Math.abs(Math.cos(rw.across * Math.PI)), 1.35) : 0;
    // ⚠ AND THE SUN MUST NOT DRIVE THE VALUE. This page's own hard-won note: a source low
    // toward the horizon MUDS THE FOREGROUND. `light` reaches only ~y382, so carrying it at
    // g*0.5 in the ramp dropped everything nearer the reader to the darkest green — measured,
    // the near field came out DARKER than the middle distance (73.7 against 104.4), which is
    // upside down for a joyful post-resurrection page. Depth and the lie of the land carry
    // the value now; the sun is left to do what a sun does, which is lay gold where it falls.
    let c = ramp(['#2a5c2c', '#356e33', '#45853c', '#5b9e45', '#7cb951', '#a3d165', '#cfe58a'],
      fbm(x / 52, y / 26, 43) * 0.18 + depth(y) * 0.30 + facingF(x, y) * 0.5 + swellF(x, y) * 0.18 + g * 0.22 + lift);
    c = mix(c, ramp(['#553a22', '#6f4e2c', '#8b673c'], fbm(x / 30, y / 14, 47)), fur * 0.85);
    c = mix(c, '#fff0c0', g * 0.42);
    // ⚠ DISTANCE GOES PALE, NOT DARK. With value driven by depth the far field bottomed out
    // into a flat dark green stripe under the horizon — it read as a dead band rather than
    // as young growth a long way off. Air is what separates near from far in a sunlit
    // landscape: the last stretch dissolves toward the sky's own colour.
    const hz = Math.max(0, Math.min(1, 1 - (y - 254) / 74));
    c = mix(c, '#cadfd2', hz * 0.6);
    return jig(c, r, 9);
  };
  strokes(out, counter, {                                     // the body of the field
    rng, n: 3600,
    sample: rej(-10, 300, 810, 512, (x, y) => y > horizon(x) - 1),
    dir: groundDir,
    col: (x, y, r) => fieldCol(x, y, r, 0.02),
    len: (x, y) => 15 * dS(y), lw: (x, y) => 3.6 * dS(y), steps: 3, lenJ: 0.5, impasto: 0.45, relief: 0.3,
  });
  strokes(out, counter, {                                     // blades standing out of it
    rng, n: 2600,
    sample: rej(-10, 312, 810, 512, (x, y) => y > horizon(x) + 3),
    dir: (x, y) => -Math.PI / 2 + (fbm(x / 11, y / 9, 101) - 0.5) * 1.05,
    col: (x, y, r) => fieldCol(x, y, r, 0.2),
    len: (x, y) => 8 * dS(y), lw: (x, y) => 1.1 * dS(y), steps: 2, lenJ: 0.8, impasto: 0.6,
  });

  /* ══ 3b · THE HEDGEROW ALONG THE FAR EDGE ═════════════════════════════════
     ⚠ The strip just under the horizon stayed a flat green slab through three rebuilds:
     by the page's own rule the plants are youngest and smallest there, so the far field
     had nothing in it and read as a dead band between the sky and the blossom. A field
     does not simply stop — it ends at a hedge. This is the mass that band was missing,
     and it puts a real edge on the land instead of a ruled line. */
  {
    const hRng = mulberry32(seed ^ 0x2f9a1c07);
    for (let i = 0; i < 96; i++) {
      const hx = -30 + (i + hRng() * 0.9) / 96 * 872;
      const hy = horizon(hx) + 5 + hRng() * 13;
      E.paintTree(out, counter, hRng, hx, hy, 16 + Math.pow(hRng(), 0.7) * 26, {
        lightFn: light, shadowDir: hx >= SUN.x ? 1 : -1, blossom: hRng() < 0.3 ? 2 : 0,
        tint: (c, x, y) => mix(c, '#cadfd2', 0.34),          // it sits in the same air as the far field
      });
    }
  }

  /* ══ 4 · THE ROCK — not from a seed ════════════════════════════════════════ */
  {
    const [rx, ry] = ROCK;
    strokes(out, counter, {                                   // bare packed earth around it
      rng, n: 150,
      sample: r => { const a2 = r() * Math.PI * 2, dd = 0.35 + Math.pow(r(), 0.7) * 0.65;
                     return [rx + Math.cos(a2) * 46 * dd, ry + Math.sin(a2) * 17 * dd]; },
      dir: rowDir,
      col: (x, y, r) => jig(ramp(['#7a5c38', '#8f7048', '#a2865a'], fbm(x / 20, y / 10, 51)), r, 8),
      len: 10, lw: 2.8, steps: 2, lenJ: 0.6, impasto: 0.4,
    });
    strokes(out, counter, {                                   // the stone: grey, cool, hard
      rng, n: 210,
      sample: r => { const a2 = r() * Math.PI * 2, dd = Math.pow(r(), 0.55);
                     return [rx + Math.cos(a2) * 22 * dd, ry - 5 + Math.sin(a2) * 13 * dd]; },
      dir: () => 0.2,
      col: (x, y, r) => {
        const up = Math.max(0, (ry - 5 - y) / 13);
        return jig(ramp(['#4a4c54', '#5e6068', '#787a82', '#9a9ca2', '#b8bac0'], up * 0.7 + light(x, y) * 0.5 + r() * 0.16), r, 7);
      },
      len: 7, lw: 3.2, steps: 2, lenJ: 0.5, impasto: 0.6, relief: 0.5,
    });
  }

  /* ══ 5 · WHAT GREW — the same row, at every age ════════════════════════════ */
  // one plant, drawn at maturity `st` (0 = a first shoot, 1 = full flower and fruit)
  // ⚠ ONE COLOUR PER PLANT IS CONFETTI. Picking a palette inside plant() gave every
  // neighbour a different hue and the near field came out as sugar sprinkles — the book's
  // own warning, and the fault the old 240-bloom version had that this was meant to cure.
  // Flowers grow in COLONIES: a stretch of a row is one kind of flower. Deeper jewel pairs
  // too — the pastels read as candy rather than as a field in bloom.
  const PETALS = [['#f0537c', '#c2325c'], ['#ffc247', '#e0942a'], ['#b184ea', '#8557c4'],
                  ['#6fc4f0', '#3d8fd0'], ['#fff6e2', '#efdcc0'], ['#f2603c', '#cc3f24']];
  // ⚠ A GARDEN IS NOT ONE CROP. Every plant being the same shape is why the field could
  // only get richer by getting busier. Each ROW is now its own kind — round heads, a spike
  // of small blooms, drooping bells, a flat umbel of tiny stars — so detail comes from
  // variety instead of from more speckle, and the rows read as rows even before the colour.
  const plant = (x, y, st, sc, pr, pal, inFlower, spec) => {
    const a = Math.atan2(SUN.y - y, SUN.x - x);               // everything leans to the light
    const up = -Math.PI / 2, sa = up + (a - up) * 0.3 + (pr() - 0.5) * 0.18;
    const hgt = (15 + st * 34) * sc;
    const tip = [x + Math.cos(sa) * hgt, y + Math.sin(sa) * hgt];
    paintPath(out, counter, pr, [[x, y], [(x + tip[0]) / 2 + (pr() - 0.5) * 3, (y + tip[1]) / 2], tip],
      (px, py, r) => jig(mix('#3f6f28', '#7aa63a', r() * 0.8 + st * 0.2), r, 8),
      { lw: (1.1 + st * 1.5) * sc, len: 3.5, density: 1, jitter: 0.25 });
    const leaves = 2 + Math.round(st * 3);
    for (let l = 0; l < leaves; l++) {
      const t = 0.25 + (l / leaves) * 0.6, sgn = l % 2 ? 1 : -1;
      const bx = x + (tip[0] - x) * t, by = y + (tip[1] - y) * t;
      const ll = (4 + st * 8) * sc;
      paintPath(out, counter, pr, [[bx, by], [bx + sgn * ll * 0.7, by - ll * 0.34], [bx + sgn * ll, by + ll * 0.1]],
        (px, py, r) => jig(mix('#4a7c2c', '#9ac24a', r()), r, 9),
        { lw: (1.4 + st * 1.2) * sc, len: 3, density: 1, jitter: 0.3 });
    }
    // ⚠ A THRESHOLD MAKES A BAND. At st>0.42 the flowers switched on across one line of
    // depth and the field read as bare green above / solid blossom below, with a seam. Buds
    // start much earlier and open slowly, so the growth is a GRADIENT you travel through.
    if (inFlower && st > 0.26) {                              // buds, then open flowers
      const open = Math.max(0, (st - 0.26) / 0.74);
      const bud = (bx2, by2, rr) => { E.daub(out, counter, bx2, by2, rr, jig(mix(pal[1], '#5f8a3a', 0.45), pr, 7), pr); };
      const head = (hx, hy, rr, np) => {
        for (let k = 0; k < np; k++) {
          const aa = k * (6.2832 / np) + pr() * 0.3;
          const px2 = hx + Math.cos(aa) * rr, py2 = hy + Math.sin(aa) * rr * 0.85;
          out.push(`<ellipse cx="${R1(px2)}" cy="${R1(py2)}" rx="${R1(rr * 0.85)}" ry="${R1(rr * 0.6)}" transform="rotate(${R1(aa * 57)} ${R1(px2)} ${R1(py2)})" fill="${jig(pal[pr() < 0.5 ? 0 : 1], pr, 10)}" opacity="0.95"/>`); counter.n++;
        }
        out.push(`<circle cx="${R1(hx)}" cy="${R1(hy)}" r="${R1(rr * 0.42)}" fill="${jig('#ffe6a0', pr, 8)}"/>`); counter.n++;
      };
      const rr0 = (1.5 + open * 2.6) * sc;
      if (spec === 1) {                                       // a SPIKE of small blooms
        const n2 = 3 + Math.round(open * 4);
        for (let k = 0; k < n2; k++) {
          const t2 = 0.42 + (k / n2) * 0.66;
          const sx2 = x + (tip[0] - x) * t2 + (pr() - 0.5) * 2.4 * sc;
          const sy2 = y + (tip[1] - y) * t2;
          if (open < 0.3) bud(sx2, sy2, rr0 * 0.6); else head(sx2, sy2, rr0 * 0.62, 5);
        }
      } else if (spec === 2) {                                // drooping BELLS
        const n2 = 2 + Math.round(open * 2);
        for (let k = 0; k < n2; k++) {
          const bx2 = tip[0] + (k - (n2 - 1) / 2) * 3.4 * sc, by2 = tip[1] + 1.6 * sc;
          out.push(`<ellipse cx="${R1(bx2)}" cy="${R1(by2 + rr0 * 0.5)}" rx="${R1(rr0 * 0.72)}" ry="${R1(rr0 * 1.05)}" fill="${jig(pal[pr() < 0.5 ? 0 : 1], pr, 10)}" opacity="0.95"/>`); counter.n++;
          paintPath(out, counter, pr, [[bx2, by2 - rr0 * 0.6], [bx2, by2 + rr0 * 0.2]],
            (px3, py3, r) => jig('#5f8a3a', r, 7), { lw: 0.7 * sc, len: 2, density: 1, jitter: 0.2 });
        }
      } else if (spec === 3) {                                // a flat UMBEL of tiny stars
        const n2 = 5 + Math.round(open * 7);
        for (let k = 0; k < n2; k++) {
          const aa = pr() * 6.2832, dd = Math.pow(pr(), 0.5) * rr0 * 1.5;
          E.daub(out, counter, tip[0] + Math.cos(aa) * dd, tip[1] + Math.sin(aa) * dd * 0.5,
                 rr0 * 0.34, jig(pal[pr() < 0.5 ? 0 : 1], pr, 10), pr);
        }
      } else {                                                // round heads (the original)
        const heads = 1 + Math.round(open * 2);
        for (let hh = 0; hh < heads; hh++) {
          const hx = tip[0] + (pr() - 0.5) * 7 * sc, hy = tip[1] + (pr() - 0.5) * 5 * sc - hh * 3 * sc;
          if (open < 0.3) bud(hx, hy, rr0); else head(hx, hy, rr0, 6);
        }
      }
    }
  };
  // sow them ALONG the rows, so the field reads as planted rather than sprinkled
  {
    // ⚠⚠ ROWS CONVERGE, SO WALKING THE ROWS CANNOT FILL THE FIELD. Fred: "right side is
    // empty." Measured on the render, detail density in the far right fell to 4.1 against
    // 15-19 everywhere else — and widening the row INDEX range (which I had already tried
    // once) can never fix it, because the failure is geometric. Every row passes through
    // the vanishing point, so at the far end of the field ALL of them are squeezed into a
    // narrow wedge around it: at y=270 the whole planting, however many rows are generated,
    // lands between x=167 and x=342. The rest of the far field is empty by construction.
    //
    // So the loop is turned inside out. Instead of walking each row and drawing where it
    // goes, sample the VISIBLE GROUND evenly and snap each sample sideways onto the ridge
    // of whatever row it fell in. Coverage is then guaranteed across the full width at
    // every depth, while every plant still stands in a row. Sampling is biased toward the
    // horizon (pow 1.45) because a far plant covers a fraction of the ground a near one
    // does, so evenness on screen needs many more of them up there.
    const pRng = mulberry32(seed ^ 0x5bd1e995);
    for (let k = 0; k < 4200; k++) {
      const py = VP.y + Math.pow(pRng(), 1.45) * (514 - VP.y);
      const sx = -34 + pRng() * 868;
      if (py < horizon(sx) + 5 || py > 514) continue;
      const rw = rowAt(sx, py); if (!rw) continue;
      const ridgeXb = (rw.i + 0.5) * ROWW;                    // the crown of that row
      const px = VP.x + (ridgeXb - VP.x) * (py - VP.y) / (BOT - VP.y);
      if (px < -18 || px > 818) continue;
      if (Math.hypot((px - ROCK[0]) / 1.6, py - ROCK[1]) < 40) continue;   // the rock stays barren
      // ⚠ HE NEEDS GROUND TO PLANT INTO. A sower kneels on WORKED earth, and that bareness
      // is what makes the one gesture the page exists for legible. Keep in step with
      // CAST1[20] (x346 y418 h76) and with the turned-earth patch in section 7.
      if (Math.hypot((px - 342) / 72, (py - 414) / 42) < 1) continue;
      // ⚠ MATURITY FROM DEPTH: the idea of the page. Jittered so the change of age is
      // organic rather than a clean line of blossom ruled across the field.
      const st = Math.max(0, Math.min(1, Math.pow(depth(py), 0.72) + (pRng() - 0.5) * 0.16));
      const seg = Math.floor(((py - VP.y) / (BOT - VP.y)) * 3.2);   // a stretch of one row = one flower
      const pal = PETALS[Math.abs(rw.i * 73 + seg * 29) % PETALS.length];
      const inFlower = pRng() < 0.16 + st * 0.46;
      plant(px + (pRng() - 0.5) * 6, py, st, (0.52 + dS(py) * 0.9) * (0.78 + pRng() * 0.44),
            pRng, pal, inFlower, Math.abs(rw.i * 17 + 3) % 4);
    }
  }

  /* ---------------- 6. EASTER EGGS ---------------- */
  // egg: Galatians 6:7 ("whatsoever a man soweth, that shall he also reap") in
  // ORIGINAL KOINE GREEK numerals, Ϛʹ·Ζʹ (Ϛ=6, Ζ=7), hiding in the lower-right furrow.
  {
    // ⚠ A FOURTH-LOOK SECRET, NOT A CAPTION. At h 22 (times the 1.45 inscription scale) in
    // near-white on dark, this read as a signature stamped across the corner on the very
    // first look. Smaller and quieter, set into the busy near rows where the texture can
    // hide it — findable, not announced.
    E.inscriptionText(out, E.greekRef(6, 7), { x: 700, y: 480, h: 10, body: '#2a3a22', edge: '#e8f0d8', op: 0.46, edgeOp: 0.26 });
  }

  /* ---------------- BACKGROUND LIFE + the distant trees + horizon fringe ----------------
     all at/near the horizon → the FAR plane (barely parallaxes). */
  // (the distant hills + their birds now paint BEFORE the field — see just after the
  //  sky sheets above. They are background; they must not cover what grows in front.)
  // the HORIZON FRINGE rises from the field's edge (MID — planted with the field)
  horizonFringe(out, counter, rng, { horizonFn: horizon, x0: -10, x1: 810, cols: ['#3a6a3e', '#4e8240', '#6e9a40', '#9ab048'], hMax: 20, lightFn: light });
  // what the child sowed GREW — fruit-trees rooted across the field, each PLANTED
  // in the MID field so its base stays with the ground (Gal 6:7; Isa 35:1)
  fruitTree(out, counter, rng, 74, 300, 60, 28, LEAF_PALETTES[5], light, 1, { species: 'apple' });   // amber, back-left — an apple (after his kind)
  fruitTree(out, counter, rng, 470, 288, 46, 22, LEAF_PALETTES[1], light, 1, { species: 'almond' });  // pink, mid-back — an almond
  fruitTree(out, counter, rng, 748, 304, 64, 30, LEAF_PALETTES[0], light, 1, { species: 'pomegranate' });  // violet, back-right — a pomegranate
  /* ⭐⭐ THE PAGE'S OWN VERSE NAMES A VINE AND THERE WAS NO VINE (Sep 21, verse inventory). The verse
     under this picture is John 15:5 — "He that abideth in me… bringeth forth much fruit" — and its
     first words are "I am the VINE, ye are the branches." The field had flowers, fruit trees, a
     rock, a sower; the one plant the verse is about was nowhere. It stands in the open meadow to
     the child's right now, on a husbandman's frame (15:1 "my Father is the husbandman"): one old
     stock, its arm along the beam, the branches, and the fruit hanging under the leaves. */
  E.paintVine(out, counter, E.mulberry32((seed ^ 0x1505) >>> 0), 548, 676, 346, 64, { lightFn: light });

  /* ---------------- 7. THE CHILD — the red sower ----------------  [FG plane] */
  const _fgChild = out.length;
  const fy = CHILD[1] + 8; // ground line under the knees
  const cx = CHILD[0];
  // kneeling, body turned left toward the fresh furrow, sowing arm flung out
  // articulated child tending the garden: bowed, one hand reaching DOWN to the
  // soil (planting), the other steadying the seed pouch at the hip
  // the little pilgrim kneeling at the furrow, one thin arm planting DOWN
  // exclusion zone under the pilgrim's kneeling cloak + head
  const nearChild = (x, y, m) => (Math.abs(x - cx - 2) <= 25 + m && y > fy - 48 - m && y < fy + 3 + m);
  strokes(out, counter, {
    rng, n: 300,
    sample: rej(cx - 70, fy - 40, cx + 74, fy + 34,
      (x, y) => y > horizon(x) + 4 && Math.hypot((x - cx - 8) / 64, (y - fy + 2) / 31) <= 1 && !nearChild(x, y, 2.5)),
    dir: groundDir,
    // ⚠ THIS WAS A BIG DARK STAIN IN THE MIDDLE OF THE FIELD. It was painted as a
    // "prominence pool" — a pool of shadow to make the deep-red sower pop at thumbnail
    // size — with a ramp running down to navy '#323a50' over an ellipse 176x92 units
    // wide. That figure is gone: DEBAKE skips paintMask and the child is the runtime cast
    // cell now, so all that was left on the page was the shadow of somebody who is not
    // there. What belongs here instead is what he is actually doing: freshly TURNED
    // EARTH where he has been working, warm and lit, the soil the seed goes into.
    col: (x, y, r) => jig(ramp(['#8a7350', '#79643f', '#6b5838', '#5e4d32'],
      Math.hypot((x - cx - 8) / 64, (y - fy + 2) / 31) * 0.8 + r() * 0.24), r, 8),
    len: 16, lw: 3.4, steps: 2, follow: 0.9, aJ: 0.07, lenJ: 0.45, relief: 0.35, op: 0.58,
  });
  /* ══ THE WORKED GROUND, IN CLOSE ═══════════════════════════════════════════
     This is the one place on the plate the eye is actually sent — his hand, and the
     soil under it — so it is the one place worth real close detail. Turned earth is
     not a smooth patch: it is broken clods with lit tops, grit, a few seeds already
     lying in the furrow, and the very first sprouts breaking through where he was
     working a moment ago. That last touch is the page's whole sentence in miniature:
     what he is putting in has already started coming up behind him. */
  {
    const dRng = mulberry32(seed ^ 0x1f3a5c9d);
    const HAND = [cx - 8, fy - 4];                       // where his planting hand comes down
    const inPatch = (x, y) => Math.hypot((x - cx - 8) / 64, (y - fy + 2) / 31) < 1;
    // ⚠ CLODS, NOT COBBLES. At r 1.4-4.0 with a near-black under-daub these came out as a
    // heap of brown pebbles sitting on the field — the eye read "pile of stones", not
    // "ground somebody just turned over". Turned earth is mostly fine crumb with only a few
    // lumps in it, and its lumps are barely lighter than the soil around them.
    for (let i = 0; i < 78; i++) {
      const a2 = dRng() * 6.2832, dd = Math.pow(dRng(), 0.6);
      const gx = cx + 8 + Math.cos(a2) * 62 * dd, gy = fy - 2 + Math.sin(a2) * 29 * dd;
      const r2 = 0.6 + Math.pow(dRng(), 1.5) * 1.7;
      E.daub(out, counter, gx, gy + r2 * 0.45, r2 * 0.95, jig('#5b4930', dRng, 6), dRng);
      E.daub(out, counter, gx, gy, r2, jig(ramp(['#6e5940', '#7f684a', '#907756'], dRng()), dRng, 7), dRng);
    }
    for (let i = 0; i < 18; i++) {                       // grit
      const a2 = dRng() * 6.2832, dd = Math.pow(dRng(), 0.5);
      const gx = cx + 8 + Math.cos(a2) * 60 * dd, gy = fy - 2 + Math.sin(a2) * 28 * dd;
      const r2 = 0.5 + dRng() * 0.75;
      E.daub(out, counter, gx + r2 * 0.5, gy + r2 * 0.6, r2 * 0.9, jig('#463a28', dRng, 5), dRng);
      E.daub(out, counter, gx, gy, r2, jig(ramp(['#867f74', '#9b948a', '#b0a99e'], dRng()), dRng, 7), dRng);
    }
    for (let i = 0; i < 11; i++) {                       // seeds already lying in the row
      const t2 = dRng();
      const gx = HAND[0] - 4 - t2 * 44 + (dRng() - 0.5) * 7;
      const gy = HAND[1] + 3 + t2 * 9 + (dRng() - 0.5) * 5;
      out.push(`<ellipse cx="${R1(gx)}" cy="${R1(gy)}" rx="${R1(1.5)}" ry="${R1(1.05)}" transform="rotate(${R1(dRng() * 60 - 30)} ${R1(gx)} ${R1(gy)})" fill="${jig('#4a3620', dRng, 6)}"/>`); counter.n++;
      out.push(`<ellipse cx="${R1(gx - 0.35)}" cy="${R1(gy - 0.4)}" rx="${R1(0.8)}" ry="${R1(0.5)}" fill="${jig('#9c8154', dRng, 7)}" opacity="0.9"/>`); counter.n++;
    }
    for (let i = 0; i < 18; i++) {                       // and the first shoots already up
      const a2 = dRng() * 6.2832, dd = 0.35 + Math.pow(dRng(), 0.6) * 0.7;
      const gx = cx + 10 + Math.cos(a2) * 58 * dd, gy = fy - 2 + Math.sin(a2) * 27 * dd;
      if (!inPatch(gx, gy)) continue;
      const hh = 3.4 + dRng() * 3.4;
      paintPath(out, counter, dRng, [[gx, gy], [gx + (dRng() - 0.5) * 1.6, gy - hh]],
        (x, y, r) => jig(mix('#4e7f2e', '#86b444', r()), r, 8), { lw: 0.9, len: 2, density: 1, jitter: 0.2 });
      for (const sgn of [-1, 1]) paintPath(out, counter, dRng,
        [[gx, gy - hh * 0.8], [gx + sgn * 2.6, gy - hh * 1.15]],
        (x, y, r) => jig(mix('#5c9034', '#9cc652', r()), r, 9), { lw: 1.1, len: 2, density: 1, jitter: 0.25 });
    }
  }
  // (the sower himself is painted AFTER the prominence pool — see below)
  // gold rim-light on the sun side (upper-left flank — the morning touches the sower)
  // (no baked rim — the mask and pool carry the light)

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
  // THE MAIN CHARACTER — "you": consistent deep-red clothes + bold dark outline so
  // the reader can follow the same child across the whole book (was a dark-mulberry form here).
  E.paintMask(out, counter, rng, {
    x: cx + 2, y: fy, h: 44, facing: -1, kneel: true, lean: -3,
    armL: [cx - 15, fy - 13], armR: [cx + 12, fy - 16],
    eye: [-0.5, 0.6], mood: 'open', aura: 9,
  });
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

  // re-assert the main character over the prominence pool (consistent red + outline)
  // (prominence re-lay no longer needed — the mask reads at thumbnail size)
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
  // (no baked rim — the mask and pool carry the light)
  fgRanges.push([_fgChild, out.length]);   // ← the red sower is foreground

  /* ══ 9 · THE GLEANERS ══════════════════════════════════════════════════════
     Matt 13:4 — "and when he sowed... the fowls came." Here they are not thieves but
     part of the living field the sowing woke (Ps 104:24).
     ⚠ THE OLD ONES DID NOT READ AS BIRDS. Built from dark ribbons with one pale stripe
     along the back, at page size they came out as black almond shapes with a white mark
     in them — closer to an open mouth than a bird, on the page a child is supposed to be
     able to name. Same law as the trees: an object has to be recognisable FIRST, and
     scriptural intent does not excuse a shape nobody can read. So: fewer, bigger, and
     built the way a child draws a bird — round body, round head, a beak, a bright eye,
     two legs, standing on a patch of lit earth that separates it from the furrow.
     (The 78 confetti poppies that used to sit over all this are gone: the rows carry the
     colour now, and evenly-scattered dots average to grey — the book's own warning.) */
  const gleaner = (bx, by, sc, peck) => {
    const dk = (r) => jig(ramp(['#2b3350', '#3b4668', '#4d5a80'], r() * 0.9), r, 8);
    // lit earth under it, so the dark bird never sits on a dark furrow
    strokes(out, counter, {
      rng, n: 26,
      sample: r => [bx + (r() + r() - 1) * 16 * sc, by + 1.5 * sc + (r() - 0.5) * 5 * sc],
      dir: () => 0.1,
      col: (x, y, r) => jig(ramp(['#a98a52', '#c4a468', '#dcc088'], r()), r, 8),
      len: 7 * sc, lw: 2.6 * sc, steps: 2, relief: 0, op: 0.85,
    });
    const bodyY = by - 7 * sc;
    E.daub(out, counter, bx, bodyY, 7.4 * sc, dk(rng), rng);            // body
    for (let i = 0; i < 22; i++) {                                       // filled out with feathers
      const aa = rng() * Math.PI * 2, dd = Math.pow(rng(), 0.6);
      E.daub(out, counter, bx + Math.cos(aa) * 9 * sc * dd, bodyY + Math.sin(aa) * 6.4 * sc * dd,
             2.6 * sc, dk(rng), rng);
    }
    paintPath(out, counter, rng,                                          // tail
      [[bx + 7 * sc, bodyY - 1 * sc], [bx + 14 * sc, bodyY - 3.4 * sc]],
      (x, y, r) => dk(r), { lw: 3.2 * sc, len: 3, density: 1, jitter: 0.3 });
    const hx = peck ? bx - 10 * sc : bx - 7.5 * sc;
    const hy = peck ? by - 2.2 * sc : bodyY - 9 * sc;
    paintPath(out, counter, rng, [[bx - 4 * sc, bodyY - 2 * sc], [hx, hy]],   // neck
      (x, y, r) => dk(r), { lw: 3.4 * sc, len: 2.6, density: 1, jitter: 0.2 });
    E.daub(out, counter, hx, hy, 4.0 * sc, dk(rng), rng);                 // head
    paintPath(out, counter, rng,                                          // beak
      [[hx - 1 * sc, hy + (peck ? 1.6 : 0.2) * sc], [hx - 5.4 * sc, hy + (peck ? 4.2 : 1.0) * sc]],
      (x, y, r) => jig('#e0a83a', r, 9), { lw: 1.5 * sc, len: 2, density: 1, jitter: 0.15 });
    out.push(`<circle cx="${R1(hx - 1.2 * sc)}" cy="${R1(hy - 1.2 * sc)}" r="${R1(1.15 * sc)}" fill="#fff3d0"/>`); counter.n++;
    out.push(`<circle cx="${R1(hx - 1.4 * sc)}" cy="${R1(hy - 1.3 * sc)}" r="${R1(0.55 * sc)}" fill="#20243a"/>`); counter.n++;
    for (const lx of [-1.6, 2.4]) paintPath(out, counter, rng,            // legs
      [[bx + lx * sc, bodyY + 5 * sc], [bx + (lx - 0.7) * sc, by + 1.4 * sc]],
      (x, y, r) => jig('#c08a34', r, 7), { lw: 1.0 * sc, len: 2, density: 1, jitter: 0.15 });
  };
  gleaner(432, 452, 1.5, true);    // head down in the open row, a few steps behind the sower
  gleaner(506, 428, 1.2, false);   // one alert, watching him
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
