// gen/plates/pilot-fire.mjs — "The first flame" painted WITH fire.
// PILOT for the phenomenon medium: same composition as flame (the great
// golden flame descending through a swirling night toward a child holding an
// unlit candle) but the SURFACE is simulated. The flame is a particle
// combustion sim; the night is a wind field advecting cold tracers; the
// stars are tight local vortex sims. The ground, the child, the candle are
// composed silhouettes — the still center the forces move around.
//
// Paint order (= rng order — append, don't reorder):
//   1. GROUND RECT + the temperature field (the flame's reach, defined early)
//   2. THE NIGHT  — wind-field tracers, deep pass then bright pass
//   3. STARS      — local vortex spirals (incl. the three magi stars egg)
//   4. THE FLAME  — combustion sim: column, licking head, free sparks,
//                   falling sparks toward the wick
//   5. GROUND     — hillside strokes, spire egg, warm glow pool
//   6. FIGURES    — the child (capsules + rim-light), the unlit candle

import { makeWind, advect, combust, traceRibbons } from '../sim.mjs';

export const name = 'pilot-fire';
export const title = 'The first flame (painted with fire)';
export const caption = 'The same scene — but the flame painted itself.';
export const seed = 20260612;
export const focal = { x: 408, y: 300 };

export function paint(E) {
  const {
    mulberry32, fbm, curlV, mix, ramp, jig, strokes, rej,
    paintFigure, paintPath, inCap, svgWrap, R1, W, H,
    GOLD, GOLD_PALE, GOLD_DEEP, GOLD_HOT, NIGHT, DARKEST,
  } = E;

  const rng = mulberry32(seed);
  const out = [];
  const counter = { n: 0 };

  /* ---------------- 1. GROUND + TEMPERATURE FIELD ---------------- */
  out.push(`<rect width="${W}" height="${H}" fill="${DARKEST}"/>`);

  const hillY = x => 432 - 62 * Math.exp(-(((x - 410) / 290) ** 2)) - 14 * Math.sin(x / 130);

  // the flame's descending arc — same spine as the brush version
  const SRC = [500, 150], CTL = [592, 252], HAND = [421, 300];
  const fl = t => {
    const u = 1 - t;
    return [u * u * SRC[0] + 2 * u * t * CTL[0] + t * t * HAND[0],
            u * u * SRC[1] + 2 * u * t * CTL[1] + t * t * HAND[1]];
  };
  const flTan = t => { const a = fl(Math.max(0, t - 0.02)), b = fl(Math.min(1, t + 0.02)); return Math.atan2(b[1] - a[1], b[0] - a[0]); };
  // temperature: the flame's reach, hottest at the head — this couples the
  // night to the fire (buoyancy + brightness near the column)
  const temp = (x, y) => {
    let g = 0;
    for (let t = 0; t <= 1.001; t += 0.125) {
      const p = fl(t);
      g = Math.max(g, (0.32 + 0.68 * t) * Math.exp(-Math.hypot(x - p[0], y - p[1]) / 170));
    }
    return Math.min(1, g);
  };

  /* ---------------- 2. THE NIGHT (wind field) ---------------- */
  // one continuous wind: large-scale curl + three coherent vortices (the main
  // one births the flame, two lesser ones will hold stars)
  const V = [
    { x: 500, y: 150, s: 240, f: 95 },
    { x: 150, y: 95, s: 150, f: 55 },
    { x: 705, y: 235, s: 110, f: 45 },
  ];
  const wind = makeWind({ seed: 11, scale: 150, gain: 130, vortices: V, drift: [24, 0] });
  // heat disturbs the wind: tracers near the column get buoyancy (rise) and
  // a pull into the flame's updraft
  const skyVel = (x, y) => {
    const [vx, vy] = wind(x, y);
    const T = temp(x, y);
    return [vx, vy - T * 55];
  };
  const skySpawn = r => {
    for (let k = 0; k < 20; k++) {
      const x = -20 + r() * (W + 40), y = -20 + r() * 470;
      if (y < hillY(x) + 10) return { x, y, heat: 0 };
    }
    return null;
  };
  // deep pass: long faint cold traces — the body of the sky
  const deep = advect({ rng, n: 950, spawn: skySpawn, vel: skyVel, dt: 1, steps: 13, speed: 3.4 });
  traceRibbons(out, counter, deep, {
    rng, chunk: 7, relief: 0.5,
    width: (h, t, m) => 4.6 * (0.75 + 0.5 * fbm(m.x / 60, m.y / 60, 19)),
    color: (h, t, r, m) => {
      const T = temp(m.x, m.y);
      let c = ramp(NIGHT.slice(0, 4), 0.25 + fbm(m.x / 120, m.y / 120, 5) * 0.8);
      c = mix(c, '#c9a050', T * 0.4);
      return jig(c, r, 9);
    },
  });
  // bright pass: shorter, livelier tracers riding the same wind — the shimmer
  const lively = advect({ rng, n: 1500, spawn: skySpawn, vel: skyVel, dt: 1, steps: 9, speed: 3.0 });
  traceRibbons(out, counter, lively, {
    rng, chunk: 4, relief: 0.7,
    width: (h, t, m) => 3.1 * (0.6 + 0.8 * fbm(m.x / 40, m.y / 40, 23)),
    color: (h, t, r, m) => {
      const T = temp(m.x, m.y);
      let near = 1e9;
      for (const v of V) near = Math.min(near, Math.hypot(m.x - v.x, m.y - v.y) / v.f);
      // citron flecks woven into the vortex arms
      if (near < 1.6 && r() < 0.05) return jig(mix(GOLD_DEEP, '#b3a05a', r()), r, 14);
      // complementary spark where the flame's reach dies into blue
      if (T > 0.17 && T < 0.32 && r() < 0.05) return jig('#d96f2e', r, 18);
      const tt = Math.max(0, Math.min(1, 0.85 - near * 0.22)) + fbm(m.x / 90, m.y / 90, 31) * 0.35;
      let c = ramp(NIGHT, tt);
      c = T > 0.05 ? mix(c, '#c9a050', T * 0.55) : mix(c, '#0c1228', 0.3);
      return jig(c, r, 12);
    },
  });

  /* ---------------- 3. STARS (local vortex sims) ---------------- */
  // each star is its own tiny weather: tracers spiraling a tight vortex
  const star = (cx, cy, R, n, hot) => {
    const sv = makeWind({ seed: 29, scale: 26, gain: 8, vortices: [{ x: cx, y: cy, s: 95, f: 9 }] });
    const tr = advect({
      rng, n,
      spawn: r => { const a = r() * Math.PI * 2, d = 2 + Math.pow(r(), 0.8) * R; return { x: cx + Math.cos(a) * d, y: cy + Math.sin(a) * d * 0.85, d }; },
      vel: (x, y) => { const [vx, vy] = sv(x, y); const dx = cx - x, dy = cy - y, m = Math.hypot(dx, dy) + 1e-6; return [vx + dx / m * 2.2, vy + dy / m * 2.2]; }, // slight inward pull -> spiral
      dt: 1, steps: 9, speed: 1.9,
    });
    traceRibbons(out, counter, tr, {
      rng, chunk: 5, relief: 0.8,
      width: (h, t, m) => 2.6 * (1.15 - m.d / (R + 4)),
      color: (h, t, r, m) => jig(ramp([hot ? '#fffdf0' : GOLD_HOT, GOLD_PALE, GOLD_DEEP, '#8a7a4a'], m.d / (R + 2)), r, 9),
    });
    // hot core: short dabs swirling tight inside the eye — no dark hole
    const core = advect({
      rng, n: Math.max(10, Math.round(n * 0.4)),
      spawn: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 1.6) * R * 0.28; return { x: cx + Math.cos(a) * d, y: cy + Math.sin(a) * d, d }; },
      vel: (x, y) => sv(x, y),
      dt: 1, steps: 4, speed: 1.5,
    });
    traceRibbons(out, counter, core, {
      rng, chunk: 4, relief: 0,
      width: () => 2.4,
      color: (h, t, r, m) => jig(ramp([hot ? '#fffdf0' : GOLD_HOT, GOLD_PALE], m.d / (R * 0.3)), r, 7),
    });
  };
  star(150, 95, 24, 110, true);
  star(705, 235, 20, 90, false);
  // egg: exactly THREE small stars in a row (the magi's count)
  star(196, 56, 9, 36, false);
  star(230, 49, 9, 36, false);
  star(264, 43, 9, 36, true);

  /* ---------------- 4. THE FLAME (combustion sim) ---------------- */
  // heat -> pigment: white-gold core, gold, amber, ember orange, violet smoke
  const FIRE = ['#3a3360', '#6a4a6e', '#b35a2e', '#d96f2e', '#e8b33d', GOLD, GOLD_PALE, GOLD_HOT, '#fffdf0'];
  const fireCol = (h, r, jm = 8) => jig(ramp(FIRE, h), r, jm);

  // fine turbulence inside the fire — separate, tighter curl than the sky's
  const fireTurb = (x, y) => curlV(x, y, 77, 26);

  // the fire is born at the main vortex: a gold heart-knot, its own tiny sim
  star(SRC[0], SRC[1], 15, 95, true);

  // spine samples for the column's confinement force (the flame argues with
  // buoyancy but never forgets the way down)
  const SPINE = [];
  for (let t = 0; t <= 1.0001; t += 0.01) SPINE.push(fl(t)); // dense: a coarse spine beads the column at its sample points
  const spinePull = (x, y) => {
    let bx = 0, by = 0, bd = 1e9;
    for (const p of SPINE) { const d = Math.hypot(x - p[0], y - p[1]); if (d < bd) { bd = d; bx = p[0]; by = p[1]; } }
    return [bx - x, by - y, bd];
  };

  // 4a. THE COLUMN — emitters along the descending arc; particles are born
  // moving WITH the descent, buoyancy fights it, turbulence bends it: the
  // body of the flame emerges from that argument.
  const column = combust({
    rng, n: 1550, dt: 0.55, drag: 0.18, heatDecay: 0.955,
    emit: r => {
      const t = Math.pow(r(), 0.5);                 // bias emitters toward the head
      const p = fl(t);
      const a = flTan(t) + Math.PI / 2;
      const off = (r() + r() - 1) * (16 * (1 - t * 0.6) + 4);
      const sp = 2.8 + r() * 2;
      const ta = flTan(t) + (r() - 0.5) * 0.28;
      return {
        x: p[0] + Math.cos(a) * off, y: p[1] + Math.sin(a) * off,
        vx: Math.cos(ta) * sp, vy: Math.sin(ta) * sp,
        heat: (0.55 + 0.45 * t) - Math.abs(off) * 0.014 + r() * 0.06,
        life: 5 + Math.floor(r() * 4), t0: t,
      };
    },
    forces: (p, s, r) => {
      const [tx, ty] = fireTurb(p.x, p.y);
      const buoy = -2.5 * p.heat;                   // hot air rises — gently, against the descent
      const [px, py] = spinePull(p.x, p.y);         // confinement: the column holds its arc
      // turbulence is flicker, not fringe: the tangential flow dominates
      return [tx * 62 + px * 0.4, ty * 62 + buoy + py * 0.4];
    },
  });
  traceRibbons(out, counter, column, {
    rng, chunk: 4, relief: 0.85,
    width: (h, t, m) => 1.2 + h * 4.6,
    color: (h, t, r) => fireCol(h, r),
  });

  // 4b. THE HEAD — a dense burst at the flame's face above the candle:
  // hottest particles, strongest buoyancy, licks and eddies break upward
  const head = fl(0.96);
  const headBurst = combust({
    rng, n: 380, dt: 0.55, drag: 0.16, heatDecay: 0.945,
    emit: r => {
      const a = r() * Math.PI * 2, d = Math.pow(r(), 1.6) * 12;
      return {
        x: head[0] + Math.cos(a) * d, y: head[1] + Math.sin(a) * d * 1.3 - 2,
        vx: (r() - 0.5) * 3, vy: -1 - r() * 1.8,
        heat: 1 - d * 0.022 + r() * 0.04,
        life: 4 + Math.floor(r() * 5),              // dabs: the teardrop is a mass of paint
      };
    },
    forces: (p, s, r) => {
      const [tx, ty] = fireTurb(p.x, p.y);
      // pinch toward the head's axis low down so the base stays a teardrop,
      // free turbulence higher up so the tongues lick and tear
      const rise = head[1] - p.y;
      const pinch = Math.max(0, 1 - rise / 34) * (head[0] - p.x) * 1.2;
      return [tx * 95 + pinch, ty * 95 - 10 * p.heat];
    },
  });
  traceRibbons(out, counter, headBurst, {
    rng, chunk: 3, relief: 1,
    width: (h, t, m) => 1.3 + h * 4.4,
    color: (h, t, r) => fireCol(Math.min(1, h * 1.04), r, 5),
  });

  // 4b'. THE LICKS — a handful of long-lived hot particles riding stronger
  // turbulence: each one becomes a distinct tongue, tapering as it cools.
  // Few and deliberate, the way fire actually licks — not an even fuzz.
  const licks = combust({
    rng, n: 9, dt: 0.6, drag: 0.1, heatDecay: 0.965,
    emit: r => {
      const a = -Math.PI / 2 + (r() - 0.5) * 1.5;
      return {
        x: head[0] + (r() - 0.5) * 14, y: head[1] - 2 - r() * 6,
        vx: Math.cos(a) * 2.4, vy: -2.4 - r() * 2,
        heat: 0.95 + r() * 0.05,
        life: 8 + Math.floor(r() * 4),
        ox: r() * 400,                               // each tongue rides its own weather
      };
    },
    forces: (p, s, r) => {
      const [tx, ty] = fireTurb(p.x * 1.3 + p.ox, p.y * 1.3);
      return [tx * 190, ty * 190 - 6 * p.heat];     // turbulence wins: the tongue curls
    },
  });
  traceRibbons(out, counter, licks, {
    rng, chunk: 3, relief: 0,
    width: (h, t) => (1 - t) * 5 + 0.8,             // tapers to a point as it rises
    color: (h, t, r) => fireCol(Math.max(0.55, h), r, 7),
  });

  // 4c. FREE SPARKS — the few that escape: fast, light, long-lived, dying
  // to ember-violet as they climb away from the column
  const sparks = combust({
    rng, n: 26, dt: 0.7, drag: 0.09, heatDecay: 0.87,
    emit: r => {
      const t = 0.75 + r() * 0.25;                  // sparks tear free near the head only
      const p = fl(t);
      return {
        x: p[0] + (r() - 0.5) * 18, y: p[1] + (r() - 0.5) * 12,
        vx: (r() - 0.5) * 7, vy: -1.4 - r() * 2.4,  // sideways scatter, not a comb
        heat: 0.85 + r() * 0.15, life: 4 + Math.floor(r() * 4),
        ox: r() * 300,
      };
    },
    forces: (p, s, r) => {
      const [tx, ty] = fireTurb(p.x * 0.7 + p.ox, p.y * 0.7);
      return [tx * 95, ty * 95 - 6 * p.heat];
    },
  });
  traceRibbons(out, counter, sparks, {
    rng, chunk: 4, relief: 0,
    width: (h, t) => 0.5 + h * 1.3,
    color: (h, t, r) => fireCol(h, r, 12),
  });

  // 4d. FALLING SPARKS — the story beat: embers drift down toward the wick,
  // the moment before the lighting
  const wick = [423, hillY(406) + 4 - 38 * 1.3]; // candle tip (figure scale below)
  const falling = combust({
    rng, n: 34, dt: 0.7, drag: 0.12, heatDecay: 0.95,
    emit: r => ({
      x: head[0] + (r() - 0.5) * 14, y: head[1] + 6 + r() * 8,
      vx: (wick[0] - head[0]) * 0.06 + (r() - 0.5) * 1.2, vy: 1.4 + r() * 1.4,
      heat: 0.72 + r() * 0.18, life: 6 + Math.floor(r() * 6),
    }),
    forces: (p, s, r) => {
      const [tx, ty] = fireTurb(p.x, p.y);
      return [tx * 45 + (wick[0] - p.x) * 0.4, ty * 45 + 2.6]; // gravity wins, wick beckons
    },
  });
  traceRibbons(out, counter, falling, {
    rng, chunk: 4, relief: 0,
    width: (h, t) => 0.8 + h * 1.5,
    color: (h, t, r) => fireCol(h * 0.95, r, 10),
  });

  /* ---------------- 5. GROUND ---------------- */
  strokes(out, counter, {
    rng, n: 700,
    sample: rej(-10, 330, 810, 510, (x, y) => y > hillY(x)),
    dir: () => 0,
    col: (x, y, r) => {
      const litR = Math.hypot(x - HAND[0], y - HAND[1]);
      const t = Math.max(0, 0.38 - litR / 360) + fbm(x / 70, y / 70, 47) * 0.18;
      let c = mix('#10172e', '#2a3050', Math.min(1, t * 2));
      c = mix(c, '#8a6a30', Math.max(0, 0.5 - litR / 240) * 0.8);
      return jig(c, r, 7);
    },
    len: 22, lw: 4.2, steps: 3, wild: 0.12, lenJ: 0.5,
  });
  strokes(out, counter, {
    rng, n: 300,
    sample: rej(-10, 335, 810, 470, (x, y) => y > hillY(x) && y < hillY(x) + 40),
    dir: x => { const e = 6; return Math.atan2(hillY(x + e) - hillY(x - e), 2 * e); },
    col: (x, y, r) => jig(mix('#1a2240', '#33406b', fbm(x / 60, y / 60, 53)), r, 8),
    len: 18, lw: 3.2, steps: 3, wild: 0.1,
  });

  // egg: the tiny church spire on the far-left horizon (the painter's other sky)
  {
    const spx = 96, spy = hillY(96);
    const spCol = (x, y, r) => jig('#0d1326', r, 4);
    out.push(`<path d="M${spx - 3.4} ${R1(spy - 10)}L${spx} ${R1(spy - 34)}L${spx + 3.4} ${R1(spy - 10)}L${spx + 3.8} ${R1(spy + 3)}L${spx - 3.8} ${R1(spy + 3)}Z" fill="#0d1326" opacity="0.92"/>`);
    counter.n++;
    paintPath(out, counter, rng, [[spx - 3.5, spy + 2], [spx - 3.5, spy - 10], [spx + 3.5, spy - 10], [spx + 3.5, spy + 2]], spCol, { lw: 2, len: 3.5, density: 0.8, jitter: 0.7 });
    paintPath(out, counter, rng, [[spx - 3.4, spy - 10], [spx, spy - 33], [spx + 3.4, spy - 10]], spCol, { lw: 1.5, len: 3, density: 0.9, jitter: 0.5 });
  }

  // warm glow pool spilling onto the hill beneath the descending flame
  strokes(out, counter, {
    rng, n: 160,
    sample: r => { const a = r() * Math.PI, d = Math.pow(r(), 1.3) * 70; const x = 416 + Math.cos(a + Math.PI) * d * 1.4, y0 = Math.max(hillY(416 + Math.cos(a + Math.PI) * d * 1.4) + 2, 360); return [x, y0 + Math.abs(Math.sin(a)) * d * 0.45]; },
    dir: x => { const e = 6; return Math.atan2(hillY(x + e) - hillY(x - e), 2 * e); },
    col: (x, y, r) => { const d = Math.hypot(x - 420, y - hillY(420) - 8); return jig(ramp([mix(GOLD_DEEP, '#3a3a3a', 0.25), '#6b5a33', '#33305a', '#1a2240'], d / 75), r, 9); },
    len: 13, lw: 2.8, steps: 2,
  });

  /* ---------------- 6. FIGURES (the still center) ---------------- */
  const feetY = hillY(406) + 4;
  const cs = 1.3;
  const caps = [
    { ax: 405, ay: feetY - 33, bx: 405, by: feetY - 30, r: 5 },
    { ax: 405, ay: feetY - 25, bx: 406, by: feetY - 5, r: 6.5 },
    { ax: 409, ay: feetY - 22, bx: 417, by: feetY - 18, r: 2.2 },
    { ax: 403, ay: feetY - 5, bx: 401, by: feetY, r: 2.2 },
    { ax: 408, ay: feetY - 5, bx: 410, by: feetY, r: 2.2 },
  ].map(c => ({ ax: 405 + (c.ax - 405) * cs, ay: feetY + (c.ay - feetY) * cs, bx: 405 + (c.bx - 405) * cs, by: feetY + (c.by - feetY) * cs, r: c.r * cs }));
  // the child in red — dark crimson mass against the night, as in the book
  paintFigure(out, counter, rng, caps, (x, y, r) => jig(mix('#2a0d12', '#4a1418', r() * 0.6), r, 6), 1.8);
  // gold rim-light on the flank facing the flame
  strokes(out, counter, {
    rng, n: 26,
    sample: rej(398, feetY - 50, 425, feetY - 4, (x, y) => caps.some(c => inCap(x, y, c)) && !caps.some(c => inCap(x + 4, y - 4, c))),
    dir: () => -Math.PI / 2.6,
    col: (x, y, r) => jig(mix(GOLD_DEEP, '#8a6a2a', r() * 0.5), r, 10),
    len: 4.5, lw: 1.5, steps: 2,
  });
  // the unlit candle: a pale stick above the hand — no flame on it yet
  out.push(`<path d="M${R1(421.2)} ${R1(feetY - 24.5)}L${R1(423)} ${R1(feetY - 38)}" stroke="#e8dfc4" stroke-width="3.2" stroke-linecap="round" fill="none"/>`);
  counter.n++;

  return svgWrap('A vast swirling night painted by a simulated wind; a great golden flame, itself a particle fire, descends toward a small child in red holding an unlit candle on a dark hillside.', out.join('\n'));
}
