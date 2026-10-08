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

import { readdirSync, writeFileSync, statSync, mkdirSync, copyFileSync, unlinkSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import * as engine from './engine.mjs';
import { hand } from './genome.mjs';   // the snowflake law — one hand, 33 histories
import { surfaceScript } from './surface.mjs';
import { gradeScript } from './grade.mjs';

// ep1→sprite port: DEBAKE=1 skips the figures (paintMask) so plates become
// clean backgrounds; the figures are recreated as runtime sprites (CAST1).
if (process.env.DEBAKE === '1') globalThis.__SKIP_FIG = true;
// ep1's figures are RUNTIME SPRITES (engine/character.js draws them over the plate).
// Rebuilding a plate without DEBAKE=1 bakes them back into the raster, and the reader
// then sees the painted figure AND the sprite — a doubled character. That has bitten
// this project more than once, so default it on for ep1 rather than leave it to memory.
// Set DEBAKE=0 explicitly if you ever really want the figures painted in.
if (process.env.DEBAKE !== '0') globalThis.__SKIP_FIG = true;

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

// ep2/3/4 were painted "lean" (fewer strokes) for the live-render era, so their
// grounds read smooth/flat next to ep1's dense impasto. Now they render as baked
// flat plates like ep1 — boost their stroke density to match ep1's painted feel.
const EP24 = new Set(('calling choice city cry delight everlasting gates house life path reveal rubies seek teach whisper '
  + 'armor champions dread errand fallen hill iron pattern quiet shout sling small stones vale watch '
  + 'chosen empire feast gatekeeper gladness glass letters opendoor sackcloth sceptre threedays time twonames weaver web').split(' '));
const EP24_BOOST = 1.0;   // density was NOT the difference (broken colour / manifold was) — no boost
const densityFor = name => (DENSITY_TRIM[name] || 1) * (EP24.has(name) ? EP24_BOOST : 1);
// ep2/3/4 plates REDRAWN from scratch in ep1's vivid style — they carry their own
// rich palette, so they skip the colour-punch (which is only for the old pale plates).
const REPAINTED = new Set(['teach']);


// TRANSPARENT PLANES SHIP AS WEBP. A transparent PNG of thousands of soft motes is
// enormous (the cover was 4.7 MB of them — most of a cold first load); the same
// pixels as webp q95 are ~57% smaller and the difference is not visible once the
// plane is composited at partial opacity behind the parallax. The .png is kept
// beside it as the fallback scene.js retries with.
// ⚠ PER-PLATE WEBP QUALITY. q95 was chosen when the planes were fat strokes; a plane of fine
// streaks is all edges, and at q95 the cover's sheets doubled in weight the moment they were
// painted properly (Sep 8). Behind a parallax at partial opacity the difference between q95
// and the mid-80s is invisible, and the cover is the first thing every phone downloads.
// ⚠ Sep 25 (Fred: "loads faster without sacrificing quality and beauty"): q95 → q80 book-wide. Compared at
// phone magnification (~2.5×) q80 is indistinguishable from q95 on the brushwork and 35–50% lighter;
// all 661 shipped planes were re-encoded to match (originals in attic/webp-q95-sep25/).
const WEBP_Q_DEFAULT = 95;   // Sep 26: back to 95 — Fred: "we want the quality to still be top notch!"
const WEBP_Q_PAGE = { word: 84 };
function toWebp(pngPath) {
  const out = pngPath.replace(/\.png$/, '.webp');
  const slug = pngPath.split('/').pop().split('-')[0];
  const q = WEBP_Q_PAGE[slug] || WEBP_Q_DEFAULT;
  // ⚠ Sep 15: /usr/bin/python3 began refusing to run (an Xcode-licence prompt after an update) and
  // the LAST TWO plates of a whole-book queue shipped stale .webp planes under fresh .png fallbacks —
  // the md5 check passed because stale == stale. So the converter tries every python it knows, and a
  // conversion failure is now LOUD (see the warning: grep the build log for it before any deploy).
  const PYS = [process.env.PYTHON, 'python3', '/opt/homebrew/bin/python3', '/usr/local/bin/python3'].filter(Boolean);
  for (const py of PYS) {
    try {
      execFileSync(py, ['-c',
        'import sys;from PIL import Image;Image.open(sys.argv[1]).convert("RGBA").save(sys.argv[2],"WEBP",quality=int(sys.argv[3]),method=6)',
        pngPath, out, String(q)], { stdio: 'pipe' });
      // ⭐ Sep 25: the cover's soft nebula sheets (word-n*) also ship as AVIF q60 — 56% lighter than the
      // webp with no visible change, and the cover is what every first-time reader downloads. The
      // engine asks for .avif only when the browser can decode it (AVIF_OK in engine/scene.js) and
      // falls back to this .webp otherwise. The sharp mote shells (s*, fg) stay webp: AVIF softens specks.
      if (false && /\/word-n\d/.test(pngPath)) {   // Sep 26: AVIF off (quality first) — see planeExt in scene.js
        try { execFileSync(py, ['-c', 'import sys;from PIL import Image;Image.open(sys.argv[1]).convert("RGBA").save(sys.argv[2],"AVIF",quality=60,speed=4)', pngPath, out.replace(/\.webp$/, '.avif')], { stdio: 'pipe' }); }
        catch (e) { console.warn(`  !!! AVIF CONVERSION FAILED for ${pngPath} — delete its stale .avif or the cover shows the OLD sheet`); }
      }
      return true;
    } catch (e) { /* try the next interpreter */ }
  }
  console.warn(`  !!! WEBP CONVERSION FAILED for ${pngPath} — the .png fallback ships and the OLD .webp stays LIVE. Fix the python before deploying.`);
  return false;
}

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
function sigSVG(x, y, h, stroke = '#fff6dc', op = 0.4) {
  const c = `font-family="Georgia, 'Times New Roman', serif" font-size="${h}" font-weight="700" text-anchor="middle"`;
  return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" ${c} fill="none" stroke="${stroke}" stroke-width="1" opacity="${op}">${SIG}</text>`;
}
function stampSig(svgStr, fx, idx, ov) {
  if (ov && typeof ov.x === 'number') {   // a plate may choose its own hiding place (export sig = {x,y,h?,stroke?,op?})
    return svgStr.replace('</svg>', sigSVG(ov.x, ov.y, ov.h || 19, ov.stroke, ov.op) + '</svg>');
  }
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
  // ⚠ risen 0.56 -> 0.78. The see-through glaze was right for the old flat plate, where
  // glory WAS the picture. The rebuilt page is a painted place — rock, ground, weather —
  // and at 0.56 every mark let the bed through, so the whole plate came up chalk and the
  // blaze had nothing solid to blaze against. Still lighter than `grave`'s 0.86: the light
  // shines through, but the world it shines on is made of paint.
  risen: { op: 0.78, r: 1 }, love: { op: 0.58, r: 1 }, come: { op: 0.58, r: 1 }, comes: { op: 0.58, r: 1 },
  string: { op: 0.64, r: 1 }, hands: { op: 0.64, r: 1 },
  // — the road down & the weight: denser, firmer marks —
  road: { op: 0.66, r: 0.92 }, garden: { op: 0.70, r: 0.90 }, storm: { op: 0.74, r: 0.82 },
  calling: { op: 0.70, r: 0.88 },   // ep2 cover — the twilight town, firm straight masonry
  whisper: { op: 0.78, r: 0.66 },   // ep2 — the dark corner: dense, hard-edged stone

  bridge: { op: 0.70, r: 0.68 }, turning: { op: 0.78, r: 0.68 },
  paid: { op: 0.82, r: 0.58 }, lost: { op: 0.84, r: 0.60 }, grave: { op: 0.86, r: 0.58 },
};
// ---- BOIL FRAMES (Fred, Aug 2026: "draw several background frames and just loop it") ----
// BOIL_FRAME=1 BOIL_N=3 node gen/build.mjs garden
//   re-renders ONLY that plate's depth planes, with every mark displaced a hair, and
//   writes them as `<plate>-<band>-b1.*`. Frame 0 is the art that already exists and is
//   never touched — so the loop starts from the approved painting and returns to it.
//   The landscape/portrait/4K presses are skipped: what the reader sees is the planes.
const BOIL_FRAME = process.env.BOIL_FRAME ? +process.env.BOIL_FRAME : 0;
// ⚠ THE FRAME NUMBER IS HANDED TO THE PLATE ITSELF. Fred: "the way you are making the
// background breathe is by copy and pasting the same image and then moving it left and
// right. this is damn lazy... actually DRAW few scenes and animate it that way."
// He is right, and the distinction matters: the BOIL re-renders every stroke a hair off
// its place (that is drawing), but CLOUD_DRIFT just translates one finished image, which
// is exactly the copy-and-move he is describing. A plate can now read which frame it is
// being asked for and DRAW THAT MOMENT — eddies further round their orbit, turbulence
// advanced, jewels moved — so the frames are different pictures of a turning sky rather
// than one picture slid sideways.
globalThis.__FRAME = BOIL_FRAME;
const BOIL_N = +(process.env.BOIL_N || 3);
globalThis.__FRAME_N = BOIL_N;
const BOIL_AMP = +(process.env.BOIL_AMP || 1.25);
const BSUF = BOIL_FRAME ? `-b${BOIL_FRAME}` : '';
// HOW MUCH EACH DEPTH PLANE MOVES. Fred: "make the sky calmer." A sky is air and
// distance — it should barely stir, and a far plane that boiled as hard as the ground
// would read as static on the picture rather than as weather. The near planes, where
// the grass and the fire and the things you can touch are, move most. This is aerial
// perspective applied to TIME instead of to colour.
const BOIL_BAND = { bg: 0.60,   // the deep on `beginning`: a broad slow stir, not a shimmer
                    sky: 0.34, sky1: 0.38, sky2: 0.38, far: 0.7, hills: 0.7,
                    mid: 1.25, land: 1.25, ground: 1.25, near: 1.4, front: 1.45, fg: 1.45,
                    // ⚠ THE COVER'S MOTE SHELLS AND WORD NEVER MOVE. Every one of the
                    // 31,102 motes is a real verse at a true position; displacing one is
                    // not a brushstroke wobbling, it is scripture moving. They get zero
                    // displacement and TWINKLE instead — see BOIL_TWK below.
                    s0: 0, s1: 0, s2: 0, s3: 0, s4: 0, s5: 0 };
// BRIGHTNESS-ONLY life, for marks that must hold their exact place. The mote shells
// swing hardest (they are stars, and a star's whole business is to shine); the Word
// pulses gently, like a countenance rather than a lamp being switched.
const BOIL_TWK = { s0: 0.40, s1: 0.42, s2: 0.44, s3: 0.44, s4: 0.44, s5: 0.44 };
// ⚠ A GLIMMER IS BRIGHTNESS ONLY — NO DISPLACEMENT AT ALL. This is the lesson of the
// whole week in one line: MOVING a light source smears it (the beam spreads, gathers,
// spreads — that was the "flashing"), but letting each mark of it rise and fall on its
// own phase, in place, is light glimmering. It is also the only whole-plane effect that
// survives a tilt, because nothing can slide against anything.
const BOIL_TWK_PAGE = {};
// ---- THE FIRST LIGHT, SHIMMERING THROUGH ITS OWN COLOURS ----
// Four drawings of the SAME strokes in the same places, each leaning to a different
// colour, cross-faded. White light is every colour at once (and the covenant sign is a
// rainbow, Gen 9:13) — so the first light shimmering through gold, rose, sky and a cool
// green-white is not a liberty, it is what the light IS. Kept gentle: a lean, not a
// repaint, so at any instant it still reads as the painting Fred made.
// ⚠ SATURATE THE TARGET. My first pass leaned near-WHITE strokes toward PALE tints and
// the four drawings came out (237,230,200) / (237,228,204) / (234,230,207) — a difference
// of three or four units, which is nothing. A light is already almost white; to colour it
// at all you must aim at a real colour, not a tinted white. And both bands carry the
// light here: `mid` is the long rays raking the dark, `fg` is the star and its sparks.
// ⚠ THE TINT IS GONE. Fred: "i dont like this hue swing... this is lazy." He is right —
// recolouring the same marks is a filter, not animation. The light now REDRAWS: its rays
// reach further and draw back, in a wave that travels around the source (see the plate).
const BOIL_TINT_PAGE = {
};
const BOIL_GLIMMER_NO_MOVE = { beginning: { fg: 0, mid: 0 } };   // ⚠ amplitude 0: a tint must never also travel
// ---- PER-PAGE WEATHER (Fred, Aug 2026) ----
// "a great example could be the baloon page, you cannot do the normal breathing sky in
//  this page. it is a storm, so make the background move faster, string erratic,
//  protagonist getting thrown around."
// Exactly right, and it is the argument against one setting for the whole book. On
// `string` the sky is not breathing, it is CHURNING, so its sheets get roughly three
// times the calm-page displacement. And the fg band is the hand -> string -> adrift
// child, drawn as ONE CONNECTED SYSTEM, so a field anchored at the hand whips the whole
// length of it: the fist barely stirs, the far end is flung.
const BOIL_BAND_PAGE = {
  // ⚠ flame's great trees: NO displacement (Sep 14, Fred: "on flame the trees blur"). Two drawings of
  // a canopy a hair apart, cross-faded, double every leaf — a blur, and the pigment steps made it
  // plainer. So the near plane's two drawings are identical (crisp, still); the sky keeps its breath.
  // If the trees are to bend, it is the runtime bough rig's job, never a dissolve.
  flame: { near: 0 },
  // ⚠ AND THESE ARE BACK TO THE QUIET BREATH. I gave five calm pages six-drawing rings
  // to make them "properly animated", and every one of them came back wrong: first the
  // flow smeared their light, then — with flow removed — I RAISED their amplitude to
  // compensate, so the whole surface shimmered in step and read as a flicker all over
  // again. The drawings were never bright or dark (turning measures 113.1-113.2 across
  // all six); it is the MOTION that flickers when a large soft sky moves everywhere at
  // once. Six drawings suit a storm, where the air genuinely churns. A calm page wants
  // the two-drawing cross-fade Fred designed himself — the one he called elegant.
  // Rings and flow are for weather. Everything else breathes.
  // ⚠ `lost` NEEDS A BIGGER STIR THAN THE DEFAULT. Fred: "i dont see any animations on the
  // background whatsoever" — and he was right where my measurement was not: the sky
  // measured 0.00% change while the walker measured 15%, so what I had called a breath was
  // only ever him. At the default bg amplitude (0.60) the two drawings differ by 0.4% of
  // their pixels, which on a dark, smooth, low-contrast plain is nothing at all. A page
  // this quiet has to move MORE than a busy one to read as moving at all.
  // ⚠ WIND, NOT SHIMMER. Wheat is a hillside of small high-contrast marks, so the boil is
  // visible on every one of them — measured at full amplitude it moved 21% of the field
  // between glances, which is not a breeze over a crop, it is a field vibrating. Half.
  // ⚠ family: ZERO. This page's sky moves because the PLATE draws a different cloud bank
  // for each frame (see the note above skyCol in family.mjs) — it does not need, and must
  // not have, the engine's mark-by-mark shimmer on top, because `bg` here holds the meadow
  // as well as the air and a displaced meadow crawls like TV snow. At 0 the ground is
  // byte-identical between drawings and only the cloud changes.
  // ⭐ the cover's brushwork sheets (Sep 8): at the default 1.25 px the second drawing
  // measured 2.2–2.9 at 40px against the base — below every approved breathing page
  // (nonight 3.3, prayer 4.2) — so the galaxy did not visibly move by itself and the only
  // motion a desktop reader saw was the hover parallax. The nearest sheet moves most.
  word:   { n0: 2.0, n1: 2.2, n2: 2.4 },
  family: { bg: 0 },
  // ⚠ prayer: ZERO on `mid` for the same reason, and one more. The light on this page moves
  // because it is DRAWN four times (the wrap breathes, the corona pulses, the thread climbs);
  // the engine's mark-by-mark displacement on top of that would only smear it — and a smeared
  // light is the exact "flashing" fault the glimmer note further up was written about.
  prayer: { mid: 0 },
  // ⚠ light and come: ZERO, same as the two above. Both pages move because the PLATE draws
  // the light streaming — the glory pouring out of its own centre, the river running down to
  // the reader — and the engine's mark-by-mark shimmer on top of that would only blur it.
  // On `come` it would also be actively wrong: the reeds and the kingfisher share the river's
  // plane, and a displaced bird is two birds.
  // ⚠ `light` is NOT zeroed. Its marks stay exactly where they are between drawings (the
  // motion is a wave of reach, not travel — see the note above the glory field), so the
  // engine's own gentle stir is welcome here: it is soft broad paint, the one thing a boil
  // flatters. `come` IS zeroed — the reeds and the kingfisher share the river's plane, and a
  // displaced bird is two birds.
  come:   { fg: 0 },
  // ⚠ light's fg carries the NAME (יהושע). The boil may vary the HAND but never the STORY —
  // displacing a letter of it is not a brushstroke wobbling, it is scripture moving. Zero
  // amplitude: this plane changes only by what the plate draws for that frame (the heart's
  // corona), and every letter lands in exactly the same place in all four drawings.
  light:  { fg: 0 },
  // ⚠ together: ZERO. Its Light and its road are DRAWN afresh each frame (their passes are
  // reseeded); the night's long streaming strokes are not, and must not be — a night sky that
  // crawls mark by mark reads as static, not as weather.
  together: { bg: 0 },
  /* ⚠ EVERY MARK MOVING AT ONCE IS A CHURN, NOT A BREATH — and the number said so before I
     could see it. Measured across the two drawings of each new sky: `comes` moved 15-20% of
     its pixels per pair, `nonight` moved 30%. Twice the motion, on the page that is supposed
     to be the calmest in the book. The cause is simply that nonight's glory is an enormous
     field of dense swirl marks, so a default displacement shifts all of them together.
     `comes` keeps the full amplitude: its heavens are being TORN OPEN, and that is the one
     sky here allowed to move like weather. Eternity is not allowed to look nervous. */
  nonight: { sky: 0.5 },
  road:   { mid: 0.28 },
  string: { sky: 0.95, sky1: 1.20, sky2: 1.20, far: 0.95, mid: 1.0, fg: 1.0, birds: 3.4 },
  storm:  { sky: 0.90, sky1: 1.15, sky2: 1.15, far: 0.90, mid: 1.1, fg: 1.25 },
};
// THE CYCLONE BANDS. Only the sky sheets stream — the hills and the ground are not in
// the air. Amplitude is large on purpose: this is paint travelling, not a mark trembling.
const BOIL_FLOW_PAGE = {
  // ⚠ FLOW IS NOW WEATHER ONLY. Fred: "love, turning, still have the lightning thing."
  // Same fault as `made`, and it generalises further than I first cut it: FLOW moves
  // every mark COHERENTLY along the painted field, so wherever a sky holds a bright
  // feature — a golden swirl, a warm break, a dawn — that feature is carried bodily
  // across the frame and back. It reads as a pulse on any page with light in its sky,
  // which is nearly all of them. Only the two storms, whose skies are genuinely churning
  // weather with no single light to smear, keep it.
  // ⚠ AND `lost` MAY HAVE FLOW, for the same reason love's swirl sheets may: the ban
  // exists because flow carries a sky's bright feature bodily across the frame, and this
  // band no longer HAS one — the far glimmer was lifted onto its own cel when it was
  // rigged to breathe. What is left in `bg` is dark air over a dead plain, and dark air
  // is the one thing that should be drifting. It travels along the plain, not across it.
  string: { sky: [7, 150], sky1: [10, 130], sky2: [11, 120] },
  storm:  { sky: [6, 160], sky1: [9, 140], sky2: [10, 125] },
  // ⚠ LOVE'S SKY TURNS, and it is safe here for the one reason flow is usually banned:
  // the light source is NOT in these bands. The sun's disk lives in the opaque `sky`
  // plane; these are the swirl sheets above it, so streaming them turns the brushwork
  // without smearing the sun.
  love:   { sky1: [8, 150], sky2: [9, 135] },
};
// WHICH DRAWING OF THE LOOP IS THE FLASH. One hard strike and one dimmer afterglow the
// drawing after it, so the light does not simply blink on and off — real lightning leaves
// the sky glowing for a beat. Every band in that pass is lit: a strike lights the ground
// and the birds too, not only the clouds.
// ⚠ A LIGHT-BREAK IS NOT LIGHTNING. Same mechanism — one drawing of the loop lit, and
// a dimmer one after it — but on the resurrection and coming pages it must read as
// GLORY, not weather: gentler (0.30 against the storm's 0.46) and it belongs to pages
// whose own sentence is about light arriving.
// ⚠ A FLASH BELONGS ONLY WHERE THE WEATHER IS VIOLENT. Fred: "the blinking is just too
// much, it is like there is lightning. it is good on storm and string, but not the
// others." He is right twice over. First, a light-break on a glory page reads as
// LIGHTNING whatever I call it — the eye knows a sudden bright frame as a strike, and
// "In the beginning was the Light" is not a thunderstorm. Second, the maths turned
// against it: I tuned these for a SIX-drawing ring (one lit frame in six), and then the
// memory fix capped rings at THREE — so the strike started firing twice as often as
// designed. A number tuned against one constant does not survive the constant changing.
const BOIL_FLASH_PAGE = {
  string: { 2: 0.46, 3: 0.15 }, storm: { 2: 0.46, 3: 0.15 },
};
// ⚠ ONLY BANDS THAT RUN THE FULL RING MAY FLASH. A band with just two drawings would
// alternate lit/unlit forever — a strobe, not a strike. The far hills and the grip keep
// their two calm drawings and simply do not light.
// which bands actually run a ring at runtime — MUST match BOIL_PLANE_N in
// engine/scene.js, because that table is what decides whether the base is hidden.
const BOIL_NONRING_N = { word: 2 };   // see the note at setBoil
// plates whose `bg` plane is a SKY (the rest use `bg` for the ground or a deep field) — for FLOW
const SKY_BG = new Set(['beginning', 'made', 'lost', 'bread', 'light', 'come', 'together', 'candle', 'family', 'washed', 'prayer', 'looking', 'turning']);
const BOIL_RING_BANDS = {
  word: ['n0', 'n1', 'n2'],   // the cover's brushwork sheets: eight drawings of the paint flowing inward (stop motion); the mote shells stay a two-drawing twinkle at full res
  love:   ['sky1', 'sky2'],   // the Sower's swirl sheets: a ring, so the sky can travel
  string: ['sky', 'sky1', 'sky2', 'birds', 'mid'],
  storm:  ['sky', 'sky1', 'sky2', 'mid'],
  beginning: ['fg', 'mid'],   // the light graphic — star, sparks AND rays — in four colours
  // these keep SIX drawings, but drawn with the ordinary boil rather than flow: each
  // mark wanders its own little orbit instead of the whole field marching one way, so
  // the surface lives and the light stays exactly where it was painted.
  // (only the two storms ring now — see above)
};
const BOIL_FLASH_BANDS = { string: ['sky', 'sky1', 'sky2', 'mid', 'birds'],
                           storm:  ['sky', 'sky1', 'sky2', 'mid'] };
// THE GROUND IN A GALE. The hill is earth and must not move; the grass on it must. One
// field does both: zero in the soil below y=430, rising to full at the grass tips.
const BOIL_FIELD_GROUND = (x, y) => Math.max(0, Math.min(1, (432 - y) / 74)) * 2.6;
// ⚠ THE SAME IDEA, THIS PLATE'S OWN GEOMETRY. `storm` keeps solid earth in `mid` too,
// but its soil sits at y~300 (soilY) instead of 432, and what has to move is the BENT
// TREE standing on it. Zero at and below the soil line — the cutaway earth and the roots
// are rock — rising to full at the crown, which is what the gale is bending.
// ⚠ AND A BRANCH WHIPS — it does not sway evenly with the trunk. Linear in height was
// too polite: the crown barely out-moved the roots. Raised to the cypress's own law
// (amplitude climbing as a power of height), so the trunk stays planted, the boughs
// lean and the branch TIPS are flung. This is the page where the roots hold and the
// tree does not: the contrast has to be visible.
// ⚠ AND IT HAS TO BE FELT. Fred: "can you make the tree on storm get hit by the wind."
// Measured on the built frames, the whip was working exactly as designed — crown +11px,
// trunk +1px, foot 0, bedrock 0 — but 11px of a diffuse cloud of leaf marks reads as
// SHIMMER, not as a tree being bent, and the trunk between them barely flexed at all.
// Two changes: a bigger throw (6.0 -> 9.5), and a softer exponent (1.6 -> 1.25) so the
// motion is not all concentrated in the last few units of crown — the whole trunk bows
// and the crown is flung, which is what "hit by the wind" looks like. Foot still zero.
// ⚠ AND THE EXPONENT IS WHAT DECIDES WHETHER THE TRUNK BOWS. At 1.25 the throw was still
// piled into the last few units of crown: measured across the ring, the canopy swung 19px
// while the trunk moved 3 and its middle 1 — leaves shimmering on a post. A tree hit by
// wind bends along its LENGTH. Near-linear (1.05) hands the trunk a real share while the
// crown still travels furthest, which is the whip; the foot stays at exactly zero because
// the term is clamped at the soil line, so the tree bends and never uproots.
const BOIL_FIELD_STORM_GROUND = (x, y) => Math.pow(Math.max(0, Math.min(1, (288 - y) / 110)), 1.05) * 13.0;
const HAND = { x: 196, y: 402 };   // where the string is held on `string`
// ⚠ `born`: THE LAND STIRS WHERE HIS LIGHT HAS REACHED. This page's whole subject is that
// the new creation is spreading outward from the child (2 Cor 4:6, Prov 4:18), so its wind
// is not weather — it is HIM. Amplitude follows the plate's own `nw` term: the meadow in
// his light breathes hard, the far cool world that he has not reached yet barely moves.
// Keep this formula in step with `nw` in gen/plates/born.mjs — they are the same idea, and
// if they drift the land will come alive in the wrong place.
// ⚠ `born`: THE SKY IS DAMPED, AND THE MEADOW DOES NOT BOIL AT ALL.
// First attempt boiled `mid` with amplitude up to 2.4x default where his light falls — the
// land coming alive around the child. It had to be abandoned, and the reason is worth more
// than the effect was: a boil works by displacing every mark a hair, and whether that reads
// as LIFE or as STATIC depends on whether the marks form soft coherent shapes. Sky, cloud
// and light do (a form breathes). A meadow of thousands of high-contrast blades does not —
// each one crawls on its own and the eye reads television snow. Measured, the meadow was
// inside the approved band and still unwatchable, so the band was never the test.
// So born breathes where every working boil in this book breathes: the sky. Damped below
// default because this one CUTS rather than fades (BOIL_HARD — the plane is opaque, and a
// fading opaque plane flickers to the page behind it).
const BOIL_FIELD_BORN_SKY = () => 0.55;
// ⚠ `hands`: A SUMMER FIELD, AND THE ROAD MUST NOT SLIDE. Fred: "make the grass move and
// the sky breathe." The grass here is thousands of high-contrast blades, and born proved
// what an incoherent boil does to that — every blade crawls on its own and the eye reads
// television snow. So this is a FIELD, which forces one coherent, largely horizontal sway
// (see the note below): the whole sward leans and returns together, which is a breeze.
//   The `grass` plane holds only what STANDS UP; the ground lives in `mid` and never
// moves (Fred: "you are moving the ground instead of the grass"). The road crosses the
// grass plane's footprint though, and packed earth with
// cut stones in it cannot drift — it is the one built thing on the page, and a sliding
// road under three planted figures is worse than no motion at all. So the field carries
// the road's own geometry (kept in step with wayP/wayW in gen/plates/hands.mjs) and goes
// to zero over it, softly across ~22 units so no seam shows where the grass stops moving.
//   Amplitude climbs with nearness — still at the treeline, fullest at the reader's feet —
// which is aerial perspective in TIME, the same law the plate paints in space.
const HANDS_WAY_P = t => [400 + Math.sin(t * 2.2) * 22 * (1 - t), 338 + t * 184];
const HANDS_WAY_W = t => 52 + 566 * t * t;
const HANDS_ON_WAY = (x, y) => {
  let bd = 1e9, bt = 0;
  for (let t = 0; t <= 1.001; t += 0.04) {
    const p = HANDS_WAY_P(t);
    const d = Math.hypot(x - p[0], (y - p[1]) * 1.5);
    if (d < bd) { bd = d; bt = t; }
  }
  return Math.max(0, Math.min(1, (HANDS_WAY_W(bt) / 2 + 12 - bd) / 22));
};
// ⚠ AND IT IS A BREEZE, NOT A GALE. The first throw peaked at 2.4, which is essentially
// string's GALE grass (2.6) — and a big displacement across only four positions is a big
// JUMP between them, which is the other half of what Fred saw as blinking. A quiet field
// on a calm page wants an amplitude the eye reads as a lean, not as a step: peak 1.05, so
// even the nearest blades travel about a mark's width and the ring reads continuous.
// ⚠⚠ ALMOST ZERO, ON PURPOSE. The wind on this page is DRAWN — every grass mark is rotated
// about its own base in gen/plates/hands.mjs (see WIND/gust there) — so the plane itself must
// barely move at all. A field slides the whole sheet sideways, and a rigid slide of every
// blade at once is what read to Fred as "blinking and not moving": invisible as motion, so
// only the swap between drawings was left to see. This keeps the boil COHERENT (a field at
// any value forces per-mark phase to 0) while giving it essentially no travel of its own.
const BOIL_FIELD_HANDS_GRASS = (x, y) => (1 - HANDS_ON_WAY(x, y)) * 0.06;
// and the sky: a constant field, so it breathes as ONE sheet instead of shimmering, and
// damped — this plane is opaque and CUTS (BOIL_HARD), and a cutting plane shows its throw.
// ⚠ AND A SMALLER THROW. At 0.5 each handover moved the whole sheet far enough to read as
// a flip rather than a drift; the sky is the largest thing on the page, so its step is the
// most visible one there is. 0.22 keeps the breath and takes the jump out of it.
// ⚠ ALMOST NOTHING NOW: the sky is DRAWN per frame (see SKY_PH/skyDX in the plate), so the
// sheet must not also slide underneath its own weather. Same reasoning as the grass.
const BOIL_FIELD_HANDS_SKY = () => 0.05;
const BOIL_FIELD_PAGE = {
  // ⚠ now that the whip moves as one body it can afford a real throw — the fist barely
  // stirs (0.08) and the far end, where the child is tethered, swings 8x the base.
  string: { fg: (x, y) => Math.min(8.0, 0.08 + (Math.hypot(x - HAND.x, y - HAND.y) / 300) * 8.0), mid: BOIL_FIELD_GROUND },
  // (the flock is NOT a whip: each bird is loose in the air on its own, so it keeps the
  //  incoherent per-mark phase and is simply thrown hard — no field)
  storm:  { mid: BOIL_FIELD_STORM_GROUND },
  // ⚠ A TREE'S FOOT MUST NOT MOVE. Fred: "can you make the branch have movement... also
  // please make sure that it is always sticking to the ground." Both at once, from one
  // field: zero displacement at the shore (y>=500) rising to full at the crown, so the
  // second drawing bends the boughs and leaves the trunk's foot exactly where it stands.
  // It is the garden's grass-and-soil trick, turned on its side for a tree.
  flame:  { near: (x, y) => Math.max(0, Math.min(1, (500 - y) / 330)) * 2.4 },
  born:   { sky: BOIL_FIELD_BORN_SKY },
  hands:  { grass: BOIL_FIELD_HANDS_GRASS, bg: BOIL_FIELD_HANDS_SKY },
  // ⚠⚠ A FIELD IS NOT A VOLUME KNOB — IT CHANGES THE KIND OF MOTION. engine.mjs ~690:
  // the moment BOIL_FIELD is set, each mark's independent phase `idp` is forced to 0 and
  // the vertical component drops from 0.8 to 0.14. So a field turns the boil from an
  // INCOHERENT per-mark shimmer into a COHERENT, largely horizontal sway — which is
  // exactly why string/storm/flame have one: they are gales bending things.
  // I first set this to 0.72 expecting a 28% damping and got the opposite (low-frequency
  // change 4.99 -> 5.38, brightness swing 1.58 -> 5.44), because the whole sheet had
  // started moving as ONE body instead of shimmering in place.
  // Coherent is the right mode here — it is the conclusion born was rebuilt on — but it
  // has to be quiet, so the amplitude carries it: the sun-vortex sheet leans and returns
  // instead of boiling. `seeds`' marks are bold (len 30 / lw 6.8), so it takes little.
  seeds:  { sky1: () => 0.35 },
};

const built = [];
for (const m of modules) {
  if (only && m.name !== only) continue;
  const t0 = Date.now();
  if (!m.focal) console.warn(`${m.name}: no focal export — portrait centers on x=400`);
  engine.setBoil(BOIL_FRAME, BOIL_N, BOIL_FRAME ? BOIL_AMP : 0);
  engine.setDensity(densityFor(m.name));
  engine.setReliefLight(null);   // each plate sets its own scene light (or keeps the global rake); never inherit the last plate's
  /* ⚠ COLOUR PUNCH, PER PLATE (Fred: "the yellow is more brown, the green is more brown,
     the blue is more grey... i want the color to pop"). That is a saturation problem, and
     the engine already has the cure — `punch()` raises a colour's chroma and pulls washed
     pale tones deeper, inside `jig`, so EVERY mark gets it. It was only ever switched on
     for the ep2-4 plates; every ep1 page has been painting at ZERO, which is exactly why
     its golds go brown and its blues go grey. Per-page now, so a plate can be tuned. */
  // ⚠ PUNCH IS FOR A LIT PAGE, NOT A NIGHT ONE. At 0.55 the chroma boost took the hue
  // jitter in `turning`'s cobalt sky and pushed whole marks to green — a night sky
  // littered with olive chips. The page still wants its colour to pop where the light
  // actually falls, so it keeps a punch, at less than half the old one.
  const PUNCH_PAGE = { love: 0.60, turning: 0.24, risen: 0.34, ran: 0.3, gift: 0.18, twoways: 0.22 };   // ⚠ gift punch 0.3 -> 0.18: punch pulls pale tones DEEPER, which was working against a dawn sky   // the morning of the resurrection is VIBRANT, never pale
  // ⚠ AND THE MANIFOLD ACCENT HAS TO COME DOWN ON A NIGHT PLATE. One mark in ten flips
  // across the colour wheel (jig → MANIFOLD) — the bow hidden in every field, and on a
  // lit page it is riches. On a plate as dark as `lost` it is the opposite: the flip
  // floors its lightness at 0.14 and boosts its saturation, so on near-black ground every
  // one of those marks is the BRIGHTEST thing in the frame and the picture reads as green
  // confetti in the dark. Fewer of them there; untouched everywhere else.
  // ⚠ grave is ZERO: a complementary flip on a 15x60 sand stroke is a BLUE SLAB lying on a
  // desert floor. (And this comment is on its OWN LINE — an inline // inside a table of
  // literals eats the rest of the row, which is exactly what it just did to this one.)
  // ⚠ `risen` 0.10 (the site default) -> 0.012. The manifold flips 1 mark in N across the
  // colour wheel — riches on a dense dark field, but this page is bright, wide and
  // low-contrast, so one flipped mark in ten read as RAINBOW CONFETTI over the whole
  // plate and averaged the picture to chalk. It survives as a rarity, which is what a
  // hidden bow is supposed to be.
  const MANIFOLD_PAGE = { paid: 0.012,   /* Golgotha was on the 0.10 default — lime chips over the mourning sky */ lost: 0,   /* ⚠ 0.004 → 0 (Sep 8): with 9,000+ marks even that left lime streaks in the sky */ looking: 0.006, grave: 0, road: 0.03, turning: 0.06, risen: 0.012, ran: 0.012, gift: 0.012, twoways: 0.012, nonight: 0.014, comes: 0.016, turning: 0.014 };   // ⚠ turning 0.06 → 0.014 (Sep 8 audit): at 0.06 the night sky over the road carried green chips of complementary flip that read as litter, not stars — the one thing on the page that was not painted   // ⚠ nonight/comes were still on the 0.10 site default — the rainbow-confetti fault, magenta and violet flecks strewn through canopy, meadow and sky. Every page Fred has approved sits near 0.012.   // ⚠ twoways was on the 0.10 default — rainbow confetti over the whole homecoming   // ⚠ gift: the same rainbow-confetti cure — 1-in-10 flipped marks is noise on a bright wide page   // ⚠ the same rainbow-confetti cure as `risen`: on a bright, wide, low-contrast page 1-in-10 flipped marks IS the noise
  // ⚠ AND HOW DARK THE PAGE PAINTS. Weighted by each mark's own lightness inside `jig`, so
  // the night deepens and the home's gold stays gold. Set in BOTH passes below (the flat
  // press and the depth planes) — a knob set in only one of them is the bug that made
  // `lost` look calm as a file and come up strewn with confetti on the phone.
  // ⚠ CALIBRATE ON THE PHONE, NOT THE FILE. The live filter lifts and cools every plate,
  // so a night that looks right as a jpg comes up as dusk on the page. `grave` had to be
  // deepened by this much AFTER it already looked dark in the raster.
  const DARKEN_PAGE = { road: 0.44, grave: 0.4 };   // night plates: the complementary flip is the brightest thing on them
  // ⚠ THE FALLBACK IS THIS PAGE'S OWN, NOT A CONSTANT. 0.10 was the site default and it
  // is rainbow confetti — every page Fred approved overrides it down near 0.012. An
  // unauthored page now draws its manifold from gen/genome.mjs: the same law as every
  // other page, its own value. Authored numbers above still win, always.
  const HAND = hand(m.name);
  engine.setGenomePage(m.name);   // every tree/limb on this plate descends from the page
  // ⚠ DO NOT MOVE THE MANIFOLD DEFAULT. It looks like a pure colour knob and it is not:
  // jig() spends an EXTRA rng call on every mark it flips, so changing the manifold changes
  // how much of the plate's stream each mark consumes — and every mark after it lands
  // somewhere else. Dropping the default from 0.10 to the genome's value redrew `garden`
  // wholesale (47% of pixels), moved its flower band and swallowed its easter-egg
  // inscription. The genome may hand a NEW page its manifold; it must never restyle an old
  // one behind Fred's back. The same caution applies to any knob jig()/strokes() branch on.
  engine.setManifold(MANIFOLD_PAGE[m.name] != null ? MANIFOLD_PAGE[m.name] : 0.10);
    engine.setDarken(DARKEN_PAGE[m.name] || 0);
  engine.setColorPunch(PUNCH_PAGE[m.name] != null ? PUNCH_PAGE[m.name]
                       : (EP24.has(m.name) && !REPAINTED.has(m.name) ? 0.5 : 0));
  // ep1's pages are DIORAMAS whose back plane paints at ~1.7x brush scale — big bold
  // bodies of paint. ep2/3/4 are FLAT plates stuck at 1.0x, so their marks read small and
  // thin beside ep1. Paint them bolder so a stroke is a real body of paint, not a dash.
  engine.setBrushScale(EP24.has(m.name) ? 1.45 : 1);
  const ss = STROKE_STYLE[m.name] || { op: 0.6, r: 1 };
  engine.setStrokeOpacity(ss.op); engine.setStrokeRound(ss.r);
  engine.setBrushHand(process.env.BRUSH_HAND != null ? +process.env.BRUSH_HAND : 1);   // the loaded brush (taper, bristle, dry tail, warm/cool edges) — BRUSH_HAND=0 for the old pill
  engine.setPigment(process.env.PIGMENT != null ? +process.env.PIGMENT : 7);
  engine.setHues(process.env.HUES != null ? +process.env.HUES : 12);   // the book's limited palette — twelve hue families (Sep 15, Fred: "yes roll it out everywhere"); HUES=0 for the old free hues
  /* ⭐ TEMPERAMENT (Sep 15). Fred, on the fewer-surer-marks pilot: "thick and fine should be from the
     scene's feelings." So the brush is chosen per page by what the page IS: a gale or a grief takes
     thick, decided marks; a meadow the child kneels in, a room, a table of bread, take fine ones.
     ECONOMY=k env overrides; otherwise this table. 1 = the page's own marks untouched. */
  const TEMPERAMENT = {
    string: 2.4, storm: 2.4,                               // gales — violent, thick
    comes: 2.0, looking: 1.9, paid: 1.7, lost: 1.7,         // the heavens torn, the plain, grief, the waste — vast and decided
    beginning: 1.6, made: 1.6, love: 1.5, road: 1.5, washed: 1.5, turning: 1.4, grave: 1.4,
    ran: 1.3, risen: 1.3, bridge: 1.3, light: 1.3, together: 1.3, prayer: 1.3,
    garden: 1.2, flame: 1.2, candle: 1.2, nonight: 1.2, come: 1.2, gift: 1.1, twoways: 1.1, family: 1.1,
    born: 1.4, seeds: 1.3, bread: 1.3, hands: 1.2, word: 1.0,   // the tender pages stay fine, a little surer (Sep 15 second pilot)
  };
  engine.setEconomy(process.env.ECONOMY != null ? +process.env.ECONOMY : (TEMPERAMENT[m.name] || 1));
  /* ⭐ AFTER HIS KIND (Sep 15). Fred: "make the trees different across the whole book… showcase
     God's creations." Each page's WOOD is keyed here by the page's own scripture; hero trees
     name their species at the call site (bread's apple, hands' willows, grave's palm). A page
     not listed keeps the plain oak. Species live in engine.SPECIES, each one a tree the Bible
     names (Gen 1:12 "the tree yielding fruit… after his kind"). */
  const SPECIES_PAGE = {
    garden:  [['fig', 3], ['pomegranate', 2], ['apple', 2], ['palm', 1], ['olive', 1]],   // Gen 2:9 every tree; Gen 3:7 the fig leaves
    road:    [['olive', 3], ['fig', 2], ['pomegranate', 1], ['almond', 1]],               // Isa 55:12–13, the trees of the field along the way
    bridge:  [['cedar', 2], ['almond', 1], ['fir', 1]],                                    // the strong ones on the banks (Ps 92:12)
    love:    [['cedar', 2], ['palm', 2], ['olive', 1]],                                    // Ps 104:16 the cedars He planted; Ps 92:12
    string:  [['fig', 2], ['olive', 2]],                                                   // 1 Kings 4:25 every man under his vine and fig tree
    ran:     [['olive', 3], ['fig', 2], ['palm', 2], ['pomegranate', 1], ['oak', 2]],      // the road home through the good land (Deut 8:8)
    gift:    [['oak', 5], ['olive', 2], ['apple', 1], ['fig', 1]],                         // mostly the oak Fred loves; a few kinds among them
    twoways: [['pomegranate', 2], ['fig', 2], ['apple', 2], ['olive', 2], ['oak', 1]],     // Deut 8:8 — the Father's tended land
    born:    [['almond', 3], ['cedar', 1], ['palm', 1], ['olive', 1], ['oak', 2]],         // Isa 35:1–2 blossom; the glory of Lebanon
    seeds:   [['apple', 2], ['almond', 1], ['olive', 2], ['fig', 1], ['oak', 2]],
    bread:   [['apple', 2], ['olive', 2], ['fig', 1], ['oak', 2]],                          // Song 2:3 the apple tree, sat under
    hands:   [['willow', 4], ['oak', 2], ['olive', 1], ['sycomore', 1]],                   // Isa 44:4 willows by the water courses
    comes:   [['oak', 3], ['cedar', 2], ['fir', 2]],                                        // the dark wood under the torn heaven
    nonight: [['palm', 2], ['olive', 1], ['fig', 1], ['cedar', 1], ['apple', 1]],          // Rev 7:9 palms before the throne
  };
  engine.setSpeciesMix(process.env.SPECIES ? JSON.parse(process.env.SPECIES) : (SPECIES_PAGE[m.name] || null));
  const fx = (m.focal && m.focal.x) || 400;
  const svg = stampSig(m.paint(engine), fx, built.length, m.sig);   // sign the work — Immanuel, hidden
  engine.setDensity(1); engine.setStrokeOpacity(0.6); engine.setStrokeRound(1); engine.setManifold(0.10); engine.setColorPunch(0); engine.setDarken(0); engine.setBrushScale(1); engine.setGlowLaw(null);   // ⚠ the glow law is per-plate; never let it leak to the next one
  // ep2/3/4 render RAW (skip the heavy oil-surface tooth + grade) so their strokes
  // read soft and flowing like ep1's raw diorama planes, not a stamped brick crust.
  const rawOpt = EP24.has(m.name) ? { raw: true } : {};
  // landscape edition — skipped on a boil pass; frame 0's flat press is already correct
  let kb = 0, q = 0, pKb = 0, pQ = 0, x0 = 0;
  if (!BOIL_FRAME) {
    const png = rasterize(m.name, svg, 1600, 1000, 800, 0, m.focal, rawOpt);
    ({ kb, q } = toJpeg(m.name, png, TARGET_KB));
  }
  // portrait edition — same strokes, focal-centered 312x500 window @1000x1600
  const { svg: pSvg, x0: _x0 } = portraitSvg(svg, m.focal);
  x0 = _x0;
  if (!BOIL_FRAME) {
    const pPng = rasterize(`${m.name}-p`, pSvg, 1000, 1600, P_W, x0, m.focal, rawOpt);
    ({ kb: pKb, q: pQ } = toJpeg(`${m.name}-p`, pPng, TARGET_P_KB));
  }
  if (process.env.EDITIONS !== 'fast' && !BOIL_FRAME) {
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
    // ⚠ THE PLANES ARE A SECOND PAINTING, AND THEY MISSED THE PLATE'S OWN KNOBS. The
    // per-plate punch and manifold are set before the flat press and RESET straight
    // after it — but the depth planes are painted here, afterwards, so every plane went
    // down at the site defaults. That is why `lost` looked calm as a flat file and came
    // up on the phone strewn with neon chips: the phone never shows the flat, it shows
    // these. Any per-plate paint knob has to be set in BOTH passes or the two pictures
    // are not the same picture.
    engine.setManifold(MANIFOLD_PAGE[m.name] != null ? MANIFOLD_PAGE[m.name] : 0.10);
    engine.setDarken(DARKEN_PAGE[m.name] || 0);
    engine.setColorPunch(PUNCH_PAGE[m.name] != null ? PUNCH_PAGE[m.name]
                         : (EP24.has(m.name) && !REPAINTED.has(m.name) ? 0.5 : 0));
    engine.setDensity(densityFor(m.name));
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
      // per-layer opacity: a plate may override with {name:'hills', op:0.92} when that
      // layer holds a SOLID thing (a castle, a rock) that must not go hazy — "different
      // opacity for different things" (Fred). Default = aerial-perspective rule.
      const op = L.op != null ? L.op
        : !isLandscape ? 1
        : NEARGROUND.has(L.name) ? 0.94
        : FARHAZE.has(L.name) ? 0.6
        : 1;
      engine.setLayerOpacity(op);
      var _pb = (BOIL_BAND_PAGE[m.name] || {});
      var _nm = (BOIL_GLIMMER_NO_MOVE[m.name] || {})[L.name];
      var _bandAmp = _nm != null ? _nm
                   : _pb[L.name] != null ? _pb[L.name]
                   : (BOIL_BAND[L.name] != null ? BOIL_BAND[L.name] : 1);
      engine.setBoilField(BOIL_FRAME ? ((BOIL_FIELD_PAGE[m.name] || {})[L.name] || null) : null);
      const _ring0 = (BOIL_RING_BANDS[m.name] || []).indexOf(L.name) !== -1;
      var _fb = BOIL_FLASH_BANDS[m.name];
      var _canFlash = !_fb || _fb.indexOf(L.name) !== -1;
      engine.setBoilFlash(BOIL_FRAME && _canFlash ? ((BOIL_FLASH_PAGE[m.name] || {})[BOIL_FRAME] || 0) : 0);
      var _tn = BOIL_FRAME ? (((BOIL_TINT_PAGE[m.name] || {})[L.name] || {})[BOIL_FRAME] || null) : null;
      engine.setBoilTint(_tn ? _tn[0] : null, _tn ? _tn[1] : 0);
      var _fl = BOIL_FRAME ? ((BOIL_FLOW_PAGE[m.name] || {})[L.name] || null) : null;
      engine.setBoilFlow(_fl ? _fl[0] : 0, _fl ? _fl[1] : 0);
      // ⚠ a page with a ring can still carry TWO-drawing planes (the cover's mote shells):
      // their one extra drawing must be the HALF-phase of a 2-clock, not step 1 of the
      // ring's 8-clock, or the twinkle shrinks to a flicker. Build every frame anyway
      // (one pass writes all planes); the s*-b2..b8 files are simply deleted after.
      const _nEff = (BOIL_NONRING_N[m.name] && !_ring0) ? BOIL_NONRING_N[m.name] : BOIL_N;
      // ⭐ FLOW by plane kind (Sep 15): skies sweep, grounds comb, everything else keeps its hand
      {
        const nm = L.name;
        const skyish = /^(sky\d?|air|n\d)$/.test(nm) || (nm === 'bg' && SKY_BG.has(m.name));
        const groundish = /^(ground|land|mid|hills|far|near|front|field|grass|meadow)$/.test(nm) || (nm === 'bg' && !SKY_BG.has(m.name));
        // Fred, on the first pilot: "lighten on the sky and go more ham on the ground"
        engine.setFlow(skyish ? 1.2 : groundish ? 1.9 : 1, skyish ? 1.35 : groundish ? 2.4 : 1);
        engine.setGroundBold(groundish ? 1.45 : 1);   // and the ground's marks come THICKER too, not only longer
      }
      engine.setBoil(BOIL_FRAME, _nEff, BOIL_FRAME ? BOIL_AMP * _bandAmp : 0,
                     BOIL_FRAME ? ((BOIL_TWK_PAGE[m.name] || {})[L.name] || BOIL_TWK[L.name] || 0) : 0);
      return m.paint(engine, { layer: L.name });
    });
    engine.setBrushScale(1);
    engine.setManifold(0.10);
    engine.setColorPunch(0);
    engine.setDarken(0);
    engine.setLayerOpacity(1);
    engine.setBoilField(null);
    engine.setBoilFlow(0, 0);
    engine.setBoilFlash(0);
    engine.setBoilTint(null, 0);
    engine.setDensity(1);
    svgs[0] = stampSig(svgs[0], fx, built.length, m.sig);   // hide Immanuel on the opaque base so it shows on mobile too (same spot as the full)
    const out = [];
    bands.forEach((L, i) => {
      const opaque = L.opaque || i === 0;
      const bn = `${m.name}-${L.name}${BSUF}`;
      // ⚠ A RING'S DRAWINGS RENDER AT HALF RESOLUTION, and this is what buys the
      // animation back. Fred: "rather than being lazy, just making things blink... draw
      // several frames of the background and make things move that way." The blinking
      // was mine: I had cut rings from six drawings to three to survive the memory, and
      // halving the frame count doubles the size of every step.
      // A ring HIDES its base, so every visible drawing is half-res and none is ever
      // compared against a sharp original — the loss does not show in motion. 6.4 MB ->
      // 1.6 MB each, so SIX drawings now cost half what THREE did.
      // ⚠ But a TWO-drawing band keeps its base visible and dissolves against it; pair a
      // half-res partner with a sharp base there and the plane goes soft every time it
      // breathes. Same trick, opposite result, depending on what it is seen next to.
      const _ring = (BOIL_RING_BANDS[m.name] || []).indexOf(L.name) !== -1;
      const _half = BOIL_FRAME && _ring;
      const png = rasterize(bn, svgs[i], _half ? 800 : 1600, _half ? 500 : 1000, 800, 0, m.focal, { raw: true, transparent: !opaque });
      if (opaque) { toJpeg(bn, png, TARGET_KB); out.push(`${L.name}${BSUF}.jpg`); }
      else {
        /* ⚠ AND THE PNG GOES AWAY AGAIN IF THE WEBP WORKED. Measured Sep 6: these fallbacks
           had grown to 709 files and 305 MB — 58% of everything the site deploys — and not
           one of them was ever fetched. They exist for a browser that cannot decode WebP,
           and a browser that cannot decode WebP cannot run this book at all (it needs
           WebGL). They were pure deploy weight. The png is still written first because the
           converter reads it from disk, and it still SURVIVES if the conversion fails —
           which is the only case the fallback was ever for. */
        const _png = join(OUT, `${bn}.png`);
        copyFileSync(png, _png);
        if (toWebp(_png)) { try { unlinkSync(_png); } catch (e) { } }   // the webp is what the site serves
        out.push(`${L.name}${BSUF}.webp`);
      }
      // PORTRAIT plane press — same focal window (x0) as the flat portrait, so a
      // phone can slide the same depth planes without cropping the scene.
      if (m.portraitPlanes && !BOIL_FRAME) {
        const pSvgL = portraitSvg(svgs[i], m.focal).svg;
        const pPngL = rasterize(`${m.name}-${L.name}-p`, pSvgL, 1000, 1600, P_W, x0, m.focal, { raw: true, transparent: !opaque });
        if (opaque) toJpeg(`${m.name}-${L.name}-p`, pPngL, TARGET_P_KB);
        else copyFileSync(pPngL, join(OUT, `${m.name}-${L.name}-p.png`));
      }
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
