// gen/plates/bread.mjs — "The Bread of Life"
// John 6:35 ("I am the bread of life"). POST-RESURRECTION new-creation page —
// BRIGHT DAY. Vibrant light-blue sky, gold, lush green. MULTIPLANE.
//
// ⚠ A PICNIC LANDSCAPE UNDER AN APPLE TREE, built in four passes:
// 1) Fred: "the scene does not picture what is being said... put the character
//    in a picnic?" — the words are "Every day He FEEDS you. Every night He KEEPS
//    you," and the plate showed him WALKING, carrying a loaf mid-stride. So: he
//    sits at rest, fed in front of him, not held aloft.
// 2) Fred: "if you draw it as picnic, make it as picnic... create the scene" —
//    a small cloth patch wasn't a picnic. Built a real checkered blanket, a
//    basket, and a fuller food spread (since removed, see 4).
// 3) Fred: "redraw the background as well... make it more like a picnic. remove
//    the road, change the grassy terrain to be like 'gift'" — the path removed
//    entirely, the whole field one unbroken flowering meadow, painted with
//    gift's own recipe (rolling terrain, four-layer grass, drifting hue, flower
//    colonies — see memory green_world_recipe).
// 4) Fred: "this looks bad... maybe everyday he feeds you should be like a
//    person under an apple tree, and theres a lot of apples in the ground
//    provided by god" + "make it apples instead of manna." The checkered
//    blanket/basket apparatus is GONE. He sits under a real apple tree
//    (paintTree, gift's own tree painter — no rainbow fruit dabs), a few
//    apples visible in the branches, more fallen and scattered in the grass
//    around him — drawn as real fruit (a bezier apple shape: dimple, belly,
//    pucker, stem, leaf — not a smooth "tomato" ellipse), with a solid
//    underpaint under the painterly strokes so it reads opaque, and a soft
//    stroke-based edge instead of a flat outline so it stays part of the
//    painting rather than a sticker on it.
// 5) Fred: "make one on the hands of the kid, less on the ground" — then,
//    once placed at his hands INSIDE the plate: "now he is sitting on the
//    apple." It could never have worked there: the runtime actor is a full
//    opaque cutout drawn OVER the plate, so anything painted "in" his hands
//    is painted UNDER them. THE GIVEN APPLE now lives in engine/scene.js (the
//    HELD table), appended AFTER his sprite so it sits in front of him —
//    see the note at `HAND` below for exactly where and why.
//
// Paint order (= rng order — append only):
//   1. SKY      — vibrant light-blue day, gold + pink low at the horizon
//   2. GROUND   — rolling flowering meadow, gift's grass recipe (no path)
//   3. FLOWERS  — wildflower colonies across the rolling ground
//   4. LIFE     — fruit-trees flourishing in the field (planted)
//   4b. LIFE    — sparrows fed in the grass (Matt 6:26) + lilies of the field (Matt 6:28)
//   5. APPLE TREE — a real apple tree, apples on it and fallen in the grass, dappled light
//   6. THE WAY AHEAD — a soft pool of light resting further out in the meadow
//   7. EASTER EGG — John 6:35 (Greek), incised low in the grass
// (the apple in his hands is NOT painted here — see engine/scene.js HELD[21])
export const name = 'bread';
export const title = 'The Bread of Life';
export const caption = 'Fed by the Light, every day.';
export const seed = 20261006;
// focal.x=555 → portrait x0=399 (focal.x−156), MUST match CAST1[21].fx0 in
// character.js. Moved 420→555 so the mobile portrait crop (399..711) holds
// the whole scene under the tree, not just its left edge.
export const focal = { x: 555, y: 330 };
// MOBILE 3D — depth planes (FAR→NEAR): the bright day sky behind (opaque); the
// rolling flowering meadow + planted trees + the incised verse in the middle;
// the washed red child + the apple tree + the given apple nearest. `full`
// (desktop) keeps the original paint order untouched.
export const layers = [
  { name: 'bg', opaque: true },  // bright day sky (backmost, opaque)
  { name: 'ground' },            // meadow + wildflower colonies + fringe + verse
  { name: 't3' },                // amber tree, mid-distant (base 548,268)
  { name: 't2' },                // pink tree, left (base 120,332)
  { name: 't1' },                // teal tree, right (base 690,348)
  { name: 'fg' },                // the apple tree + red child + the given apple (base 436,396)
];

export function paint(E, opts = {}) {
  const {
    mulberry32, fbm, curlV, goldenSpiralV, mix, ramp, jig, strokes, rej,
    lightRadial, paintChild, lightEdge, castShadow, personCaps, paintPath, inCap, underpaintCapsules,
    fruitTree, paintTree, groundFlowers, horizonFringe, ridge, LEAF_PALETTES, TREE_KINDS,
    svgWrap, R1, W, H,
    GOLD, GOLD_PALE, GOLD_DEEP, GOLD_HOT,
  } = E;

  const rng = mulberry32(seed);
  const E_SPECIES_APPLE = ['#0e2612', '#17391b', '#245425', '#397334', '#5f9645', '#8dba58', '#c6d97c'];   // the apple's crown ramp (engine.SPECIES.apple) — the extra boughs match the tree
  const out = [];
  const counter = { n: 0 };
  // MOBILE 3D LAYERS: tag the sky-end and the figure ranges; MID = the rest
  // (field, flowers, trees, verse). FG = child + apple tree + given apple.
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
  // ⭐ DETAIL PASS (Sep 8) — the SKY only (the picnic meadow is gift's recipe and stays).
  // EVERY STROKE DRAWS ITS OWN WIDTH AND LENGTH (Fred: "use no rules"), and every drawing
  // of the boil ring is a DIFFERENT PAINTING of the sky (its own rng, salted by the frame;
  // displacement 0 in BOIL_BAND_PAGE.bread) — never the same marks nudged.
  const free = (x, y, salt) => { const n = Math.sin(x * 12.9898 + y * 78.233 + salt) * 43758.5453; return n - Math.floor(n); };
  const widthOf  = (x, y, salt) => 0.40 + 3.2 * Math.pow(free(x, y, salt), 2.6);
  const lengthOf = (x, y, salt) => 0.40 + 1.5 * Math.pow(free(x, y, salt + 17), 1.5);
  const FR = (globalThis.__FRAME | 0);
  // ⚠ softer, with intent (Fred): the SAME sky in every drawing; a swell travels round the
  // great wheel over the sun-glow, so across the ring the day sky turns — no churn.
  const skyRng = mulberry32(seed + 4409);
  const _NFb = Math.max(1, globalThis.__FRAME_N || 6), _PHb = FR / _NFb;
  const turnB = (x, y) => 1 + 0.15 * Math.cos(2 * Math.PI * (_PHb - Math.atan2(y - 216, x - 420) / (2 * Math.PI)));
  // the deep moving day-sky — long streaming strokes that FOLLOW the great wheel
  strokes(out, counter, {
    rng: skyRng, n: 1800, sample: rej(-10, -10, 810, horizon + 8),
    dir: skyDir, col: (x, y, r) => skyCol(x, y, r, 0),
    // ⚠ THE SKY WAS GREY BECAUSE OF ITS SURFACE, NOT ITS COLOUR. The ramp here is already
    // a vibrant day — gold and pink low, light blue up, near-white crown — but at lw 9.5
    // with relief 0.55 every one of these huge marks got its own lit edge AND its own
    // shadow edge, so the whole heaven tiled into slabs with dark seams between them and
    // read as overcast. (born had the identical fault at a third the relief.) Relief is
    // right on grass, where each blade really does cast on the next; on air it is just
    // dirt. Same colours, the surface let go.
    len: (x, y) => 34 * lengthOf(x, y, 11) * turnB(x, y), lw: (x, y) => 3.6 * widthOf(x, y, 13), steps: 4, follow: 0.91, wild: 0.05, lenJ: 0.3, wJ: 0.3, impasto: 0.3, relief: 0.12,
  });
  // bright cloud-ribbon crests + soft knot-sparks — following the curling flow so
  // the jewel swirls read clearly against the bright day sky
  strokes(out, counter, {
    rng: skyRng, n: 500, sample: rej(-10, -10, 810, horizon - 10),
    dir: skyDir,
    col: (x, y, r) => {
      const near = nearEddy(x, y);
      if (near < 1.1 && r() < 0.06) return jig(r() < 0.5 ? '#fffdf6' : '#f79ac6', r, 12);   // bright sparks at the eddy knots
      const k = fbm(x / 88, y / 88, 23) + (r() - 0.5) * 0.2;
      return k > 0.74 ? jig('#fffdf6', r, 8) : skyCol(x, y, r, 0.18);   // bright white cloud-crests
    },
    len: (x, y) => 26 * lengthOf(x, y, 21) * turnB(x, y), lw: (x, y) => 2.6 * widthOf(x, y, 23), steps: 5, follow: 0.9, wild: 0.12, lenJ: 0.3, wJ: 0.3, impasto: 0.4, relief: 0.3,   // ⚠ relief was the default 1
    aJ: (x, y) => 0.16 + Math.max(0, 1.3 - nearEddy(x, y)) * 0.42,
  });
  const skyEnd = out.length;   // BG plane: the opaque bright day sky

  /* ---------------- 2. GROUND — a real picnic LANDSCAPE, "gift"'s grassy terrain ----------------
     ⚠ REBUILT (Fred: "make a picnic landscape? you can remove the road, change the
     grassy terrain to be like 'gift'"). The path is gone entirely — a picnic does
     not need a road running through it, and removing it frees the whole field to
     be one unbroken flowering meadow. The terrain now follows gift's own recipe
     (see memory green_world_recipe): the ground ROLLS (swell + facing, not just
     colour), grass is FOUR layers (sward / standing blades / fine nap / tufts,
     not one flat pass), and colour drifts in HUE across the field, not just value
     (`chroma`, lifted verbatim from gift.mjs). */
  /* ⚠ HE SITS WHERE THE TREE STANDS (Fred, Sep 18: "the kid is still floating, it looks like the kid
     is sitting on the middle of the tree instead of the ground"). 396 put his seat 38 units ABOVE the
     trunk's own base (TREEY 434) — on a receding field that is not "further back", it is up the trunk,
     because the ground he shares with the tree is the line the tree meets it at. The seat, its contact
     shadow and CAST1[21].y all move to that line; the child grows with the scale gradient (dS 0.95 ->
     1.10, so h 78 -> 88) because he is now standing a little nearer the reader. */
  const SEAT_Y = 436;   // where he sits — on the tree's own ground line (TREEY 434), not up its trunk
  // the field's top is a rolling contour, never a straight line
  const fieldTop = ridge(horizon, { amp: 22, freq: 145, bumps: 0.34, seed: 131 });
  // ══ DRIFTING HUE (lifted from gift.mjs, verbatim technique) — value stays where
  // the light and the land put it; HUE drifts across the field in soft bands, so
  // the green is never one flat colour end to end. ══
  const HEXN = c => { const n = parseInt(c.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
  const HEXS = (r, g, b) => '#' + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
  const toHSL = (r, g, b) => {
    r /= 255; g /= 255; b /= 255;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2;
    if (mx === mn) return [0, 0, l];
    const d = mx - mn, sa = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
    let h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
    return [h / 6, sa, l];
  };
  const toRGB = (h, sa, l) => {
    if (sa === 0) return [l * 255, l * 255, l * 255];
    const q = l < 0.5 ? l * (1 + sa) : l + sa - l * sa, pp = 2 * l - q;
    const f = t => { t = ((t % 1) + 1) % 1;
      if (t < 1 / 6) return pp + (q - pp) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return pp + (q - pp) * (2 / 3 - t) * 6;
      return pp; };
    return [f(h + 1 / 3) * 255, f(h) * 255, f(h - 1 / 3) * 255];
  };
  const HUES = [0.96, 0.06, 0.09, 0.60, 0.96, 0.28, 0.13, 0.76, 0.60];
  const chroma = (c, x, y, k, sd = 211) => {
    const f = fbm(x / 155, y / 135, sd);
    const Hh = HUES[Math.min(HUES.length - 1, Math.floor(f * HUES.length * 1.25))];
    const rgb = HEXN(c);
    let [h, sa, l] = toHSL(rgb[0], rgb[1], rgb[2]);
    let d = Hh - h; if (d > 0.5) d -= 1; if (d < -0.5) d += 1;
    const kk = k * (0.6 + fbm(x / 62, y / 58, sd + 3) * 0.75);
    h = (h + d * kk + 1) % 1;
    sa = Math.min(0.62, sa + kk * 0.5 * (1 - Math.abs(l - 0.55) * 1.5));
    const o = toRGB(h, sa, l);
    return HEXS(o[0], o[1], o[2]);
  };
  // The ground's top edge is where it meets the sky — grass has no outline, it
  // has blades. This jagged contour replaces fieldTop in the FILL only (sampled fine
  // enough to keep the sawtooth; a coarse step averages it straight again).
  const fieldTopJag = x => {
    const fine = (fbm(x / 3.1, 2.1, 723) - 0.5) * 6.5;
    const tuft = Math.max(0, fbm(x / 8.5, 9.4, 725) - 0.52) * 24;
    return fieldTop(x) + fine - tuft;
  };
  {
    let d = `M-2 ${R1(fieldTopJag(-2))}`;
    for (let x = -2; x <= 802; x += 2.2) d += `L${R1(x)} ${R1(fieldTopJag(x))}`;
    d += `L802 ${H + 2}L-2 ${H + 2}Z`;
    out.push(`<path d="${d}" fill="#3f7a38"/>`); counter.n++;
  }
  // the ragged skyline of grass — tufts rising off the crest, clumped with gaps
  const horizonFringeCols = ['#2c6a48', '#3a7a38', '#5e9a40', '#88b84a'];
  horizonFringe(out, counter, rng, { horizonFn: fieldTop, x0: -10, x1: 810, cols: horizonFringeCols, hMax: 21, lightFn: glow, dirJitter: 0.72 });
  // ⚠ AND THE SAME HEDGEROW `seeds` has along its far edge — the strongest single signal
  // that this is that field again. A worked field does not simply stop; it ends at a hedge.
  {
    const hRng = mulberry32(seed ^ 0x2f9a1c07);
    for (let i = 0; i < 92; i++) {
      const hx = -30 + (i + hRng() * 0.9) / 92 * 872;
      const hy = fieldTop(hx) + 5 + hRng() * 12;
      paintTree(out, counter, hRng, hx, hy, 15 + Math.pow(hRng(), 0.7) * 24, {
        lightFn: glow, shadowDir: 1, blossom: hRng() < 0.28 ? 2 : 0,
        tint: (c) => mix(c, '#cfe6f2', 0.32),
      });
    }
  }
  // SCALE GRADIENT — a mark at the feet is far bigger than a mark at the crest.
  const dS = y => 0.32 + 1.0 * Math.max(0, Math.min(1, (y - horizon) / (H - horizon)));
  // A PLAIN WITHOUT FORM IS A GREEN SHAPE. The land rolls, and value follows which
  // way each slope FACES the light — the term that turns a green area into ground.
  const swell = (x, y) => fbm(x / 165, y / 74, 313);
  const facing = (x, y) => {
    const e = 7;
    return (swell(x - e, y) - swell(x + e, y)) * 2.2 + (swell(x, y - e) - swell(x, y + e)) * 1.2;
  };
  const haze = (x, y) => Math.max(0, Math.min(1, 1 - (y - horizon) / 86));
  // ⚠ THIS IS THE SAME FIELD AS `seeds`, LATER. Fred: "continue from the scene before but
  // the tree is already grown." So the ground still remembers being sown: the rows he
  // planted on the page before run back to the same kind of vanishing point, only now they
  // are grown over and read as a soft memory in the turf rather than open furrows. Same
  // geometry as gen/plates/seeds.mjs (VP toward the light, ridge crowns ROWW apart), at a
  // fraction of the contrast — a field that has been worked, not a field being worked.
  const VP = { x: 300, y: fieldTop(300) - 6 };
  const ROWW = 88, BOT = H + 46;
  const rowAcross = (x, y) => {
    const dy = y - VP.y; if (dy < 4) return 0;
    const xb = VP.x + (x - VP.x) * (BOT - VP.y) / dy;
    const u = xb / ROWW;
    return Math.pow(Math.abs(Math.cos((u - Math.floor(u)) * Math.PI)), 1.5);
  };
  // GRASS, PROPERLY PAINTED — four layers at three scales, gift's own recipe.
  const grassCol = (x, y, r, lift) => {
    const depth = Math.max(0, Math.min(1, (y - horizon) / (H - horizon)));
    let c = ramp(['#2f6a2e', '#3a7433', '#4f8c3c', '#6aa447', '#8bbc57', '#aed073'],
      fbm(x / 46, y / 30, 93) * 0.5 + depth * 0.24 + facing(x, y) * 0.55 + swell(x, y) * 0.18 + lift);
    const g = glow(x, y);
    const sh = 1 - g;
    if (sh > 0.4 && r() < 0.2 + sh * 0.3) c = mix(c, chroma('#37543e', x, y, 0.5, 197), 0.22 + sh * 0.3);
    c = mix(c, '#f6e08a', g * 0.4);
    c = mix(c, '#4a7a3a', rowAcross(x, y) * 0.22);             // the old rows, grown over
    c = mix(c, '#cfe6f2', Math.pow(haze(x, y), 1.7) * 0.42);   // atmospheric perspective — air pales the far field
    return jig(chroma(c, x, y, 0.28, 211), r, 12);
  };
  strokes(out, counter, {                                    // 1 · the body of the sward
    rng, n: 4200,
    sample: rej(-10, horizon - 14, 810, 512, (x, y) => y > fieldTop(x) - 1),
    dir: (x, y) => -Math.PI / 2 + (fbm(x / 30, y / 20, 97) - 0.5) * 0.7,
    col: (x, y, r) => grassCol(x, y, r, 0.06),
    len: (x, y) => 7 * dS(y), lw: (x, y) => 1.9 * dS(y), steps: 2, lenJ: 0.7, impasto: 0.5, relief: 0.3,
  });
  strokes(out, counter, {                                    // 2 · blades that STAND UP out of it
    rng, n: 3000,
    sample: rej(-10, horizon + 6, 810, 512, (x, y) => y > fieldTop(x) + 2),
    dir: (x, y) => -Math.PI / 2 + (fbm(x / 11, y / 9, 101) - 0.5) * 1.15,
    col: (x, y, r) => grassCol(x, y, r, 0.22),
    len: (x, y) => 9 * dS(y), lw: (x, y) => 1.1 * dS(y), steps: 2, lenJ: 0.8, impasto: 0.6,
  });
  strokes(out, counter, {                                    // 3 · and the finest nap, close to us
    rng, n: 2600,
    sample: r => { const x = -10 + r() * 820, y = horizon + 14 + Math.pow(r(), 0.8) * (512 - horizon - 14);
                   return y > fieldTop(x) ? [x, y] : null; },
    dir: (x, y) => -Math.PI / 2 + (fbm(x / 7, y / 6, 103) - 0.5) * 1.5,
    col: (x, y, r) => grassCol(x, y, r, 0.3),
    len: (x, y) => 6 * dS(y), lw: (x, y) => 0.8 * dS(y), steps: 2, lenJ: 0.85, impasto: 0.7,
  });
  for (let i = 0; i < 120; i++) {                            // 4 · and clumps — grass grows in tufts
    const tx = -10 + rng() * 820;
    const ty = horizon + 14 + Math.pow(rng(), 0.55) * (508 - horizon - 14);
    const sc = dS(ty);
    strokes(out, counter, {
      rng, n: 14,
      sample: r => [tx + (r() + r() - 1) * 9 * sc, ty - Math.pow(r(), 0.7) * 11 * sc],
      dir: (x, y) => -Math.PI / 2 + (x - tx) * 0.05 + (fbm(x / 6, y / 6, 107) - 0.5) * 0.8,
      col: (x, y, r) => grassCol(x, y, r, 0.34),
      len: 10 * sc, lw: 1.1 * sc, steps: 2, lenJ: 0.7, impasto: 0.65,
    });
  }

  /* ---------------- 3. WILDFLOWERS — colonies, not sprinkles (gift's recipe) ----------------
     900 evenly-scattered dots read as sprinkles on the loudest thing on the plain.
     Flowers grow in COLONIES: ~30 patches, each a family of one colour, each bloom
     a stem + petals + a centre — thinning out with distance, not carpeting evenly. */
  {
    // ⚠ THREE OF THE FIVE PALETTES WERE NEAR-WHITE, so an "unbroken flowering meadow" came
    // out as white specks on green. Jewel pairs, and enough colonies to actually flower the
    // field — the same fix seeds needed.
    const PETALS = [['#f0537c', '#c2325c'], ['#ffc247', '#e0942a'], ['#b184ea', '#8557c4'],
                    ['#6fc4f0', '#3d8fd0'], ['#fff6e2', '#efdcc0'], ['#f2603c', '#cc3f24']];
    for (let c = 0; c < 58; c++) {
      const cx = -10 + rng() * 820;
      const cy = horizon + 20 + (c < 10 ? rng() * 0.42 : rng()) * (508 - horizon - 20);
      const pal = PETALS[(rng() * PETALS.length) | 0];
      const spread = 26 + rng() * 54, count = 5 + (rng() * 9) | 0;
      for (let i = 0; i < count; i++) {
        const fx = cx + (rng() + rng() - 1) * spread;
        const fyy = cy + (rng() + rng() - 1) * spread * 0.4;
        if (fyy < fieldTop(fx) + 6) continue;
        // ⚠ KEEP THE TREE'S OWN CLEARING CLEAR. Fred: "yeah i still see manna" —
        // one reason the given apple read as a gold blur was a flower colony
        // landing right on top of it. The apple tree (TREEX,TREEY ≈ 560,434)
        // and the actor's own hands (486,392, where the given apple now rests
        // — "make one on the hands of the kid") are fixed spots known ahead of
        // section 5, so flowers give both a wide berth, same as the ground apples.
        if (Math.hypot(fx - 548, fyy - 410) < 58) continue;
        if (Math.hypot(fx - 486, fyy - 392) < 40) continue;
        const sc = dS(fyy), st = (7 + rng() * 8) * sc;
        paintPath(out, counter, rng, [[fx, fyy], [fx + (rng() - 0.5) * 4, fyy - st]],
          (x, y, r) => jig(mix('#4e7a3c', '#7fa84e', r()), r, 7), { lw: 1.2 * sc, len: 3, density: 0.9, jitter: 0.3 });
        const pet = pal[(rng() * 2) | 0], hd = 2.4 * sc;
        for (let k = 0; k < 5; k++) {
          const a = k * 1.256 + rng() * 0.35;
          out.push(`<ellipse cx="${R1(fx + Math.cos(a) * hd)}" cy="${R1(fyy - st + Math.sin(a) * hd)}" rx="${R1(2.1 * sc)}" ry="${R1(1.5 * sc)}" transform="rotate(${R1(a * 57)} ${R1(fx + Math.cos(a) * hd)} ${R1(fyy - st + Math.sin(a) * hd)})" fill="${pet}" opacity="0.94"/>`);
          counter.n++;
        }
        out.push(`<circle cx="${R1(fx)}" cy="${R1(fyy - st)}" r="${R1(1.25 * sc)}" fill="#ffe9a8"/>`); counter.n++;
      }
    }
  }

  /* ---------------- 4. LIFE — flourishing fruit-trees planted in the field ---------------- */
  // ⚠ THESE WERE STILL `fruitTree`, THE PAINTER THIS PAGE ALREADY REJECTED. The header at
  // the top of this file records it: "fruitTree's rainbow FRUIT_COLS dabs made the canopy a
  // candy ball instead of a tree you could name" — and the apple tree was moved to
  // paintTree because of it. The other three were never converted, so the page ended up
  // with one real tree standing between two flat mushroom caps of pink and teal, dotted in
  // rainbow sweets, on barber-pole trunks. Same painter as the apple tree now: gift's
  // crown-warm/belly-deep canopy, majority GREEN so a child can name it, with the pale
  // blossom paintTree already knows how to hang on the lit side.
  // (h roughly doubles because paintTree's crown is proportionally smaller than
  // fruitTree's mushroom — matched by eye to the space each tree used to fill.)
  const avRanges = [];
  let _t = out.length;
  paintTree(out, counter, rng, 548, 268, 76, { lightFn: glow, shadowDir: 1, blossom: 2, species: 'olive',   // after his kind (Sep 15): an olive in the haze
    tint: (c) => mix(c, '#cfe6f2', 0.34) });                                 // far, in the haze
  avRanges.push([_t, out.length]);
  _t = out.length;
  // ⚠ BLOSSOM IS GATED ON THE PAGE'S LIGHT — paintTree skips any bloom where lightFn < 0.12,
  // and `glow` is a 200-radius pool centred at (420,230), which this tree sits well outside.
  // So asking for eleven blossoms produced three. A tree in flower needs its own floor.
  paintTree(out, counter, rng, 120, 332, 138, { lightFn: (x, y) => Math.max(0.38, glow(x, y)),
    shadowDir: -1, blossom: 18, species: 'almond' });   // the tree in blossom IS an almond — the first to wake (Jer 1:11)                                          // in blossom, left
  avRanges.push([_t, out.length]);
  _t = out.length;
  // a deeper, older green on the right so the three do not read as one repeated tree
  paintTree(out, counter, rng, 690, 348, 124, { lightFn: (x, y) => Math.max(0.3, glow(x, y)),
    shadowDir: 1, blossom: 4, species: 'fig' }); // right — a fig, its own deep green (1 Kings 4:25)
  avRanges.push([_t, out.length]);

  /* ---------------- 4b. LIFE — sparrows fed in the grass + lilies of the field ----------------
     The page's own word made visible: "Behold the fowls of the air... your
     heavenly Father feedeth them" (Matt 6:26) and "Consider the lilies of the
     field, how they grow" (Matt 6:28) — no longer tied to a path verge (there is
     no path); they simply live in the meadow, near enough the picnic to feel
     like the same afternoon. Bold simple silhouettes, curved lines (Munch). */
  {
    const sparrow = (px, py, s, pose) => {
      const X = dx => R1(px + dx * s), Y = dy => R1(py + dy * s);
      const DK = '#3a2812';
      if (pose === 'peck') {
        out.push(`<path d="M${X(14)} ${Y(-14)} L${X(4.5)} ${Y(-11.5)} L${X(12.5)} ${Y(-7)} Z" fill="${DK}" opacity="0.95"/>`); counter.n++;
        out.push(`<ellipse cx="${X(-0.5)}" cy="${Y(-8.5)}" rx="${R1(8.2 * s)}" ry="${R1(5.4 * s)}" transform="rotate(-14 ${X(-0.5)} ${Y(-8.5)})" fill="${DK}" opacity="0.96"/>`); counter.n++;
        out.push(`<circle cx="${X(-8.5)}" cy="${Y(-6)}" r="${R1(4.4 * s)}" fill="${DK}" opacity="0.96"/>`); counter.n++;
        out.push(`<path d="M${X(-10.5)} ${Y(-5.5)} L${X(-16.5)} ${Y(-1)} L${X(-9)} ${Y(-3)} Z" fill="#5a4020" opacity="0.95"/>`); counter.n++;
        out.push(`<path d="M${X(4)} ${Y(-5)} Q${X(-1.5)} ${Y(-3.6)} ${X(-6)} ${Y(-4.6)}" stroke="#c8955a" stroke-width="${R1(1.8 * s)}" fill="none" opacity="0.8" stroke-linecap="round"/>`); counter.n++;
        out.push(`<circle cx="${X(-8.8)}" cy="${Y(-7.4)}" r="${R1(1.05 * s)}" fill="#f6e8c0" opacity="0.95"/>`); counter.n++;
      } else {
        out.push(`<path d="M${X(-14.5)} ${Y(-11.5)} L${X(-4.5)} ${Y(-9.5)} L${X(-12.5)} ${Y(-5)} Z" fill="${DK}" opacity="0.95"/>`); counter.n++;
        out.push(`<ellipse cx="${X(0.5)}" cy="${Y(-7.5)}" rx="${R1(8 * s)}" ry="${R1(5.2 * s)}" transform="rotate(10 ${X(0.5)} ${Y(-7.5)})" fill="${DK}" opacity="0.96"/>`); counter.n++;
        out.push(`<circle cx="${X(7.5)}" cy="${Y(-13.5)}" r="${R1(4.6 * s)}" fill="${DK}" opacity="0.96"/>`); counter.n++;
        out.push(`<path d="M${X(11)} ${Y(-15)} L${X(16.5)} ${Y(-13)} L${X(11)} ${Y(-11.5)} Z" fill="#5a4020" opacity="0.95"/>`); counter.n++;
        out.push(`<path d="M${X(7)} ${Y(-9)} Q${X(7.5)} ${Y(-6)} ${X(2.5)} ${Y(-4.4)}" stroke="#c8955a" stroke-width="${R1(1.8 * s)}" fill="none" opacity="0.8" stroke-linecap="round"/>`); counter.n++;
        out.push(`<circle cx="${X(8.6)}" cy="${Y(-14.4)}" r="${R1(1.05 * s)}" fill="#f6e8c0" opacity="0.95"/>`); counter.n++;
      }
      out.push(`<path d="M${X(-1)} ${Y(-4)} L${X(-1.8)} ${Y(0)} M${X(4)} ${Y(-4.4)} L${X(4.8)} ${Y(0)}" stroke="#2e1f10" stroke-width="${R1(Math.max(0.9, 1.1 * s))}" fill="none" opacity="0.9" stroke-linecap="round"/>`); counter.n++;
    };
    // ⭐ "Consider the lilies of the field, how they grow… even Solomon in all his glory was not
    // arrayed like one of these" (Matt 6:28-29). These were three flat white petals on a stroke.
    // They are the engine's paintLily now (Sep 21) — six tepals in a nodding trumpet, a gold
    // throat, rust anthers, a closed bud, leaves spiralling up the stem — because if He says a
    // lily outshines the king, the lily gets more craft than the palace. Own rng: the plate's
    // stream is untouched.
    const lilyR = mulberry32((seed ^ 0x11717) >>> 0);
    const lily = (px, py, h, lean = 0) => E.paintLily(out, counter, lilyR, px, py, h * 1.25, { lean: lean * 1.6, lightFn: glow });
    // lilies scattered through the near meadow, clear of the picnic itself
    lily(226, 487, 30, -3); lily(237, 481, 24, 3); lily(217, 480, 20, -4);
    lily(670, 464, 27, 3); lily(681, 472, 31, -3); lily(661, 476, 21, 4);
    lily(284, 413, 15, -2); lily(277, 417, 12, 2);
    // sparrows fed in the open grass, clear of the picnic and the child
    sparrow(246, 486, 1.05, 'peck');
    sparrow(212, 492, 0.95, 'watch');
    sparrow(662, 428, 0.62, 'peck');
  }

  /* ---------------- 5. UNDER THE APPLE TREE — apples given, on the tree and on the ground ----------------  [FG plane] */
  const _fg = out.length;
  const fy = SEAT_Y;
  // ⚠ REBUILT AGAIN (Fred: "this looks bad... maybe everyday he feeds you should be
  // like a person under an apple tree, and theres a lot of apples in the ground
  // provided by god"). The checkered-blanket picnic was too fussy a prop to read
  // clearly, and `fruitTree`'s rainbow FRUIT_COLS dabs made the canopy a candy
  // ball instead of a tree you could name. Simpler, and truer to the words: he
  // sits under a real APPLE TREE — gift's own tree painter (paintTree, the
  // crown-warm/belly-deep green canopy, no rainbow fruit or blossom clutter) — a
  // few apples visible IN it, and MANY MORE fallen and scattered in the grass all
  // around him: provision so abundant it is just lying there on the ground.
  // ⚠ CX MUST EQUAL CAST1[21].x AND engine/scene.js's HELD entry is gone (the apple is
  // drawn in his hands now). He sits to the RIGHT of the trunk and looks out across the
  // field — Fred: "flip it so not all the pages have the kid looking left."
  const CX = 590, CY = fy + 6;             // where he sits, under the tree
  // ⚠ HE MUST SIT ON THE GROUND, NOT HOVER OVER IT (Fred, Sep 16: "the kid is floating").
  // The child is a sprite composited over the plate, so nothing in the paint touches him
  // unless the paint reaches out: a contact shadow under his seat, thrown away from the
  // glow, and a few grass blades pressed flat where his weight is. (figures_must_touch_ground)
  strokes(out, counter, {
    rng, n: 150,
    sample: r => { const a2 = r() * Math.PI * 2, d = Math.pow(r(), 0.55); return [CX + 4 + Math.cos(a2) * 30 * d, CY + 3 + Math.sin(a2) * 8 * d]; },
    dir: () => 0.05,
    col: (x, y, r) => jig(mix('#1d3a1c', '#0e2412', r() * 0.6), r, 5),
    len: 8, lw: 3.2, steps: 2, lenJ: 0.6, relief: 0, impasto: 0.2, op: 0.46,
  });
  strokes(out, counter, {                                   // flattened blades round the seat
    rng, n: 60,
    sample: r => { const a2 = r() * Math.PI * 2, d = 0.7 + r() * 0.5; return [CX + 4 + Math.cos(a2) * 30 * d, CY + 4 + Math.sin(a2) * 7 * d]; },
    dir: (x) => (x < CX ? Math.PI * 0.85 : 0.15) + (rng() - 0.5) * 0.5,
    col: (x, y, r) => jig(mix('#2f5a2a', '#5f8f3a', r() * 0.7), r, 6),
    len: 7, lw: 1.6, steps: 2, lenJ: 0.7, relief: 0.2, op: 0.8,
  });

  const TREEX = 548, TREEY = 434;
  // ⚠ GROWN. On the page before he pressed one seed into this ground; here it is the tree
  // feeding him. It is bigger than it was (210 -> 252) so its canopy actually shelters the
  // child sitting under it, which is what "every day He feeds you / every night He keeps
  // you" needs the tree to be doing.
  // ⭐ "As the apple tree among the trees of the wood, so is my beloved… I sat down under his
  // shadow with great delight, and his fruit was sweet to my taste" (Song 2:3) — THE tree the
  // child eats under is an apple tree, after his kind (Sep 15).
  paintTree(out, counter, rng, TREEX, TREEY, 252, { lightFn: glow, blossom: 2, species: 'apple' });
  // ⚠ AND A BROADER CROWN. paintTree draws one narrow canopy (crown radius = h * 0.24), so
  // at 252 it is a TALL tree with a small head — a young orchard whip, not the spreading
  // tree a child sits under all day. Calling paintTree again would plant a second trunk, so
  // the extra boughs are painted as foliage only, in its own crown ramp, spread either side
  // and a little lower: one tree, with a canopy wide enough to be a roof.
  {
    const CROWN = E_SPECIES_APPLE;
    const crownMass = (mx, my, rx, ry, n) => strokes(out, counter, {
      rng, n,
      sample: r => { const a2 = r() * 6.2832, d = Math.pow(r(), 0.52);
                     return [mx + Math.cos(a2) * rx * d, my + Math.sin(a2) * ry * d]; },
      dir: (x, y) => Math.atan2(y - my, x - mx) + 1.35,
      col: (x, y, r) => {
        const up = Math.max(0, Math.min(1, (my + ry - y) / (ry * 2)));   // crown warm, belly deep
        return jig(ramp(CROWN, up * 0.62 + glow(x, y) * 0.26 + r() * 0.2), r, 10);
      },
      len: 6.5, lw: 2.7, steps: 2, lenJ: 0.7, impasto: 0.5, relief: 0.3,
    });
    const ccY = TREEY - 252 * 0.5 - 252 * 0.14;
    crownMass(TREEX - 66, ccY + 16, 52, 34, 340);      // the left bough
    crownMass(TREEX + 62, ccY + 12, 50, 33, 330);      // the right bough
    crownMass(TREEX - 14, ccY - 22, 46, 28, 240);      // and a little more height on top
  }
  // a proper red APPLE — the same honest dab used for every piece of fruit in
  // this book, not a tiny rainbow jewel dot lost in the leaves
  // ⚠ IT WAS A TOMATO. Fred: "make all the apple looks like an actual apple...
  // this is a tomato." A plain squashed ellipse IS a tomato — what makes an
  // apple's SILHOUETTE an apple (not just its colour) is the CONCAVE dimple at
  // the stem end (two shoulders either side of a dip, not a smooth curve), a
  // belly wider than the shoulders, and a small pucker at the blossom end. A
  // real closed shape now, built from that outline, not a circle with red on
  // it — the same shape drives the solid underpaint, the dark contrast edge
  // and the highlight, so all three agree on what an apple looks like.
  // Local unit apple (x:-1.05..1.05, y:-1.1..1.0), scaled by s and placed at
  // (fx,fyy); P() maps one local point through that transform.
  const applePath = (fx, fyy, s) => {
    const P = (x, y) => `${R1(fx + x * s)} ${R1(fyy + y * s)}`;
    return `M${P(0, -0.85)} `
      + `C${P(0.15, -1.05)} ${P(0.35, -1.1)} ${P(0.55, -1.02)} `    // right shoulder, out of the dimple
      + `C${P(0.85, -0.9)} ${P(1.05, -0.55)} ${P(1.02, -0.15)} `    // down the right side to the widest point
      + `C${P(1.0, 0.25)} ${P(0.85, 0.65)} ${P(0.55, 0.88)} `       // curving in toward the bottom
      + `C${P(0.35, 1.0)} ${P(0.15, 0.92)} ${P(0, 0.85)} `          // the blossom-end pucker, right half
      + `C${P(-0.15, 0.92)} ${P(-0.35, 1.0)} ${P(-0.55, 0.88)} `    // pucker, left half
      + `C${P(-0.85, 0.65)} ${P(-1.0, 0.25)} ${P(-1.02, -0.15)} `   // up the left side
      + `C${P(-1.05, -0.55)} ${P(-0.85, -0.9)} ${P(-0.55, -1.02)} ` // left side to left shoulder
      + `C${P(-0.35, -1.1)} ${P(-0.15, -1.05)} ${P(0, -0.85)} Z`;   // back into the dimple, closing
  };
  // ⚠ "UGLY... make it so that the apple is a part of the art." The shape fix
  // was right; the PAINT wasn't — a smooth solid-fill outline (a perfect
  // parallel offset of the bezier) is exactly the "geometric sticker sitting
  // ON the picture" this engine's own rule warns against (Munch's law: a
  // circle drawn with a compass, not a hand). Nothing else in this book has a
  // cartoon ink line. Fixed two ways: the contrast edge is now a soft LOW-
  // OPACITY stroke (the same technique `lightEdge` uses everywhere else, not
  // a flat fill), and the texture strokes sample from the TRUE silhouette
  // (via appleR below, a radius-by-angle lookup built once off the same
  // bezier) instead of a circular approximation — so the paint reaches every
  // part of the real shape, dimple and pucker included, and the solid
  // underpaint underneath (still needed so it reads opaque) never shows
  // through raw and flat.
  const APPLE_PTS = (() => {
    const segs = [
      [[0, -0.85], [0.15, -1.05], [0.35, -1.1], [0.55, -1.02]],
      [[0.55, -1.02], [0.85, -0.9], [1.05, -0.55], [1.02, -0.15]],
      [[1.02, -0.15], [1.0, 0.25], [0.85, 0.65], [0.55, 0.88]],
      [[0.55, 0.88], [0.35, 1.0], [0.15, 0.92], [0, 0.85]],
      [[0, 0.85], [-0.15, 0.92], [-0.35, 1.0], [-0.55, 0.88]],
      [[-0.55, 0.88], [-0.85, 0.65], [-1.0, 0.25], [-1.02, -0.15]],
      [[-1.02, -0.15], [-1.05, -0.55], [-0.85, -0.9], [-0.55, -1.02]],
      [[-0.55, -1.02], [-0.35, -1.1], [-0.15, -1.05], [0, -0.85]],
    ];
    const bez = (p0, p1, p2, p3, t) => {
      const u = 1 - t;
      return [u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
              u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1]];
    };
    const pts = [];
    for (const [p0, p1, p2, p3] of segs) for (let i = 0; i < 10; i++) {
      const [x, y] = bez(p0, p1, p2, p3, i / 10);
      pts.push([Math.atan2(y, x), Math.hypot(x, y)]);
    }
    pts.sort((a, b) => a[0] - b[0]);
    return pts;
  })();
  const appleR = theta => {
    while (theta > Math.PI) theta -= 2 * Math.PI;
    while (theta < -Math.PI) theta += 2 * Math.PI;
    const n = APPLE_PTS.length, first = APPLE_PTS[0], last = APPLE_PTS[n - 1];
    if (theta <= first[0] || theta >= last[0]) {
      const span = (first[0] + 2 * Math.PI) - last[0];
      const t = span === 0 ? 0 : ((theta < first[0] ? theta + 2 * Math.PI : theta) - last[0]) / span;
      return last[1] + (first[1] - last[1]) * t;
    }
    let lo = 0, hi = n - 1;
    while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (APPLE_PTS[mid][0] < theta) lo = mid; else hi = mid; }
    const a = APPLE_PTS[lo], b = APPLE_PTS[hi];
    const t = (theta - a[0]) / ((b[0] - a[0]) || 1);
    return a[1] + (b[1] - a[1]) * t;
  };
  const apple = (fx, fyy, s) => {
    // ⚠ SOLID UNDERPAINT (Fred: "you have opaque red, in my page that red is
    // transparent"). strokes() marks glaze at 60% opacity by design — never
    // fully opaque wherever they don't triple-overlap. A solid fill first
    // guarantees the apple reads opaque at any size; the strokes on top,
    // reaching all the way to the true edge (appleR), are what's actually
    // seen — the same fix `paintPalace` uses for its own walls.
    out.push(`<path d="${applePath(fx, fyy, s)}" fill="#a8341e"/>`); counter.n++;
    const dens = Math.max(1, (s * s) / (4.4 * 4.4));
    strokes(out, counter, {
      rng, n: Math.round(34 * dens),
      sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 0.72) * appleR(a) * 0.99; return [fx + Math.cos(a) * s * d, fyy + Math.sin(a) * s * d]; },
      dir: (x, y) => Math.atan2(y - fyy, x - fx) + Math.PI / 2 + (rng() - 0.5) * 0.6,
      col: (x, y, r) => jig(ramp(['#f0805a', '#e8503a', '#c8402a', '#8a1c10'], (y - (fyy - s)) / (s * 2)), r, 7),
      len: 3, lw: 1.7, steps: 2, lenJ: 0.5, wJ: 0.5, relief: 0.3,
    });
    // a soft, low-opacity contrast edge HUGGING the true silhouette — the same
    // two-pass technique `lightEdge` uses everywhere else (thin translucent
    // strokes, not a flat outline), just following this shape instead of a circle
    out.push(`<path d="${applePath(fx, fyy, s * 1.05)}" fill="none" stroke="#2a0f08" stroke-width="${R1(Math.max(1.2, s * 0.14))}" opacity="0.22"/>`); counter.n++;
    out.push(`<path d="${applePath(fx, fyy, s * 1.02)}" fill="none" stroke="#2a0f08" stroke-width="${R1(Math.max(0.8, s * 0.08))}" opacity="0.3"/>`); counter.n++;
    // a bright highlight, off-centre upper-left, broken into a few small
    // separate dabs rather than one smooth blob
    strokes(out, counter, {
      rng, n: Math.max(4, Math.round(9 * Math.sqrt(dens))),
      sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 0.6) * 0.22; return [fx - s * 0.4 + Math.cos(a) * s * d, fyy - s * 0.45 + Math.sin(a) * s * d]; },
      dir: () => -0.3 + (rng() - 0.5) * 0.8, col: (x, y, r) => jig(mix('#fff0dc', '#f6a878', r()), r, 6),
      len: 1.8, lw: 1.2, steps: 1, relief: 0,
    });
    // the stem, rising from the dimple — dark, thin, slightly curved
    strokes(out, counter, { rng, n: Math.round(4 * Math.sqrt(dens)), sample: r => [fx + (r() - 0.5) * s * 0.1, fyy - s * (0.85 + r() * 0.35)],
      dir: () => -0.1, col: (x, y, r) => jig('#3a2210', r, 5), len: 3, lw: Math.max(1, s * 0.11), steps: 1 });
    // a small leaf beside the stem
    out.push(`<path d="M${R1(fx + s * 0.04)} ${R1(fyy - s * 0.88)} Q${R1(fx + s * 0.4)} ${R1(fyy - s * 1.05)} ${R1(fx + s * 0.62)} ${R1(fyy - s * 0.78)} Q${R1(fx + s * 0.32)} ${R1(fyy - s * 0.72)} ${R1(fx + s * 0.04)} ${R1(fyy - s * 0.88)} Z" fill="#3a7a38" opacity="0.92"/>`); counter.n++;
  };
  // apples ON the tree — a handful, clear against the leaves, round the crown
  {
    const crCx = TREEX, crCy = TREEY - 252 * 0.5 - 252 * 0.14, crR = 252 * 0.24;
    // ⚠ THEY WERE BAUBLES. Eight apples at s~6, all one size, evenly spaced around the
    // crown, came out nearly as wide as the child's head and hung like decorations on a
    // Christmas tree. Fruit grows in twos and threes off the same spur, at mixed sizes,
    // some half-hidden in the leaves — and smaller: an apple is about a third of a child's
    // head, not three quarters. More of them too; the page's word is abundance.
    const onTree = [[-0.92, -0.46, 4.6], [-0.78, -0.30, 3.9], [-0.30, -0.88, 4.8],
                    [-0.16, -0.72, 3.6], [0.48, -0.62, 5.0], [0.62, -0.44, 4.0],
                    [0.92, -0.16, 4.4], [-0.62, 0.30, 4.7], [-0.48, 0.46, 3.7],
                    [0.20, 0.60, 4.9], [0.34, 0.44, 3.8], [0.86, 0.50, 4.3],
                    [-0.92, 0.58, 4.1], [0.06, -0.20, 3.5]];
    for (const [ux, uy, s] of onTree) apple(crCx + ux * crR, crCy + uy * crR * 0.85, s);
  }
  // THE GIVEN APPLE now lives OUTSIDE the plate entirely (engine/scene.js,
  // the HELD table for page 21) — Fred: "now he is sitting on the apple. can
  // you put it where i drew it?" Painting it into the plate could never work:
  // the runtime actor is a full opaque cutout drawn OVER the plate, so
  // anything painted "in" his hands is painted UNDER them and is either
  // invisible or, pushed just low enough to peek out, reads as him sitting on
  // it. The engine already has the right mechanism for exactly this — a
  // "front" critter, appended AFTER the cast so it occludes him instead of
  // the other way round (used elsewhere for the garden's cypress, which the
  // child hides behind). `HAND` below is just the reference point the ground
  // apples still need to keep his hands' own clearing; the apple ITSELF is
  // drawn in scene.js now, at the same measured position.
  const HAND = { x: 590, y: 424 };   // = CAST1[21].x, and his lap moved down with SEAT_Y; keeps the ground apples out of it
  // APPLES ON THE GROUND — fewer now (Fred: "less on the ground"), and clear
  // of his hands.
  // ⚠ THEY WERE FLOATING. Scattered flat across a 300-unit box with no contact of any kind,
  // the fallen fruit read as red blobs stuck at random heights in tall grass rather than
  // apples lying ON the ground — Fred: "the old apples are messy." Two things fix it, and
  // both are about contact: a shadow pressed into the turf under each one, and a few blades
  // drawn back OVER its lower edge so it sits down IN the grass instead of on top of it.
  // They also gather toward the trunk now, because that is where fruit falls.
  const groundApples = [];
  for (let i = 0; i < 13; i++) {
    const a2 = rng() * 6.2832, d = Math.pow(rng(), 0.62);          // clustered under the tree
    const ax = TREEX + Math.cos(a2) * 165 * d, ay = TREEY - 16 + Math.sin(a2) * 52 * d;
    if (Math.hypot(ax - HAND.x, ay - HAND.y) < 30) continue;       // clear of his own hands
    groundApples.push([ax, ay, (2.8 + rng() * 2.2) * dS(ay)]);
  }
  groundApples.sort((a, b) => a[1] - b[1]);   // far apples first, near ones overlap on top
  for (const [ax, ay, s] of groundApples) {
    strokes(out, counter, {                                        // pressed into the turf
      rng, n: 9,
      sample: r => [ax + (r() + r() - 1) * s * 1.5, ay + s * 0.62 + (r() - 0.5) * s * 0.5],
      dir: () => 0.06,
      col: (x, y, r) => jig(mix('#1f3a1c', '#33512a', r()), r, 6),
      len: s * 1.5, lw: s * 0.7, steps: 1, relief: 0, op: 0.42,
    });
    apple(ax, ay, s);
    strokes(out, counter, {                                        // and grass closing over its foot
      rng, n: 11,
      sample: r => [ax + (r() + r() - 1) * s * 1.25, ay + s * (0.15 + r() * 0.55)],
      dir: (x, y) => -Math.PI / 2 + (fbm(x / 7, y / 6, 103) - 0.5) * 1.2,
      col: (x, y, r) => jig(ramp(['#2f6a2e', '#4f8c3c', '#7ab04e', '#a3c85e'], r() * 0.9 + glow(x, y) * 0.3), r, 10),
      len: s * 1.9, lw: 1.0, steps: 2, lenJ: 0.7, impasto: 0.5,
    });
  }
  // DAPPLED LIGHT — the tree's canopy breaking the sun into small warm coins of
  // light across the grass and the fallen apples. Not a flat tint: real light
  // falling THROUGH leaves.
  strokes(out, counter, {
    rng, n: 110,
    sample: r => [TREEX + (r() - 0.5) * 340, TREEY - 20 + (r() - 0.5) * 160],
    dir: () => 0.1,
    col: (x, y, r) => jig(mix('#fff6c8', GOLD_PALE, r() * 0.4), r, 5),
    len: 3, lw: 1.7, steps: 1, impasto: 0.12, relief: 0,
  });

  /* ---------------- 6. THE WAY AHEAD, STILL LIT ---------------- */
  {
    // "And He lights the next step of the way" stays true as a soft pool
    // of light resting further out in the open meadow, toward the horizon-glow —
    // the way is not a path underfoot any more, it is the whole field ahead of
    // him, and it is still lit.
    const STEP = { x: 400, y: 330 };
    strokes(out, counter, {
      rng, n: 40,
      sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 0.8) * 30; return [STEP.x + Math.cos(a) * d, STEP.y + Math.sin(a) * d * 0.4]; },
      dir: (x, y) => Math.atan2(STEP.y - y, STEP.x - x),
      col: (x, y, r) => jig(ramp(['#fff8dc', '#ffeeb0', GOLD_PALE, '#e6cf94'], Math.hypot(x - STEP.x, (y - STEP.y) / 0.4) / 30), r, 8),
      len: 6, lw: 1.9, steps: 2, lenJ: 0.5, relief: 0,
    });
  }

  fgRanges.push([_fg, out.length]);   // ← the child + the apple tree + the fallen apples + the lit way ahead are foreground

  /* ---------------- 7. EASTER EGG — John 6:35 in Greek, incised low in the grass ---------------- */
  // "I am the bread of life." Ϛʹ·ΛΕʹ (6 = Ϛ, 35 = ΛΕ) — incised low in the meadow.
  // ⚠ a fourth-look secret, not a caption — near-white at h14/op.78 it read as a watermark
  E.inscriptionText(out, E.greekRef(6, 35), { x: 408, y: 456, h: 10, body: '#2a4a2c', edge: '#e8f4d8', op: 0.44, edgeOp: 0.24 });

  const ALT = 'In a bright new-creation day a small hooded child sits at rest in the dappled shade of a big green apple tree, in an unbroken flowering meadow, an apple resting in his own two hands; a few more red apples hang in the branches and lie scattered in the grass all around him, provided in abundance; a soft pool of light rests further out in the open field; sparrows peck seed and white trumpet lilies bloom nearby in the grass; vibrant light-blue sky, gold low on the horizon, wildflowers growing in colourful colonies across the rolling ground.';

  // MULTIPLANE: assemble the requested depth plane. Each is its own cel —
  // transparent where it has no content — so they stack and parallax apart.
  const RAW = { undercoat: 0, weave: 0, varnish: 0, oil: 0 };   // no baked surface — the live filter unifies the planes
  const setOf = ranges => { const s = new Set(); for (const [a, b] of ranges) for (let i = a; i < b; i++) s.add(i); return s; };
  const pick = ranges => ranges.map(([a, b]) => out.slice(a, b).join('\n')).join('\n');
  const fgSet = setOf(fgRanges);
  if (LAYER === 'bg') return svgWrap(ALT, out.slice(0, skyEnd).join('\n'), RAW);   // bright day sky (opaque)
  if (LAYER === 'fg') return svgWrap(ALT, pick(fgRanges), RAW);                    // the child + the apple tree + the given apple (nearest)
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
