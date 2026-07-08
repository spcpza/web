// gen/plates/come.mjs — "Come"
// Revelation 22:17 — "And the Spirit and the bride say, Come. And let him that
// heareth say, Come. And let him that is athirst come. And whosoever will, let
// him take the water of life freely."
//
// The last word of the book is an INVITATION, and this plate turns it toward the
// reader. No protagonist child this time — the great radiant DOOR of light stands
// dead centre, blazing gold, and from its threshold a bright RIVER of living water
// flows FORWARD, out of the frame, toward YOU. Beyond the door: not a dark room but
// a whole world of colour. The most directly welcoming page in the book: wide open,
// warm, come.

export const name = 'come';
export const title = 'Come';
export const caption = 'Whosoever will — come.';
export const seed = 71204417;
export const focal = { x: 400, y: 260 };   // the radiant doorway, centred on the river's head
// MOBILE 3D — depth planes (FAR→NEAR): the warm turning land + the world of colour
// SEEN THROUGH the door sit BACKGROUND; the great glory, the door-frame, its rays
// and raining sparks are the MID gate; the river of living water flowing forward
// out of the frame is the nearest FOREGROUND. `full` (desktop) is unchanged.
export const layers = [
  { name: 'bg', opaque: true },   // the warm land + the world of colour beyond the door (backmost, opaque)
  { name: 'mid' },                // the glory, the door-frame, rays, gold sparks (the gate)
  { name: 'fg' },                 // the river of living water flowing toward the viewer (nearest)
];

export function paint(E, opts = {}) {
  const {
    mulberry32, fbm, curlV, goldenSpiralV, mix, ramp, jig, strokes, rej,
    paintPath, lightRadial, klimtGold, goldSparks, inscriptionText, greekRef,
    svgWrap, R1, W, H,
    GOLD, GOLD_PALE, GOLD_DEEP, GOLD_HOT,
  } = E;

  const rng = mulberry32(seed);
  const out = [];
  const counter = { n: 0 };
  // MOBILE 3D LAYERS: tag index ranges per depth plane. The MID gate and the FG
  // river are claimed explicitly; everything else (ground rect, the land, the
  // world of colour beyond the door) is the opaque BACKGROUND.
  const LAYER = opts.layer || 'full';
  const midRanges = [], fgRanges = [];

  // a luminous, NOT-dark ground — a warm dawn the door blazes within
  out.push(`<rect width="${W}" height="${H}" fill="#52567f"/>`);

  /* ---------------- geometry ---------------- */
  // the great door / gate of light, dead centre, taller than a house door —
  // a city gate of glory (Rev 21:25, "the gates of it shall not be shut").
  const door = { x: 400, y0: 150, y1: 360, w: 150 };
  const dc = [door.x, 250];                       // the heart of the blaze
  const gD = lightRadial(dc[0], dc[1], 200);      // the door's reach across the whole frame

  // the RIVER of living water/light: a broadening channel from the threshold
  // (narrow, at the door's foot) FORWARD toward the bottom-centre and out of
  // frame (wide, at the reader). Rev 22:1 — "a pure river of water of life... clear
  // as crystal, proceeding out of the throne."
  const head = [door.x, door.y1 - 4], mouth = [door.x, H + 36];
  const riverP = t => [head[0] + (mouth[0] - head[0]) * t + Math.sin(t * 3.2) * 26 * (1 - t), head[1] + (mouth[1] - head[1]) * t];
  const riverW = t => 28 + 250 * t * t;           // narrow at the door, flooding wide toward YOU
  const riverInfo = (x, y) => { let bt = 0, bd = 1e9; for (let t = 0; t <= 1.001; t += 0.03) { const p = riverP(t); const d = Math.hypot(x - p[0], y - p[1]); if (d < bd) { bd = d; bt = t; } } return { t: bt, d: bd }; };
  const onRiver = (x, y) => { const { t, d } = riverInfo(x, y); return d < riverW(t) / 2; };

  /* ---------------- 1. THE LAND AROUND — warm, living, lit by the open door ----------------
     free Munch colour; bright, never black. THE ALIVE SKY (the fractal hand, motion
     at three scales): ONE great wheel turns the whole sky around the open door
     (macro), a few eddies turn inside the wheel (mid), and every stroke curves with
     its parent current (micro) — swirls within swirls, deep moving water. But the
     radial IN-DRAW toward the door is kept and made explicit (Rev 22:17, the
     invitation pulls inward): the light AND the land converge on the open way even as
     the sky wheels — radiance and swirl coexist (Starry Night). */
  const FIELD = ['#6a78a8', '#8a86b8', '#b094c0', '#d6a4ac', '#f0c084'];
  // 3-4 mid eddies spread across the sky, alternating sign, turning inside the wheel
  const EDDIES = [[196, 96, -58], [606, 126, 56], [560, 348, -50], [128, 336, 46]];
  const skyDir = (x, y) => {
    let vx = 0, vy = 0;
    // 1 · MACRO — ONE great wheel organising the whole sky, centred on the door
    { const [a, b] = goldenSpiralV(x, y, dc[0], dc[1], 110, 260); vx += a; vy += b; }
    // 2 · MID — a few eddies turning inside the wheel
    for (const [ex, ey, s] of EDDIES) { const [a, b] = goldenSpiralV(x, y, ex, ey, s, 80); vx += a; vy += b; }
    // 3 · MICRO — fine turbulence so every stroke curves with its parent current
    const [c, d] = curlV(x, y, 31, 120); vx += c * 26; vy += d * 26;
    // the radial IN-DRAW: the whole field is pulled toward the open door (the tunnel
    // of light converging inward — the meaning of the page), riding on the wheel
    const gx = dc[0] - x, gy = dc[1] - y, gd = Math.hypot(gx, gy) + 1e-6, pull = 78 / (1 + gd / 150);
    vx += (gx / gd) * pull; vy += (gy / gd) * pull;
    return Math.atan2(vy, vx);
  };
  // jewel eddy-glows in come's warm-dawn tints — the cores breathe faint colour
  const EGLOW = [[196, 96, '#7c6ab0'], [606, 126, '#a86a92'], [560, 348, '#c8964a'], [128, 336, '#6a7ab4']];
  strokes(out, counter, {
    rng, n: 1200,
    sample: rej(-10, -10, 810, 510, (x, y) => !onRiver(x, y)),
    dir: skyDir,
    col: (x, y, r) => {
      const g = gD(x, y);
      let c = ramp(FIELD, fbm(x / 120, y / 120, 31) * 0.7 + (y / H) * 0.3);
      for (const [ex, ey, ec] of EGLOW) { const d2 = Math.hypot(x - ex, y - ey); c = mix(c, ec, Math.exp(-d2 / 95) * 0.5); }   // eddy cores breathe faint jewel light
      c = mix(c, '#ffe6b0', g * 0.78);            // the door's warmth flooding the land
      return jig(c, r, 11);
    },
    // long flowing strokes that FOLLOW the wheel (high follow, low wild = deep water)
    len: 26, lw: 5.5, steps: 4, follow: 0.91, wild: 0.05, lenJ: 0.5, impasto: 0.5, relief: 0.55,
    aJ: (x, y) => 0.14 + gD(x, y) * 0.28,
  });

  /* ---------------- 2. THE GREAT GLORY around the door (Rev 21:23) ----------------
     a vast bright halo first, so the door is the brightest thing on the page. */
  const _mid0 = out.length;   // [MID plane] the glory + the door-frame begin here
  strokes(out, counter, {
    rng, n: 620,
    sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 0.9) * 230; return [dc[0] + Math.cos(a) * d, dc[1] + Math.sin(a) * d * 0.95]; },
    dir: (x, y) => Math.atan2(y - dc[1], x - dc[0]),
    col: (x, y, r) => jig(ramp([GOLD_HOT, GOLD_PALE, GOLD, GOLD_DEEP, '#b98a3a'], Math.hypot(x - dc[0], (y - dc[1]) / 0.95) / 230), r, 9),
    len: 13, lw: 2.3, steps: 2, impasto: 0.5,
  });
  // BOLD RAYS beaming out from the open way (long, legible beams of welcome)
  strokes(out, counter, {
    rng, n: 110,
    sample: r => { const a = r() * Math.PI * 2, d = 40 + r() * 90; return [dc[0] + Math.cos(a) * d, dc[1] + Math.sin(a) * d * 0.92]; },
    dir: (x, y) => Math.atan2(y - dc[1], x - dc[0]),
    col: (x, y, r) => jig(mix(GOLD_HOT, GOLD_PALE, r() * 0.5), r, 6),
    len: (x, y) => 34 + Math.hypot(x - dc[0], y - dc[1]) * 0.42, lw: 1.8, steps: 2, lenJ: 0.6,
  });
  // KLIMT GOLD — a great gilded glory of concentric rings + dots around the gate
  klimtGold(out, counter, rng, dc[0], dc[1], 96, 232, { rings: 9, opacity: 0.66, squash: 0.94 });

  /* ---------------- 3. THE DOOR — the open way, a whole world of colour beyond ----------------
     dark posts + lintel so the gold has a shape to blaze within (chiaroscuro). */
  const fl = door.w / 2 + 8;
  paintPath(out, counter, rng, [[door.x - fl, door.y1 + 2], [door.x - fl, door.y0 - 6]], (x, y, r) => jig('#2e1f18', r, 6), { lw: 7, len: 7, density: 0.95, jitter: 0.6 });
  paintPath(out, counter, rng, [[door.x + fl, door.y1 + 2], [door.x + fl, door.y0 - 6]], (x, y, r) => jig('#2e1f18', r, 6), { lw: 7, len: 7, density: 0.95, jitter: 0.6 });
  paintPath(out, counter, rng, [[door.x - fl - 5, door.y0 - 6], [door.x + fl + 5, door.y0 - 6]], (x, y, r) => jig('#2e1f18', r, 6), { lw: 7.5, len: 7, density: 0.95, jitter: 0.6 });
  midRanges.push([_mid0, out.length]);   // ← glory, rays, KLIMT halo, door-frame (MID gate)

  // THROUGH THE DOOR — a whole world of light and colour: a white-hot blaze at the
  // centre opening into bright sky above and a lush colour land below. Home is not a
  // dark room; it is colour after the long dark.
  {
    const x0 = door.x - door.w / 2 + 2, x1 = door.x + door.w / 2 - 2;
    const inH = door.y0 + (door.y1 - door.y0) * 0.5;
    strokes(out, counter, {
      rng, n: 1500,
      sample: rej(x0, door.y0 + 2, x1, door.y1 - 2),
      dir: () => Math.PI / 2,
      col: (x, y, r) => {
        // the central blaze of the open way
        if (Math.abs(x - door.x) < door.w * 0.16 && Math.abs(y - inH) < 36) return jig(GOLD_HOT, r, 4);
        const c = (y < inH)
          ? ramp([GOLD_PALE, '#f6c06a', '#ec8f86', '#8ec6cc', '#86b6dc'], (inH - y) / (door.y1 - door.y0) * 1.7 + (r() - 0.5) * 0.22)
          : ramp([GOLD, '#c6d258', '#5aa86e', '#3f9a96', '#4a86c0'], (y - inH) / (door.y1 - door.y0) * 1.7 + (r() - 0.5) * 0.22);
        return jig(c, r, 8);
      },
      len: 12, lw: 2.8, steps: 2, lenJ: 0.5, impasto: 0.6,
    });
    // flowers of every colour in the world beyond
    strokes(out, counter, {
      rng, n: 320,
      sample: rej(x0 + 2, door.y0 + 3, x1 - 2, door.y1 - 3),
      dir: () => Math.PI / 2,
      col: (x, y, r) => { const k = r(); return jig(k < 0.24 ? '#ec8f86' : k < 0.46 ? '#9a86d0' : k < 0.68 ? '#f0c860' : k < 0.86 ? '#5ec0a0' : '#e8a0c8', r, 12); },
      len: 5, lw: 2, steps: 2, impasto: 0.4,
    });
  }

  /* ---------------- 4. THE RIVER OF LIVING WATER flowing toward the reader ----------------
     Rev 22:1 — "a pure river of water of life, clear as crystal." Curved bright
     ribbons pour from the threshold forward, broadening as they reach YOU. */
  const _fg0 = out.length;   // [FG plane] the river of living water (nearest)
  // the channel base, so colour never leaks between the flowing strokes
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
    out.push(`<path d="${d}Z" fill="#bfe6f4"/>`); counter.n++;
  }
  // the flowing water/light — curved bright ribbons running DOWN-FRAME toward the
  // viewer, warmest (gold) at the door, cooling to bright crystal blue as it nears
  // YOU; the door's gold reflected all down the stream.
  strokes(out, counter, {
    rng, n: 920,
    sample: rej(door.x - riverW(1) / 2 - 6, head[1] - 4, door.x + riverW(1) / 2 + 6, H + 30, onRiver),
    dir: (x, y) => { const { t } = riverInfo(x, y); const a = riverP(Math.max(0, t - 0.02)), b = riverP(Math.min(1, t + 0.02)); return Math.atan2(b[1] - a[1], b[0] - a[0]); },
    col: (x, y, r) => {
      const { t } = riverInfo(x, y);
      let c = ramp(['#fff3cd', GOLD_PALE, '#cfeaf2', '#9ad6ec', '#74c6e8'], t * 1.05 + (r() - 0.5) * 0.18);
      if (r() < 0.10) c = '#ffffff';              // crystal crests catching the light
      return jig(c, r, 8);
    },
    len: (x, y) => 14 + riverInfo(x, y).t * 26, lw: (x, y) => 3 + riverInfo(x, y).t * 4.6, steps: 3, follow: 0.92, lenJ: 0.55, wild: 0.06, impasto: 0.55,
  });
  // the door's golden thread running the whole length of the stream toward the walker
  strokes(out, counter, {
    rng, n: 150,
    sample: r => { const t = Math.pow(r(), 0.6); const p = riverP(t); return [p[0] + (r() + r() - 1) * riverW(t) * 0.22, p[1] + (r() - 0.5) * 4]; },
    dir: (x, y) => { const { t } = riverInfo(x, y); const a = riverP(Math.max(0, t - 0.02)), b = riverP(Math.min(1, t + 0.02)); return Math.atan2(b[1] - a[1], b[0] - a[0]); },
    col: (x, y, r) => jig(ramp([GOLD_HOT, GOLD_PALE, GOLD, GOLD_DEEP], (1 - riverInfo(x, y).t) * 0.85 + (r() - 0.5) * 0.25), r, 7),
    len: 14, lw: 1.8, steps: 3, lenJ: 0.6, wJ: 0.45,
  });

  /* ---------------- LIFE at the WATER OF LIFE ----------------
     Rev 22:17 "let him take the water of life freely"; Rev 22:2 "on either side
     of the river". Green REEDS rooted on either bank of the living stream (each
     clump bows toward the water), and ONE KINGFISHER — the jewel-bird, teal and
     flame-orange, darting low across the water's edge. All in the FG river plane
     so the water's edge stays one connected system on tilt. Curved strokes —
     living things curve (Munch). */
  const REED = ['#2e7a48', '#3f9a4e', '#63b455', '#8ccc60'];
  const reedClump = (bx, by, nBlades, hMax, lean) => {
    for (let i = 0; i < nBlades; i++) {
      const x0 = bx + (rng() - 0.5) * 16, h = hMax * (0.55 + rng() * 0.45), l = lean * (0.6 + rng() * 0.8);
      const pts = [[x0, by + 2], [x0 + l * 0.35 + (rng() - 0.5) * 3, by - h * 0.55], [x0 + l + (rng() - 0.5) * 4, by - h]];
      paintPath(out, counter, rng, pts, (x, y, r) => jig(ramp(REED, r() * 0.7 + ((by + 2 - y) / h) * 0.3), r, 9), { lw: 2.1, len: 4.5, density: 0.9, jitter: 0.5 });
      if (i % 3 === 1) {   // a cattail head on every third blade — the water's-edge sign
        out.push(`<ellipse cx="${R1(pts[2][0])}" cy="${R1(pts[2][1] + 4)}" rx="1.9" ry="5.4" fill="#6a4526" opacity="0.92" transform="rotate(${R1(l * 0.8)} ${R1(pts[2][0])} ${R1(pts[2][1] + 4)})"/>`);
        counter.n++;
      }
    }
  };
  reedClump(372, 446, 6, 34, 7);    // left bank, upstream (far = small)
  reedClump(338, 490, 7, 46, 9);    // left bank, near the reader (near = large)
  reedClump(458, 442, 5, 30, -6);   // right bank, upstream
  reedClump(492, 486, 6, 42, -9);   // right bank, near
  {
    // THE KINGFISHER — one flash of teal + orange darting across the left rim of
    // the stream, low over the pale-gold water head, deep teal on light (contrast
    // against the LOCAL hue). Bold silhouette + one white throat dot + eye + long
    // dark bill; two pale speed-streaks make the FLASH.
    const kx = 378, ky = 402, ks = 1.25, ka = 14;
    const g = [`<g transform="translate(${kx},${ky}) rotate(${ka}) scale(${ks})">`];
    g.push(`<path d="M-12 -0.5 q-5 0.5 -9 2.6 M-11 1.8 q-4.5 1.2 -7.5 3.4" fill="none" stroke="#bfeef4" stroke-width="1.3" opacity="0.8" stroke-linecap="round"/>`);   // the flash — speed streaks
    g.push(`<path d="M-9 1.5 Q-3 -4.5 5 -4 Q9 -3.5 11 -1.5 Q8 3 1 4.6 Q-6 5.6 -9 1.5 Z" fill="#16b2c8"/>`);   // bright teal body + head (the jewel)
    g.push(`<path d="M2 -0.2 Q7 0.2 10.5 -1.2 Q8 2.9 2 4.4 Q-1 4.9 -2.5 3.7 Q-0.5 1.6 2 -0.2 Z" fill="#f68a32"/>`);   // flame-orange breast
    g.push(`<path d="M-2 -2 Q0 -9.5 7 -12.5 Q3.5 -5 1.5 -1.8 Q-0.5 -1 -2 -2 Z" fill="#0c84a0"/>`);            // wing, mid-beat, deeper teal
    g.push(`<path d="M-8 3.2 Q-1 6.2 6 4.8" fill="none" stroke="#ffd98a" stroke-width="1" opacity="0.7" stroke-linecap="round"/>`);   // the door's gold caught on its belly (separation from the dark pocket)
    g.push(`<path d="M11 -1.5 l7.5 1.1 l-7.6 1.5 Z" fill="#1c2430"/>`);                                       // the long dark bill
    g.push(`<circle cx="6.8" cy="0.2" r="1.15" fill="#ffffff"/>`);                                            // white throat
    g.push(`<circle cx="8.5" cy="-2.2" r="0.85" fill="#101820"/>`);                                           // eye
    g.push('</g>');
    out.push(g.join('')); counter.n += 8;
  }
  fgRanges.push([_fg0, out.length]);   // ← the river of living water + reeds + the kingfisher (FG, nearest)

  /* ---------------- 5. LEGIBLE GOLD SPARKS raining off the open gate ---------------- */
  const _mid1 = out.length;   // [MID plane] sparks + the hidden gate-egg
  goldSparks(out, counter, rng, dc[0], dc[1], 40, 236, 150, { squash: 0.94, big: 1.2, lightFn: gD });

  /* ---------------- 6. HIDDEN EGG — Rev 22:17 in the original tongue ----------------
     ΚΒʹ·ΙΖʹ cut subtly into the gold lintel of the open way. "And whosoever will,
     let him take the water of life freely." A dark incision on the gold, turned
     toward the reader. */
  inscriptionText(out, greekRef(22, 17), { x: 400, y: door.y0 - 12, h: 14, body: '#241608', edge: '#fff0c4', op: 0.82, edgeOp: 0.6 });

  /* ---------------- 7. LIFE — two DOVES crossing the glory toward the open way ----------------
     Rev 22:17 "the Spirit and the bride say, Come" — the dove is the homing bird
     (Gen 8:11), and it flies IN through the gate. White bold silhouettes with
     lifted wings, placed on the deep outer amber of the halo so light reads on
     dark (check the LOCAL hue). They live in the MID gate plane — at the door's
     own depth, entering it. */
  for (const [bx, by, rot, s] of [[282, 108, 18, 1.05], [330, 74, 24, 0.85]]) {
    const g = [`<g transform="translate(${bx},${by}) rotate(${rot}) scale(${s})">`];
    g.push(`<path d="M-9 0.8 Q-2 4 7 2.6" fill="none" stroke="#6a4a20" stroke-width="1.1" opacity="0.5" stroke-linecap="round"/>`);            // dark under-edge (chiaroscuro pocket)
    g.push(`<path d="M-3.5 -1.6 Q-3 -8.5 2 -12.5 Q0.5 -5.5 -1 -1.6 Q-2.5 -0.8 -3.5 -1.6 Z" fill="#e8dfc8" opacity="0.95"/>`);                  // far wing, lifted
    g.push(`<path d="M-9 0 Q-3 -3 5 -2.5 Q9 -2 11 -0.5 Q7 2.5 0 3 Q-6 3.4 -9 0 Z" fill="#fdf6e2"/>`);                                          // body + head
    g.push(`<path d="M-9 0 l-6.5 3.2 l1 -4.8 l5.5 0.6 Z" fill="#f2e8d0"/>`);                                                                    // tail fan
    g.push(`<path d="M0 -2.2 Q3 -10 10 -13.5 Q6 -5 3.5 -1.8 Q1.5 -1 0 -2.2 Z" fill="#ffffff"/>`);                                              // near wing, lifted (arms up read as wings)
    g.push(`<path d="M11 -0.5 l3.2 0.9 l-3.3 1 Z" fill="#caa04a"/>`);                                                                           // beak
    g.push(`<circle cx="8" cy="-1" r="0.8" fill="#3a3020"/>`);                                                                                  // eye
    g.push('</g>');
    out.push(g.join('')); counter.n += 7;
  }
  midRanges.push([_mid1, out.length]);   // ← gold sparks + the gate-egg + the doves (MID gate)

  const ALT = 'A great radiant open door of light stands dead centre, blazing gold and ringed in glory, opening on a whole world of colour beyond — bright sky above, a lush colour land below. From its threshold a bright river of living water flows forward, narrow at the door and broadening as it pours out of the frame toward the viewer, gold at the gate and crystal blue as it nears you. The warm land all around turns toward the open way. An open, welcoming invitation: whosoever will, come and take the water of life freely.';

  // MULTIPLANE: assemble the requested depth plane. Each is its own cel —
  // transparent where it has no content — so they stack and parallax apart like
  // the painted-background-plus-acetate-cels of hand-drawn animation. The MID gate
  // and FG river are pulled out by index range; the BACKGROUND is everything left
  // (the warm land + the world of colour seen through the open door).
  const RAW = { undercoat: 0, weave: 0, varnish: 0, oil: 0 };   // no baked surface — the live filter unifies the planes
  const setOf = ranges => { const s = new Set(); for (const [a, b] of ranges) for (let i = a; i < b; i++) s.add(i); return s; };
  const pick = ranges => ranges.map(([a, b]) => out.slice(a, b).join('\n')).join('\n');
  const midSet = setOf(midRanges), fgSet = setOf(fgRanges);
  if (LAYER === 'mid') return svgWrap(ALT, pick(midRanges), RAW);   // the glory, the door-frame, rays, sparks
  if (LAYER === 'fg') return svgWrap(ALT, pick(fgRanges), RAW);     // the river of living water
  if (LAYER === 'bg') {                                             // the warm land + the world of colour beyond the door
    const body = out.filter((_, i) => !midSet.has(i) && !fgSet.has(i)).join('\n');
    return svgWrap(ALT, body, RAW);
  }
  // full painting (desktop): original order, byte-identical to before the split
  return svgWrap(ALT, out.join('\n'));
}
