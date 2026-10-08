// gen/loadprobe.mjs — what a cold visit actually costs, measured the way a phone sees it.
//
// Run: node gen/loadprobe.mjs [url] [--w=390 --h=844 --down=9 --rtt=170 --wait=12000 --pages=0,1,2]
//   --down  Mbit/s (9 ≈ a decent 4G), --rtt ms. Cache disabled, fresh profile = a first-time reader.
//   --pages turns to those pages after load (by #hash), to measure what the first few page-turns fetch.
// Prints: time to first paint / LCP / load, bytes & requests by type, the 15 heaviest files.
import { spawn } from 'node:child_process';
import fs from 'node:fs';

const args = process.argv.slice(2);
const opt = Object.fromEntries(args.filter(a => a.startsWith('--')).map(a => a.slice(2).split('=')));
const url = args.find(a => !a.startsWith('--')) || 'https://balthazar.sh/';
const W = +(opt.w || 390), H = +(opt.h || 844), DOWN = +(opt.down || 9), RTT = +(opt.rtt || 170), WAIT = +(opt.wait || 12000);
const PAGES = opt.pages ? opt.pages.split(',').map(Number) : [];
const PORT = 9800 + Math.floor(Math.random() * 150);
const prof = fs.mkdtempSync('/tmp/probe-');
const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  ['--headless=new', '--disable-gpu', `--remote-debugging-port=${PORT}`, `--user-data-dir=${prof}`, 'about:blank'], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));
let list; for (let i = 0; i < 40 && !list; i++) { await sleep(250); try { list = await (await fetch(`http://localhost:${PORT}/json`)).json(); } catch {} }
const ws = new WebSocket(list.find(t => t.type === 'page').webSocketDebuggerUrl);
await new Promise(r => ws.onopen = r);
let id = 0; const pend = new Map(); const events = [];
ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m.result); pend.delete(m.id); } else if (m.method) events.push(m); };
const call = (method, params = {}) => new Promise(res => { const i = ++id; pend.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });

await call('Network.enable'); await call('Page.enable');
await call('Network.setCacheDisabled', { cacheDisabled: true });
await call('Network.emulateNetworkConditions', { offline: false, latency: RTT, downloadThroughput: DOWN * 125000, uploadThroughput: 1.5 * 125000 });
await call('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: W < 700 ? 3 : 1, mobile: W < 700 });
if (W < 700) await call('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
await call('Page.addScriptToEvaluateOnNewDocument', { source: `window.__lcp=0;new PerformanceObserver(l=>{for(const e of l.getEntries())window.__lcp=e.startTime}).observe({type:'largest-contentful-paint',buffered:true});` });
const t0 = Date.now();
await call('Page.navigate', { url });
await sleep(WAIT);
const perf = (await call('Runtime.evaluate', { returnByValue: true, expression: `JSON.stringify({fcp:(performance.getEntriesByName('first-contentful-paint')[0]||{}).startTime, lcp:window.__lcp, load:performance.timing.loadEventEnd-performance.timing.navigationStart, dcl:performance.timing.domContentLoadedEventEnd-performance.timing.navigationStart})` })).result.value;
const cold = events.length;
for (const k of PAGES) { await call('Runtime.evaluate', { expression: `location.hash='#${k}'` }); await sleep(5000); }

const req = new Map();
for (const e of events) {
  if (e.method === 'Network.responseReceived') { const r = req.get(e.params.requestId) || {}; r.url = e.params.response.url; r.type = e.params.type; r.mime = e.params.response.mimeType; req.set(e.params.requestId, r); }
  if (e.method === 'Network.loadingFinished') { const r = req.get(e.params.requestId) || {}; r.bytes = e.params.encodedDataLength; r.idx = events.indexOf(e); req.set(e.params.requestId, r); }
}
const all = [...req.values()].filter(r => r.url && r.bytes != null && !r.url.startsWith('data:'));
const coldReqs = all.filter(r => r.idx < cold), laterReqs = all.filter(r => r.idx >= cold);
const kb = b => (b / 1024).toFixed(0) + ' KB';
const sum = a => a.reduce((s, r) => s + r.bytes, 0);
const byType = a => { const m = {}; for (const r of a) { const k = r.type || '?'; m[k] = m[k] || [0, 0]; m[k][0]++; m[k][1] += r.bytes; } return Object.entries(m).sort((x, y) => y[1][1] - x[1][1]).map(([k, [n, b]]) => `${k} ${n}× ${kb(b)}`).join(' · '); };
console.log(`${url}  ${W}x${H}  ${DOWN} Mbit/s  rtt ${RTT}ms`);
console.log('timing ms', perf);
console.log(`COLD: ${coldReqs.length} requests, ${kb(sum(coldReqs))}  —  ${byType(coldReqs)}`);
if (PAGES.length) console.log(`AFTER turning to ${PAGES.join(',')}: +${laterReqs.length} requests, +${kb(sum(laterReqs))}`);
const grp = {}; for (const r of coldReqs) { const p = r.url.replace(/^https?:\/\/[^/]+/, '').split('?')[0]; const g = p.startsWith('/cast/') ? 'cast cells' : /word-[a-z0-9]+-b\d+/.test(p) ? 'cover frames' : /word-/.test(p) ? 'cover planes' : p.startsWith('/plates-vg/') ? 'other plates: ' + p.split('/').pop().split('-')[0].split('.')[0] : p.startsWith('/fonts/') ? 'fonts' : 'other'; grp[g] = grp[g] || [0, 0]; grp[g][0]++; grp[g][1] += r.bytes; }
console.log('by group:'); for (const [g, [n, b]] of Object.entries(grp).sort((a, b) => b[1][1] - a[1][1])) console.log('  ' + kb(b).padStart(8) + '  ' + n + '×  ' + g);
console.log('heaviest (cold):');
for (const r of coldReqs.sort((a, b) => b.bytes - a.bytes).slice(0, 15)) console.log('  ' + kb(r.bytes).padStart(8) + '  ' + r.url.replace(/^https?:\/\/[^/]+/, '').slice(0, 90));
const ext = coldReqs.filter(r => !/^https?:\/\/(www\.)?balthazar\.sh/.test(r.url));
console.log('third-party requests:', ext.length ? ext.map(r => r.url.slice(0, 60)).join(', ') : 'none');
ws.close(); chrome.kill(); setTimeout(() => { try { fs.rmSync(prof, { recursive: true, force: true }); } catch {} process.exit(0); }, 800);
