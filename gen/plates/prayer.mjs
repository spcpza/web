// gen/plates/prayer.mjs — "Prayer — talking back to C" (§15)
// A night room in Rhône blues. The red child kneels at a bed, head bowed.
// A thread of small gold lights rises from the clasped hands to the top of
// the frame — and a wider, softer gold descends AROUND the child like a
// wrap. The wrap is the plate's one light source: the answer that is presence.
//
// Paint order (= rng order — append only):
//   1. ROOM DARK   — walls and floor in deep Rhône blues
//   2. LIGHT MODEL — the descending wrap column, soft, centered on the child
//   3. WINDOW      — a small night window, far stars (dim, never competing)
//   4. BED         — dark mass, blanket contour strokes, pale pillow
//   5. THE WRAP    — broad soft gold descending arcs enclosing the child
//   6. THE THREAD  — small rising lights; three brighter knots (ask/seek/knock)
//   7. THE CHILD   — kneeling silhouette in deep red, gold rim from above
//   8. EGGS        — a faint "7:7" in the wall shadow

export const name = 'prayer';
export const title = 'Prayer';
export const caption = "Sometimes the answer is 'I'm here'.";
export const seed = 20260615;
export const focal = { x: 432, y: 330 }; // portrait window: the kneeling child at the bed
// MOBILE 3D — depth planes (FAR→NEAR): the dark room + the window behind; the
// bed, the descending wrap of light and the rising thread in the middle; the
// kneeling child closest. Tilt to look around the room and up the thread.
export const layers = [
  { name: 'bg', opaque: true },   // the dark room walls/floor + the window (backmost)
  { name: 'far' },                // the bed — a mass the child kneels in front of
  { name: 'mid' },                // the descending wrap of light + the rising thread
  { name: 'fg' },                 // the kneeling child (closest)
];

export function paint(E, opts = {}) {
  const {
    mulberry32, fbm, curlV, mix, ramp, jig, strokes, rej, ribbon,
    paintFigure, paintPath, inCap, underpaintCapsules, paintChild, castShadow, svgWrap, R1, W, H,
    GOLD, GOLD_PALE, GOLD_DEEP, GOLD_HOT, NIGHT, DARKEST,
  } = E;

  const rng = mulberry32(seed);
  const out = [];
  const counter = { n: 0 };
  const LAYER = opts.layer || 'full';
  const fgRanges = [];
  const farRanges = [];

  // POST-RESURRECTION FLIP: you prayed in the dark, and the Light FLOODED the
  // room. Background light, the child a dark silhouette kneeling inside the
  // brightness — the answer is presence, and presence fills everything.
  out.push(`<defs><radialGradient id="flood15" cx="0.54" cy="0.16" r="0.74">
<stop offset="0" stop-color="#fff4d8"/>
<stop offset="0.24" stop-color="#cda878"/>
<stop offset="0.5" stop-color="#42466e"/>
<stop offset="1" stop-color="#101636"/>
</radialGradient></defs>`);
  out.push(`<rect width="${W}" height="${H}" fill="url(#flood15)"/>`);

  /* ---------------- 2 (early). LIGHT MODEL ---------------- */
  // The wrap: a soft column of presence descending from above the frame,
  // settling around the kneeling child. Spine from (470,-40) to (435,330).
  const childC = [432, 332];               // heart of the kneeling child
  const wrapPt = t => [470 - 38 * t * t, -40 + 380 * t];
  const lightAt = (x, y) => {
    let g = 0;
    for (let i = 0; i <= 8; i++) {
      const t = i / 8, p = wrapPt(t);
      // widens and strengthens as it comes down to the child
      g = Math.max(g, (0.12 + 0.88 * t * t) * Math.exp(-Math.hypot(x - p[0], y - p[1]) / (40 + 72 * t)));
    }
    return Math.min(1, g);
  };

  /* ---------------- 1. ROOM DARK ---------------- */
  const floorY = 352; // wall/floor seam
  // wall flow: nearly vertical, breathed on by curl noise (paint hung in dark air)
  const wallDir = (x, y) => {
    const [vx, vy] = curlV(x, y, 21, 130);
    return Math.atan2(1 + vy * 2.0, vx * 2.0 + 0.06);
  };
  const slash = (x, y) => 0.13 + lightAt(x, y) * 0.34;
  const wallCol = (x, y, r) => {
    const g = lightAt(x, y);
    // the wall is bright now — warm cream where the flood reaches, cool light elsewhere
    // a DARK room — bright (warm gold) ONLY where the light floods, so the light
    // reads as truly brilliant against the dark (chiaroscuro)
    let c = ramp(['#0e1430', '#172148', '#27407e', '#5a6aa0'], Math.min(1, g * 1.25 + fbm(x / 110, y / 110, 33) * 0.22));
    c = g > 0.34 ? mix(c, '#f4e6b6', (g - 0.34) * 1.2) : c;
    return jig(c, r, 9);
  };
  // deep long rakes, then the wall texture proper — all luminous now
  strokes(out, counter, { rng, n: 700, sample: rej(-10, -10, 810, floorY + 8), dir: wallDir, col: (x, y, r) => jig(mix(ramp(['#0c1228', '#141d40', '#1f2e54'], fbm(x / 140, y / 140, 7)), '#c9a050', lightAt(x, y) * 0.35), r, 8), len: 42, lw: 5.2, steps: 4, follow: 0.85, wild: 0.08, aJ: slash, lenJ: 0.55 });
  strokes(out, counter, { rng, n: 1250, sample: rej(-10, -10, 810, floorY + 4), dir: wallDir, col: wallCol, len: 24, lw: 3.4, steps: 3, follow: 0.9, wild: 0.24, aJ: slash, lenJ: 0.5, impasto: 0.55 });
  // floor: horizontal boards raking toward the viewer, catching the wrap's pool
  strokes(out, counter, {
    rng, n: 950,
    sample: rej(-10, floorY - 4, 810, 510),
    dir: (x, y) => (x < W / 2 ? 0.06 : -0.06) + (fbm(x / 90, y / 50, 41) - 0.5) * 0.16,
    col: (x, y, r) => {
      const g = lightAt(x, y) + Math.max(0, 0.42 - Math.hypot(x - childC[0], (y - 384) * 1.8) / 280);
      // a dark floor — a warm pool only where the light falls around the child
      let c = ramp(['#0e1530', '#1a2550', '#2a3a6e'], fbm(x / 70, y / 40, 47) * 0.8);
      c = mix(c, '#a8853e', Math.min(1, g) * 0.6);
      return jig(c, r, 10);
    },
    len: 30, lw: 3.8, steps: 3, follow: 0.9, wild: 0.2, aJ: 0.1, lenJ: 0.55, impasto: 0.58,
  });

  /* ---------------- 3. WINDOW ---------------- */
  // a small night window far left — the Rhône outside; dim, it must not compete
  const win = { x0: 76, y0: 64, x1: 178, y1: 196 };
  strokes(out, counter, {
    rng, n: 240,
    sample: rej(win.x0, win.y0, win.x1, win.y1),
    dir: (x, y) => { const [vx, vy] = curlV(x, y, 61, 60); return Math.atan2(vy, vx + 0.35); },
    col: (x, y, r) => jig(ramp(['#16224a', '#27407e', '#34518f'], fbm(x / 40, y / 40, 53)), r, 9),
    len: 13, lw: 2.6, steps: 3, wild: 0.12, aJ: 0.2,
  });
  // two far stars over the river — tiny, hushed gold
  for (const [sx, sy] of [[104, 92], [150, 118]]) {
    strokes(out, counter, {
      rng, n: 22,
      sample: r => { const a = r() * Math.PI * 2, d = 1 + r() * 6; return [sx + Math.cos(a) * d, sy + Math.sin(a) * d * 0.8]; },
      dir: (x, y) => Math.atan2(x - sx, -(y - sy)),
      col: (x, y, r) => jig(ramp([GOLD_PALE, GOLD_DEEP, '#6a5c36'], Math.hypot(x - sx, y - sy) / 7), r, 8),
      len: 4, lw: 1.4, steps: 2,
    });
  }
  // window frame: dark mullions over the blue
  out.push(`<path d="M${win.x0} ${win.y0}H${win.x1}V${win.y1}H${win.x0}Z M${R1((win.x0 + win.x1) / 2)} ${win.y0}V${win.y1} M${win.x0} ${R1((win.y0 + win.y1) / 2)}H${win.x1}" stroke="#0d1326" stroke-width="7" fill="none" opacity="0.95"/>`);
  counter.n++;

  /* ---------------- 3b. LIFE: ONE MOTH on the night glass ---------------- */
  // 2 Cor 12:9 "my strength is made perfect in weakness" — the frailest flier
  // there is, pressed to the dark glass from outside, drawn to the light of
  // this room the way the child is drawn to His presence. Pale cream against
  // the blue pane (lower-right pane, clear of both stars and both mullions).
  const moth = { x: 150, y: 162 };
  // wings: two upswept fans of short curved strokes (living thing = curves)
  for (const s of [-1, 1]) {
    strokes(out, counter, {
      rng, n: 30,
      sample: r => { const a = -Math.PI / 2 + s * (0.25 + r() * 0.85), d = 2.5 + r() * 8.5; return [moth.x + Math.cos(a) * d, moth.y - 2 + Math.sin(a) * d * 0.85]; },
      dir: (x, y) => Math.atan2(y - (moth.y + 2), x - moth.x),
      col: (x, y, r) => jig(ramp(['#f2e8ca', GOLD_PALE, '#b4a268'], Math.hypot(x - moth.x, y - moth.y + 2) / 11), r, 8),
      len: 4.5, lw: 1.7, steps: 2, wild: 0.22, lenJ: 0.4,
    });
  }
  // slim body, a shade deeper than the wings
  strokes(out, counter, {
    rng, n: 10,
    sample: r => [moth.x + (r() - 0.5) * 2.5, moth.y - 3 + r() * 10],
    dir: () => Math.PI / 2,
    col: (x, y, r) => jig(mix('#8a7340', GOLD_DEEP, r() * 0.5), r, 8),
    len: 4, lw: 1.6, steps: 2,
  });
  // the one accent: a hot fleck at the head — the light it came for
  strokes(out, counter, {
    rng, n: 6,
    sample: r => [moth.x + (r() - 0.5) * 3, moth.y - 5 + (r() - 0.5) * 3],
    dir: () => -Math.PI / 2,
    col: (x, y, r) => jig(mix(GOLD, GOLD_HOT, r()), r, 6),
    len: 2.5, lw: 1.3, steps: 1,
  });
  // two thread-fine antennae, curved toward the room
  out.push(`<path d="M149 155 Q146 149 143 146 M151 155 Q154 149 157 146" stroke="#e8dcc0" stroke-width="1.1" fill="none" opacity="0.75"/>`);
  counter.n++;

  /* ---------------- 3c. LIFE: a green sprig in a cup ---------------- */
  // "My grace is sufficient for thee" — life kept alive through a dark season:
  // a small cup on the floor at the child's left, one green sprig still growing,
  // leaning toward the wrap's light. Floor sits in the bg plane, so the cup
  // stays connected to the boards it stands on.
  const cup = { x: 318, y: 412 };
  // the cup is a made thing — straight lines (Munch); pale ceramic so it reads
  // against the dark boards, gold lip, warm lit side facing the wrap
  out.push(`<path d="M310 398L312.5 413L324.5 413L327 398Z" fill="#3d4d80" opacity="0.96"/>`);
  counter.n++;
  out.push(`<path d="M310 398L327 398" stroke="${GOLD_DEEP}" stroke-width="2" opacity="0.95"/>`);
  counter.n++;
  out.push(`<path d="M323.5 399.5L322 412" stroke="#b08a44" stroke-width="2.2" opacity="0.85"/>`);
  counter.n++;
  // the sprig: curved living stems rising from inside the cup, bending to the light
  strokes(out, counter, {
    rng, n: 34,
    sample: r => { const t = r(); return [cup.x + 1 + t * t * 4 + (r() - 0.5) * 5, cup.y - 12 - t * 22 + (r() - 0.5) * 3]; },
    dir: (x, y) => -Math.PI / 2 + (x - cup.x) * 0.05 + (fbm(x / 10, y / 10, 91) - 0.5) * 0.5,
    col: (x, y, r) => jig(mix(ramp(['#4e7a3a', '#7fae5a', '#a8cc6e'], (cup.y - 14 - y) / 22), '#cdbb6a', Math.max(0, x - cup.x) / 20), r, 9),
    len: 6, lw: 1.8, steps: 2, wild: 0.25, follow: 0.8,
  });
  // leaf flicks off the stems, brighter — bright greens only (night rule)
  strokes(out, counter, {
    rng, n: 14,
    sample: r => { const t = 0.35 + r() * 0.6; return [cup.x + 1 + (r() < 0.5 ? -1 : 1) * (3 + r() * 5), cup.y - 14 - t * 20]; },
    dir: (x, y) => (x > cup.x + 1 ? -0.5 : Math.PI + 0.5) + (fbm(x / 8, y / 8, 93) - 0.5) * 0.4,
    col: (x, y, r) => jig(mix('#8fbc62', '#b8d878', r()), r, 9),
    len: 5, lw: 2, steps: 2, wild: 0.2,
  });
  const skyEnd = out.length;   // BG plane: the dark room + the window (opaque, backmost)

  /* ---------------- 4. THE BED ----------------  [FAR plane] */
  const _far = out.length;
  // bed top surface runs from the child's hands rightward; dark mass below
  const bedTopY = x => 330 + (x - 450) * 0.045 + 4 * Math.sin(x / 70);
  const inBed = (x, y) => x > 446 && x < 700 && y > bedTopY(x) && y < 420;
  // solid silhouette base so the bed reads as a mass against the busy wall
  {
    let d = `M446 ${R1(bedTopY(446))}`;
    for (let x = 458; x <= 700; x += 12) d += `L${x} ${R1(bedTopY(x))}`;
    d += `L700 422L446 424Z`;
    out.push(`<path d="${d}" fill="#0c1226" opacity="0.92"/>`);
    counter.n++;
  }
  // dark bulk
  strokes(out, counter, {
    rng, n: 420,
    sample: rej(446, 312, 704, 424, inBed),
    dir: x => { const e = 6; return Math.atan2(bedTopY(x + e) - bedTopY(x - e), 2 * e); },
    col: (x, y, r) => {
      const g = lightAt(x, y);
      let c = mix('#101730', '#222d52', fbm(x / 60, y / 30, 59) * 0.9);
      return jig(mix(c, '#96763a', g * 0.5), r, 8);
    },
    len: 24, lw: 4.4, steps: 3, wild: 0.14, lenJ: 0.5, aJ: 0.12,
  });
  // blanket folds: contour strokes draped down the near side
  strokes(out, counter, {
    rng, n: 260,
    sample: rej(446, 330, 704, 426, (x, y) => y > bedTopY(x) + 6),
    dir: (x, y) => Math.PI / 2 - 0.18 + (fbm(x / 30, y / 30, 67) - 0.5) * 0.5,
    col: (x, y, r) => jig(mix('#141d3c', '#2c3a68', fbm(x / 24, y / 24, 71)), r, 9),
    len: 15, lw: 3, steps: 3, wild: 0.1, aJ: 0.15,
  });
  // pillow: a paler loaf near the child's end, breathing the wrap's gold
  strokes(out, counter, {
    rng, n: 120,
    sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 0.8); return [486 + Math.cos(a) * 34 * d, 326 + Math.sin(a) * 11 * d]; },
    dir: () => 0.05,
    col: (x, y, r) => jig(mix(mix('#3a4a7a', '#56689c', fbm(x / 20, y / 20, 73)), '#bfa468', lightAt(x, y) * 0.6), r, 9),
    len: 11, lw: 2.6, steps: 2, aJ: 0.12,
  });
  // gold rim along the bed's top edge, brightest where the child's hands rest
  strokes(out, counter, {
    rng, n: 90,
    sample: r => { const x = 448 + Math.pow(r(), 1.6) * 220; return [x, bedTopY(x) + (r() - 0.5) * 5]; },
    dir: x => { const e = 6; return Math.atan2(bedTopY(x + e) - bedTopY(x - e), 2 * e); },
    col: (x, y, r) => jig(ramp([GOLD, GOLD_DEEP, '#6e5c34', '#2a3050'], (x - 448) / 200), r, 9),
    len: 9, lw: 2, steps: 2, aJ: 0.1,
  });
  // bed legs / frame shadow line
  out.push(`<path d="M${452} ${R1(bedTopY(452) + 88)}L${452} ${R1(bedTopY(452) + 64)} M${694} ${R1(bedTopY(694) + 86)}L${694} ${R1(bedTopY(694) + 60)}" stroke="#0d1326" stroke-width="6" stroke-linecap="round" fill="none"/>`);
  counter.n++;
  farRanges.push([_far, out.length]);   // ← the bed is the FAR plane (the child kneels in front of it)

  /* ---------------- 8 (under the wrap). EGG: "7:7" in the wall shadow ---------------- */
  // Matthew 7:7 — ask, seek, knock — whispered one shade above the night, far right
  // Matthew 7:7 (ask, seek, knock) in ORIGINAL KOINE GREEK numerals, Ζʹ·Ζʹ (Ζ=7),
  // whispered one shade above the night in the wall shadow, far right.
  E.inscriptionText(out, E.greekRef(7, 7), { x: 700, y: 278, h: 20, body: '#cfd6e8', edge: '#16203c', op: 0.8, edgeOp: 0.5 });

  /* ---------------- 5. THE WRAP ---------------- */
  // broad, soft gold descending around the child — enclosing arcs, never a beam.
  // Strokes orbit the wrap spine, bending downward and inward like folded wings.
  strokes(out, counter, {
    rng, n: 470,
    sample: r => {
      const t = Math.pow(r(), 0.42);                // bias hard toward the child
      const p = wrapPt(t);
      const spread = 26 + 46 * t;                   // widens descending, stays slim
      let off = (r() + r() - 1) * spread;
      if (Math.abs(off) < 13) off += off >= 0 ? 13 : -13; // hollow heart: the child sits inside
      return [p[0] + off, p[1] + (r() - 0.5) * 22];
    },
    dir: (x, y) => {
      // enclosing arcs: tangential drift around the child, settling downward
      const dx = x - childC[0], dy = y - childC[1];
      const d = Math.hypot(dx, dy) + 1e-6;
      const around = Math.max(0.25, 1 - d / 260);
      return Math.atan2((dx > 0 ? -dx : dx) / d * 0 + 1.0, (-dy / d) * around * (dx > 0 ? 1 : -1) + (fbm(x / 40, y / 40, 83) - 0.5) * 0.7);
    },
    col: (x, y, r) => {
      const g = lightAt(x, y);
      // the wrap is soft: gold sinking into blue at its edges, never white-hot
      return jig(ramp(['#0f1734', mix('#27407e', GOLD_DEEP, 0.3), mix(GOLD_DEEP, '#8a7340', 0.45), mix(GOLD, GOLD_DEEP, 0.4), GOLD], Math.min(1, g * 1.1)), r, 10);
    },
    len: 15, lw: 2.6, steps: 3, follow: 0.9, wild: 0.14, aJ: 0.2, lenJ: 0.5, impasto: 0.6,
  });
  // the wrap's hem pooling on the floor around the kneeling child
  strokes(out, counter, {
    rng, n: 190,
    sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 1.2); return [childC[0] + Math.cos(a) * 96 * d, 384 + Math.sin(a) * 22 * d]; },
    dir: () => 0.04,
    col: (x, y, r) => { const d = Math.hypot(x - childC[0], (y - 384) * 3); return jig(ramp([GOLD, GOLD_DEEP, '#7a6334', '#1a2550'], d / 120), r, 9); },
    len: 12, lw: 2.6, steps: 2, aJ: 0.1,
  });

  /* ---------------- 6. THE THREAD ---------------- */
  // small gold lights rising from the clasped hands to the top of the frame —
  // a bead-string of short upward flicks, thinning with height
  const hands = [447, 316];
  const thr = t => { // gentle leftward ascent, clear of the wrap's heart
    const u = 1 - t;
    return [u * u * hands[0] + 2 * u * t * 392 + t * t * 428, u * u * hands[1] + 2 * u * t * 150 + t * t * -16];
  };
  strokes(out, counter, {
    rng, n: 130,
    sample: r => { const t = r(); const p = thr(t); return [p[0] + (r() - 0.5) * (10 - 6 * t), p[1] + (r() - 0.5) * 8]; },
    dir: (x, y) => { // tangent of nearest thread point, pointing up
      let bt = 0, bd = 1e9;
      for (let t = 0; t <= 1; t += 0.08) { const p = thr(t); const d = Math.hypot(x - p[0], y - p[1]); if (d < bd) { bd = d; bt = t; } }
      const a = thr(Math.max(0, bt - 0.03)), b = thr(Math.min(1, bt + 0.03));
      return Math.atan2(b[1] - a[1], b[0] - a[0]);
    },
    col: (x, y, r) => jig(ramp([GOLD_PALE, GOLD, GOLD_DEEP], r() * 0.9), r, 9),
    len: 6.5, lw: 1.7, steps: 2, lenJ: 0.5, wJ: 0.4,
  });
  // egg + meaning: exactly THREE brighter knots on the thread — ask, seek, knock
  for (const t of [0.22, 0.52, 0.82]) {
    const p = thr(t);
    strokes(out, counter, {
      rng, n: 26,
      sample: r => { const a = r() * Math.PI * 2, d = 1 + r() * 6.5; return [p[0] + Math.cos(a) * d, p[1] + Math.sin(a) * d * 0.85]; },
      dir: (x, y) => Math.atan2(x - p[0], -(y - p[1])),
      col: (x, y, r) => jig(ramp([GOLD_HOT, GOLD_PALE, GOLD_DEEP], Math.hypot(x - p[0], y - p[1]) / 7.5), r, 7),
      len: 4.5, lw: 1.6, steps: 2,
    });
  }

  /* ---------------- 7. THE CHILD ----------------  [FG plane] */
  const _fgChild = out.length;
  // kneeling at the bedside, head bowed onto clasped hands; deep red, all dark
  // HAND-BUILT kneeling child (no personCaps — it can't pose a kneel). Reverent:
  // knees on the floor, thighs folded up, shins back along the floor, torso upright
  // and leaning slightly onto the bed (to the right), head BOWED, both arms raised
  // and clasped resting on the bed edge. Cute-chunky + articulated.
  // h≈84; head r≈9, torso r≈6, thigh/shin r≈4.5, arm r≈3.2. Bed edge at (446,330).
  const hipx = 430, hipy = 358;       // hips, sitting back on the heels — a FULL kneel
  const shx = 433, shy = 314;         // shoulders, torso upright, leaning toward the bed
  const hcx = 434, hcy = 301;         // head ball, bowed toward the clasped hands
  const kneex = 424, kneey = 388;     // knee bent SHARPLY, down on the floor (clear ~90° bend)
  const footx = 386, footy = 390;     // shin folded fully BACK along the floor — a deep kneel
  const handx = 460, handy = 338;     // both hands clasped, reaching further onto the bed (longer arms)
  const elbx = 449, elby = 326;       // elbows, arms extended forward onto the bed
  const caps = [
    { ax: hcx, ay: hcy - 3, bx: hcx + 2, by: hcy + 3, r: 9 },          // head, bowed
    { ax: hcx + 1, ay: hcy + 8, bx: shx, by: shy, r: 3.6 },            // short neck
    { ax: shx, ay: shy, bx: hipx, by: hipy, r: 6.5 },                  // chunky torso, leaning to the bed
    // legs: thigh angles down to the knee on the floor, shin folds BACK along it
    { ax: hipx - 1, ay: hipy, bx: kneex, by: kneey, r: 5.4 },         // near thigh
    { ax: kneex, ay: kneey, bx: footx, by: footy, r: 4.4 },           // near shin folded back along the floor
    { ax: hipx + 5, ay: hipy, bx: kneex + 7, by: kneey - 1, r: 5.4 }, // far thigh
    { ax: kneex + 7, ay: kneey - 1, bx: footx + 9, by: footy - 1, r: 4.4 }, // far shin
    // arms reach forward, elbows bent, both hands clasped together on the bed edge
    { ax: shx + 1, ay: shy + 2, bx: elbx, by: elby, r: 3.4 },          // near upper arm
    { ax: elbx, ay: elby, bx: handx, by: handy, r: 3.0 },             // near forearm to the clasped hands
    { ax: shx - 2, ay: shy + 3, bx: elbx - 3, by: elby + 2, r: 3.4 }, // far upper arm
    { ax: elbx - 3, ay: elby + 2, bx: handx - 1, by: handy + 2, r: 3.0 }, // far forearm
  ];
  // THE MAIN CHARACTER — "you": consistent deep-red clothes + dark outline so the
  // reader can follow the same child across the whole book (was a dark silhouette here).
  castShadow(out, counter, caps, { dir: -0.15, op: 0.24 });
  paintChild(out, counter, rng, caps, { whiteAura: true });
  // gold rim from the wrap above: crowning the bowed head and shoulders
  strokes(out, counter, {
    rng, n: 30,
    sample: rej(414, 286, 446, 330, (x, y) => caps.some(c => inCap(x, y, c)) && !caps.some(c => inCap(x, y + 4.5, c))),
    dir: () => -0.3,
    col: (x, y, r) => jig(mix(GOLD_DEEP, GOLD, r() * 0.6), r, 9),
    len: 5, lw: 1.7, steps: 2,
  });
  // the clasped hands themselves: one warm fleck where the thread is born
  strokes(out, counter, {
    rng, n: 14,
    sample: r => [hands[0] + (r() - 0.5) * 7, hands[1] + (r() - 0.5) * 6],
    dir: () => -Math.PI / 2 + 0.2,
    col: (x, y, r) => jig(mix(GOLD, GOLD_PALE, r()), r, 8),
    len: 4, lw: 1.6, steps: 2,
  });
  fgRanges.push([_fgChild, out.length]);   // ← the kneeling child is foreground

  // MULTIPLANE: assemble the requested depth plane (transparent where empty).
  const ALT = 'A dark night room in deep blues; a small child in deep red kneels at a bedside, head bowed; a thread of small golden lights rises from their hands to the top of the frame while a wide soft golden light descends around the child like a wrap.';
  const RAW = { undercoat: 0, weave: 0, varnish: 0, oil: 0 };
  const pick = ranges => ranges.map(([a, b]) => out.slice(a, b).join('\n')).join('\n');
  const claimed = new Set();
  for (const [a, b] of fgRanges) for (let i = a; i < b; i++) claimed.add(i);
  for (const [a, b] of farRanges) for (let i = a; i < b; i++) claimed.add(i);
  if (LAYER === 'bg') return svgWrap(ALT, out.slice(0, skyEnd).join('\n'), RAW);    // room + window (opaque)
  if (LAYER === 'far') return svgWrap(ALT, pick(farRanges), RAW);                   // the bed
  if (LAYER === 'fg') return svgWrap(ALT, pick(fgRanges), RAW);                     // the kneeling child
  if (LAYER === 'mid') {                                                            // wrap of light + thread + egg
    const body = out.filter((_, i) => i >= skyEnd && !claimed.has(i)).join('\n');
    return svgWrap(ALT, body, RAW);
  }
  return svgWrap(ALT, out.join('\n'));             // full painting (desktop)
}
