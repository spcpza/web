// gen/tree-lab.mjs — paint a row of the book's trees on a plain meadow and rasterize it, so a change to the tree
// painter (gen/engine.mjs paintTree / paintTrunk / limbs) can be judged in seconds instead of a page rebuild.
// Oct 25 (Fred: "the tree trunk could be better. do multiple revisions until you think it is beautiful").
//   node gen/tree-lab.mjs <out.png> [--scale=2]
import * as E from './engine.mjs';
import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const out = process.argv[2] || '/tmp/tree-lab.png';
const SC = +((process.argv.find(a => a.startsWith('--scale=')) || '--scale=2').split('=')[1]);
E.setManifold(0); E.setWild && E.setWild(false);
const W = 800, H = 500, o = [], c = { n: 0 };
const light = E.lightRadial(620, 40, 520);
o.push(`<rect width="${W}" height="${H}" fill="#9fc2e6"/>`);
o.push(`<rect y="300" width="${W}" height="200" fill="#5a8a3e"/>`);
E.strokes(o, c, { rng: E.mulberry32(5), n: 5000, sample: E.rej(0, 296, 800, 500, () => true), dir: () => -Math.PI / 2 + (Math.random() - 0.5) * 0.6,
  col: (x, y, r) => E.jig(E.ramp(['#3d6a2c', '#5a8a3e', '#7aa84c', '#9cc060'], r() * 0.7 + light(x, y) * 0.3), r, 8), len: 6, lw: 1.6, steps: 2, relief: 0.3 });
const T = [['oak', 120, 480, 300], ['olive', 330, 470, 150], ['apple', 520, 470, 170], ['fig', 700, 470, 150], ['oak', 250, 360, 70], ['pomegranate', 600, 350, 60], ['palm', 450, 420, 200]];
T.sort((a, b) => a[2] - b[2]);
for (const [sp, x, y, h] of T) E.paintTree(o, c, E.mulberry32(x * 7 + y), x, y, h, { species: sp, lightFn: light, shadowDir: -1, blossom: 0 });
const svg = E.svgWrap('tree lab', o.join('\n'), { undercoat: 0, weave: 0, varnish: 0, oil: 0 });
const w = W * SC, h = H * SC;
const html = `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;width:${w}px;height:${h}px;overflow:hidden}svg{display:block;width:${w}px;height:${h}px}</style></head><body>${svg}</body></html>`;
writeFileSync('/tmp/tree-lab.html', html);
execFileSync('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', ['--headless', '--disable-gpu', `--screenshot=${out}`, `--window-size=${w},${h}`, '--hide-scrollbars', '--force-device-scale-factor=1', '--virtual-time-budget=20000', 'file:///tmp/tree-lab.html'], { stdio: 'pipe' });
execFileSync('python3', ['-c', `from PIL import Image; im=Image.open('${out}'); im.crop((0,int(im.height*0.30),im.width,im.height)).save('${out}')`]);
console.log(out, c.n, 'marks');
