// gen/plates/nonight.mjs — "No more night" (the New Jerusalem)
//
// The CONSUMMATION. The destination of the whole book. The Father's house of
// the door-page has GROWN into a radiant CITY of pure gold on a hill — many
// glowing homes and towers — and at its heart burns the LAMB-LIGHT, so great
// that there is no sun and no candle in the sky, and NO SHADOW anywhere. This
// is the one page in the book with no dark at all: it is ALL light.
//
//   "And there shall be no night there; and they need no candle, neither light
//    of the sun; for the Lord God giveth them light."          — Rev 22:5
//   "And God shall wipe away all tears from their eyes."        — Rev 21:4
//   "And the city had no need of the sun... for the glory of God did lighten
//    it, and the Lamb is the light thereof."                    — Rev 21:23
//
// A bright RIVER OF LIFE flows down out of the City (Rev 22:1, "a pure river of
// water of life, clear as crystal, proceeding out of the throne"); fruit trees
// of life line it (Rev 22:2). Tiny redeemed figures walk in the light with
// their faces lifted — and among them one small RED child, "you," home at last.
// Maximum radiance: gold, white, warm pastels. No black, no grey, no shadow.

export const name = 'nonight';
export const title = 'No more night';
export const caption = 'And there shall be no night there.';
export const seed = 22050405;          // Rev 22:5
export const focal = { x: 400, y: 250 }; // the City of gold on its hill, the Lamb-light at its heart
// MOBILE 3D — depth planes (FAR→NEAR), composite-once multiplane: the radiant
// SKY (glory + Lamb-light streaming down) is the opaque backmost ground; the
// CITY of gold towers on the hill sits far; the RIVER OF LIFE + the trees of
// life + the meadow + wildflowers ride the mid ground (planted, so they move
// with the hill they grow on); the REDEEMED figures (incl. the red child) lead
// nearest. Desktop/`full` is byte-identical to the original single-layer paint.
export const layers = [
  { name: 'sky', opaque: true },  // pure radiance: glory sky + streaming light + Lamb-light heart (backmost, opaque)
  /* ⚠⚠ THE NEW JERUSALEM WAS 60% TRANSPARENT (Sep 21). build.mjs gives any plane NAMED `far` or
     `hills` an opacity of 0.6 — aerial haze, right for distant hills — and this plane is named
     `far`. So the destination of the whole book was exported see-through: max alpha 153/255,
     the sky's brushstrokes visible THROUGH the walls of the City, on the one page that exists to
     show it. `ran` already overrides this for the same building ("op↑ so the solid castle isn't
     see-through"); this page never did. "The city had no need of the sun… for the glory of God
     did lighten it" (Rev 21:23) — it is the most solid thing in the book, not a mirage. */
  { name: 'far', op: 0.97 },      // the City of pure gold — towers, homes, gate, glory-halo
  { name: 'mid' },                // the river of life, trees of life, meadow, wildflowers (planted)
  { name: 'fg' },                 // the redeemed walking in the light, and the red child — home at last
];

export function paint(E, opts = {}) {
  const {
    mulberry32, fbm, curlV, goldenSpiralV, mix, ramp, jig, strokes, rej,
    paintFigure, paintPath, waterCourse, inCap, underpaintCapsules, paintChild, personCaps, lightRadial,
    svgWrap, R1, W, H,
    GOLD, GOLD_PALE, GOLD_DEEP, GOLD_HOT,
  } = E;

  const rng = mulberry32(seed);
  const out = [];
  const counter = { n: 0 };
  // MOBILE 3D LAYERS: everything draws once, in order; we record which out[]
  // index ranges belong to the FAR (City) and FG (figures) bands. Whatever is
  // not tagged and sits after skyEnd falls to the MID plane (river/trees/ground).
  const LAYER = opts.layer || 'full';
  const farRanges = [], fgRanges = [];

  // The ground is already light — a warm pale gold, NEVER dark. Every gap that
  // shows through the strokes glows; there is no night to leak between them.
  out.push(`<rect width="${W}" height="${H}" fill="#fbe9b0"/>`);

  /* ---------------- geometry ---------------- */
  const horizon = 280;                       // the city sits on a hill above this
  // SCALE GRADIENT — a mark at your feet is far bigger than a mark at the horizon.
  // Drawn all one size, ground reads as a flat green shape however good the colour
  // is; sized by depth it reads as ground going away from you.
  const dS = y => 0.32 + 1.0 * Math.max(0, Math.min(1, (y - horizon) / (H - horizon)));
  const cityX = 400, cityHeart = 132;        // the LAMB-LIGHT, high over the City (so the towers read below it)
  // the Lamb-light fills everything — a very wide reach so NO corner is dark
  const glory = lightRadial(cityX, cityHeart, 600);
  /* ⭐⭐ AND THE RADIANCE BREATHES. Fred: "lets animate candle comes and nonight."
     ⚠⚠ A displacement boil on its own was not enough — measured against the pages already
     approved (`light`, `prayer`, `together` hold 4-11 points of difference between drawings
     at 40px; this page collapsed to 1.1), all the change was per-mark jitter with nothing
     large enough to see. So the glory is DRAWN reaching differently in each drawing: a slow
     swell running out from the Lamb-light, the strokes lengthening and brightening as it
     passes. Same device as `comes` next door, and deliberately so — both pages are about
     light pouring from a source — but aimed at the opposite feeling: there the heavens are
     being torn open and the crest is fast and strong; here it is 40% of that on twice the
     clock, because "there shall be no night there" is peace, and eternity must not look
     nervous. One wind per page, and this page's wind is a long breath. */
  const _FN = Math.max(1, globalThis.__FRAME_N || 1);
  const _FR = (globalThis.__FRAME || 0) % _FN;
  const PH = _FN > 1 ? _FR / _FN : 0;
  const TAU = Math.PI * 2;
  const breath = (x, y) => 1 + 0.16 * Math.cos(TAU * (PH - Math.hypot(x - cityX, y - cityHeart) / 640));   // ⚠ NOT `swell` — that name is already the roll of the LAND further down
  /* ⚠⚠⚠ "NO MORE NIGHT" IS NOT "NO MORE SHADOW". Fred: "comes and nonight are a mess. redraw
     these 2 from scratch. this is the ending of the book... it has to be good." On this page
     the fault was one number: a light FLOOR of 0.5, so the whole plate sat between half-lit
     and fully lit — a fifty-point value range across an entire painting. Nothing could read,
     least of all the City, because nothing had anything to be brighter than.
       Rev 22:5 says there is no NIGHT there; it does not say there is no form. A world with
     no shadow anywhere has no shape, and the verse's own logic runs the other way — "they
     need no candle, neither light of the sun; for the Lord God giveth them light" (Rev 22:5),
     "and the Lamb is the light thereof" (Rev 21:23). If the City IS the light, then the light
     must fall off from the City; that falloff is the picture. The darkest note on the page is
     now a warm amber you could read a book by — never a night, and never flat. */
  const lightAt = (x, y) => Math.min(1, 0.24 + glory(x, y) * 0.80);

  // the hill the City crowns — a gentle rise of living gold
  /* ⚠⚠ A HORIZON PARALLEL TO THE FRAME IS THE FLATTENING FAULT. This one wandered by six
     units over eight hundred — a ruled line in all but name, with the meadow, the children
     and the sky stacked above and below it in bands. A hill is not a level: it CROWNS under
     the thing it carries and FALLS AWAY, and it does not fall away the same on both sides.
     The crown stays at the City's own base (y≈280 — `cityBaseY` is fixed, so raising the brow
     above it would bury the gate in grass), the west stays high, and the land drops east into
     the valley the river runs off through, which is also where the tree of life stands over
     us. Asymmetry costs nothing and it is most of what tells the eye this is a place. */
  const hillTop = x => 284 + 34 * (1 - Math.exp(-Math.pow((x - 400) / 330, 2)))
                     - 8 * Math.sin(x / 200 + 0.6) + 20 * (x - 400) / 400;
  // every mark's lit edge points at the Lamb-light, so the whole page is modelled by one source
  E.setReliefLight({ x: cityX, y: cityHeart });

  // DRIFTING HUE (← gift/ran/risen, verbatim). Value stays where it is and the HUE moves in
  // slow fields, which is what keeps a green field from being one green. ⚠ It has to stay a
  // TIGHT WARM range — noisy hue is not varied hue; cold specks scattered through a warm
  // field fragment the surface and the eye stops reading it as one thing.
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
  const HUES = [0.16, 0.11, 0.09, 0.22, 0.14, 0.28, 0.13, 0.06, 0.19];   // olive→gold→green: the City's own warm band
  const chroma = (c, x, y, k, sd = 211) => {
    const f = fbm(x / 155, y / 135, sd);
    const HH = HUES[Math.min(HUES.length - 1, Math.floor(f * HUES.length * 1.25))];
    const rgb = HEXN(c);
    let [h, sa, l] = toHSL(rgb[0], rgb[1], rgb[2]);
    let d = HH - h; if (d > 0.5) d -= 1; if (d < -0.5) d += 1;
    const kk = k * (0.6 + fbm(x / 62, y / 58, sd + 3) * 0.75);
    h = (h + d * kk + 1) % 1;
    sa = Math.min(0.62, sa + kk * 0.5 * (1 - Math.abs(l - 0.55) * 1.5));
    const o = toRGB(h, sa, l);
    return HEXS(o[0], o[1], o[2]);
  };

  /* ---------------- 1. THE SKY — pure radiance, no sun, no candle (Rev 22:5) ----------------
     not a dawn but a glory: light pouring DOWN and OUT from the City's heart.
     A luminous gradient underpaints it so every gap is gold-white — there is
     no night to show through. The sky is nature, so it gently turns (Munch),
     but it is GLORY, not storm: the eddies all wheel out from the Lamb-light. */
  out.push(`<defs><radialGradient id="glory13" cx="0.5" cy="0.40" r="0.92">
<stop offset="0" stop-color="#fffdf2"/>
<stop offset="0.34" stop-color="#fff3cf"/>
<stop offset="0.62" stop-color="#ffe7ab"/>
<stop offset="0.85" stop-color="#fbdc92"/>
<stop offset="1" stop-color="#f6cf86"/>
</radialGradient></defs>`);
  out.push(`<rect x="-12" y="-12" width="${W + 24}" height="${horizon + 80}" fill="url(#glory13)"/>`);   // ⚠ +80, not +18: the brow now falls to y≈338 in the east
  counter.n++;
  // THE ALIVE GLORY (the fractal sky — motion at three scales): the whole radiance
  // WHEELS in ONE great golden spiral centred on the Lamb-light (macro), a few
  // eddies turn inside the wheel (mid), and every stroke curves with its parent
  // current (micro). Starry-Night law on a page of pure day: RADIANCE AND SWIRL —
  // the light still streams straight OUT from the heart (Rev 22:5, "the Lord God
  // giveth them light"), but now it wheels as it pours, swirls within swirls.
  const EDDIES = [[150, 78, -60], [654, 92, 58], [78, 150, 50], [726, 158, -46]];   // 3-4 mid eddies, alternating, spread across the glory
  const skyDir = (x, y) => {
    // the light still streams radially OUTWARD from the heart (glory pouring out)
    let vx = (x - cityX) * 0.16, vy = (y - cityHeart) * 0.16 - 8;
    // 1 · MACRO — ONE great wheel of glory, centred on the Lamb-light, turning the whole sky
    { const [a, b] = goldenSpiralV(x, y, cityX, cityHeart, 110, 260); vx += a; vy += b; }
    // 2 · MID — a few eddies turning inside the wheel
    for (const [ex, ey, s] of EDDIES) { const [a, b] = goldenSpiralV(x, y, ex, ey, s, 80); vx += a; vy += b; }
    // 3 · MICRO — fine turbulence so every stroke curves with its parent current
    const [c, d] = curlV(x, y, 31, 120); vx += c * 26; vy += d * 26;
    return Math.atan2(vy, vx);
  };
  // jewel eddy-glows — deep warm-gold / rose tints of THIS radiant palette, breathing
  // faint colour at each eddy core (the alive richness, subtle on the bright ground)
  const EGLOW = [[150, 78, '#f6c86a'], [654, 92, '#f2a4b4'], [78, 150, '#f3b674'], [726, 158, '#efb89a']];
  const skyCol = (x, y, r, lift) => {
    // all warm light — white-gold at the crown over the City, deepening only to a
    // rich honey gold at the far frame (never blue, never dark)
    const d = Math.hypot(x - cityX, (y - cityHeart) * 1.1) / 360;
    // ⚠ and a ramp with somewhere to GO. The old one ran #fffef6 -> #f4ce82: every colour in
    // the sky within fifty points of white, which is why the City had no sky to stand against.
    let c = ramp(['#fffef6', '#fff3cc', '#ffe19a', '#f5c169', '#e09a52', '#c87a4e'],
      Math.min(1, d * 0.98 + fbm(x / 130, y / 120, 13) * 0.22));
    for (const [ex, ey, ec] of EGLOW) { const d2 = Math.hypot(x - ex, y - ey); c = mix(c, ec, Math.exp(-d2 / 95) * 0.42); }   // the eddy cores breathe faint jewel warmth
    c = mix(c, '#fffdf4', glory(x, y) * 0.55);
    if (lift) c = mix(c, '#ffffff', lift);
    return jig(c, r, 5);
  };
  // ⭐ DETAIL PASS (Sep 8) — the SKY only (the hill, the City and the tree of life stay).
  // EVERY STROKE DRAWS ITS OWN WIDTH AND LENGTH (Fred: "use no rules") — hashes on position,
  // never the rng, so the second drawing keeps its sequence; the `breath` crest still rides.
  const free = (x, y, salt) => { const n = Math.sin(x * 12.9898 + y * 78.233 + salt) * 43758.5453; return n - Math.floor(n); };
  const widthOf  = (x, y, salt) => 0.40 + 3.2 * Math.pow(free(x, y, salt), 2.6);
  const lengthOf = (x, y, salt) => 0.40 + 1.5 * Math.pow(free(x, y, salt + 17), 1.5);
  // the deep flowing glory — long streaming strokes that FOLLOW the great wheel
  strokes(out, counter, {
    rng, n: 1800,
    sample: rej(-12, -12, 812, horizon + 72, (x, y) => y < hillTop(x) + 10),
    dir: skyDir,
    col: (x, y, r) => mix(skyCol(x, y, r, 0), '#fffbe4', Math.max(0, breath(x, y) - 1) * 1.4),   // the crest carries the light with it
    len: (x, y) => 40 * breath(x, y) * lengthOf(x, y, 11), lw: (x, y) => 4.4 * (0.75 + 0.25 * breath(x, y)) * widthOf(x, y, 13), steps: 4, follow: 0.91, wild: 0.05, lenJ: 0.3, wJ: 0.3, impasto: 0.5, relief: 0.4,
  });
  // VAN GOGH ARMS — streaming glory: long curling filaments of light pouring out
  strokes(out, counter, {
    rng, n: 600,
    sample: rej(-12, -12, 812, horizon + 66, (x, y) => y < hillTop(x) + 4),
    dir: skyDir,
    col: (x, y, r) => jig(mix(skyCol(x, y, r, 0), '#fffef0', Math.min(0.9, 0.25 + glory(x, y) * 0.9)), r, 5),
    len: (x, y) => 44 * breath(x, y) * lengthOf(x, y, 21), lw: (x, y) => 1.4 * widthOf(x, y, 23), steps: 6, follow: 0.96, wild: 0.03, lenJ: 0.3, wJ: 0.3, impasto: 0.4, relief: 0,
  });
  // bright cloud-ribbon crests catching the glory
  strokes(out, counter, {
    rng, n: 500,
    sample: rej(-12, -12, 812, horizon + 64, (x, y) => y < hillTop(x) + 2),
    dir: skyDir,
    col: (x, y, r) => {
      const k = fbm(x / 100, y / 100, 19) + (r() - 0.5) * 0.2;
      if (k > 0.64) return jig('#fffef6', r, 6);
      return skyCol(x, y, r, 0.06);
    },
    len: (x, y) => 20 * lengthOf(x, y, 31), lw: (x, y) => 2.8 * widthOf(x, y, 33), steps: 5, follow: 0.9, wild: 0.1, lenJ: 0.3, wJ: 0.3, impasto: 0.6, relief: 0.35,
  });
  const skyEnd = out.length;   // the radiant sky is the SKY plane (opaque backmost)

  /* ---------------- 2. THE HILL — living gold, the garden-city ground ---------------- */
  // flourishing gold-green meadow, all of it lit (no shadowed grass anywhere)
  /* ⚠ THE SAME FAULT AS THE SKY, AND ONE MORE. Every colour here sat between luma 200 and
     245 — a meadow with a forty-five point range, which is a flat sheet of yellow however
     many marks you put on it. And the depth term ran the WRONG WAY (`+ depth * 0.34` made the
     grass at the reader's feet the PALEST thing on the page): near ground is richer and
     deeper, far ground washes toward the light. Reversed, and given real green to be a
     meadow with — Isa 35:1, the desert rejoicing and blossoming. Still no night anywhere; the
     deepest note is a full green you could lie down in. */
  // ⚠ gold-green, not lawn-green: this is a meadow in a city of gold, and the first cut came
  // out drab olive. The value range is what was missing, not the hue.
  /* ⚠⚠ AND IT WAS TOO YELLOW TO STAND ANYONE ON. Fred: "the one with yellow hoodie is
     camouflaging." He is right and it is a real fault, not a taste: a yellow-robed child on a
     yellow-gold meadow has no silhouette, and a page whose subject is PEOPLE arriving home
     cannot hide them in its own ground. The meadow keeps its warmth toward the City but it is
     GREEN where the people stand — living grass, which is also what a meadow is. */
  /* ⚠⚠⚠ "RIGHT NOW IT IS LIKE A KID'S DRAWING." Fred, on this page and `comes`: "fix both
     page's landscape and details... use the pages we work on as guide. i like the details in
     gift." That is a measurable complaint, not a mood. This meadow was ONE pass of 1500
     strokes over a plain 220 units deep and 800 wide — about one mark per 120 square units —
     laid flat over a flat fill, with 340 evenly-scattered dots for flowers. `gift`'s field,
     the one he loves, is ~13,000 marks in FOUR layers over ground that ROLLS, plus tufts,
     plus flowers in COLONIES. So the whole green-world recipe is applied here entire:
       1 · FORM FIRST. Detail cannot substitute for shape — the land swells, and the value
           follows which way each slope faces the Lamb-light.
       2 · FOUR LAYERS, not one: the body of the sward, blades standing out of it, a fine nap
           in front, and ~120 tufts, because grass grows in clumps.
       3 · SHADOW IS FEWER MARKS OVER DARK GROUND, not darker marks. The hollows are laid
           first and every later pass is REJECTED in them, so the dark survives; and the base
           fill is darkened, because it is the floor the passes never quite cover.
       4 · FLOWERS IN COLONIES — each patch one family of one colour, each bloom a stem and
           petals and a face. Scattered dots are sprinkles, and they read as the loudest thing
           on the plain. (Isa 35:1; Song 2:12.) */
  const swell = (x, y) => fbm(x / 168, y / 76, 313);
  const facing = (x, y) => {
    const e = 7;
    return (swell(x - e, y) - swell(x + e, y)) * 2.2 + (swell(x, y - e) - swell(x, y + e)) * 1.2;
  };
  const clump = (x, y) => fbm(x / 26, y / 17, 331);      // tuft-scale: crests and hollows, not noise
  const haze = (x, y) => Math.max(0, Math.min(1, 1 - (y - horizon) / 74));   // the far field loses itself in the City's light
  /* ⭐ THE NEAR BANK. One evenly-lit green from the brow to the bottom edge is a band, and a
     band is what a child draws. Every landscape that reads as deep has three VALUE zones —
     a shadowed foreground you look over, a lit middle where the story is, and a luminous
     distance. This is the first of them: a broad rise whose near slope tips away from the
     Lamb-light and so falls into half-light. Its crest wanders, so it is a fold of ground and
     never a stripe. */
  const brow2 = x => 412 + 30 * Math.sin(x / 300 + 0.7) + (fbm(x / 110, 1.7, 401) - 0.5) * 52;
  const nearFall = (x, y) => Math.max(0, Math.min(1, (y - brow2(x)) / 70));
  const GROUND = ['#2c5620', '#3f6b28', '#568434', '#71a03e', '#98bb55', '#c6d182'];
  // the meadow's top edge follows the brow of the hill, sampled fine enough to keep the jag —
  // grass has no outline, it has blades, and horizonFringe stands real tufts off it below.
  {
    const brow = x => hillTop(x) + (fbm(x / 3.3, 5.1, 341) - 0.5) * 5 - Math.max(0, fbm(x / 8.5, 9.4, 345) - 0.54) * 16;
    let d = `M-2 ${R1(brow(-2))}`;
    for (let x = 1; x <= 802; x += 3) d += `L${R1(x)} ${R1(brow(x))}`;
    d += `L802 ${H + 2}L-2 ${H + 2}Z`;
    // ⚠ DARK FLOOR. A hollow can only be dark if what shows BETWEEN the marks is darker than
    // the marks. The old fill was a flat mid-green at the same value as every stroke over it,
    // which is why more marks only ever made a thicker mat.
    out.push(`<path d="${d}" fill="#3b5a24"/>`); counter.n++;
  }
  const grassCol = (x, y, r, lift) => {
    const depth = Math.max(0, Math.min(1, (y - horizon) / (H - horizon)));
    const cl = clump(x, y);
    let c = ramp(GROUND,
      0.10 + fbm(x / 48, y / 31, 37) * 0.34 + (1 - depth) * 0.30 + facing(x, y) * 0.55
      + swell(x, y) * 0.18 + (cl - 0.5) * 0.6 + lift - nearFall(x, y) * 0.44);
    const g = glory(x, y);
    // broken colour in the shade: away from the Lamb-light each mark keeps its own hue
    const sh = 1 - g;
    if (sh > 0.34 && r() < 0.2 + sh * 0.34) c = mix(c, chroma('#3a5a34', x, y, 0.45, 197), 0.2 + sh * 0.3);
    c = mix(c, '#fff6da', g * 0.34);                       // and gold pools under the City
    c = mix(c, '#efe6bc', haze(x, y) * 0.5);               // the brow dissolves into its own light
    // away from the City to left and right, deeper still — the corner the poem sits in
    c = mix(c, '#4c5f26', Math.min(1, Math.abs(x - cityX) / 430) * (0.16 + depth * 0.30));
    c = mix(c, '#2e4a22', nearFall(x, y) * 0.42);          // the near slope, turned away from the light
    return jig(chroma(c, x, y, 0.26, 211), r, 10);
  };
  strokes(out, counter, {                                  // 1 · the lie of the land, broad
    rng, n: 1600,
    sample: rej(-10, horizon - 20, 810, 510, (x, y) => y > hillTop(x) - 1),
    dir: (x, y) => { const [vx, vy] = curlV(x, y, 150, 66); return Math.atan2(vy * 0.85 - 0.12, Math.abs(vx) + 0.7); },
    col: (x, y, r) => grassCol(x, y, r, 0),
    len: (x, y) => 12 * dS(y), lw: (x, y) => 3.4 * dS(y), steps: 3, lenJ: 0.5, impasto: 0.45, relief: 0.35,
  });
  strokes(out, counter, {                                  // 2 · the body of the sward (skips the hollows)
    rng, n: 4200,
    sample: rej(-10, horizon - 14, 810, 512, (x, y) => y > hillTop(x) - 1 && clump(x, y) > 0.4),
    dir: (x, y) => -Math.PI / 2 + (fbm(x / 30, y / 20, 97) - 0.5) * 0.7,
    col: (x, y, r) => grassCol(x, y, r, 0.06),
    len: (x, y) => 7 * dS(y), lw: (x, y) => 1.9 * dS(y), steps: 2, lenJ: 0.7, impasto: 0.5, relief: 0.3,
  });
  strokes(out, counter, {                                  // 3 · blades that STAND UP out of it
    rng, n: 3000,
    sample: rej(-10, horizon - 4, 810, 512, (x, y) => y > hillTop(x) + 2 && clump(x, y) > 0.45),
    dir: (x, y) => -Math.PI / 2 + (fbm(x / 11, y / 9, 101) - 0.5) * 1.15,
    col: (x, y, r) => grassCol(x, y, r, 0.22),
    len: (x, y) => 9 * dS(y), lw: (x, y) => 1.1 * dS(y), steps: 2, lenJ: 0.8, impasto: 0.6,
  });
  strokes(out, counter, {                                  // 4 · and the finest nap, close to us
    rng, n: 2600,
    sample: r => { const x = -10 + r() * 820, y = horizon + 10 + Math.pow(r(), 0.8) * (512 - horizon - 10);
                   return (y > hillTop(x) && clump(x, y) > 0.5) ? [x, y] : null; },
    dir: (x, y) => -Math.PI / 2 + (fbm(x / 7, y / 6, 103) - 0.5) * 1.5,
    col: (x, y, r) => grassCol(x, y, r, 0.3),
    len: (x, y) => 6 * dS(y), lw: (x, y) => 0.8 * dS(y), steps: 2, lenJ: 0.85, impasto: 0.7,
  });
  for (let i = 0; i < 120; i++) {                          // and clumps, because grass grows in tufts
    const tx = -10 + rng() * 820;
    const ty = horizon + 12 + Math.pow(rng(), 0.55) * (508 - horizon - 12);
    const sc = dS(ty);
    strokes(out, counter, {
      rng, n: 14,
      sample: r => [tx + (r() + r() - 1) * 9 * sc, ty - Math.pow(r(), 0.7) * 11 * sc],
      dir: (x, y) => -Math.PI / 2 + (x - tx) * 0.05 + (fbm(x / 6, y / 6, 107) - 0.5) * 0.8,
      col: (x, y, r) => grassCol(x, y, r, 0.34),
      len: 10 * sc, lw: 1.1 * sc, steps: 2, lenJ: 0.7, impasto: 0.65,
    });
  }
  // the ragged skyline of grass — tufts rising off the brow into the City's light, so the
  // meadow does not meet the glory along a ruled line
  E.horizonFringe(out, counter, rng, {
    horizonFn: hillTop, cols: ['#3f6b28', '#568434', '#78a544', '#a3c162'],
    hMax: 24, lightFn: glory, seed: 349, dirJitter: 0.8,
  });
  // ⚠ AND THE BROW MUST NOT BE A CUT. Even with tufts on it, green meeting gold along one
  // contour reads as a pasted edge; the last few units of a field seen against a great light
  // are DISSOLVED by it. A thin haze of the City's own gold laid along the skyline, thinning
  // downward, is what turns the cut into distance.
  strokes(out, counter, {
    rng, n: 900,
    sample: r => { const x = -10 + r() * 820; return [x, hillTop(x) - 6 + Math.pow(r(), 0.6) * 34]; },
    dir: (x, y) => 0.06 + (fbm(x / 40, y / 18, 353) - 0.5) * 0.5,
    col: (x, y, r) => {
      const up = Math.max(0, Math.min(1, 1 - (y - hillTop(x) + 6) / 34));
      return jig(mix(ramp(['#7ba043', '#a8bd5e', '#d0cf8e'], fbm(x / 40, y / 20, 357) * 0.9),
        '#fff2cc', Math.pow(up, 1.2) * (0.42 + glory(x, y) * 0.4)), r, 8);
    },
    len: 9, lw: 2.2, steps: 2, lenJ: 0.7, impasto: 0.35, relief: 0.2,
  });
  // LONG ARCING BLADES at the reader's feet, and seed-heads standing above the sward —
  // without these the foreground stays a texture instead of becoming grass.
  for (let i = 0; i < 90; i++) {
    const bx = -10 + rng() * 820, by = 430 + Math.pow(rng(), 0.7) * 84;
    const lean = (rng() - 0.5) * 30, up = 24 + rng() * 40;
    paintPath(out, counter, rng,
      [[bx, by], [bx + lean * 0.45, by - up * 0.6], [bx + lean, by - up]],
      (x, y, r) => jig(mix(grassCol(x, y, r, 0.2), '#d8e4a0', Math.max(0, (by - y) / up) * 0.55), r, 8),
      { lw: 1.5, len: 5, density: 1, jitter: 0.35 });
  }
  for (let i = 0; i < 70; i++) {
    const sx = -10 + rng() * 820, sy = 400 + Math.pow(rng(), 0.7) * 110;
    const st = 16 + rng() * 22;
    paintPath(out, counter, rng, [[sx, sy], [sx + (rng() - 0.5) * 10, sy - st]],
      (x, y, r) => jig('#6f9440', r, 7), { lw: 1.1, len: 4, density: 0.9, jitter: 0.3 });
    E.daub(out, counter, sx + (rng() - 0.5) * 6, sy - st, 1.4 + rng() * 1.4,
      jig(mix('#c9c47a', '#fff0be', glory(sx, sy) * 0.7), rng, 9), rng);
  }

  /* ---------------- 3. THE RIVER OF LIFE — flows down out of the City (Rev 22:1) ----------------
     "a pure river of water of life, clear as crystal, proceeding out of the
     throne." Curved gold-white ribbons pour from the City heart down the hill,
     widening toward the reader. Painted before the City so the City sits at its
     spring. */
  /* ⚠ THE RIVER USED TO CUT THE NEAR FIELD IN HALF. It ran almost straight down the middle
     and broadened to 102 units at the reader's feet, so the whole foreground was water and
     the protagonist stood IN it — and there was nowhere on the left bank to put two children
     without one of them standing in the poem. A river is not a road: it wanders, it keeps
     to one side of the valley, and it leaves a bank to walk on. It bows east now, past the
     tree of life (Rev 22:2, "on either side of the river"), and the near meadow opens up. */
  /* ⚠⚠ THE RIVER COULD NOT BE SEEN (Sep 21). It ran from the gate (400,286) to (560,514) — and the
     protagonist stands at x 400–563. The whole course lay BEHIND HIM: on the page that quotes "a
     pure river of water of life, clear as crystal, proceeding out of the throne", the reader got a
     pale sliver beside his hood. I had looked at this section's long trail of notes, written "the
     river already got careful crystal treatment", and moved on — and Fred: "this is not how you
     make art… as an artist there is no final form." Judge the PICTURE, never the effort.
     Measured off CAST1[31]: pink 250–325, red 290–420, hero 400–563 (top y334), green 590–680
     (top y382), the Tree of Life's trunk at x752. The ground nobody stands on is (a) the far
     meadow above every head, y 286–334, and (b) the strip between the seated child and the great
     tree, x 680–727. So the river now leaves the gate, sweeps EAST across the far meadow in plain
     view, and comes down that strip to the reader — which also puts the Tree of Life where the
     verse puts it: "on either side of the river, was there the tree of life" (Rev 22:2). A child
     sits on one bank; the tree stands on the other. A cubic, so it bends like water and not a road. */
  const RB = [[cityX, horizon + 6], [470, 304], [748, 300], [694, 516]];   // mouth at 694: clear of the great trunk (x752) whichever way the paint falls
  const riverP = t => { const u = 1 - t, a = u * u * u, b = 3 * u * u * t, c = 3 * u * t * t, d = t * t * t;
    return [a * RB[0][0] + b * RB[1][0] + c * RB[2][0] + d * RB[3][0], a * RB[0][1] + b * RB[1][1] + c * RB[2][1] + d * RB[3][1]]; };
  const riverW = t => 12 + 46 * Math.pow(t, 1.3);      // already broad where it crosses the meadow; 58 at the reader's feet
  const riverInfo = (x, y) => { let bt = 0, bd = 1e9; for (let t = 0; t <= 1.001; t += 0.03) { const p = riverP(t); const d = Math.hypot(x - p[0], y - p[1]); if (d < bd) { bd = d; bt = t; } } return { t: bt, d: bd }; };
  const onRiver = (x, y) => { const { t, d } = riverInfo(x, y); return d < riverW(t) / 2; };
  // the river bed — a clear crystal-gold band
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
    out.push(`<path d="${d}Z" fill="#2f9aa6"/>`); counter.n++;   // ⚠ Sep 21: was pale sage. CLEAR water over a bed is DEEP in colour — you are looking down through it   // ⚠ was #eaf4ec, a near-white bed showing between every mark
  }
  // the flowing water — gold-white ribbons running down the current
  strokes(out, counter, {
    rng, n: 620,
    sample: rej(380, horizon, 780, 516, onRiver),   // ⚠ the box must contain the whole course (it sweeps east to x~735 now)
    dir: (x, y) => { const { t } = riverInfo(x, y); const a = riverP(Math.max(0, t - 0.025)), b = riverP(Math.min(1, t + 0.025)); return Math.atan2(b[1] - a[1], b[0] - a[0]); },
    col: (x, y, r) => {
      /* ⚠⚠ WATER TAKES ITS COLOUR FROM WHAT IS OVER IT AND AROUND IT. This ramp ran
         #ffffff → #aee0da: near-white everywhere, so on a page of gold sky and green meadow
         the river read as a strip of PAPER laid over the field — a bright stick, not a
         current. A river in a meadow under a golden glory is GOLD down its spine (it is
         mirroring the light) and GREEN at its edges (it is mirroring the bank); white belongs
         only to the glints, which are painted separately above. Same crystal, actually
         reflecting the world Rev 22:1 sets it in. */
      const { t, d } = riverInfo(x, y);
      const edge = d / (riverW(t) / 2);
      /* ⚠ THIRD LOOK (Sep 21): at 1:1 this read as a pale cobbled PATH. Every layer of it was a
         near-white — the water, the ripples, the glints, the spine — so nothing was left to be
         the water. A crystal stream is the most SATURATED thing in a meadow: a clear aqua body,
         darker and greener under the banks where the grass shades it, and the glory held to a
         narrow spine instead of bleaching the whole width. */
      let c = ramp(['#bff3e6', '#7fe0d2', '#48c6c2', '#2fa9b2', '#23909c', '#1c7484'],
        edge * 0.9 + fbm(x / 40, y / 60, 43) * 0.3);
      c = mix(c, '#fff6d2', glory(x, y) * Math.pow(Math.max(0, 1 - edge * 2.2), 2) * 0.6);      // the glory, along a narrow spine only
      return jig(c, r, 7);
    },
    len: (x, y) => 16 * dS(y), lw: (x, y) => 3.0 * dS(y), steps: 3, lenJ: 0.55, wild: 0.08, impasto: 0.4, relief: 0.4, op: 0.72,   // translucent: the bed and its colour come through
  });

  /* ⭐ "CLEAR AS CRYSTAL" (Rev 22:1) MEANS YOU CAN SEE THE BOTTOM. The river had colour, ripples and
     glints — all SURFACE — so it read as a bright ribbon, which is what any water looks like.
     Crystal is the one property this verse names, and crystal is transparency: in the near reach
     the bed shows through. Its stones are the twelve of the City's own foundations (Rev 21:19-20)
     — the river comes out of that City, and carries its colour down to the reader — greened and
     paled by the water over them, each with its shadow on the bed and one point of light. Over
     them, the bright wandering net that sunlight throws on the floor of shallow clear water. */
  {
    const bedR = E.mulberry32((seed ^ 0xc4157a1) >>> 0);
    const J12 = ['#3fb89c', '#3a6fd0', '#9cc4dc', '#2fae5c', '#d07a4a', '#d0383e', '#e6b840', '#3cc0b8', '#f0d65a', '#94d04a', '#e0508c', '#9a62e6'];
    for (let i = 0; i < 190; i++) {
      const t = 0.30 + Math.pow(bedR(), 0.75) * 0.70, p = riverP(t), hw = riverW(t) / 2;
      const x = p[0] + (bedR() * 2 - 1) * hw * 0.82, y = p[1] + (bedR() - 0.5) * 12;
      if (!onRiver(x, y)) continue;
      const r = (1.9 + bedR() * 3.2) * dS(y), c = E.mix(J12[i % 12], '#8fe0d6', 0.2);   // (was 0.42 toward a pale mint: grey pebbles)
      out.push(E.ribbon([[x - r * 0.9, y + r * 0.45], [x + r, y + r * 0.45]], r * 1.15, E.mix(c, '#1d4a4c', 0.5))); counter.n++;   // its shadow on the bed
      out.push(E.ribbon([[x - r, y], [x + r, y]], r * 1.5, c)); counter.n++;                                                    // the stone, seen through water
      out.push(E.ribbon([[x - r * 0.55, y - r * 0.32], [x + r * 0.05, y - r * 0.36]], r * 0.42, '#ffffff')); counter.n++;       // where the light reaches it
    }
    strokes(out, counter, {                              // the caustic net
      rng: bedR, n: 230,
      sample: r => { const t = 0.3 + r() * 0.7, p = riverP(t), hw = riverW(t) / 2;
                     const x = p[0] + (r() * 2 - 1) * hw * 0.86, y = p[1] + (r() - 0.5) * 10; return onRiver(x, y) ? [x, y] : null; },
      dir: (x, y) => fbm(x / 8, y / 8, 77) * Math.PI * 2,
      col: (x, y, r) => jig('#fffdf0', r, 3),
      len: (x, y) => 8 * dS(y), lw: (x, y) => 0.75 * dS(y), steps: 5, follow: 0.35, wild: 0.6, lenJ: 0.6, relief: 0, impasto: 0, op: 0.42, flow: 0,
    });
  }

  // THE SURFACE. The band above gives the river its crystal colour; this makes it
  // behave like water — ripples cutting ACROSS the current, horizontal glints
  // catching the City's light, and banks that interlock with the meadow.
  waterCourse(out, counter, rng, {
    ptFn: riverP, wFn: riverW,
    cols: ['#c8f4ea', '#8fe2d6', '#4fc4c2'], glintCol: '#ffffff',
    lightFn: glory, ripples: 120, glints: 90, bank: 120, seed: 911,   // ⚠ was 340/210 pale marks — a lid over the water. Few and bright now.
  });
  // bright sparkles ON the water — light dancing on the river of life
  strokes(out, counter, {
    rng, n: 130,
    sample: r => { const t = Math.pow(r(), 0.8); const p = riverP(t); return [p[0] + (r() + r() - 1) * riverW(t) * 0.34, p[1] + (r() - 0.5) * 4]; },
    dir: (x, y) => { const { t } = riverInfo(x, y); const a = riverP(Math.max(0, t - 0.025)), b = riverP(Math.min(1, t + 0.025)); return Math.atan2(b[1] - a[1], b[0] - a[0]); },
    col: (x, y, r) => jig(r() < 0.5 ? '#ffffff' : '#fff6d6', r, 5),
    len: 9, lw: 1.5, steps: 2, lenJ: 0.6, wJ: 0.5, relief: 0,
  });

  /* ---------------- 4. THE CITY OF PURE GOLD ON THE HILL (Rev 21:18-23) ----------------
     The Father's house grown into a whole CITY: many glowing homes and towers
     of gold climbing the hill, crowned by a great gate. First a vast glory of
     light all around it, then the drawn city, then the LAMB-LIGHT at its heart. */
  const _far = out.length;
  // ⚠ THE GLOW PAINTS FIRST, THE CITY SECOND. Fred: the City reads as an abstract
  // swirl, not a place. The klimt-gold halo, the sky-wide rays, the white-hot heart
  // and the raining sparks were all painted AFTER the buildings, burying solid gold
  // walls and amber roofs under later bright strokes however deliberately drawn.
  // Nothing changed but the order: the glow fills the sky first, and the City --
  // walls, windows, the gate, and the Rev 22:5 inscription over it -- paints on top
  // of that glow, the way anything solid reads against a glow: in front of it.

  /* ---------------- 4. THE LAMB-LIGHT -- painted FIRST, so the City sits on it (Rev 21:23) ----------------
     "the Lamb is the light thereof." Not a sun in the sky, not a candle: a great
     white-hot radiance at the City's heart, the source of all the light. */
  // KLIMT GOLD — a gilded glory-halo of the throne, concentric gold rings + dots
  E.klimtGold(out, counter, rng, cityX, cityHeart, 60, 200, { rings: 9, opacity: 0.66, squash: 0.8 });
  /* ⭐ "AND THERE WAS A RAINBOW ROUND ABOUT THE THRONE, IN SIGHT LIKE UNTO AN EMERALD" (Rev 4:3).
     "As the appearance of the bow that is in the cloud in the day of rain, so was the appearance
     of the brightness round about. This was the appearance of the likeness of the glory of the
     LORD" (Ezek 1:28). Sep 21 — Fred: "the secrets of beautiful things are all in scripture."
     Twice, when scripture shows the glory, it shows a BOW around it; this page had the gold and
     the rays and no bow. It rides just outside the Klimt rings, its marks laid ALONG the arc so
     it reads as one band of light rather than a spray, and it is EMERALD before it is anything
     else — the green holds the middle of the band and the other colours are its two edges.
     Light has no relief, and it is translucent: the sky is seen through it. */
  {
    const R0 = 184, R1b = 206, SQ = 0.82;   // a narrow band (second cut: 38 wide at full rainbow was a nursery arch)
    strokes(out, counter, {
      rng, n: 520,
      sample: r => { const a2 = Math.PI * (1.04 + r() * 0.92), rr = R0 + r() * (R1b - R0);
                     const x = cityX + Math.cos(a2) * rr, y = cityHeart + Math.sin(a2) * rr * SQ;
                     return (y < hillTop(x) - 4) ? [x, y] : null; },
      dir: (x, y) => Math.atan2((y - cityHeart) / SQ, x - cityX) + Math.PI / 2,
      col: (x, y, r) => {
        const t = (Math.hypot(x - cityX, (y - cityHeart) / SQ) - R0) / (R1b - R0);      // 0 inner .. 1 outer
        // ⚠ "IN SIGHT LIKE UNTO AN EMERALD". My first ramp ran violet-blue-green-yellow-orange at full
        // strength — a nursery rainbow pasted on the glory. The verse names ONE colour. So the band is
        // emerald through and through, paling to almost nothing at both edges; the hint of the bow's
        // other colours is left to the jitter.
        return jig(ramp(['#e8fbf0', '#9fe9c8', '#4fd39c', '#2fbf86', '#35c48a', '#7fe0b0', '#d6f6e4', '#f4fdf2'], t), r, 9);
      },
      len: 30, lw: 3.0, steps: 5, follow: 1, lenJ: 0.4, wJ: 0.3, aJ: 0.04, relief: 0, impasto: 0, op: 0.36, flow: 0,
    });
  }
  // BOLD RAYS beaming from the Lamb-light across the whole sky (Rev 22:5)
  strokes(out, counter, {
    rng, n: 130,
    sample: r => { const a = r() * Math.PI * 2, d = 30 + r() * 96; return [cityX + Math.cos(a) * d, cityHeart + Math.sin(a) * d * 0.86]; },
    dir: (x, y) => Math.atan2(y - cityHeart, x - cityX),
    col: (x, y, r) => jig(mix(GOLD_HOT, GOLD_PALE, r() * 0.5), r, 5),
    len: (x, y) => 24 + Math.hypot(x - cityX, y - cityHeart) * 0.42, lw: 1.6, steps: 2, lenJ: 0.6, relief: 0,
  });
  // the white-hot heart itself
  strokes(out, counter, {
    rng, n: 150,
    sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 0.7) * 46; return [cityX + Math.cos(a) * d, cityHeart + Math.sin(a) * d]; },
    dir: () => 0,
    col: (x, y, r) => jig(mix('#fffef6', GOLD_HOT, Math.hypot(x - cityX, y - cityHeart) / 46), r, 4),
    len: 7, lw: 3, steps: 2, impasto: 0.5, relief: 0,
  });
  // LEGIBLE GOLD SPARKS raining off the whole City — it RADIATES (Rev 21:11)
  E.goldSparks(out, counter, rng, cityX, cityHeart + 20, 30, 240, 150, { squash: 0.82, big: 1.15, lightFn: glory });

  /* ---------------- 5. THE CITY OF PURE GOLD ON THE HILL (Rev 21:18-23) ----------------
     ⚠ REBUILT to use paintPalace (Fred: "keep the assets consistent... the kingdom
     shape"). This page used to hand-roll its own array of rectangle towers — a
     DIFFERENT building than every other plate's Father's-house/Kingdom shape
     (bridge/gospel/gift/ran/twoways/road all call E.paintPalace). Now the City is
     built from that SAME painter: one large instance as the City's heart (the
     door-page home, grown vast), two smaller instances of the identical shape
     flanking it — more of the City's homes climbing the hill, without inventing a
     second architecture beside the one the book already has. */
  /* ⭐ A DARKER POCKET BEHIND THE CITY. The book's own rule, and the one this page was
     breaking on the very thing it exists to show: "a gold/radiant figure on a bright field
     vanishes — give it a darker pocket behind." Gold towers standing on a gold glory in a
     gold sky have nothing to be brighter than, so the New Jerusalem, the destination of the
     whole book, came up as a pale ghost, which is exactly the "soft blur" the quality bar
     forbids for the Father's house. This is not a shadow — there is no night here (Rev 22:5)
     — it is one step DOWN in value in the air behind the walls, a deep warm amber, so the
     white-hot windows and the open gate have somewhere to blaze from. */
  strokes(out, counter, {
    rng, n: 1600,
    sample: r => {
      const x = cityX + (r() + r() - 1) * 285;
      const y = cityHeart + 20 + Math.pow(r(), 0.7) * 176;
      return (y > hillTop(x) - 6) ? null : [x, y];
    },
    dir: (x, y) => Math.atan2(y - cityHeart, x - cityX) + Math.PI / 2,
    col: (x, y, r) => {
      const d = Math.hypot((x - cityX) / 285, (y - cityHeart - 20) / 176);
      let c = ramp(['#9a6530', '#b47c3c', '#c8944c', '#dcae68', '#ecc890', '#f6dcb2'],
        Math.min(1, d * 1.1) * 0.92 + r() * 0.18);
      return jig(c, r, 9);
    },
    len: 15, lw: 3.4, steps: 3, lenJ: 0.5, impasto: 0.5, relief: 0.35,
  });

  // a great GLORY of light crowning the City (Rev 21:23) — a halo of radiance
  // ABOVE the rooftops, so it haloes the city without washing the towers away
  strokes(out, counter, {
    rng, n: 420,
    sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 0.9) * 150; return [cityX + Math.cos(a) * d, cityHeart + 8 + Math.sin(a) * d * 0.72]; },
    dir: (x, y) => Math.atan2(y - cityHeart, x - cityX),
    col: (x, y, r) => jig(ramp([GOLD_HOT, GOLD_PALE, GOLD, GOLD_DEEP, '#d8b256'], Math.hypot(x - cityX, (y - cityHeart - 8) / 0.72) / 150), r, 8),
    len: 12, lw: 2.4, steps: 2, impasto: 0.5, relief: 0.4,
  });

  // THE PALACE, GROWN INTO THE CITY'S HEART. s=0.68 keeps the tallest spire's tip
  // (200*s ≈ 136 above baseY) below cityHeart (132) — the Lamb-light still crowns
  // the towers rather than the towers poking through it.
  const CITY_S = 0.68, cityBaseY = horizon + 6;
  E.paintPalace(out, counter, rng, cityX, cityBaseY, CITY_S, { gate: true });
  // two smaller instances of the SAME house, flanking — more homes of the City
  // climbing the hill either side, faded slightly with distance (opacity, not a
  // different design) so the eye still reads one great central house first.
  out.push('<g opacity="0.8">'); counter.n++;
  E.paintPalace(out, counter, rng, 195, hillTop(195) + 8, 0.34, { gate: false });
  out.push('</g>'); counter.n++;
  out.push('<g opacity="0.8">'); counter.n++;
  E.paintPalace(out, counter, rng, 610, hillTop(610) + 8, 0.36, { gate: false });
  out.push('</g>'); counter.n++;

  // EASTER EGG — Rev 22:5 in the ORIGINAL KOINE GREEK numerals, ΚΒʹ·Εʹ (22, 5),
  // incised above the great gate: "and there shall be NO NIGHT there." The verse
  // the whole page paints, cut dark into the bright gold above the open way in.
  // ⚠ MEASURED, NOT ASSUMED. First pass put this at the gate's own height
  // (cityBaseY − 128·s), which is well BELOW the central spire's true tip (the
  // spire cone rises to cityBaseY − 200·s − 1.35·(78·s)) — the text landed
  // stamped across the tower's own wall/windows instead of floating above it.
  // dialled back toward the book's usual subtle fourth-look easter-egg strength
  // (matched to bread.mjs's John 6:35 egg) — the previous pass had crept bold.
  E.inscriptionText(out, E.greekRef(22, 5), { x: cityX, y: cityBaseY - 200 * CITY_S - 1.35 * (78 * CITY_S) - 18, h: 15, body: '#2e1c06', edge: '#fffaea', op: 0.75, edgeOp: 0.5 });
  farRanges.push([_far, out.length]);   // ← the City of gold + its glory + Lamb-light (FAR plane)

  /* ---------------- 6. THE TREES OF LIFE — line the river (Rev 22:2) ----------------
     "on either side of the river, was there the tree of life" — fruit trees of
     life in flourishing free colour, lining the water of life down the hill. */
  /* ⚠⚠⚠ `fruitTree` IS THE MUSHROOM-CAP PAINTER, AND IT HAD BEEN REJECTED TWICE ALREADY —
     once on `bread` and again on `hands`, both times because a coloured cap on a striped pole
     is the loudest thing on a page about people. It was still standing here six times over.
     Fred: "the trees are so broken. is is very small and the placements does not make sense.
     this is why i wanted you to redraw."
       All six are now `paintTree` — the painter the garden pages use, which draws a real
     trunk with bark, boughs, and a crown with a lit top and a deep belly. And they are twice
     the size: 92px was a shrub on a 500-tall plate.
     ⚠⚠ AND THE PLACEMENT NOW HAS A REASON. They were scattered; scripture puts them
     somewhere — "in the midst of the street of it, and ON EITHER SIDE OF THE RIVER, was there
     the tree of life" (Rev 22:2). So they stand in three pairs flanking the river, big at the
     reader's feet and smaller as they climb toward the City. That is an avenue, and it does
     two jobs at once: it obeys the verse, and a tree whose size you know is what makes the
     distance to the City believable. */
  const lifeTree = (x, y, h, bl, sd, crown, sp) => {
    // ⭐ after his kind (Sep 15): the avenue is every kind — palms nearest (Rev 7:9), then olive, fig, cedar, apple
    E.paintTree(out, counter, rng, x, y, h,
      { lightFn: (px, py) => Math.max(0.25, glory(px, py)), shadowDir: sd, blossom: bl, crownCols: crown, species: sp });
    // ⚠ AND A TREE HAS TO GROW OUT OF THE FIELD, NOT BE STUCK INTO IT. These stand alone on
    // open meadow (in `gift` the trunks are hidden because the wood overlaps), so every bare
    // trunk met the grass along a clean edge and read as a pole in a lawn. Rough grass round
    // the foot is what closes that join.
    const sc = h / 120;
    strokes(out, counter, {
      rng, n: Math.round(90 * sc + 30),
      sample: r => [x + (r() + r() - 1) * 26 * sc, y + 4 * sc - Math.pow(r(), 0.65) * 20 * sc],
      dir: (px, py) => -Math.PI / 2 + (px - x) * 0.02 + (fbm(px / 7, py / 6, 151) - 0.5) * 1.1,
      col: (px, py, r) => grassCol(px, py, r, 0.1),
      len: (px, py) => 11 * dS(py), lw: (px, py) => 1.2 * dS(py), steps: 2, lenJ: 0.8, impasto: 0.65,
    });
  };
  // the crowns keep this page's gold-green key, deepening at the belly (never a flat cap)
  /* ⚠ AND THEY WERE BLOSSOM CLOUDS, NOT TREES. The crowns topped out at #f2eec0 with a heavy
     blossom count, so every one came out as a pale white puff — the same washed fault the
     rest of this page had. A fruit tree in leaf is GREEN with a lit crown, and the blossom is
     a few points of white, not the whole canopy. */
  const CROWN_A = ['#1e4418', '#2b5a1f', '#3d7527', '#569233', '#75ad45', '#9cc862', '#c6e08e'];
  const CROWN_B = ['#22401a', '#325e22', '#457c2b', '#5f9838', '#80b24c', '#a6cc6a', '#cde294'];
  lifeTree(96,  508, 214, 5, -1, null, 'palm');   // the palm keeps its OWN deeper green — in the meadow's key its fronds vanished into the grass    // nearest, at the left edge of the meadow
  // ⚠ the near-RIGHT slot belongs to THE tree of life (6b below) — the grandest on the page,
  // so it must not have an ordinary tree standing in its place.
  lifeTree(212, 436, 132, 4, -1, CROWN_B, 'olive');   // midway up the bank
  // ⚠ was (496, 438) — the river's new eastward course runs straight through that spot, so
  // the tree stood in the water. Moved to the west bank above the children.
  lifeTree(392, 430, 136, 4, -1, CROWN_A, 'fig');
  lifeTree(310, 390,  86, 2, -1, CROWN_A, 'cedar');   // furthest, close to the City
  lifeTree(640, 366,  88, 2,  1, CROWN_B, 'apple');   // moved with the river (Sep 21): it stands on the west bank now, over the seated child's shoulder
  /* THE MIDDLE DISTANCE HAS TO RECEDE THROUGH SOMETHING. Between the City's foot and the
     first real tree lay eighty units of open green with nothing in it, so the eye jumped the
     gap and the hill flattened. Low shrub clumps along the contours fill it — small, low in
     contrast, sized by the same depth gradient, never competing with the City above them.
     A hedge is a MASS: they cluster, they overlap, and they thin as they climb. */
  {
    const hRng = mulberry32(seed ^ 0x9e3779b9);
    for (let i = 0; i < 34; i++) {
      // ⚠ EVEN SIZES ALONG ONE LINE ARE A HEDGE, NOT A COUNTRY. The first cut put them all
      // within thirty units of the brow at much the same height, and they read as a green
      // wall built across the City's foot. Spread deep into the field, most small and a few
      // breaking well above the rest — a mass, the way `ran`'s wood had to be rebuilt.
      const bx = -10 + hRng() * 820;
      const by = horizon + 10 + Math.pow(hRng(), 0.85) * 118;
      if (onRiver(bx, by)) continue;
      const bh = 22 + Math.pow(hRng(), 1.8) * 46;   // ⚠ under ~20 paintTree's canopy thins to bare twigs and reads WINTRY — wrong page for that
      // ⚠ NOT OVER THE AVENUE (Sep 15). These are painted AFTER the five trees of life, and a
      // shrub landing on a crown buries it — the near palm lost every frond under three of them.
      if ([[96, 508, 214], [212, 436, 132], [392, 430, 136], [310, 390, 86], [640, 366, 88]].some(([tx, ty, th]) =>
            Math.abs(bx - tx) < th * 0.5 + 14 && by > ty - th * 1.1 && by < ty + 12)) continue;
      E.paintTree(out, counter, hRng, bx, by, bh, {
        lightFn: (px, py) => Math.max(0.3, glory(px, py)),
        shadowDir: bx < cityX ? -1 : 1, blossom: 1,
        crownCols: hRng() < 0.5 ? CROWN_A : CROWN_B,
        mix: [['oak', 3], ['olive', 1], ['fig', 1]],   // hedge shrubs are broadleaf; a 30-unit palm is a toy
      });
    }
  }

  /* ---------------- 6b. THE TREE OF LIFE — twelve manner of fruits (Rev 22:2) ----------------
     "on either side of the river, was there the tree of life, which bare twelve
     manner of fruits" — THE tree, the grandest on the page, on the near bank of
     the river of life: a great swirling emerald canopy (living = curved, Munch)
     bearing exactly TWELVE fruits, each a different manner — a different jewel
     colour — set round the crown so every one shows. A child can count them. */
  /* ⚠⚠ IT WAS 112 UNITS WIDE. "THE tree, the grandest on the page" — and it was drawn at
     rx 56 / ry 42 with its foot at y456, which on a 500-tall plate is a shrub, tucked half
     behind the protagonist where nobody could count anything. Scripture calls it the grandest
     thing in the street; it now takes the near-right bank at more than twice the size, with
     its own crown reaching most of the way up the meadow. */
  /* ⭐⭐ AND IT IS THE REPOUSSOIR. Fred: "still not to my expectations." The fault on this page
     was never the meadow either — it was that everything sat in HORIZONTAL BANDS parallel to
     the frame, with the children in a row across the middle and the grandest tree in
     scripture reduced to a tidy lump standing wholly inside the picture. A thing drawn
     complete, with air all round it, is a specimen; a thing CUT BY THE FRAME is a thing you
     are standing next to. So the tree of life is rooted below the bottom edge, its crown runs
     off the right edge, and the whole City is seen past it. That is what makes the distance
     to the City a distance instead of a diagram — and it is also what Rev 22:2 asks for: the
     tree of life is not an ornament in that street, it is the thing standing over you. */
  const TOL = { x: 752, y: 286, rx: 158, ry: 138, baseY: 588 };
  const inTreeOfLife = (x, y) => ((x - TOL.x) / (TOL.rx + 5)) ** 2 + ((y - TOL.y) / (TOL.ry + 5)) ** 2 < 1;
  {
    const { x: tx, y: ty, rx, ry, baseY } = TOL;
    /* ⚠⚠ IT WAS THE ONE TREE IN THE BOOK PAINTED BY A DIFFERENT HAND. Its canopy was a
       hand-rolled ellipse of 2600 curl-following marks at len 14 / lw 3.6 — five times the
       size of a leaf — so the grandest tree on the last page came out as a mound of green
       caterpillars with no trunk, no boughs, no silhouette and no shadow: broccoli. Every
       other tree in the book goes through `paintTree`, which draws a tapering curved trunk,
       a branch skeleton that is its own, overlapping crown clusters that follow that
       skeleton, and the cast shadow that fastens it to the ground. The rule from the garden
       pages holds here too: IMPROVE THE ONE PAINTER, never invent a second one. So THE tree
       of life is that same tree — simply the biggest and best-fed of them, with the twelve
       hung in its crown. */
    E.paintTree(out, counter, rng, tx, baseY, 462, {
      lightFn: (px, py) => Math.max(0.3, glory(px, py)),
      // ⚠ NOTHING MAY COMPETE WITH THE TWELVE. At blossom 7 in cream and pink this canopy
      // carried a dozen bright dabs of its own, and the one countable miracle on the page
      // (Rev 22:2) had to share the eye with them. Quiet greens, and only a few.
      shadowDir: 1, blossom: 2, species: 'oak', lean: 0.07,   // ⚠ pinned, leaning a little EAST: a free lean once swung the trunk across the river
        // THE tree of life keeps the book's own tree; the twelve are its kind
      blossomCols: ['#9cc06a', '#b0cd7e', '#cfd9a0'],
      crownCols: ['#17400f', '#20521a', '#2f6d23', '#43892e', '#5fa63c', '#84c052', '#b4d878'],
    });
    // rough grass round its foot, so the greatest trunk on the page grows out of the meadow
    strokes(out, counter, {
      rng, n: 340,
      sample: r => [tx + (r() + r() - 1) * 74, baseY + 8 - Math.pow(r(), 0.65) * 56],
      dir: (px, py) => -Math.PI / 2 + (px - tx) * 0.015 + (fbm(px / 7, py / 6, 157) - 0.5) * 1.1,
      col: (px, py, r) => grassCol(px, py, r, 0.12),
      len: (px, py) => 12 * dS(py), lw: (px, py) => 1.3 * dS(py), steps: 2, lenJ: 0.8, impasto: 0.65,
    });
    // THE TWELVE FRUITS — twelve manner (Rev 22:2): twelve colours, one ring
    // round the crown, alternating in-and-out so none hides another. Each fruit
    // a bold bright orb with a deep warm rim (so it pops off the leaves) and a
    // white gleam of the Lamb-light. Exactly twelve — count them.
    /* ⚠⚠ AND THE TWELVE WERE HUNG ON A RING. One angle apart, alternating in and out, all the
       same size — which is a bauble arrangement, not fruit, and it is most of why Fred called
       these trees broken. Fruit HANGS: it sits where a branch happened to be, at its own
       depth in the leaves, on a short stem, and no two are quite the same size. Still exactly
       twelve manner (Rev 22:2), and a child can still count them — they are simply growing
       now instead of being displayed. */
    const MANNER = ['#e8402e', '#ff8c22', '#ffc832', '#ffe96a', '#fff6da', '#48e0b0',
                    '#3ab6f0', '#3a66e0', '#8a5ae8', '#c84ae0', '#f05ab0', '#ff9eb8'];
    const fRng = mulberry32(seed ^ 0x12f7);
    for (let i = 0; i < 12; i++) {
      const a = (i + 0.5) / 12 * Math.PI * 2 + (fRng() - 0.5) * 0.42;
      const rr = 0.44 + fRng() * 0.46;
      const fx2 = tx + Math.cos(a) * rx * rr, fy2 = ty - Math.sin(a) * ry * rr;
      const fr = 10.4 + fRng() * 4.0;
      // the stem it hangs from, up into the leaves
      paintPath(out, counter, fRng, [[fx2 - 1, fy2 - fr * 2.1], [fx2, fy2 - fr * 0.9]],
        (x, y, r) => jig(mix('#4e6a24', '#8a9a3a', r() * 0.6), r, 6), { lw: 1.6, len: 3, density: 0.9, jitter: 0.3 });
      /* ⚠⚠ AND THEY WERE THREE FLAT SVG CIRCLES EACH — a dark disc, a colour disc, a white
         dot. Everything else on this plate is made of paint, so a vector disc reads as a
         sticker pressed onto it: twelve Christmas baubles hung in a bush, which is most of
         what still looked like a child's drawing here. A fruit is painted like anything
         else: marks curving round its form, the belly deep and cool, the crown warm and
         light, because the light is above (Fred's own rule, and here the light is the Lamb
         directly overhead). Still exactly twelve manner, still countable. */
      /* ⚠ AND THEY MUST READ AS TWELVE JEWELS. On the page they came up as pale blobs: the
         live filter lifts every plate's median, so a fruit painted at the colour you want
         arrives a good deal paler than you painted it. Twelve MANNER of fruits is the one
         thing on this page a child is meant to be able to count (Rev 22:2), so they are
         painted deeper and more saturated than looks right in the raster, and each gets a
         dark seat underneath so it reads as an orb hanging in leaves rather than a coloured
         patch lying on them. */
      const base = MANNER[i];
      const deep = mix(base, '#42200e', 0.52);
      /* ⚠⚠ AND A FRUIT NEEDS AN OPAQUE BODY, exactly like the bough on `comes`. This page
         paints at 0.54 stroke opacity (STROKE_STYLE), so modelling strokes laid straight onto
         a bright green canopy let the canopy up through every one of them — the fruit kept
         the SHAPE of a fruit and none of its colour, and all that survived was the white
         gleam on top, which is why twelve jewels read as twelve white dots. Body first at
         full strength, then model it. */
      for (let k = 0; k < 8; k++) {
        const a3 = fRng() * Math.PI * 2, d3 = Math.pow(fRng(), 0.62);
        E.daub(out, counter, fx2 + Math.cos(a3) * fr * d3 * 0.52, fy2 + Math.sin(a3) * fr * d3 * 0.5,
          fr * (0.44 + fRng() * 0.16), jig(mix(deep, base, 0.4 + fRng() * 0.4), fRng, 6), fRng);
      }
      for (let k = 0; k < 3; k++)                       // just a seat of shade under it, no more
        E.daub(out, counter, fx2 + (fRng() - 0.5) * fr * 0.9, fy2 + fr * (0.86 + fRng() * 0.25),
          fr * (0.13 + fRng() * 0.10), jig(mix('#1c3a1e', '#2c5426', fRng()), fRng, 5), fRng);
      strokes(out, counter, {
        rng: fRng, n: 46,
        sample: r => { const a = r() * Math.PI * 2, dd = Math.pow(r(), 0.5); return [fx2 + Math.cos(a) * fr * dd, fy2 + Math.sin(a) * fr * dd * 1.04]; },
        dir: (x, y) => Math.atan2(y - fy2, x - fx2) + Math.PI / 2,
        col: (x, y, r) => {
          const up = (fy2 - y) / fr;                        // +1 at the crown, −1 at the belly
          /* ⚠⚠ AND CLAMP THE LOW END. `Math.min(1, 0.42 + up * 0.8)` looks safe and is not:
             `up` runs to −1 at the belly, so t went to −0.38 and `mix` EXTRAPOLATED past the
             dark colour instead of stopping at it. Twelve jewels came out as twelve smudges
             of mud. Any mix driven by a signed term needs both ends held. */
          let c = mix(deep, base, Math.max(0.06, Math.min(1, 0.44 + up * 0.82)));
          c = mix(c, '#fff4cf', Math.max(0, up) * 0.42 * (0.4 + glory(x, y) * 0.6));
          return jig(c, r, 9);
        },
        len: 3.6, lw: 2.5, steps: 1, lenJ: 0.5, impasto: 0.5, relief: 0.5,
      });
      // and the gleam of the Lamb-light on its shoulder
      E.daub(out, counter, fx2 - fr * 0.30, fy2 - fr * 0.42, fr * 0.13, '#fff8dc', fRng);   // ⚠ was 0.24 and pure white: the gleam WAS the fruit
    }
  }

  /* ---------------- 6c. THE RIVER SHINES FROM THE THRONE (Rev 22:1) ----------------
     "proceeding out of the throne of God and of the Lamb" — a burst of white
     throne-light where the river leaves the City, and a crystal spine of that
     same light running the whole length of the current: one luminous ribbon
     from the Lamb-light down to the reader's feet. */
  strokes(out, counter, {                              // the SPRING — white blaze at the source
    rng, n: 80,
    sample: r => { const t = Math.pow(r(), 2.4) * 0.26; const p = riverP(t); return [p[0] + (r() + r() - 1) * riverW(t) * 0.4, p[1] + (r() - 0.5) * 5]; },
    dir: (x, y) => { const { t } = riverInfo(x, y); const a = riverP(Math.max(0, t - 0.025)), b = riverP(Math.min(1, t + 0.025)); return Math.atan2(b[1] - a[1], b[0] - a[0]); },
    col: (x, y, r) => jig(mix('#ffffff', GOLD_HOT, r() * 0.4), r, 4),
    len: 12, lw: 2.2, steps: 3, follow: 0.95, lenJ: 0.55, impasto: 0.4, relief: 0,
  });
  strokes(out, counter, {                              // the crystal SPINE down the whole current
    rng, n: 70,
    sample: r => { const t = Math.pow(r(), 1.8) * 0.42; const p = riverP(t); return [p[0] + (r() + r() - 1) * riverW(t) * 0.1, p[1] + (r() - 0.5) * 3]; },   // ⚠ the upper reach only, and narrow: it proceeds OUT of the throne and gives way to clear water
    dir: (x, y) => { const { t } = riverInfo(x, y); const a = riverP(Math.max(0, t - 0.025)), b = riverP(Math.min(1, t + 0.025)); return Math.atan2(b[1] - a[1], b[0] - a[0]); },
    /* ⚠ AND THE SPINE FADES AS IT COMES. A white line of even strength down the whole
       length is what made this river read as a stick laid across the meadow. The light
       PROCEEDS OUT OF THE THRONE (Rev 22:1) — so it blazes at the source and dissolves into
       the water as the current nears the reader, which is both the verse and the way a
       reflected highlight actually behaves. */
    col: (x, y, r) => { const { t } = riverInfo(x, y); return jig(mix(mix('#ffffff', '#fff6d8', r() * 0.5), '#dfe8c8', Math.min(1, t * 1.15)), r, 4); },
    len: 15, lw: 2.0, steps: 3, follow: 0.95, lenJ: 0.5, relief: 0,
  });

  /* RUSHES ALONG BOTH BANKS. Water in a meadow does not meet grass along a drawn line — it
     meets it through a fringe of tall stuff that grows with its feet wet, and that fringe is
     most of what tells the eye "this is a river" rather than "this is a pale shape". Laid
     ON the water's edge and leaning out over it, taller and looser the nearer they are. */
  {
    const uRng = mulberry32(seed ^ 0x71c5);
    for (let i = 0; i < 340; i++) {
      const t = Math.pow(uRng(), 0.6);
      const p = riverP(t), q = riverP(Math.min(1, t + 0.02));
      let nx = -(q[1] - p[1]), ny = q[0] - p[0]; const nl = Math.hypot(nx, ny) || 1; nx /= nl; ny /= nl;
      const side = uRng() < 0.5 ? 1 : -1;
      const off = riverW(t) / 2 * (0.82 + uRng() * 0.34);
      const bx = p[0] + nx * off * side, by = p[1] + ny * off * side;
      if (by < horizon + 4) continue;
      const sc = dS(by), up = (9 + uRng() * 22) * sc, lean = side * (2 + uRng() * 9) * sc;
      paintPath(out, counter, uRng,
        [[bx, by], [bx + lean * 0.4, by - up * 0.62], [bx + lean, by - up]],
        (x, y, r) => jig(mix(ramp(['#33601f', '#4b7c2c', '#6c9a3c', '#93b455'], r() * 0.8 + fbm(x / 20, y / 16, 167) * 0.4),
                             '#f2e8b4', Math.max(0, (by - y) / up) * 0.4 * glory(x, y)), r, 8),
        { lw: 1.3 * sc, len: 4, density: 0.95, jitter: 0.4 });
    }
  }

  /* ⭐⭐ THE LIGHT LYING ON THE MEADOW. Fred: "make landscape better also." This field was
     built properly — four sward layers, tufts, colonies — and still read as one big even
     green, because what the eye reads in a landscape before any detail is the PATTERN OF
     LIGHT AND SHADE across it. An evenly lit field is the flattest thing in painting.
     There is no sun here to break into shafts (Rev 22:5 — no sun, no candle), so the pattern
     is the Lamb-light's own: broad soft POOLS of radiance lying on the grass, brightest along
     the ground that faces the City and thinning into the hollows between. Laid OVER the
     finished field rather than mixed into its colour — a term inside `grassCol` gets averaged
     across five passes and comes out a whisper; a painter lays light on top, last. */
  {
    const pRng2 = mulberry32(seed ^ 0x60ae);
    const pool = (x, y) => {
      const big = fbm(x / 210, y / 96, 811);                  // where the radiance gathers
      const g = glory(x, y);
      return Math.max(0, Math.min(1, (big - 0.42) * 2.1)) * (0.35 + g * 0.9);
    };
    strokes(out, counter, {                                   // the light
      rng: pRng2, n: 3000,
      sample: r => {
        const x = -14 + r() * 828, y = horizon + 4 + Math.pow(r(), 0.85) * (H + 12 - horizon - 4);
        if (y < hillTop(x)) return null;
        return pool(x, y) > 0.22 + r() * 0.45 ? [x, y] : null;
      },
      dir: (x, y) => { const [vx, vy] = curlV(x, y, 160, 70); return Math.atan2(vy * 0.7 - 0.1, Math.abs(vx) + 0.8); },
      col: (x, y, r) => {
        const p2 = pool(x, y);
        return jig(ramp(['#8aa84e', '#a8c05e', '#c6d47c', '#e2e2a4', '#f6eec6'],
          Math.pow(p2, 1.1) * 0.95 + (r() - 0.5) * 0.2), r, 9);
      },
      len: (x, y) => 13 * dS(y), lw: (x, y) => 2.8 * dS(y), steps: 2,
      lenJ: 0.7, impasto: 0.3, relief: 0.15, op: 0.30,
    });
    strokes(out, counter, {                                   // and the cool hollows between the pools
      rng: pRng2, n: 1800,
      sample: r => {
        const x = -14 + r() * 828, y = horizon + 10 + Math.pow(r(), 0.85) * (H + 12 - horizon - 10);
        if (y < hillTop(x)) return null;
        return pool(x, y) < 0.16 - r() * 0.14 ? [x, y] : null;
      },
      dir: (x, y) => -Math.PI / 2 + (fbm(x / 26, y / 18, 817) - 0.5) * 0.9,
      col: (x, y, r) => jig(ramp(['#2c4a1e', '#3a5c26', '#4a7030'], fbm(x / 34, y / 22, 821) * 0.9), r, 8),
      len: (x, y) => 9 * dS(y), lw: (x, y) => 1.9 * dS(y), steps: 2,
      lenJ: 0.8, impasto: 0.4, relief: 0.2, op: 0.24,
    });
  }

  /* ⚠ CONTACT SHADOWS FOR THE FOUR CHILDREN. They are cast cells composited over the finished
     plate, so they cast nothing of their own and sit ON the meadow like stickers however
     carefully they are placed. A small pool of dark grass baked at each one's feet fastens
     them to it. The Lamb-light is straight overhead at (400,132), so a shadow here is short
     and falls AWAY from the City's axis — the one on the far bank leans right, the ones on
     the near bank lean left. Daubs, never an ellipse: a soft gradient is a different medium
     and shows as one. Positions are the actors' own (x, y) in CAST1[31] (character.js). */
  {
    const sRng = mulberry32(seed ^ 0x5ade);
    for (const [ax, ay, aw] of [[288, 462, 22], [356, 512, 37], [486, 534, 48], [636, 486, 27]]) {
      const lean = ax < cityX ? -1 : 1;
      /* ⚠⚠ SOFTNESS IS A DENSITY FALLOFF, NOT A BLUR. Fred: "make the shadows softer." Fat
         opaque `daub`s read as blotches, and `daub` takes no opacity argument so there is no
         dial to turn down. Many small marks barely darker than the grass, packed at the feet
         and thinning outward through a wide faint penumbra — which is also, on this page,
         what a shadow under a light directly overhead actually looks like: hardly there. */
      for (const [reach, opa, dens] of [[0.8, 0.30, 1], [1.25, 0.17, 0.75], [1.8, 0.08, 0.5]]) {
        strokes(out, counter, {
          rng: sRng, n: Math.round(54 * dens),
          sample: r => {
            const t = Math.pow(r(), 0.7);
            const px = ax + lean * (3 + t * aw * 0.9 * reach) + (r() - 0.5) * aw * 0.9 * reach;
            const py = ay + 2 + t * 6 * reach + (r() - 0.5) * 5.5 * reach;
            return (r() < 1 - t * 0.5) ? [px, py] : null;
          },
          dir: (x, y) => -0.1 + (fbm(x / 18, y / 9, 773) - 0.5) * 0.9,
          col: (x, y, r) => jig(mix('#456127', '#2a4420', 0.25 + r() * 0.6), r, 6),
          len: 5 * reach, lw: 1.8, steps: 2, lenJ: 0.9, impasto: 0.25, relief: 0.15, op: opa,
        });
      }
    }
  }

  /* ---------------- 7. THE REDEEMED — walk in the light, faces lifted (Rev 21:24) ----------------
     "And the nations of them which are saved shall walk in the light of it."
     Tiny figures coming up the banks toward the City, faces lifted to the glory —
     and among them ONE small RED child, "you," home at last. */
  // a little company of the redeemed, each a small bright figure, faces up.
  // colours vary (the nations) but all bear the bold dark outline of paintChild.
  const folk = [
    // [x, footY, scale, [3-stop palette]]
    [300, 446, 1.0, ['#4a86c0', '#356a9e', '#244a70']],   // blue robe
    [336, 462, 1.05, ['#5aa86e', '#3f8a52', '#2a5e38']],  // green robe
    [470, 452, 1.02, ['#b77ce0', '#9a5ac8', '#6e3a98']],  // violet robe
    [504, 468, 1.06, ['#e0a850', '#c6863a', '#946028']],  // amber robe
    [262, 478, 0.94, ['#5ec0b0', '#3f9a8c', '#2a6e64']],  // teal robe
    [548, 482, 0.96, ['#e07ab0', '#c25a92', '#8e3e66']],  // rose robe
  ];
  // little pilgrims at home: relaxed, faces lifted to the City, no arms needed
  const _fg = out.length;
  for (const [fx, fy, S, cols] of folk) {
    // each figure gives off a little of the City's light (held in the radiance)
    strokes(out, counter, {
      rng, n: 24,
      sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 0.9) * 20 * S; return [fx + Math.cos(a) * d, fy - 16 * S + Math.sin(a) * d]; },
      dir: () => 0,
      col: (x, y, r) => jig(mix(GOLD_PALE, GOLD, r() * 0.5), r, 7),
      len: 5, lw: 1.8, steps: 2, relief: 0,
    });
    E.paintMask(out, counter, rng, {
      x: fx, y: fy, h: 34 * S, facing: fx < 400 ? 1 : -1, shadow: 0,
      cols, maskCols: ['#ded8ca', '#c8c0ac', '#a89e84'],
      eye: [fx < 400 ? 0.4 : -0.4, -0.9], mood: 'joy',
    });
  }
  // YOU — the small RED child, home at last, dead centre-low at the river's mouth,
  // closest of all, face lifted to the City. The recurring red protagonist.
  {
    const fx = 400, fy = 492, S = 1.45;
    // a pocket of slightly deeper gold behind so the red figure reads (still no
    // shadow — only a richer warm tone, the way bright reads against less-bright)
    strokes(out, counter, {
      rng, n: 90,
      sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 0.7) * 42 * S; return [fx + Math.cos(a) * d * 0.9, fy - 14 * S + Math.sin(a) * d * 0.6]; },
      dir: (x, y) => { const [vx, vy] = curlV(x, y, 357, 84); return Math.atan2(vy * 0.55, Math.abs(vx) + 0.9); },
      col: (x, y, r) => jig(ramp(['#d8b86a', '#e8cd84', '#f2dc9a'], fbm(x / 40, y / 40, 71) * 0.7), r, 8),
      len: 14, lw: 3.2, steps: 2, impasto: 0.4, relief: 0.5,
    });
    // YOU — cute-chunky ARTICULATED red child (personCaps), home at last, face and
    // both arms lifted HIGH to the City in joy. h≈38*S.
    const ch = 38 * S;
    // the little pilgrim, home at last — face and both arms lifted HIGH to the City
    E.paintMask(out, counter, rng, {
      x: fx, y: fy, h: ch, facing: 1, shadow: 0,
      armL: [fx - 10 * S, fy - ch * 0.86], armR: [fx + 10 * S, fy - ch * 0.86],
      eye: [0, -1], mood: 'joy',
    });
  }
  fgRanges.push([_fg, out.length]);   // ← the redeemed + the red child (FG plane, nearest)

  /* ---------------- 8. WILDFLOWERS — the City's garden blazes (Rev 22:2; Isa 35:1) ---------------- */
  /* ⚠ 340 SCATTERED DOTS IS NOT A GARDEN, IT IS SPRINKLES — the same fault `gift` had, and
     the loudest thing on a plain that should be quiet under the City. Flowers grow in
     COLONIES: ~32 patches, each a family of ONE colour, each bloom a stem and petals and a
     lit centre, sized by the same depth gradient so they carry the recession instead of
     fighting it. And the families stay WARM — white, cream, gold, and pink for warmth. Cold
     specks scattered through a warm field fragment the surface. */
  {
    /* ⚠ AND KEEP THEM SMALL. At gift's petal size the near colonies came back as popcorn
       scattered over the meadow — gift can carry them because its blooms are pink and lilac
       against a darker field; here half the families are white on a bright meadow, so the
       same size reads as blobs. Two families of white at most, the rest warm, and the heads
       a shade under. */
    const PETALS = [['#ffd9e6', '#f6c0d6'], ['#ffe7a8', '#f6cf7a'], ['#fdfdfa', '#eee9dc'],
                    ['#ffd9a4', '#f4bd80'], ['#f6c0d6', '#e8a8c4'], ['#fff0b4', '#f0da8a']];
    for (let c = 0; c < 28; c++) {
      const cx = -10 + rng() * 820;
      const cy = horizon + 16 + (c < 11 ? rng() * 0.42 : rng()) * (508 - horizon - 16);
      const pal = PETALS[(rng() * PETALS.length) | 0];
      const spread = 26 + rng() * 54, count = 5 + (rng() * 9) | 0;
      for (let i = 0; i < count; i++) {
        const fx = cx + (rng() + rng() - 1) * spread;
        const fy = cy + (rng() + rng() - 1) * spread * 0.4;
        if (onRiver(fx, fy) || inTreeOfLife(fx, fy) || fy < hillTop(fx) + 6) continue;
        const sc = dS(fy), st = (7 + rng() * 8) * sc;
        paintPath(out, counter, rng, [[fx, fy], [fx + (rng() - 0.5) * 4, fy - st]],
          (x, y, r) => jig(mix('#4e7a3c', '#7fa84e', r()), r, 7), { lw: 1.2 * sc, len: 3, density: 0.9, jitter: 0.3 });
        const pet = pal[(rng() * 2) | 0], hd = 2.05 * sc;
        for (let k = 0; k < 5; k++) {
          const a = k * 1.256 + rng() * 0.35;
          out.push(`<ellipse cx="${R1(fx + Math.cos(a) * hd)}" cy="${R1(fy - st + Math.sin(a) * hd)}" rx="${R1(1.75 * sc)}" ry="${R1(1.25 * sc)}" transform="rotate(${R1(a * 57)} ${R1(fx + Math.cos(a) * hd)} ${R1(fy - st + Math.sin(a) * hd)})" fill="${pet}" opacity="0.94"/>`);
          counter.n++;
        }
        out.push(`<circle cx="${R1(fx)}" cy="${R1(fy - st)}" r="${R1(1.05 * sc)}" fill="#ffe9a8"/>`); counter.n++;
      }
    }
  }

  const ALT = 'The New Jerusalem at the consummation: the Father\'s house grown into a radiant city of pure gold climbing a hill, many glowing homes and towers with white-hot windows, crowned by an open gate. At its heart burns the Lamb-light — a great white-and-gold radiance that fills the whole sky so there is no sun and no candle and no shadow anywhere; the one page with no dark at all — and round about it a bow of light, in sight like unto an emerald (Revelation 4:3). The foundations of the city wall are garnished with the twelve precious stones in their order, jasper to amethyst (Revelation 21:19-20), and lilies are carved on the tops of the gate pillars. A pure river of water of life, clear as crystal, proceeds out of the city from the throne: it sweeps across the far meadow and comes down to the reader as clear aqua water, the jewel stones of its bed showing through it, lined with trees of many kinds — palm, olive, fig, cedar, apple — and on its near bank stands THE TREE OF LIFE, the grandest tree of all, its emerald canopy bearing exactly twelve fruits in twelve different colours, one ring round the crown, each with a gleam of the light. Up the banks the redeemed walk in the light with their faces lifted, and among them one small red child — you — home at last, arms flung up to the glory. And there shall be no night there.';

  // MULTIPLANE: assemble the requested depth plane. Each is its own cel —
  // transparent where it has no content — so they stack and parallax apart.
  const RAW = { undercoat: 0, weave: 0, varnish: 0, oil: 0 };   // no baked surface — the live filter unifies the planes
  const setOf = ranges => { const s = new Set(); for (const [a, b] of ranges) for (let i = a; i < b; i++) s.add(i); return s; };
  const pick = ranges => ranges.map(([a, b]) => out.slice(a, b).join('\n')).join('\n');
  const farSet = setOf(farRanges), fgSet = setOf(fgRanges);
  if (LAYER === 'sky') return svgWrap(ALT, out.slice(0, skyEnd).join('\n'), RAW);   // radiant sky ground (opaque backmost)
  if (LAYER === 'far') return svgWrap(ALT, pick(farRanges), RAW);                   // the City of gold + glory + Lamb-light
  if (LAYER === 'fg') return svgWrap(ALT, pick(fgRanges), RAW);                     // the redeemed + the red child (nearest)
  if (LAYER === 'mid') {                                                            // river, trees, meadow, wildflowers (everything unclaimed)
    const body = out.filter((_, i) => i >= skyEnd && !farSet.has(i) && !fgSet.has(i)).join('\n');
    return svgWrap(ALT, body, RAW);
  }
  // full painting (desktop): byte-identical to the original single-layer paint
  return svgWrap(ALT, out.join('\n'));
}
