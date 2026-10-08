// gen/build-held-apple.mjs — a ONE-OFF standalone build for the "held apple"
// runtime prop (engine/scene.js HELD table, page 21 `bread`).
//
// ⚠ WHY THIS EXISTS. Fred: "why this one is totally different than the other
// apples? make it similar so it is consistent." The first pass hand-authored
// a flat 4-shape inline SVG (solid fill, one smooth highlight ellipse, two
// plain lines) directly in scene.js — a vector icon sitting next to a page
// full of painted strokes. It was never going to match: the plate's apples
// are built from ~30-100+ individual jittered brush marks (gen/engine.mjs
// `strokes()`), not a flat fill.
//
// This script reuses that EXACT SAME apple-painting code (copied verbatim
// from gen/plates/bread.mjs's `apple()`/`applePath()`/`appleR()` helpers, not
// reimplemented) at a fixed seed, and writes out just the resulting SVG
// fragment — the same brushwork, standalone, so the runtime prop is drawn by
// the same hand as every apple already in the picture.
//
// Rasterized through the SAME technique (not the same code path, but the
// same stage of the pipeline) as plates-vg/bread-fg.webp — the transparent
// multiplane layer this prop actually sits next to on screen: a straight SVG
// screenshot, no surface/impasto pass and no grade pass (see the note below,
// where that choice is verified against the real asset, not assumed).
//
// Run: node gen/build-held-apple.mjs
// Output: cast/apple-held.png + .webp (transparent, small — referenced by an
// <img> in engine/scene.js's HELD renderer).
import { writeFileSync, mkdirSync } from 'fs';
import { execFileSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { mulberry32, mix, ramp, jig, strokes, R1 } from './engine.mjs';

const DIR = dirname(fileURLToPath(import.meta.url));
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const rng = mulberry32(20261006);   // bread.mjs's own seed — same hand, same day
const out = [];
const counter = { n: 0 };
// ⚠ S IS THE SAME "s" THE PLATE APPLES USE, NOT A RASTER RESOLUTION. First
// pass set S=40 "for crispness" — but s ALSO drives mark density (dens =
// s²/4.4²) the same way it does in the plate, so 40 asked for ~4900 marks and
// a 1.1 MB SVG. These are vector paths; a bigger viewBox doesn't need more
// marks to stay crisp, it needs the SAME density the plate's own apples use.
// s=8 matches the size class already used for the biggest apples in the scene.
const S = 8;
const fx = 0, fyy = 0;     // centred at the origin; scene.js positions the whole SVG

const applePath = (cx, cy, s) => {
  const P = (x, y) => `${R1(cx + x * s)} ${R1(cy + y * s)}`;
  return `M${P(0, -0.85)} `
    + `C${P(0.15, -1.05)} ${P(0.35, -1.1)} ${P(0.55, -1.02)} `
    + `C${P(0.85, -0.9)} ${P(1.05, -0.55)} ${P(1.02, -0.15)} `
    + `C${P(1.0, 0.25)} ${P(0.85, 0.65)} ${P(0.55, 0.88)} `
    + `C${P(0.35, 1.0)} ${P(0.15, 0.92)} ${P(0, 0.85)} `
    + `C${P(-0.15, 0.92)} ${P(-0.35, 1.0)} ${P(-0.55, 0.88)} `
    + `C${P(-0.85, 0.65)} ${P(-1.0, 0.25)} ${P(-1.02, -0.15)} `
    + `C${P(-1.05, -0.55)} ${P(-0.85, -0.9)} ${P(-0.55, -1.02)} `
    + `C${P(-0.35, -1.1)} ${P(-0.15, -1.05)} ${P(0, -0.85)} Z`;
};
const APPLE_PTS = (() => {
  const segs = [
    [[0, -0.85], [0.15, -1.05], [0.35, -1.1], [0.55, -1.02]],
    [[0.55, -1.02], [0.85, -0.9], [1.05, -0.55], [1.02, -0.15]],
    [[1.02, -0.15], [1.0, 0.25], [0.85, 0.65], [0.55, 0.88]],
    [[0.55, 0.88], [0.35, 1.0], [0.15, 0.92], [0, 0.85]],
    [[0, 0.85], [-0.15, 0.92], [-0.35, 1.0], [-0.55, 0.88]],
    [[-0.55, 0.88], [-0.85, 0.65], [-1.0, 0.25], [-1.02, -0.15]],
    [[-1.02, -0.15], [-1.05, -0.55], [-0.85, -0.9], [-0.55, -1.02]],
    [[-0.55, -1.02], [-0.35, -1.1], [-0.15, -1.05], [0, -0.85]],
  ];
  const bez = (p0, p1, p2, p3, t) => {
    const u = 1 - t;
    return [u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
            u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1]];
  };
  const pts = [];
  for (const [p0, p1, p2, p3] of segs) for (let i = 0; i < 10; i++) {
    const [x, y] = bez(p0, p1, p2, p3, i / 10);
    pts.push([Math.atan2(y, x), Math.hypot(x, y)]);
  }
  pts.sort((a, b) => a[0] - b[0]);
  return pts;
})();
const appleR = theta => {
  while (theta > Math.PI) theta -= 2 * Math.PI;
  while (theta < -Math.PI) theta += 2 * Math.PI;
  const n = APPLE_PTS.length, first = APPLE_PTS[0], last = APPLE_PTS[n - 1];
  if (theta <= first[0] || theta >= last[0]) {
    const span = (first[0] + 2 * Math.PI) - last[0];
    const t = span === 0 ? 0 : ((theta < first[0] ? theta + 2 * Math.PI : theta) - last[0]) / span;
    return last[1] + (first[1] - last[1]) * t;
  }
  let lo = 0, hi = n - 1;
  while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (APPLE_PTS[mid][0] < theta) lo = mid; else hi = mid; }
  const a = APPLE_PTS[lo], b = APPLE_PTS[hi];
  const t = (theta - a[0]) / ((b[0] - a[0]) || 1);
  return a[1] + (b[1] - a[1]) * t;
};

// ---- the apple, verbatim from gen/plates/bread.mjs (fx,fyy,s = 0,0,S) ----
out.push(`<path d="${applePath(fx, fyy, S)}" fill="#a8341e"/>`); counter.n++;
const dens = Math.max(1, (S * S) / (4.4 * 4.4));
strokes(out, counter, {
  rng, n: Math.round(34 * dens),
  sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 0.72) * appleR(a) * 0.99; return [fx + Math.cos(a) * S * d, fyy + Math.sin(a) * S * d]; },
  dir: (x, y) => Math.atan2(y - fyy, x - fx) + Math.PI / 2 + (rng() - 0.5) * 0.6,
  col: (x, y, r) => jig(ramp(['#f0805a', '#e8503a', '#c8402a', '#8a1c10'], (y - (fyy - S)) / (S * 2)), r, 7),
  len: 3, lw: 1.7, steps: 2, lenJ: 0.5, wJ: 0.5, relief: 0.3,
});
out.push(`<path d="${applePath(fx, fyy, S * 1.05)}" fill="none" stroke="#2a0f08" stroke-width="${R1(Math.max(1.2, S * 0.14))}" opacity="0.22"/>`); counter.n++;
out.push(`<path d="${applePath(fx, fyy, S * 1.02)}" fill="none" stroke="#2a0f08" stroke-width="${R1(Math.max(0.8, S * 0.08))}" opacity="0.3"/>`); counter.n++;
strokes(out, counter, {
  rng, n: Math.max(4, Math.round(9 * Math.sqrt(dens))),
  sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 0.6) * 0.22; return [fx - S * 0.4 + Math.cos(a) * S * d, fyy - S * 0.45 + Math.sin(a) * S * d]; },
  dir: () => -0.3 + (rng() - 0.5) * 0.8, col: (x, y, r) => jig(mix('#fff0dc', '#f6a878', r()), r, 6),
  len: 1.8, lw: 1.2, steps: 1, relief: 0,
});
strokes(out, counter, { rng, n: Math.round(4 * Math.sqrt(dens)), sample: r => [fx + (r() - 0.5) * S * 0.1, fyy - S * (0.85 + r() * 0.35)],
  dir: () => -0.1, col: (x, y, r) => jig('#3a2210', r, 5), len: 3, lw: Math.max(1, S * 0.11), steps: 1 });
out.push(`<path d="M${R1(fx + S * 0.04)} ${R1(fyy - S * 0.88)} Q${R1(fx + S * 0.4)} ${R1(fyy - S * 1.05)} ${R1(fx + S * 0.62)} ${R1(fyy - S * 0.78)} Q${R1(fx + S * 0.32)} ${R1(fyy - S * 0.72)} ${R1(fx + S * 0.04)} ${R1(fyy - S * 0.88)} Z" fill="#3a7a38" opacity="0.92"/>`); counter.n++;

const pad = S * 1.35;
const vbW = pad * 2, vbH = pad * 2.3;
const svg = `<svg viewBox="${-pad} ${-pad * 1.15} ${vbW} ${vbH}" xmlns="http://www.w3.org/2000/svg">${out.join('')}</svg>`;

// ⚠ NO SURFACE PASS — MATCH THE ASSET THIS ACTUALLY SITS NEXT TO. A first
// pass here ran the SVG through gen/surface.mjs's impasto/canvas-tooth
// simulation, reasoning that was where the plate's painted look comes from.
// It wasn't a fair comparison: the apples this prop stands next to are the
// ones already ON SCREEN, and those come from the multiplane FG layer
// (plates-vg/bread-fg.webp) — which build.mjs rasterizes with
// `{ raw: true, transparent: true }` (see the multiplane loop), i.e. NO
// surface, NO grade, ever, for any transparent layer in this whole book.
// Checked directly (cropped bread-fg.png at an apple): the raw strokes alone
// already read as a solid, clearly-shaped apple at native scale — the
// "soft blob" impression earlier came from viewing an isolated SVG at ~22x
// zoom, which softens ANY painted texture in this style, plate apples
// included. Matching the real asset means matching its real pipeline stage.
const PX_PER_UNIT = 9.3;   // oversampled beyond the plate's native 2px/unit for retina crispness; still a straight SVG rasterization, same technique as bread-fg.webp
const W = Math.round(vbW * PX_PER_UNIT), H = Math.round(vbH * PX_PER_UNIT);
const html = `<!doctype html><html><head><meta charset="utf-8"><style>
html,body{margin:0;padding:0;width:${W}px;height:${H}px;overflow:hidden;background:transparent}
svg{display:block;width:${W}px;height:${H}px}
</style></head><body>${svg}</body></html>`;
mkdirSync('/tmp', { recursive: true });
const tmpHtml = join('/tmp', 'vg-apple-held.html');
const tmpPng = join('/tmp', 'vg-apple-held.png');
writeFileSync(tmpHtml, html);
execFileSync(CHROME, ['--headless', '--disable-gpu', '--enable-unsafe-swiftshader',
  `--screenshot=${tmpPng}`, '--virtual-time-budget=60000', `--window-size=${W},${H}`,
  '--hide-scrollbars', '--force-device-scale-factor=1', '--default-background-color=00000000',
  pathToFileURL(tmpHtml).href], { stdio: 'pipe' });

const dstDir = join(DIR, '..', 'cast');
mkdirSync(dstDir, { recursive: true });
const dstPng = join(dstDir, 'apple-held.png');
execFileSync('cp', [tmpPng, dstPng]);
try {
  execFileSync('python3', ['-c',
    'import sys;from PIL import Image;Image.open(sys.argv[1]).convert("RGBA").save(sys.argv[2],"WEBP",quality=95,method=6)',
    dstPng, join(dstDir, 'apple-held.webp')], { stdio: 'pipe' });
} catch (e) { console.warn('  ! webp conversion failed — the .png still ships'); }
console.log(`cast/apple-held.png (+webp) written — ${counter.n} marks, ${W}x${H}px, viewBox ${vbW.toFixed(1)}x${vbH.toFixed(1)}`);
