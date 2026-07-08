// gen/plates/newname.mjs — "A child, a new name"
// John 1:12 ("to them gave he power to become the sons of God") + Rev 2:17
// ("a white stone, and in the stone a new name written"). NOT a gift falling
// from above — an ADOPTION PORTRAIT. The great RADIANT GOLD Father kneels,
// His arm wrapped round the small RED child drawn in against His side; both
// are turned toward us, facing the reader — the child belongs now, home, His
// own. A glowing white name-stone token rests at the child's hands. The child
// is washed, with a soft WHITE AURA. Tender, intimate, a held embrace — the
// opposite of the gift page's reaching-across-the-gap.
//
// Light: ONE source — the Father Himself is the Light (radiant gold, like the
// running father of 'ran'); His glory wraps the child He holds. The white
// name-stone is the second small bright point, cradled at the child's hands.
//
// Paint order: luminous field -> the Father's glory-halo -> the kneeling gold
// Father (body, the arm round the child) -> the red child held against His
// side (white aura, washed) -> the white name-stone token at the child's hands
// -> eggs (the new name in Greek on the stone; the scar in the Father's wrist).

export const name = 'newname';
export const title = 'A child, a new name';
export const caption = 'Now you are His own.';
export const seed = 20260917;
export const focal = { x: 400, y: 300 };
// MOBILE 3D — depth planes (FAR→NEAR): the luminous field behind (opaque base);
// the great kneeling gold FATHER in the middle (His glory + body + holding arm);
// the small red CHILD held against Him, with the white name-stone, nearest the eye.
export const layers = [
  { name: 'bg', opaque: true },   // the luminous field (backmost, opaque)
  { name: 'mid' },                // the radiant gold Father, kneeling, His arm around the child
  { name: 'fg' },                 // the red child held close + the white name-stone
];

export function paint(E, opts = {}) {
  const {
    mulberry32, fbm, curlV, mix, ramp, jig, strokes, rej,
    paintFigure, paintPath, underpaintCapsules, paintChild, inCap, lightRadial,
    klimtGold, goldSparks, inscriptionText, greekRef,
    svgWrap, R1, W, H,
    GOLD, GOLD_PALE, GOLD_DEEP, GOLD_HOT, NIGHT, DARKEST,
  } = E;

  const rng = mulberry32(seed);
  const out = [];
  const counter = { n: 0 };
  // MOBILE 3D LAYERS: tag ranges per band. BG = the luminous field (opaque base);
  // MID = the kneeling gold Father; FG = the red child held close + the name-stone.
  const LAYER = opts.layer || 'full';
  const midRanges = [], fgRanges = [];

  /* ---------------- GEOMETRY + LIGHT ---------------- */
  // the Father kneels right-of-centre, His chest the brightest mass; the child
  // is gathered in against His left side, toward us. The light pours from Him.
  const F = { x: 446, y: 248 };               // the Father's heart — the source of the light
  const C = { x: 366, y: 332 };               // the child, held against His side
  const S = { x: 348, y: 372 };               // the white name-stone, at the child's hands
  const lightAt = lightRadial(F.x, F.y, 300); // brightest at the Father's heart

  /* ---------------- 0. THE LUMINOUS FIELD ---------------- */
  // a bright world of light — warm gold-white where the Father is, cooling to
  // soft sky and lilac at the edges. No dark anywhere in the field.
  out.push(`<defs><radialGradient id="newname" cx="0.56" cy="0.48" r="0.74">
<stop offset="0" stop-color="#fff7e2"/>
<stop offset="0.4" stop-color="#f8e2c6"/>
<stop offset="0.66" stop-color="#f2c8dc"/>
<stop offset="0.85" stop-color="#d8ccee"/>
<stop offset="1" stop-color="#bee0f2"/>
</radialGradient></defs>`);
  out.push(`<rect width="${W}" height="${H}" fill="url(#newname)"/>`);

  const fieldDir = (x, y) => {
    const tang = Math.atan2(x - F.x, -(y - F.y));   // slow halo circulation around the Father
    const [cx2, cy2] = curlV(x, y, 53, 165);
    return tang + (cx2 + cy2) * 0.9 + (fbm(x / 120, y / 120, 11) - 0.5) * 0.5;
  };
  strokes(out, counter, {
    rng, n: 1850,
    sample: r => [-10 + r() * 820, -10 + r() * 520],
    dir: fieldDir,
    col: (x, y, r) => {
      const g = lightAt(x, y);
      if (g > 0.55 && r() < 0.04) return jig('#fffdf4', r, 5);   // bright flecks near the Father
      let c = ramp(['#8cc8ee', '#c2acec', '#f4a4d2', '#f8dcb0', '#fff6e2'], Math.min(1, 0.16 + g + fbm(x / 100, y / 100, 17) * 0.24));
      return jig(c, r, 7);
    },
    len: 24, lw: 3.8, steps: 3, follow: 0.9, wild: 0.13, lenJ: 0.55,
    aJ: (x, y) => 0.1 + lightAt(x, y) * 0.3, impasto: 0.55, relief: 0.6,
  });

  /* ---------------- 1. THE RADIANT GOLD FATHER — kneeling, arm round the child --  [MID plane] */
  const _mid = out.length;
  // THE FATHER IS THE LIGHT — a great glory of light blooms around Him first
  // (Rev 21:23: the glory of God lightens it), brightest at His heart. Kept a
  // touch smaller + softer-edged so His drawn BODY still reads against it.
  strokes(out, counter, {
    rng, n: 300,
    sample: r => { const a = r() * Math.PI * 2, d = 46 + Math.pow(r(), 0.85) * 96; return [F.x + Math.cos(a) * d, F.y + 6 + Math.sin(a) * d * 0.9]; },
    dir: (x, y) => Math.atan2(y - (F.y + 6), x - F.x),
    col: (x, y, r) => jig(ramp([GOLD_PALE, GOLD, GOLD_DEEP, '#caa44e', '#a8843e'], (Math.hypot(x - F.x, (y - F.y - 6) / 0.9) - 46) / 96), r, 8),
    len: 9, lw: 2.0, steps: 2, impasto: 0.4,
  });
  klimtGold(out, counter, rng, F.x, F.y - 8, 60, 130, { rings: 6, opacity: 0.42, squash: 0.9 });

  // the kneeling Father: a clearly DRAWN figure, body turned toward us — a round
  // head on shoulders, an upright torso, His left arm reaching down and ACROSS to
  // wrap round the child at His side; the near knee folded down to the right.
  const dad = [
    { ax: 452, ay: 150, bx: 452, by: 176, r: 17 },     // HEAD — clear and round, slightly bowed
    { ax: 452, ay: 192, bx: 458, by: 210, r: 26 },     // broad shoulders
    { ax: 456, ay: 210, bx: 462, by: 296, r: 23 },     // chest + torso, upright, facing us
    { ax: 462, ay: 296, bx: 548, by: 372, r: 20 },     // kneeling thigh, folding down to the right
    { ax: 548, ay: 372, bx: 606, by: 416, r: 15 },     // lower leg / shin folded under
    { ax: 474, ay: 304, bx: 522, by: 396, r: 13 },     // the other knee down, settled on the ground
    // His right arm resting easy along His side
    { ax: 486, ay: 206, bx: 528, by: 300, r: 9 },
    // HIS LEFT ARM — reaches down and across, AROUND the child (the embrace):
    { ax: 432, ay: 206, bx: 392, by: 262, r: 10 },     // upper arm angling down toward the child
    { ax: 392, ay: 262, bx: 322, by: 316, r: 9 },      // forearm wrapping ROUND behind the child's back
    { ax: 322, ay: 316, bx: 300, by: 348, r: 6.5 },    // His hand cupping the child's far shoulder
    { ax: 300, ay: 348, bx: 286, by: 358, r: 3.8 },    // fingers resting on the child's arm
    { ax: 306, ay: 350, bx: 294, by: 364, r: 3.6 },
    { ax: 312, ay: 352, bx: 302, by: 370, r: 3.4 },
  ];
  underpaintCapsules(out, counter, dad, '#9a7838');
  // THE FATHER IS THE LIGHT — luminous golden-white, the brightest body here,
  // never a silhouette: bright crest down His near edge, deeper gold in the folds.
  paintFigure(out, counter, rng, dad, (x, y, r) => jig(ramp([GOLD_HOT, GOLD_PALE, GOLD, '#d6a854', '#b8852c'], fbm(x / 20, y / 20, 43) * 0.4 + (y - 150) / 300), r, 9), 1.7);
  // warm contour grooves so the FORM reads: under the chin/neck, the shoulder
  // line, and where the holding arm crosses in front of the body (the embrace)
  for (const [ax, ay, bx, by] of [[438, 180, 466, 182], [424, 210, 392, 252], [382, 268, 330, 312], [462, 298, 500, 330]]) {
    paintPath(out, counter, rng, [[ax, ay], [bx, by]], (x, y, r) => jig(mix('#9a6826', '#6e4a1c', r()), r, 6), { lw: 2.0, len: 3.5, density: 0.8, jitter: 0.3 });
  }
  // a touch of warm shaping on the head so it reads as a face turned down to the child
  paintPath(out, counter, rng, [[446, 158], [444, 172]], (x, y, r) => jig(mix('#a8742e', '#7a4e1c', r()), r, 7), { lw: 1.6, len: 2.5, density: 0.7, jitter: 0.3 });
  // rays of light streaming off the Father into the field
  strokes(out, counter, {
    rng, n: 70,
    sample: r => { const a = r() * Math.PI * 2, d = (0.55 + 0.5 * r()) * 120; return [F.x + Math.cos(a) * d, (F.y - 4) + Math.sin(a) * d * 0.86]; },
    dir: (x, y) => Math.atan2(y - (F.y - 4), x - F.x),
    col: (x, y, r) => jig(mix(GOLD_HOT, GOLD_PALE, r()), r, 7),
    len: 11, lw: 1.5, steps: 2, lenJ: 0.6,
  });
  // hot rim down the light edge of the Father (near shoulder + holding arm),
  // so the radiant form separates cleanly from the bright field
  strokes(out, counter, {
    rng, n: 60,
    sample: rej(300, 150, 500, 330, (x, y) => dad.some(c => inCap(x, y, c)) && !dad.some(c => inCap(x - 3, y - 1, c))),
    dir: () => -0.6,
    col: (x, y, r) => jig(mix(GOLD_HOT, GOLD_PALE, r() * 0.5), r, 7),
    len: 5.5, lw: 1.6, steps: 2,
  });
  // egg: the scar in the Father's holding wrist — one small dark mark the light
  // does not hide (the love that adopts is the love that was wounded)
  paintPath(out, counter, rng, [[314, 322], [318, 325.5]],
    (x, y, r) => jig(mix('#6e3424', '#4a2018', r()), r, 7), { lw: 2.2, len: 2, density: 1.1, jitter: 0.3 });
  midRanges.push([_mid, out.length]);   // ← the kneeling radiant Father is the middle plane

  /* ---------------- 2. THE CHILD — red, washed, held close against His side --  [FG plane] */
  const _fg = out.length;
  // the small recurring RED child, gathered in against the Father, turned toward
  // us — small but at ease, belonging. THE MAIN CHARACTER, consistent red, washed
  // clean (soft WHITE AURA). Hands cupped before the chest, holding the new name.
  const child = [
    { ax: 366, ay: 286, bx: 364, by: 302, r: 11 },     // head, leaned in toward the Father
    { ax: 364, ay: 308, bx: 366, by: 372, r: 16 },     // small body, facing us, tucked to His side
    { ax: 360, ay: 326, bx: 344, by: 366, r: 6 },      // near arm down to the cupped hands
    { ax: 372, ay: 326, bx: 360, by: 366, r: 6 },      // far arm — both hands meet at the stone
    { ax: 344, ay: 366, bx: 350, by: 376, r: 4.5 },    // the small cupped hands cradling the stone,
    { ax: 360, ay: 366, bx: 352, by: 376, r: 4.5 },    //   holding it up before its chest
    { ax: 362, ay: 372, bx: 356, by: 432, r: 8 },      // legs folded, kneeling beside the Father
    { ax: 368, ay: 372, bx: 380, by: 430, r: 8 },
  ];
  // washed clean — a soft radiant WHITE AURA around the child (Isa 1:18; Rev 7:14)
  paintChild(out, counter, rng, child, { whiteAura: true });
  // a small warm gold light on the child's side that faces the Father (His glory
  // falling on the one He holds)
  strokes(out, counter, {
    rng, n: 30,
    sample: rej(360, 286, 392, 380, (x, y) => child.some(c => inCap(x, y, c)) && x > 366),
    dir: () => Math.PI / 2.4,
    col: (x, y, r) => jig(GOLD_DEEP, r, 12),
    len: 6, lw: 1.6, steps: 2,
  });

  /* ---------------- 3. THE WHITE NAME-STONE — the second bright point ---------------- */
  // a small glowing white stone, cradled in the child's cupped hands — the new
  // name, given and now its own (Rev 2:17). klimtGold halo + sparks ring it.
  klimtGold(out, counter, rng, S.x, S.y, 13, 34, { rings: 4, opacity: 0.6, squash: 0.96 });
  {
    const rx = 12, ry = 10.5;
    // a soft warm gold seat behind the stone, so the white reads against the field
    out.push(`<ellipse cx="${R1(S.x)}" cy="${R1(S.y)}" rx="${R1(rx + 5)}" ry="${R1(ry + 5)}" fill="${GOLD_DEEP}" opacity="0.55"/>`); counter.n++;
    out.push(`<ellipse cx="${R1(S.x)}" cy="${R1(S.y)}" rx="${R1(rx + 1)}" ry="${R1(ry + 1)}" fill="#fffef8"/>`); counter.n++;
    // luminous body strokes — white, faintly warmed, curving round the stone's form
    strokes(out, counter, {
      rng, n: 90,
      sample: rej(S.x - rx, S.y - ry, S.x + rx, S.y + ry, (x, y) => {
        const dx = (x - S.x) / rx, dy = (y - S.y) / ry; return dx * dx + dy * dy <= 1;
      }),
      dir: (x, y) => Math.atan2(x - S.x, -(y - S.y)) + (fbm(x / 9, y / 9, 57) - 0.5) * 0.6,
      col: (x, y, r) => jig(ramp(['#ffffff', '#fffdf4', '#fdf2dc', '#f4e4c4'], Math.hypot(x - S.x, (y - S.y) * 1.1) / 15), r, 5),
      len: 5, lw: 1.8, steps: 2, impasto: 0.6,
    });
    // a bright highlight catching the upper-left of the stone
    out.push(`<ellipse cx="${R1(S.x - 3.2)}" cy="${R1(S.y - 3)}" rx="3.4" ry="2.5" fill="#ffffff" opacity="0.85"/>`); counter.n++;
    // hot rim hugging the stone's edge
    strokes(out, counter, {
      rng, n: 50,
      sample: r => { const a = r() * Math.PI * 2; return [S.x + Math.cos(a) * (rx + 1.2), S.y + Math.sin(a) * (ry + 1.2)]; },
      dir: (x, y) => Math.atan2(x - S.x, -(y - S.y)),
      col: (x, y, r) => jig(ramp([GOLD_HOT, GOLD_PALE, GOLD], r()), r, 7),
      len: 4, lw: 1.3, steps: 2,
    });
  }
  // gold sparks scattered around the stone — leaf catching the glory
  goldSparks(out, counter, rng, S.x, S.y, 15, 56, 34, { squash: 0.95, big: 0.95, lightFn: lightAt });

  /* ---------------- 4. EGG: the new name, incised on the stone ---------------- */
  // John 1:12 in Greek — "to them gave he power to become the sons of God" — the
  // new name written on the white stone (Rev 2:17), a fourth-look secret.
  inscriptionText(out, greekRef(1, 12), { x: S.x, y: S.y + 3.5, h: 11, body: '#b89a52', edge: '#fffdf0', op: 0.6, edgeOp: 0.7 });
  fgRanges.push([_fg, out.length]);   // ← the held child + the white name-stone are foreground

  const ALT = 'A bright field of light. The great radiant gold Father kneels, His arm wrapped around the small red child gathered in against His side; both are turned toward us. In the child\'s cupped hands rests a small glowing white name-stone, ringed with gold sparks and a halo of glory — washed clean, with a soft white aura, the child belongs to Him now, home, His own.';

  // MULTIPLANE: assemble the requested depth plane. Each is its own cel —
  // transparent where it has no content — so they stack and parallax apart.
  const RAW = { undercoat: 0, weave: 0, varnish: 0, oil: 0 };   // no baked surface — the live filter unifies the planes
  const setOf = ranges => { const s = new Set(); for (const [a, b] of ranges) for (let i = a; i < b; i++) s.add(i); return s; };
  const pick = ranges => ranges.map(([a, b]) => out.slice(a, b).join('\n')).join('\n');
  const midSet = setOf(midRanges), fgSet = setOf(fgRanges);
  if (LAYER === 'mid') return svgWrap(ALT, pick(midRanges), RAW);   // the kneeling radiant Father
  if (LAYER === 'fg') return svgWrap(ALT, pick(fgRanges), RAW);     // the held child + the name-stone
  if (LAYER === 'bg') {                                             // the luminous field (everything else)
    const body = out.filter((_, i) => !midSet.has(i) && !fgSet.has(i)).join('\n');
    return svgWrap(ALT, body, RAW);
  }
  // full painting (desktop): the original order, UNCHANGED.
  return svgWrap(ALT, out.join('\n'));
}
