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
export function jig(c, rng, amt = 14) {
  const [r, g, b] = hx(c);
  // THE MANIFOLD ACCENT — "how manifold are thy works... the earth is FULL of
  // thy riches" (Ps 104:24); the bow round the throne (Rev 4:3). A twelfth of
  // all strokes flip across the colour wheel at MATCHED lightness — pinks
  // living in the blues, oranges on the greens: Van Gogh's complementary
  // fleck, the whole bow hidden in every field. Neutrals stay neutral.
  if (rng() < 0.10) {
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
function ribbonEdges(pts, w, profile) {
  const n = pts.length;
  const L = [], R = [], N = []; // N[i] = unit normal from spine toward L side
  const prof = profile || [0.34, 0.5, 0.42, 0.15]; // tapered both ends — a loaded brush touches down, presses, lifts
  for (let i = 0; i < n; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[Math.min(n - 1, i + 1)];
    let tx = p1[0] - p0[0], ty = p1[1] - p0[1];
    const tl = Math.hypot(tx, ty) || 1; tx /= tl; ty /= tl;
    const hw = w * (prof[i] !== undefined ? prof[i] : prof[prof.length - 1]);
    L.push([pts[i][0] - ty * hw, pts[i][1] + tx * hw]);
    R.push([pts[i][0] + ty * hw, pts[i][1] - tx * hw]);
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
export function ribbon(pts, w, fill, profile) {
  const { L, R } = ribbonEdges(pts, w, profile);
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
export function reliefPair(pts, w, fill, k = 1, profile) {
  const { L, R, N } = ribbonEdges(pts, w, profile);
  let dot = 0;
  for (const nv of N) dot += nv[0] * LIT_X + nv[1] * LIT_Y;
  const litE = dot >= 0 ? L : R, litS = dot >= 0 ? 1 : -1;
  const shaE = dot >= 0 ? R : L, shaS = -litS;
  const lm = lum(fill);
  const hk = Math.min(1.1, k * (0.22 + 0.75 * lm));   // highlight strength — dark paint keeps its night
  const sk = Math.min(1.0, k * (0.38 + 0.42 * lm));   // shadow strength
  const sw = Math.min(1.0, Math.max(0.7, w * 0.24));  // sliver width ~0.7-1.0px
  const hi = lift(fill, 9 * hk, 0.12 * hk);
  const lo = lift(fill, -8.5 * sk);
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
export function strokes(out, counter, { rng, n, sample, dir, col, len, lw, lenJ = 0.35, wJ = 0.3, aJ = 0.22, steps = 3, follow = 1, wild = 0, impasto = 0, relief = 1, op = STROKE_OPACITY }) {
  if (DENSITY !== 1) n = Math.round(n * DENSITY);
  const lenFn = typeof len === 'function', lwFn = typeof lw === 'function';
  for (let i = 0; i < n; i++) {
    const s = sample(rng);
    if (!s) continue;
    const aJv = typeof aJ === 'function' ? aJ(s[0], s[1]) : aJ;
    const lenB = (lenFn ? len(s[0], s[1]) : len) * BRUSH_SCALE;
    const lwB = (lwFn ? lw(s[0], s[1]) : lw) * BRUSH_SCALE;
    let L, w;
    if (wild > 0 && rng() < wild) {
      if (rng() < 0.62) { w = 0.8 + rng() * 1.4; L = lenB * (1.3 + rng() * 1.4); }   // raking hairline
      else { w = 8 + rng() * 6; L = lenB * (0.4 + rng() * 0.45); }                    // bold slab
    } else {
      L = lenB * (1 + (rng() * 2 - 1) * lenJ);
      w = lwB * (1 + (rng() * 2 - 1) * wJ);
    }
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
    const fill = col(s[0], s[1], rng);
    // a brush TAPER — loaded near the start, swelling, lifting to a drier tail
    const np = pts.length;
    const prof = pts.map((_, i) => { const t = np > 1 ? i / (np - 1) : 0.5; return 0.5 + 0.55 * Math.sin(Math.PI * (0.16 + t * 0.8)); });
    if (CAP) CAP.push([pts.map(p => [r1(p[0]), r1(p[1])]), r1(w), fill]);
    // build this stroke's polys, then wrap them in ONE opacity group so the whole
    // mark (body + impasto + relief slivers) glazes uniformly and layers over what's beneath.
    let body = '';
    if (impasto > 0 && lum(fill) > impasto) {
      body += ribbon(pts.map(p => [p[0] + 0.5, p[1] + 1.2]), w * 1.12, mix(fill, DARKEST, 0.55), prof);
      counter.n++;
    }
    body += ribbon(pts, w, fill, prof);
    counter.n++;
    // lit edges: only wide strokes are ridges; hairlines stay single polys.
    // Near-black pigment skips entirely — its slivers would be invisible
    // (hk ~0.3*lum) but still cost two polys each; night plates save ~20%.
    if (relief > 0 && w > 3 && lum(fill) > 0.14) { body += reliefPair(pts, w, fill, relief, prof); counter.n += 2; }
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
  const headR = h * 0.115;                        // a bigger, CUTE head (~4 heads tall) — but with a neck, not a tumor
  const neckY = topY + headR * 1.7;               // bottom of head
  const shY = topY + h * 0.25;                    // shoulders sit just below the head
  const hipY = topY + h * 0.55;                   // short, chunky torso
  const feetY = topY + h;
  const lean = pose.lean || 0, ht = pose.headTilt || 0;
  const cxT = cx + lean;
  const shW = h * 0.072, hipW = h * 0.048;
  const Lsh = [cxT - shW, shY], Rsh = [cxT + shW, shY];
  const Lhip = [cx - hipW, hipY], Rhip = [cx + hipW, hipY];
  const uArm = h * 0.135, fArm = h * 0.12;        // short, stubby arms — still bend at the elbow (cute, not lanky)
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
  // (1) a deep warm backing — a slightly enlarged silhouette, so a defining edge
  // rings Him and He reads on ANY ground: just a warm rim on a dark field, a clear
  // silhouette-edge against a bright bridge
  underpaintCapsules(out, counter, caps.map(c => ({ ...c, r: c.r + 3.5 })), '#8a5c1c');
  // (2) the yellow-white radiant aura (the radiance around Him)
  radiantHalo(out, counter, rng, caps, '#ffd24f');
  // (2.5) a soft dark CONTRAST shadow hugging the very border of the light — drawn
  // OVER the glow, just outside the body, so the radiance reads with much greater
  // contrast against it (a chiaroscuro terminator at the edge of the Light)
  for (const c of caps) {
    out.push(`<path d="M${R1(c.ax)} ${R1(c.ay)}L${R1(c.bx)} ${R1(c.by)}" stroke="#2c1d08" stroke-width="${R1(c.r * 2 + 7)}" stroke-linecap="round" fill="none" opacity="0.36"/>`);
    counter.n++;
  }
  // (3) a luminous warm-white base
  underpaintCapsules(out, counter, caps, '#fff7df');
  // (4) the body: brilliant WHITE woven with YELLOW — full of light, kept bright
  // (mostly white core) so He stays the most luminous thing on the page
  paintFigure(out, counter, rng, caps, (x, y, r) => jig(mix('#ffffff', '#ffdf66', 0.16 + r() * 0.32), r, 9), 2.0);
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
    len: (x, y) => 6 + Math.hypot(x - Lx, y - Ly) * 0.12, lw: 1.7, steps: 2, lenJ: 0.6, relief: 0, op: 0.8,
  });
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
  const { dir = 0.6, w = (maxx - minx) * 0.55 + 7, ground = footY + 2, squash = 0.24, op = 0.3, col = '#120f1c' } = opts;
  for (const [sw, so] of [[1.35, 0.38], [0.98, 0.68], [0.62, 1.0]]) {   // feathered: wide faint → tight dark
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
export function inscriptionText(out, text, { x, y, h, body = '#241608', edge = '#fff0c4', op = 0.85, edgeOp = 0.6, anchor = 'middle', mirror = false, font = "Georgia, 'Palatino Linotype', 'Times New Roman', serif" } = {}) {
  h = h * INSCR_SCALE;
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const t = esc(text);
  const C = `font-family="${font}" font-size="${h}" font-weight="700" text-anchor="${anchor}"`;
  const open = mirror ? `<g transform="matrix(-1 0 0 1 ${(2 * x).toFixed(1)} 0)">` : '';   // reflect about x (for "through a glass, darkly")
  const close = mirror ? '</g>' : '';
  out.push(`${open}<text x="${(x - 0.8).toFixed(1)}" y="${(y - 1.0).toFixed(1)}" ${C} fill="${edge}" opacity="${edgeOp}">${t}</text>${close}`);   // light fringe (under)
  out.push(`${open}<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" ${C} fill="${body}" opacity="${op}">${t}</text>${close}`);                       // dark body (on top)
}

// ---------- FRUITFUL LAND (Eden is never barren) ----------
// The land always teems; it is only DARK until the Light comes, then it BLAZES.
// Crazy, FREE colour (Munch: colour need not be real). lightFn(x,y)->0..1 (opt)
// warms foliage/fruit toward gold where the scene's light falls.
export const FRUIT_COLS = ['#f6c63e', '#ee5c84', '#ffa53e', '#b77ce0', '#5ec0e0', '#f29ad0'];
export const BLOSSOM_COLS = ['#f29ad0', '#f6e07a', '#fafafa', '#b79ad8', '#8fd0e0'];
// bright jewel leaf palettes — visible day or night, against any ground
export const LEAF_PALETTES = [
  ['#7a4ab0', '#9a5ac8', '#b87ae0'],  // violet
  ['#c83a82', '#e05a9a', '#f07ab0'],  // pink
  ['#2c9a86', '#3ac0a0', '#5ad8b8'],  // teal
  ['#3a6ad0', '#4a7ae0', '#6a9af0'],  // blue
  ['#5a9a32', '#7ec044', '#a6dc5e'],  // green
  ['#d2922e', '#e6b34a', '#f6d06a'],  // amber
];

// one fruitful tree: a jewel canopy heavy with glowing fruit + blossoms.
export function fruitTree(out, counter, rng, cx, baseY, h, w, leafCols, lightFn) {
  const L = lightFn || (() => 0);
  paintPath(out, counter, rng, [[cx, baseY], [cx + (rng() - 0.5) * w * 0.2, baseY - h * 0.46]],
    (x, y, r) => jig(mix('#241433', '#3a2a22', r()), r, 6), { lw: Math.max(2, w * 0.14), len: 6, density: 0.85, jitter: 0.5 });
  const ccy = baseY - h * 0.62, cw = w, ch = h * 0.58;
  strokes(out, counter, {
    rng, n: Math.round(cw * ch / 5),
    sample: r => { const a = r() * Math.PI * 2, dd = Math.pow(r(), 0.55); return [cx + Math.cos(a) * cw * dd, ccy - Math.sin(a) * ch * dd]; },
    dir: (x, y) => -Math.PI / 2 + (fbm(x / 12, y / 12, 151) - 0.5) * 1.5,
    col: (x, y, r) => { const g = L(x, y); let c = ramp(leafCols, fbm(x / 14, y / 14, 153) * 0.8 + r() * 0.3); c = mix(c, '#fbe79a', g * 0.85); return jig(c, r, 13); },
    len: 5 + h * 0.05, lw: 2.8, steps: 2, lenJ: 0.5, impasto: 0.4,
  });
  for (let i = 0; i < Math.round(w * 0.9); i++) {        // FRUIT — fat bright dabs that glow
    const a = rng() * Math.PI * 2, dd = Math.pow(rng(), 0.42);
    const fx2 = cx + Math.cos(a) * cw * dd * 0.92, fy3 = ccy - Math.sin(a) * ch * dd * 0.92;
    const fr = 3.0 + rng() * 2.4, fc = FRUIT_COLS[Math.floor(rng() * FRUIT_COLS.length)], lit = L(fx2, fy3);
    out.push(ribbon([[fx2 - fr * 0.7, fy3], [fx2 + fr * 0.7, fy3]], fr * 1.8, mix(fc, '#fff0c0', lit * 0.5))); counter.n++;
    out.push(ribbon([[fx2 - fr * 0.28, fy3 - fr * 0.28], [fx2, fy3 - fr * 0.12]], fr * 0.6, '#fff6dc')); counter.n++;
  }
  for (let i = 0; i < Math.round(w * 0.4); i++) {        // blossoms of every colour
    const a = rng() * Math.PI * 2, dd = Math.pow(rng(), 0.5);
    const bx2 = cx + Math.cos(a) * cw * dd, by2 = ccy - Math.sin(a) * ch * dd;
    out.push(ribbon([[bx2 - 1.8, by2], [bx2 + 1.8, by2]], 2.5, BLOSSOM_COLS[Math.floor(rng() * BLOSSOM_COLS.length)])); counter.n++;
  }
}

// a lush jewel bush (rounded mound of free-colour foliage, gold-lit by lightFn)
export function jewelBush(out, counter, rng, bx, by, w, h, cols, lightFn) {
  const L = lightFn || (() => 0);
  strokes(out, counter, {
    rng, n: Math.round(w * 2.2),
    sample: r => { const a = r() * Math.PI * 2, dd = Math.pow(r(), 0.7); return [bx + Math.cos(a) * w * dd, by - Math.abs(Math.sin(a)) * h * dd]; },
    dir: (x, y) => -Math.PI / 2 + (fbm(x / 10, y / 10, 259) - 0.5) * 1.3,
    col: (x, y, r) => { const g = L(x, y); let c = ramp(cols, fbm(x / 12, y / 12, 261) + r() * 0.3); return jig(mix(c, '#f0d27a', g * 0.7), r, 10); },
    len: 7, lw: 2.4, steps: 2, lenJ: 0.5,
  });
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
  const { undercoat = 1, weave = 1, varnish = 1, oil = 1 } = opts;
  const m = body.match(/<rect width="[^"]+" height="[^"]+" fill="(#[0-9a-fA-F]{6})"\/>/);
  const base = m ? m[1] : DARKEST;
  let inner = body;
  if (undercoat && m) inner = body.replace(m[0], m[0] + '\n' + undercoatLayer(base, title));
  // OIL SURFACE: every ribbon is a crisp vector polygon — that crispness is
  // what reads as "computer". Two stacked displacement passes melt it into
  // paint: a slow broad warp (the canvas pulling the brush off course) and a
  // fine high-frequency one (bristle raggedness at every stroke edge), with
  // a whisper of blur first so hard fills bleed wet-on-wet into neighbours.
  if (oil) {
    inner = `<defs><filter id="oil" x="-3%" y="-3%" width="106%" height="106%">
<feGaussianBlur in="SourceGraphic" stdDeviation="0.45" result="wet"/>
<feTurbulence type="fractalNoise" baseFrequency="0.013 0.010" numOctaves="2" seed="41" result="slow"/>
<feDisplacementMap in="wet" in2="slow" scale="6" xChannelSelector="R" yChannelSelector="G" result="drag"/>
<feTurbulence type="fractalNoise" baseFrequency="0.065 0.08" numOctaves="2" seed="43" result="bristle"/>
<feDisplacementMap in="drag" in2="bristle" scale="3.2" xChannelSelector="R" yChannelSelector="G"/>
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
