// gen/plates/hands.mjs — "The team and the weakest link" (§19)
// A village lane in daylight. Three children walking holding hands; the
// middle one — the red child — is mid-trip, foot caught on a cobble, but
// NOT falling: both neighbors' arms are visibly taut, the chain holding.
// Vicious little dust strokes burst at the caught foot.
//
// Light: the daylight sun, high off-frame upper-left — gold warmth with
// falloff toward the lower right; violet sparks where it cools.
//
// Paint order: sky strip -> house rows -> lane cobbles -> cast shadows ->
// eggs (hopscotch, window cat) -> dust burst -> the three children ->
// taut arms + joined hands -> rim light.

export const name = 'hands';
export const title = 'The team';
export const caption = 'One trips. The hands hold.';
export const seed = 20260619;
export const focal = { x: 400, y: 340 }; // portrait window: the middle child mid-trip, chain holding
// MOBILE 3D — depth planes (FAR→NEAR): the sky + the house rows + the lane's far
// end behind; the lane cobbles, shadows and roadside life in the middle; the three
// children (the threefold cord) closest. Tilt to look down the lane.
export const layers = [
  { name: 'bg', opaque: true },   // sky + the lane's sunny far end + distant rooftops (backmost)
  { name: 'far' },                // the two house rows framing the lane (parallax vs the haze)
  { name: 'mid' },                // the lane cobbles, cast shadows, roadside grass + cypress
  { name: 'fg' },                 // the three children holding hands (the threefold cord)
];

export function paint(E, opts = {}) {
  const {
    mulberry32, fbm, curlV, mix, ramp, jig, strokes, rej,
    paintFigure, paintPath, underpaintCapsules, paintChild, paintFace, personCaps, inCap, lightRadial, svgWrap, R1, W, H,
    GOLD, GOLD_PALE, GOLD_DEEP, GOLD_HOT, NIGHT, DARKEST,
  } = E;

  const rng = mulberry32(seed);
  const out = [];
  const counter = { n: 0 };
  const LAYER = opts.layer || 'full';
  const fgRanges = [];
  const farRanges = [];

  // POST-RESURRECTION FLIP: a bright sunlit lane — the light base shows through
  // every gap, so the whole world reads as daylight; the houses and the children
  // are the dark forms within it.
  out.push(`<rect width="${W}" height="${H}" fill="#cdc6b0"/>`);

  /* ---------------- LIGHT MODEL ---------------- */
  const lightAt = lightRadial(-40, -80, 640); // high off-frame sun, upper-left

  /* ---------------- 1. SKY STRIP ---------------- */
  // a daylight band above the rooftops: pale gold-blue, breathing
  strokes(out, counter, {
    rng, n: 420,
    sample: rej(-10, -10, 810, 150),
    dir: (x, y) => { const [vx, vy] = curlV(x, y, 17, 120); return Math.atan2(vy * 1.2, vx * 1.2 + 0.5); },
    col: (x, y, r) => {
      const g = lightAt(x, y);
      let c = ramp(['#7cc0ea', '#a2d2ee', '#dcd2a6', '#f2e2b6'], Math.min(1, g * 1.2 + fbm(x / 90, y / 90, 23) * 0.3 + 0.12));
      return jig(c, r, 10);
    },
    len: 26, lw: 4, steps: 3, follow: 0.9, wild: 0.12, aJ: 0.16, lenJ: 0.5, impasto: 0.66,
  });

  /* ---------------- 2. HOUSE ROWS ---------------- */
  // two receding rows framing the lane; lit faces left, cool faces right
  const houses = [
    { x0: -10, x1: 150, top: 96, base: 318, warm: true },
    { x0: 150, x1: 268, top: 128, base: 308, warm: true },
    { x0: 560, x1: 690, top: 120, base: 312, warm: false },
    { x0: 690, x1: 812, top: 90, base: 322, warm: false },
  ];
  const _far = out.length;   // [FAR plane] the two house rows parallax against the sky/haze
  for (const h of houses) {
    // solid mass — WARM stone, so the gaps between strokes read as sunlit wall,
    // not a black void (the daylit village, not a dark block)
    out.push(`<path d="M${h.x0} ${h.base}L${h.x0} ${h.top + 18}L${R1((h.x0 + h.x1) / 2)} ${h.top}L${h.x1} ${h.top + 18}L${h.x1} ${h.base}Z" fill="#4c3e34" opacity="0.9"/>`);
    counter.n++;
    strokes(out, counter, {
      rng, n: 240,
      sample: rej(h.x0, h.top + 4, h.x1, h.base),
      dir: () => Math.PI / 2 + 0.04,
      col: (x, y, r) => {
        const g = lightAt(x, y);
        // warm side = sun-warmed plaster; cool side = wall in shade (lavender-grey,
        // still legible — a shadowed wall, never near-black)
        let c = h.warm
          ? ramp(['#6e5240', '#a8804e', '#d2ac68', '#efd69c'], Math.min(1, g * 1.5 + fbm(x / 50, y / 50, 31) * 0.3 - 0.12))
          : ramp(['#544a62', '#6e6482', '#948aa4', '#b6acc2'], Math.min(1, g * 1.4 + fbm(x / 50, y / 50, 33) * 0.3 + 0.04));
        return jig(c, r, 9);
      },
      len: 17, lw: 3.4, steps: 3, wild: 0.14, aJ: 0.1, lenJ: 0.5, impasto: 0.64,
    });
    // roof band — warm terracotta tiles on BOTH rows, lit along the ridge
    strokes(out, counter, {
      rng, n: 76,
      sample: r => { const t = r(); const x = h.x0 + t * (h.x1 - h.x0); const yr = h.top + Math.abs(t - 0.5) * 36 + 2; return [x, yr + r() * 9]; },
      dir: x => x < (h.x0 + h.x1) / 2 ? -0.45 : 0.45,
      col: (x, y, r) => jig(mix('#7c3c28', '#c46e44', Math.min(1, lightAt(x, y) * 0.8 + 0.18)), r, 8),
      len: 13, lw: 3, steps: 2, wild: 0.1, aJ: 0.12,
    });
    // WINDOWS — some warm-LIT (an inhabited home), some dark glass, with muntins,
    // so each house reads as a dwelling (Munch: made things in straight lines)
    [0.3, 0.7].forEach((wf, wi) => {
      const wx = h.x0 + (h.x1 - h.x0) * wf, wy = h.top + 68;
      const lit = (wi + (h.warm ? 0 : 1)) % 2 === 0;
      out.push(`<rect x="${R1(wx - 9)}" y="${R1(wy)}" width="18" height="24" fill="${lit ? '#f2c264' : '#222642'}" opacity="0.92"/>`);
      counter.n++;
      if (lit) { out.push(`<rect x="${R1(wx - 12)}" y="${R1(wy - 3)}" width="24" height="30" fill="#ffe19a" opacity="0.22"/>`); counter.n++; }   // warm glow spill
      out.push(`<path d="M${R1(wx)} ${R1(wy)}L${R1(wx)} ${R1(wy + 24)}M${R1(wx - 9)} ${R1(wy + 12)}L${R1(wx + 9)} ${R1(wy + 12)}" stroke="#2a2418" stroke-width="1.3" opacity="0.75"/>`);
      out.push(`<rect x="${R1(wx - 9)}" y="${R1(wy)}" width="18" height="24" fill="none" stroke="#2a2418" stroke-width="1.4" opacity="0.7"/>`);
      counter.n += 2;
    });
  }
  farRanges.push([_far, out.length]);   // ← the house rows are the FAR plane

  /* ---------------- 2.5 THE LANE'S SUNNY FAR END ----------------
     fill the centre-distance between the two house rows: the street recedes
     into daylight here. Without it the gap was an empty dark void — which is
     exactly the dark "top two thirds" the portrait crop landed on. */
  strokes(out, counter, {
    rng, n: 480,
    sample: rej(244, 150, 566, 316),
    dir: (x, y) => (fbm(x / 70, y / 50, 29) - 0.5) * 0.3,
    col: (x, y, r) => {
      const d = Math.hypot((x - 406) / 150, (y - 312) / 150);   // brightest toward the low-centre vanishing point
      const c = ramp([GOLD_PALE, '#f0d8b6', '#e8c2d4', '#bcc8ea', '#9cc0ee'], Math.min(1, d + fbm(x / 80, y / 80, 31) * 0.2));
      return jig(c, r, 9);
    },
    len: 15, lw: 4, steps: 3, follow: 0.9, wild: 0.1, lenJ: 0.5, impasto: 0.5,
  });
  // a low row of distant rooftops + a tree, closing the lane's end, warm-lit on top
  for (const [dx, dw, dh] of [[296, 30, 20], [336, 24, 15], [410, 34, 24], [452, 22, 14], [486, 30, 19]]) {
    const by = 302;
    out.push(`<path d="M${dx} ${by}L${dx} ${R1(by - dh + 7)}L${R1(dx + dw / 2)} ${R1(by - dh)}L${dx + dw} ${R1(by - dh + 7)}L${dx + dw} ${by}Z" fill="#2a3256" opacity="0.88"/>`);
    counter.n++;
    paintPath(out, counter, rng, [[dx, by - dh + 7], [dx + dw / 2, by - dh], [dx + dw, by - dh + 7]], (x, y, r) => jig(mix('#4a4060', GOLD_DEEP, lightAt(x, y) * 0.85), r, 8), { lw: 1.4, len: 3.4, density: 0.5, jitter: 0.6 });
  }
  const skyEnd = out.length;   // BG plane: sky + houses + the lane's far end (opaque, backmost)

  /* ---------------- 3. THE LANE ---------------- */
  // cobbled ground, warm ochre in the sun, cooling right and downward
  strokes(out, counter, {
    rng, n: 1450,
    sample: rej(-10, 300, 810, 510),
    dir: (x, y) => (fbm(x / 60, y / 40, 39) - 0.5) * 0.35 + 0.03,
    col: (x, y, r) => {
      const g = lightAt(x, y);
      // POST-RESURRECTION FLIP: a bright sunlit lane — the world is light now
      let c = ramp(['#8c8668', '#b2a476', '#cfba88', '#e4ce9a', '#f4e2b2'], Math.min(1, g * 1.4 + fbm(x / 38, y / 26, 45) * 0.32 + 0.06));
      return jig(c, r, 10);
    },
    len: 13, lw: 3.6, steps: 2, follow: 0.85, wild: 0.18, aJ: 0.14, lenJ: 0.45, impasto: 0.66,
  });
  // long cast shadows from the house row, raking down-right
  strokes(out, counter, {
    rng, n: 260,
    sample: rej(-10, 304, 360, 420, (x, y) => y < 318 + x * 0.28),
    dir: () => 0.42,
    col: (x, y, r) => jig(mix('#252a4e', '#3a3a5e', fbm(x / 50, y / 50, 51)), r, 7),
    len: 22, lw: 3.6, steps: 2, wild: 0.1, aJ: 0.08, lenJ: 0.5,
  });

  /* ---------------- 4. EGGS ---------------- */
  // egg: a chalk hopscotch fading on the cobbles, lower left — three squares,
  // the game the three of them were playing before they joined hands
  {
    const hop = (x0, y0, w2, h2) => paintPath(out, counter, rng,
      [[x0, y0], [x0 + w2, y0 - 2], [x0 + w2 + 2, y0 + h2 - 2], [x0 + 2, y0 + h2], [x0, y0]],
      (x, y, r) => jig('#cfc8b0', r, 8), { lw: 1.4, len: 4, density: 0.4, jitter: 1.1 });
    hop(116, 446, 30, 18);
    hop(150, 442, 30, 18);
    hop(184, 438, 30, 18);
  }
  // egg: a small cat silhouette in a far window, watching the chain hold
  {
    const cw = houses[2];
    const cx = cw.x0 + (cw.x1 - cw.x0) * 0.3, cy = cw.top + 70;
    out.push(`<path d="M${R1(cx - 5)} ${R1(cy + 21)}Q${R1(cx - 6)} ${R1(cy + 12)} ${R1(cx - 3)} ${R1(cy + 9)}L${R1(cx - 4)} ${R1(cy + 5)}L${R1(cx - 1.5)} ${R1(cy + 7.5)}Q${R1(cx)} ${R1(cy + 7)} ${R1(cx + 1.5)} ${R1(cy + 7.5)}L${R1(cx + 4)} ${R1(cy + 5)}L${R1(cx + 3)} ${R1(cy + 9)}Q${R1(cx + 6)} ${R1(cy + 12)} ${R1(cx + 5)} ${R1(cy + 21)}Z" fill="#0e1428" opacity="0.9"/>`);
    counter.n++;
  }

  /* ---------------- BACKGROUND LIFE (Matt 6:26; Isa 55:12) ---------------- */
  for (const [bx, by, s] of [[250, 70, 1], [290, 84, 0.85], [218, 94, 0.8], [560, 78, 0.78]]) {
    paintPath(out, counter, rng, [[bx - 6 * s, by + 2.6 * s], [bx, by - 1.8 * s], [bx + 6 * s, by + 2.6 * s]], (x, y, r) => jig('#3a3c50', r, 6), { lw: 1.5 * s, len: 3.4, density: 0.9, jitter: 0.5 });
  }
  const cyp19 = (cx, cby, ch, w) => strokes(out, counter, { rng, n: Math.round(w * ch / 12), sample: r => { const v = Math.pow(r(), 0.85); const wr = w * Math.sin(Math.PI * Math.min(1, v * 1.15)) + 0.7; return [cx + (r() + r() - 1) * wr, cby - v * ch]; }, dir: (x, y) => -Math.PI / 2 + (fbm(x / 8, y / 8, 247) - 0.5) * 0.6, col: (x, y, r) => jig(ramp(['#26283a', '#34364e', '#43455e'], fbm(x / 10, y / 10, 251) + r() * 0.3), r, 7), len: 8, lw: 2, steps: 3, follow: 0.95, lenJ: 0.5 });
  cyp19(354, 300, 28, 5); cyp19(522, 302, 26, 4);
  // tufts of grass + wildflowers softening the lane edges (Isa 35:1)
  strokes(out, counter, {
    rng, n: 220,
    sample: rej(-6, 360, 812, 508, (x, y) => (x < 180 || x > 640 || y > 458)),
    dir: () => -Math.PI / 2 + (rng() - 0.5) * 0.5,
    col: (x, y, r) => { const k = r(); return jig(k < 0.44 ? mix('#5a8a3e', '#7caa4c', r()) : k < 0.6 ? '#ee5c84' : k < 0.74 ? '#a47ce0' : k < 0.88 ? '#f6c63e' : '#fafafa', r, 11); },
    len: 5, lw: 2, steps: 1, lenJ: 0.5,
  });

  /* ---------------- 5. THE TRIO ---------------- */
  // geometry: left child (steady), middle child (red, mid-trip), right child
  // (steady). Middle torso pitches forward; both arms run straight back/out
  // to the neighbors' grips — TAUT.
  // enlarge + lift the trio so the THREEFOLD CORD (Ecc 4:12 — "a threefold cord
  // is not quickly broken") is the clear, beautiful subject, not small and low.
  const SCG = 1.36, GCX = 405, GCY = 344;
  const sp = p => [GCX + (p[0] - GCX) * SCG, GCY + (p[1] - GCY) * SCG];
  const scl = c => ({ ax: GCX + (c.ax - GCX) * SCG, ay: GCY + (c.ay - GCY) * SCG, bx: GCX + (c.bx - GCX) * SCG, by: GCY + (c.by - GCY) * SCG, r: c.r * SCG });
  // the held hands sit ABOVE the falling child — the neighbours hold him UP
  // the held hands sit where the friends' inner hands meet the child's raised
  // hands — both reach the SAME point, so the holding is real, not a near-miss.
  const gripL = [381, 372];
  const gripR = [429, 372];

  const _fgTrio = out.length;   // [FG plane] the three children (+ their shadows, dust, grips)
  // shadow pools under all three
  {
    const sc = [405, 452], sw = 150, sh = 18;
    strokes(out, counter, {
      rng, n: 150,
      sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 1.1); return [sc[0] + Math.cos(a) * sw * d, sc[1] + Math.sin(a) * sh * d]; },
      dir: () => 0.05,
      col: (x, y, r) => { const d = Math.hypot((x - sc[0]) / sw, (y - sc[1]) / sh); return jig(mix('#1c2142', '#3c3a5e', d * 0.9), r, 6); },
      len: 14, lw: 3, steps: 2, aJ: 0.08,
    });
  }

  // LEFT friend (blue): standing tall and braced, INNER (right) hand gripping the
  // child's raised hand at gripL; outer arm counter-balancing.
  const leftCaps = personCaps(352, 440 - 104, 104, {
    lean: -5, rightHand: gripL, leftHand: [330, 396],
    leftFoot: [338, 440], rightFoot: [360, 438],
  });
  paintChild(out, counter, rng, leftCaps, { cols: ['#283c64', '#1c2e52', '#16223e'], seed: 41, whiteAura: true });

  // RIGHT friend (green): mirror — heels dug in, INNER (left) hand gripping gripR.
  const rightCaps = personCaps(458, 440 - 104, 104, {
    lean: 5, leftHand: gripR, rightHand: [480, 396],
    leftFoot: [450, 438], rightFoot: [472, 440],
  });
  paintChild(out, counter, rng, rightCaps, { cols: ['#244e3c', '#1a4034', '#13261f'], seed: 67, whiteAura: true });

  // MIDDLE child (red): SLIPPED and sunk LOW between the two — hanging from his
  // raised arms, which both friends grip; legs buckled under him. Clearly CAUGHT.
  const midCaps = personCaps(405, 452 - 88, 88, {
    leftHand: gripL, rightHand: gripR,
    leftFoot: [395, 454], rightFoot: [419, 450], headTilt: 1,
  });
  paintChild(out, counter, rng, midCaps, { whiteAura: true });   // the RED protagonist "you", slipped but held

  // the offending cobble at the caught foot
  out.push(`<ellipse cx="419" cy="452" rx="9" ry="5" fill="#2a2438" opacity="0.95"/>`); counter.n++;
  out.push(`<ellipse cx="418" cy="450.4" rx="7.5" ry="3.6" fill="#4a4060" opacity="0.9"/>`); counter.n++;

  /* ---------------- 6. DUST BURST ---------------- */
  // vicious little strokes at the caught foot — sharp, radiating, gritty
  { const dc = [415, 450];
    strokes(out, counter, {
      rng, n: 90,
      sample: r => { const a = -Math.PI * (0.15 + r() * 0.8), d = (3 + Math.pow(r(), 1.4) * 26) * SCG; return [dc[0] + Math.cos(a) * d * 1.25, dc[1] + Math.sin(a) * d * 0.8]; },
      dir: (x, y) => Math.atan2(y - dc[1], x - dc[0]) + (rng() - 0.5) * 0.5,
      col: (x, y, r) => jig(ramp(['#e3c47a', '#c9a050', '#8a7448', '#5e5070'], Math.hypot(x - dc[0], y - dc[1]) / (30 * SCG) + r() * 0.2), r, 11),
      len: 7, lw: 1.6, steps: 2, lenJ: 0.6, wJ: 0.5, aJ: 0.5, wild: 0.22,
    });
  }

  /* ---------------- 7. THE GRIPS + RIM LIGHT ---------------- */
  // the joined hands: small bright knots — the holding made visible
  for (const g of [gripL, gripR]) {
    strokes(out, counter, {
      rng, n: 32,
      sample: r => { const a = r() * Math.PI * 2, d = r() * 6.5; return [g[0] + Math.cos(a) * d, g[1] + Math.sin(a) * d]; },
      dir: (x, y) => Math.atan2(x - g[0], -(y - g[1])),
      col: (x, y, r) => jig(mix(GOLD, GOLD_HOT, r() * 0.7), r, 7),
      len: 4, lw: 2.1, steps: 2, impasto: 0.4,
    });
  }
  // sun rim on the trio's upper-left flanks
  const rim = (caps, x0, y0, x1, y1) => strokes(out, counter, {
    rng, n: 24,
    sample: rej(x0, y0, x1, y1, (x, y) => caps.some(c => inCap(x, y, c)) && !caps.some(c => inCap(x - 4, y - 4, c))),
    dir: () => -Math.PI / 4,
    col: (x, y, r) => jig(mix(GOLD, GOLD_PALE, r() * 0.5), r, 8),
    len: 5, lw: 1.7, steps: 2,
  });
  const rb = (caps, x0, y0, x1, y1) => { const a = sp([x0, y0]), b = sp([x1, y1]); rim(caps, a[0], a[1], b[0], b[1]); };
  rb(leftCaps, 296, 290, 340, 396);
  rb(midCaps, 350, 330, 466, 406);
  rb(rightCaps, 484, 286, 524, 392);
  fgRanges.push([_fgTrio, out.length]);   // ← the three children are foreground

  /* ---------------- 8. LIFE: WINDOW-BOX FLOWERS (far band) ----------------
     Song 2:12 "the flowers appear on the earth" — small bright boxes under
     three windows: the street is lived-in and loved. Appended at the END so
     the trio/eggs rng stream is untouched; tagged into the FAR plane. */
  const _farLife = out.length;
  const wbox = (wx, wy, warm) => {
    // the box: straight-lined (a made thing — Munch's law)
    out.push(`<rect x="${R1(wx - 10)}" y="${R1(wy)}" width="20" height="5.5" fill="${warm ? '#5e3f2a' : '#463650'}" opacity="0.95"/>`); counter.n++;
    out.push(`<rect x="${R1(wx - 10)}" y="${R1(wy)}" width="20" height="1.7" fill="${warm ? '#b87a42' : '#7a6a7e'}" opacity="0.85"/>`); counter.n++;
    // the blooms: curved living dabs — greens + the plate's own wildflower pinks/golds
    strokes(out, counter, {
      rng, n: 34,
      sample: r => [wx - 9 + r() * 18, wy - 0.5 - r() * 4.5],
      dir: () => -Math.PI / 2 + (rng() - 0.5) * 1.0,
      col: (x, y, r) => { const k = r(); return jig(k < 0.3 ? '#5a8a3e' : k < 0.56 ? '#ee5c84' : k < 0.78 ? '#f6c63e' : '#e05248', r, 12); },
      len: 3.6, lw: 1.9, steps: 2, lenJ: 0.5, wild: 0.25,
    });
  };
  wbox(houses[0].x0 + (houses[0].x1 - houses[0].x0) * 0.7, houses[0].top + 92.5, true);   // lit row, x≈102
  wbox(houses[1].x0 + (houses[1].x1 - houses[1].x0) * 0.7, houses[1].top + 92.5, true);   // lit row, x≈233
  wbox(houses[2].x0 + (houses[2].x1 - houses[2].x0) * 0.7, houses[2].top + 92.5, false);  // cool row, x≈651 — clear of the cat egg (x≈599)
  farRanges.push([_farLife, out.length]);   // ← window boxes ride the FAR (house) plane

  /* ---------------- 9. LIFE: SPARROWS ON THE LANE (mid band) ----------------
     Matt 10:29,31 "ye are of more value than many sparrows" — three sparrows
     pecking between the cobbles, clear of the trio, the shadow pool, the
     hopscotch egg and dead-center. Not fg/far-tagged → they land in MID. */
  const sparrow = (sx, sy, s, flip, peck) => {
    const f = flip ? -1 : 1;
    const X = dx => R1(sx + dx * s * f), Y = dy => R1(sy + dy * s);
    const d = peck
      // head DOWN between the cobbles (curved living silhouette)
      ? `M${X(-10)} ${Y(-7)}Q${X(-3)} ${Y(-12.5)} ${X(3)} ${Y(-10.5)}Q${X(8)} ${Y(-9)} ${X(11)} ${Y(-2)}L${X(6.5)} ${Y(-3.5)}Q${X(1)} ${Y(-2.5)} ${X(-4)} ${Y(-3.5)}Q${X(-8)} ${Y(-4.5)} ${X(-10)} ${Y(-7)}Z`
      // head UP, watching the chain hold
      : `M${X(-10.5)} ${Y(-5)}Q${X(-4)} ${Y(-10.5)} ${X(1.5)} ${Y(-10)}Q${X(4)} ${Y(-14)} ${X(7.5)} ${Y(-12.5)}Q${X(10.5)} ${Y(-11)} ${X(8.5)} ${Y(-8.5)}L${X(11)} ${Y(-7.5)}L${X(7)} ${Y(-6.5)}Q${X(3)} ${Y(-3)} ${X(-3)} ${Y(-3)}Q${X(-8)} ${Y(-3.5)} ${X(-10.5)} ${Y(-5)}Z`;
    out.push(`<path d="${d}" fill="#2c2136" opacity="0.96"/>`); counter.n++;
    // legs
    out.push(`<path d="M${X(-2)} ${Y(-3)}L${X(-2.5)} ${Y(0)}M${X(2)} ${Y(-3)}L${X(2.5)} ${Y(0)}" stroke="#2c2136" stroke-width="${R1(1.1 * s)}" fill="none" opacity="0.9"/>`); counter.n++;
    // sunlit back rim (light from the upper-left sun) — one curved gold pass
    paintPath(out, counter, rng, peck
      ? [[sx - 8 * s * f, sy - 8.5 * s], [sx - 1 * s * f, sy - 11.5 * s], [sx + 5 * s * f, sy - 9.5 * s]]
      : [[sx - 8 * s * f, sy - 6.5 * s], [sx - 2 * s * f, sy - 10 * s], [sx + 3 * s * f, sy - 10.5 * s]],
      (x, y, r) => jig(mix(GOLD, GOLD_PALE, r() * 0.6), r, 8), { lw: 1.5, len: 3, density: 0.85, jitter: 0.4 });
    // pale breast splash + eye dot (one accent each — shape reads, anatomy doesn't)
    out.push(`<ellipse cx="${X(-3)}" cy="${Y(-5)}" rx="${R1(3 * s)}" ry="${R1(2 * s)}" fill="#cbb894" opacity="0.55"/>`); counter.n++;
    out.push(`<circle cx="${X(peck ? 6.5 : 6)}" cy="${Y(peck ? -8 : -11)}" r="${R1(0.8 * s)}" fill="#e8d8a8" opacity="0.9"/>`); counter.n++;
  };
  sparrow(282, 414, 1.05, false, true);   // pecking, facing the trio — in the portrait window
  sparrow(256, 432, 0.9, true, false);    // upright, watching the chain hold
  sparrow(536, 402, 0.9, true, true);     // pecking on the cool side of the lane

  // MULTIPLANE: assemble the requested depth plane (transparent where empty).
  const ALT = 'A sunlit village lane; three children walk holding hands; the middle one in deep red is mid-trip over a cobble, dust bursting at the caught foot, but both neighbors\' arms are taut and the chain holds.';
  const RAW = { undercoat: 0, weave: 0, varnish: 0, oil: 0 };
  const pick = ranges => ranges.map(([a, b]) => out.slice(a, b).join('\n')).join('\n');
  const fgSet = new Set();
  for (const [a, b] of fgRanges) for (let i = a; i < b; i++) fgSet.add(i);
  const farSet = new Set();
  for (const [a, b] of farRanges) for (let i = a; i < b; i++) farSet.add(i);
  if (LAYER === 'bg') {                                                             // sky + lane far end + distant rooftops (opaque), houses pulled out
    const body = out.filter((_, i) => i < skyEnd && !farSet.has(i)).join('\n');
    return svgWrap(ALT, body, RAW);
  }
  if (LAYER === 'far') return svgWrap(ALT, pick(farRanges), RAW);                   // the house rows
  if (LAYER === 'fg') return svgWrap(ALT, pick(fgRanges), RAW);                     // the three children
  if (LAYER === 'mid') {                                                            // lane, shadows, roadside life
    const body = out.filter((_, i) => i >= skyEnd && !fgSet.has(i) && !farSet.has(i)).join('\n');
    return svgWrap(ALT, body, RAW);
  }
  return svgWrap(ALT, out.join('\n'));             // full painting (desktop)
}
