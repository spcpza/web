// gen/plates/born.mjs — "Born again"
//
//   "Except a man be born again, he cannot see the kingdom of God." — John 3:3
//   "If any man be in Christ, he is a new creature: old things are passed
//    away; behold, all things are become new." — 2 Corinthians 5:17
//
// A brilliant NEW DAWN. The recurring RED child stands upright, brand new,
// arms and face lifted into the morning, in a flourishing world waking to
// colour — vibrant light-blue sky warming to gold, fresh green earth bursting
// with multicoloured wildflowers (Isa 35:1, "the desert shall... blossom as
// the rose"). The old dark lies low behind; everything ahead is new and alive.
// The freshest, most joyful page — no grey, no black.
//
// MOBILE 3D — three depth planes that parallax at distinct rates (composite-once
// → cheap): the SKY is the opaque dawn ground (sun, rays, swirling light, birds);
// the MID plane is the flourishing field/wildflowers/fruit-trees (planted, so it
// moves WITH the ground it grows in); the FOREGROUND is the risen RED child, who
// leads most. `full`/desktop returns the original paint order UNCHANGED — only the
// mobile split is added, so the desktop jpg is byte-identical.

export const name = 'born';
export const title = 'Born again';
export const caption = 'Behold, all things become new.';
export const seed = 30811033;
export const focal = { x: 400, y: 280 }; // portrait window: the renewed child rising in the new dawn
export const layers = [
  { name: 'sky', opaque: true },  // dawn sky: sun, rays, swirling light, birds (backmost, opaque)
  { name: 'mid' },                // the flourishing field, wildflowers, fruit-trees (planted)
  { name: 'fg' },                 // the risen red child (closest, leads most)
];

export function paint(E, opts = {}) {
  const {
    mulberry32, fbm, curlV, goldenSpiralV, mix, ramp, jig, strokes, rej,
    paintPath, paintChild, castShadow, personCaps, lightRadial, svgWrap, R1, W, H,
    GOLD, GOLD_PALE, GOLD_DEEP, GOLD_HOT,
    fruitTree, groundFlowers, LEAF_PALETTES, ridge, horizonFringe,
  } = E;

  const rng = mulberry32(seed);
  const out = [];
  const counter = { n: 0 };
  // MOBILE 3D LAYERS: everything draws once, in order; we record the out[] index
  // where each depth band ends. The build emits one cel per band; `full` returns
  // the whole stack in original order (byte-identical to the single-layer plate).
  const LAYER = opts.layer || 'full';
  // a fresh light-blue dawn — never black; the deepest tone is a soft blue
  out.push(`<rect width="${W}" height="${H}" fill="#7ecdf6"/>`);

  const horizon = 280;
  // the NEW DAWN — a radiant sun low and central, behind the rising child, so the
  // whole world is lit from where he stands. Answered by a gentle glory overhead.
  const sunC = { x: 400, y: 232 };
  const sun = lightRadial(sunC.x, sunC.y, 300);
  const dawn = lightRadial(400, 90, 360);
  const lightAt = (x, y) => Math.min(1, sun(x, y) * 1.1 + dawn(x, y) * 0.5);

  /* ---------------- 1. THE NEW-DAWN SKY — light blue → pink → gold, swirling ----------------
     the sky is nature, so it swirls (Munch); but this is the morning of a new
     creation — a gentle radiant turn out of the rising sun, joyful, not storm. */
  out.push(`<defs><linearGradient id="bornsky" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#aee3fb"/>
<stop offset="0.4" stop-color="#8fd0f4"/>
<stop offset="0.7" stop-color="#f2a6cc"/>
<stop offset="0.88" stop-color="#ffd884"/>
<stop offset="1" stop-color="#ffe9a0"/>
</linearGradient></defs>`);
  out.push(`<rect x="-12" y="-12" width="${W + 24}" height="${horizon + 24}" fill="url(#bornsky)"/>`);
  counter.n++;

  const SUNV = [
    { x: 400, y: 232, s: 118, f: 86 },   // the new sun — light spiralling gently out
    { x: 150, y: 92, s: -64, f: 50 },
    { x: 650, y: 100, s: 64, f: 50 },
    { x: 300, y: 150, s: 96, f: 46 },
    { x: 520, y: 158, s: -90, f: 44 },
  ];
  const skyDir = (x, y) => {
    let vx = 24, vy = -6;   // base streams up-and-out (light rising), swirl rides on top
    for (const v of SUNV) { const [a, b] = goldenSpiralV(x, y, v.x, v.y, v.s, v.f); vx += a; vy += b; }
    const [c, d] = curlV(x, y, 29, 130); vx += c * 60; vy += d * 60;
    return Math.atan2(vy, vx);
  };
  const skyCol = (x, y, r, lift) => {
    const t = Math.max(0, Math.min(1, (horizon - y) / horizon * 1.05 + fbm(x / 120, y / 120, 311) * 0.3 - 0.04));
    let c = ramp(['#ffe09a', '#f3a6cc', '#8fd0f4', '#a6e2fb', '#cdeefe', '#f0fbff'], t); // gold low → rose → light-blue high
    c = mix(c, GOLD_PALE, dawn(x, y) * 0.5 + sun(x, y) * 0.3);
    if (lift) c = mix(c, '#ffffff', lift);
    return jig(c, r, 6);
  };
  // the smooth sky ground — broad soft masses
  strokes(out, counter, {
    rng, n: 460, sample: rej(-12, -12, 812, horizon + 8),
    dir: skyDir, col: (x, y, r) => skyCol(x, y, r, 0),
    len: 40, lw: 9.5, steps: 4, follow: 0.88, wild: 0.05, lenJ: 0.5, impasto: 0.5,
  });
  // VAN GOGH ARMS — streaming light: long curling filaments riding the new dawn,
  // bright (rose into gold), glory pouring up, not turbulence
  strokes(out, counter, {
    rng, n: 320,
    sample: rej(-12, -12, 812, horizon + 4),
    dir: skyDir,
    col: (x, y, r) => {
      const k2 = fbm(x / 84, y / 84, 317) + (r() - 0.5) * 0.2;
      if (k2 > 0.78) return jig('#fffdf6', r, 8);  // bright cloud crests
      return jig(mix(mix('#bfe6fb', '#f3b6d2', Math.min(1, y / 230)), GOLD_PALE, Math.min(0.8, 0.2 + lightAt(x, y) * 0.8)), r, 6);
    },
    len: 30, lw: 4.6, steps: 6, follow: 0.94, wild: 0.18, lenJ: 0.55, impasto: 0.6, relief: 0.5,
  });
  // the rising sun's radiant core, low and central — the source of the new day
  strokes(out, counter, {
    rng, n: 150,
    sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 0.75) * 56; return [sunC.x + Math.cos(a) * d, sunC.y + Math.sin(a) * d * 0.92]; },
    dir: () => 0.2,
    col: (x, y, r) => jig(ramp([GOLD_HOT, GOLD_PALE, GOLD], Math.hypot(x - sunC.x, (y - sunC.y) / 0.92) / 56), r, 5),
    len: 8, lw: 3, steps: 2, impasto: 0.55,
  });
  // bold rays of the new morning streaming up and out across the sky
  strokes(out, counter, {
    rng, n: 90,
    sample: r => { const a = -Math.PI * (0.06 + r() * 0.88); const d = (0.4 + 0.8 * r()) * 250; return [sunC.x + Math.cos(a) * d, sunC.y + Math.sin(a) * d * 0.9]; },
    dir: (x, y) => Math.atan2(y - sunC.y, x - sunC.x),
    col: (x, y, r) => jig(mix(GOLD_HOT, GOLD_PALE, r() * 0.5), r, 6),
    len: (x, y) => 12 + Math.hypot(x - sunC.x, y - sunC.y) / 14, lw: 1.4, steps: 2, lenJ: 0.7, relief: 0,
  });

  // BIRDS rising into the new morning (Matt 6:26)
  for (const [bx, by, s] of [[170, 78, 1], [206, 92, 0.85], [142, 96, 0.8], [624, 86, 0.9], [664, 72, 0.78], [600, 100, 0.7]]) {
    paintPath(out, counter, rng, [[bx - 6 * s, by + 2.6 * s], [bx, by - 1.8 * s], [bx + 6 * s, by + 2.6 * s]], (x, y, r) => jig('#5a6ea0', r, 6), { lw: 1.5 * s, len: 3.4, density: 0.9, jitter: 0.5 });
  }
  // far spring blossom-petals adrift on the morning air, tiny with distance —
  // the whole world turned spring (Isa 35:1)
  strokes(out, counter, {
    rng, n: 14,
    sample: rej(60, 236, 740, 274),
    dir: (x, y) => { const [vx, vy] = curlV(x, y, 71, 60); return Math.atan2(vy * 0.5 + 0.3, vx * 0.5 + 1); },
    col: (x, y, r) => jig(['#ffd7e8', '#fff5fa', '#ffc9de'][Math.floor(r() * 3)], r, 6),
    len: 2.6, lw: 1.3, steps: 2, lenJ: 0.5,
  });
  const skyEnd = out.length;   // ← everything above is the opaque SKY plane

  /* ---------------- 2. THE FRESH GREEN EARTH — a new creation flourishing ---------------- */
  const fieldTop = ridge(horizon, { amp: 22, freq: 160, bumps: 0.4, seed: 331 });
  // underpaint: solid fresh green with the rolling top — gaps read lush, not bare
  {
    let d = `M-2 ${R1(fieldTop(-2))}`;
    for (let x = -2; x <= 802; x += 9) d += `L${R1(x)} ${R1(fieldTop(x))}`;
    d += `L802 ${H + 2}L-2 ${H + 2}Z`;
    out.push(`<path d="${d}" fill="#3f8a3a"/>`); counter.n++;
  }
  // the OLD DARK passed away — only a low, soft band of deeper blue-green at the
  // very base behind, kept luminous; everything ahead is new (2 Cor 5:17)
  strokes(out, counter, {
    rng, n: 1700,
    sample: rej(-10, horizon - 24, 810, 512, (x, y) => y > fieldTop(x) - 1),
    dir: (x, y) => { const [vx, vy] = curlV(x, y, 161, 64); return Math.atan2(vy * 0.8 - 0.1, Math.abs(vx) + 0.7); },
    col: (x, y, r) => {
      const depth = (y - horizon) / (H - horizon);
      let c = ramp(['#2c7a4a', '#3f8a3a', '#5ea83e', '#86c44a', '#bcd862'], 0.1 + fbm(x / 60, y / 60, 337) * 0.85 + depth * 0.35);
      c = mix(c, GOLD_DEEP, lightAt(x, y) * 0.5);   // warming gold where the new light falls
      return jig(c, r, 12);
    },
    len: 16, lw: 3.6, steps: 3, lenJ: 0.55, wild: 0.16, impasto: 0.7,
  });
  // perspective overlay near the horizon — shorter strokes
  strokes(out, counter, {
    rng, n: 420,
    sample: rej(-10, horizon - 24, 810, horizon + 54, (x, y) => y > fieldTop(x) - 1),
    dir: () => 0,
    col: (x, y, r) => jig(mix(ramp(['#3f8a3a', '#6eb046', '#9cca52'], 0.3 + fbm(x / 40, y / 40, 339) * 0.5), GOLD_DEEP, lightAt(x, y) * 0.4), r, 9),
    len: 8, lw: 2, steps: 2,
  });

  // the HORIZON FRINGE — ragged grass tufts breaking the sky↔earth seam organically
  horizonFringe(out, counter, rng, { horizonFn: fieldTop, x0: -10, x1: 810, cols: ['#2c7a4a', '#3f8a3a', '#5ea83e', '#86c44a'], hMax: 20, lightFn: lightAt, seed: 333 });

  // FLOURISHING — wildflowers of every jewel colour burst across the whole earth
  // (Isa 35:1). The freshest page: the ground itself rejoices and blossoms.
  groundFlowers(out, counter, rng, {
    x0: -6, y0: horizon + 6, x1: 812, y1: 510, n: 520,
    lightFn: lightAt,
    depthFn: (x, y) => (y - horizon) / (510 - horizon),
  });

  // fruit-trees of the new creation, planted in crazy jewel colours either side,
  // framing the rising child without crowding him
  fruitTree(out, counter, rng, 96, 360, 70, 32, LEAF_PALETTES[1], lightAt);   // pink, left
  fruitTree(out, counter, rng, 712, 366, 76, 35, LEAF_PALETTES[3], lightAt);  // blue, right
  fruitTree(out, counter, rng, 150, 332, 46, 22, LEAF_PALETTES[4], lightAt);  // green, left far
  fruitTree(out, counter, rng, 660, 338, 50, 24, LEAF_PALETTES[2], lightAt);  // teal, right far
  // SPRING BUDDING — white-rose blossom sprays crowning the two near fruit-trees
  // (all things become new — the trees themselves break into flower)
  for (const [tx, ty, tw, th] of [[96, 317, 32, 41], [712, 319, 35, 44]]) {
    strokes(out, counter, {
      rng, n: 16,
      sample: r => { const a = r() * Math.PI, d = 0.75 + r() * 0.3; return [tx + Math.cos(a) * tw * d, ty - Math.sin(a) * th * d]; },
      dir: () => -Math.PI / 2,
      col: (x, y, r) => jig(mix('#fff5fa', '#ffbcd9', r()), r, 6),
      len: 3, lw: 2.2, steps: 2,
    });
  }
  // ...and loose petals DRIFT across the new morning (blossom on the wind),
  // kept clear of the child and of the butterfly's pocket
  strokes(out, counter, {
    rng, n: 34,
    sample: rej(20, 284, 780, 382, (x, y) => !(x > 352 && x < 448 && y > 296) && Math.hypot(x - 332, y - 318) > 34),
    dir: (x, y) => { const [vx, vy] = curlV(x, y, 73, 54); return Math.atan2(vy * 0.6 + 0.35, vx * 0.6 + 1); },
    col: (x, y, r) => jig(['#ffd7e8', '#fff5fa', '#ffc9de', '#ffe4b8'][Math.floor(r() * 4)], r, 7),
    len: 3.4, lw: 1.7, steps: 2, lenJ: 0.6,
  });

  /* THE NEW CREATURE — one prominent BUTTERFLY (2 Cor 5:17 "if any man be in
     Christ, he is a NEW CREATURE") — the crawling worm buried, risen on wings;
     hovering beside the child's lifted left hand. Bold two-colour wings
     (dawn-orange forewings, violet-rose hindwings) with dark veining so it
     reads at a glance — the clearest butterfly in the book. */
  {
    const bfx = 332, bfy = 318;
    // a pale morning glow behind it, so the silhouette pops off the green field
    strokes(out, counter, {
      rng, n: 24,
      sample: r => { const a = r() * Math.PI * 2, d = Math.sqrt(r()) * 30; return [bfx + Math.cos(a) * d, bfy + Math.sin(a) * d * 0.85]; },
      dir: (x, y) => Math.atan2(y - bfy, x - bfx) + Math.PI / 2,
      col: (x, y, r) => jig(mix('#e8f6cf', GOLD_PALE, 0.55), r, 6),
      len: 6, lw: 2.6, steps: 2, impasto: 0.3,
    });
    // four wing lobes — strokes radiate from the body like veins (living = curved)
    const wing = (wx, wy, rx, ry, cols) => strokes(out, counter, {
      rng, n: 44,
      sample: r => { const a = r() * Math.PI * 2, d = Math.sqrt(r()); return [wx + Math.cos(a) * d * rx, wy + Math.sin(a) * d * ry]; },
      dir: (x, y) => Math.atan2(y - bfy, x - bfx),
      col: (x, y, r) => jig(ramp(cols, Math.min(1, Math.hypot((x - wx) / rx, (y - wy) / ry))), r, 6),
      len: 4.5, lw: 2.4, steps: 2, follow: 0.92, impasto: 0.6,
    });
    wing(bfx - 11, bfy - 8, 10, 8, ['#ffd24d', '#ff9a24', '#f2611c']);      // forewings — blazing dawn-orange
    wing(bfx + 11, bfy - 8, 10, 8, ['#ffd24d', '#ff9a24', '#f2611c']);
    wing(bfx - 8.5, bfy + 7, 7.5, 6.5, ['#f7aade', '#c95ec4', '#8d3fae']);  // hindwings — violet-rose
    wing(bfx + 8.5, bfy + 7, 7.5, 6.5, ['#f7aade', '#c95ec4', '#8d3fae']);
    const VDK = (x, y, r) => jig('#33203a', r, 5);
    for (const s of [-1, 1]) {   // DARK VEINING — bold rims + veins, one wing pair per side
      paintPath(out, counter, rng, [[bfx + s * 2.5, bfy - 13], [bfx + s * 13, bfy - 15.5], [bfx + s * 20, bfy - 9], [bfx + s * 15, bfy - 1.5], [bfx + s * 3.5, bfy - 1.5]], VDK, { lw: 1.7, len: 3, density: 1.1, jitter: 0.35 });
      paintPath(out, counter, rng, [[bfx + s * 3, bfy + 1.5], [bfx + s * 12.5, bfy + 2.5], [bfx + s * 15.5, bfy + 9.5], [bfx + s * 8.5, bfy + 13.5], [bfx + s * 2, bfy + 9]], VDK, { lw: 1.6, len: 3, density: 1.1, jitter: 0.35 });
      paintPath(out, counter, rng, [[bfx + s * 3, bfy - 5], [bfx + s * 12, bfy - 12.5]], VDK, { lw: 1.2, len: 2.6, density: 1, jitter: 0.3 });
      paintPath(out, counter, rng, [[bfx + s * 3, bfy - 4], [bfx + s * 18, bfy - 8.5]], VDK, { lw: 1.2, len: 2.6, density: 1, jitter: 0.3 });
      paintPath(out, counter, rng, [[bfx + s * 3, bfy + 4], [bfx + s * 12.5, bfy + 9]], VDK, { lw: 1.1, len: 2.6, density: 1, jitter: 0.3 });
      // white splash accents at the forewing tip (the single accent that reads)
      strokes(out, counter, {
        rng, n: 5,
        sample: r => { const t = r(); return [bfx + s * (15 + t * 4), bfy - 11 + t * 4]; },
        dir: () => (s > 0 ? -0.5 : 0.5),
        col: (x, y, r) => jig('#fffdf4', r, 4),
        len: 2.2, lw: 1.4, steps: 2,
      });
    }
    // dark curved body, head and antennae (a living thing — curved lines)
    paintPath(out, counter, rng, [[bfx, bfy - 9], [bfx - 1, bfy + 1], [bfx, bfy + 11]], VDK, { lw: 3, len: 3, density: 1.4, jitter: 0.3 });
    paintPath(out, counter, rng, [[bfx - 1.5, bfy - 10.5], [bfx - 5, bfy - 16], [bfx - 6.5, bfy - 17]], VDK, { lw: 1, len: 2, density: 1.2, jitter: 0.25 });
    paintPath(out, counter, rng, [[bfx + 1.5, bfy - 10.5], [bfx + 5, bfy - 16], [bfx + 6.5, bfy - 17]], VDK, { lw: 1, len: 2, density: 1.2, jitter: 0.25 });
  }
  const midEnd = out.length;   // ← SKY..here is the MID plane (field, flowers, trees, planted)

  /* ---------------- 3. THE RED CHILD — risen, standing, made NEW ----------------
     the recurring protagonist, born again: UPRIGHT, face and arms lifted into the
     new morning. Brand new, alive, the heart of the page (John 3:3). */
  const cx = 400, cy = 396;
  // upright, born again — arms flung UP into the new morning (proportioned child)
  const cCaps = personCaps(cx, cy - 62, 70, {
    leftHand: [cx - 24, cy - 56], rightHand: [cx + 24, cy - 56],   // both hands raised to the dawn (stubby arms, elbows bend)
    leftFoot: [cx - 6, cy + 8], rightFoot: [cx + 6, cy + 8],       // firm, upright stance
    headTilt: 1,
  });
  // a soft glory of new light around the child first — the new creature, lit
  strokes(out, counter, {
    rng, n: 120,
    sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 0.85) * 64; return [cx + Math.cos(a) * d, cy - 36 + Math.sin(a) * d * 0.92]; },
    dir: (x, y) => Math.atan2(y - (cy - 36), x - cx),
    col: (x, y, r) => jig(ramp([GOLD_PALE, GOLD, GOLD_DEEP], Math.hypot(x - cx, (y - cy + 36) / 0.92) / 64), r, 8),
    len: 7, lw: 1.8, steps: 2, impasto: 0.4,
  });
  // THE MAIN CHARACTER — "you", born again: the consistent deep-red child + dark
  // outline, upright and renewed (the protagonist of the whole book).
  castShadow(out, counter, cCaps, { dir: 0.4 });
  paintChild(out, counter, rng, cCaps, { whiteAura: true, outlineW: 4 });
  // warm new light catching his lifted face and front (toward the dawn)
  strokes(out, counter, {
    rng, n: 20,
    sample: rej(cx - 9, cy - 70, cx + 9, cy - 30, (x, y) => cCaps.some(c => E.inCap(x, y, c))),
    dir: () => -Math.PI / 2.2,
    col: (x, y, r) => jig(GOLD_DEEP, r, 12),
    len: 6, lw: 1.5, steps: 2,
  });

  /* ---------------- EGG: ΓʹΓʹ — John 3:3 in the ORIGINAL KOINE GREEK numerals ----------------
     Γʹ·Γʹ (3, 3), cut faint into the flourishing field, lower-left. John 3:3:
     "Except a man be born again, he cannot see the kingdom of God." */
  E.inscriptionText(out, E.greekRef(3, 3), { x: 196, y: 462, h: 14, body: '#1a3a1e', edge: '#eafbe0', op: 0.82, edgeOp: 0.55 });

  const ALT = 'A brilliant new dawn over a fresh green earth bursting with wildflowers of every colour and jewel-coloured fruit trees crowned with white-rose blossom; petals drift on the morning wind. The small red child stands upright at the centre, face and arms lifted into the rising light — born again, brand new — and beside his lifted hand hovers one bold butterfly with orange and violet wings, the sign of the new creature (2 Corinthians 5:17). Hidden faint in the field is the Greek reference Γʹ·Γʹ — John 3:3.';

  // MULTIPLANE: assemble the requested depth plane. Each is its own cel —
  // transparent where it has no content — so they stack and parallax like the
  // painted-background-plus-acetate-cels of hand-drawn animation.
  const RAW = { undercoat: 0, weave: 0, varnish: 0, oil: 0 };   // no baked surface — the live filter unifies the planes
  if (LAYER === 'sky') return svgWrap(ALT, out.slice(0, skyEnd).join('\n'), RAW);   // dawn sky (opaque backmost)
  if (LAYER === 'mid') return svgWrap(ALT, out.slice(skyEnd, midEnd).join('\n'), RAW);   // flourishing field, flowers, trees
  if (LAYER === 'fg') return svgWrap(ALT, out.slice(midEnd).join('\n'), RAW);   // the risen red child
  // full painting (desktop): the whole stack, original paint order UNCHANGED
  return svgWrap(ALT, out.join('\n'));
}
