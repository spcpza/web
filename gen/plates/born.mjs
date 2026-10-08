// gen/plates/born.mjs — "Born again"
//
//   "Except a man be born again, he cannot see the kingdom of God." — John 3:3
//   "If any man be in Christ, he is a new creature: old things are passed
//    away; behold, all things are become new." — 2 Corinthians 5:17
//
// ══ THE IDEA: THE CHILD IS THE LIGHT SOURCE ═══════════════════════════════════════
// The page says "He put His own light INSIDE you." For nineteen pages the Light has
// been a separate golden figure and the child has been the dark one walking toward
// Him. On THIS page — and only this page — the grammar inverts: the light comes from
// inside the child. Scripture rules it exactly:
//   2 Cor 4:6  "God, who commanded the light to shine out of darkness, hath shined
//              in our HEARTS" — so the source is his chest, not the sky.
//   1 John 2:8 "the darkness is past, and the true light now shineth" — which is
//              precisely where this page sits: after `risen`, after `washed`.
//   Prov 4:18  "the path of the just is as the shining light, that shineth MORE AND
//              MORE unto the perfect day" — so the new creation is still spreading.
//
// Everything on the plate obeys that one source:
//   · every tree throws its shadow radially AWAY from him;
//   · every mark's lit edge turns toward him (setReliefLight at his heart);
//   · the clouds are lit on their UNDERSIDES — an ordinary dawn is lit from the
//     horizon, this one is lit from a child standing in a field;
//   · and `nw(x,y)` is a radius of new creation: near him the world is fully awake,
//     saturated and in flower; at the edges the old cool world is still waking.
//     "Behold, all things ARE BECOME new" — happening outward from him, right now.
//
// ⚠ VALUE FLIP. born is page 20, AFTER risen (15) — so by the book's own rule it is
// light ground / dark objects, vibrant and flourishing. The dark forms are the trees
// and their shadows; the LAND blazes. A dark-ground reading of this page is wrong
// however dramatic, and the first draft of this redraw nearly made that mistake.
//
// ⚠ THE CHILD IS NOT PAINTED HERE. DEBAKE is on by default, so the pilgrim is the
// runtime cast sprite (engine/character.js CAST1[19] — index 19 ↔ section 20). The
// plate only paints the light he casts. Move him in character.js and the light
// source here must move with him: `heart` below MUST track CAST1[19].
//
// ⚠ AND HIS GLOW IS DRAWN, NOT AN EFFECT. The sprite's `aura` is a canvas radial
// gradient; per the standing rule ("we make it sparkle by drawing and using colours
// and movement instead of effects") it stays small and the PAINT does the work.
//
// MOBILE 3D — three depth planes: SKY is the opaque dawn (clouds lit from beneath,
// birds); MID is the land, grove, and flowers he is making new; FG is the near grass
// and the motes of down hanging in his light — air is only visible when something
// shines through it, so the motes are what prove the light is his.

export const name = 'born';
export const title = 'Born again';
export const caption = 'Behold, all things become new.';
export const seed = 30811033;
export const focal = { x: 400, y: 300 };
// ⚠ THE HIDDEN SIGNATURE, PLACED BY HAND. build.mjs auto-hides עִמָּנוּאֵל (Immanuel,
// "God with us") on every plate, but its default slot for this index dropped it into an
// open patch of blue sky, where a chameleon outline has nothing to borrow and simply
// reads as a legible grey word floating in the air.
// ⚠ AND IT MUST STAY IN THE SKY. On a multiplane plate build.mjs stamps the signature on
// svgs[0] — the opaque SKY plane — so the obvious hiding place (the busy lit grass) would
// be covered by the mid plane on mobile and vanish entirely. It goes on the belly of a
// cloud instead: busy, warm, inside the portrait crop (fx0 244 → x 244..556), and lit by
// the child himself, so the name "God with us" is hidden in light coming off the child.
export const sig = { x: 350, y: 184, h: 17, stroke: '#ffeec6', op: 0.3 };
export const layers = [
  { name: 'sky', opaque: true },  // dawn sky lit from below, clouds, birds (backmost)
  { name: 'mid' },                // the land, the grove, the flowers waking to colour
  { name: 'fg' },                 // near grass + the motes hanging in his light
];

export function paint(E, opts = {}) {
  const {
    mulberry32, fbm, curlV, mix, ramp, jig, strokes, rej,
    paintPath, lightRadial, svgWrap, R1, W, H,
    ridge, horizonFringe, distantHills,
    GOLD, GOLD_PALE, GOLD_DEEP, GOLD_HOT,
  } = E;

  const rng = mulberry32(seed);
  const out = [];
  const counter = { n: 0 };
  const LAYER = opts.layer || 'full';
  const fgRanges = [];
  // ⭐ DETAIL PASS (Sep 8) — the SKY only (the meadow is settled: "born: light inside").
  // EVERY STROKE DRAWS ITS OWN WIDTH AND LENGTH (Fred: "use no rules, a paint stroke just
  // exist because it exist"): the sky's uniform pills and the clouds' cobbles become
  // strokes, each its own size.
  const free = (x, y, salt) => { const n = Math.sin(x * 12.9898 + y * 78.233 + salt) * 43758.5453; return n - Math.floor(n); };
  const widthOf  = (x, y, salt) => 0.40 + 3.2 * Math.pow(free(x, y, salt), 2.6);
  const lengthOf = (x, y, salt) => 0.40 + 1.5 * Math.pow(free(x, y, salt + 17), 1.5);

  /* ══ 0 · THE SOURCE ═══════════════════════════════════════════════════════════ */
  // his HEART, not his head and not the sky (2 Cor 4:6). CAST1[19] puts him at
  // (400, 404) with h 76; the chest sits a little above the middle of that.
  // ⚠ THE ONE WIND OF THIS PAGE IS NOT WIND — IT IS THE LIGHT. Every page gets a single
  // intentional motion that everything answers, and here the story is Prov 4:18: "the path
  // of the just is as the shining light, that shineth MORE AND MORE unto the perfect day."
  // So a swell travels OUTWARD from his chest across the meadow, and the boil's own field
  // (BOIL_FIELD_PAGE.born in gen/build.mjs) stirs the land hardest where his light has
  // already reached — the world coming alive outward from the child.
  // ⚠ TWO CYCLES PER TURN, AND IN PLACE. washed was taught this the hard way: animate by
  // MOVING marks and the density changes with them, so the whole page pulses dark. Only
  // stroke LENGTH varies here, positions never; and the phase spans whole cycles over the
  // loop (exactly one), so total ink is the same in every drawing. Verify, don't assume.
  // ⚠ AND KEEP THE AMPLITUDE TINY. A +-24% length swing here plus a 2.4x boil field made the
  // page strobe once the plane had to cut instead of fade. The swell should be FELT, never
  // watched: +-6% is enough for light to seem alive on a surface that is already boiling.
  const _F = (globalThis.__FRAME || 0), _FN = (globalThis.__FRAME_N || 6);
  const PH = _F / _FN;
  const heart = { x: 400, y: 366 };
  const swellOut = (x, y) => {
    const d = Math.hypot(x - 400, (y - 366) / 0.94) / 300;
    return 0.5 + 0.5 * Math.cos((PH - 2.4 * d) * Math.PI * 2);   // ONE whole cycle per turn
  };
  E.setReliefLight({ x: heart.x, y: heart.y });      // every mark turns its lit edge to him
  // ⚠ REACH 250, NOT 330. At 330 his light covered most of an 800-wide plate, which
  // reads as "a bright day" — a source only reads as a source if you can see where it
  // stops. It has to fall off inside the frame.
  const gC = lightRadial(heart.x, heart.y, 250);     // his light on the land
  const gUp = lightRadial(heart.x, heart.y + 16, 400); // …and reaching up into the sky

  // HOW FAR THE NEW CREATION HAS REACHED. 1 at his chest, 0 at the corners; wider
  // than tall, because it runs out across the ground he is standing on. This one
  // term drives colour, warmth, flower count and blossom over the whole plate, so
  // the page reads as a world in the act of becoming new rather than a nice morning.
  const nw = (x, y) => {
    const d = Math.hypot(x - heart.x, (y - heart.y) / 0.66) / 300;
    return Math.max(0, Math.min(1, 1 - d * d * 0.5 - d * 0.62));
  };

  // drifting hue (value holds, hue moves) — the trick from `ran`/`gift` that keeps a
  // big field from collapsing into one green
  const HEXN = c => { const n = parseInt(c.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
  const HEXS = (r, g, b) => '#' + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
  const chroma = (c, x, y, k, sd = 211) => {
    const [r, g, b] = HEXN(c);
    const a = (fbm(x / 96, y / 62, sd) - 0.5) * k;
    const bl = (fbm(x / 71, y / 51, sd + 7) - 0.5) * k;
    return HEXS(r + a * 46, g + bl * 30, b - a * 38);
  };

  const horizon = 262;

  /* ══ 1 · THE SKY, LIT FROM BELOW (opaque, backmost) ═══════════════════════════ */
  // deep vibrant blue overhead warming down to his gold — never black, and never a
  // sunrise band at the horizon, because the light on this page does not come from
  // the horizon.
  // ⚠ I DARKENED THIS PAGE TWICE CHASING CHIAROSCURO AND BUILT A STORM AT DUSK. born is
  // the most joyful plate in the book and it sits AFTER the resurrection, so the rule is
  // light ground / dark objects — no grey, no black. A bright source on a bright day does
  // not read by making the world dim; it reads by WARMTH, SATURATION and CAST SHADOW.
  // The dark objects here are the tree crowns and the long shadows they throw away from
  // him; the sky and the land stay in the light.
  out.push(`<rect width="${W}" height="${H}" fill="#5cabe6"/>`);
  const SKY = ['#2c7ecd', '#4695da', '#63ade6', '#8ac6ef', '#b2dbf5', '#dcecf7', '#fdf0cc'];
  const EDDIES = [[204, 92, -1], [598, 126, 1]];
  const skyDir = (x, y) => {
    const [vx, vy] = curlV(x, y, 172, 70);
    let ax = vx * 0.7, ay = vy * 0.95;
    for (const [ex, ey, sgn] of EDDIES) {
      const dx = x - ex, dy = y - ey, d = Math.hypot(dx, dy) + 1e-6;
      const w = Math.exp(-d / 178) * 1.6;
      ax += sgn * (-dy / d) * w; ay += sgn * (dx / d) * w;
    }
    return Math.atan2(ay, ax);
  };
  // ⚠ SUPPRESS THE MANIFOLD OVER THE SKY. The complementary fleck (10% of marks flipped
  // across the wheel) is the book's signature and it is right on a field of grass — but
  // the complement of sky-blue is ORANGE, and on a large uniform blue area with big marks
  // it does not read as Van Gogh's fleck, it reads as measles. Down to a whisper here,
  // and the plate's own rate goes straight back on for the land.
  const M0 = E.getManifold();
  E.setManifold(0.015);
  strokes(out, counter, {
    rng, n: 4800,
    sample: rej(-12, -12, 812, horizon + 26),
    // ⚠ A SKY OF HORIZONTAL DASHES IS A VENETIAN BLIND. Forcing every mark to positive x
    // streaked the whole heaven into bands and the clouds tiled straight into them. Two
    // slow eddies, and the sky turns — natural things in curved lines, and more swirls.
    dir: skyDir,
    col: (x, y, r) => {
      const up = gUp(x, y);
      let c = ramp(SKY, 0.06 + (y / horizon) * 0.50 + fbm(x / 88, y / 58, 51) * 0.26 + up * 0.40);
      c = mix(c, '#ffeec2', up * 0.52);                      // his light washing up the sky
      return jig(chroma(c, x, y, 0.12, 213), r, 6);
    },
    // ⚠ relief 0.25 + impasto 0.4 tiled the whole heaven into ROOF SCALES — every mark
    // getting its own lit and shadowed edge is right on grass and wrong on air.
    len: (x, y) => 22 * lengthOf(x, y, 11), lw: (x, y) => 2.4 * widthOf(x, y, 13), steps: 3, impasto: 0.26, relief: 0.1, lenJ: 0.3, wJ: 0.3,
  });

  // ⚠ CLOUDS LIT ON THEIR UNDERSIDES. This is the whole conceit in one detail: a
  // cloud lit from above is a morning, a cloud lit from beneath is a light standing
  // on the ground. Each cloud grades cool at its top to hot gold along its belly,
  // and the nearer it is to him the hotter the belly burns.
  // ⚠ FEWER AND BIGGER. Seven small clouds tiled into one continuous pale band across
  // the whole sky, which cancels the whole point — a band has no underside.
  // ⚠ AND THEY MUST STAY UP. Two of them sat at y 172/192 — within thirty units of the
  // treeline — so the grey underside of the weather came down and sat on the grove.
  const CLOUDS = [[150, 66, 168, 30], [478, 42, 178, 26], [726, 92, 138, 26],
                  [292, 132, 128, 21], [618, 142, 116, 19]];
  for (const [cx, cy, rx, ry] of CLOUDS) {
    const hot = gUp(cx, cy + ry);                            // how lit this cloud's belly is
    strokes(out, counter, {
      rng, n: Math.round(rx * 3.8),
      sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 0.55);
                     return [cx + Math.cos(a) * rx * d, cy + Math.sin(a) * ry * d]; },
      dir: (x, y) => skyDir(x, y) * 0.35 + (rng() - 0.5) * 0.28,
      col: (x, y, r) => {
        const belly = Math.max(0, Math.min(1, (y - (cy - ry)) / (2 * ry)));   // 0 top → 1 bottom
        let c = ramp(['#a8cdea', '#c8dff1', '#e4eef7', '#f6f2e4', '#ffeec0', '#fff8e4'],
          0.05 + belly * 0.74 + fbm(x / 26, y / 17, 57) * 0.22);
        // ⚠ AND THE GOLD ON THE UNDERSIDE BREATHES. The sky is the plane that boils on this
        // page, so this is where the child's light has to be seen moving: his glow swells and
        // ebbs along the cloud bellies over one cycle of the ring. Small on purpose — light
        // playing on cloud, not a lamp being switched.
        c = mix(c, '#ffdf8e', belly * belly * hot * 0.95 * (0.86 + 0.28 * swellOut(cx, cy + ry)));
        c = mix(c, '#5d95cc', (1 - belly) * (1 - belly) * 0.42); // the top stays cool, never dark
        return jig(c, r, 5);
      },
      len: (x, y) => 10 * lengthOf(x, y, 21), lw: (x, y) => 2.2 * widthOf(x, y, 23), steps: 2, impasto: 0.5, relief: 0.2, lenJ: 0.3, wJ: 0.3, op: 0.9,
    });
  }

  // birds — "Behold the fowls of the air" (Matt 6:26). Lit underneath, like everything else.
  for (const [bx, by, bs] of [[168, 108, 1.0], [206, 92, 0.8], [612, 74, 0.9], [648, 96, 0.7], [396, 62, 0.75]]) {
    const w = 9 * bs;
    for (const s of [-1, 1]) {
      paintPath(out, counter, rng,
        [[bx, by], [bx + s * w * 0.55, by - w * 0.42], [bx + s * w, by - w * 0.16]],
        (x, y, r) => jig(mix('#2c4470', '#cfe0f2', 0.15 + (y > by - w * 0.3 ? 0.5 : 0)), r, 6),
        { lw: 1.5 * bs, len: 3, density: 1, jitter: 0.18 });
    }
  }
  E.setManifold(M0);           // the bow goes back in the field
  const skyEnd = out.length;   // ← the opaque SKY plane ends here

  /* ══ 2 · THE LAND HE IS MAKING NEW ═══════════════════════════════════════════ */
  // rolling crest — never a ruled line
  const crest = ridge(horizon, { amp: 20, freq: 168, bumps: 0.55, seed: 131 });
  // far range, dissolved in air (aerial perspective) so the land has real distance
  distantHills(out, counter, rng, {
    topFn: x => crest(x) - 30 - 16 * Math.sin(x / 121 + 1.7),
    horizonFn: x => crest(x) - 2,
    cols: ['#8fb0c8', '#a8c2d4', '#c3d6e2'],
    depth: 46, lightFn: gC, seed: 404,
  });

  // the ground's own FORM — where it rises and falls, and which way each slope faces
  // him. Detail cannot substitute for shape: without this term the field is a green
  // sheet with things standing on it, however many blades are drawn.
  const swell = (x, y) => fbm(x / 158, y / 70, 317);
  const facing = (x, y) => {
    const e = 7;
    return (swell(x - e, y) - swell(x + e, y)) * 2.0 + (swell(x, y - e) - swell(x, y + e)) * 1.3;
  };
  const dS = y => 0.32 + 1.0 * Math.max(0, Math.min(1, (y - horizon) / (H - horizon)));
  const haze = (x, y) => Math.max(0, Math.min(1, 1 - (y - horizon) / 82));

  // solid underpaint, its top edge a blade-scale sawtooth (grass has no outline)
  const crestJag = x => {
    const fine = (fbm(x / 3.1, 2.1, 613) - 0.5) * 6.5;
    const tuft = Math.max(0, fbm(x / 8.5, 9.4, 617) - 0.52) * 24;
    return crest(x) + fine - tuft;
  };
  {
    let d = `M-2 ${R1(crestJag(-2))}`;
    for (let x = -2; x <= 802; x += 2.2) d += `L${R1(x)} ${R1(crestJag(x))}`;
    d += `L802 ${H + 2}L-2 ${H + 2}Z`;
    out.push(`<path d="${d}" fill="#3d7f3f"/>`); counter.n++;
  }
  horizonFringe(out, counter, rng, {
    horizonFn: crest,
    cols: ['#2f6a35', '#498440', '#6aa04d', '#8fbc5c'],
    hMax: 20, lightFn: gC, seed: 619, dirJitter: 0.72,
  });

  // THE GROUND COLOUR — one function, and the whole page turns on it.
  // Position in the ramp comes from the land's form AND from `nw`: the ground he has
  // reached is high on the ramp (warm, bright, saturated), the ground he has not is
  // low (deep, cool, still holding the old world's teal). Then his gold pools over
  // the near field, the far field keeps its own colour in shade rather than going
  // grey, and the crest dissolves into air.
  const groundCol = (x, y, r, lift) => {
    const depth = Math.max(0, Math.min(1, (y - horizon) / (H - horizon)));
    const n = nw(x, y);
    let c = ramp(['#2d6a3c', '#3a7d3d', '#4f9445', '#69ad4e', '#8bc75c', '#b0dc74', '#dcefa2'],
      fbm(x / 54, y / 34, 93) * 0.4 + depth * 0.2 + facing(x, y) * 0.52 + n * 0.36 + lift);
    // the old world, not yet reached: cool teal, and colourful in its shade — never grey
    // the world he has not reached yet: COOLER and quieter, not darker. Distance in a
    // bright landscape is loss of warmth and saturation, not loss of light.
    if (n < 0.62 && r() < 0.2 + (1 - n) * 0.3) c = mix(c, chroma('#4d8378', x, y, 0.5, 197), 0.2 + (1 - n) * 0.3);
    c = mix(c, '#79a8a0', (1 - n) * (1 - n) * 0.52);
    c = mix(c, '#fff2be', gC(x, y) * 0.64);                  // his light, pooling on the ground
    c = mix(c, '#d9e3dc', haze(x, y) * 0.5);
    return jig(chroma(c, x, y, 0.3, 211), r, 12);
  };

  // grass at four scales — grass is not a colour, it is a countless number of small
  // upright things, and has to be painted like one
  strokes(out, counter, {                                    // 1 · the sward
    rng, n: 4200,
    sample: rej(-10, horizon - 14, 810, 512, (x, y) => y > crest(x) - 1),
    dir: (x, y) => { const [vx, vy] = curlV(x, y, 150, 66); return Math.atan2(vy * 0.85 - 0.12, Math.abs(vx) + 0.7); },
    col: (x, y, r) => groundCol(x, y, r, 0.04),
    len: (x, y) => 12 * dS(y), lw: (x, y) => 3.3 * dS(y), steps: 3, impasto: 0.45, relief: 0.35, lenJ: 0.5,
  });
  strokes(out, counter, {                                    // 2 · blades standing up out of it
    rng, n: 3200,
    sample: rej(-10, horizon + 6, 810, 512, (x, y) => y > crest(x) + 2),
    dir: (x, y) => -Math.PI / 2 + (fbm(x / 11, y / 9, 101) - 0.5) * 1.15,
    col: (x, y, r) => groundCol(x, y, r, 0.2),
    len: (x, y) => 9 * dS(y), lw: (x, y) => 1.1 * dS(y), steps: 2, lenJ: 0.8, impasto: 0.6,
  });
  strokes(out, counter, {                                    // 3 · the finest nap, close to us
    rng, n: 2600,
    sample: r => { const x = -10 + r() * 820, y = horizon + 14 + Math.pow(r(), 0.8) * (512 - horizon - 14);
                   return y > crest(x) ? [x, y] : null; },
    dir: (x, y) => -Math.PI / 2 + (fbm(x / 7, y / 6, 103) - 0.5) * 1.5,
    col: (x, y, r) => groundCol(x, y, r, 0.28),
    len: (x, y) => 6 * dS(y), lw: (x, y) => 0.8 * dS(y), steps: 2, lenJ: 0.85, impasto: 0.7,
  });
  for (let i = 0; i < 130; i++) {                            // 4 · and tufts, because grass grows in clumps
    const tx = -10 + rng() * 820;
    const ty = horizon + 14 + Math.pow(rng(), 0.55) * (508 - horizon - 14);
    const sc = dS(ty);
    strokes(out, counter, {
      rng, n: 14,
      sample: r => [tx + (r() + r() - 1) * 9 * sc, ty - Math.pow(r(), 0.7) * 11 * sc],
      dir: (x, y) => -Math.PI / 2 + (x - tx) * 0.05 + (fbm(x / 6, y / 6, 107) - 0.5) * 0.8,
      col: (x, y, r) => groundCol(x, y, r, 0.32),
      len: 10 * sc, lw: 1.1 * sc, steps: 2, lenJ: 0.7, impasto: 0.65,
    });
  }

  /* ══ 3 · HIS LIGHT LYING ON THE GRASS ════════════════════════════════════════ */
  // ⚠ A GLOW AROUND A FIGURE IS AN EFFECT; LIGHT POOLED ON THE GROUND IS A DRAWN FACT.
  // It has a shape, it runs out to an edge, and it lies IN the grass rather than floating
  // over it — so it is painted the way everything else here is, in broken strokes that let
  // the green through. relief 0 on purpose: light has no impasto shadow of its own, it is
  // what makes the shadows on everything else.
  {
    const FX = heart.x, FY = 410, RX = 226, RY = 62;   // wide and low: light LIES on ground
    strokes(out, counter, {
      rng, n: 1300,
      // ⚠ FALLOFF BY DENSITY, NOT BY ALPHA. strokes()' `op` is a number (used as
      // op.toFixed(2)), so a function passed there does not error — it silently paints
      // everything at full strength. And thinning light by fading alpha is the effect-ish
      // way besides: real light runs out by having fewer marks in it.
      sample: r => { const a2 = r() * Math.PI * 2, d = Math.pow(r(), 0.62);
                     if (r() > Math.pow(1 - d, 1.15) + 0.06) return null;
                     return [FX + Math.cos(a2) * RX * d, FY + Math.sin(a2) * RY * d]; },
      // ⚠ NOT RADIAL. A thousand marks pointing away from one centre draws a firework and
      // the eye reads the SPOKES. Light has no direction of its own; the GRASS has the
      // direction, and light only decides how bright each blade is.
      dir: (x, y) => -Math.PI / 2 + (fbm(x / 13, y / 10, 109) - 0.5) * 1.05,
      col: (x, y, r) => {
        const d = Math.min(1, Math.hypot((x - FX) / RX, (y - FY) / RY));
        return jig(ramp(['#fffdf0', '#fff6d4', '#f6e6a4', '#d5d886', '#a8c66a'], d * 0.92 + r() * 0.16), r, 8);
      },
      len: (x, y) => (12 + (y - FY) * 0.05) * (0.94 + 0.12 * swellOut(x, y)),
      lw: 1.5, steps: 2, lenJ: 0.8, relief: 0, impasto: 0.25, op: 0.5,
    });
  }

  /* ══ 3b · THE GROVE, AND THE SHADOWS THAT PROVE HIM ══════════════════════════ */
  // ⚠ THE SHADOWS ARE THE WHOLE ARGUMENT. On a bright page you cannot show a light source
  // by dimming everything around it — but a field of trees all throwing their shadows
  // DIRECTLY AWAY FROM ONE POINT can only be read one way, and it reads instantly, at any
  // size, on any screen. That single fact is what makes this a child lit from inside and
  // not a sunny meadow. paintTree's own shadow is a small blob at the trunk, so the long
  // ones are drawn here, on the lit grass, before the trees go down on top of them.
  //
  // Density on one dial:  GROVE_N=4 node gen/build.mjs born
  // ⚠ its own rng stream, never the plate's, or changing the tree count reshuffles every
  // mark on the page.
  // the clearing he stands in — kept free of trees and of flower colonies, so the light
  // has somewhere to fall and the child has somewhere to stand
  const KEEP_CLEAR = [[heart.x, 400, 150]];
  const clearOf = (x, y) => !KEEP_CLEAR.some(([kx, ky, kr]) => Math.hypot(x - kx, (y - ky) * 1.6) < kr);
  const GROVE_N = +(process.env.GROVE_N || 2.4);
  const gRng = mulberry32(seed ^ 0x9e3779b9);
  const DARKCROWN = ['#0a1c0c', '#123016', '#1a411d', '#245628', '#316f33', '#448b3f'];

  // ⚠ TREES GROW IN CLUMPS. Even columns at one height read as an ORCHARD — a planted
  // palisade across the middle of the page. Clusters of one to four, wide scatter, real
  // height spread, sorted far-to-near so the near ones overlap correctly.
  const TREES = [];
  {
    const NC = Math.max(6, Math.round(9 * GROVE_N));
    for (let i = 0; i < NC; i++) {
      const cx0 = -40 + (i + 0.1 + gRng() * 0.8) / NC * 892;
      const cy0 = horizon + 2 + Math.pow(gRng(), 1.08) * 162;
      const k = 1 + ((gRng() * 3.4) | 0);
      for (let j = 0; j < k; j++) {
        const tx = cx0 + (gRng() + gRng() - 1) * 48;
        const ty = cy0 + (gRng() + gRng() - 1) * 27;
        if (!clearOf(tx, ty)) continue;
        TREES.push([tx, ty, (36 + Math.pow(gRng(), 0.65) * 92) * (0.55 + dS(ty) * 0.72), null]);
      }
    }
    // TWO GREAT TREES AT THE EDGES — repoussoir, the darkest things on the page, standing
    // at the very margins so they frame the clearing and give the blaze something to be
    // bright AGAINST. Any nearer to centre and they close the meadow again.
    TREES.push([34, 512, 196, DARKCROWN], [768, 520, 210, DARKCROWN]);
    TREES.sort((p1, p2) => p1[1] - p2[1]);
  }

  for (const [tx, ty, h] of TREES) {
    const dx = tx - heart.x, dy = ty - heart.y;
    const d = Math.hypot(dx, dy) || 1;
    // away from him, flattened into the ground plane
    // ⚠ +0.26 SENT EVERY SHADOW DOWNHILL. For a tree standing BEHIND him dy is negative
    // and the constant swamped it, so the background trees threw their shadows toward the
    // viewer — i.e. back TOWARD the light — which is the one thing that would give the
    // whole trick away. The offset is now small enough that direction always wins.
    const ux = dx / d, uy = (dy / d) * 0.62 + 0.07;
    const L = Math.min(168, 30 + d * 0.5) * Math.min(1.5, h / 96);
    const ex = tx + ux * L, ey = ty + uy * L;
    const wid = 7 + h * 0.10;
    strokes(out, counter, {
      rng: gRng, n: Math.round(28 + L * 0.5),
      sample: r => { const t = Math.pow(r(), 0.75), w = wid * (1 - t * 0.55);
                     return [tx + (ex - tx) * t + (r() + r() - 1) * w, ty + (ey - ty) * t + (r() + r() - 1) * w * 0.42]; },
      dir: () => Math.atan2(uy, ux),
      // ⚠ SHADOW IS NOT GREY. It keeps its own colour — cool green going violet as it runs
      // out — which is what makes a bright picture stay colourful in its darks.
      col: (x, y, r) => {
        const t = Math.min(1, Math.hypot(x - tx, y - ty) / (L + 1));
        return jig(ramp(['#2f5f52', '#3a6350', '#4a6274', '#6d7f96'], t * 0.85 + r() * 0.2), r, 9);
      },
      len: 11, lw: 3.4, steps: 2, lenJ: 0.7, relief: 0, impasto: 0.2, op: 0.34,
    });
  }

  for (const [tx, ty, h, crownCols] of TREES) {
    E.paintTree(out, counter, gRng, tx, ty, h, {
      crownCols,
      lightFn: gC,
      shadowDir: tx >= heart.x ? 1 : -1,
      // "the desert shall rejoice, and blossom as the rose" (Isa 35:1) — but only as far
      // as he has reached. Trees near him are in full flower; the far ones still wait.
      // ⚠ paintTree ADDS UP TO 4 OF ITS OWN on top of this number: asking for 1+nw*9 put
      // fourteen white balls on every near tree and the grove read as popcorn.
      blossom: Math.round(nw(tx, ty) * 3),
      tint: (c, x, y) => mix(chroma(c, x || tx, y || ty, 0.26, 211), '#fff0bc', gC(x || tx, y || ty) * 0.3),
    });
  }

  /* ══ 3c · THE GLORY COMING OUT OF HIM ════════════════════════════════════════ */
  // ⚠ WITHOUT THIS THE WHOLE IDEA FAILS AT THE LAST STEP. The child is a runtime sprite
  // in a BLUE cloak, and he stays that way: by the book's grammar the divine figures are
  // radiant and only YOU are a dark figure, and this page does not change that — what it
  // changes is that the light is now INSIDE the dark child. So the light is painted
  // bursting out from where his chest will be, and his silhouette drops in front of it:
  // a dark child rimmed in his own light, which is exactly the sentence on the page.
  // This is `gift`'s own glory-and-rays treatment, moved from the open door to a person.
  {
    const dc = [heart.x, heart.y];
    // ⚠ A BLOOM, NOT A FIREWORK. The first version of this was `gift`'s door treatment
    // copied whole — a 132-unit halo, 104 bold rays evenly around the circle, and
    // klimtGold's concentric rings on top — and it painted a peacock tail. Rays in every
    // direction at even angles read as a WHEEL, and the rings gave it spokes and a hub.
    // gift can carry them because its door is a gate of glory in a dark sky; a small
    // child standing in a bright meadow cannot. What makes a source believable here is
    // not spokes: it is a tight bloom he is rimmed by, the pool his light makes on the
    // grass, and every shadow on the page pointing away from him. Those were already
    // drawn; this only had to stop competing with them.
    strokes(out, counter, {                                  // the ground he sets alight
      rng, n: 620,
      sample: r => { const a2 = r() * Math.PI * 2, d = Math.pow(r(), 1.15) * 104;
                     return [dc[0] + Math.cos(a2) * d, dc[1] + Math.sin(a2) * d * 0.94]; },
      // ⚠ RADIAL DIRECTION IS WHAT KEEPS DRAWING SPOKES. I learned this on the ground pool
      // and then broke it again forty lines later: any large group of marks all pointing
      // away from one point reads as a wheel, whatever colour it is. These run upright
      // with the grass, so the bloom exists purely as VALUE — blazing grass around him
      // rather than rays coming off him.
      dir: (x, y) => -Math.PI / 2 + (fbm(x / 13, y / 10, 111) - 0.5) * 1.0,
      // ⚠ AND IN GRASS COLOURS. Cream strokes at full width over green painted a heap of
      // popcorn round his feet — discrete pale blobs sitting ON the field instead of light
      // living IN it. The ramp has to END in sunlit yellow-green, not in gold, so the outer
      // half of the bloom simply IS bright grass; and the marks have to be blade-shaped —
      // long and thin — or they read as objects however well they are coloured.
      col: (x, y, r) => jig(ramp(['#fffdf4', '#fff4c6', '#f4e79c', '#d9de80', '#aecb68'],
        Math.pow(Math.hypot(x - dc[0], (y - dc[1]) / 0.94) / 104, 0.72) + r() * 0.12), r, 9),
      len: (x, y) => 12 * (0.93 + 0.14 * swellOut(x, y)),
      lw: 1.3, steps: 2, lenJ: 0.75, impasto: 0.4, relief: 0, op: 0.52,
    });
    // and real blades standing up THROUGH it, so the light is behind the grass rather
    // than spread over the top of it
    strokes(out, counter, {
      rng, n: 760,
      sample: r => { const a2 = r() * Math.PI * 2, d = Math.pow(r(), 1.0) * 108;
                     return [dc[0] + Math.cos(a2) * d, dc[1] + Math.sin(a2) * d * 0.94]; },
      dir: (x, y) => -Math.PI / 2 + (fbm(x / 8, y / 7, 113) - 0.5) * 1.3,
      col: (x, y, r) => {
        const t = Math.min(1, Math.hypot(x - dc[0], (y - dc[1]) / 0.94) / 108);
        return jig(ramp(['#fff6cc', '#eae08e', '#c3d46e', '#8fbb54', '#5f9a41'], t * 0.9 + r() * 0.22), r, 10);
      },
      len: (x, y) => 9 * dS(y), lw: 0.9, steps: 2, lenJ: 0.85, impasto: 0.55,
    });
    // ⚠ AND ONE COMPACT CORE AT THE CHEST, which the sprite lands on top of. Nearly all of
    // it ends up hidden behind him — that is the point: what shows is a rim of his own
    // light around a dark child, which is the sentence on the page in one mark.
    strokes(out, counter, {
      rng, n: 170,
      sample: r => { const a2 = r() * Math.PI * 2, d = Math.pow(r(), 0.85) * 32;
                     return [dc[0] + Math.cos(a2) * d, dc[1] + Math.sin(a2) * d]; },
      dir: (x, y) => Math.atan2(y - dc[1], x - dc[0]),
      col: (x, y, r) => jig(ramp(['#ffffff', '#fffbe4', GOLD_HOT, GOLD_PALE],
        Math.hypot(x - dc[0], y - dc[1]) / 32), r, 5),
      len: (x, y) => 6 * (0.95 + 0.10 * swellOut(x, y)), lw: 2.4, steps: 2, impasto: 0.3, relief: 0,
    });
  }

  /* ══ 4 · THE FLOWERS, OPENING OUTWARD FROM HIM ═══════════════════════════════ */
  // Flowers grow in COLONIES, from a stem, with a face — evenly scattered dots are
  // sprinkles, and sprinkles average to grey. Each patch is a family of one colour,
  // and `nw` decides how open it is: near him full jewel colour and many heads, far
  // out a few small pale ones still closed. The field is visibly becoming new.
  {
    const PETALS = [['#ffd0e2', '#f4a8c8'], ['#fff4f8', '#ffdCe8'], ['#ffe09a', '#f6c464'],
                    ['#d8c8f4', '#bda8ea'], ['#fdfdf6', '#ece5d2'], ['#c8ecff', '#a2d6f4']];
    for (let c = 0; c < 46; c++) {
      const cx = -10 + rng() * 820;
      const cy = horizon + 20 + (c < 16 ? rng() * 0.42 : rng()) * (508 - horizon - 20);
      const n = nw(cx, cy);
      if (rng() > 0.22 + n * 0.86) continue;                 // the far world is not in flower yet
      const pal = PETALS[(rng() * PETALS.length) | 0];
      const spread = 24 + rng() * 52, count = 3 + ((rng() * (3 + n * 10)) | 0);
      for (let i = 0; i < count; i++) {
        const fx = cx + (rng() + rng() - 1) * spread;
        const fy = cy + (rng() + rng() - 1) * spread * 0.4;
        if (fy < crest(fx) + 6 || !clearOf(fx, fy)) continue;
        const sc = dS(fy) * (0.6 + nw(fx, fy) * 0.55), st = (7 + rng() * 8) * sc;
        paintPath(out, counter, rng, [[fx, fy], [fx + (rng() - 0.5) * 4, fy - st]],
          (x, y, r) => jig(mix('#3f6d38', '#79a44c', r()), r, 7), { lw: 1.2 * sc, len: 3, density: 0.9, jitter: 0.3 });
        // colour arrives with him: a flower he has not reached keeps its bud pale
        const pet = mix(mix(pal[(rng() * 2) | 0], '#b9c6bd', (1 - nw(fx, fy)) * 0.6), '#fff6d2', gC(fx, fy) * 0.3);
        const hd = 2.4 * sc;
        for (let k = 0; k < 5; k++) {
          const a = k * 1.256 + rng() * 0.35;
          const px = fx + Math.cos(a) * hd, py = fy - st + Math.sin(a) * hd;
          out.push(`<ellipse cx="${R1(px)}" cy="${R1(py)}" rx="${R1(2.1 * sc)}" ry="${R1(1.5 * sc)}" transform="rotate(${R1(a * 57)} ${R1(px)} ${R1(py)})" fill="${pet}" opacity="0.94"/>`);
          counter.n++;
        }
        out.push(`<circle cx="${R1(fx)}" cy="${R1(fy - st)}" r="${R1(1.25 * sc)}" fill="#ffe9a8"/>`); counter.n++;
      }
    }
  }

  /* ⭐ "I WILL BE AS THE DEW UNTO ISRAEL: HE SHALL GROW AS THE LILY, and cast forth his roots as
     Lebanon" (Hos 14:5). This is the page of the new creature, and the verse gives the picture of
     one: dew, and a lily growing in it. Lilies stand round him now (the engine's paintLily —
     Matt 6:28), tallest nearest the reader, all inside the reach of his light; the dew is laid
     in the near plane below. (Sep 21, the fresh scripture search.) */
  {
    const lyR = mulberry32(seed ^ 0x1405);
    for (const [lx, ly, lh, ll] of [[338, 398, 24, -3], [462, 402, 26, 3], [312, 430, 32, -4], [490, 434, 34, 4], [366, 446, 38, -2], [438, 450, 40, 3]])
      E.paintLily(out, counter, lyR, lx, ly, lh, { lean: ll, lightFn: gC });
  }
  /* ══ 5 · THE NEW CREATURE ════════════════════════════════════════════════════ */
  // "if any man be in Christ, he is a NEW CREATURE" (2 Cor 5:17) — one butterfly,
  // in his light, close enough to his lifted hand to belong to him.
  {
    const bx = 452, by = 336, s = 1.35;
    const wing = (sx, sy, ex, ey, cxx, cyy, col1, col2) => {
      out.push(`<path d="M${R1(bx)} ${R1(by)}Q${R1(bx + cxx * s)} ${R1(by + cyy * s)} ${R1(bx + ex * s)} ${R1(by + ey * s)}Q${R1(bx + sx * s)} ${R1(by + sy * s)} ${R1(bx)} ${R1(by)}Z" fill="${col1}" opacity="0.95"/>`);
      counter.n++;
      out.push(`<path d="M${R1(bx)} ${R1(by)}Q${R1(bx + cxx * s * 0.6)} ${R1(by + cyy * s * 0.6)} ${R1(bx + ex * s * 0.62)} ${R1(by + ey * s * 0.62)}Z" fill="${col2}" opacity="0.8"/>`);
      counter.n++;
    };
    const HOT = mix('#ff9a3c', '#fff0c0', gC(bx, by) * 0.5);
    const VIO = mix('#8f5fd0', '#e6cdf6', gC(bx, by) * 0.35);
    wing(-2, -12, -11, -9, -14, -15, HOT, '#ffd98a');        // upper left
    wing(2, -12, 11, -9, 14, -15, HOT, '#ffd98a');           // upper right
    wing(-2, 2, -8, 6, -12, 3, VIO, '#d9b8f2');              // lower left
    wing(2, 2, 8, 6, 12, 3, VIO, '#d9b8f2');                 // lower right
    paintPath(out, counter, rng, [[bx, by - 5 * s], [bx, by + 6 * s]],
      (x, y, r) => jig('#2b1c34', r, 5), { lw: 1.5 * s, len: 2, density: 1, jitter: 0.1 });
    for (const d of [-1, 1]) paintPath(out, counter, rng,
      [[bx, by - 5 * s], [bx + d * 4 * s, by - 10 * s]],
      (x, y, r) => jig('#3a2742', r, 4), { lw: 0.7 * s, len: 2, density: 1, jitter: 0.1 });
  }

  /* ---------------- EGGS ----------------
     Γʹ·Γʹ — John 3:3 in Koine numerals ("Except a man be born again…"), the egg this
     page has always carried; and ΚΑΙΝΗ ΚΤΙΣΙΣ — "new creature", 2 Cor 5:17's own two
     words, cut faint into the field he has already made new. Both are fourth-look
     secrets: the child never trips on them. */
  // ⚠ A FOURTH-LOOK SECRET, NOT A WATERMARK. At h 14/11 (× the 1.45 inscription scale)
  // these read as legible captions stamped across the bottom of the picture on the very
  // first look. Smaller, fainter, and set into the busiest grass, where the texture has
  // something to hide them in.
  // ⚠ THE GLYPHS ARE DRAWN IN `fg`, NOT HERE — see below. `mid` is the boiled plane, and
  // the one rule for a boilable plane is that nothing RULED or BUILT may be drawn in it:
  // the boil displaces every mark, and soft paint absorbs that as a breath while a hard
  // edge cross-fades into a double image. Rendered text is the hardest edge there is.

  const midEnd = out.length;

  /* ══ 6 · THE AIR HE LIGHTS (nearest plane) ═══════════════════════════════════ */
  const _fg0 = out.length;
  // the two hidden verse-refs live in the NEAR plane, which does not boil — Γʹ·Γʹ (John 3:3,
  // "Except a man be born again…") and ΚΑΙΝΗ ΚΤΙΣΙΣ ("new creature", 2 Cor 5:17's own two
  // words). Fourth-look secrets set into the busiest grass; the child never trips on them.
  E.inscriptionText(out, E.greekRef(3, 3), { x: 172, y: 468, h: 10, body: '#1b4630', edge: '#e6fbe4', op: 0.5, edgeOp: 0.28 });
  E.inscriptionText(out, 'ΚΑΙΝΗ ΚΤΙΣΙΣ', { x: 566, y: 484, h: 8, body: '#1b4630', edge: '#e6fbe4', op: 0.38, edgeOp: 0.2 });
  // ⭐ THE DEW (Hos 14:5). A bead of dew is a lens: a point of white light, a cool shadow under
  // it, and on the biggest a tiny cross of glint. Thickest near him — it is HIS light they
  // are catching — and only ever at the height of a blade's tip.
  {
    const dwR = mulberry32(seed ^ 0xde3);
    for (let i = 0; i < 230; i++) {
      const x = dwR() * 800, y = 430 + dwR() * 76, near = Math.exp(-Math.abs(x - heart.x) / 210);
      if (dwR() > 0.35 + near * 0.65) continue;
      const r0 = 0.55 + Math.pow(dwR(), 2) * 1.2;
      out.push(`<circle cx="${R1(x + r0 * 0.3)}" cy="${R1(y + r0 * 0.5)}" r="${R1(r0 * 1.15)}" fill="#2a5a6a" opacity="0.35"/>`); counter.n++;
      out.push(`<circle cx="${R1(x)}" cy="${R1(y)}" r="${R1(r0)}" fill="#eafcff" opacity="${(0.62 + near * 0.35).toFixed(2)}"/>`); counter.n++;
      out.push(`<circle cx="${R1(x - r0 * 0.3)}" cy="${R1(y - r0 * 0.3)}" r="${R1(r0 * 0.42)}" fill="#ffffff"/>`); counter.n++;
      if (r0 > 1.35) { out.push(`<path d="M${R1(x - r0 * 2.6)} ${R1(y)}L${R1(x + r0 * 2.6)} ${R1(y)}M${R1(x)} ${R1(y - r0 * 2.6)}L${R1(x)} ${R1(y + r0 * 2.6)}" stroke="#ffffff" stroke-width="0.45" opacity="0.75" stroke-linecap="round"/>`); counter.n++; }
    }
  }
  // the nearest blades, sharp and dark against the blaze
  strokes(out, counter, {
    rng, n: 1100,
    sample: rej(-6, 436, 806, 512),
    dir: (x, y) => -Math.PI / 2 + (fbm(x / 9, y / 7, 131) - 0.5) * 1.25,
    col: (x, y, r) => {
      const g = gC(x, y);
      let c = ramp(['#12351f', '#1e4a26', '#2f6a33', '#4a8a3e'], r() * 0.85 + fbm(x / 24, y / 16, 133) * 0.3);
      c = mix(c, '#f6eaa4', g * 0.42);
      return jig(chroma(c, x, y, 0.22, 211), r, 9);
    },
    len: (x, y) => 13 + (y - 436) * 0.09, lw: 1.5, steps: 2, lenJ: 0.8, impasto: 0.7,
  });
  // ⚠ THE MOTES ARE THE PROOF. Air is invisible until something shines through it,
  // so drifting seed-down lit from within the frame is the one detail that cannot be
  // read as "a bright morning": it can only be read as a light standing HERE. Denser
  // and hotter the nearer they are to his chest, and they take his colour, not the sky's.
  {
    const mRng = mulberry32(seed ^ 0x3c6ef372);
    for (let i = 0; i < 420; i++) {
      const mx = -10 + mRng() * 820;
      const my = 190 + Math.pow(mRng(), 0.78) * 316;
      const g = gC(mx, my);
      if (mRng() > 0.1 + g * 1.05) continue;                 // they gather in his light
      const s = (0.5 + mRng() * 1.5) * (0.55 + dS(my) * 0.7);
      const c = mix(mix('#fff2c4', '#ffffff', mRng() * 0.5), '#ffd98a', (1 - g) * 0.5);
      E.daub(out, counter, mx, my, s * (0.7 + g * 0.9), jig(c, mRng, 4), mRng);
      if (g > 0.5 && mRng() < 0.4) {                         // the brightest carry a little tail of light
        paintPath(out, counter, mRng, [[mx - s * 2.2, my + s * 0.6], [mx + s * 2.2, my - s * 0.6]],
          (x, y, r) => jig(mix(c, '#ffffff', 0.4), r, 3), { lw: 0.6 * s, len: 1.6, density: 1, jitter: 0.2 });
      }
    }
  }
  fgRanges.push([_fg0, out.length]);

  /* ---------------- layer export ---------------- */
  const ALT = 'A child stands in a wide rolling meadow at dawn, and the light of the whole picture comes from inside him: his chest blazes gold, every tree throws its shadow away from him, and the clouds overhead are lit along their undersides. Nearest him the world is fully awake — deep green grass, trees in white and rose blossom, colonies of jewel-coloured wildflowers — and the further out the land runs the cooler and quieter it stays, the old world still waking to colour. Motes of seed-down hang glowing in the air around him, and one orange and violet butterfly, the sign of the new creature, floats beside his lifted hand. Hidden faint in the field are the Greek Γʹ·Γʹ (John 3:3) and the words ΚΑΙΝΗ ΚΤΙΣΙΣ, "new creature" (2 Corinthians 5:17).';
  const RAW = { undercoat: 0, weave: 0, varnish: 0, oil: 0 };
  const pick = ranges => ranges.map(([a, b]) => out.slice(a, b).join('\n')).join('\n');
  if (LAYER === 'sky') return svgWrap(ALT, out.slice(0, skyEnd).join('\n'), RAW);   // dawn lit from below (opaque backmost)
  if (LAYER === 'mid') return svgWrap(ALT, out.slice(skyEnd, midEnd).join('\n'), RAW);   // the land he is making new
  if (LAYER === 'fg') return svgWrap(ALT, pick(fgRanges), RAW);                     // near grass + the motes in his light
  return svgWrap(ALT, out.join('\n'));   // full painting (desktop)
}
