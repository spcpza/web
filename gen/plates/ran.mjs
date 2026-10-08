// gen/plates/ran.mjs — "He ran"
// A churning gold wheat field under a turbulent blue-green sky; a pale road
// cuts a diagonal; a small figure has taken three steps in, while from the
// far house the father, already past halfway, runs with dust flying.

export const name = 'ran';
export const title = 'He ran';
export const caption = 'You walk toward Him. He runs.';
export const seed = 15203121;
export const focal = { x: 290, y: 400 }; // portrait window: the running father (315) with the child (156) in frame
// MOBILE 3D — a DEEP DIORAMA, drawn WITH INTENTION for layers. The whole stage
// is split into planes that parallax at distinct rates (composite-once → cheap):
// the SKY is a smooth ground + stacked swirl-sheets (PAINT ON PAINT, like the
// covers); the distant hills + house sit far; the BIRDS drift in their own air;
// the planted field + trees + sheep ride one ground plane (trees stay PLANTED so
// they don't float); the running Father leads; the near child leads most. Custom
// names → a clean monotonic depth ramp (avoids the fixed sky/far/mid/near/fg ladder).
// ⭐ DETAIL PASS (Sep 8): finer sheets, every stroke its own width and length (free hashes,
// no rule — see widthOf/lengthOf in paint()); the sheets still orbit per drawing.
export const SKY_SHEETS = [
  { n: 900, len: 28, lw: 3.0, lift: 0.00 },
  { n: 960, len: 24, lw: 2.7, lift: 0.06 },
];
export const layers = [
  { name: 'sky', opaque: true },  // smooth sky ground (backmost, opaque)
  ...SKY_SHEETS.map((_, i) => ({ name: 'sky' + (i + 1) })),   // stacked sky-swirl sheets
  { name: 'hills', op: 0.9 },     // distant hills, far cypress — op↑ so the solid castle isn't see-through
  // ⚠ THE KINGDOM ON ITS OWN PLANE. Fred: "make the kingdom shine!" A light that breathes
  // needs a plane of its own — the runtime stacks a copy of it and pulses the copy, which
  // it cannot do to the Father's house while it is baked into the distant hills.
  { name: 'city', op: 0.95 },     // the Father's house — IT SHINES (DIO_LIFE light)
  { name: 'birds' },              // the birds, drifting in their own air
  { name: 'land' },               // the wheat field, road, fruit-trees, sheep, fringe, wildflowers (planted)
  { name: 'dad' },                // the running Father
  { name: 'kid' },                // the near child (closest, leads most)
];

export function paint(E, opts = {}) {
  const {
    mulberry32, fbm, curlV, goldenSpiralV, mix, ramp, jig, strokes, rej,
    paintFigure, radiantHalo, paintLight, paintPath, dirtRoad, inCap, underpaintCapsules, paintChild, castShadow, personCaps, lightRadial, setReliefLight, svgWrap, R1, W, H,
    GOLD, GOLD_PALE, GOLD_DEEP, GOLD_HOT, klimtGold, goldSparks,
    fruitTree, jewelBush, LEAF_PALETTES, horizonFringe, ridge, distantHills, perspectiveAvenue,
    limbs, spreadTips, gAt,
  } = E;

  // ══ THE RISEN GROUND, ROLLED FORWARD ═══════════════════════════════════════════════
  // Fred: "make the ground like the risen page from this page onwards." From the empty tomb
  // on, the book lives in the light — so the earth stops being a flat green shape with
  // confetti scattered over it and becomes what `risen`'s ground is: a LIGHT plane, warm,
  // and full of drifting colour. Same rig as that page, same rule — hue moves, value stays,
  // saturation rides the mid-tones — so the field can carry rose, apricot, cornflower and
  // young green at once and still read as one sunlit ground.
  const HEXN = c => { const n = parseInt(c.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
  const HEXS = (r, g, b) => '#' + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
  const toHSL = (r, g, b) => {
    r /= 255; g /= 255; b /= 255;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2;
    if (mx === mn) return [0, 0, l];
    const d = mx - mn, sa = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
    let h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
    return [h / 6, sa, l];
  };
  const toRGB = (h, sa, l) => {
    if (sa === 0) return [l * 255, l * 255, l * 255];
    const q = l < 0.5 ? l * (1 + sa) : l + sa - l * sa, pp = 2 * l - q;
    const f = t => { t = ((t % 1) + 1) % 1;
      if (t < 1 / 6) return pp + (q - pp) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return pp + (q - pp) * (2 / 3 - t) * 6;
      return pp; };
    return [f(h + 1 / 3) * 255, f(h) * 255, f(h - 1 / 3) * 255];
  };
  //          rose  peach corn  young-green  gold  lilac  corn  apricot
  const HUES = [0.96, 0.06, 0.09, 0.60, 0.96, 0.28, 0.13, 0.76, 0.60];   // ← risen.mjs, verbatim
  const chroma = (c, x, y, k, sd = 211) => {
    const f = fbm(x / 155, y / 135, sd);
    const H = HUES[Math.min(HUES.length - 1, Math.floor(f * HUES.length * 1.25))];
    const rgb = HEXN(c);
    let [h, sa, l] = toHSL(rgb[0], rgb[1], rgb[2]);
    let d = H - h; if (d > 0.5) d -= 1; if (d < -0.5) d += 1;
    const kk = k * (0.6 + fbm(x / 62, y / 58, sd + 3) * 0.75);
    h = (h + d * kk + 1) % 1;
    sa = Math.min(0.62, sa + kk * 0.5 * (1 - Math.abs(l - 0.55) * 1.5));
    const o = toRGB(h, sa, l);
    return HEXS(o[0], o[1], o[2]);
  };

  const rng = mulberry32(seed);
  const out = [];
  const counter = { n: 0 };
  // MOBILE 3D LAYERS: everything draws once, in order; we record which out[]
  // index ranges belong to each depth band (far / near / fg). Whatever is not
  // tagged falls to the MID plane (the field). The build emits one cel per band.
  const LAYER = opts.layer || 'full';
  const farRanges = [], cityRanges = [], nearRanges = [], fgRanges = [], birdRanges = [];
  // ⭐ EVERY STROKE DRAWS ITS OWN WIDTH AND LENGTH (Fred: "use no rules, a paint stroke
  // just exist because it exist") — two independent hashes per mark, no field, no coupling.
  const free = (x, y, salt) => { const n = Math.sin(x * 12.9898 + y * 78.233 + salt) * 43758.5453; return n - Math.floor(n); };
  const widthOf  = (x, y, salt) => 0.40 + 3.2 * Math.pow(free(x, y, salt), 2.6);
  const lengthOf = (x, y, salt) => 0.40 + 1.5 * Math.pow(free(x, y, salt + 17), 1.5);
  // POST-RESURRECTION: the new creation is VIBRANT and joyful — a happy sky of
  // light blue, lilac and pink. The FATHER is the Light (He runs radiant, not a
  // dark form); only YOU (the child) are a small dark figure in the bright day.
  out.push(`<rect width="${W}" height="${H}" fill="#6ecaf7"/>`);

  const horizon = 214;   // a bit lower → more sky framing the home, the home reads clearly
  // SCALE GRADIENT — a mark at your feet is far bigger than a mark at the horizon.
  // Drawn all one size, ground reads as a flat green shape however good the colour
  // is; sized by depth it reads as ground going away from you.
  const dS = y => 0.32 + 1.0 * Math.max(0, Math.min(1, (y - horizon) / (H - horizon)));
  // a JOY sky — vibrant: saturated yellow + pink in swirling patches, white & sky-blue between
  const SKY = ['#7ec4ee', '#fbdf72', '#f586b6', '#fdeef2', '#f3a276'];
  // a FLOURISHING field — the new creation: the desert blossoms (Isa 35:1),
  // deep green and fresh, gold only at the lit crowns
  const WHEAT = ['#3a7a38', '#5e9a40', '#88b84a', '#bcc850', '#e6d266'];
  const SHADOW = '#2c6a48';

  // sky: THE ALIVE JEWEL-SWIRL (looking/garden's hand) — motion at THREE scales.
  // ONE great wheel turns the whole daytime heaven around the Father's home at the
  // right (macro); a few eddies turn inside it (mid); and every stroke curves with
  // its parent current (micro). Swirls within swirls — the bright day is deep
  // moving water, wheeling the way the Father runs.
  const WHEEL = [648, 128, 115, 260];   // great wheel: centre over the home/Father-burst
  const EDDIES = [[180, 70, -60], [430, 102, 58], [560, 56, -52], [92, 132, 48]];   // 4 mid eddies, alternating sign
  const eddyF = 80;
  const nearSK = (x, y) => { let m = 1e9; for (const [ex, ey] of EDDIES) m = Math.min(m, Math.hypot(x - ex, y - ey) / eddyF); return m; };
  // ══ THE SKY IS DRAWN SEVERAL TIMES, AND THE WHEEL TURNS BETWEEN THEM ═══════════════
  // Fred: "did you make any changes on the sky? i cant see anything. dont be lazy. draw a few
  // version of the sky and rotate it around to make the sky move."
  //
  // He is right and the measurement agrees with him: the engine's boil only DISPLACES each
  // stroke a hair, and on a smooth swirling sky that came to 6% of pixels at a mean delta of
  // 3/255 — arithmetic, not motion. A sky like this cannot be animated by jiggling its paint.
  //
  // So each drawing turns the whole weather system instead. The sky's pattern — the great
  // golden wheel, its eddies, the colour masses, every stroke's direction — is sampled from a
  // frame rotated about the wheel's own centre, ~6° per drawing. Rigid rotation: sample at the
  // turned coordinate, then turn the resulting direction back by the same angle, so the
  // current stays coherent instead of shearing. Three drawings, cycled slowly, and the whole
  // heaven wheels over the field the way it does in the painting's own logic (the sky already
  // turns about the Father's house — now it actually turns).
  const FRM = (globalThis.__FRAME || 0);
  // ⚠ 0.105 rad (6°) WAS TOO SMALL TO SEE. Fred, again: "i do not see anything changed." Three
  // drawings 6° apart, cross-faded over six seconds each, is a measurable change and an
  // invisible one — the eye needs a bigger step to register a turn at all. 0.19 rad is ~11°
  // per drawing, a 22° sweep across the ring, which reads as weather actually wheeling.
  // ⚠ AND THE STEP COMES BACK DOWN. 11° between drawings is fine for a hard swap and far too
  // far for a BLEND — two drawings 11° apart read through each other as a double exposure,
  // which is half of what looked ugly. At ~5° consecutive drawings are close enough that the
  // dissolve reads as one sky moving, not two skies fighting.
  // ⚠ A CAROUSEL MUST RETURN TO WHERE IT STARTED. Rotating a little further on every drawing
  // marched off in one direction, so five handovers were a perfect 13% apart and the sixth —
  // the one that wraps b6 back to b1 — was 25%, a visible lurch once every breath.
  //
  // So the drawings do not rotate at all now. Every stroke ORBITS A SMALL CIRCLE, all of them
  // in phase: at drawing k the whole sheet is offset by (cos θ, sin θ)·r with θ = 2πk/N. Three
  // properties fall out of that, and they are exactly the three Fred has been asking for:
  //   · it CLOSES — θ comes back round to 0, so there is no seam anywhere in the loop;
  //   · it is EVEN — equal arcs mean every handover is the same size, no lurch;
  //   · it never PAUSES — a circle has no ends to slow down at, unlike a sway, which has to
  //     stop and turn round twice a cycle (that is the "long hold, fast transition" again).
  // And the paint churns through the sky's own colour field rather than the field spinning
  // with it, which is what weather looks like: the current stays, the paint moves through it.
  const NF = Math.max(2, globalThis.__FRAME_N || 6);
  const TH = 2 * Math.PI * ((globalThis.__FRAME || 0) % NF) / NF;
  const ORB = 13;                                            // plate units — how far a mark drifts
  const OX = Math.cos(TH) * ORB, OY = Math.sin(TH) * ORB * 0.62;
  const skyDir = (x, y) => {
    let vx = 0, vy = 0;
    // 1 · MACRO — the ONE great wheel organising the whole sky (over the home)
    { const [a, b] = goldenSpiralV(x, y, WHEEL[0], WHEEL[1], WHEEL[2], WHEEL[3]); vx += a; vy += b; }
    // 2 · MID — eddies turning inside the wheel
    for (const [ex, ey, s] of EDDIES) { const [a, b] = goldenSpiralV(x, y, ex, ey, s, eddyF); vx += a; vy += b; }
    // 3 · MICRO — fine turbulence so every stroke curves with its parent current
    const [c, d] = curlV(x, y, 31, 120); vx += c * 26; vy += d * 26;
    return Math.atan2(vy, vx);
  };
  // jewel eddy-glow — the eddy cores breathe faint DAY-sky jewel colour
  // (teal / rose / gold / sky), subtle so the bright day stays bright
  const EGLOW = [[180, 70, '#5bbccb'], [430, 102, '#f5a8c6'], [560, 56, '#f7d47c'], [92, 132, '#8fd2f0']];
  const skyCol = (x, y, r, lift) => {
    // a VIBRANT light-blue sky, warm gold+pink low at the horizon, white at the crown
    const t = Math.max(0, Math.min(1, (horizon - y) / horizon * 1.05 + fbm(x / 120, y / 120, 133) * 0.3 - 0.04));
    let c = ramp(['#fbd24e', '#f8a4c2', '#54c6f7', '#74cef8', '#a6e2fb', '#f0fbff'], t);
    for (const [ex, ey, ec] of EGLOW) { const d2 = Math.hypot(x - ex, y - ey); c = mix(c, ec, Math.exp(-d2 / 95) * 0.42); }
    if (lift) c = mix(c, '#ffffff', lift);
    return jig(c, r, 6);
  };
  // the smooth sky GROUND — broad soft masses (opaque base); the swirling
  // brushwork lives in the stacked sheets above, so their gaps reveal paint
  strokes(out, counter, {
    rng, n: 1300, sample: rej(-10, -10, 810, horizon + 6),
    dir: skyDir, col: (x, y, r) => skyCol(x, y, r, 0),
    len: (x, y) => 30 * lengthOf(x, y, 11), lw: (x, y) => 4.6 * widthOf(x, y, 13), steps: 4, follow: 0.91, wild: 0.05, lenJ: 0.3, wJ: 0.3, impasto: 0.5, relief: 0.4,
  });
  const skyEnd = out.length;   // the smooth sky ground is the SKY plane (opaque)
  // the stacked SKY-SWIRL SHEETS — each an independent bold, gapped pass of the
  // turbulent eddies + bright cloud ribbons (paint on paint), own rng per sheet.
  const skySheets = SKY_SHEETS.map((e, k) => {
    const srng = mulberry32(seed + 1009 * (k + 1));
    const sh = [];
    strokes(sh, { n: 0 }, {
      rng: srng, n: e.n,
      // ⚠ the SHEETS drift; the opaque sky ground underneath never moves, or its edge would
      // swing into frame. Sampling wider than the plate so the orbit can never pull a gap in.
      sample: (function () { const base = rej(-24, -24, 824, horizon + 20); return r => { const q = base(r); return q ? [q[0] + OX, q[1] + OY] : null; }; })(),
      dir: skyDir,
      col: (x, y, r) => {
        const near = nearSK(x, y);
        if (near < 1.1 && r() < 0.06) return jig(r() < 0.5 ? '#fffdf6' : '#f79ac6', r, 12);   // joy sparks at the knots
        const k2 = fbm(x / 88, y / 88, 139) + (r() - 0.5) * 0.2;
        if (k2 > 0.78) return jig('#fffdf6', r, 8);   // bright cloud-ribbon crests
        return skyCol(x, y, r, e.lift);
      },
      len: (x, y) => e.len * lengthOf(x, y, 21 + k), lw: (x, y) => e.lw * widthOf(x, y, 27 + k),
      steps: 5, follow: 0.9, wild: 0.12, lenJ: 0.3, wJ: 0.3, impasto: 0.62, relief: 0.4,
      aJ: (x, y) => 0.16 + Math.max(0, 1.3 - nearSK(x, y)) * 0.42,
    });
    return sh.join('\n');
  });

  // road: pale diagonal receding to a VANISHING POINT at the horizon (the far end
  // must taper to nothing AND reach the tree-line, or the road reads as an unfinished
  // stub ending in open field). far end lifted onto the ridge (~202) + width tapers
  // to ~1px there so it melts into the distance toward home.
  const far = [656, 202], near = [104, 504];
  const roadP = t => [far[0] + (near[0] - far[0]) * t + Math.sin(t * 5.5) * 9 * t, far[1] + (near[1] - far[1]) * t];
  const roadW = t => 1.2 + 82 * t * t + 14 * t;
  const roadInfo = (x, y) => { // returns {t,d} for nearest road point
    let bt = 0, bd = 1e9;
    for (let t = 0; t <= 1.001; t += 0.04) { const p = roadP(t); const d = Math.hypot(x - p[0], y - p[1]); if (d < bd) { bd = d; bt = t; } }
    return { t: bt, d: bd };
  };
  const onRoad = (x, y) => { const { t, d } = roadInfo(x, y); return d < roadW(t) / 2; };

  // the field's top is a ROLLING CONTOUR, never a straight line: a gentle hill
  // edge that the sky shows above. (The far plane's distant hills sit behind it,
  // so the horizon is two overlapping undulating lines that shift as you pan.)
  const fieldTop = ridge(horizon, { amp: 22, freq: 150, bumps: 0.35, seed: 131 });
  // underpaint: solid GREEN field with the rolling top — gaps read lush, not bare
  // The ground's top edge is where it meets the sky — grass has no outline, it
  // has blades. This jagged contour replaces fieldTop in the FILL only (sampled fine
  // enough to keep the sawtooth; a coarse step averages it straight again).
  const fieldTopJag = x => {
    const fine = (fbm(x / 3.1, 2.1, 739) - 0.5) * 6.5;
    const tuft = Math.max(0, fbm(x / 8.5, 9.4, 741) - 0.52) * 24;
    return fieldTop(x) + fine - tuft;
  };
  {
    let d = `M-2 ${R1(fieldTopJag(-2))}`;
    for (let x = -2; x <= 802; x += 2.2) d += `L${R1(x)} ${R1(fieldTopJag(x))}`;
    d += `L802 ${H + 2}L-2 ${H + 2}Z`;
    out.push(`<path d="${d}" fill="#477e38"/>`); counter.n++;
  }
  // underpaint: the pale road
  {
    let L2 = [], R2 = [];
    for (let t = 0; t <= 1.001; t += 0.1) {
      const p = roadP(t), q = roadP(Math.min(1, t + 0.04));
      let nx = -(q[1] - p[1]), ny = q[0] - p[0];
      const nl = Math.hypot(nx, ny) || 1; nx /= nl; ny /= nl;
      const hw = roadW(t) / 2;
      L2.push([p[0] + nx * hw, p[1] + ny * hw]); R2.push([p[0] - nx * hw, p[1] - ny * hw]);
    }
    let d = `M${R1(L2[0][0])} ${R1(L2[0][1])}`;
    for (let i = 1; i < L2.length; i++) d += `L${R1(L2[i][0])} ${R1(L2[i][1])}`;
    for (let i = R2.length - 1; i >= 0; i--) d += `L${R1(R2[i][0])} ${R1(R2[i][1])}`;
    out.push(`<path d="${d}Z" fill="#d4bd8c"/>`);
    counter.n++;
  }

  // THE FATHER IS THE LIGHT — he runs radiant, and his light POURS across the field:
  // the grass warms to gold where he is and sinks to deep, rich, cool green in the far
  // distance and the corners. ONE honest light (near-warm → far-cool) so the lit field
  // SINGS against the deeper surround (Rev 21:23, "the glory of God did lighten it").
  const father = roadP(0.62);
  const gL = lightRadial(father[0], father[1] - 34, 250);
  setReliefLight({ x: father[0], y: father[1] - 34 });   // every mark's form-shadow points away from the Father's light

  // wheat: churning gold, waves mostly horizontal, dense texture
  // ══ THE GROUND, REBUILT AS GROUND ══════════════════════════════════════════════════
  // Fred: "rebuild ran's ground properly, structure first." The old field was three flat
  // passes — a near band, a far band, and a fringe to hide the join — all at one value, so
  // however well the colour was tuned it stayed a green SHAPE. A ground reads as ground when
  // it has these five things, and none of them are colour:
  //
  //   1 · THE LAND ROLLS. A low-frequency swell, and the value follows which way each slope
  //       FACES the light — that alone turns a shape into a surface.
  //   2 · IT RECEDES BY PERSPECTIVE. The crop lies in drifts that converge on a vanishing
  //       point beside the home, so the field's own brushwork carries the depth.
  //   3 · IT HAS AIR OVER IT. Near the horizon everything pales and cools toward the sky.
  //       That is what kills the hard band — not a fringe pass hiding a seam, but the far
  //       field genuinely dissolving into distance.
  //   4 · ITS MARKS SHRINK WITH DISTANCE (dS), so scale reads even where value does not.
  //   5 · THE FOREGROUND DROPS OUT OF THE LIGHT, framing the picture and pushing the
  //       Father back into it.
  const VPX = 648, VPY = horizon - 4;                       // the drifts run toward the home
  const swell = (x, y) => fbm(x / 190, y / 84, 313);        // the roll of the land
  const facing = (x, y) => {                                // which way that roll turns to the light
    const e = 7;
    return (swell(x - e, y) - swell(x + e, y)) * 2.4 + (swell(x, y - e) - swell(x, y + e)) * 1.3;
  };
  const air = (x, y) => Math.max(0, Math.min(1, 1 - (y - horizon) / 96));   // distance haze
  const drift = (x, y) => Math.atan2((VPY - y) * 0.32, (VPX - x));          // the lie of the crop
  const groundVal = (x, y) => {
    const depth = Math.max(0, Math.min(1, (y - horizon) / (H - horizon)));
    let v = 0.2 + depth * 0.4 + gL(x, y) * 0.5 + facing(x, y) * 0.55 + swell(x, y) * 0.2;
    v -= Math.max(0, (y - 442) / 88) * 0.34;                // the nearest ground leaves the light
    return Math.max(0, Math.min(1, v));
  };
  const groundCol = (x, y, r, k) => {
    let c = ramp(WHEAT, groundVal(x, y) + (r() - 0.5) * (k || 0.16));
    const s = 1 - gL(x, y);                                  // broken colour in the shade
    if (s > 0.35 && r() < 0.2 + s * 0.34) c = mix(c, chroma('#3f6048', x, y, 0.5, 197), 0.24 + s * 0.34);
    c = mix(c, '#fff6c8', gL(x, y) * 0.5);                   // and gold pools where He runs
    c = mix(c, '#cfe6f2', air(x, y) * 0.62);                 // the air over the far field
    return jig(chroma(c, x, y, 0.3, 211), r, 12);
  };
  strokes(out, counter, {                                    // the body of the field, lying in its drifts
    rng, n: 2600,
    sample: rej(-10, horizon - 30, 810, 510, (x, y) => y > fieldTop(x) - 26 && !onRoad(x, y)),
    dir: (x, y) => drift(x, y) + (fbm(x / 70, y / 46, 317) - 0.5) * 0.5,
    col: (x, y, r) => groundCol(x, y, r, 0.16),
    len: (x, y) => 20 * dS(y) * lengthOf(x, y, 31), lw: (x, y) => 3.4 * dS(y) * widthOf(x, y, 33), steps: 3,
    follow: 0.97, lenJ: 0.3, wJ: 0.3, wild: 0.08, impasto: 0.8, relief: 0.35,   // ⚠ relief was the default 1 — embossed dabs
  });
  strokes(out, counter, {                                    // a finer weave over it, same drift
    rng, n: 2200,
    sample: rej(-10, horizon - 30, 810, 510, (x, y) => y > fieldTop(x) - 26 && !onRoad(x, y)),
    dir: (x, y) => drift(x, y) + (fbm(x / 34, y / 24, 319) - 0.5) * 0.9,
    col: (x, y, r) => groundCol(x, y, r, 0.26),
    len: (x, y) => 9 * dS(y) * lengthOf(x, y, 41), lw: (x, y) => 1.8 * dS(y) * widthOf(x, y, 43), steps: 2,
    follow: 0.94, lenJ: 0.3, wJ: 0.3, impasto: 0.8, relief: 0.3, op: 0.7,
  });
  // ══ THE FOREGROUND APRON — `risen`'s ground, brought forward ════════════════════════
  // Fred drew the line himself: below it, the earth of the risen page; above it, the grass
  // it already has; and the two BLENDED so the rest of the plate need not change. That is
  // the right instinct — the near ground is where a reader stands, and it is the one place
  // this field could carry warm open earth without contradicting the wheat behind it.
  //
  // The blend is what makes it work, so it is done three ways at once: the earth thins out
  // as it climbs (density), the grass thins as it descends (density), and where they meet
  // the green grows straight out of the warm ground rather than lying beside it. No edge
  // anywhere — the two grounds interleave over about 70 units.
  const EARTH = ['#6d5a80', '#8f7086', '#b98d84', '#dcb189', '#f2d49b'];   // ← risen.mjs, verbatim
  const apron = (x, y) => {
    const b = 206 + 0.29 * x + Math.sin(x / 88) * 15 + Math.sin(x / 31 + 2) * 5;
    return Math.max(0, Math.min(1, (y - b) / 74));          // 0 above Fred's line, 1 well below it
  };
  strokes(out, counter, {                                    // the warm earth itself
    rng, n: 2400,
    sample: r => {
      for (let k = 0; k < 6; k++) {
        const x = -10 + r() * 820, y = horizon + r() * (512 - horizon);
        if (onRoad(x, y)) continue;
        const a = apron(x, y);
        if (a <= 0 || r() > Math.pow(a, 0.75)) continue;     // thins out as it climbs
        // ⚠ AND IT KEEPS BACK FROM THE ROAD. The warm earth came out so close in value to
        // the path that the path vanished into it — and the road IS the story here (you
        // walk toward Him). A grass verge either side keeps its edge, which is also just
        // what a field track looks like.
        const ri = roadInfo(x, y), edge = ri.d - roadW(ri.t) / 2;
        if (edge < 34 * dS(y) && r() < 1 - edge / (34 * dS(y))) continue;
        return [x, y];
      }
      return null;
    },
    dir: (x, y) => drift(x, y) * 0.35 + (fbm(x / 60, y / 40, 331) - 0.5) * 0.5,
    col: (x, y, r) => {
      const near = Math.max(0, Math.min(1, (y - horizon) / (H - horizon)));
      let c = ramp(EARTH, Math.min(1, gL(x, y) * 0.5 + 0.12 + near * 0.5 + fbm(x / 80, y / 26, 99) * 0.2
                                      + facing(x, y) * 0.4 + (r() - 0.5) * 0.14));
      return jig(chroma(c, x, y, 0.34, 251), r, 11);
    },
    len: (x, y) => 15 * dS(y) * lengthOf(x, y, 51), lw: (x, y) => 3.0 * dS(y) * widthOf(x, y, 53), steps: 3,
    follow: 0.96, lenJ: 0.3, wJ: 0.3, impasto: 0.8, relief: 0.35,
  });
  strokes(out, counter, {                                    // green growing OUT of the warm ground
    rng, n: 1700,
    sample: r => {
      for (let k = 0; k < 6; k++) {
        const x = -10 + r() * 820, y = horizon + 20 + r() * (512 - horizon - 20);
        if (onRoad(x, y)) continue;
        const a = apron(x, y);
        if (a <= 0 || r() > (1 - a * 0.72)) continue;        // and the grass thins as it descends
        return [x, y];
      }
      return null;
    },
    dir: (x, y) => -Math.PI / 2 + (fbm(x / 14, y / 11, 337) - 0.5) * 0.9,
    col: (x, y, r) => jig(mix(mix('#4e7a3c', '#9dc262', r() * 0.9), '#fff0b0', gL(x, y) * 0.35), r, 7),   // ← risen.mjs's tufts
    len: (x, y) => 9 * dS(y) * lengthOf(x, y, 61), lw: (x, y) => 1.5 * dS(y) * widthOf(x, y, 63), steps: 2, lenJ: 0.3, wJ: 0.3, impasto: 0.78, relief: 0.3, op: 0.9,
  });
  for (let i = 0; i < 46; i++) {                             // and the risen page's own flowers
    const fx = -10 + rng() * 820;
    const fy = horizon + 40 + Math.pow(rng(), 0.55) * (508 - horizon - 40);
    if (onRoad(fx, fy) || apron(fx, fy) < 0.45) continue;
    const sc = dS(fy), st = (9 + rng() * 10) * sc;
    paintPath(out, counter, rng, [[fx, fy], [fx + (rng() - 0.5) * 5, fy - st]],
      (x, y, r) => jig(mix('#4e7a3c', '#8fb85c', r()), r, 7), { lw: 1.5 * sc, len: 3, density: 0.85, jitter: 0.3 });
    const pet = ['#ffd9e6', '#fff0f4', '#ffe7a8', '#f6c0d6'][(rng() * 4) | 0];
    for (let k = 0; k < 5; k++) {
      const a2 = k * 1.256 + rng() * 0.4, px = fx + Math.cos(a2) * 2.6 * sc, py = fy - st + Math.sin(a2) * 2.6 * sc;
      out.push(`<ellipse cx="${R1(px)}" cy="${R1(py)}" rx="${R1(2.3 * sc)}" ry="${R1(1.7 * sc)}" transform="rotate(${R1(a2 * 57)} ${R1(px)} ${R1(py)})" fill="${pet}" opacity="0.92"/>`);
      counter.n++;
    }
    out.push(`<circle cx="${R1(fx)}" cy="${R1(fy - st)}" r="${R1(1.4 * sc)}" fill="#ffe9a8"/>`); counter.n++;
  }
  strokes(out, counter, {                                    // and the crop STANDING UP out of it
    rng, n: 1500,
    sample: rej(-10, horizon + 6, 810, 510, (x, y) => y > fieldTop(x) && !onRoad(x, y)),
    dir: (x, y) => -Math.PI / 2 + (fbm(x / 16, y / 12, 323) - 0.5) * 0.85,
    col: (x, y, r) => {
      const v = Math.min(1, groundVal(x, y) + 0.22 + r() * 0.2);
      return jig(chroma(mix(ramp(WHEAT, v), '#fff0b0', gL(x, y) * 0.45), x, y, 0.28, 211), r, 11);
    },
    len: (x, y) => 8 * dS(y) * lengthOf(x, y, 71), lw: (x, y) => 1.4 * dS(y) * widthOf(x, y, 73), steps: 2, lenJ: 0.3, wJ: 0.3, impasto: 0.75, relief: 0.3, op: 0.85,
  });

  strokes(out, counter, {
    rng, n: 250,
    sample: rej(-6, horizon + 10, 812, 508, (x, y) => !onRoad(x, y) && gL(x, y) > 0.05),   // fewer, and only where there's light to catch them — the paint breathes
    dir: () => -Math.PI / 2,
    col: (x, y, r) => { const k = r(); const base = k < 0.3 ? '#ffd9e6' : k < 0.55 ? '#ffe7a8' : k < 0.78 ? '#fff0f4' : '#f6c0d6'; return jig(mix(base, '#fff6d8', gL(x, y) * 0.3), r, 13); },   // the same four petals `risen` opens with
    len: (x, y) => 3 + (y - horizon) / (510 - horizon) * 4, lw: (x, y) => 2.2 + (y - horizon) / (510 - horizon) * 1.8, steps: 1, lenJ: 0.5, impasto: 0.3,
  });

  // road strokes: along the road direction
  strokes(out, counter, {
    rng, n: 560,
    sample: rej(60, horizon, 720, 510, onRoad),
    dir: (x, y) => { const { t } = roadInfo(x, y); const a = roadP(Math.max(0, t - 0.03)), b = roadP(Math.min(1, t + 0.03)); return Math.atan2(b[1] - a[1], b[0] - a[0]); },
    col: (x, y, r) => { const { t, d } = roadInfo(x, y); return jig(ramp(['#f2e3bd', '#e2cfa0', '#c9b282'], d / (roadW(t) / 2) * 0.7 + fbm(x / 50, y / 50, 191) * 0.4), r, 9); },
    len: (x, y) => 16 * dS(y) * lengthOf(x, y, 81), lw: (x, y) => 2.6 * dS(y) * widthOf(x, y, 83), steps: 3, lenJ: 0.3, wJ: 0.3, relief: 0.3,
  });

  // THE ROAD, WORN — ruts, a lit crown between them, loose grit, and a verge
  // that breaks into the grass instead of ending at a clean edge.
  dirtRoad(out, counter, rng, {
    ptFn: roadP, wFn: roadW,
    cols: ['#a98a58', '#cfae76', '#f0e0ae'],
    lightFn: gL, ruts: 0.34, stones: 150, verge: 250, seed: 829,
  });
  // dark wheat strokes lining the road edges, leaning over it
  strokes(out, counter, {
    rng, n: 260,
    sample: r => { const t = r(); const p = roadP(t); const q = roadP(Math.min(1, t + 0.04)); let nx = -(q[1] - p[1]), ny = q[0] - p[0]; const nl = Math.hypot(nx, ny) || 1; nx /= nl; ny /= nl; const side = r() < 0.5 ? 1 : -1; const off = roadW(t) / 2 + r() * 6 - 2; return [p[0] + nx * off * side, p[1] + ny * off * side]; },
    dir: (x, y) => { const { t } = roadInfo(x, y); const a = roadP(Math.max(0, t - 0.03)), b = roadP(Math.min(1, t + 0.03)); return Math.atan2(b[1] - a[1], b[0] - a[0]) + 0.5; },
    col: (x, y, r) => jig(mix('#8a6526', '#6b4e1d', r()), r, 10),
    len: 10, lw: 2.6, steps: 2,
  });

  // egg: a few wheat stalks beside the road bending into the shape of a tiny crown
  {
    const kx = 472, ky = 362;
    const kCol = (x, y, r) => jig(mix('#6b4e1d', '#8a6526', r() * 0.7), r, 8);
    // two short stalks bending in to hold it up
    paintPath(out, counter, rng, [[kx - 9, ky + 22], [kx - 6, ky + 13], [kx - 5, ky + 7]], kCol, { lw: 1.4, len: 3.5, density: 0.45 });
    paintPath(out, counter, rng, [[kx + 9, ky + 23], [kx + 6, ky + 14], [kx + 5, ky + 7]], kCol, { lw: 1.4, len: 3.5, density: 0.45 });
    // the crown itself: a base band and three peaks, one bent zigzag of wheat
    paintPath(out, counter, rng, [[kx - 11, ky + 6], [kx + 11, ky + 6]], kCol, { lw: 2, len: 3.5, density: 0.8, jitter: 0.6 });
    paintPath(out, counter, rng,
      [[kx - 11, ky + 5], [kx - 7.5, ky - 6], [kx - 4, ky + 3], [kx, ky - 8], [kx + 4, ky + 3], [kx + 7.5, ky - 6], [kx + 11, ky + 5]],
      kCol, { lw: 1.7, len: 3, density: 0.8, jitter: 0.5 });
    // grain heads at the three tips
    for (const [tx2, ty2] of [[-7.5, -7], [0, -9], [7.5, -7]]) {
      paintPath(out, counter, rng, [[kx + tx2 - 2, ky + ty2], [kx + tx2 + 2, ky + ty2 - 1.5]], kCol, { lw: 2.2, len: 2.5, density: 0.9, jitter: 0.4 });
    }
  }

  // the far house — FILLED WITH LIGHT, all good things, like the Father (Rev 21:23:
  // "the city had no need of the sun... for the glory of God did lighten it")  [FAR plane]
  const _farHouse = out.length;
  const hs = { x: 672, y: 214 };   // sits on the (now lower) horizon, bigger + clearer
  // a great glory of light all around the home first
  strokes(out, counter, {
    rng, n: 300,
    sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 0.9) * 104; return [hs.x + Math.cos(a) * d, hs.y - 20 + Math.sin(a) * d * 0.85]; },
    dir: (x, y) => Math.atan2(y - (hs.y - 20), x - hs.x),
    col: (x, y, r) => jig(ramp([GOLD_HOT, GOLD_PALE, GOLD, GOLD_DEEP, '#caa44e'], Math.hypot(x - hs.x, (y - hs.y + 20) / 0.85) / 104), r, 8),
    len: 10, lw: 2.1, steps: 2, impasto: 0.4,
  });
  // BOLD RAYS beaming out + a gilded glory-halo + legible gold SPARKS — the same
  // radiant Father's house glimpsed across the field; it RADIATES (Rev 21:23).
  strokes(out, counter, {
    rng, n: 56,
    sample: r => { const a = r() * Math.PI * 2, d = 18 + r() * 44; return [hs.x + Math.cos(a) * d, hs.y - 18 + Math.sin(a) * d * 0.85]; },
    dir: (x, y) => Math.atan2(y - (hs.y - 18), x - hs.x),
    col: (x, y, r) => jig(mix(GOLD_HOT, GOLD_PALE, r() * 0.5), r, 6),
    len: (x, y) => 16 + Math.hypot(x - hs.x, y - hs.y + 18) * 0.4, lw: 1.4, steps: 2, lenJ: 0.6,
  });
  klimtGold(out, counter, rng, hs.x, hs.y - 16, 46, 104, { rings: 6, opacity: 0.58, squash: 0.82 });
  goldSparks(out, counter, rng, hs.x, hs.y - 16, 30, 150, 96, { squash: 0.85, big: 1.05 });
  // ⚠ A CITY THAT SHINES IS NOT A CITY WITH A GLOW BEHIND IT. Three things make light read as
  // coming OUT of a place: a broad soft glory that reaches past its own walls, long rays that
  // leave and thin to nothing, and the air near it warmed. Rev 21:23 — it has no need of the
  // sun, for the glory of God did lighten it.
  strokes(out, counter, {                                  // the broad glory, well past the walls
    rng, n: 420,
    sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 0.55) * 190;
                   return [hs.x + Math.cos(a) * d, hs.y - 24 + Math.sin(a) * d * 0.7]; },
    dir: (x, y) => Math.atan2(y - (hs.y - 24), x - hs.x) + Math.PI / 2,
    col: (x, y, r) => {
      const d = Math.min(1, Math.hypot(x - hs.x, (y - hs.y + 24) / 0.7) / 190);
      return jig(ramp(['#fff8dc', GOLD_PALE, GOLD, '#b98f3e'], Math.pow(d, 0.7)), r, 8);
    },
    len: 26, lw: 7, steps: 2, lenJ: 0.7, impasto: 0.45, op: 0.16,
  });
  for (let k = 0; k < 26; k++) {                           // rays that leave, and thin away
    const a = (k / 26) * Math.PI * 2 + fbm(k * 1.7, 2.2, 811) * 0.22;
    const L = 120 + fbm(k * 2.3, 5.1, 813) * 210;
    strokes(out, counter, {
      rng, n: 16,
      sample: r => { const t = 0.18 + r() * 0.82;
                     return [hs.x + Math.cos(a) * L * t + (r() - 0.5) * 9 * t,
                             hs.y - 20 + Math.sin(a) * L * 0.72 * t + (r() - 0.5) * 7 * t]; },
      dir: () => a,
      col: (x, y, r) => mix('#fff6d2', '#d8ab52', Math.min(1, Math.hypot(x - hs.x, y - hs.y + 20) / (L * 0.9) + r() * 0.25)),
      len: 22, lw: 3.4, steps: 2, lenJ: 0.7, op: 0.2,
    });
  }
  // the Father's house is the PALACE OF GOD (Rev 21) — the SAME New Jerusalem the
  // whole way leads home to, glimpsed small across the field. One consistent Home,
  // painted by the shared engine so ran + gift + come show the very same City.
  E.paintPalace(out, counter, rng, hs.x, hs.y + 2, 0.42, { gate: true });
  cityRanges.push([_farHouse, out.length]);   // ← the kingdom rides its OWN plane, and shines
  // ...and a long warm thread cast down the road toward the walker — brighter than the dust it lies on
  strokes(out, counter, {
    rng, n: 90,
    sample: r => { const t = Math.pow(r(), 1.6) * 0.8; const p = roadP(t); return [p[0] + (r() + r() - 1) * roadW(t) * 0.16, p[1] + (r() - 0.5) * 3]; },
    dir: (x, y) => { const { t } = roadInfo(x, y); const a = roadP(Math.max(0, t - 0.03)), b = roadP(Math.min(1, t + 0.03)); return Math.atan2(b[1] - a[1], b[0] - a[0]); },
    col: (x, y, r) => { const { t } = roadInfo(x, y); return jig(ramp(['#fff3cd', '#ffe9a0', GOLD], t * 1.05 + (r() - 0.5) * 0.25), r, 7); },
    len: 14, lw: 1.7, steps: 3, lenJ: 0.6, wJ: 0.45,
  });

  // FATHER: past halfway, mid-stride, leaning hard toward the child  [NEAR plane]
  const _nearFather = out.length;
  const fp = father; // ~ (315, 392) — reuse the light-pool centre so the figure + his glow agree
  const lean = Math.atan2(near[1] - far[1], near[0] - far[0]); // direction of running
  const fScale = 1.6;   // bigger — he is the heart of the page
  const fx = fp[0], fy = fp[1] - 2;
  // running with ARMS FLUNG WIDE OPEN — the one gesture that says "the Father".
  // an ARTICULATED human (personCaps): head-top high, big forward lean, both
  // arms flung out wide toward the child, legs in a big running stride.
  const fH = 92;                         // full height head-top→feet
  const fTopY = fy - 82;                 // top of head
  // ⚠ HOW YOU MAKE HIM RUN: DRAW HIM RUNNING, TWICE. Fred asked how the light figure reads
  // as running TOWARD the child, and the answer is not a filter or a wobble — it is the
  // oldest trick there is, two drawings of a run cycle cut hard between. Frame 0 is the
  // REACH: front leg thrown far ahead, back leg kicked up behind, both arms flung wide.
  // Frame 3 (the drawing the runtime pings) is the PASS: legs gathered under him, back knee
  // driven up, arms swung through, and the whole body lifted 5 units — because a runner
  // leaves the ground. Cut between those at ~3 a second and the eye reads RUNNING; ease
  // between them instead and it reads as a ghost, which is why this page cuts hard.
  //
  // He does not travel across the plate. He does not need to: he is already close, the road
  // behind him says where he came from, and a figure that slid toward the child would leave
  // his own pool of light standing where he had been.
  const RUN = (globalThis.__FRAME || 0) === 3 ? 1 : 0;
  const bob = RUN ? -5 : 0;                               // the flight moment of the stride
  const fCaps = personCaps(fx, fTopY + bob, fH, RUN ? {
    lean: -23,                                            // deeper pitch at the drive
    headTilt: -7,
    leftHand: [fx - 40, fy - 72],                        // arms swung THROUGH the wide reach
    rightHand: [fx + 30, fy - 34],
    leftFoot: [fx - 10, fy + 2],                         // gathered under him...
    rightFoot: [fx + 18, fy - 30],                       // ...back knee driven high
  } : {
    lean: -18,                                            // torso pitched forward (toward the child, down-road = left)
    headTilt: -5,
    leftHand: [fx - 52, fy - 56],                        // front arm flung WIDE toward the child (the embrace)
    rightHand: [fx + 40, fy - 50],                       // back arm flung WIDE — open
    leftFoot: [fx - 34, fy + 6],                         // front leg striding far ahead
    rightFoot: [fx + 36, fy - 6],                        // back leg kicked up behind
  });
  // THE FATHER IS THE LIGHT — he does not run as a dark shape but RADIANT:
  // a soft, TIGHTER halo of light around him (paintLight adds its own aura + rays,
  // so keep this modest — a big halo here erased his FORM into a white splat)
  const hc = fy - 26 * fScale;
  strokes(out, counter, {
    rng, n: 96,
    sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 0.9) * 34 * fScale; return [fx + Math.cos(a) * d, hc + Math.sin(a) * d * 0.92]; },
    dir: () => lean,
    col: (x, y, r) => jig(ramp([GOLD_PALE, GOLD, GOLD_DEEP, '#9a6e34'], Math.hypot(x - fx, (y - hc) / 0.92) / (34 * fScale)), r, 9),
    len: 8, lw: 2.4, steps: 2, impasto: 0.4,
  });
  // his body: luminous golden-white, the brightest thing in the field — warmth,
  // not a silhouette; the open arms read as welcome, not threat
  // THE WORD MADE FLESH (John 1:14) — the Father wears the child's human form, but
  // RADIANT: brilliant white woven with yellow, glowing. ONE consistent Light.
  castShadow(out, counter, fCaps, { dir: 0.5 });
  paintLight(out, counter, rng, fCaps);   // (paintLight now emits the rays of light consistently)
  // RE-ASSERT THE FORM: overlay the limbs in translucent GOLD (gold holds form;
  // pure white blooms shapeless), so the flung-WIDE arms + running stride read as
  // a Father running, not a starburst — the white-hot core still shows through
  paintFigure(out, counter, rng, fCaps, (x, y, r) => jig(mix('#ffe888', '#e2a838', r() * 0.55), r, 7), 1.15, 1, 1, 0.5);
  // a hot defining edge along the tops of the flung-open arms so the gesture reads
  for (const [ax, ay, bx, by] of (RUN
      ? [[fx, fy - 70, fx - 40, fy - 72], [fx, fy - 40, fx + 30, fy - 34]]
      : [[fx, fy - 56, fx - 52, fy - 56], [fx, fy - 54, fx + 40, fy - 50]])) {
    paintPath(out, counter, rng, [[ax, ay], [bx, by]], (x, y, r) => jig(mix('#fffef2', GOLD_PALE, r() * 0.5), r, 5), { lw: 2.2, len: 5, density: 0.6, jitter: 1.0 });
  }
  // robe flying behind (up-road, toward the house)
  strokes(out, counter, {
    rng, n: 70,
    sample: r => [fx + 12 + r() * 30, fy - 26 + (r() - 0.3) * 24],
    dir: (x, y) => lean + Math.PI + (fbm(x / 20, y / 20, 215) - 0.5) * 0.9,
    col: (x, y, r) => jig(ramp(['#8a4e1c', '#6b3a14', '#4a2810'], (x - fx - 10) / 44), r, 11),
    len: 13, lw: 2.8, steps: 2, lenJ: 0.5,
  });
  // dust kicked up behind his feet — bold, rising, torn by the run
  strokes(out, counter, {
    rng, n: 270,
    sample: r => { const t = Math.pow(r(), 1.4); return [fx + 4 + t * 88 + (r() - 0.5) * 10, fy - 1 - t * 16 + (r() - 0.4) * (10 + t * 22)]; },
    dir: (x, y) => lean + Math.PI - 0.25 - (x - fx) * 0.004 + (fbm(x / 14, y / 14, 219) - 0.5) * 1.4,
    col: (x, y, r) => { const d = (x - fx) / 90; return jig(ramp(['#f7eed6', '#ecdfc0', '#d4bd92', '#bda57a'], d + (r() - 0.5) * 0.3), r, 11); },
    len: 14, lw: 2.9, steps: 2, wild: 0.16, lenJ: 0.65, aJ: 0.55,
  });
  // (the little gold ring on his hand was removed — it read as an odd floating disc)
  nearRanges.push([_nearFather, out.length]);   // ← the running Father leads (NEAR plane)

  /* ---------------- FAR plane — the receding horizon (distant hills, cypress, birds) ----------------
     DISTANT HILLS: a hazy rolling-land silhouette behind the field. Its undulating
     skyline IS the sky↔ground boundary (never a ruled line), and on its own depth
     plane it slides against the sky as you pan — an overlapping, moving horizon. */
  const _far = out.length;
  const hillTop = ridge(horizon - 4, { amp: 34, freq: 205, bumps: 0.55, seed: 137 });
  // ⚠ THE FLAT BAND WAS THIS, NOT THE FIELD. `distantHills` ran 74 units DEEP and is painted
  // AFTER the ground, so it laid a smooth slab of three flat greens straight over the top of
  // it — which is why rebuilding the field changed nothing in that band. Distant hills belong
  // AT the horizon: shallow, hazed toward the sky, and finished before the land begins.
  distantHills(out, counter, rng, { topFn: hillTop, horizonFn: () => horizon, cols: ['#9fc0bc', '#a8c6ae', '#b8cfa6'], depth: 22, seed: 137 });
  const cyp = (cx, cby, ch, w) => strokes(out, counter, { rng, n: Math.round(w * ch / 12), sample: r => { const v = Math.pow(r(), 0.85); const wr = w * Math.sin(Math.PI * Math.min(1, v * 1.15)) + 0.7; return [cx + (r() + r() - 1) * wr, cby - v * ch]; }, dir: (x, y) => -Math.PI / 2 + (fbm(x / 8, y / 8, 247) - 0.5) * 0.6, col: (x, y, r) => jig(ramp(['#26283a', '#34364e', '#42445e'], fbm(x / 10, y / 10, 251) + r() * 0.3), r, 7), len: 9, lw: 2.2, steps: 3, follow: 0.95, lenJ: 0.5 });
  cyp(108, 234, 42, 6); cyp(728, 246, 46, 7);
  farRanges.push([_far, out.length]);   // ← distant hills + cypress (FAR plane, with the house)
  // the BIRDS — their own plane, drifting in the open air between the hills and
  // the field, so they parallax on their own as the view turns (Matt 6:26)
  const _birds = out.length;
  for (const [bx, by, s] of [[180, 60, 1], [214, 74, 0.85], [250, 56, 0.9], [292, 70, 0.78], [330, 50, 0.7], [560, 80, 0.85], [598, 66, 0.75], [636, 86, 0.7], [120, 88, 0.8], [700, 72, 0.62]]) {
    paintPath(out, counter, rng, [[bx - 6 * s, by + 2.6 * s], [bx, by - 1.8 * s], [bx + 6 * s, by + 2.6 * s]], (x, y, r) => jig('#36405a', r, 6), { lw: 1.5 * s, len: 3.4, density: 0.9, jitter: 0.5 });
  }
  birdRanges.push([_birds, out.length]);   // ← the birds drift in their own air

  /* ---------------- MID plane — the field's own life, PLANTED in the field ----------------
     the fringe and ALL the fruit-trees ride the MID plane with the field, rising
     from its rolling edge, so they move WITH the ground they grow in (planted, not
     floating) while the whole field parallaxes against the far hills and the sky. */
  // the HORIZON FRINGE — ragged grass tufts rising off the field's rolling top
  // grass tufts breaking the seam — but SKIP the column under the Father's house
  // (x≈644..712) so the home (the destination) is never hidden behind the grass.
  horizonFringe(out, counter, rng, { horizonFn: fieldTop, x0: -10, x1: 628, cols: ['#2c6a48', '#3a7a38', '#5e9a40', '#88b84a'], hMax: 22 });
  horizonFringe(out, counter, rng, { horizonFn: fieldTop, x0: 718, x1: 810, cols: ['#2c6a48', '#3a7a38', '#5e9a40', '#88b84a'], hMax: 22, seed: 521 });
  // ══ THE FAR WOOD ═══════════════════════════════════════════════════════════════════
  // ⚠ FIRST ATTEMPT WAS A ROW OF LOLLIPOPS. Evenly-spaced columns of same-sized trees along a
  // gentle ridge gave a ruler-straight hedge of identical cutouts standing on a flat band —
  // the machine-look in its purest form. A wood is not a line of trees, it is a MASS with
  // trees emerging from it: so the band is painted first as continuous canopy whose depth
  // wanders with the land, and the individual trees rise OUT of that mass in clumps, at
  // scattered heights, overlapping. Nothing lines up and nothing stands alone.
  // The page's own rule: THE HOME IS NEVER HIDDEN — no tree in front of the Father's door,
  // none in the road he runs down. The whole picture is a father running to meet his son.
  const WOOD_N = +(process.env.WOOD_N || 1);
  const wRng = mulberry32(seed ^ 0x2f5c11a3);
  const clearHome = (x) => x > 600 && x < 742;
  // ⚠ DEEP ENOUGH TO BE A COUNTRY. At 9-30 units the wood came out a thin dark stripe laid
  // across the pale distance band — a hedge, not a horizon. It has to have real depth, and to
  // dip BELOW the field's edge here and there so the wheat interlocks with it in bays.
  const woodH = (x) => 20 + 36 * fbm(x / 118, 9.1, 401) + 9 * Math.sin(x / 63);
  const woodCol = (x, y, top, r) => {
    const up = Math.max(0, Math.min(1, (top - y) / 26));          // 1 at the canopy crown
    let c = ramp(['#1d4227', '#2a5a2f', '#3d7538', '#579142', '#7cae4c'],
      up * 0.72 + fbm(x / 8, y / 7, 313) * 0.22 + gL(x, y) * 0.18 + 0.08);
    c = mix(c, '#f2e8b8', Math.pow(up, 2.1) * 0.3);               // the sun is above
    c = mix(c, '#cfdcd2', air(x, y) * 0.36);                      // distance only softens it
    return jig(c, r, 8);
  };
  // 1 · the mass — a continuous woodland edge, deep where the land falls away
  strokes(out, counter, {
    rng: wRng, n: Math.round(3400 * WOOD_N),
    sample: r => {
      const x = -30 + r() * 880;
      if (clearHome(x)) return null;
      const y = fieldTop(x) + 7 - Math.pow(r(), 0.72) * woodH(x);
      return onRoad(x, y) ? null : [x, y];
    },
    dir: (x, y) => -Math.PI / 2 + (fbm(x / 9, y / 8, 317) - 0.5) * 2.2,
    col: (x, y, r) => woodCol(x, y, fieldTop(x) - woodH(x), r),
    len: 3, lw: 1.7, steps: 2, lenJ: 0.8, impasto: 0.5, op: 0.95,
  });
  // 2 · the trees that rise out of it, in clumps, no two the same size
  const NC = Math.max(5, Math.round(11 * WOOD_N));
  for (let c = 0; c < NC; c++) {
    const cx0 = -30 + (c + 0.08 + wRng() * 0.84) / NC * 880;
    const inClump = 1 + Math.round(wRng() * 3.2);
    for (let k = 0; k < inClump; k++) {
      const wx = cx0 + (wRng() + wRng() - 1) * 38;
      const ty = fieldTop(wx) + 2 + wRng() * 11;
      const th = 17 + Math.pow(wRng(), 1.5) * 42;                 // mostly small, a few standing tall
      if (clearHome(wx) || onRoad(wx, ty) || wx < -34 || wx > 838) continue;
      const G2 = gAt('wood', wx, ty, th).child('branch');
      const rr = th * 0.34, ccy = ty - th * 0.58;
      const tips = limbs(out, counter, wRng, G2, wx, ty - th * 0.44, {
        len0: th * 0.26, lw0: 1.1, minLen: th * 0.1, maxDepth: th > 30 ? 2 : 1,
        col: (x, y, r) => jig(mix('#3b2a18', '#6a5236', r() * 0.6 + air(x, y) * 0.5), r, 7),
        pathOpts: { len: 3, density: 0.5, jitter: 0.45 },
      });
      const tipR = G2.child('crowns').rng();
      const crowns = [[wx, ccy, 1, wRng]].concat(spreadTips(tips, 2, rr * 0.7).map(t => [t[0], t[1], 0.56, tipR]));
      for (const [kx, kcy, mass, kr] of crowns) {
        const krr = rr * mass;
        strokes(out, counter, {
          rng: kr, n: Math.round(krr * 14),
          sample: r => { const a2 = r() * Math.PI * 2, d2 = Math.pow(r(), 0.55);
                         return [kx + Math.cos(a2) * krr * d2 * 1.1, kcy + Math.sin(a2) * krr * d2 * 0.82]; },
          dir: (x, y) => Math.atan2(y - kcy, x - kx) + Math.PI / 2,
          col: (x, y, r) => woodCol(x, y, kcy - krr * 0.9, r),
          len: 3.2, lw: 1.7, steps: 2, lenJ: 0.75, impasto: 0.5, op: 0.94,
        });
      }
      paintPath(out, counter, wRng, [[wx, ty], [wx + (wRng() - 0.5) * 3, ty - th * 0.46]],
        (x, y, r) => jig(mix('#48331d', '#6d5537', r() * 0.7 + air(x, y) * 0.5), r, 7),
        { lw: 1.3, len: 3, density: 0.7, jitter: 0.3 });
    }
  }

  // FRUITFUL TREES rooted across the field (Isa 35:1; Munch free colour) — each
  // planted in the MID field, so its base stays with the ground as the view turns.
  // (the three field trees that stood here are now part of the avenue below, so they
  // get trunks and the same greens instead of reading as blue and pink candy floss)
  // THE AVENUE — the road home, lined. This road already recedes to a vanishing point
  // AT THE FATHER'S HOUSE, so the trees take their scale, spacing and spread off the
  // same t the road uses and converge on the home with it. Kept off the road itself and
  // out of the house's glory, so the destination is never hidden (it is the whole point
  // of the page). They fall in the LAND plane, behind the Father and the child.
  perspectiveAvenue(out, counter, rng, {
    ptFn: roadP, wFn: roadW,
    // ⚠ the Father's light is strong here and fruitTree mixes toward #fbe79a at
    // g*0.85 — at full strength every canopy washed out to pale yellow and stopped
    // reading as green. Damped for the foliage only; the ground still takes it full.
    lightFn: (x, y) => gL(x, y) * 0.45,
    n: 8, t0: 0.14, t1: 0.98,
    extra: [                                        // the three long-standing field trees
      { x: 486, y: 252, h: 76,  set: 0 },
      { x: 96,  y: 332, h: 118, set: 1 },
      { x: 748, y: 344, h: 128, set: 2 },
    ],
    hFn: t => 14 + 130 * Math.pow(t, 1.5),
    gap: t => 30 + 165 * Math.pow(t, 1.25),
    mask: (x, y, h) => {
      if (x < -40 || x > 840) return false;
      if (onRoad(x, y)) return false;                       // never in the wheel-ruts
      if (x > 552 && y < 306) return false;                 // the house at (672,214) and its glory
      if (y < horizon + 6) return false;                    // no tree rooted in the sky
      return true;
    },
  });

  // white sheep in green pastures (Ps 23) — woolly, pale, dark face + legs
  const shp = (sx, sy, s) => { strokes(out, counter, { rng, n: Math.round(22 * s), sample: r => { const a = r() * Math.PI * 2, dd = Math.pow(r(), 0.7); return [sx + Math.cos(a) * 9 * s * dd, sy + Math.sin(a) * 5 * s * dd]; }, dir: () => 0, col: (x, y, r) => jig(mix('#e6dcc4', '#f6f0de', r() * 0.6), r, 7), len: 3 * s, lw: 2 * s, steps: 2 }); paintPath(out, counter, rng, [[sx - 8 * s, sy - 1 * s], [sx - 11 * s, sy + 1.5 * s]], (x, y, r) => jig('#3a322a', r, 4), { lw: 2 * s, len: 2, density: 1 }); for (const lx of [-5, 0, 5]) paintPath(out, counter, rng, [[sx + lx * s, sy + 3 * s], [sx + lx * s, sy + 6 * s]], (x, y, r) => jig('#3a322a', r, 4), { lw: 1.1 * s, len: 2, density: 0.9 }); };
  shp(150, 360, 1); shp(700, 298, 0.82); shp(744, 358, 0.78); shp(110, 420, 0.9);

  // THE FIELD CELEBRATES (Luke 15:20 "his father saw him... and ran"; Isa 35:1
  // "the desert shall rejoice, and blossom as the rose") — wildflowers crowd
  // THICK along both verges of the homecoming road, richest near the reader:
  // green stems first, then bright heads, so the border reads as growth.
  const vergeAt = (r, spread) => {
    const t = Math.pow(r(), 0.85);
    const p = roadP(t), q = roadP(Math.min(1, t + 0.04));
    let nx = -(q[1] - p[1]), ny = q[0] - p[0];
    const nl = Math.hypot(nx, ny) || 1; nx /= nl; ny /= nl;
    const side = r() < 0.5 ? 1 : -1;
    const off = roadW(t) / 2 + 1.5 + Math.pow(r(), 1.4) * (spread + t * 14);
    return [p[0] + nx * off * side, p[1] + ny * off * side];
  };
  strokes(out, counter, {   // stems: fresh green, leaning up out of the wheat
    rng, n: 170, sample: r => vergeAt(r, 7),
    dir: (x, y) => -Math.PI / 2 + (fbm(x / 16, y / 16, 305) - 0.5) * 0.8,
    col: (x, y, r) => jig(mix('#3a7a38', '#6aa842', r()), r, 9),
    len: (x, y) => 3.5 + (y - horizon) / (510 - horizon) * 5.5, lw: 1.5, steps: 2, lenJ: 0.4,
  });
  strokes(out, counter, {   // heads: joy-coloured, bigger + denser than the field scatter
    rng, n: 430, sample: r => vergeAt(r, 8),
    dir: () => -Math.PI / 2,
    col: (x, y, r) => { const k = r(); return jig(k < 0.24 ? '#f0447a' : k < 0.46 ? '#9a66e8' : k < 0.66 ? '#ffd23e' : k < 0.84 ? '#fffdf4' : '#ff8e5e', r, 12); },
    len: (x, y) => 2.6 + (y - horizon) / (510 - horizon) * 4.6,
    lw: (x, y) => 2.4 + (y - horizon) / (510 - horizon) * 2.6,
    steps: 1, lenJ: 0.45, impasto: 0.45,
  });

  // BUTTERFLIES rising out of the field along the Father's running line — the
  // meadow loosed into the air by His feet (Luke 15:20). Bold four-lobe curved
  // wings + a dark stitched body (the recipe proven on risen); size falls with
  // distance, each colour picked to pop on what is locally behind it.
  const butterfly = (bx, by, s, wing, body) => {
    const wc = (x, y, r) => jig(wing, r, 6);
    paintPath(out, counter, rng, [[bx - 1.2 * s, by - 0.5 * s], [bx - 5.5 * s, by - 4.5 * s], [bx - 8 * s, by - 1 * s], [bx - 3.5 * s, by + 0.8 * s]], wc, { lw: 2.4 * s, len: 3, density: 0.95, jitter: 0.4 });
    paintPath(out, counter, rng, [[bx + 1.2 * s, by - 0.5 * s], [bx + 5.5 * s, by - 4.5 * s], [bx + 8 * s, by - 1 * s], [bx + 3.5 * s, by + 0.8 * s]], wc, { lw: 2.4 * s, len: 3, density: 0.95, jitter: 0.4 });
    paintPath(out, counter, rng, [[bx - 1 * s, by + 1 * s], [bx - 4 * s, by + 4 * s], [bx - 1.5 * s, by + 4.8 * s]], wc, { lw: 2 * s, len: 2.5, density: 0.95, jitter: 0.4 });
    paintPath(out, counter, rng, [[bx + 1 * s, by + 1 * s], [bx + 4 * s, by + 4 * s], [bx + 1.5 * s, by + 4.8 * s]], wc, { lw: 2 * s, len: 2.5, density: 0.95, jitter: 0.4 });
    paintPath(out, counter, rng, [[bx, by - 3 * s], [bx + 0.6 * s, by], [bx, by + 3.5 * s]],
      (x, y, r) => jig(body, r, 5), { lw: 1.1 * s, len: 2.5, density: 1, jitter: 0.2 });
  };
  butterfly(268, 424, 1.6, '#e84a66', '#401830');  // coral-crimson, big + near — hovering over the pale road between Him and you
  butterfly(230, 384, 1.25, '#8f5ce0', '#301a4a'); // violet, higher on His line — risen further, on the green wheat
  butterfly(394, 320, 0.95, '#3d86d8', '#182a4a'); // bold blue, small + far — above the gold-lit wheat behind His shoulder (blue pops on gold)

  // CHILD: three steps in at the near end, walking toward the house  [FG layer]
  const _fgC = out.length;
  const cp = roadP(0.9); // near end
  const cx2 = cp[0] + 26, cy2 = cp[1] - 14;
  // an ARTICULATED little child taking steps toward the Father — small, stepping in
  // THE MAIN CHARACTER — the little pilgrim, mid-step toward the running Father,
  // one thin arm reaching out to Him
  E.paintMask(out, counter, rng, {
    x: cx2, y: cy2 + 2, h: 54, facing: 1,          // face the Father, who runs from the right
    lean: 4, stride: 0.7, lift: 0.5, wind: -0.3,
    armR: [cx2 + 13, cy2 - 18],                    // reach toward Him
    eye: [1, -0.2], mood: 'weary',
  });
  // (his front is lit by the Father's own gold — no baked rim needed)
  fgRanges.push([_fgC, out.length]);   // ← the child is foreground

  // MULTIPLANE: assemble the requested depth plane. Each is its own cel —
  // transparent where it has no content — so they stack and parallax like the
  // painted-background-plus-acetate-cels of hand-drawn animation.
  const ALT = 'A churning gold wheat field under a turbulent blue-green sky; a pale road cuts a diagonal; a small figure has taken three steps in, while from the far house the father, already past halfway, runs with dust flying.';
  const RAW = { undercoat: 0, weave: 0, varnish: 0, oil: 0 };   // no baked surface — the live filter unifies the planes
  const setOf = ranges => { const s = new Set(); for (const [a, b] of ranges) for (let i = a; i < b; i++) s.add(i); return s; };
  const pick = ranges => ranges.map(([a, b]) => out.slice(a, b).join('\n')).join('\n');
  const farSet = setOf(farRanges), citySet = setOf(cityRanges), nearSet = setOf(nearRanges), fgSet = setOf(fgRanges), birdSet = setOf(birdRanges);
  if (LAYER === 'sky') return svgWrap(ALT, out.slice(0, skyEnd).join('\n'), RAW);   // smooth sky ground (opaque backmost)
  const sm = LAYER.match(/^sky(\d+)$/);
  if (sm) return svgWrap(ALT, '<g>' + skySheets[+sm[1] - 1] + '</g>', RAW);         // one sky-swirl sheet
  if (LAYER === 'hills') return svgWrap(ALT, pick(farRanges), RAW);                 // distant hills, cypress
  if (LAYER === 'city') return svgWrap(ALT, pick(cityRanges), RAW);                 // the Father's house, shining
  if (LAYER === 'birds') return svgWrap(ALT, pick(birdRanges), RAW);                // the birds in their own air
  if (LAYER === 'dad') return svgWrap(ALT, pick(nearRanges), RAW);                  // the running Father
  if (LAYER === 'kid') return svgWrap(ALT, pick(fgRanges), RAW);                    // the near child
  if (LAYER === 'land') {                                                           // field + road + trees + sheep (everything unclaimed)
    const body = out.filter((_, i) => i >= skyEnd && !farSet.has(i) && !citySet.has(i) && !nearSet.has(i) && !fgSet.has(i) && !birdSet.has(i)).join('\n');   // ⚠ citySet too, or the kingdom is painted TWICE — once on its own plane and once baked into the ground
    return svgWrap(ALT, body, RAW);
  }
  // full painting (desktop): sky ground, the stacked sky-sheets, then everything else
  return svgWrap(ALT, out.slice(0, skyEnd).concat(skySheets, out.slice(skyEnd)).join('\n'));
}
