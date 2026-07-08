// gen/sim.mjs — particle simulation helpers for "phenomenon plates".
// The medium IS the phenomenon: instead of authoring strokes that *look* like
// fire or wind, we simulate the force and paint each particle's PATH as an
// oil ribbon (engine ribbon/relief), so the physics arrives wearing paint.
//
// Determinism: every function takes the plate's one seeded rng; fixed
// timestep, fixed iteration order. Same seed -> same painting.
//
// API
//   makeWind({seed,scale,gain,vortices,drift}) -> (x,y)->[vx,vy]
//       large-scale curl noise + coherent vortices + a drift constant.
//   advect({rng,n,spawn,vel,dt,steps,speed})    -> traces
//       kinematic tracers: position follows the field directly (cold smoke,
//       sky wind, star spirals). speed normalizes the field so trace length
//       is controlled by dt*steps, not field magnitude.
//   combust({rng,n,emit,forces,dt,drag,heatDecay}) -> traces
//       dynamic particles: emit() births {x,y,vx,vy,heat,life}; forces()
//       returns [fx,fy] per step (buoyancy, turbulence, attraction); velocity
//       integrates with drag; heat decays multiplicatively per step.
//   traceRibbons(out,counter,traces,{width,color,rng,chunk,relief})
//       renders each trace as chained tapered ribbons. width(heat,t,meta),
//       color(heat,t,rng,meta). Chunking lets color evolve along the path
//       (white-gold head -> ember tail) while the taper profile spans the
//       WHOLE trace, so chunks melt into one continuous stroke.
//
// A trace is {pts:[[x,y]...], heats:[h...], meta:particle}.

import { curlV, swirlV, ribbon, reliefPair, lum } from './engine.mjs';

export function makeWind({ seed = 11, scale = 150, gain = 130, vortices = [], drift = [0, 0] } = {}) {
  return (x, y) => {
    let vx = drift[0], vy = drift[1];
    for (const v of vortices) { const [a, b] = swirlV(x, y, v.x, v.y, v.s, v.f); vx += a; vy += b; }
    const [cx, cy] = curlV(x, y, seed, scale);
    vx += cx * gain; vy += cy * gain;
    return [vx, vy];
  };
}

// kinematic tracers — long faint traces ARE the sky
export function advect({ rng, n, spawn, vel, dt = 1, steps = 12, speed = 2.4 }) {
  const traces = [];
  for (let i = 0; i < n; i++) {
    const p = spawn(rng, i);
    if (!p) continue;
    let { x, y } = p;
    const pts = [[x, y]], heats = [p.heat ?? 0];
    for (let s = 0; s < steps; s++) {
      const [vx, vy] = vel(x, y, s, p);
      const m = Math.hypot(vx, vy) || 1;
      x += (vx / m) * speed * dt;
      y += (vy / m) * speed * dt;
      pts.push([x, y]);
      heats.push(p.heat ?? 0);
    }
    traces.push({ pts, heats, meta: p });
  }
  return traces;
}

// combustion — buoyancy, drag, turbulence, finite life, decaying heat
export function combust({ rng, n, emit, forces, dt = 0.5, drag = 0.1, heatDecay = 0.94, recordEvery = 1 }) {
  const traces = [];
  for (let i = 0; i < n; i++) {
    const p = emit(rng, i);
    if (!p) continue;
    const pts = [[p.x, p.y]], heats = [p.heat];
    const life = p.life;
    const dg = p.drag ?? drag, hd = p.heatDecay ?? heatDecay;
    for (let s = 0; s < life; s++) {
      const [fx, fy] = forces(p, s, rng);
      p.vx = (p.vx + fx * dt) * (1 - dg);
      p.vy = (p.vy + fy * dt) * (1 - dg);
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.heat *= hd;
      if (s % recordEvery === 0) { pts.push([p.x, p.y]); heats.push(p.heat); }
    }
    traces.push({ pts, heats, meta: p });
  }
  return traces;
}

// render traces as oil: chained tapered ribbons + relief slivers on wide hot ones
export function traceRibbons(out, counter, traces, { width, color, rng, chunk = 3, relief = 0, taper = 1 }) {
  for (const tr of traces) {
    const pts = tr.pts, hs = tr.heats, N = pts.length;
    if (N < 2) continue;
    for (let a = 0; a < N - 1; a += chunk) {
      const b = Math.min(N - 1, a + chunk);
      const seg = pts.slice(a, b + 1);
      if (seg.length < 2) continue;
      const mid = Math.round((a + b) / 2);
      const tm = mid / (N - 1);
      const hm = hs[mid];
      const w = width(hm, tm, tr.meta);
      if (w <= 0.15) continue;
      const fill = color(hm, tm, rng, tr.meta);
      // taper spans the WHOLE trace (touch down, press, lift), flat inside —
      // so consecutive chunks read as one continuous loaded-brush stroke
      const prof = seg.map((_, i) => {
        if (!taper) return 0.5;
        const t = (a + i) / (N - 1);
        return 0.18 + 0.34 * Math.sin(Math.PI * Math.min(1, Math.max(0.04, t)));
      });
      out.push(ribbon(seg, w, fill, prof));
      counter.n++;
      if (relief > 0 && w > 3 && lum(fill) > 0.14) { out.push(reliefPair(seg, w, fill, relief, prof)); counter.n += 2; }
    }
  }
}
