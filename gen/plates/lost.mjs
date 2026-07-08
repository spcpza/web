// gen/plates/lost.mjs — "Lost" (the depth of lostness)
// A VAST cold dark — deep blues, indigo, violet — swirling with cold turbulence
// (curl + counter-rotating vortices, Munch curves). The recurring RED child is
// painted VERY SMALL, alone, near the lower centre, almost swallowed by the
// immensity: the long way off, lost in the dark. Far away — high and small — one
// faint GOLD glimmer (the Light, very far): a thread of hope in the loneliness.
// The smallness of the figure against the huge dark IS the emotional point.
// Hidden egg: Romans 6:23 (Greek) incised, light-on-dark, low in the dark.
//
// Paint order (= rng order — append only):
//   1. THE DARK     — vast cold sky-field: storm-blue/indigo/violet turbulence
//   2. COLD SWIRLS  — heavier knots of cold churn round the vortices
//   3. FAR GLIMMER  — one tiny faint gold light, high and far away
//   4. THE CHILD    — red, VERY small, alone near the lower centre   [FG plane]
//   4b. THISTLES    — dead grey-gold seed-heads on the near waste ground [FG plane]
//   5. HIDDEN EGG   — Romans 6:23 (Greek), faint incision low in the dark
//   6. CROWS        — 4 far dark silhouettes circling the empty sky (Isa 34:11)
export const name = 'lost';
export const title = 'Lost';
export const caption = 'A long way from home, and lost.';
export const seed = 20260617;
export const focal = { x: 400, y: 300 };
// MOBILE 3D — two depth planes: the vast swirling cold dark + the far glimmer +
// the hidden verse sit on the opaque BACKGROUND; the tiny red child rides a near
// FOREGROUND cel, so it parallaxes against the immensity behind it (its smallness
// against the moving dark deepens the lostness). Desktop/`full` is unchanged.
export const layers = [
  { name: 'bg', opaque: true },  // the vast cold dark, swirls, far glimmer, hidden egg (backmost, opaque)
  { name: 'fg' },                // the tiny lost red child
];

export function paint(E, opts = {}) {
  const {
    mulberry32, fbm, curlV, goldenSpiralV, mix, ramp, jig, strokes, rej,
    lightRadial, paintChild, castShadow, personCaps, inCap, inscriptionText, greekRef,
    paintPath, R1, svgWrap, W, H, GOLD, GOLD_PALE, GOLD_DEEP, GOLD_HOT, DARKEST,
  } = E;

  const rng = mulberry32(seed);
  const out = [];
  const counter = { n: 0 };
  // MOBILE 3D LAYERS: tag the child's stroke range as the foreground cel.
  const LAYER = opts.layer || 'full';
  const fgRanges = [];

  // the one faint distant glimmer, high and far (NOT near the child) — the only
  // warm note in the sky. Very small reach so it stays a far thread of hope.
  const GLX = 612, GLY = 96;
  const glim = lightRadial(GLX, GLY, 78);

  /* ---------------- 1. THE DARK — vast cold night ---------------- */
  // no pure black: a deep indigo/violet ground (DARKEST is the bluest stop)
  out.push(`<rect width="${W}" height="${H}" fill="${DARKEST}"/>`);

  // cold turbulence: counter-rotating vortices + curl, the whole sky churning
  // (Munch curves). Big, slow eddies — the immensity rolling in the dark.
  const V = [
    { x: 180, y: 140, s: 150, f: 150 },
    { x: 600, y: 320, s: -150, f: 150 },
    { x: 400, y: 60, s: 120, f: 120 },
    { x: 120, y: 400, s: -120, f: 130 },
    { x: 680, y: 470, s: 130, f: 120 },
  ];
  const darkDir = (x, y) => {
    let vx = 8, vy = -4;
    for (const v of V) { const [a, b] = goldenSpiralV(x, y, v.x, v.y, v.s, v.f); vx += a; vy += b; }
    const [c, d] = curlV(x, y, 11, 140);
    return Math.atan2(vy + d * 140, vx + c * 140);
  };
  // cold palette: indigo → violet → cold steel-blue; faint warm only INSIDE the
  // glimmer's tiny reach. A whisper of complementary orange where its warmth dies.
  const COLD = ['#0f1530', '#161d42', '#202a5e', '#2c2f6a', '#3a3a7a', '#4a4f92'];
  const darkCol = (x, y, r) => {
    const g = glim(x, y);
    if (g > 0.10 && g < 0.20 && r() < 0.02) return jig('#7a5a2a', r, 10);   // dying-warmth spark
    const t = Math.min(1, 0.18 + fbm(x / 130, y / 130, 23) * 0.7 + fbm(x / 36, y / 36, 31) * 0.22);
    let c = ramp(COLD, t);
    if (g > 0.04) c = mix(c, GOLD_PALE, Math.min(0.55, g * 0.8));            // warmed only at the far glimmer
    return jig(c, r, 7);
  };
  // smooth cold ground — one broad pass over the whole canvas
  strokes(out, counter, {
    rng, n: 620,
    sample: rej(-12, -12, 812, 512),
    dir: darkDir,
    col: darkCol,
    len: 42, lw: 10, steps: 4, follow: 0.88, wild: 0.04, lenJ: 0.5, aJ: 0.2, relief: 0.6,
  });
  // long cold filaments riding the eddies — the wind of the dark made legible
  strokes(out, counter, {
    rng, n: 460,
    sample: rej(-12, -12, 812, 512),
    dir: darkDir,
    col: (x, y, r) => jig(mix('#1c2552', '#3e4488', Math.min(1, 0.3 + fbm(x / 110, y / 110, 19) * 0.6 + glim(x, y) * 0.5)), r, 7),
    len: 56, lw: 2.0, steps: 6, follow: 0.96, wild: 0.02, lenJ: 0.5, relief: 0,
  });

  /* ---------------- 2. COLD SWIRLS — knots of churn ---------------- */
  strokes(out, counter, {
    rng, n: 520,
    sample: r => { const v = V[(r() * V.length) | 0]; const a = r() * Math.PI * 2, d = Math.pow(r(), 0.8) * v.f * 1.1; return [v.x + Math.cos(a) * d, v.y + Math.sin(a) * d * 0.82]; },
    dir: darkDir,
    col: (x, y, r) => {
      const t = fbm(x / 64, y / 64, 29);
      return jig(mix(ramp(['#141b40', '#222a62', '#3a3f86'], t), '#5a5ea0', glim(x, y) * 0.4), r, 7);
    },
    len: 26, lw: 3.6, steps: 4, follow: 0.95, wild: 0.06, lenJ: 0.45, impasto: 0.0, relief: 0.5,
  });

  /* ---------------- 3. FAR GLIMMER — one faint distant gold ---------------- */
  // tiny, high and far: a single thread of hope, mostly swallowed by the dark.
  strokes(out, counter, {
    rng, n: 96,
    sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 1.5) * 30; return [GLX + Math.cos(a) * d, GLY + Math.sin(a) * d * 0.95]; },
    dir: () => 0.1,
    col: (x, y, r) => jig(ramp([GOLD_HOT, GOLD_PALE, GOLD, GOLD_DEEP, '#3a3f86'], Math.hypot(x - GLX, y - GLY) / 30), r, 8),
    len: 6, lw: 1.8, steps: 2, impasto: 0.4,
  });
  // a faint warm halo bleeding into the dark around it
  strokes(out, counter, {
    rng, n: 60,
    sample: r => { const a = r() * Math.PI * 2, d = (0.5 + 0.6 * r()) * 56; return [GLX + Math.cos(a) * d, GLY + Math.sin(a) * d * 0.9]; },
    dir: (x, y) => Math.atan2(y - GLY, x - GLX),
    col: (x, y, r) => jig(mix(GOLD_DEEP, '#2c2f6a', Math.min(1, Math.hypot(x - GLX, y - GLY) / 56)), r, 7),
    len: 9, lw: 1.4, steps: 2, relief: 0,
  });

  /* ---------------- 4. THE CHILD — red, VERY small, alone ---------------- */
  // near the lower centre, tiny against the immensity. Standing, head bowed a
  // little, the long way off. Scaled DOWN hard — the smallness is the point.
  const _fg = out.length;
  {
    const cx = 392, cy = 360;
    // tiny, forlorn child: head bowed, arms drawn down close, standing alone
    const chCaps = personCaps(cx, cy - 14, 28, {
      headTilt: 1,
      leftHand: [cx - 4, cy + 3],     // arms hanging down, close to the body
      rightHand: [cx + 4, cy + 3],
      leftFoot: [cx - 2.5, cy + 14],
      rightFoot: [cx + 2.5, cy + 14],
    });
    castShadow(out, counter, chCaps, { dir: 0.4 });
    paintChild(out, counter, rng, chCaps, { outlineW: 4, density: 2.0 });
  }
  fgRanges.push([_fg, out.length]);   // ← the tiny lost child is the foreground cel

  /* ---------------- 4b. DEAD THISTLES — the waste ground (Gen 3:18) ---------------- */
  // "Thorns also and thistles shall it bring forth" — dry seed-heads gone
  // grey-gold on curved dead stems, sparse on the NEAR verge below the child:
  // beauty gone to seed. They ride the child's foreground cel (his own waste
  // ground), and being nearer the eye they stand taller than he does — which
  // pushes the tiny figure even further off. Muted; nothing here cheers the page.
  const _fg2 = out.length;
  {
    const thistle = (tx, ty, s, lean) => {
      const hx = tx + lean * s, hy = ty - 30 * s;                       // seed-head centre
      // curved dry stem (organic = curved, even dead) + one broken side-branch
      paintPath(out, counter, rng, [[tx, ty], [tx + lean * 0.3 * s, ty - 16 * s], [hx, hy + 3 * s]],
        (x, y, r) => jig('#5c5340', r, 8), { lw: 1.7 * s, len: 4, density: 0.9, jitter: 0.5 });
      paintPath(out, counter, rng, [[tx + lean * 0.25 * s, ty - 13 * s], [tx + lean * 0.25 * s - 7 * s, ty - 20 * s]],
        (x, y, r) => jig('#524a38', r, 8), { lw: 1.1 * s, len: 3, density: 0.85, jitter: 0.5 });
      // the spent burr: small grey-gold head with a fan of dry pale spikes
      out.push(`<ellipse cx="${R1(hx)}" cy="${R1(hy + 1.5 * s)}" rx="${R1(3.2 * s)}" ry="${R1(4 * s)}" fill="#847448" fill-opacity="0.9"/>`);
      counter.n++;
      for (let i = 0; i < 7; i++) {
        const a = -Math.PI * (0.12 + 0.76 * (i / 6)) + (rng() - 0.5) * 0.22;
        const d0 = 2.8 * s, d1 = (6 + rng() * 2.6) * s;
        out.push(`<path d="M${R1(hx + Math.cos(a) * d0)} ${R1(hy + Math.sin(a) * d0)} L${R1(hx + Math.cos(a) * d1)} ${R1(hy + Math.sin(a) * d1)}" stroke="#b09c66" stroke-opacity="0.7" stroke-width="${R1(0.9 * s)}" stroke-linecap="round"/>`);
        counter.n++;
      }
    };
    thistle(318, 456, 1.3, -6);    // near-left clump
    thistle(346, 434, 0.95, 5);
    thistle(468, 460, 1.2, 7);     // near-right clump
    thistle(494, 438, 0.85, -5);
    thistle(300, 384, 0.5, 4);     // two far spent heads at the child's distance
    thistle(455, 380, 0.45, -3);
  }
  fgRanges.push([_fg2, out.length]);  // ← the waste-ground thistles share the child's cel

  /* ---------------- 5. HIDDEN EGG — Romans 6:23 (Greek) ---------------- */
  // "For the wages of sin is death; but the gift of God is eternal life..."
  // faint light incision low in the dark, off to the side, easy to miss.
  inscriptionText(out, greekRef(6, 23), { x: 196, y: 452, h: 14, body: '#3a3f86', edge: '#aab2e0', op: 0.5, edgeOp: 0.4 });

  /* ---------------- 6. CROWS — far watchers in the empty sky (Isa 34:11) ---------------- */
  // "the raven shall dwell in it" — four small dark curved silhouettes circling
  // far off, upper-left, well away from the glimmer: the desolation has watchers.
  // Near-black on the cold indigo; a faint cold rim above each wing (no warmth)
  // is the one accent that lets the shape read. Appended LAST so nothing
  // upstream re-rolls; they land on the opaque BG plane with the sky they ride.
  {
    const crow = (x, y, sz, flap) => {
      const dip = sz * (0.30 + flap * 0.28);      // deep ragged wing-curve (Munch: living = curved)
      const tip = sz * (0.34 + flap * 0.34);
      const wing = (col, lw, oy) => {
        out.push(`<path d="M${R1(x - sz)} ${R1(y - tip + oy)} Q${R1(x - sz * 0.4)} ${R1(y + dip + oy)} ${R1(x)} ${R1(y + oy)} Q${R1(x + sz * 0.4)} ${R1(y + dip + oy)} ${R1(x + sz)} ${R1(y - tip + oy)}" fill="none" stroke="${col}" stroke-width="${R1(lw)}" stroke-linecap="round"/>`);
        counter.n++;
      };
      wing(jig('#5a629e', rng, 8), Math.max(0.9, sz * 0.12), -1.2);   // faint cold rim-light above
      wing(jig('#060a1c', rng, 5), Math.max(1.5, sz * 0.34), 0);      // the crow itself, near-black
    };
    crow(298, 118, 10, 0.65);   // a loose ring — circling, going nowhere
    crow(344, 88, 8.5, 0.2);
    crow(390, 134, 7.5, 0.85);
    crow(358, 162, 6.5, 0.45);  // (kept clear of the incised glyphs at ~x280-332,y150)
  }

  const ALT = 'A vast cold dark — deep indigo and violet swirling like a huge empty night — with one very small red child standing alone near the lower centre, almost swallowed by the immensity; dead grey-gold thistles gone to seed stand on the waste ground near him, four dark crows circle far off in the empty sky, and a single faint gold glimmer of light shines high and far away: a long way from home, and lost.';

  // MULTIPLANE: assemble the requested depth plane. Each is its own cel —
  // transparent where it has no content — so they stack and parallax apart.
  const RAW = { undercoat: 0, weave: 0, varnish: 0, oil: 0 };   // no baked surface — the live filter unifies the planes
  const setOf = ranges => { const s = new Set(); for (const [a, b] of ranges) for (let i = a; i < b; i++) s.add(i); return s; };
  const pick = ranges => ranges.map(([a, b]) => out.slice(a, b).join('\n')).join('\n');
  const fgSet = setOf(fgRanges);
  if (LAYER === 'fg') return svgWrap(ALT, pick(fgRanges), RAW);                       // the tiny lost child
  if (LAYER === 'bg') {                                                               // the vast dark + glimmer + egg (opaque)
    const body = out.filter((_, i) => !fgSet.has(i)).join('\n');
    return svgWrap(ALT, body, RAW);
  }
  // full painting (desktop): every stroke in its original paint order — UNCHANGED
  return svgWrap(ALT, out.join('\n'));
}
