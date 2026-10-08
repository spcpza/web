// gen/plates/found.mjs — the 404 page: "the piece which I had lost"
//
//   "Either what woman having ten pieces of silver, if she lose one piece, doth not light a
//    candle, and sweep the house, and seek diligently till she find it?" — Luke 15:8
//
// Fred, Sep 25: "make a new art for the 404. we cant reuse things like that." The first 404
// borrowed the `lost` plate; a page nobody meant to reach deserves its own painting, and Luke 15
// has the one made for it — the lost COIN, the parable that happens INDOORS, in an ordinary house
// at night (daily life: every child has lost something under the furniture).
//
// Read the Greek before painting the English (storm's pûḵ lesson): the "candle" is λύχνος
// (G3088), a small CLAY OIL LAMP with a pinched spout, and the coin is a δραχμή (G1406), a silver
// drachma. So: seen from low on a beaten-earth floor, a clay lamp burns; its warm pool shows the
// arcs a broom has just swept in the dust; nine silver coins lie together on a cloth by the lamp;
// and out at the very edge of the light, half in a crack of the floor, the tenth has just caught
// the flame — one glint. Not found yet; about to be. The woman is not drawn: the lamp, the broom
// and the sweep are her, the way `turning` shows only a reaching hand. ("seek diligently" —
// ἐπιμελῶς — is the sweep marks: careful, overlapping, all the way to the dark.)
//
// One light (the flame). Made things straight (the wall's courses, the broom handle, the door);
// the lamp's round body and the coins are the round things. No black — the dark is umber/violet.
// Egg: ΙΕʹ·Ηʹ (Luke 15:8) scratched faint into the wall plaster.

export const name = 'found';
export const title = 'The piece which I had lost';
export const caption = 'She lit a lamp and swept the house until she found it.';
export const seed = 20261508;
export const focal = { x: 548, y: 380 };   // portrait window 404..716 — a phone shows only its middle ~74% (≈445..675): lamp through the tenth coin must fit that

export function paint(E) {
  const {
    mulberry32, fbm, curlV, mix, ramp, jig, strokes, rej, paintPath, ribbon, lightRadial,
    svgWrap, R1, W, H,
  } = E;

  const rng = mulberry32(seed);
  const out = [];
  const counter = { n: 0 };
  const free = (x, y, salt) => { const n = Math.sin(x * 12.9898 + y * 78.233 + salt) * 43758.5453; return n - Math.floor(n); };
  const widthOf  = (x, y, salt) => 0.40 + 3.2 * Math.pow(free(x, y, salt), 2.6);
  const lengthOf = (x, y, salt) => 0.40 + 1.5 * Math.pow(free(x, y, salt + 17), 1.5);

  /* ---------------- the bones ---------------- */
  const WALLY = 214;                                   // where the back wall meets the floor (low eye: the floor is the picture)
  const LAMP = { x: 494, y: 372 };                     // the lamp's foot on the floor
  const FLAME = [526, 338];                            // the flame at the spout tip
  const COIN = { x: 622, y: 436 };                     // the tenth coin, at the edge of the light
  const lit = lightRadial(FLAME[0], FLAME[1] + 20, 300);
  const L = (x, y) => Math.min(1, lit(x, y) * 1.15);
  const floorT = y => Math.max(0, Math.min(1, (y - WALLY) / (H - WALLY)));   // 0 at the wall, 1 at our feet
  out.push(`<rect width="${W}" height="${H}" fill="#1c1426"/>`);

  /* ---------------- 1. THE BACK WALL — mud plaster over stone courses ---------------- */
  E.setManifold && E.setManifold(0.004);
  strokes(out, counter, {
    rng, n: 1700, sample: rej(-10, -10, 810, WALLY + 6),
    dir: (x, y) => { const [a, b] = curlV(x, y, 41, 160); return Math.atan2(b * 0.6, 1 + a * 0.6); },
    col: (x, y, r) => {
      const g = L(x, y);
      let c = ramp(['#1a1224', '#271a2c', '#3a2630', '#5a3a32', '#8a5c3c', '#c08850'], Math.min(1, 0.08 + g * 0.95 + (fbm(x / 90, y / 70, 11) - 0.5) * 0.25));
      return jig(c, r, 6);
    },
    len: (x, y) => 22 * lengthOf(x, y, 13), lw: (x, y) => 3.4 * widthOf(x, y, 15), steps: 3, follow: 0.85, lenJ: 0.3, wJ: 0.3, impasto: 0.1, relief: 0.12,
  });
  // the stone courses under the plaster: broken straight joints, showing only where the light finds them
  for (let k = 0; k < 5; k++) {
    const y0 = 38 + k * 36 + (k % 2) * 4;
    let run = [];
    const flush = () => { if (run.length > 1) paintPath(out, counter, rng, run, (x, y, r) => jig(mix('#140e1c', '#3c2820', L(x, y) * 0.6), r, 4), { lw: 1.1, len: 6, density: 0.8, jitter: 0.3 }); run = []; };
    for (let x = -10; x < 810; x += 18) {
      if (fbm(x / 70 + k * 2.1, k, 21) < 0.46 || L(x, y0) < 0.08) { flush(); continue; }
      run.push([x, y0 + (fbm(x / 40, k, 23) - 0.5) * 3]);
      if (free(x, k, 27) < 0.16) {                                                      // a vertical joint between two stones
        paintPath(out, counter, rng, [[x, y0], [x + 1, y0 + 34]], (xx, yy, r) => jig(mix('#140e1c', '#3c2820', L(xx, yy) * 0.5), r, 4), { lw: 1.0, len: 6, density: 0.7, jitter: 0.3 });
      }
    }
    flush();
  }
  // the doorway, far right, shut on the night: a straight dark-blue slot with a thin cold line of moon under it
  out.push(`<path d="M742 ${WALLY + 2}V40H812V${WALLY + 2}Z" fill="#141a3a"/>`); counter.n++;
  strokes(out, counter, {
    rng, n: 140, sample: rej(744, 42, 810, WALLY), dir: () => Math.PI / 2 + (rng() - 0.5) * 0.1,
    col: (x, y, r) => jig(mix('#182048', '#243064', fbm(x / 20, y / 30, 31)), r, 4),
    len: 14, lw: 3, steps: 2, lenJ: 0.4, relief: 0.2, flow: 0,
  });
  paintPath(out, counter, rng, [[738, 40], [738, WALLY + 2]], (x, y, r) => jig('#3a2a26', r, 4), { lw: 4, len: 6, density: 0.95, jitter: 0.2 });   // the jamb
  paintPath(out, counter, rng, [[744, WALLY], [812, WALLY]], (x, y, r) => jig(mix('#8fa8e0', '#c8d6f4', r()), r, 4), { lw: 1.2, len: 5, density: 0.8, jitter: 0.2 });   // moonlight under the door
  // the egg: Luke 15:8 in Greek numerals, scratched faint into the plaster where the lamp just reaches
  E.inscriptionText(out, E.greekRef(15, 8), { x: 300, y: 118, h: 13, body: '#e8c894', edge: '#2a1a1c', op: 0.36, edgeOp: 0.4 });

  /* ---------------- 2. THE FLOOR — beaten earth, lit in a pool, running to the dark ---------------- */
  // the skirting shadow where floor meets wall
  strokes(out, counter, {
    rng, n: 260, sample: rej(-10, WALLY - 4, 810, WALLY + 10), dir: () => 0.02,
    col: (x, y, r) => jig(mix('#140e1a', '#3a2622', L(x, y) * 0.5), r, 4), len: 20, lw: 2.6, steps: 2, lenJ: 0.4, relief: 0.2, flow: 0,
  });
  E.setManifold && E.setManifold(0);
  strokes(out, counter, {
    rng, n: 3000, sample: rej(-10, WALLY + 4, 810, 510),
    dir: (x, y) => 0.04 + (fbm(x / 60, y / 30, 41) - 0.5) * 0.5,
    col: (x, y, r) => {
      const g = L(x, y), t = floorT(y);
      let c = ramp(['#150f24', '#261a34', '#44283a', '#7a4a38', '#b8804a', '#e8b872'], Math.min(1, 0.04 + g * 1.05 + (fbm(x / 50, y / 24, 43) - 0.5) * 0.14));
      c = mix(c, '#120c1a', Math.max(0, t - 0.7) * (1 - g) * 0.8);                     // the near edge sinks
      return jig(c, r, 5);
    },
    // ⚠ first cut (relief 0.35, impasto 0.3, short marks) tiled the dark floor into cobbles — the
    // dark-plate trap. Beaten earth is SMOOTH: long flat marks lying along the floor, almost no relief.
    len: (x, y) => (18 + 34 * floorT(y)) * (0.6 + 0.5 * lengthOf(x, y, 45)), lw: (x, y) => (1.2 + 2.6 * floorT(y)) * (0.6 + 0.4 * widthOf(x, y, 47)),
    steps: 3, follow: 0.95, lenJ: 0.3, wJ: 0.3, impasto: 0.05, relief: 0.08,
  });
  // the cracks in the floor (the coin's hiding place is one of them): thin dark broken lines, receding
  const cracks = [
    [[534, 300], [564, 336], [586, 380], [614, 420], [638, 452], [674, 500]],
    [[250, 260], [236, 300], [200, 350], [168, 410], [120, 505]],
    [[700, 260], [730, 300], [778, 336], [820, 360]],
  ];
  for (const cr of cracks) {
    const pts = cr.map(([x, y], i) => [x + (i ? (free(x, y, 51) - 0.5) * 6 : 0), y]);
    paintPath(out, counter, rng, pts, (x, y, r) => jig(mix('#0e0a14', '#2a1c1c', L(x, y) * 0.5), r, 4), { lw: 1.4, len: 4, density: 0.9, jitter: 0.35 });
    paintPath(out, counter, rng, pts.map(([x, y]) => [x - 1.2, y - 1]), (x, y, r) => jig(mix('#3a2a26', '#e8b878', L(x, y) * 0.8), r, 4), { lw: 0.7, len: 4, density: Math.max(0.2, 0.9 * L(pts[2][0], pts[2][1])), jitter: 0.3 });   // the lit lip
  }

  /* ---------------- 3. THE SWEEP — "sweep the house, and seek diligently" ---------------- */
  // arcs the broom left in the dust: fan-shaped, overlapping, reaching out from the lamp toward
  // the dark — each a few parallel bristle-scratches, pale where lit, the dust pushed to their ends
  const srng = mulberry32(seed + 88);
  for (let i = 0; i < 30; i++) {
    const a0 = -0.6 + srng() * 1.9, R = 90 + srng() * 200;                          // out and away from the lamp, mostly toward the coin
    const cx = LAMP.x + Math.cos(a0) * R * 0.9, cy = LAMP.y + 14 + Math.sin(a0) * R * 0.3;
    if (cy < WALLY + 20 || Math.hypot(cx - LAMP.x, (cy - LAMP.y) * 2) < 110) continue;   // never piled in the lamp's hot centre
    const span = 0.55 + srng() * 0.5, rad = 26 + srng() * 30, turn = srng() < 0.5 ? 1 : -1;
    for (let b = 0; b < 5; b++) {
      const pts = [];
      for (let j = 0; j <= 6; j++) { const aa = a0 * 0.4 + turn * (j / 6 - 0.5) * span; pts.push([cx + Math.cos(aa) * (rad + b * 3.2), cy + Math.sin(aa) * (rad + b * 3.2) * 0.34]); }
      paintPath(out, counter, srng, pts, (x, y, r) => jig(mix('#3e2a2a', '#d4a06a', Math.min(0.85, L(x, y) * 0.9)), r, 4), { lw: 0.7 + floorT(cy) * 0.7, len: 3, density: 0.8, jitter: 0.15 });   // ⚠ bold pale arcs in the hot light piled into a white smudge — the sweep is a faint pattern IN the dust
    }
    // the little ridge of dust pushed to the end of the stroke
    const ea = a0 * 0.4 + turn * span * 0.5, ex = cx + Math.cos(ea) * (rad + 4), ey = cy + Math.sin(ea) * (rad + 4) * 0.34;
    strokes(out, counter, {
      rng: srng, n: 8, sample: r => [ex + (r() - 0.5) * 8, ey + (r() - 0.5) * 3], dir: () => ea + Math.PI / 2,
      col: (x, y, r) => jig(mix('#4a3428', '#c8985c', L(x, y)), r, 5), len: 3, lw: 1.6, steps: 2, relief: 0.4, flow: 0,
    });
  }

  /* ---------------- 4. THE BROOM, dropped where she stopped ---------------- */
  // a bundle of twigs bound to a straight stick, lying on the floor pointing at the coin
  {
    const br = mulberry32(seed + 77);
    const H0 = [716, 296], H1 = [636, 390];   // ⚠ first cut pointed the bristles back at the cloth; they must end just short of the lost coin                                           // handle end → where the bundle is bound
    E.groundShadow(out, counter, 674, 348, 60, 5, { dir: 0.5, reach: 1, op: 0.7, tint: '#140e1c' });
    paintPath(out, counter, br, [H0, H1], (x, y, r) => jig(mix('#2a1a12', '#a0703e', L(x, y) * 0.8), r, 5), { lw: 4.2, len: 6, density: 1, jitter: 0.15 });
    paintPath(out, counter, br, [[H0[0], H0[1] - 1.4], [H1[0], H1[1] - 1.4]], (x, y, r) => jig(mix('#5a3c24', '#ffd89a', L(x, y)), r, 4), { lw: 0.9, len: 6, density: 0.9, jitter: 0.15 });   // lit top edge
    const dx = H1[0] - H0[0], dy = H1[1] - H0[1], dl = Math.hypot(dx, dy), ux = dx / dl, uy = dy / dl;
    for (let i = 0; i < 60; i++) {                                                     // the twigs, splaying toward the coin
      const sp = (br() - 0.5) * 0.9, len = 26 + br() * 10;
      const a = Math.atan2(uy, ux) + sp * 0.55;
      const sx = H1[0] + (br() - 0.5) * 4, sy = H1[1] + (br() - 0.5) * 3;
      paintPath(out, counter, br, [[sx, sy], [sx + Math.cos(a) * len * 0.5, sy + Math.sin(a) * len * 0.5 + 1], [sx + Math.cos(a) * len, sy + Math.sin(a) * len + 2]],
        (x, y, r) => jig(mix(mix('#2a1a14', '#5a3c24', r()), '#d8a860', L(x, y) * 0.3), r, 5), { lw: 1.6, len: 3, density: 0.95, jitter: 0.2 });
    }
    for (const t of [0.0, 0.08]) {                                                    // the binding cord
      const bx = H1[0] + ux * (-4 + t * 40), by = H1[1] + uy * (-4 + t * 40);
      paintPath(out, counter, br, [[bx - uy * 5, by + ux * 5], [bx + uy * 5, by - ux * 5]], (x, y, r) => jig('#6a3a28', r, 4), { lw: 1.6, len: 3, density: 1, jitter: 0.1 });
    }
  }

  /* ---------------- 5. THE LAMP — λύχνος, a clay oil lamp ---------------- */
  {
    const lr = mulberry32(seed + 55);
    // its shadow, thrown away from its own flame (back and left)
    E.groundShadow(out, counter, LAMP.x - 22, LAMP.y + 3, 42, 8, { dir: -0.9, reach: 1, op: 0.55, tint: '#1a1020' });
    // the body: a flattened round bowl, a filling hole, a pinched spout toward the right, a loop handle left
    const body = [];
    for (let i = 0; i <= 28; i++) { const a = Math.PI + i / 28 * Math.PI; body.push([LAMP.x + Math.cos(a) * 40, LAMP.y - 10 + Math.sin(a) * 19]); }
    const d = 'M' + body.map(([x, y]) => R1(x) + ' ' + R1(y)).join('L') + `L${LAMP.x + 40} ${LAMP.y - 10}Q${LAMP.x + 35} ${LAMP.y + 3} ${LAMP.x} ${LAMP.y + 4}Q${LAMP.x - 35} ${LAMP.y + 3} ${LAMP.x - 40} ${LAMP.y - 10}Z`;
    out.push(`<path d="${d}" fill="#4a2a1e"/>`); counter.n++;
    out.push(`<path d="M${LAMP.x + 28} ${LAMP.y - 20}L${FLAME[0] + 2} ${FLAME[1] + 12}Q${FLAME[0] + 6} ${FLAME[1] + 17} ${FLAME[0] - 1} ${FLAME[1] + 19}L${LAMP.x + 34} ${LAMP.y - 6}Z" fill="#6a3a24"/>`); counter.n++;   // the pinched spout
    out.push(`<path d="M${LAMP.x - 38} ${LAMP.y - 18}Q${LAMP.x - 58} ${LAMP.y - 28} ${LAMP.x - 54} ${LAMP.y - 8}Q${LAMP.x - 50} ${LAMP.y} ${LAMP.x - 38} ${LAMP.y - 6}" fill="none" stroke="#3a2018" stroke-width="5"/>`); counter.n++;   // handle
    // modelled from its own flame: hot on the spout side and the shoulder, deep on the far side
    strokes(out, counter, {
      rng: lr, n: 180,
      sample: r => { const a = Math.PI + r() * Math.PI, dd = Math.sqrt(r()); return [LAMP.x + Math.cos(a) * 38 * dd, LAMP.y - 10 + Math.sin(a) * 18 * dd + r() * 12]; },
      dir: (x, y) => Math.atan2(y - (LAMP.y - 8), x - LAMP.x) + Math.PI / 2,
      col: (x, y, r) => { const k = Math.max(0, Math.min(1, 0.35 + (x - LAMP.x) / 70 - (y - (LAMP.y - 20)) / 34)); return jig(ramp(['#2a1614', '#4a2a1e', '#8a4e30', '#d08850', '#ffd89a'], k), r, 5); },
      len: 4, lw: 1.8, steps: 2, lenJ: 0.4, relief: 0.4, impasto: 0.4, flow: 0,
    });
    out.push(`<ellipse cx="${LAMP.x - 4}" cy="${LAMP.y - 25}" rx="9" ry="3.2" fill="#1a0e0c"/>`); counter.n++;   // the filling hole, dark with oil
    paintPath(out, counter, lr, [[LAMP.x - 30, LAMP.y - 22], [LAMP.x - 8, LAMP.y - 29], [LAMP.x + 22, LAMP.y - 26], [LAMP.x + 34, LAMP.y - 18]], (x, y, r) => jig(mix('#ffcf88', '#fff0c8', r()), r, 4), { lw: 2.0, len: 3, density: 0.95, jitter: 0.2 });   // rim light on the shoulder
    // THE FLAME — many small marks (never a path), white at the root, gold, a thread of smoke
    strokes(out, counter, {
      rng: lr, n: 220,
      sample: r => { const t = Math.pow(r(), 0.7); const w = (1 - t) * 7 * Math.sin(Math.min(1, t * 3) * Math.PI / 2 + 0.3); return [FLAME[0] + (r() - 0.5) * w * 2 + t * 3, FLAME[1] + 8 - t * 34]; },
      dir: () => -Math.PI / 2 + (lr() - 0.5) * 0.3,
      col: (x, y, r) => { const t = Math.max(0, Math.min(1, (FLAME[1] + 8 - y) / 34)); return jig(ramp(['#ffffff', '#fff6d0', '#ffd680', '#f0a040', '#c05a28'], t * 0.9 + r() * 0.1), r, 3); },
      len: 3.4, lw: 1.5, steps: 2, lenJ: 0.4, relief: 0, flow: 0,
    });
    // its glow on the air around it — soft, tangential, so it is light and not a flower
    strokes(out, counter, {
      rng: lr, n: 260,
      sample: r => { const a = r() * Math.PI * 2, dd = 10 + Math.pow(r(), 0.8) * 70; return [FLAME[0] + Math.cos(a) * dd, FLAME[1] - 4 + Math.sin(a) * dd * 0.85]; },
      dir: (x, y) => Math.atan2(y - FLAME[1], x - FLAME[0]) + Math.PI / 2,
      col: (x, y, r) => jig(mix('#ffe2a0', '#6a3a2c', Math.min(1, Math.hypot(x - FLAME[0], y - FLAME[1]) / 80)), r, 5),
      len: 6, lw: 2, steps: 2, lenJ: 0.5, relief: 0.05, op: 0.3, flow: 0,
    });
  }

  /* ---------------- 6. THE NINE — together on a cloth by the lamp ---------------- */
  const coin = (x, y, r, glint, cr) => {
    const g = L(x, y);
    out.push(`<ellipse cx="${R1(x)}" cy="${R1(y + r * 0.18)}" rx="${R1(r)}" ry="${R1(r * 0.42)}" fill="${mix('#1a1216', '#3a2820', g * 0.5)}"/>`); counter.n++;    // its edge / shadow side
    out.push(`<ellipse cx="${R1(x)}" cy="${R1(y)}" rx="${R1(r)}" ry="${R1(r * 0.4)}" fill="${mix('#6a6a74', '#d8d8dc', Math.min(1, g * 1.1))}"/>`); counter.n++;   // the face, silver
    out.push(`<ellipse cx="${R1(x - r * 0.12)}" cy="${R1(y - r * 0.05)}" rx="${R1(r * 0.62)}" ry="${R1(r * 0.24)}" fill="none" stroke="${mix('#4a4a56', '#9a9aa6', g)}" stroke-width="${(r * 0.12).toFixed(2)}"/>`); counter.n++;   // the struck rim of the design
    if (glint) {                                                                     // the flame caught on it
      out.push(ribbon([[x + r * 0.1, y - r * 0.2], [x + r * 0.55, y - r * 0.06]], r * 0.22, '#fff8e8', [0.3, 0.8, 0.3])); counter.n++;
    }
  };
  {
    const cr = mulberry32(seed + 99);
    // the cloth, folded open (a made thing: straight edges, soft folds)
    out.push(`<path d="M${LAMP.x + 26} ${LAMP.y + 6}L${LAMP.x + 96} ${LAMP.y - 2}L${LAMP.x + 108} ${LAMP.y + 26}L${LAMP.x + 36} ${LAMP.y + 36}Z" fill="#6a2a2e"/>`); counter.n++;
    strokes(out, counter, {
      rng: cr, n: 140, sample: rej(LAMP.x + 26, LAMP.y - 2, LAMP.x + 108, LAMP.y + 36, (x, y) => y > LAMP.y + 6 - (x - LAMP.x - 26) * 0.11 && y < LAMP.y + 36 - (x - LAMP.x - 36) * 0.14 && x > LAMP.x + 26 + (y - LAMP.y - 6) * 0.33),
      dir: () => -0.12, col: (x, y, r) => jig(ramp(['#3a1420', '#6a2a2e', '#a04a3e', '#d87a5a'], Math.min(1, L(x, y) * 1.1 + (r() - 0.5) * 0.15)), r, 5),
      len: 7, lw: 2.2, steps: 2, lenJ: 0.4, relief: 0.3, flow: 0,
    });
    const nine = [];
    for (let i = 0; i < 9; i++) {
      let x, y, ok = false;
      for (let t = 0; t < 40 && !ok; t++) { x = LAMP.x + 42 + cr() * 58; y = LAMP.y + 6 + cr() * 24; ok = nine.every(([a, b]) => Math.hypot(a - x, (b - y) * 2) > 11); }
      nine.push([x, y]);
    }
    nine.sort((a, b) => a[1] - b[1]).forEach(([x, y], i) => coin(x, y, 7.4, i % 2 === 0, cr));
  }

  /* ---------------- 7. THE TENTH — at the edge of the light, half in the crack ---------------- */
  {
    E.groundShadow(out, counter, COIN.x + 5, COIN.y + 4, 13, 3.2, { dir: 0.6, reach: 1, op: 0.7, tint: '#120c18' });
    coin(COIN.x, COIN.y, 10, true);
    // it lies tilted into the crack, so its far side is lost in the dark of it
    out.push(`<path d="M${COIN.x + 1} ${COIN.y - 3}Q${COIN.x + 9} ${COIN.y} ${COIN.x + 6} ${COIN.y + 4}L${COIN.x + 9} ${COIN.y + 6}L${COIN.x + 12} ${COIN.y - 2}Z" fill="#120c16" opacity="0.8"/>`); counter.n++;
    // the one glint: a small four-point star of the flame, the only thing out here that shines
    const gx = COIN.x + 2, gy = COIN.y - 2;
    for (const [dx, dy, l] of [[0, -1, 16], [0, 1, 10], [1, 0, 13], [-1, 0, 13]]) {
      out.push(ribbon([[gx, gy], [gx + dx * l * 0.5, gy + dy * l * 0.5], [gx + dx * l, gy + dy * l]], 1.6, '#fffbee', [0.9, 0.4, 0.05])); counter.n++;
    }
    out.push(`<circle cx="${gx}" cy="${gy}" r="2.6" fill="#ffffff"/>`); counter.n++;
    strokes(out, counter, {                                                           // and the lamp's reach just touching the floor round it
      rng: mulberry32(seed + 111), n: 40,
      sample: r => { const a = r() * Math.PI * 2, dd = 6 + Math.pow(r(), 0.8) * 20; return [COIN.x + Math.cos(a) * dd, COIN.y + Math.sin(a) * dd * 0.35]; },
      dir: () => 0.04, col: (x, y, r) => jig(mix('#8a6040', '#3a2a28', Math.hypot(x - COIN.x, (y - COIN.y) * 2.5) / 24), r, 5),
      len: 5, lw: 1.6, steps: 2, lenJ: 0.5, relief: 0.2, op: 0.55, flow: 0,
    });
  }
  E.setManifold && E.setManifold(0.012);

  const ALT = 'Night, inside a small house, seen from low on its earthen floor. A clay oil lamp burns on the floor, its warm pool of light showing the curving marks a broom has just swept in the dust. Beside the lamp nine silver coins lie together on a red cloth, and a twig broom lies dropped on the floor pointing away into the dark. Out at the very edge of the light, half slipped into a crack in the floor, a tenth silver coin has just caught the flame: one small bright glint. The lost piece, about to be found.';
  return svgWrap(ALT, out.join('\n'));
}
