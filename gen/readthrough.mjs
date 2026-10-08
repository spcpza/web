// gen/readthrough.mjs — the WHOLE-BOOK CHECK: every page in order, at a true viewport, in one browser.
// For each page: a screenshot, every console error / uncaught exception, and every request that came back
// 4xx/5xx (from Resource Timing, so not data:/blob: — those never fail by status). Waits for the story card to finish writing, so the shot is what a reader sees once it settles.
// Every CDP call has its own timeout — headless Chrome sometimes stops answering mid-run (it stalls at 1440
// wide / DPR 3 with many pages); a stalled page is logged and skipped, never hangs the run.
//
// Run:  node gen/readthrough.mjs <base-url> <out-dir> [--w=390 --h=844 --dpr=2 --wait=8000 --pages=1-33]
//   e.g. node gen/readthrough.mjs https://balthazar.sh /tmp/rt-phone
//        node gen/readthrough.mjs https://balthazar.sh /tmp/rt-desk --w=1280 --h=800 --dpr=1
// Writes p<N>.png per page and report.json; prints one line per page.
import { spawn } from 'node:child_process';
import fs from 'node:fs';

const args = process.argv.slice(2);
const opt = Object.fromEntries(args.filter(a => a.startsWith('--')).map(a => { const s = a.slice(2), i = s.indexOf('='); return i < 0 ? [s, ''] : [s.slice(0, i), s.slice(i + 1)]; }));
const [base, outDir] = args.filter(a => !a.startsWith('--'));
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
  chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', ['--headless=new', '--disable-gpu', '--hide-scrollbars', `--remote-debugging-port=${PORT}`, `--user-data-dir=${prof}`, 'about:blank'], { stdio: 'ignore' });
  let list; for (let i = 0; i < 40 && !list; i++) { await sleep(250); try { list = await (await fetch(`http://localhost:${PORT}/json`)).json(); } catch {} }
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
