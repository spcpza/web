// gen/plates/twoways.mjs — "Carried home"
// §23 — "And Love carried you home through the door." (Luke 15:24)
//
//   "And when he hath found it, he layeth it on his shoulders, rejoicing."
//                                                            — Luke 15:5
//
// This is the very next beat after RAN (13): the same radiant gold Father who
// ran the whole field to you, arms flung wide, now CARRIES you the rest of the
// way home — on his shoulders, rejoicing — straight through the one glowing
// door of his blazing house. You (the small dark child of page 13) ride high,
// arms up. The world is the full bright new creation: a swirling dawn sky, a
// flourishing green meadow loud with wildflowers, sheep in the pasture
// (Luke 15 — the ninety-and-nine and the one carried home). Through the open
// door: not a dark room but a whole world of colour. You were lost in the dark;
// now you are home in the Light.

export const name = 'twoways';
export const title = 'Carried home';
export const caption = 'Love carried you home.';
export const seed = 23061533;
export const focal = { x: 401, y: 286 }; // portrait window: the glowing door + the carried child
// MOBILE 3D — depth planes (FAR→NEAR): the swirling new-world sky behind; birds,
// cypress + an organic horizon fringe on the far plane; the meadow, the path and
// the blazing house in the middle (the house base is below the horizon, so it
// stays grounded); the framing fruit-trees nearer; the carried Father + child
// closest of all.
// the stacked SKY-SWIRL SHEETS — bold, GAPPED passes of the turning eddies +
// bright cloud ribbons (PAINT ON PAINT, like the covers), each its own depth
// plane with its own rng, so their gaps reveal the smooth sky ground beneath.
// ⭐ DETAIL PASS (Sep 8): finer sheets, every stroke its own width and length (free hashes,
// no rule — see widthOf/lengthOf in paint()); and every drawing of the ring is a DIFFERENT
// PAINTING of the sky (the sheet rng is salted by the frame, displacement 0) — Fred: "i want
// it to all be different art", never the same marks nudged.
export const SKY_SHEETS = [
  { n: 900, len: 25, lw: 3.0, lift: 0.00 },
  { n: 960, len: 22, lw: 2.7, lift: 0.07 },
];
export const layers = [
  { name: 'sky', opaque: true },  // smooth sky ground (backmost, opaque)
  ...SKY_SHEETS.map((_, i) => ({ name: 'sky' + (i + 1) })),   // stacked sky-swirl sheets
  { name: 'far' },                // distant rolling hills, birds, cypress
  { name: 'mid' },                // meadow, path, the blazing house + door, sheep, PLANTED fruit-trees
  { name: 'fg' },                 // the carried Father + child
];

export function paint(E, opts = {}) {
  const {
    mulberry32, fbm, curlV, goldenSpiralV, mix, ramp, jig, strokes, rej,
    paintFigure, radiantHalo, paintLight, paintPath, dirtRoad, inCap, underpaintCapsules, paintChild, castShadow, personCaps, lightRadial,
    limbs, spreadTips, gAt,
    svgWrap, R1, W, H,
    GOLD, GOLD_PALE, GOLD_DEEP, GOLD_HOT, NIGHT, DARKEST,
  } = E;

  const rng = mulberry32(seed);
  const out = [];
  const counter = { n: 0 };
  // MOBILE 3D LAYERS: tag ranges per band; MID = meadow + house (everything
  // unclaimed below the sky).
  const LAYER = opts.layer || 'full';
  const farRanges = [], fgRanges = [];
  // ⭐ EVERY STROKE DRAWS ITS OWN WIDTH AND LENGTH (Fred: "use no rules, a paint stroke
  // just exist because it exist") — two independent hashes per mark, no field, no coupling.
  const free = (x, y, salt) => { const n = Math.sin(x * 12.9898 + y * 78.233 + salt) * 43758.5453; return n - Math.floor(n); };
  const widthOf  = (x, y, salt) => 0.40 + 3.2 * Math.pow(free(x, y, salt), 2.6);
  const lengthOf = (x, y, salt) => 0.40 + 1.5 * Math.pow(free(x, y, salt + 17), 1.5);
  const FR = (globalThis.__FRAME | 0);   // which drawing of the ring this is
  // POST-RESURRECTION: the full bright new world. Light background; YOU (the
  // carried child) are the one dark form, lifted into the Light.
  out.push(`<rect width="${W}" height="${H}" fill="#6ecaf7"/>`);

  /* ---------------- geometry ---------------- */
  const horizon = 250;
  // SCALE GRADIENT — a mark at your feet is far bigger than a mark at the horizon.
  // Drawn all one size, ground reads as a flat green shape however good the colour
  // is; sized by depth it reads as ground going away from you.
  const dS = y => 0.32 + 1.0 * Math.max(0, Math.min(1, (y - horizon) / (H - horizon)));
  // the home, dead centre — the Father's house, which always BLAZES (Rev 21:23)
  // THE FATHER'S HOUSE, at its true size. It was drawn ~130px tall standing 2.39x
  // further off than the carried figure — which works out to a building under three
  // people tall: a cottage, not the City the whole book walks toward. Scaled about
  // its own ground line so it now reads ~6x a person (Rev 21) and its towers reach
  // the upper sky, while the figure arriving in the foreground stays where it was.
  const house = { x: 401, top: 131, base: 322, hw: 131, peak: 46 };
  // THE GATE MUST BE THE PALACE'S OWN GATE. paintPalace draws its opening as
  // 44*s wide, from baseY up to baseY-128*s. The door frame, the world-of-colour
  // fill and the easter egg here are all drawn from these constants — so if they
  // are guessed instead of derived, the colours spill outside the opening they are
  // supposed to be seen through. Derive them from the same scale the palace uses.
  const PAL_S = 1.27;                                  // the palace's scale (see paintPalace below)
  const door = { x: 401, y0: 322 - 128 * PAL_S, y1: 322, w: 44 * PAL_S };
  const dc = [door.x, (door.y0 + door.y1) / 2 + 8];               // the one light, low in the doorway
  const gD = lightRadial(dc[0], dc[1], 144);   // hug the door so the carried figure reads on green
  // ⚠ THE GLOW LAW (see gen/engine.mjs). Fred's artist friend, on why nothing in this book
  // sparkles: "when you want to make other colors glow in the picture, it's a good idea to
  // make the SURROUNDING colors feel a bit darker." His sheet adds the other half — the
  // surroundings lose SATURATION too. So this page names its light, and every mark away from
  // the door gives up colour and value in proportion. The door is then the only vivid thing
  // in the picture, which is the only way it can blaze.
  const gGlow = lightRadial(dc[0], dc[1], 430);          // a wider reach than the door's own
  E.setGlowLaw({ lightFn: gGlow, desat: 0.5, darken: 0.22, curve: 1.5 });

  // the path home: curving up from the near foreground to the door's foot
  // ⚠ THE ROAD RUNS STRAIGHT AT THE DOOR. Fred, crossing out the wedge it threw at the
  // bottom-left: "make the path straighter. lets dont do this curved thing."
  // The wedge was not a bug in the width — it was the SHAPE. A road whose near centre
  // (300) sits well left of its far centre (401) leans as it climbs, so its two edges get
  // completely different slopes: the left edge swung 244 units across the plate while the
  // right moved 42. That difference IS the wedge, and no amount of re-widening removes it.
  // A road arriving at a door is a straight trapezoid converging ON that door. So the near
  // centre is now the door's own x: both edges are straight lines to the gate, symmetric,
  // no lean and no sine. The Light stands left of its centre line, which is simply where
  // he walks — he is on the road, not on its axis.
  const near = [door.x, 508], far = [door.x, door.y1 + 2];
  // ⚠ STRAIGHT-ISH. Fred: "why is the road look like this, just make it straight-ish".
  // The old sine threw 20 units of lateral wander into a road only ~90 wide at mid-depth,
  // so it visibly snaked instead of running home. 7 units over a gentler period keeps it
  // hand-drawn without wobbling — a made thing, and made things in this book take the
  // straight lines (Munch's law); it is the LIVING things that curve.
  const roadP = t => [near[0] + (far[0] - near[0]) * t, near[1] + (far[1] - near[1]) * t];
  // ⚠ WIDER AT THE NEAR END. Fred: "fix the road so it is wider since it is on a closer
  // perspective." t runs 0 at our feet to 1 at the door, so the near width is the constant
  // plus the whole squared term: it was 8 + 72 = 80 units at the bottom of the plate, which
  // is narrower than the Light carrying the child is tall. A road arriving at the viewer
  // should open out. 12 + 130 = 142 near, still closing to 12 at the gate, so the
  // perspective run is steeper as well as wider.
  // ⚠ WIDER AGAIN, AND THIS TIME OFF FRED'S OWN DRAWN EDGES. He drew the two sides he
  // wants: at the bottom of the plate they run out to roughly x 155 and x 460 — about 300
  // units across. It was 12 + 130 = 142 at the near end (and 80 before that), so the path
  // arrived as a track rather than as the broad way home opening at the reader's feet.
  // t is 0 at our feet and 1 at the gate, so the near width is the whole expression at
  // t=0: 14 + 320 = 334, closing to 14 at the door. The squared falloff keeps the
  // perspective run steep, which is what makes the width read as NEARNESS rather than as
  // a wide road drawn small.
  // ⚠ LINEAR, not squared. A squared falloff bulges the road out near the viewer and then
  // pinches it — which is what put a kink in each edge and made the near end read as a
  // flare stuck on the end of a path. True perspective is linear in depth, so a straight
  // road's edges are STRAIGHT LINES to the vanishing point. This one taper is the whole
  // difference between a road and a funnel.
  const roadW = t => 14 + 266 * (1 - t);   // 314 at our feet → 14 at the gate; spans x 143..457 at the bottom, which is the width Fred drew
  const roadInfo = (x, y) => { let bt = 0, bd = 1e9; for (let t = 0; t <= 1.001; t += 0.035) { const p = roadP(t); const d = Math.hypot(x - p[0], y - p[1]); if (d < bd) { bd = d; bt = t; } } return { t: bt, d: bd }; };
  const onRoad = (x, y) => { const { t, d } = roadInfo(x, y); return d < roadW(t) / 2; };
  // ⚠ A RULED HORIZON IS THE ROUGHEST THING ON A PAGE. Fred: "i still see a straight line
  // for the horizon, very rough." It was a 4-unit sine — effectively a straight edge where a
  // green RECTANGLE met the sky, and no amount of grass on top hides a ruled seam. `ran` has
  // had the answer all along: `ridge()` gives a rolling land-edge, the ground is filled as a
  // PATH that follows it, and the fringe and the wood then grow out of that same edge.
  const groundTop = E.ridge(horizon, { amp: 17, freq: 168, bumps: 0.5, seed: 613 });
  // ⚠ A GLORY PAGE WITH NO DARK IN IT READS AS PASTEL PORRIDGE. Everything here was mid-to-
  // light — pale sky, pale gold house, pale flowered meadow — so nothing could be bright,
  // the path vanished, and the Father carrying the child (the whole point) could not be
  // found at all. Bright only reads against dark. `focus` is the page's value plan: 1 at the
  // door, falling away to the corners, and every ground pass deepens by how far it stands
  // from it. The light stays where the meaning is.
  const focus = (x, y) => Math.max(0, Math.min(1,
    1.06 - Math.hypot((x - 401) / 430, (y - 330) / 320)));
  const DEEP_G = '#123526';
  // ⚠ DEPTH IS THREE THINGS, AND THIS PAGE HAD NONE OF THEM.
  //  1 AIR — distance pales and COOLS everything toward the sky it is seen through, so the
  //    far meadow must never be the same green as the near one;
  //  2 A DARK FOREGROUND — the near grass is out of the light and frames the picture
  //    (repoussoir); bright middle distance only reads because the front is deep;
  //  3 CAST SHADOWS — a ground plane is proved by the shadows lying ON it. Without them
  //    every tree is a sticker and the field is a wall.
  const airY = (y) => Math.max(0, Math.min(1, 1 - (y - horizon) / 82));
  const nearY = (y) => Math.max(0, Math.min(1, (y - 396) / 116));
  const AIR = '#c6d6cc';
  const depthMix = (c, x, y) => {
    // ⚠ but the glory BURNS THROUGH the air. Hazing by distance alone paled the ground right
    // at the gate — exactly where the light should be strongest — so the haze yields where
    // the door's light falls. Air in the distance, fire at the centre.
    c = mix(c, AIR, Math.pow(airY(y), 1.7) * 0.44 * (1 - gD(x, y) * 0.75));
    c = mix(c, DEEP_G, nearY(y) * 0.5 * (1 - gD(x, y) * 0.5));   // the near field is out of the light
    return c;
  };
  // ⚠ NOTHING MAY BE PAINTED OVER THE CARRIED PAIR. The Father is painted in section 6, but
  // sections 7 and 8 — the background life and the celebration blooms — sweep the WHOLE
  // meadow afterwards, so several hundred pale flower strokes landed on top of him and he
  // washed out to a ghost. Isolating his plane is what showed it: he was perfectly legible
  // there and invisible on the plate. The meadow now keeps clear of him, the way it keeps
  // clear of the road.
  const _fp = [210 + (401 - 210) * 0.46 + Math.sin(0.46 * 3.0) * 20 * 0.54, 508 + (326 - 508) * 0.46];
  const FIGX = _fp[0] + 34, FIGY = _fp[1] - 1;
  const onFigure = (x, y) => Math.hypot((x - FIGX) / 52, (y - (FIGY - 68)) / 96) < 1;


  /* ---------------- 1. SKY — the new morning, ALIVE at three scales (the book's hand) ----------------
     the sky is nature, so it swirls — but not as scattered knots: it is DEEP MOVING
     WATER. ONE great wheel organises the whole dawn (macro, centred over the blazing
     home so the sky wheels around the meaning), a few eddies turn inside it (mid),
     and every stroke curves with its parent current (micro). Swirls within swirls. */
  const WHEEL = { x: 401, y: 210 };   // the great wheel's centre — just over the home, the sky turns around the door
  const EDDIES = [[150, 70, -60], [640, 90, 58], [470, 150, -50], [280, 150, 46]];   // 4 eddies spread across the dawn
  const nearSK = (x, y) => { let m = 1e9; for (const [ex, ey] of EDDIES) m = Math.min(m, Math.hypot(x - ex, y - ey) / 70); return m; };
  const skyDir = (x, y) => {
    let vx = 0, vy = 0;
    { const [a, b] = goldenSpiralV(x, y, WHEEL.x, WHEEL.y, 115, 260); vx += a; vy += b; }   // MACRO — the great wheel of the dawn
    for (const [ex, ey, s] of EDDIES) { const [a, b] = goldenSpiralV(x, y, ex, ey, s, 80); vx += a; vy += b; }   // MID — eddies turning inside the wheel
    const [c, d] = curlV(x, y, 31, 120); vx += c * 26; vy += d * 26;   // MICRO — fine turbulence so each stroke curves with its current
    return Math.atan2(vy, vx);
  };
  // jewel eddy-glows in DAWN tints (gold / rose / violet / teal) — the cores breathe
  // faint colour, the alive richness; kept subtle so the light-blue star still reads
  const EGLOW = [[150, 70, '#f0c06a'], [640, 90, '#e78ab0'], [470, 150, '#8a7ccb'], [280, 150, '#5fb8c8']];
  const skyCol = (x, y, r, lift) => {
    // VIBRANT light-blue homecoming sky (the star), warm gold+pink low at the
    // horizon, white at the crown, the home's gold glow warming it near the door
    const t = Math.max(0, Math.min(1, (horizon - y) / horizon * 1.05 + fbm(x / 120, y / 120, 17) * 0.3 - 0.04));
    let c = ramp(['#fbd24e', '#f8a4c2', '#54c6f7', '#74cef8', '#a6e2fb', '#f0fbff'], t);
    for (const [ex, ey, ec] of EGLOW) { const d2 = Math.hypot(x - ex, y - ey); c = mix(c, ec, Math.exp(-d2 / 95) * 0.42); }   // the eddy cores breathe faint jewel light
    c = mix(c, '#fff2d2', gD(x, y) * 0.4);   // the home's warmth wins near the door
    if (lift) c = mix(c, '#ffffff', lift);
    return jig(c, r, 6);
  };
  // the smooth sky GROUND — broad soft masses (opaque base); the swirling
  // brushwork lives in the stacked sheets above, so their gaps reveal paint
  strokes(out, counter, {
    rng, n: 1300,
    sample: rej(-10, -10, 810, horizon + 6),
    dir: skyDir,
    col: (x, y, r) => skyCol(x, y, r, 0),
    len: (x, y) => 30 * lengthOf(x, y, 11), lw: (x, y) => 4.6 * widthOf(x, y, 13), steps: 4, follow: 0.91, wild: 0.05, lenJ: 0.3, wJ: 0.3, impasto: 0.5, relief: 0.4,   // ⚠ relief was the default 1 — slabs
    aJ: (x, y) => 0.16 + Math.max(0, 1.3 - nearSK(x, y)) * 0.42 + gD(x, y) * 0.2,
  });
  const skyEnd = out.length;   // the smooth sky ground is the SKY plane (opaque)
  // the stacked SKY-SWIRL SHEETS — each an independent bold, gapped pass of the
  // turning eddies + bright cloud ribbons (paint on paint), own rng per sheet.
  const skySheets = SKY_SHEETS.map((e, k) => {
    // ⚠ softer, with intent (Fred): the SAME sheet in every drawing; what travels is a swell
    // going ROUND the great wheel (length swells with a phase set by the angle around it),
    // so across the ring the sky turns — one motion, no churn.
    const srng = mulberry32(seed + 1009 * (k + 1));
    const _NFw = Math.max(1, globalThis.__FRAME_N || 6), _PHw = FR / _NFw;
    const turn = (x, y) => 1 + 0.15 * Math.cos(2 * Math.PI * (_PHw - Math.atan2(y - WHEEL.y, x - WHEEL.x) / (2 * Math.PI)));
    const sh = [];
    strokes(sh, { n: 0 }, {
      rng: srng, n: e.n,
      sample: rej(-10, -10, 810, horizon + 6),
      dir: skyDir,
      col: (x, y, r) => {
        const near = nearSK(x, y);
        if (near < 1.1 && r() < 0.06) return jig(r() < 0.5 ? '#fffdf6' : '#f79ac6', r, 12); // joy sparks at the knots
        const k2 = fbm(x / 100, y / 100, 19) + (r() - 0.5) * 0.2;
        if (k2 > 0.68) return jig('#fffdf6', r, 8);   // bright cloud-ribbon crests
        return skyCol(x, y, r, e.lift);
      },
      len: (x, y) => e.len * lengthOf(x, y, 21 + k) * turn(x, y), lw: (x, y) => e.lw * widthOf(x, y, 27 + k),
      steps: 5, follow: 0.91, wild: 0.12, lenJ: 0.3, wJ: 0.3, impasto: 0.6, relief: 0.4,
    });
    return sh.join('\n');
  });

  /* ---------------- 2. MEADOW — flourishing green, the home's garden ---------------- */
  {   // the ground is a shape with a rolling top edge, not a rectangle
    let dg = `M-4 ${R1(H + 6)}L-4 ${R1(groundTop(-4))}`;
    for (let gx = -4; gx <= W + 4; gx += 5) dg += `L${R1(gx)} ${R1(groundTop(gx))}`;
    dg += `L${R1(W + 4)} ${R1(H + 6)}Z`;
    out.push(`<path d="${dg}" fill="#477e38"/>`); counter.n++;
  }
  const GREEN = ['#3a7a38', '#5e9a40', '#88b84a', '#bcc850', '#dcd49c'];
  // ══ THE FIELD — ONE RULE, FOUR SCALES ══════════════════════════════════════════════
  // Fred: "it never should be a patch, we are working for the lord. we have to give the
  // best always. we use the fractal framework to get the best result."
  //
  // Every version of this meadow before now was a stack of flat passes: scatter N marks
  // over the whole field, scatter N more on top. Uniform noise at one frequency, which is
  // exactly why it read as fuzz however much weight I gave the strokes. A real field has
  // structure at EVERY scale — the land divides into fields, fields into patches, patches
  // into clumps, clumps into blades — and each division inherits its parent's character
  // while taking its own. That is the same law as the branches and the snowflakes: ONE
  // rule applied to its own output, each level asking its own node in the chain.
  //
  // So the meadow is not painted. It is GROWN, by recursive subdivision, and no two of its
  // regions, patches or clumps are alike, while all of them obey the one hand.
  const swell = (x, y) => fbm(x / 190, y / 150, 613);
  const growField = (N, x0, y0, x1, y1, depth) => {
    if (depth === 0) return leafClump(N, x0, y0, x1, y1);
    const wide = (x1 - x0) > (y1 - y0) * 1.7;                        // split the longer way
    const n = 2 + Math.round(N.trait('split', 0, 1.9));
    for (let i = 0; i < n; i++) {
      const C = N.child('r' + i);
      const a = (i + C.swing('edge', 0.22)) / n, b = (i + 1 + C.swing('edge2', 0.22)) / n;
      const aa = Math.max(0, Math.min(1, a)), bb = Math.max(0, Math.min(1, b));
      if (bb <= aa) continue;
      if (wide) growField(C, x0 + (x1 - x0) * aa, y0, x0 + (x1 - x0) * bb, y1, depth - 1);
      else       growField(C, x0, y0 + (y1 - y0) * aa, x1, y0 + (y1 - y0) * bb, depth - 1);
    }
  };
  // the leaf of the recursion: one patch of grass, with its OWN character
  const leafClump = (N, x0, y0, x1, y1) => {
    const w = x1 - x0, h2 = y1 - y0;
    if (w < 2 || h2 < 2) return;
    const P = {
      dens:  N.trait('dens', 0.55, 1.6),          // thin .. thick
      len:   N.trait('len', 0.72, 1.5),           // cropped .. long
      lean:  N.swing('lean', 0.5),                // which way this patch is combed
      hue:   N.swing('hue', 0.5),                 // its own cast, inside the field's greens
      lift:  N.trait('lift', 0, 1),               // how much of the light it catches
      bare:  N.chance('bare', 0.09),              // a worn patch, on purpose
    };
    if (P.bare) return;
    const cy = (y0 + y1) / 2;
    const n = Math.max(4, Math.round(w * h2 * 0.02 * P.dens * (0.5 + dS(cy))));
    strokes(out, counter, {
      rng, n,
      sample: rej(x0, y0, x1, y1, (x, y) => y > groundTop(x) + 1 && !onRoad(x, y) && !onFigure(x, y)),
      dir: (x, y) => -Math.PI / 2 + P.lean * 0.5 + (fbm(x / 8, y / 7, 743) - 0.5) * 0.7,
      col: (x, y, r) => {
        const g = gD(x, y), depth = (y - horizon) / (H - horizon);
        let c = ramp(GREEN, 0.1 + swell(x, y) * 0.5 + depth * 0.3 + P.hue * 0.22 + r() * 0.3);
        c = mix(c, '#fbf0b4', Math.pow(r(), 2) * 0.42 * P.lift + g * 0.4);      // lit tips
        c = mix(c, '#1a3c2c', (1 - r()) * 0.24);                                // deep roots
        c = mix(c, DEEP_G, (1 - focus(x, y)) * 0.44);
        return jig(depthMix(c, x, y), r, 11);
      },
      len: (x, y) => (7 + 15 * P.len) * dS(y), lw: (x, y) => (1.8 + 1.9 * P.len) * dS(y),
      steps: 2, lenJ: 0.62, impasto: 0.6,
    });
  };
  // 1 · the FORM under it all — broad bodies of value, so the land is modelled before combed
  strokes(out, counter, {
    rng, n: 820,
    sample: rej(-10, horizon - 22, 810, 512, (x, y) => y > groundTop(x) - 1 && !onRoad(x, y)),
    dir: (x, y) => { const [vx, vy] = curlV(x, y, 351, 130); return Math.atan2(vy * 0.45, Math.abs(vx) + 1); },
    col: (x, y, r) => {
      const g = gD(x, y), depth = (y - horizon) / (H - horizon);
      let c = ramp(GREEN, 0.04 + swell(x, y) * 0.72 + depth * 0.3);
      c = mix(c, '#f4e2a6', g * 0.4);
      c = mix(c, '#1d4433', (1 - g) * 0.34 * (1 - depth * 0.5));
      c = mix(c, DEEP_G, (1 - focus(x, y)) * 0.5);
      return jig(depthMix(c, x, y), r, 9);
    },
    len: (x, y) => 40 * dS(y), lw: (x, y) => 11 * dS(y), steps: 3, lenJ: 0.4, impasto: 0.6, op: 0.95,
  });
  // 2 · then GROW the field on top of it — five levels of division, from the whole meadow
  //     down to a handful of blades, every level its own node in the chain
  growField(gAt('field', 0, 0).child('meadow'), -12, horizon - 6, 812, 516, 5);

  // (iv) FLOWER COLONIES — flowers grow in colonies, and an even sprinkle averages to grey
  {
    const fRng = mulberry32(seed ^ 0x7f4a7c15);
    const FCOL = ['#fdfbf0', '#f7d8e8', '#e8e2f8', '#fce9ad', '#f6c9d6'];
    for (let c = 0; c < 6; c++) {
      const cx0 = -10 + fRng() * 820, cy0 = horizon + 10 + Math.pow(fRng(), 0.75) * (508 - horizon);
      if (onRoad(cx0, cy0)) continue;
      const rad = 14 + fRng() * 30, col = FCOL[(fRng() * FCOL.length) | 0], n = 6 + Math.round(fRng() * 12);
      for (let k = 0; k < n; k++) {
        const a = fRng() * 6.2832, dd = Math.pow(fRng(), 0.6);
        const fx = cx0 + Math.cos(a) * rad * dd, fy = cy0 + Math.sin(a) * rad * dd * 0.5;
        if (onRoad(fx, fy) || fy < horizon + 6) continue;
        const fr = (1.1 + fRng() * 1.5) * dS(fy) * 1.6;
        // ⚠ flowers out in the dark are not white — they take the value of the land they
        // stand in, or the meadow reads as scattered confetti instead of a lit field.
        const fo = 0.34 + focus(fx, fy) * 0.6;
        out.push(`<ellipse cx="${R1(fx)}" cy="${R1(fy)}" rx="${R1(fr)}" ry="${R1(fr * 0.78)}" fill="${col}" opacity="${fo.toFixed(2)}"/>`); counter.n++;
      }
    }
  }

  // ══ 2b. THE GRASS ITSELF — FOUR SCALES OF BLADE ════════════════════════════════════
  // ⚠ THE FIELD HAD FORM BUT NO BLADES. Fred, comparing this page with gift: "where are
  // the details on the grassy terrain? 'gift' is looking at the page with a tear in its
  // eye." He was right and it is measurable: gift lays 4200 + 3000 + 2600 marks plus 120
  // tufts over its sward — about 11,500 — and this page's whole meadow was 820. Cropping
  // the same patch of both plates side by side, gift is full of standing blades and this
  // one was a smooth green wash.
  // The recursive field above gives the ground its FORM (that part was already right and
  // stays); what was missing is the drawing on top of it. Detail cannot substitute for
  // form — but form without detail is a painted tablecloth.
  // Four layers, because grass is not one thing: the body of the sward, blades standing
  // up out of it, the finest nap nearest us, and clumps — because grass grows in tufts.
  {
    const GRASSC = ['#2f6a2e', '#3a7433', '#4f8c3c', '#6aa447', '#8bbc57', '#aed073'];
    const grassCol = (x, y, r, lift) => {
      const depth = Math.max(0, Math.min(1, (y - horizon) / (H - horizon)));
      let c = ramp(GRASSC, fbm(x / 46, y / 30, 93) * 0.5 + depth * 0.24 + swell(x, y) * 0.34 + lift);
      const sh = 1 - gGlow(x, y);                       // away from the door it deepens
      if (sh > 0.4 && r() < 0.2 + sh * 0.3) c = mix(c, '#37543e', 0.22 + sh * 0.3);
      c = mix(c, '#fff0c8', gD(x, y) * 0.42);           // and the door's own light warms it
      return jig(c, r, 12);
    };
    const free = (x, y) => y > groundTop(x) - 1 && !onRoad(x, y);
    strokes(out, counter, {                                  // 1 · the body of the sward
      rng, n: 4200,
      sample: rej(-10, horizon - 14, 810, 512, free),
      dir: (x, y) => -Math.PI / 2 + (fbm(x / 30, y / 20, 97) - 0.5) * 0.7,
      col: (x, y, r) => grassCol(x, y, r, 0.06),
      len: (x, y) => 7 * dS(y), lw: (x, y) => 1.9 * dS(y), steps: 2, lenJ: 0.7, impasto: 0.5, relief: 0.3,
    });
    strokes(out, counter, {                                  // 2 · blades that STAND UP out of it
      rng, n: 3000,
      sample: rej(-10, horizon + 6, 810, 512, (x, y) => y > groundTop(x) + 2 && !onRoad(x, y)),
      dir: (x, y) => -Math.PI / 2 + (fbm(x / 11, y / 9, 101) - 0.5) * 1.15,
      col: (x, y, r) => grassCol(x, y, r, 0.22),
      len: (x, y) => 9 * dS(y), lw: (x, y) => 1.1 * dS(y), steps: 2, lenJ: 0.8, impasto: 0.6,
    });
    strokes(out, counter, {                                  // 3 · the finest nap, closest to us
      rng, n: 2600,
      sample: r => { const x = -10 + r() * 820, y = horizon + 14 + Math.pow(r(), 0.8) * (512 - horizon - 14);
                     return free(x, y) ? [x, y] : null; },
      dir: (x, y) => -Math.PI / 2 + (fbm(x / 7, y / 6, 103) - 0.5) * 1.5,
      col: (x, y, r) => grassCol(x, y, r, 0.3),
      len: (x, y) => 6 * dS(y), lw: (x, y) => 0.8 * dS(y), steps: 2, lenJ: 0.85, impasto: 0.7,
    });
    for (let i = 0; i < 120; i++) {                          // 4 · and clumps — grass grows in tufts
      const tx = -10 + rng() * 820;
      const ty = horizon + 14 + Math.pow(rng(), 0.55) * (508 - horizon - 14);
      if (!free(tx, ty)) continue;
      const sc = dS(ty);
      strokes(out, counter, {
        rng, n: 14,
        sample: r => [tx + (r() + r() - 1) * 9 * sc, ty - Math.pow(r(), 0.7) * 11 * sc],
        dir: (x, y) => -Math.PI / 2 + (x - tx) * 0.05 + (fbm(x / 6, y / 6, 107) - 0.5) * 0.8,
        col: (x, y, r) => grassCol(x, y, r, 0.34),
        len: 10 * sc, lw: 1.1 * sc, steps: 2, lenJ: 0.7, impasto: 0.65,
      });
    }
  }

  /* ---------------- 3. THE PATH HOME ---------------- */
  {
    let L2 = [], R2 = [];
    for (let t = 0; t <= 1.001; t += 0.06) {
      const p = roadP(t), q = roadP(Math.min(1, t + 0.03));
      let nx = -(q[1] - p[1]), ny = q[0] - p[0]; const nl = Math.hypot(nx, ny) || 1; nx /= nl; ny /= nl;
      const hw = roadW(t) / 2;
      L2.push([p[0] + nx * hw, p[1] + ny * hw]); R2.push([p[0] - nx * hw, p[1] - ny * hw]);
    }
    let d = `M${R1(L2[0][0])} ${R1(L2[0][1])}`;
    for (let i = 1; i < L2.length; i++) d += `L${R1(L2[i][0])} ${R1(L2[i][1])}`;
    for (let i = R2.length - 1; i >= 0; i--) d += `L${R1(R2[i][0])} ${R1(R2[i][1])}`;
    out.push(`<path d="${d}Z" fill="#e6cf92"/>`); counter.n++;   // the street of the city is pure GOLD (Rev 21:21)
  }
  strokes(out, counter, {
    rng, n: 640,
    sample: rej(20, horizon, 760, 510, onRoad),
    dir: (x, y) => { const { t } = roadInfo(x, y); const a = roadP(Math.max(0, t - 0.03)), b = roadP(Math.min(1, t + 0.03)); return Math.atan2(b[1] - a[1], b[0] - a[0]); },
    col: (x, y, r) => { const { t, d } = roadInfo(x, y); let c = ramp(['#fff6d2', '#f4dd9c', '#dcbc70'], d / (roadW(t) / 2) * 0.7 + fbm(x / 50, y / 50, 41) * 0.4); const g = gD(x, y); c = mix(c, '#fffaе0'.replace('е','e'), g * 0.75); c = mix(c, '#4a3a1c', (1 - g) * 0.45); return jig(c, r, 9); },
    len: (x, y) => 16 * dS(y), lw: (x, y) => 3.2 * dS(y), steps: 3, lenJ: 0.55, wild: 0.06,
  });

  // THE ROAD, WORN. NOTE this plate runs t BACKWARDS (t=0 is the near end, and
  // roadW is widest there), so ptFn/wFn are flipped — dirtRoad wants t=0 far.
  dirtRoad(out, counter, rng, {
    ptFn: t => roadP(1 - t), wFn: t => roadW(1 - t),
    cols: ['#a98a58', '#cfae76', '#f0e0ae'],
    lightFn: gD, ruts: 0.42, stones: 420, verge: 520, seed: 833,   // ⚠ stones and verge both raised: at 150/250 on a road now 314 wide at our feet, the detail was spread three times as thin as when those numbers were set
  });
  // ══ THE ROAD'S OWN SURFACE ═════════════════════════════════════════════════════════
  // ⚠ Fred: "with details! add patches of grass, add small rocks, give your best!" A road
  // painted as one filled shape with a wash over it is a SHAPE; what makes it a surface is
  // that things live on it and the grass does not respect its edge.
  {
    const roadN = t => { const a = roadP(t), b = roadP(Math.min(1, t + 0.03));
      let nx = -(b[1] - a[1]), ny = b[0] - a[0]; const nl = Math.hypot(nx, ny) || 1;
      return [nx / nl, ny / nl]; };

    // (a) THE VERGE BREAKS INTO THE ROAD. Grass does not stop along a drawn line — it
    // encroaches, in clumps, and that ragged join is most of what stops the road reading
    // as a cut-out shape laid on the meadow.
    for (let i = 0; i < 130; i++) {
      const t = Math.pow(rng(), 0.72);
      const p = roadP(t), [nx, ny] = roadN(t), hw = roadW(t) / 2;
      const off = hw * (0.74 + rng() * 0.34) * (rng() < 0.5 ? -1 : 1);
      const gx = p[0] + nx * off, gy = p[1] + ny * off, sc = dS(gy);
      strokes(out, counter, {
        rng, n: 10,
        sample: r => [gx + (r() + r() - 1) * 7 * sc, gy - Math.pow(r(), 0.7) * 10 * sc],
        dir: (x, y) => -Math.PI / 2 + (x - gx) * 0.06 + (rng() - 0.5) * 0.55,
        col: (x, y, r) => jig(mix(ramp(['#3f7a35', '#5e9a40', '#8bbc57', '#bcc850'], r() * 0.9),
                                  '#fff0c8', gD(x, y) * 0.45), r, 9),
        len: 8 * sc, lw: 1.1 * sc, steps: 2, lenJ: 0.7, impasto: 0.55,
      });
    }

    // (b) SMALL ROCKS, each with the contact shadow that fastens it to the ground. A stone
    // without one is a pebble-coloured sticker — the same law as the trees.
    for (let i = 0; i < 260; i++) {
      const t = Math.pow(rng(), 0.82);
      const p = roadP(t), [nx, ny] = roadN(t), hw = roadW(t) / 2;
      const off = (rng() + rng() - 1) * hw * 0.94;
      const sx = p[0] + nx * off, sy = p[1] + ny * off;
      const sc = dS(sy), rr = (0.85 + rng() * 1.7) * sc;
      if (rr < 0.5) continue;
      const g = gD(sx, sy), away = sx < dc[0] ? -1 : 1;
      out.push(`<ellipse cx="${R1(sx + away * rr * 0.55)}" cy="${R1(sy + rr * 0.45)}" rx="${R1(rr * 1.2)}" ry="${R1(rr * 0.52)}" fill="#5a4620" opacity="${(0.14 + 0.18 * (1 - g)).toFixed(2)}"/>`);
      counter.n++;
      E.daub(out, counter, sx, sy, rr,
        jig(mix(ramp(['#7d6a48', '#a08a60', '#c4ac7c', '#e2cd9c'], 0.25 + rng() * 0.6),
                '#fff4d0', g * 0.5), rng, 8), rng);
      if (rng() < 0.45) E.daub(out, counter, sx - rr * 0.3, sy - rr * 0.34, rr * 0.42,
        jig(mix('#efe0b4', '#fffaе6'.replace('е', 'e'), rng() * 0.6), rng, 5), rng);   // the lit crown of the stone
    }

    // (c) WORN PATCHES — bare earth showing through where feet have gone, so the surface
    // is not one even tone from verge to verge.
    for (let i = 0; i < 26; i++) {
      const t = Math.pow(rng(), 0.7);
      const p = roadP(t), [nx, ny] = roadN(t), hw = roadW(t) / 2;
      const off = (rng() + rng() - 1) * hw * 0.7;
      const px2 = p[0] + nx * off, py2 = p[1] + ny * off, sc = dS(py2);
      const rx = (9 + rng() * 22) * sc, ry = rx * (0.34 + rng() * 0.22);
      strokes(out, counter, {
        rng, n: Math.round(26 * sc + 10),
        sample: r => { const a = r() * 6.2832, d2 = Math.pow(r(), 0.6);
                       return [px2 + Math.cos(a) * rx * d2, py2 + Math.sin(a) * ry * d2]; },
        dir: (x, y) => { const { t: tt } = roadInfo(x, y); const a = roadP(Math.max(0, tt - 0.03)), b = roadP(Math.min(1, tt + 0.03));
                         return Math.atan2(b[1] - a[1], b[0] - a[0]); },
        col: (x, y, r) => jig(mix(ramp(['#9c8354', '#b89a68', '#d8bf8c'], r() * 0.8),
                                  '#fff2cc', gD(x, y) * 0.55), r, 8),
        len: 7 * sc, lw: 2.2 * sc, steps: 2, lenJ: 0.6, impasto: 0.4, op: 0.7,
      });
    }
  }

  // the door's warm thread cast down the whole path toward the walker (Luke 15:5)
  strokes(out, counter, {
    rng, n: 120,
    sample: r => { const t = Math.pow(r(), 0.7); const p = roadP(t); return [p[0] + (r() + r() - 1) * roadW(t) * 0.18, p[1] + (r() - 0.5) * 3]; },
    dir: (x, y) => { const { t } = roadInfo(x, y); const a = roadP(Math.max(0, t - 0.03)), b = roadP(Math.min(1, t + 0.03)); return Math.atan2(b[1] - a[1], b[0] - a[0]); },
    col: (x, y, r) => jig(ramp(['#fff3cd', '#ffe9a0', GOLD, GOLD_DEEP], (1 - roadInfo(x, y).t) * 0.9 + (r() - 0.5) * 0.25), r, 7),
    len: 13, lw: 1.7, steps: 3, lenJ: 0.6, wJ: 0.45,
  });

  /* ---------------- 4. THE FATHER'S HOUSE — it BLAZES (Rev 21:23) ----------------
     a great glory of light all around it first, then a clearly drawn home. */
  const hc2 = dc[1] - 18;   // the heart of the glory
  // a great, BRIGHT glory of light all around the home (Rev 21:23) — bigger + warmer
  strokes(out, counter, {
    rng, n: 440,
    sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 0.92) * 240; return [house.x + Math.cos(a) * d, hc2 + Math.sin(a) * d * 0.86]; },
    dir: (x, y) => Math.atan2(y - hc2, x - house.x),
    col: (x, y, r) => jig(ramp([GOLD_HOT, GOLD_PALE, GOLD, GOLD_DEEP, '#caa44e'], Math.hypot(x - house.x, (y - hc2) / 0.86) / 240), r, 9),
    len: 11, lw: 2.1, steps: 2, impasto: 0.5,
  });
  // BOLD RAYS of light beaming out from the home — long, bright, legible beams
  strokes(out, counter, {
    rng, n: 80,
    sample: r => { const a = r() * Math.PI * 2, d = 48 + r() * 96; return [house.x + Math.cos(a) * d, hc2 + Math.sin(a) * d * 0.86]; },
    dir: (x, y) => Math.atan2(y - hc2, x - house.x),
    col: (x, y, r) => jig(mix(GOLD_HOT, GOLD_PALE, r() * 0.5), r, 6),
    len: (x, y) => 26 + Math.hypot(x - house.x, y - hc2) * 0.4, lw: 1.7, steps: 2, lenJ: 0.6,
  });
  // KLIMT GOLD — a rich gilded glory-halo of concentric gold rings + dots (Rev 21:23,
  // "the glory of God did lighten it"; the throne and the holy place of pure gold)
  E.klimtGold(out, counter, rng, house.x, hc2 + 2, 112, 260, { rings: 8, opacity: 0.7, squash: 0.82 });
  // THE FAR HILLS — one FULL-WIDTH band, painted BEFORE the palace so the palace's
  // solid walls cover the middle. ⚠ These used to be two bands flanking the palace
  // (x0..325 and 477..814), and strokes stopping dead at a bound leave a hard VERTICAL
  // SEAM — on the phone the two halves read as flat mint RECTANGLES sitting on the
  // meadow. A stroke field must never end at a straight line it doesn't own.
  // ⚠ SHALLOW AND HAZED. At depth 70 this laid a flat slab of three greens across the whole
  // page behind the kingdom — the "background behind the kingdom" Fred keeps seeing. Distant
  // land belongs AT the horizon: shallow, pale, and finished before the wood begins.
  // ⚠ THE RULER-STRAIGHT HORIZON WAS THIS LINE. Fred: "the horizon is still a straight
  // line, see gift for reference." distantHills closes its shape at `horizonFn(x) + depth`
  // — and this page passed `horizonFn: () => horizon`, a CONSTANT. Its top edge undulated
  // beautifully and its BOTTOM was cut dead flat at 250 + 26 = 276, straight across all
  // 800 units. And because the hills are painted AFTER the meadow, that slab lay ON the
  // grass, so the flat cut was the most visible edge on the page.
  // Now the bottom follows the land itself: `groundTop(x) - 26` + depth 26 lands the hills
  // exactly ON the ground line (groundTop runs 239–246), so they tuck behind the meadow
  // instead of covering its first 36 units, and the join is a landscape, not a seam.
  // ⚠ The top ridge had to come up with it: at amp 34 about 242 it reached y 276, BELOW
  // the ground line, which would have turned the hills inside out once the base followed
  // the land. Centred higher and shallower, it now always sits above the meadow's edge.
  E.distantHills(out, counter, rng, { topFn: E.ridge(horizon - 32, { amp: 18, freq: 190, bumps: 0.55, seed: 233 }), horizonFn: (x) => groundTop(x) - 26, cols: ['#a9c6c0', '#b6cdb4', '#c6d8b6'], depth: 26, lightFn: gD, seed: 233, x0: -14, x1: 814 });

  // LEGIBLE GOLD SPARKS raining off the house — it is God's house; it RADIATES
  E.goldSparks(out, counter, rng, house.x, hc2, 54, 268, 150, { squash: 0.86, big: 1.15, lightFn: gD });
  // THE PALACE OF GOD — the same New Jerusalem the whole way leads home to (Rev 21),
  // its open GATE the very door you are carried through. ONE consistent Home
  // (ran / gift / twoways all show the same City). The dark door-frame + John 10:9
  // easter egg + world-of-colour below all sit within the palace's central gate.
  // ══ THE CITY ═══════════════════════════════════════════════════════════════════════
  // ⚠ REDRAWN. Fred: "redraw it so that the kingdom actually looks like the kingdom of god,
  // the landscape are worthy of god." What stood here was five flat gold slabs — a cottage
  // castle. Scripture is specific about this city and it is not a castle:
  //   Rev 21:21  the twelve gates were twelve pearls … the street of the city was pure gold,
  //              as it were TRANSPARENT GLASS   → the gold is luminous and pale, never opaque
  //   Rev 21:19  the foundations garnished with all manner of precious stones
  //              → the wall stands on twelve courses of JEWEL, which is where the colour lives
  //   Rev 21:23  the city had NO NEED OF THE SUN … the glory of God did lighten it
  //              → the city is the light source of the whole page; nothing else casts
  //   Rev 21:16  the length and the breadth and the height of it are equal → it is VAST:
  //              a wall across the whole world, not a building you could walk around
  // ⚠ THIS IS THE SAME HOUSE AS EVERY OTHER PAGE. I once replaced it with a terraced
  // mountain-city of my own invention; Fred: "wait why is it a different kingdom altogether?
  // i want the background, the castle, everything to be revised but made BETTER." The
  // Father's house is one place across the whole book — `gift`, `ran` and this page all draw
  // it with the shared `paintPalace`, and a reader must recognise it. Improve the painter,
  // never swap the building.
  // ⚠ THE HOUSE HAD NO SHADOW, so it sat ON the meadow like a cut-out instead of standing
  // IN it. Its own light streams from the gate toward the reader, so the mass of the
  // building throws its shade out to either side of that beam — which is also what makes
  // the beam read as a beam.
  for (const sgn of [-1, 1]) {
    strokes(out, counter, {
      rng, n: 260,
      sample: r => { const t = Math.pow(r(), 0.7);
                     return [house.x + sgn * (34 + t * 250) + (r() - 0.5) * 60,
                             house.base + 2 + t * 96 + (r() - 0.5) * 22]; },
      dir: (x, y) => Math.atan2(y - house.base, x - house.x) * 0.4,
      col: (x, y, r) => jig(mix('#1a3f2c', '#2f6038', r() * 0.65 + gD(x, y) * 0.35), r, 8),
      len: 16, lw: 4.4, steps: 2, lenJ: 0.6, impasto: 0.3, op: 0.34,
    });
  }
  E.paintPalace(out, counter, rng, house.x, house.base, PAL_S, { gate: true });

  /* ---------------- 5. THE DOOR — the one glowing way in, a world of colour beyond ---------------- */
  // door frame: dark posts + lintel so the gold has a shape to blaze in (chiaroscuro)
  // ⚠ THE DARK POSTS ARE GONE. They were drawn for the old cottage-castle and framed nothing:
  // three black bars hanging in mid-air over the meadow, reading as a goalpost. The gate is
  // framed by its own gatehouse now (see paintCity), so what is left here is only the deep
  // reveal of the opening — the thickness of a wall you pass THROUGH.
  const fl = door.w / 2 + 4;
  paintPath(out, counter, rng, [[door.x - fl, door.y1 + 1], [door.x - fl, door.y0 + 14]], (x, y, r) => jig(mix('#6b4f2a', '#8a6a3a', r() * 0.6), r, 6), { lw: 3.4, len: 6, density: 0.85, jitter: 0.5 });
  paintPath(out, counter, rng, [[door.x + fl, door.y1 + 1], [door.x + fl, door.y0 + 14]], (x, y, r) => jig(mix('#5a4022', '#7a5c32', r() * 0.6), r, 6), { lw: 3.4, len: 6, density: 0.85, jitter: 0.5 });
  // EASTER EGG — the GOSPEL on the door, in the ORIGINAL TONGUE: John 10:9 in Koine
  // GREEK numerals, Ιʹ·Θʹ (Ι=10, Θ=9), cut into the gold lintel above the way in.
  // "I am the door: by me if any man enter in, HE SHALL BE SAVED." The book shows you
  // carried home; this turns the door toward the reader. A dark incision on the gold.
  E.inscriptionText(out, E.greekRef(10, 9), { x: 401, y: 247, h: 15, body: '#241608', edge: '#fff0c4', op: 0.85, edgeOp: 0.6 });
  // THROUGH THE DOOR — a whole world of light and colour: a blaze at the centre
  // opening into a bright sky above and a lush colour path below. Home is not a
  // dark room; it is colour after the long dark.
  {
    const inH = door.y0 + (door.y1 - door.y0) * 0.46;
    strokes(out, counter, {
      rng, n: 360,
      sample: r => [door.x - door.w / 2 + 2 + r() * (door.w - 4), door.y0 + 2 + r() * (door.y1 - door.y0 - 4)],
      dir: () => Math.PI / 2,
      col: (x, y, r) => {
        if (Math.abs(x - door.x) < door.w * 0.20 && Math.abs(y - inH) < 17) return jig(GOLD_HOT, r, 4); // the blaze of the way in
        const c = (y < inH)
          ? ramp([GOLD_PALE, '#f6c06a', '#ec8f86', '#8ec6cc', '#86b6dc'], (inH - y) / (door.y1 - door.y0) * 1.7 + (r() - 0.5) * 0.24)
          : ramp([GOLD, '#c6d258', '#5aa86e', '#3f9a96', '#4a86c0'], (y - inH) / (door.y1 - door.y0) * 1.7 + (r() - 0.5) * 0.24);
        return jig(c, r, 8);
      },
      len: 11, lw: 2.6, steps: 2, lenJ: 0.5, impasto: 0.6,
    });
    // flowers of every colour in the world beyond
    strokes(out, counter, {
      rng, n: 96,
      sample: r => [door.x - door.w / 2 + 3 + r() * (door.w - 6), door.y0 + 3 + r() * (door.y1 - door.y0 - 6)],
      dir: () => Math.PI / 2,
      col: (x, y, r) => { const k = r(); return jig(k < 0.24 ? '#ec8f86' : k < 0.46 ? '#9a86d0' : k < 0.68 ? '#f0c860' : k < 0.86 ? '#5ec0a0' : '#e8a0c8', r, 12); },
      len: 5, lw: 1.8, steps: 2, impasto: 0.4,
    });
  }
  // light spilling out onto the threshold, lying flat on the path
  strokes(out, counter, {
    rng, n: 180,
    sample: r => { const a = Math.PI * (0.16 + r() * 0.68), d = Math.pow(r(), 1.2) * 52; return [door.x + Math.cos(a) * d * 1.5, door.y1 + 1 + Math.sin(a) * d * 0.42]; },
    dir: () => 0.05,
    col: (x, y, r) => jig(ramp([GOLD_HOT, GOLD, GOLD_DEEP, '#8a7038'], Math.hypot(x - door.x, (y - door.y1) * 2.1) / 84), r, 8),
    len: 8, lw: 2.2, steps: 2, lenJ: 0.5,
  });
  // egg: small height-notches up the right doorpost — children measured here,
  // year after year; this door has always been somebody's home
  for (const [ny2, nl2] of [[door.y1 - 16, 4], [door.y1 - 26, 4.5], [door.y1 - 38, 5]]) {
    paintPath(out, counter, rng, [[door.x + fl + 1, ny2], [door.x + fl + 1 + nl2, ny2 - 0.5]], (x, y, r) => jig('#8a5a1e', r, 8), { lw: 1.3, len: 2.5, density: 0.9, jitter: 0.3 });
  }

  /* ---------------- 6. CARRIED HOME — the radiant Father bears you on his shoulders ----------------
     the same gold Father who RAN (13); you (the dark-blue child of 13) ride high,
     arms up, rejoicing. "He layeth it on his shoulders, rejoicing." (Luke 15:5)
     ⚠ REVERTED. Fred asked to make the Father a runtime `t:'r'` actor so front/back
     could be controlled — tried it, and the `t:'r'` rig read as "this lady figure", not
     him: "the father is a stickman made of light" (see gen/characters.mjs paintTheLight,
     and CAST.light there — no robe, on purpose, per Fred + 1 John 1:5 / John 1:14). The
     runtime rig and the baked painter are two different drawings of "the Light" and only
     the baked one is currently right. Back to E.paintCarried baking both figures into
     the plate; CAST1[17]'s runtime child entry reverted to match (see character.js). */
  const _fgFig = out.length;   // [FG plane] the carried Father + child
  {
    const fp = roadP(0.46);
    // ⚠ RE-DERIVED so he stands exactly where he already stood (plate x 342.5) after the
    // road's near end moved. The old +34 put him on the green BESIDE a road that ran wide
    // of him; now the road comes to him, so the offset is negative and he walks ON it —
    // which is what "he carried you the last of the way" should look like.
    const fx = fp[0] - 58.5, fy = fp[1] - 1;   // ⚠ re-derived after the road was straightened onto the door's axis: roadP(0.46).x is now a constant 401, so -58.5 lands him on plate x 342.5, exactly where he has always stood   // ⚠ re-derived AGAIN after the road was straightened — roadP(0.46).x is now 349.8, so this lands him back on plate x 342.5 exactly where he has always stood
    // ⚠ THE PAGE SAYS WHERE, THE LIBRARY SAYS WHO. Every figure on this page used to be
    // hand-built here — its own capsules, its own halos, its own colours — which is how the
    // Light ended up white on one page and gold on another. `gen/characters.mjs` now holds
    // the whole cast: change the Light's palette there and it changes across the book on the
    // next build. A plate's job is only to place him and say what he is doing.
    // a pocket of deeper ground for him to stand against (this page's own chiaroscuro)
    {
      // ⚠ THE DARK MUST SIT BEHIND HIS HEAD, NOT HIS FEET. Centred at fy-64 the pocket's
      // darkest point landed at his hips — backing the legs, which already read fine
      // against green meadow — while his head, the one part standing against the GOLD
      // palace, got only the pocket's faint outer edge. Gold on gold: he read headless.
      // "Bright only reads against dark", so the pocket's centre goes up to his chest.
      const px = fx, py = fy - 95;
      strokes(out, counter, {
        rng, n: 300,
        sample: r => { const a2 = r() * 6.2832, d = Math.pow(r(), 0.5); return [px + Math.cos(a2) * 80 * d, py + Math.sin(a2) * 86 * d]; },
        dir: (x, y) => Math.atan2(y - py, x - px) + Math.PI / 2,
        col: (x, y, r) => {
          const d = Math.min(1, Math.hypot((x - px) / 80, (y - py) / 86));
          let c = mix('#0d2b1e', '#22513a', r() * 0.55 + d * 0.35);
          c = mix(c, '#5e9a40', Math.pow(d, 1.6) * 0.85);
          return jig(c, r, 8);
        },
        len: 13, lw: 3.4, steps: 2, lenJ: 0.6, impasto: 0.5, op: 0.6,
      });
    }
    // ⚠ LIFTED UP HIGH, NOT CRADLED. Fred sent a reference photo: a parent hoisting a
    // child up overhead, arms flung wide, looking up at them — not held at chest/thigh
    // height. "try it, i want to make the father carry the child since the story says
    // so" (Luke 15:5, "he layeth it on his shoulders"). Hands raised near his own head
    // height, reaching UP to support the child riding above him (CAST1[17], y moved up
    // to clear his head) — not down at hip/thigh height the way an actual piggyback's
    // weight would be taken.
    // ⚠ MEASURED, NOT GUESSED — and the fourth attempt is the one that works.
    // Fred, on the third: "i dont know what you did, its ugly… i want to make the father
    // ACTUALLY carrying the child like the story." He was right, and the cause was
    // geometric, not decorative. Measured off the live render:
    //     child silhouette  plate x 320–383,  y 243–319
    //     the Light's head  plate x 326–361,  y 288–337
    // The child was sitting ON HIS FACE. His head was completely behind the child's coat,
    // so the pair read as a boy standing on a gold blob — and no hand, arm, or prop pasted
    // in front could fix a pose that was impossible underneath. (Two such props were built
    // and thrown away before anyone measured this.)
    // ⚠ WHY IT WAS IMPOSSIBLE: personCaps gives this cast arms 25% of height against a head
    // 23% of height — cartoon proportions that CANNOT raise a child clear of their own
    // skull. A real lift needs real reach, so this pose lengthens the arms (armLen, added
    // to personCaps; every other figure in the book keeps the default 1). The elongation is
    // in keeping — he is a figure of LIGHT, and light reaches.
    // The pose is the one Fred asked for by photograph: a parent hoisting a child overhead,
    // the child's arms flung wide, the Father's face clear below, looking up. Luke 15:5 —
    // "he layeth it on his shoulders, REJOICING."
    // ⚠ AND THE OVERHEAD LIFT WAS ALSO WRONG — but this time the render said why, not a
    // guess. Raised arms did clear his head, and the pair still read as a blob, because
    // THIS FIGURE'S HEAD IS WIDER THAN ITS SHOULDERS (head 34 across, shoulders 18). Arms
    // rising from those shoulders hug the skull all the way up, so head + both arms merge
    // into one shapeless mass with no neck. You cannot press a child overhead with this
    // build; it is a property of the cast, not of the coordinates.
    // ⚠ NOW A PIGGYBACK, ON A NEW DRAWING OF FRED'S. He sent img_9500 — the same back
    // view, but the arms curl DOWN and IN instead of being planted straight out, which is
    // the difference between a child standing and a child being held. Cut to
    // cast/kid-lifted.webp. The hands come round to his sides at the waist and the arms
    // stay clear of the head. (The sleeping cradle below is the other version that works;
    // both are one CAST1 line + these two numbers apart.)
    // ⚠ WAS: A SLEEPING CHILD, CARRIED. Upright carries were tried four ways and all of
    // them failed on the same rock — the `carried` cell is a drawing of a child STANDING
    // (back view, feet planted, arms out), so however you arrange a figure around it, it
    // reads as a boy standing in front of a gold blob. The fix was not more geometry: it
    // was choosing a different one of Fred's own drawings. `kid-sleeping` is a child
    // curled asleep on his side, and laid horizontally across the Father's chest it says
    // "carried" before you have finished looking at it.
    // It is also what the page MEANS. Luke 15:5's lamb is carried because it cannot walk;
    // the prose says "He carried you the LAST of the way." A child asleep in his arms
    // says you did not get yourself home. That is the whole gospel of this page.
    //   the Light's head   y 288–329, clear above the child
    //   the child          y 336–376, laid across his chest, 68 wide, head to our left
    //   his two hands      cupped under each end of the child (y≈368)
    // The child is a runtime sprite drawn after the plate, so he lands IN FRONT of the
    // Father's body — the z-order that fought every earlier attempt is what carries this
    // one, exactly as Fred first asked: "the back of the kid covered by the body of the
    // father."
    E.paintCarried(out, counter, rng, { x: fx, y: fy, h: 128, childH: 66, shadowDir: 0.5,
      // ⚠ AND HE HAS TO READ AS A TALL ADULT, which the default rig cannot: its head is
      // 26% of body height (a real one is ~13%) on shoulders 18 wide, so he came out a
      // gold blob with a loaf on top and arms sprouting from inside his own skull. Fred,
      // twice: "ugly". headK/shoulderK (personCaps, both default 1 — the rest of the cast
      // is untouched) give him an adult's build: shoulders finally WIDER than the head,
      // so the arms hang outside it.
      // headK back to full: his head was shrunk while fighting the overhead lift, and on
      // a piggyback there is nothing above him to crowd it — at page size a small head
      // just made him read as headless. shoulderK stays: wide shoulders are what let the
      // arms hang outside the skull, and what a child sits ON.
      shoulderK: 1.8,
      // ⚠ A CRADLE, AND SHORT ARMS ARE RIGHT FOR IT. Every upright carry failed on the
      // same rock: this figure's hands are fat capsule ends with no fingers, and at plate
      // scale they cannot express GRIPPING anything. A sleeping child laid ACROSS him
      // needs no grip — his forearms simply run underneath, and the two hands cup the
      // ends. The pose asks the rig only for what it can actually draw.
      // ⚠ A PIGGYBACK — and the proof it is the right pose is that it needs NO extended
      // arms. Fred: "if we use this sprite, we can just put the kid on the back of the
      // light figure right". Right, and it settles the whole page: we see the Light from
      // BEHIND, so a child on his back is naturally in front of him — which is exactly
      // the z-order a runtime sprite already has. Nothing has to be faked.
      // Measured: his hands reach the child's thighs at 30 units, inside this rig's own
      // 32-unit reach. Every other carry I tried needed the arms stretched 1.5–2× and
      // still sprawled; this one fits the figure as drawn.
      // ⚠ ARMS NEARLY STRAIGHT, NOT COCKED. Fred: "the right arm of light kind of look
      // weird." At armLen 1.25 the hands sat only 82% of the way to full reach, so the IK
      // threw both elbows 12 units clear of the shoulders — and on limbs this thick that
      // is not a bend, it is a chicken wing. A carrying arm hangs almost straight: 1.1
      // puts the hands at 97% of reach, leaving a soft elbow instead of an angle.
      armLen: 0.52,
      // ⚠ THE HANDS HAVE TO CLEAR THE CHILD'S OWN COAT, or they are simply not there.
      // At hip height his coat spans x 325–360; hands inside that are behind him, because
      // the child is a runtime sprite composited after the whole plate. Out at 320 / 365
      // they emerge past his coat on both sides with their inner halves tucked behind
      // him — a piggyback grip, hands round the outside of the legs.
      // ⚠ A HIDDEN STUB, because the visible arms are drawn OVER the child by
      // cast/light-hands.webp (HELD[17] in engine/scene.js). These end at x 332/353,
      // inside his coat (which spans 331–354 at y 342), so the plate contributes only a
      // shoulder tucked behind him. armLen 0.52 keeps that stub near full extension so
      // the elbow does not cock out. ⚠ If the overlay is ever switched off, put these
      // back to [[fx - 22.5, fy - 59], [fx + 22.5, fy - 59]] with armLen 1.2, or he has
      // almost no arms at all.
      hands: [[fx - 10.5, fy - 81], [fx + 10.5, fy - 81]],
      // ⚠ AND HE IS WALKING. Fred: "make light look like hes walking." He is going AWAY
      // from us, up the road into the door, so the stride reads in DEPTH, not across:
      // the leading foot lands further up the path (higher on the plate, and drawn in
      // toward the line of travel), the trailing foot is left behind and nearer to us.
      // The old stance had both feet level and 33 apart — a man standing still.
      // a narrow stride, not a stance: the leading leg is BENT and its foot lifted clear
      // (mid-step), the trailing leg straight and planted. Feet only 13 apart, because a
      // walker's feet land near the line of travel — the old 33-wide stance was a man
      // standing still with his legs apart.
      // ⚠ A SUBTLE stride. This rig's legs only reach 59 units, so lifting a foot far
      // shortens hip-to-foot enough that the IK throws the knee out sideways — the first
      // try read as a flamingo, not a walk. Keep both legs near full extension: the
      // leading foot just 9 units higher (further up the road, since he walks AWAY from
      // us) and a little in toward the line of travel; the trailing one planted behind.
      feet: [[fx - 8, fy - 6], [fx + 10, fy + 3]] });
  }
  fgRanges.push([_fgFig, out.length]);   // ← carried Father + child are foreground

  /* ---------------- 7. BACKGROUND LIFE (Luke 15; Matt 6:26; Isa 55:12) ----------------
     dark forms in the bright day: birds, cypress, and SHEEP — the flock the
     shepherd left to carry the one home. Birds + cypress + the horizon fringe
     sit at the horizon → the FAR plane. */
  const _far = out.length;
  // DISTANT HILLS — a rolling-land silhouette whose undulating skyline becomes the
  // sky↔meadow boundary (never a ruled line) and slides against the sky as you pan.
  // skip the centre column (x≈325..477) so the distant hills don't bury the
  // Father's house — the home (the destination) must read clearly.
  for (const [bx, by, s] of [[180, 58, 1], [216, 72, 0.85], [252, 54, 0.9], [560, 78, 0.85], [598, 64, 0.74], [120, 86, 0.8], [700, 70, 0.62]]) {
    // (Sep 14: a three-point V with a heavy brush read as black ticks — a gull-wing, finer)
    paintPath(out, counter, rng, [[bx - 6 * s, by + 2.6 * s], [bx - 3 * s, by - 1.6 * s], [bx, by + 0.4 * s], [bx + 3 * s, by - 1.6 * s], [bx + 6 * s, by + 2.6 * s]], (x, y, r) => jig('#46506a', r, 6), { lw: 1.0 * s, len: 3, density: 0.9, jitter: 0.3 });
  }
  const cyp = (cx, cby, ch, w) => strokes(out, counter, { rng, n: Math.round(w * ch / 12), sample: r => { const v = Math.pow(r(), 0.85); const wr = w * Math.sin(Math.PI * Math.min(1, v * 1.15)) + 0.7; return [cx + (r() + r() - 1) * wr, cby - v * ch]; }, dir: (x, y) => -Math.PI / 2 + (fbm(x / 8, y / 8, 247) - 0.5) * 0.6, col: (x, y, r) => jig(ramp(['#26283a', '#34364e', '#42445e'], fbm(x / 10, y / 10, 251) + r() * 0.3), r, 7), len: 9, lw: 2.2, steps: 3, follow: 0.95, lenJ: 0.5 });
  cyp(96, 246, 44, 6); cyp(726, 250, 46, 7);
  // the HORIZON FRINGE — ragged meadow grass off the soil line, breaking the seam
  E.horizonFringe(out, counter, rng, { horizonFn: groundTop, x0: -10, x1: 325, cols: ['#3a7a38', '#5e9a40', '#88b84a', '#bcc850'], hMax: 20, lightFn: gD, seed: 231 });
  E.horizonFringe(out, counter, rng, { horizonFn: groundTop, x0: 477, x1: 810, cols: ['#3a7a38', '#5e9a40', '#88b84a', '#bcc850'], hMax: 20, lightFn: gD, seed: 619 });
  // ══ THE FAR WOOD ═══════════════════════════════════════════════════════════════════
  // The homecoming should not happen on a bare green table. Same rule as `ran`: a wood is a
  // MASS with trees rising out of it, its depth wandering with the land, dipping below the
  // horizon line here and there so the meadow interlocks with it instead of meeting a seam.
  // ⚠ THE HOUSE IS NEVER COVERED. The door is where the whole book has been going — the wood
  // stops well clear of the palace and its glory on both sides.
  {
    const wRng = mulberry32(seed ^ 0x2f5c11a3);
    // ⚠ THE WOOD IS BEHIND THE CITY. It was painted afterwards and across the whole width, so
    // a line of treetops ran straight through the wall and towers. The city occupies the whole
    // middle distance; the wood belongs to the country on either side of it.
    // ⚠ THE WOOD WAS KEPT OFF ALMOST THE WHOLE PAGE. Fred: "add more background trees in
    // this area, i want to cover the edges of the kingdom." This gate excluded the wood
    // wherever 66 < x < 736 — which is nearly everything — so the far country survived
    // only as a sliver at each extreme edge, and the palace's outer towers stood against
    // bare sky and empty meadow.
    // It was over-corrected: the original fault was treetops running THROUGH the wall and
    // towers, so the wood was pushed away entirely. The palace's back rank spans about
    // x 165..637, so excluding only its bright core (205..600) lets the wood close right
    // up against the outer towers and cover their edges, while still never crossing the
    // city itself or the gate the whole book leads to.
    const clearHouse = (x) => x > 205 && x < 600;
    const woodH = (x) => 16 + 30 * fbm(x / 112, 9.1, 401) + 8 * Math.sin(x / 67);
    const hz = (y) => Math.max(0, Math.min(1, 1 - (y - horizon) / 74));      // distance haze
    const wCol = (x, y, top, r) => {
      const up = Math.max(0, Math.min(1, (top - y) / 26));
      let c = ramp(['#1f4529', '#2c5c31', '#3f7739', '#589243', '#7fae4c'],
        up * 0.72 + fbm(x / 8, y / 7, 313) * 0.22 + gD(x, y) * 0.18 + 0.06);
      c = mix(c, '#f4e8b4', Math.pow(up, 2.1) * 0.32);        // the light is above
      c = mix(c, '#cfe0d4', hz(y) * 0.24);                    // distance only softens it
      return jig(c, r, 8);
    };
    strokes(out, counter, {
      rng: wRng, n: 2600,
      sample: r => {
        const x = -30 + r() * 880;
        if (clearHouse(x)) return null;
        const y = groundTop(x) + 6 - Math.pow(r(), 0.72) * woodH(x);
        return [x, y];
      },
      dir: (x, y) => -Math.PI / 2 + (fbm(x / 9, y / 8, 317) - 0.5) * 2.2,
      col: (x, y, r) => wCol(x, y, groundTop(x) - woodH(x), r),
      len: 3, lw: 1.7, steps: 2, lenJ: 0.8, impasto: 0.5, op: 0.95,
    });
    for (let c = 0; c < 13; c++) {
      const cx0 = -30 + (c + 0.08 + wRng() * 0.84) / 13 * 880;
      const inClump = 1 + Math.round(wRng() * 3.2);
      for (let k = 0; k < inClump; k++) {
        const wx = cx0 + (wRng() + wRng() - 1) * 38;
        const ty = groundTop(wx) + 2 + wRng() * 10;
        const th = 16 + Math.pow(wRng(), 1.5) * 40;
        if (clearHouse(wx) || wx < -34 || wx > 838) continue;
        const G2 = E.gAt('wood', wx, ty, th).child('branch');
        const rr = th * 0.34, ccy = ty - th * 0.58;
        const tips = E.limbs(out, counter, wRng, G2, wx, ty - th * 0.44, {
          len0: th * 0.26, lw0: 1.1, minLen: th * 0.1, maxDepth: th > 30 ? 2 : 1,
          col: (x, y, r) => jig(mix('#3b2a18', '#6a5236', r() * 0.6 + hz(y) * 0.5), r, 7),
          pathOpts: { len: 3, density: 0.5, jitter: 0.45 },
        });
        const tipR = G2.child('crowns').rng();
        const crowns = [[wx, ccy, 1, wRng]].concat(E.spreadTips(tips, 2, rr * 0.7).map(t => [t[0], t[1], 0.56, tipR]));
        for (const [kx, kcy, mass, kr] of crowns) {
          const krr = rr * mass;
          strokes(out, counter, {
            rng: kr, n: Math.round(krr * 14),
            sample: r => { const a2 = r() * Math.PI * 2, d2 = Math.pow(r(), 0.55);
                           return [kx + Math.cos(a2) * krr * d2 * 1.1, kcy + Math.sin(a2) * krr * d2 * 0.82]; },
            dir: (x, y) => Math.atan2(y - kcy, x - kx) + Math.PI / 2,
            col: (x, y, r) => wCol(x, y, kcy - krr * 0.9, r),
            len: 3.2, lw: 1.7, steps: 2, lenJ: 0.75, impasto: 0.5, op: 0.94,
          });
        }
        paintPath(out, counter, wRng, [[wx, ty], [wx + (wRng() - 0.5) * 3, ty - th * 0.46]],
          (x, y, r) => jig(mix('#48331d', '#6d5537', r() * 0.7 + hz(y) * 0.5), r, 7),
          { lw: 1.3, len: 3, density: 0.7, jitter: 0.3 });
      }
    }
  }
  farRanges.push([_far, out.length]);   // ← birds, cypress, fringe (FAR plane)

  /* ---------------- 7b. THE TREES OF THE GARDEN ----------------
     ⚠ THIS PAGE HAD NO PAINTED TREES AT ALL. Fred, asking for gift's treatment here:
     "i like the way you drew gift. the details on the leaves, the shadows from the sun,
     the landscape have texture, trees sway, kingdom detailed." Its meadow was already
     grown by recursive subdivision and its flowers already grow in colonies — what was
     missing is the thing that carries leaf detail and a cast shadow: `paintTree`. It was
     called ZERO times here and twice on gift, which is the whole difference.

     The rule lives in gen/engine.mjs; the short version is that the crown goes YELLOW and
     pale while the belly goes deep and cool, because the light is above — value alone
     gives a grey ball, value plus hue gives a tree. And each one CASTS A SHADOW, which is
     what fastens it to the ground instead of pasting it on.

     ⚠ WHERE THEY MAY STAND. The palace occupies x 235..567 down to its base at y 322, the
     road climbs from (210,508) to (401,324), and the carried pair hold x 313..372. So the
     garden fills the two open quarters of meadow either side of the road, below the city —
     which also frames the walk home instead of competing with it. */
  {
    const treeAt = (tx, ty, th) => E.paintTree(out, counter, rng, tx, ty, th, {
      lightFn: gGlow,                              // the door's wider reach, so the far
                                                   // trees still know where the light is
      shadowDir: tx < door.x ? -1 : 1,             // shadows lean away from the door
      blossom: 4,                                  // the land is in flower (Isa 35:1)
    });
    // near and big at the bottom corners, smaller as the ground recedes — the scale
    // gradient is what makes the meadow deep rather than a green wall
    // ⚠ PROPORTION. Fred: "how can the trees be that small?" The Father standing in this
    // meadow is 128 units; my near trees were 148 — a man's height and a half, which is a
    // sapling, not a tree. A grown tree is three or four times a man. So the two nearest
    // now stand 300 and their crowns run up past the horizon into the sky, which is what
    // a foreground tree does and what gives the meadow its depth; the rest fall away on a
    // scale gradient to 66 at the city's foot, where they also give the palace its size.
    // ⚠ Kept off the poem's corner and clear of the palace (x 235–567 above y 322) — the
    // two giants sit at the extreme edges where their canopies crop the frame instead.
    // ⚠ SPACED BY A RULE, NOT BY EYE. Fred, circling two trunks on the right: "you can
    // see a tree on top of a tree." My earlier check compared CANOPY centres and let the
    // two 300-unit giants overlap anything, on the theory that a near tree crossing a far
    // one is depth. That theory is fine for canopies and wrong for TRUNKS: two trunks
    // standing close at similar depth read as one doubled tree however far apart their
    // crowns are. The pair he circled were 56 apart.
    // The whole stand — painted AND the four sway sprites in engine/scene.js — is now
    // laid out so no two trunks are within 70 units of each other unless they are more
    // than 130 apart in depth, and nothing stands on the road or in front of the palace.
    // ⚠ The sprites move WITH this list. They were 28 apart from each other, which I had
    // never checked because they live in the other file.
    // ⚠ SPACED BY A RULE, NOT BY EYE — no two trunks within 70 units unless they are more
    // than 130 apart in depth, nothing on the road, nothing in front of the palace. The
    // sway sprites in engine/scene.js are part of this same layout and move WITH it; they
    // live in another file and were never compared against these until two of them ended
    // up 28 apart.
    // ⚠ AND THE KINGDOM'S BOTTOM-LEFT IS COVERED. Fred: "cover the bottom left of the
    // kingdom." That corner cannot be fixed with more far wood — the wood lives up at the
    // horizon (its base is groundTop+6, about y 246) while the palace's outer tower stands
    // in the MEADOW with its foot at y 322, seventy units below it. So it takes a
    // mid-ground tree: (140,350,110) throws a canopy over x 103..177, y 252..327, which
    // contains the bare tower base at x 145..173. The two left sprites moved out to 58 and
    // 210 to make room for it without crowding.
    for (const [tx, ty, th] of [
      [36, 498, 300], [806, 494, 300],                        // the two near giants
      // ⚠ A CLUSTER, NOT ONE TREE — AND THE SPACING RULE IS DELIBERATELY SET ASIDE HERE.
      // Fred, twice, on the kingdom's bottom-left: "cover the bottom left of the kingdom"
      // then "u did nothing. cover with trees." My single tree at (140,350,110) threw a
      // canopy over x 103..177 and the bare tower slab runs to about x 195, so it covered
      // the left half of the problem and left the rest showing.
      // The 70-unit trunk rule exists to stop two BIG trees in open meadow reading as one
      // doubled tree. It is the wrong rule for a wood: "a forest should be very populated
      // with no bald spots" — a tree alone in its own gap reads as a shrub on a lawn, and
      // overlap is what reads as forest. So this is three trees stepping back in depth and
      // down in height, together covering x 112..238, y 252..328 — the whole bare strip.
      [150, 352, 112], [186, 338, 84], [216, 326, 64],
      [290, 348, 88],                                         // left of the road
      [486, 340, 70], [556, 344, 74],                         // right, at the city's foot
    ]) treeAt(tx, ty, th);
  }

  /* ---------------- 7c. THE FAR COUNTRY, FILLED AS A FIELD ----------------
     ⚠ `gift` IS THE REFERENCE. Fred, after I answered "cover the edges of the kingdom"
     three times by hand-placing one or two more trees: "use 'gift' as a reference please."
     He is right, and the difference is not the trees — it is the METHOD. gift does not
     place trees at all; it FILLS a band: a column every few units across the whole width,
     two or three ranks deep in each, jittered so no rank lines up, and nothing skipped but
     the road. Trees overlap, and the overlap is what reads as forest — a tree standing
     alone in its own gap reads as a shrub on a lawn. Hand-placing can never get there:
     every tree I added by hand was one more shrub.
     ⚠ ITS OWN RNG STREAM, never the plate's. If these drew from `rng`, changing any mark
     upstream would move every tree in the wood — gift lost a whole side that way once.
     ⚠ Density is one dial:  GROVE_N=4 node gen/build.mjs twoways   */
  {
    // every trunk the field must not stand on: the painted specimens above, and the four
    // swaying sprites from engine/scene.js (SCENE1[17], type 'tree2')
    const KEEP_CLEAR = [
      [36, 498, 300], [806, 494, 300],                          // the near giants
      [150, 352, 112], [186, 338, 84], [216, 326, 64],          // the bottom-left cluster
      [290, 348, 88], [486, 340, 70], [556, 344, 74],           // the rest of the specimens
      [40, 344, 96], [100, 366, 128], [640, 452, 180], [726, 386, 120],   // ← the SWAY SPRITES
    ];
    const GROVE_N = +(process.env.GROVE_N || 3.0);
    const gRng = mulberry32(seed ^ 0x9e3779b9);
    const NX = Math.max(6, Math.round(10 * GROVE_N));
    for (let i = 0; i < NX; i++) {
      const gx = -34 + (i + 0.12 + gRng() * 0.76) / NX * 888;
      const ranks = 2 + Math.round(gRng() * 1.4);
      for (let r2 = 0; r2 < ranks; r2++) {
        const d = Math.min(1, (r2 + 0.1 + gRng() * 0.8) / ranks);   // near ranks come forward
        const gy = groundTop(gx) + 10 + Math.pow(d, 1.55) * 150;
        const tx = gx + (gRng() - 0.5) * 26;
        const th = 20 + gRng() * 42;
        // the way home is never covered, and neither is the city itself — the wood is the
        // COUNTRY the kingdom stands in, so it may crowd right up to the outer towers and
        // over their feet, but the gate and the towers stay clear.
        if (onRoad(tx, gy)) continue;
        if (tx > 225 && tx < 585 && gy < 366) continue;              // the city's footprint
        if (Math.abs(tx - door.x) < 120 && gy < 430) continue;       // the gate, and the way to it
        // ⚠ AND IT MUST KEEP CLEAR OF EVERY TREE THAT IS NOT ITS OWN. Fred: "there are
        // still trees on top of trees." A field that fills a band is right, but it was
        // filling straight over the hand-placed specimens AND over the four SWAY SPRITES,
        // which live in engine/scene.js and which this file otherwise knows nothing about
        // — so the wood kept planting a still twin beside a moving tree. Overlap inside
        // the wood reads as forest; overlap ON a named tree reads as a double.
        // ⚠ KEEP THIS LIST IN SYNC with the specimen list above and with SCENE1[17]'s
        // tree2 entries in engine/scene.js. The two files have to be read together.
        // ⚠ Sep 14, Fred: "twoways also has a tree that grows from a tree." The old window
        // (|gy − ky| < 62) let a grove trunk stand INSIDE a taller specimen's crown, as long
        // as its foot was more than 62 above the specimen's foot. The test is the CROWN BOX:
        // no grove tree may root anywhere between a neighbour's crown-top and its foot.
        if (KEEP_CLEAR.some(([kx, ky, kh]) =>
              Math.abs(tx - kx) < 26 + kh * 0.28 && gy > ky - kh - 8 && gy < ky + 26)) continue;
        E.paintTree(out, counter, mulberry32((seed + i * 733 + r2 * 197) >>> 0), tx, gy, th, {
          lightFn: gGlow, shadowDir: tx < door.x ? -1 : 1, blossom: 2,
        });
      }
    }
  }
  // white sheep in green pastures (Ps 23; Luke 15) — woolly, pale, dark face + legs
  const shp = (sx, sy, s) => { strokes(out, counter, { rng, n: Math.round(22 * s), sample: r => { const a = r() * Math.PI * 2, dd = Math.pow(r(), 0.7); return [sx + Math.cos(a) * 9 * s * dd, sy + Math.sin(a) * 5 * s * dd]; }, dir: () => 0, col: (x, y, r) => jig(mix('#e6dcc4', '#f6f0de', r() * 0.6), r, 7), len: 3 * s, lw: 2 * s, steps: 2 }); paintPath(out, counter, rng, [[sx - 8 * s, sy - 1 * s], [sx - 11 * s, sy + 1.5 * s]], (x, y, r) => jig('#3a322a', r, 4), { lw: 2 * s, len: 2, density: 1 }); for (const lx of [-5, 0, 5]) paintPath(out, counter, rng, [[sx + lx * s, sy + 3 * s], [sx + lx * s, sy + 6 * s]], (x, y, r) => jig('#3a322a', r, 4), { lw: 1.1 * s, len: 2, density: 0.9 }); };
  shp(636, 300, 0.9); shp(690, 340, 0.78); shp(584, 332, 0.74); shp(742, 318, 0.7);
  // bushes
  const bush = (bx, by, w, h) => strokes(out, counter, { rng, n: Math.round(w * 1.5), sample: r => { const a = r() * Math.PI * 2, dd = Math.pow(r(), 0.7); return [bx + Math.cos(a) * w * dd, by - Math.abs(Math.sin(a)) * h * dd]; }, dir: () => -Math.PI / 2, col: (x, y, r) => jig(ramp(['#2a5230', '#3a6c3c', '#4e8446'], fbm(x / 12, y / 12, 261) + r() * 0.25), r, 8), len: 6, lw: 2, steps: 2, lenJ: 0.5 });
  bush(150, 470, 16, 11); bush(512, 392, 13, 9);
  // FLOURISHING wildflowers across the meadow (Isa 35:1)
  strokes(out, counter, {
    rng, n: 130,
    sample: rej(-6, horizon + 8, 812, 508, (x, y) => !onRoad(x, y) && !onFigure(x, y) && fbm(x / 34, y / 26, 881) > 0.56),
    dir: () => -Math.PI / 2,
    col: (x, y, r) => { const k = r(); return jig(k < 0.22 ? '#ee5c84' : k < 0.44 ? '#a47ce0' : k < 0.64 ? '#f6c63e' : k < 0.82 ? '#fafafa' : '#f29ad0', r, 13); },
    len: (x, y) => 3 + (y - horizon) / (510 - horizon) * 4, lw: (x, y) => 2.2 + (y - horizon) / (510 - horizon) * 1.6, steps: 1, lenJ: 0.5, impasto: 0.3,
  });

  // egg: the tiny church spire from plate 02, far off on the left horizon
  {
    const spx = 60, spy = horizon - 2;
    paintPath(out, counter, rng, [[spx - 3, spy - 9], [spx, spy - 28], [spx + 3, spy - 9]], (x, y, r) => jig('#33405e', r, 6), { lw: 1.6, len: 3, density: 0.8, jitter: 0.5 });
  }

  // ARRIVAL = the most lush page in the book: this IS the destination, the
  // Father's house, paradise restored. Big fruit-trees in crazy free colour
  // crowd the meadow, heavy with glowing fruit, framing the home (Isa 35:1).  [FG plane]
  // fruit-trees PLANTED in the meadow — each rooted in the MID field, so its base
  // stays with the ground as the view turns (planted, not floating).
  // ⚠ THE ORCHARD AT THE DOOR IS GREEN. These four were teal, pink and violet — candy floss
  // on sticks, the same fault that was corrected on `ran`. Munch's free colour is real, but a
  // child has to be able to say "tree" before the art gets to be clever (Matt 18:3), so the
  // homecoming garden is greens with fruit for the colour. They branch by the shared rule now,
  // and there are more of them: this is the Father's own garden, and it should look tended.
  const orchard = [
    [80, 478, 94, 44, 0], [158, 430, 54, 26, 1], [766, 490, 98, 46, 2], [700, 432, 58, 27, 0],
    [232, 404, 44, 21, 1], [612, 400, 46, 22, 2], [40, 418, 50, 24, 2], [806, 428, 52, 25, 1],
  ];
  for (const [ox, oy, oh, ow, pal] of orchard) {
    // the shadow first — it lies on the ground and leans away from the door's light, longer
    // the further the tree stands from it, which is what tells the eye where the light IS
    const dxs = ox - dc[0], dys = Math.max(24, oy - dc[1]);
    const len = Math.hypot(dxs, dys), ux = dxs / len, uy = dys / len;
    const sl = ow * (0.9 + len / 420);
    strokes(out, counter, {
      rng, n: Math.round(ow * 2.4),
      sample: r => { const t = Math.pow(r(), 0.7), w2 = ow * 0.5 * (1 - t * 0.35);
                     return [ox + ux * sl * t + (r() + r() - 1) * w2, oy + uy * sl * t * 0.42 + (r() - 0.5) * ow * 0.3]; },
      dir: () => Math.atan2(uy * 0.42, ux),
      col: (x, y, r) => jig(mix('#1c4430', '#2e6038', r() * 0.6 + gD(x, y) * 0.3), r, 8),
      len: 9, lw: 3, steps: 2, lenJ: 0.6, impasto: 0.35, op: 0.42,
    });
    E.fruitTree(out, counter, rng, ox, oy, oh, ow, E.LEAF_GREENS[pal], gD);
  }

  /* ---------------- 8. LIFE — the homecoming CELEBRATION (Luke 15:24) ----------------
     "this my son was dead, and is alive again" — the whole house rejoices.
     SWALLOWS wheel around the blazing home (celebrating, never ON the house or
     the lintel), and climbing ROSES garland the gold walls' edges and the
     doorpost feet — a welcome in bloom (SoS 2:12 "the flowers appear on the
     earth; the time of the singing of birds is come"). Mid band, with the house. */
  {
    // SWALLOWS — four dark wheeling forms in the bright glow: curved back-swept
    // wings (Munch: living = curved), deep forked tail, one white throat-fleck.
    const swCol = (x, y, r) => jig(mix('#222c46', '#38425e', r() * 0.5), r, 6);
    const swallow = (bx, by, s, tilt) => {
      const ca = Math.cos(tilt), sa = Math.sin(tilt);
      const P = (px, py) => [bx + (px * ca - py * sa) * s, by + (px * sa + py * ca) * s];
      paintPath(out, counter, rng, [P(-11, -1.5), P(-7, -5.5), P(-2.5, -1.5), P(0, 0.5)], swCol, { lw: 1.9 * s, len: 3, density: 0.95, jitter: 0.35 });
      paintPath(out, counter, rng, [P(0, 0.5), P(2.5, -1.5), P(7, -5.5), P(11, -1.5)], swCol, { lw: 1.9 * s, len: 3, density: 0.95, jitter: 0.35 });
      paintPath(out, counter, rng, [P(-2, 0.5), P(2.5, 1.6)], swCol, { lw: 2.4 * s, len: 2.5, density: 1, jitter: 0.25 });    // body
      paintPath(out, counter, rng, [P(2.5, 1.6), P(7.5, 4.4)], swCol, { lw: 1.1 * s, len: 2.2, density: 0.9, jitter: 0.3 }); // forked tail
      paintPath(out, counter, rng, [P(2.5, 1.6), P(8, 0.8)], swCol, { lw: 1.1 * s, len: 2.2, density: 0.9, jitter: 0.3 });
      paintPath(out, counter, rng, [P(-1.6, 1.4), P(0.6, 1.7)], (x, y, r) => jig('#f6ede0', r, 5), { lw: 1.2 * s, len: 1.6, density: 1, jitter: 0.2 }); // throat
    };
    swallow(330, 198, 1.05, -0.38);   // banking up the left of the roof
    swallow(488, 213, 0.9, 0.42);     // sweeping down the right
    swallow(366, 156, 0.95, 0.12);    // crossing high above the peak, left
    swallow(452, 170, 0.8, -0.2);     // trailing above, right

    // CLIMBING ROSES — warm reds/pinks, dark-on-gold; garlands up the two wall
    // edges + posies at the doorpost feet. Clear of the door opening, both
    // white-hot windows, the 10:9 lintel egg and the height-notch egg (y<306 kept free).
    const leafC = (x, y, r) => jig(mix('#2e6a34', '#4e8a40', r() * 0.6), r, 8);
    const roseC = (x, y, r) => { const k = r(); return jig(k < 0.4 ? '#d0384e' : k < 0.75 ? '#ee7896' : '#f6aac2', r, 9); };
    const bloom = (bx, by, s) => strokes(out, counter, {
      rng, n: 5,
      sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 0.6) * 2.6 * s; return [bx + Math.cos(a) * d, by + Math.sin(a) * d]; },
      dir: (x, y) => Math.atan2(y - by, x - bx) + Math.PI / 2,   // petals curl round the heart
      col: roseC, len: 2.6 * s, lw: 1.7 * s, steps: 2, lenJ: 0.4,
    });
    const garland = (gx, yTop, yBot, sway) => {
      const px = t => gx + Math.sin(t * 5.2 + gx) * sway;
      const pts = []; for (let t = 0; t <= 1.001; t += 0.1) pts.push([px(t), yBot + (yTop - yBot) * t]);
      paintPath(out, counter, rng, pts, leafC, { lw: 1.4, len: 3, density: 0.85, jitter: 0.45 });
      for (let t = 0.08; t < 1; t += 0.16) {
        const y = yBot + (yTop - yBot) * t;
        paintPath(out, counter, rng, [[px(t), y + 3], [px(t) + (rng() < 0.5 ? -4 : 4), y + 5.5]], leafC, { lw: 1.2, len: 2.2, density: 0.9, jitter: 0.4 });
        bloom(px(t) + (rng() - 0.5) * 3, y, 0.85 + rng() * 0.4);
      }
    };
    // ⚠ Sep 14: the two wall-edge garlands are OFF. Since paintPalace grew its own walls, corners
    // and trees of life, these hung down the old house's edges as two thin green STRINGS from the
    // sky to the ground (Fred's eye caught them). The posies at the doorposts stay.
    // garland(house.x - house.hw, house.top + 10, house.base - 2, 4);
    // garland(house.x + house.hw, house.top + 10, house.base - 2, 4);
    for (const px2 of [door.x - fl - 2, door.x + fl + 2]) {           // posies at the doorpost feet
      const o = px2 < door.x ? -1 : 1;
      paintPath(out, counter, rng, [[px2, door.y1 + 1], [px2 + o * 2, door.y1 - 9]], leafC, { lw: 1.4, len: 2.5, density: 0.9, jitter: 0.4 });
      bloom(px2 + o * 1.5, door.y1 - 9, 1.0);
      bloom(px2 + o * 3.5, door.y1 - 3, 0.85);
    }
  }

  // MULTIPLANE: assemble the requested depth plane. Each is its own cel —
  // transparent where it has no content — so they stack and parallax apart like
  // the painted-background-plus-acetate-cels of hand-drawn animation.

  const ALT = 'The full bright new world: a swirling dawn sky over a flourishing green meadow loud with wildflowers, fruit trees and sheep. Dead centre stands the Father\'s house ablaze with light — gold walls, a terracotta roof, white-hot windows and one glowing door opening on a whole world of colour beyond. Up a curving path the radiant golden Father carries a small dark child high on his shoulders, the child\'s arms flung up in joy, bearing you home through the door. He layeth it on his shoulders, rejoicing.';
  const RAW = { undercoat: 0, weave: 0, varnish: 0, oil: 0 };   // no baked surface — the live filter unifies the planes
  const setOf = ranges => { const s = new Set(); for (const [a, b] of ranges) for (let i = a; i < b; i++) s.add(i); return s; };
  const pick = ranges => ranges.map(([a, b]) => out.slice(a, b).join('\n')).join('\n');
  const farSet = setOf(farRanges), fgSet = setOf(fgRanges);
  if (LAYER === 'sky') return svgWrap(ALT, out.slice(0, skyEnd).join('\n'), RAW);   // smooth sky ground (opaque backmost)
  const sm = LAYER.match(/^sky(\d+)$/);
  if (sm) return svgWrap(ALT, '<g>' + skySheets[+sm[1] - 1] + '</g>', RAW);         // one sky-swirl sheet
  if (LAYER === 'far') return svgWrap(ALT, pick(farRanges), RAW);                   // distant hills, birds, cypress
  if (LAYER === 'fg') return svgWrap(ALT, pick(fgRanges), RAW);                     // the carried Father + child
  if (LAYER === 'mid') {                                                            // meadow, path, house, door, sheep, planted trees
    const body = out.filter((_, i) => i >= skyEnd && !farSet.has(i) && !fgSet.has(i)).join('\n');
    return svgWrap(ALT, body, RAW);
  }
  // full painting (desktop): sky ground, the stacked sky-sheets, then everything else
  return svgWrap(ALT, out.slice(0, skyEnd).concat(skySheets, out.slice(skyEnd)).join('\n'));
}
