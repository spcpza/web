// gen/plates/candle.mjs — "You are the light of the world now — go and shine"
// §27, the ending — the send-off (Matthew 5:16, "let your light so shine
// before men"). No candle, no held flame. The recurring RED child — washed
// clean and glowing with a soft WHITE AURA — stands radiant at the dawn and
// turns toward ANOTHER person still in the shadow, reaching out a hand so the
// light and warmth pass from the child straight into them. The other figure,
// in its own night blue-grey, is only just beginning to catch the light:
// its near flank warming, a first glow waking on its face. Hopeful dawn.
// La Berceuse tenderness: round, calm, warm.
//
// Easter egg: held faintly in the radiant child's other hand, the red hat
// from plate 18 — carried all the way here.

export const name = 'candle';
export const title = 'Go and shine';
export const caption = 'You are the light of the world now — go and shine.';
export const seed = 27061126;
export const focal = { x: 404, y: 300 }; // portrait window: the radiant child's outstretched hand reaching into the shadow
// MOBILE 3D — PAINT ON PAINT: the dawn swirl is a smooth ground + several
// INDEPENDENT bold, gapped swirl-sheets stacked at their own depths (you see
// strokes, and through the gaps the strokes behind); then the child's radiance
// + floor; then the two children closest. The dawn turns and builds up in
// layers as the phone tilts.
// ⭐ DETAIL PASS (Sep 8): three times the marks a sheet, every stroke its own width and
// length (free hashes, no rule — see widthOf/lengthOf in paint()), hairline relief.
const SHEETS = [
  { n: 450, len: 32, lw: 3.0, lift: 0.00 },
  { n: 480, len: 28, lw: 2.8, lift: 0.06 },
  { n: 520, len: 25, lw: 2.6, lift: 0.12 },
  { n: 550, len: 22, lw: 2.4, lift: 0.18 },
];
export const layers = [
  { name: 'bg', opaque: true },   // the smooth dawn ground (backmost)
  ...SHEETS.map((_, i) => ({ name: 'n' + i })),   // n0 (deep) → n3 (near): the stacked dawn-swirl sheets
  { name: 'mid' },                // the radiant child's breath-halo + the warm floor pool the pair stand in
  { name: 'fg' },                 // the two children + the light passing between their hands (one connected body)
];

export function paint(E, opts = {}) {
  const {
    mulberry32, fbm, curlV, swirlV, goldenSpiralV, mix, ramp, jig, strokes, rej,
    paintFigure, paintPath, inCap, underpaintCapsules, paintChild, castShadow, personCaps, lightRadial,
    ribbon, svgWrap, R1, W, H,
    GOLD, GOLD_PALE, GOLD_DEEP, GOLD_HOT, NIGHT, DARKEST,
  } = E;

  const rng = mulberry32(seed);
  const out = [];
  const counter = { n: 0 };
  const LAYER = opts.layer || 'full';
  // POST-RESURRECTION FLIP: the send-off is at DAWN now. Background light, the
  // two children dark silhouettes, the one flame the bright point passing on.
  out.push(`<defs><radialGradient id="dawn27" cx="0.5" cy="0.42" r="0.78">
<stop offset="0" stop-color="#fff4d6"/>
<stop offset="0.4" stop-color="#f6d4c2"/>
<stop offset="0.74" stop-color="#d6c8ee"/>
<stop offset="1" stop-color="#a8d0ee"/>
</radialGradient></defs>`);
  out.push(`<rect width="${W}" height="${H}" fill="url(#dawn27)"/>`);

  /* ---------------- geometry ---------------- */
  // the light has no candle now — it is the CHILD, shining. The source sits at
  // the radiant child's heart/reaching hand, between the two children.
  /* ⚠⚠ THE LIGHT MOVED TO WHERE THE FLAME ACTUALLY IS. Fred drew a child holding a real
     candle (`light-give`), and this plate's whole light model — the glow, the golden spiral
     the dawn turns on, and the night it breaks into — was still centred on the empty hand of
     the figure that cell replaced, 80 units away. A page's light source and its drawn source
     have to be the same point or nothing in the painting agrees with the picture. */
  const flame = [326, 352];                       // the candle in the giving child's cupped hands
  const gF = lightRadial(flame[0], flame[1], 175);
  // the meeting of hands: the radiant child reaches across; the other reaches back
  const handL = [334, 356];                       // the giving child's cupped hands, round the flame
  const handR = [418, 368];                       // the other's hands, open to receive

  /* ---------------- 1. THE DAWN ---------------- */
  // the dawn turns on a GOLDEN SPIRAL about the radiant child (divine proportion, Col 1:17)
  const dir0 = (x, y) => {
    let [vx, vy] = curlV(x, y, 411, 160);
    vx = vx * 90 + 10; vy = vy * 90;
    const [a, b] = goldenSpiralV(x, y, flame[0], flame[1] - 30, 70, 130, 1);
    return Math.atan2(vy + b, vx + a);
  };
  // a JOYFUL colourful dawn — bright blue, lilac, pink, warming to gold at the flame
  const dawnCol = (x, y, r, lift) => {
    const g = gF(x, y);
    let c = ramp(['#7cc0ee', '#bcaee8', '#f4b8d2', '#f8e6c8'], fbm(x / 110, y / 110, 19) * 0.6 + g * 0.3 + 0.16);
    c = mix(c, '#fff4d6', g * 0.5 + (lift || 0));
    // the dawn BREAKS from the radiant child (left) INTO the night the other still
    // stands in (right) + the outer edges — real value-structure so the light has
    // darkness to shine into (Matt 5:16). The central glow stays warm (1 - g).
    /* ⚠ AND THE DARK HAS TO BE DARK ENOUGH TO BE WORTH SHINING INTO. "So carry it into the
       dark. One small light is enough to see by" — and the page was pale lilac corner to
       corner, so the candle was the dimmest bright thing on it. This is still a DAWN (the
       caption is "go and shine", not a night), but the dawn now breaks from the flame and
       everything away from it goes down. */
    const night = Math.max(0, (x - flame[0] + 10) / 360) * 1.30
                + Math.max(0, (Math.hypot(x - flame[0], y - flame[1]) - 170) / 250) * 0.80;
    c = mix(c, '#1b1740', Math.min(0.92, night) * (1 - g * 0.72));
    return jig(c, r, 8);
  };
  // the smooth dawn GROUND — broad soft masses (opaque); the visible swirl
  // brushwork lives in the stacked sheets, so their gaps reveal paint not a fill
  // ⭐ EVERY STROKE DRAWS ITS OWN WIDTH AND LENGTH (Fred: "use no rules, a paint stroke
  // just exist because it exist") — two independent hashes per mark, no field, no coupling.
  const free = (x, y, salt) => { const n = Math.sin(x * 12.9898 + y * 78.233 + salt) * 43758.5453; return n - Math.floor(n); };
  const widthOf  = (x, y, salt) => 0.40 + 3.2 * Math.pow(free(x, y, salt), 2.6);
  const lengthOf = (x, y, salt) => 0.40 + 1.5 * Math.pow(free(x, y, salt + 17), 1.5);
  strokes(out, counter, {
    rng, n: 1300, sample: rej(-10, -10, 810, 510),
    dir: dir0, col: (x, y, r) => dawnCol(x, y, r, 0),
    len: (x, y) => 30 * lengthOf(x, y, 11), lw: (x, y) => 4.6 * widthOf(x, y, 13), steps: 3, follow: 0.85, wild: 0.06, lenJ: 0.3, wJ: 0.3, impasto: 0.5, relief: 0.4,   // ⚠ relief was the default 1 — slabs
    aJ: (x, y) => 0.12 + gF(x, y) * 0.4,
  });
  /* ---------------- 1a. A CITY SET ON AN HILL (Matt 5:14) ----------------
     The verse before this page's verse: "Ye are the light of the world. A city that is set
     on an hill cannot be hid." The children are being sent INTO the dark on the right — so
     that is where the hill stands, far off, with a small town on its crown: ordinary houses
     with their windows lit, one tower, and the glow of all those windows lying on the slope
     under them. It is where they are going. It lives in the backmost plane, far, and the
     swirl sheets thin over it so the dark cannot cover what the verse says cannot be hid. */
  const CITY = { x: 648, top: 330, x0: 520, x1: 790 };
  const cityHill = x => 384 - 54 * Math.exp(-(((x - CITY.x) / 118) ** 2)) - 8 * Math.exp(-(((x - 560) / 70) ** 2));
  const inCity = (x, y) => x > CITY.x0 && x < CITY.x1 && y > CITY.top - 34 && y < cityHill(x) + 8;   // the town only — the hill itself is part of the swirl
  {
    const hr = mulberry32(seed + 514);
    /* ⚠ first cut filled the hill as a polygon to y=410: a black block with a ruler edge in a
       field that is not dark there. A far hill in a painted sky is the sky's own colour gone
       down a value — so it is STROKES of the dawn's colour, darkest at the crown, thinning
       out as they fall so the hill has a top and no bottom. */
    strokes(out, counter, {
      rng: hr, n: 900,
      sample: r => { for (let t = 0; t < 24; t++) { const x = CITY.x0 + r() * (CITY.x1 - CITY.x0), dep = Math.pow(r(), 0.7) * 74, y = cityHill(x) + dep; if (r() < Math.pow(1 - dep / 74, 1.3)) return [x, y]; } return null; },
      dir: x => { const e = 5; return Math.atan2(cityHill(x + e) - cityHill(x - e), 2 * e) + (fbm(x / 30, 0, 44) - 0.5) * 0.5; },
      col: (x, y, r) => {
        const dep = Math.max(0, (y - cityHill(x)) / 74), up = 1 - dep;
        const edge = Math.min(1, Math.max(0, (x - CITY.x0) / 40, (CITY.x1 - x) / 40));   // fades out at both ends too
        let c = mix(dawnCol(x, y, r, 0), '#1d1946', (0.34 + 0.44 * up) * edge);
        c = mix(c, '#6a5480', Math.max(0, 1 - (x - CITY.x0 - 20) / 80) * up * 0.35);   // the dawn's rim on the side that faces the flame
        return c;
      },
      len: (x, y) => 12 * lengthOf(x, y, 47), lw: (x, y) => 3.2 * widthOf(x, y, 49), steps: 2, lenJ: 0.4, relief: 0.3, flow: 0, impasto: 0.4,
    });
    // the town on the crown: little houses, each its own height, one tower — made things, straight lines
    const houses = [];
    let hx = CITY.x - 66;
    while (hx < CITY.x + 70) {
      const w = 7 + hr() * 8, h = 6 + hr() * 7 + Math.max(0, 6 - Math.abs(hx - CITY.x) / 8);
      houses.push({ x: hx, w, h, tower: false }); hx += w + 1 + hr() * 4;
    }
    houses[Math.floor(houses.length / 2)].tower = true;
    // the glow of the windows lying on the slope — painted first, under the houses
    strokes(out, counter, {
      rng: hr, n: 220,
      sample: r => { const a = r() * Math.PI * 2, dd = Math.pow(r(), 0.9) * 46; return [CITY.x + Math.cos(a) * dd * 1.6, cityHill(CITY.x) - 6 + Math.abs(Math.sin(a)) * dd * 0.7]; },
      dir: (x, y) => Math.atan2(x - CITY.x, -(y - CITY.top)),
      col: (x, y, r) => { const dd = Math.hypot((x - CITY.x) / 1.6, (y - CITY.top) / 0.7) / 46; return jig(ramp(['#e9c27a', '#9a7a52', '#4a3a58', '#241f48'], Math.min(1, dd)), r, 6); },
      len: 7, lw: 1.8, steps: 2, lenJ: 0.5, op: 0.55, relief: 0.15, flow: 0,
    });
    for (const hs of houses) {
      const base = cityHill(hs.x + hs.w / 2) + 1, top = base - hs.h, tw = hs.tower ? hs.w * 0.5 : 0;
      const wall = mix('#2a2448', '#3a3060', hr() * 0.6);
      out.push(`<rect x="${R1(hs.x)}" y="${R1(top)}" width="${R1(hs.w)}" height="${R1(hs.h + 2)}" fill="${wall}"/>`); counter.n++;
      out.push(`<path d="M${R1(hs.x - 0.8)} ${R1(top)}L${R1(hs.x + hs.w / 2)} ${R1(top - hs.w * 0.42)}L${R1(hs.x + hs.w + 0.8)} ${R1(top)}Z" fill="#4a3a5e"/>`); counter.n++;   // the roof, lit a shade by the sky
      if (hs.tower) {
        out.push(`<rect x="${R1(hs.x + hs.w / 2 - tw / 2)}" y="${R1(top - 14)}" width="${R1(tw)}" height="16" fill="${wall}"/>`); counter.n++;
        out.push(`<path d="M${R1(hs.x + hs.w / 2 - tw / 2 - 0.6)} ${R1(top - 14)}L${R1(hs.x + hs.w / 2)} ${R1(top - 22)}L${R1(hs.x + hs.w / 2 + tw / 2 + 0.6)} ${R1(top - 14)}Z" fill="#4a3a5e"/>`); counter.n++;
        out.push(`<rect x="${R1(hs.x + hs.w / 2 - 0.8)}" y="${R1(top - 11)}" width="1.6" height="2.4" fill="#ffd98a"/>`); counter.n++;
      }
      // windows: one or two rows, each a small warm square — the reason the city can be seen at all
      const rows = hs.h > 10 ? 2 : 1, cols = Math.max(1, Math.floor(hs.w / 3.4));
      for (let rI = 0; rI < rows; rI++) for (let cI = 0; cI < cols; cI++) {
        if (hr() < 0.18) continue;                                   // a dark window here and there
        const wx = hs.x + 1.2 + cI * (hs.w - 2) / cols + 0.4, wy = top + 1.6 + rI * (hs.h - 2) / rows;
        out.push(`<rect x="${R1(wx)}" y="${R1(wy)}" width="1.7" height="2.1" fill="${hr() < 0.3 ? '#ffe2a0' : '#f4c46a'}"/>`); counter.n++;
      }
    }
    // a soft breath of that light in the air above the town — the thing that cannot be hid
    strokes(out, counter, {
      rng: hr, n: 90,
      sample: r => { const a = r() * Math.PI, dd = Math.pow(r(), 0.8) * 34; return [CITY.x + Math.cos(a + Math.PI) * dd * 1.7, CITY.top - 4 - Math.sin(a) * dd * 0.55]; },
      dir: (x, y) => Math.atan2(x - CITY.x, -(y - CITY.top)) + Math.PI / 2,
      col: (x, y, r) => jig(mix('#3a2e5a', '#c9a262', Math.max(0, 1 - Math.hypot((x - CITY.x) / 1.7, (y - CITY.top) / 0.55) / 34) * 0.7), r, 6),
      len: 6, lw: 1.5, steps: 2, lenJ: 0.5, op: 0.5, relief: 0.1, flow: 0,
    });
  }
  const bgEnd = out.length;   // BG plane: the smooth dawn ground (opaque, backmost)
  // the stacked dawn-swirl SHEETS — each an independent bold, gapped pass
  const sheets = SHEETS.map((e, k) => {
    const srng = mulberry32(seed + 1009 * (k + 1));
    const sh = [];
    strokes(sh, { n: 0 }, {
      rng: srng, n: e.n, sample: rej(-10, -10, 810, 510, (x, y) => !inCity(x, y) || free(x, y, 5 + k) < 0.22),   // the sheets part over the city on the hill
      dir: dir0, col: (x, y, r) => dawnCol(x, y, r, e.lift),
      len: (x, y) => e.len * lengthOf(x, y, 21 + k), lw: (x, y) => e.lw * widthOf(x, y, 27 + k),
      steps: 3, follow: 0.85, wild: 0.08, lenJ: 0.3, wJ: 0.3, impasto: 0.6, relief: 0.4,
      aJ: (x, y) => 0.12 + gF(x, y) * 0.4,
    });
    return sh.join('\n');
  });
  /* ⭐⭐ THE HALO BREATHES. Fred: "lets animate candle comes and nonight."
     ⚠ AND ONLY THE HALO. `fg` carries both children AND the flame itself, and a boiled
     figure is two figures; `bg` and the swirl sheets are the night. The halo is the one thing
     on this page that is light rather than a thing, so it is the one thing allowed to move —
     which is also the page's sentence, because a flame just handed on is the reason there is
     any light here at all.
     ⚠⚠ It SWELLS rather than jitters. A displacement boil alone measured as pure fine-scale
     noise beside the pages Fred has already approved (see the note in comes.mjs); what reads
     is the radiance actually reaching further and pulling back, drawn that way per frame. */
  const _FN = Math.max(1, globalThis.__FRAME_N || 1);
  const _FR = (globalThis.__FRAME || 0) % _FN;
  const PH = _FN > 1 ? _FR / _FN : 0;
  const reach = 1 + 0.12 * Math.cos(Math.PI * 2 * PH);   // one quiet breath round the ring
  // the child's radiance: a soft tangential halo, gold curling out from the
  // shining child and washing toward the one still in shadow
  strokes(out, counter, {
    rng, n: 480,
    sample: r => { const a = r() * Math.PI * 2, d = (30 + Math.pow(r(), 1.35) * 130) * reach; return [flame[0] + Math.cos(a) * d, flame[1] + Math.sin(a) * d * 0.92]; },
    dir: (x, y) => Math.atan2(x - flame[0], -(y - flame[1])),
    col: (x, y, r) => {
      const d = Math.hypot(x - flame[0], (y - flame[1]) / 0.92);
      if (d > 110 && d < 150 && r() < 0.045) return jig('#6a4caf', r, 14);
      return jig(ramp([GOLD, GOLD_DEEP, '#8a6a34', '#4a3c44', '#232a4a'], d / 165), r, 9);
    },
    len: 12 * reach, lw: 2.6, steps: 2, lenJ: 0.5, aJ: 0.16, wild: 0.1, impasto: 0.62,
  });
  // the floor: a faint warm pool the children stand in, dying outward
  strokes(out, counter, {
    rng, n: 320,
    sample: r => { const a = r() * Math.PI, d = Math.pow(r(), 1.2) * 200; return [400 + Math.cos(a + Math.PI) * d * 1.25, 462 + Math.abs(Math.sin(a)) * d * 0.16]; },
    dir: () => 0.04,
    col: (x, y, r) => jig(mix(ramp(['#ccba90', '#dac99c', '#b2a684'], Math.hypot(x - 400, (y - 460) * 3) / 230), '#f6e8c2', 0.18), r, 8),
    len: 16 * (0.9 + 0.1 * reach), lw: 3, steps: 2, lenJ: 0.55, wild: 0.1,
  });
  /* ---------------- 1b. LIFE — soft moths circling wide of the light ------
     Drawn to the light that shines before men (Matt 5:16) — three-four soft
     moths at a respectful radius, never singed, never between the children.
     Dedicated rng so every existing stroke downstream stays untouched. */
  {
    const mrng = mulberry32(seed + 777);
    const moths = [
      { c: [320, 165], s: 22, bank: 0.30 },   // upper-left, banking in
      { c: [472, 148], s: 20, bank: -0.25 },  // upper-right
      { c: [395, 112], s: 18, bank: 0.10 },   // high over the light
      { c: [283, 222], s: 21, bank: 0.45 },   // wide left, level with the halo's edge
    ];
    for (const m of moths) {
      const [cx, cy] = m.c, s = m.s;
      const rot = (x, y) => { const co = Math.cos(m.bank), si = Math.sin(m.bank); return [cx + x * co - y * si, cy + x * si + y * co]; };
      // two soft wing lobes — dusty mauve, a breath of gold on the flame-side edge
      strokes(out, counter, {
        rng: mrng, n: 30,
        sample: r => { const side = r() < 0.5 ? -1 : 1, a = r() * Math.PI * 2, d = Math.pow(r(), 0.8); return rot(side * (s * 0.30 + Math.cos(a) * d * s * 0.24), -s * 0.10 + Math.sin(a) * d * s * 0.16); },
        dir: (x, y) => m.bank + ((x - cx) > 0 ? 0.5 : -0.5) + (fbm(x / 5, y / 5, 31) - 0.5) * 0.7,
        col: (x, y, r) => {
          if (((flame[0] - cx) * (x - cx) > 0) && r() < 0.16) return jig('#ecd8a2', r, 10); // gold dust on the lit edge
          // ⭐ Sep 12 (the beauty pass): on the page the moths read as four BLACK ticks in the
          // swirl. A moth beside a candle is LIT — dusty mauve going pale, the flame's gold on
          // its lit edge, and no ink-dark line anywhere on it.
          return jig(ramp(['#b3a2bc', '#957f9e', '#7a6788'], Math.abs(x - cx) / (s * 0.55) + (r() - 0.5) * 0.2), r, 8);
        },
        len: 4.5, lw: 1.7, steps: 2, lenJ: 0.5, wild: 0.15,
      });
      // the wing-top line — one soft curved 'm', the read of the silhouette (living = curved)
      paintPath(out, counter, mrng,
        [rot(-s * 0.5, 0), rot(-s * 0.25, -s * 0.30), rot(0, -s * 0.06), rot(s * 0.25, -s * 0.30), rot(s * 0.5, 0)],
        (x, y, r) => jig(mix('#8d7a98', '#e2cfa0', gF ? gF(x, y) * 0.5 : 0.2), r, 6), { lw: 1.2, len: 2.6, density: 0.8, jitter: 0.35 });
      // the small body
      paintPath(out, counter, mrng, [rot(0, -s * 0.16), rot(0, s * 0.18)],
        (x, y, r) => jig('#6f5f7c', r, 6), { lw: 1.6, len: 2.2, density: 0.9, jitter: 0.25 });
    }
  }
  const skyEnd = out.length;   // end of MID plane (radiance halo + floor pool + moths); FG begins below

  /* ---------------- 2. THE TWO CHILDREN ----------------  [FG plane from here down] */
  // Left: the child in deep red — plate 02's child, washed clean, now SHINING
  //   (a soft white aura), reaching out a hand to give the light away.
  // Right: the next one, in night blue-grey, still in the shadow, lifting a
  //   hand to receive — only just beginning to catch the warmth.
  const L = { x: 318, feet: 462 };
  const R_ = { x: 486, feet: 466 };
  // the grown protagonist — the red pilgrim, grown taller, leaning across,
  // holding the flame OUT to the other (aura: washed and shining, Matt 5:16)
  E.paintMask(out, counter, rng, {
    x: L.x, y: L.feet - 6, h: 168, facing: 1, lean: 4, aura: 14,
    armR: [397, 272], armL: [L.x - 22, L.feet - 70],
    eye: [1, -0.3], mood: 'joy',
  });
  // the next one — night blue-grey pilgrim, still in the shadow, lifting a
  // hand to RECEIVE — only just beginning to catch the warmth
  E.paintMask(out, counter, rng, {
    x: R_.x, y: R_.feet - 6, h: 158, facing: -1, lean: -3,
    armL: [407, 282], armR: [R_.x + 18, R_.feet - 64],
    cols: ['#2c3658', '#1c2440', '#10162a'],
    maskCols: ['#c8c2b4', '#b0aa9c', '#8e8878'],
    eye: [-1, -0.3], mood: 'wonder',
  });
  // rim light down each child's flame-facing flank
  // (the pilgrim cloak carries the flame-facing light)
  // the receiver's flank: only a faint, partial rim — the light just arriving
  // (the pilgrim cloak carries the flame-facing light)

  /* ---------------- 3. THE FACES ---------------- */
  // (each pilgrim's mask carries its own face — the giver's joy arcs, the
  //  receiver's waking wonder eyes)

  /* ---------------- 4. EASTER EGG — the red hat from plate 18 --------- */
  // held faintly in the lit child's other hand, down at her side
  {
    const hx2 = L.x - 23, hy2 = L.feet - 60;
    strokes(out, counter, {
      rng, n: 30,
      sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 1.4) * 8; return [hx2 + Math.cos(a) * d * 1.25, hy2 + Math.sin(a) * d * 0.7]; },
      dir: (x, y) => 0.3 + (y - hy2) * 0.06,
      col: (x, y, r) => jig(ramp(['#a3331f', '#7e2418', '#4a1208'], Math.hypot(x - hx2, y - hy2 - 2) / 10 + (1 - gF(x, y)) * 0.35), r, 8),
      len: 5, lw: 1.8, steps: 2,
    });
    // brim: one darker sweep
    paintPath(out, counter, rng, [[hx2 - 9, hy2 + 4], [hx2, hy2 + 5.5], [hx2 + 9, hy2 + 3.5]], (x, y, r) => jig('#5e1a10', r, 7), { lw: 1.8, len: 3.5, density: 0.7, jitter: 0.5 });
  }

  /* ---------------- 5. THE LIGHT PASSING HAND TO HAND ---------------- */
  // No candle. The radiant child's open hand GIVES the light; the other's hand
  // lifts to RECEIVE it. The warmth crosses the small gap between them as a
  // stream of gold — the light of the world, handed on (Matt 5:16).
  // the giving hand: a small warm cluster of strokes, gold pouring from it
  strokes(out, counter, {
    rng, n: 30, sample: r => { const a = r() * Math.PI * 2, d = r() * 6; return [handL[0] + Math.cos(a) * d, handL[1] + Math.sin(a) * d]; },
    dir: () => 0.3, col: (x, y, r) => jig(ramp(['#fff6d8', GOLD_PALE, GOLD, '#c98e4e'], Math.hypot(x - handL[0], y - handL[1]) / 7 + (r() - 0.5) * 0.2), r, 7),
    len: 4.5, lw: 2, steps: 2, impasto: 0.6,
  });
  // the receiving hand: still half in shadow, the warmth only beginning to reach it
  strokes(out, counter, {
    rng, n: 24, sample: r => { const a = r() * Math.PI * 2, d = r() * 5.5; return [handR[0] + Math.cos(a) * d, handR[1] + Math.sin(a) * d]; },
    dir: () => 0.7, col: (x, y, r) => jig(mix('#1c2440', GOLD_DEEP, gF(x, y) * 0.7), r, 8), len: 4, lw: 2, steps: 2,
  });
  // THE STREAM: light flowing across the gap from the giving hand to the
  // receiving one — a soft braided current of gold, warmest at its source
  {
    const a = handL, b = handR;
    const ctl = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 - 16];   // a gentle upward bow
    const q = t => { const u = 1 - t; return [u * u * a[0] + 2 * u * t * ctl[0] + t * t * b[0], u * u * a[1] + 2 * u * t * ctl[1] + t * t * b[1]]; };
    for (let s = 0; s < 3; s++) {                              // three loose strands
      const off = (s - 1) * 3;
      for (let t = 0; t < 1; t += 0.09) {
        const p = q(t), p2 = q(Math.min(1, t + 0.1));
        const wL = (3.2 - t * 1.4) * (0.7 + (s === 1 ? 0.5 : 0));  // tapering toward the receiver
        // bright gold at the giving hand, cooling toward the shadowed receiver
        const cc = jig(ramp(['#fff6d8', GOLD_PALE, GOLD, '#d8b86a', '#7a6a48'], t), rng, 8);
        const jx = (rng() - 0.5) * 2.2, jy = (rng() - 0.5) * 2 + off * 0.4;
        out.push(ribbon([[p[0] + jx, p[1] + jy], [(p[0] + p2[0]) / 2 + jx, (p[1] + p2[1]) / 2 + jy], [p2[0] + jx, p2[1] + jy]], wL, cc, [0.5, 0.55, 0.42]));
        counter.n++;
      }
    }
  }
  // a first glow waking on the receiver's near flank — the warmth taking hold
  strokes(out, counter, {
    rng, n: 18,
    sample: r => { const a = r() * Math.PI * 2, d = r() * 5; return [handR[0] - 6 + Math.cos(a) * d, handR[1] - 4 + Math.sin(a) * d * 1.2]; },
    dir: () => -Math.PI / 2 + 0.2,
    col: (x, y, r) => jig(mix(GOLD_DEEP, GOLD_PALE, r() * 0.6), r, 7),
    len: 3.2, lw: 1.4, steps: 2,
  });
  // a few soft sparks lifting off the stream — the light has begun to spread
  strokes(out, counter, {
    rng, n: 14,
    sample: r => [flame[0] + (r() - 0.4) * 20, flame[1] - 18 - r() * 26],
    dir: () => -Math.PI / 2 + 0.15,
    col: (x, y, r) => jig(GOLD_PALE, r, 14),
    len: 3.5, lw: 1.2, steps: 2,
  });

  /* ---------------- 5b. LIFE — night flowers at their feet ----------------
     Small night flowers waking at the children's feet in the first light
     (Matt 6:28-29 "consider the lilies of the field... they toil not").
     Kept well clear of the incised words in the floor at (352,452)/(462,452).
     Dedicated rng so the incised eggs and everything else stay untouched. */
  {
    const frng = mulberry32(seed + 1313);
    const clumps = [
      { x: 268, y: 464 }, { x: 288, y: 470 },   // at the red child's feet, left
      { x: 528, y: 468 }, { x: 548, y: 474 },   // at the receiver's feet, right
      { x: 405, y: 490 }, { x: 425, y: 493 },   // in front of the pair, below the words
    ];
    for (const f of clumps) {
      const h = 13 + frng() * 6, sway = (frng() - 0.5) * 6;
      const top = [f.x + sway, f.y - h];
      // curved stem (living = curved)
      paintPath(out, counter, frng, [[f.x, f.y], [f.x + sway * 0.5, f.y - h * 0.55], top],
        (x, y, r) => jig('#3c4832', r, 8), { lw: 1.8, len: 2.6, density: 0.8, jitter: 0.4 });
      // the bloom: a deep plum-magenta cup with a waking gold heart
      // (plum against the pale lilac-tan floor — contrast against the LOCAL hue)
      strokes(out, counter, {
        rng: frng, n: 16,
        sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 0.9) * 5.5; return [top[0] + Math.cos(a) * d, top[1] - 2 + Math.sin(a) * d * 1.15]; },
        dir: (x, y) => Math.atan2(y - (top[1] + 3), x - top[0]) + Math.PI / 2,
        col: (x, y, r) => r() < 0.22 ? jig('#f6dc9a', r, 8) : jig(ramp(['#c874b8', '#8a3e86', '#5a2456'], Math.hypot(x - top[0], y - top[1] + 2) / 6), r, 9),
        len: 3.6, lw: 1.9, steps: 2, lenJ: 0.5, wild: 0.2,
      });
    }
  }

  /* ---------------- 6. EASTER EGGS — the invitation & the answer (the gospel turned to YOU) ----------------
     The send-off hides the gospel's call to the reader, in original KOINE GREEK, cut faint into the warm
     floor beneath the two children — the deepest secret of all, where the book finally turns and asks:
       Rev 3:20  Γʹ·Κʹ  — "Behold, I stand at the door, and knock... I will come in to him" (the invitation;
                            Holman Hunt's Light of the World — the door opens only from the inside).
       John 1:12 Αʹ·ΙΒʹ — "as many as received him, to them gave he power to become the sons of God" (the
                            answer). The shadowed child RECEIVING the light from the other's hand IS this
                            verse; the word only names what the art already shows. */
  E.inscriptionText(out, E.greekRef(3, 20), { x: 352, y: 452, h: 14, body: '#241608', edge: '#f6e8c6', op: 0.8, edgeOp: 0.55 });
  E.inscriptionText(out, E.greekRef(1, 12), { x: 462, y: 452, h: 14, body: '#241608', edge: '#f6e8c6', op: 0.8, edgeOp: 0.55 });

  // MULTIPLANE: assemble the requested depth plane (transparent where empty).
  const ALT = 'Hopeful dawn; the child in deep red, washed clean and glowing with a soft white aura, reaches out a hand to another child still in the shadow, and the light and warmth pass between their hands into the one just beginning to catch it. Far off on the dark side, a small town sits on the crown of a hill, its windows lit — a city set on a hill that cannot be hid.';
  const RAW = { undercoat: 0, weave: 0, varnish: 0, oil: 0 };
  if (LAYER === 'bg') return svgWrap(ALT, out.slice(0, bgEnd).join('\n'), RAW);      // smooth dawn ground (opaque)
  const nm = LAYER.match(/^n(\d+)$/);
  if (nm) return svgWrap(ALT, '<g>' + sheets[+nm[1]] + '</g>', RAW);                 // one dawn-swirl sheet
  if (LAYER === 'mid') return svgWrap(ALT, out.slice(bgEnd, skyEnd).join('\n'), RAW); // breath-halo + floor pool
  if (LAYER === 'fg') return svgWrap(ALT, out.slice(skyEnd).join('\n'), RAW);        // the two children + the light passing between their hands
  // full painting (desktop): dawn ground, the stacked swirl sheets, then breath + floor + the pair
  return svgWrap(ALT, out.slice(0, bgEnd).concat(sheets, out.slice(bgEnd)).join('\n'));
}
