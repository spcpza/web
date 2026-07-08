#!/usr/bin/env node
// gen/build.mjs — multi-plate atelier build for balthazar.sh Van Gogh plates.
//
//   node gen/build.mjs            build every plate in gen/plates/
//   node gen/build.mjs flame   build just one plate (parallel painters)
//
// Pipeline per plate:  module.paint(engine) -> SVG -> /tmp wrapper html
//   -> headless Chrome screenshot @1600x1000 (2x of the 800x500 canvas)
//   -> cjpeg/sips PNG->JPEG quality ladder until <= 180 KB
//   -> plates-vg/<name>.jpg                         (landscape edition)
// PLUS a portrait edition per plate — same strokes, different camera:
//   the SVG viewBox is re-windowed to a 312x500 column centered on the
//   module's focal.x (clamped to [0,488]), screenshot @1000x1600,
//   JPEG ladder to <= 200 KB -> plates-vg/<name>-p.jpg
// Then regenerates vg-preview.html (contact sheet, landscape + portrait
// side by side) from ALL plate modules.

import { readdirSync, writeFileSync, statSync, mkdirSync, copyFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import * as engine from './engine.mjs';
import { surfaceScript } from './surface.mjs';
import { gradeScript } from './grade.mjs';

const DIR = dirname(fileURLToPath(import.meta.url));      // .../gen
const SITE = dirname(DIR);                                 // .../balthazar-sh
const OUT = join(SITE, 'plates-vg');
const PLATES_DIR = join(DIR, 'plates');
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const TARGET_KB = 180;     // landscape edition budget
const TARGET_P_KB = 200;   // portrait edition budget
const TARGET_2X_KB = 1200;  // 4K-class landscape (@2x) — served only to screens that can see it
const TARGET_P2X_KB = 1300; // 4K-class portrait (@2x)

const only = process.argv[2] || null;

// Plates whose SVGs blew past ~1.5 MB with the relief slivers on: trim
// stroke counts — the bolder lit-edge coverage hides the difference.
const DENSITY_TRIM = {
  'love': 0.93,
  'garden': 0.9,
  'xray': 0.88,
  'bridge': 0.93,
  'ran': 0.86,
  'window': 0.8,
  'candle': 0.92,
};

mkdirSync(OUT, { recursive: true });

// load every plate module (metadata needed for the preview even on single builds)
const files = readdirSync(PLATES_DIR).filter(f => f.endsWith('.mjs')).sort();
const modules = [];
for (const f of files) {
  const m = await import(pathToFileURL(join(PLATES_DIR, f)).href);
  if (!m.name || !m.paint) { console.warn(`skip ${f}: needs exports { name, title, caption, seed, paint }`); continue; }
  modules.push(m);
}
if (only && !modules.some(m => m.name === only)) {
  console.error(`no plate named "${only}" — have: ${modules.map(m => m.name).join(', ')}`);
  process.exit(1);
}

// rasterize(slug, svg, w, h, viewW) — wrapper page -> headless screenshot.
// viewW is the SVG viewBox width (800 landscape / 312 portrait). THE OIL
// SURFACE PASS (gen/surface.mjs) runs inside the page before the screenshot:
// SVG -> canvas -> per-pixel impasto relief / canvas tooth / dry-brush /
// varnish -> DOM replaced with the processed canvas. The virtual-time budget
// lets the async image decode + GL pass finish before Chrome shoots.
function rasterize(slug, svg, w, h, viewW = 800, viewX0 = 0, focal = null, opts = {}) {
  const scale = (w / viewW) / 2;   // 1.0 at the 1600x1000 landscape press
  // THE REMBRANDT GRADE script goes in first (defines window.__grade); the
  // surface pass calls it on the raw raster before laying its own material.
  // opts.raw skips grade+surface (for the crisp transparent FOREGROUND layer);
  // opts.transparent makes Chrome shoot on a transparent background (PNG alpha).
  const grade = opts.raw ? '' : gradeScript({ name: slug, w, h, scale, viewX0, viewW, focal });
  const surf = opts.raw ? '' : surfaceScript({ name: slug, w, h, scale });
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>
html,body{margin:0;padding:0;width:${w}px;height:${h}px;overflow:hidden}
svg{display:block;width:${w}px;height:${h}px}
</style></head><body>${svg}${grade}${surf}</body></html>`;
  const tmpHtml = join('/tmp', `vg-${slug}.html`);
  const tmpPng = join('/tmp', `vg-${slug}.png`);
  writeFileSync(tmpHtml, html);
  const args = ['--headless', '--disable-gpu', '--enable-unsafe-swiftshader',
    `--screenshot=${tmpPng}`, '--virtual-time-budget=60000',
    `--window-size=${w},${h}`, '--hide-scrollbars', '--force-device-scale-factor=1'];
  if (opts.transparent) args.push('--default-background-color=00000000');
  args.push(pathToFileURL(tmpHtml).href);
  execFileSync(CHROME, args, { stdio: 'pipe' });
  return tmpPng;
}

// PORTRAIT PRESS: same canvas, different camera. Re-window the viewBox to a
// 312-wide full-height column centered on the plate's focal point.
const P_W = 312;
function portraitSvg(svg, focal) {
  const fx = focal && Number.isFinite(focal.x) ? focal.x : 400;
  const x0 = Math.round(Math.max(0, Math.min(800 - P_W, fx - P_W / 2)));
  return { svg: svg.replace('viewBox="0 0 800 500"', `viewBox="${x0} 0 ${P_W} 500"`), x0 };
}

// Dense impasto texture compresses poorly: sips q65 leaves the wheat plate
// at ~470 KB. cjpeg (libjpeg-turbo) with a descending quality ladder is the
// only encoder on this machine that lands under TARGET_KB; sips is the
// fallback if cjpeg is missing.
function hasCjpeg() {
  try { execFileSync('cjpeg', ['-version'], { stdio: 'pipe' }); return true; } catch { return false; }
}
const CJPEG = hasCjpeg();

function toJpeg(file, png, targetKb) {
  const dst = join(OUT, `${file}.jpg`);
  if (CJPEG) {
    const tga = join('/tmp', `vg-${file}.tga`);
    execFileSync('sips', ['-s', 'format', 'tga', png, '--out', tga], { stdio: 'pipe' });
    for (const q of [80, 72, 65, 55, 48, 40, 36]) {
      execFileSync('cjpeg', ['-quality', String(q), '-progressive', '-optimize', '-outfile', dst, tga], { stdio: 'pipe' });
      const kb = statSync(dst).size / 1024;
      if (kb <= targetKb) return { kb, q };
    }
    return { kb: statSync(dst).size / 1024, q: 36 };
  }
  for (const q of [80, 72, 65]) {
    execFileSync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', String(q), png, '--out', dst], { stdio: 'pipe' });
    const kb = statSync(dst).size / 1024;
    if (kb <= targetKb) return { kb, q };
  }
  return { kb: statSync(dst).size / 1024, q: 65 };
}

// THE ARTIST'S SIGNATURE, HIDDEN ON EVERY PAGE — עִמָּנוּאֵל (Immanuel, "God with us",
// Isa 7:14 / Matt 1:23): itself a name of Christ. CHAMELEON style (Fred, after
// the viral find-it games): no shadow, no emboss — a single transparent OUTLINE
// whose open fill borrows the paint beneath it; only the pale edge whispers.
// Placed at a different secret spot on each plate — never under the title/caption
// overlays, never on the focal subject, inside the portrait crop. Hunt it.
const SIG = 'עִמָּנוּאֵל';
function sigSVG(x, y, h) {
  const c = `font-family="Georgia, 'Times New Roman', serif" font-size="${h}" font-weight="700" text-anchor="middle"`;
  return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" ${c} fill="none" stroke="#fff6dc" stroke-width="1" opacity="0.4">${SIG}</text>`;
}
function stampSig(svgStr, fx, idx) {
  const ys = [156, 360, 198, 332, 250, 300, 224, 338];   // mid-band only (clear of the top nav + bottom caption)
  const y = ys[idx % ys.length];
  const side = (idx % 2 ? 1 : -1) * (104 + (idx % 4) * 15);
  const x = Math.max(140, Math.min(660, fx + side));      // off the centre subject, still inside the portrait crop
  return svgStr.replace('</svg>', sigSVG(x, y, 19) + '</svg>');   // bigger so it's findable on the small mobile display
}

engine.setInscriptionScale(1.45);   // the hidden verse-refs were sized for desktop; scale up so they're findable on the smaller mobile display too

// PER-PLATE STROKE STYLE — opacity (glaze) + roundness (organic↔firm), art-directed
// to what each page communicates. Default = {op:0.6, r:1} (airy, organic): the
// creation / new-life / joy pages. Light & glory go more translucent (the light
// shines through — John 1:5); sin, sorrow & death go denser and firmer (weight,
// shadow, the sealed stone); made things harden per Munch (cross/bridge straighter).
const STROKE_STYLE = {
  // — glory & tenderness: luminous, see-through, soft —
  light: { op: 0.54, r: 1 }, nonight: { op: 0.54, r: 1 }, prayer: { op: 0.56, r: 1 },
  risen: { op: 0.56, r: 1 }, love: { op: 0.58, r: 1 }, come: { op: 0.58, r: 1 }, comes: { op: 0.58, r: 1 },
  string: { op: 0.64, r: 1 }, hands: { op: 0.64, r: 1 },
  // — the road down & the weight: denser, firmer marks —
  road: { op: 0.66, r: 0.92 }, garden: { op: 0.70, r: 0.90 }, storm: { op: 0.74, r: 0.82 },
  bridge: { op: 0.70, r: 0.68 }, turning: { op: 0.78, r: 0.68 },
  paid: { op: 0.82, r: 0.58 }, lost: { op: 0.84, r: 0.60 }, grave: { op: 0.86, r: 0.58 },
};
const built = [];
for (const m of modules) {
  if (only && m.name !== only) continue;
  const t0 = Date.now();
  if (!m.focal) console.warn(`${m.name}: no focal export — portrait centers on x=400`);
  engine.setDensity(DENSITY_TRIM[m.name] || 1);
  const ss = STROKE_STYLE[m.name] || { op: 0.6, r: 1 };
  engine.setStrokeOpacity(ss.op); engine.setStrokeRound(ss.r);
  const fx = (m.focal && m.focal.x) || 400;
  const svg = stampSig(m.paint(engine), fx, built.length);   // sign the work — Immanuel, hidden
  engine.setDensity(1); engine.setStrokeOpacity(0.6); engine.setStrokeRound(1);
  // landscape edition
  const png = rasterize(m.name, svg, 1600, 1000, 800, 0, m.focal);
  const { kb, q } = toJpeg(m.name, png, TARGET_KB);
  // portrait edition — same strokes, focal-centered 312x500 window @1000x1600
  const { svg: pSvg, x0 } = portraitSvg(svg, m.focal);
  const pPng = rasterize(`${m.name}-p`, pSvg, 1000, 1600, P_W, x0, m.focal);
  let pKb = 0, pQ = 0;
  ({ kb: pKb, q: pQ } = toJpeg(`${m.name}-p`, pPng, TARGET_P_KB));
  if (process.env.EDITIONS !== 'fast') {
    // 4K editions — same strokes, twice the pixels; vectors print at any size
    const png2 = rasterize(`${m.name}@2x`, svg, 3840, 2400, 800, 0, m.focal);
    toJpeg(`${m.name}@2x`, png2, TARGET_2X_KB);
    const pPng2 = rasterize(`${m.name}-p@2x`, pSvg, 2400, 3840, P_W, x0, m.focal);
    toJpeg(`${m.name}-p@2x`, pPng2, TARGET_P2X_KB);
  }
  // MOBILE 3D LAYERS: a stack of depth-plane cels the panorama compositor slides
  // apart. The FIRST band is the opaque backmost (a .jpg); the rest are
  // transparent cels (.png). A plate declares its bands via `export const layers`
  // (FAR→NEAR, first = opaque), e.g.
  //   export const layers = [{name:'sky',opaque:true},{name:'far'},{name:'mid'},{name:'near'},{name:'fg'}];
  // Legacy plates with `export const layered = true` still emit sky/ground/fg.
  const bands = m.layers || (m.layered ? [
    { name: 'sky', opaque: true }, { name: 'ground' }, { name: 'fg' },
  ] : null);
  if (bands) {
    engine.setDensity(DENSITY_TRIM[m.name] || 1);
    // BRUSH SIZE PER DEPTH PLANE: biggest at the back, finer toward the front
    // (a broad, loose lay-in receding into crisp foreground detail). Linear over
    // the manifest order (band 0 = backmost). Reset to 1 for the full/desktop press.
    const NB = bands.length;
    // AERIAL PERSPECTIVE (da Vinci / Hokusai), scripture-grounded: the earth is
    // FOUNDED, the heavens STRETCHED (Prov 3:19) — so the ground the figures stand
    // on reads SOLID, and only the DISTANCE recedes into haze. The near GROUND plane
    // (`mid`/`land`, the anchor the characters stand on) paints near-solid so the
    // figures are planted, not floating; only the FAR scenery (`far`/`hills`) stays
    // airy (~0.6) for atmospheric recession. The SKY base, FIGURES and LIGHT are
    // always solid. Iconic pages (non-landscape) keep their divine `mid` opaque.
    const isLandscape = bands[0] && bands[0].name === 'sky';
    const NEARGROUND = new Set(['mid', 'land']);   // plane the figures stand on → solid
    const FARHAZE = new Set(['far', 'hills']);     // distance → airy aerial perspective
    const svgs = bands.map((L, i) => {
      const t = NB > 1 ? i / (NB - 1) : 0;               // 0 back → 1 front
      // THICK in back → really THIN up front, front-weighted (curve).
      engine.setBrushScale(0.4 + 1.3 * Math.pow(1 - t, 1.35));   // ~1.7× back → ~0.4× front
      const op = !isLandscape ? 1
        : NEARGROUND.has(L.name) ? 0.94
        : FARHAZE.has(L.name) ? 0.6
        : 1;
      engine.setLayerOpacity(op);
      return m.paint(engine, { layer: L.name });
    });
    engine.setBrushScale(1);
    engine.setLayerOpacity(1);
    engine.setDensity(1);
    svgs[0] = stampSig(svgs[0], fx, built.length);   // hide Immanuel on the opaque base so it shows on mobile too (same spot as the full)
    const out = [];
    bands.forEach((L, i) => {
      const opaque = L.opaque || i === 0;
      const png = rasterize(`${m.name}-${L.name}`, svgs[i], 1600, 1000, 800, 0, m.focal, { raw: true, transparent: !opaque });
      if (opaque) { toJpeg(`${m.name}-${L.name}`, png, TARGET_KB); out.push(`${L.name}.jpg`); }
      else { copyFileSync(png, join(OUT, `${m.name}-${L.name}.png`)); out.push(`${L.name}.png`); }
    });
    console.log(`  ↳ planes: ${out.map(s => m.name + '-' + s).join(' + ')}`);
  }
  built.push(m.name);
  console.log(`${m.name}: svg ${Math.round(Buffer.byteLength(svg) / 1024)} KB -> jpg ${kb.toFixed(0)} KB (q${q}) + portrait[x0=${x0}] ${pKb.toFixed(0)} KB (q${pQ}) in ${((Date.now() - t0) / 1000).toFixed(1)}s ${kb > TARGET_KB || pKb > TARGET_P_KB ? '!! over budget' : ''}`);
}

// contact sheet — embeds the full plate list at build time
const sheet = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>van gogh plates — contact sheet</title>
<style>
  :root { --paper: #fbf9f3; --ink: #3a352c; --gray: #847d6e; --sand: #c8b88a; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: var(--paper); color: var(--ink); font-family: Georgia, 'Times New Roman', serif; line-height: 1.6; }
  main { max-width: 880px; margin: 0 auto; padding: 72px 24px 120px; }
  h1 { text-align: center; font-weight: normal; font-style: italic; font-size: 21px; letter-spacing: 0.04em; }
  .note-top { text-align: center; font-style: italic; color: var(--gray); font-size: 14px; margin: 14px 0 80px; }
  .note-top::after { content: ""; display: block; width: 48px; height: 1px; background: var(--sand); margin: 28px auto 0; }
  figure { margin: 0 0 110px; }
  figure:last-child { margin-bottom: 0; }
  .pair { display: flex; gap: 16px; align-items: flex-start; }
  .plate { border-radius: 6px; overflow: hidden; box-shadow: 0 1px 2px rgba(58,53,44,0.06), 0 14px 36px -16px rgba(58,53,44,0.22); }
  .plate img { display: block; width: 100%; height: auto; }
  .land { flex: 1 1 auto; min-width: 0; }
  .port { flex: 0 0 19%; }
  .title { text-align: center; font-style: italic; font-size: 18px; margin-top: 20px; }
  figcaption { text-align: center; font-style: italic; color: var(--gray); font-size: 15px; margin-top: 6px; }
</style>
</head>
<body>
<main>
  <h1>van gogh plates — contact sheet</h1>
  <p class="note-top">${modules.length} plates from the atelier — every stroke authored</p>
${modules.map(m => `  <figure>
    <div class="pair">
      <div class="plate land"><img src="plates-vg/${m.name}.jpg" alt="${m.title}" loading="lazy"></div>
      <div class="plate port"><img src="plates-vg/${m.name}-p.jpg" alt="${m.title} (portrait)" loading="lazy"></div>
    </div>
    <p class="title">${m.title}</p>
    <figcaption>${m.caption}</figcaption>
  </figure>`).join('\n')}
</main>
</body>
</html>
`;
writeFileSync(join(SITE, 'vg-preview.html'), sheet);
console.log(`vg-preview.html: ${modules.length} plates listed${built.length ? `, built: ${built.join(', ')}` : ''}`);
