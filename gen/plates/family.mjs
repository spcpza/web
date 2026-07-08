// gen/plates/family.mjs — "The family"
// Acts 2:42 — the believers "continued stedfastly... in fellowship, and in
// breaking of bread." POST-RESURRECTION: this is the NEW creation, so it is
// BRIGHT and flourishing (resurrection-flip — never the old dusk). A vibrant
// light-blue sky, gold and green, wildflowers and fruit trees; the recurring
// RED child ("you") gathered with three friends, each in their own colour,
// around a low table of bread. EVERYONE here is in the Light and WASHED, so
// every figure — the red child and each friend — wears a soft WHITE AURA
// (Rev 7:14, "made them white in the blood of the Lamb"). Faces lifted, glad,
// belonging. Munch: living things curve, made things (the table) go straight.
//
// Easter egg: Acts 2:42 in Koine Greek (Βʹ·ΜΒʹ) cut faint into the bright floor.

export const name = 'family';
export const title = 'The family';
export const caption = 'You were given each other.';
export const seed = 11420642;
export const focal = { x: 400, y: 300 }; // the shared table of bread the family rings
// MULTIPLANE (mobile parallax): three planes. BACKGROUND = the bright sky +
// flourishing meadow ground (opaque). MID = the shared table of bread + loaves
// + the fruit trees + wildflowers + inscription. FOREGROUND = the gathered ring
// of washed, white-aura'd figures (nearest us). `full` (desktop) reassembles in
// the ORIGINAL paint order — unchanged.
export const layers = [
  { name: 'bg', opaque: true },   // bright sky + flourishing meadow (backmost)
  { name: 'mid' },                // the table of bread, fruit trees, wildflowers, inscription
  { name: 'fg' },                 // the gathered ring of washed figures (nearest us)
];

export function paint(E, opts = {}) {
  const {
    mulberry32, fbm, curlV, goldenSpiralV, mix, ramp, jig, strokes, rej,
    paintPath, inCap, paintChild, personCaps, castShadow, paintFace, lightRadial,
    ribbon, svgWrap, R1, W, H, ridge,
    fruitTree, groundFlowers, LEAF_PALETTES,
    GOLD, GOLD_PALE, GOLD_DEEP, GOLD_HOT,
  } = E;

  const rng = mulberry32(seed);
  const out = [];           // BACKGROUND then FOREGROUND (figures) accumulate here
  const mid = [];           // MID plane: the table, loaves, trees, flowers, inscription
  const counter = { n: 0 };
  const LAYER = opts.layer || 'full';

  const horizon = 226;
  // a gentle glory over the gathered family — the Light they live in now
  const gL = lightRadial(400, 250, 320);

  // ---------------- 1. THE BRIGHT DAY ----------------  [BG plane, opaque]
  // a vibrant light-blue sky, warm gold + pink low at the horizon, white crown.
  // The sky is nature → it swirls gently (Munch). The new creation rejoices.
  out.push(`<rect width="${W}" height="${H}" fill="#74cef8"/>`);
  const SK = [{ x: 200, y: 70, s: 150, f: 60 }, { x: 560, y: 96, s: -132, f: 56 }, { x: 380, y: 52, s: 118, f: 48 }];
  const skyDir = (x, y) => {
    let [vx, vy] = curlV(x, y, 121, 120);
    vx = vx * 80 + 30; vy = vy * 90;
    for (const v of SK) { const [a, b] = goldenSpiralV(x, y, v.x, v.y, v.s, v.f); vx += a; vy += b; }
    return Math.atan2(vy, vx);
  };
  const skyCol = (x, y, r) => {
    const t = Math.max(0, Math.min(1, (horizon - y) / horizon * 1.05 + fbm(x / 120, y / 120, 133) * 0.3 - 0.02));
    let c = ramp(['#fbd96a', '#f8a8c4', '#54c6f7', '#74cef8', '#a6e2fb', '#f0fbff'], t);
    if (fbm(x / 84, y / 84, 139) + (r() - 0.5) * 0.2 > 0.8) c = mix(c, '#fffdf6', 0.6);  // bright cloud crests
    return jig(c, r, 6);
  };
  strokes(out, counter, {
    rng, n: 560, sample: rej(-12, -12, 812, horizon + 8),
    dir: skyDir, col: skyCol,
    len: 34, lw: 8.5, steps: 4, follow: 0.86, wild: 0.12, lenJ: 0.5, impasto: 0.5,
  });
  // a FLOURISHING meadow — fresh deep green, gold at the lit crowns (Isa 35:1,
  // "the desert shall rejoice, and blossom as the rose"). Its top is a rolling
  // contour, never a ruled line.
  const fieldTop = ridge(horizon, { amp: 20, freq: 150, bumps: 0.35, seed: 131 });
  {
    let d = `M-2 ${R1(fieldTop(-2))}`;
    for (let x = -2; x <= 802; x += 9) d += `L${R1(x)} ${R1(fieldTop(x))}`;
    d += `L802 ${H + 2}L-2 ${H + 2}Z`;
    out.push(`<path d="${d}" fill="#4e8a3c"/>`); counter.n++;
  }
  const MEADOW = ['#3a7a38', '#5e9a40', '#88b84a', '#bcc850', '#e6d266'];
  strokes(out, counter, {
    rng, n: 1500,
    sample: rej(-10, horizon - 22, 810, 512, (x, y) => y > fieldTop(x) - 1),
    dir: (x, y) => { const [vx, vy] = curlV(x, y, 171, 80); return Math.atan2(vy * 0.8 - 0.5, Math.abs(vx) + 0.6); },
    col: (x, y, r) => {
      const g = gL(x, y), depth = (y - horizon) / (H - horizon);
      let c = ramp(MEADOW, 0.12 + fbm(x / 60, y / 60, 177) * 0.7 + depth * 0.35);
      return jig(mix(c, '#f2e08a', g * 0.4), r, 13);
    },
    len: 14, lw: 3.4, steps: 3, lenJ: 0.55, wild: 0.16, impasto: 0.7,
  });
  const bgEnd = out.length;   // BG plane: bright sky + meadow ground (opaque, backmost)

  // ---------------- 2. THE FLOURISHING PLACE ----------------  [MID plane]
  // fruit trees rooted across the meadow (Isa 35:1; Munch free colour)
  fruitTree(mid, counter, rng, 100, 322, 96, 40, LEAF_PALETTES[3], gL);   // blue, left
  fruitTree(mid, counter, rng, 712, 330, 104, 44, LEAF_PALETTES[1], gL);  // pink, right
  fruitTree(mid, counter, rng, 460, 268, 60, 28, LEAF_PALETTES[2], gL);   // teal, mid-distant
  // wildflowers of every colour open across the meadow
  groundFlowers(mid, counter, rng, {
    x0: -6, y0: horizon + 16, x1: 812, y1: 510, n: 380,
    lightFn: gL, depthFn: (x, y) => (y - horizon) / (510 - horizon),
  });

  // ---------------- 3. THE TABLE OF BREAD ----------------  [MID plane]
  // a low warm table the family rings, with small loaves — "breaking of bread".
  // A made thing, so it goes STRAIGHT (Munch).
  const tcx = 400, tableY = 360;
  out.push(`<path d="M${R1(tcx - 96)} ${R1(tableY + 14)}L${R1(tcx - 78)} ${R1(tableY - 8)}L${R1(tcx + 78)} ${R1(tableY - 8)}L${R1(tcx + 96)} ${R1(tableY + 14)}Z" fill="#caa35e"/>`);
  out.push(`<path d="M${R1(tcx - 78)} ${R1(tableY - 8)}L${R1(tcx + 78)} ${R1(tableY - 8)}L${R1(tcx + 70)} ${R1(tableY - 16)}L${R1(tcx - 70)} ${R1(tableY - 16)}Z" fill="#e6c684"/>`);
  counter.n += 2;
  strokes(mid, counter, {
    rng, n: 200,
    sample: rej(tcx - 92, tableY - 16, tcx + 92, tableY + 12),
    dir: () => 0.02,
    col: (x, y, r) => jig(mix(ramp(['#b08a4a', '#caa35e', '#e6c684'], fbm(x / 30, y / 30, 311) * 0.6 + 0.2), '#fff0c0', gL(x, y) * 0.4), r, 8),
    len: 14, lw: 3, steps: 2, lenJ: 0.5, wild: 0.05, impasto: 0.4,
  });
  // small loaves on the table, glowing in the day
  for (const lx of [tcx - 56, tcx - 18, tcx + 20, tcx + 56, tcx - 36, tcx + 38]) {
    const ly = tableY - 13 + (rng() - 0.5) * 4;
    const lit = gL(lx, ly);
    mid.push(ribbon([[lx - 10, ly], [lx + 10, ly]], 10, jig(mix('#d8a85c', '#fff0c0', 0.4 + lit * 0.4), rng, 8))); counter.n++;
    mid.push(ribbon([[lx - 4, ly - 3], [lx + 1, ly - 2]], 2.6, '#fff6dc')); counter.n++;
  }
  // ---------------- 3b. LIFE — DOVES AT REST ----------------  [MID plane]
  // Doves SETTLED (not flying) on the treetops over the gathering — peace has
  // come to rest on this house (Matt 10:13 "let your peace come upon it";
  // Ps 84:3 "yea, the sparrow hath found an house... even thine altars").
  // Living things curve (Munch); bold simple silhouettes, one accent each.
  // A dedicated rng so no existing stroke re-rolls.
  const rngL = mulberry32(20260707);
  const dove = (arr, dx, dy, s, f) => {
    // seat shade — a slim perch-shadow where the bird rests (grounds it)
    arr.push(ribbon([[dx - 4.5 * s * f, dy + 4 * s], [dx + 3.5 * s * f, dy + 4.3 * s]], 2.2 * s, '#2a5648')); counter.n++;
    // tail folded back
    arr.push(ribbon([[dx - 12 * s * f, dy + 2.6 * s], [dx - 4 * s * f, dy + 0.6 * s]], 3.6 * s, '#d8d6e8')); counter.n++;
    // plump warm-white body, breast full
    paintPath(arr, counter, rngL, [[dx - 6 * s * f, dy + 1.2 * s], [dx + 1 * s * f, dy - 0.8 * s], [dx + 5.5 * s * f, dy + 0.4 * s]], (x, y, r) => jig(mix('#fdfbf2', '#e8e6f2', r() * 0.4), r, 5), { lw: 6.5 * s, len: 4 * s, density: 0.95, jitter: 0.4 });
    // folded wing along the back — a firm grey-blue curve
    paintPath(arr, counter, rngL, [[dx - 8 * s * f, dy + 0.6 * s], [dx - 2 * s * f, dy - 1.6 * s], [dx + 2.5 * s * f, dy - 0.2 * s]], (x, y, r) => jig('#8894b8', r, 6), { lw: 2.6 * s, len: 3.5 * s, density: 0.9, jitter: 0.35 });
    // round head, lifted clear of the shoulders so the neck reads
    arr.push(ribbon([[dx + 4.5 * s * f, dy - 5 * s], [dx + 7.8 * s * f, dy - 5.4 * s]], 5.4 * s, '#fdfbf2')); counter.n++;
    // beak + dark eye dot — the one accent that makes it read
    arr.push(ribbon([[dx + 9 * s * f, dy - 5.4 * s], [dx + 11 * s * f, dy - 4.7 * s]], 1.7 * s, '#d89a48')); counter.n++;
    arr.push(ribbon([[dx + 6 * s * f, dy - 5.8 * s], [dx + 7.1 * s * f, dy - 5.6 * s]], 1.6 * s, '#2a2438')); counter.n++;
  };
  dove(mid, 444, 194, 1.2, 1);    // a pair at rest on the mid crown, turned
  dove(mid, 476, 193, 1.2, -1);   //   toward one another — settled peace
  dove(mid, 97, 205, 1.3, 1);     // one on the blue tree, watching the family
  const midGroundEnd = mid.length;   // MID so far: trees + flowers + table + loaves + doves (UNDER the figures)

  // ---------------- 4. THE GATHERED FAMILY ----------------  [FG plane]
  // four figures drawn up around the table: the RED child ("you") nearest us,
  // and three friends each in their own colour. EVERYONE is washed and in the
  // Light, so EVERY figure gets a soft WHITE AURA (Rev 7:14). Each leans gently
  // toward the shared bread, faces glad and lifted.
  const figs = [
    // [feet x, feet y, scale, lean toward table, palette|null=red, seed]
    [400, 482, 1.00, 0.0, null, 91, 'open'],                                     // YOU — the red child, front & centre: arms spread in glad welcome
    [250, 462, 0.94, 0.40, ['#2c4e8c', '#1c356a', '#101f44'], 31, 'cheer'],     // blue, left — both arms thrown UP, laughing with joy
    [552, 464, 0.94, -0.40, ['#2c7a52', '#1c5638', '#0e3322'], 47, 'reach'],    // green, right — reaching IN to share the bread
    [322, 412, 0.82, 0.28, ['#7a4ab0', '#5a2f90', '#3a1c64'], 67, 'lift'],      // violet, behind-left — hands lifted to the Light in wonder
    [486, 410, 0.82, -0.28, ['#d2922e', '#b0701a', '#7a4c10'], 53, 'clasp'],    // amber, behind-right — hands together at the chest, tender
  ];
  // build figures back-to-front (farthest/highest first) so nearer overlap
  const order = [3, 4, 1, 2, 0];
  const built = {};
  for (const idx of order) {
    const [fx, feet, s, lean, pal, fseed, gesture] = figs[idx];
    const hx = fx + lean * 18;   // head shifts toward the table
    const toToward = Math.sign(tcx - fx) || 1;   // +1 if the table is to its right
    // PURE JOY — every one rejoicing: both arms flung OUT and UP, ELBOWS LOCKED
    // straight (the hands are placed well past full arm-reach, so the arms lock
    // out instead of bending). Faces lifted. A small per-figure variation in the
    // spread/height keeps them individuals, not five identical clones.
    const V = ({ open: [48, 176], cheer: [30, 188], reach: [42, 180], lift: [28, 186], clasp: [40, 178] })[gesture] || [40, 180];
    const P = {
      lean: lean * 9, headTilt: -lean * 4,                          // chest open, face lifted up
      leftHand: [fx - V[0] * s, feet - V[1] * s],                   // arms OUT & UP, straight — rejoicing
      rightHand: [fx + V[0] * s, feet - (V[1] - 3) * s],
      leftFoot: [fx - 9 * s, feet - 4], rightFoot: [fx + 9 * s, feet - 4],
    };
    const caps = personCaps(fx, feet - 165 * s, 161 * s, P);
    // a cast shadow grounding each one — the Light is central, so shadows fall OUTWARD
    castShadow(out, counter, caps, { dir: (Math.sign(fx - tcx) || 1) * 0.4, ground: feet + 1, op: 0.26 });
    // EVERY figure is washed and in the Light → a soft WHITE AURA for all of them
    if (pal === null) paintChild(out, counter, rng, caps, { whiteAura: true, outlineW: 4 });
    else paintChild(out, counter, rng, caps, { cols: pal, seed: fseed, whiteAura: true, outlineW: 4 });
    built[idx] = { fx, feet, s, lean, hx, caps };
  }

  // a warm glad light on each lifted face — the warmest paint
  for (const idx of order) {
    const { fx, feet, s, lean, hx, caps } = built[idx];
    const toward = Math.sign(tcx - fx) || 1;   // which side faces the table
    // soft daylight rim on the table-facing flank
    strokes(out, counter, {
      rng, n: Math.round(36 * s),
      sample: rej(fx - 30 * s, feet - 160 * s, fx + 30 * s, feet - 30, (x, y) => caps.some(c => inCap(x, y, c)) && !caps.some(c => inCap(x + 5 * toward, y, c))),
      dir: () => -Math.PI / 2 + 0.25 * toward,
      col: (x, y, r) => jig(mix(GOLD_PALE, '#fff6dc', r() * 0.5), r, 10),
      len: 6.5, lw: 1.8, steps: 2,
    });
    // the face, glad and lifted into the day
    const fc = [hx + lean * 2, feet - 148 * s];
    strokes(out, counter, {
      rng, n: Math.round(56 * s),
      sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 1.25) * 10 * s; return [fc[0] + Math.cos(a) * d * 0.85, fc[1] + Math.sin(a) * d]; },
      dir: (x, y) => lean * 0.8 + (fbm(x / 7, y / 7, 79) - 0.5) * 0.8,
      col: (x, y, r) => {
        const d = Math.hypot(x - fc[0], y - fc[1]);
        return jig(ramp([GOLD_HOT, GOLD_PALE, GOLD, '#e3b46a', '#c98e4e'], d / (12 * s) + (r() - 0.5) * 0.15), r, 7);
      },
      len: 5 * s, lw: 1.8 * s, steps: 2, wJ: 0.5, lenJ: 0.5, impasto: 0.7,
    });
    // a calm, glad eye — one short dark stroke; tenderness, not detail
    paintPath(out, counter, rng, [[fc[0] - 3.5 * s, fc[1] - 1 * s], [fc[0] + 0.5 * s, fc[1] - 2 * s]], (x, y, r) => jig('#5e3a1e', r, 6), { lw: 1.3, len: 2 * s, density: 0.9, jitter: 0.3 });
  }

  // ---------------- 4b. LIFE — THE LITTLE DOG ----------------  [FG plane]
  // a small warm-brown dog sitting at the edge of the ring, looking in at the
  // circle — the household's least member also belongs at this table
  // (Mark 7:28, "yes, Lord: yet the dogs under the table eat of the
  // children's crumbs" — and here there is bread enough). Living thing →
  // curved strokes (Munch); one white chest splash + eye dot as the accent.
  {
    const gy = 494;                 // where it sits, in the open gap left of "you"
    // soft ground shadow first (the Light is central → shadow falls OUTWARD, left)
    out.push(ribbon([[296, gy + 2], [326, gy + 3]], 5, '#2e5224')); counter.n++;
    // tail curled round the haunch — a happy upward curve
    paintPath(out, counter, rngL, [[298, gy - 4], [293.5, gy - 10], [296.5, gy - 16]], (x, y, r) => jig('#54341a', r, 8), { lw: 3.6, len: 3.5, density: 0.95, jitter: 0.4 });
    // rear haunch — a round warm-brown mass
    paintPath(out, counter, rngL, [[301, gy - 9], [308, gy - 11], [312, gy - 9]], (x, y, r) => jig(mix('#8a5a2e', '#6e4420', r() * 0.5), r, 9), { lw: 13, len: 4, density: 0.95, jitter: 0.4 });
    // chest rising to the lifted head — it sits tall, watching the family
    paintPath(out, counter, rngL, [[308, gy - 12], [314, gy - 17], [317, gy - 22]], (x, y, r) => jig(mix('#96662f', '#7a4c24', r() * 0.5), r, 9), { lw: 9, len: 4, density: 0.95, jitter: 0.4 });
    // white chest splash — the one bright accent
    out.push(ribbon([[314, gy - 14], [316, gy - 18]], 3.6, '#f4e6c8')); counter.n++;
    // head, tipped up toward the circle
    paintPath(out, counter, rngL, [[317, gy - 25], [321, gy - 26.5], [325, gy - 25]], (x, y, r) => jig(mix('#96662f', '#7a4c24', r() * 0.4), r, 8), { lw: 8.5, len: 3.5, density: 0.95, jitter: 0.35 });
    // muzzle nub + dark nose, pointed IN at the gathering
    out.push(ribbon([[325, gy - 24.5], [329, gy - 23.5]], 4, '#7a4c24')); counter.n++;
    out.push(ribbon([[329, gy - 23.8], [330.5, gy - 23.4]], 2, '#2e1c0c')); counter.n++;
    // a soft floppy ear, darker
    out.push(ribbon([[317, gy - 29], [314.5, gy - 23]], 3.2, '#54341a')); counter.n++;
    // bright glad eye — looking in
    out.push(ribbon([[322, gy - 26], [323.2, gy - 25.8]], 1.6, '#241608')); counter.n++;
    // two small front legs planted — darker, so they hold against the meadow
    paintPath(out, counter, rngL, [[315, gy - 11], [314.5, gy - 2]], (x, y, r) => jig('#5a3618', r, 7), { lw: 3.2, len: 3, density: 0.95, jitter: 0.3 });
    paintPath(out, counter, rngL, [[320, gy - 10], [320.5, gy - 2]], (x, y, r) => jig('#4e3014', r, 7), { lw: 3.2, len: 3, density: 0.95, jitter: 0.3 });
    // warm gold rim where the central Light catches its face and chest
    out.push(ribbon([[318, gy - 28.5], [324, gy - 27.5]], 1.8, mix(GOLD_PALE, '#fff6dc', 0.4))); counter.n++;
  }

  // ---------------- 5. EASTER EGG — Acts 2:42 in Koine Greek ----------------
  // "and they continued stedfastly... in fellowship, and in breaking of bread"
  // cut faint into the bright floor beneath the gathered family.  [MID plane]
  E.inscriptionText(mid, E.greekRef(2, 42), { x: 400, y: 408, h: 14, body: '#2c4a1e', edge: '#f6f4d6', op: 0.5, edgeOp: 0.42 });

  const ALT = 'A family gathered in a bright flourishing meadow around a low table of bread under a vibrant light-blue sky — the recurring red child and four friends, each a simple outlined figure in its own colour, every one ringed with a soft white aura, faces lifted and glad, fruit trees and wildflowers all around; white doves settled at rest on the treetops, and a small brown dog sitting at the edge of the ring, looking in.';

  // MULTIPLANE: assemble the requested depth plane (transparent where empty).
  // `out` holds the BG ground (0..bgEnd) then the FG family (bgEnd..).
  // `mid` holds the flourishing place: midGroundEnd splits the trees+flowers+table
  // +loaves (under the figures) from the inscription (over the floor).
  const RAW = { undercoat: 0, weave: 0, varnish: 0, oil: 0 };
  if (LAYER === 'bg') return svgWrap(ALT, out.slice(0, bgEnd).join('\n'), RAW);            // bright sky + meadow (opaque)
  if (LAYER === 'mid') return svgWrap(ALT, mid.join('\n'), RAW);                            // trees + flowers + table + loaves + inscription
  if (LAYER === 'fg') return svgWrap(ALT, out.slice(bgEnd).join('\n'), RAW);                // the gathered family
  // full painting (desktop): sky+meadow, trees+flowers+table, the family, then
  // the inscription on the floor — the ORIGINAL paint order, unchanged.
  return svgWrap(ALT, out.slice(0, bgEnd)
    .concat(mid.slice(0, midGroundEnd), out.slice(bgEnd), mid.slice(midGroundEnd))
    .join('\n'));
}
