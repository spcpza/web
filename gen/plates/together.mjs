// gen/plates/together.mjs — "Side by side" (1 Corinthians 3:9)
//
// "For we are labourers together with God." (1 Cor 3:9)
//
// The recurring RED child — washed clean and glowing with a soft WHITE AURA —
// has himself been led home; now he TURNS BACK, takes the hand of ANOTHER
// person still standing in the cold dark, and LEADS them along a brightening
// path toward a great radiant GOLD Light far ahead: a glowing home on the
// horizon. The Light ahead is the TRUE source and the DESTINATION; the red
// child only carries and reflects it — a guide who knows the way, never the
// source. He points the way and walks it beside the other.
//
// Distinct from candle (two figures passing a flame at a dawn swirl, in
// place): THIS is a JOURNEY — two travellers on a road, the led one drawn out
// of the deep-blue dark behind them, the Light a distant goal they walk toward
// together.
//
// STYLE: bright reaching path; a radiant gold Light/home far ahead (the source
// + the goal). Red child = deep red, bold outline, WHITE AURA. The led figure
// = a darker colour (cold blue-violet), only just beginning to catch the light.
// No pure black — the dark behind is deep blue/violet. Munch: the living things
// curve, the cold dark lies in straighter streaks; the road is a made thing.
export const name = 'together';
export const title = 'Side by side';
export const caption = 'He lets you help bring others home.';
export const seed = 20260618;
export const focal = { x: 360, y: 300 }; // the two travellers and the road reaching toward the distant Light
// MOBILE 3D — depth planes (FAR→NEAR). BACKGROUND (opaque): the cold deep-blue
// night, the far radiant GOLD Light/home on the horizon, and the bright road
// reaching toward it. MID: the led figure's dark surround + the road's warm
// pool the pair stand in. FOREGROUND: the two figures, hand in hand, nearest.
export const layers = [
  { name: 'bg', opaque: true },   // cold night + the distant gold Light/home + the reaching road
  { name: 'mid' },                // the dark the led one is leaving + the warm floor pool
  { name: 'fg' },                 // the two travellers, hand in hand (nearest)
];

export function paint(E, opts = {}) {
  const {
    mulberry32, fbm, curlV, goldenSpiralV, mix, ramp, jig, strokes, rej, segDist, ribbon,
    paintChild, castShadow, personCaps, paintFace, paintPath, lightRadial, klimtGold, goldSparks, inCap,
    svgWrap, R1, W, H,
    GOLD, GOLD_PALE, GOLD_DEEP, GOLD_HOT,
  } = E;

  const rng = mulberry32(seed);
  const out = [];
  const counter = { n: 0 };
  const LAYER = opts.layer || 'full';

  // the deepest dark is a nameable cold blue-violet — never black. The two are
  // still in the night, but the Light ahead is the brightest thing and the road
  // brightens toward it.
  out.push(`<rect width="${W}" height="${H}" fill="#121a3e"/>`);

  /* ====================== THE BONES ====================== */
  // The great gold Light / glowing HOME sits far ahead, high and small on the
  // horizon at upper-right — the true SOURCE and the DESTINATION. The two
  // travellers stand low-left, in the dark, and a bright road reaches up and
  // away from them toward the Light. They are about to walk it together.
  const HOME = { x: 612, y: 150 };                 // the distant radiant gold Light / home (source + goal)
  const RED = { x: 276, feet: 438 };               // the red child — the guide, turned back, leading
  const LED = { x: 214, feet: 448 };               // the led figure — close enough that the reaching hands actually CLASP
  const HANDR = [245, 409];                         // the red child's hand, reaching back — meets the led hand
  const HANDL = [243, 410];                         // the led figure's hand, taken (same clasp point)

  const gHome = lightRadial(HOME.x, HOME.y, 200);  // the radiance of the distant Light/home

  // THE ROAD OF LIGHT — a bright spine running from the travellers' feet up and
  // away toward the distant Light: the path home. Wide where they stand,
  // narrowing as it climbs toward the small bright goal (perspective + reaching).
  const roadSpine = t => [RED.x - 18 + t * (HOME.x - RED.x + 18), RED.feet - 6 - t * (RED.feet - 6 - HOME.y - 22)];
  const road = (x, y) => {
    let g = 0;
    for (let i = 0; i <= 12; i++) {
      const t = i / 12, p = roadSpine(t);
      const w = 86 - t * 60;                         // wide at their feet, reaching thin toward the Light
      g = Math.max(g, (0.92 - t * 0.35) * Math.exp(-segDist(x, y, p[0], p[1], p[0] + 0.1, p[1]) / w));
    }
    return g;
  };
  // total light: the distant home glows, the road carries it back toward them
  const light = (x, y) => Math.min(1, gHome(x, y) * 1.05 + road(x, y) * 0.82);

  /* ====================== 1. THE COLD NIGHT ======================
     The dark presses in from the lower-left (the deep they are leaving) and
     gives way toward the gold ahead. Cold air lies in long, near-straight
     streaks (made/cold = straight) that bend only where the Light disturbs them. */
  // THE ALIVE NIGHT (the fractal sky — motion at THREE scales, SKY_STANDARD v2,
  // matching looking/garden): the whole dark WHEELS in one great spiral around
  // the distant Light (macro), a few eddies turn inside the wheel (mid), and
  // every stroke curves with its parent current (micro). Swirls within swirls —
  // the night is not a wall, it is deep moving water, wheeling around the home
  // it all reaches toward.
  const WHEEL_X = 600, WHEEL_Y = 156;                                  // the great wheel's centre, on the distant Light
  const EDDIES = [[140, 70, 60], [340, 96, -58], [486, 150, 54], [220, 182, -50]];
  const nearV = (x, y) => { let m = 1e9; for (const [ex, ey] of EDDIES) m = Math.min(m, Math.hypot(x - ex, y - ey) / 48); return m; };
  const nightDir = (x, y) => {
    let vx = 0, vy = 0;
    { const [a, b] = goldenSpiralV(x, y, WHEEL_X, WHEEL_Y, 115, 260); vx += a; vy += b; }   // 1 · MACRO — the great wheel of the night
    for (const [ex, ey, s] of EDDIES) { const [a, b] = goldenSpiralV(x, y, ex, ey, s, 80); vx += a; vy += b; }   // 2 · MID — eddies turning inside the wheel
    const [c, d] = curlV(x, y, 31, 120); vx += c * 26; vy += d * 26;   // 3 · MICRO — every stroke curves with its parent current
    // the dark still recoils, curving around the distant Light ahead
    const dxc = x - HOME.x, dyc = y - HOME.y;
    const dd = Math.hypot(dxc, dyc) + 1e-6, w = 70 / (1 + dd / 150);
    return Math.atan2(vy + (dyc / dd) * w, vx + (dxc / dd) * w);
  };
  const nightBlue = (x, y) => {
    // deeper and colder toward the lower-left (the dark behind the led one),
    // lifting toward the gold upper-right
    const t = Math.max(0, Math.min(1, 0.06 + ((H - y) / H) * 0.10 + (x / W) * -0.10 + fbm(x / 150, y / 130, 61) * 0.3 + (y / H) * 0.30));
    return ramp(['#2c3f86', '#243678', '#1d2c64', '#182452', '#141c44'], t);   // deep cold night, no black
  };
  const EGLOW = [[140, 70, '#3f549e'], [340, 96, '#41337e'], [486, 150, '#4a3f92'], [220, 182, '#2f5a92']];   // deep night jewels (blue/violet) breathing at the eddy cores
  const nightCol = (x, y, r) => {
    const g = light(x, y);
    if (g > 0.14 && g < 0.3 && r() < 0.05) return jig('#8a5aa0', r, 14);        // violet flicker where gold dies
    let c = nightBlue(x, y);
    for (const [ex, ey, ec] of EGLOW) { const d2 = Math.hypot(x - ex, y - ey); c = mix(c, ec, Math.exp(-d2 / 95) * 0.5); }   // the eddy cores breathe faint jewel light
    if (g > 0.28 && g < 0.55) c = mix(c, '#6f9a50', (g - 0.28) * 2.0);          // gold→blue via green (law of yellow)
    c = mix(c, '#e8c468', Math.max(0, g - 0.45) * 1.35);                        // warmed where the Light reaches
    return jig(c, r, 9);
  };
  // the deep moving night — long streaming strokes that FOLLOW the great wheel
  strokes(out, counter, {
    rng, n: 1050, sample: rej(-14, -14, 814, 514),
    dir: nightDir, col: nightCol,
    len: 44, lw: 9.5, steps: 4, follow: 0.91, wild: 0.05, lenJ: 0.5, impasto: 0.5, relief: 0.55,
  });

  /* ====================== 1.2 SKY-ARM SHEETS — the bold curling Van Gogh arms ======================
     two stacked, gapped swirl-sheets over the smooth night: pale-silver crests
     (#d4ddf4 — bright RELATIVE to the deep night, so the swirls read like road's
     twilight) and soft warm/cool knot-sparks at the vortices. Painted OVER the
     night but BELOW the distant Light + road, so the Light stays the brightest
     thing and the road/travellers are untouched. The night stays deep — only the
     crest EDGES catch light. */
  [{ n: 300, len: 30, lw: 6.0, lift: 0.00 }, { n: 320, len: 26, lw: 5.4, lift: 0.05 }].forEach((e, k) => {
    const srng = mulberry32(seed + 1009 * (k + 1));
    strokes(out, counter, {
      rng: srng, n: e.n, sample: rej(-14, -14, 814, 432),
      dir: nightDir,
      col: (x, y, r) => {
        const near = nearV(x, y);
        if (near < 1.1 && r() < 0.06) return jig(r() < 0.5 ? '#d4ddf4' : '#e6c98a', r, 12);   // BRIGHT knot-sparks (moonlit silver + a touch of warm gold)
        const k2 = fbm(x / 92, y / 92, 71) + (r() - 0.5) * 0.2;
        if (k2 > 0.78) return jig('#d4ddf4', r, 8);                                            // BRIGHT pale-silver cloud-crests (read against the dark)
        let c = nightCol(x, y, r);                                                             // otherwise the deep night — keeps it dark
        if (e.lift) c = mix(c, '#ffffff', e.lift);
        return c;
      },
      len: e.len, lw: e.lw, steps: 5, follow: 0.9, wild: 0.2, lenJ: 0.55, impasto: 0.6, relief: 0.5,
      aJ: (x, y) => 0.16 + Math.max(0, 1.3 - nearV(x, y)) * 0.42,
    });
  });

  /* ====================== 1.5 THE SPARKLE — the dark is not empty ====================== */
  for (let i = 0; i < 84; i++) {
    const x = 8 + rng() * 784, y = 4 + rng() * 470;
    if (light(x, y) > 0.3) continue;                   // not lost inside the gold
    const br = 0.6 + rng() * 1.6;
    const c = jig(mix('#fdf7da', '#cfe0f6', rng() * 0.55), rng, 6);
    out.push(ribbon([[x - br, y], [x + br, y]], 1.1, c)); counter.n++;
    out.push(ribbon([[x, y - br], [x, y + br]], 1.1, c)); counter.n++;
    if (br > 1.4) { out.push(ribbon([[x - br * 1.9, y], [x + br * 1.9, y]], 0.6, jig('#8fb0e0', rng, 6))); counter.n++; }
  }

  /* ====================== 2. THE DISTANT LIGHT / HOME — the source and the goal ======================
     A great radiant gold Light far ahead on the horizon: a glowing home, the
     TRUE source of all the light in the scene and the DESTINATION of the road.
     Reserved gold (Rev 21:23 — the city needs no sun, the Light is its lamp). */
  // the broad gold glow pouring out from the home
  strokes(out, counter, {
    rng, n: 540,
    sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 1.25) * 132; return [HOME.x + Math.cos(a) * d, HOME.y + Math.sin(a) * d * 0.9]; },
    dir: (x, y) => Math.atan2(x - HOME.x, -(y - HOME.y)),   // tangential — a turning halo of light
    col: (x, y, r) => {
      const d = Math.hypot(x - HOME.x, (y - HOME.y) / 0.9);
      if (d > 96 && d < 130 && r() < 0.05) return jig('#8a5aa0', r, 13);        // violet where the gold dies
      return jig(ramp([GOLD_HOT, GOLD_PALE, GOLD, '#d29440', '#8a6a3c', '#3e5a90'], Math.min(1, d / 150)), r, 8);
    },
    len: 13, lw: 3, steps: 2, lenJ: 0.5, wild: 0.1, impasto: 0.6, relief: 0.75,
  });
  // the white-hot heart of the home — the brightest paint in the scene
  strokes(out, counter, {
    rng, n: 200,
    sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 1.3) * 42; return [HOME.x + Math.cos(a) * d, HOME.y + Math.sin(a) * d * 0.92]; },
    dir: (x, y) => Math.atan2(x - HOME.x, -(y - HOME.y)),
    col: (x, y, r) => jig(ramp([GOLD_HOT, mix(GOLD_HOT, GOLD_PALE, 0.5), GOLD_PALE, GOLD], Math.hypot(x - HOME.x, (y - HOME.y) / 0.92) / 46), r, 6),
    len: 8, lw: 2.4, steps: 2, lenJ: 0.45, impasto: 0.55,
  });
  // a Klimt-gold halo of glory ringing the distant home, and sparks of gold leaf
  klimtGold(out, counter, rng, HOME.x, HOME.y, 52, 104, { rings: 5, opacity: 0.42, squash: 0.9 });
  goldSparks(out, counter, rng, HOME.x, HOME.y, 18, 150, 60, { squash: 0.9, big: 0.9, lightFn: gHome });

  const bgRoadStart = out.length;
  /* ====================== 3. THE ROAD OF LIGHT — reaching toward the home ======================
     gold poured forward from the travellers' feet up the road toward the
     distant Light: confident slabs where they stand, fine touches reaching out
     thin toward the goal — the bright path home, brighter the nearer the Light. */
  strokes(out, counter, {
    rng, n: 760,
    sample: rej(120, 130, 700, 470, (x, y) => road(x, y) > 0.24),
    dir: (x, y) => Math.atan2(HOME.y - y, HOME.x - x) + (fbm(x / 80, y / 60, 43) - 0.5) * 0.4,
    col: (x, y, r) => {
      const g = road(x, y) + gHome(x, y) * 0.5;
      return jig(ramp(['#9a6a3a', '#d29440', '#ecb84e', '#f8d472', '#fff0c2'], Math.min(1, g * 1.12)), r, 9);
    },
    // big near the travellers' feet (low-left), reaching to fine touches toward the Light
    len: (x, y) => 6 + 20 * Math.max(0, 1 - Math.hypot(x - RED.x, y - RED.feet) / 460),
    lw: (x, y) => 2.6 + 7 * Math.max(0, 1 - Math.hypot(x - RED.x, y - RED.feet) / 460),
    steps: 2, follow: 0.95, wild: 0.06, lenJ: 0.5, impasto: 0.6, relief: 0.85,
  });
  /* ====================== 3.5 FIREFLIES — the road's edges lit by small living lights ======================
     warm sparks with soft round halos strung loosely along BOTH verges of the
     road, denser toward the distant Light — as if the road home is lit by small
     living lights (Dan 12:3 "they that turn many to righteousness as the stars
     for ever and ever"). Round warm blooms, distinct from the cool 4-point
     stars of the night sparkle; each drifts on a tiny CURVED flight-path
     (living = curved). They live in the road's own plane. */
  {
    const spineA = Math.atan2(HOME.y + 22 - (RED.feet - 6), HOME.x - RED.x + 18); // the road's direction
    const nx = -Math.sin(spineA), ny = Math.cos(spineA);                          // verge normal
    let placed = 0;
    for (let i = 0; i < 320 && placed < 30; i++) {
      const t = 0.08 + Math.pow(rng(), 0.75) * 0.62;            // strung along the road, thinning into the glow
      const p = roadSpine(t);
      const side = rng() < 0.5 ? -1 : 1;                        // BOTH verges
      const w = 86 - t * 60;
      // walk outward from the bright edge until the road's glow dies into the
      // night — the fireflies sit exactly on that living contour and light it
      let d = w * (0.7 + rng() * 0.3), x = 0, y = 0, ok = false;
      for (let k = 0; k < 10; k++) {
        x = p[0] + nx * d * side; y = p[1] + ny * d * side;
        if (light(x, y) < 0.3) { ok = true; break; }
        d += w * 0.22;
      }
      if (!ok) continue;
      x += (rng() - 0.5) * 22; y += (rng() - 0.5) * 16;         // strung LOOSELY, not on a rail
      if (x < 30 || x > 780 || y < 60 || y > 460) continue;
      const g = light(x, y);
      if (g > 0.32 || g < 0.05) continue;                       // sparks live where the dark meets the road-glow
      if (x > 372 && x < 478 && y > 306 && y < 348) continue;   // clear of the incised verse (Γʹ·Θʹ)
      if (Math.hypot(x - HOME.x, y - HOME.y) < 115) continue;   // never lost inside the home's glory
      if (x < 310 && y > 360) continue;                          // clear of the two travellers and the clasp
      const s = 1.1 - t * 0.62;                                  // size ∝ 1/Z: near = bigger, far = smaller
      // the soft warm halo — two breaths of gold light waking the dark around it
      out.push(`<g opacity="0.20"><circle cx="${R1(x)}" cy="${R1(y)}" r="${R1(6.6 * s)}" fill="#e8b054"/></g>`); counter.n++;
      out.push(`<g opacity="0.34"><circle cx="${R1(x)}" cy="${R1(y)}" r="${R1(3.6 * s)}" fill="#f6cf6a"/></g>`); counter.n++;
      // a dim curved drift of flight behind the spark (Munch: the living curve)
      const fa = rng() * Math.PI * 2, fl = (5 + rng() * 5) * s, bend = (rng() - 0.5) * 4 * s;
      out.push(`<g opacity="0.5">${ribbon([
        [x, y],
        [x + Math.cos(fa) * fl * 0.5 - Math.sin(fa) * bend, y + Math.sin(fa) * fl * 0.5 + Math.cos(fa) * bend],
        [x + Math.cos(fa) * fl, y + Math.sin(fa) * fl],
      ], 0.9 * s, '#caa050')}</g>`); counter.n++;
      // the living spark itself — small, warm, and bright (but the Light ahead stays brightest)
      out.push(`<circle cx="${R1(x)}" cy="${R1(y)}" r="${R1(1.7 * s)}" fill="#fff3cf"/>`); counter.n++;
      out.push(`<circle cx="${R1(x - 0.4 * s)}" cy="${R1(y - 0.4 * s)}" r="${R1(0.8 * s)}" fill="#fffef2"/>`); counter.n++;
      placed++;
    }
  }
  const bgEnd = out.length;   // BACKGROUND plane: night + sparkle + distant Light/home + reaching road + fireflies (opaque)

  /* ====================== 4. THE DARK BEHIND THE LED ONE (MID) ======================
     a pocket of deeper blue-violet dark clinging to the led figure's far side —
     the night they are stepping out of, darkest behind them. */
  strokes(out, counter, {
    rng, n: 220,
    sample: rej(120, 320, 230, 500, (x, y) => x < LED.x + 10 && light(x, y) < 0.2),
    dir: (x, y) => -Math.PI / 2 + (fbm(x / 28, y / 28, 47) - 0.5) * 0.9,
    col: (x, y, r) => jig(ramp(['#1a1c50', '#241f5a', '#2c2660'], fbm(x / 40, y / 40, 49)), r, 8),
    len: 9, lw: 4, steps: 2, lenJ: 0.55,
  });
  // the warm floor pool the pair stand in — gold dying outward into the dark
  strokes(out, counter, {
    rng, n: 260,
    sample: r => { const a = r() * Math.PI, d = Math.pow(r(), 1.2) * 150; return [240 + Math.cos(a + Math.PI) * d * 1.3, 446 + Math.abs(Math.sin(a)) * d * 0.22]; },
    dir: () => 0.05,
    col: (x, y, r) => jig(mix(ramp(['#8a6a3c', '#c08544', '#e6ae4e'], Math.hypot((x - 240) / 1.3, (y - 446) * 2.4) / 170), '#f4cc68', 0.12), r, 8),
    len: 14, lw: 3, steps: 2, lenJ: 0.55, wild: 0.1, relief: 0.8,
  });
  const midEnd = out.length;   // MID plane: the dark left behind + the warm floor pool

  /* ====================== 5. THE TWO TRAVELLERS — hand in hand (FG) ======================
     RED, the guide: the recurring red child, washed clean, glowing with a soft
     WHITE AURA, turned BACK toward the one in the dark, his outstretched hand
     taking theirs, his other arm pointing the way up the road toward the Light.
     LED: a darker figure in cold blue-violet, still half in the dark, just
     lifting out of it — their near side only beginning to catch the gold. */
  const _fg = out.length;

  // the led figure FIRST (behind / to the left, deeper in the dark)
  const Lx = LED.x, Lf = LED.feet;
  const ledCaps = personCaps(Lx, Lf - 64, 64, {
    lean: 2,
    rightHand: [Lx + 30, Lf - 38], leftHand: [Lx - 10, Lf - 28],   // RIGHT arm reaches out to the guide's hand; left trails in the dark
    leftFoot: [Lx - 7, Lf], rightFoot: [Lx + 6, Lf],               // mid-step, lifting out of the dark
  });
  castShadow(out, counter, ledCaps, { dir: -0.5 });
  paintChild(out, counter, rng, ledCaps, { cols: ['#3a4674', '#262e54', '#161c38'], seed: 47 });
  // a first glow waking on the led one's near (road-facing) flank — the light arriving
  strokes(out, counter, {
    rng, n: 30,
    sample: rej(Lx, Lf - 58, Lx + 26, Lf - 6, (x, y) => ledCaps.some(c => inCap(x, y, c)) && !ledCaps.some(c => inCap(x - 5, y, c))),
    dir: () => -Math.PI / 2 + 0.25,
    col: (x, y, r) => jig(mix('#3a4364', GOLD_DEEP, 0.3 + light(x, y) * 0.6), r, 9),
    len: 6, lw: 1.8, steps: 2,
  });

  // the RED child — the guide, washed clean, glowing white aura, turned back
  const Rx = RED.x, Rf = RED.feet;
  const redCaps = personCaps(Rx, Rf - 68, 68, {
    lean: 1,
    leftHand: [Rx - 32, Rf - 30], rightHand: [Rx + 26, Rf - 66],   // left arm reaches BACK to the led one's hand; right arm POINTS up the road to the Light
    leftFoot: [Rx - 7, Rf], rightFoot: [Rx + 8, Rf],               // striding toward the Light
  });
  castShadow(out, counter, redCaps, { dir: -0.5 });
  paintChild(out, counter, rng, redCaps, { whiteAura: true });
  // gold rim down the red child's road-facing (right) flank — he carries the Light's glow
  strokes(out, counter, {
    rng, n: 40,
    sample: rej(Rx - 2, Rf - 66, Rx + 30, Rf - 6, (x, y) => redCaps.some(c => inCap(x, y, c)) && !redCaps.some(c => inCap(x + 5, y, c))),
    dir: () => -Math.PI / 2 - 0.2,
    col: (x, y, r) => jig(mix(GOLD_DEEP, '#a3552c', r() * 0.5), r, 10),
    len: 7, lw: 1.9, steps: 2,
  });

  /* ====================== 6. THE CLASPED HANDS — the link ======================
     where the red child's reaching-back hand takes the led one's: a small warm
     knot of strokes, gold passing into the join — they are joined for the road. */
  strokes(out, counter, {
    rng, n: 28,
    sample: r => { const a = r() * Math.PI * 2, d = r() * 7; return [(HANDR[0] + HANDL[0]) / 2 + Math.cos(a) * d, (HANDR[1] + HANDL[1]) / 2 + Math.sin(a) * d * 0.85]; },
    dir: () => 0.2,
    col: (x, y, r) => jig(ramp([GOLD_PALE, GOLD, '#c98e4e', '#7a5a44'], Math.hypot(x - (HANDR[0] + HANDL[0]) / 2, y - (HANDR[1] + HANDL[1]) / 2) / 8 + (r() - 0.5) * 0.2), r, 8),
    len: 4.5, lw: 2, steps: 2, impasto: 0.6,
  });
  const fgRange = [_fg, out.length];   // FOREGROUND plane: the two travellers, hand in hand (nearest)

  /* ====================== HIDDEN EGG — 1 Cor 3:9 in the original Greek ======================
     "we are labourers together with God" — the very verse of this page (working
     together, the guide and the led, with the Light), in the Greek alphabetic
     numerals it was first penned in (Γʹ·Θʹ), cut subtly into the bright road
     between the travellers and the Light they walk toward. A fourth-look secret. */
  E.inscriptionText(out, E.greekRef(3, 9), { x: 392, y: 326, h: 14, body: '#1a1204', edge: '#f6eecc', op: 0.78, edgeOp: 0.55 });

  const ALT = 'A cold deep-blue night, sparkling faintly; far ahead on the horizon a great radiant gold Light glows like a home, ringed with golden light. A bright golden road reaches back from it across the dark to two small travellers low at the left: the recurring red child — washed clean, glowing with a soft white aura — has turned back, taken the hand of a darker figure still standing in the shadow, and points the way up the road toward the distant Light. He leads the other home; the Light ahead is the true source he only carries and reflects.';

  // MULTIPLANE: assemble the requested depth plane. Each is its own cel —
  // transparent where it has no content — so they stack and parallax apart on
  // mobile. The desktop/`full` press is the ORIGINAL single-layer painting.
  const RAW = { undercoat: 0, weave: 0, varnish: 0, oil: 0 };   // no baked surface — the live filter unifies the planes
  if (LAYER === 'bg') return svgWrap(ALT, out.slice(0, bgEnd).join('\n'), RAW);   // night + distant Light/home + reaching road (opaque)
  if (LAYER === 'fg') return svgWrap(ALT, out.slice(fgRange[0], fgRange[1]).join('\n'), RAW);   // the two travellers
  if (LAYER === 'mid') {   // the dark left behind + the warm floor pool (everything between bg and fg)
    const body = out.filter((_, i) => i >= bgEnd && i < midEnd).join('\n');
    return svgWrap(ALT, body, RAW);
  }
  // full painting (desktop): the original order, untouched
  return svgWrap(ALT, out.join('\n'));
}
