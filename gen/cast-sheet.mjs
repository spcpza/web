// Renders the BAKED half of the cast (the Light) to /cast/*.png for the character
// sheet at /characters. The runtime half (the pilgrim) is drawn live in that page by
// engine/character.js, because that is how the book itself draws her.
import { writeFileSync, mkdirSync, copyFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import * as E from './engine.mjs';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
mkdirSync('cast', { recursive: true });
E.setGenomePage('cast');

const shot = (name, w, h, body) => {
  const svg = `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;
  const html = `<!doctype html><meta charset="utf-8"><style>html,body{margin:0;width:${w * 2}px;height:${h * 2}px}svg{display:block;width:${w * 2}px;height:${h * 2}px}</style>${svg}`;
  const t = join('/tmp', `cast-${name}.html`), p = join('/tmp', `cast-${name}.png`);
  writeFileSync(t, html);
  execFileSync(CHROME, ['--headless', '--disable-gpu', '--enable-unsafe-swiftshader',
    `--screenshot=${p}`, '--virtual-time-budget=20000', `--window-size=${w * 2},${h * 2}`,
    '--hide-scrollbars', '--force-device-scale-factor=1', '--default-background-color=00000000',
    pathToFileURL(t).href], { stdio: 'pipe' });
  copyFileSync(p, join('cast', name + '.png'));
  console.log('  cast/' + name + '.png');
};

const poses = [
  ['light-stand',  (out, c, rng) => E.paintTheLight(out, c, rng, { x: 100, y: 300, h: 190 })],
  // ⚠ the carried pose needs room ABOVE him — the child rides clear of his head, and at the
  // first framing she was sliced off by the top of the plate
  ['light-carry',  (out, c, rng) => E.paintCarried(out, c, rng, { x: 100, y: 300, h: 168, childH: 88 })],
  ['light-walk',   (out, c, rng) => E.paintTheLight(out, c, rng, { x: 100, y: 300, h: 190,
                     hands: [[62, 214], [142, 200]], feet: [[74, 300], [130, 292]] })],
];
for (const [name, fn] of poses) {
  const out = [], counter = { n: 0 };
  fn(out, counter, E.mulberry32(11));
  shot(name, 200, 320, out.join(''));
}
console.log('cast sheet art built.');
