// gen/plates/garden.mjs — "The fall — where drift began" (§5)
//
// THE DRAFTSMANSHIP REBUILD. A painting is DRAWN before it is painted: it has
// bones — a horizon, a vanishing point, forms with real volume, a scale that
// shrinks with distance. Café Terrace works because the street truly recedes,
// the awning is a constructed plane, the cobbles converge. This plate now
// carries that skeleton, then paints the strokes ALONG it:
//
//   BONES
//   - horizon at y≈300; a vanishing point VP the cobbles converge toward.
//   - a SCALE GRADIENT everywhere: foreground strokes are big, confident
//     slabs; near the horizon they shrink to touches (engine: len/lw as fns).
//   - the cobbles lie in PERSPECTIVE LINES radiating from VP, not in rows.
//   - a luminous ROAD sweeps from the walking light toward the hiding place —
//     "the road home is the brightest path" — the composition's diagonal.
//   - the sky strokes ARC (they curve around the two great stars), they do
//     not lie in horizontal courses.
//   - the great cypress is a DRAWN flame: a silhouette with a trunk-line and
//     strokes flaming up its contour, dark-blue core, green-fire lit edge.
//
//   THE STORY (REFRAMED — sin→pure, never backward): NOT Eden being left. This
//   is the DARK WORLD you are already in. A single small child — YOU, the
//   recurring red child — hides in shame behind the cypress; a column of gold
//   Light walks in seeking you (Gen 3:9, "Where art thou?") and will not leave
//   you in the dark. The land is fruitful even here (jewel trees in the night),
//   but this is the world, not paradise — paradise is where the journey GOES.
//   No black anywhere — night is COLOR. One great gold, one great cobalt.
export const name = 'garden';
export const title = 'Hiding in the dark';
export const caption = 'He came looking — and would not leave you there.';
export const seed = 20260505;
export const focal = { x: 300, y: 372 }; // portrait window: the walking Light, the lit road, and the cypress where you hide
// MOBILE 3D — depth planes, drawn WITH INTENTION (FAR→NEAR): the night sky +
// stars behind; an organic horizon fringe on the far plane; the dark cobble
// floor, the walking Light and the cypresses in the middle; the jewel fruit-
// trees nearer; you, the hiding child, closest of all.
// the stacked SKY-SWIRL SHEETS — each an independent bold, gapped pass of the
// arcing night brushwork (paint on paint), own rng per sheet; their gaps reveal
// the smooth opaque sky ground beneath.
// ⭐ DETAIL PASS (Sep 8): finer sheets, every stroke its own width and length (free hashes,
// no rule — see widthOf/lengthOf in paint())
export const SKY_SHEETS = [
  { n: 900, len: 20, lw: 3.0, lift: 0.00 },
  { n: 960, len: 18, lw: 2.7, lift: 0.07 },
];
export const layers = [
  { name: 'sky', opaque: true },  // smooth night sky ground (backmost, opaque)
  ...SKY_SHEETS.map((_, i) => ({ name: 'sky' + (i + 1) })),   // stacked sky-swirl sheets
  { name: 'far' },                // distant night hills + the horizon fringe
  { name: 'mid' },                // cobble floor, light road, walking Light, cypresses, PLANTED trees
  { name: 'front' },              // the hiding rock/cypress — named front so it renders ABOVE
                                  // the sprite layer: the child HIDES BEHIND it (Gen 3:8), so it
                                  // must occlude the runtime actor, not sit under it
];

export function paint(E, opts = {}) {
  const {
    mulberry32, fbm, curlV, goldenSpiralV, mix, ramp, jig, strokes, rej,
    paintFigure, underpaintCapsules, paintChild, paintPath, segDist, ribbon,
    svgWrap, R1, W, H,
    GOLD, GOLD_PALE, GOLD_DEEP, GOLD_HOT,
  } = E;

  const rng = mulberry32(seed);
  const out = [];
  const counter = { n: 0 };
  // MOBILE 3D LAYERS: tag index ranges per depth band. MID = whatever is
  // unclaimed below the sky. The build emits one cel per band.
  const LAYER = opts.layer || 'full';
  const farRanges = [], fgRanges = [];
  // ⭐ EVERY STROKE DRAWS ITS OWN WIDTH AND LENGTH (Fred: "use no rules, a paint stroke
  // just exist because it exist") — two independent hashes per mark, no field, no coupling.
  const free = (x, y, salt) => { const n = Math.sin(x * 12.9898 + y * 78.233 + salt) * 43758.5453; return n - Math.floor(n); };
  const widthOf  = (x, y, salt) => 0.40 + 3.2 * Math.pow(free(x, y, salt), 2.6);
  const lengthOf = (x, y, salt) => 0.40 + 1.5 * Math.pow(free(x, y, salt + 17), 1.5);

  // the deepest dark in this painting is a nameable blue — never black. This is
  // the HIDING-in-the-dark page, so the night runs deep; only the searching
  // gold Light is bright (the contrast IS the story).
  out.push(`<rect width="${W}" height="${H}" fill="#101a3c"/>`);

  /* ====================== THE BONES ====================== */
  const horizon = x => 298 + 7 * Math.sin(x / 170) + x * 0.010;
  const VP = { x: 360, y: 292 };                     // vanishing point on the horizon
  // depth: 0 at the horizon → 1 at the bottom edge. Drives every ground scale.
  const depth = (x, y) => Math.max(0, Math.min(1, (y - horizon(x)) / (H - horizon(x))));
  // perspective flow on the floor: each cobble's long axis lies on the ray
  // from VP through the point — receding orthogonals, gently wandered
  const groundDir = (x, y) => Math.atan2(y - VP.y, x - VP.x) + (fbm(x / 90, y / 70, 43) - 0.5) * 0.5;

  // ONE light: the walking column at COLX, and the luminous road it lays down
  const COLX = 208, COLBASE = 452, COLTOP = 236;   // +22: at 186 the flame's left
  // edge fell outside the portrait window (fx0 144) and read as CUT. The child hides
  // at ~439, so the Light on the left and the child on the right both sit in frame.   // FIRE, not a pillar to the sky:
  // the crown drops from 104 to 236 so the flame is a blaze a child could stand
  // beside — smaller reads as HOTTER, because the eye compares it to the garden.
  const column = (x, y) => {
    const yc = Math.max(COLTOP, Math.min(COLBASE, y));
    const d = Math.hypot((x - COLX) * 1.18, (y - yc) * 0.92);
    return Math.exp(-d / 118);   // tighter falloff: fire lights a POOL around itself, it does not wash a whole night
  };
  // the road: a bright spine from the column's foot toward the hiding cypress,
  // widening toward the viewer (perspective) — the brightest path home
  const roadSpine = t => [136 + t * 268, 500 - t * 42]; // near-left → the cypress foot where you hide (now centre-frame)
  const road = (x, y) => {
    let g = 0;
    for (let i = 0; i <= 10; i++) {
      const t = i / 10, p = roadSpine(t);
      const w = 116 - t * 64;                          // narrows as it recedes
      g = Math.max(g, (0.95 - t * 0.5) * Math.exp(-segDist(x, y, p[0], p[1], p[0] + 0.1, p[1]) / w));
    }
    return g;
  };
  const light = (x, y) => Math.min(1, column(x, y) + road(x, y) * 0.85);

  /* ====================== 1. THE SKY ====================== */
  // long ARCING strokes — bigger and bolder low (near), calming toward the
  // crown. The two great stars are vortices the sky curves around, tying the
  // rosettes into the weather instead of pasting them on top.
  const stars = [
    { x: 250, y: 70, s: 13, big: true }, { x: 560, y: 104, s: 15, big: true },
    { x: 332, y: 150, s: 6 }, { x: 408, y: 44, s: 8 }, { x: 478, y: 96, s: 6 },
    { x: 626, y: 56, s: 8 }, { x: 690, y: 150, s: 9 }, { x: 736, y: 92, s: 7 },
    { x: 600, y: 214, s: 5 }, { x: 150, y: 150, s: 6 }, { x: 92, y: 52, s: 8 },
  ];
  const skyDir = (x, y) => {
    let vx = 64, vy = 8 * Math.sin(x / 130 + 0.6);     // gentle horizontal night air
    for (const st of stars) if (st.big) { const [a, b] = goldenSpiralV(x, y, st.x, st.y, 88, 150); vx += a; vy += b; }
    const [c, d] = curlV(x, y, 29, 150);
    return Math.atan2(vy + d * 60, vx + c * 60);
  };
  const starGlow = (x, y) => {
    let g = 0;
    for (const st of stars) { const d = Math.hypot(x - st.x, y - st.y) / (st.s * 2.6); if (d < 2.2) g = Math.max(g, Math.exp(-d * d * 1.5)); }
    return g;
  };
  const skyBlue = (x, y) => {
    const t = Math.max(0, Math.min(1, 0.04 + (y / 300) * 0.5 + fbm(x / 140, y / 120, 61) * 0.28 - (x / 800) * 0.14));
    return ramp(['#2c4a86', '#243f76', '#1d3466', '#172a54', '#121f44'], t);   // a deeper, darker night
  };
  const skyCol = (x, y, r, lift) => {
    const g = column(x, y);
    if (g > 0.14 && g < 0.3 && r() < 0.05) return jig('#8a5aa0', r, 14); // violet where gold dies
    let c = skyBlue(x, y);
    if (g > 0.28 && g < 0.55) c = mix(c, '#6f9a50', (g - 0.28) * 2.0);   // gold→blue via green
    c = mix(c, '#e8c468', Math.max(0, g - 0.45) * 1.3);
    c = mix(c, '#bcd6ea', starGlow(x, y) * 0.6);                          // the blue itself glows by each star
    if (lift) c = mix(c, '#ffffff', lift);
    return jig(c, r, 9);
  };
  // the smooth sky GROUND — broad soft masses (opaque base); the arcing
  // brushwork lives in the stacked sheets above, so their gaps reveal paint
  strokes(out, counter, {
    rng, n: 1600, sample: rej(-14, -14, 814, 332, (x, y) => y < horizon(x) + 8),
    dir: skyDir, col: (x, y, r) => skyCol(x, y, r, 0),
    len: (x, y) => 30 * lengthOf(x, y, 11), lw: (x, y) => 4.6 * widthOf(x, y, 13), steps: 4, follow: 0.88, wild: 0.05, lenJ: 0.3, wJ: 0.3, impasto: 0.5, relief: 0.4,
  });

  /* ====================== 2. THE STARS ====================== */
  for (const st of stars) {
    strokes(out, counter, {        // burning heart, nearly solid
      rng, n: Math.round(9 + st.s * 1.3),
      sample: r => { const a = r() * Math.PI * 2, d = Math.sqrt(r()) * st.s * 0.5; return [st.x + Math.cos(a) * d * 1.1, st.y + Math.sin(a) * d]; },
      dir: (x, y) => Math.atan2(y - st.y, x - st.x) + Math.PI / 2 + 0.4,
      col: (x, y, r) => jig(mix('#fdf7da', '#efe39c', Math.hypot(x - st.x, y - st.y) / (st.s * 0.6)), r, 5),
      len: st.s * 0.8, lw: st.s * 0.5, steps: 2, lenJ: 0.4, impasto: 0.55, relief: 0.5,
    });
    strokes(out, counter, {        // a tight corona that hands off to the sky glow
      rng, n: Math.round(7 + st.s),
      sample: r => { const a = r() * Math.PI * 2, d = (0.55 + 0.45 * r()) * st.s; return [st.x + Math.cos(a) * d * 1.12, st.y + Math.sin(a) * d]; },
      dir: (x, y) => Math.atan2(y - st.y, x - st.x) + Math.PI / 2,
      col: (x, y, r) => jig(mix('#d8dc8e', '#92bca0', r()), r, 9),
      len: st.s * 0.55, lw: st.s * 0.32, steps: 2, lenJ: 0.5,
    });
  }

  /* ====================== 2.5 THE SPARKLE — the dark is full of stars ======================
     hiding in the dark, but the dark is not empty: it sparkles. A scattered
     field of small bright stars, each a glint with tiny cross-rays. */
  for (let i = 0; i < 80; i++) {
    const x = 8 + rng() * 784;
    const y = 4 + rng() * 256;
    if (y > horizon(x) - 8) continue;
    if (column(x, y) > 0.32) continue;                 // not lost inside the gold column
    const br = 0.6 + rng() * 1.7;                       // brightness / size
    const c = jig(mix('#fdf7da', '#cfe0f6', rng() * 0.55), rng, 6);
    out.push(ribbon([[x - br, y], [x + br, y]], 1.1, c)); counter.n++;       // glint, horizontal
    out.push(ribbon([[x, y - br], [x, y + br]], 1.1, c)); counter.n++;       // glint, vertical
    if (br > 1.5) { out.push(ribbon([[x - br * 1.9, y], [x + br * 1.9, y]], 0.6, jig('#8fb0e0', rng, 6))); counter.n++; } // long ray on the brightest
  }
  const skyEnd = out.length;   // smooth sky ground + stars + sparkle → the SKY plane (opaque)
  // the stacked SKY-SWIRL SHEETS — each an independent bold, gapped pass of the
  // arcing night brushwork (paint on paint), own rng per sheet.
  const skySheets = SKY_SHEETS.map((e, k) => {
    const srng = mulberry32(seed + 1009 * (k + 1));
    const sh = [];
    strokes(sh, { n: 0 }, {
      rng: srng, n: e.n, sample: rej(-14, -14, 814, 332, (x, y) => y < horizon(x) + 8),
      dir: skyDir, col: (x, y, r) => skyCol(x, y, r, e.lift),
      len: (x, y) => e.len * lengthOf(x, y, 31 + k), lw: (x, y) => e.lw * widthOf(x, y, 37 + k),
      steps: 5, follow: 0.9, wild: 0.12, lenJ: 0.3, wJ: 0.3, impasto: 0.6, relief: 0.4,
    });
    return sh.join('\n');
  });

  /* ============= EASTER EGG — THE CROSS IN THE STARS (a hidden symbol) =============
     "The heavens declare the glory of God" (Ps 19:1); "we have seen his star in the
     east" (Matt 2:2). Hidden in the starfield above the one who hides: seven stars
     whose regular spacing resolves, on a second look, into a LATIN CROSS — the gospel
     written in the sky for the seeker to find (Prov 25:2, "it is the glory of God to
     conceal a thing"). BOUNDLESS DEPTH (what a 2D canvas can't do): the seven stars
     are DISTRIBUTED across THREE depth planes — top of the upright deepest, the foot
     nearest — so at REST it is a flat clean cross, but as you TILT the phone the bars
     float apart at their true distances and the cross turns DIMENSIONAL in space, then
     settles back. Holbein needed you to move your head; we give the cross real depth. */
  {
    const cx = 356, cy = 86;
    // [x, y, plane]  plane: 0 = sky1 (deepest), 1 = sky2 (middle), 2 = far (nearest)
    const cross = [
      [cx, cy - 52, 0], [cx, cy - 26, 0],                   // top of the upright — set deepest
      [cx, cy, 1], [cx - 30, cy, 1], [cx + 30, cy, 1],      // the crossing + arms — middle
      [cx, cy + 26, 2], [cx, cy + 52, 2],                   // the foot — nearest
    ];
    const star = (sx, sy) => {
      const c = jig('#fffae4', rng, 4), br = 2.7, a = [];
      a.push(`<circle cx="${sx}" cy="${sy}" r="3.4" fill="#1a2238" opacity="0.5"/>`);   // dark halo so it pops off the busy sky
      a.push(ribbon([[sx - br, sy], [sx + br, sy]], 1.8, c));
      a.push(ribbon([[sx, sy - br], [sx, sy + br]], 1.8, c));
      a.push(ribbon([[sx - br * 2.3, sy], [sx + br * 2.3, sy]], 0.8, jig('#a8c8f0', rng, 6)));
      a.push(ribbon([[sx, sy - br * 2.3], [sx, sy + br * 2.3]], 0.8, jig('#a8c8f0', rng, 6)));
      return a.join('\n');
    };
    const pl = [[], [], []];
    // faint connector lines on the MIDDLE plane (a stargazer's ghost; they read the
    // cross at rest and let the depth gently part from them on tilt)
    pl[1].push(`<line x1="${cx}" y1="${cy - 52}" x2="${cx}" y2="${cy + 52}" stroke="#cfe0f4" stroke-width="1.0" opacity="0.3"/>`);
    pl[1].push(`<line x1="${cx - 30}" y1="${cy}" x2="${cx + 30}" y2="${cy}" stroke="#cfe0f4" stroke-width="1.0" opacity="0.3"/>`);
    for (const [sx, sy, p] of cross) pl[p].push(star(sx, sy));
    skySheets[0] += '\n' + pl[0].join('\n');                // sky1 (deep)
    skySheets[1] += '\n' + pl[1].join('\n');                // sky2 (middle) + lines
    const _xfar = out.length; out.push(pl[2].join('\n')); counter.n++;
    farRanges.push([_xfar, out.length]);                    // far (near)
  }

  /* ====================== 3. FAR HEDGE — depth at the horizon ====================== */
  strokes(out, counter, {
    rng, n: 540,
    sample: rej(-14, 280, 814, 334, (x, y) => Math.abs(y - horizon(x)) < 13),
    dir: (x, y) => (fbm(x / 38, y / 38, 57) - 0.5) * 0.55,
    col: (x, y, r) => jig(mix(mix(ramp(['#0c2038', '#102e3a', '#153c36'], fbm(x / 60, y / 50, 59)), '#0a1430', (1 - column(x, y)) * 0.35), '#e8823a', column(x, y) * 0.62), r, 6),
    len: (x, y) => 10 * lengthOf(x, y, 41), lw: (x, y) => 3.0 * widthOf(x, y, 43), steps: 2, lenJ: 0.3, wJ: 0.3, relief: 0.3,
  });

  /* ====================== 4. THE COBBLE FLOOR (perspective) ====================== */
  // underpaint: broad slabs along the perspective lines, no void between dabs
  strokes(out, counter, {
    rng, n: 460,
    sample: rej(-14, 286, 814, 514, (x, y) => y > horizon(x) - 4),
    dir: groundDir,
    col: (x, y, r) => {
      const g = light(x, y);
      return jig(mix(ramp(['#1a1c50', '#262662', '#322c64'], fbm(x / 90, y / 50, 39)), '#7a5838', g * 0.9), r, 6);
    },
    len: (x, y) => (16 + 30 * depth(x, y)) * lengthOf(x, y, 51), lw: (x, y) => (5 + 7 * depth(x, y)) * (0.5 + free(x, y, 53)), steps: 2, follow: 0.95, lenJ: 0.3, wJ: 0.3, relief: 0.25,   // a bed: its own width each, no giants
  });
  // the cobbles themselves — dabs that shrink toward VP, rose-violet floor,
  // molten gold where the road and column pour over them
  const groundCol = (x, y, r) => {
    const g = light(x, y);
    let c = ramp(['#22245e', '#302c66', '#42386a', '#4e3e62'], Math.min(1, fbm(x / 55, y / 28, 67) * 0.9 + 0.1));
    if (g > 0.16) c = mix(c, ramp(['#8a5c40', '#c08544', '#e6ae4e', '#f4cc68'], Math.min(1, (g - 0.16) * 1.5)), Math.min(1, (g - 0.16) * 1.95));
    return jig(c, r, 10);
  };
  strokes(out, counter, {
    rng, n: 3400,
    sample: rej(-14, 288, 814, 514, (x, y) => y > horizon(x)),
    dir: groundDir,
    col: groundCol,
    len: (x, y) => (5 + 19 * depth(x, y)) * lengthOf(x, y, 61), lw: (x, y) => (1.8 + 4.6 * depth(x, y)) * widthOf(x, y, 63),
    steps: 2, follow: 0.95, wild: 0.04, lenJ: 0.3, wJ: 0.3, relief: 0.4,   // ⚠ relief 0.8 → 0.4: the floor was flagstones
  });
  // undergrowth licks, only in the unlit margins — the garden pressing in
  strokes(out, counter, {
    rng, n: 220,
    sample: rej(-14, 300, 814, 510, (x, y) => y > horizon(x) + 6 && light(x, y) < 0.22),
    dir: (x, y) => -Math.PI / 2 + (fbm(x / 28, y / 28, 47) - 0.5) * 1.1,
    col: (x, y, r) => jig(ramp(['#15403e', '#1f5640', '#296644'], fbm(x / 40, y / 40, 49)), r, 8),
    len: (x, y) => 5 + 8 * depth(x, y), lw: (x, y) => 1.8 + 2 * depth(x, y), steps: 2, lenJ: 0.6,
  });

  /* ====================== 5. THE LIGHT ROAD ====================== */
  // gold poured along the perspective road — confident slabs near, fine touches
  // far; this is the brightest path, and it leads toward the hiding place
  strokes(out, counter, {
    rng, n: 1500,
    sample: rej(-14, 300, 760, 512, (x, y) => y > horizon(x) + 4 && road(x, y) > 0.28),
    dir: groundDir,
    col: (x, y, r) => {
      const g = road(x, y);
      return jig(ramp(['#9a6a3a', '#d29440', '#ecb84e', '#f8d472', '#fff0c2'], Math.min(1, g * 1.15)), r, 9);
    },
    len: (x, y) => (5 + 20 * depth(x, y)) * lengthOf(x, y, 71), lw: (x, y) => (1.8 + 5 * depth(x, y)) * widthOf(x, y, 73),
    steps: 2, follow: 0.95, wild: 0.04, lenJ: 0.3, wJ: 0.3, impasto: 0.62, relief: 0.4,
  });

  /* ====================== 6. THE CYPRESSES (drawn flames) ====================== */
  // the great cypress is the dark anchor that balances the light: a flame
  // silhouette with a trunk-line, strokes flaming UP its contour, curling at
  // the tip. Dark-blue shadow core, green-fire on the light-facing flank.
  const cypresses = [
    { x: 400, base: 470, top: 156, w: 46, big: true }, // the hiding cypress — centre-frame, where the Light's road leads
    { x: 724, base: 452, top: 268, w: 34 },            // a second, deeper in the dark
  ];
  for (const C of cypresses) {
    // BOTH cypresses are DE-BAKED — each is a runtime sprite in CRITTERS[6] so it can
    // sway. This rule has now been wrong in both directions: it bakes NEITHER. (It once
    // read `if (C.big) continue`, which baked the RIGHT one on top of its own runtime
    // sprite — the doubled tree, whose baked copy carried the blunt crown.) The array
    // below is kept because the hiding figures and the fruit tree are placed off it.
    continue;
    const span = C.base - C.top;
    const half = y => {
      const t = (C.base - y) / span; if (t < 0 || t > 1) return 0;
      // flame profile: swells low, tapers to a curling point
      return C.w * (0.30 + 0.9 * Math.pow(t, 0.5) * (1 - Math.pow(t, 1.6))) * (1 + fbm(C.x / 26, y / 24, 71) * 0.4);
    };
    const sway = y => Math.sin((C.base - y) / span * 2.1) * C.w * 0.16; // the flame leans and recovers
    strokes(out, counter, {
      rng, n: Math.round(C.w * span / (C.big ? 11 : 16)),
      sample: r => { const y = C.top + r() * span; const h = half(y); if (h < 1) return null; const cx = C.x + sway(y); return [cx + (r() * 2 - 1) * h, y]; },
      // strokes flame upward, fanning out from the centerline (the contour)
      dir: (x, y) => { const cx = C.x + sway(y); return -Math.PI / 2 + (x - cx) * 0.016 + (fbm(x / 18, y / 18, 73) - 0.5) * 0.7; },
      col: (x, y, r) => {
        const cx = C.x + sway(y), h = half(y), t = fbm(x / 22, y / 22, 79);
        // shadow flank (right) deep blue; lit flank (left, toward the light) green fire
        let c = (x > cx + h * 0.15)
          ? ramp(['#142a5e', '#173658', '#1b4654'], t)
          : ramp(['#184a4a', '#206042', '#2c7648', '#3a8a52'], t);
        if (x < cx - h * 0.4) c = mix(c, '#f0842e', column(x, y) * 0.9 + road(x, y) * 0.4);  // FIRE rim, not gold
        return jig(c, r, 8);
      },
      len: (x, y) => (C.big ? 20 : 14) * (0.7 + 0.5 * (C.base - y) / span), // longer flames low, shorter at the tip
      lw: C.big ? 3.4 : 2.6, steps: 3, follow: 0.9, wild: 0.08, lenJ: 0.5, relief: 0.65,
    });
  }

  /* ====================== 6.5 FRUITFUL EDEN — the land is never barren ======================
     Eden teems even now; it is only DARK because you have not yet received the
     Light. So the garden is heavy with fruit — in crazy, FREE colour (Munch:
     colour need not be real): violet trees, teal trees, gold and pink and cyan
     fruit, blossoms of every colour. The fruit glows even in the night, jewels
     against the cobalt; where the walking Light touches a tree it flares bright.
     This same fruitfulness, after the Light, will blaze in the open day. */
  const FRUIT = ['#f6c63e', '#ee5c84', '#ffa53e', '#b77ce0', '#5ec0e0', '#f29ad0'];
  const BLOSSOM = ['#f29ad0', '#f6e07a', '#fafafa', '#b79ad8', '#8fd0e0'];
  // ⭐ AFTER HIS KIND (Sep 15). The four jewel trees keep their free colour (Munch) but each is a
  // kind Eden held — "every tree that is pleasant to the sight, and good for food" (Gen 2:9):
  // the FIG beside the hiding place is the one whose leaves they sewed (Gen 3:7).
  const fruitTree = (cx, baseY, h, w, leafCols, sp, ex = {}) => E.paintTree(out, counter, rng, cx, baseY, h * 1.12,
    { species: sp, lightFn: light, crownCols: E.crownRamp(leafCols), blossom: 3, fruitK: 1, shadowDir: cx < 400 ? -1 : 1, ...ex });
  // the HORIZON FRINGE — ragged dark foliage rising off the soil line so the
  // night-sky↔ground seam reads as the garden pressing in, not a ruled line.  [FAR]
  const _far = out.length;
  // DISTANT NIGHT HILLS — a rolling dark-land silhouette; its undulating skyline
  // is the sky↔ground boundary (no ruled line) and slides against the night on pan.
  E.distantHills(out, counter, rng, { topFn: E.ridge(horizon, { amp: 28, freq: 200, bumps: 0.5, seed: 55 }), horizonFn: horizon, cols: ['#15303e', '#1c4040', '#244e44'], depth: 64, lightFn: light, seed: 55 });
  E.horizonFringe(out, counter, rng, { horizonFn: horizon, x0: -10, x1: 810, cols: ['#15403e', '#1f5640', '#296644', '#3a7a52'], hMax: 22, lightFn: light, seed: 521 });
  farRanges.push([_far, out.length]);
  // jewel fruit-trees PLANTED in the dark garden (MID) — base stays with the ground
  // ⭐ COMPOSED, NOT SCATTERED (Oct 6 — Fred: "there's like trees in the fire… random trees with no intent").
  // Sep 26 only made every tree bigger; the fig then stood IN the fire. Each tree now has one job:
  //  · the FIRE (COLX 208, 160–256 wide, up to y≈236) is kept clear — no crown crosses it;
  //  · Gen 3:8 "hid themselves… amongst the trees of the garden": the child (428,470) hides BETWEEN two trees —
  //    the FIG (Gen 3:7, its leaves were the covering) on the Light's side, its trunk and low boughs between him
  //    and the fire; the cypress (runtime sprite, x 500) on his other side;
  //  · the apple and the palm FRAME the garden at the plate's edges; the pomegranate stands far back for depth.
  // ⭐ SIZED BY PERSPECTIVE (Oct 6, Fred: "fix the proportion and the composition"). Horizon ≈302, the child is
  // 100 tall at y 470 → one child-height at depth y = 100·(y−302)/168. Each tree in CHILD-HEIGHTS, by its kind:
  // fig 2.7 (his hiding tree — the crown arches over his head, the trunk between him and the fire), apple 3.2
  // and palm 3.8 framing the edges (cut by the frame), pomegranate 2.4 far back. fruitTree multiplies h by 1.12.
  const KIDU = y => 100 * (y - 302) / 168, TREE = (units, y) => units * KIDU(y) / 1.12;
  fruitTree(-14, 508, TREE(3.2, 508), 130, ['#7a4ab0', '#9a5ac8', '#b87ae0'], 'apple');        // BRIGHT violet, frame left — an apple
  { const _o = [], _c = { n: 0 };   // the Oct 6 fig, painted into a THROWAWAY so the shared rng stream (and every mark after it) is unchanged — the fig itself is figTree() below
    E.paintTree(_o, _c, rng, 384, 478, TREE(2.4, 478) * 1.12, { species: 'fig', lightFn: light, crownCols: E.crownRamp(['#c83a82', '#e05a9a', '#f07ab0']), blossom: 3, fruitK: 1, shadowDir: -1, trunkK: 1.75 }); }
  /* ⭐ THE FIG HE HIDES UNDER (Oct 8 — Fred: "repaint the fig"). The lobed-crown painter stacked it into three pink
     tiers with a black arc under each and figs sprinkled like chips — a cake, not a tree, and on the phone it is the
     biggest thing on the screen. A fig is the tree whose LEAVES the story names: "they sewed fig leaves together"
     (Gen 3:7). So it is drawn as what a child knows a fig by — low and wide on several smooth pale stems, an open
     umbrella of big HAND-SHAPED leaves (each leaf five brush marks fanned from its stalk, never an outline — the
     "emoji leaf" was an outline), sky showing between them, lit from above and from the fire on its left, deep
     underneath where he hides, and a few real figs hanging under the leaves. Its own rng: nothing else moves. */
  const figTree = () => {
    const fr = E.mulberry32(3907);
    const C0 = { x: 400, y: 304, rx: 108, ry: 70 };                      // crown: top ≈234, belly ≈374 — arches over his head (he kneels at 428, crown of his hood ≈395)
    const CROWN = ['#3a1230', '#5a1a48', '#86275e', '#b23676', '#d8508e', '#ee72a8', '#ffa8cc'];
    const edge = a => 1 + 0.13 * Math.sin(a * 3 + 0.7) + 0.08 * Math.sin(a * 5 + 2.1) + 0.05 * Math.sin(a * 8 + 4.0);   // a bumpy silhouette, never an ellipse
    const upAt = y => Math.max(0, Math.min(1, 0.5 - (y - C0.y) / (C0.ry * 2)));
    const warm = (c, x, y) => E.mix(c, '#ffab4a', light(x, y) * 0.6);   // the fire's side, the jewelBush rule
    // 1 · the STEMS — a short trunk that splits LOW into four smooth pale stems (fig bark is grey and smooth),
    //     each curving out to hold the umbrella; bark is brush marks along the limb, never a flat band
    const bark = (pts, w0, w1) => {                                   // one continuous limb: marks run ALONG it, dark body, lit toward the fire, tapered
      const n = pts.length - 1, at = t => { const f = t * n, i = Math.min(n - 1, f | 0), u = f - i; const [ax, ay] = pts[i], [bx, by] = pts[i + 1]; return [ax + (bx - ax) * u, ay + (by - ay) * u, Math.atan2(by - ay, bx - ax)]; };
      let len = 0; for (let i = 0; i < n; i++) len += Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]);
      let cA = 0, cS = 0, cW = 0;
      E.strokes(out, counter, {
        rng: fr, n: Math.round(len * (w0 + w1) * 0.32),
        sample: r => { const t = r() * 0.96; const [x, y, a] = at(t); cW = w0 + (w1 - w0) * t; cS = r() * 2 - 1; cA = a; return [x - Math.sin(a) * cS * cW * 0.5, y + Math.cos(a) * cS * cW * 0.5]; },
        dir: () => cA, aJ: 0.05,
        col: (x, y, r) => { const lit = Math.max(0, Math.cos(cA) > 0 ? -cS : cS);   // the side facing the fire (left)
                            let c = E.mix(E.mix('#2a2234', '#463c52', r() * 0.6), E.mix('#7a7290', '#a8a0b6', r() * 0.5), Math.pow(lit, 1.4) * 0.9);
                            return E.jig(E.mix(c, '#f0a868', lit * light(x, y) * 0.7), r, 5); },
        len: 9, lw: () => Math.max(1.4, cW * 0.36), lenJ: 0.3, wJ: 0.2, steps: 2, follow: 1, impasto: 0.45, relief: 0.35, op: 0.95, flow: 0,
      });
    };
    const bez = (p0, c1, p2, n = 10) => { const pts = []; for (let k = 0; k <= n; k++) { const t = k / n, u = 1 - t; pts.push([u * u * p0[0] + 2 * u * t * c1[0] + t * t * p2[0], u * u * p0[1] + 2 * u * t * c1[1] + t * t * p2[1]]); } return pts; };
    bark(bez([384, 482], [383, 462], [386, 444], 5), 20, 15);
    for (const [sx, ex, ey, kx, ky] of [[379, 326, 350, 340, 432], [384, 368, 318, 362, 400], [390, 420, 322, 412, 396], [394, 466, 348, 450, 424]]) bark(bez([sx, 446], [kx, ky], [ex, ey]), 13, 5.5);
    // 2 · the DEEP UNDERSIDE — the hollow he hides in: dark paint low in the crown only, so the top stays open to the sky
    E.strokes(out, counter, {
      rng: fr, n: 700,
      sample: r => { const a = Math.PI * (0.05 + r() * 0.9), d = Math.pow(r(), 0.6) * 0.86; const x = C0.x + Math.cos(a) * C0.rx * d * edge(a), y = C0.y - C0.ry * 0.15 + Math.sin(a) * C0.ry * d * edge(a); return [x, y]; },
      dir: (x, y) => Math.atan2(y - C0.y, x - C0.x) + Math.PI / 2 + (fr() - 0.5) * 1.2,
      col: (x, y, r) => E.jig(warm(E.ramp(CROWN, 0.04 + upAt(y) * 0.3 + r() * 0.12), x, y), r, 6),
      len: 7, lw: 3.2, steps: 2, lenJ: 0.5, impasto: 0.4, relief: 0.3, op: 0.9, flow: 0,
    });
    // 2b · the BODY — a mid-tone mass of leaf so the crown is a tree, not leaves on sticks; the rim stays open
    E.strokes(out, counter, {
      rng: fr, n: 1100,
      sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 0.7) * 0.8; return [C0.x + Math.cos(a) * C0.rx * d * edge(a), C0.y + Math.sin(a) * C0.ry * d * edge(a)]; },
      dir: (x, y) => Math.atan2(y - C0.y, x - C0.x) + (fr() - 0.5) * 1.4,
      col: (x, y, r) => E.jig(warm(E.ramp(CROWN, 0.14 + upAt(y) * 0.42 + (r() - 0.5) * 0.16), x, y), r, 7),
      len: 9, lw: 4.2, steps: 2, lenJ: 0.4, impasto: 0.5, relief: 0.4, op: 0.92, flow: 0,
    });
    // 3 · the LEAVES — dense at the rim (the silhouette is leaves against the sky), sparser inside; dark ones first
    const leaves = [];
    for (let i = 0; i < 130; i++) {
      const a = fr() * Math.PI * 2, d = Math.pow(fr(), 0.5) * 0.96;
      const x = C0.x + Math.cos(a) * C0.rx * d * edge(a), y = C0.y + Math.sin(a) * C0.ry * d * edge(a);
      const up = upAt(y), out_ = Math.atan2(Math.sin(a) * C0.ry, Math.cos(a) * C0.rx);
      const ang = out_ * 0.7 + (Math.sin(a) > 0 ? Math.PI / 2 : -Math.PI / 2) * 0.3 + (fr() - 0.5) * 0.6;   // outward, the low ones hanging
      const L = (19 + fr() * 8) * (0.85 + d * 0.25);   // a fig leaf is BIG — about a fifth of the child
      const t = 0.18 + up * 0.62 + (fr() - 0.5) * 0.2;
      leaves.push({ x, y, ang, L, t });
    }
    leaves.sort((p, q) => p.t - q.t);
    const LOBES = [[-1.25, 0.58], [-0.62, 0.86], [0, 1], [0.62, 0.86], [1.25, 0.58]];   // a fig leaf is a hand: five lobes, the middle longest
    let cur = null;
    E.strokes(out, counter, {
      rng: fr, n: leaves.length * LOBES.length,
      sample: r => { const i = (cur ? cur.i + 1 : 0); const lf = leaves[(i / 5) | 0], lb = LOBES[i % 5]; if (!lf) return null;
                     cur = { i, a: lf.ang + lb[0], l: lf.L * lb[1], w: lf.L * 0.27 * (0.75 + lb[1] * 0.25), t: lf.t };
                     return [lf.x + Math.cos(cur.a) * 1.2, lf.y + Math.sin(cur.a) * 1.2]; },
      dir: () => cur.a, aJ: 0.06,
      col: (x, y, r) => { let c = E.ramp(CROWN, cur.t + (r() - 0.5) * 0.08); c = E.mix(c, '#fff0d0', Math.pow(Math.max(0, cur.t - 0.6), 2) * 0.9); return E.jig(warm(c, x, y), r, 7); },
      len: () => cur.l, lw: () => cur.w, lenJ: 0.08, wJ: 0.1, steps: 2, follow: 1, impasto: 0.55, relief: 0.5, op: 0.95, flow: 0,
    });
    // 4 · the FIGS — a few, hanging in the shade under the leaves, each a small pear with a light on its shoulder
    const figs = [[338, 356], [346, 364], [331, 366], [452, 352], [462, 360], [444, 363], [398, 372], [408, 368]];
    for (const [fx, fy] of figs) {
      const hy = fy + 7;                                               // hanging just below the leaves, on a short stalk
      out.push(E.ribbon([[fx, hy - 6], [fx, hy - 2.5], [fx + 0.3, hy + 2.2], [fx + 0.4, hy + 4.4]], 6.2, E.mix(E.mix('#3e1450', '#5a2470', fr()), '#ffab4a', light(fx, hy) * 0.25), [0.3, 0.7, 1, 0.75]));
      out.push(E.ribbon([[fx - 1.4, hy - 0.6], [fx - 1.2, hy + 1.4]], 1.3, '#c890d0', [0.7, 0.4]));
      out.push(E.ribbon([[fx, hy - 9], [fx, hy - 5.6]], 1, '#3a2a2a', [1, 1]));
      counter.n += 3;
    }
  };
  figTree();
  fruitTree(812, 512, TREE(3.4, 512), 130, ['#2c9a86', '#3ac0a0', '#5ad8b8'], 'palm');         // BRIGHT teal, frame right — a palm
  fruitTree(650, 400, TREE(2.4, 400), 60, ['#3a6ad0', '#4a7ae0', '#6a9af0'], 'pomegranate');   // BRIGHT blue, far back — a pomegranate

  /* lush jewel undergrowth + a fruitful scatter of garden flowers, visible even
     in the dark (brighter where the Light falls) — the ground itself is alive */
  const jewelBush = (bx, by, w, h, cols) => strokes(out, counter, {
    rng, n: Math.round(w * 2.2),
    sample: r => { const a = r() * Math.PI * 2, dd = Math.pow(r(), 0.7); return [bx + Math.cos(a) * w * dd, by - Math.abs(Math.sin(a)) * h * dd]; },
    dir: (x, y) => -Math.PI / 2 + (fbm(x / 10, y / 10, 259) - 0.5) * 1.3,
    col: (x, y, r) => { const g = light(x, y); let c = ramp(cols, fbm(x / 12, y / 12, 261) + r() * 0.3); return jig(mix(mix(c, '#ffab4a', g * 0.72), '#0c1830', (1 - g) * 0.3), r, 10); },
    len: 7, lw: 2.4, steps: 2, lenJ: 0.5,
  });
  jewelBush(36, 504, 24, 17, ['#5a2060', '#7a2a70', '#9a3a82']);
  jewelBush(706, 472, 22, 15, ['#1f5a56', '#2c7060', '#3a8a6e']);
  jewelBush(228, 502, 18, 12, ['#3a2a72', '#4a3a92', '#5a4ab0']);
  jewelBush(594, 500, 16, 11, ['#6a2a5a', '#8a3a6a']);
  strokes(out, counter, {        // jewel garden-flowers scattered on the dark ground
    rng, n: 220,
    sample: rej(-10, 320, 814, 512, (x, y) => y > horizon(x) + 10 && road(x, y) < 0.5),
    dir: () => -Math.PI / 2,
    col: (x, y, r) => { const g = light(x, y); const k = r(); const c = k < 0.22 ? '#ee5c84' : k < 0.44 ? '#b77ce0' : k < 0.64 ? '#f6c63e' : k < 0.82 ? '#5ec0e0' : '#f29ad0'; return jig(mix(c, '#ffd08a', g * 0.55), r, 12); },
    len: (x, y) => 3 + depth(x, y) * 5, lw: (x, y) => 2 + depth(x, y) * 2, steps: 1, lenJ: 0.5,
  });

  /* ====================== 7. EASTER EGG — the fruit ====================== */
  {
    const fx = 472, fy2 = 466;
    strokes(out, counter, {
      rng, n: 26,
      sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 0.8) * 6; const p = [fx + Math.cos(a) * d, fy2 + Math.sin(a) * d * 0.85]; const ang = Math.atan2(p[1] - fy2, p[0] - fx); return (ang > 0.5 && ang < 1.5 && d > 3) ? null : p; },
      dir: (x, y) => Math.atan2(y - fy2, x - fx) + Math.PI / 2,
      col: (x, y, r) => jig(mix('#8a7456', '#635244', Math.hypot(x - fx, y - fy2) / 7), r, 7),
      len: 4, lw: 1.8, steps: 2,
    });
    out.push(`<path d="M${fx} ${R1(fy2 - 5)}L${R1(fx + 2)} ${R1(fy2 - 8)}" stroke="#42382a" stroke-width="1.4" stroke-linecap="round" fill="none"/>`);
    counter.n++;
  }

  /* ====================== 8. THE LIGHT COLUMN — He walks ====================== */
  // a tall radiant presence: streaming strokes that lean forward (the lean is
  // the walking). Wider at the shoulder, narrowing to a crown; the halo ripens
  // gold→orange→green→blue as it dies, the law of yellow.
  const LEAN = -Math.PI / 2 + 0.15;
  // a commanding PILLAR: wide and near-constant, easing narrower toward the
  // crown, flaring where it stands on the road — a pillar of fire, not a plume
  const colHalf = y => {
    const t = (COLBASE - y) / (COLBASE - COLTOP); if (t < 0 || t > 1) return 0;
    const flare = 1 + 0.5 * Math.exp(-(COLBASE - y) / 46);            // it sits WIDE on the ground
    // and tapers to a tongue — a real flame is a teardrop, fat at the base, licking
    // to a point. t^1.6 makes the taper accelerate toward the crown.
    return (46 - 34 * Math.pow(t, 1.6)) * flare;
  };
  // FIRE IS NATURAL — so the Light does not stand in straight streaks; it FLAMES.
  // The strokes rise but lick and curl (Munch: all that is living is curved; only
  // made things — cobbles, roads, houses — run straight).
  // MORE MOVEMENT (Fred). A tighter curl field (52 -> 34) and a stronger swirl term
  // make the strokes lick and twist instead of streaming; fire is the most curved
  // thing in the book (Munch: all that lives is curved).
  const colDir = (x, y) => { const [a, b] = curlV(x, y, 137, 34); return Math.atan2(-1.0 + b * 2.9, (x - COLX) * 0.02 + a * 2.9); };
  // ⚠ THE FLAME BODY IS NOT BAKED — it is drawn at RUNTIME in brush-marks so it can
  // burn (drawBonfire in engine/character.js, placed by CRITTERS[6]). Everything the
  // fire DOES to the garden is still baked right here: `column()` above warms the
  // cypress, the ground and every leaf, and the footfall pool below lies on the road.
  // Light baked, flame alive — and tuning the flame no longer costs a plate rebuild.
  // A low EMBER BED stays baked so the plate never has a hole in it.
  strokes(out, counter, {
    rng, n: 170,
    sample: r => { const a2 = r() * Math.PI * 2, d = Math.sqrt(r()); return [COLX + Math.cos(a2) * d * 48, COLBASE - 8 + Math.sin(a2) * d * 17]; },
    dir: colDir,
    col: (x, y, r) => jig(ramp(['#fff2c8', '#ffc65a', '#f2802a', '#a8402c'], Math.hypot((x - COLX) / 48, (y - COLBASE + 8) / 17)), r, 8),
    op: 0.72, len: 12, lw: 3.6, steps: 3, follow: 0.9, lenJ: 0.5, impasto: 0.4,
  });

  strokes(out, counter, {        // footfall: gold splashing forward onto the road
    rng, n: 240,
    sample: r => { const a = r() * Math.PI, d = Math.pow(r(), 1.2) * 96; return [COLX + 8 + Math.cos(a + Math.PI) * d * 1.7, COLBASE - 2 + Math.abs(Math.sin(a)) * d * 0.34]; },
    dir: () => 0.05,
    col: (x, y, r) => jig(ramp(['#fff2c8', '#ffc65a', '#f2802a', '#a8402c', '#5e2436'], Math.hypot((x - COLX - 8) / 1.7, (y - COLBASE) * 2.0) / 100), r, 8),
    op: 0.58,   // the pool it throws is light on the ground, not pigment
    len: (x, y) => 8 + 8 * depth(x, y), lw: 3, steps: 2, relief: 0.9,
  });

  /* ====================== 9.5 BACKGROUND LIFE (Matt 6:26; Isa 55:12) ====================== */
  for (const [bx, by, s] of [[440, 86, 1], [478, 100, 0.85], [412, 112, 0.8], [510, 92, 0.74]]) {
    paintPath(out, counter, rng, [[bx - 6 * s, by + 2.6 * s], [bx, by - 1.8 * s], [bx + 6 * s, by + 2.6 * s]], (x, y, r) => jig('#1a2c52', r, 6), { lw: 1.5 * s, len: 3.4, density: 0.9, jitter: 0.5 });
  }

  /* ====================== 10. THE FIGURE — you, hiding in the dark ====================== */
  // ONE small figure — YOU, the recurring red child of the whole book — hiding
  // behind the cypress's shadow flank, bowed, knees drawn in. Not an Eden couple:
  // a single soul already in the dark world, hiding in shame, and the walking
  // Light comes to seek you (Gen 3:9, "Where art thou?"). The journey runs FROM
  // here (sin, the dark) TO the bright fruitful home (purity) — never backward.
  const _fgFig = out.length;   // [FG plane] you, the hiding child
  const HB = cypresses[0];
  const f1x = HB.x + 28, f1y = 468;   // on the cypress's shadow flank, away from the seeking Light
  // HAND-BUILT curled/crouched child (no personCaps — it can't pose a curl). Cute-
  // chunky proportions: big round head bowed low, short chunky torso curled forward,
  // knees drawn up to the chest (thigh+shin each, knee bent tight), arms wrapped
  // around the knees (upper arm + forearm, elbow bent) — drawing in, hiding in shame.
  // Figure ~40px tall; head r≈5, torso r≈3.0, leg r≈2.2, arm r≈1.8.
  // Curl seated on the ground, facing LEFT, knees drawn up. Head a clear ball on
  // top, bowed forward over the knees. Bigger overall so it reads, lifted a touch
  // out of the foliage. h≈46; head r≈6, torso r≈3.4, leg r≈2.6, arm r≈2.0.
  // THE MAIN CHARACTER — the little pilgrim, huddled small behind the boulder,
  // hem pooled on the ground, wide eyes peeking toward the seeking Light (left)
  E.paintMask(out, counter, rng, {
    x: f1x, y: f1y, h: 44, facing: -1, kneel: true, lean: -3,
    eye: [-1, -0.2], mood: 'wary', shadow: 0.25,
  });
  // a breath of the seeking Light's gold on the child's near side — it reaches even here
  paintPath(out, counter, rng, [[f1x - 5, f1y - 40], [f1x - 6, f1y - 27], [f1x - 9, f1y - 13]],
    (x, y, r) => jig(mix(GOLD_DEEP, '#8a6c34', r() * 0.6), r, 9), { lw: 1.2, len: 3, density: 0.55, jitter: 1.1 });
  // a BOULDER the child crouches behind — actually HIDING from the seeking Light.
  // The Light is to the LEFT, so the rock sits between the child and the Light (its
  // mass to his LEFT, the Light side), and he peeks over the top toward it — NOT a
  // rock in front of him. Dark night stone, faintly gold on its Light-facing edge.
  {
    const out = [], counter = { n: 0 };   // ⚠ Sep 23: the boulder is RETIRED (drawn into a throwaway so the shared rng stream is unchanged) — see the fig below
    const rx = f1x - 28, ryT = f1y - 28, rw = 32, rh = 48;   // boulder to the child's LEFT (the Light side)
    // the boulder's cast shadow on the floor — the Light is to the LEFT, so the
    // shadow falls to the RIGHT, grounding the rock
    out.push(`<ellipse cx="${R1(rx + rw * 0.6)}" cy="${R1(ryT + rh - 3)}" rx="${R1(rw * 1.15)}" ry="${R1(rw * 0.3)}" fill="#0c0a16" opacity="0.34"/>`); counter.n++;
    out.push(`<path d="M${R1(rx - rw)} ${R1(ryT + rh)} Q${R1(rx - rw - 3)} ${R1(ryT + 8)} ${R1(rx - rw * 0.5)} ${R1(ryT + 2)} Q${R1(rx - rw * 0.05)} ${R1(ryT - 5)} ${R1(rx + rw * 0.5)} ${R1(ryT + 3)} Q${R1(rx + rw)} ${R1(ryT + 9)} ${R1(rx + rw)} ${R1(ryT + rh)} Z" fill="#151c30"/>`);
    counter.n++;
    strokes(out, counter, {
      rng, n: 150,
      sample: rej(rx - rw, ryT - 4, rx + rw, ryT + rh, (x, y) => (x - rx) ** 2 / (rw * rw) + Math.max(0, ryT + 6 - y) ** 2 / 220 < 1.04),
      dir: (x, y) => 0.16 + (fbm(x / 30, y / 26, 71) - 0.5) * 0.5,
      col: (x, y, r) => { const g = light(x, y); let c = ramp(['#0f1528', '#1f2740', '#39446a'], fbm(x / 26, y / 22, 73) * 0.72); c = mix(c, '#a05a2e', g * 0.56); return jig(c, r, 9); },
      len: 9, lw: 2.8, steps: 2, wild: 0.1, lenJ: 0.5, impasto: 0.5,
    });
  }
  /* (Sep 23's fig-leaf shrub over the child was REMOVED Oct 6 — Fred: "the person is sitting behind emoji leafs
     (ugly)". He hides between two real trees now: the fig and the cypress — see the jewel trees below.) */
  fgRanges.push([_fgFig, out.length]);   // ← the hiding child + the boulder are foreground

  /* ====================== 9.7 LIFE IN THE NIGHT (Ps 104:24; Gen 1:20-25) ======================
     The dark is not empty. FIREFLIES drift in the unlit margins — small warm
     sparks with soft halos, grace-notes (not lanterns); a couple of dusty
     MOTHS flutter dark against the Light's gold road, drawn toward Him; and
     CLOSED night-flowers wait folded among the ground for the day that is
     coming. All living things in curved strokes (Munch). */
  {
    // keep the new life clear of the hiding child + boulder + Hebrew egg,
    // and of the fruit easter egg
    const clear = (x, y) =>
      !(x > 290 && x < 462 && y > 398) &&
      !(x > 452 && x < 494 && y > 444 && y < 486);
    // FIREFLIES — sampled into the DARK ground air (light < 0.3): a soft warm
    // halo, a wandering curved drift-trail, and a bright living spark
    let flies = 0;
    const flyAt = [];
    for (let i = 0; i < 500 && flies < 16; i++) {
      const x = 24 + rng() * 756, y = 314 + rng() * 180;
      if (y < horizon(x) + 14 || light(x, y) > 0.3 || !clear(x, y)) continue;
      if (flyAt.some(p => Math.hypot(p[0] - x, p[1] - y) < 34)) continue;  // spaced apart — grace-notes, never a clump
      flies++; flyAt.push([x, y]);
      const dz = depth(x, y);                       // near = bigger + brighter
      const s = 0.75 + dz * 0.9 + rng() * 0.3;
      out.push(`<circle cx="${R1(x)}" cy="${R1(y)}" r="${R1(5.4 * s)}" fill="#d8c86a" opacity="0.14"/>`); counter.n++;
      out.push(`<circle cx="${R1(x)}" cy="${R1(y)}" r="${R1(2.6 * s)}" fill="#eede7c" opacity="0.4"/>`); counter.n++;
      const tx = x - (4 + rng() * 5) * s, ty = y + (rng() - 0.3) * 5 * s;
      out.push(`<path d="M${R1(tx)} ${R1(ty)} Q${R1((tx + x) / 2)} ${R1(Math.min(ty, y) - 2.6 * s)} ${R1(x)} ${R1(y)}" stroke="#c8ba64" stroke-width="${R1(0.9 * s)}" opacity="0.35" fill="none" stroke-linecap="round"/>`); counter.n++;
      out.push(`<circle cx="${R1(x)}" cy="${R1(y)}" r="${R1(1.5 * s)}" fill="#fff8cc"/>`); counter.n++;
    }
    // MOTHS — dusty dark silhouettes with curved wings, fluttering in the gold
    // near the Light's road (dark-on-light so they read against the glow)
    for (const [mx, my, s] of [[260, 352, 1.35], [238, 409, 1.05], [298, 430, 0.85]]) {
      paintPath(out, counter, rng, [[mx - 6.5 * s, my - 3.5 * s], [mx - 3 * s, my - 6 * s], [mx - 0.5 * s, my - 0.5 * s]],
        (x, y, r) => jig('#2a2148', r, 7), { lw: 2.2 * s, len: 3, density: 0.9, jitter: 0.4 });
      paintPath(out, counter, rng, [[mx + 0.5 * s, my - 0.5 * s], [mx + 3 * s, my - 6 * s], [mx + 6.5 * s, my - 3.5 * s]],
        (x, y, r) => jig('#2a2148', r, 7), { lw: 2.2 * s, len: 3, density: 0.9, jitter: 0.4 });
      out.push(ribbon([[mx, my - 2.2 * s], [mx, my + 2.6 * s]], 1.7 * s, '#1c1636')); counter.n++;   // the little body
    }
    // CLOSED NIGHT-FLOWERS — folded buds on curved stems in the unlit margins
    const BUD = ['#b06a9a', '#8a6ac0', '#c8b070', '#9a5a86'];
    let buds = 0;
    for (let i = 0; i < 500 && buds < 11; i++) {
      const x = 20 + rng() * 764, y = 400 + rng() * 104;
      if (y < horizon(x) + 40 || light(x, y) > 0.22 || !clear(x, y)) continue;
      buds++;
      const dz = depth(x, y), hgt = 8 + dz * 8, tilt = (rng() - 0.5) * 34;
      const c = BUD[Math.floor(rng() * BUD.length)];
      out.push(`<path d="M${R1(x)} ${R1(y)} Q${R1(x + tilt * 0.2)} ${R1(y - hgt * 0.6)} ${R1(x + tilt * 0.35)} ${R1(y - hgt)}" stroke="#1f5640" stroke-width="${R1(1.1 + dz)}" fill="none" stroke-linecap="round"/>`); counter.n++;
      const bx = x + tilt * 0.35, by = y - hgt;
      out.push(`<ellipse cx="${R1(bx)}" cy="${R1(by - hgt * 0.16)}" rx="${R1(1.7 + dz * 1.4)}" ry="${R1(3.2 + dz * 2.6)}" fill="${c}" transform="rotate(${R1(tilt)} ${R1(bx)} ${R1(by - hgt * 0.16)})"/>`); counter.n++;
      out.push(`<path d="M${R1(bx - 0.9)} ${R1(by - hgt * 0.3)} Q${R1(bx)} ${R1(by - hgt * 0.44)} ${R1(bx + 0.9)} ${R1(by - hgt * 0.3)}" stroke="#f0e0c0" stroke-width="0.8" opacity="0.7" fill="none"/>`); counter.n++;
    }
  }

  // EASTER EGG — Gen 3:9 ("Where art thou?") in its ORIGINAL HEBREW numerals, ג·ט
  // (gimel=3, tet=9, read right-to-left), cut into the Light's bright road at the
  // cypress foot — the very question the seeking Light calls to the one who hid (the
  // page's own quote), in the tongue it was first asked. DARK incision on the gold.
  E.inscriptionText(out, E.hebrewRef(3, 9), { x: 346, y: 489, h: 21, body: '#181004', edge: '#f4eccc', op: 0.82, edgeOp: 0.6 });

  // MULTIPLANE: assemble the requested depth plane. Each is its own cel —
  // transparent where it has no content — so they stack and parallax apart.
  const ALT = 'A garden at night in saturated cobalt and gold, fruitful even in the dark: a floor recedes in perspective; a luminous gold column of walking Light sweeps a bright road toward a cypress where a single small child hides behind a fig bush, peeking out over its broad leaves; jewel-coloured fruit trees stand in the dark, and a sky of long arcing strokes curves around two great burning stars. The Light comes seeking the one who hid.';
  const RAW = { undercoat: 0, weave: 0, varnish: 0, oil: 0 };   // no baked surface — the live filter unifies the planes
  const setOf = ranges => { const s = new Set(); for (const [a, b] of ranges) for (let i = a; i < b; i++) s.add(i); return s; };
  const pick = ranges => ranges.map(([a, b]) => out.slice(a, b).join('\n')).join('\n');
  const farSet = setOf(farRanges), fgSet = setOf(fgRanges);
  if (LAYER === 'sky') return svgWrap(ALT, out.slice(0, skyEnd).join('\n'), RAW);   // smooth night sky ground + stars (opaque)
  const sm = LAYER.match(/^sky(\d+)$/);
  if (sm) return svgWrap(ALT, '<g>' + skySheets[+sm[1] - 1] + '</g>', RAW);         // one sky-swirl sheet
  if (LAYER === 'far') return svgWrap(ALT, pick(farRanges), RAW);                   // distant hills + fringe
  if (LAYER === 'front') return svgWrap(ALT, pick(fgRanges), RAW);                     // the hiding child
  if (LAYER === 'mid') {                                                            // floor, road, walking Light, cypresses, planted trees
    const body = out.filter((_, i) => i >= skyEnd && !farSet.has(i) && !fgSet.has(i)).join('\n');
    return svgWrap(ALT, body, RAW);
  }
  // full painting (desktop): sky ground, the stacked sky-sheets, then everything else
  return svgWrap(ALT, out.slice(0, skyEnd).concat(skySheets, out.slice(skyEnd)).join('\n'));
}
