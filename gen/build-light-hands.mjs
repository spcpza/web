// gen/build-light-hands.mjs — the Light's two hands, as a FRONT layer lying over the
// carried child (twoways, page 17).
//
// ⚠ WHY A SEPARATE PIECE AT ALL. The Light is painted into the plate; the child is a
// runtime sprite composited AFTER the whole plate. So anything of the Light's that falls
// inside the child's silhouette is behind him — no coordinate can change that. A
// piggyback's hands cross the child, so the only honest way to draw them is a piece that
// renders after him.
// ⚠ THE PLATE'S OWN ARMS MUST BE A HIDDEN STUB WHENEVER THIS IS ON. See the `hands:` and
// `armLen:` note in gen/plates/twoways.mjs. Leave them full length and he grows two
// pairs. The two files move together, always.
//
// ⚠ TWO HANDS, NOT ONE BAND. Fred: "the middle part also should be separate since those
// are two different hands." Built as one continuous sweep it read as a single strap
// across him. Each arm is now its own shape with its own outline; they overlap slightly
// at the centre and the near one's outline crosses the far one's fill, which is what
// makes the join read as two hands meeting rather than one object.
//
// ⚠ NO OUTLINE ALONG THE TOP OF THE FOREARM. Fred: "the border on the top of the forearms
// should not be there since it is a continuation of the light figure on the background."
// He is right and it is a real drawing rule, not a preference: above that edge is the
// Light's OWN BODY, so a contour there would cut his arm off from himself and turn one
// figure into two overlapping objects. The outline runs the underside and wraps the hand
// — the edges that meet the child and the meadow — and simply stops where the arm passes
// back into him.
//
// ⚠ TRACED FROM FRED'S DRAWING, read against the child's measured plate position (his
// silhouette x 314.5..370.5, y 300..375, which sets the scale):
//     outer ends ≈ plate (316, 340) and (364, 338),  hands meeting ≈ plate (340, 362)
// Tapered — narrow where they emerge from behind him, swelling into the hands.
//
// ⚠ PALE, BECAUSE THE GREY WAS ARITHMETIC. L.body's dark end (#8a6a22) at this alpha over
// the child's blue coat resolves to rgb(117,104,68) — a dead olive, and a scatter of those
// is what kept reading as dirt. The pale stops do the opposite. So the ramp floor stays
// clear of the dark stops and all the variation happens among the light ones, which keeps
// it PAINTED (texture is the difference between marks) without ever mixing down to mud.
// ⚠ The manifold fleck is damped here too: jig() flips ~1 mark in 10 to its complement,
// and the complement of GOLD is BLUE — over a blue coat those read as holes, not colour.
//
// ⚠ TRANSLUCENT THROUGHOUT, FILL AND OUTLINE (the outline less so — see OUTLINE_ALPHA). "not opaque, but transparent" (he is light; light
// does not block what is behind it) and "the same outside outline" fight each other:
// fading the finished image fades the contour with it and it goes grey. So the fade is
// baked here and applies only to the fill.
// ⚠ AND THE OUTLINE COLOUR IS MEASURED OFF HIM, NOT READ FROM CAST.light.contour. That
// constant is #2a1608, near-black; on the Light it sits UNDER his body paint and inside
// his halo, so what reaches the page is a soft mid-brown. Sampled from his own rim in
// plates-vg/twoways-fg.webp (darkest pixel across his edge, y 380–430): rgb ≈ 126,108,80.
//
// Local units ARE plate units, origin at plate (342.5, 352).
// Run: node gen/build-light-hands.mjs   →  cast/light-hands.png + .webp
import { writeFileSync, mkdirSync } from 'fs';
import { execFileSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { mulberry32, ramp, jig, strokes, R1, setManifold, getManifold } from './engine.mjs';
import { CAST } from './characters.mjs';

const DIR = dirname(fileURLToPath(import.meta.url));
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const rng = mulberry32(1607);
const counter = { n: 0 };
const L = CAST.light;                    // his palette comes from the library, never here

const OUTLINE = '#7e6c50';               // measured off his own rim — see the note above
// ⚠ MATCHED TO HIS OWN RIM, MEASURED. Fred: "make sure the upper arm and the lower arm
// looks attached. so make sure the border match in style and shape and thickness." His
// rim in plates-vg/twoways-fg.webp runs a median 3.5 plate units across his edge (y
// 388–428); mine was 1.35, so the overlay's border read as a different, finer line and
// the two halves of the same arm looked like separate objects. 3.0 — a hair under his,
// because his is a soft gradient under paint and this is a crisp stroke, so equal
// numbers would read heavier.
const OUT_W = 3.0;                       // outline weight, in plate units
const BODY_ALPHA = 0.78;                 // the fill
// ⚠ THE OUTLINE IS SLIGHTLY TRANSPARENT TOO, NOW THAT IT SAFELY CAN BE. Fred: "make the
// border also slightly transparent like the one in the background." Earlier this was the
// one thing held at full alpha, because fading the outline WHEN IT WAS CAST.light.contour
// (#2a1608, near-black) turned it into a grey fringe — a shadow cast by something made of
// light. That risk is gone: the outline is now his measured rim brown, so thinning it
// just softens the edge the way his own does, instead of muddying it. Kept above the
// fill's alpha so the border still reads as the drawn edge.
const OUTLINE_ALPHA = 0.58;   // ⚠ lowered again — Fred: "even more transparent. it is a light after all". A figure made of light should not carry a firm edge; it should be felt more than drawn.

// one arm, traced from his drawing: out from behind the child, sweeping down to the hand.
// mirrored for the other. They are drawn as SEPARATE shapes on purpose.
// ⚠ CURVED, NOT A DIAGONAL BAR. Fred: "it is too rigid, make it curve a bit so it looks
// more organic." The control points used to sit almost on the straight line between the
// ends, so the arm came out as a ruled strut — and this book has a rule about that
// (Munch's law: made things get the straight lines, LIVING things curve). The arm now
// drops steeply out of his body first and only then sweeps inward under the child, which
// is both a curve and the path an arm actually takes to wrap someone.
// ⚠ REACHING FURTHER UP AND OUT. Fred marked the very tops of both arms in red: "see the
// red part, make that impasto too." The paint was not missing there — the ARM was. It
// began at plate (316.5, 339), level with the child's own sleeves, so it appeared to
// start in mid-air at his side instead of coming out from behind him. Now it starts at
// plate (313.5, 333.5), outside the child's silhouette and above his sleeve line, so the
// eye follows it back into the Light's body where it belongs.
// ⚠ AND IT HAS TO START ON HIM, NOT PAST HIM. At plate y 333 the Light spans x 314–371
// but the CHILD is only 328–357 — his sleeves have not begun yet — so the Light's own
// gold shoulder is exposed on both sides there. That is where the arm attaches. Reaching
// out to 313.5 put the tip a unit beyond his silhouette, hanging in the background, which
// is what made the join look broken.
const ARM_L = [[-24.5, -18.5], [-23, -7], [-16, 4], [-4, 9.5]];
const mirror = seg => seg.map(p => [-p[0], p[1]]);
const ARMS = [ARM_L, mirror(ARM_L)];
// ⚠ and the taper is non-linear — a limb does not widen at a constant rate. Slow out of
// the shoulder, gathering into the hand.
const halfW = t => 3.0 + t * t * 2.9;
// ⚠ a slow waver along the edges, so the silhouette is a drawn line and not a machine
// curve. Small — this is a wobble in the hand, not a scallop.
const waver = t => 1 + Math.sin(t * 9.5 + 0.7) * 0.055 + Math.sin(t * 21 + 2.1) * 0.03;

const bez = (p, t) => {
  const u = 1 - t;
  return [u * u * u * p[0][0] + 3 * u * u * t * p[1][0] + 3 * u * t * t * p[2][0] + t * t * t * p[3][0],
          u * u * u * p[0][1] + 3 * u * u * t * p[1][1] + 3 * u * t * t * p[2][1] + t * t * t * p[3][1]];
};

// build one arm: its sample points, its two rails, a closed shape, and an OPEN outline
function buildArm(seg, flip) {
  const PTS = [];
  for (let i = 0; i <= 40; i++) PTS.push(bez(seg, i / 40));
  const UNDER = [], OVER = [];
  for (let i = 0; i < PTS.length; i++) {
    const a = PTS[Math.max(0, i - 1)], b = PTS[Math.min(PTS.length - 1, i + 1)];
    const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy) || 1;
    // normal chosen so UNDER is always the side away from his body (the lit underside
    // that meets the child and the meadow); flip mirrors it for the right arm
    const s = flip ? -1 : 1;
    const nx = (-dy / len) * s, ny = (dx / len) * s;
    const t = i / (PTS.length - 1);
    const w = halfW(t);
    UNDER.push([PTS[i][0] + nx * w * waver(t), PTS[i][1] + ny * w * waver(t)]);
    OVER.push([PTS[i][0] - nx * w * waver(t + 1.7), PTS[i][1] - ny * w * waver(t + 1.7)]);
  }
  const last = PTS.length - 1;
  const tanx = PTS[last][0] - PTS[last - 1][0], tany = PTS[last][1] - PTS[last - 1][1];
  const tl = Math.hypot(tanx, tany) || 1, wEnd = halfW(1);
  const tip = [PTS[last][0] + (tanx / tl) * wEnd, PTS[last][1] + (tany / tl) * wEnd];
  const L_ = p => `L${R1(p[0])} ${R1(p[1])}`;
  // the closed silhouette — used to fill and to clip the brushwork
  const shape = `M${R1(UNDER[0][0])} ${R1(UNDER[0][1])}`
    + UNDER.slice(1).map(L_).join('')
    + `Q${R1(tip[0])} ${R1(tip[1])} ${R1(OVER[last][0])} ${R1(OVER[last][1])}`
    + OVER.slice(0, -1).reverse().map(L_).join('') + 'Z';
  // ⚠ the OUTLINE is OPEN: underside + round the hand + just the hand's own top edge.
  // It never runs the length of the forearm's top, because up there the arm is simply
  // his body carrying on behind the child.
  const HAND_FROM = Math.round(last * 0.62);
  // ⚠ the outline starts a few steps IN, not at the very tip. A stroke that begins exactly
  // at the cap leaves a blunt line-end sitting on his shoulder — a full stop where the arm
  // is supposed to continue into him. Starting late lets the first units of the arm melt
  // into his body, which is what "attached" looks like.
  const OUT_FROM = 5;
  const outline = `M${R1(UNDER[OUT_FROM][0])} ${R1(UNDER[OUT_FROM][1])}`
    + UNDER.slice(OUT_FROM + 1).map(L_).join('')
    + `Q${R1(tip[0])} ${R1(tip[1])} ${R1(OVER[last][0])} ${R1(OVER[last][1])}`
    + OVER.slice(HAND_FROM, last).reverse().map(L_).join('');
  return { PTS, shape, outline };
}

const built = ARMS.map((seg, i) => buildArm(seg, i === 1));

// ⚠ manifold damped for this piece only — see the note at the top. Module-level state, so
// it is saved and restored.
const _mf = getManifold();
setManifold(0.03);

function paint(arm) {
  const out = [];
  // SOLID first — a stroke-built shape never tiles itself completely, and without a base
  // the fill shows the ground through its gaps and reads as dirty.
  out.push(`<path d="${arm.shape}" fill="#eed79a"/>`); counter.n++;
  const PTS = arm.PTS;
  // ⚠ SAMPLE PAST BOTH ENDS. Fred boxed the arm tips: "fill the part where i put yellow
  // box as impasto too. a part of the light's hand." They were coming out as flat pale
  // patches with the solid base showing through, and the cause is that strokes() centres
  // each mark on its sample point and runs it ALONG the axis — so marks near t=0 and t=1
  // lose half their length to the clip and the last couple of units never get covered.
  // Extending the sample line a few steps beyond each end fixes it: those extra marks are
  // trimmed by the clip path, but what survives paints the caps properly.
  const EXT = [], n0 = PTS.length, PAD = 5;
  const b0 = [PTS[0][0] - PTS[1][0], PTS[0][1] - PTS[1][1]];
  for (let k = PAD; k >= 1; k--) EXT.push([PTS[0][0] + b0[0] * k, PTS[0][1] + b0[1] * k]);
  for (const p of PTS) EXT.push(p);
  const b1 = [PTS[n0 - 1][0] - PTS[n0 - 2][0], PTS[n0 - 1][1] - PTS[n0 - 2][1]];
  for (let k = 1; k <= PAD; k++) EXT.push([PTS[n0 - 1][0] + b1[0] * k, PTS[n0 - 1][1] + b1[1] * k]);
  strokes(out, counter, {
    rng, n: 520,
    sample: r => {
      const i = Math.min(EXT.length - 2, Math.floor(r() * (EXT.length - 1)));
      const a = EXT[i], b = EXT[i + 1];
      const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy) || 1;
      // t of the underlying arm, clamped, so the caps use the end widths
      const t = Math.max(0, Math.min(1, (i - PAD) / (n0 - 1)));
      const off = (r() + r() - 1) * halfW(t) * 1.15;   // a hair wide; the clip trims it
      return [a[0] + (-dy / len) * off, a[1] + (dx / len) * off];
    },
    dir: (x, y) => {
      let best = 0, bd = 1e9;
      for (let i = 0; i < PTS.length - 1; i++) {
        const d = Math.hypot(PTS[i][0] - x, PTS[i][1] - y);
        if (d < bd) { bd = d; best = i; }
      }
      const a = PTS[best], b = PTS[Math.min(best + 1, PTS.length - 1)];
      return Math.atan2(b[1] - a[1], b[0] - a[0]);
    },
    // floor clear of L.body's dark stops; the variation lives among the light ones
    col: (x, y, r) => jig(ramp(L.body, 0.38 + Math.max(0, Math.min(1, 0.6 - y / 26)) * 0.22 + r() * 0.26), r, 7),
    // ⚠ impasto ON — Fred: "impasto should be on". It is safe now that the ramp floor is
    // lifted: the relief shadow is a darkened version of ITS OWN mark, so on pale gold it
    // reads as raised paint instead of the grime it made when the marks were dark.
    len: 4.2, lw: 2.3, steps: 2, lenJ: 0.5, wJ: 0.4, relief: 0, impasto: 0.4, op: 1,
  });
  return out;
}

const painted = built.map(paint);
setManifold(_mf);   // ⚠ put the engine's rate back — it is module-level state

const vb = { x0: -36, y0: -24, w: 72, h: 48 };   // symmetric, so the image centre IS the origin
// (grown from 68x42 when the arms were extended up and out — HELD r/aspect follow)
// each arm: clip its own brushwork, then lay its own open outline. Drawn one after the
// other, so the near hand's outline crosses the far hand's fill and the two read apart.
const body = built.map((arm, i) =>
  `<defs><clipPath id="arm${i}"><path d="${arm.shape}"/></clipPath></defs>`
  + `<g clip-path="url(#arm${i})" opacity="${BODY_ALPHA}">${painted[i].join('')}</g>`
  + `<path d="${arm.outline}" fill="none" stroke="${OUTLINE}" stroke-width="${R1(OUT_W)}"`
  + ` stroke-opacity="${OUTLINE_ALPHA}" stroke-linecap="round" stroke-linejoin="round"/>`
).join('');
const svg = `<svg viewBox="${vb.x0} ${vb.y0} ${vb.w} ${vb.h}" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;

const PX = 8;
const W = Math.round(vb.w * PX), H = Math.round(vb.h * PX);
const html = `<!doctype html><html><head><meta charset="utf-8"><style>
html,body{margin:0;padding:0;width:${W}px;height:${H}px;overflow:hidden;background:transparent}
svg{display:block;width:${W}px;height:${H}px}
</style></head><body>${svg}</body></html>`;
const tmpHtml = join('/tmp', 'vg-light-hands.html'), tmpPng = join('/tmp', 'vg-light-hands.png');
writeFileSync(tmpHtml, html);
execFileSync(CHROME, ['--headless', '--disable-gpu', '--enable-unsafe-swiftshader',
  `--screenshot=${tmpPng}`, '--virtual-time-budget=60000', `--window-size=${W},${H}`,
  '--hide-scrollbars', '--force-device-scale-factor=1', '--default-background-color=00000000',
  pathToFileURL(tmpHtml).href], { stdio: 'pipe' });

const dst = join(DIR, '..', 'cast');
mkdirSync(dst, { recursive: true });
execFileSync('cp', [tmpPng, join(dst, 'light-hands.png')]);
try {
  execFileSync('python3', ['-c',
    'import sys;from PIL import Image;Image.open(sys.argv[1]).convert("RGBA").save(sys.argv[2],"WEBP",quality=95,method=6)',
    join(dst, 'light-hands.png'), join(dst, 'light-hands.webp')], { stdio: 'pipe' });
} catch (e) { console.warn('  ! webp conversion failed — the .png still ships'); }
console.log(`cast/light-hands.png (+webp) — ${counter.n} marks, ${W}x${H}px`);
console.log(`  viewBox ${vb.w}x${vb.h} plate units → HELD { x: 342.5, y: 352, r: ${vb.w / 2}, aspect: ${vb.h} / ${vb.w} }`);
console.log(`  two separate hands; outline on the underside + hand only; impasto on`);
