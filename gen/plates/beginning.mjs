// gen/plates/beginning.mjs — "In the beginning was the Light" (the first page)
// Before anything is made: only the vast deep, and the Light. NOT a centred bloom
// of glory (that is the reveal, light) — this is the FIRST light, just begun:
// a single brilliant POINT/star struck high and OFF-CENTRE in an immense formless
// dark, and the whole deep drawing back from it in long directional rays and slow
// ripples. Most of the frame is the deep (blue ripening to indigo to violet, never
// pure black); the light is small, piercing, holy — a beginning, not a climax.
//   "And the earth was without form, and void; and darkness was upon the face of
//    the deep... And God said, Let there be light: and there was light." — Gen 1:2-3
//   "In the beginning was the Word, and the Word was with God, and the Word was
//    God... In him was life; and the life was the light of men." — John 1:1,4
//
// MOBILE 3D — PAINT ON PAINT (same family as light/the covers): the vast deep
// ground (opaque, backmost) carries the long slow ripples + the hidden inscription;
// a MID plane carries the first light's directional rays raking ACROSS the dark from
// the off-centre source; the FG plane (closest) holds the small Klimt halo, the
// piercing white star with its spikes + sunburst, and the gold sparks. Tilt the phone
// and the rays drift across the still deep while the star floats nearest.
// The `full`/desktop image keeps the original single-pass draw order unchanged.

export const name = 'beginning';
export const title = 'In the beginning';
export const caption = 'In the beginning was the Light.';
export const seed = 10010101;
// the first light, struck HIGH and to the LEFT of centre — asymmetric, a beginning
export const focal = { x: 286, y: 168 };
export const layers = [
  { name: 'bg', opaque: true },   // the deep ground + ripples + hidden inscription (backmost)
  { name: 'mid' },                // the first light's directional rays raking the dark
  { name: 'fg' },                 // the piercing star, halo, spikes, sunburst, sparks (closest)
];

export function paint(E, opts = {}) {
  const {
    mulberry32, fbm, curlV, swirlV, mix, ramp, jig,
    strokes, rej, paintPath, ribbon, svgWrap, klimtGold, goldSparks,
    inscriptionText, greekRef, W, H,
    GOLD, GOLD_PALE, GOLD_DEEP, GOLD_HOT,
  } = E;

  const rng = mulberry32(seed);
  const out = [];      // BG plane — the deep ground + ripples + inscription
  const mid = [];      // MID plane — the first light's directional rays
  const fg = [];       // FG plane — the star, halo, spikes, sunburst, sparks
  const counter = { n: 0 };
  const LAYER = opts.layer || 'full';

  // ⚠ SY 150 -> 185. Measured on the phone: the plate's visible band is y 15..486, and a
  // burst reaching 170 units around a star at y=150 has its whole top-left quarter cut off
  // by the top of the screen — so what a reader sees is a burst whose middle is ~19 units
  // BELOW its own star, however the rig is placed. That is the last of "the starburst is
  // still not in the middle", and no amount of moving the rig can fix it: the light has to
  // stand where the whole burst fits. At 185 the burst spans 15..355 — all of it visible,
  // and still high and left of centre, which is the composition.
  // ⚠ SX 250 -> 268: THE PHONE'S WINDOW, NOT THE PLATE'S. Measured properly at last (by
  // the white-hot heart, not by the brightest pixel — see below), the star sits dead
  // centre of its own burst; what was left is that the whole light sat 18 units left of
  // the middle of the band a phone actually shows (plate x 160..377 on this device), and
  // that reads as "not in the middle" just as strongly. It stays high — y 185 of 500 —
  // so the composition is still a light struck high in a vast dark, not a bullseye.
  const SX = 268, SY = 185, CORE = 20;            // the first light's source + tiny core
  const distS = (x, y) => Math.hypot(x - SX, y - SY);
  const maxR = Math.hypot(W, H);
  // ONE dominant source, TIGHT reach — the light is small and the dark is vast
  // ⚠ REACH 78 -> 62. Moving the star down did not centre it and could not: a burst whose
  // rays reach ~170 units cannot fit the phone's visible band around ANY star, so its top
  // is always shaved by the screen and its visible middle always sits below its own
  // centre. The answer is not to chase it but to make the light small enough to fit —
  // which is also what this page has always said it is: "the light is small, piercing,
  // holy — a beginning, not a climax", with the dark left vast.
  const light = (x, y) => Math.min(1, Math.exp(-distS(x, y) / 62));

  /* ---------------- THE DEEP — vast, formless, never pure black ----------------
     Blue near the light, ripening to indigo and violet across the immense frame.
     The deep is swept in long, slow ripples drawing AWAY from the source — the
     face of the waters drawing back as the first light breaks (Gen 1:2). */
  const DEEP_NEAR = '#1d2350', DEEP_MID = '#181544', DEEP_FAR = '#150f32', DEEP_VIOLET = '#1f1140';
  const deepCol = (x, y, r) => {
    const d = Math.min(1, distS(x, y) / (maxR * 0.92));
    let c = ramp([DEEP_NEAR, DEEP_MID, DEEP_FAR], d);
    // a wash of violet pooling in the far deep, low and to the right (Munch: free colour)
    c = mix(c, DEEP_VIOLET, Math.min(1, ((x / W) * 0.5 + (y / H) * 0.5)) * fbm(x / 220, y / 220, 31) * 1.1);
    return jig(c, r, 8);
  };
  // long slow ripples raking ACROSS the frame, leaning away from the source — the
  // deep drawing back. Curl gives the breathing wobble; not a vortex (no swirl).
  const deepDir = (x, y) => {
    const ax = x - SX, ay = y - SY, d = Math.hypot(ax, ay) + 1e-6;
    // tangent to the source (ripples encircle it loosely) blended with a strong
    // outward drift so far ripples stream away to the deep corners
    const tx = -ay / d, ty = ax / d;
    const [cx, cy] = curlV(x, y, 27, 240);
    return Math.atan2(ty * 0.5 + (ay / d) * 0.9 + cy * 0.5, tx * 0.5 + (ax / d) * 0.9 + cx * 0.5);
  };

  /* ===== the deep ground — long broad ripples sweeping the whole vast frame ===== */
  out.push(`<rect width="${W}" height="${H}" fill="${DEEP_FAR}"/>`);
  // ⭐ DETAIL PASS (Sep 8). The deep was 560 ripples at lw 11 — fat flat slabs of one
  // indigo, the same fault as the cover's old bands. Now it is thousands of ripples and
  // EVERY STROKE DRAWS ITS OWN WIDTH AND LENGTH (Fred: "use no rules, a paint stroke
  // just exist because it exist") — two independent hashes, no field, no coupling.
  // Broken colour within the dark (blue / violet / a teal-black vein), still never black,
  // and LOCAL so the live filter's violet floor cannot average it to lavender.
  const free = (x, y, salt) => { const n = Math.sin(x * 12.9898 + y * 78.233 + salt) * 43758.5453; return n - Math.floor(n); };
  const widthOf  = (x, y, salt) => 0.40 + 3.2 * Math.pow(free(x, y, salt), 2.6);
  const lengthOf = (x, y, salt) => 0.40 + 1.5 * Math.pow(free(x, y, salt + 17), 1.5);
  const DEEP_BLUE = '#233270', DEEP_TEAL = '#14243d', DEEP_PLUM = '#2a1850';
  const deepBroken = (x, y, r) => {
    let c = deepCol(x, y, r);
    const v = free(Math.floor(x / 9), Math.floor(y / 9), 401);   // a vein is a PLACE, not a speckle
    if (v < 0.22) c = mix(c, DEEP_BLUE, 0.55);
    else if (v < 0.34) c = mix(c, DEEP_TEAL, 0.5);
    else if (v > 0.86) c = mix(c, DEEP_PLUM, 0.5);
    // the nearest ripples catch the faintest far glow of the first light
    c = mix(c, '#3a4488', Math.max(0, light(x, y) - 0.02) * 0.8);
    return c;
  };
  // ⚠ the deep is too dark to carry the site's 1-in-10 complementary fleck — a flipped mark
  // there is a yellow-olive slab, the one thing in the deep that was never painted. So the
  // deep paints at the approved 0.012 and the burst keeps the plate's own rate (its teal and
  // lilac chips are part of the first light's colour).
  const _MD = E.getManifold(); E.setManifold(0.012);
  // ⭐ DIFFERENT ART PER DRAWING (Fred, Sep 8, on the cover: "it is just like shifting up and
  // down. i want it to all be different art"). The deep's second drawing is a different
  // PAINTING of the same waters — its own rng, no displacement (BOIL_BAND_PAGE.beginning) —
  // so the breath is the face of the deep re-forming, never the same ripples nudged.
  // ⚠ softer, with intent (Fred): the SAME ripples in every drawing; what differs is a
  // slow breath drawing back from the star (length swells with a phase set by distance).
  const drng = mulberry32(seed + 4409);
  const _bb = E.boilBeat ? E.boilBeat() : 0;
  const breatheD = (x, y) => 1 + 0.28 * Math.cos(2 * Math.PI * (_bb - distS(x, y) / 380));
  strokes(out, counter, {
    rng: drng, n: 3600, sample: rej(-14, -14, 814, 514, () => true),
    dir: deepDir, col: deepBroken,
    // long sweeping ripples, longer the further out — the deep stretching away
    len: (x, y) => (40 + 52 * Math.min(1, distS(x, y) / (maxR * 0.7))) * lengthOf(x, y, 101) * breatheD(x, y),
    lw: (x, y) => 4.4 * widthOf(x, y, 103),
    steps: 4, follow: 0.92, lenJ: 0.3, wJ: 0.3, impasto: 0.0, relief: 0.35,
  });
  // the crests: hair-fine ripples riding the same drift, a shade lit — the deep has grain
  strokes(out, counter, {
    rng: drng, n: 2200, sample: rej(-14, -14, 814, 514, () => true),
    dir: deepDir,
    col: (x, y, r) => jig(mix(deepBroken(x, y, r), mix('#4a56a0', '#3b2a70', free(x, y, 211)), 0.16 + 0.1 * free(x, y, 213)), r, 6),
    len: (x, y) => (26 + 30 * Math.min(1, distS(x, y) / (maxR * 0.7))) * lengthOf(x, y, 107) * breatheD(x, y),
    lw: (x, y) => 1.5 * widthOf(x, y, 109),
    steps: 4, follow: 0.94, lenJ: 0.3, wJ: 0.3, impasto: 0.0, relief: 0.25, op: 0.8,
  });
  E.setManifold(_MD);

  /* ---------------- THE FACE OF THE DEEP (Sep 12, the beauty pass) ----------------
     Gen 1:2: "darkness was upon the FACE of the deep. And the Spirit of God moved upon the face
     of the WATERS." The deep has a face, and it is water — and the first light, struck above
     it, must show on it. So beneath the star the deep carries a broken shimmer: short pale
     flecks in a path that widens and dims as it falls away, the way a low light lies on dark
     water. Nothing is added to the star; the deep simply answers it. (bg plane.) */
  {
    const _MB = E.getManifold(); E.setManifold(0);
    const wr = mulberry32(seed + 7171);
    strokes(out, counter, {
      // (v1 was a white beam on the floor — too solid. A shimmer is BROKEN: fewer flecks,
      //  gaps between them, fainter, bluer as it falls away.)
      rng: wr, n: 760,
      sample: r => { const t = Math.pow(r(), 0.75); if (fbm(r() * 9, t * 6, 779) < 0.42) return null; const y = SY + 150 + t * (H - SY - 140); const half = 40 + t * 170; const x = SX + 30 + (r() + r() - 1) * half; return (x < -10 || x > 810) ? null : [x, y]; },
      dir: (x, y) => 0.06 + (fbm(x / 40, y / 14, 771) - 0.5) * 0.5,
      col: (x, y, r) => { const t = (y - SY - 150) / (H - SY - 140); return jig(mix(mix('#e9d9a8', '#8f8ac4', Math.min(1, t * 1.1)), '#fff4d4', r() * 0.3), r, 4); },
      len: (x, y) => 3 + free(x, y, 773) * 9, lw: (x, y) => 0.7 + free(x, y, 775) * 1.3, steps: 2, lenJ: 0.5, wJ: 0.3, impasto: 0, relief: 0,
      op: (() => 0.15)(),
    });
    E.setManifold(_MB);
  }

  /* ---------------- THE FIRST LIGHT — long directional rays raking the dark ----------------
     NOT a full radial bloom: the rays are long, gapped lances of gold streaming
     OUTWARD from the off-centre source across the deep, dying quickly into the dark
     so the light reads as just-struck — a piercing source, not a filled sky.
     CHIAROSCURO: white-hot at the source, gold close in, gone within a third of
     the frame — the rest is deep. */
  const rayCol = (x, y, r) => {
    const g = light(x, y);
    let c;
    if (g > 0.62) c = ramp([GOLD_HOT, '#fff1c4', GOLD_PALE], (1 - g) / 0.38);
    else c = ramp([GOLD_PALE, GOLD, GOLD_DEEP, '#7a5a28'], Math.min(1, (0.62 - g) / 0.5));
    c = mix(c, DEEP_MID, Math.max(0, (0.16 - g)) * 5.0);   // rays die into the deep
    return jig(c, r, 7);
  };
  // strictly RADIAL lances out from the source (directional rays), with a breath of
  // curl so they read as a hand's first stroke, not a machine's spokes
  const rayDirBase = (x, y) => {
    const ax = x - SX, ay = y - SY;
    const [cx, cy] = curlV(x, y, 19, 130);
    return Math.atan2(ay + cy * 0.22, ax + cx * 0.22);
  };
  // the rays only live CLOSE to the source — a piercing point, the dark keeps the rest
  const litMask = (x, y) => light(x, y) > 0.16;
  // ---- ⚠ THE LIGHT REACHES, AND THE REACH TRAVELS AROUND IT ----
  // Fred: "you could draw an alternate art and do transition to make it move... this is
  // lazy." He is right, and this is the difference: a tint recolours the same marks and a
  // boil nudges them a hair — neither is animation. Here the rays are DRAWN SOMEWHERE
  // ELSE in each drawing of the loop. Their length is scaled by a wave whose phase comes
  // from the ray's ANGLE around the source and advances with the beat, so at any instant
  // some lances are flung far into the dark while others have drawn back, and the swell
  // rotates slowly around the star — the first light feeling for the edges of the deep.
  // Every ray returns to its own length each cycle, so the loop still closes seamlessly.
  const _beat = E.boilBeat ? E.boilBeat() : 0;
  // ---- ⚠ RADIATING, NOT REACHING ----
  // Fred: "now it looks like the light flickers, i want the light to look like its
  // radiating!" The fault was in the geometry of my last attempt: I scaled ray LENGTH by
  // a wave, so rays grew AND SHRANK — and a thing that retracts reads as a flicker, not
  // as light. Light does not pull back. It leaves the source and keeps going.
  // So the lengths are fixed again, and what travels is BRIGHTNESS: a band of it is born
  // at the source and runs OUTWARD along the rays, fading as it goes, with the next
  // already behind it. Phase comes from a mark's DISTANCE from the source and advances
  // with the beat, so the band can only ever move away — outward, endlessly, which is
  // what radiating is. Wavelength is wide enough that two bands are never on screen at
  // once, or it would read as ripples rather than emission.
  const radiate = (x, y) => {
    // ⚠ CALM: a LONG wavelength and a SHALLOW swing. Fred: "make the wavelength longer,
    // slower emission, make it more calm and smooth." At 210 the band was narrow enough
    // to read as a pulse crossing the frame; at 340 it is wider than the lit region, so
    // what you see is one broad swell of light passing outward rather than a ring going
    // by. And the floor is raised from 0.42 to 0.66 — the dark side of the wave never
    // gets dark, so the rays never appear to switch off, only to breathe brighter.
    const ph = distS(x, y) / 340 - _beat;              // + beat would run it INWARD
    return 0.66 + 0.34 * (0.5 + 0.5 * Math.cos(ph * Math.PI * 2));
  };
  /* ---- ⚠ AND THE MARKS THEMSELVES MUST BE SOMEWHERE ELSE ----
     Fred: "now it is a static animation fading in and out... you could make it move by
     drawing several similar frames." Right, and the diagnosis is exact: every drawing so
     far held the SAME marks in the SAME places and only changed their brightness, so
     six drawings cross-faded could only ever be one picture dimming. Animation is the
     hand redrawing the thing somewhere else.
     WHAT moves is not mine to invent — scripture says what moved first:
       Gen 1:2  "the Spirit of God MOVED upon the face of the waters"  -> the dove broods,
                 and the waters flex under the hover. The first motion in the book.
       Ps 104:2 "who coverest thyself with LIGHT AS WITH A GARMENT: who stretchest out
                 the heavens LIKE A CURTAIN"  -> light is cloth. So the rays WIND and
                 unwind about the source like a garment turning, the turn travelling
                 outward so the fan furls instead of spinning rigidly.
       John 1:5 "the light SHINETH in darkness" — present, continuous: the outward swell
                 of brightness stays exactly as it is, and now form moves with it.
     Everything below is periodic in the beat, so drawing 6 hands back to drawing 1. */
  const TAU = Math.PI * 2;
  // the garment turning: a torsion wave running outward. Near the source almost nothing
  // moves (a struck point does not swing); far out the lances swing several pixels.
  const windTh = (d) => 0.070 * Math.sin(TAU * (_beat - d / 300));
  const winds = (p) => {
    if (!p) return null;                      // rej() gives up sometimes; pass the miss through
    const ax = p[0] - SX, ay = p[1] - SY;
    const th = windTh(Math.hypot(ax, ay)), c = Math.cos(th), s = Math.sin(th);
    return [SX + ax * c - ay * s, SY + ax * s + ay * c];
  };
  // the stroke's HEADING turns with the cloth as well, or a moved mark still points the
  // old way and the fan shears instead of furling
  const rayDir = (x, y) => rayDirBase(x, y) + windTh(distS(x, y));
  // broad soft glow hugging the source, setting its colour
  strokes(mid, counter, {
    rng, n: 420,
    sample: (r => { const f = rej(-14, -14, 814, 514, (x, y) => light(x, y) > 0.26); return q => winds(f(q)); })(),
    dir: rayDir, col: rayCol,
    len: (x, y) => (16 + 26 * (1 - light(x, y))) * lengthOf(x, y, 301), lw: (x, y) => 4.2 * widthOf(x, y, 303),
    steps: 4, follow: 0.9, lenJ: 0.3, wJ: 0.3, impasto: 0.5, relief: 0.5,
  });
  // the directional rays — gapped lances raking a little way into the dark, then gone.
  // A FEW escape long across the deep (the first light reaching out), most are short.
  strokes(mid, counter, {
    rng, n: 760,
    sample: (r => { const f = rej(-14, -14, 814, 514, (x, y) => litMask(x, y) && distS(x, y) > CORE * 0.8); return q => winds(f(q)); })(),
    dir: rayDir,
    col: (x, y, r) => jig(mix(DEEP_MID, mix(rayCol(x, y, r), GOLD_HOT, light(x, y) * 0.3), radiate(x, y)), r, 6),
    len: (x, y) => (18 + 28 * Math.min(1, distS(x, y) / 110)) * lengthOf(x, y, 311),
    lw: (x, y) => (1.2 + 2.2 * light(x, y)) * widthOf(x, y, 313),
    steps: 5, follow: 0.94, wild: 0.05, lenJ: 0.3, wJ: 0.3, impasto: 0.5, relief: 0.55,
  });
  // the light on the light: hair-fine near-white streaks riding the lances (same wind,
  // same outward swell of brightness), so the burst has grain instead of slabs
  strokes(mid, counter, {
    rng, n: 520,
    sample: (r => { const f = rej(-14, -14, 814, 514, (x, y) => light(x, y) > 0.2 && distS(x, y) > CORE * 0.8); return q => winds(f(q)); })(),
    dir: rayDir,
    col: (x, y, r) => jig(mix(DEEP_MID, mix(rayCol(x, y, r), '#fff8e2', 0.45 + 0.35 * light(x, y)), radiate(x, y)), r, 5),
    len: (x, y) => (14 + 22 * Math.min(1, distS(x, y) / 110)) * lengthOf(x, y, 321),
    lw: (x, y) => 0.8 * widthOf(x, y, 323),
    steps: 5, follow: 0.95, wild: 0.04, lenJ: 0.3, wJ: 0.3, impasto: 0.3, relief: 0.2, op: 0.75,
  });
  // a sparse handful of LONG rays piercing far out into the deep, dying as they go.
  // ⚠ THEY USED TO ALL LEAN DOWN-RIGHT (mean angle 0.7 rad) and that is what Fred kept
  // seeing: "the starburst is still not in the middle." It was not the rig — the rig sat
  // on the source and on the gold's centre of mass in turn, and neither helped, because
  // the BURST ITSELF was not centred on its own star. Measured on the phone, the visible
  // burst's extent sat 29 plate units below the star. Twenty-six long lances raking one
  // way will do that. They go all the way round now, with the reach still varying so the
  // fan is a hand's, not a compass's — asymmetry of LENGTH, not of direction.
  strokes(mid, counter, {
    rng, n: 56,
    sample: r => { const a = r() * Math.PI * 2; const d = CORE + r() * 30; return winds([SX + Math.cos(a) * d, SY + Math.sin(a) * d]); },
    dir: rayDir,
    col: (x, y, r) => jig(mix(GOLD, DEEP_MID, Math.min(0.85, distS(x, y) / 360)), r, 6),
    len: (x, y) => 48 * lengthOf(x, y, 331),          // each lance its own reach — no rule
    lw: (x, y) => Math.max(0.5, 2.4 * Math.exp(-distS(x, y) / 200)) * widthOf(x, y, 333),
    steps: 6, follow: 0.96, lenJ: 0.3, wJ: 0.3, relief: 0.4,
  });

  /* ===== THE HEART THE RAYS COME OUT OF (Sep 23) =====
     ⚠ De-baking the star left the rays converging on NOTHING: a dark hole the size of a
     coin at the very centre of the first light, and on desktop the rig's star sat 35 units
     above it, so the page showed the Light with a black heart. John 1:5 — "the light
     shineth in darkness; and the darkness comprehended it not." There is no dark at the
     centre of this light. The painting now carries its own lit heart where every ray
     converges: soft, warm-white, small (the rig's star stands on it and does the piercing).
     Own rng, so nothing else on the plate re-rolls. */
  strokes(mid, counter, {
    rng: mulberry32(seed + 105), n: 260,
    sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 0.8) * CORE * 1.9; return [SX + Math.cos(a) * d, SY + Math.sin(a) * d]; },
    dir: (x, y) => Math.atan2(y - SY, x - SX),
    col: (x, y, r) => jig(ramp(['#ffffff', '#fff8e0', GOLD_HOT, GOLD_PALE, '#e9c47e'], distS(x, y) / (CORE * 1.9)), r, 5),
    len: (x, y) => 5 + 7 * (distS(x, y) / (CORE * 1.9)), lw: 2.6, steps: 2, lenJ: 0.5, wJ: 0.5, relief: 0.15, impasto: 0.3,
  });

  /* ===== a small KLIMT halo hugging the source (gold = the throne), tight not vast =====
     ⚠ DE-BAKED WITH THE STAR. A painted halo left behind while the rig moves is the star
     standing off its own glow — which is exactly what "the starburst is not in the center
     of the graphics in the back" looks like up close. The whole light-object travels
     together now: halo, heart, cross, arms. Only the deep and the long rays stay painted. */
  const star = (LAYER === 'full') ? fg : [];   // the whole light-object: halo, heart, spikes, sunburst
  const halo = star;
  klimtGold(halo, counter, rng, SX, SY, CORE + 6, 64, { rings: 4, opacity: 0.4 });

  /* ===== THE PIERCING STAR — white-gold, small and brilliant, the brightest thing =====
     ⚠ DE-BAKED FOR THE PLANES (Fred, Aug 6): "why dont the starburst thing that you made
     be on the spot where the static starburst is, then remove the static starburst, this
     will make the inside animate and outside static." Exactly the garden's fire: the
     thing that should move is not painted into the picture at all — the painting keeps
     the vast deep and the rays, and the star itself is handed to the rig, which stands on
     the same spot (250,150) and draws the core, the cross and the reaching arms.
     It stays PAINTED in the flat desktop plate and the contact sheet, which have no rig:
     `star` is pushed to the fg plane only when this is the single-pass draw. */
  strokes(star, counter, {
    rng, n: 240,
    sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 0.7) * CORE; return [SX + Math.cos(a) * d, SY + Math.sin(a) * d]; },
    dir: (x, y) => Math.atan2(y - SY, x - SX) + Math.PI / 2,
    col: (x, y, r) => jig(ramp(['#ffffff', '#fffdf0', GOLD_HOT, GOLD_PALE, GOLD], distS(x, y) / CORE), r, 5),
    len: 9, lw: 2.7, steps: 2, wJ: 0.5, lenJ: 0.5, impasto: 0.55,
  });
  // four long piercing spikes of the star — a struck point of light (gen 1:3)
  const _sturn = 0.055 * Math.sin(TAU * _beat);           // the cross turns with the cloth
  for (const ang0 of [0, Math.PI / 2, Math.PI, -Math.PI / 2]) {
    const ang = ang0 + _sturn;
    const spike = (54 + (ang0 === 0 || ang0 === Math.PI ? 18 : 0)) * (1 + 0.08 * Math.sin(TAU * (_beat - 0.12)));
    star.push(ribbon([
      [SX, SY],
      [SX + Math.cos(ang) * spike * 0.5, SY + Math.sin(ang) * spike * 0.5],
      [SX + Math.cos(ang) * spike, SY + Math.sin(ang) * spike],
    ], 5.5, mix(GOLD_HOT, '#ffffff', 0.5), [0.6, 0.3, 0.08]));
    counter.n++;
  }
  // a final white sunburst at the very heart — no darkness at all (de-baked with the star)
  strokes(star, counter, {
    rng, n: 80,
    sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 1.2) * CORE * 0.55; return [SX + Math.cos(a) * d, SY + Math.sin(a) * d]; },
    dir: (x, y) => Math.atan2(y - SY, x - SX),
    col: (x, y, r) => jig('#ffffff', r, 4),
    len: 7, lw: 1.8, steps: 2, relief: 0,
  });

  /* ===== gold sparks near the source, dying quickly into the vast deep ===== */
  goldSparks(fg, counter, rng, SX, SY, CORE + 10, 150, 70, { squash: 1.0, big: 1.05, lightFn: light });

  /* ===== HIDDEN EGG — John 1:1 in Koine Greek numerals, cut faintly into the far dark ===== */
  inscriptionText(out, greekRef(1, 1), { x: 648, y: 446, h: 14, body: '#e6ecf6', edge: '#171026', op: 0.78, edgeOp: 0.5 });

  /* ===== THE SPIRIT — a faint dove-form hovering over the deep (Gen 1:2) =====
     "And the Spirit of God moved upon the face of the waters." NOT a bird: a
     dove-shaped DISTURBANCE in the first light — a few curved pale strokes
     down-right of the star where the rays are dying into the dark, and the
     ripples of the deep flexing beneath the hover. A whisper, found on the
     second look; the page keeps its emptiness. (Appended last: no rng re-roll.) */
  const DVX = 352, DVY = 256;   // just PAST the ray rim (light ≈ 0.15): pale reads on the dark deep
  const doveHue = mix(mix(GOLD_PALE, '#ffffff', 0.4), DEEP_MID, 0.3);
  const doveDim = mix(doveHue, DEEP_MID, 0.4);
  // ---- THE ONE THING SCRIPTURE SAYS MOVED. The dove is REDRAWN in every drawing of
  // the loop: wings lift and settle, the body rides up with them, the tail-wisp trails
  // a beat behind (a following part always lags, or the whole shape moves like a stamp).
  // BROODING, not flapping — the Hebrew of Gen 1:2 is a bird settling over a nest, so
  // this is a slow deep hover, and the loop closes because every offset is a sine of
  // the beat.
  const bt = TAU * _beat;
  const flap = Math.sin(bt);                 // -1 wings down .. +1 wings lifted
  const bob = -Math.cos(bt) * 2.4;           // the body rides the beat, a quarter behind
  const lag = Math.sin(bt - 0.9);            // the tail follows late
  const W1 = (px, py, k) => [px, py - flap * 6 * k];          // wing point: outer tips travel most
  const B1 = (px, py) => [px, py + bob];
  mid.push('<g opacity="0.55">');
  // two wings lifted in the hover — shallow arcs (curved: living, Munch's law)
  mid.push(ribbon([B1(348, 257), W1(341, 250, 0.45), W1(335, 246, 0.8), W1(330, 248, 1)], 3.2, doveHue, [0.55, 0.42, 0.3, 0.12]));
  mid.push(ribbon([B1(356, 256), W1(363, 248, 0.45), W1(369, 244, 0.8), W1(374, 246, 1)], 3.2, doveHue, [0.55, 0.42, 0.3, 0.12]));
  // fainter echo arcs above — the beat of the hover, a disturbance not a glyph
  mid.push(ribbon([W1(346, 252, 0.3), W1(339, 245, 0.7), W1(333, 242, 1.05)], 2.2, doveDim, [0.4, 0.3, 0.1]));
  mid.push(ribbon([W1(358, 251, 0.3), W1(365, 243, 0.7), W1(371, 240, 1.05)], 2.2, doveDim, [0.4, 0.3, 0.1]));
  // breast catching the light, and a tail-wisp trailing down over the waters
  mid.push(ribbon([B1(348, 258), B1(353, 261), B1(358, 262)], 3.6, mix(doveHue, '#ffffff', 0.25), [0.5, 0.55, 0.3]));
  mid.push(ribbon([B1(353, 263), [350 + lag * 1.6, 270 + bob * 0.5], [348 + lag * 3.2, 276]], 2.6, doveDim, [0.5, 0.35, 0.12]));
  mid.push('</g>');
  counter.n += 6;
  // the face of the waters flexing BENEATH the hover — three bent ripple arcs,
  // curving against the deep's outward drift (bg plane, so they sit under the rays)
  // ...and the water ANSWERS the hover: each arc swells outward a beat after the wings
  // press down, the far ones later than the near — a disturbance spreading, which is
  // what "moved upon the face of the waters" looks like from above.
  mid.push('<g opacity="0.5">');
  let _ri = 0;
  for (const [R0, gk] of [[13, 0.3], [21, 0.2], [30, 0.12]]) {
    const R = R0 + Math.sin(bt - 0.7 - (_ri++) * 0.55) * 3.4;
    const arc = [];
    for (let i = 0; i <= 4; i++) {
      const a = Math.PI * (0.22 + 0.56 * (i / 4));
      arc.push([DVX + Math.cos(a) * R * 1.35, DVY + 16 + Math.sin(a) * R * 0.5]);
    }
    mid.push(ribbon(arc, 2.4, mix(DEEP_NEAR, GOLD_DEEP, gk), [0.2, 0.45, 0.5, 0.45, 0.2]));
    counter.n++;
  }
  mid.push('</g>');

  /* ===== three more spark-motes adrift in the deep, dimming with distance ===== */
  const mote = (x, y, s, k) => {
    const c = mix(GOLD_PALE, DEEP_MID, k);
    fg.push(`<g opacity="${(0.85 - k * 0.4).toFixed(2)}">`);
    fg.push(ribbon([[x - s, y], [x, y - s * 0.18], [x + s, y]], s * 0.34, c, [0.1, 0.55, 0.1]));
    fg.push(ribbon([[x, y - s * 0.9], [x + s * 0.14, y], [x, y + s * 0.9]], s * 0.3, c, [0.1, 0.5, 0.1]));
    fg.push('</g>');
    counter.n += 2;
  };
  mote(422, 118, 3.4, 0.25);
  mote(302, 328, 3.0, 0.4);
  mote(457, 197, 2.6, 0.55);

  /* ---------------- assembly ---------------- */
  const ALT = 'The primordial beginning, before anything is made: an immense formless dark, the deep, blue ripening to indigo and violet across the whole frame (never pure black), swept in long slow ripples. High and to the left, off-centre, a single small brilliant star of the first light is struck — white-hot at its heart, gold close in — and long directional rays rake outward across the vast dark, dying quickly into the deep. No figure, no ground, no landscape — only the first light just begun over the great deep. And God said, Let there be light: and there was light.';
  const RAW = { undercoat: 0, weave: 0, varnish: 0, oil: 0 };
  if (LAYER === 'bg') return svgWrap(ALT, out.join('\n'), RAW);                    // deep ground + ripples + inscription (opaque)
  if (LAYER === 'mid') return svgWrap(ALT, '<g>' + mid.join('\n') + '</g>', RAW);  // the directional rays
  if (LAYER === 'fg') return svgWrap(ALT, '<g>' + fg.join('\n') + '</g>', RAW);    // the star, halo, spikes, sunburst, sparks
  // full painting (desktop): deep ground + ripples, then rays, then the star — original draw order
  return svgWrap(ALT, out.concat(mid, fg).join('\n'));
}
