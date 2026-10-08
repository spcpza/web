// gen/legibility-lab.mjs — ONE page, EVERY legibility method, side by side in one picture.
// Fred, Sep 25: "this is such an inefficient way to compare stuff… pick the most illegible page, then do
// side by side comparison on different methods. be creative."
// The page is loaded ONCE (same frame, same sprites), then each method's CSS is injected in turn and
// shot — so the only thing that differs between panels is the method.
// Run: node gen/legibility-lab.mjs <base-url> <page#> <out.png> [--w=390 --h=844]
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const args = process.argv.slice(2);
const opt = Object.fromEntries(args.filter(a => a.startsWith('--')).map(a => { const s = a.slice(2), i = s.indexOf('='); return [s.slice(0, i), s.slice(i + 1)]; }));
const [base, page, out] = args.filter(a => !a.startsWith('--'));
const W = +(opt.w || 390), H = +(opt.h || 844);

// every method shares the VERSE fix (it was the faintest thing on the page) and a firmer phone line
const COMMON = `.page.current .verse{font-size:${W < 700 ? '0.9rem' : '0.95rem'}!important;color:rgba(244,239,226,.92)!important;line-height:1.42}
.page.current .verse b{color:rgba(240,212,137,.95)!important}
${W < 700 ? '.page.current .line{font-weight:600!important;font-size:1.14rem!important}' : ''}`;
const HALO = `.page.current .line{text-shadow:0 0 1px #0c1024,0 1px 2px #0c1024,0 0 6px rgba(12,16,36,.95),0 0 16px rgba(12,16,36,.85),0 0 30px rgba(12,16,36,.6)!important}
.page.current .verse{text-shadow:0 0 1px #0c1024,0 1px 2px #0c1024,0 0 8px rgba(12,16,36,.9),0 0 20px rgba(12,16,36,.7)!important}`;
// the text block shrunk to its own size, so a method can put something behind just the words
const BOX = `.page.current .text{left:4vw!important;right:auto!important;bottom:calc(5vh + env(safe-area-inset-bottom))!important;max-width:min(88vw,34em);padding:18px 22px 14px!important;box-sizing:border-box}
.page.current .verse{min-height:0!important}.page.current .scrim{opacity:0!important}`;
// a painted wash: a dark rounded shape whose EDGE is torn by turbulence, like a brushed patch of ink
const INK = "data:image/svg+xml," + encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300' preserveAspectRatio='none'><filter id='f' x='-10%' y='-10%' width='120%' height='120%'><feTurbulence type='fractalNoise' baseFrequency='0.035 0.06' numOctaves='3' seed='7'/><feDisplacementMap in='SourceGraphic' scale='26'/><feGaussianBlur stdDeviation='2.2'/></filter><rect x='16' y='18' width='368' height='264' rx='60' fill='#101530' fill-opacity='0.8' filter='url(#f)'/></svg>`);
const PAPER = "data:image/svg+xml," + encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300' preserveAspectRatio='none'><filter id='f' x='-10%' y='-10%' width='120%' height='120%'><feTurbulence type='fractalNoise' baseFrequency='0.06 0.09' numOctaves='3' seed='3'/><feDisplacementMap in='SourceGraphic' scale='12'/></filter><filter id='g'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' seed='5'/><feColorMatrix values='0 0 0 0 0.45  0 0 0 0 0.36  0 0 0 0 0.22  0 0 0 0.10 0'/></filter><g filter='url(#f)'><rect x='12' y='12' width='376' height='276' rx='6' fill='#f5ecd6'/><rect x='12' y='12' width='376' height='276' rx='6' filter='url(#g)'/></g></svg>`);

const METHODS = [
  ['1 · today', ``],
  ['2 · fit (shade to poem height)', COMMON + `.page.current .scrim{height:var(--fitH)!important;background:linear-gradient(to top,rgba(var(--scrimrgb,19,27,56),var(--scrima,.82)) 0%,rgba(var(--scrimrgb,19,27,56),calc(var(--scrima,.82)*.72)) 62%,rgba(var(--scrimrgb,19,27,56),0))!important}`],
  ['3 · halo (glow per letter)', COMMON + HALO],
  ['4 · blend (halo + light shade)', COMMON + HALO + `.page.current .scrim{height:var(--fitH)!important;background:linear-gradient(to top,rgba(var(--scrimrgb,19,27,56),calc(var(--scrima,.82)*.62)) 0%,rgba(var(--scrimrgb,19,27,56),calc(var(--scrima,.82)*.3)) 60%,rgba(var(--scrimrgb,19,27,56),0))!important}`],
  // ── outside the box ──
  ['5 · ink wash (a painted patch)', COMMON + BOX + `.page.current .text{background:url("${INK}") center/100% 100% no-repeat}`],
  ['6 · storybook paper (dark ink)', COMMON + BOX + `.page.current .text{background:url("${PAPER}") center/100% 100% no-repeat;box-shadow:none}
    .page.current .line{color:#2a2130!important;text-shadow:none!important}.page.current .line em{color:#9a3b22!important}
    .page.current .verse{color:#4a3a3a!important;text-shadow:none!important}.page.current .verse b{color:#8a5a22!important}`],
  ['7 · spotlight (shadow only round the words)', COMMON + `.page.current .scrim{opacity:0!important}
    .page.current .text::before{content:'';position:absolute;left:-12vw;right:-4vw;top:-24%;bottom:-18%;z-index:-1;pointer-events:none;
      background:radial-gradient(ellipse 58% 60% at 34% 58%,rgba(12,16,38,.82) 0%,rgba(12,16,38,.6) 50%,rgba(12,16,38,0) 100%)}`],
  ['8 · book page (painting above, words below)', COMMON + `.page.current .scrim{height:var(--pageH)!important;background:linear-gradient(to top,rgb(var(--scrimrgb,19,27,56)) 0%,rgb(var(--scrimrgb,19,27,56)) 78%,rgba(var(--scrimrgb,19,27,56),0) 100%)!important}
    .page.current .line{text-shadow:none!important}`],
  ['9 · outlined letters (stroke)', COMMON + `.page.current .line,.page.current .verse{-webkit-text-stroke:3px rgba(12,16,36,.92);paint-order:stroke fill;text-shadow:0 2px 10px rgba(12,16,36,.6)!important}`],
];

const PORT = 9400 + Math.floor(Math.random() * 300), prof = fs.mkdtempSync('/tmp/lab-');
const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', ['--headless=new', '--disable-gpu', '--hide-scrollbars', `--remote-debugging-port=${PORT}`, `--user-data-dir=${prof}`, 'about:blank'], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));
let list; for (let i = 0; i < 40 && !list; i++) { await sleep(250); try { list = await (await fetch(`http://localhost:${PORT}/json`)).json(); } catch {} }
const ws = new WebSocket(list.find(t => t.type === 'page').webSocketDebuggerUrl); await new Promise(r => ws.onopen = r);
let id = 0; const call = (m, p = {}) => new Promise(res => { const i = ++id; const h = e => { const d = JSON.parse(e.data); if (d.id === i) { ws.removeEventListener('message', h); res(d.result); } }; ws.addEventListener('message', h); ws.send(JSON.stringify({ id: i, method: m, params: p })); });
await call('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 2, mobile: W < 700 });
await call('Page.navigate', { url: `${base}/?lab=${Date.now()}#${page}` });
await sleep(11000);
// freeze motion so every panel is the same frame
await call('Runtime.evaluate', { expression: `(()=>{const s=document.createElement('style');s.textContent='*,*::before,*::after{animation-play-state:paused!important;transition:none!important}';document.head.appendChild(s);
  const p=document.querySelector('.page.current'),t=p.querySelector('.text'),ph=p.clientHeight,th=t.offsetHeight;
  p.style.setProperty('--fitH',Math.min(62,Math.max(18,(th+ph*.10)/ph*100))+'%');p.style.setProperty('--pageH',Math.min(70,(th+ph*.06)/ph*100)+'%');})()` });
const dir = fs.mkdtempSync('/tmp/labshots-'), files = [];
for (const [label, css] of METHODS) {
  await call('Runtime.evaluate', { expression: `(()=>{let s=document.getElementById('lab');if(!s){s=document.createElement('style');s.id='lab';document.head.appendChild(s)}s.textContent=${JSON.stringify(css)};})()` });
  await sleep(600);
  const shot = await call('Page.captureScreenshot', { format: 'png' });
  const f = `${dir}/${files.length}.png`; fs.writeFileSync(f, Buffer.from(shot.data, 'base64')); files.push([label, f]);
}
ws.close(); chrome.kill();
fs.writeFileSync(`${dir}/list.json`, JSON.stringify(files));
execFileSync('python3', ['-c', `
import json,sys
from PIL import Image, ImageDraw, ImageFont
files=json.load(open(sys.argv[1])); out=sys.argv[2]; phone=${W < 700 ? 'True' : 'False'}
ims=[Image.open(f).convert('RGB') for _,f in files]
w,h=ims[0].size
if phone: crop=(0,int(h*0.45),w,h); cols=5
else: crop=(0,int(h*0.40),int(w*0.55),h); cols=3
tw=crop[2]-crop[0]; th=crop[3]-crop[1]; sc=520/tw if phone else 640/tw
tw2,th2=int(tw*sc),int(th*sc); rows=(len(ims)+cols-1)//cols
try: font=ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc',22)
except: font=None
sheet=Image.new('RGB',(cols*(tw2+10)+10,rows*(th2+46)+10),(24,22,30)); d=ImageDraw.Draw(sheet)
for i,(im,(lab,_)) in enumerate(zip(ims,files)):
    x=10+(i%cols)*(tw2+10); y=10+(i//cols)*(th2+46)
    d.text((x+2,y+6),lab,fill=(255,214,120),font=font)
    sheet.paste(im.crop(crop).resize((tw2,th2),Image.LANCZOS),(x,y+36))
sheet.save(out); print(out, sheet.size)
`, `${dir}/list.json`, out], { stdio: 'inherit' });
setTimeout(() => { try { fs.rmSync(prof, { recursive: true, force: true }); } catch {} process.exit(0); }, 600);
