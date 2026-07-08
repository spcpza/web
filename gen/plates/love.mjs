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
const SKY_SHEETS = [
  { n: 176, len: 32, lw: 7.0, lift: 0.00 },
  { n: 192, len: 28, lw: 6.5, lift: 0.07 },
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

  /* ---------------- 1. SKY FIELD ---------------- */
  out.push(`<rect width="${W}" height="${H}" fill="${DARKEST}"/>`);

  const SUN = { x: 472, y: 128, r: 58 };           // the ONE light source
  const light = lightRadial(SUN.x, SUN.y, 255);    // generous reach — it touches everything
  const horizon = x => 318 + 10 * Math.sin(x / 170) - x * 0.02;

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
    rng, n: 270, sample: rej(-10, -10, 810, 345, (x, y) => y < horizon(x) + 10),
    dir: skyDir, col: (x, y, r) => skyCol(x, y, r, 0),
    len: 44, lw: 9.5, steps: 4, follow: 0.91, wild: 0.05, aJ: skySlash, lenJ: 0.5, impasto: 0.5, relief: 0.55,
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
      len: e.len, lw: e.lw, steps: 5, follow: 0.91, wild: 0.08, lenJ: 0.55, impasto: 0.6, relief: 0.5,
      aJ: skySlash,
    });
    return sh.join('\n');
  });

  /* ---------------- 2. THE SUN ---------------- */
  // long radiating rays first (under the disk), like the Sower's sun
  strokes(out, counter, {
    rng, n: 430,
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
    len: 30, lw: 3.4, steps: 3, follow: 0.95, wild: 0.08, lenJ: 0.5,
  });
  // concentric ray-swirl rings around the disk
  strokes(out, counter, {
    rng, n: 300,
    sample: r => { const a = r() * Math.PI * 2, d = SUN.r + 2 + r() * 34; return [SUN.x + Math.cos(a) * d, SUN.y + Math.sin(a) * d]; },
    dir: (x, y) => Math.atan2(y - SUN.y, x - SUN.x) + Math.PI / 2 + 0.12,
    col: (x, y, r) => jig(ramp([GOLD_HOT, GOLD_PALE, GOLD], (Math.hypot(x - SUN.x, y - SUN.y) - SUN.r) / 36), r, 8),
    len: 15, lw: 2.8, steps: 3, follow: 0.95,
  });
  lightEdge(out, counter, SUN.x, SUN.y, SUN.r);   // dark contrast ring at the sun's rim
  // the disk itself: dense bright core
  strokes(out, counter, {
    rng, n: 330,
    sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 0.7) * SUN.r; return [SUN.x + Math.cos(a) * d, SUN.y + Math.sin(a) * d]; },
    dir: (x, y) => Math.atan2(y - SUN.y, x - SUN.x) + Math.PI / 2,
    col: (x, y, r) => jig(ramp(['#fffdf0', GOLD_HOT, GOLD_PALE, GOLD], Math.hypot(x - SUN.x, y - SUN.y) / SUN.r), r, 6),
    len: 11, lw: 3, steps: 2, wJ: 0.5, lenJ: 0.5,
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
  const groundCol = (x, y, r) => {
    const g = light(x, y);
    const band = fbm(x / 50, y / 26, 41); // furrow striping
    let c = ramp(['#1c2342', '#2e3a55', '#4a4a33', '#6e602e'], Math.min(1, g * 1.15 + band * 0.14));
    c = mix(c, '#5a3f70', Math.max(0, 0.16 - g) * 1.2); // cold violet seeps into the unlit corner
    return jig(c, r, 6);
  };
  strokes(out, counter, { rng, n: 700, sample: rej(-10, 300, 810, 510, (x, y) => y > horizon(x)), dir: groundDir, col: groundCol, len: 44, lw: 6, steps: 3, follow: 0.9, wild: 0.06, lenJ: 0.4 });
  // horizon band: tighter strokes along the crest, catching the sun
  strokes(out, counter, {
    rng, n: 260,
    sample: rej(-10, 290, 810, 360, (x, y) => y > horizon(x) && y < horizon(x) + 26),
    dir: x => { const e = 6; return Math.atan2(horizon(x + e) - horizon(x - e), 2 * e); },
    col: (x, y, r) => jig(mix('#3a4060', GOLD_DEEP, light(x, y) * 0.6), r, 8),
    len: 22, lw: 3.2, steps: 3, wild: 0.06,
  });
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
  const childCaps = personCaps(296, fy - 40, 40, {
    lean: 3,
    rightHand: [316, fy - 15], leftHand: [313, fy - 12],   // both arms extended, offering the loaf
    leftFoot: [291, fy], rightFoot: [301, fy],
  });
  // THE MAIN CHARACTER — "you": consistent deep-red clothes + bold dark outline
  // so the reader can follow the same child across the whole book.
  castShadow(out, counter, childCaps, { dir: -0.5 });
  paintChild(out, counter, rng, childCaps);
  // smaller figure: dark silhouette, hands cupped to receive
  const smallCaps = personCaps(341, fy - 32, 32, {
    lean: -2,
    leftHand: [328, fy - 12], rightHand: [331, fy - 10],   // hands cupped to receive the loaf
    leftFoot: [337, fy], rightFoot: [345, fy],
  });
  underpaintCapsules(out, counter, smallCaps, '#10141f');
  paintFigure(out, counter, rng, smallCaps, (x, y, r) => jig(mix('#161c30', '#26304a', fbm(x / 12, y / 12, 101)), r, 6), 1.8, 0.55, 0.9);
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
    // dark halo behind both figures: breathing room between paint and silhouette
    underpaintCapsules(out, counter, childCaps.map(c => ({ ...c, r: c.r + 2.6 })), '#170a0e');
    underpaintCapsules(out, counter, smallCaps.map(c => ({ ...c, r: c.r + 2.4 })), '#0a0e1c');
    // solid underpaint again, then brighter figure strokes on top
    // THE MAIN CHARACTER repainted on top (consistent deep-red + bold outline)
    paintChild(out, counter, rng, childCaps);
    underpaintCapsules(out, counter, smallCaps, '#141a2c');
    paintFigure(out, counter, rng, smallCaps, (x, y, r) => jig(mix('#202a46', '#39466b', fbm(x / 12, y / 12, 107)), r, 6), 1.8, 0.55, 0.9);
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
  const _far = out.length;
  E.distantHills(out, counter, rng, { topFn: E.ridge(horizon, { amp: 24, freq: 200, bumps: 0.45, seed: 31 }), horizonFn: horizon, cols: ['#3f4a52', '#52603e', '#6e6e3a'], depth: 60, lightFn: light, seed: 31 });
  farRanges.push([_far, out.length]);
  E.horizonFringe(out, counter, rng, { horizonFn: horizon, x0: -10, x1: 810, cols: ['#2e3a55', '#4a4a33', '#6e602e', '#8a7634'], hMax: 18, lightFn: light, seed: 303 });
  // fruit-trees PLANTED in the field (MID) — base stays with the ground on the pan
  E.fruitTree(out, counter, rng, 700, 444, 60, 28, E.LEAF_PALETTES[0], light);
  E.fruitTree(out, counter, rng, 470, 360, 44, 21, E.LEAF_PALETTES[2], light);

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
      mask: (x, y) => y > horizon(x) + 22 && clearOf(x, y),
      lightFn: light,
      depthFn: (x, y) => Math.min(1, Math.max(0, (y - 330) / 180)),
    });
    // a few taller near tufts — curved stems (Munch: living = curved), bold bright heads
    const tuft = (tx, ty, s, head) => {
      paintPath(out, counter, lrng, [[tx, ty], [tx + 2 * s, ty - 7 * s], [tx + s, ty - 13 * s]],
        (x, y, r) => jig(mix('#3f5a35', '#6e7a3a', r()), r, 6), { lw: 1.5 * s, len: 4, density: 0.9, jitter: 0.4 });
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

  // MULTIPLANE: assemble the requested depth plane. Each is its own cel —
  // transparent where it has no content — so they stack and parallax apart.
  const ALT = 'A great swirling golden sun pours light onto a small child in deep red sharing bread with a smaller figure on a furrowed field; butterflies rise around them, a pair of birds crosses the sun, and wildflowers dot the furrows. In the shadowed corner, a gray trophy and megaphone stand untouched by the rays.';
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
