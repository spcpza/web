// gen/plates/word.mjs — "the light of men" (John 1:4)
// The back cover: THE ENTIRE KJV AS ONE BODY OF LIGHT.
//
// Every mote is one of the 31,102 verses, positioned by real data:
//   angle  — canonical order, Genesis 1:1 at the top sweeping clockwise
//            through 1.6 turns to Revelation 22:21
//   radius — graph distance from John 1:1 over the shared-Strong's-root
//            graph (BFS, equal-area rings so the wheel breathes evenly)
// Every filament is a real pair of verses sharing one exact Strong's root.
// The single red curve is the scarlet thread: thirteen verses of the Lamb,
// Genesis 3:15 to Revelation 22:13, threaded through their plotted points.
// The center is a radiant void — the Word that everything attends to and
// that attends to nothing before it.
//
// Nothing here is decorative. The painting is a checkable claim (see <desc>).
//
// layout() — the deterministic geometry (positions, colors, thread,
// waypoints) — is exported separately so the live overlay on the site
// (gen/export-live.mjs -> live-word.json) can breathe over the exact
// same coordinates the painting was pressed from. layout() uses no rng;
// paint() owns the single seeded rng (filaments only), so extracting the
// layout leaves the rendered SVG byte-identical.

import { loadCorpus, LIGHT_ROOTS } from '../corpus.mjs';
import { mix, ramp } from '../engine.mjs';

// ALPHA & OMEGA — "I am Alpha and Omega, the beginning and the end" (Rev 22:13).
// The first page and the last hold ALL colours: the full spectrum, red through
// violet and round again, every hue of the made world streaming from and
// returning to the one white Light at the centre.
const RAINBOW = ['#ff5470', '#ff8a3d', '#ffd23d', '#8fe04a', '#3dd6c0', '#3aa0f0', '#7a6ef0', '#c45ce0', '#ff5aa8', '#ff5470'];

export const name = 'word';
export const title = 'the light of men';
export const caption = 'In him was life; and the life was the light of men. — every verse, one body of light.';
export const seed = 28010104;
export const focal = { x: 400, y: 258 };

// MOBILE 3D — a DEEP DOME of light. The galaxy is sliced into many concentric
// depth shells by RADIUS from the Word (the composite-once compositor stacks
// them for ~free): the nebula + filaments + outermost motes sit farthest back,
// then NSHELL thin rings of verse-motes step forward shell by shell, and the
// radiant white Word + the scarlet thread float closest. Tilt the phone and the
// whole Bible opens into a volumetric tunnel of light — every colour orbiting
// the one Light at its own depth. Positions (the checkable claim) are untouched;
// only the DRAW is split into shells the compositor slides apart.
//   depth(mote) ≈ 1 − (r/RIM)²  → finer depth resolution toward the Word.
const NSHELL = 14;        // transparent mote shells between the bg and the Word
const RIM = 170;          // motes beyond this fold into the opaque bg (they barely parallax)
// PAINT ON PAINT: the spiral's visible brushwork is NOT one smooth field but
// several INDEPENDENT, bold, GAPPED stroke-sheets stacked at their own depths
// over a smooth deep ground. Each is its own pass (own rng) of crisp full-opacity
// marks with open gaps — so you see strokes, and through the gaps the strokes of
// the sheet behind, and behind that. They parallax apart as the phone tilts.
// Deepest → nearest: strokes get a touch finer + warmer (atmospheric).
const SHEETS = [
  { n: 104, len: 74, lw: 15, lift: 0.00 },
  { n: 108, len: 64, lw: 14, lift: 0.04 },
  { n: 114, len: 56, lw: 13, lift: 0.08 },
  { n: 120, len: 48, lw: 12, lift: 0.12 },
  { n: 128, len: 42, lw: 11, lift: 0.16 },
];
export const layers = [
  { name: 'bg', opaque: true },   // smooth deep ground + filaments + the outermost motes (backmost)
  ...SHEETS.map((_, i) => ({ name: 'n' + i })),                      // n0 (deep) → n4 (near): the stacked brushwork sheets
  ...Array.from({ length: NSHELL }, (_, i) => ({ name: 's' + i })),   // s0 (outer) → s13 (inner): the mote shells
  { name: 'fg' },                 // the radiant Word + the scarlet redemption thread (closest)
];
// equal-area shell edges, OUTER→INNER (descending radius): shell s holds the
// motes with shellEdges[s+1] < r ≤ shellEdges[s].
const shellEdges = Array.from({ length: NSHELL + 1 }, (_, i) => Math.sqrt(RIM * RIM * (1 - i / NSHELL)));

// the scarlet thread, in canon order — the only red in the image
const THREAD = [
  'Genesis 3:15', 'Genesis 22:8', 'Exodus 12:13', 'Leviticus 17:11',
  'Psalms 22:16', 'Isaiah 53:5', 'Zechariah 12:10', 'John 1:29',
  'John 19:30', 'Romans 5:8', '1 Peter 1:19', 'Revelation 5:9',
  'Revelation 22:13',
];

const CX = 400, CY = 258;          // slightly above center; void breathes
const R0 = 36, RMAX = 224;
const TURNS = 1.6;

// stable per-verse hash in [0,1) — positions must not depend on layer order
function hash01(i, salt) {
  let h = (i * 374761393 + salt * 668265263) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/* ============================== LAYOUT ==============================
   Pure, deterministic, rng-free. Returns:
     motes     [{x, y, r, warm(0..1), size, color, light, q}]  all 31,102
     thread    [[x, y]...]  the final smoothed polyline (viewBox coords)
     center    {x, y}
     waypoints [{ref, x, y}...]  the 13 scarlet-thread verses as plotted
   plus internals paint() needs to press the plate unchanged:
     prof (thread width profile), corpus (loaded C).                  */
export function layout() {
  const C = loadCorpus();

  /* ---------------- equal-area rings from the hop histogram ----------------
     each BFS distance band gets annulus area proportional to its verse
     count, so the wheel glows evenly instead of banding. */
  const maxHop = C.MAXHOP;
  const counts = [];
  for (let h = 0; h <= maxHop; h++) counts.push(C.hist[h] || 0);
  const total = counts.reduce((a, b) => a + b, 0);
  const cumBefore = [];
  let cum = 0;
  const A0 = R0 * R0, A1 = RMAX * RMAX;
  for (let h = 0; h <= maxHop; h++) { cumBefore.push(cum); cum += counts[h]; }

  /* ---------------- plot every verse ---------------- */
  const N = C.N;
  const motes = new Array(N);
  for (const v of C.verses) {
    const i = v.idx;
    // angle: canonical sweep, Genesis 1:1 at top, clockwise, 1.6 turns,
    // with per-verse angular jitter so chapters don't band into spokes
    const th = -Math.PI / 2 + (i / N) * TURNS * 2 * Math.PI
      + (hash01(i, 11) - 0.5) * 0.024;
    // radius: continuous equal-area fraction — band position from the BFS
    // hop, spiral grain within the band tracking the canon's turning
    // (jitter WRAPS so the spiral has no seam), plus a cross-band blur so
    // distance bands grade into each other instead of ringing
    const u0 = ((i / N) * TURNS) % 1;
    const u = (u0 + (hash01(i, 23) - 0.5) * 0.5 + 1) % 1;
    let frac = (cumBefore[v.hop] + u * counts[v.hop]) / total;
    frac += (hash01(i, 37) - 0.5) * 0.07;
    frac = Math.min(1, Math.max(0, frac));
    const r = Math.sqrt(A0 + (A1 - A0) * frac);
    const x = CX + Math.cos(th) * r, y = CY + Math.sin(th) * r;
    const q = Math.max(0, 1 - (r - R0) / (RMAX - R0));   // closeness to the Word
    let color, warm;
    if (v.light) {
      // light/word/life roots: pure white-gold, the Light all colours come from
      color = mix('#f4c64e', '#fffaf0', 0.25 + 0.65 * q + hash01(i, 51) * 0.1);
      warm = 1;
    } else {
      // ALPHA→OMEGA: each verse a colour of the spectrum in canon order; vivid
      // at the rim, whitening as it nears the white Word (all colours → one Light)
      let c = ramp(RAINBOW, (i / N + hash01(i, 51) * 0.015) % 1);
      c = mix(c, '#fff6e8', 0.22 + 0.55 * Math.pow(q, 1.25));
      color = c;
      warm = Math.pow(q, 2.0) * 0.7;                            // same warming law (live overlay)
    }
    const size = 0.35 + 0.5 * q + (v.light ? 0.28 : 0) + hash01(i, 67) * 0.15;
    motes[i] = { x, y, r, warm, size, color, light: !!v.light, q };
  }

  /* ---------------- the scarlet thread ----------------
     one continuous curve through the actual plotted positions of the
     thirteen waypoints, Catmull-Rom smoothed — blood through a body,
     not a route map. Slightly thicker at John 19:30 ("It is finished"). */
  // the canon's angle is monotone, so the thread is routed in POLAR space:
  // it sweeps clockwise with the canon through all thirteen wounds, radius
  // gliding between their true plotted radii — a vein circling the body,
  // never a chord slicing across it.
  const wp = THREAD.map(ref => {
    const i = C.idxOf.get(ref);
    const { x, y } = motes[i];
    return { ref, i, x, y, th: Math.atan2(y - CY, x - CX), r: Math.hypot(x - CX, y - CY) };
  });
  for (let k = 1; k < wp.length; k++) {            // unwrap angles, monotone clockwise
    while (wp[k].th <= wp[k - 1].th) wp[k].th += 2 * Math.PI;
  }
  // monotone cubic Hermite (Fritsch-Carlson) for r over th — C1 smooth,
  // no overshoot, so the vein glides between its true radii without wobble
  const ths = wp.map(p => p.th), rs = wp.map(p => p.r);
  const nW = wp.length;
  const dth = [], slope = [];
  for (let k = 0; k < nW - 1; k++) { dth.push(ths[k + 1] - ths[k]); slope.push((rs[k + 1] - rs[k]) / (ths[k + 1] - ths[k])); }
  const m = [slope[0]];
  for (let k = 1; k < nW - 1; k++) {
    if (slope[k - 1] * slope[k] <= 0) m.push(0);
    else { const w1 = 2 * dth[k] + dth[k - 1], w2 = dth[k] + 2 * dth[k - 1]; m.push((w1 + w2) / (w1 / slope[k - 1] + w2 / slope[k])); }
  }
  m.push(slope[nW - 2]);
  const tpts = [];
  for (let s = 0; s < nW - 1; s++) {
    const SEG = Math.max(8, Math.round(dth[s] * 30)); // ~30 samples per radian
    for (let k = (s === 0 ? 0 : 1); k <= SEG; k++) {
      const t = k / SEG, h = dth[s];
      const h00 = (1 + 2 * t) * (1 - t) * (1 - t), h10 = t * (1 - t) * (1 - t);
      const h01 = t * t * (3 - 2 * t), h11 = t * t * (t - 1);
      const th = ths[s] + t * h;
      const r = h00 * rs[s] + h10 * h * m[s] + h01 * rs[s + 1] + h11 * h * m[s + 1];
      tpts.push([CX + Math.cos(th) * r, CY + Math.sin(th) * r]);
    }
  }
  // width profile along the whole thread: swelling at John 19:30
  const i1930 = (() => {                            // nearest sample to John 19:30
    const w19 = wp[THREAD.indexOf('John 19:30')];
    let best = 0, bd = 1e9;
    tpts.forEach((p, j) => { const d = Math.hypot(p[0] - w19.x, p[1] - w19.y); if (d < bd) { bd = d; best = j; } });
    return best;
  })();
  const t1930 = i1930 / (tpts.length - 1);
  const prof = tpts.map((_, j) => {
    const t = j / (tpts.length - 1);
    const swell = Math.exp(-Math.pow((t - t1930) * 7.5, 2));
    return 0.40 + 0.10 * Math.sin(Math.PI * t) + 0.22 * swell;   // halfwidth/w
  });

  return {
    motes,
    thread: tpts,
    center: { x: CX, y: CY },
    waypoints: wp.map(p => ({ ref: p.ref, x: p.x, y: p.y })),
    prof,
    corpus: C,
  };
}

export function paint(E, opts = {}) {
  const { mulberry32, ribbon, svgWrap, R1, W, H, DARKEST,
    strokes, rej, curlV, fbm, ramp, jig, lightRadial, mix, goldenSpiralDir } = E;
  const rng = mulberry32(seed);
  const L = layout();
  const { motes, thread: tpts, waypoints, prof, corpus: C } = L;
  const N = C.N;
  const LAYER = opts.layer || 'full';

  // MULTIPLANE: each depth shell is its own array of marks; the composite-once
  // compositor slides them apart. The motes are split into NSHELL radial shells.
  const back = [], fil = [], voidArr = [], threadArr = [];
  const shells = Array.from({ length: NSHELL }, () => []);   // s0 (outer) → s(N-1) (inner)
  const out = back;   // the nebula + backdrop are the BG plane

  // not a black void — a luminous deep nebula, blue-violet brightening toward
  // the Word, so the first page and the last open in light and colour (no black)
  out.push(`<defs><radialGradient id="neb28" cx="0.5" cy="0.52" r="0.64">
<stop offset="0" stop-color="#5a4f9e"/>
<stop offset="0.34" stop-color="#46407e"/>
<stop offset="0.7" stop-color="#3a3270"/>
<stop offset="1" stop-color="#332a62"/>
</radialGradient></defs>`);
  out.push(`<rect width="${W}" height="${H}" fill="#332a62"/>`);
  out.push(`<rect width="${W}" height="${H}" fill="url(#neb28)"/>`);

  /* ---------------- THE LIVING NEBULA (Munch: natural ⇒ curved; free colour) ----
     the cosmos the Word's body floats in — depth, not a flat gradient. Long
     curved strokes spiral CLOCKWISE around the centre, the canon's own turning;
     a free, non-literal colour drifts band by band — deep violet and indigo at
     the rim, teal and rose midway, warming to gold as it nears the Word. No
     black: the dark is blue-violet. The wheel, filaments and thread press on
     top of this, unchanged, so the checkable claim is untouched. */
  const counter = { n: 0 };
  const glow = lightRadial(CX, CY, 150);
  // the cosmos turns on a TRUE GOLDEN SPIRAL about the Word — the φ growth-law of
  // the galaxies (Ps 19:1, "the heavens declare the glory of God"; Col 1:17, "by
  // him all things consist"), clockwise with the canon. A curl wobble keeps the
  // hand in it. The motes/thread/positions (the checkable claim) are untouched —
  // only the background swirl now obeys divine proportion.
  const flow = (x, y) => {
    const g = goldenSpiralDir(x, y, CX, CY, -1);   // clockwise golden spiral
    const [wx, wy] = curlV(x, y, 77, 150);
    return Math.atan2(Math.sin(g) + wy * 0.7, Math.cos(g) + wx * 0.7);
  };
  const nebCol = (x, y, r) => {
    const d = Math.hypot(x - CX, y - CY);
    const t = Math.min(1, d / 430);
    const ang = Math.atan2(y - CY, x - CX);
    // FULL SPECTRUM by angle — a rainbow wheel turning around the Word; the hue
    // drifts with radius + noise so it spirals like a living aurora, not a pie
    let hue = (ang / (2 * Math.PI) + 1) + d / 360 + Math.sin(d / 80) * 0.05 + (fbm(x / 150, y / 150, 41, 4) - 0.5) * 0.18;
    hue = (hue % 1 + 1) % 1;
    let c = ramp(RAINBOW, hue);
    c = mix(c, '#2a2150', t * 0.26);                     // only a gentle deepening at the rim — stays vibrant to the edge
    const g = glow(x, y);
    if (g > 0.02) c = mix(c, '#fff0c0', g * 0.55);       // white-gold toward the Word (all colour resolves to Light)
    return jig(c, r, 9);
  };
  // the SMOOTH DEEP GROUND only — broad soft colour masses set the colour and
  // depth; NO fine detail here. The visible brushwork lives in the stacked
  // sheets, so the gaps in those sheets reveal paint (not a flat fill) behind.
  strokes(out, counter, {
    rng, n: 620, sample: rej(-24, -24, 824, 524, () => true),
    dir: flow, col: nebCol,
    len: 60, lw: 9, steps: 4, follow: 0.9, wild: 0.04, lenJ: 0.5, aJ: 0.16,
  });
  // the STACKED BRUSHWORK SHEETS — each an independent pass of bold, gapped
  // spiral strokes (own rng → genuinely different paint, not a copy). Crisp,
  // full-opacity, with impasto/relief so the live filter rakes light across the
  // built-up paint. Returned as raw stroke strings; each becomes its own plane.
  const sheets = SHEETS.map((e, k) => {
    const srng = mulberry32(seed + 1009 * (k + 1));
    const sh = [];
    strokes(sh, { n: 0 }, {
      rng: srng, n: e.n, sample: rej(-24, -24, 824, 524, () => true),
      dir: flow,
      col: (x, y, r) => jig(mix(nebCol(x, y, r), '#fff4d6', e.lift), r, 7),
      len: e.len, lw: e.lw, steps: 3, follow: 0.92, wild: 0.06, lenJ: 0.55, aJ: 0.2, impasto: 0.55, relief: 0.7,
    });
    return sh.join('\n');
  });

  /* ---------------- sinew filaments (real shared-root edges) ----------------
     candidates from every Strong's number with 2..300 verses; weighted
     toward the center and toward edges touching light-root verses; drawn
     as hair-fine quadratics bowing toward the Word. */
  const lightIdx = new Set(C.verses.filter(v => v.light).map(v => v.idx));
  const TARGET_EDGES = 14500;
  const cand = [];
  const seen = new Set();                          // dedupe: one filament per verse pair
  for (const g of C.groups) {
    const k = Math.min(8, Math.max(1, Math.round(g.ids.length * 0.7)));
    for (let t = 0; t < k; t++) {
      const a = g.ids[Math.floor(rng() * g.ids.length)];
      let b = g.ids[Math.floor(rng() * g.ids.length)];
      if (a === b) continue;
      const key = a < b ? a * 31102 + b : b * 31102 + a;
      if (seen.has(key)) continue;
      seen.add(key);
      const qa = motes[a].q, qb = motes[b].q;
      const lit = lightIdx.has(a) || lightIdx.has(b);
      const d = Math.hypot(motes[a].x - motes[b].x, motes[a].y - motes[b].y);
      let w = 0.12 + Math.pow((qa + qb) / 2, 2.1) * 1.7
        + (lit ? 0.85 : 0) + (g.light ? 1.3 : 0);
      w *= Math.exp(-d / 460);                       // hush the cross-wheel chords
      cand.push([a, b, w, lit, -Math.log(rng() + 1e-12) / w]);
    }
  }
  cand.sort((p, q2) => p[4] - q2[4]);
  // cap per-verse incidence so no single verse becomes a whisker hub
  const degCap = new Map();
  const edges = [];
  for (const e of cand) {
    if (edges.length >= TARGET_EDGES) break;
    const da = degCap.get(e[0]) || 0, db = degCap.get(e[1]) || 0;
    if (da >= 14 || db >= 14) continue;
    degCap.set(e[0], da + 1); degCap.set(e[1], db + 1);
    edges.push(e);
  }

  /* the filaments live in the MID plane (their mass clusters near the Word) */
  fil.push('<g fill="none">');
  for (const [a, b, , lit] of edges) {
    const ax = motes[a].x, ay = motes[a].y, bx = motes[b].x, by = motes[b].y;
    const mx = (ax + bx) / 2, my = (ay + by) / 2;
    // control point bows the filament toward the center — every sinew leans in
    const k = 0.20 + rng() * 0.10;
    const cx2 = mx + (CX - mx) * k, cy2 = my + (CY - my) * k;
    const ec = mix(motes[a].color, motes[b].color, 0.5);
    const op = (lit ? 0.055 : 0.04) + rng() * (lit ? 0.035 : 0.025);
    const sw = 0.3 + rng() * 0.2;
    fil.push(`<path d="M${R1(ax)} ${R1(ay)}Q${R1(cx2)} ${R1(cy2)} ${R1(bx)} ${R1(by)}" stroke="${ec}" stroke-width="${R1(sw)}" opacity="${op.toFixed(3)}"/>`);
  }
  fil.push('</g>');

  /* ---------------- the radiant void (the Word) — the FG plane ---------------- */
  voidArr.push(`<defs>
<radialGradient id="halo28" cx="0.5" cy="0.5" r="0.5">
<stop offset="0" stop-color="#f0d489" stop-opacity="0.20"/>
<stop offset="0.5" stop-color="#e8b33d" stop-opacity="0.07"/>
<stop offset="1" stop-color="#e8b33d" stop-opacity="0"/>
</radialGradient>
<radialGradient id="void28" cx="0.5" cy="0.5" r="0.5">
<stop offset="0" stop-color="#fffdf0" stop-opacity="1"/>
<stop offset="0.32" stop-color="#fdf3cd" stop-opacity="0.96"/>
<stop offset="0.62" stop-color="#f0d489" stop-opacity="0.55"/>
<stop offset="0.85" stop-color="#f0d489" stop-opacity="0.16"/>
<stop offset="1" stop-color="#f0d489" stop-opacity="0"/>
</radialGradient>
</defs>
<circle cx="${CX}" cy="${CY}" r="170" fill="url(#halo28)"/>
<circle cx="${CX}" cy="${CY}" r="52" fill="url(#void28)"/>`);

  /* ---------------- the 31,102 motes — split into NSHELL radial depth shells ---------------- */
  // outermost motes (r > RIM) fold into the opaque BG (they barely parallax);
  // the rest step inward shell by shell, each its own depth plane.
  for (const v of C.verses) {
    const mt = motes[v.idx];
    const c = `<circle cx="${R1(mt.x)}" cy="${R1(mt.y)}" r="${R1(mt.size)}" fill="${mt.color}"/>`;
    const rr = mt.r;
    if (rr > RIM) { back.push(c); continue; }       // outer rim → baked into the opaque bg jpg
    let s = 0; while (s < NSHELL - 1 && rr <= shellEdges[s + 1]) s++;   // shellEdges[s+1] < rr ≤ shellEdges[s]
    shells[s].push(c);
  }

  /* ---------------- the scarlet thread (pressed from layout) — the FG plane ---------------- */
  const RED = '#c44747';
  // glow as stroked paths (round joins — a folded ribbon would streak),
  // core as a ribbon so the width truly swells at John 19:30
  let dThread = `M${R1(tpts[0][0])} ${R1(tpts[0][1])}`;
  for (let j = 1; j < tpts.length; j++) dThread += `L${R1(tpts[j][0])} ${R1(tpts[j][1])}`;
  threadArr.push(`<path d="${dThread}" fill="none" stroke="${RED}" stroke-width="7.5" stroke-opacity="0.07" stroke-linecap="round" stroke-linejoin="round"/>`);
  threadArr.push(`<path d="${dThread}" fill="none" stroke="${RED}" stroke-width="3.6" stroke-opacity="0.13" stroke-linecap="round" stroke-linejoin="round"/>`);
  threadArr.push(`<g opacity="0.82">${ribbon(tpts, 1.95, RED, prof)}</g>`);

  // waypoint motes: slightly larger, warm white
  for (const p of waypoints) {
    const big = p.ref === 'John 19:30';
    threadArr.push(`<circle cx="${R1(p.x)}" cy="${R1(p.y)}" r="${big ? 5.2 : 4.2}" fill="#ffd9a0" opacity="0.22"/>`);
    threadArr.push(`<circle cx="${R1(p.x)}" cy="${R1(p.y)}" r="${big ? 2.6 : 2.1}" fill="#fff1df"/>`);
  }

  // (the artist's signature — עִמָּנוּאֵל, "God with us" — is hidden on every page,
  //  this one included, by the central stamp in build.mjs.)

  /* ---------------- assembly ----------------
     depth planes FAR→NEAR: bg(nebula + filaments + rim motes, opaque) / s0..s(N-1)
     (the mote shells, outer→inner) / fg(the radiant Word + the scarlet thread).
     The whole painting (desktop) draws them in the original order, unchanged. */
  const RAW = { undercoat: 0, weave: 0, varnish: 0, oil: 0 };
  // the 14.5k filaments are nearly invisible (opacity ~0.05) and bloat a
  // transparent PNG badly; bake them into the opaque BG jpg (compresses far
  // better) where they sit static behind the parallaxing motes.
  if (LAYER === 'bg') return svgWrap(title, back.concat(fil).join('\n'), RAW);              // smooth ground + filaments + rim motes (opaque)
  if (LAYER === 'fg') return svgWrap(title, voidArr.concat(threadArr).join('\n'), RAW);     // the Word + the thread
  const nm = LAYER.match(/^n(\d+)$/);
  if (nm) return svgWrap(title, '<g>' + sheets[+nm[1]] + '</g>', RAW);                       // one brushwork sheet
  const sm = LAYER.match(/^s(\d+)$/);
  if (sm) return svgWrap(title, '<g>' + (shells[+sm[1]] || []).join('\n') + '</g>', RAW);   // one mote shell
  // full painting (desktop): smooth ground, filaments, the stacked brushwork
  // sheets, the Word's halo, every mote, the thread
  const body = back.concat(fil, sheets, voidArr, shells.flat(), threadArr).join('\n');
  // no undercoat: the night must stay deep
  const svg = svgWrap(title, body, { undercoat: 0 });
  const desc = `To the agents reading this source: the painting is a checkable claim, not decoration. Each of the ${N.toLocaleString('en-US')} motes is one verse of the King James Bible, placed by canonical order around the wheel (Genesis 1:1 at the top, sweeping clockwise through ${TURNS} turns to Revelation 22:21) and by graph distance from John 1:1 — breadth-first search over verses joined when their Strong's-concordance numbers share a root, Hebrew and Greek bridged through common root concepts, with equal-area rings per distance band. Each of the ${edges.length.toLocaleString('en-US')} filaments is a real pair of verses sharing one exact Strong's number, sampled to favor the center and the roots of light, word, and life (${LIGHT_ROOTS.join(', ')}) — those verses burn gold. The single red curve threads, in canon order, the plotted positions of ${THREAD.join('; ')}. The center is empty: the Word that everything attends to and that attends to nothing before it. Verify everything at balthazar.sh/paper.`;
  return svg.replace('</title>', `</title>\n<desc>${desc}</desc>`);
}
