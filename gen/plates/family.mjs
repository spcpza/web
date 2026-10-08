// gen/plates/family.mjs — "The family"
// Acts 2:42 — the believers "continued stedfastly... in fellowship, and in
// breaking of bread." POST-RESURRECTION: this is the NEW creation, so it is
// BRIGHT and flourishing (resurrection-flip — never the old dusk). A vibrant
// light-blue sky, gold and green, wildflowers and fruit trees; the recurring
// RED child ("you") gathered with three friends, each in their own colour,
// around a low table of bread. EVERYONE here is in the Light and WASHED, so
// every figure — the red child and each friend — wears a soft WHITE AURA
// (Rev 7:14, "made them white in the blood of the Lamb"). Faces lifted, glad,
// belonging. Munch: living things curve, made things (the table) go straight.
//
// Easter egg: Acts 2:42 in Koine Greek (Βʹ·ΜΒʹ) cut faint into the bright floor.

export const name = 'family';
export const title = 'The family';
export const caption = 'You were given each other.';
export const seed = 11420642;
export const focal = { x: 400, y: 300 }; // the shared table of bread the family rings
// MULTIPLANE (mobile parallax): three planes. BACKGROUND = the bright sky +
// flourishing meadow ground (opaque). MID = the shared table of bread + loaves
// + the fruit trees + wildflowers + inscription. FOREGROUND = the gathered ring
// of washed, white-aura'd figures (nearest us). `full` (desktop) reassembles in
// the ORIGINAL paint order — unchanged.
export const layers = [
  { name: 'bg', opaque: true },   // bright sky + flourishing meadow (backmost)
  { name: 'mid' },                // the table of bread, fruit trees, wildflowers, inscription
  { name: 'fg' },                 // the gathered ring of washed figures (nearest us)
];

export function paint(E, opts = {}) {
  const {
    mulberry32, fbm, curlV, goldenSpiralV, mix, ramp, jig, strokes, rej,
    horizonFringe, paintPath, inCap, paintChild, personCaps, castShadow, paintFace, lightRadial,
    ribbon, svgWrap, R1, W, H, ridge,
    fruitTree, groundFlowers, LEAF_PALETTES,
    GOLD, GOLD_PALE, GOLD_DEEP, GOLD_HOT,
  } = E;

  const rng = mulberry32(seed);
  const out = [];           // BACKGROUND then FOREGROUND (figures) accumulate here
  const mid = [];           // MID plane: the table, loaves, trees, flowers, inscription
  const counter = { n: 0 };
  const LAYER = opts.layer || 'full';

  const horizon = 226;
  // SCALE GRADIENT — a mark at your feet is far bigger than a mark at the horizon.
  // Drawn all one size, ground reads as a flat green shape however good the colour
  // is; sized by depth it reads as ground going away from you.
  const dS = y => 0.32 + 1.0 * Math.max(0, Math.min(1, (y - horizon) / (H - horizon)));
  // a gentle glory over the gathered family — the Light they live in now
  // ⚠⚠ THE PAGE'S LIGHT MOVED TO THE GROUND. "He gave you a whole family: many faces, ONE
  // LIGHT" — and in broad daylight that sentence cannot be drawn, because nothing you put
  // in a sunlit field is the light of it. So this is EVENING, and the one light is a fire
  // they are sitting round. Now every face on the page really is lit by one source, and
  // the source is the thing they are sharing.
  // (Post-resurrection still: this is a warm gold-and-lilac dusk, vibrant and flourishing,
  // not a night — the value flip means you live IN the light, not that it is always noon.)
  const FIRE = { x: 320, y: 452 };
  // ⚠ the old baked-figure block further down still aims its heads at `tcx`/`tableY` (the
  // table that used to stand here). Those figures are DEBAKE'd — the cast draws them at
  // runtime — but the code still runs, so the names now point at the fire they would be
  // facing anyway. Delete both when that block goes.
  const tcx = 400, tableY = 468;
  const gL = lightRadial(FIRE.x, FIRE.y - 26, 205)   /* ⚠ was 330 — see note at meadowCol */;

  // ---------------- 1. THE BRIGHT DAY ----------------  [BG plane, opaque]
  // a vibrant light-blue sky, warm gold + pink low at the horizon, white crown.
  // The sky is nature → it swirls gently (Munch). The new creation rejoices.
  out.push(`<rect width="${W}" height="${H}" fill="#6a6aa8"/>`);
  // ⚠⚠ THE SKY WAS A RIOT. Fred, on this page: "it is an abomination hahaha." He is right,
  // and the sky was most of it — 560 huge marks (lw 7.2, len 36) dragged round three golden
  // spirals, with jig's complementary fleck left on: the complement of a lilac dusk is
  // GREEN, so a quiet evening came out as purple and green slashes churning over the roof.
  //   What this page's words want is the opposite of churn. "He gave you a whole family:
  // many faces, one Light", Acts 2:42 — fellowship, breaking of bread, an evening at rest.
  // So the sky SETTLES: horizontal bands lying down for the night, small quiet marks, and
  // no vortex anywhere. It also has to stay DARK enough that the fire is unmistakably the
  // one Light — a bright sky and a bright fire would be two lights and the sentence breaks.
  const _MS = E.getManifold(); E.setManifold(0);
  const skyDir = (x, y) => {
    const [vx, vy] = curlV(x, y, 190, 150);
    return Math.atan2(vy * 0.22, Math.abs(vx) * 0.5 + 1.2);   // lying down, never turning over
  };
  // ── THE EVENING SKY, DRAWN FOUR TIMES ────────────────────────────────────
  // Fred: "make the sky move." What this page's sky IS decides how — and the words are
  // "many faces, one Light" over Acts 2:42, fellowship, an evening at rest. So it is not
  // weather: it is a bank of cloud breathing, the way a sky does when nothing is happening.
  // ⚠ AND IT IS DRAWN, NOT SLID. Fred, on the last sky I tried: "i like the tempo, but it is
  // lazy. instead of using the same art and copying it, draw other versions." So the frame
  // number goes into the NOISE FIELDS that make the cloud, not into an offset on a finished
  // picture: the warm bank and the dark bank drift against each other, so the gaps between
  // them open and close and the bank genuinely re-forms. Both offsets are cos/sin of one
  // angle, so drawing 4 flows back into drawing 1 with no jump.
  // ⚠ THE STARS AND THE GROUND DO NOT MOVE. The stars are drawn after this from their own
  // rng and never see the frame; the meadow is byte-identical between drawings because
  // family's boil AMPLITUDE is zero (build.mjs BOIL_BAND_PAGE) — without that, the engine
  // would displace every blade of grass too and a field crawls like TV snow.
  const _FN = Math.max(1, globalThis.__FRAME_N || 1);
  const _FR = (globalThis.__FRAME || 0) % _FN;
  const _TH = _FN > 1 ? 2 * Math.PI * _FR / _FN : 0;
  const dW = Math.cos(_TH), dD = Math.sin(_TH);
  const skyCol = (x, y, r) => {
    // a summer dusk: gold low on the skyline, peach and lilac above it, deep blue at the
    // crown — the ramp was always right, it was the marks that were shouting
    // ⚠ THE DRIFT HAS TO REACH THE VALUE FIELD, not just the two cloud bands. First cut moved
    // only the bands and the four drawings differed by 1.0% of their pixels — measured against
    // hands, where a sky that reads as breathing changes 5.8%, that is nothing at all. The
    // broad tonal noise is what covers the WHOLE sky, so drifting it is what makes the change
    // general instead of confined to a few cloud edges.
    const t = Math.max(0, Math.min(1, (horizon - y) / horizon * 0.80
      + fbm((x + dW * 96) / 150, (y + dD * 26) / 90, 133) * 0.18 - 0.02));
    // ⚠ and DARKER than a sunset wants to be. A bright sky and a bright fire are two
    // lights, and the sentence says one — so the dusk is already well down.
    // ⚠⚠ NIGHT, NOT DUSK. Fred: "still bad... change the whole scene. redraw it." The page
    // kept reading as a bright meadow with a fire ornament in it, and the sky was half the
    // reason: a lit sky and a lit fire are two lights, and Acts 2:42 with "one Light" wants
    // one. The last of the sun is a thin warm seam on the skyline and everything above it
    // has gone over to night — which is the only condition in which a small fire can be the
    // brightest thing in a picture.
    let c = ramp(['#b07a58', '#8a5c58', '#5d4763', '#3e3a63', '#2a2b52', '#1c1e3f', '#12142c'], t);
    // the last of the sun caught under a bank of cloud, low and warm — the only warm thing
    // in the sky, and it sits where the house is so the two agree
    // two banks, drifting against one another (see the note above skyCol)
    const bandW = fbm((x + dW * 132) / 190, (y + dD * 15) / 26, 139);
    const bandD = fbm((x - dW * 88) / 174, (y - dD * 12) / 30, 151);
    if (bandW > 0.60 && y > horizon - 150) c = mix(c, '#ffcb96', (bandW - 0.60) * 1.6);
    if (bandD < 0.36 && y > horizon - 180) c = mix(c, '#3b3a70', (0.36 - bandD) * 1.0);
    return jig(c, r, 5);
  };
  // ⭐ DETAIL PASS (Sep 8) — the SKY only (the camp is Sep 1 work and stays). EVERY STROKE
  // DRAWS ITS OWN WIDTH AND LENGTH (Fred: "use no rules"): the dusk was a roof of same-size
  // scallops; now it is strokes, each its own size.
  const free = (x, y, salt) => { const n = Math.sin(x * 12.9898 + y * 78.233 + salt) * 43758.5453; return n - Math.floor(n); };
  const widthOf  = (x, y, salt) => 0.40 + 3.2 * Math.pow(free(x, y, salt), 2.6);
  const lengthOf = (x, y, salt) => 0.40 + 1.5 * Math.pow(free(x, y, salt + 17), 1.5);
  strokes(out, counter, {
    rng, n: 4000, sample: rej(-12, -12, 812, horizon + 8),
    dir: skyDir, col: skyCol,
    // ⚠ relief 0.1 on air — at its default of 1 every big mark carries a lit AND a shadow
    // edge and the whole heaven tiles into slabs.
    // ⚠ AND IMPASTO IS THE OTHER HALF OF THE SLAB. relief was already down at 0.1 and the
    // heaven STILL came out as courses of stacked flagstone, because impasto is a luminance
    // gate: on a dark sky it thresholds every mark into a hard-edged tile. Air takes almost
    // none of it.
    len: (x, y) => 18 * lengthOf(x, y, 11 + 131 * _FR), lw: (x, y) => 2.2 * widthOf(x, y, 13 + 173 * _FR), steps: 3, follow: 0.9, wild: 0.05, lenJ: 0.3, wJ: 0.3, impasto: 0.08, relief: 0.08,
  });
  // and the first stars out — small, high, and only where the sky has gone dark enough to
  // hold them. They are the quietest possible way to say the day is over.
  {
    const sRng = mulberry32(seed ^ 0x57a5);
    // ⭐ "one star differeth from another star in glory" (1 Cor 15:41; Sep 21). These were ninety
    // near-identical daubs. The engine's paintStars gives the sky its hierarchy — a great many
    // faint and cold, a few clear, a handful haloed, one or two blazing gold or blue-white — and a
    // family under a sky like THAT is sitting under a promise (Gen 15:5), not a wallpaper.
    E.paintStars(out, counter, sRng, { x0: -8, y0: 6, x1: 808, y1: horizon - 84, n: 130, fall: 1.5 });
  }
  E.setManifold(_MS);
  // a FLOURISHING meadow — fresh deep green, gold at the lit crowns (Isa 35:1,
  // "the desert shall rejoice, and blossom as the rose"). Its top is a rolling
  // contour, never a ruled line.
  const fieldTop = ridge(horizon, { amp: 20, freq: 150, bumps: 0.35, seed: 131 });
  // The ground's top edge is where it meets the sky — grass has no outline, it
  // has blades. This jagged contour replaces fieldTop in the FILL only (sampled fine
  // enough to keep the sawtooth; a coarse step averages it straight again).
  const fieldTopJag = x => {
    const fine = (fbm(x / 3.1, 2.1, 701) - 0.5) * 6.5;
    const tuft = Math.max(0, fbm(x / 8.5, 9.4, 703) - 0.52) * 24;
    return fieldTop(x) + fine - tuft;
  };
  {
    let d = `M-2 ${R1(fieldTopJag(-2))}`;
    for (let x = -2; x <= 802; x += 2.2) d += `L${R1(x)} ${R1(fieldTopJag(x))}`;
    d += `L802 ${H + 2}L-2 ${H + 2}Z`;
    out.push(`<path d="${d}" fill="#26542f"/>`); counter.n++;
  }
  // ⚠ THE SKYLINE HEDGE IS THE FURTHEST THING FROM THE FIRE and was the brightest green in
  // the picture — a lit hedge two hundred feet away in the dark. Same ramp, taken down.
  const MEADOW = ['#0a1a11', '#0f2417', '#152e1d', '#1c3a23', '#254829', '#325633', '#42683c'];
  // the ragged skyline: tufts standing up off the crest with gaps between them
  horizonFringe(out, counter, rng, {
    horizonFn: fieldTop, cols: MEADOW,
    hMax: 23, lightFn: gL, seed: 705, dirJitter: 0.72,
  });
  // ⚠ A PLAIN WITHOUT FORM IS A GREEN SHAPE — the same fault born, seeds and bread each
  // had. This meadow carried no shape term at all, only noise and depth, so however much
  // was drawn on it the ground stayed a flat slab with a table sitting on top. Value has to
  // follow where the land RISES AND FALLS, and the far edge has to lose itself in air.
  const swell = (x, y) => fbm(x / 158, y / 72, 313);
  const facing = (x, y) => { const e = 7;
    return (swell(x - e, y) - swell(x + e, y)) * 2.1 + (swell(x, y - e) - swell(x, y + e)) * 1.2; };
  const haze = (x, y) => Math.max(0, Math.min(1, 1 - (y - horizon) / 78));
  // (a second ground-colour function used to live here and was never called — the one
  //  that paints this page is `grassCol` below.)
  // ══ THE MEADOW, PAINTED THE WAY gift's IS ══════════════════════════════════
  // ⚠ IT WAS FELT WITH CONFETTI ON IT. Every mark the same size, every mark the same
  // value, the colour scattered one fleck at a time — at full resolution the ground read
  // as a knitted mat, not as grass. Refinement here is not more marks: it is STRUCTURE.
  // Grass is a countless number of small upright things growing in TUFTS, at three scales,
  // over ground that rises and falls; and its colour lives in colonies, never in sprinkles.
  //   1 · the body of the sward — broad, loose, following the lie of the land
  //   2 · blades standing up out of it
  //   3 · the finest nap, close to the reader
  //   4 · and clumps, because grass grows in tufts
  // ⚠ the light is the BREAD on the table (see 3c): the field warms toward it and cools
  // away, which is what gives a bright-day page a real pool of light to gather round.
  // ⚠⚠ THIS FIELD WAS STILL LIT BY A LOAF. Fred: "if you make family as bonfire, refer to
  // garden. i like that fire." I gave the page garden's own drawBonfire sprite and it came
  // out PALE — same sprite, same k, no blaze — and I spent a rebuild tightening the light
  // pool in `meadowCol` before noticing that meadowCol IS NEVER CALLED. The function that
  // actually paints this ground is this one, and it was still carrying the light from an
  // older version of the page, when the one Light here was the broken BREAD on a table:
  // a soft linear blob 300 units wide centred at (400,344), over a DAYLIGHT ramp topping
  // out at #c3d96a. So the meadow was lit like noon under a dusk sky and the fire had
  // nothing to read against. garden's fire does not blaze because of the sprite; it blazes
  // because the night around it is dark (its own margin: fire lights a POOL around itself,
  // it does not wash a whole night).
  //   The field is lit by the FIRE now, off the same `gL`, over the deep MEADOW ramp, and
  // it goes blue-green a couple of paces out. ⚠ If you ever wonder why an edit to this
  // page's light did nothing, check you are editing the function that is CALLED.
  const grassCol = (x, y, r, lift) => {
    const depth = Math.max(0, Math.min(1, (y - horizon) / (H - horizon)));
    const g = gL(x, y);
    // ⚠ NIGHT GRASS. The ramp used to run to #c3d96a — noon green — and no amount of mixing
    // a dark blue over it afterwards can make a night of that. It starts dark now, and the
    // only thing that lifts it is the fire.
    let c = ramp(['#0a1410', '#0e1c16', '#13261c', '#1a3324', '#24422c', '#325638', '#456e44'],
      fbm(x / 46, y / 30, 177) * 0.3 + depth * 0.16 + facing(x, y) * 0.4 + swell(x, y) * 0.14
      + g * 0.78 + lift);
    // shade keeps its own colour — broken colour, never a grey wash
    if (g < 0.5 && r() < 0.2 + (1 - g) * 0.32) c = mix(c, '#22405a', 0.22 + (1 - g) * 0.3);
    // ⚠⚠ "MANY FACES, ONE LIGHT" IS A LIGHTING INSTRUCTION, and the page was failing it: the
    // yard was evenly lit bright green, so the fire was an ornament in a daylit field rather
    // than the only light there is. A single light can only be SEEN against what it does not
    // reach — the book's own chiaroscuro rule. So the grass now falls away hard into the
    // evening and only the ring of ground round the fire is warm.
    c = mix(c, '#ffb955', g * g * 0.9);                       // the firelight on the grass
    c = mix(c, '#080d1e', Math.pow(1 - g, 1.2) * 0.86);       // and the night beyond its reach
    c = mix(c, '#5a6a86', Math.pow(haze(x, y), 1.7) * 0.44);
    return jig(c, r, 11);
  };
  // ⚠⚠ REFINEMENT IS STRUCTURE, NOT MORE MARKS. Fred: "make the grassy terrain more
  // detailed." The temptation is another few thousand blades, and that is exactly what makes
  // a field WORSE — more marks all at one value is a thicker mat, not deeper grass. What a
  // real field has is that it is not level: it grows in clumps with HOLLOWS between them,
  // and the hollows are dark because no light gets down into them. So the dark goes down
  // FIRST, and every pass after it is refused where the ground has sunk away — which means
  // the grass is dense on the mounds and sparse in the bays, the way it actually grows.
  const clump = (x, y) => fbm(x / 36, y / 23, 421) * 0.60 + fbm(x / 13, y / 9, 423) * 0.40;
  strokes(out, counter, {                                     // 0 · the hollows, painted first
    rng, n: 1500,
    sample: rej(-10, horizon + 2, 810, 512, (x, y) => y > fieldTop(x) && clump(x, y) < 0.44),
    dir: (x, y) => { const [vx, vy] = curlV(x, y, 140, 70); return Math.atan2(vy * 0.7 - 0.2, Math.abs(vx) + 0.7); },
    col: (x, y, r) => {
      const g = gL(x, y);
      let c = ramp(['#050a08', '#08110c', '#0c1a12', '#122418'], fbm(x / 24, y / 16, 425) * 0.6 + r() * 0.3);
      return jig(mix(c, '#6a4420', g * g * 0.55), r, 8);
    },
    len: (x, y) => 11 * dS(y), lw: (x, y) => 3.0 * dS(y), steps: 2, lenJ: 0.6, impasto: 0.4, relief: 0.22,
  });
  strokes(out, counter, {                                     // 1 · the body of the sward
    rng, n: 3600,
    sample: rej(-10, horizon - 22, 810, 512, (x, y) => y > fieldTop(x) - 1),
    dir: (x, y) => { const [vx, vy] = curlV(x, y, 171, 80); return Math.atan2(vy * 0.8 - 0.5, Math.abs(vx) + 0.6); },
    col: (x, y, r) => grassCol(x, y, r, 0.04),
    len: (x, y) => 13 * dS(y), lw: (x, y) => 3.4 * dS(y), steps: 3, lenJ: 0.55, impasto: 0.5, relief: 0.32,
  });
  strokes(out, counter, {                                     // 2 · blades standing up out of it
    rng, n: 3000,
    sample: rej(-10, horizon + 6, 810, 512, (x, y) => y > fieldTop(x) + 2 && clump(x, y) > 0.42),
    dir: (x, y) => -Math.PI / 2 + (fbm(x / 11, y / 9, 101) - 0.5) * 1.15,
    col: (x, y, r) => grassCol(x, y, r, 0.2),
    len: (x, y) => 9 * dS(y), lw: (x, y) => 1.1 * dS(y), steps: 2, lenJ: 0.8, impasto: 0.6,
  });
  strokes(out, counter, {                                     // 3 · the finest nap, close to us
    rng, n: 2600,
    sample: r => { const x = -10 + r() * 820, y = horizon + 14 + Math.pow(r(), 0.8) * (512 - horizon - 14);
                   return (y > fieldTop(x) && clump(x, y) > 0.46) ? [x, y] : null; },
    dir: (x, y) => -Math.PI / 2 + (fbm(x / 7, y / 6, 103) - 0.5) * 1.5,
    col: (x, y, r) => grassCol(x, y, r, 0.28),
    len: (x, y) => 6 * dS(y), lw: (x, y) => 0.8 * dS(y), steps: 2, lenJ: 0.85, impasto: 0.7,
  });
  for (let i = 0; i < 150; i++) {                             // 4 · and clumps
    const tx = -10 + rng() * 820;
    const ty = horizon + 14 + Math.pow(rng(), 0.55) * (508 - horizon - 14);
    if (clump(tx, ty) < 0.48) continue;                       // a tuft stands on a mound
    const sc = dS(ty);
    strokes(out, counter, {
      rng, n: 14,
      sample: r => [tx + (r() + r() - 1) * 9 * sc, ty - Math.pow(r(), 0.7) * 11 * sc],
      dir: (x, y) => -Math.PI / 2 + (x - tx) * 0.05 + (fbm(x / 6, y / 6, 107) - 0.5) * 0.8,
      col: (x, y, r) => grassCol(x, y, r, 0.32),
      len: 10 * sc, lw: 1.1 * sc, steps: 2, lenJ: 0.7, impasto: 0.65,
    });
  }
  /* ── 1e · WHAT A CHILD CAN NAME IN THE GRASS ────────────────────────────────
     The other half of "more detailed": a field of blades is a texture, and a texture has
     nothing in it to look AT. What makes a real field worth crossing is that it has THINGS
     in it — seed heads on long stems, a couple of big-leaved weeds at the edge of the
     light, and the strip somebody has worn walking between the fire and the tent. Each of
     those is nameable, which is the test on this book: a child has to be able to say what
     it is. */
  {
    const wRng = mulberry32(seed ^ 0x9ea5);
    // ⚠ MANIFOLD OFF FOR THE EARTH. jig()'s complementary fleck flips ~1 mark in 12 to the
    // opposite hue, and the opposite of road-brown is TURQUOISE — the walk came out as a
    // blue-and-brown slab lying in the grass, which is the same fault the door and the
    // bonfire each had. It stays on for the green, where the complement is a violet that
    // belongs in a field at night.
    const _MW = E.getManifold(); E.setManifold(0);
    // ── the walk between the fire and the tent. Somebody has been to and fro all evening,
    //    and it is the plainest possible evidence that people LIVE here. It is a made thing,
    //    so it is straight (Munch), and it narrows going away as everything else does.
    {
      // ⚠ AND A PATH IS WORN GRASS, NOT A TRENCH OF EARTH. First cut laid 760 hard brown
      // marks all at one angle inside a hard-edged strip, and it read as a PLANK dropped in
      // the field. Two things fix it: the marks lie along the walk but keep the grass's own
      // scatter, and the colour is mostly the grass with the earth showing THROUGH where the
      // most feet have gone — so it has no edge to see, which is what a worn place is.
      const A = [452, 486], B = [556, 352];
      strokes(out, counter, {
        rng: wRng, n: 520,
        sample: r => { const t = Math.pow(r(), 0.85);
                       const w2 = 24 * (1 - t) + 6 * t;
                       return [A[0] + (B[0] - A[0]) * t + (r() + r() - 1) * w2,
                               A[1] + (B[1] - A[1]) * t + (r() - 0.5) * 5]; },
        dir: (x, y) => -Math.PI / 2 + (fbm(x / 10, y / 8, 433) - 0.5) * 1.3,
        col: (x, y, r) => {
          // how far off the centre-line of the walk this mark is: bare in the middle, grass
          // again at the sides, with nothing anywhere to call an edge
          const t = Math.max(0, Math.min(1, ((x - A[0]) * (B[0] - A[0]) + (y - A[1]) * (B[1] - A[1]))
            / ((B[0] - A[0]) ** 2 + (B[1] - A[1]) ** 2)));
          const cxL = A[0] + (B[0] - A[0]) * t, cyL = A[1] + (B[1] - A[1]) * t;
          const off = Math.min(1, Math.hypot(x - cxL, y - cyL) / (24 * (1 - t) + 6 * t + 1));
          const bare = Math.pow(1 - off, 1.5);
          let c = grassCol(x, y, r, 0.02);
          c = mix(c, ramp(['#241a11', '#33271a', '#41321f'], fbm(x / 18, y / 12, 431) * 0.8 + r() * 0.2),
            bare * 0.72);
          return mix(c, '#b8823e', gL(x, y) * 0.28 * bare);
        },
        len: (x, y) => 7 * dS(y), lw: (x, y) => 1.6 * dS(y), steps: 2, lenJ: 0.7, impasto: 0.35, relief: 0.14,
      });
    }
    // ── seed heads: long stems that overtop the sward, each with a head on it. They are
    //    the only thing out here tall enough for the fire to catch, so near the flame they
    //    have a lit tip and further out they are just dark lines.
    for (let i = 0; i < 70; i++) {
      const sx = -8 + wRng() * 816;
      const sy = horizon + 40 + Math.pow(wRng(), 0.7) * (506 - horizon - 40);
      if (clump(sx, sy) < 0.44) continue;
      if (Math.hypot(sx - FIRE.x, (sy - FIRE.y) / 0.45) < 92) continue;   // not in the hearth
      const sc = dS(sy), ht = (16 + wRng() * 15) * sc;
      const lean = (wRng() - 0.5) * 0.5;
      const tipX = sx + Math.sin(lean) * ht, tipY = sy - ht;
      const g2 = gL(sx, sy);
      paintPath(out, counter, wRng, [[sx, sy], [sx + Math.sin(lean) * ht * 0.55, sy - ht * 0.58], [tipX, tipY]],
        (x, y, r) => jig(mix('#16281a', '#6a5c28', g2 * 0.38 + r() * 0.12), r, 7),
        { lw: 0.9 * sc, len: 3, density: 0.9, jitter: 0.3 });
      // the head — a little sheaf of grains, brighter on the side the fire is
      for (let k = 0; k < 5; k++) {
        const u = k / 4;
        E.daub(out, counter, tipX + Math.sin(lean) * u * 3 * sc + (wRng() - 0.5) * 1.4 * sc,
          tipY + u * 5.5 * sc, (0.9 + wRng() * 0.5) * sc,
          jig(mix('#2a3a20', '#cfa050', g2 * 0.7 + 0.05), wRng, 7), wRng);
      }
    }
    // ── and two big-leaved weeds at the very edge of the light. One plant with real leaves
    //    tells a child "this is a field" faster than a thousand more blades of grass do.
    for (const [dx0, dy0, ds, dfl] of [[268, 498, 1.15, 1], [502, 452, 0.92, -1]]) {
      const g3 = gL(dx0, dy0);
      for (let k = 0; k < 9; k++) {
        const a3 = (-0.5 - k * 0.26) * dfl + (wRng() - 0.5) * 0.2;
        const L2 = (26 + wRng() * 16) * ds;
        const ex = dx0 + Math.cos(a3) * L2, ey = dy0 + Math.sin(a3) * L2 * 0.72;
        // a leaf is a blade with a BELLY — three points, fat in the middle
        paintPath(out, counter, wRng,
          [[dx0, dy0], [(dx0 + ex) / 2 + Math.sin(a3) * 5 * ds, (dy0 + ey) / 2 - Math.cos(a3) * 4 * ds], [ex, ey]],
          (x, y, r) => {
            const up = Math.max(0, (dy0 - y) / (L2 + 1));
            return jig(mix(mix('#0c1a10', '#2c4a24', up * 0.8 + r() * 0.2), '#c08a3e', g3 * 0.5 * up), r, 8);
          },
          { lw: (4.6 - k * 0.22) * ds, len: 4, density: 0.95, jitter: 0.4 });
      }
      // the stem going up out of the rosette, with a seed spike on it
      const th2 = (34 + wRng() * 12) * ds;
      paintPath(out, counter, wRng, [[dx0, dy0], [dx0 + 3 * ds * dfl, dy0 - th2 * 0.6], [dx0 + 5 * ds * dfl, dy0 - th2]],
        (x, y, r) => jig(mix('#101f13', '#6e5c28', g3 * 0.5 + r() * 0.15), r, 7),
        { lw: 1.8 * ds, len: 3, density: 0.95, jitter: 0.3 });
      for (let k = 0; k < 7; k++)
        E.daub(out, counter, dx0 + 5 * ds * dfl + (wRng() - 0.5) * 2.6 * ds, dy0 - th2 + k * 3.4 * ds,
          1.5 * ds, jig(mix('#24301c', '#caa050', g3 * 0.7 + 0.05), wRng, 7), wRng);
    }
    E.setManifold(_MW);
  }
  const bgEnd = out.length;   // BG plane: bright sky + meadow ground (opaque, backmost)

  // ---------------- 2. THE FLOURISHING PLACE ----------------  [MID plane]
  // fruit trees rooted across the meadow (Isa 35:1; Munch free colour)
  // ⚠ `fruitTree` — the mushroom-cap painter, rejected on bread and again on hands. A blue
  // cap and a pink cap on striped poles were the two loudest objects on a page about people.
  const famTree = (x, y, h2, bl, sd, sp) => E.paintTree(mid, counter, rng, x, y, h2,
    // ⚠⚠ A TREE IN BLOSSOM IS A DAYTIME TREE. These three were still carrying the floor of
    // 0.3 and fourteen white blossoms apiece from when this page was a sunlit meadow, so at
    // night they read as three lit objects in a picture whose whole claim is ONE Light —
    // and white blossom against a night sky is about the brightest mark there is. The floor
    // drops to almost nothing (a tree fifty feet from a campfire is a silhouette) and the
    // blossom goes: what is left is a shape against the stars, warmed only on its fire side.
    { lightFn: (px, py) => Math.max(0.05, gL(px, py)), shadowDir: sd, blossom: bl, species: sp,   // ⭐ after his kind: three silhouettes a child can name against the night
      // ⚠ and the CROWN RAMP is the rest of it. Dropping the light floor was not enough,
      // because paintTree's default canopy tops out at #cbd870 — a daylight leaf — so the
      // trees stayed brighter than the sky they stand against. A tree at night is a shape
      // with a little green left in it, and that is all.
      crownCols: ['#070d0c', '#0a140f', '#0e1c15', '#14261a', '#1c3320', '#294427', '#3d5c33'] });
  famTree(100, 322, 150, 0, -1, 'cedar');     // left — a cedar of Lebanon (Ps 104:16)
  // ⚠⚠ THIS TREE STOOD IN FRONT OF THE HOUSE — or rather the house stood in front of IT,
  // which is worse, because its base was at y330 and the house's is at y302: the tree was
  // NEARER and got painted over anyway. Fred: "the house is in front of the tree. this is
  // intolerable haha." Depth on a flat plate is decided by two things agreeing — where the
  // foot of a thing sits, and what order it is drawn in — and here they contradicted.
  //   It is moved clear of the house and set further back (a higher foot, a smaller crown),
  // so it now reads as standing behind and to the left of the gable, which is also a better
  // composition: the house gets its own sky to be a silhouette against.
  famTree(486, 292, 118, 0, 1, 'palm');      // right of the ring, behind the house's line — a palm
  famTree(214, 286, 96, 0, 1, 'fig');       // mid-distant, left — a fig (1 Kings 4:25)
  // wildflowers of every colour open across the meadow
  // ⚠ SCATTERED BLOOMS AVERAGE TO GREY — the book's own warning, and 380 of them one at a
  // time is exactly what put pastel confetti over this whole meadow. Flowers grow in
  // COLONIES: a patch is one kind of flower, each with a stem and a face, thinning with
  // distance. Jewel pairs, not pastels.
  {
    // ⚠ the SECOND palette — there are two flower routines on this plate and I changed only
    // one, which is why the yard was still wearing pink and lilac under a night sky.
    const PET = [['#e4e2d4', '#c0beb0'], ['#dcdccc', '#b8b8a8'], ['#e9e4d8', '#c6c1b6'],
                 ['#d6d8cc', '#b2b4a8'], ['#efe8da', '#cbc4b6'], ['#e0d6c4', '#bcb2a2']];
    // ⚠⚠ AND ONLY WHERE THE FIRE REACHES. Forty-four colonies scattered over the whole yard
    // made the flowers the brightest thing in the picture after the flame — pale specks
    // evenly spread from edge to edge, which is both the confetti fault and a contradiction
    // of the page: "one Light" cannot be true if the far corners are picked out as clearly
    // as the ring is. At night you do not see a flower twenty feet away. So the fire decides
    // which ones exist, and the dark keeps the rest.
    for (let c = 0; c < 26; c++) {
      const cx2 = -10 + rng() * 820;
      const cy2 = horizon + 22 + (c < 15 ? rng() * 0.42 : rng()) * (506 - horizon - 22);
      const pal = PET[(rng() * PET.length) | 0];
      const spread = 24 + rng() * 52, cnt = 4 + ((rng() * 9) | 0);
      for (let i = 0; i < cnt; i++) {
        const fx = cx2 + (rng() + rng() - 1) * spread;
        const fy2 = cy2 + (rng() + rng() - 1) * spread * 0.4;
        if (fy2 < fieldTop(fx) + 6) continue;
        if (Math.hypot(fx - 400, (fy2 - 366) / 0.5) < 108) continue;   // the table keeps its ground
        const _lit = gL(fx, fy2);
        if (_lit < 0.30 || rng() > _lit * 1.25) continue;   // the dark keeps the rest
        const sc = dS(fy2), st = (7 + rng() * 8) * sc;
        paintPath(mid, counter, rng, [[fx, fy2], [fx + (rng() - 0.5) * 4, fy2 - st]],
          (x, y, r) => jig(mix('#3f6d38', '#79a44c', r()), r, 7), { lw: 1.2 * sc, len: 3, density: 0.9, jitter: 0.3 });
        const pet = pal[(rng() * 2) | 0], hd = 2.4 * sc;
        for (let k = 0; k < 5; k++) {
          const a2 = k * 1.256 + rng() * 0.35;
          const px = fx + Math.cos(a2) * hd, py = fy2 - st + Math.sin(a2) * hd;
          mid.push(`<ellipse cx="${R1(px)}" cy="${R1(py)}" rx="${R1(2.1 * sc)}" ry="${R1(1.5 * sc)}" transform="rotate(${R1(a2 * 57)} ${R1(px)} ${R1(py)})" fill="${pet}" opacity="0.94"/>`);
          counter.n++;
        }
        mid.push(`<circle cx="${R1(fx)}" cy="${R1(fy2 - st)}" r="${R1(1.25 * sc)}" fill="#ffe9a8"/>`); counter.n++;
      }
    }
  }
  /* ══ 2b · THE TENT ═══════════════════════════════════════════════════════
     Fred, after eleven passes at a house: "yeah i think tent works better. make this scene a
     camping scene then..." He is right, and it is a better idea than mine on three counts:
       · A TENT BELONGS TO A FIRE. A house full of beds and a hearth makes you ask why anyone
         is sitting outside in the dark; a tent explains the whole picture in one shape.
       · IT FITS THE BOOK. These children have been walking the road all the way through — of
         course they are camped for the night. The page stops being "children in a garden" and
         becomes a stop on the journey they are already on.
       · AND IT IS CANVAS, NOT ARCHITECTURE. Everything I could not get right about the house
         — courses, reveals, eaves, joins — simply does not exist. A tent is two sloping
         planes, a dark mouth and a few ropes, and canvas GLOWS when firelight lands on it,
         which turns the hardest problem on the page into its best feature.
     ⚠ It is still lit by the FIRE ALONE — no lamp inside. That was the decision that ended
     the house, and it holds here: one Light on this page, and everything seen by it. */
  {
    const _MT = E.getManifold(); E.setManifold(0);
    const tRng = mulberry32(seed ^ 0x7e27);
    // ⚠ A RIDGE TENT IS AN A, NOT A LEAN-TO. First cut ran the ridge 150 units across a
    // 240-wide footprint, so the slopes were shallow and it read as a long low wall. A camping
    // tent is steep: a short ridge over a wide foot.
    const RA = [576, 238], RB = [672, 232];          // the ridge, with a little sag in it
    const FL = [512, 336], FR = [742, 330];          // where the canvas meets the ground
    const ridgeY = x => RA[1] + (RB[1] - RA[1]) * Math.max(0, Math.min(1, (x - RA[0]) / (RB[0] - RA[0])))
      + Math.sin((x - RA[0]) / (RB[0] - RA[0]) * Math.PI) * 4;   // canvas never runs straight
    // ⚠ AND THE CANVAS HAS TO CATCH IT. At reach 430 the fire barely stained the tent and
    // the best thing about camping at night — a lit wall of cloth — was missing. Canvas is
    // thin and pale: it takes far more light than a stone wall would, which is exactly why
    // the tent is a better subject than the house was.
    const fireLit = (x, y) => Math.max(0, 1 - Math.hypot(x - FIRE.x, (y - FIRE.y) / 0.7) / 620);

    // the two faces of the canvas: the NEAR one turned to the fire, the far one away
    const face = (x0, x1, footX, seedn, toFire) => {
      strokes(mid, counter, {
        rng: tRng, n: 1500,
        sample: r => {
          const t = r();
          const rx = x0 + (x1 - x0) * t;                       // a point along the ridge
          const ry = ridgeY(rx);
          const u = Math.pow(r(), 0.8);                        // and down the slope from it
          const fx = footX[0] + (footX[1] - footX[0]) * t;
          const fy = FL[1] + (FR[1] - FL[1]) * t;
          return [rx + (fx - rx) * u + (r() - 0.5) * 3, ry + (fy - ry) * u];
        },
        dir: (x, y) => {                                        // marks run DOWN the slope
          const t = Math.max(0, Math.min(1, (x - RA[0]) / (RB[0] - RA[0])));
          return Math.atan2(1, toFire ? -0.85 : 0.85) + (fbm(x / 24, y / 20, seedn) - 0.5) * 0.25;
        },
        col: (x, y, r) => {
          const lit = fireLit(x, y) * (toFire ? 1 : 0.22);
          const down = Math.max(0, Math.min(1, (y - ridgeY(x)) / 90));
          // canvas: cool and blue-grey in the night, and it GLOWS where the fire finds it —
          // warm, and warmest near the ground where the flame actually is
          let c = ramp(['#1b2136', '#252c46', '#333b5c', '#414a70'],
            fbm(x / 26, y / 22, seedn + 3) * 0.5 + (1 - down) * 0.32 + r() * 0.22);
          c = mix(c, '#d89a4e', lit * (0.34 + down * 0.62));
          return jig(c, r, 6);
        },
        len: 12, lw: 3.0, steps: 2, lenJ: 0.5, impasto: 0.36, relief: 0.16,
      });
    };
    face(RA[0], RB[0], [FR[0], FR[0]], 511, false);            // the far slope
    face(RA[0], RB[0], [FL[0], FL[0]], 517, true);             // the slope facing the fire

    // ── THE MOUTH: a dark triangle under the near ridge end, the flaps thrown back ──
    {
      const mx = RA[0], my = ridgeY(mx) + 6;
      const bl = [mx - 30, FL[1] - 4], br = [mx + 26, FL[1] - 6];
      strokes(mid, counter, {
        rng: tRng, n: 420,
        sample: r => { const t = r(), u = Math.pow(r(), 0.7);
                       const lx = mx + (bl[0] - mx) * t, ly = my + (bl[1] - my) * t;
                       const rx2 = mx + (br[0] - mx) * t, ry2 = my + (br[1] - my) * t;
                       return [lx + (rx2 - lx) * u, ly + (ry2 - ly) * u]; },
        dir: () => -Math.PI / 2,
        col: (x, y, r) => jig(ramp(['#05070f', '#0a0e1a', '#121828'], r() * 0.9), r, 4),
        len: 8, lw: 2.6, steps: 2, relief: 0,
      });
      // the flaps, pulled open and pegged back — the fire catches their inside faces
      for (const [sx, sgn] of [[bl[0] + 4, -1], [br[0] - 4, 1]])
        strokes(mid, counter, {
          rng: tRng, n: 200,
          sample: r => { const t = r();
                         return [mx + (sx - mx) * t + sgn * 9 * t * r(), my + (FL[1] - my) * t]; },
          dir: () => Math.PI / 2 + sgn * 0.3,
          col: (x, y, r) => jig(mix('#2b3350', '#c08a48', fireLit(x, y) * 0.7 * r() + 0.1), r, 5),
          len: 9, lw: 2.4, steps: 2, impasto: 0.3, relief: 0.12,
        });
    }

    // ── THE RIDGE, and the guys that hold it up ──────────────────────────────
    paintPath(mid, counter, tRng, [[RA[0] - 4, ridgeY(RA[0])], [(RA[0] + RB[0]) / 2, ridgeY((RA[0] + RB[0]) / 2)], [RB[0] + 4, ridgeY(RB[0])]],
      (x, y, r) => jig(mix('#0b0f1c', '#2a3250', r()), r, 4), { lw: 3, len: 4, density: 0.9, jitter: 0.5 });
    paintPath(mid, counter, tRng, [[RA[0] - 2, ridgeY(RA[0]) - 2], [(RA[0] + RB[0]) / 2, ridgeY((RA[0] + RB[0]) / 2) - 2], [RB[0] + 2, ridgeY(RB[0]) - 2]],
      (x, y, r) => jig(mix('#6e76a0', '#3c4468', r()), r, 4), { lw: 1, len: 4, density: 0.5, jitter: 0.5 });
    for (const [gx, gy, px, py] of [[RA[0] - 3, ridgeY(RA[0]), RA[0] - 52, FL[1] + 10],
                                    [RB[0] + 3, ridgeY(RB[0]), RB[0] + 46, FR[1] + 8]]) {
      paintPath(mid, counter, tRng, [[gx, gy], [px, py]],
        (x, y, r) => jig(mix('#39415f', '#8189ad', r() * 0.8), r, 4), { lw: 0.9, len: 4, density: 0.45, jitter: 0.4 });
      E.daub(mid, counter, px, py, 1.8, jig('#1c2236', tRng, 5), tRng, 0.8);
    }
    // the hem, pegged down, with grass growing against it
    paintPath(mid, counter, tRng, [[FL[0] - 4, FL[1]], [FR[0] + 4, FR[1]]],
      (x, y, r) => jig(mix('#080c16', '#1a2036', r()), r, 4), { lw: 2.6, len: 4, density: 0.8, jitter: 0.5 });
    strokes(mid, counter, {
      rng: tRng, n: 620,
      sample: r => [FL[0] - 16 + r() * (FR[0] - FL[0] + 32), FL[1] - 14 + Math.pow(r(), 0.6) * 26],
      dir: (x, y) => -Math.PI / 2 + (fbm(x / 9, y / 7, 497) - 0.5) * 1.2,
      col: (x, y, r) => {
        let c = ramp(['#0a1410', '#0f1c16', '#16281c', '#203624'], fbm(x / 18, y / 12, 499) * 0.7 + r() * 0.3);
        return jig(mix(c, '#8a6a38', fireLit(x, y) * 0.45), r, 6);
      },
      len: 11, lw: 1.5, steps: 2, lenJ: 0.8, impasto: 0.5,
    });
    E.setManifold(_MT);
  }

  /* ══ 3 · THE FIRE — the one light ══════════════════════════════════════════
     ⚠ THE TABLE IS GONE. A low table with loaves on it was the right instinct for
     "breaking of bread" and the wrong object for THIS sentence: in a sunlit meadow it was
     just furniture, and the page's word is LIGHT. A fire is both — it is what a family
     actually gathers round in the evening, and it is the only thing in a field that can be
     the light of a picture. The bread is still here; Fred drew it into the child's hands.
     Built the way anything in this book is built: out of what it is MADE of. A ring of
     stones somebody carried, logs that are logs, flame drawn as flame (natural things
     curve — Munch), embers going up, and the heat of it lying on the grass all round. */
  {
    const fRng = mulberry32(seed ^ 0xf12e);
    const FX = FIRE.x, FY = FIRE.y;
    const _MF = E.getManifold(); E.setManifold(0);   // ⚠ no cyan in a flame — see the door
    // 1 · the scorched ground and the ring of stones somebody set round it
    // ⚠ AND THE GRASS ROUND A FIRE IS WORN OFF. Four children have been sitting here all
    // evening; a lush meadow running right up to the stones is the same mistake as a meadow
    // inside a town. The ground they use is trodden to bare earth, and it thins back into
    // grass the further out it goes — which also puts a warm floor under the whole ring
    // instead of leaving the figures sitting on cold green.
    strokes(mid, counter, {
      rng: fRng, n: 900,
      sample: r => { const a2 = r() * Math.PI * 2, d2 = Math.pow(r(), 0.55);
                     return [FX + Math.cos(a2) * 168 * d2, FY - 6 + Math.sin(a2) * 58 * d2]; },
      dir: (x, y) => 0.06 + (fbm(x / 22, y / 14, 613) - 0.5) * 0.5,
      col: (x, y, r) => {
        const d3 = Math.hypot((x - FX) / 168, (y - FY + 6) / 58);
        let c = ramp(['#2b2116', '#3d2e1e', '#4e3c27', '#33301f'], fbm(x / 26, y / 16, 617) * 0.7 + r() * 0.3);
        c = mix(c, '#c08a46', gL(x, y) * 0.42);
        // ⚠ `op` HAS TO BE A NUMBER — a function there silently does nothing, so the patch
        // must lose its edge in COLOUR: earth at the middle, back into night grass at the
        // rim, which is what a worn patch actually looks like anyway.
        return jig(mix(c, '#101c14', Math.pow(d3, 2.2) * 0.95), r, 6);
      },
      len: 9, lw: 2.8, steps: 1, relief: 0.18, impasto: 0.3, op: 0.9,
    });
    strokes(mid, counter, {
      rng: fRng, n: 240,
      sample: r => { const a2 = r() * Math.PI * 2, d2 = Math.pow(r(), 0.6);
                     return [FX + Math.cos(a2) * 62 * d2, FY + Math.sin(a2) * 22 * d2]; },
      dir: () => 0.04,
      col: (x, y, r) => jig(ramp(['#20180f', '#33251a', '#4a3524'], r()), r, 6),
      len: 8, lw: 2.6, steps: 1, relief: 0, op: 0.8,
    });
    for (let k = 0; k < 14; k++) {
      const a2 = Math.PI * (0.06 + k / 13.6);
      const sx = FX + Math.cos(a2) * 84, sy = FY + Math.sin(a2) * 28 + 5;
      const sw = 11 + fRng() * 9;
      E.daub(mid, counter, sx, sy + sw * 0.2, sw * 0.5, jig('#1d1a16', fRng, 5), fRng);
      E.daub(mid, counter, sx, sy, sw * 0.46, jig(ramp(['#5e5a54', '#7b766d', '#9a948a'], fRng()), fRng, 6), fRng);
      E.daub(mid, counter, sx - sw * 0.08, sy - sw * 0.16, sw * 0.24,
        jig(mix('#c9c2b4', '#ffd9a0', 0.5), fRng, 7), fRng);      // the firelit top of each stone
    }
    // 2 · THE SMOKE. A fire with nothing coming off it is a lamp. The column is the one
    // thing on this page that joins the ground to the sky, and it is what makes the flame
    // read as burning rather than glowing: warm and dense where the heat still holds it,
    // leaning off with the air, and gone before it reaches the stars. Natural thing, so it
    // curves (Munch) — and it is painted in the SKY's own dark so it thins into the night
    // instead of hanging there as a grey shape.
    {
      const sm = mulberry32(seed ^ 0x5a0c);
      // ⚠⚠⚠ `daub` HAS NO OPACITY ARGUMENT. Three attempts at thinning this smoke changed
      // nothing visible and I kept blaming the count and the radius: daub(out, counter, x,
      // y, r, fill, rng) ends there, so the seventh argument I was carefully tuning down to
      // 0.055 was thrown away and every mark was painted SOLID. That is the whole reason a
      // campfire had a thunderhead over it.
      //   Real transparency comes from `strokes({ op })`, and better still from COLOUR: a
      // wisp is the night sky with a little of the fire in it, so it is mixed against the
      // sky's own tones and can only ever be a shade off what is behind it.
      strokes(mid, counter, {
        rng: sm, n: 420,
        sample: r => {
          const t = Math.pow(r(), 0.9);
          const wob = Math.sin(t * 3.4 + 0.8) * 11;
          return [FX + 4 + t * 36 + wob + (r() - 0.5) * (18 + t * 104),
                  FY - 108 - t * 172];
        },
        dir: (x, y) => -Math.PI / 2 + (x - FX) / 150 + (fbm(x / 30, y / 26, 811) - 0.5) * 0.9,
        col: (x, y, r) => {
          const t = Math.max(0, Math.min(1, (FY - 108 - y) / 172));
          const warm = Math.max(0, 1 - t * 3.4);
          let c = ramp(['#3a3760', '#332f56', '#2b2a4c', '#232343'], t * 0.9 + r() * 0.2);
          return jig(mix(c, '#8a5c34', warm * 0.4), r, 5);
        },
        len: 13, lw: 5.0, steps: 2, lenJ: 0.7, relief: 0, impasto: 0, op: 0.16,
      });
    }
    // 3 · FIREFLIES out in the dark field — the only other living light, and small enough
    // that they never argue with the fire. They keep away from it (nothing shows next to a
    // flame) and thicken toward the hedge line, so they also read as distance.
    {
      const ff = mulberry32(seed ^ 0xf1ef);
      // ⚠ and their halo cannot be a faint daub either (same trap as the smoke above) — so
      // the glow is a COLOUR that is only a little above the dark it sits in, with one small
      // bright core on top. That is also nearer the truth: a firefly at thirty feet is a
      // spark, not a lamp.
      for (let i = 0; i < 34; i++) {
        const fx3 = -6 + ff() * 812, fy3 = horizon + 26 + Math.pow(ff(), 0.8) * 250;
        if (Math.hypot(fx3 - FX, (fy3 - FY) / 0.6) < 190) continue;   // not beside the flame
        // ⚠ AND NOT ON THE TENT OR THE WASHING LINE. One landed square on the line and
        // stopped being an insect: a small warm light hanging off a rope reads as a BULB,
        // and a bulb is a second lamp on a page that has one Light.
        if (fx3 > 470 && fx3 < 780 && fy3 > 220 && fy3 < 360) continue;
        const b3 = 0.45 + ff() * 0.55;
        E.daub(mid, counter, fx3, fy3, 2.4 + ff() * 1.2, jig(mix('#101c14', '#4a5620', 0.34), ff, 4), ff);
        E.daub(mid, counter, fx3, fy3, 0.9 + ff() * 0.4, jig(mix('#c8e06a', '#fbffd0', b3), ff, 4), ff);
      }
    }
    // ⚠⚠ THE FLAME, THE LOG AND THE EMBERS USED TO BE PAINTED HERE, AND ARE NOT ANY MORE.
    // Fred: "if you make family as bonfire, refer to garden. i like that fire." The garden's
    // fire is `drawBonfire` in engine/character.js — a RUNTIME sprite, and that is exactly
    // why he likes it: a fire is many TONGUES each rising and dying on its own clock, and a
    // baked one can only ever be a single frozen instant of that. It also already solves,
    // properly, the two things I had to learn the hard way here — that flame is many small
    // marks and never paths, and that a burning log is ONE subject painted from the fire's
    // own palette (his note: "fire+log does not equal fire+log but rather a burning flame
    // and a charred log") — so this page now asks for it instead of imitating it.
    //   What stays baked is everything the fire DOES to the place: the scorch above, the
    // ring of stones somebody set, and the heat lying on the grass below. Light baked,
    // flame alive — the same division garden.mjs settled on.
    //   The sprite is declared in engine/scene.js CRITTERS[24].
    // ⚠⚠ AND THE FAMILY HAS TO TOUCH THE GROUND. Five children sitting round a fire with
    // nothing under them float, and on a page whose one Light is that fire it is worse than
    // that: a real fire throws every shadow AWAY from itself, and having none at all quietly
    // says the fire is not lighting anybody. So each figure gets a contact shadow that
    // stretches outward from the flame — long and soft on the two at the edges, short under
    // the two nearest it. Daubs, never a soft ellipse of black: a gradient is a different
    // medium and reads as one. Positions are each actor's own (x, y) in CAST1[24].
    {
      const kRng = mulberry32(seed ^ 0x2f19);
      // ⚠ these are the RING's seats now (see CAST1[24]) — and the empty one at the near
      // right gets no shadow, because nobody is sitting in it. That gap is the reader's.
      for (const [ax, ay, aw] of [[250, 388, 24], [396, 388, 23], [170, 505, 39], [452, 505, 39]]) {
        const away = ax < FIRE.x ? -1 : 1;
        const reach = 1 + Math.min(1.6, Math.abs(ax - FIRE.x) / 190);
        for (let i = 0; i < 150; i++) {
          const a2 = kRng() * Math.PI * 2, d2 = Math.pow(kRng(), 0.55);
          const x = ax + Math.cos(a2) * aw * d2 * reach + away * aw * 0.5 * d2 * (reach - 0.6);
          const y = ay + Math.sin(a2) * aw * 0.3 * d2;
          const k = (1 - d2) * 0.62 + 0.12;
          E.daub(mid, counter, x, y, (0.9 + kRng() * 2.2) * (1.2 - d2 * 0.5),
            jig(mix('#3d5540', '#101c18', k), kRng, 5), kRng);
        }
      }
    }
    // ── 4b · WHAT A FIRE AT NIGHT ACTUALLY MAKES ──────────────────────────────
    // Fred: "make the whole thing more detailed please." Detail on a night page is not more
    // marks in the dark — nothing there is legible. It is the things the ONE LIGHT produces,
    // because those are the only things there is light to see. Four of them, all cheap:
    {
      const eRng = mulberry32(seed ^ 0x3e3b);
      // ⚠ RIM-LIGHT ON THE GRASS. A blade standing between you and a fire is dark down its
      // length with a thread of fire along the edge that faces it. This is the single detail
      // that makes a night field read as grass rather than as a dark wash, and it costs one
      // short stroke per blade — placed on the FIRE'S SIDE of each, which is why they all
      // lean their light the same way.
      for (let i = 0; i < 900; i++) {
        const a2 = eRng() * Math.PI * 2, d2 = 0.15 + Math.pow(eRng(), 0.55) * 0.85;
        const x = FIRE.x + Math.cos(a2) * 236 * d2;
        const y = FIRE.y + 10 + Math.sin(a2) * 84 * d2;
        if (y < 300 || y > 516) continue;
        const near = Math.max(0, 1 - Math.hypot(x - FIRE.x, (y - FIRE.y) / 0.36) / 236);
        if (near < 0.08) continue;
        const side = x < FIRE.x ? 1 : -1;                 // the lit edge faces the flame
        const hgt = (5 + eRng() * 11) * dS(y);
        paintPath(mid, counter, eRng, [[x, y], [x + side * hgt * 0.22, y - hgt]],
          (px, py, r) => jig(mix('#6d5a2a', '#ffd074', near * near * (0.35 + r() * 0.5)), r, 6),
          { lw: 0.9 * dS(y), len: 3, density: 0.85, jitter: 0.25 });
      }
      // ⚠ SPARKS. Small, few, and they must RISE — a spark that hangs is an ember and an
      // ember belongs on the ground. They thin and cool as they go, and the highest are
      // barely there, which is what stops them reading as confetti.
      for (let i = 0; i < 90; i++) {
        const t = Math.pow(eRng(), 1.5);
        const x = FIRE.x + (eRng() + eRng() - 1) * (16 + t * 54) + Math.sin(t * 5) * 6;
        const y = FIRE.y - 30 - t * 150;
        E.daub(mid, counter, x, y, (0.9 + eRng() * 1.5) * (1 - t * 0.6),
          jig(ramp(['#ffe6a8', '#ffb44e', '#e8722a', '#8a3d18'], t * 0.85 + eRng() * 0.2), eRng, 7),
          eRng, 0.9 - t * 0.65);
      }
      // ⚠ AND THE WOOD THEY ARE BURNING. A fire with no fuel beside it is a special effect;
      // a few split logs stacked at the edge of the light say somebody built this and will
      // feed it again. Lit hard on the fire side, lost on the other.
      for (let i = 0; i < 9; i++) {
        const lx = 214 + (i % 3) * 17 + (i > 5 ? 8 : 0);
        const ly = 470 - ((i / 3) | 0) * 9 + (eRng() - 0.5) * 3;
        const ln = 30 + eRng() * 18, ang = -0.06 + (eRng() - 0.5) * 0.24;
        const lit = Math.max(0, 1 - Math.hypot(lx - FIRE.x, (ly - FIRE.y) / 0.4) / 210);
        paintPath(mid, counter, eRng,
          [[lx - Math.cos(ang) * ln / 2, ly - Math.sin(ang) * ln / 2],
           [lx + Math.cos(ang) * ln / 2, ly + Math.sin(ang) * ln / 2]],
          (px, py, r) => {
            let c = ramp(['#241a14', '#3a2a1e', '#55402c', '#6f5638'], fbm(px / 9, py / 5, 471) + r() * 0.3);
            return jig(mix(c, '#ffc070', lit * lit * 0.55), r, 6);
          },
          { lw: 5 + eRng() * 3, len: 5, density: 1, jitter: 0.3 });
      }
      // the cut ends catch the light like little coins
      for (let i = 0; i < 9; i++) {
        const lx = 214 + (i % 3) * 17 + (i > 5 ? 8 : 0) + 16;
        const ly = 470 - ((i / 3) | 0) * 9;
        E.daub(mid, counter, lx, ly, 2.6, jig(mix('#c9a274', '#f6dca8', eRng()), eRng, 7), eRng, 0.8);
      }
    }
    // 5 · and the heat of it on the grass all round — the thing that lights the faces
    strokes(mid, counter, {
      rng: fRng, n: 700,
      sample: r => { const a2 = r() * Math.PI * 2, d2 = 0.25 + Math.pow(r(), 0.7) * 0.75;
                     const x = FX + Math.cos(a2) * 210 * d2, y = FY + 8 + Math.sin(a2) * 68 * d2;
                     return (y > 300 && y < 512) ? [x, y] : null; },
      dir: (x, y) => -Math.PI / 2 + (fbm(x / 12, y / 9, 407) - 0.5) * 1.2,
      col: (x, y, r) => {
        const near = Math.max(0, 1 - Math.hypot(x - FX, (y - FY - 8) / 0.32) / 210);
        return jig(mix('#3f6f42', '#ffd070', near * near * 0.85), r, 9);
      },
      len: 8, lw: 1.2, steps: 2, lenJ: 0.7, relief: 0, op: 0.5,
    });
    E.setManifold(_MF);
  }

  // ⚠ THE CAMP IS PAINTED AFTER THE FIRE'S GROUND. It used to sit above the fire block
  // and the kettle vanished: the trodden patch is 168 units across and gets laid down in
  // section 3, straight over the top of it. Anything standing ON the ground round the
  // fire has to be drawn after the ground is.

  /* ══ 2c · THE CAMP — the things people leave lying about ═════════════════
     Fred: "also add more details for this scene." A tent and a fire is a diagram of camping;
     what makes it a camp is the GEAR — the kettle somebody set on a stone, the wood split
     ready for later, boots off outside the flap, a pack dumped against the canvas, a line
     with the day's washing still on it. None of it is scenery: every one of these objects is
     evidence that four children arrived here, did things, and stopped for the night, which
     is the whole point of the page they are sitting on.
     ⚠ ALL OF IT IS MADE — so all of it is STRAIGHT (Munch), and none of it makes its own
     light. Each object is a dark shape with a firelit edge on the side facing the flame,
     which is the same rule the tent is built on and the reason they read as one place. */
  {
    const cRng = mulberry32(seed ^ 0xca77);
    const _MC = E.getManifold(); E.setManifold(0);
    const lit = (x, y) => Math.max(0, 1 - Math.hypot(x - FIRE.x, (y - FIRE.y) / 0.7) / 560);
    // ── THE KETTLE, set on a stone at the edge of the ring ───────────────────
    {
      const kx = 392, ky = 462, kr = 11;
      // the stone it stands on
      E.daub(mid, counter, kx, ky + 7, 9, jig('#221f1a', cRng, 5), cRng);
      E.daub(mid, counter, kx - 1, ky + 5, 7.5, jig(mix('#6a655c', '#a3958a', 0.4), cRng, 6), cRng);
      // the body — a squat iron pot, dark, with the flame down its left cheek
      strokes(mid, counter, {
        rng: cRng, n: 240,
        sample: r => { const a2 = r() * Math.PI * 2, d2 = Math.sqrt(r());
                       return [kx + Math.cos(a2) * kr * d2, ky - 3 + Math.sin(a2) * kr * 0.82 * d2]; },
        dir: (x, y) => Math.atan2(y - (ky - 3), x - kx) + Math.PI / 2,
        col: (x, y, r) => {
          const side = Math.max(0, (kx - x) / kr);           // 1 on the fire side
          let c = ramp(['#0c0d12', '#15171f', '#20232e'], r() * 0.8);
          return jig(mix(c, '#f0a84e', side * 0.62 * lit(x, y) + 0.04), r, 5);
        },
        len: 5, lw: 2.2, steps: 1, relief: 0.1, impasto: 0.2,
      });
      // the handle — an iron bail, straight-ish and thin (a made thing)
      paintPath(mid, counter, cRng, [[kx - kr + 1, ky - 6], [kx - 3, ky - kr - 7], [kx + kr - 1, ky - 7]],
        (x, y, r) => jig(mix('#0a0b10', '#8f7346', r() * 0.5 + lit(x, y) * 0.3), r, 4),
        { lw: 1.3, len: 3, density: 0.9, jitter: 0.3 });
      // the lid knob, and a thread of steam off it
      E.daub(mid, counter, kx + 1, ky - kr - 1, 1.9, jig('#2b2f3c', cRng, 5), cRng);
      // ⚠ the steam is COLOUR, not alpha — daub ignores an opacity argument (see the fire's
      // smoke). It starts a shade above the night and is the night again within a few marks.
      for (let i = 0; i < 14; i++) {
        const t = i / 13, yy = ky - kr - 4 - t * 24;
        E.daub(mid, counter, kx + 2 + Math.sin(t * 5.2) * 4 + t * 5, yy, 1.3 + t * 1.8,
          jig(mix(mix('#4a4f6a', '#1a1e30', t * 0.85), '#8a6a40', (1 - t) * 0.3), cRng, 4), cRng);
      }
    }

    // ── THE WOOD, split and stacked for later ────────────────────────────────
    {
      const wx = 522, wy = 464;
      for (let row = 0; row < 3; row++) {
        const n2 = 4 - row;
        for (let i = 0; i < n2; i++) {
          const lx = wx + (i - (n2 - 1) / 2) * 25 + (row % 2) * 6, ly = wy - row * 13;
          const half = 11 + cRng() * 3;
          // the log's body: a straight billet lying across (somebody stacked it)
          strokes(mid, counter, {
            rng: cRng, n: 34,
            sample: r => [lx + (r() - 0.5) * half * 2, ly + (r() - 0.5) * 11],
            dir: () => 0.02,
            col: (x, y, r) => jig(mix(ramp(['#150f0a', '#241a11', '#332517'], r()),
              '#c98a44', lit(x, y) * 0.5 * Math.max(0, 1 - Math.abs(y - ly + 4) / 7)), r, 5),
            len: 7, lw: 2.4, steps: 1, relief: 0.12, impasto: 0.25,
          });
          // the split face at the near end — pale sapwood, the one bright thing in the pile
          E.daub(mid, counter, lx - half, ly, 4.6, jig('#120d09', cRng, 4), cRng);
          E.daub(mid, counter, lx - half - 0.5, ly - 0.5, 3.6,
            jig(mix('#7c6a4e', '#e6c184', 0.35 + lit(lx, ly) * 0.5), cRng, 7), cRng);
        }
      }
    }

    // ── BOOTS OFF OUTSIDE THE FLAP, and a pack dumped against the canvas ─────
    // ⚠ THREE DARK DAUBS ARE A SMUDGE, NOT A BOOT. A boot is TWO shapes at right angles —
    // an upright shaft and a flat foot lying on the ground — and it is that L, not the
    // colour, that makes a child read it as a boot standing where somebody stepped out of
    // it. Straight, like everything else people make.
    for (const [bx, by, sgn] of [[549, 346, -1], [563, 349, 1]]) {
      const sh = 11;
      strokes(mid, counter, {                                   // the shaft, standing up
        rng: cRng, n: 46,
        sample: r => [bx + (r() - 0.5) * 7, by - sh + r() * sh],
        dir: () => Math.PI / 2,
        col: (x, y, r) => jig(mix('#0a0c13', '#7f5f34',
          lit(x, y) * 0.5 * Math.max(0, 1 - Math.abs(x - (bx - 3)) / 5)), r, 5),
        len: 5, lw: 2.2, steps: 1, relief: 0.1, impasto: 0.22,
      });
      strokes(mid, counter, {                                   // the foot, lying flat
        rng: cRng, n: 34,
        sample: r => [bx + sgn * (1 + r() * 8), by - 1.5 + (r() - 0.5) * 4],
        dir: () => 0.03,
        col: (x, y, r) => jig(mix('#080a10', '#6d5231', lit(x, y) * 0.42), r, 5),
        len: 5, lw: 2.4, steps: 1, relief: 0.1, impasto: 0.22,
      });
      E.daub(mid, counter, bx - 2, by - sh - 1, 2.2,            // the turned-over cuff
        jig(mix('#2b3145', '#a17b40', lit(bx, by) * 0.55), cRng, 5), cRng);
    }
    {
      const px2 = 622, py2 = 338;
      strokes(mid, counter, {
        rng: cRng, n: 210,
        sample: r => { const a2 = r() * Math.PI * 2, d2 = Math.sqrt(r());
                       return [px2 + Math.cos(a2) * 15 * d2, py2 + Math.sin(a2) * 17 * d2 - 4]; },
        dir: () => Math.PI / 2 + 0.1,
        col: (x, y, r) => jig(mix(ramp(['#171a26', '#22283a', '#2e3550'], r() * 0.9),
          '#b07f40', lit(x, y) * 0.55 + 0.03), r, 5),
        len: 6, lw: 2.4, steps: 1, relief: 0.12, impasto: 0.24,
      });
      // its straps — two straight lines down a soft shape, which is what says "pack"
      // ⚠ the straps used to run to py2+10, past the bottom of the sack, so they read as two
      // sticks poking out of a bag. A strap ends on the pack.
      for (const dx of [-6, 5])
        paintPath(mid, counter, cRng, [[px2 + dx, py2 - 17], [px2 + dx * 1.25, py2 + 4]],
          (x, y, r) => jig(mix('#080a10', '#6d5a34', lit(x, y) * 0.5), r, 4),
          { lw: 1.6, len: 3, density: 0.9, jitter: 0.3 });
      E.daub(mid, counter, px2 - 1, py2 - 20, 4.2, jig('#141826', cRng, 5), cRng);          // the roll on top
    }

    // ── A LINE FROM THE TENT TO THE TREE, with the day's washing still on it ─
    {
      const A = [572, 246], B = [494, 268];
      paintPath(mid, counter, cRng, [A, [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2 + 5], B],
        (x, y, r) => jig(mix('#2c3349', '#7e86a8', r() * 0.7), r, 4), { lw: 0.8, len: 3, density: 0.5, jitter: 0.3 });
      for (const [t, w2, h2] of [[0.34, 15, 22], [0.62, 12, 17]]) {
        const hx = A[0] + (B[0] - A[0]) * t, hy = A[1] + (B[1] - A[1]) * t + 5 * Math.sin(t * Math.PI);
        strokes(mid, counter, {
          rng: cRng, n: 120,
          sample: r => { const u = r();
                         return [hx + (r() - 0.5) * w2 * (0.7 + u * 0.5), hy + 1 + u * h2]; },
          dir: () => Math.PI / 2 + 0.06,
          col: (x, y, r) => jig(mix(ramp(['#1c2132', '#2a3149', '#3a4364'], r() * 0.9),
            '#c79a58', lit(x, y) * 0.5), r, 5),
          len: 6, lw: 2.0, steps: 1, relief: 0.08, impasto: 0.2,
        });
      }
    }
    E.setManifold(_MC);
  }



  // ---------------- 3b. (THE DOVES ARE GONE) ----------------
  // A pair of white doves used to sit on the crowns here, and one on the tree at the left.
  // Fred, Sep 1: "remove the ducks on the tree." They were right when this page was a bright
  // afternoon; on a night page three warm-white birds up in the dark were simply the second,
  // third and fourth brightest things in a picture whose sentence is "one Light" — the same
  // fault as the blossom and the day-palette tree. The rng they used is kept below, because
  // the dog still draws from it and re-rolling it would shift every mark after this point.
  const rngL = mulberry32(20260707);
  const midGroundEnd = mid.length;   // MID so far: trees + flowers + table + loaves + doves (UNDER the figures)

  // ---------------- 4. THE GATHERED FAMILY ----------------  [FG plane]
  // four figures drawn up around the table: the RED child ("you") nearest us,
  // and three friends each in their own colour. EVERYONE is washed and in the
  // Light, so EVERY figure gets a soft WHITE AURA (Rev 7:14). Each leans gently
  // toward the shared bread, faces glad and lifted.
  const figs = [
    // [feet x, feet y, scale, lean toward table, palette|null=red, seed]
    [400, 482, 1.00, 0.0, null, 91, 'open'],                                     // YOU — the red child, front & centre: arms spread in glad welcome
    [250, 462, 0.94, 0.40, ['#2c4e8c', '#1c356a', '#101f44'], 31, 'cheer'],     // blue, left — both arms thrown UP, laughing with joy
    [552, 464, 0.94, -0.40, ['#2c7a52', '#1c5638', '#0e3322'], 47, 'reach'],    // green, right — reaching IN to share the bread
    [322, 412, 0.82, 0.28, ['#7a4ab0', '#5a2f90', '#3a1c64'], 67, 'lift'],      // violet, behind-left — hands lifted to the Light in wonder
    [486, 410, 0.82, -0.28, ['#d2922e', '#b0701a', '#7a4c10'], 53, 'clasp'],    // amber, behind-right — hands together at the chest, tender
  ];
  // build figures back-to-front (farthest/highest first) so nearer overlap
  const order = [3, 4, 1, 2, 0];
  const built = {};
  for (const idx of order) {
    const [fx, feet, s, lean, pal, fseed, gesture] = figs[idx];
    const hx = fx + lean * 18;   // head shifts toward the table
    const toToward = Math.sign(tcx - fx) || 1;   // +1 if the table is to its right
    // PURE JOY — every one rejoicing: both arms flung OUT and UP, ELBOWS LOCKED
    // straight (the hands are placed well past full arm-reach, so the arms lock
    // out instead of bending). Faces lifted. A small per-figure variation in the
    // spread/height keeps them individuals, not five identical clones.
    const V = ({ open: [48, 176], cheer: [30, 188], reach: [42, 180], lift: [28, 186], clasp: [40, 178] })[gesture] || [40, 180];
    const P = {
      lean: lean * 9, headTilt: -lean * 4,                          // chest open, face lifted up
      leftHand: [fx - V[0] * s, feet - V[1] * s],                   // arms OUT & UP, straight — rejoicing
      rightHand: [fx + V[0] * s, feet - (V[1] - 3) * s],
      leftFoot: [fx - 9 * s, feet - 4], rightFoot: [fx + 9 * s, feet - 4],
    };
    // every figure is the little-pilgrim design now — each in its own cloak
    // colour, all washed (white aura), arms flung out and up, faces glad
    const mopts = {
      x: fx, y: feet, h: 130 * s, facing: toToward, lean: lean * 6,
      armL: [fx - V[0] * s, feet - (V[1] - 30) * s], armR: [fx + V[0] * s, feet - (V[1] - 33) * s],
      eye: [toToward * 0.4, -0.8], mood: 'joy', aura: Math.round(11 * s),
    };
    if (pal !== null) { mopts.cols = pal; mopts.maskCols = ['#ded8ca', '#c8c0ac', '#a89e84']; }
    E.paintMask(out, counter, rng, mopts);
    built[idx] = { fx, feet, s, lean, hx };
  }

  // (each pilgrim's mask carries its own glad face — no painted-over faces needed)

  // ---------------- 4b. LIFE — THE LITTLE DOG ----------------  [FG plane]
  // a small warm-brown dog sitting at the edge of the ring, looking in at the
  // circle — the household's least member also belongs at this table
  // (Mark 7:28, "yes, Lord: yet the dogs under the table eat of the
  // children's crumbs" — and here there is bread enough). Living thing →
  // curved strokes (Munch); one white chest splash + eye dot as the accent.
  {
    const gy = 494;                 // where it sits, in the open gap left of "you"
    // soft ground shadow first (the Light is central → shadow falls OUTWARD, left)
    out.push(ribbon([[296, gy + 2], [326, gy + 3]], 5, '#2e5224')); counter.n++;
    // tail curled round the haunch — a happy upward curve
    paintPath(out, counter, rngL, [[298, gy - 4], [293.5, gy - 10], [296.5, gy - 16]], (x, y, r) => jig('#54341a', r, 8), { lw: 3.6, len: 3.5, density: 0.95, jitter: 0.4 });
    // rear haunch — a round warm-brown mass
    paintPath(out, counter, rngL, [[301, gy - 9], [308, gy - 11], [312, gy - 9]], (x, y, r) => jig(mix('#8a5a2e', '#6e4420', r() * 0.5), r, 9), { lw: 13, len: 4, density: 0.95, jitter: 0.4 });
    // chest rising to the lifted head — it sits tall, watching the family
    paintPath(out, counter, rngL, [[308, gy - 12], [314, gy - 17], [317, gy - 22]], (x, y, r) => jig(mix('#96662f', '#7a4c24', r() * 0.5), r, 9), { lw: 9, len: 4, density: 0.95, jitter: 0.4 });
    // white chest splash — the one bright accent
    out.push(ribbon([[314, gy - 14], [316, gy - 18]], 3.6, '#f4e6c8')); counter.n++;
    // head, tipped up toward the circle
    paintPath(out, counter, rngL, [[317, gy - 25], [321, gy - 26.5], [325, gy - 25]], (x, y, r) => jig(mix('#96662f', '#7a4c24', r() * 0.4), r, 8), { lw: 8.5, len: 3.5, density: 0.95, jitter: 0.35 });
    // muzzle nub + dark nose, pointed IN at the gathering
    out.push(ribbon([[325, gy - 24.5], [329, gy - 23.5]], 4, '#7a4c24')); counter.n++;
    out.push(ribbon([[329, gy - 23.8], [330.5, gy - 23.4]], 2, '#2e1c0c')); counter.n++;
    // a soft floppy ear, darker
    out.push(ribbon([[317, gy - 29], [314.5, gy - 23]], 3.2, '#54341a')); counter.n++;
    // bright glad eye — looking in
    out.push(ribbon([[322, gy - 26], [323.2, gy - 25.8]], 1.6, '#241608')); counter.n++;
    // two small front legs planted — darker, so they hold against the meadow
    paintPath(out, counter, rngL, [[315, gy - 11], [314.5, gy - 2]], (x, y, r) => jig('#5a3618', r, 7), { lw: 3.2, len: 3, density: 0.95, jitter: 0.3 });
    paintPath(out, counter, rngL, [[320, gy - 10], [320.5, gy - 2]], (x, y, r) => jig('#4e3014', r, 7), { lw: 3.2, len: 3, density: 0.95, jitter: 0.3 });
    // warm gold rim where the central Light catches its face and chest
    out.push(ribbon([[318, gy - 28.5], [324, gy - 27.5]], 1.8, mix(GOLD_PALE, '#fff6dc', 0.4))); counter.n++;
  }

  // ---------------- 5. EASTER EGG — Acts 2:42 in Koine Greek ----------------
  // "and they continued stedfastly... in fellowship, and in breaking of bread"
  // cut faint into the bright floor beneath the gathered family.  [MID plane]
  E.inscriptionText(mid, E.greekRef(2, 42), { x: 158, y: 470, h: 14, body: '#2c4a1e', edge: '#f6f4d6', op: 0.5, edgeOp: 0.42 });

  const ALT = 'Night in a field, camped. Four children sit in a ring on the grass round a low fire, the near side of the ring left open so the fire is between us and them and there is a place for the reader. One child, seen from behind in a red hood, sits at the near edge. Across the fire a child in blue tears a loaf and holds half of it out; a child in yellow reaches for it with both hands cupped; a child in green laughs beside them. The fire is the only light: it lights every face, throws their shadows outward, and glows warm on the near side of a canvas ridge tent pitched behind them, its mouth open and dark. Split logs lie ready at the edge of the light. Beyond, the field goes dark under a deep night sky full of stars.';

  // MULTIPLANE: assemble the requested depth plane (transparent where empty).
  // `out` holds the BG ground (0..bgEnd) then the FG family (bgEnd..).
  // `mid` holds the flourishing place: midGroundEnd splits the trees+flowers+table
  // +loaves (under the figures) from the inscription (over the floor).
  const RAW = { undercoat: 0, weave: 0, varnish: 0, oil: 0 };
  if (LAYER === 'bg') return svgWrap(ALT, out.slice(0, bgEnd).join('\n'), RAW);            // bright sky + meadow (opaque)
  if (LAYER === 'mid') return svgWrap(ALT, mid.join('\n'), RAW);                            // trees + flowers + table + loaves + inscription
  if (LAYER === 'fg') return svgWrap(ALT, out.slice(bgEnd).join('\n'), RAW);                // the gathered family
  // full painting (desktop): sky+meadow, trees+flowers+table, the family, then
  // the inscription on the floor — the ORIGINAL paint order, unchanged.
  return svgWrap(ALT, out.slice(0, bgEnd)
    .concat(mid.slice(0, midGroundEnd), out.slice(bgEnd), mid.slice(midGroundEnd))
    .join('\n'));
}
