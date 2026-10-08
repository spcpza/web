// gen/plates/lost.mjs — "Lost" (the depth of lostness)
//
// ⚠ REDRAWN. Fred: "right now i dont know what you are depicting." He was right — the
// old plate was a vast cold swirl with a keyhole of lighter paint in the middle, which
// reads as the mouth of a cave, not as a child who cannot find his way home. A field
// of turbulence can carry a MOOD; it cannot say a sentence.
//
// The page's sentence is plain: "You went far into the dark. Then farther. You could
// not find the road. You could not find your way home." So the picture says exactly
// that, and it says it by CONTINUING THE PAGE BEFORE. On `turning` he had a road: it
// came out of the light behind us and ran away into the violet. Here is the same road,
// later — and it STOPS. Its last stones scatter and give out in the near-left, and past
// them there is nothing but trackless ground.
//
// Four statements, all of them things a child can read:
//   · the ROAD RUNS OUT — the eye follows it and finds it ends;
//   · his own FOOTPRINTS leave the last stone, wander, and come round in a CIRCLE back
//     to where he stands — he has been walking in his own tracks (this is what "could
//     not find the road" looks like from outside);
//   · he is TINY in a vast cold waste, alone with a few dead thistles;
//   · far off on the horizon, one small GOLD glimmer — home, still burning, out of
//     reach. He is turned back toward it. The Light never goes out in this book; it is
//     the distance that is the grief.
//
// No pure black — the dark is cobalt going violet, cold and alive. The glimmer is the
// only warm thing in the frame, which is what makes it read at that size (chiaroscuro).
// Hidden egg: Romans 6:23 (Greek numerals) incised low in the dark.
export const name = 'lost';
export const title = 'Lost';
export const caption = 'A long way from home, and lost.';
export const seed = 20260617;
export const focal = { x: 400, y: 300 };
// MOBILE 3D — the waste, the road's end, the tracks, the glimmer and the verse are the
// opaque BACKGROUND; the tiny figure rides a near FOREGROUND cel, so his smallness
// parallaxes against the immensity behind him.
// ⚠ THE SKY IS ITS OWN PLANE SO IT CAN MOVE. Fred: "i dont see any animations on the
// background whatsoever" — and the measurement agreed with him, not with me: the sky
// changed 0.00% between frames while the walker changed 15%, so what I had been calling
// a breath was only ever him. The boil is the wrong tool on a plate like this. It
// displaces stroke geometry, and this field is smooth, dark and low-contrast, so even an
// absurd test amplitude (flow 55px, band 6x) moved only 4% of the pixels: neighbouring
// marks are the same colour, so sliding them changes almost nothing. A page this quiet
// cannot be animated by wobbling its paint.
// What CAN move it is the plane itself. So the air is lifted off the ground and given a
// slow one-way drift (CLOUD_DRIFT — the same rig as the clouds on `flame`), which is a
// translation: it cannot be swallowed by low contrast, because the whole sheet travels.
export const layers = [
  // ⚠ THE OPAQUE BASE MUST NEVER BE THE THING THAT TRAVELS. Drifting it tore a dark strip
  // down the left edge — of course it did: it is the backdrop, and there is nothing behind
  // it to reveal but the page. The night holds still; only the cloud moves over it.
  { name: 'sky', opaque: true },  // the deep cold night — still
  { name: 'air' },                // the high streaks + the crows — DRIFTS
  { name: 'glim' },               // the far glimmer, alone on its cel — BREATHES
  { name: 'ground' },             // the waste, the scuff, the thistles, the verse — still
  { name: 'fg' },
];

export function paint(E, opts = {}) {
  const {
    mulberry32, fbm, curlV, mix, ramp, jig, strokes, rej,
    lightRadial, inscriptionText, greekRef,
    paintPath, ribbon, svgWrap, W, H, GOLD, GOLD_PALE, GOLD_HOT,
  } = E;

  const rng = mulberry32(seed);
  const out = [];
  const counter = { n: 0 };
  const LAYER = opts.layer || 'full';
  const fgRanges = [], glimRanges = [], skyRanges = [], airRanges = [];
  // ⭐ DETAIL PASS (Sep 8). EVERY STROKE DRAWS ITS OWN WIDTH AND LENGTH (Fred: "use no
  // rules, a paint stroke just exist because it exist"): two independent hashes per mark.
  // The deficit: beds at lw 18–21 and pills at lw 5–7 — a waste of lavender lozenges.
  const free = (x, y, salt) => { const n = Math.sin(x * 12.9898 + y * 78.233 + salt) * 43758.5453; return n - Math.floor(n); };
  const widthOf  = (x, y, salt) => 0.40 + 3.2 * Math.pow(free(x, y, salt), 2.6);
  const lengthOf = (x, y, salt) => 0.40 + 1.5 * Math.pow(free(x, y, salt + 17), 1.5);

  // ⚠ THE BED IS NOT NEARLY BLACK. Measured off the first build, the whole plate came
  // out at luminance 28-51: the strokes never cover completely, and every gap averages
  // the picture back down to whatever the rect underneath is. A night that reads as a
  // night — cobalt going violet, no black anywhere — has to START at a value you could
  // live with, because that is the colour half the finished paint will be.
  out.push(`<rect width="${W}" height="${H}" fill="#241d4e"/>`);

  /* ⚠⚠ VALUE (Sep 23). "You went far into the dark. Then farther." — and on the page this
     was the palest night in the book: the depth planes (which is what the reader sees; the
     flat JPG gets a varnish that darkens it and fooled the numbers) composited to a milky
     lavender, LIGHTER than `turning`, the page where he first walks into the dark. John
     12:35: "he that walketh in darkness knoweth not whither he goeth." The ground and sky
     palettes are the same hues taken down (ground ×0.62, sky ×0.8) and the moon's sheen on
     the ground halved, so the far gold glimmer is again the one warm light — "home, still
     burning, out of reach". */
  /* ====================== THE BONES ====================== */
  const HZ = 244;                       // the horizon — far, and empty the whole way along
  const VPX = 600, VPY = HZ + 4;        // the same vanishing point his road was heading for
  const GLX = 292, GLY = HZ - 4;   // ⚠ INSIDE the portrait window (plate x 244..556) — at 150 home was off-screen on a phone        // the far glimmer: home, on the horizon, behind him
  const CX = 396, CY = 352;             // where he stands (CAST1[7] — keep the two in step)
  const gl = lightRadial(GLX, GLY, 210);            // it lights almost nothing: that is the point
  const rec = (x, y) => Math.atan2(y - VPY, x - VPX);
  /* ⭐ THE BEAUTY OF THE DARK (Sep 12). Fred: "nothing structurally wrong is the wrong way to see
     things. this is art. everything is possible in art. we just need to make it beautiful." The
     page said its sentence and stopped: one violet texture, sky and ground the same value, no
     distance, no light but the glimmer. A lost night is still a NIGHT — and a night has a moon.
     So: a cold moon, low and half-veiled behind the churn, on the far side of the sky from home;
     the sky darkest overhead and paling to the horizon; the waste DARK at his feet and paling
     into a haze at the far edge, so the land goes on and on; a few cold stars; tussocks with
     silver on their tips. Two lights now, and they argue: everything the moon touches is cold
     and vast; the one warm point on the horizon is small, and it is home. That is the grief,
     made beautiful. (Chiaroscuro: the dark deepens so the lights can read.) */
  const MX = 628, MY = 88, MR = 22;                 // the moon — high right, opposite the glimmer
  const ml = lightRadial(MX, MY, 360);              // its cold light, reaching far across the sky and the waste
  const COLD = '#b9c2ee';

  /* ====================== 1. THE SKY ====================== */
  const _sky = out.length;
  // a bed first, then the churn over it — gaps in a night sky show the ground colour
  // as chips of the wrong blue and the whole thing reads as litter
  strokes(out, counter, {
    rng, n: 620,
    sample: rej(-14, -14, 814, HZ + 8),
    dir: (x, y) => { const [a, b] = curlV(x, y, 62, 210); return Math.atan2(-0.15 + b * 1.5, 0.6 + a * 1.5); },
    col: (x, y, r) => jig(mix(ramp(['#161c46', '#1d2359', '#292b66', '#3b3473', '#4c4480'], Math.max(0, Math.min(1, y / HZ))), COLD, ml(x, y) * 0.25), r, 6),   // dark overhead, paler at the horizon; the moon's side lifted
    len: (x, y) => 40 * lengthOf(x, y, 11), lw: (x, y) => 5 + 5 * free(x, y, 13), steps: 3, follow: 0.9, lenJ: 0.3, wJ: 0.3, impasto: 0.3, relief: 0.2,   // a bed: its own width each, no giants
  });
  strokes(out, counter, {
    rng, n: 3600,
    sample: rej(-14, -14, 814, HZ + 6),
    dir: (x, y) => { const [a, b] = curlV(x, y, 36, 150); return Math.atan2(-0.2 + b * 2.4, 0.5 + a * 2.4); },
    col: (x, y, r) => {
      const t = Math.max(0, Math.min(1, y / HZ * 0.8 + fbm(x / 120, y / 110, 61) * 0.25));
      let c = ramp(['#13183c', '#1b1f4c', '#242457', '#2f295f', '#433968', '#4f446e'], t);
      const v = free(Math.floor(x / 11), Math.floor(y / 11), 601);
      if (v > 0.9) c = mix(c, '#2f5a7a', 0.35);          // a vein of cold teal in the churn: the moon's colour
      else if (v < 0.08) c = mix(c, '#4a2a62', 0.4);     // and a vein of plum
      c = mix(c, COLD, ml(x, y) * 0.3);                  // lit where the moon is (Sep 23: 0.45 → 0.3)
      c = mix(c, '#8a7a58', gl(x, y) * 0.30);        // the far glimmer barely stains the air near it
      return jig(c, r, 5);
    },
    len: (x, y) => 22 * lengthOf(x, y, 21), lw: (x, y) => 3.2 * widthOf(x, y, 23), steps: 4, follow: 0.88, wild: 0.06, lenJ: 0.3, wJ: 0.3, impasto: 0.4, relief: 0.3,
  });
  // the crests of the cold: hair-fine strokes riding the same curl, a shade lifted
  strokes(out, counter, {
    rng, n: 1600,
    sample: rej(-14, -14, 814, HZ + 4),
    dir: (x, y) => { const [a, b] = curlV(x, y, 36, 150); return Math.atan2(-0.2 + b * 2.4, 0.5 + a * 2.4); },
    col: (x, y, r) => {
      const t = Math.max(0, Math.min(1, y / HZ * 0.8));
      let c = ramp(['#1c224b', '#25295e', '#313068', '#413970', '#554a78'], t);
      c = mix(c, '#dfe4ff', ml(x, y) * 0.42);         // the crests catch the moon (Sep 23: 0.6 → 0.42)
      c = mix(c, '#8a7a58', gl(x, y) * 0.3);
      return jig(c, r, 5);
    },
    len: (x, y) => 16 * lengthOf(x, y, 25), lw: (x, y) => 1.2 * widthOf(x, y, 27), steps: 4, follow: 0.9, lenJ: 0.3, wJ: 0.3, impasto: 0, relief: 0.2, op: 0.7,
  });

  // ⚠ A DRIFT NEEDS SOMETHING TO CARRY IT. The sheet was already travelling and it still
  // read as static, because a smooth field slid sideways looks exactly like a smooth field:
  // measured, the plain sky changed 0.00% of its pixels while the CROWS painted into the
  // same plane changed 5-6%. Motion is only visible where there is something to see move.
  // So the air gets long cold streaks — thin, barely lighter than the night, the kind of
  // high cloud that hangs over a plain — and when the plane travels, they travel.
  // the MOON — a cold disc behind the churn, its halo bleeding into the cloud round it, the
  // cloud's edges nearest it burning silver. Drawn as paint (dabs), never a clean circle.
  strokes(out, counter, {
    rng, n: 520,
    // (first cut: the halo was DARKER than the moonlit sky round it and the veil covered
    //  four-fifths of the disc — a dark planet with a bright rim. A halo is light: paler than
    //  the sky, fading out; and the weather crosses only the moon's lower edge.)
    sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 0.55) * MR * 2.4; return [MX + Math.cos(a) * d, MY + Math.sin(a) * d * 0.9]; },
    dir: (x, y) => Math.atan2(y - MY, x - MX) + Math.PI / 2 + (rng() - 0.5) * 0.5,
    col: (x, y, r) => { const d = Math.hypot(x - MX, (y - MY) / 0.9) / MR; return jig(d < 1 ? mix('#f2f4ff', '#c9d0f4', r() * 0.5) : mix('#c3c9f2', '#7f86cc', Math.min(1, (d - 1) / 1.4)), r, 4); },
    len: (x, y) => 4 + 8 * free(x, y, 611), lw: (x, y) => 1.6 + 2.4 * free(x, y, 613), steps: 2, lenJ: 0.4, impasto: 0, relief: 0.15,
    op: (x, y) => 0.5,
  });
  strokes(out, counter, {   // the disc itself, denser
    rng, n: 260,
    sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 0.6) * MR; return [MX + Math.cos(a) * d, MY + Math.sin(a) * d * 0.92]; },
    dir: () => 0.1 + (rng() - 0.5) * 0.6,
    col: (x, y, r) => jig(mix('#f7f8ff', '#d6dcf8', fbm(x / 6, y / 6, 617) + r() * 0.2), r, 3),
    len: 5, lw: 2.4, steps: 2, lenJ: 0.5, impasto: 0, relief: 0, op: 0.85,
  });
  // a veil of the churn drawn back over the moon's lower half, so it is BEHIND the weather
  strokes(out, counter, {
    rng, n: 140,
    sample: r => [MX - MR * 2.4 + r() * MR * 4.8, MY + MR * 0.5 + r() * MR * 0.9],
    dir: (x, y) => { const [a, b] = curlV(x, y, 36, 150); return Math.atan2(-0.2 + b * 2.4, 0.5 + a * 2.4); },
    col: (x, y, r) => jig(mix('#5b5aa6', '#8a8fd0', r() * 0.5), r, 4),
    len: 14, lw: 3, steps: 3, follow: 0.9, lenJ: 0.4, impasto: 0.2, relief: 0.2, op: 0.38,
  });
  // a few cold STARS between the churn — small, and never near the moon's glare
  {
    const srng2 = mulberry32(seed + 919);
    // ⭐ "one star differeth from another star in glory" (1 Cor 15:41; Sep 21). Even over the waste
    // the heavens keep their order — He "telleth the number of the stars; he calleth them all by
    // their names" (Ps 147:4). Fewer blazing ones here (gloryK 0.5): this is the page where you
    // cannot find your way, and the sky is veiled. Never inside the moon's glare.
    E.paintStars(out, counter, srng2, { x0: 10, y0: 8, x1: 790, y1: 8 + HZ * 0.62, n: 70, fall: 1.4, gloryK: 0.5, op: 0.85,
      mask: (x, y) => Math.hypot(x - MX, y - MY) >= MR * 4 });
  }
  const _air = out.length;
  for (let k = 0; k < 6; k++) {
    const cy2 = 30 + k * 27 + fbm(k * 3.7, 1.4, 401) * 16;
    const cx2 = -120 + (k % 3) * 260 + fbm(k * 2.3, 5.1, 403) * 300;   // spread across the WHOLE width, not bunched left
    const len2 = 300 + fbm(k * 1.9, 2.2, 407) * 380;
    const th = 5 + fbm(k * 4.1, 3.3, 409) * 9;
    strokes(out, counter, {
      rng, n: Math.round(len2 * 0.5),
      sample: r => {
        const t = r();
        const x = cx2 + t * len2;
        const y = cy2 + Math.sin(t * 2.6 + k) * 7 + (r() * 2 - 1) * th;
        return (x < -70 || x > 870) ? null : [x, y];
      },
      dir: (x, y) => 0.02 + (fbm(x / 90, y / 40, 411) - 0.5) * 0.30,
      col: (x, y, r) => jig(mix(ramp(['#3f4f9a', '#45448a', '#4c3f7c'], x / W),
                                '#7d86c0', 0.10 + r() * 0.15), r, 5),   // barely off the night: a thread of high cloud, not a slab
      len: 34, lw: 2.5, steps: 3, follow: 0.97, lenJ: 0.5, wJ: 0.4, impasto: 0.15, op: 0.20,
    });
  }
  airRanges.push([_air, out.length]);
  skyRanges.push([_sky, _air]);

  /* ====================== 2. THE WASTE ====================== */
  // trackless ground, colder and emptier than anything he walked before. Every mark
  // lies along the recession, so even the dirt leans toward a vanishing point he can
  // no longer find.
  // ⚠ NO COMPLEMENTARY FLECK ON THE WASTE: even at this plate's 0.004, nine thousand marks
  // leave three dozen lime chips on a violet ground — the confetti this page was cured of once.
  const _MG = E.getManifold(); E.setManifold(0);
  strokes(out, counter, {
    rng, n: 1200,
    sample: rej(-14, HZ + 4, 814, 514),
    dir: (x, y) => rec(x, y),
    col: (x, y) => mix(ramp(['#413c66', '#342f5b', '#2a274f', '#222044'], Math.min(1, (y - HZ) / (H - HZ) + 0.1)), COLD, ml(x, y) * 0.18),   // pale and hazed far off, DARK at his feet — the land goes on; no jig on a bed stroke
    len: (x, y) => 36 * lengthOf(x, y, 31), lw: (x, y) => (4 + 5 * free(x, y, 33)) * Math.min(1, 0.3 + (y - HZ) / 90), steps: 3, follow: 0.95, lenJ: 0.3, wJ: 0.3, impasto: 0.3, relief: 0.2,   // thin at the far edge, no giants
  });
  strokes(out, counter, {
    rng, n: 5200,
    sample: rej(-14, HZ - 8, 814, 514),
    dir: (x, y) => { const [a, b] = curlV(x, y, 42, 120); return rec(x, y) + (a + b) * 0.28; },
    col: (x, y, r) => {
      const d = Math.min(1, (y - HZ) / (H - HZ) + 0.08);
      let c = ramp(['#4b456f', '#413a64', '#36305a', '#2c284e', '#242244'], d);   // far pale → near dark (aerial perspective, at night) — dark, not a pit
      // broken colour in PLACES (a vein is a place, not a speckle): cold blue and deep plum
      // keyed on a 9-unit cell, so the waste has local colour and the filter cannot
      // average it to one lavender
      const v = free(Math.floor(x / 9), Math.floor(y / 9), 401);
      if (v < 0.22) c = mix(c, '#3a3f8e', 0.5);
      else if (v > 0.88) c = mix(c, '#4a2c66', 0.5);
      else if (r() < 0.06) c = mix(c, '#6a5a86', r() * 0.8);
      c = mix(c, COLD, ml(x, y) * 0.12 * (1 - d * 0.5));   // the moon's sheen, strongest on the far ground (Sep 23: halved — see VALUE note)
      c = mix(c, '#8a7a58', gl(x, y) * 0.22);
      return jig(c, r, 6);
    },
    len: (x, y) => (10 + 20 * Math.min(1, (y - HZ) / (H - HZ) + 0.15)) * lengthOf(x, y, 41), lw: (x, y) => 2.8 * widthOf(x, y, 43),
    steps: 3, follow: 0.92, wild: 0.06, lenJ: 0.3, wJ: 0.3, impasto: 0.5, relief: 0.35,
  });
  // the fine tooth — what makes paint look like paint at arm's length
  strokes(out, counter, {
    rng, n: 2400,
    sample: rej(-14, HZ + 2, 814, 514),
    dir: (x, y) => rec(x, y) + (fbm(x / 9, y / 7, 319) - 0.5) * 1.4,
    col: (x, y, r) => {
      const d = Math.min(1, (y - HZ) / (H - HZ) + 0.08);
      let c = ramp(['#544c78', '#48416c', '#3d3762', '#312e55', '#29264b'], d);
      c = mix(c, COLD, ml(x, y) * 0.14 * (1 - d * 0.5));
      c = mix(c, '#8a7a58', gl(x, y) * 0.2);
      return jig(c, r, 5);
    },
    len: (x, y) => 6 * lengthOf(x, y, 45), lw: (x, y) => 1.2 * widthOf(x, y, 47), steps: 2, lenJ: 0.3, wJ: 0.3, impasto: 0.4, relief: 0.25, op: 0.8,
  });
  // the horizon as a MEETING, not a cut
  strokes(out, counter, {
    rng, n: 640,
    sample: rej(-14, HZ - 10, 814, HZ + 22),
    dir: (x, y) => (fbm(x / 26, y / 12, 77) - 0.5) * 1.0,
    col: (x, y, r) => jig(mix(ramp(['#3b345f', '#342d55', '#2f274d'], x / W), '#9a8560', gl(x, y) * 0.5), r, 8),
    len: (x, y) => 10 * lengthOf(x, y, 51), lw: (x, y) => 1.8 * widthOf(x, y, 53), steps: 2, lenJ: 0.3, wJ: 0.3, impasto: 0.35, relief: 0.3,
  });

  // a low HAZE along the horizon: the far waste dissolving into the sky — distance you can feel
  strokes(out, counter, {
    rng, n: 760,
    sample: rej(-14, HZ - 16, 814, HZ + 40),
    dir: (x, y) => 0.02 + (fbm(x / 80, y / 22, 931) - 0.5) * 0.4,
    col: (x, y, r) => jig(mix(mix('#8a82c4', '#a9a4d8', fbm(x / 90, y / 26, 933)), COLD, ml(x, y) * 0.5), r, 4),
    len: (x, y) => 30 * lengthOf(x, y, 61), lw: (x, y) => 3.5 * (0.5 + widthOf(x, y, 63) * 0.4), steps: 3, follow: 0.97, lenJ: 0.5, wJ: 0.4, impasto: 0, relief: 0,
    op: (() => 0.22)(),
  });
  // TUSSOCKS — dark tufts of dead grass across the waste, bigger near, silver on the tips the
  // moon reaches: the thing that gives a plain its scale and a night its sheen
  {
    const trng = mulberry32(seed + 733);
    for (let i = 0; i < 140; i++) {
      const bx = -10 + trng() * 820, by = HZ + 8 + Math.pow(trng(), 0.85) * (H - HZ - 14);
      const depth = (by - HZ) / (H - HZ), hh = 3 + depth * 11, nb = 4 + Math.floor(trng() * 4);
      const lit = ml(bx, by - hh);
      for (let k = 0; k < nb; k++) {
        const a = -Math.PI / 2 + 0.25 + (k / (nb - 1) - 0.5) * 0.9 + (trng() - 0.5) * 0.3, L2 = hh * (0.5 + trng() * 0.6);
        const tip = [bx + Math.cos(a) * L2, by + Math.sin(a) * L2], mid = [bx + Math.cos(a - 0.15) * L2 * 0.55, by + Math.sin(a - 0.15) * L2 * 0.55];
        paintPath(out, counter, trng, [[bx, by], mid, tip],
          (x, y, r) => jig(mix(mix('#262450', '#3c3670', r() * 0.6), COLD, lit * 0.55 * Math.max(0, (by - y) / (L2 + 1) - 0.3)), r, 5),
          { lw: 0.6 + depth * 0.5, len: 3, density: 0.7, jitter: 0.45 });
      }
    }
  }
  E.setManifold(_MG);
  /* ====================== 3. THE GROUND HE GOES ROUND ======================
     ⚠ THE ROAD AND THE PAINTED RING OF FOOTPRINTS ARE BOTH GONE, and that is Fred's
     call, not a trim: "the footprints are going in a circle but it doesnt look like the
     hero is walking in circle... create a dark scene, where the hero is pretty zoomed
     out just walking in a circle." He is right. A painted ring of prints is a DIAGRAM of
     walking in circles; it is not walking in circles, and a diagram is what you draw when
     the picture cannot do the thing itself.
     So the plate stops narrating and becomes what it should have been from the start — a
     dark empty land — and the sentence is carried by the only thing that can carry it:
     he walks the circle, in front of you, for as long as you watch, and his prints fade
     behind him so the trail never hardens into a drawn shape. (WALK1, engine/scene.js.)
     What is left here is only what he walks IN: the waste, the horizon, a few dead
     thistles, the far glimmer of home, and the crows. */
  // the faintest scuff on the ground where he has come round before — a whisper, never a
  // ring: if you can see it as a circle it has become the diagram again
  {
    const CR = 96, CRY = 31;
    for (let k = 0; k < 16; k++) {
      const a2 = rng() * Math.PI * 2, jr = 0.9 + rng() * 0.18;
      const px = CX + Math.cos(a2) * CR * jr, py = CY + 14 + Math.sin(a2) * CRY * jr;
      strokes(out, counter, {
        rng, n: 3,
        sample: r => [px + (r() * 2 - 1) * 8, py + (r() * 2 - 1) * 3],
        dir: () => Math.atan2(Math.cos(a2) * CRY, -Math.sin(a2) * CR),
        col: (x, y, r) => jig(mix('#5a5488', '#453f74', 0.35 + r() * 0.4), r, 6),   // scuffed dirt, barely off the ground it is in
        len: 7, lw: 2.6, steps: 2, lenJ: 0.5, impasto: 0.35, op: 0.28,
      });
    }
  }

  /* ====================== 5. THE DEAD THISTLES ====================== */
  // a few standing seed-heads, to give the waste a scale and to say that what grows
  // here has already finished. Curved (they are living things, or were).
  const thistle = (bx, by, hh, s) => {
    const tx = bx - 1.4 * s, ty = by - hh;
    paintPath(out, counter, rng, [[bx, by], [bx + 2.4 * s, by - hh * 0.5], [tx, ty + 3 * s]],
      (x, y, r) => jig(mix('#2a2350', '#3e3468', r() * 0.5), r, 6), { lw: 1.6 * s, len: 3.5, density: 0.7, jitter: 0.6 });
    for (let k = -2; k <= 2; k++) {
      const a = -Math.PI / 2 + k * 0.34;
      paintPath(out, counter, rng, [[tx, ty - 2 * s], [tx + Math.cos(a) * 5 * s, ty - 2 * s + Math.sin(a) * 5 * s]],
        (x, y, r) => jig('#6a5f86', r, 8), { lw: 0.9 * s, len: 2.5, density: 0.85, jitter: 0.4 });
    }
  };
  [[168, 470, 30, 1.5], [612, 452, 24, 1.25], [524, 500, 30, 1.6], [286, 430, 16, 0.9], [700, 486, 20, 1.15]]
    .forEach(([bx, by, hh, s]) => thistle(bx, by, hh, s));

  /* ====================== 6. HOME, VERY FAR OFF ======================
     ⚠ ON ITS OWN PLANE (Fred: "can you animate the light as well?"). A light that is
     alive is a light that SWELLS AND SETTLES, and you cannot do that to a mark buried in
     an opaque background plate without moving the whole night with it. So the glimmer and
     its halo are lifted onto a cel of their own; the runtime stacks an identical copy over
     it and pulses the copy (DIO_LIFE[7].light — the same rig the Father's door uses on
     `gift`). The plate underneath never changes, so nothing can drift or double: the only
     thing that moves is how brightly home is burning.
     It sits at depth 0.08 — a hair in front of the sky, so it stays pinned to the horizon
     when you tilt. Home does not slide about.
     One small gold glimmer on the horizon, behind him. It is tiny and it is the only
     warm thing in the frame — which is exactly why the eye finds it at that size, and
     why the distance hurts. The Light has not gone out; he is a long way from it. */
  const _glim = out.length;
  strokes(out, counter, {
    rng, n: 120,
    sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 0.55) * 17; return [GLX + Math.cos(a) * d, GLY + Math.sin(a) * d * 0.7]; },
    dir: (x, y) => Math.atan2(y - GLY, x - GLX) + Math.PI / 2,
    col: (x, y, r) => jig(ramp([GOLD_HOT, GOLD_PALE, GOLD, '#a8752e'], Math.min(1, Math.hypot(x - GLX, (y - GLY) * 1.4) / 18)), r, 7),
    len: 5, lw: 2.4, steps: 2, lenJ: 0.5, impasto: 0.5,
  });
  // the smallest halo — a warmth in the air around it, not a lamp
  strokes(out, counter, {
    rng, n: 150,
    sample: r => { const a = r() * Math.PI * 2, d = 16 + Math.pow(r(), 0.6) * 46; return [GLX + Math.cos(a) * d, GLY + Math.sin(a) * d * 0.55]; },
    dir: (x, y) => Math.atan2(y - GLY, x - GLX) + Math.PI / 2,
    col: (x, y, r) => jig(mix('#3a3480', '#e0b062', Math.max(0, 1 - Math.hypot(x - GLX, (y - GLY) * 1.8) / 62) * 0.55), r, 8),
    len: 7, lw: 2.6, steps: 2, lenJ: 0.6, op: 0.85,
  });

  glimRanges.push([_glim, out.length]);

  /* ====================== 7. THE CROWS (Isa 34:11) ====================== */
  const _crow = out.length;
  // "the cormorant and the bittern shall possess it" — three far birds over an empty
  // land, small enough to be air and not event.
  [[300, 118, 1.0], [366, 96, 0.78], [246, 92, 0.62]].forEach(([bx, by, s]) => {
    out.push(ribbon([[bx - 9 * s, by], [bx - 3 * s, by - 3.4 * s], [bx, by - 1 * s]], 1.5 * s, '#171240'));
    out.push(ribbon([[bx, by - 1 * s], [bx + 3 * s, by - 3.6 * s], [bx + 9.5 * s, by - 0.4 * s]], 1.5 * s, '#171240'));
    counter.n += 2;
  });

  airRanges.push([_crow, out.length]);   // they ride the air, so they travel with it

  /* ====================== 8. EASTER EGG — Romans 6:23 ====================== */
  inscriptionText(out, greekRef(6, 23), { x: 96, y: 436, h: 15, body: '#b9a9dc', edge: '#120e30', op: 0.42, edgeOp: 0.5 });

  const bgEnd = out.length;

  /* ====================== 9. THE FIGURE (FG plane) ====================== */
  const _fg = out.length;
  // turned back the way he came, looking at the far glimmer he cannot reach
  E.paintMask(out, counter, rng, {
    x: CX, y: CY, h: 40, facing: -1,
    eye: [-1, 0.2], mood: 'teary',
  });
  fgRanges.push([_fg, out.length]);

  const ALT = 'A vast cold waste under a churning cobalt and violet night. A stone road comes in from the near left, frays into loose scattered stones and stops dead; past it the ground is trackless. A tiny hooded figure stands alone far out on that empty ground, turned back the way he came, and his own footprints lead from the last stone, wander, and come round in a wide circle back to his heels — he has been walking in his own tracks. A few dead thistles stand in the waste and three far crows cross the empty sky. On the horizon behind him, very small, one warm gold glimmer burns: home, still alight, a long way off.';

  const RAW = { undercoat: 0, weave: 0, varnish: 0, oil: 0 };
  const setOf = ranges => { const s = new Set(); for (const [a, b] of ranges) for (let i = a; i < b; i++) s.add(i); return s; };
  const pick = ranges => ranges.map(([a, b]) => out.slice(a, b).join('\n')).join('\n');
  const fgSet = setOf(fgRanges), glimSet = setOf(glimRanges), skySet = setOf(skyRanges), airSet = setOf(airRanges);
  if (LAYER === 'fg') return svgWrap(ALT, pick(fgRanges), RAW);
  if (LAYER === 'glim') return svgWrap(ALT, pick(glimRanges), RAW);
  if (LAYER === 'sky') return svgWrap(ALT, out[0] + '\n' + pick(skyRanges), RAW);   // the base rect goes with the sky: it is the opaque plane
  if (LAYER === 'air') return svgWrap(ALT, pick(airRanges), RAW);
  if (LAYER === 'ground') return svgWrap(ALT, out.filter((_, i) => i > 0 && !fgSet.has(i) && !glimSet.has(i) && !skySet.has(i) && !airSet.has(i)).join('\n'), RAW);
  return svgWrap(ALT, out.join('\n'));
}
