// gen/plates/hand.mjs — "The wrong hand"
// Seen from child height: tall dark adult figures like trees; a small child
// reaches for a coat of almost the right blue, while in a lit gap behind,
// the true mother stands in gold, slightly turned.

export const name = 'hand';
export const title = 'The wrong hand';
export const caption = 'The holding was real both times. The hand makes the difference.';
export const seed = 40221;
export const focal = { x: 460, y: 330 }; // portrait window: gap + coat + reaching child all in frame

export function paint(E) {
  const {
    mulberry32, fbm, curlV, mix, ramp, jig, strokes, rej,
    paintFigure, inCap, inEllipse, underpaintCapsules, svgWrap, R1, W, H,
    GOLD, GOLD_DEEP,
  } = E;

  const rng = mulberry32(seed);
  const out = [];
  const counter = { n: 0 };
  const WALL = ['#241c10', '#332817', '#42351d', '#523f22', '#5f4e2c'];
  const floorY = 436;
  out.push(`<rect width="${W}" height="${H}" fill="#332817"/>`);

  // doorway gap of light between the framing adults
  const gap = { x0: 300, x1: 368, cx: 334, top: 92 };
  // the child (declared early: the strokes around him must hush)
  const ch = { x: 512, feet: 488 };
  const calm = (x, y) => Math.max(0, 1 - Math.hypot((x - ch.x) / 120, (y - (ch.feet - 55)) / 95)); // 1 at the child, 0 outside his zone
  // doorway light reach — the plate's one light source
  const doorG = (x, y) => Math.max(0, 1 - Math.hypot(Math.max(0, Math.abs(x - gap.cx) - 34) / 300, Math.max(0, y - floorY) / 200));

  // wall murk: vertical-ish strokes, olive/umber, warmed near the gap, cooled at the far edges
  strokes(out, counter, {
    rng, n: 1200,
    sample: rej(-10, -10, 810, floorY + 8),
    dir: (x, y) => { const [cx2, cy2] = curlV(x, y, 71, 130); return Math.atan2(1 + cy2 * 1.4, cx2 * 1.7); },
    col: (x, y, r) => {
      const g = doorG(x, y);
      // complementary spark: cold violet flicks where the gold light dies into umber
      if (g > 0.42 && g < 0.56 && r() < 0.032 && y > 120) return jig('#54548c', r, 13);
      let c = ramp(WALL, fbm(x / 100, y / 100, 19));
      c = mix(c, '#7a6133', g * g * 0.55);              // warmth with falloff
      c = mix(c, '#16100a', (1 - g) * 0.3);             // cold corners sink
      return jig(c, r, 8 - calm(x, y) * 5);
    },
    len: 30, lw: 4.6, steps: 3, follow: 0.85, wild: 0.2, lenJ: 0.5,
    aJ: (x, y) => 0.2 + Math.max(0, 1 - Math.hypot(x - (ch.x - 45), y - (ch.feet - 100)) / 130) * 0.4 - calm(x, y) * 0.12,
  });

  // the lit doorway: pale warm glow, vertical strokes
  out.push(`<rect x="${gap.x0}" y="${gap.top}" width="${gap.x1 - gap.x0}" height="${floorY - gap.top}" fill="#c9ab6a"/>`);
  counter.n++;
  strokes(out, counter, {
    rng, n: 380,
    sample: rej(gap.x0 - 4, gap.top - 4, gap.x1 + 4, floorY + 2),
    dir: (x, y) => Math.PI / 2 + (fbm(x / 30, y / 30, 27) - 0.5) * 0.25,
    col: (x, y, r) => {
      const e = Math.min(Math.abs(x - gap.x0), Math.abs(x - gap.x1)) / ((gap.x1 - gap.x0) / 2);
      return jig(ramp(['#a8853e', GOLD_DEEP, '#f6e3a8', '#fdf2cd'], Math.min(1, e) - (y - gap.top) / 1400), r, 6);
    },
    len: 24, lw: 3.6, steps: 3, wild: 0.12, impasto: 0.74,
  });

  // light spilling onto the floor from the doorway
  strokes(out, counter, {
    rng, n: 300,
    sample: r => { const y = floorY - 6 + r() * 70; const sw = 50 + (y - floorY) * 1.1; return [gap.cx + (r() + r() - 1) * Math.max(40, sw), y]; },
    dir: (x, y) => (x - gap.cx) * 0.004 + (fbm(x / 60, y / 60, 29) - 0.5) * 0.2,
    col: (x, y, r) => jig(ramp([GOLD, GOLD_DEEP, '#7a6233', '#42351d'], Math.abs(x - gap.cx) / 130 + (y - floorY) / 220), r, 10),
    len: 20, lw: 3.2, steps: 3, wild: 0.1, impasto: 0.6,
  });

  // floor elsewhere: dark horizontal strokes — hushed around the child's zone
  strokes(out, counter, {
    rng, n: 540,
    sample: rej(-10, floorY - 2, 810, 510, (x, y) => Math.abs(x - gap.cx) > 60 + (y - floorY)),
    dir: (x, y) => (fbm(x / 90, y / 90, 37) - 0.5) * 0.3 * (1 - calm(x, y) * 0.7),
    col: (x, y, r) => jig(mix('#1d160c', '#352a17', fbm(x / 80, y / 80, 41) * (1 - calm(x, y) * 0.6)), r, 8 - calm(x, y) * 5),
    len: 24, lw: 4.2, steps: 3, wild: 0.12,
  });

  // the true mother, standing in the doorway light — gold, slightly turned
  const m = { x: 334, feet: 412 };
  // solid silhouette underpaint
  out.push(`<ellipse cx="${m.x + 2}" cy="${m.feet - 148}" rx="10" ry="11" fill="#8a6526"/>`);
  out.push(`<path d="M${m.x - 13} ${m.feet}L${m.x - 11} ${m.feet - 110}L${m.x - 6} ${m.feet - 134}L${m.x + 10} ${m.feet - 134}L${m.x + 14} ${m.feet - 108}L${m.x + 13} ${m.feet}Z" fill="#8a6526"/>`);
  counter.n += 2;
  const mMask = (x, y) =>
    inEllipse(x, y, m.x + 2, m.feet - 148, 10, 11) ||
    (y > m.feet - 136 && y < m.feet && Math.abs(x - (m.x + (y > m.feet - 110 ? 0 : 2))) < (y > m.feet - 110 ? 13 : 9));
  strokes(out, counter, {
    rng, n: 240,
    sample: rej(m.x - 16, m.feet - 160, m.x + 17, m.feet + 1, mMask),
    dir: (x, y) => Math.PI / 2 + (x - m.x) * 0.01 + (fbm(x / 14, y / 14, 91) - 0.5) * 0.3,
    col: (x, y, r) => jig(ramp(['#6b4e1d', '#8a6526', '#b3852e', GOLD_DEEP], 0.25 + (x - m.x + 14) / 38 * 0.45 + fbm(x / 12, y / 12, 93) * 0.3), r, 8),
    len: 11, lw: 2.6, steps: 2,
  });
  // her head slightly turned: small darker profile note on the left of the head
  strokes(out, counter, {
    rng, n: 16,
    sample: r => [m.x - 4 + r() * 5, m.feet - 154 + r() * 12],
    dir: () => Math.PI / 2.3,
    col: (x, y, r) => jig('#8a6526', r, 8),
    len: 6, lw: 1.8, steps: 2,
  });
  // egg: a small red hat held at her side (the flat-plate motif, carried)
  strokes(out, counter, {
    rng, n: 26,
    sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 1.4) * 7; return [m.x + 17 + Math.cos(a) * d * 1.2, m.feet - 56 + Math.sin(a) * d * 0.7]; },
    dir: (x, y) => 0.3 + (y - (m.feet - 56)) * 0.06,
    col: (x, y, r) => jig(ramp(['#c2492e', '#a3331f', '#6e1f12'], Math.hypot(x - (m.x + 17), y - (m.feet - 58)) / 9), r, 9),
    len: 5, lw: 1.8, steps: 2,
  });

  // adult figures: dark silhouettes towering from child height
  const adults = [
    { x: 64, w: 66, top: 46 },
    { x: 232, w: 76, top: 26 },
    { x: 452, w: 88, top: 18, coat: true }, // the almost-right blue
    { x: 640, w: 72, top: 54 },
    { x: 774, w: 80, top: 34 },
  ];
  for (const A of adults) {
    const headR = A.w * 0.21, headY = A.top + headR;
    const shY = A.top + headR * 2 + 10;
    const hemY = A.coat ? 398 : floorY;
    // solid silhouette underpaint: head + shoulders-to-floor mass
    const base = A.coat ? '#13171f' : '#171108';
    out.push(`<ellipse cx="${A.x}" cy="${R1(headY)}" rx="${R1(headR)}" ry="${R1(headR * 1.15)}" fill="${base}"/>`);
    out.push(`<path d="M${A.x - A.w * 0.34} ${R1(shY)}L${A.x + A.w * 0.34} ${R1(shY)}L${A.x + A.w * 0.5} ${floorY}L${A.x - A.w * 0.5} ${floorY}Z" fill="${base}"/>`);
    counter.n += 2;
    const mask = (x, y) => {
      if (inEllipse(x, y, A.x, headY, headR, headR * 1.15)) return true;
      if (y < shY || y > floorY) return false;
      const t = (y - shY) / (floorY - shY);
      return Math.abs(x - A.x) < A.w * (0.34 + 0.16 * t);
    };
    strokes(out, counter, {
      rng, n: Math.round(A.w * 4.6),
      sample: rej(A.x - A.w * 0.55, A.top - 4, A.x + A.w * 0.55, floorY + 2, mask),
      dir: (x, y) => Math.PI / 2 + (x - A.x) * 0.0025 + (fbm(x / 40, y / 40, 7) - 0.5) * 0.4,
      col: (x, y, r) => {
        const toGap = Math.max(0, 1 - Math.abs(x - gap.cx) / 240) * 0.62; // warm edge toward the light
        const side = Math.sign(gap.cx - A.x); // which flank faces the doorway
        const facing = (x - A.x) * side > A.w * 0.22 ? 1 : 0.2;
        let bc;
        if (A.coat && y > shY + 4 && y < hemY) bc = mix('#36445e', '#222c40', fbm(x / 26, y / 26, 13)); // almost-right blue
        else bc = mix('#171108', '#2e2412', fbm(x / 50, y / 50, 23));
        return jig(mix(bc, '#b3914a', toGap * facing), r, 6);
      },
      len: 22, lw: 3.8, steps: 3, wild: 0.07, lenJ: 0.45,
    });
    // egg: one figure carries a small pale wrap at his ear — the painter, humbly in the crowd
    if (A.x === 640) {
      strokes(out, counter, {
        rng, n: 14,
        sample: r => [A.x + headR * 0.45 + (r() - 0.5) * 5, headY + headR * 0.25 + (r() - 0.5) * 7],
        dir: () => -0.5,
        col: (x, y, r) => jig(mix('#cbb89a', '#a89372', r() * 0.6), r, 7),
        len: 5, lw: 1.7, steps: 2,
      });
    }
  }

  // the child, foreground — enlarged 1.6x and pulled clear of the doorway,
  // so the REACH (at the wrong blue) and the LIGHT (the mother) are two separate events
  const cCaps = [
    { ax: ch.x - 4, ay: ch.feet - 100, bx: ch.x - 6, by: ch.feet - 88, r: 14 },         // head tilted up-left
    { ax: ch.x - 2, ay: ch.feet - 74, bx: ch.x + 2, by: ch.feet - 22, r: 17.5 },        // body
    { ax: ch.x - 13, ay: ch.feet - 68, bx: ch.x - 52, by: ch.feet - 122, r: 5.6 },      // arm stretched up-left to the blue coat
    { ax: ch.x - 8, ay: ch.feet - 22, bx: ch.x - 11, by: ch.feet, r: 6.4 },             // legs
    { ax: ch.x + 9, ay: ch.feet - 22, bx: ch.x + 16, by: ch.feet, r: 6.4 },
  ];
  // solid underpaint
  underpaintCapsules(out, counter, cCaps, '#100b06');
  paintFigure(out, counter, rng, cCaps, (x, y, r) => jig(mix('#100b06', '#241a0d', fbm(x / 16, y / 16, 61)), r, 5), 1.9, 1.1, 1.25);
  // warm rim from the doorway light — a thin edge on the left flank only
  strokes(out, counter, {
    rng, n: 34,
    sample: rej(ch.x - 62, ch.feet - 128, ch.x + 4, ch.feet - 8, (x, y) => cCaps.some(c => inCap(x, y, c)) && !cCaps.some(c => inCap(x + 7, y, c))),
    dir: () => Math.PI / 2,
    col: (x, y, r) => jig('#8a6c36', r, 9),
    len: 7, lw: 1.7, steps: 2,
  });
  // the reaching hand brushed brighter — the moment of contact-almost
  strokes(out, counter, {
    rng, n: 16,
    sample: r => [ch.x - 52 + (r() - 0.5) * 9, ch.feet - 122 + (r() - 0.5) * 9],
    dir: () => -0.9,
    col: (x, y, r) => jig('#c9a050', r, 10),
    len: 5.5, lw: 1.7, steps: 2,
  });

  return svgWrap('Seen from child height: tall dark adult figures like trees; a small child reaches for a coat of almost the right blue, while in a lit gap behind, the true mother stands in gold, slightly turned.', out.join('\n'));
}
