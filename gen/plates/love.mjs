// gen/plates/love.mjs — "What was He like?" (p4) — REPAINTED Oct 25 with slight realism.
//
// Fred, Oct 25: "i want the art style to not have emoji looking things. i want the background to be
// drawn with slight realism." This page was the worst of the book for both: a sky of big translucent
// slabs, a field of confetti dabs, and stickers on top (a white cartoon hen, a bunny, butterflies, a
// ladybug, two cartoon tree sprites). The old plate is kept at attic/love-pre-realism/love.mjs.
//
// The page says: "Everything He made, He made for you. Everything He did, He did for love." So the
// picture is simply a world worth being given — a valley in late-afternoon sun, drawn the way a
// landscape painter would see it, still in brushstrokes:
//   · a real sky: deep blue overhead warming to gold at the sun, cumulus banks lit on the sun side and
//     shadowed lavender underneath, a few high wisps — ONE light, the sun (1 John 4:8's "God is light"
//     reads the same way through the whole book);
//   · aerial perspective: the far ridges pale and blue, nearer hills greener, hedgerows and copses on
//     them that shrink with distance;
//   · a meadow that rolls (value follows which way each slope faces the sun), grass in four layers on a
//     scale gradient, flowers in colonies of one kind (gift's green-world recipe);
//   · two real trees standing in the meadow, casting shadows;
//   · and the one picture Jesus gave of His own love — "as a hen gathereth her chickens under her wings"
//     (Matt 23:37) — a russet hen with her chicks, painted in feathers, sitting in the sun near the child.
// Kept: the sun's place (472,128), the hidden heart in its glow, the Greek "1 John 4:8" cut into the
// grass, the plane names (index.html and the boil tables are unchanged), the child's place (runtime).

export const name = 'love';
export const title = 'What was He like?';
export const caption = 'Everything He made, He made for you.';
export const seed = 20261025;
export const focal = { x: 308, y: 400 };
export const layers = [
  { name: 'sky', opaque: true },   // the sky field + the sun + the high wisps (backmost, opaque)
  { name: 'sky1' },                // the cumulus banks — the plane that breathes (BOIL_GLIMMER[4])
  { name: 'sky2' },                // a thin veil of light-catching cloud edges in front of them
  { name: 'far', op: 1 },          // the ridges (painted with its own aerial perspective — no 0.6 haze, or the sky shows through the hills)
  // , hills, hedgerows and copses
  { name: 'mid' },                 // the meadow and the trees standing in it
  { name: 'fg' },                  // the hen and her chicks, the nearest grass
];

export function paint(E, opts = {}) {
  const { mulberry32, fbm, mix, ramp, jig, strokes, rej, paintPath, lightRadial, ridge, groundShadow, svgWrap, R1, W, H } = E;
  const rng = mulberry32(seed);
  const out = [], counter = { n: 0 };
  const LAYER = opts.layer || 'full';
  const ranges = { sky: [], sky1: [], sky2: [], far: [], mid: [], fg: [] };
  const into = (name, f) => { const a = out.length; f(); ranges[name].push([a, out.length]); };

  const SUN = { x: 472, y: 128 };
  const sunL = lightRadial(SUN.x, SUN.y, 260);           // the glow of the sky around the sun
  const sunFar = lightRadial(SUN.x, SUN.y, 520);          // how the light falls across the land
  // the visible skyline: the far ridge
  const ridgeFar = ridge(x => 250 + 12 * Math.sin(x / 130) - 22 * Math.exp(-(((x - 610) / 90) ** 2)) - 14 * Math.exp(-(((x - 150) / 70) ** 2)), { amp: 30, freq: 150, bumps: 0.8, seed: 41 });
  const ridgeMid = ridge(x => 270 + 8 * Math.sin(x / 95 + 1), { amp: 18, freq: 160, bumps: 0.7, seed: 43 });
  // the meadow's brow: low in the centre (the valley opens behind the child), rising to both sides
  const brow = x => 292 + 6 * Math.sin(x / 70) - 18 * Math.exp(-(((x - 330) / 210) ** 2))
    - 26 * Math.exp(-(((x + 40) / 170) ** 2)) - 30 * Math.exp(-(((x - 840) / 190) ** 2));
  const depthOf = y => Math.max(0, Math.min(1, (y - 280) / (H - 280)));   // 0 at the brow, 1 at our feet
  const dS = y => 0.3 + 1.05 * depthOf(y);                                // mark scale: four times bigger near us

  /* ---------------- 1. THE SKY ---------------- */
  // gradient by height and by distance from the sun: deep blue overhead, cooler at the left, warming to
  // pale gold around the sun, a warm haze down at the ridge
  const skyCol = (x, y) => {
    const up = Math.max(0, Math.min(1, 1 - y / 260));
    let c = ramp(['#f3d9a4', '#e8c98f', '#b9b9b6', '#7f9cc4', '#5579b4', '#3d5c9e'], 0.15 + up * 0.85);
    c = mix(c, '#fff3cf', Math.pow(sunL(x, y), 1.3) * 0.95);            // the glow round the sun
    c = mix(c, '#f0c98a', Math.max(0, 1 - Math.abs(y - 250) / 50) * 0.35 * (0.6 + sunFar(x, y)));   // warm haze at the horizon
    return c;
  };
  into('sky', () => {
    // a smooth ground first (graded bands), so no stroke ever shows bare canvas
    for (let y = -10; y < 300; y += 6) {
      out.push(`<rect x="-10" y="${y}" width="820" height="7" fill="${skyCol(400, y + 3)}"/>`); counter.n++;
    }
    // then the sky painted in many small strokes, gently curving (the book's swirl, softened)
    const skyDir = (x, y) => { const dx = x - SUN.x, dy = y - SUN.y; const d = Math.hypot(dx, dy) + 1;
      return Math.atan2(dy, dx) + Math.PI / 2 * Math.min(1, 140 / d) * 0.9 + (fbm(x / 160, y / 90, 7) - 0.5) * 0.9; };
    for (const [n, len, lw] of [[9000, 11, 1.1], [14000, 7, 0.7]]) strokes(out, counter, {   // ⚠ the sky band paints at 1.7× brush scale (build.mjs) — so these are small on purpose
      rng, n, sample: rej(-10, -10, 810, 300, (x, y) => y < ridgeFar(x) + 4),
      dir: skyDir,
      col: (x, y, r) => { let c = skyCol(x, y); c = mix(c, r() < 0.5 ? '#fff6dc' : '#4d6eb0', Math.max(0, r() - 0.3) * 0.1); return jig(c, r, 4); },
      len, lw, steps: 3, follow: 0.85, lenJ: 0.5, wJ: 0.4, impasto: 0.12, relief: 0,   // relief on a sky tiles into fish scales
    });
    // the sun: a white-gold disc in a bright halo — small, as the real sun is, and blinding
    strokes(out, counter, {
      rng, n: 1600, sample: r => { const a = r() * 6.283, d = 8 + Math.pow(r(), 1.6) * 92; return [SUN.x + Math.cos(a) * d, SUN.y + Math.sin(a) * d]; },
      dir: (x, y) => Math.atan2(y - SUN.y, x - SUN.x) + Math.PI / 2 + 0.25,
      col: (x, y, r) => { const d = Math.hypot(x - SUN.x, y - SUN.y); return jig(mix(skyCol(x, y), '#fffbea', Math.max(0, 1 - d / 100) ** 1.4), r, 5); },
      len: 4, lw: 1.3, steps: 2, lenJ: 0.5, impasto: 0.3, relief: 0.08,
    });
    strokes(out, counter, {
      rng, n: 500, sample: r => { const a = r() * 6.283, d = Math.sqrt(r()) * 20; return [SUN.x + Math.cos(a) * d, SUN.y + Math.sin(a) * d]; },
      dir: (x, y) => Math.atan2(y - SUN.y, x - SUN.x) + Math.PI / 2,
      col: (x, y, r) => jig(mix('#fffef6', '#fff2c2', r() * 0.4), r, 3),
      len: 3, lw: 1.5, steps: 2, relief: 0,
    });
    // ✦ the hidden heart, a whisper inside the glare (kept from the old plate — 1 John 4:8)
    { const pts = [];
      for (let t = 0; t <= Math.PI * 2 + 0.01; t += 0.16) {
        const hx = 16 * Math.pow(Math.sin(t), 3), hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
        pts.push([SUN.x + hx * 1.15, SUN.y + hy * 1.15 - 2]);
      }
      paintPath(out, counter, rng, pts, (x, y, r) => jig(mix('#fffdf6', '#fff1cc', r() * 0.6), r, 3), { lw: 0.7, len: 4, density: 0.7, jitter: 0.5 }); }   // a fourth-look whisper, inside the glare
    // high cirrus — long thin wisps drawn along the wind, lit gold toward the sun
    for (let k = 0; k < 9; k++) {
      const y0 = 30 + rng() * 120, x0 = -40 + rng() * 760, L = 120 + rng() * 200, tilt = -0.08 + rng() * 0.12;
      strokes(out, counter, {
        rng, n: Math.round(L * 1.4),
        sample: r => { const t = r(); const x = x0 + t * L, y = y0 + t * L * tilt + Math.sin(t * 6 + k) * 5 + (r() - 0.5) * 7 * Math.sin(t * Math.PI);
                       return [x, y]; },
        dir: () => Math.atan(tilt) + (rng() - 0.5) * 0.25,
        col: (x, y, r) => jig(mix(mix(skyCol(x, y), '#f4f1ea', 0.45), '#ffe8b0', sunL(x, y) * 0.6), r, 5),
        len: 6, lw: 0.8, steps: 2, lenJ: 0.6, op: 0.5, relief: 0, impasto: 0.2,
      });
    }
  });

  /* ---------------- 2. THE CLOUDS (sky1 breathes; sky2 = their lit rims) ---------------- */
  // A cumulus is a heap of rounded masses: flat-ish base, billowing top. Each puff is lit on the side
  // facing the sun (warm white, gold near the sun), shadowed lavender-grey underneath and away from it.
  const banks = [
    { x: 40, y: 222, w: 230, h: 70 }, { x: 250, y: 236, w: 150, h: 46 },
    { x: 640, y: 214, w: 210, h: 66 }, { x: 760, y: 168, w: 110, h: 50 },
    { x: 150, y: 120, w: 140, h: 44 }, { x: 600, y: 84, w: 120, h: 34 },
  ];
  // each bank is a union of billows; its light comes from the GRADIENT of that union (a smooth height
  // field), so the bank is lit as one mass — the earlier per-puff rims drew a row of bright 'C's (cartoon)
  for (const B of banks) {
    B.p = [];
    const n = Math.round(B.w / 11);
    for (let i = 0; i < n; i++) {
      const t = (i + rng() * 0.9) / n, hump = Math.sin(t * Math.PI);
      const r = (B.h * 0.22 + rng() * B.h * 0.2) * (0.5 + hump * 0.7);
      B.p.push({ x: B.x - B.w / 2 + t * B.w + (rng() - 0.5) * 10, y: B.y - r * 0.5 - hump * B.h * 0.42 * (0.4 + rng() * 0.6), r });
    }
  }
  const field = (B, x, y) => { let f = 0; for (const P of B.p) { const q = 1 - ((x - P.x) ** 2 + ((y - P.y) / 0.82) ** 2) / (P.r * P.r); if (q > f) f = q; } return y > B.y ? f * Math.max(0, 1 - (y - B.y) / 3) : f; };
  const sunDir = (x, y) => { const a = Math.atan2(SUN.y - y, SUN.x - x); return [Math.cos(a), Math.sin(a)]; };
  const cloudLight = (B, x, y) => {
    const e = 2.5, gx = field(B, x + e, y) - field(B, x - e, y), gy = field(B, x, y + e) - field(B, x, y - e);
    const gl = Math.hypot(gx, gy) + 1e-6, nx = -gx / gl, ny = -gy / gl;           // outward normal of the billow
    const [sx, sy] = sunDir(x, y), f = field(B, x, y);
    const edge = Math.min(1, gl * 6);                                                // how near the silhouette
    return Math.max(0, Math.min(1, 0.5 + (nx * sx + ny * sy) * 0.45 * edge - Math.max(0, y - (B.y - B.h * 0.25)) / B.h * 0.9 + (1 - f) * 0.1));
  };
  const cloudCol = (B, x, y, r) => {
    const L = cloudLight(B, x, y);
    let c = ramp(['#9c97ad', '#b4adbd', '#cdc6cb', '#e6ded8', '#f7f1e8', '#fffaf1'], L);
    c = mix(c, '#ffdfa0', sunL(x, y) * Math.pow(L, 1.5) * 0.7);
    return jig(c, r, 4);
  };
  into('sky1', () => {
    for (const B of banks) strokes(out, counter, {
      rng, n: Math.round(B.w * B.h * 1.6),
      sample: r => { const x = B.x - B.w / 2 - 20 + r() * (B.w + 40), y = B.y - B.h * 1.2 + r() * B.h * 1.25; return field(B, x, y) > 0.02 ? [x, y] : null; },
      dir: (x, y) => { const e = 2.5, gx = field(B, x + e, y) - field(B, x - e, y), gy = field(B, x, y + e) - field(B, x, y - e);
                       return Math.atan2(gy, gx) + Math.PI / 2 + (rng() - 0.5) * 0.7; },        // marks wrap round the billows
      col: (x, y, r) => cloudCol(B, x, y, r),
      len: 3.2, lw: 1.0, steps: 2, follow: 0.9, lenJ: 0.6, impasto: 0.08, relief: 0,   // soft: a cloud is vapour, not a heap of pebbles
    });
  });
  into('sky2', () => {
    for (const B of banks) strokes(out, counter, {           // soft broken edges: wisps where the billows thin into sky
      rng, n: Math.round(B.w * 1.2),
      sample: r => { const x = B.x - B.w / 2 - 20 + r() * (B.w + 40), y = B.y - B.h * 1.2 + r() * B.h * 1.25; const f = field(B, x, y);
                     return f > 0 && f < 0.12 ? [x, y] : null; },
      dir: () => (rng() - 0.5) * 0.5,
      col: (x, y, r) => cloudCol(B, x, y, r),
      len: 3.5, lw: 0.9, steps: 2, op: 0.6, relief: 0,
    });
    // swallows, high and small — two swept wings each, dark against the bright sky (Ps 104:12 "the fowls of the heaven")
    const br = mulberry32(seed + 77);
    for (const [bx, by, bs, tilt] of [[250, 92, 4.2, 0.1], [276, 104, 3.4, -0.15], [236, 116, 3.0, 0.2], [700, 150, 3.6, -0.1], [560, 60, 2.6, 0.05]]) {
      const wing = side => { const tip = [bx + side * bs * 2.2, by - bs * (0.55 + br() * 0.3)], mid = [bx + side * bs * 1.1, by - bs * 0.5];
        out.push(E.ribbon([[bx, by], mid, tip], bs * 0.42, '#2d3048', [1, 0.7, 0.05])); counter.n++; };
      out.push(`<g transform="rotate(${R1(tilt * 57)} ${R1(bx)} ${R1(by)})">`); wing(-1); wing(1);
      out.push(E.ribbon([[bx, by - bs * 0.2], [bx + bs * 0.25, by + bs * 0.9]], bs * 0.45, '#262840', [1, 0.6, 0.1])); counter.n++;   // body and forked tail
      out.push('</g>');
    }
  });

  /* ---------------- 3. THE FAR COUNTRY — ridges, hills, hedgerows, copses ---------------- */
  // aerial perspective: the farther, the paler, bluer and lower in contrast
  const landCol = (x, y, near, r) => {
    const facing = (fbm((x - 6) / 60, y / 40, 51) - fbm((x + 6) / 60, y / 40, 51)) * 2.2;      // slopes toward the sun lighter
    let c = ramp(['#45663e', '#5b7d45', '#7a9650', '#9cae5c', '#c3c27a'], 0.35 + facing * 0.9 + fbm(x / 50, y / 30, 53) * 0.35 + sunFar(x, y) * 0.3);
    c = mix(c, '#f3d9a8', sunFar(x, y) * 0.25);
    c = mix(c, '#a2adc6', Math.max(0, 1 - near) * 0.55);                                         // distance turns it blue
    return jig(c, r, 7);
  };
  into('far', () => {
    // the farthest ridge
    const fill = (topFn, col) => { let d = `M-12 ${R1(topFn(-12))}`; for (let x = -12; x <= 812; x += 4) d += `L${x} ${R1(topFn(x))}`;
      out.push(`<path d="${d}L812 330L-12 330Z" fill="${col}"/>`); counter.n++; };
    fill(ridgeFar, '#9fa9c2');
    strokes(out, counter, { rng, n: 14000, sample: rej(-10, 200, 810, 330, (x, y) => y > ridgeFar(x) + 1),
      dir: (x, y) => (fbm(x / 40, y / 20, 61) - 0.5) * 0.6, col: (x, y, r) => landCol(x, y, 0.05 + (y - ridgeFar(x)) / 140, r),
      len: 3.2, lw: 1.0, steps: 2, lenJ: 0.6, impasto: 0.1, relief: 0 });
    // the nearer hills
    fill(ridgeMid, '#7d9a62');
    strokes(out, counter, { rng, n: 8000, sample: rej(-10, 220, 810, 330, (x, y) => y > ridgeMid(x) + 1),
      dir: (x, y) => (fbm(x / 40, y / 20, 63) - 0.5) * 0.7, col: (x, y, r) => landCol(x, y, 0.5 + (y - ridgeMid(x)) / 80, r),
      len: 3.6, lw: 1.1, steps: 2, lenJ: 0.6, impasto: 0.35, relief: 0.15 });
    // fields on the hills: long soft patches following the contours, gold and green
    for (let i = 0; i < 26; i++) {
      const fx = -20 + rng() * 840, fy = ridgeMid(fx) + 6 + rng() * 26, fw = 30 + rng() * 60, fh = 3 + rng() * 5;
      const col = rng() < 0.45 ? '#c8b866' : (rng() < 0.5 ? '#8ea65a' : '#a7b46c');
      strokes(out, counter, { rng, n: Math.round(fw * 1.2),
        sample: r => [fx + (r() - 0.5) * fw, fy + (r() - 0.5) * fh], dir: () => (rng() - 0.5) * 0.15,
        col: (x, y, r) => jig(mix(mix(col, '#a7b2c8', 0.25), '#f3d9a8', sunFar(x, y) * 0.25), r, 4),
        len: 3, lw: 1.0, steps: 1, op: 0.6, relief: 0 });
    }
    // hedgerows and copses: small dark-belly, lit-crown masses along the contours, shrinking with distance
    const copse = (cx, cy, s, near) => {
      const n = 2 + ((rng() * 4) | 0);
      for (let i = 0; i < n; i++) {
        const tx = cx + (rng() - 0.5) * s * 3, rr = s * (0.6 + rng() * 0.5), ty = cy - rr * 0.6;
        strokes(out, counter, { rng, n: Math.round(rr * rr * 3.2 + 6),
          sample: r => { const a = r() * 6.283, d = Math.sqrt(r()); return [tx + Math.cos(a) * rr * d * 1.1, ty + Math.sin(a) * rr * d * 0.85]; },
          dir: (x, y) => Math.atan2(y - ty, x - tx) + Math.PI / 2,
          col: (x, y, r) => { const crown = Math.max(0, Math.min(1, (ty - y) / rr * 0.5 + 0.5));
            let c = ramp(['#24402a', '#355a32', '#4f7a3c', '#759a4c', '#a6be66'], crown * 0.9 + sunFar(x, y) * 0.15);
            c = mix(c, '#efe2a0', crown * crown * 0.35); c = mix(c, '#a7b2c8', (1 - near) * 0.55); return jig(c, r, 6); },
          len: Math.max(1.2, rr * 0.35), lw: Math.max(0.8, rr * 0.22), steps: 2, lenJ: 0.6, impasto: 0.4, relief: 0.2 });
      }
    };
    for (let x = -20; x < 820; x += 5 + rng() * 9) { const y = ridgeMid(x) + 3 + rng() * 4; if (fbm(x / 90, 3, 71) > 0.42) copse(x, y, 2.4 + rng() * 1.6, 0.45); }   // woods along the crest, in stretches
    for (let k = 0; k < 4; k++) {                                 // belts of wood lying along the lower slopes
      const x0 = -20 + rng() * 700, x1 = x0 + 80 + rng() * 200, off = 12 + rng() * 22;
      for (let x = x0; x < x1; x += 4 + rng() * 4) copse(x, ridgeMid(x) + off + Math.sin(x / 30) * 2, 2.2 + rng() * 1.2, 0.6);
    }
    // a village on the far slope: whitewashed walls lit by the low sun, terracotta roofs, one chimney smoking —
    // tiny and hazed by distance, so it reads as far away (people live here; it was made for them too)
    { const vr = mulberry32(seed + 501), houses = [];
      for (let i = 0; i < 16; i++) { const hx = 590 + vr() * 150, hy = ridgeMid(hx) + 12 + vr() * 16; houses.push([hx, hy, 7 + vr() * 6, 5 + vr() * 3.5]); }
      houses.push([668, ridgeMid(668) + 11, 5, 17, 1]);                 // a small tower
      houses.sort((a, b) => a[1] - b[1]);
      for (const [hx, hy, w, h, tower] of houses) {
        const wall = mix(mix('#f6e8cc', '#d8c6a4', vr() * 0.4), '#a7b2c8', 0.15), shade = mix('#8a8288', '#a7b2c8', 0.2);
        out.push(`<rect x="${R1(hx - w / 2)}" y="${R1(hy - h)}" width="${R1(w * 0.62)}" height="${R1(h)}" fill="${wall}"/>`);           // sunlit face
        out.push(`<rect x="${R1(hx - w / 2 + w * 0.62)}" y="${R1(hy - h)}" width="${R1(w * 0.38)}" height="${R1(h)}" fill="${shade}"/>`); // shaded side
        const rh = tower ? 2.6 : h * 0.55, roof = mix(mix('#a84c30', '#c46a40', vr()), '#a7b2c8', 0.12);
        out.push(`<path d="M${R1(hx - w / 2 - 0.5)} ${R1(hy - h)}L${R1(hx)} ${R1(hy - h - rh)}L${R1(hx + w / 2 + 0.5)} ${R1(hy - h)}Z" fill="${roof}"/>`);
        counter.n += 3;
      }
      const cx0 = 640, cy0 = ridgeMid(640) + 6;                         // smoke drifting away from the sun
      strokes(out, counter, { rng: vr, n: 70, sample: r => { const t = r(); return [cx0 + t * 26 + Math.sin(t * 5) * 3, cy0 - t * 22]; },
        dir: () => -0.7, col: (x, y, r) => jig(mix('#d6d2d4', '#eef0f2', r()), r, 4), len: 3, lw: 2.2, steps: 2, op: 0.3, relief: 0 }); }
    for (let k = 0; k < 3; k++) {                                 // hedgerows down the near slopes
      const x0 = -20 + rng() * 500, x1 = x0 + 160 + rng() * 260, y0 = ridgeMid(x0) + 14 + k * 9;
      for (let x = x0; x < x1; x += 5 + rng() * 5) copse(x, y0 + (x - x0) * 0.04 + Math.sin(x / 40) * 3, 1.8 + rng(), 0.5);
    }
  });

  /* ---------------- 4. THE MEADOW + TWO TREES (mid) ---------------- */
  const swell = (x, y) => fbm(x / 170, y / 70, 313);
  const facing = (x, y) => (swell(x - 7, y) - swell(x + 7, y)) * 2.2 + (swell(x, y - 7) - swell(x, y + 7)) * 1.3;
  const haze = y => Math.max(0, Math.min(1, 1 - (y - 290) / 70));
  const grassCol = (x, y, r, lift) => {
    const dp = depthOf(y);
    let c = ramp(['#2f5f2c', '#3d7032', '#52863b', '#6c9c45', '#8db455', '#b3c96c'],
      fbm(x / 46, y / 30, 93) * 0.45 + dp * 0.12 + facing(x, y) * 0.6 + swell(x, y) * 0.2 + lift + sunFar(x, y) * 0.25);
    c = mix(c, '#f2dc98', sunFar(x, y) * 0.22);                       // late sun warms the grass
    if (r() < 0.18) c = mix(c, '#3b4f5a', 0.18);                       // broken colour in the shade
    c = mix(c, '#c9ccb4', haze(y) * 0.45);                             // the brow melts into the far haze
    return jig(c, r, 10);
  };
  into('mid', () => {
    let d = `M-12 ${R1(brow(-12))}`; for (let x = -12; x <= 812; x += 3) d += `L${x} ${R1(brow(x) + (fbm(x / 3, 2, 7) - 0.5) * 4)}`;
    out.push(`<path d="${d}L812 512L-12 512Z" fill="#4f803a"/>`); counter.n++;
    const inField = (x, y) => y > brow(x) - 1;
    strokes(out, counter, { rng, n: 2600, sample: rej(-10, 250, 810, 512, inField),                    // 1 · the sward
      dir: (x, y) => -0.15 + (fbm(x / 60, y / 30, 95) - 0.5) * 0.6, col: (x, y, r) => grassCol(x, y, r, 0),
      len: (x, y) => 12 * dS(y), lw: (x, y) => 3.2 * dS(y), steps: 3, lenJ: 0.5, impasto: 0.45, relief: 0.35 });
    strokes(out, counter, { rng, n: 5200, sample: rej(-10, 250, 810, 512, inField),                    // 2 · the body
      dir: (x, y) => -Math.PI / 2 + (fbm(x / 30, y / 20, 97) - 0.5) * 0.7, col: (x, y, r) => grassCol(x, y, r, 0.06),
      len: (x, y) => 7 * dS(y), lw: (x, y) => 1.8 * dS(y), steps: 2, lenJ: 0.7, impasto: 0.5, relief: 0.3 });
    strokes(out, counter, { rng, n: 3600, sample: rej(-10, 270, 810, 512, (x, y) => y > brow(x) + 3),   // 3 · blades standing up
      dir: (x, y) => -Math.PI / 2 + (fbm(x / 11, y / 9, 101) - 0.5) * 1.1, col: (x, y, r) => grassCol(x, y, r, 0.22),
      len: (x, y) => 9 * dS(y), lw: (x, y) => 1.05 * dS(y), steps: 2, lenJ: 0.8, impasto: 0.6 });
    strokes(out, counter, { rng, n: 2800,                                                               // 4 · the fine nap
      sample: r => { const x = -10 + r() * 820, y = 300 + Math.pow(r(), 0.8) * 212; return y > brow(x) ? [x, y] : null; },
      dir: (x, y) => -Math.PI / 2 + (fbm(x / 7, y / 6, 103) - 0.5) * 1.5, col: (x, y, r) => grassCol(x, y, r, 0.3),
      len: (x, y) => 6 * dS(y), lw: (x, y) => 0.8 * dS(y), steps: 2, lenJ: 0.85, impasto: 0.7 });
    for (let i = 0; i < 130; i++) {                                                                     // tufts
      const tx = -10 + rng() * 820, ty = 300 + Math.pow(rng(), 0.6) * 205; if (ty < brow(tx) + 4) continue;
      const sc = dS(ty);
      strokes(out, counter, { rng, n: 14, sample: r => [tx + (r() + r() - 1) * 9 * sc, ty - Math.pow(r(), 0.7) * 11 * sc],
        dir: (x) => -Math.PI / 2 + (x - tx) * 0.05 + (rng() - 0.5) * 0.5, col: (x, y, r) => grassCol(x, y, r, 0.3),
        len: 10 * sc, lw: 1.1 * sc, steps: 2, lenJ: 0.7, impasto: 0.65 });
    }
    // ── THE STREAM ("he leadeth me beside the still waters", Ps 23:2) — down from the valley behind the child,
    // widening toward us; it mirrors the sky (gold near the sun's line, blue elsewhere), dark banks, sun glints
    const SP = t => [300 + 500 * t + 40 * Math.sin(t * 7), 298 + 176 * Math.pow(t, 1.6)];
    const SW = t => 5 + 64 * Math.pow(t, 1.5);
    const SPTS = []; for (let t = 0; t <= 1.0001; t += 0.01) SPTS.push([...SP(t), SW(t)]);
    const inStream = (x, y, m = 0) => { for (const [px, py, w] of SPTS) if ((x - px) ** 2 + ((y - py) * 1.6) ** 2 < (w / 2 + m) ** 2) return true; return false; };
    { const sr = mulberry32(seed + 311);
      strokes(out, counter, { rng: sr, n: 7000, sample: r => { const t = Math.sqrt(r()), [px, py] = SP(t), w = SW(t); return [px + (r() - 0.5) * w * 1.3, py + (r() - 0.5) * w * 0.4]; },
        dir: () => (sr() - 0.5) * 0.2,                                   // ripples lie flat
        col: (x, y, r) => { if (!inStream(x, y, 1.5)) return jig(mix('#2c4a2a', '#41623a', r()), r, 6);   // the bank: wet dark grass
          let c = ramp(['#2f4f86', '#46699e', '#6f90c0', '#a6bed8', '#e2e8e4'], 0.1 + r() * 0.45 + (y - 300) / 500);   // deeper toward us; it mirrors the blue sky
          c = mix(c, '#ffe7b0', Math.max(0, 1 - Math.abs(x - SUN.x) / 160) * 0.55);                          // the sun's path on the water
          return jig(c, r, 5); },
        len: (x, y) => 5 * dS(y), lw: (x, y) => 1.2 * dS(y), steps: 1, lenJ: 0.6, impasto: 0.2, relief: 0 });
      for (let i = 0; i < 160; i++) { const t = 0.15 + sr() * 0.85, [px, py] = SP(t), w = SW(t);                  // glints
        const gx = px + (sr() - 0.5) * w * 0.9, gy = py + (sr() - 0.5) * w * 0.2; if (!inStream(gx, gy)) continue;
        out.push(E.ribbon([[gx, gy], [gx + 2.5 * dS(gy), gy]], 0.7 * dS(gy), '#fffbe8', [0.4, 1, 0.4])); counter.n++; }
      for (let i = 0; i < 26; i++) { const t = 0.3 + sr() * 0.7, [px, py] = SP(t), w = SW(t), side = sr() < 0.5 ? -1 : 1;   // reeds at the edge
        const rx = px + side * w * 0.62, ry = py + 1; const sc = dS(ry);
        for (let k = 0; k < 5; k++) paintPath(out, counter, sr, [[rx + k * 1.2 * sc, ry], [rx + k * 1.2 * sc + (sr() - 0.5) * 3 * sc, ry - (8 + sr() * 8) * sc]],
          (x, y, r) => jig(mix('#4a6a30', '#9aa45a', r()), r, 6), { lw: 0.8 * sc, len: 3, density: 0.9, jitter: 0.2 }); } }
    // ── THE FLOCK, grazing (Ps 23:1) — wool lit on the back, shadowed under, dark faces down in the grass
    const sheep = (x, y, facing, sr) => {
      const sc = dS(y) * 1.9, bw = 6.5 * sc, bh = 4.4 * sc;
      groundShadow(out, counter, x + 1.5 * sc, y + 0.4 * sc, bw * 1.1, 1.3 * sc, { dir: 0.6, reach: 1, op: 0.45, tint: '#25381f' });
      for (const lx of [-0.55, -0.25, 0.3, 0.55]) out.push(E.ribbon([[x + lx * bw, y - bh * 0.5], [x + lx * bw, y]], 0.8 * sc, '#2a2622', [1, 1])), counter.n++;
      strokes(out, counter, { rng: sr, n: Math.round(40 + sc * 30),
        sample: r => { const a = r() * 6.283, d = Math.sqrt(r()); return [x + Math.cos(a) * bw * d, y - bh * 0.95 + Math.sin(a) * bh * 0.7 * d]; },
        dir: (px, py) => Math.atan2(py - (y - bh * 0.95), px - x) + Math.PI / 2,
        col: (px, py, r) => { const up = Math.max(0, Math.min(1, 0.55 - (py - (y - bh * 0.95)) / bh * 1.2)); return jig(mix(ramp(['#a8a294', '#d2cab6', '#ece4d0', '#fdf8ea'], up), '#ffe6b8', sunFar(px, py) * up * 0.4), r, 4); },
        len: 1.6 * sc, lw: 1.3 * sc, steps: 2, impasto: 0.4, relief: 0.15, flow: 0 });
      const hx = x + facing * bw * 1.05, hy = y - bh * 0.55;                    // head down, grazing
      out.push(E.ribbon([[x + facing * bw * 0.7, y - bh * 1.05], [hx, hy - bh * 0.1], [hx + facing * 1.4 * sc, hy + bh * 0.5]], 2.3 * sc, '#2e2a26', [0.9, 1, 0.7])); counter.n++;
    };
    { const fr = mulberry32(seed + 733), flock = [];
      for (let i = 0; i < 11; i++) flock.push([150 + fr() * 150, 312 + fr() * 30]);     // on the slope behind the child
      for (let i = 0; i < 7; i++) flock.push([560 + fr() * 160, 330 + fr() * 34]);      // and across the stream
      flock.sort((a, b) => a[1] - b[1]);
      for (const [x, y] of flock) if (y > brow(x) + 4 && !inStream(x, y, 6)) sheep(x, y, fr() < 0.5 ? -1 : 1, fr); }
    // flowers in colonies — one kind to a patch, a stem and a face, thinning with distance (Song 2:12)
    const KINDS = [['#f6f2e6', '#e9e2cf', '#f4d24a'], ['#f5d04a', '#e8b833', '#a8641e'], ['#c9b4e8', '#ad96d8', '#f2e28a'],
                   ['#e0566a', '#c63f55', '#3a2420'], ['#f0a8c4', '#e48eb0', '#fbe9a8']];
    for (let c = 0; c < 46; c++) {
      const cx = -10 + rng() * 820, cy = 304 + rng() * 200;
      if (cy < brow(cx) + 8 || inStream(cx, cy, 8) || (cx > 280 && cx < 440 && cy > 380 && cy < 432)) continue;   // the child's spot and the water stay clear
      const K = KINDS[(rng() * KINDS.length) | 0], spread = 14 + rng() * 40, count = 5 + ((rng() * 10) | 0);
      for (let i = 0; i < count; i++) {
        const fx = cx + (rng() + rng() - 1) * spread, fy = cy + (rng() + rng() - 1) * spread * 0.35;
        if (fy < brow(fx) + 6 || inStream(fx, fy, 3)) continue;
        const sc = dS(fy), st = (5 + rng() * 7) * sc;
        paintPath(out, counter, rng, [[fx, fy], [fx + (rng() - 0.5) * 3 * sc, fy - st]], (x, y, r) => jig(mix('#3d6a32', '#6c9442', r()), r, 6), { lw: 0.9 * sc, len: 3, density: 0.9, jitter: 0.2 });
        const hd = 1.6 * sc;
        for (let k = 0; k < 5; k++) {
          const a = k * 1.256 + rng() * 0.4, px = fx + Math.cos(a) * hd, py = fy - st + Math.sin(a) * hd * 0.6;
          out.push(E.ribbon([[fx, fy - st], [(fx + px) / 2, (fy - st + py) / 2], [px, py]], 1.5 * sc, K[(rng() * 2) | 0], [0.5, 1, 0.6])); counter.n++;
        }
        out.push(`<circle cx="${R1(fx)}" cy="${R1(fy - st)}" r="${R1(0.8 * sc)}" fill="${K[2]}"/>`); counter.n++;
      }
    }
    // two trees standing IN the meadow, their shadows thrown away from the sun
    const tree = (x, y, h, sp, sd) => E.paintTree(out, counter, mulberry32(seed + sd), x, y, h, {
      species: sp, lightFn: (px, py) => sunFar(px, py) * 1.3, shadowDir: x < SUN.x ? -1 : 1, blossom: 0, real: true });
    tree(98, 452, 210, 'oak', 11);        // a great oak at the left, framing the valley
    tree(720, 362, 96, 'oak', 23);        // a smaller olive farther off on the right
    tree(612, 318, 40, 'oak', 37);        // and one far down the meadow, small with distance
    tree(500, 322, 44, 'willow', 41);     // a willow leaning over the water
    tree(214, 310, 30, 'oak', 43); tree(236, 312, 24, 'oak', 47); tree(196, 314, 22, 'olive', 53);   // a grove on the far slope behind the child
    tree(770, 330, 54, 'oak', 59); tree(792, 336, 40, 'olive', 61);                                     // trees along the far bank
    tree(352, 302, 20, 'oak', 67);        // and one tiny far off where the valley opens
    // low bushes, rooted in the grass (no outlines — a shrub is a small dark-bellied mass)
    for (const [bx, by, bw] of [[22, 476, 30], [600, 452, 24], [470, 362, 13], [760, 486, 30]]) {
      if (inStream(bx, by, 10)) continue;
      const cl = []; for (let k = 0; k < 5; k++) cl.push([bx + (rng() - 0.5) * bw * 1.3, by - bw * (0.3 + rng() * 0.45), bw * (0.35 + rng() * 0.25)]);
      cl.sort((a, b) => b[1] - a[1]);
      for (const [cx, cy, cr] of cl) strokes(out, counter, { rng, n: Math.round(cr * cr * 1.6),
        sample: r => { const a = r() * 6.283, d = Math.sqrt(r()); const y = cy + Math.sin(a) * cr * 0.8 * d; return y < by ? [cx + Math.cos(a) * cr * d, y] : null; },
        dir: (x, y) => Math.atan2(y - cy, x - cx) + Math.PI / 2 + (rng() - 0.5) * 0.6,
        col: (x, y, r) => { const up = Math.max(0, Math.min(1, (cy - y) / cr * 0.5 + 0.5)); let c = ramp(['#1e3a20', '#2d5428', '#457434', '#6a9644', '#9cbc5c'], up * 0.85 + r() * 0.15); c = mix(c, '#efe2a0', up * up * 0.3); return jig(c, r, 7); },
        len: 2.6 * dS(by), lw: 1.6 * dS(by), steps: 2, lenJ: 0.6, impasto: 0.5, relief: 0.25 });
    }
    // ✦ "1 John 4:8" in Greek, cut into the near turf (kept from the old plate)
    E.inscriptionText(out, E.greekRef(4, 8), { x: 520, y: 488, h: 13, body: '#e9e0bc', edge: '#14200f', op: 0.5, edgeOp: 0.4 });
  });

  /* ---------------- 5. THE HEN AND HER CHICKS + THE NEAREST GRASS (fg) ---------------- */
  // "how often would I have gathered thy children together, even as a hen gathereth her chickens under
  // her wings" (Matt 23:37) — the picture Jesus Himself gave of His love. A real russet hen, sitting,
  // wing lowered over her chicks, in the sun beside the child. Feathers are brush marks along her form.
  into('fg', () => {
    const hr = mulberry32(seed + 2337);
    const HX = 404, HY = 424, S = 1.15;                     // her foot point on the ground, and her scale (≈ 44 units long)
    // ⭐ DRAWN FROM A REAL HEN'S PROFILE (sitting, facing the child on the left): a silhouette first, then
    // every feather mark sampled INSIDE it — so she has a hen's shape, not a loaf with a stick on it.
    const P = (pts) => pts.map(([x, y]) => [HX + x * S, HY + y * S]);
    const inPoly = (poly, x, y) => { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const [xi, yi] = poly[i], [xj, yj] = poly[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; };
    const bbox = poly => { let a = 1e9, b = 1e9, c = -1e9, d = -1e9; for (const [x, y] of poly) { a = Math.min(a, x); b = Math.min(b, y); c = Math.max(c, x); d = Math.max(d, y); } return [a, b, c, d]; };
    const fillIn = (poly, n, dir, col, len, lw) => { const [x0, y0, x1, y1] = bbox(poly);
      strokes(out, counter, { rng: hr, n, sample: r => { const x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0); return inPoly(poly, x, y) ? [x, y] : null; },
        dir, col, len, lw, steps: 2, lenJ: 0.5, impasto: 0.5, relief: 0.3, flow: 0 }); };
    const BODY = P([[-12, -9], [-11, -15], [-6, -18], [2, -18.5], [9, -17], [14, -15], [16, -10], [14, -4], [8, -0.5], [-2, 0], [-9, -2.5]]);
    const TAIL = P([[9, -16], [12, -22], [14, -28], [17.5, -29], [20, -25], [19.5, -18], [16, -11], [13, -12]]);
    const NECK = P([[-12, -10], [-13.5, -15], [-14, -20], [-12.5, -24.5], [-9, -25.5], [-7, -22], [-6.5, -17], [-7, -13]]);
    const HEAD = P([[-15.5, -24], [-15, -27.5], [-12.5, -29.5], [-9.5, -29], [-8, -26.5], [-9, -23.5], [-12.5, -22.5]]);
    const WING = P([[-4, -14.5], [2, -16], [8, -14.8], [12.5, -11.5], [12.5, -6.5], [8.5, -3.2], [1.5, -2.8], [-3.5, -5], [-5.5, -9]]);
    const RUS = ['#3d2216', '#5a321e', '#7a4826', '#9a6234', '#ba8048', '#d6a46a', '#ecc896'];   // chestnut, not orange
    const lightAt = (x, y, cy, h) => Math.max(0, Math.min(1, 0.62 - (y - cy) / h * 0.9 - (x - HX) / (40 * S) * 0.18));
    groundShadow(out, counter, HX + 4, HY + 1, 24 * S, 4 * S, { dir: 0.8, reach: 1, op: 0.55, tint: '#24331e' });
    // tail: dark bronze-green sickles fanning up and back
    fillIn(TAIL, 160, (x, y) => -1.25 + (x - HX - 15 * S) * 0.04 + (hr() - 0.5) * 0.3,
      (x, y, r) => jig(ramp(['#1d1610', '#2c2418', '#3d3a24', '#5a4426', '#7a5a2e'], r() * 0.7 + lightAt(x, y, HY - 22 * S, 16 * S) * 0.3), r, 5), 4 * S, 1.2 * S);
    // body: feathers lying back along her (pointing to the tail), golden on the sunlit back, deep at the belly
    fillIn(BODY, 900, (x, y) => 0.12 + (y - (HY - 9 * S)) * 0.02 + (hr() - 0.5) * 0.35,
      (x, y, r) => jig(mix(ramp(RUS, 0.12 + lightAt(x, y, HY - 9 * S, 18 * S) * 0.8 + (r() - 0.5) * 0.06), '#ffdf9e', sunFar(x, y) * 0.1), r, 3), 2.6 * S, 1.15 * S);
    // neck hackles: long golden feathers flowing down over the shoulders
    fillIn(NECK, 360, (x, y) => 1.75 + (hr() - 0.5) * 0.3,
      (x, y, r) => jig(ramp(['#7a4a24', '#a46a38', '#c88e54', '#e2b47e', '#f2d4a6'], 0.25 + lightAt(x, y, HY - 18 * S, 14 * S) * 0.75 + (r() - 0.5) * 0.15), r, 5), 3 * S, 1 * S);
    fillIn(HEAD, 160, (x, y) => (hr() - 0.5) * 3,
      (x, y, r) => jig(ramp(['#8a5a30', '#b47e4a', '#d4a46c', '#ecca98'], 0.35 + lightAt(x, y, HY - 26 * S, 8 * S) * 0.6), r, 5), 1.4 * S, 0.9 * S);
    // comb, wattle, beak, eye — small and true to a hen
    const comb = P([[-14, -28.5], [-13.6, -31], [-12.6, -29.6], [-11.8, -31.6], [-10.9, -29.7], [-10, -31], [-9.4, -29]]);
    fillIn(comb, 60, () => -1.57, (x, y, r) => jig(ramp(['#8e1d1d', '#c42f2a', '#e0524a'], 0.4 + r() * 0.5), r, 6), 1.2 * S, 0.9 * S);
    fillIn(P([[-14.6, -23.5], [-14.2, -20.8], [-12.9, -20.6], [-12.8, -23]]), 30, () => 1.57, (x, y, r) => jig(mix('#9e2222', '#d0403a', r()), r, 6), 1 * S, 0.8 * S);
    out.push(E.ribbon(P([[-15.4, -26], [-17.6, -25], [-18.6, -24.4]]), 1.3 * S, '#d2a04c', [1, 0.6, 0.15])); counter.n++;
    out.push(`<circle cx="${R1(HX - 12.6 * S)}" cy="${R1(HY - 26.4 * S)}" r="${R1(0.62 * S)}" fill="#1c120c"/><circle cx="${R1(HX - 12.4 * S)}" cy="${R1(HY - 26.7 * S)}" r="${R1(0.22 * S)}" fill="#fff4dc"/>`); counter.n += 2;
    // chicks first, so the wing laps over their backs
    const chick = (cx, cy, r, look) => {
      const body = []; for (let i = 0; i < 14; i++) { const a = i / 14 * 6.283; body.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r * 0.82]); }
      fillIn(body, 70, (x, y) => Math.atan2(y - cy, x - cx) + Math.PI / 2 + (hr() - 0.5) * 0.9,
        (x, y, q) => jig(ramp(['#a87a28', '#d6a83c', '#efca5c', '#fbe79c'], lightAt(x, y, cy, r * 2) + (q() - 0.5) * 0.2), q, 5), 1.1 * S, 0.8 * S);
      const hx = cx + look * r * 0.55, hy = cy - r * 0.75, hr2 = r * 0.6, hd = [];
      for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283; hd.push([hx + Math.cos(a) * hr2, hy + Math.sin(a) * hr2]); }
      fillIn(hd, 36, () => (hr() - 0.5) * 3, (x, y, q) => jig(ramp(['#d6a83c', '#f2d064', '#fdeca8'], 0.4 + q() * 0.6), q, 5), 0.9 * S, 0.7 * S);
      out.push(E.ribbon([[hx + look * hr2 * 0.85, hy + 0.2], [hx + look * (hr2 + 1.1 * S), hy + 0.5]], 0.7 * S, '#d98b2a', [1, 0.3])); counter.n++;
      out.push(`<circle cx="${R1(hx + look * hr2 * 0.3)}" cy="${R1(hy - hr2 * 0.15)}" r="${R1(0.35 * S)}" fill="#1c120c"/>`); counter.n++;
    };
    chick(HX - 19 * S, HY - 2.6 * S, 2.6 * S, -1);          // at her breast, out in front
    chick(HX - 9 * S, HY - 2.2 * S, 2.3 * S, -1);           // peeping out from under the wing's front edge
    chick(HX + 13.5 * S, HY - 2.1 * S, 2.1 * S, 1);         // and one out the back
    // the wing, lowered and spread like a tent over them: feather rows overlapping, darker, tips toward the tail
    fillIn(WING, 520, (x, y) => 0.32 + (hr() - 0.5) * 0.25,
      (x, y, r) => { const row = (y - (HY - 16 * S)) / (14 * S); return jig(ramp(['#3a2216', '#54301c', '#6e4224', '#8e5a30', '#ae7642'], 0.6 - row * 0.35 + lightAt(x, y, HY - 10 * S, 18 * S) * 0.25 + (r() - 0.5) * 0.08), r, 3); },
      3.2 * S, 1.3 * S);
    // (no bright stroke along the wing's top — it read as a stick laid on her back)
    // grass blades growing up in front of her feet, so she sits IN the meadow, not on it
    strokes(out, counter, { rng: hr, n: 90, sample: q => [HX - 30 * S + q() * 56 * S, HY + 2 - q() * 4],
      dir: () => -Math.PI / 2 + (hr() - 0.5) * 0.7, col: (x, y, q) => grassCol(x, y, q, 0.25),
      len: 7, lw: 1.2, steps: 2, lenJ: 0.6, impasto: 0.6 });
    // the nearest grass along the bottom edge, dark against the light, for depth
    strokes(out, counter, { rng, n: 1100, sample: rej(-6, 462, 806, 512, (x, y) => !(x > 250 && x < 400 && y < 480)),
      dir: (x, y) => -Math.PI / 2 + (fbm(x / 9, y / 7, 131) - 0.5) * 1.2,
      col: (x, y, r) => { let c = ramp(['#1f3d1e', '#2f5a2a', '#467634', '#669643'], r() * 0.8 + fbm(x / 24, y / 16, 133) * 0.3); c = mix(c, '#f0e2a0', sunFar(x, y) * 0.25); return jig(c, r, 9); },
      len: (x, y) => 12 + (y - 462) * 0.18, lw: 1.5, steps: 2, lenJ: 0.8, impasto: 0.7 });
  });

  /* ---------------- planes ---------------- */
  const ALT = 'A green valley in late-afternoon sun, full of life: a deep blue sky warming to gold around the sun, white cumulus clouds lit golden on the sun side, pale blue ridges and green hills with hedgerows and copses far off, a village with a smoking chimney on the far hill, swallows high in the sky, a stream winding down through the meadow past a willow and reeds, sheep grazing on both slopes, and wildflowers, bushes and oaks casting their shadows. In the grass near the child a russet hen sits with her wing spread low, chicks peeping out from under it and one at her breast looking up at her — as a hen gathers her chickens under her wings.';
  const RAW = { undercoat: 0, weave: 0, varnish: 0, oil: 0 };
  const pick = name => ranges[name].map(([a, b]) => out.slice(a, b).join('\n')).join('\n');
  if (ranges[LAYER]) return svgWrap(ALT, pick(LAYER), RAW);
  return svgWrap(ALT, out.join('\n'));
}
