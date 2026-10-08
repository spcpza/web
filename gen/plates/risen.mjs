// gen/plates/risen.mjs — "He is risen" (the empty tomb)
//
//   "And that he rose again the third day according to the scriptures."
//                                                      — 1 Corinthians 15:4
//   "He is not here: for he is risen."                  — Matthew 28:6
//
// ⚠ THE SAME PLACE. Fred: "work on risen then. you can use this layout and change the sky."
// That is the best gift this page could have been given, and it is worth saying why: the
// reader turns from `grave` and RECOGNISES the hill. Same brow, same broken mouth, same
// rib of rock beside it, same track through the sand. Nothing about the place has changed;
// everything about what it MEANS has. A new landscape would have made the resurrection a
// change of scene. The same landscape makes it a change of state, which is what it is.
//
// So the geometry is `grave`'s, deliberately — cliffTop, GY, the mouth outline, the rib, the
// path — and four things are different:
//
//   1. THE SKY IS DAWN. The moon set; the sun comes up over the same valley, and the night's
//      deep teal/ink/aubergine becomes rose, peach, gold and a high clean blue. Same flow
//      field, same swirls: this is one weather system, three days later.
//   2. THE STONE IS ROLLED CLEAR (John 20:1) — off to the right, standing on the sand at the
//      end of the track it rolled along. The track is the same track; you can read what
//      happened from the ground.
//   3. THE MOUTH BLAZES. On `grave` the hole was the one true black and a thread of held
//      light escaped its seam. Here the whole hole is that light, let out — pouring across
//      the sill, down the track, over the sand.
//   4. THE VALUE FLIPS, which is the book's own law at this page: dark ground and light
//      objects becomes LIGHT ground and dark objects. Before this page the light shines IN
//      the darkness; after it, you stand in the light. The land wakes with it — green
//      pushing up through the sand, wildflowers where there was scrub (Isa 35:1).
//
// No black anywhere. The deepest note left in the picture is the cool violet under the
// foreground rocks, and even that is warm at its edges.
export const name = 'risen';
export const title = 'He is risen';
export const caption = 'The grave could not hold the Light.';
export const seed = 20263004;
export const focal = { x: 400, y: 300 };
export const layers = [
  { name: 'bg', opaque: true },   // the dawn, the sun, the waking valley and its city
  { name: 'cliff' },              // the same hill, in the morning
  { name: 'blaze' },              // the light out of the mouth — this plane BREATHES
  { name: 'stone' },              // the great stone, rolled clear
  { name: 'near' },               // the sand, the track, the new green, the flowers
];

export function paint(E, opts = {}) {
  const {
    mulberry32, fbm, curlV, swirlV, mix, ramp, jig, strokes, rej,
    lightRadial, inscriptionText, greekRef, paintPath,
    svgWrap, R1, W, H, GOLD, GOLD_PALE, GOLD_HOT,
  } = E;

  const rng = mulberry32(seed);
  const out = [];
  const counter = { n: 0 };
  const LAYER = opts.layer || 'full';
  const cliffR = [], blazeR = [], stoneR = [], nearR = [];
  // ⭐ DETAIL PASS (Sep 8) — the same LIGHT pass as `grave`, its twin: every relief stays 0
  // (the flagstone lesson), only the mark SIZES change — every stroke its own width and
  // length (Fred: "use no rules, a paint stroke just exist because it exist"), beds without
  // giants, a few more marks where there were slabs.
  const free = (x, y, salt) => { const n = Math.sin(x * 12.9898 + y * 78.233 + salt) * 43758.5453; return n - Math.floor(n); };
  const widthOf  = (x, y, salt) => 0.40 + 3.2 * Math.pow(free(x, y, salt), 2.6);
  const lengthOf = (x, y, salt) => 0.40 + 1.5 * Math.pow(free(x, y, salt + 17), 1.5);

  out.push(`<rect width="${W}" height="${H}" fill="#6b4d78"/>`);   // a MORNING bed — mid and warm, so gaps read as air, not milk

  /* ---------------- the colour of the morning ---------------- */
  // the same drifting-hue rig `grave` uses, turned to the warm end of the wheel: the night's
  // teal/ink/aubergine becomes rose, peach, apricot, cornflower and a young green. Hue moves,
  // value stays — so the morning is BRIGHT and still full of colour rather than washed pale.
  const HEXN = c => { const n = parseInt(c.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
  const HEXS = (r, g, b) => '#' + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
  const toHSL = (r, g, b) => {
    r /= 255; g /= 255; b /= 255;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2;
    if (mx === mn) return [0, 0, l];
    const d = mx - mn, sa = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
    let h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
    return [h / 6, sa, l];
  };
  const toRGB = (h, sa, l) => {
    if (sa === 0) return [l * 255, l * 255, l * 255];
    const q = l < 0.5 ? l * (1 + sa) : l + sa - l * sa, pp = 2 * l - q;
    const f = t => { t = ((t % 1) + 1) % 1;
      if (t < 1 / 6) return pp + (q - pp) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return pp + (q - pp) * (2 / 3 - t) * 6;
      return pp; };
    return [f(h + 1 / 3) * 255, f(h) * 255, f(h - 1 / 3) * 255];
  };
  //        rose  peach apricot corn  rose  young-green  gold  lilac  corn
  const HUES = [0.96, 0.06, 0.09, 0.60, 0.96, 0.28, 0.13, 0.76, 0.60];
  const chroma = (c, x, y, k, sd = 211) => {
    const f = fbm(x / 155, y / 135, sd);
    const H = HUES[Math.min(HUES.length - 1, Math.floor(f * HUES.length * 1.25))];
    const rgb = HEXN(c);
    let [h, sa, l] = toHSL(rgb[0], rgb[1], rgb[2]);
    let d = H - h; if (d > 0.5) d -= 1; if (d < -0.5) d += 1;
    const kk = k * (0.6 + fbm(x / 62, y / 58, sd + 3) * 0.75);
    h = (h + d * kk + 1) % 1;
    // ⚠ THE MIRROR OF THE NIGHT'S RULE. On `grave` the DARK carried the colour, because a
    // highlight cannot. Here the picture is light, so saturation rides the mid-tones and
    // eases off at both ends — else the sky goes chalky and the blaze goes orange.
    sa = Math.min(0.62, sa + kk * 0.5 * (1 - Math.abs(l - 0.55) * 1.5));
    const o = toRGB(h, sa, l);
    return HEXS(o[0], o[1], o[2]);
  };

  /* ---------------- the bones — `grave`'s, unchanged ---------------- */
  const SUN = [128, 300];                                   // risen over the same valley
  const sun = lightRadial(SUN[0], SUN[1], 620);
  const HZ = 372;
  const rise = x => 1 / (1 + Math.exp(-(x - 208) / 24));
  // ⚠ THE SAME ROCK, POINT FOR POINT. `grave` stopped being a smooth hump and became a drawn
  // escarpment — steps, an escarpment over the tomb, a stepped fall past a buttress — and if
  // this page kept the old dune the reader would not recognise the place, which is the whole
  // point of the pair. Same profile, same wall, same ledges. Only the hour has changed.
  const PROF = [[-24, 386], [34, 372], [88, 358], [132, 350], [172, 330], [198, 306],
                [216, 268], [238, 256], [268, 250], [286, 214], [330, 208], [372, 200],
                [430, 198], [470, 204], [498, 190], [524, 198], [546, 238], [576, 232],
                [610, 248], [652, 242], [696, 264], [748, 278], [824, 296]];
  const cliffTop = x => {
    let i = 0; while (i < PROF.length - 2 && PROF[i + 1][0] < x) i++;
    const a = PROF[i], b = PROF[i + 1];
    const tt = Math.max(0, Math.min(1, (x - a[0]) / (b[0] - a[0])));
    return a[1] + (b[1] - a[1]) * tt + Math.sin(x / 16.5) * 2.4 + (fbm(x / 24, 3.3, 311) - 0.5) * 8;
  };
  const WX0 = 292, WX1 = 536;                               // the same sheer face
  const GY = x => HZ + 12 * rise(x) + 7 * Math.sin(x / 83 + 1.1) + 4 * Math.sin(x / 31);
  const FLOOR = 382;
  const DL = 344, DR = 440, DTOP = 268, DBOT = FLOOR + 2;    // the same broken mouth
  const PL = 440, PR = 456;
  const SX = 596, SY = 326, SW = 67, SH = 76;                // the same stone — ROLLED CLEAR
  const TX = (DL + DR) / 2, TY = DTOP + 58;                  // the light, standing in the tomb
  const glory = lightRadial(TX, TY, 190);
  const lit = (x, y) => Math.min(1, sun(x, y) * 0.5 + glory(x, y) * 1.15);

  // three turning centres, as on the night — the same weather, three days on
  const VORT = [[SUN[0], SUN[1] - 120, 2.0, 210, 38], [452, 110, -1.4, 210, 46], [672, 60, 0.9, 180, 34]];
  const flow = (x, y) => {
    let ax = 0.4, ay = -0.06, ph = 0;
    for (let i = 0; i < VORT.length; i++) {
      const cx = VORT[i][0], cy = VORT[i][1], st = VORT[i][2], fo = VORT[i][3], lam = VORT[i][4];
      const v = swirlV(x, y, cx, cy, st, fo);
      ax += v[0]; ay += v[1];
      const d = Math.hypot(x - cx, y - cy);
      ph += Math.sin(d / lam + (fbm(x / 90, y / 82, 181 + i * 7) - 0.5) * 5.5) * (fo / (fo + d)) * (st > 0 ? 1 : -1);
    }
    return [Math.atan2(ay, ax), 0.5 + 0.5 * Math.sin(ph * 2.3)];
  };

  /* 1. THE DAWN ---------------------------------------------------------------------- */
  strokes(out, counter, {                                    // the bed of the morning
    rng, n: 900,
    sample: rej(-14, -14, 814, HZ + 8, (x, y) => y < cliffTop(x) + 4),
    dir: (x, y) => flow(x, y)[0],
    col: (x, y, r) => {
      const band = flow(x, y)[1];
      const t = Math.min(1, y / HZ * 0.95);
      let c = ramp(['#3f5fbe', '#5f78ca', '#9182cc', '#d093b4', '#ffb98d'], t);   // blue up top, rose at the land
      c = mix(c, band > 0.5 ? '#ffdfab' : '#6b5ba6', Math.abs(band - 0.5) * 0.62);
      return jig(chroma(c, x, y, 0.36, 211), r, 6);
    },
    len: (x, y) => 40 * lengthOf(x, y, 11), lw: (x, y) => 5 + 6 * free(x, y, 13), steps: 3, follow: 0.9, lenJ: 0.3, wJ: 0.3, impasto: 0.9, relief: 0, op: 0.9,   // a bed: its own width each, no giants
  });
  strokes(out, counter, {                                    // and the churn that turns in it
    rng, n: 5200,
    sample: rej(-14, -14, 814, HZ + 6, (x, y) => y < cliffTop(x) + 2),
    dir: (x, y) => {
      const [a, b] = curlV(x, y, 36, 150);
      return flow(x, y)[0] + (a - 0.5) * 0.25 + (b - 0.5) * 0.25;
    },
    col: (x, y, r) => {
      const band = flow(x, y)[1];
      const t = Math.min(1, y / HZ * 0.9 + fbm(x / 120, y / 110, 61) * 0.2);
      let c = ramp(['#4a6bcb', '#6b83d4', '#a58fd0', '#e39fb4', '#ffc396'], t);
      c = mix(c, band > 0.5 ? '#fff0cb' : '#6558a6', Math.abs(band - 0.5) * 0.66);
      c = chroma(c, x, y, 0.34, 211);
      return jig(mix(c, '#fff3d8', lit(x, y) * 0.45), r, 5);
    },
    len: (x, y) => 38 * lengthOf(x, y, 21), lw: (x, y) => 3.4 * widthOf(x, y, 23), steps: 5, follow: 0.96, wild: 0.04, lenJ: 0.3, wJ: 0.3, aJ: 0.18, impasto: 0.9, relief: 0,
  });
  // THE SUN, up over the valley — small, as the sun is, and lighting the whole earth
  strokes(out, counter, {
    rng, n: 520,
    sample: r => { const a = r() * Math.PI * 2, d = 13 + Math.pow(r(), 1.6) * 62; return [SUN[0] + Math.cos(a) * d, SUN[1] + Math.sin(a) * d * 0.8]; },
    dir: (x, y) => Math.atan2(y - SUN[1], x - SUN[0]) + Math.PI / 2,
    col: (x, y, r) => mix('#fff6d8', '#f0b487', Math.min(1, Math.hypot(x - SUN[0], (y - SUN[1]) / 0.8) / 68)),
    len: 7, lw: 2.2, steps: 2, lenJ: 0.7, relief: 0, op: 0.45,
  });
  out.push(`<circle cx="${R1(SUN[0])}" cy="${R1(SUN[1])}" r="13" fill="#fffbe8"/>`); counter.n++;
  for (let c = 0; c < 4; c++) {                              // morning cloud, gold on its underside
    const cx = [242, 388, 596, 730][c], cy = [128, 74, 104, 152][c];
    const cw = [150, 118, 174, 138][c], chh = [16, 12, 20, 15][c];
    strokes(out, counter, {
      rng, n: 360,
      sample: r => { const t = r(); const x = cx - cw / 2 + t * cw;
                     const lift = Math.sin(t * Math.PI) * chh;
                     return [x, cy - lift + Math.pow(r(), 0.6) * (lift * 1.7 + 7)]; },
      dir: (x) => 0.05 + Math.sin((x - cx) / 40) * 0.25,
      col: (x, y, r) => {
        const t = (x - (cx - cw / 2)) / cw;
        const top = Math.max(0, 1 - (y - (cy - Math.sin(t * Math.PI) * chh)) / 13);
        return jig(chroma(mix('#b79ac6', mix('#ffe6c4', '#fffaf0', lit(x, y)), Math.min(1, top * 0.8 + r() * 0.2)), x, y, 0.34, 263), r, 5);
      },
      len: (x, y) => 20 * lengthOf(x, y, 31), lw: (x, y) => 3.6 * widthOf(x, y, 33), steps: 3, follow: 0.96, lenJ: 0.3, wJ: 0.3, impasto: 0.9, relief: 0, op: 0.7,
    });
  }
  // the valley, and the far hills waking
  for (let g = 0; g < 3; g++) {
    const t = g / 2;
    const hy = x => HZ - 46 + g * 15 - (24 - g * 7) * Math.sin(x / (150 + g * 60) + g * 2.1)
                                     - (10 - g * 3) * Math.sin(x / (52 + g * 26) + g);
    strokes(out, counter, {
      rng, n: 260 - g * 60,
      sample: r => { const x = -14 + r() * 828; const y = hy(x) + Math.pow(r(), 0.7) * (52 - g * 12); return (y < cliffTop(x) - 2 && y < HZ + 4) ? [x, y] : null; },
      dir: x => 0.03 + Math.sin(x / 120) * 0.1,
      col: (x, y, r) => jig(chroma(mix(ramp(['#8f86c4', '#a291c6', '#b49dc4'], t), '#ffdcb4', lit(x, y) * 0.55 * (1 - t)), x, y, 0.32, 269), r, 4),
      len: (x, y) => (40 - g * 8) * lengthOf(x, y, 41 + g), lw: (x, y) => (4.5 - g) * widthOf(x, y, 45 + g), steps: 3, follow: 0.99, lenJ: 0.3, wJ: 0.3, impasto: 0.9, relief: 0, op: 0.9 - t * 0.3,
    });
  }
  {   // THE CITY — still asleep, but the morning is on its walls now
    const cxs = 118, base = HZ - 16;
    const wall = [];
    for (let i = 0; i <= 26; i++) {
      const x = cxs - 68 + i * 5.4, t = i / 26;
      let top = base - 9 - Math.sin(t * 3.1) * 3;
      if (i === 5 || i === 6) top = base - 20;
      if (i === 14) top = base - 17;
      if (i === 21 || i === 22) top = base - 23;
      wall.push([x, top]);
    }
    out.push(`<path d="M${wall.map(q => R1(q[0]) + ' ' + R1(q[1])).join('L')}L${R1(cxs + 72)} ${R1(base + 5)}L${R1(cxs - 68)} ${R1(base + 5)}Z" fill="#8d7fb4"/>`);
    counter.n++;
    strokes(out, counter, {
      rng, n: 260,
      sample: r => { const i = (r() * (wall.length - 1)) | 0;
                     return [wall[i][0] + (r() - 0.5) * 6, wall[i][1] + r() * (base + 4 - wall[i][1])]; },
      dir: () => Math.PI / 2,
      col: (x, y, r) => jig(chroma(ramp(['#7b6ea6', '#9184b8', '#ab9cc4', '#c9b6c8'], r() * 0.8 + lit(x, y) * 0.5), x, y, 0.3, 271), r, 5),
      len: 7, lw: 2.4, steps: 2, lenJ: 0.6, relief: 0, op: 0.9,
    });
    paintPath(out, counter, rng, wall.filter((_, i) => i % 2 === 0),
      (x, y, r) => jig(mix('#a294c2', '#ffe2bc', lit(x, y) * 0.9 + r() * 0.2), r, 6), { lw: 1.2, len: 4, density: 0.55, jitter: 0.6 });
  }
  strokes(out, counter, {                                    // the plain between the hills and us
    rng, n: 200,
    sample: r => { const x = -14 + r() * 828; const y = HZ - 12 + r() * 26; return y < cliffTop(x) - 1 ? [x, y] : null; },
    dir: () => 0.02,
    col: (x, y, r) => jig(chroma(mix('#9d94c2', '#e6cfae', lit(x, y) * 0.8 + r() * 0.15), x, y, 0.3, 251), r, 4),
    len: 54, lw: 8, steps: 3, follow: 0.995, relief: 0, op: 0.8,
  });

  /* 2. THE SAME HILL, IN THE MORNING -------------------------------------------------- */
  const _cliff = out.length;
  {
    const pts = [];
    for (let x = -14; x <= 814; x += 8) pts.push(`${R1(x)} ${R1(cliffTop(x))}`);
    out.push(`<path d="M${pts.join('L')}L814 520L-14 520Z" fill="#3c2a49"/>`); counter.n++;
  }
  const ROCK = ['#33223f', '#432c4b', '#573a55', '#6f4c5c', '#8f6a66', '#b8917c'];
  const faceVal = (x, y) => {
    const brow = Math.max(0, 1 - (y - cliffTop(x)) / 44);
    const facet = Math.max(0, 1 - Math.abs(x - 252) / 230) * 0.34;
    return Math.min(1, lit(x, y) * 0.44 + brow * 0.52 + facet * lit(x, y) + fbm(x / 130, y / 70, 73) * 0.26 - 0.14);
  };
  strokes(out, counter, {                                    // the face
    rng, n: 4200,
    sample: rej(140, 170, 814, 400, (x, y) => y > cliffTop(x) && y < GY(x) + 6),
    dir: (x, y) => Math.PI / 2 - 0.5 + (fbm(x / 90, y / 60, 71) - 0.5) * 1.1,
    col: (x, y, r) => jig(chroma(ramp(ROCK, faceVal(x, y)), x, y, 0.34, 223), r, 5),
    len: (x, y) => 26 * lengthOf(x, y, 51), lw: (x, y) => 3.8 * widthOf(x, y, 53), steps: 4, follow: 0.92, lenJ: 0.3, wJ: 0.3, aJ: 0.4, impasto: 0.9, relief: 0,
  });
  strokes(out, counter, {                                    // THE SHEER FACE the tomb is cut into
    rng, n: 1500,
    sample: rej(WX0 - 6, 190, WX1 + 6, 402, (x, y) => y > cliffTop(x) + 6 && y < GY(x) + 2),
    dir: () => Math.PI / 2 + 0.03,
    col: (x, y, r) => {
      const edge = Math.min(1, Math.min(x - WX0, WX1 - x) / 34);
      const drop = Math.min(1, (y - cliffTop(x)) / 130);
      return jig(chroma(ramp(['#4a3355', '#5d4160', '#71506a', '#8d6672', '#b98a7c'],
        Math.min(1, 0.2 + lit(x, y) * 0.5 + (1 - edge) * 0.2 - drop * 0.16 + r() * 0.2)), x, y, 0.3, 223), r, 5);
    },
    len: 26, lw: 6, steps: 4, follow: 0.97, lenJ: 0.6, aJ: 0.25, impasto: 0.9, relief: 0, op: 0.75,
  });
  [[236, 0.9], [284, 0.7], [332, 0.85]].forEach(([ly, w]) => {       // the same LEDGES
    paintPath(out, counter, rng,
      Array.from({ length: 10 }, (_, i) => { const x = WX0 + 4 + i * ((WX1 - WX0 - 8) / 9);
        return [x, ly + Math.sin(x / 60 + ly) * 4]; }),
      (x, y, r) => jig(mix('#5c4062', '#f0cfa4', 0.25 + lit(x, y) * 0.9 * w + r() * 0.25), r, 5),
      { lw: 2.2, len: 5, density: 0.5, jitter: 1.0 });
    strokes(out, counter, {
      rng, n: 150,
      sample: r => [WX0 + 4 + r() * (WX1 - WX0 - 8), ly + 3 + Math.pow(r(), 0.6) * 13],
      dir: () => 0.04,
      col: (x, y, r) => jig(mix('#4a3050', '#341f3c', 0.3 + r() * 0.6), r, 4),
      len: 14, lw: 4, steps: 2, lenJ: 0.6, relief: 0, op: 0.3,
    });
  });
  paintPath(out, counter, rng,                                       // the near corner, full in the sun
    [[WX0 + 2, GY(WX0)], [WX0 - 1, 300], [WX0 + 3, 246], [WX0 - 2, cliffTop(WX0) + 8]],
    (x, y, r) => jig(mix('#6b4a62', '#ffe0b4', lit(x, y) * 0.95 + r() * 0.2), r, 5), { lw: 2.6, len: 5, density: 0.7, jitter: 0.7 });
  paintPath(out, counter, rng,
    [[WX1 - 2, GY(WX1)], [WX1 + 2, 300], [WX1 - 3, 250], [WX1 + 1, cliffTop(WX1) + 8]],
    (x, y, r) => jig(mix('#3a2846', '#7d5a6a', r() * 0.8), r, 5), { lw: 2.4, len: 5, density: 0.6, jitter: 0.7 });
  strokes(out, counter, {                                            // the same TALUS at its foot
    rng, n: 900,
    sample: r => { const x = WX0 - 40 + r() * (WX1 - WX0 + 80);
                   const tt = Math.pow(r(), 0.55);
                   const top = GY(x) - 34 * (1 - Math.abs(x - (WX0 + WX1) / 2) / ((WX1 - WX0) / 2 + 40));
                   return [x, top + tt * (GY(x) + 14 - top)]; },
    dir: () => 0.06,
    col: (x, y, r) => jig(chroma(ramp(['#553a5c', '#6a4a66', '#835d६e'.replace('६','6'), '#a5787a', '#cda289'],
      Math.min(1, 0.15 + lit(x, y) * 0.5 + r() * 0.7)), x, y, 0.3, 229), r, 5),
    len: 8, lw: 3.2, steps: 2, lenJ: 0.7, relief: 0, op: 0.8,
  });
  strokes(out, counter, {                                    // the brow, full in the sun
    rng, n: 900,
    sample: r => { const x = 150 + r() * 664; const y = cliffTop(x) + Math.pow(r(), 0.55) * 22; return [x, y]; },
    dir: x => 0.05 + Math.sin(x / 88) * 0.16,
    col: (x, y, r) => {
      const d = 1 - (y - cliffTop(x)) / 22;
      return jig(chroma(ramp(['#4a3355', '#6b4a62', '#966d70', '#c79a84', '#f0cfa4'], Math.min(1, d * (0.35 + lit(x, y) * 1.1))), x, y, 0.24, 239), r, 5);
    },
    len: 15, lw: 3.4, steps: 3, follow: 0.95, lenJ: 0.75, aJ: 0.5, impasto: 0.9, relief: 0, op: 0.85,
  });
  // beds, facets, pitting, grain — the same stone as three days ago
  [[228, 252, 300, 11, 1.9, 0.42], [196, 306, 214, 7, 1.3, 0.3], [470, 232, 250, 14, 2.2, 0.46],
   [432, 300, 330, 9, 1.5, 0.34], [560, 350, 250, 6, 1.1, 0.26], [300, 214, 150, 8, 1.2, 0.3]]
    .forEach(([x0, y0, wid, amp, lw, dens], bi) => {
      paintPath(out, counter, rng,
        Array.from({ length: Math.round(wid / 26) }, (_, i) => { const x = x0 + i * 26;
          return [x, y0 + Math.sin(x / (70 + bi * 24) + bi) * amp]; })
          .filter(pt => pt[1] > cliffTop(pt[0]) + 14 && pt[1] < GY(pt[0]) - 6),
        (x, y, r) => jig(mix('#54496e', '#d3c0b0', lit(x, y) * 0.6 + r() * 0.3), r, 5),
        { lw: lw * 0.6, len: 5, density: dens * 0.8, jitter: 1.4 });
    });
  for (let f = 0; f < 260; f++) {
    const fx = 150 + rng() * 664;
    const fy = cliffTop(fx) + 8 + Math.pow(rng(), 0.8) * (GY(fx) - cliffTop(fx) - 14);
    if (fy > GY(fx) - 4) continue;
    if (fx > DL - 7 && fx < DR + 7 && fy > DTOP - 28) continue;
    const w = 7 + Math.pow(rng(), 1.6) * 22, h = w * (0.45 + rng() * 0.7);
    const tilt = (rng() - 0.5) * 0.5, q = [];
    for (let i = 0; i < 4; i++) {
      const a2 = tilt + i * Math.PI / 2 + (rng() - 0.5) * 0.5;
      q.push(`${R1(fx + Math.cos(a2) * w * (0.55 + rng() * 0.35))} ${R1(fy + Math.sin(a2) * h * (0.55 + rng() * 0.35))}`);
    }
    const v = Math.max(0, Math.min(1, faceVal(fx, fy) + (rng() - 0.45) * 0.26));
    out.push(`<path d="M${q.join('L')}Z" fill="${chroma(ramp(ROCK, v), fx, fy, 0.4, 233)}" opacity="${(0.3 + rng() * 0.3).toFixed(2)}"/>`);
    counter.n++;
  }
  strokes(out, counter, {                                    // pitting
    rng, n: 1100,
    sample: rej(150, 176, 814, 404, (x, y) => y > cliffTop(x) + 6 && y < GY(x) - 2
      && !(x > DL - 5 && x < DR + 5 && y > DTOP - 26)),
    dir: (x, y) => fbm(x / 12, y / 12, 151) * 6.28,
    col: (x, y, r) => jig(ramp(['#291a33', '#33223f', '#402b48', '#4e3552'], Math.min(1, faceVal(x, y) * 0.8 + r() * 0.3)), r, 5),
    len: 3.5, lw: 2.6, steps: 1, lenJ: 0.8, relief: 0, op: 0.35,
  });
  strokes(out, counter, {                                    // grain
    rng, n: 2200,
    sample: rej(150, 176, 814, 404, (x, y) => y > cliffTop(x) + 4 && y < GY(x)
      && !(x > DL - 4 && x < DR + 4 && y > DTOP - 24)),
    dir: (x, y) => Math.PI / 2 - 0.5 + (fbm(x / 26, y / 18, 157) - 0.5) * 1.5,
    col: (x, y, r) => jig(chroma(ramp(ROCK, Math.max(0, Math.min(1, faceVal(x, y) + (r() - 0.5) * 0.34))), x, y, 0.36, 229), r, 5),
    len: 8, lw: 2, steps: 2, lenJ: 0.8, aJ: 0.6, impasto: 0.9, relief: 0, op: 0.45,
  });
  // ⚠ THE WEIRD HOLE — GONE. Fred, twice, and the second time out of patience: this was a
  // "second, older tomb" I invented for the right of the hill to say the place was a
  // burying ground. Nobody asked for it, it explains nothing a reader needs, and it read
  // as exactly what he kept calling it — a weird hole. A page about ONE tomb should have
  // one opening in it. Invented scenery that competes with the subject is not richness.
  // ⚠ the same dark RECTANGLE that plagued `grave` lived here too — rej() paints a box,
  // and a box round a local passage becomes a shape. Gone. The wall paints this area.
  // the brow of rock standing over the mouth
  strokes(out, counter, {
    rng, n: 260,
    sample: r => { const t = r(); const x = DL - 26 + t * (PR - DL + 40);
                   const arc = DTOP - 16 - 9 * Math.sin(t * Math.PI);
                   return [x, arc + Math.pow(r(), 0.6) * 13]; },
    dir: (x) => -0.12 + Math.sin((x - DL) / 30) * 0.16,
    col: (x, y, r) => {
      const top = Math.max(0, 1 - (y - (DTOP - 26 - 9 * Math.sin(((x - (DL - 26)) / (PR - DL + 40)) * Math.PI))) / 12);
      return jig(ramp(['#3a2846', '#4f3654', '#6f4d63', '#9a7175', '#cfa588'], Math.min(1, top * 0.8 + lit(x, y) * 0.5)), r, 5);
    },
    len: 12, lw: 4, steps: 2, lenJ: 0.7, relief: 0,
  });
  cliffR.push([_cliff, out.length]);

  /* 3. THE MOUTH, AND THE LIGHT LET OUT OF IT ---------------------------------------- */
  const MOUTH = (() => {                                     // ⚠ the SAME broken outline
    const pts = [];
    for (let i = 0; i <= 10; i++) {
      const t = i / 10;
      const y = DBOT - t * (DBOT - (DTOP + 24));
      pts.push([DL + (fbm(t * 5.5, 1.7, 131) - 0.5) * 13 - (t > 0.42 && t < 0.62 ? 6 : 0), y]);
    }
    for (let i = 1; i <= 8; i++) {
      const t = i / 9;
      const x = DL + t * (DR - DL);
      pts.push([x, DTOP + 24 - Math.sin(Math.pow(t, 0.8) * Math.PI) * 31 + (fbm(t * 4.2, 3.3, 137) - 0.5) * 17]);
    }
    for (let i = 0; i <= 8; i++) {
      const t = i / 8;
      pts.push([DR + (fbm(t * 6.1, 5.9, 141) - 0.5) * 14, (DTOP + 30) + t * (DBOT - DTOP - 30)]);
    }
    return pts;
  })();
  const inMouth = (x, y) => {
    let c = false;
    for (let i = 0, j = MOUTH.length - 1; i < MOUTH.length; j = i++) {
      const xi = MOUTH[i][0], yi = MOUTH[i][1], xj = MOUTH[j][0], yj = MOUTH[j][1];
      if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c;
    }
    return c;
  };
  const _blaze = out.length;
  out.push(`<path d="M${MOUTH.map(q => R1(q[0]) + ' ' + R1(q[1])).join('L')}Z" fill="#fff3cf"/>`);
  counter.n++;
  strokes(out, counter, {                                    // the light standing in the tomb
    rng, n: 700,
    sample: r => { for (let k = 0; k < 12; k++) {
        const x = DL - 6 + r() * (DR - DL + 12), y = DTOP - 26 + r() * (DBOT - DTOP + 26);
        if (inMouth(x, y)) return [x, y]; } return null; },
    dir: (x, y) => Math.atan2(y - TY, x - TX) + Math.PI / 2,
    col: (x, y, r) => {
      const d = Math.min(1, Math.hypot((x - TX) / 34, (y - TY) / 62));
      return ramp(['#ffffff', '#fffbe6', '#ffeeb6', '#ffd98c', '#f6bd72'], Math.min(1, d * 0.9 + r() * 0.2));
    },
    len: 10, lw: 4, steps: 2, lenJ: 0.7, relief: 0, op: 0.85,
  });
  // ⚠ RAYS THAT DO NOT LEAVE THE ROCK BEHIND. The light spills OUT of the hole — over the
  // rim, down the sill, across the sand — so the ray fan is anchored at the mouth and dies
  // before it reaches the frame. A light that fills the whole plate stops being a source.
  for (let k = 0; k < 22; k++) {
    const a = -2.55 + k * 0.145 + (fbm(k * 1.7, 2.3, 191) - 0.5) * 0.1;
    const L = 90 + fbm(k * 2.1, 4.4, 193) * 190;
    strokes(out, counter, {
      rng, n: 26,
      sample: r => { const t = 0.1 + r() * 0.9;
                     const w = 5 + t * 20;
                     return [TX + Math.cos(a) * L * t + (r() - 0.5) * w, TY + Math.sin(a) * L * t + (r() - 0.5) * w * 0.6]; },
      dir: () => a,
      col: (x, y, r) => mix('#fff4cd', '#f3c489', Math.min(1, Math.hypot(x - TX, y - TY) / 210 + r() * 0.3)),
      len: 22, lw: 5, steps: 2, lenJ: 0.7, relief: 0, op: 0.16,
    });
  }
  strokes(out, counter, {                                    // and where it lands on the sill and sand
    rng, n: 420,
    sample: r => { const t = Math.pow(r(), 0.7);
                   return [TX - 40 + r() * 110, FLOOR - 6 + t * 96]; },
    dir: () => 0.05,
    col: (x, y, r) => mix('#ffeec2', '#e8c39a', Math.min(1, (y - FLOOR) / 96 + r() * 0.4)),
    len: 20, lw: 6, steps: 2, lenJ: 0.7, relief: 0, op: 0.3,
  });
  blazeR.push([_blaze, out.length]);

  /* 4. THE STONE, ROLLED CLEAR (John 20:1) ------------------------------------------- */
  const _stone = out.length;
  const STONE = ['#4b4265', '#5a5072', '#6d6280', '#877895', '#a897a2', '#cbb9ae'];
  const stoneVal = (x, y) => {
    const g = 1 - Math.min(1, Math.hypot((x - (SX - SW * 0.55)) / (SW * 1.05), (y - (SY - SH * 0.5)) / (SH * 1.05)));
    return Math.min(1, lit(x, y) * 0.42 + Math.pow(g, 0.7) * 0.85 + fbm(x / 18, y / 18, 93) * 0.1);
  };
  { const ring = [];
    for (let i = 0; i < 40; i++) {
      const a = i / 40 * Math.PI * 2;
      const w = 1 + (fbm(Math.cos(a) * 2 + 5, Math.sin(a) * 2 + 5, 97) - 0.5) * 0.16;
      ring.push(`${R1(SX + Math.cos(a) * SW * w)} ${R1(SY + Math.sin(a) * SH * w)}`);
    }
    out.push(`<path d="M${ring.join('L')}Z" fill="#6a5f80"/>`); }
  counter.n++;
  strokes(out, counter, {
    rng, n: 360,
    sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 0.5); return [SX + Math.cos(a) * SW * d, SY + Math.sin(a) * SH * d]; },
    dir: (x, y) => 0.08 + (fbm(x / 24, y / 16, 91) - 0.5) * 0.3,
    col: (x, y, r) => jig(chroma(ramp(STONE, stoneVal(x, y)), x, y, 0.26 * (1 - stoneVal(x, y)), 241), r, 4),
    len: 26, lw: 8, steps: 4, follow: 0.98, lenJ: 0.6, aJ: 0.35, impasto: 0.9, relief: 0,
  });
  for (let f = 0; f < 90; f++) {                             // it breaks like the wall it came from
    const a = rng() * Math.PI * 2, d = Math.pow(rng(), 0.55);
    const fx = SX + Math.cos(a) * SW * d * 0.94, fy = SY + Math.sin(a) * SH * d * 0.94;
    const w = 3 + Math.pow(rng(), 1.7) * 9, h = w * (0.5 + rng() * 0.6);
    const tilt = (rng() - 0.5) * 0.6, q = [];
    for (let i = 0; i < 4; i++) {
      const a2 = tilt + i * Math.PI / 2 + (rng() - 0.5) * 0.55;
      q.push(`${R1(fx + Math.cos(a2) * w * (0.55 + rng() * 0.35))} ${R1(fy + Math.sin(a2) * h * (0.55 + rng() * 0.35))}`);
    }
    out.push(`<path d="M${q.join('L')}Z" fill="${ramp(STONE, Math.max(0, Math.min(1, stoneVal(fx, fy) + (rng() - 0.45) * 0.22)))}" opacity="${(0.28 + rng() * 0.3).toFixed(2)}"/>`);
    counter.n++;
  }
  strokes(out, counter, {                                    // pitting and grain
    rng, n: 320,
    sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 0.5);
                   const x = SX + Math.cos(a) * SW * d * 0.95, y = SY + Math.sin(a) * SH * d * 0.95;
                   return Math.hypot((x - SX) / (SW * 0.97), (y - SY) / (SH * 0.97)) < 1 ? [x, y] : null; },
    dir: (x, y) => fbm(x / 9, y / 9, 161) * 6.28,
    col: (x, y, r) => jig(ramp(STONE, Math.max(0, stoneVal(x, y) - 0.2 - r() * 0.2)), r, 5),
    len: 2.6, lw: 2, steps: 1, lenJ: 0.8, relief: 0, op: 0.4,
  });
  strokes(out, counter, {                                    // the shadow it throws, AWAY from the tomb
    rng, n: 240,
    sample: r => [SX + SW * 0.35 + r() * 96, SY + SH - 12 + Math.pow(r(), 0.7) * 30],
    dir: () => 0.06,
    col: (x, y, r) => jig(mix('#7a6c96', '#4c4370', 0.3 + r() * 0.6), r, 4),
    len: 26, lw: 9, steps: 2, lenJ: 0.6, relief: 0, op: 0.45,
  });
  stoneR.push([_stone, out.length]);

  /* 5. THE GROUND, WAKING ------------------------------------------------------------- */
  const _near = out.length;
  strokes(out, counter, {
    rng, n: 3600,
    sample: r => { const x = -14 + r() * 828; const y = GY(x) - 2 + Math.pow(r(), 0.8) * (520 - GY(x)); return [x, y]; },
    dir: x => 0.02 + Math.sin(x / 160) * 0.06,
    col: (x, y, r) => {
      const near = (y - GY(x)) / (520 - GY(x));
      return jig(chroma(ramp(['#6d5a80', '#8f7086', '#b98d84', '#dcb189', '#f2d49b'],
        Math.min(1, lit(x, y) * 0.5 + 0.12 + near * 0.5 + fbm(x / 80, y / 26, 99) * 0.2)), x, y, 0.34, 251), r, 4);
    },
    len: (x, y) => (30 + (y - GY(x)) * 0.3) * lengthOf(x, y, 61), lw: (x, y) => 3.6 * widthOf(x, y, 63), steps: 3, follow: 0.97, lenJ: 0.3, wJ: 0.3, aJ: 0.35, impasto: 0.9, relief: 0,
  });
  // ⚠ THE SAME TRACK. Three days ago it ran the other way, and the stone was at the end of
  // it, across the mouth. It is still here — and now it ends at a stone standing clear.
  paintPath(out, counter, rng,
    [[DR - 6, FLOOR + 14], [SX - 130, FLOOR + 18], [SX - 90, SY + SH + 6], [SX - 56, SY + SH + 8]],
    (x, y, r) => jig(mix('#b3a3ab', '#7d6f96', 0.3 + r() * 0.5), r, 4), { lw: 12, len: 7, density: 0.55, jitter: 1.1 });
  strokes(out, counter, {                                    // the sill
    rng, n: 220,
    sample: r => [DL - 22 + r() * (PR - DL + 34), FLOOR - 2 + r() * 13],
    dir: () => 0.02,
    col: (x, y, r) => jig(ramp(['#8a7c9c', '#a293a6', '#bfaba8', '#ded0b4'], lit(x, y) * 0.6 + r() * 0.5), r, 5),
    len: 16, lw: 5, steps: 2, lenJ: 0.6, relief: 0, op: 0.85,
  });
  strokes(out, counter, {                                    // rubble
    rng, n: 300,
    sample: r => { const x = 190 + r() * 560; const y = GY(x) + Math.pow(r(), 0.6) * 26; return [x, y]; },
    dir: () => 0.05,
    col: (x, y, r) => jig(ramp(['#7d7098', '#93849e', '#ab9aa4', '#c6b3aa'], lit(x, y) * 0.5 + r() * 0.6), r, 5),
    len: 9, lw: 3.4, steps: 2, lenJ: 0.7, relief: 0, op: 0.7,
  });
  const rock = (bx, by, w, h) => {
    out.push(`<path d="M${R1(bx - w)} ${R1(by)}Q${R1(bx - w * 0.92)} ${R1(by - h * 0.9)} ${R1(bx - w * 0.1)} ${R1(by - h)}Q${R1(bx + w * 0.7)} ${R1(by - h * 1.04)} ${R1(bx + w)} ${R1(by - h * 0.2)}Q${R1(bx + w * 1.04)} ${R1(by)} ${R1(bx + w * 0.6)} ${R1(by)}Z" fill="#5f5580"/>`);
    counter.n++;
    strokes(out, counter, {
      rng, n: Math.round(w * 1.7),
      sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 0.5); return [bx + Math.cos(a) * w * d, by - h * 0.5 + Math.sin(a) * h * 0.5 * d]; },
      dir: () => 0.06,
      col: (x, y, r) => {
        const shoulder = Math.max(0, 1 - (y - (by - h)) / (h * 0.9)) * 0.6 + Math.max(0, (bx - x) / w) * 0.35;
        return jig(chroma(ramp(['#4e4570', '#5f547c', '#75688a', '#93849a', '#b5a3a6'], Math.min(1, lit(x, y) * 0.5 + shoulder)), x, y, 0.3, 257), r, 4);
      },
      len: 18, lw: 6, steps: 3, follow: 0.97, lenJ: 0.6, aJ: 0.4, impasto: 0.9, relief: 0,
    });
  };
  rock(118, 470, 40, 30); rock(216, 456, 26, 19); rock(686, 462, 42, 28);
  rock(58, 516, 74, 46); rock(742, 522, 88, 52); rock(390, 528, 70, 34);
  // ⚠ AND THE LAND WAKES. Isaiah 35:1 — "the desert shall rejoice, and blossom as the
  // rose." Not a meadow: this is still the burial hill, three days on. Green pushing up
  // through the same sand, and flowers where the dead scrub was.
  const tuft = (bx, by, w, h) => strokes(out, counter, {
    rng, n: Math.round(w * 2),
    sample: r => { const a = r() * Math.PI, d = Math.pow(r(), 0.7); return [bx + Math.cos(a + Math.PI) * w * d + w / 2, by - Math.abs(Math.sin(a)) * h * d]; },
    dir: (x, y) => -Math.PI / 2 + (fbm(x / 8, y / 8, 101) - 0.5) * 1.2,
    col: (x, y, r) => jig(mix('#4e7a3c', '#9dc262', r() * 0.9 + lit(x, y) * 0.3), r, 7),
    len: 9, lw: 1.8, steps: 2, lenJ: 0.6, relief: 0,
  });
  [[452, 400, 20, 13], [520, 412, 24, 15], [318, 398, 16, 11], [624, 450, 26, 16], [74, 500, 24, 15],
   [268, 486, 22, 14], [560, 492, 26, 17], [700, 500, 22, 14], [166, 462, 18, 12]]
    .forEach(([a, b, c, d]) => tuft(a, b, c, d));
  for (let i = 0; i < 26; i++) {                             // and it blossoms as the rose
    const fx = 40 + rng() * 720;
    const fy = GY(fx) + 24 + Math.pow(rng(), 0.6) * 92;
    if (fx > DL - 30 && fx < DR + 30 && fy < FLOOR + 26) continue;
    const st = 7 + rng() * 9;
    paintPath(out, counter, rng, [[fx, fy], [fx + (rng() - 0.5) * 4, fy - st]],
      (x, y, r) => jig(mix('#4e7a3c', '#8fb85c', r()), r, 7), { lw: 1.4, len: 3, density: 0.8, jitter: 0.3 });
    const pet = ['#ffd9e6', '#fff0f4', '#ffe7a8', '#f6c0d6'][(rng() * 4) | 0];
    for (let k = 0; k < 5; k++) {
      const a = k * 1.256 + rng() * 0.4;
      out.push(`<ellipse cx="${R1(fx + Math.cos(a) * 2.3)}" cy="${R1(fy - st + Math.sin(a) * 2.3)}" rx="2" ry="1.5" transform="rotate(${R1(a * 57)} ${R1(fx + Math.cos(a) * 2.3)} ${R1(fy - st + Math.sin(a) * 2.3)})" fill="${pet}" opacity="0.9"/>`);
      counter.n++;
    }
    out.push(`<circle cx="${R1(fx)}" cy="${R1(fy - st)}" r="1.2" fill="#ffe9a8"/>`); counter.n++;
  }
  inscriptionText(out, greekRef(28, 6), { x: 108, y: 452, h: 14, body: '#6c5f8e', edge: '#f3e2c4', op: 0.28, edgeOp: 0.35 });
  nearR.push([_near, out.length]);

  const ALT = 'The same burial hill as the page before, now at dawn. The sun is up over the valley on the left and the city on the horizon has morning on its walls. The cave mouth cut into the rock is wide open and blazing: white and gold light pours out of it, fans across the rock in rays, and spills down the sill onto the sand. The great round stone has been rolled clear and stands on the sand away to the right, at the end of the track it rolled along, throwing its shadow away from the tomb. The ground is pale and warm, green is pushing up through the sand, and small pink and white flowers are open where the dead scrub was.';

  const RAW = { undercoat: 0, weave: 0, varnish: 0, oil: 0 };
  const pick = ranges => ranges.map(([a, b]) => out.slice(a, b).join('\n')).join('\n');
  const claimed = new Set();
  for (const rr of [cliffR, blazeR, stoneR, nearR]) for (const [a, b] of rr) for (let i = a; i < b; i++) claimed.add(i);
  if (LAYER === 'bg') return svgWrap(ALT, out.filter((_, i) => !claimed.has(i)).join('\n'), RAW);
  if (LAYER === 'cliff') return svgWrap(ALT, pick(cliffR), RAW);
  if (LAYER === 'blaze') return svgWrap(ALT, pick(blazeR), RAW);
  if (LAYER === 'stone') return svgWrap(ALT, pick(stoneR), RAW);
  if (LAYER === 'near') return svgWrap(ALT, pick(nearR), RAW);
  return svgWrap(ALT, out.join('\n'));
}
