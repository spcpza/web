// gen/plates/bridge.mjs — "C is the way" (§9) — REBUILT FOR THE MESSAGE.
//
//   "Jesus saith unto him, I am the way, the truth, and the life: no man
//    cometh unto the Father, but by me."                        — John 14:6
//
// The canyon was too wide to jump. So the bridge came from the other side —
// and the bridge is a CROSS. The earlier plate hid the cross ("symbol
// second") and the message was lost. Now the cross is unmistakable: a tall
// luminous cross spans the chasm, its long cross-beam the very walkway across,
// glowing gold — it is THE light of the plate (so the living layer lights the
// message, not the dark around it). A red child crosses it, led by a golden
// hand, toward the Father's house glowing on the far rim. Dark below, dusk
// above, the cross blazing the way between.
//
// Paint order: underpaints -> dusk -> far rim + home -> canyon dark -> near
// rim -> THE LUMINOUS CROSS-BRIDGE (post, beam/walkway, glow) -> figures -> eggs.
export const name = 'bridge';
export const title = 'The bridge';
export const caption = 'The bridge was built from the other side — and it was a cross.';
export const seed = 20260906;
export const focal = { x: 410, y: 300 }; // portrait window: the cross-beam walkway, child mid-crossing
// MOBILE 3D — depth planes (FAR→NEAR). The cross spans the canyon rim-to-rim, so
// the whole canyon + rims + cross-bridge + home MUST share one plane (mid) or the
// bridge would visibly disconnect on tilt. Sky behind; a rim fringe textures the
// seam; the foreground fruit-trees nearer; the crossing figures closest.
// stacked SKY-SWIRL SHEETS — bold, gapped passes of the curving Munch bands,
// each its own depth plane (paint on paint), so their gaps reveal the ground
export const SKY_SHEETS = [
  { n: 230, len: 24, lw: 5.7, lift: 0.00 },
  { n: 252, len: 21, lw: 5.3, lift: 0.07 },
];
export const layers = [
  { name: 'sky', opaque: true },  // smooth sky ground (backmost, opaque)
  ...SKY_SHEETS.map((_, i) => ({ name: 'sky' + (i + 1) })),   // stacked sky-swirl sheets
  { name: 'mid' },                // rims, canyon, home, the cross-bridge, rim fringe, PLANTED trees
  { name: 'fg' },                 // the crossing child + golden guide
];

export function paint(E, opts = {}) {
  const {
    mulberry32, fbm, curlV, goldenSpiralV, mix, ramp, jig, strokes, rej,
    paintFigure, radiantHalo, paintLight, paintPath, inCap, underpaintCapsules, paintChild, castShadow, personCaps, ribbon, svgWrap, R1, W, H,
    GOLD, GOLD_PALE, GOLD_DEEP, GOLD_HOT, NIGHT, DARKEST, lightRadial,
    fruitTree, LEAF_PALETTES, horizonFringe,
  } = E;

  const rng = mulberry32(seed);
  const out = [];
  const counter = { n: 0 };
  // MOBILE 3D LAYERS: tag ranges per band. MID = everything below the sky except
  // the near trees and the figures — incl. the rim-to-rim cross (kept whole).
  const LAYER = opts.layer || 'full';
  const fgRanges = [];
  out.push(`<rect width="${W}" height="${H}" fill="${DARKEST}"/>`);

  /* ---------------- GEOMETRY ---------------- */
  const rimL = x => 300 - 0.04 * x + 6 * Math.sin(x / 90);     // near (left) plateau top
  const rimR = x => 250 + 0.02 * (x - 560) + 5 * Math.sin(x / 110); // far (right) plateau top
  const gapL = y => 300 - (y - 290) * 0.30;                    // near canyon wall
  const gapR = y => 560 + (y - 280) * 0.26;                    // far canyon wall
  const inCanyon = (x, y) => y > 280 && x > gapL(y) && x < gapR(y);

  // THE CROSS — the geometry of the way. Vertical post + horizontal beam that
  // IS the walkway across the gap. Centered, large, planted in the chasm.
  const CX = 408;                          // cross axis x
  const beamY = x => 300 - (x - CX) * 0.012; // the cross-beam / walkway, near-level
  const crossTop = 150, crossBot = 472;    // post rises high, descends into the dark
  const beamL = 250, beamR = 566;          // beam spans rim to rim

  // THE LIGHT: the cross blazes, and the home answers on the far rim
  const crossLight = lightRadial(CX, 286, 210);
  const home = [690, 228];
  const homeLight = lightRadial(home[0], home[1], 150);
  const lightAt = (x, y) => Math.min(1, crossLight(x, y) * 1.15 + homeLight(x, y) * 0.7);

  // solid regional underpaints (gaps must read as dusk/rock, never void)
  out.push(`<path d="M-2 -2H802V300H-2Z" fill="#3a3860"/>`);                                   // sky
  counter.n += 1;
  // (the ground-band + gap underpaints are pushed in §2 below so they ride the MID plane)

  /* ---------------- 1. THE SKY — natural, so it CURVES (Munch) ----------------
     long undulating bands that ripple across the frame, and a free, non-literal
     colour: teal into green-gold into rose and violet. The sky in this world
     is whatever the Light makes it. */
  // THE ALIVE DUSK SKY (the fractal sky — motion at THREE scales, the same living
  // hand as looking/garden): the whole dusk WHEELS in ONE great spiral over the
  // cross (macro), a few eddies turn inside the wheel (mid), and every stroke
  // curves with its parent current (micro). Swirls within swirls — the dusk is not
  // flat weather, it is deep moving light, wheeling toward the cross where it warms.
  const WHEEL_X = 408, WHEEL_Y = 138;   // the great wheel, centred over the cross's light warming toward home
  const EDDIES = [[176, 66, -58], [470, 58, 56], [652, 118, -50], [300, 172, 46]];
  const nearEddy = (x, y) => { let m = 1e9; for (const [ex, ey] of EDDIES) m = Math.min(m, Math.hypot(x - ex, y - ey) / 46); return m; };
  const skyDir = (x, y) => {
    let vx = 0, vy = 0;
    { const [a, b] = goldenSpiralV(x, y, WHEEL_X, WHEEL_Y, 115, 260); vx += a; vy += b; }   // the great wheel over the cross
    for (const [ex, ey, s] of EDDIES) { const [a, b] = goldenSpiralV(x, y, ex, ey, s, 80); vx += a; vy += b; }
    const [c, d] = curlV(x, y, 31, 120); vx += c * 26; vy += d * 26;
    return Math.atan2(vy, vx);
  };
  // jewel eddy-glows — the eddy cores breathe faint dusk colour (violet/rose/gold),
  // a big part of the alive richness; kept subtle (exp·0.5 falloff)
  const EGLOW = [[176, 66, '#7a4e8c'], [470, 58, '#d45e7e'], [652, 118, '#e0a860'], [300, 172, '#8c5a9e']];
  const skyCol = (x, y, r, lift) => {
    const g = lightAt(x, y);
    const band = Math.min(1, Math.max(0, (y / 300) + Math.sin(x / 120) * 0.06 + fbm(x / 140, y / 120, 7) * 0.14));
    let c = ramp(['#2c6e7c', '#4f9a78', '#cdb24e', '#e0885a', '#d45e7e', '#7a4e8c'], band); // teal→green-gold→rose→violet
    for (const [ex, ey, ec] of EGLOW) { const d2 = Math.hypot(x - ex, y - ey); c = mix(c, ec, Math.exp(-d2 / 95) * 0.5); }   // the eddy cores breathe faint jewel light
    c = g > 0.05 ? mix(c, '#ffd06a', g * 0.5) : c;
    if (lift) c = mix(c, '#ffffff', lift);
    return jig(c, r, 9);
  };
  const skySample = rej(-10, -10, 810, 300, (x, y) => y < (x < 430 ? rimL(x) : rimR(x)) + 8);
  // the smooth sky GROUND — broad soft masses (opaque base); the curving Munch
  // brushwork lives in the stacked sheets above, so their gaps reveal paint
  strokes(out, counter, {
    rng, n: 540, sample: skySample,
    dir: skyDir, col: (x, y, r) => skyCol(x, y, r, 0),
    len: 40, lw: 10, steps: 4, follow: 0.91, wild: 0.05, lenJ: 0.5,
    aJ: (x, y) => 0.1 + lightAt(x, y) * 0.3,
  });
  const skyEnd = out.length;   // FAR plane: the smooth sky ground (opaque)
  // the stacked SKY-SWIRL SHEETS — each an independent bold, gapped pass of the
  // curving Munch bands (paint on paint), own rng per sheet.
  const skySheets = SKY_SHEETS.map((e, k) => {
    const srng = mulberry32(seed + 1009 * (k + 1));
    const sh = [];
    strokes(sh, { n: 0 }, {
      rng: srng, n: e.n, sample: skySample,
      dir: skyDir,
      col: (x, y, r) => {
        const near = nearEddy(x, y);
        if (near < 1.1 && r() < 0.06) return jig(r() < 0.5 ? '#d4ddf4' : '#e6c98a', r, 12);   // BRIGHT sparks at the eddy knots (dusk silver + a touch of the home's gold)
        const k2 = fbm(x / 92, y / 92, 71) + (r() - 0.5) * 0.2;
        if (k2 > 0.76) return jig('#d4ddf4', r, 8);                                          // BRIGHT twilight cloud-ribbon crests (reads against the dusk)
        return skyCol(x, y, r, e.lift);
      },
      len: e.len, lw: e.lw, steps: 5, follow: 0.9, wild: 0.2, lenJ: 0.55, impasto: 0.6, relief: 0.5,
      aJ: (x, y) => 0.16 + Math.max(0, 1.3 - nearEddy(x, y)) * 0.42,
    });
    return sh.join('\n');
  });

  /* ---------------- 2. FAR RIM + HOME ---------------- */
  // ground-band + gap underpaints (MID plane: under the rims, canyon and bridge)
  out.push(`<path d="M-2 262L300 296L${R1(gapR(280))} 252L802 236V504H-2Z" fill="#2b2b48"/>`);  // ground band
  out.push(`<path d="M${R1(gapL(290))} 290L${R1(gapR(280))} 280L${R1(gapR(504))} 504L${R1(gapL(504))} 504Z" fill="#11142e"/>`); // gap
  counter.n += 2;
  strokes(out, counter, {
    rng, n: 540, sample: rej(500, 236, 810, 510, (x, y) => y > rimR(x) && x > gapR(Math.max(280, y)) - 30),
    dir: x => 0.05 + Math.sin(x / 70) * 0.07,
    col: (x, y, r) => jig(ramp(['#2c2c46', '#463c34', '#604c30', '#84682f', '#a8863e'], Math.min(1, homeLight(x, y) * 1.4 + fbm(x / 70, y / 70, 19) * 0.2)), r, 7),
    len: 34, lw: 5, steps: 3, wild: 0.07, lenJ: 0.5, impasto: 0.7,
  });
  { // the Father's house — a RADIANT BEACON of light across the gulf, the home
    //  of the Light (it always blazes — Rev 21:23)
    const [hx, hy] = home;
    strokes(out, counter, { rng, n: 420, sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 0.95) * 128; return [hx + Math.cos(a) * d, hy + 8 + Math.sin(a) * d * 0.6]; }, dir: () => 0.06, col: (x, y, r) => jig(ramp([GOLD_HOT, GOLD_PALE, GOLD, GOLD_DEEP, '#a8843e', '#5a4a3a'], Math.hypot(x - hx, (y - hy - 8) / 0.6) / 128), r, 8), len: 12, lw: 3.2, steps: 2, impasto: 0.5 });
    // a clearly DRAWN little house — gold walls, a distinct roof, bright windows,
    //  a glowing door (so it reads as a HOUSE, not a soft blur)
    const hw3 = 26, bTop = hy - 3, bBot = hy + 19, peak = hy - 27;
    out.push(`<path d="M${hx - hw3} ${R1(bBot)}L${hx - hw3} ${R1(bTop)}L${hx + hw3} ${R1(bTop)}L${hx + hw3} ${R1(bBot)}Z" fill="#f0d894"/>`); counter.n++;
    out.push(`<path d="M${hx - hw3 - 4} ${R1(bTop + 1)}L${hx} ${R1(peak)}L${hx + hw3 + 4} ${R1(bTop + 1)}Z" fill="#c87a44"/>`); counter.n++;
    strokes(out, counter, { rng, n: 60, sample: rej(hx - hw3 + 1, bTop + 1, hx + hw3 - 1, bBot - 1), dir: () => 0, col: (x, y, r) => jig(ramp([GOLD_PALE, GOLD, '#e0c068'], fbm(x / 10, y / 10, 23) * 0.5 + 0.2), r, 6), len: 5, lw: 2, steps: 2, impasto: 0.3 });
    paintPath(out, counter, rng, [[hx - hw3 - 4, bTop + 1], [hx, peak], [hx + hw3 + 4, bTop + 1]], (x, y, r) => jig(mix('#a85e30', '#d89456', r() * 0.5), r, 8), { lw: 2, len: 4, density: 0.6, jitter: 0.6 });
    out.push(`<rect x="${R1(hx - 18)}" y="${R1(bTop + 4)}" width="9" height="11" rx="1.4" fill="#fffaf0"/>`);
    out.push(`<rect x="${R1(hx + 9)}" y="${R1(bTop + 4)}" width="9" height="11" rx="1.4" fill="#fffaf0"/>`);
    out.push(`<rect x="${R1(hx - 4)}" y="${R1(bBot - 12)}" width="8" height="12" rx="1.2" fill="#fff2c8"/>`); // a glowing door
    counter.n += 3;
  }

  /* ---------------- 3. THE CANYON ---------------- */
  strokes(out, counter, {
    rng, n: 640, sample: rej(180, 282, 700, 510, inCanyon),
    dir: (x, y) => { const mid = (gapL(y) + gapR(y)) / 2; return Math.PI / 2 - (x - mid) * 0.0014 + (fbm(x / 70, y / 70, 23) - 0.5) * 0.3; },
    col: (x, y, r) => {
      const depth = Math.min(1, (y - 280) / 224);
      let c = ramp(['#283a6e', '#1f2b54', '#161d40', DARKEST], Math.pow(depth, 0.75));
      if (depth > 0.3 && depth < 0.55 && r() < 0.018) return jig('#52428a', r, 12);
      return jig(c, r, 7);
    },
    len: 26, lw: 4, steps: 3, follow: 0.85, wild: 0.1, lenJ: 0.5,
  });

  /* ---------------- 4. NEAR (LEFT) RIM ---------------- */
  strokes(out, counter, {
    rng, n: 520, sample: rej(-10, 280, 360, 510, (x, y) => y > rimL(x) && x < gapL(Math.max(290, y)) + 30),
    dir: x => -0.04 + Math.sin(x / 60) * 0.09,
    col: (x, y, r) => jig(ramp(['#222848', '#343456', '#4a4458', '#5d503e'], Math.min(1, 0.25 + fbm(x / 60, y / 60, 31) * 0.55 + lightAt(x, y) * 0.6)), r, 7),
    len: 28, lw: 4.6, steps: 3, wild: 0.09, lenJ: 0.5,
  });

  /* ---------------- 5. THE LUMINOUS CROSS-BRIDGE ---------------- */
  // a broad warm halo first — the cross gives off light (the way is lit)
  strokes(out, counter, {
    rng, n: 520,
    sample: r => {
      // sample around the cross shape (post + beam), gaussian-ish
      if (r() < 0.5) { const y = crossTop - 10 + r() * (crossBot - crossTop + 20); return [CX + (r() + r() - 1) * 46, y]; }
      const x = beamL - 10 + r() * (beamR - beamL + 20); return [x, beamY(x) + (r() + r() - 1) * 40];
    },
    dir: () => 0.04,
    col: (x, y, r) => {
      const dPost = Math.abs(x - CX), dBeam = Math.abs(y - beamY(x));
      const d = Math.min(dPost, dBeam);
      if (d > 30 && r() < 0.05) return jig('#8a5aa0', r, 12);               // violet flicker at the halo edge
      return jig(ramp([GOLD_PALE, GOLD, '#e2a444', '#a8803c', '#5a5060'], Math.min(1, d / 50)), r, 8);
    },
    len: 18, lw: 3.4, steps: 3, follow: 0.9, lenJ: 0.5,
  });
  // THE POST — the vertical beam, a bright burning timber from high to the deep
  strokes(out, counter, {
    rng, n: 360,
    sample: r => { const y = crossTop + r() * (crossBot - crossTop); const o = (r() + r() - 1) * 9; return [CX + o, y]; },
    dir: () => -Math.PI / 2,
    col: (x, y, r) => {
      const below = Math.max(0, (y - 320) / 150);                          // dims as it goes into the chasm
      return jig(ramp([GOLD_HOT, GOLD_PALE, GOLD, '#c08c3c'], Math.abs(x - CX) / 12 + r() * 0.1 + below * 0.5), r, 6);
    },
    len: 16, lw: 4, steps: 2, follow: 1, aJ: 0.0, wild: 0, lenJ: 0.22, impasto: 0.55,   // RULER-STRAIGHT — it is made, not grown
  });
  // THE BEAM / WALKWAY — the horizontal cross-beam that is the way across
  strokes(out, counter, {
    rng, n: 380,
    sample: r => { const x = beamL + r() * (beamR - beamL); const o = (r() + r() - 1) * 10; return [x, beamY(x) + o]; },
    dir: x => Math.atan2(beamY(x + 10) - beamY(x - 10), 20),
    col: (x, y, r) => jig(ramp([GOLD_HOT, GOLD_PALE, GOLD, '#c4944e', '#7a6038'], Math.abs(y - beamY(x)) / 13 + r() * 0.1), r, 6),
    len: 16, lw: 4.2, steps: 2, follow: 1, aJ: 0.0, wild: 0, lenJ: 0.28, impasto: 0.6,   // RULER-STRAIGHT — the made way
  });
  // the bright knot where post and beam meet — the heart of the cross
  strokes(out, counter, {
    rng, n: 60, sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 0.7) * 16; return [CX + Math.cos(a) * d, beamY(CX) + Math.sin(a) * d]; },
    dir: () => 0.2, col: (x, y, r) => jig(mix(GOLD_HOT, GOLD_PALE, r() * 0.5), r, 5), len: 7, lw: 3, steps: 2, impasto: 0.5,
  });

  /* ---------------- BACKGROUND LIFE (Matt 6:26; Isa 55:12; Ps 23 — the flock home) ---------------- */
  for (const [bx, by, s] of [[140, 72, 1], [178, 86, 0.85], [110, 96, 0.8], [206, 70, 0.75]]) {
    paintPath(out, counter, rng, [[bx - 6 * s, by + 2.6 * s], [bx, by - 1.8 * s], [bx + 6 * s, by + 2.6 * s]], (x, y, r) => jig('#2a2f4e', r, 6), { lw: 1.5 * s, len: 3.4, density: 0.9, jitter: 0.5 });
  }
  // ragged FRINGE along each plateau lip (skip the chasm) so the sky↔rim seam
  // reads organic, not a ruled line (MID — it belongs to the rims it edges)
  horizonFringe(out, counter, rng, { horizonFn: rimL, x0: -10, x1: 196, cols: ['#1a2c20', '#26402a', '#345036'], hMax: 16, lightFn: lightAt, seed: 909 });
  horizonFringe(out, counter, rng, { horizonFn: rimR, x0: 566, x1: 810, cols: ['#1a2c20', '#26402a', '#345036'], hMax: 16, lightFn: lightAt, seed: 919 });
  const cyp = (cx, cby, ch, w) => strokes(out, counter, { rng, n: Math.round(w * ch / 12), sample: r => { const v = Math.pow(r(), 0.85); const wr = w * Math.sin(Math.PI * Math.min(1, v * 1.15)) + 0.7; return [cx + (r() + r() - 1) * wr, cby - v * ch]; }, dir: (x, y) => -Math.PI / 2 + (fbm(x / 8, y / 8, 247) - 0.5) * 0.6, col: (x, y, r) => jig(ramp(['#142420', '#1d3424', '#284430'], fbm(x / 10, y / 10, 251) + r() * 0.3), r, 7), len: 9, lw: 2.2, steps: 3, follow: 0.95, lenJ: 0.5 });
  cyp(66, 302, 44, 6);
  // fruitful trees on the far ground — the land beyond the gulf already bears
  // fruit in crazy colour, warming toward the cross- and home-light  [FG plane]
  // fruit-trees PLANTED on the plateaus (MID) — base stays with the ground on pan
  fruitTree(out, counter, rng, 600, 250, 46, 22, LEAF_PALETTES[1], lightAt);  // pink, far-right
  fruitTree(out, counter, rng, 150, 300, 50, 23, LEAF_PALETTES[3], lightAt);  // blue, near-left
  const bush = (bx, by, w, h) => strokes(out, counter, { rng, n: Math.round(w * 1.5), sample: r => { const a = r() * Math.PI * 2, dd = Math.pow(r(), 0.7); return [bx + Math.cos(a) * w * dd, by - Math.abs(Math.sin(a)) * h * dd]; }, dir: (x, y) => -Math.PI / 2 + (fbm(x / 10, y / 10, 259) - 0.5) * 1.2, col: (x, y, r) => jig(ramp(['#1a2c20', '#26402a', '#345036'], fbm(x / 12, y / 12, 261) + r() * 0.25), r, 8), len: 6, lw: 2, steps: 2, lenJ: 0.5 });
  bush(150, 302, 14, 10); bush(556, 252, 13, 9);
  const shp = (sx, sy, s) => { strokes(out, counter, { rng, n: Math.round(18 * s), sample: r => { const a = r() * Math.PI * 2, dd = Math.pow(r(), 0.7); return [sx + Math.cos(a) * 8 * s * dd, sy + Math.sin(a) * 4.5 * s * dd]; }, dir: () => 0, col: (x, y, r) => jig(mix('#9a8c70', '#bcae8a', r() * 0.6), r, 7), len: 2.6 * s, lw: 1.8 * s, steps: 2 }); paintPath(out, counter, rng, [[sx - 7 * s, sy - 1 * s], [sx - 10 * s, sy + 1.2 * s]], (x, y, r) => jig('#2a241e', r, 4), { lw: 1.7 * s, len: 2, density: 1 }); };
  shp(642, 237, 0.78); shp(666, 246, 0.68);

  /* ---------------- 6. FIGURES — crossing toward home ----------------  [FG plane] */
  const _fgFigs = out.length;
  const fy = beamY(348) - 1, gy = beamY(382) - 1;
  // the crossing RED child — an articulated little person, reaching forward to
  // take the guide's offered hand (held hands knot at ~367, fy-37).
  const childCaps = personCaps(348, fy - 48, 48, {
    leftHand: [334, fy - 20],                           // back arm swinging — walking
    rightHand: [366, fy - 37],                          // forward hand reaching to the guide's hand
    rightFoot: [362, fy], leftFoot: [334, fy - 5],       // WALKING stride: leading foot forward, trailing heel lifted
  });
  // THE LIGHT — the guide (John 14:6), the Word made flesh: an articulated human
  // in the SAME proportions as the child, leading across, one hand reaching BACK
  // to the child's hand. Rendered brilliant WHITE, full of light, no dark outline.
  const guideCaps = personCaps(384, gy - 82, 82, {
    headTilt: -2,
    leftHand: [367, gy - 37],                           // hand reaching BACK to the child
    rightHand: [404, gy - 26],                          // forward arm swinging — walking
    rightFoot: [404, gy], leftFoot: [372, gy - 7],       // WALKING stride: leading foot forward, trailing heel lifted
  });
  // THE LIGHT — same radiant white-and-yellow figure as everywhere else; its warm
  // backing lets Him read even against the bright bridge He became. ONE Light.
  castShadow(out, counter, guideCaps, { dir: 0.15 });
  paintLight(out, counter, rng, guideCaps);
  castShadow(out, counter, childCaps, { dir: 0.15 });
  paintChild(out, counter, rng, childCaps);  // the protagonist child "you" — consistent deep-red + bold dark outline
  // the held hands — one bright knot, the offered hand
  strokes(out, counter, { rng, n: 20, sample: r => { const a = r() * Math.PI * 2, d = r() * 5; return [367 + Math.cos(a) * d, fy - 37 + Math.sin(a) * d]; }, dir: () => -0.4, col: (x, y, r) => jig(GOLD_PALE, r, 9), len: 4, lw: 1.6, steps: 2 });
  fgRanges.push([_fgFigs, out.length]);   // ← the crossing child + golden guide are foreground

  /* ---------------- 7. EASTER EGGS ---------------- */
  { // John 14:6 ("I am the way") milestone at the near foot of the way — in ORIGINAL
    // KOINE GREEK numerals ΙΔʹ·Ϛʹ (ΙΔ=14, Ϛ=6), carved on a small grey stone.
    const sx = 236, sy = 312;
    strokes(out, counter, { rng, n: 64, sample: r => [sx - 24 + r() * 48, sy - 13 + r() * 18], dir: () => 0.05, col: (x, y, r) => jig(mix('#343a58', '#50506c', r() * 0.7), r, 6), len: 7, lw: 2.4, steps: 2 });
    E.inscriptionText(out, E.greekRef(14, 6), { x: sx, y: sy - 1, h: 13, body: '#1c2238', edge: '#a4a8c0', op: 0.85, edgeOp: 0.6 });
  }
  for (const [bx, by] of [[150, 78], [182, 92], [168, 110]]) // three birds homeward
    paintPath(out, counter, rng, [[bx - 6, by + 2], [bx, by - 2], [bx + 6, by + 2]], (x, y, r) => jig('#2a3260', r, 6), { lw: 1.4, len: 3.5, density: 1, jitter: 0.5 });

  /* ---------------- SWALLOWS BELOW THE DECK (Ps 84:3 "yea, the swallow a
     nest for herself… even thine altars"; Matt 6:26) — cliff-nesters wheeling
     in the canyon air UNDER the cross-beam walkway: their flight makes the
     gulf's depth readable and ALIVE. Curved swept wings (living things curve
     — Munch), forked tails, the cross-light from above catching each upper
     wing edge (chiaroscuro at bird scale) over a dark belly side, so they
     read against the gulf's blue. MID band — same cel as the canyon they fly
     in — appended at the very end so no existing rng call re-rolls. */
  const swallow = (sx, sy, s, bank) => {
    const ca = Math.cos(bank), sa = Math.sin(bank);
    const P = (dx, dy) => [sx + dx * ca - dy * sa, sy + dx * sa + dy * ca];
    const wing = [P(-9 * s, -4.6 * s), P(-4.5 * s, -0.4 * s), P(0, 1.4 * s), P(4.5 * s, -0.4 * s), P(9 * s, -4.6 * s)];
    const g = Math.min(1, lightAt(sx, sy) * 1.3 + 0.18);
    // dark belly side first, then the cross-lit top edge — the one accent
    paintPath(out, counter, rng, wing.map(([x, y]) => [x, y + 1.1 * s]), (x, y, r) => jig('#0c1028', r, 5), { lw: 1.7 * s, len: 3, density: 1, jitter: 0.3 });
    paintPath(out, counter, rng, wing, (x, y, r) => jig(mix('#5a628e', '#eac578', g), r, 7), { lw: 1.5 * s, len: 3, density: 1, jitter: 0.3 });
    // the forked swallow tail — two short curved streamers
    paintPath(out, counter, rng, [P(0, 1.6 * s), P(-1.8 * s, 5 * s)], (x, y, r) => jig('#0c1028', r, 5), { lw: 1.1 * s, len: 2.2, density: 1, jitter: 0.3 });
    paintPath(out, counter, rng, [P(0.4 * s, 1.6 * s), P(2.2 * s, 4.6 * s)], (x, y, r) => jig('#0c1028', r, 5), { lw: 1.1 * s, len: 2.2, density: 1, jitter: 0.3 });
  };
  // faint wheeling arcs — the curved flight paths they ride (kept whisper-soft)
  paintPath(out, counter, rng, [[276, 366], [296, 354], [326, 346]], (x, y, r) => jig(mix('#2c3462', '#4a5288', r() * 0.6), r, 7), { lw: 1.1, len: 3.4, density: 0.45, jitter: 0.7 });
  paintPath(out, counter, rng, [[470, 352], [498, 344], [528, 342]], (x, y, r) => jig(mix('#2c3462', '#4a5288', r() * 0.6), r, 7), { lw: 1.1, len: 3.4, density: 0.45, jitter: 0.7 });
  swallow(312, 348, 1.3, -0.3);   // lead bird, upper canyon, left of the post
  swallow(500, 340, 1.05, 0.35);  // answering bird, right of the post
  swallow(338, 392, 0.9, 0.6);    // banking hard, deeper in the gulf
  swallow(486, 382, 0.8, -0.45);  // deeper right — smaller with depth
  swallow(540, 358, 0.78, 0.15);  // far edge of the wheel, near the far wall

  // MULTIPLANE: assemble the requested depth plane. Each is its own cel —
  // transparent where it has no content — so they stack and parallax apart.
  const ALT = 'A deep dark canyon at dusk. A tall luminous cross spans it — its long glowing cross-beam is the walkway across — and a small child in red crosses it, led by the hand of a taller golden figure, toward a house glowing warm gold on the far rim. The cross is the way.';
  const RAW = { undercoat: 0, weave: 0, varnish: 0, oil: 0 };   // no baked surface — the live filter unifies the planes
  const setOf = ranges => { const s = new Set(); for (const [a, b] of ranges) for (let i = a; i < b; i++) s.add(i); return s; };
  const pick = ranges => ranges.map(([a, b]) => out.slice(a, b).join('\n')).join('\n');
  const fgSet = setOf(fgRanges);
  if (LAYER === 'sky') return svgWrap(ALT, out.slice(0, skyEnd).join('\n'), RAW);   // smooth sky ground (opaque backmost)
  const sm = LAYER.match(/^sky(\d+)$/);
  if (sm) return svgWrap(ALT, '<g>' + skySheets[+sm[1] - 1] + '</g>', RAW);         // one sky-swirl sheet
  if (LAYER === 'fg') return svgWrap(ALT, pick(fgRanges), RAW);                     // the crossing figures
  if (LAYER === 'mid') {                                                            // rims, canyon, home, cross-bridge, fringe, planted trees
    const body = out.filter((_, i) => i >= skyEnd && !fgSet.has(i)).join('\n');
    return svgWrap(ALT, body, RAW);
  }
  // full painting (desktop): sky ground, the stacked sky-sheets, then everything else
  return svgWrap(ALT, out.slice(0, skyEnd).concat(skySheets, out.slice(skyEnd)).join('\n'));
}
