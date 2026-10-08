// gen/plates/grave.mjs — "Three days" (the tomb sealed)
//
//   "And that he was buried, and that he rose again the third day
//    according to the scriptures."                — 1 Corinthians 15:4
//
// ⚠ A WHOLE SCENE, AT NIGHT.
//   "can you make the scene dark? since the story is that way" — the page says they laid
//   Him in the dark. The reference photograph gives the SHAPES; the story gives the hour.
//   "also take account of the stuff outside the portrait view. right now it is just a blob
//   of brown. we want to make a scene..."
//
// ⚠ AND THE LESSON OF THE FIRST NIGHT ATTEMPT, which came out a wall of stacked masonry
// with a tomb in it: **a scene is planes, not texture.** Rock everywhere at one value, one
// stroke size and one direction is a wall, however well brushed. What makes a picture read
// as a PLACE is that the upright things and the flat things are different values, and that
// the eye is given somewhere to go. So:
//
//   • The cliff does not span the plate. It ends at x≈208 in a steep left shoulder, and
//     left of that shoulder the land drops open — a valley, far hills, and the biggest
//     sky in the picture. That diagonal edge against the sky is the whole of the depth.
//   • The ground is a FLOOR, not more wall: sand from the cliff's foot forward, and it is
//     the palest large thing here, because a horizontal plane catches the sky and an
//     upright face does not. Same moon, opposite value. That contrast is what was missing.
//   • The cliff is a few big value shapes — dark mass, one moonlit brow, one lit facet —
//     with sparse chisel marks. Not a field of pebbles. Big shapes stay legible at the
//     ~110 plate-units the phone actually shows.
//
// The tomb is still traced from Fred's photograph: a tall doorway with a rounded head cut
// back into the face, a rib of rock beside it, a great boulder standing on the sand. The
// page's own line rules the one departure — the stone is rolled ACROSS, so the black left
// of it is a tall slot, with the held light escaping down the join. Shut, and visibly shut.
//
// Value plan: sand and the cliff's brow are the only pale things, the doorway is the one
// true black in the frame, the seam is the one warm note. No black anywhere else — the
// dark is deep blue going violet, so it stays air and not a hole.
export const name = 'grave';
export const title = 'Three days';
export const caption = 'They laid Him in the dark, and waited.';
export const seed = 30630406;
export const focal = { x: 400, y: 300 };
export const layers = [
  { name: 'bg', opaque: true },   // night sky, moon, the valley and its far hills
  { name: 'cliff' },              // the burial rock: its mass, its brow, the cut beside
  { name: 'dark' },               // the doorway — the one true black
  { name: 'stone' },              // the great stone, rolled across
  // ⚠ ONE seam plane, not three. The three-hand rig is right for a big passage of light, but
  // here it spent THREE full 1600x1000 depth planes — 19 MB decoded — on a gold hairline, and
  // that is a third of what was crashing the phone after `bridge`. The three hands are still
  // drawn; they are just drawn into ONE plane, and the plane breathes instead of cycling.
  { name: 'seam' },              // the held light — one plane, and it breathes
  { name: 'near' },               // the sand floor, the path, the scrub, the palm
];

export function paint(E, opts = {}) {
  const {
    mulberry32, fbm, curlV, mix, ramp, jig, strokes, rej,
    lightRadial, inscriptionText, greekRef, paintPath, swirlV,
    svgWrap, R1, W, H, GOLD, GOLD_PALE, GOLD_HOT,
  } = E;

  const rng = mulberry32(seed);
  const out = [];
  const counter = { n: 0 };
  const LAYER = opts.layer || 'full';
  const cliffR = [], darkR = [], stoneR = [], seamR = [], nearR = [];
  // ⭐ DETAIL PASS (Sep 8) — a LIGHT one: this night was built plane by plane over many
  // rounds and every relief is 0 on purpose (the flagstone lesson). Only the mark SIZES
  // change: every stroke its own width and length (Fred: "use no rules, a paint stroke just
  // exist because it exist"), beds without giants, a few more marks where there were slabs.
  const free = (x, y, salt) => { const n = Math.sin(x * 12.9898 + y * 78.233 + salt) * 43758.5453; return n - Math.floor(n); };
  const widthOf  = (x, y, salt) => 0.40 + 3.2 * Math.pow(free(x, y, salt), 2.6);
  const lengthOf = (x, y, salt) => 0.40 + 1.5 * Math.pow(free(x, y, salt + 17), 1.5);

  // ⚠ The bed is NOT nearly black (the lesson `lost` paid for): strokes never cover, and
  // every gap averages the plate back down to the rect underneath.
  out.push(`<rect width="${W}" height="${H}" fill="#241d4e"/>`);

  /* ---------------- the colour of the night ---------------- */
  // Fred: "use some random colors to make it ours! we can use dark colours since it is dark."
  // The plate was honest but monochrome — one blue-violet family, which is how a photograph
  // of a night looks, not how this book paints one. Munch's rule: colour is free, it is not
  // realistic. So the night gets deep TEAL, BOTTLE GREEN, INK, AUBERGINE, WINE and a burnt
  // umber, in DRIFTING FIELDS — a low-frequency noise decides which hue owns a region, so
  // neighbouring marks agree and the colour wanders the way weather does. Speckle averages
  // to grey; fields sing.
  //
  // ⚠ SHIFT THE HUE, NEVER THE VALUE. The first attempt MIXED each colour toward a dark
  // pigment, which is not colouring — it is dimming: the plate just went muddier and the
  // hues barely showed. Colour in a dark scene has to move around the wheel at the value
  // the night already set, so this converts to HSL, turns the hue, lifts saturation MOST
  // where the paint is darkest (shadows can carry colour that highlights cannot), and puts
  // the lightness back exactly as it found it.
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
  //       teal  ink  petrol  bottle  ink  teal  aubergine  wine  petrol  umber
  const HUES = [0.48, 0.62, 0.54, 0.36, 0.62, 0.48, 0.78, 0.94, 0.54, 0.07];
  const chroma = (c, x, y, k, sd = 211) => {
    const f = fbm(x / 155, y / 135, sd);
    const H = HUES[Math.min(HUES.length - 1, Math.floor(f * HUES.length * 1.25))];
    const rgb = HEXN(c);
    let [h, sa, l] = toHSL(rgb[0], rgb[1], rgb[2]);
    let d = H - h; if (d > 0.5) d -= 1; if (d < -0.5) d += 1;
    const kk = k * (0.6 + fbm(x / 62, y / 58, sd + 3) * 0.75);
    h = (h + d * kk + 1) % 1;
    sa = Math.min(0.66, sa + kk * 0.55 * (1 - l));     // the dark carries the colour
    const o = toRGB(h, sa, l);                          // ⚠ l goes back untouched
    return HEXS(o[0], o[1], o[2]);
  };

  /* ---------------- the bones ---------------- */
  const MOON = [104, 84];
  const moon = lightRadial(MOON[0], MOON[1], 900);
  const lit = (x, y) => Math.min(1, moon(x, y) * 1.3);
  // ⚠ AMBIENT SKY FILL — the fix for "the hole shadow thing is still there", which I twice
  // hunted as a shape I had painted. Measured off the raster, it was not a shape at all: the
  // rock right of the stone sat at luminance 28, the same as the open night sky, because the
  // moon is off to the LEFT and I lit everything from it alone. So a big lightless field
  // landed beside a disc at 111, and a large dark area next to a bright object IS a hole to
  // the eye, whatever it is made of. A night has TWO lights — the moon, and the whole sky
  // dome behind it — and the second one is why you can see into shadows outdoors at night.
  // Every rock surface now gets that floor, so nothing on the hill can fall to a void.
  // ⚠ CHECK THE WHOLE PLATE, NOT THE WINDOW. Fred: "are you just fixing the portrait
  // picture?" Measured at full width, the cure for the void had inverted the night — hill
  // at luminance 50-85 against a sky at 28. Outdoors after dark the SKY is the brightest
  // thing there is and the land is darker than it; that is what makes a night read as a
  // night. Both the fill and the glaze had been sized against a phone crop of the tomb,
  // where they looked right, and they bleached the whole formation everywhere else.
  const fill = (x, y) => 0.2 + 0.8 * lit(x, y);      // a floor under the shadows, not a wash
  const HZ = 372;                                           // the far plain, out to the left
  // the cliff: nothing until x≈208, then a steep shoulder up to a long undulating brow
  const rise = x => 1 / (1 + Math.exp(-(x - 208) / 24));
  // ══ THE ROCK ITSELF ═══════════════════════════════════════════════════════════════
  // Fred: "make the cave nice... right now you only have a slope. this is a work we do for
  // God. we give our best." He is right, and it is the deepest note yet: a smooth
  // exponential hump with a hole punched in it is a DUNE, and a cave in a dune is not a
  // tomb, it is a burrow. Rock does not curve like that. Rock STACKS. It steps, it stands
  // in walls, it fails in blocks — and the reason a real rock-cut tomb is awesome is that
  // someone hewed a door into a sheer FACE of the stuff.
  //
  // So the skyline stops being a formula and becomes a drawing: a profile set point by
  // point — a low shoulder at the left, a steep rise in steps, an escarpment standing over
  // the tomb, then a stepped fall past a buttress to the right — with jags laid over it.
  // And the tomb is cut into a VERTICAL WALL, which gets ledges, a talus of fallen rubble
  // at its foot, and corners where it turns away from the moon.
  const PROF = [[-24, 386], [34, 372], [88, 358], [132, 350], [172, 330], [198, 306],
                [216, 268], [238, 256], [268, 250], [286, 214], [330, 208], [372, 200],
                [430, 198], [470, 204], [498, 190], [524, 198], [546, 238], [576, 232],
                [610, 248], [652, 242], [696, 264], [748, 278], [824, 296]];
  const cliffTop = x => {
    let i = 0; while (i < PROF.length - 2 && PROF[i + 1][0] < x) i++;
    const a = PROF[i], b = PROF[i + 1];
    const t = Math.max(0, Math.min(1, (x - a[0]) / (b[0] - a[0])));
    return a[1] + (b[1] - a[1]) * t + Math.sin(x / 16.5) * 2.4 + (fbm(x / 24, 3.3, 311) - 0.5) * 8;
  };
  const WX0 = 292, WX1 = 536;                               // the sheer face the tomb is cut into
  const GY = x => HZ + 12 * rise(x) + 7 * Math.sin(x / 83 + 1.1) + 4 * Math.sin(x / 31);                         // the sand at the cliff's foot
  const FLOOR = 382;
  const DL = 344, DR = 440, DTOP = 268, DBOT = FLOOR + 2;    // the cave mouth: squat and broad
  const PL = 440, PR = 456;                                  // the rib of rock beside it
  const SX = 392, SY = 320, SW = 67, SH = 76;                // THE STONE — shutting it, entirely

  // three turning centres and the drift they sit in
  const VORT = [[MOON[0], MOON[1], 2.0, 200, 36], [438, 120, -1.5, 210, 44], [648, 86, 0.8, 175, 34]];
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

  /* 1. THE NIGHT --------------------------------------------------------------------- */
  // ⚠ THE SKY MUST NOT BE MADE OF THE SAME MARK AS THE ROCK. First night pass had both in
  // wide slab strokes at one value, so the picture was a single surface with a hole in it.
  // The night is BLUE, lighter than the rock, and painted in small churning marks; the rock
  // is violet-grey, darker, and chiselled. Hue, value and mark-size all separate them.
  strokes(out, counter, {
    rng, n: 900,
    sample: rej(-14, -14, 814, HZ + 8, (x, y) => y < cliffTop(x) + 4),
    dir: (x, y) => flow(x, y)[0],
    col: (x, y, r) => {
      const band = flow(x, y)[1];
      return jig(chroma(mix(ramp(['#2b2a63', '#353176', '#433d86', '#564c92', '#68599c'], Math.min(1, y / HZ * 0.95 + x / W * 0.16)),
        band > 0.5 ? '#5c5790' : '#171636', Math.abs(band - 0.5) * 0.5), x, y, 0.4, 211), r, 6);
    },
    // ⚠ impasto is a luminance GATE (`lum(fill) > impasto` → a dark understroke), NOT an
    // amount. A low number on a DARK plate outlines every single mark, and a night painted
    // that way comes out as stacked flagstones from edge to edge — sky included. This cost
    // three rebuilds. On dark plates keep it ABOVE the paint's own value.
    len: (x, y) => 40 * lengthOf(x, y, 11), lw: (x, y) => 5 + 6 * free(x, y, 13), steps: 3, follow: 0.9, lenJ: 0.3, wJ: 0.3, impasto: 0.46, relief: 0, op: 0.9,   // a bed: its own width each, no giants
  });
  strokes(out, counter, {
    rng, n: 5200,
    sample: rej(-14, -14, 814, HZ + 6, (x, y) => y < cliffTop(x) + 2),
    dir: (x, y) => {                                   // lie down IN the stream
      const [a, b] = curlV(x, y, 36, 150);
      const f = flow(x, y);
      return f[0] + (a - 0.5) * 0.25 + (b - 0.5) * 0.25;
    },
    col: (x, y, r) => {
      const t = Math.min(1, (y / HZ) * 0.85 + fbm(x / 120, y / 110, 61) * 0.22);
      const band = flow(x, y)[1];                       // light band, dark band, along the current
      let c = ramp(['#2c2b66', '#38347a', '#47408b', '#584c96', '#6a5da2'], t);
      c = mix(c, band > 0.5 ? '#6a66a2' : '#1a1942', Math.abs(band - 0.5) * 0.62);
      c = chroma(c, x, y, 0.42, 211);                        // the current's own colour
      return jig(mix(c, '#9aa2d8', lit(x, y) * 0.5), r, 5);
    },
    // ⚠ relief bevels every mark with a lit and a shadow edge — on a field of same-size,
    // same-direction marks that tiles into roof-scales, which is what made this night read
    // as stacked stone from edge to edge. The sky takes no bevel at all.
    len: (x, y) => 38 * lengthOf(x, y, 21), lw: (x, y) => 3.4 * widthOf(x, y, 23), steps: 5, follow: 0.96, wild: 0.04, lenJ: 0.3, wJ: 0.3, aJ: 0.18, impasto: 0.46, relief: 0,
  });
  for (let c = 0; c < 4; c++) {                        // night cloud, moonlit along its upper edge
    const cx = [226, 372, 592, 730][c], cy = [150, 84, 110, 158][c];
    const cw = [148, 116, 172, 138][c], chh = [15, 12, 19, 15][c];
    strokes(out, counter, {
      rng, n: 340,
      sample: r => { const t = r(); const x = cx - cw / 2 + t * cw;
                     const lift = Math.sin(t * Math.PI) * chh;
                     return [x, cy - lift + Math.pow(r(), 0.6) * (lift * 1.7 + 7)]; },
      dir: (x) => 0.05 + Math.sin((x - cx) / 40) * 0.25,
      col: (x, y, r) => {
        const t = (x - (cx - cw / 2)) / cw;
        const top = Math.max(0, 1 - (y - (cy - Math.sin(t * Math.PI) * chh)) / 13);
        return jig(chroma(mix('#282456', mix('#5a5c96', '#a7abd8', lit(x, y)), Math.min(1, top * 0.85 + r() * 0.2)), x, y, 0.36, 263), r, 5);
      },
      len: (x, y) => 20 * lengthOf(x, y, 31), lw: (x, y) => 3.6 * widthOf(x, y, 33), steps: 3, follow: 0.96, lenJ: 0.3, wJ: 0.3, impasto: 0.72, relief: 0, op: 0.72,
    });
  }
  /* ⭐ "SEEK HIM THAT MAKETH THE SEVEN STARS AND ORION, AND TURNETH THE SHADOW OF DEATH INTO THE
     MORNING" (Amos 5:8). This is the page of the shadow of death — and the next page is the
     morning. So the two constellations scripture calls by name stand over the tomb, in the one
     clear gap between the night clouds: Orion upright, Betelgeuse orange at his shoulder and
     Rigel blue-white at his foot, and up to his right the Pleiades, where they really are. A
     reader who knows the sky will find them; a child sees that tonight the stars are not
     scattered — Somebody placed them. (Sep 21, the fresh scripture search.) */
  // ⚠ sized and placed so every star clears the cloud tops (at 78 tall, Rigel sat ON a cloud —
  // a star in front of a cloud is a sticker). The clear sky here is the band above y≈72.
  E.paintConstellation(out, counter, 'orion', 478, 41, 58, { op: 0.95 });
  E.paintConstellation(out, counter, 'pleiades', 588, 20, 58, { op: 0.95 });
  out.push(`<circle cx="${MOON[0]}" cy="${MOON[1]}" r="12" fill="#eef1ff"/>`); counter.n++;
  strokes(out, counter, {                                    // its halo, and nothing else pale up here
    rng, n: 420,
    sample: r => { const a = r() * Math.PI * 2, d = 11 + Math.pow(r(), 1.7) * 34; return [MOON[0] + Math.cos(a) * d, MOON[1] + Math.sin(a) * d]; },
    dir: (x, y) => Math.atan2(y - MOON[1], x - MOON[0]) + Math.PI / 2,
    col: (x, y, r) => jig(mix('#b9c1ee', '#242a55', Math.min(1, Math.hypot(x - MOON[0], y - MOON[1]) / 40)), r, 5),
    len: 5, lw: 1.6, steps: 2, lenJ: 0.7, op: 0.3, relief: 0,
  });
  for (let i = 0; i < 96; i++) {                       // and more of them, in drifts rather than evenly
    const cluster = i % 3 === 0;
    const sx = cluster ? 16 + rng() * 768 : 16 + (rng() + rng() + rng()) / 3 * 768;
    const sy = 6 + Math.pow(rng(), 1.3) * 280;
    if (sy > cliffTop(sx) - 6) continue;
    out.push(`<circle cx="${R1(sx)}" cy="${R1(sy)}" r="${(0.5 + Math.pow(rng(), 2) * 1.7).toFixed(1)}" fill="${rng() < 0.2 ? '#fff3dd' : '#dae0f8'}" opacity="${(0.22 + rng() * 0.55).toFixed(2)}"/>`);
    counter.n++;
  }
  // the valley: far hills stepping back on the left, where the land opens
  for (let g = 0; g < 3; g++) {
    const t = g / 2;
    const hy = x => HZ - 46 + g * 15 - (24 - g * 7) * Math.sin(x / (150 + g * 60) + g * 2.1)
                                     - (10 - g * 3) * Math.sin(x / (52 + g * 26) + g);
    strokes(out, counter, {
      rng, n: 260 - g * 60,
      sample: r => { const x = -14 + r() * 828; const y = hy(x) + Math.pow(r(), 0.7) * (52 - g * 12); return (y < cliffTop(x) - 2 && y < HZ + 4) ? [x, y] : null; },
      dir: x => 0.03 + Math.sin(x / 120) * 0.1,
      col: (x, y, r) => jig(chroma(mix(ramp(['#2b3160', '#343b72', '#3f477f'], t), '#98a1d4', lit(x, y) * 0.5 * (1 - t)), x, y, 0.34, 269), r, 4),
      len: (x, y) => (40 - g * 8) * lengthOf(x, y, 41 + g), lw: (x, y) => (4.5 - g) * widthOf(x, y, 45 + g), steps: 3, follow: 0.99, lenJ: 0.3, wJ: 0.3, impasto: 0.46, relief: 0, op: 0.92 - t * 0.32,
    });
  }
  // ⚠ THE CITY, DARK. The tomb is outside the walls, so the city belongs in this picture —
  // but it must be a SILHOUETTE with almost no light in it. This book's lit city is the
  // Father's house, and a warm town on the horizon here would read as "home is over there"
  // on the one page where the reader must feel that nothing is coming. It sleeps: two cold
  // lamps on a wall, and the rest is shape. (It also gives the empty left half a subject.)
  {
    const cxs = 118, base = HZ - 16;
    const wall = [];
    for (let i = 0; i <= 26; i++) {
      const x = cxs - 68 + i * 5.4;
      const t = i / 26;
      let top = base - 9 - Math.sin(t * 3.1) * 3;
      if (i === 5 || i === 6) top = base - 20;                  // a tower
      if (i === 14) top = base - 17;
      if (i === 21 || i === 22) top = base - 23;                // and the great one
      wall.push([x, top]);
    }
    out.push(`<path d="M${wall.map(q => R1(q[0]) + ' ' + R1(q[1])).join('L')}L${R1(cxs + 72)} ${R1(base + 5)}L${R1(cxs - 68)} ${R1(base + 5)}Z" fill="#22254a"/>`);
    counter.n++;
    strokes(out, counter, {
      rng, n: 260,
      sample: r => { const i = (r() * (wall.length - 1)) | 0;
                     return [wall[i][0] + (r() - 0.5) * 6, wall[i][1] + r() * (base + 4 - wall[i][1])]; },
      dir: () => Math.PI / 2,
      col: (x, y, r) => jig(ramp(['#1b1e3e', '#242749', '#2f3157', '#3c3d66'], r() * 0.9 + lit(x, y) * 0.25), r, 5),
      len: 7, lw: 2.4, steps: 2, lenJ: 0.6, relief: 0, op: 0.9,
    });
    paintPath(out, counter, rng, wall.filter((_, i) => i % 2 === 0),
      (x, y, r) => jig(mix('#2e3157', '#767ba8', lit(x, y) * 0.8 + r() * 0.2), r, 6), { lw: 1.2, len: 4, density: 0.5, jitter: 0.6 });
    [[cxs - 41, base - 14], [cxs + 46, base - 16]].forEach(([lx, ly]) => {   // two cold lamps, awake
      out.push(`<circle cx="${R1(lx)}" cy="${R1(ly)}" r="1.1" fill="#cfd6f4" opacity="0.5"/>`);
      counter.n++;
    });
  }
  strokes(out, counter, {                                    // the plain between the hills and us
    rng, n: 200,
    sample: r => { const x = -14 + r() * 828; const y = HZ - 12 + r() * 26; return y < cliffTop(x) - 1 ? [x, y] : null; },
    dir: () => 0.02,
    col: (x, y, r) => jig(mix('#2e3158', '#4b4a72', lit(x, y) * 0.7 + r() * 0.15), r, 4),
    len: 54, lw: 8, steps: 3, follow: 0.995, lenJ: 0.5, relief: 0, op: 0.8,
  });

  /* 2. THE BURIAL ROCK — a mass, in a few big values ---------------------------------- */
  const _cliff = out.length;
  {   // its silhouette, laid solid so the mass is ONE shape before any mark goes on it
    const pts = [];
    for (let x = -14; x <= 814; x += 8) pts.push(`${R1(x)} ${R1(cliffTop(x))}`);
    out.push(`<path d="M${pts.join('L')}L814 520L-14 520Z" fill="#1c1f3a"/>`); counter.n++;
  }
  // ⚠ NOT IN SLABS. A 40-wide ribbon is a visible brick; a face built of them is masonry.
  // The face is many narrow marks running DOWN it the way weather runs down a rock, and the
  // drawing is done by VALUE (brow lit, hollows dark), not by outlining each stone.
  strokes(out, counter, {
    rng, n: 4200,
    sample: rej(140, 170, 814, 400, (x, y) => y > cliffTop(x) && y < GY(x) + 6),
    dir: (x, y) => Math.PI / 2 - 0.5 + (fbm(x / 90, y / 60, 71) - 0.5) * 1.1,
    col: (x, y, r) => {
      const brow = Math.max(0, 1 - (y - cliffTop(x)) / 44);          // the moon only reaches the top
      const facet = Math.max(0, 1 - Math.abs(x - 252) / 230) * 0.34;  // and the left-turning facet
      const hollow = fbm(x / 130, y / 70, 73) * 0.3;
      return jig(chroma(ramp(['#1f2139', '#2a2b45', '#383650', '#4c465d', '#6d6570', '#968b89'],
        Math.min(1, 0.06 + fill(x, y) * 0.5 + brow * 0.6 + facet * fill(x, y) + hollow - 0.1)), x, y, 0.36, 223), r, 5);
    },
    len: (x, y) => 26 * lengthOf(x, y, 51), lw: (x, y) => 3.8 * widthOf(x, y, 53), steps: 4, follow: 0.92, lenJ: 0.3, wJ: 0.3, aJ: 0.4, impasto: 0.46, relief: 0,
  });
  strokes(out, counter, {                                  // THE SHEER FACE — upright, and it reads as upright
    rng, n: 1500,
    sample: rej(WX0 - 6, 190, WX1 + 6, 402, (x, y) => y > cliffTop(x) + 6 && y < GY(x) + 2),
    dir: () => Math.PI / 2 + 0.03,                          // straight down: a cut face, not a hillside
    col: (x, y, r) => {
      const edge = Math.min(1, Math.min(x - WX0, WX1 - x) / 34);     // its corners catch the moon
      const drop = Math.min(1, (y - cliffTop(x)) / 130);
      return jig(chroma(ramp(['#2a2c45', '#373752', '#474362', '#5d5570', '#847890'],
        Math.min(1, 0.2 + fill(x, y) * 0.5 + (1 - edge) * 0.22 - drop * 0.16 + r() * 0.2)), x, y, 0.3, 223), r, 5);
    },
    len: 26, lw: 6, steps: 4, follow: 0.97, lenJ: 0.6, aJ: 0.25, impasto: 0.46, relief: 0, op: 0.75,
  });
  [[236, 0.9], [284, 0.7], [332, 0.85]].forEach(([ly, w]) => {       // LEDGES across the face
    paintPath(out, counter, rng,
      Array.from({ length: 10 }, (_, i) => { const x = WX0 + 4 + i * ((WX1 - WX0 - 8) / 9);
        return [x, ly + Math.sin(x / 60 + ly) * 4]; }),
      (x, y, r) => jig(mix('#3b3a58', '#c3b2ad', 0.25 + lit(x, y) * 0.9 * w + r() * 0.25), r, 5),
      { lw: 2.2, len: 5, density: 0.5, jitter: 1.0 });
    strokes(out, counter, {                                          // and the shadow each ledge throws
      rng, n: 150,
      sample: r => [WX0 + 4 + r() * (WX1 - WX0 - 8), ly + 3 + Math.pow(r(), 0.6) * 13],
      dir: () => 0.04,
      col: (x, y, r) => jig(mix('#2a2c46', '#191b2f', 0.3 + r() * 0.6), r, 4),
      len: 14, lw: 4, steps: 2, lenJ: 0.6, relief: 0, op: 0.3,
    });
  });
  paintPath(out, counter, rng,                                       // the wall's near corner, lit
    [[WX0 + 2, GY(WX0)], [WX0 - 1, 300], [WX0 + 3, 246], [WX0 - 2, cliffTop(WX0) + 8]],
    (x, y, r) => jig(mix('#3a3550', '#b6a8ab', lit(x, y) * 0.95 + r() * 0.2), r, 5), { lw: 2.6, len: 5, density: 0.7, jitter: 0.7 });
  paintPath(out, counter, rng,                                       // and its far corner, turning away
    [[WX1 - 2, GY(WX1)], [WX1 + 2, 300], [WX1 - 3, 250], [WX1 + 1, cliffTop(WX1) + 8]],
    (x, y, r) => jig(mix('#191c31', '#4e4760', r() * 0.8), r, 5), { lw: 2.4, len: 5, density: 0.6, jitter: 0.7 });
  strokes(out, counter, {                                            // TALUS — what has fallen off it
    rng, n: 900,
    sample: r => { const x = WX0 - 40 + r() * (WX1 - WX0 + 80);
                   const t = Math.pow(r(), 0.55);
                   const top = GY(x) - 34 * (1 - Math.abs(x - (WX0 + WX1) / 2) / ((WX1 - WX0) / 2 + 40));
                   return [x, top + t * (GY(x) + 14 - top)]; },
    dir: () => 0.06,
    col: (x, y, r) => jig(chroma(ramp(['#2e3049', '#3b3a56', '#4c4763', '#665c74', '#8d8090'],
      Math.min(1, 0.15 + fill(x, y) * 0.5 + r() * 0.7)), x, y, 0.3, 229), r, 5),
    len: 8, lw: 3.2, steps: 2, lenJ: 0.7, relief: 0, op: 0.8,
  });
  strokes(out, counter, {                                    // sparse chisel — beds, not pebbles
    rng, n: 150,
    sample: rej(150, 180, 814, 396, (x, y) => y > cliffTop(x) + 4 && y < GY(x)),
    dir: x => 0.03 + Math.sin(x / 150) * 0.13,
    col: (x, y, r) => {
      const brow = Math.max(0, 1 - (y - cliffTop(x)) / 46);
      return jig(ramp(['#171a33', '#242545', '#3a3758', '#635b7a'], Math.min(1, lit(x, y) * 0.3 + brow * 0.75 + r() * 0.2)), r, 4);
    },
    len: (x, y) => 110 + 90 * fbm(x / 110, y / 40, 77), lw: 3.4,
    steps: 5, follow: 0.997, lenJ: 0.6, wJ: 0.5, relief: 0, op: 0.45,
  });
  strokes(out, counter, {                                    // the brow itself, taking the moon
    rng, n: 900,
    sample: r => { const x = 150 + r() * 664; const y = cliffTop(x) + Math.pow(r(), 0.55) * 22; return [x, y]; },
    dir: x => 0.05 + Math.sin(x / 88) * 0.16,
    col: (x, y, r) => {
      const d = 1 - (y - cliffTop(x)) / 22;
      return jig(chroma(ramp(['#2d2c46', '#4a445b', '#6f6670', '#968c8a', '#b5aaa2'], Math.min(1, d * (0.12 + fill(x, y) * 1.15))), x, y, 0.24, 239), r, 5);
    },
    len: 15, lw: 3.4, steps: 3, follow: 0.95, lenJ: 0.75, aJ: 0.5, impasto: 0.72, relief: 0, op: 0.85,
  });
  [[228, 252, 300, 11, 1.9, 0.42], [196, 306, 214, 7, 1.3, 0.3], [470, 232, 250, 14, 2.2, 0.46],
   [432, 300, 330, 9, 1.5, 0.34], [560, 350, 250, 6, 1.1, 0.26], [300, 214, 150, 8, 1.2, 0.3]]
    .forEach(([x0, y0, wid, amp, lw, dens], bi) => {
      paintPath(out, counter, rng,
        Array.from({ length: Math.round(wid / 26) }, (_, i) => { const x = x0 + i * 26;
          return [x, y0 + Math.sin(x / (70 + bi * 24) + bi) * amp]; })
          .filter(pt => pt[1] > cliffTop(pt[0]) + 14 && pt[1] < GY(pt[0]) - 6),
        (x, y, r) => jig(mix('#1f2137', '#83787a', lit(x, y) * 0.55 + r() * 0.35), r, 5),
        { lw: lw * 0.6, len: 5, density: dens * 0.8, jitter: 1.4 });
    });
  strokes(out, counter, {                                  // a buttress of rock on the right, turning to the moon
    rng, n: 420,
    sample: r => { const x = 560 + r() * 190; const y = cliffTop(x) + 16 + Math.pow(r(), 0.7) * 150;
                   return y < GY(x) ? [x, y] : null; },
    dir: () => Math.PI / 2 - 0.34,
    col: (x, y, r) => jig(ramp(['#20223a', '#2c2c45', '#3d3a4e', '#5b5460'],
      Math.min(1, 0.15 + Math.max(0, 1 - Math.abs(x - 610) / 70) * 0.6 + r() * 0.25)), r, 5),
    len: 26, lw: 8, steps: 3, follow: 0.95, lenJ: 0.6, relief: 0, op: 0.5,
  });
  [[502, 200, 150, 5.5], [284, 246, 74, 3.4]].forEach(([cx, cy, ch, cw], ci) => {
    strokes(out, counter, {
      rng, n: 120 - ci * 50,
      sample: r => { const t = Math.pow(r(), 0.7);                   // widest at the top, closing downward
                     const y = cy + t * ch;
                     const w = cw * (1 - t * 0.85);
                     return [cx + Math.sin(t * 3.1 + ci) * 9 + (r() - 0.5) * w * 2, y]; },
      dir: () => Math.PI / 2 + 0.08,
      col: (x, y, r) => jig(ramp(['#2b2a41', '#202033', '#171727'], 0.2 + r() * 0.8), r, 4),
      len: 13, lw: 3, steps: 2, lenJ: 0.7, relief: 0, op: 0.5,
    });
  });
  strokes(out, counter, {                                  // a scooped hollow above the mouth
    rng, n: 520,
    sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 0.55);
                   return [352 + Math.cos(a) * 96 * d, 250 + Math.sin(a) * 40 * d]; },
    dir: (x, y) => Math.atan2(y - 244, x - 352) + Math.PI / 2,
    col: (x, y, r) => {
      const d = Math.min(1, Math.hypot((x - 352) / 96, (y - 250) / 40));
      return jig(ramp(['#1b1d31', '#24253c', '#302f46', '#413d52'], 0.15 + d * 0.7 + r() * 0.2), r, 5);
    },
    len: 14, lw: 4, steps: 3, follow: 0.94, lenJ: 0.7, relief: 0, op: 0.5,
  });
  [[318, 214, 46, 15], [452, 226, 38, 13], [386, 196, 52, 14], [498, 262, 34, 11]]
    .forEach(([bx, by, bw, bh]) => {                       // blocks standing proud, lit on top
      strokes(out, counter, {
        rng, n: Math.round(bw * 3),
        sample: r => [bx - bw / 2 + r() * bw, by - bh + r() * bh * 2],
        dir: () => 0.04,
        col: (x, y, r) => jig(ramp(['#22243a', '#2f2e46', '#443f52', '#655d63', '#8a8081'],
          Math.min(1, Math.max(0, 1 - (y - (by - bh)) / (bh * 1.1)) * (0.5 + lit(x, y) * 0.9) + r() * 0.15)), r, 5),
        len: 11, lw: 3.4, steps: 2, lenJ: 0.6, impasto: 0.72, relief: 0, op: 0.8,
      });
      strokes(out, counter, {                              // and the shadow each one throws
        rng, n: Math.round(bw * 1.6),
        sample: r => [bx - bw / 2 + 5 + r() * bw, by + bh - 2 + Math.pow(r(), 0.6) * 14],
        dir: () => 0.04,
        col: (x, y, r) => jig(mix('#232440', '#14152a', 0.3 + r() * 0.6), r, 4),
        len: 12, lw: 4, steps: 2, lenJ: 0.6, relief: 0, op: 0.45,
      });
    });
  strokes(out, counter, {                                  // weathering, running down off all of it
    rng, n: 300,
    sample: rej(292, 200, 560, 372, (x, y) => y > cliffTop(x) + 10),
    dir: () => Math.PI / 2 + 0.05,
    col: (x, y, r) => jig(mix('#2a2b44', '#6d6570', r() * 0.55 + lit(x, y) * 0.25), r, 6),
    len: (x, y) => 16 + fbm(x / 40, y / 20, 87) * 26, lw: 1.5,
    steps: 4, follow: 0.99, lenJ: 0.7, relief: 0, op: 0.3,
  });
  strokes(out, counter, {                                  // fine grain where the reader gets close
    rng, n: 1600,
    sample: rej(292, 176, 520, 400, (x, y) => y > cliffTop(x) + 2 && y < GY(x) + 4),
    dir: (x, y) => Math.PI / 2 - 0.42 + (fbm(x / 40, y / 30, 79) - 0.5) * 0.9,
    col: (x, y, r) => {
      const brow = Math.max(0, 1 - (y - cliffTop(x)) / 40);
      return jig(chroma(ramp(['#1e2138', '#282942', '#363451', '#4b4659', '#6b636a', '#8f8583'],
        Math.min(1, fill(x, y) * 0.28 + brow * 0.72 + fbm(x / 50, y / 34, 81) * 0.4 - 0.1)), x, y, 0.34, 223), r, 5);
    },
    len: 13, lw: 3.2, steps: 3, follow: 0.9, lenJ: 0.7, aJ: 0.5, impasto: 0.72, relief: 0, op: 0.6,
  });
  // ══ THE STONE ITSELF ═══════════════════════════════════════════════════════════════
  // Fred: "make the stone wall have more texture." The face had form (planes, hollow,
  // blocks) but no MATERIAL — up close it was a smooth violet field with drawing on it.
  // Rock reads as rock through three things stacked, all of them small:
  //   · it BREAKS into facets, each turning a slightly different way to the moon;
  //   · it is PITTED, and the pits are darkest where the light is weakest;
  //   · it has GRAIN, running with the weather rather than with the beds.
  // ⚠ Every value here is a small offset from the local base and every pass is relief:0 —
  // wide bevelled marks at one size are what turned this plate into flagstones twice.
  const faceVal = (x, y) => {                              // the face's own value at a point
    const brow = Math.max(0, 1 - (y - cliffTop(x)) / 44);
    const facet = Math.max(0, 1 - Math.abs(x - 252) / 230) * 0.34;
    return Math.min(1, fill(x, y) * 0.42 + brow * 0.6 + facet * fill(x, y) + fbm(x / 130, y / 70, 73) * 0.28 - 0.2);
  };
  const ROCK = ['#1a1d36', '#232640', '#31314b', '#454158', '#665f68', '#8d8382'];
  for (let f = 0; f < 260; f++) {                          // facets — the rock breaks in blocks
    const fx = 150 + rng() * 664;
    const fy = cliffTop(fx) + 8 + Math.pow(rng(), 0.8) * (GY(fx) - cliffTop(fx) - 14);
    if (fy > GY(fx) - 4) continue;
    if (fx > DL - 7 && fx < DR + 7 && fy > DTOP - 28) continue;     // never over the mouth itself
    const w = 7 + Math.pow(rng(), 1.6) * 22, h = w * (0.45 + rng() * 0.7);
    const tilt = (rng() - 0.5) * 0.5;
    const q = [];
    for (let i = 0; i < 4; i++) {                          // a quad, never a rectangle
      const a2 = tilt + i * Math.PI / 2 + (rng() - 0.5) * 0.5;
      q.push(`${R1(fx + Math.cos(a2) * w * (0.55 + rng() * 0.35))} ${R1(fy + Math.sin(a2) * h * (0.55 + rng() * 0.35))}`);
    }
    const v = Math.max(0, Math.min(1, faceVal(fx, fy) + (rng() - 0.45) * 0.26));
    out.push(`<path d="M${q.join('L')}Z" fill="${chroma(ramp(ROCK, v), fx, fy, 0.42, 233)}" opacity="${(0.3 + rng() * 0.3).toFixed(2)}"/>`);
    counter.n++;
    if (rng() < 0.55) paintPath(out, counter, rng,        // and the top edge of the one that stands proud
      [[fx - w * 0.5, fy - h * 0.5], [fx + w * 0.5, fy - h * 0.4]],
      (x, y, r) => jig(ramp(ROCK, Math.min(1, faceVal(x, y) + 0.3 + r() * 0.2)), r, 5),
      { lw: 1.3, len: 4, density: 0.6, jitter: 0.5 });
  }
  strokes(out, counter, {                                  // pitting — deepest where the moon is weakest
    rng, n: 1100,
    sample: rej(150, 176, 814, 404, (x, y) => y > cliffTop(x) + 6 && y < GY(x) - 2
      && !(x > DL - 5 && x < DR + 5 && y > DTOP - 26)),
    dir: (x, y) => fbm(x / 12, y / 12, 151) * 6.28,
    col: (x, y, r) => jig(ramp(['#141628', '#1d1f34', '#282840', '#37344a'],
      Math.min(1, faceVal(x, y) * 0.8 + r() * 0.3)), r, 5),
    len: 3.5, lw: 2.6, steps: 1, lenJ: 0.8, relief: 0, op: 0.4,
  });
  strokes(out, counter, {                                  // grain, running with the weather
    rng, n: 2200,
    sample: rej(150, 176, 814, 404, (x, y) => y > cliffTop(x) + 4 && y < GY(x)
      && !(x > DL - 4 && x < DR + 4 && y > DTOP - 24)),
    dir: (x, y) => Math.PI / 2 - 0.5 + (fbm(x / 26, y / 18, 157) - 0.5) * 1.5,
    col: (x, y, r) => jig(chroma(ramp(ROCK, Math.max(0, Math.min(1, faceVal(x, y) + (r() - 0.5) * 0.34))), x, y, 0.38, 229), r, 5),
    len: 8, lw: 2, steps: 2, lenJ: 0.8, aJ: 0.6, impasto: 0.72, relief: 0, op: 0.45,
  });
  // ⚠ THE WEIRD HOLE — GONE. Fred, twice, and the second time out of patience: this was a
  // "second, older tomb" I invented for the right of the hill to say the place was a
  // burying ground. Nobody asked for it, it explains nothing a reader needs, and it read
  // as exactly what he kept calling it — a weird hole. A page about ONE tomb should have
  // one opening in it. Invented scenery that competes with the subject is not richness.
  cliffR.push([_cliff, out.length]);

  // ⚠ AND A GLAZE OF IT, LAST. Lifting the light inside each pass was not enough: the
  // pitting, the grain and the facets all key off the same falloff, so they stacked their
  // darkest marks over exactly the region the moon misses and crushed it back to a void.
  // This is the sky itself, laid over the rock AFTER everything else, with its density
  // keyed to how little moon a spot gets — so the lit side is untouched and the far side
  // can no longer read as a hole. It is also simply true: outdoors at night you can see
  // into shadow, because half the sky is above you.
  strokes(out, counter, {
    rng, n: 3600,
    sample: r => {
      for (let k = 0; k < 10; k++) {
        const x = 150 + r() * 664, y = 180 + r() * 230;
        if (y < cliffTop(x) + 4 || y > GY(x) + 2) continue;
        if (r() < Math.pow(lit(x, y), 2.2) * 0.95) continue;   // thickest where the moon fails
        return [x, y];
      }
      return null;
    },
    dir: (x, y) => Math.PI / 2 - 0.4 + (fbm(x / 30, y / 24, 301) - 0.5) * 1.2,
    // ⚠ NOT through `jig`. The page darken knob and the manifold both ride inside it, and a
    // fill whose whole job is to stop a void must not be handed to the thing that deepens
    // darks — that is how the first two attempts at this got eaten.
    col: (x, y, r) => chroma(mix('#33355a', '#4a4d78', r() * 0.9), x, y, 0.3, 229),
    len: 12, lw: 4, steps: 2, lenJ: 0.7, relief: 0, op: 0.34,
  });

  /* 3. THE MOUTH ---------------------------------------------------------------------- */
  // ⚠ AND HERE IS THE "HOLE SHADOW THING", finally. Fred pointed at it four times; I kept
  // examining the stone's shading and the light falloff. It was neither. It was a pass
  // called "the dressed face round the door" that sampled a RECTANGLE — rej(DL-34, DTOP-30,
  // PR+14, DBOT+4) — and filled it with dark paint. A dark rectangle, with hard vertical
  // edges, sitting around the tomb. Of course it read as a shadow, or a second hole: it was
  // a hard-edged dark shape that belonged to nothing in the world of the picture.
  //
  // The lesson is the one this plate keeps teaching: `rej()` paints a BOX. That is fine for
  // a field (sky, sand, a whole cliff) whose edges are covered by other paint, and it is
  // fatal for a local passage, because the box itself becomes a shape the moment anything
  // around it is a different value. The wall already paints this area; the chisel marks
  // already say it was hewn. The rectangle was never doing anything but damage.
  const MOUTH = (() => {
    const pts = [];
    for (let i = 0; i <= 10; i++) {                        // up the near side, bitten out
      const t = i / 10;
      const y = DBOT - t * (DBOT - (DTOP + 24));
      pts.push([DL + (fbm(t * 5.5, 1.7, 131) - 0.5) * 13 - (t > 0.42 && t < 0.62 ? 6 : 0), y]);
    }
    for (let i = 1; i <= 8; i++) {                         // over the head — it overhangs, unevenly
      const t = i / 9;
      const x = DL + t * (DR - DL);
      pts.push([x, DTOP + 24 - Math.sin(Math.pow(t, 0.8) * Math.PI) * 31 + (fbm(t * 4.2, 3.3, 137) - 0.5) * 17]);
    }
    for (let i = 0; i <= 8; i++) {                         // and down the far side
      const t = i / 8;
      pts.push([DR + (fbm(t * 6.1, 5.9, 141) - 0.5) * 14, (DTOP + 30) + t * (DBOT - DTOP - 30)]);
    }
    return pts;
  })();
  const _dark = out.length;
  out.push(`<path d="M${MOUTH.map(q => R1(q[0]) + ' ' + R1(q[1])).join('L')}Z" fill="#05060c"/>`);
  counter.n++;
  // ── THE INSIDE OF THE CAVE ────────────────────────────────────────────────────────
  // A flat black hole is a silhouette, not a place. Painted in greys against the black it
  // becomes a SPACE that goes back: the near surfaces take what little light reaches them,
  // and the value falls away with distance until the deepest part is the true black — the
  // darkest note in the picture, and now the one the eye actually travels into.
  const inMouth = (x, y) => {                              // ray-cast on the mouth's own outline
    let c = false;
    for (let i = 0, j = MOUTH.length - 1; i < MOUTH.length; j = i++) {
      const xi = MOUTH[i][0], yi = MOUTH[i][1], xj = MOUTH[j][0], yj = MOUTH[j][1];
      if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c;
    }
    return c;
  };
  const edgeDist = (x, y) => {                             // how far in from the broken rim
    let m = 1e9;
    for (let i = 0; i < MOUTH.length; i++) m = Math.min(m, Math.hypot(x - MOUTH[i][0], y - MOUTH[i][1]));
    return m;
  };
  const GREY = ['#05060b', '#0a0b12', '#101119', '#181922', '#22232e', '#2e2f3c', '#3b3c4b'];
  const inSample = (r) => {                                // a point somewhere inside the hole
    for (let k = 0; k < 12; k++) {
      const x = DL - 6 + r() * (DR - DL + 12), y = DTOP - 26 + r() * (DBOT - DTOP + 26);
      if (inMouth(x, y)) return [x, y];
    }
    return null;
  };
  strokes(out, counter, {                                  // the body of the space, falling back to black
    rng, n: 760,
    sample: r => { const q = inSample(r); if (!q) return null;
                   const deep = (q[0] - DL) / (DR - DL) * 0.6 + (1 - (q[1] - DTOP) / (DBOT - DTOP)) * 0.5;
                   return r() < deep * 0.8 ? null : q; },   // nothing lands in the far dark
    dir: (x, y) => Math.PI / 2 + (fbm(x / 20, y / 26, 171) - 0.5) * 0.8,
    col: (x, y, r) => {
      const near = Math.min(1, edgeDist(x, y) / 26);        // 0 at the rim, 1 well inside
      const low = Math.max(0, (y - (DTOP + 40)) / 110);     // and the floor holds a little more
      return ramp(GREY, Math.max(0, (1 - near) * 0.6 + low * 0.16 - r() * 0.12));
    },
    len: 16, lw: 5, steps: 3, follow: 0.98, lenJ: 0.6, relief: 0, op: 0.8,
  });
  strokes(out, counter, {                                  // the near wall on the moon's side, raked
    rng, n: 260,
    sample: r => { const x = DL + 1 + Math.pow(r(), 1.7) * 17, y = DTOP + 10 + r() * (DBOT - DTOP - 12);
                   return inMouth(x, y) ? [x, y] : null; },
    dir: () => Math.PI / 2 - 0.1,
    col: (x, y, r) => ramp(GREY, Math.max(0, 0.6 - (x - DL) / 17 * 0.46 + (r() - 0.5) * 0.16)),
    len: 10, lw: 3, steps: 2, lenJ: 0.7, relief: 0, op: 0.6,
  });
  strokes(out, counter, {                                  // the roof, just inside the overhang
    rng, n: 200,
    sample: r => { const t = r(); const x = DL + 4 + t * (DR - DL - 8);
                   const y = DTOP + 22 - Math.sin(Math.pow(t, 0.8) * Math.PI) * 26 + r() * 15;
                   return inMouth(x, y) ? [x, y] : null; },
    dir: (x) => 0.1 + Math.sin((x - DL) / 22) * 0.3,
    col: (x, y, r) => ramp(GREY, Math.max(0, 0.36 - r() * 0.24)),
    len: 9, lw: 3.4, steps: 2, lenJ: 0.7, relief: 0, op: 0.55,
  });
  strokes(out, counter, {                                  // the floor inside, where the sill light dies
    rng, n: 220,
    sample: r => { const x = DL + 2 + r() * (DR - DL - 4), y = DBOT - 4 - Math.pow(r(), 0.7) * 34;
                   return inMouth(x, y) ? [x, y] : null; },
    dir: () => 0.04,
    col: (x, y, r) => ramp(GREY, Math.max(0, 0.5 - (DBOT - y) / 34 * 0.44 + (r() - 0.5) * 0.16)),
    len: 12, lw: 3.6, steps: 2, lenJ: 0.7, relief: 0, op: 0.6,
  });
  paintPath(out, counter, rng,                             // the shelf the body was laid on — a fourth look
    [[DL + 8, DBOT - 40], [DL + 26, DBOT - 43], [DR - 14, DBOT - 41]].filter(q => inMouth(q[0], q[1])),
    (x, y, r) => ramp(GREY, 0.34 + r() * 0.22), { lw: 2, len: 5, density: 0.35, jitter: 0.8 });
  strokes(out, counter, {                                  // and the seam's own light, from the inside
    rng, n: 90,
    sample: r => { const x = SX - SW - 7 + r() * 7, y = SY - SH * 0.5 + r() * SH * 1.2;
                   return inMouth(x, y) ? [x, y] : null; },
    dir: () => Math.PI / 2,
    col: (x, y, r) => mix('#22222e', '#6b5a3c', 0.2 + r() * 0.7),
    len: 8, lw: 2.4, steps: 2, lenJ: 0.6, relief: 0, op: 0.32,
  });
  [[DL + 6, DTOP + 88, 10, 17], [DR - 9, DTOP + 52, 8, 13]]
    .forEach(([tx, ty, tw, th], ti) => {                   // teeth of rock left standing in the hole
      out.push(`<path d="M${R1(tx - tw / 2)} ${R1(ty + th)}L${R1(tx + (ti % 2 ? 4 : -4))} ${R1(ty - th)}L${R1(tx + tw / 2)} ${R1(ty + th)}Z" fill="#1d1e33"/>`);
      counter.n++;
      strokes(out, counter, {
        rng, n: 40,
        sample: r => [tx - tw / 2 + r() * tw, ty - th + r() * th * 2],
        dir: () => Math.PI / 2,
        col: (x, y, r) => jig(ramp(['#08090f', '#0e0f1c', '#171827', '#232338'], (tx - x) / tw + 0.35 + r() * 0.3), r, 5),
        len: 7, lw: 2.2, steps: 2, lenJ: 0.6, relief: 0, op: 0.9,
      });
    });
  strokes(out, counter, {                                           // the moon, raking the broken edge
    // walks the SAME outline as the hole: brightest where the break turns toward the moon
    // (the near side and the left of the head), dying away as it turns from it.
    rng, n: 150,
    sample: r => {
      const i = Math.min(MOUTH.length - 2, (r() * (MOUTH.length - 1)) | 0);
      const a = MOUTH[i], b = MOUTH[i + 1], u = r();
      const nx = -(b[1] - a[1]), ny = b[0] - a[0], nl = Math.hypot(nx, ny) + 1e-6;
      const off = (0.6 + r() * 2.2) * (a[0] < (DL + DR) / 2 ? -1 : 1);
      return [a[0] + (b[0] - a[0]) * u - (nx / nl) * off, a[1] + (b[1] - a[1]) * u - (ny / nl) * off];
    },
    dir: (x, y) => Math.PI / 2 + (y < DTOP + 30 ? -1.1 : 0) + (x > DR - 6 ? 0.2 : 0),
    col: (x, y, r) => {
      const faces = Math.max(0, 1 - (x - (DL - 6)) / (DR - DL + 10));   // the moon is off to the left
      return jig(mix('#2e2b44', '#948da9', 0.08 + faces * 0.9 * (0.3 + r() * 0.9)), r, 6);
    },
    len: 9, lw: 1.4, steps: 2, lenJ: 0.9, aJ: 0.5, relief: 0, op: 0.45,
  });
  darkR.push([_dark, out.length]);   // ⚠ the hole, its teeth, its inside and its rim: one plane

  /* 4. THE STONE ---------------------------------------------------------------------- */
    const STONE = ['#3b3756', '#464265', '#554e6f', '#67607b', '#847c8b', '#a79d9c', '#c8bcb0'];
  const stoneVal = (x, y) => {
    const g = 1 - Math.min(1, Math.hypot((x - (SX - SW * 0.5)) / (SW * 1.05), (y - (SY - SH * 0.5)) / (SH * 1.05)));
    return Math.min(1, 0.2 + lit(x, y) * 0.2 + Math.pow(g, 0.75) * 0.86 + fbm(x / 18, y / 18, 93) * 0.1);
  };
  const inStone = (x, y, k = 1) => Math.hypot((x - SX) / (SW * k), (y - SY) / (SH * k)) < 1;
  const _stone = out.length;
  { const ring = [];
    for (let i = 0; i < 40; i++) {
      const a = i / 40 * Math.PI * 2;
      const w = 1 + (fbm(Math.cos(a) * 2 + 5, Math.sin(a) * 2 + 5, 97) - 0.5) * 0.16;
      ring.push(`${R1(SX + Math.cos(a) * SW * w)} ${R1(SY + Math.sin(a) * SH * w)}`);
    }
    out.push(`<path d="M${ring.join('L')}Z" fill="#3a3654"/>`); }
  counter.n++;
  strokes(out, counter, {
    rng, n: 360,
    sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 0.5) * 0.9;   // stays inside its own edge
                   return [SX + Math.cos(a) * SW * d, SY + Math.sin(a) * SH * d]; },
    dir: (x, y) => 0.08 + (fbm(x / 24, y / 16, 91) - 0.5) * 0.3,
    col: (x, y, r) => {
      // shaded off ONE point on its own surface — that is what makes a boulder a ball
      // rather than a pale slab standing on edge.
      return jig(chroma(ramp(STONE, stoneVal(x, y)), x, y, 0.3 * (1 - stoneVal(x, y)), 241), r, 4);
    },
    len: 18, lw: 6, steps: 4, follow: 0.98, lenJ: 0.6, aJ: 0.35, impasto: 0.72, relief: 0,
  });
  strokes(out, counter, {                                            // and the contact shadow on the sand
    rng, n: 190,
    sample: r => [SX - SW * 1.05 + r() * SW * 2.2, SY + SH - 10 + Math.pow(r(), 0.7) * 26],
    dir: () => 0.05,
    col: (x, y, r) => jig(mix('#332f4e', '#1d1c31', 0.35 + r() * 0.55), r, 4),
    len: 26, lw: 9, steps: 2, lenJ: 0.5, relief: 0, op: 0.6,
  });
  // ⚠ THE STONE'S CAST SHADOW. Fred: "why is the shadow not beside the boulder?" — because
  // when he flagged the dark mass I deleted ALL of it, including the part that was honestly
  // its shadow. A boulder lit from the left with nothing beside it does not sit on anything;
  // it floats. But the earlier version deserved deleting, and the difference is worth stating
  // because it is the whole rule:
  //
  //   A SHADOW IS A MODULATION OF A SURFACE, NOT A SHAPE LAID OVER IT.
  //
  // The old one was a dark blob at its own opacity with its own edges — so it read as an
  // object, and an object-shaped darkness beside a hole reads as another hole. This one is
  // built from the rock's OWN colour at each point, at roughly two-thirds value, thin enough
  // that the wall's facets and grain still read straight through it. It is thrown away from
  // the moon (down and to the right), it is an ellipse because its caster is a disc, it
  // shears sideways where it crosses off the wall onto the sand, and it fades as it travels.
  // You should be able to see the rock inside it. That is what makes it a shadow.
  const SHX = SX + 74, SHY = SY + 30;
  strokes(out, counter, {
    rng, n: 1100,
    sample: r => {
      const a = r() * Math.PI * 2, d = Math.pow(r(), 0.42);
      let x = SHX + Math.cos(a) * SW * 1.02 * d, y = SHY + Math.sin(a) * SH * 0.86 * d;
      if (y > GY(x)) x += (y - GY(x)) * 0.9;                 // shears as it runs onto the ground
      if (inStone(x, y, 1.01)) return null;                  // never on the caster itself
      if (r() < d * d * 0.85) return null;                   // thins toward its edge — no hard rim
      return (y > cliffTop(x) + 6 && y < 470) ? [x, y] : null;
    },
    dir: (x, y) => Math.PI / 2 - 0.5 + (fbm(x / 30, y / 24, 341) - 0.5) * 0.9,
    col: (x, y, r) => {
      const own = ramp(ROCK, Math.max(0, faceVal(x, y) * 0.5 - 0.05 + r() * 0.12));    // ITS OWN rock, darker
      return jig(chroma(own, x, y, 0.28, 223), r, 5);
    },
    len: 10, lw: 3.4, steps: 2, lenJ: 0.7, relief: 0, op: 0.62,
  });
  strokes(out, counter, {                                    // and the dark line where it actually touches
    rng, n: 260,
    sample: r => { const a = 0.25 + r() * 2.2;               // the near-side arc, bottom and right
                   const d = 1.0 + r() * 0.09;
                   return [SX + Math.cos(a) * SW * d, SY + Math.sin(a) * SH * d]; },
    dir: (x, y) => Math.atan2(y - SY, x - SX) + Math.PI / 2,
    col: (x, y, r) => jig(ramp(['#2a2740', '#201e33', '#191828'], 0.2 + r() * 0.7), r, 4),
    len: 7, lw: 2.6, steps: 2, lenJ: 0.6, relief: 0, op: 0.55,
  });
  /* ⭐ Sep 23 — THE SEAL (Matt 27:66). "So they went, and made the sepulchre sure, sealing the
     stone, and setting a watch." The page's line is "They shut it with a stone"; the verse says
     they did more — they locked it. A cord is laid across the stone, sagging a little as it
     rides the curve, and pinned to the rock on either side with a lump of wax pressed with a
     seal: deep red in the moonlight, lit on the edge the moon finds. A child reads it at once:
     somebody made sure it could not be opened. (The next page is the morning it was.) Own rng. */
  {
    const kr = mulberry32(seed + 2766);
    const A = [SX - SW - 16, SY - 14], B = [SX + SW + 14, SY - 8];
    const cord = [];
    for (let i = 0; i <= 24; i++) {
      const t = i / 24, x = A[0] + (B[0] - A[0]) * t;
      let y = A[1] + (B[1] - A[1]) * t + Math.sin(t * Math.PI) * 9;              // it sags
      if (inStone(x, y, 1.0)) y -= Math.sqrt(Math.max(0, 1 - ((x - SX) / SW) ** 2)) * 3;   // and rides up over the stone's belly
      cord.push([x, y]);
    }
    paintPath(out, counter, kr, cord.map(([x, y]) => [x + 1.2, y + 2.2]), (x, y, r) => jig('#1c1a2c', r, 3), { lw: 2.0, len: 4, density: 0.9, jitter: 0.2 });   // its shadow on the stone
    paintPath(out, counter, kr, cord, (x, y, r) => jig(mix('#6e6456', '#b8a888', lit(x, y) * 0.6 + r() * 0.15), r, 5), { lw: 1.5, len: 3.5, density: 0.95, jitter: 0.2 });
    for (const [cx, cy] of [A, B]) {
      out.push(`<path d="M${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(i => { const a = i / 12 * Math.PI * 2, rr = 7.2 * (1 + (kr() - 0.5) * 0.18); return R1(cx + Math.cos(a) * rr) + ' ' + R1(cy + Math.sin(a) * rr * 0.92); }).join('L')}Z" fill="#5a1620"/>`); counter.n++;   // the wax
      out.push(`<circle cx="${R1(cx - 1.2)}" cy="${R1(cy - 1.2)}" r="4.6" fill="none" stroke="#8c2a34" stroke-width="1.1" opacity="0.9"/>`); counter.n++;         // the ring the seal pressed
      out.push(`<path d="M${R1(cx - 3)} ${R1(cy - 1.2)}H${R1(cx + 0.6)}M${R1(cx - 1.2)} ${R1(cy - 3)}V${R1(cy + 0.6)}" stroke="#3a0e16" stroke-width="0.9"/>`); counter.n++;
      paintPath(out, counter, kr, [[cx - 6.4, cy - 2], [cx - 4, cy - 5.6], [cx, cy - 6.6]], (x, y, r) => jig(mix('#b8505a', '#e0808a', r() * 0.4), r, 4), { lw: 1.2, len: 2.5, density: 0.9, jitter: 0.2 });   // the moon on its rim
    }
  }
  stoneR.push([_stone, out.length]);

  /* 5. THE SEAM — the one warm note, three hands (60/60/100) --------------------------- */
  const seamHand = (rngH) => {
    strokes(out, counter, {                                          // the thread, round the rim
      // ⚠ it follows the JOIN now. The stone is a disc laid over a hole, so what light gets
      // out gets out all round its edge — strongest low on the near side where the disc does
      // not quite sit flush, guttering away as the rim turns from us.
      rng: rngH, n: 40,
      sample: r => { const a = 1.55 + Math.pow(r(), 0.8) * 2.5;      // from the foot, up the near side
                     const d = 1.0 + (r() - 0.5) * 0.03;
                     return [SX + Math.cos(a) * SW * d, SY + Math.sin(a) * SH * d]; },
      dir: (x, y) => Math.atan2(y - SY, x - SX) + Math.PI / 2,
      col: (x, y, r) => jig(ramp(['#fff7e2', '#ffe6a6', '#dcbb78'], Math.pow(r(), 1.2)), r, 6),
      len: 6, lw: 0.9, steps: 2, lenJ: 0.7, relief: 0, op: 0.42,
    });
    strokes(out, counter, {
      rng: rngH, n: 70,
      sample: r => [SX - SW - 2 + (r() + r() - 1) * 4.5, SY - SH * 0.5 + r() * SH * 1.2],
      dir: () => Math.PI / 2,
      col: (x, y, r) => jig(ramp([GOLD_PALE, GOLD, '#7a5c2c'], r()), r, 6),
      len: 7, lw: 1.6, steps: 2, relief: 0, op: 0.06,
    });
    strokes(out, counter, {                                          // warmed: the stone's near lip
      rng: rngH, n: 22,
      sample: r => { const a = 1.7 + Math.pow(r(), 0.8) * 2.2, d = 0.9 + r() * 0.07;
                     return [SX + Math.cos(a) * SW * d, SY + Math.sin(a) * SH * d]; },
      dir: (x, y) => Math.atan2(y - SY, x - SX) + Math.PI / 2,
      col: (x, y, r) => jig(mix('#6d6772', '#c9a濃66'.replace('濃', ''), 0.3 + r() * 0.6), r, 6),
      len: 7, lw: 1.5, steps: 2, relief: 0, op: 0.16,
    });
  };
  const _sA = out.length;
  seamHand(mulberry32(seed + 611)); seamHand(mulberry32(seed + 722)); seamHand(mulberry32(seed + 833));
  seamR.push([_sA, out.length]);

  /* 6. THE SAND FLOOR — the pale plane the whole scene stands on ----------------------- */
  const _near = out.length;
  strokes(out, counter, {
    rng, n: 3600,
    sample: r => { const x = -14 + r() * 828; const y = GY(x) - 2 + Math.pow(r(), 0.8) * (520 - GY(x)); return [x, y]; },
    dir: x => 0.02 + Math.sin(x / 160) * 0.06,
    col: (x, y, r) => {
      // ⚠ THE FLOOR IS THE PALE PLANE. A horizontal surface catches the whole sky; an upright
      // face catches one moon. If the sand is not clearly lighter than the cliff, the two
      // planes weld into one wall — which is exactly what went wrong the first time.
      const near = (y - GY(x)) / (520 - GY(x));                      // and it pales toward us
      return jig(chroma(ramp(['#454168', '#565179', '#68618c', '#7d739f', '#9186b0'],
        Math.min(1, lit(x, y) * 0.35 + 0.22 + near * 0.55 + fbm(x / 80, y / 26, 99) * 0.18)), x, y, 0.34, 251), r, 4);
    },
    len: (x, y) => (30 + (y - GY(x)) * 0.3) * lengthOf(x, y, 61), lw: (x, y) => 3.6 * widthOf(x, y, 63), steps: 3, follow: 0.97, lenJ: 0.3, wJ: 0.3, aJ: 0.35, impasto: 0.72, relief: 0,
  });
  strokes(out, counter, {                                            // the cliff's own shadow at its foot
    rng, n: 220,
    sample: r => { const x = 210 + r() * 604; const y = GY(x) - 1 + Math.pow(r(), 0.6) * 34; return [x, y]; },
    dir: () => 0.03,
    col: (x, y, r) => jig(mix('#2a2b4c', '#14152b', 0.3 + r() * 0.5), r, 4),
    len: 40, lw: 12, steps: 2, lenJ: 0.6, relief: 0, op: 0.7,
  });
  paintPath(out, counter, rng,                                       // the track it was rolled along
    [[SX + 150, SY + SH + 8], [SX + 108, SY + SH + 6], [SX + 66, SY + SH + 4], [SX + 34, SY + SH + 2]],
    (x, y, r) => jig(mix('#2b2c48', '#171829', 0.3 + r() * 0.6), r, 4), { lw: 12, len: 7, density: 0.6, jitter: 1.1 });
  strokes(out, counter, {                                            // the sill, worn flat at the threshold
    rng, n: 220,
    sample: r => [DL - 22 + r() * (PR - DL + 34), FLOOR - 2 + r() * 13],
    dir: () => 0.02,
    col: (x, y, r) => jig(ramp(['#2e2f47', '#413d52', '#5c5560', '#7e7574'], lit(x, y) * 0.5 + r() * 0.5), r, 5),
    len: 16, lw: 5, steps: 2, lenJ: 0.6, relief: 0, op: 0.85,
  });
  strokes(out, counter, {                                            // rubble spilled where the rock was cut
    rng, n: 300,
    sample: r => { const x = 190 + r() * 560; const y = GY(x) + Math.pow(r(), 0.6) * 26; return [x, y]; },
    dir: () => 0.05,
    col: (x, y, r) => jig(ramp(['#232440', '#333150', '#4c4660', '#6d646c'], lit(x, y) * 0.45 + r() * 0.6), r, 5),
    len: 9, lw: 3.4, steps: 2, lenJ: 0.7, relief: 0, op: 0.7,
  });
  // the path: it comes up out of the valley on the left and ends at the tomb. The one made
  // thing in the picture, so by Munch's law the one near-straight shape.
  paintPath(out, counter, rng,
    [[-12, 496], [92, 470], [186, 446], [268, 424], [332, 404], [370, 392]],
    (x, y, r) => jig(mix('#4a466c', '#9c93b0', lit(x, y) * 0.75 + r() * 0.15), r, 6), { lw: 10, len: 7, density: 0.75, jitter: 1.0 });
  const rock = (bx, by, w, h) => {
    out.push(`<path d="M${R1(bx - w)} ${R1(by)}Q${R1(bx - w * 0.92)} ${R1(by - h * 0.9)} ${R1(bx - w * 0.1)} ${R1(by - h)}Q${R1(bx + w * 0.7)} ${R1(by - h * 1.04)} ${R1(bx + w)} ${R1(by - h * 0.2)}Q${R1(bx + w * 1.04)} ${R1(by)} ${R1(bx + w * 0.6)} ${R1(by)}Z" fill="#282a48"/>`);
    counter.n++;
    strokes(out, counter, {
      rng, n: Math.round(w * 1.7),
      sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 0.5); return [bx + Math.cos(a) * w * d, by - h * 0.5 + Math.sin(a) * h * 0.5 * d]; },
      dir: () => 0.06,
      col: (x, y, r) => {
        const shoulder = Math.max(0, 1 - (y - (by - h)) / (h * 0.9)) * 0.6 + Math.max(0, (bx - x) / w) * 0.35;
        return jig(ramp(['#1e2039', '#2a2b48', '#3d3959', '#5c5477', '#867c9a'], Math.min(1, lit(x, y) * 0.4 + shoulder)), r, 4);
      },
      len: 18, lw: 6, steps: 3, follow: 0.97, lenJ: 0.6, aJ: 0.4, impasto: 0.72, relief: 0,
    });
  };
  rock(118, 470, 40, 30); rock(216, 456, 26, 19); rock(686, 462, 42, 28);
  rock(58, 516, 74, 46); rock(742, 522, 88, 52); rock(390, 528, 70, 34);   // repoussoir: big and near and dark
  strokes(out, counter, {                                            // the near ground, out of the light
    rng, n: 700,
    // ⚠ and its top edge WANDERS. A dark band with a level edge across the whole plate is a
    // stripe, not ground; the near sill has to rise and fall the way real ground does.
    sample: r => { const x = -14 + r() * 828; const e = 444 + 16 * Math.sin(x / 118) + 7 * Math.sin(x / 41 + 2);
                   return [x, e + Math.pow(r(), 0.55) * (524 - e)]; },
    dir: x => 0.02 + Math.sin(x / 130) * 0.07,
    col: (x, y, r) => { const e = 444 + 16 * Math.sin(x / 118) + 7 * Math.sin(x / 41 + 2);
      return jig(chroma(ramp(['#3c3a5e', '#332f52', '#282546', '#1e1c38'], Math.min(1, (y - e) / 70 + r() * 0.3)), x, y, 0.4, 257), r, 4); },
    len: (x, y) => 40 * lengthOf(x, y, 71), lw: (x, y) => 5 + 5 * free(x, y, 73), steps: 3, follow: 0.99, lenJ: 0.3, wJ: 0.3, impasto: 0.72, relief: 0, op: 0.8,
  });
  const scrub = (bx, by, w, h) => strokes(out, counter, {
    rng, n: Math.round(w * 1.5),
    sample: r => { const a = r() * Math.PI, d = Math.pow(r(), 0.7); return [bx + Math.cos(a + Math.PI) * w * d + w / 2, by - Math.abs(Math.sin(a)) * h * d]; },
    dir: (x, y) => -Math.PI / 2 + (fbm(x / 8, y / 8, 101) - 0.5) * 1.4,
    col: (x, y, r) => jig(mix('#1e2830', '#37473c', r() * 0.85), r, 7),
    len: 8, lw: 1.8, steps: 2, lenJ: 0.6, relief: 0,
  });
  scrub(452, 402, 20, 12); scrub(520, 414, 24, 14); scrub(318, 400, 16, 10);
  scrub(624, 452, 26, 15); scrub(74, 502, 24, 14);
  // the date palm at the turn of the path — the engine's own palm now (after his kind, Sep 15),
  // in the night's colours, lit faintly from the moon side
  E.paintTree(out, counter, rng, 240, 512, 150, { species: 'palm', shadowDir: 1, blossom: 0, tuft: 0,
    lightFn: (x, y) => 0.22 + 0.1 * (1 - x / 800),
    crownCols: ['#0c1410', '#101a15', '#172619', '#24361f', '#2f4a2a', '#3d5c36', '#52704a'] });
  inscriptionText(out, greekRef(15, 4), { x: 108, y: 452, h: 14, body: '#a9b0d4', edge: '#0d0f22', op: 0.3, edgeOp: 0.4 });
  nearR.push([_near, out.length]);

  const ALT = 'Night. On the right a mass of rock rises out of a pale sand floor; on the left the land opens into a valley with far hills stepping back under a big night sky, a small cold moon and a scatter of stars. Cut into the rock face is a tomb: a tall doorway with a rounded head, pure black inside — the one true black in the picture. A great stone stands on the sand rolled across the right half of that opening, its left shoulder pale in the moonlight, a hard shadow down its right flank and a deep shadow beneath it, and a thin line of gold light escaping down the join at its left. A cord is stretched across the stone and fixed to the rock on either side with lumps of red wax pressed with a seal — the tomb made sure. A path climbs from the valley past a date palm and ends at the stone. A second, older cut stands empty away to the right.';

  const RAW = { undercoat: 0, weave: 0, varnish: 0, oil: 0 };
  const pick = ranges => ranges.map(([a, b]) => out.slice(a, b).join('\n')).join('\n');
  const claimed = new Set();
  for (const rr of [cliffR, darkR, stoneR, seamR, nearR]) for (const [a, b] of rr) for (let i = a; i < b; i++) claimed.add(i);
  if (LAYER === 'bg') return svgWrap(ALT, out.filter((_, i) => !claimed.has(i)).join('\n'), RAW);
  if (LAYER === 'cliff') return svgWrap(ALT, pick(cliffR), RAW);
  if (LAYER === 'dark') return svgWrap(ALT, pick(darkR), RAW);
  if (LAYER === 'stone') return svgWrap(ALT, pick(stoneR), RAW);
  if (LAYER === 'seam') return svgWrap(ALT, pick(seamR), RAW);
  if (LAYER === 'near') return svgWrap(ALT, pick(nearR), RAW);
  return svgWrap(ALT, out.join('\n'));
}
