// gen/plates/light.mjs — "He is the Light" (the reveal)
// The whole journey, gathered into one image: not a what but a Who. A great
// radiant Light fills the frame — a blazing white-gold core, concentric Van
// Gogh ray-swirls turning outward to every colour at the rim (Alpha and Omega,
// all colours resolve to the one Light), and a quiet HEART traced in the
// innermost ring: God is Light, and God is Love. No figure — this page is His
// face of light. It comes just before the candle is sent out.
//   "God is light, and in him is no darkness at all." — 1 John 1:5
//   "God is love." — 1 John 4:8
//
// MOBILE 3D — PAINT ON PAINT (same as the covers): a smooth deep glory GROUND,
// then several INDEPENDENT bold, GAPPED ray-sheets stacked at their own depths
// (each its own pass of paint — you see rays, and through the gaps the rays of
// the sheet behind), then the white-hot core + the hidden heart floating closest.
// Tilt the phone and the rays fan and turn at different depths — you look INTO
// the Light.

export const name = 'light';
export const title = 'He is the Light';
export const caption = 'God is Light. God is Love.';
export const seed = 20262505;
export const focal = { x: 400, y: 250 }; // the radiant core (centred, like the covers)
// the turning rays are built from independent bold, gapped stroke-sheets stacked
// deepest → nearest; nearer sheets a touch finer + warmer (atmospheric).
// ⚠⚠ FIVE SCALES, NOT FIVE COPIES. The old sheets ran 1.7 -> 1.3 wide and 1.12 -> 0.80 long
// — a thirty per cent spread, which at full size is no spread at all: every mark on the page
// came out the same fat lozenge, so the glory read as coloured PILLS laid side by side
// rather than as painted light. (Look at it at 1:1 and it is unmistakable; I had been
// judging it at a third the size.) The deep sheets are now broad and sparse and the near
// ones fine and dense — a real 5x range — which is aerial perspective applied to the SIZE OF
// A BRUSHMARK, the same idea the boil applies to time.
// ⚠ EACH SCALE ALSO KEEPS ITS OWN GROUND. Giving every pass the same inward bias starved the
// rim — the fine marks all crowded into the heart and the deep violet ground showed through
// the outside, so a blaze came out as a dark ring. The broad sheets are pushed OUT (bias
// under 0.5 spreads toward the rim) and the fine ones pulled IN, which is what the five
// scales are for: big open marks hold the outside, fine dense ones pack the light.
// ⭐ DETAIL PASS (Sep 8): ~1.8× the marks per sheet, every stroke its own width and length
// (free hashes on POSITION, so a boiled plane stays in sync — see widthOf/lengthOf in
// paint()), and the rim's fat slabs (lw up to 23 at relief 0.7) become strokes.
const SHEETS = [
  { n: 270, lwMul: 1.60, lenMul: 1.45, lift: 0.00, bias: 0.40 },   // deepest — broad, open, out at the rim
  { n: 400, lwMul: 1.15, lenMul: 1.10, lift: 0.06, bias: 0.48 },
  { n: 580, lwMul: 0.80, lenMul: 0.85, lift: 0.12, bias: 0.60 },
  { n: 820, lwMul: 0.56, lenMul: 0.64, lift: 0.18, bias: 0.74 },
  { n: 1360, lwMul: 0.38, lenMul: 0.48, lift: 0.26, bias: 0.92 },  // nearest — fine, dense, in the heart
];
/* ⚠⚠⚠ TWO PLANES NOW, AND THAT IS THE POINT. Fred: "i want you to draw several types of the
   wallpaper with different color and cycle it so we can imitate sparkle" — and the reason he
   could not see any sparkle is that THE WALLPAPER WAS NOT WHAT WAS CYCLING. This page used to
   declare seven depth planes, of which exactly one (`bg`) was boiled; the five ray-sheets and
   the core sat on top of it, static, hiding nearly everything that changed.
     A boiled drawing is another full 1600x1000 plane, 6.4 MB decoded, so seven planes could
   never afford to animate more than one of them. Folding the five sheets back into the
   background buys the whole thing: two planes instead of seven, and the entire wallpaper —
   ground, glory, every ray — drawn SIX times and cycled. 2 + 6 planes is 51 MB, less than the
   seven static ones cost before.
     What is given up is the tilt parallax between the sheets. That is a real loss and it is
   the right trade: this page's subject is light MOVING, not light at five depths. */
export const layers = [
  { name: 'bg', opaque: true },   // the whole wallpaper: ground, glory field, every ray-sheet
  { name: 'fg' },                 // the white-hot core, the sunburst, and the hidden heart
];

export function paint(E, opts = {}) {
  const {
    mulberry32, fbm, curlV, swirlV, mix, ramp, jig, strokes, rej,
    paintPath, ribbon, svgWrap, R1, W, H, goldenSpiralDir, klimtGold, goldSparks, SPECTRUM_WHEEL,
    GOLD, GOLD_PALE, GOLD_DEEP, GOLD_HOT,
  } = E;

  const rng = mulberry32(seed);
  const out = [];
  const counter = { n: 0 };
  const LAYER = opts.layer || 'full';
  /* ⚠⚠ CHROMATIC. Fred: "can we try to make things chromatic? i dont know? something
     exciting". Two engine levers already exist for exactly this and neither was on here:
       · setColorPunch — real pigment saturation on every colour the plate makes (it leaves
         anything under 6% chroma alone, so the white heart is untouched);
       · the MANIFOLD — Van Gogh's complementary fleck, a share of marks flipped clean across
         the wheel at matched lightness. Pinks living in the blues, oranges on the greens.
         "How manifold are thy works... the earth is full of thy riches" (Ps 104:24).
     A page whose whole subject is light should be the most chromatic in the book, so the
     fleck runs at nearly double the default here. */
  E.setColorPunch(0.22);   // ⚠ back on — with the common tone dropped to a whisper this raises
                           // chroma without shifting a single hue off the book's own wheel
  const _M0 = E.getManifold(); E.setManifold(0.11);   // barely over the book's own 0.10

  const CX = 400, CY = 250, CORE = 58;           // the Light's centre + core radius
  /* ⚠⚠ SHADOWS. `reliefPair` gives every wide mark a lit edge and a shadow edge, but with no
     scene light set it rakes them all from a flat global upper-left — so on a page whose whole
     subject is a light at the centre, every brushmark was modelled as if lit from the corner.
     Pointing it at the core makes each mark its own little form catching THIS light: the marks
     below the heart shadow downward, the ones above shadow upward, and the field gains real
     relief for nothing. (Only four plates in the book had ever set this.) */
  E.setReliefLight({ x: CX, y: CY });

  // NEWTON'S TRUE SPECTRUM as the bow "round about the throne" (Rev 4:3) — the real
  // colours of the light split into its glory, closed into a wheel by angle.
  /* ⚠⚠⚠ THE BOW ROUND ABOUT, AND WHAT SCRIPTURE LETS IT DO. Fred: "rather than doing this,
     can you redraw a similar picture but with different colors? i want to see. consult
     scripture!" So it was consulted, and it rules BOTH halves of the question.

       Ezek 1:28  "As the appearance of the bow that is in the cloud in the day of rain, so
                   was the appearance of the brightness round about. This was the appearance
                   of the likeness of the glory of the LORD."
       Rev 4:3    "and there was a rainbow round about the throne."
       Rev 21:19-20  the twelve foundations of the city, twelve named stones.
       Jas 1:17   "the Father of lights, with whom is no variableness, neither shadow of
                   turning."

     The BRIGHTNESS ROUND ABOUT may move through colour — scripture says that bow IS how the
     glory appears, so this is not a liberty taken with the Light, it is the Light described.
     The SOURCE may not: "no variableness" is about Him, so the white-hot heart is identical
     in every one of the four drawings and only the bow turns around it. That is the whole
     rule this page's colour now obeys, and it is why the core ramp below is untouched.

     And the hues are not mine either: the wheel is the CITY'S OWN TWELVE STONES in the order
     John lists them, closed back to jasper so the bow has no seam. One turn of the ring
     carries every point on the page through all twelve. */
  // ⚠ ORDERED BY HUE, NOT BY JOHN'S NUMBERING. Listing them 1..12 as he does put crystal
  // next to sapphire next to chalcedony next to emerald, so neighbouring places on the wheel
  // got jumping colours and the rim came out MOTTLED — the book's own speckle fault ("bold
  // saturated zones, not speckle"). And it is less faithful, not more: Ezekiel says the
  // brightness round about looked like THE BOW IN THE CLOUD, and a bow is ordered. So these
  // are the city's twelve stones laid round the wheel the way a bow lays them, red through
  // violet, closing on jasper — "clear as crystal" (Rev 21:11) — and back to the red.
  const FOUNDATIONS = [
    // ⚠ AND THEY ARE DEEP. My first cut of these stones was pastel, and it cost the page two
    // things at once: the white core stopped reading (bright only reads against dark), and
    // the ground under the poem went from luma 99 to 133 on screen, which a child reading
    // white text on it can feel. A foundation stone is not a pastel — sardius, sapphire,
    // amethyst and jacinth are DARK saturated colour, and jasper is the only pale one in the
    // list because it is the one John calls "clear as crystal". Deepening them is not a
    // compromise with legibility, it is what the stones actually look like.
    '#ae2733',   // sardius       — deep carnelian red
    '#c66436',   // sardonyx
    '#f0a81f',   // topaz
    '#c0b32b',   // chrysolyte
    '#57ad3c',   // chrysoprasus
    '#1a8f55',   // emerald       — the colour of the bow itself (Rev 4:3)
    '#219b89',   // beryl
    '#5f96b3',   // chalcedony
    '#2c4aac',   // sapphire
    '#5540b4',   // jacinth
    '#8f31ae',   // amethyst
    '#ae2733',   // and round to the sardius again — a bow has no end
  ];
  /* ⚠ JASPER IS NOT IN THE BOW. It was, and it left a hard pale BAND across the glory — a
     crystal-white stone wedged between amethyst and sardius is a jump no interpolation can
     smooth, and purple runs into red on its own. Scripture puts it somewhere better anyway:
     "her light was like unto a stone most precious, even like a jasper stone, CLEAR AS
     CRYSTAL" (Rev 21:11) — jasper is the colour of the city's LIGHT, not of its bow. So it
     belongs at the white heart, where it already is, and the eleven coloured stones make the
     arc. All twelve are still on the page: jasper is in the list the sparkle draws from. */
  const JASPER = '#c8e0d0';
  const STONES_ALL = FOUNDATIONS.slice(0, 11).concat([JASPER]);
  /* ⚠⚠ THE BOW GOES BACK TO THE BOOK'S OWN SPECTRUM. Fred: "can you make the color palette
     similar to what we have so it is not so different." He is right — the twelve stones made
     a beautiful wheel and a page that no longer looked like the rest of the book, and this is
     the one page that has to look like it belongs (its neighbours measure chroma 36-77; this
     had drifted to 85 on a different set of hues entirely).
       The stones are not thrown away, they are moved to where they do the most good and the
     least harm: the BOW is the book's shared SPECTRUM_WHEEL again, and the twelve foundations
     are what the SPARKLE winks to. So the page reads as this book, and Rev 21:19-20 is still
     the reason a mark suddenly goes sardius or beryl for one drawing. Scripture keeps the
     glints; the book keeps its palette. */
  const RAINBOW = SPECTRUM_WHEEL;
  // the frame clock — declared here because the COLOUR needs it, not just the marks
  const _FN = Math.max(1, globalThis.__FRAME_N || 1);
  const _FR = (globalThis.__FRAME || 0) % _FN;
  const PH = _FN > 1 ? _FR / _FN : 0;
  // a per-mark, per-frame hash: independent for neighbouring marks (which is what makes a
  // sparkle instead of a patch) and periodic in the frame (which is what closes the ring)
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
  const distC = (x, y) => Math.hypot(x - CX, (y - CY) * 1.02);
  const maxR = Math.hypot(W, H) * 0.62;

  /* ---------------- THE GLORY COLOUR — white-hot core, all-colour rim ----------------
     CHIAROSCURO: the Light burns white at the heart, ripens through gold, then
     opens into a vivid spiralling rainbow that deepens at the rim. */
  const baseCol = (x, y, r) => {
    const d = distC(x, y) / maxR;                          // 0 core → 1 rim
    const ang = Math.atan2(y - CY, x - CX);
    const hue = ramp(RAINBOW, ((ang / (Math.PI * 2)) + 0.5 + d * 0.32 + fbm(x / 120, y / 120, 9) * 0.12) % 1);
    /* ⚠⚠ THE COLLAR. "Bright only reads against dark" is the book's first rule about light
       and this page — the page whose whole subject IS light — was breaking it: the gold ran
       straight out into the colours with nothing between, so the heart had nothing to be
       bright against and the whole wheel sat at one loud pitch. There is now a DEEP RING
       just outside the gold, and the heart blazes because of it. Nothing else changed about
       the colours; this is only where they are dark. */
    /* ⚠ AND THE COLLAR IS A RING, NOT A DIMMING. My first cut of it darkened everything from
       the gold outward, and the page went from a blaze to a dark vortex with a bright middle
       — good chiaroscuro and the wrong page. This is POST-RESURRECTION: you live IN the
       light, so the field beyond the collar has to come back to full colour. The dark is a
       narrow band that closes by d=0.33, drawn with a sine so it fades in and out of nothing
       at both edges and never reads as an edge itself. */
    let c;
    if (d < 0.20) c = ramp(['#ffffff', '#fffbe8', '#ffe9a4', '#f2b543'], d / 0.20);
    else {
      const u = Math.min(1, (d - 0.20) / 0.13);
      c = mix(mix('#f2b543', hue, Math.min(1, u * 1.25)), '#2b1e4a', Math.sin(u * Math.PI) * 0.62);
    }
    /* ⚠⚠⚠ THE SPARKLE — AND IT IS A FEW MARKS, NOT THE WHOLE WHEEL. Fred, correcting me:
       "change the pink to green, change the yellow to blue, be random, but be subtle, then
       maybe we can imitate a sparkle." I had turned the entire bow a quarter each drawing,
       so every colour on the page changed at once — the opposite of subtle, and it reads as
       the picture being swapped rather than as light glinting.
         What he is describing is BROKEN COLOUR THAT WINKS: one mark in nine takes a
       different stone for one drawing and then comes back, each independently of its
       neighbours. Over the four drawings that is a scatter of colour kindling and dying all
       over the glory, which is what a sparkle actually is.
       ⚠ It must be a HASH, not fbm. Noise is smooth, so neighbouring marks would swap
       together and you would get drifting PATCHES; a sparkle needs each mark to decide on
       its own. And the hash is keyed on the mark's own sample point plus the frame number,
       so it is stable (the same mark every drawing), independent (no two agree), and
       periodic — frame 4 hashes identically to frame 0, so the ring closes.
       ⚠ `col()` is called ONCE per stroke, at its sample point, so this recolours whole
       marks. If it were called per segment the marks would come out speckled inside.
       ⚠ AND NEVER THE CORE. d < 0.20 is the white-hot heart and is left alone here as it is
       everywhere else on this page: Jas 1:17, "no variableness, neither shadow of turning."
       The bow round about may glint; the source may not. */
    if (d >= 0.20) {
      const ix = (x * 4) | 0, iy = (y * 4) | 0;
      if (_hash3(ix, iy, _FR) < 0.11) {
        const j = (_hash3(ix ^ 0x9e37, iy + 7919, _FR + 5) * STONES_ALL.length) | 0;
        c = mix(c, STONES_ALL[j], 0.82);
      }
    }
    /* ⚠⚠ A GLORY GETS BRIGHTER TOWARD ITS SOURCE, and nothing in this page was saying so:
       the ramp went gold, then straight to the stone colours at full strength, so the field
       sat at one pitch all the way out and the page read as a dark wheel with a lamp in the
       middle. Every colour is now lifted toward the light by how near it is — steeply close
       in, nothing at all by three-quarters of the way out. That is what makes the jewels
       GLOW near the heart and stay jewels at the rim, and it is why the whole plate can be
       vivid (post-resurrection: you live IN the light) while the heart still blazes. */
    /* ⚠ AND EVERY MARK OUT THERE KEEPS ITS OWN VALUE. The rim marks are broad by design, and
       broad marks all at one value are SLABS. This is the book's own broken-colour rule — let
       each mark commit to its own depth rather than washing the region — and it is stable
       across the drawings (hash frame 0), so it is texture, not another thing that moves. */
    /* ⚠ AND THE SHADOW IS A COLOUR. Darkening toward one neutral violet is what greys a
       field — the marks lose chroma exactly where they gain depth. Each mark now goes down
       into either a deep VIOLET or a deep TEAL, chosen per mark, so the rim is modelled in
       colour instead of in mud. This is the same idea as the fleck, applied to value. */
    const _sh = _hash3((x * 4) | 0, (y * 4) | 0, 3) < 0.5 ? '#2b0b52' : '#04324e';
    c = mix(c, _sh, _hash3((x * 4) | 0, (y * 4) | 0, 0) * 0.26 * Math.min(1, d / 0.7));
    /* ⚠ TOO MUCH GOLD. Fred: "fix the light page because it is too yellow." The warm lift was
       running at 0.40 out to 95% of the radius — so the whole bow was being pulled toward one
       hue and the twelve stones underneath it barely got to be their own colours. The light
       still warms what is near it, which is true; it just no longer paints the rim. */
    c = mix(c, '#ffd24a', Math.max(0, 1 - d / 0.62) * 0.30);
    /* ⚠⚠ A COMMON GROUND TONE THROUGH EVERY MARK. Deepening the rim barely moved the page's
       measured chroma (100 against the 70 this page used to sit at) because the pitch is set
       by the whole vivid mid-field, not by its edge — and what had raised it was not the
       palette at all but the new mark structure: the old fat overlapping lozenges averaged
       into each other and cooled themselves, while fine pure marks each keep their own hue.
         The painter's answer to that is not to weaken the colours, it is to run one tone
       through all of them. Every mark takes a little of the plate's own deep violet ground,
       so the wheel stays the book's wheel and the whole thing sits together. */
    /* ⚠⚠ THE COMMON TONE WAS MUTING THE PAGE. Fred: "it looks muted to me." He is right and it
       is exactly what this line does — running every mark 11% toward a light warm neutral is
       the classic way to unify a palette, and unifying a palette IS muting it. It raised the
       key and took the colour out in the same stroke, which is how you get "bright but
       washed".
         To be bright AND saturated you go up the CHROMA axis, not toward cream: each hue
       carried near its own strongest value. So the tone stays only as a whisper (enough to
       keep the wheel hanging together) and the saturation comes back through the punch. */
    c = mix(c, '#ffe6b8', 0.035);
    /* ⚠ AND THE RIM SETTLES SOONER. With the book's spectrum back and the marks now fine and
       pure, the outer field measured chroma 100 against the 70 this page used to sit at — the
       palette matched but the PITCH did not, which is the same complaint in a different form.
       The original deepened hard from d=0.86; this deepens a little earlier and harder, which
       puts the outside back where the book keeps it and gives the heart more to blaze against. */
    c = mix(c, '#4a3a70', Math.max(0, d - 0.88) * 1.1);   // the very edge settles, and no more
    return jig(c, r, 7);
  };
  // the great turning rays now follow a TRUE GOLDEN SPIRAL out from the core —
  // the φ growth-law of galaxies and shells, "divine proportion" (Col 1:17, "by
  // him all things consist"). A little curl keeps the hand in it, not a machine.
  const rayDir = (x, y) => {
    const g = goldenSpiralDir(x, y, CX, CY, 1);            // the golden-spiral flow
    const [c, d] = curlV(x, y, 17, 150);                   // painterly wobble on top
    return Math.atan2(Math.sin(g) + d * 0.32, Math.cos(g) + c * 0.32);
  };
  /* ⚠⚠ AND THE MARK GROWS WITH THE DISTANCE. This was the other half of the pill problem:
     `lw` was 3.4 -> 8 across the whole plate and the background field was a flat 11, so there
     was no SCALE GRADIENT anywhere — and a scale gradient is the first of the four bones this
     book fixes a grade-school plate with (horizon, vanishing point, scale gradient,
     form-following strokes). Near the heart the marks are now nearly hairlines and the light
     is dense and fierce; out at the rim they are broad and open and the deep ground shows
     between them. That gradient alone does most of the work of making a flat wheel read as
     something you are looking INTO. */
  /* One sampler for every pass on this page, and it REJECTS NOTHING. Two reasons:
     · marks are small at the heart and broad at the rim, so the heart needs far more of
       them — a box-uniform scatter gives every part of the plate the same count and leaves
       the middle thin exactly where the light should be fiercest;
     · `strokes()` skips a null sample without consuming that mark's remaining rng draws, so
       any sampler on a BOILED plane that rejects a frame-dependent number of times
       desynchronises the whole sequence. Rejecting nothing makes that impossible to get
       wrong later. Marks that fall outside are simply clipped. */
  const radial = (r0, r1, bias) => r => {
    const u = Math.pow(r(), bias);
    const rad = r0 + (r1 - r0) * u;
    const a = r() * Math.PI * 2;
    return [CX + Math.cos(a) * rad, CY + Math.sin(a) * rad * 0.92];
  };
  const rT = (x, y) => Math.min(1, distC(x, y) / maxR);
  // ⭐ EVERY STROKE DRAWS ITS OWN WIDTH AND LENGTH (Fred: "use no rules") — hashes on
  // position, never on the rng, so every drawing of the ring keeps its sequence
  const free = (x, y, salt) => { const n = Math.sin(x * 12.9898 + y * 78.233 + salt) * 43758.5453; return n - Math.floor(n); };
  const widthOf  = (x, y, salt) => 0.40 + 3.2 * Math.pow(free(x, y, salt), 2.6);
  const lengthOf = (x, y, salt) => 0.40 + 1.5 * Math.pow(free(x, y, salt + 17), 1.5);
  const rLen = (x, y) => (5 + 56 * Math.pow(rT(x, y), 1.30)) * lengthOf(x, y, 11);
  const rLw = (x, y) => (1.0 + 5.5 * Math.pow(rT(x, y), 1.40)) * widthOf(x, y, 13);

  // one independent, bold, GAPPED ray-sheet (its own rng → a separate pass)
  const raySheet = (srng, e) => {
    const sh = [];
    strokes(sh, { n: 0 }, {
      rng: srng, n: e.n,
      sample: radial(CORE * 0.7, maxR, e.bias),   // the core is left to the fg; nothing is rejected
      dir: rayDir,
      col: (x, y, r) => jig(mix(baseCol(x, y, r), '#fffaf0', e.lift), r, 6),
      len: (x, y) => rLen(x, y) * e.lenMul, lw: (x, y) => rLw(x, y) * e.lwMul,
      steps: 5, follow: 0.92, wild: 0.05, lenJ: 0.3, wJ: 0.3, impasto: 0.6, relief: 0.4,
    });
    return sh.join('\n');
  };

  /* ===== BG plane — the deep ground + a smooth broad glory field (opaque) ===== */
  /* ⚠⚠ THE GROUND BETWEEN THE MARKS IS WHAT MAKES A PAGE GLAD OR GRAVE. Fred: "can you make
     them more happy?" — and measured, these two were already the brightest and warmest pages
     in the stretch (light 117 luma / +29 warm against together's 96 / -14). So happiness was
     never going to come from more brightness. What was making it solemn is that every jewel
     sat on a DARK ground: colour on darkness is stained glass at night, majestic and grave.
     The same colours on a light ground are spring. Van Gogh's glad pictures — the orchards,
     the sunflowers — are painted on light.
     ⚠ The chiaroscuro is kept where it actually earns its keep: the narrow COLLAR round the
     heart stays exactly as dark as it was, so the Light still blazes against something. It is
     only the wide outer field that comes up into the air. */
  // ⚠ and the ground the gaps show is a SATURATED light violet, not a greyed one — it is a
  // colour in its own right, so the gaps read as more light rather than as haze.
  out.push(`<rect width="${W}" height="${H}" fill="#8f5fd0"/>`);
  /* ⚠⚠ THE HEART HAS TO BE FILLED BEFORE IT IS PAINTED. Putting a scale gradient on the
     marks made them nearly hairlines at the centre, and spreading the underpainting outward
     to cover the rim left almost none of them there — so the brightest place on the page had
     the least paint on it and the deep ground showed straight through. The white core went
     dark, inside its own heart.
     A source of light is the one thing in this book that may be underpainted smoothly: the
     glow it sheds has no marks in it (prayer's flood does the same). Everything ON it is
     still painted. */
  out.push(`<defs><radialGradient id="lgcore" cx="50%" cy="50%" r="50%">`
    + `<stop offset="0" stop-color="#fffef8"/>`
    + `<stop offset="0.34" stop-color="#fff6d2"/>`
    + `<stop offset="0.62" stop-color="#f6cf72" stop-opacity="0.86"/>`
    + `<stop offset="1" stop-color="#e8a53a" stop-opacity="0"/>`
    + `</radialGradient></defs>`);
  // ⚠ AND THE BLAZE STOPS SHORT OF THE HEART. The hidden heart — "God is Love", half this
  // page's caption — is traced at a radius of about 70, and my first fill reached 139, so it
  // was drawn white on white and vanished. The white now closes inside it, and the heart is a
  // bright line on gold, which is where it can be seen.
  out.push(`<circle cx="${CX}" cy="${CY}" r="${R1(CORE * 1.9)}" fill="url(#lgcore)"/>`);
  counter.n += 2;
  // and a dense pass of real paint over it, so the heart is BRUSHWORK and not a gradient
  strokes(out, counter, {
    rng, n: 1100, sample: radial(0, CORE * 1.5, 0.92),
    dir: rayDir,
    col: (x, y, r) => jig(ramp(['#ffffff', '#fffbe8', '#ffeeb4', '#f6cf72', '#e8a53a'],
      Math.min(1, distC(x, y) / (CORE * 1.5))), r, 5),
    len: 13, lw: 4.6, steps: 2, follow: 0.94, lenJ: 0.55, impasto: 0.5, relief: 0.3,
  });
  /* ⚠⚠ THE GLORY RADIATES. Fred: "for light and come i believe it is simple. create several
     types of the art and animate it. make it alive." On a page whose whole subject is the
     Light, the thing that must move is the light itself — so the broad glory field is drawn
     four times, with a wave of REACH travelling outward through it: every mark grows and
     draws back, and the crest runs from the core to the rim. Light going out, in pulses.
     ⚠⚠ AND THE MARKS DO NOT TRAVEL. I first made them stream outward, on a radial sampler
     that loops exactly — and it worked, and it was wrong, because it repainted the page.
     The old field is BOX-uniform and full of gaps, and those gaps are the deep violet ground
     showing through; they are what the gold reads against. Re-sampling the field radially
     filled them, and a glory with no dark left in it goes milky — the book's first rule
     about light ("bright only reads against dark") broken in the act of animating it.
       So the placement is exactly what it was, down to the rng draw, and what changes
     between drawings is how far each mark REACHES. Nothing moves; the light swells.
     ⚠ This is the only plane that boils here (BOIL_PLANES[26]): light declares SEVEN depth
     planes already, and a boil sibling is another full 6.4 MB plane. One plane, four
     drawings. */
  // two crests standing in the field at any moment, running from the core to the rim
  // ⚠ 0.18, not 0.34. Measured, a third of the mark's length swelling made the four drawings
  // differ on 52% of the plate — an order of magnitude past the pages that read as alive
  // (hands' sky 5.8%, prayer 8-9%, family 5%), and on a field this dense that is a surface
  // boiling, not a light radiating. This plane also carries the engine's own stir on top.
  //   · pulses running OUT from the core, two crests standing in the field at once
  //   · and a slow three-lobed TURN of the whole wheel, one revolution per ring
  // Both are periodic in PH and in the angle, so drawing d flows back into drawing a.
  const reach = (x, y) => {
    const d = distC(x, y) / maxR;
    const a = Math.atan2(y - CY, x - CX);
    return 1 + 0.20 * Math.cos(2 * Math.PI * (2 * d - PH))
             + 0.13 * Math.cos(3 * a - 2 * Math.PI * PH);
  };
  strokes(out, counter, {
    rng, n: 1700, sample: radial(0, maxR, 0.46),   // the underpainting must reach the rim
    dir: rayDir, col: baseCol,
    len: (x, y) => rLen(x, y) * 1.9 * reach(x, y),
    lw: (x, y) => rLw(x, y) * 1.9 * (0.92 + 0.10 * reach(x, y)),
    steps: 4, follow: 0.9, wild: 0.03, lenJ: 0.5, impasto: 0.5, relief: 0.4,
  });

  /* ===== the stacked RAY-SHEETS ===== */
  const sheets = SHEETS.map((e, k) => raySheet(mulberry32(seed + 1009 * (k + 1)), e));

  /* ⚠⚠⚠ THE WHITE PASS — AND WHY IT HAS TO BE ITS OWN PASS. Fred: "incorporate a lot of white
     as well." I first did it inside the colour function, a fifth of every mark set to near
     white, and the page came back measuring UNDER ONE PER CENT white. The reason is
     `STROKE_OPACITY = 0.6`: every field mark GLAZES at sixty per cent, so a "white" mark is
     only ever 60% white over whatever is beneath it and lands around 200, never near white.
     No amount of raising the share inside `col` could have fixed that.
       A highlight is opaque and it goes on LAST — that is what impasto is. So the white is
     its own pass at op 0.95, laid over the whole wallpaper, on the same spiral and the same
     scale gradient as everything else.
     ⚠ A share of them winks with the ring, and the switch is inside `col`, not the sampler:
     a mark that is "off" this drawing paints the field colour underneath instead of white.
     Rejecting it in `sample` would change how many rng draws the pass makes and desynchronise
     every mark after it (see the note on frame-dependent samplers above). Both branches draw
     exactly one r() and call jig once, so the stream is identical whatever the frame. */
  /* ⚠⚠ AND IT GOES ON AFTER THE SHEETS. First cut pushed these marks into `out`, which the
     assembly concatenates BEFORE the five ray-sheets — so every white highlight was then
     glazed over five times at 0.6 and the plate still measured 0.6% white. A highlight laid
     under the painting is not a highlight. Its own array, concatenated last. */
  const white = [];
  strokes(white, counter, {
    // ⚠ 1900, not 3000: a translucent veil laid over EVERYTHING washes the colour out of it
    // (chroma fell 89 -> 73 and the page went milky, which is the "muted" fault again in a
    // new costume). A veil is a thing light does in one part of a picture, not a coat of size.
    rng, n: 1900, sample: radial(0, maxR, 0.60),
    dir: rayDir,
    col: (x, y, r) => {
      const t = r();                                    // drawn on both branches
      const wx = (x * 4) | 0, wy = (y * 4) | 0;
      const dd = distC(x, y) / maxR;
      const inCollar = dd > 0.20 && dd < 0.34 ? 0.3 : 1;   // the ring round the heart keeps its dark
      // ⚠ and it gathers toward the light, as a veil of light actually does
      const near = Math.max(0, 1 - dd / 0.85);
      const on = _hash3(wx, wy, 7) < (0.22 + 0.55 * near) * inCollar
              || _hash3(wx, wy, _FR + 11) < (0.10 + 0.26 * near) * inCollar;
      return on ? jig(ramp(['#ffffff', '#fffdf4', '#fff4d8'], t), r, 3) : baseCol(x, y, r);
    },
    /* ⚠⚠ AND THE WHITE IS TRANSPARENT. Fred: "make the white 'transparent'". At op 0.95 these
       were opaque dabs sitting ON the picture — white confetti. Many more of them at a third
       the opacity is a different substance entirely: they overlap into a VEIL, the colour
       still shows through every one, and where several cross it goes properly bright. That is
       what light on a surface looks like, and it is why glazing exists.
       ⚠ It needs the count to rise as the opacity falls or the white simply disappears — the
       veil is built out of overlaps, not out of marks. */
    len: (x, y) => rLen(x, y) * 0.95, lw: (x, y) => rLw(x, y) * 0.80,
    steps: 3, follow: 0.9, wild: 0.05, lenJ: 0.6, impasto: 0.5, relief: 0.55, op: 0.34,
  });

  /* ===== FG plane — the rings, the blazing core, the sunburst, the hidden heart ===== */
  const fg = [];
  // KLIMT GOLD — a gilded glory-halo of concentric rings + gold dots round the
  // Light (gold = the throne, 2 Chr 9:17; the holy place of pure gold)
  klimtGold(fg, { n: 0 }, rng, CX, CY, CORE + 10, 168, { rings: 6, opacity: 0.46 });
  // concentric ray-swirl rings hugging the core
  strokes(fg, { n: 0 }, {
    rng, n: 520,
    sample: r => { const a = r() * Math.PI * 2, d = CORE + 4 + Math.pow(r(), 0.9) * 96; return [CX + Math.cos(a) * d, CY + Math.sin(a) * d * 1.02]; },
    dir: (x, y) => Math.atan2(y - CY, x - CX) + Math.PI / 2 + 0.12,
    col: (x, y, r) => jig(ramp([GOLD_HOT, GOLD_PALE, GOLD, '#f4cf86'], (distC(x, y) - CORE) / 100), r, 7),
    len: 16, lw: 2.8, steps: 3, follow: 0.96, impasto: 0.4,
  });
  // EASTER EGG — the HEART in the innermost ring (God is Love, hidden in the Light)
  {
    const pts = [];
    for (let t = 0; t <= Math.PI * 2 + 0.01; t += 0.16) {
      const hx = 16 * Math.pow(Math.sin(t), 3);
      const hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
      pts.push([CX + hx * 4.2, CY + hy * 4.2 - 6]);
    }
    // ⚠ drawn TWICE — a deep gold edge under a bright line. A single pale stroke disappears
    // wherever the glory happens to be pale, and this is the one shape on the page a reader
    // is meant to find for themselves; it has to survive whatever it crosses. (The Name below
    // is drawn the same way, and for the same reason.)
    paintPath(fg, { n: 0 }, rng, pts, (x, y, r) => jig(mix('#7a4e0e', '#c08a24', r() * 0.6), r, 5),
      { lw: 5.4, len: 7, density: 0.92, jitter: 1.4 });
    paintPath(fg, { n: 0 }, rng, pts, (x, y, r) => jig(mix('#fffdf0', GOLD_PALE, r() * 0.5), r, 5),
      { lw: 2.8, len: 7, density: 0.9, jitter: 1.4 });
    /* ⚠⚠ AND THE HEART GLOWS. Fred: "make the heart in light glow." Not with a CSS halo — his
       standing rule is that a glow div is not paint and did not come out of the picture. This
       is DRAWN: a corona of small warm marks pushed outward off the heart's own outline, with
       a crest travelling round it so the radiance runs around the shape rather than pulsing
       all at once. Over the four drawings of this plane it breathes.
       ⚠ The reach is keyed on the point's INDEX around the outline, so the wave travels the
       heart's own perimeter — which is what makes it read as the heart giving light off,
       rather than as a ring expanding near it. */
    {
      const hRng = mulberry32(seed ^ 0x4e27);
      const HC = [CX, CY - 6];
      strokes(fg, { n: 0 }, {
        rng: hRng, n: 460,
        sample: r => {
          const k = Math.floor(r() * (pts.length - 1));
          const p = pts[k];
          const wave = 0.5 + 0.5 * Math.cos(2 * Math.PI * (PH - k / pts.length));
          let nx = p[0] - HC[0], ny = p[1] - HC[1];
          const nl = Math.hypot(nx, ny) || 1;
          const off = 2 + Math.pow(r(), 0.75) * (9 + 26 * wave);
          return [p[0] + (nx / nl) * off + (r() - 0.5) * 3,
                  p[1] + (ny / nl) * off + (r() - 0.5) * 3];
        },
        dir: (x, y) => Math.atan2(y - HC[1], x - HC[0]),
        col: (x, y, r) => {
          const f = Math.min(1, Math.hypot(x - HC[0], y - HC[1]) / 118);
          return jig(ramp(['#ffffff', '#fff8e0', '#ffe3a2', '#f0b840', '#c98a2e'], f), r, 5);
        },
        len: 7, lw: 2.0, steps: 2, lenJ: 0.7, relief: 0, impasto: 0.35, op: 0.5,
      });
    }
  }
  // EASTER EGG — HIS NAME, hidden in the light: ישוע (Yeshua, "Jesus"), the
  // Aramaic/Hebrew square script of the tongue He spoke, brushed faintly into the
  // gold rays just below the core. Yeshua means "he shall save" — "thou shalt call
  // his name JESUS: for he shall save his people from their sins" (Matt 1:21); a
  // name above every name (Phil 2:9). This is the page where He has a Name.
  // Hebrew is read RIGHT→LEFT, so on the canvas the letters run (left→right):
  // Ayin, Vav, Shin, Yod  ←  reading back: Yod-Shin-Vav-Ayin = Yeshua.
  {
    // each letter: arc-length offset `s` (left→right along the ring), width `w`,
    // and polylines in its own cell (nx 0→1 left→right, ny 0 top→1 bottom).
    const LETTERS = [
      { w: 26, polys: [                          // ע  Ayin
        [[0.10, 0.06], [0.50, 0.52]],
        [[0.90, 0.04], [0.50, 0.50], [0.58, 0.96]],
      ] },
      { w: 12, polys: [                          // ו  Vav
        [[0.30, 0.05], [0.78, 0.08]],
        [[0.60, 0.05], [0.57, 0.96]],
      ] },
      { w: 30, polys: [                          // ש  Shin
        [[0.06, 0.08], [0.18, 0.64]],
        [[0.46, 0.16], [0.42, 0.58]],
        [[0.94, 0.05], [0.80, 0.52]],
        [[0.18, 0.64], [0.50, 0.78], [0.80, 0.52]],
      ] },
      { w: 14, polys: [                          // י  Yod
        [[0.40, 0.05], [0.66, 0.14], [0.54, 0.40]],
      ] },
    ];
    // The name rides an ARC along a RING of the glory, centred under the core —
    // written INTO the light, and kept near the centre so the mobile portrait crop
    // still shows it. Letter tops point toward the core (upright at the ring's foot).
    // Drawn as an EMBOSS — a deep bronze body INCISED into the paint with a thin pale
    // highlight catching the cut — so it reads on any hue; ישוע, a fourth-look whisper.
    const GAP = 7, RTOP = 172, GH = 30;
    let total = -GAP; for (const L of LETTERS) total += L.w + GAP;   // arc-length of the word
    const aStart = -(total / RTOP) / 2;                              // centre on a=0 (straight down)
    const ptsStr = (poly, s, L, dr, da) => poly.map(([nx, ny]) => {
      const a = aStart + (s + nx * L.w) / RTOP + da;
      const R = RTOP + ny * GH + dr;
      return `${(CX + R * Math.sin(a)).toFixed(1)},${(CY + R * Math.cos(a)).toFixed(1)}`;
    }).join(' ');
    let s = 0;
    for (const L of LETTERS) {
      for (const poly of L.polys) {
        fg.push(`<polyline points="${ptsStr(poly, s, L, 1.6, 0.006)}" fill="none" stroke="#34230a" stroke-width="5.4" stroke-linecap="round" stroke-linejoin="round" opacity="0.82"/>`);
        fg.push(`<polyline points="${ptsStr(poly, s, L, -1.2, -0.004)}" fill="none" stroke="#fff7d6" stroke-width="2.0" stroke-linecap="round" stroke-linejoin="round" opacity="0.72"/>`);
      }
      s += L.w + GAP;
    }
  }
  // THE BLAZING CORE — white-gold, the brightest thing
  strokes(fg, { n: 0 }, {
    rng, n: 420,
    sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 0.72) * CORE; return [CX + Math.cos(a) * d, CY + Math.sin(a) * d]; },
    dir: (x, y) => Math.atan2(y - CY, x - CX) + Math.PI / 2,
    col: (x, y, r) => jig(ramp(['#ffffff', '#fffdf0', GOLD_HOT, GOLD_PALE, GOLD], distC(x, y) / CORE), r, 5),
    len: 12, lw: 3.2, steps: 2, wJ: 0.5, lenJ: 0.5, impasto: 0.55,
  });
  // a final white sunburst at the very centre — no darkness at all
  strokes(fg, { n: 0 }, {
    rng, n: 120,
    sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 1.2) * CORE * 0.5; return [CX + Math.cos(a) * d, CY + Math.sin(a) * d]; },
    dir: (x, y) => Math.atan2(y - CY, x - CX),
    col: (x, y, r) => jig('#ffffff', r, 4),
    len: 9, lw: 2.0, steps: 2, relief: 0,
  });
  // LEGIBLE GOLD SPARKS flung out through the rings — the Light catching like gold leaf
  goldSparks(fg, { n: 0 }, rng, CX, CY, CORE + 16, 210, 150, { squash: 1.02, big: 1.15 });

  E.setManifold(_M0);
  /* ⚠ GRADIENT WASHES. Fred: "can you make use of shadows and gradients and all that?" These
     are the two an oil painter actually uses on a picture like this: a broad warm GLAZE
     spreading out of the light (so the middle of the page has air in it, not just marks), and
     a soft deepening at the very edge that lets the whole thing sit back. Both are laid over
     the finished painting and under the white veil, which is where a glaze belongs. */
  const wash = [];
  wash.push('<defs>'
    + '<radialGradient id="lgwarm" cx="50%" cy="50%" r="50%">'
    + '<stop offset="0" stop-color="#ffeab0" stop-opacity="0.30"/>'
    + '<stop offset="0.5" stop-color="#ffc978" stop-opacity="0.15"/>'
    + '<stop offset="1" stop-color="#ffc978" stop-opacity="0"/></radialGradient>'
    + '<radialGradient id="lgvig" cx="50%" cy="50%" r="50%">'
    + '<stop offset="0.58" stop-color="#2c1e4c" stop-opacity="0"/>'
    + '<stop offset="1" stop-color="#2c1e4c" stop-opacity="0.30"/></radialGradient>'
    + '</defs>');
  wash.push(`<circle cx="${CX}" cy="${CY}" r="${R1(maxR * 0.66)}" fill="url(#lgwarm)"/>`);
  wash.push(`<rect x="-20" y="-20" width="${W + 40}" height="${H + 40}" fill="url(#lgvig)"/>`);
  counter.n += 3;

  /* ---------------- assembly ---------------- */
  const ALT = 'A great radiant Light fills the whole frame: a blazing white-gold core, concentric Van Gogh ray-swirls turning outward into every colour at the rim, and a quiet heart traced in the innermost ring. No figure — this is the Light Himself. God is light, and in him is no darkness at all; and God is love.';
  const RAW = { undercoat: 0, weave: 0, varnish: 0, oil: 0 };
  if (LAYER === 'bg') return svgWrap(ALT, out.concat(sheets, wash, white).join('\n'), RAW);   // the whole wallpaper (opaque)
  if (LAYER === 'fg') return svgWrap(ALT, '<g>' + fg.join('\n') + '</g>', RAW);   // rings + core + heart
  // full painting (desktop): ground, the stacked ray-sheets, then the core + heart
  return svgWrap(ALT, out.concat(sheets, wash, white, '<g>' + fg.join('\n') + '</g>').join('\n'));
}
