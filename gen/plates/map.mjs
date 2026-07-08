// gen/plates/map.mjs — "Passing the map on" (§17)
// Hill country at low sun. An old figure with a walking stick has come to
// the end of a long winding trail — footprints trailing back to the horizon
// where the sun sits low. They kneel, handing a drawn map to the red child.
// The child's own trail starts at their feet and runs off-frame the other
// way. The handoff is the focal point, rim-lit by the low sun.
//
// Egg: the map in the old hand shows the looping road of plate 07 — and the
// old one's own walked trail carries the same loop. The road drawn is the
// road walked.
//
// Paint order: sky -> sun -> far hills -> near ground -> old trail +
// footprints -> child trail -> figures -> the map -> rim light.

export const name = 'map';
export const title = 'Passing the map on';
export const caption = "You can't give them your walking — but you can draw the map.";
export const seed = 20260617;
export const focal = { x: 400, y: 350 }; // portrait window: the map handoff between old hand and child

export function paint(E) {
  const {
    mulberry32, fbm, curlV, swirlV, mix, ramp, jig, strokes, rej,
    paintFigure, paintPath, underpaintCapsules, inCap, svgWrap, R1, W, H,
    GOLD, GOLD_PALE, GOLD_DEEP, GOLD_HOT, NIGHT, DARKEST,
  } = E;

  const rng = mulberry32(seed);
  const out = [];
  const counter = { n: 0 };

  out.push(`<rect width="${W}" height="${H}" fill="${DARKEST}"/>`);

  /* ---------------- LIGHT MODEL ---------------- */
  // the low sun, left horizon — the ONE source; everything warms toward it
  const sun = [128, 148];
  const lightAt = (x, y) => Math.min(1, Math.exp(-Math.hypot((x - sun[0]) * 0.9, (y - sun[1]) * 1.25) / 260));

  /* ---------------- 1. SKY ---------------- */
  const ridgeY = x => 212 - 26 * Math.exp(-(((x - 150) / 180) ** 2)) + 18 * Math.sin(x / 170) + x * 0.02;
  const skyDir = (x, y) => {
    let [vx, vy] = swirlV(x, y, sun[0], sun[1], 170, 80);
    const [cx2, cy2] = curlV(x, y, 23, 130);
    vx += cx2 * 110 + 26; vy += cy2 * 110;
    return Math.atan2(vy, vx);
  };
  const slash = (x, y) => 0.14 + lightAt(x, y) * 0.4;
  strokes(out, counter, {
    rng, n: 1150,
    sample: rej(-10, -10, 810, 240, (x, y) => y < ridgeY(x) + 10),
    dir: skyDir,
    col: (x, y, r) => {
      const g = lightAt(x, y);
      if (g > 0.18 && g < 0.32 && r() < 0.04) return jig('#7a4f9e', r, 14); // violet sparks where gold dies
      let c = ramp([mix(NIGHT[1], '#3a3458', 0.4), '#46466e', '#8a6a48', '#c9943e', GOLD_DEEP], Math.min(1, g * 1.45 + fbm(x / 100, y / 100, 29) * 0.22));
      return jig(c, r, 9);
    },
    len: 32, lw: 4.4, steps: 3, follow: 0.88, wild: 0.16, aJ: slash, lenJ: 0.5, impasto: 0.58,
  });
  // the sun: a low gold disc, heavy impasto rings
  strokes(out, counter, {
    rng, n: 230,
    sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 0.7) * 30; return [sun[0] + Math.cos(a) * d, sun[1] + Math.sin(a) * d * 0.9]; },
    dir: (x, y) => Math.atan2(x - sun[0], -(y - sun[1])),
    col: (x, y, r) => jig(ramp([GOLD_HOT, GOLD_PALE, GOLD, GOLD_DEEP], Math.hypot(x - sun[0], y - sun[1]) / 32), r, 7),
    len: 9, lw: 2.8, steps: 2, wJ: 0.5, impasto: 0.72,
  });

  /* ---------------- 2. FAR HILLS ---------------- */
  // a violet-blue far ridge, sun-rimmed on its left shoulders
  strokes(out, counter, {
    rng, n: 480,
    sample: rej(-10, 180, 810, 300, (x, y) => y > ridgeY(x) && y < ridgeY(x) + 70),
    dir: x => { const e = 7; return Math.atan2(ridgeY(x + e) - ridgeY(x - e), 2 * e); },
    col: (x, y, r) => {
      const g = lightAt(x, y);
      let c = mix('#222a52', '#3c3a66', fbm(x / 80, y / 40, 37));
      return jig(mix(c, '#b8893e', g * 0.75), r, 9);
    },
    len: 22, lw: 3.4, steps: 3, wild: 0.14, aJ: 0.12, lenJ: 0.5,
  });

  /* ---------------- 3. NEAR GROUND ---------------- */
  // rolling ochre hill country falling toward the viewer
  const groundTop = x => ridgeY(x) + 58 + 14 * Math.sin(x / 110);
  strokes(out, counter, {
    rng, n: 1280,
    sample: rej(-10, 230, 810, 510, (x, y) => y > groundTop(x)),
    dir: (x, y) => (fbm(x / 110, y / 70, 41) - 0.5) * 0.3 + 0.04,
    col: (x, y, r) => {
      const g = lightAt(x, y) * 0.9;
      if (g > 0.16 && g < 0.27 && r() < 0.02) return jig('#6a4f9e', r, 12);
      let c = ramp(['#1c2244', '#34355a', '#5e5236', '#96793c', '#b8935a'], Math.min(1, g * 1.55 + fbm(x / 75, y / 55, 43) * 0.26 - 0.06));
      return jig(c, r, 8);
    },
    len: 28, lw: 4.4, steps: 3, follow: 0.9, wild: 0.14, aJ: (x, y) => 0.1 + lightAt(x, y) * 0.2, lenJ: 0.5, impasto: 0.62,
  });

  /* ---------------- 4. THE OLD TRAIL ---------------- */
  // winding from the horizon near the sun down to the old one's knees —
  // and it carries ONE loop on its way (the road of plate 07, walked).
  const oldKnee = [352, 372];
  const trailPts = [
    [176, 216], [232, 228], [210, 246], [258, 252], [318, 244],
    // the loop — walked
    [342, 258], [322, 274], [296, 268], [304, 252], [338, 248],
    [368, 270], [330, 300], [296, 318], [318, 342], [352, 372],
  ];
  const trailAt = t => { // piecewise linear param
    const i = Math.min(trailPts.length - 2, Math.floor(t * (trailPts.length - 1)));
    const f = t * (trailPts.length - 1) - i;
    return [trailPts[i][0] + (trailPts[i + 1][0] - trailPts[i][0]) * f, trailPts[i][1] + (trailPts[i + 1][1] - trailPts[i][1]) * f];
  };
  // the worn path itself: pale dusty strokes, thin far, wide near
  strokes(out, counter, {
    rng, n: 300,
    sample: r => { const t = r(); const p = trailAt(t); return [p[0] + (r() - 0.5) * (2.5 + 9 * t), p[1] + (r() - 0.5) * (2 + 5 * t)]; },
    dir: (x, y) => {
      let bt = 0, bd = 1e9;
      for (let t = 0; t <= 1.001; t += 0.04) { const p = trailAt(t); const d = Math.hypot(x - p[0], y - p[1]); if (d < bd) { bd = d; bt = t; } }
      const a = trailAt(Math.max(0, bt - 0.03)), b = trailAt(Math.min(1, bt + 0.03));
      return Math.atan2(b[1] - a[1], b[0] - a[0]);
    },
    col: (x, y, r) => jig(mix(mix('#bfa468', '#dcc488', r()), GOLD, lightAt(x, y) * 0.5), r, 9),
    len: 8, lw: 2.4, steps: 2, lenJ: 0.5, wild: 0.08,
  });
  // footprints: paired dark dabs straddling the path, fading toward the horizon
  for (let t = 0.08; t < 0.97; t += 0.055) {
    const p = trailAt(t), q = trailAt(t + 0.02);
    const a = Math.atan2(q[1] - p[1], q[0] - p[0]) + Math.PI / 2;
    const sp = 1.2 + 2.6 * t;
    for (const s of [-1, 1]) {
      out.push(`<ellipse cx="${R1(p[0] + Math.cos(a) * sp * s)}" cy="${R1(p[1] + Math.sin(a) * sp * s)}" rx="${R1(1 + 2.2 * t)}" ry="${R1(0.6 + 1.2 * t)}" fill="#2e2418" opacity="${R1(0.4 + 0.45 * t)}" transform="rotate(${R1((a - Math.PI / 2) * 57.3)} ${R1(p[0] + Math.cos(a) * sp * s)} ${R1(p[1] + Math.sin(a) * sp * s)})"/>`);
      counter.n++;
    }
  }

  /* ---------------- 5. THE CHILD'S TRAIL ---------------- */
  // begins at the child's feet and runs off-frame the other way — unwalked
  // yet, just the path waiting: a faint pale ribbon, no footprints.
  const childFeet = [452, 384];
  const cTrail = t => {
    const u = 1 - t;
    return [u * u * childFeet[0] + 2 * u * t * 560 + t * t * 824, u * u * childFeet[1] + 2 * u * t * 430 + t * t * 470];
  };
  strokes(out, counter, {
    rng, n: 190,
    sample: r => { const t = r(); const p = cTrail(t); return [p[0] + (r() - 0.5) * (4 + 10 * t), p[1] + (r() - 0.5) * (3 + 5 * t)]; },
    dir: (x, y) => {
      let bt = 0, bd = 1e9;
      for (let t = 0; t <= 1.001; t += 0.05) { const p = cTrail(t); const d = Math.hypot(x - p[0], y - p[1]); if (d < bd) { bd = d; bt = t; } }
      const a = cTrail(Math.max(0, bt - 0.04)), b = cTrail(Math.min(1, bt + 0.04));
      return Math.atan2(b[1] - a[1], b[0] - a[0]);
    },
    col: (x, y, r) => jig(mix('#9a8856', '#c2ab70', r() * 0.8), r, 9),
    len: 9, lw: 2.4, steps: 2, lenJ: 0.5, wild: 0.08,
  });

  /* ---------------- 6. FIGURES ---------------- */
  // a quiet shadow pool grounding the handoff, so both figures read
  strokes(out, counter, {
    rng, n: 150,
    sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 1.1); return [402 + Math.cos(a) * 86 * d, 386 + Math.sin(a) * 20 * d]; },
    dir: () => 0.04,
    col: (x, y, r) => { const d = Math.hypot((x - 402) / 86, (y - 386) / 20); return jig(mix('#15182e', '#3a3450', d * 0.8), r, 6); },
    len: 14, lw: 3.2, steps: 2, aJ: 0.08,
  });
  // the OLD ONE: kneeling on one knee, bent forward, stick planted behind;
  // a long-worn silhouette, facing right toward the child
  const oldCaps = [
    { ax: 366, ay: 318, bx: 370, by: 322, r: 7 },     // bowed head
    { ax: 362, ay: 330, bx: 354, by: 362, r: 9.5 },   // stooped torso
    { ax: 368, ay: 336, bx: 396, by: 350, r: 3.4 },   // offering arm, extended
    { ax: 354, ay: 364, bx: 350, by: 384, r: 6 },     // kneeling leg (down)
    { ax: 358, ay: 366, bx: 372, by: 380, r: 5 },     // raised knee
    { ax: 370, ay: 382, bx: 372, by: 392, r: 3 },     // foot
  ];
  underpaintCapsules(out, counter, oldCaps, '#171526');
  paintFigure(out, counter, rng, oldCaps, (x, y, r) => jig(mix('#241f38', '#3a3450', fbm(x / 12, y / 12, 87)), r, 7), 1.8);
  // the walking stick, planted, leaning against the old shoulder
  out.push(`<path d="M${R1(340)} ${R1(392)}L${R1(348)} ${R1(312)}" stroke="#3a2e1e" stroke-width="3.2" stroke-linecap="round" fill="none"/>`);
  counter.n++;
  out.push(`<path d="M${R1(340.5)} ${R1(390)}L${R1(347)} ${R1(330)}" stroke="#6a5638" stroke-width="1.3" stroke-linecap="round" fill="none" opacity="0.8"/>`);
  counter.n++;

  // the CHILD in deep red: standing, leaning in, both hands out to receive
  const chCaps = [
    { ax: 446, ay: 324, bx: 444, by: 328, r: 6 },     // head, tilted toward the map
    { ax: 448, ay: 336, bx: 452, by: 366, r: 7.5 },   // small body
    { ax: 444, ay: 340, bx: 420, by: 350, r: 2.8 },   // reaching arms
    { ax: 450, ay: 368, bx: 448, by: 384, r: 2.6 },   // legs
    { ax: 456, ay: 368, bx: 458, by: 384, r: 2.6 },
  ];
  underpaintCapsules(out, counter, chCaps, '#1a0d12');
  paintFigure(out, counter, rng, chCaps, (x, y, r) =>
    y < 333 ? jig('#140b10', r, 4) : jig(mix('#4a1218', '#701a22', fbm(x / 11, y / 11, 89)), r, 8), 1.9);

  /* ---------------- 7. THE MAP — the focal point ---------------- */
  // a small pale sheet held between the two reaches, tilted toward the sun
  const mapC = [408, 346];
  out.push(`<path d="M${R1(mapC[0] - 13)} ${R1(mapC[1] - 8)}L${R1(mapC[0] + 12)} ${R1(mapC[1] - 11)}L${R1(mapC[0] + 14)} ${R1(mapC[1] + 8)}L${R1(mapC[0] - 11)} ${R1(mapC[1] + 11)}Z" fill="#d8cba2" opacity="0.96"/>`);
  counter.n++;
  // EGG: the looping road of plate 07, drawn in the old hand's ink —
  // the same loop the trail behind them carries
  paintPath(out, counter, rng, [
    [mapC[0] - 9, mapC[1] + 7], [mapC[0] - 4, mapC[1] + 2], [mapC[0] + 2, mapC[1] + 1],
    [mapC[0] + 5, mapC[1] - 2.5], [mapC[0] + 1, mapC[1] - 5], [mapC[0] - 2, mapC[1] - 2.5],
    [mapC[0] + 2, mapC[1] + 0.5], [mapC[0] + 8, mapC[1] - 4], [mapC[0] + 11, mapC[1] - 8],
  ], (x, y, r) => jig('#3a3424', r, 6), { lw: 1.3, len: 2.4, density: 0.9, jitter: 0.3 });
  // a small sun dot in the map's corner — he drew where the light is, too
  out.push(`<circle cx="${R1(mapC[0] - 8.5)}" cy="${R1(mapC[1] - 6)}" r="1.7" fill="#a8853e" opacity="0.9"/>`);
  counter.n++;

  /* ---------------- 8. RIM LIGHT ---------------- */
  // the low sun rims both figures on their sun side — the handoff glows
  strokes(out, counter, {
    rng, n: 34,
    sample: rej(338, 306, 380, 392, (x, y) => oldCaps.some(c => inCap(x, y, c)) && !oldCaps.some(c => inCap(x - 4, y - 3, c))),
    dir: () => -Math.PI / 2 + 0.5,
    col: (x, y, r) => jig(mix(GOLD_DEEP, GOLD, r() * 0.7), r, 9),
    len: 5.5, lw: 1.8, steps: 2,
  });
  strokes(out, counter, {
    rng, n: 26,
    sample: rej(414, 316, 462, 388, (x, y) => chCaps.some(c => inCap(x, y, c)) && !chCaps.some(c => inCap(x - 4, y - 3, c))),
    dir: () => -Math.PI / 2 + 0.5,
    col: (x, y, r) => jig(mix(GOLD_DEEP, GOLD, r() * 0.7), r, 9),
    len: 5, lw: 1.7, steps: 2,
  });
  // a breath of warm dust where the map changes hands
  strokes(out, counter, {
    rng, n: 40,
    sample: r => { const a = r() * Math.PI * 2, d = 8 + Math.pow(r(), 1.5) * 26; return [mapC[0] + Math.cos(a) * d, mapC[1] + Math.sin(a) * d * 0.8]; },
    dir: (x, y) => Math.atan2(y - mapC[1], x - mapC[0]) + Math.PI / 2,
    col: (x, y, r) => jig(mix(GOLD, '#a8853e', r()), r, 12),
    len: 5, lw: 1.4, steps: 2,
  });

  return svgWrap('Hill country at low golden sun; an old figure with a walking stick kneels at the end of a long winding footprinted trail, handing a small drawn map to a child in deep red; the child\'s own trail starts at their feet and runs off-frame the other way.', out.join('\n'));
}
