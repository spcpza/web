// gen/build-held-sheep.mjs — the sheep of `string` (p8), painted once each as standalone runtime props.
//
// Oct 27 — Fred: "on string, can you make the sheep animate as if it is also thrown around in the wind? make sure it
// is smoothly looping". Painted into a plane, the six sheep could only move together (the plane's boil). So each is
// painted HERE, by the same sheep painter the plate used (wool body lit from the break in the clouds, cool lilac
// belly — never black — dark face with an ear thrown back, legs flung out), and engine/scene.js FLOCK tumbles each
// one on its own orbit and spin. Both motions are linear full turns, so every loop closes without a seam.
//
// Same pipeline as gen/build-held-apple.mjs: a straight SVG screenshot, no surface/grade pass (it sits beside the
// raw multiplane planes, which have none either).
//
// Run: node gen/build-held-sheep.mjs        Output: cast/sheep-a.webp, cast/sheep-b.webp (transparent)
import { writeFileSync, unlinkSync, mkdirSync } from 'fs';
import { execFileSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import * as E from './engine.mjs';

const DIR = dirname(fileURLToPath(import.meta.url));
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const { mulberry32, mix, ramp, jig, strokes, paintPath, R1 } = E;
E.setManifold(0); E.setTonalShadow && E.setTonalShadow(true);

// the light falls from the upper left, as it does on the page (the break in the clouds at plate 138,84)
const LX = -60, LY = -60;
function sheep(out, counter, RS, s, face) {
  const sx = 0, sy = 0, P = (u, v) => [sx + u * s, sy + v * s];
  for (let k = 0; k < 3; k++) {   // a few wisps of wool, torn off behind (they turn with the sheep, as torn wool does)
    const [ax, ay] = P(-face * (6 + RS() * 4), (RS() - 0.5) * 6), L = (4 + RS() * 6) * s;
    paintPath(out, counter, RS, [[ax, ay], [ax - face * L * 0.5, ay - 1.5 * s], [ax - face * L, ay + (RS() - 0.5) * 3 * s]],
      (x, y, r) => jig(mix('#e6e0cc', '#b8b4c8', r()), r, 5), { lw: (0.6 + RS() * 0.5) * s, len: 3, density: 0.9, jitter: 0.3 });
  }
  for (const [lu, lv, kick] of [[-6.5, 3, -0.9], [-2.5, 4, -0.3], [2.5, 4, 0.4], [6.5, 3, 1.0]]) {   // legs flung out
    const [a0, b0] = P(lu, lv), [a1, b1] = P(lu + kick * 4, lv + 7.5);
    paintPath(out, counter, RS, [[a0, b0], [(a0 + a1) / 2, (b0 + b1) / 2], [a1, b1]], (x, y, r) => jig('#2b2340', r, 4), { lw: 1.5 * s, len: 2.5, density: 1.1, jitter: 0.2 });
  }
  strokes(out, counter, {   // the wool body — curled marks, lit toward the light, lilac-grey belly
    rng: RS, n: Math.round(70 * s * s + 20),
    sample: r => { const a = r() * Math.PI * 2, d = Math.sqrt(r()); return P(Math.cos(a) * 11 * d, Math.sin(a) * 6.5 * d); },
    dir: (x, y) => Math.atan2(y - sy, x - sx) + Math.PI / 2 + 0.6,
    col: (x, y, r) => {
      const dx = x - sx, dy = y - sy, dl = Math.hypot(LX, LY);
      const lit = Math.max(0, Math.min(1, 0.5 + ((dx * LX + dy * LY) / dl) / (11 * s) * 0.6));
      return jig(ramp(['#8f87a8', '#b9b2c4', '#e2dccb', '#f6f1e2'], lit * 0.75 + r() * 0.25), r, 5);
    },
    len: 3.2 * s, lw: 2.1 * s, steps: 2, follow: 0.9, lenJ: 0.4, relief: 0.2,
  });
  const [hx, hy] = P(face * 12, -2), [ex, ey] = P(face * 9.5, -5.5);   // the face — dark, with an ear thrown back
  strokes(out, counter, { rng: RS, n: Math.round(14 * s + 6), sample: r => { const a = r() * 6.283, d = Math.sqrt(r()); return [hx + Math.cos(a) * 3.6 * s * d, hy + Math.sin(a) * 2.8 * s * d]; },
    dir: () => 0, col: (x, y, r) => jig(mix('#2a2238', '#4a3c4c', r()), r, 4), len: 2.2 * s, lw: 1.6 * s, steps: 1, relief: 0 });
  paintPath(out, counter, RS, [[ex, ey], P(face * 6.5, -8.5)], (x, y, r) => jig('#3a2f44', r, 4), { lw: 1.4 * s, len: 2, density: 1, jitter: 0.2 });
  const [ix, iy] = P(face * 13.2, -2.8); out.push(`<circle cx="${R1(ix)}" cy="${R1(iy)}" r="${R1(0.55 * s)}" fill="#f2e6c8"/>`); counter.n++;
}

const S = 2;                          // the plate's own size class; scene.js scales each one
const half = 22 * S;                  // the drawing reaches ~19s from its centre (legs, wisps)
const PX = 6;                         // px per unit — crisp on a retina phone at the sizes FLOCK uses
for (const [name, face, seed] of [['a', 1, 5303], ['b', -1, 7411]]) {
  const out = [], counter = { n: 0 };
  sheep(out, counter, mulberry32(seed), S, face);
  const svg = `<svg viewBox="${-half} ${-half} ${half * 2} ${half * 2}" xmlns="http://www.w3.org/2000/svg">${out.join('')}</svg>`;
  const W = Math.round(half * 2 * PX);
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;padding:0;width:${W}px;height:${W}px;overflow:hidden;background:transparent}svg{display:block;width:${W}px;height:${W}px}</style></head><body>${svg}</body></html>`;
  const tmpHtml = join('/tmp', `vg-sheep-${name}.html`), tmpPng = join('/tmp', `vg-sheep-${name}.png`);
  writeFileSync(tmpHtml, html);
  // ⚠ a window TALLER than the art: old headless lays the page out ~87px shorter than --window-size (gen/shot.mjs)
  execFileSync(CHROME, ['--headless', '--disable-gpu', `--screenshot=${tmpPng}`, '--virtual-time-budget=20000', `--window-size=${W},${W + 200}`,
    '--hide-scrollbars', '--force-device-scale-factor=1', '--default-background-color=00000000', pathToFileURL(tmpHtml).href], { stdio: 'pipe' });
  const dst = join(DIR, '..', 'cast', `sheep-${name}.webp`);
  mkdirSync(dirname(dst), { recursive: true });
  execFileSync('python3', ['-c', 'import sys;from PIL import Image;im=Image.open(sys.argv[1]).convert("RGBA").crop((0,0,int(sys.argv[3]),int(sys.argv[3])));im.save(sys.argv[2],"WEBP",quality=90,method=6)', tmpPng, dst, String(W)]);
  unlinkSync(tmpHtml); unlinkSync(tmpPng);
  console.log(`cast/sheep-${name}.webp — ${counter.n} marks, ${W}x${W}px`);
}
