// gen/plates/looking.mjs — "Love came looking" (the seeking Light)
//
// "For the Son of man is come to seek and to save that which was lost." (Luke 19:10)
//
// ⚠ REDRAWN AGAIN, AND THE CHARACTER IS GONE. Fred: "eh why do we have this character?
// maybe this scene is better if we have a storm and then in the middle there is the storm
// opening up revealing a light from above to the protagonist." He is right, and it is a
// better picture than the one I built: a crowned figure standing about on the plain reads
// as somebody who came to visit, and it makes the Light one more member of the cast, to be
// sized up against the child. The Light of this page is not a person you can stand beside.
// It is what happens to the sky.
//
// One sentence:
//
//     The storm tears open above him, and light comes straight down out of the gap onto
//     the one small figure below.
//
// Still the same plain He came into, but the night has turned to weather, and the weather
// breaks. What carries it, in the order the eye should read it:
//   · the STORM, filling four-fifths of the frame, wheeling in Munch curves and heaviest
//     at the corners, so the middle is the only place to look;
//   · THE OPENING — a rift torn in the churn, its rim lit, the cloud pulled off it. Every
//     mark in that sky takes its direction from the tangent around this hole;
//   · THE SHAFT falling out of it, straight-sided (light through a gap in cloud is the one
//     ruled thing in nature) and widening as it comes down;
//   · THE POOL where it lands, with the child standing in it, tiny, looking up. The plain
//     comes back into colour ONLY inside that pool — mark by mark, never a wash.
//
// No pure black. The dark is cobalt going violet; the break is the only gold.
export const name = 'looking';
export const title = 'Love came looking';
export const caption = 'But Love came looking for you.';
export const seed = 20260617;
export const focal = { x: 400, y: 250 };
export const layers = [
  { name: 'sky', opaque: true },  // the storm — its churn is painted, not moved
  { name: 'air' },                // torn streaks blowing across the break — DRIFTS
  { name: 'shaft' },              // the break, the beam and the pool — BREATHES
  { name: 'veil' },               // cloud passing IN FRONT of the light — DRIFTS across it
  { name: 'ground' },             // the plain
  { name: 'fg' },
];

export function paint(E, opts = {}) {
  const {
    mulberry32, fbm, curlV, mix, ramp, jig, strokes, rej,
    inscriptionText, greekRef,
    paintPath, svgWrap, W, H, GOLD, GOLD_PALE, GOLD_HOT,
  } = E;

  const rng = mulberry32(seed);
  const out = [];
  const counter = { n: 0 };
  const LAYER = opts.layer || 'full';
  const fgRanges = [], skyRanges = [], airRanges = [], shaftRanges = [], veilRanges = [];
  // ⭐ DETAIL PASS (Sep 8) — the PLAIN only; the cloud, the break, the cone and the veil are
  // Fred's after four rounds and are not touched. EVERY STROKE DRAWS ITS OWN WIDTH AND
  // LENGTH (Fred: "use no rules, a paint stroke just exist because it exist").
  const free = (x, y, salt) => { const n = Math.sin(x * 12.9898 + y * 78.233 + salt) * 43758.5453; return n - Math.floor(n); };
  const widthOf  = (x, y, salt) => 0.40 + 3.2 * Math.pow(free(x, y, salt), 2.6);
  const lengthOf = (x, y, salt) => 0.40 + 1.5 * Math.pow(free(x, y, salt + 17), 1.5);

  out.push(`<rect width="${W}" height="${H}" fill="#20193f"/>`);

  /* ====================== THE BONES ====================== */
  const HZ = 296;                       // the horizon sits LOW: the storm is the picture
  // ⚠ THE WHOLE HOLE MUST BE IN FRAME, RIM AND ALL. At y=162 its top half was above the
  // portrait band, so the break read as a bright column running off the top of the page
  // instead of as an opening with an edge — and the edge is the thing that says "torn".
  // ⚠ ABOVE HIM, NOT BEHIND HIM. Fred: "can you make the light more above rather than
  // behind?" What made it read as behind was not its height — it was that a hole seen from
  // BELOW is foreshortened almost flat, and mine was drawn nearly round, which is the shape
  // of a hole you are level with. It is squashed now, and set higher, so the eye reads it
  // as a gap in a ceiling overhead rather than a lamp standing off in the distance.
  const OX = 400, OY = 164;             // the opening — high, and seen from underneath
  // ⚠ IT HAS TO BE BIG. In Fred's reference the disc spans most of the frame's width and
  // the beam is long — that scale is what makes it an EVENT rather than a lamp. At OR=76
  // with 128px of fall between it and the ground, the whole thing came out as one gold
  // lump the size of a fist.
  const OR = 150;                       // its radius
  // ⚠ THE LANDING HAS TO BE ABOVE THE NARRATION. At y=392 the child and the whole pool
  // the shaft falls into sat under the text: the picture's payoff was being printed over.
  // ⚠ THE PLATE AND THE CAST HAD DRIFTED APART, and that is the whole of Fred's "make the
  // protagonist be in the middle of the light instead on the top part of the light". Twice
  // I lifted the scene and moved the runtime child (CAST1[9]) with it, and twice one of the
  // two edits to THIS number silently did not land — so the pool stayed at 350 while he
  // went to 316 and ended up standing on its far rim. One number for both now, and the
  // pool's centre is stated separately so he can stand IN it rather than behind it.
  const CX = 400, CY = 322;             // his feet
  const PY = CY - 4;                    // the beam's axis where it meets the ground
  const PW = 156, PH = 34;              // ⚠ WIDE: a source almost overhead throws a short beam into a broad pool
  const hole = (x, y) => Math.max(0, 1 - Math.hypot((x - OX) / OR, (y - OY) / (OR * 0.46)));
  // ⚠ SEPARATE RAYS, NOT ONE CONE. Fred sent a reference — a disc overhead throwing a
  // beam down onto one figure on an empty plain — and said: "i like the rays". That is the
  // difference between light and a lit shape. A single soft cone is a smear; real light
  // through a broken cloud comes down in DISTINCT SHAFTS with dark air between them, and
  // it is the dark gaps that make the bright ones read. Seven of them, each with its own
  // width, lean and brightness, plus a faint haze between so they belong to one event.
  const RAYS = [];
  for (let i = 0; i < 7; i++) {
    const u = (i / 6) * 2 - 1;                       // -1..1 across the break
    RAYS.push({
      x0: u * OR * 0.46,                             // where it leaves the hole
      x1: u * PW * 1.02,                             // where it lands
      w0: 6 + Math.abs(fbm(i * 2.3, 1.7, 601)) * 8,
      w1: 14 + Math.abs(fbm(i * 1.9, 4.1, 603)) * 18,
      br: 0.55 + fbm(i * 3.1, 2.9, 607) * 0.55,
    });
  }
  const ray = (x, y) => {
    if (y < OY) return 0;
    const t = Math.max(0, Math.min(1, (y - OY) / (CY - OY)));
    let m = 0;
    for (let i = 0; i < RAYS.length; i++) {
      const R = RAYS[i];
      const c = OX + R.x0 + (R.x1 - R.x0) * t;
      const half = R.w0 + (R.w1 - R.w0) * t;
      const v = (1 - Math.abs(x - c) / half) * R.br * (1 - t * 0.22);
      if (v > m) m = v;
    }
    return Math.max(0, m);
  };
  // the haze the rays hang in — very faint, so they read as one shaft of weather and not
  // as seven sticks leaning against each other
  const beam = (x, y) => {
    const t = Math.max(0, Math.min(1, (y - OY) / (CY - OY)));
    const half = OR * 0.62 + t * (PW * 1.15 - OR * 0.62);
    const dx = Math.abs(x - (OX + (CX - OX) * t));
    return y < OY ? 0 : Math.max(0, 1 - dx / half) * (1 - t * 0.34) * 0.42;
  };
  // ⚠ AND THE POOL IS NOT A PERFECT ELLIPSE EITHER. A true ellipse is a drawn shape — the
  // same fault as a ruled ray, just curved. Light landing on broken ground makes a ragged
  // patch, so its reach wobbles with the angle.
  const pool = (x, y) => {
    const a2 = Math.atan2((y - (PY)) / PH, (x - CX) / PW);
    const w = 0.80 + fbm(Math.cos(a2) * 1.7, Math.sin(a2) * 1.7, 991) * 0.42;
    return Math.max(0, 1 - Math.hypot((x - CX) / (PW * w), (y - (PY)) / (PH * w)));
  };

  /* ====================== 1. THE STORM ======================
     ⚠ REBUILT AS CLOUD, AND ACROSS THE WHOLE PLATE. Fred: "hmmm looks bad. very rushed.
     make it panoramic of course. add clouds to cover the sides of the light and the sky."
     Both faults were real. The sky was a FIELD of marks wheeling round a hole — which is
     a texture, not weather — and the picture was composed for the 312-wide phone window
     with the rest of the 800-wide plate left as filler, so panning off-centre found
     nothing. A panorama has to be composed edge to edge; the window is where the event
     is, not where the painting stops.
     So the sky is built out of CLOUD BANKS: each one a run of overlapping lobes, lit
     along the crown that faces the break and deep underneath, drawn all the way across
     the plate. Two of them close on the break from either side and OVERLAP its rim, so
     the light comes out from behind cloud instead of sitting on a flat backdrop — which
     is the whole difference between a hole in weather and a lamp hung in a field. */
  const swirl = (x, y) => {
    const a2 = Math.atan2(y - OY, x - OX);
    const [u, v] = curlV(x, y, 44, 170);
    return a2 + Math.PI / 2 + (u + v) * 0.55;
  };
  const heavy = (x, y) => Math.max(0, Math.min(1, Math.hypot((x - OX) / 460, (y - OY) / 330)));
  // the deep sky the clouds sit in — quiet, so the cloud forms are the drawing
  strokes(out, counter, {
    rng, n: 1400,
    sample: rej(-14, -14, 814, HZ + 30),
    dir: swirl,
    col: (x, y, r) => jig(ramp(['#3d4288', '#343a78', '#2c2f68', '#242356', '#1b1944'],
      Math.min(1, heavy(x, y) * 0.9 + fbm(x / 130, y / 100, 61) * 0.22)), r, 5),
    len: 40, lw: 13, steps: 3, follow: 0.92, lenJ: 0.5, impasto: 0.25,
  });
  const _sky = out.length;
  /* ---- A CLOUD IS BILLOWS ON BILLOWS, WITH A FEATHERED EDGE ----------------------
     Fred, for the fourth time: "you got the idea but it looks bad. fix the cloud."
     Three things were wrong and they were all structural, not colour:
       · ONE SIZE OF LOBE. A bank was a row of same-sized bumps, so it stacked like
         masonry. Real cloud is fractal — big masses with smaller billows riding on their
         crowns, and smaller ones on those.
       · A CUT EDGE. Marks were placed anywhere inside the lobe and stopped dead at its
         boundary, which draws a shape with a rim. Cloud has no rim; it thins out. So the
         chance of a mark existing now FALLS OFF toward the edge, and marks out there are
         short — the edge feathers instead of ending.
       · NO MODELLING PER BILLOW. Light was applied to the whole bank at once (crown pale,
         belly dark), so each bank was one flat gradient. Every billow is lit
         INDIVIDUALLY now: the side of it facing the break catches the light and its own
         underside goes deep, which is what gives cloud its cauliflower solidity. ---- */
  const lobes = (cx2, cy2, rw, rh, n2, sd) => {
    const L = [];
    for (let i = 0; i < n2; i++) {
      const t = n2 === 1 ? 0 : (i / (n2 - 1)) * 2 - 1;
      const hump = Math.pow(Math.max(0, 1 - Math.abs(t) * 0.85), 0.7);
      const r0 = rh * (0.42 + Math.abs(fbm(i * 3.1, sd, 817)) * 1.05);   // WIDE size spread
      L.push([cx2 + t * rw * 0.92 + (fbm(i * 1.7, sd, 811) - 0.5) * rw * 0.3,
              cy2 - hump * rh * 0.42 + (fbm(i * 2.3, sd, 813) - 0.5) * rh * 0.5, r0]);
    }
    // and the billows that ride on them — same shape, a third the size, on the upper side
    const N0 = L.length;
    for (let i = 0; i < N0; i++) {
      const m = 2 + ((Math.abs(fbm(i * 3.7, sd, 861)) * 3) | 0);
      for (let j = 0; j < m; j++) {
        const a2 = -Math.PI * 0.92 + (m === 1 ? 0.4 : j / (m - 1)) * Math.PI * 0.84
                 + (fbm(i * 2.9 + j, sd, 863) - 0.5) * 0.5;
        const rr = L[i][2] * (0.26 + Math.abs(fbm(i * 1.3 + j * 2.1, sd, 867)) * 0.34);
        L.push([L[i][0] + Math.cos(a2) * L[i][2] * 0.62,
                L[i][1] + Math.sin(a2) * L[i][2] * 0.52, rr]);
      }
    }
    return L;
  };
  const inLobes = (L, x, y) => {
    let m = 0;
    for (let i = 0; i < L.length; i++) {
      const d = Math.hypot((x - L[i][0]) / L[i][2], (y - L[i][1]) / (L[i][2] * 0.74));
      if (1 - d > m) m = 1 - d;
    }
    return m;
  };
  const nearest = (L, x, y) => {
    let bi = 0, bd = 9e9;
    for (let i = 0; i < L.length; i++) {
      const d = Math.hypot(x - L[i][0], (y - L[i][1]) / 0.74) / L[i][2];
      if (d < bd) { bd = d; bi = i; }
    }
    return bi;
  };
  const bank = (cx2, cy2, rw, rh, n2, sd, dark) => {
    const L = lobes(cx2, cy2, rw, rh, n2, sd);
    const paint = (nMul, lenMul, lwv, opv, tooth) => strokes(out, counter, {
      rng, n: Math.round(rw * rh * nMul),
      sample: r => {
        for (let k = 0; k < 10; k++) {
          const i = (r() * L.length) | 0, ll = L[i];
          const a2 = r() * Math.PI * 2, d = Math.pow(r(), 0.42);
          const x = ll[0] + Math.cos(a2) * ll[2] * d, y = ll[1] + Math.sin(a2) * ll[2] * 0.74 * d;
          if (y > HZ + 10) continue;
          // ⚠ the feather: a mark near the edge usually is not there at all
          if (r() > Math.pow(Math.max(0, inLobes(L, x, y)), 0.55) + 0.12) continue;
          return [x, y];
        }
        return null;
      },
      dir: (x, y) => {
        const ll = L[nearest(L, x, y)];
        const tg = Math.atan2((y - ll[1]) / 0.74, x - ll[0]) + Math.PI / 2;
        const [u, v] = curlV(x, y, 46, 130);
        return Math.atan2(Math.sin(tg) * 0.36 + (u + v) * 0.26, Math.cos(tg) * 0.36 + 0.70);
      },
      col: (x, y, r) => {
        const ll = L[nearest(L, x, y)];
        // where this mark sits ON ITS OWN BILLOW: -1 underside, +1 crown
        const own = Math.max(-1, Math.min(1, (ll[1] - y) / (ll[2] * 0.74)));
        // and whether that part of the billow faces the break
        const bx = OX - ll[0], by = OY - ll[1], bl = Math.hypot(bx, by) || 1;
        const px = x - ll[0], py = y - ll[1], pl = Math.hypot(px, py) || 1;
        const face = (px / pl * bx / bl + py / pl * by / bl) * 0.5 + 0.5;
        const near = Math.max(0, 1 - Math.hypot((x - OX) / 330, (y - OY) / 260));
        let t = own * 0.34 + face * 0.4 + 0.3 + fbm(x / 70, y / 50, 821) * 0.22;
        let c = ramp(['#14102e', '#1e1942', '#2c2558', '#463e74', '#6b6296', '#9a92bc', '#c6c0d8'],
                     Math.max(0, Math.min(1, t)));
        c = mix(c, '#f7e7bd', Math.min(0.85, near * Math.max(0, face - 0.15) * 1.5));   // backlit where it faces the gap
        c = mix(c, '#0e0a26', dark * Math.max(0, -own) * 0.7);                          // the belly goes deep
        return jig(c, r, tooth ? 8 : 6);
      },
      len: (x, y) => (lenMul * (0.35 + Math.max(0, inLobes(L, x, y)))) * (0.6 + rh / 70),
      lw: lwv, steps: 5, follow: 0.965, wild: 0.10, lenJ: 0.7, wJ: 0.55,
      impasto: tooth ? 0.22 : 0.1, relief: 0, op: opv,
    });
    // ⚠ SMALL AND MANY, NOT FEW AND BIG. This is the correction that finally matters: at
    // lw 15 and len 62 a stroke IS a slab, and no amount of colour fixes a wall built out
    // of planks. Cloud reads as cloud when a great many SMALL marks overlap at low opacity
    // and build the form up in glazes — neighbouring marks then differ by almost nothing,
    // which is what makes a surface instead of a pile. (The earlier pebble problem was
    // never mark size, it was `relief` bevelling each one and leaving them isolated.)
    paint(0.22, 22, 6, 0.5, false);      // the mass, laid up in many quiet marks
    paint(0.06, 11, 3, 0.45, true);      // the tooth on its crowns
  };

  // ---- FULL CLOUD, EDGE TO EDGE, AND ONE HOLE IN IT ----
  // ⚠ Fred: "make it so the clouds are full everywhere except on the light". This is the
  // right instruction and it fixes what was still wrong: banks with open sky between them
  // read as a few clouds ON a sky. An overcast that has just broken is not a few clouds —
  // it is a CEILING, unbroken from edge to edge, and the only sky you can see is the piece
  // torn out of it. So the sky is now packed: four courses of cloud from the top of the
  // frame down to the horizon, overlapping, wall to wall — and every lobe that would sit
  // on the break is simply not drawn. The gap is the subject; the cloud is everything else.
  const CLEAR = OR * 1.16;                  // nothing is painted inside this
  const clearOf = (cx2, cy2, rr) => Math.hypot(cx2 - OX, (cy2 - OY) / 0.8) > CLEAR + rr * 0.55;
  const course = (cy2, rh, sd, dark, step) => {
    for (let cx2 = -70; cx2 < 880; cx2 += step) {
      const jx = cx2 + (fbm(cx2 / 90, sd, 841) - 0.5) * step * 0.5;
      const jy = cy2 + (fbm(cx2 / 70, sd + 3, 843) - 0.5) * rh * 0.7;
      const rw = step * (0.62 + fbm(cx2 / 60, sd + 7, 847) * 0.5);
      if (!clearOf(jx, jy, rh)) continue;   // the hole in the ceiling
      bank(jx, jy, rw, rh * (0.7 + fbm(cx2 / 50, sd + 11, 849) * 0.7), 5, sd + cx2 * 0.013, dark);
    }
  };
  // ⚠ A CEILING RECEDES. This is the other half of "above rather than behind": four bands
  // of the same size at the same spacing is a WALL standing behind the scene. Cloud seen
  // from underneath goes in perspective like anything else — the mass directly over your
  // head is huge and its belly faces you, and by the horizon the same cloud is small,
  // squashed flat and crowded together. So the courses run big-and-loose at the top of the
  // frame to small-and-tight at the far distance, and the eye is put UNDER the sky.
  course(6, 104, 3.1, 0.66, 250);           // straight overhead: vast, and we see its underside
  course(88, 78, 5.7, 0.52, 190);
  course(168, 58, 8.3, 0.38, 148);          // the course the break is torn in
  course(226, 38, 2.9, 0.32, 108);
  course(262, 24, 6.4, 0.28, 78);           // and the far distance, crowded along the horizon
  // the torn lip of the break, drawn last so it sits on the cloud that overlaps it
  strokes(out, counter, {
    rng, n: 620,
    sample: r => {
      const a2 = r() * Math.PI * 2, d = OR * (1.0 + Math.pow(r(), 0.5) * 0.42);
      return [OX + Math.cos(a2) * d, OY + Math.sin(a2) * d * 0.48];
    },
    dir: swirl,
    col: (x, y, r) => jig(ramp(['#fff4d8', '#f0cd86', '#a98a72', '#4a4180'],
      Math.min(1, (Math.hypot((x - OX) / OR, (y - OY) / (OR * 0.8)) - 1) * 2.2 + r() * 0.3)), r, 6),
    len: 17, lw: 3.6, steps: 3, follow: 0.95, lenJ: 0.5, impasto: 0.45, op: 0.9,
  });
  const _air = out.length;
  for (let k = 0; k < 8; k++) {
    const cy2 = 24 + k * 30 + fbm(k * 3.7, 1.4, 401) * 18;
    const cx2 = -180 + k * 130 + fbm(k * 2.3, 5.1, 403) * 220;
    const len2 = 300 + fbm(k * 1.9, 2.2, 407) * 400;
    const th = 6 + fbm(k * 4.1, 3.3, 409) * 10;
    strokes(out, counter, {
      rng, n: Math.round(len2 * 0.20),
      sample: r => {
        const t = r(), x = cx2 + t * len2;
        const y = cy2 + Math.sin(t * 2.4 + k) * 9 + (r() * 2 - 1) * th;
        return (x < -70 || x > 870 || y > HZ) ? null : [x, y];
      },
      dir: (x, y) => 0.03 + (fbm(x / 90, y / 40, 411) - 0.5) * 0.34,
      col: (x, y, r) => jig(mix(ramp(['#6a6ab0', '#4a4490', '#2f2764'], heavy(x, y)), '#a9aede', 0.12 + r() * 0.2), r, 5),
      len: 42, lw: 2.8, steps: 3, follow: 0.97, lenJ: 0.5, wJ: 0.4, impasto: 0.15, op: 0.24,
    });
  }
  airRanges.push([_air, out.length]);
  skyRanges.push([_sky, _air]);

  /* ====================== 2. THE PLAIN ====================== */
  // ⚠ no complementary fleck on the earth (the "manifold goes cyan" trap); the sky keeps 0.006
  const _MG = E.getManifold(); E.setManifold(0);
  strokes(out, counter, {
    rng, n: 1100,
    sample: rej(-14, HZ - 8, 814, 514),
    dir: (x, y) => Math.atan2(y - HZ, x - OX),
    col: (x, y) => ramp(['#332c66', '#3a3168', '#42386c', '#4a4072'], Math.min(1, (y - HZ) / (H - HZ) + 0.1)),
    len: (x, y) => 34 * lengthOf(x, y, 11), lw: (x, y) => (4 + 5 * free(x, y, 13)) * Math.min(1, 0.3 + Math.max(0, y - HZ) / 90), steps: 3, follow: 0.95, lenJ: 0.3, wJ: 0.3, impasto: 0.3, relief: 0.2,   // a bed: its own width each, no giants, thin at the far edge
  });
  strokes(out, counter, {
    rng, n: 4600,
    sample: rej(-14, HZ - 8, 814, 514),
    dir: (x, y) => { const [a, b] = curlV(x, y, 42, 120); return Math.atan2(y - HZ, x - OX) + (a + b) * 0.28; },
    col: (x, y, r) => {
      const d = Math.min(1, (y - HZ) / (H - HZ) + 0.08);
      let c = ramp(['#3a3170', '#413876', '#4b427c', '#564c84'], d);
      if (r() < 0.06) c = mix(c, '#6a5a96', r() * 0.8);
      // ⚠ the ground comes back into colour ONLY where the light lands, and mark by mark.
      // Outside the pool the plain is exactly as dead as it was on the page before.
      // ⚠ LIT EARTH, NOT HAY. Fred: "the grass does not look so good lol". It was reading as
      // a heap of straw, and the reason is that the pool was painted as a NEW COLOUR laid
      // over the dirt — a pile of saturated gold sausages — instead of as the same dirt with
      // light falling on it. Ground under light keeps its own hue and loses its darkness; it
      // does not turn yellow. So the mix runs through the earth's own browns, it is capped
      // well short of the top, and the marks that carry it are small.
      const p = pool(x, y);
      if (p > 0) c = mix(c, ramp(['#5e5080', '#7a6470', '#96795c', '#b4914f'], Math.min(1, p * 1.25)), Math.min(0.82, p * 1.05));
      return jig(c, r, 6);
    },
    len: (x, y) => (9 + 18 * Math.min(1, (y - HZ) / (H - HZ) + 0.15)) * lengthOf(x, y, 21), lw: (x, y) => 2.8 * widthOf(x, y, 23),
    steps: 3, follow: 0.92, wild: 0.06, lenJ: 0.3, wJ: 0.3, impasto: 0.5, relief: 0.35,
  });
  // the fine tooth — what makes the plain read as ground at arm's length
  strokes(out, counter, {
    rng, n: 2000,
    sample: rej(-14, HZ + 2, 814, 514),
    dir: (x, y) => Math.atan2(y - HZ, x - OX) + (fbm(x / 9, y / 7, 319) - 0.5) * 1.4,
    col: (x, y, r) => {
      const d = Math.min(1, (y - HZ) / (H - HZ) + 0.08);
      let c = ramp(['#423a7a', '#4a4280', '#554c88', '#605690'], d);
      const p = pool(x, y);
      if (p > 0) c = mix(c, ramp(['#5e5080', '#7a6470', '#96795c', '#b4914f'], Math.min(1, p * 1.25)), Math.min(0.82, p * 1.05));
      return jig(c, r, 5);
    },
    len: (x, y) => 6 * lengthOf(x, y, 25), lw: (x, y) => 1.2 * widthOf(x, y, 27), steps: 2, lenJ: 0.3, wJ: 0.3, impasto: 0.4, relief: 0.25, op: 0.8,
  });
  // low rolling hills either side, as in the reference: they give the plain a real size and
  // they are the darkest thing in the frame, so the pool in the middle is the only light
  {
    const hill = (cx2, w2, h2, dark) => strokes(out, counter, {
      rng, n: Math.round(w2 * 1.4),
      sample: r => {
        const x = cx2 - w2 / 2 + r() * w2;
        const top = HZ - h2 * Math.pow(Math.max(0, 1 - Math.abs(x - cx2) / (w2 / 2)), 0.7);
        const y = top + r() * (HZ + 16 - top);
        return [x, y];
      },
      dir: (x) => 0.06 + (fbm(x / 60, 3, 701) - 0.5) * 0.4,
      col: (x, y, r) => jig(mix(ramp(['#2a2356', '#332b62'], r()), '#150f34', dark), r, 5),
      len: (x, y) => 15 * lengthOf(x, y, 31), lw: (x, y) => 3.0 * widthOf(x, y, 33), steps: 2, lenJ: 0.3, wJ: 0.3, impasto: 0.3, relief: 0.3,   // ⚠ relief was the default 1
    });
    hill(90, 420, 46, 0.45);
    hill(700, 460, 54, 0.55);
    hill(400, 300, 22, 0.3);
  }
  strokes(out, counter, {   // the horizon as a meeting, not a cut
    rng, n: 560,
    sample: rej(-14, HZ - 10, 814, HZ + 20),
    dir: (x, y) => (fbm(x / 26, y / 12, 77) - 0.5) * 1.0,
    col: (x, y, r) => jig(mix(ramp(['#4a4382', '#413676', '#392e68'], x / W), '#c8a468', pool(x, y) * 0.5), r, 8),
    len: (x, y) => 10 * lengthOf(x, y, 41), lw: (x, y) => 1.8 * widthOf(x, y, 43), steps: 2, lenJ: 0.3, wJ: 0.3, impasto: 0.35, relief: 0.3,
  });
  E.setManifold(_MG);
  // ⚠ REMOVED: a hand-painted shadow ellipse used to sit here, always baked into the
  // JPG (150 strokes, biased toward its own OUTER edge — Math.pow(r(),0.6) puts MORE
  // marks near the rim than the centre — each mixed 45-85% toward near-black #241a48).
  // At 26x9 engine-units it is nearly as wide as the child himself (h:34), and it never
  // checked __SKIP_FIG, so it kept baking in after he moved to a runtime actor. Combined
  // with the pool's own edge, this is Fred's "black box on the kid's feet" on this page.
  // The runtime actor already draws its own ground shadow (drawActorFrame), positioned
  // wherever he actually stands — this baked one is both redundant and the bug.
  const thistle = (bx, by, hh, s) => {
    const lit = pool(bx, by - hh * 0.4);
    const stem = (x, y, r) => jig(mix(mix('#1c1638', '#2e2650', r() * 0.5), '#c79a4e', lit * 0.7), r, 6);
    const tx = bx - 1.4 * s, ty = by - hh;
    paintPath(out, counter, rng, [[bx, by], [bx + 2.4 * s, by - hh * 0.5], [tx, ty + 3 * s]], stem, { lw: 1.6 * s, len: 3.5, density: 0.7, jitter: 0.6 });
    for (let k = -2; k <= 2; k++) {
      const a = -Math.PI / 2 + k * 0.34;
      paintPath(out, counter, rng, [[tx, ty - 2 * s], [tx + Math.cos(a) * 5 * s, ty - 2 * s + Math.sin(a) * 5 * s]],
        (x, y, r) => jig(mix('#6a5f86', '#f0cd86', lit * 0.75), r, 8), { lw: 0.9 * s, len: 2.5, density: 0.85, jitter: 0.4 });
    }
  };
  [[186, 470, 28, 1.4], [640, 452, 24, 1.2], [318, 486, 26, 1.4], [520, 430, 15, 0.85], [716, 492, 20, 1.1]]
    .forEach(([bx, by, hh, s]) => thistle(bx, by, hh, s));

  // after the rain the plain still steams: a low band of mist along the horizon, lit where
  // the beam meets it
  strokes(out, counter, {
    rng, n: 700,
    sample: rej(-14, HZ - 26, 814, HZ + 44),
    dir: (x, y) => 0.02 + (fbm(x / 70, y / 20, 931) - 0.5) * 0.5,
    col: (x, y, r) => jig(mix(ramp(['#4e4788', '#5b5494', '#6a63a0'], fbm(x / 90, y / 26, 933)),
                              '#e8d3a2', Math.max(0, 1 - Math.abs(x - CX) / 220) * 0.35), r, 5),
    len: 34, lw: 4, steps: 3, follow: 0.97, lenJ: 0.6, impasto: 0.1, op: 0.22,
  });

  /* ====================== 2b. REFINEMENT (Sep 12) — the plain AFTER the storm ======================
     Fred: "check the art and refine it and make it more artistic and detailed". The storm, the
     break, the cone and the veil are his and stay. What was thin was the GROUND: a bed of
     tiles with a gold patch. A plain a storm has just passed over is WET, and wet ground is
     what makes light on the ground beautiful — it mirrors. So: puddles (inside the pool they
     hold the beam upside down, outside it a faint violet sky); tufts of dead grass all leaning
     one way, the way the storm left them, lit gold on their rims where the beam reaches; stones
     with a lit crown; and rain still falling on the far corners of the plain. */
  {
    const _MG2 = E.getManifold(); E.setManifold(0);
    const LEAN = 0.34;                                   // every blade leans the same way — one wind
    // ---- puddles: a handful, flat ellipses, mirror-marks laid VERTICALLY (a reflection stands up) ----
    // ⚠ the pool is a THIN ellipse (PY±PH = y 284–352): puddles that are to mirror the beam must lie
    // in that band; the two far outside it show the sky instead
    const puddles = [[330, 334, 30, 5.5], [472, 340, 40, 7], [402, 348, 26, 4.5], [300, 306, 22, 4], [512, 312, 24, 4.5], [372, 300, 18, 3.5], [452, 298, 20, 3.5], [176, 432, 42, 8], [640, 452, 44, 9]];
    for (const [px, py, pw, ph] of puddles) {
      const lit = pool(px, py);
      // the water: a dark, slightly lighter than the earth, with the sky's violet in it
      strokes(out, counter, {
        rng, n: Math.round(pw * 2.2),
        sample: r => { const a = r() * Math.PI * 2, d = Math.sqrt(r()); return [px + Math.cos(a) * pw * d, py + Math.sin(a) * ph * d]; },
        dir: () => 0.04, col: (x, y, r) => jig(mix(mix('#3b3576', '#5a539a', r() * 0.5), '#e9d3a0', lit * 0.55), r, 4),
        len: 7, lw: 2.2, steps: 2, lenJ: 0.5, impasto: 0, relief: 0, op: 0.85,
      });
      // the reflection: the beam, standing on its head — vertical gold strokes, brightest at the centre
      // (first cut: many thin bright dashes — they read as pale flames, not water. A mirror is
      //  SMOOTH: few, broad, soft vertical strokes, and the water body itself glossy-dark.)
      if (lit > 0.05) strokes(out, counter, {
        rng, n: Math.round(pw * 0.55 * lit + 3),
        sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 0.7); return [px + Math.cos(a) * pw * 0.7 * d, py + Math.sin(a) * ph * 0.5 * d]; },
        dir: () => -Math.PI / 2 + (rng() - 0.5) * 0.06,
        col: (x, y, r) => jig(ramp(['#f6e2b0', '#e2c384', '#c9a15a'], r()), r, 3),
        len: (x, y) => 2 + ph * 1.1 * (1 - Math.abs(x - px) / pw), lw: 2.8, steps: 2, lenJ: 0.3, impasto: 0, relief: 0, op: 0.30 + 0.25 * lit,
      });
      else strokes(out, counter, {   // outside the light, a puddle shows the sky: a few pale violet threads
        rng, n: 5, sample: r => [px + (r() - 0.5) * pw * 1.2, py + (r() - 0.5) * ph], dir: () => -Math.PI / 2,
        col: (x, y, r) => jig('#7a72b4', r, 5), len: 4, lw: 0.9, steps: 2, impasto: 0, relief: 0, op: 0.5,
      });
      // the far rim of a puddle catches a hairline of light
      strokes(out, counter, {
        rng, n: Math.round(pw * 0.5), sample: r => { const a = Math.PI + r() * Math.PI; return [px + Math.cos(a) * pw, py + Math.sin(a) * ph]; },
        dir: () => 0.02, col: (x, y, r) => jig(mix('#8d84c0', '#f5e0b0', lit * 0.8), r, 4), len: 4, lw: 0.8, steps: 2, impasto: 0, relief: 0, op: 0.6,
      });
    }
    // ---- tufts: dead grass, bent by the storm, lit on the rim where the beam reaches ----
    const tuft = (bx, by, hh, s, seedK) => {
      const lit = pool(bx, by - hh * 0.3);
      const n = 5 + Math.floor(free(bx, by, seedK) * 5);
      for (let k = 0; k < n; k++) {
        const a = -Math.PI / 2 + LEAN + (k / (n - 1) - 0.5) * 0.9 + (free(bx + k, by, seedK + 3) - 0.5) * 0.3;
        const L = hh * (0.55 + free(bx, by + k, seedK + 5) * 0.6);
        const tip = [bx + Math.cos(a) * L, by + Math.sin(a) * L];
        const mid = [bx + Math.cos(a - 0.18) * L * 0.55, by + Math.sin(a - 0.18) * L * 0.55];
        paintPath(out, counter, rng, [[bx, by], mid, tip],
          (x, y, r) => jig(mix(mix('#332b60', '#4a4184', r() * 0.6), '#e2be76', lit * (0.35 + 0.5 * ((by - y) / (L + 1)))), r, 6),   // a shade off the ground, not black claws
          { lw: 0.7 * s, len: 3, density: 0.7, jitter: 0.5 });
      }
    };
    for (let i = 0; i < 150; i++) {
      const bx = -10 + rng() * 820, by = HZ + 6 + Math.pow(rng(), 0.8) * (H - HZ - 14);
      const depth = (by - HZ) / (H - HZ);
      tuft(bx, by, 5 + depth * 13, 0.6 + depth * 0.8, 400 + i);
    }
    // ---- stones: a dark body, a lit crown on the side the beam is, a shadow the other way ----
    const stone = (sx, sy, sw, sh) => {
      const lit = pool(sx, sy);
      const dx = Math.sign(CX - sx) || 1;             // the beam is at CX: its crown faces it
      strokes(out, counter, {
        rng, n: Math.round(sw * 1.6),
        sample: r => { const a = r() * Math.PI * 2, d = Math.sqrt(r()); return [sx + Math.cos(a) * sw * d, sy - Math.abs(Math.sin(a)) * sh * d]; },
        dir: (x, y) => Math.atan2(y - sy, x - sx) + Math.PI / 2,
        col: (x, y, r) => jig(mix(mix('#2b2450', '#4a4174', ((sy - y) / sh) * 0.7 + r() * 0.2), '#d8b87c', lit * Math.max(0, (sy - y) / sh - 0.3) * (dx * (x - sx) > 0 ? 1.0 : 0.35)), r, 5),
        len: 3, lw: 1.6, steps: 2, lenJ: 0.5, impasto: 0.3, relief: 0.4, op: 0.95,
      });
      paintPath(out, counter, rng, [[sx - sw * 0.9 * dx, sy + 1], [sx - sw * 1.8 * dx, sy + 2.5]],
        (x, y, r) => jig('#1a1438', r, 4), { lw: 1.6, len: 3, density: 0.7, jitter: 0.5 });   // its shadow, thrown away from the beam
    };
    for (let i = 0; i < 26; i++) {
      const sx = -6 + rng() * 812, sy = HZ + 10 + Math.pow(rng(), 0.7) * (H - HZ - 16);
      const depth = (sy - HZ) / (H - HZ);
      stone(sx, sy, 3 + depth * 9 * (0.5 + rng()), 2 + depth * 5 * (0.5 + rng()));
    }
    /* ---- the sycomore (Luke 19:4) ------------------------------------------------------
       "he ran before, and climbed up into a sycomore tree to see him: for he was to pass that
       way." The one tree on this plain is the tree a small person climbs to SEE — the engine's
       sycomore grows two low limbs for exactly that. It stands off to the left, storm-bent the
       way every tuft here leans, a dark shape against the storm; only the flank that faces the
       beam takes any of its gold. Dark-jewel crown, not green: the Light has not been received
       on this page yet. */
    E.paintTree(out, counter, mulberry32(seed + 1904), 176, 404, 152, {
      species: 'sycomore', lean: LEAN * 0.55, blossom: 0, fruitK: 0, tuft: 1, shadowDir: -1, sun: 0.18,
      lightFn: (x, y) => Math.max(0, 1 - Math.hypot(x - CX, (y - CY) * 1.15) / 340) * 0.8,
      crownCols: ['#161c3c', '#1c2646', '#22344c', '#2a4452', '#345456', '#4c6a5a', '#7e8a62'],
    });
    // ---- rain: still falling on the plain's far corners, slanted with the same wind ----
    strokes(out, counter, {
      rng, n: 900,
      sample: r => { const side = r() < 0.5 ? -1 : 1; const x = 400 + side * (150 + r() * 300); return [x, HZ - 30 + r() * 150]; },
      dir: () => Math.PI / 2 - LEAN * 0.8,
      col: (x, y, r) => jig(mix('#6f68ac', '#a9a2d6', r() * 0.6), r, 3),
      len: (x, y) => 10 + free(x, y, 777) * 16, lw: 0.7, steps: 2, lenJ: 0.4, impasto: 0, relief: 0, op: 0.22,
    });
    E.setManifold(_MG2);
  }

  /* ====================== 3. THE BREAK, THE SHAFT, THE POOL (own cel — it breathes) ====================== */
  const _shaft = out.length;
  // ⚠ THE RINGS ARE GONE. Concentric bands of gold marks made a WREATH — a flower stuck on
  // the sky — and the more I tuned them the more they looked designed. What frames a break
  // in weather is the CLOUD around it, and that is now built (the banks above close on it
  // from both sides). So the opening itself is just an opening: hot in the middle, falling
  // off to nothing at its edge, and everything that gives it a shape is the cloud it is
  // torn in.
  strokes(out, counter, {   // the hole: white-hot at the middle, gold at the lip
    rng, n: 4200,
    sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 0.75) * OR * 0.86; return [OX + Math.cos(a) * d, OY + Math.sin(a) * d * 0.46]; },
    // ⚠ RADIAL, NOT TANGENTIAL. Marks running around the centre spun the opening into a
    // spiral — a rose window where a hole should be. Light comes OUT of a break, so the
    // marks go out with it.
    // ⚠ SHORT AND VARIED, or it is a firework. Long even radial marks made a dandelion:
    // every one the same length, all pointing out, all the same colour — the eye reads
    // that as a drawn STAR, not as light escaping through a gap. Real glare has no shape
    // of its own; it is brightest at the middle and simply gives out.
    dir: (x, y) => Math.atan2(y - OY, x - OX) + (rng() - 0.5) * 1.4,
    // the falloff is steep so the WHITE stays inside the sun's own small disc and everything
    // beyond it is glow — which is exactly how a small source reads as blinding
    col: (x, y, r) => jig(ramp(['#ffffff', '#ffffff', '#fff6cc', '#e8c98a', '#a98f6e', '#5b5292'],
      // and the glare is not a disc: its reach wobbles with the angle, because the hole it
      // shines through is torn, not cut
      Math.min(1, Math.pow(Math.hypot((x - OX) / (OR * 0.86 * (0.72 + fbm(Math.atan2(y - OY, x - OX) * 1.6, 3, 651) * 0.66)),
                                      (y - OY) / (OR * 0.40)), 0.55))), r, 5),
    // ⚠ and the glare gets the cloud's lesson too: many small quiet marks, no impasto —
    // it was the last patch of kernels left in the frame
    len: (x, y) => 3 + 9 * Math.max(0, 1 - Math.hypot((x - OX) / (OR * 0.86), (y - OY) / (OR * 0.40))),
    lw: 2.2, steps: 3, follow: 0.9, wild: 0.3, lenJ: 0.8, wJ: 0.6, impasto: 0.05, op: 0.5,
  });
  // ⚠ A CONE, NOT A FAN. Fred: "the rays should be a circle when it hits the ground, not a
  // line." Exactly right, and it is the difference between a flat graphic and a thing
  // standing in space. The rays were seven flat quads all landing along one horizontal
  // band, so the light had no body: it was a paper fan hung in front of the picture.
  // Light falling from a round hole lands in a ROUND POOL, and the rays are the surface of
  // the cone between the two. So every ray now runs from a point on the RIM CIRCLE to the
  // matching point on the POOL ELLIPSE — same angle, top and bottom. The ones on the near
  // side of the circle come toward us and read brightest; the ones on the far side go away
  // behind the pool and are dimmer, which is what makes the cone read as round rather than
  // as a triangle.
  // ⚠ NOTHING IN LIGHT IS RULED. Fred: "can you see that there is still straight lines
  // everywhere? straight lines makes art look bad for some reason... fix it?" The reason
  // is Munch's law, which this whole book runs on: MADE things are straight, LIVING things
  // curve. A road may be ruled; a shaft of light may not, and neither may the shadow a
  // cloud throws into it. Every one of these was a four-point polygon with dead straight
  // sides, which is why the frame was full of hard diagonals.
  // A shaft is now a run of segments whose two edges WANDER — each side offset by its own
  // noise, so it breathes in and out down its length — laid down as nested passes at
  // falling opacity, so its edge is a gradient of wobbles instead of one line.
  const shaft = (x0, y0, hw0, x1, y1, hw1, fill, op, sd) => {
    const N = 14, LT = [], RT = [];
    const nx = (y1 - y0), ny = -(x1 - x0), nl = Math.hypot(nx, ny) || 1;
    for (let i2 = 0; i2 <= N; i2++) {
      const t = i2 / N;
      const cx2 = x0 + (x1 - x0) * t, cy2 = y0 + (y1 - y0) * t;
      const hw = hw0 + (hw1 - hw0) * t;
      const wl = 1 + (fbm(t * 3.4, sd, 971) - 0.5) * 0.95;
      const wr = 1 + (fbm(t * 3.1, sd + 5, 973) - 0.5) * 0.95;
      LT.push([cx2 - nx / nl * hw * wl, cy2 - ny / nl * hw * wl]);
      RT.push([cx2 + nx / nl * hw * wr, cy2 + ny / nl * hw * wr]);
    }
    const d = 'M' + LT.map(q => q[0].toFixed(1) + ' ' + q[1].toFixed(1)).join(' L')
            + ' L' + RT.reverse().map(q => q[0].toFixed(1) + ' ' + q[1].toFixed(1)).join(' L') + ' Z';
    out.push('<path d="' + d + '" fill="' + fill + '" opacity="' + op.toFixed(3) + '"/>');
    counter.n++;
  };
  // ⚠ THE SOURCE IS SMALL AND THE LIGHT IS HUGE — Fred: "make the light source as big as
  // the ray... from the ground the sun looks small but it lights the whole earth." That is
  // the physics, and it fixes the geometry I had backwards: my rays left a WIDE rim and
  // fell to a pool barely wider, which is a chute, not sunlight. Real light comes from a
  // small bright source and DIVERGES — crepuscular rays fan out from a point you could
  // cover with a thumb. So the rays converge on a small hot core, and everything they
  // spread to is bigger than it. The gap in the cloud may be broad; the sun in it is not.
  const SUN = OR * 0.22;             // the source itself — small, and the only white in the frame
  const NR = 15;   // ⚠ fewer, now that the cone is short and wide — 22 across that span combed into a grille
  const coneRays = [];
  for (let i = 0; i < NR; i++) {
    const a2 = (i / NR) * Math.PI * 2 + fbm(i * 1.7, 2.2, 601) * 0.9;   // and the spacing is properly ragged
    const rimR = SUN;                                 // they all leave the sun itself
    coneRays.push({
      a: a2,
      // ⚠ AND THEY BEGIN UNDER THE CLOUD, NOT ON IT. The rays used to start up on the rim
      // circle, so their top ends lay ACROSS the cloud that overlaps the break — and a pale
      // straight-sided wedge drawn over a cloud is a straight line on a cloud, which is
      // exactly what Fred is pointing at. Light appears where it clears the cloud's lip.
      x0: OX + Math.cos(a2) * rimR * 0.9, y0: OY + SUN * 0.9 + Math.sin(a2) * rimR * 0.4,
      x1: CX + Math.cos(a2) * PW, y1: PY + Math.sin(a2) * PH,
      // ⚠ UNEVEN, ON PURPOSE. Fred: "we want to make it not even". Twenty-two rays of much
      // the same width and brightness is a machine part. Real light through a broken lid
      // comes down in a few strong shafts with weak ones scattered between, because the
      // gap it comes through is ragged. So brightness runs from a whisper to full, and
      // roughly one ray in five is a hot one.
      w: 2.2 + Math.abs(fbm(i * 2.3, 5.1, 603)) * 9,
      br: (fbm(i * 3.1, 1.3, 607) > 0.62 ? 1.15 : 0.12 + Math.abs(fbm(i * 4.7, 2.1, 611)) * 0.6),
      near: (Math.sin(a2) + 1) / 2,                    // 1 = the near lip, 0 = the far one
    });
  }
  // the body of the cone first — one translucent skin between the rim and the pool, so the
  // rays belong to a solid volume of lit air instead of hanging separately
  {
    const pts = [];
    for (let i = 0; i <= 30; i++) {                    // down the left side, round the pool's front
      const a2 = Math.PI + (i / 30) * Math.PI;
      pts.push([CX + Math.cos(a2) * PW * 1.04, PY + Math.sin(a2) * PH * 1.04]);
    }
    for (let i = 0; i <= 30; i++) {                    // and back up over the rim
      const a2 = (i / 30) * Math.PI;
      pts.push([OX + Math.cos(a2) * SUN * 1.05, OY + SUN * 0.8 + Math.sin(a2) * SUN * 0.4]);   // the skin springs from the sun too
    }
    // and its own flanks are nudged off true, so the cone has no ruled side either
    for (let i = 0; i < pts.length; i++) {
      pts[i][0] += (fbm(i * 0.7, 2.4, 977) - 0.5) * 14;
      pts[i][1] += (fbm(i * 0.9, 5.2, 979) - 0.5) * 10;
    }
    out.push('<path d="M' + pts.map(q => q[0].toFixed(1) + ' ' + q[1].toFixed(1)).join(' L')
      + ' Z" fill="#e6cfa0" opacity="0.10"/>');
    counter.n++;
  }
  coneRays.forEach((R, i) => {
    for (let pass = 0; pass < 3; pass++) {
      const k = [1, 0.62, 0.32][pass];
      const depth = 0.34 + R.near * 0.66;               // the far side is seen through the whole cone
      const op = [0.10, 0.16, 0.30][pass] * (0.5 + R.br * 0.6) * depth;
      shaft(R.x0, R.y0, R.w * 0.30 * k, R.x1, R.y1, R.w * k,   // narrow at the sun, wide at the ground
            pass === 2 ? '#fff3d2' : '#f0d79a', op, i * 1.7 + pass * 2.3);
    }
  });

  // the pool: a round floor of light with a brighter rim where the cone's wall meets the
  // ground — the ring is what makes it read as a circle lying flat rather than a blob
  strokes(out, counter, {
    rng, n: 300,
    sample: r => {
      const a2 = r() * Math.PI * 2, d = 0.9 + r() * 0.14;
      return [CX + Math.cos(a2) * PW * d, PY + Math.sin(a2) * PH * d];
    },
    dir: (x, y) => Math.atan2((y - (PY)) / PH, (x - CX) / PW) + Math.PI / 2,
    col: (x, y, r) => jig(ramp(['#fff6dc', '#f4d79a', '#c9974c'], r()), r, 5),
    len: 12, lw: 1.4, steps: 3, follow: 0.98, lenJ: 0.5, impasto: 0, relief: 0, op: 0.14,   // (Sep 12: a whisper of a rim, not a gold hoop)
  });
  /* ⭐ THE POOL IS LIGHT ON WET GROUND, NOT A HEAP OF GOLD (Sep 12, the beauty pass). Three
     passes of opaque gold nuggets made the landing read as a pile of tiles. Light on a plain
     the storm has just soaked does two things: it lifts the ground's own colour (the ground
     plane already does that, mark by mark), and it MIRRORS — the beam stands on its head in
     the wet, a soft column of pale gold falling down the near ground from the pool. So the
     gold passes here go soft and translucent, and the reflection carries the beauty. */
  strokes(out, counter, {   // a broad soft glow on the floor, unifying
    rng, n: 420,
    sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 0.5); return [CX + Math.cos(a) * PW * 1.05 * d, PY + Math.sin(a) * PH * 1.05 * d]; },
    dir: (x, y) => Math.atan2(y - HZ, x - OX) + (fbm(x / 20, y / 12, 943) - 0.5) * 0.5,
    col: (x, y, r) => jig(mix('#f3dca6', '#e8c47a', r() * 0.5), r, 4),
    len: 14, lw: 5, steps: 3, follow: 0.97, lenJ: 0.5, impasto: 0, relief: 0, op: 0.12,
  });
  strokes(out, counter, {   // the REFLECTION — the cone upside down in the wet ground, fading downward
    rng, n: 900,
    sample: r => { const u = (r() + r() - 1) * 0.8; const t = Math.pow(r(), 0.8); return [CX + u * PW * (0.55 + 0.35 * t), PY + PH * 0.3 + t * 96]; },
    dir: () => -Math.PI / 2 + (rng() - 0.5) * 0.08,
    col: (x, y, r) => jig(mix('#f7e6bd', '#d9b56e', r() * 0.6), r, 4),
    len: (x, y) => 10 + free(x, y, 951) * 24, lw: (x, y) => 1.4 + free(x, y, 953) * 2.2, steps: 2, lenJ: 0.4, impasto: 0, relief: 0,
    op: 0.16,
  });
  strokes(out, counter, {   // and a brighter core to the mirror, just under the pool
    rng, n: 260,
    sample: r => { const u = (r() + r() - 1) * 0.35; const t = Math.pow(r(), 1.2); return [CX + u * PW, PY + PH * 0.2 + t * 46]; },
    dir: () => -Math.PI / 2 + (rng() - 0.5) * 0.06,
    col: (x, y, r) => jig(mix('#fff3d4', '#f0d28e', r() * 0.5), r, 3),
    len: (x, y) => 8 + free(x, y, 957) * 18, lw: 1.6, steps: 2, lenJ: 0.4, impasto: 0, relief: 0, op: 0.22,
  });
  strokes(out, counter, {   // where it lands
    rng, n: 700,
    sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 0.42); return [CX + Math.cos(a) * PW * d, PY + Math.sin(a) * PH * d]; },
    // ⚠ the marks lie ALONG THE GROUND (they follow the recession), they do not swirl round
    // the pool like a wreath — a floor is flat, and its brushwork has to say so
    dir: (x, y) => Math.atan2(y - HZ, x - OX) + (fbm(x / 14, y / 9, 941) - 0.5) * 0.8,
    col: (x, y, r) => jig(ramp(['#f6e2b8', '#d8b075', '#a98a5e', '#7a6a5e'], Math.min(1, 1 - pool(x, y) + r() * 0.25)), r, 6),
    len: 9, lw: 2.4, steps: 2, lenJ: 0.7, wJ: 0.6, impasto: 0, relief: 0, op: 0.18,   // softer, fewer, translucent (Sep 12)
  });
  // the tooth of the lit floor: small stones and scuffed dirt, the thing that tells the eye
  // this is GROUND catching the light rather than a patch of paint
  strokes(out, counter, {
    rng, n: 520,
    sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 0.4); return [CX + Math.cos(a) * PW * d * 1.02, PY + Math.sin(a) * PH * d * 1.02]; },
    dir: (x, y) => Math.atan2(y - HZ, x - OX) + (fbm(x / 9, y / 7, 947) - 0.5) * 1.6,
    col: (x, y, r) => {
      const p = pool(x, y);
      const c = ramp(['#6a5a72', '#8a7460', '#a98c5e', '#cdae74'], Math.min(1, p * 1.2 + r() * 0.25));
      return jig(r() < 0.12 ? mix(c, '#41386c', 0.5 + r() * 0.4) : c, r, 7);   // a minority of dark grit between the lit marks
    },
    len: 4.4, lw: 1.5, steps: 2, lenJ: 0.7, wJ: 0.6, impasto: 0.25, op: 0.3,
  });
  // the air made visible: dust and drizzle turning in the cone, brightest where the beam is
  // densest — the thing that says the light has a BODY between the sky and the ground
  strokes(out, counter, {
    rng, n: 420,
    sample: r => { const t = 0.15 + r() * 0.85; const y = OY + (CY - OY) * t; const half = OR * 0.62 + t * (PW * 1.15 - OR * 0.62); return [OX + (CX - OX) * t + (r() + r() - 1) * half * 0.9, y]; },
    dir: () => Math.PI / 2 + (rng() - 0.5) * 0.3,
    col: (x, y, r) => jig(mix('#f6dfa8', '#fff8e6', r()), r, 3),
    len: (x, y) => 1.2 + free(x, y, 811) * 2.2, lw: (x, y) => 0.6 + free(x, y, 813) * 0.8, steps: 1, impasto: 0, relief: 0,
    op: 0.55,
  });
  shaftRanges.push([_shaft, out.length]);

  /* ====================== 4. THE VEIL — cloud ACROSS the light ======================
     Fred: "there is no cloud covering the light, add more clouds. this is after storm
     remember." Both halves of that are one thing. Nothing was in FRONT of the break, so
     the light sat on the sky like a decal — and a sky clearing after a storm is not a
     clean hole with tidy cloud parked either side of it, it is ragged wreckage still
     blowing past, tearing over the gap and thinning as it goes.
     So: torn cloud on its own cel, over the top of the beam and over the edges of the
     break itself, and it DRIFTS (CLOUD_DRIFT[9].veil). That drift is also the answer to
     "the light is still too static" — light does not move, but what passes in front of it
     does, and cloud dragging across a break is how a real one lives. */
  const _veil = out.length;
  {
    const rag = (cx2, cy2, rw, rh, n2, sd, op2) => {
      const L = lobes(cx2, cy2, rw, rh, n2, sd);
      const top = cy2 - rh * 0.9, bot = cy2 + rh * 0.8;
      strokes(out, counter, {
        rng, n: Math.round(rw * rh * 0.24),
        sample: r => {
          for (let k = 0; k < 8; k++) {
            const i = (r() * L.length) | 0, ll = L[i];
            const a2 = r() * Math.PI * 2, d = Math.pow(r(), 0.45);
            const x = ll[0] + Math.cos(a2) * ll[2] * d, y = ll[1] + Math.sin(a2) * ll[2] * 0.7 * d;
            if (y >= HZ - 6) continue;
            // ⚠ the same feather as the banks: near the rim a mark usually is not there at
            // all, so a shred thins away instead of ending in a wall
            if (r() > Math.pow(Math.max(0, inLobes(L, x, y)), 0.5) + 0.10) continue;
            return [x, y];
          }
          return null;
        },
        dir: (x, y) => {
          let bi = 0, bd = 9e9;
          for (let i = 0; i < L.length; i++) {
            const d = Math.hypot(x - L[i][0], (y - L[i][1]) / 0.7);
            if (d < bd) { bd = d; bi = i; }
          }
          const [u, v] = curlV(x, y, 40, 110);
          const tg = Math.atan2((y - L[bi][1]) / 0.7, x - L[bi][0]) + Math.PI / 2;
          return Math.atan2(Math.sin(tg) * 0.30 + (u + v) * 0.34, Math.cos(tg) * 0.30 + 0.76);
        },
        col: (x, y, r) => {
          const ll = L[nearest(L, x, y)];
          const own = Math.max(-1, Math.min(1, (ll[1] - y) / (ll[2] * 0.7)));
          const bx = OX - ll[0], by = OY - ll[1], bl = Math.hypot(bx, by) || 1;
          const px = x - ll[0], py = y - ll[1], pl = Math.hypot(px, py) || 1;
          const facing = (px / pl * bx / bl + py / pl * by / bl) * 0.5 + 0.5;
          const near = Math.max(0, 1 - Math.hypot((x - OX) / 250, (y - OY) / 200));
          let c = ramp(['#191436', '#241d4c', '#332b60', '#4b4278', '#6b6296', '#9891b8'],
                       Math.max(0, Math.min(1, own * 0.34 + facing * 0.4 + 0.28 + fbm(x / 55, y / 40, 921) * 0.24)));
          c = mix(c, '#f6e2b4', Math.min(0.85, near * Math.max(0, facing - 0.1) * 1.4));
          return jig(c, r, 6);
        },
        len: (x, y) => 7 + 17 * Math.max(0, inLobes(L, x, y)), lw: 5,
        steps: 5, follow: 0.97, wild: 0.12, lenJ: 0.7, wJ: 0.55, impasto: 0.1, relief: 0, op: op2 * 0.5,
      });
    };
    // shreds crossing the break itself, its shoulders, and the head of the beam
    rag(322, OY - 34, 132, 34, 6, 1.7, 0.92);   // over the break's upper left
    rag(486, OY + 6, 120, 30, 5, 4.3, 0.88);    // over its right cheek
    rag(400, OY + 74, 150, 24, 6, 9.1, 0.8);    // across the head of the beam
    rag(196, 118, 150, 40, 6, 6.5, 0.95);       // and on across the panorama, both ways
    rag(624, 92, 160, 42, 6, 2.3, 0.95);
    rag(-10, 150, 140, 38, 5, 8.9, 0.95);
    rag(792, 156, 140, 38, 5, 5.5, 0.95);
  }
  // ⚠ THE CLOUD SHADOWS ARE DELETED. Fred: "i still see straight lines on the clouds that
  // overlapping the light. what if you delete the shadows?" — his call, and the right one.
  // They were the last hard-edged thing near the break: a shadow band is long and narrow,
  // so even with both its sides wandering it still reads as a RULED STRIPE, because at that
  // aspect ratio your eye joins the wobbles into a line. Wobbling a stripe does not stop it
  // being a stripe. The beam still lives without them — the veil of torn cloud drifts
  // across the break, which was always the better half of the effect.
  veilRanges.push([_veil, out.length]);

  /* ====================== 5. EASTER EGG — Luke 19:10 ====================== */
  inscriptionText(out, greekRef(19, 10), { x: 96, y: 452, h: 15, body: '#e8d6a8', edge: '#120e30', op: 0.42, edgeOp: 0.5 });

  const _fg = out.length;   // the child is a runtime sprite (CAST1[9]) — nothing baked
  fgRanges.push([_fg, out.length]);

  const ALT = 'A huge dark storm fills the frame, cobalt going violet, its clouds wheeling in curves around a single break torn open in the middle of the sky. The rim of that break is lit gold and white-hot at its centre, and out of it a straight shaft of light falls, widening as it comes down, landing in a pool of warm gold on the dead plain below. One tiny figure stands in that pool, looking up. Inside the pool the ground comes back into colour and a few dead thistles catch the light; everywhere outside it the plain and the storm stay cold and dark. Off to the left one lone sycomore tree stands bent in the rain, dark against the storm, the side that faces the beam just warmed by it.';

  const RAW = { undercoat: 0, weave: 0, varnish: 0, oil: 0 };
  const setOf = ranges => { const s = new Set(); for (const [a, b] of ranges) for (let i = a; i < b; i++) s.add(i); return s; };
  const pick = ranges => ranges.map(([a, b]) => out.slice(a, b).join('\n')).join('\n');
  const fgSet = setOf(fgRanges), skySet = setOf(skyRanges), airSet = setOf(airRanges), shaftSet = setOf(shaftRanges), veilSet = setOf(veilRanges);
  if (LAYER === 'fg') return svgWrap(ALT, pick(fgRanges), RAW);
  if (LAYER === 'shaft') return svgWrap(ALT, pick(shaftRanges), RAW);
  if (LAYER === 'veil') return svgWrap(ALT, pick(veilRanges), RAW);
  if (LAYER === 'air') return svgWrap(ALT, pick(airRanges), RAW);
  if (LAYER === 'sky') return svgWrap(ALT, out[0] + '\n' + pick(skyRanges), RAW);
  if (LAYER === 'ground') return svgWrap(ALT, out.filter((_, i) => i > 0 && !fgSet.has(i) && !skySet.has(i)
                                    && !airSet.has(i) && !shaftSet.has(i) && !veilSet.has(i)).join('\n'), RAW);
  return svgWrap(ALT, out.join('\n'));
}
