// gen/build-father-arm.mjs — REPLACES build-held-hand.mjs's small mitt with a
// full draped ARM (upper arm → forearm → hand), rendered as a front-layer prop
// over the carried child (twoways, page 17).
//
// ⚠ WHY THIS EXISTS. Fred: "make the kid in front of the father, so that the
// back of the kid is covered by the body of the father." The Father is baked
// into the plate; the child is a runtime sprite composited AFTER the whole
// plate — always on top. The only way to get any part of "Father" in front of
// the child is a new front-layer piece (this page can't use the CUTOUTS
// system — multiplane pages skip it, see engine/scene.js buildLayer).
//
// ⚠ THE FIRST DRAFT (a small closed "mitt", ~52px on screen) FAILED — Fred:
// "what is that... this is not working". A fist-sized blob can never read as
// contact no matter how precisely it's placed; it just reads as a stray gold
// leaf near his hood. This version is a full limb — upper arm, forearm, and
// hand as three capsules built with gen/engine.mjs's own personCaps/paintFigure
// primitives (the SAME capsule technique the Father's baked body is built
// from), so the piece is unmistakably an ARM, at a scale that actually spans
// his shoulder to his mid-back.
//
// Run: node gen/build-father-arm.mjs
// Output: cast/father-arm.png + .webp
import { writeFileSync, mkdirSync } from 'fs';
import { execFileSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { mulberry32, mix, ramp, jig, strokes, R1, underpaintCapsules, paintFigure } from './engine.mjs';

const DIR = dirname(fileURLToPath(import.meta.url));
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const rng = mulberry32(423);
const out = [];
const counter = { n: 0 };

const BODY = ['#8a6a22', '#c39a3c', '#efd07a', '#fdf0c2', '#fffdf2'];
const CONTOUR = '#2a1608';

// Three capsules: shoulder → elbow (upper arm), elbow → wrist (forearm),
// wrist → fingertip (hand mass, short + a hair wider for a resting palm).
// Local coords: shoulder at origin, arm bends across and down (as if reaching
// over the child's shoulder from behind and resting flat on his back).
const S = { x: 0, y: 0 };
const E = { x: -34, y: 46 };   // elbow — bends left and down
const W = { x: -14, y: 92 };   // wrist
const H = { x: -6, y: 118 };   // fingertip end (short capsule = the hand mass)

const caps = [
  { ax: S.x, ay: S.y, bx: E.x, by: E.y, r: 15 },   // upper arm
  { ax: E.x, ay: E.y, bx: W.x, by: W.y, r: 11.5 },  // forearm
  { ax: W.x, ay: W.y, bx: H.x, by: H.y, r: 13 },    // hand/palm
];

// dark contour first — a hair larger, behind everything
underpaintCapsules(out, counter, caps.map(c => ({ ...c, r: c.r + 3 })), CONTOUR);
// solid gold underpaint — guarantees opacity regardless of stroke coverage
underpaintCapsules(out, counter, caps, '#c39a3c');
// painterly texture on top, crown-lit toward the upper-left (matches the
// Father's own light direction elsewhere on this page)
paintFigure(out, counter, rng, caps, (x, y, r) => jig(ramp(BODY, 0.3 + (-x - y) / 260 * 0.4 + r() * 0.35), r, 8), 1.3, 1, 1, 1);
// a soft bright highlight along the top edge of each capsule (crown-lit)
strokes(out, counter, {
  rng, n: 90,
  sample: r => {
    const c = caps[Math.floor(r() * caps.length)];
    const t = r();
    const x = c.ax + (c.bx - c.ax) * t, y = c.ay + (c.by - c.ay) * t;
    const nx = -(c.by - c.ay), ny = (c.bx - c.ax);
    const nl = Math.hypot(nx, ny) || 1;
    const d = (r() - 0.5) * c.r * 1.3;
    return [x + (nx / nl) * d - c.r * 0.25, y + (ny / nl) * d - c.r * 0.25];
  },
  dir: () => 0, col: (x, y, r) => jig(mix('#fdf0c2', '#fffdf2', r()), r, 5),
  len: 3, lw: 1.6, steps: 1, relief: 0, op: 0.6,
});

const vbX0 = -70, vbY0 = -22, vbW = 110, vbH = 148;
const svg = `<svg viewBox="${vbX0} ${vbY0} ${vbW} ${vbH}" xmlns="http://www.w3.org/2000/svg">${out.join('')}</svg>`;

const PX_PER_UNIT = 6;
const W_ = Math.round(vbW * PX_PER_UNIT), H_ = Math.round(vbH * PX_PER_UNIT);
const html = `<!doctype html><html><head><meta charset="utf-8"><style>
html,body{margin:0;padding:0;width:${W_}px;height:${H_}px;overflow:hidden;background:transparent}
svg{display:block;width:${W_}px;height:${H_}px}
</style></head><body>${svg}</body></html>`;
mkdirSync('/tmp', { recursive: true });
const tmpHtml = join('/tmp', 'vg-father-arm.html');
const tmpPng = join('/tmp', 'vg-father-arm.png');
writeFileSync(tmpHtml, html);
execFileSync(CHROME, ['--headless', '--disable-gpu', '--enable-unsafe-swiftshader',
  `--screenshot=${tmpPng}`, '--virtual-time-budget=60000', `--window-size=${W_},${H_}`,
  '--hide-scrollbars', '--force-device-scale-factor=1', '--default-background-color=00000000',
  pathToFileURL(tmpHtml).href], { stdio: 'pipe' });

const dstDir = join(DIR, '..', 'cast');
mkdirSync(dstDir, { recursive: true });
const dstPng = join(dstDir, 'father-arm.png');
execFileSync('cp', [tmpPng, dstPng]);
try {
  execFileSync('python3', ['-c',
    'import sys;from PIL import Image;Image.open(sys.argv[1]).convert("RGBA").save(sys.argv[2],"WEBP",quality=95,method=6)',
    dstPng, join(dstDir, 'father-arm.webp')], { stdio: 'pipe' });
} catch (e) { console.warn('  ! webp conversion failed — the .png still ships'); }
console.log(`cast/father-arm.png (+webp) written — ${counter.n} marks, ${W_}x${H_}px, viewBox ${vbW}x${vbH} (aspect h/w=${(vbH / vbW).toFixed(3)})`);
