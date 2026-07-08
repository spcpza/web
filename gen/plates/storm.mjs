// gen/plates/storm.mjs — "The storm" (storybook page 10)
// "The storm came anyway. Storms do. The shaking made the roots go deeper."
// — Romans 5:3, "Tribulation worketh patience."
//
// A churning storm sky slashes left-to-right over a dark hill. A young tree
// on the crest bends hard under the wind — bowed, not broken — and a small
// child in deep red shelters close at the trunk. Below the soil line the
// earth opens in cutaway: the tree's roots glow warm gold, reaching DEEPER
// than the tree stands tall. The one light of the plate is underground.
//
// Paint order (= rng order — append only):
//   1. STORM SKY    — two vortices + curl + hard eastward drift, cold ramp
//   2. RAIN         — long raking hairlines driven by the wind
//   3. EASTER EGG   — a faint "5:3" hiding in the storm swirl, upper-left
//   4. EARTH CUTAWAY— dark soil mass below the crest, warmed by the glow
//   5. ROOT GLOW    — lightAlongPath down the taproot: the buried light
//   6. THE ROOTS    — gold tapering ribbons, taproot deeper than the tree
//   7. EASTER EGG   — the taproot's tip curls into a tiny anchor (Heb 6:19)
//   8. SOIL CREST   — the dark seam between storm and warmth
//   9. THE TREE     — trunk bowed hard right, streamed canopy, torn leaves
//  10. THE CHILD    — deep red, hugging the trunk: halo + underpaint +
//                     bright strokes + glow rim from BELOW (per love §7)

export const name = 'storm';
export const title = 'The storm';
export const caption = 'The shaking made the roots go deeper.';
export const seed = 20260314;
export const focal = { x: 444, y: 296 }; // portrait window: the bent tree + sheltering child
// MOBILE 3D — depth planes (FAR→NEAR): the luminous storm sky + rain behind; the
// rooted tree, the sheltering child and the cutaway earth+roots all in ONE mid
// plane (trunk→roots→clinging child are a connected vertical system — splitting
// them would break the "roots deeper than the tree is tall" reading); the jewel
// bushes closest. A soil-crest fringe textures the sky↔ground seam.
// the stacked STORM-SWIRL SHEETS — two independent bold, gapped passes of the
// turbulent cloud (paint on paint), each its own depth plane + own rng. Derived
// from the original dense churn (n:1280, len:32, lw:3.8).
export const SKY_SHEETS = [
  { n: 200, len: 42, lw: 6.6, lift: 0.00 },   // bold broad cloud MASSES (not confetti)
  { n: 165, len: 34, lw: 5.6, lift: 0.06 },
];
export const layers = [
  { name: 'sky', opaque: true },  // smooth storm-sky ground + rain (backmost, opaque)
  ...SKY_SHEETS.map((_, i) => ({ name: 'sky' + (i + 1) })),   // stacked storm-swirl sheets
  { name: 'mid' },                // the bent tree, roots, sheltering child, cutaway earth + crest fringe
  { name: 'fg' },                 // the jewel bushes (closest)
];

export function paint(E, opts = {}) {
  const {
    mulberry32, fbm, curlV, goldenSpiralV, mix, ramp, jig, strokes, rej,
    lightAlongPath, paintChild, castShadow, personCaps, paintPath, inCap,
    inEllipse, segDist, ribbon, svgWrap, R1, W, H,
    GOLD, GOLD_PALE, GOLD_DEEP, GOLD_HOT, NIGHT, DARKEST,
  } = E;

  const rng = mulberry32(seed);
  const out = [];
  const counter = { n: 0 };
  // MOBILE 3D LAYERS: tag ranges per band; MID = the whole rooted-tree system.
  const LAYER = opts.layer || 'full';
  const fgRanges = [];

  /* ---------------- 1. STORM SKY ---------------- */
  // POST-RESURRECTION FLIP: a LUMINOUS storm — bright turbulent sky, the tree
  // and child dark silhouettes; the gold roots stay the one deep warmth (held).
  out.push(`<rect width="${W}" height="${H}" fill="#2b4a76"/>`);   // deep storm base — gaps read as brooding cloud, not bright sky

  // hill crest: the soil line — sky above, cutaway earth below
  const soilY = x => 306 - 24 * Math.exp(-(((x - 432) / 250) ** 2)) + 8 * Math.sin(x / 140);

  // the tree base + the taproot spine (defined early: it carries the light)
  const TB = [432, soilY(432) + 2];
  const taproot = t => { // quadratic: base -> deep tip, slightly east
    const c = [434, 378], e = [448, 472];
    const u = 1 - t;
    return [u * u * TB[0] + 2 * u * t * c[0] + t * t * e[0],
            u * u * TB[1] + 2 * u * t * c[1] + t * t * e[1]];
  };
  // THE one light: warm glow carried down the taproot, strongest mid-depth
  const light = lightAlongPath(taproot, 132, { steps: 9, gainFn: t => 0.5 + 0.5 * Math.sin(Math.PI * (0.18 + 0.82 * t)) });

  // THE ALIVE STORM SKY — motion at THREE scales (the looking/garden hand), but
  // kept as a GALE. The whole sky now WHEELS in one great turbulent spiral (a
  // storm-wheel is exactly what Starry Night's sky is), with torn eddies turning
  // inside it and fine curl in every stroke — swirls within swirls, deep moving
  // weather; clouds curl, rain falls straight.
  const WHEEL_X = 440, WHEEL_Y = 120;                  // the great turbulent wheel, riding over the bent tree
  const EDDIES = [[210, 96, -60], [600, 70, 58], [712, 170, -52], [360, 214, 48]]; // [ex,ey,strength]
  // the wheel + eddy cores also drive the storm's DRAMA (lightning-flash + tear)
  const V = [{ x: WHEEL_X, y: WHEEL_Y, f: 150 }, ...EDDIES.map(([x, y]) => ({ x, y, f: 66 }))];
  const skyDir = (x, y) => {
    let vx = 46, vy = 10; // the gale still leans everything a little east and down
    // 1 · MACRO — ONE great wheel organising the whole storm around the scene
    { const [a, b] = goldenSpiralV(x, y, WHEEL_X, WHEEL_Y, 120, 260); vx += a; vy += b; }
    // 2 · MID — torn eddies turning inside the wheel (counter-rotating)
    for (const [ex, ey, s] of EDDIES) { const [a, b] = goldenSpiralV(x, y, ex, ey, s, 80); vx += a; vy += b; }
    // 3 · MICRO — fine turbulence so every stroke curves with its parent current
    const [c, d] = curlV(x, y, 31, 120); vx += c * 26; vy += d * 26;
    return Math.atan2(vy, vx);
  };
  const windDir = skyDir;
  // slash aggression climbs near the wheel + eddy cores — the sky tears there
  const slash = (x, y) => {
    let near = 1e9; for (const v of V) near = Math.min(near, Math.hypot(x - v.x, y - v.y) / v.f);
    return 0.14 + Math.max(0, 1.3 - near) * 0.42;
  };
  // jewel eddy-glow: the eddy cores breathe the storm's OWN manifold colours —
  // rose, gold, storm-blue — a big part of the alive richness (kept subtle)
  const EGLOW = [[210, 96, '#ef9ecc'], [600, 70, '#f3d488'], [712, 170, '#78bdee'], [360, 214, '#e88ab8']];
  // luminous storm ramp: bright blue through rose, gold, white — NO warmth
  // discipline here; a rare pale flick where the cloud bellies catch lightning
  // CHIAROSCURO: deep brooding storm-blue masses in the corners, ONE luminous
  // break of light — the eye of the storm — over the sheltering tree/Rock, so the
  // sky has real value-drama and a focal point instead of flat pastel confetti.
  const EYE = [WHEEL_X, 132];   // the break of light rides over the bent tree
  const skyCol = (x, y, r, lift) => {
    let near = 1e9; for (const v of V) near = Math.min(near, Math.hypot(x - v.x, y - v.y) / v.f);
    if (near < 1.3 && r() < 0.05) return jig(r() < 0.5 ? '#fffdf6' : '#f7c0d6', r, 12); // lightning glints at the tear-cores
    const rift = Math.exp(-Math.hypot(x - EYE[0], y - EYE[1]) / 210);  // 1 at the break → 0 in the deep corners
    const t = Math.max(0, Math.min(1, 0.22 + rift * 0.68 + fbm(x / 100, y / 100, 29) * 0.30));
    // deep indigo/storm-blue masses → dusk mauve → a warm gold-cream break of light
    let c = ramp(['#1f3560', '#2b4a76', '#3f6592', '#7791b4', '#c2adba', '#f2d29e', '#fdf3e4'], t);
    for (const [ex, ey, ec] of EGLOW) { const d2 = Math.hypot(x - ex, y - ey); c = mix(c, ec, Math.exp(-d2 / 95) * 0.42); } // eddy cores breathe jewel light
    if (lift) c = mix(c, '#fff4dd', lift);
    return jig(c, r, 9);
  };
  // the smooth storm-sky GROUND — one broad soft opaque pass of LONG flowing
  // strokes that trace the great wheel (high follow); the turbulent sheets above
  // add the gapped churn, so their gaps reveal this paint
  strokes(out, counter, {
    rng, n: 430, sample: rej(-10, -10, 810, 326, (x, y) => y < soilY(x) + 6),
    dir: skyDir, col: (x, y, r) => skyCol(x, y, r, 0),
    len: 44, lw: 9.5, steps: 4, follow: 0.91, wild: 0.05, aJ: slash, lenJ: 0.5, impasto: 0.5, relief: 0.55,
  });
  const skyGroundEnd = out.length;   // the smooth sky ground is the opaque SKY plane

  /* ---------------- 2. RAIN ---------------- */
  // long raking hairlines, all driven on the same diagonal, wilder near the
  // vortices — pale cold streaks that never touch gold
  strokes(out, counter, {
    rng, n: 130,
    // rain veils the DEEP masses only, never the luminous break (Turner: rain is LIGHT)
    sample: rej(-30, -20, 820, 320, (x, y) => y < soilY(x) + 4 && Math.hypot(x - EYE[0], y - EYE[1]) > 150),
    // falls down-east on the gale but BOWS along the great wheel (a cyclone bends its rain)
    dir: (x, y) => { const s = skyDir(x, y); return Math.atan2(Math.sin(s) * 0.5 + 0.55, Math.cos(s) * 0.5 + 0.6); },
    col: (x, y, r) => jig(mix('#8ea6c8', '#c6d6ec', r() * 0.7), r, 8),  // pale rain-LIGHT, luminous against the deep storm
    len: 62, lw: 0.9, steps: 3, follow: 1, aJ: slash, lenJ: 0.6, wJ: 0.35,
  });

  /* ---------------- 3. EASTER EGG — "5:3" in the swirl ---------------- */
  // Romans 5:3 hiding in the storm's upper-left churn — one murmur above
  // the night, brushwork only, a fourth-look whisper
  // Romans 5:3 ("tribulation worketh patience") in ORIGINAL KOINE GREEK numerals,
  // Εʹ·Γʹ (Ε=5, Γ=3), hidden in the storm's upper-left churn — a fourth-look whisper.
  E.inscriptionText(out, E.greekRef(5, 3), { x: 108, y: 76, h: 22, body: '#dfe6f0', edge: '#1a2440', op: 0.82, edgeOp: 0.5 });
  const skyEnd = out.length;   // opaque SKY plane: smooth ground + rain + the 5:3 egg
  // the stacked STORM-SWIRL SHEETS — each an independent bold, gapped pass of the
  // turbulent cloud (paint on paint), own rng per sheet, woven above the ground.
  const skySheets = SKY_SHEETS.map((e, k) => {
    const srng = mulberry32(seed + 1009 * (k + 1));
    const sh = [];
    strokes(sh, { n: 0 }, {
      rng: srng, n: e.n,
      sample: rej(-10, -10, 810, 326, (x, y) => y < soilY(x) + 6),
      dir: skyDir,
      col: (x, y, r) => skyCol(x, y, r, e.lift),
      len: e.len, lw: e.lw, steps: 5, follow: 0.9, wild: 0.13, lenJ: 0.55, impasto: 0.6, relief: 0.5,
    });
    return sh.join('\n');
  });

  /* ---------------- 4. EARTH CUTAWAY ---------------- */
  // dark soil mass below the crest — cold violet-umber far from the roots,
  // warming toward the buried glow; an orange spark exactly where it dies
  const earthCol = (x, y, r) => {
    const g = light(x, y);
    if (g > 0.16 && g < 0.3 && r() < 0.035) return jig('#c46a2a', r, 16); // ember flick at the glow's edge
    let c = ramp(['#6a6052', '#7c6e54', '#8c7450', '#a8863e', '#c49a44'], Math.min(1, g * 1.45 + fbm(x / 75, y / 75, 41) * 0.16));
    c = mix(c, '#5a5066', Math.max(0, 0.14 - g) * 1.3); // a lighter, lit earth now
    return jig(c, r, 8);
  };
  // the earth fans out from the trunk base, echoing the root spread; far
  // from the glow it settles back into horizontal strata
  const earthDir = (x, y) => {
    const a = Math.atan2(y - TB[1], x - TB[0]); // radial — fanning with the roots
    const [c, d] = curlV(x, y, 53, 90);
    const wsum = Math.min(1, 200 / (50 + Math.hypot(x - TB[0], y - TB[1])));
    return Math.atan2(Math.sin(a) * wsum + d * 0.6, Math.cos(a) * wsum + (x < TB[0] ? -1 : 1) * (1 - wsum) + c * 0.6);
  };
  strokes(out, counter, { rng, n: 880, sample: rej(-10, 270, 810, 510, (x, y) => y > soilY(x)), dir: earthDir, col: earthCol, len: 30, lw: 5, steps: 3, follow: 0.88, wild: 0.09, lenJ: 0.5 });
  // buried stones: a few cold knots the roots had to grow around
  for (const [sx, sy, sr] of [[300, 392, 13], [560, 430, 15], [380, 462, 11], [505, 352, 9]]) {
    strokes(out, counter, {
      rng, n: 34,
      sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 0.8) * sr; return [sx + Math.cos(a) * d * 1.3, sy + Math.sin(a) * d * 0.8]; },
      dir: (x, y) => Math.atan2(y - sy, x - sx) + Math.PI / 2,
      col: (x, y, r) => jig(mix('#3a3c46', '#52545e', light(x, y) * 0.8 + r() * 0.2), r, 5),
      len: 7, lw: 2.2, steps: 2,
    });
  }

  /* ---------------- 5. ROOT GLOW — the buried light ---------------- */
  // a warm pool breathing around the root system before the roots are laid:
  // dense small strokes, brightest along the spine, dying into the soil
  strokes(out, counter, {
    rng, n: 480,
    sample: r => {
      const t = r();
      const p = taproot(t);
      const a = r() * Math.PI * 2, d = Math.pow(r(), 1.25) * (96 - t * 26);
      const x = p[0] + Math.cos(a) * d * 1.35, y = p[1] + Math.sin(a) * d * 0.75;
      return y > soilY(x) + 3 ? [x, y] : null;
    },
    dir: earthDir,
    col: (x, y, r) => {
      const g = light(x, y);
      return jig(ramp([GOLD_DEEP, '#a8843a', '#6e5526', '#3c2c2a'], Math.max(0, 1 - g * 1.6)), r, 9);
    },
    len: 14, lw: 2.8, steps: 2, impasto: 0.52,
  });

  /* ---------------- 6. THE ROOTS — deeper than the tree is tall ---------------- */
  // each root: a polyline spine painted as overlapping tapered ribbons,
  // brightest gold near the heart of the glow, plus hairline rootlets
  const rootSpines = [
    [[432, TB[1]], [435, 330], [434, 378], [440, 430], [448, 472]],                 // taproot — the deepest
    [[428, TB[1] + 2], [398, 318], [364, 360], [340, 408], [330, 444]],            // west lateral
    [[438, TB[1] + 2], [476, 322], [510, 366], [528, 412], [538, 442]],            // east lateral
    [[426, TB[1] + 4], [414, 344], [402, 402], [394, 448]],                        // inner west
    [[440, TB[1] + 4], [456, 348], [466, 406], [478, 450]],                        // inner east
    [[422, TB[1] + 2], [378, 302], [336, 316], [300, 336]],                        // shallow west reach
    [[444, TB[1] + 2], [494, 304], [540, 320], [576, 342]],                        // shallow east reach
  ];
  const rootCol = (x, y, r, t) => jig(ramp([GOLD_HOT, GOLD_PALE, GOLD, GOLD_DEEP, '#8a6526'],
    Math.max(0, Math.min(1, 0.18 + (1 - light(x, y)) * 0.9 + t * 0.12))), r, 8);
  for (let ri = 0; ri < rootSpines.length; ri++) {
    const sp = rootSpines[ri];
    const w0 = ri === 0 ? 7.5 : ri < 5 ? 5.2 : 4;
    // smooth interp along the polyline
    const at = t => {
      const f = t * (sp.length - 1), i = Math.min(Math.floor(f), sp.length - 2), u = f - i;
      return [sp[i][0] + (sp[i + 1][0] - sp[i][0]) * u, sp[i][1] + (sp[i + 1][1] - sp[i][1]) * u];
    };
    for (let t = 0; t < 1; t += 0.07) {
      const p = at(t), p2 = at(Math.min(1, t + 0.085));
      const wob = (fbm(p[0] / 22, p[1] / 22, 83 + ri) - 0.5) * 3;
      const wL = w0 * (1 - t * 0.82) + 1.1;
      out.push(ribbon([[p[0] + wob, p[1]], [(p[0] + p2[0]) / 2 + wob * 0.5, (p[1] + p2[1]) / 2], [p2[0], p2[1]]],
        wL, rootCol(p[0], p[1], rng, t), [0.5, 0.5, 0.44]));
      counter.n++;
    }
    // rootlets: 3-4 hairline forks flicking off the spine into the dark
    const nf = 3 + (ri < 3 ? 1 : 0);
    for (let k = 0; k < nf; k++) {
      const t = 0.25 + rng() * 0.65;
      const p = at(t);
      const a = Math.atan2(at(Math.min(1, t + 0.05))[1] - p[1], at(Math.min(1, t + 0.05))[0] - p[0]) + (rng() < 0.5 ? -1 : 1) * (0.6 + rng() * 0.5);
      const ll = 14 + rng() * 22;
      const tip = [p[0] + Math.cos(a) * ll, p[1] + Math.abs(Math.sin(a)) * ll * 0.8 + 4];
      paintPath(out, counter, rng, [p, [(p[0] + tip[0]) / 2 + (rng() - 0.5) * 5, (p[1] + tip[1]) / 2], tip],
        (x, y, r) => jig(mix(GOLD_DEEP, '#6e5526', 0.3 + r() * 0.5), r, 9),
        { lw: 1.5, len: 5, density: 0.5, jitter: 1.1 });
    }
  }
  // the glowing heart where the taproot passes mid-depth: a dense warm knot
  {
    const hp = taproot(0.5);
    strokes(out, counter, {
      rng, n: 90,
      sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 1.4) * 16; return [hp[0] + Math.cos(a) * d * 1.2, hp[1] + Math.sin(a) * d]; },
      dir: (x, y) => Math.atan2(x - hp[0], -(y - hp[1])),
      col: (x, y, r) => jig(ramp([GOLD_HOT, GOLD_PALE, GOLD], Math.hypot(x - hp[0], y - hp[1]) / 19), r, 7),
      len: 7, lw: 2.3, steps: 2, impasto: 0.6,
    });
  }

  /* ---------------- 7. EASTER EGG — the anchor root ---------------- */
  // the taproot's last reach curls into a small anchor: shank, crossbar,
  // curved flukes — hope holds where it is deepest (Hebrews 6:19).
  // Painted barely above the surrounding earth, brushwork only.
  {
    const tip = taproot(1); // ~[448, 472]
    const aCol = (x, y, r) => jig(mix(GOLD_DEEP, '#7a5c2c', 0.35 + r() * 0.3), r, 8);
    paintPath(out, counter, rng, [[tip[0], tip[1] - 22], [tip[0], tip[1] + 2]], aCol, { lw: 1.8, len: 4.5, density: 0.55, jitter: 1 });            // shank
    paintPath(out, counter, rng, [[tip[0] - 8, tip[1] - 16], [tip[0] + 8, tip[1] - 16]], aCol, { lw: 1.6, len: 4, density: 0.55, jitter: 0.9 });   // crossbar
    paintPath(out, counter, rng, [[tip[0] - 13, tip[1] - 8], [tip[0] - 9, tip[1] + 2], [tip[0], tip[1] + 6], [tip[0] + 9, tip[1] + 2], [tip[0] + 13, tip[1] - 8]], aCol, { lw: 1.7, len: 4.5, density: 0.55, jitter: 1 }); // flukes
  }

  /* ---------------- 8. SOIL CREST — the seam ---------------- */
  // a tight dark band along the crest: the lid the storm beats against.
  // Only right at the trunk does a thin warm seam leak up from below.
  strokes(out, counter, {
    rng, n: 300,
    sample: rej(-10, 262, 810, 332, (x, y) => y > soilY(x) - 3 && y < soilY(x) + 16),
    dir: x => { const e = 6; return Math.atan2(soilY(x + e) - soilY(x - e), 2 * e); },
    col: (x, y, r) => {
      const warm = Math.max(0, 1 - Math.abs(x - TB[0]) / 60);
      let c = mix('#181426', '#2c2438', fbm(x / 55, y / 20, 47));
      return jig(mix(c, '#6e5526', warm * 0.55), r, 7);
    },
    len: 20, lw: 3.4, steps: 3, wild: 0.08,
  });

  /* ---------------- BACKGROUND LIFE — birds in the gale (Matt 6:26) ---------------- */
  for (const [bx, by, s] of [[180, 92, 0.9], [240, 70, 0.8], [150, 120, 0.7]]) {
    paintPath(out, counter, rng, [[bx - 6 * s, by + 3 * s], [bx, by - 1 * s], [bx + 5 * s, by + 4 * s]], (x, y, r) => jig('#3a4452', r, 6), { lw: 1.5 * s, len: 3.2, density: 0.9, jitter: 0.7 });
  }

  /* ---------------- 9. THE TREE — bowed, not broken ---------------- */
  // trunk: a hard quadratic bow to the east — the storm has it by the crown.
  // It starts BELOW the soil line, growing straight out of the root collar.
  const trunk = t => {
    const c = [438, 224], e = [512, 184];
    const u = 1 - t;
    return [u * u * TB[0] + 2 * u * t * c[0] + t * t * e[0],
            u * u * (TB[1] + 8) + 2 * u * t * c[1] + t * t * e[1]];
  };
  // dark halo behind the trunk so it reads against churn above and gold below
  for (let t = 0; t < 1; t += 0.09) {
    const p = trunk(t), p2 = trunk(Math.min(1, t + 0.105));
    out.push(ribbon([p, [(p[0] + p2[0]) / 2, (p[1] + p2[1]) / 2], p2], (12 * (1 - t * 0.62) + 4.2) + 5, '#0b0f20', [0.5, 0.5, 0.46]));
    counter.n++;
  }
  // the trunk itself: overlapping tapered ribbons, bark-dark, only a whisper
  // of warmth at the buried collar where the glow climbs
  for (let t = 0; t < 1; t += 0.07) {
    const p = trunk(t), p2 = trunk(Math.min(1, t + 0.085));
    const wL = 12 * (1 - t * 0.62) + 3.4;
    const base = mix('#1c1830', '#2e2840', fbm(p[0] / 18, p[1] / 18, 59));
    const cc = jig(mix(base, '#6e5526', Math.max(0, 0.2 - t * 0.8)), rng, 7);
    out.push(ribbon([p, [(p[0] + p2[0]) / 2, (p[1] + p2[1]) / 2], p2], wL, cc, [0.5, 0.52, 0.46]));
    counter.n++;
  }
  // root collar: two dark flares where the trunk grips the crest
  out.push(ribbon([[TB[0] - 13, TB[1] + 7], [TB[0] - 4, TB[1] + 1]], 6.5, '#191430', [0.4, 0.52])); counter.n++;
  out.push(ribbon([[TB[0] + 12, TB[1] + 7], [TB[0] + 4, TB[1] + 1]], 6.5, '#191430', [0.4, 0.52])); counter.n++;
  // bark texture strokes along the trunk axis
  strokes(out, counter, {
    rng, n: 110,
    sample: r => { const t = r(); const p = trunk(t); const a = r() * Math.PI * 2; const d = r() * (5.5 * (1 - t * 0.6)); return [p[0] + Math.cos(a) * d, p[1] + Math.sin(a) * d]; },
    dir: (x, y) => { // local trunk tangent
      let bt = 0, bd = 1e9;
      for (let t = 0; t <= 1; t += 0.1) { const p = trunk(t); const d = Math.hypot(x - p[0], y - p[1]); if (d < bd) { bd = d; bt = t; } }
      const a = trunk(Math.max(0, bt - 0.04)), b = trunk(Math.min(1, bt + 0.04));
      return Math.atan2(b[1] - a[1], b[0] - a[0]);
    },
    col: (x, y, r) => jig(mix('#241e36', '#3c3450', r() * 0.7), r, 6),
    len: 9, lw: 1.8, steps: 2,
  });
  // two whip branches streaming east off the upper trunk
  for (const [t0, dx, dy, bw] of [[0.72, 58, -10, 3.2], [0.9, 66, 4, 2.8]]) {
    const b = trunk(t0);
    const tip = [b[0] + dx, b[1] + dy];
    const ctl = [b[0] + dx * 0.45, b[1] + dy * 0.5 - 9];
    for (let t = 0; t < 1; t += 0.12) {
      const u = 1 - t, u2 = 1 - (t + 0.14);
      const p = [u * u * b[0] + 2 * u * t * ctl[0] + t * t * tip[0], u * u * b[1] + 2 * u * t * ctl[1] + t * t * tip[1]];
      const tt = Math.min(1, t + 0.14);
      const p2 = [u2 * u2 * b[0] + 2 * u2 * tt * ctl[0] + tt * tt * tip[0], u2 * u2 * b[1] + 2 * u2 * tt * ctl[1] + tt * tt * tip[1]];
      out.push(ribbon([p, p2], bw * (1 - t * 0.8) + 0.7, jig(mix('#241e36', '#3a3148', rng() * 0.6), rng, 6)));
      counter.n++;
    }
  }
  // canopy: leaves streamed hard east of the crown — dark storm-olive mass,
  // every stroke combed by the wind; pale undersides flash where it tears
  const CR = trunk(0.93);
  const canCx = CR[0] + 52, canCy = CR[1] - 4;
  strokes(out, counter, {
    rng, n: 430,
    sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 0.8); return [canCx + Math.cos(a) * d * 88, canCy + Math.sin(a) * d * 26 + Math.cos(a) * d * 10]; },
    dir: (x, y) => 0.08 + (fbm(x / 40, y / 40, 67) - 0.5) * 0.5,
    col: (x, y, r) => {
      if (r() < 0.07) return jig(mix('#7d967e', '#9ab295', r()), r, 10); // underside flash
      return jig(ramp(['#1c2a26', '#2c3e2c', '#41522f', '#566236'], fbm(x / 30, y / 30, 71) + r() * 0.25), r, 9);
    },
    len: 16, lw: 2.6, steps: 3, follow: 0.95, wild: 0.12, lenJ: 0.55, aJ: 0.3,
  });
  // torn leaves flying downwind, scattering east off the canopy
  strokes(out, counter, {
    rng, n: 26,
    sample: r => [canCx + 60 + r() * 130, canCy - 18 + r() * 50],
    dir: () => 0.2,
    col: (x, y, r) => jig(mix('#41522f', '#6b7a48', r()), r, 10),
    len: 6, lw: 1.7, steps: 2,
  });

  /* ---------------- 10. THE CHILD — sheltering at the trunk ---------------- */
  // small, in deep red, pressed to the leeward (east) side of the trunk,
  // arms wrapped around it. Lit faintly from BELOW by the root glow.
  const fy = soilY(446) + 2;
  const cx = 447;
  // articulated child standing FIRM, braced, leaning slightly into the wind,
  // feet planted wide, arms drawn in close to steady itself
  const childCaps = personCaps(cx, fy - 32, 33, {
    lean: -2,                          // upper body leans into the wind
    headTilt: -1,
    leftHand: [cx - 8, fy - 9],        // arm held in close, bracing
    rightHand: [cx + 7, fy - 8],
    leftFoot: [cx - 7, fy + 1],        // planted wide & firm
    rightFoot: [cx + 7, fy + 1],
  });
  // calm warm pool at the tree's foot (the glow leaking up through the seam)
  const nearChild = (x, y, m) => childCaps.some(c => segDist(x, y, c.ax, c.ay, c.bx, c.by) <= c.r + m);
  strokes(out, counter, {
    rng, n: 130,
    sample: r => {
      const a = r() * Math.PI * 2, d = Math.pow(r(), 1.4) * 34;
      const x = TB[0] + 8 + Math.cos(a) * d * 1.6, y = soilY(TB[0] + 8 + Math.cos(a) * d * 1.6) + 2 + Math.abs(Math.sin(a)) * d * 0.3;
      return nearChild(x, y, 2) ? null : [x, y];
    },
    dir: x => { const e = 6; return Math.atan2(soilY(x + e) - soilY(x - e), 2 * e); },
    col: (x, y, r) => jig(ramp([mix(GOLD_DEEP, '#4a3a20', 0.3), '#5c4524', '#2c2438', '#181426'], Math.abs(x - TB[0] - 8) / 52), r, 7),
    len: 11, lw: 2.4, steps: 2, relief: 0,
  });
  // THE MAIN CHARACTER — "you": consistent deep-red clothes + bold dark outline
  // via the shared helper, so the same child reads across the whole book.
  castShadow(out, counter, childCaps, { dir: 0.2 });
  paintChild(out, counter, rng, childCaps, { whiteAura: true });
  // glow rim from BELOW: the buried gold catches the child's lower flank
  strokes(out, counter, {
    rng, n: 22,
    sample: rej(cx - 16, fy - 18, cx + 12, fy + 2, (x, y) => childCaps.some(c => inCap(x, y, c)) && !childCaps.some(c => inCap(x, y + 3.5, c))),
    dir: () => 0.12,
    col: (x, y, r) => jig(mix(GOLD_DEEP, '#a8742c', r() * 0.5), r, 9),
    len: 3.6, lw: 1.4, steps: 2, relief: 0,
  });
  // and a cold storm rim on the head's windward crown — rain-light, not gold
  strokes(out, counter, {
    rng, n: 9,
    sample: rej(cx - 5, fy - 31, cx + 7, fy - 22, (x, y) => inCap(x, y, childCaps[0]) && !inCap(x, y - 3, childCaps[0])),
    dir: () => 0.3,
    col: (x, y, r) => jig('#5d7490', r, 8),
    len: 3, lw: 1.2, steps: 2, relief: 0,
  });

  /* ---------- CHILD PROMINENCE (append-only, per seeds §8) ----------
     One more push so the red reads at thumbnail size against the dark
     trunk: re-lay the consistent main-character figure, then the glow
     rim from below again. */
  paintChild(out, counter, rng, childCaps, { whiteAura: true });
  strokes(out, counter, {
    rng, n: 24,
    sample: rej(cx - 16, fy - 18, cx + 12, fy + 2, (x, y) => childCaps.some(c => inCap(x, y, c)) && !childCaps.some(c => inCap(x, y + 3.5, c))),
    dir: () => 0.12,
    col: (x, y, r) => jig(mix(GOLD_DEEP, '#b87e2e', r() * 0.5), r, 9),
    len: 3.6, lw: 1.5, steps: 2, relief: 0,
  });
  // wind-bent grass FRINGE along the soil crest so the storm-sky↔ground seam
  // reads organic, not a ruled line (MID)
  E.horizonFringe(out, counter, rng, { horizonFn: soilY, x0: -10, x1: 810, cols: ['#2c4a32', '#3a5e3a', '#4e7e42', '#6a9a4e'], hMax: 18, lightFn: light, seed: 314, dirJitter: 0.5 });

  /* ---------------- LIFE — the sheltering pair (Psalm 91:4) ---------------- */
  // "He shall cover thee with his feathers, and under his wings shalt thou
  // trust." Two birds tucked in the tree's LEE at the root collar, just past
  // the child. Everything else in the plate bends east under the gale — the
  // sheltered pair is STILL: rounded contour strokes, no wind-combing. Warm
  // cream/amber against the cold dark crest, lit from BELOW by the buried
  // root-glow like the child.  [MID — part of the rooted system]
  {
    const G0 = soilY(418);
    const big = { x: 417.5, y: G0 - 6.2, s: 1.12 };  // the covering bird, trunk side, head raised over its mate
    const small = { x: 407, y: G0 - 4.4, s: 0.8 };   // the covered bird, tucked low on the windward side
    // dark pocket halo behind the pair so the warm shapes read on the crest
    strokes(out, counter, {
      rng, n: 62,
      sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 0.65); return [412 + Math.cos(a) * d * 17.5, G0 - 6 + Math.sin(a) * d * 10.5]; },
      dir: (x, y) => Math.atan2(x - 412, -(y - (G0 - 6))),
      col: (x, y, r) => jig('#0e0a1c', r, 4),
      len: 8, lw: 3.8, steps: 2, relief: 0,
    });
    for (const B of [small, big]) {   // small first — the big one huddles over it
      const rx = 7.6 * B.s, ry = 5.4 * B.s;
      // body: contour-following CURVED strokes (living = curved; the pair does not bend)
      strokes(out, counter, {
        rng, n: Math.round(60 * B.s),
        sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 0.75); return [B.x + Math.cos(a) * d * rx, B.y + Math.sin(a) * d * ry]; },
        dir: (x, y) => Math.atan2(x - B.x, -(y - B.y)),
        col: (x, y, r) => jig(ramp(['#6e4522', '#c98a3e', '#e8b56a', '#f7e3bc'], 0.5 + (y - B.y) / (ry * 2.2) + r() * 0.12), r, 7),
        len: 5.5 * B.s + 2, lw: 2.2 * B.s + 0.6, steps: 2, follow: 0.9, relief: 0,
      });
      // head: a calm pale round knot lifted clear of the body silhouette,
      // turned EAST toward the trunk (and the child)
      const hx = B.x + rx * 0.62, hy = B.y - ry * 1.15;
      strokes(out, counter, {
        rng, n: Math.round(22 * B.s),
        sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 0.7) * 3.6 * B.s; return [hx + Math.cos(a) * d, hy + Math.sin(a) * d * 0.9]; },
        dir: (x, y) => Math.atan2(x - hx, -(y - hy)),
        col: (x, y, r) => jig(mix('#e8b56a', '#f9ecd0', 0.35 + r() * 0.4), r, 7),
        len: 4, lw: 1.8 * B.s + 0.4, steps: 2, relief: 0,
      });
      // eye: one dark dot; beak: one tiny flick toward the trunk
      out.push(ribbon([[hx + 0.5, hy - 0.4], [hx + 1.6, hy - 0.2]], 1.7 * B.s + 0.4, '#1a1224')); counter.n++;
      out.push(ribbon([[hx + 3.2 * B.s, hy + 0.4], [hx + 5.2 * B.s, hy + 1.1]], 1.2, '#6e4522')); counter.n++;
      // gold rim from BELOW — the buried root-glow catches the breast (same light as the child)
      strokes(out, counter, {
        rng, n: 7,
        sample: r => { const a = Math.PI * (0.15 + 0.7 * r()); return [B.x - Math.cos(a) * rx * 0.9, B.y + Math.sin(a) * ry * 0.92]; },
        dir: () => 0.1,
        col: (x, y, r) => jig(mix(GOLD_DEEP, '#e8a83e', r() * 0.5), r, 8),
        len: 3.2, lw: 1.1, steps: 2, relief: 0,
      });
    }
    // THE WING — the big bird's near wing sweeps WINDWARD over its mate,
    // shielding it: "under his wings shalt thou trust" — a dark under-wing
    // shadow first (separates the two bodies), then curved amber ribbons
    const w0 = [big.x + 1, big.y - 4.8], w1 = [408, G0 - 11], w2 = [400.5, G0 - 3.5];
    out.push(ribbon([[w0[0], w0[1] + 2.6], [w1[0], w1[1] + 3], [w2[0] + 1, w2[1] + 1.6]], 2.6, '#3a2416', [0.4, 0.55, 0.4])); counter.n++;
    for (const [off, wd, cc] of [[-1.4, 2.2, '#8a5a2e'], [0, 3.2, '#b07a34'], [1.6, 2.4, '#d9a052']]) {
      out.push(ribbon([[w0[0], w0[1] + off], [w1[0], w1[1] + off], [w2[0], w2[1] + off * 0.5]], wd, jig(cc, rng, 7), [0.4, 0.55, 0.4]));
      counter.n++;
    }
    // feather tips: short curved flicks where the wing's edge meets the ground
    for (const [fx, fy2] of [[401.5, G0 - 4], [404, G0 - 2.5], [407, G0 - 1.8]]) {
      out.push(ribbon([[fx + 2.6, fy2 - 2.6], [fx, fy2]], 1.3, jig('#c98a3e', rng, 6))); counter.n++;
    }
  }

  // FRUITFUL soil — low jewel bushes bearing through the gale (the land is never
  // barren, even in the storm); on the soil line, warmed by the buried root-light  [FG plane]
  const _fgBushes = out.length;
  E.jewelBush(out, counter, rng, 120, 305, 22, 14, E.LEAF_PALETTES[1], light);
  E.jewelBush(out, counter, rng, 720, 300, 20, 13, E.LEAF_PALETTES[3], light);
  E.jewelBush(out, counter, rng, 250, 308, 16, 10, E.LEAF_PALETTES[4], light);
  fgRanges.push([_fgBushes, out.length]);   // ← the jewel bushes are foreground

  // MULTIPLANE: assemble the requested depth plane. Each is its own cel —
  // transparent where it has no content — so they stack and parallax apart.
  const ALT = 'A churning storm bends a young tree hard to one side while a small child in deep red shelters at its trunk; below the soil in cutaway, the tree’s roots glow warm gold, reaching deeper than the tree stands tall.';
  const RAW = { undercoat: 0, weave: 0, varnish: 0, oil: 0 };   // no baked surface — the live filter unifies the planes
  const pick = ranges => ranges.map(([a, b]) => out.slice(a, b).join('\n')).join('\n');
  const fgSet = new Set();
  for (const [a, b] of fgRanges) for (let i = a; i < b; i++) fgSet.add(i);
  if (LAYER === 'sky') return svgWrap(ALT, out.slice(0, skyEnd).join('\n'), RAW);   // smooth storm sky ground + rain (opaque)
  const sm = LAYER.match(/^sky(\d+)$/);
  if (sm) return svgWrap(ALT, '<g>' + skySheets[+sm[1] - 1] + '</g>', RAW);         // one storm-swirl sheet
  if (LAYER === 'fg') return svgWrap(ALT, pick(fgRanges), RAW);                     // the jewel bushes
  if (LAYER === 'mid') {                                                            // the whole rooted-tree system + fringe
    const body = out.filter((_, i) => i >= skyEnd && !fgSet.has(i)).join('\n');
    return svgWrap(ALT, body, RAW);
  }
  // full painting (desktop): ground, the stacked storm-sheets, then rain + egg + everything else
  return svgWrap(ALT, out.slice(0, skyGroundEnd).concat(skySheets, out.slice(skyGroundEnd)).join('\n'));
}
