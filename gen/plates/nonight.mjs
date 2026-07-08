// gen/plates/nonight.mjs — "No more night" (the New Jerusalem)
//
// The CONSUMMATION. The destination of the whole book. The Father's house of
// the door-page has GROWN into a radiant CITY of pure gold on a hill — many
// glowing homes and towers — and at its heart burns the LAMB-LIGHT, so great
// that there is no sun and no candle in the sky, and NO SHADOW anywhere. This
// is the one page in the book with no dark at all: it is ALL light.
//
//   "And there shall be no night there; and they need no candle, neither light
//    of the sun; for the Lord God giveth them light."          — Rev 22:5
//   "And God shall wipe away all tears from their eyes."        — Rev 21:4
//   "And the city had no need of the sun... for the glory of God did lighten
//    it, and the Lamb is the light thereof."                    — Rev 21:23
//
// A bright RIVER OF LIFE flows down out of the City (Rev 22:1, "a pure river of
// water of life, clear as crystal, proceeding out of the throne"); fruit trees
// of life line it (Rev 22:2). Tiny redeemed figures walk in the light with
// their faces lifted — and among them one small RED child, "you," home at last.
// Maximum radiance: gold, white, warm pastels. No black, no grey, no shadow.

export const name = 'nonight';
export const title = 'No more night';
export const caption = 'And there shall be no night there.';
export const seed = 22050405;          // Rev 22:5
export const focal = { x: 400, y: 250 }; // the City of gold on its hill, the Lamb-light at its heart
// MOBILE 3D — depth planes (FAR→NEAR), composite-once multiplane: the radiant
// SKY (glory + Lamb-light streaming down) is the opaque backmost ground; the
// CITY of gold towers on the hill sits far; the RIVER OF LIFE + the trees of
// life + the meadow + wildflowers ride the mid ground (planted, so they move
// with the hill they grow on); the REDEEMED figures (incl. the red child) lead
// nearest. Desktop/`full` is byte-identical to the original single-layer paint.
export const layers = [
  { name: 'sky', opaque: true },  // pure radiance: glory sky + streaming light + Lamb-light heart (backmost, opaque)
  { name: 'far' },                // the City of pure gold — towers, homes, gate, glory-halo
  { name: 'mid' },                // the river of life, trees of life, meadow, wildflowers (planted)
  { name: 'fg' },                 // the redeemed walking in the light, and the red child — home at last
];

export function paint(E, opts = {}) {
  const {
    mulberry32, fbm, curlV, goldenSpiralV, mix, ramp, jig, strokes, rej,
    paintFigure, paintPath, inCap, underpaintCapsules, paintChild, personCaps, lightRadial,
    svgWrap, R1, W, H,
    GOLD, GOLD_PALE, GOLD_DEEP, GOLD_HOT,
  } = E;

  const rng = mulberry32(seed);
  const out = [];
  const counter = { n: 0 };
  // MOBILE 3D LAYERS: everything draws once, in order; we record which out[]
  // index ranges belong to the FAR (City) and FG (figures) bands. Whatever is
  // not tagged and sits after skyEnd falls to the MID plane (river/trees/ground).
  const LAYER = opts.layer || 'full';
  const farRanges = [], fgRanges = [];

  // The ground is already light — a warm pale gold, NEVER dark. Every gap that
  // shows through the strokes glows; there is no night to leak between them.
  out.push(`<rect width="${W}" height="${H}" fill="#fbe9b0"/>`);

  /* ---------------- geometry ---------------- */
  const horizon = 280;                       // the city sits on a hill above this
  const cityX = 400, cityHeart = 132;        // the LAMB-LIGHT, high over the City (so the towers read below it)
  // the Lamb-light fills everything — a very wide reach so NO corner is dark
  const glory = lightRadial(cityX, cityHeart, 600);
  const lightAt = (x, y) => Math.min(1, 0.5 + glory(x, y) * 0.85);   // floor of 0.5 → nowhere is dark

  // the hill the City crowns — a gentle rise of living gold
  const hillTop = x => horizon - 6 * Math.sin(x / 170 + 0.6);

  /* ---------------- 1. THE SKY — pure radiance, no sun, no candle (Rev 22:5) ----------------
     not a dawn but a glory: light pouring DOWN and OUT from the City's heart.
     A luminous gradient underpaints it so every gap is gold-white — there is
     no night to show through. The sky is nature, so it gently turns (Munch),
     but it is GLORY, not storm: the eddies all wheel out from the Lamb-light. */
  out.push(`<defs><radialGradient id="glory13" cx="0.5" cy="0.40" r="0.92">
<stop offset="0" stop-color="#fffdf2"/>
<stop offset="0.34" stop-color="#fff3cf"/>
<stop offset="0.62" stop-color="#ffe7ab"/>
<stop offset="0.85" stop-color="#fbdc92"/>
<stop offset="1" stop-color="#f6cf86"/>
</radialGradient></defs>`);
  out.push(`<rect x="-12" y="-12" width="${W + 24}" height="${horizon + 18}" fill="url(#glory13)"/>`);
  counter.n++;
  // THE ALIVE GLORY (the fractal sky — motion at three scales): the whole radiance
  // WHEELS in ONE great golden spiral centred on the Lamb-light (macro), a few
  // eddies turn inside the wheel (mid), and every stroke curves with its parent
  // current (micro). Starry-Night law on a page of pure day: RADIANCE AND SWIRL —
  // the light still streams straight OUT from the heart (Rev 22:5, "the Lord God
  // giveth them light"), but now it wheels as it pours, swirls within swirls.
  const EDDIES = [[150, 78, -60], [654, 92, 58], [78, 150, 50], [726, 158, -46]];   // 3-4 mid eddies, alternating, spread across the glory
  const skyDir = (x, y) => {
    // the light still streams radially OUTWARD from the heart (glory pouring out)
    let vx = (x - cityX) * 0.16, vy = (y - cityHeart) * 0.16 - 8;
    // 1 · MACRO — ONE great wheel of glory, centred on the Lamb-light, turning the whole sky
    { const [a, b] = goldenSpiralV(x, y, cityX, cityHeart, 110, 260); vx += a; vy += b; }
    // 2 · MID — a few eddies turning inside the wheel
    for (const [ex, ey, s] of EDDIES) { const [a, b] = goldenSpiralV(x, y, ex, ey, s, 80); vx += a; vy += b; }
    // 3 · MICRO — fine turbulence so every stroke curves with its parent current
    const [c, d] = curlV(x, y, 31, 120); vx += c * 26; vy += d * 26;
    return Math.atan2(vy, vx);
  };
  // jewel eddy-glows — deep warm-gold / rose tints of THIS radiant palette, breathing
  // faint colour at each eddy core (the alive richness, subtle on the bright ground)
  const EGLOW = [[150, 78, '#f6c86a'], [654, 92, '#f2a4b4'], [78, 150, '#f3b674'], [726, 158, '#efb89a']];
  const skyCol = (x, y, r, lift) => {
    // all warm light — white-gold at the crown over the City, deepening only to a
    // rich honey gold at the far frame (never blue, never dark)
    const d = Math.hypot(x - cityX, (y - cityHeart) * 1.1) / 360;
    let c = ramp(['#fffef6', '#fff6d6', '#ffeab2', '#fbdc95', '#f4ce82'], Math.min(1, d * 0.92 + fbm(x / 130, y / 120, 13) * 0.22));
    for (const [ex, ey, ec] of EGLOW) { const d2 = Math.hypot(x - ex, y - ey); c = mix(c, ec, Math.exp(-d2 / 95) * 0.42); }   // the eddy cores breathe faint jewel warmth
    c = mix(c, '#fffdf4', glory(x, y) * 0.55);
    if (lift) c = mix(c, '#ffffff', lift);
    return jig(c, r, 5);
  };
  // the deep flowing glory — long streaming strokes that FOLLOW the great wheel
  strokes(out, counter, {
    rng, n: 700,
    sample: rej(-12, -12, 812, horizon + 12, (x, y) => y < hillTop(x) + 10),
    dir: skyDir,
    col: (x, y, r) => skyCol(x, y, r, 0),
    len: 44, lw: 9.5, steps: 4, follow: 0.91, wild: 0.05, lenJ: 0.5, impasto: 0.5, relief: 0.55,
  });
  // VAN GOGH ARMS — streaming glory: long curling filaments of light pouring out
  strokes(out, counter, {
    rng, n: 230,
    sample: rej(-12, -12, 812, horizon + 6, (x, y) => y < hillTop(x) + 4),
    dir: skyDir,
    col: (x, y, r) => jig(mix(skyCol(x, y, r, 0), '#fffef0', Math.min(0.9, 0.25 + glory(x, y) * 0.9)), r, 5),
    len: 46, lw: 2, steps: 6, follow: 0.96, wild: 0.03, lenJ: 0.5, impasto: 0.4, relief: 0,
  });
  // bright cloud-ribbon crests catching the glory
  strokes(out, counter, {
    rng, n: 170,
    sample: rej(-12, -12, 812, horizon + 4, (x, y) => y < hillTop(x) + 2),
    dir: skyDir,
    col: (x, y, r) => {
      const k = fbm(x / 100, y / 100, 19) + (r() - 0.5) * 0.2;
      if (k > 0.64) return jig('#fffef6', r, 6);
      return skyCol(x, y, r, 0.06);
    },
    len: 22, lw: 5, steps: 5, follow: 0.9, wild: 0.18, lenJ: 0.55, impasto: 0.6, relief: 0.4,
  });
  const skyEnd = out.length;   // the radiant sky is the SKY plane (opaque backmost)

  /* ---------------- 2. THE HILL — living gold, the garden-city ground ---------------- */
  out.push(`<rect x="-2" y="${horizon - 2}" width="${W + 4}" height="${H - horizon + 4}" fill="#f3d785"/>`); counter.n++;
  // flourishing gold-green meadow, all of it lit (no shadowed grass anywhere)
  const GROUND = ['#cdd06a', '#e0d784', '#f0dc92', '#f8e7ad', '#fff2cc'];
  strokes(out, counter, {
    rng, n: 1500,
    sample: rej(-10, horizon - 4, 810, 510),
    dir: (x, y) => { const [vx, vy] = curlV(x, y, 357, 84); return Math.atan2(vy * 0.55, Math.abs(vx) + 0.9); },
    col: (x, y, r) => {
      const g = glory(x, y), depth = (y - horizon) / (H - horizon);
      let c = ramp(GROUND, 0.1 + fbm(x / 72, y / 72, 37) * 0.85 + depth * 0.34);
      c = mix(c, '#fff6da', g * 0.6);
      return jig(c, r, 9);
    },
    len: 18, lw: 3.6, steps: 3, wild: 0.12, lenJ: 0.55, impasto: 0.6, relief: 0.7,
  });

  /* ---------------- 3. THE RIVER OF LIFE — flows down out of the City (Rev 22:1) ----------------
     "a pure river of water of life, clear as crystal, proceeding out of the
     throne." Curved gold-white ribbons pour from the City heart down the hill,
     widening toward the reader. Painted before the City so the City sits at its
     spring. */
  const riverTop = [cityX, horizon + 6], riverNear = [402, 512];
  const riverP = t => [
    riverTop[0] + (riverNear[0] - riverTop[0]) * t + Math.sin(t * 3.4) * 46 * (1 - t * 0.5),
    riverTop[1] + (riverNear[1] - riverTop[1]) * t,
  ];
  const riverW = t => 10 + 92 * t * t;                 // springs narrow, broadens to the reader
  const riverInfo = (x, y) => { let bt = 0, bd = 1e9; for (let t = 0; t <= 1.001; t += 0.03) { const p = riverP(t); const d = Math.hypot(x - p[0], y - p[1]); if (d < bd) { bd = d; bt = t; } } return { t: bt, d: bd }; };
  const onRiver = (x, y) => { const { t, d } = riverInfo(x, y); return d < riverW(t) / 2; };
  // the river bed — a clear crystal-gold band
  {
    let L2 = [], R2 = [];
    for (let t = 0; t <= 1.001; t += 0.05) {
      const p = riverP(t), q = riverP(Math.min(1, t + 0.025));
      let nx = -(q[1] - p[1]), ny = q[0] - p[0]; const nl = Math.hypot(nx, ny) || 1; nx /= nl; ny /= nl;
      const hw = riverW(t) / 2;
      L2.push([p[0] + nx * hw, p[1] + ny * hw]); R2.push([p[0] - nx * hw, p[1] - ny * hw]);
    }
    let d = `M${R1(L2[0][0])} ${R1(L2[0][1])}`;
    for (let i = 1; i < L2.length; i++) d += `L${R1(L2[i][0])} ${R1(L2[i][1])}`;
    for (let i = R2.length - 1; i >= 0; i--) d += `L${R1(R2[i][0])} ${R1(R2[i][1])}`;
    out.push(`<path d="${d}Z" fill="#eaf4ec"/>`); counter.n++;
  }
  // the flowing water — gold-white ribbons running down the current
  strokes(out, counter, {
    rng, n: 620,
    sample: rej(280, horizon, 520, 512, onRiver),
    dir: (x, y) => { const { t } = riverInfo(x, y); const a = riverP(Math.max(0, t - 0.025)), b = riverP(Math.min(1, t + 0.025)); return Math.atan2(b[1] - a[1], b[0] - a[0]); },
    col: (x, y, r) => {
      const { t, d } = riverInfo(x, y);
      const edge = d / (riverW(t) / 2);
      // crystal: white-gold spine, pale aqua-gold at the banks, all bright
      let c = ramp(['#ffffff', '#fff6d8', '#eafbf2', '#bfeede', '#aee0da'], edge * 0.85 + fbm(x / 40, y / 60, 43) * 0.3);
      return jig(mix(c, '#fffef2', glory(x, y) * 0.5), r, 6);
    },
    len: 16, lw: 3.0, steps: 3, lenJ: 0.55, wild: 0.08, impasto: 0.4, relief: 0.4,
  });
  // bright sparkles ON the water — light dancing on the river of life
  strokes(out, counter, {
    rng, n: 130,
    sample: r => { const t = Math.pow(r(), 0.8); const p = riverP(t); return [p[0] + (r() + r() - 1) * riverW(t) * 0.34, p[1] + (r() - 0.5) * 4]; },
    dir: (x, y) => { const { t } = riverInfo(x, y); const a = riverP(Math.max(0, t - 0.025)), b = riverP(Math.min(1, t + 0.025)); return Math.atan2(b[1] - a[1], b[0] - a[0]); },
    col: (x, y, r) => jig(r() < 0.5 ? '#ffffff' : '#fff6d6', r, 5),
    len: 9, lw: 1.5, steps: 2, lenJ: 0.6, wJ: 0.5, relief: 0,
  });

  /* ---------------- 4. THE CITY OF PURE GOLD ON THE HILL (Rev 21:18-23) ----------------
     The Father's house grown into a whole CITY: many glowing homes and towers
     of gold climbing the hill, crowned by a great gate. First a vast glory of
     light all around it, then the drawn city, then the LAMB-LIGHT at its heart. */
  const _far = out.length;
  // a great GLORY of light crowning the City (Rev 21:23) — a halo of radiance
  // ABOVE the rooftops, so it haloes the city without washing the towers away
  strokes(out, counter, {
    rng, n: 420,
    sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 0.9) * 150; return [cityX + Math.cos(a) * d, cityHeart + 8 + Math.sin(a) * d * 0.72]; },
    dir: (x, y) => Math.atan2(y - cityHeart, x - cityX),
    col: (x, y, r) => jig(ramp([GOLD_HOT, GOLD_PALE, GOLD, GOLD_DEEP, '#d8b256'], Math.hypot(x - cityX, (y - cityHeart - 8) / 0.72) / 150), r, 8),
    len: 12, lw: 2.4, steps: 2, impasto: 0.5, relief: 0.4,
  });

  // the CITY skyline — a cluster of towers + homes of gold climbing the hill.
  // built from drawn rectangles (made things → straight lines, Munch) with gold
  // wall texture and white-hot windows, so it reads clearly as a radiant city.
  const buildings = [
    // [cx, baseY, w, wallH, roof('peak'|'flat'|'dome'), scale]
    [400, horizon + 6, 64, 84, 'peak', 1.18],   // the great central house — the door-page home, grown
    [330, horizon + 12, 40, 56, 'dome', 1.0],
    [470, horizon + 12, 42, 60, 'peak', 1.0],
    [276, horizon + 20, 34, 44, 'flat', 0.92],
    [524, horizon + 20, 36, 48, 'dome', 0.92],
    [232, horizon + 28, 28, 36, 'peak', 0.84],
    [566, horizon + 28, 30, 40, 'flat', 0.84],
    [360, horizon - 2, 24, 40, 'peak', 0.8],     // a far tower behind, higher up
    [442, horizon - 2, 22, 38, 'dome', 0.8],
    [190, horizon + 36, 24, 30, 'flat', 0.76],
    [610, horizon + 36, 26, 32, 'peak', 0.76],
  ];
  // sort far(top)→near(bottom) so nearer homes overlap the farther ones
  buildings.sort((a, b) => a[1] - b[1]);
  for (const [bx, by, w, wh, roof, sc] of buildings) {
    const hw = w / 2, top = by - wh;
    // a thin warm-amber edge under each wall so the tower's SHAPE reads against
    // the surrounding bloom (a rich gold line, never a dark shadow)
    out.push(`<path d="M${R1(bx - hw - 1.6)} ${R1(by)}L${R1(bx - hw - 1.6)} ${R1(top - 1.6)}L${R1(bx + hw + 1.6)} ${R1(top - 1.6)}L${R1(bx + hw + 1.6)} ${R1(by)}Z" fill="#caa14a"/>`); counter.n++;
    // walls of gold
    out.push(`<path d="M${R1(bx - hw)} ${R1(by)}L${R1(bx - hw)} ${R1(top)}L${R1(bx + hw)} ${R1(top)}L${R1(bx + hw)} ${R1(by)}Z" fill="#f4d98e"/>`); counter.n++;
    // roof / crown — richer amber so it reads against the radiance
    if (roof === 'peak') {
      out.push(`<path d="M${R1(bx - hw - 7)} ${R1(top + 2)}L${R1(bx)} ${R1(top - wh * 0.42)}L${R1(bx + hw + 7)} ${R1(top + 2)}Z" fill="#d99f3e"/>`); counter.n++;
    } else if (roof === 'dome') {
      out.push(`<path d="M${R1(bx - hw - 1)} ${R1(top + 2)}Q${R1(bx)} ${R1(top - wh * 0.7)} ${R1(bx + hw + 1)} ${R1(top + 2)}Z" fill="#e3b950"/>`); counter.n++;
      out.push(`<circle cx="${R1(bx)}" cy="${R1(top - wh * 0.34)}" r="${R1(2.4 * sc)}" fill="#fffbe6"/>`); counter.n++;   // a bright finial
    } else { // flat — a battlement crown
      out.push(`<path d="M${R1(bx - hw)} ${R1(top + 2)}L${R1(bx - hw)} ${R1(top - 5)}L${R1(bx - hw * 0.4)} ${R1(top - 5)}L${R1(bx - hw * 0.4)} ${R1(top)}L${R1(bx + hw * 0.4)} ${R1(top)}L${R1(bx + hw * 0.4)} ${R1(top - 5)}L${R1(bx + hw)} ${R1(top - 5)}L${R1(bx + hw)} ${R1(top + 2)}Z" fill="#dcad48"/>`); counter.n++;
    }
    // gold wall texture (warm, lit)
    strokes(out, counter, {
      rng, n: Math.round(w * wh * 0.05),
      sample: rej(bx - hw + 1, top + 2, bx + hw - 1, by - 1),
      dir: () => 0,
      col: (x, y, r) => jig(mix(ramp([GOLD_HOT, GOLD_PALE, GOLD, '#e3c46c'], fbm(x / 16, y / 16, 53) * 0.5 + 0.25), GOLD_HOT, glory(x, y) * 0.4), r, 6),
      len: 8, lw: 2.4, steps: 2, impasto: 0.4, relief: 0.5,
    });
    // white-hot windows — homes full of light, no candle needed
    const rows = Math.max(1, Math.round(wh / 22)), cols = Math.max(1, Math.round(w / 18));
    for (let ry = 0; ry < rows; ry++) for (let cxn = 0; cxn < cols; cxn++) {
      const wx = bx - hw + (cxn + 0.5) * (w / cols) - 3.2 * sc;
      const wy = top + 8 + ry * ((wh - 12) / rows);
      out.push(`<rect x="${R1(wx)}" y="${R1(wy)}" width="${R1(6.4 * sc)}" height="${R1(8 * sc)}" rx="1.2" fill="#fffaf0"/>`); counter.n++;
      out.push(`<rect x="${R1(wx + 1)}" y="${R1(wy + 1)}" width="${R1(4.4 * sc)}" height="${R1(5.5 * sc)}" fill="#fff3c8"/>`); counter.n++;
    }
  }
  // the great central GATE — the one glowing way in (Rev 21:25, "the gates of it
  // shall not be shut at all by day: for there shall be no night there")
  {
    const gx = 400, gy0 = horizon + 6, gy1 = horizon - 56, gw = 22;
    // a blaze of pure light pouring out of the open gate
    strokes(out, counter, {
      rng, n: 120,
      sample: r => [gx - gw / 2 + r() * gw, gy1 + r() * (gy0 - gy1)],
      dir: () => Math.PI / 2,
      col: (x, y, r) => jig(mix(GOLD_HOT, '#fffef4', r() * 0.6), r, 4),
      len: 9, lw: 2.4, steps: 2, impasto: 0.5, relief: 0,
    });
    // EASTER EGG — Rev 22:5 in the ORIGINAL KOINE GREEK numerals, ΚΒʹ·Εʹ (22, 5),
    // incised over the gate: "and there shall be NO NIGHT there." The verse the
    // whole page paints, cut dark into the bright gold above the open way in.
    E.inscriptionText(out, E.greekRef(22, 5), { x: 400, y: horizon - 64, h: 14, body: '#5a3c10', edge: '#fff6d2', op: 0.82, edgeOp: 0.6 });
  }

  /* ---------------- 5. THE LAMB-LIGHT — the throne at the City's heart (Rev 21:23) ----------------
     "the Lamb is the light thereof." Not a sun in the sky, not a candle: a great
     white-hot radiance at the City's heart, the source of all the light. */
  // KLIMT GOLD — a gilded glory-halo of the throne, concentric gold rings + dots
  E.klimtGold(out, counter, rng, cityX, cityHeart, 60, 200, { rings: 9, opacity: 0.66, squash: 0.8 });
  // BOLD RAYS beaming from the Lamb-light across the whole sky (Rev 22:5)
  strokes(out, counter, {
    rng, n: 130,
    sample: r => { const a = r() * Math.PI * 2, d = 30 + r() * 96; return [cityX + Math.cos(a) * d, cityHeart + Math.sin(a) * d * 0.86]; },
    dir: (x, y) => Math.atan2(y - cityHeart, x - cityX),
    col: (x, y, r) => jig(mix(GOLD_HOT, GOLD_PALE, r() * 0.5), r, 5),
    len: (x, y) => 24 + Math.hypot(x - cityX, y - cityHeart) * 0.42, lw: 1.6, steps: 2, lenJ: 0.6, relief: 0,
  });
  // the white-hot heart itself
  strokes(out, counter, {
    rng, n: 150,
    sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 0.7) * 46; return [cityX + Math.cos(a) * d, cityHeart + Math.sin(a) * d]; },
    dir: () => 0,
    col: (x, y, r) => jig(mix('#fffef6', GOLD_HOT, Math.hypot(x - cityX, y - cityHeart) / 46), r, 4),
    len: 7, lw: 3, steps: 2, impasto: 0.5, relief: 0,
  });
  // LEGIBLE GOLD SPARKS raining off the whole City — it RADIATES (Rev 21:11)
  E.goldSparks(out, counter, rng, cityX, cityHeart + 20, 30, 240, 150, { squash: 0.82, big: 1.15, lightFn: glory });
  farRanges.push([_far, out.length]);   // ← the City of gold + its glory + Lamb-light (FAR plane)

  /* ---------------- 6. THE TREES OF LIFE — line the river (Rev 22:2) ----------------
     "on either side of the river, was there the tree of life" — fruit trees of
     life in flourishing free colour, lining the water of life down the hill. */
  E.fruitTree(out, counter, rng, 110, 470, 92, 44, E.LEAF_PALETTES[2], glory);  // teal, far-left, big
  E.fruitTree(out, counter, rng, 690, 484, 96, 46, E.LEAF_PALETTES[0], glory);  // violet, far-right, big
  E.fruitTree(out, counter, rng, 196, 408, 52, 26, E.LEAF_PALETTES[1], glory);  // pink, mid-left
  E.fruitTree(out, counter, rng, 612, 416, 54, 27, E.LEAF_PALETTES[4], glory);  // green, mid-right
  E.fruitTree(out, counter, rng, 268, 372, 40, 20, E.LEAF_PALETTES[3], glory);  // blue, by the river, left
  E.fruitTree(out, counter, rng, 540, 376, 40, 20, E.LEAF_PALETTES[5], glory);  // amber, by the river, right

  /* ---------------- 6b. THE TREE OF LIFE — twelve manner of fruits (Rev 22:2) ----------------
     "on either side of the river, was there the tree of life, which bare twelve
     manner of fruits" — THE tree, the grandest on the page, on the near bank of
     the river of life: a great swirling emerald canopy (living = curved, Munch)
     bearing exactly TWELVE fruits, each a different manner — a different jewel
     colour — set round the crown so every one shows. A child can count them. */
  const TOL = { x: 326, y: 374, rx: 56, ry: 42, baseY: 456 };
  const inTreeOfLife = (x, y) => ((x - TOL.x) / (TOL.rx + 5)) ** 2 + ((y - TOL.y) / (TOL.ry + 5)) ** 2 < 1;
  {
    const { x: tx, y: ty, rx, ry, baseY } = TOL;
    // trunk + two boughs — curved living lines, warm sienna gold-lit (no black here)
    paintPath(out, counter, rng, [[tx, baseY], [tx - 4, baseY - 24], [tx + 4, baseY - 46], [tx - 2, ty + ry * 0.5]],
      (x, y, r) => jig(mix('#6a4018', '#a4702e', r() * 0.55 + glory(x, y) * 0.3), r, 7), { lw: 7.5, len: 7, density: 0.9, jitter: 0.5 });
    paintPath(out, counter, rng, [[tx + 1, baseY - 40], [tx + 15, ty + ry * 0.35], [tx + 27, ty + 2]],
      (x, y, r) => jig(mix('#6a4018', '#a4702e', r() * 0.55), r, 7), { lw: 4.2, len: 6, density: 0.85, jitter: 0.5 });
    paintPath(out, counter, rng, [[tx - 1, baseY - 42], [tx - 16, ty + ry * 0.32], [tx - 28, ty - 2]],
      (x, y, r) => jig(mix('#6a4018', '#a4702e', r() * 0.55), r, 7), { lw: 4.2, len: 6, density: 0.85, jitter: 0.5 });
    // the great canopy — swirling emerald, warmed to gold where the glory falls
    strokes(out, counter, {
      rng, n: 950,
      sample: r => { const a = r() * Math.PI * 2, dd = Math.pow(r(), 0.55); return [tx + Math.cos(a) * rx * dd, ty - Math.sin(a) * ry * dd]; },
      dir: (x, y) => { const [vx, vy] = curlV(x, y, 97, 42); return Math.atan2(vy, vx); },
      col: (x, y, r) => { const g = glory(x, y); let c = ramp(['#3a8a3a', '#57ae46', '#7ec95a', '#a6dc72'], fbm(x / 15, y / 15, 97) * 0.85 + r() * 0.25); return jig(mix(c, '#f6e6a0', g * 0.55), r, 11); },
      len: 10, lw: 2.8, steps: 3, follow: 0.85, lenJ: 0.5, impasto: 0.45,
    });
    // THE TWELVE FRUITS — twelve manner (Rev 22:2): twelve colours, one ring
    // round the crown, alternating in-and-out so none hides another. Each fruit
    // a bold bright orb with a deep warm rim (so it pops off the leaves) and a
    // white gleam of the Lamb-light. Exactly twelve — count them.
    const MANNER = ['#e8402e', '#ff8c22', '#ffc832', '#ffe96a', '#fff6da', '#48e0b0',
                    '#3ab6f0', '#3a66e0', '#8a5ae8', '#c84ae0', '#f05ab0', '#ff9eb8'];
    for (let i = 0; i < 12; i++) {
      const a = Math.PI / 2 + i * Math.PI / 6;         // start at the crown, go round
      const rr = i % 2 ? 0.80 : 0.52;                  // alternate inner/outer — all visible
      const fx2 = tx + Math.cos(a) * rx * rr, fy2 = ty - Math.sin(a) * ry * rr, fr = 6.5;
      out.push(`<circle cx="${R1(fx2)}" cy="${R1(fy2)}" r="${R1(fr + 1.9)}" fill="${mix(MANNER[i], '#4a2a10', 0.55)}" opacity="0.9"/>`);
      out.push(`<circle cx="${R1(fx2)}" cy="${R1(fy2)}" r="${R1(fr)}" fill="${MANNER[i]}"/>`);
      out.push(`<circle cx="${R1(fx2 - fr * 0.32)}" cy="${R1(fy2 - fr * 0.36)}" r="${R1(fr * 0.3)}" fill="#fffef4"/>`);
      counter.n += 3;
    }
  }

  /* ---------------- 6c. THE RIVER SHINES FROM THE THRONE (Rev 22:1) ----------------
     "proceeding out of the throne of God and of the Lamb" — a burst of white
     throne-light where the river leaves the City, and a crystal spine of that
     same light running the whole length of the current: one luminous ribbon
     from the Lamb-light down to the reader's feet. */
  strokes(out, counter, {                              // the SPRING — white blaze at the source
    rng, n: 80,
    sample: r => { const t = Math.pow(r(), 2.4) * 0.5; const p = riverP(t); return [p[0] + (r() + r() - 1) * riverW(t) * 0.55, p[1] + (r() - 0.5) * 5]; },
    dir: (x, y) => { const { t } = riverInfo(x, y); const a = riverP(Math.max(0, t - 0.025)), b = riverP(Math.min(1, t + 0.025)); return Math.atan2(b[1] - a[1], b[0] - a[0]); },
    col: (x, y, r) => jig(mix('#ffffff', GOLD_HOT, r() * 0.4), r, 4),
    len: 12, lw: 2.2, steps: 3, follow: 0.95, lenJ: 0.55, impasto: 0.4, relief: 0,
  });
  strokes(out, counter, {                              // the crystal SPINE down the whole current
    rng, n: 130,
    sample: r => { const t = r(); const p = riverP(t); return [p[0] + (r() + r() - 1) * riverW(t) * 0.16, p[1] + (r() - 0.5) * 3]; },
    dir: (x, y) => { const { t } = riverInfo(x, y); const a = riverP(Math.max(0, t - 0.025)), b = riverP(Math.min(1, t + 0.025)); return Math.atan2(b[1] - a[1], b[0] - a[0]); },
    col: (x, y, r) => jig(mix('#ffffff', '#fff6d8', r() * 0.5), r, 4),
    len: 15, lw: 2.0, steps: 3, follow: 0.95, lenJ: 0.5, relief: 0,
  });

  /* ---------------- 7. THE REDEEMED — walk in the light, faces lifted (Rev 21:24) ----------------
     "And the nations of them which are saved shall walk in the light of it."
     Tiny figures coming up the banks toward the City, faces lifted to the glory —
     and among them ONE small RED child, "you," home at last. */
  // a little company of the redeemed, each a small bright figure, faces up.
  // colours vary (the nations) but all bear the bold dark outline of paintChild.
  const folk = [
    // [x, footY, scale, [3-stop palette]]
    [300, 446, 1.0, ['#4a86c0', '#356a9e', '#244a70']],   // blue robe
    [336, 462, 1.05, ['#5aa86e', '#3f8a52', '#2a5e38']],  // green robe
    [470, 452, 1.02, ['#b77ce0', '#9a5ac8', '#6e3a98']],  // violet robe
    [504, 468, 1.06, ['#e0a850', '#c6863a', '#946028']],  // amber robe
    [262, 478, 0.94, ['#5ec0b0', '#3f9a8c', '#2a6e64']],  // teal robe
    [548, 482, 0.96, ['#e07ab0', '#c25a92', '#8e3e66']],  // rose robe
  ];
  // cute-chunky ARTICULATED standing figures (personCaps): at home, relaxed, faces
  // lifted to the City, hands resting easy at the sides. Small (h≈34*S).
  const figCaps = (fx, fy, S) => {
    const h = 34 * S;
    return personCaps(fx, fy - h, h, {
      headTilt: 1.2,                                  // face lifted to the glory
      leftHand: [fx - 5 * S, fy - h * 0.42],          // hands resting easy at the sides
      rightHand: [fx + 5 * S, fy - h * 0.42],
      leftFoot: [fx - 2.4 * S, fy],
      rightFoot: [fx + 2.4 * S, fy],
    });
  };
  const _fg = out.length;
  for (const [fx, fy, S, cols] of folk) {
    // each figure gives off a little of the City's light (held in the radiance)
    strokes(out, counter, {
      rng, n: 24,
      sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 0.9) * 20 * S; return [fx + Math.cos(a) * d, fy - 16 * S + Math.sin(a) * d]; },
      dir: () => 0,
      col: (x, y, r) => jig(mix(GOLD_PALE, GOLD, r() * 0.5), r, 7),
      len: 5, lw: 1.8, steps: 2, relief: 0,
    });
    paintChild(out, counter, rng, figCaps(fx, fy, S), { cols, outlineW: 4.0, seed: 71 });
  }
  // YOU — the small RED child, home at last, dead centre-low at the river's mouth,
  // closest of all, face lifted to the City. The recurring red protagonist.
  {
    const fx = 400, fy = 492, S = 1.45;
    // a pocket of slightly deeper gold behind so the red figure reads (still no
    // shadow — only a richer warm tone, the way bright reads against less-bright)
    strokes(out, counter, {
      rng, n: 90,
      sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 0.7) * 42 * S; return [fx + Math.cos(a) * d * 0.9, fy - 14 * S + Math.sin(a) * d * 0.6]; },
      dir: (x, y) => { const [vx, vy] = curlV(x, y, 357, 84); return Math.atan2(vy * 0.55, Math.abs(vx) + 0.9); },
      col: (x, y, r) => jig(ramp(['#d8b86a', '#e8cd84', '#f2dc9a'], fbm(x / 40, y / 40, 71) * 0.7), r, 8),
      len: 14, lw: 3.2, steps: 2, impasto: 0.4, relief: 0.5,
    });
    // YOU — cute-chunky ARTICULATED red child (personCaps), home at last, face and
    // both arms lifted HIGH to the City in joy. h≈38*S.
    const ch = 38 * S;
    const cCaps = personCaps(fx, fy - ch, ch, {
      headTilt: 1.6,                                  // face lifted to the City
      leftHand: [fx - 8 * S, fy - ch * 0.82],         // both arms raised out to the glory (head stays clear)
      rightHand: [fx + 8 * S, fy - ch * 0.82],
      leftFoot: [fx - 2.8 * S, fy],
      rightFoot: [fx + 2.8 * S, fy],
    });
    paintChild(out, counter, rng, cCaps);
    // the Light catching the child — the glory full on him, home at last
    strokes(out, counter, {
      rng, n: 18,
      sample: rej(fx - 7 * S, fy - 40 * S, fx + 7 * S, fy - 14 * S, (x, y) => cCaps.some(c => inCap(x, y, c))),
      dir: () => -0.6,
      col: (x, y, r) => jig(mix('#ffd27a', GOLD_HOT, r() * 0.5), r, 9),
      len: 4.5, lw: 1.4, steps: 2, relief: 0,
    });
  }
  fgRanges.push([_fg, out.length]);   // ← the redeemed + the red child (FG plane, nearest)

  /* ---------------- 8. WILDFLOWERS — the City's garden blazes (Rev 22:2; Isa 35:1) ---------------- */
  strokes(out, counter, {
    rng, n: 340,
    sample: rej(-6, horizon + 12, 812, 508, (x, y) => !onRiver(x, y) && !inTreeOfLife(x, y)),
    dir: () => -Math.PI / 2,
    col: (x, y, r) => { const k = r(); return jig(k < 0.22 ? '#ee7ca4' : k < 0.44 ? '#b79ad8' : k < 0.64 ? '#f6d063' : k < 0.82 ? '#ffffff' : '#f2a0c8', r, 12); },
    len: (x, y) => 3 + (y - horizon) / (510 - horizon) * 4, lw: (x, y) => 2.2 + (y - horizon) / (510 - horizon) * 1.6, steps: 1, lenJ: 0.5, impasto: 0.3,
  });

  const ALT = 'The New Jerusalem at the consummation: the Father\'s house grown into a radiant city of pure gold climbing a hill, many glowing homes and towers with white-hot windows, crowned by an open gate. At its heart burns the Lamb-light — a great white-and-gold radiance that fills the whole sky so there is no sun and no candle and no shadow anywhere; the one page with no dark at all. A bright river of life, gold and crystal-white, pours down out of the city from the throne, lined with fruit trees in jewel colour — and on its near bank stands THE TREE OF LIFE, the grandest tree of all, its emerald canopy bearing exactly twelve fruits in twelve different colours, one ring round the crown, each with a gleam of the light. Up the banks the redeemed walk in the light with their faces lifted, and among them one small red child — you — home at last, arms flung up to the glory. And there shall be no night there.';

  // MULTIPLANE: assemble the requested depth plane. Each is its own cel —
  // transparent where it has no content — so they stack and parallax apart.
  const RAW = { undercoat: 0, weave: 0, varnish: 0, oil: 0 };   // no baked surface — the live filter unifies the planes
  const setOf = ranges => { const s = new Set(); for (const [a, b] of ranges) for (let i = a; i < b; i++) s.add(i); return s; };
  const pick = ranges => ranges.map(([a, b]) => out.slice(a, b).join('\n')).join('\n');
  const farSet = setOf(farRanges), fgSet = setOf(fgRanges);
  if (LAYER === 'sky') return svgWrap(ALT, out.slice(0, skyEnd).join('\n'), RAW);   // radiant sky ground (opaque backmost)
  if (LAYER === 'far') return svgWrap(ALT, pick(farRanges), RAW);                   // the City of gold + glory + Lamb-light
  if (LAYER === 'fg') return svgWrap(ALT, pick(fgRanges), RAW);                     // the redeemed + the red child (nearest)
  if (LAYER === 'mid') {                                                            // river, trees, meadow, wildflowers (everything unclaimed)
    const body = out.filter((_, i) => i >= skyEnd && !farSet.has(i) && !fgSet.has(i)).join('\n');
    return svgWrap(ALT, body, RAW);
  }
  // full painting (desktop): byte-identical to the original single-layer paint
  return svgWrap(ALT, out.join('\n'));
}
