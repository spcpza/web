// gen/plates/looking.mjs — "Love came looking" (incarnation: the seeking Light)
//
// "For the Son of man is come to seek and to save that which was lost." (Luke 19:10)
//
// The companion to garden: there a column of gold Light walks IN to find the
// hiding child. Here the Light has LEFT its place and come DOWN/OUT into the cold
// dark — a tall radiant gold figure of Light striding into the night, LAYING A
// BRIGHT ROAD of light ahead of itself as it goes, pressing toward a small RED
// child seen far ahead, still half-lost in the deep. The Son is come to seek.
//
// Munch: fire/the living curves — the Light's column FLAMES upward
// in licking curls; only the cold dark behind lies in straight, made streaks.
// Bright, no pure black: the seeking gold is the brightest thing, advancing; the
// dark gives way before it (chiaroscuro). One dominant gold, deep blue/violet night.
export const name = 'looking';
export const title = 'Love came looking';
export const caption = 'But Love came looking for you.';
export const seed = 20260617;
export const focal = { x: 400, y: 280 }; // the advancing Light, the road it lays, the distant child
// MOBILE 3D — depth planes (FAR→NEAR), so the page pans + parallaxes like the
// others. BACKGROUND (opaque): the cold starry night + its sparkle. MID: the gold
// road of Light and the tall seeking Light-column striding in. FOREGROUND: the
// small still-lost red child far ahead, with the first gold breath touching it.
// Desktop/`full` is the ORIGINAL single-layer painting, byte-identical.
export const layers = [
  { name: 'bg', opaque: true },   // the cold starry night (backmost, opaque)
  { name: 'mid' },                // the road of Light + the advancing Light-column
  { name: 'fg' },                 // the small lost red child (nearest)
];

export function paint(E, opts = {}) {
  const {
    mulberry32, fbm, curlV, goldenSpiralV, mix, ramp, jig, strokes, rej, segDist, ribbon,
    paintChild, castShadow, personCaps, paintPath, svgWrap, R1, W, H,
    GOLD, GOLD_PALE, GOLD_DEEP, GOLD_HOT,
  } = E;

  const rng = mulberry32(seed);
  const out = [];
  const counter = { n: 0 };
  // MOBILE 3D LAYERS: tag ranges per band as the strokes are laid; assemble the
  // requested plane at the end. FULL keeps the original order untouched.
  const LAYER = opts.layer || 'full';

  // the deepest dark is a nameable cold blue-violet — never black. The night is
  // cold and waiting; the only warmth is the Light that has come out into it.
  out.push(`<rect width="${W}" height="${H}" fill="#101637"/>`);

  /* ====================== THE BONES ====================== */
  // The Light enters from the LEFT and presses OUT and forward toward the lost
  // child far ahead at lower-right. It lays a bright road as it walks.
  const COLX = 196, COLBASE = 470, COLTOP = 70;       // the walking column of Light
  const CHILD = { x: 612, y: 360 };                    // the small, still half-lost red child, far ahead

  // the column's luminous body (used to warm the dark and gate the violet edge)
  const column = (x, y) => {
    const yc = Math.max(COLTOP, Math.min(COLBASE, y));
    const d = Math.hypot((x - COLX) * 1.12, (y - yc) * 0.9);
    return Math.exp(-d / 158);
  };
  // THE ROAD OF LIGHT — a bright spine pressed forward from the column's foot
  // out toward the child: the path the seeking Light lays ahead of itself. It
  // narrows as it reaches toward the lost one (the Light advancing INTO the dark).
  const roadSpine = t => [COLX - 6 + t * (CHILD.x - COLX + 8), COLBASE - 10 - t * (COLBASE - CHILD.y - 28)];
  const road = (x, y) => {
    let g = 0;
    for (let i = 0; i <= 12; i++) {
      const t = i / 12, p = roadSpine(t);
      const w = 92 - t * 56;                            // wide at the Light's foot, reaching thin toward the child
      g = Math.max(g, (0.96 - t * 0.5) * Math.exp(-segDist(x, y, p[0], p[1], p[0] + 0.1, p[1]) / w));
    }
    return g;
  };
  const light = (x, y) => Math.min(1, column(x, y) + road(x, y) * 0.85);

  /* ====================== 1. THE COLD NIGHT ======================
     The dark presses in, but it sparkles faintly and gives way to the gold.
     The night air lies in long, near-straight cold streaks (made/cold = straight)
     that bend only where the Light's warmth disturbs them. */
  // THE ALIVE NIGHT (the fractal sky — motion at three scales): the whole dark
  // WHEELS in one great spiral around the descent (macro), eddies turn inside
  // the wheel (mid), and every stroke curves with its parent current (micro).
  // Swirls within swirls — the night is not a wall, it is deep moving water.
  const EDDIES = [[430, 76, -66], [688, 128, 58], [560, 296, -50], [86, 128, 46]];
  const nightDir = (x, y) => {
    let vx = 0, vy = 0;
    { const [a, b] = goldenSpiralV(x, y, 520, 150, 115, 260); vx += a; vy += b; }   // the great wheel of the night
    for (const [ex, ey, s] of EDDIES) { const [a, b] = goldenSpiralV(x, y, ex, ey, s, 80); vx += a; vy += b; }
    const [c, d] = curlV(x, y, 31, 120); vx += c * 26; vy += d * 26;
    // the dark still recoils, curving around the advancing Light
    const dxc = x - COLX, dyc = y - (COLTOP + COLBASE) / 2;
    const dd = Math.hypot(dxc, dyc) + 1e-6, w = 90 / (1 + dd / 130);
    return Math.atan2(vy + (dyc / dd) * -w * 0.4 + (dxc / dd) * w, vx + (dyc / dd) * w + (dxc / dd) * w * 0.4);
  };
  const nightBlue = (x, y) => {
    const t = Math.max(0, Math.min(1, 0.05 + (y / H) * 0.42 + fbm(x / 150, y / 130, 61) * 0.3 - ((x - COLX) / 900) * 0.1));
    return ramp(['#2c3f86', '#243678', '#1d2c64', '#182452', '#141c44'], t);   // deep cold night, no black
  };
  const EGLOW = [[430, 76, '#3f549e'], [688, 128, '#4a3f92'], [560, 296, '#2f5a92'], [86, 128, '#41337e']];
  const nightCol = (x, y, r) => {
    const g = light(x, y);
    if (g > 0.14 && g < 0.3 && r() < 0.05) return jig('#8a5aa0', r, 14);        // violet flicker where gold dies
    let c = nightBlue(x, y);
    for (const [ex, ey, ec] of EGLOW) { const d2 = Math.hypot(x - ex, y - ey); c = mix(c, ec, Math.exp(-d2 / 95) * 0.5); }   // the eddy cores breathe faint jewel light
    if (g > 0.28 && g < 0.55) c = mix(c, '#6f9a50', (g - 0.28) * 2.0);          // gold→blue via green (law of yellow)
    c = mix(c, '#e8c468', Math.max(0, g - 0.45) * 1.35);                        // warmed where the Light reaches
    return jig(c, r, 9);
  };
  // the deep moving night — long streaming strokes that FOLLOW the wheel
  strokes(out, counter, {
    rng, n: 1150, sample: rej(-14, -14, 814, 514),
    dir: nightDir, col: nightCol,
    len: 44, lw: 9.5, steps: 4, follow: 0.91, wild: 0.05, lenJ: 0.5, impasto: 0.5, relief: 0.55,
  });

  /* ====================== 1.5 THE SPARKLE — the dark is not empty ====================== */
  for (let i = 0; i < 90; i++) {
    const x = 8 + rng() * 784, y = 4 + rng() * 470;
    if (light(x, y) > 0.3) continue;                   // not lost inside the gold
    const br = 0.6 + rng() * 1.6;
    const c = jig(mix('#fdf7da', '#cfe0f6', rng() * 0.55), rng, 6);
    out.push(ribbon([[x - br, y], [x + br, y]], 1.1, c)); counter.n++;
    out.push(ribbon([[x, y - br], [x, y + br]], 1.1, c)); counter.n++;
    if (br > 1.4) { out.push(ribbon([[x - br * 1.9, y], [x + br * 1.9, y]], 0.6, jig('#8fb0e0', rng, 6))); counter.n++; }
  }
  const bgEnd = out.length;   // BACKGROUND plane: the cold starry night + sparkle (opaque)

  /* ====================== 2. THE ROAD OF LIGHT — laid ahead as He goes ======================
     gold poured forward from the Light's foot toward the lost child: confident
     slabs near the column, fine touches reaching out into the far dark — the
     bright path the seeking Light presses ahead of itself. */
  strokes(out, counter, {
    rng, n: 820,
    sample: rej(120, 280, 700, 514, (x, y) => road(x, y) > 0.26),
    dir: (x, y) => Math.atan2(CHILD.y - 30 - y, CHILD.x - x) + (fbm(x / 80, y / 60, 43) - 0.5) * 0.4,
    col: (x, y, r) => {
      const g = road(x, y);
      return jig(ramp(['#9a6a3a', '#d29440', '#ecb84e', '#f8d472', '#fff0c2'], Math.min(1, g * 1.15)), r, 9);
    },
    // big near the Light's foot (low-left), reaching to fine touches toward the child
    len: (x, y) => 6 + 22 * Math.max(0, 1 - (x - COLX) / 460), lw: (x, y) => 2.8 + 8 * Math.max(0, 1 - (x - COLX) / 460),
    steps: 2, follow: 0.95, wild: 0.06, lenJ: 0.5, impasto: 0.6, relief: 0.85,
  });

  /* ====================== 3. THE SEEKING LIGHT — He has come out ======================
     a tall radiant gold figure of Light, the brightest thing, striding forward
     into the cold dark. The strokes rise but LICK AND CURL (Munch: fire is curved)
     — it flames. It LEANS forward (the lean is the walking-out toward the lost). */
  const colHalf = y => {
    const t = (COLBASE - y) / (COLBASE - COLTOP); if (t < 0 || t > 1) return 0;
    const flare = 1 + 0.5 * Math.exp(-(COLBASE - y) / 64);            // foot flare where it stands on the road
    return (60 - 28 * t) * flare;                                     // wide shoulder → narrowing crown
  };
  // FIRE FLAMES: curl noise + a forward lean (toward the child) → curling tongues
  const colDir = (x, y) => { const [a, b] = curlV(x, y, 140, 50); return Math.atan2(-1.0 + b * 1.9, (x - COLX) * 0.05 + 0.12 + a * 1.9); };
  strokes(out, counter, {        // the broad streaming halo — gold ripening outward to blue (law of yellow)
    rng, n: 600,
    sample: r => { const y = COLTOP - 10 + r() * (COLBASE - COLTOP + 22); const h = colHalf(y) + 14; return [COLX + (r() * 2 - 1) * h + (r() - 0.5) * 6, y]; },
    dir: colDir,
    col: (x, y, r) => {
      const d = Math.abs(x - COLX) / (colHalf(y) + 16);
      if (d > 0.72 && r() < 0.06) return jig('#8a5aa0', r, 12);       // violet where the halo dies
      return jig(ramp([GOLD_PALE, GOLD, '#e6a544', '#b08a3c', '#6f8a4c', '#3e6090'], Math.min(1, d * 1.02)), r, 8);
    },
    len: (x, y) => 22 + 16 * (COLBASE - y) / (COLBASE - COLTOP), lw: 4, steps: 5, follow: 0.9, wild: 0.12, lenJ: 0.5, relief: 0.75,
  });
  strokes(out, counter, {        // the solid burning core — dense, white-hot heart with body
    rng, n: 560,
    sample: r => { const y = COLTOP + r() * (COLBASE - COLTOP); const o = (r() + r() - 1) * colHalf(y) * 0.5; return [COLX + o, y]; },
    dir: colDir,
    col: (x, y, r) => jig(ramp([GOLD_HOT, mix(GOLD_HOT, GOLD_PALE, 0.5), GOLD_PALE, GOLD, '#e6a544'], Math.abs(x - COLX) / (colHalf(y) * 0.6) + (rng() - 0.5) * 0.08), r, 6),
    len: (x, y) => 20 + 14 * (COLBASE - y) / (COLBASE - COLTOP), lw: 3.6, steps: 4, follow: 0.92, wild: 0.1, lenJ: 0.45, impasto: 0.5,
  });
  strokes(out, counter, {        // footfall: gold splashing FORWARD onto the road it lays (the advance)
    rng, n: 260,
    sample: r => { const a = r() * Math.PI, d = Math.pow(r(), 1.1) * 110; return [COLX + 14 + Math.cos(a) * d * 1.7, COLBASE - 4 + Math.abs(Math.sin(a)) * d * 0.34]; },
    dir: () => 0.16,
    col: (x, y, r) => jig(ramp([GOLD_PALE, GOLD, '#d2933e', '#8a5a6a'], Math.hypot((x - COLX - 14) / 1.7, (y - COLBASE) * 2.0) / 110), r, 8),
    len: 10, lw: 3, steps: 2, relief: 0.85,
  });

  /* ====================== 4. THE LOST CHILD — small, far ahead, still half in the dark ======================
     YOU — the recurring red child of the book — far off down the dark, small and
     still half-lost, but the road of Light has nearly reached you. */
  const _fg = out.length;
  const cx = CHILD.x, cy = CHILD.y;
  // YOU — the small, still half-lost red child, far ahead in the dark; an
  // articulated little person, one arm reaching back toward the seeking Light.
  const caps = personCaps(cx, cy - 32, 32, {
    leftHand: [cx - 7, cy - 6],                          // arm reaching toward the Light at the left
    rightHand: [cx + 5, cy - 4],
    leftFoot: [cx - 3, cy], rightFoot: [cx + 4, cy - 1],
  });
  castShadow(out, counter, caps, { dir: 0.55 });
  paintChild(out, counter, rng, caps);
  // a first breath of the seeking gold falling on the child's near side — the
  // Light has nearly found you; the road's edge touches your edge
  paintPath(out, counter, rng, [[cx - 3.4, cy - 27], [cx - 4.4, cy - 16], [cx - 6, cy - 4]],
    (x, y, r) => jig(mix(GOLD_DEEP, '#8a6c34', r() * 0.6), r, 9), { lw: 1.1, len: 2.6, density: 0.6, jitter: 1.0 });
  const fgRange = [_fg, out.length];   // FOREGROUND plane: the small lost red child (nearest)

  /* ====================== HIDDEN EGG — Luke 19:10 in the original Greek ======================
     "the Son of man is come to seek and to save that which was lost" — the very
     verse of this page (the seeking), in the Greek alphabetic numerals it was
     first penned in (Ιθʹ·Ιʹ), cut subtly into the bright road between the Light
     and the child it reaches toward. A fourth-look secret for the seeker. */
  E.inscriptionText(out, E.greekRef(19, 10), { x: 392, y: 408, h: 14, body: '#1a1204', edge: '#f6eecc', op: 0.78, edgeOp: 0.55 });

  /* ====================== LIFE — the small things feel Him coming ======================
     (Luke 19:10 — He seeks; the night answers.) MOTHS ride the great wheel's
     own currents IN toward the flame — pale-gold curved wings, the little lost
     things already turning to the Light. And one HARE startles up out of the
     dark field, ears bolt upright, stretched mid-leap AWAY from the advancing
     gold — the wild thing surprised by grace. (Appended at the end of the mid
     band: they fly and flee in the Light-column's own plane.) */
  const moth = (mx, my, s) => {
    const ty = Math.max(COLTOP, Math.min(COLBASE, my));
    const a = Math.atan2(ty - my, COLX - mx);           // headed for the flame
    // its wake — a short curved breath of the spiral current it rides in on
    let px = mx - Math.cos(a) * 4 * s, py = my - Math.sin(a) * 4 * s;
    const wake = [[mx - Math.cos(a) * 2 * s, my - Math.sin(a) * 2 * s]];
    for (let k = 0; k < 3; k++) { const d = nightDir(px, py); px -= Math.cos(d) * 6.5; py -= Math.sin(d) * 6.5; wake.push([px, py]); }
    paintPath(out, counter, rng, wake, (x, y, r) => jig(mix('#8a7c52', '#565480', r() * 0.55), r, 8), { lw: 0.9, len: 3, density: 0.45, jitter: 0.7 });
    for (const w of [-1, 1]) {   // two swept-back curved wings (living = curved)
      const wx = mx + Math.cos(a + w * 2.1) * 6.4 * s, wy = my + Math.sin(a + w * 2.1) * 5.2 * s;
      paintPath(out, counter, rng,
        [[mx + Math.cos(a) * 1.6 * s, my + Math.sin(a) * 1.6 * s], [(mx + wx) / 2 + Math.cos(a) * 2.4 * s, (my + wy) / 2 + Math.sin(a) * 2.4 * s], [wx, wy]],
        (x, y, r) => jig(mix(GOLD_PALE, '#efe0b0', r() * 0.6), r, 7), { lw: 1.8 * s, len: 3, density: 1.15, jitter: 0.45 });
    }
    out.push(`<circle cx="${R1(mx)}" cy="${R1(my)}" r="${R1(1.25 * s)}" fill="#eec868"/>`); counter.n++;
  };
  moth(386, 148, 1.8);   // high on the wheel, banking in toward the crown
  moth(368, 66, 1.35);   // far and small, just entering the turn
  moth(476, 196, 1.5);   // out of the deep east dark, drawn across
  moth(430, 300, 1.65);  // low, skimming in over the road's far fringe
  // THE HARE — dark silhouette, pale belly (the one accent that reads at night)
  const HX = 520, HY = 285;   // dark field past the road's reach, shy of the child
  const hareDark = (x, y, r) => jig('#0d1230', r, 6);
  paintPath(out, counter, rng, [[HX - 7, HY + 1], [HX - 12, HY + 5.5], [HX - 15.5, HY + 8.5]], hareDark, { lw: 2.2, len: 3, density: 1.0, jitter: 0.4 });   // hind legs at full stretch
  paintPath(out, counter, rng, [[HX - 6, HY + 2.5], [HX - 10, HY + 6.5], [HX - 13, HY + 10]], hareDark, { lw: 2.0, len: 3, density: 0.9, jitter: 0.4 });
  paintPath(out, counter, rng, [[HX + 7, HY + 1], [HX + 11, HY + 5], [HX + 14, HY + 8.5]], hareDark, { lw: 1.9, len: 3, density: 0.9, jitter: 0.4 });      // forepaws reaching ahead
  paintPath(out, counter, rng, [[HX - 8, HY - 1], [HX - 1, HY - 4.5], [HX + 7, HY - 1]], hareDark, { lw: 5.2, len: 3.2, density: 1.3, jitter: 0.5 });       // the arched living body
  paintPath(out, counter, rng, [[HX - 6.5, HY + 0.5], [HX - 0.5, HY - 1.5], [HX + 6, HY + 0.5]], hareDark, { lw: 4.4, len: 3.2, density: 1.2, jitter: 0.45 });   // …made solid, one dark mass
  out.push(`<circle cx="${R1(HX + 10.5)}" cy="${R1(HY - 3)}" r="3.1" fill="#0d1230"/>`); counter.n++;                                                       // head
  paintPath(out, counter, rng, [[HX + 9.5, HY - 5.5], [HX + 7.5, HY - 11], [HX + 6.5, HY - 15]], hareDark, { lw: 2.3, len: 2.6, density: 1.1, jitter: 0.35 });   // ears bolt upright
  paintPath(out, counter, rng, [[HX + 12, HY - 5.5], [HX + 11, HY - 11.5], [HX + 10.5, HY - 15.5]], hareDark, { lw: 2.3, len: 2.6, density: 1.1, jitter: 0.35 });
  paintPath(out, counter, rng, [[HX - 5.5, HY + 2.6], [HX, HY + 3], [HX + 5, HY + 2.4]],
    (x, y, r) => jig(mix('#aabce2', '#8fa2cc', r() * 0.5), r, 7), { lw: 1.5, len: 2.8, density: 0.9, jitter: 0.35 });                                       // the pale belly, hugging the underside
  paintPath(out, counter, rng, [[HX - 8.5, HY - 2], [HX - 1, HY - 6], [HX + 6.5, HY - 3.5]],
    (x, y, r) => jig(mix(GOLD, '#b08a3c', r() * 0.45), r, 8), { lw: 1.0, len: 2.4, density: 0.75, jitter: 0.5 });                                           // the seeking gold rims its back
  paintPath(out, counter, rng, [[HX + 8.3, HY - 6], [HX + 6.3, HY - 11.2], [HX + 5.3, HY - 15]],
    (x, y, r) => jig(mix(GOLD, '#c0a050', r() * 0.5), r, 8), { lw: 0.85, len: 2.2, density: 0.75, jitter: 0.4 });                                           // …and the near edge of each tall ear
  paintPath(out, counter, rng, [[HX + 10.9, HY - 6], [HX + 9.9, HY - 11.6], [HX + 9.4, HY - 15.4]],
    (x, y, r) => jig(mix(GOLD, '#c0a050', r() * 0.5), r, 8), { lw: 0.8, len: 2.2, density: 0.7, jitter: 0.4 });
  paintPath(out, counter, rng, [[HX + 7.8, HY - 4.6], [HX + 9.8, HY - 6.2], [HX + 12.4, HY - 5.4]],
    (x, y, r) => jig(mix(GOLD, '#b8964a', r() * 0.45), r, 8), { lw: 0.9, len: 2.2, density: 0.7, jitter: 0.4 });                                            // gold grazing the crown of the head
  out.push(`<circle cx="${R1(HX + 11.6)}" cy="${R1(HY - 3.6)}" r="0.9" fill="#e8eefc"/>`); counter.n++;                                                     // one startled spark of an eye

  const ALT ='A cold blue-violet night, sparkling faintly; a tall radiant gold figure of Light strides in from the left, flaming upward in living curves, and lays a bright golden road ahead of itself across the dark toward a small red child seen far off — still half-lost. The Light has come out into the night to seek the one who was lost. Pale-gold moths ride the night’s spiral currents in toward the flame, and in the dark field a startled hare, ears up, leaps away from the advancing gold.';

  // MULTIPLANE: assemble the requested depth plane. Each is its own cel —
  // transparent where it has no content — so they stack and parallax apart on
  // mobile. The desktop/`full` press is the ORIGINAL single-layer painting.
  const RAW = { undercoat: 0, weave: 0, varnish: 0, oil: 0 };   // no baked surface — the live filter unifies the planes
  if (LAYER === 'bg') return svgWrap(ALT, out.slice(0, bgEnd).join('\n'), RAW);   // cold starry night (opaque)
  if (LAYER === 'fg') return svgWrap(ALT, out.slice(fgRange[0], fgRange[1]).join('\n'), RAW);   // the lost red child
  if (LAYER === 'mid') {   // the road of Light + the advancing Light-column (everything else above the night)
    const body = out.filter((_, i) => i >= bgEnd && !(i >= fgRange[0] && i < fgRange[1])).join('\n');
    return svgWrap(ALT, body, RAW);
  }
  // full painting (desktop): the original order, untouched
  return svgWrap(ALT, out.join('\n'));
}
