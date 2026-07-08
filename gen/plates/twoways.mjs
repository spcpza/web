// gen/plates/twoways.mjs — "Carried home"
// §23 — "And Love carried you home through the door." (Luke 15:24)
//
//   "And when he hath found it, he layeth it on his shoulders, rejoicing."
//                                                            — Luke 15:5
//
// This is the very next beat after RAN (13): the same radiant gold Father who
// ran the whole field to you, arms flung wide, now CARRIES you the rest of the
// way home — on his shoulders, rejoicing — straight through the one glowing
// door of his blazing house. You (the small dark child of page 13) ride high,
// arms up. The world is the full bright new creation: a swirling dawn sky, a
// flourishing green meadow loud with wildflowers, sheep in the pasture
// (Luke 15 — the ninety-and-nine and the one carried home). Through the open
// door: not a dark room but a whole world of colour. You were lost in the dark;
// now you are home in the Light.

export const name = 'twoways';
export const title = 'Carried home';
export const caption = 'Love carried you home.';
export const seed = 23061533;
export const focal = { x: 401, y: 286 }; // portrait window: the glowing door + the carried child
// MOBILE 3D — depth planes (FAR→NEAR): the swirling new-world sky behind; birds,
// cypress + an organic horizon fringe on the far plane; the meadow, the path and
// the blazing house in the middle (the house base is below the horizon, so it
// stays grounded); the framing fruit-trees nearer; the carried Father + child
// closest of all.
// the stacked SKY-SWIRL SHEETS — bold, GAPPED passes of the turning eddies +
// bright cloud ribbons (PAINT ON PAINT, like the covers), each its own depth
// plane with its own rng, so their gaps reveal the smooth sky ground beneath.
export const SKY_SHEETS = [
  { n: 326, len: 27, lw: 5.5, lift: 0.00 },
  { n: 355, len: 24, lw: 5.0, lift: 0.07 },
];
export const layers = [
  { name: 'sky', opaque: true },  // smooth sky ground (backmost, opaque)
  ...SKY_SHEETS.map((_, i) => ({ name: 'sky' + (i + 1) })),   // stacked sky-swirl sheets
  { name: 'far' },                // distant rolling hills, birds, cypress
  { name: 'mid' },                // meadow, path, the blazing house + door, sheep, PLANTED fruit-trees
  { name: 'fg' },                 // the carried Father + child
];

export function paint(E, opts = {}) {
  const {
    mulberry32, fbm, curlV, goldenSpiralV, mix, ramp, jig, strokes, rej,
    paintFigure, radiantHalo, paintLight, paintPath, inCap, underpaintCapsules, paintChild, castShadow, personCaps, lightRadial,
    svgWrap, R1, W, H,
    GOLD, GOLD_PALE, GOLD_DEEP, GOLD_HOT, NIGHT, DARKEST,
  } = E;

  const rng = mulberry32(seed);
  const out = [];
  const counter = { n: 0 };
  // MOBILE 3D LAYERS: tag ranges per band; MID = meadow + house (everything
  // unclaimed below the sky).
  const LAYER = opts.layer || 'full';
  const farRanges = [], fgRanges = [];
  // POST-RESURRECTION: the full bright new world. Light background; YOU (the
  // carried child) are the one dark form, lifted into the Light.
  out.push(`<rect width="${W}" height="${H}" fill="#6ecaf7"/>`);

  /* ---------------- geometry ---------------- */
  const horizon = 250;
  // the home, dead centre — the Father's house, which always BLAZES (Rev 21:23)
  const house = { x: 401, top: 232, base: 322, hw: 62, peak: 192 };
  const door = { x: 401, y0: 254, y1: 322, w: 44 };
  const dc = [door.x, (door.y0 + door.y1) / 2 + 8];               // the one light, low in the doorway
  const gD = lightRadial(dc[0], dc[1], 144);   // hug the door so the carried figure reads on green

  // the path home: curving up from the near foreground to the door's foot
  const near = [210, 508], far = [door.x, door.y1 + 2];
  const roadP = t => [near[0] + (far[0] - near[0]) * t + Math.sin(t * 3.0) * 20 * (1 - t), near[1] + (far[1] - near[1]) * t];
  const roadW = t => 8 + 72 * (1 - t) * (1 - t);
  const roadInfo = (x, y) => { let bt = 0, bd = 1e9; for (let t = 0; t <= 1.001; t += 0.035) { const p = roadP(t); const d = Math.hypot(x - p[0], y - p[1]); if (d < bd) { bd = d; bt = t; } } return { t: bt, d: bd }; };
  const onRoad = (x, y) => { const { t, d } = roadInfo(x, y); return d < roadW(t) / 2; };
  const groundTop = x => horizon + 4 * Math.sin(x / 150 + 1);

  /* ---------------- 1. SKY — the new morning, ALIVE at three scales (the book's hand) ----------------
     the sky is nature, so it swirls — but not as scattered knots: it is DEEP MOVING
     WATER. ONE great wheel organises the whole dawn (macro, centred over the blazing
     home so the sky wheels around the meaning), a few eddies turn inside it (mid),
     and every stroke curves with its parent current (micro). Swirls within swirls. */
  const WHEEL = { x: 401, y: 210 };   // the great wheel's centre — just over the home, the sky turns around the door
  const EDDIES = [[150, 70, -60], [640, 90, 58], [470, 150, -50], [280, 150, 46]];   // 4 eddies spread across the dawn
  const nearSK = (x, y) => { let m = 1e9; for (const [ex, ey] of EDDIES) m = Math.min(m, Math.hypot(x - ex, y - ey) / 70); return m; };
  const skyDir = (x, y) => {
    let vx = 0, vy = 0;
    { const [a, b] = goldenSpiralV(x, y, WHEEL.x, WHEEL.y, 115, 260); vx += a; vy += b; }   // MACRO — the great wheel of the dawn
    for (const [ex, ey, s] of EDDIES) { const [a, b] = goldenSpiralV(x, y, ex, ey, s, 80); vx += a; vy += b; }   // MID — eddies turning inside the wheel
    const [c, d] = curlV(x, y, 31, 120); vx += c * 26; vy += d * 26;   // MICRO — fine turbulence so each stroke curves with its current
    return Math.atan2(vy, vx);
  };
  // jewel eddy-glows in DAWN tints (gold / rose / violet / teal) — the cores breathe
  // faint colour, the alive richness; kept subtle so the light-blue star still reads
  const EGLOW = [[150, 70, '#f0c06a'], [640, 90, '#e78ab0'], [470, 150, '#8a7ccb'], [280, 150, '#5fb8c8']];
  const skyCol = (x, y, r, lift) => {
    // VIBRANT light-blue homecoming sky (the star), warm gold+pink low at the
    // horizon, white at the crown, the home's gold glow warming it near the door
    const t = Math.max(0, Math.min(1, (horizon - y) / horizon * 1.05 + fbm(x / 120, y / 120, 17) * 0.3 - 0.04));
    let c = ramp(['#fbd24e', '#f8a4c2', '#54c6f7', '#74cef8', '#a6e2fb', '#f0fbff'], t);
    for (const [ex, ey, ec] of EGLOW) { const d2 = Math.hypot(x - ex, y - ey); c = mix(c, ec, Math.exp(-d2 / 95) * 0.42); }   // the eddy cores breathe faint jewel light
    c = mix(c, '#fff2d2', gD(x, y) * 0.4);   // the home's warmth wins near the door
    if (lift) c = mix(c, '#ffffff', lift);
    return jig(c, r, 6);
  };
  // the smooth sky GROUND — broad soft masses (opaque base); the swirling
  // brushwork lives in the stacked sheets above, so their gaps reveal paint
  strokes(out, counter, {
    rng, n: 520,
    sample: rej(-10, -10, 810, horizon + 6),
    dir: skyDir,
    col: (x, y, r) => skyCol(x, y, r, 0),
    len: 44, lw: 9.5, steps: 4, follow: 0.91, wild: 0.05, lenJ: 0.5, impasto: 0.5,
    aJ: (x, y) => 0.16 + Math.max(0, 1.3 - nearSK(x, y)) * 0.42 + gD(x, y) * 0.2,
  });
  const skyEnd = out.length;   // the smooth sky ground is the SKY plane (opaque)
  // the stacked SKY-SWIRL SHEETS — each an independent bold, gapped pass of the
  // turning eddies + bright cloud ribbons (paint on paint), own rng per sheet.
  const skySheets = SKY_SHEETS.map((e, k) => {
    const srng = mulberry32(seed + 1009 * (k + 1));
    const sh = [];
    strokes(sh, { n: 0 }, {
      rng: srng, n: e.n,
      sample: rej(-10, -10, 810, horizon + 6),
      dir: skyDir,
      col: (x, y, r) => {
        const near = nearSK(x, y);
        if (near < 1.1 && r() < 0.06) return jig(r() < 0.5 ? '#fffdf6' : '#f79ac6', r, 12); // joy sparks at the knots
        const k2 = fbm(x / 100, y / 100, 19) + (r() - 0.5) * 0.2;
        if (k2 > 0.68) return jig('#fffdf6', r, 8);   // bright cloud-ribbon crests
        return skyCol(x, y, r, e.lift);
      },
      len: e.len, lw: e.lw, steps: 5, follow: 0.91, wild: 0.2, lenJ: 0.55, impasto: 0.6, relief: 0.5,
    });
    return sh.join('\n');
  });

  /* ---------------- 2. MEADOW — flourishing green, the home's garden ---------------- */
  out.push(`<rect x="-2" y="${horizon - 2}" width="${W + 4}" height="${H - horizon + 4}" fill="#477e38"/>`); counter.n++;
  const GREEN = ['#3a7a38', '#5e9a40', '#88b84a', '#bcc850', '#dcd49c'];
  strokes(out, counter, {
    rng, n: 1700,
    sample: rej(-10, horizon - 4, 810, 510, (x, y) => !onRoad(x, y)),
    dir: (x, y) => { const [vx, vy] = curlV(x, y, 351, 80); return Math.atan2(vy * 0.6, Math.abs(vx) + 0.8); },
    col: (x, y, r) => {
      const g = gD(x, y), depth = (y - horizon) / (H - horizon);
      let c = ramp(GREEN, 0.12 + fbm(x / 70, y / 70, 37) * 0.85 + depth * 0.4);
      c = mix(c, '#f0dca0', g * 0.5);   // the door's warmth spilling onto the grass
      return jig(c, r, 11);
    },
    len: 18, lw: 3.6, steps: 3, wild: 0.16, lenJ: 0.55, impasto: 0.66,
  });

  /* ---------------- 3. THE PATH HOME ---------------- */
  {
    let L2 = [], R2 = [];
    for (let t = 0; t <= 1.001; t += 0.06) {
      const p = roadP(t), q = roadP(Math.min(1, t + 0.03));
      let nx = -(q[1] - p[1]), ny = q[0] - p[0]; const nl = Math.hypot(nx, ny) || 1; nx /= nl; ny /= nl;
      const hw = roadW(t) / 2;
      L2.push([p[0] + nx * hw, p[1] + ny * hw]); R2.push([p[0] - nx * hw, p[1] - ny * hw]);
    }
    let d = `M${R1(L2[0][0])} ${R1(L2[0][1])}`;
    for (let i = 1; i < L2.length; i++) d += `L${R1(L2[i][0])} ${R1(L2[i][1])}`;
    for (let i = R2.length - 1; i >= 0; i--) d += `L${R1(R2[i][0])} ${R1(R2[i][1])}`;
    out.push(`<path d="${d}Z" fill="#d4bd8c"/>`); counter.n++;
  }
  strokes(out, counter, {
    rng, n: 640,
    sample: rej(20, horizon, 760, 510, onRoad),
    dir: (x, y) => { const { t } = roadInfo(x, y); const a = roadP(Math.max(0, t - 0.03)), b = roadP(Math.min(1, t + 0.03)); return Math.atan2(b[1] - a[1], b[0] - a[0]); },
    col: (x, y, r) => { const { t, d } = roadInfo(x, y); let c = ramp(['#f2e3bd', '#e2cfa0', '#c9b282'], d / (roadW(t) / 2) * 0.7 + fbm(x / 50, y / 50, 41) * 0.4); return jig(mix(c, GOLD, gD(x, y) * 0.55), r, 9); },
    len: 16, lw: 3.2, steps: 3, lenJ: 0.55, wild: 0.06,
  });
  // the door's warm thread cast down the whole path toward the walker (Luke 15:5)
  strokes(out, counter, {
    rng, n: 120,
    sample: r => { const t = Math.pow(r(), 0.7); const p = roadP(t); return [p[0] + (r() + r() - 1) * roadW(t) * 0.18, p[1] + (r() - 0.5) * 3]; },
    dir: (x, y) => { const { t } = roadInfo(x, y); const a = roadP(Math.max(0, t - 0.03)), b = roadP(Math.min(1, t + 0.03)); return Math.atan2(b[1] - a[1], b[0] - a[0]); },
    col: (x, y, r) => jig(ramp(['#fff3cd', '#ffe9a0', GOLD, GOLD_DEEP], (1 - roadInfo(x, y).t) * 0.9 + (r() - 0.5) * 0.25), r, 7),
    len: 13, lw: 1.7, steps: 3, lenJ: 0.6, wJ: 0.45,
  });

  /* ---------------- 4. THE FATHER'S HOUSE — it BLAZES (Rev 21:23) ----------------
     a great glory of light all around it first, then a clearly drawn home. */
  const hc2 = dc[1] - 18;   // the heart of the glory
  // a great, BRIGHT glory of light all around the home (Rev 21:23) — bigger + warmer
  strokes(out, counter, {
    rng, n: 440,
    sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 0.92) * 150; return [house.x + Math.cos(a) * d, hc2 + Math.sin(a) * d * 0.86]; },
    dir: (x, y) => Math.atan2(y - hc2, x - house.x),
    col: (x, y, r) => jig(ramp([GOLD_HOT, GOLD_PALE, GOLD, GOLD_DEEP, '#caa44e'], Math.hypot(x - house.x, (y - hc2) / 0.86) / 150), r, 9),
    len: 11, lw: 2.1, steps: 2, impasto: 0.5,
  });
  // BOLD RAYS of light beaming out from the home — long, bright, legible beams
  strokes(out, counter, {
    rng, n: 80,
    sample: r => { const a = r() * Math.PI * 2, d = 30 + r() * 60; return [house.x + Math.cos(a) * d, hc2 + Math.sin(a) * d * 0.86]; },
    dir: (x, y) => Math.atan2(y - hc2, x - house.x),
    col: (x, y, r) => jig(mix(GOLD_HOT, GOLD_PALE, r() * 0.5), r, 6),
    len: (x, y) => 26 + Math.hypot(x - house.x, y - hc2) * 0.4, lw: 1.7, steps: 2, lenJ: 0.6,
  });
  // KLIMT GOLD — a rich gilded glory-halo of concentric gold rings + dots (Rev 21:23,
  // "the glory of God did lighten it"; the throne and the holy place of pure gold)
  E.klimtGold(out, counter, rng, house.x, hc2 + 2, 70, 162, { rings: 8, opacity: 0.7, squash: 0.82 });
  // LEGIBLE GOLD SPARKS raining off the house — it is God's house; it RADIATES
  E.goldSparks(out, counter, rng, house.x, hc2, 34, 168, 120, { squash: 0.86, big: 1.15, lightFn: gD });
  // walls of gold, a distinct terracotta roof
  out.push(`<path d="M${house.x - house.hw} ${R1(house.base)}L${house.x - house.hw} ${R1(house.top)}L${house.x + house.hw} ${R1(house.top)}L${house.x + house.hw} ${R1(house.base)}Z" fill="#f4dea2"/>`); counter.n++;
  out.push(`<path d="M${house.x - house.hw - 10} ${R1(house.top + 2)}L${house.x} ${R1(house.peak)}L${house.x + house.hw + 10} ${R1(house.top + 2)}Z" fill="#c87a44"/>`); counter.n++;
  // wall texture, warmed toward the door
  strokes(out, counter, {
    rng, n: 320,
    sample: rej(house.x - house.hw + 1, house.top + 2, house.x + house.hw - 1, house.base - 1, (x, y) => Math.abs(x - door.x) < door.w / 2 + 2 && y > door.y0),
    dir: () => 0,
    col: (x, y, r) => jig(mix(ramp([GOLD_HOT, GOLD_PALE, GOLD, '#e0c068'], fbm(x / 16, y / 16, 53) * 0.5 + 0.2), GOLD_HOT, gD(x, y) * 0.4), r, 7),
    len: 9, lw: 2.6, steps: 2, impasto: 0.4,
  });
  // roof strokes
  paintPath(out, counter, rng, [[house.x - house.hw - 10, house.top + 2], [house.x, house.peak], [house.x + house.hw + 10, house.top + 2]], (x, y, r) => jig(mix('#a85e30', '#d89456', r() * 0.5), r, 8), { lw: 2.2, len: 5, density: 0.6, jitter: 0.7 });
  // two white-hot windows flanking the door
  for (const wx of [house.x - 36, house.x + 28]) {
    out.push(`<rect x="${R1(wx)}" y="${R1(house.top + 16)}" width="12" height="15" rx="1.6" fill="#fffaf0"/>`); counter.n++;
    strokes(out, counter, { rng, n: 12, sample: rej(wx, house.top + 16, wx + 12, house.top + 31), dir: () => 0, col: (x, y, r) => jig(mix(GOLD_HOT, '#fffaf0', r()), r, 6), len: 5, lw: 1.5, steps: 1 });
  }

  /* ---------------- 5. THE DOOR — the one glowing way in, a world of colour beyond ---------------- */
  // door frame: dark posts + lintel so the gold has a shape to blaze in (chiaroscuro)
  const fl = door.w / 2 + 4;
  paintPath(out, counter, rng, [[door.x - fl, door.y1 + 1], [door.x - fl, door.y0 - 3]], (x, y, r) => jig('#3a2a22', r, 6), { lw: 4.4, len: 6, density: 0.9, jitter: 0.6 });
  paintPath(out, counter, rng, [[door.x + fl, door.y1 + 1], [door.x + fl, door.y0 - 3]], (x, y, r) => jig('#3a2a22', r, 6), { lw: 4.4, len: 6, density: 0.9, jitter: 0.6 });
  paintPath(out, counter, rng, [[door.x - fl - 3, door.y0 - 4], [door.x + fl + 3, door.y0 - 4]], (x, y, r) => jig('#3a2a22', r, 6), { lw: 4.8, len: 6, density: 0.9, jitter: 0.6 });
  // EASTER EGG — the GOSPEL on the door, in the ORIGINAL TONGUE: John 10:9 in Koine
  // GREEK numerals, Ιʹ·Θʹ (Ι=10, Θ=9), cut into the gold lintel above the way in.
  // "I am the door: by me if any man enter in, HE SHALL BE SAVED." The book shows you
  // carried home; this turns the door toward the reader. A dark incision on the gold.
  E.inscriptionText(out, E.greekRef(10, 9), { x: 401, y: 247, h: 15, body: '#241608', edge: '#fff0c4', op: 0.85, edgeOp: 0.6 });
  // THROUGH THE DOOR — a whole world of light and colour: a blaze at the centre
  // opening into a bright sky above and a lush colour path below. Home is not a
  // dark room; it is colour after the long dark.
  {
    const inH = door.y0 + (door.y1 - door.y0) * 0.46;
    strokes(out, counter, {
      rng, n: 360,
      sample: r => [door.x - door.w / 2 + 2 + r() * (door.w - 4), door.y0 + 2 + r() * (door.y1 - door.y0 - 4)],
      dir: () => Math.PI / 2,
      col: (x, y, r) => {
        if (Math.abs(x - door.x) < door.w * 0.20 && Math.abs(y - inH) < 17) return jig(GOLD_HOT, r, 4); // the blaze of the way in
        const c = (y < inH)
          ? ramp([GOLD_PALE, '#f6c06a', '#ec8f86', '#8ec6cc', '#86b6dc'], (inH - y) / (door.y1 - door.y0) * 1.7 + (r() - 0.5) * 0.24)
          : ramp([GOLD, '#c6d258', '#5aa86e', '#3f9a96', '#4a86c0'], (y - inH) / (door.y1 - door.y0) * 1.7 + (r() - 0.5) * 0.24);
        return jig(c, r, 8);
      },
      len: 11, lw: 2.6, steps: 2, lenJ: 0.5, impasto: 0.6,
    });
    // flowers of every colour in the world beyond
    strokes(out, counter, {
      rng, n: 96,
      sample: r => [door.x - door.w / 2 + 3 + r() * (door.w - 6), door.y0 + 3 + r() * (door.y1 - door.y0 - 6)],
      dir: () => Math.PI / 2,
      col: (x, y, r) => { const k = r(); return jig(k < 0.24 ? '#ec8f86' : k < 0.46 ? '#9a86d0' : k < 0.68 ? '#f0c860' : k < 0.86 ? '#5ec0a0' : '#e8a0c8', r, 12); },
      len: 5, lw: 1.8, steps: 2, impasto: 0.4,
    });
  }
  // light spilling out onto the threshold, lying flat on the path
  strokes(out, counter, {
    rng, n: 180,
    sample: r => { const a = Math.PI * (0.16 + r() * 0.68), d = Math.pow(r(), 1.2) * 52; return [door.x + Math.cos(a) * d * 1.5, door.y1 + 1 + Math.sin(a) * d * 0.42]; },
    dir: () => 0.05,
    col: (x, y, r) => jig(ramp([GOLD_HOT, GOLD, GOLD_DEEP, '#8a7038'], Math.hypot(x - door.x, (y - door.y1) * 2.1) / 84), r, 8),
    len: 8, lw: 2.2, steps: 2, lenJ: 0.5,
  });
  // egg: small height-notches up the right doorpost — children measured here,
  // year after year; this door has always been somebody's home
  for (const [ny2, nl2] of [[door.y1 - 16, 4], [door.y1 - 26, 4.5], [door.y1 - 38, 5]]) {
    paintPath(out, counter, rng, [[door.x + fl + 1, ny2], [door.x + fl + 1 + nl2, ny2 - 0.5]], (x, y, r) => jig('#8a5a1e', r, 8), { lw: 1.3, len: 2.5, density: 0.9, jitter: 0.3 });
  }

  /* ---------------- 6. CARRIED HOME — the radiant Father bears you on his shoulders ----------------
     the same gold Father who RAN (13); you (the dark-blue child of 13) ride high,
     arms up, rejoicing. "He layeth it on his shoulders, rejoicing." (Luke 15:5) */
  const _fgFig = out.length;   // [FG plane] the carried Father + child
  {
    const fp = roadP(0.46);
    const fx = fp[0] - 26, fy = fp[1] - 1;   // on the green just left of the path — gold reads on green
    const S = 2.1;                            // big enough to survive the live paint filter
    const lean = Math.atan2(far[1] - near[1], far[0] - near[0]);  // up the path, toward the door
    // FATHER — the Word made flesh (John 1:14): an ARTICULATED human, upright,
    // striding up the path, BOTH arms raised to hold the child on his shoulders.
    const fH = 110, fTopY = fy - 110;                    // head-top → feet
    const fShY = fTopY + fH * 0.25;                      // his shoulders (where the child sits)
    const fCaps = personCaps(fx, fTopY, fH, {
      headTilt: 2,
      leftHand: [fx - 11, fShY - 4],                     // left arm up, steadying the child on his shoulder
      rightHand: [fx + 11, fShY - 4],                    // right arm up
      leftFoot: [fx - 16, fy],                            // back leg striding
      rightFoot: [fx + 17, fy - 2],                       // front leg
    });
    // CHILD — YOU (red), small, riding HIGH on the Father's shoulders, arms up in joy.
    const cH = 38, cTopY = fShY - 40;                    // small; feet straddle the shoulders
    const cCaps = personCaps(fx, cTopY, cH, {
      leftHand: [fx - 13, cTopY + 6],                    // one arm up, rejoicing
      rightHand: [fx + 7, cTopY + 10],                   // other holding on near his head
      leftFoot: [fx - 9, fShY + 2],                       // legs straddling down his chest
      rightFoot: [fx + 9, fShY + 2],
    });
    // a pocket of DEEPER grass behind the carrier so the radiant gold reads
    // against it (chiaroscuro — bright only reads bright against dark)
    strokes(out, counter, {
      rng, n: 150,
      sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 0.7) * 52 * S; return [fx + Math.cos(a) * d * 0.82, fy - 2 + Math.sin(a) * d * 0.52]; },
      dir: (x, y) => { const [vx, vy] = curlV(x, y, 351, 80); return Math.atan2(vy * 0.6, Math.abs(vx) + 0.8); },
      col: (x, y, r) => jig(ramp(['#143a1d', '#214a26', '#2e5e30'], fbm(x / 40, y / 40, 71) * 0.7), r, 9),
      len: 15, lw: 3.4, steps: 2, impasto: 0.5,
    });
    // HALO — the Father gives off light (he is the Light), brightest in the field
    const hc = fy - 30 * S;
    strokes(out, counter, {
      rng, n: 120,
      sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 0.95) * 36 * S; return [fx + Math.cos(a) * d, hc + Math.sin(a) * d * 0.92]; },
      dir: () => lean,
      col: (x, y, r) => jig(ramp([GOLD_PALE, GOLD, GOLD_DEEP, '#9a6e34'], Math.hypot(x - fx, (y - hc) / 0.92) / (36 * S)), r, 9),
      len: 8, lw: 2.4, steps: 2, impasto: 0.4,
    });
    // a tight white-hot inner halo so the Father separates from the gold ground
    strokes(out, counter, {
      rng, n: 90,
      sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 1.1) * 30 * S; return [fx + Math.cos(a) * d, (fy - 24 * S) + Math.sin(a) * d * 1.05]; },
      dir: () => lean,
      col: (x, y, r) => jig(mix('#fffaf0', GOLD_HOT, Math.hypot(x - fx, (y - (fy - 24 * S)) / 1.05) / (30 * S)), r, 6),
      len: 6, lw: 2, steps: 2, impasto: 0.4,
    });
    // the Father — a solid radiant GOLD body (brightest in the field, but a real
    // figure, not a pale column); the white-hot halo above sets him off the ground
    // THE WORD MADE FLESH (John 1:14) — the Father in the child's human form,
    // RADIANT: brilliant white woven with yellow, glowing. ONE consistent Light.
    castShadow(out, counter, fCaps, { dir: 0.5 });
    paintLight(out, counter, rng, fCaps);
    // robe flying behind (down-path, away from the door)
    strokes(out, counter, {
      rng, n: 56,
      sample: r => [fx - 6 - r() * 26 * S, fy - 22 * S + (r() - 0.3) * 22 * S],
      dir: (x, y) => lean + Math.PI + (fbm(x / 20, y / 20, 65) - 0.5) * 0.9,
      col: (x, y, r) => jig(ramp(['#8a4e1c', '#6b3a14', '#4a2810'], (fx - x) / (40 * S)), r, 11),
      len: 12, lw: 2.6, steps: 2, lenJ: 0.5,
    });
    // YOU — the main-character child carried up into the Light: consistent
    // deep-red clothes + dark outline so the reader can follow the same child
    // across the whole book (was a dark-blue form here).
    paintChild(out, counter, rng, cCaps);
    // the Light catching the child's near side — held in the radiance
    strokes(out, counter, {
      rng, n: 16,
      sample: rej(fx - 16, cTopY - 4, fx + 16, fShY + 6, (x, y) => cCaps.some(c => inCap(x, y, c))),
      dir: () => -0.5,
      col: (x, y, r) => jig(mix(GOLD_DEEP, '#b88a3a', r() * 0.5), r, 10),
      len: 4.5, lw: 1.4, steps: 2,
    });
  }
  fgRanges.push([_fgFig, out.length]);   // ← carried Father + child are foreground

  /* ---------------- 7. BACKGROUND LIFE (Luke 15; Matt 6:26; Isa 55:12) ----------------
     dark forms in the bright day: birds, cypress, and SHEEP — the flock the
     shepherd left to carry the one home. Birds + cypress + the horizon fringe
     sit at the horizon → the FAR plane. */
  const _far = out.length;
  // DISTANT HILLS — a rolling-land silhouette whose undulating skyline becomes the
  // sky↔meadow boundary (never a ruled line) and slides against the sky as you pan.
  // skip the centre column (x≈325..477) so the distant hills don't bury the
  // Father's house — the home (the destination) must read clearly.
  E.distantHills(out, counter, rng, { topFn: E.ridge(horizon - 6, { amp: 30, freq: 210, bumps: 0.5, seed: 233 }), horizonFn: () => horizon, cols: ['#7ba88e', '#8fb98a', '#aac884'], depth: 70, lightFn: gD, seed: 233, x0: -14, x1: 325 });
  E.distantHills(out, counter, rng, { topFn: E.ridge(horizon - 6, { amp: 30, freq: 210, bumps: 0.5, seed: 233 }), horizonFn: () => horizon, cols: ['#7ba88e', '#8fb98a', '#aac884'], depth: 70, lightFn: gD, seed: 233, x0: 477, x1: 814 });
  for (const [bx, by, s] of [[180, 58, 1], [216, 72, 0.85], [252, 54, 0.9], [560, 78, 0.85], [598, 64, 0.74], [120, 86, 0.8], [700, 70, 0.62]]) {
    paintPath(out, counter, rng, [[bx - 6 * s, by + 2.6 * s], [bx, by - 1.8 * s], [bx + 6 * s, by + 2.6 * s]], (x, y, r) => jig('#36405a', r, 6), { lw: 1.5 * s, len: 3.4, density: 0.9, jitter: 0.5 });
  }
  const cyp = (cx, cby, ch, w) => strokes(out, counter, { rng, n: Math.round(w * ch / 12), sample: r => { const v = Math.pow(r(), 0.85); const wr = w * Math.sin(Math.PI * Math.min(1, v * 1.15)) + 0.7; return [cx + (r() + r() - 1) * wr, cby - v * ch]; }, dir: (x, y) => -Math.PI / 2 + (fbm(x / 8, y / 8, 247) - 0.5) * 0.6, col: (x, y, r) => jig(ramp(['#26283a', '#34364e', '#42445e'], fbm(x / 10, y / 10, 251) + r() * 0.3), r, 7), len: 9, lw: 2.2, steps: 3, follow: 0.95, lenJ: 0.5 });
  cyp(96, 246, 44, 6); cyp(726, 250, 46, 7);
  // the HORIZON FRINGE — ragged meadow grass off the soil line, breaking the seam
  E.horizonFringe(out, counter, rng, { horizonFn: () => horizon, x0: -10, x1: 325, cols: ['#3a7a38', '#5e9a40', '#88b84a', '#bcc850'], hMax: 20, lightFn: gD, seed: 231 });
  E.horizonFringe(out, counter, rng, { horizonFn: () => horizon, x0: 477, x1: 810, cols: ['#3a7a38', '#5e9a40', '#88b84a', '#bcc850'], hMax: 20, lightFn: gD, seed: 619 });
  farRanges.push([_far, out.length]);   // ← birds, cypress, fringe (FAR plane)
  // white sheep in green pastures (Ps 23; Luke 15) — woolly, pale, dark face + legs
  const shp = (sx, sy, s) => { strokes(out, counter, { rng, n: Math.round(22 * s), sample: r => { const a = r() * Math.PI * 2, dd = Math.pow(r(), 0.7); return [sx + Math.cos(a) * 9 * s * dd, sy + Math.sin(a) * 5 * s * dd]; }, dir: () => 0, col: (x, y, r) => jig(mix('#e6dcc4', '#f6f0de', r() * 0.6), r, 7), len: 3 * s, lw: 2 * s, steps: 2 }); paintPath(out, counter, rng, [[sx - 8 * s, sy - 1 * s], [sx - 11 * s, sy + 1.5 * s]], (x, y, r) => jig('#3a322a', r, 4), { lw: 2 * s, len: 2, density: 1 }); for (const lx of [-5, 0, 5]) paintPath(out, counter, rng, [[sx + lx * s, sy + 3 * s], [sx + lx * s, sy + 6 * s]], (x, y, r) => jig('#3a322a', r, 4), { lw: 1.1 * s, len: 2, density: 0.9 }); };
  shp(636, 300, 0.9); shp(690, 340, 0.78); shp(584, 332, 0.74); shp(742, 318, 0.7);
  // bushes
  const bush = (bx, by, w, h) => strokes(out, counter, { rng, n: Math.round(w * 1.5), sample: r => { const a = r() * Math.PI * 2, dd = Math.pow(r(), 0.7); return [bx + Math.cos(a) * w * dd, by - Math.abs(Math.sin(a)) * h * dd]; }, dir: () => -Math.PI / 2, col: (x, y, r) => jig(ramp(['#2a5230', '#3a6c3c', '#4e8446'], fbm(x / 12, y / 12, 261) + r() * 0.25), r, 8), len: 6, lw: 2, steps: 2, lenJ: 0.5 });
  bush(150, 470, 16, 11); bush(512, 392, 13, 9);
  // FLOURISHING wildflowers across the meadow (Isa 35:1)
  strokes(out, counter, {
    rng, n: 360,
    sample: rej(-6, horizon + 8, 812, 508, (x, y) => !onRoad(x, y)),
    dir: () => -Math.PI / 2,
    col: (x, y, r) => { const k = r(); return jig(k < 0.22 ? '#ee5c84' : k < 0.44 ? '#a47ce0' : k < 0.64 ? '#f6c63e' : k < 0.82 ? '#fafafa' : '#f29ad0', r, 13); },
    len: (x, y) => 3 + (y - horizon) / (510 - horizon) * 4, lw: (x, y) => 2.2 + (y - horizon) / (510 - horizon) * 1.6, steps: 1, lenJ: 0.5, impasto: 0.3,
  });

  // egg: the tiny church spire from plate 02, far off on the left horizon
  {
    const spx = 60, spy = horizon - 2;
    paintPath(out, counter, rng, [[spx - 3, spy - 9], [spx, spy - 28], [spx + 3, spy - 9]], (x, y, r) => jig('#33405e', r, 6), { lw: 1.6, len: 3, density: 0.8, jitter: 0.5 });
  }

  // ARRIVAL = the most lush page in the book: this IS the destination, the
  // Father's house, paradise restored. Big fruit-trees in crazy free colour
  // crowd the meadow, heavy with glowing fruit, framing the home (Isa 35:1).  [FG plane]
  // fruit-trees PLANTED in the meadow — each rooted in the MID field, so its base
  // stays with the ground as the view turns (planted, not floating).
  E.fruitTree(out, counter, rng, 80, 478, 94, 44, E.LEAF_PALETTES[2], gD);   // teal, far-left, big
  E.fruitTree(out, counter, rng, 158, 430, 54, 26, E.LEAF_PALETTES[1], gD);  // pink, mid-left
  E.fruitTree(out, counter, rng, 766, 490, 98, 46, E.LEAF_PALETTES[0], gD);  // violet, far-right, big
  E.fruitTree(out, counter, rng, 700, 432, 58, 27, E.LEAF_PALETTES[4], gD);  // green, mid-right

  /* ---------------- 8. LIFE — the homecoming CELEBRATION (Luke 15:24) ----------------
     "this my son was dead, and is alive again" — the whole house rejoices.
     SWALLOWS wheel around the blazing home (celebrating, never ON the house or
     the lintel), and climbing ROSES garland the gold walls' edges and the
     doorpost feet — a welcome in bloom (SoS 2:12 "the flowers appear on the
     earth; the time of the singing of birds is come"). Mid band, with the house. */
  {
    // SWALLOWS — four dark wheeling forms in the bright glow: curved back-swept
    // wings (Munch: living = curved), deep forked tail, one white throat-fleck.
    const swCol = (x, y, r) => jig(mix('#222c46', '#38425e', r() * 0.5), r, 6);
    const swallow = (bx, by, s, tilt) => {
      const ca = Math.cos(tilt), sa = Math.sin(tilt);
      const P = (px, py) => [bx + (px * ca - py * sa) * s, by + (px * sa + py * ca) * s];
      paintPath(out, counter, rng, [P(-11, -1.5), P(-7, -5.5), P(-2.5, -1.5), P(0, 0.5)], swCol, { lw: 1.9 * s, len: 3, density: 0.95, jitter: 0.35 });
      paintPath(out, counter, rng, [P(0, 0.5), P(2.5, -1.5), P(7, -5.5), P(11, -1.5)], swCol, { lw: 1.9 * s, len: 3, density: 0.95, jitter: 0.35 });
      paintPath(out, counter, rng, [P(-2, 0.5), P(2.5, 1.6)], swCol, { lw: 2.4 * s, len: 2.5, density: 1, jitter: 0.25 });    // body
      paintPath(out, counter, rng, [P(2.5, 1.6), P(7.5, 4.4)], swCol, { lw: 1.1 * s, len: 2.2, density: 0.9, jitter: 0.3 }); // forked tail
      paintPath(out, counter, rng, [P(2.5, 1.6), P(8, 0.8)], swCol, { lw: 1.1 * s, len: 2.2, density: 0.9, jitter: 0.3 });
      paintPath(out, counter, rng, [P(-1.6, 1.4), P(0.6, 1.7)], (x, y, r) => jig('#f6ede0', r, 5), { lw: 1.2 * s, len: 1.6, density: 1, jitter: 0.2 }); // throat
    };
    swallow(330, 198, 1.05, -0.38);   // banking up the left of the roof
    swallow(488, 213, 0.9, 0.42);     // sweeping down the right
    swallow(366, 156, 0.95, 0.12);    // crossing high above the peak, left
    swallow(452, 170, 0.8, -0.2);     // trailing above, right

    // CLIMBING ROSES — warm reds/pinks, dark-on-gold; garlands up the two wall
    // edges + posies at the doorpost feet. Clear of the door opening, both
    // white-hot windows, the 10:9 lintel egg and the height-notch egg (y<306 kept free).
    const leafC = (x, y, r) => jig(mix('#2e6a34', '#4e8a40', r() * 0.6), r, 8);
    const roseC = (x, y, r) => { const k = r(); return jig(k < 0.4 ? '#d0384e' : k < 0.75 ? '#ee7896' : '#f6aac2', r, 9); };
    const bloom = (bx, by, s) => strokes(out, counter, {
      rng, n: 5,
      sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 0.6) * 2.6 * s; return [bx + Math.cos(a) * d, by + Math.sin(a) * d]; },
      dir: (x, y) => Math.atan2(y - by, x - bx) + Math.PI / 2,   // petals curl round the heart
      col: roseC, len: 2.6 * s, lw: 1.7 * s, steps: 2, lenJ: 0.4,
    });
    const garland = (gx, yTop, yBot, sway) => {
      const px = t => gx + Math.sin(t * 5.2 + gx) * sway;
      const pts = []; for (let t = 0; t <= 1.001; t += 0.1) pts.push([px(t), yBot + (yTop - yBot) * t]);
      paintPath(out, counter, rng, pts, leafC, { lw: 1.4, len: 3, density: 0.85, jitter: 0.45 });
      for (let t = 0.08; t < 1; t += 0.16) {
        const y = yBot + (yTop - yBot) * t;
        paintPath(out, counter, rng, [[px(t), y + 3], [px(t) + (rng() < 0.5 ? -4 : 4), y + 5.5]], leafC, { lw: 1.2, len: 2.2, density: 0.9, jitter: 0.4 });
        bloom(px(t) + (rng() - 0.5) * 3, y, 0.85 + rng() * 0.4);
      }
    };
    garland(house.x - house.hw, house.top + 10, house.base - 2, 4);   // left wall edge
    garland(house.x + house.hw, house.top + 10, house.base - 2, 4);   // right wall edge
    for (const px2 of [door.x - fl - 2, door.x + fl + 2]) {           // posies at the doorpost feet
      const o = px2 < door.x ? -1 : 1;
      paintPath(out, counter, rng, [[px2, door.y1 + 1], [px2 + o * 2, door.y1 - 9]], leafC, { lw: 1.4, len: 2.5, density: 0.9, jitter: 0.4 });
      bloom(px2 + o * 1.5, door.y1 - 9, 1.0);
      bloom(px2 + o * 3.5, door.y1 - 3, 0.85);
    }
  }

  // MULTIPLANE: assemble the requested depth plane. Each is its own cel —
  // transparent where it has no content — so they stack and parallax apart like
  // the painted-background-plus-acetate-cels of hand-drawn animation.
  const ALT = 'The full bright new world: a swirling dawn sky over a flourishing green meadow loud with wildflowers, fruit trees and sheep. Dead centre stands the Father\'s house ablaze with light — gold walls, a terracotta roof, white-hot windows and one glowing door opening on a whole world of colour beyond. Up a curving path the radiant golden Father carries a small dark child high on his shoulders, the child\'s arms flung up in joy, bearing you home through the door. He layeth it on his shoulders, rejoicing.';
  const RAW = { undercoat: 0, weave: 0, varnish: 0, oil: 0 };   // no baked surface — the live filter unifies the planes
  const setOf = ranges => { const s = new Set(); for (const [a, b] of ranges) for (let i = a; i < b; i++) s.add(i); return s; };
  const pick = ranges => ranges.map(([a, b]) => out.slice(a, b).join('\n')).join('\n');
  const farSet = setOf(farRanges), fgSet = setOf(fgRanges);
  if (LAYER === 'sky') return svgWrap(ALT, out.slice(0, skyEnd).join('\n'), RAW);   // smooth sky ground (opaque backmost)
  const sm = LAYER.match(/^sky(\d+)$/);
  if (sm) return svgWrap(ALT, '<g>' + skySheets[+sm[1] - 1] + '</g>', RAW);         // one sky-swirl sheet
  if (LAYER === 'far') return svgWrap(ALT, pick(farRanges), RAW);                   // distant hills, birds, cypress
  if (LAYER === 'fg') return svgWrap(ALT, pick(fgRanges), RAW);                     // the carried Father + child
  if (LAYER === 'mid') {                                                            // meadow, path, house, door, sheep, planted trees
    const body = out.filter((_, i) => i >= skyEnd && !farSet.has(i) && !fgSet.has(i)).join('\n');
    return svgWrap(ALT, body, RAW);
  }
  // full painting (desktop): sky ground, the stacked sky-sheets, then everything else
  return svgWrap(ALT, out.slice(0, skyEnd).concat(skySheets, out.slice(skyEnd)).join('\n'));
}
