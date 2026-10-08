// gen/shot.mjs — screenshot book pages at a TRUE viewport.
//
// ⚠ WHY THIS EXISTS (Sep 23). `chrome --headless=new --window-size=1440,900 --screenshot` lays the
// page out at a viewport 87px SHORTER than the window (1440x813 — measured over CDP), then captures
// 900px. The CSS planes re-fit to the capture; the runtime sprites, placed by fitOf() in JS for 813,
// do not. Every sprite in every review shot sat 35 plate units too HIGH — and fixes were made
// against that (a star "above" its hole, an angel "hovering"). This sets the viewport with
// Emulation.setDeviceMetricsOverride BEFORE the page loads, so the layout and the capture agree.
//
// Run:  node gen/shot.mjs <base-url> <out-dir> <page#> [page# …] [--w=1440 --h=900 --wait=9000]
//   e.g. node gen/shot.mjs http://localhost:8899 /tmp/shots 1 3 12
import { spawn } from 'node:child_process';
import fs from 'node:fs';

const args = process.argv.slice(2);
const opt = Object.fromEntries(args.filter(a => a.startsWith('--')).map(a => { const s = a.slice(2), i = s.indexOf('='); return i < 0 ? [s, ''] : [s.slice(0, i), s.slice(i + 1)]; }));   // split at the FIRST '=' only (--q=legible=fit)
const [base, outDir, ...pages] = args.filter(a => !a.startsWith('--'));
const W = +(opt.w || 1440), H = +(opt.h || 900), WAIT = +(opt.wait || 9000);
const PORT = 9300 + Math.floor(Math.random() * 500);
const CH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
fs.mkdirSync(outDir, { recursive: true });
const prof = fs.mkdtempSync('/tmp/shot-');
const chrome = spawn(CH, ['--headless=new', '--disable-gpu', '--hide-scrollbars', `--remote-debugging-port=${PORT}`, `--user-data-dir=${prof}`, 'about:blank'], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));

let list;
for (let i = 0; i < 40 && !list; i++) { await sleep(250); try { list = await (await fetch(`http://localhost:${PORT}/json`)).json(); } catch {} }
const ws = new WebSocket(list.find(t => t.type === 'page').webSocketDebuggerUrl);
await new Promise(r => ws.onopen = r);
let id = 0;
const call = (method, params = {}) => new Promise(res => {
  const i = ++id;
  const h = e => { const m = JSON.parse(e.data); if (m.id === i) { ws.removeEventListener('message', h); res(m.result); } };
  ws.addEventListener('message', h); ws.send(JSON.stringify({ id: i, method, params }));
});
await call('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: +(opt.dpr || 1), mobile: W < 700 });
for (const k of pages) {
  await call('Page.navigate', { url: `${base}/?shot=${Date.now()}${opt.q ? '&' + opt.q : ''}#${k}` });   // --q=legible=fit adds a query
  await sleep(WAIT);
  const dims = await call('Runtime.evaluate', { expression: 'innerWidth+"x"+innerHeight', returnByValue: true });
  const shot = await call('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${outDir}/p${k}.png`, Buffer.from(shot.data, 'base64'));
  console.log(`p${k}: ${dims.result.value}`);
}
ws.close(); chrome.kill();
setTimeout(() => { try { fs.rmSync(prof, { recursive: true, force: true }); } catch {} process.exit(0); }, 800);   // chrome is still writing its profile as it dies
