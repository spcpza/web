# SKY STANDARD — the ALIVE jewel-swirl hand for EVERY sky (Jul 8 2026, v2)

Fred's final call: make EVERY sky the deep, three-scale "alive" jewel-swirl of the
pages he loves — **looking.mjs and garden.mjs are the EXEMPLARS**. Not the simpler
ran-vortex (that's superseded). One hand, book-wide. Each plate keeps its own
PALETTE and LIGHT SOURCE; only the swirl STRUCTURE + jewel-glow + flowing strokes
standardize. Radial-burst pages (risen/come/comes/nonight) KEEP their light-source
burst and gain the alive swirls AROUND it (like Starry Night: radiance AND swirls).

## THE ALIVE RECIPE (copy from looking.mjs; adapt centre + palette per plate)

**Motion at THREE scales** — build the stroke-direction field `skyDir(x,y)`:
```
const EDDIES = [ /* 3-4 mid eddies: [ex, ey, strength] spread across the sky */
  [ ~0.55W, ~0.15H, -60 ], [ ~0.85W, ~0.25H, 58 ], [ ~0.7W, ~0.55H, -50 ], [ ~0.1W, ~0.25H, 46 ] ];
const skyDir = (x, y) => {
  let vx = 0, vy = 0;
  // 1 · MACRO — ONE great wheel organising the whole sky (centre near the light/focal)
  { const [a,b] = goldenSpiralV(x, y, WHEEL_X, WHEEL_Y, 115, 260); vx += a; vy += b; }
  // 2 · MID — a few eddies turning inside the wheel
  for (const [ex,ey,s] of EDDIES) { const [a,b] = goldenSpiralV(x, y, ex, ey, s, 80); vx += a; vy += b; }
  // 3 · MICRO — fine turbulence so every stroke curves with its parent current
  const [c,d] = curlV(x, y, 31, 120); vx += c*26; vy += d*26;
  return Math.atan2(vy, vx);   // (+ optional recoil term around a bright source, see looking)
};
```
- **WHEEL_X/Y** = the great wheel's centre: put it near the plate's LIGHT SOURCE or focal
  (the sun, the home, the tomb, the descent), so the whole sky wheels around the meaning.
- Wheel strength ~110-120, radius ~240-280. Eddy strength ~46-66 (alternating sign), radius ~80.

**Jewel glow at the eddy cores** — in the sky col():
```
const EGLOW = [ [ex, ey, '<jewel>'], ... ];   // one per eddy; deep jewel tints of THIS palette
for (const [ex,ey,ec] of EGLOW) { const d2 = Math.hypot(x-ex, y-ey); c = mix(c, ec, Math.exp(-d2/95)*0.5); }
```
- `<jewel>` = a deep, saturated tint that fits the sky (night → deep blue/violet #3f549e/#41337e;
  day → a soft teal/rose/gold jewel; dawn → rose/violet). The cores "breathe" faint colour — this
  is a big part of the alive richness. Keep subtle (the exp·0.5 falloff).

**Flowing strokes** — the sky strokes must FOLLOW the current so the swirls read:
```
strokes(out, counter, { rng, n: ~900-1150, sample: <sky region>, dir: skyDir, col: skyCol,
  len: 44, lw: 9.5, steps: 4, follow: 0.91, wild: 0.05, lenJ: 0.5, impasto: 0.5, relief: 0.55 });
```
- HIGH follow (0.91), LOW wild (0.05) = long streaming strokes that trace the wheel (the "deep moving water").

**Bright crests + sparkle** (keep from the prior standard, palette-matched): bright cloud-crests where
fbm>0.76 (white on day, pale silver on night), soft knot-sparks near eddy centres, and faint star-sparkle
in the dark regions (see looking §1.5). On a DARK sky keep it deep — only crest edges catch light.

## RULES
- KEEP each plate's palette/brightness + its light-source glow/rays. Only the swirl STRUCTURE
  (great wheel + eddies + micro curl), the jewel eddy-glow, and the flowing strokes standardize.
- RADIAL pages (risen/come/comes/nonight): keep the radial burst from the source, ADD the great
  wheel + eddies + jewel-glow AROUND it so it matches (radiance + swirl coexist).
- Touch ONLY the sky (figures/ground/eggs/layers/water untouched).
- Build (`node gen/build.mjs <name>`, FOREGROUND, timeout 500000), VERIFY by cropping the sky —
  it must read as the deep 3-scale jewel-swirl (one great wheel + eddies + jewel colour). 1 fix iter.

## TARGETS (every landscape sky; looking + garden = EXEMPLARS, skip)
ran, road, bread, flame, bridge, together, risen, seeds, twoways, come, comes,
nonight, string, storm, love.
