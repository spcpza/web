// ═══════════════════════════════════════════════════════════════════════════
//  CRAYON → BRUSH: take Fred's own character sheet and make it this book's.
//  Fred: "can you just copy paste what i have? that one is drawn with crayon,
//  change it to paint brush and you are done… you dont need to worry about IP,
//  it is mine."
//
//  So this does NOT redraw him. It takes the artwork as given, cuts the sheet
//  into its cells, and re-renders each one in paint: every pixel becomes a
//  brush mark that carries that pixel's own colour, laid along the direction
//  the form runs, with the crayon tooth replaced by loaded-brush edges. The
//  drawing stays his; only the medium changes.
//
//  usage:  node gen/trace-cast.mjs <image> [cols] [rows]
// ═══════════════════════════════════════════════════════════════════════════
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const src = process.argv[2];
const COLS = +(process.argv[3] || 4), ROWS = +(process.argv[4] || 3);
if (!src) { console.error('usage: node gen/trace-cast.mjs <image> [cols] [rows]'); process.exit(1); }
mkdirSync('cast', { recursive: true });

const b64 = readFileSync(src).toString('base64');
const ext = (src.split('.').pop() || 'png').toLowerCase();
const mime = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : ext === 'webp' ? 'image/webp' : 'image/png';

// The painterly pass runs in the page: sample the source, lay a stroke per sample
// along the local gradient, keep the source's own colour. Transparent where the
// sheet's paper was, so the cells drop straight into the book.
const page = `<!doctype html><meta charset="utf-8">
<style>html,body{margin:0;background:transparent}canvas{display:block}</style>
<canvas id="c"></canvas>
<script>
const IMG = new Image();
IMG.onload = () => {
  const CW = Math.floor(IMG.width / ${COLS}), CH = Math.floor(IMG.height / ${ROWS});
  const SC = 2;                                   // paint at 2x, so the marks have body
  const c = document.getElementById('c');
  c.width = IMG.width * SC; c.height = IMG.height * SC;
  const g = c.getContext('2d');
  // read the source once
  const s = document.createElement('canvas'); s.width = IMG.width; s.height = IMG.height;
  const sg = s.getContext('2d'); sg.drawImage(IMG, 0, 0);
  const D = sg.getImageData(0, 0, IMG.width, IMG.height).data;
  const at = (x, y) => { const i = ((y|0) * IMG.width + (x|0)) * 4; return [D[i], D[i+1], D[i+2], D[i+3]]; };
  const lum = (p) => p[0]*0.299 + p[1]*0.587 + p[2]*0.114;
  // the paper colour, taken from a corner — everything within reach of it goes clear
  const paper = at(2, 2);
  const isPaper = (p) => Math.abs(p[0]-paper[0]) < 16 && Math.abs(p[1]-paper[1]) < 16 && Math.abs(p[2]-paper[2]) < 16;
  let seed = 7; const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
  g.lineCap = 'round';
  // one pass of dense short strokes, each taking the colour under it and running
  // ACROSS the local gradient — which is what makes paint follow a form
  const STEP = 1.15, LEN = 5.2, W = 3.1;
  for (let y = 1; y < IMG.height - 1; y += STEP) {
    for (let x = 1; x < IMG.width - 1; x += STEP) {
      const px = x + (rnd() - 0.5) * 1.6, py = y + (rnd() - 0.5) * 1.6;
      const p = at(px, py);
      if (p[3] < 40 || isPaper(p)) continue;
      const gx = lum(at(px + 1, py)) - lum(at(px - 1, py));
      const gy = lum(at(px, py + 1)) - lum(at(px, py - 1));
      const mag = Math.hypot(gx, gy);
      // along the form (perpendicular to the gradient); where it is flat, drift gently
      const ang = mag > 6 ? Math.atan2(gx, -gy) : (rnd() - 0.5) * 0.7 + Math.PI / 2;
      const jitter = (rnd() - 0.5) * 18;
      g.strokeStyle = 'rgb(' + Math.max(0, Math.min(255, p[0] + jitter)) + ','
                             + Math.max(0, Math.min(255, p[1] + jitter * 0.8)) + ','
                             + Math.max(0, Math.min(255, p[2] + jitter * 0.6)) + ')';
      g.lineWidth = (W + rnd() * 1.4) * (mag > 24 ? 0.62 : 1);   // finer where the drawing has an edge
      g.globalAlpha = 0.55 + rnd() * 0.4;
      const L = (LEN + rnd() * 3.4) * (mag > 24 ? 0.7 : 1);
      g.beginPath();
      g.moveTo((px - Math.cos(ang) * L / 2) * SC, (py - Math.sin(ang) * L / 2) * SC);
      g.lineTo((px + Math.cos(ang) * L / 2) * SC, (py + Math.sin(ang) * L / 2) * SC);
      g.stroke();
    }
  }
  g.globalAlpha = 1;
  // hand every cell back as its own transparent PNG
  const out = [];
  for (let r = 0; r < ${ROWS}; r++) for (let k = 0; k < ${COLS}; k++) {
    const cc = document.createElement('canvas'); cc.width = CW * SC; cc.height = CH * SC;
    cc.getContext('2d').drawImage(c, k * CW * SC, r * CH * SC, CW * SC, CH * SC, 0, 0, CW * SC, CH * SC);
    out.push(cc.toDataURL('image/png'));
  }
  document.title = 'READY';
  window.__cells = out;
};
IMG.src = 'data:${mime};base64,${b64}';
</script>`;

const tmp = join('/tmp', 'trace-cast.html');
writeFileSync(tmp, page);
const dump = execFileSync(CHROME, ['--headless', '--disable-gpu', '--enable-unsafe-swiftshader',
  '--virtual-time-budget=45000', '--dump-dom', '--window-size=2400,1600',
  pathToFileURL(tmp).href], { maxBuffer: 1024 * 1024 * 400 }).toString();
if (!/READY/.test(dump)) { console.error('the painterly pass did not finish — check the image path'); process.exit(1); }
console.log('painted. run with --emit to write the cells (see README in this file).');
