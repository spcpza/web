// gen/plates/comes.mjs — "He is coming"
// Revelation 22:12 ("Behold, I come quickly") + John 14:3 ("I will come again,
// and receive you unto myself"). The heavens SPLIT OPEN and a great radiant gold
// glory descends from above — the King / the Light returning in power. Rays burst
// across a waking sky (dawn breaking everywhere at once), a spectral bow rounds the
// glory. Below, on a small dark earth strip, tiny figures (incl. a small RED child)
// look UP, arms lifted toward the coming Light. Awe and hope — bright, triumphant,
// not fearful.
//
// MOBILE 3D — depth planes (FAR→NEAR): the waking dawn sky, the rent heavens
// (cloud lips peeling back) and the radiant GLORY at the torn rift ride the
// opaque SKY plane (backmost); the great descending shaft, the spectral bow and
// the rain of gold sparks float in the MID plane; the small dark earth, the
// landing pool and the lifted figures sit closest in the FOREGROUND. Tilt the
// phone and the glory, the falling beam and the lifted hands part at three depths.

export const name = 'comes';
export const title = 'He is coming';
export const caption = 'Behold, I come quickly.';
export const seed = 20262212;
export const focal = { x: 400, y: 130 }; // the torn rift up top, glory pouring DOWN
export const layers = [
  { name: 'sky', opaque: true },  // dawn sky + rent heavens + the glory at the rift (backmost)
  { name: 'mid' },                // the descending shaft + spectral bow + falling sparks
  { name: 'fg' },                 // the dark earth + landing pool + lifted figures (closest)
];

export function paint(E, opts = {}) {
  const {
    mulberry32, fbm, curlV, swirlV, goldenSpiralV, goldenSpiralDir, mix, ramp, jig,
    strokes, rej, paintChild, castShadow, personCaps, paintPath, ribbon, klimtGold, goldSparks, svgWrap,
    inscriptionText, greekRef, R1, W, H, SPECTRUM_WHEEL,
    GOLD, GOLD_PALE, GOLD_DEEP, GOLD_HOT,
  } = E;

  const rng = mulberry32(seed);
  const out = [];
  const counter = { n: 0 };
  // MOBILE 3D LAYERS: as the plate paints in one rng order, we record index
  // ranges per depth plane (SKY / MID / FG) and assemble the requested cel by
  // slicing. `full`/desktop concatenates `out` in its original order, untouched.
  const LAYER = opts.layer || 'full';
  const skyRanges = [], midRanges = [], fgRanges = [];

  // THE RIFT: the heavens tear open near the TOP of the frame. The glory pours DOWN
  // from a narrow throat at the rift and widens into a great shaft falling toward the
  // earth. CX/RY define the rift's centre and vertical reach.
  const RIFTX = 400, RIFTY = 78, CORE = 46;       // the throat of the torn heaven, high up
  const RAINBOW = SPECTRUM_WHEEL;
  const earthY = 446;                              // top of the small dark earth strip
  const maxR = Math.hypot(W, H) * 0.74;

  // a DOWNWARD SHAFT mask: how far inside the descending cone of glory a point sits.
  // The cone springs from the rift throat and fans open as it falls (halfWidth grows
  // with depth). Returns 0..1 — 1 at the bright axis, 0 outside the shaft.
  const shaftAxisX = y => RIFTX + (fbm(y / 70, 3.3, 17) - 0.5) * 26;   // a living, slightly wavering axis
  const shaftHalf = y => 40 + Math.max(0, y - RIFTY) * 0.62;           // fans wider as it descends
  const inShaft = (x, y) => {
    if (y < RIFTY - 30) return 0;
    const off = Math.abs(x - shaftAxisX(y)) / shaftHalf(y);
    return Math.max(0, 1 - off * off);
  };

  /* ---------------- LIGHT MODEL — glory at the rift, spilling DOWN the shaft ----------------
     Strong near the rift throat, then carried downward by the falling shaft so the eye
     is pulled from the torn sky at top down to the lifted hands. */
  const lightAt = (x, y) => {
    const halo = Math.min(1, Math.exp(-Math.hypot(x - RIFTX, (y - RIFTY) * 1.04) / 150) * 1.05);
    const shaft = inShaft(x, y) * Math.max(0.2, 1 - (y - RIFTY) / 520);   // light streams down, gently fading
    return Math.min(1, Math.max(halo, shaft * 0.9));
  };

  /* ---------------- THE WAKING SKY — dawn, torn open at the top ----------------
     The sky ripens from a deep pre-dawn rim toward the rift. Outside the shaft the
     heaven is cool/dawn; inside, it floods to gold. Never black. */
  const skyCol = (x, y, r) => {
    const dy = Math.min(1, Math.max(0, (y - RIFTY) / (earthY - RIFTY)));   // 0 at rift → 1 at horizon
    const g = lightAt(x, y);
    // sky deepens DOWNWARD from a pale torn rift toward a cool pre-dawn band at the
    // sides/below — vertical ripening, so the descent reads top→bottom
    let c = ramp(['#fff7d8', '#ffe19a', '#f3ad62', '#d98a64', '#9a6e92', '#5a5aa0', '#3a3f86'], Math.min(1, dy * 0.95 + 0.05));
    c = mix(c, '#fff0c0', g * 0.78);                     // flooded with gold inside the shaft
    if (g > 0.12 && g < 0.26 && r() < 0.04) return jig('#5a7ad0', r, 16);   // complementary flick — the life
    return jig(c, r, 11);
  };

  // the shaft flows DOWNWARD: strokes rake down and out from the rift throat, fanning
  // open as they fall (a great beam coming down), with a little curl so it breathes.
  const downDir = (x, y) => {
    const dx = x - shaftAxisX(y);
    const fan = Math.atan2(1, dx / 220);                 // ~straight down on axis, splaying out at the edges
    const [c, d] = curlV(x, y, 14, 150);
    return Math.atan2(Math.sin(fan) + d * 0.22, Math.cos(fan) + c * 0.22);
  };

  // THE ALIVE SKY (three-scale jewel-swirl): the whole dawn WHEELS in one great
  // spiral round the torn rift where the glory descends (macro), a few eddies turn
  // inside the wheel (mid), and every stroke curves with its parent current (micro)
  // — radiance AND swirl, like Starry Night. The descending shaft, the glory and the
  // rising flock (all painted OVER this ground) still pour straight DOWN through it,
  // so He comes down AND the heaven wheels around the coming.
  const SKY_EDDIES = [[200, 110, 56], [636, 132, -58], [560, 300, 50], [110, 280, -46]];
  const skyDir = (x, y) => {
    let vx = 0, vy = 0;
    { const [a, b] = goldenSpiralV(x, y, RIFTX, RIFTY, 110, 260); vx += a; vy += b; }   // the great wheel round the descent throat
    for (const [ex, ey, s] of SKY_EDDIES) { const [a, b] = goldenSpiralV(x, y, ex, ey, s, 80); vx += a; vy += b; }
    const [c, d] = curlV(x, y, 31, 120); vx += c * 26; vy += d * 26;                     // fine turbulence — every stroke curves with its current
    return Math.atan2(vy, vx);
  };
  // jewel eddy-glows in the dawn's own tints (gold-rose up top, violet/indigo below)
  const SKY_EGLOW = [[200, 110, '#e0a066'], [636, 132, '#d98a7a'], [560, 300, '#6f5aa8'], [110, 280, '#5a5ab0']];
  const skyGroundCol = (x, y, r) => {
    let c = skyCol(x, y, r);
    for (const [ex, ey, ec] of SKY_EGLOW) { const d2 = Math.hypot(x - ex, y - ey); c = mix(c, ec, Math.exp(-d2 / 95) * 0.5); }   // the eddy cores breathe faint jewel light
    return c;
  };

  // 1. the smooth waking-sky GROUND (opaque base) — the deep moving dawn: long
  // streaming strokes that FOLLOW the great wheel (the "deep moving water")
  const _skyGround0 = out.length;
  out.push(`<rect width="${W}" height="${H}" fill="#2c3170"/>`);
  strokes(out, counter, {
    rng, n: 900, sample: rej(-12, -12, 812, earthY + 6, () => true),
    dir: skyDir,
    col: skyGroundCol,
    len: 44, lw: 9.5, steps: 4, follow: 0.91, wild: 0.05, lenJ: 0.5, impasto: 0.5, relief: 0.55,
  });
  skyRanges.push([_skyGround0, out.length]);   // [SKY] dawn ground (opaque base)

  // 2. THE RENT HEAVENS — the cloud parting at the rift: bold curved cloud-lips peeling
  // back to the LEFT and RIGHT of the throat, baring the gold behind (Rev 19:11).
  const _rentHeavens0 = out.length;
  strokes(out, counter, {
    rng, n: 300,
    sample: r => {                                        // a band hugging the two sides of the rift throat
      const side = r() < 0.5 ? -1 : 1;
      const yy = RIFTY - 26 + r() * 150;
      const w = 70 + (yy - RIFTY + 26) * 0.7;
      const x = RIFTX + side * (40 + Math.pow(r(), 0.7) * w);
      return [x, yy];
    },
    dir: (x, y) => Math.atan2(y - RIFTY, x - RIFTX) + Math.PI / 2 * Math.sign(x - RIFTX) * 0.0 + (x < RIFTX ? -0.5 : 0.5),  // lips curl back & up away from the throat
    col: (x, y, r) => {
      const g = lightAt(x, y);
      // warm-lit underside of the parting cloud, gold where it faces the glory
      return jig(mix(ramp(['#6a5e92', '#9a7e8a', '#d6a878'], Math.min(1, g + 0.2)), '#fff0c8', g * 0.5), r, 9);
    },
    len: (x, y) => 18 + Math.abs(x - RIFTX) * 0.08, lw: (x, y) => 5 + Math.abs(x - RIFTX) * 0.02,
    steps: 4, follow: 0.92, wild: 0.05, lenJ: 0.6, impasto: 0.55, relief: 0.6,
  });
  skyRanges.push([_rentHeavens0, out.length]);   // [SKY] the parting cloud lips

  // 3. THE GREAT DESCENDING SHAFT — long gold ray-filaments streaming straight DOWN
  // the cone from the rift toward the earth (the dominant directional gesture).
  const _shaft0 = out.length;
  strokes(out, counter, {
    rng, n: 620,
    sample: r => {                                        // born inside the falling cone
      const yy = RIFTY - 10 + Math.pow(r(), 0.85) * (earthY - RIFTY + 8);
      const x = shaftAxisX(yy) + (r() * 2 - 1) * shaftHalf(yy);
      return [x, yy];
    },
    dir: (x, y) => downDir(x, y),
    col: (x, y, r) => {
      const g = lightAt(x, y);
      const s = inShaft(x, y);
      // bright legible gold filaments down the shaft; brightest on the axis, fading down
      const fade = Math.max(0.25, 1 - (y - RIFTY) / 460);
      const arm = fbm(x / 30, y / 110, 71) + (r() - 0.5) * 0.2;
      if (s > 0.18 && arm > 0.55) return jig(mix(GOLD_DEEP, GOLD_HOT, Math.min(1, 0.3 + g * fade)), r, 7);
      return jig(mix(skyCol(x, y, r), '#fff6e0', g * 0.5 * fade), r, 8);
    },
    len: (x, y) => 26 + 60 * Math.min(1, (y - RIFTY) / 360),     // streaks lengthen as they fall
    lw: (x, y) => 3.0 + 3.6 * inShaft(x, y),
    steps: 5, follow: 0.93, wild: 0.07, lenJ: 0.7, impasto: 0.6, relief: 0.6,
  });

  /* ---------------- THE SPECTRAL BOW arcing across the OPENING (Rev 4:3) ---------------- */
  // a rainbow round about the throne — a bold arc spanning the rift opening near the
  // top, riding OVER the throat so it reads as the mouth of the torn heaven.
  strokes(out, counter, {
    rng, n: 420,
    sample: r => {                                        // a clean arc spanning the rift opening
      const a = -Math.PI * 0.86 + r() * Math.PI * 0.72;   // upper arc, kept off the far corners
      const d = 150 + Math.pow(r(), 0.6) * 46;
      return [RIFTX + Math.cos(a) * d, RIFTY + Math.sin(a) * d * 0.78];
    },
    dir: (x, y) => Math.atan2(y - RIFTY, x - RIFTX) + Math.PI / 2,
    col: (x, y, r) => {
      const ang = Math.atan2(y - RIFTY, x - RIFTX);
      const d = (Math.hypot(x - RIFTX, y - RIFTY) - 150) / 46;
      const hue = ramp(RAINBOW, ((ang / Math.PI) + 1 + fbm(x / 110, y / 110, 9) * 0.1) % 1);
      return jig(mix(hue, '#fff4d0', Math.max(0, 0.3 - d * 0.3)), r, 8);
    },
    len: 15, lw: 3.2, steps: 3, follow: 0.95, impasto: 0.4,
  });

  /* ---------------- THE GREAT FLOCK — rising to meet Him (1 Thess 4:17) ----------------
     "Then we which are alive and remain shall be caught up together... to meet the Lord
     in the air." Two curved streams of birds lift off the dark land and climb toward the
     descending glory — swinging WIDE of the falling shaft (never covering the descent),
     converging near the light: big and dark below, small and gilded as they enter the
     glow. Munch: living things in curved lines — curved wings, curved flight paths. */
  const bird = (x, y, sz, flap, col, lwF = 0.3) => {
    // one bird = two curved wing strokes meeting at the body — bold simple silhouette
    const dip = sz * (0.28 + flap * 0.26);                // wing-curve depth (flap phase)
    const tip = sz * (0.32 + flap * 0.36);                // wingtip lift
    out.push(`<path d="M${R1(x - sz)} ${R1(y - tip)} Q${R1(x - sz * 0.42)} ${R1(y + dip)} ${R1(x)} ${R1(y)} Q${R1(x + sz * 0.42)} ${R1(y + dip)} ${R1(x + sz)} ${R1(y - tip)}" fill="none" stroke="${col}" stroke-width="${R1(Math.max(1.1, sz * lwF))}" stroke-linecap="round"/>`);
    counter.n++;
  };
  // the flight field: from the land's edges (t=0) curving up & inward to the glory (t=1)
  const flightX = (s, t) => RIFTX + s * (300 - 150 * Math.pow(t, 0.9) + Math.sin(t * Math.PI) * 46);
  const flightY = t => 424 - t * 244;                     // land strip up to the glory's rim
  const flockCol = (x, y, t) => {
    const g = lightAt(x, y);
    let c = mix('#191233', GOLD_DEEP, Math.min(1, t * 0.95));   // night-dark below → deep gold as they climb
    return jig(mix(c, GOLD, Math.min(0.55, g * 0.9)), rng, 7);  // gilded entering the glow
  };
  // faint curved Munch FLIGHT LINES first, tracing the two rising streams
  for (const s of [-1, 1]) for (let i = 0; i < 3; i++) {
    const o = (i - 1) * 26 + (rng() - 0.5) * 10;
    const x0 = flightX(s, 0.04) + s * o, y0 = flightY(0.04);
    const x1 = flightX(s, 0.96) + s * o * 0.4, y1 = flightY(0.96);
    const cx = flightX(s, 0.5) + s * (o + 52), cy = flightY(0.5);
    out.push(`<path d="M${R1(x0)} ${R1(y0)} Q${R1(cx)} ${R1(cy)} ${R1(x1)} ${R1(y1)}" fill="none" stroke="#ffe9a0" stroke-opacity="0.13" stroke-width="2.2" stroke-linecap="round"/>`);
    counter.n++;
  }
  // the flock itself — small→smaller as they rise into the light
  for (const s of [-1, 1]) {
    for (let i = 0; i < 13; i++) {
      const t = Math.min(1, Math.max(0, i / 12 + (rng() - 0.5) * 0.06));
      const x = flightX(s, t) + (rng() - 0.5) * 44;
      const y = flightY(t) + (rng() - 0.5) * 26;
      if (inShaft(x, y) > 0.5) continue;                  // never cross the bright descent column
      const sz = (16 - 10.5 * t) * (0.85 + rng() * 0.3);
      const flap = rng();
      // glory back-light: a thin gold glint on the wing-tops of the lower, darker birds
      if (t < 0.55 && sz > 9) bird(x, y - 1.5, sz, flap, jig('#ffd98a', rng, 8), 0.12);
      bird(x, y, sz, flap, flockCol(x, y, t));
    }
  }
  // three big take-off birds just lifting from the dark land at the streams' roots
  for (const [bx, by, bs] of [[168, 427, 19], [644, 420, 16], [606, 436, 21]]) {
    const flap = 0.35 + rng() * 0.5;
    bird(bx, by - 1.7, bs, flap, jig('#ffd98a', rng, 8), 0.12);
    bird(bx, by, bs, flap, jig(mix('#150f2c', '#3a2a4e', rng() * 0.5), rng, 6));
  }
  midRanges.push([_shaft0, out.length]);   // [MID] the descending shaft + the spectral bow + the rising flock

  /* ---------------- THE GLORY AT THE RIFT — radiant gold throat, the King descending ---------------- */
  // gilded halo of concentric gold rings round the rift throat (gold = the throne)
  const _glory0 = out.length;
  klimtGold(out, counter, rng, RIFTX, RIFTY, CORE + 6, 130, { rings: 6, opacity: 0.46, squash: 0.9 });
  // a downward-falling figure of glory: an upright radiant column descending from the
  // throat — taller than wide, so it reads as the King coming DOWN, not a centred orb.
  strokes(out, counter, {
    rng, n: 460,
    sample: r => {                                        // an elongated vertical core dropping from the rift
      const t = Math.pow(r(), 0.8);
      const yy = RIFTY - CORE * 0.5 + t * (CORE * 2.4);
      const w = CORE * (0.5 + 0.5 * Math.sin(t * Math.PI)) * 0.9;
      return [RIFTX + (r() * 2 - 1) * w, yy];
    },
    dir: () => Math.PI / 2,                               // strokes run DOWNWARD
    col: (x, y, r) => jig(ramp(['#ffffff', '#fffdf0', GOLD_HOT, GOLD_PALE, GOLD], Math.min(1, Math.abs(x - RIFTX) / (CORE * 0.9) + (y - RIFTY) / 220)), r, 5),
    len: 13, lw: 3.2, steps: 2, wJ: 0.5, lenJ: 0.6, impasto: 0.55,
  });
  // THE BLAZING THROAT — the brightest white-gold, at the rift mouth
  strokes(out, counter, {
    rng, n: 320,
    sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 0.72) * CORE; return [RIFTX + Math.cos(a) * d, RIFTY + Math.sin(a) * d * 0.85]; },
    dir: () => Math.PI / 2,
    col: (x, y, r) => jig(ramp(['#ffffff', '#fffdf0', GOLD_HOT, GOLD_PALE], Math.hypot(x - RIFTX, (y - RIFTY) / 0.85) / CORE), r, 5),
    len: 10, lw: 3.0, steps: 2, wJ: 0.5, lenJ: 0.5, impasto: 0.55,
  });
  // a white sunburst at the very heart — no darkness at all
  strokes(out, counter, {
    rng, n: 100,
    sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 1.2) * CORE * 0.5; return [RIFTX + Math.cos(a) * d, RIFTY + Math.sin(a) * d]; },
    dir: (x, y) => Math.atan2(y - RIFTY, x - RIFTX),
    col: (x, y, r) => jig('#ffffff', r, 4),
    len: 8, lw: 2.0, steps: 2, relief: 0,
  });
  // GOLD SPARKS raining DOWN the shaft — the Light catching like gold leaf as it falls
  goldSparks(out, counter, rng, RIFTX, RIFTY, CORE + 12, 170, 90, { squash: 0.85, big: 1.12, lightFn: lightAt });
  for (let i = 0; i < 150; i++) {                         // a fall of sparks scattered DOWN the cone
    const yy = RIFTY + 40 + Math.pow(rng(), 0.7) * (earthY - RIFTY - 30);
    const x = shaftAxisX(yy) + (rng() * 2 - 1) * shaftHalf(yy) * 0.9;
    if (lightAt(x, yy) < rng() * 0.4) continue;
    const sz = (1.4 + rng() * 2.0) * 1.0, col = ['#fffbe6', '#fff2c0', '#ffe9a0'][(rng() * 3) | 0];
    out.push(`<path d="M${R1(x - sz)} ${R1(yy)}L${R1(x)} ${R1(yy - sz * 0.42)}L${R1(x + sz)} ${R1(yy)}L${R1(x)} ${R1(yy + sz * 0.42)}Z" fill="${col}"/>`);
    out.push(`<path d="M${R1(x)} ${R1(yy - sz)}L${R1(x + sz * 0.42)} ${R1(yy)}L${R1(x)} ${R1(yy + sz)}L${R1(x - sz * 0.42)} ${R1(yy)}Z" fill="${col}"/>`);
    counter.n += 2;
  }
  skyRanges.push([_glory0, out.length]);   // [SKY] the radiant glory at the torn rift + falling sparks

  /* ---------------- THE SMALL DARK EARTH below ---------------- */
  // a low strip of dark earth, lit warm where the descending shaft LANDS down the centre.
  const _earth0 = out.length;
  out.push(`<rect x="0" y="${R1(earthY)}" width="${W}" height="${R1(H - earthY)}" fill="#241a38"/>`);
  counter.n++;
  const landX = shaftAxisX(earthY);                       // where the shaft strikes the ground
  strokes(out, counter, {
    rng, n: 420,
    sample: rej(-10, earthY - 4, 810, 506, () => true),
    dir: x => 0.04 + (fbm(x / 50, 9, 47) - 0.5) * 0.4,
    col: (x, y, r) => {
      const litR = Math.abs(x - landX);
      let c = mix('#1c1430', '#3a2f56', Math.max(0, 0.45 - litR / 520) + fbm(x / 60, y / 60, 53) * 0.2);
      c = mix(c, '#8a6a30', Math.max(0, 0.5 - litR / 300) * 0.75);   // glory light landing on the earth
      return jig(c, r, 8);
    },
    len: 18, lw: 4.0, steps: 3, wild: 0.1, lenJ: 0.5, impasto: 0.4,
  });
  // a bright pool where the shaft lands — the descent touching down among the figures
  strokes(out, counter, {
    rng, n: 160,
    sample: r => { const a = r() * Math.PI, d = Math.pow(r(), 1.2) * 120; return [landX + Math.cos(a + Math.PI) * d * 1.5, earthY + 4 + Math.abs(Math.sin(a)) * d * 0.35]; },
    dir: () => 0,
    col: (x, y, r) => { const d = Math.abs(x - landX); return jig(ramp([mix(GOLD_HOT, '#caa64a', 0.3), '#8a6e36', '#3a2f56'], d / 160), r, 9); },
    len: 13, lw: 2.8, steps: 2, impasto: 0.4,
  });

  /* ---------------- THE LIFTED FIGURES — tiny, looking UP, arms raised ---------------- */
  // The small RED child (the recurring "you"), at the landing point, arms lifted UP
  // toward the descending glory.
  const feetY = earthY + 44, kx = landX;
  const child = personCaps(kx, feetY - 30, 30, {
    leftHand: [kx - 12, feetY - 32], rightHand: [kx + 12, feetY - 32],   // both arms lifted UP to the descending glory
    leftFoot: [kx - 4, feetY], rightFoot: [kx + 4, feetY],
  });
  castShadow(out, counter, child, { dir: 0.1 });
  paintChild(out, counter, rng, child);
  // gold rim-light on the child, the side facing the descending glory (above)
  strokes(out, counter, {
    rng, n: 22,
    sample: rej(kx - 16, feetY - 34, kx + 16, feetY - 4, (x, y) => child.some(c => E.inCap(x, y, c)) && !child.some(c => E.inCap(x, y - 4, c))),
    dir: () => -Math.PI / 2,
    col: (x, y, r) => jig(mix(GOLD_PALE, GOLD_DEEP, r() * 0.5), r, 10),
    len: 4, lw: 1.4, steps: 2,
  });

  // a few small companion figures beside the child — also looking up, arms lifted —
  // the whole earth waiting for the great return (John 14:3, "receive you unto myself")
  const friends = [
    { x: landX - 80, s: 0.82, cols: ['#3a6ad0', '#2c4a9a', '#1a2f66'] },   // blue
    { x: landX + 70, s: 0.78, cols: ['#2c9a86', '#1f7060', '#124238'] },   // teal
    { x: landX - 150, s: 0.66, cols: ['#7a4ab0', '#5a3488', '#341a50'] },  // violet
    { x: landX + 140, s: 0.70, cols: ['#c83a82', '#9a285e', '#5e162e'] },  // pink
  ];
  for (const f of friends) {
    const fy = earthY + 46;
    const caps = [
      { ax: f.x, ay: fy - 28, bx: f.x, by: fy - 25, r: 4.0 },        // head
      { ax: f.x, ay: fy - 21, bx: f.x + 1, by: fy - 6, r: 5.0 },     // body
      { ax: f.x - 2, ay: fy - 19, bx: f.x - 10, by: fy - 28, r: 1.8 }, // left arm up
      { ax: f.x + 2, ay: fy - 19, bx: f.x + 10, by: fy - 28, r: 1.8 }, // right arm up
      { ax: f.x - 2, ay: fy - 6, bx: f.x - 3, by: fy, r: 1.8 },      // legs
      { ax: f.x + 2, ay: fy - 6, bx: f.x + 3, by: fy, r: 1.8 },
    ].map(c => ({ ax: f.x + (c.ax - f.x) * f.s, ay: fy + (c.ay - fy) * f.s, bx: f.x + (c.bx - f.x) * f.s, by: fy + (c.by - fy) * f.s, r: c.r * f.s }));
    castShadow(out, counter, caps, { dir: 0.1, op: 0.2 });   // glory pours straight DOWN — short shadows
    paintChild(out, counter, rng, caps, { cols: f.cols, outlineW: 4.0, seed: 31 + (f.x | 0) });
  }

  /* ---------------- EASTER EGGS ---------------- */
  // HIDDEN — Revelation 22:12 ("Behold, I come quickly") in ORIGINAL KOINE GREEK
  // numerals, ΚΒʹ·ΙΒʹ (ΚΒ=22, ΙΒ=12), incised subtly into the dawn sky, upper right.
  inscriptionText(out, greekRef(22, 12), { x: 712, y: 70, h: 14, body: '#3a2a10', edge: '#fff2c4', op: 0.8, edgeOp: 0.55 });
  // egg: exactly THREE bright stars still showing in the cool upper rim — the dawn of
  // the great Day breaking even before the night is fully past.
  for (const [sx, sy] of [[120, 60], [150, 52], [180, 47]]) {
    strokes(out, counter, {
      rng, n: 26,
      sample: r => { const a = r() * Math.PI * 2, d = 1.5 + r() * 8; return [sx + Math.cos(a) * d, sy + Math.sin(a) * d * 0.8]; },
      dir: (x, y) => Math.atan2(x - sx, -(y - sy)),
      col: (x, y, r) => jig(ramp([GOLD_HOT, GOLD_PALE, GOLD_DEEP, '#8a7a4a'], Math.hypot(x - sx, y - sy) / 10), r, 8),
      len: 5, lw: 1.6, steps: 2,
    });
  }
  fgRanges.push([_earth0, out.length]);   // [FG] the dark earth + landing pool + lifted figures + eggs

  const ALT = 'The heavens tear open near the top of the sky and a great radiant gold shaft of glory pours straight DOWN toward the earth — the King, the Light, descending in power. The cloud parts at the rift, a spectral rainbow arcs across the opening, and gold sparks rain down the falling beam. Below, on a small dark earth where the shaft lands, tiny figures including a small red child lift their arms UP toward the coming Light, and a great flock of birds rises from the land in two curved streams to meet the descending glory — caught up together to meet the Lord in the air. Behold, I come quickly.';

  // MULTIPLANE: assemble the requested depth plane by slicing the recorded
  // ranges. Each cel is transparent where it has no content, so the planes stack
  // and parallax apart on mobile. `full`/desktop is `out` in its original order.
  const RAW = { undercoat: 0, weave: 0, varnish: 0, oil: 0 };   // no baked surface — the live filter unifies the planes
  const pick = ranges => ranges.map(([a, b]) => out.slice(a, b).join('\n')).join('\n');
  if (LAYER === 'sky') return svgWrap(ALT, pick(skyRanges), RAW);             // dawn sky + rent heavens + the glory (opaque)
  if (LAYER === 'mid') return svgWrap(ALT, '<g>' + pick(midRanges) + '</g>', RAW);   // the descending shaft + bow
  if (LAYER === 'fg') return svgWrap(ALT, '<g>' + pick(fgRanges) + '</g>', RAW);      // the dark earth + figures
  // full painting (desktop): every layer in its original paint order — UNCHANGED.
  return svgWrap(ALT, out.join('\n'));
}
