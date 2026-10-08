// gen/plates/hands.mjs — "The threefold cord"
//
//   "Two are better than one... for if they fall, the one will lift up his fellow: but
//    woe to him that is alone when he falleth... and a threefold cord is not quickly
//    broken." — Ecclesiastes 4:9-12
//
// ══ WHY THIS PAGE WAS THROWN AWAY AND STARTED AGAIN ═══════════════════════════════
// It used to be a European town lane — cobbles, terraced houses, a lamp post. Fred:
// "i dont think the city is working, it is out of place." He is right, and the reason
// is structural: this book has ONE world — a green country the child walks through, a
// road, hills, trees, water, and the Father's house at the end of it. Thirty-two pages
// live there and one lived in a town, so the town read as a visitor from another book
// however well it was painted.
//
// ══ THE NEW IDEA: THEY CROSS THE WATER ON STONES ══════════════════════════════════
// The page needs a REASON to slip that a child recognises instantly and that belongs to
// this landscape. So the road the book has been walking all along comes down to a brook,
// and the crossing is a line of stepping stones. Wet stone, moving water, one foot going
// — every child has felt it. And the moment the verse describes ("if they fall, the one
// will lift up his fellow") happens where it is most true: out over the water, where you
// cannot catch yourself, and the only thing holding you is the hands either side.
// The stones are also the picture of the verse: separate stones, one crossing.
//
// Paint order (= rng order — append only):
//   1 · SKY + the hills the road comes down from      [BG, opaque]
//   2 · the far bank, its trees, the road descending  [FAR]
//   3 · THE BROOK — the water, its bed, the light     [MID]
//   4 · THE STEPPING STONES + their reflections       [MID]
//   5 · the near bank, reeds, flowers                 [FG]
//   6 · eggs

export const name = 'hands';
export const title = 'The threefold cord';
export const caption = 'One slips. The others hold.';
export const seed = 20260619;
export const focal = { x: 400, y: 400 };   // the crossing
export const layers = [
  // ⚠ bg and grass are the two that BOIL (scene.js BOIL_PLANES[23]): the sky breathes and
  // the grass sways. `far` holds the treeline and the distant hills — a hill that breathes
  // reads as the land itself wobbling — and `fg` is a thin verge mostly behind the poem, so
  // stays still. Both boiling planes are in BOIL_HARD: `bg` because it is opaque, `grass`
  // because it is a TRANSPARENT plane over the sky, and a cross-fading one shows two
  // positions of the grass with the sky between them — the whole field went pale the first
  // time it ran without that.
  { name: 'bg', opaque: true },   // the air, and the hills the road comes down from
  { name: 'cloud' },              // the clouds — they DRIFT (CLOUD_DRIFT), they do not boil
  { name: 'far' },                // the treeline, the distant hills, the far road
  { name: 'mid' },                // the GROUND: sward body, hollows, road, stones — never moves
  { name: 'grass' },              // everything that STANDS UP out of it, and the verge   [BOILS]
];

export function paint(E, opts = {}) {
  const {
    mulberry32, fbm, curlV, mix, ramp, jig, strokes, rej, paintPath,
    lightRadial, svgWrap, R1, W, H, ridge, horizonFringe, distantHills, waterCourse,
  } = E;

  const rng = mulberry32(seed);
  const out = [];
  const counter = { n: 0 };
  const LAYER = opts.layer || 'full';
  const farRanges = [], fgRanges = [], grassRanges = [], cloudRanges = [];

  // ⚠⚠ THE WIND ON THIS PAGE IS DRAWN, NOT DISPLACED. Fred, twice: "it looks like its
  // blinking", then "now its blinking and not moving". Both readings were right, and the
  // cause is the same one: a BOIL FIELD slides the whole plane sideways, and a blade does
  // not slide — it BENDS, its tip swinging while its root stays in the ground. A rigid 1px
  // shift of every blade at once is nearly invisible, so all that was left to see was the
  // switch between drawings: a hard cut read as a blink, and the cross-fade read as the
  // whole layer pulsing. Neither was motion, because there was no motion in them.
  //   So the lean is AUTHORED here, the way bridge.mjs draws its sky at a moment in its own
  // cycle: every grass mark is a little blade rotated about its base, and each drawing
  // rotates them a bit further. That is a bend, and a bend is what the eye reads as wind.
  // The plane's own displacement is turned down to almost nothing (BOIL_FIELD in build.mjs)
  // so nothing slides — all the movement comes from the drawing.
  const _FN = Math.max(1, globalThis.__FRAME_N || 1);
  const _FR = (globalThis.__FRAME || 0) % _FN;
  const WIND = _FN > 1 ? Math.cos(2 * Math.PI * _FR / _FN) : 0;      // -1 .. +1
  // near grass answers the gust more than far grass — aerial perspective, in time
  const gust = y => WIND * (0.35 + 0.65 * Math.max(0, Math.min(1, (y - 320) / 190)));
  // ⚠⚠ HOW A SKY ACTUALLY MOVES — and why three attempts before this were wrong.
  // Fred: "find out how sky moves, and we work from there?" What a sky does, in the order
  // you see it:
  //   1 ADVECTION. The cloud field TRANSLATES downwind, steadily, in ONE direction. This is
  //     nearly all of the visible motion. A sky never rocks back and forth.
  //   2 SHEAR. High cloud runs faster than low, so the sky slides in layers.
  //   3 EVOLUTION. Individual clouds bloom and dissolve at their edges — slow, and second.
  // What it does NOT do is turn and stretch bodily, which is what the previous version did
  // (Fred: "no no i dont like this") — that reads as the whole sky shearing in place.
  //
  // ⚠ THE LOOP IS WHY EVERY ATTEMPT FOUGHT ITSELF. A ring of N drawings must return to its
  // start, and fbm/curl noise is not periodic, so a drift built on it HAS to come back —
  // hence a cosine (rocks) or an ellipse (orbits). Neither is advection.
  //   The way out is to make the cloud field PERIODIC ACROSS THE PLATE and then drift it by
  // exactly one period per cycle: the clouds travel one way for ever and drawing N lands
  // back on drawing 0 seamlessly. Layers may run at DIFFERENT speeds and still close, as
  // long as each covers a whole number of periods — so the high sheet takes two periods to
  // the low sheet's one, which is the shear, honestly done and still looping.
  const SKY_P = 400;                                   // the field repeats across the plate
  const skyPh = _FN > 1 ? (_FR / _FN) : 0;             // 0..1 through the cycle
  // a band-limited periodic field: harmonics in x (so it repeats), with the y term giving
  // each harmonic its own slant and thickness so the result is cloud and not corduroy
  const sheet = (x, y, laps, seedPh) => {
    const u = (x + skyPh * laps * SKY_P) * 2 * Math.PI / SKY_P;
    return 0.5
      + 0.30 * Math.sin(u * 2 + y * 0.021 + seedPh)
      + 0.20 * Math.sin(u * 3 - y * 0.034 + seedPh * 1.7 + 1.1)
      + 0.13 * Math.sin(u * 5 + y * 0.049 + seedPh * 0.6 + 2.4)
      + 0.09 * Math.sin(u * 8 - y * 0.028 + seedPh * 2.3 + 0.4)
      + 0.06 * Math.sin(u * 13 + y * 0.017 + seedPh * 1.2 + 3.0);
  };
  // ⚠⚠ AND ON THIS PAGE THE SKY DOES NOT SHEAR. Fred: "a sky can be chill, can be violent
  // like what we made in storm, you need to see the words and then do the painting."
  //   The words here are "You were not alone... when one of you slipped, the rest held on."
  // So this sky is CALM, and — the part that matters — it moves ALL OF A PIECE: every layer
  // at the same speed, in the same direction, nothing tearing away from anything else. I had
  // built the high sheet running at twice the low one, which is what a real sky does and is
  // exactly wrong HERE: layers pulling apart is the picture of the opposite sentence. On
  // `storm` that shear is the point; on a page about holding together, the sky holds
  // together too.
  const cloud = (x, y) => sheet(x, y, 0, 0.0) * 0.72
    // ⚠ a STATIC term breaks the repeat. The drifting part must be periodic or the loop
    // cannot close, and a periodic field tiles visibly across the plate. This one never
    // moves, so it costs the loop nothing and destroys the wallpaper.
    + fbm(x / 110, y / 70, 51) * 0.28;
  // ⚠ THE BRUSH KEEPS ITS OWN CHARACTER. I first took the stroke direction from the cloud
  // field's contour so the marks would travel with the weather — and it flattened the sky:
  // a smooth banded field has smooth banded contours, so every mark lay the same way and the
  // scalloped, layered brushwork this page had was gone.
  //   The strokes are the MEDIUM and the clouds are the tonal masses moving through them —
  // that is how paint on a canvas actually behaves. So the direction stays the plate's own
  // curl, unchanged and unmoving, and only the light and dark of the weather advects across
  // it. A small share of the cloud's own contour is mixed in so the marks still answer the
  // forms they are describing, without being ruled by them.
  const cloudDir = (x, y) => {
    const [vx, vy] = curlV(x, y, 168, 74);
    const base = Math.atan2(vy * 0.85, Math.abs(vx) + 0.85);
    const e = 6;
    const gx = cloud(x + e, y) - cloud(x - e, y);
    return base + Math.max(-0.5, Math.min(0.5, -gx * 1.6)) * 0.34;
  };

  const horizon = 236;
  // ⚠ REACH 340, NOT 560. At 560 the sun's warm mix reached every corner of the sky, so
  // `mix(blue, cream, sun*0.42)` ran over the WHOLE upper half and turned a spring morning
  // grey — the desaturation was not the ramp's fault, it was the light's. A sun warms the
  // air AROUND it; past that the sky is simply blue.
  const sun = lightRadial(196, 66, 340);          // morning, high and to the left
  const dS = y => 0.32 + 1.0 * Math.max(0, Math.min(1, (y - horizon) / (H - horizon)));

  /* ══ 1 · THE SKY, AND THE HILLS THE ROAD COMES DOWN FROM ═══════════════════ */
  out.push(`<rect width="${W}" height="${H}" fill="#6fbcea"/>`);
  // ⭐ DETAIL PASS (Sep 8) — the SKY only (the meadow, ford and lane are Aug 30 work and
  // stay). EVERY STROKE DRAWS ITS OWN WIDTH AND LENGTH (Fred: "use no rules"): the sky was
  // a roof of same-size scallops; now it is strokes, each its own size.
  const free = (x, y, salt) => { const n = Math.sin(x * 12.9898 + y * 78.233 + salt) * 43758.5453; return n - Math.floor(n); };
  const widthOf  = (x, y, salt) => 0.40 + 3.2 * Math.pow(free(x, y, salt), 2.6);
  const lengthOf = (x, y, salt) => 0.40 + 1.5 * Math.pow(free(x, y, salt + 17), 1.5);
  const _M0 = E.getManifold(); E.setManifold(0.015);   // no complementary flecks on open sky
  strokes(out, counter, {
    rng, n: 4200,
    sample: rej(-12, -12, 812, horizon + 20),
    // ⚠ the FLOW travels with the weather, so each drawing's marks lie a different way —
    // this is what stops the four skies being one sky in four places
    dir: (x, y) => cloudDir(x, y),
    col: (x, y, r) => {
      // ⚠ `t` uses the TRUE y: the sky's vertical ramp is the time of day and must not
      // drift. Only the cloud term below travels.
      const t = Math.max(0, Math.min(1, (horizon - y) / horizon));
      // ⚠ THE TOP OF THE RAMP WAS NIGHT-BLUE. A zenith really is darker than the horizon,
      // but '#2b76bd' across the upper half turned a spring morning into weather. The
      // darkest note is now a clean mid blue, and the warmth sits low where the sun is.
      let c = ramp(['#ffeec4', '#dcecf2', '#a8d4ee', '#7cbde8', '#5aa9e0', '#4897d6'],
        t * 0.86 + (cloud(x, y) - 0.5) * 0.52);
      c = mix(c, '#fff2cc', sun(x, y) * 0.5);
      return jig(c, r, 7);
    },
    // ⚠ relief 0.1 on air — the whole-book lesson: at its default of 1 every big mark
    // carries a lit AND a shadow edge and the sky tiles into grey slabs.
    len: (x, y) => 22 * lengthOf(x, y, 11 + 131 * _FR), lw: (x, y) => 2.8 * widthOf(x, y, 13 + 173 * _FR), steps: 3, lenJ: 0.3, wJ: 0.3, impasto: 0.3, relief: 0.1,
  });
  // ══ THE CLOUDS THEMSELVES ═══════════════════════════════════════════════════
  // ⚠⚠ THE SKY HAD NO CLOUDS IN IT. Everything above is AIR — a wash of scalloped marks in
  // a curl field — and for four rounds I kept animating that wash and asking why it read as
  // texture crawling rather than weather passing. Fred, teaching: "a sky can be chill, can
  // be violent like what we made in storm, you need to see the words and then do the
  // painting." You cannot paint a calm sky by tuning noise; a calm sky has CLOUDS in it,
  // sitting quietly, and the calm is in how they sit and how they travel.
  //   The words are "You were not alone... when one of you slipped, the rest held on." So:
  // soft fair-weather cloud, well spaced, none of it torn; lit on top from the morning sun
  // at the left, cool underneath; and every one of them drifting at the SAME slow speed in
  // the SAME direction, because nothing on this page pulls away from anything else.
  //   ⚠ They wrap: each is carried by `skyPh` across one full span and re-enters from the
  // left, so the clouds travel one way for ever and drawing N still lands on drawing 0.
  {
    const _cloud0 = out.length;
    const cRng2 = mulberry32(seed ^ 0xc10d);
    const SPAN = 940;
    const CL = [];
    for (let i = 0; i < 17; i++) {
      CL.push({ x0: cRng2() * SPAN, y: 24 + Math.pow(cRng2(), 1.35) * 150,
                w: 54 + cRng2() * 96, h: 15 + cRng2() * 22, s: cRng2() * 999,
                ph: i / 17 + cRng2() * 0.03 });   // its own place in the cycle — staggered
    }
    for (const c of CL) {
      // ⚠⚠ THE CLOUDS DO NOT JUMP BETWEEN DRAWINGS ANY MORE, AND THIS IS THE WHOLE POINT.
      // They used to be carried a quarter of a span per drawing, which measured as motion
      // (79-82% of the sky changing) and read as none: two drawings dissolving into each
      // other with the clouds in DIFFERENT PLACES is a cross-fade, not a journey — one
      // cloud fades out here while another fades in over there. Fred saw it immediately:
      // "make the cloud move."
      //   Clouds move by TRANSLATING, continuously, so that is done where it belongs — the
      // cloud plane slides as one sheet (CLOUD_DRIFT[23] in engine/scene.js), which is
      // smooth and never steps. What the drawings carry instead is EVOLUTION: the same
      // clouds, a little further through their own growing and dissolving. That is the true
      // division of labour in a sky, and each half now does the thing it can actually do.
      // ⚠⚠ STOP MOTION. Fred: "you can trick this by doing like a stop motion video. use like
      // 5 frames or something, and make those 5 frames rotate periodically to show movement."
      // That is the method, and it fixes the last fault too: my version stepped the clouds
      // with a SINE, so they eased at each turn and read as a rock rather than a drift.
      //   Every cloud now travels at a STEADY speed in ONE direction — a plain sawtooth, the
      // same distance every frame, which is what stop motion is. The loop closes without
      // anything snapping back because each cloud also BLOOMS AND DISSOLVES across its own
      // pass: invisible at the start of its run, full in the middle, gone again by the end.
      // So a cloud never has to jump home — it fades away and the next one is already coming
      // up behind it, and clouds forming and dissipating is what clouds actually do.
      //   ⚠ The phases are STAGGERED per cloud, so at any moment some are arriving, some are
      // full and some are going. Without that the whole sky would pulse together.
      const life = (skyPh + c.ph) % 1;                     // where this cloud is in its pass
      const cx = c.x0 - 70 + life * 190;                   // steady, one way, every frame
      const born = Math.sin(life * Math.PI);               // 0 -> 1 -> 0 across the pass
      if (born < 0.04) continue;                           // nothing to draw at the very ends
      const cy = c.y;
      // higher cloud is smaller and paler: the sky recedes upward as much as it does back
      const dep = Math.max(0, Math.min(1, (cy - 10) / 190));
      // the drawing's own moment in this cloud's life: it swells and thins a little, and
      // its lumps move round its edge — the same cloud, a breath later
      const ev = Math.sin(skyPh * Math.PI * 2 + c.s);
      const w = c.w * (0.62 + dep * 0.52) * (0.82 + born * 0.22) * (1 + ev * 0.05);
      const h = c.h * (0.62 + dep * 0.52) * (0.82 + born * 0.22) * (1 - ev * 0.06);
      const cr = mulberry32((c.s | 0) + 7);
      // the body — a soft mass with a flat-ish base and a rounded, lit crown
      strokes(out, counter, {
        rng: cr, n: Math.round(240 + w * 3.6),
        sample: r => {
          const a2 = r() * Math.PI * 2, d2 = Math.pow(r(), 0.55);
          const lobe = 0.72 + 0.42 * Math.sin(a2 * 3 + c.s + skyPh * Math.PI * 2);   // lumpy, and the lumps travel round it
          const px = cx + Math.cos(a2) * w * d2 * lobe;
          let py = cy + Math.sin(a2) * h * d2 * lobe;
          if (py > cy) py = cy + (py - cy) * 0.44;                 // the base flattens
          return [px, py];
        },
        dir: (x, y) => 0.06 + (x - cx) / (w * 9),
        col: (x, y, r) => {
          const up = Math.max(0, Math.min(1, (cy + h * 0.5 - y) / (h * 1.6)));   // 1 at the crown
          const lit = Math.max(0, Math.min(1, (cx + w * 0.5 - x) / (w * 1.7)));  // sun is to the LEFT
          // ⚠ FAIR-WEATHER, NOT WEATHER. The first pass sat too dark under and read as
          // rock rather than cloud — on a page whose sentence is reassurance, the clouds
          // must be light things. The ramp starts higher and the underside is a cool
          // shadow, not a bruise.
          let col = ramp(['#a8c6de', '#c8dcec', '#e2edf5', '#f2f7fa', '#fffdf6'],
            up * 0.58 + lit * 0.32 + (r() - 0.5) * 0.15);
          col = mix(col, '#fff2cc', sun(x, y) * 0.4 * (0.4 + up * 0.6));
          col = mix(col, '#8fb2cc', (1 - up) * 0.20);              // the cool underside
          return jig(col, r, 6);
        },
        len: (x, y) => 10 * lengthOf(x, y, 21 + (c.s | 0)), lw: (x, y) => 2.0 * widthOf(x, y, 23 + (c.s | 0)), steps: 2, lenJ: 0.3, wJ: 0.3, impasto: 0.35, relief: 0.12,
        op: (0.62 + dep * 0.24) * Math.min(1, born * 1.5),
      });
    }
    cloudRanges.push([_cloud0, out.length]);
  }
  E.setManifold(_M0);
  const skyEnd = out.length;

  /* ══ 2 · THE FAR BANK — the country the road comes down through ════════════ */
  const _far0 = out.length;
  const crest = ridge(horizon, { amp: 22, freq: 158, bumps: 0.5, seed: 131 });
  distantHills(out, counter, rng, {
    topFn: x => crest(x) - 34 - 18 * Math.sin(x / 137 + 1.4),
    horizonFn: x => crest(x) - 2,
    cols: ['#8fb2c6', '#a6c4d2', '#c0d8e0'],
    depth: 44, lightFn: sun, seed: 404,
  });
  farRanges.push([_far0, out.length]);

  // the meadow of the far bank, running down to the water's edge
  // ⚠ THE WATER HAS TO BE WORTH CROSSING. At 392 the brook was a strip along the bottom
  // and the stones read as a gravel path; the page is about a crossing, so the water gets
  // real width and the stones go out INTO it.
  const inFordRef = { v: () => false };   // set once the ford's edges are known
  const WATER_TOP = 352;                                   // where the far bank meets the brook
  const bankEdge = x => WATER_TOP - 10 + Math.sin(x / 96 + 0.7) * 7 + (fbm(x / 40, 3.1, 611) - 0.5) * 9;
  const swell = (x, y) => fbm(x / 152, y / 70, 313);
  const facing = (x, y) => { const e = 7;
    return (swell(x - e, y) - swell(x + e, y)) * 2.0 + (swell(x, y - e) - swell(x, y + e)) * 1.3; };
  const haze = y => Math.max(0, Math.min(1, 1 - (y - horizon) / 80));
  // ⚠⚠ THE FAR MEADOW IS MOST OF THE GREEN ON THIS PAGE, and it had no clump field and no
  // shadow term at all — a smooth ramp, which is precisely a mat. I improved the NEAR field
  // first and the page barely changed, because the near field is the bottom third and this
  // is everything above it. Same medicine: a tuft-scale field driving the ramp, and hollows
  // that keep their own colour. `clump` is shared with nearCol so both halves of the valley
  // are made of the same grass.
  const clump = (x, y) => fbm(x / 26, y / 17, 331);
  // ⚠⚠ AND THE GREEN WAS NOISY, NOT VARIED. Measured against gift's field on the page:
  // gift holds a TIGHT WARM range (hue 43-123 deg, sd 37) — olive through yellow-green —
  // while this one sprayed 45-215 deg at sd 69, because the manifold fleck's complement of
  // green is VIOLET and the flower colonies carried strong blue and lilac. More colour
  // variety, and the wrong kind: cold specks scattered through a warm field fragment the
  // surface, so the eye gives up on it as one thing and reads flat green with litter on it.
  // The fleck is dropped to a third here and the flowers pulled toward white, cream and
  // yellow — which is also what gift's meadow actually has.
  const _fieldMF = E.getManifold();
  const grassCol = (x, y, r, lift) => {
    const depth = Math.max(0, Math.min(1, (y - horizon) / (H - horizon)));
    const cl = clump(x, y);
    const brk = (fbm(x / 120, y / 80, 217) - 0.5) * 0.2;
    let c = ramp(['#1a3a16', '#25501d', '#356a28', '#4a8434', '#639c3e', '#82b44c', '#a6cc5e', '#cfe084'],
      fbm(x / 48, y / 30, 93) * 0.26 + depth * 0.22 + facing(x, y) * 0.44 + swell(x, y) * 0.16
      + (cl - 0.5) * 0.58 + brk + lift);
    const sh = Math.max(0, 0.5 - cl) * 2;
    if (sh > 0.15 && r() < 0.2 + sh * 0.45) c = mix(c, '#22483a', 0.2 + sh * 0.32);
    c = mix(c, '#fff0bc', sun(x, y) * 0.4);
    c = mix(c, '#cfe2e6', Math.pow(haze(y), 1.7) * 0.55);
    return jig(c, r, 8);
  };
  {
    let d = `M-2 ${R1(crest(-2))}`;
    for (let x = -2; x <= 802; x += 2.4) d += `L${R1(x)} ${R1(crest(x) + (fbm(x / 3.2, 2.2, 613) - 0.5) * 6)}`;
    d += `L802 ${R1(WATER_TOP + 6)}L-2 ${R1(WATER_TOP + 6)}Z`;
    out.push(`<path d="${d}" fill="#2c6a2c"/>`); counter.n++;
  }
  // ⚠⚠ MORE MARKS AT ONE VALUE IS A THICKER MAT. I added a nap layer and more tufts here
  // and the field came back FLATTER than before — because every pass lays mid-tone, and
  // underneath them all sat a flat mid-green fill, so a hollow could never be dark: wherever
  // marks were sparse you saw the fill, and the fill was the same value as the marks.
  //   Shadow in a real sward is not darker strokes, it is FEWER of them over dark ground.
  // So the hollows are painted in first, broadly, and every later pass is kept OUT of them
  // (see the clump rejections below). That is what makes gift's field read as clumps with
  // dark between rather than as one surface.
  {
    const uRng = mulberry32(seed ^ 0x0dd1);
    strokes(out, counter, {
      rng: uRng, n: 2200,
      sample: rej(-10, horizon - 8, 810, WATER_TOP + 6,
                  (x, y) => y > crest(x) - 1 && y < bankEdge(x) + 5 && clump(x, y) < 0.5),   // the road paints over this later
      dir: (x, y) => { const [vx, vy] = curlV(x, y, 150, 66); return Math.atan2(vy * 0.8 - 0.2, Math.abs(vx) + 0.7); },
      col: (x, y, r) => {
        const d2 = Math.max(0, 0.5 - clump(x, y)) * 2;
        let c = ramp(['#0e2c14', '#143818', '#1b4620', '#235628'], fbm(x / 30, y / 20, 337) * 0.5 + (1 - d2) * 0.5);
        c = mix(c, '#cfe2e6', Math.pow(haze(y), 1.7) * 0.5);
        return jig(c, r, 7);
      },
      len: (x, y) => 15 * dS(y), lw: (x, y) => 5.0 * dS(y), steps: 3, lenJ: 0.5, impasto: 0.3, relief: 0.22,
    });
  }
  horizonFringe(out, counter, rng, {
    horizonFn: crest, cols: ['#2c6a2c', '#3d8438', '#5aa049', '#84be58'],
    hMax: 19, lightFn: sun, seed: 619, dirJitter: 0.72,
  });
  // ⚠ THE ROAD IS THE BOOK'S OWN ROAD. It comes down out of the hills and ENDS AT THE
  // the near half of the same road picks it up at the join (see section 4).
  const roadP = t => [400 + Math.sin(t * 2.6) * 26 * (1 - t), crest(400) + 8 + t * (WATER_TOP - crest(400) - 14)];
  const roadW = t => 7 + 46 * t * t;
  const onRoad = (x, y) => {
    for (let t = 0; t <= 1.001; t += 0.04) {
      const p = roadP(t);
      if (Math.hypot(x - p[0], (y - p[1]) * 1.7) < roadW(t) / 2) return true;
    }
    return false;
  };
  E.setManifold(_fieldMF * 0.34);
  strokes(out, counter, {                                   // the far meadow — the body of it
    rng, n: 2600,
    sample: rej(-10, horizon - 14, 810, WATER_TOP + 4, (x, y) => y > crest(x) - 1 && y < bankEdge(x) + 4 && !onRoad(x, y)),
    dir: (x, y) => { const [vx, vy] = curlV(x, y, 150, 66); return Math.atan2(vy * 0.85 - 0.12, Math.abs(vx) + 0.7); },
    col: (x, y, r) => grassCol(x, y, r, 0),
    len: (x, y) => 12 * dS(y), lw: (x, y) => 3.2 * dS(y), steps: 3, lenJ: 0.5, impasto: 0.45, relief: 0.32,
  });
  strokes(out, counter, {                                   // …and blades standing out of it
    rng, n: 3000,
    sample: rej(-10, horizon - 14, 810, WATER_TOP + 4, (x, y) => y > crest(x) - 1 && y < bankEdge(x) + 4 && !onRoad(x, y) && clump(x, y) > 0.38),
    dir: (x, y) => -Math.PI / 2 + (fbm(x / 12, y / 10, 101) - 0.5) * 1.1,
    col: (x, y, r) => grassCol(x, y, r, 0.06),
    len: (x, y) => 8 * dS(y), lw: (x, y) => 1.5 * dS(y), steps: 2, lenJ: 0.75, impasto: 0.55, relief: 0.3,
  });
  strokes(out, counter, {                                   // …and the finest nap over both
    rng, n: 2400,
    sample: rej(-10, horizon - 8, 810, WATER_TOP + 4, (x, y) => y > crest(x) + 2 && y < bankEdge(x) + 4 && !onRoad(x, y) && clump(x, y) > 0.42),
    dir: (x, y) => -Math.PI / 2 + (fbm(x / 7, y / 6, 103) - 0.5) * 1.5,
    col: (x, y, r) => grassCol(x, y, r, 0.2),
    len: (x, y) => 5 * dS(y), lw: (x, y) => 0.8 * dS(y), steps: 2, lenJ: 0.85, impasto: 0.65,
  });
  // ⚠ and blades long enough to READ as blades along the lower edge of it, where this field
  // comes close enough to the reader for single stems to be visible. Without them the far
  // meadow ends in the same fine stipple it began in, and the eye takes the whole band as
  // one surface however much value is in it.
  {
    const fRng2 = mulberry32(seed ^ 0x7ea5);
    for (let i = 0; i < 260; i++) {
      const x0 = -12 + fRng2() * 824;
      const lo = crest(x0) + 14, hi = bankEdge(x0) - 2;
      if (hi <= lo) continue;
      const y0 = lo + Math.pow(fRng2(), 0.5) * (hi - lo);
      if (onRoad(x0, y0)) continue;
      const sc = dS(y0);
      const hgt = (11 + fRng2() * 17) * sc;
      const lean = (fRng2() + fRng2() - 1) * 0.5;
      paintPath(out, counter, fRng2,
        [[x0, y0], [x0 + lean * hgt * 0.45, y0 - hgt * 0.55], [x0 + lean * hgt, y0 - hgt]],
        (x, y, r) => grassCol(x, y, r, 0.2 + (y0 - y) / hgt * 0.3),
        { lw: (0.8 + fRng2() * 0.4) * sc, len: 4, density: 0.9, jitter: 0.3 });
    }
  }
  strokes(out, counter, {                                   // the road down to the crossing
    rng, n: 600,
    sample: rej(-10, horizon, 810, WATER_TOP + 2, (x, y) => onRoad(x, y) && y < bankEdge(x) + 2),
    dir: () => 0.06,
    col: (x, y, r) => jig(mix(ramp(['#a8926a', '#c2ab80', '#dcc79a', '#efe0b6'], fbm(x / 24, y / 14, 41) + r() * 0.3),
      '#fff2cc', sun(x, y) * 0.4), r, 8),
    len: (x, y) => 9 * dS(y), lw: (x, y) => 2.6 * dS(y), steps: 2, lenJ: 0.5, impasto: 0.45, relief: 0.3,
  });
  // ⚠ THE BANK BETWEEN THE TREES AND THE WATER WAS A FLAT GREEN SLAB. Blades alone do not
  // make a field: it needs COLONIES of colour and tufts at a second scale, the way gift's
  // does, or the eye reads one shape however many strokes are in it.
  {
    const cRng = mulberry32(seed ^ 0x5bd1);
    for (let i = 0; i < 240; i++) {                          // tufts
      const tx = -10 + cRng() * 820;
      const ty = crest(tx) + 8 + Math.pow(cRng(), 0.6) * (bankEdge(tx) - crest(tx) - 10);
      if (onRoad(tx, ty)) continue;
      const sc = dS(ty);
      strokes(out, counter, {
        rng: cRng, n: 12,
        sample: r => [tx + (r() + r() - 1) * 8 * sc, ty - Math.pow(r(), 0.7) * 10 * sc],
        dir: (x, y) => -Math.PI / 2 + (x - tx) * 0.05,
        col: (x, y, r) => grassCol(x, y, r, 0.3),
        len: 9 * sc, lw: 1.0 * sc, steps: 2, lenJ: 0.7, impasto: 0.65,
      });
    }
    const PET = [['#fff6e2', '#efdcc0'], ['#ffe9a8', '#e8c46a'], ['#ffc247', '#e0942a'],
                 ['#f7f0dc', '#ded2b4'], ['#f0a0b4', '#d2748e']];
    for (let c = 0; c < 30; c++) {                           // flower colonies
      const cx2 = -10 + cRng() * 820;
      const cy2 = crest(cx2) + 12 + cRng() * (bankEdge(cx2) - crest(cx2) - 16);
      const pal = PET[(cRng() * PET.length) | 0];
      const spread = 20 + cRng() * 44, cnt = 4 + ((cRng() * 8) | 0);
      for (let i = 0; i < cnt; i++) {
        const fx = cx2 + (cRng() + cRng() - 1) * spread;
        const fy2 = cy2 + (cRng() + cRng() - 1) * spread * 0.4;
        if (fy2 < crest(fx) + 4 || fy2 > bankEdge(fx) - 3 || onRoad(fx, fy2)) continue;
        const sc = dS(fy2), st = (5 + cRng() * 6) * sc;
        paintPath(out, counter, cRng, [[fx, fy2], [fx + (cRng() - 0.5) * 3, fy2 - st]],
          (x, y, r) => jig(mix('#2c6a2c', '#6faa46', r()), r, 7), { lw: 1.0 * sc, len: 3, density: 0.9, jitter: 0.3 });
        const pet = pal[(cRng() * 2) | 0], hd = 2.0 * sc;
        for (let k = 0; k < 5; k++) {
          const a2 = k * 1.256 + cRng() * 0.35;
          const px = fx + Math.cos(a2) * hd, py = fy2 - st + Math.sin(a2) * hd;
          out.push(`<ellipse cx="${R1(px)}" cy="${R1(py)}" rx="${R1(1.8 * sc)}" ry="${R1(1.3 * sc)}" transform="rotate(${R1(a2 * 57)} ${R1(px)} ${R1(py)})" fill="${pet}" opacity="0.94"/>`);
          counter.n++;
        }
      }
    }
  }
  const _far1 = out.length;
  // ⚠ THE FAR BANK WAS A BARE GREEN BAND with two trees stuck in the corners. A brook in
  // this country runs through TREES — they line the far side, thin where the road comes
  // down so the way through stays open, and their reflections are what put the water in a
  // place rather than in a stripe.
  {
    const tRng = mulberry32(seed ^ 0x9e3779b9);
    for (let i = 0; i < 26; i++) {
      const tx = -30 + (i + tRng() * 0.85) / 26 * 872;
      if (Math.abs(tx - 400) < 66) continue;                 // leave the crossing clear
      const ty = crest(tx) + 16 + tRng() * 40;
      E.paintTree(out, counter, tRng, tx, ty, 44 + Math.pow(tRng(), 0.7) * 62,
        { lightFn: sun, shadowDir: tx < 400 ? 1 : -1, blossom: tRng() < 0.3 ? 3 : 0,
          tint: (c) => mix(c, '#cfe2e6', 0.26) });
    }
    // ⭐ AFTER HIS KIND (Sep 15): "as willows by the water courses" (Isa 44:4) — the two great
    // trees over the brook are willows; a sycomore and an olive stand back from the bank.
    for (const [tx, ty, th, sd, sp] of [[74, 372, 176, 1, 'willow'], [726, 376, 188, -1, 'willow'], [190, 350, 118, 1, 'sycomore'], [612, 354, 124, -1, 'olive']]) {
      E.paintTree(out, counter, rng, tx, ty, th, { lightFn: sun, shadowDir: sd, blossom: 4, species: sp });
    }
  }
  farRanges.push([_far1, out.length]);

  /* ══ 3 · NO WATER ON THIS PAGE AT ALL ════════════════════════════════════
     ⚠⚠ THE THIRD AND LAST WATER FAILURE. Fred: "in an island of stone in a lake, almost
     falling into the water..... the island should be a land, not an island." I first tried
     to answer that by moving the brook back into the middle distance — and the render made
     the point better than any argument: a flat teal band sitting directly behind three
     children still reads as "they are at the edge of the water, about to go in." The water
     was never carrying the page. Ecc 4:10 is about COMPANY on a road, and every minute
     spent making a river legible was a minute not spent on the road they walk. So the
     brook is gone. What remains is a green country valley with the road coming down
     through it — the same road the whole book walks. Do not put water back here. */
  const GROUND_TOP = 342;   // the far road ends at y338 w53 — the near one takes it from there
  const fHaze = y => Math.max(0, Math.min(1, 1 - (y - GROUND_TOP) / 116));

  /* ══ 4 · THE NEAR MEADOW AND THE ROAD COMING DOWN IT ══════════════════════ */
  {
    let d = `M-2 ${R1(GROUND_TOP)}`;
    for (let x = -2; x <= 802; x += 2.4) d += `L${R1(x)} ${R1(GROUND_TOP + Math.sin(x / 61) * 4)}`;
    d += `L802 ${H + 2}L-2 ${H + 2}Z`;
    out.push(`<path d="${d}" fill="#215026"/>`); counter.n++;
  }
  // the near field's hollows, painted before anything stands up out of them — same reason
  // as the far meadow above: a hollow can only be dark if the ground under it is.
  {
    const uRng = mulberry32(seed ^ 0x0dd2);
    strokes(out, counter, {
      rng: uRng, n: 2000,
      sample: rej(-10, GROUND_TOP - 4, 810, 516, (x, y) => clump(x, y) < 0.5),
      dir: (x, y) => { const [vx, vy] = curlV(x, y, 150, 66); return Math.atan2(vy * 0.8 - 0.2, Math.abs(vx) + 0.7); },
      col: (x, y, r) => {
        const d2 = Math.max(0, 0.5 - clump(x, y)) * 2;
        let c = ramp(['#0a2410', '#0f3016', '#173c1c', '#1e4a22'], fbm(x / 30, y / 20, 339) * 0.5 + (1 - d2) * 0.5);
        c = mix(c, '#cfe0b0', Math.pow(fHaze(y), 1.6) * 0.45);
        return jig(c, r, 7);
      },
      len: (x, y) => 18 * dS(y), lw: (x, y) => 5.4 * dS(y), steps: 3, lenJ: 0.5, impasto: 0.3, relief: 0.22,
    });
  }
  // the road: down out of the hills, over the stream, and on toward the reader — the same
  // road the whole book walks. It WIDENS toward us, which is what makes it a road you are
  // standing on rather than a stripe.
  const wayP = t => [400 + Math.sin(t * 2.2) * 22 * (1 - t), GROUND_TOP - 4 + t * (H + 22 - GROUND_TOP + 4)];
  const wayW = t => 52 + 566 * t * t;   // ⚠ was 404: at the children's feet the road was
                                        // 267 wide and they are 268, so they covered it
                                        // completely and the page lost the road it names
  const wayInfo = (x, y) => { let bt = 0, bd = 1e9;
    for (let t = 0; t <= 1.001; t += 0.03) { const p = wayP(t); const dd = Math.hypot(x - p[0], (y - p[1]) * 1.5); if (dd < bd) { bd = dd; bt = t; } }
    return { t: bt, d: bd }; };
  const onWay = (x, y) => { const { t, d } = wayInfo(x, y); return d < wayW(t) / 2; };
  // ⚠⚠ THIS FIELD WAS A GREEN SHAG. Fred: "the details are also bad." Two grass layers at
  // one value across the whole plain, no aerial perspective at all, and flowers as specks —
  // so the meadow read as a green SHAPE with children standing on it, and the join to the
  // far field showed as a hard seam. gift's plain is the standard here, and it is not more
  // marks, it is STRUCTURE: four layers at falling scales, a shadow that keeps its own hue
  // instead of going grey, hue broken locally at two frequencies, and distance going PALE.
  // The haze is also what dissolves the seam — the top of this field now arrives at the far
  // field's own value instead of butting up against it.
  // ⚠⚠ AND IT WAS STILL A MAT. Fred: "work on the grassy terrain." Cropping this field
  // beside gift's at the same scale says it in one look: gift's grass has DARK BETWEEN THE
  // CLUMPS — deep pockets of shadow with lit crests standing out of them, over an olive-to-
  // yellow range — and this one was a single mid-green with confetti on top. Four layers
  // did not save it, because all four were painted at the SAME VALUE; more marks at one
  // value is a thicker mat, not a better field.
  //   `clump` is what fixes it: a tuft-scale field (26px, about the size of a real clump)
  // that drives the ramp hard, so the grass falls into dark hollows and lit crowns the way
  // it actually grows. Everything else here — the depth ramp, the sun, the haze — only
  // shifts the whole field together and can never do this.
  const nearCol = (x, y, r, lift) => {
    const dep = Math.max(0, Math.min(1, (y - GROUND_TOP) / (H - GROUND_TOP)));
    const brk = (fbm(x / 130, y / 90, 211) - 0.5) * 0.24 + (fbm(x / 21, y / 15, 223) - 0.5) * 0.14;
    const cl = clump(x, y);
    let c = ramp(['#122c12', '#1d4019', '#2b5022', '#3c6a2c', '#528339', '#6c9c45', '#8ab853', '#b0cf6c'],
      fbm(x / 44, y / 28, 93) * 0.26 + dep * 0.2 + facing(x, y) * 0.42 + swell(x, y) * 0.16
      + (cl - 0.5) * 0.62 + brk + lift);
    // the hollow between two clumps keeps its own colour — broken colour, never a grey wash
    const sh = Math.max(0, 0.5 - cl) * 2;
    if (sh > 0.15 && r() < 0.2 + sh * 0.45) c = mix(c, '#1d4433', 0.22 + sh * 0.34);
    c = mix(c, '#fff0bc', sun(x, y) * 0.34);
    c = mix(c, '#cfe0b0', Math.pow(fHaze(y), 1.6) * 0.52);
    return jig(c, r, 8);
  };
  strokes(out, counter, {                                   // the sward of the near meadow
    rng, n: 3400,
    sample: rej(-10, GROUND_TOP - 4, 810, 514, (x, y) => !onWay(x, y)),
    dir: (x, y) => { const [vx, vy] = curlV(x, y, 150, 66); return Math.atan2(vy * 0.85 - 0.12, Math.abs(vx) + 0.7); },
    col: (x, y, r) => nearCol(x, y, r, 0),
    len: (x, y) => 16 * dS(y), lw: (x, y) => 3.6 * dS(y), steps: 3, lenJ: 0.6, impasto: 0.45, relief: 0.32,
  });
  // ⚠⚠ FROM HERE TO THE END OF THE COLONIES IS ITS OWN PLANE. Fred: "you are moving the
  // ground instead of the grass." Exactly what was happening: a boil field displaces every
  // mark in the PLANE, and `mid` holds the sward's body, the dark hollows, the road and the
  // stones as well as the blades — so the earth slid and the blades came along with it.
  // A field cannot tell a blade's root from its tip; only the plane split can. So everything
  // that STANDS UP out of the ground lives here and boils, and everything that IS the ground
  // stays behind in `mid` and never moves. It is string's soil-and-grass rule, made
  // structural instead of geometric, because a whole field has no single soil line to
  // measure from — every blade has its own.
  const _grass0 = out.length;
  strokes(out, counter, {                                   // blades standing out of it
    rng, n: 3200,
    sample: rej(-10, GROUND_TOP, 810, 514, (x, y) => !onWay(x, y) && clump(x, y) > 0.38),
    dir: (x, y) => -Math.PI / 2 + (fbm(x / 11, y / 9, 101) - 0.5) * 1.15 + gust(y) * 0.30,
    col: (x, y, r) => nearCol(x, y, r, 0.22),
    len: (x, y) => 12 * dS(y), lw: (x, y) => 1.2 * dS(y), steps: 2, lenJ: 0.9, impasto: 0.6,
  });
  strokes(out, counter, {                                   // 3 · the finest nap, close to us
    rng, n: 2800,
    sample: r => { const x = -10 + r() * 820, y = GROUND_TOP + 8 + Math.pow(r(), 0.8) * (514 - GROUND_TOP - 8);
                   return (onWay(x, y) || clump(x, y) < 0.42) ? null : [x, y]; },
    dir: (x, y) => -Math.PI / 2 + (fbm(x / 7, y / 6, 103) - 0.5) * 1.5 + gust(y) * 0.34,
    col: (x, y, r) => nearCol(x, y, r, 0.3),
    len: (x, y) => 6 * dS(y), lw: (x, y) => 0.8 * dS(y), steps: 2, lenJ: 0.85, impasto: 0.7,
  });
  for (let i = 0; i < 150; i++) {                           // 4 · and clumps, because grass grows in tufts
    const tx = -10 + rng() * 820;
    const ty = GROUND_TOP + 10 + Math.pow(rng(), 0.55) * (510 - GROUND_TOP - 10);
    if (onWay(tx, ty)) continue;
    const sc = dS(ty);
    strokes(out, counter, {
      rng, n: 14,
      sample: r => [tx + (r() + r() - 1) * 9 * sc, ty - Math.pow(r(), 0.7) * 11 * sc],
      dir: (x, y) => -Math.PI / 2 + (x - tx) * 0.05 + (fbm(x / 6, y / 6, 107) - 0.5) * 0.8 + gust(ty) * 0.32,
      col: (x, y, r) => nearCol(x, y, r, 0.34),
      len: 10 * sc, lw: 1.1 * sc, steps: 2, lenJ: 0.7, impasto: 0.65,
    });
  }
  // ⚠ CLOSE UP, GRASS IS INDIVIDUAL BLADES. Every pass above lays SHORT marks, which is
  // right for the body of a field and wrong for the two feet of it nearest the reader —
  // there a blade is a long arc you can follow from root to tip, and without a few hundred
  // of them the foreground stays a texture instead of becoming grass.
  {
    const bRng = mulberry32(seed ^ 0x1b1ade);
    for (let i = 0; i < 420; i++) {
      const y0 = 402 + Math.pow(bRng(), 0.75) * 116;
      const x0 = -12 + bRng() * 824;
      if (onWay(x0, y0)) continue;
      const sc = dS(y0);
      const hgt = (16 + bRng() * 30) * sc;
      const lean = (bRng() + bRng() - 1) * 0.55 + gust(y0) * 0.62;   // its own bend, plus this drawing's gust
      const pts = [[x0, y0],
                   [x0 + lean * hgt * 0.45, y0 - hgt * 0.55],
                   [x0 + lean * hgt * 1.05, y0 - hgt]];
      paintPath(out, counter, bRng, pts,
        (x, y, r) => nearCol(x, y, r, 0.24 + (y0 - y) / hgt * 0.34),   // tip catches the light
        { lw: (1.0 + bRng() * 0.5) * sc, len: 4, density: 0.95, jitter: 0.35 });
    }
    // and a few gone to seed — the tallest things in the sward, which is what stops it
    // reading as one mown surface
    for (let i = 0; i < 130; i++) {
      const y0 = GROUND_TOP + 26 + Math.pow(bRng(), 0.7) * (508 - GROUND_TOP - 26);
      const x0 = -12 + bRng() * 824;
      if (onWay(x0, y0)) continue;
      const sc = dS(y0);
      const hgt = (24 + bRng() * 26) * sc;
      const lean = (bRng() + bRng() - 1) * 0.5 + gust(y0) * 0.78;
      paintPath(out, counter, bRng, [[x0, y0], [x0 + lean * hgt * 0.4, y0 - hgt * 0.6], [x0 + lean * hgt, y0 - hgt]],
        (x, y, r) => jig(mix('#5c7a3e', '#9cb45e', r()), r, 7),
        { lw: 0.8 * sc, len: 4, density: 0.9, jitter: 0.3 });
      const hx = x0 + lean * hgt, hy = y0 - hgt;
      for (let k = 0; k < 5; k++) {                            // the head, a few grains
        E.daub(out, counter, hx + (bRng() - 0.5) * 2.4 * sc, hy + k * 1.5 * sc - 2 * sc,
          (0.7 + bRng() * 0.5) * sc, jig(ramp(['#8a9a52', '#b6bd6e', '#d8d089'], bRng()), bRng, 8), bRng);
      }
    }
  }

  // ⚠ WILDFLOWERS GROW IN COLONIES, NEVER IN A SCATTER. The far field already grows them
  // this way; the near one was left with evenly-sprinkled specks, which is exactly what
  // the book's own warning about confetti averaging to grey looks like on a plate.
  {
    const nRng2 = mulberry32(seed ^ 0x9a71);
    const PET2 = [['#fff6e2', '#efdcc0'], ['#ffe9a8', '#e8c46a'], ['#ffc247', '#e0942a'],
                  ['#f7f0dc', '#ded2b4'], ['#f0a0b4', '#d2748e']];
    for (let c2 = 0; c2 < 26; c2++) {
      const cx2 = -10 + nRng2() * 820;
      const cy2 = GROUND_TOP + 12 + Math.pow(nRng2(), 0.75) * (506 - GROUND_TOP - 12);
      const pal = PET2[(nRng2() * PET2.length) | 0];
      const spread = 22 + nRng2() * 50, cnt = 5 + ((nRng2() * 9) | 0);
      for (let i = 0; i < cnt; i++) {
        const fx = cx2 + (nRng2() + nRng2() - 1) * spread;
        const fy2 = cy2 + (nRng2() + nRng2() - 1) * spread * 0.42;
        if (fy2 < GROUND_TOP + 6 || fy2 > 510 || onWay(fx, fy2)) continue;
        const sc = dS(fy2), st = (6 + nRng2() * 7) * sc;
        paintPath(out, counter, nRng2, [[fx, fy2], [fx + (nRng2() - 0.5) * 3, fy2 - st]],
          (x, y, r) => jig(mix('#2c6a2c', '#6faa46', r()), r, 7), { lw: 1.0 * sc, len: 3, density: 0.9, jitter: 0.3 });
        const pet = pal[(nRng2() * 2) | 0], hd = 2.1 * sc;
        for (let k = 0; k < 5; k++) {
          const a2 = k * 1.256 + nRng2() * 0.35;
          const px2 = fx + Math.cos(a2) * hd, py2 = fy2 - st + Math.sin(a2) * hd;
          out.push(`<ellipse cx="${R1(px2)}" cy="${R1(py2)}" rx="${R1(1.4 * sc)}" ry="${R1(1.0 * sc)}" transform="rotate(${R1(a2 * 57)} ${R1(px2)} ${R1(py2)})" fill="${pet}" opacity="0.94"/>`);
          counter.n++;
        }
        E.daub(out, counter, fx, fy2 - st, 0.85 * sc, jig('#ffe9a8', nRng2, 8), nRng2);
      }
    }
  }
  grassRanges.push([_grass0, out.length]);   // ⚠ the grass band ENDS here — everything below
                                            //   (road, grit, contact shadows) is GROUND
  // the road surface — packed earth, worn paler along its crown where feet go
  // ⚠ MANIFOLD OFF for everything road. jig()'s complementary fleck is what gives the
  // meadow its wildflower sparkle, but the complement of warm earth is CYAN, and the
  // first render came back with the road strewn in turquoise grit like litter.
  const _mf = E.getManifold(); E.setManifold(0);
  strokes(out, counter, {
    rng, n: 5200,
    sample: rej(-10, GROUND_TOP - 6, 810, 516, (x, y) => onWay(x, y)),
    dir: (x, y) => { const { t } = wayInfo(x, y); const p = wayP(Math.min(1, t + 0.02)), q = wayP(t);
                     return Math.atan2(p[1] - q[1], p[0] - q[0]); },
    col: (x, y, r) => {
      const { t, d } = wayInfo(x, y);
      const crown = 1 - Math.min(1, Math.abs(d) / (wayW(t) / 2 + 0.001));
      let c = ramp(['#6b5a3e', '#87754f', '#a89168', '#c4ad83', '#dcc79c', '#efe0ba'],
        fbm(x / 26, y / 17, 41) * 0.5 + crown * 0.42 + (r() - 0.5) * 0.16);
      c = mix(c, '#fff2cc', sun(x, y) * 0.34);
      return jig(c, r, 5);
    },
    len: (x, y) => 13 * dS(y), lw: (x, y) => 4.0 * dS(y), steps: 3, lenJ: 0.45, impasto: 0.42, relief: 0.3,
  });
  E.dirtRoad(out, counter, rng, {
    ptFn: wayP, wFn: wayW, cols: ['#7d6a44', '#a89168', '#dcc79c'],
    lightFn: sun, ruts: 0.42, stones: 70, verge: 300, seed: 823,
  });
  E.setManifold(_fieldMF);
  // ⚠ AND THE THING SHE SLIPPED ON. Loose stone scattered down the steepest part of the
  // road, right under her feet — a scatter of rounded pebbles that roll, one kicked out
  // of place with a scuff of pale dust behind it. That is a fall anybody has had.
  {
    const gRng = mulberry32(seed ^ 0x51199);
    for (let i = 0; i < 110; i++) {
      const t = 0.58 + gRng() * 0.30;
      const p = wayP(t);
      const x = p[0] + (gRng() + gRng() - 1) * wayW(t) * 0.46, y = p[1] + (gRng() - 0.5) * 26;
      const r2 = (0.7 + gRng() * 1.5) * dS(y);
      E.daub(out, counter, x, y + r2 * 0.5, r2 * 0.9, jig('#4e4433', gRng, 5), gRng);
      E.daub(out, counter, x, y, r2, jig(ramp(['#6e685c', '#8a8375', '#a8a091', '#c4bcaa'], gRng()), gRng, 6), gRng);
    }
    for (let i = 0; i < 90; i++) {                          // the scuff of dust she kicked up
      const x = 400 + (gRng() + gRng() - 1) * 70, y = 476 + (gRng() - 0.5) * 26;
      E.daub(out, counter, x, y, (0.8 + gRng() * 2.2) * dS(y),
        jig(mix('#c9bb96', '#efe4c4', gRng()), gRng, 6), gRng);
    }
  }
  E.setManifold(_mf);
  // ⚠⚠ AND THEY HAVE TO TOUCH THE GROUND. Three children standing on a road with nothing
  // under them float, however well the road is painted — and a page whose whole sentence is
  // about being HELD UP cannot have its figures hovering. The trio is one sprite at x400,
  // so these are its three pairs of feet, measured off the render. Painted as daubs, never
  // as a gradient: a soft ellipse of flat black is a different medium and reads as one.
  {
    const shRng = mulberry32(seed ^ 0x5ad0);
    for (const [fx, fw] of [[307, 34], [404, 26], [493, 32]]) {
      for (let i = 0; i < 130; i++) {
        const a2 = shRng() * Math.PI * 2, d2 = Math.pow(shRng(), 0.55);
        const x = fx + Math.cos(a2) * fw * d2, y = 474 + Math.sin(a2) * fw * 0.34 * d2;
        const k = (1 - d2) * 0.6 + 0.15;
        E.daub(out, counter, x, y, (1.0 + shRng() * 2.4) * (1.2 - d2 * 0.5),
          jig(mix('#6a5c42', '#2a2418', k), shRng, 5), shRng);
      }
    }
  }
  const midEnd = out.length;

  /* ══ 5 · THE VERGE CLOSEST TO US ══════════════════════════════════════════ */
  const _grass1 = out.length;
  // ⚠ it joins the grass plane, not a plane of its own: the nearest grass standing still
  // while the grass just behind it sways would be the giveaway.
  strokes(out, counter, {
    rng, n: 900,
    sample: rej(-10, 452, 810, 516, (x, y) => !onWay(x, y)),
    dir: (x, y) => -Math.PI / 2 + (fbm(x / 9, y / 7, 131) - 0.5) * 1.2 + gust(y) * 0.36,
    col: (x, y, r) => nearCol(x, y, r, 0.3),
    len: (x, y) => 15 + (y - 450) * 0.12, lw: 1.5, steps: 2, lenJ: 0.8, impasto: 0.65,
  });


  /* ---------------- EGG: Ϛʹ·Ιʹ — Ecclesiastes 4:10, in the near reeds ---------------- */
  E.inscriptionText(out, E.greekRef(4, 10), { x: 148, y: 492, h: 10, body: '#1b4630', edge: '#e6fbe4', op: 0.46, edgeOp: 0.26 });

  grassRanges.push([_grass1, out.length]);

  const ALT = 'A wide green country valley under a bright sky, with trees standing along the low hills behind. The road the child has been walking comes down out of those hills toward the reader, widening as it comes, packed pale earth worn smooth along its crown. Three children are walking down it together. The middle one has skidded on the loose stone of the steep part and is going down, and the two either side have caught her by the forearms and lean back against her weight. Grass and wildflowers run away on both sides to the trees.'
  const RAW = { undercoat: 0, weave: 0, varnish: 0, oil: 0 };
  const setOf = ranges => { const s = new Set(); for (const [a, b] of ranges) for (let i = a; i < b; i++) s.add(i); return s; };
  const pick = ranges => ranges.map(([a, b]) => out.slice(a, b).join('\n')).join('\n');
  const farSet = setOf(farRanges), grassSet = setOf(grassRanges), cloudSet = setOf(cloudRanges);
  if (LAYER === 'bg') return svgWrap(ALT, out.slice(0, skyEnd).filter((_, i) => !cloudSet.has(i)).join('\n'), RAW);
  if (LAYER === 'cloud') return svgWrap(ALT, pick(cloudRanges), RAW);
  if (LAYER === 'far') return svgWrap(ALT, pick(farRanges), RAW);
  if (LAYER === 'grass') return svgWrap(ALT, pick(grassRanges), RAW);
  if (LAYER === 'mid') {
    const body = out.filter((_, i) => i >= skyEnd && i < midEnd && !farSet.has(i) && !grassSet.has(i)).join('\n');
    return svgWrap(ALT, body, RAW);
  }
  return svgWrap(ALT, out.join('\n'));
}
