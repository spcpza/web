// gen/plates/flame.mjs — "He made the world"
//
//   "And God said, Let there be light: and there was light." — Genesis 1:3
//   "And God saw the light, that it was good." — Genesis 1:4
//
// The FIRST MORNING. A bright, radiant NEW WORLD being made — light pouring
// over the face of the waters, breaking over fresh land, filling a vibrant
// young sky. The Light speaks and the world wakes good: gold dawn high above,
// the great deep gathered below catching fire with the morning, green earth
// rising new. No night, no candle, no child — only the world, newly made,
// and the light that made it, "and it was good."
//
// House style: radiant gold light, Munch curves (waters swirl, land curves,
// made-nothing here is straight), vibrant, no black; painterly density.
//
// MOBILE 3D — depth planes (FAR→NEAR): the radiant dawn sky with the rising
// light-source rides backmost (opaque); distant new hills on the FAR plane
// parallax along the horizon; the MID plane is the new land and the gathered
// waters with their swirling light; the FG plane is the near shore bursting
// with the first fruit-life. `full`/desktop = the original draw order.

export const name = 'flame';
export const title = 'He made the world';
export const caption = 'He made the world, and filled it with light.';
export const seed = 20260611;
export const focal = { x: 400, y: 250 }; // portrait window: the rising light over the waters
// stacked SKY-SWIRL SHEETS — paint on paint, gapped, each its own depth plane
// ⭐ DETAIL PASS (Sep 8): 168/184 slabs at lw 9 → ~650 finer marks per sheet, every
// stroke its own width and length (free hashes, no rule — see widthOf/lengthOf below)
export const SKY_SHEETS = [
  { n: 620, len: 20, lw: 4.6, lift: 0.00 },
  { n: 680, len: 18, lw: 4.2, lift: 0.07 },
];
export const layers = [
  { name: 'sky', opaque: true },  // smooth radiant dawn-sky ground + the rising light (backmost)
  ...SKY_SHEETS.map((_, i) => ({ name: 'sky' + (i + 1) })),   // stacked sky-swirl sheets
  { name: 'far' },                // distant new hills (the moving horizon)
  { name: 'mid' },                // the gathered waters + the new land + swirling light
  { name: 'fg' },                 // the near shore + the first fruit-life
  { name: 'near' },               // ⚠ THE TWO GREAT TREES at the plate's far edges (closest of all)
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
  const LAYER = opts.layer || 'full';
  const farRanges = [], fgRanges = [], nearRanges = [];
  // ⭐ EVERY STROKE DRAWS ITS OWN WIDTH AND LENGTH (Fred: "use no rules, a paint stroke
  // just exist because it exist") — two independent hashes per mark, no field, no coupling.
  // The deficit this pass cures: every mark on the page was the same fat blob.
  const free = (x, y, salt) => { const n = Math.sin(x * 12.9898 + y * 78.233 + salt) * 43758.5453; return n - Math.floor(n); };
  const widthOf  = (x, y, salt) => 0.40 + 3.2 * Math.pow(free(x, y, salt), 2.6);
  const lengthOf = (x, y, salt) => 0.40 + 1.5 * Math.pow(free(x, y, salt + 17), 1.5);
  let _fishA = -1, _fishB = -1;   // the painted leaping fish — replaced by the swimming rig
  out.push(`<rect width="${W}" height="${H}" fill="#7fc6f2"/>`);   // bright young sky — never black

  // the rising LIGHT — the plate's one source: "Let there be light." It rises
  // low and central over the waters, answered by a great glory overhead.
  const lightC = { x: 400, y: 226 };
  const rise = lightRadial(lightC.x, lightC.y, 320);
  const glory = lightRadial(400, 80, 360);
  const lightAt = (x, y) => Math.min(1, rise(x, y) * 1.15 + glory(x, y) * 0.55);
  // the firmament between waters: the sea-line where gathered waters meet sky
  const seaY = x => 268 + 10 * Math.sin(x / 150) + (x - 400) * 0.008;

  /* ---------------- 1. THE FIRST-MORNING SKY — light, swirling, made ----------------
     the sky is nature, so it swirls (Munch) — a gentle radiant turn out of the
     rising light, the morning of the world, joyful, not storm. A luminous
     gradient underpaints it so every gap glows. */
  out.push(`<defs><linearGradient id="dawn02" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#a9e1fb"/>
<stop offset="0.42" stop-color="#8fcaf2"/>
<stop offset="0.7" stop-color="#f3b0c2"/>
<stop offset="0.88" stop-color="#ffce7a"/>
<stop offset="1" stop-color="#ffe49a"/>
</linearGradient></defs>`);
  out.push(`<rect x="-12" y="-12" width="${W + 24}" height="296" fill="url(#dawn02)"/>`);
  counter.n++;
  // THE ALIVE DAWN SKY (the fractal sky — motion at three scales): the whole
  // morning WHEELS in one great spiral around the rising light (macro), a few
  // eddies turn inside the wheel (mid), and every stroke curves with its parent
  // current (micro). Swirls within swirls — the dawn is deep moving light, the
  // same alive hand as looking/garden (kept warm/gentle, first-morning, not storm).
  const WHEEL_X = 400, WHEEL_Y = 226;                 // the great wheel turns on the rising light
  const EDDIES = [[150, 92, 54], [560, 72, -58], [672, 176, 50], [280, 150, -48]];
  const nearV = (x, y) => { let m = 1e9; for (const [ex, ey] of EDDIES) m = Math.min(m, Math.hypot(x - ex, y - ey) / 52); return m; };
  const skyDir = (x, y) => {
    let vx = 14, vy = -5;   // a gentle upward breath (the light rising); the wheel rides on top
    { const [a, b] = goldenSpiralV(x, y, WHEEL_X, WHEEL_Y, 115, 260); vx += a; vy += b; }   // MACRO — the great wheel of the dawn
    for (const [ex, ey, s] of EDDIES) { const [a, b] = goldenSpiralV(x, y, ex, ey, s, 80); vx += a; vy += b; } // MID — eddies turning inside
    const [c, d] = curlV(x, y, 31, 120); vx += c * 26; vy += d * 26;   // MICRO — fine turbulence on every stroke
    return Math.atan2(vy, vx);
  };
  // jewel eddy-glows — each mid-eddy core breathes a deep dawn tint (rose/violet/
  // gold), the alive richness (kept subtle; the rising light still overrides)
  const EGLOW = [[150, 92, '#e28aa6'], [560, 72, '#e6b45a'], [672, 176, '#a07cc0'], [280, 150, '#d087b0']];
  const skyCol = (x, y, r, lift) => {
    const t = Math.max(0, Math.min(1, 0.05 + (y / 268) * 0.5 + fbm(x / 130, y / 120, 13) * 0.28));
    let c = ramp(['#7ccdfb', '#6cb8f4', '#86aef0', '#f3a6c0', '#ffc66e', '#ffe08a'], t); // blue high → rose → gold low (Sep 21: the blues deepened — see the note below)
    for (const [ex, ey, ec] of EGLOW) { const d2 = Math.hypot(x - ex, y - ey); c = mix(c, ec, Math.exp(-d2 / 80) * 0.3); }   // the eddy cores breathe faint jewel light
    /* ⭐ "WHO COVEREST THYSELF WITH LIGHT AS WITH A GARMENT: WHO STRETCHEST OUT THE HEAVENS LIKE A
       CURTAIN" (Ps 104:2, the creation psalm, on the creation page; Sep 21). Both halves are
       cloth. So the firmament is painted as one: long soft FOLDS fanning out of the rising light
       — a pleat is a valley of deeper blue beside a ridge that catches the light — strongest
       high in the sky where it is stretched, and gone near the sun, where the cloth is simply
       light. The folds ride a slow warp so no two are the same width; it is a hung thing, not
       a ruled fan. (The Light's FIGURE is left exactly as it is: Fred ruled, from 1 John 1:5,
       that He wears no garment — He IS light. This is His sky, not His robe.) */
    { const ang = Math.atan2(y - WHEEL_Y, x - WHEEL_X), dist = Math.hypot(x - WHEEL_X, y - WHEEL_Y);
      const fold = 0.5 + 0.5 * Math.sin(ang * 13 + fbm(x / 170, y / 150, 61) * 5.5);
      const k = Math.max(0, Math.min(1, (dist - 120) / 200)) * (1 - Math.min(1, rise(x, y) * 1.4));
      c = mix(c, '#5b8fd8', Math.pow(fold, 2.2) * 0.30 * k);              // the valley of the pleat
      c = mix(c, '#ffffff', Math.pow(1 - fold, 5) * 0.34 * k); }          // the ridge, catching the morning
    /* ⚠⚠ THE FIRST MORNING WAS GREY — MEASURED (Sep 21): the upper sky's planes had a saturation of
       0.04. Not relief, not the filter: `glory` is a 360-unit pool centred at the TOP of the frame,
       so pale gold was mixed into the pale blue across the entire sky, and the book's own rule
       says what that makes — "yellow mixed over blue muddies green-grey; keep yellow at the
       horizon." Gold now belongs to the SUN: it falls off fast with distance from the rising
       light and is gone by the high sky, which is left a clean, committed blue. */
    const warm = Math.pow(rise(x, y), 1.7);
    c = mix(c, GOLD_PALE, warm * 0.62 + glory(x, y) * warm * 0.25);
    if (lift) c = mix(c, '#ffffff', lift * (0.4 + warm * 0.6));
    return jig(c, r, 6);
  };
  // the smooth dawn-sky GROUND — broad soft masses (opaque base); the swirling
  // brushwork lives in the stacked sheets above, so their gaps reveal this paint
  strokes(out, counter, {
    rng, n: 900, sample: rej(-12, -12, 812, 296, (x, y) => y < seaY(x) + 8),
    dir: skyDir, col: (x, y, r) => skyCol(x, y, r, 0),
    len: (x, y) => 30 * lengthOf(x, y, 11), lw: (x, y) => 5.2 * widthOf(x, y, 13),
    // ⚠ relief: 0.12 (Sep 21). This pass OMITTED relief, and strokes() defaults it to 1 — the book's
    // known trap (relief_default_trap): every broad soft mark gets a full bevel and the first
    // morning of the world came out as GREY FLAGSTONES, its blue-rose-gold ramp buried under its
    // own shading. Air takes almost none.
    steps: 4, follow: 0.91, wild: 0.05, lenJ: 0.3, wJ: 0.3, impasto: 0.5, relief: 0.12,
  });
  // VAN GOGH ARMS — streaming light: long curling filaments riding the new dawn,
  // bright (rose into gold), glory pouring up across the firmament
  strokes(out, counter, {
    rng, n: 600,
    sample: rej(-12, -12, 812, 282, (x, y) => y < seaY(x) + 2),
    dir: skyDir,
    col: (x, y, r) => {
      const k2 = fbm(x / 88, y / 88, 17) + (r() - 0.5) * 0.2;
      if (k2 > 0.78) return jig('#fffdf6', r, 8);  // bright cloud crests
      return jig(mix(mix('#bfe6fb', '#f4b6c6', Math.min(1, y / 220)), GOLD_PALE, Math.min(0.8, 0.2 + lightAt(x, y) * 0.8)), r, 6);
    },
    len: (x, y) => 24 * lengthOf(x, y, 21), lw: (x, y) => 2.6 * widthOf(x, y, 23),
    steps: 6, follow: 0.94, wild: 0.14, lenJ: 0.3, wJ: 0.3, impasto: 0.6, relief: 0.5,
  });
  /* ⚠ NOT DE-BAKED — this page goes the other way (Fred: "you can be creative!! maybe for
     this one make the painting move"). `beginning` holds still and hands its light to a
     rig; here the PAINTING is the animation: the sun stays painted, and the sea it lies on
     actually flows. A page is allowed its own method. */
  // the rising light's radiant core, low and central — the source of the first day
  strokes(out, counter, {
    rng, n: 150,
    sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 0.78) * 52; return [lightC.x + Math.cos(a) * d, lightC.y + Math.sin(a) * d * 0.92]; },
    dir: () => 0.2,
    col: (x, y, r) => jig(ramp([GOLD_HOT, GOLD_PALE, GOLD], Math.hypot(x - lightC.x, (y - lightC.y) / 0.92) / 52), r, 5),
    len: 8, lw: 3, steps: 2, impasto: 0.55,
  });
  // bold rays of the first morning streaming up and out across the sky
  strokes(out, counter, {
    rng, n: 96,
    sample: r => { const a = -Math.PI * (0.05 + r() * 0.9); const d = (0.4 + 0.82 * r()) * 252; return [lightC.x + Math.cos(a) * d, lightC.y + Math.sin(a) * d * 0.9]; },
    dir: (x, y) => Math.atan2(y - lightC.y, x - lightC.x),
    col: (x, y, r) => jig(mix(GOLD_HOT, GOLD_PALE, r() * 0.5), r, 6),
    len: (x, y) => 12 + Math.hypot(x - lightC.x, y - lightC.y) / 14, lw: 1.4, steps: 2, lenJ: 0.7, relief: 0,
  });
  // BIRDS of the fifth day rising into the new morning (Gen 1:20)
  for (const [bx, by, s] of [[166, 76, 1], [202, 90, 0.85], [138, 94, 0.8], [628, 84, 0.9], [668, 70, 0.78], [602, 98, 0.7]]) {
    paintPath(out, counter, rng, [[bx - 6 * s, by + 2.6 * s], [bx, by - 1.8 * s], [bx + 6 * s, by + 2.6 * s]], (x, y, r) => jig('#5a6ea0', r, 6), { lw: 1.5 * s, len: 3.4, density: 0.9, jitter: 0.5 });
  }
  const skyEnd = out.length;   // ← the smooth dawn-sky ground is the SKY plane (opaque)

  // the stacked SKY-SWIRL SHEETS — each an independent bold, gapped pass of the
  // first morning's gentle turn (paint on paint), own rng per sheet.
  const skySheets = SKY_SHEETS.map((e, k) => {
    const srng = mulberry32(seed + 1009 * (k + 1));
    const sh = [];
    strokes(sh, { n: 0 }, {
      rng: srng, n: e.n, sample: rej(-12, -12, 812, 296, (x, y) => y < seaY(x) + 8),
      dir: skyDir,
      col: (x, y, r) => {
        const near = nearV(x, y);
        if (near < 1.1 && r() < 0.06) return jig(r() < 0.5 ? '#fff4d8' : '#f8d6e0', r, 12);   // BRIGHT dawn knot-sparks (gold-white + pale rose)
        const k2 = fbm(x / 92, y / 92, 71) + (r() - 0.5) * 0.2;
        if (k2 > 0.76) return jig('#fff4d8', r, 8);                                            // BRIGHT warm gold-white crests (read against the dawn)
        return skyCol(x, y, r, e.lift);
      },
      len: (x, y) => e.len * lengthOf(x, y, 31 + k), lw: (x, y) => e.lw * widthOf(x, y, 37 + k),
      steps: 5, follow: 0.91, wild: 0.14, lenJ: 0.3, wJ: 0.3, impasto: 0.6, relief: 0.5,
      aJ: (x, y) => 0.16 + Math.max(0, 1.3 - nearV(x, y)) * 0.42,
    });
    /* ⭐ "WHEN THE MORNING STARS SANG TOGETHER, and all the sons of God shouted for joy" (Job 38:7) —
       said of the very hour this page paints: "Where wast thou when I laid the foundations of the
       earth?" (38:4). The first morning had a sun and no stars. They ride the TOP sheet, above
       the brushwork, high in the blue and well clear of the rising light, which would drown
       them; pale, because it is already day; and gathered rather than scattered — they sang
       TOGETHER. (Sep 21, the fresh scripture search.) */
    if (k === SKY_SHEETS.length - 1) {
      const c2 = { n: 0 };
      E.paintStars(sh, c2, mulberry32(seed ^ 0x3807), { x0: 150, y0: 4, x1: 650, y1: 118, n: 46, fall: 1.0, gloryK: 2.2, op: 0.8,
        mask: (x, y) => Math.hypot(x - lightC.x, y - lightC.y) > 170 });
      /* ⭐ Sep 23 — Gen 1:16: "the greater light to rule the day, and the lesser light to rule the
         night." A first morning has both: the sun just up over the waters, and the moon not yet
         gone — pale, high, lit on the side that faces the sun, its dark side the same blue as the
         sky it hangs in (a day moon has no outline there). Marks turn round the disc, and a few
         soft lilac seas sit in the lit part. Own rng; top sheet, beside the stars. */
      const MN = { x: 268, y: 46, r: 16 };   // ⚠ r 12.5 read as a grey smudge on the plate — a day moon is small but CLEAR
      const sd = Math.atan2(lightC.y - MN.y, lightC.x - MN.x);                 // toward the sun
      const lit = (x, y) => ((x - MN.x) * Math.cos(sd) + (y - MN.y) * Math.sin(sd)) / MN.r;   // -1 far limb .. +1 sun limb
      strokes(sh, c2, {
        rng: mulberry32(seed ^ 0x1016), n: 360,
        sample: r => { for (let t = 0; t < 30; t++) { const a = r() * Math.PI * 2, d = Math.sqrt(r()) * MN.r; const x = MN.x + Math.cos(a) * d, y = MN.y + Math.sin(a) * d; if (lit(x, y) > -0.28 + (r() - 0.5) * 0.12) return [x, y]; } return null; },
        dir: (x, y) => Math.atan2(y - MN.y, x - MN.x) + Math.PI / 2,
        col: (x, y, r) => {
          const k = Math.max(0, Math.min(1, (lit(x, y) + 0.28) / 0.9));
          let c = mix('#bccbe8', '#ffffff', Math.pow(k, 0.7));                                              // the terminator melts into the sky's blue
          const sea = fbm((x - MN.x) / 5 + 3, (y - MN.y) / 5 + 7, 1016);
          if (sea > 0.6) c = mix(c, '#c4bcd8', 0.4);                                        // the seas
          return jig(c, r, 4);
        },
        len: 3.6, lw: 2.1, steps: 2, lenJ: 0.4, relief: 0, impasto: 0, flow: 0,
      });
    }
    return sh.join('\n');
  });

  /* ---------------- 2. THE GATHERED WATERS — "let the waters be gathered" (Gen 1:9) ----------------
     the great deep, below the sea-line, catching fire with the morning. Water is
     nature, so it SWIRLS (Munch) — turning eddies of blue-green and gold under
     the rising light, "and the Spirit moved upon the face of the waters." */
  const waterDir = (x, y) => {
    // gentle ocean swirl: vortices in the deep + the morning glitter streaming out
    let vx = 14, vy = 0;
    const WV = [[300, 360, 70], [560, 392, -64], [180, 430, 56], [640, 446, -52]];
    for (const [vx0, vy0, s] of WV) { const [a, b] = goldenSpiralV(x, y, vx0, vy0, s, 60); vx += a; vy += b; }
    const [c, d] = curlV(x, y, 53, 120); vx += c * 44; vy += d * 44;
    return Math.atan2(vy, vx);
  };
  // ⚠ THE WATER NEEDS A BODY FIRST. On the PAGE (looked at 1:1) the sea was loose pale
  // flecks on the flat sky-blue base: the finer marks left gaps and the gaps were sky, not
  // water. Same lesson as the bough and the fruits — anything that must read as a MASS gets
  // an opaque body before its detail. Broad soft water strokes, the sea's own colours, no
  // whitening, so every gap between the finer marks is still sea.
  strokes(out, counter, {
    rng, n: 1100,
    sample: rej(-10, 256, 810, 512, (x, y) => y > seaY(x) - 2),
    dir: waterDir,
    col: (x, y, r) => {
      const depth = Math.max(0, (y - seaY(x)) / (H - seaY(x)));
      let c = ramp(['#8fcbe4', '#5fa8d0', '#3f93c0', '#2f6fa6', '#27568c'], 0.15 + fbm(x / 90, y / 70, 29) * 0.5 + depth * 0.45);
      c = mix(c, GOLD_PALE, lightAt(x, y) * 0.45);
      c = mix(c, '#a9d3e8', Math.pow(1 - depth, 2.2) * 0.4);
      return jig(c, r, 7);
    },
    len: (x, y) => (14 + Math.max(0, (y - seaY(x)) / (H - seaY(x))) * 30) * lengthOf(x, y, 45),
    lw: (x, y) => (3.0 + Math.max(0, (y - seaY(x)) / (H - seaY(x))) * 5.0) * widthOf(x, y, 47),
    steps: 4, follow: 0.94, lenJ: 0.3, wJ: 0.3, impasto: 0.0, relief: 0.3,
  });
  strokes(out, counter, {
    rng, n: 3200,
    sample: rej(-10, 256, 810, 512, (x, y) => y > seaY(x) - 2),
    dir: waterDir,
    col: (x, y, r) => {
      const depth = Math.max(0, (y - seaY(x)) / (H - seaY(x)));
      let c = ramp(['#bfe6f6', '#7fc3df', '#3f93c0', '#2f6fa6', '#27568c'], 0.1 + fbm(x / 70, y / 60, 29) * 0.7 + depth * 0.4);
      // the morning blazing on the water — a path of gold light across the deep
      c = mix(c, GOLD_PALE, lightAt(x, y) * 0.7);
      // ATMOSPHERIC PERSPECTIVE: the far water dissolves into the dawn air
      c = mix(c, '#d6ecf6', Math.pow(1 - depth, 1.9) * 0.55);
      return jig(c, r, 11);
    },
    // ONE-POINT SCALE GRADIENT: near swells are long and thick, far ripples tiny —
    // the sea itself recedes to the line where the light stands (still Munch-curved)
    len: (x, y) => (5 + Math.max(0, (y - seaY(x)) / (H - seaY(x))) * 22) * lengthOf(x, y, 51),
    lw: (x, y) => (1.0 + Math.max(0, (y - seaY(x)) / (H - seaY(x))) * 3.4) * widthOf(x, y, 53),
    steps: 4, follow: 0.93, wild: 0.04, lenJ: 0.3, wJ: 0.3, impasto: 0.6, relief: 0.5,   // ⚠ wild 0.14 → 0.04: at 3,200 marks the long hairlines read as RAIN over the water on the page
  });
  // the light on the water: hair-fine crests ONLY where the morning lies on the swells.
  // ⚠ At 1,100 marks everywhere and op 0.75 the whole sea went to TV snow on the page
  // (the memory rule: a field of small pale marks crawls). Fewer, dimmer, and gated to
  // the lit water, so they read as the sun on the sea and not as static.
  strokes(out, counter, {
    rng, n: 360,
    sample: rej(-10, 256, 810, 512, (x, y) => y > seaY(x) - 2 && lightAt(x, y) > 0.22),
    dir: waterDir,
    col: (x, y, r) => {
      const g = lightAt(x, y);
      let c = mix('#cfe8f4', GOLD_PALE, g);
      c = mix(c, '#5fa8d0', (1 - g) * 0.6);
      return jig(c, r, 6);
    },
    len: (x, y) => (5 + Math.max(0, (y - seaY(x)) / (H - seaY(x))) * 16) * lengthOf(x, y, 55),
    lw: (x, y) => (0.6 + Math.max(0, (y - seaY(x)) / (H - seaY(x))) * 1.0) * widthOf(x, y, 57),
    steps: 4, follow: 0.95, lenJ: 0.3, wJ: 0.3, impasto: 0.3, relief: 0.25, op: 0.55,
  });
  // THE GOLDEN TRACK — the sun's path on the water, drawn as the one-point
  // ORTHOGONAL of the whole page: a road of light running from the near shore
  // straight to the sun on the sea-line, its width and flecks shrinking by 1/Z.
  // The oldest one-point picture there is: light on water, leading to its source.
  strokes(out, counter, {
    rng, n: 520,
    sample: r => {
      const t = Math.pow(r(), 1.25);                    // crowd the near end
      const y = 500 - t * (500 - (seaY(lightC.x) + 3)); // shore → sea-line
      const depth = Math.max(0.02, (y - seaY(lightC.x)) / (H - seaY(lightC.x)));
      const w = 8 + depth * 92;                         // track width ∝ 1/Z
      return [lightC.x + (r() * 2 - 1) * w, y];
    },
    dir: (x, y) => Math.atan2(seaY(lightC.x) - y, lightC.x - x),   // flecks stream toward the sun
    col: (x, y, r) => jig(ramp([GOLD_HOT, GOLD_PALE, GOLD, GOLD_DEEP], Math.abs(x - lightC.x) / 110 + (r() - 0.5) * 0.2), r, 7),
    len: (x, y) => (3 + Math.max(0, (y - seaY(lightC.x)) / (H - seaY(lightC.x))) * 12) * lengthOf(x, y, 41),
    lw: (x, y) => (1 + Math.max(0, (y - seaY(lightC.x)) / (H - seaY(lightC.x))) * 2.6) * widthOf(x, y, 43),
    steps: 2, lenJ: 0.3, wJ: 0.3, impasto: 0.45,
  });

  // EGG (in the waters): the ICHTHYS-less first-creature — leave the water clean;
  // egg goes in the hill below as the Hebrew reference.

  // the sun's GLITTER PATH on the waters — broken gold flecks from the horizon under the sun,
  // widening and dimming as they come toward us: the light lying on the face of the deep
  strokes(out, counter, {
    rng, n: 2000,
    sample: r => { const t = Math.pow(r(), 0.8); const y = seaY(lightC.x) + 4 + t * 190; const half = 26 + t * 150; const x = lightC.x + (r() + r() - 1) * half; return y > seaY(x) + 2 ? [x, y] : null; },
    dir: (x, y) => 0.04 + (fbm(x / 30, y / 12, 831) - 0.5) * 0.4,
    col: (x, y, r) => { const t = (y - seaY(lightC.x)) / 190; return jig(mix(mix('#fff4cc', '#ffd76e', r() * 0.6), '#5fb0d8', Math.min(1, t * 0.9)), r, 4); },
    len: (x, y) => 4 + free(x, y, 833) * 10, lw: (x, y) => 1.0 + free(x, y, 835) * 1.8, steps: 2, lenJ: 0.5, wJ: 0.3, impasto: 0, relief: 0,
    op: (() => 0.85)(),
  });

  /* ---------------- 3. THE NEW LAND — "let the dry land appear" (Gen 1:9) ----------------
     fresh green earth rising at the near shore, lit gold by the morning, the
     first land of the made world. */
  // WAVE-TIPS breaking the sea-line. Sky strokes stop above seaY and sea strokes stop
  // below it, and two fields stopping at the same line leave a SEAM that reads as a
  // ruler however gently seaY curves (the twoways lesson: a stroke field must never
  // end at a straight line it doesn't own). Small curved caps straddle the line —
  // water is never a line, it is a fringe of light.
  strokes(out, counter, {
    rng, n: 380,
    sample: r => { const x = -10 + r() * 820; return [x, seaY(x) + (r() - 0.45) * 10]; },
    dir: (x, y) => (fbm(x / 40, y / 40, 271) - 0.5) * 0.5,
    col: (x, y, r) => {
      const nearSun = Math.max(0, 1 - Math.abs(x - 400) / 300);
      let c = r() < 0.5 ? '#dceef4' : r() < 0.75 ? '#9fd0dc' : '#f4e6b0';
      return jig(mix(c, '#ffe9a8', nearSun * 0.5), r, 9);
    },
    len: (x, y) => 6 + rng() * 9, lw: 2.4, steps: 2, lenJ: 0.5, impasto: 0.4,
  });

  // THE WATERS BRING FORTH — Gen 1:20-21: "let the waters bring forth abundantly
  // the moving creature that hath life… And God created great whales." The made
  // world TEEMS: a great whale breaks the far sea-line, fish leap the near water
  // with the morning gold on their backs. Simple bold silhouettes (the blade-fish
  // lesson: tiny detail mushes — dark shape + gold rim + splash reads).
  {
    _fishA = out.length;   // ⚠ the whale is de-baked with the fish: as a flat arc it read as a smear, and it is drawn by the rig now
    // the GREAT WHALE, far out by the light's track — dark back arc + fluke + spout
    const wx = 408, wy = 320, ws = 68;   // in the PALE water band (y~305-350) where the fish already read — dark-on-pale. Three placements looked first: 496 sat on mid-blue (vanished), 296-deep sat in the dark teal reflection strip (vanished again). The local hue decides, nothing else.
    out.push(`<path d="M${R1(wx - ws / 2)} ${R1(wy)} Q${R1(wx)} ${R1(wy - ws * 0.30)} ${R1(wx + ws / 2)} ${R1(wy - 2)} L${R1(wx + ws * 0.42)} ${R1(wy + 3)} Q${R1(wx)} ${R1(wy - ws * 0.16)} ${R1(wx - ws / 2)} ${R1(wy + 3)} Z" fill="#28486a" opacity="0.92"/>`);
    out.push(`<path d="M${R1(wx - ws / 2 - 9)} ${R1(wy - 7)} Q${R1(wx - ws / 2 - 2)} ${R1(wy - 1)} ${R1(wx - ws / 2 - 10)} ${R1(wy + 4)} Q${R1(wx - ws / 2 + 4)} ${R1(wy + 1)} ${R1(wx - ws / 2 - 9)} ${R1(wy - 7)} Z" fill="#28486a" opacity="0.9"/>`);   // fluke
    out.push(`<path d="M${R1(wx + ws * 0.30)} ${R1(wy - ws * 0.26)} q2 -10 7 -14 M${R1(wx + ws * 0.30)} ${R1(wy - ws * 0.26)} q-1 -11 3 -16" fill="none" stroke="#fdf4d8" stroke-width="2" opacity="0.75" stroke-linecap="round"/>`);   // the spout, catching the gold
    out.push(`<path d="M${R1(wx)} ${R1(wy - ws * 0.23)} q10 -3 20 1" fill="none" stroke="#ffe9a8" stroke-width="1.6" opacity="0.7"/>`);   // morning rim on the back
    counter.n += 4;
    // LEAPING FISH — two arcs of silver-blue joy in the near water
    const fish = (fx, fy, s, flip) => {
      const f = flip ? -1 : 1;
      // crescent body ARCHED CLEAR of the water — the air under the belly is what
      // reads as leaping; the old shape's belly sat on the line and the whole fish
      // read as a half-sunk hump (looked, cropped, confirmed)
      const nx2 = fx + s * 0.92 * f, ny2 = fy - s * 0.34;          // the nose
      const tx2 = fx - s * 0.72 * f, ty2 = fy - s * 0.42;          // the tail root
      out.push(`<path d="M${R1(nx2)} ${R1(ny2)} Q${R1(fx + s * 0.1 * f)} ${R1(fy - s * 1.1)} ${R1(tx2)} ${R1(ty2)} Q${R1(fx)} ${R1(fy - s * 0.34)} ${R1(nx2)} ${R1(ny2)} Z" fill="#3a6a92" opacity="0.95"/>`);
      out.push(`<path d="M${R1(tx2)} ${R1(ty2)} l${R1(-s * 0.34 * f)} ${R1(-s * 0.3)} l${R1(s * 0.14 * f)} ${R1(s * 0.34)} l${R1(-s * 0.3 * f)} ${R1(s * 0.16)} Z" fill="#3a6a92" opacity="0.95"/>`);   // forked tail
      out.push(`<path d="M${R1(fx + s * 0.6 * f)} ${R1(fy - s * 0.72)} Q${R1(fx + s * 0.05 * f)} ${R1(fy - s * 1.02)} ${R1(fx - s * 0.5 * f)} ${R1(fy - s * 0.62)}" fill="none" stroke="#ffe9a8" stroke-width="2" opacity="0.9"/>`);   // morning gold on the back
      out.push(`<circle cx="${R1(fx + s * 0.72 * f)}" cy="${R1(fy - s * 0.46)}" r="1.6" fill="#101c30"/>`);
      counter.n += 4;
    };
    // ⚠ THESE STAY PAINTED. I de-baked them once and replaced them with a runtime fish;
    // Fred: "the fishes are also damn ugly... i told you to delete it and you end up
    // deleting the fish emoji and make this the fishes." The painting's own sea-life was
    // never the problem. Whatever else moves on this page, the fish are the plate's.
    // ⚠ DE-BAKED: frozen mid-leap for ever, and replaced by fish that swim.
    fish(300, 352, 36, false);
    fish(524, 334, 24, true);
    _fishB = out.length;
    // splashes where they broke the water
    strokes(out, counter, {
      rng, n: 26,
      sample: r => { const p = r() < 0.6 ? [300, 364] : [545, 346]; return [p[0] + (r() - 0.5) * 26, p[1] + (r() - 0.2) * 7]; },
      dir: () => -Math.PI / 2.3,
      col: (x, y, r) => jig(mix('#eaf6fb', '#ffffff', r() * 0.6), r, 5),
      len: 5, lw: 1.5, steps: 2, lenJ: 0.6,
    });
  }

  const landTop = x => 380 + 13 * Math.sin(x / 120 + 1.2) - 8 * Math.exp(-(((x - 180) / 220) ** 2));
  const _fgLand = out.length;
  // underpaint: solid fresh green so gaps read lush
  // The ground's top edge is where it meets the sky — grass has no outline, it
  // has blades. This jagged contour replaces landTop in the FILL only (sampled fine
  // enough to keep the sawtooth; a coarse step averages it straight again).
  const landTopJag = x => {
    const fine = (fbm(x / 3.1, 2.1, 731) - 0.5) * 6.5;
    const tuft = Math.max(0, fbm(x / 8.5, 9.4, 733) - 0.52) * 24;
    return landTop(x) + fine - tuft;
  };
  {
    let d = `M-2 ${R1(landTopJag(-2))}`;
    for (let x = -2; x <= 802; x += 2.2) d += `L${R1(x)} ${R1(landTopJag(x))}`;
    d += `L802 ${H + 2}L-2 ${H + 2}Z`;
    out.push(`<path d="${d}" fill="#3f8a3a"/>`); counter.n++;
  }
  strokes(out, counter, {
    rng, n: 2400,
    sample: rej(-10, 364, 810, 512, (x, y) => y > landTop(x) - 1),
    dir: (x, y) => { const [vx, vy] = curlV(x, y, 167, 60); return Math.atan2(vy * 0.8 - 0.1, Math.abs(vx) + 0.7); },
    col: (x, y, r) => {
      const depth = (y - 364) / (H - 364);
      let c = ramp(['#2c7a4a', '#3f8a3a', '#5ea83e', '#86c44a', '#bcd862'], 0.1 + fbm(x / 60, y / 60, 341) * 0.85 + depth * 0.3);
      c = mix(c, GOLD_DEEP, lightAt(x, y) * 0.5);   // warming gold where the new light falls
      return jig(c, r, 12);
    },
    len: (x, y) => 12 * lengthOf(x, y, 61), lw: (x, y) => 2.4 * widthOf(x, y, 63),
    steps: 3, lenJ: 0.3, wJ: 0.3, wild: 0.12, impasto: 0.7,
  });
  // GRASS IS BLADES: fine upward strokes over the dabs, bending with the same breeze
  strokes(out, counter, {
    rng, n: 1600,
    sample: rej(-10, 364, 810, 512, (x, y) => y > landTop(x) + 2),
    dir: (x, y) => { const [vx] = curlV(x, y, 167, 60); return -Math.PI / 2 + vx * 0.9 + (fbm(x / 6, y / 6, 347) - 0.5) * 0.8; },
    col: (x, y, r) => {
      const depth = (y - 364) / (H - 364);
      let c = ramp(['#3f8a3a', '#5ea83e', '#86c44a', '#bcd862', '#dbe888'], 0.2 + fbm(x / 40, y / 40, 349) * 0.6 + depth * 0.25 + r() * 0.2);
      c = mix(c, '#fff0b0', lightAt(x, y) * 0.45);
      return jig(c, r, 8);
    },
    len: (x, y) => (5 + 7 * ((y - 364) / (H - 364))) * lengthOf(x, y, 65), lw: (x, y) => 1.0 * widthOf(x, y, 67),
    steps: 3, follow: 0.9, lenJ: 0.3, wJ: 0.3, impasto: 0.4, relief: 0.3, op: 0.85,
  });
  /* ---------------- THE CLIFF'S BRINK ----------------
     Fred: "imagine walking through a forest and then you found a cliff, then beyond that
     cliff is the vast sea, and then the sky above is just shining."
     That is a whole composition in one sentence, and the only piece the plate was missing
     is the EDGE: the ground has to stop. So the grass now ends at a brink — a lip of warm
     rock catching the morning, a hard dark line of shadow immediately under it (the drop
     you cannot see into), and a few boulders shouldering out of the turf.
     Munch's law decides the drawing: rock is not alive, so its marks run STRAIGHT while
     everything green around them curves. */
  {
    const brink = x => landTop(x) + 2;
    // the lip: warm stone, lit from the sunrise, straight marks
    strokes(out, counter, {
      rng, n: 700,
      sample: r => { const x = -10 + r() * 820; return [x, brink(x) + r() * 13]; },
      dir: (x) => 0.04 * Math.sin(x / 90),
      col: (x, y, r) => {
        const g = lightAt(x, y);
        let c = ramp(['#8d7a63', '#a89178', '#c2ad90', '#6f5f4c'], r() * 0.9 + fbm(x / 26, y / 9, 311) * 0.4);
        c = mix(c, '#ffe6ac', g * 0.55);
        return jig(c, r, 10);
      },
      len: (x, y) => (8 + rng() * 10) * lengthOf(x, y, 71), lw: (x, y) => 2.8 * widthOf(x, y, 73), steps: 2, lenJ: 0.3, wJ: 0.3, impasto: 0.5, relief: 0.6,
    });
    // the shadow under the lip — the drop itself. Thin, dark, and unbroken enough to read
    // as an edge rather than as more ground.
    strokes(out, counter, {
      rng, n: 420,
      sample: r => { const x = -10 + r() * 820; return [x, brink(x) + 12 + r() * 7]; },
      dir: (x) => 0.03 * Math.sin(x / 80),
      col: (x, y, r) => jig(mix('#3b3326', '#584a36', r() * 0.8), r, 8),
      len: (x, y) => (9 + rng() * 10) * lengthOf(x, y, 75), lw: (x, y) => 2.4 * widthOf(x, y, 77), steps: 2, lenJ: 0.3, wJ: 0.3, impasto: 0.35,
    });
    // boulders shouldering out of the turf, so the brink has weight
    for (const [bx, by, bw] of [[126, 402, 26], [318, 396, 19], [486, 400, 23], [654, 404, 30], [212, 408, 15]]) {
      strokes(out, counter, {
        rng, n: Math.round(bw * 6),
        sample: r => { const a2 = r() * Math.PI * 2, dd = Math.pow(r(), 0.5);
                       return [bx + Math.cos(a2) * bw * dd, by + landTop(bx) - 400 - Math.sin(a2) * bw * 0.52 * dd]; },
        dir: () => 0.06,
        col: (x, y, r) => { const g = lightAt(x, y);
          let c = ramp(['#6f6252', '#8d7c66', '#ab9880'], r() * 0.9);
          c = mix(c, '#ffe6ac', g * 0.5 + Math.max(0, (by - y) / bw) * 0.25);
          return jig(c, r, 9); },
        len: 7, lw: 3.6, steps: 2, lenJ: 0.5, impasto: 0.5, relief: 0.7,
      });
    }
  }
  // the shore fringe where land meets water — ragged grass tufts, organic seam
  E.horizonFringe(out, counter, rng, { horizonFn: landTop, x0: -10, x1: 810, cols: ['#2c7a4a', '#3f8a3a', '#5ea83e', '#86c44a'], hMax: 18, lightFn: lightAt, seed: 343 });
  // FLOURISHING — the third day's herb and fruit burst across the new shore
  // (Gen 1:11, "let the earth bring forth grass... the fruit tree yielding fruit")
  E.groundFlowers(out, counter, rng, {
    x0: -6, y0: 382, x1: 812, y1: 510, n: 520,
    lightFn: lightAt,
    depthFn: (x, y) => (y - 364) / (510 - 364),
  });
  // one more fruit tree so the shore reads ABUNDANT, not lawn (Gen 1:11-12)
  E.fruitTree(out, counter, rng, 580, 470, 26, 34, E.LEAF_PALETTES[0], lightAt, 0.5, { crownOnly: true });   // a bush now: the great trees are the trees
  fgRanges.push([_fgLand, out.length]);   // ← the near shore + its first life are foreground

  /* ---------------- DISTANT NEW HILLS — the far horizon of the made world [FAR plane] ---------------- */
  const _far = out.length;
  /* ⭐ THE SUN ITSELF (Sep 12, the beauty pass). "Let there be light: and there was light."
     The page had the glow of the light and never the LIGHT — a pale centre in the swirl. The
     first morning has a sun: a white-gold disc low over the waters, a hot corona, the swirl
     round it warming. Chiaroscuro on a bright page is the opposite move: the sun must be the
     ONE thing hotter than the sky. (far plane — ABOVE the swirl sheets, which had buried it) */
  strokes(out, counter, {                       // corona — warm, wide, soft
    rng, n: 700,
    sample: r => { const a = r() * Math.PI * 2, d = 14 + Math.pow(r(), 0.7) * 64; return [lightC.x + Math.cos(a) * d, lightC.y + Math.sin(a) * d * 0.9]; },
    dir: (x, y) => Math.atan2(y - lightC.y, x - lightC.x) + Math.PI / 2 + (rng() - 0.5) * 0.6,
    col: (x, y, r) => { const d = Math.hypot(x - lightC.x, (y - lightC.y) / 0.9); return jig(ramp(['#fff9e0', '#ffe9a0', '#ffd36a', '#f7b64a'], Math.min(1, (d - 14) / 64)), r, 4); },
    len: (x, y) => 5 + free(x, y, 811) * 9, lw: (x, y) => 1.5 + free(x, y, 813) * 2.5, steps: 2, lenJ: 0.4, impasto: 0, relief: 0.1,
    op: (() => 0.5)(),
  });
  strokes(out, counter, {                       // the disc — white-hot
    rng, n: 420,
    sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 0.6) * 22; return [lightC.x + Math.cos(a) * d, lightC.y + Math.sin(a) * d]; },
    dir: () => 0.2 + (rng() - 0.5) * 0.8,
    col: (x, y, r) => jig(mix('#fffdf4', '#fff1c4', fbm(x / 6, y / 6, 817) + r() * 0.2), r, 3),
    len: 5, lw: 2.6, steps: 2, lenJ: 0.5, impasto: 0, relief: 0, op: 0.9,
  });
  strokes(out, counter, {                       // rays — long, thin, radiating, Munch-curved by the swirl
    rng, n: 260,
    sample: r => { const a = r() * Math.PI * 2, d = 40 + Math.pow(r(), 0.8) * 120; return [lightC.x + Math.cos(a) * d, lightC.y + Math.sin(a) * d * 0.8]; },
    dir: (x, y) => Math.atan2(y - lightC.y, x - lightC.x) + (fbm(x / 30, y / 30, 821) - 0.5) * 0.5,
    col: (x, y, r) => jig(mix('#fff3c8', '#ffd98a', r() * 0.6), r, 4),
    len: (x, y) => 10 + free(x, y, 823) * 22, lw: 1.2, steps: 3, follow: 0.9, lenJ: 0.5, impasto: 0, relief: 0, op: 0.35,
  });

  E.distantHills(out, counter, rng, { topFn: E.ridge(seaY, { amp: 22, freq: 200, bumps: 0.5, seed: 2 }), horizonFn: seaY, cols: ['#5a9ad0', '#6aa8b8', '#7ab488'], depth: 40, lightFn: lightAt, seed: 2 });
  farRanges.push([_far, out.length]);

  // the first fruit-trees of the made world, planted on the new shore (Gen 1:11)
  // [these grow in the FG land, so they stay with it]
  const _fgTrees = out.length;
  // ⚠ BUSHES, not little trees. Two great trees now stand at the ends of this shore, and
  // a scatter of knee-high fruit trees underneath them reads as a nursery, not a coast.
  E.fruitTree(out, counter, rng, 92,  474, 30, 40, E.LEAF_PALETTES[1], lightAt, 0.5, { crownOnly: true });
  E.fruitTree(out, counter, rng, 716, 482, 32, 44, E.LEAF_PALETTES[3], lightAt, 0.5, { crownOnly: true });
  E.fruitTree(out, counter, rng, 150, 456, 24, 32, E.LEAF_PALETTES[4], lightAt, 0.4, { crownOnly: true });
  E.fruitTree(out, counter, rng, 268, 470, 26, 36, E.LEAF_PALETTES[2], lightAt, 0.4, { crownOnly: true });
  E.fruitTree(out, counter, rng, 442, 478, 28, 38, E.LEAF_PALETTES[0], lightAt, 0.5, { crownOnly: true });
  fgRanges.push([_fgTrees, out.length]);

  /* ---------------- THE TWO GREAT TREES [NEAR plane] ----------------
     Fred: "to create something like this you need to make the trees on the far right end
     and far left end... you are just thinking about the screen when the user come to that
     page. it is deeper than that. also for trees please make sure that it is always
     sticking to the ground. when i pan it, trees should not move... create it with
     layers."
     Both halves of that are the same instruction: a framing tree is not a sprite parked
     where a phone happens to be looking — it is part of the PAINTING, standing at the far
     ends of the panorama, so that panning travels between them and each one is glued to
     its own ground by construction. Painted with the plate's own fruitTree, in the plate's
     own light, on its own NEAR plane so it parallaxes closest. */
  /* ⚠ A FOREST TREE IS NOT A POST. Fred, with the reference again: "the tree just looks
     sad, so skinny and have no movement at all. in real life forest trees are not straight
     like this, can we make the composition to be like this?"
     The reference is one great tree leaning IN from the edge: a thick trunk that curves as
     it climbs, long near-horizontal boughs reaching clear across the top of the picture,
     and dense foliage hung along them. So this is built from curves, not from a column
     with a ball on top: every limb is a cubic sampled into a brush path, thick at its
     root and thin at its tip, and the canopy is a run of clumps ALONG each limb. */
  const cubic = (p0, p1, p2, p3, n) => {
    const pts = [];
    for (let i = 0; i <= n; i++) {
      const t = i / n, u = 1 - t;
      pts.push([u*u*u*p0[0] + 3*u*u*t*p1[0] + 3*u*t*t*p2[0] + t*t*t*p3[0],
                u*u*u*p0[1] + 3*u*u*t*p1[1] + 3*u*t*t*p2[1] + t*t*t*p3[1]]);
    }
    return pts;
  };
  /* ⚠ A LIMB IS ONE CONTINUOUS BODY. Fred: "well branches should connect with each other."
     That is the whole fault in my last attempt: `limb` cut the curve into seven sections
     and painted each separately, so the wood arrived as a row of detached bars — cornrows,
     then sausages. A branch is drawn ONCE, as a single tapered ribbon from root to tip
     (which is also how it forks cleanly: a child ribbon starts exactly at a point on its
     parent's ribbon), and the brush marks go OVER it for texture, never instead of it. */
  const limb = (pts, w0, w1, dark) => {
    const prof = [];
    for (let i = 0; i < pts.length; i++) {
      const t = i / (pts.length - 1);
      prof.push((w0 + (w1 - w0) * t) / Math.max(w0, w1));   // the taper, as a profile 0..1
    }
    const g = lightAt(pts[0][0], pts[0][1]);
    const body = mix(dark ? '#2b1a10' : '#3a2418', dark ? '#4e3520' : '#66492b', 0.5 + g * 0.3);
    out.push(E.ribbon(pts, Math.max(w0, w1), body, prof));
    counter.n++;
    // ⚠ AND THE PLATE'S OWN BRUSH OVER IT (Fred: "make the trees to be the same style as
    // the painting"). The ribbon gives the limb a connected body; paintPath — the same
    // call the plate uses for every trunk it paints — gives it the plate's touch: marks
    // that jig off the average, lit toward the sunrise, laid ALONG the wood. A vector band
    // on its own is a different medium sitting on an oil painting.
    paintPath(out, counter, rng, pts,
      (x, y, r) => {
        const gg = lightAt(x, y);
        let c = mix(dark ? '#2a1a10' : '#3a2418', dark ? '#5d4126' : '#70502f', r());
        c = mix(c, '#f2d49c', gg * 0.5 * (0.35 + r() * 0.9));
        return jig(c, r, 10);
      },
      { lw: Math.max(1.4, (w0 + w1) * 0.42), len: 7, density: 0.92, jitter: 0.5 });
  };

  // foliage hung ALONG a limb, in clumps, with sky between them
  const foliage = (pts, from, pal, size, op) => {
    for (let i = 0; i < pts.length; i++) {
      const t = i / (pts.length - 1);
      if (t < from) continue;
      if ((i % 2) !== 0) continue;                                   // dense: a forest canopy, with sky only in the gaps it leaves itself
      const [cx2, cy2] = pts[i];
      const rr = size * (0.55 + 0.75 * Math.sin(t * 3.0 + i)) * (0.75 + rng() * 0.5);
      if (rr < 4) continue;
      strokes(out, counter, {
        rng, n: Math.round(rr * rr / 2.0),
        sample: r => { const a2 = r() * Math.PI * 2, dd = Math.pow(r(), 0.45);
                       return [cx2 + Math.cos(a2) * rr * 1.35 * dd, cy2 - 2 + Math.sin(a2) * rr * 0.78 * dd]; },
        dir: (x, y) => -Math.PI / 2 + (fbm(x / 8, y / 8, 151) - 0.5) * 2.4,
        col: (x, y, r) => {
          const g = lightAt(x, y), lift = (cy2 - y) / (rr * 1.6) + 0.5;
          let c = ramp(pal, fbm(x / 10, y / 10, 153) * 0.6 + r() * 0.5);
          // the plate's own canopy recipe: warm toward the light, deepen underneath, and
          // let the ramp and the jig do the rest. The flat dark wash I had here is what
          // made the wood read as another material — a canopy takes its shade from MARKS
          // that commit to a darker value, never from a veil laid over the whole mass.
          c = mix(c, '#fbe79a', g * 0.62 + Math.max(0, lift - 0.5) * 0.5);
          c = mix(c, '#14351f', Math.max(0, 0.5 - lift) * 0.72);
          c = mix(c, '#14351f', Math.max(0, 0.5 - lift) * 0.7);
          return jig(c, r, 15);
        },
        len: (x, y) => 7 * lengthOf(x, y, 81), lw: (x, y) => 2.1 * widthOf(x, y, 83),
        steps: 2, lenJ: 0.3, wJ: 0.3, wild: 0.08, impasto: 0.5, relief: 0.9,
        op: op == null ? 0.9 : op,
      });
    }
  };
  const leaningTree = (base, k1, k2, top, boughs, pal, thick, leafSize, op) => {
    const trunk = cubic(base, k1, k2, top, 40);
    limb(trunk, thick, thick * 0.34, true);
    for (const B of boughs) {                                        // [tOnTrunk, ctl1, ctl2, tip]
      const from = trunk[Math.round(B[0] * (trunk.length - 1))];
      const pts = cubic(from, B[1], B[2], B[3], 34);
      // ⚠ THE WOOD STOPS SHORT OF THE LEAVES. Drawn to its full length, a bough's last
      // fifth pokes out past the canopy as a dark dash floating in the sky — the "sausage"
      // Fred kept seeing. A real branch's tip is buried in its own foliage, so the ribbon
      // ends at 78% and the leaves carry on to the end.
      limb(pts.slice(0, Math.max(3, Math.round(pts.length * 0.78))), thick * 0.42, thick * 0.12, false);
      foliage(pts, 0.14, pal, leafSize, op);
    }
    foliage(trunk.slice(Math.round(trunk.length * 0.72)), 0, pal, leafSize * 0.8, op);
  };
  /* ⚠ A FOREST AT THE MARGINS, NOT TWO TREES (Fred: "i was thinking more about forest on
     the peripheral, so the sides are dense trees, then we can just make the leaves
     slightly opaque so we can see the sea etc").
     So each side is a BAND of trees — five of them, leaning in, at staggered depths, their
     canopies overlapping into one mass — and the leaves are painted at reduced opacity, so
     the sea and the sunrise come through the canopy the way light does in a real wood.
     The middle of the panorama is left entirely alone: forest, then the cliff, then the
     vast sea, then the shining sky. */
  const forestBand = (x0, dir, seedBase, n, opts) => {
    const R = mulberry32(seedBase);
    const O = opts || {};
    for (let i = 0; i < n; i++) {
      const near = i / (n - 1);                             // 0 = deepest in the band, 1 = nearest the edge
      // ⚠ NOT SYMMETRIC. Fred: "dont make it symmetric. nature (fractals) are random but
      // structured and that is what makes it beautiful." Every quantity below is the
      // STRUCTURE (deeper trees are shorter, thinner, reach less) multiplied by this
      // side's own random draw — so the two woods obey one law and share no shape.
      const bx = x0 + dir * (6 + i * (O.step || 44) + R() * 30);
      const by = 496 + R() * 30 + near * 12;
      const h = (O.h0 || 250) + near * (O.hK || 220) + R() * 90;
      const th = (22 + near * 46) * (0.82 + R() * 0.42);    // FATTER: a forest trunk is a column, not a cane
      const reach = 0.5 + near * 0.8 + R() * 0.35;
      const top = [bx - dir * (34 + near * 80 + R() * 40), by - h];
      const tips = [];
      const nb = 3 + (R() < 0.5 ? 1 : 0);
      for (let k = 0; k < nb; k++) {
        const f = k / (nb - 1);
        // ⚠ CLAMPED. Unbounded, this reach ran to ~800 units and the two woods met over the
        // middle: no sky, no sunrise, no "shining above". A margin forest reaches IN, it
        // does not roof the picture — so a tip may never cross this side's own limit.
        const rawTip = bx - dir * (105 + reach * (120 + f * 150) + R() * 60);
        const tipX = dir > 0 ? Math.max(O.limit || 470, rawTip) : Math.min(O.limit || 330, rawTip);
        const tipY = by - h * (0.84 + f * 0.20) + (k === nb - 1 ? h * 0.26 : 0) - R() * 30;
        tips.push([0.52 + f * 0.24,
                   [bx - dir * (55 + f * 45), by - h * (0.90 + f * 0.08)],
                   [(bx + tipX) / 2, (by - h + tipY) / 2 - 14 - R() * 26],
                   [tipX, tipY]]);
      }
      leaningTree([bx, by], [bx + dir * th * 0.5, by - h * 0.38], [top[0] + dir * th * 0.3, by - h * 0.72],
        top, tips, E.LEAF_PALETTES[4], th, 20 + near * 14 + R() * 6, 0.30 + near * 0.16);
    }
    // ⚠ AND THE TOP EDGE IS FILLED. Fred: "can you fill the top edges with leaves." A wood
    // seen from inside has no sky above you at its margin — the canopy runs off the top of
    // the picture. These clumps are seated ABOVE the frame's edge so only their underside
    // shows, which is what makes you feel underneath it rather than looking at it.
    const span = O.span || 300;
    for (let e = 0; e < 14; e++) {
      const ex = x0 + dir * (R() * span);
      const ey = -22 + R() * 54;
      const rr = 26 + R() * 30;
      strokes(out, counter, {
        rng: R, n: Math.round(rr * rr / 2.4),
        sample: r => { const a2 = r() * Math.PI * 2, dd = Math.pow(r(), 0.45);
                       return [ex + Math.cos(a2) * rr * 1.4 * dd, ey + Math.sin(a2) * rr * 0.85 * dd]; },
        dir: (x, y) => -Math.PI / 2 + (fbm(x / 8, y / 8, 151) - 0.5) * 2.4,
        col: (x, y, r) => {
          const g = lightAt(x, y);
          let c = ramp(E.LEAF_PALETTES[4], fbm(x / 10, y / 10, 153) * 0.6 + r() * 0.5);
          c = mix(c, '#fbe79a', g * 0.26);
          c = mix(c, '#12301c', 0.34 + Math.max(0, (y - ey) / (rr * 2)) * 0.3);   // undersides, because you are below them
          return jig(c, r, 14);
        },
        len: (x, y) => 7 * lengthOf(x, y, 85), lw: (x, y) => 2.1 * widthOf(x, y, 87),
        steps: 2, lenJ: 0.3, wJ: 0.3, wild: 0.08, impasto: 0.5, relief: 0.9, op: 0.5,
      });
    }
  };
  const _near = out.length;
  // two woods, deliberately unlike each other: the right is deeper and taller (six trees
  // reaching further in), the left is a lighter stand of four
  forestBand(800, 1, 5150, 6, { step: 40, h0: 265, hK: 235, span: 300, limit: 500 });
  forestBand(0,  -1, 9271, 4, { step: 52, h0: 225, hK: 185, span: 230, limit: 300 });
  nearRanges.push([_near, out.length]);

  // HIDDEN EGG — Genesis 1:3 in the ORIGINAL HEBREW numerals, cut faint into the
  // new shore, lower-left. Gen 1:3: "And God said, Let there be light: and there
  // was light." The verse that makes the whole plate.
  E.inscriptionText(out, E.hebrewRef(1, 3), { x: 200, y: 462, h: 15, body: '#1a3a1e', edge: '#eafbe0', op: 0.82, edgeOp: 0.55 });

  // MULTIPLANE: assemble the requested depth plane. Each is its own cel —
  // transparent where it has no content — so they stack and parallax apart.
  const ALT = 'The first morning of creation: a brilliant rising light low over a great gathered sea that swirls blue-green and gold beneath it, under a radiant dawn sky of blue, rose and gold with birds rising, the pale morning moon still hanging high in the blue opposite the sun; fresh green new land bursts with the first wildflowers and jewel-coloured fruit trees along the near shore. The world, newly made, and the light that made it — and it was good. Hidden faint in the shore is the Hebrew reference for Genesis 1:3, "Let there be light."';
  const RAW = { undercoat: 0, weave: 0, varnish: 0, oil: 0 };   // no baked surface — the live filter unifies the planes
  const setOf = ranges => { const s = new Set(); for (const [a, b] of ranges) for (let i = a; i < b; i++) s.add(i); return s; };
  const pick = ranges => ranges.map(([a, b]) => out.slice(a, b).join('\n')).join('\n');
  const farSet = setOf(farRanges), fgSet = setOf(fgRanges), nearSet = setOf(nearRanges);
  if (LAYER === 'sky') return svgWrap(ALT, out.slice(0, skyEnd).join('\n'), RAW);   // dawn-sky ground (opaque)
  const sm = LAYER.match(/^sky(\d+)$/);
  if (sm) return svgWrap(ALT, '<g>' + skySheets[+sm[1] - 1] + '</g>', RAW);         // one sky-swirl sheet
  if (LAYER === 'far') return svgWrap(ALT, pick(farRanges), RAW);                   // distant new hills
  if (LAYER === 'fg') return svgWrap(ALT, pick(fgRanges), RAW);                     // near shore + first life
  if (LAYER === 'near') return svgWrap(ALT, pick(nearRanges), RAW);                 // the two great trees
  if (LAYER === 'mid') {                                                            // the gathered waters + swirling light
    const body = out.filter((_, i) => i >= skyEnd && !farSet.has(i) && !fgSet.has(i) && !nearSet.has(i)
                                      && !(i >= _fishA && i < _fishB)).join('\n');
    return svgWrap(ALT, body, RAW);
  }
  // full painting (desktop): sky ground, the stacked sky-sheets, then everything else
  return svgWrap(ALT, out.slice(0, skyEnd).concat(skySheets, out.slice(skyEnd)).join('\n'));
}
