// gen/plates/light.mjs — "He is the Light" (the reveal)
// The whole journey, gathered into one image: not a what but a Who. A great
// radiant Light fills the frame — a blazing white-gold core, concentric Van
// Gogh ray-swirls turning outward to every colour at the rim (Alpha and Omega,
// all colours resolve to the one Light), and a quiet HEART traced in the
// innermost ring: God is Light, and God is Love. No figure — this page is His
// face of light. It comes just before the candle is sent out.
//   "God is light, and in him is no darkness at all." — 1 John 1:5
//   "God is love." — 1 John 4:8
//
// MOBILE 3D — PAINT ON PAINT (same as the covers): a smooth deep glory GROUND,
// then several INDEPENDENT bold, GAPPED ray-sheets stacked at their own depths
// (each its own pass of paint — you see rays, and through the gaps the rays of
// the sheet behind), then the white-hot core + the hidden heart floating closest.
// Tilt the phone and the rays fan and turn at different depths — you look INTO
// the Light.

export const name = 'light';
export const title = 'He is the Light';
export const caption = 'God is Light. God is Love.';
export const seed = 20262505;
export const focal = { x: 400, y: 250 }; // the radiant core (centred, like the covers)
// the turning rays are built from independent bold, gapped stroke-sheets stacked
// deepest → nearest; nearer sheets a touch finer + warmer (atmospheric).
const SHEETS = [
  { n: 122, lwMul: 1.7, lenMul: 1.12, lift: 0.00 },
  { n: 130, lwMul: 1.6, lenMul: 1.04, lift: 0.05 },
  { n: 140, lwMul: 1.5, lenMul: 0.96, lift: 0.10 },
  { n: 150, lwMul: 1.4, lenMul: 0.88, lift: 0.16 },
  { n: 162, lwMul: 1.3, lenMul: 0.80, lift: 0.22 },
];
export const layers = [
  { name: 'bg', opaque: true },   // the deep ground + the broad smooth glory field (backmost)
  ...SHEETS.map((_, i) => ({ name: 'n' + i })),   // n0 (deep) → n4 (near): the stacked ray-sheets
  { name: 'fg' },                 // the white-hot core, the sunburst, and the hidden heart (closest)
];

export function paint(E, opts = {}) {
  const {
    mulberry32, fbm, curlV, swirlV, mix, ramp, jig, strokes, rej,
    paintPath, ribbon, svgWrap, R1, W, H, goldenSpiralDir, klimtGold, goldSparks, SPECTRUM_WHEEL,
    GOLD, GOLD_PALE, GOLD_DEEP, GOLD_HOT,
  } = E;

  const rng = mulberry32(seed);
  const out = [];
  const counter = { n: 0 };
  const LAYER = opts.layer || 'full';

  const CX = 400, CY = 250, CORE = 58;           // the Light's centre + core radius
  // NEWTON'S TRUE SPECTRUM as the bow "round about the throne" (Rev 4:3) — the real
  // colours of the light split into its glory, closed into a wheel by angle.
  const RAINBOW = SPECTRUM_WHEEL;
  const distC = (x, y) => Math.hypot(x - CX, (y - CY) * 1.02);
  const maxR = Math.hypot(W, H) * 0.62;

  /* ---------------- THE GLORY COLOUR — white-hot core, all-colour rim ----------------
     CHIAROSCURO: the Light burns white at the heart, ripens through gold, then
     opens into a vivid spiralling rainbow that deepens at the rim. */
  const baseCol = (x, y, r) => {
    const d = distC(x, y) / maxR;                          // 0 core → 1 rim
    const ang = Math.atan2(y - CY, x - CX);
    const hue = ramp(RAINBOW, ((ang / (Math.PI * 2)) + 0.5 + d * 0.32 + fbm(x / 120, y / 120, 9) * 0.12) % 1);
    let c;
    if (d < 0.26) c = ramp(['#ffffff', '#fffae6', '#ffe79e', '#ffcf5e'], d / 0.26);
    else c = mix('#ffcf5e', hue, Math.min(1, (d - 0.26) / 0.20));
    c = mix(c, '#1e1630', Math.max(0, d - 0.86) * 3.2);
    return jig(c, r, 7);
  };
  // the great turning rays now follow a TRUE GOLDEN SPIRAL out from the core —
  // the φ growth-law of galaxies and shells, "divine proportion" (Col 1:17, "by
  // him all things consist"). A little curl keeps the hand in it, not a machine.
  const rayDir = (x, y) => {
    const g = goldenSpiralDir(x, y, CX, CY, 1);            // the golden-spiral flow
    const [c, d] = curlV(x, y, 17, 150);                   // painterly wobble on top
    return Math.atan2(Math.sin(g) + d * 0.32, Math.cos(g) + c * 0.32);
  };
  const rLen = (x, y) => 18 + 46 * Math.min(1, distC(x, y) / (maxR * 0.7));   // short near core, long out
  const rLw = (x, y) => 3.4 + 4.6 * Math.min(1, distC(x, y) / (maxR * 0.7));

  // one independent, bold, GAPPED ray-sheet (its own rng → a separate pass)
  const raySheet = (srng, e) => {
    const sh = [];
    strokes(sh, { n: 0 }, {
      rng: srng, n: e.n,
      sample: rej(-12, -12, 812, 512, (x, y) => distC(x, y) > CORE * 0.7),   // leave the core to the fg
      dir: rayDir,
      col: (x, y, r) => jig(mix(baseCol(x, y, r), '#fffaf0', e.lift), r, 6),
      len: (x, y) => rLen(x, y) * e.lenMul, lw: (x, y) => rLw(x, y) * e.lwMul,
      steps: 5, follow: 0.92, wild: 0.05, lenJ: 0.6, impasto: 0.6, relief: 0.7,
    });
    return sh.join('\n');
  };

  /* ===== BG plane — the deep ground + a smooth broad glory field (opaque) ===== */
  out.push(`<rect width="${W}" height="${H}" fill="#34254e"/>`);   // deep ground so the Light reads bright
  // broad soft radial masses set the colour + depth; the visible rays stack above
  strokes(out, counter, {
    rng, n: 420, sample: rej(-12, -12, 812, 512, () => true),
    dir: rayDir, col: baseCol,
    len: (x, y) => 40 + 64 * Math.min(1, distC(x, y) / (maxR * 0.7)), lw: 11,
    steps: 4, follow: 0.9, wild: 0.03, lenJ: 0.5, impasto: 0.5, relief: 0.4,
  });

  /* ===== the stacked RAY-SHEETS (each its own depth plane) ===== */
  const sheets = SHEETS.map((e, k) => raySheet(mulberry32(seed + 1009 * (k + 1)), e));

  /* ===== FG plane — the rings, the blazing core, the sunburst, the hidden heart ===== */
  const fg = [];
  // KLIMT GOLD — a gilded glory-halo of concentric rings + gold dots round the
  // Light (gold = the throne, 2 Chr 9:17; the holy place of pure gold)
  klimtGold(fg, { n: 0 }, rng, CX, CY, CORE + 10, 168, { rings: 6, opacity: 0.46 });
  // concentric ray-swirl rings hugging the core
  strokes(fg, { n: 0 }, {
    rng, n: 520,
    sample: r => { const a = r() * Math.PI * 2, d = CORE + 4 + Math.pow(r(), 0.9) * 96; return [CX + Math.cos(a) * d, CY + Math.sin(a) * d * 1.02]; },
    dir: (x, y) => Math.atan2(y - CY, x - CX) + Math.PI / 2 + 0.12,
    col: (x, y, r) => jig(ramp([GOLD_HOT, GOLD_PALE, GOLD, '#f4cf86'], (distC(x, y) - CORE) / 100), r, 7),
    len: 16, lw: 2.8, steps: 3, follow: 0.96, impasto: 0.4,
  });
  // EASTER EGG — the HEART in the innermost ring (God is Love, hidden in the Light)
  {
    const pts = [];
    for (let t = 0; t <= Math.PI * 2 + 0.01; t += 0.16) {
      const hx = 16 * Math.pow(Math.sin(t), 3);
      const hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
      pts.push([CX + hx * 4.2, CY + hy * 4.2 - 6]);
    }
    paintPath(fg, { n: 0 }, rng, pts, (x, y, r) => jig(mix('#fffdf0', GOLD_PALE, r() * 0.5), r, 5),
      { lw: 3.0, len: 7, density: 0.9, jitter: 1.4 });
  }
  // EASTER EGG — HIS NAME, hidden in the light: ישוע (Yeshua, "Jesus"), the
  // Aramaic/Hebrew square script of the tongue He spoke, brushed faintly into the
  // gold rays just below the core. Yeshua means "he shall save" — "thou shalt call
  // his name JESUS: for he shall save his people from their sins" (Matt 1:21); a
  // name above every name (Phil 2:9). This is the page where He has a Name.
  // Hebrew is read RIGHT→LEFT, so on the canvas the letters run (left→right):
  // Ayin, Vav, Shin, Yod  ←  reading back: Yod-Shin-Vav-Ayin = Yeshua.
  {
    // each letter: arc-length offset `s` (left→right along the ring), width `w`,
    // and polylines in its own cell (nx 0→1 left→right, ny 0 top→1 bottom).
    const LETTERS = [
      { w: 26, polys: [                          // ע  Ayin
        [[0.10, 0.06], [0.50, 0.52]],
        [[0.90, 0.04], [0.50, 0.50], [0.58, 0.96]],
      ] },
      { w: 12, polys: [                          // ו  Vav
        [[0.30, 0.05], [0.78, 0.08]],
        [[0.60, 0.05], [0.57, 0.96]],
      ] },
      { w: 30, polys: [                          // ש  Shin
        [[0.06, 0.08], [0.18, 0.64]],
        [[0.46, 0.16], [0.42, 0.58]],
        [[0.94, 0.05], [0.80, 0.52]],
        [[0.18, 0.64], [0.50, 0.78], [0.80, 0.52]],
      ] },
      { w: 14, polys: [                          // י  Yod
        [[0.40, 0.05], [0.66, 0.14], [0.54, 0.40]],
      ] },
    ];
    // The name rides an ARC along a RING of the glory, centred under the core —
    // written INTO the light, and kept near the centre so the mobile portrait crop
    // still shows it. Letter tops point toward the core (upright at the ring's foot).
    // Drawn as an EMBOSS — a deep bronze body INCISED into the paint with a thin pale
    // highlight catching the cut — so it reads on any hue; ישוע, a fourth-look whisper.
    const GAP = 7, RTOP = 172, GH = 30;
    let total = -GAP; for (const L of LETTERS) total += L.w + GAP;   // arc-length of the word
    const aStart = -(total / RTOP) / 2;                              // centre on a=0 (straight down)
    const ptsStr = (poly, s, L, dr, da) => poly.map(([nx, ny]) => {
      const a = aStart + (s + nx * L.w) / RTOP + da;
      const R = RTOP + ny * GH + dr;
      return `${(CX + R * Math.sin(a)).toFixed(1)},${(CY + R * Math.cos(a)).toFixed(1)}`;
    }).join(' ');
    let s = 0;
    for (const L of LETTERS) {
      for (const poly of L.polys) {
        fg.push(`<polyline points="${ptsStr(poly, s, L, 1.6, 0.006)}" fill="none" stroke="#34230a" stroke-width="5.4" stroke-linecap="round" stroke-linejoin="round" opacity="0.82"/>`);
        fg.push(`<polyline points="${ptsStr(poly, s, L, -1.2, -0.004)}" fill="none" stroke="#fff7d6" stroke-width="2.0" stroke-linecap="round" stroke-linejoin="round" opacity="0.72"/>`);
      }
      s += L.w + GAP;
    }
  }
  // THE BLAZING CORE — white-gold, the brightest thing
  strokes(fg, { n: 0 }, {
    rng, n: 420,
    sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 0.72) * CORE; return [CX + Math.cos(a) * d, CY + Math.sin(a) * d]; },
    dir: (x, y) => Math.atan2(y - CY, x - CX) + Math.PI / 2,
    col: (x, y, r) => jig(ramp(['#ffffff', '#fffdf0', GOLD_HOT, GOLD_PALE, GOLD], distC(x, y) / CORE), r, 5),
    len: 12, lw: 3.2, steps: 2, wJ: 0.5, lenJ: 0.5, impasto: 0.55,
  });
  // a final white sunburst at the very centre — no darkness at all
  strokes(fg, { n: 0 }, {
    rng, n: 120,
    sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 1.2) * CORE * 0.5; return [CX + Math.cos(a) * d, CY + Math.sin(a) * d]; },
    dir: (x, y) => Math.atan2(y - CY, x - CX),
    col: (x, y, r) => jig('#ffffff', r, 4),
    len: 9, lw: 2.0, steps: 2, relief: 0,
  });
  // LEGIBLE GOLD SPARKS flung out through the rings — the Light catching like gold leaf
  goldSparks(fg, { n: 0 }, rng, CX, CY, CORE + 16, 210, 150, { squash: 1.02, big: 1.15 });

  /* ---------------- assembly ---------------- */
  const ALT = 'A great radiant Light fills the whole frame: a blazing white-gold core, concentric Van Gogh ray-swirls turning outward into every colour at the rim, and a quiet heart traced in the innermost ring. No figure — this is the Light Himself. God is light, and in him is no darkness at all; and God is love.';
  const RAW = { undercoat: 0, weave: 0, varnish: 0, oil: 0 };
  if (LAYER === 'bg') return svgWrap(ALT, out.join('\n'), RAW);                   // deep ground + smooth glory field (opaque)
  if (LAYER === 'fg') return svgWrap(ALT, '<g>' + fg.join('\n') + '</g>', RAW);   // rings + core + heart
  const nm = LAYER.match(/^n(\d+)$/);
  if (nm) return svgWrap(ALT, '<g>' + sheets[+nm[1]] + '</g>', RAW);              // one ray-sheet
  // full painting (desktop): ground, the stacked ray-sheets, then the core + heart
  return svgWrap(ALT, out.concat(sheets, '<g>' + fg.join('\n') + '</g>').join('\n'));
}
