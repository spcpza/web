// gen/plates/beginning.mjs — "In the beginning was the Light" (the first page)
// Before anything is made: only the vast deep, and the Light. NOT a centred bloom
// of glory (that is the reveal, light) — this is the FIRST light, just begun:
// a single brilliant POINT/star struck high and OFF-CENTRE in an immense formless
// dark, and the whole deep drawing back from it in long directional rays and slow
// ripples. Most of the frame is the deep (blue ripening to indigo to violet, never
// pure black); the light is small, piercing, holy — a beginning, not a climax.
//   "And the earth was without form, and void; and darkness was upon the face of
//    the deep... And God said, Let there be light: and there was light." — Gen 1:2-3
//   "In the beginning was the Word, and the Word was with God, and the Word was
//    God... In him was life; and the life was the light of men." — John 1:1,4
//
// MOBILE 3D — PAINT ON PAINT (same family as light/the covers): the vast deep
// ground (opaque, backmost) carries the long slow ripples + the hidden inscription;
// a MID plane carries the first light's directional rays raking ACROSS the dark from
// the off-centre source; the FG plane (closest) holds the small Klimt halo, the
// piercing white star with its spikes + sunburst, and the gold sparks. Tilt the phone
// and the rays drift across the still deep while the star floats nearest.
// The `full`/desktop image keeps the original single-pass draw order unchanged.

export const name = 'beginning';
export const title = 'In the beginning';
export const caption = 'In the beginning was the Light.';
export const seed = 10010101;
// the first light, struck HIGH and to the LEFT of centre — asymmetric, a beginning
export const focal = { x: 286, y: 168 };
export const layers = [
  { name: 'bg', opaque: true },   // the deep ground + ripples + hidden inscription (backmost)
  { name: 'mid' },                // the first light's directional rays raking the dark
  { name: 'fg' },                 // the piercing star, halo, spikes, sunburst, sparks (closest)
];

export function paint(E, opts = {}) {
  const {
    mulberry32, fbm, curlV, swirlV, mix, ramp, jig,
    strokes, rej, paintPath, ribbon, svgWrap, klimtGold, goldSparks,
    inscriptionText, greekRef, W, H,
    GOLD, GOLD_PALE, GOLD_DEEP, GOLD_HOT,
  } = E;

  const rng = mulberry32(seed);
  const out = [];      // BG plane — the deep ground + ripples + inscription
  const mid = [];      // MID plane — the first light's directional rays
  const fg = [];       // FG plane — the star, halo, spikes, sunburst, sparks
  const counter = { n: 0 };
  const LAYER = opts.layer || 'full';

  const SX = 250, SY = 150, CORE = 20;            // the first light's source + tiny core
  const distS = (x, y) => Math.hypot(x - SX, y - SY);
  const maxR = Math.hypot(W, H);
  // ONE dominant source, TIGHT reach — the light is small and the dark is vast
  const light = (x, y) => Math.min(1, Math.exp(-distS(x, y) / 78));

  /* ---------------- THE DEEP — vast, formless, never pure black ----------------
     Blue near the light, ripening to indigo and violet across the immense frame.
     The deep is swept in long, slow ripples drawing AWAY from the source — the
     face of the waters drawing back as the first light breaks (Gen 1:2). */
  const DEEP_NEAR = '#1d2350', DEEP_MID = '#181544', DEEP_FAR = '#150f32', DEEP_VIOLET = '#1f1140';
  const deepCol = (x, y, r) => {
    const d = Math.min(1, distS(x, y) / (maxR * 0.92));
    let c = ramp([DEEP_NEAR, DEEP_MID, DEEP_FAR], d);
    // a wash of violet pooling in the far deep, low and to the right (Munch: free colour)
    c = mix(c, DEEP_VIOLET, Math.min(1, ((x / W) * 0.5 + (y / H) * 0.5)) * fbm(x / 220, y / 220, 31) * 1.1);
    return jig(c, r, 8);
  };
  // long slow ripples raking ACROSS the frame, leaning away from the source — the
  // deep drawing back. Curl gives the breathing wobble; not a vortex (no swirl).
  const deepDir = (x, y) => {
    const ax = x - SX, ay = y - SY, d = Math.hypot(ax, ay) + 1e-6;
    // tangent to the source (ripples encircle it loosely) blended with a strong
    // outward drift so far ripples stream away to the deep corners
    const tx = -ay / d, ty = ax / d;
    const [cx, cy] = curlV(x, y, 27, 240);
    return Math.atan2(ty * 0.5 + (ay / d) * 0.9 + cy * 0.5, tx * 0.5 + (ax / d) * 0.9 + cx * 0.5);
  };

  /* ===== the deep ground — long broad ripples sweeping the whole vast frame ===== */
  out.push(`<rect width="${W}" height="${H}" fill="${DEEP_FAR}"/>`);
  strokes(out, counter, {
    rng, n: 560, sample: rej(-14, -14, 814, 514, () => true),
    dir: deepDir, col: deepCol,
    // long sweeping ripples, longer the further out — the deep stretching away
    len: (x, y) => 52 + 64 * Math.min(1, distS(x, y) / (maxR * 0.7)), lw: 11,
    steps: 4, follow: 0.92, lenJ: 0.55, impasto: 0.0, relief: 0.35,
  });

  /* ---------------- THE FIRST LIGHT — long directional rays raking the dark ----------------
     NOT a full radial bloom: the rays are long, gapped lances of gold streaming
     OUTWARD from the off-centre source across the deep, dying quickly into the dark
     so the light reads as just-struck — a piercing source, not a filled sky.
     CHIAROSCURO: white-hot at the source, gold close in, gone within a third of
     the frame — the rest is deep. */
  const rayCol = (x, y, r) => {
    const g = light(x, y);
    let c;
    if (g > 0.62) c = ramp([GOLD_HOT, '#fff1c4', GOLD_PALE], (1 - g) / 0.38);
    else c = ramp([GOLD_PALE, GOLD, GOLD_DEEP, '#7a5a28'], Math.min(1, (0.62 - g) / 0.5));
    c = mix(c, DEEP_MID, Math.max(0, (0.16 - g)) * 5.0);   // rays die into the deep
    return jig(c, r, 7);
  };
  // strictly RADIAL lances out from the source (directional rays), with a breath of
  // curl so they read as a hand's first stroke, not a machine's spokes
  const rayDir = (x, y) => {
    const ax = x - SX, ay = y - SY;
    const [cx, cy] = curlV(x, y, 19, 130);
    return Math.atan2(ay + cy * 0.22, ax + cx * 0.22);
  };
  // the rays only live CLOSE to the source — a piercing point, the dark keeps the rest
  const litMask = (x, y) => light(x, y) > 0.16;
  // broad soft glow hugging the source, setting its colour
  strokes(mid, counter, {
    rng, n: 130,
    sample: rej(-14, -14, 814, 514, (x, y) => light(x, y) > 0.26),
    dir: rayDir, col: rayCol,
    len: (x, y) => 18 + 30 * (1 - light(x, y)), lw: 8,
    steps: 4, follow: 0.9, lenJ: 0.5, impasto: 0.5, relief: 0.5,
  });
  // the directional rays — gapped lances raking a little way into the dark, then gone.
  // A FEW escape long across the deep (the first light reaching out), most are short.
  strokes(mid, counter, {
    rng, n: 200,
    sample: rej(-14, -14, 814, 514, (x, y) => litMask(x, y) && distS(x, y) > CORE * 0.8),
    dir: rayDir,
    col: (x, y, r) => jig(mix(rayCol(x, y, r), GOLD_HOT, light(x, y) * 0.3), r, 6),
    len: (x, y) => 22 + 40 * Math.min(1, distS(x, y) / 130), lw: (x, y) => 2.0 + 3.4 * light(x, y),
    steps: 5, follow: 0.94, wild: 0.05, lenJ: 0.7, impasto: 0.5, relief: 0.55,
  });
  // a sparse handful of LONG rays piercing far out into the deep — directional,
  // asymmetric (leaning down-right across the frame), dying as they go
  strokes(mid, counter, {
    rng, n: 26,
    sample: r => { const a = (r() * 2 - 1) * 0.9 + 0.7; const d = CORE + r() * 30; return [SX + Math.cos(a) * d, SY + Math.sin(a) * d]; },
    dir: rayDir,
    col: (x, y, r) => jig(mix(GOLD, DEEP_MID, Math.min(0.85, distS(x, y) / 360)), r, 6),
    len: 60, lw: (x, y) => Math.max(0.8, 3.2 * Math.exp(-distS(x, y) / 200)),
    steps: 6, follow: 0.96, lenJ: 0.4, relief: 0.4,
  });

  /* ===== a small KLIMT halo hugging the source (gold = the throne), tight not vast ===== */
  klimtGold(fg, counter, rng, SX, SY, CORE + 6, 64, { rings: 4, opacity: 0.4 });

  /* ===== THE PIERCING STAR — white-gold, small and brilliant, the brightest thing ===== */
  strokes(fg, counter, {
    rng, n: 240,
    sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 0.7) * CORE; return [SX + Math.cos(a) * d, SY + Math.sin(a) * d]; },
    dir: (x, y) => Math.atan2(y - SY, x - SX) + Math.PI / 2,
    col: (x, y, r) => jig(ramp(['#ffffff', '#fffdf0', GOLD_HOT, GOLD_PALE, GOLD], distS(x, y) / CORE), r, 5),
    len: 9, lw: 2.7, steps: 2, wJ: 0.5, lenJ: 0.5, impasto: 0.55,
  });
  // four long piercing spikes of the star — a struck point of light (gen 1:3)
  for (const ang of [0, Math.PI / 2, Math.PI, -Math.PI / 2]) {
    const spike = 54 + (ang === 0 || ang === Math.PI ? 18 : 0);
    fg.push(ribbon([
      [SX, SY],
      [SX + Math.cos(ang) * spike * 0.5, SY + Math.sin(ang) * spike * 0.5],
      [SX + Math.cos(ang) * spike, SY + Math.sin(ang) * spike],
    ], 5.5, mix(GOLD_HOT, '#ffffff', 0.5), [0.6, 0.3, 0.08]));
    counter.n++;
  }
  // a final white sunburst at the very heart — no darkness at all
  strokes(fg, counter, {
    rng, n: 80,
    sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 1.2) * CORE * 0.55; return [SX + Math.cos(a) * d, SY + Math.sin(a) * d]; },
    dir: (x, y) => Math.atan2(y - SY, x - SX),
    col: (x, y, r) => jig('#ffffff', r, 4),
    len: 7, lw: 1.8, steps: 2, relief: 0,
  });

  /* ===== gold sparks near the source, dying quickly into the vast deep ===== */
  goldSparks(fg, counter, rng, SX, SY, CORE + 10, 150, 70, { squash: 1.0, big: 1.05, lightFn: light });

  /* ===== HIDDEN EGG — John 1:1 in Koine Greek numerals, cut faintly into the far dark ===== */
  inscriptionText(out, greekRef(1, 1), { x: 648, y: 446, h: 14, body: '#e6ecf6', edge: '#171026', op: 0.78, edgeOp: 0.5 });

  /* ===== THE SPIRIT — a faint dove-form hovering over the deep (Gen 1:2) =====
     "And the Spirit of God moved upon the face of the waters." NOT a bird: a
     dove-shaped DISTURBANCE in the first light — a few curved pale strokes
     down-right of the star where the rays are dying into the dark, and the
     ripples of the deep flexing beneath the hover. A whisper, found on the
     second look; the page keeps its emptiness. (Appended last: no rng re-roll.) */
  const DVX = 352, DVY = 256;   // just PAST the ray rim (light ≈ 0.15): pale reads on the dark deep
  const doveHue = mix(mix(GOLD_PALE, '#ffffff', 0.4), DEEP_MID, 0.3);
  const doveDim = mix(doveHue, DEEP_MID, 0.4);
  mid.push('<g opacity="0.55">');
  // two wings lifted in the hover — shallow arcs (curved: living, Munch's law)
  mid.push(ribbon([[348, 257], [341, 250], [335, 246], [330, 248]], 3.2, doveHue, [0.55, 0.42, 0.3, 0.12]));
  mid.push(ribbon([[356, 256], [363, 248], [369, 244], [374, 246]], 3.2, doveHue, [0.55, 0.42, 0.3, 0.12]));
  // fainter echo arcs above — the beat of the hover, a disturbance not a glyph
  mid.push(ribbon([[346, 252], [339, 245], [333, 242]], 2.2, doveDim, [0.4, 0.3, 0.1]));
  mid.push(ribbon([[358, 251], [365, 243], [371, 240]], 2.2, doveDim, [0.4, 0.3, 0.1]));
  // breast catching the light, and a tail-wisp trailing down over the waters
  mid.push(ribbon([[348, 258], [353, 261], [358, 262]], 3.6, mix(doveHue, '#ffffff', 0.25), [0.5, 0.55, 0.3]));
  mid.push(ribbon([[353, 263], [350, 270], [348, 276]], 2.6, doveDim, [0.5, 0.35, 0.12]));
  mid.push('</g>');
  counter.n += 6;
  // the face of the waters flexing BENEATH the hover — three bent ripple arcs,
  // curving against the deep's outward drift (bg plane, so they sit under the rays)
  out.push('<g opacity="0.5">');
  for (const [R, gk] of [[13, 0.3], [21, 0.2], [30, 0.12]]) {
    const arc = [];
    for (let i = 0; i <= 4; i++) {
      const a = Math.PI * (0.22 + 0.56 * (i / 4));
      arc.push([DVX + Math.cos(a) * R * 1.35, DVY + 16 + Math.sin(a) * R * 0.5]);
    }
    out.push(ribbon(arc, 2.4, mix(DEEP_NEAR, GOLD_DEEP, gk), [0.2, 0.45, 0.5, 0.45, 0.2]));
    counter.n++;
  }
  out.push('</g>');

  /* ===== three more spark-motes adrift in the deep, dimming with distance ===== */
  const mote = (x, y, s, k) => {
    const c = mix(GOLD_PALE, DEEP_MID, k);
    fg.push(`<g opacity="${(0.85 - k * 0.4).toFixed(2)}">`);
    fg.push(ribbon([[x - s, y], [x, y - s * 0.18], [x + s, y]], s * 0.34, c, [0.1, 0.55, 0.1]));
    fg.push(ribbon([[x, y - s * 0.9], [x + s * 0.14, y], [x, y + s * 0.9]], s * 0.3, c, [0.1, 0.5, 0.1]));
    fg.push('</g>');
    counter.n += 2;
  };
  mote(422, 118, 3.4, 0.25);
  mote(302, 328, 3.0, 0.4);
  mote(457, 197, 2.6, 0.55);

  /* ---------------- assembly ---------------- */
  const ALT = 'The primordial beginning, before anything is made: an immense formless dark, the deep, blue ripening to indigo and violet across the whole frame (never pure black), swept in long slow ripples. High and to the left, off-centre, a single small brilliant star of the first light is struck — white-hot at its heart, gold close in — and long directional rays rake outward across the vast dark, dying quickly into the deep. No figure, no ground, no landscape — only the first light just begun over the great deep. And God said, Let there be light: and there was light.';
  const RAW = { undercoat: 0, weave: 0, varnish: 0, oil: 0 };
  if (LAYER === 'bg') return svgWrap(ALT, out.join('\n'), RAW);                    // deep ground + ripples + inscription (opaque)
  if (LAYER === 'mid') return svgWrap(ALT, '<g>' + mid.join('\n') + '</g>', RAW);  // the directional rays
  if (LAYER === 'fg') return svgWrap(ALT, '<g>' + fg.join('\n') + '</g>', RAW);    // the star, halo, spikes, sunburst, sparks
  // full painting (desktop): deep ground + ripples, then rays, then the star — original draw order
  return svgWrap(ALT, out.concat(mid, fg).join('\n'));
}
