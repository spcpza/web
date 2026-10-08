// gen/plates/gospel.mjs — THE COVER: "Alpha and Omega — a story about the Light"
// The whole gospel in one image, composed PORTRAIT-FIRST (all the hero elements
// live in the central column x∈[244,556] so the phone's portrait crop holds them):
//
//   · a great radiant LIGHT rides high in a dawn sky, its glory overcoming the
//     dark blue-violet night at the edges — "the light shineth in darkness; and
//     the darkness comprehended it not" (John 1:5). This Light is Alpha & Omega
//     (Rev 22:13) — the hidden Α and Ω flank it, incised in the glow.
//   · below it, on the crest, the NEW JERUSALEM glows — gold towers around an
//     OPEN GATE of light, the Father's house, the one Home (Rev 21).
//   · the bright ROAD HOME winds down from the gate to the reader's own feet —
//     the brightest thing underfoot, the way thrown open (John 14:6).
//   · the little PILGRIM (you) has just set out up the road, small under the
//     great Light, following it home.
//
// Munch grammar: the living sky + hills CURVE; the made city stands STRAIGHT.
// ONE light source. Bright, never black. This is the door into the book.

export const name = 'gospel';
export const title = 'Alpha and Omega';
export const caption = 'a story about the Light';
export const seed = 20260723;
export const focal = { x: 400, y: 260 };   // portrait window centres on the road climbing to the Light

export function paint(E, opts = {}) {
  const {
    mulberry32, fbm, curlV, goldenSpiralV, mix, ramp, jig, strokes, rej,
    horizonFringe, dirtRoad, lightRadial, klimtGold, ridge, paintPalace, paintMask,
    svgWrap, R1, W, H,
    GOLD, GOLD_PALE, GOLD_DEEP, GOLD_HOT,
  } = E;

  const rng = mulberry32(seed);
  const out = [];
  const counter = { n: 0 };

  /* ---------------- geometry ---------------- */
  const dc = [400, 84];                            // THE LIGHT — a sun high above, the hero
  const gL = lightRadial(dc[0], dc[1], 300);       // its reach across the whole frame
  const horizon = 300;                             // the crest the City stands on (low, so the Light crowns it)
  // SCALE GRADIENT — a mark at your feet is far bigger than a mark at the horizon.
  // Drawn all one size, ground reads as a flat green shape however good the colour
  // is; sized by depth it reads as ground going away from you.
  const dS = y => 0.32 + 1.0 * Math.max(0, Math.min(1, (y - horizon) / (H - horizon)));
  const city = { x: 400, base: 292 };              // the New Jerusalem on the crest

  // the crest gently rises to a hill under the City
  const crestBase = ridge(horizon, { amp: 12, freq: 150, bumps: 0.4, seed: 61 });
  const crest = x => crestBase(x) - 20 * Math.exp(-((x - city.x) * (x - city.x)) / (150 * 150));

  // the ROAD HOME: from the reader's feet (wide, bottom-centre) up to the City
  // gate on the crest (narrow). A living curve, never a ruled line.
  const far = [city.x, horizon - 6], near = [398, 512];
  const roadP = t => [far[0] + (near[0] - far[0]) * t + Math.sin(t * 4.0) * 18 * t, far[1] + (near[1] - far[1]) * t];
  const roadW = t => 2 + 96 * t * t + 12 * t;
  const roadInfo = (x, y) => { let bt = 0, bd = 1e9; for (let t = 0; t <= 1.001; t += 0.03) { const p = roadP(t); const d = Math.hypot(x - p[0], y - p[1]); if (d < bd) { bd = d; bt = t; } } return { t: bt, d: bd }; };
  const onRoad = (x, y) => { const { t, d } = roadInfo(x, y); return d < roadW(t) / 2; };

  /* ---------------- 1. THE SKY — dawn wheeling around the Light, dark at the edges ---- */
  // deep blue-violet night in the corners, warming inward to rose and gold: the
  // Light is winning. Bright throughout, never black.
  const SKY = ['#39407e', '#4b4d92', '#6f5fa2', '#b07ba6', '#eaa98a', '#f9d68a'];
  const EDDIES = [[150, 96, -44], [648, 120, 46], [96, 250, 34]];
  const skyDir = (x, y) => {
    let vx = 0, vy = 0;
    { const [a, b] = goldenSpiralV(x, y, dc[0], dc[1], 108, 250); vx += a; vy += b; }        // MACRO wheel on the Light
    for (const [ex, ey, s] of EDDIES) { const [a, b] = goldenSpiralV(x, y, ex, ey, s, 76); vx += a; vy += b; }
    const [c, d] = curlV(x, y, 33, 120); vx += c * 24; vy += d * 24;                          // MICRO turbulence
    const gx = dc[0] - x, gy = dc[1] - y, gd = Math.hypot(gx, gy) + 1e-6, pull = 78 / (1 + gd / 150);
    vx += (gx / gd) * pull; vy += (gy / gd) * pull;                                            // IN-DRAW toward the Light
    return Math.atan2(vy, vx);
  };
  out.push(`<rect width="${W}" height="${H}" fill="#39407e"/>`);
  strokes(out, counter, {
    rng, n: 1150,
    sample: rej(-10, -10, 810, horizon + 34),
    dir: skyDir,
    col: (x, y, r) => {
      // radius from the Light drives the dark→bright fall: dark at the rim, gold at the core
      const rd = Math.hypot(x - dc[0], (y - dc[1]) / 0.92) / 320;
      let c = ramp(SKY, Math.min(1, rd * 0.82 + fbm(x / 120, y / 120, 23) * 0.22));
      c = mix(c, '#ffe7b2', gL(x, y) * 0.8);        // the Light flooding warmth outward
      return jig(c, r, 11);
    },
    len: 24, lw: 5.6, steps: 4, follow: 0.9, wild: 0.06, lenJ: 0.5, impasto: 0.5, relief: 0.5,
    aJ: (x, y) => 0.13 + gL(x, y) * 0.28,
  });

  // THE GLORY — the Light itself: a tight brilliant sun so it is the clear, brightest hero
  klimtGold(out, counter, rng, dc[0], dc[1], 44, 172, { rings: 8, opacity: 0.5, squash: 0.96 });
  strokes(out, counter, {                          // radiant body of the Light — a compact sun
    rng, n: 640,
    sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 0.8) * 104; return [dc[0] + Math.cos(a) * d, dc[1] + Math.sin(a) * d * 0.94]; },
    dir: (x, y) => Math.atan2(y - dc[1], x - dc[0]),
    col: (x, y, r) => jig(ramp([GOLD_HOT, '#fff2cf', GOLD_PALE, GOLD, GOLD_DEEP], Math.hypot(x - dc[0], (y - dc[1]) / 0.94) / 104), r, 8),
    len: 12, lw: 2.3, steps: 2, impasto: 0.5,
  });
  strokes(out, counter, {                          // calm rays of welcome, not a full starburst
    rng, n: 82,
    sample: r => { const a = r() * Math.PI * 2, d = 30 + r() * 78; return [dc[0] + Math.cos(a) * d, dc[1] + Math.sin(a) * d * 0.94]; },
    dir: (x, y) => Math.atan2(y - dc[1], x - dc[0]),
    col: (x, y, r) => jig(mix(GOLD_HOT, GOLD_PALE, r() * 0.5), r, 6),
    len: (x, y) => 22 + Math.hypot(x - dc[0], y - dc[1]) * 0.24, lw: 1.6, steps: 2, lenJ: 0.6,
  });

  // Α and Ω — the hidden easter egg, incised faint in the glow either side of the Light
  const glyph = (pts) => { out.push(`<polyline points="${pts.map(p => `${R1(p[0])},${R1(p[1])}`).join(' ')}" fill="none" stroke="#fff6db" stroke-opacity="0.34" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>`); counter.n++; };
  glyph([[286, 96], [298, 66], [310, 96]]); glyph([[291, 86], [305, 86]]);                       // Α (alpha), left of the Light
  glyph([[490, 96], [484, 78], [492, 66], [504, 66], [512, 78], [506, 96]]); glyph([[484, 96], [492, 96]]); glyph([[506, 96], [514, 96]]);  // Ω (omega), right

  /* ---------------- 2. THE HILL + THE NEW JERUSALEM (the crest) ---------------- */
  strokes(out, counter, {                          // the green hill rising to the crest, lit warm
    rng, n: 820,
    sample: rej(-10, horizon - 46, 810, 340, (x, y) => y > crest(x) - 2),
    dir: (x, y) => { const [vx, vy] = curlV(x, y, 120, 60); return Math.atan2(vy * 0.7 + 0.12, Math.abs(vx) + 0.8); },
    col: (x, y, r) => {
      let c = ramp(['#3c743d', '#4c8642', '#67a04e'], fbm(x / 90, y / 60, 51) * 0.8);
      c = mix(c, '#e8d08a', gL(x, y) * 0.5);
      return jig(c, r, 10);
    },
    len: (x, y) => 15 * dS(y), lw: (x, y) => 4.5 * dS(y), steps: 3, impasto: 0.5, relief: 0.4,
  });
  // THE PALACE OF GOD — New Jerusalem, gold towers round the OPEN GATE of light
  paintPalace(out, counter, rng, city.x, crest(city.x) + 2, 0.46, { gate: true });

  /* ---------------- 3. THE ROAD HOME + FIELD ---------------- */
  // The ground's top edge is where it meets the sky — grass has no outline, it
  // has blades. This jagged contour replaces crest in the FILL only (sampled fine
  // enough to keep the sawtooth; a coarse step averages it straight again).
  const crestJag = x => {
    const fine = (fbm(x / 3.1, 2.1, 709) - 0.5) * 6.5;
    const tuft = Math.max(0, fbm(x / 8.5, 9.4, 711) - 0.52) * 24;
    return crest(x) + fine - tuft;
  };
  {                                                // solid green field underpaint
    let d = `M-2 ${R1(crestJag(-2))}`;
    for (let x = -2; x <= 802; x += 2.2) d += `L${R1(x)} ${R1(crestJag(x))}`;
    d += `L802 ${H + 2}L-2 ${H + 2}Z`;
    out.push(`<path d="${d}" fill="#3c7438"/>`); counter.n++;
  }
  // the ragged skyline: tufts standing up off the crest with gaps between them
  horizonFringe(out, counter, rng, {
    horizonFn: crest, cols: ['#3c7836', '#568e40', '#77aa4c', '#92ba58'],
    hMax: 20, lightFn: gL, seed: 713, dirJitter: 0.72,
  });
  {                                                // the pale ROAD underpaint — a warm ribbon home
    let L2 = [], R2 = [];
    for (let t = 0; t <= 1.001; t += 0.08) {
      const p = roadP(t), q = roadP(Math.min(1, t + 0.03));
      let nx = -(q[1] - p[1]), ny = q[0] - p[0]; const nl = Math.hypot(nx, ny) || 1; nx /= nl; ny /= nl;
      const hw = roadW(t) / 2;
      L2.push([p[0] + nx * hw, p[1] + ny * hw]); R2.push([p[0] - nx * hw, p[1] - ny * hw]);
    }
    let d = `M${R1(L2[0][0])} ${R1(L2[0][1])}`;
    for (let i = 1; i < L2.length; i++) d += `L${R1(L2[i][0])} ${R1(L2[i][1])}`;
    for (let i = R2.length - 1; i >= 0; i--) d += `L${R1(R2[i][0])} ${R1(R2[i][1])}`;
    out.push(`<path d="${d}Z" fill="#d8c090"/>`); counter.n++;
  }
  strokes(out, counter, {                          // field grass off the road
    rng, n: 1500,
    sample: rej(-10, horizon - 18, 810, 512, (x, y) => y > crest(x) - 1 && !onRoad(x, y)),
    dir: (x, y) => { const [vx, vy] = curlV(x, y, 150, 66); return Math.atan2(vy * 0.85 - 0.12, Math.abs(vx) + 0.7); },
    col: (x, y, r) => {
      let c = ramp(['#3c7836', '#568e40', '#77aa4c', '#92ba58'], fbm(x / 70, y / 44, 91) * 0.9);
      c = mix(c, '#e8d488', gL(x, y) * 0.3);
      return jig(c, r, 12);
    },
    len: (x, y) => 12 * dS(y), lw: (x, y) => 3.4 * dS(y), steps: 3, impasto: 0.45, relief: 0.35, lenJ: 0.5,
  });
  strokes(out, counter, {                          // THE ROAD — brightest where the Light spills down it
    rng, n: 900,
    sample: rej(-10, horizon - 8, 810, 512, (x, y) => onRoad(x, y)),
    dir: (x, y) => { const { t } = roadInfo(x, y); const p = roadP(Math.min(1, t + 0.02)), q = roadP(t); return Math.atan2(p[1] - q[1], p[0] - q[0]); },
    col: (x, y, r) => {
      const { t } = roadInfo(x, y);
      let c = ramp(['#efe0b0', '#e6cf94', '#d8bd82'], fbm(x / 50, y / 50, 41) * 0.7);
      c = mix(c, '#fff0c8', gL(x, y) * 0.5 + (1 - t) * 0.34);   // the road home is the brightest path
      return jig(c, r, 8);
    },
    len: (x, y) => 12 * dS(y), lw: (x, y) => 3.6 * dS(y), steps: 3, impasto: 0.5, relief: 0.4, lenJ: 0.5,
  });

  // THE ROAD, WORN — ruts, a lit crown between them, loose grit, and a verge
  // that breaks into the grass instead of ending at a clean edge.
  dirtRoad(out, counter, rng, {
    ptFn: roadP, wFn: roadW,
    cols: ['#a98a58', '#cfae76', '#f0e0ae'],
    lightFn: gL, ruts: 0.34, stones: 150, verge: 250, seed: 827,
  });

  // the SCARLET THREAD of redemption, woven faint along the road's edge (Gen 3:15 → Rev 22:13)
  {
    let d = '';
    for (let t = 0; t <= 1.001; t += 0.05) {
      const p = roadP(t); const off = Math.sin(t * 7) * (roadW(t) * 0.28);
      const x = p[0] + off, y = p[1];
      d += (d ? 'L' : 'M') + R1(x) + ' ' + R1(y);
    }
    out.push(`<path d="${d}" fill="none" stroke="#c0392b" stroke-opacity="0.5" stroke-width="2.1" stroke-linecap="round"/>`); counter.n++;
  }

  /* ---------------- 4. THE PILGRIM — you, setting out up the road toward the Light ---- */
  // small under the great Light, back turned, following the road home. Baked in
  // (this is the cover, not a runtime-actor page).
  paintMask(out, counter, rng, {
    x: 393, y: 448, h: 44, facing: 1, back: true, lean: 2,
    armR: [414, 414], stride: 0.35, wind: -0.2,
  });

  /* ---------------- 5. near grass (closest) ---------------- */
  strokes(out, counter, {
    rng, n: 300,
    sample: rej(-10, 452, 810, 512, (x, y) => !onRoad(x, y)),
    dir: () => -Math.PI / 2 + (rng() - 0.5) * 0.5,
    col: (x, y, r) => jig(ramp(['#356e2e', '#4f8c3a', '#6aa048'], r()), r, 12),
    len: 20, lw: 3.4, steps: 3, impasto: 0.55, relief: 0.45, lenJ: 0.6,
  });

  const ALT = 'A great radiant Light rides high in a dawn sky, its gold glory overcoming the deep blue-violet night at the edges; below it the New Jerusalem glows on a green crest, gold towers around an open gate of light; a bright road winds down from the gate to the reader’s feet, and a small pilgrim in red has just set out up the road, following the Light home. The Greek letters Alpha and Omega are hidden faint in the glow.';
  return svgWrap(ALT, out.join('\n'));
}
