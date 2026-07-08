// gen/plates/windows.mjs — "Two witnesses" (§16)
// A night village beneath the swirl. A moonlit garden at the center; two
// dark houses flank it, each with ONE lit gold window and a child's
// silhouette in it. Pinned beneath each window, a small drawing — and the
// two drawings MATCH. Both children see the same garden; their pictures
// agree because there is only one garden to see.
//
// Light: the moon over the garden is the ONE source (gold family — it is
// C's garden). The windows are small gold echoes of the same light.
//
// Paint order: sky swirl -> moon -> village ground -> garden -> houses ->
// windows + silhouettes -> the two matching drawings -> eggs.

export const name = 'windows';
export const title = 'Two witnesses';
export const caption = 'Two windows, one garden.';
export const seed = 20260616;
export const focal = { x: 400, y: 280 }; // portrait window: moon over the shared garden

export function paint(E) {
  const {
    mulberry32, fbm, curlV, swirlV, mix, ramp, jig, strokes, rej,
    paintPath, lightRadial, svgWrap, R1, W, H,
    GOLD, GOLD_PALE, GOLD_DEEP, GOLD_HOT, NIGHT, DARKEST,
  } = E;

  const rng = mulberry32(seed);
  const out = [];
  const counter = { n: 0 };

  out.push(`<rect width="${W}" height="${H}" fill="${DARKEST}"/>`);

  /* ---------------- LIGHT MODEL ---------------- */
  const moon = [400, 84];
  const lightAt = (x, y) => Math.min(1, Math.exp(-Math.hypot(x - moon[0], y - moon[1]) / 210));
  // the garden pool: moonlight gathered on the ground at center
  const garden = { cx: 400, cy: 398, rx: 120, ry: 52 };
  const gardenG = (x, y) => Math.max(0, 1 - Math.hypot((x - garden.cx) / (garden.rx * 1.25), (y - garden.cy) / (garden.ry * 1.4)));

  /* ---------------- 1. SKY SWIRL ---------------- */
  const horizon = y => 322; // village roofline zone; sky above ~322
  const skyDir = (x, y) => {
    let [vx, vy] = swirlV(x, y, moon[0], moon[1], 230, 95);
    const [a, b] = swirlV(x, y, 110, 150, 90, 50);
    vx += a; vy += b;
    const [cx2, cy2] = curlV(x, y, 19, 140);
    vx += cx2 * 120 + 18; vy += cy2 * 120;
    return Math.atan2(vy, vx);
  };
  const slash = (x, y) => 0.14 + Math.max(0, 1.2 - Math.hypot(x - moon[0], y - moon[1]) / 95) * 0.4 + lightAt(x, y) * 0.25;
  const skyCol = (x, y, r) => {
    const g = lightAt(x, y);
    if (g > 0.17 && g < 0.31 && r() < 0.04) return jig('#d96f2e', r, 16); // spark at the light's death
    const t = fbm(x / 95, y / 95, 27) * 0.5 + g * 0.55;
    let c = ramp(NIGHT, t);
    c = g > 0.05 ? mix(c, '#c9a050', g * 0.5) : mix(c, '#0c1228', 0.32);
    return jig(c, r, 12);
  };
  strokes(out, counter, { rng, n: 720, sample: rej(-10, -10, 810, 330), dir: skyDir, col: (x, y, r) => jig(mix(ramp(NIGHT.slice(0, 3), fbm(x / 130, y / 130, 9)), '#c9a050', lightAt(x, y) * 0.3), r, 9), len: 38, lw: 5.2, steps: 4, follow: 0.85, wild: 0.09, aJ: slash, lenJ: 0.55 });
  strokes(out, counter, { rng, n: 1200, sample: rej(-10, -10, 810, 326), dir: skyDir, col: skyCol, len: 25, lw: 3.5, steps: 3, follow: 0.9, wild: 0.26, aJ: slash, lenJ: 0.5, impasto: 0.55 });

  /* ---------------- 2. THE MOON ---------------- */
  // gold disc breathing in rings — the one light
  strokes(out, counter, {
    rng, n: 240,
    sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 0.7) * 34; return [moon[0] + Math.cos(a) * d, moon[1] + Math.sin(a) * d * 0.92]; },
    dir: (x, y) => Math.atan2(x - moon[0], -(y - moon[1])),
    col: (x, y, r) => jig(ramp([GOLD_HOT, GOLD_PALE, GOLD, GOLD_DEEP], Math.hypot(x - moon[0], y - moon[1]) / 36), r, 8),
    len: 9, lw: 2.6, steps: 2, wJ: 0.5, impasto: 0.7,
  });
  // halo ring strokes orbiting wider
  strokes(out, counter, {
    rng, n: 160,
    sample: r => { const a = r() * Math.PI * 2, d = 38 + r() * 38; return [moon[0] + Math.cos(a) * d, moon[1] + Math.sin(a) * d * 0.9]; },
    dir: (x, y) => Math.atan2(x - moon[0], -(y - moon[1])),
    col: (x, y, r) => jig(mix(GOLD_DEEP, '#3d5aa8', 0.55 + r() * 0.3), r, 10),
    len: 12, lw: 2.2, steps: 3,
  });

  /* ---------------- 3. VILLAGE GROUND ---------------- */
  strokes(out, counter, {
    rng, n: 900,
    sample: rej(-10, 318, 810, 510),
    dir: (x, y) => (fbm(x / 80, y / 50, 43) - 0.5) * 0.3,
    col: (x, y, r) => {
      const g = lightAt(x, y) * 0.7 + gardenG(x, y) * 0.95;
      if (g > 0.16 && g < 0.28 && r() < 0.03) return jig('#c96f30', r, 14);
      let c = ramp(['#0e1530', '#1a2550', '#2c3e6e'], fbm(x / 70, y / 45, 49) * 0.85);
      return jig(mix(c, '#a8853e', Math.min(1, g) * 0.5), r, 10);
    },
    len: 26, lw: 3.8, steps: 3, wild: 0.18, aJ: 0.1, lenJ: 0.55, impasto: 0.6,
  });

  /* ---------------- 4. THE GARDEN ---------------- */
  // moonlit bed at center: massed leaf-strokes, gold where the moon kisses them
  const inGarden = (x, y) => ((x - garden.cx) / garden.rx) ** 2 + ((y - garden.cy) / garden.ry) ** 2 <= 1;
  strokes(out, counter, {
    rng, n: 620,
    sample: rej(garden.cx - garden.rx, garden.cy - garden.ry, garden.cx + garden.rx, garden.cy + garden.ry, inGarden),
    dir: (x, y) => -Math.PI / 2 + (fbm(x / 22, y / 22, 61) - 0.5) * 1.3,
    col: (x, y, r) => {
      const g = gardenG(x, y);
      let c = ramp(['#16223e', '#274a3e', '#3e6a48', '#7a9a50'], g * (0.6 + fbm(x / 26, y / 26, 63) * 0.7));
      return jig(mix(c, GOLD_DEEP, g * g * 0.7), r, 11);
    },
    len: 12, lw: 2.4, steps: 3, wild: 0.14, aJ: 0.3, lenJ: 0.55, impasto: 0.62,
  });
  // scattered moon-caught blossoms
  strokes(out, counter, {
    rng, n: 90,
    sample: rej(garden.cx - garden.rx * 0.85, garden.cy - garden.ry * 0.8, garden.cx + garden.rx * 0.85, garden.cy + garden.ry * 0.8, inGarden),
    dir: () => -Math.PI / 2,
    col: (x, y, r) => jig(ramp([GOLD_PALE, GOLD, '#b08a4a'], r()), r, 10),
    len: 4.5, lw: 2, steps: 2,
  });
  // egg: exactly TWO identical bright blossoms side by side at the garden's heart
  for (const bx of [392, 410]) {
    strokes(out, counter, {
      rng, n: 16,
      sample: r => { const a = r() * Math.PI * 2, d = 1 + r() * 4; return [bx + Math.cos(a) * d, 392 + Math.sin(a) * d * 0.8]; },
      dir: (x, y) => Math.atan2(x - bx, -(y - 392)),
      col: (x, y, r) => jig(ramp([GOLD_HOT, GOLD_PALE], r() * 0.8), r, 6),
      len: 3.5, lw: 1.5, steps: 2,
    });
  }
  // low garden wall hint: two short stroke-rows flanking the bed
  for (const wx of [garden.cx - garden.rx - 18, garden.cx + garden.rx + 18]) {
    strokes(out, counter, {
      rng, n: 40,
      sample: r => [wx + (r() - 0.5) * 16, 386 + r() * 28],
      dir: () => 0.04,
      col: (x, y, r) => jig(mix('#1a2244', '#34406a', r()), r, 8),
      len: 9, lw: 2.6, steps: 2,
    });
  }

  /* ---------------- 5. THE HOUSES ---------------- */
  // two dark gabled masses, mirror sisters flanking the garden
  const houses = [
    { x0: 88, x1: 240, peak: 196, eave: 268, base: 420, wx: 164, wy: 318 },
    { x0: 560, x1: 712, peak: 196, eave: 268, base: 420, wx: 636, wy: 318 },
  ];
  for (const h of houses) {
    const cx = (h.x0 + h.x1) / 2;
    // solid silhouette so the mass reads against the swirl
    out.push(`<path d="M${h.x0} ${h.base}L${h.x0} ${h.eave}L${cx} ${h.peak}L${h.x1} ${h.eave}L${h.x1} ${h.base}Z" fill="#0c1226" opacity="0.94"/>`);
    counter.n++;
    const inHouse = (x, y) => x > h.x0 && x < h.x1 && y < h.base && y > (y > h.eave ? h.eave - 1e9 : 0) && (y >= h.eave || Math.abs(x - cx) / (h.x1 - h.x0) * 2 <= (y - h.peak) / (h.eave - h.peak));
    // wall texture: vertical strokes, cooled, faintly warmed on the garden side
    strokes(out, counter, {
      rng, n: 330,
      sample: rej(h.x0, h.peak, h.x1, h.base, inHouse),
      dir: () => Math.PI / 2 + 0.04,
      col: (x, y, r) => {
        const g = lightAt(x, y) * 0.5 + gardenG(x, y * 0.9) * 0.3;
        let c = mix('#0e1630', '#222e56', fbm(x / 40, y / 40, 71) * 0.8);
        return jig(mix(c, '#8a7340', g * 0.45), r, 8);
      },
      len: 16, lw: 3.2, steps: 3, wild: 0.12, aJ: 0.1, lenJ: 0.5,
    });
    // roof: raking strokes along the slopes, moon-kissed on the inner slope
    strokes(out, counter, {
      rng, n: 150,
      sample: r => { const t = r(); const left = r() < 0.5; const x = left ? cx - t * (cx - h.x0) : cx + t * (h.x1 - cx); const yr = h.peak + t * (h.eave - h.peak); return [x, yr + (r() - 0.5) * 9]; },
      dir: (x) => x < cx ? Math.atan2(h.eave - h.peak, h.x0 - cx) + Math.PI : Math.atan2(h.eave - h.peak, h.x1 - cx),
      col: (x, y, r) => {
        const inner = x > cx === (h.wx < 400); // slope facing the garden
        let c = mix('#131c3a', '#2c3a66', fbm(x / 30, y / 30, 77));
        return jig(mix(c, GOLD_DEEP, (inner ? 0.22 : 0.06) * lightAt(x, y) * 2.2), r, 9);
      },
      len: 14, lw: 2.8, steps: 2, wild: 0.1, aJ: 0.12,
    });
  }

  /* ---------------- 6. WINDOWS + CHILDREN ---------------- */
  for (const h of houses) {
    const wx = h.wx, wy = h.wy, ww = 21, wh = 27;
    // warm glow bleeding from the window onto the wall
    strokes(out, counter, {
      rng, n: 56,
      sample: r => { const a = r() * Math.PI * 2, d = 6 + Math.pow(r(), 2.2) * 22; return [wx + Math.cos(a) * d * 1.15, wy + Math.sin(a) * d]; },
      dir: (x, y) => Math.atan2(y - wy, x - wx) + Math.PI / 2,
      col: (x, y, r) => jig(mix(GOLD_DEEP, '#161e3c', 0.25 + Math.hypot(x - wx, y - wy) / 34), r, 9),
      len: 7, lw: 2, steps: 2,
    });
    // the lit pane itself — both windows the SAME gold
    strokes(out, counter, {
      rng, n: 120,
      sample: rej(wx - ww / 2, wy - wh / 2, wx + ww / 2, wy + wh / 2),
      dir: () => Math.PI / 2 + 0.05,
      col: (x, y, r) => jig(ramp([GOLD_HOT, GOLD_PALE, GOLD], fbm(x / 9, y / 9, 81) + r() * 0.3), r, 7),
      len: 6, lw: 2.2, steps: 2, impasto: 0.7,
    });
    // the child's silhouette in the pane: head and shoulders, looking out
    out.push(`<path d="M${R1(wx - 6.5)} ${R1(wy + wh / 2)}Q${R1(wx - 6)} ${R1(wy + 2)} ${R1(wx - 4)} ${R1(wy + 0.5)}Q${R1(wx - 5.5)} ${R1(wy - 3.5)} ${R1(wx - 2.5)} ${R1(wy - 6)}Q${R1(wx + 1)} ${R1(wy - 7.5)} ${R1(wx + 3)} ${R1(wy - 4.5)}Q${R1(wx + 4.5)} ${R1(wy - 1.5)} ${R1(wx + 3)} ${R1(wy + 1)}Q${R1(wx + 6.5)} ${R1(wy + 2.5)} ${R1(wx + 7)} ${R1(wy + wh / 2)}Z" fill="#13101c" opacity="0.96"/>`);
    counter.n++;
    // window frame
    out.push(`<path d="M${R1(wx - ww / 2 - 1)} ${R1(wy - wh / 2 - 1)}H${R1(wx + ww / 2 + 1)}V${R1(wy + wh / 2 + 1)}H${R1(wx - ww / 2 - 1)}Z" stroke="#0b1122" stroke-width="3.4" fill="none"/>`);
    counter.n++;
  }

  /* ---------------- 7. THE TWO MATCHING DRAWINGS ---------------- */
  // pinned beneath each window: a child's drawing of the SAME garden —
  // identical strokes both sides: a humped flowerbed, one flower, the moon.
  const drawing = (px, py) => {
    // paper: a pale leaf catching the night
    out.push(`<path d="M${px - 11} ${py - 13}L${px + 11} ${py - 14}L${px + 12} ${py + 13}L${px - 12} ${py + 14}Z" fill="#cdc4a4" opacity="0.9" transform="rotate(${px < 400 ? -2.5 : 2})" transform-origin="${px} ${py}"/>`);
    counter.n++;
    const ink = (x, y, r) => jig('#33301f', r, 6);
    // the bed: a low hump
    paintPath(out, counter, rng, [[px - 8, py + 8], [px - 3, py + 4.5], [px + 3, py + 4.5], [px + 8, py + 8]], ink, { lw: 1.7, len: 3, density: 0.8, jitter: 0.4 });
    // one flower at the heart
    paintPath(out, counter, rng, [[px, py + 4], [px, py - 1]], ink, { lw: 1.5, len: 2.5, density: 0.85, jitter: 0.3 });
    paintPath(out, counter, rng, [[px - 2.5, py - 3], [px, py - 5.5], [px + 2.5, py - 3], [px, py - 1], [px - 2.5, py - 3]], ink, { lw: 1.5, len: 2.2, density: 0.85, jitter: 0.3 });
    // the moon, upper corner, a small circle
    paintPath(out, counter, rng, [[px + 5.5, py - 9.5], [px + 7.5, py - 11], [px + 9.5, py - 9.5], [px + 7.5, py - 8], [px + 5.5, py - 9.5]], ink, { lw: 1.4, len: 2, density: 0.85, jitter: 0.25 });
    // the pin
    out.push(`<circle cx="${px}" cy="${R1(py - 12.5)}" r="1.6" fill="#8a7340"/>`);
    counter.n++;
  };
  drawing(houses[0].wx, houses[0].wy + 48);
  drawing(houses[1].wx, houses[1].wy + 48);

  return svgWrap('A night village under a swirling sky; a golden moon lights a garden at the center; two dark houses flank it, each with one lit gold window holding a child\'s silhouette, and beneath each window a small pinned drawing — the two drawings match.', out.join('\n'));
}
