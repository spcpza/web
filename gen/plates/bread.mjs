// gen/plates/bread.mjs — "The Bread of Life"
// John 6:35 ("I am the bread of life"). POST-RESURRECTION new-creation page —
// BRIGHT DAY. The recurring RED child, washed clean with a soft WHITE AURA,
// walks a flourishing bright path through green fields full of wildflowers,
// fed by the Light, holding up a warm GLOWING LOAF of light; the way is lit
// bright ahead toward home. Vibrant light-blue sky, gold, lush green.
// Daily provision, joy, the road home bright. MULTIPLANE.
//
// Paint order (= rng order — append only):
//   1. SKY      — vibrant light-blue day, gold + pink low at the horizon
//   2. GROUND   — flourishing green field + a bright winding path
//   3. FLOWERS  — wildflowers of every colour across the field
//   4. LIFE     — fruit-trees flourishing in the field (planted)
//   4b. LIFE    — sparrows fed on the path (Matt 6:26) + lilies at the verge (Matt 6:28)
//   5. FIGURE   — the red child, washed, white aura, walking, loaf raised
//   6. BREAD    — the warm glowing loaf of light cradled/raised
//   7. EASTER EGG — John 6:35 (Greek) on the bright path
export const name = 'bread';
export const title = 'The Bread of Life';
export const caption = 'Fed by the Light, every day.';
export const seed = 20261006;
export const focal = { x: 420, y: 330 };
// MOBILE 3D — depth planes (FAR→NEAR): the bright day sky behind (opaque); the
// flourishing field + path + wildflowers + planted trees + the incised verse in
// the middle; the washed red child + the glowing loaf nearest. `full` (desktop)
// keeps the original paint order untouched.
// DIORAMA (true one-point perspective on mobile): the ground is ONE plane that
// paint-live re-projects with an exact ground-plane homography as the camera
// trucks/dollies; each TREE and the CHILD are separate billboard cels anchored
// to their base point on that ground (so they scale with true distance and
// stay planted). Order = far → near: tc (y268, farthest) … fg (the child).
// ONE-POINT PERSPECTIVE, DRAWN INTO THE ART (the pilot of the book-wide redraw):
// an AVENUE of trees flanks the path in four depth ROWS — each row at a true
// depth Z (Z = k/(y−v0), k=268, v0=232), sized by 1/Z, placed at ±220/Z from
// the vanishing axis (x=424) — and each row is its own camera band, so the
// drawing's perspective and the camera's projection AGREE exactly.
export const layers = [
  { name: 'bg', opaque: true },  // bright day sky (backmost, opaque)
  { name: 'ground' },            // field + path + edge-stones + wildflowers + fringe + verse
  { name: 't3' },                // amber tree, mid-distant (base 548,268)
  { name: 't2' },                // pink tree, left (base 120,332)
  { name: 't1' },                // teal tree, right (base 690,348)
  { name: 'fg' },                // the red child + the glowing loaf (base 436,396)
];

export function paint(E, opts = {}) {
  const {
    mulberry32, fbm, curlV, goldenSpiralV, mix, ramp, jig, strokes, rej,
    lightRadial, paintChild, lightEdge, castShadow, personCaps, paintPath, inCap, underpaintCapsules,
    fruitTree, groundFlowers, horizonFringe, ridge, LEAF_PALETTES,
    svgWrap, R1, W, H,
    GOLD, GOLD_PALE, GOLD_DEEP, GOLD_HOT,
  } = E;

  const rng = mulberry32(seed);
  const out = [];
  const counter = { n: 0 };
  // MOBILE 3D LAYERS: tag the sky-end and the figure ranges; MID = the rest
  // (field, path, flowers, trees, verse). FG = child + glowing loaf.
  const LAYER = opts.layer || 'full';
  const fgRanges = [];

  /* ---------------- 1. SKY — vibrant bright day ---------------- */
  out.push(`<rect width="${W}" height="${H}" fill="#74cef8"/>`);
  const horizon = 232;
  // a low warm sun-glow on the horizon ahead — the Light the child walks toward
  const glow = lightRadial(420, 230, 200);
  // THE ALIVE DAY SKY (the fractal jewel-swirl — motion at three scales): the whole
  // bright heaven WHEELS in ONE great spiral around the low sun-glow on the horizon
  // ahead (macro); a few eddies turn inside the wheel (mid); every stroke curves
  // with its parent current (micro). Swirls within swirls — the day-blue sky as
  // deep moving water, not flat drift. Same alive hand as looking/garden; day stays day.
  const EDDIES = [[132, 60, -60], [560, 70, 58], [664, 152, -50], [178, 150, 46]];
  const skyDir = (x, y) => {
    let vx = 0, vy = 0;
    { const [a, b] = goldenSpiralV(x, y, 420, 216, 115, 260); vx += a; vy += b; }   // the great wheel around the sun-glow ahead
    for (const [ex, ey, s] of EDDIES) { const [a, b] = goldenSpiralV(x, y, ex, ey, s, 80); vx += a; vy += b; }
    const [c, d] = curlV(x, y, 31, 120); vx += c * 26; vy += d * 26;                 // fine turbulence so every stroke curves with its current
    return Math.atan2(vy, vx);
  };
  const nearEddy = (x, y) => { let m = 1e9; for (const [ex, ey] of EDDIES) m = Math.min(m, Math.hypot(x - ex, y - ey) / 80); return m; };
  // jewel eddy-glows in soft DAY tints (teal / rose / gold) — the eddy cores breathe
  // faint colour, kept subtle so the vibrant light-blue day stays bright day
  const EGLOW = [[132, 60, '#7fc9d8'], [560, 70, '#f2b0c8'], [664, 152, '#f4d07e'], [178, 150, '#6fc2d4']];
  const skyCol = (x, y, r, lift) => {
    // vibrant: gold + pink warm low at the horizon, light blue up, near-white crown
    const t = Math.max(0, Math.min(1, (horizon - y) / horizon * 1.05 + fbm(x / 120, y / 120, 17) * 0.28 - 0.04));
    let c = ramp(['#fbd258', '#f9a8c4', '#54c6f7', '#74cef8', '#a6e2fb', '#f0fbff'], t);
    for (const [ex, ey, ec] of EGLOW) { const d2 = Math.hypot(x - ex, y - ey); c = mix(c, ec, Math.exp(-d2 / 95) * 0.4); }   // the eddy cores breathe faint jewel light
    if (lift) c = mix(c, '#ffffff', lift);
    return jig(c, r, 6);
  };
  // the deep moving day-sky — long streaming strokes that FOLLOW the great wheel
  strokes(out, counter, {
    rng, n: 700, sample: rej(-10, -10, 810, horizon + 8),
    dir: skyDir, col: (x, y, r) => skyCol(x, y, r, 0),
    len: 44, lw: 9.5, steps: 4, follow: 0.91, wild: 0.05, lenJ: 0.5, impasto: 0.5, relief: 0.55,
  });
  // bright cloud-ribbon crests + soft knot-sparks — following the curling flow so
  // the jewel swirls read clearly against the bright day sky
  strokes(out, counter, {
    rng, n: 210, sample: rej(-10, -10, 810, horizon - 10),
    dir: skyDir,
    col: (x, y, r) => {
      const near = nearEddy(x, y);
      if (near < 1.1 && r() < 0.06) return jig(r() < 0.5 ? '#fffdf6' : '#f79ac6', r, 12);   // bright sparks at the eddy knots
      const k = fbm(x / 88, y / 88, 23) + (r() - 0.5) * 0.2;
      return k > 0.74 ? jig('#fffdf6', r, 8) : skyCol(x, y, r, 0.18);   // bright white cloud-crests
    },
    len: 30, lw: 5, steps: 5, follow: 0.9, wild: 0.2, lenJ: 0.55, impasto: 0.4,
    aJ: (x, y) => 0.16 + Math.max(0, 1.3 - nearEddy(x, y)) * 0.42,
  });
  const skyEnd = out.length;   // BG plane: the opaque bright day sky

  /* ---------------- 2. GROUND — flourishing green field + bright path ---------------- */
  // the field's top is a rolling contour, never a straight line
  const fieldTop = ridge(horizon, { amp: 20, freq: 150, bumps: 0.32, seed: 131 });
  const WHEAT = ['#3a7a38', '#5e9a40', '#88b84a', '#bcc850', '#e6d266'];
  // the path: a soft S winding from the foreground up to the horizon-glow ahead
  const FEET = { x: 436, y: 396 };   // ON the path: pathX(t) at y=396 ≈ 436 — "a lamp unto my FEET" (Ps 119:105)
  const pathTop = [424, horizon + 2];
  const pathX = t => 372 + Math.sin(t * 2.2) * 64 * (1 - t * 0.4) + (pathTop[0] - 372) * t;
  const pathY = t => H + 10 - t * (H + 10 - pathTop[1]);
  const pathW = t => 46 * (1 - t) + 5;       // wide near, vanishing far
  const onPath = (x, y) => {
    let best = 1e9;
    for (let i = 0; i <= 16; i++) {
      const t = i / 16, px = pathX(t), py = pathY(t);
      const d = Math.hypot((x - px), (y - py) * 1.1);
      if (d - pathW(t) < best) best = d - pathW(t);
    }
    return best;
  };
  // underpaint: solid GREEN field with the rolling top — gaps read lush, not bare
  {
    let d = `M-2 ${R1(fieldTop(-2))}`;
    for (let x = -2; x <= 802; x += 9) d += `L${R1(x)} ${R1(fieldTop(x))}`;
    d += `L802 ${H + 2}L-2 ${H + 2}Z`;
    out.push(`<path d="${d}" fill="#477e38"/>`); counter.n++;
  }
  // flourishing green grass strokes, gold at the lit crowns
  strokes(out, counter, {
    rng, n: 1500,
    sample: rej(-10, horizon - 22, 810, 510, (x, y) => y > fieldTop(x) - 1 && onPath(x, y) > 0),
    dir: (x, y) => { const [vx, vy] = curlV(x, y, 171, 70); return Math.atan2(vy * 0.9 - 0.5, Math.abs(vx) + 0.5); },
    col: (x, y, r) => {
      if (r() < 0.08) return jig('#2c6a48', r, 12);   // cool shadow flecks
      const depth = (y - horizon) / (H - horizon);
      const g = glow(x, y);
      let c = mix(ramp(WHEAT, 0.12 + fbm(x / 60, y / 60, 177) * 0.7 + depth * 0.3), '#f6e08a', g * 0.4);
      // ATMOSPHERIC PERSPECTIVE: the far field pales into the sky — air itself
      // declares the distance (the third bone of the one-point construction)
      c = mix(c, '#cfe6f2', Math.pow(1 - depth, 1.7) * 0.42);
      return jig(c, r, 13);
    },
    len: (x, y) => 8 + (y / H) * 16, lw: (x, y) => 2.5 + (y / H) * 3, steps: 3, lenJ: 0.55, wild: 0.16, impasto: 0.7,
  });
  // the BRIGHT PATH — pale warm dust, brightening toward the horizon-glow ahead
  strokes(out, counter, {
    rng, n: 620,
    sample: rej(280, horizon, 510, 510, (x, y) => onPath(x, y) < 0),
    dir: (x, y) => Math.atan2(pathTop[1] - y, pathTop[0] - x),
    col: (x, y, r) => { const g = glow(x, y); const up = Math.max(0, (510 - y) / (510 - horizon)); return jig(mix(ramp(['#f4e6c0', '#ecd9a4', '#e6cf94'], fbm(x / 50, y / 50, 191) * 0.5), '#fff4cc', Math.max(g, up) * 0.6), r, 9); },
    len: (x, y) => 8 + (y / H) * 12, lw: (x, y) => 2.6 + (y / H) * 3, steps: 3, lenJ: 0.5,
  });
  // a bright warm thread of light running up the path toward home (Ps 119:105)
  strokes(out, counter, {
    rng, n: 120,
    sample: r => { const t = Math.pow(r(), 1.4); const px = pathX(t), py = pathY(t); return [px + (r() + r() - 1) * pathW(t) * 0.3, py + (r() - 0.5) * 4]; },
    dir: (x, y) => Math.atan2(pathTop[1] - y, pathTop[0] - x),
    col: (x, y, r) => jig(ramp(['#fff8e0', '#ffeeb0', GOLD_PALE], (510 - y) / (510 - horizon) + (r() - 0.5) * 0.25), r, 7),
    len: 13, lw: 1.8, steps: 3, lenJ: 0.6,
  });
  // CONVERGING EDGE-STONES — the drawn ORTHOGONALS of the one-point construction:
  // two dashed stone lines hug the path's edges and vanish into the horizon glow,
  // stone size ∝ 1/Z so the eye reads the recession even in a still.
  strokes(out, counter, {
    rng, n: 170,
    sample: r => { const t = Math.pow(r(), 1.15); const side = r() < 0.5 ? -1 : 1; return [pathX(t) + side * (pathW(t) + 3), pathY(t) + (r() - 0.5) * 3]; },
    dir: (x, y) => Math.atan2(pathTop[1] - y, pathTop[0] - x),
    col: (x, y, r) => jig(mix('#8a6a3c', '#c9a86a', r() * 0.5), r, 8),
    len: (x, y) => 3 + ((y - horizon) / (H - horizon)) * 9,
    lw: (x, y) => 1.2 + ((y - horizon) / (H - horizon)) * 2.6,
    steps: 2, lenJ: 0.5,
  });

  /* ---------------- 3. WILDFLOWERS — every colour across the field ---------------- */
  groundFlowers(out, counter, rng, {
    x0: -6, y0: horizon + 8, x1: 812, y1: 508, n: 460,
    mask: (x, y) => onPath(x, y) > 4,
    lightFn: glow,
    depthFn: (x, y) => (y - horizon) / (510 - horizon),
  });

  /* ---------------- 4. LIFE — flourishing fruit-trees planted in the field ---------------- */
  const horizonFringeCols = ['#2c6a48', '#3a7a38', '#5e9a40', '#88b84a'];
  horizonFringe(out, counter, rng, { horizonFn: fieldTop, x0: -10, x1: 320, cols: horizonFringeCols, hMax: 20, lightFn: glow });
  horizonFringe(out, counter, rng, { horizonFn: fieldTop, x0: 520, x1: 810, cols: horizonFringeCols, hMax: 20, lightFn: glow, seed: 521 });
  // THE AVENUE — four depth rows of trees flanking the path, drawn by the
  // perspective construction itself: y = v0 + k/Z, lateral = ±220/Z from the
  // vanishing axis (424), height = 110/Z. Far → near, each row its own band.
  // three flanking trees as true-depth billboards (an AVENUE with visible
  // trunks needs a trunk-forward tree helper — fruitTree is canopy-only and a
  // row of them reads as floating bouquets; build the helper before retrying)
  const avRanges = [];
  let _t = out.length;
  fruitTree(out, counter, rng, 548, 268, 50, 22, LEAF_PALETTES[5], glow);  // amber, mid-distant
  avRanges.push([_t, out.length]);
  _t = out.length;
  fruitTree(out, counter, rng, 120, 332, 78, 34, LEAF_PALETTES[1], glow);  // pink, left
  avRanges.push([_t, out.length]);
  _t = out.length;
  fruitTree(out, counter, rng, 690, 348, 84, 38, LEAF_PALETTES[2], glow);  // teal, right
  avRanges.push([_t, out.length]);

  /* ---------------- 4b. LIFE — sparrows on the path + lilies at the verge ----------------
     The page's own word made visible: "Behold the fowls of the air... your
     heavenly Father feedeth them" (Matt 6:26) — fed sparrows ON the daily-bread
     path; "Consider the lilies of the field, how they grow" (Matt 6:28) — white
     trumpet lilies clothed at its verge. Bold simple silhouettes, one accent
     each, curved lines (living things — Munch), size ∝ 1/Z. Ground band. */
  {
    // a SPARROW, feet-anchored at (px,py). pose 'peck' faces LEFT, head to the
    // path (feeding); pose 'watch' faces RIGHT, head up toward the Light ahead.
    const sparrow = (px, py, s, pose) => {
      // BOLD PRIMITIVES so the anatomy survives the brushwork (the blob lesson):
      // tail wedge + body ellipse + a DISTINCT round head + beak triangle + legs.
      const X = dx => R1(px + dx * s), Y = dy => R1(py + dy * s);
      const DK = '#3a2812';   // dark warm-brown silhouette on the PALE path (contrast vs the local hue)
      if (pose === 'peck') {   // facing LEFT, head down at the seed
        out.push(`<path d="M${X(14)} ${Y(-14)} L${X(4.5)} ${Y(-11.5)} L${X(12.5)} ${Y(-7)} Z" fill="${DK}" opacity="0.95"/>`); counter.n++;   // tail wedge, raised
        out.push(`<ellipse cx="${X(-0.5)}" cy="${Y(-8.5)}" rx="${R1(8.2 * s)}" ry="${R1(5.4 * s)}" transform="rotate(-14 ${X(-0.5)} ${Y(-8.5)})" fill="${DK}" opacity="0.96"/>`); counter.n++;   // body
        out.push(`<circle cx="${X(-8.5)}" cy="${Y(-6)}" r="${R1(4.4 * s)}" fill="${DK}" opacity="0.96"/>`); counter.n++;                       // head, lowered
        out.push(`<path d="M${X(-10.5)} ${Y(-5.5)} L${X(-16.5)} ${Y(-1)} L${X(-9)} ${Y(-3)} Z" fill="#5a4020" opacity="0.95"/>`); counter.n++; // beak to the ground
        out.push(`<path d="M${X(4)} ${Y(-5)} Q${X(-1.5)} ${Y(-3.6)} ${X(-6)} ${Y(-4.6)}" stroke="#c8955a" stroke-width="${R1(1.8 * s)}" fill="none" opacity="0.8" stroke-linecap="round"/>`); counter.n++;   // buff breast (the one accent)
        out.push(`<circle cx="${X(-8.8)}" cy="${Y(-7.4)}" r="${R1(1.05 * s)}" fill="#f6e8c0" opacity="0.95"/>`); counter.n++;                  // eye dot
      } else {                 // 'watch': facing RIGHT, head raised toward the Light
        out.push(`<path d="M${X(-14.5)} ${Y(-11.5)} L${X(-4.5)} ${Y(-9.5)} L${X(-12.5)} ${Y(-5)} Z" fill="${DK}" opacity="0.95"/>`); counter.n++;   // tail wedge
        out.push(`<ellipse cx="${X(0.5)}" cy="${Y(-7.5)}" rx="${R1(8 * s)}" ry="${R1(5.2 * s)}" transform="rotate(10 ${X(0.5)} ${Y(-7.5)})" fill="${DK}" opacity="0.96"/>`); counter.n++;   // body
        out.push(`<circle cx="${X(7.5)}" cy="${Y(-13.5)}" r="${R1(4.6 * s)}" fill="${DK}" opacity="0.96"/>`); counter.n++;                     // head, clearly RAISED above the back-line
        out.push(`<path d="M${X(11)} ${Y(-15)} L${X(16.5)} ${Y(-13)} L${X(11)} ${Y(-11.5)} Z" fill="#5a4020" opacity="0.95"/>`); counter.n++;  // beak up-forward
        out.push(`<path d="M${X(7)} ${Y(-9)} Q${X(7.5)} ${Y(-6)} ${X(2.5)} ${Y(-4.4)}" stroke="#c8955a" stroke-width="${R1(1.8 * s)}" fill="none" opacity="0.8" stroke-linecap="round"/>`); counter.n++;    // buff breast
        out.push(`<circle cx="${X(8.6)}" cy="${Y(-14.4)}" r="${R1(1.05 * s)}" fill="#f6e8c0" opacity="0.95"/>`); counter.n++;                  // eye dot
      }
      out.push(`<path d="M${X(-1)} ${Y(-4)} L${X(-1.8)} ${Y(0)} M${X(4)} ${Y(-4.4)} L${X(4.8)} ${Y(0)}" stroke="#2e1f10" stroke-width="${R1(Math.max(0.9, 1.1 * s))}" fill="none" opacity="0.9" stroke-linecap="round"/>`); counter.n++;   // legs
    };
    // a white trumpet LILY, root-anchored at (px,py), bloom at py-h, gold throat.
    const lily = (px, py, h, lean = 0) => {
      const tx = px + lean, ty = py - h, s = Math.max(4, h * 0.32);
      out.push(`<path d="M${R1(px)} ${R1(py - h * 0.30)} Q${R1(px - s * 0.9)} ${R1(py - h * 0.52)} ${R1(px - s * 1.15)} ${R1(py - h * 0.40)} Q${R1(px - s * 0.55)} ${R1(py - h * 0.34)} ${R1(px)} ${R1(py - h * 0.24)} Z" fill="#2f6a38" opacity="0.9"/>`); counter.n++;   // leaf-blades
      out.push(`<path d="M${R1(px)} ${R1(py - h * 0.20)} Q${R1(px + s * 0.85)} ${R1(py - h * 0.40)} ${R1(px + s * 1.05)} ${R1(py - h * 0.28)} Q${R1(px + s * 0.5)} ${R1(py - h * 0.22)} ${R1(px)} ${R1(py - h * 0.14)} Z" fill="#35743e" opacity="0.9"/>`); counter.n++;
      out.push(`<path d="M${R1(px)} ${R1(py)} Q${R1(px + lean * 0.4)} ${R1(py - h * 0.55)} ${R1(tx)} ${R1(ty)}" stroke="#255c30" stroke-width="${R1(Math.max(1.1, h * 0.055))}" fill="none" opacity="0.92" stroke-linecap="round"/>`); counter.n++;   // living curved stem
      out.push(`<path d="M${R1(tx)} ${R1(ty)} Q${R1(tx - s * 1.0)} ${R1(ty - s * 0.35)} ${R1(tx - s * 1.2)} ${R1(ty - s * 1.05)} Q${R1(tx - s * 0.4)} ${R1(ty - s * 0.72)} ${R1(tx)} ${R1(ty)} Z" fill="#fdfaef" opacity="0.95"/>`); counter.n++;   // left petal, flared
      out.push(`<path d="M${R1(tx)} ${R1(ty)} Q${R1(tx + s * 1.0)} ${R1(ty - s * 0.35)} ${R1(tx + s * 1.2)} ${R1(ty - s * 1.05)} Q${R1(tx + s * 0.4)} ${R1(ty - s * 0.72)} ${R1(tx)} ${R1(ty)} Z" fill="#f8f3e4" opacity="0.95"/>`); counter.n++;   // right petal
      out.push(`<path d="M${R1(tx)} ${R1(ty)} Q${R1(tx - s * 0.35)} ${R1(ty - s * 0.9)} ${R1(tx)} ${R1(ty - s * 1.45)} Q${R1(tx + s * 0.35)} ${R1(ty - s * 0.9)} ${R1(tx)} ${R1(ty)} Z" fill="#fffdf6" opacity="0.97"/>`); counter.n++;            // centre petal, lancet up
      out.push(`<path d="M${R1(tx)} ${R1(ty - s * 0.15)} L${R1(tx - s * 0.3)} ${R1(ty - s * 0.75)} M${R1(tx)} ${R1(ty - s * 0.15)} L${R1(tx + s * 0.28)} ${R1(ty - s * 0.7)} M${R1(tx)} ${R1(ty - s * 0.15)} L${R1(tx)} ${R1(ty - s * 0.9)}" stroke="#e8b23e" stroke-width="${R1(Math.max(0.8, s * 0.09))}" fill="none" opacity="0.9" stroke-linecap="round"/>`); counter.n++;   // gold stamens — arrayed beyond Solomon
    };
    // LILIES at the path verge (clear of the edge-stones, the child, and the egg)
    lily(326, 487, 30, -3); lily(337, 481, 24, 3); lily(317, 480, 20, -4);   // near-left cluster
    lily(470, 464, 27, 3); lily(481, 472, 31, -3); lily(461, 476, 21, 4);    // near-right cluster
    lily(384, 413, 15, -2); lily(377, 417, 12, 2);                           // far pair, smaller (1/Z)
    // SEED-CRUMBS on the path — the Father's table, spread where the birds feed
    for (const [cx2, cy2, cr] of [[371, 483.5, 1.0], [365, 486.5, 0.8], [377, 488.5, 0.9], [357, 490.5, 0.8], [396, 430.5, 0.6], [405, 432, 0.6]]) {
      out.push(`<circle cx="${R1(cx2)}" cy="${R1(cy2)}" r="${R1(cr)}" fill="#ffe9a0" opacity="0.85"/>`); counter.n++;
    }
    // SPARROWS on the bright path, fed each day (size ∝ depth; clear of egg + child)
    sparrow(386, 486, 1.05, 'peck');    // nearest, head down at the crumbs
    sparrow(352, 492, 0.95, 'watch');   // head up toward the Light — "are ye not much better than they?"
    sparrow(402, 428, 0.62, 'peck');    // farther up the path, smaller
  }

  /* ---------------- 5. FIGURE — the washed red child walking ----------------  [FG plane] */
  const _fg = out.length;
  const fy = FEET.y;
  // child mid-stride, one arm RAISED holding the loaf of light high, the way lit
  // bright ahead; consistent deep-red clothes; WASHED WHITE AURA (Rev 7:14)
  const CX = 436;
  const LOAF = { x: CX + 20, y: fy - 52 };   // the glowing loaf CARRIED before him at the chest —
                                             // clear of the head, its light falling on the path ahead
  // the child WALKS the path, carrying the warm loaf of light before him;
  // its glow falls on the next step — fed each day, lit each step.
  const childCaps = personCaps(CX, fy - 84, 84, {
    leftHand: [LOAF.x, LOAF.y],     // near hand carrying the bread of light before him
    rightHand: [CX - 22, fy - 36],  // far hand swinging at his side, mid-stride
    leftFoot: [CX - 13, fy],        // mid-stride on the path
    rightFoot: [CX + 15, fy - 2],
    headTilt: 0,                    // looking ahead, toward home
  });
  castShadow(out, counter, childCaps, { dir: 0.4 });
  paintChild(out, counter, rng, childCaps, { whiteAura: true, outlineW: 4 });
  // (the tiny hand-held fish was removed — at ~20px it read as a blade, not the
  // ΙΧΘΥΣ; the fish sign lives on the risen page where it has room to read)
  // warm gold rim-light on the side facing the Light ahead
  strokes(out, counter, {
    rng, n: 26,
    sample: rej(416, fy - 84, 468, fy, (x, y) => childCaps.some(c => inCap(x, y, c)) && !childCaps.some(c => inCap(x + 3, y - 3.5, c))),
    dir: () => -Math.PI / 3,
    col: (x, y, r) => jig(mix(GOLD, GOLD_HOT, r() * 0.5), r, 9),
    len: 4, lw: 1.4, steps: 2, relief: 0,
  });

  /* ---------------- 6. THE BREAD — a warm glowing loaf of light, raised ---------------- */
  {
    const bx = LOAF.x, by = LOAF.y;
    // a great soft halo of warm light radiating from the loaf (the bread of life)
    strokes(out, counter, {
      rng, n: 130,
      sample: r => { const a = r() * Math.PI * 2, d = 2 + Math.pow(r(), 0.9) * 10; return [bx + Math.cos(a) * d, by + Math.sin(a) * d * 0.9]; },
      dir: (x, y) => Math.atan2(y - by, x - bx) + 0.5,
      col: (x, y, r) => jig(ramp([GOLD_PALE, GOLD, GOLD_DEEP], Math.hypot(x - bx, y - by) / 12), r, 8),
      len: 5, lw: 1.5, steps: 2, relief: 0,
    });
    // a few short rays — a modest glow at the loaf, so the head stays visible eating
    strokes(out, counter, {
      rng, n: 18,
      sample: r => { const a = r() * Math.PI * 2, d = 3 + r() * 7; return [bx + Math.cos(a) * d, by + Math.sin(a) * d * 0.9]; },
      dir: (x, y) => Math.atan2(y - by, x - bx),
      col: (x, y, r) => jig(mix(GOLD_HOT, GOLD_PALE, r() * 0.5), r, 6),
      len: (x, y) => 5 + Math.hypot(x - bx, y - by) * 0.3, lw: 1.1, steps: 2, lenJ: 0.6,
    });
    lightEdge(out, counter, bx, by, 9);   // dark contrast ring so the bread-of-light pops
    // the loaf body — the brightest warm knot on the page
    strokes(out, counter, {
      rng, n: 70,
      sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 1.4) * 8; return [bx + Math.cos(a) * d * 1.3, by + Math.sin(a) * d * 0.85]; },
      dir: () => 0.1,
      col: (x, y, r) => jig(ramp(['#fffef4', GOLD_HOT, GOLD_PALE, '#e6c068'], Math.hypot((x - bx) / 1.3, (y - by) / 0.85) / 9), r, 7),
      len: 5, lw: 2.1, steps: 2, relief: 0,
    });
    // a tiny crust highlight on top of the loaf
    strokes(out, counter, {
      rng, n: 10,
      sample: r => [bx + (r() - 0.5) * 10, by - 2 - r() * 1.5],
      dir: () => 0,
      col: (x, y, r) => jig('#fffef6', r, 6),
      len: 3, lw: 1.4, steps: 1, relief: 0,
    });
    // THE NEXT STEP LIT — the loaf's warm light falls in a soft pool on the path
    // one stride ahead of his feet: "a lamp unto my feet, and a light unto my
    // path" (Ps 119:105). Rides the fg plane so the light moves with its source.
    const STEP = { x: CX + 16, y: fy + 9 };
    strokes(out, counter, {
      rng, n: 46,
      sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 0.8) * 20; return [STEP.x + Math.cos(a) * d * 1.5, STEP.y + Math.sin(a) * d * 0.42]; },
      dir: (x, y) => Math.atan2(pathTop[1] - y, pathTop[0] - x),
      col: (x, y, r) => jig(ramp(['#fff8dc', '#ffeeb0', GOLD_PALE, '#e6cf94'], Math.hypot((x - STEP.x) / 1.5, (y - STEP.y) / 0.42) / 20), r, 8),
      len: 7, lw: 2.2, steps: 2, lenJ: 0.5, relief: 0,
    });
  }

  fgRanges.push([_fg, out.length]);   // ← the child + the glowing loaf + the lit next step are foreground

  /* ---------------- 7. EASTER EGG — John 6:35 in Greek, on the bright path ---------------- */
  // "I am the bread of life." Ϛʹ·ΛΕʹ (6 = Ϛ, 35 = ΛΕ) — incised low on the lit path.
  E.inscriptionText(out, E.greekRef(6, 35), { x: 408, y: 456, h: 14, body: '#fff4cc', edge: '#8a6a2a', op: 0.78, edgeOp: 0.5 });

  const ALT = 'In a bright new-creation day a small child in red, washed and ringed with a soft white aura, walks a flourishing winding path through green fields full of wildflowers and fruit-trees, carrying a warm glowing loaf of light whose glow falls in a pool on the path one step ahead; sparrows peck scattered seed on the path and white trumpet lilies bloom at its verge; vibrant light-blue sky, gold low on the horizon, the way bright ahead toward home.';

  // MULTIPLANE: assemble the requested depth plane. Each is its own cel —
  // transparent where it has no content — so they stack and parallax apart.
  const RAW = { undercoat: 0, weave: 0, varnish: 0, oil: 0 };   // no baked surface — the live filter unifies the planes
  const setOf = ranges => { const s = new Set(); for (const [a, b] of ranges) for (let i = a; i < b; i++) s.add(i); return s; };
  const pick = ranges => ranges.map(([a, b]) => out.slice(a, b).join('\n')).join('\n');
  const fgSet = setOf(fgRanges);
  if (LAYER === 'bg') return svgWrap(ALT, out.slice(0, skyEnd).join('\n'), RAW);   // bright day sky (opaque)
  if (LAYER === 'fg') return svgWrap(ALT, pick(fgRanges), RAW);                    // the child + the glowing loaf (nearest)
  if (LAYER === 't3') return svgWrap(ALT, pick([avRanges[0]]), RAW);               // avenue rows, far → near
  if (LAYER === 't2') return svgWrap(ALT, pick([avRanges[1]]), RAW);
  if (LAYER === 't1') return svgWrap(ALT, pick([avRanges[2]]), RAW);
  if (LAYER === 'ground' || LAYER === 'mid') {                                     // the receding ground: field, path, stones, flowers, fringe, verse
    const cut = setOf([...fgRanges, ...avRanges]);
    const body = out.filter((_, i) => i >= skyEnd && !cut.has(i)).join('\n');
    return svgWrap(ALT, body, RAW);
  }
  // full painting (desktop): the original paint order, UNCHANGED
  return svgWrap(ALT, out.join('\n'));
}
