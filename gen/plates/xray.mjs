// gen/plates/xray.mjs — "The rules — an X-ray, not a ladder" (§8)
// A warm clinic interior in the Bedroom-at-Arles palette: ochre walls breathing
// around a hanging lamp, blue shadow pooling in the corners. The red child holds
// one arm out. A standing X-ray panel — the plate's ONLY dark rectangle — shows
// the arm's bones with a visible white crack. The doctor kneels to the child's
// height. The picture shows; the doctor heals.
//
// Paint order: wall field -> floor -> skirting -> lamp + halo -> panel (dark
// rect, bones, crack) -> figures (doctor kneeling, child in deep red) ->
// rim-light -> eggs (sunflower picture on the wall, gold cross on the bag).

export const name = 'xray';
export const title = 'The X-ray, not the ladder';
export const caption = 'The picture shows. The doctor heals.';
export const seed = 20260808;
export const focal = { x: 440, y: 330 }; // portrait window: child + kneeling doctor, the held-out arm between

export function paint(E) {
  const {
    mulberry32, fbm, curlV, mix, ramp, jig, strokes, rej,
    paintFigure, paintPath, inCap, underpaintCapsules, ribbon, svgWrap, R1, W, H,
    GOLD, GOLD_PALE, GOLD_DEEP, GOLD_HOT, DARKEST, lightRadial,
  } = E;

  const rng = mulberry32(seed);
  const out = [];
  const counter = { n: 0 };

  out.push(`<rect width="${W}" height="${H}" fill="${DARKEST}"/>`);
  // solid regional underpaints: the gaps between strokes must read as plaster
  // shadow and board seam, not night sky
  out.push(`<rect x="-2" y="-2" width="${W + 4}" height="354" fill="#564730"/>`);
  out.push(`<rect x="-2" y="340" width="${W + 4}" height="164" fill="#46382a"/>`);
  counter.n += 2;

  /* ---------------- LIGHT MODEL ---------------- */
  // ONE dominant source: the hanging lamp, upper-center-left. The room is an
  // interior — warm everywhere, so the raw radial gets an ambient floor.
  const lamp = [318, 88];
  const rawLight = lightRadial(lamp[0], lamp[1] + 60, 330);
  const lightAt = (x, y) => Math.min(1, 0.25 + rawLight(x, y) * 0.9);

  const floorY = x => 348 + (x - 400) * 0.012; // near-level floor line

  // panel geometry (defined early; the wall must not paint over its hole darkly,
  // but paint order handles that — panel goes on top)
  const PX0 = 568, PX1 = 700, PY0 = 130, PY1 = 330;

  /* ---------------- 1. WALL FIELD ---------------- */
  // Arles ochre warmed by the lamp, blue shadow where the light dies.
  const wallDir = (x, y) => {
    const [cx, cy] = curlV(x, y, 21, 210);
    // a calm horizontal weave with a slow breathing wobble — plaster, not sky
    return Math.atan2(cy * 0.7 + Math.sin(y / 46) * 0.12, 1.6 + cx * 0.7);
  };
  const wallCol = (x, y, r) => {
    const g = lightAt(x, y);
    // complementary spark: violet flick exactly where the gold dies into blue
    if (g < 0.5 && g > 0.42 && r() < 0.025) return jig('#7a5fb5', r, 12);
    const base = ramp(['#4a4468', '#86683e', '#b58c3c', '#d2a84a', '#e8c264'],
      Math.min(1, (g - 0.3) * 1.55 + fbm(x / 130, y / 130, 13) * 0.14));
    return jig(base, r, 7);
  };
  strokes(out, counter, {
    rng, n: 800, sample: rej(-10, -10, 810, 370, (x, y) => y < floorY(x) + 6),
    dir: wallDir, col: (x, y, r) => jig(mix('#4a4360', '#a8823e', Math.max(0, lightAt(x, y) - 0.22)), r, 6),
    len: 50, lw: 7.5, steps: 4, follow: 0.85, wild: 0.04, lenJ: 0.5, wJ: 0.25,
  });
  strokes(out, counter, {
    rng, n: 1150, sample: rej(-10, -10, 810, 370, (x, y) => y < floorY(x) + 4),
    dir: wallDir, col: wallCol,
    len: 32, lw: 4.6, steps: 3, follow: 0.9, wild: 0.09,
    aJ: (x, y) => 0.08 + rawLight(x, y) * 0.26, lenJ: 0.45, impasto: 0.72,
  });

  /* ---------------- 2. FLOOR ---------------- */
  // russet-green Arles boards: long horizontal rakes, lamp pool warm, corners cool
  strokes(out, counter, {
    rng, n: 1000, sample: rej(-10, 336, 810, 510, (x, y) => y > floorY(x)),
    dir: () => 0.015,
    col: (x, y, r) => {
      const g = lightAt(x, y);
      if (g < 0.5 && g > 0.4 && r() < 0.025) return jig('#6a55a8', r, 12);
      // russet boards, warmer + redder than the wall, glowing under the lamp
      const base = ramp(['#3a3856', '#5d4a30', '#7d5a33', '#a87844', '#c89055'],
        Math.min(1, (g - 0.28) * 1.7 + fbm(x / 90, y / 50, 29) * 0.16));
      return jig(base, r, 7);
    },
    len: 46, lw: 5.6, steps: 3, wild: 0.08, lenJ: 0.5, impasto: 0.72,
  });
  // skirting seam where wall meets floor
  paintPath(out, counter, rng, [[-5, floorY(-5)], [200, floorY(200)], [420, floorY(420)], [640, floorY(640)], [805, floorY(805)]],
    (x, y, r) => jig(mix('#2a2f55', '#74603a', lightAt(x, y) * 0.8), r, 8),
    { lw: 2.6, len: 9, density: 0.4, jitter: 1.6 });

  /* ---------------- 3. THE LAMP ---------------- */
  // cord from the ceiling
  paintPath(out, counter, rng, [[lamp[0] + 3, -4], [lamp[0], lamp[1] - 26]],
    (x, y, r) => jig('#2a2f50', r, 6), { lw: 2, len: 5, density: 0.6, jitter: 0.8 });
  // shade: a small dark bell
  out.push(`<path d="M${lamp[0] - 17} ${lamp[1] - 6}Q${lamp[0]} ${lamp[1] - 30} ${lamp[0] + 17} ${lamp[1] - 6}Z" fill="#262a48"/>`);
  counter.n++;
  // halo: concentric gold strokes, Night-Café style rings
  strokes(out, counter, {
    rng, n: 210,
    sample: r => { const a = r() * Math.PI * 2, d = 3 + Math.pow(r(), 0.8) * 38; return [lamp[0] + Math.cos(a) * d, lamp[1] + Math.sin(a) * d * 0.85]; },
    dir: (x, y) => Math.atan2(x - lamp[0], -(y - lamp[1])),
    col: (x, y, r) => jig(ramp([GOLD_HOT, GOLD_PALE, GOLD, GOLD_DEEP, '#b08738'], Math.hypot(x - lamp[0], y - lamp[1]) / 42), r, 8),
    len: 9, lw: 2.6, steps: 2, wild: 0.08, impasto: 0.66,
  });
  // the flame core
  strokes(out, counter, {
    rng, n: 60,
    sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 1.4) * 9; return [lamp[0] + Math.cos(a) * d, lamp[1] + Math.sin(a) * d]; },
    dir: () => -Math.PI / 2,
    col: (x, y, r) => jig(ramp(['#fffdf0', GOLD_HOT, GOLD_PALE], Math.hypot(x - lamp[0], y - lamp[1]) / 9), r, 5),
    len: 5, lw: 2, steps: 2,
  });

  /* ---------------- 4. THE X-RAY PANEL ---------------- */
  // the plate's ONLY dark rectangle — a standing viewer on legs
  // legs first
  for (const lx of [PX0 + 18, PX1 - 18]) {
    paintPath(out, counter, rng, [[lx, PY1 - 2], [lx - 2, floorY(lx) + 14]],
      (x, y, r) => jig('#1a1f3c', r, 5), { lw: 4, len: 7, density: 0.7, jitter: 0.8 });
  }
  // solid dark base so the rect reads as a mass
  out.push(`<rect x="${PX0}" y="${PY0}" width="${PX1 - PX0}" height="${PY1 - PY0}" rx="6" fill="#10162e"/>`);
  counter.n++;
  // dark vertical strokes inside — cold deep blue, faintly lit at the lamp side
  strokes(out, counter, {
    rng, n: 420, sample: rej(PX0 + 3, PY0 + 3, PX1 - 3, PY1 - 3),
    dir: () => Math.PI / 2 + 0.04,
    col: (x, y, r) => jig(mix('#0e1430', '#1d2a55', fbm(x / 40, y / 40, 41) + lightAt(x, y) * 0.4), r, 7),
    len: 18, lw: 3.2, steps: 2, lenJ: 0.5,
  });
  // frame: warm ochre edge strokes catching the lamp
  paintPath(out, counter, rng,
    [[PX0, PY1], [PX0, PY0], [PX1, PY0], [PX1, PY1], [PX0, PY1]],
    (x, y, r) => jig(mix('#6e5a32', '#b58c3e', lightAt(x, y) * 1.6), r, 10),
    { lw: 3, len: 8, density: 0.55, jitter: 1.2 });

  // THE BONES — the same held-out arm, seen inside. Pale clinical blue-white.
  const boneCol = (x, y, r) => jig(mix('#b9cce4', '#e8f0fa', r() * 0.7), r, 8);
  const glowCol = (x, y, r) => jig('#3a5588', r, 10);
  // soft glow around the bones first
  const upper = [[598, 168], [620, 208]];                       // humerus
  const fore = [[620, 212], [664, 248]];                        // radius
  const fore2 = [[618, 220], [660, 256]];                       // ulna
  for (const seg of [upper, fore, fore2]) {
    paintPath(out, counter, rng, seg, glowCol, { lw: 6, len: 8, density: 0.8, jitter: 4 });
  }
  paintPath(out, counter, rng, upper, boneCol, { lw: 3.4, len: 6, density: 1.0, jitter: 1 });
  paintPath(out, counter, rng, fore, boneCol, { lw: 2.8, len: 6, density: 1.0, jitter: 0.9 });
  paintPath(out, counter, rng, fore2, boneCol, { lw: 2.4, len: 6, density: 1.0, jitter: 0.9 });
  // little hand bones fanning
  for (const [dx, dy] of [[10, 2], [11, 7], [9, 12]]) {
    paintPath(out, counter, rng, [[664, 250], [664 + dx, 250 + dy]], boneCol, { lw: 1.8, len: 4, density: 1.1, jitter: 0.7 });
  }
  // THE CRACK — a jagged white break across the radius, the brightest cold mark
  paintPath(out, counter, rng,
    [[638, 222], [642, 232], [637, 236], [644, 244]],
    (x, y, r) => jig('#fdfdf4', r, 5), { lw: 2.2, len: 4, density: 1.5, jitter: 0.6 });

  /* ---------------- 5. FIGURES ---------------- */
  // floor shadow pools under both figures
  for (const [sx, sw] of [[392, 60], [510, 76]]) {
    strokes(out, counter, {
      rng, n: 70,
      sample: r => { const a = r() * Math.PI; return [sx + Math.cos(a) * sw * (0.4 + r() * 0.6), 406 + Math.sin(a) * 10 * r()]; },
      dir: () => 0.02, col: (x, y, r) => jig('#252a4e', r, 6),
      len: 16, lw: 3.4, steps: 2,
    });
  }

  // THE CHILD — deep red, standing left, one arm held straight out to the doctor
  const cf = 402; // child's feet
  const childCaps = [
    { ax: 388, ay: cf - 86, bx: 388, by: cf - 78, r: 9.5 },   // head
    { ax: 388, ay: cf - 66, bx: 390, by: cf - 22, r: 11.5 },  // torso
    { ax: 397, ay: cf - 58, bx: 436, by: cf - 52, r: 4 },     // arm held out ->
    { ax: 381, ay: cf - 56, bx: 376, by: cf - 28, r: 3.8 },   // far arm down
    { ax: 383, ay: cf - 18, bx: 381, by: cf, r: 4 },          // legs
    { ax: 394, ay: cf - 18, bx: 396, by: cf, r: 4 },
  ];
  underpaintCapsules(out, counter, childCaps, '#33121a');
  paintFigure(out, counter, rng, childCaps, (x, y, r) => jig(mix('#701f22', '#962e27', r() * 0.8), r, 10), 1.7);
  // head stays dark hair
  paintFigure(out, counter, rng, [childCaps[0]], (x, y, r) => jig('#221628', r, 6), 1.8);

  // THE DOCTOR — kneeling to the child's height, facing left, hands receiving the arm
  const df = 410;
  const docCaps = [
    { ax: 494, ay: df - 92, bx: 494, by: df - 82, r: 10.5 },  // head bowed toward the child, level with hers
    { ax: 498, ay: df - 70, bx: 518, by: df - 34, r: 13 },    // torso leaning hard toward the child
    { ax: 492, ay: df - 60, bx: 448, by: df - 54, r: 4.4 },   // near arm reaching the child's hand
    { ax: 502, ay: df - 52, bx: 456, by: df - 44, r: 3.8 },   // second hand cupped beneath
    { ax: 518, ay: df - 34, bx: 544, by: df - 28, r: 6 },     // thigh folded back (kneeling)
    { ax: 544, ay: df - 28, bx: 541, by: df, r: 4.4 },        // shin down to floor
    { ax: 514, ay: df - 30, bx: 510, by: df, r: 4.4 },        // grounded knee/leg
  ];
  underpaintCapsules(out, counter, docCaps, '#141a30');
  paintFigure(out, counter, rng, docCaps, (x, y, r) => jig(mix('#1c2647', '#2c3a66', r() * 0.7), r, 8), 1.6);
  // doctor's head: warm dark
  paintFigure(out, counter, rng, [docCaps[0]], (x, y, r) => jig('#241a28', r, 6), 1.7);

  // the meeting of hands — a small warm knot where the child's arm rests in the doctor's
  strokes(out, counter, {
    rng, n: 36,
    sample: r => { const a = r() * Math.PI * 2, d = r() * 9; return [442 + Math.cos(a) * d, cf - 52 + Math.sin(a) * d * 0.8]; },
    dir: () => 0.1,
    col: (x, y, r) => jig(mix(GOLD_DEEP, '#b07840', r() * 0.6), r, 12),
    len: 6, lw: 2, steps: 2,
  });

  // rim-light: lamp side (upper-left) of both figures
  strokes(out, counter, {
    rng, n: 32,
    sample: rej(372, cf - 98, 402, cf - 12, (x, y) => childCaps.some(c => inCap(x, y, c)) && !childCaps.some(c => inCap(x - 4, y - 4, c))),
    dir: () => -Math.PI / 2.4,
    col: (x, y, r) => jig(mix(GOLD_DEEP, '#a85a3a', r() * 0.5), r, 10),
    len: 5, lw: 1.7, steps: 2,
  });
  strokes(out, counter, {
    rng, n: 36,
    sample: rej(498, df - 108, 530, df - 22, (x, y) => docCaps.some(c => inCap(x, y, c)) && !docCaps.some(c => inCap(x - 4, y - 4, c))),
    dir: () => -Math.PI / 2.2,
    col: (x, y, r) => jig(mix(GOLD_DEEP, '#8a6a2a', r() * 0.5), r, 10),
    len: 5.5, lw: 1.8, steps: 2,
  });

  /* ---------------- 6. EASTER EGGS ---------------- */
  // egg: a tiny sunflower picture on the wall, upper left — his other bedroom
  {
    const fx = 112, fy = 168;
    paintPath(out, counter, rng, [[fx - 22, fy - 16], [fx + 22, fy - 16], [fx + 22, fy + 16], [fx - 22, fy + 16], [fx - 22, fy - 16]],
      (x, y, r) => jig('#4e4026', r, 7), { lw: 2.4, len: 6, density: 0.5, jitter: 1 });
    strokes(out, counter, {
      rng, n: 30,
      sample: r => { const a = r() * Math.PI * 2, d = r() * 9; return [fx + Math.cos(a) * d, fy + Math.sin(a) * d * 0.8]; },
      dir: (x, y) => Math.atan2(x - fx, -(y - fy)),
      col: (x, y, r) => jig(ramp(['#a8842e', '#7a6230', '#473c26'], Math.hypot(x - fx, y - fy) / 10), r, 8),
      len: 4, lw: 1.6, steps: 2,
    });
  }
  // egg: the doctor's bag on the floor by the panel, a faint gold cross on its side
  {
    const bx = 596, by = 392;
    strokes(out, counter, {
      rng, n: 70,
      sample: r => [bx - 16 + r() * 32, by - 13 + r() * 15],
      dir: () => 0.05,
      col: (x, y, r) => jig(mix('#2a1d1a', '#4a3326', fbm(x / 18, y / 18, 71)), r, 7),
      len: 8, lw: 2.6, steps: 2,
    });
    paintPath(out, counter, rng, [[bx, by - 10], [bx, by - 1]], (x, y, r) => jig('#caa552', r, 8), { lw: 1.5, len: 3, density: 1.1, jitter: 0.4 });
    paintPath(out, counter, rng, [[bx - 4, by - 6.5], [bx + 4, by - 6.5]], (x, y, r) => jig('#caa552', r, 8), { lw: 1.5, len: 3, density: 1.1, jitter: 0.4 });
  }

  return svgWrap('A warm clinic room in ochre and blue; a doctor kneels to a small child in red who holds one arm out; behind them a dark X-ray panel shows the arm bones with a white crack.', out.join('\n'));
}
