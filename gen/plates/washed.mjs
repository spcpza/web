// gen/plates/washed.mjs — "Washed white" (Isaiah 1:18 + Revelation 7:14)
//
// A bright fall of radiant light-water pours straight down from above onto the
// recurring RED child. Where it falls, the old scarlet stain RINSES AWAY —
// dissolving downward into the bright stream — while a clean RADIANT WHITE robe
// of light forms over the child from the top down. Above is pure white-gold
// light; below the scarlet washes out into the running water. Joyful relief.
//
//   "Though your sins be as scarlet, they shall be as white as snow." — Isaiah 1:18
//   "...made them white in the blood of the Lamb."                    — Revelation 7:14
//
// No black — the shadow is deep blue. The change from scarlet → white IS the
// subject.
export const name = 'washed';
export const title = 'Washed white';
export const caption = 'Your stains washed white as snow.';
export const seed = 70718243;
export const focal = { x: 400, y: 270 };
// MOBILE 3D — two depth planes: the deep blue-violet surround + the white-gold
// cascade behind (opaque BACKGROUND), and the red child being washed — robe,
// rinsing scarlet, foot-pool and rim — closest (FOREGROUND). The fall pours
// down behind the child; the child parallaxes against it.
export const layers = [
  { name: 'bg', opaque: true },   // surround + falling cascade (backmost, opaque)
  { name: 'fg' },                 // the child being washed (robe, rinse, pool, rim)
  { name: 'front' },              // BIG light rays IN FRONT of the figure (renders above the sprite layer)
];

export function paint(E, opts = {}) {
  const {
    mulberry32, fbm, curlV, mix, ramp, jig, strokes, rej, paintPath, paintChild, castShadow, personCaps,
    lightRadial, svgWrap, R1, W, H, CHILD_RED,
    GOLD, GOLD_PALE, GOLD_DEEP, GOLD_HOT,
  } = E;

  const rng = mulberry32(seed);
  const out = [];
  const counter = { n: 0 };
  // MOBILE 3D LAYERS: BG = surround + cascade (opaque); FG = the child + wash.
  const LAYER = opts.layer || 'full';
  const fgRanges = [], frontRanges = [];
  // ⭐ DETAIL PASS (Sep 8). EVERY STROKE DRAWS ITS OWN WIDTH AND LENGTH (Fred: "use no
  // rules, a paint stroke just exist because it exist"). The glory was fat embossed blobs
  // (rays at lw 9, petals lw 2.8, a cauliflower at the heart); now it is fine radiating
  // filaments, many more of them, each its own size — the swell (wave) rides on top.
  const free = (x, y, salt) => { const n = Math.sin(x * 12.9898 + y * 78.233 + salt) * 43758.5453; return n - Math.floor(n); };
  const widthOf  = (x, y, salt) => 0.40 + 3.2 * Math.pow(free(x, y, salt), 2.6);
  const lengthOf = (x, y, salt) => 0.40 + 1.5 * Math.pow(free(x, y, salt + 17), 1.5);
  out.push(`<rect width="${W}" height="${H}" fill="#0f1230"/>`);   // deeper night-violet base — chiaroscuro, never black

  // the light is RADIAL — a burst of GLORY centred ON the child, radiating outward
  // in every direction (not a stream poured from above). Brightest at the heart,
  // rays streaming straight out, fading into the deep surround. (Isa 1:18 — washed
  // white; the child stands INSIDE the light, glorified.)
  const SX = 400;                       // centre x (kept for the wash/pool below)
  const CRX = 400, CRY = 286;           // the radiance centre — the child's heart
  const src = lightRadial(CRX, CRY, 300);                 // tighter reach → the corners stay DEEP (chiaroscuro)
  const fall = (x, y) => Math.min(1, src(x, y) * 1.1);    // pure radial brightness
  const rayDir = (x, y) => Math.atan2(y - CRY, x - CRX);  // rays point straight OUT from the heart

  // ══ THE GLORY IS DRAWN MOVING ═══════════════════════════════════════════════════════
  // ⚠ Fred: "make the white streaks animate, radiate, all that. dont be lazy, always draw
  // to animate, not jst use stock animations like glow." So this page does not get a
  // pulsing CSS gradient bolted over it — the rays THEMSELVES are drawn in a different
  // place in every frame, and the frames are cycled. `ran` already does this for the
  // Father's run cycle: a plate may read the frame it is being drawn for and draw a
  // different picture.
  // ⚠ AND IT LOOPS EXACTLY. Each mark rides outward by exactly 1/FN of the radius per
  // frame and wraps at the rim, so after FN frames every mark is back where it began —
  // a closed ring with no hitch. The wrap itself is invisible because the marks are dense
  // and each one carries its own phase; what the eye reads is light travelling OUT.
  const _F = (globalThis.__FRAME || 0), _FN = (globalThis.__FRAME_N || 6);
  // ⚠ TWO CLOCKS ON ONE RING. Fred: "make the bird off beat... make the tempo of the bird
  // slower but keeping the other the same."
  // Everything drawn into a boiled plane repeats on the SAME period — six drawings shown
  // in turn — so one thing cannot simply be slowed relative to another. What can differ is
  // how many CYCLES a thing completes per turn of that ring.
  // So the ring itself was slowed to half speed (BOIL_RATE_PAGE[18].bg 0.26 -> 0.52) and
  // the glory given TWO cycles per turn: its real tempo is exactly what it was, while the
  // doves, at one flap per turn, now beat half as often. Both still land whole at frame 6,
  // so the loop stays closed.
  // PH  — the slow clock, one cycle per turn: the doves.
  // PHF — the fast clock, two per turn: the glory and the ground sparkle, unchanged.
  const PH = _F / _FN;
  const PHF = ((2 * _F) / _FN) % 1;
  // ⚠ and the birds are deliberately OFF the beat: a third of a turn out, so their
  // downstroke never lands with the light's swell. Two rhythms, not one bigger one.
  const PHB = ((PH + 0.31) % 1);
  // ⚠ THE PETALS MOVE, THE FIELD DOES NOT. Fred: "i dont like that the page go dark,
  // animate the white petals instead." Moving every mark outward and wrapping it at the
  // rim was my mistake and it dimmed the page — the sample is pow(r,0.5), which is biased
  // OUTWARD, so `(base + PH) % 1` does not just rotate the marks round, it CHANGES THE
  // DENSITY: the bright core thinned on some frames and the whole plate went dark with it.
  // Positions are fixed now. What animates is each petal's own LENGTH, and its phase is
  // taken from how far out it sits — so the swell travels outward through a field that
  // never moves. Total ink stays level (some petals long while others are short), so the
  // page cannot breathe dark.
  // ⚠ AND THE PHASE MUST SPAN WHOLE CYCLES, or the page still breathes dark. With the
  // swell spread over only 0.9 of a cycle the long petals and the short ones do not
  // balance, and the total ink on the plate swung 14% around the loop — measured over the
  // real sample distributions, and visible as the dimming Fred saw. Four cycles across the
  // radius holds it to 2%: at any instant the field always contains as much swell as
  // ebb. It also reads better — four rings of light travelling outward rather than one
  // wash going up and down.
  // ⚠ TWO FLOWS, MEETING AT A WAIST. Fred: "the outward ray now look like it is radiating
  // outside, make the inside ray radiating inside." So the glory now breathes BOTH ways at
  // once — the heart draws light in while the reach pours it out — and the two meet on a
  // still ring at D0, which is the shape of the thing rather than a seam between two
  // effects.
  // The whole counter-flow is one phase function. A feature holds where PH - 6|d-D0| is
  // constant, so beyond the waist (|d-D0| = d-D0) rising PH needs a rising d — OUTWARD;
  // inside it (|d-D0| = D0-d) the sign flips and d must FALL — INWARD. One line, no
  // branch, no boundary to hide.
  // ⚠ V-SHAPED, not squared. A squared phase has a stationary ANNULUS at the waist where a
  // whole band of petals swells in unison, and that lump of synchronised ink swung the
  // plate's brightness ~4% around the loop — the dimming again, by another door. |d-D0|
  // moves at a constant speed on both sides and leaves only a single still ring, which
  // measures at 0.85%: flatter than the pure outward wave this replaces.
  // Two rings drawing in, four pouring out.
  const D0 = 0.34;
  const wave = (x, y) => {
    const d = Math.hypot(x - CRX, y - CRY) / 300;
    return 0.80 + 0.30 * (0.5 + 0.5 * Math.cos((PHF - 6.0 * Math.abs(d - D0)) * Math.PI * 2));
  };

  /* ---------------- 1. THE SURROUND — DEEP at the edges so the cascade GLOWS ----------------
     high contrast: a brilliant white-gold core down the centre, falling off to
     DEEP blue / violet at the left, right and bottom corners. NOT a flat pale
     field — the dark surround is what makes the light read as light. */
  out.push(`<defs><radialGradient id="washcore" cx="0.5" cy="0.57" r="0.66">
<stop offset="0" stop-color="#fffaf0"/>
<stop offset="0.22" stop-color="#fbeec2"/>
<stop offset="0.44" stop-color="#8fa8e0"/>
<stop offset="0.66" stop-color="#33408a"/>
<stop offset="0.86" stop-color="#1a1c48"/>
<stop offset="1" stop-color="#0e1030"/>
</radialGradient></defs>`);
  out.push(`<rect x="-12" y="-12" width="${W + 24}" height="${H + 24}" fill="url(#washcore)"/>`);
  counter.n += 1;

  // broad surround masses — deep curling blue/violet at the edges, lifting toward
  // the bright core, so every gap is either glowing or deep (never flat pale).
  const skyDir = (x, y) => {
    const [c, e] = curlV(x, y, 26, 150);
    return Math.atan2((y - CRY) + e * 90, (x - CRX) + c * 90);   // radiate OUT from the heart, with a living curl
  };
  const skyCol = (x, y, r) => {
    const g = fall(x, y);
    // DEEP blue/violet in the cold surround → white-gold in the cascade core
    let c = ramp(['#101038', '#1c2050', '#2e3a82', '#5468b4', '#9fb6e6', '#fbeec2', '#fffaf0'],
                 Math.min(1, g * 1.18));
    // complementary violet flicker right where the light dies — the living edge
    if (g > 0.14 && g < 0.30 && r() < 0.06) c = mix(c, '#6a3aa0', 0.5);
    return jig(c, r, 6);
  };
  // DENSE long downward-raking strokes — they KNIT into a continuous deep field
  // that streams toward the light, not sparse floating tiles. Long + narrow +
  // high count + low jitter against their own gradient = a woven surround.
  strokes(out, counter, {
    rng, n: 3600, sample: rej(-14, -14, 814, 514),
    dir: skyDir, col: skyCol, len: (x, y) => 40 * lengthOf(x, y, 11), lw: (x, y) => 2.8 * widthOf(x, y, 13), steps: 5, follow: 0.9,
    wild: 0.04, lenJ: 0.3, wJ: 0.3, relief: 0.3,
  });

  /* ---------------- 2. THE GLORY — a DENSE white-gold sunburst RADIATING out ----------------
     brilliant rays stream straight OUT from the heart in every direction — long
     curling filaments, packed close, white-hot at the centre warming to pale gold
     at the reach. This is the body of the radiance — bold, dense, radial. */
  strokes(out, counter, {
    rng, n: 2400,
    sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 0.5) * 300; return [CRX + Math.cos(a) * d, CRY + Math.sin(a) * d]; },
    dir: (x, y) => rayDir(x, y) + (fbm(x / 36, y / 64, 17) - 0.5) * 0.34,   // straight out, with a living waver
    col: (x, y, r) => {
      const core = src(x, y);                                            // brightest at the heart, fading outward
      let c = mix('#ffffff', GOLD_HOT, 0.45);
      c = mix(c, '#ffffff', core * 0.7);
      c = mix(c, GOLD_DEEP, (1 - core) * 0.42);
      return jig(c, r, 6);
    },
    len: (x, y) => (24 + src(x, y) * 36) * wave(x, y) * lengthOf(x, y, 21), lw: (x, y) => 2.0 * widthOf(x, y, 23), steps: 6, follow: 0.95,   // each petal swells in place; the swell travels outward
    wild: 0.05, lenJ: 0.3, wJ: 0.3, relief: 0,
  });
  // BOLD thick rays for body — the glory's loaded strokes, BIG and radiating
  strokes(out, counter, {
    rng, n: 320,
    sample: r => { const a = r() * Math.PI * 2, d = 20 + Math.pow(r(), 0.6) * 262; return [CRX + Math.cos(a) * d, CRY + Math.sin(a) * d]; },
    dir: (x, y) => rayDir(x, y) + (fbm(x / 50, y / 90, 19) - 0.5) * 0.2,
    col: (x, y, r) => jig(mix('#ffffff', GOLD_HOT, 0.35), r, 4),
    len: (x, y) => (30 + src(x, y) * 44) * wave(x, y) * lengthOf(x, y, 31), lw: (x, y) => 4.5 * widthOf(x, y, 33), steps: 5, follow: 0.96, lenJ: 0.3, wJ: 0.3, impasto: 0.5, relief: 0.3,
  });
  // the bright radiant CORE at the heart of the glory
  strokes(out, counter, {
    rng, n: 300,
    sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 0.6) * 120; return [CRX + Math.cos(a) * d, CRY + Math.sin(a) * d]; },
    dir: (x, y) => rayDir(x, y),
    col: (x, y, r) => jig(mix('#ffffff', GOLD_HOT, 0.28), r, 5),
    len: (x, y) => 18 * (0.92 + 0.14 * (0.5 + 0.5 * Math.cos(PHF * Math.PI * 2))) * lengthOf(x, y, 41), lw: (x, y) => 2.6 * widthOf(x, y, 43), steps: 2, lenJ: 0.3, wJ: 0.3, impasto: 0.5, relief: 0,   // the heart breathes gently; it is the source
  });
  /* ---------------- LIFE: TWO WHITE DOVES — the purity sign (Isa 1:18; Matt 3:16) ----------------
     two clean white doves flying in toward the fall, one from each side. The
     surround here is mid-blue, so each dove gets a small DEEP blue-violet pocket
     knitted in behind it (chiaroscuro) — white wings only read against dark. */
  // ⚠ THE DOVES FLY — DRAWN, one wing position per frame. Fred: "animate the birds too!"
  // They already live in `bg`, which is the boiled plane, so they were shimmering with
  // the paint but holding a single fixed pose: wings pinned in a wide V for ever. A bird
  // that never beats is a paper cut-out, however much its paint boils.
  // So the wings SWEEP: `flap` runs +1 (fully up) to -1 (fully down) around the loop, and
  // every wing point is interpolated between an up pose and a down pose. Six drawings is a
  // whole beat — the same trick `ran` uses for the Father's run cycle, which is the book's
  // way: draw the motion, do not transform the drawing.
  // ⚠ The two doves are given different phases. Birds beating in unison read as one
  // mechanism; a half-beat apart they read as two living things.
  const dove = (dx0, dy0, d, s, dph) => {
    const flap = Math.cos((PHB + (dph || 0)) * Math.PI * 2);   // +1 wings up · -1 wings down
    const k = 0.5 - 0.5 * flap;                               // 0 at the top of the beat, 1 at the bottom
    const wy = (up, dn) => dy0 + s * (up + (dn - up) * k);    // a wing point, up-pose → down-pose
    const reach = 0.74 + 0.26 * (1 - k);                      // wings extend furthest at the top
    // a bird RISES on the downstroke — the body lifts as the wings drive down
    const bob = s * 1.5 * (k - 0.5);
    // the pocket behind the dove — ⭐ Sep 12 (the beauty pass): it was a slab of near-black
    // navy the size of a hand, and on the page the two doves read as two DARK STAINS with
    // white marks in them — on the one page whose sentence is "every stain went". A dove
    // needs only a little dusk behind her to read: a soft violet-blue veil, feathered, half
    // transparent, woven with the surround's own flow.
    // (v2 at 80 marks / op 0.5 still stacked into a solid blue slab — overlapping half-
    //  transparent marks saturate. A veil is FEW marks, wide apart, each faint.)
    strokes(out, counter, {
      rng, n: 34,
      sample: r => { const a = r() * Math.PI * 2, dd = Math.sqrt(r()); return [dx0 + Math.cos(a) * 36 * s * dd, dy0 - 3 * s + Math.sin(a) * 24 * s * dd]; },
      dir: skyDir,
      col: (x, y, r) => jig(mix('#5a63b4', '#8a92d0', fbm(x / 30, y / 30, 47)), r, 4),
      len: 14, lw: 3.4, steps: 3, follow: 0.9, lenJ: 0.5, relief: 0, op: 0.3,
    });
    // the dove — BOLD simple silhouette, wings raised in a wide V (living = curved)
    const wc = (x, y, r) => jig(mix('#ffffff', '#fff4dc', 0.2 + r() * 0.2), r, 3);        // warm white (head, tail)
    const wcG = (x, y, r) => jig(mix('#fffdf0', '#ece68e', 0.18 + r() * 0.34), r, 3);      // the body: white toward green-gold (yᵊraqraq)
    const wcS = (x, y, r) => jig(mix('#f7f9ff', '#b9c5de', 0.12 + r() * 0.42), r, 3);      // the wings: white toward silver
    paintPath(out, counter, rng,   // body: tail → breast → head, gently up-curved, LOADED
      [[dx0 - 11 * s * d, dy0 + 3 * s - bob], [dx0 - 2 * s * d, dy0 + 1.4 * s - bob], [dx0 + 7 * s * d, dy0 - 1.4 * s - bob], [dx0 + 11 * s * d, dy0 - 2 * s - bob]],
      wcG, { lw: 4.6 * s, len: 3.4, density: 1, jitter: 0.3 });
    paintPath(out, counter, rng,   // the head — a round white mass at the front
      [[dx0 + 9 * s * d, dy0 - 2.4 * s - bob], [dx0 + 12 * s * d, dy0 - 2.2 * s - bob]],
      wc, { lw: 3.8 * s, len: 2.2, density: 1, jitter: 0.25 });
    paintPath(out, counter, rng,   // front wing — raised, sweeping up and BACK
      [[dx0 + 1 * s * d, dy0 - 0.5 * s - bob], [dx0 - 3.5 * s * d * reach, wy(-8.5, 4.5) - bob], [dx0 - 10 * s * d * reach, wy(-15, 9.5) - bob]],
      wcS, { lw: 3.6 * s, len: 3.2, density: 1, jitter: 0.3 });
    paintPath(out, counter, rng,   // rear wing — raised near-vertical, a WIDE V with the front
      [[dx0 + 5.5 * s * d, dy0 - 1.5 * s - bob], [dx0 + 4 * s * d * reach, wy(-8.5, 3.5) - bob], [dx0 + 1 * s * d * reach, wy(-14, 8.5) - bob]],
      wcS, { lw: 3.0 * s, len: 3, density: 1, jitter: 0.3 });
    paintPath(out, counter, rng,   // tail — a small fan
      [[dx0 - 10.5 * s * d, dy0 + 2.8 * s - bob], [dx0 - 16.5 * s * d, dy0 + 6 * s - bob]], wc, { lw: 2.6 * s, len: 2.6, density: 1, jitter: 0.3 });
    paintPath(out, counter, rng,
      [[dx0 - 10.5 * s * d, dy0 + 2.8 * s - bob], [dx0 - 17.5 * s * d, dy0 + 3.2 * s - bob]], wc, { lw: 2.2 * s, len: 2.6, density: 1, jitter: 0.3 });
    paintPath(out, counter, rng,   // the one accent: a tiny gold beak toward the light
      [[dx0 + 12.5 * s * d, dy0 - 2.2 * s - bob], [dx0 + 15.5 * s * d, dy0 - 1.4 * s - bob]],
      (x, y, r) => jig(GOLD_HOT, r, 3), { lw: 1.6 * s, len: 1.8, density: 1, jitter: 0.2 });
    /* ⭐ Sep 23 — Ps 68:13: "ye shall be as the wings of a dove covered with silver, and her
       feathers with yellow gold." The Hebrew for that gold is yᵊraqraq (H3422) — GREENISH gold,
       the colour of new leaves. A first cut laid silver barbs and green-gold feathers ON the
       white bird; at 22 units a dove cannot carry marks that small — they read as specks. So
       the verse's two colours live in the masses themselves: the wings are painted in silver-
       white (see wcS above), the body in white warmed toward green-gold (wcG). */
  };
  dove(276, 185, +1, 1.0, 0);      // left dove, flying in toward the fall
  dove(538, 252, -1, 0.85, 0.42);  // right dove, deeper and smaller — and half a beat behind, so the two never move as one

  const bgEnd = out.length;   // BG plane: the deep surround + the white-gold cascade (opaque)

  /* ---------------- 3. THE CHILD — "you", standing under the fall ----------------
     a small figure standing, arms a little open in relief, face turned up into
     the light. Built from CHILD_RED capsules. */
  const cx = SX, feet = 392, headY = 244;
  // ⚠ THE GOLD HALO MOVED OUT OF `fg` AND INTO THE BOILED PLANE. Fred, pointing at the
  // warm petals ringing the child: "what i meant was this yellow ish stroke. animate this
  // as well and not just the background." They sat in `fg` — the plane that also holds the
  // CHILD — and boiling that would displace him and leave a doubled figure, which is the
  // ghosting that ruined twoways' palace. A second boiled plane was the other option and
  // is worse: this page would go to 16 depth planes, past the budget that made twoways
  // blink blue.
  // But this glow was already drawn BEFORE the child, so it is already behind him — which
  // means it can simply live in `bg` instead, at zero cost and with no change to the
  // stacking whatsoever. It now rides the boil that is already running, and takes the same
  // counter-flow: the gold ring breathes with the white glory around it rather than
  // sitting dead inside a moving picture.
  strokes(out, counter, {
    rng, n: 600,
    sample: r => {
      const a = r() * Math.PI * 2, d = (40 + Math.pow(r(), 0.5) * 90);   // a RING outside the body — halo, not flood
      return [cx + Math.cos(a) * d * 0.78, (headY + feet) / 2 + Math.sin(a) * d];
    },
    dir: (x, y) => Math.atan2(y - (headY + feet) / 2, x - cx),
    col: (x, y, r) => {
      const d = Math.hypot((x - cx) / 0.78, y - (headY + feet) / 2) / 130;
      return jig(mix('#fffdf4', GOLD_PALE, Math.min(1, d) * 0.6), r, 5);
    },
    // ⚠ the SAME wave as the glory, read at this stroke's own position — so the rings run
    // continuously through the halo instead of the halo pulsing to its own clock.
    len: (x, y) => 16 * wave(x, y) * lengthOf(x, y, 51), lw: (x, y) => 2.4 * widthOf(x, y, 53), steps: 2, lenJ: 0.3, wJ: 0.3, impasto: 0.4, relief: 0,
  });

  /* ---------------- THE GROUND SPARKLES — DRAWN, IN COLOUR ----------------
     ⚠ Fred: "can you make the ground 'sparkle' as well? do not cheat, we make it sparkle
     by drawing and using colours and movement instead of effects." So: no filter, no
     opacity trick, no white bloom laid over the floor. Each glint is a MARK — a little
     crossed star with a loaded centre — and it is drawn in a different state in every one
     of the six drawings. What makes it sparkle is that the marks take turns.
     ⚠ COLOUR IS THE POINT, not brightness. Water broken by light does not flash white; it
     throws the spectrum back a piece at a time. Every glint keeps its OWN hue — gold,
     rose, cyan, violet, mint — so the ground reads as light being broken rather than as a
     lamp being switched. On a page about a stain becoming white, the floor holding every
     colour at once is the whole argument (Isa 1:18).
     ⚠ POSITIONS ARE FIXED and only the FLASH moves. Every glint's place is drawn from its
     own stream once; the loop only decides which are lit. That is what keeps this from
     dimming the plate the way moving the glory's marks did — the count lit at any instant
     is the same because the phases are spread evenly.
     ⚠ It lives in `bg` because `bg` is the plane that boils. The pool and the lilies are
     in `fg` and cannot animate without boiling a second plane, which this page cannot
     afford. Measured: `fg` covers only 25% of this band, so three quarters of the ground
     is bg and the sparkle reads across nearly all of it. */
  {
    const spRng = mulberry32(seed ^ 0x5eed1e);
    const SPCOL = ['#ffffff', '#fff3c8', '#ffe08a', '#bfe9ff', '#ffc9e6', '#d9c8ff', '#c8ffe4'];
    for (let i = 0; i < 360; i++) {
      const gx = -10 + spRng() * 820;
      const gy = 398 + Math.pow(spRng(), 0.72) * 110;      // the ground band, denser near us
      const ph = spRng();                                   // this glint's own moment
      const hue = SPCOL[(spRng() * SPCOL.length) | 0];
      const big = 0.55 + spRng() * 0.9;
      // a NARROW flash: cos^6 means each glint is dark for most of the turn and briefly
      // brilliant, which is what a sparkle is. A gentle sine would give a field that
      // breathes together — a glow by another name.
      const u = (((PHF - ph) % 1) + 1) % 1;
      const lit = Math.pow(Math.max(0, Math.cos(u * Math.PI * 2)), 6);
      if (lit < 0.07) continue;                             // unlit glints are simply not drawn
      const near = 0.6 + (gy - 398) / 110 * 0.7;            // nearer ones are bigger
      // ⚠ each glint has to READ. At (1.5 + 4.6*lit) they were true but too quiet to
      // call a sparkle against petals this size — bigger marks, not more of them, or the
      // ground turns to sprinkles (the book's own warning about evenly-scattered dots).
      const L = (2.4 + 7.2 * lit) * big * near;
      const cw = (x, y, r) => jig(mix(hue, '#ffffff', 0.25 + 0.5 * lit), r, 4);
      paintPath(out, counter, rng, [[gx - L, gy], [gx + L, gy]], cw,
        { lw: 1.35 * near, len: 1.8, density: 1, jitter: 0.2 });
      paintPath(out, counter, rng, [[gx, gy - L * 0.62], [gx, gy + L * 0.62]], cw,
        { lw: 1.2 * near, len: 1.6, density: 1, jitter: 0.2 });
      E.daub(out, counter, gx, gy, (0.8 + 1.9 * lit) * near, jig(mix(hue, '#ffffff', 0.55), rng, 3), rng);
    }
  }

  const _fg = out.length;   // FG plane opens: the child and everything washing it
  // the little pilgrim's mass (cloak wedge + mask disc) as a region test, so the
  // robe-of-light and rims paint ON the figure exactly
  const _h = feet - headY, _R = _h * 0.26, _cyH = feet - _h + _R * 1.02;
  const _neck = _cyH + _R * 0.72, _wt = _R * 0.92, _wb = _R * 1.72, _hem = feet - _h * 0.02;
  const inPilgrim = (x, y, m = 0) => {
    if (y >= _neck - m && y <= _hem + m) {
      const t = Math.max(0, Math.min(1, (y - _neck) / (_hem - _neck)));
      return Math.abs(x - cx) <= _wt + (_wb - _wt) * t + m;
    }
    const dx = (x - cx) / (_R * 1.04 + m), dy = (y - _cyH) / (_R * 0.94 + m);
    return dx * dx + dy * dy <= 1;
  };
  // the washed pilgrim — RADIANT, arms open receiving, face lifted into the
  // fall, eyes closed in relief (joy arcs)
  E.paintMask(out, counter, rng, {
    x: cx, y: feet, h: feet - headY, facing: 1,
    armL: [cx - 42, headY + 104], armR: [cx + 42, headY + 104],
    eye: [0, -1], mood: 'joy', aura: 13,
  });

  /* ---------------- 4. THE WHITE ROBE OF LIGHT — forms over the child, top-down ----------------
     where the fall touches, a clean radiant WHITE robe of light overtakes the
     red — densest at the head/shoulders (washed first), thinning toward the feet
     (still being rinsed). This is the scarlet → white change, on the body. */
  const robeTop = _neck + 2;   // robe starts below the mask — the face stays clear
  strokes(out, counter, {
    rng, n: 320,
    sample: rej(cx - 32, robeTop - 4, cx + 32, feet - 4, (x, y) => {
      // only over the figure's mass below the neck, and weighted to the TOP
      const onBody = inPilgrim(x, y);
      if (!onBody || y < robeTop) return false;
      const fromTop = 1 - (y - robeTop) / (feet - 6 - robeTop);  // 1 at shoulders → 0 at feet
      // white floods the shoulders/upper torso as a luminous ROBE (the body stays
      // present, a clothed form), thinning toward the legs so the SCARLET reads below
      return rng() < 0.16 + Math.pow(Math.max(0, fromTop), 1.8) * 0.7;
    }),
    dir: (x, y) => Math.PI / 2 + (fbm(x / 14, y / 18, 23) - 0.5) * 0.7,    // flows downward over the form
    col: (x, y, r) => {
      const fromTop = 1 - (y - robeTop) / (feet - 6 - robeTop);
      // pure white at the shoulders, warming to white-gold lower (the front of the wash)
      let c = mix('#ffffff', GOLD_PALE, (1 - fromTop) * 0.5);
      return jig(c, r, 5);
    },
    len: (x, y) => 7 + (1 - (y - headY) / (feet - headY)) * 7, lw: 3.0, steps: 2,
    lenJ: 0.5, impasto: 0.5,
  });
  // a bright SCARLET still clinging to the lower body — the stain not yet fully
  // washed; it reads against the white above and rinses out below the feet.
  strokes(out, counter, {
    rng, n: 150,
    sample: rej(cx - 22, headY + 70, cx + 22, feet - 2, (x, y) => inPilgrim(x, y)),
    dir: (x, y) => Math.PI / 2 + (fbm(x / 12, y / 16, 29) - 0.5) * 0.5,
    col: (x, y, r) => {
      const fromTop = (y - (headY + 70)) / (feet - 2 - (headY + 70));   // 0 upper → 1 at feet
      let c = ramp([CHILD_RED[0], '#d23425', '#e8463a'], fbm(x / 12, y / 12, 33) * 0.6);
      c = mix(c, '#ffffff', (1 - fromTop) * 0.35);   // paling toward the white above
      return jig(c, r, 7);
    },
    len: 7, lw: 2.6, steps: 2, lenJ: 0.5, relief: 0,
  });

  /* ---------------- 5. THE SCARLET STAIN, RINSING AWAY DOWNWARD ----------------
     below the child, the old scarlet runs OUT of the robe and dissolves into the
     bright stream — red threads thinning, paling, lost in the white water as
     they fall. The stain leaves; it does not stay. (Isa 1:18) */
  strokes(out, counter, {
    rng, n: 620,
    sample: rej(cx - 58, feet - 66, cx + 58, 506, (x, y) => {
      const near = Math.abs(x - cx) < 30 + (y - feet) * 0.28;
      return near && y > feet - 62;
    }),
    dir: (x, y) => Math.PI / 2 + (fbm(x / 30, y / 50, 31) - 0.5) * 0.6,    // streaming down
    col: (x, y, r) => {
      // VIVID scarlet just under the robe → pale → white (rinsed clean in the pool)
      const t = Math.max(0, Math.min(1, (y - (feet - 62)) / 120));
      let c = ramp(['#f0241c', '#e8201a', CHILD_RED[0], '#ef6a5a', '#f4ada2', '#f8ddd6', '#ffffff'], t);
      c = mix(c, '#ffffff', fall(x, y) * 0.5);   // the bright water bleaches it
      return jig(c, r, 8);
    },
    len: (x, y) => 9 + (y - feet) / 11, lw: 3.0, steps: 3, follow: 0.92,
    lenJ: 0.7, relief: 0,
  });
  // a bright POOL of running light at the foot where the wash gathers and clears —
  // the scarlet is gone here; only white-gold light remains. Dense and luminous.
  strokes(out, counter, {
    rng, n: 460,
    sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 0.7) * 100; return [cx + Math.cos(a) * d, feet + 30 + Math.sin(a) * d * 0.42]; },
    dir: (x, y) => (fbm(x / 40, y / 24, 37) - 0.5) * 0.8,                  // running flat outward
    col: (x, y, r) => {
      const dd = Math.hypot(x - cx, (y - (feet + 30)) / 0.42) / 100;
      // white-hot heart of the pool → pale gold at the rim
      let c = ramp(['#ffffff', '#fffaf0', GOLD_PALE, GOLD], Math.min(1, dd));
      return jig(c, r, 5);
    },
    len: 14, lw: 3.6, steps: 2, lenJ: 0.5, impasto: 0.5,
  });
  // a last faint blush of scarlet dissolving at the very edge of the pool — the
  // stain lost in the light (it leaves; it does not stay).
  strokes(out, counter, {
    rng, n: 90,
    sample: r => { const a = r() * Math.PI * 2, d = 70 + Math.pow(r(), 0.6) * 36; return [cx + Math.cos(a) * d, feet + 30 + Math.sin(a) * d * 0.42]; },
    dir: (x, y) => (fbm(x / 30, y / 22, 41) - 0.5) * 0.9,
    col: (x, y, r) => jig(mix('#f6c8bf', '#ffffff', 0.5 + r() * 0.4), r, 6),
    len: 10, lw: 2.4, steps: 2, lenJ: 0.6, relief: 0,
  });

  /* ---------------- 6. RIM OF LIGHT on the child, facing the fall ---------------- */
  strokes(out, counter, {
    rng, n: 130,
    sample: rej(cx - 26, headY - 10, cx + 26, feet - 30, (x, y) => inPilgrim(x, y) && !inPilgrim(x, y, -5)),
    dir: () => -Math.PI / 2,
    col: (x, y, r) => jig(GOLD_HOT, r, 4),
    len: 5.5, lw: 1.8, steps: 1, relief: 0,
  });
  /* ---------------- 7. EXTRA WHITE-GOLD GLOW STROKES around the figure ----------------
     a tight radiant crown of marks hugging the silhouette — the clear, strong
     white aura of the washed child, raying outward (Isa 1:18 "white as snow"). */
  strokes(out, counter, {
    rng, n: 300,
    sample: r => {
      // ring just OUTSIDE the figure's mass — radiating off the silhouette
      for (let t = 0; t < 24; t++) {
        const a = r() * Math.PI * 2, d = 16 + Math.pow(r(), 0.5) * 30;
        const x = cx + Math.cos(a) * d, y = (headY + feet) / 2 + Math.sin(a) * d * 1.25;
        const onBody = inPilgrim(x, y);
        const nearBody = inPilgrim(x, y, 30);
        if (!onBody && nearBody) return [x, y];
      }
      return null;
    },
    dir: (x, y) => Math.atan2(y - (headY + feet) / 2, x - cx),    // ray straight outward
    col: (x, y, r) => jig(mix('#ffffff', GOLD_PALE, 0.35), r, 5),
    len: 11, lw: 2.6, steps: 1, lenJ: 0.6, impasto: 0.45, relief: 0,
  });
  /* ---------------- LIFE: WATER-LILIES at the cascade's base pool (Isa 1:18) ----------------
     white cups blooming on DARK water at the bright pool's flanks — purity grown
     where the wash has run clear. First the still dark water margins (the pool's
     own light needs dark beside it), then the pads, then the white cups. */
  for (const [wx, wy, ww, wh] of [[300, 462, 58, 18], [494, 458, 52, 16]]) {
    strokes(out, counter, {    // the still dark water margin — calm horizontal ripples
      rng, n: 130,
      sample: r => [wx + (r() + r() - 1) * ww, wy + (r() + r() - 1) * wh],
      dir: (x, y) => (fbm(x / 34, y / 20, 51) - 0.5) * 0.5,
      col: (x, y, r) => jig(mix('#101c40', '#1a3054', fbm(x / 26, y / 18, 53)), r, 4),
      len: 13, lw: 3.0, steps: 2, follow: 0.9, lenJ: 0.5, relief: 0,
    });
    strokes(out, counter, {    // a few thin gold flecks — the bright pool reflected on the dark water
      rng, n: 16,
      sample: r => [wx + (wx < 400 ? 1 : -1) * (10 + r() * ww * 0.7), wy - wh * 0.3 + (r() + r() - 1) * wh * 0.5],
      dir: () => 0,
      col: (x, y, r) => jig(mix(GOLD_DEEP, GOLD, 0.4), r, 5),
      len: 8, lw: 1.4, steps: 1, lenJ: 0.6, relief: 0,
    });
  }
  const lily = (lx, ly, s) => {
    const pc = (x, y, r) => jig(mix('#12402f', '#1c5a40', fbm(x / 8, y / 8, 57)), r, 5);  // deep green pad
    paintPath(out, counter, rng,   // the floating pad — a flat dark-green leaf
      [[lx - 9 * s, ly], [lx, ly + 1.6 * s], [lx + 9 * s, ly]], pc, { lw: 4.6 * s, len: 3.4, density: 0.95, jitter: 0.3 });
    const wc = (x, y, r) => jig(mix('#ffffff', '#fff6e6', 0.3 + r() * 0.2), r, 3);        // the white cup
    paintPath(out, counter, rng, [[lx - 6.5 * s, ly - 6.5 * s], [lx - 2 * s, ly - 1.5 * s]], wc, { lw: 2.4 * s, len: 2.6, density: 0.95, jitter: 0.3 });  // left petal
    paintPath(out, counter, rng, [[lx + 6.5 * s, ly - 6.5 * s], [lx + 2 * s, ly - 1.5 * s]], wc, { lw: 2.4 * s, len: 2.6, density: 0.95, jitter: 0.3 });  // right petal
    paintPath(out, counter, rng, [[lx, ly - 8 * s], [lx, ly - 2 * s]], wc, { lw: 2.6 * s, len: 2.6, density: 0.95, jitter: 0.3 });                        // centre petal
    paintPath(out, counter, rng, [[lx - 10 * s, ly - 4 * s], [lx - 5 * s, ly - 1 * s]], wc, { lw: 1.8 * s, len: 2.2, density: 0.9, jitter: 0.3 });        // outer left, opening
    paintPath(out, counter, rng, [[lx + 10 * s, ly - 4 * s], [lx + 5 * s, ly - 1 * s]], wc, { lw: 1.8 * s, len: 2.2, density: 0.9, jitter: 0.3 });        // outer right, opening
    paintPath(out, counter, rng, [[lx - 1.2 * s, ly - 3.4 * s], [lx + 1.2 * s, ly - 3 * s]],                                                              // the gold heart
      (x, y, r) => jig(GOLD_HOT, r, 3), { lw: 1.6 * s, len: 1.6, density: 1, jitter: 0.2 });
  };
  lily(287, 458, 1.15); lily(322, 470, 0.95);   // left margin — a pair
  lily(482, 452, 0.9);  lily(508, 464, 1.05);   // right margin — a pair
  fgRanges.push([_fg, out.length]);   // ← the child being washed is the foreground

  /* ---------------- EGG: snowflakes — "white as snow" ----------------
     three faint six-armed snow stars hidden in the bright fall (Isa 1:18). */
  for (const [fx, fy, s] of [[300, 150, 1], [512, 200, 0.8], [346, 300, 0.7]]) {
    const sc = (x, y, r) => jig('#ffffff', r, 4);
    for (let k = 0; k < 3; k++) {
      const a = (k / 3) * Math.PI;
      paintPath(out, counter, rng,
        [[fx - Math.cos(a) * 7 * s, fy - Math.sin(a) * 7 * s], [fx + Math.cos(a) * 7 * s, fy + Math.sin(a) * 7 * s]],
        sc, { lw: 1.2 * s, len: 2.4, density: 0.9, jitter: 0.3 });
    }
  }

  // EASTER EGG — Isaiah 1:18 in ORIGINAL HEBREW numerals (OT → Hebrew), cut faint
  // into the lower wash. "Though your sins be as scarlet, they shall be as white
  // as snow." (chapter 1, verse 18 → א·יח)
  E.inscriptionText(out, E.hebrewRef(1, 18), { x: 632, y: 452, h: 14, body: '#0e1238', edge: '#fff4d8', op: 0.7, edgeOp: 0.55 });

  /* ---------------- 8. FRONT RAYS — big beams passing IN FRONT of the child ----------------
     the wash doesn't only fall behind: bold, translucent white-gold rays cross in
     FRONT of the pilgrim too, so the child is fully INSIDE the light — bathed, not
     just backlit. Drawn on a FRONT plane (renders above the runtime figure), kept
     semi-transparent so the lifted face and open arms still read through them. */
  const _front = out.length;
  strokes(out, counter, {
    rng: mulberry32(seed + 4211), n: 240,
    sample: r => { const a = r() * Math.PI * 2, d = 20 + Math.pow(r(), 0.55) * 210; return [CRX + Math.cos(a) * d, CRY + Math.sin(a) * d]; },
    dir: (x, y) => rayDir(x, y) + (fbm(x / 44, y / 80, 61) - 0.5) * 0.26,   // radiate OUT, over the figure
    col: (x, y, r) => jig(mix('#ffffff', GOLD_HOT, 0.32), r, 4),
    len: (x, y) => (34 + src(x, y) * 34) * wave(x, y) * lengthOf(x, y, 61), lw: (x, y) => 3.4 * widthOf(x, y, 63), steps: 5, follow: 0.95, lenJ: 0.3, wJ: 0.3, op: 0.5, relief: 0.3,   // the front petals swell with the same outward wave
  });
  strokes(out, counter, {   // a few EXTRA-BOLD front rays crossing the figure
    rng: mulberry32(seed + 8422), n: 50,
    sample: r => { const a = r() * Math.PI * 2, d = 24 + Math.pow(r(), 0.6) * 190; return [CRX + Math.cos(a) * d, CRY + Math.sin(a) * d]; },
    dir: (x, y) => rayDir(x, y),
    col: (x, y, r) => jig(mix('#ffffff', GOLD_PALE, 0.4), r, 3),
    len: (x, y) => (40 + src(x, y) * 34) * wave(x, y) * lengthOf(x, y, 71), lw: (x, y) => 5 * widthOf(x, y, 73), steps: 5, follow: 0.96, lenJ: 0.3, wJ: 0.3, op: 0.42, relief: 0.3,
  });
  frontRanges.push([_front, out.length]);

  const ALT = 'A small child stands beneath a dense vertical waterfall of brilliant white-gold light pouring straight down from above, glowing hard against a deep blue-violet surround. A clean radiant white robe of light overtakes the child from the head down, while the old scarlet rinses away below — vivid red threads paling to white as they run into a bright pool of light at the feet. Two white doves fly in toward the fall against the deep blue surround, their wings silver and their breasts a soft green-gold, and white water-lilies bloom on the dark still water at the bright pool\'s edges. High contrast, dynamic, downward-streaming brushwork. Hidden in the fall are faint six-armed snow stars — "white as snow".';

  // MULTIPLANE: assemble the requested depth plane. Each is its own cel —
  // transparent where it has no content — so they stack and parallax apart.
  const RAW = { undercoat: 0, weave: 0, varnish: 0, oil: 0 };   // no baked surface — the live filter unifies the planes
  const setOf = ranges => { const s = new Set(); for (const [a, b] of ranges) for (let i = a; i < b; i++) s.add(i); return s; };
  const pick = ranges => ranges.map(([a, b]) => out.slice(a, b).join('\n')).join('\n');
  const fgSet = setOf(fgRanges), frontSet = setOf(frontRanges);
  if (LAYER === 'front') return svgWrap(ALT, pick(frontRanges), RAW);   // big rays IN FRONT of the figure
  if (LAYER === 'fg') return svgWrap(ALT, pick(fgRanges), RAW);         // the child being washed
  if (LAYER === 'bg') {                                                 // surround + cascade + snow eggs/inscription
    const body = out.filter((_, i) => !fgSet.has(i) && !frontSet.has(i)).join('\n');
    return svgWrap(ALT, body, RAW);
  }
  // full painting (desktop): the original paint order, byte-identical
  return svgWrap(ALT, out.join('\n'));
}
