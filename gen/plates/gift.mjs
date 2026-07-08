// gen/plates/gift.mjs — "The gift" (§11, works-grace)
// The sparsest plate in the book. A deep dark field of night blues, stroke
// density falling away toward the edges; at center, two small open hands
// (the child's, reaching up from below) and a larger gold-lit hand offering
// a small wrapped gift — NOT YET TAKEN. The gap between the gift and the
// open palms is the whole chapter: it cannot be bought or earned; only
// opened hands can hold it. Rembrandt moment, Van Gogh brush.
//
// Light: ONE source — the gift itself. Everything else is reach and
// falloff. Complementary sparks: violet flickers in the thin band where
// the gold dies into the dark.
//
// Paint order: dark field (halo circulation, density thinning outward) ->
// inner glow ring -> the child's red sleeves + cupped hands -> the offering
// forearm + hand -> the gift (wrap, ribbon cross, bow) -> rays -> eggs
// (the scar in the offering wrist; a mustard seed already in the child's palm).

export const name = 'gift';
export const title = 'The gift';
export const caption = 'Open your hand.';
export const seed = 20261111;
export const focal = { x: 400, y: 258 }; // portrait window: the gift, dead center
// MOBILE 3D — depth planes (FAR→NEAR): the field of light behind; the offering
// hand + the gift descending in the middle; the child's open hands reaching up,
// closest. The gap between the gift and the open palms gains real depth on tilt.
export const layers = [
  { name: 'bg', opaque: true },   // the luminous field of light (backmost)
  { name: 'far' },                // God's offering forearm + hand, descending from above
  { name: 'mid' },                // the wrapped gift itself, hovering between
  { name: 'fg' },                 // the child's two open hands, reaching up (closest)
];

export function paint(E, opts = {}) {
  const {
    mulberry32, fbm, curlV, mix, ramp, jig, strokes, rej,
    paintFigure, paintPath, underpaintCapsules, paintChild, inCap, lightRadial,
    svgWrap, R1, W, H,
    GOLD, GOLD_PALE, GOLD_DEEP, GOLD_HOT, NIGHT, DARKEST,
  } = E;

  const rng = mulberry32(seed);
  const out = [];
  const counter = { n: 0 };
  const LAYER = opts.layer || 'full';
  const fgRanges = [];
  const farRanges = [];
  // POST-RESURRECTION FLIP: the world is LIGHT now. The background is luminous;
  // the figures are dark forms within it (objects dark, background light — the
  // value structure of the whole book turns over at the empty tomb).
  out.push(`<defs><radialGradient id="grace11" cx="0.5" cy="0.5" r="0.68">
<stop offset="0" stop-color="#fff6e0"/>
<stop offset="0.4" stop-color="#f8e0c2"/>
<stop offset="0.66" stop-color="#f4c2da"/>
<stop offset="0.85" stop-color="#d6c8ee"/>
<stop offset="1" stop-color="#bce0f2"/>
</radialGradient></defs>`);
  out.push(`<rect width="${W}" height="${H}" fill="url(#grace11)"/>`);

  /* ---------------- GEOMETRY + LIGHT ---------------- */
  const G = { x: 400, y: 252 };          // the gift, dead center
  const lightAt = lightRadial(G.x, G.y, 240); // brightest at the gift, still bright outward

  /* ---------------- 1. THE FIELD OF LIGHT ---------------- */
  // the new world is full of light: luminous strokes circulating around the
  // centre — warm gold-white at the heart, cooling to soft cream and sky at the
  // edges. No dark anywhere in the field — grace is abundant.
  const fieldSample = r => [-10 + r() * 820, -10 + r() * 520];
  const fieldDir = (x, y) => {
    const tang = Math.atan2(x - G.x, -(y - G.y)); // slow halo circulation
    const [cx2, cy2] = curlV(x, y, 47, 160);
    return tang + (cx2 + cy2) * 0.9 + (fbm(x / 120, y / 120, 9) - 0.5) * 0.5;
  };
  strokes(out, counter, {
    rng, n: 1850,
    sample: fieldSample,
    dir: fieldDir,
    col: (x, y, r) => {
      const g = lightAt(x, y);
      if (g > 0.55 && r() < 0.04) return jig('#fffdf4', r, 5); // bright flecks near the gift
      // a joyful, vibrant field of light — bright blue, lilac, pink, into gold
      let c = ramp(['#8cc8ee', '#c2acec', '#f4a4d2', '#f8dcb0', '#fff6e2'], Math.min(1, 0.16 + g + fbm(x / 100, y / 100, 15) * 0.24));
      return jig(c, r, 7);
    },
    len: 24, lw: 3.8, steps: 3, follow: 0.9, wild: 0.13, lenJ: 0.55, aJ: (x, y) => 0.1 + lightAt(x, y) * 0.3, impasto: 0.55, relief: 0.6,
  });
  // a soft warm bloom right at the gift — its own light still, the brightest heart
  strokes(out, counter, {
    rng, n: 420,
    sample: r => { const a = r() * Math.PI * 2, d = 18 + Math.pow(r(), 0.9) * 110; return [G.x + Math.cos(a) * d, G.y + Math.sin(a) * d * 0.95]; },
    dir: (x, y) => Math.atan2(x - G.x, -(y - G.y)) + (fbm(x / 40, y / 40, 21) - 0.5) * 0.7,
    col: (x, y, r) => jig(ramp(['#fffaf0', GOLD_PALE, '#f2e2bc', '#e6d6bc'], Math.hypot(x - G.x, y - G.y) / 130), r, 9),
    len: 13, lw: 2.6, steps: 3, follow: 0.9, wild: 0.1, lenJ: 0.5, impasto: 0.5,
  });
  /* ---------------- 1b. LIFE: TWO DOVES ---------------- */
  // two doves crossing the field of light between the hands — witnesses to the
  // giving (Matt 3:16 — the Spirit descending like a dove; Deut 19:15 — two
  // witnesses). Small, curved flight (Munch: living = curved), placed well
  // clear of the vertical hand-gift-hands axis and its gap. White bodies with
  // a soft violet under-shade so they read against the bright pastel field,
  // one warm gold rim each — lit by the gift they witness.
  {
    const doves = [
      { x: 291, y: 203, s: 1.3,  k: 1  },  // left dove, banking in toward the light
      { x: 521, y: 226, s: 1.1,  k: -1 },  // right dove, mirrored, a touch deeper
    ];
    const white = (x, y, r) => jig(mix('#fffefc', '#faf4e8', r()), r, 4);
    const shade = (x, y, r) => jig(mix('#7a68b0', '#564a92', r()), r, 6);
    const gold  = (x, y, r) => jig(mix(GOLD_HOT, GOLD_PALE, r() * 0.6), r, 6);
    for (const d of doves) {
      const P = pts => pts.map(([px, py]) => [d.x + px * d.s * d.k, d.y + py * d.s]);
      const body  = P([[11, 6], [4, 2], [-4, 1], [-10, 3]]);            // tail -> breast/head
      const wingU = P([[-1, 1], [3, -6], [8, -12]]);                    // upper wing, curved up
      const wingL = P([[1, 2], [7, -3], [14, -7]]);                     // trailing wing, swept back
      // deep violet under-silhouette first (offset down-right) — the clean dark
      // shape the bright field needs — then the white dove painted over it
      for (const pts of [body, wingU, wingL])
        paintPath(out, counter, rng, pts.map(([px, py]) => [px + 2, py + 2.4]), shade, { lw: 3.4, len: 3, density: 1.05, jitter: 0.3 });
      paintPath(out, counter, rng, body,  white, { lw: 3.4, len: 3, density: 1.25, jitter: 0.25 });
      paintPath(out, counter, rng, wingU, white, { lw: 2.6, len: 2.8, density: 1.2, jitter: 0.3 });
      paintPath(out, counter, rng, wingL, white, { lw: 2.4, len: 2.8, density: 1.15, jitter: 0.3 });
      // one accent: a gold rim on the wing edge facing the gift
      paintPath(out, counter, rng, P([[2, -4], [6, -9]]), gold, { lw: 1.3, len: 2.2, density: 0.95, jitter: 0.25 });
    }
  }
  const skyEnd = out.length;   // BG plane: the luminous field of light (opaque, backmost)

  /* ---------------- 2. THE CHILD'S HANDS — open, from below ----------------  [FG plane] */
  const _fgHands = out.length;
  // deep red sleeves rising out of the bottom dark
  const slL = [{ ax: 344, ay: 512, bx: 366, by: 352, r: 11 }];
  const slR = [{ ax: 458, ay: 512, bx: 420, by: 354, r: 11 }];
  // like real open hands lifted to the light (ref photo): a broad cupped palm,
  // four full fingers held CLOSE together reaching straight UP, thumb swung out —
  // the gift's light shines through the gap between the two hands.
  // CARTOON open-hand silhouette matching the reference: a broad palm, four fingers
  // FANNED up with clear gaps & rounded tips (middle longest, pinky shortest, inner),
  // and the THUMB set LOW on the OUTER side, thick, angled out & down with a deep web
  // gap from the index. The two hands' pinkies frame the light in the middle.
  const handL = [
    { ax: 360, ay: 368, bx: 368, by: 346, r: 13 },     // broad palm + wrist base
    { ax: 358, ay: 344, bx: 352, by: 315, r: 3.9 },    // index
    { ax: 366, ay: 342, bx: 364, by: 306, r: 4.1 },    // middle — longest
    { ax: 374, ay: 343, bx: 378, by: 311, r: 3.9 },    // ring
    { ax: 382, ay: 346, bx: 388, by: 322, r: 3.4 },    // pinky — shortest, inner (toward the gap)
    { ax: 354, ay: 352, bx: 337, by: 359, r: 4.5 },    // THUMB — OUTER (left), low, thick, out & down
  ];
  const handR = [
    { ax: 440, ay: 368, bx: 432, by: 346, r: 13 },     // broad palm + wrist base
    { ax: 442, ay: 344, bx: 448, by: 315, r: 3.9 },    // index
    { ax: 434, ay: 342, bx: 436, by: 306, r: 4.1 },    // middle — longest
    { ax: 426, ay: 343, bx: 422, by: 311, r: 3.9 },    // ring
    { ax: 418, ay: 346, bx: 412, by: 322, r: 3.4 },    // pinky — shortest, inner (toward the gap)
    { ax: 446, ay: 352, bx: 463, by: 359, r: 4.5 },    // THUMB — OUTER (right), low, thick, out & down
  ];
  // THE MAIN CHARACTER — "you" (the receiver): deep-red clothes. The sleeves and
  // the two open cupped hands are all one figure; a lighter outline so the soft
  // open hands don't read as claws.
  const childCaps = slL.concat(slR, handL, handR);
  paintChild(out, counter, rng, childCaps, { outlineW: 3 });
  // dark grooves between the fingers, so the open hands read finger-by-finger
  for (const [ax, ay, bx, by] of [[376, 332, 376, 310], [384, 332, 388, 310], [392, 334, 398, 314], [424, 332, 424, 310], [416, 334, 412, 312], [408, 336, 402, 316]]) {
    paintPath(out, counter, rng, [[ax, ay], [bx, by]], (x, y, r) => jig(mix('#5a3420', '#36200f', r()), r, 6), { lw: 1.4, len: 2.6, density: 0.9, jitter: 0.3 });
  }
  // hot rims on the finger tops — the edges nearest the gift burn
  strokes(out, counter, {
    rng, n: 44,
    sample: rej(352, 300, 448, 352, (x, y) => {
      const all = handL.concat(handR);
      return all.some(c => inCap(x, y, c)) && !all.some(c => inCap(x, y - 3.5, c));
    }),
    dir: (x, y) => Math.atan2(G.y - y, G.x - x) + Math.PI / 2,
    col: (x, y, r) => jig(mix(GOLD_HOT, GOLD, r() * 0.5), r, 7),
    len: 4, lw: 1.5, steps: 2,
  });
  fgRanges.push([_fgHands, out.length]);   // ← the child's open hands are foreground

  /* ---------------- 3. THE OFFERING HAND — larger, gold-lit ----------------  [FAR plane] */
  const _far = out.length;
  // the forearm descends out of the upper dark; the sleeve is night itself —
  // only the hand lives in the light
  const fore = [{ ax: 474, ay: -12, bx: 440, by: 196, r: 15 }];  // reaches down into the palm, so the arm is ONE piece
  underpaintCapsules(out, counter, fore, '#6e5226');
  // the giving arm is GOD's — radiant, not a dark object
  paintFigure(out, counter, rng, fore, (x, y, r) => jig(ramp([GOLD_PALE, GOLD, '#d6a854', '#b08840'], fbm(x / 20, y / 20, 41) * 0.4 + (y + 14) / 360), r, 8), 1.5);
  // wrist + open giving hand, fingers under the gift like a shelf — offering,
  // not gripping: the gift rests ON the hand
  const dHand = [
    { ax: 442, ay: 174, bx: 430, by: 200, r: 11 },    // wrist — overlaps the forearm so the arm reads connected
    { ax: 434, ay: 196, bx: 414, by: 224, r: 12.5 },  // broad open palm, tilted toward us
    { ax: 417, ay: 224, bx: 402, by: 272, r: 3.7 },   // finger 1 — fingers curl DOWN past the gift,
    { ax: 422, ay: 226, bx: 412, by: 278, r: 3.7 },   //   so the fingertips show beneath it and it
    { ax: 427, ay: 226, bx: 424, by: 278, r: 3.5 },   //   clearly reads as a hand cradling the gift
    { ax: 432, ay: 224, bx: 438, by: 272, r: 3.3 },   // finger 4
    { ax: 437, ay: 208, bx: 454, by: 232, r: 4.4 },   // thumb, out to the side
  ];
  underpaintCapsules(out, counter, dHand, '#4a3018');
  paintFigure(out, counter, rng, dHand, (x, y, r) => jig(ramp([GOLD_PALE, GOLD, '#c89a50', '#8a5e36'], fbm(x / 12, y / 12, 41) * 0.4 + 0.2), r, 8), 1.9);
  // dark grooves between the fingers, so four distinct fingers read (not a lump)
  for (const [ax, ay, bx, by] of [[412, 244, 407, 272], [420, 246, 417, 276], [428, 246, 430, 274]]) {
    paintPath(out, counter, rng, [[ax, ay], [bx, by]], (x, y, r) => jig(mix('#5a3a1c', '#3a2410', r()), r, 6), { lw: 1.5, len: 3, density: 0.95, jitter: 0.3 });
  }
  // hot rim down the light-facing edge of the hand + fingertips, so the open
  // giving hand separates cleanly from the dark behind it
  strokes(out, counter, {
    rng, n: 46,
    sample: rej(398, 192, 452, 282, (x, y) => dHand.some(c => inCap(x, y, c)) && !dHand.some(c => inCap(x - 3, y + 2, c))),
    dir: () => -0.5,
    col: (x, y, r) => jig(mix(GOLD_HOT, GOLD_PALE, r() * 0.5), r, 7),
    len: 5, lw: 1.6, steps: 2,
  });
  // egg: the scar in the wrist — one small dark mark the light does not hide
  paintPath(out, counter, rng, [[436.5, 184], [440, 187.5]],
    (x, y, r) => jig(mix('#6e3424', '#4a2018', r()), r, 7), { lw: 2.2, len: 2, density: 1.1, jitter: 0.3 });
  farRanges.push([_far, out.length]);   // ← the giving forearm + hand are the FAR plane

  /* ---------------- 4. THE GIFT ----------------  [MID plane: the gift hovers between] */
  // a small wrapped box, resting on the offered fingers, hovering one breath
  // above the child's open palms — not yet taken
  {
    const bw = 15, bh = 12; // half-extents
    // the wrap: pale warm paper, brightest thing on the plate
    out.push(`<path d="M${G.x - bw} ${R1(G.y + bh * 0.4)}L${G.x - bw + 2} ${R1(G.y - bh)}L${G.x + bw} ${R1(G.y - bh + 2)}L${G.x + bw - 1} ${R1(G.y + bh)}Z" fill="#fff9ec"/>`);
    counter.n++;
    strokes(out, counter, {
      rng, n: 90,
      sample: rej(G.x - bw + 1, G.y - bh + 1, G.x + bw - 1, G.y + bh - 1),
      dir: (x, y) => (fbm(x / 9, y / 9, 51) - 0.5) * 0.8 - 0.1,
      col: (x, y, r) => jig(ramp([GOLD_HOT, '#f6ecd2', GOLD_PALE, GOLD], Math.hypot(x - G.x + 3, y - G.y + 4) / 22), r, 6),
      len: 5, lw: 1.8, steps: 2,
    });
    // the ribbon: deep red — the child's own color, already on the gift —
    // crossing vertical and horizontal (egg: the ribbon makes a cross)
    paintPath(out, counter, rng, [[G.x - 1.5, G.y - bh + 1], [G.x - 0.5, G.y + bh - 1]],
      (x, y, r) => jig(mix('#a83228', '#7a2420', r()), r, 8), { lw: 3.4, len: 3.5, density: 1, jitter: 0.3 });
    paintPath(out, counter, rng, [[G.x - bw + 1, G.y - 1], [G.x + bw - 1, G.y - 2.5]],
      (x, y, r) => jig(mix('#a83228', '#7a2420', r()), r, 8), { lw: 3.2, len: 3.5, density: 1, jitter: 0.3 });
    // the bow: two small loops
    paintPath(out, counter, rng, [[G.x - 5.5, G.y - bh - 2.5], [G.x - 1, G.y - bh - 5], [G.x, G.y - bh + 0.5], [G.x + 1, G.y - bh - 5], [G.x + 5.5, G.y - bh - 2]],
      (x, y, r) => jig(mix('#b83a2e', '#8e2a22', r()), r, 8), { lw: 2.4, len: 2.5, density: 1, jitter: 0.4 });
    // halo: short hot strokes hugging the box edge
    strokes(out, counter, {
      rng, n: 70,
      sample: r => { const a = r() * Math.PI * 2, d = 17 + r() * 9; return [G.x + Math.cos(a) * d * 1.1, G.y + Math.sin(a) * d * 0.9]; },
      dir: (x, y) => Math.atan2(x - G.x, -(y - G.y)),
      col: (x, y, r) => jig(ramp([GOLD_HOT, GOLD_PALE, GOLD], r()), r, 7),
      len: 5.5, lw: 1.6, steps: 2,
    });
    // rays: a few long gold hairlines reaching for the edges of the dark
    strokes(out, counter, {
      rng, n: 26,
      sample: r => { const a = r() * Math.PI * 2, d = 30 + r() * 40; return [G.x + Math.cos(a) * d, G.y + Math.sin(a) * d * 0.9]; },
      dir: (x, y) => Math.atan2(y - G.y, x - G.x),
      col: (x, y, r) => jig(mix(GOLD_PALE, GOLD_DEEP, r()), r, 9),
      len: 16, lw: 0.9, steps: 2, lenJ: 0.7,
    });
  }

  /* ---------------- 5. EGG: the mustard seed ---------------- */
  // already resting in the child's left palm — the faith that asks is
  // already given; it only has to be this small (Matt 17:20)
  paintPath(out, counter, rng, [[374.5, 332], [376.5, 333]],
    (x, y, r) => jig(mix('#d9a93f', '#a8762e', r()), r, 8), { lw: 1.6, len: 1.6, density: 1.2, jitter: 0.2 });

  // MULTIPLANE: assemble the requested depth plane (transparent where empty).
  const ALT = 'A deep dark field of night blues, nearly empty at the edges; at its center a larger gold-lit hand reaches down offering a small wrapped gift with a red ribbon, while two small open hands reach up from below, palms catching the gold — the gift not yet taken, one breath between them.';
  const RAW = { undercoat: 0, weave: 0, varnish: 0, oil: 0 };
  const pick = ranges => ranges.map(([a, b]) => out.slice(a, b).join('\n')).join('\n');
  const claimed = new Set();
  for (const [a, b] of fgRanges) for (let i = a; i < b; i++) claimed.add(i);
  for (const [a, b] of farRanges) for (let i = a; i < b; i++) claimed.add(i);
  if (LAYER === 'bg') return svgWrap(ALT, out.slice(0, skyEnd).join('\n'), RAW);    // field of light (opaque)
  if (LAYER === 'far') return svgWrap(ALT, pick(farRanges), RAW);                   // the giving hand
  if (LAYER === 'fg') return svgWrap(ALT, pick(fgRanges), RAW);                     // the child's hands
  if (LAYER === 'mid') {                                                            // the gift, hovering between
    const body = out.filter((_, i) => i >= skyEnd && !claimed.has(i)).join('\n');
    return svgWrap(ALT, body, RAW);
  }
  return svgWrap(ALT, out.join('\n'));             // full painting (desktop)
}
