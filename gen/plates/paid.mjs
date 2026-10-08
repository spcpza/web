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
  { name: 'bgB' }, { name: 'bgC' },// two more hands of the same dark — they shimmer with the bed
  { name: 'far' },                // the black sun + its grieving corona, hung high
  { name: 'mid' },                // the hill and the cross of dark wood — still, always
  // ⚠ the poured light and the drops get their own cel so they can be drawn draining and
  // falling while the wood and the hill do not move. The cross does not tremble.
  // ⚠ THREE co-present hands of the same light, cycled by opacity (Fred's design), plus
  // the drops on their own cel because they must actually FALL, which opacity cannot do.
  { name: 'pourA' }, { name: 'pourB' }, { name: 'pourC' },
  { name: 'drops' },
  { name: 'fg' },                 // the small child sheltered at the foot
];

export function paint(E, opts = {}) {
  const {
    mulberry32, fbm, curlV, goldenSpiralV, lightRadial, mix, ramp, jig, strokes, rej,
    paintFigure, paintPath, underpaintCapsules, paintChild, inCap,
    svgWrap, R1, W, H,
    GOLD, GOLD_PALE, GOLD_DEEP, GOLD_HOT, NIGHT, DARKEST,
  } = E;

  const rng = mulberry32(seed);
  const out = [];
  const counter = { n: 0 };
  const LAYER = opts.layer || 'full';
  const fgRanges = [], pourRanges = [], pourA = [], pourB = [], pourC = [];
  const farRanges = [];
  // ⭐ DETAIL PASS (Sep 8). EVERY STROKE DRAWS ITS OWN WIDTH AND LENGTH (Fred: "use no
  // rules, a paint stroke just exist because it exist"). Kept GRAVE: finer, not busier.
  const free = (x, y, salt) => { const n = Math.sin(x * 12.9898 + y * 78.233 + salt) * 43758.5453; return n - Math.floor(n); };
  const widthOf  = (x, y, salt) => 0.40 + 3.2 * Math.pow(free(x, y, salt), 2.6);
  const lengthOf = (x, y, salt) => 0.40 + 1.5 * Math.pow(free(x, y, salt + 17), 1.5);
  out.push(`<rect width="${W}" height="${H}" fill="#0e1228"/>`);   // deep mourning — never black

  /* ---------------- GEOMETRY ---------------- */
  const SUN = { x: 410, y: 114 };                                   // the sun gone dark (Matt 27:45)
  const hillY = x => 350 - 12 * Math.exp(-(((x - 400) / 300) ** 2)) + 6 * Math.sin(x / 140);
  const CX = 400, crossTop = 176, beamY = 250, beamL = 346, beamR = 454;
  const footY = hillY(CX);                                          // where the cross stands in the hill
  /* ⭐ Sep 12 (Fred: "this is art… we just need to make it beautiful"). Golgotha stays barren
     and the grief stays — but a near-black hill under a near-black sky is not sorrow, it is
     mud. Sorrow is drawn with LIGHT that is failing: the poured-out gold at the cross's foot
     now falls on ROCK — boulders on the slope, their crowns lit from the cross and their
     shadows thrown away from it — so the one light left on the page has something to land
     on, and the hill (lifted to a deep indigo, never black) is a PLACE: the skull-hill. */
  const pour = lightRadial(CX, footY - 20, 210);                     // the spent light at the foot, reaching over the rock

  /* ⚠ THIS PAGE IS DRAWN FRAME BY FRAME, AND IT IS THE SLOWEST IN THE BOOK. Nothing here
     may sparkle: it is Golgotha. What moves is what SHOULD move on a page about a price
     being paid — the mourning sky turns over heavily, the light on the cross drains away,
     and the drops fall. The pace is graver than anything else in the story, and that is
     the point: `bridge` is a procession, this is a weight coming down.
     (The lesson from bridge, applied at the start: the frames must differ enough to SEE.
     A change you can only measure is not animation.) */
  const _FRN = Math.max(1, globalThis.__FRAME_N || 6);
  const FR = ((globalThis.__FRAME || 0) % _FRN) / _FRN;      // 0..1 through the loop
  const PH = FR * Math.PI * 2;
  const orb = (r, k = 1) => [Math.cos(PH * k) * r, Math.sin(PH * k) * r * 0.55];
  const [tx, ty] = orb(120);                                  // the grief in the air travels

  /* ---------------- 1. THE MOURNING SKY — darkness over all the land ----------------
     heavy, slow, sorrowful; deep violet-blue, a violet shudder of grief. */
  const skyDir = (x, y) => { const [a, b] = curlV(x + tx, y + ty, 27, 150); const [sa, sb] = goldenSpiralV(x, y, SUN.x, SUN.y, 70, 100); return Math.atan2(b * 50 + sb + 6, a * 50 + sa); };
  const skyCol = (x, y, r) => {
    const d = Math.hypot(x - SUN.x, y - SUN.y);
    let c = ramp(['#141634', '#1e2046', '#2a2654', '#352c58', '#42365e'], Math.min(1, 0.14 + fbm((x + tx) / 110, (y + ty) / 110, 7) * 0.55 + (y / 360) * 0.28));
    if (d > 36 && d < 58 && r() < 0.4) c = mix(c, '#8a6638', 0.55);   // the thin grieving corona
    else if (d < 130 && r() < 0.10) c = mix(c, '#5e4c44', 0.35 * (1 - (d - 58) / 72));   // a dust of the corona's warmth on the nearest cloud
    if (r() < 0.014) c = jig('#5a3a72', r, 14);                       // a violet shudder of grief
    return jig(c, r, 9);
  };
  strokes(out, counter, { rng, n: 2600, sample: rej(-10, -10, 810, 366, (x, y) => y < hillY(x) + 8), dir: skyDir, col: skyCol, len: (x, y) => 26 * lengthOf(x, y, 11), lw: (x, y) => 2.6 * widthOf(x, y, 13), steps: 4, follow: 0.86, wild: 0.08, lenJ: 0.3, wJ: 0.3, impasto: 0.5, relief: 0.35 });
  const skyEnd = out.length;   // BG plane: the mourning sky (opaque, backmost) — the still bed
  /* ⚠ TWO MORE HANDS OF THE SAME DARK. They are the identical sky, drawn by different rngs,
     so their marks fall in different places. Stacked over the bed and cycled out of phase
     (TRI in engine/scene.js) they make the darkness stir: nothing moves and nothing gets
     lighter — the weight simply passes between three hands, which is the one kind of
     motion a field this dark can actually show. */
  const _bgB = out.length;
  strokes(out, counter, { rng: mulberry32(seed + 4401), n: 2600, sample: rej(-10, -10, 810, 366, (x, y) => y < hillY(x) + 8), dir: skyDir, col: skyCol, len: (x, y) => 26 * lengthOf(x, y, 11), lw: (x, y) => 2.6 * widthOf(x, y, 13), steps: 4, follow: 0.86, wild: 0.08, lenJ: 0.3, wJ: 0.3, impasto: 0.5, relief: 0.35 });
  const _bgC = out.length;
  strokes(out, counter, { rng: mulberry32(seed + 8802), n: 2600, sample: rej(-10, -10, 810, 366, (x, y) => y < hillY(x) + 8), dir: skyDir, col: skyCol, len: (x, y) => 26 * lengthOf(x, y, 11), lw: (x, y) => 2.6 * widthOf(x, y, 13), steps: 4, follow: 0.86, wild: 0.08, lenJ: 0.3, wJ: 0.3, impasto: 0.5, relief: 0.35 });
  const bgB = [[_bgB, _bgC]], bgC = [[_bgC, out.length]];

  /* ---------------- 2. THE BLACK SUN — the day turned to night at noon ----------------  [FAR plane] */
  const _far = out.length;
  out.push(`<circle cx="${SUN.x}" cy="${SUN.y}" r="36" fill="#0a0c1e"/>`); counter.n++;
  // ⚠ THE CORONA IS WHAT CARRIES THIS PAGE'S MOTION, and the sky does not.
  // I gave the mourning sky a travelling churn first and measured the result: 0.06% of it
  // changed between frames. A field this dark and this narrow in value CANNOT show motion —
  // the same wall I hit on `lost`. Moving it costs a full extra press per frame and buys
  // nothing, so the dark stays still, which is right anyway: "there was darkness over all
  // the land" is not weather, it is a stillness.
  // The one bright thing here is the thin grieving corona, so IT breathes: its flares reach
  // further and shorter around the ring, and the reach travels round the sun as the loop
  // turns — the last light around a dead sun, wavering.
  strokes(out, counter, {
    rng, n: 190,
    sample: r => {
      const a = r() * Math.PI * 2;
      // ⚠ THE CORONA HOLDS STILL. Making its flares reach in and out was a flicker wearing
      // a costume — Fred called it, twice. A dead sun's last ring does not twinkle.
      const d = 36 + Math.pow(r(), 1.2) * 16;
      return [SUN.x + Math.cos(a) * d, SUN.y + Math.sin(a) * d];
    },
    dir: (x, y) => Math.atan2(y - SUN.y, x - SUN.x) + Math.PI / 2,
    col: (x, y, r) => jig(ramp(['#c69a48', '#a8843e', '#6e5530', '#3a3056'], (Math.hypot(x - SUN.x, y - SUN.y) - 36) / 26), r, 8),
    len: 8, lw: 1.9, steps: 2,
  });
  farRanges.push([_far, out.length]);   // ← the black sun is the FAR plane (parallaxes against the sky on tilt-up)

  /* ---------------- 3. THE HILL — the place of the skull (Golgotha), dark ---------------- */
  // ⚠ this fill used to run M(left) L(right) — a RULER-STRAIGHT line between two
  // endpoints, ignoring the hillY contour entirely. Golgotha stays barren, but a hill
  // is not geometry: sample the contour finely and BREAK it — a skull-hill of rock,
  // the crest jagging in dark broken steps (still no green; this page is the one
  // deliberate barrenness in the book).
  {
    const jag = x => hillY(x) + (Math.sin(x * 0.61) + Math.sin(x * 1.7 + 2.2)) * 2.6 + (rng() - 0.5) * 3.5;
    let d = 'M-2 ' + R1(jag(-2));
    for (let x = 6; x <= 806; x += 8) d += 'L' + x + ' ' + R1(jag(x));
    out.push(`<path d="${d}V504H-2Z" fill="#121838"/>`); counter.n++;   // deep indigo, not black
    // low broken ROCK along the crest — dark violet nubs, each its own value, so the
    // seam reads as stone against the bruised sky instead of a cut
    for (let i = 0; i < 90; i++) {
      const x = -6 + rng() * 812, base = hillY(x) + 2;
      const w = 4 + rng() * 12, h2 = 3 + rng() * 9;
      const c = ['#1a1a3c', '#222046', '#2a254e', '#1c1a34'][Math.floor(rng() * 4)];
      out.push(`<ellipse cx="${R1(x)}" cy="${R1(base - h2 * 0.4)}" rx="${R1(w / 2)}" ry="${R1(h2 / 2)}" fill="${c}"/>`); counter.n++;
    }
  }
  strokes(out, counter, {
    rng, n: 1600, sample: rej(-10, 336, 810, 510, (x, y) => y > hillY(x)),
    dir: x => { const e = 6; return Math.atan2(hillY(x + e) - hillY(x - e), 2 * e); },
    col: (x, y, r) => {
      let c = ramp(['#121838', '#1a2044', '#242c52'], fbm(x / 70, y / 50, 29) * 0.8);
      const g = pour(x, y);
      if (g > 0.03 && r() < 0.55) c = mix(c, '#b08a48', g * 0.55);            // the spent gold on the rock, mark by mark
      return jig(c, r, 7);
    },
    len: (x, y) => 20 * lengthOf(x, y, 31), lw: (x, y) => 2.6 * widthOf(x, y, 33), steps: 3, wild: 0.06, lenJ: 0.3, wJ: 0.3, relief: 0.3,   // ⚠ relief was the default 1 — pills
  });
  // BOULDERS on the skull-hill: a dark body, a crown lit from the cross, a shadow thrown away
  // from it. Golgotha is rock; this is what the failing light has to fall on.
  {
    const brng = mulberry32(seed + 5150);
    for (let i = 0; i < 18; i++) {
      const bx = -6 + brng() * 812, by = hillY(bx) + 12 + Math.pow(brng(), 0.8) * 130;
      if (Math.abs(bx - CX) < 26 && by < footY + 30) continue;                 // never on the cross's foot or the child
      const depth = (by - 340) / 170, bw = (5 + brng() * 14) * (0.5 + depth), bh = bw * (0.45 + brng() * 0.3);
      const lit = pour(bx, by - bh), dx = Math.sign(CX - bx) || 1;
      strokes(out, counter, {
        rng: brng, n: Math.round(bw * 2.2),
        sample: r => { const a = r() * Math.PI * 2, d = Math.sqrt(r()); return [bx + Math.cos(a) * bw * d, by - Math.abs(Math.sin(a)) * bh * d]; },
        dir: (x, y) => Math.atan2(y - by, x - bx) + Math.PI / 2,
        col: (x, y, r) => { const up = Math.max(0, (by - y) / (bh + 0.1)); return jig(mix(mix('#161a38', '#2c2e58', up * 0.7 + r() * 0.2), '#c39a52', lit * Math.max(0, up - 0.25) * (dx * (x - bx) > 0 ? 0.9 : 0.3)), r, 6); },
        len: 3.2, lw: 1.7, steps: 2, lenJ: 0.5, impasto: 0.3, relief: 0.45, op: 0.95,
      });
      paintPath(out, counter, brng, [[bx - bw * 0.8 * dx, by + 1], [bx - bw * 1.7 * dx, by + 2.5]],
        (x, y, r) => jig('#0e1028', r, 4), { lw: 1.8, len: 3, density: 0.7, jitter: 0.5 });
    }
  }

  /* ---------------- 3b. THE ROCKS RENT (Matt 27:51) ----------------
     "and the earth did quake, and the rocks rent" — schizō, the same word as the veil torn
     from the top to the bottom. The verse this page rests on (1 Cor 15:3) says the price;
     Matthew says what the ground did when it was paid. Two rents run from under the cross
     down the skull-hill toward the reader, widening as they come: a crevice deeper than
     any dark on the page, the lip that faces the cross catching the last spent gold, the
     far lip falling into its own shadow, and the broken slab-edges beside it tilted up like
     a floor that has heaved. Nothing here moves — it is what has already happened. */
  {
    const crng = mulberry32(seed + 2751);
    const rents = [
      { pts: [[CX - 12, footY + 34], [CX - 40, footY + 52], [CX - 58, footY + 78], [CX - 96, footY + 98], [CX - 124, footY + 128], [CX - 168, footY + 146], [CX - 196, footY + 172]], side: -1 },
      { pts: [[CX + 18, footY + 44], [CX + 52, footY + 62], [CX + 70, footY + 92], [CX + 112, footY + 108], [CX + 146, footY + 140], [CX + 190, footY + 158]], side: 1 },
    ];
    for (const rent of rents) {
      // the crack's centre line, jagged between the way-points
      const line = [];
      for (let i = 0; i < rent.pts.length - 1; i++) {
        const [ax, ay] = rent.pts[i], [bx, by] = rent.pts[i + 1];
        const segs = 4;
        for (let s = 0; s < segs; s++) {
          const t = s / segs, k = (i * segs + s) / ((rent.pts.length - 1) * segs);
          const nx = -(by - ay), ny = bx - ax, nl = Math.hypot(nx, ny) || 1;
          const j = (crng() - 0.5) * 7 * (0.3 + k);
          line.push([ax + (bx - ax) * t + nx / nl * j, ay + (by - ay) * t + ny / nl * j, k]);
        }
      }
      line.push([...rent.pts[rent.pts.length - 1], 1]);
      const wAt = k => 1.6 + 15 * Math.pow(k, 1.3);                     // hairline under the cross, a gap at your feet
      // the crevice: left and right lips, offset from the centre line
      const L = [], Rr = [];
      for (let i = 0; i < line.length; i++) {
        const [x, y, k] = line[i];
        const [px, py] = line[Math.min(line.length - 1, i + 1)], [qx, qy] = line[Math.max(0, i - 1)];
        const dx = px - qx, dy = py - qy, dl = Math.hypot(dx, dy) || 1;
        const nx = -dy / dl, ny = dx / dl, w = wAt(k) * (0.7 + crng() * 0.6);
        L.push([x + nx * w * 0.5, y + ny * w * 0.5]); Rr.push([x - nx * w * 0.5, y - ny * w * 0.5]);
      }
      const poly = [...L, ...Rr.slice().reverse()].map(p => R1(p[0]) + ' ' + R1(p[1])).join('L');
      out.push(`<path d="M${poly}Z" fill="#06081a"/>`); counter.n++;    // deeper than the hill's own dark
      // inside the rent: a few marks of the deep, so the gap has a floor you cannot quite see
      strokes(out, counter, {
        rng: crng, n: Math.round(line.length * 2.2),
        sample: r => { const i = Math.floor(r() * line.length); const [x, y, k] = line[i]; const w = wAt(k); return [x + (r() - 0.5) * w * 0.6, y + (r() - 0.5) * w * 0.5]; },
        dir: (x, y) => { let best = 0, bd = 1e9; for (let i = 1; i < line.length; i++) { const d = Math.hypot(line[i][0] - x, line[i][1] - y); if (d < bd) { bd = d; best = i; } } return Math.atan2(line[best][1] - line[best - 1][1], line[best][0] - line[best - 1][0]); },
        col: (x, y, r) => jig(mix('#06081a', '#141a3a', r() * 0.5), r, 4),
        len: 4, lw: 1.3, steps: 2, relief: 0.2, flow: 0, op: 0.9,
      });
      // the lip that faces the cross takes the spent gold; the far lip drops into shadow
      // ⚠ first cut: the lit lip was sampled ON the lip and buried the gap — two gold ropes,
      // no crack. The lip marks sit OUTSIDE the gap (offset along the outward normal), the
      // gap stays a gap, and the gold falls off with the pour so the far end is only rock.
      const lip = (pts, outSign, toward) => strokes(out, counter, {
        rng: crng, n: Math.round(pts.length * 2.6),
        sample: r => {
          const i = Math.min(pts.length - 1, Math.floor(r() * pts.length)); const [x, y] = pts[i];
          const [px, py] = line[Math.min(line.length - 1, i + 1)], [qx, qy] = line[Math.max(0, i - 1)];
          const dx = px - qx, dy = py - qy, dl = Math.hypot(dx, dy) || 1;
          const nx = -dy / dl * outSign, ny = dx / dl * outSign;
          const off = 0.6 + r() * (1.2 + wAt(line[i][2]) * 0.3);
          return [x + nx * off + (r() - 0.5) * 2, y + ny * off + (r() - 0.5) * 1.5];
        },
        dir: (x, y) => { let best = 1, bd = 1e9; for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - x, pts[i][1] - y); if (d < bd) { bd = d; best = i; } } return Math.atan2(pts[best][1] - pts[best - 1][1], pts[best][0] - pts[best - 1][0]); },
        col: (x, y, r) => {
          const g = Math.pow(pour(x, y), 1.6);
          let c = toward ? mix('#262a54', '#c9a058', Math.min(0.9, g * 1.1)) : mix('#0a0d22', '#1a1c3c', r() * 0.5);
          if (toward && r() < 0.2) c = mix(c, GOLD_PALE, g * 0.4);
          return jig(c, r, 5);
        },
        len: (x, y) => 3.5 + 4 * lengthOf(x, y, 61), lw: (x, y) => 1.2 + 1.2 * widthOf(x, y, 63) * 0.5, steps: 2, relief: 0.5, impasto: 0.5, flow: 0, op: 0.95,
      });
      // which lip faces the cross: the one nearer CX
      const lipL = L.reduce((s, p) => s + Math.abs(p[0] - CX), 0) < Rr.reduce((s, p) => s + Math.abs(p[0] - CX), 0);
      lip(lipL ? Rr : L, lipL ? -1 : 1, false);   // shadow lip first, the lit lip over it
      lip(lipL ? L : Rr, lipL ? 1 : -1, true);
      // heaved slabs: a few broken plates beside the rent, tilted up, their edges keyed to the light
      for (let i = 0; i < 5; i++) {
        const idx = 3 + Math.floor(crng() * (line.length - 4)), [x, y, k] = line[idx];
        const s = rent.side * (crng() < 0.5 ? 1 : -1), w = (6 + crng() * 12) * (0.4 + k), h2 = w * (0.35 + crng() * 0.25);
        const sx = x + s * (wAt(k) * 0.5 + w * 0.7), sy = y + 2;
        const lit = pour(sx, sy - h2);
        strokes(out, counter, {
          rng: crng, n: Math.round(w * 1.6),
          sample: r => [sx + (r() - 0.5) * w, sy - r() * h2],
          dir: () => Math.atan2(-h2 * 0.35 * s, w) ,
          col: (x2, y2, r) => { const up = Math.max(0, (sy - y2) / (h2 + 0.1)); return jig(mix(mix('#141838', '#2a2c56', up * 0.8), '#c39a52', lit * up * 0.8), r, 5); },
          len: 4, lw: 1.8, steps: 2, relief: 0.5, impasto: 0.35, flow: 0, op: 0.95,
        });
        if (lit > 0.12) paintPath(out, counter, crng, [[sx - s * w * 0.5, sy - h2], [sx + s * w * 0.55, sy - h2 * 0.25]], (x2, y2, r) => jig(mix('#b8935a', '#6a5638', r()), r, 4), { lw: 1.0, len: 3, density: 0.7 * Math.min(1, lit * 1.5), jitter: 0.3 });
      }
      // hairline cracks branching off, and rubble that the quake shook loose
      for (let i = 0; i < 7; i++) {
        const idx = 2 + Math.floor(crng() * (line.length - 3)), [x, y, k] = line[idx];
        const a = Math.atan2(line[idx][1] - line[idx - 1][1], line[idx][0] - line[idx - 1][0]) + (crng() < 0.5 ? 1 : -1) * (0.9 + crng() * 0.9);
        const len = 8 + crng() * 22 * (0.4 + k);
        const seg = [[x, y]]; for (let s = 1; s <= 3; s++) seg.push([x + Math.cos(a) * len * s / 3 + (crng() - 0.5) * 4, y + Math.sin(a) * len * s / 3 + (crng() - 0.5) * 3]);
        paintPath(out, counter, crng, seg, (x2, y2, r) => jig('#07091c', r, 3), { lw: 0.9 + k * 1.2, len: 3, density: 0.95, jitter: 0.25 });
      }
      for (let i = 0; i < 26; i++) {
        const idx = Math.floor(crng() * line.length), [x, y, k] = line[idx];
        const rx = x + (crng() - 0.5) * (14 + 30 * k), ry = y + (crng() - 0.5) * (8 + 14 * k);
        if (ry < hillY(rx) + 4) continue;
        const sz = 0.8 + crng() * 2.4 * (0.4 + k), lit = pour(rx, ry);
        out.push(`<ellipse cx="${R1(rx)}" cy="${R1(ry)}" rx="${R1(sz)}" ry="${R1(sz * 0.6)}" fill="${mix('#1c1e42', '#b89050', lit * 0.7)}"/>`); counter.n++;
      }
    }
  }

  /* ---------------- 4. THE CROSS — dark wood ---------------- */
  out.push(`<rect x="${R1(CX - 6)}" y="${crossTop}" width="12" height="${R1(footY - crossTop)}" fill="#120e1c"/>`); counter.n++;
  out.push(`<rect x="${beamL}" y="${R1(beamY - 6)}" width="${beamR - beamL}" height="12" fill="#120e1c"/>`); counter.n++;
  strokes(out, counter, {
    rng, n: 130,
    sample: r => (r() < 0.62 ? [CX + (r() + r() - 1) * 6, crossTop + r() * (footY - crossTop)] : [beamL + r() * (beamR - beamL), beamY + (r() + r() - 1) * 6]),
    dir: (x, y) => (Math.abs(x - CX) < 8 ? -Math.PI / 2 : 0),
    col: (x, y, r) => jig(mix('#1a1428', '#3a2e44', r() * 0.6), r, 6), len: 9, lw: 2.2, steps: 2,
  });

  /* ⚠ THREE HANDS OF THE LIGHT, ALL PRESENT AT ONCE. Fred, exactly: "i want all 3 to be
     visible. so if you say picture a b c, a 50% opacity, b 50% opacity, c 100% opacity;
     frame 2 a 50%, b 100%, c 50%; a 100%, b 50%, c 50%."
     That is a different animal from what I kept building. A CAROUSEL swaps one drawing for
     another, and however well each is drawn the eye sees a change-over. Stack all three and
     ride their OPACITIES out of phase, and nothing ever appears or disappears — the same
     light simply takes weight from one hand to the next, and it sparkles where the three
     disagree. It is also cheap: three drawings in one press, no frame builds at all, and
     the motion lives in three CSS opacity cycles (see `.dio-tri` in engine/scene.js).
     Each hand is the same shape drawn by a different rng, so their marks land in different
     places — which is precisely what makes the sparkle. */
  const pourHand = (sd, rngH) => {
    const runs = 5;
    for (let i = 0; i < runs; i++) {
      const off = (Math.sin((i + sd) * 12.9898) * 43758.5453) % 1;
      const u = ((off % 1) + 1) % 1;
      const y0 = beamY + u * (footY + 14 - beamY);
      const L = 26 + u * 54, w = 7 - u * 4.5;
      const x0 = CX + Math.sin((i + sd) * 2.7) * 9;
      strokes(out, counter, {
        rng: rngH, n: Math.round(52 + L * 0.7),
        sample: r => [x0 + (r() + r() - 1) * w, y0 + Math.pow(r(), 0.8) * L],
        dir: () => Math.PI / 2,
        col: (x, y, r) => {
          const t = Math.max(0, Math.min(1, (y - y0) / L));
          return jig(ramp([GOLD_HOT, GOLD_PALE, GOLD, GOLD_DEEP, '#6a5238'], t * 0.85 + u * 0.3), r, 7);
        },
        len: 13, lw: 2.8, steps: 3, follow: 0.98, lenJ: 0.5, impasto: 0.35, op: 0.9 - u * 0.45,
      });
    }
    strokes(out, counter, {          // the beam keeps its own light in every hand
      rng: rngH, n: 220,
      sample: r => { const x = beamL + r() * (beamR - beamL); return [x, beamY + (r() + r() - 1) * 8]; },
      dir: () => 0,
      col: (x, y, r) => jig(ramp([GOLD_HOT, GOLD_PALE, GOLD, GOLD_DEEP], Math.abs(x - CX) / 60 + r() * 0.15), r, 7),
      len: 12, lw: 2.8, steps: 3, follow: 0.98, lenJ: 0.5, impasto: 0.4,
    });
  };
  const _pourA = out.length; pourHand(0, mulberry32(seed + 7101));
  const _pourB = out.length; pourHand(1, mulberry32(seed + 7202));
  const _pourC = out.length; pourHand(2, mulberry32(seed + 7303));
  pourA.push([_pourA, _pourB]); pourB.push([_pourB, _pourC]); pourC.push([_pourC, out.length]);

  // a spent, dim pool of the last light on the dark ground at the foot
  strokes(out, counter, {
    rng, n: 120,
    sample: r => { const a = r() * Math.PI, d = Math.pow(r(), 1.3) * 64; return [CX + Math.cos(a + Math.PI) * d * 1.3, footY + 2 + Math.abs(Math.sin(a)) * d * 0.3]; },
    dir: () => 0.04,
    col: (x, y, r) => { const d = Math.hypot((x - CX) / 1.3, (y - footY) * 3); return jig(ramp(['#6a5230', '#4a3c3e', '#2a2440', '#161a34'], d / 70), r, 8); },
    len: 11, lw: 2.6, steps: 2,
  });

  /* ---------------- 6. DROPS OF DEEP RED — the price (the blood) ---------------- */
  // ⚠ THE DROPS FALL. Each one's HEIGHT comes from the frame, and each has its own start
  // and its own speed (evenly spaced drops at one speed would step in place — the same
  // wagon-wheel that hid the motion on `bridge`). They wrap: as one lands another leaves
  // the beam, and the price goes on being paid for as long as you watch.
  const _drops = out.length;
  // ⚠ FOUR DROPS, NOT TEN. Ten small ones falling at once is the leaf-gust again; a price
  // is paid drop by drop, and you should be able to follow ONE of them all the way down.
  for (let i = 0; i < 4; i++) {
    const off = (Math.sin(i * 12.9898) * 43758.5453) % 1;
    const spd = 0.7 + ((Math.sin(i * 78.233) * 12345.6789) % 1) * 0.35;
    const u = (((off + FR * spd) % 1) + 1) % 1;                    // 0 at the beam, 1 at the ground
    const dx = CX + (Math.sin(i * 3.1) * 0.5) * 30;
    const dy = beamY + 8 + u * (footY - beamY + 30);
    const len = 7 + u * 10;                                         // it stretches as it falls
    paintPath(out, counter, rng, [[dx, dy], [dx + 0.8, dy + len]],
      (x, y, r) => jig(mix('#8a1c1c', '#b83030', r()), r, 8),
      { lw: 3.0, len: 3.2, density: 1, jitter: 0.2 });
    // and it strikes: a small dark bloom on the ground where it lands
    if (u > 0.88) {
      const k = (u - 0.88) / 0.12;
      out.push(`<ellipse cx="${R1(dx)}" cy="${R1(footY + 24)}" rx="${(3 + k * 7).toFixed(1)}" ry="${(1 + k * 2).toFixed(1)}" fill="#6a1414" opacity="${(0.5 * (1 - k)).toFixed(2)}"/>`);
      counter.n++;
    }
  }
  pourRanges.push([_drops, out.length]);   // the DROPS keep falling on their own frames

  /* ---------------- 7. THE CHILD — sheltered at the foot, in your place ----------------  [FG plane] */
  const _fgChild = out.length;
  {
    const cx = CX + 32, fy = hillY(cx) + 2;
    // HAND-BUILT curled child (no personCaps — it can't pose a curl). The most
    // tender pose: knees folded up to the chest, head bowed in grief, arms drawn
    // close around the knees. Cute-chunky: big round head, short torso, chunky
    // articulated legs (thigh+shin, knee bent tight) + arms (elbow bent).
    // h≈28; head r≈3.7, torso r≈3.0, leg r≈2.2, arm r≈1.7.
    // THE MAIN CHARACTER — the little pilgrim, curled small and sheltered at
    // the foot of the cross, hem pooled, eyes closed
    E.paintMask(out, counter, rng, {
      x: cx, y: fy, h: 26, facing: -1, kneel: true, lean: -2,
      mood: 'sad', shadow: 0.2,
    });
  }
  fgRanges.push([_fgChild, out.length]);   // ← the child at the foot is foreground

  /* ---------------- EGG: 1 Cor 15:3 in ORIGINAL KOINE GREEK, cut into the dark hill ----------------
     ΙΕʹ·Γʹ (ΙΕ=15, Γ=3): "Christ died for our sins according to the scriptures." */
  {
    E.inscriptionText(out, E.greekRef(15, 3), { x: 160, y: 470, h: 18, body: '#cdd4ea', edge: '#10162c', op: 0.8, edgeOp: 0.5 });
  }

  // MULTIPLANE: assemble the requested depth plane (transparent where empty).
  const ALT = 'Darkness over all the land at noon: a sun gone black with only a thin grieving corona of dim gold, a heavy mourning violet-blue sky, and on a dark hill a cross of dark wood from which the gold Light clings and pours out, draining and spent into the dark; drops of deep red fall from it, and at its foot a small child in red is curled and sheltered. From under the cross two rents run down the hill toward you, the rock split open, the lip nearest the cross catching the last of the gold. The whole price paid, in your place. Deep sorrow.';
  const RAW = { undercoat: 0, weave: 0, varnish: 0, oil: 0 };
  const pick = ranges => ranges.map(([a, b]) => out.slice(a, b).join('\n')).join('\n');
  const claimed = new Set();
  for (const [a, b] of fgRanges) for (let i = a; i < b; i++) claimed.add(i);
  for (const [a, b] of farRanges) for (let i = a; i < b; i++) claimed.add(i);
  if (LAYER === 'bg') return svgWrap(ALT, out.slice(0, skyEnd).join('\n'), RAW);    // mourning sky (opaque bed)
  if (LAYER === 'bgB') return svgWrap(ALT, pick(bgB), RAW);                        // second hand of the dark
  if (LAYER === 'bgC') return svgWrap(ALT, pick(bgC), RAW);                        // third hand
  if (LAYER === 'far') return svgWrap(ALT, pick(farRanges), RAW);                   // the black sun
  if (LAYER === 'fg') return svgWrap(ALT, pick(fgRanges), RAW);                     // the child
  if (LAYER === 'pourA') return svgWrap(ALT, pick(pourA), RAW);                    // hand A of the light
  if (LAYER === 'pourB') return svgWrap(ALT, pick(pourB), RAW);                    // hand B
  if (LAYER === 'pourC') return svgWrap(ALT, pick(pourC), RAW);                    // hand C
  if (LAYER === 'drops') return svgWrap(ALT, pick(pourRanges), RAW);               // the falling drops
  if (LAYER === 'mid') {                                                            // hill, cross, egg
    const pourSet = new Set();
    for (const rr of [pourRanges, pourA, pourB, pourC, bgB, bgC]) for (const [a, b] of rr) for (let i = a; i < b; i++) pourSet.add(i);
    const body = out.filter((_, i) => i >= skyEnd && !claimed.has(i) && !pourSet.has(i)).join('\n');
    return svgWrap(ALT, body, RAW);
  }
  return svgWrap(ALT, out.join('\n'));             // full painting (desktop)
}
