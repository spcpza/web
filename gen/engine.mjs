import { node as gNode, BOOK as GBOOK } from './genome.mjs';   // the snowflake law
export { CAST, paintTheLight, paintTheChild, paintCarried, carriedChildAt } from './characters.mjs';   // the character library
// gen/engine.mjs — the Van Gogh brushstroke engine for balthazar.sh plates.
// Every stroke is authored: sampled in a region, bent by a flow field,
// colored from a ramp with per-stroke jitter (the shimmer).
//
// ============================== ENGINE API ==============================
// A plate module exports { name, title, caption, seed, focal, paint(E) }
// where E is this module's namespace. paint(E) returns a complete SVG string.
// focal: {x, y} — the composition's focal point in viewBox coords; the build
// uses it to window a portrait edition (312 wide, full height) per plate.
// Canvas is W x H = 800 x 500. Typical plate skeleton:
//
//   const rng = E.mulberry32(seed);          // ONE rng; call order = output
//   const out = [], counter = { n: 0 };      // svg fragments + stroke count
//   out.push(`<rect width="${E.W}" height="${E.H}" fill="#131b38"/>`);
//   ...layers of E.strokes(out, counter, {...})...
//   return E.svgWrap('alt text describing the scene', out.join('\n'));
//
// RANDOM     mulberry32(seed) -> rng()        seeded PRNG in [0,1)
// NOISE      vnoise(x,y,seed)                 value noise [0,1]
//            fbm(x,y,seed,oct=3)              fractal sum
//            curlV(x,y,seed,scale,oct=3)      -> [vx,vy] divergence-free swirl
//            swirlV(x,y,cx,cy,strength,falloff) -> [vx,vy] vortex around a center
//   Vector-field combinators: build dir(x,y)->angle by summing swirlV per
//   vortex + curlV*gain + a drift constant, then Math.atan2(vy,vx).
//   Contour/axis-follow: dir = slope of a silhouette fn, or a capsule axis.
// COLOR      mix(a,b,t) ramp(cols[],t)        hex interpolation / multi-stop
//            jig(c,rng,amt=14)                per-stroke jitter — the shimmer
//            lum(c)                           luminance 0..1 (gates impasto)
//   Palette constants: GOLD, GOLD_PALE, GOLD_DEEP, GOLD_HOT, NIGHT[], DARKEST
// LIGHT      lightRadial(cx,cy,reach) -> (x,y)->0..1   one dominant source,
//                exponential falloff; mix stroke color toward a warm tone by
//                g, and toward a cold tone by (1-g) — warm core, cold corners.
//            lightAlongPath(ptFn,reach,{steps,gainFn}) -> (x,y)->0..1
//                light carried by a parametric spine ptFn(t)->[x,y].
//   Complementary sparks: inside col(), where g sits in a thin band where the
//   light dies (e.g. 0.17<g<0.32) and rng()<~0.04, return the complement
//   (orange in blue, violet in gold). That edge flicker is the life.
// STROKES    strokes(out, counter, { rng, n, sample, dir, col, len, lw,
//                lenJ=0.35, wJ=0.3, aJ=0.22, steps=3, follow=1,
//                wild=0, impasto=0 })
//   sample(rng)->[x,y]|null   where strokes are born (use rej() for regions)
//   dir(x,y)->angle           the flow field (strokes bend along it: this is
//                             how a stroke FOLLOWS A FORM — arc round a star,
//                             flame up a cypress, recede toward a vanishing pt)
//   col(x,y,rng)->'#hex'      paint mixer, called once per stroke
//   len/lw                    base length / width; lenJ/wJ jitter fractions.
//                             EACH may be a number OR a fn (x,y)->number, so a
//                             single layer carries a SCALE GRADIENT (huge in
//                             the foreground, tiny at the horizon) — the depth
//                             cue that separates a drawing from a knitted field
//   aJ                        slash aggression (radians) — number, or a
//                             zone-aware fn (x,y)->radians (climbs near
//                             vortex cores / light, hushes in calm zones)
//   steps/follow              spine segments / how hard strokes bend to dir
//   wild>0                    long-tail width distribution: that fraction
//                             escapes the polite band — 62% raking 0.8-2.2px
//                             hairlines (1.3-2.7x len), rest fat 8-14px slabs
//   impasto>0                 strokes brighter than that luminance get a
//                             darker double-strike offset 1px below — thick
//                             paint catching its own shadow
//   relief=1                  LIT EDGES (default on): strokes wider than 3px
//                             get a highlight sliver on the upper-left edge
//                             and a shadow sliver on the lower-right — paint
//                             ridges catching the room's light (global light
//                             from upper-left). Amplitude auto-scales with
//                             pigment luminance; pass relief:0..1 to soften
//                             or kill per layer (night skies may want ~0.6).
//            lift(c,dL,desat=0)  lightness lift in L units + optional desat
//            reliefPair(pts,w,fill,k,profile)  the two slivers, standalone
//            rej(x0,y0,x1,y1,mask?) -> sample fn  rejection sampler in a box
//            ribbon(pts,w,fill,profile?) -> '<path/>'  one tapered stroke
// FIGURES    inEllipse(x,y,cx,cy,rx,ry)  inCap(x,y,{ax,ay,bx,by,r})
//            segDist(x,y,ax,ay,bx,by)
//            underpaintCapsules(out,counter,caps,color)  solid silhouette
//                base (round-cap strokes) so figures read against busy paint
//            paintFigure(out,counter,rng,caps,colFn,density=1.1,lenMul=1,
//                lwMul=1)   strokes follow each capsule's axis
//            paintPath(out,counter,rng,pts,colFn,{lw,len,density,jitter})
//                short strokes along a polyline — hidden shapes from brushwork
// ASSEMBLY   W=800 H=500   R1(v) rounds to 0.1 (use in hand-built paths)
//            svgWrap(title, body, opts?) -> full <svg> with <title> alt text
//              plus three default-on oil-surface layers (opt out per plate:
//              {undercoat:0, weave:0, varnish:0}):
//              - undercoat: coarse paint-over-paint base over the ground rect
//                (own rng — plate composition above it is untouched)
//              - weave: fine canvas crosshatch in the base hue, felt not seen
//              - varnish: warm glaze + corner vignette, one radial gradient
//
// RULES OF THE ATELIER
// - One rng per plate, seeded; never Math.random(). Layer order = paint order
//   (later strokes sit on top) AND rng order — reordering layers changes
//   everything downstream. Append-only edits keep earlier layers stable.
// - Paint dark to light, big to small: ground/long rakes -> texture swirls ->
//   light pools -> figures (underpaint first, then axis strokes, then a thin
//   rim-light on the flank facing the light source) -> sparks/easter eggs.
// - Every plate hides 1-3 quiet easter eggs built from brushwork (paintPath),
//   never crisp geometry. A fourth-look whisper, not a sticker.
// See gen/plates/flame.mjs for a fully commented example plate.
// ========================================================================

// ---------- PRNG ----------
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------- value noise + fbm + curl ----------
function hash2(ix, iy, seed) {
  let h = (ix * 374761393 + iy * 668265263 + seed * 1442695041) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
const smooth = t => t * t * (3 - 2 * t);
export function vnoise(x, y, seed) {
  const ix = Math.floor(x), iy = Math.floor(y);
  const fx = smooth(x - ix), fy = smooth(y - iy);
  const a = hash2(ix, iy, seed), b = hash2(ix + 1, iy, seed);
  const c = hash2(ix, iy + 1, seed), d = hash2(ix + 1, iy + 1, seed);
  return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
}
export function fbm(x, y, seed, oct = 3) {
  let v = 0, amp = 0.5, f = 1;
  for (let i = 0; i < oct; i++) { v += amp * vnoise(x * f, y * f, seed + i * 77); amp *= 0.5; f *= 2; }
  return v;
}
// curl of noise → divergence-free swirling vector
export function curlV(x, y, seed, scale, oct = 3) {
  const e = 0.9;
  const dx = fbm((x + e) / scale, y / scale, seed, oct) - fbm((x - e) / scale, y / scale, seed, oct);
  const dy = fbm(x / scale, (y + e) / scale, seed, oct) - fbm(x / scale, (y - e) / scale, seed, oct);
  return [dy / (2 * e), -dx / (2 * e)]; // perpendicular to gradient
}
// tangential swirl around a center; weight falls with distance
export function swirlV(x, y, cx, cy, strength, falloff) {
  const dx = x - cx, dy = y - cy;
  const d = Math.hypot(dx, dy) + 1e-6;
  const w = strength / (1 + d / falloff);
  return [(-dy / d) * w, (dx / d) * w];
}

// ---------- DIVINE PROPORTION (the geometric bones) ----------
// "And he is before all things, and by him all things consist." — Colossians 1:17.
// God orders creation by exact measure and proportion (the temple foursquare,
// the city measured with a reed — Ezek 40:5, Ex 27:1, Rev 21:16). The golden
// ratio φ — the old name is literally "divine proportion" — is the growth law of
// shells, galaxies, sunflowers; the masters reached for it because it is already
// laid into creation, and creation is His. These helpers let a plate compose on
// φ instead of by guess.
export const PHI = 1.61803398875;
// the four GOLDEN-RATIO composition points of the WxH frame (where the eye rests)
export function goldenPoints(W, H) {
  const xa = W / PHI, xb = W - W / PHI, ya = H / PHI, yb = H - H / PHI;
  return { xa, xb, ya, yb, pts: [[xb, yb], [xa, yb], [xb, ya], [xa, ya]] };
}
// a true LOGARITHMIC GOLDEN-SPIRAL flow about (cx,cy): mostly circular with a
// constant outward pitch (~17.03°) so the curve grows by φ each quarter-turn —
// the spiral of the nautilus and the galaxy. dir=+1 winds out counter-clockwise,
// -1 clockwise. Returns a stroke-direction angle, ready for strokes({dir}).
export function goldenSpiralDir(x, y, cx, cy, dir = 1) {
  const dx = x - cx, dy = y - cy, d = Math.hypot(dx, dy) + 1e-6;
  const pitch = Math.atan(Math.log(PHI) / (Math.PI / 2));   // constant pitch of the φ-spiral
  const cp = Math.cos(pitch), sp = Math.sin(pitch);
  const vx = (-dy / d) * dir * cp + (dx / d) * sp;          // CCW/CW tangent + outward lean
  const vy = (dx / d) * dir * cp + (dy / d) * sp;
  return Math.atan2(vy, vx);
}
// VECTOR form (drop-in for swirlV): a golden-spiral eddy — same falloff as swirlV
// but each eddy LEANS OUTWARD by the φ pitch, so summing several knots gives a
// sky of golden eddies (Starry Night, in divine proportion) rather than flat
// circles. dir = sign of the rotation (+CCW / −CW).
export function goldenSpiralV(x, y, cx, cy, strength, falloff, dir) {
  const dx = x - cx, dy = y - cy, d = Math.hypot(dx, dy) + 1e-6;
  const s = (dir === undefined) ? (Math.sign(strength) || 1) : dir;   // rotation sense (handles signed strength → TRUE drop-in for swirlV)
  const w = Math.abs(strength) / (1 + d / falloff);
  const t = Math.log(PHI) / (Math.PI / 2);                  // tan(pitch) — the outward growth rate (φ per quarter-turn)
  return [((-dy / d) * s + (dx / d) * t) * w, ((dx / d) * s + (dy / d) * t) * w];
}

// ---------- color ----------
const hx = c => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
const hexC = (r, g, b) => '#' + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
export function mix(a, b, t) { const A = hx(a), B = hx(b); return hexC(A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t); }
export function ramp(cols, t) {
  t = Math.max(0, Math.min(1, t));
  const f = t * (cols.length - 1);
  const i = Math.min(Math.floor(f), cols.length - 2);
  return mix(cols[i], cols[i + 1], f - i);
}
// per-stroke jitter — the shimmer: adjacent strokes differ slightly.
// v2: widened in CHROMA — r/b channels swing harder than g and the common
// (lightness) drift is partly removed, so neighbours vibrate in hue the way
// pigment mixed on the palette does, instead of just flickering in value.
// Exactly 3 rng() calls, same as v1 — plate rng order is untouched.
function rgb2hsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2;
  if (mx === mn) return [0, 0, l];
  const d = mx - mn, s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
  let h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h / 6, s, l];
}
function hsl2rgb(h, s, l) {
  if (s === 0) return [l * 255, l * 255, l * 255];
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
  const f = t => { t = ((t % 1) + 1) % 1; if (t < 1 / 6) return p + (q - p) * 6 * t; if (t < 1 / 2) return q; if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6; return p; };
  return [f(h + 1 / 3) * 255, f(h) * 255, f(h - 1 / 3) * 255];
}
let MANIFOLD = 0.10;
// ⚠ A PER-PLATE VALUE KNOB. Fred, on `road`: "use darker colours?" — and the honest way to
// do that is not to hand-edit thirty ramps in a plate that is already right, it is to say
// "this page paints darker" once. It rides inside `jig`, so every mark on the plate gets
// it, and it is weighted by the mark's own lightness: a deep blue goes deeper, a gold
// barely moves. That is deliberate — it darkens the WORLD without dimming the LIGHT in it,
// which is the whole of chiaroscuro and the reason a dark page can still blaze.
let DARKEN = 0;
export function setDarken(d) { DARKEN = d; }
export function setManifold(m) { MANIFOLD = m; }
export function getManifold() { return MANIFOLD; }   // so a painter can suppress flecks locally and put the plate's own rate back
// COLOUR PUNCH — ep2/3/4 were painted in a pale, desaturated "lean" palette that
// reads washed-out next to ep1's vivid impasto. This lifts saturation and pulls
// pale tones deeper on EVERY colour a plate makes (real pigment, not a CSS filter),
// so their skies/fields get ep1's richness. Neutrals/whites/glows are left alone.
let COLOR_PUNCH = 0;
export function setColorPunch(s) { COLOR_PUNCH = s; }
function punch(hex) {
  const [r, g, b] = hx(hex);
  let [h, s, l] = rgb2hsl(r, g, b);
  if (s < 0.06) return hex;                                        // grey/white/glow untouched
  s = Math.min(1, s * (1 + COLOR_PUNCH));                          // richer colour
  if (l > 0.56) l = 0.56 + (l - 0.56) * (1 - COLOR_PUNCH * 0.55);  // pale washed tones pulled deeper
  const [r2, g2, b2] = hsl2rgb(h, s, l);
  return hexC(r2, g2, b2);
}

// ═══════════════════════════════════════════════════════════════════════════
//  THE GLOW LAW — how to make a colour actually shine.
//
//  Fred asked his Japanese artist friend why nothing in this book sparkles, and
//  got the answer the whole craft turns on:
//    "Pure white is the brightest color, so it's no problem, but when you want
//     to make OTHER colors glow in the picture, it's a good idea to make the
//     SURROUNDING colors feel a bit darker."
//  His friend's sheet says the rest: the colours meant to glow are bright AND
//  saturated; everything else is pushed to greys and muted, dirtied hues. The
//  glow is not painted into the highlight — it is bought by taking saturation
//  and light OUT of the neighbours. A canvas where everything is vivid has
//  nothing that shines.
//
//  So a plate names its light, and every mark away from it gives up saturation
//  and value in proportion. Set it per plate with setGlowLaw({lightFn}); the
//  transform is pure (it consumes no rng), so it can never shift a plate's
//  stream — see the manifold trap in gen/build.mjs.
// ═══════════════════════════════════════════════════════════════════════════
let GLOW = null;
export function setGlowLaw(o) { GLOW = o || null; }
function glowSurround(c, x, y) {
  if (!GLOW || !GLOW.lightFn) return c;
  const lit = Math.max(0, Math.min(1, GLOW.lightFn(x, y)));
  const away = Math.pow(1 - lit, GLOW.curve == null ? 1.4 : GLOW.curve);
  if (away < 0.02) return c;                       // in the light: keep every bit of colour
  const [r, g, b] = hx(c);
  let [h2, s2, l2] = rgb2hsl(r, g, b);
  s2 *= 1 - away * (GLOW.desat == null ? 0.62 : GLOW.desat);      // the neighbours go grey
  l2 *= 1 - away * (GLOW.darken == null ? 0.30 : GLOW.darken);    // and a little darker
  const [r2, g2, b2] = hsl2rgb(h2, s2, l2);
  return hexC(r2, g2, b2);
}

export function jig(c, rng, amt = 14) {
  if (COLOR_PUNCH) c = punch(c);
  if (DARKEN) c = mix(c, '#0b0820', DARKEN * (1 - Math.pow(lum(c), 0.55)));
  const [r, g, b] = hx(c);
  // THE MANIFOLD ACCENT — "how manifold are thy works... the earth is FULL of
  // thy riches" (Ps 104:24); the bow round the throne (Rev 4:3). A twelfth of
  // all strokes flip across the colour wheel at MATCHED lightness — pinks
  // living in the blues, oranges on the greens: Van Gogh's complementary
  // fleck, the whole bow hidden in every field. Neutrals stay neutral.
  if (rng() < MANIFOLD) {
    let [h, s, l] = rgb2hsl(r, g, b);
    if (s > 0.08) {
      h = h + 0.5 + (rng() - 0.5) * 0.24;
      s = Math.min(1, s * 0.8 + 0.28);
      l = Math.min(0.92, Math.max(0.14, l + (rng() - 0.5) * 0.1));
      const [r2, g2, b2] = hsl2rgb(h, s, l);
      return hexC(r2, g2, b2);
    } else {
      // THE BOW IN THE CLOUD (Gen 9:13) — the low-chroma BACKGROUND (pale skies,
      // deep grounds, fog) has no hue to flip, so seed a gentle spectral tint at
      // matched lightness: any colour of the wheel, softly, so the whole field
      // breathes colour instead of grey — not a fleck laid on top, a shimmer within.
      h = rng();
      s = 0.16 + rng() * 0.17;                 // a tint, not a flag
      l = Math.min(0.93, Math.max(0.10, l + (rng() - 0.5) * 0.05));
      const [r2, g2, b2] = hsl2rgb(h, s, l);
      return hexC(r2, g2, b2);
    }
  }
  let dr = (rng() * 2 - 1) * amt * 1.35, dg = (rng() * 2 - 1) * amt * 0.9, db = (rng() * 2 - 1) * amt * 1.35;
  const m = (dr + dg + db) / 3;
  dr -= m * 0.4; dg -= m * 0.4; db -= m * 0.4;
  return hexC(r + dr, g + dg, b + db);
}
// lightness lift in "L" units (≈ percent of full scale), with optional
// desaturation toward the color's own gray — used by the relief slivers.
export function lift(c, dL, desat = 0) {
  let [r, g, b] = hx(c);
  if (desat > 0) {
    const gr = r * 0.299 + g * 0.587 + b * 0.114;
    r += (gr - r) * desat; g += (gr - g) * desat; b += (gr - b) * desat;
  }
  const d = dL * 2.55;
  return hexC(r + d, g + d, b + d);
}
// perceived luminance 0..1 — gates the impasto double-strike
export function lum(c) { const [r, g, b] = hx(c); return (r * 0.299 + g * 0.587 + b * 0.114) / 255; }

// PALETTE (shared gold across all plates)
export const GOLD = '#f0d489', GOLD_PALE = '#ffe9a0', GOLD_DEEP = '#e8b33d', GOLD_HOT = '#fff6d8';
export const NIGHT = ['#131b38', '#1a2550', '#2a3f7e', '#3d5aa8', '#5d7cc0'];
export const DARKEST = '#131b38';
// NEWTON'S TRUE SPECTRUM — the real visible band (≈410→680nm) as luminous sRGB,
// violet→red, the actual colours of the bow. "I do set my bow in the cloud"
// (Gen 9:13); "a rainbow round about the throne" (Rev 4:3) — the true light split
// into its glory. Use ramp(SPECTRUM, t) for an arc; wrap with the closing magenta
// for a colour-wheel. Truer + more luminous than an arbitrary rainbow.
export const SPECTRUM = ['#8a12c0', '#5a2ee0', '#2f5cf0', '#1aa6d8', '#1fc46a', '#9ad021', '#f4c81e', '#ff8a14', '#f23a1e'];
export const SPECTRUM_WHEEL = [...SPECTRUM, '#e0309a', '#8a12c0'];   // closed wheel (adds the non-spectral magenta)

// ---------- light model ----------
// One dominant source at (cx,cy): returns g(x,y) in 0..1 with exponential
// falloff over `reach` px. Warm strokes by g, cool them by (1-g).
export function lightRadial(cx, cy, reach) {
  return (x, y) => Math.min(1, Math.exp(-Math.hypot(x - cx, y - cy) / reach));
}
// Light carried along a parametric spine ptFn(t)->[x,y], t in [0,1].
// gainFn(t) scales intensity along the path (default: brightens toward t=1).
export function lightAlongPath(ptFn, reach, { steps = 8, gainFn = t => 0.35 + 0.65 * t } = {}) {
  return (x, y) => {
    let g = 0;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps, p = ptFn(t);
      g = Math.max(g, gainFn(t) * Math.exp(-Math.hypot(x - p[0], y - p[1]) / reach));
    }
    return Math.min(1, g);
  };
}

// ---------- stroke ribbon (tapered filled polygon, 1 path) ----------
export const R1 = v => Math.round(v * 10) / 10;
function ribbonEdges(pts, w, profile, edge) {
  // `edge` (Sep 22): { l:[…], r:[…] } per-point multipliers on each side's half-width, so the two
  // edges of a mark can differ — a BRISTLE edge is ragged and asymmetric; a pill's is not.
  const n = pts.length;
  const L = [], R = [], N = []; // N[i] = unit normal from spine toward L side
  const prof = profile || [0.34, 0.5, 0.42, 0.15]; // tapered both ends — a loaded brush touches down, presses, lifts
  for (let i = 0; i < n; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[Math.min(n - 1, i + 1)];
    let tx = p1[0] - p0[0], ty = p1[1] - p0[1];
    const tl = Math.hypot(tx, ty) || 1; tx /= tl; ty /= tl;
    const hw = w * (prof[i] !== undefined ? prof[i] : prof[prof.length - 1]);
    const el = edge ? edge.l[i] : 1, er = edge ? edge.r[i] : 1;
    L.push([pts[i][0] - ty * hw * el, pts[i][1] + tx * hw * el]);
    R.push([pts[i][0] + ty * hw * er, pts[i][1] - tx * hw * er]);
    N.push([-ty, tx]);
  }
  return { L, R, N };
}
function polyPath(A, B, fill) { // A forward, B backward -> one SMOOTH closed leaf
  // Connect the stroke's edge points with a closed Catmull-Rom curve instead of
  // straight lines, so every brushstroke is an organic, soft, tapered shape (a
  // leaf/petal) rather than a hard-cornered polygon.
  const P = A.concat(B.slice().reverse());
  const m = P.length;
  if (m < 3) {
    let d = `M${R1(P[0][0])} ${R1(P[0][1])}`;
    for (let i = 1; i < m; i++) d += `L${R1(P[i][0])} ${R1(P[i][1])}`;
    return `<path d="${d}Z" fill="${fill}"/>`;
  }
  const pt = i => P[((i % m) + m) % m];
  const k = STROKE_ROUND / 6;   // 0 = straight (hard polygon) … 1/6 = full Catmull-Rom smoothing
  let d = `M${R1(P[0][0])} ${R1(P[0][1])}`;
  for (let i = 0; i < m; i++) {
    const p0 = pt(i - 1), p1 = pt(i), p2 = pt(i + 1), p3 = pt(i + 2);
    const c1x = p1[0] + (p2[0] - p0[0]) * k, c1y = p1[1] + (p2[1] - p0[1]) * k;
    const c2x = p2[0] - (p3[0] - p1[0]) * k, c2y = p2[1] - (p3[1] - p1[1]) * k;
    d += `C${R1(c1x)} ${R1(c1y)} ${R1(c2x)} ${R1(c2y)} ${R1(p2[0])} ${R1(p2[1])}`;
  }
  return `<path d="${d}Z" fill="${fill}"/>`;
}
export function ribbon(pts, w, fill, profile, edge) {
  const { L, R } = ribbonEdges(pts, w, profile, edge);
  return polyPath(L, R, fill);
}

// ---------- relief: lit stroke edges (the body of the paint) ----------
// One global light rakes the canvas from the upper-left. A wide stroke is a
// ridge of paint: its edge facing the light catches a thin highlight sliver
// (+L, slightly desaturated), the opposite edge drops into a thin shadow
// sliver (−L). The sliver is the stroke's own tapered edge pulled back
// ~1px toward the spine — at most 2 extra polys per wide stroke, no rng.
// Amplitude adapts to pigment luminance, so night skies keep their dark
// (dim paint shows gentler ridges) and bright slabs catch the room hard.
const LIT_X = -0.7071, LIT_Y = -0.7071;
// SCENE LIGHT for relief: when a plate sets this, every mark's lit edge faces the
// real source and its far edge falls into shadow — so each leaf/flower/tuft is
// modelled as its own little form catching the light, not lit by a flat global rake.
let RELIEF_LIGHT = null;
export function setReliefLight(p) { RELIEF_LIGHT = p; }

// ── the snowflake law (gen/genome.mjs) ────────────────────────────────────
// Painted trees descend the same chain the runtime sprites do, so a tree in a
// plate and a tree that sways over it are branched by ONE rule.
let GPAGE = 'unset';
export function setGenomePage(n) { GPAGE = n; }   // build.mjs sets this per plate
/** the node for one thing standing at (x,y) on the current page */
export function gAt(kind, x, y, extra = 0) {
  return gNode(GBOOK + '/' + GPAGE + '/' + kind + '@' + Math.round(x) + ',' + Math.round(y) + ':' + Math.round(extra));
}

/**
 * limbs — a limb splits into limbs, each shorter, thinner and turned from its
 * parent, run until it runs out. THE SAME RULE APPLIED TO ITS OWN OUTPUT: that
 * is what a branch is, and it is why no two trees come out alike when each limb
 * asks its own node (…/branch/0/01/012) for its turn and its reach.
 * Returns the tips, outermost first — hang the foliage on them.
 */
export function limbs(out, counter, rng, G, x0, y0, opts = {}) {
  const {
    len0 = 20, lw0 = 2, up = -Math.PI / 2, minLen = 2,
    // ⚠ A TREE ONLY BRANCHES AS DEEP AS IT HAS ROOM FOR. Left uncapped, a 20px tree in the
    // far country grew the same four-deep skeleton as a foreground oak — 80 limbs of detail
    // no one can see, and it tripled the build. Physically true as well: a sapling has fewer
    // orders of branching than an old tree, so the cap is part of the rule, not a shortcut.
    maxDepth = 9,
    col = (x, y, r) => jig(mix('#3f2a16', '#6b5334', r() * 0.7), r, 7),
    pathOpts = {},
  } = opts;
  const B = {
    splits: G.chance('three', 0.42) ? 3 : 2,
    spread: G.trait('spread', 0.34, 0.92),
    ratio:  G.trait('ratio', 0.6, 0.82),
    taper:  G.trait('taper', 0.58, 0.78),
    droop:  G.swing('droop', 0.28),
    depth:  Math.min(maxDepth, Math.max(1, Math.round(G.trait('depth', 1.6, 4.2)))),
  };
  // ⚠ NEVER DRAW FROM THE PLATE'S RNG. Every plate is one long deterministic stream, and
  // whatever a tree consumes shifts EVERYTHING painted after it — on `garden` the rebuild
  // moved the flower band and swallowed the page's easter-egg inscription whole. So the
  // skeleton takes its randomness from its own node in the chain: the plate's stream is
  // untouched, a rebuilt page keeps its composition exactly, and only gains branches.
  const R = G.rng();
  const tips = [];
  const walk = (x, y, ang, L, lw, d, tag) => {
    const N = G.child(tag);
    const a = ang + N.swing('a', 0.16), bow = N.swing('bow', 0.28);
    const mx = x + Math.cos(a) * L * 0.5 - Math.sin(a) * L * bow * 0.4;
    const my = y + Math.sin(a) * L * 0.5 + Math.cos(a) * L * bow * 0.4;
    const ex = x + Math.cos(a) * L, ey = y + Math.sin(a) * L;
    paintPath(out, counter, R, [[x, y], [mx, my], [ex, ey]], col,
      Object.assign({ lw: Math.max(0.5, lw), len: 4, density: 0.6, jitter: 0.5 }, pathOpts));
    if (d <= 0 || L < minLen) { tips.push([ex, ey, L]); return; }
    const n = B.splits + (N.chance('extra', 0.18) ? 1 : 0);
    for (let i = 0; i < n; i++) {
      const f = n === 1 ? 0 : (i / (n - 1)) * 2 - 1;
      walk(ex, ey, a + f * B.spread + B.droop * 0.3 + N.swing('t' + i, 0.12),
           L * B.ratio * (1 - Math.abs(f) * 0.12) * (0.86 + N.trait('r' + i, 0, 0.28)),
           lw * B.taper, d - 1, tag + i);
    }
  };
  walk(x0, y0, up, len0, lw0, B.depth, '0');
  tips.sort((p1, p2) => p2[2] - p1[2]);
  return tips;
}

/** pick tips that are actually apart, so clusters do not stack on one spot */
export function spreadTips(tips, k, minSep) {
  const keep = [];
  for (const t of tips) {
    if (keep.length >= k) break;
    if (keep.every(q => Math.hypot(q[0] - t[0], q[1] - t[1]) > minSep)) keep.push(t);
  }
  return keep.length ? keep : tips.slice(0, k);
}   // {x,y} or null to restore the global rake
export function reliefPair(pts, w, fill, k = 1, profile, edge) {
  const { L, R, N } = ribbonEdges(pts, w, profile, edge);
  let lx = LIT_X, ly = LIT_Y;
  if (RELIEF_LIGHT) {                                     // point the rake at the scene's source, per mark
    const c = pts[(pts.length - 1) >> 1];
    const dx = RELIEF_LIGHT.x - c[0], dy = RELIEF_LIGHT.y - c[1], d = Math.hypot(dx, dy) || 1;
    lx = dx / d; ly = dy / d;
  }
  let dot = 0;
  for (const nv of N) dot += nv[0] * lx + nv[1] * ly;
  const litE = dot >= 0 ? L : R, litS = dot >= 0 ? 1 : -1;
  const shaE = dot >= 0 ? R : L, shaS = -litS;
  const lm = lum(fill);
  // ⭐ THE BEVEL FOLLOWS THE HAND (Fred, Sep 8): "tune the bevel emboss depending on the
  // volume of the paintstroke so that the thickness of the glass strokes depends on how
  // heavy the hand is. I don't want really thick ones — the one we have now is the
  // maximum, smaller strokes should be thinner." Before, any stroke over w≈3.6 got the
  // full 1.0 sliver, so a hair-line and a slab wore the same glass. Now the sliver's
  // width AND its light scale with the mark's VOLUME (width × a soft root of length):
  // the heaviest marks keep exactly the old maximum, and it thins from there.
  let plen = 0;
  for (let i = 1; i < pts.length; i++) plen += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  const vol = w * Math.pow(Math.max(4, plen) / 40, 0.4);
  // ⭐ SUPER THIN (Fred, Sep 8, after seeing the volume-scaled bevel): "i like the brush
  // strokes very thin. can you make it still look like glass but make it super thin?" So
  // the sliver is a HAIRLINE now — a third of the old ceiling at most — and it keeps its
  // light (hv floors high) so the edge still reads as glass rather than fading out.
  const sw = Math.min(0.32, Math.max(0.10, vol / 28)); // 0.32 = a hairline on the heaviest marks
  const hv = 0.78 + 0.22 * (sw / 0.32);                 // a thin sliver still catches the light
  const hk = Math.min(1.2, k * (0.26 + 0.8 * lm)) * hv; // highlight strength — dark paint keeps its night
  const sk = Math.min(1.15, k * (0.5 + 0.45 * lm)) * hv;// shadow strength — deeper so each form reads round
  /* ⭐ WARM LIGHT, COOL SHADOW (Sep 21). The lit edge used to be the same paint a little lighter
     and the far edge the same paint a little darker — value only, so every ridge was modelled in
     grey. Light has a COLOUR and so does its absence: where a ridge catches, it goes toward the
     warm of the light; where it turns away, it goes toward the violet-blue of the sky that is
     lighting it instead. It is the oldest rule in outdoor painting, it costs no extra marks,
     and it is what makes impasto look lit rather than embossed. Scaled by the paint's own
     luminance, so a night keeps its night. */
  let hi = lift(fill, 10 * hk, 0.12 * hk);
  let lo = lift(fill, -11 * sk);
  if (BRUSH_HAND > 0) { hi = mix(hi, '#fff1c6', Math.min(0.34, 0.10 + 0.26 * lm) * Math.min(1, hk)); lo = mix(lo, '#241f5e', Math.min(0.36, 0.16 + 0.2 * lm) * Math.min(1, sk)); }
  // broken bevel: the sliver swells mid-stroke and dies at the ends, the way
  // a ridge catches light only where it stands proudest
  const taper = i => { const t = N.length < 2 ? 0.5 : i / (N.length - 1); return 0.45 + 0.62 * Math.sin(Math.PI * Math.min(1, t * 1.18)); };
  const pullIn = (E, s) => E.map((p, i) => [p[0] - N[i][0] * s * sw * taper(i), p[1] - N[i][1] * s * sw * taper(i)]);
  return polyPath(litE, pullIn(litE, litS), hi) + polyPath(shaE, pullIn(shaE, shaS), lo);
}

// ---------- stroke layer ----------
// sample(rng)->[x,y]|null, dir(x,y)->angle, col(x,y,rng)->hex
// wild>0: long-tailed brush — that fraction of strokes leave the polite band:
//   most of them long raking 1-2px hairlines, the rest short fat 8-14px slabs.
// aJ may be a function (x,y)->radians for zone-aware slash aggression.
// impasto>0: strokes brighter than that luminance get a darker understroke
//   offset 1px below — thick paint catching its own shadow.
// global stroke-count trim, set by the build per plate when a plate's SVG
// blows past ~1.5 MB — the relief slivers buy bolder coverage, so a ~15%
// count cut reads identically while the file shrinks.
let DENSITY = 1;
export function setDensity(d) { DENSITY = d; }
// BRUSH_SCALE — multiplies every stroke's width AND length. The build sets it per
// DEPTH PLANE (biggest at the back, finer toward the front) so the far planes read
// as a broad, loose lay-in and the near planes as crisp detail — atmospheric depth
// in the brushwork itself, the way a painter blocks in big and refines forward.
let BRUSH_SCALE = 1;
export function setBrushScale(s) { BRUSH_SCALE = s; }
// BRUSH_HAND — 1 = the loaded brush (taper, bristle streaks, dry tail); 0 = the old uniform pill. See THE HAND in strokes().
let BRUSH_HAND = 1;
export function setBrushHand(k) { BRUSH_HAND = k; }
// LAYER_OPACITY — the build sets it per DEPTH PLANE so foreground objects (ground,
// house, trees, figures) paint LESS opaque, letting the luminous layers behind
// glow through — the picture lit from within, like glazes. svgWrap wraps the whole
// layer body in <g opacity>. Back plane stays 1 (the opaque base).
let LAYER_OPACITY = 1;
export function setLayerOpacity(a) { LAYER_OPACITY = a; }

// STROKE_OPACITY — every FIELD brushstroke paints at this opacity, so marks glaze
// and layer over each other like real wet paint (the background breathes through a
// single stroke; overlaps build up). Figures (paintFigure/paintChild) override to
// 1.0 so the protagonist stays solid. ~0.8 reads as luminous, layered paint.
let STROKE_OPACITY = 0.6;
export function setStrokeOpacity(a) { STROKE_OPACITY = a; }
/* ⭐⭐ PIGMENT STEPS — THE MANUAL GRADIENT, BOOK-WIDE (Sep 14). Fred, on the kingdom: "you are
   using gradient right — instead of block gradient, paint the gradient in manually… gradient is
   good, i just want it to be drawn manually" — and then: "now do the same manual gradient for the
   rest of the pages." Every plate's `col` computes an exact colour per mark from where it lands,
   so a sky is ten thousand marks each a hair different: an airbrush. A painter has a few mixed
   pigments and makes the gradient by the PROPORTION of marks in each — Van Gogh's sky is four
   blues. So, when PIGMENT > 0, a mark's lightness snaps to one of N steps, choosing between the
   two nearest by chance in proportion to where it fell (stochastic rounding): the gradient
   survives exactly, as the mix of two pigments, and every mark is a committed colour. Hue and
   saturation are untouched. 0 = off (the old airbrush). */
let PIGMENT = 0;
export function setPigment(n) { PIGMENT = n | 0; }
export function getPigment() { return PIGMENT; }
/* ⭐ THE BOOK'S PALETTE — one limited palette across every page (Sep 14, Fred: "refinish everything.
   make the whole art look like everything belongs together"). A painter working a whole book uses
   the same tubes on every plate; that shared set of pigments is most of what makes pages read as
   one hand. When HUES > 0, a mark's HUE snaps to the nearest of N hue families (stochastically
   between the two nearest, like the lightness steps), so a violet on page 7 is the same violet
   as on page 25. 0 = off. Lightness and saturation untouched here. */
let HUES = 0;
export function setHues(n) { HUES = n | 0; }
/* ⭐ ECONOMY — fewer, surer marks (Sep 15, the style-evolution brainstorm). A maturing hand says
   more with fewer, larger, more decided strokes. ECONOMY = k divides the count of every BROAD pass
   (n ≥ 40 — fields, skies, grounds; detail passes are left alone) by k and scales each mark's
   length and width by √k, so the coverage stays and the confidence doubles. 1 = off. */
let ECONOMY = 1;
export function setEconomy(k) { ECONOMY = Math.max(1, +k || 1); }
/* ⭐ FLOW — the sure hand for skies and grounds (Sep 15, Fred: "push the skies and grounds further too").
   A mature painter's sky is a few LONG strokes that follow the air; a meadow is marks combed along
   the land. FLOW lengthens every broad pass's marks (×lenK), gives them more steps along their
   field (×stepsK, so a swirl is one sweep rather than a chain of dabs) and tightens `follow`.
   Set per plane by build.mjs: sky planes flow most, ground planes some, everything else not at all.
   Guarded like ECONOMY: only passes with n ≥ 40; a block, a window, a stone keep their shape. */
let FLOW_LEN = 1, FLOW_STEPS = 1, GROUND_BOLD = 1;
export function setFlow(lenK, stepsK) { FLOW_LEN = Math.max(1, +lenK || 1); FLOW_STEPS = Math.max(1, +stepsK || 1); }
export function setGroundBold(k) { GROUND_BOLD = Math.max(1, +k || 1); }   // width multiplier for broad ground passes ("go more ham on the ground")
function paletteHue(h, r) {
  if (!HUES) return h;
  const v = h * HUES, lo = Math.floor(v), frac = v - lo;
  return (((r() < frac ? lo + 1 : lo) % HUES) / HUES);
}
function pigment(c, r) {
  if (!PIGMENT || typeof c !== 'string' || c[0] !== '#' || c.length < 7) return c;
  const [R, G, B] = hx(c);
  const [h, sat, l] = rgb2hsl(R, G, B);
  const v = l * PIGMENT, lo = Math.floor(v), frac = v - lo;
  const step = (r() < frac ? lo + 1 : lo) / PIGMENT;              // the two nearest pigments, mixed by proportion
  const hh = sat > 0.08 ? paletteHue(h, r) : h;                     // greys keep their cast
  const [nr, ng, nb] = hsl2rgb(hh, sat, Math.max(0, Math.min(1, step)));
  return hexC(nr, ng, nb);
}

// STROKE_ROUND — how organic each stroke's outline is: 1 = fully smooth leaf/petal,
// 0 = hard-cornered polygon. Per-plate the build dials it down for hard, broken,
// made things (the cross, the sealed stone) and up for living, tender, glorious ones.
let STROKE_ROUND = 1;
export function setStrokeRound(a) { STROKE_ROUND = a; }

// STROKE CAPTURE: when an array is registered here, every stroke records its
// mark — center, base angle, length, width, color — so a real-time renderer
// can redraw and ANIMATE the brushwork itself (the marks move), instead of
// warping a flat raster. The painting becomes a living stroke field.
let CAP = null;
export function setCapture(a) { CAP = a; }
const r1 = v => Math.round(v * 10) / 10;
// len and lw may each be a number OR a function (x,y)->number, so a single
// layer can carry a SCALE GRADIENT — huge confident strokes in the
// foreground tapering to tiny touches at the horizon. That gradient is what
// reads as drawn depth rather than a uniform knitted field.
// ---- THE BOIL: several drawings of the same painting, looped (Fred, Aug 2026) ----
// "what i mean was maybe you could draw several background frames and just loop it to
//  make it look animated."
// This is how hand-drawn animation has always worked, and it is the opposite of what I
// was doing: nothing is laid OVER the painting. The SAME painting is drawn N times, and
// in each drawing every mark sits a hair from where it sat before — the way a hand
// cannot put a brush down twice in exactly the same place. Looped, the whole surface
// breathes. (Loving Vincent is 65,000 oil paintings; this is the cheap honest cousin.)
//
// Two properties make it work:
//  · THE COMPOSITION NEVER MOVES. The rng sequence is identical in every frame, so every
//    stroke samples the same position, colour and length. Only a tiny displacement is
//    added afterwards. Nothing drifts, nothing pops.
//  · THE LOOP IS SEAMLESS. Each stroke's displacement runs around a small ellipse whose
//    phase advances by exactly frame/nFrames, so frame N-1 hands back to frame 0 with no
//    jump. That is why the amount must come from the FRAME INDEX and not from the rng.
//
// TWINKLE is the same idea with the displacement taken out. A mark keeps its position
// EXACTLY and changes only its brightness — which is how the cover's 31,102 verse-motes
// can come alive without a single verse moving off its true place. Because the
// brightness swing is per-mark and out of phase, cross-fading the two drawings makes
// each mote rise and fall on its own: a sky of verses, twinkling. (Ps 119:105.)
let BOIL_F = 0, BOIL_N = 1, BOIL_AMP = 0, BOIL_TWK = 0;
// For plates that emit their own SVG rather than going through strokes() — the cover
// draws its 31,102 verse-motes as circles. Same contract: a stable per-position phase
// advanced by the frame, so the two drawings are opposite extremes and the loop closes.
// Returns 0 when no twinkle is set, so frame 0 renders byte-identical to before.
// A whip is not a wobble: it is anchored at one end and free at the other. This lets a
// band scale its displacement by WHERE a mark is, so the hand holding the string barely
// moves while the far end is flung. Set to null for the uniform boil everything else uses.
let BOIL_FIELD = null;
export function setBoilField(fn) { BOIL_FIELD = fn || null; }

// ---- FLOW: a cyclone, not a shimmer ----
// A cross-fade between two jittered drawings makes paint SPARKLE; it never makes it
// TURN. To turn, the marks have to travel along the swirl — and the plate already knows
// which way that is, because every sky stroke was laid down along a `dir` field. So the
// displacement runs along each mark's OWN painted direction, and its phase is set by how
// far along that direction the mark sits. Neighbours are therefore slightly out of step,
// which makes a WAVE that sweeps along the flow — the paint streaming around the eye.
// Every mark still returns to its own start each cycle, so the loop stays seamless: what
// travels is the wave, not the paint. (Wants more frames than a breath does: 2 drawings
// can only give you there-and-back, and a cyclone needs somewhere to go.)
// ---- LIGHTNING, as a FRAME ----
// "add light frames so it looks like theres lightning." The frame ring already exists,
// so a flash costs nothing extra: render one drawing of the loop with every colour
// lifted toward white, and the carousel will fire it once per turn. It is lightning the
// way a hand-drawn film does lightning — a bright cel in the sequence, not a filter.
let BOIL_FLASH = 0;
export function setBoilFlash(a) { BOIL_FLASH = a || 0; }
// ---- TINT: the same drawing, in another colour (Fred, Aug 2026) ----
// "make the light graphic sparkle, maybe create something like that but with different
//  colours and then do your transition magic?" — so a drawing can be rendered with every
// mark leaned toward a colour. NOTHING MOVES: this is a wash over the same strokes, in
// the same places, which is why it survives a tilt when displacement never could. Cross-
// faded between four such drawings, a light does not blink or slide — it SHIMMERS, the
// way white light does when it is really made of every colour at once.
let BOIL_TINT = null, BOIL_TINT_A = 0;
export function setBoilTint(col, amt) { BOIL_TINT = col || null; BOIL_TINT_A = amt || 0; }
// ⚠ WHICH DRAWING OF THE LOOP THIS IS, 0..1 — so a plate can DRAW ITSELF DIFFERENTLY per
// frame instead of being washed or nudged afterwards. Fred: "you could draw an alternate
// art and do transition to make it move... this is lazy." He is right: a tint is a filter
// and a boil is a nudge; neither is animation. A plate that knows its own beat can lay
// its marks somewhere ELSE — longer rays, a wider reach — and THAT moves.
export function boilBeat() { return BOIL_N ? BOIL_F / BOIL_N : 0; }
let BOIL_FLOW = 0, BOIL_WAVE = 120;
export function setBoilFlow(amp, wavelength) { BOIL_FLOW = amp || 0; BOIL_WAVE = wavelength || 120; }
export function twinkleAt(x, y) {
  if (!BOIL_TWK) return 0;
  const hh = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
  const idp = hh - Math.floor(hh);
  return Math.cos((idp + BOIL_F / BOIL_N) * Math.PI * 2) * BOIL_TWK;
}
export function setBoil(frame, nFrames, amp, twinkle) {
  BOIL_F = frame | 0; BOIL_N = Math.max(1, nFrames | 0); BOIL_AMP = amp || 0; BOIL_TWK = twinkle || 0;
}

export function strokes(out, counter, { rng, n, sample, dir, col, len, lw, lenJ = 0.35, wJ = 0.3, aJ = 0.22, steps = 3, follow = 1, wild = 0, impasto = 0, relief = 1, op = STROKE_OPACITY, flow = 1 }) {
  if (DENSITY !== 1) n = Math.round(n * DENSITY);
  let ECO = 1, FL = 1;
  if (ECONOMY > 1 && n >= 40) { n = Math.round(n / ECONOMY); ECO = Math.sqrt(ECONOMY); }   // fewer, surer (see setEconomy)
  // `flow: 0` — a mark whose SHAPE is the drawing (a palm leaflet, a cedar plate) must not be combed into a sweep
  if (FLOW_LEN > 1 && n >= 40 && flow) { FL = FLOW_LEN; steps = Math.max(2, Math.round(steps * FLOW_STEPS)); follow = Math.min(1, follow + 0.05); }   // longer, following (see setFlow)
  const lenFn = typeof len === 'function', lwFn = typeof lw === 'function';
  for (let i = 0; i < n; i++) {
    const s = sample(rng);
    if (!s) continue;
    const aJv = typeof aJ === 'function' ? aJ(s[0], s[1]) : aJ;
    const lenB = (lenFn ? len(s[0], s[1]) : len) * BRUSH_SCALE * ECO * FL;
    const lwB = (lwFn ? lw(s[0], s[1]) : lw) * BRUSH_SCALE * ECO * (n >= 40 && flow ? GROUND_BOLD : 1);
    let L, w;
    if (wild > 0 && rng() < wild) {
      if (rng() < 0.62) { w = 0.8 + rng() * 1.4; L = lenB * (1.3 + rng() * 1.4); }   // raking hairline
      else { w = 8 + rng() * 6; L = lenB * (0.4 + rng() * 0.45); }                    // bold slab
    } else {
      L = lenB * (1 + (rng() * 2 - 1) * lenJ);
      w = lwB * (1 + (rng() * 2 - 1) * wJ);
    }
    let TWK = 0;
    const jit = (rng() * 2 - 1) * aJv;
    // a gentle per-stroke CURVE — each mark bows on its own arc instead of running
    // ruler-straight, the way a hand drags a loaded brush. It accumulates per step,
    // so long field strokes swirl more while short marks (and straight made-things,
    // drawn with few steps) stay crisp.
    const curv = (rng() * 2 - 1) * 0.13;
    let [px, py] = s;
    const pts = [[px, py]];
    let a = dir(px, py) + jit;
    const a0 = a;
    for (let k = 0; k < steps; k++) {
      const target = dir(px, py) + jit;
      // bend toward the local field (follow<1 keeps stroke stiffer)
      let da = target - a;
      while (da > Math.PI) da -= 2 * Math.PI;
      while (da < -Math.PI) da += 2 * Math.PI;
      a += da * follow + curv;
      px += Math.cos(a) * (L / steps); py += Math.sin(a) * (L / steps);
      pts.push([px, py]);
    }
    // ---- the boil. Same mark, drawn again by a hand that cannot repeat itself ----
    if (BOIL_AMP > 0 || BOIL_TWK > 0) {
      // a stable per-stroke identity from where it starts — the same value in every
      // frame, so this mark keeps its own phase instead of moving with the crowd
      const hh = Math.sin(s[0] * 12.9898 + s[1] * 78.233) * 43758.5453;
      const idpRaw = hh - Math.floor(hh);
      // ⚠ A WHIP IS ONE BODY. Every other band wants each mark on its OWN phase — that
      // is what makes a surface boil rather than slide. But a string does not fray: it
      // whips, every part of it moving the same way at the same instant, only further
      // the further you are from the hand. So when a band carries an amplitude FIELD,
      // the phase goes coherent and the field alone decides how far each mark travels.
      // It also makes the motion PREDICTABLE, which is what lets a runtime sprite be
      // tethered to it: the far end's displacement is now a number you can compute.
      const idp = BOIL_FIELD ? 0 : idpRaw;
      const ph = (idp + BOIL_F / BOIL_N) * Math.PI * 2;
      if (BOIL_AMP > 0 || BOIL_FLOW > 0) {
        const amp = BOIL_FIELD ? BOIL_AMP * BOIL_FIELD(s[0], s[1]) : BOIL_AMP;
        // ⚠ A GUST YANKS SIDEWAYS; IT DOES NOT ORBIT. With a field set the phase is
        // coherent, and a coherent cos/sin pair traces a CIRCLE — every mark swinging
        // round like a carousel horse, which is not what wind does to a branch. Wind
        // comes from one side: it hauls the whole thing over, lets it back, hauls it
        // again. So under a field the vertical component nearly vanishes and the motion
        // becomes a left-right sweep. (Fred: "maybe make it yanked left and right.")
        let dx = Math.cos(ph) * amp;
        let dy = Math.sin(ph + idp * 5.1) * amp * (BOIL_FIELD ? 0.14 : 0.8);
        if (BOIL_FLOW > 0) {
          // how far along its own flow this mark sits — the wave's phase gradient
          const proj = (s[0] * Math.cos(a0) + s[1] * Math.sin(a0)) / BOIL_WAVE;
          const t2 = (BOIL_F / BOIL_N - proj) * Math.PI * 2;   // travels FORWARD along the flow
          const d2 = Math.sin(t2) * BOIL_FLOW;
          dx += Math.cos(a0) * d2; dy += Math.sin(a0) * d2;
        }
        for (let k2 = 0; k2 < pts.length; k2++) { pts[k2][0] += dx; pts[k2][1] += dy; }
        // and the brush is loaded a little differently each time
        w *= 1 + Math.cos(ph + idp * 2.7) * 0.07;
      }
      if (BOIL_TWK > 0) TWK = Math.cos(ph) * BOIL_TWK;   // brightness only — nothing moves
    }
    let fill = pigment(col(s[0], s[1], rng), rng);   // ⭐ PIGMENT: a committed colour per mark (see setPigment)
    // ⚠ THE GLOW LAW APPLIES HERE, where a mark knows where it is. Hooking it into jig()
    // would have meant threading coordinates through hundreds of call sites; strokes() has
    // them already, and this is a pure transform — it consumes no rng, so a plate's stream
    // is untouched (see the manifold trap in build.mjs).
    fill = glowSurround(fill, s[0], s[1]);
    if (TWK) fill = mix(fill, TWK > 0 ? '#ffffff' : '#000000', Math.abs(TWK));
    if (BOIL_FLASH) fill = mix(fill, '#fdfbff', BOIL_FLASH);   // the whole scene lit for one drawing
    if (BOIL_TINT) fill = mix(fill, BOIL_TINT, BOIL_TINT_A);   // the same marks, leaning to another colour
    /* ⭐⭐ THE HAND (Sep 21). Fred: "do things for the art… make your paint brush nicer, make your
       shadowing better." Seen at 1:1, every mark in the book was a PILL: the taper ran 0.76 → 1.05
       → 0.57, so a stroke was the same width end to end with two round caps — and a field of
       identical capsules is the machine's signature however good the colour is. A loaded brush
       does three things a pill cannot:
         · it LANDS fat, swells as the bristles splay, and LIFTS to almost nothing;
         · its bristles leave STREAKS along the mark — a lighter ridge and a darker furrow;
         · where it runs dry the tail SPLITS into tines.
       And no two marks are made the same way: most are pulled, some pushed the other way, some
       laid as a flat slab. ⚠ Every choice here is read off a HASH OF WHERE THE MARK STARTS, never
       the plate's rng — so a rebuilt page keeps its composition to the mark and only the hand
       changes. `setBrushHand(0)` restores the old pill (env BRUSH_HAND=0). */
    const hA = Math.sin(s[0] * 12.9898 + s[1] * 78.233) * 43758.5453, idA = hA - Math.floor(hA);
    const hB = Math.sin(s[0] * 39.3468 + s[1] * 11.1351) * 24634.6345, idB = hB - Math.floor(hB);
    // ⚠ A PLACED MARK IS A DRAWN SHAPE, NOT A GESTURE. A call with n === 1 is one stone block, one roof
    // tile, one cut course — a made thing laid where it belongs (Munch: made things are straight). It
    // keeps the old even profile; only marks scattered by the brush (n > 1) are given the hand.
    const gesture = BRUSH_HAND > 0 && n > 1;
    const broad = gesture && w > 2.4;
    if (broad && pts.length < 6) {                       // enough spine for a shape to live on
      const seg = [0]; for (let q = 1; q < pts.length; q++) seg.push(seg[q - 1] + Math.hypot(pts[q][0] - pts[q - 1][0], pts[q][1] - pts[q - 1][1]));
      const tot = seg[seg.length - 1] || 1, M = 6, rs = [];
      for (let q = 0; q < M; q++) { const d = tot * q / (M - 1); let j = 1; while (j < seg.length - 1 && seg[j] < d) j++;
        const f = (d - seg[j - 1]) / Math.max(1e-6, seg[j] - seg[j - 1]); rs.push([pts[j - 1][0] + (pts[j][0] - pts[j - 1][0]) * f, pts[j - 1][1] + (pts[j][1] - pts[j - 1][1]) * f]); }
      pts.length = 0; for (const q of rs) pts.push(q);
    }
    const np = pts.length;
    const PULL = [0.58, 1.0, 0.97, 0.84, 0.52, 0.13], SLAB = [0.80, 1.0, 1.0, 0.97, 0.88, 0.60];
    const shape = !gesture ? null : idA < 0.24 ? SLAB : PULL, rev = gesture && idA > 0.80;
    const prof = pts.map((_, i) => {
      const t = np > 1 ? i / (np - 1) : 0.5;
      if (!shape) return 0.5 + 0.55 * Math.sin(Math.PI * (0.16 + t * 0.8));
      const u = (rev ? 1 - t : t) * (shape.length - 1), k0 = Math.min(shape.length - 2, Math.floor(u));
      return shape[k0] + (shape[k0 + 1] - shape[k0]) * (u - k0);
    });
    /* ⭐ THE HAND, SECOND CUT (Sep 22, Fred: "make the brush even better"). Two more things a real
       brush does: its EDGE IS RAGGED and asymmetric — bristles do not make a clean contour, and the
       two sides of one mark never match; and a FLAT BRUSH NARROWS WHEN IT TURNS — the same head
       laid across the motion is wide, dragged round a bend it presents its edge. Both come from a
       per-point multiplier on each side (`edge`), hashed like everything else here. */
    let edge = null;
    if (broad) {
      const l = [], r = [];
      for (let i = 0; i < np; i++) {
        const hl = Math.sin(i * 7.31 + idA * 91.7) * 0.5 + Math.sin(i * 3.7 + idB * 41.3) * 0.5;   // -1..1, this mark's own
        const hr = Math.sin(i * 5.93 + idB * 77.1) * 0.5 + Math.sin(i * 2.9 + idA * 59.9) * 0.5;
        const endK = (i === 0 || i === np - 1) ? 0.3 : 1;                                        // the tips stay tips
        let turn = 0;
        if (i > 0 && i < np - 1) { const a1 = Math.atan2(pts[i][1] - pts[i - 1][1], pts[i][0] - pts[i - 1][0]), a2 = Math.atan2(pts[i + 1][1] - pts[i][1], pts[i + 1][0] - pts[i][0]);
          let d = a2 - a1; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; turn = Math.min(1, Math.abs(d) / 0.6); }
        const thin = 1 - 0.28 * turn;
        l.push(thin * (1 + hl * 0.17 * endK)); r.push(thin * (1 + hr * 0.17 * endK));
      }
      edge = { l, r };
    }
    if (CAP) CAP.push([pts.map(p => [r1(p[0]), r1(p[1])]), r1(w), fill]);
    // build this stroke's polys, then wrap them in ONE opacity group so the whole
    // mark (body + impasto + relief slivers) glazes uniformly and layers over what's beneath.
    let body = '';
    if (impasto > 0 && lum(fill) > impasto) {
      body += ribbon(pts.map(p => [p[0] + 0.5, p[1] + 1.2]), w * 1.12, mix(fill, DARKEST, 0.55), prof);
      counter.n++;
    }
    body += ribbon(pts, w, fill, prof, edge);
    counter.n++;
    if (broad && w > 3 && np >= 5) {
      // THE DRY TAIL THINS IN COLOUR TOO: as the load runs out the paint goes translucent and a
      // shade paler over the last third — a wash over the tail, lightest at the very end.
      if (shape === PULL) {
        const t0 = rev ? 0 : Math.floor(np * 0.55), t1 = rev ? Math.ceil(np * 0.45) : np - 1;
        const tail = pts.slice(t0, t1 + 1), tprof = prof.slice(t0, t1 + 1).map(v => v * 0.9);
        const tedge = edge ? { l: edge.l.slice(t0, t1 + 1), r: edge.r.slice(t0, t1 + 1) } : null;
        body += ribbon(rev ? tail.slice().reverse() : tail, w, lift(fill, 6 + 6 * lum(fill), 0.10), rev ? tprof.slice().reverse() : tprof, tedge && rev ? { l: tedge.l.slice().reverse(), r: tedge.r.slice().reverse() } : tedge).replace('<path ', '<path opacity="0.42" ');
        counter.n++;
      }
      const nrm = pts.map((p, i) => { const a2 = pts[Math.max(0, i - 1)], b2 = pts[Math.min(np - 1, i + 1)]; let tx = b2[0] - a2[0], ty = b2[1] - a2[1]; const tl = Math.hypot(tx, ty) || 1; return [-ty / tl, tx / tl]; });
      const side = (off, i0, i1) => pts.slice(i0, i1 + 1).map((p, i) => [p[0] + nrm[i0 + i][0] * w * off * prof[i0 + i], p[1] + nrm[i0 + i][1] * w * off * prof[i0 + i]]);
      if (idB > 0.30) {                                    // BRISTLE STREAKS — a ridge and a furrow, off-centre; a third on the widest
        const o1 = 0.18 + idA * 0.16, o2 = -(0.14 + idB * 0.18);
        body += ribbon(side(o1, 0, np - 2), w * 0.11, lift(fill, 5 + 5 * lum(fill), 0.04), [0.2, 1, 0.8, 0.5, 0.15]);   // (first cut 7+9·lum at 0.13w went WHITE on a pale sky)
        body += ribbon(side(o2, 1, np - 1), w * 0.11, lift(fill, -8), [0.15, 0.9, 1, 0.6, 0.2]);
        counter.n += 2;
        if (w > 5.5 && idA > 0.5) { body += ribbon(side(-(0.36 + idA * 0.1), 0, np - 3), w * 0.08, lift(fill, 3), [0.3, 1, 0.6, 0.1]); counter.n++; }
      }
      if (shape === PULL && idB < 0.42) {                  // THE DRY TAIL — the mark splits where the paint gave out
        const e = rev ? 0 : np - 1, e1 = rev ? 1 : np - 2, dxT = pts[e][0] - pts[e1][0], dyT = pts[e][1] - pts[e1][1];
        const tl = Math.hypot(dxT, dyT) || 1, ux = dxT / tl, uy = dyT / tl, run = L * (0.10 + idA * 0.12);
        for (const o of [0.30, -0.26]) {
          const bx = pts[e1][0] + nrm[e1][0] * w * o, by = pts[e1][1] + nrm[e1][1] * w * o;
          body += ribbon([[bx, by], [bx + ux * (tl + run * 0.5), by + uy * (tl + run * 0.5)], [bx + ux * (tl + run), by + uy * (tl + run)]], w * 0.16, fill, [1, 0.6, 0.12]);
          counter.n++;
        }
      }
    }
    // lit edges: only wide strokes are ridges; hairlines stay single polys.
    // Near-black pigment skips entirely — its slivers would be invisible
    // (hk ~0.3*lum) but still cost two polys each; night plates save ~20%.
    if (relief > 0 && w > 2 && lum(fill) > 0.14) { body += reliefPair(pts, w, fill, relief, prof, edge); counter.n += 2; }
    out.push(op < 1 ? `<g opacity="${op.toFixed(2)}">${body}</g>` : body);
  }
}

export function rej(x0, y0, x1, y1, mask) {
  return rng => {
    for (let t = 0; t < 24; t++) {
      const x = x0 + rng() * (x1 - x0), y = y0 + rng() * (y1 - y0);
      if (!mask || mask(x, y)) return [x, y];
    }
    return null;
  };
}

// geometry helpers for figure silhouettes
export function inEllipse(x, y, cx, cy, rx, ry) { const dx = (x - cx) / rx, dy = (y - cy) / ry; return dx * dx + dy * dy <= 1; }
export function segDist(x, y, ax, ay, bx, by) {
  const vx = bx - ax, vy = by - ay;
  const t = Math.max(0, Math.min(1, ((x - ax) * vx + (y - ay) * vy) / (vx * vx + vy * vy || 1)));
  return Math.hypot(x - (ax + vx * t), y - (ay + vy * t));
}
export const inCap = (x, y, c) => segDist(x, y, c.ax, c.ay, c.bx, c.by) <= c.r;

// solid silhouette underpaint: one round-cap stroke per capsule, so the
// figure reads as a mass before axis strokes texture it
export function underpaintCapsules(out, counter, caps, color) {
  for (const c of caps) {
    out.push(`<path d="M${R1(c.ax)} ${R1(c.ay)}L${R1(c.bx)} ${R1(c.by)}" stroke="${color}" stroke-width="${R1(c.r * 2)}" stroke-linecap="round" fill="none"/>`);
    counter.n++;
  }
}

// paint a figure built from capsules: strokes follow each capsule's axis
export function paintFigure(out, counter, rng, caps, colFn, density = 1.1, lenMul = 1, lwMul = 1, op = 1) {
  for (const c of caps) {
    const dx = c.bx - c.ax, dy = c.by - c.ay;
    const axis = Math.atan2(dy, dx);
    const segLen = Math.hypot(dx, dy);
    const area = (segLen * 2 * c.r + Math.PI * c.r * c.r);
    const n = Math.max(3, Math.round(area * 0.10 * density));
    const bx0 = Math.min(c.ax, c.bx) - c.r, bx1 = Math.max(c.ax, c.bx) + c.r;
    const by0 = Math.min(c.ay, c.by) - c.r, by1 = Math.max(c.ay, c.by) + c.r;
    strokes(out, counter, {
      rng, n,
      sample: rej(bx0, by0, bx1, by1, (x, y) => inCap(x, y, c)),
      dir: () => axis,
      col: colFn,
      len: Math.min(segLen * 0.6, 9) * lenMul, lw: Math.min(c.r * 0.7, 3) * lwMul,
      steps: 2, aJ: 0.18, op,
    });
  }
}

// THE MAIN CHARACTER — "you", the recurring child. ONE consistent look across the
// whole book so the reader can always follow the protagonist: deep-red clothes
// with a dark contour outline that makes the small figure pop on ANY background
// (dark night OR bright day). The Father/the Light stays radiant gold elsewhere —
// only "you" wears this red. Pass the same capsules you'd give paintFigure.
export const CHILD_RED = ['#dc3f2c', '#b0271c', '#7a160e'];   // vivid vermilion → deep red → maroon shadow

// ---------- childCaps: a PROPORTIONED storybook child (not a stickman) ----------
// Builds the six body capsules with friendly child proportions: a big head,
// a SHORT torso, and CHUNKY little limbs that attach at the shoulders and hips
// (not the waist). cx = centre x, topY = top of the head, h = full height
// (head-top → feet). Pose via optional [dx,dy] reach offsets from each joint;
// defaults to a relaxed stand. `lean` shifts the upper body for run/bow poses.
//   childCaps(cx, topY, h, { leftArm:[dx,dy], rightArm, leftLeg, rightLeg, lean, headTilt })
export function personCaps(cx, topY, h, pose = {}) {
  // A real, ARTICULATED human in ~6.5-head proportions: modest round head + neck,
  // a torso, and arms/legs that BEND at the elbows and knees (2-bone IK) — the
  // joint articulation is what makes a small figure read as a person rather than a
  // stick or a blob. cx = centre, topY = top of head, h = full height. Pose gives
  // hand/foot targets [x,y] in figure coords; defaults to a relaxed stand.
  // ⚠ headK / shoulderK: this rig's default head is 26% of body height (a real one is
  // ~13%) on shoulders only 18 wide — so at any size above a background figure it reads
  // as a blob with a loaf on top, and arms attach INSIDE the skull's own width. Fine for
  // the small cute cast; wrong for a figure who has to carry someone and read as a tall
  // adult (twoways). Both default to 1 — nothing already drawn moves.
  const headK = pose.headK || 1, shoulderK = pose.shoulderK || 1;
  const headR = h * 0.115 * headK;                // a bigger, CUTE head (~4 heads tall) — but with a neck, not a tumor
  const neckY = topY + headR * 1.7;               // bottom of head
  const shY = topY + h * 0.25;                    // shoulders sit just below the head
  const hipY = topY + h * 0.55;                   // short, chunky torso
  const feetY = topY + h;
  const lean = pose.lean || 0, ht = pose.headTilt || 0;
  const cxT = cx + lean;
  const shW = h * 0.072 * shoulderK, hipW = h * 0.048;
  const Lsh = [cxT - shW, shY], Rsh = [cxT + shW, shY];
  const Lhip = [cx - hipW, hipY], Rhip = [cx + hipW, hipY];
  // ⚠ armLen: arms are 25% of height by default against a head that is 23% — cartoon
  // proportions that CANNOT lift a child clear of this figure's own head (twoways spent
  // several rounds proving it: every "carry" ended with the child's legs across the
  // Father's face, and no prop pasted on top could rescue it). A lift needs reach, so a
  // pose may lengthen the arms. Default 1 — every existing figure is untouched.
  const armK = pose.armLen || 1;
  const uArm = h * 0.135 * armK, fArm = h * 0.12 * armK;   // short, stubby arms — still bend at the elbow (cute, not lanky)
  const legLen = feetY - hipY, thigh = legLen * 0.52, shin = legLen * 0.52;
  const Lhand = pose.leftHand || [cxT - shW - h * 0.015, shY + (uArm + fArm) * 0.92];
  const Rhand = pose.rightHand || [cxT + shW + h * 0.015, shY + (uArm + fArm) * 0.92];
  const Lfoot = pose.leftFoot || [cx - hipW - h * 0.005, feetY];
  const Rfoot = pose.rightFoot || [cx + hipW + h * 0.005, feetY];
  // 2-bone IK: given shoulder/hip S and hand/foot E, find the elbow/knee joint J
  function ik(s, e, l1, l2, sign) {
    var dx = e[0] - s[0], dy = e[1] - s[1], d = Math.hypot(dx, dy) || 0.001;
    var reach = (l1 + l2) * 0.985;
    if (d > reach) { dx *= reach / d; dy *= reach / d; e = [s[0] + dx, s[1] + dy]; d = reach; }
    var a = Math.atan2(dy, dx);
    var c = Math.max(-1, Math.min(1, (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d)));
    var b = Math.acos(c) * sign;
    return { j: [s[0] + Math.cos(a + b) * l1, s[1] + Math.sin(a + b) * l1], e: e };
  }
  var Le = ik(Lsh, Lhand, uArm, fArm, +1), Re = ik(Rsh, Rhand, uArm, fArm, -1);
  var Lk = ik(Lhip, Lfoot, thigh, shin, +1), Rk = ik(Rhip, Rfoot, thigh, shin, -1);
  var aR = h * 0.042, lR = h * 0.05, tR = h * 0.072, nR = h * 0.048;   // CHUNKY limbs + body — cute, never lanky sticks
  return [
    { ax: cxT + ht, ay: topY + headR * 0.65, bx: cxT, by: neckY, r: headR },                    // head
    { ax: cxT, ay: neckY, bx: cxT, by: shY + 1, r: nR },                                         // neck
    { ax: cxT, ay: shY, bx: cx, by: hipY, r: tR },                                               // torso
    { ax: Lsh[0], ay: Lsh[1], bx: Le.j[0], by: Le.j[1], r: aR },                                 // L upper arm
    { ax: Le.j[0], ay: Le.j[1], bx: Le.e[0], by: Le.e[1], r: aR * 0.85 },                        // L forearm
    { ax: Rsh[0], ay: Rsh[1], bx: Re.j[0], by: Re.j[1], r: aR },                                 // R upper arm
    { ax: Re.j[0], ay: Re.j[1], bx: Re.e[0], by: Re.e[1], r: aR * 0.85 },                        // R forearm
    { ax: Lhip[0], ay: Lhip[1], bx: Lk.j[0], by: Lk.j[1], r: lR },                               // L thigh
    { ax: Lk.j[0], ay: Lk.j[1], bx: Lk.e[0], by: Lk.e[1], r: lR * 0.82 },                        // L shin
    { ax: Rhip[0], ay: Rhip[1], bx: Rk.j[0], by: Rk.j[1], r: lR },                               // R thigh
    { ax: Rk.j[0], ay: Rk.j[1], bx: Rk.e[0], by: Rk.e[1], r: lR * 0.82 },                        // R shin
  ];
}

// THE AURA of the Light. Wherever the Light takes human form He must RADIATE —
// never a plain white silhouette. Call this on the divine figure's caps BEFORE
// painting it: it lays (1) a broad white→gold bloom of light blooming out from
// the figure, and (2) a bright halo hugging the silhouette, so the figure sits
// inside its own glow. gold = the warm tone used for texture in the radiance.
export function radiantHalo(out, counter, rng, caps, gold = '#f3d78e') {
  let minx = 1e9, miny = 1e9, maxx = -1e9, maxy = -1e9;
  for (const c of caps) {
    minx = Math.min(minx, c.ax - c.r, c.bx - c.r); maxx = Math.max(maxx, c.ax + c.r, c.bx + c.r);
    miny = Math.min(miny, c.ay - c.r, c.by - c.r); maxy = Math.max(maxy, c.ay + c.r, c.by + c.r);
  }
  const cx = (minx + maxx) / 2, cy = (miny + maxy) / 2;
  const reach = Math.max(maxx - minx, maxy - miny) * 0.6 + 14;
  const id = 'aura' + counter.n;
  // (1) a true semi-transparent radial GLOW — bright warm-white at the body,
  // fading to gold then clear, so the Light radiates without washing the scene out.
  out.push(`<defs><radialGradient id="${id}" cx="50%" cy="50%" r="50%">`
    + `<stop offset="0%" stop-color="#fffef8" stop-opacity="0.92"/>`
    + `<stop offset="28%" stop-color="#fff6d8" stop-opacity="0.6"/>`
    + `<stop offset="58%" stop-color="${gold}" stop-opacity="0.32"/>`
    + `<stop offset="100%" stop-color="${gold}" stop-opacity="0"/>`
    + `</radialGradient></defs>`);
  out.push(`<ellipse cx="${R1(cx)}" cy="${R1(cy)}" rx="${R1(reach * 2.05)}" ry="${R1(reach * 2.25)}" fill="url(#${id})"/>`);
  counter.n += 2;
  // (2) a soft halo hugging the silhouette: a warm GOLD edge underneath (so the
  // Light keeps a defining contour even against a bright sky), then a BRIGHT rim
  // on top (so on dark/green grounds the body's own edge glows white-hot).
  for (const c of caps) {
    out.push(`<path d="M${R1(c.ax)} ${R1(c.ay)}L${R1(c.bx)} ${R1(c.by)}" stroke="#e3b85f" stroke-width="${R1(c.r * 2 + 14)}" stroke-linecap="round" fill="none" opacity="0.4"/>`);
    out.push(`<path d="M${R1(c.ax)} ${R1(c.ay)}L${R1(c.bx)} ${R1(c.by)}" stroke="#fffaf0" stroke-width="${R1(c.r * 2 + 7)}" stroke-linecap="round" fill="none" opacity="0.46"/>`);
    counter.n += 2;
  }
}

// A simple, painterly FACE drawn on a head capsule so the figures can ACT the
// story — two soft eyes + a mouth whose curve carries the feeling. Draw it AFTER
// the body (it sits on top). expr: 'grin'|'smile'|'gentle'|'tender'|'calm'|
// 'awe'|'sad'. look: -1..1 turns the face left/right; down: tips the gaze down.
export function paintFace(out, counter, head, opts = {}) {
  const { expr = 'smile', look = 0, down = 0, ink = '#2c1a18', skin = null } = opts;
  const cx = (head.ax + head.bx) / 2, cy = (head.ay + head.by) / 2, r = head.r;
  const fx = cx + look * r * 0.22, fy = cy + down * r * 0.16;
  // a soft "lit face" patch so the small features read against the busy, aura-
  // flecked head texture — without it the eyes vanish into the highlights.
  if (skin) {
    out.push(`<ellipse cx="${R1(fx)}" cy="${R1(fy + r * 0.06)}" rx="${R1(r * 0.64)}" ry="${R1(r * 0.76)}" fill="${skin}" opacity="0.9"/>`);
    counter.n++;
  }
  const eo = r * 0.38, eyeY = fy - r * 0.08, er = Math.max(1.2, r * 0.17);
  const lw = Math.max(1.2, r * 0.16);
  for (const s of [-1, 1]) out.push(`<ellipse cx="${R1(fx + s * eo)}" cy="${R1(eyeY)}" rx="${R1(er)}" ry="${R1(er * 1.2)}" fill="${ink}"/>`);
  counter.n += 2;
  const my = fy + r * 0.44, mw = r * 0.44;
  const arc = d => `M${R1(fx - mw)} ${R1(my)}Q${R1(fx)} ${R1(my + d)} ${R1(fx + mw)} ${R1(my)}`;
  let d = null;
  if (expr === 'grin') d = arc(mw * 1.45);
  else if (expr === 'smile') d = arc(mw * 0.95);
  else if (expr === 'gentle') d = arc(mw * 0.6);
  else if (expr === 'tender') d = arc(mw * 0.45);
  else if (expr === 'calm') d = arc(mw * 0.26);
  else if (expr === 'sad') d = `M${R1(fx - mw * 0.8)} ${R1(my + mw * 0.5)}Q${R1(fx)} ${R1(my - mw * 0.25)} ${R1(fx + mw * 0.8)} ${R1(my + mw * 0.5)}`;
  else if (expr === 'awe') { out.push(`<ellipse cx="${R1(fx)}" cy="${R1(my + mw * 0.25)}" rx="${R1(mw * 0.46)}" ry="${R1(mw * 0.62)}" fill="${ink}"/>`); counter.n++; }
  else d = arc(mw * 0.9);
  if (d) { out.push(`<path d="${d}" stroke="${ink}" stroke-width="${R1(lw)}" fill="none" stroke-linecap="round"/>`); counter.n++; }
}

// THE LIGHT — rendered ONE consistent way wherever He takes human form (the
// running Father, the carrying Father, the guide on the bridge). He RADIATES:
// brilliant white shot through with YELLOW, wrapped in a yellow-white glow, with
// a soft warm backing so He reads on ANY ground — dark field or bright bridge.
// Use this everywhere instead of bespoke per-plate colour, so He stays the same
// character page to page.
// A soft dark CONTRAST ring just outside ANY light source — sun, flame, star,
// glowing loaf, light column — so its brightness pops against a darker border
// (simultaneous contrast / chiaroscuro). Draw it just BEFORE the light's bright
// core so the core paints over the inner edge, leaving a thin dark rim. For round
// sources pass rx (and ry); the ring is feathered with two passes.
export function lightEdge(out, counter, cx, cy, rx, ry = rx, opts = {}) {
  const { col = '#160f04', op = 0.32, w = Math.max(1.5, rx * 0.1) } = opts;
  out.push(`<ellipse cx="${R1(cx)}" cy="${R1(cy)}" rx="${R1(rx + w * 0.7)}" ry="${R1(ry + w * 0.7)}" fill="none" stroke="${col}" stroke-width="${R1(w * 1.6)}" opacity="${R1(op * 0.5)}"/>`);
  out.push(`<ellipse cx="${R1(cx)}" cy="${R1(cy)}" rx="${R1(rx + w * 0.4)}" ry="${R1(ry + w * 0.4)}" fill="none" stroke="${col}" stroke-width="${R1(w)}" opacity="${R1(op)}"/>`);
  counter.n += 2;
}

export function paintLight(out, counter, rng, caps) {
  if (globalThis.__CAP_LIGHT && caps && caps.length) {
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    for (const c of caps) { x0 = Math.min(x0, c.ax, c.bx); x1 = Math.max(x1, c.ax, c.bx); y0 = Math.min(y0, c.ay, c.by); y1 = Math.max(y1, c.ay, c.by); }
    globalThis.__CAP_LIGHT.push({ kind: 'light', x: (x0 + x1) / 2, y: y1, h: y1 - y0 });
  }
  // (1) a deep warm backing — a slightly enlarged silhouette, so a defining edge
  // rings Him and He reads on ANY ground: just a warm rim on a dark field, a clear
  // silhouette-edge against a bright bridge
  /* ⭐ Sep 12 (Fred: "this is art… we just need to make it beautiful"). At 1:1 He read as a
     gingerbread man: a flat white cut-out ringed by a hard BROWN line (the old "contrast
     terminator", added so He would read on a bright ground). A figure of light is not
     outlined in mud. He reads on any ground the way fire does — by a warm GLOW that deepens
     toward His edge: an orange-gold rim, soft, wide, then the aura, then a body that has FORM
     (white on top, warming to gold underneath, the way a lit thing turns from the light). */
  const _b = { minx: 1e9, miny: 1e9, maxx: -1e9, maxy: -1e9 };
  for (const c of caps) { _b.minx = Math.min(_b.minx, c.ax - c.r, c.bx - c.r); _b.maxx = Math.max(_b.maxx, c.ax + c.r, c.bx + c.r); _b.miny = Math.min(_b.miny, c.ay - c.r, c.by - c.r); _b.maxy = Math.max(_b.maxy, c.ay + c.r, c.by + c.r); }
  // (1) the warm rim — deep orange-gold, wide and soft: the glow that defines His edge
  underpaintCapsules(out, counter, caps.map(c => ({ ...c, r: c.r + 7 })), '#d88a26');
  for (const c of caps) {
    out.push(`<path d="M${R1(c.ax)} ${R1(c.ay)}L${R1(c.bx)} ${R1(c.by)}" stroke="#f0b040" stroke-width="${R1(c.r * 2 + 9)}" stroke-linecap="round" fill="none" opacity="0.45"/>`);
    counter.n++;
  }
  // (2) the yellow-white radiant aura (the radiance around Him)
  radiantHalo(out, counter, rng, caps, '#ffd24f');
  // (3) a luminous warm-white base
  underpaintCapsules(out, counter, caps, '#fff7df');
  // (4) the body, with FORM: brilliant white along the top of every limb, warming to gold
  // toward the underside — full of light, and round
  paintFigure(out, counter, rng, caps, (x, y, r) => {
    const t = Math.max(0, Math.min(1, (y - _b.miny) / Math.max(1, _b.maxy - _b.miny)));
    return jig(mix('#ffffff', '#ffd45c', 0.06 + 0.34 * t + r() * 0.22), r, 8);
  }, 2.0);
  // (5) RAYS of light streaming OUT — He EMITS bright light. Drawn LAST, on top of
  // the contrast border, radiating from the body outward (short near the body,
  // longer reaching out), so the Light reads as actively shining.
  let minx = 1e9, miny = 1e9, maxx = -1e9, maxy = -1e9;
  for (const c of caps) { minx = Math.min(minx, c.ax - c.r, c.bx - c.r); maxx = Math.max(maxx, c.ax + c.r, c.bx + c.r); miny = Math.min(miny, c.ay - c.r, c.by - c.r); maxy = Math.max(maxy, c.ay + c.r, c.by + c.r); }
  const Lx = (minx + maxx) / 2, Ly = (miny + maxy) / 2, rad = Math.max(maxx - minx, maxy - miny) * 0.5;
  strokes(out, counter, {
    rng, n: Math.round(80 + rad),
    sample: r => { const a = r() * Math.PI * 2, d = rad * 0.72 + Math.pow(r(), 0.6) * rad * 1.5; return [Lx + Math.cos(a) * d, Ly + Math.sin(a) * d * 0.92]; },
    dir: (x, y) => Math.atan2(y - Ly, x - Lx),
    col: (x, y, r) => jig(ramp(['#fffef6', '#fff4cc', '#ffe07a'], Math.min(1, Math.hypot(x - Lx, y - Ly) / (rad * 2))), r, 5),
    len: (x, y) => 8 + Math.hypot(x - Lx, y - Ly) * 0.16, lw: 1.5, steps: 2, lenJ: 0.6, relief: 0, op: 0.62,   // longer, softer rays (Sep 12)
  });
}

/* ══ A SHADOW THAT IS PAINTED ═════════════════════════════════════════════════════════════
   Sep 21 — Fred: "make your shadowing better." Every cast shadow in the book was one flat
   thing: a patch of dark green marks under a tree, or three grey-black ellipses under a figure.
   A real shadow on the ground has three parts, and none of them is grey:
     · a PENUMBRA — wide, soft, faint: the light leaking round the edge of the thing;
     · an UMBRA — the body of it, darker, and COOL: a shadow is not the absence of light, it is
       the ground lit only by the blue sky, so it goes violet-blue, never black (the book's own
       rule: no pure black). It is laid TRANSLUCENT, so the ground's own colour shows through
       and a shadow on grass is a green shadow, on sand a warm one, with no per-page tuning;
     · a CONTACT CORE — a small tight dark right where the thing meets the ground. That little
       note, more than anything else, is what stops a tree or a child from floating.
   It stretches AWAY from the light (`dir` = -1..1, `reach` = how far), and thins as it goes.
   ⚠ Own rng (hashed from its position): it never disturbs a plate's stream.                  */
export function groundShadow(out, counter, x, y, rx, ry, { dir = 0.5, reach = 1, op = 1, tint = '#1b2f66', core = true } = {}) {   // ⚠ deep BLUE, not violet: '#2a2568' read as purple paint on a green meadow (pilot, bread)
  const sr = mulberry32(((Math.round(x * 13) * 73856093) ^ (Math.round(y * 17) * 19349663) ^ 0x5ad0) >>> 0);
  const cx = x + dir * rx * 0.55 * reach, RX = rx * (1 + 0.45 * reach * Math.abs(dir));
  const pass = (n, spread, col, lw, len, a) => strokes(out, counter, {
    rng: sr, n, flow: 0,
    sample: r => { const ang = r() * Math.PI * 2, d = Math.pow(r(), 0.6) * spread;
                   const fall = 1 - 0.35 * Math.max(0, Math.cos(ang) * Math.sign(dir || 1));          // thinner on the far side
                   return [cx + Math.cos(ang) * RX * d * fall, y + ry * 0.3 + Math.sin(ang) * ry * d]; },
    dir: () => 0.04 + (sr() - 0.5) * 0.18,
    col: (px, py, r) => jig(col, r, 4),
    len, lw, steps: 2, lenJ: 0.6, relief: 0, impasto: 0, op: a * op,
  });
  pass(Math.max(10, Math.round(RX * 0.55)), 1.35, mix(tint, '#4f78a8', 0.4), ry * 0.95, RX * 0.5, 0.15);   // penumbra
  pass(Math.max(12, Math.round(RX * 0.8)), 0.92, tint, ry * 0.7, RX * 0.36, 0.30);                          // umbra
  if (core) pass(Math.max(6, Math.round(rx * 0.35)), 0.34, mix(tint, '#0a1030', 0.6), ry * 0.42, rx * 0.22, 0.5);   // contact
}

// A soft CAST SHADOW grounding a figure (or any capsule cluster) on the floor —
// a feathered, squashed dark pool at its feet, offset in the light-AWAY direction
// so the figure stops floating. Draw it BEFORE the figure. `dir` is the horizontal
// offset (>0 = shadow falls to the right, i.e. light from the left); `ground` the
// floor y (defaults to the lowest foot); `w` the half-width; `op` the darkness.
export function castShadow(out, counter, caps, opts = {}) {
  let cx = 0, n = 0, footY = -1e9, minx = 1e9, maxx = -1e9;
  for (const c of caps) { cx += c.ax + c.bx; n += 2; footY = Math.max(footY, c.ay, c.by); minx = Math.min(minx, c.ax, c.bx); maxx = Math.max(maxx, c.ax, c.bx); }
  cx /= n;
  // (Sep 21: cool violet instead of near-black — see groundShadow — and a fourth, tight ellipse: the contact core)
  const { dir = 0.6, w = (maxx - minx) * 0.55 + 7, ground = footY + 2, squash = 0.24, op = 0.3, col = '#1c1648' } = opts;
  for (const [sw, so] of [[1.35, 0.38], [0.98, 0.68], [0.62, 1.0], [0.3, 1.25]]) {   // feathered: wide faint → tight dark → contact
    out.push(`<ellipse cx="${R1(cx + dir * w * (0.5 + sw * 0.22))}" cy="${R1(ground)}" rx="${R1(w * sw)}" ry="${R1(w * squash * sw)}" fill="${col}" opacity="${R1(op * so)}"/>`);
    counter.n++;
  }
}

// Default = the red protagonist. Pass opts.cols (a 3-stop palette) to give a
// SECONDARY human figure the same bold dark OUTLINE but its OWN colour (e.g. the
// friends who catch you in 'hands', the child receiving the flame in 'candle').
// The Father / the Light is NOT drawn with this — He stays radiant gold, no outline.
export function paintChild(out, counter, rng, caps, opts = {}) {
  const cols = opts.cols || CHILD_RED;
  const density = opts.density != null ? opts.density : 1.7;
  const outline = opts.outline || '#150a0b';                 // near-black contour
  const ow = opts.outlineW != null ? opts.outlineW : 5.0;    // BOLD contour thickness (px, total)
  const base = opts.base || cols[cols.length - 1];           // gap-fill = darkest palette stop
  const seed = opts.seed != null ? opts.seed : 91;
  // 0) WASHED-WHITE AURA (Isa 1:18 "white as snow"; Rev 7:14 robes washed white) — a
  //    soft radiant white halo around a figure that has been washed clean; drawn
  //    UNDER the outline so it glows out from behind. opts.whiteAura: true or a px spread.
  if (opts.whiteAura) {
    const aw = opts.whiteAura === true ? 15 : opts.whiteAura;
    for (let k = 3; k >= 1; k--) {
      const op = (0.05 + 0.13 * k / 3).toFixed(2);
      for (const c of caps) {
        out.push(`<path d="M${R1(c.ax)} ${R1(c.ay)}L${R1(c.bx)} ${R1(c.by)}" stroke="#fff8e6" stroke-width="${R1(c.r * 2 + ow + aw * k)}" stroke-linecap="round" fill="none" opacity="${op}"/>`);
        counter.n++;
      }
    }
  }
  // 1) bold dark OUTLINE — an enlarged near-black capsule under the figure, so a
  //    clear dark contour reads all the way around the silhouette (storybook pop).
  for (const c of caps) {
    out.push(`<path d="M${R1(c.ax)} ${R1(c.ay)}L${R1(c.bx)} ${R1(c.by)}" stroke="${outline}" stroke-width="${R1(c.r * 2 + ow)}" stroke-linecap="round" fill="none"/>`);
    counter.n++;
  }
  // 2) base fill, so gaps between the brushstrokes read the figure's colour
  underpaintCapsules(out, counter, caps, base);
  // 3) the clothes — consistent palette, lightly form-shaded by noise
  paintFigure(out, counter, rng, caps, (x, y, r) => jig(ramp(cols, fbm(x / 14, y / 14, seed) * 0.55 + 0.18), r, 8), density);
}

// ---------- THE EPISODE-TWO CHARACTER — "the little pilgrim" ----------
// A storybook figure in the Hollow-Knight key, adapted for this book: a big
// pale bone-ivory MASK of a face with two large dark eyes (two small rounded
// nubs on the crown — never horns), and beneath it a small flared travel-
// cloak in the protagonist's RED, tiny pointed feet, thin little arms only
// when the pose needs them. NO OUTLINE (Fred's ruling, Jul 21 2026 — the
// painterly look): the figure holds its shape by value alone; on pale
// grounds give him a darker pocket behind the head (chiaroscuro), never ink. back=true shows the
// cloak's back (a pale dome, no face) for seen-from-behind pages.
//   paintMask(out, counter, rng, { x, y (feet), h, facing, back, lean,
//     eye:[dx,dy], armL:[tx,ty], armR:[tx,ty], stride:0..1, lift,
//     cols (cloak 3-ramp), maskCols, outline, shadow })
export function paintMask(out, counter, rng, {
  x, y, h, facing = 1, back = false, lean = 0,
  eye = [0, 0], mood = 'open',   // 'open' | 'wonder' | 'wary' | 'joy' (happy closed arcs)
  armL = null, armR = null, stride = 0, lift = 0,
  wind = 0,                       // -1..1: the hem trails windward (run right → wind<0)
  staff = false,                  // a pilgrim's walking stick in the given hand
  cols = CHILD_RED,
  maskCols = ['#f6efdc', '#e8dfc4', '#c4b898'],
  outline = '#150a0b', shadow = 0.3,
  shadowOnly = false,             // bake only the ground pool — the BODY lives in ep2/character.js now
  kneel = false,                  // kneeling/bowed: the hem pools on the ground, no feet
  aura = 0,                       // px spread of a washed-white halo behind the figure (Isa 1:18)
} = {}) {
  // ---- ep1→sprite port hook: capture this figure's resolved params, and (when
  //      de-baking) skip drawing it so the plate becomes a clean background ----
  if (globalThis.__CAP_FIG) globalThis.__CAP_FIG.push({ kind: 'mask', x, y, h, facing, back, lean, eye, mood, armL, armR, stride, lift, wind, staff, kneel, aura, cols });
  if (globalThis.__SKIP_FIG) return;
  const R = h * 0.26;                                  // the big head
  const cx = x + lean * 0.35, cy = y - h + R * 1.02;   // head centre
  const neckY = cy + R * 0.72;                         // cloak attaches here
  const wt = R * 0.92, wb = R * (kneel ? 1.98 : 1.72); // cloak top/bottom width (kneeling pools wider)
  const by = kneel ? y + 1 : y - h * 0.02;             // cloak hem (kneeling sits ON the ground)
  // washed-white AURA — soft radiance behind the whole silhouette, under everything
  if (aura > 0) {
    for (let k = 3; k >= 1; k--) {
      out.push(`<ellipse cx="${R1(cx)}" cy="${R1(y - h * 0.42)}" rx="${R1(wb + aura * k * 0.8)}" ry="${R1(h * 0.56 + aura * k * 0.7)}" fill="#fff8e6" opacity="${(0.05 + 0.1 * k / 3).toFixed(2)}"/>`);
      counter.n++;
    }
  }
  // 0) a CUTE little GROUND shadow — a very flat, soft pool dropped just below
  //    the feet with a hair of separation. Flat (ry≈0.12·rx) + soft + wide reads
  //    unmistakably as a cast shadow on the floor, never as a "mouth" on the
  //    mouthless mask above (a mouth is round and attached; this is flat and cast).
  if (shadow > 0) {
    for (const [sw, so] of [[1.25, 0.16], [0.85, 0.34], [0.55, 0.5]]) {
      out.push(`<ellipse cx="${R1(x + facing * 1.5)}" cy="${R1(y + 2.5)}" rx="${R1(wb * 0.84 * sw)}" ry="${R1(wb * 0.12 * sw)}" fill="#120f1c" opacity="${R1(shadow * so)}"/>`);
      counter.n++;
    }
  }
  if (shadowOnly) return;
  // 1) THE CLOAK — teardrop flare with a notched hem; `wind` sweeps the hem
  // sideways (the top stays anchored at the neck) so motion reads in the cloth
  const midY = (neckY + by) / 2;
  const hemN = h * 0.05;                               // notch depth
  const wd = wind * R;                                 // hem drift
  const cloak = `M${R1(x - wt)} ${R1(neckY)}`
    + `Q${R1(x - wb * 1.08 + wd * 0.55)} ${R1(midY)} ${R1(x - wb + wd * 1.15)} ${R1(by)}`
    + `L${R1(x - wb * 0.52 + wd * 0.85)} ${R1(by - hemN)}L${R1(x - wb * 0.12 + wd * 0.55)} ${R1(by)}`
    + `L${R1(x + wb * 0.32 + wd * 0.4)} ${R1(by - hemN * 0.8)}L${R1(x + wb + wd * 0.2)} ${R1(by)}`
    + `Q${R1(x + wb * 1.08 + wd * 0.1)} ${R1(midY)} ${R1(x + wt)} ${R1(neckY)}`
    + `Q${R1(cx)} ${R1(neckY - R * 0.25)} ${R1(x - wt)} ${R1(neckY)}Z`;
  out.push(`<path d="${cloak}" fill="${cols[2]}"/>`);
  out.push(`<path d="${cloak}" fill="${cols[1]}"/>`);
  counter.n += 2;
  // seen from behind: one soft centre fold gives the big red shape its form
  if (back) {
    out.push(ribbon([[cx, neckY + R * 0.35], [cx + wd * 0.3 - facing * R * 0.12, midY], [cx + wd * 0.7, by - hemN * 1.3]], R * 0.17, cols[2]));
    counter.n++;
  }
  // cloak form: a lit band on the facing side, a deep fold away from it
  out.push(ribbon([[x + facing * wb * 0.42, neckY + R * 0.25], [x + facing * wb * 0.6, midY], [x + facing * wb * 0.66, by - hemN * 1.4]], R * 0.42, mix(cols[0], '#ff9a6a', 0.12))); counter.n++;
  out.push(ribbon([[x - facing * wb * 0.34, neckY + R * 0.3], [x - facing * wb * 0.5, midY + 2], [x - facing * wb * 0.55, by - hemN * 1.5]], R * 0.34, cols[2])); counter.n++;
  // 2) tiny thin ARMS, only when the pose asks — and the pilgrim's STAFF
  let staffHand = null;
  for (const tip of [armL, armR]) {
    if (!tip) continue;
    const side = tip[0] >= cx ? 1 : -1;
    const sx2 = x + side * wt * 0.78, sy2 = neckY + R * 0.28;
    const mx2 = (sx2 + tip[0]) / 2 + side * 2, my2 = (sy2 + tip[1]) / 2 + 1.5;
    out.push(ribbon([[sx2, sy2], [mx2, my2], [tip[0], tip[1]]], Math.max(2.2, h * 0.042), cols[2])); counter.n++;
    out.push(ribbon([[sx2, sy2], [mx2, my2], [tip[0], tip[1]]], Math.max(1.5, h * 0.03), cols[1])); counter.n++;
    out.push(`<circle cx="${R1(tip[0])}" cy="${R1(tip[1])}" r="${R1(Math.max(1.6, h * 0.028))}" fill="${cols[0]}"/>`); counter.n++;
    if (!staffHand) staffHand = tip;
  }
  if (staff && staffHand) {
    // a slender walking stick through the first given hand, planted by his feet,
    // a small knob at the top — Bunyan's own emblem for the road
    const tx2 = staffHand[0] + facing * R * 0.16, ty2 = staffHand[1] - R * 1.25;
    const bx2 = staffHand[0] - facing * R * 0.3, by2 = y + 2;
    out.push(ribbon([[tx2, ty2], [(tx2 + bx2) / 2 + facing * 1.2, (ty2 + by2) / 2], [bx2, by2]], Math.max(2.6, h * 0.045), '#4a3014')); counter.n++;
    out.push(ribbon([[tx2, ty2], [(tx2 + bx2) / 2 + facing * 1.2, (ty2 + by2) / 2], [bx2, by2]], Math.max(1.5, h * 0.027), '#a06a30')); counter.n++;
    out.push(`<circle cx="${R1(tx2)}" cy="${R1(ty2)}" r="${R1(Math.max(2, h * 0.032))}" fill="#c08a44"/>`); counter.n++;
  }
  // 3) tiny pointed FEET peeking under the hem (a kneeling figure shows none)
  if (!kneel) {
    const f1x = x + facing * (wb * 0.28 + stride * h * 0.16);            // leading
    const f2x = x - facing * (wb * 0.24 + stride * h * 0.1);             // trailing
    const f2y = y - lift * h * 0.07;
    for (const [fx2, fy2] of [[f2x, f2y], [f1x, y]]) {
      out.push(`<path d="M${R1(fx2 - R * 0.22)} ${R1(fy2 - R * 0.16)}L${R1(fx2 + R * 0.26)} ${R1(fy2 - R * 0.14)}L${R1(fx2 + R * 0.1)} ${R1(fy2 + R * 0.14)}Z" fill="${cols[2]}"/>`);
      counter.n++;
    }
  }
  // 4) THE MASK — the big pale head with its two rounded crown-nubs
  const nub = (side) => `<ellipse cx="${R1(cx + side * R * 0.6)}" cy="${R1(cy - R * 0.72)}" rx="${R1(R * 0.3)}" ry="${R1(R * 0.42)}" transform="rotate(${side * 22} ${R1(cx + side * R * 0.6)} ${R1(cy - R * 0.72)})"`;
  out.push(`${nub(-1)} fill="${maskCols[1]}"/>`);
  out.push(`${nub(1)} fill="${maskCols[1]}"/>`);
  out.push(`<ellipse cx="${R1(cx)}" cy="${R1(cy)}" rx="${R1(R * 1.04)}" ry="${R1(R * 0.94)}" fill="${maskCols[0]}"/>`);
  counter.n += 3;
  // a soft under-shade so the mask reads as bone, not paper
  out.push(`<path d="M${R1(cx - R * 0.85)} ${R1(cy + R * 0.35)} Q${R1(cx)} ${R1(cy + R * 1.05)} ${R1(cx + R * 0.85)} ${R1(cy + R * 0.35)} Q${R1(cx)} ${R1(cy + R * 0.62)} ${R1(cx - R * 0.85)} ${R1(cy + R * 0.35)}Z" fill="${maskCols[2]}" opacity="0.5"/>`);
  counter.n++;
  // 5) THE EYES — the whole performance lives here (unless we see his back):
  // 'open' steady · 'wonder' grown wide · 'wary' narrowed · 'joy' happy arcs
  if (!back) {
    const ex = eye[0] * R * 0.14, ey = eye[1] * R * 0.1;
    for (const side of [-1, 1]) {
      const ecx = cx + side * R * 0.44 + ex, ecy = cy + R * 0.05 + ey;
      if (mood === 'joy') {
        // closed happy crescents — laughter in two strokes
        out.push(`<path d="M${R1(ecx - R * 0.18)} ${R1(ecy + R * 0.04)} Q${R1(ecx)} ${R1(ecy - R * 0.26)} ${R1(ecx + R * 0.18)} ${R1(ecy + R * 0.04)}" fill="none" stroke="#141020" stroke-width="${R1(Math.max(1.6, R * 0.12))}" stroke-linecap="round"/>`);
        counter.n++;
      } else if (mood === 'sad') {
        // closed grieving arcs — the same two strokes, curving DOWN (sorrow, not laughter)
        out.push(`<path d="M${R1(ecx - R * 0.18)} ${R1(ecy - R * 0.04)} Q${R1(ecx)} ${R1(ecy + R * 0.24)} ${R1(ecx + R * 0.18)} ${R1(ecy - R * 0.04)}" fill="none" stroke="#141020" stroke-width="${R1(Math.max(1.6, R * 0.12))}" stroke-linecap="round"/>`);
        counter.n++;
      } else if (mood === 'weary') {
        // heavy-lidded: a low half-open eye under a straight tired lid
        const rx2 = R * 0.17, ry2 = R * 0.15;
        const wcy = ecy + R * 0.07;
        out.push(`<ellipse cx="${R1(ecx)}" cy="${R1(wcy)}" rx="${R1(rx2)}" ry="${R1(ry2)}" fill="#141020"/>`);
        out.push(`<line x1="${R1(ecx - rx2 * 1.1)}" y1="${R1(wcy - ry2 * 0.55)}" x2="${R1(ecx + rx2 * 1.1)}" y2="${R1(wcy - ry2 * 0.55)}" stroke="${maskCols[0]}" stroke-width="${R1(Math.max(2, R * 0.22))}"/>`);
        out.push(`<line x1="${R1(ecx - rx2)}" y1="${R1(wcy - ry2 * 0.4)}" x2="${R1(ecx + rx2)}" y2="${R1(wcy - ry2 * 0.4)}" stroke="#141020" stroke-width="${R1(Math.max(1.3, R * 0.09))}" stroke-linecap="round"/>`);
        out.push(`<circle cx="${R1(ecx - rx2 * 0.25)}" cy="${R1(wcy + ry2 * 0.1)}" r="${R1(rx2 * 0.24)}" fill="#f8f4ff" opacity="0.8"/>`);
        counter.n += 4;
      } else {
        const rx2 = R * (mood === 'wonder' ? 0.2 : mood === 'wary' ? 0.15 : 0.17);
        const ry2 = R * (mood === 'wonder' ? 0.38 : mood === 'wary' ? 0.21 : 0.32);
        out.push(`<ellipse cx="${R1(ecx)}" cy="${R1(ecy)}" rx="${R1(rx2)}" ry="${R1(ry2)}" fill="#141020"/>`);
        // two glints — the classic pair, a big soul-light and a small echo
        out.push(`<circle cx="${R1(ecx - rx2 * 0.3)}" cy="${R1(ecy - ry2 * 0.4)}" r="${R1(rx2 * 0.32)}" fill="#f8f4ff" opacity="0.92"/>`);
        out.push(`<circle cx="${R1(ecx + rx2 * 0.34)}" cy="${R1(ecy + ry2 * 0.28)}" r="${R1(rx2 * 0.16)}" fill="#f8f4ff" opacity="0.7"/>`);
        counter.n += 3;
      }
    }
  }
}

// ---------- THE RADIANT ONE (episode-two divine figure) ----------
// The same design language as paintMask, grown up and glorified: taller
// proportions (dignity, not chibi), a serene ivory mask with CALM CRESCENT
// eyes (kind, half-closed — never a stare), a three-pointed crown instead of
// nubs, and a long gold robe falling to the ground with a softly waved hem —
// no feet, He/She stands in glory. Rays and a warm bloom radiate from behind.
// One radiance for the Light and for Wisdom: they are one voice (1 Cor 1:24).
export function paintRadiant(out, counter, rng, {
  x, y, h, facing = 1, back = false, lean = 0, headDrop = 0,
  armL = null, armR = null, kneel = false, glow = 1,
  glowOnly = false,   // bake only the ground pool + bloom + rays (the SCENE's light);
                      // the robe/mask/crown BODY lives in ep2/character.js now
} = {}) {
  const R = h * 0.175;
  const cx = x + lean * 0.5, cy = y - h + R * 1.15 + headDrop;
  const neckY = cy + R * 0.78;
  const wt = R * 1.1, wb = R * (kneel ? 2.9 : 2.3);
  const OUT = '#4a2c0c';
  const id = 'rad' + counter.n;
  // 0) soft ground shadow + the BLOOM behind the whole figure
  for (const [sw, so] of [[1.25, 0.3], [0.85, 0.6]]) {
    out.push(`<ellipse cx="${R1(x)}" cy="${R1(y + 2)}" rx="${R1(wb * 1.1 * sw)}" ry="${R1(wb * 0.26 * sw)}" fill="#2c1d08" opacity="${R1(0.22 * so)}"/>`); counter.n++;
  }
  if (glow > 0) {
    out.push(`<defs><radialGradient id="${id}" cx="50%" cy="50%" r="50%">`
      + `<stop offset="0%" stop-color="#fffef6" stop-opacity="${R1(0.85 * glow)}"/>`
      + `<stop offset="45%" stop-color="#fff2c0" stop-opacity="${R1(0.5 * glow)}"/>`
      + `<stop offset="100%" stop-color="#ffe9a0" stop-opacity="0"/></radialGradient></defs>`);
    out.push(`<ellipse cx="${R1(cx)}" cy="${R1(y - h * 0.5)}" rx="${R1(h * 0.72)}" ry="${R1(h * 0.68)}" fill="url(#${id})"/>`);
    counter.n += 2;
    // rays — thin turning blades of light fanning from the heart
    const RCX = cx, RCY = y - h * 0.52;
    let rays = '';
    const NR = 22;
    for (let i = 0; i < NR; i++) {
      const a = (i / NR) * Math.PI * 2 + 0.13;
      const r0 = h * (0.34 + (i % 3) * 0.05), r1r = r0 + h * (0.22 + ((i * 7) % 5) * 0.05);
      const w2 = 1.6 + (i % 2) * 1.2;
      const x0 = RCX + Math.cos(a) * r0, y0 = RCY + Math.sin(a) * r0 * 0.92;
      const x1 = RCX + Math.cos(a + 0.06) * r1r, y1 = RCY + Math.sin(a + 0.06) * r1r * 0.92;
      rays += `<path d="M${R1(x0)} ${R1(y0)}L${R1(x1)} ${R1(y1)}" stroke="${i % 2 ? '#ffe9a0' : '#fff6d8'}" stroke-width="${R1(w2)}" stroke-linecap="round"/>`;
    }
    out.push(`<g opacity="${R1(0.75 * glow)}">${rays}</g>`); counter.n++;
  }
  if (glowOnly) return;
  // 1) THE ROBE — a long fall of gold to the ground, hem in soft waves
  const midY = (neckY + y) / 2;
  const hemW = h * 0.02;
  const robe = `M${R1(x - wt)} ${R1(neckY)}`
    + `Q${R1(x - wb * 1.05)} ${R1(midY)} ${R1(x - wb)} ${R1(y)}`
    + `Q${R1(x - wb * 0.55)} ${R1(y - hemW * 2.2)} ${R1(x - wb * 0.2)} ${R1(y)}`
    + `Q${R1(x + wb * 0.25)} ${R1(y - hemW * 2)} ${R1(x + wb * 0.6)} ${R1(y)}`
    + `Q${R1(x + wb * 0.85)} ${R1(y - hemW * 1.4)} ${R1(x + wb)} ${R1(y)}`
    + `Q${R1(x + wb * 1.05)} ${R1(midY)} ${R1(x + wt)} ${R1(neckY)}`
    + `Q${R1(cx)} ${R1(neckY - R * 0.28)} ${R1(x - wt)} ${R1(neckY)}Z`;
  out.push(`<path d="${robe}" fill="#c9962e" stroke="${OUT}" stroke-width="${R1(Math.max(2.6, h * 0.032))}" stroke-linejoin="round"/>`);
  out.push(`<path d="${robe}" fill="#f0d489"/>`);
  counter.n += 2;
  // robe form: a white-hot core fall + deep gold folds at the sides
  out.push(ribbon([[cx, neckY + R * 0.4], [cx + facing * 2, midY], [cx + facing * 3, y - hemW * 3]], R * 0.9, '#fff6d8')); counter.n++;
  out.push(ribbon([[x - wb * 0.52, midY - h * 0.06], [x - wb * 0.6, midY + h * 0.12], [x - wb * 0.62, y - hemW * 3]], R * 0.42, '#c9962e')); counter.n++;
  out.push(ribbon([[x + wb * 0.52, midY - h * 0.06], [x + wb * 0.6, midY + h * 0.12], [x + wb * 0.62, y - hemW * 3]], R * 0.42, '#e0b34a')); counter.n++;
  // 2) arms when the pose asks — a draped SLEEVE falling from the shoulder,
  // then the thin forearm and a warm hand-nub emerging from it
  for (const tip of [armL, armR]) {
    if (!tip) continue;
    const side = tip[0] >= cx ? 1 : -1;
    const sx2 = x + side * wt * 0.85, sy2 = neckY + R * 0.35;
    const mx2 = (sx2 + tip[0]) / 2 + side * 2, my2 = (sy2 + tip[1]) / 2 + 2;
    out.push(ribbon([[sx2, sy2], [(sx2 + mx2) / 2, (sy2 + my2) / 2 + 1]], Math.max(5, h * 0.085), OUT)); counter.n++;
    out.push(ribbon([[sx2, sy2], [(sx2 + mx2) / 2, (sy2 + my2) / 2 + 1]], Math.max(3.6, h * 0.066), '#f0d489')); counter.n++;
    out.push(ribbon([[sx2, sy2], [mx2, my2], [tip[0], tip[1]]], Math.max(3, h * 0.042), OUT)); counter.n++;
    out.push(ribbon([[sx2, sy2], [mx2, my2], [tip[0], tip[1]]], Math.max(2, h * 0.028), '#f0d489')); counter.n++;
    out.push(`<circle cx="${R1(tip[0])}" cy="${R1(tip[1])}" r="${R1(Math.max(2, h * 0.026))}" fill="#fff6d8" stroke="${OUT}" stroke-width="1"/>`); counter.n++;
  }
  // 3) THE MASK — a tall serene ivory oval, CROWNED: a clear gold band with
  // three small upright points (a crown reads as a crown, never as horns)
  const crownB = cy - R * 0.74;
  out.push(`<path d="M${R1(cx - R * 0.62)} ${R1(crownB + R * 0.06)} Q${R1(cx)} ${R1(crownB - R * 0.18)} ${R1(cx + R * 0.62)} ${R1(crownB + R * 0.06)} L${R1(cx + R * 0.58)} ${R1(crownB + R * 0.3)} Q${R1(cx)} ${R1(crownB + R * 0.08)} ${R1(cx - R * 0.58)} ${R1(crownB + R * 0.3)}Z" fill="#e8b33d" stroke="${OUT}" stroke-width="${R1(Math.max(1.8, h * 0.022))}" stroke-linejoin="round"/>`); counter.n++;
  out.push(`<path d="M${R1(cx - R * 0.2)} ${R1(crownB)}L${R1(cx)} ${R1(crownB - R * 0.66)}L${R1(cx + R * 0.2)} ${R1(crownB)}Z" fill="#ffe9a0" stroke="${OUT}" stroke-width="${R1(Math.max(1.8, h * 0.022))}" stroke-linejoin="round"/>`); counter.n++;
  for (const side of [-1, 1]) {
    out.push(`<path d="M${R1(cx + side * R * 0.52)} ${R1(crownB + R * 0.02)}L${R1(cx + side * R * 0.44)} ${R1(crownB - R * 0.4)}L${R1(cx + side * R * 0.26)} ${R1(crownB - R * 0.02)}Z" fill="#ffe9a0" stroke="${OUT}" stroke-width="${R1(Math.max(1.8, h * 0.022))}" stroke-linejoin="round"/>`); counter.n++;
  }
  out.push(`<ellipse cx="${R1(cx)}" cy="${R1(cy)}" rx="${R1(R * 0.92)}" ry="${R1(R * 1.06)}" fill="#fff8e6" stroke="${OUT}" stroke-width="${R1(Math.max(2.6, h * 0.032))}"/>`); counter.n++;
  // 4) CALM CRESCENT EYES — kind, half-closed; none from behind
  if (!back) {
    for (const side of [-1, 1]) {
      const ecx = cx + side * R * 0.4 + facing * R * 0.06, ecy = cy + R * 0.08;
      out.push(`<path d="M${R1(ecx - R * 0.18)} ${R1(ecy)} Q${R1(ecx)} ${R1(ecy + R * 0.22)} ${R1(ecx + R * 0.18)} ${R1(ecy)}" fill="none" stroke="#6a4414" stroke-width="${R1(Math.max(1.6, R * 0.11))}" stroke-linecap="round"/>`);
      counter.n++;
    }
  }
}

// KLIMT GOLD — a gilded ornament of glory (a Byzantine halo / Klimt "gold ground"):
// concentric thin gold rings with rings of small gold dots riding between them.
// Gold is the colour of the throne and the holy place — "the king made a great
// throne... and overlaid it with pure gold" (2 Chr 9:17), the tabernacle and the
// city of pure gold — so it is reserved here for the Light and the Father's house.
export function klimtGold(out, counter, rng, cx, cy, r0, r1, { rings = 5, opacity = 0.5, squash = 1 } = {}) {
  const COLS = ['#fff6d8', '#ffe9a0', '#f0d489', '#e8b33d'];
  for (let i = 0; i < rings; i++) {
    const t = rings > 1 ? i / (rings - 1) : 0;
    const rr = r0 + (r1 - r0) * t;
    out.push(`<ellipse cx="${R1(cx)}" cy="${R1(cy)}" rx="${R1(rr)}" ry="${R1(rr * squash)}" fill="none" stroke="${COLS[i % COLS.length]}" stroke-width="${R1(1 + (1 - t) * 0.9)}" opacity="${opacity.toFixed(2)}"/>`);
    counter.n++;
    if (i < rings - 1) {                       // a ring of small gold dots just outside this ring
      const rm = rr + (r1 - r0) / (rings - 1) * 0.5;
      const nd = Math.max(10, Math.round(rm * 0.3));
      const dc = COLS[(i + 2) % COLS.length];
      let dots = '';
      for (let k = 0; k < nd; k++) {
        const a = (k / nd) * Math.PI * 2 + i * 0.4;
        dots += `<circle cx="${R1(cx + Math.cos(a) * rm)}" cy="${R1(cy + Math.sin(a) * rm * squash)}" r="${(1.1 + (k % 2) * 0.6).toFixed(1)}" fill="${dc}"/>`;
      }
      out.push(`<g opacity="${(opacity * 0.92).toFixed(2)}">${dots}</g>`); counter.n++;
    }
  }
}

// GOLD SPARKS — legible, discrete points of gold light (the way Klimt's gold leaf
// catches), scattered through a radius band. Each is a bright 8-point sparkle with
// a white-hot heart, so it reads clearly as a spark, not a wash. For the glory of
// the Light and the radiance of the Father's house (Rev 21:23).
export function goldSparks(out, counter, rng, cx, cy, rMin, rMax, n, { squash = 1, big = 1, lightFn } = {}) {
  const COLS = ['#fffbe6', '#fff2c0', '#ffe9a0', '#ffd86a'];
  let s = '';
  for (let i = 0; i < n; i++) {
    const a = rng() * Math.PI * 2, rr = rMin + (rMax - rMin) * Math.sqrt(rng());
    const x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr * squash;
    if (lightFn && lightFn(x, y) < rng() * 0.4) continue;        // denser where the light is strong
    const sz = (1.7 + rng() * 2.8) * big, col = COLS[(rng() * COLS.length) | 0];
    // two crossed tapered diamonds = an 8-point star, + a white-hot centre
    s += `<path d="M${R1(x - sz)} ${R1(y)}L${R1(x)} ${R1(y - sz * 0.42)}L${R1(x + sz)} ${R1(y)}L${R1(x)} ${R1(y + sz * 0.42)}Z" fill="${col}"/>`;
    s += `<path d="M${R1(x)} ${R1(y - sz)}L${R1(x + sz * 0.42)} ${R1(y)}L${R1(x)} ${R1(y + sz)}L${R1(x - sz * 0.42)} ${R1(y)}Z" fill="${col}"/>`;
    s += `<circle cx="${R1(x)}" cy="${R1(y)}" r="${(sz * 0.4).toFixed(1)}" fill="#fffef6"/>`;
  }
  out.push(`<g>${s}</g>`); counter.n++;
}

// THE PALACE OF GOD — the New Jerusalem (Rev 21): a city of pure gold (21:18),
// "her light like a stone most precious" (21:11), gates that "shall not be shut"
// (21:25), the Lamb its lamp (21:23). A tiered palace of gold towers around a
// central OPEN GATE of light. REUSABLE so the SAME Home appears wherever the way
// leads to it (ran, gift, come, twoways) — one consistent City, not a different
// house each page. Draws INTO `out`, centred at (cx, baseY = the ground line it
// stands on), sized by `s` (≈1 near, ≈0.4 distant). `gate` opens the way of light.
let _palaceId = 0;   // unique clip ids for the glass sheen (several palaces can share one plane)
export function paintPalace(out, counter, rng, cx, baseY, s, { gate = true } = {}) {
  const G = ['#f8dc90', '#eec158', '#dca63a', '#bd8628'];   // sunlit → shadow gold
  const HOT = '#fff4cc', WARM = '#ffe6a2', EDGE = '#6f5220';
  const push = str => { out.push(str); counter.n++; };
  // painterly gold fill of a box — long smooth VERTICAL strokes (radiant wall, not
  // cobble), sunlit (left) → shadow (right) for round form
  const fillBox = (x0, y0, x1, y1) => strokes(out, counter, {
    rng, n: Math.max(18, Math.round((x1 - x0) * (y1 - y0) / 46)),
    sample: rej(x0, y0, x1, y1),
    dir: () => Math.PI / 2 + (rng() - 0.5) * 0.06,
    col: (x, y, r) => { const sh = (x - x0) / ((x1 - x0) || 1); return jig(mix(mix(G[0], G[2], sh), sh < 0.4 ? HOT : EDGE, Math.abs(sh - 0.38) * 0.85), r, 5); },
    len: 13 * s, lw: 4 * s, steps: 3, lenJ: 0.4, follow: 1, impasto: 0.55, relief: 0.5,
  });
  /* ⭐ ASHLAR (Sep 12). Fred: "the kingdom looks very basic, just a bunch of straight lines —
     how can we add texture?" A wall of vertical smears is a gold extrusion; a wall of BLOCKS is
     something somebody built. Every block is one loaded stroke (so the engine's hairline glass
     bevel runs round each stone), laid in staggered courses, each block its own value — lit
     toward the gate, shadowed away from it, brighter up the shaft — with the underpaint showing
     as mortar between them. Rev 21:18: "the city was pure gold, like unto clear glass." */
  const ashlar = (x0, y0, x1, y1, litFromLeft = true) => {
    const bh = 6.2 * s, bw = 10.5 * s, gap = 0.9 * s;
    const rows = Math.max(1, Math.floor((y1 - y0) / bh));
    for (let r0 = 0; r0 < rows; r0++) {
      const cy = y0 + r0 * bh + bh / 2;
      const off = (r0 % 2) * bw * 0.5 + (rng() - 0.5) * 2 * s;
      for (let bx = x0 - bw + off; bx < x1; bx += bw + (rng() - 0.5) * 1.5 * s) {
        const bl = Math.max(x0, bx), br = Math.min(x1, bx + bw - gap);
        if (br - bl < 2 * s) continue;
        const mx = (bl + br) / 2, len = br - bl;
        strokes(out, counter, {
          rng, n: 1, sample: () => [mx, cy], dir: () => (rng() - 0.5) * 0.02,
          // ⭐ Sep 14, Fred: "you are using gradient right — instead of block gradient, paint the
          // gradient in manually." So no formula decides a stone's value. The light only tips
          // the ODDS: each stone draws its value from the four golds with a die weighted toward
          // the light, so a bright stone can sit in the shadow side and a dark one in the lit,
          // and the gradient is what the eye AVERAGES out of many hand-chosen values — the way a
          // painted wall turns, not the way a filled rectangle does.
          col: (x, y, r) => {
            const sh = Math.max(0, Math.min(1, (x - x0) / ((x1 - x0) || 1)));
            const lit = litFromLeft ? 1 - sh : sh;
            const up = 1 - Math.max(0, Math.min(1, (y - y0) / ((y1 - y0) || 1)));
            // (Sep 14, Fred again: "no, gradient is good, i just want it to be drawn manually" — so
            //  the stones keep a steady, gently turning value, and the GRADIENT is laid on top by
            //  hand in the three glaze passes below, each thinning out as it goes.)
            const bias = lit * 0.7 + up * 0.3;                     // 0 = shadow, 1 = light
            let c = mix(G[3], G[0], Math.max(0, Math.min(1, bias + (r() + r() - 1) * 0.22)));
            return jig(mix(c, r() < 0.5 ? '#ffe9b8' : '#b08a4a', r() * 0.18), r, 4);
          },
          len, lw: bh - gap, steps: 1, lenJ: 0, wJ: 0, aJ: 0, impasto: 0.6, relief: 0.55, op: 1,
        });
      }
    }
    // THE GRADIENT, LAID BY HAND — three glaze passes, the way a painter turns a wall: a
    // highlight pass DENSE on the lit side and thinning out across the face, a shadow pass dense
    // on the far side and thinning the other way, and a thin mid-tone between. The turn from
    // light to dark comes from how many strokes land where, never from a number per mark.
    const wallW = (x1 - x0) || 1, area = (x1 - x0) * (y1 - y0);
    const litOf = x => { const sh = Math.max(0, Math.min(1, (x - x0) / wallW)); return litFromLeft ? 1 - sh : sh; };
    const glaze = (n, weight, cols, op, lenK) => strokes(out, counter, {
      rng, n,
      sample: r => { for (let t = 0; t < 12; t++) { const x = x0 + r() * wallW; if (r() < weight(litOf(x))) return [x, y0 + r() * (y1 - y0)]; } return null; },
      dir: () => Math.PI / 2 + (rng() - 0.5) * 0.22,
      col: (x, y, r) => jig(mix(cols[0], cols[1], r()), r, 3),
      len: (x, y) => (8 + rng() * 14) * lenK * s, lw: (x, y) => (2 + rng() * 3.5) * s, steps: 2, lenJ: 0.6, wJ: 0.5, impasto: 0, relief: 0,
      op,
    });
    const N = Math.max(10, Math.round(area / (110 * s * s)));
    glaze(N, l => Math.pow(l, 2.2), ['#ffe9b6', HOT], 0.20, 1.0);            // the light, thinning out from the lit edge
    glaze(N, l => Math.pow(1 - l, 2.2), ['#7a5a48', '#5a4a6a'], 0.20, 1.0);  // the shade, thinning out from the far edge
    glaze(Math.round(N * 0.6), l => 0.6, [G[1], '#d9b978'], 0.09, 1.3);        // a thin mid-tone over all, tying the passes
  };
  // ⭐ THE EDGE IS BRUSHED, NOT CUT (Sep 14). Fred: "make the edge of the kingdom not too sharp —
  // it looks like a sticker instead of something painted on the painting." A rectangle's edge is a
  // ruled line no brush ever made. So every silhouette edge gets marks that STRADDLE it: stones
  // poking a little past the line in the wall's own colour, and a few strokes of the air's warmth
  // crossing back over the wall — lost-and-found edges, the way a painted tower meets its sky.
  const brushEdge = (ax, ay, bx, by, lean = 1) => {
    const L = Math.hypot(bx - ax, by - ay); if (L < 4 * s) return;
    const nx = -(by - ay) / L, ny = (bx - ax) / L;
    strokes(out, counter, {
      rng, n: Math.max(4, Math.round(L / (5.5 * s))),
      sample: r => { const t = r(); const off = (r() + r() - 1) * 3 * s; return [ax + (bx - ax) * t + nx * off, ay + (by - ay) * t + ny * off]; },
      dir: () => Math.atan2(by - ay, bx - ax) + (rng() - 0.5) * 0.5,
      col: (x, y, r) => r() < 0.62 ? jig(mix(G[1], G[0], r()), r, 4) : jig(mix('#fff0c8', '#f6d9a0', r()), r, 3),
      len: (x, y) => (4 + rng() * 6) * s, lw: (x, y) => (1.4 + rng() * 2.2) * s, steps: 1, lenJ: 0.5, wJ: 0.4, impasto: 0.4, relief: 0.35,
      op: (() => 0.85)(),
    });
  };
  // BATTLEMENTS along a top edge — merlons a child would draw on a castle, lit on top
  const battlements = (x0, x1, y, keepClearOf = null) => {
    const mw = 5 * s, gapw = 4.2 * s, mh = 4.6 * s;
    for (let mx = x0 + 1.5 * s; mx + mw < x1; mx += mw + gapw) {
      if (keepClearOf && Math.abs(mx + mw / 2 - keepClearOf[0]) < keepClearOf[1]) continue;
      push(`<rect x="${R1(mx)}" y="${R1(y - mh)}" width="${R1(mw)}" height="${R1(mh + 0.6 * s)}" fill="${G[1]}"/>`);
      push(`<rect x="${R1(mx)}" y="${R1(y - mh)}" width="${R1(mw)}" height="${R1(1.1 * s)}" fill="${HOT}" opacity="0.8"/>`);
      push(`<rect x="${R1(mx + mw * 0.7)}" y="${R1(y - mh)}" width="${R1(mw * 0.3)}" height="${R1(mh)}" fill="${EDGE}" opacity="0.35"/>`);
    }
  };
  // ⚠ A FLAT TRIANGLE IS A PIECE OF CARD. Fred, on the house: "now it looks like a
  // cardboard fake house haha." Every other surface here had material on it — the walls
  // get fillBox's vertical strokes, the footing gets its jewel courses — but the ROOFS
  // were single flat `fill` paths with one highlight laid on, which is exactly what a
  // folded paper model looks like. Tiles run ALONG the slope and step down it, and the
  // roof's lit side is the same side as the wall's, so the whole tower turns as one form.
  const roofTiles = (x0, x1, yb, apx, apy, curve) => {
    const A = [x0, yb], B = [x1, yb], C = [apx, apy];
    const area = Math.abs((x1 - x0) * (yb - apy)) / 2;
    // ⭐ Sep 12: TILES IN COURSES, and TERRACOTTA (the house style's roof: gold walls,
    // terracotta roof). Random marks down the slope read as more gold; rows of small tiles
    // stepping up the roof, each catching light on its upper edge, read as a roof.
    const TR = ['#f0b07a', '#d4834c', '#a85a34', '#6e3a24'];   // sunlit → shadow terracotta
    const rowH = 2.6 * s, rows = Math.max(3, Math.round((yb - apy) / rowH));
    for (let j = 0; j < rows; j++) {
      const v = (j + 0.5) / rows;                              // 0 at the eave → 1 at the crown
      const y = yb - v * (yb - apy);
      const lx = x0 + (apx - x0) * v, rx = x1 - (x1 - apx) * v; // the triangle narrows toward the apex
      if (rx - lx < 1.5 * s) continue;
      const n = Math.max(2, Math.round((rx - lx) / (3.2 * s)));
      strokes(out, counter, {
        rng, n,
        sample: r => { const px = lx + r() * (rx - lx); let py = y; if (curve) py -= Math.sin(Math.max(0, Math.min(1, (px - x0) / ((x1 - x0) || 1))) * Math.PI) * (yb - apy) * 0.22; return [px, py + (r() - 0.5) * 0.6 * s]; },
        dir: (x) => Math.atan2(yb - apy, (x < apx ? x0 : x1) - apx) * 0.18,   // nearly along the row, leaning with the slope
        col: (x, y2, r) => {
          const sh = Math.max(0, Math.min(1, (x - x0) / ((x1 - x0) || 1)));
          const bias = (1 - sh) * 0.85 + v * 0.15;             // toward the light and the crown
          const idx = Math.max(0, Math.min(3, Math.round((1 - bias) * 3 + (r() + r() - 1) * 1.8)));   // a hand's choice, not a ramp
          let c = TR[idx];
          if (idx === 0 && r() < 0.3) c = mix(c, HOT, 0.4);
          return jig(mix(c, r() < 0.5 ? '#ffe0c0' : '#5a2a18', r() * 0.22), r, 4);
        },
        len: 3.0 * s, lw: 2.0 * s, steps: 1, lenJ: 0.3, wJ: 0.2, aJ: 0.05, impasto: 0.55, relief: 0.45, op: 1,
      });
    }
    // the eaves: a roof throws a shadow on the wall it sits on, and that one dark line is
    // most of what says the roof STANDS OUT from the tower rather than being printed on it
    push(`<rect x="${R1(x0)}" y="${R1(yb)}" width="${R1(x1 - x0)}" height="${R1(1.6 * s)}" fill="${EDGE}" opacity="0.42"/>`);
  };
  // ⚠ COURSES. A wall of smooth vertical strokes is a gold EXTRUSION; masonry is laid in
  // courses, and it is the horizontal line every few feet that says "somebody built this".
  // Faint, and never a ruled line all the way across — the eye only needs the suggestion.
  const courses = (x0, y0, x1, y1) => {
    const step = 9 * s, w = x1 - x0;
    for (let cy = y0 + step; cy < y1 - step * 0.5; cy += step) {
      const seg = 0.55 + rng() * 0.4;                       // each course breaks somewhere
      const sx = x0 + rng() * w * (1 - seg);
      paintPath(out, counter, rng, [[sx, cy], [sx + w * seg, cy + (rng() - 0.5) * 0.8 * s]],
        (x, y, r) => jig(mix(EDGE, G[1], 0.35 + r() * 0.4), r, 5),
        { lw: 0.7 * s, len: 3 * s, density: 0.22, jitter: 0.5 });
      if (rng() < 0.3) {                                    // and an occasional block, catching light
        const bx = x0 + rng() * (w - 8 * s);
        push(`<rect x="${R1(bx)}" y="${R1(cy - step * 0.75)}" width="${R1(6 * s + rng() * 5 * s)}" height="${R1(step * 0.62)}" fill="${G[0]}" opacity="${(0.10 + rng() * 0.13).toFixed(2)}"/>`);
      }
    }
  };
  // ⚠ A CORNICE where the wall stops. Architecture reads as built at its EDGES — the band
  // that caps a tower does more for it than any amount of detail on the shaft.
  const cornice = (x0, x1, y, depth) => {
    // ⚠ thin. A fat three-band cornice at this scale reads as a ROPE tied round the tower.
    push(`<rect x="${R1(x0 - depth)}" y="${R1(y)}" width="${R1(x1 - x0 + depth * 2)}" height="${R1(1.9 * s)}" fill="${G[1]}" opacity="0.9"/>`);
    push(`<rect x="${R1(x0 - depth)}" y="${R1(y)}" width="${R1(x1 - x0 + depth * 2)}" height="${R1(0.7 * s)}" fill="${HOT}" opacity="0.6"/>`);
    push(`<rect x="${R1(x0 - depth)}" y="${R1(y + 1.9 * s)}" width="${R1(x1 - x0 + depth * 2)}" height="${R1(0.8 * s)}" fill="${EDGE}" opacity="0.34"/>`);
  };
  // ⚠ FIVE TOWERS STANDING APART ARE FIVE SLABS. What makes them one HOUSE is everything
  // between them: a back rank of roofs behind, a curtain wall binding them at the foot, and
  // a footing of jewel under the whole thing. "In my Father's house are many mansions"
  // (John 14:2) — so it should read as a great house full of rooms, not five columns in a
  // row. Revising the house the book already has, never swapping it for another.

  // A · THE BACK RANK — smaller roofs crowding behind, paler because they stand further off
  const backR = mulberry32(9173);
  for (let i = 0; i < 9; i++) {
    const bdx = (-186 + i * 46 + (backR() - 0.5) * 20) * s;
    const bw = (16 + backR() * 22) * s, bh = (54 + backR() * 62) * s;
    const bx0 = cx + bdx - bw / 2, byT = baseY - bh;
    // (Sep 14: painted, not filled — the far roofs were two-tone rectangles, the very "block
    //  gradient" Fred named. Pale marks laid by hand, and the edges ragged.)
    push(`<rect x="${R1(bx0)}" y="${R1(byT)}" width="${R1(bw)}" height="${R1(bh)}" fill="${mix(G[1], '#f2ecdc', 0.42)}"/>`);
    strokes(out, counter, {
      rng: backR, n: Math.max(10, Math.round(bw * bh / (22 * s * s))),
      sample: r => [bx0 - 1.5 * s + r() * (bw + 3 * s), byT - 1.5 * s + r() * (bh + 3 * s)],
      dir: () => Math.PI / 2 + (backR() - 0.5) * 0.2,
      col: (x, y, r) => { const litL = (x - bx0) / bw < 0.5; return jig(mix(litL ? mix(G[0], '#fffaf0', 0.5) : mix(G[1], '#f2ecdc', 0.42), r() < 0.5 ? '#fff8e6' : '#d9b978', r() * 0.35), r, 4); },
      len: (x, y) => (6 + backR() * 8) * s, lw: (x, y) => (2 + backR() * 2.5) * s, steps: 2, lenJ: 0.5, wJ: 0.4, impasto: 0.2, relief: 0.2,
    });
    strokes(out, counter, {   // its roof, brushed
      rng: backR, n: Math.max(6, Math.round(bw * bw * 0.85 / (18 * s * s))),
      sample: r => { let u = r(), v = r(); if (u + v > 1) { u = 1 - u; v = 1 - v; } return [bx0 - 1.5 * s + u * (bw + 3 * s) + v * (bw / 2 + 1.5 * s), byT + 1 - v * bw * 0.85]; },
      dir: (x) => Math.atan2(bw * 0.85, (x < cx + bdx ? -1 : 1) * bw / 2),
      col: (x, y, r) => jig(mix(mix('#e8a97a', '#c98860', r()), '#fff6e2', 0.45), r, 4),
      len: (x, y) => (3 + backR() * 4) * s, lw: (x, y) => (1.6 + backR() * 1.6) * s, steps: 1, lenJ: 0.5, impasto: 0.2, relief: 0.2,
    });
    for (let k = 0; k < Math.max(1, Math.round(bh / (20 * s))); k++) {
      const wy = byT + 8 * s + k * (bh * 0.7 / Math.max(1, Math.round(bh / (20 * s))));
      push(`<rect x="${R1(cx + bdx - bw * 0.09)}" y="${R1(wy)}" width="${R1(bw * 0.18)}" height="${R1(2.6 * s)}" fill="#fffdf0" opacity="0.6"/>`);
    }
  }

  /* ⭐⭐ ARCHITECTURE (Sep 14). Fred, on the textured house: "good but just good… it still looks
     low effort." Texture on five boxes is still five boxes. What makes a building read as a
     BUILDING is structure and depth: things in front of things, shadows thrown by one part on
     another, corners that turn, openings with thickness, and life inside the walls. So, in
     order of depth: trees of life showing over the wall (Rev 22:2), the curtain wall, the
     towers with quoins, buttresses at their feet, galleries bridging them, turrets at their
     corners, a rose window over the gate, and every tower throwing its shadow on the wall. */
  // A2 · TREES OF LIFE — canopies inside the walls, showing above the curtain wall between the
  //      towers: green in a gold city, and fruit on them (Rev 22:2 "twelve manner of fruits")
  {
    const trng = mulberry32(4471);
    for (const tx of [-121, -46, 46, 121, -200, 200]) {
      const cxT = cx + tx * s, top = baseY - 54 * s - (14 + trng() * 10) * s, rw = (16 + trng() * 8) * s;
      strokes(out, counter, {
        rng: trng, n: Math.round(rw * 2.6),
        sample: r => { const a = r() * Math.PI, d = Math.pow(r(), 0.6); return [cxT + Math.cos(a) * rw * d, top + 12 * s - Math.sin(a) * rw * 0.75 * d]; },
        dir: (x, y) => Math.atan2(y - (top + 12 * s), x - cxT) + Math.PI / 2 + (trng() - 0.5) * 0.8,
        col: (x, y, r) => { const up = Math.max(0, (top + 12 * s - y) / (rw * 0.75 + 0.1)); return jig(mix(ramp(['#2e6a34', '#4f9a3e', '#8cc84a', '#d6e46a'], up * 0.85 + r() * 0.2), '#fff2b0', Math.pow(up, 2) * 0.25), r, 6); },
        len: 4.2 * s, lw: 2.4 * s, steps: 2, lenJ: 0.5, impasto: 0.5, relief: 0.4,
      });
      for (let k = 0; k < 5; k++) { const a = trng() * Math.PI, d = 0.4 + trng() * 0.5; push(`<circle cx="${R1(cxT + Math.cos(a) * rw * d)}" cy="${R1(top + 12 * s - Math.sin(a) * rw * 0.7 * d)}" r="${(1.5 * s).toFixed(1)}" fill="${['#ffd23d', '#ff7a5a', '#ff5aa8'][k % 3]}"/>`); counter.n++; }
    }
  }

  // B · THE CURTAIN WALL — it binds the towers into one front, with an arcade along it so
  //     the house has rooms at ground level and the eye can walk in
  const cwTop = baseY - 54 * s, cwx0 = cx - 172 * s, cwx1 = cx + 172 * s;
  push(`<rect x="${R1(cwx0)}" y="${R1(cwTop)}" width="${R1(cwx1 - cwx0)}" height="${R1(baseY - cwTop + 2)}" fill="${G[2]}"/>`);
  ashlar(cwx0, cwTop, cwx1, baseY, true);
  cornice(cwx0, cwx1, cwTop, 2.4 * s);
  battlements(cwx0, cwx1, cwTop, [cx, 48 * s]);
  brushEdge(cwx0, baseY, cwx0, cwTop); brushEdge(cwx1, baseY, cwx1, cwTop);
  for (let a = 0; a < 13; a++) {
    const ax = cwx0 + 14 * s + a * ((cwx1 - cwx0 - 28 * s) / 12);
    if (Math.abs(ax - cx) < 46 * s) continue;                    // the great gate keeps its own space
    const aw = 9 * s, ah = 22 * s, ay = baseY - 4 * s;
    push(`<path d="M${R1(ax - aw / 2)} ${R1(ay)}L${R1(ax - aw / 2)} ${R1(ay - ah * 0.55)}Q${R1(ax)} ${R1(ay - ah * 1.15)} ${R1(ax + aw / 2)} ${R1(ay - ah * 0.55)}L${R1(ax + aw / 2)} ${R1(ay)}Z" fill="${EDGE}" opacity="0.5"/>`);
    push(`<path d="M${R1(ax - aw * 0.34)} ${R1(ay)}L${R1(ax - aw * 0.34)} ${R1(ay - ah * 0.5)}Q${R1(ax)} ${R1(ay - ah * 0.98)} ${R1(ax + aw * 0.34)} ${R1(ay - ah * 0.5)}L${R1(ax + aw * 0.34)} ${R1(ay)}Z" fill="#fff6d8" opacity="${(0.45 + backR() * 0.45).toFixed(2)}"/>`);
  }

  // C · THE FOOTING — twelve courses of precious stone under the whole house (Rev 21:19-20),
  //     deep in its own shade so they GLINT rather than stripe
  const JEWEL12 = ['#2f8f7c', '#2a56a4', '#7fa8c4', '#238a48', '#b45f3c', '#a82a32',
                   '#c99a34', '#2f9a95', '#d4bf46', '#7ab63c', '#b83c70', '#7a4cc4'];
  const jH = 7 * s;
  push(`<rect x="${R1(cwx0 - 6 * s)}" y="${R1(baseY - jH)}" width="${R1(cwx1 - cwx0 + 12 * s)}" height="${R1(jH + 2 * s)}" fill="#1d1830"/>`);
  for (let i = 0; i < 12; i++) {
    const jx0 = cwx0 - 6 * s + i * ((cwx1 - cwx0 + 12 * s) / 12);
    const jx1 = jx0 + (cwx1 - cwx0 + 12 * s) / 12;
    // ⚠ COVER THE SHADE YOU LAID. The rect above is the footing's own darkness, meant
    // to be seen only BETWEEN the stones — but at n = width/2 the courses covered
    // roughly a third of it, so #1d1830 read through as dark boxes at the tower feet.
    // A course of (jx1-jx0) px needs about (jx1-jx0)*2.2 marks of this size before the
    // random placement stops leaving holes. Sample a little past the base, too: the
    // rect runs to baseY+2s and the strokes used to stop at baseY+s, leaving a dark
    // line along the very bottom of the house.
    strokes(out, counter, {
      rng, n: Math.max(24, Math.round((jx1 - jx0) * 2.2)),
      sample: rej(jx0, baseY - jH, jx1, baseY + 2 * s),
      dir: () => 0.02,
      col: (x, y, r) => {
        const mid = 1 - Math.min(1, Math.abs(x - cx) / (170 * s));       // the gate's light reaches the middle
        // ⚠ THE OUTER COURSES MUST STILL BE STONE. `mid` falls to 0 at the ends of the
        // house, and at 0.16 jewel the mix is 84% near-black — so the footing read as
        // dark BLOCKS under the outer towers rather than as jewel in shadow. Floor it:
        // the gate's light still swells the middle, but no course is ever mud.
        let c = mix('#171327', JEWEL12[i], 0.44 + mid * 0.40 + r() * 0.18);
        c = mix(c, '#ffffff', Math.pow(mid, 2.2) * 0.4 * r());
        return jig(c, r, 8);
      },
      len: 5 * s, lw: 1.8 * s, steps: 2, lenJ: 0.5, impasto: 0.5, op: 0.92,
    });
  }

  // D · THE DARK BETWEEN THE TOWERS. Bound into one front by the curtain wall, the house
  //     turned into a single slab of gold: no gaps, so no masses. Every tower needs air and
  //     shadow beside it or the eye reads one shape instead of five.
  for (const gx of [-121, -46, 46, 121]) {
    const gxx = cx + gx * s;
    strokes(out, counter, {
      rng, n: 90,
      sample: rej(gxx - 10 * s, baseY - 118 * s, gxx + 10 * s, baseY - 4 * s),
      dir: () => Math.PI / 2,
      col: (x, y, r) => jig(mix('#7a5a28', '#b08c40', r() * 0.75), r, 6),   // deep GOLD in the gaps, not mud
      len: 9 * s, lw: 2.2 * s, steps: 2, lenJ: 0.5, impasto: 0.4, op: 0.34,
    });
  }

  // towers: [dx, w, h, kind] — central tallest, symmetric flanks; drawn back→front
  const T = [[-150, 32, 84, 'spire'], [150, 32, 84, 'spire'], [-92, 46, 122, 'dome'], [92, 46, 122, 'dome'], [0, 78, 200, 'spire']];
  for (const [dx0, w0, h0, kind] of T) {
    const dx = dx0 * s, w = w0 * s, h = h0 * s;
    const x0 = cx + dx - w / 2, x1 = cx + dx + w / 2, yTop = baseY - h;
    push(`<rect x="${R1(x0)}" y="${R1(yTop)}" width="${R1(w)}" height="${R1(h + 2)}" fill="${G[2]}"/>`);   // SOLID underpaint so the palace reads opaque, not see-through (Fred), even in a hazy layer
    ashlar(x0, yTop, x1, baseY, dx0 > 0);      // lit toward the gate at the centre
    brushEdge(x0, baseY, x0, yTop); brushEdge(x1, baseY, x1, yTop);   // the silhouette is a brushed edge, not a cut
    // dark edges (form)
    // ⚠ NOT AN OUTLINE ON BOTH SIDES. A dark bar down each edge draws the tower as a flat
    // slab with a border. A round shaft has ONE lit edge and one in shadow — and on this
    // page the light is the city's own gate, so the edge nearer the centre catches it and
    // the outer edge falls away. That single asymmetry is what makes a box a column.
    const inner = dx0 <= 0 ? x1 : x0, outer = dx0 <= 0 ? x0 : x1;
    paintPath(out, counter, rng, [[inner, baseY], [inner, yTop]],
      (x, y, r) => jig(mix(G[0], HOT, 0.35 + r() * 0.5), r, 5), { lw: 1.5 * s, len: 5 * s, density: 0.6, jitter: 0.4 });
    paintPath(out, counter, rng, [[outer, baseY], [outer, yTop]],
      (x, y, r) => jig(mix(EDGE, G[3], r() * 0.5), r, 5), { lw: 1.7 * s, len: 5 * s, density: 0.6, jitter: 0.4 });
    if (kind === 'spire') {
      const sp = 1.35 * w;
      push(`<path d="M${R1(x0 - 2 * s)} ${R1(yTop + 3 * s)}L${R1(cx + dx)} ${R1(yTop - sp)}L${R1(x1 + 2 * s)} ${R1(yTop + 3 * s)}Z" fill="${G[2]}"/>`);
      roofTiles(x0 - 2 * s, x1 + 2 * s, yTop + 3 * s, cx + dx, yTop - sp, false);
      brushEdge(x0 - 2 * s, yTop + 3 * s, cx + dx, yTop - sp); brushEdge(cx + dx, yTop - sp, x1 + 2 * s, yTop + 3 * s);
      push(`<path d="M${R1(cx + dx - w * 0.16)} ${R1(yTop - sp * 0.22)}L${R1(cx + dx)} ${R1(yTop - sp)}L${R1(cx + dx + w * 0.06)} ${R1(yTop - sp * 0.3)}Z" fill="${HOT}"/>`);
      push(`<circle cx="${R1(cx + dx)}" cy="${R1(yTop - sp)}" r="${(3 * s).toFixed(1)}" fill="#fffef2"/>`);
    } else {
      const dh = w * 0.95;
      push(`<path d="M${R1(x0)} ${R1(yTop)}Q${R1(cx + dx)} ${R1(yTop - dh)} ${R1(x1)} ${R1(yTop)}Z" fill="${G[2]}"/>`);
      roofTiles(x0, x1, yTop, cx + dx, yTop - dh, true);
      for (let k = 0; k < 6; k++) { const a0 = Math.PI + k * Math.PI / 6, a1 = a0 + Math.PI / 6; brushEdge(cx + dx + Math.cos(a0) * w / 2, yTop + Math.sin(a0) * dh, cx + dx + Math.cos(a1) * w / 2, yTop + Math.sin(a1) * dh); }
      push(`<path d="M${R1(cx + dx - w * 0.34)} ${R1(yTop - dh * 0.22)}Q${R1(cx + dx - w * 0.05)} ${R1(yTop - dh) } ${R1(cx + dx + w * 0.05)} ${R1(yTop - dh * 0.34)}Z" fill="${WARM}" opacity="0.85"/>`);
      push(`<circle cx="${R1(cx + dx)}" cy="${R1(yTop - dh)}" r="${(2.8 * s).toFixed(1)}" fill="#fffef2"/>`);
    }
    // ⚠ MANY MANSIONS, AND ALL OF THEM LIT. Fred: "make the mansions bright of light."
    // John 14:2 — "in my Father's house are MANY mansions" — and Rev 21:23: the City has no
    // need of sun or moon, "for the glory of God did lighten it". Two dim dots per tower
    // said "a building at night with somebody in". Rows of white-hot windows, each with its
    // own halo bleeding into the wall around it, say a city that IS light. The central
    // tower gets them too, above the gate.
    cornice(x0, x1, yTop + 1.5 * s, 3 * s);                       // the head of the shaft
    cornice(x0, x1, yTop + h * 0.52, 1.8 * s);                    // a string course halfway
    {
      // ⚠ ARCHED WINDOWS, NOT PORTHOLES. Three concentric circles read as a ship's window
      // and gave every tower the same face. A tall light with a round head reads as a hall
      // — and lighting them UNEVENLY is what makes a city look inhabited rather than
      // switched on: some blaze, some are barely awake.
      // ══ ONE RULE, EVERY SCALE ══════════════════════════════════════════════════════
      // The house divides into towers; a tower divides into BAYS; a bay divides into
      // STOREYS; a storey holds a LIGHT. Same rule applied to its own output, each level
      // asking its own node in the chain — so no two towers, bays or windows repeat, and
      // all of them are obviously the same architect's. Rows-and-columns gave every tower
      // an identical face; this gives a building.
      const TN = gAt('palace', cx + dx, baseY, h0);
      const light = (N, wx0, wy0, wx1, wy1) => {
        const bw = wx1 - wx0, bh = wy1 - wy0;
        if (bw < 3.2 * s || bh < 5 * s) return;
        const ww = Math.min(bw * 0.52, bh * 0.3), wh = ww * 2.05;
        const wx = (wx0 + wx1) / 2 + N.swing('jx', bw * 0.06);
        const wy = (wy0 + wy1) / 2 + N.swing('jy', bh * 0.06);
        const lit = N.chance('dark', 0.16) ? 0.12 : 0.45 + N.trait('lit', 0, 0.55);
        const arc = (k) => {
          const aw = ww * k, ah = wh * k;
          return `M${R1(wx - aw / 2)} ${R1(wy + ah / 2)}L${R1(wx - aw / 2)} ${R1(wy - ah * 0.1)}`
               + `Q${R1(wx)} ${R1(wy - ah * 0.62)} ${R1(wx + aw / 2)} ${R1(wy - ah * 0.1)}`
               + `L${R1(wx + aw / 2)} ${R1(wy + ah / 2)}Z`;
        };
        push(`<path d="${arc(1.5)}" fill="${HOT}" opacity="${(0.14 * lit).toFixed(2)}"/>`);
        push(`<path d="${arc(1)}" fill="${EDGE}" opacity="0.55"/>`);
        push(`<path d="${arc(0.82)}" fill="#fff8e0" opacity="${(0.92 * lit).toFixed(2)}"/>`);
        push(`<path d="${arc(0.44)}" fill="#ffffff" opacity="${(0.7 * lit).toFixed(2)}"/>`);
        push(`<rect x="${R1(wx - ww * 0.62)}" y="${R1(wy + wh / 2)}" width="${R1(ww * 1.24)}" height="${R1(1.3 * s)}" fill="${G[0]}" opacity="0.8"/>`);
        push(`<rect x="${R1(wx - ww * 0.62)}" y="${R1(wy + wh / 2 + 1.3 * s)}" width="${R1(ww * 1.24)}" height="${R1(1.1 * s)}" fill="${EDGE}" opacity="0.45"/>`);
      };
      const bay = (N, bx0, by0, bx1, by1, depth) => {
        if (depth === 0) return light(N, bx0, by0, bx1, by1);
        const wide = (bx1 - bx0) > (by1 - by0) * 0.62;
        const n = 2 + Math.round(N.trait('n', 0, 1.45));
        for (let i = 0; i < n; i++) {
          const C = N.child('b' + i);
          const a = (i + C.swing('e', 0.16)) / n, b2 = (i + 1 + C.swing('e2', 0.16)) / n;
          const aa = Math.max(0, Math.min(1, a)), bb = Math.max(0, Math.min(1, b2));
          if (bb <= aa) continue;
          if (C.chance('solid', 0.1)) continue;                 // a blank stretch of wall
          if (wide) bay(C, bx0 + (bx1 - bx0) * aa, by0, bx0 + (bx1 - bx0) * bb, by1, depth - 1);
          else      bay(C, bx0, by0 + (by1 - by0) * aa, bx1, by0 + (by1 - by0) * bb, depth - 1);
        }
      };
      {
        const inset = w * 0.12;
        const top2 = yTop + h * 0.13;
        const bot2 = dx0 === 0 ? baseY - 132 * s : baseY - h * 0.06;   // the gate keeps its own space
        if (bot2 > top2 + 8 * s) bay(TN, x0 + inset, top2, x1 - inset, bot2, dx0 === 0 ? 4 : 3);
      }
    }
  }
  /* ⭐ "THE CITY WAS PURE GOLD, LIKE UNTO CLEAR GLASS" (Rev 21:18; Sep 21). Gold that is like
     glass is gold with a SHEEN: light does not only land on it, it slides across it. Each tower
     face carries the long diagonal bars a pane of glass shows when it catches the sky — a broad
     soft one and a thin bright one beside it — clipped to the face, translucent, and STRAIGHT,
     because glass is a made thing (Munch). Laid over the stonework so the blocks show through. */
  T.forEach(([dx0, w0, h0], ti) => {
    const w = w0 * s, h = h0 * s, x0 = cx + dx0 * s - w / 2, yTop = baseY - h;
    const id = 'pgl' + (_palaceId++) + 'x' + ti, run = h * 0.34;
    let g = `<clipPath id="${id}"><rect x="${R1(x0)}" y="${R1(yTop)}" width="${R1(w)}" height="${R1(h)}"/></clipPath><g clip-path="url(#${id})">`;
    for (const [k, wd, op] of [[0.18, 0.2, 0.17], [0.46, 0.05, 0.26], [0.74, 0.11, 0.12]]) {
      const bx = x0 + w * k + run * 0.5, bw = w * wd;
      g += `<path d="M${R1(bx - run)} ${R1(baseY)}L${R1(bx - run + bw)} ${R1(baseY)}L${R1(bx + bw)} ${R1(yTop)}L${R1(bx)} ${R1(yTop)}Z" fill="#ffffff" opacity="${op}"/>`;
    }
    push(g + '</g>');
  });

  /* ⭐ "AND HE CARVED ALL THE WALLS OF THE HOUSE ROUND ABOUT WITH CARVED FIGURES OF CHERUBIMS AND
     PALM TREES AND OPEN FLOWERS, within and without" (1 Kings 6:29). The ORDER is given too: "a
     palm tree was between a cherub and a cherub" (Ezek 41:18) — and the cherubims "stretch forth
     their wings on high… and their faces shall look one to another" (Ex 25:20). So over the
     great gate, where the mercy seat's two once faced each other over the way in: cherub, palm,
     cherub, palm, cherub, wings raised. The flanking towers carry palm and open flowers.
     It is CARVING, so it is gold on gold: a recessed band, and every figure drawn twice — once
     in shadow a hair down-right, once in light — which is all a relief is. */
  const carved = (x0, x1, yc, hh, seq) => {
    push(`<rect x="${R1(x0)}" y="${R1(yc - hh / 2)}" width="${R1(x1 - x0)}" height="${R1(hh)}" fill="${EDGE}" opacity="0.30"/>`);
    push(`<rect x="${R1(x0)}" y="${R1(yc - hh / 2)}" width="${R1(x1 - x0)}" height="${R1(hh * 0.1)}" fill="${EDGE}" opacity="0.55"/>`);
    push(`<rect x="${R1(x0)}" y="${R1(yc + hh * 0.42)}" width="${R1(x1 - x0)}" height="${R1(hh * 0.09)}" fill="${HOT}" opacity="0.75"/>`);
    const cell = (x1 - x0) / seq.length, u = hh * 0.86, q = (x, y) => `${R1(x)} ${R1(y)}`;
    const figure = (kind, mx, my) => {
      let fills = '', lines = '';
      if (kind === 'palm') {
        lines += `M${q(mx, my + 0.44 * u)}L${q(mx, my - 0.06 * u)}`;
        for (const d of [-158, -124, -90, -56, -22]) { const a = d * Math.PI / 180;
          lines += `M${q(mx, my - 0.06 * u)}Q${q(mx + Math.cos(a) * 0.24 * u, my - 0.06 * u + Math.sin(a) * 0.24 * u - 0.13 * u)} ${q(mx + Math.cos(a) * 0.43 * u, my - 0.06 * u + Math.sin(a) * 0.36 * u)}`; }
      } else if (kind === 'flower') {
        for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3 + Math.PI / 6;
          fills += `<circle cx="${R1(mx + Math.cos(a) * 0.23 * u)}" cy="${R1(my + Math.sin(a) * 0.23 * u)}" r="${R1(0.13 * u)}"/>`; }
        fills += `<circle cx="${R1(mx)}" cy="${R1(my)}" r="${R1(0.1 * u)}"/>`;
      } else {                                               // a cherub: a head, two wings stretched on high, a robe
        fills += `<circle cx="${R1(mx)}" cy="${R1(my - 0.14 * u)}" r="${R1(0.1 * u)}"/>`;
        for (const sd of [-1, 1])
          fills += `<path d="M${q(mx + sd * 0.06 * u, my)}Q${q(mx + sd * 0.52 * u, my - 0.08 * u)} ${q(mx + sd * 0.44 * u, my - 0.5 * u)}Q${q(mx + sd * 0.2 * u, my - 0.28 * u)} ${q(mx + sd * 0.07 * u, my + 0.14 * u)}Z"/>`;
        fills += `<path d="M${q(mx - 0.1 * u, my + 0.02 * u)}L${q(mx, my + 0.46 * u)}L${q(mx + 0.1 * u, my + 0.02 * u)}Z"/>`;
      }
      return [fills, lines];
    };
    seq.forEach((kind, i) => {
      const mx = x0 + cell * (i + 0.5), [fills, lines] = figure(kind, mx, yc);
      const sw = R1(Math.max(0.5, 0.075 * u)), off = R1(0.07 * u);
      push(`<g transform="translate(${off} ${off})" opacity="0.62">` + (fills ? `<g fill="${EDGE}">${fills}</g>` : '') + (lines ? `<path d="${lines}" stroke="${EDGE}" stroke-width="${sw}" stroke-linecap="round" fill="none"/>` : '') + '</g>');
      push('<g>' + (fills ? `<g fill="${HOT}">${fills}</g>` : '') + (lines ? `<path d="${lines}" stroke="${HOT}" stroke-width="${sw}" stroke-linecap="round" fill="none"/>` : '') + '</g>');
    });
  };
  if (gate) carved(cx - 34 * s, cx + 34 * s, baseY - 139 * s, 12 * s, ['cherub', 'palm', 'cherub', 'palm', 'cherub']);
  for (const sd of [-1, 1]) carved(cx + sd * 92 * s - 19 * s, cx + sd * 92 * s + 19 * s, baseY - 106 * s, 10 * s, ['flower', 'palm', 'flower']);

  // E · THE ARCHITECTURE BETWEEN AND ON THE TOWERS
  {
    const lit = (x, y, r) => jig(mix(G[0], HOT, 0.3 + r() * 0.4), r, 4);
    const sha = (x, y, r) => jig(mix(G[3], EDGE, 0.4 + r() * 0.4), r, 4);
    // E1 · CAST SHADOWS — each tower throws its shadow on the curtain wall on its OUTER side
    //      (the light is the gate at the centre), and the two dome towers on the centre tower's
    //      flanks. A shadow is what says one thing stands in front of another.
    for (const [dx0, w0] of [[-150, 32], [150, 32], [-92, 46], [92, 46]]) {
      const outer = dx0 < 0 ? cx + (dx0 - w0 / 2) * s : cx + (dx0 + w0 / 2) * s;
      const sw = 11 * s, sx0 = dx0 < 0 ? outer - sw : outer;
      strokes(out, counter, {
        rng, n: Math.round(sw * 54 * s / 9),
        sample: rej(sx0, baseY - 54 * s, sx0 + sw, baseY - 6 * s),
        dir: () => Math.PI / 2,
        col: (x, y, r) => { const t = dx0 < 0 ? (outer - x) / sw : (x - outer) / sw; return jig(mix(EDGE, G[3], t * 0.8 + r() * 0.2), r, 3); },
        len: 8 * s, lw: 2.2 * s, steps: 2, lenJ: 0.4, impasto: 0, relief: 0, op: 0.42,
      });
    }
    // E2 · GALLERIES — covered bridges of three arches between each dome tower and the centre
    //      tower, halfway up: the house is rooms joined to rooms ("many mansions", John 14:2)
    for (const side of [-1, 1]) {
      const gx0 = side < 0 ? cx - 69 * s : cx + 39 * s, gx1 = side < 0 ? cx - 39 * s : cx + 69 * s;
      const gy1 = baseY - 84 * s, gy0 = gy1 - 20 * s;
      push(`<rect x="${R1(gx0)}" y="${R1(gy0)}" width="${R1(gx1 - gx0)}" height="${R1(gy1 - gy0)}" fill="${G[2]}"/>`);
      ashlar(gx0, gy0, gx1, gy1, side < 0);
      cornice(gx0, gx1, gy0, 1.6 * s);
      battlements(gx0, gx1, gy0);
      for (let a = 0; a < 3; a++) {
        const ax = gx0 + (a + 0.5) * ((gx1 - gx0) / 3), aw = 6 * s, ah = 11 * s, ay = gy1 - 2 * s;
        push(`<path d="M${R1(ax - aw / 2)} ${R1(ay)}L${R1(ax - aw / 2)} ${R1(ay - ah * 0.55)}Q${R1(ax)} ${R1(ay - ah * 1.1)} ${R1(ax + aw / 2)} ${R1(ay - ah * 0.55)}L${R1(ax + aw / 2)} ${R1(ay)}Z" fill="${EDGE}" opacity="0.75"/>`);
        push(`<path d="M${R1(ax - aw * 0.3)} ${R1(ay)}L${R1(ax - aw * 0.3)} ${R1(ay - ah * 0.5)}Q${R1(ax)} ${R1(ay - ah * 0.95)} ${R1(ax + aw * 0.3)} ${R1(ay - ah * 0.5)}L${R1(ax + aw * 0.3)} ${R1(ay)}Z" fill="#fff6d8" opacity="0.8"/>`);
      }
      // the shadow the gallery throws on the wall below it
      push(`<rect x="${R1(gx0)}" y="${R1(gy1)}" width="${R1(gx1 - gx0)}" height="${R1(2.2 * s)}" fill="${EDGE}" opacity="0.45"/>`);
    }
    // E3 · TURRETS — a bartizan at the outer top corner of each flank tower, with its own
    //      conical roof: the corner that TURNS is what makes a slab a tower
    for (const [dx0, w0, h0] of [[-150, 32, 84], [150, 32, 84], [-92, 46, 122], [92, 46, 122]]) {
      const outer = dx0 < 0 ? cx + (dx0 - w0 / 2) * s : cx + (dx0 + w0 / 2) * s;
      const tw = 9 * s, th = 24 * s, tx0 = outer - tw / 2, ty1 = baseY - h0 * s + 10 * s, ty0 = ty1 - th;
      push(`<rect x="${R1(tx0)}" y="${R1(ty0)}" width="${R1(tw)}" height="${R1(th)}" fill="${G[2]}"/>`);
      ashlar(tx0, ty0, tx0 + tw, ty1, dx0 > 0);
      paintPath(out, counter, rng, [[tx0 + tw * 0.15, ty1], [tx0 + tw * 0.15, ty0]], dx0 > 0 ? lit : sha, { lw: 1.2 * s, len: 4 * s, density: 0.6, jitter: 0.3 });
      push(`<path d="M${R1(tx0 - 1.5 * s)} ${R1(ty0 + 1)}L${R1(tx0 + tw / 2)} ${R1(ty0 - tw * 1.4)}L${R1(tx0 + tw + 1.5 * s)} ${R1(ty0 + 1)}Z" fill="${G[2]}"/>`);
      roofTiles(tx0 - 1.5 * s, tx0 + tw + 1.5 * s, ty0 + 1, tx0 + tw / 2, ty0 - tw * 1.4, false);
      push(`<circle cx="${R1(tx0 + tw / 2)}" cy="${R1(ty0 - tw * 1.4)}" r="${(1.6 * s).toFixed(1)}" fill="#fffef2"/>`); counter.n++;
      // a slit window in it
      push(`<rect x="${R1(tx0 + tw * 0.4)}" y="${R1(ty0 + th * 0.35)}" width="${R1(tw * 0.2)}" height="${R1(th * 0.3)}" fill="#fff6d8" opacity="0.85"/>`);
    }
    // E4 · BUTTRESSES — sloped stone at the foot of each tower's outer side, so the tower is
    //      planted in the ground and not set on it
    for (const [dx0, w0] of [[-150, 32], [150, 32], [-92, 46], [92, 46]]) {
      const outer = dx0 < 0 ? cx + (dx0 - w0 / 2) * s : cx + (dx0 + w0 / 2) * s, dir = dx0 < 0 ? -1 : 1;
      const bw = 9 * s, bh = 30 * s;
      push(`<path d="M${R1(outer)} ${R1(baseY - bh)}L${R1(outer + dir * bw)} ${R1(baseY - 4 * s)}L${R1(outer + dir * bw)} ${R1(baseY)}L${R1(outer)} ${R1(baseY)}Z" fill="${G[2]}"/>`); counter.n++;
      strokes(out, counter, {
        rng, n: Math.round(bw * bh / (14 * s)),
        sample: r => { const t = r(); const yy = baseY - t * bh; const xx = outer + dir * r() * bw * (1 - t) ; return [xx, yy]; },
        dir: () => Math.atan2(bh, dir * bw) * (dir < 0 ? -1 : 1) + Math.PI / 2,
        col: (x, y, r) => jig(mix(dir < 0 ? G[1] : G[3], r() < 0.5 ? HOT : EDGE, r() * 0.25), r, 4),
        len: 4 * s, lw: 2.6 * s, steps: 1, lenJ: 0.3, impasto: 0.5, relief: 0.5,
      });
    }
    // E5 · QUOINS — larger, paler stones up the corners of every tower
    for (const [dx0, w0, h0] of T) {
      for (const edge of [-1, 1]) {
        const ex = cx + dx0 * s + edge * (w0 / 2) * s;
        for (let k = 0; k < Math.floor(h0 * s / (12.4 * s)); k++) {
          const qy = baseY - 6 * s - k * 12.4 * s, ql = (k % 2 ? 7 : 4.5) * s;
          push(`<rect x="${R1(edge < 0 ? ex : ex - ql)}" y="${R1(qy - 5 * s)}" width="${R1(ql)}" height="${R1(5 * s)}" fill="${mix(G[0], HOT, 0.4)}" opacity="${(dx0 * edge < 0 ? 0.55 : 0.22).toFixed(2)}"/>`); counter.n++;
        }
      }
    }
    // E6 · THE ROSE WINDOW — high on the centre tower, over the gate: a wheel of light with
    //      its tracery, the one round opening in a house of arches
    {
      const rx = cx, ry = baseY - 158 * s, rr = 11 * s;
      push(`<circle cx="${R1(rx)}" cy="${R1(ry)}" r="${R1(rr * 1.35)}" fill="${HOT}" opacity="0.18"/>`);
      push(`<circle cx="${R1(rx)}" cy="${R1(ry)}" r="${R1(rr * 1.12)}" fill="${EDGE}" opacity="0.7"/>`);
      push(`<circle cx="${R1(rx)}" cy="${R1(ry)}" r="${R1(rr)}" fill="#fff8e0" opacity="0.95"/>`);
      for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4; push(`<path d="M${R1(rx)} ${R1(ry)}L${R1(rx + Math.cos(a) * rr)} ${R1(ry + Math.sin(a) * rr)}" stroke="${G[2]}" stroke-width="${(0.9 * s).toFixed(2)}" opacity="0.8"/>`); }
      push(`<circle cx="${R1(rx)}" cy="${R1(ry)}" r="${R1(rr * 0.42)}" fill="none" stroke="${G[2]}" stroke-width="${(0.8 * s).toFixed(2)}" opacity="0.8"/>`);
      push(`<circle cx="${R1(rx)}" cy="${R1(ry)}" r="${R1(rr * 0.2)}" fill="#ffffff"/>`);
      counter.n += 12;
    }
  }
  // THE OPEN GATE of light in the central tower (Rev 21:25 — "not be shut at all")
  // ⚠ A TERRACE, so the city STANDS on something. Towers rising straight out of grass look
  // dropped there; three shallow steps and a plinth give them a footing, and give the way
  // home somewhere to arrive.
  {
    const tw = 210 * s;
    for (let st = 0; st < 3; st++) {
      const w2 = tw * (1 + st * 0.13), y = baseY - 6 * s + st * 3.4 * s;
      push(`<rect x="${R1(cx - w2 / 2)}" y="${R1(y)}" width="${R1(w2)}" height="${R1(3.4 * s)}" fill="${G[1]}" opacity="0.92"/>`);
      push(`<rect x="${R1(cx - w2 / 2)}" y="${R1(y)}" width="${R1(w2)}" height="${R1(1.1 * s)}" fill="${HOT}" opacity="0.7"/>`);
      push(`<rect x="${R1(cx - w2 / 2)}" y="${R1(y + 3.4 * s)}" width="${R1(w2)}" height="${R1(1.2 * s)}" fill="${EDGE}" opacity="0.4"/>`);
    }
  }
  if (gate) {
    const gw = 44 * s, gy0 = baseY, gy1 = baseY - 128 * s, arch = gy1 + (gy0 - gy1) * 0.2;
    strokes(out, counter, {
      rng, n: Math.round(160 * s + 50),
      sample: rej(cx - gw / 2, gy1, cx + gw / 2, gy0, (x, y) => y > arch || (Math.abs(x - cx) < (gw / 2) * Math.sqrt(Math.max(0, (y - gy1) / (arch - gy1))))),
      dir: () => Math.PI / 2 + (rng() - 0.5) * 0.12,
      // (Sep 14: the light in the gate was a heap of gold NUGGETS — impasto + relief on big marks.
      //  Light has no relief. Small, soft, translucent marks that stack into a blaze.)
      col: (x, y, r) => jig(Math.abs(x - cx) < gw * 0.3 ? '#fffef7' : ramp(['#fff6da', HOT, '#ffdf92'], Math.abs(x - cx) / (gw / 2)), r, 3),
      len: 6 * s, lw: 1.6 * s, steps: 2, lenJ: 0.5, impasto: 0, relief: 0, op: 0.55,
    });
    // a GLIMPSE of the street of gold through the gate (Rev 21:21 "the street of the city was pure
    // gold, as it were transparent glass") — a few pale lines converging to a far point of white,
    // so the gate is an opening onto somewhere and not a bright wall
    {
      const vpx = cx, vpy = gy0 - 96 * s;
      for (let k = -3; k <= 3; k++) {
        if (k === 0) continue;
        const sx = cx + k * gw * 0.14, ex = vpx + k * gw * 0.02;
        paintPath(out, counter, rng, [[sx, gy0 - 2 * s], [ex, vpy]], (x, y, r) => jig(mix('#fff3c8', '#ffd98a', r()), r, 3), { lw: 0.9 * s, len: 4 * s, density: 0.5, jitter: 0.3 });
      }
      strokes(out, counter, {   // the far white the street runs to
        rng, n: 40, sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 0.6) * 7 * s; return [vpx + Math.cos(a) * d, vpy + Math.sin(a) * d * 0.7]; },
        dir: () => 0.2, col: (x, y, r) => jig('#ffffff', r, 2), len: 3 * s, lw: 1.6 * s, steps: 1, impasto: 0, relief: 0, op: 0.6,
      });
    }
    paintPath(out, counter, rng, [[cx - gw / 2 - 2 * s, gy0], [cx - gw / 2 - 2 * s, gy1 + 6 * s]], (x, y, r) => jig(EDGE, r, 5), { lw: 3 * s, len: 5 * s, density: 0.8, jitter: 0.3 });
    paintPath(out, counter, rng, [[cx + gw / 2 + 2 * s, gy0], [cx + gw / 2 + 2 * s, gy1 + 6 * s]], (x, y, r) => jig(EDGE, r, 5), { lw: 3 * s, len: 5 * s, density: 0.8, jitter: 0.3 });
    // ⭐ THE GATE IS ONE PEARL (Rev 21:21, Sep 12): a ring of pearl voussoirs round the arch and
    // pearl jambs down its sides — nacre, white going to lilac and pale green, each stone lit
    const PEARL = ['#fbf7ff', '#e9e2f6', '#d8e6e0', '#f3e3e9'];
    // (first cut was nine round beads — a necklace. A pearl gate is one smooth nacre ARCH:
    //  a ribbon along the arc with the faintest joints, and jamb ribbons down the sides.)
    const ar = gw / 2 + 4 * s, acy = arch;
    const arcPts = [];
    for (let k = 0; k <= 16; k++) { const a = Math.PI + k * (Math.PI / 16); arcPts.push([cx + Math.cos(a) * ar, acy + Math.sin(a) * ar * 0.75]); }
    paintPath(out, counter, rng, arcPts, (x, y, r) => jig(mix(PEARL[((x + y) * 0.07 | 0) % 4], '#ffffff', 0.35 + r() * 0.35), r, 3), { lw: 3.4 * s, len: 3 * s, density: 1.1, jitter: 0.15 });
    paintPath(out, counter, rng, arcPts.map(q => [q[0], q[1] - 0.9 * s]), (x, y, r) => jig('#ffffff', r, 2), { lw: 0.9 * s, len: 3 * s, density: 0.8, jitter: 0.2 });   // the nacre's highlight along the top
    for (const side of [-1, 1]) {
      const jx = cx + side * (gw / 2 + 4 * s);
      paintPath(out, counter, rng, [[jx, gy0], [jx, acy + 1 * s]], (x, y, r) => jig(mix(PEARL[side > 0 ? 1 : 2], '#ffffff', 0.3 + r() * 0.35), r, 3), { lw: 3.2 * s, len: 3 * s, density: 1.1, jitter: 0.15 });
      paintPath(out, counter, rng, [[jx - side * 0.9 * s, gy0], [jx - side * 0.9 * s, acy + 1 * s]], (x, y, r) => jig('#ffffff', r, 2), { lw: 0.8 * s, len: 3 * s, density: 0.8, jitter: 0.2 });
      /* ⭐ "AND UPON THE TOP OF THE PILLARS WAS LILY WORK: so was the work of the pillars finished"
         (1 Kings 7:22; Sep 21 — Fred: "the secrets of beautiful things are all in scripture").
         Solomon's pillars were not finished until they flowered. Where each pearl jamb meets the
         springing of the arch, a lily opens: three petals curling out and up from a small calyx —
         a LIVING form, so it curves (Munch), on a made thing that is straight. */
      const lx = jx, ly = acy + 1 * s, L = 8.5 * s;
      for (const [pa, pl] of [[-Math.PI / 2, 1], [-Math.PI / 2 - 0.85, 0.82], [-Math.PI / 2 + 0.85, 0.82]]) {
        const tip = [lx + Math.cos(pa) * L * pl, ly + Math.sin(pa) * L * pl];
        const mid = [lx + Math.cos(pa) * L * pl * 0.55 + Math.cos(pa + Math.PI / 2) * L * 0.16 * Math.sign(pa + Math.PI / 2 || 1),
                     ly + Math.sin(pa) * L * pl * 0.55];
        const curl = [tip[0] + Math.sign(Math.cos(pa) || side) * L * 0.2, tip[1] + L * 0.08];
        out.push(ribbon([[lx, ly], mid, tip, curl], 2.6 * s, mix('#fffdf6', PEARL[2], 0.3), [0.5, 1, 0.8, 0.25])); counter.n++;
        out.push(ribbon([[lx, ly], mid, tip], 0.9 * s, '#ffffff', [0.4, 1, 0.5])); counter.n++;
      }
      out.push(ribbon([[lx - 2.4 * s, ly + 1.2 * s], [lx + 2.4 * s, ly + 1.2 * s]], 2.4 * s, G[1])); counter.n++;   // the calyx: a gold collar
    }
  }
  // jewel foundations along the wall (Rev 21:19-20)
  // ⚠ BANNERS. Everything else here is gold on gold; two or three hanging colours are what
  // turn a monument into a city somebody lives in — and they are the only non-gold notes
  // allowed, so they read as deliberate rather than as noise.
  {
    /* ⭐ "AND THEY SHALL TAKE GOLD, AND BLUE, AND PURPLE, AND SCARLET, AND FINE LINEN" (Ex 28:5) —
       the materials of the holy garments, made "for glory and for beauty" (Ex 28:2), and of the
       tabernacle's own veil and curtains (Ex 26:1, 31). The banners were three arbitrary notes —
       a pink, a blue, a green — and each one hung or did not on the throw of a die. The house
       wears ITS colours now, all five, always, in the verse's order from left to right: blue,
       purple, scarlet, and fine linen — each on a gold rod with a gold fringe. (Sep 21) */
    const BAN = ['#2c4fb4', '#6d3aa8', '#c4262e', '#f6f1e2'];
    // ⚠ NEVER ON THE CENTRE TOWER. The first version hung one across the gate — the one place
    // on this page the reader is walking toward. And they were half the height of a tower;
    // a banner is a note of colour, not a curtain.
    [[-150, 32, 84], [-92, 46, 122], [92, 46, 122], [150, 32, 84]].forEach(([bdx, bw0, bh0], bi) => {
      const bx = cx + bdx * s, bw = bw0 * s * 0.19, bh = bh0 * s * 0.2;
      const by = baseY - bh0 * s * 0.66;
      const col = BAN[bi], linen = bi === 3;
      push(`<path d="M${R1(bx - bw / 2)} ${R1(by)}L${R1(bx + bw / 2)} ${R1(by)}L${R1(bx + bw / 2)} ${R1(by + bh)}L${R1(bx)} ${R1(by + bh * 0.82)}L${R1(bx - bw / 2)} ${R1(by + bh)}Z" fill="${col}" opacity="${linen ? 0.92 : 0.84}"/>`);
      push(`<path d="M${R1(bx - bw / 2)} ${R1(by)}L${R1(bx - bw * 0.1)} ${R1(by)}L${R1(bx - bw * 0.1)} ${R1(by + bh * 0.9)}L${R1(bx - bw / 2)} ${R1(by + bh)}Z" fill="#ffffff" opacity="${linen ? 0.3 : 0.18}"/>`);
      push(`<path d="M${R1(bx + bw * 0.12)} ${R1(by)}L${R1(bx + bw / 2)} ${R1(by)}L${R1(bx + bw / 2)} ${R1(by + bh)}L${R1(bx + bw * 0.12)} ${R1(by + bh * 0.88)}Z" fill="#1d1830" opacity="${linen ? 0.1 : 0.2}"/>`);   // the fold's shadow side
      push(`<path d="M${R1(bx - bw / 2)} ${R1(by + bh * 0.97)}L${R1(bx)} ${R1(by + bh * 0.8)}L${R1(bx + bw / 2)} ${R1(by + bh * 0.97)}" stroke="${G[0]}" stroke-width="${R1(Math.max(0.6, 1.1 * s))}" fill="none"/>`);   // the gold fringe
      push(`<rect x="${R1(bx - bw * 0.62)}" y="${R1(by - 1.2 * s)}" width="${R1(bw * 1.24)}" height="${R1(1.6 * s)}" fill="${G[0]}"/>`);
    });
  }
  /* ⭐⭐ "AND HE GARNISHED THE HOUSE WITH PRECIOUS STONES FOR BEAUTY" (2 Chr 3:6) — and of the last
     house: "the foundations of the wall of the city were garnished with all manner of precious
     stones. The first foundation was jasper; the second, sapphire; the third, a chalcedony; the
     fourth, an emerald; the fifth, sardonyx; the sixth, sardius; the seventh, chrysolyte; the
     eighth, beryl; the ninth, a topaz; the tenth, a chrysoprasus; the eleventh, a jacinth; the
     twelfth, an amethyst" (Rev 21:19-20).
     Sep 21, Fred: "consult scripture, i believe the secrets of beautiful things are all in
     scripture." It answers in one verb — GARNISHED — and tells us what for: for beauty.
     ⚠ THE BOOK ALREADY HAD THE TWELVE (section C, JEWEL12) AND NOBODY COULD SEE THEM. They were
     laid "deep in their own shade", 7 units high, and then the terrace steps were painted straight
     over the top; what showed instead was a scatter of random coloured CIRCLES in five arbitrary
     colours — perfect discs, which this engine itself calls stickers (see daub()).
     So the course is laid again HERE, after the terrace, where it is the last thing drawn at the
     wall's foot: twelve stones in the verse's own order, left to right, each a run of CUT blocks —
     one loaded stroke for the body (so the engine's hairline bevel runs round every stone), a
     lighter facet along its upper edge, and a point of white where it catches. Lit from WITHIN,
     not shaded: "her light was like unto a stone most precious… clear as crystal" (Rev 21:11).
     The way in stays open — the course breaks at the gate. */
  {
    const J12 = ['#3fb89c', '#3a6fd0', '#9cc4dc', '#2fae5c', '#d07a4a', '#d0383e',
                 '#e6b840', '#3cc0b8', '#f0d65a', '#94d04a', '#e0508c', '#9a62e6'];
    const fx0 = cwx0 - 4 * s, fx1 = cwx1 + 4 * s, fy0 = baseY - 9.5 * s, fy1 = baseY - 1.5 * s;
    const segW = (fx1 - fx0) / 12, bw = Math.max(5 * s, segW / 3), bh = fy1 - fy0;
    const gap = gate ? 27 * s : 0;
    /* ⚠ CUT, NOT ROLLED (second cut, same day). The first stones were one loaded stroke each on a
       near-black setting: round caps and a white dot, so the course read as a string of fairy
       lights under the wall. A precious stone is CUT — a made thing, so it is straight (Munch):
       a rectangle with a raised TABLE and four bevels, the upper-left pair catching the light and
       the lower-right pair falling away, which is the whole of what makes a flat shape read as a
       faceted one. And they are set in GOLD, not in shadow: this is the Father's house. */
    push(`<rect x="${R1(fx0)}" y="${R1(fy0)}" width="${R1(fx1 - fx0)}" height="${R1(bh)}" fill="${G[3]}"/>`);   // the gold setting
    if (gap) push(`<rect x="${R1(cx - gap)}" y="${R1(fy0 - 0.5 * s)}" width="${R1(gap * 2)}" height="${R1(bh + 1 * s)}" fill="${G[1]}"/>`);
    const pt = (x, y) => `${R1(x)} ${R1(y)}`;
    for (let i = 0; i < 12; i++) {
      for (let b = 0; b < 3; b++) {
        const x0 = fx0 + i * segW + b * (segW / 3) + 0.7 * s, x1 = x0 + segW / 3 - 1.4 * s;
        const y0 = fy0 + 0.9 * s, y1 = fy1 - 0.9 * s, mx = (x0 + x1) / 2;
        if (gap && Math.abs(mx - cx) < gap + bw * 0.4) continue;
        const stone = mix(J12[i], rng() < 0.5 ? '#ffffff' : '#1d1830', rng() * 0.14);   // no two blocks of one stone alike
        const bv = Math.min((x1 - x0), (y1 - y0)) * 0.3;                                  // bevel depth
        const ix0 = x0 + bv, ix1 = x1 - bv, iy0 = y0 + bv, iy1 = y1 - bv;
        push(`<path d="M${pt(x0, y0)}L${pt(x1, y0)}L${pt(ix1, iy0)}L${pt(ix0, iy0)}Z" fill="${mix(stone, '#ffffff', 0.55)}"/>`);   // top bevel — lit
        push(`<path d="M${pt(x0, y0)}L${pt(ix0, iy0)}L${pt(ix0, iy1)}L${pt(x0, y1)}Z" fill="${mix(stone, '#ffffff', 0.3)}"/>`);    // left bevel
        push(`<path d="M${pt(x1, y0)}L${pt(x1, y1)}L${pt(ix1, iy1)}L${pt(ix1, iy0)}Z" fill="${mix(stone, '#1d1830', 0.3)}"/>`);    // right bevel
        push(`<path d="M${pt(x0, y1)}L${pt(ix0, iy1)}L${pt(ix1, iy1)}L${pt(x1, y1)}Z" fill="${mix(stone, '#1d1830', 0.48)}"/>`);   // under bevel — away from the light
        push(`<rect x="${R1(ix0)}" y="${R1(iy0)}" width="${R1(ix1 - ix0)}" height="${R1(iy1 - iy0)}" fill="${stone}"/>`);            // the table
        push(`<path d="M${pt(ix0 + (ix1 - ix0) * 0.12, iy1 - (iy1 - iy0) * 0.2)}L${pt(ix0 + (ix1 - ix0) * 0.42, iy0 + (iy1 - iy0) * 0.18)}" stroke="#ffffff" stroke-width="${R1(Math.max(0.5, 0.55 * s))}" stroke-linecap="round" opacity="0.85" fill="none"/>`);   // one glint across the table
      }
    }
    push(`<rect x="${R1(fx0)}" y="${R1(fy0 - 1.1 * s)}" width="${R1(fx1 - fx0)}" height="${R1(1.3 * s)}" fill="${G[0]}"/>`);   // a gold fillet over the course
    if (gap) push(`<rect x="${R1(cx - gap)}" y="${R1(fy0 - 1.2 * s)}" width="${R1(gap * 2)}" height="${R1(1.5 * s)}" fill="${G[1]}"/>`);
  }
  // ⚠ AND THE CITY ITSELF SHINES — it is not a lit building, it is the lamp. A broad soft
  // glory around the whole silhouette, brightest at its crown, so the light appears to come
  // OUT of the City rather than to fall on it (Rev 21:23). Painted, not a filter: marks
  // that thin as they go, so it never reads as a sticker's soft edge.
  strokes(out, counter, {
    rng, n: Math.round(260 * s + 60),
    sample: r => {
      const a = r() * Math.PI * 2, d = Math.pow(r(), 0.55) * 250 * s;
      return [cx + Math.cos(a) * d, baseY - 70 * s + Math.sin(a) * d * 0.62];
    },
    dir: (x, y) => Math.atan2(y - (baseY - 70 * s), x - cx) + Math.PI / 2,
    col: (x, y, r) => {
      const d = Math.hypot((x - cx) / (250 * s), (y - (baseY - 70 * s)) / (155 * s));
      return jig(ramp(['#fff8dc', '#ffe8ac', '#e0b96a', '#a2823e'], Math.min(1, d)), r, 6);
    },
    len: 10 * s, lw: 3 * s, steps: 2, lenJ: 0.6, impasto: 0.3, op: 0.30,
  });
  goldSparks(out, counter, rng, cx, baseY - 100 * s, 24 * s, 180 * s, Math.round(26 * s + 6), { squash: 0.85, big: Math.max(0.5, s) });
}

// paint short strokes along a polyline (for hidden shapes built from brushwork)
export function paintPath(out, counter, rng, pts, colFn, { lw = 1.6, len = 5, density = 0.55, jitter = 1.2 } = {}) {
  for (let i = 0; i < pts.length - 1; i++) {
    const [ax, ay] = pts[i], [bx, by] = pts[i + 1];
    const seg = Math.hypot(bx - ax, by - ay);
    const ang = Math.atan2(by - ay, bx - ax);
    const n = Math.max(1, Math.round(seg * density));
    for (let k = 0; k < n; k++) {
      const t = (k + rng() * 0.8) / n;
      const x = ax + (bx - ax) * t + (rng() - 0.5) * jitter;
      const y = ay + (by - ay) * t + (rng() - 0.5) * jitter;
      const a = ang + (rng() - 0.5) * 0.22;
      const l = len * (0.7 + rng() * 0.6);
      out.push(ribbon([[x, y], [x + Math.cos(a) * l * 0.5, y + Math.sin(a) * l * 0.5], [x + Math.cos(a) * l, y + Math.sin(a) * l]], lw * (0.75 + rng() * 0.5), colFn(x, y, rng)));
      counter.n++;
    }
  }
}

// ---------- HIDDEN INSCRIPTIONS (easter eggs) ----------
// A verse-reference or symbol CUT into a scene as a fourth-look secret — clean
// INCISED vector strokes (a dark body with a thin light edge; pass a light body +
// dark edge on a dark ground). Hidden enough to miss, clear enough to FIND and
// wonder at (calibrated to the ΙΧΘΥΣ fish). Scripture is the source of every one.
// Glyph polylines: normalised 0..1 (x right, y down); `w` = width / height.
const GLYPHS = {
  '0': { w: 0.62, p: [[[.5, .02], [.85, .2], [.95, .5], [.85, .8], [.5, .98], [.15, .8], [.05, .5], [.15, .2], [.5, .02]]] },
  '1': { w: 0.46, p: [[[.26, .24], [.56, .04], [.56, .96]], [[.3, .96], [.82, .96]]] },
  '2': { w: 0.62, p: [[[.1, .24], [.42, .02], [.78, .18], [.7, .46], [.12, .96], [.92, .96]]] },
  '3': { w: 0.62, p: [[[.12, .12], [.56, .02], [.84, .24], [.46, .47]], [[.46, .47], [.88, .66], [.6, .98], [.12, .9]]] },
  '4': { w: 0.64, p: [[[.66, .02], [.08, .66], [.94, .66]], [[.66, .3], [.66, .98]]] },
  '5': { w: 0.62, p: [[[.84, .04], [.22, .04], [.16, .46], [.56, .4], [.86, .62], [.74, .9], [.3, 1], [.08, .86]]] },
  '6': { w: 0.62, p: [[[.8, .06], [.36, .06], [.12, .5], [.1, .8], [.42, 1], [.8, .86], [.84, .6], [.5, .48], [.16, .56]]] },
  '7': { w: 0.6, p: [[[.08, .06], [.92, .06], [.42, .98]]] },
  '8': { w: 0.62, p: [[[.5, .02], [.82, .16], [.56, .46], [.2, .2], [.5, .02]], [[.56, .46], [.9, .7], [.5, .99], [.14, .74], [.46, .46]]] },
  '9': { w: 0.62, p: [[[.84, .5], [.5, .56], [.18, .42], [.28, .12], [.62, .04], [.84, .3], [.84, .62], [.6, 1]]] },
  ':': { w: 0.3, p: [[[.4, .34], [.52, .38]], [[.36, .7], [.48, .74]]] },
  'A': { w: 0.78, p: [[[.06, .98], [.5, .02], [.94, .98]], [[.24, .62], [.76, .62]]] },   // Α alpha
  'O': { w: 0.84, p: [[[.14, .98], [.3, .9], [.12, .58], [.2, .24], [.5, .05], [.8, .24], [.88, .58], [.7, .9], [.86, .98]]] }, // Ω omega
  'I': { w: 0.34, p: [[[.5, .05], [.5, .95]], [[.28, .05], [.72, .05]], [[.28, .95], [.72, .95]]] },   // Roman I (serifed)
  'V': { w: 0.66, p: [[[.06, .05], [.5, .95], [.94, .05]]] },   // Roman V
  'X': { w: 0.66, p: [[[.08, .05], [.92, .95]], [[.92, .05], [.08, .95]]] },   // Roman X
};
// `mirror:true` reflects the whole word horizontally (reads only in a mirror /
// reversed) — used for the "through a glass, darkly" window egg.
export function inscription(out, rng, text, { x, y, h, body = '#26190c', edge = '#fff7d6', op = 0.82, edgeOp = 0.7, gap = 0.16, jit = 0.02, mirror = false } = {}) {
  let pen = x;
  const J = () => (rng() - 0.5) * 2 * jit * h;
  const chars = mirror ? [...text].reverse() : [...text];
  for (const ch of chars) {
    const G = GLYPHS[ch];
    if (!G) { pen += 0.4 * h; continue; }
    for (const poly of G.p) {
      const base = poly.map(([nx, ny]) => [pen + (mirror ? 1 - nx : nx) * G.w * h + J(), y + ny * h + J()]);   // jitter once, reuse for both passes
      const mk = (dx, dy) => base.map(([px, py]) => `${(px + dx).toFixed(1)},${(py + dy).toFixed(1)}`).join(' ');
      out.push(`<polyline points="${mk(1.3, 1.6)}" fill="none" stroke="${body}" stroke-width="${(h * 0.17).toFixed(1)}" stroke-linecap="round" stroke-linejoin="round" opacity="${op}"/>`);
      out.push(`<polyline points="${mk(-1.0, -1.2)}" fill="none" stroke="${edge}" stroke-width="${(h * 0.07).toFixed(1)}" stroke-linecap="round" stroke-linejoin="round" opacity="${edgeOp}"/>`);
    }
    pen += (G.w + gap) * h;
  }
  return pen - x;   // total width drawn
}

// ---------- INSCRIPTION IN THE ORIGINAL TONGUE ----------
// A verse-reference written in the numerals of the language it was first penned:
// GREEK (Milesian alphabetic, marked with a keraia ʹ) for the New Testament, HEBREW
// alphabetic numerals for the Old. Rendered as real glyphs via SVG <text>, embossed
// (a light fringe under a dark body, or pass body/edge swapped on a dark ground) so
// it reads as incised into the paint. The seeker must know the old letter-numbers.
const GK = { 1:'Α',2:'Β',3:'Γ',4:'Δ',5:'Ε',6:'Ϛ',7:'Ζ',8:'Η',9:'Θ',10:'Ι',20:'Κ',30:'Λ',40:'Μ',50:'Ν',60:'Ξ',70:'Ο',80:'Π',90:'Ϟ' };
const HB = { 1:'א',2:'ב',3:'ג',4:'ד',5:'ה',6:'ו',7:'ז',8:'ח',9:'ט',10:'י',20:'כ',30:'ל',40:'מ',50:'נ',60:'ס',70:'ע',80:'פ',90:'צ' };
function alphaNum(n, tbl) {            // n < 100 → tens-letter + units-letter
  let s = '', r = n;
  const t = Math.floor(r / 10) * 10; if (t) s += tbl[t]; const u = r % 10; if (u) s += tbl[u];
  return s;
}
// Greek chapter:verse, e.g. greekRef(10,9) = "Ιʹ·Θʹ"
export function greekRef(ch, v) { return alphaNum(ch, GK) + 'ʹ·' + alphaNum(v, GK) + 'ʹ'; }
// Hebrew chapter:verse (15→טו, 16→טז to avoid the divine Name); RTL handled by the renderer.
function hebN(n) { return n === 15 ? 'טו' : n === 16 ? 'טז' : alphaNum(n, HB); }
export function hebrewRef(ch, v) { return hebN(ch) + '·' + hebN(v); }

// global size multiplier for the hidden inscriptions — bumped so the eggs are
// findable on the SMALLER mobile display, not just on desktop (set in build.mjs).
let INSCR_SCALE = 1;
export function setInscriptionScale(s) { INSCR_SCALE = s; }
let INS_ID = 0;
export function inscriptionText(out, text, { x, y, h, body = '#241608', edge = '#fff0c4', op = 0.85, edgeOp = 0.6, anchor = 'middle', mirror = false, font = "Georgia, 'Palatino Linotype', 'Times New Roman', serif" } = {}) {
  h = h * INSCR_SCALE;
  /* ⭐ PAINTED, NOT PRINTED (Sep 14). Fred, on prayer's Zʹ·Zʹ: "make those as part of the art, this
     looks like just a printed letter on top of the art… make it look like its painted." A glyph
     from a font is typography whatever its opacity. So the letterform is only a MASK now: the
     stroke engine lays brush marks inside it — jittered colour, impasto, the hairline bevel —
     and the light edge is the same brushwork offset up and left. Each letter is built of marks,
     with the ragged edges marks leave, so it is a thing painted into the picture. Opacity is
     kept modest (a scripture cut into a wall, seen on the second look). */
  op = Math.max(0.12, op * 0.62); edgeOp = Math.max(0.08, edgeOp * 0.55);
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const t = esc(text);
  const C = `font-family="${font}" font-size="${h}" font-weight="700" text-anchor="${anchor}"`;
  const open = mirror ? `<g transform="matrix(-1 0 0 1 ${(2 * x).toFixed(1)} 0)">` : '';   // reflect about x (for "through a glass, darkly")
  const close = mirror ? '</g>' : '';
  const n = String(text).length, W2 = n * h * 0.72;                               // a generous box round the run of letters
  const bx0 = anchor === 'middle' ? x - W2 / 2 : anchor === 'end' ? x - W2 : x, bx1 = bx0 + W2;
  const by0 = y - h * 1.05, by1 = y + h * 0.35;
  let seed = 7;
  for (let i = 0; i < String(text).length; i++) seed = (seed * 31 + String(text).charCodeAt(i)) >>> 0;
  const irng = mulberry32((seed ^ (Math.round(x * 7 + y * 13) >>> 0)) >>> 0);
  const cnt = { n: 0 };
  // (first cut kept the glyph's crisp outline and an offset fringe — an embossed font. What
  //  says PAINTED is the EDGE: so the mask is warped by a turbulence displacement, the way a
  //  brush wobbles along a letter, the marks inside leave gaps where the wall shows, and there
  //  is no offset fringe at all — one pigment, uneven, cut into the wall.)
  const paintIn = (dx, dy, col, opac, cover) => {
    const id = 'ins' + (INS_ID++);
    const fid = id + 'f', wob = (h * 0.055).toFixed(2), freq = (0.9 / h).toFixed(4);
    out.push(`<filter id="${fid}" x="-20%" y="-30%" width="140%" height="160%"><feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="2" seed="${(seed % 97)}" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="${wob}" xChannelSelector="R" yChannelSelector="G"/></filter>`);
    out.push(`<clipPath id="${id}">${open}<text x="${(x + dx).toFixed(1)}" y="${(y + dy).toFixed(1)}" ${C}>${t}</text>${close}</clipPath>`);
    out.push(`<g filter="url(#${fid})"><g clip-path="url(#${id})" opacity="${opac.toFixed(2)}">`);
    strokes(out, cnt, {
      rng: irng, n: Math.max(60, Math.round(cover * W2 * (by1 - by0) / (h * h * 0.028))),   // dense: the letter strokes must FILL
      sample: rej(bx0 + dx - h * 0.3, by0 + dy, bx1 + dx + h * 0.3, by1 + dy),
      dir: () => (irng() < 0.6 ? 0.15 : -1.35) + (irng() - 0.5) * 0.9,                 // mostly across, some down — a hand cutting letters
      col: (px, py, r) => jig(mix(col, r() < 0.5 ? '#ffffff' : '#000000', r() * 0.2), r, 6),
      len: (px, py) => h * (0.3 + irng() * 0.4), lw: (px, py) => h * (0.12 + irng() * 0.14), steps: 2, lenJ: 0.5, wJ: 0.5, impasto: 0.45, relief: 0.45, op: 1,
    });
    out.push('</g></g>');
  };
  paintIn(0, 0, body, op, 0.85);                                        // the letters, cut into the wall
  paintIn(0.6 * (h / 14), 0.7 * (h / 14), edge, edgeOp * 0.5, 0.18);   // a sparse breath of the light colour, barely offset — a brush's second pass, not an emboss
}

// ---------- FRUITFUL LAND (Eden is never barren) ----------
// The land always teems; it is only DARK until the Light comes, then it BLAZES.
// Crazy, FREE colour (Munch: colour need not be real). lightFn(x,y)->0..1 (opt)
// warms foliage/fruit toward gold where the scene's light falls.
export const FRUIT_COLS = ['#f6c63e', '#ee5c84', '#ffa53e', '#b77ce0', '#5ec0e0', '#f29ad0'];
export const BLOSSOM_COLS = ['#f29ad0', '#f6e07a', '#fafafa', '#b79ad8', '#8fd0e0'];
// bright jewel leaf palettes — visible day or night, against any ground
// THE GREENS. LEAF_PALETTES is mostly violet/pink/blue — free colour is allowed
// (Munch), but a child has to be able to say "tree" before the art gets to be
// clever (Matt 18:3), so an avenue uses two or three greens and at most ONE accent.
export const LEAF_GREENS = [
  ['#2a5f30', '#4b8f3c', '#79b74d', '#c8d84e'],
  ['#265a3a', '#3f8a4a', '#6fae52', '#8fc9a0'],
  ['#2f6b34', '#57993f', '#86c055', '#e0b84a'],
];

// A ONE-POINT AVENUE of trees along a receding path. The trees take their scale,
// their spacing AND their distance from the road off the SAME parameter t the road
// uses, so they recede WITH it instead of at a rate of their own — that is the whole
// trick, and it is why this needs the plate's own ptFn/wFn rather than a y-gradient.
//   · spacing bunches toward the horizon (t^bunch). Even steps in t read as a flat
//     row, not a receding one.
//   · the offset is HORIZONTAL and scales with t, which is what makes both tree rows
//     converge on the road's OWN vanishing point (offset -> 0 as t -> 0). Pushing them
//     along the road's screen NORMAL instead looks right for a vertical road and goes
//     badly wrong for a diagonal one — it drags the near trees far down the frame.
//   · ⚠ fruitTree ALONE reads as a BUSH: its canopy ellipse runs down to baseY-0.04h
//     and buries the trunk it draws for itself. Here a trunk is painted on the ground
//     and the crown seated on top of it — a child reads TRUNK then CROWN. It is also
//     ~4x cheaper, and canopy cost grows with the SQUARE of height, so cap hFn.
// TREE KINDS. One silhouette everywhere reads as a planted row; a wood is a MIXTURE.
// Each kind is expressed as (trunk fraction, canopy height factor, canopy width factor)
// because fruitTree's crown is an ellipse — a tall narrow one is a cypress, a low wide
// one on a bare trunk is an old spreading tree, and so on.
export const TREE_KINDS = [
  { k: 'round',  trunk: 0.40, chK: 0.90, cwK: 0.46, w: 8 },   // the common broadleaf — DOMINANT
  { k: 'spire',  trunk: 0.20, chK: 0.82, cwK: 0.28, w: 2 },   // cypress/poplar (Isa 55:13)
  { k: 'spread', trunk: 0.54, chK: 0.80, cwK: 0.64, w: 3 },   // an old tree, bare-trunked and wide
  { k: 'bush',   trunk: 0.12, chK: 0.72, cwK: 0.60, w: 2 },   // scrub and young growth
];

export function perspectiveAvenue(out, counter, rng, o) {
  const ptFn = o.ptFn, wFn = o.wFn || (() => 0);
  const n = o.n == null ? 6 : o.n, t0 = o.t0 == null ? 0.10 : o.t0, t1 = o.t1 == null ? 1 : o.t1;
  const hFn = o.hFn || (t => 16 + 178 * Math.pow(t, 1.5));
  const gap = o.gap || (t => 22 + 150 * Math.pow(t, 1.3));
  const sets = o.leafCols || LEAF_GREENS;
  const kinds = o.kinds || TREE_KINDS;
  const L = o.lightFn || null;
  const keep = o.mask || (() => true);
  const trees = (o.extra || []).slice();
  const wTot = kinds.reduce((q, k) => q + (k.w || 1), 0);
  const pickKind = () => { let r = rng() * wTot; for (const k of kinds) { r -= (k.w || 1); if (r <= 0) return k; } return kinds[0]; };

  // ⚠ DO NOT emit the two sides in matched pairs at the same t. That plants a tree
  // directly opposite every other tree, at the same height and the same distance from
  // the road — Fred: "it looks like traffic lights.. trees dont grow like that right?"
  // Each side gets its OWN wandering walk, and step, offset, height and kind all vary.
  const step0 = (t1 - t0) / Math.max(1, n);
  for (const side of (n > 0 ? [-1, 1] : [])) {
    let t = t0 + rng() * step0 * 1.2;
    while (t <= t1) {
      const a2 = ptFn(t);
      const off = (wFn(t) / 2 + gap(t)) * (0.68 + rng() * 0.85);   // distance from the road varies
      trees.push({
        x: a2[0] + off * side,
        y: a2[1] + (rng() - 0.5) * 14,
        h: hFn(t) * (0.62 + rng() * 0.86),                          // saplings AND giants
        set: Math.floor(rng() * sets.length),
        kind: pickKind(),
      });
      t += step0 * (0.5 + rng() * 1.1) * (0.4 + t);                 // steps open out as they near
    }
  }
  trees.sort((p1, p2) => p1.y - p2.y);          // painter's order: far first
  const planted = [];
  for (const tr of trees) {
    if (!keep(tr.x, tr.y, tr.h)) continue;
    if (tr.h >= 34 && (o.species || o.mix || SPECIES_MIX)) {          // ⭐ after his kind — see fruitTree
      const si0 = (tr.set == null ? Math.floor(rng() * sets.length) : tr.set) % sets.length;
      paintTree(out, counter, rng, tr.x, tr.y, tr.h * 1.12, {
        species: tr.species || o.species, mix: o.mix, lightFn: L || (() => 0.5), crownCols: crownRamp(sets[si0]),
        blossom: (o.fruit == null ? 0.2 : o.fruit) < 0.1 ? 0 : 2, blossomCols: o.blossomCols,
        fruitK: Math.min(1, 0.35 + (o.fruit == null ? (tr.h > 70 ? 0.26 : 0.10) : o.fruit) * 0.65) });
      planted.push(tr); continue;
    }
    const K = tr.kind || pickKind();   // placed trees pick a species too
    const tl = tr.h * K.trunk, lean = (rng() - 0.5) * tr.h * (K.k === 'spread' ? 0.14 : 0.07);
    // ⚠ was ONE `paintPath` at lw ≈ h*0.07 — and paintPath lays its marks ACROSS the path, so
    // a wide one is a ladder of rungs by construction. Same trunk painter as `paintTree` now.
    paintTrunk(out, counter, rng, tr.x, tr.y, tl,
      Math.max(1.1, tr.h * (K.k === 'spire' ? 0.030 : 0.046)), lean / Math.max(1, tl), L, tr.h / 120);
    // even within one species no two crowns match — full, sparse, tall, squat
    const ch = tr.h * (1 - K.trunk) * K.chK * (0.86 + rng() * 0.30);
    const cwJ = K.cwK * (0.80 + rng() * 0.46);
    // fruit is deliberately SPARSE: a crown covered in big bright dabs reads as
    // blossom or candy, and the child must be able to say "tree" first (Matt 18:3).
    // ⚠ an `extra` tree may not carry a `set`; tr.set % len would be NaN, sets[NaN] is
    // undefined, and fruitTree then reads .length off it and throws. Default it.
    const si = (tr.set == null ? Math.floor(rng() * sets.length) : tr.set) % sets.length;
    fruitTree(out, counter, rng, tr.x + lean, tr.y - tl, ch, ch * cwJ,
              sets[si], L, o.fruit == null ? (tr.h > 70 ? 0.26 : 0.10) : o.fruit,
              { crownOnly: true, blossomCols: o.blossomCols });
    planted.push(tr);
  }
  return planted;
}

export const LEAF_PALETTES = [
  ['#7a4ab0', '#9a5ac8', '#b87ae0'],  // violet
  ['#c83a82', '#e05a9a', '#f07ab0'],  // pink
  ['#2c9a86', '#3ac0a0', '#5ad8b8'],  // teal
  ['#3a6ad0', '#4a7ae0', '#6a9af0'],  // blue
  ['#5a9a32', '#7ec044', '#a6dc5e'],  // green
  ['#d2922e', '#e6b34a', '#f6d06a'],  // amber
];

// one fruitful tree: a jewel canopy heavy with glowing fruit + blossoms.
// `fruit` scales how laden the canopy is (1 = the orchard default). Some scenes want
// a tree, not a harvest — wild woodland at night reads as candy if every canopy is
// loaded with bright dabs, and the green stops dominating.
// ⚠ THIS DREW A BUSH, NOT A TREE, EVERYWHERE IN THE BOOK. The canopy ellipse ran from
// baseY-1.2h down to baseY-0.04h — i.e. to the ground — burying the little trunk it drew
// for itself, and every call produced the SAME round mass. Fred: "trees dont grow like
// that right? can we also do different types of trees?" So a real trunk is painted on the
// ground and the crown is seated ON TOP of it, and each tree picks a species.
// The caller's contract is unchanged: h is still the tree's overall height and w still
// sets the crown's width — the aspect w/h the caller asked for is preserved, then
// modulated by the species. Total height stays ~1.2h, as before, so nothing moves.
//   · h < 18 keeps the OLD massed look: a distant tree is a smudge, and a 2px trunk on it
//     is noise. `opts.crownOnly` does the same for callers that paint their own trunk
//     (perspectiveAvenue), or you get two trunks.
export function pickTreeKind(rng) {
  const tot = TREE_KINDS.reduce((q, k) => q + k.w, 0);
  let r = rng() * tot;
  for (const k of TREE_KINDS) { r -= k.w; if (r <= 0) return k; }
  return TREE_KINDS[0];
}

// ══ ONE TRUNK PAINTER FOR THE WHOLE BOOK ══════════════════════════════════════════════
// ⚠⚠ EVERY TRUNK IN THE BOOK WAS A BARBER'S POLE. Fred: "make the trees better." At a
// reader's magnification the trunks were stacks of horizontal orange-and-dark rings, and
// there were two separate causes for one symptom:
//   · `paintTree` painted the trunk in six SEPARATE segments, each measuring its lit side
//     from its OWN start point — and as a trunk leans that reference walks sideways, so
//     every segment averaged to a different value and the joins showed as rungs;
//   · `perspectiveAvenue` (the near trees, the avenues, every stand that goes through
//     `fruitTree`) drew its trunk as ONE `paintPath` at a width of h*0.07 — and paintPath
//     lays marks ACROSS its path, so a wide one is a ladder of rungs by construction.
// A trunk is: an opaque tapering BODY (nothing may show through it), grain running WITH it,
// its lit side measured from the centreline AT THE MARK'S OWN HEIGHT, and cross-grain bark.
// One painter, so it is fixed once and every tree gets it.
export function paintTrunk(out, counter, tr, cx, baseY, th, wBase, lean, lightFn, sc, ex = {}) {
  const L = lightFn || (() => 0.4);
  const uAt = y => Math.max(0, Math.min(1, (baseY - y) / th));
  const cxAt = y => { const u = uAt(y); return cx + Math.sin(lean * u) * th * u + Math.sin(u * 3.1) * 2.2 * sc * (ex.twist || 1); };   // `twist`: an olive writhes, a cedar barely
  const wAt = y => wBase * (1 - 0.63 * uAt(y));
  {                                                   // the opaque body — a real tapering trunk
    let Ls = '', Rs = '';
    for (let i = 0; i <= 12; i++) {
      const y = baseY - th * (i / 12), c0 = cxAt(y), ww = wAt(y);
      Ls += (i ? 'L' : 'M') + R1(c0 - ww) + ' ' + R1(y);
      Rs = 'L' + R1(c0 + ww) + ' ' + R1(y) + Rs;
    }
    out.push(`<path d="${Ls}${Rs}Z" fill="${mix('#2c1a0c', '#4a2f18', 0.4)}"/>`); counter.n++;
  }
  strokes(out, counter, {                             // the grain, running WITH the trunk
    rng: tr, n: Math.round(70 * sc + 34),
    sample: r => { const y = baseY - th * Math.pow(r(), 0.92);
                   return [cxAt(y) + (r() - 0.5) * wAt(y) * 1.85, y]; },
    dir: (x, y) => Math.PI / 2 + lean * uAt(y),
    col: (x, y, r) => {
      const litSide = Math.max(0, Math.min(1, (cxAt(y) - x) / (wAt(y) * 1.05) * 0.5 + 0.5));
      // ⚠ AND KEEP IT DARK. First cut ramped to #bd8a52 with a 0.3 light term, and on a small
      // tree the trunk is two pixels wide — so the whole trunk became the highlight and every
      // stand in the wood read as a row of pale ornamental saplings. A trunk is a dark thing
      // with a lit EDGE, not a lit thing.
      return jig(ramp(['#170c04', '#26150a', '#3b2210', '#563520', '#7a5030', '#9c6c40'],
        litSide * 0.72 + L(x, y) * 0.18 + fbm(x / 5, y / 13, 233) * 0.20 - 0.08), r, 7);
    },
    len: 8 * sc, lw: 1.7 * sc, steps: 2, lenJ: 0.85, impasto: 0.6,
  });
  {                                                   // CONTOUR (Sep 15): the drawn line a trunk has in
    // an illustrator's hand — dark and broken down the shadow side, a thread of light down the lit
    const lit = L(cx, baseY - th * 0.5) > 0.5 ? 1 : -1;
    const side = (sgn, col, lw, dens) => {
      const pts = []; for (let i = 0; i <= 8; i++) { const y = baseY - th * (i / 8); pts.push([cxAt(y) + sgn * wAt(y) * 0.98, y]); }
      paintPath(out, counter, tr, pts, col, { lw, len: 4 * sc, density: dens, jitter: 0.6 });
    };
    side(-lit, (x, y, r) => jig(mix('#120803', '#2a160a', r() * 0.6), r, 4), 1.4 * sc, 0.55);
    side(lit, (x, y, r) => jig(mix('#b08a58', '#e0c090', r() * 0.6), r, 4), 0.8 * sc, 0.3);
  }
  strokes(out, counter, {                             // and the cross-grain — bark, not rungs
    // (`rings`: a palm's trunk IS rings — the scars of every frond it has dropped — so on a
    //  palm the cross-grain runs level, denser, and a shade paler than the bark between)
    rng: tr, n: Math.round((26 * sc + 12) * (ex.rings ? 2.4 : 1)),
    sample: r => { const y = baseY - th * Math.pow(r(), 0.9);
                   return [cxAt(y) + (r() - 0.5) * wAt(y) * 1.5, y]; },
    dir: () => (tr() - 0.5) * (ex.rings ? 0.16 : 0.9),
    col: (x, y, r) => jig(ex.rings ? mix('#2a1a0a', '#8a6a44', r() * 0.7 + L(x, y) * 0.25) : mix('#1a0e05', '#5c3a1e', r() * 0.7 + L(x, y) * 0.2), r, 6),
    len: (ex.rings ? 5.5 : 3.4) * sc, lw: 1.1 * sc, steps: 1, lenJ: 0.9, impasto: 0.5, op: ex.rings ? 0.6 : 0.42,
  });
}

// ══ A TREE, PAINTED AS A TREE ═════════════════════════════════════════════════════════
// Lifted out of `gift` into the engine on Fred's instruction — "can we make sure we can draw
// like this all the time?" — so every plate gets it instead of one page having the good one.
//
// ⚠ THE RULE THAT MATTERS, IN FRED'S OWN WORDS: "the top part of the tree is kind of yellow,
// and the bottom darker. this is consistent with real life because there is a light source
// above!" That is the whole of why a canopy reads as a solid, rounded thing instead of a flat
// green blob, and it is worth stating precisely: the gradient is not merely light-to-dark, it
// is WARM-and-light at the crown to COOL-and-deep at the belly. Sunlight is yellow, so leaves
// facing up go yellow-green; leaves underneath are lit only by bounce and sky, so they go
// blue-green and much darker. Value alone gives you a grey ball; value PLUS hue gives a tree.
//
// The other three things it needs (none of them detail):
//   · it must be DARKER than the ground it stands on — a mass against a plane. Take the
//     belly deeper than any green the field uses, or the tree merges into the grass;
//   · the canopy is several overlapping CLUSTERS, not one shape — real foliage is lumpy, and
//     the lumps are what carry the light/shadow reading;
//   · the trunk TAPERS and CURVES with real branches, and the tree CASTS A SHADOW, which is
//     what fastens it to the ground rather than pasting it on top.
//
// ⚠ Branches are STRUCTURE; the leaves are the drawing. Keep branches thin and quiet — fat
// dark ones at a reader's magnification turn every tree into a dead sapling.
// ══ SPECIES — "the tree yielding fruit… AFTER HIS KIND" (Gen 1:12) ═══════════════════════
// Fred, Sep 15: "can you make the trees different across the whole book? we have so many
// different tree species. would be amazing if we could showcase God's creations."
// Every tree here is one scripture names. One painter still (paintTree), one trunk still
// (paintTrunk), one light rule still (crown warm, belly deep) — but the SILHOUETTE is the
// species', because a child names a tree by its shape before anything else: a palm is a
// fountain on a pole, a cedar is a stack of plates, a willow weeps, a cypress is a flame.
//   oak         Isa 2:13, 1 Kings 13:14   the common broadleaf (the tree the book had)
//   sycomore    Luke 19:4                 huge, low-limbed, climbable — Zacchaeus' tree
//   olive       Ps 52:8, Luke 22:39       short twisted trunk, silver-green, small leaves
//   fig         1 Kings 4:25, Gen 3:7     low and wide, several stems, big leaves, figs
//   apple       Song 2:3                  round crown, red-gold fruit, sat under with delight
//   pomegranate Deut 8:8, 1 Sam 14:2      bushy, glossy, red globes with a crown
//   almond      Jer 1:11, Eccl 12:5       the first to wake — a cloud of pale blossom
//   willow      Ps 137:2, Isa 44:4        by the water courses — long weeping strands
//   palm        Ps 92:12, John 12:13      a tall ringed trunk, a crown of fronds, dates
//   cedar       Ps 104:16, Ps 92:12       of Lebanon — tiers of flat plates, a flat top
//   fir         Isa 41:19, Hos 14:8       the cone — tiers narrowing to a spire
//   cypress     Isa 44:14, Isa 55:13      the dark flame (the book's `spire` kind)
//   acacia      Isa 41:19 (shittah)       the wilderness umbrella: bare trunk, flat crown
// A page declares its wood with `setSpeciesMix([['olive', 3], ['fig', 2]])` (build.mjs keys
// it per page, by the page's own scripture); a hero tree names its kind in `opts.species`.
// With neither, a tree is an oak — every existing page is unchanged until it is told.
export const SPECIES = {
  oak:         { form: 'lobed', trunk: [0.46, 0.10], tw: 1.0,  twist: 1.0, lean: 1.0, lobes: [2, 1.4], rx: 1.0,  ry: 1.0,  mark: [1, 1],       dens: 1.0,  rr: 1.0,  shadow: 1.0, bloom: 1,
                 crown: ['#0d2312', '#14301a', '#1f4622', '#31612f', '#5a8b3c', '#8fb44e', '#cbd870'] },
  sycomore:    { form: 'lobed', trunk: [0.34, 0.06], tw: 1.9,  twist: 1.4, lean: 1.3, lobes: [3, 1.0], rx: 1.35, ry: 0.92, mark: [1.15, 1.15], dens: 0.95, rr: 1.28, shadow: 1.3, bloom: 0, fruit: 'sycfig',
                 crown: ['#0f2a14', '#17401c', '#245a26', '#3a7a34', '#5f9c44', '#8dbb56', '#c4d67a'] },
  olive:       { form: 'lobed', trunk: [0.30, 0.08], tw: 1.9,  twist: 3.2, lean: 1.6, lobes: [2, 1.6], rx: 1.25, ry: 0.78, mark: [0.72, 0.62], dens: 1.3,  rr: 1.05, shadow: 1.0, bloom: 0, fruit: 'olive', belly: '#26302c',
                 crown: ['#26362a', '#3d5040', '#5b7057', '#7f9375', '#a5b899', '#c9d8b8', '#eef3dc'] },
  fig:         { form: 'lobed', trunk: [0.28, 0.06], tw: 1.35, twist: 1.6, lean: 1.4, lobes: [2, 1.2], rx: 1.25, ry: 1.02, mark: [1.75, 1.6],  dens: 0.42, rr: 1.15, shadow: 1.25, bloom: 0, fruit: 'fig', stems: 3,
                 crown: ['#0b2410', '#153a1a', '#22562a', '#347236', '#4f9048', '#78ab5a', '#a8c66e'] },
  apple:       { form: 'lobed', trunk: [0.38, 0.08], tw: 1.15, twist: 1.2, lean: 1.0, lobes: [2, 1.4], rx: 1.1,  ry: 1.05, mark: [1, 1],       dens: 1.0,  rr: 1.05, shadow: 1.0, bloom: 0, fruit: 'apple',
                 crown: ['#0e2612', '#17391b', '#245425', '#397334', '#5f9645', '#8dba58', '#c6d97c'] },
  pomegranate: { form: 'lobed', trunk: [0.26, 0.06], tw: 0.9,  twist: 1.5, lean: 1.2, lobes: [3, 1.2], rx: 1.1,  ry: 0.9,  mark: [0.85, 0.8],  dens: 1.15, rr: 1.0,  shadow: 1.0, bloom: 0, fruit: 'pomegranate', stems: 3,
                 crown: ['#0e2a12', '#183f1a', '#255a24', '#357434', '#4f9243', '#74ae52', '#a3c96a'] },
  almond:      { form: 'lobed', trunk: [0.42, 0.08], tw: 0.95, twist: 1.2, lean: 1.0, lobes: [2, 1.4], rx: 1.0,  ry: 1.0,  mark: [0.9, 0.9],   dens: 0.5,  rr: 1.0,  shadow: 0.9, bloom: 0, fruit: 'almond',
                 crown: ['#2a3a2a', '#3c4f38', '#566a4a', '#748a62', '#93a67c', '#b3c096', '#d2dab2'] },
  willow:      { form: 'willow', trunk: [0.44, 0.08], tw: 1.2, twist: 1.8, lean: 1.5, lobes: [2, 1.0], rx: 1.1, ry: 0.8,   mark: [0.8, 0.7],   dens: 0.9,  rr: 0.78, shadow: 1.15, bloom: 0,
                 crown: ['#2a4a22', '#3f6a2e', '#5c8a3a', '#7fa84a', '#a3c05c', '#c8d878', '#e6ec9a'] },
  palm:        { form: 'palm',   trunk: [0.74, 0.08], tw: 0.62, twist: 1.2, lean: 1.25, shadow: 0.55, bloom: 0, rings: 1,
                 crown: ['#14351c', '#1e4a24', '#2c6a30', '#3f8a3a', '#62a848', '#8fc25a', '#c2d878'] },
  cedar:       { form: 'tiers',  trunk: [0.62, 0.06], tw: 1.35, twist: 0.6, lean: 0.4, tiers: [5, 2], cone: 0, shadow: 1.3, bloom: 0,
                 crown: ['#0f2a22', '#163a2c', '#1f4e38', '#2c6646', '#3f7f52', '#5d9a5e', '#8bb872'] },
  fir:         { form: 'tiers',  trunk: [0.30, 0.05], tw: 0.9,  twist: 0.5, lean: 0.3, tiers: [6, 2], cone: 1, shadow: 0.9, bloom: 0,
                 crown: ['#0c2418', '#123322', '#1a4630', '#245c3c', '#33744a', '#4e905a', '#7ab070'] },
  cypress:     { form: 'spire',  trunk: [0.08, 0.02], tw: 0.7,  twist: 0.5, lean: 0.6, shadow: 0.45, bloom: 0,
                 crown: ['#122820', '#1a3a28', '#25502f', '#36683a', '#4a7e44', '#6a9a52', '#94b866'] },
  acacia:      { form: 'umbrella', trunk: [0.58, 0.06], tw: 0.95, twist: 1.6, lean: 1.4, shadow: 1.35, bloom: 0,
                 crown: ['#233a1c', '#3a5528', '#587236', '#7a9046', '#9fae5a', '#c4c878', '#e8e2a0'] },
};
let SPECIES_MIX = null;
/** the page's wood: [['olive', 3], ['fig', 2], …] — or null for the plain oak */
export function setSpeciesMix(mix) { SPECIES_MIX = mix && mix.length ? mix : null; }
export function getSpeciesMix() { return SPECIES_MIX; }
/** which kind this tree is — decided by its own node in the chain (never the plate's rng) */
export function pickSpecies(G, mix) {
  const M = mix || SPECIES_MIX;
  if (!M) return 'oak';
  if (typeof M === 'string') return M;
  const tot = M.reduce((q, m) => q + (m[1] == null ? 1 : m[1]), 0);
  let r = G.trait('species', 0, tot);
  for (const m of M) { r -= (m[1] == null ? 1 : m[1]); if (r <= 0) return m[0]; }
  return M[0][0];
}
/** a page's own leaf colours (3–5 free-colour notes) spread to the 7-step crown ramp the
 *  painter reads — a dark belly note below, a sunlit note above, the page's colour between */
export function crownRamp(cols) {
  if (!cols) return null;
  if (cols.length >= 7) return cols;
  const ext = [mix(cols[0], '#07160f', 0.55), mix(cols[0], '#0b1a2e', 0.22)].concat(cols, [mix(cols[cols.length - 1], '#f4f0b0', 0.4)]);
  const out = []; for (let i = 0; i < 7; i++) out.push(ramp(ext, i / 6));
  return out;
}

export function paintTree(out, counter, rng, cx, baseY, h, opts = {}) {
  const {
    lightFn = () => 0.5,          // how lit this point is (0..1) — the page's own light
    tint = (c) => c,              // optional per-plate hue drift, e.g. a chroma() field
    shadowDir = 1,                // which way the cast shadow leans
    blossom = 3,                  // how many blossoms/fruit on the lit side
    crownCols,                    // override the canopy ramp if a page wants its own species
    sun = 1,                      // how much daylight sits on the clump tops (a NIGHT tree wants ~0.2 — looking's sycomore)
  } = opts;
  const sc = h / 120;
  const tr = rng;
  const G0 = opts.node || gAt('tree', cx, baseY, h);
  const kind = opts.species || pickSpecies(G0, opts.mix);
  const S = SPECIES[kind] || SPECIES.oak;
  const sr = G0.child('kind').rng();                       // the species' own hand — the plate's stream is not touched by it
  const _lean = (tr() - 0.5) * 0.34 * S.lean;               // (always drawn, so a pinned tree spends the same rng as a free one)
  const lean = opts.lean != null ? opts.lean : _lean;       // ⚠ `lean`: a hero tree whose trunk must stay clear of something (nonight's river) pins it
  const th = h * (S.trunk[0] + tr() * S.trunk[1]) * (opts.trunkK || 1);   // trunkK (Oct 6): lift a crown so a figure can sit UNDER it (garden's fig) — default unchanged
  const topX = cx + Math.sin(lean) * th, topY = baseY - th;
  // ⚠ belly deeper than any grass; crown warm and pale — this ramp IS the rule above
  const CROWN = crownRamp(crownCols) || S.crown;
  const BELLY = S.belly || '#07160f';
  const p3 = Math.pow(sc, 0.3);
  // ⭐ WHICH SIDE THE LIGHT IS ON (Sep 15, Fred: "make the trees better"). The crown-warm /
  // belly-deep rule is vertical; a tree also has a LIT FLANK and a SHADED FLANK, and that is
  // what turns a clump into a ball. Measured once per tree from the page's own light.
  const lxDir = (() => { const d = lightFn(cx + 24 * sc, topY - h * 0.3) - lightFn(cx - 24 * sc, topY - h * 0.3); return Math.abs(d) < 0.01 ? 0 : Math.sign(d); })();
  const flankAt = (x, x0, rad) => lxDir === 0 ? 0.5 : Math.max(0, Math.min(1, 0.5 + 0.5 * lxDir * (x - x0) / (rad * 1.2)));
  // 1 · the shadow it throws
  // ⚠ The old flat green patch is still RUN — into a throwaway list — purely so that it spends
  // exactly the rng it always spent: every plate's stream, and so every composition, is
  // untouched. What is actually painted is groundShadow(), below it.
  const _spent = [], _spentN = { n: 0 };
  strokes(_spent, _spentN, {
    rng: tr, n: Math.round(30 * sc * S.shadow + 8),
    sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 0.6);
                   return [cx + shadowDir * 6 * sc + Math.cos(a) * 30 * sc * S.shadow * d, baseY + 5 * sc + Math.sin(a) * 9 * sc * d]; },
    dir: () => 0.06,
    col: (x, y, r) => jig(mix('#2c5330', '#16301c', 0.3 + r() * 0.55), r, 6),
    len: 9 * sc, lw: 3.4 * sc, steps: 2, lenJ: 0.6, relief: 0, op: 0.38,
  });
  // (38·sc, up from the old patch's 30: under a high light a tree's shadow is about as wide as its crown)
  if (opts.shadow !== 0) groundShadow(out, counter, cx, baseY + 4 * sc, 38 * sc * S.shadow, 10 * sc,
    { dir: shadowDir * 0.85, reach: 1, op: Math.min(1.25, 0.55 + lightFn(cx, baseY) * 0.9) });   // a harder light throws a firmer shadow
  // 2 · the trunk — one painter for the whole book, see paintTrunk above
  paintTrunk(out, counter, tr, cx, baseY, th, 7 * sc * S.tw, lean, lightFn, sc, { twist: S.twist, rings: S.rings });
  if (S.stems) {                                         // a fig or a pomegranate grows several stems from one foot
    const ns = S.stems - 1 + (sr() < 0.5 ? 0 : -1);
    for (let k = 0; k < ns; k++) {
      const side = k % 2 ? -1 : 1;
      paintTrunk(out, counter, tr, cx + side * 3 * sc, baseY, th * (0.72 + sr() * 0.2), 7 * sc * S.tw * 0.55,
                 side * (0.5 + sr() * 0.35), lightFn, sc, { twist: S.twist });
    }
  }

  // ── the one light rule, for every form: how high a leaf sits on its own clump ──────────
  const leafCol = (crown, x, y, r, bunchK, fl = 0.5) => {
    const bunch = fbm(x / bunchK, y / (bunchK * 0.8), 197);
    let c = ramp(CROWN, crown * 0.74 + lightFn(x, y) * 0.24 + (fl - 0.5) * 0.24
                      + (bunch - 0.5) * (0.26 + 0.34 * Math.min(1, sc)) + fbm(x / 5, y / 4.4, 191) * 0.26
                      + (r() - 0.5) * 0.16 - 0.06);
    c = mix(c, '#f7f0a2', sun * (Math.pow(crown, 2.0) * 0.58 + Math.pow(fl, 2) * 0.16) * (0.5 + lightFn(x, y) * 0.5));   // the sun on the top of every clump, and on its lit flank
    c = mix(c, BELLY, Math.pow(1 - crown, 2.2) * 0.5 + Math.pow(1 - fl, 2) * 0.22);                              // and a real dark under it, deeper on the shaded flank
    if (r() < 0.05) c = mix(c, '#08160c', 0.55);
    else if (r() < 0.072) c = mix(c, '#dfe6c0', 0.42 * Math.min(1, sc) * sun);
    return jig(tint(c, x, y), r, 9);
  };

  // ── FRUIT — each kind's own, hung where fruit hangs (the lower half of the clumps) ─────
  const hangFruit = (lobes, rr) => {
    const F = S.fruit; if (!F) return;
    const spec = {
      apple:       { n: 0.55, r: 2.3, cols: ['#d8352c', '#e5b23a', '#c9552c'], round: 1 },
      pomegranate: { n: 0.5,  r: 2.7, cols: ['#c8302e', '#e0453a', '#b8262c'], round: 1, calyx: 1 },
      fig:         { n: 0.6,  r: 2.0, cols: ['#5a2e4a', '#6e3a5c', '#4a2440'], drop: 1 },
      sycfig:      { n: 0.35, r: 1.4, cols: ['#c8873a', '#a8642a', '#d9a04a'], round: 1 },
      olive:       { n: 1.4,  r: 1.05, cols: ['#2a2438', '#4a3a5a', '#6a7a4a'], round: 1 },
    }[F];
    if (!spec) return;
    const fr0 = spec.r * Math.pow(sc, 0.4);
    const N = Math.round(rr * spec.n * (opts.fruitK == null ? 1 : opts.fruitK));
    for (let i = 0; i < N; i++) {
      const L = lobes[Math.min(lobes.length - 1, (sr() * lobes.length) | 0)];
      const a = Math.PI * (0.05 + sr() * 0.9), d = 0.35 + Math.pow(sr(), 0.7) * 0.62;   // the lower half of the clump
      const fx = L.x + Math.cos(a) * L.rx * d, fy = L.y + Math.sin(a) * L.ry * d;
      const fr = fr0 * (0.85 + sr() * 0.3), fc = spec.cols[(sr() * spec.cols.length) | 0], lit = lightFn(fx, fy);
      if (spec.drop) {                                     // a fig hangs — a teardrop, heavier below
        out.push(ribbon([[fx, fy - fr * 1.1], [fx + fr * 0.1, fy], [fx, fy + fr * 0.9]], fr * 1.5, mix(fc, DARKEST, 0.4), [0.45, 1, 0.85])); counter.n++;
        out.push(ribbon([[fx - fr * 0.15, fy - fr * 0.9], [fx - fr * 0.1, fy - fr * 0.1]], fr * 0.7, mix(fc, '#f0d0c0', 0.28 + lit * 0.3))); counter.n++;
      } else {
        out.push(ribbon([[fx - fr * 0.62, fy + fr * 0.5], [fx + fr * 0.7, fy + fr * 0.42]], fr * 1.5, mix(fc, DARKEST, 0.42))); counter.n++;
        out.push(ribbon([[fx - fr * 0.7, fy], [fx + fr * 0.7, fy]], fr * 1.8, mix(fc, '#fff0c0', lit * 0.45))); counter.n++;
        out.push(ribbon([[fx - fr * 0.28, fy - fr * 0.28], [fx, fy - fr * 0.12]], fr * 0.6, '#fff6dc')); counter.n++;
        if (spec.calyx) { out.push(ribbon([[fx - fr * 0.3, fy - fr * 0.95], [fx, fy - fr * 0.7], [fx + fr * 0.3, fy - fr * 0.95]], fr * 0.35, '#5a1c1a')); counter.n++; }
      }
    }
  };

  // ── LOBED CROWN — a mass of stacked clumps riding the branch tips (oak, olive, fig, …) ──
  const lobedCrown = (cl, rrK) => {
    const allLobes = [];
    for (const [cx0, cy0, mass] of cl) {
      const rr = h * (0.21 + tr() * 0.08) * mass * S.rr * rrK;
      /* ⭐ CLUMPS, NOT A DOME (Sep 15, the style-evolution pass — Fred: "you can make the trees
         better and stuff too"). A canopy drawn as one radial mass is a broccoli head. Foliage
         grows in CLUMPS that stack: each cluster is several overlapping lobes stepping up, every
         lobe with its own lit top and its own shaded underside, and a run of dark under each
         lobe where the clump above throws its shadow on the one below. That tier-on-tier
         reading is how the great illustrators draw a tree. (Second cut, Fred: "the improvement
         is just marginal" — fewer, BIGGER clumps so the tiers read at page scale, and a harder
         turn from lit top to shaded belly on every one of them.) */
      const NL = S.lobes[0] + Math.round(tr() * S.lobes[1]);
      const lobes = [];
      for (let k = 0; k < NL; k++) {
        const t = k / Math.max(1, NL - 1);
        lobes.push({ x: cx0 + (tr() - 0.5) * rr * 0.6 * (1 - t * 0.6), y: cy0 + rr * 0.4 - t * rr * 0.95 * S.ry,
                     rx: rr * (1.05 - t * 0.4) * (0.85 + tr() * 0.3) * S.rx, ry: rr * (0.46 + tr() * 0.12) * S.ry, k });
      }
      const inLobe = (x, y) => { let best = -1, bd = 9; for (const L of lobes) { const d = Math.hypot((x - L.x) / L.rx, (y - L.y) / L.ry); if (d < bd) { bd = d; best = L.k; } } return [best, bd]; };
      const crownAt = (x, y) => { const [k] = inLobe(x, y); const L = lobes[Math.max(0, k)];
        return Math.max(0, Math.min(1, (L.y - y) / (L.ry * 1.1) * 0.5 + 0.5)) * (0.86 + 0.14 * (L.k / Math.max(1, NL - 1))); };
      strokes(out, counter, {
        // ⚠ DENSITY IS WHAT MAKES A CANOPY A MASS; a leaf is the SAME SIZE on any tree (count
        // grows with area, mark size barely with height); bunches, dark hollows, sky chinks.
        rng: tr, n: Math.min(3600, Math.round(rr * rr * 2.5 * S.dens)),
        sample: r => { const L = lobes[Math.min(NL - 1, (r() * NL) | 0)]; const a = r() * Math.PI * 2, d = Math.pow(r(), 0.5) * (r() < 0.05 ? 1.12 : 1);
                       return [L.x + Math.cos(a) * L.rx * d, L.y + Math.sin(a) * L.ry * d]; },
        dir: (x, y) => { const [k] = inLobe(x, y); const L = lobes[Math.max(0, k)]; return Math.atan2((y - L.y) / L.ry, (x - L.x) / L.rx) + Math.PI / 2 + (tr() - 0.5) * 1.15; },
        col: (x, y, r) => leafCol(crownAt(x, y), x, y, r, rr * 0.28 + 3, flankAt(x, cx0, rr * S.rx)),
        len: 3.5 * p3 * S.mark[0], lw: 1.55 * p3 * S.mark[1], steps: 2, lenJ: 0.95, impasto: 0.62,
      });
      // the SHADE UNDER EACH CLUMP + a broken CONTOUR beneath it — line, not only mass
      for (const L of lobes) {
        strokes(out, counter, {
          rng: tr, n: Math.max(10, Math.round(L.rx * 0.9)),
          sample: r => { const a = Math.PI * (0.12 + r() * 0.76); return [L.x + Math.cos(a) * L.rx * (0.5 + r() * 0.5), L.y + Math.sin(a) * L.ry * (0.75 + r() * 0.4)]; },
          dir: (x, y) => Math.atan2(y - L.y, x - L.x) + Math.PI / 2 + (tr() - 0.5) * 0.8,
          col: (x, y, r) => jig(tint(mix(CROWN[0], CROWN[1], r() * 0.6), x, y), r, 5),
          len: 3.6 * p3 * S.mark[0], lw: 1.7 * p3 * S.mark[1], steps: 2, lenJ: 0.8, impasto: 0.4, op: 0.85,
        });
        const arc = []; for (let i = 0; i <= 10; i++) { const a = Math.PI * (0.1 + 0.8 * i / 10); arc.push([L.x + Math.cos(a) * L.rx * 0.98, L.y + Math.sin(a) * L.ry * 1.02]); }
        paintPath(out, counter, tr, arc, (x, y, r) => jig(mix('#06140c', CROWN[1], r() * 0.4), r, 4), { lw: 1.1 * p3, len: 3, density: 0.42, jitter: 0.8 });
      }
      // EDGE LEAVES — the silhouette is leaves against the sky, not a cut dome
      strokes(out, counter, {
        rng: tr, n: Math.max(10, Math.round(rr * 0.9)),
        sample: r => { const L = lobes[Math.min(NL - 1, (r() * NL) | 0)]; const a = r() * Math.PI * 2, d = 1.0 + r() * 0.16; return [L.x + Math.cos(a) * L.rx * d, L.y + Math.sin(a) * L.ry * d]; },
        dir: (x, y) => { const [k] = inLobe(x, y); const L = lobes[Math.max(0, k)]; return Math.atan2((y - L.y) / L.ry, (x - L.x) / L.rx) + (tr() - 0.5) * 0.9; },
        col: (x, y, r) => { const [k] = inLobe(x, y); const L = lobes[Math.max(0, k)]; const up = Math.max(0, Math.min(1, (L.y - y) / (L.ry * 1.1) * 0.5 + 0.5)); return jig(tint(ramp(CROWN, 0.35 + up * 0.5 + lightFn(x, y) * 0.15), x, y), r, 8); },
        len: 2.8 * p3 * S.mark[0], lw: 1.2 * p3 * S.mark[1], steps: 1, lenJ: 0.9, impasto: 0.5, op: 0.9,
      });
      // THE LIT TIPS — finer, brighter leaves on the top and lit flank of every clump
      strokes(out, counter, {
        rng: tr, n: Math.min(760, Math.round(rr * rr * 0.38 * S.dens)),
        sample: r => {
          const L = lobes[Math.min(NL - 1, (r() * NL) | 0)];
          const a = r() * Math.PI * 2, d = 0.42 + Math.pow(r(), 0.6) * 0.7;
          const px = L.x + Math.cos(a) * L.rx * d, py = L.y + Math.sin(a) * L.ry * d;
          const up = (L.y - py) / (L.ry * 1.1) * 0.5 + 0.5;
          return (r() < up * up * 1.15) ? [px, py] : null;
        },
        dir: (x, y) => Math.atan2(y - cy0, x - cx0) + Math.PI / 2 + (tr() - 0.5) * 1.3,
        col: (x, y, r) => {
          const [k] = inLobe(x, y); const L = lobes[Math.max(0, k)];
          const crown = Math.max(0, Math.min(1, (L.y - y) / (L.ry * 1.1) * 0.5 + 0.5));
          let c = ramp(CROWN, 0.62 + crown * 0.3 + lightFn(x, y) * 0.2 + (r() - 0.5) * 0.14);
          c = mix(c, '#f7edac', (0.12 + Math.pow(crown, 2.2) * 0.36) * (0.22 + lightFn(x, y) * 0.78));
          return jig(tint(c, x, y), r, 9);
        },
        len: 2.9 * Math.pow(sc, 0.28) * S.mark[0], lw: 1.25 * Math.pow(sc, 0.28) * S.mark[1], steps: 1, lenJ: 1, impasto: 0.7, op: 0.7,
      });
      if (S.fruit === 'almond') {                          // THE ALMOND WAKES FIRST — a cloud of blossom over dark boughs
        strokes(out, counter, {
          rng: sr, n: Math.min(2600, Math.round(rr * rr * 1.7)),
          sample: r => { const L = lobes[Math.min(NL - 1, (r() * NL) | 0)]; const a = r() * Math.PI * 2, d = Math.pow(r(), 0.5) * 1.04;
                         return [L.x + Math.cos(a) * L.rx * d, L.y + Math.sin(a) * L.ry * d]; },
          dir: () => (sr() - 0.5) * Math.PI,
          col: (x, y, r) => { const up = crownAt(x, y); let c = ramp(['#b46a8c', '#d99ab6', '#f3c4d6', '#fde6ee', '#ffffff'], up * 0.7 + r() * 0.4 + lightFn(x, y) * 0.2);
                              if (r() < 0.12) c = mix(c, '#e0507a', 0.5); return jig(tint(c, x, y), r, 6); },
          len: 2.4 * p3, lw: 1.9 * p3, steps: 1, lenJ: 0.5, impasto: 0.55, op: 0.92, flow: 0,
        });
      } else hangFruit(lobes, rr);
      for (const L of lobes) allLobes.push(L);
    }
    return allLobes;
  };

  // ── THE DARK INSIDE — under every crown, where the boughs meet the trunk, the leaves are lit
  //    by nothing. A run of deep marks there is what gives a canopy an underside and a weight.
  const innerDark = (ix, iy, irx, iry) => strokes(out, counter, {
    rng: sr, n: Math.max(12, Math.round(irx * 1.3)),
    sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 0.6); return [ix + Math.cos(a) * irx * d, iy + Math.sin(a) * iry * d]; },
    dir: (x, y) => Math.atan2(y - iy, x - ix) + Math.PI / 2 + (sr() - 0.5) * 1.2,
    col: (x, y, r) => jig(tint(mix(BELLY, CROWN[0], r() * 0.5), x, y), r, 5),
    len: 3.2 * p3, lw: 1.5 * p3, steps: 2, lenJ: 0.8, impasto: 0.4, op: 0.5,
  });
  // ── GRASS AT THE FOOT — a tree grows OUT of its ground; a trunk meeting the field along a
  //    clean edge is a pole in a lawn (learned on nonight). Off by `tuft: 0` for sand or stone.
  const footTuft = () => {
    if (opts.tuft === 0) return;
    const gl0 = lightFn(cx, baseY);
    strokes(out, counter, {
      rng: sr, n: Math.round(30 * sc * S.tw + 12),
      sample: r => [cx + (r() + r() - 1) * 9 * sc * S.tw, baseY + 2 * sc - Math.pow(r(), 2) * 3 * sc],
      dir: (x) => -Math.PI / 2 + (x - cx) * 0.03 / Math.max(0.5, sc) + (sr() - 0.5) * 0.7,
      col: (x, y, r) => { let c = ramp(['#1c3a1c', '#3a6a2c', '#6f9a3c', '#a8c25c'], r() * 0.6 + gl0 * 0.35); c = mix(c, BELLY, (1 - gl0) * 0.5); return jig(tint(c, x, y), r, 7); },
      len: (x) => 5.5 * sc * (0.6 + sr() * 0.8), lw: 1.15 * sc, steps: 2, lenJ: 0.7, impasto: 0.5, op: 0.88,
    });
  };
  footTuft();
  // 3 · branches — the same rule applied to its own output (see limbs() above). A tree is a
  // rule that keeps going; each limb descends from its parent's node, so this skeleton is its own.
  const GT = G0.child('branch');
  const limbCol = (x, y, r) => jig(mix('#3f2a16', '#6b5334', r() * 0.7 + lightFn(x, y) * 0.25), r, 7);

  if (S.form === 'lobed') {
    const tips = limbs(out, counter, tr, GT, topX, topY, {
      len0: h * 0.22, lw0: 1.7 * sc, up: -Math.PI / 2 + lean, minLen: h * 0.05, col: limbCol,
      pathOpts: { len: 4, density: 0.6, jitter: 0.5 },
    });
    // 4 · the canopy — a central mass, plus clusters riding the outermost tips so the
    // SILHOUETTE follows the skeleton instead of every tree wearing the same dome.
    const arms = spreadTips(tips, 5, h * 0.09);
    const cl = [[topX, topY - h * 0.14, 1]].concat(arms.map(t => [t[0], t[1], 0.62]));
    if (kind === 'sycomore') {                           // the LOW LIMBS a boy could climb (Luke 19:4), below the crown, each with its own tuft of leaves
      for (const side of [-1, 1]) {
        const y0 = baseY - th * (0.5 + sr() * 0.15), ex = cx + side * h * (0.3 + sr() * 0.1), ey = y0 - h * (0.02 + sr() * 0.06);
        paintPath(out, counter, tr, [[cx + side * 3 * sc, y0], [cx + side * h * 0.16, y0 - h * 0.05], [ex, ey]], limbCol, { lw: 3.2 * sc, len: 5, density: 0.7, jitter: 0.5 });
        cl.push([ex, ey - h * 0.03, 0.42]);
      }
    }
    lobedCrown(cl, 1);
    innerDark(topX, topY - h * 0.05, h * 0.28 * S.rr * S.rx, h * 0.1);
    // 5 · blossom, on the lit side only (the oak and the apple keep the book's blossom)
    if (S.bloom) for (let f = 0; f < blossom + ((tr() * 4) | 0); f++) {
      const [ax, ay] = cl[(tr() * cl.length) | 0];
      const bx = ax + (tr() - 0.5) * h * 0.3, by = ay + (tr() - 0.5) * h * 0.2;
      if (lightFn(bx, by) < 0.12) continue;
      // ⚠ NOT A <circle> (a flat opaque disc pasted over the paint); size near-constant, and
      // `blossomCols` must stay THREE long — one rng call per blossom whatever the palette.
      daub(out, counter, bx, by, 1.9 * Math.pow(sc, 0.35),
        (opts.blossomCols || ['#ffe7a8', '#ffd9e6', '#fff2f6'])[(tr() * 3) | 0], tr);
    }
    return;
  }

  if (S.form === 'willow') {
    // "as willows by the water courses" (Isa 44:4). A small crown, and out of it the STRANDS —
    // long leafy ropes that fall outward and down, which is the whole silhouette.
    const tips = limbs(out, counter, tr, GT, topX, topY, {
      len0: h * 0.18, lw0: 1.6 * sc, up: -Math.PI / 2 + lean, minLen: h * 0.05, col: limbCol,
      pathOpts: { len: 4, density: 0.6, jitter: 0.5 },
    });
    const arms = spreadTips(tips, 4, h * 0.08);
    const cl = [[topX, topY - h * 0.1, 1]].concat(arms.map(t => [t[0], t[1], 0.6]));
    const lobes = lobedCrown(cl, 1);
    innerDark(topX, topY - h * 0.04, h * 0.2, h * 0.07);
    let ex0 = 1e9, ex1 = -1e9, ey0 = 1e9;
    for (const L of lobes) { ex0 = Math.min(ex0, L.x - L.rx); ex1 = Math.max(ex1, L.x + L.rx); ey0 = Math.min(ey0, L.y - L.ry); }
    const cxm = (ex0 + ex1) / 2, rxm = (ex1 - ex0) / 2;
    const NS = 22 + Math.round(sr() * 16), strands = [];
    for (let i = 0; i < NS; i++) {
      const a = Math.PI * (1.02 + (i + sr() * 0.8) / NS * 0.96);          // round the top from left to right
      const sx = cxm + Math.cos(a) * rxm * (0.55 + sr() * 0.5), sy = topY - h * 0.1 + Math.sin(a) * h * 0.14 * S.ry;
      const side = sx < cxm ? -1 : 1;
      const fall = h * (0.34 + sr() * 0.3), reach = side * h * (0.06 + sr() * 0.26) * Math.min(1, Math.abs(sx - cxm) / (rxm * 0.6) + 0.35);
      const c1 = [sx + reach * 0.75, sy + fall * 0.22], e = [sx + reach, sy + fall];
      const pts = []; for (let k = 0; k <= 9; k++) { const t = k / 9, u = 1 - t;
        pts.push([u * u * sx + 2 * u * t * c1[0] + t * t * e[0], u * u * sy + 2 * u * t * c1[1] + t * t * e[1]]); }
      strands.push(pts);
      paintPath(out, counter, sr, pts, (x, y, r) => jig(mix('#3a5222', '#5c7a30', r() * 0.6 + lightFn(x, y) * 0.3), r, 5),
        { lw: 0.9 * Math.pow(sc, 0.4), len: 3, density: 0.34, jitter: 0.5 });
    }
    const near = (x, y) => { let bs = null, bd = 1e9, bt = 0; for (const s of strands) for (let k = 0; k < s.length; k++) { const d = Math.hypot(s[k][0] - x, s[k][1] - y); if (d < bd) { bd = d; bs = s; bt = k; } } return [bs, bt]; };
    strokes(out, counter, {
      rng: sr, n: Math.min(4200, Math.round(NS * h * 0.42)),
      sample: r => { const s = strands[(r() * NS) | 0]; const t = r(); const k = Math.min(8, (t * 9) | 0);
                     const p = s[k], q = s[k + 1]; const f = t * 9 - k; const x = p[0] + (q[0] - p[0]) * f, y = p[1] + (q[1] - p[1]) * f;
                     return [x + (r() - 0.5) * 3.2 * p3, y + (r() - 0.5) * 3.2 * p3]; },
      dir: (x, y) => { const [s, k] = near(x, y); const p = s[Math.max(0, k - 1)], q = s[Math.min(9, k + 1)]; return Math.atan2(q[1] - p[1], q[0] - p[0]) + (sr() - 0.5) * 1.0; },
      col: (x, y, r) => { const up = Math.max(0, Math.min(1, 1 - (y - topY + h * 0.1) / (h * 0.6)));
                          let c = ramp(CROWN, 0.28 + up * 0.5 + lightFn(x, y) * 0.22 + (r() - 0.5) * 0.2);
                          c = mix(c, '#f7f0a2', up * up * 0.4 * (0.4 + lightFn(x, y) * 0.6)); c = mix(c, BELLY, (1 - up) * 0.3);
                          return jig(tint(c, x, y), r, 8); },
      len: 2.9 * p3, lw: 1.05 * p3, steps: 1, lenJ: 0.9, impasto: 0.5, op: 0.88, flow: 0,
    });
    return;
  }

  if (S.form === 'palm') {
    // "the righteous shall flourish like the palm tree" (Ps 92:12) — a fountain of fronds on a
    // ringed pole; two dry ones hang; the dates hang in clusters under the crown.
    const NF = 9 + Math.round(sr() * 5), fronds = [];
    const FL = h * 0.40;
    const bez = (p0, c1, p2, n) => { const pts = []; for (let k = 0; k <= n; k++) { const t = k / n, u = 1 - t;
      pts.push([u * u * p0[0] + 2 * u * t * c1[0] + t * t * p2[0], u * u * p0[1] + 2 * u * t * c1[1] + t * t * p2[1]]); } return pts; };
    for (let i = 0; i < NF; i++) {
      const a = -Math.PI * 0.5 + ((i + 0.5) / NF - 0.5) * Math.PI * 1.3 + (sr() - 0.5) * 0.16;   // the fan, up-left to up-right
      const L = FL * (0.78 + sr() * 0.38), flat = Math.abs(Math.cos(a));                        // the more sideways, the more it droops
      const droop = L * (0.18 + flat * 0.5);
      const p0 = [topX, topY], c1 = [topX + Math.cos(a) * L * 0.62, topY + Math.sin(a) * L * 0.62 - L * 0.1], p2 = [topX + Math.cos(a) * L, topY + Math.sin(a) * L + droop];
      fronds.push({ pts: bez(p0, c1, p2, 12), lit: 0.5 + 0.5 * Math.cos(a + Math.PI / 2), L, dead: 0 });
    }
    for (let i = 0; i < 2; i++) {                        // the SPEARS — new fronds still folded, standing straight up from the heart
      const a = -Math.PI / 2 + (i ? 0.13 : -0.1) + (sr() - 0.5) * 0.08, L = FL * 0.55;
      fronds.push({ pts: bez([topX, topY], [topX + Math.cos(a) * L * 0.5, topY + Math.sin(a) * L * 0.5], [topX + Math.cos(a) * L, topY + Math.sin(a) * L], 12), lit: 0.9, L, dead: 0, spear: 1 });
    }
    for (let i = 0; i < 2; i++) {                        // the old fronds, brown and hanging
      const a = Math.PI * 0.5 + (i ? 0.55 : -0.55) + (sr() - 0.5) * 0.3, L = FL * 0.62;
      fronds.push({ pts: bez([topX, topY], [topX + Math.cos(a) * L * 0.5 + (i ? 1 : -1) * L * 0.25, topY + L * 0.2], [topX + Math.cos(a) * L, topY + Math.sin(a) * L], 12), lit: 0.3, L, dead: 1 });
    }
    for (const F of fronds)                              // the spine of each frond (a spear is only spine, pale and thick)
      paintPath(out, counter, sr, F.pts, (x, y, r) => jig(F.dead ? mix('#5a4424', '#8a6a3a', r() * 0.6) : F.spear ? mix(CROWN[4], CROWN[6], r() * 0.6) : mix('#26421a', '#4f7a2c', r() * 0.5 + lightFn(x, y) * 0.3), r, 5),
        { lw: (F.spear ? 2.6 : 1.7) * Math.pow(sc, 0.5), len: 4, density: 0.7, jitter: 0.4 });
    const near = (x, y) => { let bf = null, bd = 1e9, bk = 0; for (const F of fronds) for (let k = 0; k < F.pts.length; k++) { const d = Math.hypot(F.pts[k][0] - x, F.pts[k][1] - y); if (d < bd) { bd = d; bf = F; bk = k; } } return [bf, bk]; };
    strokes(out, counter, {                              // LEAFLETS — a row each side of every spine, angled away from it, drooping toward the tip
      rng: sr, n: Math.min(5200, Math.round(NF * FL * 3.0 * Math.pow(sc, 0.35))),
      sample: r => { const F = fronds[(r() * fronds.length) | 0]; if (F.spear) return null; const t = 0.12 + Math.pow(r(), 0.85) * 0.88; const k = Math.min(11, (t * 12) | 0);
                     const p = F.pts[k], q = F.pts[k + 1]; const f = t * 12 - k; const x = p[0] + (q[0] - p[0]) * f, y = p[1] + (q[1] - p[1]) * f;
                     const tx = q[0] - p[0], ty = q[1] - p[1], tl = Math.hypot(tx, ty) || 1; const side = r() < 0.5 ? -1 : 1;
                     const off = F.L * 0.13 * (1 - t * 0.35) * (0.15 + r() * 0.85);
                     return [x - ty / tl * off * side, y + tx / tl * off * side]; },
      dir: (x, y) => { const [F, k] = near(x, y); const p = F.pts[Math.max(0, k - 1)], q = F.pts[Math.min(12, k + 1)];
                       const ta = Math.atan2(q[1] - p[1], q[0] - p[0]); const tx = q[0] - p[0], ty = q[1] - p[1];
                       const side = ((x - p[0]) * ty - (y - p[1]) * tx) > 0 ? 1 : -1;      // which side of the spine this leaflet is on
                       return ta + side * (0.95 + (k / 12) * 0.5) + (sr() - 0.5) * 0.3; },
      col: (x, y, r) => { const [F, k] = near(x, y);
                          if (F.dead) return jig(mix('#6a5028', '#a8864a', r() * 0.7), r, 6);
                          const up = F.lit * 0.6 + (1 - k / 12) * 0.25;
                          let c = ramp(CROWN, 0.22 + up * 0.5 + lightFn(x, y) * 0.22 + (r() - 0.5) * 0.2);
                          const lp = lightFn(x, y); c = mix(c, '#f7f0a2', Math.pow(F.lit, 2) * 0.45 * (0.1 + lp * 0.9)); c = mix(c, BELLY, (1 - F.lit) * 0.35 + Math.max(0, 0.5 - lp) * 0.6);   // a palm at night is a dark fan
                          return jig(tint(c, x, y), r, 8); },
      len: (x, y) => { const [F] = near(x, y); return F.L * 0.11 * (0.7 + sr() * 0.6); }, lw: 1.15 * Math.pow(sc, 0.35), steps: 1, lenJ: 0.4, impasto: 0.55, op: 0.92, flow: 0,
    });
    for (let c = 0; c < 2; c++) {                        // the DATES — two clusters hanging under the crown
      const dx0 = topX + (c ? 1 : -1) * 5 * sc, dy0 = topY + 5 * sc;
      for (let i = 0; i < 12; i++) {
        const a = sr() * Math.PI * 2, d = Math.pow(sr(), 0.6);
        const fx = dx0 + Math.cos(a) * 4.5 * sc * d, fy = dy0 + 6 * sc + Math.sin(a) * 7 * sc * d;
        const fr = 1.3 * Math.pow(sc, 0.4), fc = ['#c47a2a', '#e09a3e', '#a85a1e'][(sr() * 3) | 0];
        const dl = lightFn(fx, fy), fcN = mix(fc, BELLY, Math.max(0, 0.6 - dl) * 1.5);   // dates take the page's light: at night they are not the brightest thing on the tree
        out.push(ribbon([[fx - fr * 0.6, fy + fr * 0.4], [fx + fr * 0.6, fy + fr * 0.4]], fr * 1.4, mix(fcN, DARKEST, 0.4))); counter.n++;
        out.push(ribbon([[fx - fr * 0.6, fy], [fx + fr * 0.6, fy]], fr * 1.6, mix(fcN, '#fff0c0', dl * 0.4))); counter.n++;
      }
    }
    return;
  }

  if (S.form === 'tiers') {
    // The cedar of Lebanon (Ps 104:16) — tiers of flat plates on a great trunk, a flat top.
    // The fir (Isa 41:19) — the same tiers, but each narrower than the one below, to a spire.
    const NT = S.tiers[0] + Math.round(sr() * S.tiers[1]);
    if (S.cone) paintPath(out, counter, sr, [[topX, topY], [topX + Math.sin(lean) * h * 0.2, baseY - h * 0.96]],   // the spine runs on inside the foliage
      (x, y, r) => jig(mix('#1a0e05', '#3b2210', r() * 0.6), r, 4), { lw: 2.2 * sc, len: 4, density: 0.6, jitter: 0.4 });
    const tiers = [];
    for (let i = 0; i < NT; i++) {
      const t = i / Math.max(1, NT - 1);
      const y = S.cone ? baseY - h * (0.24 + 0.72 * t) : topY - h * (0.02 + 0.40 * t) + h * 0.06;
      const W = S.cone ? h * (0.34 * (1 - 0.86 * t) + 0.035) * (0.85 + sr() * 0.3)
                       : h * (0.44 - 0.24 * Math.pow(t, 1.4)) * (0.82 + sr() * 0.36);
      const ry = h * (S.cone ? 0.055 : 0.052) * (0.85 + sr() * 0.3);
      const tx = cx + Math.sin(lean) * (baseY - y);
      tiers.push({ x: tx + (sr() - 0.5) * W * 0.2, y, W, ry, t, skew: (sr() - 0.5) * 0.3 });
    }
    for (let i = NT - 1; i >= 0; i--) {                  // top first, so every lower tier's lit top lies over the belly above it
      const T = tiers[i];
      const yAt = (x) => T.y + (S.cone ? Math.abs(x - T.x) / T.W * h * 0.05 : (x - T.x) * T.skew * 0.08 - Math.pow(Math.abs(x - T.x) / T.W, 2) * h * 0.022);   // a fir's boughs hang; a cedar's lie level and lift at the tips
      for (const side of [-1, 1])                        // the bough that carries the plate
        paintPath(out, counter, sr, [[T.x, T.y], [T.x + side * T.W * 0.5, yAt(T.x + side * T.W * 0.5) + T.ry * 0.2], [T.x + side * T.W * 0.92, yAt(T.x + side * T.W * 0.92)]],
          (x, y, r) => jig(mix('#1a0e05', '#4a2f18', r() * 0.6 + lightFn(x, y) * 0.2), r, 4), { lw: Math.max(0.8, 1.6 * sc * (1 - T.t * 0.6)), len: 4, density: 0.55, jitter: 0.5 });
      strokes(out, counter, {                            // the plate of foliage: dense, flat, lit along its top
        rng: sr, n: Math.min(2800, Math.round(T.W * 2 * T.ry * 2 / 1.5)),
        sample: r => { const u = (r() + r() + r()) / 3 * 2 - 1; const x = T.x + u * T.W * (1 + r() * 0.06);
                       if (r() < Math.pow(Math.abs(u), 4) * 0.6) return null;                    // the plate thins at its tips
                       return [x, yAt(x) + (r() - 0.5) * T.ry * 2.2 * (S.cone ? 1.2 : 1)]; },
        dir: (x, y) => (S.cone ? Math.atan2(0.42, x < T.x ? -1 : 1) : (x < T.x ? Math.PI : 0) + (x - T.x) / T.W * 0.18) + (sr() - 0.5) * 0.5,
        col: (x, y, r) => { const up = Math.max(0, Math.min(1, (yAt(x) - y) / (T.ry * 1.2) * 0.5 + 0.5)), fl = flankAt(x, T.x, T.W);
                            let c = ramp(CROWN, 0.22 + up * 0.5 + (fl - 0.5) * 0.2 + lightFn(x, y) * 0.22 + (fbm(x / 6, y / 5, 191) - 0.5) * 0.3 + (r() - 0.5) * 0.16);
                            c = mix(c, '#f7f0a2', Math.pow(up, 2) * 0.5 * (0.4 + lightFn(x, y) * 0.6)); c = mix(c, BELLY, Math.pow(1 - up, 2) * 0.55);
                            return jig(tint(c, x, y), r, 8); },
        len: 3.4 * p3, lw: 1.35 * p3, steps: 1, lenJ: 0.8, impasto: 0.6, op: 0.94, flow: 0,
      });
      const und = []; for (let k = 0; k <= 8; k++) { const x = T.x - T.W * 0.92 + T.W * 1.84 * k / 8; und.push([x, yAt(x) + T.ry * 1.05]); }
      paintPath(out, counter, sr, und, (x, y, r) => jig(mix('#06140c', CROWN[1], r() * 0.4), r, 4), { lw: 1.0 * p3, len: 3, density: 0.34, jitter: 0.9 });
    }
    if (S.cone) {                                        // the spire
      strokes(out, counter, { rng: sr, n: Math.round(24 * Math.pow(sc, 0.5) + 8),
        sample: r => { const v = r(); return [topX + Math.sin(lean) * h * 0.2 + (r() - 0.5) * h * 0.05 * (1 - v), baseY - h * (0.94 + v * 0.06)]; },
        dir: () => -Math.PI / 2 + (sr() - 0.5) * 0.5,
        col: (x, y, r) => jig(tint(ramp(CROWN, 0.5 + r() * 0.4 + lightFn(x, y) * 0.2), x, y), r, 6),
        len: 3 * p3, lw: 1.2 * p3, steps: 1, lenJ: 0.7, impasto: 0.5, op: 0.92, flow: 0 });
    }
    return;
  }

  if (S.form === 'spire') {
    // The cypress (Isa 55:13) — a dark flame, no trunk to speak of; the book's `spire` kind.
    const W = h * 0.095 * (0.9 + sr() * 0.3), y0 = baseY - h * 0.04;
    const swayA = (sr() - 0.5) * 0.5;
    const half = v => W * Math.pow(Math.max(0, Math.sin(Math.PI * Math.min(1, v * 1.15))), 0.85) * (1 + fbm(cx / 26, (y0 - v * h) / 24, 71) * 0.35) + 0.6;   // ⚠ sin(π) < 0 by a hair → pow → NaN (the tip went missing)
    const cAt = v => cx + Math.sin(v * 2.1) * W * 0.5 * swayA + lean * v * h * 0.3;
    const litSide = lightFn(cx - h * 0.3, y0 - h * 0.5) >= lightFn(cx + h * 0.3, y0 - h * 0.5) ? -1 : 1;
    strokes(out, counter, {
      rng: sr, n: Math.min(4200, Math.round(W * h / (1.5 / Math.pow(sc, 0.3)))),
      sample: r => { const v = Math.pow(r(), 0.85); const hw = half(v); return [cAt(v) + (r() + r() - 1) * hw, y0 - v * h * 0.96]; },
      dir: (x, y) => { const v = (y0 - y) / h; return -Math.PI / 2 + (x - cAt(v)) * 0.02 + Math.sin(v * 9) * 0.3 + (fbm(x / 8, y / 8, 47) - 0.5) * 0.6; },
      col: (x, y, r) => { const v = (y0 - y) / h; const hw = half(v); const s = (x - cAt(v)) / (hw + 0.1) * litSide;   // +1 lit flank, -1 shadow flank
                          let c = ramp(CROWN, 0.16 + s * 0.2 + fbm(x / 10, y / 10, 53) * 0.26 + lightFn(x, y) * 0.16 + (r() - 0.5) * 0.14);
                          c = mix(c, '#f7f0a2', Math.max(0, s) * 0.22 * lightFn(x, y)); c = mix(c, BELLY, 0.15 + Math.max(0, -s) * 0.45);
                          return jig(tint(c, x, y), r, 7); },
      len: (x, y) => 9 * Math.pow(sc, 0.5) * (0.7 + 0.5 * (y - (y0 - h)) / h), lw: 2.2 * Math.pow(sc, 0.4), steps: 3, follow: 0.95, lenJ: 0.5, wild: 0.06, impasto: 0.5, flow: 0,
    });
    const edge = []; for (let k = 0; k <= 10; k++) { const v = k / 10; edge.push([cAt(v) - litSide * half(v) * 0.95, y0 - v * h * 0.96]); }
    paintPath(out, counter, sr, edge, (x, y, r) => jig(mix('#06140c', CROWN[1], r() * 0.4), r, 4), { lw: 1.0 * p3, len: 3, density: 0.3, jitter: 0.9 });
    return;
  }

  if (S.form === 'umbrella') {
    // The shittah — the acacia the ark was made of (Ex 25:10), planted in the wilderness
    // (Isa 41:19): a bare trunk, three limbs opening like a hand, and a flat crown on them.
    const cy = topY - h * 0.2, RX = h * 0.5 * (0.88 + sr() * 0.28), RY = h * 0.075;
    for (const [fx, fy] of [[-0.42, 0.06], [0.44, 0.04], [0.05, -0.02]])
      paintPath(out, counter, sr, [[topX, topY], [topX + fx * RX * 0.5, topY - h * 0.1 + fy * h], [topX + fx * RX, cy + fy * h]],
        limbCol, { lw: 1.9 * sc, len: 4, density: 0.6, jitter: 0.5 });
    const flatTop = x => cy - RY * (1 - Math.pow(Math.abs(x - topX) / RX, 3) * 0.6);
    strokes(out, counter, {
      rng: sr, n: Math.min(3000, Math.round(RX * 2 * RY * 2 / 1.1)),
      sample: r => { const u = r() * 2 - 1; if (r() < Math.pow(Math.abs(u), 3) * 0.55) return null;
                     const x = topX + u * RX; const top = flatTop(x); return [x, top + Math.pow(r(), 1.5) * RY * 2.4]; },
      dir: (x) => (x < topX ? Math.PI : 0) + (x - topX) / RX * 0.12 + (sr() - 0.5) * 0.4,
      col: (x, y, r) => { const up = Math.max(0, Math.min(1, 1 - (y - flatTop(x)) / (RY * 2.2))), fl = flankAt(x, topX, RX);
                          let c = ramp(CROWN, 0.2 + up * 0.55 + (fl - 0.5) * 0.2 + lightFn(x, y) * 0.22 + (fbm(x / 7, y / 5, 191) - 0.5) * 0.28 + (r() - 0.5) * 0.16);
                          c = mix(c, '#f7f0a2', Math.pow(up, 2) * 0.5 * (0.4 + lightFn(x, y) * 0.6)); c = mix(c, BELLY, Math.pow(1 - up, 2) * 0.5);
                          if (r() < 0.02) c = '#f0dc8a';                                            // a few pale puffs of acacia flower
                          return jig(tint(c, x, y), r, 8); },
      len: 2.6 * p3, lw: 1.15 * p3, steps: 1, lenJ: 0.8, impasto: 0.55, op: 0.94, flow: 0,
    });
    const und = []; for (let k = 0; k <= 10; k++) { const x = topX - RX * 0.95 + RX * 1.9 * k / 10; und.push([x, flatTop(x) + RY * 2.3]); }
    paintPath(out, counter, sr, und, (x, y, r) => jig(mix('#06140c', CROWN[1], r() * 0.4), r, 4), { lw: 1.1 * p3, len: 3, density: 0.36, jitter: 0.9 });
    return;
  }
}

export function fruitTree(out, counter, rng, cx, baseY, h, w, leafCols, lightFn, fruit = 1, opts = {}) {
  const L = lightFn || (() => 0);
  // ⭐ AFTER HIS KIND (Sep 15). A page that has declared its wood (setSpeciesMix) or a tree that
  // names its species goes through paintTree, so the whole book's trees are one painter with
  // many silhouettes. The page's free colour stays: its leaf notes become the crown ramp.
  // Small far trees (h < 30) keep the old massed smudge — a species needs pixels to read.
  if (!opts.crownOnly && h >= 30 && (opts.species || opts.mix || SPECIES_MIX)) {
    return paintTree(out, counter, rng, cx, baseY, h * 1.12, {
      species: opts.species, mix: opts.mix, lightFn: L, crownCols: crownRamp(leafCols),
      blossom: fruit < 0.1 ? 0 : 3, blossomCols: opts.blossomCols, fruitK: Math.min(1, 0.35 + fruit * 0.65),
      shadowDir: opts.shadowDir == null ? 1 : opts.shadowDir, node: opts.node, tint: opts.tint });
  }
  const bare = opts.crownOnly || h < 18;
  let ccy, cw, ch, topAt = null;
  if (bare) {
    paintPath(out, counter, rng, [[cx, baseY], [cx + (rng() - 0.5) * w * 0.2, baseY - h * 0.46]],
      (x, y, r) => jig(mix('#241433', '#3a2a22', r()), r, 6), { lw: Math.max(2, w * 0.14), len: 6, density: 0.85, jitter: 0.5 });
    ccy = baseY - h * 0.62; cw = w; ch = h * 0.58;
  } else {
    const K = opts.kind || pickTreeKind(rng);
    const trunkH = h * K.trunk, lean = (rng() - 0.5) * h * (K.k === 'spread' ? 0.13 : 0.06);
    paintPath(out, counter, rng,
      [[cx, baseY], [cx + lean * 0.4, baseY - trunkH * 0.56], [cx + lean, baseY - trunkH]],
      (x, y, r) => { const g = L(x, y); let c = mix('#2a1a26', '#5c3c26', r()); c = mix(c, '#edc890', g * 0.42); return jig(c, r, 8); },
      { lw: Math.max(1.8, h * (K.k === 'spire' ? 0.045 : 0.070)), len: 6, density: 0.9, jitter: 0.45 });
    const crown = h * (1.2 - K.trunk) / 1.2 * (0.9 + rng() * 0.2);   // keeps the overall height
    cx += lean;
    topAt = [cx, baseY - trunkH, crown];
    ccy = (baseY - trunkH) - crown * 0.62;
    cw = w * (K.cwK / 0.46) * (0.85 + rng() * 0.34);
    ch = crown * 0.58;
  }
  // fruit and blossom must scale with the CROWN, not with the tree's full height —
  // the crown is now ~2/3 of h, so sizing off h made every dab a bauble.
  const fh = ch / 0.58;
  // NO TWO MARKS ALIKE — the canopy is a MASS of individual leaves: more of them,
  // each pulling its own colour across the WHOLE palette, each its own length and
  // angle, and each lit by where it sits in the crown (top catches, underside sinks).
  // ⚠ THE PAINTED TREES BRANCH TOO. Fred: "do paintTree too so the painted trees branch as
  // well." A trunk with one ellipse of leaves on it is a lollipop — and ten plates of them are
  // the same lollipop ten times. Each tree now grows a skeleton by the shared rule (limbs()),
  // and its foliage rides the skeleton: a central mass plus a cluster on each outer tip, so the
  // silhouette is this tree's and no other's. Rebuild a plate and its trees branch.
  const GFT = (opts.node || gAt('fruitTree', cx, baseY, h)).child('branch');
  let tipMass = [];
  if (!bare && topAt) {
    const tps = limbs(out, counter, rng, GFT, topAt[0], topAt[1], {
      len0: topAt[2] * 0.42, lw0: Math.max(1.1, h * 0.028), minLen: h * 0.05,
      maxDepth: h < 40 ? 2 : h < 90 ? 3 : 4,
      col: (x, y, r) => { const g = L(x, y); let c = mix('#2a1a26', '#5c3c26', r() * 0.8); c = mix(c, '#edc890', g * 0.3); return jig(c, r, 8); },
      pathOpts: { len: 5, density: 0.7, jitter: 0.45 },
    });
    tipMass = spreadTips(tps, 3, Math.max(4, cw * 0.55));
  }
  const mass = (mx, my, mw, mh, R2) => strokes(out, counter, {
    rng: R2, n: Math.round(mw * mh / 2.4),
    sample: r => { const a = r() * Math.PI * 2, dd = Math.pow(r(), 0.5); return [mx + Math.cos(a) * mw * dd, my - Math.sin(a) * mh * dd]; },
    dir: (x, y) => -Math.PI / 2 + (fbm(x / 9, y / 9, 151) - 0.5) * 2.3,
    col: (x, y, r) => {
      const g = L(x, y);
      const lift = (my - y) / (mh * 2) + 0.5;                     // crown lit, underside deep
      let c = ramp(leafCols, fbm(x / 11, y / 11, 153) * 0.62 + r() * 0.46);
      c = mix(c, '#fbe79a', g * 0.85 + Math.max(0, lift - 0.5) * 0.5);
      c = mix(c, '#12331e', Math.max(0, 0.5 - lift) * 0.5);
      return jig(c, r, 15);
    },
    len: (x, y) => (4 + h * 0.035) * (0.7 + fbm(x / 7, y / 7, 157) * 0.9),
    lw: 2.5, steps: 2, lenJ: 0.6, wJ: 0.45, wild: 0.08, impasto: 0.4,
  });
  // the central mass is EXACTLY what it was — same size, same stream position — so a rebuilt
  // plate is its old self plus branches. The tip clusters ride their own genome stream.
  mass(cx, ccy, cw, ch, rng);
  const CR = GFT.child('crowns').rng();
  for (const t of tipMass) mass(t[0], t[1], cw * 0.44, ch * 0.46, CR);
  for (let i = 0; i < Math.round(cw * 0.9 * Math.min(1, fh / 90) * fruit); i++) {   // FRUIT — fat bright dabs that glow (thinned on distant trees)
    const a = rng() * Math.PI * 2, dd = Math.pow(rng(), 0.42);
    const fx2 = cx + Math.cos(a) * cw * dd * 0.92, fy3 = ccy - Math.sin(a) * ch * dd * 0.92;
    // FRUIT MUST SCALE WITH THE TREE. At a flat 3–5px, a distant 25px tree got fruit
    // nearly as wide as its own canopy — the tree stopped reading as green foliage and
    // became a ball of coloured dots. A child has to be able to say "tree" first.
    const fr = Math.max(0.8, fh * 0.034 + rng() * fh * 0.02);
    const fc = FRUIT_COLS[Math.floor(rng() * FRUIT_COLS.length)], lit = L(fx2, fy3);
    out.push(ribbon([[fx2 - fr * 0.62, fy3 + fr * 0.5], [fx2 + fr * 0.7, fy3 + fr * 0.42]], fr * 1.5, mix(fc, DARKEST, 0.42))); counter.n++;   // shadow underside → the dab reads as a round fruit, not a flat spot
    out.push(ribbon([[fx2 - fr * 0.7, fy3], [fx2 + fr * 0.7, fy3]], fr * 1.8, mix(fc, '#fff0c0', lit * 0.5))); counter.n++;
    out.push(ribbon([[fx2 - fr * 0.28, fy3 - fr * 0.28], [fx2, fy3 - fr * 0.12]], fr * 0.6, '#fff6dc')); counter.n++;
  }
  /* ⚠ THE BLOSSOMS IGNORE THE `fruit` DIAL — and they are the thing that makes a wood look
     like a sweetshop. A caller who asked for fruit 0.02 (a dark country at dawn, not an
     orchard) still got cw*0.4 pale pink dabs per crown. `blossomCols` lets the page choose
     the palette. It replaces the array only: the SAME three rng calls are spent per blossom
     whatever is passed, so no existing plate moves by a single mark. */
  const BCOLS = opts.blossomCols || BLOSSOM_COLS;
  for (let i = 0; i < Math.round(cw * 0.4); i++) {        // blossoms of every colour
    const a = rng() * Math.PI * 2, dd = Math.pow(rng(), 0.5);
    const bx2 = cx + Math.cos(a) * cw * dd, by2 = ccy - Math.sin(a) * ch * dd;
    const bc = BCOLS[Math.floor(rng() * BCOLS.length)];
    out.push(ribbon([[bx2 - 1.6, by2 + 1.2], [bx2 + 1.7, by2 + 1.0]], 2.1, mix(bc, DARKEST, 0.4))); counter.n++;   // shadow underside
    out.push(ribbon([[bx2 - 1.8, by2], [bx2 + 1.8, by2]], 2.5, bc)); counter.n++;
  }
}

// a lush jewel bush (rounded mound of free-colour foliage, gold-lit by lightFn)
export function jewelBush(out, counter, rng, bx, by, w, h, cols, lightFn) {
  const L = lightFn || (() => 0);
  strokes(out, counter, {
    rng, n: Math.round(w * 5.2),                                   // a MASS of leaves, not a tint
    sample: r => { const a = r() * Math.PI * 2, dd = Math.pow(r(), 0.62); return [bx + Math.cos(a) * w * dd, by - Math.abs(Math.sin(a)) * h * dd]; },
    dir: (x, y) => -Math.PI / 2 + (fbm(x / 8, y / 8, 259) - 0.5) * 2.1,
    col: (x, y, r) => {
      const g = L(x, y);
      const lift = (by - y) / (h * 1.6);
      let c = ramp(cols, fbm(x / 9, y / 9, 261) * 0.7 + r() * 0.5);
      c = mix(c, '#f0d27a', g * 0.7 + Math.max(0, lift - 0.5) * 0.4);
      c = mix(c, '#14301f', Math.max(0, 0.45 - lift) * 0.45);
      return jig(c, r, 13);
    },
    len: (x, y) => 5 * (0.7 + fbm(x / 6, y / 6, 263) * 1.0), lw: 2.2, steps: 2, lenJ: 0.6, wJ: 0.4, wild: 0.06,
  });
}

/* ══ THE VINE ══════════════════════════════════════════════════════════════════════════════
   "I am the true vine, and my Father is the husbandman" (John 15:1). "I am the vine, ye are the
   branches: He that abideth in me, and I in him, the same bringeth forth much fruit" (15:5).
   "Every branch that beareth fruit, he purgeth it, that it may bring forth more fruit" (15:2).
   A vine cannot hold itself up: it is CARRIED. So a husbandman's frame — two posts and a beam,
   made, so straight (Munch) — and on it the living thing, which never draws a straight line:
   one old twisted stock climbing the near post, its arm laid along the beam, shoots arching out
   of the arm, broad five-fingered leaves in a roof over it, the clusters hanging UNDER the
   leaves in the shade where grapes ripen, and tendrils reaching for the next hold.
   One stock, many branches, the fruit on the branches: the verse, drawn.
   (x0..x1 = the frame; baseY = the ground; h = its height.) Own rng stream.                    */
export function paintVine(out, counter, rng, x0, x1, baseY, h, { lightFn = null } = {}) {
  const L = lightFn || (() => 0.6), put = str => { out.push(str); counter.n++; };
  const topY = baseY - h, span = x1 - x0, u = h / 60;
  // its shadow on the grass
  strokes(out, counter, { rng, n: Math.round(span * 0.7), sample: r => [x0 + r() * span + 6 * u, baseY + 2 * u + r() * 7 * u], dir: () => 0.05,
    col: (x, y, r) => jig(mix('#1e3f22', '#12281a', r() * 0.6), r, 5), len: 9 * u, lw: 3 * u, steps: 2, relief: 0, op: 0.4, flow: 0 });
  // the frame — the husbandman's work
  const post = (px) => { put(ribbon([[px, baseY + 1], [px, topY - 2 * u]], 3.4 * u, '#5a3d22'));
                         put(ribbon([[px - 0.9 * u, baseY], [px - 0.9 * u, topY - 1 * u]], 0.9 * u, mix('#b08850', '#e6c890', L(px, topY)))); };
  post(x0); post(x1); if (span > 84 * u) post((x0 + x1) / 2);
  put(ribbon([[x0 - 5 * u, topY], [x1 + 5 * u, topY]], 3 * u, '#5a3d22'));
  put(ribbon([[x0 - 5 * u, topY - 0.9 * u], [x1 + 5 * u, topY - 0.9 * u]], 0.8 * u, mix('#b08850', '#e6c890', L((x0 + x1) / 2, topY))));
  // the STOCK: old wood, twisting up the near post, then its arm along the beam
  const stock = []; for (let k = 0; k <= 10; k++) { const t = k / 10; stock.push([x0 + 5 * u + Math.sin(t * 7.5) * 3.4 * u * (1 - t * 0.4), baseY - t * (h - 1 * u)]); }
  put(ribbon(stock, 4.6 * u, '#2f1e12', [1, 0.9, 0.8, 0.7, 0.62, 0.56, 0.5, 0.46, 0.42, 0.4, 0.38]));
  put(ribbon(stock.map(q => [q[0] - 1.1 * u, q[1]]), 1 * u, mix('#7a5a38', '#c49a64', L(x0, baseY - h / 2)), [1, 0.8, 0.6, 0.5, 0.45, 0.4, 0.4, 0.35, 0.3, 0.3, 0.3]));
  const arm = []; for (let k = 0; k <= 14; k++) { const t = k / 14; arm.push([x0 + 5 * u + t * (span - 8 * u), topY - 2.2 * u + Math.sin(t * 11) * 1.5 * u]); }
  put(ribbon(arm, 2.6 * u, '#3a2616', arm.map((_, i) => 1 - i / arm.length * 0.55)));
  // one broad leaf: five fingers from a point, the middle one longest — crown warm, belly deep
  const leaf = (lx, ly, sz, ang) => {
    const lit = Math.max(0, Math.min(1, L(lx, ly))), up = Math.max(0, Math.min(1, (topY + 4 * u - ly) / (10 * u)));
    const c = mix(ramp(['#143d1c', '#1f5a26', '#2f7a30', '#4f9a3c', '#86bc52'], 0.2 + up * 0.5 + lit * 0.25 + rng() * 0.2), '#f4ec9a', up * up * 0.3 * (0.4 + lit * 0.6));
    [-1.15, -0.58, 0, 0.58, 1.15].forEach((d, i) => { const a = ang + d, ln = sz * [0.62, 0.86, 1, 0.86, 0.62][i];
      put(ribbon([[lx, ly], [lx + Math.cos(a) * ln * 0.55, ly + Math.sin(a) * ln * 0.55], [lx + Math.cos(a) * ln, ly + Math.sin(a) * ln]], sz * 0.46, c, [0.5, 1, 0.1])); });
    put(ribbon([[lx, ly], [lx + Math.cos(ang) * sz * 0.8, ly + Math.sin(ang) * sz * 0.8]], sz * 0.07, mix(c, '#e6f0a8', 0.55)));   // the midrib
  };
  // one cluster: berries in a hanging cone, each with its bloom of light — and a stalk to hang by
  const cluster = (gx, gy, sz) => {
    put(ribbon([[gx, topY - 1 * u], [gx + (rng() - 0.5) * 2 * u, gy]], 0.7 * u, '#3f5a24'));
    const rows = [3, 4, 3, 3, 2, 1], br = sz * 0.19;
    rows.forEach((n, ri) => { for (let k = 0; k < n; k++) {
      const bx = gx + (k - (n - 1) / 2) * br * 1.7 + (rng() - 0.5) * br * 0.5, by = gy + ri * br * 1.55 + (rng() - 0.5) * br * 0.4;
      const c = mix(['#3f1d5c', '#5a2a7a', '#6e3a92', '#4a2468'][(rng() * 4) | 0], '#1a0f2a', ri < 1 ? 0.25 : 0);
      daub(out, counter, bx + br * 0.2, by + br * 0.3, br * 0.95, '#160c22', rng);        // the shade between the berries
      daub(out, counter, bx, by, br, c, rng);
      put(`<circle cx="${R1(bx - br * 0.3)}" cy="${R1(by - br * 0.32)}" r="${R1(Math.max(0.3, br * 0.3))}" fill="#d8c8f4" opacity="${(0.5 + L(bx, by) * 0.4).toFixed(2)}"/>`);
    } });
  };
  // shoots arching out of the arm; the clusters hang first (in the shade), the leaf roof over them
  const NS = Math.max(5, Math.round(span / (13 * u)));
  const hangs = [];
  for (let i = 0; i < NS; i++) {
    const sx = x0 + 8 * u + (i + rng() * 0.6) / NS * (span - 14 * u), dirn = rng() < 0.5 ? -1 : 1, len = (9 + rng() * 9) * u;
    const ex = sx + dirn * len * 0.7, ey = topY - 3 * u - len * 0.35 + rng() * 5 * u;
    put(ribbon([[sx, topY - 2 * u], [sx + dirn * len * 0.3, topY - 4 * u - len * 0.35], [ex, ey]], 1.1 * u, '#5a6a2a', [1, 0.7, 0.3]));
    if (rng() < 0.75) hangs.push([sx + (rng() - 0.5) * 6 * u, topY + (4 + rng() * 7) * u, (8 + rng() * 5) * u]);
    if (rng() < 0.5) { const tx = ex, ty = ey; let d = `M${R1(tx)} ${R1(ty)}`;                                   // a tendril, curling
      for (let k = 1; k <= 9; k++) { const a = k * 0.95 * dirn, rr = (3.4 - k * 0.3) * u; d += `L${R1(tx + dirn * k * 0.8 * u + Math.cos(a) * rr)} ${R1(ty - k * 0.4 * u + Math.sin(a) * rr)}`; }
      put(`<path d="${d}" stroke="#9ec458" stroke-width="${R1(Math.max(0.35, 0.5 * u))}" fill="none" stroke-linecap="round" opacity="0.9"/>`); }
  }
  for (const [gx, gy, sz] of hangs) cluster(gx, gy, sz);
  const NLf = Math.round(span / (3.1 * u));
  for (let i = 0; i < NLf; i++) {
    const lx = x0 - 2 * u + rng() * (span + 4 * u), ly = topY - 2 * u + (rng() + rng() - 1) * 7.5 * u;
    leaf(lx, ly, (5.2 + rng() * 3.4) * u, -Math.PI / 2 + (rng() - 0.5) * 2.6 + (ly > topY ? Math.PI : 0) * (rng() < 0.6 ? 1 : 0));
  }
  for (let i = 0; i < 5; i++) { const t = 0.25 + i * 0.15 + rng() * 0.06, q = stock[Math.min(10, Math.round(t * 10))];    // a few leaves up the stock
    leaf(q[0] + (i % 2 ? 3 : -3) * u, q[1], (4.2 + rng() * 2) * u, (i % 2 ? -0.3 : Math.PI + 0.3)); }
}

/* ══ THE SEVEN STARS AND ORION ═════════════════════════════════════════════════════════════
   "Seek him that maketh the seven stars and Orion, and turneth the shadow of death into the
   morning" (Amos 5:8). "Which maketh Arcturus, Orion, and Pleiades" (Job 9:9). "Canst thou bind
   the sweet influences of Pleiades, or loose the bands of Orion?" (Job 38:31).
   Scripture names these two by NAME, so they are not a scatter: they are drawn where they are.
   Orion as he stands in the evening sky — Betelgeuse at his shoulder burning orange, Rigel at
   his foot blue-white and brightest, the three of the belt in their slant line, the sword
   hanging from it — and the Pleiades as the small tight dipper they are, in a breath of blue.
   `size` is Orion's height (the Pleiades' width is size × 0.22). Heavenly lights: true circles. */
const ORION = [   // [x, y, magnitude 0 bright .. 4 faint, colour]
  [-0.30, -0.42, 0.4, '#ffb070'], [0.26, -0.46, 1.6, '#dfe8ff'], [0.0, -0.62, 3.3, '#e8ecff'],
  [-0.13, 0.02, 1.8, '#e2ebff'], [-0.01, -0.03, 1.7, '#e2ebff'], [0.11, -0.08, 2.2, '#e2ebff'],
  [-0.20, 0.47, 2.1, '#e2ebff'], [0.30, 0.42, 0.1, '#cfe0ff'],
  [-0.045, 0.14, 3.6, '#e8ecff'], [-0.035, 0.20, 3.2, '#f0d8ff'], [-0.025, 0.26, 3.6, '#e8ecff'],
];
const PLEIADES = [[0, 0, 2.6], [-0.34, 0.02, 3.4], [-0.37, -0.08, 3.9], [0.22, -0.16, 3.6], [0.34, 0.04, 3.5], [0.16, 0.12, 3.8], [0.32, -0.26, 3.9]];
export function paintConstellation(out, counter, which, cx, cy, size, { op = 1 } = {}) {
  const put = str => { out.push(str); counter.n++; };
  const star = (x, y, mag, col) => {
    const r = Math.max(0.5, (1.9 - mag * 0.36)) * Math.max(0.7, size / 80);
    if (mag < 2.4) { put(`<circle cx="${R1(x)}" cy="${R1(y)}" r="${R1(r * 3.4)}" fill="${col}" opacity="${(0.09 * op).toFixed(3)}"/>`);
                     put(`<circle cx="${R1(x)}" cy="${R1(y)}" r="${R1(r * 1.8)}" fill="${col}" opacity="${(0.18 * op).toFixed(3)}"/>`); }
    if (mag < 0.8) for (const [ang, lk] of [[Math.PI / 2, 1], [0, 0.6]]) {
      const dx = Math.cos(ang) * r * 4.6 * lk, dy = Math.sin(ang) * r * 4.6 * lk;
      put(ribbon([[x - dx, y - dy], [x, y], [x + dx, y + dy]], r * 0.5, col, [0.04, 1, 0.04]).replace('<path ', `<path opacity="${(0.75 * op).toFixed(2)}" `));
    }
    put(`<circle cx="${R1(x)}" cy="${R1(y)}" r="${R1(r)}" fill="${col}" opacity="${Math.min(1, (1.05 - mag * 0.14) * op).toFixed(2)}"/>`);
    if (mag < 3) put(`<circle cx="${R1(x)}" cy="${R1(y)}" r="${R1(r * 0.45)}" fill="#ffffff" opacity="${Math.min(1, op).toFixed(2)}"/>`);
  };
  if (which === 'orion') for (const [x, y, m, c] of ORION) star(cx + x * size, cy + y * size, m, c);
  else {
    const w = size * 0.22;
    put(`<circle cx="${R1(cx)}" cy="${R1(cy - w * 0.05)}" r="${R1(w * 0.62)}" fill="#9fb8ff" opacity="${(0.10 * op).toFixed(3)}"/>`);   // the breath of blue they sit in
    for (const [x, y, m] of PLEIADES) star(cx + x * w, cy + y * w, m + 0.2, '#dbe6ff');
  }
}

/** A CUT STONE — table + four bevels, upper-left lit, lower-right falling away, one glint. A made
 *  thing, so it is straight (Munch). Shared by anything that lays precious stones. */
export function cutGem(out, counter, x0, y0, x1, y1, stone, { glint = 0.85 } = {}) {
  const pt = (x, y) => `${R1(x)} ${R1(y)}`, put = str => { out.push(str); counter.n++; };
  const bv = Math.min(x1 - x0, y1 - y0) * 0.3, ix0 = x0 + bv, ix1 = x1 - bv, iy0 = y0 + bv, iy1 = y1 - bv;
  put(`<path d="M${pt(x0, y0)}L${pt(x1, y0)}L${pt(ix1, iy0)}L${pt(ix0, iy0)}Z" fill="${mix(stone, '#ffffff', 0.55)}"/>`);
  put(`<path d="M${pt(x0, y0)}L${pt(ix0, iy0)}L${pt(ix0, iy1)}L${pt(x0, y1)}Z" fill="${mix(stone, '#ffffff', 0.3)}"/>`);
  put(`<path d="M${pt(x1, y0)}L${pt(x1, y1)}L${pt(ix1, iy1)}L${pt(ix1, iy0)}Z" fill="${mix(stone, '#0e1230', 0.32)}"/>`);
  put(`<path d="M${pt(x0, y1)}L${pt(ix0, iy1)}L${pt(ix1, iy1)}L${pt(x1, y1)}Z" fill="${mix(stone, '#0e1230', 0.5)}"/>`);
  put(`<rect x="${R1(ix0)}" y="${R1(iy0)}" width="${R1(ix1 - ix0)}" height="${R1(iy1 - iy0)}" fill="${stone}"/>`);
  put(`<path d="M${pt(ix0 + (ix1 - ix0) * 0.12, iy1 - (iy1 - iy0) * 0.2)}L${pt(ix0 + (ix1 - ix0) * 0.42, iy0 + (iy1 - iy0) * 0.18)}" stroke="#ffffff" stroke-width="${R1(Math.max(0.5, (y1 - y0) * 0.08))}" stroke-linecap="round" opacity="${glint}" fill="none"/>`);
}

/* ══ A LILY OF THE FIELD ═══════════════════════════════════════════════════════════════════
   "Consider the lilies of the field, how they grow; they toil not, neither do they spin: and yet
   I say unto you, That even Solomon in all his glory was not arrayed like one of these"
   (Matt 6:28-29). Sep 21 — if He says a lily outshines the king whose house we have just hung
   with gold and jewels, then the lily gets MORE craft than the palace, not less. The book's
   lilies were three flat white petals on a stroke. This one is built the way the flower is:
     · a stem that bows under its own head, a lit thread down its light side;
     · narrow leaves climbing it alternately, longest low, each with a paler upper edge;
     · SIX tepals — three behind (in shade, cooler) and three in front — every one a curved
       blade that recurves at its tip, with a green-grey midrib and one lit margin;
     · a gold-green throat; six filaments with RUST anthers (the mark everybody remembers of
       a lily); one longer pistil with a green stigma;
     · and, on the taller ones, a bud still closed beside the open flower — "how they GROW".
   Living thing, so every line of it curves (Munch). Own rng: it never disturbs the plate.   */
/* ⭐ Sep 23 — THE HEN AND HER CHICKENS (Matt 23:37). Jesus's own picture of how He loves: "how
   often would I have gathered thy children together, even as a hen gathereth her chickens under
   her wings." Drawn in a local frame (feet at 0,0; ~28 units tall; facing LEFT), placed by one
   transform. Body before paint: flat masses first (breast, body, wing, tail), then feather marks
   laid along the form, lit from the upper `lightSide` (+1 right / -1 left). The wing is LOWERED
   and spread, a tent over the chicks — two heads peek out from under its edge, one stands at
   her breast. `facing` +1 turns her to face right. */
export function paintHen(out, counter, rng, x, y, h, { facing = -1, chicks = 3, lightSide = 1, white = false } = {}) {
  // `white`: a white hen — on a bright green meadow a brown one has no value against the grass (love, Sep 23)
  const BODY = white ? ['#5c5a6e', '#8e8a9c', '#c9c4c4', '#ebe6dc', '#fbf8ee', '#ffffff'] : ['#5a2c22', '#8a4526', '#b8682f', '#dc9446', '#f4c47a', '#fbe0a6'];
  const WING = white ? ['#8a8698', '#b4aeb4', '#dcd6cc', '#fbf6ea'] : ['#6a3420', '#8f4a26', '#c07436', '#eab36a'];
  const s = h / 28, fx = facing < 0 ? 1 : -1;          // local frame faces LEFT; mirror for right
  const lit = lightSide * fx;                           // light side in LOCAL x
  const P = (pts) => 'M' + pts.map(([a, b]) => R1(a) + ' ' + R1(b)).join('L') + 'Z';
  const blob = (cx, cy, rx, ry, n = 18, wob = 0.08) => { const pts = []; for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; const k = 1 + (rng() - 0.5) * wob; pts.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]); } return pts; };
  groundShadow(out, counter, x + 1.5 * s * (lit > 0 ? -1 : 1) * fx, y + 0.6 * s, 14 * s, 2.4 * s, { dir: -lightSide * 0.6, reach: 1, op: 0.55, tint: '#27304e' });
  out.push(`<g transform="translate(${R1(x)} ${R1(y)}) scale(${(s * fx).toFixed(3)} ${s.toFixed(3)})">`);
  const mark = (x0, y0, x1, y1, w, c) => { out.push(ribbon([[x0, y0], [(x0 + x1) / 2 + (rng() - 0.5) * 0.4, (y0 + y1) / 2], [x1, y1]], w, c, [0.55, 0.5, 0.12])); counter.n++; };
  // ⚠ SHE SITS. First cut stood her on yellow legs with the chicks between them — a hen
  // gathering her chickens is crouched down over them, belly to the ground, legs hidden, the
  // wing spread down to the grass. Everything of hers is drawn 5 units lower (SIT).
  const SIT = 5;
  out.push(`<g transform="translate(0 ${SIT})">`);
  // TAIL — up and back, darkest, with a green-black sheen on its sickles
  out.push(`<path d="${P([[7, -12], [11.5, -24.5], [15, -27], [16.5, -22], [14.5, -15], [11, -9]])}" fill="${white ? '#c9c2bc' : '#4a2a20'}"/>`); counter.n++;
  for (let i = 0; i < 7; i++) { const t = i / 6; mark(9 + t * 3, -12 - t * 2, 12 + t * 3.6, -25 + t * 7, 1.1, white ? (i % 2 ? '#f4f0e8' : '#a8a2a6') : (i % 3 === 0 ? '#2f4a3c' : (i % 2 ? '#5e3322' : '#3a2019'))); }
  // BODY + BREAST — one round mass, then the neck and head
  out.push(`<path d="${P(blob(1.5, -12.5, 11, 7.6))}" fill="${white ? '#d6d0c6' : '#b8682f'}"/>`); counter.n++;
  out.push(`<path d="${P([[-9.5, -13], [-10.5, -18], [-9.6, -22.5], [-7, -24.8], [-4.8, -23], [-4.6, -18], [-3.5, -13]])}" fill="${white ? '#e6e0d4' : '#c47634'}"/>`); counter.n++;
  // feather marks along the form: lit on top and on the light side, deep on the belly
  for (let i = 0; i < 150; i++) {
    const a = rng() * Math.PI * 2, d = Math.sqrt(rng());
    let px, py;
    if (rng() < 0.72) { px = 1.5 + Math.cos(a) * 10.5 * d; py = -12.5 + Math.sin(a) * 7.2 * d; }
    else { px = -7 + (rng() - 0.5) * 5; py = -13 - rng() * 11; }
    const up = Math.max(0, Math.min(1, (-py - 5) / 18)), side = Math.max(0, Math.min(1, 0.5 + (px - 1) * lit / 18));
    const k = up * 0.6 + side * 0.4;
    const c = ramp(BODY, 0.08 + k * 0.9 + (rng() - 0.5) * 0.12);
    const ang = Math.atan2(py + 12.5, px - 1.5) + Math.PI / 2 * (px < -3 ? 0.3 : 1);   // feathers lie back along the body
    const L = 1.4 + rng() * 1.4;
    mark(px, py, px + Math.cos(ang) * L, py + Math.sin(ang) * L * 0.6, 0.9 + rng() * 0.6, c);
  }
  // HEAD — comb, wattle, beak, eye (the four things that say HEN to a child)
  out.push(`<path d="${P(blob(-7.8, -23, 3.3, 3.0, 12, 0.05))}" fill="${white ? '#f2eee4' : '#c9793a'}"/>`); counter.n++;
  out.push(`<path d="${P([[-10.2, -25.4], [-10, -28], [-9, -26.6], [-8.2, -28.8], [-7.3, -26.6], [-6.3, -28.3], [-5.9, -25.4]])}" fill="#d8323a"/>`); counter.n++;   // comb
  out.push(`<path d="${P(blob(-10.4, -19.8, 1.2, 1.9, 10, 0.1))}" fill="#c82a32"/>`); counter.n++;                                                                  // wattle
  out.push(`<path d="${P([[-10.8, -23.4], [-13.9, -22.4], [-10.8, -21.6]])}" fill="#e7a332"/>`); counter.n++;                                                       // beak
  out.push(`<circle cx="-8.9" cy="-23.6" r="0.75" fill="#1a120e"/><circle cx="-8.7" cy="-23.9" r="0.28" fill="#fff6e0"/>`); counter.n += 2;
  // CHICKS first under the wing (so the wing laps over their backs), one at her breast
  const chick = (cx, cy, r, look, only) => {
    out.push(`<path d="${P(blob(cx, cy, r, r * 0.9, 12, 0.14))}" fill="#f4c93e"/>`); counter.n++;
    for (let i = 0; i < 12; i++) { const a = rng() * Math.PI * 2, d = Math.sqrt(rng()) * r * 0.9; const up = Math.max(0, -Math.sin(a)) * d / r; mark(cx + Math.cos(a) * d, cy + Math.sin(a) * d, cx + Math.cos(a) * (d + 0.6), cy + Math.sin(a) * (d + 0.6), 0.7, up > 0.3 ? '#fff0a0' : (Math.sin(a) > 0.4 ? '#d9a032' : '#ffe06a')); }
    if (only !== 'body') {
      out.push(`<path d="${P([[cx + look * r * 0.85, cy - r * 0.15], [cx + look * (r + 1.3), cy + 0.05], [cx + look * r * 0.85, cy + r * 0.3]])}" fill="#ee8a2a"/>`); counter.n++;
      out.push(`<circle cx="${R1(cx + look * r * 0.38)}" cy="${R1(cy - r * 0.28)}" r="${(0.5).toFixed(2)}" fill="#1a120e"/>`); counter.n++;
    }
  };
  const nC = Math.max(0, chicks);
  if (nC > 0) chick(-6.2, -2.6 - SIT, 2.4, -1);      // peeking out from under the wing's front edge
  if (nC > 1) chick(11.6, -2.3 - SIT, 2.1, 1);       // and one out the back, the other way
  // THE WING — lowered and spread, a tent over them: a darker scalloped fan in three tiers
  const wing = [[-4.5, -15.5], [3, -18.5], [10.5, -16], [13, -10.5], [11, -5.4], [7, -5.8], [3, -5.0], [-1.4, -5.6], [-5.2, -7.4]];   // spread down to the grass
  out.push(`<path d="${P(wing)}" fill="${white ? '#bdb6b6' : '#8f4a26'}"/>`); counter.n++;
  for (let tier = 0; tier < 3; tier++) {
    const yT = -15 + tier * 3, n = 6 + tier;
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1), wx = -3.6 + t * 14 - tier * 0.4, wy = yT + Math.sin(t * Math.PI) * -0.8 + t * 1.6;
      const c = ramp(WING, (tier === 0 ? 0.55 : 0.3) + (lit > 0 ? t : 1 - t) * 0.35 + (rng() - 0.5) * 0.1);
      out.push(ribbon([[wx, wy], [wx + 1.2, wy + 2.2], [wx + 2.4, wy + 2.6]], 2.2 - tier * 0.25, c, [0.4, 0.8, 0.3])); counter.n++;
    }
  }
  // the wing's lit upper edge
  out.push(ribbon([[-4, -15.4], [3, -18.2], [10, -15.8]], 0.9, white ? '#ffffff' : (lit > 0 ? '#f6cf8a' : '#d89a58'), [0.3, 0.8, 0.3])); counter.n++;
  if (nC > 2) chick(-14.5, -2.5 - SIT, 2.5, 1);      // the third stands at her breast, looking back up at her
  if (nC > 3) chick(-19, -2.3 - SIT, 2.2, 1);
  out.push('</g>');   // SIT
  out.push('</g>');
}

export function paintLily(out, counter, rng, x, y, h, { lean = 0, lightFn = null, bud = null } = {}) {
  const q = (px, py) => `${R1(px)} ${R1(py)}`;
  const put = str => { out.push(str); counter.n++; };
  const lit = lightFn ? Math.max(0, Math.min(1, lightFn(x, y - h))) : 0.6;
  const tx = x + lean, ty = y - h, s = Math.max(4.5, h * 0.36);
  const side = lean >= 0 ? 1 : -1;
  const stemAt = t => { const u = 1 - t, cxm = x + lean * 0.25, cym = y - h * 0.6;          // quadratic, foot → throat
    return [u * u * x + 2 * u * t * cxm + t * t * tx, u * u * y + 2 * u * t * cym + t * t * ty]; };
  // ⚠ SECOND CUT. The first lily was a FERN WITH A DAISY ON IT: leaves in matched pairs at one
  // angle (a frond), and tepals splayed ±70° from upright (a flat star seen from above). Two
  // facts of the plant fix it. Its leaves SPIRAL up the stem — so from any one side, some reach
  // left, some right, and some point at you and look short. And its flower is a TRUMPET that
  // nods outward: the tepals leave the throat close to the flower's own axis, run out long,
  // and only curl back at their tips.
  const nL = Math.max(4, Math.round(h / 5));
  for (let i = 0; i < nL; i++) {
    const t = 0.06 + (i / nL) * 0.66, [lx, ly] = stemAt(t);
    const ph = i * 2.39996 + rng() * 0.5, reach = Math.cos(ph);                              // the golden angle, seen side-on
    const L = s * (1.5 - t * 0.9) * (0.75 + rng() * 0.4), a = -Math.PI / 2 + reach * (0.95 + rng() * 0.25);
    const ex = lx + Math.cos(a) * L * (0.35 + 0.65 * Math.abs(reach)), ey = ly + Math.sin(a) * L * 0.9 + L * 0.22 * Math.abs(reach);
    const mx2 = (lx + ex) / 2 + reach * L * 0.1, my2 = (ly + ey) / 2 - L * 0.16;
    const back = Math.sin(ph) < 0;                                                           // leaves on the far side are darker
    put(ribbon([[lx, ly], [mx2, my2], [ex, ey]], Math.max(0.9, h * 0.042), mix(back ? '#174a24' : '#25662e', '#4a9440', (back ? 0.1 : 0.3) + lit * 0.4 + rng() * 0.2), [0.5, 1, 0.08]));
    if (!back) put(ribbon([[lx, ly - 0.3], [mx2, my2 - 0.4], [ex, ey - 0.2]], Math.max(0.4, h * 0.014), mix('#8fc25a', '#d8ec9a', lit), [0.2, 1, 0.1]));
  }
  // the stem, and the light down one side of it
  const SP = []; for (let k = 0; k <= 8; k++) SP.push(stemAt(k / 8));
  put(ribbon(SP, Math.max(1.2, h * 0.052), '#1f5a2c', [1, 0.85, 0.6]));
  put(ribbon(SP.map(pt => [pt[0] - side * Math.max(0.3, h * 0.012), pt[1]]), Math.max(0.5, h * 0.018), mix('#6fae48', '#cfe68a', lit), [1, 0.8, 0.5]));
  // one tepal: a long blade leaving the throat near the flower's axis, recurving at its tip
  const ax = -Math.PI / 2 + side * 0.62;                                                     // the trumpet nods outward
  const tepal = (off, len, front) => {
    const ang = ax + off, dx = Math.cos(ang), dy = Math.sin(ang), nx = -dy, ny = dx, w = len * 0.2;
    const curl = Math.sign(off || 1) * len * 0.34;                                           // tips roll AWAY from the axis
    const tip = [tx + dx * len + nx * curl, ty + dy * len + ny * curl];
    const b1 = [tx + dx * len * 0.25 + nx * w * 0.5, ty + dy * len * 0.25 + ny * w * 0.5], b2 = [tx + dx * len * 0.25 - nx * w * 0.5, ty + dy * len * 0.25 - ny * w * 0.5];
    const c1 = [tx + dx * len * 0.72 + nx * (w + curl * 0.35), ty + dy * len * 0.72 + ny * (w + curl * 0.35)];
    const c2 = [tx + dx * len * 0.72 - nx * (w - curl * 0.35), ty + dy * len * 0.72 - ny * (w - curl * 0.35)];
    const away = Math.max(0, -(nx * Math.sign(off || 1)) * side) * 0.4 + (front ? 0 : 0.35);  // far and turned-away blades are cooler
    const body = mix('#fffdf6', '#c6c4de', Math.min(0.75, away));
    put(`<path d="M${q(tx, ty)}L${q(b1[0], b1[1])}Q${q(c1[0], c1[1])} ${q(tip[0], tip[1])}Q${q(c2[0], c2[1])} ${q(b2[0], b2[1])}Z" fill="${body}"/>`);
    put(`<path d="M${q(tx, ty)}Q${q(tx + dx * len * 0.55, ty + dy * len * 0.55)} ${q(tx + dx * len * 0.9 + nx * curl * 0.6, ty + dy * len * 0.9 + ny * curl * 0.6)}" stroke="#b9c8a0" stroke-width="${R1(Math.max(0.35, len * 0.03))}" fill="none" opacity="0.85" stroke-linecap="round"/>`);
    if (front) put(`<path d="M${q(b1[0], b1[1])}Q${q(c1[0], c1[1])} ${q(tip[0], tip[1])}" stroke="#ffffff" stroke-width="${R1(Math.max(0.4, len * 0.04))}" fill="none" opacity="${(0.6 + lit * 0.35).toFixed(2)}" stroke-linecap="round"/>`);
  };
  const TL = s * 1.35;
  for (const d of [-0.78, 0.05, 0.8]) tepal(d, TL, false);                                     // the three behind
  // the throat: green-gold deep in the cup
  put(ribbon([[tx, ty], [tx + Math.cos(ax) * TL * 0.34, ty + Math.sin(ax) * TL * 0.34]], TL * 0.2, '#cfd86a', [0.5, 1]));
  // stamens: six filaments out of the throat along the axis, rust anthers riding them crosswise
  for (let k = 0; k < 6; k++) {
    const a = ax + (k - 2.5) * 0.15 + (rng() - 0.5) * 0.05, L = TL * (0.78 + rng() * 0.14);
    const ex = tx + Math.cos(a) * L, ey = ty + Math.sin(a) * L;
    put(`<path d="M${q(tx, ty)}Q${q(tx + Math.cos(ax) * L * 0.5, ty + Math.sin(ax) * L * 0.5)} ${q(ex, ey)}" stroke="#e4ecb4" stroke-width="${R1(Math.max(0.3, s * 0.028))}" fill="none" stroke-linecap="round"/>`);
    put(ribbon([[ex - Math.sin(a) * s * 0.09, ey + Math.cos(a) * s * 0.09], [ex + Math.sin(a) * s * 0.09, ey - Math.cos(a) * s * 0.09]], Math.max(0.7, s * 0.085), k % 2 ? '#b0481a' : '#d66e26'));
  }
  { const L = TL * 1.02, ex = tx + Math.cos(ax) * L, ey = ty + Math.sin(ax) * L;               // the pistil, longest of all
    put(`<path d="M${q(tx, ty)}L${q(ex, ey)}" stroke="#cfe0a0" stroke-width="${R1(Math.max(0.35, s * 0.04))}" fill="none" stroke-linecap="round"/>`);
    put(`<circle cx="${R1(ex)}" cy="${R1(ey)}" r="${R1(Math.max(0.6, s * 0.07))}" fill="#8fbe4e"/>`); }
  for (const d of [-0.42, 0.44]) tepal(d, TL * 0.96, true);                                    // the front pair, over the stamens' feet
  // a bud still closed, on its own short stalk — "how they GROW"
  if (bud == null ? h > 22 : bud) {
    const [bx0, by0] = stemAt(0.78), bsd = -side, bl = s * 0.95;
    const bx1 = bx0 + bsd * s * 0.55, by1 = by0 - s * 0.5;
    put(ribbon([[bx0, by0], [bx0 + bsd * s * 0.3, by0 - s * 0.12], [bx1, by1]], Math.max(0.8, h * 0.035), '#2a6a30', [1, 0.8, 0.7]));
    put(`<path d="M${q(bx1, by1)}Q${q(bx1 + bsd * bl * 0.34, by1 - bl * 0.5)} ${q(bx1 + bsd * bl * 0.1, by1 - bl)}Q${q(bx1 - bsd * bl * 0.2, by1 - bl * 0.5)} ${q(bx1, by1)}Z" fill="#e9eed2"/>`);
    put(`<path d="M${q(bx1, by1)}Q${q(bx1 + bsd * bl * 0.12, by1 - bl * 0.5)} ${q(bx1 + bsd * bl * 0.1, by1 - bl)}" stroke="#9fc070" stroke-width="${R1(Math.max(0.35, s * 0.04))}" fill="none"/>`);
  }
}

/* ══ THE STARS, EACH IN ITS OWN GLORY ══════════════════════════════════════════════════════
   "There is one glory of the sun, and another glory of the moon, and another glory of the stars:
   for one star differeth from another star in glory" (1 Cor 15:41).
   Sep 21 — Fred: "consult scripture, i believe the secrets of beautiful things are all in scripture."
   Every night plate hand-rolled its stars: one cold colour, sizes off a single curve, no star
   ever more than a dot. A real sky is a HIERARCHY — a great many faint, a fair few clear, a
   handful bright enough to wear a halo, and one or two that blaze — and it is not one colour:
   the faint ones are cold, the bright ones run from blue-white to gold. That difference IS the
   beauty the verse names, so it is built once, here, for every night in the book.
     · `n` stars inside the box; `mask(x,y)` false = no star there (a moon's glare, a hill);
     · `gloryK` scales how many of the bright classes appear (a hazy sky wants fewer);
     · drawn with its OWN rng stream (pass one) so a plate's composition is not disturbed.      */
export function paintStars(out, counter, rng, { x0 = 0, y0 = 0, x1 = 800, y1 = 260, n = 60, mask = null, gloryK = 1, fall = 1.3, op = 1 } = {}) {
  for (let i = 0; i < n; i++) {
    const x = x0 + rng() * (x1 - x0), y = y0 + Math.pow(rng(), fall) * (y1 - y0);   // thicker toward the zenith
    const cls = rng(), tw = rng();
    if (mask && !mask(x, y)) continue;
    const k = cls < 0.70 ? 0 : cls < 0.70 + 0.22 ? 1 : cls < 1 - 0.022 * gloryK ? 2 : 3;   // faint · clear · bright · blazing
    const sz = [0.42 + tw * 0.34, 0.8 + tw * 0.5, 1.35 + tw * 0.6, 2.1 + tw * 0.7][k];
    const warm = rng() < (k >= 2 ? 0.55 : 0.18);
    const core = k === 0 ? mix('#aab6e8', '#cfd8ff', tw) : warm ? mix('#fff1c8', '#ffd98a', tw * 0.6) : mix('#f2f5ff', '#cfe0ff', tw * 0.7);
    const a = [0.34 + tw * 0.26, 0.62 + tw * 0.22, 0.9, 1][k] * op;
    if (k >= 2) {                                          // a halo: the star's light in the air round it
      const hr = sz * (k === 3 ? 4.6 : 3.2);
      out.push(`<circle cx="${R1(x)}" cy="${R1(y)}" r="${R1(hr)}" fill="${core}" opacity="${(0.07 * op).toFixed(3)}"/>`); counter.n++;
      out.push(`<circle cx="${R1(x)}" cy="${R1(y)}" r="${R1(hr * 0.5)}" fill="${core}" opacity="${(0.13 * op).toFixed(3)}"/>`); counter.n++;
    }
    if (k === 3) {                                         // the blazing ones carry a four-point flare, long axis upright
      const L = sz * 5.2, rot = (rng() - 0.5) * 0.24;
      for (const [ang, lk] of [[Math.PI / 2 + rot, 1], [rot, 0.62]]) {
        const dx = Math.cos(ang) * L * lk, dy = Math.sin(ang) * L * lk;
        out.push(ribbon([[x - dx, y - dy], [x, y], [x + dx, y + dy]], sz * 0.55, core, [0.04, 1, 0.04]).replace('<path ', `<path opacity="${(0.8 * op).toFixed(2)}" `)); counter.n++;
      }
    }
    // heavenly lights may be truly round (Munch's law, see daub()) — a disc, then a hotter heart
    out.push(`<circle cx="${R1(x)}" cy="${R1(y)}" r="${R1(sz)}" fill="${core}" opacity="${a.toFixed(2)}"/>`); counter.n++;
    if (k >= 1) { out.push(`<circle cx="${R1(x)}" cy="${R1(y)}" r="${R1(sz * 0.45)}" fill="#ffffff" opacity="${Math.min(1, a + 0.15).toFixed(2)}"/>`); counter.n++; }
  }
}

// A PAINTED DAB — the honest way to lay a small ORGANIC mark (a flower, a berry,
// a blossom). A perfect <circle> reads as a geometric sticker sitting ON the
// picture; a daub is a short tapered ribbon at a jittered angle, so it sits IN
// the paint with everything else. (Munch's law: living things are never drawn
// with a compass — only MADE things and heavenly lights may be truly round.)
export function daub(out, counter, x, y, r, fill, rng) {
  const rnd = rng || Math.random;
  const a = rnd() * Math.PI * 2;
  const L = r * (1.5 + rnd() * 1.1);                       // a stroke, not a dot
  const dx = Math.cos(a) * L * 0.5, dy = Math.sin(a) * L * 0.5;
  const pts = [[x - dx, y - dy], [x + dx * 0.1, y + dy * 0.1], [x + dx, y + dy]];
  const prof = [0.62, 1.0, 0.72];                          // loaded middle, lifting tail
  out.push(ribbon(pts, r * 1.55, fill, prof)); counter.n++;
}

// a scatter of jewel garden-flowers across the ground (mask decides where);
// each a bright dab, warmed toward gold where the light falls. depthFn optional.
export function groundFlowers(out, counter, rng, { x0, y0, x1, y1, n = 220, mask, lightFn, depthFn }) {
  const L = lightFn || (() => 0), D = depthFn || (() => 0.5);
  strokes(out, counter, {
    rng, n,
    sample: rej(x0, y0, x1, y1, mask),
    dir: () => -Math.PI / 2,
    col: (x, y, r) => { const g = L(x, y); const k = r(); const c = k < 0.22 ? '#ee5c84' : k < 0.44 ? '#b77ce0' : k < 0.64 ? '#f6c63e' : k < 0.82 ? '#5ec0e0' : '#f29ad0'; return jig(mix(c, '#fff0c0', g * 0.5), r, 12); },
    len: (x, y) => 3 + D(x, y) * 5, lw: (x, y) => 2 + D(x, y) * 2, steps: 1, lenJ: 0.5,
  });
}

// DIRT ROAD — the refinement pass over a road/path that is already laid down.
// A road painted as one even ribbon reads as a printed stripe; a real dirt road
// is WORN UNEVENLY: two rutted lanes where the wheels and feet go, a paler
// crown left standing between them, loose stones, and a verge that breaks into
// the grass instead of ending at a clean edge. All four are drawn ALONG the
// road's own centreline, so everything follows the perspective already built
// into ptFn/wFn — and everything scales with t, so the far end stays fine and
// the near end stays broad.
//   ptFn(t) -> [x,y]  centreline, t = 0 far … 1 near
//   wFn(t)  -> width at t
export function dirtRoad(out, counter, rng, {
  ptFn, wFn, cols = ['#8a7048', '#b39463', '#d8c090'], lightFn,
  ruts = 0.34, stones = 150, verge = 260, steps = 42, seed = 811,
}) {
  const L = lightFn || (() => 0);
  const frame = t => {
    const p = ptFn(Math.min(1, t)), q = ptFn(Math.min(1, t + 0.02));
    let nx = -(q[1] - p[1]), ny = q[0] - p[0];
    const nl = Math.hypot(nx, ny) || 1;
    return { p, nx: nx / nl, ny: ny / nl };
  };
  const off = (t, k) => { const f = frame(t); const hw = wFn(t) / 2;
    return [f.p[0] + f.nx * k * hw, f.p[1] + f.ny * k * hw]; };
  const line = k => { const pts = []; for (let i = 0; i <= steps; i++) pts.push(off(i / steps, k)); return pts; };

  // 1. THE TWO RUTS — worn darker, the road's own direction
  for (const side of [-ruts, ruts]) {
    paintPath(out, counter, rng, line(side),
      (x, y, r) => jig(mix(mix(cols[0], cols[1], r() * 0.5), '#fff0c8', L(x, y) * 0.28), r, 7),
      { lw: 2.6, len: 7, density: 0.72, jitter: 1.5 });
  }
  // 2. THE CROWN — the strip left standing between the ruts, catching the light
  paintPath(out, counter, rng, line(0),
    (x, y, r) => jig(mix(cols[2], '#fff4d2', 0.25 + L(x, y) * 0.5), r, 6),
    { lw: 2.2, len: 8, density: 0.5, jitter: 1.2 });

  // 3. STONES — loose grit, bigger and looser toward the reader
  for (let i = 0; i < stones; i++) {
    const t = Math.pow(rng(), 0.6);                      // crowd the near end
    const k = (rng() * 2 - 1) * 0.92;
    const [x, y] = off(t, k);
    const rad = (0.7 + rng() * 1.7) * (0.3 + t * 1.1);
    const c = jig(mix(ramp(cols, rng()), '#fff0c8', L(x, y) * 0.35), rng, 9);
    daub(out, counter, x, y, rad, c, rng);
  }
  // 4. THE VERGE — the edge is not a boundary: earth spills out, grass leans in,
  //    so road and field interlock the way the horizon does.
  for (let i = 0; i < verge; i++) {
    const t = Math.pow(rng(), 0.7);
    const side = rng() < 0.5 ? -1 : 1;
    const k = side * (0.88 + rng() * 0.30);              // straddle the edge
    const [x, y] = off(t, k);
    const rad = (0.6 + rng() * 1.3) * (0.3 + t * 1.05);
    const c = jig(mix(cols[1], '#fff0c8', L(x, y) * 0.3), rng, 10);
    daub(out, counter, x, y, rad, c, rng);
  }
}

// WATER COURSE — the refinement pass over a river/stream already laid down.
// Water does not read as water because of its colour; it reads because of what
// the SURFACE does. Three things, in order:
//   · RIPPLES run ACROSS the current, not along it — a stroke following the flow
//     reads as a painted stripe, a stroke cutting across it reads as a surface.
//   · GLINTS are always HORIZONTAL, whichever way the water runs, because the
//     surface reflects the sky. Broken, never continuous, and they crowd where
//     the light falls.
//   · The BANK interlocks, like every other edge in this book — never a boundary.
//   ptFn(t) -> [x,y] centreline, t = 0 far … 1 near;  wFn(t) -> width
export function waterCourse(out, counter, rng, {
  ptFn, wFn, cols = ['#eafbf2', '#bfeede', '#8fd0cc'], glintCol = '#fffef2',
  lightFn, ripples = 320, glints = 190, bank = 240, steps = 40, seed = 907,
}) {
  const L = lightFn || (() => 0);
  const frame = t => {
    const p = ptFn(Math.min(1, t)), q = ptFn(Math.min(1, t + 0.02));
    let nx = -(q[1] - p[1]), ny = q[0] - p[0];
    const nl = Math.hypot(nx, ny) || 1;
    return { p, nx: nx / nl, ny: ny / nl, ang: Math.atan2(q[1] - p[1], q[0] - p[0]) };
  };
  const at = (t, k) => { const f = frame(t); const hw = wFn(t) / 2;
    return { x: f.p[0] + f.nx * k * hw, y: f.p[1] + f.ny * k * hw, ang: f.ang }; };

  // 1. RIPPLES — short marks cutting ACROSS the current
  strokes(out, counter, {
    rng, n: ripples,
    sample: r => { const t = Math.pow(r(), 0.7), k = (r() * 2 - 1) * 0.92;
      const q = at(t, k); return [q.x, q.y, t]; },
    dir: (x, y) => {
      // perpendicular to the local flow, wobbled so the surface never reads ruled
      const t = Math.max(0, Math.min(1, (y - ptFn(0)[1]) / Math.max(1, ptFn(1)[1] - ptFn(0)[1])));
      return frame(t).ang + Math.PI / 2 + (fbm(x / 22, y / 22, seed) - 0.5) * 0.9;
    },
    col: (x, y, r) => jig(mix(ramp(cols, fbm(x / 34, y / 26, seed + 3) + r() * 0.25), '#fffef2', L(x, y) * 0.45), r, 6),
    len: 7, lw: 2.1, steps: 2, lenJ: 0.6, follow: 0.9, impasto: 0.3,
  });

  // 2. GLINTS — broken HORIZONTAL dashes; the surface catching the sky
  for (let i = 0; i < glints; i++) {
    const t = Math.pow(rng(), 0.62);
    const k = (rng() * 2 - 1) * 0.86;
    const q = at(t, k);
    const g = L(q.x, q.y);
    if (rng() > 0.35 + g * 0.6) continue;              // crowd them where the light falls
    const w = (2.6 + rng() * 7) * (0.3 + t * 1.15);    // longer near the reader
    const h = (0.7 + rng() * 0.9) * (0.35 + t * 0.9);
    out.push(ribbon([[q.x - w / 2, q.y], [q.x + w / 2, q.y]], h,
      jig(mix(glintCol, cols[0], rng() * 0.35), rng, 5)));
    counter.n++;
  }

  // 3. THE BANK — water and land interlock instead of meeting at a line
  for (let i = 0; i < bank; i++) {
    const t = Math.pow(rng(), 0.7);
    const side = rng() < 0.5 ? -1 : 1;
    const q = at(t, side * (0.9 + rng() * 0.26));
    const rad = (0.6 + rng() * 1.4) * (0.3 + t * 1.05);
    daub(out, counter, q.x, q.y, rad,
      jig(mix(cols[2], '#fff0c8', L(q.x, q.y) * 0.35), rng, 9), rng);
  }
}

// HORIZON FRINGE — a ragged band of grass/foliage tufts rising off the horizon
// line, clumped with gaps, so the boundary between the SKY plane and the GROUND
// planes reads as interlocking organic texture (not a ruled line) when the
// depth planes pan apart. Put it in the band that sits just in front of the sky
// (its tips poke up into the sky; the field below hides its base). Uses its own
// fbm-driven clumping; warmed toward gold where the light falls.
export function horizonFringe(out, counter, rng, { horizonFn, x0 = -10, x1 = 810, cols, hMax = 24, n, lightFn, seed = 313, dirJitter = 0.6 }) {
  const L = lightFn || (() => 0);
  const N = n || Math.round((x1 - x0) / 1.3);
  strokes(out, counter, {
    rng, n: N,
    sample: r => {
      const x = x0 + r() * (x1 - x0);
      const clump = fbm(x / 17, 7.5, seed);          // ragged clumping → gaps between tufts
      if (clump < 0.34) return null;
      const up = Math.pow(r(), 0.72) * hMax * (0.35 + clump * 0.95);   // blades taller at clump cores
      return [x + (r() - 0.5) * 3.2, horizonFn(x) + 2 - up];
    },
    dir: (x, y) => -Math.PI / 2 + (fbm(x / 9, y / 9, seed + 4) - 0.5) * dirJitter,
    col: (x, y, r) => { const g = L(x, y); const c = ramp(cols, fbm(x / 13, y / 13, seed + 8) + r() * 0.3); return jig(mix(c, '#f0d27a', g * 0.6), r, 9); },
    len: 8, lw: 2.2, steps: 2, follow: 0.92, lenJ: 0.55, impasto: 0.35,
  });
}

// ROLLING-HILL CONTOUR — a reusable, smoothly-undulating skyline function for a
// horizon band. `base` is the nominal horizon (number or fn); the contour rises
// above it by up to `amp`, with `bumps` occasional tree-clump swells. Use it as
// the top of a ground band so the band's edge is never a straight line; when two
// bands carrying such contours pan at different rates, the overlap shifts — a
// living horizon a flat canvas cannot do.
export function ridge(base, { amp = 24, freq = 130, bumps = 0.5, seed = 400 } = {}) {
  const B = typeof base === 'function' ? base : () => base;
  return x => {
    const roll = 0.5 + 0.5 * Math.sin(x / freq + seed * 0.7);
    const fine = fbm(x / 64, 5.5, seed);
    const bump = bumps > 0 ? Math.max(0, fbm(x / 26, 9.5, seed + 3) - 0.55) * bumps * amp * 2.4 : 0;
    return B(x) - (0.4 * roll + 0.6 * fine) * amp - bump;
  };
}

// DISTANT HILLS — a far rolling-land silhouette for the horizon: an irregular
// skyline (hills + tree-clump bumps) filled down past the horizon, painted with
// Van Gogh texture. Put it on the FAR plane: its undulating top reads as the
// sky↔ground boundary (never a ruled line), and because it is its own depth
// plane it slides against the sky as the panorama pans — an overlapping, moving
// horizon. `topFn` is a ridge() contour; fills to `horizonFn(x)+depth`.
export function distantHills(out, counter, rng, { topFn, horizonFn, x0 = -14, x1 = 814, cols, depth = 80, lightFn, seed = 400 }) {
  const L = lightFn || (() => 0);
  let d = `M${R1(x0)} ${R1(topFn(x0))}`;
  for (let x = x0 + 8; x <= x1; x += 8) d += `L${R1(x)} ${R1(topFn(x))}`;
  d += `L${R1(x1)} ${R1(horizonFn(x1) + depth)}L${R1(x0)} ${R1(horizonFn(x0) + depth)}Z`;
  out.push(`<path d="${d}" fill="${cols[1]}"/>`); counter.n++;
  strokes(out, counter, {
    rng, n: Math.round((x1 - x0) / 2.1),
    sample: r => { const x = x0 + r() * (x1 - x0); const t = topFn(x); return [x, t + r() * (horizonFn(x) + depth - t)]; },
    dir: (x, y) => 0.05 + (fbm(x / 40, y / 40, seed + 2) - 0.5) * 0.5,
    col: (x, y, r) => { const g = L(x, y); const t = topFn(x); const c = ramp(cols, fbm(x / 55, y / 40, seed + 3) * 0.8 + (y - t) / depth * 0.4); return jig(mix(c, '#f0d27a', g * 0.4), r, 8); },
    len: 13, lw: 4, steps: 2, lenJ: 0.5, impasto: 0.4,
  });
}

// ---------- SVG assembly ----------
export const W = 800, H = 500;

function hashStr(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

// FULL PAINT COVERAGE: a coarse underpaint laid right above the plate's
// ground rect — very wide, low-detail strokes in jittered shades of the base
// hue, so no flat background ever leaks between the real strokes. Uses its
// OWN rng (seeded from the title), so the plate's rng order is untouched
// and every existing composition survives byte-identically above it.
function undercoatLayer(base, title) {
  const r = mulberry32(hashStr(title) ^ 0x9e3779b9);
  const u = [];
  const prof = [0.5, 0.52, 0.46, 0.3];
  for (let i = 0; i < 240; i++) {
    const x = -24 + r() * (W + 48), y = -24 + r() * (H + 48);
    let a = (fbm(x / 170, y / 170, 7) - 0.5) * 2.8 + 0.25;
    const len = 70 + r() * 85, w = 17 + r() * 14;
    const pts = [[x, y]];
    let px = x, py = y;
    for (let k = 0; k < 3; k++) {
      a += (r() - 0.5) * 0.34;
      px += Math.cos(a) * (len / 3); py += Math.sin(a) * (len / 3);
      pts.push([px, py]);
    }
    // quiet pigment: the undercoat must murmur beneath the plate, not sing
    // over it — small lift, small jitter, or night plates lose their hush
    const c = jig(lift(base, (r() * 2 - 1) * 4.5), r, 9);
    u.push(ribbon(pts, w, c, prof));
    u.push(reliefPair(pts, w, c, 0.4, prof)); // gentle ridges on the undercoat too
  }
  return u.join('\n');
}

// svgWrap(title, body, opts) — assembles the plate plus three default-on
// oil-surface layers (each can be disabled per plate via opts):
//   undercoat: coarse paint-over-paint base injected just above the ground rect
//   weave:     fine canvas crosshatch in the base hue, felt not seen
//   varnish:   warm glaze + corner vignette, one radial gradient, unifying
export function svgWrap(title, body, opts = {}) {
  const { undercoat = 1, weave = 1, varnish = 1, oil = 1, melt = 0 } = opts;
  const oilAmt = typeof oil === 'number' ? oil : (oil ? 1 : 0);
  // MELT — the oil displacement ALONE (no opaque base rect, no weave/varnish),
  // so a TRANSPARENT depth cel still melts its crisp vector edges into paint and
  // reads like the rest of the book. Use for foreground planes over a live scene.
  if (melt) {
    const mAmt = typeof melt === 'number' ? melt : 1;
    const f = `<defs><filter id="oil" x="-3%" y="-3%" width="106%" height="106%">
<feGaussianBlur in="SourceGraphic" stdDeviation="0.45" result="wet"/>
<feTurbulence type="fractalNoise" baseFrequency="0.013 0.010" numOctaves="2" seed="41" result="slow"/>
<feDisplacementMap in="wet" in2="slow" scale="${(6 * mAmt).toFixed(1)}" xChannelSelector="R" yChannelSelector="G" result="drag"/>
<feTurbulence type="fractalNoise" baseFrequency="0.065 0.08" numOctaves="2" seed="43" result="bristle"/>
<feDisplacementMap in="drag" in2="bristle" scale="${(3.2 * mAmt).toFixed(1)}" xChannelSelector="R" yChannelSelector="G"/>
</filter></defs>`;
    let g = `${f}<g filter="url(#oil)">${body}</g>`;
    if (LAYER_OPACITY < 1) g = `<g opacity="${LAYER_OPACITY.toFixed(3)}">${g}</g>`;
    return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img"><title>${title}</title>${g}</svg>`;
  }
  const m = body.match(/<rect width="[^"]+" height="[^"]+" fill="(#[0-9a-fA-F]{6})"\/>/);
  const base = m ? m[1] : DARKEST;
  let inner = body;
  if (undercoat && m) inner = body.replace(m[0], m[0] + '\n' + undercoatLayer(base, title));
  // OIL SURFACE: every ribbon is a crisp vector polygon — that crispness is
  // what reads as "computer". Two stacked displacement passes melt it into
  // paint: a slow broad warp (the canvas pulling the brush off course) and a
  // fine high-frequency one (bristle raggedness at every stroke edge), with
  // a whisper of blur first so hard fills bleed wet-on-wet into neighbours.
  if (oilAmt) {
    inner = `<defs><filter id="oil" x="-3%" y="-3%" width="106%" height="106%">
<feGaussianBlur in="SourceGraphic" stdDeviation="0.45" result="wet"/>
<feTurbulence type="fractalNoise" baseFrequency="0.013 0.010" numOctaves="2" seed="41" result="slow"/>
<feDisplacementMap in="wet" in2="slow" scale="${(6 * oilAmt).toFixed(1)}" xChannelSelector="R" yChannelSelector="G" result="drag"/>
<feTurbulence type="fractalNoise" baseFrequency="0.065 0.08" numOctaves="2" seed="43" result="bristle"/>
<feDisplacementMap in="drag" in2="bristle" scale="${(3.2 * oilAmt).toFixed(1)}" xChannelSelector="R" yChannelSelector="G"/>
</filter></defs>
<rect width="${W}" height="${H}" fill="${base}"/>
<g filter="url(#oil)">
${inner}
</g>`;
  }
  const wHi = lift(base, 24, 0.35), wLo = lift(base, -24, 0.35);
  const weaveS = weave ? `<defs><pattern id="wv" width="3" height="3" patternUnits="userSpaceOnUse" patternTransform="rotate(0.6)">
<path d="M0 0.7h3M0 2.2h3" stroke="${wHi}" stroke-width="0.55"/>
<path d="M0.7 0v3M2.2 0v3" stroke="${wLo}" stroke-width="0.55"/>
</pattern></defs>
<rect width="${W}" height="${H}" fill="url(#wv)" opacity="0.055"/>` : '';
  const varnishS = varnish ? `<defs><radialGradient id="vn" cx="0.42" cy="0.36" r="0.82">
<stop offset="0" stop-color="#ffd98a" stop-opacity="0.065"/>
<stop offset="0.55" stop-color="#b98a3a" stop-opacity="0.04"/>
<stop offset="1" stop-color="#0d0a04" stop-opacity="0.25"/>
</radialGradient></defs>
<rect width="${W}" height="${H}" fill="url(#vn)"/>` : '';
  // LESS-OPAQUE FOREGROUND: a depth plane drawn under reduced opacity glazes over
  // the luminous layers behind it — the picture lit from within (the build sets it).
  if (LAYER_OPACITY < 1) inner = `<g opacity="${LAYER_OPACITY.toFixed(3)}">${inner}</g>`;
  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img">
<title>${title}</title>
${inner}
${weaveS}
${varnishS}
</svg>`;
}
