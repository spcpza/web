// gen/plates/candle.mjs — "You are the light of the world now — go and shine"
// §27, the ending — the send-off (Matthew 5:16, "let your light so shine
// before men"). No candle, no held flame. The recurring RED child — washed
// clean and glowing with a soft WHITE AURA — stands radiant at the dawn and
// turns toward ANOTHER person still in the shadow, reaching out a hand so the
// light and warmth pass from the child straight into them. The other figure,
// in its own night blue-grey, is only just beginning to catch the light:
// its near flank warming, a first glow waking on its face. Hopeful dawn.
// La Berceuse tenderness: round, calm, warm.
//
// Easter egg: held faintly in the radiant child's other hand, the red hat
// from plate 18 — carried all the way here.

export const name = 'candle';
export const title = 'Go and shine';
export const caption = 'You are the light of the world now — go and shine.';
export const seed = 27061126;
export const focal = { x: 404, y: 300 }; // portrait window: the radiant child's outstretched hand reaching into the shadow
// MOBILE 3D — PAINT ON PAINT: the dawn swirl is a smooth ground + several
// INDEPENDENT bold, gapped swirl-sheets stacked at their own depths (you see
// strokes, and through the gaps the strokes behind); then the child's radiance
// + floor; then the two children closest. The dawn turns and builds up in
// layers as the phone tilts.
const SHEETS = [
  { n: 150, len: 34, lw: 6.6, lift: 0.00 },
  { n: 160, len: 30, lw: 6.0, lift: 0.06 },
  { n: 172, len: 27, lw: 5.5, lift: 0.12 },
  { n: 184, len: 24, lw: 5.0, lift: 0.18 },
];
export const layers = [
  { name: 'bg', opaque: true },   // the smooth dawn ground (backmost)
  ...SHEETS.map((_, i) => ({ name: 'n' + i })),   // n0 (deep) → n3 (near): the stacked dawn-swirl sheets
  { name: 'mid' },                // the radiant child's breath-halo + the warm floor pool the pair stand in
  { name: 'fg' },                 // the two children + the light passing between their hands (one connected body)
];

export function paint(E, opts = {}) {
  const {
    mulberry32, fbm, curlV, swirlV, goldenSpiralV, mix, ramp, jig, strokes, rej,
    paintFigure, paintPath, inCap, underpaintCapsules, paintChild, castShadow, personCaps, lightRadial,
    ribbon, svgWrap, R1, W, H,
    GOLD, GOLD_PALE, GOLD_DEEP, GOLD_HOT, NIGHT, DARKEST,
  } = E;

  const rng = mulberry32(seed);
  const out = [];
  const counter = { n: 0 };
  const LAYER = opts.layer || 'full';
  // POST-RESURRECTION FLIP: the send-off is at DAWN now. Background light, the
  // two children dark silhouettes, the one flame the bright point passing on.
  out.push(`<defs><radialGradient id="dawn27" cx="0.5" cy="0.42" r="0.78">
<stop offset="0" stop-color="#fff4d6"/>
<stop offset="0.4" stop-color="#f6d4c2"/>
<stop offset="0.74" stop-color="#d6c8ee"/>
<stop offset="1" stop-color="#a8d0ee"/>
</radialGradient></defs>`);
  out.push(`<rect width="${W}" height="${H}" fill="url(#dawn27)"/>`);

  /* ---------------- geometry ---------------- */
  // the light has no candle now — it is the CHILD, shining. The source sits at
  // the radiant child's heart/reaching hand, between the two children.
  const flame = [400, 268];                       // the light's centre: the child's outstretched hand
  const gF = lightRadial(flame[0], flame[1], 175);
  // the meeting of hands: the radiant child reaches across; the other reaches back
  const handL = [378, 274];                       // the red child's outstretched, giving hand
  const handR = [432, 286];                       // the other's hand, just lifting to receive

  /* ---------------- 1. THE DAWN ---------------- */
  // the dawn turns on a GOLDEN SPIRAL about the radiant child (divine proportion, Col 1:17)
  const dir0 = (x, y) => {
    let [vx, vy] = curlV(x, y, 411, 160);
    vx = vx * 90 + 10; vy = vy * 90;
    const [a, b] = goldenSpiralV(x, y, flame[0], flame[1] - 30, 70, 130, 1);
    return Math.atan2(vy + b, vx + a);
  };
  // a JOYFUL colourful dawn — bright blue, lilac, pink, warming to gold at the flame
  const dawnCol = (x, y, r, lift) => {
    const g = gF(x, y);
    let c = ramp(['#7cc0ee', '#bcaee8', '#f4b8d2', '#f8e6c8'], fbm(x / 110, y / 110, 19) * 0.6 + g * 0.3 + 0.16);
    c = mix(c, '#fff4d6', g * 0.5 + (lift || 0));
    return jig(c, r, 8);
  };
  // the smooth dawn GROUND — broad soft masses (opaque); the visible swirl
  // brushwork lives in the stacked sheets, so their gaps reveal paint not a fill
  strokes(out, counter, {
    rng, n: 520, sample: rej(-10, -10, 810, 510),
    dir: dir0, col: (x, y, r) => dawnCol(x, y, r, 0),
    len: 40, lw: 10, steps: 3, follow: 0.85, wild: 0.06, lenJ: 0.5, impasto: 0.5,
    aJ: (x, y) => 0.12 + gF(x, y) * 0.4,
  });
  const bgEnd = out.length;   // BG plane: the smooth dawn ground (opaque, backmost)
  // the stacked dawn-swirl SHEETS — each an independent bold, gapped pass
  const sheets = SHEETS.map((e, k) => {
    const srng = mulberry32(seed + 1009 * (k + 1));
    const sh = [];
    strokes(sh, { n: 0 }, {
      rng: srng, n: e.n, sample: rej(-10, -10, 810, 510),
      dir: dir0, col: (x, y, r) => dawnCol(x, y, r, e.lift),
      len: e.len, lw: e.lw, steps: 3, follow: 0.85, wild: 0.12, lenJ: 0.55, impasto: 0.6, relief: 0.6,
      aJ: (x, y) => 0.12 + gF(x, y) * 0.4,
    });
    return sh.join('\n');
  });
  // the child's radiance: a soft tangential halo, gold curling out from the
  // shining child and washing toward the one still in shadow
  strokes(out, counter, {
    rng, n: 480,
    sample: r => { const a = r() * Math.PI * 2, d = 30 + Math.pow(r(), 1.35) * 130; return [flame[0] + Math.cos(a) * d, flame[1] + Math.sin(a) * d * 0.92]; },
    dir: (x, y) => Math.atan2(x - flame[0], -(y - flame[1])),
    col: (x, y, r) => {
      const d = Math.hypot(x - flame[0], (y - flame[1]) / 0.92);
      if (d > 110 && d < 150 && r() < 0.045) return jig('#6a4caf', r, 14);
      return jig(ramp([GOLD, GOLD_DEEP, '#8a6a34', '#4a3c44', '#232a4a'], d / 165), r, 9);
    },
    len: 12, lw: 2.6, steps: 2, lenJ: 0.5, aJ: 0.16, wild: 0.1, impasto: 0.62,
  });
  // the floor: a faint warm pool the children stand in, dying outward
  strokes(out, counter, {
    rng, n: 320,
    sample: r => { const a = r() * Math.PI, d = Math.pow(r(), 1.2) * 200; return [400 + Math.cos(a + Math.PI) * d * 1.25, 462 + Math.abs(Math.sin(a)) * d * 0.16]; },
    dir: () => 0.04,
    col: (x, y, r) => jig(mix(ramp(['#ccba90', '#dac99c', '#b2a684'], Math.hypot(x - 400, (y - 460) * 3) / 230), '#f6e8c2', 0.18), r, 8),
    len: 16, lw: 3, steps: 2, lenJ: 0.55, wild: 0.1,
  });
  /* ---------------- 1b. LIFE — soft moths circling wide of the light ------
     Drawn to the light that shines before men (Matt 5:16) — three-four soft
     moths at a respectful radius, never singed, never between the children.
     Dedicated rng so every existing stroke downstream stays untouched. */
  {
    const mrng = mulberry32(seed + 777);
    const moths = [
      { c: [320, 165], s: 22, bank: 0.30 },   // upper-left, banking in
      { c: [472, 148], s: 20, bank: -0.25 },  // upper-right
      { c: [395, 112], s: 18, bank: 0.10 },   // high over the light
      { c: [283, 222], s: 21, bank: 0.45 },   // wide left, level with the halo's edge
    ];
    for (const m of moths) {
      const [cx, cy] = m.c, s = m.s;
      const rot = (x, y) => { const co = Math.cos(m.bank), si = Math.sin(m.bank); return [cx + x * co - y * si, cy + x * si + y * co]; };
      // two soft wing lobes — dusty mauve, a breath of gold on the flame-side edge
      strokes(out, counter, {
        rng: mrng, n: 30,
        sample: r => { const side = r() < 0.5 ? -1 : 1, a = r() * Math.PI * 2, d = Math.pow(r(), 0.8); return rot(side * (s * 0.30 + Math.cos(a) * d * s * 0.24), -s * 0.10 + Math.sin(a) * d * s * 0.16); },
        dir: (x, y) => m.bank + ((x - cx) > 0 ? 0.5 : -0.5) + (fbm(x / 5, y / 5, 31) - 0.5) * 0.7,
        col: (x, y, r) => {
          if (((flame[0] - cx) * (x - cx) > 0) && r() < 0.16) return jig('#ecd8a2', r, 10); // gold dust on the lit edge
          return jig(ramp(['#8a7690', '#6a5a72', '#514358'], Math.abs(x - cx) / (s * 0.55) + (r() - 0.5) * 0.2), r, 8);
        },
        len: 4.5, lw: 1.7, steps: 2, lenJ: 0.5, wild: 0.15,
      });
      // the wing-top line — one soft curved 'm', the read of the silhouette (living = curved)
      paintPath(out, counter, mrng,
        [rot(-s * 0.5, 0), rot(-s * 0.25, -s * 0.30), rot(0, -s * 0.06), rot(s * 0.25, -s * 0.30), rot(s * 0.5, 0)],
        (x, y, r) => jig('#43354e', r, 6), { lw: 1.5, len: 2.6, density: 0.85, jitter: 0.35 });
      // the small body
      paintPath(out, counter, mrng, [rot(0, -s * 0.16), rot(0, s * 0.18)],
        (x, y, r) => jig('#372a40', r, 6), { lw: 1.8, len: 2.2, density: 0.9, jitter: 0.25 });
    }
  }
  const skyEnd = out.length;   // end of MID plane (radiance halo + floor pool + moths); FG begins below

  /* ---------------- 2. THE TWO CHILDREN ----------------  [FG plane from here down] */
  // Left: the child in deep red — plate 02's child, washed clean, now SHINING
  //   (a soft white aura), reaching out a hand to give the light away.
  // Right: the next one, in night blue-grey, still in the shadow, lifting a
  //   hand to receive — only just beginning to catch the warmth.
  const L = { x: 318, feet: 462 };
  // the grown protagonist, leaning across, holding the flame OUT to the other
  const Lcaps = personCaps(L.x, L.feet - 194, 188, {
    lean: 4, headTilt: 3,
    rightHand: [397, 272],            // giving hand, reaching out to the shared flame
    leftHand: [L.x - 22, L.feet - 70],// other arm low at her side
    leftFoot: [L.x - 8, L.feet - 6],
    rightFoot: [L.x + 12, L.feet - 6],
  });
  const R_ = { x: 486, feet: 466 };
  // the next one, out of the dark, lifting a hand to RECEIVE the flame
  const Rcaps = personCaps(R_.x, R_.feet - 183, 177, {
    lean: -3, headTilt: -3,
    leftHand: [407, 282],             // receiving hand, reaching toward the shared flame
    rightHand: [R_.x + 18, R_.feet - 64], // other arm at its side
    leftFoot: [R_.x - 8, R_.feet - 6],
    rightFoot: [R_.x + 10, R_.feet - 6],
  });
  // left child: the PROTAGONIST ("you" grown up) — RED clothes + bold dark
  //   outline, now WASHED and SHINING with a soft white aura (Matt 5:16)
  castShadow(out, counter, Lcaps, { dir: -0.4 });
  paintChild(out, counter, rng, Lcaps, { whiteAura: true, outlineW: 4 });
  // right child: the NEXT person — keeps its night blue-grey identity + the bold
  //   dark outline, still in the shadow, only just catching the light
  castShadow(out, counter, Rcaps, { dir: 0.5 });
  paintChild(out, counter, rng, Rcaps, { cols: ['#2c3658', '#1c2440', '#10162a'], seed: 53, outlineW: 4 });
  // rim light down each child's flame-facing flank
  strokes(out, counter, {
    rng, n: 46,
    sample: rej(L.x - 2, L.feet - 196, L.x + 34, L.feet - 30, (x, y) => Lcaps.some(c => inCap(x, y, c)) && !Lcaps.some(c => inCap(x + 5, y, c))),
    dir: () => -Math.PI / 2 + 0.25,
    col: (x, y, r) => jig(mix(GOLD_DEEP, '#a3552c', r() * 0.5), r, 10),
    len: 7, lw: 1.9, steps: 2,
  });
  // the receiver's flank: only a faint, partial rim — the light just arriving
  strokes(out, counter, {
    rng, n: 42,
    sample: rej(R_.x - 32, R_.feet - 186, R_.x + 2, R_.feet - 30, (x, y) => Rcaps.some(c => inCap(x, y, c)) && !Rcaps.some(c => inCap(x - 5, y, c))),
    dir: () => -Math.PI / 2 - 0.25,
    col: (x, y, r) => jig(mix('#3a4364', '#8a6a34', 0.35 + r() * 0.4), r, 10),
    len: 7, lw: 1.9, steps: 2,
  });

  /* ---------------- 3. THE FACES ---------------- */
  // the radiant child's face is FULL of gold (the warmest paint in the book);
  // the other's face is only beginning to wake — a first warmth, still half in shadow
  const faceL = [L.x + 11, L.feet - 176];     // turned toward the other, giving
  const faceR = [R_.x - 11, R_.feet - 166];
  for (const [fc, lean, lit] of [[faceL, 0.5, 1], [faceR, -0.5, 0.42]]) {
    strokes(out, counter, {
      rng, n: 64,
      sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 1.25) * 11; return [fc[0] + Math.cos(a) * d * 0.85, fc[1] + Math.sin(a) * d]; },
      dir: (x, y) => lean + (fbm(x / 7, y / 7, 79) - 0.5) * 0.8,      // strokes curve like cheekbones
      col: (x, y, r) => {
        const d = Math.hypot(x - fc[0], y - fc[1]);
        // lit=1 → full gold (the shining child); lit<1 → the warmth only just
        // arriving, the face still partly in the night blue-grey
        const warm = ramp([GOLD_HOT, GOLD_PALE, GOLD, '#c98e4e', '#8a5a34'], d / 13 + (r() - 0.5) * 0.15);
        return jig(mix('#3a4364', warm, 0.18 + lit * 0.82), r, 7);
      },
      len: 5.5, lw: 1.9, steps: 2, wJ: 0.5, lenJ: 0.5, impasto: 0.7,
    });
    // a closed, calm eye — one short dark stroke; tenderness, not detail
    paintPath(out, counter, rng, [[fc[0] - 3.5, fc[1] - 1.5], [fc[0] + 0.5, fc[1] - 2.5]], (x, y, r) => jig('#5e3a1e', r, 6), { lw: 1.3, len: 2.2, density: 0.9, jitter: 0.3 });
  }

  /* ---------------- 4. EASTER EGG — the red hat from plate 18 --------- */
  // held faintly in the lit child's other hand, down at her side
  {
    const hx2 = L.x - 23, hy2 = L.feet - 60;
    strokes(out, counter, {
      rng, n: 30,
      sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 1.4) * 8; return [hx2 + Math.cos(a) * d * 1.25, hy2 + Math.sin(a) * d * 0.7]; },
      dir: (x, y) => 0.3 + (y - hy2) * 0.06,
      col: (x, y, r) => jig(ramp(['#a3331f', '#7e2418', '#4a1208'], Math.hypot(x - hx2, y - hy2 - 2) / 10 + (1 - gF(x, y)) * 0.35), r, 8),
      len: 5, lw: 1.8, steps: 2,
    });
    // brim: one darker sweep
    paintPath(out, counter, rng, [[hx2 - 9, hy2 + 4], [hx2, hy2 + 5.5], [hx2 + 9, hy2 + 3.5]], (x, y, r) => jig('#5e1a10', r, 7), { lw: 1.8, len: 3.5, density: 0.7, jitter: 0.5 });
  }

  /* ---------------- 5. THE LIGHT PASSING HAND TO HAND ---------------- */
  // No candle. The radiant child's open hand GIVES the light; the other's hand
  // lifts to RECEIVE it. The warmth crosses the small gap between them as a
  // stream of gold — the light of the world, handed on (Matt 5:16).
  // the giving hand: a small warm cluster of strokes, gold pouring from it
  strokes(out, counter, {
    rng, n: 30, sample: r => { const a = r() * Math.PI * 2, d = r() * 6; return [handL[0] + Math.cos(a) * d, handL[1] + Math.sin(a) * d]; },
    dir: () => 0.3, col: (x, y, r) => jig(ramp(['#fff6d8', GOLD_PALE, GOLD, '#c98e4e'], Math.hypot(x - handL[0], y - handL[1]) / 7 + (r() - 0.5) * 0.2), r, 7),
    len: 4.5, lw: 2, steps: 2, impasto: 0.6,
  });
  // the receiving hand: still half in shadow, the warmth only beginning to reach it
  strokes(out, counter, {
    rng, n: 24, sample: r => { const a = r() * Math.PI * 2, d = r() * 5.5; return [handR[0] + Math.cos(a) * d, handR[1] + Math.sin(a) * d]; },
    dir: () => 0.7, col: (x, y, r) => jig(mix('#1c2440', GOLD_DEEP, gF(x, y) * 0.7), r, 8), len: 4, lw: 2, steps: 2,
  });
  // THE STREAM: light flowing across the gap from the giving hand to the
  // receiving one — a soft braided current of gold, warmest at its source
  {
    const a = handL, b = handR;
    const ctl = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 - 16];   // a gentle upward bow
    const q = t => { const u = 1 - t; return [u * u * a[0] + 2 * u * t * ctl[0] + t * t * b[0], u * u * a[1] + 2 * u * t * ctl[1] + t * t * b[1]]; };
    for (let s = 0; s < 3; s++) {                              // three loose strands
      const off = (s - 1) * 3;
      for (let t = 0; t < 1; t += 0.09) {
        const p = q(t), p2 = q(Math.min(1, t + 0.1));
        const wL = (3.2 - t * 1.4) * (0.7 + (s === 1 ? 0.5 : 0));  // tapering toward the receiver
        // bright gold at the giving hand, cooling toward the shadowed receiver
        const cc = jig(ramp(['#fff6d8', GOLD_PALE, GOLD, '#d8b86a', '#7a6a48'], t), rng, 8);
        const jx = (rng() - 0.5) * 2.2, jy = (rng() - 0.5) * 2 + off * 0.4;
        out.push(ribbon([[p[0] + jx, p[1] + jy], [(p[0] + p2[0]) / 2 + jx, (p[1] + p2[1]) / 2 + jy], [p2[0] + jx, p2[1] + jy]], wL, cc, [0.5, 0.55, 0.42]));
        counter.n++;
      }
    }
  }
  // a first glow waking on the receiver's near flank — the warmth taking hold
  strokes(out, counter, {
    rng, n: 18,
    sample: r => { const a = r() * Math.PI * 2, d = r() * 5; return [handR[0] - 6 + Math.cos(a) * d, handR[1] - 4 + Math.sin(a) * d * 1.2]; },
    dir: () => -Math.PI / 2 + 0.2,
    col: (x, y, r) => jig(mix(GOLD_DEEP, GOLD_PALE, r() * 0.6), r, 7),
    len: 3.2, lw: 1.4, steps: 2,
  });
  // a few soft sparks lifting off the stream — the light has begun to spread
  strokes(out, counter, {
    rng, n: 14,
    sample: r => [flame[0] + (r() - 0.4) * 20, flame[1] - 18 - r() * 26],
    dir: () => -Math.PI / 2 + 0.15,
    col: (x, y, r) => jig(GOLD_PALE, r, 14),
    len: 3.5, lw: 1.2, steps: 2,
  });

  /* ---------------- 5b. LIFE — night flowers at their feet ----------------
     Small night flowers waking at the children's feet in the first light
     (Matt 6:28-29 "consider the lilies of the field... they toil not").
     Kept well clear of the incised words in the floor at (352,452)/(462,452).
     Dedicated rng so the incised eggs and everything else stay untouched. */
  {
    const frng = mulberry32(seed + 1313);
    const clumps = [
      { x: 268, y: 464 }, { x: 288, y: 470 },   // at the red child's feet, left
      { x: 528, y: 468 }, { x: 548, y: 474 },   // at the receiver's feet, right
      { x: 405, y: 490 }, { x: 425, y: 493 },   // in front of the pair, below the words
    ];
    for (const f of clumps) {
      const h = 13 + frng() * 6, sway = (frng() - 0.5) * 6;
      const top = [f.x + sway, f.y - h];
      // curved stem (living = curved)
      paintPath(out, counter, frng, [[f.x, f.y], [f.x + sway * 0.5, f.y - h * 0.55], top],
        (x, y, r) => jig('#3c4832', r, 8), { lw: 1.8, len: 2.6, density: 0.8, jitter: 0.4 });
      // the bloom: a deep plum-magenta cup with a waking gold heart
      // (plum against the pale lilac-tan floor — contrast against the LOCAL hue)
      strokes(out, counter, {
        rng: frng, n: 16,
        sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 0.9) * 5.5; return [top[0] + Math.cos(a) * d, top[1] - 2 + Math.sin(a) * d * 1.15]; },
        dir: (x, y) => Math.atan2(y - (top[1] + 3), x - top[0]) + Math.PI / 2,
        col: (x, y, r) => r() < 0.22 ? jig('#f6dc9a', r, 8) : jig(ramp(['#c874b8', '#8a3e86', '#5a2456'], Math.hypot(x - top[0], y - top[1] + 2) / 6), r, 9),
        len: 3.6, lw: 1.9, steps: 2, lenJ: 0.5, wild: 0.2,
      });
    }
  }

  /* ---------------- 6. EASTER EGGS — the invitation & the answer (the gospel turned to YOU) ----------------
     The send-off hides the gospel's call to the reader, in original KOINE GREEK, cut faint into the warm
     floor beneath the two children — the deepest secret of all, where the book finally turns and asks:
       Rev 3:20  Γʹ·Κʹ  — "Behold, I stand at the door, and knock... I will come in to him" (the invitation;
                            Holman Hunt's Light of the World — the door opens only from the inside).
       John 1:12 Αʹ·ΙΒʹ — "as many as received him, to them gave he power to become the sons of God" (the
                            answer). The shadowed child RECEIVING the light from the other's hand IS this
                            verse; the word only names what the art already shows. */
  E.inscriptionText(out, E.greekRef(3, 20), { x: 352, y: 452, h: 14, body: '#241608', edge: '#f6e8c6', op: 0.8, edgeOp: 0.55 });
  E.inscriptionText(out, E.greekRef(1, 12), { x: 462, y: 452, h: 14, body: '#241608', edge: '#f6e8c6', op: 0.8, edgeOp: 0.55 });

  // MULTIPLANE: assemble the requested depth plane (transparent where empty).
  const ALT = 'Hopeful dawn; the child in deep red, washed clean and glowing with a soft white aura, reaches out a hand to another child still in the shadow, and the light and warmth pass between their hands into the one just beginning to catch it.';
  const RAW = { undercoat: 0, weave: 0, varnish: 0, oil: 0 };
  if (LAYER === 'bg') return svgWrap(ALT, out.slice(0, bgEnd).join('\n'), RAW);      // smooth dawn ground (opaque)
  const nm = LAYER.match(/^n(\d+)$/);
  if (nm) return svgWrap(ALT, '<g>' + sheets[+nm[1]] + '</g>', RAW);                 // one dawn-swirl sheet
  if (LAYER === 'mid') return svgWrap(ALT, out.slice(bgEnd, skyEnd).join('\n'), RAW); // breath-halo + floor pool
  if (LAYER === 'fg') return svgWrap(ALT, out.slice(skyEnd).join('\n'), RAW);        // the two children + the light passing between their hands
  // full painting (desktop): dawn ground, the stacked swirl sheets, then breath + floor + the pair
  return svgWrap(ALT, out.slice(0, bgEnd).concat(sheets, out.slice(bgEnd)).join('\n'));
}
