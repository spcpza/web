#!/usr/bin/env node
// gen/glitch.mjs — SACRED GLITCH pilot for the garden/fall plate.
//
//   node gen/glitch.mjs            build both editions + glitch-study.html
//
// THE LAW: in the kernel, drift (ε) is corruption of the image. So here
// GLITCH INTENSITY = DISTANCE FROM THE LIGHT. A corruption field is built
// over the painting: the walking gold column and the two coats are pristine
// signal (zero glitch); the hiding figures carry moderate corruption; the
// bush that hides them and the dusk far from the light carry heavy
// corruption; and one authored wound — the serpent's whisper — enters from
// the upper right as a narrow diagonal band of maximum corruption (the
// first dropped packet).
//
// The glitch only DISPLACES/REORDERS existing pixels (pixel-sorting along a
// flow field, RGB channel split, scanline shear, block dislocation). The
// oil palette is never recolored — except inside the serpent wound, where
// a few rows drop to near-black and one channel bleeds.
//
// Pipeline: source jpg -> base64 into wrapper html -> canvas glitch program
// (seeded PRNG, deterministic) -> headless Chrome screenshot -> cjpeg
// quality ladder to <= 200 KB -> plates-vg/pilot-glitch-garden(.|-p.)jpg
// Then writes glitch-study.html (A/B against the oil).

import { readFileSync, writeFileSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const DIR = dirname(fileURLToPath(import.meta.url));   // .../gen
const SITE = dirname(DIR);                              // .../balthazar-sh
const OUT = join(SITE, 'plates-vg');
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const TARGET_KB = 200;

// ---------------------------------------------------------------------------
// The two editions. Device pixels map back to the painter's 800x500 canvas
// coordinates, where the corruption field lives (the light column is at
// canvas x=168, spine y in [96,446]; coats near (295,438)/(345,442); the
// great hiding bush at x=540; the figures at its right flank ~(588,452)).
// The portrait is the same strokes through a 312-wide window at x0=94
// (focal.x=250 in gen/plates/garden.mjs), rendered 1000x1600.
// ---------------------------------------------------------------------------
const EDITIONS = [
  { src: 'garden.jpg',   out: 'pilot-glitch-garden',   w: 1600, h: 1000, map: { x0: 0,  sx: 800 / 1600, sy: 500 / 1000 } },
  // the portrait window (x in [94,406]) excludes the landscape's serpent band,
  // so the wound gets its own entry point: the portrait's upper-right corner
  { src: 'garden-p.jpg', out: 'pilot-glitch-garden-p', w: 1000, h: 1600, map: { x0: 94, sx: 312 / 1000, sy: 500 / 1600 },
    serp: { serpA: { x: 414, y: -12 }, serpB: { x: 312, y: 162 }, serpHalfW: 9, woundPaths: 16, stutters: 34, drops: 12 } },
];

// TUNING — iterate the FIELD first, then technique amounts.
const TUNE = {
  seed: 40,
  // field shape
  baseLo: 0.10, baseHi: 0.62,   // smoothstep window on (1 - light) for base corruption
  baseMax: 0.60,                // heaviest ambient corruption far from the light
  guardLo: 0.40, guardHi: 0.78, // sanctity guard: light above this forces glitch to 0
  bushBoost: 0.38,              // extra corruption on the hiding bush
  figLevel: 0.45,               // figures pulled toward this (moderate)
  // techniques (amounts are device-pixel scaled inside the program)
  sortPaths: 850,               // seeded sort paths per megapixel-ish
  sortLenMin: 14, sortLenMax: 95,
  sortThresh: 0.38,             // field value below which no sorting triggers
  splitMax: 4.0,                // max RGB offset in device px
  shearMax: 20,                 // max scanline shear in device px
  shearProb: 0.45,              // probability a row band shears at all
  blocks: 9,                    // dislocated blocks (landscape; portrait scales)
  // serpent band: from upper-right corner toward the bush's crown
  serpA: { x: 818, y: -14 }, serpB: { x: 545, y: 168 },
  serpHalfW: 16,                // half-width in canvas px
  woundPaths: 48,               // dedicated sort paths inside the wound
  stutters: 60,                 // row-repeat attempts inside the wound
  drops: 17,                    // dropped-row groups inside the wound
};

// ---------------------------------------------------------------------------
// The glitch program — runs inside headless Chrome on a canvas. Everything
// below is plain browser JS injected as a string; ${...} only for params.
// ---------------------------------------------------------------------------
function programJS(ed) {
  return `
const P = ${JSON.stringify({ ...TUNE, ...(ed.serp || {}), w: ed.w, h: ed.h, map: ed.map })};

// mulberry32 — seeded, deterministic
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rnd = mulberry32(P.seed);
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const sstep = (a, b, v) => { const t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

// device px -> painter canvas coords (800x500 space)
const cx = px => P.map.x0 + px * P.map.sx;
const cy = py => py * P.map.sy;

// --- the painting's own light (mirrors gen/plates/garden.mjs) ---------
function lightAt(x, y) {
  const yc = clamp(y, 96, 446);
  const d = Math.hypot((x - 168) * 1.15, (y - yc) * 0.9);
  const tall = 1 - 0.25 * Math.max(0, (yc - 200) / 250);
  return Math.min(1, Math.exp(-d / 225) * tall);
}
function coatAt(x, y) {
  const d1 = Math.hypot(x - 295, y - 438), d2 = Math.hypot(x - 345, y - 442);
  const s = 2 * 36 * 36;
  return Math.max(Math.exp(-d1 * d1 / s), Math.exp(-d2 * d2 / s));
}
function bushAt(x, y) {
  if (y < 118 || y > 482) return 0;
  const t = (y - 130) / 340;
  const hw = 86 * (0.3 + 0.7 * clamp(t, 0, 1));
  return Math.max(0, 1 - Math.abs(x - 540) / (hw + 26));
}
function figAt(x, y) {
  const d = Math.hypot((x - 588) * 1.0, (y - 452) * 1.3);
  return Math.exp(-d * d / (2 * 34 * 34));
}
function serpentAt(x, y) {
  const ax = P.serpA.x, ay = P.serpA.y, bx = P.serpB.x, by = P.serpB.y;
  const dx = bx - ax, dy = by - ay, L2 = dx * dx + dy * dy;
  let t = ((x - ax) * dx + (y - ay) * dy) / L2;
  if (t < 0 || t > 1.18) return 0;
  const tc = clamp(t, 0, 1);
  const px2 = ax + dx * tc, py2 = ay + dy * tc;
  const dist = Math.hypot(x - px2, y - py2);
  const core = 1 - sstep(P.serpHalfW * 0.55, P.serpHalfW * 1.7, dist);
  const fade = 1 - sstep(0.86, 1.18, t);          // the whisper dies near the bush
  return core * fade;
}

// --- corruption field: drift = distance from the light --------------------
function corruption(x, y) {
  const L = Math.max(lightAt(x, y), coatAt(x, y));
  let c = sstep(P.baseLo, P.baseHi, 1 - L) * P.baseMax;
  c = Math.min(1, c + bushAt(x, y) * P.bushBoost);          // the hiding place is heavy
  const f = figAt(x, y); c = c * (1 - f) + P.figLevel * f;  // the hiders: moderate
  c = Math.max(c, serpentAt(x, y));                          // the wound: maximum
  c *= 1 - sstep(P.guardLo, P.guardHi, L);                   // where the light is, whole
  return clamp(c, 0, 1);
}

// --- flow field: strokes flow around the light, lie with the ground -------
function flowAngle(x, y) {
  const e = 4;
  const gx = lightAt(x + e, y) - lightAt(x - e, y);
  const gy = lightAt(x, y + e) - lightAt(x, y - e);
  const mag = Math.hypot(gx, gy);
  const ground = sstep(330, 360, y);
  let base = 0.02 * Math.sin(x * 0.013 + y * 0.021) * (1 - ground); // lazy sky drift
  if (mag < 1e-5) return base;
  const tangent = Math.atan2(gx, -gy);            // perpendicular to the gradient
  const w = clamp(mag * 90, 0, 1) * (1 - ground * 0.8);
  // blend angles via vectors to avoid wrap issues
  const vx = Math.cos(base) * (1 - w) + Math.cos(tangent) * w;
  const vy = Math.sin(base) * (1 - w) + Math.sin(tangent) * w;
  return Math.atan2(vy, vx);
}

const img = document.getElementById('src');
const W = P.w, H = P.h;
const canvas = document.getElementById('cv');
canvas.width = W; canvas.height = H;
const ctx = canvas.getContext('2d', { willReadFrequently: true });
ctx.drawImage(img, 0, 0, W, H);
const id = ctx.getImageData(0, 0, W, H);
const d = id.data;

// precompute corruption per pixel (field is smooth; quarter-grid + bilinear)
const GS = 4, GW = Math.ceil(W / GS) + 1, GH = Math.ceil(H / GS) + 1;
const grid = new Float32Array(GW * GH);
const sgrid = new Float32Array(GW * GH);   // serpent mask, for the wound extras
for (let gy = 0; gy < GH; gy++) for (let gx2 = 0; gx2 < GW; gx2++) {
  const x = cx(gx2 * GS), y = cy(gy * GS);
  grid[gy * GW + gx2] = corruption(x, y);
  sgrid[gy * GW + gx2] = serpentAt(x, y) * (1 - sstep(P.guardLo, P.guardHi, Math.max(lightAt(x, y), coatAt(x, y))));
}
function sample(g, px, py) {
  const fx = clamp(px / GS, 0, GW - 1.001), fy = clamp(py / GS, 0, GH - 1.001);
  const ix = fx | 0, iy = fy | 0, ax = fx - ix, ay = fy - iy;
  const i = iy * GW + ix;
  return g[i] * (1 - ax) * (1 - ay) + g[i + 1] * ax * (1 - ay) + g[i + GW] * (1 - ax) * ay + g[i + GW + 1] * ax * ay;
}
const F = (px, py) => sample(grid, px, py);
const SERP = (px, py) => sample(sgrid, px, py);

const lum = i => 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];

// === 1. PIXEL-SORTING AS BRUSHSTROKE ======================================
// Seeded paths traced along the flow field; the run's pixels are reordered
// by luminance so the bright end of every sorted streak faces the light.
const devScale = 1 / P.map.sx;            // canvas px -> device px
const nPaths = Math.round(P.sortPaths * (W * H) / (1600 * 1000));
// dedicated wound seeds: the serpent must read as ONE authored diagonal,
// so a fixed share of paths is sampled along the band itself
const nWound = Math.round(P.woundPaths * (W * H) / (1600 * 1000));
let made = 0, tries = 0;
while (made < nPaths + nWound && tries < (nPaths + nWound) * 14) {
  tries++;
  let px, py;
  if (made < nWound) {   // along the band, jittered across its width
    const t5 = rnd();
    const cxx = P.serpA.x + t5 * (P.serpB.x - P.serpA.x) + (rnd() * 2 - 1) * P.serpHalfW;
    const cyy = P.serpA.y + t5 * (P.serpB.y - P.serpA.y) + (rnd() * 2 - 1) * P.serpHalfW;
    px = (cxx - P.map.x0) / P.map.sx; py = cyy / P.map.sy;
    if (px < 0 || py < 0 || px >= W || py >= H) { continue; }
  } else { px = rnd() * W; py = rnd() * H; }
  const f = F(px, py);
  const inWound = SERP(px, py) > 0.5;
  if (made < nWound && !inWound) continue;
  if (!inWound && (f < P.sortThresh || rnd() > Math.pow(f, 2.0))) continue;
  // on the bush: short choppy sorts so the silhouette survives (its heaviness
  // is carried by shear + blocks); in the wound: long, and along the band
  const bsh = bushAt(cx(px), cy(py));
  const len = Math.round((P.sortLenMin + f * (P.sortLenMax - P.sortLenMin)) * (inWound ? 0.7 : 1 - 0.62 * bsh) * devScale * (0.6 + rnd() * 0.8));
  const serpAngle = Math.atan2(P.serpB.y - P.serpA.y, P.serpB.x - P.serpA.x);
  // trace the path, re-sampling the flow each step (curved streaks)
  const xs = new Int32Array(len), ys = new Int32Array(len);
  let x = px, y = py, n = 0;
  for (let s = 0; s < len; s++) {
    const xi = x | 0, yi = y | 0;
    if (xi < 0 || yi < 0 || xi >= W || yi >= H) break;
    if (n === 0 || xs[n - 1] !== xi || ys[n - 1] !== yi) { xs[n] = xi; ys[n] = yi; n++; }
    const a = inWound ? serpAngle : flowAngle(cx(x), cy(y));
    x += Math.cos(a); y += Math.sin(a);
  }
  if (n < 6) continue;
  // collect, sort by luminance, write back with bright end toward the light
  const idxs = new Array(n), keys = new Float32Array(n);
  for (let k = 0; k < n; k++) { const i = (ys[k] * W + xs[k]) * 4; idxs[k] = i; keys[k] = lum(i); }
  const order = Array.from({ length: n }, (_, k) => k).sort((a, b) => keys[a] - keys[b]);
  const headLight = lightAt(cx(xs[0]), cy(ys[0]));
  const tailLight = lightAt(cx(xs[n - 1]), cy(ys[n - 1]));
  const ascending = tailLight >= headLight;  // brighter pixels flow toward the light
  const tmp = new Uint8Array(n * 3);
  for (let k = 0; k < n; k++) { const i = idxs[order[k]]; tmp[k * 3] = d[i]; tmp[k * 3 + 1] = d[i + 1]; tmp[k * 3 + 2] = d[i + 2]; }
  // streak thickness: a brushstroke, not a hair — 2-4 device px depending on field
  const a0 = flowAngle(cx(xs[0]), cy(ys[0]));
  const pnx = Math.round(-Math.sin(a0)), pny = Math.round(Math.cos(a0));
  const thick = inWound ? Math.min(3, Math.max(1, Math.round(devScale)))
    : Math.max(1, Math.round((1 + f * 2.6) * devScale * 0.7));
  for (let k = 0; k < n; k++) {
    const dstK = ascending ? k : n - 1 - k;
    for (let t3 = 0; t3 < thick; t3++) {
      const off = t3 - (thick >> 1);
      const xx = xs[dstK] + pnx * off, yy = ys[dstK] + pny * off;
      if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue;
      const i = (yy * W + xx) * 4;
      d[i] = tmp[k * 3]; d[i + 1] = tmp[k * 3 + 1]; d[i + 2] = tmp[k * 3 + 2];
    }
  }
  made++;
}

// === 2. SCANLINE SHEAR ====================================================
// Coherent row bands displaced horizontally, amplitude from the field.
// In the serpent band only: occasional row stutter (repeats).
{
  const row = new Uint8ClampedArray(W * 4);
  let y = 0;
  while (y < H) {
    const bandH = 2 + (rnd() * 7 | 0);
    const go = rnd() < P.shearProb;
    const amp = (rnd() * 2 - 1) * P.shearMax * devScale;
    if (go) {
      for (let yy = y; yy < Math.min(y + bandH, H); yy++) {
        const base = yy * W * 4;
        row.set(d.subarray(base, base + W * 4));
        for (let x = 0; x < W; x++) {
          const f = F(x, yy);
          if (f < 0.35) continue;
          const sh = Math.round(amp * f * (1 + SERP(x, yy) * 1.6));
          if (!sh) continue;
          const sx2 = clamp(x - sh, 0, W - 1);
          const i = base + x * 4, j = sx2 * 4;
          d[i] = row[j]; d[i + 1] = row[j + 1]; d[i + 2] = row[j + 2];
        }
      }
    }
    y += bandH;
  }
  // serpent stutter: a few rows repeat the row above, only inside the wound
  for (let k = 0; k < P.stutters; k++) {
    const yy = 1 + (rnd() * (H - 2) | 0);
    let any = false;
    for (let x = 0; x < W; x += 7) if (SERP(x, yy) > 0.45) { any = true; break; }
    if (!any) continue;
    for (let x = 0; x < W; x++) {
      const s = SERP(x, yy);
      if (s < 0.4) continue;
      const i = (yy * W + x) * 4, j = ((yy - 1) * W + x) * 4;
      d[i] = d[j]; d[i + 1] = d[j + 1]; d[i + 2] = d[j + 2];
    }
  }
}

// === 3. BLOCK DISLOCATION =================================================
// A few small rectangles copied slightly out of place in heavy zones —
// compression artifacts as impasto. Read from a frozen copy.
{
  const frozen = new Uint8ClampedArray(d);
  const nB = Math.round(P.blocks * (W * H) / (1600 * 1000)) || P.blocks;
  let placed = 0, t2 = 0;
  while (placed < nB && t2 < 400) {
    t2++;
    const bx = (rnd() * (W - 80)) | 0, by = (rnd() * (H - 80)) | 0;
    if (F(bx, by) < 0.68) continue;
    const bw = (18 + rnd() * 48) * devScale | 0, bh = (10 + rnd() * 30) * devScale | 0;
    const ox = Math.round((rnd() * 2 - 1) * 16 * devScale), oy = Math.round((rnd() * 2 - 1) * 7 * devScale);
    if (!ox && !oy) continue;
    for (let yy = 0; yy < bh; yy++) for (let xx = 0; xx < bw; xx++) {
      const tx = bx + xx, ty = by + yy;
      const sx2 = clamp(tx + ox, 0, W - 1), sy2 = clamp(ty + oy, 0, H - 1);
      if (tx >= W || ty >= H) continue;
      if (F(tx, ty) < 0.55) continue;          // block dies where the field thins
      const i = (ty * W + tx) * 4, j = (sy2 * W + sx2) * 4;
      d[i] = frozen[j]; d[i + 1] = frozen[j + 1]; d[i + 2] = frozen[j + 2];
    }
    placed++;
  }
}

// === 4. SERPENT WOUND EXTRAS ==============================================
// Dropped rows to near-black + one channel bleeding down-left. The only
// place recoloring is allowed: maximum corruption, the first dropped packet.
{
  // drop rows sampled along the band's own y-extent (canvas -> device y)
  const yLo = Math.max(0, Math.min(P.serpA.y, P.serpB.y) / P.map.sy);
  const yHi = Math.min(H - 1, Math.max(P.serpA.y, P.serpB.y) / P.map.sy);
  const dropRows = new Set();
  for (let k = 0; k < P.drops; k++) { const r0 = (yLo + rnd() * (yHi - yLo)) | 0; const th = 1 + (rnd() * 4 | 0); for (let t4 = 0; t4 < th; t4++) dropRows.add(r0 + t4); }
  for (let yy = 0; yy < H; yy++) {
    const dropping = dropRows.has(yy) || dropRows.has(yy - 1);
    for (let x = 0; x < W; x++) {
      const s = SERP(x, yy);
      if (s < 0.35) continue;
      const i = (yy * W + x) * 4;
      if (dropping && s > 0.42) {             // dropped packet
        const k2 = 0.08 + 0.1 * (1 - s);
        d[i] *= k2; d[i + 1] *= k2; d[i + 2] *= k2;
      } else if (s > 0.45) {                   // green bleeds from up-right
        const bx2 = clamp(x + Math.round(16 * devScale * s), 0, W - 1);
        const by2 = clamp(yy - Math.round(10 * devScale * s), 0, H - 1);
        d[i + 1] = Math.max(d[i + 1], d[(by2 * W + bx2) * 4 + 1]);
      }
    }
  }
}

// === 5. CHANNEL SPLIT (last, global, thin) ================================
// Complementary vibration as chromatic aberration; zero at the light.
{
  const frozen = new Uint8ClampedArray(d);
  for (let yy = 0; yy < H; yy++) {
    for (let x = 0; x < W; x++) {
      const f = F(x, yy);
      if (f < 0.12) continue;
      const s = f * P.splitMax * devScale;
      const i = (yy * W + x) * 4;
      const rx = clamp(Math.round(x - s), 0, W - 1);
      const bx2 = clamp(Math.round(x + s * 0.75), 0, W - 1);
      const by2 = clamp(yy + Math.round(s * 0.3), 0, H - 1);
      d[i] = frozen[(yy * W + rx) * 4];
      d[i + 2] = frozen[(by2 * W + bx2) * 4 + 2];
    }
  }
}

ctx.putImageData(id, 0, 0);
document.title = 'done';
`;
}

// ---------------------------------------------------------------------------
// Wrapper + rasterize + jpeg ladder (mirrors gen/build.mjs)
// ---------------------------------------------------------------------------
function buildEdition(ed) {
  const srcB64 = readFileSync(join(OUT, ed.src)).toString('base64');
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>
html,body{margin:0;padding:0;width:${ed.w}px;height:${ed.h}px;overflow:hidden;background:#000}
canvas{display:block}img{display:none}
</style></head><body>
<img id="src" src="data:image/jpeg;base64,${srcB64}">
<canvas id="cv"></canvas>
<script>
document.getElementById('src').decode().then(() => { ${''}
${programJS(ed)}
});
</script></body></html>`;
  const tmpHtml = join('/tmp', `glitch-${ed.out}.html`);
  const tmpPng = join('/tmp', `glitch-${ed.out}.png`);
  writeFileSync(tmpHtml, html);
  execFileSync(CHROME, [
    '--headless', '--disable-gpu', `--screenshot=${tmpPng}`,
    `--window-size=${ed.w},${ed.h}`, '--hide-scrollbars', '--force-device-scale-factor=1',
    '--virtual-time-budget=20000',
    pathToFileURL(tmpHtml).href,
  ], { stdio: 'pipe' });
  // jpeg ladder
  const dst = join(OUT, `${ed.out}.jpg`);
  const tga = join('/tmp', `glitch-${ed.out}.tga`);
  execFileSync('sips', ['-s', 'format', 'tga', tmpPng, '--out', tga], { stdio: 'pipe' });
  for (const q of [80, 72, 65, 55, 48, 40, 36]) {
    execFileSync('cjpeg', ['-quality', String(q), '-progressive', '-optimize', '-outfile', dst, tga], { stdio: 'pipe' });
    const kb = statSync(dst).size / 1024;
    if (kb <= TARGET_KB) return { kb, q };
  }
  return { kb: statSync(dst).size / 1024, q: 36 };
}

for (const ed of EDITIONS) {
  const t0 = Date.now();
  const { kb, q } = buildEdition(ed);
  console.log(`${ed.out}.jpg: ${kb.toFixed(0)} KB (q${q}) in ${((Date.now() - t0) / 1000).toFixed(1)}s${kb > TARGET_KB ? ' !! over budget' : ''}`);
}

// ---------------------------------------------------------------------------
// A/B study page
// ---------------------------------------------------------------------------
writeFileSync(join(SITE, 'glitch-study.html'), `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>glitch study — the oil vs the glitch</title>
<style>
  :root { --paper: #fbf9f3; --ink: #3a352c; --gray: #847d6e; --sand: #c8b88a; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: var(--paper); color: var(--ink); font-family: Georgia, 'Times New Roman', serif; line-height: 1.6; }
  main { max-width: 880px; margin: 0 auto; padding: 72px 24px 120px; }
  h1 { text-align: center; font-weight: normal; font-style: italic; font-size: 21px; letter-spacing: 0.04em; }
  .note-top { text-align: center; font-style: italic; color: var(--gray); font-size: 14px; margin: 14px 0 72px; }
  .note-top::after { content: ""; display: block; width: 48px; height: 1px; background: var(--sand); margin: 28px auto 0; }
  figure { margin: 0 0 90px; }
  figure:last-child { margin-bottom: 0; }
  .plate { border-radius: 6px; overflow: hidden; box-shadow: 0 1px 2px rgba(58,53,44,0.06), 0 14px 36px -16px rgba(58,53,44,0.22); }
  .plate img { display: block; width: 100%; height: auto; }
  figcaption { text-align: center; font-style: italic; color: var(--gray); font-size: 15px; margin-top: 14px; }
</style>
</head>
<body>
<main>
  <h1>glitch study</h1>
  <p class="note-top">drift is corruption of the image — where the light is, the image is whole.</p>
  <figure>
    <div class="plate"><img src="plates-vg/garden.jpg" alt="The garden at dusk, painted in oil strokes"></div>
    <figcaption>the oil</figcaption>
  </figure>
  <figure>
    <div class="plate"><img src="plates-vg/pilot-glitch-garden.jpg" alt="The same garden rendered through the machine's corruption: glitch intensity grows with distance from the light"></div>
    <figcaption>the glitch</figcaption>
  </figure>
</main>
</body>
</html>
`);
console.log('glitch-study.html written');
