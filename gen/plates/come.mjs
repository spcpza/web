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
  /* ⚠⚠ CHROMATIC — the same two engine levers as `light`. setColorPunch is real pigment
     saturation on every colour the plate makes (anything under 6% chroma is left alone, so
     the crystal water and the white crests are untouched), and the MANIFOLD is Van Gogh's
     complementary fleck — a share of marks flipped clean across the wheel at matched
     lightness. This page is a world of colour seen through a door; it can carry it.
     ⚠ 0.46 here against 0.26 on `light`, because this page STARTS pale: its land is painted
     in warm dawn tints, so the same punch left it at chroma 55 while its neighbour reached
     105 — and two facing pages half an octave apart in colour read as a mistake. The number
     to match is the one on the page next to it, not the one that sounded reasonable. */
  const _FN = Math.max(1, globalThis.__FRAME_N || 1);
  const _FR = (globalThis.__FRAME || 0) % _FN;
  const PH = _FN > 1 ? _FR / _FN : 0;
  E.setColorPunch(0.24);   /* ⚠⚠ MUCH higher than `light`'s 0.22, and it has to be. The punch
     is a MULTIPLIER on saturation, so what it can do depends entirely on what the palette
     starts with: light's spectrum is already at full chroma and 0.22 takes it to 118, while
     this page's post-resurrection tints (light blue, lilac, pink, peach) are pale by nature
     and the same setting left it at 56 — half its neighbour, reading washed beside it.
     Matching the two means matching the RESULT, not the setting — and when a multiplier runs
     out, the answer is the palette, not a bigger multiplier (0.52 bought only 56 -> 65). With
     FIELD now at real chroma this is back to a light touch. */
  const _M0 = E.getManifold(); E.setManifold(0.11);   // barely over the book's own 0.10
  // ⚠ SHADOWS — every mark modelled from the DOOR, not from a flat global rake (see the same
  // note in light.mjs). On a page with one light in the middle of it this is nearly free depth.
  E.setReliefLight({ x: 400, y: 255 });
  // per-mark, per-frame — independent for neighbours (a sparkle, not a patch) and periodic
  // in the frame, so drawing d closes back onto drawing a
  const _hash3 = (a, b, f) => {
    // ⚠ THE FRAME HAS TO BE MIXED BEFORE IT IS ADDED. With `f` entering as a plain term and
    // only one round of mixing after it, frames 3 and 4 picked almost the SAME marks — so
    // the ring came out lopsided (the river changed 57%, 55%, 37%, 37% between its four
    // pairs instead of evenly). A hash whose inputs are the numbers 0..3 has to spread them
    // itself; nothing else in the expression is going to do it.
    const g = Math.imul(f ^ 0x27d4eb2d, 0x9e3779b1);
    let h = (Math.imul(a, 374761393) + Math.imul(b, 668265263) + g) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    h = Math.imul(h ^ (h >>> 15), 0x85ebca6b);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  };

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
  const head = [door.x, door.y1 + 9], mouth = [door.x, H + 36];   // ⭐ Sep 23: starts UNDER the sill (Ezek 47:1), not inside the doorway
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
  /* ⚠⚠ THE WHEEL ITSELF WAS THE LIMIT. Punching saturation could only take this land from
     chroma 46 to 60, because FIELD started as greyish mauves (#6a78a8, #b094c0…) — a
     multiplier cannot make a colour out of a near-neutral. The palette is now a real
     chromatic sweep, blue through violet and magenta to gold, rising in value toward the
     door. Munch's rule is the licence and the page's own line is the reason: colour is free,
     not realistic, and this page is "a whole world of colour" seen through an open way. */
  /* ⚠⚠ AND THIS PALETTE GOES BACK TOO. I replaced it with a chromatic sweep to chase
     "exciting", and what I had replaced was the BOOK'S OWN post-resurrection palette — light
     blue, lilac, pink, peach, gold: the exact family the skill names for every page after the
     resurrection (Isa 35:1). Fred: "make the color palette similar to what we have so it is
     not so different." These are those tints again, and nothing else. */
  // ⚠ warmed a step at every stop — same family (light blue, lilac, pink, peach, gold), but
  // this page measured only +6 on red-minus-blue while `light` next door was at +29, and a
  // cold field is a sober one however bright it is. Warmth is most of what "happy" means.
  /* ⚠⚠ THE SAME FAMILY, TAKEN AT FULL STRENGTH. The punch had run out of room: it is a
     multiplier on saturation, and these tints started near-neutral (#7b83ac is about 20%
     saturated), so even at 0.52 the page only reached chroma 65 against its neighbour's 118
     and still read washed. These are the identical HUE ANGLES — blue, lilac, pink, peach,
     gold, the book's post-resurrection family (Isa 35:1) — carried at the chroma they can
     actually hold. It is the same palette, not a different one; it is simply no longer greyed. */
  const FIELD = ['#6b7fd0', '#9b7ad8', '#d67ab0', '#f89478', '#ffc040'];
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
  /* ⚠⚠ A SCALE GRADIENT, MEASURED FROM THE DOOR. Every mark on this land was len 26, lw 5.5 —
     one size everywhere — so at full resolution the whole world outside the doorway came out
     as identical fat lozenges, the same fault `light` had. A brushmark has to get BIGGER with
     distance, and here the distance that matters is distance from the door: fine and dense
     where the light is, broad and open out at the edges of the world. That does two things at
     once — it gives the land air and depth, and it aims the whole page at the way in. */
  const cT = (x, y) => Math.min(1, Math.hypot(x - dc[0], (y - dc[1]) * 0.95) / 460);
  // ⭐ DETAIL PASS (Sep 8). EVERY STROKE DRAWS ITS OWN WIDTH AND LENGTH (Fred: "use no
  // rules") — hashes on POSITION, never the rng, so every drawing of the ring keeps its
  // sequence. The rim's fat lozenges become strokes; the scale gradient toward the door stays.
  const free = (x, y, salt) => { const n = Math.sin(x * 12.9898 + y * 78.233 + salt) * 43758.5453; return n - Math.floor(n); };
  const widthOf  = (x, y, salt) => 0.40 + 3.2 * Math.pow(free(x, y, salt), 2.6);
  const lengthOf = (x, y, salt) => 0.40 + 1.5 * Math.pow(free(x, y, salt + 17), 1.5);
  strokes(out, counter, {
    rng, n: 3400,   // more marks because they are smaller near the door — the coverage holds
    sample: rej(-10, -10, 810, 510, (x, y) => !onRiver(x, y)),
    dir: skyDir,
    col: (x, y, r) => {
      const g = gD(x, y);
      let c = ramp(FIELD, fbm(x / 120, y / 120, 31) * 0.7 + (y / H) * 0.3);
      for (const [ex, ey, ec] of EGLOW) { const d2 = Math.hypot(x - ex, y - ey); c = mix(c, ec, Math.exp(-d2 / 95) * 0.5); }   // eddy cores breathe faint jewel light
      c = mix(c, '#ffe6b0', g * 0.78);            // the door's warmth flooding the land
      /* ⚠ AND THE LAND GOES DOWN WHERE THE DOOR'S LIGHT DOES NOT REACH. Finer marks let more
         of the pale ground through, and the corner the poem sits in drifted to luma 144 —
         the brightest text ground in the book. Deepening by the INVERSE of the door's own
         light fixes the reading and is the same chiaroscuro the page is built on: the way in
         blazes harder for the far country being darker. */
      // ⚠ and the far country goes down into a COLOUR, not a grey — deep violet or deep
      // teal, chosen per mark, so the land keeps its chroma exactly where it loses its light
      // ⚠ and the far country is no longer put in the cold. Deep violet and deep teal at 0.34
      // made the world outside the door read as gloom the reader is being rescued FROM; this
      // page is an invitation, and the country it opens on should look worth walking into.
      const _sh = _hash3((x * 4) | 0, (y * 4) | 0, 3) < 0.5 ? '#4a2a6a' : '#2a4a5e';
      /* ⚠ 0.48. With the land this much brighter the poem's ground had reached 152 — white
         text on bright pink, which a child cannot read, and the reading is not negotiable.
         Deepening by the INVERSE of the door's own light is the honest fix rather than a dark
         patch under the text: the far country goes down, the way in blazes harder for it, and
         the page keeps one light. */
      c = mix(c, _sh, Math.pow(1 - g, 2.0) * 0.48);
      /* ⚠⚠ THE WALLPAPER IS WHAT SPARKLES. Fred: "draw several types of the wallpaper with
         different color and cycle it". This land is the wallpaper of the page and it was the
         one thing on it that never changed — the boil was spent on the river. Now a share of
         these marks take a different colour off the same wheel for one drawing and come back,
         each deciding on its own, so cycling the plane reads as the whole field glinting
         rather than as a picture being swapped. */
      const _ix = (x * 4) | 0, _iy = (y * 4) | 0;
      if (_hash3(_ix, _iy, _FR) < 0.10) {
        c = mix(c, ramp(FIELD, _hash3(_ix ^ 0x9e37, _iy + 7919, _FR + 5)), 0.78);
      }
      return jig(c, r, 11);
    },
    // long flowing strokes that FOLLOW the wheel (high follow, low wild = deep water)
    len: (x, y) => (7 + 32 * Math.pow(cT(x, y), 1.25)) * lengthOf(x, y, 11),
    lw: (x, y) => (1.4 + 4.6 * Math.pow(cT(x, y), 1.35)) * widthOf(x, y, 13),
    steps: 4, follow: 0.91, wild: 0.05, lenJ: 0.3, wJ: 0.3, impasto: 0.5, relief: 0.4,
    aJ: (x, y) => 0.14 + gD(x, y) * 0.28,
  });

  /* ⚠⚠⚠ THE WHITE PASS. Fred: "incorporate a lot of white as well." It cannot be done inside
     the colour function: `STROKE_OPACITY = 0.6`, so every field mark GLAZES, and a mark set to
     white is only ever 60% white over what is beneath it — the plate measured under 1% white
     however high the share went. A highlight is OPAQUE and goes on LAST; that is what impasto
     is. So this is its own pass at op 0.95, over the land, on the land's own flow and scale.
     ⚠ A share winks with the ring, and the switch is in `col`, never in `sample` — a mark
     that is "off" this drawing paints the land colour instead of white. Both branches draw
     one r() and call jig once, so the rng stream is identical whatever the frame. */
  strokes(out, counter, {
    rng, n: 2400,   // ⚠ same lesson as light's: a veil over everything is a coat of size
    sample: rej(-10, -10, 810, 510, (x, y) => !onRiver(x, y)),
    dir: skyDir,
    col: (x, y, r) => {
      const t = r();                                   // drawn on both branches
      const wx = (x * 4) | 0, wy = (y * 4) | 0;
      /* ⚠ HALF WHAT `light` TAKES. At 0.58/0.28 this page came out 13% near-white against
         light's 7 — its land marks are bigger and denser, so the same share covers far more
         of the page — and it bleached: the poem's ground went to 160, white text on almost
         white. The share that reads as "a lot of white" is not a number, it is an AREA, and
         the area depends on how big that page's marks are. */
      /* ⚠⚠ AND THE WHITE GOES WHERE THE LIGHT IS. Spread evenly it bleached the far corners
         — the poem's ground reached 148, white text on nearly white — and it was untrue as
         well as unreadable: highlights belong where something is being lit. Scaling the share
         by the door's own reach fixes the reading and the physics in one line, and it gives
         the page another gradient pointing at the way in. */
      const wg = gD(x, y);
      const on = _hash3(wx, wy, 7) < 0.03 + 0.48 * wg
              || _hash3(wx, wy, _FR + 11) < 0.015 + 0.24 * wg;   // almost none out in the dark
      if (!on) {
        const g2 = gD(x, y);
        let c2 = ramp(FIELD, fbm(x / 120, y / 120, 31) * 0.7 + (y / H) * 0.3);
        c2 = mix(c2, '#ffe6b0', g2 * 0.78);
        return jig(c2, r, 11);
      }
      return jig(ramp(['#ffffff', '#fffdf4', '#fff6e2'], t), r, 3);
    },
    // ⚠ transparent, like light's — many more marks at a third the opacity, so they overlap
    // into a veil the colour shows through instead of sitting on top as white confetti
    len: (x, y) => (7 + 32 * Math.pow(cT(x, y), 1.25)) * 0.9 * lengthOf(x, y, 21),
    lw: (x, y) => (1.4 + 4.6 * Math.pow(cT(x, y), 1.35)) * 0.76 * widthOf(x, y, 23),
    steps: 3, follow: 0.9, wild: 0.05, lenJ: 0.3, wJ: 0.3, impasto: 0.5, relief: 0.35, op: 0.34,
  });

  /* ⚠ A GRADIENT GLAZE out of the doorway — the same move as `light`'s: a broad warm wash so
     the land has air in it and the way in is felt before it is looked at. Over the land,
     under the glory. */
  out.push('<defs><radialGradient id="cmwarm" cx="50%" cy="50%" r="50%">'
    + '<stop offset="0" stop-color="#ffe6ae" stop-opacity="0.34"/>'
    + '<stop offset="0.48" stop-color="#ffc57a" stop-opacity="0.15"/>'
    + '<stop offset="1" stop-color="#ffc57a" stop-opacity="0"/></radialGradient></defs>');
  out.push(`<ellipse cx="400" cy="255" rx="470" ry="330" fill="url(#cmwarm)"/>`);
  counter.n += 2;

  /* ---------------- 2. THE GREAT GLORY around the door (Rev 21:23) ----------------
     a vast bright halo first, so the door is the brightest thing on the page. */
  const _mid0 = out.length;   // [MID plane] the glory + the door-frame begin here
  strokes(out, counter, {
    // ⚠ 700, not 1050. Making the marks finer near the door and then adding more of them
    // turned the halo into a solid gold burst that buried both the doorway and the river —
    // and the river is what this page's own verse names ("let him take the water of life
    // freely", Rev 22:17), so it is the one thing that may not be covered. Finer marks, not
    // more of them.
    rng, n: 700,
    sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 0.9) * 230; return [dc[0] + Math.cos(a) * d, dc[1] + Math.sin(a) * d * 0.95]; },
    dir: (x, y) => Math.atan2(y - dc[1], x - dc[0]),
    col: (x, y, r) => jig(ramp([GOLD_HOT, GOLD_PALE, GOLD, GOLD_DEEP, '#b98a3a'], Math.hypot(x - dc[0], (y - dc[1]) / 0.95) / 230), r, 9),
    // the halo is finest at the threshold and opens as it goes out, like the land beyond it —
    // and it breathes with the beams, a shade behind them
    len: (x, y) => (5 + 20 * Math.min(1, Math.hypot(x - dc[0], (y - dc[1]) / 0.95) / 230))
      * (1 + 0.18 * Math.cos(2 * Math.PI * (PH - 0.12))),
    lw: (x, y) => 1.1 + 2.6 * Math.min(1, Math.hypot(x - dc[0], (y - dc[1]) / 0.95) / 230),
    steps: 2, impasto: 0.5,
  });
  // BOLD RAYS beaming out from the open way (long, legible beams of welcome)
  strokes(out, counter, {
    rng, n: 110,
    sample: r => { const a = r() * Math.PI * 2, d = 40 + r() * 90; return [dc[0] + Math.cos(a) * d, dc[1] + Math.sin(a) * d * 0.92]; },
    dir: (x, y) => Math.atan2(y - dc[1], x - dc[0]),
    col: (x, y, r) => jig(mix(GOLD_HOT, GOLD_PALE, r() * 0.5), r, 6),
    /* ⚠ THE BEAMS KEEP OFF THE WATER. They radiated in every direction including straight
       down, so the long ones lay across the river — and the river is the one thing this
       page's verse names (Rev 22:17). A ray aimed down the channel is cut short; sideways and
       upward they run their full length. The light still comes out of the door in every
       direction, it simply does not drown the water coming out with it. */
    len: (x, y) => {
      const dx = x - dc[0], dy = y - dc[1], L = Math.hypot(dx, dy) + 1e-6;
      const down = Math.max(0, dy / L);                       // 1 straight down, 0 sideways
      // ⚠ and they REACH and draw back, with the crest running round the fan, so the welcome
      // pours out of the doorway instead of standing there
      const a2 = Math.atan2(dy, dx);
      const beat = 1 + 0.30 * Math.cos(2 * Math.PI * PH - a2 * 2);
      return (34 + L * 0.42) * (1 - 0.74 * Math.pow(down, 2.0)) * beat;
    },
    lw: 1.8, steps: 2, lenJ: 0.6,
  });
  // KLIMT GOLD — a great gilded glory of concentric rings + dots around the gate
  klimtGold(out, counter, rng, dc[0], dc[1], 96, 232, { rings: 9, opacity: 0.66, squash: 0.94 });

  /* ---------------- 3. THE DOOR — the open way, a whole world of colour beyond ----------------
     dark posts + lintel so the gold has a shape to blaze within (chiaroscuro). */
  /* ⚠⚠ ONLY THE FRAME STAYS STILL. Fred: "make the door ... alive." The glory, the beams and
     the gilded halo were all inside `midRanges` together with the door-frame — and `mid` can
     never boil, because a boil doubles anything ruled or built into a ghost of itself (the
     twoways lesson). So the whole blaze was frozen to protect three straight lines.
       Split them: the frame alone is claimed for `mid`, and everything that is LIGHT falls
     through into `bg`, which already cycles. Now the radiance round the door moves and the
     doorway itself does not — which is also the truth of it. */
  const _frame0 = out.length;
  const fl = door.w / 2 + 8;
  paintPath(out, counter, rng, [[door.x - fl, door.y1 + 2], [door.x - fl, door.y0 - 6]], (x, y, r) => jig('#2e1f18', r, 6), { lw: 7, len: 7, density: 0.95, jitter: 0.6 });
  paintPath(out, counter, rng, [[door.x + fl, door.y1 + 2], [door.x + fl, door.y0 - 6]], (x, y, r) => jig('#2e1f18', r, 6), { lw: 7, len: 7, density: 0.95, jitter: 0.6 });
  paintPath(out, counter, rng, [[door.x - fl - 5, door.y0 - 6], [door.x + fl + 5, door.y0 - 6]], (x, y, r) => jig('#2e1f18', r, 6), { lw: 7.5, len: 7, density: 0.95, jitter: 0.6 });
  /* ⭐ Sep 23 — Ezek 47:1: "waters issued out from under the THRESHOLD of the house." The door
     had posts and a lintel and no threshold, so the water had nothing to come out from under.
     A sill now: one straight worn slab across the door's foot (a made thing, a straight line),
     its top edge lit by the doorway, its face in shadow where the water leaves it. Own rng. */
  {
    const sr = mulberry32(seed + 4701), sy = door.y1 + 3;
    out.push(`<path d="M${R1(door.x - fl - 7)} ${R1(sy - 3)}L${R1(door.x + fl + 7)} ${R1(sy - 3)}L${R1(door.x + fl + 10)} ${R1(sy + 7)}L${R1(door.x - fl - 10)} ${R1(sy + 7)}Z" fill="#4a3424"/>`); counter.n++;
    paintPath(out, counter, sr, [[door.x - fl - 6, sy - 2.5], [door.x + fl + 6, sy - 2.5]], (x, y, r) => jig(mix('#fff0c4', '#e2b86a', r() * 0.5), r, 5), { lw: 2.2, len: 6, density: 0.95, jitter: 0.25 });
    paintPath(out, counter, sr, [[door.x - fl - 9, sy + 5.5], [door.x + fl + 9, sy + 5.5]], (x, y, r) => jig('#2a1c14', r, 4), { lw: 1.8, len: 6, density: 0.9, jitter: 0.25 });
  }
  midRanges.push([_frame0, out.length]);   // ← the door-frame + its sill ONLY (see the note above)

  // THROUGH THE DOOR — a whole world of light and colour: a white-hot blaze at the
  // centre opening into bright sky above and a lush colour land below. Home is not a
  // dark room; it is colour after the long dark.
  {
    const x0 = door.x - door.w / 2 + 2, x1 = door.x + door.w / 2 - 2;
    const inH = door.y0 + (door.y1 - door.y0) * 0.5;
    /* ⚠⚠ AND THROUGH THE DOOR IS A PLACE, NOT CONFETTI. The colours here were always right —
       sky above the line, land below it — but every mark was len 12 lw 2.8, so what a reader
       actually saw was a rectangle of coloured specks. It gets the same scale gradient as
       everything else on the page (fine at the blaze, opening outward), and the horizon gets
       a real seam of far light. Then "he shall go in and out, and FIND PASTURE" (John 10:9) is
       something you can see through the doorway instead of something the caption asserts. */
    const dIn = (x, y) => Math.min(1, Math.hypot((x - door.x) / (door.w * 0.5),
                                                 (y - inH) / ((door.y1 - door.y0) * 0.5)));
    /* ⚠⚠⚠ SEVERAL DRAWINGS OF THE COUNTRY, NOT ONE PICTURE RESHADED. Fred: "you are just
       putting a * that is transparent to cheat it. i want you to draw several type of the art
       inside the door." He is exactly right and it is the same correction he has had to make
       three times now: winking a mark to another colour is RECOLOURING, and recolouring is not
       drawing. Whatever it measures, the marks were in the same places in all four frames.
         So this pass takes its own RNG, RESEEDED PER FRAME. Every mark is placed afresh — a
       different scatter, a different arrangement of the same country — and the horizon of it
       shifts a little between drawings too. Four drawings, four paintings of the world beyond
       the door, sharing only what makes it that world: sky above the line, land below it, the
       blaze in the opening.
       ⚠ A SEPARATE STREAM ALSO SOLVES THE DESYNC FOR GOOD. Because this pass no longer draws
       from the plate's shared rng at all, nothing downstream of it can shift between frames —
       the river, the reeds and the kingfisher are byte-identical whatever happens in here.
       That is a better guarantee than balancing branches by hand. */
    const inRng = mulberry32((seed ^ 0x60de) + _FR * 7919);
    const inH2 = inH + Math.sin(2 * Math.PI * PH) * 8;   // the far horizon of it lifts and settles
    strokes(out, counter, {
      rng: inRng, n: 2400,
      sample: rej(x0, door.y0 + 2, x1, door.y1 - 2),
      dir: () => Math.PI / 2,
      col: (x, y, r) => {
        const jt = r() - 0.5;
        const up = y < inH2;
        const span = door.y1 - door.y0;
        const bl = 36 * (1 + 0.22 * Math.cos(2 * Math.PI * PH));
        let c;
        if (Math.abs(x - door.x) < door.w * 0.16 && Math.abs(y - inH2) < bl) {
          c = GOLD_HOT;
        } else if (Math.abs(y - inH2) < 6) {
          c = mix('#fff4cf', '#ffd889', 0.5 + jt * 0.8);
        } else {
          c = up
            ? ramp([GOLD_PALE, '#f6c06a', '#ec8f86', '#8ec6cc', '#86b6dc'], (inH2 - y) / span * 1.7 + jt * 0.22)
            : ramp([GOLD, '#c6d258', '#5aa86e', '#3f9a96', '#4a86c0'], (y - inH2) / span * 1.7 + jt * 0.22);
        }
        return jig(c, r, 8);
      },
      len: (x, y) => 4 + 13 * dIn(x, y), lw: (x, y) => 1.0 + 2.6 * dIn(x, y),
      steps: 2, lenJ: 0.5, impasto: 0.6,
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
    /* ⭐ Sep 23 — THE RIVER LIES DOWN. On the page this channel read as a pale shape STANDING
       in the doorway (a figure, a mountain) — an opaque #bfe6f4 cone widening downward, every
       mark running along it. Water on the ground is seen THROUGH: Ezek 47:3-5, the waters rise
       "to the ankles… to the knees… a river that could not be passed over". So the bed is
       painted first — bright shallow sand at the sill, going down through clear aqua to deep
       blue at your feet — and the water marks lie over it half-transparent. */
    out.push(`<defs><linearGradient id="comeBed" gradientUnits="userSpaceOnUse" x1="0" y1="${R1(head[1])}" x2="0" y2="${H}"><stop offset="0" stop-color="#f2e2b0"/><stop offset="0.28" stop-color="#b8e0cc"/><stop offset="0.62" stop-color="#5fb8c8"/><stop offset="1" stop-color="#2c7fae"/></linearGradient></defs>`);
    out.push(`<path d="${d}Z" fill="url(#comeBed)"/>`); counter.n++;
    // the bed seen through the water: pebbles, clear in the shallows, drowning in blue as it deepens
    const br = mulberry32(seed + 4702);
    for (let i = 0; i < 420; i++) {
      const t = Math.pow(br(), 0.85), p = riverP(t), w = riverW(t);
      const x = p[0] + (br() - 0.5) * w * 0.94, y = p[1] + (br() - 0.5) * (4 + t * 16);
      if (!onRiver(x, y)) continue;
      const rx = (0.9 + br() * 2.2) * (0.5 + t * 2.2), stone = ['#d9b98a', '#c98f6a', '#a9b4c4', '#e7d3b4', '#b58e9e', '#8fa99a'][Math.floor(br() * 6)];
      const c = mix(stone, '#3f9cc0', Math.min(0.78, t * 0.9));
      out.push(`<ellipse cx="${R1(x)}" cy="${R1(y)}" rx="${R1(rx)}" ry="${R1(rx * 0.48)}" fill="${c}"/>`); counter.n++;
      if (t < 0.7) { out.push(`<ellipse cx="${R1(x - rx * 0.2)}" cy="${R1(y - rx * 0.16)}" rx="${R1(rx * 0.5)}" ry="${R1(rx * 0.2)}" fill="${mix(c, '#fffbe8', 0.45 * (1 - t))}"/>`); counter.n++; }
    }
    // the wet banks: a dark line where water meets earth, a lit lip just inside it
    for (const side of [1, -1]) {
      const bank = [];
      for (let t = 0.02; t <= 1.001; t += 0.04) { const pp = riverP(t), q = riverP(Math.min(1, t + 0.02)); let nx = -(q[1] - pp[1]), ny = q[0] - pp[0]; const nl = Math.hypot(nx, ny) || 1; bank.push([pp[0] + nx / nl * riverW(t) / 2 * side, pp[1] + ny / nl * riverW(t) / 2 * side, t]); }
      for (let i = 1; i < bank.length; i++) {
        const [ax, ay, t] = bank[i - 1], [bx, by] = bank[i];
        paintPath(out, counter, br, [[ax, ay], [bx, by]], (x, y, r) => jig(mix('#1f3c34', '#2e5446', r() * 0.5), r, 4), { lw: 1.6 + t * 4.5, len: 4, density: 0.9, jitter: 0.3 });
      }
    }
  }
  // the flowing water/light — curved bright ribbons running DOWN-FRAME toward the
  // viewer, warmest (gold) at the door, cooling to bright crystal blue as it nears
  // YOU; the door's gold reflected all down the stream.
  /* ⚠ AND ITS COLOUR DOES NOT CHANGE. When `light` was given the city's twelve stones to
     turn through (Rev 21:19-20), the obvious next move was to do the same here — and
     scripture forbids it: Rev 22:1, "a pure river of water of life, CLEAR AS CRYSTAL,
     proceeding out of the throne of God and of the Lamb." Clear is what this water is. The
     door's gold is reflected all down it and that is the only colour it may carry. What
     moves here is the current, not the hue.

  /* ⚠⚠ THE RIVER RUNS. Fred: "create several types of the art and animate it. make it
     alive." A river of living water that does not move is a painting of a river, and this
     page's sentence is an invitation — so the water is drawn four times with a wave of
     current running DOWN it, from the door to the reader.
     ⚠⚠ AND THE MARKS STAY WHERE THEY ARE. I first re-parameterised the water so each stroke
     rode a slot down the channel — it loops exactly, and it repainted the river. The old
     sampler is area-uniform (it throws darts at the box and keeps the ones on the water), so
     the wide mouth gets ten times the marks per unit length that the narrow head does, and
     that is where the crystal blue comes from. Riding slots gives every stretch the SAME
     number of marks, so the gold head was over-drawn and the blue mouth went thin. Twice in
     one session, on two different pages: **re-sampling a field to animate it repaints it.**
       So the placement is the original, mark for mark, and what travels is the water's
     REACH — each stroke lengthens and draws back as the crest passes. That is also what
     moving water actually looks like from above.
     ⚠ The reeds and the kingfisher share this plane and must not move: they are drawn below
     from the shared rng with no PH in them, and come's boil amplitude is 0 (build.mjs
     BOIL_BAND_PAGE) so the engine cannot displace them either. A displaced bird is two birds. */
  // two crests standing in the channel at once, travelling toward the reader
  // two currents braided: a long swell running to the reader, and a quicker ripple over it
  const flow = t => 1 + 0.38 * Math.cos(2 * Math.PI * (2 * t - PH))
                      + 0.18 * Math.cos(2 * Math.PI * (5 * t - 2 * PH));
  strokes(out, counter, {
    rng, n: 420,   // ⭐ Sep 23: was 920 — overlapping marks saturate into an opaque slab; the bed must show
    sample: rej(door.x - riverW(1) / 2 - 6, head[1] - 4, door.x + riverW(1) / 2 + 6, H + 30, onRiver),
    dir: (x, y) => { const { t } = riverInfo(x, y); const a = riverP(Math.max(0, t - 0.02)), b = riverP(Math.min(1, t + 0.02)); return Math.atan2(b[1] - a[1], b[0] - a[0]); },
    col: (x, y, r) => {
      const { t } = riverInfo(x, y);
      let c = ramp(['#fff3cd', '#dff2e2', '#a6dfe8', '#62c2de', '#3ea6d6'], t * 1.05 + (r() - 0.5) * 0.18);
      /* ⚠ THE CRESTS WINK, AND THAT IS THE RIVER'S OWN SPARKLE. `light` gets its glint by a
         few marks taking a different colour each drawing; this water may not — Rev 22:1
         calls it "clear as crystal", so its hue is settled. But crystal is exactly the thing
         that SPARKLES, so what changes here is WHICH strokes are the white crests: a
         different one in nine every drawing, decided per mark by the same hash. No hue moves
         and the water still glitters.
         ⚠ the r() below is still drawn even though its value is no longer used — removing it
         would shift every rng draw after this point and repaint the whole river. */
      /* ⚠ AND MOST OF THEM HOLD. Re-rolling every crest each drawing put a different one in
         nine on the water each time, and the river went from 32% changed between drawings to
         63% — that is not a sparkle, it is water boiling. So the crests are two kinds: seven
         in a hundred that are ALWAYS crests (frame-independent hash) and four that wink. The
         water keeps the same amount of white it always had; only a few of them move. */
      const _unused = r();
      const ix = (x * 4) | 0, iy = (y * 4) | 0;
      if (_hash3(ix, iy, 0) < 0.07 || _hash3(ix, iy, _FR + 1) < 0.04) c = '#ffffff';
      return jig(c, r, 8);
    },
    len: (x, y) => { const t = riverInfo(x, y).t; return (14 + t * 26) * flow(t); },
    lw: (x, y) => { const t = riverInfo(x, y).t; return (3 + t * 4.6) * (0.93 + 0.09 * flow(t)); },
    steps: 3, follow: 0.92, lenJ: 0.55, wild: 0.06, impasto: 0.4, op: 0.45,   // ⭐ Sep 23: see-through — the bed shows (clear as crystal)
  });
  /* the ripples lie ACROSS the current — the one mark that says "flat water". ⚠ First cut drew
     them as K full-width arcs evenly spaced and they read as the RUNGS OF A LADDER. Water breaks
     its light into short uneven dashes, scattered, crowding and growing as they come toward you
     (perspective). They hold still; what moves is the current's reach above. */
  {
    const rr = mulberry32(seed + 4703);
    for (let i = 0; i < 260; i++) {
      const t = 0.05 + Math.pow(rr(), 0.7) * 0.95, p = riverP(t), w = riverW(t);
      const cx = p[0] + (rr() - 0.5) * w * 0.86, cy = p[1] + (rr() - 0.5) * (3 + t * 14);
      if (!onRiver(cx, cy)) continue;
      const L = (2.5 + rr() * 7) * (0.4 + t * 1.8), bow = (0.4 + t * 1.6);
      const pts = [[cx - L / 2, cy], [cx, cy + bow * 0.6], [cx + L / 2, cy]];
      paintPath(out, counter, rr, pts.map(([x, y]) => [x, y + 0.9 + t * 1.6]), (x, y, r) => jig('#2f86a8', r, 4), { lw: 0.6 + t * 1.6, len: 3, density: 0.85, jitter: 0.2 });   // the trough
      paintPath(out, counter, rr, pts, (x, y, r) => jig(mix('#f6fdff', '#cdeef8', r()), r, 3), { lw: 0.5 + t * 1.3, len: 3, density: 0.9, jitter: 0.2 });                        // the lit crest
    }
    // where it comes out from under the sill: a low white spill of foam across the head
    for (let i = 0; i < 26; i++) { const x = head[0] + (rr() - 0.5) * riverW(0.02) * 1.3, y = head[1] + 1 + rr() * 7; out.push(`<ellipse cx="${R1(x)}" cy="${R1(y)}" rx="${R1(1 + rr() * 2.4)}" ry="${R1(0.6 + rr() * 0.8)}" fill="${rr() < 0.5 ? '#ffffff' : '#e6f7fb'}"/>`); counter.n++; }
  }
  // the door's golden thread running the whole length of the stream toward the walker
  strokes(out, counter, {
    rng, n: 150,
    sample: r => { const t = Math.pow(r(), 0.6); const p = riverP(t); return [p[0] + (r() + r() - 1) * riverW(t) * 0.22, p[1] + (r() - 0.5) * 4]; },
    dir: (x, y) => { const { t } = riverInfo(x, y); const a = riverP(Math.max(0, t - 0.02)), b = riverP(Math.min(1, t + 0.02)); return Math.atan2(b[1] - a[1], b[0] - a[0]); },
    col: (x, y, r) => jig(ramp([GOLD_HOT, GOLD_PALE, GOLD, GOLD_DEEP], (1 - riverInfo(x, y).t) * 0.85 + (r() - 0.5) * 0.25), r, 7),
    // the door's own gold rides the same current as the water round it
    len: (x, y) => 14 * flow(riverInfo(x, y).t), lw: 1.8, steps: 3, lenJ: 0.6, wJ: 0.45,
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

  E.setManifold(_M0);
  const ALT = 'A great radiant open door of light stands dead centre, blazing gold and ringed in glory, opening on a whole world of colour beyond — bright sky above, a lush colour land below. From under its threshold stone a clear river of living water flows out, shallow over bright pebbles at the door and deepening to blue as it broadens toward the viewer, ripples lying across it and reeds on its wet banks. The warm land all around turns toward the open way. An open, welcoming invitation: whosoever will, come and take the water of life freely.';

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
