// gen/plates/string.mjs — "Who you are — and the drift" (§4)
// A big churning daytime sky — wind made visible in curl turbulence — over a
// low quiet hill. The red child stands small on the hill, calm, holding a
// string that arcs far across the sky to a tiny red balloon among the swirls.
// The wind is the antagonist; the grip is calm; the string is UNBROKEN and
// catches the light along its whole length. Romans 3:23 / Acts 17:28.
//
// Paint order (= rng order — append only):
//   1. SKY FIELD   — churning daytime turbulence, lit from upper-left
//   2. CLOUD MASSES — heavier knots of churn, gale streaming left→right
//   3. EASTER EGG  — three tiny birds riding the gale
//   4. HILL        — low dark band, grass combed by the wind
//   5. THE STRING  — one unbroken arc, lit along its whole length
//   6. THE BALLOON — small deep-red teardrop far among the swirls
//   7. THE CHILD   — red, small, planted; the calm grip
export const name = 'string';
export const title = 'Who you are — and the drift';
export const caption = 'The string never snaps.';
export const seed = 20260404;
export const focal = { x: 220, y: 408 }; // portrait window: the radiant hand holding the string
// MOBILE 3D — depth planes (FAR→NEAR): the churning gale sky behind; the hill +
// wind-combed grass + a crest fringe in the middle; foreground fruit-trees nearer;
// and the whole hand→string→child system closest, kept in ONE band because the
// string is one unbroken arc that must stay connected through the pan.
// ⭐ DETAIL PASS (Sep 8): finer sheets, every stroke its own width and length (free hashes,
// no rule — see widthOf/lengthOf in paint()); the gale keeps its flow and its lightning.
export const SKY_SHEETS = [
  { n: 800, len: 28, lw: 3.2, lift: 0.00 },
  { n: 860, len: 26, lw: 3.0, lift: 0.07 },
];
export const layers = [
  { name: 'sky', opaque: true },  // smooth sky ground + clouds + light-break (backmost, opaque)
  ...SKY_SHEETS.map((_, i) => ({ name: 'sky' + (i + 1) })),   // stacked sky-swirl sheets (paint on paint)
  { name: 'far' },                // distant rolling hills (the moving horizon)
  { name: 'birds' },              // the counted flock (31 maroon + 3 green = Jer 31:3) — its
                                  // own cel so the gale can throw each bird independently
  { name: 'mid' },                // the hill, wind-combed grass, bushes, PLANTED trees
  { name: 'fg' },                 // the hand → string → adrift child (one connected system)
];

export function paint(E, opts = {}) {
  const {
    mulberry32, fbm, curlV, goldenSpiralV, mix, ramp, jig, strokes, rej,
    lightRadial, paintFigure, underpaintCapsules, paintChild, personCaps, paintPath, inCap,
    ribbon, svgWrap, R1, W, H,
    GOLD, GOLD_PALE, GOLD_DEEP, GOLD_HOT, NIGHT, DARKEST,
  } = E;

  const rng = mulberry32(seed);
  const out = [];
  const counter = { n: 0 };
  // MOBILE 3D LAYERS: tag ranges per band; MID = the hill.
  const LAYER = opts.layer || 'full';
  const farRanges = [], fgRanges = [];
  // ⭐ EVERY STROKE DRAWS ITS OWN WIDTH AND LENGTH (Fred: "use no rules, a paint stroke
  // just exist because it exist") — two independent hashes per mark, no field, no coupling.
  const free = (x, y, salt) => { const n = Math.sin(x * 12.9898 + y * 78.233 + salt) * 43758.5453; return n - Math.floor(n); };
  const widthOf  = (x, y, salt) => 0.40 + 3.2 * Math.pow(free(x, y, salt), 2.6);
  const lengthOf = (x, y, salt) => 0.40 + 1.5 * Math.pow(free(x, y, salt + 17), 1.5);

  /* ---------------- 1. SKY FIELD ---------------- */
  out.push(`<rect width="${W}" height="${H}" fill="${DARKEST}"/>`);

  // ONE light source: a bright break in the clouds, upper-left.
  const LX = 138, LY = 84;
  const light = lightRadial(LX, LY, 290);
  const hillY = x => 428 - 26 * Math.exp(-(((x - 210) / 260) ** 2)) - 8 * Math.sin(x / 110);

  // THE ALIVE SKY — motion at THREE scales (like looking/garden): the whole sky
  // WHEELS in ONE great spiral over the hand that holds (macro); a few eddies
  // turn inside the wheel (mid); and every stroke curves with its parent current
  // (micro). Swirls within swirls — the gale is not a wall of streaks, it is deep
  // moving water. The eddies still gather the storm's cloud-knots (V, below), and
  // a gentle eastward drift keeps the wind's push through it all.
  const WHEEL_X = 300, WHEEL_Y = 210;   // the great wheel, wheeling over the holding hand
  const EDDIES = [[560, 150, -60], [320, 250, 58], [150, 112, 50], [700, 300, -46]];
  const V = [   // the storm's shoulders — cloud-knots still gather at the eddy cores
    { x: 560, y: 150, s: 200, f: 110 },
    { x: 320, y: 250, s: -140, f: 80 },
    { x: 150, y: 112, s: 122, f: 60 },   // at the light break — the opening swirls
    { x: 700, y: 300, s: -112, f: 64 },
  ];
  const skyDir = (x, y) => {
    let vx = 40, vy = 4;                                             // the gale still drifts eastward
    { const [a, b] = goldenSpiralV(x, y, WHEEL_X, WHEEL_Y, 115, 260); vx += a; vy += b; }   // 1 · MACRO — the one great wheel
    for (const [ex, ey, s] of EDDIES) { const [a, b] = goldenSpiralV(x, y, ex, ey, s, 80); vx += a; vy += b; }   // 2 · MID — eddies turning inside it
    const [c, d] = curlV(x, y, 31, 120); vx += c * 26; vy += d * 26; // 3 · MICRO — fine turbulence on every stroke
    return Math.atan2(vy, vx);
  };
  const slash = (x, y) => {
    let near = 1e9; for (const v of V) near = Math.min(near, Math.hypot(x - v.x, y - v.y) / v.f);
    return 0.12 + Math.max(0, 1.1 - near) * 0.3;
  };
  // the eddy cores breathe faint jewel light — deep dusk blue/violet at their hearts
  const EGLOW = [[560, 150, '#3f549e'], [320, 250, '#2f5a92'], [700, 300, '#41337e']];
  // daytime churn: storm-blue base, cream where the light breaks through;
  // a dull orange spark exactly where the break's warmth dies into blue
  const skyCol = (x, y, r, lift) => {
    const g = light(x, y);
    if (g > 0.18 && g < 0.28 && r() < 0.018) return jig('#a8662f', r, 12);
    const t = Math.min(1, 0.12 + g * 1.1 + fbm(x / 100, y / 100, 23) * 0.32);
    let c = ramp(['#22305e', '#36497e', '#5d7cc0', '#93a8cc', '#ddd9bc'], t);
    for (const [ex, ey, ec] of EGLOW) { const d2 = Math.hypot(x - ex, y - ey); c = mix(c, ec, Math.exp(-d2 / 95) * 0.5); }   // the eddy cores breathe faint jewel light
    c = g > 0.3 ? mix(c, '#efe6c0', (g - 0.3) * 0.8) : c;
    if (lift) c = mix(c, '#ffffff', lift);
    return jig(c, r, 7);
  };
  // the smooth sky GROUND — one broad soft pass (opaque base); the swirling
  // brushwork lives in the stacked sheets above, so their gaps reveal paint
  strokes(out, counter, { rng, n: 1300, sample: rej(-10, -10, 810, 450, (x, y) => y < hillY(x) + 8), dir: skyDir, col: (x, y, r) => skyCol(x, y, r, 0),
    len: (x, y) => 34 * lengthOf(x, y, 11), lw: (x, y) => 4.6 * widthOf(x, y, 13), steps: 4, follow: 0.91, wild: 0.05, lenJ: 0.3, wJ: 0.3, relief: 0.4 });   // ⚠ relief was the default 1 — slabs
  // VAN GOGH ARMS — the gale made legible: long curling daytime filaments riding
  // the eddies, cool blue brightening to cream where the light breaks through.
  strokes(out, counter, {
    rng, n: 700,
    sample: rej(-10, -10, 810, 430, (x, y) => y < hillY(x) + 2),
    dir: skyDir,
    col: (x, y, r) => jig(mix('#41598f', '#c2c8d2', Math.min(1, 0.34 + light(x, y) * 0.9 + fbm(x / 100, y / 100, 19) * 0.3)), r, 7),
    len: (x, y) => 48 * lengthOf(x, y, 21), lw: (x, y) => 1.4 * widthOf(x, y, 23), steps: 6, follow: 0.96, wild: 0.02, lenJ: 0.3, wJ: 0.3, relief: 0,
  });

  /* ---------------- 2. CLOUD MASSES ---------------- */
  // heavier knots of churn around the vortices — the storm's shoulders
  strokes(out, counter, {
    rng, n: 900,
    sample: r => { const v = V[r() < 0.6 ? 0 : 1]; const a = r() * Math.PI * 2, d = Math.pow(r(), 0.8) * v.f * 1.15; return [v.x + Math.cos(a) * d, v.y + Math.sin(a) * d * 0.7]; },
    dir: skyDir,
    col: (x, y, r) => {
      const g = light(x, y);
      const t = fbm(x / 60, y / 60, 29);
      return jig(mix(ramp(['#2a3a6a', '#46598a', '#6d83b0'], t), '#d8d2ac', g * 0.55), r, 7);
    },
    len: (x, y) => 22 * lengthOf(x, y, 31), lw: (x, y) => 2.4 * widthOf(x, y, 33), steps: 3, follow: 0.95, wild: 0.06, aJ: slash, lenJ: 0.3, wJ: 0.3, impasto: 0.6, relief: 0.4,
  });
  // the light break itself: a soft warm glow where the sky tears open
  strokes(out, counter, {
    rng, n: 400,
    sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 1.4) * 90; return [LX + Math.cos(a) * d * 1.3, LY + Math.sin(a) * d * 0.8]; },
    dir: skyDir,
    col: (x, y, r) => jig(ramp([mix(GOLD_PALE, '#efe6c0', 0.5), '#e3d6a4', '#b9b694', '#7d8cae'], Math.hypot((x - LX) / 1.3, y - LY) / 95), r, 6),
    len: (x, y) => 20 * lengthOf(x, y, 41), lw: (x, y) => 2.2 * widthOf(x, y, 43), steps: 3, follow: 0.92, lenJ: 0.3, wJ: 0.3, impasto: 0.65, relief: 0.35,
  });
  const skyEnd = out.length;   // the smooth sky ground + clouds + light-break is the SKY plane (opaque)
  // the stacked SKY-SWIRL SHEETS — each an independent bold, gapped pass of the
  // turbulent eddies (paint on paint), with its own rng per sheet so the gaps
  // reveal the smooth ground beneath as the planes parallax apart.
  const skySheets = SKY_SHEETS.map((e, k) => {
    const srng = mulberry32(seed + 1009 * (k + 1));
    const sh = [];
    strokes(sh, { n: 0 }, {
      rng: srng, n: e.n,
      sample: rej(-10, -10, 810, 445, (x, y) => y < hillY(x) + 5),
      dir: skyDir,
      col: (x, y, r) => skyCol(x, y, r, e.lift),
      len: (x, y) => e.len * lengthOf(x, y, 51 + k), lw: (x, y) => e.lw * widthOf(x, y, 57 + k),
      steps: 5, follow: 0.9, wild: 0.12, lenJ: 0.3, wJ: 0.3, impasto: 0.6, relief: 0.4,
    });
    return sh.join('\n');
  });

  /* ---------------- 3. EASTER EGG — COUNT THE FLOCK (a cipher) ----------------
     31 maroon birds and 3 green ones ride the gale. Count them — 31 : 3 —
     and you have Jeremiah 31:3: "with lovingkindness have I DRAWN thee."
     The string is His drawing-cord; the flock spells the verse for the wind to
     carry. A few green among the many maroon make you look twice, then count. */
  const birdStart = out.length;
  {
    const RB = mulberry32(seed + 777);
    const birds = [];
    const place = () => {
      for (let t = 0; t < 50; t++) {
        const bx = 56 + RB() * 690, by = 74 + RB() * 152;
        if (by > hillY(bx) - 34) continue;                       // stay in the sky
        if (Math.hypot(bx - 340, by - 112) < 62) continue;       // clear of the wind-borne child
        if (birds.some(b => Math.hypot(b.x - bx, b.y - by) < 27)) continue; // spaced so they're countable
        return { x: bx, y: by };
      }
      return { x: 56 + RB() * 690, y: 74 + RB() * 152 };
    };
    const N = 34, GREEN = new Set([7, 18, 27]);                  // 3 green spread through 31 maroon
    for (let i = 0; i < N; i++) {
      const p = place(); birds.push(p);
      const col = GREEN.has(i) ? '#357d3e' : '#7c241b';          // 3 green : 31 maroon
      // Sep 12 (the eagle-eye pass): a three-point V with a heavy brush came out as little red
      // T's and check-marks. A bird in a gale is two bent wings: a gull-wing, five points,
      // a finer brush — still one mark each, still countable.
      const w = 5 + RB() * 2.4, d = 2.2 + RB() * 1.3, tilt = (RB() - 0.5) * 1.0;
      paintPath(out, counter, RB, [[p.x - w, p.y + d + tilt], [p.x - w * 0.5, p.y - d * 0.55], [p.x, p.y + d * 0.15], [p.x + w * 0.5, p.y - d * 0.55], [p.x + w, p.y + d - tilt]],
        (x, y, r) => jig(col, r, 7), { lw: 1.3, len: 3, density: 0.9, jitter: 0.35 });
    }
  }

  const birdRanges = [[birdStart, out.length]];   // the counted flock, its own plane so the gale can throw it

  /* ---------------- 4. THE HILL ---------------- */
  strokes(out, counter, {
    rng, n: 1500,
    sample: rej(-10, 380, 810, 510, (x, y) => y > hillY(x)),
    dir: x => { const e = 6; return Math.atan2(hillY(x + e) - hillY(x - e), 2 * e); },
    col: (x, y, r) => {
      const g = light(x, y);
      const t = fbm(x / 80, y / 40, 37);
      return jig(mix(ramp(['#16203c', '#243250', '#3a4a52'], t), '#7a7a4e', g * 0.7), r, 7);
    },
    len: (x, y) => 30 * lengthOf(x, y, 61), lw: (x, y) => 3.2 * widthOf(x, y, 63), steps: 3, follow: 0.9, wild: 0.05, lenJ: 0.3, wJ: 0.3, relief: 0.35,   // ⚠ relief was the default 1
  });
  // wind-combed grass on the crest — all bending east, the gale made visible
  strokes(out, counter, {
    rng, n: 900,
    sample: rej(-10, 390, 810, 470, (x, y) => y > hillY(x) && y < hillY(x) + 26),
    dir: () => -0.22, // leaning downwind
    col: (x, y, r) => jig(mix('#2e3a48', '#5d6244', fbm(x / 30, y / 30, 41) + light(x, y) * 0.3), r, 8),
    len: (x, y) => 11 * lengthOf(x, y, 71), lw: (x, y) => 1.3 * widthOf(x, y, 73), steps: 2, wild: 0.06, lenJ: 0.3, wJ: 0.3, relief: 0.3,
  });

  /* ---------------- BACKGROUND LIFE (Matt 6:26; Isa 55:12) ---------------- */
  for (const [bx, by, s] of [[300, 130, 1], [340, 144, 0.85], [560, 112, 0.8]]) {
    paintPath(out, counter, rng, [[bx - 6 * s, by + 2.6 * s], [bx, by - 1.8 * s], [bx + 6 * s, by + 2.6 * s]], (x, y, r) => jig('#26304e', r, 6), { lw: 1.5 * s, len: 3.4, density: 0.9, jitter: 0.5 });
  }
  const bush04 = (bx, by, w, h) => strokes(out, counter, { rng, n: Math.round(w * 1.5), sample: r => { const a = r() * Math.PI * 2, dd = Math.pow(r(), 0.7); return [bx + Math.cos(a) * w * dd, by - Math.abs(Math.sin(a)) * h * dd]; }, dir: (x, y) => -Math.PI / 2 + 0.3 + (fbm(x / 10, y / 10, 259) - 0.5) * 1.0, col: (x, y, r) => jig(ramp(['#1c3026', '#284432', '#365840'], fbm(x / 12, y / 12, 261) + r() * 0.25), r, 8), len: 6, lw: 2, steps: 2, lenJ: 0.5 });
  bush04(450, 460, 14, 10); bush04(620, 468, 13, 9); bush04(330, 476, 12, 8);
  const cyp04 = (cx, cby, ch, w) => strokes(out, counter, { rng, n: Math.round(w * ch / 12), sample: r => { const v = Math.pow(r(), 0.85); const wr = w * Math.sin(Math.PI * Math.min(1, v * 1.15)) + 0.7; return [cx + (r() + r() - 1) * wr + v * 8, cby - v * ch]; }, dir: (x, y) => -Math.PI / 2 + 0.2 + (fbm(x / 8, y / 8, 247) - 0.5) * 0.6, col: (x, y, r) => jig(ramp(['#142420', '#1d3424', '#284430'], fbm(x / 10, y / 10, 251) + r() * 0.3), r, 7), len: 9, lw: 2.2, steps: 3, follow: 0.95, lenJ: 0.5 });
  cyp04(688, 448, 28, 5);
  // wind-combed grass FRINGE along the hill crest so the sky↔hill seam reads
  // organic, not a ruled line (MID)
  // DISTANT HILLS on their own FAR plane — the rolling skyline parallaxes against
  // both the gale sky and the hill, so the horizon has real moving depth.
  const _far = out.length;
  E.distantHills(out, counter, rng, { topFn: E.ridge(hillY, { amp: 22, freq: 220, bumps: 0.45, seed: 44 }), horizonFn: hillY, cols: ['#41597a', '#4e6470', '#5d6e58'], depth: 56, lightFn: light, seed: 44 });
  farRanges.push([_far, out.length]);
  E.horizonFringe(out, counter, rng, { horizonFn: hillY, x0: -10, x1: 810, cols: ['#243250', '#3a4a52', '#2e3a48', '#5d6244'], hMax: 18, lightFn: light, seed: 404, dirJitter: 0.4 });

  /* ---------------- 5. THE STRING ----------------  [FG plane — string + child + hand, one connected system] */
  const _fgSys = out.length;
  // One unbroken arc from the LIGHT'S HAND below up to the drifting child.
  // The child IS the balloon now — carried far on the gale — and the Light
  // holds the string and never lets go. The thread blazes its whole length.
  const HAND = [202, 420];     // the Light's grip, lower-left
  const CHILD = [340, 112];    // the child, adrift high in the storm — INSIDE the portrait
  // window (64..376). At 600 the phone showed a hand holding a string that ran
  // off-screen to NOBODY; the child is the whole point of the page (Ecc 4? no —
  // the string never snaps). Desktop loses a little sweep; the phone gains the story.
  // ⚠ THE STRING ENDS WHERE HE TURNS. Fred: "can you put the end of the string on the
  // back of the character's back as the axis of rotation?" It tied at his shoulders while
  // he span about his mid-back (CAST1[8] `tie`), so the line's end and the pivot were 12px
  // apart and he looked hooked to nothing. Same point now — move one, move the other.
  const TIE = [336, 130];      // ties at the small of his back — the axis he turns on — derived from CHILD, and it must move WITH him (it didn't: the child moved into the window and the string kept flying to the old empty sky)
  const C1 = [322, 414], C2 = [368, 186]; // the wind bellies the string RIGHT but the whole bow stays INSIDE the window: a bezier never leaves its control hull, so every control x must be < 376 (the first try put them at 430/468 and the string left the phone's frame twice)
  const str = t => {
    const u = 1 - t;
    return [
      u * u * u * HAND[0] + 3 * u * u * t * C1[0] + 3 * u * t * t * C2[0] + t * t * t * TIE[0],
      u * u * u * HAND[1] + 3 * u * u * t * C1[1] + 3 * u * t * t * C2[1] + t * t * t * TIE[1],
    ];
  };
  {
    const pts = [];
    for (let t = 0; t <= 1.001; t += 0.02) {
      const p = str(t);
      const [c, d] = curlV(p[0], p[1], 13, 120);
      pts.push([p[0] + c * 5 * (1 - t), p[1] + d * 5 * (1 - t)]);   // wind fades to 0 at the tie, so the tip lands exactly on the body
    }
    paintPath(out, counter, rng, pts, (x, y, r) => jig('#171f40', r, 5), { lw: 3.6, len: 7, density: 1.2, jitter: 0.8 });
    paintPath(out, counter, rng, pts, (x, y, r) => jig(ramp([GOLD_HOT, '#ffcf3a', '#f0b22e'], r() * 0.8), r, 5), { lw: 2.4, len: 6, density: 1.15, jitter: 0.4 });
  }
  // ⚠ THE CORD IS DE-BAKED. It is the one thing on this page that must END ON A MOVING
  // BODY — the child rides the whip and tumbles on his tether, and a painted cord can
  // only ever reach where he WAS. So it is drawn at runtime instead (drawTether in
  // engine/character.js), from this same hand and these same control points, with its
  // tip following him. Kept here, still painted, because the FULL desktop plate and the
  // contact sheet want the whole picture; it is simply excluded from every depth band.
  const cordRanges = [[_fgSys, out.length]];

  /* ---------------- 6. THE CHILD — adrift, like a balloon ---------------- */
  // carried far up into the gale, small and red, limbs flung by the wind —
  // but tied to the string that does not break
  {
    const [cx, cy] = CHILD;
    // STANDING cute child (personCaps), small + wistful, looking UP, holding the
    // string's upper end in one RAISED hand at the string tip (cx,cy). The other
    // hand rests low. h≈50; raised right hand grips the string, head tilted up.
    // the child IS the balloon: the string ties to his TORSO (waist), and he
    // floats above it, limbs flung loose by the gale — not gripping anything.
    const ch = 46, topY = cy - 6;             // moved DOWN so the string ties at the shoulders/upper back, head just above
    // the little pilgrim adrift on the gale — arms flung loose, hem streaming,
    // feet dangling in the open air (no ground here at all), carried by the string
    E.paintMask(out, counter, rng, {
      x: cx - 2, y: topY + ch, h: ch, facing: 1,
      wind: 1, lift: 0.8, stride: 0.4, shadow: 0,
      armL: [cx - 23, topY + ch * 0.30], armR: [cx + 21, topY + ch * 0.24],
      eye: [0.4, -1], mood: 'wary',
    });
    // ⚠ NO PAINTED KNOT. Fred: "there can be moments like this where the string is not
    // attached to the kid." The knot was a red dot painted HERE, in the fg plane — but
    // the child and the cord are runtime sprites in the ACTOR layer, and the two layers
    // carry different parallax. So the dot could never line up with him at every angle;
    // it drifted out from under his body and read as the string coming untied. It cannot
    // be aimed, only removed. The cord's own tip ends on his rotation axis and does the
    // job the dot was there for.
    // (the pilgrim's own lit band reads against the gale)
  }

  /* ---------------- 7. THE LIGHT'S HAND — it holds the string ---------------- */
  // a radiant hand reaching up from below, gripping the string. The Light
  // does not drift; it holds on. It glows — it IS the light of the plate.
  {
    const [hx, hy] = HAND;
    strokes(out, counter, {   // halo of light around the grip
      rng, n: 110,
      sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 0.85) * 46; return [hx + Math.cos(a) * d, hy + 12 + Math.sin(a) * d * 0.9]; },
      dir: () => 0.1,
      col: (x, y, r) => jig(ramp([GOLD_PALE, GOLD, GOLD_DEEP, '#8a5a30'], Math.hypot(x - hx, (y - hy - 12) / 0.9) / 46), r, 9),
      len: 8, lw: 2.4, steps: 2, impasto: 0.4,
    });
    const hdCaps = [
      { ax: hx - 4, ay: hy + 46, bx: hx - 1, by: hy + 8, r: 8 },    // forearm rising from below
      { ax: hx - 2, ay: hy + 8, bx: hx + 8, by: hy - 2, r: 9 },     // palm / fist
      { ax: hx + 4, ay: hy - 4, bx: hx - 4, by: hy - 13, r: 3 },    // finger curled over the string
      { ax: hx + 7, ay: hy - 2, bx: hx + 1, by: hy - 13, r: 3 },    // finger
      { ax: hx + 9, ay: hy + 1, bx: hx + 6, by: hy - 10, r: 2.8 },  // finger
      { ax: hx - 6, ay: hy + 2, bx: hx - 13, by: hy - 5, r: 3 },    // thumb pinning the string
    ];
    underpaintCapsules(out, counter, hdCaps, '#8a6a2e');
    paintFigure(out, counter, rng, hdCaps, (x, y, r) => jig(ramp([GOLD_HOT, GOLD_PALE, GOLD, '#d49a44'], fbm(x / 12, y / 12, 57) * 0.5 + (y - (hy - 12)) / 70), r, 8), 2.0);
    strokes(out, counter, {   // rays streaming off the hand
      rng, n: 50,
      sample: r => { const a = r() * Math.PI * 2, d = (0.6 + 0.5 * r()) * 40; return [hx + Math.cos(a) * d, hy + 8 + Math.sin(a) * d * 0.85]; },
      dir: (x, y) => Math.atan2(y - (hy + 8), x - hx),
      col: (x, y, r) => jig(mix(GOLD_HOT, GOLD_PALE, r()), r, 7), len: 8, lw: 1.4, steps: 2,
    });
  }
  fgRanges.push([cordRanges[0][1], out.length]);   // ← the holding hand (the cord is de-baked; the child is a runtime sprite)

  // FRUITFUL hill — the land bears fruit in crazy free colour (Isa 35:1),
  // off to the right where the radiant hand does not crowd it  [FG plane]
  // fruit-trees PLANTED on the hill (MID) — base stays with the ground on the pan
  E.fruitTree(out, counter, rng, 600, 470, 58, 27, E.LEAF_PALETTES[3], light, 1, { species: 'fig' });    // "every man under his vine and under his fig tree" (1 Kings 4:25)
  E.fruitTree(out, counter, rng, 732, 478, 54, 25, E.LEAF_PALETTES[1], light, 1, { species: 'olive' });

  /* ---------------- LIFE: THE FLOCK GONE ASTRAY (Isa 53:6) ----------------
     "All we like sheep have gone astray; we have turned every one to his own
     way" — the page quotes it, so the sheep are HERE: pale wool silhouettes
     scattered across the dark hill, each one turned its own way, none looking
     at the hand that holds. (MID — they graze the hill they stand on.) */
  const sheep = (sx, sy, s, face) => {
    strokes(out, counter, {   // the wool — one bold pale blob of curled strokes (living = curved)
      rng, n: Math.round(30 * s),
      sample: r => { const a = r() * Math.PI * 2, d = Math.sqrt(r()); return [sx + Math.cos(a) * 11 * s * d, sy - 5 * s + Math.sin(a) * 6 * s * d]; },
      dir: (x, y) => Math.atan2(y - (sy - 5 * s), x - sx) + Math.PI / 2 + 0.5,
      col: (x, y, r) => jig(mix('#c2bda0', '#7e7b63', fbm(x / 8, y / 8, 91) * 0.5 + ((y - (sy - 11 * s)) / (13 * s)) * 0.5), r, 6),
      len: 4.5 * s, lw: 2.3 * s, steps: 2, follow: 0.9, lenJ: 0.4,
    });
    // the dark head dipped to its own patch of grass — half against the wool so it reads
    paintPath(out, counter, rng, [[sx + face * 7 * s, sy - 6 * s], [sx + face * 11.5 * s, sy - 3.5 * s], [sx + face * 13 * s, sy + 0.5 * s]],
      (x, y, r) => jig('#141b32', r, 6), { lw: 3.2 * s, len: 3.2, density: 1.15, jitter: 0.4 });
    for (const lx of [-6.5, -2.5, 2.5, 6.5])   // legs planted in the dark grass
      paintPath(out, counter, rng, [[sx + lx * s, sy - s], [sx + lx * s + face, sy + 6 * s]],
        (x, y, r) => jig('#10162a', r, 5), { lw: 1.5 * s, len: 3, density: 1.1, jitter: 0.35 });
  };
  sheep(98, 414, 0.75, -1);   // far on the crest, drifting west
  sheep(115, 456, 1.05, 1);   // just past the hand's reach, facing away east
  sheep(300, 430, 0.85, 1);
  sheep(355, 463, 1.2, -1);   // near, turned back on the light
  sheep(505, 444, 0.9, -1);
  sheep(548, 483, 1.35, 1);   // nearest, wandering off its own way

  /* ---------------- LIFE: MOTHS TO THE LIGHT ----------------
     a few pale moths drifting in toward the radiant hand — the small things
     already know where the light is. (FG — they fly in the hand's plane.) */
  const _moths = out.length;
  const moth = (mx, my, s) => {
    const a = Math.atan2(HAND[1] - my, HAND[0] - mx);   // headed for the hand
    for (const w of [-1, 1]) {   // two swept-back curved wings (living = curved)
      const wx = mx + Math.cos(a + w * 2.0) * 5.5 * s, wy = my + Math.sin(a + w * 2.0) * 4.2 * s;
      paintPath(out, counter, rng,
        [[mx + Math.cos(a) * 1.5 * s, my + Math.sin(a) * 1.5 * s], [(mx + wx) / 2 + Math.cos(a) * 2.2 * s, (my + wy) / 2 + Math.sin(a) * 2.2 * s], [wx, wy]],
        (x, y, r) => jig(mix(GOLD_PALE, '#efe6c0', r() * 0.6), r, 7), { lw: 1.7 * s, len: 3, density: 1.15, jitter: 0.45 });
    }
    out.push(`<circle cx="${R1(mx)}" cy="${R1(my)}" r="${(1.2 * s).toFixed(1)}" fill="#e8c060"/>`); counter.n++;
  };
  moth(148, 364, 1.3);
  moth(186, 334, 1.5);
  moth(247, 380, 1.15);
  fgRanges.push([_moths, out.length]);

  // (the verse for this page is the COUNTED FLOCK above — 31 maroon + 3 green birds
  //  = Jeremiah 31:3 — not a written number; see section 3.)

  // MULTIPLANE: assemble the requested depth plane. Each is its own cel —
  // transparent where it has no content — so they stack and parallax apart.
  const ALT = 'A churning daytime sky over a low hill; a small red child is carried far up into the wind like a balloon, tied to one unbroken string that arcs down to a radiant golden hand reaching from below — the Light holding the string fast, never letting go.';
  const RAW = { undercoat: 0, weave: 0, varnish: 0, oil: 0 };   // no baked surface — the live filter unifies the planes
  const setOf = ranges => { const s = new Set(); for (const [a, b] of ranges) for (let i = a; i < b; i++) s.add(i); return s; };
  const pick = ranges => ranges.map(([a, b]) => out.slice(a, b).join('\n')).join('\n');
  const farSet = setOf(farRanges), fgSet = setOf(fgRanges), birdSet = setOf(birdRanges), cordSet = setOf(cordRanges);
  if (LAYER === 'sky') return svgWrap(ALT, out.slice(0, skyEnd).join('\n'), RAW);   // smooth gale-sky ground (opaque backmost)
  const sm = LAYER.match(/^sky(\d+)$/);
  if (sm) return svgWrap(ALT, '<g>' + skySheets[+sm[1] - 1] + '</g>', RAW);         // one sky-swirl sheet
  if (LAYER === 'far') return svgWrap(ALT, pick(farRanges), RAW);                   // distant rolling hills
  if (LAYER === 'fg') return svgWrap(ALT, pick(fgRanges), RAW);                     // the hand→string→child system
  if (LAYER === 'birds') return svgWrap(ALT, pick(birdRanges), RAW);                // the counted flock
  if (LAYER === 'mid') {                                                            // hill, grass, birds, bushes, fringe, planted trees
    const body = out.filter((_, i) => i >= skyEnd && !farSet.has(i) && !fgSet.has(i) && !birdSet.has(i) && !cordSet.has(i)).join('\n');
    return svgWrap(ALT, body, RAW);
  }
  // full painting (desktop): sky ground, the stacked sky-sheets, then everything else
  return svgWrap(ALT, out.slice(0, skyEnd).concat(skySheets, out.slice(skyEnd)).join('\n'));
}
