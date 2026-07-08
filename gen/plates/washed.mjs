// gen/plates/washed.mjs — "Washed white" (Isaiah 1:18 + Revelation 7:14)
//
// A bright fall of radiant light-water pours straight down from above onto the
// recurring RED child. Where it falls, the old scarlet stain RINSES AWAY —
// dissolving downward into the bright stream — while a clean RADIANT WHITE robe
// of light forms over the child from the top down. Above is pure white-gold
// light; below the scarlet washes out into the running water. Joyful relief.
//
//   "Though your sins be as scarlet, they shall be as white as snow." — Isaiah 1:18
//   "...made them white in the blood of the Lamb."                    — Revelation 7:14
//
// No black — the shadow is deep blue. The change from scarlet → white IS the
// subject.
export const name = 'washed';
export const title = 'Washed white';
export const caption = 'Your stains washed white as snow.';
export const seed = 70718243;
export const focal = { x: 400, y: 270 };
// MOBILE 3D — two depth planes: the deep blue-violet surround + the white-gold
// cascade behind (opaque BACKGROUND), and the red child being washed — robe,
// rinsing scarlet, foot-pool and rim — closest (FOREGROUND). The fall pours
// down behind the child; the child parallaxes against it.
export const layers = [
  { name: 'bg', opaque: true },   // surround + falling cascade (backmost, opaque)
  { name: 'fg' },                 // the child being washed (robe, rinse, pool, rim)
];

export function paint(E, opts = {}) {
  const {
    mulberry32, fbm, curlV, mix, ramp, jig, strokes, rej, paintPath, paintChild, castShadow, personCaps,
    lightRadial, svgWrap, R1, W, H, CHILD_RED,
    GOLD, GOLD_PALE, GOLD_DEEP, GOLD_HOT,
  } = E;

  const rng = mulberry32(seed);
  const out = [];
  const counter = { n: 0 };
  // MOBILE 3D LAYERS: BG = surround + cascade (opaque); FG = the child + wash.
  const LAYER = opts.layer || 'full';
  const fgRanges = [];
  out.push(`<rect width="${W}" height="${H}" fill="#0f1230"/>`);   // deeper night-violet base — chiaroscuro, never black

  // the source of the fall — a bright opening high above, pouring straight down
  const SX = 400;                       // the stream's centre x
  const SRC = { x: SX, y: -40 };        // the source, off the top
  const src = lightRadial(SRC.x, SRC.y, 320);
  // a BOLD, brilliant cascade: a strong column of light close to the axis,
  // white-hot at the top, riding all the way down onto the child and pooling at
  // the feet. Slightly fanning so it reads as a falling sheet of water-light.
  const HW = (y) => 78 + (y + 40) * 0.14;                    // the cascade's half-width, fanning slightly
  const fall = (x, y) => {
    const band = Math.exp(-Math.pow((x - SX) / HW(y), 2) * 1.0);  // hard, glowing column
    const down = Math.max(0, Math.min(1, 1 - (y + 40) / 640));
    return Math.min(1, src(x, y) * 0.72 + band * (0.5 + 0.55 * down));
  };

  /* ---------------- 1. THE SURROUND — DEEP at the edges so the cascade GLOWS ----------------
     high contrast: a brilliant white-gold core down the centre, falling off to
     DEEP blue / violet at the left, right and bottom corners. NOT a flat pale
     field — the dark surround is what makes the light read as light. */
  out.push(`<defs><radialGradient id="washcore" cx="0.5" cy="0.1" r="1.0">
<stop offset="0" stop-color="#fffaf0"/>
<stop offset="0.18" stop-color="#fbeec2"/>
<stop offset="0.40" stop-color="#8fa8e0"/>
<stop offset="0.64" stop-color="#33408a"/>
<stop offset="0.86" stop-color="#1a1c48"/>
<stop offset="1" stop-color="#0e1030"/>
</radialGradient></defs>`);
  out.push(`<rect x="-12" y="-12" width="${W + 24}" height="${H + 24}" fill="url(#washcore)"/>`);
  counter.n += 1;

  // broad surround masses — deep curling blue/violet at the edges, lifting toward
  // the bright core, so every gap is either glowing or deep (never flat pale).
  const skyDir = (x, y) => {
    let vx = 0, vy = 30;                 // base streams DOWN (the fall)
    const dx = x - SRC.x, dy = y - SRC.y, d = Math.hypot(dx, dy) + 1e-6;
    vx += (dx / d) * 6; vy += (dy / d) * 16;   // radiate out of the source, pour down
    const [c, e] = curlV(x, y, 26, 150); vx += c * 40; vy += e * 40;
    return Math.atan2(vy, vx);
  };
  const skyCol = (x, y, r) => {
    const g = fall(x, y);
    // DEEP blue/violet in the cold surround → white-gold in the cascade core
    let c = ramp(['#101038', '#1c2050', '#2e3a82', '#5468b4', '#9fb6e6', '#fbeec2', '#fffaf0'],
                 Math.min(1, g * 1.18));
    // complementary violet flicker right where the light dies — the living edge
    if (g > 0.14 && g < 0.30 && r() < 0.06) c = mix(c, '#6a3aa0', 0.5);
    return jig(c, r, 6);
  };
  // DENSE long downward-raking strokes — they KNIT into a continuous deep field
  // that streams toward the light, not sparse floating tiles. Long + narrow +
  // high count + low jitter against their own gradient = a woven surround.
  strokes(out, counter, {
    rng, n: 2100, sample: rej(-14, -14, 814, 514),
    dir: skyDir, col: skyCol, len: 48, lw: 4.8, steps: 5, follow: 0.9,
    wild: 0.04, lenJ: 0.5, relief: 0.5,
  });

  /* ---------------- 2. THE FALLING CASCADE — a DENSE white-gold waterfall ----------------
     a thick, near-vertical sheet of brilliant light pouring from the source onto
     the child: long curling filaments, packed close, white-hot at the top
     warming to pale gold below. This is the body of the cascade — bold and dense. */
  strokes(out, counter, {
    rng, n: 1180,
    sample: rej(SX - 140, -12, SX + 140, 500, (x, y) => Math.abs(x - SX) < HW(y) * 0.96),
    dir: (x, y) => {
      const dx = (x - SX) * 0.045;       // gently fan outward as it descends
      return Math.atan2(22, dx) + (fbm(x / 36, y / 64, 17) - 0.5) * 0.55;
    },
    col: (x, y, r) => {
      const core = Math.exp(-Math.pow((x - SX) / (HW(y) * 0.55), 2));   // brightest on the spine
      let c = mix('#ffffff', GOLD_HOT, 0.45);                           // radiant white-gold base
      c = mix(c, '#ffffff', core * 0.7);                               // white-hot down the spine
      c = mix(c, GOLD_DEEP, (1 - core) * 0.38 + (y / H) * 0.22);         // deeper amber at edges/bottom — body, not cream
      return jig(c, r, 6);
    },
    len: (x, y) => 36 + (1 - y / H) * 24, lw: 2.8, steps: 6, follow: 0.95,
    wild: 0.05, lenJ: 0.6, relief: 0,
  });
  // BOLD thick light-falls for body — the cascade's loaded strokes, packed close
  strokes(out, counter, {
    rng, n: 180,
    sample: rej(SX - 92, -12, SX + 92, 480, (x, y) => Math.abs(x - SX) < HW(y) * 0.62),
    dir: (x, y) => Math.atan2(24, (x - SX) * 0.03) + (fbm(x / 50, y / 90, 19) - 0.5) * 0.32,
    col: (x, y, r) => jig(mix('#ffffff', GOLD_HOT, 0.35), r, 4),
    len: 54, lw: 7.5, steps: 5, follow: 0.96, lenJ: 0.5, impasto: 0.5,
  });
  // a bright halo at the SOURCE — the opening overhead the light pours through
  strokes(out, counter, {
    rng, n: 160,
    sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 0.6) * 110; return [SX + Math.cos(a) * d, -10 + Math.sin(a) * d * 0.7]; },
    dir: (x, y) => Math.atan2(y + 40, x - SX),
    col: (x, y, r) => jig(mix('#ffffff', GOLD_HOT, 0.3), r, 5),
    len: 20, lw: 5, steps: 2, lenJ: 0.5, impasto: 0.5, relief: 0,
  });
  /* ---------------- LIFE: TWO WHITE DOVES — the purity sign (Isa 1:18; Matt 3:16) ----------------
     two clean white doves flying in toward the fall, one from each side. The
     surround here is mid-blue, so each dove gets a small DEEP blue-violet pocket
     knitted in behind it (chiaroscuro) — white wings only read against dark. */
  const dove = (dx0, dy0, d, s) => {
    // the dark pocket — a soft deep cloud woven with the surround's own flow
    strokes(out, counter, {
      rng, n: 110,
      sample: r => [dx0 + (r() + r() - 1) * 40 * s, dy0 - 4 * s + (r() + r() - 1) * 26 * s],
      dir: skyDir,
      col: (x, y, r) => jig(mix('#12153e', '#242b5c', fbm(x / 30, y / 30, 47)), r, 4),
      len: 20, lw: 3.6, steps: 3, follow: 0.9, lenJ: 0.5, relief: 0,
    });
    // the dove — BOLD simple silhouette, wings raised in a wide V (living = curved)
    const wc = (x, y, r) => jig(mix('#ffffff', '#fff4dc', 0.2 + r() * 0.2), r, 3);        // warm white
    paintPath(out, counter, rng,   // body: tail → breast → head, gently up-curved, LOADED
      [[dx0 - 11 * s * d, dy0 + 3 * s], [dx0 - 2 * s * d, dy0 + 1.4 * s], [dx0 + 7 * s * d, dy0 - 1.4 * s], [dx0 + 11 * s * d, dy0 - 2 * s]],
      wc, { lw: 4.6 * s, len: 3.4, density: 1, jitter: 0.3 });
    paintPath(out, counter, rng,   // the head — a round white mass at the front
      [[dx0 + 9 * s * d, dy0 - 2.4 * s], [dx0 + 12 * s * d, dy0 - 2.2 * s]],
      wc, { lw: 3.8 * s, len: 2.2, density: 1, jitter: 0.25 });
    paintPath(out, counter, rng,   // front wing — raised, sweeping up and BACK
      [[dx0 + 1 * s * d, dy0 - 0.5 * s], [dx0 - 3.5 * s * d, dy0 - 8.5 * s], [dx0 - 10 * s * d, dy0 - 15 * s]],
      wc, { lw: 3.6 * s, len: 3.2, density: 1, jitter: 0.3 });
    paintPath(out, counter, rng,   // rear wing — raised near-vertical, a WIDE V with the front
      [[dx0 + 5.5 * s * d, dy0 - 1.5 * s], [dx0 + 4 * s * d, dy0 - 8.5 * s], [dx0 + 1 * s * d, dy0 - 14 * s]],
      wc, { lw: 3.0 * s, len: 3, density: 1, jitter: 0.3 });
    paintPath(out, counter, rng,   // tail — a small fan
      [[dx0 - 10.5 * s * d, dy0 + 2.8 * s], [dx0 - 16.5 * s * d, dy0 + 6 * s]], wc, { lw: 2.6 * s, len: 2.6, density: 1, jitter: 0.3 });
    paintPath(out, counter, rng,
      [[dx0 - 10.5 * s * d, dy0 + 2.8 * s], [dx0 - 17.5 * s * d, dy0 + 3.2 * s]], wc, { lw: 2.2 * s, len: 2.6, density: 1, jitter: 0.3 });
    paintPath(out, counter, rng,   // the one accent: a tiny gold beak toward the light
      [[dx0 + 12.5 * s * d, dy0 - 2.2 * s], [dx0 + 15.5 * s * d, dy0 - 1.4 * s]],
      (x, y, r) => jig(GOLD_HOT, r, 3), { lw: 1.6 * s, len: 1.8, density: 1, jitter: 0.2 });
  };
  dove(276, 185, +1, 1.0);    // left dove, flying in toward the fall
  dove(538, 252, -1, 0.85);   // right dove, a little smaller (deeper), flying in

  const bgEnd = out.length;   // BG plane: the deep surround + the white-gold cascade (opaque)

  /* ---------------- 3. THE CHILD — "you", standing under the fall ----------------
     a small figure standing, arms a little open in relief, face turned up into
     the light. Built from CHILD_RED capsules. */
  const cx = SX, feet = 392, headY = 244;
  const _fg = out.length;   // FG plane opens: the child and everything washing it
  const caps = personCaps(cx, headY, feet - headY, {
    leftHand: [cx - 42, headY + 104], rightHand: [cx + 42, headY + 104],   // arms open at the sides, palms out — relief, receiving
    leftFoot: [cx - 10, feet], rightFoot: [cx + 10, feet],                  // standing under the fall
  });
  // a broad radiant white-gold GLOW behind the figure — the washed child is lit
  // from within and haloed; this glow reads against the deep surround. (Drawn
  // before the child so the child sits crisply on top of its own radiance.)
  strokes(out, counter, {
    rng, n: 360,
    sample: r => {
      const a = r() * Math.PI * 2, d = (40 + Math.pow(r(), 0.5) * 90);   // a RING outside the body — halo, not flood
      return [cx + Math.cos(a) * d * 0.78, (headY + feet) / 2 + Math.sin(a) * d];
    },
    dir: (x, y) => Math.atan2(y - (headY + feet) / 2, x - cx),
    col: (x, y, r) => {
      const d = Math.hypot((x - cx) / 0.78, y - (headY + feet) / 2) / 130;
      return jig(mix('#fffdf4', GOLD_PALE, Math.min(1, d) * 0.6), r, 5);
    },
    len: 16, lw: 4.4, steps: 2, lenJ: 0.5, impasto: 0.4, relief: 0,
  });
  // the washed child — RADIANT, with the soft white halo behind the silhouette.
  // A slightly heavier dark contour so the figure stays legible inside all the light.
  castShadow(out, counter, caps, { dir: 0.08 });
  paintChild(out, counter, rng, caps, { seed: 91, whiteAura: 13, outlineW: 4.5 });

  /* ---------------- 4. THE WHITE ROBE OF LIGHT — forms over the child, top-down ----------------
     where the fall touches, a clean radiant WHITE robe of light overtakes the
     red — densest at the head/shoulders (washed first), thinning toward the feet
     (still being rinsed). This is the scarlet → white change, on the body. */
  const robeTop = headY + 26;   // robe starts at the shoulders — the HEAD/face stays clear
  strokes(out, counter, {
    rng, n: 320,
    sample: rej(cx - 32, robeTop - 4, cx + 32, feet - 4, (x, y) => {
      // only over the figure's mass below the neck, and weighted to the TOP
      const onBody = caps.some(c => E.inCap(x, y, c));
      if (!onBody || y < robeTop) return false;
      const fromTop = 1 - (y - robeTop) / (feet - 6 - robeTop);  // 1 at shoulders → 0 at feet
      // white floods the shoulders/upper torso as a luminous ROBE (the body stays
      // present, a clothed form), thinning toward the legs so the SCARLET reads below
      return rng() < 0.16 + Math.pow(Math.max(0, fromTop), 1.8) * 0.7;
    }),
    dir: (x, y) => Math.PI / 2 + (fbm(x / 14, y / 18, 23) - 0.5) * 0.7,    // flows downward over the form
    col: (x, y, r) => {
      const fromTop = 1 - (y - robeTop) / (feet - 6 - robeTop);
      // pure white at the shoulders, warming to white-gold lower (the front of the wash)
      let c = mix('#ffffff', GOLD_PALE, (1 - fromTop) * 0.5);
      return jig(c, r, 5);
    },
    len: (x, y) => 7 + (1 - (y - headY) / (feet - headY)) * 7, lw: 3.0, steps: 2,
    lenJ: 0.5, impasto: 0.5,
  });
  // a bright SCARLET still clinging to the lower body — the stain not yet fully
  // washed; it reads against the white above and rinses out below the feet.
  strokes(out, counter, {
    rng, n: 150,
    sample: rej(cx - 22, headY + 70, cx + 22, feet - 2, (x, y) => caps.some(c => E.inCap(x, y, c))),
    dir: (x, y) => Math.PI / 2 + (fbm(x / 12, y / 16, 29) - 0.5) * 0.5,
    col: (x, y, r) => {
      const fromTop = (y - (headY + 70)) / (feet - 2 - (headY + 70));   // 0 upper → 1 at feet
      let c = ramp([CHILD_RED[0], '#d23425', '#e8463a'], fbm(x / 12, y / 12, 33) * 0.6);
      c = mix(c, '#ffffff', (1 - fromTop) * 0.35);   // paling toward the white above
      return jig(c, r, 7);
    },
    len: 7, lw: 2.6, steps: 2, lenJ: 0.5, relief: 0,
  });

  /* ---------------- 5. THE SCARLET STAIN, RINSING AWAY DOWNWARD ----------------
     below the child, the old scarlet runs OUT of the robe and dissolves into the
     bright stream — red threads thinning, paling, lost in the white water as
     they fall. The stain leaves; it does not stay. (Isa 1:18) */
  strokes(out, counter, {
    rng, n: 620,
    sample: rej(cx - 58, feet - 66, cx + 58, 506, (x, y) => {
      const near = Math.abs(x - cx) < 30 + (y - feet) * 0.28;
      return near && y > feet - 62;
    }),
    dir: (x, y) => Math.PI / 2 + (fbm(x / 30, y / 50, 31) - 0.5) * 0.6,    // streaming down
    col: (x, y, r) => {
      // VIVID scarlet just under the robe → pale → white (rinsed clean in the pool)
      const t = Math.max(0, Math.min(1, (y - (feet - 62)) / 120));
      let c = ramp(['#f0241c', '#e8201a', CHILD_RED[0], '#ef6a5a', '#f4ada2', '#f8ddd6', '#ffffff'], t);
      c = mix(c, '#ffffff', fall(x, y) * 0.5);   // the bright water bleaches it
      return jig(c, r, 8);
    },
    len: (x, y) => 9 + (y - feet) / 11, lw: 3.0, steps: 3, follow: 0.92,
    lenJ: 0.7, relief: 0,
  });
  // a bright POOL of running light at the foot where the wash gathers and clears —
  // the scarlet is gone here; only white-gold light remains. Dense and luminous.
  strokes(out, counter, {
    rng, n: 460,
    sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 0.7) * 100; return [cx + Math.cos(a) * d, feet + 30 + Math.sin(a) * d * 0.42]; },
    dir: (x, y) => (fbm(x / 40, y / 24, 37) - 0.5) * 0.8,                  // running flat outward
    col: (x, y, r) => {
      const dd = Math.hypot(x - cx, (y - (feet + 30)) / 0.42) / 100;
      // white-hot heart of the pool → pale gold at the rim
      let c = ramp(['#ffffff', '#fffaf0', GOLD_PALE, GOLD], Math.min(1, dd));
      return jig(c, r, 5);
    },
    len: 14, lw: 3.6, steps: 2, lenJ: 0.5, impasto: 0.5,
  });
  // a last faint blush of scarlet dissolving at the very edge of the pool — the
  // stain lost in the light (it leaves; it does not stay).
  strokes(out, counter, {
    rng, n: 90,
    sample: r => { const a = r() * Math.PI * 2, d = 70 + Math.pow(r(), 0.6) * 36; return [cx + Math.cos(a) * d, feet + 30 + Math.sin(a) * d * 0.42]; },
    dir: (x, y) => (fbm(x / 30, y / 22, 41) - 0.5) * 0.9,
    col: (x, y, r) => jig(mix('#f6c8bf', '#ffffff', 0.5 + r() * 0.4), r, 6),
    len: 10, lw: 2.4, steps: 2, lenJ: 0.6, relief: 0,
  });

  /* ---------------- 6. RIM OF LIGHT on the child, facing the fall ---------------- */
  strokes(out, counter, {
    rng, n: 130,
    sample: rej(cx - 26, headY - 10, cx + 26, feet - 30, (x, y) => caps.some(c => E.inCap(x, y, c) && E.segDist(x, y, c.ax, c.ay, c.bx, c.by) > c.r - 5)),
    dir: () => -Math.PI / 2,
    col: (x, y, r) => jig(GOLD_HOT, r, 4),
    len: 5.5, lw: 1.8, steps: 1, relief: 0,
  });
  /* ---------------- 7. EXTRA WHITE-GOLD GLOW STROKES around the figure ----------------
     a tight radiant crown of marks hugging the silhouette — the clear, strong
     white aura of the washed child, raying outward (Isa 1:18 "white as snow"). */
  strokes(out, counter, {
    rng, n: 300,
    sample: r => {
      // ring just OUTSIDE the figure's mass — radiating off the silhouette
      for (let t = 0; t < 24; t++) {
        const a = r() * Math.PI * 2, d = 16 + Math.pow(r(), 0.5) * 30;
        const x = cx + Math.cos(a) * d, y = (headY + feet) / 2 + Math.sin(a) * d * 1.25;
        const onBody = caps.some(c => E.inCap(x, y, c));
        const nearBody = caps.some(c => E.segDist(x, y, c.ax, c.ay, c.bx, c.by) < c.r + 30);
        if (!onBody && nearBody) return [x, y];
      }
      return null;
    },
    dir: (x, y) => Math.atan2(y - (headY + feet) / 2, x - cx),    // ray straight outward
    col: (x, y, r) => jig(mix('#ffffff', GOLD_PALE, 0.35), r, 5),
    len: 11, lw: 2.6, steps: 1, lenJ: 0.6, impasto: 0.45, relief: 0,
  });
  /* ---------------- LIFE: WATER-LILIES at the cascade's base pool (Isa 1:18) ----------------
     white cups blooming on DARK water at the bright pool's flanks — purity grown
     where the wash has run clear. First the still dark water margins (the pool's
     own light needs dark beside it), then the pads, then the white cups. */
  for (const [wx, wy, ww, wh] of [[300, 462, 58, 18], [494, 458, 52, 16]]) {
    strokes(out, counter, {    // the still dark water margin — calm horizontal ripples
      rng, n: 130,
      sample: r => [wx + (r() + r() - 1) * ww, wy + (r() + r() - 1) * wh],
      dir: (x, y) => (fbm(x / 34, y / 20, 51) - 0.5) * 0.5,
      col: (x, y, r) => jig(mix('#101c40', '#1a3054', fbm(x / 26, y / 18, 53)), r, 4),
      len: 13, lw: 3.0, steps: 2, follow: 0.9, lenJ: 0.5, relief: 0,
    });
    strokes(out, counter, {    // a few thin gold flecks — the bright pool reflected on the dark water
      rng, n: 16,
      sample: r => [wx + (wx < 400 ? 1 : -1) * (10 + r() * ww * 0.7), wy - wh * 0.3 + (r() + r() - 1) * wh * 0.5],
      dir: () => 0,
      col: (x, y, r) => jig(mix(GOLD_DEEP, GOLD, 0.4), r, 5),
      len: 8, lw: 1.4, steps: 1, lenJ: 0.6, relief: 0,
    });
  }
  const lily = (lx, ly, s) => {
    const pc = (x, y, r) => jig(mix('#12402f', '#1c5a40', fbm(x / 8, y / 8, 57)), r, 5);  // deep green pad
    paintPath(out, counter, rng,   // the floating pad — a flat dark-green leaf
      [[lx - 9 * s, ly], [lx, ly + 1.6 * s], [lx + 9 * s, ly]], pc, { lw: 4.6 * s, len: 3.4, density: 0.95, jitter: 0.3 });
    const wc = (x, y, r) => jig(mix('#ffffff', '#fff6e6', 0.3 + r() * 0.2), r, 3);        // the white cup
    paintPath(out, counter, rng, [[lx - 6.5 * s, ly - 6.5 * s], [lx - 2 * s, ly - 1.5 * s]], wc, { lw: 2.4 * s, len: 2.6, density: 0.95, jitter: 0.3 });  // left petal
    paintPath(out, counter, rng, [[lx + 6.5 * s, ly - 6.5 * s], [lx + 2 * s, ly - 1.5 * s]], wc, { lw: 2.4 * s, len: 2.6, density: 0.95, jitter: 0.3 });  // right petal
    paintPath(out, counter, rng, [[lx, ly - 8 * s], [lx, ly - 2 * s]], wc, { lw: 2.6 * s, len: 2.6, density: 0.95, jitter: 0.3 });                        // centre petal
    paintPath(out, counter, rng, [[lx - 10 * s, ly - 4 * s], [lx - 5 * s, ly - 1 * s]], wc, { lw: 1.8 * s, len: 2.2, density: 0.9, jitter: 0.3 });        // outer left, opening
    paintPath(out, counter, rng, [[lx + 10 * s, ly - 4 * s], [lx + 5 * s, ly - 1 * s]], wc, { lw: 1.8 * s, len: 2.2, density: 0.9, jitter: 0.3 });        // outer right, opening
    paintPath(out, counter, rng, [[lx - 1.2 * s, ly - 3.4 * s], [lx + 1.2 * s, ly - 3 * s]],                                                              // the gold heart
      (x, y, r) => jig(GOLD_HOT, r, 3), { lw: 1.6 * s, len: 1.6, density: 1, jitter: 0.2 });
  };
  lily(287, 458, 1.15); lily(322, 470, 0.95);   // left margin — a pair
  lily(482, 452, 0.9);  lily(508, 464, 1.05);   // right margin — a pair
  fgRanges.push([_fg, out.length]);   // ← the child being washed is the foreground

  /* ---------------- EGG: snowflakes — "white as snow" ----------------
     three faint six-armed snow stars hidden in the bright fall (Isa 1:18). */
  for (const [fx, fy, s] of [[300, 150, 1], [512, 200, 0.8], [346, 300, 0.7]]) {
    const sc = (x, y, r) => jig('#ffffff', r, 4);
    for (let k = 0; k < 3; k++) {
      const a = (k / 3) * Math.PI;
      paintPath(out, counter, rng,
        [[fx - Math.cos(a) * 7 * s, fy - Math.sin(a) * 7 * s], [fx + Math.cos(a) * 7 * s, fy + Math.sin(a) * 7 * s]],
        sc, { lw: 1.2 * s, len: 2.4, density: 0.9, jitter: 0.3 });
    }
  }

  // EASTER EGG — Isaiah 1:18 in ORIGINAL HEBREW numerals (OT → Hebrew), cut faint
  // into the lower wash. "Though your sins be as scarlet, they shall be as white
  // as snow." (chapter 1, verse 18 → א·יח)
  E.inscriptionText(out, E.hebrewRef(1, 18), { x: 632, y: 452, h: 14, body: '#0e1238', edge: '#fff4d8', op: 0.7, edgeOp: 0.55 });

  const ALT = 'A small child stands beneath a dense vertical waterfall of brilliant white-gold light pouring straight down from above, glowing hard against a deep blue-violet surround. A clean radiant white robe of light overtakes the child from the head down, while the old scarlet rinses away below — vivid red threads paling to white as they run into a bright pool of light at the feet. Two white doves fly in toward the fall against the deep blue surround, and white water-lilies bloom on the dark still water at the bright pool\'s edges. High contrast, dynamic, downward-streaming brushwork. Hidden in the fall are faint six-armed snow stars — "white as snow".';

  // MULTIPLANE: assemble the requested depth plane. Each is its own cel —
  // transparent where it has no content — so they stack and parallax apart.
  const RAW = { undercoat: 0, weave: 0, varnish: 0, oil: 0 };   // no baked surface — the live filter unifies the planes
  const setOf = ranges => { const s = new Set(); for (const [a, b] of ranges) for (let i = a; i < b; i++) s.add(i); return s; };
  const pick = ranges => ranges.map(([a, b]) => out.slice(a, b).join('\n')).join('\n');
  const fgSet = setOf(fgRanges);
  if (LAYER === 'fg') return svgWrap(ALT, pick(fgRanges), RAW);   // the child being washed
  if (LAYER === 'bg') {                                           // surround + cascade + the snow eggs/inscription in the fall
    const body = out.filter((_, i) => i < bgEnd || (i >= bgEnd && !fgSet.has(i))).join('\n');
    return svgWrap(ALT, body, RAW);
  }
  // full painting (desktop): the original paint order, byte-identical
  return svgWrap(ALT, out.join('\n'));
}
