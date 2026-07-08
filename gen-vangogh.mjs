#!/usr/bin/env node
// gen-vangogh.mjs — generative Van Gogh brushstroke plates for balthazar.sh
// Every stroke is authored: sampled in a region, bent by a flow field,
// colored from a ramp with per-stroke jitter (the shimmer).
// Run: node gen-vangogh.mjs  → rewrites vangogh-preview.html

import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = dirname(fileURLToPath(import.meta.url));

// ---------- PRNG ----------
function mulberry32(seed) {
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
function vnoise(x, y, seed) {
  const ix = Math.floor(x), iy = Math.floor(y);
  const fx = smooth(x - ix), fy = smooth(y - iy);
  const a = hash2(ix, iy, seed), b = hash2(ix + 1, iy, seed);
  const c = hash2(ix, iy + 1, seed), d = hash2(ix + 1, iy + 1, seed);
  return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
}
function fbm(x, y, seed, oct = 3) {
  let v = 0, amp = 0.5, f = 1;
  for (let i = 0; i < oct; i++) { v += amp * vnoise(x * f, y * f, seed + i * 77); amp *= 0.5; f *= 2; }
  return v;
}
// curl of noise → divergence-free swirling vector
function curlV(x, y, seed, scale, oct = 3) {
  const e = 0.9;
  const dx = fbm((x + e) / scale, y / scale, seed, oct) - fbm((x - e) / scale, y / scale, seed, oct);
  const dy = fbm(x / scale, (y + e) / scale, seed, oct) - fbm(x / scale, (y - e) / scale, seed, oct);
  return [dy / (2 * e), -dx / (2 * e)]; // perpendicular to gradient
}
// tangential swirl around a center; weight falls with distance
function swirlV(x, y, cx, cy, strength, falloff) {
  const dx = x - cx, dy = y - cy;
  const d = Math.hypot(dx, dy) + 1e-6;
  const w = strength / (1 + d / falloff);
  return [(-dy / d) * w, (dx / d) * w];
}

// ---------- color ----------
const hx = c => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
const hexC = (r, g, b) => '#' + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
function mix(a, b, t) { const A = hx(a), B = hx(b); return hexC(A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t); }
function ramp(cols, t) {
  t = Math.max(0, Math.min(1, t));
  const f = t * (cols.length - 1);
  const i = Math.min(Math.floor(f), cols.length - 2);
  return mix(cols[i], cols[i + 1], f - i);
}
// per-stroke jitter — the shimmer: adjacent strokes differ slightly
function jig(c, rng, amt = 14) {
  const [r, g, b] = hx(c);
  return hexC(r + (rng() * 2 - 1) * amt, g + (rng() * 2 - 1) * amt, b + (rng() * 2 - 1) * amt);
}
// perceived luminance 0..1 — gates the impasto double-strike
function lum(c) { const [r, g, b] = hx(c); return (r * 0.299 + g * 0.587 + b * 0.114) / 255; }

// PALETTE (shared gold across all three plates)
const GOLD = '#f0d489', GOLD_PALE = '#ffe9a0', GOLD_DEEP = '#e8b33d', GOLD_HOT = '#fff6d8';
const NIGHT = ['#131b38', '#1a2550', '#2a3f7e', '#3d5aa8', '#5d7cc0'];
const DARKEST = '#131b38';

// ---------- stroke ribbon (tapered filled polygon, 1 path) ----------
const R1 = v => Math.round(v * 10) / 10;
function ribbon(pts, w, fill, profile) {
  // tangents
  const n = pts.length;
  const L = [], R = [];
  const prof = profile || [0.46, 0.5, 0.4, 0.18];
  for (let i = 0; i < n; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[Math.min(n - 1, i + 1)];
    let tx = p1[0] - p0[0], ty = p1[1] - p0[1];
    const tl = Math.hypot(tx, ty) || 1; tx /= tl; ty /= tl;
    const hw = w * (prof[i] !== undefined ? prof[i] : prof[prof.length - 1]);
    L.push([pts[i][0] - ty * hw, pts[i][1] + tx * hw]);
    R.push([pts[i][0] + ty * hw, pts[i][1] - tx * hw]);
  }
  let d = `M${R1(L[0][0])} ${R1(L[0][1])}`;
  for (let i = 1; i < n; i++) d += `L${R1(L[i][0])} ${R1(L[i][1])}`;
  for (let i = n - 1; i >= 0; i--) d += `L${R1(R[i][0])} ${R1(R[i][1])}`;
  return `<path d="${d}Z" fill="${fill}"/>`;
}

// ---------- stroke layer ----------
// sample(rng)->[x,y]|null, dir(x,y)->angle, col(x,y,rng)->hex
// wild>0: long-tailed brush — that fraction of strokes leave the polite band:
//   most of them long raking 1-2px hairlines, the rest short fat 8-14px slabs.
// aJ may be a function (x,y)->radians for zone-aware slash aggression.
// impasto>0: strokes brighter than that luminance get a darker understroke
//   offset 1px below — thick paint catching its own shadow.
function strokes(out, counter, { rng, n, sample, dir, col, len, lw, lenJ = 0.35, wJ = 0.3, aJ = 0.22, steps = 3, follow = 1, wild = 0, impasto = 0 }) {
  for (let i = 0; i < n; i++) {
    const s = sample(rng);
    if (!s) continue;
    const aJv = typeof aJ === 'function' ? aJ(s[0], s[1]) : aJ;
    let L, w;
    if (wild > 0 && rng() < wild) {
      if (rng() < 0.62) { w = 0.8 + rng() * 1.4; L = len * (1.3 + rng() * 1.4); }   // raking hairline
      else { w = 8 + rng() * 6; L = len * (0.4 + rng() * 0.45); }                    // bold slab
    } else {
      L = len * (1 + (rng() * 2 - 1) * lenJ);
      w = lw * (1 + (rng() * 2 - 1) * wJ);
    }
    const jit = (rng() * 2 - 1) * aJv;
    let [px, py] = s;
    const pts = [[px, py]];
    let a = dir(px, py) + jit;
    for (let k = 0; k < steps; k++) {
      const target = dir(px, py) + jit;
      // bend toward the local field (follow<1 keeps stroke stiffer)
      let da = target - a;
      while (da > Math.PI) da -= 2 * Math.PI;
      while (da < -Math.PI) da += 2 * Math.PI;
      a += da * follow;
      px += Math.cos(a) * (L / steps); py += Math.sin(a) * (L / steps);
      pts.push([px, py]);
    }
    const fill = col(s[0], s[1], rng);
    if (impasto > 0 && lum(fill) > impasto) {
      out.push(ribbon(pts.map(p => [p[0] + 0.5, p[1] + 1.2]), w * 1.12, mix(fill, DARKEST, 0.55)));
      counter.n++;
    }
    out.push(ribbon(pts, w, fill));
    counter.n++;
  }
}

function rej(x0, y0, x1, y1, mask) {
  return rng => {
    for (let t = 0; t < 24; t++) {
      const x = x0 + rng() * (x1 - x0), y = y0 + rng() * (y1 - y0);
      if (!mask || mask(x, y)) return [x, y];
    }
    return null;
  };
}

// geometry helpers for figure silhouettes
function inEllipse(x, y, cx, cy, rx, ry) { const dx = (x - cx) / rx, dy = (y - cy) / ry; return dx * dx + dy * dy <= 1; }
function segDist(x, y, ax, ay, bx, by) {
  const vx = bx - ax, vy = by - ay;
  const t = Math.max(0, Math.min(1, ((x - ax) * vx + (y - ay) * vy) / (vx * vx + vy * vy || 1)));
  return Math.hypot(x - (ax + vx * t), y - (ay + vy * t));
}
const inCap = (x, y, c) => segDist(x, y, c.ax, c.ay, c.bx, c.by) <= c.r;

// paint a figure built from capsules: strokes follow each capsule's axis
function paintFigure(out, counter, rng, caps, colFn, density = 1.1, lenMul = 1, lwMul = 1) {
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
      steps: 2, aJ: 0.18,
    });
  }
}

// paint short strokes along a polyline (for hidden shapes built from brushwork)
function paintPath(out, counter, rng, pts, colFn, { lw = 1.6, len = 5, density = 0.55, jitter = 1.2 } = {}) {
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

const W = 800, H = 500;
function svgWrap(title, body) {
  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img">
<title>${title}</title>
${body}
</svg>`;
}

/* ================= PLATE 1 — The first flame ================= */
function plate1() {
  const rng = mulberry32(20260611);
  const out = [];
  const counter = { n: 0 };
  out.push(`<rect width="${W}" height="${H}" fill="${DARKEST}"/>`);

  // hillside silhouette line
  const hillY = x => 432 - 62 * Math.exp(-(((x - 410) / 290) ** 2)) - 14 * Math.sin(x / 130);

  // vortices: main births the flame; two lesser
  const V = [
    { x: 500, y: 150, s: 260, f: 90 },   // main
    { x: 150, y: 95, s: 150, f: 55 },
    { x: 705, y: 235, s: 110, f: 45 },
  ];
  const skyDir = (x, y) => {
    let vx = 0, vy = 0;
    for (const v of V) { const [a, b] = swirlV(x, y, v.x, v.y, v.s, v.f); vx += a; vy += b; }
    const [cx2, cy2] = curlV(x, y, 11, 150);
    vx += cx2 * 130; vy += cy2 * 130;
    vx += 22; // gentle drift
    return Math.atan2(vy, vx);
  };
  // ---- flame spine (defined early: it is the plate's one light source)
  const childHand = [421, 300]; // the flame head hovers here, a clear breath above the candle
  const fl = t => { // quadratic spine V[0] -> control -> hand
    const c = [592, 252];
    const u = 1 - t;
    return [u * u * V[0].x + 2 * u * t * c[0] + t * t * childHand[0],
            u * u * V[0].y + 2 * u * t * c[1] + t * t * childHand[1]];
  };
  const flTan = t => { const a = fl(Math.max(0, t - 0.02)), b = fl(Math.min(1, t + 0.02)); return Math.atan2(b[1] - a[1], b[0] - a[0]); };
  // light reach: strongest at the head, felt along the whole descent
  const lightAt = (x, y) => {
    let g = 0;
    for (let t = 0; t <= 1.001; t += 0.125) {
      const p = fl(t);
      g = Math.max(g, (0.35 + 0.65 * t) * Math.exp(-Math.hypot(x - p[0], y - p[1]) / 185));
    }
    return Math.min(1, g);
  };
  // slash aggression climbs near vortex cores and the flame
  const slash = (x, y) => {
    let near = 1e9; for (const v of V) near = Math.min(near, Math.hypot(x - v.x, y - v.y) / v.f);
    return 0.15 + Math.max(0, 1.25 - near) * 0.45 + lightAt(x, y) * 0.3;
  };
  const skyCol = (x, y, r) => {
    let near = 1e9;
    for (const v of V) near = Math.min(near, Math.hypot(x - v.x, y - v.y) / v.f);
    const t = Math.max(0, Math.min(1, 0.85 - near * 0.22)) + fbm(x / 90, y / 90, 31) * 0.35;
    const g = lightAt(x, y);
    // citron flecks woven into the vortex arms
    if (near < 1.6 && r() < 0.05) return jig(mix(GOLD_DEEP, '#b3a05a', r()), r, 14);
    // complementary spark: an orange flick exactly where the flame's reach dies into blue
    if (g > 0.17 && g < 0.32 && r() < 0.04) return jig('#d96f2e', r, 18);
    let c = ramp(NIGHT, t);
    c = g > 0.05 ? mix(c, '#c9a050', g * 0.55) : mix(c, '#0c1228', 0.35);
    return jig(c, r, 12);
  };
  // deep background long raking strokes, then sky swirls (wild widths, slashed near cores)
  strokes(out, counter, { rng, n: 760, sample: rej(-10, -10, 810, 460, (x, y) => y < hillY(x) + 8), dir: skyDir, col: (x, y, r) => jig(mix(ramp(NIGHT.slice(0, 3), fbm(x / 120, y / 120, 5)), '#c9a050', lightAt(x, y) * 0.3), r, 9), len: 40, lw: 5.4, steps: 4, follow: 0.85, wild: 0.09, aJ: slash, lenJ: 0.55 });
  strokes(out, counter, { rng, n: 1300, sample: rej(-10, -10, 810, 460, (x, y) => y < hillY(x) + 6), dir: skyDir, col: skyCol, len: 26, lw: 3.6, steps: 3, follow: 0.9, wild: 0.27, aJ: slash, lenJ: 0.5, impasto: 0.55 });

  // stars: small golden knots at the two lesser vortices + a few sparks
  for (const v of [V[1], V[2]]) {
    strokes(out, counter, {
      rng, n: 90,
      sample: r => { const a = r() * Math.PI * 2, d = 4 + r() * 22; return [v.x + Math.cos(a) * d, v.y + Math.sin(a) * d * 0.8]; },
      dir: (x, y) => Math.atan2(x - v.x, -(y - v.y)),
      col: (x, y, r) => { const d = Math.hypot(x - v.x, y - v.y); return jig(ramp([GOLD_HOT, GOLD_PALE, GOLD_DEEP, '#8a7a4a'], d / 26), r, 10); },
      len: 9, lw: 2.8, steps: 2,
    });
  }

  // egg: exactly THREE small stars in a row, brighter than the rest (the magi's count)
  for (const [sx, sy] of [[196, 56], [230, 49], [264, 43]]) {
    strokes(out, counter, {
      rng, n: 34,
      sample: r => { const a = r() * Math.PI * 2, d = 1.5 + r() * 9; return [sx + Math.cos(a) * d, sy + Math.sin(a) * d * 0.8]; },
      dir: (x, y) => Math.atan2(x - sx, -(y - sy)),
      col: (x, y, r) => jig(ramp([GOLD_HOT, GOLD_PALE, GOLD_DEEP, '#7a6a3e'], Math.hypot(x - sx, y - sy) / 11), r, 8),
      len: 5.5, lw: 1.8, steps: 2,
    });
  }
  // egg: swirl arms near the top-right corner tracing a faint "3:16"
  {
    const glyphs = [ // unit-square polylines, drawn in slightly-lighter night blue
      [[[0, 0.06], [0.62, 0], [0.95, 0.22], [0.62, 0.46], [0.28, 0.48]], [[0.62, 0.46], [1, 0.7], [0.62, 0.97], [0.02, 0.92]]], // 3
      [[[0, 0.3], [0.06, 0.36]], [[0, 0.72], [0.06, 0.78]]],                                                                    // :
      [[[0.05, 0.18], [0.4, 0.02], [0.42, 0.97]]],                                                                              // 1
      [[[0.85, 0.08], [0.35, 0.02], [0.04, 0.42], [0.1, 0.84], [0.5, 1], [0.88, 0.8], [0.78, 0.52], [0.36, 0.5], [0.1, 0.62]]], // 6
    ];
    const gx = [690, 712, 720, 738], gw = [17, 5, 11, 18], gy = 40, gh = 24;
    glyphs.forEach((polys, gi) => {
      for (const poly of polys) {
        paintPath(out, counter, rng, poly.map(p => [gx[gi] + p[0] * gw[gi], gy + p[1] * gh]),
          (x, y, r) => jig(mix('#42588f', '#54699f', r()), r, 7), // one shade above the night — a fourth-look whisper
          { lw: 1.7, len: 5, density: 0.4, jitter: 1.8 });
      }
    });
  }

  // ---- THE FLAME: descending from main vortex toward the child's candle
  // gold heart at the main vortex — the flame's source
  strokes(out, counter, {
    rng, n: 70,
    sample: r => { const a = r() * Math.PI * 2, d = 2 + r() * 14; return [V[0].x + Math.cos(a) * d, V[0].y + Math.sin(a) * d * 0.85]; },
    dir: (x, y) => Math.atan2(x - V[0].x, -(y - V[0].y)),
    col: (x, y, r) => jig(ramp([GOLD_HOT, GOLD_PALE, GOLD_DEEP], Math.hypot(x - V[0].x, y - V[0].y) / 17), r, 9),
    len: 8, lw: 2.6, steps: 2,
  });
  // trail strokes along the spine — denser + brighter toward the head (t→1)
  strokes(out, counter, {
    rng, n: 500,
    sample: r => {
      const t = Math.pow(r(), 0.55); // bias toward head
      const p = fl(t);
      const spread = 20 * (1 - t * 0.7) + 4;
      const a = flTan(t) + Math.PI / 2;
      const off = (r() + r() - 1) * spread;
      return [p[0] + Math.cos(a) * off, p[1] + Math.sin(a) * off];
    },
    dir: (x, y) => { // tangent to nearest spine point, approximated by projecting
      let bt = 0, bd = 1e9;
      for (let t = 0; t <= 1; t += 0.07) { const p = fl(t); const d = Math.hypot(x - p[0], y - p[1]); if (d < bd) { bd = d; bt = t; } }
      return flTan(bt);
    },
    col: (x, y, r) => {
      let bd = 1e9; for (let t = 0; t <= 1; t += 0.07) { const p = fl(t); bd = Math.min(bd, Math.hypot(x - p[0], y - p[1])); }
      return jig(ramp([GOLD_HOT, GOLD_PALE, GOLD, GOLD_DEEP, '#9a7a3a'], bd / 30), r, 9);
    },
    len: 17, lw: 3.2, steps: 3, wild: 0.14, impasto: 0.66, lenJ: 0.5,
  });
  // ---- the flame head: a teardrop core with upward-licking tongues.
  // It descends, but fire is fire — every tongue licks toward heaven.
  const head = fl(0.96);
  // teardrop core: dense, brightest white-gold at center, strokes surging upward
  strokes(out, counter, {
    rng, n: 200,
    sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 1.5) * 15; return [head[0] + Math.cos(a) * d, head[1] + Math.sin(a) * d * 1.35 - 3]; },
    dir: (x, y) => -Math.PI / 2 + (x - head[0]) * 0.045 + (fbm(x / 9, y / 9, 57) - 0.5) * 0.5,
    col: (x, y, r) => jig(ramp(['#fffdf0', GOLD_HOT, GOLD_PALE, GOLD], Math.hypot(x - head[0], (y - head[1]) * 0.75) / 19), r, 6),
    len: 9, lw: 2.6, steps: 2, wJ: 0.55, lenJ: 0.55,
  });
  // tongues: sharp tapering licks off the core, rising even as the whole descends
  const licks = [
    { dx: -9, tip: [-22, -46], bend: -14 },
    { dx: -3, tip: [-6, -58], bend: 4 },
    { dx: 4, tip: [10, -50], bend: 16 },
    { dx: 10, tip: [26, -38], bend: 22 },
    { dx: 0, tip: [2, -34], bend: -6 },
  ];
  for (const lk of licks) {
    const b = [head[0] + lk.dx, head[1] - 4];
    const tip = [head[0] + lk.tip[0], head[1] + lk.tip[1]];
    const ctl = [b[0] + lk.bend, (b[1] + tip[1]) / 2 - 4];
    const q = t => { const u = 1 - t; return [u * u * b[0] + 2 * u * t * ctl[0] + t * t * tip[0], u * u * b[1] + 2 * u * t * ctl[1] + t * t * tip[1]]; };
    for (let t = 0; t < 1; t += 0.09) {
      const p = q(t), p2 = q(Math.min(1, t + 0.1));
      const wL = 4 * (1 - t) + 0.7; // tapers to a point
      const cc = jig(ramp([GOLD_HOT, GOLD_PALE, GOLD_PALE, GOLD], t * (0.7 + rng() * 0.3)), rng, 7);
      const jx = (rng() - 0.5) * 2.2, jy = (rng() - 0.5) * 2;
      out.push(ribbon([[p[0] + jx, p[1] + jy], [(p[0] + p2[0]) / 2 + jx, (p[1] + p2[1]) / 2 + jy], [p2[0] + jx, p2[1] + jy]], wL, cc, [0.5, 0.5, 0.42]));
      counter.n++;
    }
  }
  // a few soft sparks falling from the flame toward the candle below
  strokes(out, counter, {
    rng, n: 26,
    sample: r => [head[0] + (r() - 0.5) * 18, head[1] + 8 + r() * 24],
    dir: () => Math.PI / 2 + 0.18,
    col: (x, y, r) => jig(GOLD_PALE, r, 16),
    len: 4.5, lw: 1.4, steps: 2,
  });

  // hillside: dark mass, strokes follow the slope
  strokes(out, counter, {
    rng, n: 750,
    sample: rej(-10, 330, 810, 510, (x, y) => y > hillY(x)),
    dir: x0 => 0,
    col: (x, y, r) => {
      const litR = Math.hypot(x - childHand[0], y - childHand[1]);
      const t = Math.max(0, 0.38 - litR / 360) + fbm(x / 70, y / 70, 47) * 0.18;
      let c = mix('#10172e', '#2a3050', Math.min(1, t * 2));
      c = mix(c, '#8a6a30', Math.max(0, 0.5 - litR / 240) * 0.8); // flame light leaking onto the hill
      return jig(c, r, 7);
    },
    len: 22, lw: 4.2, steps: 3, wild: 0.12, lenJ: 0.5,
  });
  // overwrite hill dir with slope-follow (small fix: separate layer)
  // (above layer already horizontal-ish; add slope texture)
  strokes(out, counter, {
    rng, n: 320,
    sample: rej(-10, 335, 810, 470, (x, y) => y > hillY(x) && y < hillY(x) + 40),
    dir: x => { const e = 6; return Math.atan2(hillY(x + e) - hillY(x - e), 2 * e); },
    col: (x, y, r) => jig(mix('#1a2240', '#33406b', fbm(x / 60, y / 60, 53)), r, 8),
    len: 18, lw: 3.2, steps: 3, wild: 0.1,
  });

  // egg: a tiny church spire on the dark horizon, far left (the painter's other sky)
  {
    const spx = 96, spy = hillY(96);
    const spCol = (x, y, r) => jig('#0d1326', r, 4);
    out.push(`<path d="M${spx - 3.4} ${R1(spy - 10)}L${spx} ${R1(spy - 34)}L${spx + 3.4} ${R1(spy - 10)}L${spx + 3.8} ${R1(spy + 3)}L${spx - 3.8} ${R1(spy + 3)}Z" fill="#0d1326" opacity="0.92"/>`);
    counter.n++;
    paintPath(out, counter, rng, [[spx - 3.5, spy + 2], [spx - 3.5, spy - 10], [spx + 3.5, spy - 10], [spx + 3.5, spy + 2]], spCol, { lw: 2, len: 3.5, density: 0.8, jitter: 0.7 }); // tower
    paintPath(out, counter, rng, [[spx - 3.4, spy - 10], [spx, spy - 33], [spx + 3.4, spy - 10]], spCol, { lw: 1.5, len: 3, density: 0.9, jitter: 0.5 }); // spire
  }

  // warm glow pool spilling onto the hill beneath the descending flame
  strokes(out, counter, {
    rng, n: 170,
    sample: r => { const a = r() * Math.PI, d = Math.pow(r(), 1.3) * 70; const x = 416 + Math.cos(a + Math.PI) * d * 1.4, y0 = Math.max(hillY(416 + Math.cos(a + Math.PI) * d * 1.4) + 2, 360); return [x, y0 + Math.abs(Math.sin(a)) * d * 0.45]; },
    dir: x => { const e = 6; return Math.atan2(hillY(x + e) - hillY(x - e), 2 * e); },
    col: (x, y, r) => { const d = Math.hypot(x - 420, y - hillY(420) - 8); return jig(ramp([mix(GOLD_DEEP, '#3a3a3a', 0.25), '#6b5a33', '#33305a', '#1a2240'], d / 75), r, 9); },
    len: 13, lw: 2.8, steps: 2,
  });

  // the child: small silhouette on the crest, holding the unlit candle up (scaled 1.3x)
  const feetY = hillY(406) + 4;
  const cs = 1.3;
  const caps = [
    { ax: 405, ay: feetY - 33, bx: 405, by: feetY - 30, r: 5 },    // head
    { ax: 405, ay: feetY - 25, bx: 406, by: feetY - 5, r: 6.5 },   // body
    { ax: 409, ay: feetY - 22, bx: 417, by: feetY - 18, r: 2.2 },  // raised arm
    { ax: 403, ay: feetY - 5, bx: 401, by: feetY, r: 2.2 },        // legs
    { ax: 408, ay: feetY - 5, bx: 410, by: feetY, r: 2.2 },
  ].map(c => ({ ax: 405 + (c.ax - 405) * cs, ay: feetY + (c.ay - feetY) * cs, bx: 405 + (c.bx - 405) * cs, by: feetY + (c.by - feetY) * cs, r: c.r * cs }));
  paintFigure(out, counter, rng, caps, (x, y, r) => jig('#0c111f', r, 4), 1.8);
  // gold rim-light on the side facing the flame (upper right)
  strokes(out, counter, {
    rng, n: 26,
    sample: rej(398, feetY - 50, 425, feetY - 4, (x, y) => caps.some(c => inCap(x, y, c)) && !caps.some(c => inCap(x + 4, y - 4, c))),
    dir: () => -Math.PI / 2.6,
    col: (x, y, r) => jig(mix(GOLD_DEEP, '#8a6a2a', r() * 0.5), r, 10),
    len: 4.5, lw: 1.5, steps: 2,
  });
  // the unlit candle: a pale stick above the hand — no flame on it yet
  out.push(`<path d="M${R1(421.2)} ${R1(feetY - 24.5)}L${R1(423)} ${R1(feetY - 38)}" stroke="#e8dfc4" stroke-width="3.2" stroke-linecap="round" fill="none"/>`);
  counter.n++;

  return { svg: svgWrap('A vast swirling indigo night; a great golden flame descends from the sky toward a small child holding an unlit candle on a dark hillside.', out.join('\n')), n: counter.n };
}

/* ================= PLATE 2 — The wrong hand ================= */
function plate2() {
  const rng = mulberry32(40221);
  const out = [];
  const counter = { n: 0 };
  const WALL = ['#241c10', '#332817', '#42351d', '#523f22', '#5f4e2c'];
  const floorY = 436;
  out.push(`<rect width="${W}" height="${H}" fill="#332817"/>`);

  // doorway gap of light between the framing adults
  const gap = { x0: 300, x1: 368, cx: 334, top: 92 };
  // the child (declared early: the strokes around him must hush)
  const ch = { x: 512, feet: 488 };
  const calm = (x, y) => Math.max(0, 1 - Math.hypot((x - ch.x) / 120, (y - (ch.feet - 55)) / 95)); // 1 at the child, 0 outside his zone
  // doorway light reach — the plate's one light source
  const doorG = (x, y) => Math.max(0, 1 - Math.hypot(Math.max(0, Math.abs(x - gap.cx) - 34) / 300, Math.max(0, y - floorY) / 200));

  // wall murk: vertical-ish strokes, olive/umber, warmed near the gap, cooled at the far edges
  strokes(out, counter, {
    rng, n: 1200,
    sample: rej(-10, -10, 810, floorY + 8),
    dir: (x, y) => { const [cx2, cy2] = curlV(x, y, 71, 130); return Math.atan2(1 + cy2 * 1.4, cx2 * 1.7); },
    col: (x, y, r) => {
      const g = doorG(x, y);
      // complementary spark: cold violet flicks where the gold light dies into umber
      if (g > 0.42 && g < 0.56 && r() < 0.032 && y > 120) return jig('#54548c', r, 13);
      let c = ramp(WALL, fbm(x / 100, y / 100, 19));
      c = mix(c, '#7a6133', g * g * 0.55);              // warmth with falloff
      c = mix(c, '#16100a', (1 - g) * 0.3);             // cold corners sink
      return jig(c, r, 8 - calm(x, y) * 5);
    },
    len: 30, lw: 4.6, steps: 3, follow: 0.85, wild: 0.2, lenJ: 0.5,
    aJ: (x, y) => 0.2 + Math.max(0, 1 - Math.hypot(x - (ch.x - 45), y - (ch.feet - 100)) / 130) * 0.4 - calm(x, y) * 0.12,
  });

  // the lit doorway: pale warm glow, vertical strokes
  out.push(`<rect x="${gap.x0}" y="${gap.top}" width="${gap.x1 - gap.x0}" height="${floorY - gap.top}" fill="#c9ab6a"/>`);
  counter.n++;
  strokes(out, counter, {
    rng, n: 380,
    sample: rej(gap.x0 - 4, gap.top - 4, gap.x1 + 4, floorY + 2),
    dir: (x, y) => Math.PI / 2 + (fbm(x / 30, y / 30, 27) - 0.5) * 0.25,
    col: (x, y, r) => {
      const e = Math.min(Math.abs(x - gap.x0), Math.abs(x - gap.x1)) / ((gap.x1 - gap.x0) / 2);
      return jig(ramp(['#a8853e', GOLD_DEEP, '#f6e3a8', '#fdf2cd'], Math.min(1, e) - (y - gap.top) / 1400), r, 6);
    },
    len: 24, lw: 3.6, steps: 3, wild: 0.12, impasto: 0.74,
  });

  // light spilling onto the floor from the doorway
  strokes(out, counter, {
    rng, n: 300,
    sample: r => { const y = floorY - 6 + r() * 70; const sw = 50 + (y - floorY) * 1.1; return [gap.cx + (r() + r() - 1) * Math.max(40, sw), y]; },
    dir: (x, y) => (x - gap.cx) * 0.004 + (fbm(x / 60, y / 60, 29) - 0.5) * 0.2,
    col: (x, y, r) => jig(ramp([GOLD, GOLD_DEEP, '#7a6233', '#42351d'], Math.abs(x - gap.cx) / 130 + (y - floorY) / 220), r, 10),
    len: 20, lw: 3.2, steps: 3, wild: 0.1, impasto: 0.6,
  });

  // floor elsewhere: dark horizontal strokes — hushed around the child's zone
  strokes(out, counter, {
    rng, n: 540,
    sample: rej(-10, floorY - 2, 810, 510, (x, y) => Math.abs(x - gap.cx) > 60 + (y - floorY)),
    dir: (x, y) => (fbm(x / 90, y / 90, 37) - 0.5) * 0.3 * (1 - calm(x, y) * 0.7),
    col: (x, y, r) => jig(mix('#1d160c', '#352a17', fbm(x / 80, y / 80, 41) * (1 - calm(x, y) * 0.6)), r, 8 - calm(x, y) * 5),
    len: 24, lw: 4.2, steps: 3, wild: 0.12,
  });

  // the true mother, standing in the doorway light — gold, slightly turned
  const m = { x: 334, feet: 412 };
  // solid silhouette underpaint
  out.push(`<ellipse cx="${m.x + 2}" cy="${m.feet - 148}" rx="10" ry="11" fill="#8a6526"/>`);
  out.push(`<path d="M${m.x - 13} ${m.feet}L${m.x - 11} ${m.feet - 110}L${m.x - 6} ${m.feet - 134}L${m.x + 10} ${m.feet - 134}L${m.x + 14} ${m.feet - 108}L${m.x + 13} ${m.feet}Z" fill="#8a6526"/>`);
  counter.n += 2;
  const mMask = (x, y) =>
    inEllipse(x, y, m.x + 2, m.feet - 148, 10, 11) ||
    (y > m.feet - 136 && y < m.feet && Math.abs(x - (m.x + (y > m.feet - 110 ? 0 : 2))) < (y > m.feet - 110 ? 13 : 9));
  strokes(out, counter, {
    rng, n: 240,
    sample: rej(m.x - 16, m.feet - 160, m.x + 17, m.feet + 1, mMask),
    dir: (x, y) => Math.PI / 2 + (x - m.x) * 0.01 + (fbm(x / 14, y / 14, 91) - 0.5) * 0.3,
    col: (x, y, r) => jig(ramp(['#6b4e1d', '#8a6526', '#b3852e', GOLD_DEEP], 0.25 + (x - m.x + 14) / 38 * 0.45 + fbm(x / 12, y / 12, 93) * 0.3), r, 8),
    len: 11, lw: 2.6, steps: 2,
  });
  // her head slightly turned: small darker profile note on the left of the head
  strokes(out, counter, {
    rng, n: 16,
    sample: r => [m.x - 4 + r() * 5, m.feet - 154 + r() * 12],
    dir: () => Math.PI / 2.3,
    col: (x, y, r) => jig('#8a6526', r, 8),
    len: 6, lw: 1.8, steps: 2,
  });
  // egg: a small red hat held at her side (the flat-plate motif, carried)
  strokes(out, counter, {
    rng, n: 26,
    sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 1.4) * 7; return [m.x + 17 + Math.cos(a) * d * 1.2, m.feet - 56 + Math.sin(a) * d * 0.7]; },
    dir: (x, y) => 0.3 + (y - (m.feet - 56)) * 0.06,
    col: (x, y, r) => jig(ramp(['#c2492e', '#a3331f', '#6e1f12'], Math.hypot(x - (m.x + 17), y - (m.feet - 58)) / 9), r, 9),
    len: 5, lw: 1.8, steps: 2,
  });

  // adult figures: dark silhouettes towering from child height
  const adults = [
    { x: 64, w: 66, top: 46 },
    { x: 232, w: 76, top: 26 },
    { x: 452, w: 88, top: 18, coat: true }, // the almost-right blue
    { x: 640, w: 72, top: 54 },
    { x: 774, w: 80, top: 34 },
  ];
  for (const A of adults) {
    const headR = A.w * 0.21, headY = A.top + headR;
    const shY = A.top + headR * 2 + 10;
    const hemY = A.coat ? 398 : floorY;
    // solid silhouette underpaint: head + shoulders-to-floor mass
    const base = A.coat ? '#13171f' : '#171108';
    out.push(`<ellipse cx="${A.x}" cy="${R1(headY)}" rx="${R1(headR)}" ry="${R1(headR * 1.15)}" fill="${base}"/>`);
    out.push(`<path d="M${A.x - A.w * 0.34} ${R1(shY)}L${A.x + A.w * 0.34} ${R1(shY)}L${A.x + A.w * 0.5} ${floorY}L${A.x - A.w * 0.5} ${floorY}Z" fill="${base}"/>`);
    counter.n += 2;
    const mask = (x, y) => {
      if (inEllipse(x, y, A.x, headY, headR, headR * 1.15)) return true;
      if (y < shY || y > floorY) return false;
      const t = (y - shY) / (floorY - shY);
      return Math.abs(x - A.x) < A.w * (0.34 + 0.16 * t);
    };
    strokes(out, counter, {
      rng, n: Math.round(A.w * 4.6),
      sample: rej(A.x - A.w * 0.55, A.top - 4, A.x + A.w * 0.55, floorY + 2, mask),
      dir: (x, y) => Math.PI / 2 + (x - A.x) * 0.0025 + (fbm(x / 40, y / 40, 7) - 0.5) * 0.4,
      col: (x, y, r) => {
        const toGap = Math.max(0, 1 - Math.abs(x - gap.cx) / 240) * 0.62; // warm edge toward the light
        const side = Math.sign(gap.cx - A.x); // which flank faces the doorway
        const facing = (x - A.x) * side > A.w * 0.22 ? 1 : 0.2;
        let bc;
        if (A.coat && y > shY + 4 && y < hemY) bc = mix('#36445e', '#222c40', fbm(x / 26, y / 26, 13)); // almost-right blue
        else bc = mix('#171108', '#2e2412', fbm(x / 50, y / 50, 23));
        return jig(mix(bc, '#b3914a', toGap * facing), r, 6);
      },
      len: 22, lw: 3.8, steps: 3, wild: 0.07, lenJ: 0.45,
    });
    // egg: one figure carries a small pale wrap at his ear — the painter, humbly in the crowd
    if (A.x === 640) {
      strokes(out, counter, {
        rng, n: 14,
        sample: r => [A.x + headR * 0.45 + (r() - 0.5) * 5, headY + headR * 0.25 + (r() - 0.5) * 7],
        dir: () => -0.5,
        col: (x, y, r) => jig(mix('#cbb89a', '#a89372', r() * 0.6), r, 7),
        len: 5, lw: 1.7, steps: 2,
      });
    }
  }

  // the child, foreground — enlarged 1.6x and pulled clear of the doorway,
  // so the REACH (at the wrong blue) and the LIGHT (the mother) are two separate events
  const cCaps = [
    { ax: ch.x - 4, ay: ch.feet - 100, bx: ch.x - 6, by: ch.feet - 88, r: 14 },         // head tilted up-left
    { ax: ch.x - 2, ay: ch.feet - 74, bx: ch.x + 2, by: ch.feet - 22, r: 17.5 },        // body
    { ax: ch.x - 13, ay: ch.feet - 68, bx: ch.x - 52, by: ch.feet - 122, r: 5.6 },      // arm stretched up-left to the blue coat
    { ax: ch.x - 8, ay: ch.feet - 22, bx: ch.x - 11, by: ch.feet, r: 6.4 },             // legs
    { ax: ch.x + 9, ay: ch.feet - 22, bx: ch.x + 16, by: ch.feet, r: 6.4 },
  ];
  // solid underpaint
  for (const c of cCaps) {
    out.push(`<path d="M${R1(c.ax)} ${R1(c.ay)}L${R1(c.bx)} ${R1(c.by)}" stroke="#100b06" stroke-width="${R1(c.r * 2)}" stroke-linecap="round" fill="none"/>`);
    counter.n++;
  }
  paintFigure(out, counter, rng, cCaps, (x, y, r) => jig(mix('#100b06', '#241a0d', fbm(x / 16, y / 16, 61)), r, 5), 1.9, 1.1, 1.25);
  // warm rim from the doorway light — a thin edge on the left flank only
  strokes(out, counter, {
    rng, n: 34,
    sample: rej(ch.x - 62, ch.feet - 128, ch.x + 4, ch.feet - 8, (x, y) => cCaps.some(c => inCap(x, y, c)) && !cCaps.some(c => inCap(x + 7, y, c))),
    dir: () => Math.PI / 2,
    col: (x, y, r) => jig('#8a6c36', r, 9),
    len: 7, lw: 1.7, steps: 2,
  });
  // the reaching hand brushed brighter — the moment of contact-almost
  strokes(out, counter, {
    rng, n: 16,
    sample: r => [ch.x - 52 + (r() - 0.5) * 9, ch.feet - 122 + (r() - 0.5) * 9],
    dir: () => -0.9,
    col: (x, y, r) => jig('#c9a050', r, 10),
    len: 5.5, lw: 1.7, steps: 2,
  });

  return { svg: svgWrap('Seen from child height: tall dark adult figures like trees; a small child reaches for a coat of almost the right blue, while in a lit gap behind, the true mother stands in gold, slightly turned.', out.join('\n')), n: counter.n };
}

/* ================= PLATE 3 — He ran ================= */
function plate3() {
  const rng = mulberry32(15203121);
  const out = [];
  const counter = { n: 0 };
  out.push(`<rect width="${W}" height="${H}" fill="#2a4a5e"/>`);

  const horizon = 198;
  const SKY = ['#1f3a52', '#2a4a5e', '#3a6b73', '#4d8a8a', '#7aa9a0'];
  const WHEAT = ['#8a6526', '#c98e2e', '#d9a93f', '#f0cf7a', GOLD];
  const SHADOW = '#5a5a8e';

  // sky: turbulent curl field with two churning knots
  const SK = [{ x: 200, y: 70, s: 150, f: 60 }, { x: 560, y: 120, s: 120, f: 50 }];
  strokes(out, counter, {
    rng, n: 1300,
    sample: rej(-10, -10, 810, horizon + 6),
    dir: (x, y) => {
      let [vx, vy] = curlV(x, y, 121, 110);
      vx = vx * 90 + 38; vy = vy * 110;
      for (const v of SK) { const [a, b] = swirlV(x, y, v.x, v.y, v.s, v.f); vx += a; vy += b; }
      return Math.atan2(vy, vx);
    },
    col: (x, y, r) => {
      let near = 1e9; for (const v of SK) near = Math.min(near, Math.hypot(x - v.x, y - v.y) / v.f);
      // complementary spark: hot orange flicks inside the cold churn, near the knots
      if (near < 1.1 && r() < 0.035) return jig('#d9822e', r, 16);
      return jig(ramp(SKY, fbm(x / 110, y / 110, 133) * 0.9 + (horizon - y) / 700 + Math.max(0, 0.5 - near * 0.2)), r, 11);
    },
    len: 30, lw: 4.2, steps: 4, follow: 0.85, wild: 0.24, lenJ: 0.55, impasto: 0.64,
    aJ: (x, y) => { let near = 1e9; for (const v of SK) near = Math.min(near, Math.hypot(x - v.x, y - v.y) / v.f); return 0.16 + Math.max(0, 1.3 - near) * 0.42; },
  });

  // road: pale diagonal, far (655,210) -> near (110,500)
  const far = [652, 208], near = [104, 504];
  const roadP = t => [far[0] + (near[0] - far[0]) * t + Math.sin(t * 5.5) * 9 * t, far[1] + (near[1] - far[1]) * t];
  const roadW = t => 7 + 78 * t * t + 12 * t;
  const roadInfo = (x, y) => { // returns {t,d} for nearest road point
    let bt = 0, bd = 1e9;
    for (let t = 0; t <= 1.001; t += 0.04) { const p = roadP(t); const d = Math.hypot(x - p[0], y - p[1]); if (d < bd) { bd = d; bt = t; } }
    return { t: bt, d: bd };
  };
  const onRoad = (x, y) => { const { t, d } = roadInfo(x, y); return d < roadW(t) / 2; };

  // underpaint: solid ochre field so no cold base leaks between strokes
  out.push(`<rect x="-2" y="${horizon - 2}" width="${W + 4}" height="${H - horizon + 4}" fill="#a3762a"/>`);
  counter.n++;
  // underpaint: the pale road
  {
    let L2 = [], R2 = [];
    for (let t = 0; t <= 1.001; t += 0.1) {
      const p = roadP(t), q = roadP(Math.min(1, t + 0.04));
      let nx = -(q[1] - p[1]), ny = q[0] - p[0];
      const nl = Math.hypot(nx, ny) || 1; nx /= nl; ny /= nl;
      const hw = roadW(t) / 2;
      L2.push([p[0] + nx * hw, p[1] + ny * hw]); R2.push([p[0] - nx * hw, p[1] - ny * hw]);
    }
    let d = `M${R1(L2[0][0])} ${R1(L2[0][1])}`;
    for (let i = 1; i < L2.length; i++) d += `L${R1(L2[i][0])} ${R1(L2[i][1])}`;
    for (let i = R2.length - 1; i >= 0; i--) d += `L${R1(R2[i][0])} ${R1(R2[i][1])}`;
    out.push(`<path d="${d}Z" fill="#d4bd8c"/>`);
    counter.n++;
  }

  // wheat: churning gold, waves mostly horizontal, dense texture
  strokes(out, counter, {
    rng, n: 2150,
    sample: rej(-10, horizon - 4, 810, 510, (x, y) => !onRoad(x, y)),
    dir: (x, y) => { const [vx, vy] = curlV(x, y, 171, 70); return Math.atan2(vy * 0.9 - 0.18, Math.abs(vx) + 0.7); },
    col: (x, y, r) => {
      if (r() < 0.1) return jig(SHADOW, r, 12); // blue-violet shadow flecks
      const depth = (y - horizon) / (H - horizon);
      return jig(ramp(WHEAT, 0.15 + fbm(x / 60, y / 60, 177) * 0.85 + depth * 0.4), r, 13);
    },
    len: 18, lw: 3.8, steps: 3,
    lenJ: 0.55, wild: 0.18, impasto: 0.8,
  });
  // perspective: shorter strokes near horizon (overlay band)
  strokes(out, counter, {
    rng, n: 500,
    sample: rej(-10, horizon - 2, 810, horizon + 60, (x, y) => !onRoad(x, y)),
    dir: () => 0,
    col: (x, y, r) => jig(ramp(WHEAT, 0.3 + fbm(x / 40, y / 40, 179) * 0.5), r, 10),
    len: 8, lw: 2, steps: 2,
  });

  // road strokes: along the road direction
  strokes(out, counter, {
    rng, n: 560,
    sample: rej(60, horizon, 720, 510, onRoad),
    dir: (x, y) => { const { t } = roadInfo(x, y); const a = roadP(Math.max(0, t - 0.03)), b = roadP(Math.min(1, t + 0.03)); return Math.atan2(b[1] - a[1], b[0] - a[0]); },
    col: (x, y, r) => { const { t, d } = roadInfo(x, y); return jig(ramp(['#f2e3bd', '#e2cfa0', '#c9b282'], d / (roadW(t) / 2) * 0.7 + fbm(x / 50, y / 50, 191) * 0.4), r, 9); },
    len: 18, lw: 3.4, steps: 3,
  });
  // dark wheat strokes lining the road edges, leaning over it
  strokes(out, counter, {
    rng, n: 260,
    sample: r => { const t = r(); const p = roadP(t); const q = roadP(Math.min(1, t + 0.04)); let nx = -(q[1] - p[1]), ny = q[0] - p[0]; const nl = Math.hypot(nx, ny) || 1; nx /= nl; ny /= nl; const side = r() < 0.5 ? 1 : -1; const off = roadW(t) / 2 + r() * 6 - 2; return [p[0] + nx * off * side, p[1] + ny * off * side]; },
    dir: (x, y) => { const { t } = roadInfo(x, y); const a = roadP(Math.max(0, t - 0.03)), b = roadP(Math.min(1, t + 0.03)); return Math.atan2(b[1] - a[1], b[0] - a[0]) + 0.5; },
    col: (x, y, r) => jig(mix('#8a6526', '#6b4e1d', r()), r, 10),
    len: 10, lw: 2.6, steps: 2,
  });

  // egg: a few wheat stalks beside the road bending into the shape of a tiny crown
  {
    const kx = 472, ky = 362;
    const kCol = (x, y, r) => jig(mix('#6b4e1d', '#8a6526', r() * 0.7), r, 8);
    // two short stalks bending in to hold it up
    paintPath(out, counter, rng, [[kx - 9, ky + 22], [kx - 6, ky + 13], [kx - 5, ky + 7]], kCol, { lw: 1.4, len: 3.5, density: 0.45 });
    paintPath(out, counter, rng, [[kx + 9, ky + 23], [kx + 6, ky + 14], [kx + 5, ky + 7]], kCol, { lw: 1.4, len: 3.5, density: 0.45 });
    // the crown itself: a base band and three peaks, one bent zigzag of wheat
    paintPath(out, counter, rng, [[kx - 11, ky + 6], [kx + 11, ky + 6]], kCol, { lw: 2, len: 3.5, density: 0.8, jitter: 0.6 });
    paintPath(out, counter, rng,
      [[kx - 11, ky + 5], [kx - 7.5, ky - 6], [kx - 4, ky + 3], [kx, ky - 8], [kx + 4, ky + 3], [kx + 7.5, ky - 6], [kx + 11, ky + 5]],
      kCol, { lw: 1.7, len: 3, density: 0.8, jitter: 0.5 });
    // grain heads at the three tips
    for (const [tx2, ty2] of [[-7.5, -7], [0, -9], [7.5, -7]]) {
      paintPath(out, counter, rng, [[kx + tx2 - 2, ky + ty2], [kx + tx2 + 2, ky + ty2 - 1.5]], kCol, { lw: 2.2, len: 2.5, density: 0.9, jitter: 0.4 });
    }
  }

  // the far house
  const hs = { x: 678, y: 196 };
  out.push(`<path d="M${hs.x - 22} ${hs.y}L${hs.x - 22} ${hs.y - 18}L${hs.x} ${hs.y - 32}L${hs.x + 22} ${hs.y - 18}L${hs.x + 22} ${hs.y}Z" fill="#2c2a3e"/>`);
  counter.n++;
  strokes(out, counter, {
    rng, n: 40,
    sample: rej(hs.x - 21, hs.y - 30, hs.x + 21, hs.y - 1, (x, y) => y > hs.y - 30 && (Math.abs(x - hs.x) < 21)),
    dir: () => 0,
    col: (x, y, r) => jig(mix('#2c2a3e', '#474360', fbm(x / 12, y / 12, 201)), r, 7),
    len: 7, lw: 2.2, steps: 2,
  });
  // the lit window — the SAME gold as plate 1's flame (the fire that waited)
  out.push(`<rect x="${hs.x - 4}" y="${hs.y - 16}" width="8" height="9" rx="1.5" fill="${GOLD}"/>`);
  out.push(`<rect x="${hs.x - 2.5}" y="${hs.y - 14.5}" width="5" height="6" rx="1" fill="${GOLD_HOT}" opacity="0.85"/>`);
  counter.n += 2;
  // its light: a small warm breath around the house...
  strokes(out, counter, {
    rng, n: 26,
    sample: r => { const a = r() * Math.PI * 2, d = 3 + r() * 15; return [hs.x + Math.cos(a) * d, hs.y - 11 + Math.sin(a) * d * 0.55]; },
    dir: (x, y) => Math.atan2(y - (hs.y - 11), x - hs.x) + Math.PI / 2,
    col: (x, y, r) => jig(ramp([GOLD_PALE, GOLD, GOLD_DEEP], Math.hypot(x - hs.x, y - hs.y + 11) / 22), r, 8),
    len: 6, lw: 1.5, steps: 2,
  });
  // ...and a long warm thread cast down the road toward the walker — brighter than the dust it lies on
  strokes(out, counter, {
    rng, n: 90,
    sample: r => { const t = Math.pow(r(), 1.6) * 0.8; const p = roadP(t); return [p[0] + (r() + r() - 1) * roadW(t) * 0.16, p[1] + (r() - 0.5) * 3]; },
    dir: (x, y) => { const { t } = roadInfo(x, y); const a = roadP(Math.max(0, t - 0.03)), b = roadP(Math.min(1, t + 0.03)); return Math.atan2(b[1] - a[1], b[0] - a[0]); },
    col: (x, y, r) => { const { t } = roadInfo(x, y); return jig(ramp(['#fff3cd', '#ffe9a0', GOLD], t * 1.05 + (r() - 0.5) * 0.25), r, 7); },
    len: 14, lw: 1.7, steps: 3, lenJ: 0.6, wJ: 0.45,
  });

  // FATHER: past halfway, mid-stride, leaning hard toward the child
  const fp = roadP(0.62); // ~ (315, 392)
  const lean = Math.atan2(near[1] - far[1], near[0] - far[0]); // direction of running
  const fScale = 1.12;
  const fx = fp[0], fy = fp[1] - 2;
  const fCaps = [
    { ax: fx - 10, ay: fy - 44, bx: fx - 14, by: fy - 38, r: 6.5 },          // head thrown forward (down-road)
    { ax: fx - 12, ay: fy - 34, bx: fx + 2, by: fy - 12, r: 8.5 },           // torso leaning hard into the run
    { ax: fx - 6, ay: fy - 28, bx: fx - 22, by: fy - 18, r: 3 },             // fore arm
    { ax: fx - 2, ay: fy - 26, bx: fx + 14, by: fy - 20, r: 3 },             // back arm
    { ax: fx + 2, ay: fy - 12, bx: fx - 16, by: fy + 2, r: 3.6 },            // front leg striding
    { ax: fx + 2, ay: fy - 12, bx: fx + 20, by: fy - 2, r: 3.6 },            // back leg kicked up
  ].map(c => ({ ax: fx + (c.ax - fx) * fScale, ay: fy + (c.ay - fy) * fScale, bx: fx + (c.bx - fx) * fScale, by: fy + (c.by - fy) * fScale, r: c.r * fScale }));
  // solid underpaint, deep red-brown so the runner reads against road AND wheat
  for (const c of fCaps) {
    out.push(`<path d="M${R1(c.ax)} ${R1(c.ay)}L${R1(c.bx)} ${R1(c.by)}" stroke="#46260e" stroke-width="${R1(c.r * 2)}" stroke-linecap="round" fill="none"/>`);
    counter.n++;
  }
  paintFigure(out, counter, rng, fCaps, (x, y, r) => jig(ramp(['#8a4e1c', '#5e3414', '#3a2008'], fbm(x / 18, y / 18, 211) * 0.8 + (y - (fy - 48)) / 75), r, 9), 1.8);
  // sun catching his shoulders and the back of his head — he runs INTO the light
  strokes(out, counter, {
    rng, n: 22,
    sample: rej(fx - 22, fy - 54, fx + 8, fy - 22, (x, y) => fCaps.some(c => inCap(x, y, c)) && !fCaps.some(c => inCap(x, y + 5, c))),
    dir: () => lean,
    col: (x, y, r) => jig(GOLD_DEEP, r, 10),
    len: 6, lw: 1.7, steps: 2,
  });
  // robe flying behind (up-road, toward the house)
  strokes(out, counter, {
    rng, n: 70,
    sample: r => [fx + 12 + r() * 30, fy - 26 + (r() - 0.3) * 24],
    dir: (x, y) => lean + Math.PI + (fbm(x / 20, y / 20, 215) - 0.5) * 0.9,
    col: (x, y, r) => jig(ramp(['#8a4e1c', '#6b3a14', '#4a2810'], (x - fx - 10) / 44), r, 11),
    len: 13, lw: 2.8, steps: 2, lenJ: 0.5,
  });
  // dust kicked up behind his feet — bold, rising, torn by the run
  strokes(out, counter, {
    rng, n: 270,
    sample: r => { const t = Math.pow(r(), 1.4); return [fx + 4 + t * 88 + (r() - 0.5) * 10, fy - 1 - t * 16 + (r() - 0.4) * (10 + t * 22)]; },
    dir: (x, y) => lean + Math.PI - 0.25 - (x - fx) * 0.004 + (fbm(x / 14, y / 14, 219) - 0.5) * 1.4,
    col: (x, y, r) => { const d = (x - fx) / 90; return jig(ramp(['#f7eed6', '#ecdfc0', '#d4bd92', '#bda57a'], d + (r() - 0.5) * 0.3), r, 11); },
    len: 14, lw: 2.9, steps: 2, wild: 0.16, lenJ: 0.65, aJ: 0.55,
  });
  // egg: a ring on his outstretched hand, catching the light (Luke 15:22)
  {
    const hx2 = fx - 25.5, hy2 = fy - 20.5;
    out.push(`<circle cx="${hx2}" cy="${hy2}" r="2.1" fill="none" stroke="${GOLD_HOT}" stroke-width="1.3"/>`);
    out.push(`<path d="M${hx2 - 4.5} ${hy2 - 3.5}L${hx2 + 1} ${hy2 - 0.5}" stroke="#fffdf0" stroke-width="0.9" stroke-linecap="round"/>`);
    counter.n += 2;
  }

  // CHILD: three steps in at the near end, walking toward the house
  const cp = roadP(0.9); // near end
  const cx2 = cp[0] + 26, cy2 = cp[1] - 14;
  const cCaps = [
    { ax: cx2 - 2, ay: cy2 - 52, bx: cx2 - 1, by: cy2 - 45, r: 7 },        // head, slightly forward
    { ax: cx2 - 1, ay: cy2 - 36, bx: cx2 + 1, by: cy2 - 12, r: 8.5 },      // body
    { ax: cx2 + 2, ay: cy2 - 30, bx: cx2 + 8, by: cy2 - 16, r: 2.8 },      // arm
    { ax: cx2, ay: cy2 - 12, bx: cx2 + 7, by: cy2 + 2, r: 3.2 },           // stepping leg
    { ax: cx2, ay: cy2 - 12, bx: cx2 - 6, by: cy2 + 1, r: 3.2 },
  ];
  // solid underpaint so the small figure reads against the bright road
  for (const c of cCaps) {
    out.push(`<path d="M${R1(c.ax)} ${R1(c.ay)}L${R1(c.bx)} ${R1(c.by)}" stroke="#2c2c4a" stroke-width="${R1(c.r * 2)}" stroke-linecap="round" fill="none"/>`);
    counter.n++;
  }
  paintFigure(out, counter, rng, cCaps, (x, y, r) => jig(mix('#2c2c4a', '#4a4a72', fbm(x / 16, y / 16, 223)), r, 8), 1.5);
  // small warm light on the child's front (facing the father/house)
  strokes(out, counter, {
    rng, n: 16,
    sample: rej(cx2 - 10, cy2 - 54, cx2 + 4, cy2 - 10, (x, y) => cCaps.some(c => inCap(x, y, c)) && x < cx2 + 2),
    dir: () => Math.PI / 2.2,
    col: (x, y, r) => jig(GOLD_DEEP, r, 12),
    len: 6, lw: 1.5, steps: 2,
  });

  return { svg: svgWrap('A churning gold wheat field under a turbulent blue-green sky; a pale road cuts a diagonal; a small figure has taken three steps in, while from the far house the father, already past halfway, runs with dust flying.', out.join('\n')), n: counter.n };
}

/* ================= page ================= */
const p1 = plate1(), p2 = plate2(), p3 = plate3();
const plates = [
  { ...p1, caption: 'Something was already burning before you.', name: 'The first flame' },
  { ...p2, caption: 'The holding was real both times. The hand makes the difference.', name: 'The wrong hand' },
  { ...p3, caption: 'You walk toward Him. He runs.', name: 'He ran' },
];
const totalStrokes = plates.reduce((s, p) => s + p.n, 0);

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>van gogh study — preview</title>
<style>
  :root { --paper: #fbf9f3; --ink: #3a352c; --gray: #847d6e; --sand: #c8b88a; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: var(--paper); color: var(--ink); font-family: Georgia, 'Times New Roman', serif; line-height: 1.6; }
  main { max-width: 880px; margin: 0 auto; padding: 72px 24px 120px; }
  h1 { text-align: center; font-weight: normal; font-style: italic; font-size: 21px; color: var(--ink); letter-spacing: 0.04em; }
  .note-top { text-align: center; font-style: italic; color: var(--gray); font-size: 14px; margin: 14px 0 80px; }
  .note-top::after { content: ""; display: block; width: 48px; height: 1px; background: var(--sand); margin: 28px auto 0; }
  figure { margin: 0 0 110px; }
  figure:last-child { margin-bottom: 0; }
  .plate { border-radius: 6px; overflow: hidden; box-shadow: 0 1px 2px rgba(58,53,44,0.06), 0 14px 36px -16px rgba(58,53,44,0.22); }
  .plate svg { display: block; width: 100%; height: auto; }
  figcaption { text-align: center; font-style: italic; color: var(--gray); font-size: 17px; margin-top: 22px; }
</style>
</head>
<body>
<main>
  <h1>van gogh study — three plates, for approval</h1>
  <p class="note-top">each plate is ~${Math.round(totalStrokes / 3 / 100) * 100} brushstrokes following flow fields — no two strokes alike</p>
${plates.map(p => `  <figure>
    <div class="plate">
${p.svg}
    </div>
    <figcaption>${p.caption}</figcaption>
  </figure>`).join('\n')}
</main>
</body>
</html>
`;

writeFileSync(join(DIR, 'vangogh-preview.html'), html);
for (const p of plates) console.log(`${p.name}: ${p.n} strokes, ~${Math.round(Buffer.byteLength(p.svg) / 1024)} KB`);
console.log(`total: ${totalStrokes} strokes, page ${Math.round(Buffer.byteLength(html) / 1024)} KB`);
