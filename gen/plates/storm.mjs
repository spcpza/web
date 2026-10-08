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
// ⭐ DETAIL PASS (Sep 8): finer sheets, every stroke its own width and length (free hashes,
// no rule — see widthOf/lengthOf in paint()); the storm keeps its flow and its lightning.
export const SKY_SHEETS = [
  { n: 640, len: 38, lw: 3.2, lift: 0.00 },
  { n: 560, len: 32, lw: 2.8, lift: 0.06 },
];
export const layers = [
  { name: 'sky', opaque: true },  // smooth storm-sky ground + rain (backmost, opaque)
  ...SKY_SHEETS.map((_, i) => ({ name: 'sky' + (i + 1) })),   // stacked storm-swirl sheets
  { name: 'mid', op: 1 },         // the bent tree, roots, cutaway EARTH (solid ground, not see-through) + crest fringe
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
  // ⚠ THE GALE HAS TO CARRY THINGS AWAY, NOT JUST SHAKE THEM. The boil bends the tree —
  // every mark displaced and returned — but displacement can only ever OSCILLATE, and a
  // storm strips a tree. Torn leaves need to TRAVEL, so they are drawn at six successive
  // points along their own flight and the ring plays them: each leaf crosses the plate
  // once per turn and wraps. Same law as the rest of the book — draw the movement, never
  // fake it with an effect.
  const _F = (globalThis.__FRAME || 0), _FN = Math.max(2, globalThis.__FRAME_N || 6);
  // ⭐ EVERY STROKE DRAWS ITS OWN WIDTH AND LENGTH (Fred: "use no rules, a paint stroke
  // just exist because it exist") — two independent hashes per mark, no field, no coupling.
  const free = (x, y, salt) => { const n = Math.sin(x * 12.9898 + y * 78.233 + salt) * 43758.5453; return n - Math.floor(n); };
  const widthOf  = (x, y, salt) => 0.40 + 3.2 * Math.pow(free(x, y, salt), 2.6);
  const lengthOf = (x, y, salt) => 0.40 + 1.5 * Math.pow(free(x, y, salt + 17), 1.5);
  const PH = (_F % _FN) / _FN;
  // ⚠ ONE GUST PER TURN, AND EVERYTHING ANSWERS IT. Aligned with the boil's own phase
  // (dx ∝ cos(2π·F/N)) so the trunk's furthest bend east and the crown's furthest stream
  // happen on the SAME drawing. A tree whose trunk bends on one beat and whose leaves
  // stream on another is two animations, not one wind.
  const GUST = 0.5 + 0.5 * Math.cos(PH * Math.PI * 2);
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
    /* ⚠ THE BREAK WAS THE WHOLE SKY (Sep 21). This page's own note asks for "deep brooding
       storm-blue masses in the corners, ONE luminous break of light" — but with a 210-unit falloff
       and a floor of 0.22, a point 400 units from the eye still sat at t≈0.47: dusk mauve. Nothing
       ever reached the indigo end of the ramp, the eddies' rose glow lifted what was left, and the
       page that says "storms still came" wore a pastel lilac swirl. Tightened so the light is a
       BREAK — bright over the tree and the Rock, gone by the corners — which is also what makes
       the gold roots below blaze: bright only reads against dark. Never black: the floor is indigo. */
    const rift = Math.exp(-Math.pow(Math.hypot(x - EYE[0], (y - EYE[1]) * 1.25) / 150, 1.35));  // 1 at the break → 0 in the deep corners
    const t = Math.max(0, Math.min(1, 0.05 + rift * 0.86 + fbm(x / 100, y / 100, 29) * 0.26));
    // deep indigo/storm-blue masses → dusk mauve → a warm gold-cream break of light
    let c = ramp(['#16264e', '#1f3560', '#2b4a76', '#3f6592', '#7791b4', '#c2adba', '#f2d29e', '#fdf3e4'], t);
    for (const [ex, ey, ec] of EGLOW) { const d2 = Math.hypot(x - ex, y - ey); c = mix(c, ec, Math.exp(-d2 / 70) * 0.24); } // eddy cores breathe jewel light (a breath, not a wash — at 0.42 over 95 they turned the storm rose)
    if (lift) c = mix(c, '#fff4dd', lift);
    return jig(c, r, 9);
  };
  // the smooth storm-sky GROUND — one broad soft opaque pass of LONG flowing
  // strokes that trace the great wheel (high follow); the turbulent sheets above
  // add the gapped churn, so their gaps reveal this paint
  strokes(out, counter, {
    rng, n: 1300, sample: rej(-10, -10, 810, 326, (x, y) => y < soilY(x) + 6),
    dir: skyDir, col: (x, y, r) => skyCol(x, y, r, 0),
    len: (x, y) => 30 * lengthOf(x, y, 11), lw: (x, y) => 4.6 * widthOf(x, y, 13), steps: 4, follow: 0.91, wild: 0.05, aJ: slash, lenJ: 0.3, wJ: 0.3, impasto: 0.5, relief: 0.4,
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
  /* ⭐ "AND IT SHALL COME TO PASS, WHEN I BRING A CLOUD OVER THE EARTH, THAT THE BOW SHALL BE SEEN IN
     THE CLOUD" (Gen 9:14). The page says "Storms still came… He would not let you go" — and the
     sign He gave for exactly that is a bow IN the cloud. It stands in the dark mass to the west,
     opposite the break of light (a bow is always opposite the light), laid in the sky's own
     base plane so the torn cloud sheets above it veil it in places: seen IN the cloud, not
     pasted on it. Faint — it is a token, not the subject. (Sep 21.) */
  {
    const BX = 176, BY = 338, B0 = 204, B1 = 222;
    strokes(out, counter, {
      rng: mulberry32(seed ^ 0x914), n: 520,
      sample: r => { const a2 = Math.PI * (1.08 + r() * 0.60), rr = B0 + r() * (B1 - B0);
                     const x = BX + Math.cos(a2) * rr, y = BY + Math.sin(a2) * rr;
                     return (y < soilY(x) - 8 && Math.hypot(x - EYE[0], y - EYE[1]) > 120) ? [x, y] : null; },
      dir: (x, y) => Math.atan2(y - BY, x - BX) + Math.PI / 2,
      col: (x, y, r) => jig(ramp(['#b79cf0', '#6fa8f0', '#5fd0a0', '#e8e27a', '#f2a860', '#ee7a7a'], (Math.hypot(x - BX, y - BY) - B0) / (B1 - B0)), r, 6),
      len: 26, lw: 2.6, steps: 5, follow: 1, lenJ: 0.4, wJ: 0.3, aJ: 0.04, relief: 0, impasto: 0, op: 0.34, flow: 0,
    });
  }
  const skyEnd = out.length;   // opaque SKY plane: smooth ground + rain + the 5:3 egg + the bow
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
      len: (x, y) => e.len * lengthOf(x, y, 21 + k), lw: (x, y) => e.lw * widthOf(x, y, 27 + k),
      steps: 5, follow: 0.9, wild: 0.1, lenJ: 0.3, wJ: 0.3, impasto: 0.6, relief: 0.4,
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
  strokes(out, counter, { rng, n: 2000, sample: rej(-10, 270, 810, 510, (x, y) => y > soilY(x)), dir: earthDir, col: earthCol,
    len: (x, y) => 26 * lengthOf(x, y, 31), lw: (x, y) => 2.8 * widthOf(x, y, 33), steps: 3, follow: 0.88, wild: 0.06, lenJ: 0.3, wJ: 0.3, relief: 0.35 });   // ⚠ relief was the default 1 — slabs
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

  /* ══ 4b · THE ROCK IT IS FOUNDED UPON ══════════════════════════════════════
     ⚠ THE PAGE'S OWN VERSE NAMES FOUR THINGS AND THE PLATE HAD ONLY THREE.
     Matt 7:25: "And the RAIN descended, and the FLOODS came, and the WINDS blew, and beat
     upon that house; and it fell not: FOR IT WAS FOUNDED UPON A ROCK." The rain is here,
     the wind is here, the roots go deep — but the one thing the verse gives as the REASON
     it held was nowhere in the picture. The roots simply ended in dark soil.
     So the whole system comes down onto bedrock. It is the darkest mass on the plate and
     it lies under the brightest thing on it, which is also the right way round: the light
     is what the roots are, the rock is what they hold. */
  {
    const RK = { x: 452, y: 500, rx: 152, ry: 54 };
    strokes(out, counter, {
      rng, n: 1600,
      sample: r => { const a2 = r() * Math.PI * 2, d = Math.pow(r(), 0.55);
                     const x = RK.x + Math.cos(a2) * RK.rx * d, y = RK.y + Math.sin(a2) * RK.ry * d;
                     return y < 447 ? null : [x, y]; },
      // bedding planes: a stone is the one INERT thing down here, so it lies in flat
      // courses while every living thing on the page curves (Munch)
      dir: (x, y) => 0.04 + (fbm(x / 44, y / 26, 71) - 0.5) * 0.42,
      col: (x, y, r) => {
        const up = Math.max(0, Math.min(1, (RK.y - y) / RK.ry));
        // ⚠ A ROCK THE COLOUR OF THE SOIL IS NOT A ROCK. The first pass ran '#20232b'
        // upward — within a few steps of the dark blue earth around it — and the root glow
        // then washed straight over the top, so the stone simply vanished and the grip
        // roots appeared to clamp onto nothing. Stone has to differ from soil in VALUE and
        // in surface, not just in the direction of its strokes.
        let c = ramp(['#333849', '#434a5e', '#565e73', '#6b7488', '#87909f'], up * 0.5 + r() * 0.3);
        c = mix(c, GOLD_DEEP, light(x, y) * up * 0.8);       // the buried light rakes its top face
        return jig(c, r, 6);
      },
      len: (x, y) => 12 * lengthOf(x, y, 41), lw: (x, y) => 2.4 * widthOf(x, y, 43), steps: 2, lenJ: 0.3, wJ: 0.3, impasto: 0.55, relief: 0.3,
    });
    // ⚠ AND IT NEEDS A CROWN. What makes a buried stone read is the one lit edge along its
    // top, where the light in the roots grazes it — without that there is no silhouette for
    // the eye to find, only a slightly different patch of dark.
    strokes(out, counter, {
      rng, n: 420,
      sample: r => { const u = -1 + r() * 2;
                     const x = RK.x + u * RK.rx * 0.99;
                     const yTop = RK.y - RK.ry * Math.sqrt(Math.max(0, 1 - u * u));
                     return [x, yTop + Math.pow(r(), 1.6) * 13]; },
      dir: (x) => { const u = (x - RK.x) / RK.rx; return Math.atan2(u * 0.9, 1); },
      col: (x, y, r) => jig(mix(ramp(['#7b8394', '#949cab', '#b0b7c2'], r()),
        GOLD_PALE, Math.min(0.72, light(x, y) * 0.9)), r, 7),
      len: (x, y) => 8 * lengthOf(x, y, 51), lw: (x, y) => 1.6 * widthOf(x, y, 53), steps: 2, lenJ: 0.3, wJ: 0.3, impasto: 0.6, relief: 0.35,
    });
    for (const seam of [[[346, 466], [402, 500]], [[506, 458], [472, 500]], [[566, 474], [540, 500]]])
      paintPath(out, counter, rng, seam, (x, y, r) => jig('#161923', r, 5), { lw: 1.7, len: 5, density: 0.7, jitter: 0.9 });
    /* ⭐ "O THOU AFFLICTED, TOSSED WITH TEMPEST, AND NOT COMFORTED, BEHOLD, I WILL LAY THY STONES WITH
       FAIR COLOURS, AND LAY THY FOUNDATIONS WITH SAPPHIRES" (Isa 54:11) — spoken TO someone in a
       storm, which is this page. The rock the roots hold was grey all the way down. Its lowest
       course is sapphire now: cut stones (made → straight) in the deep blues, each with its lit
       bevel, glinting where the buried light reaches — the foundation under the foundation.
       And round it, in the dark earth, the "stones with fair colours" — agate and carbuncle
       among them (54:12) — rounded, because a stone in the ground is a natural thing. (Sep 21.) */
    const gR = mulberry32(seed ^ 0x5411);
    const SAPH = ['#1f4fc4', '#2a63d8', '#3b7be6', '#1a3f9e', '#4a8ff0'];
    // ⚠ SECOND CUT. The first course was seventeen identical tiles in a ruled row — it read as a
    // strip of INTERFACE along the bottom of the page. A foundation is LAID: stones of different
    // lengths, in two courses that break joint, the upper course only where the rock is deep
    // enough to hold it, and each stone its own depth of blue.
    out.push(`<path d="M${R1(RK.x - RK.rx * 0.9)} 500L${R1(RK.x - RK.rx * 0.74)} 477L${R1(RK.x + RK.rx * 0.74)} 477L${R1(RK.x + RK.rx * 0.9)} 500Z" fill="#07080f"/>`); counter.n++;   // the pûḵ: the black bed they are set in
    for (const [y0, y1, off] of [[488.5, 499.5, 0], [477.5, 488, 7]]) {
      let x = RK.x - RK.rx * 0.92 + off;
      while (x < RK.x + RK.rx * 0.92) {
        const w = 11 + gR() * 11, mx = x + w / 2, u = (mx - RK.x) / RK.rx;
        const top = RK.y - RK.ry * Math.sqrt(Math.max(0, 1 - u * u));
        if (top < y0 - 3 && Math.abs(u) < 0.94)
          E.cutGem(out, counter, x + 1.1, y0 + 0.7, x + w - 1.1, y1 - 0.7, mix(mix(SAPH[(gR() * SAPH.length) | 0], '#0e1a4a', gR() * 0.35), GOLD_DEEP, light(mx, y0) * 0.22), { glint: 0.55 });
        x += w;
      }
    }
    /* ⚠⚠ THE COLOURED STONES ARE GONE, AND THIS IS WHY (Sep 21). Fred: "the rocks below the ground on
       storm is colourful. it is kind of weird. just wondering why you did this." I had read the
       KJV's "I will lay thy stones with FAIR COLOURS" as many-coloured stones and scattered
       pebbles through the earth. The Hebrew word is pûḵ (H6320) — and everywhere else it appears
       it is EYE-PAINT: Jezebel "painted her face" (2 Kgs 9:30), "rentest thy face with painting"
       (Jer 4:30); in 1 Chr 29:2 it is the "glistering stones" David stored for the Temple. Pûḵ is
       antimony, the black kohl that makes an eye shine by darkening round it. So the verse does
       not promise coloured stones: it promises stones SET IN DARK MORTAR so that they glisten —
       and its subject is a city being rebuilt (foundations, windows, gates, borders, v.12), not
       loose pebbles. His eye was right and my reading was only the English surface.
       What the verse does say plainly — "lay thy foundations with sapphires" — stays, and is now
       laid the way pûḵ means: each sapphire bedded in black, the dark joint round it doing for
       the stone what kohl does for an eye. */
  }

  /* ---------------- 5. ROOT GLOW — the buried light ---------------- */
  // a warm pool breathing around the root system before the roots are laid:
  // dense small strokes, brightest along the spine, dying into the soil
  strokes(out, counter, {
    rng, n: 900,
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
    len: (x, y) => 13 * lengthOf(x, y, 61), lw: (x, y) => 1.8 * widthOf(x, y, 63), steps: 2, lenJ: 0.3, wJ: 0.3, impasto: 0.52, relief: 0.3,
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
    // ⚠ AND TWO THAT TAKE HOLD OF THE ROCK. A taproot that merely reaches the stone is
    // resting on it; roots that splay along its top and curl down over both shoulders are
    // GRIPPING it, and that is the difference between a tree standing on rock and a tree
    // founded on it. They branch off the taproot just above the bedrock's crown (y~447).
    [[440, 420], [424, 444], [390, 454], [350, 460], [322, 474]],                  // west grip
    [[446, 420], [468, 446], [506, 454], [548, 460], [578, 474]],                  // east grip
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
    rng, n: 600,
    sample: rej(-10, 262, 810, 332, (x, y) => y > soilY(x) - 3 && y < soilY(x) + 16),
    dir: x => { const e = 6; return Math.atan2(soilY(x + e) - soilY(x - e), 2 * e); },
    col: (x, y, r) => {
      const warm = Math.max(0, 1 - Math.abs(x - TB[0]) / 60);
      let c = mix('#181426', '#2c2438', fbm(x / 55, y / 20, 47));
      return jig(mix(c, '#6e5526', warm * 0.55), r, 7);
    },
    len: (x, y) => 18 * lengthOf(x, y, 71), lw: (x, y) => 2.2 * widthOf(x, y, 73), steps: 3, wild: 0.06, lenJ: 0.3, wJ: 0.3, relief: 0.3,
  });

  /* ══ 8b · AND THE FLOODS CAME ══════════════════════════════════════════════
     The third thing the verse names. Rain was falling but nothing was RUNNING: the crest
     took the whole storm and stayed dry. Sheets of water sluice off it now, raked the same
     way the wind drives everything else on this page, and each one throws a little white
     where it breaks — so the ground reads as being beaten on, which is what the sentence
     says is happening while the roots hold. */
  {
    strokes(out, counter, {                                   // sheets running off the crest
      rng, n: 240,
      sample: rej(-10, 258, 810, 344, (x, y) => y > soilY(x) - 8 && y < soilY(x) + 26),
      dir: (x, y) => 0.34 + (fbm(x / 30, y / 14, 91) - 0.5) * 0.4,
      col: (x, y, r) => jig(ramp(['#5f7290', '#7b90ac', '#9fb4c8', '#cfe0ec'], r() * 0.9), r, 7),
      len: 22, lw: 1.7, steps: 2, lenJ: 0.7, relief: 0, op: 0.5,
    });
    for (let i = 0; i < 60; i++) {                            // and where it breaks, white
      const x = -8 + rng() * 816, y = soilY(x) + 2 + rng() * 16;
      const s2 = 0.7 + rng() * 1.5;
      E.daub(out, counter, x, y, s2, jig('#e8f2fa', rng, 5), rng);
      paintPath(out, counter, rng, [[x - s2 * 2, y - s2 * 1.6], [x + s2 * 2.4, y - s2 * 2.2]],
        (px, py, r) => jig('#cfe0ec', r, 6), { lw: 0.8, len: 2, density: 0.8, jitter: 0.6 });
    }
  }

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
  // ⚠ THE TWO WHIP BRANCHES ARE GONE (Fred, Aug 2026: "remove the lines"). They were
  // meant as limbs stripped bare by the gale, but drawn as two thin hard near-straight
  // ribbons ending in a point in open sky they read as scratches on the painting — on a
  // plate made of broad brushmarks, a thin hard line is a stray mark, not a branch. The
  // canopy streaming east already tells the story, and the runtime leaf gust now carries
  // what the wind has torn off.
  // canopy: leaves streamed hard east of the crown — dark storm-olive mass,
  // every stroke combed by the wind; pale undersides flash where it tears
  const CR = trunk(0.93);
  const canCx = CR[0] + 52, canCy = CR[1] - 4;
  strokes(out, counter, {
    rng, n: 430,
    // ⚠⚠ THE CROWN IS REDRAWN EACH FRAME, NOT SLID. Fred, circling the canopy: "can you
    // draw several version of this tree and then cycle it so it looks like the tree is
    // blown by the wind?" — and he is right that displacement alone cannot do it. The boil
    // moves every mark of this plane by the SAME vector, so the canopy travelled sideways
    // as one rigid sheet: a sprite sliding, not foliage in a gale.
    // Here the crown is a different DRAWING on every frame. Each leaf is carried downwind
    // in proportion to how far out along the crown it already sits — squared, so the tip
    // is flung and the leaves against the trunk barely stir — and the whole mass lifts a
    // little as it streams. Same leaves, same count, same lengths: only the SHAPE changes,
    // so the ink is identical frame to frame and nothing flickers.
    sample: r => {
      const a = r() * Math.PI * 2, d = Math.pow(r(), 0.8);
      let x = canCx + Math.cos(a) * d * 88;
      let y = canCy + Math.sin(a) * d * 26 + Math.cos(a) * d * 10;
      const w = Math.max(0, Math.min(1, (x - (CR[0] + 4)) / 145));   // 0 at the trunk, 1 at the tip
      x += GUST * 30 * w * w;                                        // dragged east, tip furthest
      y -= GUST * 9 * w;                                             // and lifted as it streams
      return [x, y];
    },
    dir: (x, y) => 0.08 + GUST * 0.12 + (fbm(x / 40, y / 40, 67) - 0.5) * 0.5,   // combed harder at the gust
    col: (x, y, r) => {
      // leaves turn over in a gust and show their pale backs — a real thing, and the one
      // cue that says WIND rather than a tree simply leaning
      if (r() < 0.06 + GUST * 0.05) return jig(mix('#7d967e', '#9ab295', r()), r, 10); // underside flash
      return jig(ramp(['#1c2a26', '#2c3e2c', '#41522f', '#566236'], fbm(x / 30, y / 30, 71) + r() * 0.25), r, 9);
    },
    len: 16, lw: 2.6, steps: 3, follow: 0.95, wild: 0.12, lenJ: 0.55, aJ: 0.3,
  });
  // torn leaves flying downwind, scattering east off the canopy
  strokes(out, counter, {
    rng, n: 26,
    sample: r => [canCx + 60 + GUST * 26 + r() * 130, canCy - 18 - GUST * 8 + r() * 50],
    dir: () => 0.2 + GUST * 0.14,
    col: (x, y, r) => jig(mix('#41522f', '#6b7a48', r()), r, 10),
    len: 6, lw: 1.7, steps: 2,
  });

  /* ══ 9b · WHAT THE WIND TEARS OFF ═════════════════════════════════════════
     Leaves torn out of the crown and driven downwind, each one drawn at where it has got
     to on this drawing of the ring. Their positions never repeat within a turn and every
     leaf exists in every drawing, so the ink on the plate is constant — a travelling
     thing, not a flicker. They tumble as they go (a leaf in air spins), they fade as they
     go (torn green drying to pale), and they run with the same eastward drift the rain and
     the whole sky already run with, so the page has ONE wind and everything answers it. */
  {
    const lRng = mulberry32(seed ^ 0x7ea51ea5);
    const NL = 26;
    const leaf = (cx2, cy2, s2, rot, col, vein) => {
      const c2 = Math.cos(rot), s3 = Math.sin(rot);
      const P = (dx, dy) => [cx2 + dx * c2 - dy * s3, cy2 + dx * s3 + dy * c2];
      const a2 = P(-s2, 0), b2 = P(s2, 0), m1 = P(0, -s2 * 0.5), m2 = P(0, s2 * 0.5);
      out.push(`<path d="M${R1(a2[0])} ${R1(a2[1])} Q${R1(m1[0])} ${R1(m1[1])} ${R1(b2[0])} ${R1(b2[1])} Q${R1(m2[0])} ${R1(m2[1])} ${R1(a2[0])} ${R1(a2[1])} Z" fill="${col}" opacity="0.95"/>`);
      counter.n++;
      out.push(`<path d="M${R1(a2[0])} ${R1(a2[1])} L${R1(b2[0])} ${R1(b2[1])}" stroke="${vein}" stroke-width="${R1(s2 * 0.16)}" fill="none" opacity="0.75"/>`);
      counter.n++;
    };
    for (let i = 0; i < NL; i++) {
      const sx = 442 + lRng() * 280, sy = 164 + lRng() * 94;      // torn out of the crown
      const run = 250 + lRng() * 260, drop = 24 + lRng() * 120;
      const spin = 3.2 + lRng() * 5.5, ph0 = lRng();
      const s2 = 3.4 + lRng() * 3.6;   // big enough to read at page size, not so big they are birds
      const u = (PH + ph0 + i / NL) % 1;
      const px = sx + run * u;
      const py = sy + drop * u * u + Math.sin(u * 7.4 + i * 1.7) * 10;
      if (px < -14 || px > 816 || py > soilY(px) + 4) continue;    // gone from the frame, or landed
      // it dries as it goes: canopy green at the moment it tears, pale by the time it leaves
      const g = ramp(['#4a6a2c', '#5e7d33', '#7d9440', '#9aa653', '#b8b06a'], u * 0.85 + lRng() * 0.15);
      leaf(px, py, s2, spin * u + i, jig(g, lRng, 9), jig('#33461f', lRng, 6));
    }
  }

  /* ---------------- 10. THE CHILD — sheltering at the trunk ---------------- */
  // small, in deep red, pressed to the leeward (east) side of the trunk,
  // arms wrapped around it. Lit faintly from BELOW by the root glow.
  const fy = soilY(446) + 2;
  const cx = 447;
  // articulated child standing FIRM, braced, leaning slightly into the wind,
  // feet planted wide, arms drawn in close to steady itself
  // calm warm pool at the tree's foot (the glow leaking up through the seam);
  // a simple circular exclusion keeps it out from under the pilgrim's feet
  const nearChild = (x, y, m) => Math.hypot(x - cx, y - (fy - 14)) <= 22 + m;
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
  // (the pilgrim himself is painted LAST, above the grass fringe — see below)

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
  E.jewelBush(out, counter, rng, 120, soilY(120) - 1, 22, 14, E.LEAF_PALETTES[1], light);
  E.jewelBush(out, counter, rng, 720, soilY(720) - 6, 20, 13, E.LEAF_PALETTES[3], light);
  E.jewelBush(out, counter, rng, 250, soilY(250) + 2, 16, 10, E.LEAF_PALETTES[4], light);
  E.jewelBush(out, counter, rng, 596, soilY(596) + 1, 18, 12, E.LEAF_PALETTES[2], light);
  E.jewelBush(out, counter, rng, 62,  soilY(62)  + 3, 14, 9,  E.LEAF_PALETTES[4], light);
  // WIND-BENT GRASS along the whole soil line. The gale is the antagonist of this page,
  // so the grass has to LEAN with it — every blade raked the same way the rain falls,
  // bowed but rooted, like the tree. Munch: living things curve.
  {
    const _g0 = out.length;
    E.strokes(out, counter, {
      rng, n: 520,
      sample: E.rej(-10, 250, 810, 330, (x, y) => y > soilY(x) - 14 && y < soilY(x) + 5),
      dir: (x, y) => -Math.PI / 2 + 0.62 + (rng() - 0.5) * 0.34,     // raked hard into the wind
      col: (x, y, r) => {
        const g = light(x, y);
        let c = E.ramp(['#1e3a2a', '#2f5a36', '#4a7c40', '#6f9a48'], r());
        c = E.mix(c, '#f0d68a', g * 0.5); c = E.mix(c, '#101c2c', (1 - g) * 0.5);
        return E.jig(c, r, 12);
      },
      len: (x, y) => 9 + rng() * 11, lw: 2.1, steps: 2, impasto: 0.45, lenJ: 0.6,
    });
    fgRanges.push([_g0, out.length]);
  }
  fgRanges.push([_fgBushes, out.length]);   // ← the jewel bushes are foreground

  /* ---------- THE MAIN CHARACTER — painted LAST, above fringe and grass ---------- */
  {
    const _fgChild = out.length;
    // the little pilgrim, braced into the wind at the trunk's leeward side,
    // hem blown, eyes narrowed against the rain — but planted
    E.paintMask(out, counter, rng, {
      x: cx, y: fy + 1, h: 33, facing: -1,
      lean: -4, wind: 0.5, aura: 8,
      eye: [-0.6, 0], mood: 'wary',
    });
    fgRanges.push([_fgChild, out.length]);
  }

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
