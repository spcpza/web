// ═══════════════════════════════════════════════════════════════════════════
//  THE SNOWFLAKE LAW
//  ─────────────────
//  Fred: "can we somehow create a fractal code so that we can generate
//  snowflakes that are all snowflakes but they are all fractally different.
//  i want the whole 33 pages to have the same 'fingerprint' so to say, but
//  all is a different snowflake (different art and scene)."
//
//  A snowflake is not random and it is not repeated. Every one obeys the same
//  law — hexagonal, six arms growing by one rule — and no two are alike,
//  because each grew through its own history of temperature and vapour. The
//  law is the fingerprint. The history is the snowflake.
//
//  So this file holds TWO things and keeps them apart:
//
//    LAW      — the invariants. Identical on all 33 pages. Not parameters,
//               not random, never drawn from a seed. This is the hand.
//    HISTORY  — a seed chain. BOOK → page → region → object → mark, the SAME
//               derivation at every scale, each level growing out of its
//               parent. This is what makes each page its own snowflake.
//
//  ⚠ THE GENOME VARIES THE HAND, NEVER THE STORY. Whether a page is night or
//  dawn, where the light stands, who is in it, what it means — authored, and
//  authored alone. A seed may decide how long this page's strokes run; it may
//  never decide that the grave is bright. Anything a reader would call
//  MEANING stays out of here. "Everything is provisional except scripture."
// ═══════════════════════════════════════════════════════════════════════════

export const BOOK = 'balthazar/33';

// ── the derivation, used identically at every scale ────────────────────────
// FNV-1a over the node's full path. Two properties that matter:
//   • deterministic — the same path always gives the same value, on any
//     machine, in any order, today or in a year;
//   • NAMED, not sequential — a trait is hashed from its own name, so adding
//     a new trait next month does NOT reshuffle every trait drawn before it.
//     (A plain rng() stream would: one extra call and all 33 pages change.)
function fnv(s) {
  let h = 0x811c9dc5 >>> 0;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return h >>> 0;
}
const unit = (path, name) => fnv(path + '·' + name) / 4294967296;

// A node in the chain. Every scale — book, page, grove, tree, blade — is one
// of these, and they all offer the same four verbs. That sameness IS the
// fractal: one rule, applied to its own output, forever.
export function node(path) {
  return {
    path,
    seed: fnv(path),
    /** a number in [lo,hi]; curve>1 crowds toward lo, <1 toward hi */
    trait: (name, lo, hi, curve = 1) => lo + (hi - lo) * Math.pow(unit(path, name), curve),
    /** one of a list */
    pick: (name, arr) => arr[Math.min(arr.length - 1, (unit(path, name) * arr.length) | 0)],
    /** a coin weighted p */
    chance: (name, p) => unit(path, name) < p,
    /** a signed number in [-m,m] */
    swing: (name, m) => (unit(path, name) * 2 - 1) * m,
    /** the next scale down — same verbs, its own history */
    child: (label) => node(path + '/' + label),
    /** a plain seeded rng, for places that still want a stream */
    rng: () => { let s = fnv(path) || 1; return () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; },
  };
}

export const book = node(BOOK);
export const page = (name) => book.child(name);

// ── LAW: what every page shares, stated once ──────────────────────────────
// These are not tunable. They are the fingerprint. A page that breaks one of
// them is not a different snowflake, it is a different substance.
export const LAW = Object.freeze({
  marks:  'short curved strokes, each holding its own value; nothing is a flat fill',
  light:  'ONE honest source per page; warm toward it, deepen away; crown lit, belly deep',
  value:  'no black; bright only reads against dark',
  line:   'living things curve, made things run straight (Munch)',
  order:  'form before detail — horizon, vanishing point, scale gradient, THEN texture',
  motion: 'the boil: redraw the whole painting, never slide a copy; one wind per page',
  story:  'sin → pure; the Light is a Person; Eden is the destination',
});

// ── HISTORY: the hand each page happens to have ───────────────────────────
// Every band below is inside the range Fred has already approved, so any draw
// is a page he would accept — the variation is the width of a good painter's
// day, not a dice roll between good and bad.
export function hand(name) {
  const p = page(name);
  return {
    path: p.path,
    stroke: {
      len:    p.trait('stroke.len', 3.6, 5.2),
      lw:     p.trait('stroke.lw', 1.5, 2.3),
      jitter: p.trait('stroke.jitter', 0.6, 0.95),
      curl:   p.trait('stroke.curl', 0.5, 1.6),
    },
    density:  p.trait('density', 0.86, 1.22),
    manifold: p.trait('manifold', 0.006, 0.02),     // site default 0.10 = confetti; rejected
    punch:    p.trait('punch', 0.16, 0.34),
    hueCast:  p.swing('hueCast', 12),               // degrees; a page's own cast
    wind: {
      dir:    p.chance('wind.dir', 0.5) ? 1 : -1,
      period: p.trait('wind.period', 18, 34),       // seconds for a gust to cross
    },
    boil: {
      n:      Math.round(p.trait('boil.n', 4, 7)),
      sec:    p.trait('boil.sec', 0.9, 1.3),
    },
    // the next scale down: any object on the page asks for its own history
    of: (kind, i) => p.child(kind + ':' + i),
  };
}

// ── the report: see the fingerprint and the variation at once ─────────────
export function report(names) {
  const rows = names.map((n) => {
    const H = hand(n);
    return [n.padEnd(11),
      H.stroke.len.toFixed(2), H.stroke.lw.toFixed(2), H.stroke.curl.toFixed(2),
      H.density.toFixed(2), H.manifold.toFixed(3), H.punch.toFixed(2),
      (H.hueCast >= 0 ? '+' : '') + H.hueCast.toFixed(1),
      (H.wind.dir > 0 ? '→' : '←') + H.wind.period.toFixed(0) + 's',
      H.boil.n + '×' + H.boil.sec.toFixed(2) + 's'].join('  ');
  });
  return ['page         len    lw   curl  dens  manif  punch   hue   wind    boil', ...rows].join('\n');
}
