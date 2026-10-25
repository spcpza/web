// gen/repaint/repaint.mjs — repaint a page's planes with the refined brush (Oct 25; see repaint.html for why).
//
//   node gen/repaint/repaint.mjs <page> [--out=DIR] [--planes=sky,mid] [--scale=.7] [--dens=1] [--bamp=1.4]
//        [--vivid=1] [--impasto=1] [--frames=0]   (--frames=0: the still planes only, for a quick look)
//
// ⚠ It ALWAYS reads the page's ORIGINAL planes from attic/pre-repaint/<page>/ (copied there the first time), never
// the repainted ones in plates-vg/, so running it again re-does the repaint instead of painting on top of itself.
// After `node gen/build.mjs <page>` rebuilds a plate, delete attic/pre-repaint/<page>/ and repaint again.
// Without --out it writes straight into plates-vg/ (same names and formats); with --out it writes PNGs there.
import { spawn, execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url)), ROOT = path.resolve(HERE, '../..'), PV = path.join(ROOT, 'plates-vg');
const args = process.argv.slice(2);
const opt = Object.fromEntries(args.filter(a => a.startsWith('--')).map(a => { const s = a.slice(2), i = s.indexOf('='); return i < 0 ? [s, '1'] : [s.slice(0, i), s.slice(i + 1)]; }));
const [page] = args.filter(a => !a.startsWith('--'));
if (!page) { console.log('usage: node gen/repaint/repaint.mjs <page> [--out=DIR] [--planes=a,b] [--frames=0]'); process.exit(2); }
const sleep = ms => new Promise(r => setTimeout(r, ms));

// the page's planes, back → front, as index.html stacks them
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const sec = [...html.matchAll(/<section class="page[^"]*"([^>]*)>\s*<picture><img[^>]*src="\/plates-vg\/([a-z0-9-]+)\.jpg/g)].find(m => m[2] === page);
if (!sec) throw new Error('no page ' + page);
const all = (sec[1].match(/data-layers="([^"]*)"/) || [, ''])[1].split(',').filter(Boolean).map(s => s.split('@')[0]);
const planes = opt.planes ? opt.planes.split(',') : all;

// keep the originals; always paint from them
const ORIG = path.join(ROOT, 'attic', 'pre-repaint', page);
if (!fs.existsSync(ORIG)) {
  fs.mkdirSync(ORIG, { recursive: true });
  for (const f of fs.readdirSync(PV)) if (new RegExp(`^${page}-(${all.join('|')})(-b\\d+)?\\.(jpg|webp|png)$`).test(f)) fs.copyFileSync(path.join(PV, f), path.join(ORIG, f));
  console.log('originals kept in', path.relative(ROOT, ORIG));
}
const origOf = (pl, fr) => ['jpg', 'webp', 'png'].map(e => path.join(ORIG, `${page}-${pl}${fr ? '-b' + fr : ''}.${e}`)).find(f => fs.existsSync(f));

// the flow map, from the composite of the ORIGINAL planes
const TMP = fs.mkdtempSync('/tmp/repaint-'), flow = path.join(TMP, 'flow.png');
const flowSrc = path.join(TMP, 'pv'); fs.mkdirSync(flowSrc);
for (const pl of all) { const f = origOf(pl, 0); if (f) fs.copyFileSync(f, path.join(flowSrc, path.basename(f))); }
execFileSync('python3', [path.join(HERE, 'flow.py'), page, flow, ...all], { stdio: 'inherit', env: { ...process.env, FLOW_DIR: flowSrc } });

const outDir = opt.out ? path.resolve(opt.out) : null;
if (outDir) fs.mkdirSync(outDir, { recursive: true });
const CH = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 9100 + Math.floor(Math.random() * 400), prof = fs.mkdtempSync('/tmp/rp-');
const chrome = spawn(CH, ['--headless=new', '--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist', '--allow-file-access-from-files', `--remote-debugging-port=${PORT}`, `--user-data-dir=${prof}`, 'about:blank'], { stdio: 'ignore' });
let list; for (let i = 0; i < 60 && !list; i++) { await sleep(250); try { list = await (await fetch(`http://localhost:${PORT}/json`)).json(); } catch {} }
const ws = new WebSocket(list.find(t => t.type === 'page').webSocketDebuggerUrl); await new Promise(r => ws.onopen = r);
let id = 0; const call = (m, p = {}, ms = 180000) => new Promise(res => { const i = ++id; const t = setTimeout(() => { ws.removeEventListener('message', h); res({ result: { exceptionDetails: { text: 'timeout ' + m } } }); }, ms);
  const h = e => { const d = JSON.parse(e.data); if (d.id === i) { clearTimeout(t); ws.removeEventListener('message', h); res(d); } }; ws.addEventListener('message', h); ws.send(JSON.stringify({ id: i, method: m, params: p })); });
ws.addEventListener('message', e => { const m = JSON.parse(e.data);
  if (m.method === 'Runtime.exceptionThrown') console.log('  page exception:', m.params.exceptionDetails.exception?.description?.split('\n')[0]);
  if (m.method === 'Runtime.consoleAPICalled') console.log('  page:', m.params.args.map(a => a.value ?? a.description).join(' ').slice(0, 300)); });
await call('Runtime.enable');
await call('Page.navigate', { url: 'file://' + path.join(HERE, 'repaint.html') });
for (let i = 0; i < 40; i++) { await sleep(200); const r = await call('Runtime.evaluate', { expression: 'window.ready === true', returnByValue: true }); if (r.result?.result?.value) break; }

// ⭐ OPEN AIR vs THINGS (Oct 25). A sky plane is open air: strokes cross the soft edges of its old swatches freely,
// which is what turns translucent cellophane into paint. Every other plane holds THINGS a child must name (a grape,
// a post, a tree, a roof) — there a stroke ends at the contour, so the form keeps its shape and gains its brushwork.
const AIR = /^(sky|air|glim|veil|shaft|bg)/;
const edgesFor = pl => AIR.test(pl) ? { edge: +(opt.airedge || .55), edgefree: +(opt.airedge || .55) } : { edge: +(opt.edge || .2), edgefree: +(opt.edge || .2) };
// the opaque back plane: the SAME quality ladder gen/build.mjs uses (cjpeg, ≤ 180 KB), so the page's weight budget holds
function toJpeg(png, dst, targetKb = 180) {
  const tga = png.replace(/\.png$/, '.tga');
  execFileSync('sips', ['-s', 'format', 'tga', png, '--out', tga], { stdio: 'pipe' });
  for (const q of [80, 72, 65, 55, 48, 40, 36]) {
    execFileSync('cjpeg', ['-quality', String(q), '-progressive', '-optimize', '-outfile', dst, tga], { stdio: 'pipe' });
    if (fs.statSync(dst).size / 1024 <= targetKb) return q;
  }
  return 36;
}
const nFrames = pl => { let n = 0; while (origOf(pl, n + 1)) n++; return n; };
for (const pl of planes) {
  const NB = nFrames(pl), frames = opt.frames === '0' ? [0] : [0, ...Array.from({ length: NB }, (_, i) => i + 1)];
  for (const fr of frames) {
    const src = origOf(pl, fr); if (!src) continue;
    // a .jpg plane is opaque; the PNG round-trip handles both kinds
    // bamp 0: the strokes stay put and take each boil frame's colour — the page's own wind still moves them (bamp>0 tripled the sky's motion)
    const o = { plane: 'file://' + src, flow: 'file://' + flow, frame: fr, nb: NB + 1, seed: 7 + all.indexOf(pl) * 101,
      scale: +(opt.scale || .5), keep: opt.keep == null ? .7 : +opt.keep, ...edgesFor(pl), dens: +(opt.dens || 1), bamp: +(opt.bamp || 0), vivid: +(opt.vivid || 1), impasto: +(opt.impasto || 1) };
    // the PNG comes back in 1 MB pieces: one 5 MB CDP message stalls Node's WebSocket
    const r = await call('Runtime.evaluate', { expression: `repaint(${JSON.stringify(o)}).then(x => (window.__url = x.url, [x.strokes, x.url.length]))`, awaitPromise: true, returnByValue: true });
    if (r.result?.exceptionDetails || !r.result?.result?.value) { console.log(pl, fr, 'FAILED', JSON.stringify(r.result?.exceptionDetails || r).slice(0, 400)); continue; }
    const [strokes, n] = r.result.result.value; let url = '';
    for (let k = 0; k < n; k += 1e6) url += (await call('Runtime.evaluate', { expression: `window.__url.slice(${k}, ${k + 1e6})`, returnByValue: true })).result.result.value;
    const png = path.join(TMP, `${pl}-${fr}.png`); fs.writeFileSync(png, Buffer.from(url.split(',')[1], 'base64'));
    const name = `${page}-${pl}${fr ? '-b' + fr : ''}`, ext = path.extname(src);
    if (outDir) fs.copyFileSync(png, path.join(outDir, name + '.png'));
    else if (ext === '.jpg') toJpeg(png, path.join(PV, name + ext));
    else execFileSync('python3', ['-c', 'import sys;from PIL import Image;Image.open(sys.argv[1]).save(sys.argv[2],"WEBP",quality=95,method=6)', png, path.join(PV, name + ext)]);
    console.log(`${name}${ext}  ${strokes} strokes`);
  }
}
ws.close(); chrome.kill('SIGKILL');
setTimeout(() => { for (const d of [TMP, prof]) try { fs.rmSync(d, { recursive: true, force: true }); } catch {} process.exit(0); }, 500);
