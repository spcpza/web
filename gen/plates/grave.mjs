// gen/plates/grave.mjs — "Three days" (the tomb sealed)
//
// Deep night on the same low hill. Set in it the same great cave — the tomb.
// But here the huge round stone is rolled ACROSS the mouth, SEALING it shut.
// The world is dark and still, holding its breath. He was laid in the dark,
// and they waited. Yet the Light is not extinguished: a faint held line of
// gold leaks at the seam where stone meets rock — hope, waiting, not gone.
//
//   "And that he was buried, and that he rose again the third day
//    according to the scriptures."                — 1 Corinthians 15:4
//
// This is plate 30's quiet predecessor: SAME tomb, SAME hill geometry, but
// CLOSED and dark (the three days before). No black — deep blue into violet;
// the only warm note is the restrained seam-glow. NO figure.
//
// MOBILE 3D — depth planes (BACK→NEAR): the night sky + stars behind (opaque);
// the hill, the dark tomb mouth and the faint seam-glow in the middle; the great
// SEALED STONE nearest, rolled across the mouth. As the reader tilts, the stone
// parallaxes against the still tomb behind it — the weight of the seal made felt.
export const name = 'grave';
export const title = 'Three days';
export const caption = 'They laid Him in the dark, and waited.';
export const seed = 30630406;
export const focal = { x: 400, y: 300 }; // the sealed stone across the mouth
export const layers = [
  { name: 'bg', opaque: true },  // night sky + stars (backmost, opaque)
  { name: 'mid' },               // hill, dark tomb mouth, faint seam-glow, far hills
  { name: 'near' },              // THE SEALED STONE — the great boulder across the mouth (nearest)
];

export function paint(E, opts = {}) {
  const {
    mulberry32, fbm, curlV, swirlV, mix, ramp, jig, strokes, rej,
    paintPath, lightRadial, svgWrap, R1, W, H,
    GOLD, GOLD_PALE, GOLD_DEEP, GOLD_HOT, NIGHT,
  } = E;

  const rng = mulberry32(seed);
  const out = [];
  const counter = { n: 0 };
  // MOBILE 3D LAYERS: tag the sky-end and the stone's range; MID = the rest.
  const LAYER = opts.layer || 'full';
  const nearRanges = [];
  out.push(`<rect width="${W}" height="${H}" fill="#161636"/>`);   // deep blue-violet — never black

  // SAME tomb geometry as plate 30 (so the two pages rhyme), but sealed.
  const TX = 400, TY = 322;
  // the one warm note: a faint held line of gold at the seam behind the stone.
  // restrained reach so it stays a whisper, not a blaze — the dawn comes NEXT.
  const seam = lightRadial(TX, TY - 6, 108);
  const lightAt = (x, y) => Math.min(0.7, seam(x, y) * 0.85);
  const horizon = x => 296 + 7 * Math.sin(x / 150) + (x - 400) * 0.01;
  // a cool MOON high on the left — the night's one COLD light. It gives the
  // nocturne real value-structure (a light logic), casts a silver rim on the
  // sealed stone so the boulder reads as a sphere, and leaves the gold seam the
  // only WARM note. Van Gogh's "Starry Night over the Rhône": deep dark, yet lit.
  const MX = 168, MY = 80;
  const moon = lightRadial(MX, MY, 168);
  const moonAt = (x, y) => moon(x, y);

  /* ---------------- 1. NIGHT SKY — deep, still, a few faint stars ----------------
     nature swirls (Munch), but this is a hush, not a storm: a slow, low turn
     of deep blue into violet. A dark gradient underpaints it so no flat ground
     shows; the world holds its breath. */
  out.push(`<defs><linearGradient id="nightN06" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#191a44"/>
<stop offset="0.5" stop-color="#22214e"/>
<stop offset="0.82" stop-color="#2c2552"/>
<stop offset="1" stop-color="#342a58"/>
</linearGradient></defs>`);
  out.push(`<rect x="-12" y="-12" width="${W + 24}" height="324" fill="url(#nightN06)"/>`);
  counter.n += 1;
  const SKYV = [
    { x: 220, y: 90, s: 36, f: 150 },
    { x: 600, y: 110, s: -34, f: 150 },
  ];
  const skyDir = (x, y) => {
    let vx = 10, vy = 1;                       // gentle horizontal drift (a still night)
    for (const v of SKYV) { const [a, b] = swirlV(x, y, v.x, v.y, v.s, v.f); vx += a; vy += b; }
    const [c, d] = curlV(x, y, 19, 170); vx += c * 30; vy += d * 30;
    return Math.atan2(vy, vx);
  };
  const skyCol = (x, y, r) => {
    const t = Math.max(0, Math.min(1, 0.1 + (y / 300) * 0.55 + fbm(x / 130, y / 120, 13) * 0.28));
    let c = ramp(['#1c1d46', '#22224e', '#2a2654', '#342a5a'], t); // deep blue high → violet low
    c = mix(c, '#8b96ce', moonAt(x, y) * 0.5);   // cool moonlight halo washes the sky around the moon
    return jig(c, r, 6);
  };
  // smooth night-sky masses (broad, hushed)
  strokes(out, counter, {
    rng, n: 240, sample: rej(-12, -12, 812, 312, (x, y) => y < horizon(x) + 8),
    dir: skyDir, col: skyCol, len: 34, lw: 9.5, steps: 4, follow: 0.88, wild: 0.04, lenJ: 0.5, relief: 0.55,
  });
  // a quiet second pass — slow curling filaments, the night turning softly
  strokes(out, counter, {
    rng, n: 150,
    sample: rej(-12, -12, 812, 300, (x, y) => y < horizon(x) + 2),
    dir: skyDir,
    col: (x, y, r) => jig(mix('#2a2a58', '#3a3266', Math.min(1, y / 240)), r, 5),
    len: 40, lw: 1.8, steps: 6, follow: 0.95, wild: 0.02, lenJ: 0.5, relief: 0,
  });
  // THE MOON — a cool silver disc with a soft breathing halo, painted where the
  // moonlight wash is brightest; the night's one cold light, watching over the tomb
  out.push(`<circle cx="${R1(MX)}" cy="${R1(MY)}" r="34" fill="#aeb7e2" opacity="0.14"/>`);
  strokes(out, counter, {
    rng, n: 40,
    sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 0.75) * 15; return [MX + Math.cos(a) * d, MY + Math.sin(a) * d]; },
    dir: (x, y) => Math.atan2(y - MY, x - MX) + Math.PI / 2,
    col: (x, y, r) => jig(mix('#c6ccec', '#f2f4fc', Math.max(0, 1 - Math.hypot(x - MX, y - MY) / 15)), r, 4),
    len: 4.5, lw: 2.4, steps: 2, follow: 0.92, lenJ: 0.35, relief: 0.4,
  });
  out.push(`<circle cx="${R1(MX)}" cy="${R1(MY)}" r="12" fill="#f2f4fc" opacity="0.6"/>`);
  counter.n += 2;
  // a few faint stars — small, cold, scattered high (Ps 30:5, joy cometh in the morning)
  for (const [stx, sty, ss] of [[120, 70, 1], [188, 104, 0.7], [300, 60, 0.85], [560, 80, 0.8], [648, 118, 0.7], [704, 64, 0.9], [430, 92, 0.6], [520, 148, 0.7], [370, 130, 0.6], [680, 168, 0.65]]) {
    const sc = jig('#cdd2ee', rng, 8);
    out.push(`<circle cx="${R1(stx)}" cy="${R1(sty)}" r="${(0.9 * ss).toFixed(1)}" fill="${sc}" opacity="0.7"/>`);
    out.push(`<path d="M${R1(stx - 3 * ss)} ${R1(sty)}L${R1(stx + 3 * ss)} ${R1(sty)}M${R1(stx)} ${R1(sty - 3 * ss)}L${R1(stx)} ${R1(sty + 3 * ss)}" stroke="${sc}" stroke-width="0.5" opacity="0.4"/>`);
    counter.n += 2;
  }
  const skyEnd = out.length;   // the night sky + stars is the BACKGROUND plane (opaque)

  /* ---------------- 2. THE HILL ---------------- */
  // the same green-blue rise, but unlit — deep and cold, only barely warmed
  // by the faint seam near the tomb
  strokes(out, counter, {
    rng, n: 720,
    sample: rej(-12, 286, 812, 512, (x, y) => y > horizon(x) - 4),
    dir: (x, y) => 0.04 + (fbm(x / 70, y / 50, 27) - 0.5) * 0.5,
    col: (x, y, r) => { let c = ramp(['#1c2a42', '#1f3242', '#243a40', '#2a4042'], fbm(x / 80, y / 50, 29)); c = mix(c, '#3f4a72', moonAt(x, y) * 0.4); c = mix(c, GOLD_DEEP, lightAt(x, y) * 0.6); return jig(c, r, 7); },
    len: 16, lw: 5.4, steps: 2, follow: 0.95, wild: 0.05, lenJ: 0.45, relief: 0.5,
  });

  /* ---------------- 3. THE SEALED TOMB ---------------- */
  // the same great cave in the hill — but here a faint held line of gold leaks
  // at the SEAM where the stone meets the rock. The Light is not extinguished,
  // only waiting. Restraint: it must stay a quiet line, not a glow.
  {
    const cw = 64, ch = 92, cy = TY + 18;
    // stone centre + radii — a BIG boulder that fully COVERS the mouth (so it
    // reads as SEALED, not an open cave); defined first so the seam can hug its rim
    const SCX = TX, SCY = cy - ch * 0.2, SRX = cw + 10, SRY = ch * 0.85;
    // the dark mouth of the tomb (the cave behind the stone) — deepest, but not black
    out.push(`<path d="M${R1(TX - cw)} ${R1(cy + ch * 0.5)}Q${R1(TX - cw)} ${R1(cy - ch)} ${TX} ${R1(cy - ch)}Q${R1(TX + cw)} ${R1(cy - ch)} ${R1(TX + cw)} ${R1(cy + ch * 0.5)}Z" fill="#171430"/>`);
    counter.n++;
    // the faint GOLD SEAM — a thin held line of light leaking UNDER the stone's
    // lower-left rim where it does not quite seal (the only warm note on the page)
    strokes(out, counter, {
      rng, n: 80,
      sample: r => { const a = Math.PI * (0.52 + r() * 0.5); const d = SRX * (0.9 + r() * 0.12); return [SCX + Math.cos(a) * d, SCY + Math.sin(a) * d * SRY / SRX]; },
      dir: (x, y) => Math.atan2(y - SCY, x - SCX) + Math.PI / 2,
      col: (x, y, r) => jig(mix(GOLD_DEEP, GOLD_PALE, r() * 0.45), r, 6),
      len: 6, lw: 1.5, steps: 2, lenJ: 0.5, relief: 0,
    });
    // THE STONE — rolled ACROSS the mouth, SEALING it (Matt 27:60, "rolled a
    // great stone to the door of the sepulchre"). A huge rounded boulder set
    // square over the opening — the opposite of plate 30's rolled-clear stone.
    // It is the NEAREST plane: as the reader tilts, it parallaxes against the
    // still dark mouth behind it — the weight of the seal made felt.
    const _near = out.length;
    out.push(`<ellipse cx="${R1(SCX)}" cy="${R1(SCY)}" rx="${R1(SRX)}" ry="${R1(SRY)}" fill="#3a3c62"/>`);
    counter.n++;
    strokes(out, counter, {
      rng, n: 440,
      sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 0.6) * SRX; return [SCX + Math.cos(a) * d, SCY + Math.sin(a) * d * SRY / SRX]; },
      dir: (x, y) => Math.atan2(y - SCY, x - SCX) + Math.PI / 2,   // strokes wrap the round form
      col: (x, y, r) => {
        // sphere-shade the boulder toward the moon (lambert on the ellipse normal),
        // independent of distance, so the great sealed stone reads as a ROUND MASS
        const nx = (x - SCX) / SRX, ny = (y - SCY) / SRY, nl = Math.hypot(nx, ny) || 1;
        const lx = MX - x, ly = MY - y, ll = Math.hypot(lx, ly) || 1;
        const lam = Math.max(0, (nx / nl) * (lx / ll) + (ny / nl) * (ly / ll));
        const g = lightAt(x, y);
        let c = ramp(['#2e3054', '#3c3e66', '#50527e'], fbm(x / 28, y / 28, 41));   // lighter than the hill so it separates
        c = mix(c, '#a7adde', Math.pow(lam, 1.1) * 0.72);   // clear cool moonlit dome (upper-left)
        c = mix(c, GOLD_DEEP, g * 0.4);                     // faint warm catch on the seam side
        return jig(c, r, 6);
      },
      len: 9, lw: 3, steps: 2, follow: 0.95, lenJ: 0.45, relief: 0.6,
    });
    // a clear cool rim-light along the stone's upper-left curve (moonlight) — the
    // edge that makes the boulder read as a round mass against the dark
    paintPath(out, counter, rng, [[SCX - SRX * 0.72, SCY - SRY * 0.28], [SCX - SRX * 0.28, SCY - SRY * 0.66], [SCX + SRX * 0.34, SCY - SRY * 0.58]],
      (x, y, r) => jig(mix('#6a70a8', '#a8ade0', r() * 0.6), r, 6), { lw: 2.6, len: 5, density: 0.8, jitter: 0.8 });
    nearRanges.push([_near, out.length]);   // ← the sealed stone is the near foreground plane
  }

  /* ---------------- DISTANT HILLS — the same far skyline, unlit ----------------
     echoes plate 30's moving horizon, but in cold night blues. */
  E.distantHills(out, counter, rng, { topFn: E.ridge(horizon, { amp: 26, freq: 195, bumps: 0.5, seed: 30 }), horizonFn: horizon, cols: ['#1c3040', '#22384a', '#2c4250'], depth: 62, lightFn: lightAt, seed: 30 });
  E.horizonFringe(out, counter, rng, { horizonFn: horizon, x0: -10, x1: 810, cols: ['#1f3242', '#243a40', '#2a4042', '#324a48'], hMax: 16, lightFn: lightAt, seed: 304 });

  /* ---------------- EGG: 1 Corinthians 15:4 in KOINE GREEK numerals ----------------
     ΙΕʹ·Δʹ (15, 4) — "buried... rose again the third day." Cut faint into the
     hill, lower-left, a light incise on the dark. */
  E.inscriptionText(out, E.greekRef(15, 4), { x: 312, y: 452, h: 14, body: '#d8def0', edge: '#101428', op: 0.78, edgeOp: 0.5 });

  /* ---------------- 4. THE TOMB GARDEN — John 19:41 ----------------
     "Now in the place where he was crucified there was a garden; and in
     the garden a new sepulchre." Two olive trees keep watch on the dark
     hill, a cut sprig lies at the stone's base, and quiet CLOSED night-
     flowers bow near the stone, waiting for morning (Ps 30:5). Subdued —
     grief, not gloom: everything cool silver-sage and lavender, so the
     gold seam stays the one warm held light. Own-seeded rngs; appended
     at the end of the MID band so nothing upstream re-rolls. */
  {
    // an olive tree — curved living trunk (Munch), silvery-sage canopy:
    // bright enough to read against the deep hill, cool so the seam stays warmest
    const olive = (bx, by, hgt, lean, sd) => {
      const t = mulberry32(sd);
      const trunkCol = (x, y, r) => jig(mix('#2b2846', '#4a4266', Math.max(0, Math.min(1, (by - y) / hgt))), r, 6);
      paintPath(out, counter, t, [[bx, by], [bx + lean * 0.35, by - hgt * 0.42], [bx + lean * 0.85, by - hgt * 0.74]], trunkCol, { lw: 2.8, len: 4, density: 0.9, jitter: 0.7 });
      paintPath(out, counter, t, [[bx + lean * 0.3, by - hgt * 0.4], [bx + lean * 0.3 - hgt * 0.24, by - hgt * 0.62]], trunkCol, { lw: 1.6, len: 4, density: 0.8, jitter: 0.6 });
      paintPath(out, counter, t, [[bx + lean * 0.6, by - hgt * 0.56], [bx + lean * 0.6 + hgt * 0.22, by - hgt * 0.78]], trunkCol, { lw: 1.5, len: 4, density: 0.8, jitter: 0.6 });
      const cx0 = bx + lean * 0.8, cy0 = by - hgt * 0.8, crx = hgt * 0.46, cry = hgt * 0.3;
      strokes(out, counter, {
        rng: t, n: 120,
        sample: r => { const a = r() * Math.PI * 2, d = Math.sqrt(r()); return [cx0 + Math.cos(a) * d * crx, cy0 + Math.sin(a) * d * cry]; },
        dir: (x, y) => { const [a, b] = curlV(x, y, 7, 24); return Math.atan2(b, a); },
        col: (x, y, r) => jig(ramp(['#41564c', '#5a7262', '#748e78', '#8aa48c'], Math.max(0, Math.min(1, 0.25 + r() * 0.45 + ((cy0 - y) / (cry * 2)) * 0.35))), r, 7),
        len: 6, lw: 1.7, steps: 3, follow: 0.85, wild: 0.15, lenJ: 0.5, relief: 0.3,
      });
    };
    olive(298, 432, 76, -10, 906101);   // left of the tomb, leaning gently toward it
    olive(524, 420, 62, 8, 906102);     // right, smaller — further up the hill

    // a cut olive sprig laid against the stone's base — a mourner's offering
    {
      const t = mulberry32(906103);
      paintPath(out, counter, t, [[338, 404], [352, 398], [366, 396]], (x, y, r) => jig('#4a4266', r, 6), { lw: 1.5, len: 3, density: 0.9, jitter: 0.5 });
      for (const [lx, ly, la] of [[344, 400, -27], [351, 396, -72], [358, 395, -21], [364, 393, -66], [369, 394, -27]]) {
        const lc = jig(mix('#6c8672', '#92ac94', t() * 0.6), t, 7);
        out.push(`<ellipse cx="${R1(lx)}" cy="${R1(ly)}" rx="3.4" ry="1.2" fill="${lc}" opacity="0.9" transform="rotate(${la} ${R1(lx)} ${R1(ly)})"/>`);
        counter.n++;
      }
    }

    // quiet CLOSED night-flowers near the stone — pale lavender buds bowed
    // on curved stems (living = curved), a cool moon-tip, never warmer than the seam
    const bud = (fx, fy, s, sd) => {
      const fr = mulberry32(sd);
      const bl = (fr() - 0.5) * 7 * s;
      const bx2 = fx + bl, by2 = fy - 13 * s;
      out.push(`<path d="M${R1(fx)} ${R1(fy)}Q${R1(fx + bl * 0.2 - 2 * s)} ${R1(fy - 7 * s)} ${R1(bx2)} ${R1(by2)}" fill="none" stroke="${jig('#31434a', fr, 6)}" stroke-width="${(1.1 * s).toFixed(1)}" stroke-linecap="round" opacity="0.95"/>`);
      const bc = jig(mix('#877fb4', '#b3addb', fr() * 0.7), fr, 6);
      out.push(`<path d="M${R1(bx2)} ${R1(by2 + 4.4 * s)}Q${R1(bx2 - 2.7 * s)} ${R1(by2 + 1.2 * s)} ${R1(bx2)} ${R1(by2 - 3.6 * s)}Q${R1(bx2 + 2.7 * s)} ${R1(by2 + 1.2 * s)} ${R1(bx2)} ${R1(by2 + 4.4 * s)}Z" fill="${bc}"/>`);
      out.push(`<circle cx="${R1(bx2)}" cy="${R1(by2 - 2.2 * s)}" r="${(0.9 * s).toFixed(1)}" fill="#cfcbe6" opacity="0.7"/>`);
      out.push(`<ellipse cx="${R1(fx - 3 * s)}" cy="${R1(fy - 5 * s)}" rx="${(2.6 * s).toFixed(1)}" ry="${(1 * s).toFixed(1)}" fill="${jig('#3c5450', fr, 6)}" opacity="0.9" transform="rotate(-38 ${R1(fx - 3 * s)} ${R1(fy - 5 * s)})"/>`);
      counter.n += 4;
    };
    // flanking the sealed stone (clear of the seam and the hidden verse-ref)
    bud(316, 408, 1.3, 906111); bud(326, 416, 1.0, 906112);
    bud(478, 404, 1.25, 906113); bud(489, 412, 0.95, 906114); bud(470, 414, 0.8, 906115);
    // a few further off on the dark ground — the garden breathes, softly
    bud(254, 452, 1.1, 906116); bud(560, 448, 1.15, 906117); bud(586, 468, 0.9, 906118);
    bud(414, 446, 0.85, 906119);
  }

  const ALT = 'Deep night on a low hill, holding its breath. Set in the hill is a great cave — the tomb — and a huge round stone has been rolled across its mouth, sealing it shut. It is a tomb in a garden: two silvery olive trees keep watch on the dark hill, a cut olive sprig lies at the base of the stone, and pale closed night-flowers bow near it, waiting for morning. The world is dark blue and violet, with a few faint stars. The only warm note is a faint held line of gold leaking at the seam behind the sealed stone: the Light is not extinguished, only waiting. He was laid in the dark, and they waited the three days. Hidden faint in the hill is the reference 1 Corinthians 15:4, in the old Greek letter-numerals.';

  // MULTIPLANE: assemble the requested depth plane. Each is its own cel —
  // transparent where it has no content — so they stack and parallax apart.
  const RAW = { undercoat: 0, weave: 0, varnish: 0, oil: 0 };   // no baked surface — the live filter unifies the planes
  const setOf = ranges => { const s = new Set(); for (const [a, b] of ranges) for (let i = a; i < b; i++) s.add(i); return s; };
  const pick = ranges => ranges.map(([a, b]) => out.slice(a, b).join('\n')).join('\n');
  const nearSet = setOf(nearRanges);
  if (LAYER === 'bg') return svgWrap(ALT, out.slice(0, skyEnd).join('\n'), RAW);     // night sky + stars (opaque)
  if (LAYER === 'near') return svgWrap(ALT, pick(nearRanges), RAW);                  // the sealed stone (nearest)
  if (LAYER === 'mid') {                                                             // hill, dark mouth, seam-glow, far hills
    const body = out.filter((_, i) => i >= skyEnd && !nearSet.has(i)).join('\n');
    return svgWrap(ALT, body, RAW);
  }
  // full painting (desktop): the original order, UNCHANGED — byte-identical
  return svgWrap(ALT, out.join('\n'));
}
