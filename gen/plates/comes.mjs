// gen/plates/comes.mjs — "He is coming"
// Revelation 22:12 ("Behold, I come quickly") + John 14:3 ("I will come again,
// and receive you unto myself"). The heavens SPLIT OPEN and a great radiant gold
// glory descends from above — the King / the Light returning in power. Rays burst
// across a waking sky (dawn breaking everywhere at once), a spectral bow rounds the
// glory.
//
// ⚠ REFRAMED (Fred: "still too similar to the old drawing... build from scratch").
// The rift is now OFF-CENTRE, upper-right (rule of thirds), so the shaft falls
// DIAGONALLY rather than straight down the frame's own axis — a dead-symmetric
// mandala reads the same no matter what pose stands under it, which is exactly
// what made the first two passes feel unchanged. Below, the small RED child (the
// runtime protagonist, sized up in character.js) stands close and large in the
// foreground where the beam lands, arms open — a personal "for YOU" shot, not a
// distant tableau of five identical-scale figures. Companions stand smaller,
// further back, still under the light. Awe and hope — bright, triumphant, not
// fearful.
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
// ⚠ REBUILT (Fred: "still too similar to the old drawing... build from scratch").
// The old plate was a dead-symmetric mandala centred on the frame with a group of
// five identically-tiny figures far below. This keeps the same theology (the
// heavens tear open, glory descends) but reframes it: the rift is off-centre
// (upper-right, rule of thirds) so the shaft falls DIAGONALLY instead of straight
// down the middle, and the child is a close, large foreground figure standing
// where the beam lands — a personal "for YOU" shot, not a distant tableau.
// focal.x=560 → portrait x0=404 (focal.x−156), MUST match CAST1[30].fx0.
export const focal = { x: 560, y: 140 }; // off-centre — the rift, and the child beneath it
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
    ridge, distantHills, horizonFringe, fruitTree, LEAF_PALETTES, lightRadial, daub, perspectiveAvenue,
    GOLD, GOLD_PALE, GOLD_DEEP, GOLD_HOT,
  } = E;

  const rng = mulberry32(seed);
  const out = [];
  const counter = { n: 0 };
  // MOBILE 3D LAYERS: as the plate paints in one rng order, we record index
  // ranges per depth plane (SKY / MID / FG) and assemble the requested cel by
  // slicing. `full`/desktop concatenates `out` in its original order, untouched.
  const LAYER = opts.layer || 'full';
  // ⭐ EVERY STROKE DRAWS ITS OWN WIDTH AND LENGTH (Fred: "use no rules") — hashes on
  // position, never the rng, so every drawing of the ring keeps its sequence
  const free = (x, y, salt) => { const n = Math.sin(x * 12.9898 + y * 78.233 + salt) * 43758.5453; return n - Math.floor(n); };
  const widthOf  = (x, y, salt) => 0.40 + 3.2 * Math.pow(free(x, y, salt), 2.6);
  const lengthOf = (x, y, salt) => 0.40 + 1.5 * Math.pow(free(x, y, salt + 17), 1.5);
  const skyRanges = [], midRanges = [], fgRanges = [];

  // THE RIFT: the heavens tear open near the TOP of the frame. The glory pours DOWN
  // from a narrow throat at the rift and widens into a great shaft falling toward the
  // earth. CX/RY define the rift's centre and vertical reach.
  const RIFTX = 560, RIFTY = 66, CORE = 46;
  /* ⭐⭐ THE GLORY POURS. Fred: "lets animate candle comes and nonight."
     ⚠⚠ AND A BOIL ALONE IS NOT MOTION. First cut relied purely on the displacement boil —
     every mark a hair off — and measured against the pages Fred has already approved it was
     plainly wrong: `light`, `prayer` and `together` hold 4-11 points of difference between
     drawings when you shrink them to 40px, while these three collapsed to ~1.1. All the
     change was FINE — per-mark jitter and codec noise — and none of it was large enough to
     see. That is the TV-snow failure written down in the boil memory, arriving from the other
     side: not "too much crawl" but "nothing actually moves".
     What the approved pages have and these did not is something genuinely DRAWN differently
     per frame. Here it is a crest of light travelling OUTWARD from the torn heaven: the marks
     lengthen and brighten as it passes and settle behind it, so the glory pours instead of
     shimmering. It is the page's own verse — "as the lightning cometh out of the east, and
     shineth even unto the west; so shall also the coming of the Son of man be" (Matt 24:27). */
  const _FN = Math.max(1, globalThis.__FRAME_N || 1);
  const _FR = (globalThis.__FRAME || 0) % _FN;
  const PH = _FN > 1 ? _FR / _FN : 0;                    // 0..1 once round the ring
  const TAU = Math.PI * 2;
  const pour = (x, y) => 1 + 0.34 * Math.cos(TAU * (PH - Math.hypot(x - RIFTX, y - RIFTY) / 560));       // off-centre, upper-right — the throat of the torn heaven
  const RAINBOW = SPECTRUM_WHEEL;
  // The earth was a 54px strip under a ruled <rect> edge — a flat band, not a world.
  // Raised to leave room for an actual landscape: rolling hills, a valley of lit
  // houses, trees, and a horizon of grass rather than a drawn line. He returns to
  // somewhere (John 14:3 'I will come again, and receive you unto myself').
  const earthY = 388;
  // every mark's lit edge points at the torn heaven, so one source models the whole page
  E.setReliefLight({ x: RIFTX, y: RIFTY });
  const maxR = Math.hypot(W, H) * 0.74;

  // the glory BURSTS RADIALLY from the torn heaven (was a downward cone). `inShaft` is
  // now a RADIAL mask — 1 at the rift throat, fading to 0 at the reach: a sunburst of
  // glory, not a column. (Rev 19:11 — heaven opened; the glory breaks out in all rays.)
  const shaftAxisX = y => RIFTX + (fbm(y / 70, 3.3, 17) - 0.5) * 26;   // (kept: the falling sparks + landing point)
  const shaftHalf = y => 40 + Math.max(0, y - RIFTY) * 0.62;
  const GLOWR = 400;   // tighter than before (470) — off-centre now, so it no longer needs to fill the whole sky to read as vast
  const inShaft = (x, y) => Math.max(0, 1 - Math.hypot(x - RIFTX, y - RIFTY) / GLOWR);

  /* ---------------- LIGHT MODEL — glory at the rift, spilling DOWN the shaft ----------------
     Strong near the rift throat, then carried downward by the falling shaft so the eye
     is pulled from the torn sky at top down to the lifted hands. */
  /* ⚠⚠⚠ THE COMING CROSSES THE WHOLE SKY. Fred, on this page and the last: "comes and nonight
     are a mess. redraw these 2 from scratch. this is the ending of the book... it has to be
     good." Consulted, and scripture does not leave the composition open:

        Matt 24:27  "For as the LIGHTNING cometh out of the EAST, and shineth even unto the
                     WEST; so shall also the coming of the Son of man be."
        Rev 1:7     "Behold, he cometh WITH CLOUDS; and EVERY EYE shall see him."

     The page had a tidy radial halo in the upper-right corner, reaching 400px and dying —
     a glory in one quarter of a sky, with three-quarters of the heaven not knowing. That is
     the opposite of what the verse describes. The light now runs EAST TO WEST as a great
     band across the full width, brightest at the throat where the heaven is torn and still
     burning at both edges of the frame, so there is nowhere left to stand that does not see
     it. ("Every eye" is a compositional instruction, not a flourish.) */
  const lightAt = (x, y) => {
    const halo = Math.min(1, Math.exp(-Math.hypot(x - RIFTX, (y - RIFTY) * 1.04) / 150) * 1.05);
    const shaft = inShaft(x, y) * Math.max(0.2, 1 - (y - RIFTY) / 520);
    // the lightning band: falls off hard with height, barely at all with distance across
    const bandY = RIFTY + 34 + Math.sin((x - RIFTX) / 210) * 26;      // it is not a ruled line
    const band = Math.exp(-Math.abs(y - bandY) / 96) * (0.42 + 0.58 * Math.exp(-Math.abs(x - RIFTX) / 640));
    return Math.min(1, Math.max(halo, Math.max(shaft * 0.9, band)));
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
    /* ⚠ AND THE HEAVEN AWAY FROM IT GOES DOWN. The old sky ripened by HEIGHT alone, so the
       whole upper third was pale whether the glory was there or not and the coming had
       nothing to break out of. Deepened by the inverse of the light itself: the band burns,
       and everything the band is not falls back into the night it is tearing. */
    c = mix(c, '#1b1c46', Math.pow(1 - g, 2.2) * 0.62);
    if (g > 0.12 && g < 0.26 && r() < 0.04) return jig('#5a7ad0', r, 16);   // complementary flick — the life
    return jig(c, r, 11);
  };

  // the shaft flows DOWNWARD: strokes rake down and out from the rift throat, fanning
  // open as they fall (a great beam coming down), with a little curl so it breathes.
  const downDir = (x, y) => {
    const [c, d] = curlV(x, y, 14, 150);
    return Math.atan2((y - RIFTY) + d * 40, (x - RIFTX) + c * 40);   // radiate straight OUT from the rift, with a living curl
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
    col: (x, y, r) => {
      const c = skyGroundCol(x, y, r);
      return mix(c, '#ffeec4', Math.max(0, pour(x, y) - 1) * 0.55);   // the crest carries the light with it
    },
    // ⚠ a scale gradient on the heaven too: the marks are fine and dense up in the torn
    // throat and open out as they go from it, so the sky has air and a place to look
    len: (x, y) => (16 + 46 * Math.min(1, Math.hypot(x - RIFTX, y - RIFTY) / 460)) * pour(x, y),
    lw: (x, y) => (4 + 8 * Math.min(1, Math.hypot(x - RIFTX, y - RIFTY) / 460)) * (0.7 + 0.3 * pour(x, y)),
    steps: 4, follow: 0.91, wild: 0.05, lenJ: 0.5, impasto: 0.5, relief: 0.55,
  });

  /* ⚠⚠ "HE COMETH WITH CLOUDS" (Rev 1:7). The heaven was a field of streaming strokes and
     nothing else — so the great band of light came out as venetian blinds, and the one thing
     the verse actually names about the sky was missing. These are real cloud masses strung
     along the band: each one dark in its belly and burning on the side that faces the torn
     throat, which is how a cloud behaves with a light behind it and is also the whole reason
     to have them — they give the glory something to break around. */
  {
    const cRng = mulberry32(seed ^ 0xc10d);
    const CLOUDS = [[-10, 126, 118, 42], [140, 100, 108, 36], [292, 146, 96, 32],
                    [712, 110, 116, 40], [806, 158, 108, 36], [400, 200, 88, 28],
                    [654, 220, 100, 32], [196, 230, 92, 28]];
    for (const [cx, cy, cw, ch] of CLOUDS) {
      const lit = Math.atan2(RIFTY - cy, RIFTX - cx);          // which way the throat lies
      const lx = Math.cos(lit), ly = Math.sin(lit);
      strokes(out, counter, {
        rng: cRng, n: Math.round(cw * 2.2),
        sample: r => {
          const t = r() * Math.PI * 2, d = Math.pow(r(), 0.55);
          return [cx + Math.cos(t) * cw * 0.5 * d, cy + Math.sin(t) * ch * d];
        },
        dir: (x, y) => Math.atan2((y - cy) * 0.35, (x - cx)) + Math.PI / 2,
        col: (x, y, r) => {
          // how far round the cloud toward the light: 1 on the lit rim, 0 in the belly
          const nx = (x - cx) / (cw * 0.5 + 1), ny = (y - cy) / (ch + 1);
          const face = Math.max(0, Math.min(1, (nx * lx + ny * ly) * 0.5 + 0.5));
          const g = lightAt(x, y);
          /* ⚠ A CLOUD IS NOT A BRUISE. First cut ran the belly to #241f52 and shaded it with
             pow(face,1.5), so most of every cloud's area fell in the dark half and they read
             as purple contusions hung in the sky. A cloud with light behind it is LUMINOUS
             nearly all over — it is only the deepest underside that goes to shadow. */
          let c = ramp(['#4e4680', '#665a95', '#9084ae', '#c8a8ac', '#f6d79a', '#fff8e6'],
            Math.pow(face, 0.85) * 0.95 + g * 0.40);
          return jig(c, r, 9);
        },
        len: (x, y) => 9 + 16 * Math.min(1, Math.hypot(x - cx, y - cy) / (cw * 0.5)),
        lw: (x, y) => 3 + 5 * Math.min(1, Math.hypot(x - cx, y - cy) / (cw * 0.5)),
        steps: 3, follow: 0.9, wild: 0.12, lenJ: 0.6, impasto: 0.5, relief: 0.4, op: 0.74,
      });
    }
  }
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
    // ⭐ DETAIL PASS (Sep 8): every stroke its own width and length (free hashes on
    // position — safe on a boiled plane), and the cloud lips at a hairline relief
    len: (x, y) => (16 + Math.abs(x - RIFTX) * 0.07) * lengthOf(x, y, 11), lw: (x, y) => (2.8 + Math.abs(x - RIFTX) * 0.012) * widthOf(x, y, 13),
    steps: 4, follow: 0.92, wild: 0.05, lenJ: 0.3, wJ: 0.3, impasto: 0.55, relief: 0.4,
  });
  skyRanges.push([_rentHeavens0, out.length]);   // [SKY] the parting cloud lips

  // 3. THE GREAT DESCENDING SHAFT — long gold ray-filaments streaming straight DOWN
  // the cone from the rift toward the earth (the dominant directional gesture).
  const _shaft0 = out.length;
  strokes(out, counter, {
    rng, n: 620,
    sample: r => {                                        // born of the rift, radiating OUT (down + sideways)
      const a = Math.PI * (0.03 + r() * 0.94);            // the downward hemisphere: right → down → left
      const d = 24 + Math.pow(r(), 0.72) * 450;
      return [RIFTX + Math.cos(a) * d, RIFTY + Math.sin(a) * d];
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
    len: (x, y) => 22 + 64 * Math.min(1, Math.hypot(x - RIFTX, y - RIFTY) / 380),   // rays lengthen as they reach out from the rift
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
    len: (x, y) => 14 * lengthOf(x, y, 21), lw: (x, y) => 2.0 * widthOf(x, y, 23), steps: 3, follow: 0.95, lenJ: 0.3, wJ: 0.3, impasto: 0.4, relief: 0.35,
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
    len: (x, y) => 13 * pour(x, y) * lengthOf(x, y, 31), lw: (x, y) => 2.2 * widthOf(x, y, 33), steps: 2, wJ: 0.3, lenJ: 0.3, impasto: 0.55,
  });
  // THE BLAZING THROAT — the brightest white-gold, at the rift mouth
  strokes(out, counter, {
    rng, n: 320,
    sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 0.72) * CORE; return [RIFTX + Math.cos(a) * d, RIFTY + Math.sin(a) * d * 0.85]; },
    dir: () => Math.PI / 2,
    col: (x, y, r) => jig(ramp(['#ffffff', '#fffdf0', GOLD_HOT, GOLD_PALE], Math.hypot(x - RIFTX, (y - RIFTY) / 0.85) / CORE), r, 5),
    len: (x, y) => 10 * pour(x, y) * lengthOf(x, y, 41), lw: (x, y) => 2.0 * widthOf(x, y, 43), steps: 2, wJ: 0.3, lenJ: 0.3, impasto: 0.55,
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
  const landX = shaftAxisX(earthY);                       // where the shaft strikes the ground
  const gLand = lightRadial(landX, earthY - 10, 340);     // the coming glory, lighting the world it returns to

  /* ---------------- THE LAND — grandeur, not a wavy line ----------------
     A single rolling contour reads as a horizon; the great silhouette landscapes
     read as a WORLD because of three things:
       · LAYERED PLANES receding, each paler than the one in front — atmospheric
         perspective does the depth work before any detail is drawn.
       · PROFILES WITH CHARACTER — a bluff shoulder, a headland falling away. A
         ridge function alone gives undulation; a landscape needs landmarks.
       · A FOREGROUND THAT FRAMES (the grasses added after the houses) — so you
         look THROUGH something into the distance instead of at a backdrop. That
         is what gives the reference photographs their depth.
     Munch holds: the land is natural, so all of it curves. */
  /* ══ THE COMPOSITION ═══════════════════════════════════════════════════════════════════
     Fred: "it is better but still not to my expectations." He is right, and the fault was
     never the texture — I spent a whole pass adding paint to a picture whose BONES were the
     textbook amateur landscape. Every one of these, by name:
       · sky, middle ground and foreground stacked as HORIZONTAL BANDS parallel to the frame
         edge — the single thing that flattens a landscape;
       · a ROW of same-sized trees along the top of the near band — multiple parallel lines,
         which lead the eye off the canvas;
       · four children in a LINE at the same depth, evenly spaced, all facing front with
         their arms up — equal masses and repetitive shapes;
       · no foreground framing, no leading line, and no cast shadows, so no ground plane.
     The cures are the old ones and they are structural, not decorative: a REPOUSSOIR mass in
     the near corner that brackets the view and forces depth; a DIAGONAL, because a diagonal
     is the one line that never runs parallel to the frame; figures GROUPED with real variety
     of size and distance; and Claude Lorrain's bands of light and dark — a dark near mass on
     one side against open lit country on the other.

     ⚠ THE THREE RIDGES MUST NOT BE PARALLEL EITHER. Each now carries its own TILT, so the
     land is high and near on the left and falls away east into the country the glory pours
     into. The near field becomes a WEDGE — wide at the reader's left foot, narrowing toward
     the strike — which is the diagonal the whole page is built on. */
  const tilt = k => x => k * (x - 400) / 400;
  const bluff = (base, amp, freq, sd, marks, tk) => x => {
    let y = ridge(base, { amp: amp, freq: freq, bumps: 0.35, seed: sd })(x) + tilt(tk || 0)(x);
    for (const [mx, mw, mh] of marks) {                 // landmarks: shoulders, headlands
      const t = (x - mx) / mw;
      y -= mh * Math.exp(-t * t * 2.2);
    }
    return y;
  };
  const FAR  = bluff(earthY - 76, 12, 300, 831, [[150, 120, 26], [620, 150, 34]], -22);
  const MID  = bluff(earthY - 44, 16, 230, 837, [[430, 130, 30], [770, 110, 20]], -34);
  const NEAR = bluff(earthY + 14, 20, 190, 843, [[250, 150, 26], [660, 130, 16]], -62);
  const jagged = (fn, sd) => x => {
    const fine = (fbm(x / 3.1, 2.1, sd) - 0.5) * 6.0;
    const tuft = Math.max(0, fbm(x / 8.5, 9.4, sd + 4) - 0.52) * 20;
    return fn(x) + fine - tuft;
  };
  const band = (fn, fill, sd) => {
    const jg = jagged(fn, sd);
    let d = `M-2 ${R1(jg(-2))}`;
    for (let x = -2; x <= 802; x += 2.4) d += `L${R1(x)} ${R1(jg(x))}`;
    d += `L802 ${H + 2}L-2 ${H + 2}Z`;
    out.push(`<path d="${d}" fill="${fill}"/>`); counter.n++;
  };
  /* ⚠ AND THE BAND FILLS THEMSELVES CANNOT BE FLAT. Whatever the strokes fail to cover IS
     the picture there, and two flat violet slabs were showing through as exactly that — a
     purple wedge across the eastern distance where the country should be opening into light.
     Each band is laid as a west→east ramp instead: cool and deep behind the wood, pale and
     warm out where the heaven is torn. The paint on top then has a floor that is already
     going the right way. */
  /* ⚠⚠ AND THE DISTANT LAND MUST NOT BE THE SKY'S OWN COLOUR. Fred, circling the far ridge in
     the east: "change the color of this mountain to be something else, it is too similar to
     the sky." He is right and it is a real fault, not a preference. I had ramped both bands
     warm as they run east — dusty peach and tan — reasoning that the country nearest the torn
     heaven takes its light. But the sky THERE is cream and gold, so the ridge came out the
     same family of colour at nearly the same value, and a landmass that matches the sky
     behind it stops being a landmass: it reads as more sky with a line drawn on it.
       Aerial perspective actually runs the other way, and it is one of the oldest facts in
     landscape painting: distance goes COOL and BLUE, whatever colour the light is. Against a
     warm sky that is also the maximum separation available — so the far country is blue now,
     the horizon reads instantly as a horizon, and the gold above it sings louder for having
     something cold to be gold against. The west end stays violet, where the dawn still holds. */
  out.push(`<defs>
<linearGradient id="cband1" x1="0" y1="0" x2="1" y2="0">
<stop offset="0" stop-color="#2e2b4c"/><stop offset="0.42" stop-color="#37405e"/><stop offset="1" stop-color="#3e5b68"/>
</linearGradient>
<linearGradient id="cband2" x1="0" y1="0" x2="1" y2="0">
<stop offset="0" stop-color="#241f3c"/><stop offset="0.45" stop-color="#2b3352"/><stop offset="1" stop-color="#2c4c58"/>
</linearGradient></defs>`); counter.n++;
  band(FAR,  'url(#cband1)', 851);      // farthest: lightest, most air in front of it
  band(MID,  'url(#cband2)', 857);
  // NEAR is NOT drawn yet. The village is seated on MID and painted next, so it is
  // silhouetted against the paler FAR ridge and the sky — dark against light, which
  // is the only way a small dark form reads. Then NEAR is laid IN FRONT of it, taking
  // the bases of the houses and putting real ground between the reader and the town.
  const landTop = MID;             // houses and trees ride the middle band
  /* ══ THE GROUND, ACTUALLY PAINTED ═══════════════════════════════════════════════════════
     Fred: "fix both page's landscape and details. right now it is like a kid's drawing...
     i like the details in gift." The bottom two-fifths of this page were a flat dark shape
     with a row of trees standing on its edge, and two faults made it so:
       ⚠⚠ 1 · THE PAINT WAS BEING BURIED. 420 strokes were laid across y 384-506 and then
            `band(NEAR)` — a flat #241a38 silhouette — was filled straight over most of them.
            Whatever was painted there never survived to the raster. The ground is painted in
            TWO stages now, one on each side of that band.
       ⚠⚠ 2 · 420 MARKS IS NOT A FIELD. `gift`, the page he is measuring these against, lays
            ~13,000 over ground that ROLLS. Same four-layer sward here, in this page's own
            night-dawn key: the land swells, value follows which way each slope faces the
            coming glory, the hollows are laid first and every later pass is REJECTED in
            them, and the marks grow with the scale gradient toward the reader's feet. */
  const c01 = v => Math.max(0, Math.min(1, v));
  const dS = y => 0.34 + 1.0 * c01((y - (earthY - 70)) / (H - (earthY - 70)));
  const swell = (x, y) => fbm(x / 150, y / 62, 313);
  const facing = (x, y) => {
    const e = 7;
    return (swell(x - e, y) - swell(x + e, y)) * 2.2 + (swell(x, y - e) - swell(x, y + e)) * 1.2;
  };
  const clump = (x, y) => fbm(x / 24, y / 16, 331);
  // ⚠ NO BLACK, AND NO ONE PURPLE EITHER. The land He returns to is night giving way — deep
  // indigo in the hollows, violet on the slopes, and every mark keeping its own hue rather
  // than collapsing into a silhouette. It is dark so the glory has something to be bright
  // against (the chiaroscuro law), not because it is empty.
  /* ⚠⚠ AND A VIOLET FIELD CANNOT SURVIVE THE PAGE. The plate had real hollows and rises in
     it and the page still came back a flat lavender mat, because the live filter has a
     blue-violet shadow floor: a whole ground painted in one mid-luminance violet is exactly
     the input it averages to grey-lilac. The cure is not more contrast in one hue — it is
     LOCAL COLOUR the filter cannot average away. This is a LAND at first light, so it is
     grass and earth: deep blue-green in the hollows, olive and ochre on the lit rises, and
     the violet kept for the distance (aerial perspective) and the pool of gold kept for the
     spot the glory strikes. Three colours across the field instead of one. */
  const EARTH = ['#131e26', '#1b2b30', '#25403a', '#365641', '#4c704b', '#6d8b57'];
  /* ⚠ AND THE LAND HAS TO BE LIT BY THE SKY, NOT ONLY BY THE LANDING POINT. `gLand` is a
     340-unit radial at the spot where the shaft strikes, so everything outside that circle —
     most of the field, and the whole wood — was painted at its unlit floor and came back a
     black mat. The heavens are TORN OPEN over this land: the glory is a sky-wide source, and
     a ground under a lit sky is never black. So: the landing pool where it strikes, plus a
     broad fall-off from the rift itself over everything. */
  const skyLit = (x, y) => Math.max(gLand(x, y),
    Math.max(0, 1 - Math.hypot(x - RIFTX, (y - RIFTY) * 0.8) / 700) * 0.62);
  /* ⭐⭐ THE LIGHT FALLS ON THIS LAND IN SHAFTS. Fred: "make landscape better also." The
     ground was evenly lit and evenly textured from edge to edge, and an evenly lit field is
     the flattest thing in painting however much detail is in it — because what the eye reads
     in a landscape first is not detail, it is the PATTERN OF LIGHT AND SHADE lying across it.
     This page has the strongest possible reason for that pattern: the heavens are torn open
     (Rev 19:11) and the glory bursts out in rays. Those rays are already drawn in the sky; the
     land simply continues them. Broad wedges from the rift land as bright bands across the
     country, and between them the earth stays deep — which is also, physically, exactly what
     broken light through an opening does. The shafts converge on the rift, so every band on
     the ground points back at Him: "as the lightning cometh out of the east, and shineth even
     unto the west; so shall also the coming of the Son of man be" (Matt 24:27). */
  const BEAMS = [[-0.46, 0.13], [-0.17, 0.10], [0.09, 0.17], [0.38, 0.11], [0.66, 0.15]];
  const beamAt = (x, y) => {
    const a = Math.atan2(y - RIFTY, x - RIFTX);
    let m = 0;
    for (const [off, hw] of BEAMS) {
      const d = a - (Math.PI / 2 + off);
      m = Math.max(m, Math.exp(-(d * d) / (2 * hw * hw)));
    }
    // softened at the edges by the air, and thinning as it runs out from the opening
    m *= 0.7 + 0.3 * fbm(x / 90, y / 60, 787);
    return m * Math.max(0, 1 - Math.hypot(x - RIFTX, y - RIFTY) / 1500);
  };
  const groundCol = (x, y, r, lift, deepen) => {
    const g = skyLit(x, y);
    const depth = c01((y - MID(x)) / (H - MID(x)));
    /* ⚠⚠ AND CHECK WHERE THE RAMP ACTUALLY LANDS. With a 0.10 base and a −0.26 depth term the
       whole near field evaluated to the FIRST colour in the ramp — every layer, every mark —
       so five carefully-built sward passes came back as one flat near-black mat. A ramp is
       only a range if the values you feed it use the range. Measured, not assumed. */
    let c = ramp(EARTH,
      /* ⚠ THE STRUCTURE HAS TO BE LARGE-SCALE OR THE PAGE EATS IT. The live filter lifts a
         plate's median and compresses its spread ~17%; fine noise does not survive that, and
         the field came back a flat lavender mat with all its hollows averaged away. So the
         weight moves off the small fbm and onto the two BIG terms — the swell of the land and
         which way each slope faces — which are the ones you can still see at a thumbnail. */
      0.34 + fbm(x / 44, y / 28, 53) * 0.24 + facing(x, y) * 0.85 + swell(x, y) * 0.52
      + (clump(x, y) - 0.5) * 0.78 + lift - depth * (deepen || 0));
    // broken colour in the shade: away from the coming light each mark keeps its own note
    if (r() < 0.24 + (1 - g) * 0.3) c = mix(c, ['#2b3a5e', '#3c3a62', '#243c4a'][(r() * 3) | 0], 0.3);
    /* ⚠ AND ONE BROAD WARM WASH IS NOT A LANDING. `skyLit` covers most of the field, so
       mixing the gold by it painted the whole ground the same brown-violet — the pool where
       the shaft actually STRIKES has to come from the tight radial, or the page loses the one
       event it is about. Broad sky-warmth stays gentle; the strike goes gold. */
    const gp = gLand(x, y), bm = beamAt(x, y);
    c = mix(c, '#7a6438', g * 0.22);                       // the lit sky, warming everything a little
    /* the SHAFTS: where a band of the glory lands, the ground is lit; between them it is not.
       ⚠ AND THE SECOND HALF IS THE POINT. A first pass only WARMED the lit bands and they did
       not read at all — because a shaft of light is not a bright stripe, it is a bright stripe
       WITH SHADOW EITHER SIDE OF IT, and the eye reads the boundary, not the brightness.
       Lifting the lit bands and deepening everything between them is one move, not two. */
    c = mix(c, '#2b3059', (1 - bm) * 0.26);
    c = mix(c, '#8f7f4c', bm * 0.60);
    c = mix(c, '#dcb96e', Math.pow(bm, 1.7) * 0.74);
    c = mix(c, '#c99a48', Math.pow(gp, 1.5) * 0.58);       // the glory landing on the earth
    c = mix(c, '#ffe0a0', Math.pow(gp, 3.0) * 0.5);        // and white-gold where it strikes
    /* ⭐ AERIAL PERSPECTIVE, AND THE LIGHT/DARK DIVISION IT CARRIES. One flat purple slab sat
       across the whole eastern middle distance — the band fill, never painted over, because
       the ground pass only sampled from the near brow down. Distance is not a darker shape
       behind a lighter one; it is AIR: everything loses contrast and takes the colour of the
       light it is seen through. Here the light is a torn heaven in the east, so the far
       country there goes pale and warm — luminous open land — while the west, behind the
       wood and out of the glory's reach, keeps the dawn's cool violet. That difference IS
       Claude Lorrain's band of dark against band of light, and it is what the eye travels. */
    const air = c01((NEAR(x) + 12 - y) / 76);                      // 0 at the reader's feet, 1 at the skyline
    const east = c01((x - 180) / 520);
    // ⚠ the haze goes COOL as it runs east, for the same reason as the bands above — it used
    // to run to #d9b98a, which is the sky's own peach, and it took the far country with it.
    c = mix(c, mix('#6b5c96', '#78a0a8', east * 0.85), Math.pow(air, 0.85) * 0.72);   // ⚠ slate-teal, not cornflower: the protagonist wears blue and a distance in his own hue flattens him into it
    c = mix(c, '#ffe6b0', Math.pow(air, 1.6) * east * gp * 0.3);   // a touch of the glory where it strikes, no more
    return jig(c, r, 9);
  };
  /* ══ THE FAR COUNTRY, PAINTED ══════════════════════════════════════════════════════════
     ⚠⚠⚠ Fred, on the distant ridge — and correcting my diagnosis, which had been about its
     HUE: "maybe that is not the problem. the problem is that the ground looks just like
     painting everything 1 block of color instead of painting."
       He is exactly right, and it is the most useful note of the day. That ridge was an SVG
     `<path>` FILL — one flat area of colour with a drawn edge — sitting in a picture where
     everything else, sky and trees and near grass alike, is made of thousands of visible
     brush marks. It did not matter what colour I made it. A filled shape among painted ones
     reads as COLOURED IN, and the eye catches that instantly even when it cannot name it.
       So the distance gets painted like everything else, and painted means three things, not
     one:
       · ENOUGH MARKS TO COVER. The old pass spread 5,000 across the whole earth, most of them
         landing in the near field, so the far band kept its fill and a few specks on top.
         The fills stay ONLY as a dark floor, deeper than the paint, so gaps read as depth.
       · BROKEN COLOUR. This is the actual difference between painting and colouring in: a
         distant hill is never one colour, it is fifty related ones — blues, violets, warm
         greys, a rose note, a green note — that fuse at reading distance and separate up
         close. Neighbouring marks must DISAGREE.
       · FORM AND CONTENT. Value follows which way each fold of the land faces, and there are
         things standing on it — a far treeline, hedges along the contours — at almost no
         contrast, because a country has stuff on it and a shape does not. */
  const farFold = (x, y) => fbm(x / 130, y / 30, 907);
  const farFace = (x, y) => {
    const e = 6;
    return (farFold(x - e, y) - farFold(x + e, y)) * 2.4 + (farFold(x, y - e) - farFold(x, y + e)) * 1.2;
  };
  /* ⚠ AND DISTANCE IS QUIET. Broken colour is what makes paint read as paint, but it is not
     a licence for noise: the first cut ran a seven-step ramp from near-black to pale and
     flipped a third of its marks hard across a wide palette, and the far country came back as
     GRAVEL — busier than the field in front of it, which inverts the whole picture. Air takes
     CONTRAST out of things: the range is compressed and lifted into the light half, and the
     broken notes stay close to their neighbours in value. Many colours, small differences. */
  const FARC = ['#4a5578', '#55618a', '#616f99', '#6d80a6', '#7a93b0', '#88a6bb', '#9ab9c6'];
  const FBROKEN = ['#6b7898', '#77809a', '#828199', '#74939c', '#8a9694', '#948795', '#6f8ba6', '#7d9490'];
  const farCol = (x, y, r, lift) => {
    const east = c01((x - 140) / 560);
    const dep = c01((y - FAR(x)) / Math.max(14, MID(x) - FAR(x) + 30));
    let c = ramp(FARC, 0.20 + farFold(x, y) * 0.34 + farFace(x, y) * 0.80
                     + dep * 0.20 + east * 0.18 + lift + (r() - 0.5) * 0.10);
    if (r() < 0.30) c = mix(c, FBROKEN[(r() * FBROKEN.length) | 0], 0.18 + r() * 0.22);
    c = mix(c, '#e8cf9c', Math.pow(beamAt(x, y), 1.5) * (0.2 + east * 0.6) * 0.5);
    return jig(c, r, 11);
  };
  strokes(out, counter, {                                  // 1a · the body of the far country
    rng, n: 5600,
    sample: rej(-12, earthY - 130, 812, earthY - 20, (x, y) => y > FAR(x) + 0.5 && y < MID(x) + 14),
    dir: (x, y) => Math.atan2(farFace(x, y) * 0.55, 1) + (fbm(x / 46, y / 16, 911) - 0.5) * 0.5,
    col: (x, y, r) => farCol(x, y, r, 0),
    len: 6.5, lw: 2.1, steps: 2, lenJ: 0.75, impasto: 0.35, relief: 0.25,
  });
  strokes(out, counter, {                                  // 1b · and a finer weave over it
    rng, n: 3200,
    sample: rej(-12, earthY - 130, 812, earthY - 20, (x, y) => y > FAR(x) + 1 && y < MID(x) + 10),
    dir: (x, y) => Math.atan2(farFace(x, y) * 0.7, 1) + (fbm(x / 19, y / 11, 913) - 0.5) * 0.85,
    col: (x, y, r) => farCol(x, y, r, 0.13),
    len: 4.2, lw: 1.35, steps: 2, lenJ: 0.9, impasto: 0.45,
  });
  {                                                        // 1c · things standing on it
    const dRng = mulberry32(seed ^ 0x2f13);
    for (let i = 0; i < 190; i++) {                        // a far treeline, almost no contrast
      const tx = -12 + dRng() * 824;
      const ty = FAR(tx) + 2 + Math.pow(dRng(), 1.5) * Math.max(6, (MID(tx) - FAR(tx)) * 0.8);
      const hgt = 3 + Math.pow(dRng(), 1.6) * 9;
      const col = jig(mix(farCol(tx, ty, dRng, -0.10), '#4c5874', 0.22 + dRng() * 0.24), dRng, 8);
      paintPath(out, counter, dRng, [[tx, ty], [tx + (dRng() - 0.5) * 2, ty - hgt]],
        () => col, { lw: 1.4 + dRng() * 1.4, len: 2.4, density: 1, jitter: 0.35 });
    }
    for (let i = 0; i < 26; i++) {                         // hedges along the contours
      const hx = -20 + dRng() * 840, hy = FAR(hx) + 4 + dRng() * Math.max(8, (MID(hx) - FAR(hx)) * 0.85);
      const run = 40 + dRng() * 110, dip = (dRng() - 0.5) * 9;
      paintPath(out, counter, dRng, [[hx, hy], [hx + run * 0.5, hy + dip * 0.6], [hx + run, hy + dip]],
        (x, y, r) => jig(mix(farCol(x, y, r, -0.08), '#48546e', 0.2 + r() * 0.22), r, 8),
        { lw: 2.2 + dRng() * 1.6, len: 3.4, density: 0.85, jitter: 0.5 });
    }
  }
  // 2 · THE MIDDLE BAND — the ground the wood stands in. Small marks, low contrast: this is
  // distance too, and it must not compete with the near field.
  strokes(out, counter, {
    rng, n: 4200,
    sample: rej(-10, earthY - 90, 810, earthY + 50, (x, y) => y > MID(x) - 2),
    dir: (x, y) => 0.05 + (fbm(x / 50, y / 30, 47) - 0.5) * 0.5,
    col: (x, y, r) => groundCol(x, y, r, 0.04, 0),
    len: (x, y) => 9 * dS(y), lw: (x, y) => 2.4 * dS(y), steps: 2, lenJ: 0.6, impasto: 0.4, relief: 0.3,
  });
  // a bright pool where the shaft lands — the descent touching down among the figures
  strokes(out, counter, {
    rng, n: 160,
    sample: r => { const a = r() * Math.PI, d = Math.pow(r(), 1.2) * 120; return [landX + Math.cos(a + Math.PI) * d * 1.5, earthY + 4 + Math.abs(Math.sin(a)) * d * 0.35]; },
    dir: () => 0,
    col: (x, y, r) => { const d = Math.abs(x - landX); return jig(ramp([mix(GOLD_HOT, '#caa64a', 0.3), '#8a6e36', '#3a2f56'], d / 160), r, 9); },
    len: 13, lw: 2.8, steps: 2, impasto: 0.4,
  });

  // ---------------- A WOODED VALLEY ----------------
  // Not a village — this is wild country He is coming back to. Depth here is carried
  // by TREE SCALE: a stand of tiny ones far off on the mid band, bigger ones nearer,
  // and two great trees close enough to be cut by the frame. Same trick as the land's
  // three bands, but with a thing the eye already knows the size of, which is what
  // makes a distance believable — you read the far trees as far because you know how
  // big a tree is.
  // Canopies stay MAJORITY GREEN with one free accent each: Munch's licence holds, but
  // a child has to be able to say "tree" before the art gets to be clever (Matt 18:3).
  /* ⚠⚠ AND THE TREES WERE COVERED IN SWEETS. Every stand on this page was carrying fruit at
     0.14-0.20 in five candy accents — pink, mint, cornflower, lilac — so a dark country at
     the Second Coming came up as a row of cartoon apple trees with pastel dots all over
     them, which is most of what still read as a child's drawing here. `comes` is not an
     orchard: it is the wild land He returns to, at dawn, under a torn sky. The accents stay
     (Munch's licence, and a canopy may carry one free note) but they are pulled to notes a
     dark wood can actually hold, and the fruit is cut to a rarity. */
  const ACCENTS = ['#4a7ab0', '#7a6aa8', '#4aa88a', '#b09a58', '#a06a86'];
  const leafy = i => ['#2f6a2c', '#4f8c36', ACCENTS[i % ACCENTS.length]];

  /* ⭐ A WOOD IS A MASS, NOT A ROW. Nine trees at even-ish spacing along one contour, each
     the same round shape, is a row of lollipops however carefully the heights are jittered —
     and that is what a child's drawing of a forest looks like. The recipe (learned on `ran`,
     and it is the same one every time):
       1 · paint the band as CONTINUOUS CANOPY first, its depth wandering with the land, deep
           enough to be a country (20-70 units, not 10-30);
       2 · let it DIP BELOW the ground edge here and there, so the field interlocks with it in
           bays instead of meeting it along a seam;
       3 · raise the individual trees OUT of that mass in clumps, most small and a few
           breaking the skyline — overlap is what reads as forest; a tree alone in its own gap
           reads as a shrub on a lawn;
       4 · give it the page's own light and LESS distance-haze than instinct says.
     Here the light is the tearing heaven, so the wood is a dark country with its crowns
     rimmed by the coming glory — which is exactly the chiaroscuro this page is built on. */
  {
    const wRng = mulberry32(seed ^ 0x9e3779b9);
    /* ⚠ AND A WOOD SPREAD EVENLY ACROSS THE WHOLE WIDTH IS ANOTHER BAND. Claude Lorrain's
       device, and the one this page needs: a DARK MASS on one side against OPEN LIT COUNTRY
       on the other. The wood is deep in the west and thins away to nothing in the east, so
       the glory pours into open land and the eye travels from the dark near corner out into
       the light. */
    const west = x => Math.max(0, Math.min(1, 1.28 - x / 610));
    const woodDepth = x => (34 + 52 * fbm(x / 132, 3.7, 617) + 16 * Math.sin(x / 96 + 1.1)
                          - Math.max(0, fbm(x / 46, 8.2, 623) - 0.55) * 46) * west(x);
    // 1 · the continuous canopy
    strokes(out, counter, {
      rng: wRng, n: 8200,
      sample: r => {
        const x = -14 + r() * 828;
        const top = MID(x) - woodDepth(x);
        if (top > MID(x) - 4) return null;                     // a bay: no wood here
        return [x, top + Math.pow(r(), 0.7) * (MID(x) + 6 - top)];
      },
      dir: (x, y) => Math.atan2((fbm(x / 9, y / 7, 631) - 0.5) * 1.6, 1) + Math.PI / 2,
      col: (x, y, r) => {
        const top = MID(x) - woodDepth(x);
        const crown = c01((MID(x) + 6 - y) / Math.max(8, MID(x) + 6 - top));   // 1 at the treetops
        let c = ramp(['#101d1c', '#172a24', '#20392c', '#2c5036', '#3d6a42', '#54874e'],
          crown * 0.78 + fbm(x / 11, y / 9, 637) * 0.34 + (r() - 0.5) * 0.16);
        c = mix(c, '#b6cf78', Math.pow(crown, 2.4) * 0.4);      // the light is above, so the tops go yellow-green
        c = mix(c, '#f6cf82', skyLit(x, y) * 0.5);              // and the coming glory rims what faces it
        c = mix(c, '#4a3f74', 0.16);                            // one breath of the dawn's air, no more
        if (r() < 0.06) c = mix(c, '#0a1216', 0.55);            // gaps you see through
        return jig(c, r, 8);
      },
      len: 4.4, lw: 2.3, steps: 2, lenJ: 0.8, impasto: 0.6, relief: 0.35,
    });
    // 2 · trees raised OUT of the mass, in clumps — most small, a few breaking the skyline
    const CLUMPS = [24, 78, 128, 174, 226, 288, 358, 452, 604];   // packed west, thinning east
    for (const cxx of CLUMPS) {
      const n = 2 + ((wRng() * 3) | 0);
      for (let k = 0; k < n; k++) {
        const tx = cxx + (wRng() - 0.5) * 78;
        const th = (20 + Math.pow(wRng(), 1.5) * 56) * (0.55 + 0.75 * west(cxx));
        E.paintTree(out, counter, wRng, tx, MID(tx) + 6, th, {
          lightFn: skyLit, shadowDir: tx < landX ? -1 : 1, blossom: 0,
          blossomCols: ['#7d9a5c', '#93a866', '#c0a86e'],
          crownCols: ['#0e1c1a', '#152722', '#1d372a', '#284b34', '#356140', '#487c4c', '#68985c'],
        });
      }
    }
  }
  // FAR STAND — a thin line of little trees on the far ridge, beyond the wood: hazy, cool,
  // and small enough that the eye reads the gap to them as miles.
  for (let i = 0; i < 22; i++) {
    const tx = -10 + rng() * 820;
    const th = 9 + rng() * 7;
    fruitTree(out, counter, rng, tx, FAR(tx) + 4, th, th * 0.44,
      ['#2c4a44', '#3a5c50', mix(ACCENTS[i % ACCENTS.length], '#4a5f7a', 0.7)], skyLit, 0.02,
      { blossomCols: ['#5c7a4e', '#748c58', '#93916a'] });
  }
  // NOW the near band, laid in front of the wood — it cuts the trees off at their
  // feet the way real ground does, and its own dark mass separates country from reader.
  band(NEAR, '#243437', 863);
  /* AND THE NEAR FIELD, IN FOUR LAYERS. This is the ground the four children stand on, and
     until now it was a filled silhouette — which is why they read as pasted onto a dark mat.
     Same sward as `gift`, deepest and largest-marked because it is nearest, with the hollows
     surviving because every layer after the first is rejected in them. */
  strokes(out, counter, {                                   // 1 · the lie of the land
    rng, n: 1600,
    sample: rej(-10, earthY - 40, 810, H + 6, (x, y) => y > NEAR(x) - 1),
    dir: (x, y) => { const [vx, vy] = curlV(x, y, 140, 60); return Math.atan2(vy * 0.8 - 0.1, Math.abs(vx) + 0.7); },
    col: (x, y, r) => groundCol(x, y, r, 0, 0.24),
    len: (x, y) => 13 * dS(y), lw: (x, y) => 3.6 * dS(y), steps: 3, lenJ: 0.5, impasto: 0.45, relief: 0.35,
  });
  strokes(out, counter, {                                   // 2 · the body of the sward
    rng, n: 3800,
    sample: rej(-10, earthY - 40, 810, H + 6, (x, y) => y > NEAR(x) - 1 && clump(x, y) > 0.4),
    dir: (x, y) => -Math.PI / 2 + (fbm(x / 30, y / 20, 97) - 0.5) * 0.7,
    col: (x, y, r) => groundCol(x, y, r, 0.05, 0.24),
    len: (x, y) => 8 * dS(y), lw: (x, y) => 1.9 * dS(y), steps: 2, lenJ: 0.7, impasto: 0.5, relief: 0.3,
  });
  strokes(out, counter, {                                   // 3 · blades standing out of it
    rng, n: 2600,
    sample: rej(-10, earthY - 30, 810, H + 6, (x, y) => y > NEAR(x) + 3 && clump(x, y) > 0.46),
    dir: (x, y) => -Math.PI / 2 + (fbm(x / 11, y / 9, 101) - 0.5) * 1.15,
    col: (x, y, r) => groundCol(x, y, r, 0.17, 0.24),
    len: (x, y) => 10 * dS(y), lw: (x, y) => 1.1 * dS(y), steps: 2, lenJ: 0.8, impasto: 0.6,
  });
  strokes(out, counter, {                                   // 4 · the finest nap, close to us
    rng, n: 2000,
    sample: r => { const x = -10 + r() * 820, y = earthY - 6 + Math.pow(r(), 0.8) * (H + 6 - earthY + 6);
                   return (y > NEAR(x) + 2 && clump(x, y) > 0.5) ? [x, y] : null; },
    dir: (x, y) => -Math.PI / 2 + (fbm(x / 7, y / 6, 103) - 0.5) * 1.5,
    col: (x, y, r) => groundCol(x, y, r, 0.22, 0.24),
    len: (x, y) => 7 * dS(y), lw: (x, y) => 0.85 * dS(y), steps: 2, lenJ: 0.85, impasto: 0.7,
  });
  for (let i = 0; i < 110; i++) {                           // and clumps, because grass grows in tufts
    const tx = -10 + rng() * 820;
    const ty = earthY - 8 + Math.pow(rng(), 0.55) * (H + 4 - earthY + 8);
    if (ty < NEAR(tx) + 2) continue;
    const sc = dS(ty);
    strokes(out, counter, {
      rng, n: 14,
      sample: r => [tx + (r() + r() - 1) * 9 * sc, ty - Math.pow(r(), 0.7) * 12 * sc],
      dir: (x, y) => -Math.PI / 2 + (x - tx) * 0.05 + (fbm(x / 6, y / 6, 107) - 0.5) * 0.8,
      col: (x, y, r) => groundCol(x, y, r, 0.26, 0.24),
      len: 11 * sc, lw: 1.1 * sc, steps: 2, lenJ: 0.7, impasto: 0.65,
    });
  }
  /* ⭐ AND SOMETHING FOR THE LIGHT TO CATCH. A dark foreground is right — it is what buys the
     glory its brightness — but a dark foreground with nothing shining in it is a hole, and
     the eye skips over it to the sky and never comes back. Every good nocturne and every good
     dawn has SPARKS in its shadow: heads of flowers and seed catching the one light there is.
     They also do the composition a service, because a scatter of small bright points across
     the near field is a path the eye can walk INTO the picture. Colonies, not sprinkles — and
     the nearer the strike the hotter they burn. */
  {
    const fRng = mulberry32(seed ^ 0x71a3);
    for (let c = 0; c < 30; c++) {
      const cx0 = -14 + fRng() * 828;
      const cy0 = earthY - 34 + Math.pow(fRng(), 0.8) * (H + 8 - earthY + 34);
      const spread = 22 + fRng() * 56, count = 4 + ((fRng() * 9) | 0);
      for (let i = 0; i < count; i++) {
        const fx = cx0 + (fRng() + fRng() - 1) * spread;
        const fy = cy0 + (fRng() + fRng() - 1) * spread * 0.42;
        if (fy < NEAR(fx) + 4) continue;
        const sc = dS(fy), st = (9 + fRng() * 11) * sc;
        const lit = Math.max(gLand(fx, fy), Math.max(skyLit(fx, fy) * 0.42, beamAt(fx, fy) * 0.9));
        paintPath(out, counter, fRng, [[fx, fy], [fx + (fRng() - 0.5) * 5, fy - st]],
          (x, y, r) => jig(mix('#26402b', '#4a6b3a', r() * 0.7), r, 6),
          { lw: 1.1 * sc, len: 3, density: 0.9, jitter: 0.3 });
        /* ⚠ AND MOST OF THEM STAY QUIET. Every head at full brightness is popcorn scattered
           over the field — the same "sprinkles" fault the meadows had. Only a few catch the
           light properly; the rest are half-lit, and they are all a size smaller than looks
           right, because a flower head at this distance is a touch, not a dab. */
        const glow = Math.pow(lit, 1.3) * (fRng() < 0.28 ? 0.85 : 0.3 + fRng() * 0.28);
        const head = jig(mix(mix('#6c7a4e', '#c4ad6c', 0.2 + fRng() * 0.45), '#fff2c8', glow), fRng, 8);
        E.daub(out, counter, fx, fy - st, (1.0 + fRng() * 1.2) * sc, head, fRng);
        if (fRng() < 0.3) E.daub(out, counter, fx + (fRng() - 0.5) * 4 * sc, fy - st * (0.72 + fRng() * 0.2),
          (0.8 + fRng() * 0.8) * sc, head, fRng);
      }
    }
    // a few tall seed-heads standing right against the lit distance — silhouette and spark
    for (let i = 0; i < 34; i++) {
      const sx = -14 + fRng() * 828, sy = H + 4 - Math.pow(fRng(), 0.55) * 92;
      const st = 34 + fRng() * 52, lean = (fRng() - 0.5) * 22;
      paintPath(out, counter, fRng, [[sx, sy], [sx + lean * 0.4, sy - st * 0.6], [sx + lean, sy - st]],
        (x, y, r) => jig(mix('#141f1c', '#33472f', r() * 0.6 + Math.max(0, (sy - y) / st) * 0.4), r, 6),
        { lw: 1.5, len: 4, density: 0.95, jitter: 0.35 });
      for (let k = 0; k < 5; k++)
        E.daub(out, counter, sx + lean + (fRng() - 0.5) * 6, sy - st + (fRng() - 0.5) * 9, 1.1 + fRng() * 1.3,
          jig(mix('#5c6a48', '#e8d49a', 0.3 + skyLit(sx, sy) * 0.6), fRng, 8), fRng);
    }
  }

  /* ⭐⭐ AND THE SHAFTS ARE LAID OVER THE FINISHED LAND, not mixed into its colour. Tinting
     `groundCol` did almost nothing visible, and the reason is instructive: five sward passes,
     tufts, flowers and seed-heads all sample that same function at different lifts, so any
     term inside it gets AVERAGED across the lot and comes out as a whisper. A painter does
     not tint a field to put light on it — he lays the light ON TOP, in long strokes running
     the way the light runs, once the field is finished. So: strokes radiating from the rift,
     only where a band actually falls, warm and translucent, with a brighter core down the
     middle of each. This is the same thing the sky is already doing, continued onto the
     ground — the whole picture now points back at the opening. */
  {
    const bRng2 = mulberry32(seed ^ 0x51a7);
    strokes(out, counter, {                                  // the body of each shaft
      rng: bRng2, n: 3400,
      sample: r => {
        const x = -20 + r() * 840;
        const y = MID(x) - 16 + r() * (H + 14 - MID(x) + 16);
        return beamAt(x, y) > 0.26 + r() * 0.42 ? [x, y] : null;
      },
      dir: (x, y) => Math.atan2(y - RIFTY, x - RIFTX),
      col: (x, y, r) => {
        const bm = beamAt(x, y);
        return jig(ramp(['#7a6f4a', '#9c8b52', '#c0a25e', '#dcbc76', '#f0d69c'],
          Math.pow(bm, 1.15) * 0.95 + (r() - 0.5) * 0.22), r, 8);
      },
      len: (x, y) => 22 + (y - MID(x)) * 0.22, lw: 3.2, steps: 3, follow: 0.96,
      lenJ: 0.7, wJ: 0.5, impasto: 0.3, relief: 0.12, op: 0.26,
    });
    strokes(out, counter, {                                  // and the bright core of a few of them
      rng: bRng2, n: 900,
      sample: r => {
        const x = -20 + r() * 840;
        const y = MID(x) - 10 + r() * (H + 14 - MID(x) + 10);
        return beamAt(x, y) > 0.68 + r() * 0.24 ? [x, y] : null;
      },
      dir: (x, y) => Math.atan2(y - RIFTY, x - RIFTX),
      col: (x, y, r) => jig(mix('#e8cc8e', '#fff2cc', r() * 0.7), r, 6),
      len: (x, y) => 26 + (y - MID(x)) * 0.26, lw: 2.0, steps: 3, follow: 0.97,
      lenJ: 0.75, impasto: 0.25, relief: 0, op: 0.22,
    });
  }

  // and the grass of the NEAR skyline — tufts, gaps, never an outline
  horizonFringe(out, counter, rng, {
    horizonFn: NEAR, cols: ['#22362f', '#2f4a3a', '#41624a', '#5c7f5c'],
    hMax: 17, lightFn: gLand, seed: 827, dirJitter: 0.7,
  });

  // THE NEAR TREES — two great ones standing on the front band, tall enough that the
  // frame cuts them. These are what make the far stand read as MILES away rather than
  // as small trees: the eye knows a tree's size, so the ratio between these and those
  // IS the distance. They are darkest, because they are nearest.
  perspectiveAvenue(out, counter, rng, {
    n: 0, lightFn: skyLit, fruit: 0.02,
    blossomCols: ['#6f8a52', '#8aa05e', '#b6a86a'],   // ⚠ leaf-catch, not candy — see fruitTree's note
    // ⚠ nearest = darkest. A tree must be darker than the ground it stands on, or it is a
    // pale bush pasted on a field rather than a mass in front of it.
    leafCols: [['#122c17', '#1c421e', mix(ACCENTS[1], '#1c421e', 0.3)],
               ['#163219', '#234a21', mix(ACCENTS[2], '#234a21', 0.28)]],
    /* ⚠ AND NOT WHERE SOMEBODY IS STANDING. The four children are at x 300 / 392 / 476 / 664
       (CAST1[30] in character.js) and two of these grew straight through them. Moved into the
       gaps between the figures, where a near tree does what it is for: framing them. */
    /* ⚠ NOT A ROW, AND NOT EVENLY SPACED. A GROUP MASS: several trees clustered as one
       dominant unit with real variety of size inside it, holding the west, and one lone
       sentinel far east so the eye has somewhere to travel to. */
    extra: [
      { x: 148, y: NEAR(148) + 30, h: 152, set: 0 },
      { x: 206, y: NEAR(206) + 22, h: 94,  set: 1 },
      { x: 262, y: NEAR(262) + 34, h: 178, set: 0 },
      { x: 326, y: NEAR(326) + 18, h: 66,  set: 1 },
      { x: 764, y: NEAR(764) + 24, h: 118, set: 0 },   // the lone sentinel in the open east
    ],
  });

  /* ⭐⭐ THE REPOUSSOIR — AN OVERHANGING BOUGH, NOT A SAPLING.
     First attempt at this was a very tall `paintTree` at the left edge, and it came out as a
     stick with a bush on top: `paintTree` centres its crown over its trunk, so a tall one
     gives you a long bare pole and a small ball, which frames nothing.
     The device the old masters actually use — Claude, Corot, and every Barbizon canvas — is a
     BOUGH REACHING IN FROM ABOVE: a dark limb entering at one top corner with its foliage
     hanging into the picture. It does three things at once that nothing else does. It puts a
     near plane in front of the sky, so the distance is measured against something. It brackets
     the composition on the west and turns the eye back in, toward the torn heaven in the east.
     And being the nearest thing on the plate it is the darkest, which is what buys the glory
     its brightness — bright only reads against dark.
     It is drawn almost in silhouette. Only the undersides that face the rift catch anything,
     and what they catch is a thin warm rim: this is a mass BETWEEN us and the light. */
  {
    const bRng = mulberry32(seed ^ 0x8014);
    const LIMB = [[-52, 8], [48, 44], [140, 86], [214, 138], [262, 196]];
    /* ⚠⚠ A SILHOUETTE MUST BE OPAQUE FIRST. The first cut of this bough came back as a bare
       dead branch with speckle round it: every leaf mark on this plate paints at 58% opacity
       (STROKE_STYLE), so a dark cluster laid straight onto a blazing sky lets the blaze up
       between every stroke and never becomes a MASS. The same lesson the ground taught —
       whatever the marks fail to cover IS the picture there. So each cluster is built as a
       lumpy opaque body of dark first, and the leaves are painted onto that. */
    /* ⚠⚠ AND THE OPAQUE BODY MUST STAY IN THE MIDDLE. Filling each cluster with big round
       dabs to its full radius gave a bunch of dark BALLOONS — a silhouette against a bright
       sky is read at its EDGE, and a leafy edge is feathery and broken, with sky coming
       through between the leaves. So the opaque core is small and central and the outer half
       of every cluster is leaf-marks only.
       ⚠ And it cannot be near-black: the live filter has a blue-violet shadow floor, so an
       almost-black green comes up on the page as PURPLE. Dark, but a real green. */
    const cluster = (cx0, cy0, rr, squash) => {
      for (let i = 0; i < 9; i++) {                                   // a small opaque core, lumpy, never an ellipse
        const a2 = bRng() * Math.PI * 2, d = Math.pow(bRng(), 0.75);
        E.daub(out, counter, cx0 + Math.cos(a2) * rr * d * 0.44, cy0 + Math.sin(a2) * rr * d * 0.38 * squash,
          rr * (0.20 + bRng() * 0.16), jig(mix('#16301f', '#22412a', bRng() * 0.7), bRng, 5), bRng);
      }
      strokes(out, counter, {                                         // and the leaves, on top of it
        rng: bRng, n: Math.min(2400, Math.round(rr * rr * 3.0)),
        sample: r => { const a2 = r() * Math.PI * 2, d = Math.pow(r(), 0.5);
                       return [cx0 + Math.cos(a2) * rr * d * 1.1, cy0 + Math.sin(a2) * rr * d * 0.92 * squash]; },
        dir: (x, y) => Math.atan2(y - cy0, x - cx0) + Math.PI / 2 + (bRng() - 0.5) * 0.9,
        col: (x, y, r) => {
          // only the undersides that face the tearing heaven catch anything, and only a rim:
          // this is a mass BETWEEN us and the light.
          const toward = Math.max(0, Math.min(1, 1 - Math.hypot(x - RIFTX, y - RIFTY) / 700));
          const up = Math.max(0, Math.min(1, (cy0 - y) / (rr * 0.9) * 0.5 + 0.5));
          let c = ramp(['#12241a', '#1a3322', '#24462a', '#2f5c34', '#3d7440', '#4f8c4c'],
            up * 0.56 + fbm(x / 12, y / 10, 733) * 0.42 + (r() - 0.5) * 0.2);
          c = mix(c, '#d8b268', Math.pow(toward, 1.6) * 0.44 * (0.3 + r() * 0.7));
          if (r() < 0.05) c = mix(c, '#f4e2b4', 0.66);                // chinks of sky through the leaves
          return jig(c, r, 7);
        },
        len: 3.4, lw: 1.8, steps: 2, lenJ: 0.85, impasto: 0.62, relief: 0.4,
      });
    };
    // the limb — mostly buried in its own foliage, thick where it leaves the frame
    for (let i = 0; i < LIMB.length - 1; i++) {
      const u = i / (LIMB.length - 1);
      paintPath(out, counter, bRng, [LIMB[i], LIMB[i + 1]],
        (x, y, r) => jig(mix('#0e0c09', '#3a2c1c', r() * 0.55 + Math.max(0, 1 - Math.hypot(x - RIFTX, y - RIFTY) / 700) * 0.28), r, 6),
        { lw: 15 - 10 * u, len: 7, density: 0.95, jitter: 0.45 });
    }
    /* ⚠ AND THE CLUMPS MUST OVERLAP INTO ONE MASS. Seven of them spaced along the limb read
       as bunches of grapes hanging off a bare stick — the same "a tree alone in its own gap
       is a shrub on a lawn" fault, at branch scale. Foliage is CONTINUOUS: the clumps run
       into each other, the limb disappears inside its own leaves except where it leaves the
       frame, and only the outermost tips break away as separate sprays. */
    // the mass gathered at the corner the bough comes from — this is what does the framing
    cluster(-40, 18, 100, 1.0); cluster(22, 56, 74, 0.95); cluster(-24, 118, 78, 1.0);
    cluster(58, 8, 58, 0.9);    cluster(40, 140, 54, 0.95); cluster(-30, 190, 52, 1.0);
    cluster(92, 60, 52, 0.92);  cluster(6, -18, 66, 0.9);
    // and clumps riding the limb as it reaches in, thinning as they go
    for (let i = 0; i < 13; i++) {
      const t = 0.10 + (i / 12) * 0.88 + (bRng() - 0.5) * 0.035;
      const k = Math.min(LIMB.length - 2, Math.floor(t * (LIMB.length - 1)));
      const f = t * (LIMB.length - 1) - k;
      const ax = LIMB[k][0] + (LIMB[k + 1][0] - LIMB[k][0]) * f;
      const ay = LIMB[k][1] + (LIMB[k + 1][1] - LIMB[k][1]) * f;
      const drop = 8 + bRng() * 30, side = (bRng() - 0.5) * 46;
      paintPath(out, counter, bRng, [[ax, ay], [ax + side * 0.5, ay + drop * 0.6], [ax + side, ay + drop]],
        (x, y, r) => jig(mix('#0d0b09', '#31261a', r() * 0.6), r, 6),
        { lw: 3.6 - 1.8 * bRng(), len: 5, density: 0.9, jitter: 0.5 });
      cluster(ax + side, ay + drop + 6, (50 - i * 2.6) * (0.82 + bRng() * 0.45), 0.9);
    }
  }

  /* ⭐⭐ THE CAST SHADOWS — and this is the thing the page was really missing. A field can be
     painted with thirteen thousand marks and still read as a textured mat, because texture is
     not a PLANE. What makes ground read as ground receding under a light is the shadows lying
     ON it: they belong to the surface, they follow its rise and fall, and they all point the
     same way, which is the eye's proof that one real light is shining on one real place.
     The heavens are torn open at (RIFTX, RIFTY), high and east. So every shadow on this
     earth rakes AWAY from that axis and TOWARD the reader — short and nearly under things at
     the strike, long and sweeping at the western edge. Drawn as daubs that thin and lift as
     they run out, never a soft gradient (a gradient is a different medium and shows as one).
     "Then shall appear the sign of the Son of man in heaven" — the whole field points at it. */
  {
    const kRng = mulberry32(seed ^ 0x5ade);
    // one raking shadow for a thing of width w standing at (ox, oy)
    /* ⚠⚠ SOFTNESS IS A DENSITY FALLOFF, NOT A BLUR. Fred: "make the shadows softer." The first
       cut laid thirty to a hundred fat opaque `daub`s per object and they read as blotches —
       and `daub` takes no opacity argument, so there was no dial to turn down. A soft shadow
       in paint is made the way it is made on a real canvas: MANY SMALL marks, each barely
       darker than the ground, packed at the foot and thinning as they run out, with a wide
       faint penumbra around a tighter core. Three passes at falling strength and rising
       spread do it, and `strokes({op})` gives the transparency `daub` cannot. A blurred
       ellipse would be a different medium and would show as one. */
    const rake = (ox, oy, w, mass) => {
      const dx = ox - RIFTX;
      const run = (24 + Math.abs(dx) * 0.20) * mass;          // long in the west, short at the axis
      const ux = dx >= 0 ? 1 : -1, spread = 0.34 + Math.abs(dx) / 1400;
      const ang = Math.atan2(spread, ux);
      for (const [reach, opa, wid, dens] of [[0.92, 0.30, 0.95, 1], [1.22, 0.19, 1.4, 0.8], [1.62, 0.10, 2.0, 0.55]]) {
        strokes(out, counter, {
          rng: kRng, n: Math.round((44 + 132 * mass) * dens),
          sample: r => {
            const t = Math.pow(r(), 0.72);                    // dense at the foot, thinning out
            const px = ox + ux * t * run * reach + (r() - 0.5) * w * wid * (1 - t * 0.35);
            const py = oy + t * run * reach * spread + (r() - 0.5) * w * 0.5 * wid;
            if (py < NEAR(px) - 2) return null;               // a shadow lies on the ground, not above it
            return (r() < 1 - t * 0.55) ? [px, py] : null;    // and it fades by THINNING, not by greying
          },
          dir: (x, y) => ang + (fbm(x / 26, y / 14, 761) - 0.5) * 0.7,
          col: (x, y, r) => jig(mix('#31463b', '#1c2b24', 0.2 + r() * 0.65), r, 6),
          len: (5 + 7 * mass) * (0.8 + reach * 0.4), lw: 1.5 + 1.9 * mass,
          steps: 2, lenJ: 0.9, impasto: 0.25, relief: 0.15, op: opa,
        });
      }
    };
    // the near trees and the great western mass throw the long ones
    for (const [tx, th] of [[148, 152], [206, 94], [262, 178], [326, 66], [764, 118]])
      rake(tx, NEAR(tx) + 26, th * 0.16, Math.min(1.5, th / 150));
    // and so does every tree of the wood, faintly, which is what knits the far country to the near
    for (const cxx of [24, 78, 128, 174, 226, 288, 358, 452, 604])
      rake(cxx + (kRng() - 0.5) * 40, MID(cxx) + 8, 9, 0.28);
    // the four children (positions are the actors' own (x, y) in CAST1[30])
    for (const [ax, ay, ah] of [[302, 512, 190], [452, 462, 112], [556, 436, 78], [690, 470, 126]])
      rake(ax, ay, ah * 0.20, Math.min(1.25, ah / 170));
  }

  /* ⚠ CONTACT SHADOWS. The four children are cast cells composited over the finished plate,
     so they cast nothing of their own and float over the field however well they are placed.
     A pool of dark grass baked at each one's feet sets them ON it. The light is the torn
     heaven up and to the right (RIFTX 560, RIFTY 66), so every shadow here falls DOWN-LEFT,
     short under the ones nearest the landing point and longer out at the edges. Positions are
     the actors' own (x, y) in CAST1[30]. */
  {
    const sRng = mulberry32(seed ^ 0x5ade);
    for (const [ax, ay, aw] of [[302, 512, 40], [452, 462, 24], [556, 436, 17], [690, 470, 27]]) {
      // ⚠ AND SOFT HERE TOO, by the same means. The pool where a figure meets the ground is
      // the darkest note it casts, but it still has no edge: dense right under the feet and
      // gone within half a body-width.
      for (const [reach, opa, dens] of [[0.85, 0.34, 1], [1.3, 0.19, 0.75], [1.85, 0.09, 0.5]]) {
        strokes(out, counter, {
          rng: sRng, n: Math.round(56 * dens),
          sample: r => {
            const t = Math.pow(r(), 0.7);
            const px = ax - 4 - t * aw * reach + (r() - 0.5) * aw * 0.85 * reach;
            const py = ay + 2 + t * 7 * reach + (r() - 0.5) * 5.5 * reach;
            return (r() < 1 - t * 0.5) ? [px, py] : null;
          },
          dir: (x, y) => 0.16 + (fbm(x / 18, y / 9, 769) - 0.5) * 0.8,
          col: (x, y, r) => jig(mix('#243a34', '#111e1c', 0.25 + r() * 0.6), r, 6),
          len: 4.6 * reach, lw: 1.7, steps: 2, lenJ: 0.9, impasto: 0.25, relief: 0.15, op: opa,
        });
      }
    }
  }

  // THE FOREGROUND FRAME — tall grasses standing black across the bottom edge,
  // nearer than everything else and darker than everything else. This is the
  // device the reference photographs use (reeds at a lake, scrub on a dune): you
  // are looking THROUGH something into the distance, and the eye reads the gap
  // between near-black and far-violet as MILES. Without it the land is a picture
  // on a wall; with it the land is a place you are standing in.
  strokes(out, counter, {
    rng, n: 240,          // ⚠ trimmed from 520: there is a painted field behind it now, and at
    sample: r => {        //   the old count the frame WAS the foreground rather than framing it
      const x = -14 + r() * 828;
      const up = Math.pow(r(), 0.55) * 52;               // most short, a few tall
      return [x, H + 6 - up];
    },
    dir: (x, y) => -Math.PI / 2 + (fbm(x / 11, y / 30, 869) - 0.5) * 0.85,
    col: (x, y, r) => jig(ramp(['#0d151b', '#131c24', '#1b2530'], fbm(x / 26, y / 26, 873)), r, 5),
    len: (x, y) => 20 + (H - y) * 0.42, lw: 2.5, steps: 3, follow: 0.95, lenJ: 0.55, impasto: 0.3,
  });
  // a few seed-heads catching the coming light, so the frame is not a dead mass
  for (let i = 0; i < 26; i++) {
    const gx = -10 + rng() * 820, gy = H + 2 - Math.pow(rng(), 0.5) * 66;
    daub(out, counter, gx, gy, 1.1 + rng() * 1.5,
      jig(mix('#2a2142', '#8a76b8', 0.3 + gLand(gx, gy) * 0.5), rng, 8), rng);
  }

  /* ---------------- THE WHOLE EARTH, WATCHING ----------------
     ⚠ FIVE PAINTED PILGRIMS USED TO STAND HERE, at h 30-32, alongside the four cast children
     — the same character at two different scales on one page. Fred, on exactly this: "comes
     have angels that are the kid. it is weird." They are gone.
     What the page does need is SCALE, and the verse gives it: "Behold, he cometh with clouds;
     and EVERY EYE shall see him" (Rev 1:7). So the far country is populated with people too
     small to be anybody — a few dark upright marks with their arms lifted, out on the open
     eastern land where the glory falls. At eight to fifteen units they read as a distant
     crowd and never as a copy of the child; and a figure whose size you know, standing far
     off, is the thing that tells the eye how big this country is. */
  {
    const pRng = mulberry32(seed ^ 0x3ee1);
    for (let i = 0; i < 46; i++) {
      // out on the open east, where the wood has thinned and the light lands
      const px = 340 + Math.pow(pRng(), 0.72) * 470;
      const py = MID(px) + 6 + Math.pow(pRng(), 1.3) * 42;
      const ph = 7 + Math.pow(pRng(), 1.6) * 9;
      const lit = gLand(px, py);
      const body = jig(mix('#141d26', '#3a3a4e', 0.2 + pRng() * 0.4), pRng, 5);
      const rim  = jig(mix(body, '#f2d089', 0.34 + lit * 0.5), pRng, 6);
      // the standing body, a single upright mark
      paintPath(out, counter, pRng, [[px, py], [px + (pRng() - 0.5) * 1.6, py - ph * 0.66]],
        (x, y, r) => (x > px ? rim : body), { lw: ph * 0.30, len: 2.2, density: 1, jitter: 0.2 });
      // and the arms, lifted toward the tearing heaven
      const reach = ph * 0.44;
      for (const sd of [-1, 1])
        paintPath(out, counter, pRng,
          [[px, py - ph * 0.6], [px + sd * reach * 0.8, py - ph * 1.02]],
          (x, y, r) => (sd > 0 ? rim : body), { lw: ph * 0.16, len: 1.8, density: 1, jitter: 0.25 });
      E.daub(out, counter, px, py - ph * 0.82, ph * 0.17, rim, pRng);   // the lifted face, catching it
    }
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
