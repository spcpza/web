// gen/readthrough.mjs — the WHOLE-BOOK CHECK: every page in order, at a true viewport, in one browser.
// For each page: a screenshot, every console error / uncaught exception, and every request that came back
// 4xx/5xx (from Resource Timing, so not data:/blob: — those never fail by status). Waits for the story card to finish writing, so the shot is what a reader sees once it settles.
// Every CDP call has its own timeout — headless Chrome sometimes stops answering mid-run (it stalls at 1440
// wide / DPR 3 with many pages); a stalled page is logged and skipped, never hangs the run.
//
// Run:  node gen/readthrough.mjs <base-url> <out-dir> [--w=390 --h=844 --dpr=2 --wait=8000 --pages=1-33 --chrome=PATH]
//   e.g. node gen/readthrough.mjs https://balthazar.sh /tmp/rt-phone
//        node gen/readthrough.mjs https://balthazar.sh /tmp/rt-desk --w=1280 --h=800 --dpr=1
//        CHROME_PATH=/usr/bin/chromium node gen/readthrough.mjs https://balthazar.sh /tmp/rt-phone   (Linux)
//        node --experimental-websocket gen/readthrough.mjs https://balthazar.sh /tmp/rt-phone       (Node 20/21)
// Writes p<N>.png per page and report.json; prints one line per page.  --help prints usage.
//
// Needs: Node 22+ (global WebSocket), or Node 20/21 run with --experimental-websocket.
// Browser: --chrome=PATH, else $CHROME_PATH, else the first that exists of the usual macOS / Linux installs
// (Google Chrome, Chromium) and google-chrome / chromium on $PATH. Running as root on Linux adds --no-sandbox.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const opt = Object.fromEntries(args.filter(a => a.startsWith('--')).map(a => { const s = a.slice(2), i = s.indexOf('='); return i < 0 ? [s, ''] : [s.slice(0, i), s.slice(i + 1)]; }));
const [base, outDir] = args.filter(a => !a.startsWith('--'));
const USAGE = `usage: node gen/readthrough.mjs <base-url> <out-dir> [--w=390 --h=844 --dpr=2 --wait=8000 --pages=1-33 --chrome=PATH]
  browser: --chrome=PATH, else $CHROME_PATH, else the usual macOS / Linux Chrome or Chromium installs
  needs Node 22+, or Node 20/21 with --experimental-websocket`;
if ('help' in opt) { console.log(USAGE); process.exit(0); }
if (!base || !outDir) { console.error(USAGE); process.exit(2); }
const die = msg => { console.error(`readthrough: ${msg}`); process.exit(1); };
// CDP talks over the global WebSocket: built in from Node 22, behind a flag on Node 20/21 — say so instead of a bare ReferenceError
if (typeof globalThis.WebSocket !== 'function') die(`Node ${process.versions.node} has no global WebSocket.\n  Use Node 22+, or on Node 20/21 run:  node --experimental-websocket gen/readthrough.mjs ${args.join(' ')}`);
function findChrome() {
  const given = opt.chrome || process.env.CHROME_PATH;
  if (given) { if (!fs.existsSync(given)) die(`browser not found at ${given} (from ${opt.chrome ? '--chrome' : '$CHROME_PATH'})`); return given; }
  const known = ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/usr/bin/google-chrome-stable', '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser', '/snap/bin/chromium',
    '/opt/google/chrome/chrome'];
  const names = ['google-chrome-stable', 'google-chrome', 'chromium', 'chromium-browser', 'chrome'];
  const onPath = (process.env.PATH || '').split(path.delimiter).filter(Boolean).flatMap(d => names.map(n => path.join(d, n)));
  const hit = [...known, ...onPath].find(p => { try { return fs.statSync(p).isFile(); } catch { return false; } });
  if (!hit) die(`no Chrome/Chromium found. Pass --chrome=/path/to/chrome or set CHROME_PATH.\n  looked in: ${known.join(', ')} and ${names.join(' / ')} on $PATH`);
  return hit;
}
const CHROME = findChrome();
const CHROME_ARGS = ['--headless=new', '--disable-gpu', '--hide-scrollbars', ...(process.platform === 'linux' && process.getuid?.() === 0 ? ['--no-sandbox'] : [])];
const W = +(opt.w || 390), H = +(opt.h || 844), DPR = +(opt.dpr || 2), WAIT = +(opt.wait || 8000);
const [P0, P1] = (opt.pages || '1-33').split('-').map(Number);
fs.mkdirSync(outDir, { recursive: true });
let chrome, ws, prof, id = 0, sink = null;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const call = (method, params = {}, ms = 20000) => new Promise(res => { const i = ++id; const t = setTimeout(() => { ws.removeEventListener('message', h); res(null); }, ms);
  const h = e => { const m = JSON.parse(e.data); if (m.id === i) { clearTimeout(t); ws.removeEventListener('message', h); res(m.result); } };
  ws.addEventListener('message', h); ws.send(JSON.stringify({ id: i, method, params })); });
function onEvent(e) { const m = JSON.parse(e.data); if (!sink || !m.method) return;
  if (m.method === 'Runtime.exceptionThrown') sink.errors.push((m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text).split('\n')[0]);
  else if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error') sink.errors.push(m.params.entry.text + (m.params.entry.url ? ' ' + m.params.entry.url : ''));
  else if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') sink.errors.push(m.params.args.map(a => a.value ?? a.description).join(' '));
  else if (m.method === 'Network.responseReceived' && m.params.response.status >= 400) sink.bad.push(m.params.response.status + ' ' + m.params.response.url); }
// a fresh browser — at the start, and again whenever one stops answering (so one stall never sinks the rest)
async function launch() {
  if (chrome) { try { ws.close(); } catch {} chrome.kill('SIGKILL'); await sleep(500); try { fs.rmSync(prof, { recursive: true, force: true }); } catch {} }
  const PORT = 9500 + Math.floor(Math.random() * 400); prof = fs.mkdtempSync('/tmp/rt-');
  chrome = spawn(CHROME, [...CHROME_ARGS, `--remote-debugging-port=${PORT}`, `--user-data-dir=${prof}`, 'about:blank'], { stdio: ['ignore', 'ignore', 'pipe'] });
  let err = '', gone = null; chrome.stderr.on('data', d => { err = (err + d).slice(-2000); });
  chrome.on('error', e => { gone = e.message; }); chrome.on('exit', c => { gone = gone || `exited with code ${c}`; });
  let list; for (let i = 0; i < 40 && !list && !gone; i++) { await sleep(250); try { list = await (await fetch(`http://localhost:${PORT}/json`)).json(); } catch {} }
  if (!list?.some(t => t.type === 'page')) { chrome.kill('SIGKILL'); try { fs.rmSync(prof, { recursive: true, force: true }); } catch {} die(`${CHROME} did not open DevTools on port ${PORT}${gone ? ` (${gone})` : ' within 10 s'}${err.trim() ? '\n' + err.trim() : ''}`); }
  ws = new WebSocket(list.find(t => t.type === 'page').webSocketDebuggerUrl); await new Promise(r => ws.onopen = r);
  ws.addEventListener('message', onEvent);
  await call('Runtime.enable'); await call('Log.enable');   // ⚠ NOT Network.enable: a page whose sprite sheets are multi-MB data: URLs (hands, 5.6 MB) floods the
  // DevTools pipe with them and the whole connection freezes. Failed requests come from Resource Timing instead (below).
  await call('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: DPR, mobile: W < 700 });
}
await launch();
const report = [];
for (let k = P0, retried = false; k <= P1; k++) {
  const r = sink = { page: k, errors: [], bad: [] };
  const nav = await call('Page.navigate', { url: `${base}/?rt=${Date.now()}#${k}` });
  if (nav) await sleep(WAIT); else r.stalled = 'navigate';
  const st = r.stalled ? null : await call('Runtime.evaluate', { returnByValue: true, expression: `(()=>{const p=document.querySelector('.page.current');return {title:(p&&(p.querySelector('.line')||p.querySelector('h1')||{}).textContent||'').trim().slice(0,48),card:p?p.className.replace(/\\bpage\\b|\\bcurrent\\b/g,'').trim():'',sw:document.documentElement.scrollWidth>innerWidth}})()` });
  if (!r.stalled) Object.assign(r, st?.result?.value || { stalled: 'evaluate' });
  const rt = r.stalled ? null : await call('Runtime.evaluate', { returnByValue: true, expression: `performance.getEntriesByType('resource').filter(e=>e.responseStatus>=400).map(e=>e.responseStatus+' '+e.name)` });
  for (const b of rt?.result?.value || []) if (!r.bad.includes(b)) r.bad.push(b);
  const shot = r.stalled ? null : await call('Page.captureScreenshot', { format: 'png' }, 30000);
  if (shot) fs.writeFileSync(`${outDir}/p${k}.png`, Buffer.from(shot.data, 'base64')); else r.stalled = r.stalled || 'screenshot';
  if (r.stalled && !retried) { console.log(`p${k}: stalled at ${r.stalled} — relaunching the browser and retrying`); retried = true; await launch(); k--; continue; }
  if (r.stalled) await launch();
  retried = false;
  console.log(`p${k}: ${r.errors.length} err · ${r.bad.length} bad · [${r.card || ''}] ${r.title || ''}${r.stalled ? ' · STALLED ' + r.stalled : ''}`);
  report.push(r);
}
sink = null; fs.writeFileSync(`${outDir}/report.json`, JSON.stringify(report, null, 1));
ws.close(); chrome.kill();
setTimeout(() => { try { fs.rmSync(prof, { recursive: true, force: true }); } catch {} process.exit(0); }, 800);
