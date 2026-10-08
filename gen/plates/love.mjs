// gen/plates/love.mjs — "What C is — love" (§3)
// A great Van Gogh sun — the Sower's sun — fills the upper sky with swirling
// gold rays. Its light pours down onto a small child in deep red sharing
// bread with a smaller figure on a furrowed field. In the shadowed lower-left
// corner, big gray lifeless prizes (a trophy, a megaphone) stand untouched
// by the rays: big-looking things without love = nothing.
//
// Paint order (= rng order — append only):
//   1. SKY FIELD   — warm citron near the sun, cooling to night-blue corners
//   2. SUN         — disk core, concentric ray-swirls, long radiating rays
//   3. EASTER EGG  — the innermost ray-swirl is subtly heart-shaped
//   4. GROUND      — furrowed field, furrows bending toward the figures
//   5. SHADOW CORNER — gray trophy + megaphone, cold violet, no warmth
//   6. FIGURES     — red child + smaller figure, bread glowing between them
export const name = 'love';
export const title = 'What C is — love';
export const caption = 'Small acts with love.';
export const seed = 20260303;
export const focal = { x: 308, y: 400 }; // portrait window: the child sharing bread (meet at 318)
// MOBILE 3D — depth planes (FAR→NEAR): the swirling sun + sky behind; the
// furrowed field, the warm pool and the lifeless gray prizes in the middle (the
// dead prizes stay grounded, not popping); the fruit-trees nearer; the two
// bread-sharing figures closest. A field fringe textures the horizon seam.
// stacked sky-swirl sheets — bold, gapped passes of swirling brushwork (paint on
// paint, like the covers), each its own depth plane above the smooth sky ground
// ⭐ DETAIL PASS (Sep 8): 176/192 slabs at lw 7 → ~670 finer marks a sheet, every stroke
// its own width and length (free hashes — see widthOf/lengthOf in paint(); no rule).
const SKY_SHEETS = [
  { n: 640, len: 28, lw: 3.6, lift: 0.00 },
  { n: 700, len: 26, lw: 3.3, lift: 0.07 },
];
export const layers = [
  { name: 'sky', opaque: true },  // smooth sky ground + the great sun (backmost, opaque)
  ...SKY_SHEETS.map((_, i) => ({ name: 'sky' + (i + 1) })),   // stacked sky-swirl sheets
  { name: 'far' },                // distant rolling hills (the moving horizon)
  { name: 'mid' },                // furrowed field, warm pool, the gray prizes + fringe
  { name: 'fg' },                 // the bread-sharing figures
];

export function paint(E, opts = {}) {
  const {
    mulberry32, fbm, curlV, goldenSpiralV, mix, ramp, jig, lum, strokes, rej,
    lightRadial, paintFigure, underpaintCapsules, paintChild, lightEdge, castShadow, personCaps, paintPath, inCap, inEllipse,
    ribbon, svgWrap, R1, W, H,
    GOLD, GOLD_PALE, GOLD_DEEP, GOLD_HOT, NIGHT, DARKEST,
  } = E;

  const rng = mulberry32(seed);
  const out = [];
  const counter = { n: 0 };
  // MOBILE 3D LAYERS: tag ranges per band; MID = field + pool + prizes.
  const LAYER = opts.layer || 'full';
  const farRanges = [], fgRanges = [];
  // ⭐ EVERY STROKE DRAWS ITS OWN WIDTH AND LENGTH (Fred: "use no rules, a paint stroke
  // just exist because it exist") — two independent hashes per mark, no field, no coupling.
  const free = (x, y, salt) => { const n = Math.sin(x * 12.9898 + y * 78.233 + salt) * 43758.5453; return n - Math.floor(n); };
  const widthOf  = (x, y, salt) => 0.40 + 3.2 * Math.pow(free(x, y, salt), 2.6);
  const lengthOf = (x, y, salt) => 0.40 + 1.5 * Math.pow(free(x, y, salt + 17), 1.5);

  /* ---------------- 1. SKY FIELD ---------------- */
  out.push(`<rect width="${W}" height="${H}" fill="${DARKEST}"/>`);

  const SUN = { x: 472, y: 128, r: 58 };           // the ONE light source
  // ⚠ REACH 255 -> 430 (Fred: "the sun is shining and the ground should be bright, not
  // dark"). A sun this size does not light a disc of field and leave the rest at night —
  // it floods the whole country. At 255 the light died a third of the way down the plate,
  // which is why the field read as dusk under a blazing sun: a contradiction the page's
  // own sentence rules out ("Everything He made, He made for you").
  const light = lightRadial(SUN.x, SUN.y, 430);
  // ⚠ MOUNTAINS AND VALLEYS (Fred: "why dont we change the landscapes to mountains and
  // valleys?"). The horizon is no longer a nearly-straight field edge: it DIPS toward the
  // two figures — they meet at the bottom of a valley, which is where the sun's light
  // pools — and rises into shoulders at both ends of the frame, so the eye is carried
  // down into the meeting and the ranges behind have something to stand on.
  const horizon = x => 318 + 10 * Math.sin(x / 170) - x * 0.02
    - 34 * Math.exp(-(((x - 330) / 250) ** 2))     // the valley floor, opening at the bread
    + 30 * Math.exp(-(((x - 20) / 165) ** 2))      // the near shoulder, left
    + 34 * Math.exp(-(((x - 790) / 185) ** 2));    // and right

  // THE ALIVE NIGHT (the fractal sky — motion at three scales): the whole heaven
  // WHEELS in ONE great spiral centred on the Love-sun (macro — the golden swirl
  // IS the great wheel), a few eddies turn inside the surrounding night (mid), and
  // every stroke curves with its parent current (micro). Swirls within swirls, so
  // the golden Love-swirl and the night around it read as one continuous heaven.
  const EDDIES = [[110, 96, 56], [250, 270, -50], [680, 250, 52], [400, 290, -46]];
  const skyDir = (x, y) => {
    let vx = 14, vy = 0;   // gentle rightward drift under the wheel
    { const [a, b] = goldenSpiralV(x, y, SUN.x, SUN.y, 115, 260); vx += a; vy += b; }   // the one great wheel, on the Love-sun
    for (const [ex, ey, s] of EDDIES) { const [a, b] = goldenSpiralV(x, y, ex, ey, s, 80); vx += a; vy += b; }   // eddies in the night
    const [c, d] = curlV(x, y, 31, 120); vx += c * 26; vy += d * 26;                     // fine turbulence in every stroke
    return Math.atan2(vy, vx);
  };
  const skySlash = (x, y) => 0.1 + light(x, y) * 0.15;
  // warm citron sky around the sun, dying into deep blue at the corners; the eddy
  // cores breathe faint deep-night jewel light (blue/violet); violet complementary
  // sparks exactly where the gold gives out
  const EGLOW = [[110, 96, '#3f549e'], [250, 270, '#41337e'], [680, 250, '#2f5a92'], [400, 290, '#4a3f92']];
  const skyCol = (x, y, r, lift) => {
    const g = light(x, y);
    if (g > 0.16 && g < 0.3 && r() < 0.03) return jig('#7a5fb0', r, 18); // violet flick in the dying gold
    let c = ramp(['#202c58', '#36497e', '#6b6f5a', '#b3a14e', GOLD_DEEP], Math.min(1, 0.1 + g * 1.45 + fbm(x / 110, y / 110, 19) * 0.14));
    for (const [ex, ey, ec] of EGLOW) { const d2 = Math.hypot(x - ex, y - ey); c = mix(c, ec, Math.exp(-d2 / 95) * 0.5); }   // jewel eddy-glow
    if (lift) c = mix(c, '#ffffff', lift);
    return jig(c, r, 6);
  };
  // the smooth sky GROUND — one broad opaque pass (backmost, opaque); the bold
  // swirling brushwork lives in the stacked sheets above, so their gaps reveal paint
  strokes(out, counter, {
    rng, n: 900, sample: rej(-10, -10, 810, 345, (x, y) => y < horizon(x) + 10),
    dir: skyDir, col: (x, y, r) => skyCol(x, y, r, 0),
    len: (x, y) => 30 * lengthOf(x, y, 11), lw: (x, y) => 4.8 * widthOf(x, y, 13),
    steps: 4, follow: 0.91, wild: 0.05, aJ: skySlash, lenJ: 0.3, wJ: 0.3, impasto: 0.5, relief: 0.5,
  });
  const groundEnd = out.length;   // the smooth sky ground is the backmost opaque mass
  // the stacked SKY-SWIRL SHEETS — each an independent bold, gapped pass of the
  // swirling citron-to-night sky (paint on paint), own rng per sheet. They weave
  // ABOVE the sky ground but UNDER the sun, so the sun reads in front of them.
  const skySheets = SKY_SHEETS.map((e, k) => {
    const srng = mulberry32(seed + 1009 * (k + 1));
    const sh = [];
    strokes(sh, { n: 0 }, {
      rng: srng, n: e.n, sample: rej(-10, -10, 810, 340, (x, y) => y < horizon(x) + 6),
      dir: skyDir, col: (x, y, r) => skyCol(x, y, r, e.lift),
      len: (x, y) => e.len * lengthOf(x, y, 31 + k), lw: (x, y) => e.lw * widthOf(x, y, 37 + k),
      steps: 5, follow: 0.91, wild: 0.06, lenJ: 0.3, wJ: 0.3, impasto: 0.6, relief: 0.5,
      aJ: skySlash,
    });
    return sh.join('\n');
  });

  /* ---------------- 2. THE SUN ---------------- */
  // ⚠ PAINTED AGAIN. I de-baked these to spin them with a rig; Fred: "now delete the ray
  // overlay" — the sky itself turns now (six drawings of the swirl sheets, flowing), so an
  // overlay of rays on top of a moving painting is exactly the thing this book keeps
  // ruling out. The rays belong to the picture.
  strokes(out, counter, {
    rng, n: 1000,
    sample: r => {
      const a = r() * Math.PI * 2;
      const d = SUN.r + 6 + Math.pow(r(), 1.35) * 158;
      return [SUN.x + Math.cos(a) * d, SUN.y + Math.sin(a) * d];
    },
    dir: (x, y) => Math.atan2(y - SUN.y, x - SUN.x) + 0.55, // rays lean hard — a spiral, not spokes
    col: (x, y, r) => {
      const d = Math.hypot(x - SUN.x, y - SUN.y);
      if (r() < 0.04 && d > SUN.r + 120) return jig('#6b54a8', r, 14); // violet spark at the rays' death
      return jig(ramp([GOLD_PALE, GOLD, GOLD_DEEP, '#9a8440', '#6b7060'], (d - SUN.r) / 165), r, 8);
    },
    len: (x, y) => 26 * lengthOf(x, y, 51), lw: (x, y) => 2.0 * widthOf(x, y, 53), steps: 3, follow: 0.95, wild: 0.06, lenJ: 0.3, wJ: 0.3, relief: 0.4,
  });
  // concentric ray-swirl rings around the disk
  strokes(out, counter, {
    rng, n: 600,
    sample: r => { const a = r() * Math.PI * 2, d = SUN.r + 2 + r() * 34; return [SUN.x + Math.cos(a) * d, SUN.y + Math.sin(a) * d]; },
    dir: (x, y) => Math.atan2(y - SUN.y, x - SUN.x) + Math.PI / 2 + 0.12,
    col: (x, y, r) => jig(ramp([GOLD_HOT, GOLD_PALE, GOLD], (Math.hypot(x - SUN.x, y - SUN.y) - SUN.r) / 36), r, 8),
    len: (x, y) => 13 * lengthOf(x, y, 61), lw: (x, y) => 1.7 * widthOf(x, y, 63), steps: 3, follow: 0.95, lenJ: 0.3, wJ: 0.3, relief: 0.4,
  });
  lightEdge(out, counter, SUN.x, SUN.y, SUN.r);   // dark contrast ring at the sun's rim
  // the disk itself: dense bright core
  strokes(out, counter, {
    rng, n: 620,
    sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 0.7) * SUN.r; return [SUN.x + Math.cos(a) * d, SUN.y + Math.sin(a) * d]; },
    dir: (x, y) => Math.atan2(y - SUN.y, x - SUN.x) + Math.PI / 2,
    col: (x, y, r) => jig(ramp(['#fffdf0', GOLD_HOT, GOLD_PALE, GOLD], Math.hypot(x - SUN.x, y - SUN.y) / SUN.r), r, 6),
    len: (x, y) => 10 * lengthOf(x, y, 71), lw: (x, y) => 1.9 * widthOf(x, y, 73), steps: 2, wJ: 0.3, lenJ: 0.3, relief: 0.35,
  });

  /* ---------------- 3. EASTER EGG — the heart swirl ---------------- */
  // the innermost ray-swirl traces a quiet heart around the sun's core:
  // classic cardioid-heart parametric, painted one tone above the disk
  {
    const pts = [];
    for (let t = 0; t <= Math.PI * 2 + 0.01; t += 0.18) {
      const hx = 16 * Math.pow(Math.sin(t), 3);
      const hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
      pts.push([SUN.x + hx * 2.9, SUN.y + hy * 2.9 - 4]);
    }
    paintPath(out, counter, rng, pts, (x, y, r) => jig(mix('#fffdf0', GOLD_PALE, r() * 0.5), r, 5),
      { lw: 2.6, len: 7, density: 0.85, jitter: 1.5 }); // a fourth-look whisper inside the glare
  }
  // LIFE — a BIRD PAIR crossing the blaze (Matt 6:26 "Behold the fowls of the
  // air... your heavenly Father feedeth them") — two dark curved gull-arcs
  // (Munch: living = curved) riding the sun's spiral rays, upper-left of the
  // disk, clear of the heart egg. Own rng so the rest of the plate is untouched.
  {
    const brng = mulberry32(seed + 4407);
    const bird = (bx, by, s, colr) => {
      // a bright pocket of sunlit air behind the bird — the busy sky slashes
      // there are calmed to solid gold so the dark silhouette carves out clean
      strokes(out, counter, {
        rng: brng, n: 30,
        sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 0.65) * 8.5 * s; return [bx + Math.cos(a) * d * 1.35, by + Math.sin(a) * d * 0.75]; },
        dir: () => 0.15,
        col: (x, y, r) => jig(mix(GOLD_PALE, GOLD, r() * 0.5), r, 6),
        len: 9, lw: 3.4, steps: 2, relief: 0,
      });
      paintPath(out, counter, brng,
        [[bx - 6 * s, by + 2.6 * s], [bx, by - 1.8 * s], [bx + 6 * s, by + 2.6 * s]],
        (x, y, r) => jig(colr, r, 5), { lw: 2.0 * s, len: 3.2, density: 1, jitter: 0.4 });
    };
    bird(346, 152, 2.3, '#1e1c40');  // leading bird — dark on the citron blaze
    bird(308, 182, 1.8, '#242048');  // its mate, a beat behind and below
  }
  const skyEnd = out.length;   // FAR plane: the swirling sky + the great sun

  /* ⚠ THE HILLS ARE PAINTED BEFORE THE GROUND NOW. They used to be drawn last, which put
     three flat fills OVER the field — and the nearest one's bottom edge, a dead-straight
     contour at horizon+60, was the line Fred kept pointing at. No amount of texture under
     it could help: it was on top. In the natural order — sky, then hills, then the ground
     that stands in front of them — the field's own paint closes over every one of those
     edges, which is what a foreground is for. */
  const _far = out.length;
  // three ranges, receding. ⚠ AERIAL PERSPECTIVE IS COLOUR, NOT ALPHA. Fred: "did you
  // make it more transparent? i want it to be more opaque. mountains are not transparent."
  // Exactly — a mountain occludes everything behind it however far away it is; what
  // distance does is wash its colour toward the sky's, because there is air in between.
  // My first fix dropped the group opacity, which is the wrong physics twice over: it made
  // the ranges see-through AND, being dark paint over a dark sky, it made them vanish.
  // So: fully opaque, and the far range is painted in pale hazy violet-blue while the near
  // one keeps its own dark earth.
  E.distantHills(out, counter, rng, { topFn: E.ridge(x => horizon(x) - 104, { amp: 86, freq: 330, bumps: 0.9, seed: 7 }),
    horizonFn: x => horizon(x) - 62, cols: ['#9a8fc4', '#b8a6cc', '#d2bfcf'], depth: 96, lightFn: light, seed: 7 });   // Sep 12: lilac-rose, sunlit — not grey card

  E.distantHills(out, counter, rng, { topFn: E.ridge(x => horizon(x) - 58, { amp: 62, freq: 235, bumps: 0.8, seed: 19 }),
    horizonFn: x => horizon(x) - 26, cols: ['#6f6f98', '#8f8a6e', '#b39f5e'], depth: 74, lightFn: light, seed: 19 });

    E.distantHills(out, counter, rng, { topFn: E.ridge(horizon, { amp: 30, freq: 190, bumps: 0.6, seed: 31 }), horizonFn: horizon, cols: ['#4e6a44', '#7a8a3c', '#b09c42'], depth: 60, lightFn: light, seed: 31 });

  /* ⚠ AND THE RANGES GET PAINTED TOO. `distantHills` lays a flat fill and about 390 marks
     over it — enough for a distant ridge in a busy plate, nowhere near enough when the
     ranges are this big. Each gets its own pass: strokes running with the slope, pulling
     colour across its palette, so a mountain reads as rock catching light rather than a
     grey card. Fewer and softer on the far range (distance eats detail), denser and
     warmer on the near one. */
  {
    const RANGES = [
      // ⭐ DETAIL PASS: short fat dabs (len 12–15, lw 3.4–4.2, relief left at the default 1)
      // tiled the ranges into cobble walls. Long strokes WITH the slope, free sizes, and a
      // hairline relief — rock catching light, not flagstones.
      { top: x => horizon(x) - 104 - 86 * 0.35, bot: x => horizon(x) - 40, n: 1500,
        cols: ['#9a8fc4', '#b8a6cc', '#d2bfcf'], len: 30, lw: 2.4, jit: 9 },   // ⭐ Sep 12 (the beauty pass, 1 John 4:8 "God is love"): the far country under the Sower's sun was three GREY cards across the middle of the page. Everything He made, He made for you — so the ranges take the sun: lilac-rose far off, gold-olive nearer, green-gold at the field's edge, and the light on their shoulders doubled.
      { top: x => horizon(x) - 58 - 62 * 0.35, bot: x => horizon(x) - 4, n: 1900,
        cols: ['#6f6f98', '#8f8a6e', '#b39f5e'], len: 26, lw: 2.2, jit: 11 },
      { top: x => horizon(x) - 30 * 0.35, bot: x => horizon(x) + 46, n: 2100,
        cols: ['#4e6a44', '#7a8a3c', '#b09c42'], len: 24, lw: 2.0, jit: 13 },
    ];
    const mrng = mulberry32(seed + 3307);
    for (const R of RANGES) {
      strokes(out, counter, {
        rng: mrng, n: R.n,
        sample: r => { const x = -14 + r() * 828; const t = R.top(x), b = R.bot(x);
                       return [x, t + Math.pow(r(), 0.85) * Math.max(4, b - t)]; },
        dir: x => { const e = 7; return Math.atan2(R.top(x + e) - R.top(x - e), 2 * e) + (fbm(x / 30, 5, 221) - 0.5) * 0.6; },
        col: (x, y, r) => {
          const g = light(x, y), t = R.top(x);
          let c = ramp(R.cols, fbm(x / 48, y / 30, 223) * 0.7 + Math.min(1, Math.max(0, (y - t) / 90)) * 0.5);
          c = mix(c, '#ffe9a8', g * 0.55);                       // the sun on the shoulders (doubled, Sep 12)
          c = mix(c, '#3a3460', Math.max(0, 0.35 - g) * 0.45);   // and the cold in the folds — violet, never grey
          return jig(c, r, R.jit);
        },
        len: (x, y) => R.len * lengthOf(x, y, 81), lw: (x, y) => R.lw * widthOf(x, y, 83),
        steps: 3, follow: 0.9, lenJ: 0.3, wJ: 0.3, wild: 0.06, impasto: 0.42, relief: 0.35,
      });
    }
  }
  farRanges.push([_far, out.length]);

  /* ---------------- 4. GROUND — the furrowed field ---------------- */
  const MEET = [318, 408]; // where the two figures meet (bread point)
  // furrows bend gently toward the meeting point — the field itself leans in
  const groundDir = (x, y) => {
    const toward = Math.atan2(MEET[1] - y, MEET[0] - x);
    const flat = x < MEET[0] ? 0 : Math.PI;
    const wsum = Math.min(1, 260 / (40 + Math.hypot(x - MEET[0], y - MEET[1])));
    const [c, d] = curlV(x, y, 23, 90);
    return Math.atan2(Math.sin(flat) * (1 - wsum) + Math.sin(toward) * wsum + d * 0.5,
                      Math.cos(flat) * (1 - wsum) + Math.cos(toward) * wsum + c * 0.5);
  };
  // ⚠ A LIGHT'S EDGE IS NOT A RULED LINE (Fred: "i can see a straight line, this should be
  // textured, grass etc is not straight"). The field's colour follows `light()`, which is a
  // smooth radial falloff — so the boundary where the sun stops reaching the grass arrives
  // as a clean arc, and across a wide plate a clean arc IS a straight line. Real ground
  // breaks that edge: tufts catch light past it, hollows fall dark before it. So the ground
  // reads the light through noise, and the terminator becomes ragged at the scale of the
  // grass rather than at the scale of the field.
  // ⚠ THE NOISE HAS TO WORK AT THE SCALE OF THE LAND, not of the brush. My first pass
  // jittered the light with fbm(x/23) — fine dither, which only softened the edge by a few
  // pixels and left the line exactly where it was. This wanders the terminator by TENS of
  // pixels (fbm at x/90) so it wobbles like ground does, with a finer grain on top of it
  // and a bias that keeps a little more light in the lower field so the boundary is not a
  // single value everyone can find.
  /* ⚠ THE RAYS LAND ON THE GROUND (Fred: "make it so that the light rays make the ground
     on the contact with light rays brighter? we can play on shadows on this sheet").
     The sun's rays lean 0.55 rad off true, so its light leaves in a spiral — and where a
     shaft of it reaches the field the grass should blaze, with the ground falling back
     into shade between. That is one function: brightness read off the ANGLE around the
     sun, wound with distance so the shafts spiral exactly as the painted rays do, softened
     by noise so they are light through air and not a cog.
     The shafts also FADE with distance — near the sun they are distinct, far off the field
     evens out, which is what happens when light has that much air to cross. */
  const shaft = (x, y) => {
    const a = Math.atan2(y - SUN.y, x - SUN.x);
    const d = Math.hypot(x - SUN.x, y - SUN.y);
    const wind = a * 6 + d * 0.016 + 0.55;                     // six broad shafts, winding as they go
    const s = 0.5 + 0.5 * Math.sin(wind + (fbm(x / 70, y / 70, 301) - 0.5) * 1.8);
    const reach = Math.max(0, 1 - Math.max(0, d - 120) / 420);  // distinct near, even far
    return 1 + (s - 0.45) * 1.5 * reach;                        // ~0.3 in shade .. ~1.8 in a shaft
  };
  const groundLight = (x, y) => Math.max(0, Math.min(1, shaft(x, y) * (
    light(x, y) * (0.55 + 1.05 * fbm(x / 90, y / 55, 77))
    + (fbm(x / 26, y / 15, 79) - 0.5) * 0.10
    + (fbm(x / 8, y / 6, 81) - 0.5) * 0.05)));
  const groundCol = (x, y, r) => {
    const g = groundLight(x, y);
    const band = fbm(x / 50, y / 26, 41); // furrow striping
    let c = ramp(['#2b3a34', '#3f5a35', '#5f7b34', '#8a9a3c', '#c4b455'], Math.min(1, g * 1.15 + band * 0.24));
    c = mix(c, '#5a3f70', Math.max(0, 0.16 - g) * 1.2 * Math.max(0, 1 - x / 260)); // cold violet ONLY in the lifeless corner, not across the whole field
    // ⚠ AND THE SHAFT ITSELF, laid on as colour. Brightness alone cannot show here: in the
    // lit field `g` is already at the ramp's top, so a shaft can only ever darken. Warmth
    // is what a beam actually does to grass — gold where it lands, cool where it does not.
    const sh = shaft(x, y);
    c = mix(c, '#f6e296', Math.max(0, sh - 1) * 0.55);
    c = mix(c, '#2c3f4e', Math.max(0, 1 - sh) * 0.42);
    return jig(c, r, 6);
  };
  /* ⚠ THE FIELD MUST BE PAINTED, NOT FILLED (Fred: "i still see a lot of block colours
     with no painting strokes, make the ground have high details!"). I gave it a solid
     underpaint to bury the hills' edges and then left the old 700 strokes on top of it —
     which is a flat colour with some marks on it, the one thing this book is not.
     Three passes now, at three scales, the way the plates that work are built:
       · the long furrows that give the field its lie
       · a mid pass that breaks every long stroke's body
       · a fine tooth so no patch of ground is ever one value
     No two marks alike: each pulls its own colour, length and angle. */
  strokes(out, counter, { rng, n: 1500, sample: rej(-10, 300, 810, 510, (x, y) => y > horizon(x)),
    dir: groundDir, col: groundCol,
    len: (x, y) => (30 + 26 * fbm(x / 60, y / 34, 205)) * lengthOf(x, y, 91), lw: (x, y) => 4.0 * widthOf(x, y, 93),
    steps: 3, follow: 0.9, wild: 0.08, lenJ: 0.3, wJ: 0.3, relief: 0.4 });
  strokes(out, counter, { rng, n: 1900, sample: rej(-10, 300, 810, 510, (x, y) => y > horizon(x)),
    dir: (x, y) => groundDir(x, y) + (fbm(x / 12, y / 9, 211) - 0.5) * 0.9,
    col: (x, y, r) => jig(groundCol(x, y, r), r, 12),
    len: (x, y) => (12 + 12 * fbm(x / 26, y / 16, 213)) * lengthOf(x, y, 95), lw: (x, y) => 2.4 * widthOf(x, y, 97),
    steps: 2, follow: 0.92, wild: 0.1, lenJ: 0.3, wJ: 0.3, impasto: 0.45, relief: 0.4 });
  strokes(out, counter, { rng, n: 2200, sample: rej(-10, 320, 810, 512, (x, y) => y > horizon(x) + 8),
    dir: (x, y) => groundDir(x, y) + (fbm(x / 6, y / 5, 217) - 0.5) * 1.7,
    col: (x, y, r) => jig(groundCol(x, y, r), r, 18),
    len: (x, y) => 6.5 * lengthOf(x, y, 99), lw: (x, y) => 1.4 * widthOf(x, y, 103), steps: 2, lenJ: 0.3, wJ: 0.3, wild: 0.12, impasto: 0.5, relief: 0.3 });
  /* ⚠ THE FIELD NEEDS ITS OWN GROUND, or the hills' edges are always visible through it.
     `distantHills` fills each range down to `horizon + depth` and stops dead; love painted
     its field in STROKES only, so between them the range's flat fill showed, and its
     bottom edge — one flat contour at horizon+60 — was the straight line Fred kept seeing.
     Covering it with more strokes could never work: strokes have gaps by design.
     So the field gets a solid underpaint, exactly as `flame`'s shore does, and its TOP
     edge is grass rather than a line: sampled fine enough to keep the sawtooth, with
     tufts cut into it, so the join between hill and field is bitten rather than ruled. */
  {
    const jag = x => {
      const fine = (fbm(x / 3.4, 2.6, 733) - 0.5) * 7;
      const tuft = Math.max(0, fbm(x / 9.5, 8.1, 737) - 0.5) * 26;
      return horizon(x) + 16 + fine - tuft;
    };
    let d = `M-2 ${R1(jag(-2))}`;
    for (let x = -2; x <= 802; x += 2.2) d += `L${R1(x)} ${R1(jag(x))}`;
    d += `L802 ${H + 2}L-2 ${H + 2}Z`;
    out.push(`<path d="${d}" fill="#4a6132"/>`); counter.n++;   // a LIT field's own body colour
  }
  /* ⚠ AND THIS IS THE STRAIGHT LINE (found at last, by measuring the RENDER instead of
     guessing at the paint). `distantHills` fills each range as a path that runs from its
     ridge down to `horizonFn(x) + depth` — so every range ends on a hard, flat edge, and
     the nearest one's edge lands right in the field at horizon+60. The field's own strokes
     are sparse enough to let it show through, and across 800 units that edge reads as a
     ruled line. The hills are not wrong; they just need the ground to close over them.
     So: a dense band of the field's own paint, in the field's own direction, laid right
     across where those edges fall. */
  strokes(out, counter, {
    rng, n: 520,
    sample: r => { const x = -10 + r() * 820; return [x, horizon(x) + 6 + Math.pow(r(), 0.75) * 120]; },
    dir: (x, y) => groundDir(x, y),
    col: (x, y, r) => groundCol(x, y, r),
    len: (x, y) => 28 * lengthOf(x, y, 111), lw: (x, y) => 4.0 * widthOf(x, y, 113), steps: 3, follow: 0.9, wild: 0.06, lenJ: 0.3, wJ: 0.3, impasto: 0.35, relief: 0.4,
  });
  // horizon band: tighter strokes along the crest, catching the sun
  strokes(out, counter, {
    rng, n: 260,
    sample: rej(-10, 290, 810, 360, (x, y) => y > horizon(x) && y < horizon(x) + 26),
    dir: x => { const e = 6; return Math.atan2(horizon(x + e) - horizon(x - e), 2 * e); },
    col: (x, y, r) => jig(mix('#3a4060', GOLD_DEEP, light(x, y) * 0.6), r, 8),
    len: 22, lw: 3.2, steps: 3, wild: 0.06,
  });
  // ⚠ AND GRASS ACROSS IT. Colour noise alone still leaves a soft belt; what kills a line
  // is OBJECTS crossing it. A scatter of curved blades straddles the terminator — lit at
  // the top, dark at the root — so the edge is interrupted by things that live there.
  {
    const trng = mulberry32(seed + 8821);
    for (let i = 0; i < 150; i++) {
      const tx = -10 + trng() * 820;
      // sit them where the light is dying: find that band by the light value itself
      let ty = 330 + trng() * 150;
      for (let k = 0; k < 6; k++) {                 // walk toward light ~0.18, the edge
        const g = light(tx, ty);
        ty += (g > 0.18 ? 10 : -8) * (0.5 + trng() * 0.8);
      }
      if (ty < horizon(tx) + 6 || ty > 505) continue;
      const s2 = 0.7 + trng() * 1.1, lean = (trng() - 0.5) * 8;
      paintPath(out, counter, trng,
        [[tx, ty], [tx + lean * 0.4, ty - 9 * s2], [tx + lean, ty - 17 * s2]],
        (x, y, r) => {
          const up = Math.max(0, (ty - y) / (17 * s2));
          let c = mix('#3d5230', '#a3b04a', up * 0.85);
          c = mix(c, '#d8c46a', light(x, y) * shaft(x, y) * up * 0.8);   // a blade in a shaft catches fire
          return jig(c, r, 7);
        },
        { lw: 1.5 * s2, len: 4, density: 0.92, jitter: 0.5 });
    }
  }
  /* ⚠ AND THE LIGHT'S OWN EDGE, broken the way this book breaks every shadow: not by a
     softer gradient but by MARKS THAT COMMIT. Along the band where the sun's reach dies,
     each stroke picks a side — some carry the lit olive well down into the dark, some
     drop the dark up into the light — so the two regions interpenetrate like real ground
     under a low sun, instead of meeting along a contour. (Broken colour: shadow is the
     density and value of the marks, never a veil.) */
  {
    const erng = mulberry32(seed + 5309);
    strokes(out, counter, {
      rng: erng, n: 420,
      sample: r => {
        const x = -10 + r() * 820;
        let y = 340 + r() * 150;
        for (let k = 0; k < 5; k++) { y += (light(x, y) > 0.17 ? 12 : -10) * (0.4 + r()); }
        return [x, y + (r() - 0.5) * 66];
      },
      dir: (x, y) => groundDir(x, y),
      col: (x, y, r) => {
        const lit = r() < 0.5;                       // each mark commits to one side
        const sh = shaft(x, y);
        const g = lit ? Math.max(light(x, y) * sh, 0.30) : Math.min(light(x, y) * sh * 0.7, 0.12);
        let c = ramp(['#2b3a34', '#3f5a35', '#5f7b34', '#8a9a3c', '#c4b455'], Math.min(1, g * 1.15 + 0.12));
        return jig(c, r, 9);
      },
      len: (x, y) => 24 * lengthOf(x, y, 121), lw: (x, y) => 3.6 * widthOf(x, y, 123), steps: 3, follow: 0.88, wild: 0.08, lenJ: 0.3, wJ: 0.3, impasto: 0.4, relief: 0.4,
    });
  }
  /* ⚠ BRIGHT ACCENTS (Fred: "care to use more bright colors for accents?"). Broken colour
     the way the post-impressionists actually used it: a field is not green, it is a
     thousand marks most of which are green and some of which are magenta, cyan, coral or
     violet — and the eye mixes them into a green that is ALIVE. The accents gather where
     the light lands (a shaft picks colour out of the ground; shade swallows it), so they
     also strengthen the beams rather than fighting them. */
  {
    const arng = mulberry32(seed + 61803);
    const ACC = ['#ff5fa2', '#3fd8e0', '#ffb43c', '#b57cff', '#c6ff5a', '#ff8452', '#5ce0a8'];
    strokes(out, counter, {
      rng: arng, n: 520,
      sample: r => {
        for (let k = 0; k < 6; k++) {                 // try a few spots, keep a lit one
          const x = -10 + r() * 820, y = horizon(x) + 6 + Math.pow(r(), 0.8) * 190;
          if (y > 512) continue;
          const lit = Math.min(1, light(x, y) * shaft(x, y));
          if (r() < 0.05 + lit * 0.8) return [x, y];
        }
        return null;
      },
      dir: (x, y) => groundDir(x, y) + (fbm(x / 9, y / 7, 401) - 0.5) * 2.4,
      col: (x, y, r) => {
        const c = ACC[(r() * ACC.length) | 0];
        const lit = Math.min(1, light(x, y) * shaft(x, y));
        return jig(mix(mix(c, '#5f7b34', 0.58), '#fff2c0', lit * 0.26), r, 16);   // mostly ground, a little fire
      },
      len: (x, y) => 4 + 5 * fbm(x / 14, y / 10, 403), lw: 2.1,
      steps: 2, lenJ: 0.7, wJ: 0.6, wild: 0.18, impasto: 0.55, op: 0.9,
    });
    // and a scatter of bigger, hotter dabs — the flecks that carry across the room
    strokes(out, counter, {
      rng: arng, n: 85,
      sample: r => {
        for (let k = 0; k < 5; k++) {
          const x = -10 + r() * 820, y = horizon(x) + 14 + Math.pow(r(), 0.7) * 180;
          if (y > 508) continue;
          if (r() < 0.08 + Math.min(1, light(x, y) * shaft(x, y))) return [x, y];
        }
        return null;
      },
      dir: (x, y) => groundDir(x, y) + 1.2,
      col: (x, y, r) => jig(mix(ACC[(r() * ACC.length) | 0], '#6e7a3a', 0.22), r, 10),
      len: 4, lw: 3.6, steps: 1, lenJ: 0.5, wJ: 0.5, impasto: 0.6, op: 0.95,
    });
  }
  // warm pool of sunlight on the field around the figures
  strokes(out, counter, {
    rng, n: 150,
    sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 1.3) * 66; return [MEET[0] + Math.cos(a) * d * 1.5, MEET[1] + 6 + Math.sin(a) * d * 0.4]; },
    dir: groundDir,
    col: (x, y, r) => jig(ramp([mix(GOLD, '#8a7634', 0.3), '#7d6c30', '#4a4a33', '#2e3a55'], Math.hypot((x - MEET[0]) / 1.5, (y - MEET[1]) * 1.6) / 70), r, 7),
    len: 14, lw: 2.6, steps: 2,
  });

  /* ---------------- 5. THE SHADOW CORNER — lifeless prizes ---------------- */
  // lower-left corner: a big trophy and a megaphone, gray, untouched by rays.
  // Painted in cold gray-violet; the only place the sun does not reach.
  {
    // deepen the corner first
    strokes(out, counter, {
      rng, n: 240,
      sample: rej(-10, 360, 215, 510),
      dir: (x, y) => { const [c, d] = curlV(x, y, 67, 70); return Math.atan2(d, c); },
      col: (x, y, r) => jig(mix('#161c36', '#262b48', fbm(x / 60, y / 60, 71)), r, 7),
      len: 22, lw: 4, steps: 3, wild: 0.1, lenJ: 0.5,
    });
    // TROPHY: cup + stem + base as capsules, gray underpaint, gray strokes
    const tx = 84, ty = 478;
    const trophyCaps = [
      { ax: tx, ay: ty - 64, bx: tx, by: ty - 40, r: 17 },  // cup bowl
      { ax: tx, ay: ty - 38, bx: tx, by: ty - 16, r: 4.5 }, // stem
      { ax: tx - 15, ay: ty - 12, bx: tx + 15, by: ty - 12, r: 6 }, // base
      { ax: tx - 24, ay: ty - 66, bx: tx - 20, by: ty - 50, r: 3.4 }, // left handle
      { ax: tx + 24, ay: ty - 66, bx: tx + 20, by: ty - 50, r: 3.4 }, // right handle
    ];
    underpaintCapsules(out, counter, trophyCaps, '#41444f');
    paintFigure(out, counter, rng, trophyCaps, (x, y, r) => jig(mix('#393d4a', '#4d505c', fbm(x / 18, y / 18, 83)), r, 5), 1.2, 0.4, 0.7);
    // MEGAPHONE: a cone lying tilted beside the trophy
    const mx = 162, my = 470;
    const megCaps = [
      { ax: mx - 18, ay: my + 6, bx: mx + 26, by: my - 18, r: 13 }, // horn (fat end up-right)
      { ax: mx - 26, ay: my + 11, bx: mx - 16, by: my + 5, r: 4.5 }, // mouthpiece
    ];
    underpaintCapsules(out, counter, megCaps, '#3d404b');
    paintFigure(out, counter, rng, megCaps, (x, y, r) => jig(mix('#373b48', '#494c58', fbm(x / 16, y / 16, 89)), r, 5), 1.2, 0.4, 0.7);
    // horn rim: a dull gray ellipse of strokes — open mouth, nothing coming out
    strokes(out, counter, {
      rng, n: 40,
      sample: r => { const a = r() * Math.PI * 2; return [mx + 26 + Math.cos(a) * 6, my - 18 + Math.sin(a) * 13]; },
      dir: (x, y) => Math.atan2(y - (my - 18), (x - (mx + 26)) * 0.3) + Math.PI / 2,
      col: (x, y, r) => jig('#4a4d58', r, 5),
      len: 5, lw: 1.8, steps: 2,
    });
    // cold violet shadow strokes leaning away from the prizes — they cast gloom, not light
    strokes(out, counter, {
      rng, n: 90,
      sample: rej(20, 440, 210, 505, (x, y) => fbm(x / 30, y / 30, 91) > 0.4),
      dir: () => 0.25,
      col: (x, y, r) => jig(mix('#1a1f3c', '#4a3a6a', r() * 0.4), r, 9),
      len: 14, lw: 2.4, steps: 2,
    });
  }

  /* ---------------- 6. FIGURES — the child shares bread ----------------  [FG plane] */
  const _fgFigs = out.length;
  // The red child (left, slightly larger) leans toward a smaller figure;
  // between their hands, a small loaf catching the sun.
  const fy = 416; // shared ground line
  // child in deep red, kneeling forward, both arms extended with the loaf
  // capsule geometry kept ONLY for the pool/rim exclusion zones below
  const childCaps = personCaps(296, fy - 40, 40, {
    lean: 3,
    rightHand: [316, fy - 15], leftHand: [313, fy - 12],
    leftFoot: [291, fy], rightFoot: [301, fy],
  });
  const smallCaps = personCaps(341, fy - 32, 32, {
    lean: -2,
    leftHand: [328, fy - 12], rightHand: [331, fy - 10],
    leftFoot: [337, fy], rightFoot: [345, fy],
  });
  // THE MAIN CHARACTER — the little pilgrim, kneeling forward, both arms
  // extended offering the loaf to the smaller one
  E.paintMask(out, counter, rng, {
    x: 296, y: fy, h: 40, facing: 1, kneel: true, lean: 3,
    armR: [316, fy - 15], armL: [313, fy - 12],
    eye: [1, 0.2], mood: 'joy',
  });
  // smaller figure: a dark-cloaked little one, hands cupped to receive
  E.paintMask(out, counter, rng, {
    x: 341, y: fy, h: 32, facing: -1, lean: -2,
    armL: [328, fy - 12], armR: [331, fy - 10],
    cols: ['#26304a', '#161c30', '#0e131f'],
    maskCols: ['#b8b2a4', '#a29c8e', '#847e70'],
    eye: [-1, 0.2], mood: 'wonder',
  });
  // the loaf between their hands: a small warm knot — the brightest thing below the horizon
  {
    const bx = 320, by = fy - 12;
    strokes(out, counter, {
      rng, n: 48,
      sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 1.4) * 6; return [bx + Math.cos(a) * d * 1.4, by + Math.sin(a) * d * 0.8]; },
      dir: () => 0.1,
      col: (x, y, r) => jig(ramp([GOLD_HOT, GOLD_PALE, '#c89a58'], Math.hypot(x - bx, y - by) / 8), r, 7),
      len: 4.5, lw: 2, steps: 2,
    });
  }
  // gold rim-light on both figures' sun side (upper right flank)
  strokes(out, counter, {
    rng, n: 16,
    sample: rej(288, fy - 46, 318, fy, (x, y) => childCaps.some(c => inCap(x, y, c)) && !childCaps.some(c => inCap(x + 3.5, y - 3.5, c))),
    dir: () => -Math.PI / 3,
    col: (x, y, r) => jig(mix(GOLD_DEEP, '#9a6a2a', r() * 0.5), r, 9),
    len: 3.5, lw: 1.3, steps: 2,
  });
  strokes(out, counter, {
    rng, n: 12,
    sample: rej(330, fy - 34, 352, fy, (x, y) => smallCaps.some(c => inCap(x, y, c)) && !smallCaps.some(c => inCap(x + 3.5, y - 3.5, c))),
    dir: () => -Math.PI / 3,
    col: (x, y, r) => jig(mix(GOLD_DEEP, '#8a6230', r() * 0.5), r, 9),
    len: 4, lw: 1.4, steps: 2,
  });

  /* ---------------- 7. FIGURE PROMINENCE RESTORE (append-only) ----------------
     The engine's relief upgrade gave the furrows hard lit edges that swallow
     the two small figures at MEET. Re-lay a calmer, warmer pool around them
     (relief:0 — flat paint, no ridges), put a dark halo behind both
     silhouettes, then repaint the figures brighter on top. The composition
     is untouched; only the figures' readability at thumbnail size changes. */
  {
    const allCaps = [...childCaps, ...smallCaps];
    const nearFig = (x, y, m) => allCaps.some(c => E.segDist(x, y, c.ax, c.ay, c.bx, c.by) <= c.r + m);
    const poolT = (x, y) => Math.hypot((x - MEET[0]) / 84, (y - MEET[1] - 6) / 44);
    // calm the field: quiet flat strokes over the busy furrow ridges,
    // warm at the heart of the pool, rejoining the field tones at the rim
    strokes(out, counter, {
      rng, n: 320,
      sample: rej(MEET[0] - 88, MEET[1] - 46, MEET[0] + 88, MEET[1] + 52,
        (x, y) => y > horizon(x) + 4 && poolT(x, y) <= 1 && !nearFig(x, y, 2.5)),
      dir: groundDir,
      col: (x, y, r) => jig(ramp([mix(GOLD, '#7d6c30', 0.4), '#6e602e', '#4a4a33', '#323a50'], poolT(x, y)), r, 6),
      len: 24, lw: 4.6, steps: 2, follow: 0.9, aJ: 0.07, lenJ: 0.35, relief: 0,
    });
    // warmer light pool, brightest right at the meeting point
    strokes(out, counter, {
      rng, n: 150,
      sample: r => {
        const a = r() * Math.PI * 2, d = Math.pow(r(), 1.5) * 50;
        const x = MEET[0] + Math.cos(a) * d * 1.5, y = MEET[1] + 9 + Math.sin(a) * d * 0.4;
        return nearFig(x, y, 2) ? null : [x, y];
      },
      dir: groundDir,
      col: (x, y, r) => jig(ramp([mix(GOLD, '#9a8440', 0.2), '#8a7634', '#5d5530'], Math.hypot((x - MEET[0]) / 1.5, (y - MEET[1]) * 1.5) / 60), r, 7),
      len: 12, lw: 2.6, steps: 2, aJ: 0.06, relief: 0,
    });
    // re-lay both pilgrims on top of the calmed pool, brighter
    E.paintMask(out, counter, rng, {
      x: 296, y: fy, h: 40, facing: 1, kneel: true, lean: 3,
      armR: [316, fy - 15], armL: [313, fy - 12],
      eye: [1, 0.2], mood: 'joy',
    });
    E.paintMask(out, counter, rng, {
      x: 341, y: fy, h: 32, facing: -1, lean: -2,
      armL: [328, fy - 12], armR: [331, fy - 10],
      cols: ['#26304a', '#161c30', '#0e131f'],
      maskCols: ['#b8b2a4', '#a29c8e', '#847e70'],
      eye: [-1, 0.2], mood: 'wonder',
    });
    // the loaf again, on top of the repainted hands — still the brightest
    // thing below the horizon
    {
      const bx = 320, by = fy - 12;
      strokes(out, counter, {
        rng, n: 52,
        sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 1.4) * 6.5; return [bx + Math.cos(a) * d * 1.4, by + Math.sin(a) * d * 0.8]; },
        dir: () => 0.1,
        col: (x, y, r) => jig(ramp([GOLD_HOT, GOLD_PALE, '#c89a58'], Math.hypot(x - bx, y - by) / 8.5), r, 7),
        len: 4.5, lw: 2.1, steps: 2, relief: 0,
      });
    }
    // fresh rim-light on both sun-side flanks
    strokes(out, counter, {
      rng, n: 22,
      sample: rej(288, fy - 46, 318, fy, (x, y) => childCaps.some(c => inCap(x, y, c)) && !childCaps.some(c => inCap(x + 3.5, y - 3.5, c))),
      dir: () => -Math.PI / 3,
      col: (x, y, r) => jig(mix(GOLD_DEEP, '#a8742c', r() * 0.5), r, 9),
      len: 3.5, lw: 1.4, steps: 2, relief: 0,
    });
    strokes(out, counter, {
      rng, n: 16,
      sample: rej(330, fy - 34, 352, fy, (x, y) => smallCaps.some(c => inCap(x, y, c)) && !smallCaps.some(c => inCap(x + 3.5, y - 3.5, c))),
      dir: () => -Math.PI / 3,
      col: (x, y, r) => jig(mix(GOLD_DEEP, '#8a6230', r() * 0.5), r, 9),
      len: 4, lw: 1.5, steps: 2, relief: 0,
    });
  }
  fgRanges.push([_fgFigs, out.length]);   // ← the bread-sharing figures are foreground

  // FRUITFUL field — fruit-trees in crazy free colour to the sunward right,
  // clear of the bread-sharing figures and the shadowed-corner trophy (Isa 35:1)  [FG plane]
  // a field FRINGE along the horizon so the sky↔field seam reads organic (MID)
  // DISTANT HILLS on their own FAR plane — the rolling skyline parallaxes against
  // both the sky and the field, so the horizon has real moving depth.

  E.horizonFringe(out, counter, rng, { horizonFn: horizon, x0: -10, x1: 810, cols: ['#2e3a55', '#4a4a33', '#6e602e', '#8a7634'], hMax: 18, lightFn: light, seed: 303 });
  // fruit-trees PLANTED in the field (MID) — base stays with the ground on the pan
  E.fruitTree(out, counter, rng, 700, 444, 60, 28, E.LEAF_PALETTES[0], light, 1, { species: 'cedar' });   // "the cedars of Lebanon, which he hath planted" (Ps 104:16)
  E.fruitTree(out, counter, rng, 470, 360, 44, 21, E.LEAF_PALETTES[2], light, 1, { species: 'palm' });    // "flourish like the palm tree" (Ps 92:12)

  // EASTER EGG — 1 John 4:8 ("God is love") in its ORIGINAL KOINE GREEK numerals,
  // Δʹ·Ηʹ (Δ=4, Η=8), cut into the dark field — the page's own verse, in the tongue
  // John wrote it. A light incision on the dark earth (MID plane).
  E.inscriptionText(out, E.greekRef(4, 8), { x: 402, y: 474, h: 18, body: '#efe4c4', edge: '#19140a', op: 0.85, edgeOp: 0.55 });

  /* ---------------- 8. LIFE — the loved field blossoms ----------------
     "O LORD, how manifold are thy works!... the earth is full of thy riches"
     (Ps 104:24). Wildflowers thicken the furrows (Isa 35:1), butterflies rise
     over the sharing; the bird pair crosses the sun up in the sky band.
     Own rng — appended after everything, nothing upstream re-rolls.
     Kept clear of: the two figures + loaf, the Δʹ·Ηʹ egg at (402,474), and
     the shadow corner (lifeless by design). */
  {
    const lrng = mulberry32(seed + 20260707);
    const clearOf = (x, y) =>
      !(x > 260 && x < 374 && y > 370 && y < 436) &&   // the figures + the loaf
      !(x > 376 && x < 484 && y > 448) &&              // the Greek-numeral egg
      !(x < 224 && y > 352);                           // the lifeless corner stays lifeless
    // THICKER WILDFLOWERS — jewel dots through the furrows, larger toward the near edge
    E.groundFlowers(out, counter, lrng, {
      x0: -6, y0: 348, x1: 812, y1: 508, n: 300,
      // ⚠ THE FLOWERS' EDGE WAS THE STRAIGHT LINE (Fred: "i can see a straight line, this
      // should be textured, grass etc is not straight"). The colour of the field runs
      // perfectly smooth through here — I measured it, no step over 45 units — but the
      // wildflowers all began on ONE contour, `horizon + 22`, so a wall of bright pastel
      // dots started along a single curve and the eye read the join as ruled. A meadow
      // does not begin; it thins out. So the threshold now WANDERS by up to ~55 units on
      // slow noise, and a scatter still gets through above it, so the band has no edge.
      mask: (x, y) => {
        const edge = horizon(x) + 16 + 56 * fbm(x / 96, 4.2, 55);
        if (y > edge) return clearOf(x, y);
        return y > horizon(x) + 8 && fbm(x / 12, y / 9, 57) > 0.62 && clearOf(x, y);
      },
      lightFn: light,
      depthFn: (x, y) => Math.min(1, Math.max(0, (y - 330) / 180)),
    });
    // a few taller near tufts — curved stems (Munch: living = curved), bold bright heads
    const tuft = (tx, ty, s, head) => {
      paintPath(out, counter, lrng, [[tx, ty], [tx + 2 * s, ty - 7 * s], [tx + s, ty - 13 * s]],
        (x, y, r) => jig(mix('#4b6a37', '#93a344', r()), r, 6), { lw: 1.5 * s, len: 4, density: 0.9, jitter: 0.4 });
      paintPath(out, counter, lrng, [[tx + s, ty - 13 * s], [tx + s, ty - 16 * s]],
        (x, y, r) => jig(mix(head, '#fff0c0', r() * 0.3), r, 9), { lw: 3.2 * s, len: 2.5, density: 1, jitter: 0.6 });
    };
    tuft(247, 480, 1.6, '#ee5c84');  // rose — left of the pool, above the corner line
    tuft(505, 452, 1.2, '#5ec0e0');  // sky-blue — right of the egg, mid field
    tuft(556, 472, 1.5, '#b77ce0');  // violet — toward the near tree
    tuft(598, 492, 1.8, '#f6c63e');  // gold — nearest, biggest
    // BUTTERFLIES — four bold curved wing-lobes + a dark stitched body (the
    // proven risen pattern). One MID by the tree, two FG over the sharing.
    const butterfly = (bx, by, s, wing, body) => {
      const wc = (x, y, r) => jig(wing, r, 6);
      paintPath(out, counter, lrng, [[bx - 1.2 * s, by - 0.5 * s], [bx - 5.5 * s, by - 4.5 * s], [bx - 8 * s, by - 1 * s], [bx - 3.5 * s, by + 0.8 * s]], wc, { lw: 2.4 * s, len: 3, density: 0.95, jitter: 0.4 });
      paintPath(out, counter, lrng, [[bx + 1.2 * s, by - 0.5 * s], [bx + 5.5 * s, by - 4.5 * s], [bx + 8 * s, by - 1 * s], [bx + 3.5 * s, by + 0.8 * s]], wc, { lw: 2.4 * s, len: 3, density: 0.95, jitter: 0.4 });
      paintPath(out, counter, lrng, [[bx - 1 * s, by + 1 * s], [bx - 4 * s, by + 4 * s], [bx - 1.5 * s, by + 4.8 * s]], wc, { lw: 2 * s, len: 2.5, density: 0.95, jitter: 0.4 });
      paintPath(out, counter, lrng, [[bx + 1 * s, by + 1 * s], [bx + 4 * s, by + 4 * s], [bx + 1.5 * s, by + 4.8 * s]], wc, { lw: 2 * s, len: 2.5, density: 0.95, jitter: 0.4 });
      paintPath(out, counter, lrng, [[bx, by - 3 * s], [bx + 0.6 * s, by], [bx, by + 3.5 * s]],
        (x, y, r) => jig(body, r, 5), { lw: 1.1 * s, len: 2.5, density: 1, jitter: 0.2 });
    };
    butterfly(592, 400, 1.5, '#b77ce0', '#2a1c3e');  // violet — MID, by the right fruit-tree
    const _fgLife = out.length;
    // dark pocket behind the pale butterfly (LOCAL-hue rule: pale needs dark behind)
    strokes(out, counter, {
      rng: lrng, n: 26,
      sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 0.7) * 13; return [376 + Math.cos(a) * d, 371 + Math.sin(a) * d * 0.8]; },
      dir: groundDir, col: (x, y, r) => jig(mix('#141a30', '#232c48', r()), r, 5),
      len: 8, lw: 3, steps: 2, relief: 0,
    });
    butterfly(262, 386, 1.6, '#e05a78', '#401a30');   // coral — dark furrows behind, left of the child
    butterfly(376, 371, 1.45, '#f4e9cc', '#2c3a2e');  // cream — on its dark pocket, right of the friend
    fgRanges.push([_fgLife, out.length]);   // the near pair flutters with the children
  }

  /* ---------------- LOVE, AS HE DREW IT HIMSELF (Sep 23) ----------------
     1 John 4:8 says "God is love"; the page asks "What was He like?" — and Jesus answered
     that in a picture: "how often would I have gathered thy children together, even as a
     hen gathereth her chickens under her wings" (Matt 23:37). So in the sunlit meadow beside
     the child, a brown hen sits with her wing lowered and spread, two chicks peeping out from
     under it and one at her breast looking up. It is the plainest picture of love a small
     child already knows. FG plane — the plane the child moves with. Own rng. */
  {
    const _hen = out.length;
    // ⚠ first cut: a BROWN hen at h28 vanished into the meadow's confetti — no value against the
    // grass. White, bigger, and sat in a pocket of deep shaded grass so she and the yellow chicks read.
    strokes(out, counter, {
      rng: mulberry32(seed + 2338), n: 150,
      sample: r => { const a = r() * Math.PI * 2, d = Math.sqrt(r()); return [452 + Math.cos(a) * 34 * d, 418 + Math.sin(a) * 12 * d]; },
      dir: () => -Math.PI / 2 + 0.15, col: (x, y, r) => E.jig(E.mix('#1f4a2a', '#2f6a34', r()), r, 5),
      len: 7, lw: 2.4, steps: 2, lenJ: 0.5, relief: 0.2, flow: 0, op: 0.9,
    });
    E.paintHen(out, counter, mulberry32(seed + 2337), 452, 426, 38, { facing: -1, chicks: 3, lightSide: 1, white: true });
    fgRanges.push([_hen, out.length]);
  }

  // MULTIPLANE: assemble the requested depth plane. Each is its own cel —
  // transparent where it has no content — so they stack and parallax apart.
  const ALT = 'A great swirling golden sun pours light over lilac hills onto a green meadow full of wildflowers, where a small child kneels in the sunlight with butterflies rising around him and a white rabbit nearby. Beside him in the grass a white hen sits with her wing spread low, two yellow chicks peeping out from under it and a third standing at her breast looking up at her — as a hen gathers her chickens under her wings. Everything He made, He made for love.';
  const RAW = { undercoat: 0, weave: 0, varnish: 0, oil: 0 };   // no baked surface — the live filter unifies the planes
  const setOf = ranges => { const s = new Set(); for (const [a, b] of ranges) for (let i = a; i < b; i++) s.add(i); return s; };
  const pick = ranges => ranges.map(([a, b]) => out.slice(a, b).join('\n')).join('\n');
  const farSet = setOf(farRanges), fgSet = setOf(fgRanges);
  if (LAYER === 'sky') return svgWrap(ALT, out.slice(0, skyEnd).join('\n'), RAW);   // smooth sky ground + great sun (opaque)
  const sm = LAYER.match(/^sky(\d+)$/);
  if (sm) return svgWrap(ALT, '<g>' + skySheets[+sm[1] - 1] + '</g>', RAW);         // one sky-swirl sheet
  if (LAYER === 'far') return svgWrap(ALT, pick(farRanges), RAW);                   // distant rolling hills
  if (LAYER === 'fg') return svgWrap(ALT, pick(fgRanges), RAW);                     // the bread-sharing figures
  if (LAYER === 'mid') {                                                            // field, prizes, fringe, planted trees
    const body = out.filter((_, i) => i >= skyEnd && !farSet.has(i) && !fgSet.has(i)).join('\n');
    return svgWrap(ALT, body, RAW);
  }
  // full painting (desktop): sky ground, the stacked sky-sheets (under the sun), then everything else
  return svgWrap(ALT, out.slice(0, groundEnd).concat(skySheets, out.slice(groundEnd)).join('\n'));
}
