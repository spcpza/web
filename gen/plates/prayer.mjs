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
  /* ⚠⚠ THE FRAME CLOCK. Fred: "draw several plates of the light behind the kid and animate
     it a&b, b&c, c&d, d&a so it looks like a radiating light!" So the LIGHT is what is drawn
     four times — the mid plane, and only the mid plane: the room, the bed and the child are
     painted once and never move, which is what lets the light read as the thing that is
     alive in the picture.
     ⚠ `lightAt` below must stay FRAME-INDEPENDENT. The wall, the floor, the bed and the
     child all take their gold from it, and none of them is on the boiling plane — so if it
     breathed, the light on the room would be stuck at one frame's value while the wrap moved,
     and the two would disagree. Everything that pulses does so from PH, applied only to marks
     that live in `mid`. */
  const _FN = Math.max(1, globalThis.__FRAME_N || 1);
  const _FR = (globalThis.__FRAME || 0) % _FN;
  const PH = _FN > 1 ? _FR / _FN : 0;          // 0..1 once round the ring
  const TAU = Math.PI * 2;
  // a swell travelling DOWN the column: at any height the light gathers and lets go, and
  // because the phase depends on t the crest runs from the top of the frame to the child,
  // which is the direction the answer is coming from.
  const pulse = t => 1 + 0.26 * Math.cos(TAU * (PH - t * 0.75));
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
  /* ---------------- 3c. THE ROOM SOMEBODY LIVES IN ---------------- */
  /* Fred: "just make it more detailed." The room was a field of blue marks with a window in
     it — atmosphere, but nowhere in particular. What makes a bedroom a bedroom is the plain
     evidence that a child uses it: boards underfoot, a rug, the slippers they stepped out of,
     a toy left where they dropped it, the book somebody read to them. Every one of those is
     nameable, which is the test on this book.
     ⚠ ALL MADE, SO ALL STRAIGHT (Munch) — boards, skirting, the rug's edge, the book. The
     slippers and the toy are soft things and curve.
     ⚠ AND NONE OF THEM MAKES LIGHT. Each is a dark shape carrying gold only on the side the
     wrap reaches, off the same `lightAt` as everything else on the page. */
  {
    const rmR = mulberry32(seed ^ 0x40de);
    const lit = (x, y) => lightAt(x, y);
    // ── the floorboards. Boards run away from the reader, so their seams converge — that
    //    single fact turns a blue smear into a floor you could kneel on.
    for (let i = -4; i <= 10; i++) {
      const xf = 400 + i * 96;                       // where the seam crosses the near edge
      const xb = 400 + i * 30;                       // and where it meets the wall
      paintPath(out, counter, rmR, [[xb, floorY + 2], [(xb + xf) / 2, floorY + 74], [xf, 512]],
        (x, y, r) => jig(mix('#0a1026', '#8a6c32', lit(x, y) * 0.5 + 0.04), r, 7),
        { lw: 1.6, len: 5, density: 0.55, jitter: 0.5 });
    }
    // ── the skirting board where the wall meets the floor: one straight line, and the room
    //    suddenly has a corner instead of a fade
    paintPath(out, counter, rmR, [[-10, floorY - 1], [400, floorY + 1], [812, floorY - 1]],
      // ⚠ thinner and less black than the first cut, which laid a hard rule right across the
      // picture and cut it in two. A skirting board is a shadow with a lit top edge, not a line.
      (x, y, r) => jig(mix('#0d1428', '#a87c3c', lit(x, y) * 0.5), r, 6),
      { lw: 4.5, len: 6, density: 0.75, jitter: 0.5 });
    paintPath(out, counter, rmR, [[-10, floorY - 6], [400, floorY - 4], [812, floorY - 6]],
      (x, y, r) => jig(mix('#1a2450', '#e8c078', lit(x, y) * 0.6), r, 6),
      { lw: 1.6, len: 5, density: 0.6, jitter: 0.4 });
    // ── the rug the child is kneeling on. Straight edges, a plain border, and the wrap's
    //    pool lands in the middle of it.
    {
      const RX0 = 296, RX1 = 566, RY0 = 396, RY1 = 470;
      strokes(out, counter, {
        rng: rmR, n: 620,
        sample: r => [RX0 + 22 * (1 - (r() * 0 + 0)) + r() * (RX1 - RX0), RY0 + r() * (RY1 - RY0)],
        dir: () => 0.02,
        col: (x, y, r) => {
          const edge = Math.min((x - RX0) / 26, (RX1 - x) / 26, (y - RY0) / 14, (RY1 - y) / 14);
          const band = edge < 1.0;                    // the border stripe
          let c = ramp(['#1b1330', '#2a1c40', '#3a2748'], fbm(x / 30, y / 16, 91) * 0.9);
          if (band) c = mix(c, '#4a2a30', 0.6);
          return jig(mix(c, '#d8a758', lit(x, y) * 0.62), r, 8);
        },
        len: 9, lw: 2.8, steps: 2, lenJ: 0.5, impasto: 0.4, relief: 0.18,
      });
      // ⚠ NO FRINGE. Fifty-two little threads at this size are not a fringe, they are noise
      // along an edge you cannot see anyway. What makes a rug read is that it has a straight
      // EDGE and the floor does not — so the near edge gets one clean lit line instead.
      paintPath(out, counter, rmR, [[RX0, RY1], [(RX0 + RX1) / 2, RY1 + 2], [RX1, RY1]],
        (x, y, r) => jig(mix('#241a34', '#e0b070', lit(x, y) * 0.66 + 0.05), r, 7),
        { lw: 2.4, len: 5, density: 0.8, jitter: 0.4 });
      paintPath(out, counter, rmR, [[RX0, RY0], [(RX0 + RX1) / 2, RY0 - 1], [RX1, RY0]],
        (x, y, r) => jig(mix('#100a1e', '#7a5a30', lit(x, y) * 0.4), r, 7),
        { lw: 2.0, len: 5, density: 0.7, jitter: 0.4 });
    }
    // ── the slippers they stepped out of, side by side and slightly askew.
    // ⚠ AND STANDING IN THE LIGHT. Out on the dark boards the first pair read as two black
    // commas — a dark object on a dark floor is a stain, whatever shape you give it. Set at
    // the edge of the wrap's pool they are silhouettes against a LIT floor, which is the
    // only way anything reads in a night room (the same rule the whole page is built on).
    for (const [sx, sy, sg] of [[344, 398, -1], [368, 404, -1]]) {
      // the sole: a flat straight-ish slab lying on the floor
      strokes(out, counter, {
        rng: rmR, n: 40,
        sample: r => [sx + (r() - 0.5) * 22, sy + 3 + (r() - 0.5) * 5],
        dir: () => 0.05,
        col: (x, y, r) => jig(mix('#070b1a', '#8a6228', lit(x, y) * 0.3), r, 5),
        len: 5, lw: 2.4, steps: 1, relief: 0.1,
      });
      // the upper: a low dome over the toe end, open at the heel
      strokes(out, counter, {
        rng: rmR, n: 46,
        sample: r => { const t = r();
                       return [sx + sg * 10 - sg * t * 15, sy + 1 - Math.sin(t * Math.PI) * 6 * r()]; },
        dir: (x, y) => -0.5 * sg,
        col: (x, y, r) => jig(mix('#0d1226', '#9c7030', lit(x, y) * 0.42), r, 6),
        len: 5, lw: 2.6, steps: 1, relief: 0.1, impasto: 0.25,
      });
      // and the dark mouth you put your foot into — the one thing that makes it a slipper
      E.daub(out, counter, sx - sg * 6, sy - 1.5, 3.2, jig('#05070f', rmR, 4), rmR);
    }
    // ── the chair with yesterday's clothes over the back.
    // ⚠ THE HORSE AND THE BOOK THAT WERE HERE ARE GONE. Both were small dark things lying on
    // dark boards, and both came out as smudges — the horse as a stain, the book as a little
    // hatched grid like a drain cover. The lesson is the floor's, not theirs: in a room this
    // dark the only places an object can read are IN the pool of light, or as a silhouette
    // standing UP against the wall. So the one that survives stands up.
    {
      const CX = 236, CY = 404, SEAT = 356, BACK = 286;
      const post = (x0, y0, x1, y1, w2, k) =>
        paintPath(out, counter, rmR, [[x0, y0], [x1, y1]],
          (x, y, r) => jig(mix('#080d1e', '#a87c38', lit(x, y) * 0.5 + k), r, 7),
          { lw: w2, len: 5, density: 0.95, jitter: 0.4 });
      post(CX - 20, SEAT, CX - 24, CY + 8, 4.2, 0.03);       // front legs
      post(CX + 20, SEAT, CX + 25, CY + 6, 4.2, 0.03);
      post(CX - 13, SEAT, CX - 15, CY - 2, 3.4, 0.0);        // back legs, behind
      post(CX - 26, SEAT + 1, CX + 26, SEAT - 1, 5.4, 0.05); // the seat
      post(CX - 22, SEAT, CX - 25, BACK, 4.0, 0.04);         // the back uprights
      post(CX + 18, SEAT, CX + 19, BACK - 2, 4.0, 0.04);
      post(CX - 25, BACK, CX + 19, BACK - 2, 4.6, 0.06);     // the top rail
      // a shirt thrown over the back — a soft thing, so it hangs in curves
      strokes(out, counter, {
        rng: rmR, n: 240,
        sample: r => { const t = r();
                       const xx = CX - 24 + t * 46 + (r() - 0.5) * 6;
                       return [xx, BACK - 4 + Math.pow(r(), 0.7) * (44 + Math.sin(t * Math.PI) * 16)]; },
        dir: (x, y) => Math.PI / 2 + (fbm(x / 18, y / 20, 97) - 0.5) * 0.7,
        col: (x, y, r) => {
          let c = ramp(['#161e3e', '#243057', '#33427a', '#45568f'],
            fbm(x / 16, y / 22, 99) * 0.85 + r() * 0.25);
          return jig(mix(c, '#dcb878', lit(x, y) * 0.55), r, 8);
        },
        len: 10, lw: 2.6, steps: 2, lenJ: 0.6, impasto: 0.4, relief: 0.16,
      });
    }
  }

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
    // ⚠⚠ THE BED HAD NO VALUE SEPARATION FROM THE WALL and so it was not a bed, it was more
    // of the same blue mush with a bear sitting in it. In a dark room a mass reads for
    // exactly two reasons — it is DARKER than what is behind it, and its top edge CUTS. This
    // silhouette is now the darkest thing in the room and fully opaque; the lit edge below
    // does the cutting. (And note the live filter lifts darks, so "dark enough" has to be
    // judged on the page, never in the plate.)
    out.push(`<path d="${d}" fill="#05080f" opacity="1"/>`);
    counter.n++;
  }
  // dark bulk
  strokes(out, counter, {
    rng, n: 420,
    sample: rej(446, 312, 704, 424, inBed),
    dir: x => { const e = 6; return Math.atan2(bedTopY(x + e) - bedTopY(x - e), 2 * e); },
    col: (x, y, r) => {
      const g = lightAt(x, y);
      // ⚠⚠ AND THE MASS ITSELF HAS TO BE DARKER THAN THE WALL. This was the whole reason the
      // bed would not read however much frame I drew on it: at #101730-#222d52 it sat inside
      // the wall's own range (#0e1430-#27407e), so the opaque silhouette underneath was
      // immediately painted back up to the wall's value by these very strokes. A mass in a
      // dark room reads for two reasons and this is the first one.
      let c = mix('#050810', '#121a34', fbm(x / 60, y / 30, 59) * 0.9);
      return jig(mix(c, '#8a6a32', g * 0.38), r, 8);
    },
    len: 24, lw: 4.4, steps: 3, wild: 0.14, lenJ: 0.5, aJ: 0.12,
  });
  // blanket folds: contour strokes draped down the near side
  strokes(out, counter, {
    rng, n: 260,
    sample: rej(446, 330, 704, 426, (x, y) => y > bedTopY(x) + 6),
    dir: (x, y) => Math.PI / 2 - 0.18 + (fbm(x / 30, y / 30, 67) - 0.5) * 0.5,
    col: (x, y, r) => jig(mix('#080d1e', '#18213f', fbm(x / 24, y / 24, 71)), r, 9),
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
  // ⚠ THE LIT EDGE IS THE BED. It used to be 90 marks over the near fifth of the mattress,
  // fading to the wall's own colour by x=650 — so the bed had a bright corner and then simply
  // stopped existing. It now runs the WHOLE length, brightest at the child's hands and never
  // falling below a value that separates the mattress from the wall behind it. This one line
  // is what turns the mass into a piece of furniture.
  strokes(out, counter, {
    rng, n: 260,
    sample: r => { const x = 448 + Math.pow(r(), 1.15) * 254; return [x, bedTopY(x) + (r() - 0.5) * 4]; },
    dir: x => { const e = 6; return Math.atan2(bedTopY(x + e) - bedTopY(x - e), 2 * e); },
    col: (x, y, r) => jig(ramp([GOLD_PALE, GOLD, GOLD_DEEP, '#8a7448', '#6a6088'], Math.pow((x - 448) / 254, 0.8)), r, 8),
    len: 9, lw: 2.2, steps: 2, aJ: 0.1,
  });
  // bed legs / frame shadow line
  out.push(`<path d="M${452} ${R1(bedTopY(452) + 88)}L${452} ${R1(bedTopY(452) + 64)} M${694} ${R1(bedTopY(694) + 86)}L${694} ${R1(bedTopY(694) + 60)}" stroke="#0d1326" stroke-width="6" stroke-linecap="round" fill="none"/>`);
  counter.n++;

  /* ── 4b · SO THAT IT READS AS A BED ───────────────────────────────────────────
     The bed was a dark mass at the edge of a dark room, and a child kneeling at a mass is
     not the same picture as a child kneeling at a BED. Three things settle it, and they are
     the three a child would draw: the head of it standing up against the wall, the sheet
     turned back the way somebody turns it back at bedtime, and a bear waiting on the pillow.
     ⚠ The frame is made, so it is straight; the bedclothes and the bear are soft, so they
     curve. Nothing here makes light — the gold is only where the wrap lands. */
  {
    const bdR = mulberry32(seed ^ 0x8ed1);
    const lit = (x, y) => lightAt(x, y);
    // ── the headboard: two posts and the rails between them, standing against the wall
    {
      const HX0 = 648, HX1 = 722, HTOP = 268;
      for (const px of [HX0, HX1])
        paintPath(out, counter, bdR, [[px, bedTopY(Math.min(700, px)) + 6], [px, HTOP]],
          (x, y, r) => jig(mix('#0a0f22', '#9c7434', lit(x, y) * 0.45 + 0.05), r, 7),
          { lw: 6.5, len: 5, density: 0.95, jitter: 0.4 });
      for (const py of [HTOP + 5, HTOP + 30])
        paintPath(out, counter, bdR, [[HX0 - 3, py], [HX1 + 3, py + 2]],
          (x, y, r) => jig(mix('#0b1024', '#9c7434', lit(x, y) * 0.45 + 0.04), r, 7),
          { lw: 5, len: 5, density: 0.95, jitter: 0.4 });
      for (let k = 1; k <= 4; k++) {                       // the spindles
        const px = HX0 + (HX1 - HX0) * k / 5;
        paintPath(out, counter, bdR, [[px, HTOP + 9], [px, HTOP + 28]],
          (x, y, r) => jig(mix('#0d1328', '#8a6630', lit(x, y) * 0.45), r, 6),
          { lw: 2.4, len: 4, density: 0.95, jitter: 0.3 });
      }
      // ⚠ and a LIT LEFT EDGE down each post. Without it the frame was two striped poles
      // apparently standing in the air behind the bed: a made thing in a dark room needs one
      // clean side catching the light, or it has no form at all.
      for (const px of [HX0, HX1])
        paintPath(out, counter, bdR, [[px - 3.2, bedTopY(Math.min(700, px))], [px - 3.2, HTOP + 2]],
          (x, y, r) => jig(mix('#3a4468', '#f0cc84', lit(x, y) * 0.7 + 0.12), r, 6),
          { lw: 1.3, len: 4, density: 0.6, jitter: 0.35 });
      for (const px of [HX0, HX1])                          // a knob on each post
        E.daub(out, counter, px, HTOP - 4, 5.2, jig(mix('#141a34', '#c2924a', lit(px, HTOP) * 0.5), bdR, 6), bdR);
    }
    // ── the sheet, turned back across the bed the way somebody turns it back at bedtime.
    //    It is the palest thing on the bed, so it is also what gives the mass an edge.
    strokes(out, counter, {
      rng: bdR, n: 340,
      // ⚠ narrower than the first cut, which spread 17 units of pale grey right along the bed
      // and read as MIST lying on it. A turned-back sheet is a band, and a band has a width.
      sample: r => { const t = r(); const x = 470 + t * 180;
                     return [x, bedTopY(x) + 5 + Math.pow(r(), 0.75) * 11]; },
      dir: (x, y) => 0.06 + (fbm(x / 26, y / 12, 93) - 0.5) * 0.5,
      col: (x, y, r) => {
        const fold = fbm(x / 15, y / 9, 95);
        let c = ramp(['#1a2446', '#2b3a68', '#41528c', '#5b6ea8'], fold * 0.85 + r() * 0.2);
        return jig(mix(c, '#e2c07a', lit(x, y) * 0.62), r, 8);
      },
      len: 11, lw: 2.8, steps: 2, lenJ: 0.55, impasto: 0.45, relief: 0.2,
    });
    // its folded edge — one long soft line is what makes it read as TURNED BACK
    paintPath(out, counter, bdR, [[470, bedTopY(470) + 5], [576, bedTopY(576) + 9], [682, bedTopY(682) + 4]],
      (x, y, r) => jig(mix('#4a5a92', '#f2d89c', lit(x, y) * 0.7), r, 7),
      { lw: 2.2, len: 5, density: 0.7, jitter: 0.45 });
    // ── the bear, sitting up against the pillow, waiting
    {
      const TB = [524, 316];
      const lump = (dx, dy, rr, k) => E.daub(out, counter, TB[0] + dx, TB[1] + dy, rr,
        jig(mix(ramp(['#2a1e2e', '#3d2c33', '#4e3a38'], k), '#d8a860', lit(TB[0] + dx, TB[1] + dy) * 0.55), bdR, 7), bdR);
      lump(0, 2, 9.5, 0.35);                                  // body
      lump(-1, -8.5, 6.8, 0.55);                              // head
      lump(-5.5, -13, 2.9, 0.5); lump(3.5, -13.5, 2.9, 0.5);  // ears
      lump(-8.5, 2, 3.6, 0.3); lump(8, 1.5, 3.6, 0.3);        // arms
      lump(-5, 10, 3.4, 0.3); lump(4.5, 10, 3.4, 0.3);        // legs
      lump(-1, -6.5, 3.0, 0.75);                              // muzzle, palest
      E.daub(out, counter, -3.4 + TB[0], TB[1] - 9.6, 1.05, jig('#100c18', bdR, 4), bdR);
      E.daub(out, counter, 1.4 + TB[0], TB[1] - 9.8, 1.05, jig('#100c18', bdR, 4), bdR);
    }
  }
  /* ⚠ PROPORTION (Fred, Sep 18: "bed size too big for the person. proportion is way off").
     The kneeling child is 84 units tall; the bed ran 254 long and 92 deep on its near side —
     nearly three children end to end, and as deep as he is tall. That is a giant's bed.
     Rather than retype twenty constants (and desynchronise the headboard, the turned-back
     sheet and the bear from the mattress they sit on), the FAR plane — which is exactly the
     bed and nothing else — is scaled as ONE PIECE about its near top corner, where his hands
     rest: that corner cannot move, so the bed keeps its height at his hands and loses length
     and bulk behind him. 0.75 gives ~190 long by 69 deep — a child's single bed, its foot
     at y399 on the floor by his knees. */
  {
    const bed = out.splice(_far, out.length - _far);
    // ⚠ AND IT MOVES A LITTLE CLEAR OF HIM. Scaled about his hands alone, the pillow end —
    // with the bear on it, which is half of what makes this read as a BED and not a ledge —
    // slid left into the child's own aura and was washed out by it. Shifted 24 units along
    // the wall, the bear sits in the open again and he kneels BESIDE the bed, as he would.
    out.push('<g transform="translate(24 0) translate(446 330) scale(0.75) translate(-446 -330)">\n' + bed.join('\n') + '\n</g>');
  }
  farRanges.push([_far, out.length]);   // ← the bed is the FAR plane (the child kneels in front of it)

  /* ---------------- 8 (under the wrap). EGG: "7:7" in the wall shadow ---------------- */
  // Matthew 7:7 — ask, seek, knock — whispered one shade above the night, far right
  // Matthew 7:7 (ask, seek, knock) in ORIGINAL KOINE GREEK numerals, Ζʹ·Ζʹ (Ζ=7),
  // whispered one shade above the night in the wall shadow, far right.
  // ⚠ lifted from y278: the headboard now stands there, and Ζʹ·Ζʹ hung between its two posts
  // read as a SIGN screwed to the bed. An easter egg has to be found, not displayed.
  E.inscriptionText(out, E.greekRef(7, 7), { x: 702, y: 206, h: 20, body: '#cfd6e8', edge: '#16203c', op: 0.8, edgeOp: 0.5 });

  /* ---------------- 5. THE WRAP ---------------- */
  // broad, soft gold descending around the child — enclosing arcs, never a beam.
  // Strokes orbit the wrap spine, bending downward and inward like folded wings.
  strokes(out, counter, {
    rng, n: 470,
    sample: r => {
      const t = Math.pow(r(), 0.42);                // bias hard toward the child
      const p = wrapPt(t);
      const spread = (26 + 46 * t) * pulse(t);      // widens descending, and BREATHES
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
    len: (x, y) => 15 * (0.72 + 0.5 * pulse(Math.max(0, Math.min(1, (y + 40) / 380)))),
    lw: 2.6, steps: 3, follow: 0.9, wild: 0.14, aJ: 0.2, lenJ: 0.5, impasto: 0.6,
  });
  // the wrap's hem pooling on the floor around the kneeling child
  strokes(out, counter, {
    rng, n: 190,
    sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 1.2);
                   const sw = 1 + 0.13 * Math.cos(TAU * (PH - 0.75));   // the pool takes the crest last
                   return [childC[0] + Math.cos(a) * 96 * d * sw, 384 + Math.sin(a) * 22 * d * sw]; },
    dir: () => 0.04,
    col: (x, y, r) => { const d = Math.hypot(x - childC[0], (y - 384) * 3); return jig(ramp([GOLD, GOLD_DEEP, '#7a6334', '#1a2550'], d / 120), r, 9); },
    len: 12, lw: 2.6, steps: 2, aJ: 0.1,
  });

  /* ---------------- 5b. THE RADIANCE ---------------- */
  /* Rays going out from BEHIND the child, with a crest running round them, so the four
     drawings read as one light pulsing rather than four pictures.
     ⚠⚠ THE FIRST CUT WAS A SUNBURST DECAL. Fifty-four bowed ribbons at full gold, in a
     complete circle, came out as a firework going off behind a kneeling boy — hard yellow
     needles crossing the bed, the floor and the poem. Three things were wrong and all three
     matter for any beam in this book:
       · A RAY IS NOT A LINE. Drawn as one path it has an edge, and light has no edge. Each
         ray is a scatter of small soft marks along its axis, thinning as it goes, so what
         you see is a direction rather than a stroke.
       · IT IS *BEHIND* HIM, so it belongs in the upper half. Fred's words were "the light
         behind the kid" — light driven down into the floorboards is a stain, not a radiance.
       · AND IT MUST SINK INTO THE ROOM. Starting at GOLD_HOT put the tips brighter than the
         wrap they come out of. They start at the wrap's own gold and are the wall's blue
         well before they end. */
  {
    const rRng = mulberry32(seed ^ 0x2ad1);      // fixed: the same rays in every drawing
    const RAY = [438, 310];                      // the heart of the wrap, over the clasped hands
    const N = 26;
    for (let i = 0; i < N; i++) {
      // the upper half only, fanned wide, each ray a little off its slot
      const a = Math.PI * (1.06 + (i + 0.5) / N * 0.88) + (rRng() - 0.5) * 0.10;
      const wave = 0.5 + 0.5 * Math.cos(TAU * PH - a * 2.6);   // crests running round the fan
      const L = (34 + 88 * wave) * (0.72 + rRng() * 0.56);
      const r0 = 20 + rRng() * 10;
      const bow = (rRng() - 0.5) * 0.5;                        // light curves (Munch)
      const px = Math.cos(a), py = Math.sin(a);
      const nx = -py, ny = px;
      const wide = 5 + rRng() * 5;
      strokes(out, counter, {
        rng: rRng, n: Math.max(8, Math.round(L * 0.5)),
        sample: r => {
          const u = Math.pow(r(), 0.72);                       // dense at the source
          const d = r0 + u * L;
          const off = (r() + r() - 1) * wide * (0.4 + u) + bow * L * u * u * 0.5;
          return [RAY[0] + px * d + nx * off, RAY[1] + py * d + ny * off];
        },
        dir: () => a,
        col: (x, y, r) => {
          const f = Math.max(0, Math.min(1, (Math.hypot(x - RAY[0], y - RAY[1]) - r0) / (L + 1)));
          return jig(ramp([GOLD, GOLD_DEEP, mix(GOLD_DEEP, '#27407e', 0.5), '#1b2748', '#141d3c'],
            Math.pow(f, 0.7)), r, 9);
        },
        len: 9, lw: 2.2, steps: 2, lenJ: 0.7, wild: 0.12, impasto: 0.35, relief: 0,
      });
    }
  }

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
    // ⚠ THE BEADS CLIMB. Every mark keeps its identity between drawings (the rng runs the
    // same sequence each build) and simply moves one quarter of the way up the thread, so
    // over the four drawings the string of lights RISES and wraps — a prayer going up,
    // rather than a row of dots switching on and off.
    sample: r => { const t = (r() + PH) % 1; const p = thr(t);
                   return [p[0] + (r() - 0.5) * (10 - 6 * t), p[1] + (r() - 0.5) * 8]; },
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
  // THE MAIN CHARACTER — the little pilgrim in a deep kneel at the bedside,
  // hem pooled on the floor, both thin arms reaching up to the clasped point
  // on the bed edge, eyes closed (praying)
  E.paintMask(out, counter, rng, {
    x: 428, y: 390, h: 84, facing: 1, kneel: true, lean: 10,
    armR: [handx - 4, handy - 2],
    mood: 'joy', aura: 11,
  });
  // gold rim from the wrap above: crowning the bowed head and shoulders
  strokes(out, counter, {
    rng, n: 30,
    sample: rej(416, 300, 446, 322, () => true),
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
