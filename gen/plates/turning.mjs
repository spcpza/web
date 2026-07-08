// gen/plates/turning.mjs — "The turning" — the first refusal (§ between)
//
// THE MOMENT SIN ENTERED. Romans 5:12 — "by one man sin entered into the world."
// Not a place left behind but a CHOICE made: the recurring red child stands at the
// threshold of the frame, between two worlds. To the LEFT, the warm radiant GOLD
// Light he came from — flourishing, alive. To the RIGHT, a cold deep dark opening
// ahead (blue dying into violet). The child has turned his BACK to the gold and his
// FACE toward the shadow, and takes the first step in — and from his small body a
// long SHADOW falls back across the gold. The whole frame is one chiaroscuro hinge:
// gold dying into dark, the great refusal, the child the dark hinge between them.
//
// BONES: the threshold is the golden-ratio vertical near centre; the gold pools on
// the left and pours its dying warmth toward the child's feet; the dark on the right
// is not black but cobalt deepening to violet, alive with the cold he steps into.
// Munch rule: the Light and the land curve (living); nothing here runs ruled. No
// pure black — the dark is colour. The contrast IS the story.
export const name = 'turning';
export const title = 'The turning';
export const caption = 'But you turned away.';
export const seed = 20260617;
export const focal = { x: 400, y: 260 };  // the child at the threshold, mid-step
// MOBILE 3D — depth planes (FAR→NEAR): the whole chiaroscuro FIELD behind (the cold
// dark, the radiant gold, the threshold seam, the long shadow cast on the ground, and
// the verse cut into the dark) is the opaque BACKGROUND; the small RED CHILD on the
// threshold is the FOREGROUND, nearest, parallaxing free of the field he stands on.
export const layers = [
  { name: 'bg', opaque: true },  // gold/dark field + seam + cast shadow + verse (backmost, opaque)
  { name: 'fg' },                // the red child, turning (nearest)
];

export function paint(E, opts = {}) {
  const {
    mulberry32, fbm, curlV, goldenSpiralV, lightRadial, mix, ramp, jig,
    strokes, rej, paintChild, personCaps, paintPath, segDist, ribbon,
    inscriptionText, greekRef, svgWrap, R1, W, H,
    GOLD, GOLD_PALE, GOLD_DEEP, GOLD_HOT,
  } = E;

  const rng = mulberry32(seed);
  const out = [];
  const counter = { n: 0 };
  // MOBILE 3D LAYERS: tag ranges per band; BG = the whole field, FG = the red child.
  const LAYER = opts.layer || 'full';
  const fgRanges = [];

  // the deepest dark here is a deep cobalt→violet — never black. The right of the
  // frame opens into it; the left blazes gold. The child stands on the seam.
  out.push(`<rect width="${W}" height="${H}" fill="#171232"/>`);

  /* ====================== THE BONES ====================== */
  // the threshold: the golden-ratio vertical, a little left of centre, where gold
  // meets dark and where the child stands.
  const THRESH = 372;
  // the gold light source sits low-left, the world the child came from; its warmth
  // pours rightward and dies as it crosses the threshold.
  const GX = 150, GY = 300;
  const goldR = lightRadial(GX, GY, 250);
  // a second, broad pour from the whole left field so the gold reads as a place,
  // not a single lamp — warm everywhere left of the threshold, dying to the right.
  const warm = (x, y) => {
    const radial = goldR(x, y);
    const field = Math.max(0, 1 - Math.max(0, x - 70) / 360);          // bright far-left, fading right
    return Math.min(1, radial * 0.7 + field * 0.7);
  };
  // the cold reaches in from the right, deepening toward the far corner.
  const cold = (x, y) => Math.max(0, Math.min(1, (x - THRESH + 40) / 360 + (y / H - 0.4) * 0.3));

  /* ====================== 1. THE COLD DARK (right) ====================== */
  // a deep cobalt→violet field, alive with cold curling air — the dark the child
  // steps into. Long strokes curl (Munch: the living dark is not ruled).
  const darkDir = (x, y) => {
    const [a, b] = curlV(x, y, 33, 150);
    return Math.atan2(-0.3 + b * 2.2, 0.5 + a * 2.2);     // a slow cold drift, downward-right
  };
  const darkCol = (x, y, r) => {
    const t = Math.max(0, Math.min(1, (x - THRESH) / (W - THRESH) * 0.7 + (y / H) * 0.4 + fbm(x / 120, y / 110, 61) * 0.3));
    let c = ramp(['#1f2a5e', '#242060', '#2a1c66', '#33205e', '#3a1f52'], t);   // cobalt → violet, deepening right
    // a breath of complementary cold-orange spark where the gold's last warmth dies
    const w = warm(x, y);
    if (w > 0.12 && w < 0.26 && r() < 0.045) return jig('#a6663a', r, 12);
    c = mix(c, '#c89a4a', Math.max(0, w - 0.2) * 0.9);     // the gold reaches a little into the near dark
    return jig(c, r, 9);
  };
  strokes(out, counter, {
    rng, n: 1500,
    sample: rej(THRESH - 70, -14, 814, 514),
    dir: darkDir, col: darkCol,
    len: 26, lw: 7, steps: 4, follow: 0.86, wild: 0.08, lenJ: 0.5, impasto: 0.4, relief: 0.45,
  });

  /* ====================== 2. THE RADIANT GOLD (left) ====================== */
  // the warm world the child came from: a blaze of gold, flourishing, curling like
  // living fire. Brightest low-left at the source, ripening gold→amber→green→blue
  // as it crosses toward the threshold and dies (the law of yellow).
  const goldDir = (x, y) => {
    let vx = 0.6, vy = -0.2;
    const [a, b] = goldenSpiralV(x, y, GX, GY, 70, 180, 1);    // the gold winds in a living spiral about its source
    vx += a; vy += b;
    const [c, d] = curlV(x, y, 31, 130);
    return Math.atan2(vy + d * 1.4, vx + c * 1.4);
  };
  const goldColF = (x, y, r) => {
    const g = warm(x, y);
    // where the gold dies near the threshold, ripen through green to cold (the
    // dying of the light), with a violet flicker at the very edge of death
    if (g > 0.12 && g < 0.26 && r() < 0.05) return jig('#8a5aa0', r, 13);
    let c = ramp([GOLD_HOT, GOLD_PALE, GOLD, '#e6a544', '#b08a3c', '#6f8a4c', '#3e6090'],
      Math.min(1, (1 - g) * 1.05));
    return jig(c, r, 8);
  };
  strokes(out, counter, {
    rng, n: 1400,
    sample: rej(-14, -14, THRESH + 50, 514, (x, y) => warm(x, y) > 0.16),
    dir: goldDir, col: goldColF,
    len: 24, lw: 7, steps: 5, follow: 0.9, wild: 0.12, lenJ: 0.5, impasto: 0.55, relief: 0.7,
  });
  // the burning core of the source, low-left — densest, white-hot gold
  strokes(out, counter, {
    rng, n: 360,
    sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 0.7) * 120; return [GX + Math.cos(a) * d, GY + Math.sin(a) * d * 0.95]; },
    dir: goldDir,
    col: (x, y, r) => jig(ramp([GOLD_HOT, mix(GOLD_HOT, GOLD_PALE, 0.5), GOLD_PALE, GOLD], Math.hypot(x - GX, y - GY) / 130), r, 6),
    len: 18, lw: 5, steps: 4, follow: 0.92, wild: 0.1, lenJ: 0.45, impasto: 0.6,
  });

  /* ====================== 3. THE THRESHOLD SEAM ====================== */
  // the hinge where gold dies into dark — a vertical band of green-into-violet
  // transition strokes, the very edge of the refusal. Living, curved, not a ruled
  // line: the seam breathes.
  const seamX = x => THRESH + 14 * Math.sin(x * 0.02) + fbm(x / 30, 9, 88) * 20;
  strokes(out, counter, {
    rng, n: 520,
    sample: rej(THRESH - 64, -14, THRESH + 80, 514),
    dir: (x, y) => -Math.PI / 2 + (fbm(x / 22, y / 22, 91) - 0.5) * 1.4,
    col: (x, y, r) => {
      const t = Math.max(0, Math.min(1, (x - (THRESH - 60)) / 140 + fbm(x / 30, y / 30, 93) * 0.2));
      // gold dying → green → teal → violet → cold cobalt across the seam
      return jig(ramp(['#caa24c', '#9a9450', '#5f8a5e', '#3e7066', '#3a4a72', '#33205e'], t), r, 9);
    },
    len: 14, lw: 4, steps: 3, follow: 0.9, lenJ: 0.5, impasto: 0.4, relief: 0.5,
  });

  /* ====================== 4. THE LONG SHADOW ====================== */
  // from the child's feet a long shadow is cast BACK across the gold (the source is
  // low-left, so the shadow stretches up-left into the warmth it is refusing). A
  // soft elongated dark pour over the bright ground — the first shadow a body casts
  // when it turns from the light. Curved, dragging.
  const FX = 388, FY = 318;            // the child's feet on the threshold
  const shadowSpine = t => [FX - t * 150, FY - t * 96];   // back toward the low-left source
  const shadow = (x, y) => {
    let g = 0;
    for (let i = 0; i <= 9; i++) {
      const t = i / 9, p = shadowSpine(t);
      const w = 16 + t * 30;           // widens away from the feet
      g = Math.max(g, (0.9 - t * 0.55) * Math.exp(-segDist(x, y, p[0], p[1], p[0] + 0.1, p[1]) / w));
    }
    return g;
  };
  strokes(out, counter, {
    rng, n: 620,
    sample: rej(180, 200, FX + 30, 380, (x, y) => shadow(x, y) > 0.2),
    dir: () => Math.atan2(-96, -150) + 0.05,    // dragging along the shadow's length
    col: (x, y, r) => {
      const s = shadow(x, y);
      // the shadow is the gold gone cold-violet — a deep dim of the warm ground, not black
      const base = ramp([GOLD, '#b08a3c', '#6a5a52'], Math.min(1, 0.4 + fbm(x / 40, y / 40, 95) * 0.4));
      return jig(mix(base, '#241a48', Math.min(0.85, s * 0.95)), r, 8);
    },
    len: 18, lw: 5, steps: 3, follow: 0.94, lenJ: 0.5, relief: 0.5,
  });

  /* ====================== 4b. THORNS AND THISTLES (Gen 3:18) ====================== */
  // "Thorns also and thistles shall it bring forth" — the ground's first answer to
  // the turning. Creeping briars enter from the DARK side only, curling low along
  // the ground toward the threshold — the fall's own kind of life: curved (living,
  // Munch) but barbed. Deep violet-black silhouettes, subdued, darker than the
  // cobalt dark behind them, with the faintest cold lilac catch on a few barb tips.
  // The gold side he is leaving stays clean.
  const thornCol = (x, y, r) => jig(mix('#140f2c', '#26194a', r() * 0.45), r, 6);
  const briar = (x0, y0, x1, y1, arch, s, dim) => {
    const N = 8, pts = [];
    for (let i = 0; i <= N; i++) {
      const t = i / N;
      pts.push([x0 + (x1 - x0) * t, y0 + (y1 - y0) * t - Math.sin(t * Math.PI) * arch + Math.sin(t * 8.6) * 2.4 * s]);
    }
    paintPath(out, counter, rng, pts, thornCol, { lw: 1.9 * s, len: 4, density: 0.75, jitter: 0.7 });
    // the deepest briars would drown in their own dark — a faint moonlit top
    // edge along the spine keeps them findable without breaking the hush
    if (dim) paintPath(out, counter, rng, pts.map(p => [p[0], p[1] - 1.6 * s]), (x, y, r) => jig('#5a4a8e', r, 8), { lw: 0.9 * s, len: 3, density: 0.5, jitter: 0.4 });
    for (let i = 1; i < N; i++) {
      const p = pts[i], up = i % 2 ? -1 : 1, bl = (5 + rng() * 3) * s;
      // each barb a small back-curling hook off the spine
      paintPath(out, counter, rng,
        [[p[0], p[1]], [p[0] - bl * 0.45, p[1] + up * bl * 0.7], [p[0] - bl * 0.95, p[1] + up * bl * 1.25]],
        thornCol, { lw: 1.3 * s, len: 3, density: 0.85, jitter: 0.45 });
      if (rng() < 0.35) {   // the cold catch — a lilac glint on the hook's very tip
        out.push(ribbon([[p[0] - bl * 0.95, p[1] + up * bl * 1.25], [p[0] - bl * 1.12, p[1] + up * bl * 1.48]], 1.1 * s, jig('#8a76b4', rng, 10)));
        counter.n++;
      }
    }
  };
  // three briars creeping in from the right, the nearest reaching toward the
  // threshold (never touching the child), the deepest small with distance (1/Z)
  briar(560, 372, 448, 348, 15, 1.0);
  briar(672, 398, 556, 364, 13, 0.85, 1);
  briar(782, 344, 692, 326, 9, 0.62, 1);
  // thistles — standing barbs with a dusky mauve crown (the one accent that reads)
  const thistle = (bx, by, h, s) => {
    const tx = bx - 1.5 * s, ty = by - h;                     // head centre
    paintPath(out, counter, rng, [[bx, by], [bx + 2.5 * s, by - h * 0.52], [tx, ty + 3 * s]], thornCol, { lw: 1.6 * s, len: 3.5, density: 0.7, jitter: 0.6 });
    paintPath(out, counter, rng, [[bx + 1.5 * s, by - h * 0.44], [bx + 6.5 * s, by - h * 0.52], [bx + 9.5 * s, by - h * 0.4]], thornCol, { lw: 1.2 * s, len: 3, density: 0.8, jitter: 0.5 });
    paintPath(out, counter, rng, [[bx + 0.5 * s, by - h * 0.62], [bx - 5 * s, by - h * 0.7], [bx - 8 * s, by - h * 0.6]], thornCol, { lw: 1.2 * s, len: 3, density: 0.8, jitter: 0.5 });
    // the head: a small egg of dusky mauve, spiked crown fanning up
    strokes(out, counter, {
      rng, n: Math.round(16 * s),
      sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 0.7); return [tx + Math.cos(a) * 3.4 * s * d, ty - Math.abs(Math.sin(a)) * 4.2 * s * d]; },
      dir: () => -Math.PI / 2 + (rng() - 0.5) * 0.5,
      col: (x, y, r) => jig(ramp(['#4a3560', '#6a4a7a', '#8a6296'], r()), r, 8),
      len: 4, lw: 1.6 * s, steps: 2, lenJ: 0.4,
    });
    for (let k = -2; k <= 2; k++) {   // the crown's spikes
      const a = -Math.PI / 2 + k * 0.32;
      paintPath(out, counter, rng, [[tx, ty - 3 * s], [tx + Math.cos(a) * 5.5 * s, ty - 3 * s + Math.sin(a) * 5.5 * s]],
        (x, y, r) => jig('#8a6296', r, 9), { lw: 1.0 * s, len: 2.5, density: 0.9, jitter: 0.4 });
    }
  };
  thistle(524, 346, 30, 0.9);    // inside the portrait window, on the dark ground he walks toward
  thistle(596, 356, 34, 1.0);
  thistle(742, 318, 22, 0.62);   // deep in the dark, small with distance

  /* ====================== 4c. ONE WITHERED LEAF (the first small death) ====================== */
  // a single withered leaf falling in the air behind him, over the dying gold —
  // the first thing to die follows him down. Tilted mid-tumble, curved (living).
  {
    const LX = 348, LY = 178;
    const leafCol = (x, y, r) => jig(ramp(['#1f1206', '#33200e', '#4a2e16'], r()), r, 6);
    // a SOLID dark pointed-oval silhouette (shape reads; texture drowns): outline
    // arcs plus packed body strokes, one pale dry vein, the stem trailing up
    paintPath(out, counter, rng, [[LX - 12, LY - 2], [LX - 3, LY - 10], [LX + 10, LY - 1]], leafCol, { lw: 2.2, len: 3.5, density: 1.1, jitter: 0.35 });  // upper arc
    paintPath(out, counter, rng, [[LX - 12, LY - 2], [LX - 2, LY + 6], [LX + 10, LY - 1]], leafCol, { lw: 2.2, len: 3.5, density: 1.1, jitter: 0.35 });   // lower arc
    paintPath(out, counter, rng, [[LX - 8, LY - 5], [LX + 6, LY - 3]], leafCol, { lw: 2.0, len: 3, density: 1.0, jitter: 0.3 });                          // body fill, high
    paintPath(out, counter, rng, [[LX - 10, LY - 3], [LX + 8, LY - 1]], leafCol, { lw: 2.4, len: 3.2, density: 1.0, jitter: 0.3 });                       // body fill, mid
    paintPath(out, counter, rng, [[LX - 9, LY + 1], [LX + 7, LY]], leafCol, { lw: 2.2, len: 3, density: 1.0, jitter: 0.3 });                              // body fill, low
    paintPath(out, counter, rng, [[LX + 10, LY - 1], [LX + 15, LY + 4]], leafCol, { lw: 1.3, len: 2.5, density: 1.0, jitter: 0.25 });                     // dry stem, trailing up as it tumbles
    paintPath(out, counter, rng, [[LX - 8, LY - 2], [LX + 6, LY - 1]], (x, y, r) => jig('#b08448', r, 8), { lw: 0.9, len: 2.6, density: 0.8, jitter: 0.25 }); // one pale dry vein
  }

  const bgEnd = out.length;   // BG plane: the whole chiaroscuro field — dark, gold, seam, shadow, thorns + leaf (opaque)

  /* ====================== 5. THE FIGURE — you, turning away (FG plane) ====================== */
  const _fgChild = out.length;
  // ONE small figure — YOU, the recurring red child — standing on the threshold,
  // mid-step, BACK to the gold (left), FACE toward the dark (right). The leading
  // leg reaches into the shadow; the body leans forward into the dark. The first
  // step of the great refusal.
  const f1x = FX, f1y = FY;
  const caps1 = personCaps(f1x + 4, f1y - 76, 74, {
    lean: 8,                                 // leaning into the stride, walking away into the dark
    // a real WALKING stride: leading leg planted forward, trailing leg back with the
    // heel lifted, pushing off — and the arms swing in natural opposition.
    rightFoot: [f1x + 28, f1y],              // LEADING leg, planted forward into the dark
    leftFoot: [f1x - 22, f1y - 7],           // TRAILING leg back, heel lifted — mid-step push-off
    leftHand: [f1x + 22, f1y - 44],          // forward arm swinging into the shadow (opposite the leading leg)
    rightHand: [f1x - 16, f1y - 40],         // back arm swinging behind — natural walk
    headTilt: 4,
  });
  paintChild(out, counter, rng, caps1);
  // a gold rim on the child's LEFT (back) side — the light he is turning from still
  // catches his shoulder and trailing limbs
  paintPath(out, counter, rng, [[f1x - 7, f1y - 64], [f1x - 9, f1y - 46], [f1x - 12, f1y - 24], [f1x - 6, f1y - 6]],
    (x, y, r) => jig(mix(GOLD_DEEP, GOLD_PALE, r() * 0.5), r, 9), { lw: 1.4, len: 3, density: 0.6, jitter: 1.0 });
  // a cold violet rim on the child's RIGHT (front) side — the dark already touching him
  paintPath(out, counter, rng, [[f1x + 14, f1y - 60], [f1x + 16, f1y - 38], [f1x + 18, f1y - 14]],
    (x, y, r) => jig(mix('#3a4a82', '#6a5a9a', r() * 0.6), r, 9), { lw: 1.2, len: 3, density: 0.55, jitter: 1.0 });
  fgRanges.push([_fgChild, out.length]);   // ← the red child is the foreground

  /* ====================== 6. EASTER EGG — Romans 5:12 ====================== */
  // "By one man sin entered into the world" — the verse of the first turning, in
  // its original GREEK numerals (Εʹ·ΙΒʹ = 5:12), cut LIGHT into the cold dark on the
  // right side: a faint luminous incision in the shadow the child walks toward.
  inscriptionText(out, greekRef(5, 12), { x: 620, y: 430, h: 15, body: '#cdbce6', edge: '#1a153a', op: 0.5, edgeOp: 0.55 });

  const ALT = 'A child stands at a threshold in the centre of the frame, between two worlds: to the left a blaze of radiant gold light, flourishing and alive; to the right a deep cold dark of cobalt deepening into violet. The small red child has turned his back to the gold and his face to the shadow, taking the first step into the dark, and from his feet a long shadow falls back across the gold. Barbed briars and dusky thistles creep in low from the dark edge he walks toward, and one withered leaf falls through the air behind him. The whole picture is one chiaroscuro hinge, gold dying into dark — the first turning, the great refusal.';

  // MULTIPLANE: assemble the requested depth plane. Each is its own cel —
  // transparent where it has no content — so they stack and parallax apart.
  const RAW = { undercoat: 0, weave: 0, varnish: 0, oil: 0 };   // no baked surface — the live filter unifies the planes
  const setOf = ranges => { const s = new Set(); for (const [a, b] of ranges) for (let i = a; i < b; i++) s.add(i); return s; };
  const pick = ranges => ranges.map(([a, b]) => out.slice(a, b).join('\n')).join('\n');
  const fgSet = setOf(fgRanges);
  if (LAYER === 'fg') return svgWrap(ALT, pick(fgRanges), RAW);                    // the red child (nearest)
  if (LAYER === 'bg') {                                                            // the whole chiaroscuro field + seam + shadow + verse (opaque)
    const body = out.filter((_, i) => !fgSet.has(i)).join('\n');
    return svgWrap(ALT, body, RAW);
  }
  // full painting (desktop): the original order, unchanged
  return svgWrap(ALT, out.join('\n'));
}
