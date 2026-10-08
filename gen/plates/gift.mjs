// gen/plates/gift.mjs — "The gift" / "The way home was open now"
// The resurrection has thrown the door of home WIDE OPEN. A pale path runs
// from the reader's feet up a gentle green hill to a RADIANT OPEN DOOR of
// gold light standing in the hillcrest — the Father's house, the way now
// open. Warm light spills from the threshold all the way down the path, so
// the road home is the brightest thing underfoot (the road home is the
// brightest path). Beyond the door: not a dark room but a whole world of
// colour. A FREE gift — you only walk into the light. (Eph 2:8.)
//
// Munch grammar: the living sky + hill CURVE; the made door stands STRAIGHT.
// One light source — the open door. Everything converges on the open way.
//
// MOBILE 3D — depth planes (FAR→NEAR): the swirling sky behind; the hillcrest
// with the blazing door; the green field + the pale path; the near grass. On
// tilt the door holds the distance while the path leads the eye home.

export const name = 'gift';
export const title = 'The gift';
export const caption = 'Open your hand.';
export const seed = 20261111;
export const focal = { x: 400, y: 300 };   // portrait window: the path leading up to the open door
export const layers = [
  { name: 'sky', opaque: true },   // the swirling dawn, converging on the door (backmost, opaque)
  // ⚠ SAME FAULT AS nonight (Sep 21): a plane named `hills` defaults to 60% opacity, and this one
  // carries the Father's house and the open door. It is His house; it does not get to be a ghost.
  { name: 'hills', op: 0.95 },     // the hillcrest + the radiant OPEN DOOR + glory + the world beyond
  { name: 'land' },                // the green field + the pale path home
  { name: 'fg' },                  // near grass + flowers (closest)
];

export function paint(E, opts = {}) {
  const {
    mulberry32, fbm, curlV, goldenSpiralV, mix, ramp, jig, strokes, rej,
    paintPath, lightRadial, klimtGold, ridge, paintPalace, horizonFringe, groundFlowers, dirtRoad, fruitTree, perspectiveAvenue,
    limbs, spreadTips, gAt,
    svgWrap, R1, W, H,
    GOLD, GOLD_PALE, GOLD_DEEP, GOLD_HOT,
  } = E;

  const rng = mulberry32(seed);
  const out = [];
  const counter = { n: 0 };
  const LAYER = opts.layer || 'full';
  const farRanges = [], fgRanges = [];
  // ⭐ DETAIL PASS (Sep 8) — the SKY only: Fred loves this page's terrain (the green world
  // recipe), so the grass is untouched. The sky was 900 slabs at lw 5.5; now it is fine
  // strokes, every one its own width and length (Fred: "use no rules"), still orbiting.
  const free = (x, y, salt) => { const n = Math.sin(x * 12.9898 + y * 78.233 + salt) * 43758.5453; return n - Math.floor(n); };
  const widthOf  = (x, y, salt) => 0.40 + 3.2 * Math.pow(free(x, y, salt), 2.6);
  const lengthOf = (x, y, salt) => 0.40 + 1.5 * Math.pow(free(x, y, salt + 17), 1.5);

  /* ---------------- geometry ---------------- */
  // ══ THE RISEN GROUND, AND A SKY THAT BREATHES ═════════════════════════════════════
  // `gift` sits after the resurrection, so by the book's own rule it lives in the light —
  // but it was still painted in the old grammar: one flat green, confetti scattered over it,
  // and a sky that never moved. The same three fixes `ran` had:
  //   1 · drifting hue (value stays, hue moves) so the field carries real colour;
  //   2 · broken colour in the shade, so shadow is as colourful as light;
  //   3 · every stroke of the sky orbits a small circle, so the sky breathes on a closed loop.
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
  const HUES = [0.96, 0.06, 0.09, 0.60, 0.96, 0.28, 0.13, 0.76, 0.60];   // ← risen.mjs, verbatim
  const chroma = (c, x, y, k, sd = 211) => {
    const f = fbm(x / 155, y / 135, sd);
    const H = HUES[Math.min(HUES.length - 1, Math.floor(f * HUES.length * 1.25))];
    const rgb = HEXN(c);
    let [h, sa, l] = toHSL(rgb[0], rgb[1], rgb[2]);
    let d = H - h; if (d > 0.5) d -= 1; if (d < -0.5) d += 1;
    const kk = k * (0.6 + fbm(x / 62, y / 58, sd + 3) * 0.75);
    h = (h + d * kk + 1) % 1;
    sa = Math.min(0.62, sa + kk * 0.5 * (1 - Math.abs(l - 0.55) * 1.5));
    const o = toRGB(h, sa, l);
    return HEXS(o[0], o[1], o[2]);
  };
  // the sky's closed orbit — same rig as `ran`: it closes, it is even, it never pauses
  const NF = Math.max(2, globalThis.__FRAME_N || 6);
  const TH = 2 * Math.PI * ((globalThis.__FRAME || 0) % NF) / NF;
  const OX = Math.cos(TH) * 13, OY = Math.sin(TH) * 13 * 0.62;

  const horizon = 232;                                 // the hillcrest the door stands on
  const door = { x: 400, y0: 112, y1: 206, w: 92 };    // the OPEN DOOR of light, seated ON the crest
  const dc = [door.x, 156];                            // the heart of the blaze
  const gD = lightRadial(dc[0], dc[1], 220);           // the door's reach across the whole frame

  // the field's crest RISES to a gentle hill under the door (a rolling contour)
  const fieldTop = ridge(horizon, { amp: 16, freq: 150, bumps: 0.4, seed: 77 });
  const crest = x => fieldTop(x) - 30 * Math.exp(-((x - door.x) * (x - door.x)) / (140 * 140));  // the door sits on a gentle rise

  // the PATH home: from the reader's feet (wide, bottom-centre) up to the
  // door's THRESHOLD at the crest (narrow). Slight living curve, never a ruled line.
  // ⚠ IT MUST END AT THE VISIBLE ENTRANCE, NOT THE GEOMETRIC ONE. Measured off the raster,
  // the road's top sat at y=204 — the gate's true foot — but the HILL is painted over the
  // palace's lower fifteen units, so the entrance you can actually SEE starts at y≈189. That
  // left a 12-unit band of grass between the way and the door on a page whose whole sentence
  // is that the way home stands open. The path now climbs over the brow to meet the gate
  // where the eye finds it.
  // ⚠ AND NOT PAST IT EITHER. `crest(400)` is 192.4 and the hill's visible edge measures
  // 193 — they are the SAME line; I had assumed the crest sat ~10 units lower and pushed the
  // road 15 above it, then sampled 22 above, which painted the way 23 units up the tower's
  // face. Fred: "now it is overshooting." The road ends where the grass ends: two units over
  // the crest, so it touches the threshold and stops.
  const far = [door.x, crest(door.x) - 2], near = [388, 512];
  const pathP = t => [far[0] + (near[0] - far[0]) * t + Math.sin(t * 4.3) * 16 * t, far[1] + (near[1] - far[1]) * t];
  // ⚠ IT MUST REACH THE DOOR. Fred: "it looks like the road stopped before the entrance of
  // the kingdom." It did — width 2 at the far end is a two-unit thread, and `onPath` needs a
  // stroke to land within ONE unit of the centreline, so almost no paint was laid up there at
  // all. On the page whose whole sentence is that the way home stands OPEN, the way did not
  // get there. It keeps a real ribbon all the way to the threshold now.
  const pathW = t => 13 + 92 * t * t + 14 * t;         // narrows toward the door but never vanishes
  const pathInfo = (x, y) => { let bt = 0, bd = 1e9; for (let t = 0; t <= 1.001; t += 0.03) { const p = pathP(t); const d = Math.hypot(x - p[0], y - p[1]); if (d < bd) { bd = d; bt = t; } } return { t: bt, d: bd }; };
  const onPath = (x, y) => { const { t, d } = pathInfo(x, y); return d < pathW(t) / 2; };

  /* ---------------- 1. THE SKY — a warm dawn wheeling around the open door ----------------
     free Munch colour, bright never black; ONE great wheel + a couple of eddies,
     and a radial IN-DRAW so the whole sky converges on the open way. */
  // ⚠ THE SKY WAS THE DARKEST THING IN A PICTURE ABOUT AN OPEN DOOR. Once the ground was
  // properly painted the heaven above it read as a bruise — muted mauve, and darker than the
  // meadow, which inverts the page: after the resurrection the reader stands IN the light,
  // and the light comes from up there. Same hues, lifted into a real dawn, with the gold
  // gathering toward the door instead of sitting in a band at the horizon.
  const SKY = ['#a8bbef', '#b9c3f0', '#cfbde8', '#f0cfc8', '#ffe3ac', '#fff4d8'];
  const EDDIES = [[180, 104, -48], [612, 128, 50]];
  const skyDir = (x, y) => {
    let vx = 0, vy = 0;
    { const [a, b] = goldenSpiralV(x, y, dc[0], dc[1], 100, 250); vx += a; vy += b; }                 // MACRO wheel on the door
    for (const [ex, ey, s] of EDDIES) { const [a, b] = goldenSpiralV(x, y, ex, ey, s, 78); vx += a; vy += b; }  // MID eddies
    const [c, d] = curlV(x, y, 30, 120); vx += c * 24; vy += d * 24;                                    // MICRO turbulence
    const gx = dc[0] - x, gy = dc[1] - y, gd = Math.hypot(gx, gy) + 1e-6, pull = 70 / (1 + gd / 150);   // IN-DRAW toward the door
    vx += (gx / gd) * pull; vy += (gy / gd) * pull;
    return Math.atan2(vy, vx);
  };
  out.push(`<rect width="${W}" height="${H}" fill="#8fa0dc"/>`);   // a DAWN bed — gaps must not read as night
  strokes(out, counter, {
    rng, n: 2200,
    // ⚠ sampled wider than the plate so the orbit can never pull a gap in at an edge
    sample: (function () { const base = rej(-28, -28, 828, horizon + 56); return r => { const q = base(r); return q ? [q[0] + OX, q[1] + OY] : null; }; })(),
    dir: skyDir,
    col: (x, y, r) => {
      let c = ramp(SKY, fbm(x / 120, y / 120, 31) * 0.5 + (y / horizon) * 0.5);
      c = mix(c, '#fff3d2', gD(x, y) * 0.8);           // the door's warmth flooding the sky
      return jig(chroma(c, x, y, 0.2, 263), r, 11);
    },
    // ⚠ relief 0.5 -> 0.15: every stroke was carrying a shadow edge, and 900 of them stacked
    // into a general gloom that no amount of lifting the RAMP could undo.
    len: (x, y) => 22 * lengthOf(x, y, 11), lw: (x, y) => 2.8 * widthOf(x, y, 13), steps: 4, follow: 0.9, wild: 0.05, lenJ: 0.3, wJ: 0.3, impasto: 0.5, relief: 0.15,
    aJ: (x, y) => 0.14 + gD(x, y) * 0.26,
  });
  const skyEnd = out.length;   // ← the opaque SKY plane ends here

  /* ---------------- 2. THE HILL + THE OPEN DOOR (the FAR plane) ---------------- */
  const _far0 = out.length;
  // the green hill rising to the crest, lit warm by the door
  strokes(out, counter, {
    rng, n: 900,
    sample: rej(-10, horizon - 40, 810, 360, (x, y) => y > crest(x) - 2),
    dir: (x, y) => { const [vx, vy] = curlV(x, y, 120, 60); return Math.atan2(vy * 0.7 + 0.12, Math.abs(vx) + 0.8); },
    col: (x, y, r) => {
      let c = ramp(['#3f7a40', '#4f8a44', '#6aa050'], fbm(x / 90, y / 60, 51) * 0.8);
      c = mix(c, '#e8d08a', gD(x, y) * 0.5);           // door-light warming the crest
      return jig(c, r, 10);
    },
    len: 15, lw: 4.5, steps: 3, impasto: 0.5, relief: 0.4,
  });
  // the great GLORY halo, so the door is the brightest thing on the page
  strokes(out, counter, {
    rng, n: 520,
    sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 0.9) * 210; return [dc[0] + Math.cos(a) * d, dc[1] + Math.sin(a) * d * 0.9]; },
    dir: (x, y) => Math.atan2(y - dc[1], x - dc[0]),
    col: (x, y, r) => jig(ramp([GOLD_HOT, GOLD_PALE, GOLD, GOLD_DEEP, '#b98a3a'], Math.hypot(x - dc[0], (y - dc[1]) / 0.9) / 210), r, 9),
    len: 12, lw: 2.2, steps: 2, impasto: 0.5,
  });
  // BOLD rays of welcome beaming out from the open way
  strokes(out, counter, {
    rng, n: 96,
    sample: r => { const a = r() * Math.PI * 2, d = 36 + r() * 84; return [dc[0] + Math.cos(a) * d, dc[1] + Math.sin(a) * d * 0.9]; },
    dir: (x, y) => Math.atan2(y - dc[1], x - dc[0]),
    col: (x, y, r) => jig(mix(GOLD_HOT, GOLD_PALE, r() * 0.5), r, 6),
    len: (x, y) => 30 + Math.hypot(x - dc[0], y - dc[1]) * 0.4, lw: 1.7, steps: 2, lenJ: 0.6,
  });
  klimtGold(out, counter, rng, dc[0], dc[1], 88, 210, { rings: 8, opacity: 0.6, squash: 0.9 });
  // THE PALACE OF GOD on the crest — the New Jerusalem (Rev 21), gold towers around
  // the OPEN GATE of light: the one Home the whole book leads to, its gate the way in.
  paintPalace(out, counter, rng, door.x, crest(door.x) + 2, 0.86, { gate: true });
  farRanges.push([_far0, out.length]);   // ← hill + glory + the palace (FAR plane)

  /* ---------------- 3. THE FIELD + THE PATH HOME (the LAND plane, unclaimed) ---------------- */
  // Solid green field underpaint. Its TOP EDGE is where the field meets the glory,
  // so it must not be a drawn line — grass has no outline, it has blades. Two things
  // break it: this fill follows a blade-scale jagged contour (sampled fine enough to
  // KEEP the jag — at a 9px step the sawtooth is averaged away), and horizonFringe
  // below adds real tufts standing up off the crest with gaps between them.
  const crestJag = x => {
    const fine = (fbm(x / 3.1, 2.1, 613) - 0.5) * 6.5;               // blade-scale sawtooth
    const tuft = Math.max(0, fbm(x / 8.5, 9.4, 617) - 0.52) * 24;    // occasional taller clumps
    return crest(x) + fine - tuft;
  };
  {
    let d = `M-2 ${R1(crestJag(-2))}`;
    for (let x = -2; x <= 802; x += 2.2) d += `L${R1(x)} ${R1(crestJag(x))}`;
    d += `L802 ${H + 2}L-2 ${H + 2}Z`;
    out.push(`<path d="${d}" fill="#3f7a38"/>`); counter.n++;
  }
  // the ragged skyline of grass — tufts rising off the crest into the door's light,
  // clumped with gaps, warmed toward the door like everything else in this field
  horizonFringe(out, counter, rng, {
    horizonFn: crest,
    cols: ['#3f7c36', '#5a9440', '#79ac4e', '#94bc5a'],
    hMax: 21, lightFn: gD, seed: 619, dirJitter: 0.72,
  });
  // the pale PATH underpaint — a warm ribbon home
  {
    let L2 = [], R2 = [];
    for (let t = 0; t <= 1.001; t += 0.08) {
      const p = pathP(t), q = pathP(Math.min(1, t + 0.03));
      let nx = -(q[1] - p[1]), ny = q[0] - p[0]; const nl = Math.hypot(nx, ny) || 1; nx /= nl; ny /= nl;
      const hw = pathW(t) / 2;
      L2.push([p[0] + nx * hw, p[1] + ny * hw]); R2.push([p[0] - nx * hw, p[1] - ny * hw]);
    }
    let d = `M${R1(L2[0][0])} ${R1(L2[0][1])}`;
    for (let i = 1; i < L2.length; i++) d += `L${R1(L2[i][0])} ${R1(L2[i][1])}`;
    for (let i = R2.length - 1; i >= 0; i--) d += `L${R1(R2[i][0])} ${R1(R2[i][1])}`;
    out.push(`<path d="${d}Z" fill="#d8c090"/>`); counter.n++;
  }
  // SCALE GRADIENT — the one thing that turns a green shape into receding ground.
  // A mark at your feet is nearly four times the mark at the crest; drawn all one
  // size (as this field was) the eye reads a flat sheet no matter how good the
  // colour is. Everything standing ON the ground uses this.
  const dS = y => 0.32 + 1.0 * Math.max(0, Math.min(1, (y - horizon) / (H - horizon)));
  // ⚠ A PLAIN WITHOUT FORM IS A GREEN SHAPE. Everything so far added DETAIL to the field —
  // more blades, better flowers — but detail cannot substitute for shape: the ground still
  // read as a flat sheet with things standing on it, because nothing told the eye where it
  // rises and falls. So the land rolls, and the value follows which way each slope FACES the
  // open door. That single term is what turns a green area into ground you could walk up.
  const swell = (x, y) => fbm(x / 165, y / 74, 313);
  const facing = (x, y) => {
    const e = 7;
    return (swell(x - e, y) - swell(x + e, y)) * 2.2 + (swell(x, y - e) - swell(x, y + e)) * 1.2;
  };
  // and the far field loses itself in the light around the door (aerial perspective)
  const haze = (x, y) => Math.max(0, Math.min(1, 1 - (y - horizon) / 86));

  // field grass strokes (off the path), warmed toward the door
  strokes(out, counter, {
    rng, n: 1600,
    sample: rej(-10, horizon - 20, 810, 510, (x, y) => y > crest(x) - 1 && !onPath(x, y)),
    dir: (x, y) => { const [vx, vy] = curlV(x, y, 150, 66); return Math.atan2(vy * 0.85 - 0.12, Math.abs(vx) + 0.7); },
    col: (x, y, r) => {
      // ⚠ ONE FLAT GREEN IS A SHAPE, NOT A FIELD — the same fault `ran` had. Value from the
      // light and the lie of the land; HUE drifting in fields; and shade that keeps its own
      // colour instead of collapsing to a darker green.
      const depth = Math.max(0, Math.min(1, (y - horizon) / (H - horizon)));
      let c = ramp(['#33702f', '#3f7c36', '#5a9440', '#79ac4e', '#94bc5a', '#b6ce70'],
        fbm(x / 70, y / 44, 91) * 0.55 + depth * 0.26 + facing(x, y) * 0.6 + swell(x, y) * 0.2);
      const sh = 1 - gD(x, y);                                   // how far from the open door
      if (sh > 0.4 && r() < 0.22 + sh * 0.36) c = mix(c, chroma('#3d5f46', x, y, 0.5, 197), 0.24 + sh * 0.32);
      c = mix(c, '#fff0c8', gD(x, y) * 0.46);                    // and gold pools at the threshold
      c = mix(c, '#e8e3c0', haze(x, y) * 0.55);
      return jig(chroma(c, x, y, 0.3, 211), r, 12);
    },
    len: (x, y) => 12 * dS(y), lw: (x, y) => 3.4 * dS(y), steps: 3, impasto: 0.45, relief: 0.35, lenJ: 0.5,
  });
  // ══ THE GRASSY PLAIN, PROPERLY PAINTED ═════════════════════════════════════════════
  // Fred: "fix the grassy plains, make it with more details, add more brush strokes, etc."
  // 1600 marks over a plain this size is about one stroke per 90 square units — which is why
  // it read as a green SHAPE with things standing on it. Grass is not a colour, it is a
  // countless number of small upright things, and it needs to be painted like one: layers at
  // three scales, each finer and each catching the door's light differently.
  const grassCol = (x, y, r, lift) => {
    const depth = Math.max(0, Math.min(1, (y - horizon) / (H - horizon)));
    let c = ramp(['#2f6a2e', '#3a7433', '#4f8c3c', '#6aa447', '#8bbc57', '#aed073'],
      fbm(x / 46, y / 30, 93) * 0.5 + depth * 0.24 + facing(x, y) * 0.55 + swell(x, y) * 0.18 + lift);
    const sh = 1 - gD(x, y);
    if (sh > 0.4 && r() < 0.2 + sh * 0.3) c = mix(c, chroma('#37543e', x, y, 0.5, 197), 0.22 + sh * 0.3);
    c = mix(c, '#fff0c8', gD(x, y) * 0.42);
    c = mix(c, '#e8e3c0', haze(x, y) * 0.5);                   // the crest dissolves into its own light
    return jig(chroma(c, x, y, 0.28, 211), r, 12);
  };
  strokes(out, counter, {                                    // 2 · the body of the sward
    rng, n: 4200,
    sample: rej(-10, horizon - 14, 810, 512, (x, y) => y > crest(x) - 1 && !onPath(x, y)),
    dir: (x, y) => -Math.PI / 2 + (fbm(x / 30, y / 20, 97) - 0.5) * 0.7,
    col: (x, y, r) => grassCol(x, y, r, 0.06),
    len: (x, y) => 7 * dS(y), lw: (x, y) => 1.9 * dS(y), steps: 2, lenJ: 0.7, impasto: 0.5, relief: 0.3,
  });
  strokes(out, counter, {                                    // 3 · blades that STAND UP out of it
    rng, n: 3000,
    sample: rej(-10, horizon + 6, 810, 512, (x, y) => y > crest(x) + 2 && !onPath(x, y)),
    dir: (x, y) => -Math.PI / 2 + (fbm(x / 11, y / 9, 101) - 0.5) * 1.15,
    col: (x, y, r) => grassCol(x, y, r, 0.22),
    len: (x, y) => 9 * dS(y), lw: (x, y) => 1.1 * dS(y), steps: 2, lenJ: 0.8, impasto: 0.6,
  });
  strokes(out, counter, {                                    // 4 · and the finest nap, close to us
    rng, n: 2600,
    sample: r => { const x = -10 + r() * 820, y = horizon + 14 + Math.pow(r(), 0.8) * (512 - horizon - 14);
                   return (y > crest(x) && !onPath(x, y)) ? [x, y] : null; },
    dir: (x, y) => -Math.PI / 2 + (fbm(x / 7, y / 6, 103) - 0.5) * 1.5,
    col: (x, y, r) => grassCol(x, y, r, 0.3),
    len: (x, y) => 6 * dS(y), lw: (x, y) => 0.8 * dS(y), steps: 2, lenJ: 0.85, impasto: 0.7,
  });
  for (let i = 0; i < 120; i++) {                            // and clumps, because grass grows in tufts
    const tx = -10 + rng() * 820;
    const ty = horizon + 14 + Math.pow(rng(), 0.55) * (508 - horizon - 14);
    if (onPath(tx, ty)) continue;
    const sc = dS(ty);
    strokes(out, counter, {
      rng, n: 14,
      sample: r => [tx + (r() + r() - 1) * 9 * sc, ty - Math.pow(r(), 0.7) * 11 * sc],
      dir: (x, y) => -Math.PI / 2 + (x - tx) * 0.05 + (fbm(x / 6, y / 6, 107) - 0.5) * 0.8,
      col: (x, y, r) => grassCol(x, y, r, 0.34),
      len: 10 * sc, lw: 1.1 * sc, steps: 2, lenJ: 0.7, impasto: 0.65,
    });
  }
  // the PATH itself — pale warm strokes, BRIGHTEST where the door-light spills down it
  strokes(out, counter, {
    rng, n: 900,
    // ⚠ THIS is where the road was being cut off. The pass only sampled from `horizon - 10`
    // (y=222) downward, but the way runs up to the door's foot at y=204 — so the last twenty
    // units of it were never painted, whatever width the path claimed to have. It samples to
    // the threshold now.
    sample: rej(-10, crest(door.x) - 6, 810, 512, (x, y) => onPath(x, y)),
    dir: (x, y) => { const { t } = pathInfo(x, y); const p = pathP(Math.min(1, t + 0.02)), q = pathP(t); return Math.atan2(p[1] - q[1], p[0] - q[0]); },
    col: (x, y, r) => {
      // ⚠ the way home is the one MADE thing here and the brightest thing underfoot, so it is
      // worth more than one flat ramp: worn stone, packed earth between, and the crown of the
      // path catching more light than its edges — which is what tells you it is a path and
      // not a pale stripe.
      const { t, d } = pathInfo(x, y);
      const crown = 1 - Math.min(1, Math.abs(d) / (pathW(t) / 2 + 0.001));
      let c = ramp(['#c9b184', '#d8bd82', '#e6cf94', '#efe0b0', '#f8eec6'],
        fbm(x / 26, y / 18, 41) * 0.55 + crown * 0.4 + (r() - 0.5) * 0.18);
      c = mix(c, '#fff0c8', gD(x, y) * 0.6 + (1 - t) * 0.28);   // the road home is the brightest path
      return jig(c, r, 8);
    },
    len: (x, y) => 12 * dS(y), lw: (x, y) => 3.6 * dS(y), steps: 3, impasto: 0.5, relief: 0.4, lenJ: 0.5,
  });

  // THE ROAD, WORN. The strokes above lay the road down; this wears it in —
  // two rutted lanes, the paler crown standing between them, loose grit, and a
  // verge that breaks into the grass instead of ending at a clean edge. The road
  // home stays the brightest thing underfoot, but it is now a road someone walks
  // on rather than a ribbon laid over the field.
  dirtRoad(out, counter, rng, {
    ptFn: pathP, wFn: pathW,
    cols: ['#a98a58', '#cfae76', '#f0e0ae'],
    lightFn: gD, ruts: 0.34, stones: 170, verge: 280, seed: 823,
  });

  // WILDFLOWERS THROUGH THE MIDDLE DISTANCE. The near grass had flowers and the
  // crest now has tufts, but between them lay a bare green expanse with nothing for
  // the eye to hold — so the field read as a shape, not a place. These are sized by
  // the same depth gradient, so they shrink toward the crest and carry the recession
  // rather than fighting it. Off the path: the road home stays clear. (Isa 35:1.)
  // "The flowers appear on the earth" (Song 2:12) — the ground of the kingdom is not
  // a green sheet with a few blooms on it; it is IN flower. Tripled, and running all
  // the way to the reader's feet.
  // ⚠ 900 SCATTERED DOTS IS NOT A MEADOW, IT IS SPRINKLES. Close up they were the loudest
  // thing on the plain — evenly spread pink/blue/lilac blobs sitting ON the grass rather than
  // growing out of it. Flowers grow in COLONIES, from a stem, with a face: so the field gets
  // ~34 patches, each a family of one colour, each flower a stem and petals and a centre, and
  // the patches thin out with distance instead of carpeting the whole plain evenly.
  {
    const PETALS = [['#ffd9e6', '#f6c0d6'], ['#fff2f6', '#ffe0ea'], ['#ffe7a8', '#f6cf7a'],
                    ['#dcd0f4', '#c4b4ec'], ['#fdfdfa', '#eee9dc']];
    for (let c = 0; c < 34; c++) {
      const cx = -10 + rng() * 820;
      // ⚠ pow(r,0.5) pushed every colony DOWNHILL and left the upper field bare. Fred:
      // "the top part is still empty." Even distribution, and a few pushed high on purpose.
      const cy = horizon + 20 + (c < 12 ? rng() * 0.42 : rng()) * (508 - horizon - 20);
      if (onPath(cx, cy)) continue;
      const pal = PETALS[(rng() * PETALS.length) | 0];
      const spread = 26 + rng() * 54, count = 5 + (rng() * 9) | 0;
      for (let i = 0; i < count; i++) {
        const fx = cx + (rng() + rng() - 1) * spread;
        const fy = cy + (rng() + rng() - 1) * spread * 0.4;
        if (onPath(fx, fy) || fy < crest(fx) + 6) continue;
        const sc = dS(fy), st = (7 + rng() * 8) * sc;
        paintPath(out, counter, rng, [[fx, fy], [fx + (rng() - 0.5) * 4, fy - st]],
          (x, y, r) => jig(mix('#4e7a3c', '#7fa84e', r()), r, 7), { lw: 1.2 * sc, len: 3, density: 0.9, jitter: 0.3 });
        const pet = pal[(rng() * 2) | 0], hd = 2.4 * sc;
        for (let k = 0; k < 5; k++) {
          const a = k * 1.256 + rng() * 0.35;
          out.push(`<ellipse cx="${R1(fx + Math.cos(a) * hd)}" cy="${R1(fy - st + Math.sin(a) * hd)}" rx="${R1(2.1 * sc)}" ry="${R1(1.5 * sc)}" transform="rotate(${R1(a * 57)} ${R1(fx + Math.cos(a) * hd)} ${R1(fy - st + Math.sin(a) * hd)})" fill="${pet}" opacity="0.94"/>`);
          counter.n++;
        }
        out.push(`<circle cx="${R1(fx)}" cy="${R1(fy - st)}" r="${R1(1.25 * sc)}" fill="#ffe9a8"/>`); counter.n++;
      }
    }
  }

  /* ---------------- 3b. THE AVENUE — one-point perspective ---------------- */
  // Fred: "a point perspective scene, so bigger trees in front, smaller in the back."
  // The open door IS the vanishing point and the path is already parameterised by t, so
  // the trees take their scale, spacing and spread off that same t. Now via the shared
  // engine helper, so this page gets the unpaired walk and the mixed species too.
  const _avf0 = out.length;
  // ══ THE TREES ══════════════════════════════════════════════════════════════════════
  // Moved into the engine as `paintTree` so every page can have them (Fred: "can we make sure
  // we can draw like this all the time?"). The rule lives there in full; the short version is
  // that the crown goes YELLOW and pale while the belly goes deep and cool, because the light
  // is above — which is what makes a canopy a solid rounded thing and not a green blob.
  const tree = (tx, ty, h, tr) => E.paintTree(out, counter, tr, tx, ty, h, {
    lightFn: gD,                                  // this page's light is the open door
    tint: (c, x, y) => chroma(c, x, y, 0.2, 211), // and its drifting-hue field
    shadowDir: tx < door.x ? -1 : 1,              // shadows lean away from the door
  });
  // ⚠ RESTORED. A range-replacement when I pointed this page at the shared tree painter took
  // the whole far country out with it — groves, hedge lines and flock — silently. Check what a
  // block replacement swallows; the build still succeeded and the page just quietly emptied.
  //
  // The far band exists because the meadow has to RECEDE THROUGH things: groves standing in
  // the middle distance, hedge lines along the contours, a grazing flock. All small and low
  // in contrast so they never compete with the door.
  // ⚠ THE HILLTOP KEEPS AN OPEN SWARD. Fred: "make a band of open meadow at the hilltop."
  // The city has to rise out of GREEN, not out of the treetops — an open lawn at the gate is
  // what makes the hill read as a hill and the road read as arriving somewhere. The band is
  // not a constant offset (that would draw a ruler-straight treeline across the page); its
  // depth wanders with the land, so the wood's edge bays in and out the way a real treeline
  // does, thin where the ground rises and wide where it falls away.
  const sward = (x) => 30 + 40 * fbm(x / 155, 4.2, 77) + 8 * Math.sin(x / 88);

  const farGrove = (gx, gy, gw) => {
    const n = 3 + ((rng() * 4) | 0);
    for (let i = 0; i < n; i++) {
      const tx = gx + (rng() + rng() - 1) * gw;
      const ty = gy + (rng() - 0.5) * 9;
      if (onPath(tx, ty) || ty < crest(tx) + sward(tx)) continue;   // never up onto the open lawn
      const hh = 20 + rng() * 26;
      const rr = hh * 0.34, ccy = ty - hh * 0.55;
      // ⚠ EVEN OUT HERE THE TREES BRANCH. A grove of straight sticks under identical blobs is
      // one tree stamped a hundred times — the machine tell at the back of the picture. Each
      // gets its own skeleton from the same chain the near trees use, and hangs its foliage
      // on the tips, so the far country has a hundred different trees in it.
      const GG = gAt('grove', tx, ty, hh).child('branch');
      const wantTuft = hh > 30;   // on the small deep ones the neighbours hide the foot anyway
      const gr = GG.child('foot').rng();   // the tuft's own stream — see limbs() on why
      const tips = limbs(out, counter, rng, GG, tx, ty - hh * 0.42, {
        len0: hh * 0.24, lw0: 1.2, minLen: hh * 0.08, maxDepth: 1,   // a forest is READ as a mass; one fork each is plenty at this size
        col: (x, y, r) => jig(mix('#3f2a16', '#6b5334', r() * 0.6 + haze(x, y) * 0.45), r, 7),
        pathOpts: { len: 3, density: 0.5, jitter: 0.45 },
      });
      // the centre crown keeps the plate's own stream and its full size (so the far country is
      // unchanged); the tip crowns draw from the tree's node, adding to the page without
      // shifting a single mark that comes after it.
      const tipR = GG.child('crowns').rng();
      const crowns = [[tx, ccy, 1, rng]].concat(spreadTips(tips, 2, rr * 0.7).map(t => [t[0], t[1], 0.55, tipR]));
      for (const [kx, kcy, mass, kr] of crowns) {
      const krr = rr * mass;
      strokes(out, counter, {
        rng: kr, n: Math.round(krr * 13),   // trees overlap now — density comes from COUNT, not from marks per tree
        sample: r => { const a2 = r() * Math.PI * 2, d = Math.pow(r(), 0.55);
                       return [kx + Math.cos(a2) * krr * d * 1.1, kcy + Math.sin(a2) * krr * d * 0.8]; },
        dir: (x, y) => Math.atan2(y - kcy, x - kx) + Math.PI / 2,
        col: (x, y, r) => {
          // ⚠ THE SAME RULE AT EVERY DISTANCE. These were the last thing on the page painted
          // the old way — one flat cluster under heavy haze — so they read as pale smooth
          // mushrooms beside the properly lit trees. Distance takes CONTRAST out of a thing;
          // it does not repeal the fact that the light is above it.
          const crown = Math.max(0, Math.min(1, (kcy - y) / (krr * 0.9) * 0.5 + 0.5));
          let c = ramp(['#173420', '#22492a', '#325f30', '#4a7c3a', '#6e9c46', '#9dbf58'],
            crown * 0.85 + gD(x, y) * 0.22 + fbm(x / 9, y / 8, 191) * 0.16 - 0.03);
          c = mix(c, '#f0e6a4', Math.pow(crown, 2.2) * 0.42);   // the sun is yellow
          c = mix(c, '#e8e3c0', haze(x, y) * 0.38);             // and distance only softens it
          return jig(c, r, 9);
        },
        len: 3.4, lw: 1.8, steps: 2, lenJ: 0.75, impasto: 0.55, op: 0.94,
      });
      }
      paintPath(out, counter, rng, [[tx, ty], [tx + (rng() - 0.5) * 3, ty - hh * 0.44]],
        (x, y, r) => jig(mix('#4a3520', '#6d5537', r() * 0.7 + haze(x, y) * 0.5), r, 7), { lw: 1.5, len: 3, density: 0.7, jitter: 0.3 });
      // ⚠ A TRUNK THAT STOPS DEAD ON THE FIELD IS A STICKER, and a hundred of them stopping
      // dead the SAME way is the machine tell. Each grove tree gets its own tuft: its own
      // thickness, length, which side it piles on, how far it skirts, how hard it leans.
      const G = { dens: GG.trait('dens', 0.6, 1.8), len: GG.trait('len', 0.7, 1.65),
                  skirt: GG.trait('skirt', 0.7, 1.7), skew: GG.swing('skew', 0.75),
                  curl: GG.swing('curl', 0.45) };
      if (wantTuft) strokes(out, counter, {
        rng: gr, n: Math.max(9, Math.round(rr * 1.5 * G.dens)),
        sample: r => {
          const b = r() * 2 - 1;
          return [tx + Math.sign(b) * b * b * rr * 1.5 * G.skirt + rr * G.skew * 0.3,
                  ty + (r() - 0.5) * hh * 0.06];
        },
        dir: (x) => -Math.PI / 2 + G.curl * 0.55 + (x - tx) / Math.max(1, rr) * 0.2,
        col: (x, y, r) => {
          const up = Math.max(0, Math.min(1, (ty - y) / Math.max(1, hh * 0.13)));   // tip lit, base deep
          let c = ramp(['#1b3d21', '#28542a', '#3b7433', '#57923c', '#7fb04c'],
            up * 0.7 + gD(x, y) * 0.24 + fbm(x / 7, y / 6, 233) * 0.14);
          c = mix(c, '#f0e6a4', Math.pow(up, 2) * 0.3);
          c = mix(c, '#e8e3c0', haze(x, y) * 0.34);
          return jig(c, r, 8);
        },
        len: hh * 0.09 * G.len, lw: 1.5, steps: 2, lenJ: 0.8, impasto: 0.5, op: 0.95,
      });
    }
  };
  // ⚠ WHERE THE GROVES STAND MUST NOT DEPEND ON HOW MUCH PAINT EACH TREE SPENDS. These were
  // placed from the plate's own stream, so the moment a tree drew a few marks fewer, every
  // grove after it moved — and one rebuild left the whole LEFT SIDE of the far country bare
  // (Fred saw it immediately). Placement now runs on its own stream, and it is STRATIFIED:
  // one grove per slice across the width, jittered inside its slice. The far country cannot
  // come up empty on one side again, whatever the trees do with their brushes.
  // Trees do not stand at even intervals — they gather in COPSES with real meadow between,
  // and a clearing has to look chosen rather than forgotten. One copse per slice of the width
  // (so a side can never go bald by accident), each with its own spread and count, and a few
  // slices left deliberately empty by the page's own genome.
  // ⚠ A FOREST HAS NO BALD SPOTS. Fred: "the formation of the trees are not like real forest
  // though. a forest should be very populated with no bald spots!" Copses with deliberate
  // clearings were right for parkland and wrong for this — the far country is WOODED. So the
  // band from the brow down is filled as a FIELD: a column every few pixels across the whole
  // width, two or three ranks deep in each, jittered so no rank lines up, and nothing skipped
  // but the road itself (onPath, checked per tree inside farGrove). Trees overlap, which is
  // what reads as forest — a tree standing alone in its own gap reads as a shrub in a lawn.
  // Density is one dial: GROVE_N=4 node gen/build.mjs gift.
  const GROVE_N = +(process.env.GROVE_N || 3.4);
  const gRng = mulberry32(seed ^ 0x9e3779b9);
  const NX = Math.max(6, Math.round(10 * GROVE_N));
  for (let i = 0; i < NX; i++) {
    const gx = -34 + (i + 0.12 + gRng() * 0.76) / NX * 888;
    const ranks = 2 + Math.round(gRng() * 1.4);
    for (let r = 0; r < ranks; r++) {
      const d = Math.min(1, (r + 0.1 + gRng() * 0.8) / ranks);   // near ranks come forward
      const gy = crest(gx) + 4 + sward(gx) + Math.pow(d, 1.55) * 168;
      farGrove(gx + (gRng() - 0.5) * 26, gy, 20 + gRng() * 40);
    }
  }
  // ⚠ AN EMPTY LAWN IS AS DEAD AS A SOLID WOOD. What makes an open band read as a PLACE is a
  // few trees standing free in it, throwing their shadows on the grass with nothing crowding
  // them — the specimens the wood cannot give you. They are the shared painter's trees, so
  // each one branches by the same rule, and each takes its own stream so the plate is unmoved.
  const swRng = mulberry32(seed ^ 0x51ed270b);
  for (let i = 0; i < 7; i++) {
    const sx = -10 + swRng() * 820;
    const band = sward(sx);
    const sy = crest(sx) + 10 + swRng() * band * 0.62;
    if (Math.abs(sx - door.x) < 88 || onPath(sx, sy)) continue;   // the way home stays clear
    tree(sx, sy, 26 + swRng() * 20, mulberry32(seed + 977 + i * 131));
  }
  for (let hgt = 0; hgt < 6; hgt++) {                          // hedge lines following the contours
    const x0 = -20 + rng() * 300, x1 = x0 + 180 + rng() * 340;
    strokes(out, counter, {
      rng, n: Math.round((x1 - x0) * 0.9),
      sample: r => { const x = x0 + r() * (x1 - x0);
                     const y = crest(x) + 10 + hgt * 20 + Math.sin(x / 60 + hgt) * 6 + (r() - 0.5) * 7;
                     return (!onPath(x, y) && y > crest(x) + 6) ? [x, y] : null; },
      dir: (x, y) => -Math.PI / 2 + (fbm(x / 10, y / 8, 223) - 0.5) * 0.9,
      col: (x, y, r) => {
        const c0 = mix('#26512a', '#5d8f3f', r() * 0.9);
        return jig(mix(mix(c0, '#eadf9c', r() * 0.22), '#e8e3c0', haze(x, y) * 0.45), r, 9);
      },
      len: 5, lw: 1.6, steps: 2, lenJ: 0.7, impasto: 0.5, op: 0.85,
    });
  }
  for (let f = 0; f < 16; f++) {                               // a flock, because someone keeps this land (Ps 23)
    const sx = 60 + rng() * 680, sy = crest(sx) + 14 + Math.pow(rng(), 1.5) * 130;
    if (Math.abs(sx - 400) < 74 || onPath(sx, sy) || sy < crest(sx) + 10) continue;
    const ss = 0.5 + rng() * 0.45;
    strokes(out, counter, {
      rng, n: 16,
      sample: r => { const a2 = r() * Math.PI * 2, d = Math.pow(r(), 0.6);
                     return [sx + Math.cos(a2) * 6 * ss * d, sy - 2 * ss + Math.sin(a2) * 3.4 * ss * d]; },
      dir: () => 0,
      col: (x, y, r) => jig(mix('#e9e2cd', '#fdf8ec', r() * 0.7), r, 6),
      len: 2.6 * ss, lw: 2 * ss, steps: 2, op: 0.95,
    });
    out.push(`<circle cx="${R1(sx - 6 * ss)}" cy="${R1(sy - 2.4 * ss)}" r="${R1(1.5 * ss)}" fill="#4b4038"/>`); counter.n++;
  }
  {   // the avenue: pairs receding up the way home, plus a scatter beyond it
    const place = [];
    for (let i = 0; i < 7; i++) {
      const t = 0.10 + (1.0 - 0.10) * (i / 6);
      const [px, py] = pathP(t);
      const gap = 22 + 150 * Math.pow(t, 1.3);
      const hh = 16 + 178 * Math.pow(t, 1.5);
      place.push([px - pathW(t) / 2 - gap, py, hh], [px + pathW(t) / 2 + gap, py, hh]);
    }
    for (let i = 0; i < 8; i++) {
      const x = 400 + (rng() < 0.5 ? -1 : 1) * (96 + rng() * 330);
      const y = horizon + 16 + rng() * 300;
      const d = 0.32 + Math.max(0, Math.min(1, (y - horizon) / (H - horizon)));
      place.push([x, y, (18 + 96 * (d - 0.32)) * (0.8 + rng() * 0.5)]);
    }
    place.sort((a, b) => a[1] - b[1]);                       // far trees first — depth is an order
    if (process.env.EMIT_TREES) {
      const keep = place.filter(([x, y, hh]) => !(x < -30 || x > 830 || y < crest(x) + 10 || onPath(x, y) || (x > 236 && x < 564 && y > 392)));
      console.log('TREES_JSON ' + JSON.stringify(keep.map(([x, y, hh], i) => ({
        x: +x.toFixed(0), y: +y.toFixed(0), w: +(hh * 0.30).toFixed(0), h: +hh.toFixed(0),
        seed: 400 + i * 7, pal: 'day', lit: 0.3, phase: +((i * 0.7) % 4).toFixed(1),
      }))));
    }
    // ⚠ NOT PAINTED ANY MORE — these same 19 are swaying sprites now (SCENE1[16].trees in
    // engine/character.js). Painting them here as well would give every one of them a still
    // twin standing beside it.
    for (const [x, y, hh] of (process.env.PAINT_AVENUE ? place : [])) {
      if (x < -30 || x > 830) continue;
      if (y < crest(x) + 10) continue;
      if (onPath(x, y)) continue;
      if (x > 236 && x < 564 && y > 392) continue;           // behind the poem
      tree(x, y, hh, mulberry32(seed + Math.round(x * 7 + y * 13)));
    }
  }
  fgRanges.push([_avf0, out.length]);   // the nearest trees ride the ground they grow in

  // ⚠ NO "STEPS" AT THE THRESHOLD. Four rows of bright strokes centred on the door merged
  // into a fat white dome — a mushroom growing out of the path. The widened road arrives on
  // its own; the gate does not need a doormat.
  /* ---------------- 4. NEAR GRASS + FLOWERS (the FG plane, closest) ---------------- */
  const _fg0 = out.length;
  strokes(out, counter, {
    rng, n: 360,
    sample: rej(-10, 430, 810, 512, (x, y) => !onPath(x, y)),
    dir: () => -Math.PI / 2 + (rng() - 0.5) * 0.5,
    col: (x, y, r) => { const g = gD(x, y); let c = ramp(['#245026', '#4f8c3a', '#7ab04e'], r()); c = mix(c, '#f6ec9a', g * 0.7); c = mix(c, '#08281b', (1 - g) * 0.66); return jig(c, r, 12); },
    len: 20, lw: 3.4, steps: 3, impasto: 0.55, relief: 0.45, lenJ: 0.6,
  });
  // scattered jewel flowers close up
  strokes(out, counter, {                                    // the nearest blades, sharp and dark against the light
    rng, n: 900,
    sample: rej(-6, 438, 806, 512, (x, y) => !onPath(x, y)),
    dir: (x, y) => -Math.PI / 2 + (fbm(x / 9, y / 7, 131) - 0.5) * 1.25,
    col: (x, y, r) => {
      const g = gD(x, y);
      let c = ramp(['#20401f', '#33602c', '#4a7c37', '#6a9a46'], r() * 0.85 + fbm(x / 24, y / 16, 133) * 0.3);
      c = mix(c, '#f4ecac', g * 0.4);
      return jig(chroma(c, x, y, 0.22, 211), r, 9);
    },
    len: (x, y) => 13 + (y - 438) * 0.09, lw: 1.5, steps: 2, lenJ: 0.8, impasto: 0.7,
  });
  fgRanges.push([_fg0, out.length]);

  /* ---------------- layer export ---------------- */
  const ALT = 'A pale path runs from the reader’s feet up a green hill to a radiant open door of gold light standing in the crest — the way home, thrown wide open, warm light spilling all the way down the path; beyond the door a whole world of colour.';
  const RAW = { undercoat: 0, weave: 0, varnish: 0, oil: 0 };
  const setOf = ranges => { const s = new Set(); for (const [a, b] of ranges) for (let i = a; i < b; i++) s.add(i); return s; };
  const pick = ranges => ranges.map(([a, b]) => out.slice(a, b).join('\n')).join('\n');
  const farSet = setOf(farRanges), fgSet = setOf(fgRanges);
  if (LAYER === 'sky') return svgWrap(ALT, out.slice(0, skyEnd).join('\n'), RAW);   // opaque swirling dawn (backmost)
  if (LAYER === 'hills') return svgWrap(ALT, pick(farRanges), RAW);                 // hillcrest + the open door + glory
  if (LAYER === 'fg') return svgWrap(ALT, pick(fgRanges), RAW);                     // near grass + flowers
  if (LAYER === 'land') {                                                           // field + path (everything unclaimed)
    const body = out.filter((_, i) => i >= skyEnd && !farSet.has(i) && !fgSet.has(i)).join('\n');
    return svgWrap(ALT, body, RAW);
  }
  return svgWrap(ALT, out.join('\n'));   // full painting (desktop)
}
