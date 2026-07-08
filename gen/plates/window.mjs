// gen/plates/window.mjs — "The clean window"
// §22 noticing: a fogged window fills the whole frame. A generous arc has
// been wiped clean — through it, crisp and gold, lies plate 13's wheat
// field with its road and far house (the He-ran landscape, seen through
// glass). On the remaining fog: dull haze where the smudge marks, now that
// you can compare, are suddenly obvious. A small hand with a cloth is
// mid-wipe at the arc's edge. Two textures, one lesson.
//
// Light: the field's daylight pouring THROUGH the clean arc is the one
// source; its warmth dies exponentially into the fog, with orange sparks
// where it dies.

export const name = 'window';
export const title = 'The clean window';
export const caption = 'The cleaner the window, the faster you see.';
export const seed = 22061126;
export const focal = { x: 345, y: 245 }; // portrait window: the clean wiped arc and the field through it

export function paint(E) {
  const {
    mulberry32, fbm, curlV, swirlV, mix, ramp, jig, strokes, rej,
    paintFigure, paintPath, inCap, underpaintCapsules, ribbon, svgWrap, R1, W, H,
    GOLD, GOLD_PALE, GOLD_DEEP, GOLD_HOT, DARKEST,
  } = E;

  const rng = mulberry32(seed);
  const out = [];
  const counter = { n: 0 };
  out.push(`<rect width="${W}" height="${H}" fill="${DARKEST}"/>`);

  /* ---------------- the wipe geometry ---------------- */
  // one generous arc of clean glass: a disc, like a single sweeping wipe
  const CC = { x: 330, y: 245, r: 232 };
  const distC = (x, y) => Math.hypot(x - CC.x, y - CC.y);
  // a wipe is not a lens: the rim wobbles where the cloth reached or didn't
  const rimR = a => CC.r * (1 + 0.055 * Math.sin(3 * a + 1.2) + 0.038 * Math.sin(7 * a + 0.5));
  const angA = (x, y) => Math.atan2(y - CC.y, x - CC.x);
  const edgeOff = (x, y) => distC(x, y) - rimR(angA(x, y));
  const inClean = (x, y) => edgeOff(x, y) < 0;
  // ONE light: the field's day pouring through the clean arc; full inside,
  // exponential falloff into the fog beyond the rim
  const gWin = (x, y) => {
    const d = edgeOff(x, y);
    return d < 0 ? 1 : Math.exp(-d / 170);
  };

  /* ---------------- field geometry (plate 13's land, miniature) -------- */
  const horizon = 216;
  const SKY = ['#1f3a52', '#2a4a5e', '#3a6b73', '#4d8a8a', '#7aa9a0'];
  const WHEAT = ['#8a6526', '#c98e2e', '#d9a93f', '#f0cf7a', GOLD];
  const far = [428, 221], nearP = [292, 474];
  const roadP = t => [far[0] + (nearP[0] - far[0]) * t + Math.sin(t * 5) * 6 * t, far[1] + (nearP[1] - far[1]) * t];
  const roadW = t => 5 + 42 * t * t + 8 * t;
  const roadInfo = (x, y) => {
    let bt = 0, bd = 1e9;
    for (let t = 0; t <= 1.001; t += 0.05) { const p = roadP(t); const d = Math.hypot(x - p[0], y - p[1]); if (d < bd) { bd = d; bt = t; } }
    return { t: bt, d: bd };
  };
  const onRoad = (x, y) => { const { t, d } = roadInfo(x, y); return d < roadW(t) / 2; };
  // a muted memory of the field, used by the fog: you half-sense the land behind
  const fieldGhost = (x, y) =>
    y < horizon
      ? ramp(SKY, fbm(x / 110, y / 110, 133) * 0.8 + (horizon - y) / 600)
      : ramp(WHEAT, 0.2 + fbm(x / 60, y / 60, 177) * 0.7 + (y - horizon) / 700);

  /* ---------------- 1. FOG — the unwiped glass ---------------- */
  // base haze across the whole pane (clean arc paints over it later):
  // long soft diagonal smears, the ghost of the field drowned in grey
  const FOG = ['#222a3e', '#2e3749', '#3b4456', '#4a5263'];
  const fogDir = (x, y) => {
    const [vx, vy] = curlV(x, y, 41, 170);
    return Math.atan2(vy * 60 + 26, vx * 60 + 88); // lazy down-right drift
  };
  const fogCol = (x, y, r) => {
    const g = gWin(x, y);
    // complementary spark: an orange flick exactly where the day dies into fog
    if (!inClean(x, y) && g > 0.2 && g < 0.36 && r() < 0.035) return jig('#c9742c', r, 16);
    let c = mix(ramp(FOG, fbm(x / 90, y / 90, 53) * 0.9), fieldGhost(x, y), 0.16);
    c = mix(c, '#8a7a52', g * 0.5);               // warmth leaking past the rim
    c = mix(c, '#151b30', (1 - g) * 0.3);         // cold dead corners
    return jig(c, r, 7);
  };
  strokes(out, counter, { rng, n: 850, sample: rej(-10, -10, 810, 510), dir: fogDir, col: fogCol, len: 42, lw: 8, steps: 3, follow: 0.7, aJ: 0.12, lenJ: 0.55, wild: 0.07 });
  strokes(out, counter, { rng, n: 1050, sample: rej(-10, -10, 810, 510, (x, y) => edgeOff(x, y) > -18), dir: fogDir, col: fogCol, len: 26, lw: 4.6, steps: 3, follow: 0.75, aJ: 0.16, lenJ: 0.5, wild: 0.14 });

  /* ---------------- 2. SMUDGE MARKS — now obvious ---------------- */
  // old half-hearted wipes: short greasy arcs that never cleaned anything,
  // each a swirl of slightly lighter grime with a darker rim
  const smudges = [
    { x: 660, y: 96, r: 46, a0: 2.6, a1: 5.4 },
    { x: 712, y: 250, r: 56, a0: 1.8, a1: 4.6 },
    { x: 624, y: 408, r: 40, a0: 3.4, a1: 6.0 },
    { x: 118, y: 64, r: 38, a0: 2.2, a1: 5.0 },
    { x: 78, y: 420, r: 44, a0: 0.4, a1: 3.2 },
    { x: 462, y: 38, r: 34, a0: 2.9, a1: 5.7 },
  ];
  for (const s of smudges) {
    strokes(out, counter, {
      rng, n: 64,
      sample: r => { const a = s.a0 + r() * (s.a1 - s.a0), d = s.r * (0.55 + r() * 0.5); const x = s.x + Math.cos(a) * d, y = s.y + Math.sin(a) * d * 0.8; return inClean(x, y) ? null : [x, y]; },
      dir: (x, y) => Math.atan2(x - s.x, -(y - s.y)),            // tangent: it was rubbed in circles
      col: (x, y, r) => {
        const g = gWin(x, y);
        const band = Math.abs(distC2(s, x, y) / s.r - 0.85);
        let c = band < 0.16 ? mix('#1c2336', '#161c2e', r())     // greasy dark rim
          : mix(ramp(FOG, 0.65 + r() * 0.3), '#6a6452', 0.3);    // lighter rubbed middle
        return jig(mix(c, '#8a7a52', g * 0.3), r, 8);
      },
      len: 13, lw: 3, steps: 3, follow: 0.95, aJ: 0.1, lenJ: 0.4,
    });
    // a tired drip running down from each smudge's low edge
    const dx0 = s.x + (rng() - 0.5) * 14, dy0 = s.y + s.r * 0.7;
    if (!inClean(dx0, dy0 + 20)) {
      paintPath(out, counter, rng,
        [[dx0, dy0], [dx0 + 2, dy0 + 14 + rng() * 12], [dx0 + 1, dy0 + 30 + rng() * 22]],
        (x, y, r) => jig(mix('#444c5e', '#5a6272', r()), r, 7),
        { lw: 1.6, len: 4, density: 0.6, jitter: 0.9 });
    }
  }
  function distC2(s, x, y) { return Math.hypot(x - s.x, (y - s.y) / 0.8); }

  /* ---------------- 3. THE CLEAN ARC — plate 13's field, crisp -------- */
  // underpaint: solid colour shapes traced along the ragged rim so no fog
  // leaks between field strokes
  {
    let d = '';
    for (let a = 0; a < Math.PI * 2; a += 0.06) {
      const rr = rimR(a);
      d += `${d ? 'L' : 'M'}${R1(CC.x + Math.cos(a) * rr)} ${R1(CC.y + Math.sin(a) * rr)}`;
    }
    out.push(`<path d="${d}Z" fill="#2a4a5e"/>`);
    counter.n++;
    // wheat underpaint: the rim arc below the horizon, closed along the horizon
    let dw = '', a0 = null;
    for (let a = -0.6; a < Math.PI + 0.6; a += 0.04) {
      const rr = rimR(a), x = CC.x + Math.cos(a) * rr, y = CC.y + Math.sin(a) * rr;
      if (y >= horizon - 1) { dw += `${dw ? 'L' : 'M'}${R1(x)} ${R1(y)}`; if (a0 === null) a0 = a; }
    }
    out.push(`<path d="${dw}Z" fill="#a3762a"/>`);
    counter.n++;
  }
  const inField = pad => (x, y) => edgeOff(x, y) < pad;

  // sky: the turbulent blue-green churn, one knot (crisp: real impasto)
  const SKv = { x: 250, y: 110, s: 120, f: 48 };
  strokes(out, counter, {
    rng, n: 1000,
    sample: rej(CC.x - CC.r - 4, 8, CC.x + CC.r + 4, horizon + 4, (x, y) => inField(2)(x, y) && y < horizon + 3),
    dir: (x, y) => {
      let [vx, vy] = curlV(x, y, 121, 95);
      vx = vx * 80 + 34; vy = vy * 95;
      const [a, b] = swirlV(x, y, SKv.x, SKv.y, SKv.s, SKv.f); vx += a; vy += b;
      return Math.atan2(vy, vx);
    },
    col: (x, y, r) => {
      const near = Math.hypot(x - SKv.x, y - SKv.y) / SKv.f;
      if (near < 1.1 && r() < 0.03) return jig('#d9822e', r, 14);
      return jig(ramp(SKY, fbm(x / 100, y / 100, 133) * 0.9 + (horizon - y) / 550 + Math.max(0, 0.5 - near * 0.2)), r, 11);
    },
    len: 22, lw: 3.4, steps: 4, follow: 0.85, wild: 0.2, lenJ: 0.5, impasto: 0.64,
    aJ: (x, y) => 0.15 + Math.max(0, 1.2 - Math.hypot(x - SKv.x, y - SKv.y) / SKv.f) * 0.4,
  });

  // road underpaint ribbon
  {
    let L2 = [], R2 = [];
    for (let t = 0; t <= 1.001; t += 0.1) {
      const p = roadP(t), q = roadP(Math.min(1, t + 0.04));
      let nx = -(q[1] - p[1]), ny = q[0] - p[0];
      const nl = Math.hypot(nx, ny) || 1; nx /= nl; ny /= nl;
      const hw = roadW(t) / 2;
      L2.push([p[0] + nx * hw, p[1] + ny * hw]); R2.push([p[0] - nx * hw, p[1] - ny * hw]);
    }
    let d = `M${R1(L2[0][0])} ${R1(L2[0][1])}`;
    for (let i = 1; i < L2.length; i++) d += `L${R1(L2[i][0])} ${R1(L2[i][1])}`;
    for (let i = R2.length - 1; i >= 0; i--) d += `L${R1(R2[i][0])} ${R1(R2[i][1])}`;
    out.push(`<path d="${d}Z" fill="#d4bd8c"/>`);
    counter.n++;
  }

  // wheat: churning gold, the crispest paint on the plate
  strokes(out, counter, {
    rng, n: 1900,
    sample: rej(CC.x - CC.r - 18, horizon - 3, CC.x + CC.r + 18, CC.y + CC.r + 18, (x, y) => inField(2)(x, y) && y > horizon - 3 && !onRoad(x, y)),
    dir: (x, y) => { const [vx, vy] = curlV(x, y, 171, 60); return Math.atan2(vy * 0.9 - 0.16, Math.abs(vx) + 0.7); },
    col: (x, y, r) => {
      if (r() < 0.09) return jig('#5a5a8e', r, 12);
      return jig(ramp(WHEAT, 0.15 + fbm(x / 55, y / 55, 177) * 0.85 + (y - horizon) / 600), r, 13);
    },
    len: 14, lw: 3, steps: 3, lenJ: 0.55, wild: 0.16, impasto: 0.8,
  });
  // road strokes
  strokes(out, counter, {
    rng, n: 340,
    sample: rej(190, horizon, 470, CC.y + CC.r, (x, y) => inField(0)(x, y) && onRoad(x, y)),
    dir: (x, y) => { const { t } = roadInfo(x, y); const a = roadP(Math.max(0, t - 0.03)), b = roadP(Math.min(1, t + 0.03)); return Math.atan2(b[1] - a[1], b[0] - a[0]); },
    col: (x, y, r) => { const { t, d } = roadInfo(x, y); return jig(ramp(['#f2e3bd', '#e2cfa0', '#c9b282'], d / (roadW(t) / 2) * 0.7 + fbm(x / 45, y / 45, 191) * 0.4), r, 9); },
    len: 13, lw: 2.6, steps: 3,
  });

  // egg payoff: the far house with its gold-lit window — plate 13's house,
  // the He-ran landscape recognized through clean glass
  const hs = { x: 452, y: 206 };
  out.push(`<path d="M${hs.x - 15} ${hs.y}L${hs.x - 15} ${hs.y - 12}L${hs.x} ${hs.y - 22}L${hs.x + 15} ${hs.y - 12}L${hs.x + 15} ${hs.y}Z" fill="#2c2a3e"/>`);
  counter.n++;
  strokes(out, counter, {
    rng, n: 26,
    sample: rej(hs.x - 14, hs.y - 20, hs.x + 14, hs.y - 1),
    dir: () => 0,
    col: (x, y, r) => jig(mix('#2c2a3e', '#474360', fbm(x / 10, y / 10, 201)), r, 7),
    len: 5, lw: 1.8, steps: 2,
  });
  out.push(`<rect x="${hs.x - 3}" y="${hs.y - 11}" width="5.6" height="6.4" rx="1.2" fill="${GOLD}"/>`);
  out.push(`<rect x="${hs.x - 1.9}" y="${hs.y - 9.9}" width="3.4" height="4.2" rx="0.8" fill="${GOLD_HOT}" opacity="0.85"/>`);
  counter.n += 2;
  // the warm thread the window casts down the road
  strokes(out, counter, {
    rng, n: 60,
    sample: r => { const t = Math.pow(r(), 1.6) * 0.75; const p = roadP(t); return [p[0] + (r() + r() - 1) * roadW(t) * 0.16, p[1] + (r() - 0.5) * 2.5]; },
    dir: (x, y) => { const { t } = roadInfo(x, y); const a = roadP(Math.max(0, t - 0.03)), b = roadP(Math.min(1, t + 0.03)); return Math.atan2(b[1] - a[1], b[0] - a[0]); },
    col: (x, y, r) => { const { t } = roadInfo(x, y); return jig(ramp(['#fff3cd', GOLD_PALE, GOLD], t + (r() - 0.5) * 0.25), r, 7); },
    len: 10, lw: 1.5, steps: 3, lenJ: 0.6, wJ: 0.45,
  });

  /* ---------------- 4. THE WIPE EDGE — wet smear ring ---------------- */
  // where the cloth has just passed: a ring of pushed water and loosened
  // grime, strokes running along the arc's tangent, brightest on the clean
  // side, dirty water bunched on the fog side
  strokes(out, counter, {
    rng, n: 330,
    sample: r => { const a = r() * Math.PI * 2; const d = rimR(a) + (r() + r() - 1) * 13; return [CC.x + Math.cos(a) * d, CC.y + Math.sin(a) * d]; },
    dir: (x, y) => Math.atan2(x - CC.x, -(y - CC.y)),
    col: (x, y, r) => {
      const off = edgeOff(x, y);
      if (off > 1) return jig(mix('#5d6478', '#787e8e', r() * 0.7), r, 9);             // pushed dirty water
      return jig(mix(fieldGhost(x, y), '#cfd4d8', 0.35 + r() * 0.3), r, 9);            // wet streaks over the field
    },
    len: 15, lw: 2.2, steps: 3, follow: 0.95, lenJ: 0.55, wild: 0.1, aJ: 0.08,
  });
  // water droplets sliding down from the arc's lower rim
  for (let i = 0; i < 7; i++) {
    const a = 0.55 + rng() * 1.9;                       // lower half of the ring
    const ax = CC.x + Math.cos(a) * (rimR(a) + 3), ay = CC.y + Math.sin(a) * (rimR(a) + 3);
    if (ay < CC.y) continue;
    paintPath(out, counter, rng,
      [[ax, ay], [ax + 1.5, ay + 8 + rng() * 10], [ax + 0.5, ay + 18 + rng() * 16]],
      (x, y, r) => jig(mix('#8a8f9c', '#aab0ba', r()), r, 8),
      { lw: 1.5, len: 3.5, density: 0.65, jitter: 0.8 });
  }

  /* ---------------- 5. THE HAND — mid-wipe at the arc's edge ---------- */
  // a child's arm in a deep red sleeve enters from the lower right and
  // presses a pale cloth against the rim — caught mid-stroke
  const press = [CC.x + Math.cos(0.45) * rimR(0.45), CC.y + Math.sin(0.45) * rimR(0.45)]; // lower-right rim
  const caps = [
    { ax: 706, ay: 478, bx: 614, by: 416, r: 9 },                                          // forearm entering from corner
    { ax: 614, ay: 416, bx: press[0] + 22, by: press[1] + 22, r: 7.5 },                    // arm reaching up-left
    { ax: press[0] + 20, ay: press[1] + 20, bx: press[0] + 7, by: press[1] + 7, r: 5.5 },  // small hand
  ];
  underpaintCapsules(out, counter, caps, '#160f1a');
  paintFigure(out, counter, rng, caps, (x, y, r) => {
    // deep red sleeve (the recurring child), darkening away from the light
    const g = gWin(x, y);
    return jig(mix(ramp(['#7e2418', '#5e1a10', '#3a100a'], fbm(x / 24, y / 24, 231)), '#a3573a', g * 0.35), r, 9);
  }, 1.7);
  // knuckle rim-light on the side facing the clean arc
  strokes(out, counter, {
    rng, n: 16,
    sample: rej(press[0] - 4, press[1] + 2, press[0] + 30, press[1] + 42, (x, y) => caps.some(c => inCap(x, y, c)) && !caps.some(c => inCap(x - 4, y - 3, c))),
    dir: () => -2.2,
    col: (x, y, r) => jig(mix(GOLD_DEEP, '#8a5a30', r() * 0.5), r, 10),
    len: 4.5, lw: 1.4, steps: 2,
  });
  // the cloth: a soft pale wad pressed flat against the glass at the rim
  strokes(out, counter, {
    rng, n: 110,
    sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 1.3) * 13; return [press[0] + Math.cos(a) * d * 1.15, press[1] + Math.sin(a) * d]; },
    dir: (x, y) => Math.atan2(x - CC.x, -(y - CC.y)) + (fbm(x / 9, y / 9, 241) - 0.5) * 1.2, // bunched along the wipe
    col: (x, y, r) => jig(ramp(['#efe9d6', '#d8d2c0', '#b2ac9c', '#8a8478'], Math.hypot(x - press[0], y - press[1]) / 19 + r() * 0.2), r, 9),
    len: 7, lw: 2.4, steps: 2, wJ: 0.5, lenJ: 0.5,
  });
  // small dark fingers curled over the pale wad — the hand stays on top
  for (let i = 0; i < 4; i++) {
    const fa = -2.5 + i * 0.32;
    const fx0 = press[0] + 9 + Math.cos(fa + 1.6) * i * 2.6, fy0 = press[1] + 11 + Math.sin(fa + 1.6) * i * 2.6;
    paintPath(out, counter, rng,
      [[fx0, fy0], [fx0 + Math.cos(fa) * 6, fy0 + Math.sin(fa) * 6], [fx0 + Math.cos(fa) * 10.5, fy0 + Math.sin(fa) * 10.5]],
      (x, y, r) => jig(mix('#241016', '#3a1a14', r()), r, 6),
      { lw: 2.6, len: 3.5, density: 0.9, jitter: 0.5 });
  }
  // grime gathered on the cloth's leading (fog-side) edge
  strokes(out, counter, {
    rng, n: 30,
    sample: r => { const a = 0.45 + (r() - 0.5) * 0.7; const d = rimR(a) + 8 + r() * 8; return [CC.x + Math.cos(a) * d, CC.y + Math.sin(a) * d]; },
    dir: (x, y) => Math.atan2(x - CC.x, -(y - CC.y)),
    col: (x, y, r) => jig(mix('#3c3a34', '#56524a', r()), r, 8),
    len: 8, lw: 2, steps: 2,
  });

  // EASTER EGG — 1 Cor 13:12 in its ORIGINAL KOINE GREEK numerals, ΙΓʹ·ΙΒʹ (13, 12),
  // finger-written in the fogged glass but MIRROR-REVERSED, readable only flipped —
  // "now we see through a glass, DARKLY; but THEN face to face." A double cipher: hold
  // it to a mirror, then read the old Greek numbers. A pale streak in the dark pane.
  E.inscriptionText(out, E.greekRef(13, 12), { x: 456, y: 470, h: 16, body: '#cfd6dc', edge: '#10162a', op: 0.8, edgeOp: 0.5, mirror: true });

  return svgWrap('A fogged window fills the frame; a generous arc has been wiped clean by a small hand with a cloth, revealing a crisp gold wheat field with a road and a far house, while smudge marks sit obvious on the remaining haze.', out.join('\n'));
}
