// gen/plates/paid.mjs — "He paid the whole price" (§10) — DEEP SORROW.
//
//   "Christ died for our sins according to the scriptures." — 1 Corinthians 15:3
//
// The Light became the bridge (the page before) — and it cost everything. Now,
// DEEP SORROW: darkness over all the land at noon (Matthew 27:45). The sun has
// gone black, only a thin grieving corona around it; the sky is a heavy
// mourning violet-blue. On a dark hill stands the cross of dark wood, and the
// gold Light clings to it and POURS OUT — draining down the beam, spent, dimming
// into the dark. Drops of deep red fall. At its foot a small child in red is
// curled, sheltered — the price paid in your place.
//
// No interior, no mother — the outdoor journey continues: this is the cost of
// the bridge, and it is grief. The next page is the third morning.

export const name = 'paid';
export const title = 'He paid the whole price';
export const caption = 'It cost the Light everything.';
export const seed = 20261010;
export const focal = { x: 400, y: 286 }; // portrait window: the cross, the poured-out light, the child at its foot
// MOBILE 3D — depth planes (FAR→NEAR): the mourning sky + the black sun behind;
// the dark hill, the cross and the poured-out light in the middle; the small
// curled child closest. Tilt to look up at the darkened sun, down at the child.
export const layers = [
  { name: 'bg', opaque: true },   // the mourning sky (backmost)
  { name: 'far' },                // the black sun + its grieving corona, hung high
  { name: 'mid' },                // the hill, the cross + the poured-out light (one connected body), the red drops
  { name: 'fg' },                 // the small child sheltered at the foot
];

export function paint(E, opts = {}) {
  const {
    mulberry32, fbm, curlV, goldenSpiralV, mix, ramp, jig, strokes, rej,
    paintFigure, paintPath, underpaintCapsules, paintChild, inCap,
    svgWrap, R1, W, H,
    GOLD, GOLD_PALE, GOLD_DEEP, GOLD_HOT, NIGHT, DARKEST,
  } = E;

  const rng = mulberry32(seed);
  const out = [];
  const counter = { n: 0 };
  const LAYER = opts.layer || 'full';
  const fgRanges = [];
  const farRanges = [];
  out.push(`<rect width="${W}" height="${H}" fill="#0e1228"/>`);   // deep mourning — never black

  /* ---------------- GEOMETRY ---------------- */
  const SUN = { x: 410, y: 114 };                                   // the sun gone dark (Matt 27:45)
  const hillY = x => 350 - 12 * Math.exp(-(((x - 400) / 300) ** 2)) + 6 * Math.sin(x / 140);
  const CX = 400, crossTop = 176, beamY = 250, beamL = 346, beamR = 454;
  const footY = hillY(CX);                                          // where the cross stands in the hill

  /* ---------------- 1. THE MOURNING SKY — darkness over all the land ----------------
     heavy, slow, sorrowful; deep violet-blue, a violet shudder of grief. */
  const skyDir = (x, y) => { const [a, b] = curlV(x, y, 27, 150); const [sa, sb] = goldenSpiralV(x, y, SUN.x, SUN.y, 70, 100); return Math.atan2(b * 50 + sb + 6, a * 50 + sa); };
  const skyCol = (x, y, r) => {
    const d = Math.hypot(x - SUN.x, y - SUN.y);
    let c = ramp(['#141634', '#1e2046', '#2a2654', '#352c58', '#42365e'], Math.min(1, 0.14 + fbm(x / 110, y / 110, 7) * 0.55 + (y / 360) * 0.28));
    if (d > 36 && d < 58 && r() < 0.4) c = mix(c, '#8a6638', 0.55);   // the thin grieving corona
    if (r() < 0.014) c = jig('#5a3a72', r, 14);                       // a violet shudder of grief
    return jig(c, r, 9);
  };
  strokes(out, counter, { rng, n: 1500, sample: rej(-10, -10, 810, 366, (x, y) => y < hillY(x) + 8), dir: skyDir, col: skyCol, len: 30, lw: 4.6, steps: 4, follow: 0.86, wild: 0.12, lenJ: 0.5, impasto: 0.5, relief: 0.5 });
  const skyEnd = out.length;   // BG plane: the mourning sky (opaque, backmost)

  /* ---------------- 2. THE BLACK SUN — the day turned to night at noon ----------------  [FAR plane] */
  const _far = out.length;
  out.push(`<circle cx="${SUN.x}" cy="${SUN.y}" r="36" fill="#0a0c1e"/>`); counter.n++;
  strokes(out, counter, {
    rng, n: 140,
    sample: r => { const a = r() * Math.PI * 2, d = 36 + Math.pow(r(), 1.2) * 16; return [SUN.x + Math.cos(a) * d, SUN.y + Math.sin(a) * d]; },
    dir: (x, y) => Math.atan2(y - SUN.y, x - SUN.x) + Math.PI / 2,
    col: (x, y, r) => jig(ramp(['#a8843e', '#6e5530', '#3a3056'], (Math.hypot(x - SUN.x, y - SUN.y) - 36) / 18), r, 8),
    len: 7, lw: 1.8, steps: 2,
  });
  farRanges.push([_far, out.length]);   // ← the black sun is the FAR plane (parallaxes against the sky on tilt-up)

  /* ---------------- 3. THE HILL — the place of the skull (Golgotha), dark ---------------- */
  out.push(`<path d="M-2 ${R1(hillY(-2))}L805 ${R1(hillY(805))}V504H-2Z" fill="#0c1024"/>`); counter.n++;
  strokes(out, counter, {
    rng, n: 700, sample: rej(-10, 336, 810, 510, (x, y) => y > hillY(x)),
    dir: x => { const e = 6; return Math.atan2(hillY(x + e) - hillY(x - e), 2 * e); },
    col: (x, y, r) => jig(ramp(['#0c1024', '#141a34', '#1e2440'], fbm(x / 70, y / 50, 29) * 0.8), r, 7),
    len: 22, lw: 4.4, steps: 3, wild: 0.1, lenJ: 0.5,
  });

  /* ---------------- 4. THE CROSS — dark wood ---------------- */
  out.push(`<rect x="${R1(CX - 6)}" y="${crossTop}" width="12" height="${R1(footY - crossTop)}" fill="#120e1c"/>`); counter.n++;
  out.push(`<rect x="${beamL}" y="${R1(beamY - 6)}" width="${beamR - beamL}" height="12" fill="#120e1c"/>`); counter.n++;
  strokes(out, counter, {
    rng, n: 130,
    sample: r => (r() < 0.62 ? [CX + (r() + r() - 1) * 6, crossTop + r() * (footY - crossTop)] : [beamL + r() * (beamR - beamL), beamY + (r() + r() - 1) * 6]),
    dir: (x, y) => (Math.abs(x - CX) < 8 ? -Math.PI / 2 : 0),
    col: (x, y, r) => jig(mix('#1a1428', '#3a2e44', r() * 0.6), r, 6), len: 9, lw: 2.2, steps: 2,
  });

  /* ---------------- 5. THE LIGHT POURED OUT — it gave everything ----------------
     gold clings to the cross and drains down the post, dimming, spent into the
     dark; the beam still bright, the foot gone to ash-violet. */
  strokes(out, counter, {
    rng, n: 440,
    sample: r => {
      if (r() < 0.4) { const x = beamL + r() * (beamR - beamL); return [x, beamY + (r() + r() - 1) * 9]; }
      const y = beamY + r() * (footY + 26 - beamY); return [CX + (r() + r() - 1) * 12, y];
    },
    dir: (x, y) => (Math.abs(y - beamY) < 12 && Math.abs(x - CX) > 14 ? 0 : Math.PI / 2 + 0.05),
    col: (x, y, r) => { const t = Math.max(0, (y - beamY) / (footY + 26 - beamY)); return jig(ramp([GOLD_HOT, GOLD_PALE, GOLD, GOLD_DEEP, '#6a5238', '#3a3052'], Math.min(1, t * 0.9 + Math.abs(x - CX) / 42)), r, 8); },
    len: 14, lw: 3, steps: 3, follow: 0.9, lenJ: 0.5, impasto: 0.4,
  });
  // a spent, dim pool of the last light on the dark ground at the foot
  strokes(out, counter, {
    rng, n: 120,
    sample: r => { const a = r() * Math.PI, d = Math.pow(r(), 1.3) * 64; return [CX + Math.cos(a + Math.PI) * d * 1.3, footY + 2 + Math.abs(Math.sin(a)) * d * 0.3]; },
    dir: () => 0.04,
    col: (x, y, r) => { const d = Math.hypot((x - CX) / 1.3, (y - footY) * 3); return jig(ramp(['#6a5230', '#4a3c3e', '#2a2440', '#161a34'], d / 70), r, 8); },
    len: 11, lw: 2.6, steps: 2,
  });

  /* ---------------- 6. DROPS OF DEEP RED — the price (the blood) ---------------- */
  for (let i = 0; i < 10; i++) {
    const dx = CX + (rng() - 0.5) * 30, dy = beamY + 10 + rng() * (footY - beamY + 30);
    paintPath(out, counter, rng, [[dx, dy], [dx + 0.6, dy + 5 + rng() * 4]], (x, y, r) => jig(mix('#8a1c1c', '#b83030', r()), r, 8), { lw: 1.9, len: 2.6, density: 1, jitter: 0.2 });
  }

  /* ---------------- 7. THE CHILD — sheltered at the foot, in your place ----------------  [FG plane] */
  const _fgChild = out.length;
  {
    const cx = CX + 32, fy = hillY(cx) + 2;
    // HAND-BUILT curled child (no personCaps — it can't pose a curl). The most
    // tender pose: knees folded up to the chest, head bowed in grief, arms drawn
    // close around the knees. Cute-chunky: big round head, short torso, chunky
    // articulated legs (thigh+shin, knee bent tight) + arms (elbow bent).
    // h≈28; head r≈3.7, torso r≈3.0, leg r≈2.2, arm r≈1.7.
    const hcx = cx - 3, hcy = fy - 22;       // head ball, bowed forward over the knees
    const shx = cx + 2, shy = fy - 15;       // shoulders set back, torso curls forward+down
    const hipx = cx + 4, hipy = fy - 3;      // hips, seated low on the ground
    const kneex = cx - 8, kneey = fy - 11;   // knees drawn UP+FORWARD (left), bulging out
    const footx = cx - 3, footy = fy;        // feet folded back under
    const caps = [
      { ax: hcx, ay: hcy - 1.2, bx: hcx + 1, by: hcy + 1.2, r: 3.7 },     // head ball, bowed
      { ax: hcx + 1.5, ay: hcy + 3.4, bx: shx, by: shy, r: 1.7 },         // short neck
      { ax: shx, ay: shy, bx: hipx, by: hipy, r: 3.0 },                   // chunky torso, curled
      // near leg: thigh up to raised knee, shin folded down to ground
      { ax: hipx, ay: hipy, bx: kneex, by: kneey, r: 2.2 },              // thigh up to knee
      { ax: kneex, ay: kneey, bx: footx, by: footy, r: 1.9 },            // shin folded down
      { ax: hipx + 1, ay: hipy, bx: kneex + 3, by: kneey + 1, r: 2.2 },  // far thigh
      { ax: kneex + 3, ay: kneey + 1, bx: footx + 4, by: footy, r: 1.9 },// far shin
      // arms drawn close, wrapped around the knees
      { ax: shx, ay: shy + 3, bx: kneex, by: kneey - 1, r: 1.7 },        // upper arm over knees
      { ax: kneex, ay: kneey - 1, bx: kneex + 2, by: kneey + 4, r: 1.5 },// forearm hugging knees
    ];
    // THE MAIN CHARACTER — "you": consistent deep-red clothes + bold dark outline
    // so the reader can follow the same child across the whole book.
    paintChild(out, counter, rng, caps);
    // a breath of the cross's last dim gold on the child's near side — sheltered
    strokes(out, counter, {
      rng, n: 12,
      sample: rej(cx - 9, fy - 24, cx + 2, fy, (x, y) => caps.some(c => inCap(x, y, c)) && !caps.some(c => inCap(x - 3, y, c))),
      dir: () => -0.4, col: (x, y, r) => jig(mix(GOLD_DEEP, '#7a5a30', r() * 0.5), r, 9), len: 3.5, lw: 1.3, steps: 2,
    });
  }
  fgRanges.push([_fgChild, out.length]);   // ← the child at the foot is foreground

  /* ---------------- EGG: 1 Cor 15:3 in ORIGINAL KOINE GREEK, cut into the dark hill ----------------
     ΙΕʹ·Γʹ (ΙΕ=15, Γ=3): "Christ died for our sins according to the scriptures." */
  {
    E.inscriptionText(out, E.greekRef(15, 3), { x: 160, y: 470, h: 18, body: '#cdd4ea', edge: '#10162c', op: 0.8, edgeOp: 0.5 });
  }

  // MULTIPLANE: assemble the requested depth plane (transparent where empty).
  const ALT = 'Darkness over all the land at noon: a sun gone black with only a thin grieving corona of dim gold, a heavy mourning violet-blue sky, and on a dark hill a cross of dark wood from which the gold Light clings and pours out, draining and spent into the dark; drops of deep red fall from it, and at its foot a small child in red is curled and sheltered. The whole price paid, in your place. Deep sorrow.';
  const RAW = { undercoat: 0, weave: 0, varnish: 0, oil: 0 };
  const pick = ranges => ranges.map(([a, b]) => out.slice(a, b).join('\n')).join('\n');
  const claimed = new Set();
  for (const [a, b] of fgRanges) for (let i = a; i < b; i++) claimed.add(i);
  for (const [a, b] of farRanges) for (let i = a; i < b; i++) claimed.add(i);
  if (LAYER === 'bg') return svgWrap(ALT, out.slice(0, skyEnd).join('\n'), RAW);    // mourning sky (opaque)
  if (LAYER === 'far') return svgWrap(ALT, pick(farRanges), RAW);                   // the black sun
  if (LAYER === 'fg') return svgWrap(ALT, pick(fgRanges), RAW);                     // the child
  if (LAYER === 'mid') {                                                            // hill, cross + poured light, drops, egg
    const body = out.filter((_, i) => i >= skyEnd && !claimed.has(i)).join('\n');
    return svgWrap(ALT, body, RAW);
  }
  return svgWrap(ALT, out.join('\n'));             // full painting (desktop)
}
