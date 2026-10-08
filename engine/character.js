/* ep2/character.js v2 — ALL THE CHARACTERS LIVE HERE NOW.
   The paintings no longer carry any bodies: the plates bake only each
   figure's ground-pool and — for the Radiant One — the bloom and rays that
   light the scene. This file draws every character at view-time:
     · the little pilgrim (red cloak, pale mask, big eyes) — breathes, sways,
       blinks, his gaze wanders; cartoon mitten-nub hands.
     · the townsfolk (same body, their own cloak colours), heads down.
     · the RADIANT ONE — tall serene ivory mask, calm crescent eyes, a small
       three-point crown, long gold robe with sleeves. She sways only as slow
       as breath and NEVER blinks — "he that keepeth thee will not slumber"
       (Ps 121:4).
   Desktop: the overlay maps plate coords through the <img>'s object-fit.
   Phone tilt (pano): the overlay adopts the paint-live panorama's size and
   follows its camera transform each frame, drawing at panorama scale.
   prefers-reduced-motion: one still frame, no loop. */
(function () {
  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var book = document.getElementById('book');
  if (!book) return;
  var pages = [].slice.call(book.querySelectorAll('.page'));

  var RED = ['#dc3f2c', '#b0271c', '#7a160e'];
  var MASKC = ['#f6efdc', '#e8dfc4', '#c4b898'];
  var FOLKMASK = ['#ded8ca', '#c8c0ac', '#a89e84'];
  var INK = '#150a0b';
  var GOLD_OUT = '#4a2c0c';

  /* ---------- the cast, page by page (plate viewBox coords) ---------- */
  var CAST = {
    0:  { fx0: 244, actors: [
          { t: 'p', x: 356, y: 442, h: 54, facing: 1, lean: 3, eye: [1, -0.85], mood: 'open', stride: 0.55, lift: 0.5, wind: -0.35, staff: 1, armR: [372, 410] } ] },
    1:  { fx0: 249, actors: [
          { t: 'r', x: 442, y: 378, h: 118, facing: -1, lean: -13, headDrop: 9, armL: [403, 314] },
          { t: 'p', x: 388, y: 374, h: 62, facing: 1, lean: 2, eye: [1, -0.9], mood: 'wonder', stride: 0.45, lift: 0.35, wind: -0.2, armR: [403, 315], armL: [368, 346] } ] },
    2:  { fx0: 174, actors: [
          { t: 'p', x: 236, y: 474, h: 74, facing: 1, back: 1, stride: 0.1, wind: 0.35 } ] },
    3:  { fx0: 314, actors: [
          { t: 'p', x: 604, y: 366, h: 62, facing: -1, lean: -2, eye: [-1, 0.5], mood: 'wary', armL: [591, 334] } ] },
    4:  { fx0: 274, actors: [
          { t: 'r', x: 478, y: 272, h: 116, facing: -1, lean: -3, armR: [491, 176], armL: [438, 202] },
          { t: 'p', x: 196, y: 366, h: 52, facing: -1, lean: -3, eye: [-0.6, 1], mood: 'open', stride: 0.5, lift: 0.3, wind: 0.45, cols: ['#5a6a92', '#3d4a6a', '#252e48'], maskCols: FOLKMASK, folk: 1 },
          { t: 'p', x: 672, y: 358, h: 50, facing: 1, lean: 3, eye: [0.6, 1], mood: 'open', stride: 0.5, lift: 0.3, wind: -0.45, cols: ['#8a6a4a', '#6a4a30', '#40301e'], maskCols: FOLKMASK, folk: 1 },
          { t: 'p', x: 310, y: 452, h: 72, facing: 1, lean: 4, eye: [1, -1], mood: 'wonder', stride: 0.55, lift: 0.4, armR: [332, 406] } ] },
    5:  { fx0: 314, actors: [
          { t: 'r', x: 566, y: 288, h: 90, facing: 1, lean: 8, armL: [536, 208], armR: [600, 200], dance: 1 } ] },
    6:  { fx0: 274, actors: [
          { t: 'r', x: 444, y: 352, h: 96, facing: -1, kneel: 1, lean: -12, headDrop: 9, armL: [406, 300], armR: [414, 322] },
          { t: 'p', x: 400, y: 356, h: 60, facing: 1, lean: 3, mood: 'joy', stride: 0.2, lift: 0.4, armR: [409, 300], armL: [388, 301] } ] },
    7:  { fx0: 264, actors: [
          { t: 'p', x: 418, y: 452, h: 124, facing: 1, back: 1, lean: 3, stride: 0.6, lift: 0.45, wind: -0.45, armR: [464, 400] } ] },
    8:  { fx0: 284, actors: [
          { t: 'r', x: 606, y: 320, h: 100, facing: -1, lean: -9, armL: [566, 264], armR: [630, 268] },
          { t: 'p', x: 288, y: 428, h: 84, facing: 1, lean: 10, eye: [1, -0.3], mood: 'open', stride: 1, lift: 0.9, wind: -1, armR: [318, 386], armL: [262, 393] } ] },
    9:  { fx0: 274, actors: [
          { t: 'r', x: 428, y: 378, h: 108, facing: -1, lean: -6, armL: [388, 324], armR: [458, 316] },
          { t: 'p', x: 196, y: 436, h: 74, facing: 1, lean: 1, eye: [1, -0.6], mood: 'wonder' } ] },
    10: { fx0: 284, actors: [
          { t: 'p', x: 420, y: 442, h: 82, facing: 1, lean: 4, eye: [1, -0.5], mood: 'open', stride: 0.6, lift: 0.4, wind: -0.3 } ] },
    11: { fx0: 304, actors: [
          { t: 'p', x: 440, y: 400, h: 66, facing: 1, lean: 2, mood: 'joy', stride: 0.1, lift: 0.6, armR: [452, 341], armL: [424, 372] } ] },
    12: { fx0: 284, actors: [
          { t: 'r', x: 560, y: 400, h: 132, facing: -1, lean: -5, armL: [516, 332] },
          { t: 'p', x: 296, y: 428, h: 78, facing: 1, lean: 3, eye: [1, -1], mood: 'wonder', stride: 0.1, armR: [315, 372], armL: [304, 369] } ] },
    13: { fx0: 274, actors: [
          { t: 'r', x: 438, y: 352, h: 98, facing: -1, back: 1, lean: -3, armL: [414, 306] },
          { t: 'p', x: 400, y: 356, h: 56, facing: 1, back: 1, lean: 2, stride: 0.4, lift: 0.3, wind: 0.3, armR: [414, 307] } ] },
    14: { fx0: 244, actors: [
          { t: 'p', x: 428, y: 330, h: 62, facing: -1, lean: -2, mood: 'joy', armL: [408, 293] } ] },
  };

  function mixHex(a, b, t) {
    var A = parseInt(a.slice(1), 16), B = parseInt(b.slice(1), 16);
    var r = ((A >> 16) + (((B >> 16) - (A >> 16)) * t)) | 0;
    var g = (((A >> 8) & 255) + ((((B >> 8) & 255) - ((A >> 8) & 255)) * t)) | 0;
    var bl = ((A & 255) + (((B & 255) - (A & 255)) * t)) | 0;
    return 'rgb(' + r + ',' + g + ',' + bl + ')';
  }

  /* ================= THE LIVING SCENE — objects as code ================= */
  // faithful mini-ports of the atelier's painterly math (gen/engine.mjs), so
  // runtime objects keep the pressed plates' brush character.
  function mulberry32(seed) {
    var a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t2 = Math.imul(a ^ (a >>> 15), 1 | a);
      t2 = (t2 + Math.imul(t2 ^ (t2 >>> 7), 61 | t2)) ^ t2;
      return ((t2 ^ (t2 >>> 14)) >>> 0) / 4294967296;
    };
  }
  function vhash(ix, iy, seed) {
    var n = ix * 374761393 + iy * 668265263 + seed * 1442695041;
    n = (n ^ (n >> 13)) * 1274126177;
    return (((n ^ (n >> 16)) >>> 0) % 1024) / 1024;
  }
  function vnoise(x, y, seed) {
    var ix = Math.floor(x), iy = Math.floor(y), fx2 = x - ix, fy2 = y - iy;
    var a = vhash(ix, iy, seed), b = vhash(ix + 1, iy, seed);
    var c = vhash(ix, iy + 1, seed), d2 = vhash(ix + 1, iy + 1, seed);
    var ux = fx2 * fx2 * (3 - 2 * fx2), uy = fy2 * fy2 * (3 - 2 * fy2);
    return a + (b - a) * ux + (c - a) * uy + (a - b - c + d2) * ux * uy;
  }
  function fbm(x, y, seed) {
    return (vnoise(x, y, seed) + 0.5 * vnoise(x * 2.1, y * 2.1, seed + 7) + 0.25 * vnoise(x * 4.3, y * 4.3, seed + 13)) / 1.75;
  }
  function hx6(c) { var v = parseInt(c.slice(1), 16); return [v >> 16, (v >> 8) & 255, v & 255]; }
  function rgbS(r, g, b) {
    return 'rgb(' + Math.max(0, Math.min(255, r | 0)) + ',' + Math.max(0, Math.min(255, g | 0)) + ',' + Math.max(0, Math.min(255, b | 0)) + ')';
  }
  // ─── THE SNOWFLAKE LAW (runtime half of gen/genome.mjs — keep the two in step) ───
  // One derivation, used at every scale: BOOK → page → tree → its tuft. FNV-1a over the
  // node's PATH, and each trait hashed from its own NAME — so a trait added next month
  // does not reshuffle every tree drawn before it, the way an rng() stream would.
  var GBOOK = 'balthazar/33';
  function gFnv(s) {
    var h = 0x811c9dc5 >>> 0;
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
    return h >>> 0;
  }
  function gNode(path) {
    var u = function (name) { return gFnv(path + '\u00b7' + name) / 4294967296; };
    return {
      path: path,
      trait: function (n, lo, hi, curve) { return lo + (hi - lo) * Math.pow(u(n), curve || 1); },
      swing: function (n, m) { return (u(n) * 2 - 1) * m; },
      chance: function (n, p) { return u(n) < p; },
      pick: function (n, arr) { return arr[Math.min(arr.length - 1, (u(n) * arr.length) | 0)]; },
      child: function (l) { return gNode(path + '/' + l); },
    };
  }

  function rampC(cols, t) {
    t = Math.max(0, Math.min(1, t));
    var f = t * (cols.length - 1), i = Math.min(Math.floor(f), cols.length - 2), u = f - i;
    var A = hx6(cols[i]), B = hx6(cols[i + 1]);
    return [A[0] + (B[0] - A[0]) * u, A[1] + (B[1] - A[1]) * u, A[2] + (B[2] - A[2]) * u];
  }
  function jigC(rgb, rng, amt) {   // the shimmer + a taste of the manifold fleck
    if (rng() < 0.06) {
      var m = (rgb[0] + rgb[1] + rgb[2]) / 3;
      var FL = [[138, 18, 192], [47, 92, 240], [26, 166, 216], [31, 196, 106], [244, 200, 30], [255, 138, 20]];
      var f = FL[(rng() * FL.length) | 0], fm = (f[0] + f[1] + f[2]) / 3, k = m / Math.max(1, fm);
      return rgbS(f[0] * k, f[1] * k, f[2] * k);
    }
    var dr = (rng() * 2 - 1) * amt * 1.35, dg = (rng() * 2 - 1) * amt * 0.9, db = (rng() * 2 - 1) * amt * 1.35;
    return rgbS(rgb[0] + dr, rgb[1] + dg, rgb[2] + db);
  }
  var PALS = {
    1: ['#c83a82', '#e05a9a', '#f07ab0'],   // pink
    3: ['#3a6ad0', '#4a7ae0', '#6a9af0'],   // blue
    5: ['#d2922e', '#e6b34a', '#f6d06a'],   // amber
    2: ['#2c9a86', '#3ac0a0', '#5ad8b8'],   // teal
  };
  var FRUITC = ['#f6c63e', '#ee5c84', '#ffa53e', '#b77ce0', '#5ec0e0', '#f29ad0'];

  // A LIVING FRUIT TREE — same anatomy as gen/engine.mjs fruitTree, redrawn
  // each frame with its canopy swaying about the trunk's crown and the trunk
  // itself bowing a little; every stroke deterministic (seeded), only moved.
  // A STORYBOOK-CUPHEAD TREE: a curvy rubber-hose trunk + a bumpy canopy built
  // from overlapping lobes, given a bold "sticker" ink outline (fill the union a
  // little bigger in ink, then fill it in leaf) — clean shapes, flat colour with
  // one underside shadow + one rim-light, a few jewel berries. No leaf-noise.
  // (Sway is the CSS scSway on the sprite; this draws the tree at rest.)
  /* ============ FOLIAGE AS PAINT — ep1's jewel-mass, cached ============
     ep1 paints a canopy as ~w*2.4 INDIVIDUAL daubs, each pulling its own colour
     off a ramp, so foliage is a mass of many colours — not one flat green with a
     dark ellipse under it. Doing that per-frame would cost too much on a phone,
     so each canopy is painted ONCE into an offscreen sprite and blitted after.
     Rich like ep1, cheap like the blob it replaces. */
  var FOLIAGE = new Map();
  function foliageSprite(w, h, pal, seed, berries) {
    var key = (w | 0) + 'x' + (h | 0) + '|' + pal.join(',') + '|' + (seed | 0) + '|' + (berries | 0);
    var hit = FOLIAGE.get(key);
    if (hit) return hit;
    // ⚠⚠ THIS IS WHY THE SPRITE TREES LOOK SMOOTH AND THE PAINTED ONES LOOK BRUSHY.
    // Fred, circling one of each: "dont you see the difference in style/resolution/whatever
    // you wanna call it?" — and then the goal, exactly: "i want all the trees to be like this
    // pink tree, it MOVES, but i want it in the style of the black ring."
    // Two separate faults, both here:
    //   1 · RESOLUTION. The sprite canvas was built at PLATE scale — a crown 20 units wide
    //       became a ~52px bitmap — and then blitted into a context scaled by V.S * dpr, so
    //       on a diorama page it was stretched ~3x and on retina ~6x. Everything soft and
    //       vector-looking. It is now supersampled and blitted back down at its true size.
    //   2 · MARK COUNT AND SIZE. 60 marks each a fifth of the crown wide is a handful of
    //       big soft blobs. The painted trees lay THOUSANDS of small leaf strokes — that is
    //       the "style", and it is nothing more mysterious than more, smaller marks.
    var SS = 3;                                                       // supersample factor
    var pad = Math.max(8, w * 0.3);
    var cw = Math.ceil(w * 2 + pad * 2), chh = Math.ceil(h * 2 + pad * 2);
    var cv = document.createElement('canvas');
    cv.width = Math.ceil(cw * SS); cv.height = Math.ceil(chh * SS);
    var c = cv.getContext('2d');
    c.scale(SS, SS);                                                  // draw in plate units, store at SSx
    var ox = cw / 2, oy = chh / 2;
    var rnd = mulberry32(seed || 7);
    var n = Math.max(420, Math.round(w * 26));                        // was max(60, w*2.6)
    c.lineCap = 'round';
    for (var i = 0; i < n; i++) {
      // sample inside the canopy dome, denser toward the middle
      var a = rnd() * 6.2832, dd = Math.pow(rnd(), 0.58);
      var x = ox + Math.cos(a) * w * dd, y = oy + Math.sin(a) * h * dd;
      // EVERY DAUB ITS OWN COLOUR — a spatial wave + jitter across the palette,
      // exactly the variety ep1's ramp(cols, fbm + rnd) gives.
      var wave = (Math.sin(x * 0.09) * Math.cos(y * 0.11) + 1) / 2;
      var col = rampC(pal, Math.max(0, Math.min(1, wave * 0.62 + rnd() * 0.42)));
      // the underside sits deeper, the crown catches light — form, by value
      // ⚠ THE LIGHT IS ABOVE, SO THE CROWN GOES YELLOW AND THE BELLY GOES DEEP AND COOL.
      // Fred's rule, in his words: "the top part of the tree is kind of yellow, and the bottom
      // darker. this is consistent with real life because there is a light source above!"
      // The old shift was a flat RGB lift of ±44/40/30 — the top got LIGHTER but never
      // WARMER, which gives a grey-green ball rather than a lit tree. Sunlight is yellow, so
      // leaves facing up go yellow-green; leaves underneath are lit only by bounce and sky, so
      // they go darker AND cooler. Red falls fastest at the belly, which is what leaves the
      // shadow blue-green instead of merely dim.
      // ⚠ This is `foliageSprite`, shared by drawTree AND drawBush — every runtime tree and
      // bush in the book reads by this one rule, and matches the painted ones in the plates
      // (see paintTree in gen/engine.mjs, which uses the same crown-warm / belly-deep ramp).
      var lift = Math.max(0, Math.min(1, (oy - y) / (h * 2) + 0.5));
      var warm = Math.pow(lift, 2.0);            // only the true crown takes the sun
      var deep = Math.pow(1 - lift, 1.5);
      var j = (rnd() - 0.5) * 22;
      var r2 = col[0] + j + warm * 78 - deep * 54;
      var g2 = col[1] + j + warm * 66 - deep * 44;
      var b2 = col[2] + j - warm * 6  - deep * 16;
      c.fillStyle = rgbS(r2, g2, b2);
      var len = w * (0.036 + rnd() * 0.05), lw = w * (0.016 + rnd() * 0.022);   // leaves, not blobs
      c.save(); c.translate(x, y); c.rotate(-1.2 + rnd() * 2.4);
      c.beginPath(); c.ellipse(0, 0, len, lw, 0, 0, 6.2832); c.fill();
      c.restore();
    }
    // jewel fruit + blossoms, painted as dabs (ep1's FRUIT_COLS / BLOSSOM_COLS)
    if (berries) {
      var FC = ['#f0c84a', '#ec6f9e', '#8fd0ee', '#f4a86a', '#c49ad8', '#f4e878'];
      var nf = 3 + ((w * 0.14) | 0);
      for (var f = 0; f < nf; f++) {
        var fa = rnd() * 6.2832, fd = Math.pow(rnd(), 0.5);
        var fx = ox + Math.cos(fa) * w * fd * 0.8, fy = oy + Math.sin(fa) * h * fd * 0.8;
        var fr = Math.max(2, w * 0.085) * (0.8 + rnd() * 0.5);
        c.fillStyle = 'rgba(20,26,18,0.35)';                       // its own little shadow
        c.beginPath(); c.ellipse(fx + fr * 0.18, fy + fr * 0.34, fr * 0.94, fr * 0.8, 0, 0, 6.2832); c.fill();
        c.fillStyle = FC[(rnd() * FC.length) | 0];
        c.beginPath(); c.ellipse(fx, fy, fr, fr * 0.88, rnd() * 1.2, 0, 6.2832); c.fill();
        c.fillStyle = 'rgba(255,250,235,.8)';
        c.beginPath(); c.arc(fx - fr * 0.3, fy - fr * 0.32, fr * 0.3, 0, 6.2832); c.fill();
      }
    }
    var sp = { cv: cv, ox: ox, oy: oy, w: cw, h: chh };
    if (FOLIAGE.size > 40) FOLIAGE.clear();                         // bounded cache — each entry is SS^2 bigger now
    FOLIAGE.set(key, sp);
    return sp;
  }
  function blitFoliage(ctx, sp, cx, cy, gl) {
    // ⚠ explicit destination size — the bitmap is SSx larger than the shape it represents
    var w = sp.w || sp.cv.width, h = sp.h || sp.cv.height;
    ctx.drawImage(sp.cv, cx - sp.ox, cy - sp.oy, w, h);
    if (gl > 0.02) {                                                // the light lands on it
      ctx.save(); ctx.globalAlpha = Math.min(0.5, gl * 0.5); ctx.globalCompositeOperation = 'lighter';
      ctx.drawImage(sp.cv, cx - sp.ox, cy - sp.oy, w, h); ctx.restore();
    }
  }

  function gl0b(L, x, y) { return Math.max(0, Math.min(1, L(x, y))); }
  function drawTree(ctx, T, t) {
    var cx = T.x, baseY = T.y, h = T.h, w = T.w;
    var L = T.light || function () { return 0; };
    var OUT = '#241a10', gw = Math.max(2.2, w * 0.09);
    var leaf = rampC(T.pal, 0.46), dk = rampC(T.pal, 0.15), lt = rampC(T.pal, 0.82);
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';

    // ⭐ AFTER HIS KIND (Sep 15). Fred: "make the trees different across the whole book… showcase
    // God's creations." The swaying sprites take a species too (`sp` on the spec): 'palm' (Ps 92:12),
    // 'cypress' (Isa 55:13), 'olive' (Ps 52:8), else the book's broadleaf. Same trunk, same tuft,
    // same light rule — the SILHOUETTE is the species', matching paintTree in gen/engine.mjs.
    var sp = T.sp || 'oak';
    var PAL = sp === 'olive' ? ['#26402c', '#456a48', '#749a70', '#a8c094', '#dbe8c4']
            : sp === 'cypress' ? ['#122820', '#1a3a28', '#25502f', '#36683a', '#4a7e44']
            : sp === 'palm' ? ['#1e4a24', '#2c6a30', '#3f8a3a', '#62a848', '#8fc25a'] : T.pal;
    // ---- trunk: a tapering, gently S-bent limb (sticker outline) ----
    var tw = Math.max(5, w * 0.34), topY = baseY - h * 0.5, bend = w * 0.13;
    if (sp === 'palm') { tw = Math.max(3.5, w * 0.2); topY = baseY - h * 0.74; bend = w * 0.34; }
    else if (sp === 'olive') { tw = Math.max(6, w * 0.5); topY = baseY - h * 0.36; bend = w * 0.24; }
    else if (sp === 'cypress') { tw = Math.max(2.5, w * 0.14); topY = baseY - h * 0.06; bend = 0; }
    function trunk(gr) {
      ctx.beginPath();
      ctx.moveTo(cx - tw * 0.5 - gr, baseY);
      ctx.quadraticCurveTo(cx - tw * 0.32 + bend, baseY - h * 0.28, cx - tw * 0.2, topY);
      ctx.lineTo(cx + tw * 0.2, topY);
      ctx.quadraticCurveTo(cx + tw * 0.32 + bend, baseY - h * 0.28, cx + tw * 0.5 + gr, baseY);
      ctx.closePath();
    }
    // ⚠ A TRUNK MADE OF TWO RECTANGLES IS A COMPUTER IMAGE. Fred: "make the tree trunk look
    // like it is painted and not like a computer image." It was a solid quad plus a lit rect
    // and a shadow rect — three flat fills, so the wood had no grain, no edge and no hand in
    // it, and every trunk on the page was identical. Painted bark is: many short strokes
    // running WITH the grain, each keeping its own value, a lit rim on the side facing the
    // light and a dark one opposite, and a few knots. Same anatomy as paintTree's trunk in
    // gen/engine.mjs, so the swaying trees and the painted ones are the same wood.
    trunk(0); ctx.fillStyle = '#7c5636'; ctx.fill();   // a bed, so gaps between strokes are never holes
    ctx.save(); trunk(0); ctx.clip();
    // ⚠ NOT TOO DARK, OR THE FILTER TURNS IT NAVY. The living-paint filter has a blue-violet
    // shadow floor — anything below roughly luminance 45 gets pulled cold — and the first
    // bark ramp bottomed out at [36,20,8], which came back on the page as near-black BLUE
    // wood. The whole ramp is lifted so even its darkest note stays brown.
    // ⚠ HEX STRINGS, NOT RGB TRIPLES. rampC() feeds each entry to hx6(), which does
    // c.slice(1) + parseInt(...,16) — hand it an array and slice returns a shorter ARRAY,
    // parseInt("46,26",16) is 70, and every stroke comes out rgb(0,0,70): navy wood.
    // That, not the filter, is what turned these trunks blue-black.
    var BARK = ['#4a2e1a', '#644024', '#805834', '#a07448', '#c49864'];
    var bseed = ((T.seed || 7) * 2654435761) & 0x7fffffff;
    var brnd = function () { bseed = (bseed * 1103515245 + 12345) & 0x7fffffff; return bseed / 0x7fffffff; };
    var nb = Math.max(70, Math.round(tw * h / 3.2));
    ctx.lineCap = 'round';
    for (var bi = 0; bi < nb; bi++) {
      var bu = brnd();
      var by = topY - 2 + bu * (baseY - topY + 4);
      var taper = 0.55 + 0.45 * bu;                                   // wider at the foot
      var bx = cx + (brnd() - 0.5) * tw * 1.02 * taper + bend * (1 - bu) * 0.6;
      var side = (bx - cx) / Math.max(1, tw * 0.5 * taper);           // -1 lit .. +1 shadow
      var tt = Math.max(0, Math.min(1, 0.62 - side * 0.4 + (brnd() - 0.5) * 0.26));
      var bc = rampC(BARK, tt);
      ctx.strokeStyle = 'rgba(' + (bc[0] | 0) + ',' + (bc[1] | 0) + ',' + (bc[2] | 0) + ','
                      + (0.55 + brnd() * 0.45).toFixed(2) + ')';
      ctx.lineWidth = tw * (0.07 + brnd() * 0.1);
      var blen = h * (0.03 + brnd() * 0.07);                           // short, with the grain
      ctx.beginPath();
      ctx.moveTo(bx, by - blen / 2);
      ctx.quadraticCurveTo(bx + (brnd() - 0.5) * tw * 0.16, by, bx, by + blen / 2);
      ctx.stroke();
    }
    for (var kk = 0; kk < 2; kk++) {                                   // a knot or two
      var ky = topY + (0.2 + brnd() * 0.6) * (baseY - topY);
      var kx = cx + (brnd() - 0.5) * tw * 0.5;
      ctx.fillStyle = 'rgba(84,54,30,.45)';
      ctx.beginPath(); ctx.ellipse(kx, ky, tw * 0.16, tw * 0.1, brnd(), 0, 6.2832); ctx.fill();
    }
    ctx.restore();
    // the rims — one lit, one dark, which is what gives a trunk its roundness
    ctx.save(); ctx.lineCap = 'round';
    ctx.strokeStyle = 'rgba(186,140,86,.55)'; ctx.lineWidth = Math.max(1, tw * 0.1);
    ctx.beginPath();
    ctx.moveTo(cx + tw * 0.30, baseY - 1);
    ctx.quadraticCurveTo(cx + tw * 0.18 + bend, baseY - h * 0.28, cx + tw * 0.12, topY + 2);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(74,46,26,.45)'; ctx.lineWidth = Math.max(1, tw * 0.12);
    ctx.beginPath();
    ctx.moveTo(cx - tw * 0.34, baseY - 1);
    ctx.quadraticCurveTo(cx - tw * 0.24 + bend, baseY - h * 0.28, cx - tw * 0.14, topY + 2);
    ctx.stroke();
    ctx.restore();

    // ---- grass at the foot ----
    // ⚠ A trunk that stops dead on the ground reads as a STICKER pasted on the field.
    // Fred: "make the tree trunk have a bit of grass in the bottom so that it blends with
    // the background better." So the tree grows OUT of a tuft: a soft contact shadow, then
    // blades that cross in front of the foot, tips lighter than bases (the light is above),
    // the whole tuft warmed or deepened by THIS page's own light so a night tree keeps a
    // night tuft. Blades rise from baseY — the sprite box only holds 2px below it.
    var gmix = function (c, o, k) { return [c[0] + (o[0] - c[0]) * k, c[1] + (o[1] - c[1]) * k, c[2] + (o[2] - c[2]) * k]; };
    var GRASS = T.grass || ['#26512a', '#376f31', '#57943c', '#86b851', '#bcd76e'];
    var glf = Math.max(0, Math.min(1, L(cx, baseY)));
    var WARM = [255, 246, 200], DEEP = [30, 44, 52];
    function gcol(v, lift) {
      var c = rampC(GRASS, v);
      c = gmix(c, WARM, glf * (0.11 + lift * 0.18));   // a light lift; a heavy one bleaches the tuft pale
      c = gmix(c, DEEP, (1 - glf) * 0.28);   // gentle: a hard deepen made a black smudge on a lit field
      if (typeof P !== 'undefined') c = gmix(c, TINT, Math.abs(P.tint) * 0.16);   // this tuft's own cast
      return 'rgb(' + (c[0] | 0) + ',' + (c[1] | 0) + ',' + (c[2] | 0) + ')';
    }
    // ⚠ EVERY TREE GETS ITS OWN TUFT. Fred: "make it so every tree has different pattern
    // grass — AI computer excellence but with visible human touch." Seeded jitter alone does
    // NOT do that: identical distribution parameters produce the same symmetric fan every
    // time, and a repeated shape is the machine tell no matter how random its speckle. So the
    // seed first draws a PERSONALITY — how thick, how long, how wide it skirts, which side it
    // piles on, how hard it curls, hair-fine or strap-broad, where its bare patch sits — and
    // then the blades are drawn under that character. Some tufts get seed-stalks, some a
    // flower or two, some show a bit of root. That is the hand in it.
    // its history: this book → this page → this tree → the grass at its foot
    var GT = gNode(GBOOK + '/p' + (T.idx == null ? 0 : T.idx) + '/tree:' + (T.seed || 0)).child('tuft');
    var P = {
      dens:   GT.trait('dens', 0.55, 1.75),      // sparse .. thick
      len:    GT.trait('len', 0.72, 1.58),       // cropped .. long meadow
      skirt:  GT.trait('skirt', 0.7, 1.7),       // tight collar .. wide skirt
      skew:   GT.swing('skew', 0.8),             // which side the mass piles on
      curl:   GT.trait('curl', 0.35, 2.05),      // stiff .. fountain
      strap:  GT.trait('strap', 0.65, 1.8),      // hair-fine .. broad leaf
      gapX:   GT.swing('gapX', 1),               // where its bare patch sits
      gapW:   GT.chance('gapAt', 0.45) ? GT.trait('gapW', 0.16, 0.58) : 0,
      clumps: Math.round(GT.trait('clumps', 2, 10)),
      tint:   GT.swing('tint', 0.45),            // a shade cooler or yellower than its neighbours
      stalks: GT.chance('stalkAt', 0.42) ? Math.round(GT.trait('stalks', 2, 6)) : 0,
      bloom:  GT.chance('bloomAt', 0.38) ? Math.round(GT.trait('bloom', 1, 3)) : 0,
      root:   GT.chance('root', 0.3)             // a knuckle of root showing at the foot
    };
    var TINT = P.tint > 0 ? [150, 168, 62] : [34, 96, 96];   // yellow-green .. blue-green
    ctx.save();
    ctx.fillStyle = 'rgba(20,34,84,' + (0.10 + 0.20 * glf).toFixed(2) + ')';   // cool blue, to match the painted trees' groundShadow (Sep 21) — was a green-black
    ctx.beginPath();
    ctx.ellipse(cx + tw * (0.1 + P.skew * 0.4), baseY - 1, tw * (1.1 + P.skirt * 0.6),
                tw * (0.24 + brnd() * 0.2), 0, 0, 6.2832);
    ctx.fill();
    if (P.root) {                                          // a root knuckle breaking the soil
      ctx.fillStyle = 'rgba(96,64,38,.5)';
      ctx.beginPath();
      ctx.moveTo(cx - tw * 0.4, baseY - 1);
      ctx.quadraticCurveTo(cx - tw * (0.9 + P.skirt * 0.3), baseY - 2, cx - tw * 1.3, baseY + 1);
      ctx.lineTo(cx - tw * 1.25, baseY + 2);
      ctx.quadraticCurveTo(cx - tw * 0.85, baseY, cx - tw * 0.36, baseY + 1);
      ctx.closePath(); ctx.fill();
    }
    // chunky clumps first — the plate's own grass is fat daubs, not hairs, so a tuft of
    // pure thin blades reads as a different hand and the seam stays visible.
    for (var ci = 0; ci < P.clumps; ci++) {
      var mx = cx + (brnd() - 0.5) * tw * 3.2 * P.skirt + tw * P.skew * 0.5, mu = brnd();
      ctx.fillStyle = gcol(0.2 + mu * 0.45, mu);
      ctx.beginPath();
      ctx.ellipse(mx, baseY - h * 0.012 - brnd() * h * 0.03 * P.len,
                  tw * (0.2 + brnd() * 0.26) * P.strap, tw * (0.12 + brnd() * 0.15),
                  (brnd() - 0.5) * 0.9, 0, 6.2832);
      ctx.fill();
    }
    var ng = Math.max(18, Math.round(tw * 4.6 * P.dens));
    for (var gi = 0; gi < ng; gi++) {
      var bias = brnd(); bias = bias * bias;                 // crowd the blades AT the trunk
      var sgn = brnd() < 0.5 + P.skew * 0.22 ? 1 : -1;
      var gx = cx + sgn * bias * tw * 1.9 * P.skirt;
      if (P.gapW && Math.abs((gx - cx) / (tw * 1.9) - P.gapX) < P.gapW) continue;   // its bare patch
      var spread = Math.min(1, Math.abs(gx - cx) / (tw * 1.8));
      var tall = 0.45 + brnd() * 0.55;
      var gh = h * (0.07 + 0.11 * tall) * P.len * (1 - spread * 0.34);
      var lean = ((gx - cx) * 0.3 + (brnd() - 0.5) * tw * 0.7) * P.curl;
      var gw = Math.max(1.2, tw * (0.12 + brnd() * 0.13) * P.strap);
      var root = baseY + 1 - brnd() * gh * 0.12;
      ctx.fillStyle = gcol(0.04 + tall * 0.64 + (brnd() - 0.5) * 0.22, tall);   // wide value range = depth in the tuft
      ctx.beginPath();                                   // a tapered sliver, not a line
      ctx.moveTo(gx - gw * 0.5, root);
      ctx.quadraticCurveTo(gx + lean * 0.3, root - gh * 0.6, gx + lean, root - gh);
      ctx.quadraticCurveTo(gx + lean * 0.34 + gw * 0.4, root - gh * 0.55, gx + gw * 0.5, root);
      ctx.closePath(); ctx.fill();
      if (tall > 0.86) {                                 // a lit edge on the tallest blades only
        ctx.strokeStyle = gcol(0.82, 0.8); ctx.lineWidth = Math.max(0.7, gw * 0.4);
        ctx.beginPath();
        ctx.moveTo(gx + lean * 0.42, root - gh * 0.5);
        ctx.quadraticCurveTo(gx + lean * 0.72, root - gh * 0.8, gx + lean, root - gh);
        ctx.stroke();
      }
    }
    for (var si = 0; si < P.stalks; si++) {              // seed heads standing above the tuft
      var sx = cx + (brnd() - 0.5) * tw * 2.6 * P.skirt, sh = h * (0.19 + brnd() * 0.13) * P.len;
      var sl = (brnd() - 0.5) * tw * 1.5 * P.curl;
      ctx.strokeStyle = gcol(0.5 + brnd() * 0.3, 0.7); ctx.lineWidth = Math.max(0.7, tw * 0.05);
      ctx.beginPath();
      ctx.moveTo(sx, baseY);
      ctx.quadraticCurveTo(sx + sl * 0.4, baseY - sh * 0.6, sx + sl, baseY - sh);
      ctx.stroke();
      ctx.fillStyle = gcol(0.78, 1);
      ctx.beginPath();
      ctx.ellipse(sx + sl, baseY - sh, Math.max(0.8, tw * 0.07), Math.max(1.4, tw * 0.15),
                  sl * 0.03, 0, 6.2832);
      ctx.fill();
    }
    for (var fi = 0; fi < P.bloom; fi++) {               // a flower or two, because a field has them
      var fx = cx + (brnd() - 0.5) * tw * 3 * P.skirt, fy = baseY - h * (0.02 + brnd() * 0.07) * P.len;
      var fr = Math.max(1.1, tw * 0.13), FP = ['#f6f0e2', '#f3d3e4', '#e8e2f6', '#fbe9b6'];
      ctx.fillStyle = FP[(brnd() * FP.length) | 0];
      for (var pt = 0; pt < 5; pt++) {
        var an = pt * 1.2566 + brnd() * 0.3;
        ctx.beginPath();
        ctx.ellipse(fx + Math.cos(an) * fr * 0.8, fy + Math.sin(an) * fr * 0.6, fr * 0.55, fr * 0.42, an, 0, 6.2832);
        ctx.fill();
      }
      ctx.fillStyle = '#e8b23c';
      ctx.beginPath(); ctx.ellipse(fx, fy, fr * 0.34, fr * 0.28, 0, 0, 6.2832); ctx.fill();
    }
    ctx.restore();

    if (sp === 'palm') {                                   // ---- a PALM: rings, a fan of fronds, dates ----
      ctx.save(); ctx.lineCap = 'round';
      for (var ri = 0; ri < 14; ri++) {                    // the ring scars of every frond it has dropped
        var ru = (ri + 0.5) / 14, ryy = baseY - (baseY - topY) * ru, rxx = cx + bend * (1 - ru) * 0.6 - bend * 0.3;
        ctx.strokeStyle = 'rgba(160,120,70,' + (0.25 + brnd() * 0.3).toFixed(2) + ')'; ctx.lineWidth = Math.max(0.8, tw * 0.12);
        ctx.beginPath(); ctx.moveTo(rxx - tw * 0.45 * (1 - ru * 0.4), ryy); ctx.lineTo(rxx + tw * 0.45 * (1 - ru * 0.4), ryy + 0.6); ctx.stroke();
      }
      var px0 = cx + bend * 0.7 - bend * 0.3, py0 = topY, FL = h * 0.34, NF = 9 + ((T.seed || 7) % 5);
      var fr = [];
      for (var fi2 = 0; fi2 < NF + 2; fi2++) {
        var dead = fi2 >= NF;
        var fa = dead ? (1.5708 + (fi2 % 2 ? 0.55 : -0.55)) : (-1.5708 + ((fi2 + 0.5) / NF - 0.5) * 4.1 + (brnd() - 0.5) * 0.16);
        var fl = FL * (dead ? 0.6 : 0.78 + brnd() * 0.38), flat = Math.abs(Math.cos(fa));
        var droop = dead ? 0 : fl * (0.18 + flat * 0.5);
        fr.push({ a: fa, L: fl, dead: dead, lit: 0.5 + 0.5 * Math.cos(fa + 1.5708),
                  c1: [px0 + Math.cos(fa) * fl * 0.62, py0 + Math.sin(fa) * fl * 0.62 - fl * 0.1], p2: [px0 + Math.cos(fa) * fl, py0 + Math.sin(fa) * fl + droop] });
      }
      var gl0 = Math.max(0, Math.min(1, L(px0, py0)));
      for (var fj = 0; fj < fr.length; fj++) {
        var F = fr[fj];
        var bz = function (t) { var u = 1 - t; return [u * u * px0 + 2 * u * t * F.c1[0] + t * t * F.p2[0], u * u * py0 + 2 * u * t * F.c1[1] + t * t * F.p2[1]]; };
        ctx.strokeStyle = F.dead ? '#7a5a30' : '#23401a'; ctx.lineWidth = Math.max(1.2, w * 0.06);
        ctx.beginPath(); ctx.moveTo(px0, py0); ctx.quadraticCurveTo(F.c1[0], F.c1[1], F.p2[0], F.p2[1]); ctx.stroke();
        var nl = Math.max(12, Math.round(F.L * 0.9));
        for (var li = 0; li < nl; li++) {
          var tt = 0.12 + (li + brnd() * 0.6) / nl * 0.88, pA = bz(tt), pB = bz(Math.min(1, tt + 0.03));
          var ta = Math.atan2(pB[1] - pA[1], pB[0] - pA[0]);
          var ll = F.L * 0.16 * (1 - tt * 0.35) * (0.7 + brnd() * 0.6);
          for (var sd2 = -1; sd2 <= 1; sd2 += 2) {
            var la = ta + sd2 * (0.95 + tt * 0.5);
            var cc = F.dead ? [150, 118, 70] : rampC(PAL, Math.min(0.999, 0.25 + F.lit * 0.5 + brnd() * 0.25));
            if (!F.dead) { var wm = F.lit * F.lit * (0.3 + gl0 * 0.5); cc = [cc[0] + (247 - cc[0]) * wm * 0.5, cc[1] + (240 - cc[1]) * wm * 0.5, cc[2] + (162 - cc[2]) * wm * 0.3]; }
            ctx.strokeStyle = rgbS(cc[0], cc[1], cc[2]); ctx.lineWidth = Math.max(1, w * 0.045);
            ctx.beginPath(); ctx.moveTo(pA[0], pA[1]); ctx.lineTo(pA[0] + Math.cos(la) * ll, pA[1] + Math.sin(la) * ll); ctx.stroke();
          }
        }
      }
      for (var dc = -1; dc <= 1; dc += 2) for (var di = 0; di < 10; di++) {   // the dates, two clusters under the crown
        var da = brnd() * 6.2832, dd = Math.pow(brnd(), 0.6);
        var dx = px0 + dc * w * 0.12 + Math.cos(da) * w * 0.1 * dd, dy = py0 + h * 0.05 + Math.sin(da) * h * 0.04 * dd, dr = Math.max(1, w * 0.035);
        ctx.fillStyle = ['#c47a2a', '#e09a3e', '#a85a1e'][(brnd() * 3) | 0];
        ctx.beginPath(); ctx.ellipse(dx, dy, dr, dr * 1.3, 0, 0, 6.2832); ctx.fill();
      }
      ctx.restore();
      return;
    }
    if (sp === 'cypress') {                                // ---- a CYPRESS: the dark flame ----
      ctx.save(); ctx.lineCap = 'round';
      var W2 = w * 0.55, y0 = baseY - h * 0.04, ns = Math.max(160, Math.round(W2 * h * 0.5));
      var litL = L(cx - w, baseY - h * 0.5) >= L(cx + w, baseY - h * 0.5) ? -1 : 1;
      for (var si2 = 0; si2 < ns; si2++) {
        var v = Math.pow(brnd(), 0.85), hw = W2 * Math.pow(Math.max(0, Math.sin(3.1416 * Math.min(1, v * 1.15))), 0.85) + 0.5;   // ⚠ sin(π) is a hair NEGATIVE, and a negative base to a fractional power is NaN
        var sx2 = cx + (brnd() + brnd() - 1) * hw, sy2 = y0 - v * h * 0.96;
        var side = (sx2 - cx) / hw * litL;
        var c2 = rampC(PAL, Math.max(0, Math.min(0.999, 0.2 + side * 0.25 + brnd() * 0.3)));   // ⚠ rampC does not clamp: t = 1 reads past the palette
        if (side > 0) { var wk = side * 0.25 * gl0b(L, sx2, sy2); c2 = [c2[0] + (247 - c2[0]) * wk, c2[1] + (240 - c2[1]) * wk, c2[2] + (162 - c2[2]) * wk * 0.5]; }
        else { c2 = [c2[0] * 0.75, c2[1] * 0.8, c2[2] * 0.85]; }
        ctx.strokeStyle = rgbS(c2[0], c2[1], c2[2]); ctx.lineWidth = Math.max(0.8, w * 0.05);
        var sl = h * 0.06 * (0.7 + 0.5 * (1 - v)), sa = -1.5708 + (sx2 - cx) * 0.02 + Math.sin(v * 9) * 0.3 + (brnd() - 0.5) * 0.5;
        ctx.beginPath(); ctx.moveTo(sx2, sy2); ctx.lineTo(sx2 + Math.cos(sa) * sl, sy2 + Math.sin(sa) * sl); ctx.stroke();
      }
      ctx.restore();
      return;
    }
    // ---- branches: the same rule applied to its own output ----
    // ⚠ EVERY TREE'S OWN SKELETON. Fred: "i want all the trees to have different branches as
    // well." A trunk with a fixed ellipse of leaves on top is one tree stamped N times. A real
    // tree is a RULE — a limb splits into limbs, each shorter, thinner and turned from its
    // parent — run until it runs out. That is the same rule at every scale, which is what a
    // fractal is and what a snowflake is: identical law, different history. So each limb asks
    // its OWN node in the chain (…/tree:N/branch/0/01/012) for how far it turns and how far it
    // reaches, and no two trees — or two limbs — come out the same.
    var GB = gNode(GBOOK + '/p' + (T.idx == null ? 0 : T.idx) + '/tree:' + (T.seed || 0)).child('branch');
    var B = {
      splits: GB.chance('three', 0.4) ? 3 : 2,
      spread: GB.trait('spread', 0.34, 0.95),      // how wide a fork opens
      ratio:  GB.trait('ratio', 0.6, 0.82),        // how much of its parent a limb keeps
      taper:  GB.trait('taper', 0.58, 0.78),
      lean:   GB.swing('lean', 0.34),              // the whole crown leans
      droop:  GB.swing('droop', 0.3),              // uplifted .. weeping
      depth:  Math.max(2, Math.round(GB.trait('depth', 2.2, 4.4))),
    };
    var tips = [];
    function limb(x0, y0, ang, len, wd, d, tag) {
      var N = GB.child(tag);
      var a = ang + N.swing('a', 0.16), bow = N.swing('bow', 0.3);
      var mx = x0 + Math.cos(a) * len * 0.5 - Math.sin(a) * len * bow * 0.35;
      var my = y0 + Math.sin(a) * len * 0.5 + Math.cos(a) * len * bow * 0.35;
      var x1 = x0 + Math.cos(a) * len, y1 = y0 + Math.sin(a) * len;
      var side = Math.max(-1, Math.min(1, (x1 - cx) / Math.max(1, w * 0.6)));
      var bc = rampC(BARK, Math.max(0, Math.min(1, 0.52 - side * 0.34 + N.swing('v', 0.14))));
      // limbs stand INSIDE the crown, in leaf shadow — left at full bark value they read as
      // rust-red sticks laid over the green. Sink them toward the canopy's own shadow so the
      // skeleton reads as structure the eye finds, not as drawing on top of the leaves.
      var SHD = [40, 54, 32], kk2 = 0.3 + 0.24 * (B.depth - d) / Math.max(1, B.depth);
      bc = [bc[0] + (SHD[0] - bc[0]) * kk2, bc[1] + (SHD[1] - bc[1]) * kk2, bc[2] + (SHD[2] - bc[2]) * kk2];
      ctx.strokeStyle = 'rgb(' + (bc[0] | 0) + ',' + (bc[1] | 0) + ',' + (bc[2] | 0) + ')';
      ctx.lineWidth = Math.max(0.8, wd);
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo(mx, my, x1, y1); ctx.stroke();
      if (d <= 0 || len < h * 0.03) { tips.push([x1, y1, len]); return; }
      var n = B.splits + (N.chance('extra', 0.18) ? 1 : 0);
      for (var i = 0; i < n; i++) {
        var f = n === 1 ? 0 : (i / (n - 1)) * 2 - 1;            // -1 .. +1 across the fork
        limb(x1, y1, a + f * B.spread + B.droop * 0.35 + N.swing('t' + i, 0.12),
             len * B.ratio * (1 - Math.abs(f) * 0.12) * (0.86 + N.trait('r' + i, 0, 0.28)),
             wd * B.taper, d - 1, tag + i);
      }
    }
    ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    limb(cx, topY + h * 0.04, -Math.PI / 2 + B.lean * 0.5, h * 0.17, tw * 0.62, B.depth, '0');
    ctx.restore();

    // ---- canopy ----
    // The crown envelope varies per tree too, and a couple of the outermost branch tips carry
    // their own smaller mass — so the SILHOUETTE follows the skeleton instead of every tree
    // wearing the same ellipse.
    var GC = GB.child('crown');
    var ccy = topY - h * (0.06 + GC.trait('rise', 0, 0.1));
    var cw = w * GC.trait('w', 0.9, 1.24), chh = h * GC.trait('h', 0.4, 0.54);
    if (sp === 'olive') { cw *= 1.3; chh *= 0.78; ccy += h * 0.04; }   // an olive is low and wide
    // PAINTED, not a flat lobe-fill: a mass of many-coloured daubs (ep1's tree)
    var gl = L(cx, ccy);
    blitFoliage(ctx, foliageSprite(cw * 0.86, chh * 0.92, PAL, T.seed || 7, (T.lite || sp === 'olive') ? 0 : 1),   // an olive carries no jewel fruit
                cx + GC.swing('off', w * 0.12), ccy, gl);
    tips.sort(function (a2, b2) { return Math.abs(b2[0] - cx) - Math.abs(a2[0] - cx); });
    var nc = Math.min(tips.length, GC.chance('three', 0.5) ? 3 : 2);
    var clw = Math.max(6, cw * 0.42), clh = Math.max(6, chh * 0.4);
    for (var ti2 = 0; ti2 < nc; ti2++) {
      var tp = tips[ti2];
      blitFoliage(ctx, foliageSprite(clw, clh, PAL, (T.seed || 7) + 91 + ti2, (T.lite || sp === 'olive') ? 0 : 1),
                  tp[0], tp[1], L(tp[0], tp[1]));
    }

    // (the jewel fruit are painted into the foliage sprite above)
  }

  // A LIVING BIRD — two wing-arcs flapping, drifting slowly across the sky,
  // wrapping around its little patch of morning.
  function drawBird(ctx, B, t) {
    var span = 8.5 * B.s;
    var range = B.range || 120;
    var x = B.x + Math.sin(t * (B.v || 0.11) + (B.phase || 0)) * range;
    var y = B.y + Math.sin(t * 0.23 + (B.phase || 0) * 3) * 9 * B.s;
    // flapAmt lets the two sheet frames strike clear UP / DOWN wing poses (a real beat)
    var flap = (B.flapAmt != null ? B.flapAmt : Math.sin(t * 5.2 + (B.phase || 0) * 7) * 4.6) * B.s;
    var base = B.col || '#3a5a8a';
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    // a tiny body + two wings that beat: high flap → raised (^), low/negative → down (v)
    function wing(dy, lw, col) {
      ctx.strokeStyle = col; ctx.lineWidth = lw;
      ctx.beginPath();
      ctx.moveTo(x - span, y - flap * 0.35 + dy);
      ctx.quadraticCurveTo(x - span * 0.34, y - flap + dy, x, y + dy);
      ctx.quadraticCurveTo(x + span * 0.34, y - flap + dy, x + span, y - flap * 0.35 + dy);
      ctx.stroke();
    }
    // form-shadow: a darker underwing sits just beneath, and a pale edge catches
    // the light on top — so the bird reads as a little body, not a flat silhouette.
    wing(1.1 * B.s, 2.3 * B.s, mixHex(base, '#0a1024', 0.5));
    wing(0, 1.9 * B.s, base);
    wing(-0.7 * B.s, 1.0 * B.s, mixHex(base, '#ffffff', 0.4));
  }

  // A LITTLE SHEEP — woolly, cel-shaded to match the book; grazes the meadow
  // and hops. Drawn once; the hop is a CSS transform in scene.js. (Ps 23; the
  // flock of the Good Shepherd — a friend for the child to find and tap.)
  function drawSheep(ctx, S) {
    var s = S.s || 1, f = S.facing || 1;
    var bx = S.x, gy = S.y;                          // body-centre x, ground y (feet)
    var rx = 15 * s, ry = 10 * s, by = gy - ry - 4.5 * s;
    var WOOL = '#f3edde', WOOLSH = '#d4c8ae', FACE = '#5c4b3b', FSH = '#463628';
    var LEG = '#7a5c3e';   // legs are warm brown, not ink
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    // legs + hooves
    ctx.strokeStyle = LEG; ctx.lineWidth = 3 * s;
    var legs = [-0.5, -0.18, 0.2, 0.5];
    legs.forEach(function (o) { var lx = bx + o * rx * 1.3; ctx.beginPath(); ctx.moveTo(lx, by + ry * 0.4); ctx.lineTo(lx, gy); ctx.stroke(); });
    ctx.fillStyle = '#5a4028'; legs.forEach(function (o) { var lx = bx + o * rx * 1.3; ctx.beginPath(); ctx.ellipse(lx, gy, 2 * s, 1.4 * s, 0, 0, 6.2832); ctx.fill(); });
    // WOOL — a full ring of bumps + a core (no ink ring; a soft wool-shadow rim
    // gives just enough edge to read the woolly form against a bright meadow)
    var ring = [[bx, by, rx * 0.96]], bumps = 11;
    for (var i = 0; i < bumps; i++) { var a = i / bumps * 6.2832; ring.push([bx + Math.cos(a) * rx * 0.92, by + Math.sin(a) * ry * 0.9, (3.6 + (i % 2 ? 0.9 : 0)) * s]); }
    ctx.fillStyle = '#b8ab90'; ring.forEach(function (l) { ctx.beginPath(); ctx.arc(l[0], l[1], l[2] + 1.1 * s, 0, 6.2832); ctx.fill(); });
    // each curl its OWN tone and tilt — wool is a mass of curls, not a row of
    // identical bubbles (the same law as the foliage: no two marks alike)
    ring.forEach(function (l, i) {
      var v = ((i * 37) % 11) / 11;                       // a stable per-curl variation
      ctx.fillStyle = rgbS(243 - v * 26, 237 - v * 24, 222 - v * 20);
      ctx.beginPath(); ctx.ellipse(l[0], l[1], l[2] * (1 + v * 0.14), l[2] * (0.86 + v * 0.1), i * 0.7, 0, 6.2832); ctx.fill();
    });
    // belly shadow (clip to core)
    ctx.save(); ctx.beginPath(); ctx.arc(bx, by, rx * 0.96, 0, 6.2832); ctx.clip();
    ctx.fillStyle = WOOLSH; ctx.globalAlpha = 0.6;
    ctx.beginPath(); ctx.ellipse(bx, by + ry * 0.55, rx, ry * 0.62, 0, 0, 6.2832); ctx.fill();
    ctx.globalAlpha = 1; ctx.restore();
    // HEAD — a friendly 3/4 face (no ink; a soft face-shadow rim gives the edge)
    var hx = bx + f * rx * 1.0, hy = by + ry * 0.32;
    ctx.fillStyle = FSH; ctx.beginPath(); ctx.ellipse(hx, hy, 5.0 * s, 5.8 * s, f * 0.14, 0, 6.2832); ctx.fill();
    ctx.fillStyle = FACE; ctx.beginPath(); ctx.ellipse(hx, hy, 4.5 * s, 5.3 * s, f * 0.14, 0, 6.2832); ctx.fill();
    ctx.fillStyle = FSH; ctx.beginPath(); ctx.ellipse(hx + f * 1.3 * s, hy + 1.6 * s, 2.6 * s, 3.3 * s, 0, 0, 6.2832); ctx.fill();  // muzzle shadow
    // floppy ears — the face brown, a touch darker
    ctx.fillStyle = FSH;
    ctx.beginPath(); ctx.ellipse(hx - f * 3.6 * s, hy - 1.4 * s, 3.1 * s, 1.7 * s, f * 0.5, 0, 6.2832); ctx.fill();
    ctx.beginPath(); ctx.ellipse(hx + f * 3.4 * s, hy - 1.8 * s, 2.6 * s, 1.5 * s, -f * 0.5, 0, 6.2832); ctx.fill();
    // wool tufts on the brow (soft wool-shadow rim under, wool on top)
    function tuft(dx, dy, r) { ctx.fillStyle = '#b8ab90'; ctx.beginPath(); ctx.arc(hx + f * dx * s, hy + dy * s, r * s + 0.9 * s, 0, 6.2832); ctx.fill(); ctx.fillStyle = WOOL; ctx.beginPath(); ctx.arc(hx + f * dx * s, hy + dy * s, r * s, 0, 6.2832); ctx.fill(); }
    tuft(-0.8, -5, 3.2); tuft(1.8, -4.6, 2.1);
    // eyes + sparkle
    ctx.fillStyle = '#160f0a';
    ctx.beginPath(); ctx.arc(hx + f * 0.3 * s, hy - 0.6 * s, 1.1 * s, 0, 6.2832); ctx.fill();
    ctx.beginPath(); ctx.arc(hx + f * 2.5 * s, hy - 0.3 * s, 1.0 * s, 0, 6.2832); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.85)';
    ctx.beginPath(); ctx.arc(hx + f * 0.02 * s, hy - 1.0 * s, 0.42 * s, 0, 6.2832); ctx.fill();
    // rosy cheek + a calm little smile
    ctx.fillStyle = 'rgba(232,140,150,.4)'; ctx.beginPath(); ctx.arc(hx + f * 1.5 * s, hy + 2.1 * s, 1.6 * s, 0, 6.2832); ctx.fill();
    ctx.strokeStyle = '#160f0a'; ctx.lineWidth = 0.9 * s;
    ctx.beginPath(); ctx.moveTo(hx + f * 1.4 * s, hy + 2.9 * s); ctx.quadraticCurveTo(hx + f * 2.3 * s, hy + 3.7 * s, hx + f * 3.1 * s, hy + 2.8 * s); ctx.stroke();
  }

  // A STORYBOOK-CUPHEAD BUSH: a low cluster of rounded lobes, sticker-outlined,
  // flat leaf colour + one underside shadow + one rim-light + a couple berries.
  function drawBush(ctx, B, t) {
    var cx = B.x, baseY = B.y, w = B.w, h = B.h;
    var L = B.light || function () { return 0; };
    var OUT = '#221808', gw = Math.max(2, w * 0.1);
    var leaf = rampC(B.pal, 0.44), dk = rampC(B.pal, 0.14), lt = rampC(B.pal, 0.8);
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    var cy = baseY - h * 0.85;
    // a low dome + a RING of small bumps across the top — at bush sizes the fat
    // 5-lobe version melted into one blob (Fred: "what is the pink blob?");
    // smaller, denser bumps keep a readable scalloped bush silhouette.
    var lobes = [[cx, cy + h * 0.1, w * 0.62]];
    for (var bi = 0; bi < 7; bi++) {
      var ba = Math.PI * (0.08 + 0.84 * bi / 6);              // across the top arc
      lobes.push([cx - Math.cos(ba) * w * 0.72, cy - Math.sin(ba) * h * 0.72,
                  w * (bi % 2 ? 0.3 : 0.36)]);
    }
    // PAINTED, not one block of green — a jewel-mass of many-coloured daubs
    var gl = L(cx, cy);
    blitFoliage(ctx, foliageSprite(w * 0.92, h * 0.8, B.pal, B.seed || 9, 1), cx, cy + h * 0.06, gl);
  }

  // A STORYBOOK-CUPHEAD CROWN — canopy-only (for the tree of life, whose trunk
  // and HELD BOUGH stay pressed in the paint). Same sticker-lobe treatment as the
  // trees, a bit lusher with glowing jewel fruit. (Sway is the CSS on the sprite.)
  function drawCrown(ctx, C, t) {
    var cx = C.cx, cy = C.cy, cw = C.cw, ch = C.ch;
    var L = C.light || function () { return 0; };
    var OUT = '#20180c', gw = Math.max(2.2, cw * 0.045);
    var leaf = rampC(C.pal, 0.46), dk = rampC(C.pal, 0.15), lt = rampC(C.pal, 0.82);
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    var lobes = [
      [cx, cy, cw * 0.5], [cx - cw * 0.55, cy + ch * 0.18, cw * 0.42], [cx + cw * 0.56, cy + ch * 0.14, cw * 0.4],
      [cx - cw * 0.3, cy - ch * 0.5, cw * 0.4], [cx + cw * 0.32, cy - ch * 0.46, cw * 0.42], [cx, cy + ch * 0.4, cw * 0.44],
      [cx - cw * 0.62, cy - ch * 0.16, cw * 0.32], [cx + cw * 0.64, cy - ch * 0.2, cw * 0.32],
    ];
    // PAINTED — the tree of life's crown as a jewel-mass, same as every canopy
    var gl = L(cx, cy);
    blitFoliage(ctx, foliageSprite(cw * 1.08, ch * 0.96, C.pal, C.seed || 911, 1), cx, cy + ch * 0.06, gl);
  }

  // THE ONE LITTLE FLOWER (the whisper's corner) — bold storybook-Cuphead style:
  // outlined stem + leaf, five rounded sticker petals, an orange heart. It NODS
  // toward the warm light (CSS scNod on the sprite).
  function drawFlower(ctx, F, t) {
    var nod = Math.sin(t * 1.1 + (F.phase || 0)) * 0.16 + Math.sin(t * 2.7) * 0.05;
    var bx = F.x, by = F.y, hh = F.h || 24;
    var tipX = bx + (F.lean || 0) * hh * 0.35 + nod * hh * 0.5;
    var tipY = by - hh + Math.abs(nod) * 2;
    var OUT = '#233618', side = (F.lean || 0) >= 0 ? 1 : -1;
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    // stem — a green stalk, a darker-green core for body (no black ink)
    function stem(lw, col) { ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(bx, by); ctx.quadraticCurveTo(bx + (tipX - bx) * 0.3, by - hh * 0.6, tipX, tipY); ctx.stroke(); }
    stem(4.0, '#3f7a2c'); stem(2.2, '#6cb84a');
    // one leaf
    var lmx = bx + (tipX - bx) * 0.5, lmy = by - hh * 0.44;
    function leaf(gr, col) { ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(lmx + side * 4, lmy, 5 + gr, 2.6 + gr, -side * 0.5, 0, 6.2832); ctx.fill(); }
    leaf(0.8, '#3f7a2c'); leaf(0, '#6cb84a');
    // petals — five rounded petals around the tip (no ink ring; a warm-gold underlay gives soft depth)
    var pr = Math.max(2.8, hh * 0.15), off = pr * 1.5;
    // PETALS — real petals, not five identical dots: each is an ellipse pointing
    // OUT from the heart, and each takes its own colour off the warm ramp, the way
    // ep1's flowers are painted. (A flower is a living thing — never a compass.)
    var PET = ['#f6c63e', '#f4b02e', '#ffd863', '#f0a83a', '#ffe07a'];
    for (var k = 0; k < 5; k++) {
      var a = -Math.PI / 2 + (k - 2) * 1.2566 + nod * 0.6;
      var px = tipX + Math.cos(a) * off, py = tipY + Math.sin(a) * off;
      ctx.fillStyle = '#c9891a';                                     // the petal's own shade beneath
      ctx.beginPath(); ctx.ellipse(px, py, pr * 1.5, pr * 0.98, a, 0, 6.2832); ctx.fill();
      ctx.fillStyle = PET[k % PET.length];
      ctx.beginPath(); ctx.ellipse(px, py, pr * 1.36, pr * 0.86, a, 0, 6.2832); ctx.fill();
      ctx.fillStyle = 'rgba(255,246,210,.5)';                        // light along its length
      ctx.beginPath(); ctx.ellipse(px + Math.cos(a) * pr * 0.3, py + Math.sin(a) * pr * 0.3, pr * 0.6, pr * 0.34, a, 0, 6.2832); ctx.fill();
    }
    // orange heart, soft + sparkle
    ctx.fillStyle = '#e8863a'; ctx.beginPath(); ctx.arc(tipX, tipY, pr * 0.85, 0, 6.2832); ctx.fill();
    ctx.fillStyle = 'rgba(255,240,200,.85)'; ctx.beginPath(); ctx.arc(tipX - pr * 0.25, tipY - pr * 0.28, pr * 0.3, 0, 6.2832); ctx.fill();
  }

  // THE WHALE'S SPOUT — a glad breath every few seconds (the body stays paint).
  function drawSpout(ctx, S, t) {
    var cyc = ((t + (S.phase || 0)) % 7) / 7;          // one breath each 7s
    if (cyc > 0.55) return;
    var p = cyc / 0.55;
    var rise = p * 34;
    ctx.lineCap = 'round';
    for (var i = 0; i < 6; i++) {
      var f = i / 6;
      if (f > p) continue;
      var yy = S.y - f * rise / Math.max(p, 0.01) * p;
      var spread = f * f * 9;
      var op = (1 - f * 0.6) * (1 - Math.max(0, p - 0.7) / 0.3);
      ctx.strokeStyle = 'rgba(240,250,255,' + Math.max(0, op * 0.9).toFixed(2) + ')';
      ctx.lineWidth = 2.4 - f;
      ctx.beginPath();
      ctx.moveTo(S.x - 1 - spread * 0.4, S.y - f * rise);
      ctx.quadraticCurveTo(S.x - spread * 0.2, S.y - f * rise - 3, S.x + 1 + spread * 0.5, S.y - f * rise - 1);
      ctx.stroke();
    }
    if (p > 0.5) {
      var bp = (p - 0.5) / 0.5;
      for (var k2 = 0; k2 < 5; k2++) {
        ctx.fillStyle = 'rgba(255,255,255,' + (0.8 * (1 - bp)).toFixed(2) + ')';
        var ang = -Math.PI / 2 + (k2 - 2) * 0.5;
        ctx.beginPath();
        ctx.arc(S.x + Math.cos(ang) * (6 + bp * 10), S.y - rise + Math.sin(ang) * (5 + bp * 8), 1.6, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  function radial(cx, cy, reach) {
    return function (x, y) {
      var d = Math.hypot(x - cx, y - cy);
      return Math.max(0, 1 - d / reach);
    };
  }

  // A STORYBOOK LAMP POST — a made thing (crisp, straight; Munch), interactive:
  // tap to turn the flame on/off. Drawn UNLIT here (dark iron + dark glass); the
  // warm glow, flame and ground-pool are separate DOM layers scene.js toggles, so
  // the on/off transition is smooth. L = {x, baseY, h}.
  function drawLamp(ctx, L) {
    var x = L.x, baseY = L.baseY != null ? L.baseY : L.y, h = L.h || 120;
    var top = baseY - h;
    var IRON = '#33333f', IRONLT = '#565669', IRONDK = '#1c1c28', GLASS = '#20243a';
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    var pw = Math.max(2.6, h * 0.032);
    // base foot — a small stepped plinth
    ctx.fillStyle = IRONDK; ctx.beginPath(); ctx.ellipse(x, baseY, h * 0.072, h * 0.018, 0, 0, 6.2832); ctx.fill();
    ctx.fillStyle = IRON; ctx.fillRect(x - h * 0.05, baseY - h * 0.045, h * 0.1, h * 0.045);
    ctx.fillStyle = IRONDK; ctx.fillRect(x - h * 0.062, baseY - h * 0.055, h * 0.124, h * 0.014);
    // the post
    var postTop = top + h * 0.2;
    ctx.fillStyle = IRON; ctx.fillRect(x - pw / 2, postTop, pw, baseY - postTop - h * 0.04);
    ctx.fillStyle = IRONLT; ctx.fillRect(x - pw / 2, postTop, pw * 0.36, baseY - postTop - h * 0.04);   // lit edge (value, not ink)
    // a decorative collar
    ctx.fillStyle = IRONDK; ctx.fillRect(x - pw * 1.0, baseY - h * 0.42, pw * 2.0, pw * 0.9);
    // the lantern housing at the top
    var lw = h * 0.088, lh = h * 0.15, ly = postTop;    // glass box bottom sits at postTop
    // bracket/collar under the lantern
    ctx.fillStyle = IRON; ctx.fillRect(x - lw * 0.5, ly, lw, pw * 0.7);
    // glass frame (trapezoid) + dark glass
    ctx.fillStyle = IRON;
    ctx.beginPath(); ctx.moveTo(x - lw, ly); ctx.lineTo(x - lw * 0.72, ly - lh); ctx.lineTo(x + lw * 0.72, ly - lh); ctx.lineTo(x + lw, ly); ctx.closePath(); ctx.fill();
    ctx.fillStyle = GLASS;
    ctx.beginPath(); ctx.moveTo(x - lw * 0.78, ly - lh * 0.12); ctx.lineTo(x - lw * 0.56, ly - lh * 0.9); ctx.lineTo(x + lw * 0.56, ly - lh * 0.9); ctx.lineTo(x + lw * 0.78, ly - lh * 0.12); ctx.closePath(); ctx.fill();
    // two glazing bars
    ctx.strokeStyle = IRON; ctx.lineWidth = Math.max(1, h * 0.008);
    ctx.beginPath(); ctx.moveTo(x, ly - lh * 0.9); ctx.lineTo(x, ly - lh * 0.12); ctx.stroke();
    // roof cap + finial
    ctx.fillStyle = IRON;
    ctx.beginPath(); ctx.moveTo(x - lw * 1.12, ly - lh); ctx.lineTo(x, ly - lh * 1.62); ctx.lineTo(x + lw * 1.12, ly - lh); ctx.closePath(); ctx.fill();
    ctx.fillStyle = IRONDK; ctx.fillRect(x - lw * 1.12, ly - lh, lw * 2.24, h * 0.012);
    ctx.fillStyle = IRON; ctx.beginPath(); ctx.arc(x, ly - lh * 1.62 - h * 0.014, Math.max(1.8, h * 0.018), 0, 6.2832); ctx.fill();
  }

  PALS[0] = ['#7a4ab0', '#9a5ac8', '#b87ae0'];   // violet
  PALS[4] = ['#5a9a32', '#7ec044', '#a6dc5e'];   // green

  // the living objects, page by page
  var teachGlow = radial(438, 300, 300);
  var gateGlow = radial(508, 226, 250);
  var cryGlow = radial(478, 215, 290);
  var doorGlow = radial(400, 156, 300);          // gift: the OPEN DOOR is this page's light
  // ⚠ PALS HAS NO GREEN — it is pink/blue/amber/teal, for blossom trees. Passing PALS[1] made
  // the whole avenue cherry-pink. `drawTree` reads `pal` as a colour ARRAY through rampC, so
  // a leaf palette has to be supplied: the same crown-to-belly greens paintTree uses, so the
  // swaying trees and the painted ones are literally the same colours.
  var LEAFPAL = ['#1f4622', '#31612f', '#5a8b3c', '#8fb44e', '#c2d072'];
  var delightGlow = radial(452, 290, 260);
  var lifeGlow = radial(540, 250, 300);
  var pathDawn = radial(552, 258, 420);
  var gatesGlow = radial(352, 236, 300);
  var seekGlow = radial(596, 260, 320);
  var choiceGold = radial(690, 150, 330);
  var spillWarm = radial(758, 210, 300);
  var SCENE = {
    0: {
      trees: [],
      // no foliage ON the gilded road — the cover paints its own lilies there
      // (sprites clashed); life lives at the street EDGES and in the sky instead.
      bushes: [
        { x: 660, y: 470, w: 26, h: 15, pal: PALS[4], seed: 495, phase: 0.7 },
        { x: 96, y: 436, w: 22, h: 13, pal: PALS[4], seed: 497, phase: 2.9 },
      ],
      flowers: [
        { x: 508, y: 474, h: 20, lean: 0.3, phase: 0.9 },    // right verge, leaning up toward the gate (clear of the swipe hint)
        { x: 240, y: 500, h: 18, lean: 0.35, phase: 2.2 },   // at the whisper's corner, leaning AWAY to the light
      ],
      birds: [
        { x: 236, y: 106, s: 1, col: '#0e1130', phase: 0.5, v: 0.08, range: 90 },
        { x: 292, y: 132, s: 0.7, col: '#0e1130', phase: 2.6, v: 0.1, range: 70 },
        { x: 648, y: 88, s: 0.85, col: '#0e1130', phase: 4.9, v: 0.06, range: 110 },
        { x: 420, y: 70, s: 0.6, col: '#0e1130', phase: 1.7, v: 0.09, range: 95 },
        { x: 540, y: 142, s: 0.75, col: '#0e1130', phase: 3.9, v: 0.07, range: 105 },
      ],
      // street lamps to turn on as the evening comes (tap to light)
      lamps: [
        { x: 286, y: 500, h: 128 },
        { x: 520, y: 486, h: 116 },
      ],
    },
    1: {
      trees: [
        { x: 118, y: 392, h: 96, w: 38, pal: LEAFPAL, seed: 411, phase: 0.0, light: teachGlow },
        { x: 706, y: 352, h: 64, w: 26, pal: PALS[3], seed: 413, phase: 2.1, light: teachGlow },
        { x: 560, y: 330, h: 42, w: 17, pal: PALS[5], seed: 417, phase: 4.4, light: teachGlow, lite: 1 },
      ],
      birds: [
        { x: 300, y: 128, s: 0.9, phase: 0, v: 0.09, range: 150 },
        { x: 346, y: 108, s: 0.65, phase: 2.3, v: 0.12, range: 110 },
        { x: 560, y: 150, s: 0.8, phase: 4.1, v: 0.07, range: 170 },
      ],
      sheep: [
        { x: 636, y: 470, s: 1.1, facing: -1, phase: 0.4, light: teachGlow },
        { x: 708, y: 452, s: 0.82, facing: -1, phase: 2.3, light: teachGlow },
      ],
    },
    2: {   // the city of voices at dusk — swifts over the valley, an amber bush on the parapet
      bushes: [{ x: 610, y: 482, w: 28, h: 16, pal: PALS[4], seed: 491, phase: 1.1 }],
      birds: [
        { x: 420, y: 120, s: 0.8, col: '#171a38', phase: 0.3, v: 0.07, range: 130 },
        { x: 530, y: 92, s: 0.6, col: '#171a38', phase: 2.8, v: 0.1, range: 100 },
        { x: 310, y: 150, s: 0.7, col: '#171a38', phase: 4.4, v: 0.08, range: 110 },
      ],
    },
    3: { flowers: [
      { x: 560, y: 330, h: 23, lean: 0.3, phase: 1.1 },
      { x: 604, y: 296, h: 16, lean: 0.25, phase: 2.4 },   // a second bloom higher in the wall crack
    ] },
    4: {
      trees: [{ x: 112, y: 344, h: 58, w: 22, pal: PALS[0], seed: 431, phase: 2.0, light: cryGlow }],
      bushes: [
        { x: 610, y: 332, w: 26, h: 14, pal: PALS[4], seed: 433, phase: 1.3, light: cryGlow },
        { x: 700, y: 368, w: 24, h: 14, pal: PALS[4], seed: 435, phase: 2.6, light: cryGlow },
      ],
      birds: [
        { x: 300, y: 108, s: 0.75, col: '#1e1a3c', phase: 0.7, v: 0.08, range: 120 },
        { x: 520, y: 88, s: 0.6, col: '#1e1a3c', phase: 3.2, v: 0.1, range: 100 },
      ],
    },
    6: {
      trees: [
        { x: 688, y: 360, h: 66, w: 24, pal: PALS[2], seed: 441, phase: 0.7, light: delightGlow },
        { x: 748, y: 344, h: 52, w: 19, pal: PALS[0], seed: 443, phase: 2.9, light: delightGlow },
        { x: 636, y: 344, h: 44, w: 16, pal: PALS[5], seed: 447, phase: 5.1, light: delightGlow, lite: 1 },
      ],
      bushes: [{ x: 570, y: 372, w: 26, h: 15, pal: PALS[4], seed: 449, phase: 3.7, light: delightGlow }],   // teal leaf (pink lives in the berries — the flat pink read as a blob)
      spouts: [{ x: 100, y: 298, phase: 2 }],
      water: [{ x: 170, y: 312, w: 285, h: 20, n: 13, phase: 0 }],   // the young sea, glinting (left of the couple)
      sheep: [{ x: 516, y: 432, s: 1, facing: 1, phase: 1.2, light: delightGlow }],
      birds: [   // the first birds of the young world
        { x: 250, y: 118, s: 0.8, col: '#4a6a9a', phase: 0.9, v: 0.09, range: 140 },
        { x: 610, y: 96, s: 0.65, col: '#4a6a9a', phase: 3.4, v: 0.11, range: 110 },
      ],
    },
    7: {
      bushes: [{ x: 620, y: 420, w: 34, h: 19, pal: PALS[4], seed: 451, phase: 0.9, light: choiceGold }],
      flowers: [{ x: 588, y: 432, h: 20, lean: 0.35, phase: 1.4 }],   // on the bright way's verge, leaning up
      birds: [{ x: 300, y: 128, s: 0.7, col: '#1c1c40', phase: 1.9, v: 0.08, range: 120 }],
    },
    8: {
      bushes: [
        { x: 706, y: 442, w: 34, h: 20, pal: PALS[4], seed: 453, phase: 2.2, light: seekGlow },
        { x: 140, y: 470, w: 26, h: 15, pal: PALS[4], seed: 455, phase: 4.1, light: seekGlow },
      ],
      flowers: [{ x: 545, y: 425, h: 20, lean: 0.3, phase: 0.6 }],   // leaning toward her flood of light
    },
    11: {
      crowns: [
        { cx: 550, cy: 218, cw: 148, ch: 86, pal: PALS[2], seed: 461, phase: 0.0, light: lifeGlow },
        { cx: 478, cy: 244, cw: 84, ch: 54, pal: PALS[4], seed: 463, phase: 2.4, light: lifeGlow },
        { cx: 628, cy: 240, cw: 82, ch: 52, pal: PALS[5], seed: 467, phase: 4.7, light: lifeGlow },
      ],
      bushes: [{ x: 636, y: 400, w: 34, h: 20, pal: PALS[4], seed: 469, phase: 1.6, light: lifeGlow }],   // green leaf under the jewel crowns (was blob-pink)
      flowers: [
        { x: 208, y: 446, h: 22, lean: 0.2, phase: 0.5 },
        { x: 494, y: 468, h: 26, lean: -0.25, phase: 2.7 },
      ],
      sheep: [{ x: 148, y: 474, s: 0.95, facing: 1, phase: 1.9, light: lifeGlow }],   // green pastures (Ps 23)
    },
    13: {
      // ⚠ Sep 12 (Fred's eagle-eye pass): the far-left tree stood outside the tomb-glow's reach,
      // so its light was 0 and it drew as a BLACK claw under the poem. A night tree is still a
      // tree the moon can see: the light gets a floor.
      trees: [{ x: 118, y: 486, h: 58, w: 22, pal: LEAFPAL, seed: 471, phase: 1.8, light: function (x, y) { return 0.38 + 0.62 * pathDawn(x, y); } }],
      bushes: [{ x: 662, y: 442, w: 30, h: 17, pal: PALS[4], seed: 473, phase: 3.3, light: function (x, y) { return 0.3 + 0.7 * pathDawn(x, y); } }],
      sheep: [
        { x: 540, y: 476, s: 1.05, facing: -1, phase: 0.8, light: pathDawn },
        { x: 616, y: 462, s: 0.8, facing: -1, phase: 2.9, light: pathDawn },
      ],
      flowers: [{ x: 210, y: 470, h: 24, lean: 0.3, phase: 1.2 }],
      birds: [   // dawn birds toward the sunrise
        { x: 300, y: 140, s: 0.7, col: '#4a3a6a', phase: 0.8, v: 0.08, range: 130 },
        { x: 470, y: 108, s: 0.55, col: '#4a3a6a', phase: 3.6, v: 0.11, range: 100 },
      ],
    },
    14: {
      trees: [
        { x: 560, y: 300, h: 62, w: 24, pal: PALS[2], seed: 481, phase: 0.6, light: gatesGlow },
        { x: 108, y: 350, h: 72, w: 27, pal: LEAFPAL, seed: 483, phase: 2.7, light: gatesGlow },
      ],
      bushes: [{ x: 250, y: 420, w: 32, h: 18, pal: PALS[4], seed: 487, phase: 4.2, light: gatesGlow }],
      sheep: [
        { x: 300, y: 458, s: 1.05, facing: 1, phase: 1.7, light: gatesGlow },
        { x: 520, y: 470, s: 0.85, facing: -1, phase: 3.6, light: gatesGlow },
      ],
      birds: [
        { x: 560, y: 110, s: 1, col: '#3a5a8a', phase: 0.2, v: 0.09, range: 140 },
        { x: 610, y: 132, s: 0.75, col: '#3a5a8a', phase: 2.1, v: 0.11, range: 100 },
        { x: 512, y: 146, s: 0.8, col: '#3a5a8a', phase: 3.8, v: 0.08, range: 120 },
        { x: 660, y: 96, s: 0.6, col: '#3a5a8a', phase: 5.5, v: 0.13, range: 90 },
      ],
    },
  };

  /* ================= THE LITTLE PILGRIM — v3, the 16-bit-deluxe pass =================
     Chrono-grade layering: a hooded collar OVER the cloak, four cel tones per
     surface (shadow/base/light/rim), real cloth folds, a gold throat-clasp,
     a bone mask with side-shade and brow, iris-depth eyes, little boots. */
  function hexA(c) { var v = parseInt(c.slice(1), 16); return [v >> 16, (v >> 8) & 255, v & 255]; }
  function tone(a, f) { return rgbS(a[0] * f, a[1] * f, a[2] * f); }
  function tint(a, f) { return rgbS(a[0] + (255 - a[0]) * f, a[1] + (255 - a[1]) * f, a[2] + (255 - a[2]) * f); }

  // ═══════════════════════════════════════════════════════════════════════════
  //  THE HOODED CHILD — proposed protagonist (from Fred's own avatar, Aug 2026)
  //  A small kid in a blue hood: dark face inside the opening, black fringe,
  //  round bright eyes, soft grey paws for hands and feet. Painted with the same
  //  broken-colour marks as the rest of the cast, so it belongs to this book's
  //  hand rather than looking imported.
  //  ⚠ Kept SEPARATE from drawPilgrim on purpose: the current child stays until
  //  Fred rules from the sheet at /characters. Switching the book is then one
  //  line — point the 'p' actors at this painter.
  // ═══════════════════════════════════════════════════════════════════════════
  var HOOD = ['#5db4f7', '#3b93ea', '#2a6dba'];      // lit · base · shade
  var SKINC = ['#5a5560', '#454049', '#2e2b33'];     // the face in the hood's shade
  var HAIRC = ['#2a2530', '#1a1620', '#0e0c12'];
  var EYEC = ['#ff6a2a', '#e8481f', '#a82f12'];
  // ═══════════════════════════════════════════════════════════════════════════
  //  THE KID — Fred's own character sheet, converted from crayon to brushwork by
  //  gen/crayon-to-brush.py and blitted here. Fred: "can you just copy paste what
  //  i have? that one is drawn with crayon, change it to paint brush and you are
  //  done… you dont need to worry about IP, it is mine."
  //  So this draws no character of its own: it picks the cell of HIS sheet that
  //  matches the pose the page asked for, and lays it in at the right size.
  // ═══════════════════════════════════════════════════════════════════════════
  // ═══════════════════════════════════════════════════════════════════════════
  //  THE KID — Fred's character, from Fred's own sheet.
  //
  //  ⚠ DO NOT DRAW HIM. He is already designed and already drawn; Fred generated
  //  the sheet and gave it to me at the start. Everything I produced by hand —
  //  a traced silhouette, a constructed chibi, a build from his Twitter avatar —
  //  was worse than the thing I already had, and he said so every time, ending
  //  with: "nah bro, i did generate him, this is my design… i gave you the sheet
  //  since like forever."
  //
  //  My job is the ENGINEERING: convert his sheet into this book's medium
  //  (gen/crayon-to-brush.py), cut it into poses, and pick the right pose for
  //  whatever a page asks for. The art is his. The plumbing is mine.
  // ═══════════════════════════════════════════════════════════════════════════
  // ⚠ TWO LISTS, ON PURPOSE. The book cannot draw him until his art has decoded, so
  // whatever is REQUIRED gates every page's first paint — and at full resolution the
  // whole set is 1.4 MB. CORE is what kidCell() can actually return, plus every cell a
  // page names outright; EXTRA is the rest of Fred's sheets, fetched after, so a page
  // that asks for one has it, and no page waits on one it will never draw.
  // ⚠ SHEET 1 IS RETIRED. `front`, `surprised`, `three-quarter` and `side` were the
  // last cells coming through gen/crayon-to-brush.py, and they were the whole reason
  // some pages read soft while others read sharp. Fred redrew all four; the names are
  // the same, the files are the drawn versions. What is left of sheet 1 — `side-far`,
  // `back`, `hood-down`, `hands-up` — is unreachable from kidCell() now, so it must not
  // sit in CORE holding up the first paint.
  var KID_CORE = ['front', 'three-quarter', 'side', 'surprised', 'kneeling', 'carried',
                  'teary', 'joy', 'reading', 'teddy', 'kneel-joy', 'kneel-cry',
                  'afraid-crouch', 'afraid', 'walk', 'walk-joy', 'walk-away',
                  'reach-up', 'dizzy', 'glad', 'welcome', 'offer', 'kneel-calm',
                  // ── sheet 11 (Sep 2): the last four pages. Two rows of four — the cutter
                  // learned reading order for this sheet (see gen/cut-cells.py _reading_order).
                  'look-up-wide', 'look-up',      // comes (30): faces lifted to the rent heaven
                  'run-open', 'greet-wave',       // nonight (31): arriving, and being waved in
                  'lead-hand', 'taken-hand',      // together (28): the hand given, the hand taken
                  'light-give', 'light-take',     // candle (29): the flame passed
                  'lifted',    // ← named outright by twoways (17): the carried child
                  'sowing',    // ← seeds (20): kneeling, pressing one seed into the row
                  'eating',    // ← bread (21): sitting, an apple up in both hands, mid-bite
                  // ← family (24): the fireside ring. Four DIFFERENT children on one sheet
                  //   (10-fireside), each with their own hood, hair, eyes and skin painted
                  //   in — so they are never tinted, and this page uses no palette at all.
                  'sit-back', 'sit-offer', 'sit-take', 'sit-laugh',
                  // ⚠ MOVED OUT OF KID_EXTRA. Only KID_CORE is preloaded; an EXTRA cell named
                  // in CAST1 may not have decoded when the frame is drawn, and the draw path
                  // then bails ("the old pilgrim covers for him") straight into the RETIRED
                  // ep1 red figure. family (24) asked for `back` and got a red-cloaked
                  // stranger with a pale head sitting in the middle of the ring.
                  // ⚠ Any cell used by a page belongs in CORE.
                  'back',      // ← family (24): the nearest child, turned away, looking in
                  'trio',      // ← hands (23): all THREE children in one drawing, mid-catch
                  'breaking']; // ← family (24): sitting, a loaf torn in two, half held out
  var KID_EXTRA = ['side-far', 'hood-down', 'hands-up', 'running', 'sleeping',
                   'pizza', 'cheering', 'sulking', 'treat'];
  var KID_CELLS = KID_CORE.concat(KID_EXTRA);
  var KID_IMG = {};
  function kidImage(name, low) {
    if (KID_IMG[name]) return KID_IMG[name];
    var im = new Image();
    // ⚠ fetchPriority must be set BEFORE src — after it, the request is already queued.
    if (low) { try { im.fetchPriority = 'low'; } catch (e) { } }
    // ⚠ VERSION THE CELLS. They are re-cut whenever the cutter improves (the edge
    // decontamination that killed his white halo on dark pages, for one), and without
    // this a returning reader keeps the old ones forever.
    im.src = (typeof window !== 'undefined' && window.__castBase ? window.__castBase : '/cast/') + 'kid-' + name + '.webp?v=19';
    KID_IMG[name] = im;
    return im;
  }
  /* ⭐⭐ THE COLD LOAD WAS 77% CAST SHEET.
     Measured Sep 6: a first visit fetched index.html + the two engines + the cover plate +
     page one — about 590 KB — and then **1.98 MB of cast cells**, the whole of KID_CORE,
     before the reader had turned a single page. The opening pages use none of them.
     The reason was this gate: `kidReady()` asked whether EVERY cell had decoded, so the
     only way any page could draw his artwork was to have fetched all forty-one. It is an
     all-or-nothing question, and the answer was to stop asking it globally.
     Readiness is PER PAGE now — a page waits for its own cells and nothing else — and the
     rest of the cast is warmed in page order once the book is up, at low priority, a few
     at a time. The reader spends seconds on each page; the network has that long to run
     ahead of them, and it starts from the page they are actually looking at. */
  var KID_WAIT = [];
  function kidReady(cells) {
    var list = cells || KID_CORE;
    for (var i = 0; i < list.length; i++) {
      var im = kidImage(list[i]);
      if (!im.complete || !im.naturalWidth) return false;
    }
    return true;
  }
  // which of his drawings a given page actually needs — `kidCell` is a pure function of an
  // actor spec, so this can be answered from CAST1 without building anything.
  var KID_PAGE_CELLS = null;
  function kidCellsFor(idx) {
    if (!KID_PAGE_CELLS) {
      KID_PAGE_CELLS = {};
      try {
        for (var k in CAST1) {
          var acts = (CAST1[k] && CAST1[k].actors) || [], set = [];
          for (var i = 0; i < acts.length; i++) {
            var a = acts[i];
            if (a.t !== 'p' || a.wings) continue;
            var c = kidCell(a);
            if (c && set.indexOf(c) < 0) set.push(c);
          }
          KID_PAGE_CELLS[k] = set;
        }
      } catch (e) { KID_PAGE_CELLS = null; return KID_CORE; }   // never break the book over a preload
    }
    return (KID_PAGE_CELLS && KID_PAGE_CELLS[idx]) || [];
  }
  // ⚠ HIS ART ARRIVES AFTER THE PAGE BUILDS. A page builds its actors into sprite sheets
  // ONCE, and on a cold load that happens before his drawings have decoded — so the whole
  // book fell back to the old pilgrim, and only looked right on the second visit. Anything
  // that draws him can register here and be told when he is actually available.
  function onKidReady(cb, cells) {
    kidPreload(cells);                  // start the fetch — a caller may be the first to ask
    if (kidReady(cells)) { cb(); return; }
    KID_WAIT.push({ cells: cells || null, cb: cb });
  }
  // every waiter is asked about ITS OWN cells, so a page is released the moment its own
  // drawings land rather than waiting on the other thirty.
  function kidFlush() {
    if (!KID_WAIT.length) return;
    var keep = [];
    for (var i = 0; i < KID_WAIT.length; i++) {
      var w = KID_WAIT[i];
      if (kidReady(w.cells)) { try { w.cb(); } catch (e) { } }
      else keep.push(w);
    }
    KID_WAIT = keep;
  }
  function kidPreload(cells, low) {
    var list = cells || KID_CORE;
    for (var i = 0; i < list.length; i++) {
      var im = kidImage(list[i], low);
      if (im.__wired) continue;
      im.__wired = 1;
      im.addEventListener('load', kidFlush);
      im.addEventListener('error', kidFlush);   // a cell that 404s must not strand a page for ever
    }
  }
  // the rest of the cast, in PAGE ORDER, once the book is up: nearest first, a few at a
  // time, at low priority, so it can never contend with what the reader is looking at.
  var KID_WARMED = 0;
  function kidWarmAll() {
    if (KID_WARMED) return; KID_WARMED = 1;
    var order = [], seen = {}, p, i;
    for (p = 0; p < 40; p++) {
      var cs = kidCellsFor(p);
      for (i = 0; i < cs.length; i++) if (!seen[cs[i]]) { seen[cs[i]] = 1; order.push(cs[i]); }
    }
    for (i = 0; i < KID_CORE.length; i++) if (!seen[KID_CORE[i]]) { seen[KID_CORE[i]] = 1; order.push(KID_CORE[i]); }
    var at = 0;
    var idle = (typeof window !== 'undefined' && window.requestIdleCallback)
      ? function (fn) { window.requestIdleCallback(fn, { timeout: 400 }); }
      : function (fn) { setTimeout(fn, 90); };
    (function step() {
      if (at >= order.length) return;
      for (var n = 0; n < 4 && at < order.length; n++) kidPreload([order[at++]], true);
      idle(step);
    })();
  }
  // the next few pages' drawings, low priority — called by the scene engine as each page settles.
  // A reader who has come this far is reading: from page 4 on, the rest of the cast follows in idle time.
  function kidWarmAhead(idx) {
    var cs = [];
    for (var p = idx; p <= idx + 4; p++) cs = cs.concat(kidCellsFor(p));
    kidPreload(cs, true);
    if (idx >= 4) kidWarmAll();
  }
  // which of his drawings answers what the page asked for
  // ⚠ EVERY PERSON IN THE BOOK IS THIS CHARACTER NOW — the protagonist plain, the friends
  // recoloured. A folk actor already carries its own `cols` (its cloak) and `maskCols` (its
  // face); those become the hoodie and skin, so each page keeps the colour scheme it was
  // designed with while the CHARACTER stops changing from page to page. The eye colour is
  // drawn from the person's own hue so no two friends stare with the same eyes.
  var FRIEND_EYES = ['#e8a33a', '#4fb6a4', '#c46be0', '#6fa8e8', '#e0664f', '#9ccf5a'];
  // ⚠ `maskCols` IS NOT SKIN. It is the old pilgrim's MASK — a pale cream (#c8c0ac) —
  // and feeding it in as a skin tone gave every friend a white face, so a row of
  // children read as a row of ghosts. Fred asked for "different eye colors and skin
  // colors"; these are real tones in the same warm-grey family as his own, picked on
  // their own seed so skin and eyes vary independently of the hoodie.
  // ⚠ THESE WERE ALL HIS OWN COLOUR. Measured off cast/kid-breaking.webp his skin is
  // #6e6462 — and every value in the old list (#8a7a6e, #6f6667, #5a4f4a …) sits within a
  // few steps of it, so "friends" came out as the same child in a different coat. Fred's
  // own trio drawing shows the range the book actually wants: warm cream and light tan
  // beside his dark grey — NOT paper-white. Sampled from cast/kid-trio.webp, whose two
  // friends read about #d5bea6 in the lit half of the face.
  // ⚠⚠ NO PORCELAIN AND NO GREY. Fred: "the face is pale white, the neck is grey... there
  // are no one with grey skin in this world", and then "i still see the white grey kid."
  // The first entry used to be #fbeee8 — that is not a skin tone, it is paper, and it has a
  // second problem: the recolour maps each mass's mean onto the target's LIGHTNESS, so a
  // target at luma 0.94 leaves almost no room above it and the whole face flattens into one
  // pale slab with the modelling squeezed out. These six are real skin, none of them lighter
  // than about 0.82, so every face keeps its shading.
  var FRIEND_SKIN = ['#f0d0b6', '#e8bc98', '#d7a074', '#bb8153', '#94603c', '#6b4630'];
  // ⚠ AND HAIR WAS NEVER RECOLOURED AT ALL, so every friend kept his black hair — which is
  // most of why they still read as him. His hair measures #3f302d (lum 0.20); these are
  // the colours his friends have in the trio drawing, plus a couple of their family.
  var FRIEND_HAIR = ['#efcb93', '#e7748a', '#c87a3e', '#8f5a3c', '#d9a24e', '#5f4636'];
  function h32(v) { v = (v ^ 61) ^ (v >>> 16); v = v + (v << 3); v = v ^ (v >>> 4); v = Math.imul(v, 0x27d4eb2d); v = v ^ (v >>> 15); return v >>> 0; }
  function kidPalFor(a, seed) {
    if (!a.folk && !a.cols) return null;                     // the protagonist wears his own
    var n = Math.abs(seed | 0);
    return {
      hood: (a.cols && a.cols[0]) || '#4a9fe0',
      // ⚠ SPREAD THEM PROPERLY. `(n*5+1) % 6` collided badly — family's actors hashed to
      // 1, 1, 3, 1, so three of the five friends drew the same pink hair and the page
      // stopped looking like many faces again. One multiply-shift hash, three different
      // offsets, so skin, hair and eyes vary independently.
      // ⚠ AN ACTOR MAY NAME ITS OWN. The hash spreads a crowd, but when a page needs a
      // SPECIFIC friend — the same blonde and the same pink child who hold him up on
      // `hands` also sitting at the supper on `family` — the page says so, and continuity
      // across pages beats variety within one. Fred: "use blonde and pink like in hands".
      skin: a.skin || FRIEND_SKIN[h32(n + 17) % FRIEND_SKIN.length],
      hair: a.hair || FRIEND_HAIR[h32(n + 101) % FRIEND_HAIR.length],
      // ⚠ `eye` on an actor is already the GAZE VECTOR [x,y] — the colour override is
      // `eyeCol`, or this hands an array to the tinter.
      eye: a.eyeCol || FRIEND_EYES[h32(n + 251) % FRIEND_EYES.length],
    };
  }
  // ── WHICH DRAWING OF HIS THIS PAGE GETS ────────────────────────────────────
  //  Pages describe a STATE — kneeling, walking, afraid, joyful — and this maps
  //  that onto one of Fred's cells. Nothing here is drawn; it only chooses.
  //  Cells live in cast/ and come off his sheets (see cast/README.md).
  function kidCell(p) {
    if (p.cell) return p.cell;                       // a page can name one outright
    var mood = p.mood || 'open';
    var walking = !!(p.walk || p.stride);
    // ⚠ DIZZY OUTRANKS EVERYTHING BUT AN EXPLICIT CELL. This sat below the `walking`
    // test, and the child on the string page carries `stride` — so he resolved to
    // `walk` and never reached here. A child tumbling on the end of a line in a gale
    // is not walking; the stride is there to swing his legs, not to move him along.
    // (I told Fred this page was done and it never was — the check was unreachable.)
    if (mood === 'dizzy') return 'dizzy';
    if (p.kneel) {
      if (mood === 'joy') return 'kneel-joy';
      if (mood === 'teary') return 'kneel-cry';
      if (mood === 'wary') return 'afraid-crouch';
      return 'kneeling';
    }
    // ⚠ `back` is the sheet-1 cell, converted crayon→brush, and its edge is visibly
    // hairy beside the drawn ones. Sheet 6's back view is the same pose, cleanly cut.
    if (p.back) return 'walk-away';
    if (walking) return mood === 'joy' ? 'walk-joy' : 'walk';
    // ⚠ ONE STYLE. Sheet 1 is Fred's original crayon turnaround, run through
    // gen/crayon-to-brush.py — and beside the drawn sheets it reads soft and hairy.
    // Fred, on 'you were not alone': "the friends are both high def and the main
    // character the kid is not. we have to stick with one style. i think high def is
    // good." He was right, and the cause was exactly this: the friends were `afraid`
    // (drawn) and he was `hands-up` (converted). Prefer a drawn cell every time.
    // hands lifted: to the Light, or in gladness
    var armsUp = p.armL && p.armR && (p.armL[1] < p.y - p.h * 0.7 || p.armR[1] < p.y - p.h * 0.7);
    if (armsUp) return 'reach-up';
    if (mood === 'teary') return 'teary';
    if (mood === 'wary') return 'afraid';
    if (mood === 'wonder') return 'surprised';
    if (mood === 'joy') return 'joy';
    var t = p.turn || 0, gaze = Math.abs((p.eye && p.eye[0]) || 0);
    if (t > 0.7 || gaze > 0.6) return 'side';
    if (t > 0.25 || gaze > 0.3) return 'three-quarter';
    return 'front';
  }

  // ⚠ ONE CHARACTER, MANY PEOPLE. Fred: "make the friends also the same way. maybe with
  // different hoodies, with different eye colors and skin colors." The book was reading as
  // two hands because the protagonist was his design and everyone else was the old pilgrim.
  // So the friends wear the SAME character, recoloured: his cell is repainted per person —
  // the hoodie's blue swung to their colour, the eyes and the skin to theirs — keeping the
  // painting's own light and shade by working on each pixel's luminance rather than
  // flooding it flat. Cached per person, so it costs one pass each.
  var KID_TINT = {};
  function hexRGB(h) { var v = parseInt(h.slice(1), 16); return [v >> 16, (v >> 8) & 255, v & 255]; }
  function kidTinted(name, pal) {
    var key = name + '|' + (pal.hood || '') + (pal.eye || '') + (pal.skin || '') + (pal.hair || '');
    if (KID_TINT[key]) return KID_TINT[key];
    var im = kidDehatched(name);                             // ⚠ de-ribbed FIRST — see above
    if (!im) return null;
    var c = document.createElement('canvas');
    c.width = im.width; c.height = im.height;
    var g = c.getContext('2d');
    g.drawImage(im, 0, 0);
    var d = g.getImageData(0, 0, c.width, c.height), D = d.data;
    var HOOD = pal.hood ? hexRGB(pal.hood) : null;
    var EYE = pal.eye ? hexRGB(pal.eye) : null;
    var SKIN = pal.skin ? hexRGB(pal.skin) : null;
    var HAIR = pal.hair ? hexRGB(pal.hair) : null;
    // ⚠ HAIR ONLY IN THE HEAD. Hair and boots and the ink outline are all dark low-chroma
    // pixels — colour alone cannot tell them apart. So the hair rule is confined to the top
    // of the FIGURE's own bounds, where the only large dark mass is hair, and the very
    // darkest pixels are left alone so the drawing keeps its outline.
    var hairY = 0, eyeY = 1e9, figH = 0;
    {
      var minY = c.height, maxY = 0;
      for (var yy = 0; yy < c.height; yy++) {
        var row = yy * c.width * 4;
        for (var xx = 0; xx < c.width; xx++) if (D[row + xx * 4 + 3] > 40) { if (yy < minY) minY = yy; if (yy > maxY) maxY = yy; break; }
      }
      hairY = minY + (maxY - minY) * 0.42;
      // ⚠⚠ AND THE WHOLE FALL OF IT, NOT JUST THE TOP. Fred: "you see the hair, the top is
      // pink and the bottom is black." That band above is a HEAD test, and it was being used
      // as the hair MASK — so a bob that hangs past 42% of the figure got recoloured down to
      // that line and kept Fred's black below it, with a horizontal cut straight across her
      // head. Hair is one connected mass: find the dark low-chroma components, keep the ones
      // that BEGIN in the head band, and recolour each of them entire, however far it falls.
      // (Boots are the same colour and would ruin this — they survive because they are a
      // separate component, with the cloak between.)
      // ⚠⚠ AND THE EYE RULE HAS TO STAY IN THE HEAD. Fred: "now the apple became green..."
      // — `isEye` is "strongly red" (r>130, r-g>50, r-b>45), and a RED APPLE is strongly
      // red, so every friend holding one had her fruit repainted in her own eye colour.
      // Anything he draws in his hands is fair game for that test: the apple, a berry, a
      // tomato on a sill. Eyes live in the top half of a figure and props do not, so the
      // rule is bounded the same way the hair rule is.
      eyeY = minY + (maxY - minY) * 0.5;
      figH = maxY - minY;
    }
    // ⚠⚠ AND THE PROP IS NOT AN EYE. Fred: "now the apple became green..." — `isEye` means
    // "strongly red", and he draws red things into their hands: an apple, two halves of a
    // bread roll. Bounding the rule to the head does not save it either, because she is
    // EATING the apple: it sits against her cheek, higher up the figure than her own eyes.
    //   What actually separates them is SIZE, and it separates them cleanly. Measured, as a
    // fraction of figure height: eyes are 3-6% across, props are 16-24% (apple 7834px,
    // bread halves 9258 and 9244, against eyes at 639-954px). So the red mask is split into
    // connected components and only the small ones are eyes. Anything he draws big and red
    // keeps the colour he gave it.
    // ⚠ AND THE CLOAK IS THE BIG ONE. The blue test also catches the cool shadow inside her
    // open mouth, which came out as a small teal patch on her tongue. The cloak is a single
    // enormous region and a mouth is a handful of pixels, so keep only large components —
    // the same discrimination the eyes need, in the other direction.
    var hoodOK = null;
    if (HOOD) {
      var OW = c.width, OH = c.height;
      hoodOK = new Uint8Array(OW * OH);
      var oc = new Uint8Array(OW * OH);
      for (var op = 0; op < OW * OH; op++) {
        var o4b = op * 4;
        if (D[o4b + 3] > 200 && D[o4b + 2] > D[o4b] + 22 && D[o4b + 2] > 70) oc[op] = 1;
      }
      // ⚠ THE THRESHOLD MUST CLEAR THE SPECKS AND NOTHING ELSE. At 1% of figH² (4886px on
      // kid-eating) it also dropped the hood's INNER LINING beside her face — a separate
      // 3420px region, cut off from the main hood by her hair — and Fred got a friend with
      // a green hood and a blue patch on it. Measured, the gap is enormous: the real parts
      // of a hood are 3420 and 148343, and every stray is 14px or less. 0.08% sits in the
      // middle of that gap with room on both sides.
      var oseen = new Uint8Array(OW * OH);
      var omin = Math.max(150, (figH > 0 ? figH * figH : OW * OH) * 0.0008);
      for (var os = 0; os < OW * OH; os++) {
        if (!oc[os] || oseen[os]) continue;
        var oq = [os]; oseen[os] = 1; var opts = [];
        while (oq.length) {
          var oi = oq.pop(); opts.push(oi);
          var ox = oi % OW, oy = (oi / OW) | 0;
          if (ox > 0 && oc[oi - 1] && !oseen[oi - 1]) { oseen[oi - 1] = 1; oq.push(oi - 1); }
          if (ox < OW - 1 && oc[oi + 1] && !oseen[oi + 1]) { oseen[oi + 1] = 1; oq.push(oi + 1); }
          if (oy > 0 && oc[oi - OW] && !oseen[oi - OW]) { oseen[oi - OW] = 1; oq.push(oi - OW); }
          if (oy < OH - 1 && oc[oi + OW] && !oseen[oi + OW]) { oseen[oi + OW] = 1; oq.push(oi + OW); }
        }
        if (opts.length > omin) for (var ok2 = 0; ok2 < opts.length; ok2++) hoodOK[opts[ok2]] = 1;
      }
    }
    var hairOK = null;
    if (HAIR && figH > 0) {
      var HW = c.width, HH = c.height;
      hairOK = new Uint8Array(HW * HH);
      var hc = new Uint8Array(HW * HH);
      for (var hp = 0; hp < HW * HH; hp++) {
        var h4 = hp * 4;
        if (D[h4 + 3] < 200) continue;
        var hr = D[h4], hg = D[h4 + 1], hb = D[h4 + 2];
        var hl = (hr * 0.299 + hg * 0.587 + hb * 0.114) / 255;
        // ⚠ 0.22, NOT 0.32. Fred: "now the neck becomes pink..." — his own skin is a dark
        // grey-brown and its SHADOWS land at 0.24-0.32, squarely inside a "dark and low
        // chroma" test, so the shaded neck under her chin joined the hair component and was
        // recoloured with it. True hair on these cells sits below 0.22.
        if (Math.abs(hr - hg) < 40 && Math.abs(hg - hb) < 40 && hl > 0.06 && hl < 0.22) hc[hp] = 1;
      }
      var hseen = new Uint8Array(HW * HH);
      for (var hs = 0; hs < HW * HH; hs++) {
        if (!hc[hs] || hseen[hs]) continue;
        var hq = [hs]; hseen[hs] = 1;
        var hpts = [], htop = 1e9;
        while (hq.length) {
          var hi = hq.pop(); hpts.push(hi);
          var hx = hi % HW, hy = (hi / HW) | 0;
          if (hy < htop) htop = hy;
          if (hx > 0 && hc[hi - 1] && !hseen[hi - 1]) { hseen[hi - 1] = 1; hq.push(hi - 1); }
          if (hx < HW - 1 && hc[hi + 1] && !hseen[hi + 1]) { hseen[hi + 1] = 1; hq.push(hi + 1); }
          if (hy > 0 && hc[hi - HW] && !hseen[hi - HW]) { hseen[hi - HW] = 1; hq.push(hi - HW); }
          if (hy < HH - 1 && hc[hi + HW] && !hseen[hi + HW]) { hseen[hi + HW] = 1; hq.push(hi + HW); }
        }
        if (htop < hairY && hpts.length > 200) {
          for (var hk = 0; hk < hpts.length; hk++) hairOK[hpts[hk]] = 1;
        }
      }
    }
    var eyeOK = null;
    if (EYE && figH > 0) {
      var W2 = c.width, H2 = c.height, lim = figH * 0.10;
      eyeOK = new Uint8Array(W2 * H2);
      var cand = new Uint8Array(W2 * H2);
      var q, px2, py2, qi, small = [];
      for (var pi = 0; pi < W2 * H2; pi++) {
        var o4 = pi * 4;
        if (D[o4 + 3] > 200 && D[o4] > 130 && D[o4] - D[o4 + 1] > 50 && D[o4] - D[o4 + 2] > 45) cand[pi] = 1;
      }
      var seen2 = new Uint8Array(W2 * H2);
      for (var p0 = 0; p0 < W2 * H2; p0++) {
        if (!cand[p0] || seen2[p0]) continue;
        q = [p0]; seen2[p0] = 1;
        var pts = [], x0 = p0 % W2, x1 = x0, y0 = (p0 / W2) | 0, y1 = y0;
        while (q.length) {
          qi = q.pop(); pts.push(qi);
          px2 = qi % W2; py2 = (qi / W2) | 0;
          if (px2 < x0) x0 = px2; if (px2 > x1) x1 = px2;
          if (py2 < y0) y0 = py2; if (py2 > y1) y1 = py2;
          if (px2 > 0 && cand[qi - 1] && !seen2[qi - 1]) { seen2[qi - 1] = 1; q.push(qi - 1); }
          if (px2 < W2 - 1 && cand[qi + 1] && !seen2[qi + 1]) { seen2[qi + 1] = 1; q.push(qi + 1); }
          if (py2 > 0 && cand[qi - W2] && !seen2[qi - W2]) { seen2[qi - W2] = 1; q.push(qi - W2); }
          if (py2 < H2 - 1 && cand[qi + W2] && !seen2[qi + W2]) { seen2[qi + W2] = 1; q.push(qi + W2); }
        }
        // ⚠ AND NOT A STRAY PIXEL EITHER. Measured on kid-eating: the two irises are 639
        // and 923 px, and between them sit half a dozen ONE-pixel red specks. A rule that
        // just took the two highest components took one iris and a speck, and the other
        // eye stayed Fred's red while its twin turned green.
        if ((x1 - x0 + 1) < lim && (y1 - y0 + 1) < lim && pts.length > 120) {
          small.push({ top: y0, pts: pts });
        }
      }
      // ⚠ AND THE MOUTH IS RED TOO. Her open mouth is dark red and small enough to pass the
      // size test, so her tongue came out in her eye colour — a teal patch on her face.
      // Height alone cannot separate them (both are in the upper third) and size cannot
      // either. What does: THE EYES ARE LEVEL WITH EACH OTHER and they are the highest red
      // features on the face. Take the highest, then everything within a few percent of it.
      small.sort(function (p, q) { return p.top - q.top; });
      if (small.length) {
        var band = small[0].top + figH * 0.05;
        for (var s2 = 0; s2 < small.length; s2++) {
          if (small[s2].top > band) continue;
          for (var k2 = 0; k2 < small[s2].pts.length; k2++) eyeOK[small[s2].pts[k2]] = 1;
        }
      }
    }
    // ⚠⚠ THE TINT TRANSFER IS DELIBERATELY PLAIN — DO NOT PUT A GAIN BACK IN IT.
    // Dark tints really do compress the cell's hatch (measured: his cloak contrast 0.263,
    // a tinted one 0.13), and my first answer was to widen the multiplier by how dark the
    // tint is. It fixed the metric and was wrong on the page: Fred circled three recoloured
    // friends — "some have this streak and the new one that i generated does not have it."
    // A gain here scales EVERYTHING, so it amplified his fine fabric hatch into visible
    // streaks, and worst on exactly the cells that were hatchiest to begin with.
    //   Because the cells are NOT equal at source. Measured cloak hatch amplitude: the ones
    // he generated recently run 3.65-5.02 (trio, breaking, eating, carried, sowing), the
    // older ones 5.83-6.56 (glad, kneel-calm, welcome, joy). The gain multiplied that
    // spread again. So consistency cannot live in the tint at all — it is handled once, for
    // every figure, tinted or not, by kidDehatched() — which runs BEFORE this.
    // ⚠⚠ RECOLOUR IS A HUE SHIFT, NOT A MULTIPLY. Fred: "the friends of the protagonist
    // seems to have some sort of filter. can you identify what filter it is and maybe
    // remove it so all the characters are consistent?" He was right and it had a precise
    // cause, which measuring found and my eye had not:
    //
    //   `TINT_RGB * (lum/ref)` posterises. Every channel of the output is one fixed number
    //   scaled by one multiplier, so a saturated tint leaves each channel only as many
    //   distinct 8-bit values as its own magnitude allows. Green #2c7a52 gives the RED
    //   channel about TWENTY levels to carry the whole cloak's shading, and amber #d2922e
    //   CLIPS red at 255 across every highlight. A smooth gradient in Fred's drawing comes
    //   out as broad diagonal BANDS — which is exactly the "filter" look, and why measuring
    //   high-frequency energy had misled me: the green friend measured 3.83 against the
    //   protagonist's 4.51. It never had more texture. It had LESS, in steps.
    //
    // So the recolour translates in HSL and KEEPS THE DRAWING'S OWN LUMINANCE. Each mass is
    // mapped by a two-segment levels curve that sends its mean to the target's lightness
    // and pins 0 to 0 and 1 to 1 — monotonic, so no ordering is lost, and it cannot clip.
    // The detail now lives in L, which spreads across all three channels, instead of being
    // rationed by the smallest one. A trace of the original hue variation is kept so the
    // cloth does not go dead flat.
    // ⚠ AND IT IS DONE IN LUMA/CHROMA, NOT HSL. The first version of this translated in HSL
    // and turned every friend's hands and feet GOLD. HSL saturation is meaningless near
    // white — the pale skins sit at l≈0.95, where s is both enormous and unstable — so
    // shading a hand threw a strongly saturated colour instead of a darker skin tone.
    // Y/Cb/Cr has no such corner: chroma is a signed OFFSET from luma, it stays finite
    // everywhere, and it is the space this problem actually lives in — keep the drawing's
    // luma, replace its chroma.
    function _lev(l, m, t) {                                 // maps m->t, holds 0 and 1
      if (m <= 0.001) return l;
      if (l <= m) return t * (l / m);
      return m >= 0.999 ? t : t + (l - m) * (1 - t) / (1 - m);
    }
    function _hasRoom(y) { var u = y / 255; return 1 - Math.abs(2 * u - 1); }
    var isHood = function (r, g, b) { return b > r + 22 && b > 70; };
    var isEye = function (r, g, b) { return r > 130 && r - g > 50 && r - b > 45; };
    // ⚠⚠ SKIN IS DEFINED BY EXCLUSION, NOT BY COLOUR. Fred: "the face is pale white, the
    // neck is grey, the hands are pale white and the feet are grey. there are no one with
    // grey skin in this world." One figure, four different answers, because the old test was
    // a narrow colour window — |R-G| < 34 and luma 0.16..0.72 — and his skin does not sit
    // inside it. Measured on kid-welcome it caught only 57% of the body: the LIT hands and
    // face passed, the SHADOWED feet fell under the luma floor, and the neck is warm
    // (153/110/102, |R-G| = 43) so it fell out sideways. Everything it missed kept his own
    // dark grey, which is what made the friends look assembled from two different children.
    //   Now that hair and eyes are found properly as connected components, skin needs no
    // colour window of its own: it is simply the body that is left. Not cloth, not hair, not
    // eyes, not the ink line, and not strongly chromatic (which is how a red apple or a
    // bread crust keeps the colour Fred gave it).
    var isSkinish = function (r, g, b, L) { return Math.abs(r - g) < 46 && Math.abs(g - b) < 46 && L > 0.06 && L < 0.82; };
    var i, r, gg, b, lum, band;
    var bandAt = function (idx, r2, g2, b2, L) {
      if (HOOD && hoodOK && hoodOK[idx / 4]) return 'hood';
      if (EYE && eyeOK && eyeOK[idx / 4] && isEye(r2, g2, b2)) return 'eye';
      if (HAIR && hairOK && hairOK[idx / 4]) return 'hair';
      if (SKIN && isSkinish(r2, g2, b2, L)) return 'skin';
      return null;
    };
    var acc = { hood: [0, 0, 0], eye: [0, 0, 0], hair: [0, 0, 0], skin: [0, 0, 0] };
    var cnt = { hood: 0, eye: 0, hair: 0, skin: 0 };
    for (i = 0; i < D.length; i += 4) {                      // pass 1 — each mass's own mean
      if (D[i + 3] < 200) continue;
      r = D[i]; gg = D[i + 1]; b = D[i + 2];
      lum = (r * 0.299 + gg * 0.587 + b * 0.114) / 255;
      band = bandAt(i, r, gg, b, lum);
      if (!band) continue;
      var yy = lum * 255;
      acc[band][0] += yy; acc[band][1] += b - yy; acc[band][2] += r - yy;
      cnt[band]++;
    }
    var TGT = {};
    function target(nm, C) {
      if (!C || !cnt[nm]) return;
      var ty = C[0] * 0.299 + C[1] * 0.587 + C[2] * 0.114;
      TGT[nm] = { y: ty, cb: C[2] - ty, cr: C[0] - ty,
                  my: acc[nm][0] / cnt[nm], mcb: acc[nm][1] / cnt[nm], mcr: acc[nm][2] / cnt[nm] };
    }
    target('hood', HOOD); target('eye', EYE); target('hair', HAIR); target('skin', SKIN);
    for (i = 0; i < D.length; i += 4) {
      if (D[i + 3] < 8) continue;
      r = D[i]; gg = D[i + 1]; b = D[i + 2];
      lum = (r * 0.299 + gg * 0.587 + b * 0.114) / 255;
      band = bandAt(i, r, gg, b, lum);
      var T = band && TGT[band];
      if (!T) continue;
      var y0 = lum * 255;
      var ny = _lev(lum, T.my / 255, T.y / 255) * 255;        // the drawing's own value, remapped
      // chroma follows the room the new luma leaves it — you cannot have a saturated white
      var room = Math.min(1.15, _hasRoom(ny) / Math.max(0.1, _hasRoom(T.y)));
      var ncb = (T.cb + (b - y0 - T.mcb) * 0.7) * room;
      var ncr = (T.cr + (r - y0 - T.mcr) * 0.7) * room;
      var R2 = ny + ncr, B2 = ny + ncb, G2 = (ny - 0.299 * R2 - 0.114 * B2) / 0.587;
      D[i] = R2 < 0 ? 0 : R2 > 255 ? 255 : R2;
      D[i + 1] = G2 < 0 ? 0 : G2 > 255 ? 255 : G2;
      D[i + 2] = B2 < 0 ? 0 : B2 > 255 ? 255 : B2;
    }
    g.putImageData(d, 0, 0);
    KID_TINT[key] = c;
    return c;
  }

  // ── ONE CLOTH FOR THE WHOLE CAST ───────────────────────────────────────────
  // Fred: "the friends of the protagonist seems to have some sort of filter. can you
  // identify what filter it is and maybe remove it so all the characters are consistent?"
  // Then: "compare the sprite i just gave you and the friends (which are the old sprite
  // that we edited)."
  //
  // It is in the SOURCE SHEETS, and it is visible by eye once you put them side by side:
  // the old sheets draw the cloak with a fine VERTICAL RIBBING, like corduroy, running the
  // length of every sleeve and skirt. The sheets Fred generated recently draw the same
  // cloak as smooth cel shading. Nothing was ever applied to them by this repo — the cutter
  // has no such pass — so no amount of work in the tint could have fixed it, which is why
  // two attempts there failed and the second one (a gain in kidTinted) made it worse.
  //
  // Measured on the cloth mass alone, at a blur radius small enough to isolate the rib
  // rather than the form (r=1.2):
  //     new sheets   trio 1.64 · carried 2.16 · sowing 2.45 · breaking 2.66 · eating 2.83
  //     old sheets   joy 3.04 · walk 3.12 · welcome 3.51 · kneeling 3.66 · glad 3.88
  // So the rib is about 40% more fine detail in the cloth, and only in the cloth.
  //
  // This strips it to the new sheets' level. ⚠ IT MUST RUN BEFORE THE RECOLOUR — the cloth
  // is found by being BLUE, and after a friend's cloak is green or amber there is no way
  // left to tell cloth from anything else. kidTinted() therefore takes its source from
  // here, not from the raw image.
  //
  // ⚠ Only the CLOTH is touched, and only its fine band: the face, the hair, the props and
  // the ink outline keep every mark Fred made. Residuals over 40 are the outline and are
  // never scaled; pixels whose blurred alpha has gone soft are the silhouette and are left
  // alone, or the figure haloes.
  var KID_FLAT = {};
  // ⚠⚠ A SIGMA FILTER, NOT A MEASUREMENT. My first two goes at this tried to MEASURE how
  // ribbed a cell was and scale its residual to match the smooth ones. Both failed, and the
  // second one shipped: measured at every radius I tried, `eating` (1.41 in flat cloth) and
  // `breaking` (1.15) come out nearly equal — yet crop the two cloaks and put them side by
  // side and one is plainly woven and the other is plainly smooth. The fibre is COHERENT and
  // DIRECTIONAL: long fine threads carry very little energy per pixel while being obvious to
  // the eye, so no per-pixel average can separate them from a soft gradient.
  //
  // So do not measure. Denoise, edge-preservingly, and let it be a no-op where there is
  // nothing to remove: each cloth pixel is averaged with the neighbours within 2px whose
  // luminance is within SIG of its own. A fold, a seam and the ink outline all exceed SIG
  // and survive untouched; a fibre thread does not and dissolves. On `breaking`, which has
  // no fibre, almost every neighbour is already within SIG, so averaging them changes
  // nothing — which is exactly the property a fix like this needs.
  //
  // ⚠ CLOTH ONLY, AND BEFORE THE RECOLOUR. The cloth is found by being BLUE; after a
  // friend's cloak is green there is nothing left to find it by. Face, hair, hands, props
  // and outline are never touched.
  // Tuned by simulating the filter on kid-welcome and comparing it against kid-breaking,
  // the cell from the sheet Fred pointed at as correct: 13/2 clears the speckle, 20/3 most
  // of the weave, 34/5 lands on breaking's own smoothness. Above this it starts eating the
  // folds, which are the drawing.
  var SIG = 34, RAD = 5;
  function kidDehatched(name) {
    if (KID_FLAT[name]) return KID_FLAT[name];
    var im = kidImage(name);
    if (!im.complete || !im.naturalWidth) return null;
    try {
    var w = im.naturalWidth, h = im.naturalHeight;
    var c = document.createElement('canvas'); c.width = w; c.height = h;
    var g = c.getContext('2d'); g.drawImage(im, 0, 0);
    var d = g.getImageData(0, 0, w, h), D = d.data;
    var src = new Uint8ClampedArray(D);                      // read from the original always
    var L = new Float32Array(w * h);
    var cloth = new Uint8Array(w * h);
    var i, k;
    for (i = 0, k = 0; k < w * h; k++, i += 4) {
      L[k] = src[i] * 0.299 + src[i + 1] * 0.587 + src[i + 2] * 0.114;
      if (src[i + 3] > 250 && src[i + 2] > src[i] + 22 && src[i + 2] > 70) cloth[k] = 1;
    }
    for (var y = 0; y < h; y++) {
      for (var x = 0; x < w; x++) {
        k = y * w + x;
        if (!cloth[k]) continue;
        var l0 = L[k], sr = 0, sg = 0, sb = 0, n = 0;
        var y0 = y - RAD < 0 ? 0 : y - RAD, y1 = y + RAD >= h ? h - 1 : y + RAD;
        var x0 = x - RAD < 0 ? 0 : x - RAD, x1 = x + RAD >= w ? w - 1 : x + RAD;
        for (var yy = y0; yy <= y1; yy++) {
          var row = yy * w;
          for (var xx = x0; xx <= x1; xx++) {
            var kk = row + xx;
            if (!cloth[kk]) continue;                        // never average in a neighbour
            var dl = L[kk] - l0;                             // from outside the cloth
            if (dl > SIG || dl < -SIG) continue;             // nor across a fold or a seam
            var j = kk * 4;
            sr += src[j]; sg += src[j + 1]; sb += src[j + 2]; n++;
          }
        }
        if (n > 1) { i = k * 4; D[i] = sr / n; D[i + 1] = sg / n; D[i + 2] = sb / n; }
      }
    }
    g.putImageData(d, 0, 0);
    } catch (err) { return null; }                           // a tainted canvas must not kill the figure
    KID_FLAT[name] = c;
    return c;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  THE KID, DRAWN — so he can actually do things.
  //
  //  Fred: "so the character is just like a sticker? you cannot change the arms
  //  to be hugging the figure? can you learn to draw this character?"
  //  Right: a blitted cell can never hug anybody. This is his character built as
  //  geometry, with ARMS THAT ARTICULATE — shoulder, elbow, hand — so a page can
  //  send a hand anywhere and the sleeve follows it.
  //
  //  Proportions measured off his own sheet's front figure (fractions of height,
  //  x from the centre line):
  //    hood widest 0.226 at y 0.36   shoulders 0.19 at 0.42, pinching to 0.18
  //    sleeves flare to 0.252 at 0.70, cuffs out at ±0.263
  //    hem 0.193 at 0.88   feet 0.86..1.00 at ±0.198
  //    eyes r 0.026, centres ±0.045, at y 0.277
  //  And his five corrections, which are the difference between a character and
  //  a snowman: the hand is PART of the sleeve; paws are flattened with toes, not
  //  circles; the hood has a rim and a seam; the face has cheeks, a jaw and a
  //  chin; and there is a NECK.
  // ═══════════════════════════════════════════════════════════════════════════
  // Measured off the front figure of his own sheet (fractions of total height,
  // x from the centre line). These are not invented — they are what his drawing
  // actually does, and getting them wrong is what made every earlier attempt
  // read as "a totally different character":
  //   hood widest 0.230 at y 0.34; SHOULDER PINCH to 0.151 at y 0.46
  //   body bell 0.185 → 0.212, hem 0.196 at 0.88
  //   sleeves are the WIDEST part of him: cuffs at ±0.256 around y 0.70–0.76
  //   face: top 0.19, chin 0.40, cheeks widest ±0.118 at y 0.30 (BELOW the eyes)
  //   eyes: centres ±0.068, r 0.026, at y 0.276
  //   feet: outer ±0.196, from y 0.85 to the ground
  var KB = {
    hood: ['#8ecdff', '#72bdff', '#5aa9f5', '#3c91e2', '#2c72bd'],
    skin: ['#8b8283', '#6f6667', '#565051', '#3a3536'],
    hair: ['#22232b', '#141519', '#0a0b0e'],
    eye:  ['#ff8a4e', '#db4120', '#9c2c10'],
    line: '#123a63',
  };
  // ═══════════════════════════════════════════════════════════════════════════
  //  THE RIG — his painting, hung on joints.
  //
  //  Fred: "the drawn version looks like shit... nowhere close to the drawing i
  //  gave you." True, and the reason was the medium: his figure is painted with
  //  soft shading, strand hair and a face with features; anything I draw by hand
  //  is a flat vector icon. So we stopped drawing him and CUT HIM UP instead.
  //  gen/cut-rig.py slices his own front figure into head / torso / two sleeves
  //  (rebuilding the sliver of body the sleeves were covering), and this hangs
  //  those pieces on shoulder joints. The arm that hugs is HIS sleeve, rotated.
  // ═══════════════════════════════════════════════════════════════════════════
  // ═══════════════════════════════════════════════════════════════════════════
  //  THE SKINNED MESH — the way Spine does it, and the only way the seams go.
  //
  //  Fred circled every place the cut-out showed: the shoulder join, the rebuilt
  //  body edge, the cuff.  Those are not tuning problems — they ARE the cut.  So
  //  he is not cut any more.  One uncut painting, a triangle mesh laid over it,
  //  a skeleton underneath, and every vertex weighted to the bones near it.  Move
  //  a bone and the cloth STRETCHES: no edge to catch the light, nothing to seam.
  //
  //  And the limbs are real limbs.  An arm is upper arm + forearm + hand, posed by
  //  two-bone IK — give it a hand position and the elbow works out where to go,
  //  the way an elbow does.  A single stick from shoulder to paw is what made the
  //  first attempt read as a flipper.
  // ═══════════════════════════════════════════════════════════════════════════
  var MESH = null, MESH_WAIT = [], MESH_TRIED = false;
  function meshLoad() {
    if (MESH_TRIED) return; MESH_TRIED = true;
    var base = (window.__castBase || '/cast/') + 'rig/', sk = null, imgs = {}, need = 1, got = 0;
    function go() { if (++got < need) return; MESH = buildMesh(sk, imgs);
      MESH_WAIT.splice(0).forEach(function (f) { f(); }); }
    var xhr = new XMLHttpRequest();
    xhr.open('GET', base + 'skeleton.json?v=6', true);
    xhr.onload = function () {
      try { sk = JSON.parse(xhr.responseText); } catch (e) { return go(); }
      need += sk.parts.length;
      sk.parts.forEach(function (pt) {
        var im = new Image(); im.onload = go; im.onerror = go;
        im.src = base + pt.img + '.webp?v=7'; imgs[pt.img] = im;
      });
      go();
    };
    xhr.onerror = go; xhr.send();
  }
  function meshReady() { return !!(MESH && MESH.parts.length); }
  function onMeshReady(cb) { meshLoad(); if (meshReady()) cb(); else MESH_WAIT.push(cb); }

  function segDist(px, py, ax, ay, bx, by) {
    var dx = bx - ax, dy = by - ay, L = dx * dx + dy * dy;
    var t = L ? ((px - ax) * dx + (py - ay) * dy) / L : 0;
    t = t < 0 ? 0 : t > 1 ? 1 : t;
    var qx = ax + dx * t - px, qy = ay + dy * t - py;
    return Math.sqrt(qx * qx + qy * qy);
  }
  var STEP = 8;
  function buildMesh(sk, imgs) {
    if (!sk || !sk.parts) return null;
    var byName = {}; sk.bones.forEach(function (b, i) { byName[b.n] = i; });
    var par = sk.bones.map(function (b) { return b.p != null ? byName[b.p] : -1; });
    var parts = [];
    sk.parts.forEach(function (pt) {
      var im = imgs[pt.img]; if (!im || !im.naturalWidth) return;
      var W = pt.box[2], H = pt.box[3], OX = pt.box[0], OY = pt.box[1];
      var cv = document.createElement('canvas'); cv.width = W; cv.height = H;
      var g = cv.getContext('2d'); g.drawImage(im, 0, 0);
      var px; try { px = g.getImageData(0, 0, W, H).data; } catch (e) { return; }
      function solid(x0, y0, x1, y1) {
        for (var yy = y0; yy < y1; yy += 2) for (var xx = x0; xx < x1; xx += 2)
          if (xx >= 0 && yy >= 0 && xx < W && yy < H && px[(yy * W + xx) * 4 + 3] > 6) return true;
        return false;
      }
      var cols = Math.ceil(W / STEP) + 1, rows = Math.ceil(H / STEP) + 1;
      var vid = new Int32Array(cols * rows).fill(-1), uv = [], tris = [];
      function vAt(c, r) {
        var i = r * cols + c;
        if (vid[i] < 0) { vid[i] = uv.length / 2; uv.push(Math.min(c * STEP, W), Math.min(r * STEP, H)); }
        return vid[i];
      }
      for (var r = 0; r < rows - 1; r++) for (var c = 0; c < cols - 1; c++) {
        if (!solid(c * STEP - STEP, r * STEP - STEP, (c + 2) * STEP, (r + 2) * STEP)) continue;
        var v0 = vAt(c, r), v1 = vAt(c + 1, r), v2 = vAt(c, r + 1), v3 = vAt(c + 1, r + 1);
        tris.push(v0, v1, v2, v1, v3, v2);
      }
      // ── WEIGHTS ── only this part's own bones; separating the parts is what
      //    stops an arm dragging the hood and the feet with it.
      var bl = pt.bones.map(function (n) { return byName[n]; });
      var nv = uv.length / 2, K = Math.min(3, bl.length);
      var wIdx = new Int32Array(nv * 3), wVal = new Float32Array(nv * 3);
      for (var v = 0; v < nv; v++) {
        var fx = OX + uv[v * 2], fy = OY + uv[v * 2 + 1], best = [];
        for (var k = 0; k < bl.length; k++) {
          var B = sk.bones[bl[k]];
          var dd = segDist(fx, fy, B.a[0], B.a[1], B.b[0], B.b[1]);
          best.push([bl[k], (B.k || 1) / Math.pow(dd + 2.5, 3)]);
        }
        best.sort(function (p2, q) { return q[1] - p2[1]; });
        while (best.length < 3) best.push([best[0][0], 0]);
        var sum = 0; for (var j = 0; j < K; j++) sum += best[j][1];
        for (var j2 = 0; j2 < 3; j2++) {
          wIdx[v * 3 + j2] = best[j2][0];
          wVal[v * 3 + j2] = j2 < K ? best[j2][1] / (sum || 1) : 0;
        }
      }
      parts.push({ img: im, ox: OX, oy: OY, uv: uv, tris: tris, wIdx: wIdx, wVal: wVal,
                   out: new Float32Array(uv.length), arm: pt.img.indexOf('arm') === 0, name: pt.img });
    });
    return { w: sk.w, h: sk.h, bones: sk.bones, par: par, byName: byName, parts: parts };
  }

  function triTex(ctx, im, x0,y0,x1,y1,x2,y2, u0,v0,u1,v1,u2,v2) {
    var det = u0 * (v1 - v2) - u1 * (v0 - v2) + u2 * (v0 - v1);
    if (!det) return;
    var cx = (x0 + x1 + x2) / 3, cy = (y0 + y1 + y2) / 3, G = 0.58;
    function gx(x, y) { var d = Math.hypot(x - cx, y - cy) || 1; return [x + (x - cx) / d * G, y + (y - cy) / d * G]; }
    var p0 = gx(x0, y0), p1 = gx(x1, y1), p2 = gx(x2, y2);
    ctx.save();
    ctx.beginPath(); ctx.moveTo(p0[0], p0[1]); ctx.lineTo(p1[0], p1[1]); ctx.lineTo(p2[0], p2[1]); ctx.closePath(); ctx.clip();
    ctx.transform(
      (x0 * (v1 - v2) - x1 * (v0 - v2) + x2 * (v0 - v1)) / det,
      (y0 * (v1 - v2) - y1 * (v0 - v2) + y2 * (v0 - v1)) / det,
      (u0 * (x1 - x2) - u1 * (x0 - x2) + u2 * (x0 - x1)) / det,
      (u0 * (y1 - y2) - u1 * (y0 - y2) + u2 * (y0 - y1)) / det,
      (u0 * (v1 * x2 - v2 * x1) - u1 * (v0 * x2 - v2 * x0) + u2 * (v0 * x1 - v1 * x0)) / det,
      (u0 * (v1 * y2 - v2 * y1) - u1 * (v0 * y2 - v2 * y0) + u2 * (v0 * y1 - v1 * y0)) / det);
    ctx.drawImage(im, 0, 0);
    ctx.restore();
  }

  function drawKidMesh(ctx, p, anim) {
    meshLoad();
    if (!meshReady()) return false;
    anim = anim || {};
    var M = MESH, BN = M.bones, n = BN.length;
    var s = p.h / M.h, facing = p.facing || 1, CX = M.w / 2;
    var x = p.x + (anim.swayX || 0), y = p.y + (anim.bobY || 0);
    var rot = new Float32Array(n);
    // ── two-bone IK: name the hand's place, the elbow works itself out ────
    function reach(upper, fore, tgt, flip) {
      if (!tgt) return null;
      var iu = M.byName[upper], ifo = M.byName[fore];
      var S = BN[iu].a, E = BN[iu].b, Wp = BN[ifo].b;
      var L1 = Math.hypot(E[0] - S[0], E[1] - S[1]), L2 = Math.hypot(Wp[0] - E[0], Wp[1] - E[1]);
      var tx = (tgt[0] - x) / s * (facing < 0 ? -1 : 1) + CX, ty = (tgt[1] - (y - p.h)) / s;
      var dx = tx - S[0], dy = ty - S[1], d = Math.hypot(dx, dy);
      d = Math.max(Math.abs(L1 - L2) + 0.6, Math.min((L1 + L2) * 0.965, d));
      var base = Math.atan2(dy, dx);
      var A = Math.acos(Math.max(-1, Math.min(1, (L1 * L1 + d * d - L2 * L2) / (2 * L1 * d))));
      var a1 = base + A * flip;
      var ex = S[0] + Math.cos(a1) * L1, ey = S[1] + Math.sin(a1) * L1;
      rot[iu] = a1 - Math.atan2(E[1] - S[1], E[0] - S[0]);
      rot[ifo] = (Math.atan2(ty - ey, tx - ex) - Math.atan2(Wp[1] - E[1], Wp[0] - E[0])) - rot[iu];
      return ty;
    }
    var yL = reach('upperL', 'foreL', p.armL, -1);
    var yR = reach('upperR', 'foreR', p.armR, 1);
    if (p.headTilt) rot[M.byName.head] = p.headTilt * Math.PI / 180;
    // ── bone world transforms ────────────────────────────────────────────
    var mc = new Float32Array(n), ms = new Float32Array(n), mx = new Float32Array(n), my = new Float32Array(n);
    for (var i = 0; i < n; i++) {
      var pi = M.par[i], pc = 1, ps = 0, ptx = 0, pty = 0;
      if (pi >= 0) { pc = mc[pi]; ps = ms[pi]; ptx = mx[pi]; pty = my[pi]; }
      var ax = BN[i].a[0], ay = BN[i].a[1];
      var wx = pc * ax - ps * ay + ptx, wy = ps * ax + pc * ay + pty;
      var c = Math.cos(rot[i]), sn = Math.sin(rot[i]);
      mc[i] = c * pc - sn * ps; ms[i] = sn * pc + c * ps;
      mx[i] = c * ptx - sn * pty + (wx - (c * wx - sn * wy));
      my[i] = sn * ptx + c * pty + (wy - (sn * wx + c * wy));
    }
    ctx.save();
    if (facing < 0) { ctx.translate(x, 0); ctx.scale(-1, 1); ctx.translate(-x, 0); }
    if (p.tilt) { ctx.translate(x, y); ctx.rotate(p.tilt * Math.PI / 180); ctx.translate(-x, -y); }
    var ox0 = x - CX * s, oy0 = y - p.h;
    // ── DRAW ORDER ── an arm goes BEHIND the body unless its hand crosses his
    //    own chest.  Behind, the body's silhouette covers the sleeve's cut end
    //    entirely, so there is no edge left to see — the sleeve simply emerges
    //    from his shoulder the way it does in the painting.
    function front(tgt, sign) {
      if (!tgt) return false;
      var tx = (tgt[0] - x) / s * (facing < 0 ? -1 : 1) + CX;
      var ty = (tgt[1] - (y - p.h)) / s;
      return ty > 250 && tx * sign < CX * sign + 46 * sign;
    }
    var fr = { 'arm-l': front(p.armL, 1), 'arm-r': front(p.armR, -1) };
    var order = M.parts.filter(function (q) { return q.arm && !fr[q.name]; })
      .concat(M.parts.filter(function (q) { return !q.arm; }))
      .concat(M.parts.filter(function (q) { return q.arm && fr[q.name]; }));
    order.forEach(function (pt) {
      var uv = pt.uv, O = pt.out, nv = uv.length / 2;
      for (var v = 0; v < nv; v++) {
        var fx = pt.ox + uv[v * 2], fy = pt.oy + uv[v * 2 + 1], gx2 = 0, gy2 = 0;
        for (var j = 0; j < 3; j++) {
          var bi = pt.wIdx[v * 3 + j], w = pt.wVal[v * 3 + j];
          if (!w) continue;
          gx2 += w * (mc[bi] * fx - ms[bi] * fy + mx[bi]);
          gy2 += w * (ms[bi] * fx + mc[bi] * fy + my[bi]);
        }
        O[v * 2] = ox0 + gx2 * s; O[v * 2 + 1] = oy0 + gy2 * s;
      }
      var T = pt.tris;
      for (var t = 0; t < T.length; t += 3) {
        var i0 = T[t], i1 = T[t + 1], i2 = T[t + 2];
        triTex(ctx, pt.img, O[i0*2],O[i0*2+1], O[i1*2],O[i1*2+1], O[i2*2],O[i2*2+1],
               uv[i0*2],uv[i0*2+1], uv[i1*2],uv[i1*2+1], uv[i2*2],uv[i2*2+1]);
      }
    });
    ctx.restore();
    return true;
  }

  var RIG = null, RIG_IMG = {}, RIG_OK = false, RIG_WAIT = [];
  function rigLoad() {
    if (RIG) return;
    RIG = {};
    var base = (window.__castBase || '/cast/') + 'rig/';
    var need = 4, done = 0;
    function tick() { if (++done >= need + 1) { RIG_OK = true; RIG_WAIT.splice(0).forEach(function (f) { f(); }); } }
    var xhr = new XMLHttpRequest();
    xhr.open('GET', base + 'rig.json?v=1', true);
    xhr.onload = function () { try { RIG = JSON.parse(xhr.responseText); } catch (e) {} tick(); };
    xhr.onerror = tick; xhr.send();
    ['head', 'torso', 'arm-l', 'arm-r'].forEach(function (n) {
      var im = new Image(); im.onload = tick; im.onerror = tick;
      im.src = base + n + '.webp?v=1'; RIG_IMG[n] = im;
    });
  }
  function rigReady() { return RIG_OK && RIG && RIG.figure && RIG_IMG.head.naturalWidth > 0; }
  function onRigReady(cb) { rigLoad(); if (rigReady()) cb(); else RIG_WAIT.push(cb); }

  function drawKidRig(ctx, p, anim) {
    rigLoad();
    if (!rigReady()) return false;
    anim = anim || {};
    var F = RIG.figure, h = p.h, s = h / F.h, facing = p.facing || 1;
    var x = p.x + (anim.swayX || 0), y = p.y + (anim.bobY || 0);
    var CX = F.w / 2;
    ctx.save();
    if (facing < 0) { ctx.translate(x, 0); ctx.scale(-1, 1); ctx.translate(-x, 0); }
    if (p.tilt) { ctx.translate(x, y); ctx.rotate(p.tilt * Math.PI / 180); ctx.translate(-x, -y); }
    function place(n, rot) {
      var d = RIG[n]; if (!d) return;
      var im = RIG_IMG[n]; if (!im || !im.naturalWidth) return;
      var bx = x + (d.box[0] - CX) * s, by = y - h + d.box[1] * s;
      if (rot) {
        var px = x + (d.pivot[0] - CX) * s, py = y - h + d.pivot[1] * s;
        ctx.save(); ctx.translate(px, py); ctx.rotate(rot); ctx.translate(-px, -py);
        ctx.drawImage(im, bx, by, d.box[2] * s, d.box[3] * s); ctx.restore();
      } else ctx.drawImage(im, bx, by, d.box[2] * s, d.box[3] * s);
    }
    // ── the joints ── an angle per shoulder, in degrees, positive = raised
    var aL = (p.armAngL || 0) * Math.PI / 180, aR = (p.armAngR || 0) * Math.PI / 180;
    // a hand target is solved back into a shoulder angle, so pages can just say
    // "put his hand there" the way they always could
    function solve(n, tgt) {
      var d = RIG[n]; if (!d || !tgt || !d.hand) return 0;
      var px = x + (d.pivot[0] - CX) * s, py = y - h + d.pivot[1] * s;
      // the angle the arm ALREADY hangs at, measured from his own drawing
      var restA = Math.atan2(d.hand[1] - d.pivot[1], d.hand[0] - d.pivot[0]);
      var want = Math.atan2(tgt[1] - py, (tgt[0] - px) * (facing < 0 ? -1 : 1));
      var r = want - restA;
      while (r > Math.PI) r -= 2 * Math.PI;          // take the short way round,
      while (r < -Math.PI) r += 2 * Math.PI;         // or a raised arm goes behind him
      return r;
    }
    if (p.armL) aL = solve('arm-l', p.armL);
    if (p.armR) aR = solve('arm-r', p.armR);
    // an arm hanging down tucks UNDER the hood; an arm raised to or above the
    // shoulder passes in FRONT of it — otherwise the hood eats the whole sleeve,
    // which is what a raised arm looked like on the first pass.
    var upL = p.armL && p.armL[1] < y - h + RIG['arm-l'].pivot[1] * s + h * 0.06;
    var upR = p.armR && p.armR[1] < y - h + RIG['arm-r'].pivot[1] * s + h * 0.06;
    place('torso', 0);
    if (!upL) place('arm-l', aL);
    if (!upR) place('arm-r', aR);
    place('head', p.headTilt ? p.headTilt * Math.PI / 180 : 0);
    if (upL) place('arm-l', aL);
    if (upR) place('arm-r', aR);
    ctx.restore();
    return true;
  }

  function drawKidBuilt(ctx, p, anim) {
    anim = anim || {};
    var h = p.h, facing = p.facing || 1, back = !!p.back;
    var turn = p.turn == null ? 0 : Math.max(0, Math.min(1, p.turn));
    var x = p.x + (anim.swayX || 0), y = p.y + (anim.bobY || 0);
    var C = p.pal || KB;
    var nar = 1 - turn * 0.30;                 // he narrows as he turns away
    var U = function (v) { return v * h; };
    var X = function (v) { return x + v * h * facing; };
    var Y = function (v) { return y - h + v * h; };
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    function ink(w) { ctx.strokeStyle = C.line; ctx.lineWidth = Math.max(1, U(w == null ? 0.0085 : w)); ctx.stroke(); }
    function lin(x0, y0, x1, y1, st) {
      var g = ctx.createLinearGradient(x0, y0, x1, y1);
      for (var i = 0; i < st.length; i++) g.addColorStop(st[i][0], st[i][1]);
      return g;
    }
    var cloth = lin(X(-0.26), Y(0), X(0.26), Y(0.9),
      [[0, C.hood[0]], [0.26, C.hood[1]], [0.58, C.hood[2]], [0.85, C.hood[3]], [1, C.hood[4]]]);

    // ── PAWS ── flattened, with toe divisions. Never a circle: a disc reads as
    //    a snowman, and that was the note he kept having to repeat.
    function paw(px, py, r, ang, foot) {
      ctx.save(); ctx.translate(px, py); ctx.rotate(ang || 0);
      var w = r * (foot ? 1.16 : 0.98), t = r * (foot ? 0.78 : 0.92);
      ctx.beginPath();
      ctx.moveTo(-w, t * 0.10);
      ctx.bezierCurveTo(-w * 1.05, -t * 0.66, -w * 0.32, -t * 1.05, w * 0.20, -t * 0.90);
      ctx.bezierCurveTo(w * 0.60, -t * 0.80, w * 0.82, -t * 0.42, w * 0.92, -t * 0.10);
      ctx.quadraticCurveTo(w * 1.06, t * 0.20, w * 0.80, t * 0.44);
      ctx.bezierCurveTo(w * 0.20, t * 1.02, -w * 0.66, t * 0.90, -w, t * 0.10);
      ctx.closePath();
      var pg = ctx.createLinearGradient(-w, -t, w, t);
      pg.addColorStop(0, C.skin[0]); pg.addColorStop(0.5, C.skin[1]); pg.addColorStop(1, C.skin[3]);
      ctx.fillStyle = pg; ctx.fill(); ink(0.007);
      ctx.strokeStyle = 'rgba(20,18,20,0.34)'; ctx.lineWidth = Math.max(1, U(0.005));
      for (var i = 0; i < 2; i++) {
        var ty = -t * 0.30 + i * t * 0.52;
        ctx.beginPath(); ctx.moveTo(w * 0.26, ty);
        ctx.quadraticCurveTo(w * 0.56, ty + t * 0.05, w * 0.74, ty + t * 0.02); ctx.stroke();
      }
      ctx.restore();
    }

    // ── AN ARM THAT ARTICULATES ──────────────────────────────────────────
    //    Shoulder → elbow → hand. The elbow is solved from how far the hand is:
    //    an arm reaching out is nearly straight, an arm holding on is folded.
    //    THIS is the thing a sprite cannot do.
    function arm(sgn, target, over) {
      var sx = X(sgn * 0.105 * nar), sy = Y(0.478);      // tucked under the hood
      var hx = target ? target[0] : X(sgn * 0.212 * nar);
      var hy = target ? target[1] : Y(0.792);            // his sleeves hang LONG
      var dx = hx - sx, dy = hy - sy, d = Math.max(1, Math.hypot(dx, dy));
      var L = U(0.30), fold = 1 - Math.min(1, d / L);
      var bend = fold * U(0.13) + U(0.025);
      var nx = -dy / d, ny = dx / d, sw = sgn * facing;
      var ex = sx + dx * 0.5 + nx * bend * sw, ey = sy + dy * 0.5 + ny * bend * sw;
      var w0 = U(0.072), w1 = U(0.053);
      function edge(off) {
        var pts = [];
        for (var t = 0; t <= 1.0001; t += 0.1) {
          var ax = (1 - t) * (1 - t) * sx + 2 * (1 - t) * t * ex + t * t * hx;
          var ay = (1 - t) * (1 - t) * sy + 2 * (1 - t) * t * ey + t * t * hy;
          var tx = 2 * (1 - t) * (ex - sx) + 2 * t * (hx - ex);
          var ty = 2 * (1 - t) * (ey - sy) + 2 * t * (hy - ey);
          var tl = Math.max(1, Math.hypot(tx, ty)), w = w0 + (w1 - w0) * t;
          pts.push([ax - (ty / tl) * off * w, ay + (tx / tl) * off * w]);
        }
        return pts;
      }
      var A = edge(1), B = edge(-1);
      ctx.beginPath(); ctx.moveTo(A[0][0], A[0][1]);
      for (var i = 1; i < A.length; i++) ctx.lineTo(A[i][0], A[i][1]);
      ctx.quadraticCurveTo(hx, hy, B[B.length - 1][0], B[B.length - 1][1]);
      for (var j = B.length - 2; j >= 0; j--) ctx.lineTo(B[j][0], B[j][1]);
      ctx.closePath();
      ctx.fillStyle = cloth; ctx.fill();
      if (over) ink();                          // the near arm gets its own contour
      else { ctx.strokeStyle = 'rgba(18,58,99,0.55)'; ctx.lineWidth = Math.max(1, U(0.007)); ctx.stroke(); }
      var cA = A[A.length - 2], cB = B[B.length - 2];
      ctx.beginPath(); ctx.moveTo(cA[0], cA[1]); ctx.lineTo(cB[0], cB[1]);
      ctx.strokeStyle = 'rgba(18,58,99,0.40)'; ctx.lineWidth = U(0.010); ctx.stroke();
      paw(hx, hy, U(0.050), Math.atan2(hy - ey, hx - ex) - Math.PI / 2, false);
    }
    var tFar  = p.armFar  || (facing > 0 ? p.armL : p.armR) || null;
    var tNear = p.armNear || (facing > 0 ? p.armR : p.armL) || null;

    // ── the far arm, behind everything ───────────────────────────────────
    arm(-1, facing > 0 ? tFar : tNear, false);

    // ── FEET ─────────────────────────────────────────────────────────────
    var st = p.stride || 0;
    paw(X((-0.108 - st * 0.05) * nar), Y(0.965), U(0.058), -0.10 * facing, true);
    paw(X((0.108 + st * 0.05) * nar), Y(0.975), U(0.058), 0.10 * facing, true);

    // ── THE HOODIE ── a bell that PINCHES at the shoulders ───────────────
    function body() {
      ctx.beginPath();
      ctx.moveTo(X(-0.151 * nar), Y(0.462));
      ctx.bezierCurveTo(X(-0.180 * nar), Y(0.525), X(-0.200 * nar), Y(0.620), X(-0.209 * nar), Y(0.735));
      ctx.bezierCurveTo(X(-0.214 * nar), Y(0.815), X(-0.208 * nar), Y(0.862), X(-0.196 * nar), Y(0.888));
      ctx.bezierCurveTo(X(-0.108 * nar), Y(0.920), X(0.108 * nar), Y(0.920), X(0.196 * nar), Y(0.888));
      ctx.bezierCurveTo(X(0.208 * nar), Y(0.862), X(0.214 * nar), Y(0.815), X(0.209 * nar), Y(0.735));
      ctx.bezierCurveTo(X(0.200 * nar), Y(0.620), X(0.180 * nar), Y(0.525), X(0.151 * nar), Y(0.462));
      ctx.bezierCurveTo(X(0.075 * nar), Y(0.442), X(-0.075 * nar), Y(0.442), X(-0.151 * nar), Y(0.462));
      ctx.closePath();
    }
    body(); ctx.fillStyle = cloth; ctx.fill();
    ctx.save(); body(); ctx.clip();
    // the hem's shadow, and two soft folds falling from the shoulders
    ctx.beginPath(); ctx.moveTo(X(-0.24), Y(0.876)); ctx.lineTo(X(0.24), Y(0.876));
    ctx.strokeStyle = 'rgba(18,58,99,0.18)'; ctx.lineWidth = U(0.024); ctx.stroke();
    for (var f2 = -1; f2 <= 1; f2 += 2) {
      ctx.beginPath(); ctx.moveTo(X(f2 * 0.070 * nar), Y(0.55));
      ctx.quadraticCurveTo(X(f2 * 0.098 * nar), Y(0.72), X(f2 * 0.108 * nar), Y(0.875));
      ctx.strokeStyle = f2 * facing < 0 ? 'rgba(255,255,255,0.20)' : 'rgba(18,58,99,0.15)';
      ctx.lineWidth = U(0.014); ctx.stroke();
    }
    ctx.restore(); body(); ink();

    // ── the near arm, over the body ──────────────────────────────────────
    arm(1, facing > 0 ? tNear : tFar, true);

    // ── THE HOOD ── an egg, widest low, with the crown drooping back ─────
    var pk = -facing;                            // the droop falls behind him
    function hood() {
      ctx.beginPath();
      ctx.moveTo(X(-pk * 0.197 * nar), Y(0.420));
      ctx.bezierCurveTo(X(-pk * 0.230 * nar), Y(0.330), X(-pk * 0.215 * nar), Y(0.170), X(-pk * 0.140 * nar), Y(0.070));
      ctx.bezierCurveTo(X(-pk * 0.085 * nar), Y(0.010), X(pk * 0.010), Y(-0.008), X(pk * 0.075), Y(0.020));
      ctx.bezierCurveTo(X(pk * (0.150 + turn * 0.10)), Y(0.060), X(pk * (0.215 + turn * 0.07)), Y(0.160), X(pk * 0.230), Y(0.300));
      ctx.bezierCurveTo(X(pk * 0.234), Y(0.360), X(pk * 0.222), Y(0.412), X(pk * 0.190), Y(0.448));
      ctx.bezierCurveTo(X(pk * 0.100), Y(0.472), X(-pk * 0.090), Y(0.470), X(-pk * 0.197 * nar), Y(0.420));
      ctx.closePath();
    }
    hood(); ctx.fillStyle = cloth; ctx.fill();
    ctx.save(); hood(); ctx.clip();
    ctx.beginPath();                             // the seam over the crown
    ctx.moveTo(X(pk * 0.02), Y(0.012));
    ctx.bezierCurveTo(X(pk * 0.115), Y(0.090), X(pk * 0.180), Y(0.220), X(pk * 0.176), Y(0.400));
    ctx.strokeStyle = 'rgba(18,58,99,0.22)'; ctx.lineWidth = U(0.009); ctx.stroke();
    ctx.restore(); hood(); ink();

    if (!back) {
      var fx = X(turn * 0.085), fy = Y(0.295), fw = U(0.127 * (1 - turn * 0.26)), fh = U(0.108);
      // the cowl's opening, with a lit rim — cloth has thickness
      ctx.save();
      ctx.beginPath(); ctx.ellipse(fx, fy - fh * 0.20, fw * 1.24, fh * 1.50, 0, 0, 6.2832);
      ctx.fillStyle = C.hair[1]; ctx.fill();
      ctx.beginPath(); ctx.ellipse(fx, fy - fh * 0.20, fw * 1.24, fh * 1.50, 0, 0, 6.2832); ctx.clip();
      // ── THE FACE ── cheeks widest UNDER the eyes, then a jaw, then a chin
      ctx.beginPath();
      ctx.moveTo(fx - fw * 0.86, fy - fh * 0.60);
      ctx.bezierCurveTo(fx - fw * 1.02, fy - fh * 0.10, fx - fw * 0.96, fy + fh * 0.38, fx - fw * 0.56, fy + fh * 0.80);
      ctx.quadraticCurveTo(fx - fw * 0.24, fy + fh * 1.04, fx, fy + fh * 1.06);
      ctx.quadraticCurveTo(fx + fw * 0.24, fy + fh * 1.04, fx + fw * 0.56, fy + fh * 0.80);
      ctx.bezierCurveTo(fx + fw * 0.96, fy + fh * 0.38, fx + fw * 1.02, fy - fh * 0.10, fx + fw * 0.86, fy - fh * 0.60);
      ctx.bezierCurveTo(fx + fw * 0.55, fy - fh * 1.10, fx - fw * 0.55, fy - fh * 1.10, fx - fw * 0.86, fy - fh * 0.60);
      ctx.closePath();
      var fg = ctx.createRadialGradient(fx - fw * 0.25 * facing, fy - fh * 0.35, fw * 0.15, fx, fy + fh * 0.3, fw * 1.25);
      fg.addColorStop(0, C.skin[0]); fg.addColorStop(0.5, C.skin[1]); fg.addColorStop(1, C.skin[2]);
      ctx.fillStyle = fg; ctx.fill();
      // ── THE HAIR ── a bob: a fringe with points, and locks past the cheeks
      ctx.fillStyle = C.hair[1];
      ctx.beginPath();
      ctx.moveTo(fx - fw * 1.34, fy - fh * 1.90);
      ctx.lineTo(fx + fw * 1.34, fy - fh * 1.90);
      ctx.lineTo(fx + fw * 1.22, fy + fh * 0.70);            // right lock, past the cheek
      ctx.quadraticCurveTo(fx + fw * 1.02, fy + fh * 0.20, fx + fw * 0.90, fy - fh * 0.22);
      ctx.quadraticCurveTo(fx + fw * 0.66, fy - fh * 0.02, fx + fw * 0.42, fy - fh * 0.30);
      ctx.quadraticCurveTo(fx + fw * 0.18, fy - fh * 0.04, fx - fw * 0.04, fy - fh * 0.32);
      ctx.quadraticCurveTo(fx - fw * 0.28, fy - fh * 0.04, fx - fw * 0.50, fy - fh * 0.28);
      ctx.quadraticCurveTo(fx - fw * 0.74, fy - fh * 0.02, fx - fw * 0.92, fy - fh * 0.24);
      ctx.quadraticCurveTo(fx - fw * 1.04, fy + fh * 0.22, fx - fw * 1.22, fy + fh * 0.72);
      ctx.closePath(); ctx.fill();
      // ── THE EYES ── big, round, catch-lit. This is the whole character.
      var mood = p.mood || 'open';
      var gz = ((p.eye ? p.eye[0] : 0) + (anim.gazeX || 0)) * U(0.010);
      var gy = ((p.eye ? p.eye[1] : 0) + (anim.gazeY || 0)) * U(0.008);
      var er = U(0.027), sep = U(0.068 * (1 - turn * 0.34));
      for (var e = -1; e <= 1; e += 2) {
        if (turn > 0.80 && e * facing < 0) continue;
        var ex2 = fx + e * sep * facing + gz, ey2 = Y(0.276) + gy;
        if (mood === 'joy') {
          ctx.strokeStyle = '#1b1216'; ctx.lineWidth = Math.max(1.4, er * 0.38);
          ctx.beginPath(); ctx.arc(ex2, ey2 + er * 0.30, er * 0.86, Math.PI * 1.08, Math.PI * 1.92); ctx.stroke();
          continue;
        }
        ctx.beginPath(); ctx.ellipse(ex2, ey2, er, er * 1.04, 0, 0, 6.2832);
        var eg = ctx.createRadialGradient(ex2 - er * 0.22, ey2 - er * 0.28, er * 0.10, ex2, ey2, er * 1.18);
        eg.addColorStop(0, C.eye[0]); eg.addColorStop(0.5, C.eye[1]); eg.addColorStop(1, C.eye[2]);
        ctx.fillStyle = eg; ctx.fill();
        ctx.strokeStyle = '#20100c'; ctx.lineWidth = Math.max(1, er * 0.17); ctx.stroke();
        ctx.fillStyle = '#fff6ec';
        ctx.beginPath(); ctx.ellipse(ex2 - er * 0.32, ey2 - er * 0.34, er * 0.30, er * 0.25, -0.4, 0, 6.2832); ctx.fill();
      }
      if (mood === 'wonder' || mood === 'wary') {
        ctx.fillStyle = 'rgba(26,18,22,0.8)';
        ctx.beginPath(); ctx.ellipse(fx + gz, Y(0.345), er * 0.26, er * 0.30, 0, 0, 6.2832); ctx.fill();
      }
      ctx.restore();
      // the rim of the cowl, catching light over the top of the opening
      ctx.beginPath();
      ctx.ellipse(fx, fy - fh * 0.20, fw * 1.27, fh * 1.53, 0, Math.PI * 1.03, Math.PI * 1.97);
      ctx.strokeStyle = 'rgba(196,231,255,0.34)'; ctx.lineWidth = U(0.017); ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(fx, fy - fh * 0.20, fw * 1.24, fh * 1.50, 0, 0, 6.2832);
      ctx.strokeStyle = 'rgba(18,58,99,0.55)'; ctx.lineWidth = Math.max(1, U(0.006)); ctx.stroke();
    }
    return true;
  }

  // ── WHICH WAY EACH DRAWING LOOKS ───────────────────────────────────────────
  //  His cells are NOT all drawn facing the same way, so the engine cannot mirror
  //  on one rule. Fred caught it on 'he ran': the child walked away from the
  //  Father instead of toward Him — because `walk` is drawn facing LEFT while the
  //  book's convention is facing:1 = right. Measured off the cells themselves
  //  (his eyes are the one saturated red-orange on him; their offset from the
  //  body's centre gives the direction), and `python3 gen/cut-cells.py` prints
  //  this for every new sheet. 0 = a front or back view, which has no direction
  //  and must never be flipped.
  var CELL_FACING = {
    // ⚠ `offer` is aimed by the HAND, not the eyes. The cutter reads direction from
    // his eyes and called this one RIGHT on a +0.043 offset, but the gesture that
    // matters is the arm — and it reaches LEFT in the drawing.
    'offer': -1,
    // the fireside four, measured by the cutter: both of these face LEFT in the drawing
    // ('sit-offer' -0.370, 'sit-take' -0.053). `sit-back` and `sit-laugh` have no side to
    // mirror and are left out on purpose.
    'sit-offer': -1, 'sit-take': -1,
    /* sheet 11, measured by the cutter off the eyes — but two of these are aimed by the
       GESTURE, which is what has to be believed (the same correction `offer` and `sowing`
       needed above):
         · `lead-hand` walks away to the LEFT with the near arm reaching BACK to the right;
           the cutter agreed (-0.074). Mirrored, he leads to the right and reaches back left.
         · `taken-hand` reads front off the eyes (-0.034) but the whole pose is one arm
           thrown out to the drawing's RIGHT; it is that arm the other child takes. */
    'lead-hand': -1, 'taken-hand': 1, 'run-open': 1, 'greet-wave': 1,
    /* ⚠ `light-take` — the cutter called it RIGHT off the eyes (+0.104) and I believed it, so
       on `candle` the child was mirrored and ended up holding her hands out AWAY from the
       flame. Fred: "the yellow kid should be flipped facing the blue kid." The pose is aimed
       by the CUPPED HANDS, and they reach to the drawing's LEFT. Third cell on this sheet
       where the gesture and the eyes disagree — believe the gesture. */
    'light-take': -1,
    'side': -1, 'side-far': -1, 'three-quarter': -1, 'walk': -1, 'walk-joy': -1,
    'afraid-crouch': -1, 'hands-up': -1, 'sulking': -1,
    // ⚠ `sowing` is aimed by the PLANTING HAND, which reaches left in the drawing —
    // and the cutter agreed off his eyes (-0.205). Never mirror it: mirrored, he would
    // sow away from the rows the plate draws.
    'sowing': -1,
    // ⚠ `eating` is DRAWN facing left like almost everything on the sheet, and bread sets
    // facing:1 so the engine mirrors it — Fred: "flip it so not all the pages have the kid
    // looking left." Without this entry the mirror would not happen and he would face into
    // the trunk instead of out across the field.
    'eating': -1,
    // ⚠ `trio` is deliberately ABSENT from this table. It is one drawing of three children
    // holding each other; mirroring it would swap who is holding whom and put the falling
    // child's grip on the wrong arms. It is used exactly as drawn, at facing 1.
    'breaking': 1,   // drawn offering to the viewer's right; facing:-1 mirrors it
    'running': 1, 'teddy': 1, 'treat': 1, 'cheering': 1, 'joy': 1, 'teary': 1, 'reading': 1,
  };

  function drawKid(ctx, p, anim) {
    anim = anim || {};
    var cell = kidCell(p);
    var im = kidImage(cell);
    if (!im.complete || !im.naturalWidth) return false;      // the old pilgrim covers for him
    var base = p.kidPal ? kidTinted(cell, p.kidPal) : kidDehatched(cell);
    if (base) im = base;                                     // one cloth for the whole cast
    var h = p.h, w = h * ((im.naturalWidth || im.width) / (im.naturalHeight || im.height));
    var x = p.x + (anim.swayX || 0), y = p.y + (anim.bobY || 0);
    ctx.save();
    // mirror only when the drawing already looks the wrong way — see CELL_FACING
    var nat = CELL_FACING[cell] || 0;
    if (nat && nat !== (p.facing || 1)) { ctx.translate(x, 0); ctx.scale(-1, 1); ctx.translate(-x, 0); }
    // ⚠ A CARRIED CHILD LEANS. Sat bolt upright he reads as luggage; a small tilt about his
    // own seat is most of what makes him look like he is holding on to somebody.
    if (p.tilt) { ctx.translate(x, y); ctx.rotate(p.tilt * Math.PI / 180); ctx.translate(-x, -y); }
    ctx.drawImage(im, x - w / 2, y - h, w, h);               // anchored at his feet
    ctx.restore();
    // ⚠ AND HE HOLDS ON. His sheet has no hugging pose, but the whole gesture is two small
    // paws round the carrier's neck — so they are drawn where the page says the neck is,
    // over the top of him, in his own skin colour.
    if (p.hug) {
      // ⚠ IN THE FIGURE'S OWN SPACE, NOT THE PLATE'S. drawActorFrame hands every actor a
      // LOCAL frame (x = box.w/2, y = box.h - 4), so plate coordinates land off-canvas and
      // the paws simply never appeared. They are offsets from his own body now.
      var pal = p.kidPal || {};
      var sk = pal.skin || '#575052';
      var pr = h * 0.085;
      var hugs = [[x - h * 0.30, y - h * 0.26], [x + h * 0.30, y - h * 0.22]];
      for (var hh = 0; hh < 2; hh++) {
        var hp = hugs[hh];
        ctx.save();
        ctx.fillStyle = sk;
        ctx.beginPath();
        ctx.ellipse(hp[0], hp[1], pr, pr * 0.82, hh ? 0.4 : -0.4, 0, 6.2832);
        ctx.fill();
        ctx.strokeStyle = 'rgba(14,26,40,0.55)'; ctx.lineWidth = Math.max(1, h * 0.012); ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,0.18)';
        ctx.beginPath(); ctx.ellipse(hp[0] - pr * 0.2, hp[1] - pr * 0.25, pr * 0.44, pr * 0.3, 0, 0, 6.2832); ctx.fill();
        ctx.restore();
      }
    }
    return true;
  }

  function drawHooded(ctx, p, anim) {
    // ⚠ TRACED, NOT INVENTED. Fred: "instead of redrawing it, retrace it… yours look really
    // scary." The first attempt guessed at the design and produced a black void with two
    // glowing dots in it. Every proportion below is measured off his reference sheet:
    //   hood+head = 48% of the total height · face opening 0.62 of the hood's width
    //   eyes: big soft rounds, 0.19 of head width, set 0.5 apart, with a real catch-light
    //   hair frames the face on BOTH sides and falls in a fringe — without it the opening
    //   reads as a hole, which is the whole difference between "child" and "wraith"
    //   sleeves are TUBES ending in paws; the hem is a soft bell; two paws for feet
    anim = anim || {};
    var cols = p.cols || HOOD, skin = p.skin || SKINC, eyec = p.eyec || EYEC;
    var h = p.h, facing = p.facing || 1, back = !!p.back;
    var turn = p.turn == null ? 0 : p.turn;
    var x = p.x + (anim.swayX || 0), y = p.y + (anim.bobY || 0);
    // ⚠ EVERY NUMBER BELOW IS MEASURED OFF THE REFERENCE, as a fraction of his height.
    // Guessing them is what produced first a wraith and then a kid wearing a sack.
    //   hood block  0 .. 0.42h      shoulders 0.40h      hem 0.90h      paws to 1.00h
    //   hood width  0.46h           hem half-width 0.25h
    //   face        0.26h x 0.30h, centred at 0.20h      eyes r 0.036h, set 0.062h apart
    var HH = h * 0.42, HW = h * 0.46;
    var cx = x + (p.lean || 0) * 0.3;
    var hcy = y - h + h * 0.21;                  // hood centre
    var bs = (Math.floor(Math.abs(p.x) * 131 + Math.abs(p.y) * 17 + h * 7) | 0) >>> 0 || 7;
    var brnd = function () { bs = (bs * 1103515245 + 12345) & 0x7fffffff; return bs / 0x7fffffff; };
    function broke(hex, dl, warm) {
      var v = hexA(hex);
      var w = (warm == null ? (brnd() - 0.5) : warm) * 18;
      var l = (dl == null ? (brnd() - 0.5) * 20 : dl);
      return rgbS(v[0] + l + w, v[1] + l, v[2] + l - w);
    }
    var lineC = '#1d2b3d';
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';

    // ---- BODY: a hoodie with nearly straight sides and a soft hem ----
    var shY = y - h + h * 0.40, hemY = y - h * 0.10;
    var shW = h * 0.21, hemW = h * 0.25;
    function bodyPath(c2) {
      c2.beginPath();
      c2.moveTo(cx - shW, shY);
      c2.quadraticCurveTo(cx - hemW * 1.02, (shY + hemY) / 2, cx - hemW, hemY);
      c2.quadraticCurveTo(cx, hemY + h * 0.028, cx + hemW, hemY);
      c2.quadraticCurveTo(cx + hemW * 1.02, (shY + hemY) / 2, cx + shW, shY);
      c2.quadraticCurveTo(cx, shY - h * 0.04, cx - shW, shY);
      c2.closePath();
    }
    bodyPath(ctx); ctx.fillStyle = cols[1]; ctx.fill();
    ctx.save(); bodyPath(ctx); ctx.clip();
    for (var i = 0, nB = Math.max(20, Math.round(h * 0.22)); i < nB; i++) {
      var bx = cx + (brnd() * 2 - 1) * hemW, byy = shY + brnd() * (hemY - shY);
      var side = (bx - cx) / hemW;
      ctx.strokeStyle = broke(side < -0.2 ? cols[0] : side > 0.4 ? cols[2] : cols[1], null, -side * 0.5);
      ctx.lineWidth = Math.max(1.4, h * 0.022); ctx.globalAlpha = 0.3 + brnd() * 0.25;
      ctx.beginPath(); ctx.moveTo(bx, byy - h * 0.04); ctx.lineTo(bx + (brnd() - 0.5) * 4, byy + h * 0.04); ctx.stroke();
    }
    ctx.globalAlpha = 1; ctx.restore();
    bodyPath(ctx); ctx.strokeStyle = lineC; ctx.lineWidth = Math.max(1.1, h * 0.008); ctx.stroke();

    // ---- SLEEVES: short tubes at the sides, a paw at each cuff ----
    var pawR = h * 0.055;
    function paw(px, py, rr) {
      ctx.fillStyle = skin[1];
      ctx.beginPath(); ctx.ellipse(px, py, rr, rr * 0.9, 0, 0, 6.2832); ctx.fill();
      ctx.strokeStyle = lineC; ctx.lineWidth = Math.max(0.9, h * 0.006); ctx.stroke();
      ctx.fillStyle = skin[0]; ctx.globalAlpha = 0.45;
      ctx.beginPath(); ctx.ellipse(px - rr * 0.2, py - rr * 0.26, rr * 0.42, rr * 0.28, 0, 0, 6.2832); ctx.fill();
      ctx.globalAlpha = 1;
    }
    function sleeve(sgn) {
      var sx = cx + sgn * shW * 0.9, sy = shY + h * 0.03;
      var ex = cx + sgn * hemW * 1.0, ey = shY + (hemY - shY) * 0.72;
      ctx.strokeStyle = cols[1]; ctx.lineWidth = h * 0.082; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(sx, sy); ctx.quadraticCurveTo(cx + sgn * hemW * 1.02, (sy + ey) / 2, ex, ey); ctx.stroke();
      ctx.strokeStyle = lineC; ctx.lineWidth = Math.max(0.9, h * 0.006); ctx.globalAlpha = 0.5;
      ctx.beginPath(); ctx.moveTo(ex - sgn * h * 0.03, ey + h * 0.012); ctx.lineTo(ex + sgn * h * 0.03, ey + h * 0.006); ctx.stroke();
      ctx.globalAlpha = 1;
      paw(ex + sgn * h * 0.012, ey + h * 0.05, pawR * 0.9);
    }
    sleeve(-1); sleeve(1);

    // ---- FEET: two paws peeking under the hem ----
    paw(cx - h * 0.075, hemY + pawR * 0.5, pawR);
    paw(cx + h * 0.075, hemY + pawR * 0.5, pawR);

    // ---- THE HOOD: a round crown carrying back into a soft point ----
    var faceCX = cx + facing * h * 0.02 + turn * h * 0.05 * facing;
    var pk = -facing;
    // ⚠ A ROUND CROWN WITH A SMALL POINT AT THE BACK. Swept too far forward it becomes a
    // nightcap; drawn as its own shape it becomes a rabbit ear. It is a hood: a circle over
    // the head, gathered to a modest tip behind, and its skirt covers the shoulders.
    function hoodPath(c2) {
      var r = HW * 0.5;
      c2.beginPath();
      c2.moveTo(cx + facing * r * 0.86, hcy + HH * 0.46);                       // front, at the jaw
      c2.quadraticCurveTo(cx + facing * r * 1.06, hcy - HH * 0.16, cx + facing * r * 0.34, hcy - HH * 0.52);
      c2.quadraticCurveTo(cx, hcy - HH * 0.64, cx + pk * r * 0.42, hcy - HH * 0.46);   // over the crown
      c2.quadraticCurveTo(cx + pk * r * 0.86, hcy - HH * 0.62, cx + pk * r * 1.12, hcy - HH * 0.4);  // the tip
      c2.quadraticCurveTo(cx + pk * r * 0.92, hcy - HH * 0.16, cx + pk * r * 0.94, hcy + HH * 0.12);
      c2.quadraticCurveTo(cx + pk * r * 0.9, hcy + HH * 0.46, cx + pk * r * 0.5, hcy + HH * 0.52);
      c2.quadraticCurveTo(cx, hcy + HH * 0.62, cx + facing * r * 0.86, hcy + HH * 0.46);
      c2.closePath();
    }
    hoodPath(ctx); ctx.fillStyle = cols[1]; ctx.fill();
    ctx.save(); hoodPath(ctx); ctx.clip();
    for (var k = 0, nH = Math.max(18, Math.round(h * 0.2)); k < nH; k++) {
      var ha = brnd() * 6.2832, hr = Math.sqrt(brnd());
      var hx = cx + Math.cos(ha) * HW * 0.5 * hr, hy2 = hcy + Math.sin(ha) * HH * 0.5 * hr;
      var lit = Math.cos(ha) * -facing + 0.25;
      ctx.strokeStyle = broke(lit > 0.5 ? cols[0] : lit < -0.15 ? cols[2] : cols[1], null, lit * 0.5);
      ctx.lineWidth = Math.max(1.2, h * 0.022); ctx.globalAlpha = 0.3 + brnd() * 0.25;
      ctx.beginPath(); ctx.moveTo(hx, hy2 - h * 0.03); ctx.lineTo(hx + (brnd() - 0.5) * 5, hy2 + h * 0.03); ctx.stroke();
    }
    ctx.globalAlpha = 1; ctx.restore();
    hoodPath(ctx); ctx.strokeStyle = lineC; ctx.lineWidth = Math.max(1.1, h * 0.008); ctx.stroke();
    if (back) return;

    // ---- THE FACE inside the opening ----
    var fw = h * 0.15 * (1 - turn * 0.18), fh = h * 0.17;
    var fcy = y - h + h * 0.205;
    function facePath(c2) {
      c2.beginPath();
      c2.ellipse(faceCX, fcy, fw, fh, 0, 0, 6.2832);
      c2.closePath();
    }
    facePath(ctx); ctx.fillStyle = skin[1]; ctx.fill();
    ctx.save(); facePath(ctx); ctx.clip();
    ctx.fillStyle = skin[0]; ctx.globalAlpha = 0.55;      // the light falls on the upper cheek
    ctx.beginPath(); ctx.ellipse(faceCX - fw * 0.22 * facing, fcy - fh * 0.18, fw * 0.72, fh * 0.5, 0, 0, 6.2832); ctx.fill();
    ctx.globalAlpha = 1;
    // HAIR — a fringe across the brow and a lock down each side. This is what makes him
    // a child in a hood instead of a face-shaped hole.
    ctx.fillStyle = HAIRC[1];
    ctx.beginPath();
    ctx.moveTo(faceCX - fw * 1.05, fcy - fh * 0.05);
    ctx.quadraticCurveTo(faceCX - fw * 0.75, fcy - fh * 1.02, faceCX - fw * 0.1, fcy - fh * 0.5);
    ctx.quadraticCurveTo(faceCX + fw * 0.2, fcy - fh * 0.92, faceCX + fw * 0.6, fcy - fh * 0.48);
    ctx.quadraticCurveTo(faceCX + fw * 0.9, fcy - fh * 0.86, faceCX + fw * 1.05, fcy - fh * 0.02);
    ctx.lineTo(faceCX + fw * 1.05, fcy - fh * 1.1);
    ctx.lineTo(faceCX - fw * 1.05, fcy - fh * 1.1);
    ctx.closePath(); ctx.fill();
    for (var g = 0, nG = Math.max(8, Math.round(fw * 0.5)); g < nG; g++) {
      ctx.strokeStyle = broke(brnd() < 0.5 ? HAIRC[0] : HAIRC[2], null, null);
      ctx.lineWidth = Math.max(0.8, fw * 0.07); ctx.globalAlpha = 0.6;
      var gx2 = faceCX + (brnd() * 2 - 1) * fw * 0.95, gy2 = fcy - fh * (0.3 + brnd() * 0.6);
      ctx.beginPath(); ctx.moveTo(gx2, gy2 - fh * 0.2); ctx.lineTo(gx2 + (brnd() - 0.5) * fw * 0.3, gy2 + fh * 0.24); ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.restore();

    // ---- THE EYES: big, soft, warm — the opposite of two dots in the dark ----
    var mood = p.mood || 'open';
    var gz = ((p.eye ? p.eye[0] : 0) + (anim.gazeX || 0)) * h * 0.012;
    var gyv = ((p.eye ? p.eye[1] : 0) + (anim.gazeY || 0)) * fh * 0.12;
    var er = h * 0.043, sep = h * 0.063;
    for (var e = -1; e <= 1; e += 2) {
      if (turn > 0.72 && e === -facing) continue;
      var ecx = faceCX + e * sep + gz, ecy = fcy + fh * 0.12 + gyv;
      if (mood === 'joy') {                                  // closed, happy arcs
        ctx.strokeStyle = '#20161a'; ctx.lineWidth = Math.max(1.4, er * 0.42); ctx.lineCap = 'round';
        ctx.beginPath(); ctx.arc(ecx, ecy + er * 0.34, er * 0.86, Math.PI * 1.13, Math.PI * 1.87); ctx.stroke();
        continue;
      }
      ctx.fillStyle = eyec[1];
      ctx.beginPath(); ctx.ellipse(ecx, ecy, er, er * 1.04, 0, 0, 6.2832); ctx.fill();
      ctx.fillStyle = eyec[2]; ctx.globalAlpha = 0.55;       // depth at the bottom of the iris
      ctx.beginPath(); ctx.ellipse(ecx, ecy + er * 0.3, er * 0.9, er * 0.55, 0, 0, 6.2832); ctx.fill();
      ctx.globalAlpha = 1;
      ctx.strokeStyle = '#2a1410'; ctx.lineWidth = Math.max(0.9, er * 0.18);
      ctx.beginPath(); ctx.ellipse(ecx, ecy, er, er * 1.04, 0, 0, 6.2832); ctx.stroke();
      ctx.fillStyle = '#fff6ec';                             // the catch-light that makes him alive
      ctx.beginPath(); ctx.ellipse(ecx - er * 0.32, ecy - er * 0.38, er * 0.3, er * 0.26, 0, 0, 6.2832); ctx.fill();
      ctx.globalAlpha = 0.7;
      ctx.beginPath(); ctx.ellipse(ecx + er * 0.28, ecy + er * 0.34, er * 0.15, er * 0.13, 0, 0, 6.2832); ctx.fill();
      ctx.globalAlpha = 1;
    }
    if (mood === 'wonder' || mood === 'wary') {
      ctx.fillStyle = '#20161a';
      ctx.beginPath(); ctx.ellipse(faceCX + gz, fcy + fh * 0.56, er * 0.26, er * 0.3, 0, 0, 6.2832); ctx.fill();
    } else if (mood !== 'joy') {
      ctx.strokeStyle = '#20161a'; ctx.lineWidth = Math.max(0.8, er * 0.16); ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(faceCX + gz - er * 0.2, fcy + fh * 0.56);
      ctx.lineTo(faceCX + gz + er * 0.2, fcy + fh * 0.56); ctx.stroke();
    }
  }

  function drawPilgrim(ctx, p, anim) {
    var cols = p.cols || RED, maskCols = p.maskCols || MASKC;
    var BASE = hexA(cols[1]), LT = hexA(cols[0]), SH = hexA(cols[2]);
    var OUT2 = 'rgba(0,0,0,0)';   // NO OUTLINE (Fred's ruling, Jul 21 2026) — the figure holds by value, painterly
    var h = p.h, R = h * 0.26, facing = p.facing || 1;
    var x = p.x + (anim.swayX || 0), y = p.y + (anim.bobY || 0);
    var cx = x + (p.lean || 0) * 0.35, cy = y - h + R * 1.02;
    var neckY = cy + R * 0.72;
    // The wide cloak is DELIBERATE and Fred's call (Aug 2026). A narrower, more
    // Kirby-like body was piloted on the candle page — hem 0.86*h -> 0.56*h, widest
    // point moved from 86% down to 43% — and rejected: it read as skinny. The width
    // stays; only the ARMS were out of proportion, and those are fixed in scene.js
    // (short reach) and below (thickness). Do not re-narrow the body.
    var wt = R * 0.92, wb = R * 1.72, by = y - h * 0.02;
    var midY = (neckY + by) / 2, hemN = h * 0.05;
    var wd = ((p.wind || 0) + (anim.breeze || 0)) * R;
    var oW = Math.max(2.4, h * 0.045);
    // A stable per-figure rng. The brushwork must be IDENTICAL every frame or the
    // paint boils; seeding from the figure's own position and size gives every
    // pilgrim its own hand while keeping each one still.
    var bs = (Math.floor(Math.abs(p.x) * 131 + Math.abs(p.y) * 17 + h * 7) | 0) >>> 0 || 7;
    var brnd = function () { bs = (bs * 1103515245 + 12345) & 0x7fffffff; return bs / 0x7fffffff; };
    // BROKEN COLOUR — every mark carries its own hue, the way pigment mixed on a
    // palette never repeats. Without this the strokes are the same colour as the fill
    // and simply vanish into it: the form stays a smooth shape however many you lay.
    function broke(hex, dl, warm) {
      var v = hexA(hex);
      var w = (warm == null ? (brnd() - 0.5) : warm) * 26;
      var l = (dl == null ? (brnd() - 0.5) * 34 : dl);
      return rgbS(v[0] + l + w, v[1] + l, v[2] + l - w);
    }
    // ONE deliberate stroke, tapered like a loaded brush leaving the canvas.
    function mark(x0, y0, ang, L, W2, col, a2) {
      ctx.save();
      ctx.globalAlpha = a2 == null ? 1 : a2;
      ctx.strokeStyle = col; ctx.lineWidth = W2; ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x0 - Math.cos(ang) * L / 2, y0 - Math.sin(ang) * L / 2);
      ctx.lineTo(x0 + Math.cos(ang) * L / 2, y0 + Math.sin(ang) * L / 2);
      ctx.stroke();
      ctx.restore();
    }

    function cloakPath(c2) {
      c2.beginPath();
      c2.moveTo(x - wt, neckY);
      c2.quadraticCurveTo(x - wb * 1.08 + wd * 0.55, midY, x - wb + wd * 1.15, by);
      c2.lineTo(x - wb * 0.52 + wd * 0.85, by - hemN);
      c2.lineTo(x - wb * 0.12 + wd * 0.55, by);
      c2.lineTo(x + wb * 0.32 + wd * 0.4, by - hemN * 0.8);
      c2.lineTo(x + wb + wd * 0.2, by);
      c2.quadraticCurveTo(x + wb * 1.08 + wd * 0.1, midY, x + wt, neckY);
      c2.quadraticCurveTo(cx, neckY - R * 0.25, x - wt, neckY);
      c2.closePath();
    }
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';

    // ---- WINGS (p.wings) — a cherub's pair, drawn BEHIND everything else so the
    // body sits in front of them. Painted like the rest of him: feather marks fanning
    // from the shoulder, warm where the light is, each one its own colour. This is what
    // makes the little pilgrim a cupid rather than a robed traveller. ----
    if (p.wings) {
      // ANGELING WINGS, from Fred's reference sprite. The feathers are not strokes and
      // not a fan of spikes — they are a few SOLID ROUNDED LOBES overlapping like
      // petals, cream at the root and warming to gold at the tips, the longest lying
      // outermost. Plus one small separate feather near the root (the alula). Drawing
      // them as filled shapes is the whole point; a wing this small has no room for
      // individual barbs, so the silhouette has to carry it.
      var wl = h * 0.40;                                   // small — an angeling's wing is cupped, not spanned
      var wRootY3 = neckY - R * 0.30;
      function lobe(lx, ly, len, wid, ang, c0, c1) {
        var lg = ctx.createLinearGradient(lx, ly, lx + Math.cos(ang) * len, ly + Math.sin(ang) * len);
        lg.addColorStop(0, c0); lg.addColorStop(1, c1);
        ctx.save();
        ctx.translate(lx, ly); ctx.rotate(ang);
        ctx.fillStyle = lg; ctx.strokeStyle = OUT2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(len * 0.42, -wid, len, -wid * 0.28);   // the upper curve of the feather
        ctx.quadraticCurveTo(len * 0.66, wid * 0.5, 0, wid * 0.34);  // and its rounder underside
        ctx.closePath(); ctx.fill();
        ctx.restore();
      }
      for (var wg = -1; wg <= 1; wg += 2) {
        var rx1 = x + wg * wt * 0.72, ry1 = wRootY3;
        ctx.save();
        if (wg < 0) { ctx.translate(rx1 * 2, 0); ctx.scale(-1, 1); }   // mirror the left wing
        var mx2 = wg < 0 ? rx1 : rx1;
        // four lobes, longest lowest/outermost, each rotated a little further up
        for (var lb = 3; lb >= 0; lb--) {
          var ang3 = -0.16 - lb * 0.30;                    // fan upward and back
          var len3 = wl * (1 - lb * 0.17);
          var wid3 = wl * (0.30 - lb * 0.035);
          lobe(mx2, ry1 + lb * h * 0.012, len3, wid3, ang3,
               '#fffdf4', lb === 0 ? '#f6c86a' : lb === 1 ? '#f8d488' : '#fce6b4');
        }
        // the small alula feather tucked at the root
        lobe(mx2 - wl * 0.06, ry1 + h * 0.05, wl * 0.34, wl * 0.13, -0.05, '#fffef8', '#f3bd7a');
        ctx.restore();
        // a few painted marks so the wing belongs to the same hand as the rest
        for (var wq = 0; wq < 7; wq++) {
          var wu = brnd();
          mark(rx1 + wg * wl * (0.15 + wu * 0.7), ry1 - wl * (0.05 + wu * 0.42),
               -wg * (0.2 + wu * 0.5), wl * (0.18 + brnd() * 0.2),
               Math.max(1, h * 0.016),
               rgbS(255, 240 - brnd() * 26, 205 - brnd() * 46), 0.4 + brnd() * 0.3);
        }
      }
      // A HARP, and the notes coming off it — "I heard the voice of harpers harping
      // with their harps" (Rev 14:2). Held at the side so it never covers the face:
      // a curved gold frame, a straight pillar (a made thing — Munch keeps it straight)
      // and strings between.
      // THE HALO — the angeling's signature ring, floating above the crown
      var haloY = cy - R * 1.30, haloRx = R * 0.60, haloRy = R * 0.19;
      for (var ha = 0; ha < 16; ha++) {
        var t3 = (ha / 16) * Math.PI * 2;
        mark(cx + Math.cos(t3) * haloRx, haloY + Math.sin(t3) * haloRy,
             t3 + Math.PI / 2, R * 0.25, Math.max(1, R * 0.1),
             rgbS(255, 224 + (brnd() - 0.5) * 20, 126 + (brnd() - 0.5) * 30),
             Math.sin(t3) > 0 ? 0.5 : 0.95);
      }
    }

    // ---- the cloak: outline, base, then CEL TONES clipped inside ----
    cloakPath(ctx);
    ctx.fillStyle = tone(SH, 0.9); ctx.strokeStyle = OUT2; ctx.lineWidth = oW;
    ctx.fill(); ctx.stroke();
    ctx.save(); cloakPath(ctx); ctx.clip();
    ctx.fillStyle = rgbS(BASE[0], BASE[1], BASE[2]);
    ctx.fillRect(x - wb * 1.4, neckY - R, wb * 2.8, h * 1.2);
    // shadow crescent on the away side + under-hem dark
    ctx.fillStyle = tone(SH, 0.98);
    ctx.beginPath(); ctx.ellipse(x - facing * wb * 0.72 + wd * 0.5, midY + h * 0.1, wb * 0.72, h * 0.42, facing * -0.12, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 0.85;
    ctx.fillRect(x - wb * 1.4, by - hemN * 1.8, wb * 2.8, hemN * 2.4);
    ctx.globalAlpha = 1;
    // light band on the facing shoulder, curving down
    ctx.fillStyle = rgbS(LT[0], LT[1], LT[2]);
    ctx.beginPath(); ctx.ellipse(x + facing * wb * 0.46, neckY + h * 0.16, wb * 0.52, h * 0.34, facing * 0.2, 0, Math.PI * 2); ctx.fill();
    // rim highlight along the lit edge
    ctx.strokeStyle = tint(LT, 0.45); ctx.lineWidth = Math.max(1.4, h * 0.02);
    ctx.beginPath();
    ctx.moveTo(x + facing * wt * 0.92, neckY + 1);
    ctx.quadraticCurveTo(x + facing * wb * 1.0, midY, x + facing * (wb * 0.94) + wd * 0.18, by - hemN * 0.9);
    ctx.stroke();
    // cloth folds falling from the THROAT, swept by the wind — and a throat is only on
    // the side you can see when he is facing you. Fred: "the character is walking
    // towards the picture, the cloak should face backwards." These three folds fan open
    // from the collar the way a cloak hangs off a chest, so drawn on a back view they
    // put the garment's opening on his spine and the whole figure flips round: a head
    // seen from behind above a cloak seen from the front. On his back it is one pleat
    // (below), not an opening.
    if (!p.back) {
      ctx.strokeStyle = tone(SH, 0.82); ctx.lineWidth = Math.max(1.2, R * 0.09);
      for (var fo = -1; fo <= 1; fo++) {
        ctx.beginPath();
        ctx.moveTo(cx + fo * wt * 0.42, neckY + R * 0.28);
        ctx.quadraticCurveTo(cx + fo * wb * 0.34 + wd * 0.4, midY + h * 0.05, cx + fo * wb * 0.46 + wd * 0.85, by - hemN * 1.1);
        ctx.stroke();
      }
    }
    // ---- THE CLOTH, PAINTED. The cel tones above give the form; these are the marks
    // that make it PAINT. They fall the way cloth falls — down from the shoulders,
    // fanning outward toward the hem — and take their colour from the tone already
    // beneath them, so the brush is describing the form rather than scribbling over
    // it. This is the difference between a painter's stroke and a filter: a stroke
    // goes somewhere on purpose.
    {
      var nCl = Math.max(18, Math.round(h * 0.55));
      for (var ci = 0; ci < nCl; ci++) {
        var t2 = brnd(), sx2 = x + (brnd() * 2 - 1) * wb * 1.02;
        var sy2 = neckY + t2 * (by - neckY);
        var fan = ((sx2 - cx) / (wb * 1.6)) * 0.85;          // splay toward the hem
        var ang2 = Math.PI / 2 + fan * (0.35 + t2 * 0.9) + wd * 0.012;
        var side = (sx2 - x) * facing / Math.max(1, wb);      // +1 lit side, -1 away
        var cb = side > 0.15 ? LT : side < -0.3 ? SH : BASE;
        var jl = (brnd() - 0.5) * 40, jw = (brnd() - 0.5) * 24;
        var col2 = rgbS(cb[0] + jl + jw, cb[1] + jl, cb[2] + jl - jw);
        var L2 = h * (0.09 + brnd() * 0.11);
        var W3 = Math.max(1, h * (0.017 + brnd() * 0.016));
        mark(sx2, sy2, ang2, L2, W3, col2, 0.40 + brnd() * 0.34);
      }
    }
    if (p.back) {
      // ⚠ DRAPERY, NOT LACES. Fred: "shouldnt the back of the cloak have no strings?
      // those are for the front right?" — and that is what these had become: two thick
      // dark lines starting at the throat and running the whole length of him read as a
      // pair of cords hanging down his back, and a cloak is tied at the FRONT.
      // What a back actually shows is cloth falling off the shoulder blades: folds that
      // begin BELOW the shoulders (never at the neck), fan apart toward the hem, and are
      // barely darker than the cloth they are in — a fold is a change of angle catching
      // less light, not a line drawn on a garment.
      ctx.strokeStyle = tone(SH, 0.9); ctx.lineWidth = Math.max(1, R * 0.07);
      for (var bp = -1; bp <= 1; bp += 2) {
        ctx.beginPath();
        ctx.moveTo(cx + bp * R * 0.34, neckY + R * 0.95);
        ctx.quadraticCurveTo(cx + bp * R * 0.5 + wd * 0.35, midY + h * 0.02, cx + bp * R * 0.72 + wd * 0.7, by - hemN * 1.15);
        ctx.stroke();
      }
      // the yoke: one soft curve across the shoulders where the cloth is gathered — the
      // mark that says "this is the far side of him" without drawing anything on it
      ctx.strokeStyle = tone(SH, 0.94); ctx.lineWidth = Math.max(1, R * 0.055);
      ctx.beginPath();
      ctx.moveTo(cx - R * 0.62, neckY + R * 0.72);
      ctx.quadraticCurveTo(cx, neckY + R * 1.02, cx + R * 0.62, neckY + R * 0.72);
      ctx.stroke();
    }
    ctx.restore();
    // hem inner line — the double edge of a real garment
    ctx.strokeStyle = tone(SH, 0.7); ctx.lineWidth = Math.max(1, h * 0.014);
    ctx.beginPath();
    ctx.moveTo(x - wb * 0.9 + wd * 1.05, by - hemN * 0.55);
    ctx.quadraticCurveTo(cx + wd * 0.5, by - hemN * 1.7, x + wb * 0.9 + wd * 0.18, by - hemN * 0.5);
    ctx.stroke();

    // ---- THE EDGE, MADE BY THE BRUSH. These marks are drawn with no clip, so they
    // CROSS the outline: a little cloth carried past the form here, a little ground
    // showing through there. That is why the silhouette stops being a curve — not
    // because a filter chewed it afterwards, but because the strokes that built it
    // went where a brush goes. ----
    {
      var nEd = Math.max(10, Math.round(h * 0.26));
      for (var ei = 0; ei < nEd; ei++) {
        var u = brnd(), ex2, ey2, ea;
        if (u < 0.42) {                     // down the two falling sides of the cloak
          var sgn2 = brnd() < 0.5 ? -1 : 1, tv = brnd();
          ex2 = x + sgn2 * (wt + (wb - wt) * tv) * (0.98 + brnd() * 0.06);
          ey2 = neckY + tv * (by - neckY);
          ea = Math.PI / 2 + sgn2 * (0.3 + tv * 0.55);
        } else if (u < 0.72) {              // along the hem
          ex2 = x + (brnd() * 2 - 1) * wb * 0.98;
          ey2 = by - hemN * brnd() * 1.2;
          ea = Math.PI / 2 + (brnd() - 0.5) * 0.8;
        } else {                            // over the shoulders, where head meets cloth
          var sa = (brnd() * 2 - 1) * 1.1;
          ex2 = cx + Math.sin(sa) * wt * 1.05;
          ey2 = neckY + Math.abs(Math.cos(sa)) * R * 0.2 - R * 0.1;
          ea = Math.PI / 2 + sa * 0.7;
        }
        mark(ex2, ey2, ea, h * (0.06 + brnd() * 0.09),
             Math.max(1, h * (0.014 + brnd() * 0.014)),
             brnd() < 0.5 ? rgbS(BASE[0], BASE[1], BASE[2]) : tone(SH, 0.92),
             0.35 + brnd() * 0.35);
      }
    }

    // ---- arms with mitten hands (thumb bump + cuff) ----
    var staffHand = null;
    [p.armL, p.armR].forEach(function (tip) {
      if (!tip) return;
      var side = tip[0] >= cx ? 1 : -1;
      var sx = x + side * wt * 0.78, sy = neckY + R * 0.28;
      var mx = (sx + tip[0]) / 2 + side * 2, my = (sy + tip[1]) / 2 + 1.5;
      // STUBBY, not spindly (Kirby / Hollow Knight): the limb is roughly a third as
      // thick as it is long, so it reads as part of the body mass rather than a wire
      // hung off it. Paired with the short reach clamp in scene.js.
      ctx.strokeStyle = OUT2; ctx.lineWidth = Math.max(4.4, h * 0.098);
      ctx.beginPath(); ctx.moveTo(sx, sy); ctx.quadraticCurveTo(mx, my, tip[0], tip[1]); ctx.stroke();
      ctx.strokeStyle = rgbS(BASE[0], BASE[1], BASE[2]); ctx.lineWidth = Math.max(3, h * 0.076);
      ctx.beginPath(); ctx.moveTo(sx, sy); ctx.quadraticCurveTo(mx, my, tip[0], tip[1]); ctx.stroke();
      ctx.strokeStyle = tone(SH, 0.85); ctx.lineWidth = Math.max(1.2, h * 0.022);
      ctx.beginPath(); ctx.moveTo(sx + 1, sy + 2); ctx.quadraticCurveTo(mx + 1, my + 2.4, tip[0], tip[1] + 1.4); ctx.stroke();
      var nr = Math.max(3.2, h * 0.062);
      ctx.fillStyle = rgbS(LT[0], LT[1], LT[2]); ctx.strokeStyle = OUT2; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(tip[0], tip[1], nr, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.arc(tip[0] - side * nr * 0.62, tip[1] + nr * 0.42, nr * 0.42, 0, Math.PI * 2); ctx.fill(); ctx.stroke();   // the thumb
      ctx.strokeStyle = tone(SH, 0.8); ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.arc(tip[0], tip[1], nr * 0.98, side > 0 ? Math.PI * 0.7 : Math.PI * 1.6, side > 0 ? Math.PI * 1.25 : Math.PI * 2.2); ctx.stroke();  // cuff crease
      ctx.globalAlpha = 0.5; ctx.fillStyle = tint(LT, 0.5);
      ctx.beginPath(); ctx.arc(tip[0] - nr * 0.25, tip[1] - nr * 0.3, nr * 0.4, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
      if (!staffHand) staffHand = tip;
    });
    if (p.staff && staffHand) {
      var tx = staffHand[0] + facing * R * 0.16, ty = staffHand[1] - R * 1.25;
      var bx = staffHand[0] - facing * R * 0.3, byy = y + 2;
      var mxs = (tx + bx) / 2 + facing * 1.2, mys = (ty + byy) / 2;
      ctx.strokeStyle = OUT2; ctx.lineWidth = Math.max(2.6, h * 0.05);
      ctx.beginPath(); ctx.moveTo(tx, ty); ctx.quadraticCurveTo(mxs, mys, bx, byy); ctx.stroke();
      ctx.strokeStyle = '#a06a30'; ctx.lineWidth = Math.max(1.5, h * 0.03);
      ctx.beginPath(); ctx.moveTo(tx, ty); ctx.quadraticCurveTo(mxs, mys, bx, byy); ctx.stroke();
      ctx.strokeStyle = '#6a4218'; ctx.lineWidth = Math.max(0.8, h * 0.012);   // the grain
      ctx.beginPath(); ctx.moveTo(tx + 0.8, ty + 2); ctx.quadraticCurveTo(mxs + 0.8, mys, bx + 0.8, byy - 2); ctx.stroke();
      ctx.strokeStyle = '#4a2c10'; ctx.lineWidth = Math.max(2, h * 0.032);      // the leather grip wrap
      ctx.beginPath(); ctx.moveTo(staffHand[0] + facing * R * 0.05, staffHand[1] - R * 0.5); ctx.lineTo(staffHand[0] - facing * R * 0.06, staffHand[1] - R * 0.18); ctx.stroke();
      ctx.fillStyle = '#c08a44'; ctx.strokeStyle = OUT2; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.arc(tx, ty, Math.max(2, h * 0.034), 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#ffe9b0';
      ctx.beginPath(); ctx.arc(tx - 1, ty - 1, Math.max(0.8, h * 0.012), 0, Math.PI * 2); ctx.fill();
    }

    // ---- THE INSTRUMENT — drawn HERE, after the cloak and the arms, so it is in
    // FRONT of the figure. Inside the wings block it was painted before the cloak and
    // the cloak simply covered it.
    // ⚠ Both of these are SOLID SHAPES, not strokes. The first trumpet was a thin line
    // with a small bell held down at the hip and it read as a WAND. A horn is known by
    // one silhouette: a narrow tube at the LIPS flaring into a big cone. Same lesson the
    // wings taught — at 30px the shape carries it, never the detail.
    if (p.harp || p.trumpet) {
      ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      if (p.trumpet) {
        var mAx = x + facing * R * 0.30, mAy = cy + R * 0.44;      // the lips
        var ang = facing > 0 ? -0.44 : (Math.PI + 0.44);           // raised, the herald's angle
        var ux = Math.cos(ang), uy = Math.sin(ang), qx = -uy, qy = ux;
        var L = h * 0.86, r0 = h * 0.022, r1 = h * 0.055, rB = h * 0.175;
        var bX = mAx + ux * L * 0.72, bY = mAy + uy * L * 0.72;    // where the flare starts
        var cX = mAx + ux * L,        cY = mAy + uy * L;           // the bell mouth
        ctx.beginPath();                                            // the CONE, one filled shape
        ctx.moveTo(mAx + qx * r0, mAy + qy * r0);
        ctx.lineTo(bX + qx * r1, bY + qy * r1);
        ctx.quadraticCurveTo(cX + qx * rB * 0.66, cY + qy * rB * 0.66, cX + qx * rB, cY + qy * rB);
        ctx.lineTo(cX - qx * rB, cY - qy * rB);
        ctx.quadraticCurveTo(cX - qx * rB * 0.66, cY - qy * rB * 0.66, bX - qx * r1, bY - qy * r1);
        ctx.lineTo(mAx - qx * r0, mAy - qy * r0);
        ctx.closePath();
        ctx.fillStyle = rgbS(238, 190, 84); ctx.fill();
        ctx.strokeStyle = rgbS(198, 146, 52); ctx.lineWidth = Math.max(0.7, h * 0.012); ctx.stroke();
        ctx.beginPath();                                            // the lit top edge — brass
        ctx.moveTo(mAx + qx * r0 * 0.2, mAy + qy * r0 * 0.2);
        ctx.lineTo(cX + qx * rB * 0.78, cY + qy * rB * 0.78);
        ctx.strokeStyle = rgbS(255, 244, 190); ctx.lineWidth = Math.max(0.8, h * 0.016); ctx.stroke();
        ctx.beginPath();                                            // the dark mouth of the bell
        ctx.ellipse(cX, cY, rB * 0.30, rB, ang, 0, Math.PI * 2);
        ctx.fillStyle = rgbS(176, 124, 44); ctx.fill();
        ctx.strokeStyle = rgbS(255, 238, 168); ctx.lineWidth = Math.max(0.8, h * 0.014); ctx.stroke();
        var ibx = cX + ux * h * 0.05, iby = cY + uy * h * 0.05, iSide = facing;   // notes leave the BELL
      } else {
        // THE HARP — the frame a child draws: a straight PILLAR, a curved NECK over the
        // top, a slanted SOUNDBOARD, strings filling the triangle between (Rev 14:2).
        var sD = -facing;                                          // on the off hand, clear of the face
        var fx1 = x + sD * wb * 0.80, fy1 = neckY + R * 1.05;      // the foot
        var HH = h * 0.66, WW = h * 0.44;
        var tx1 = fx1, ty1 = fy1 - HH;                             // top of the pillar
        var sx1 = fx1 + sD * WW, sy1 = fy1 - HH * 0.30;            // the shoulder
        ctx.strokeStyle = rgbS(226, 172, 70); ctx.lineWidth = Math.max(1.5, h * 0.055);
        ctx.beginPath(); ctx.moveTo(fx1, fy1); ctx.lineTo(sx1, sy1); ctx.stroke();   // soundboard
        ctx.strokeStyle = rgbS(240, 196, 96); ctx.lineWidth = Math.max(1.4, h * 0.048);
        ctx.beginPath(); ctx.moveTo(fx1, fy1); ctx.lineTo(tx1, ty1); ctx.stroke();   // pillar — straight (Munch)
        ctx.beginPath();                                                             // the neck, curving over
        ctx.moveTo(tx1, ty1);
        ctx.quadraticCurveTo(fx1 + sD * WW * 0.62, fy1 - HH * 1.06, sx1, sy1);
        ctx.stroke();
        ctx.strokeStyle = rgbS(255, 250, 222); ctx.lineWidth = Math.max(0.6, h * 0.010);
        for (var st2 = 1; st2 <= 5; st2++) {                                         // the strings
          var uu = st2 / 6;
          var nx1 = tx1 + (sx1 - tx1) * uu + sD * WW * 0.30 * Math.sin(uu * Math.PI);
          var ny1 = ty1 + (sy1 - ty1) * uu - HH * 0.16 * Math.sin(uu * Math.PI);
          ctx.beginPath(); ctx.moveTo(nx1, ny1);
          ctx.lineTo(fx1 + (sx1 - fx1) * uu, fy1 + (sy1 - fy1) * uu); ctx.stroke();
        }
        var ibx = tx1 + sD * WW * 0.35, iby = ty1 - h * 0.02, iSide = sD;
      }
      ctx.restore();
      for (var nq = 0; nq < 3; nq++) {                     // the notes
        var nx = ibx + iSide * h * (0.10 + nq * 0.13) + (brnd() - 0.5) * h * 0.03;
        var ny = iby - h * (0.13 + nq * 0.14);
        var nsz = h * (0.052 - nq * 0.008);
        ctx.save();
        ctx.fillStyle = rgbS(255, 244, 190); ctx.strokeStyle = rgbS(252, 232, 160);
        ctx.lineWidth = Math.max(0.9, h * 0.016); ctx.lineCap = 'round';
        ctx.beginPath(); ctx.ellipse(nx, ny, nsz, nsz * 0.76, -0.4, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.moveTo(nx + nsz * 0.92, ny); ctx.lineTo(nx + nsz * 0.92, ny - nsz * 2.7); ctx.stroke();
        if (nq === 1) { ctx.beginPath();
          ctx.moveTo(nx + nsz * 0.92, ny - nsz * 2.7);
          ctx.quadraticCurveTo(nx + nsz * 2.3, ny - nsz * 2.0, nx + nsz * 1.6, ny - nsz * 1.05);
          ctx.stroke(); }
        ctx.restore();
      }
    }

    // ---- little BOOTS ----
    var stride = p.stride || 0, liftv = p.lift || 0;
    if (!p.wings) {   // a hovering angel stands on nothing — boots read as a smudge under it
    var f1x = x + facing * (wb * 0.28 + stride * h * 0.16);
    var f2x = x - facing * (wb * 0.24 + stride * h * 0.1);
    var f2y = y - liftv * h * 0.07;
    [[f2x, f2y, 0.9], [f1x, y, 1]].forEach(function (f) {
      ctx.fillStyle = tone(SH, 0.75); ctx.strokeStyle = OUT2; ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(f[0] - R * 0.24, f[1] - R * 0.2);
      ctx.quadraticCurveTo(f[0] + facing * R * 0.34, f[1] - R * 0.26, f[0] + facing * R * 0.3, f[1] + R * 0.02);
      ctx.quadraticCurveTo(f[0] + facing * R * 0.1, f[1] + R * 0.16, f[0] - R * 0.22, f[1] + R * 0.08);
      ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = rgbS(BASE[0], BASE[1], BASE[2]);
      ctx.globalAlpha = 0.55 * f[2];
      ctx.beginPath(); ctx.ellipse(f[0] + facing * R * 0.06, f[1] - R * 0.12, R * 0.16, R * 0.08, 0, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
    });
    }

    // ---- the HOODED COLLAR — a layered cowl behind and under the mask ----
    ctx.fillStyle = tone(SH, 0.92); ctx.strokeStyle = OUT2; ctx.lineWidth = oW * 0.8;
    ctx.beginPath(); ctx.ellipse(cx, neckY - R * 0.12, R * 1.18, R * 0.52, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = rgbS(BASE[0], BASE[1], BASE[2]);
    ctx.beginPath(); ctx.ellipse(cx, neckY - R * 0.18, R * 1.06, R * 0.4, 0, Math.PI, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = tint(LT, 0.35); ctx.lineWidth = Math.max(1, h * 0.013);
    ctx.beginPath(); ctx.ellipse(cx, neckY - R * 0.2, R * 1.02, R * 0.36, 0, Math.PI * 1.08, Math.PI * 1.92); ctx.stroke();
    // the gold throat-clasp — a clasp fastens at the front, so from behind it is a bright
    // gold bead sitting on the nape of his neck, and it was the loudest thing telling the
    // eye he was facing us
    if (!p.back) {
      ctx.fillStyle = '#e8b33d'; ctx.strokeStyle = OUT2; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.arc(cx, neckY + R * 0.3, Math.max(1.8, R * 0.14), 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#fff2c0';
      ctx.beginPath(); ctx.arc(cx - R * 0.045, neckY + R * 0.26, Math.max(0.7, R * 0.05), 0, Math.PI * 2); ctx.fill();
    }

    // ---- the MASK, with volume ----
    function nub(side) {
      ctx.save();
      ctx.translate(cx + side * R * 0.6, cy - R * 0.72);
      ctx.rotate(side * 22 * Math.PI / 180);
      ctx.beginPath(); ctx.ellipse(0, 0, R * 0.3, R * 0.42, 0, 0, Math.PI * 2);
      ctx.fillStyle = maskCols[1]; ctx.strokeStyle = OUT2; ctx.lineWidth = oW * 0.85;
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = maskCols[2]; ctx.globalAlpha = 0.55;
      ctx.beginPath(); ctx.ellipse(side * R * 0.07, R * 0.1, R * 0.18, R * 0.26, 0, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
      ctx.restore();
    }
    nub(-1); nub(1);
    ctx.beginPath(); ctx.ellipse(cx, cy, R * 1.04, R * 0.94, 0, 0, Math.PI * 2);
    ctx.fillStyle = maskCols[0]; ctx.strokeStyle = OUT2; ctx.lineWidth = oW;
    ctx.fill(); ctx.stroke();
    ctx.save();
    ctx.beginPath(); ctx.ellipse(cx, cy, R * 1.04, R * 0.94, 0, 0, Math.PI * 2); ctx.clip();
    // side shade away from the light + jaw shade + a soft brow under the crown
    ctx.fillStyle = maskCols[2]; ctx.globalAlpha = 0.6;
    ctx.beginPath(); ctx.ellipse(cx - facing * R * 0.88, cy + R * 0.08, R * 0.5, R * 0.8, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(cx, cy + R * 0.85, R * 0.8, R * 0.3, 0, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 0.35;
    ctx.beginPath(); ctx.ellipse(cx, cy - R * 0.78, R * 0.85, R * 0.24, 0, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
    // crown highlight
    ctx.strokeStyle = 'rgba(255,255,250,0.75)'; ctx.lineWidth = Math.max(1.2, R * 0.09);
    ctx.beginPath(); ctx.ellipse(cx, cy, R * 0.82, R * 0.72, 0, Math.PI * 1.15, Math.PI * 1.6); ctx.stroke();

    // ---- THE HEAD, PAINTED. A painter models a round form with strokes that run
    // AROUND it — tangential, following the curve — never with a flat fill. These sit
    // inside the mask's own clip, take their colour from the tone already beneath, and
    // are what stop the face reading as a perfect circle with something laid over it.
    // The features are drawn AFTER this and stay crisp: a painter paints an eye with
    // two confident marks and then leaves it alone.
    {
      var nHd = Math.max(14, Math.round(R * 1.9));
      for (var hi = 0; hi < nHd; hi++) {
        var ha = brnd() * Math.PI * 2, hrr = Math.sqrt(brnd()) * 0.98;
        var hx2 = cx + Math.cos(ha) * R * 1.04 * hrr;
        var hy2 = cy + Math.sin(ha) * R * 0.94 * hrr;
        var tang = ha + Math.PI / 2;                       // run AROUND the form
        var litSide = (Math.cos(ha) * facing + 0.45);      // brighter where the light falls
        var hbase = litSide > 0.55 ? maskCols[0] : litSide < -0.2 ? maskCols[2] : maskCols[1];
        // lit marks run warm and lift; shadowed marks run cool and drop
        var hcol = broke(hbase, (litSide > 0.4 ? 16 : litSide < -0.2 ? -20 : 0) + (brnd() - 0.5) * 26,
                         litSide > 0.3 ? 0.5 : -0.45);
        mark(hx2, hy2, tang + (brnd() - 0.5) * 0.5,
             R * (0.30 + brnd() * 0.34), Math.max(1, R * (0.075 + brnd() * 0.07)),
             hcol, 0.42 + brnd() * 0.34);
      }
    }
    ctx.restore();

    // strokes that CROSS the mask's outline, so the head's edge is made by the brush
    {
      var nHe = Math.max(9, Math.round(R * 0.9));
      for (var he = 0; he < nHe; he++) {
        var qa = brnd() * Math.PI * 2;
        var qx = cx + Math.cos(qa) * R * 1.04 * (0.97 + brnd() * 0.07);
        var qy = cy + Math.sin(qa) * R * 0.94 * (0.97 + brnd() * 0.07);
        mark(qx, qy, qa + Math.PI / 2 + (brnd() - 0.5) * 0.7,
             R * (0.18 + brnd() * 0.22), Math.max(1, R * (0.06 + brnd() * 0.05)),
             broke(brnd() < 0.55 ? maskCols[0] : maskCols[2], null, null), 0.4 + brnd() * 0.35);
      }
    }

    // ---- the EYES: mood + iris depth + paired glints ----
    if (!p.back) {
      var mood = p.mood || 'open';
      var ex = ((p.eye ? p.eye[0] : 0) + (anim.gazeX || 0)) * R * 0.14;
      var ey = ((p.eye ? p.eye[1] : 0) + (anim.gazeY || 0)) * R * 0.1;
      for (var s = -1; s <= 1; s += 2) {
        var ecx = cx + s * R * 0.44 + ex, ecy = cy + R * 0.05 + ey;
        if (mood === 'joy') {
          ctx.strokeStyle = '#141020'; ctx.lineWidth = Math.max(1.6, R * 0.12);
          ctx.beginPath();
          ctx.moveTo(ecx - R * 0.18, ecy + R * 0.04);
          ctx.quadraticCurveTo(ecx, ecy - R * 0.26, ecx + R * 0.18, ecy + R * 0.04);
          ctx.stroke();
          continue;
        }
        if (mood === 'dizzy') {
          // swirling SPIRAL eyes — dizzy, head-spun, adrift (the balloon/storm page).
          // THIN line + open spacing so the coil READS as a spiral, not a black blob.
          ctx.strokeStyle = '#141020'; ctx.lineWidth = Math.max(0.5, R * 0.036); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
          ctx.beginPath();
          var turns = 2.2, steps = 70, maxR = R * 0.3;   // 2.2 turns → coils ~1.4× the line apart at his size
          for (var k = 0; k <= steps; k++) {
            var tt = k / steps, ang = tt * turns * Math.PI * 2 * s, rr = maxR * tt;
            var px = ecx + Math.cos(ang) * rr, py = ecy + Math.sin(ang) * rr;
            if (k === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
          }
          ctx.stroke();
          continue;
        }
        if (mood === 'teary') {
          // PRECISE SADNESS — NO eyebrow (Fred's ask), all carried by the eye:
          // big, glassy, DOWNCAST eyes + a DROOPY lid that dips low on the OUTER
          // corner and lifts at the INNER — that inner-lift IS the grief "inner-brow
          // raise" done without a brow, so he stays cute. Plus a tear + a soft frown.
          var rx = R * 0.185, ry = R * 0.36, lid = anim.lid || 0;
          if (lid >= 1) continue;
          ctx.save();
          ctx.beginPath(); ctx.ellipse(ecx, ecy, rx, ry, 0, 0, Math.PI * 2); ctx.clip();
          ctx.fillStyle = '#141020'; ctx.fillRect(ecx - rx, ecy - ry, rx * 2, ry * 2);
          ctx.fillStyle = '#3a2456'; ctx.globalAlpha = 0.9;                            // iris low → eyes cast down
          ctx.beginPath(); ctx.ellipse(ecx, ecy + ry * 0.46, rx * 0.86, ry * 0.52, 0, 0, Math.PI * 2); ctx.fill();
          ctx.globalAlpha = 1; ctx.fillStyle = '#eaf4ff';                              // brimming wet pool on the lower lid
          ctx.beginPath(); ctx.ellipse(ecx, ecy + ry * 0.6, rx * 0.86, ry * 0.3, 0, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#f8f4ff';                                                   // two catch-lights → glassy, welling eyes
          ctx.beginPath(); ctx.arc(ecx - rx * 0.28, ecy - ry * 0.32, rx * 0.36, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.arc(ecx + rx * 0.36, ecy + ry * 0.12, rx * 0.17, 0, Math.PI * 2); ctx.fill();
          ctx.restore();
          ctx.fillStyle = maskCols[0];                                                 // the DROOPY sad lid (mask colour)
          ctx.beginPath();
          ctx.moveTo(ecx + s * rx * 1.3, ecy - ry * 1.6);
          ctx.lineTo(ecx + s * rx * 1.3, ecy - ry * 0.34);                             // OUTER corner: lid droops LOW
          ctx.quadraticCurveTo(ecx + s * rx * 0.15, ecy - ry * 0.98, ecx - s * rx * 1.3, ecy - ry * 1.12);  // lifts to the INNER (grief cue)
          ctx.lineTo(ecx - s * rx * 1.3, ecy - ry * 1.6); ctx.closePath(); ctx.fill();
          ctx.strokeStyle = 'rgba(30,22,40,0.32)'; ctx.lineWidth = Math.max(0.6, rx * 0.13); ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(ecx + s * rx * 1.06, ecy - ry * 0.36);
          ctx.quadraticCurveTo(ecx + s * rx * 0.12, ecy - ry * 0.9, ecx - s * rx * 1.06, ecy - ry * 1.02);
          ctx.stroke();
          var tx = ecx + s * rx * 0.9, ty = ecy + ry * 0.98, td = rx * 0.52;          // the tear, welling + sliding
          ctx.fillStyle = 'rgba(150,205,238,0.92)';
          ctx.beginPath();
          ctx.moveTo(tx, ty - td * 1.4);
          ctx.quadraticCurveTo(tx + td, ty + td * 0.1, tx, ty + td);
          ctx.quadraticCurveTo(tx - td, ty + td * 0.1, tx, ty - td * 1.4);
          ctx.fill();
          ctx.fillStyle = 'rgba(255,255,255,0.9)';
          ctx.beginPath(); ctx.arc(tx - td * 0.3, ty, td * 0.3, 0, Math.PI * 2); ctx.fill();
          continue;
        }
        var rx = R * (mood === 'wonder' ? 0.2 : mood === 'wary' ? 0.15 : 0.17);
        var ry = R * (mood === 'wonder' ? 0.38 : mood === 'wary' ? 0.21 : 0.32);
        var lid = anim.lid || 0;
        if (lid < 1) {
          ctx.save();
          ctx.beginPath(); ctx.ellipse(ecx, ecy, rx, ry, 0, 0, Math.PI * 2); ctx.clip();
          ctx.fillStyle = '#141020';
          ctx.fillRect(ecx - rx, ecy - ry + 2 * ry * lid, rx * 2, ry * 2 * (1 - lid));
          ctx.fillStyle = '#3a2456'; ctx.globalAlpha = (1 - lid) * 0.9;      // the iris depth
          ctx.beginPath(); ctx.ellipse(ecx, ecy + ry * 0.42, rx * 0.85, ry * 0.5, 0, 0, Math.PI * 2); ctx.fill();
          ctx.globalAlpha = 0.92 * (1 - lid); ctx.fillStyle = '#f8f4ff';
          ctx.beginPath(); ctx.arc(ecx - rx * 0.3, ecy - ry * 0.4 + 2 * ry * lid, rx * 0.32, 0, Math.PI * 2); ctx.fill();
          ctx.globalAlpha = 0.7 * (1 - lid);
          ctx.beginPath(); ctx.arc(ecx + rx * 0.34, ecy + ry * 0.28, rx * 0.16, 0, Math.PI * 2); ctx.fill();
          ctx.globalAlpha = 1;
          ctx.restore();
          // upper lid whisper — hugs the oval, never a brow
          ctx.strokeStyle = 'rgba(30,22,40,0.25)'; ctx.lineWidth = Math.max(0.7, rx * 0.14);
          ctx.beginPath(); ctx.ellipse(ecx, ecy, rx * 0.9, ry * 0.9, 0, Math.PI * 1.25, Math.PI * 1.75); ctx.stroke();
        }
        if (lid > 0.82) {
          ctx.strokeStyle = 'rgba(20,16,32,0.85)'; ctx.lineWidth = Math.max(1, rx * 0.45);
          ctx.beginPath();
          ctx.moveTo(ecx - rx * 0.9, ecy + ry * 0.5);
          ctx.quadraticCurveTo(ecx, ecy + ry * 0.72, ecx + rx * 0.9, ecy + ry * 0.5);
          ctx.stroke();
        }
      }
      if (mood === 'teary') {
        // a small trembling FROWN (a soft ∩, corners pulled down) — the sad mouth.
        // Subtle + rounded so he still reads cute, just heartbroken.
        ctx.strokeStyle = 'rgba(42,30,54,0.9)'; ctx.lineWidth = Math.max(1, R * 0.05); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        var my = cy + R * 0.6;
        ctx.beginPath();
        ctx.moveTo(cx - R * 0.15, my + R * 0.035);
        ctx.quadraticCurveTo(cx - R * 0.05, my - R * 0.055, cx, my - R * 0.02);
        ctx.quadraticCurveTo(cx + R * 0.05, my - R * 0.055, cx + R * 0.15, my + R * 0.035);   // a faint wobble in the middle
        ctx.stroke();
      }
    }
  }

  /* ================= THE RADIANT ONE — v3, layered vestments ================= */
  // ============================ WISDOM — RECREATED ============================
  // She is LIGHT. Proverbs 8 speaks her as the one who was with God from the
  // beginning — and Wisdom IS Christ (1 Cor 1:24), so she must be painted the way
  // ep1 paints the Father: a BEING OF RADIANCE, glowing from within, spilling her
  // light into the scene — not a tan robe with a crown drawn on.
  //
  // The old version was left behind on the pre-Jul-21 style: every part inked with
  // a hard dark outline (#4a2c0c) and a muddy brown-tan robe, standing beside a
  // painterly pilgrim. Recreated here under the SAME law as the pilgrim:
  //   NO DARK OUTLINE — she holds by VALUE and by her own rim of light.
  // Luminous ladder: warm amber shadow → gold → pale gold → white-hot core.
  function drawRadiant(ctx, p, anim) {
    var h = p.h, R = h * 0.138, facing = p.facing || 1;          // a SMALLER head — she is tall, not a doll
    var x = p.x + (anim.swayX || 0), y = p.y + (anim.bobY || 0);
    var cx = x + (p.lean || 0) * 0.5, cy = y - h + R * 1.1 + (p.headDrop || 0);
    var neckY = cy + R * 1.02;                                     // a real neck-drop → a standing figure, not a bell
    var wt = R * 1.16, wb = R * (p.kneel ? 3.1 : 2.55);            // narrow shoulders falling to a long flared hem
    var midY = (neckY + y) / 2, hemW = h * 0.02;
    var wd = (anim.breeze || 0) * R * (p.dance ? 2.2 : 0.7);
    var NO = 'rgba(0,0,0,0)';                                  // the ink is gone
    var DEEP = '#c07f1c', BASEG = '#f0c344', LIGHT = '#ffe79a', CORE = '#fffdf0';
    var DEEPA = hexA(DEEP), BASEA = hexA(BASEG), LIGHTA = hexA(LIGHT);
    var pulse = 1 + (anim.breeze || 0) * 0.06;                 // her light breathes
    var heartY = midY - h * 0.05;

    ctx.lineJoin = 'round'; ctx.lineCap = 'round';

    // The same painter's hand as the pilgrim and the plates: a stable per-figure rng,
    // one tapered mark, and broken colour so no two marks repeat. Hers run WARM —
    // she is made of light, so her paint is gold varying into white, never grey.
    var rs2 = (Math.floor(Math.abs(p.x) * 137 + Math.abs(p.y) * 19 + h * 11) | 0) >>> 0 || 11;
    var rrnd = function () { rs2 = (rs2 * 1103515245 + 12345) & 0x7fffffff; return rs2 / 0x7fffffff; };
    function rmark(x0, y0, ang, L, W2, col, a2) {
      ctx.save();
      ctx.globalAlpha = a2 == null ? 1 : a2;
      ctx.strokeStyle = col; ctx.lineWidth = W2; ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x0 - Math.cos(ang) * L / 2, y0 - Math.sin(ang) * L / 2);
      ctx.lineTo(x0 + Math.cos(ang) * L / 2, y0 + Math.sin(ang) * L / 2);
      ctx.stroke(); ctx.restore();
    }
    function rbroke(arr, dl) {
      var l = (dl == null ? (rrnd() - 0.5) * 38 : dl), w = (rrnd() - 0.5) * 22;
      return rgbS(arr[0] + l + w, arr[1] + l + w * 0.4, arr[2] + l - w);
    }

    /* ---- 1. HER RADIANCE — the light she IS, spilling into the scene ---- */
    var auraR = h * (p.kneel ? 0.60 : 0.70) * pulse;
    var ag = ctx.createRadialGradient(cx, heartY, R * 0.18, cx, heartY, auraR);
    ag.addColorStop(0, 'rgba(255,246,214,0.40)');
    ag.addColorStop(0.40, 'rgba(255,226,150,0.16)');
    ag.addColorStop(1, 'rgba(255,220,140,0)');
    ctx.fillStyle = ag;
    ctx.beginPath(); ctx.ellipse(cx, heartY, auraR, auraR * 0.94, 0, 0, Math.PI * 2); ctx.fill();
    // rays of glory — soft TAPERED WEDGES that fade out (hairlines read as scratches)
    ctx.save(); ctx.globalAlpha = 0.5;
    for (var ry = 0; ry < 14; ry++) {
      var ra2 = ry * Math.PI / 7 + (anim.breeze || 0) * 0.35;
      var r0 = auraR * 0.26, r1 = auraR * (0.78 + (ry % 3) * 0.16);
      var wdg = (ry % 2 ? 0.026 : 0.05) * Math.PI;                  // the wedge's half-angle
      var rg = ctx.createLinearGradient(cx + Math.cos(ra2) * r0, heartY + Math.sin(ra2) * r0 * 0.9,
                                        cx + Math.cos(ra2) * r1, heartY + Math.sin(ra2) * r1 * 0.9);
      rg.addColorStop(0, 'rgba(255,236,176,0.20)');
      rg.addColorStop(1, 'rgba(255,226,150,0)');
      ctx.fillStyle = rg;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(ra2) * r0, heartY + Math.sin(ra2) * r0 * 0.9);
      ctx.lineTo(cx + Math.cos(ra2 - wdg) * r1, heartY + Math.sin(ra2 - wdg) * r1 * 0.9);
      ctx.lineTo(cx + Math.cos(ra2 + wdg) * r1, heartY + Math.sin(ra2 + wdg) * r1 * 0.9);
      ctx.closePath(); ctx.fill();
    }
    ctx.restore();

    /* ---- 2. THE ROBE — gold that glows from within, no ink ---- */
    // SHE IS A WOMAN — Proverbs says "she" of Wisdom throughout. So the silhouette
    // is a GOWN: narrow shoulders drawing in at the waist, then falling in a long
    // flare to the hem — not the straight bell a robe makes.
    var waistY = neckY + (y - neckY) * 0.33, waistW = wt * 0.94;
    function robePath(c2) {
      c2.beginPath();
      c2.moveTo(x - wt, neckY);
      c2.quadraticCurveTo(x - wt * 1.03, waistY - h * 0.03, x - waistW, waistY);              // in to the waist
      c2.quadraticCurveTo(x - wb * 0.84 + wd * 0.5, (waistY + y) / 2, x - wb + wd, y);        // out in a long skirt
      c2.quadraticCurveTo(c2 === ctx ? x - wb * 0.55 + wd * 0.7 : x - wb * 0.55, y - hemW * 2.2, x - wb * 0.2 + wd * 0.5, y);
      c2.quadraticCurveTo(x + wb * 0.25 + wd * 0.35, y - hemW * 2, x + wb * 0.6 + wd * 0.2, y);
      c2.quadraticCurveTo(x + wb * 0.85, y - hemW * 1.4, x + wb, y);
      c2.quadraticCurveTo(x + wb * 0.84, (waistY + y) / 2, x + waistW, waistY);
      c2.quadraticCurveTo(x + wt * 1.03, waistY - h * 0.03, x + wt, neckY);
      c2.quadraticCurveTo(cx, neckY - R * 0.28, x - wt, neckY);
      c2.closePath();
    }
    robePath(ctx);
    ctx.fillStyle = DEEP; ctx.strokeStyle = NO; ctx.fill();
    ctx.save(); robePath(ctx); ctx.clip();
    ctx.fillStyle = BASEG;
    ctx.fillRect(x - wb * 1.4, neckY - R, wb * 2.8, h * 1.3);
    // NO SHADOW. She is the light in this scene — a lit thing casts shadow, a light
    // SOURCE does not darken on its own away-side. Only the faintest warm turn, so
    // she still reads as a form and not a flat cutout.
    ctx.fillStyle = '#e8b23a'; ctx.globalAlpha = 0.16;
    ctx.beginPath(); ctx.ellipse(x - facing * wb * 0.78 + wd * 0.4, midY + h * 0.1, wb * 0.6, h * 0.44, 0, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
    // the indwelling column — pale gold into a white-hot heart
    ctx.fillStyle = LIGHT;
    ctx.beginPath(); ctx.ellipse(cx + facing * R * 0.28, midY, R * 1.02, h * 0.44, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = CORE; ctx.globalAlpha = 0.92;
    ctx.beginPath(); ctx.ellipse(cx + facing * R * 0.28, midY - h * 0.03, R * 0.5, h * 0.35, 0, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
    // vestment folds — LIGHT creases (a lit garment creases bright, not black)
    ctx.strokeStyle = tint(LIGHTA, 0.35); ctx.lineWidth = Math.max(1, R * 0.07); ctx.globalAlpha = 0.5;
    for (var fo = -1; fo <= 1; fo += 2) {
      ctx.beginPath();
      ctx.moveTo(cx + fo * wt * 0.85, neckY + R * 0.5);
      ctx.quadraticCurveTo(cx + fo * wb * 0.5 + wd * 0.3, midY + h * 0.08, cx + fo * wb * 0.62 + wd * 0.7, y - hemW * 2.4);
      ctx.stroke();
    }
    // ---- THE GOWN, PAINTED. Marks fall the way this cloth falls: drawn in at the
    // waist, then flaring long to the hem. They run warm-to-white toward her heart,
    // because on her the light comes from INSIDE the figure, not from the scene.
    {
      var nG = Math.max(20, Math.round(h * 0.6));
      for (var gi = 0; gi < nG; gi++) {
        var tg = rrnd();
        var halfG = wt + (wb - wt) * Math.pow(tg, 1.25);      // narrow at the shoulder, flared at the hem
        var gx2 = cx + (rrnd() * 2 - 1) * halfG * 0.98;
        var gy2 = neckY + tg * (y - neckY);
        var flare = ((gx2 - cx) / Math.max(1, wb)) * 0.9;
        var ga = Math.PI / 2 + flare * (0.25 + tg * 0.85) + wd * 0.01;
        var toHeart = 1 - Math.min(1, Math.hypot(gx2 - cx, gy2 - heartY) / (h * 0.5));
        var gcol = rbroke(toHeart > 0.62 ? LIGHTA : toHeart > 0.3 ? BASEA : DEEPA,
                          (toHeart - 0.4) * 46 + (rrnd() - 0.5) * 26);
        rmark(gx2, gy2, ga, h * (0.08 + rrnd() * 0.12),
              Math.max(1, h * (0.014 + rrnd() * 0.015)), gcol, 0.34 + rrnd() * 0.32);
      }
    }
    ctx.globalAlpha = 1;
    ctx.restore();

    // ---- HER EDGE, MADE BY THE BRUSH. Unclipped, so these cross the outline: on a
    // figure made of light the hem should not end, it should dissolve into the glow.
    {
      var nGe = Math.max(12, Math.round(h * 0.3));
      for (var ge = 0; ge < nGe; ge++) {
        var u2 = rrnd(), px2, py2, pa;
        if (u2 < 0.55) {                        // the two falling sides
          var sg = rrnd() < 0.5 ? -1 : 1, tv2 = rrnd();
          var hw3 = wt + (wb - wt) * Math.pow(tv2, 1.25);
          px2 = cx + sg * hw3 * (0.98 + rrnd() * 0.07);
          py2 = neckY + tv2 * (y - neckY);
          pa = Math.PI / 2 + sg * (0.25 + tv2 * 0.6);
        } else {                                // the hem, dissolving downward
          px2 = cx + (rrnd() * 2 - 1) * wb * 0.98;
          py2 = y - hemW * rrnd() * 2.2;
          pa = Math.PI / 2 + (rrnd() - 0.5) * 0.9;
        }
        rmark(px2, py2, pa, h * (0.05 + rrnd() * 0.09),
              Math.max(1, h * (0.011 + rrnd() * 0.013)),
              rbroke(rrnd() < 0.5 ? BASEA : LIGHTA, null), 0.26 + rrnd() * 0.3);
      }
    }
    // HER RIM OF LIGHT — this is what the dark outline used to do, done by light
    ctx.save(); ctx.globalAlpha = 0.9;
    ctx.strokeStyle = CORE; ctx.lineWidth = Math.max(1.4, h * 0.018);
    ctx.beginPath();
    ctx.moveTo(x + facing * wt * 0.98, neckY + 1);
    ctx.quadraticCurveTo(x + facing * wt * 1.01, waistY - h * 0.03, x + facing * waistW * 0.99, waistY);   // follow the gown IN at the waist…
    ctx.quadraticCurveTo(x + facing * wb * 0.84, (waistY + y) / 2, x + facing * wb * 0.96 + wd * 0.2, y - hemW * 2.2);   // …then OUT down the skirt
    ctx.stroke();
    ctx.globalAlpha = 0.42; ctx.lineWidth = Math.max(2.4, h * 0.034);
    ctx.stroke();                                              // a soft bloom on the same edge
    ctx.restore();
    // her girdle at the waist — a band of light (Isa 11:5, "righteousness the girdle")
    ctx.save(); ctx.globalAlpha = 0.8;
    ctx.strokeStyle = LIGHT; ctx.lineWidth = Math.max(1.6, h * 0.016);
    ctx.beginPath();
    ctx.moveTo(x - waistW * 0.98, waistY);
    ctx.quadraticCurveTo(cx, waistY + h * 0.018, x + waistW * 0.98, waistY);
    ctx.stroke();
    ctx.strokeStyle = CORE; ctx.globalAlpha = 0.55; ctx.lineWidth = Math.max(0.8, h * 0.007);
    ctx.beginPath();
    ctx.moveTo(x - waistW * 0.9, waistY - h * 0.004);
    ctx.quadraticCurveTo(cx, waistY + h * 0.012, x + waistW * 0.9, waistY - h * 0.004);
    ctx.stroke(); ctx.restore();
    // the hem catches the light
    ctx.save(); ctx.globalAlpha = 0.55; ctx.strokeStyle = LIGHT; ctx.lineWidth = Math.max(1, h * 0.013);
    ctx.beginPath();
    ctx.moveTo(x - wb * 0.92 + wd * 0.9, y - hemW * 3.2);
    ctx.quadraticCurveTo(cx + wd * 0.4, y - hemW * 5.2, x + wb * 0.92, y - hemW * 3.0);
    ctx.stroke(); ctx.restore();

    /* ---- 3. SLEEVED ARMS — limbs of light, no ink ---- */
    [p.armL, p.armR].forEach(function (tip) {
      if (!tip) return;
      var side = tip[0] >= cx ? 1 : -1;
      var sx = x + side * wt * 0.85, sy = neckY + R * 0.35;
      var mx = (sx + tip[0]) / 2 + side * 2, my = (sy + tip[1]) / 2 + 2;
      var elX = (sx + mx) / 2, elY = (sy + my) / 2 + 1;
      // upper sleeve: deep gold body, pale gold lit edge
      ctx.strokeStyle = DEEP; ctx.lineWidth = Math.max(4.4, h * 0.078);
      ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(elX, elY); ctx.stroke();
      ctx.strokeStyle = BASEG; ctx.lineWidth = Math.max(3.4, h * 0.062);
      ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(elX, elY); ctx.stroke();
      ctx.strokeStyle = LIGHT; ctx.lineWidth = Math.max(1.4, h * 0.022);
      ctx.beginPath(); ctx.moveTo(sx + 0.5, sy - 1.4); ctx.lineTo(elX + 0.5, elY - 1.8); ctx.stroke();
      // forearm
      ctx.strokeStyle = DEEP; ctx.lineWidth = Math.max(2.8, h * 0.042);
      ctx.beginPath(); ctx.moveTo(elX, elY); ctx.quadraticCurveTo(mx, my, tip[0], tip[1]); ctx.stroke();
      ctx.strokeStyle = BASEG; ctx.lineWidth = Math.max(2, h * 0.03);
      ctx.beginPath(); ctx.moveTo(elX, elY); ctx.quadraticCurveTo(mx, my, tip[0], tip[1]); ctx.stroke();
      // the HAND — a small white-hot lamp with its own halo
      var nr = Math.max(2.6, h * 0.042);
      var hg = ctx.createRadialGradient(tip[0], tip[1], nr * 0.25, tip[0], tip[1], nr * 1.9);
      hg.addColorStop(0, 'rgba(255,248,220,0.42)');
      hg.addColorStop(1, 'rgba(255,232,160,0)');
      ctx.fillStyle = hg;
      ctx.beginPath(); ctx.arc(tip[0], tip[1], nr * 1.9, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = CORE; ctx.strokeStyle = NO;
      ctx.beginPath(); ctx.arc(tip[0], tip[1], nr, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(tip[0] - side * nr * 0.6, tip[1] + nr * 0.44, nr * 0.4, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = tone(BASEA, 0.98); ctx.globalAlpha = 0.5; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(tip[0], tip[1], nr * 0.98, side > 0 ? Math.PI * 0.75 : Math.PI * 1.6, side > 0 ? Math.PI * 1.3 : Math.PI * 2.2); ctx.stroke();
      ctx.globalAlpha = 1;
    });

    /* ---- 4. THE MANTLE — a shoulder-cape of light over the robe ---- */
    function mantlePath(c2) {
      var mb = neckY + h * 0.24;
      c2.beginPath();
      c2.moveTo(x - wt * 1.18, neckY + R * 0.1);
      c2.quadraticCurveTo(x - wt * 1.3, neckY + h * 0.12, x - wt * 0.95, mb);
      c2.quadraticCurveTo(x - wt * 0.4, mb + h * 0.035, cx, mb - h * 0.012);
      c2.quadraticCurveTo(x + wt * 0.4, mb + h * 0.035, x + wt * 0.95, mb);
      c2.quadraticCurveTo(x + wt * 1.3, neckY + h * 0.12, x + wt * 1.18, neckY + R * 0.1);
      c2.quadraticCurveTo(cx, neckY - R * 0.42, x - wt * 1.18, neckY + R * 0.1);
      c2.closePath();
    }
    mantlePath(ctx);
    ctx.fillStyle = '#cf9020'; ctx.strokeStyle = NO; ctx.fill();   // the mantle sits a value deeper than the robe
    ctx.save(); mantlePath(ctx); ctx.clip();
    ctx.fillStyle = LIGHT; ctx.globalAlpha = 0.9;
    ctx.beginPath(); ctx.ellipse(cx + facing * wt * 0.5, neckY + R * 0.12, wt * 0.8, h * 0.105, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = CORE; ctx.globalAlpha = 0.5;
    ctx.beginPath(); ctx.ellipse(cx + facing * wt * 0.42, neckY + R * 0.02, wt * 0.5, h * 0.055, 0, 0, Math.PI * 2); ctx.fill();
    // ---- THE MANTLE, PAINTED. The largest smooth mass on her, and the one that most
    // gave her away. Marks run ACROSS the shoulders, following the cape's fall around
    // the body, brightening toward the side the light favours.
    {
      var nM = Math.max(16, Math.round(h * 0.34));
      for (var mi = 0; mi < nM; mi++) {
        var mxx = cx + (rrnd() * 2 - 1) * wt * 1.02;
        var myy = neckY + rrnd() * h * 0.235;
        var across = (mxx - cx) / Math.max(1, wt);
        // a cape wraps: strokes curve down and outward as they leave the neck
        var ma = across * 0.75 + Math.PI * 0.5 * (0.28 + rrnd() * 0.2);
        var mlit = across * facing + 0.35;
        rmark(mxx, myy, ma, h * (0.05 + rrnd() * 0.075),
              Math.max(1, h * (0.012 + rrnd() * 0.013)),
              rbroke(mlit > 0.55 ? hexA(CORE) : mlit > 0.05 ? LIGHTA : DEEPA,
                     (mlit - 0.3) * 34 + (rrnd() - 0.5) * 24),
              0.3 + rrnd() * 0.3);
      }
    }
    ctx.globalAlpha = 1; ctx.restore();
    // its lit lower edge — a bright hem, not an inked one
    ctx.save(); ctx.strokeStyle = CORE; ctx.globalAlpha = 0.75; ctx.lineWidth = Math.max(1, h * 0.012);
    ctx.beginPath();
    ctx.moveTo(x - wt * 0.9, neckY + h * 0.228);
    ctx.quadraticCurveTo(cx, neckY + h * 0.262, x + wt * 0.9, neckY + h * 0.228);
    ctx.stroke(); ctx.restore();

    /* ---- 5. THE SUN-DISC at her breast — a small blazing sun ---- */
    var brY = neckY + h * 0.1;
    var bg = ctx.createRadialGradient(cx, brY, R * 0.04, cx, brY, R * 0.72);
    bg.addColorStop(0, 'rgba(255,252,236,0.85)');
    bg.addColorStop(1, 'rgba(255,232,160,0)');
    ctx.fillStyle = bg;
    ctx.beginPath(); ctx.arc(cx, brY, R * 0.72, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = CORE; ctx.lineWidth = Math.max(1, R * 0.075);
    for (var ra = 0; ra < 8; ra++) {
      var an = ra * Math.PI / 4 + Math.PI / 8;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(an) * R * 0.2, brY + Math.sin(an) * R * 0.2);
      ctx.lineTo(cx + Math.cos(an) * R * (ra % 2 ? 0.31 : 0.38), brY + Math.sin(an) * R * (ra % 2 ? 0.31 : 0.38));
      ctx.stroke();
    }
    ctx.fillStyle = CORE; ctx.strokeStyle = NO;
    ctx.beginPath(); ctx.arc(cx, brY, R * 0.17, 0, Math.PI * 2); ctx.fill();

    /* ---- 5b. HER HAIR — long luminous waves falling past her shoulders ---- */
    // the clearest sign that Wisdom is SHE (Prov 8): a woman's long hair, made of
    // light like the rest of her — spun gold, not a dark mass.
    var hairEnd = neckY + h * 0.26;
    var hgr = ctx.createLinearGradient(cx, cy - R * 1.1, cx, hairEnd);
    hgr.addColorStop(0, '#fff2c8'); hgr.addColorStop(0.45, '#f6cf68'); hgr.addColorStop(1, '#dfa93a');
    ctx.fillStyle = hgr; ctx.strokeStyle = NO;
    ctx.beginPath();
    ctx.moveTo(cx - R * 0.96, cy - R * 0.15);
    ctx.quadraticCurveTo(cx - R * 1.58, cy + R * 1.0, cx - R * 1.12, hairEnd);            // the left fall
    ctx.quadraticCurveTo(cx - R * 0.55, hairEnd + R * 0.3, cx, hairEnd - R * 0.08);       // waving across the ends
    ctx.quadraticCurveTo(cx + R * 0.55, hairEnd + R * 0.3, cx + R * 1.12, hairEnd);
    ctx.quadraticCurveTo(cx + R * 1.58, cy + R * 1.0, cx + R * 0.96, cy - R * 0.15);      // the right fall
    ctx.quadraticCurveTo(cx, cy - R * 1.32, cx - R * 0.96, cy - R * 0.15);                // over the crown of her head
    ctx.closePath(); ctx.fill();

    // ---- HER HAIR, PAINTED. This is the largest smooth mass on her — it falls in
    // front of the mantle, which is why painting the mantle changed nothing. Hair is
    // the easiest thing in the world to paint badly and the easiest to paint well:
    // the marks simply follow the fall, splaying as they leave the crown.
    {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(cx - R * 0.96, cy - R * 0.15);
      ctx.quadraticCurveTo(cx - R * 1.58, cy + R * 1.0, cx - R * 1.12, hairEnd);
      ctx.quadraticCurveTo(cx - R * 0.55, hairEnd + R * 0.3, cx, hairEnd - R * 0.08);
      ctx.quadraticCurveTo(cx + R * 0.55, hairEnd + R * 0.3, cx + R * 1.12, hairEnd);
      ctx.quadraticCurveTo(cx + R * 1.58, cy + R * 1.0, cx + R * 0.96, cy - R * 0.15);
      ctx.quadraticCurveTo(cx, cy - R * 1.32, cx - R * 0.96, cy - R * 0.15);
      ctx.closePath(); ctx.clip();
      var HI = hexA('#fff2c8'), HM = hexA('#f6cf68'), HD = hexA('#dfa93a');
      var nH2 = Math.max(24, Math.round(h * 0.5));
      for (var hh2 = 0; hh2 < nH2; hh2++) {
        var th = rrnd();                                   // 0 at the crown, 1 at the ends
        var sp = (rrnd() * 2 - 1);
        var hxx = cx + sp * R * (0.9 + th * 0.75);
        var hyy = (cy - R * 1.2) + th * (hairEnd + R * 0.2 - (cy - R * 1.2));
        var fallA = Math.PI / 2 + sp * (0.5 - th * 0.35);  // splaying from the crown, closing at the ends
        var hcol = rbroke(th < 0.3 ? HI : th < 0.72 ? HM : HD, (0.4 - th) * 40 + (rrnd() - 0.5) * 30);
        rmark(hxx, hyy, fallA, R * (0.5 + rrnd() * 0.7), Math.max(1, R * (0.07 + rrnd() * 0.08)),
              hcol, 0.34 + rrnd() * 0.34);
      }
      ctx.restore();
    }
    // strands catching the light
    ctx.save(); ctx.globalAlpha = 0.55; ctx.lineCap = 'round';
    for (var hs = -2; hs <= 2; hs++) {
      if (!hs) continue;
      var hx0 = cx + hs * R * 0.34, sgn = hs < 0 ? -1 : 1;
      ctx.strokeStyle = hs % 2 ? CORE : LIGHT;
      ctx.lineWidth = Math.max(1, R * (hs % 2 ? 0.055 : 0.085));
      ctx.beginPath();
      ctx.moveTo(hx0, cy - R * 0.7);
      ctx.quadraticCurveTo(cx + sgn * R * 1.25, cy + R * 0.85, cx + sgn * R * (0.85 + Math.abs(hs) * 0.1), hairEnd - R * 0.2);
      ctx.stroke();
    }
    ctx.restore();

    /* ---- 6. HER FACE — light, not a mask: a warm rim instead of ink ---- */
    var fg = ctx.createRadialGradient(cx, cy, R * 0.85, cx, cy, R * 1.95);
    fg.addColorStop(0, 'rgba(255,246,214,0.34)');
    fg.addColorStop(1, 'rgba(255,232,168,0)');
    ctx.fillStyle = fg;
    ctx.beginPath(); ctx.arc(cx, cy, R * 1.95, 0, Math.PI * 2); ctx.fill();   // a halo AROUND her face, not over it
    ctx.beginPath(); ctx.ellipse(cx, cy, R * 0.92, R * 1.06, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#fffaef'; ctx.strokeStyle = NO; ctx.fill();
    ctx.save();
    ctx.beginPath(); ctx.ellipse(cx, cy, R * 0.92, R * 1.06, 0, 0, Math.PI * 2); ctx.clip();
    // the turned-away cheek warms to gold (never grey)
    ctx.fillStyle = '#f2d79c'; ctx.globalAlpha = 0.72;
    ctx.beginPath(); ctx.ellipse(cx - facing * R * 0.80, cy + R * 0.1, R * 0.44, R * 0.92, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f0d492'; ctx.globalAlpha = 0.5;
    ctx.beginPath(); ctx.ellipse(cx, cy + R * 0.98, R * 0.72, R * 0.3, 0, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
    // the lit brow
    ctx.strokeStyle = 'rgba(255,255,252,0.85)'; ctx.lineWidth = Math.max(1, R * 0.09);
    ctx.beginPath(); ctx.ellipse(cx, cy, R * 0.72, R * 0.84, 0, Math.PI * 1.12, Math.PI * 1.58); ctx.stroke();

    // ---- HER FACE, PAINTED. Same rule as the pilgrim: marks that run AROUND the
    // form, tangential, so it stops being an ellipse. Hers stay near-white and low in
    // contrast — she is lit from within, so the modelling is a whisper, not a shadow.
    {
      var nF = Math.max(12, Math.round(R * 2.2));
      for (var fi2 = 0; fi2 < nF; fi2++) {
        var fa = rrnd() * Math.PI * 2, fr2 = Math.sqrt(rrnd()) * 0.96;
        var fx3 = cx + Math.cos(fa) * R * 0.92 * fr2;
        var fy4 = cy + Math.sin(fa) * R * 1.06 * fr2;
        var lit2 = Math.cos(fa) * facing + 0.4;
        rmark(fx3, fy4, fa + Math.PI / 2 + (rrnd() - 0.5) * 0.45,
              R * (0.30 + rrnd() * 0.32), Math.max(1, R * (0.07 + rrnd() * 0.06)),
              rbroke(lit2 > 0.5 ? hexA(CORE) : LIGHTA, (lit2 - 0.2) * 20 + (rrnd() - 0.5) * 16),
              0.22 + rrnd() * 0.22);
      }
    }
    ctx.restore();
    // strokes crossing her face's outline, so its edge is brushwork not geometry
    {
      var nFe = Math.max(8, Math.round(R * 1.0));
      for (var fe = 0; fe < nFe; fe++) {
        var qa2 = rrnd() * Math.PI * 2;
        rmark(cx + Math.cos(qa2) * R * 0.92 * (0.97 + rrnd() * 0.08),
              cy + Math.sin(qa2) * R * 1.06 * (0.97 + rrnd() * 0.08),
              qa2 + Math.PI / 2 + (rrnd() - 0.5) * 0.6,
              R * (0.18 + rrnd() * 0.2), Math.max(1, R * (0.055 + rrnd() * 0.05)),
              rbroke(rrnd() < 0.6 ? hexA(CORE) : LIGHTA, null), 0.26 + rrnd() * 0.26);
      }
    }
    // her rim of light where the ink outline used to be
    ctx.save(); ctx.globalAlpha = 0.8; ctx.strokeStyle = LIGHT; ctx.lineWidth = Math.max(1.2, R * 0.075);
    ctx.beginPath(); ctx.ellipse(cx, cy, R * 0.93, R * 1.07, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();

    /* ---- 7. THE CROWN — worn light, not a flat gold sticker ---- */
    var crownB = cy - R * 0.74;
    var cg = ctx.createLinearGradient(cx, crownB - R * 0.7, cx, crownB + R * 0.32);
    cg.addColorStop(0, '#fff6d4'); cg.addColorStop(0.55, '#f6cf5c'); cg.addColorStop(1, '#d29a26');
    ctx.fillStyle = cg; ctx.strokeStyle = NO;
    ctx.beginPath();
    ctx.moveTo(cx - R * 0.62, crownB + R * 0.06);
    ctx.quadraticCurveTo(cx, crownB - R * 0.18, cx + R * 0.62, crownB + R * 0.06);
    ctx.lineTo(cx + R * 0.58, crownB + R * 0.3);
    ctx.quadraticCurveTo(cx, crownB + R * 0.08, cx - R * 0.58, crownB + R * 0.3);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = CORE; ctx.globalAlpha = 0.85; ctx.lineWidth = Math.max(0.9, h * 0.011);
    ctx.beginPath();
    ctx.moveTo(cx - R * 0.5, crownB + R * 0.04);
    ctx.quadraticCurveTo(cx, crownB - R * 0.15, cx + R * 0.5, crownB + R * 0.04);
    ctx.stroke(); ctx.globalAlpha = 1;
    // points, each tipped with its own spark
    ctx.fillStyle = cg; ctx.strokeStyle = NO;
    ctx.beginPath();
    ctx.moveTo(cx - R * 0.2, crownB); ctx.lineTo(cx, crownB - R * 0.68); ctx.lineTo(cx + R * 0.2, crownB);
    ctx.closePath(); ctx.fill();
    for (var s2 = -1; s2 <= 1; s2 += 2) {
      ctx.beginPath();
      ctx.moveTo(cx + s2 * R * 0.52, crownB + R * 0.02);
      ctx.lineTo(cx + s2 * R * 0.44, crownB - R * 0.42);
      ctx.lineTo(cx + s2 * R * 0.26, crownB - R * 0.02);
      ctx.closePath(); ctx.fill();
    }
    ctx.fillStyle = CORE; ctx.globalAlpha = 0.9;
    [[cx, crownB - R * 0.68], [cx - R * 0.44, crownB - R * 0.42], [cx + R * 0.44, crownB - R * 0.42]].forEach(function (pt) {
      ctx.beginPath(); ctx.arc(pt[0], pt[1], Math.max(0.9, R * 0.055), 0, Math.PI * 2); ctx.fill();
    });
    ctx.globalAlpha = 1;
    // the centre gem, lit from within
    ctx.fillStyle = '#e8566a'; ctx.strokeStyle = NO;
    ctx.beginPath(); ctx.arc(cx, crownB - R * 0.16, R * 0.095, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffd8de';
    ctx.beginPath(); ctx.arc(cx - R * 0.03, crownB - R * 0.19, R * 0.038, 0, Math.PI * 2); ctx.fill();

    /* ---- 7b. FRONT LOCKS — two soft strands framing her face ---- */
    ctx.save(); ctx.globalAlpha = 0.92; ctx.fillStyle = hgr;
    for (var fl = -1; fl <= 1; fl += 2) {
      ctx.beginPath();
      ctx.moveTo(cx + fl * R * 0.86, cy - R * 0.52);
      ctx.quadraticCurveTo(cx + fl * R * 1.16, cy + R * 0.15, cx + fl * R * 0.92, cy + R * 0.98);
      ctx.quadraticCurveTo(cx + fl * R * 0.74, cy + R * 0.35, cx + fl * R * 0.66, cy - R * 0.46);
      ctx.closePath(); ctx.fill();
    }
    ctx.restore();

    /* ---- 8. HER FACE'S PEACE — calm crescent eyes in warm gold, and a smile ---- */
    if (!p.back) {
      for (var s3 = -1; s3 <= 1; s3 += 2) {
        var ecx = cx + s3 * R * 0.4 + facing * R * 0.06, ecy = cy + R * 0.08;
        ctx.strokeStyle = '#a9762a'; ctx.lineWidth = Math.max(1.6, R * 0.115);
        ctx.beginPath();
        ctx.moveTo(ecx - R * 0.18, ecy);
        ctx.quadraticCurveTo(ecx, ecy + R * 0.22, ecx + R * 0.18, ecy);
        ctx.stroke();
        ctx.strokeStyle = '#7c5216'; ctx.lineWidth = Math.max(0.8, R * 0.05);
        ctx.beginPath();
        ctx.moveTo(ecx - R * 0.1, ecy + R * 0.07);
        ctx.quadraticCurveTo(ecx, ecy + R * 0.16, ecx + R * 0.1, ecy + R * 0.07);
        ctx.stroke();
        // HER EYELASHES — three fine lashes fanning up from the outer corner.
        // Fred's call, and he's right: nothing says "she" faster than lashes.
        var ox = ecx + s3 * R * 0.17, oy = ecy + R * 0.03;
        ctx.strokeStyle = '#8a5c18'; ctx.lineCap = 'round';
        for (var lz = 0; lz < 3; lz++) {
          var spread = 0.09 + lz * 0.115;                    // fanning outward
          var lift = 0.145 - lz * 0.038;                     // the innermost stands tallest
          ctx.lineWidth = Math.max(0.7, R * (0.040 - lz * 0.007));   // fine, tapering outward
          ctx.beginPath();
          ctx.moveTo(ox, oy);
          ctx.quadraticCurveTo(ox + s3 * R * spread * 0.7, oy - R * lift * 0.7,
                               ox + s3 * R * (spread + 0.06), oy - R * lift);
          ctx.stroke();
        }
        // a spark caught on the lashes — she is lit even in her calm
        ctx.fillStyle = 'rgba(255,250,230,0.85)';
        ctx.beginPath(); ctx.arc(ox + s3 * R * 0.05, oy - R * 0.13, Math.max(0.6, R * 0.03), 0, Math.PI * 2); ctx.fill();
      }
      if (anim.smile) {
        var my2 = cy + R * 0.5;
        ctx.fillStyle = 'rgba(244,150,150,0.38)';
        ctx.beginPath(); ctx.arc(cx - R * 0.52, cy + R * 0.34, R * 0.18, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(cx + R * 0.52, cy + R * 0.34, R * 0.18, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#a9762a'; ctx.lineWidth = Math.max(1.4, R * 0.09);
        ctx.beginPath();
        ctx.moveTo(cx - R * 0.24, my2);
        ctx.quadraticCurveTo(cx, my2 + R * 0.3, cx + R * 0.24, my2);
        ctx.stroke();
      }
    }
  }

  /* ================= THE LIVING SCENE — objects as code ================= */
  // faithful mini-ports of the atelier's painterly math (gen/engine.mjs), so
  // runtime objects keep the pressed plates' brush character.
  function mulberry32(seed) {
    var a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t2 = Math.imul(a ^ (a >>> 15), 1 | a);
      t2 = (t2 + Math.imul(t2 ^ (t2 >>> 7), 61 | t2)) ^ t2;
      return ((t2 ^ (t2 >>> 14)) >>> 0) / 4294967296;
    };
  }
  function vhash(ix, iy, seed) {
    var n = ix * 374761393 + iy * 668265263 + seed * 1442695041;
    n = (n ^ (n >> 13)) * 1274126177;
    return (((n ^ (n >> 16)) >>> 0) % 1024) / 1024;
  }
  function vnoise(x, y, seed) {
    var ix = Math.floor(x), iy = Math.floor(y), fx2 = x - ix, fy2 = y - iy;
    var a = vhash(ix, iy, seed), b = vhash(ix + 1, iy, seed);
    var c = vhash(ix, iy + 1, seed), d2 = vhash(ix + 1, iy + 1, seed);
    var ux = fx2 * fx2 * (3 - 2 * fx2), uy = fy2 * fy2 * (3 - 2 * fy2);
    return a + (b - a) * ux + (c - a) * uy + (a - b - c + d2) * ux * uy;
  }
  function fbm(x, y, seed) {
    return (vnoise(x, y, seed) + 0.5 * vnoise(x * 2.1, y * 2.1, seed + 7) + 0.25 * vnoise(x * 4.3, y * 4.3, seed + 13)) / 1.75;
  }
  function hx6(c) { var v = parseInt(c.slice(1), 16); return [v >> 16, (v >> 8) & 255, v & 255]; }
  function rgbS(r, g, b) {
    return 'rgb(' + Math.max(0, Math.min(255, r | 0)) + ',' + Math.max(0, Math.min(255, g | 0)) + ',' + Math.max(0, Math.min(255, b | 0)) + ')';
  }
  function rampC(cols, t) {
    t = Math.max(0, Math.min(1, t));
    var f = t * (cols.length - 1), i = Math.min(Math.floor(f), cols.length - 2), u = f - i;
    var A = hx6(cols[i]), B = hx6(cols[i + 1]);
    return [A[0] + (B[0] - A[0]) * u, A[1] + (B[1] - A[1]) * u, A[2] + (B[2] - A[2]) * u];
  }
  function jigC(rgb, rng, amt) {   // the shimmer + a taste of the manifold fleck
    if (rng() < 0.06) {
      var m = (rgb[0] + rgb[1] + rgb[2]) / 3;
      var FL = [[138, 18, 192], [47, 92, 240], [26, 166, 216], [31, 196, 106], [244, 200, 30], [255, 138, 20]];
      var f = FL[(rng() * FL.length) | 0], fm = (f[0] + f[1] + f[2]) / 3, k = m / Math.max(1, fm);
      return rgbS(f[0] * k, f[1] * k, f[2] * k);
    }
    var dr = (rng() * 2 - 1) * amt * 1.35, dg = (rng() * 2 - 1) * amt * 0.9, db = (rng() * 2 - 1) * amt * 1.35;
    return rgbS(rgb[0] + dr, rgb[1] + dg, rgb[2] + db);
  }
  /* ================= THE SPRITE FACTORY (compositor architecture) =================
     scene.js renders every actor/object ONCE through these and animates the
     results with CSS. When <html data-scene> is set, the old per-frame stage
     below never starts — this file becomes a pure drawing library. */

  /* ---------- EPISODE THREE — The Smallest Brother (plate coords) ---------- */
  var CAST3 = {
    0:  { fx0: 76,  actors: [ { t: 'p', x: 232, y: 356, h: 34, facing: 1, staff: 1, armR: [244, 342], eye: [1, -0.4], mood: 'open' } ] },
    1:  { fx0: 364, actors: [] },
    2:  { fx0: 244, actors: [] },
    3:  { fx0: 204, actors: [ { t: 'p', x: 360, y: 396, h: 44, facing: 1, eye: [1, -0.6], mood: 'joy' } ] },
    4:  { fx0: 286, actors: [ { t: 'p', x: 442, y: 374, h: 44, facing: 1, staff: 1, armR: [456, 332], eye: [1, 0.2], mood: 'wary' } ] },
    5:  { fx0: 230, actors: [ { t: 'p', x: 386, y: 356, h: 40, facing: 1, staff: 1, armR: [398, 322], stride: 0.5, lift: 0.35, eye: [1, 0.2], mood: 'open' } ] },
    6:  { fx0: 244, actors: [ { t: 'p', x: 400, y: 346, h: 46, facing: 1, eye: [0, -1], mood: 'wonder' } ] },
    7:  { fx0: 314, actors: [ { t: 'p', x: 470, y: 350, h: 44, facing: 1, stride: 0.4, lift: 0.3, eye: [1, 0], mood: 'open' } ] },
    8:  { fx0: 244, actors: [ { t: 'p', x: 306, y: 374, h: 38, facing: 1, lean: 6, eye: [1, 1], mood: 'wonder' } ] },
    9:  { fx0: 454, actors: [ { t: 'p', x: 610, y: 434, h: 46, facing: -1, eye: [-1, -1], mood: 'open' } ] },
    10: { fx0: 244, actors: [ { t: 'p', x: 540, y: 422, h: 26, facing: -1, eye: [-1, -0.6], mood: 'open' } ] },
    11: { fx0: 250, actors: [ { t: 'p', x: 330, y: 368, h: 46, facing: 1, stride: 1, lift: 0.9, wind: -1, eye: [1, -0.2], mood: 'open' } ] },
    12: { fx0: 488, actors: [ { t: 'p', x: 664, y: 424, h: 42, facing: -1, eye: [-1, 0.4], mood: 'wonder' } ] },
    13: { fx0: 244, actors: [ { t: 'p', x: 400, y: 468, h: 48, facing: 1, staff: 1, armR: [414, 430], eye: [0, -1], mood: 'joy' } ] },
    14: { fx0: 364, actors: [ { t: 'p', x: 520, y: 316, h: 28, facing: 1, staff: 1, armR: [529, 292], eye: [1, 0], mood: 'open' } ] },
  };
  var SCENE3 = {
    0:  { sheep: [ { x: 204, y: 344, s: 0.6, facing: -1, phase: 0.4 }, { x: 186, y: 352, s: 0.5, facing: 1, phase: 2.1 }, { x: 214, y: 356, s: 0.45, facing: -1, phase: 3.4 } ] },
    3:  { sheep: [ { x: 150, y: 380, s: 1.1, facing: 1, phase: 0.2 }, { x: 230, y: 352, s: 0.85, facing: -1, phase: 1.4 }, { x: 320, y: 400, s: 1.0, facing: 1, phase: 2.6 }, { x: 470, y: 372, s: 0.9, facing: -1, phase: 3.8 }, { x: 560, y: 420, s: 1.05, facing: 1, phase: 0.9 }, { x: 660, y: 396, s: 0.75, facing: -1, phase: 4.6 } ],
          birds: [ { x: 320, y: 90, s: 0.8, col: '#3a5a8a', phase: 0.5, v: 0.09, range: 140 }, { x: 460, y: 120, s: 0.65, col: '#3a5a8a', phase: 2.4, v: 0.11, range: 110 }, { x: 560, y: 80, s: 0.7, col: '#3a5a8a', phase: 4.2, v: 0.08, range: 120 } ] },
    4:  { sheep: [ { x: 250, y: 430, s: 1.15, facing: 1, phase: 0.3 }, { x: 290, y: 446, s: 1.0, facing: -1, phase: 1.6 }, { x: 222, y: 452, s: 0.9, facing: 1, phase: 2.9 }, { x: 268, y: 468, s: 1.05, facing: -1, phase: 4.1 }, { x: 310, y: 424, s: 0.8, facing: 1, phase: 5.2 } ] },
    5:  { birds: [ { x: 430, y: 100, s: 0.75, col: '#3a5a8a', phase: 0.8, v: 0.09, range: 130 }, { x: 560, y: 130, s: 0.6, col: '#3a5a8a', phase: 2.8, v: 0.11, range: 100 }, { x: 300, y: 140, s: 0.7, col: '#3a5a8a', phase: 4.6, v: 0.08, range: 120 } ] },
    8:  { water: [ { x: 400, y: 360, w: 680, h: 70, n: 16, phase: 0 } ] },
    13: { birds: [ { x: 280, y: 110, s: 0.8, col: '#8a6428', phase: 0.4, v: 0.1, range: 130 }, { x: 420, y: 80, s: 0.65, col: '#8a6428', phase: 1.9, v: 0.12, range: 110 }, { x: 520, y: 140, s: 0.75, col: '#8a6428', phase: 3.3, v: 0.09, range: 120 }, { x: 360, y: 160, s: 0.6, col: '#8a6428', phase: 4.8, v: 0.13, range: 90 } ] },
    14: { sheep: [ { x: 488, y: 312, s: 0.55, facing: 1, phase: 0.7 }, { x: 468, y: 306, s: 0.48, facing: 1, phase: 2.2 }, { x: 504, y: 318, s: 0.5, facing: 1, phase: 3.6 } ] },
  };

  /* ---------- EPISODE FOUR — The Hidden Name (plate coords) ----------
     Star: the queen with the hidden name — her own midnight-periwinkle cloak,
     the bright protagonist mask. Her uncle: warm brown folk. The Weaver: cold
     grey-violet folk. The Glass King stays painted in the plates. */
  var STARC = ['#8a92cc', '#575fa6', '#363c74'];
  var UNCLEC = ['#8a6a4a', '#6a4a30', '#40301e'];
  var WEAVERC = ['#5a5470', '#3e3854', '#282438'];
  var SACKC = ['#7a6a54', '#5a4c3c', '#3a3128'];
  var CAST4 = {
    0:  { fx0: 180, actors: [ { t: 'p', x: 262, y: 486, h: 40, facing: 1, eye: [0.6, -0.8], mood: 'wonder', cols: STARC } ] },
    1:  { fx0: 244, actors: [] },
    2:  { fx0: 144, actors: [ { t: 'p', x: 348, y: 470, h: 42, facing: 1, eye: [1, -0.2], mood: 'joy', cols: STARC, stride: 0.4, lift: 0.3 },
                              { t: 'p', x: 540, y: 468, h: 56, facing: -1, eye: [-1, 0.2], mood: 'open', cols: UNCLEC, maskCols: FOLKMASK, folk: 1 } ] },
    3:  { fx0: 244, actors: [ { t: 'p', x: 400, y: 500, h: 44, facing: 1, eye: [0, -1], mood: 'wonder', cols: STARC } ] },
    4:  { fx0: 244, actors: [ { t: 'p', x: 348, y: 478, h: 56, facing: 1, eye: [1, 0], mood: 'open', cols: UNCLEC, maskCols: FOLKMASK, folk: 1 },
                              { t: 'p', x: 474, y: 482, h: 60, facing: -1, eye: [-1, 0.2], mood: 'wary', cols: WEAVERC, maskCols: FOLKMASK, folk: 1, stride: 0.4, lift: 0.3, wind: 0.5 } ] },
    5:  { fx0: 364, actors: [ { t: 'p', x: 430, y: 470, h: 58, facing: 1, eye: [1, -0.3], mood: 'wary', cols: WEAVERC, maskCols: FOLKMASK, folk: 1, lean: 4 } ] },
    6:  { fx0: 244, actors: [] },
    7:  { fx0: 204, actors: [ { t: 'p', x: 360, y: 482, h: 56, facing: 1, eye: [0, 1], mood: 'wary', cols: SACKC, maskCols: FOLKMASK, folk: 1, lean: 6 } ] },
    8:  { fx0: 324, actors: [ { t: 'p', x: 520, y: 472, h: 46, facing: 1, eye: [1, -1], mood: 'wonder', cols: STARC, wind: -0.5 } ] },
    9:  { fx0: 264, actors: [ { t: 'p', x: 462, y: 470, h: 46, facing: 1, eye: [1, -0.6], mood: 'open', cols: STARC } ] },
    10: { fx0: 444, actors: [ { t: 'p', x: 668, y: 478, h: 40, facing: -1, eye: [-1, -0.2], mood: 'open', cols: STARC } ] },
    11: { fx0: 244, actors: [ { t: 'p', x: 460, y: 476, h: 48, facing: -1, eye: [-1, -0.2], mood: 'open', cols: STARC },
                              { t: 'p', x: 540, y: 478, h: 54, facing: -1, eye: [-1, 0.6], mood: 'wary', cols: WEAVERC, maskCols: FOLKMASK, folk: 1, lean: -5 } ] },
    12: { fx0: 274, actors: [] },
    13: { fx0: 244, actors: [ { t: 'p', x: 350, y: 486, h: 46, facing: 1, eye: [1, -0.6], mood: 'joy', cols: STARC, stride: 0.6, lift: 0.5 },
                              { t: 'p', x: 430, y: 490, h: 56, facing: -1, eye: [-1, -0.4], mood: 'joy', cols: UNCLEC, maskCols: FOLKMASK, folk: 1, stride: 0.4, lift: 0.3 },
                              { t: 'p', x: 528, y: 482, h: 50, facing: -1, eye: [-1, -0.6], mood: 'joy', cols: ['#4a7a72', '#33584f', '#1e3830'], maskCols: FOLKMASK, folk: 1, stride: 0.5, lift: 0.4 } ] },
    14: { fx0: 244, actors: [ { t: 'p', x: 372, y: 470, h: 44, facing: 1, eye: [1, -0.6], mood: 'wonder', cols: STARC } ] },
  };
  var SCENE4 = {
    2:  { birds: [ { x: 380, y: 110, s: 0.7, col: '#6a4a5e', phase: 0.6, v: 0.09, range: 120 }, { x: 250, y: 140, s: 0.6, col: '#6a4a5e', phase: 2.5, v: 0.11, range: 100 } ] },
    13: { birds: [ { x: 300, y: 100, s: 0.8, col: '#8a6428', phase: 0.4, v: 0.1, range: 130 }, { x: 430, y: 70, s: 0.65, col: '#8a6428', phase: 1.9, v: 0.12, range: 110 }, { x: 540, y: 130, s: 0.75, col: '#8a6428', phase: 3.3, v: 0.09, range: 120 } ] },
  };

  var __EP1 = document.documentElement.getAttribute('data-ep') === '1';
  var CAST1 = {
    0: { fx0: 244, actors: [] },
    1: { fx0: 130, actors: [] },
    2: { fx0: 244, actors: [] },
    3: { fx0: 244, actors: [
      { t:'p', x:470, y:392, h:116, facing:-1, eye:[-1,-1], mood:'wonder', armL:[424,258], armR:[494,348] }
    ] },
    4: { fx0: 152, actors: [
      // ⚠ HIM ALONE. Fred: "on what was he like, the friend should not be there, just
      // the protagonist." This page is the Light's own character — "everything He made,
      // He made for you" — and it is addressed to ONE reader. A second child standing
      // beside him makes it a scene about company instead of about Him.
      { t:'p', x:318, y:416, h:58, facing:1, eye:[1,0.2], mood:'joy', cell:'kneel-calm' }   // Sep 12 (perspective pass): 44 -> 58 — the rabbit beside him was nearly his size
    ] },
    5: { fx0: 244, actors: [
      // ⚠ HIS BACK, AND HE IS WALKING. Fred: "how do i show the reader that the main
      // character is walking towards the dark?" He used to stand here facing across the
      // frame with his eyes showing — which reads as posing at a threshold, not going.
      // Turned away (back:1) the reader stands at his shoulder and goes with him, which
      // is what a second-person page needs; `walk` gives him the step cycle, so the one
      // moving thing on the page is the thing the page is about. The shiver is gone: a
      // tremble and a stride at once is a man wobbling, not a man leaving.
      // ⚠ HE HAS TO READ AS GOING. Fred: "the one walking right could be the invert image
      // of the one that is walking left you know if you are creative." Exactly — the back
      // view Grok drew has no stride, so on the one page that says "you WALKED into the
      // dark" he stood still. The side cell is drawn walking left; mirrored it walks right,
      // which is where the dark is on this plate. His face goes with him, away from the
      // light at the bottom left — which is also what the line above him says.
      { t:'p', x:392, y:318, h:74, facing:1, eye:[1,0.5], mood:'open', stride:0.9, lift:0.6, wind:-0.7, walk:1 }
    ] },
    6: { fx0: 144, actors: [
      // Sep 12, Fred (the perspective pass): "why not make the person bigger or the flame smaller?" — the bonfire stood 3× his height. Both moved: he is 100, the fire is smaller (scene.js CRITTERS 6).
      { t:'p', x:428, y:470, h:100, facing:-1, eye:[-1,-0.2], mood:'wary', kneel:1 }   // h 44 -> 66 -> 100: he was too small to read as the protagonist (Fred). Every other page runs him 120-168; crouching behind the cypress he can be smaller, but not invisible.
    ] },
    7: { fx0: 244, actors: [] },
      // ⚠ EMPTY ON PURPOSE. `lost` has no standing figure any more — he WALKS, round a
      // ring on the ground, and that rig lives in WALK[7] (engine/scene.js) because it is
      // a moving thing, not a placed one. A CAST actor here as well would be a second
      // child standing still in the same field, which is exactly the bug it looks like.
    8: { fx0: 64, actors: [
      // ⚠ buffet: this child is ADRIFT ON THE END OF A STRING IN A STORM. The whip lives
      // in the painted fg plane and cannot reach a runtime sprite, so it is thrown here.
      { t:'p', x:340, y:152, h:46, facing:1, eye:[0.4,-1], mood:'dizzy', stride:0.4, lift:0.8, wind:1,
        // TETHERED to the fg plane's whip: the numbers below ARE the string's
        // displacement where he hangs, so he is carried rather than flapping beside it.
        // spin: seconds for one full turn. He is tied on by the BACK, so `knot` is the
        // transform-origin — left of centre because he faces right — and the head
        // sweeps a whole circle around it.
        // ⚠ THE AXIS IS HIS MID-BACK, NOT HIS SHOULDERS, and the reason is geometry:
        // whatever point a body turns about, the parts NEAREST it barely travel. The
        // plate ties the painted string at his shoulders (TIE = [336,118]) and spinning
        // there left his head only 12px off the axis — it pivoted almost in place while
        // his legs flew, which reads as a wobble, not a tumble. Fred: "the head is not
        // turning 360 anymore. i want the protagonist to go round and round on the same
        // spot." Moving the axis down to the small of his back puts head and feet at
        // ~23px either side of it, so BOTH sweep real circles and the whole body goes
        // round on the spot — a body hanging in a harness, which is the picture.
        // one axis, one rotation, no travel — see the tether block in engine/scene.js
        // ⚠ CALIBRATED, NOT DERIVED. Fred: "what would happen if we make the person spin
        // but also move following the end point of the string. can you do that?" — which
        // is the right way round: the cord's tip is fixed (amp 0), so HE goes to IT. The
        // arithmetic for the axis kept landing ~44 units right of where he actually turns,
        // and `place()`, the CSS and the canvas sizing all check out, so the offset is
        // measured rather than reasoned: with tie 336 the axis rendered at 380. The cord's
        // tip sits at plate (350,109), so he is placed with his mid-back there and the tie
        // is set 44 back from it. Verified across six frames of the spin, not by eye.
        tether: { plane: 'fg', spin: 2.4, amp: 4, period: 1.02, tie: [336, 130] }, armL:[319,119.8], armR:[363,117.04] }
    ] },
    9: { fx0: 244, actors: [
      // ⚠ NO RADIANT FIGURE HERE ANY MORE. Fred: "eh why do we have this character?" —
      // because I put one there, and it was the wrong instinct: a crowned figure standing
      // on the plain makes the Light a member of the cast, something the child can be
      // measured against. On this page the Light is what happens to the SKY. So the only
      // figure is the child, standing directly under the break in the storm, in the pool
      // the shaft lands in (plate CX,CY in looking.mjs — keep the two in step), looking up.
      // Sep 12, Fred: "i dont really like that looking and road have the same sprite for the kid"
      // — both fell to the default frontal cell. Here he is FOUND: arms up, face lifted into
      // the shaft that came down for him (Luke 19:10).
      { t:'p', x:400, y:322, h:34, facing:1, eye:[0,-1], mood:'wonder', cell:'look-up-wide' }   // ⚠ MUST equal CY in gen/plates/looking.mjs — he stands on the beam's axis
    ] },
    10: { fx0: 274, actors: [
      // Sep 12: his BACK to us, walking the road toward the valley's edge and the far light
      // — the way a page shows someone GOING somewhere (road + back), not a face turned to us.
      { t:'p', x:380, y:361, h:46, facing:1, eye:[1,-0.4], mood:'wonder', cell:'walk-away' }   // Sep 12 (perspective pass): 33 -> 46 — at 33 the near fruit-trees stood twice his height and the subject vanished
    ] },
    11: { fx0: 254, actors: [
      { t:'p', x:348, y:300, h:48, facing:1, eye:[1,-0.3], mood:'open', stride:0.8, lift:0.5, wind:-0.3, armR:[366,262.72] }
    ] },
    12: { fx0: 244, actors: [
      { t:'p', x:432, y:342, h:36, facing:-1, eye:[0,0.6], mood:'teary', kneel:1 }
    ] },
    // ⚠ THE PROTAGONIST WAS MISSING FROM BOTH. Fred: "where is the protagonist?" — and he
    // was nowhere, because I rebuilt these two plates as landscapes and never put him back
    // in the cast. This book is second person: YOU are in it. A tomb with nobody watching is
    // a photograph of a rock; the child standing there is what makes it his grief, and then
    // his morning. He stands small on both pages — the smallness IS the feeling — on the
    // same spot, so turning the page moves the light and the stone, not him.
    // ⚠ AND HE HAS TO BE INSIDE THE PHONE'S WINDOW. First placement put him at x=300, which
    // is off-screen on mobile (a diorama page shows only ~plate 345..455) — the protagonist,
    // invisible to most readers. The tomb fills that whole window, so he stands IN FRONT of
    // it, small, at its foot: which is the truer picture anyway.
    13: { fx0: 244, actors: [
      { t: 'p', x: 366, y: 420, h: 38, facing: 1, eye: [1, -1], mood: 'teary' }   // shut out, looking up at the stone
    ] },
    14: { fx0: 236, actors: [
      { t: 'p', x: 366, y: 420, h: 38, facing: 1, eye: [1, -1], mood: 'joy', armR: [382, 388] },  // the same spot — and it is open
      /* ⭐⭐ THE ONE WHO SPEAKS THIS PAGE'S VERSE WAS NOT ON THE PAGE (Sep 21, verse inventory). The
         words under the picture — "He is not here: for he is risen" — are an ANGEL'S (Matt 28:5-6),
         and the same passage says where he was: "the angel of the Lord descended from heaven, and
         came and rolled back the stone from the door, and SAT UPON IT. His countenance was like
         lightning, and his raiment white as snow" (28:2-3). The stone lay rolled clear with nobody
         on it. He is on it now — the same white angel who keeps the gate on twoways, so the cast
         stays one cast — small, facing the child he is speaking to, and lit from within.
         Plate geometry: the stone is centred (596,326), 67×76, so its crown is at y≈250. */
      // ⚠ y is 36 BELOW the stone's crown: a winged figure has no boots, so its robe hem rides ~0.78h above
      // its ground line (measured off the render — at y:258 he hovered over the hilltop). `perch` stops the hover bob.
      { t:'p', x:596, y:294, h:46, facing:-1, wings:1, perch:1, eye:[-0.7,0.35], mood:'joy', aura:16,
        cols:["#fffdf2","#f2e6c2","#cdb98c"], maskCols:["#fffef8","#f6efdc","#d8cbaa"] }
    ] },
    15: { fx0: 148, actors: [
      { t:'p', x:177, y:464, h:54, facing:1, eye:[1,-0.6], mood:'joy', stride:0.7, lift:0.5, wind:-0.3, armR:[192, 424] }   // ⚠ 'weary' -> 'joy': he could not walk the last step, but he can SEE Him coming
    ] },
    // THE WAY HOME STOOD OPEN — the page was empty, and an open gate with nobody
    // going through it is not the kingdom. Scripture says who fills it:
    //   Rev 21:24  "the nations of them which are saved shall walk in the light of it"
    //   Rev 7:9    "a great multitude... of all nations, and kindreds, and people"
    // So: a procession up the road, each a different people, sized by how far along
    // it they are — and YOU nearest, hands open, because the page is about a gift you
    // only receive (Eph 2:8). Isa 11:6's beasts at peace ride in CRITTERS (scene.js).
    // THE WAY HOME STOOD OPEN — Fred: this is the view FROM the child's own eyes,
    // riding on the Light's shoulders for the last steps. So there is no child in
    // frame: you ARE the camera. And a crowd of people was the wrong reading — what
    // stands at these gates is named:
    //   Rev 21:12  "and at the gates twelve angels"
    // Two of them flank the open way, small with distance, shining because they are
    // made of light. The rest of the life here is doves and flowers (Song 2:12), in
    // CRITTERS below.
    16: { fx0: 244, actors: [
      // Fred: cupids with wings, not the tall radiant figure. So they are the little
      // pilgrim WITH WINGS — a cherub — in white and gold, keeping the book's one
      // character design. Rev 21:12, "and at the gates twelve angels".
      { t:'p', x:338, y:232, h:30, facing:1, wings:1, tilt:33, harp:1, eye:[0.4,-0.3], mood:'joy',
        cols:["#fffdf2","#f2e6c2","#cdb98c"], maskCols:["#fffef8","#f6efdc","#d8cbaa"] },
      { t:'p', x:462, y:232, h:30, facing:-1, wings:1, tilt:-33, trumpet:1, eye:[-0.4,-0.3], mood:'joy',
        cols:["#fffdf2","#f2e6c2","#cdb98c"], maskCols:["#fffef8","#f6efdc","#d8cbaa"] }
    ] },
    17: { fx0: 245, actors: [
      // angels keeping the great gate he is carried through (Rev 21:12), with harps
      // (Rev 14:2). Small and high, so they never compete with the Father and child.
      { t:'p', x:322, y:196, h:24, facing:1, wings:1, tilt:33, harp:1, eye:[0.4,-0.2], mood:'joy', cols:["#fffdf2","#f2e6c2","#cdb98c"], maskCols:["#fffef8","#f6efdc","#d8cbaa"] },
      { t:'p', x:480, y:196, h:24, facing:-1, wings:1, tilt:-33, trumpet:1, eye:[-0.4,-0.2], mood:'joy', cols:["#fffdf2","#f2e6c2","#cdb98c"], maskCols:["#fffef8","#f6efdc","#d8cbaa"] },
      // ⚠ TRIED MAKING HIM A RUNTIME ACTOR TOO, REVERTED. Fred asked for the Father as a
      // `t:'r'` actor (the capsule-limb "Light" rig used elsewhere) so front/back could be
      // ordered like any other multi-actor page — but the rig itself was wrong for him
      // here: "eh? revert. i dont want this lady figure no more. the father is a stickman
      // made of light." That's gen/characters.mjs's own paintTheLight/CAST.light — no
      // robe, on purpose (Fred + 1 John 1:5 / John 1:14) — and the baked painter draws
      // that; the `t:'r'` runtime rig draws something else. Back to E.paintCarried baking
      // both figures into the plate (gen/plates/twoways.mjs). If the Father becomes a
      // runtime actor again later, it needs the STICKMAN rig, not this one.
      // ⚠ HE RIDES ON THE FATHER'S BACK, SEEN FROM BEHIND. Placed above the head he simply
      // FLOATED there — Fred sent a screenshot with the gap circled: "you can make the kid
      // facing the other way and put it on the back of the light character… make sure things
      // make sense before you tell me things are done." So: the BACK view (we see his hood,
      // because he is facing the way the Father is walking), his weight sitting on the
      // shoulder line rather than hovering over the crown, and no ground shadow — his feet
      // are not on the ground. The Father's shoulders are at y≈327 (h 128 from y 423.3).
      // ⚠ THIS IS A SHOULDER RIDE, AND IT HAS TO OBEY A BODY. Fred: "this is totally weird.
      // this is not how you piggy back someone." He was perched on top of the head like a
      // hat, because I placed him by eye instead of from the Father's own anatomy.
      // The Father: feet y=423.3, height 128 → his head top is 295 and his shoulders 327.
      // A child riding those shoulders SITS on them: his seat is at the shoulder line, his
      // legs hang down either side of the head, and his own head rises clear above it. So
      // his sprite's foot line lands just below the Father's head top — the paws read as the
      // feet dangling at the Father's ears — and he is centred on the Father, not offset.
      // The Father now has a body: head 295–328, robe shoulders at 329, feet 423. A child on
      // his back sits BESIDE his head, not on top of it — his own head clear of the Father's,
      // his weight on the shoulder line. Offset right so both heads read.
      // ⚠ HEADS LEVEL, LEANING, HOLDING ON. Fred: "put the kid a bit more down so that their
      // head levels are the same, tilt it a bit, make the kid's hand hugging the father's
      // neck." The Father's head runs 295–328 and his neck sits at about 330, so the child
      // drops until his own head shares that band, leans into him, and reaches round.
      // ⚠ PLACED BY EYE, NOT BY THE PLATE'S NUMBERS. The Father is painted into the fg plane
      // and the actors ride a layer with its own parallax offset, so his plate coordinates do
      // not line up with an actor's — measuring him told me nothing usable. Judged against
      // the render instead: heads level, leaning in, arms round his neck.
      // ⚠ MEASURE THE CARRIER BEFORE SIZING THE CHILD. Fred: "imagine the light as a
      // tall adult and the child as a child. use that proportion." Measured off the
      // render: the Light stands 121 actor units (head top y=297, feet y=418). A child
      // is a little over half an adult, so 68 — at 46 he was a doll on a giant's back.
      // Head top lands level with the Light's, which is where a carried child's head is.
      // Centred on the carrier — Fred: "when you get piggy backed, you should be in the
      // middle because or else you cannot be carried." The Light is painted at plate
      // x=342.5, y=423.3, h=128 (twoways.mjs), and actors share that space, so: x=343,
      // head top level with his at y-h=295, and 72 = 0.56 of 128, a child against an adult.
      // ⚠ NO OVERLAY AT ALL, ANY MORE. Three tries at drawing extra hands/arms/a masking
      // shape over him each read as its own kind of wrong — two floating paws, then one
      // stray arm, then a golden ellipse either swallowing the frame or floating loose
      // beside him. Every version was ME adding something. His own "carried" pose —
      // hood turned away, arms open, tilted against the Father's back — was never the
      // problem; it read fine before anything got drawn on top of it. Trust the art.
      // ⚠ CHANGED AGAIN — Fred: "make the kid in front of the father, getting lifted, so
      // half of the kid's body is in front of the father." Off the shoulder-ride, down
      // toward the Father's chest — that move was right.
      // ⚠ BUT FRONT-FACING WAS WRONG. Fred: "eh wrong, should be the back of the kid, and
      // the kid is in front of the father" — he is carried facing the SAME way the Father
      // faces (both looking ahead, into the scene), so the reader still sees his BACK, the
      // way "carried" always showed him; what changed is WHERE: in front of the Father's
      // body now (held against his chest, lifted), not up on his shoulder. Back to the
      // `carried` cell, `back:true`, at the lower/frontal position.
      // ⚠ RAISED AGAIN — Fred sent a reference photo of a parent hoisting a child up
      // overhead, arms flung wide: "i want to make the father carry the child like
      // this." Not held at chest height any more — up above the Father's own head
      // (his head-top sits at y≈295, per the measurements above), riding high the way
      // Luke 15:5 itself says ("he layeth it on his shoulders"), with the Father's own
      // hands raised to meet him (see the matching `hands` override in twoways.mjs).
      // ⚠ AND FINALLY MEASURED, WHICH SHOULD HAVE COME FIRST. Every note above places him
      // "by eye, against the render" — and every one of them put him ON THE FATHER'S FACE.
      // Read off the live page (canvas alpha → plate coords, via the fg layer's own rect,
      // so the parallax offset the notes above gave up on cancels out):
      //     child silhouette   x 320–383,  y 243–319   (h:75 is true — the canvas is padded)
      //     the Light's head   x 326–361,  y 288–337
      // He was overlapping the Father's head by 31 units. That is the whole reason the pair
      // never read as a carry, and the reason three separate overlay props got built and
      // binned trying to paper over it.
      // ⚠ THE ANCHOR: y is the FEET (silhouette bottom ≈ y - 1.3), x is the centre, and h is
      // the true figure height (h:75 measured 75.4 on screen — the canvas around him is
      // padded, the figure is not).
      // ⚠ HELD AGAINST THE CHEST, NOT OVER THE HEAD. Overhead was tried and measured and
      // failed for a structural reason (this cast's head is wider than its shoulders, so
      // raised arms merge with the skull — see twoways.mjs). This is the carry Fred asked
      // for in his own words: "make the kid in front of the father, so that the back of
      // the kid is covered by the body of the father."
      // ⚠ AND THE CELL ITSELF WAS THE PROBLEM ALL ALONG. `carried` is a drawing of a child
      // STANDING — back view, feet planted, arms out to the sides. Four different carries
      // were built around it (piggyback, shoulder-ride, overhead lift, chest hug) and every
      // one read as a boy standing in front of a gold blob, because that is what the
      // drawing IS. No arrangement of a second figure can make a standing child look
      // carried. Two overlay props were built and binned trying.
      // `sleeping` is a child curled asleep on his side — laid across the Father's chest it
      // reads as "carried" instantly, and it is what the page MEANS: Luke 15:5's lamb is
      // carried because it cannot walk, and the prose says "the LAST of the way".
      //   h 40           — the cell is 532×313, so h 40 draws him 68 wide
      //   y 377          — his body lies y 336–376, across the Father's chest
      //   x 342          — centred on the carrier; head to our left, feet to our right
      // Drawn after the plate, so he lies IN FRONT of the Father's body with the Father
      // behind and his two hands cupped under each end — which is what Fred asked for at
      // the very start: "the back of the kid covered by the body of the father."
      // ⚠ AND FRED DREW A BETTER ONE. img_9500 → cast/kid-lifted.webp: the same back view,
      // but the arms curl DOWN and IN rather than planted straight out — a child being
      // HELD, not a child standing. That was the flaw in `carried` all along, and no
      // amount of geometry around a standing drawing could hide it.
      // ⚠ ON HIS BACK. Fred: "if we use this sprite, we can just put the kid on the back
      // of the light figure right" — and that is the answer the whole page was missing.
      // We see the Light from BEHIND, so a child riding his back is in front of him from
      // here, which is the z-order a runtime sprite already has. No prop, no cutout, no
      // stretched arms: measured off this cell, his hands reach the child's thighs at 30
      // units, inside the rig's own 32-unit reach.
      // ⚠ CENTRED. Fred: "with this pose you can put the kid center to the father." He is
      // right — a piggyback sits on the middle of a back, and riding him off to one side
      // read as sliding off. Offsetting him was my workaround for keeping the Light's head
      // visible; the real answer is VERTICAL, not sideways.
      //   h 75   — cell 519×700, so he draws 56 wide, riding y 300–375
      //   x 342  — dead on the carrier's centre line
      //   y 376  — his hood top lands at 304, and the Light's head runs 288–335, so the
      //            CROWN of his head (288–304) stands clear above the blue hood. That is
      //            what a piggyback actually looks like from behind: the child's head in
      //            front, the carrier's showing over the top of it.
      //   arms   — the cell's widest band (48–58%) lands y 336–344, just past his
      //            shoulders at 327: arms over the shoulders and down his front.
      //   feet   — 375, just below the Light's hips (366), legs wrapped at his waist.
      { t:'p', x:342, y:376, h:75, facing:1, cell:'lifted', noShadow:1 }
    ] },
    18: { fx0: 244, actors: [
      { t:'p', x:400, y:392, h:148, facing:1, eye:[0,-1], mood:'joy', armL:[358,348], armR:[442,348], aura:13 }
    ] },
    19: { fx0: 244, actors: [
      // ⚠ RECEIVING, NOT HAILING. 16 of 43 placements were arms-raised and this page is
      // about being GIVEN something — so he kneels. h scaled 0.87: the sheets draw every
      // pose at one height, so a kneeling cell at the same h reads as a bigger child.
      // ⚠⚠ ON THIS PAGE HE IS THE LIGHT SOURCE. born says "He put His own light inside
      // you" (2 Cor 4:6, "hath shined in our HEARTS"), so gen/plates/born.mjs paints the
      // whole plate lit from his chest — shadows thrown away from him, clouds lit from
      // beneath. `heart` in that file is fixed at (400, 366) to sit in this actor's chest:
      // MOVE HIM AND THE LIGHT MUST MOVE TOO, or the page lights from empty grass.
      // aura stays small on purpose — it is a canvas gradient, i.e. an effect, and the
      // rule here is that the glow is DRAWN. The paint carries it; this only seats him in it.
      // (no noShadow flag: the cast-cell path blits the drawing anchored at the feet and
      // draws no ground shadow at all, so there is nothing here to switch off — which is
      // just as well, since a light source with a shadow would give this page away.)
      { t:'p', x:400, y:404, h:76, facing:1, eye:[0,-1], mood:'joy', cell:'glad', aura:18 }
    ] },
    20: { fx0: 174, actors: [
      // ⚠ HE WAS READING A BOOK ON A PAGE ABOUT PLANTING. The cell was 'reading' — chosen
      // for Luke 8:11, "the seed is the word of God" — but this page's own sentence is
      // "Everything you planted grew. Everything you watered came into flower," and a child
      // sitting reading does not picture that. The same fault Fred named three entries down
      // on bread: "the scene does not picture what is being said."
      // Fred drew this pose to order: kneeling, one hand pressing a single seed into the
      // row, the other cupping a few more. That contrast IS the page — one small seed going
      // in, the whole frame blazing with what came out of it (John 15:5).
      // ⚠ His planting hand sits at the lower-LEFT of the cell, so x is set to land that
      // hand on gen/plates/seeds.mjs's CHILD [330,410], where the plate paints turned earth.
      // Move one and move the other.
      { t:'p', x:346, y:418, h:76, facing:-1, eye:[-0.6,0.5], mood:'open', cell:'sowing', aura:9 }
    ] },
    21: { fx0: 399, actors: [
      // ⚠ SEATED, NOT WALKING. Fred: "the scene does not picture what is being
      // said... put the character in a picnic." Rebuilt as a real picnic (checker
      // blanket + basket + food spread, gen/plates/bread.mjs CX,CY — keep the two
      // in step); fx0 moved 264→399 so the portrait crop (264..576 → 399..711)
      // includes the whole spread including the basket, not just the blanket's
      // left edge — MUST match gen/plates/bread.mjs's `focal.x` (focal.x−156).
      // kneel-calm is scaled 0.88 of standing height (measured: kneeling cells
      // read ~0.87-0.89 against the same h, since his sheets draw one height).
      // ⚠⚠ x MUST EQUAL gen/plates/bread.mjs's CX. It had once drifted to 486 against a CX
      // of 542 — 56 units — so he sat out in open grass BESIDE the apple tree instead of
      // under it, away from the apple meant for his hands. Keep the two in step.
      // ⚠ THE APPLE IS IN THE DRAWING NOW, so the composited HELD prop in engine/scene.js
      // (which was welded to this x by measured coordinates) is gone. Fred drew him holding
      // it; his drawing beats a prop pasted over him.
      // ⚠ AND HE FACES RIGHT. `kneel-calm` had folded hands and shut eyes — he read as
      // praying, not as being fed, on a page whose first line is "Every day He feeds you."
      // `eating` is that line: the apple up in both hands, mouth open, mid-bite, delighted.
      // ⚠ y IS HIS GROUND LINE and it must equal gen/plates/bread.mjs's SEAT_Y (436 + the 4 the
      // seated cell sinks): he sits on the line the apple tree meets the field at, not above it.
      { t:'p', x:590, y:440, h:88, facing:1, eye:[0.4,-0.3], mood:'joy', cell:'eating', aura:10 }
    ] },
    22: { fx0: 288, actors: [
      { t:'p', x:447, y:285, h:36, facing:-1, eye:[-0.6,0], mood:'wary', cell:'teddy', wind:0.5, aura:8 }
    ] },
    23: { fx0: 244, actors: [
      // ⚠⚠ ONE DRAWING, NOT THREE ACTORS. This page is Ecclesiastes 4:12 — a threefold cord
      // — and a cord is a RELATIONSHIP between three bodies: hands closed on forearms,
      // weight leaning against weight. That can never be assembled from three separate
      // cells, each of which carries its own fixed arms; every attempt put them in a polite
      // row with nobody touching anybody, on a page whose whole sentence is "the rest held
      // on". Fred drew the moment itself, so the moment is one sprite.
      // ⚠ It is also LARGE. hands was a street with three-inch children standing in it —
      // a landscape on a page about people. The figures carry the page now and the street
      // is the setting behind them.
      // ⚠ h 396, NOT 268 — cast/kid-trio.webp is PADDED to a square (1043x1043, transparent
      // above, feet on the bottom edge). Measured on desktop: a cell is drawn into a box of
      // roughly h x h and anything wider is SLICED — the trio at its true 1.49 aspect lost
      // the outer two children's outer edges and everyone's feet. Padded to 1.0 it fits,
      // and h is scaled by 1043/700 so the children still stand 266 units tall.
      // ⚠ If the clip is ever fixed in the engine, un-pad the cell AND put h back to 268.
      { t:'p', x:400, y:478, h:268, facing:1, eye:[0,-0.1], mood:'wonder', cell:'trio', aura:12 }
    ] },
    24: { fx0: 300, actors: [
      // ⚠⚠ REDRAWN AS A RING. Fred: "can we rethink this page? it is an abomination hahaha."
      // It was five children in a ROW facing front, evenly spaced, each holding their own
      // food and looking at the reader — a school photograph, on a page whose verse is
      // fellowship and the breaking of bread (Acts 2:42). Nobody was doing anything WITH
      // anyone, which is the one thing the page is about.
      //   They sit in a RING round the fire now, turned toward each other, and the bread is
      // passed ACROSS it: the blue child tears and offers, the yellow child receives with
      // both hands. One child has her back to us at the near edge — a ring only reads as a
      // ring if somebody does — and the near RIGHT seat is left EMPTY. That gap is the
      // reader's place, which is the sentence: "He gave you a whole family."
      // ⚠ THESE FOUR ARE THEIR OWN CHARACTERS, not recolours of him. Fred drew them that way
      // ("i have made the friends have different characters as well"): hoods, hair, eyes and
      // skin are painted in. So NO `folk`, NO `cols`, NO `maskCols` — tinting them would
      // paint over the drawing. This page needs none of the recolour machinery.
      // ⚠ AND THE RING SITS INSIDE THE PHONE'S CROP (plate x 156-444): the offering, the
      // bread and the near child all land within it; only the receiving hands run past.
      // ⚠⚠ AND THE NEAR-CENTRE STAYS EMPTY — the first ring put the back-turned child at the
      // bottom of it and she hid the fire completely. A fire at the middle of a ring is
      // ALWAYS behind whoever sits at the near edge, so on a page whose sentence is "one
      // Light" the near-centre cannot be occupied. That gap is now doing two jobs at once:
      // it is the reader's empty seat AND the sightline to the fire, which is the same
      // thought said twice.
      // ⚠ and nobody stands in the flame's column (x 272-368, up to y 320) — see the note
      // above about burning a child.
      // The ring is an ellipse round the fire — centre (320,452), and the seats sit ON it, so
      // the four of them read as one circle rather than as two big children in front of two
      // small ones. Height follows depth: the near pair at 165, the far pair at 120.
      // ⚠ THE NEAR PAIR ARE SPACED TO LEAVE THE FIRE'S SIGHTLINE. Red's right edge lands at
      // ~272 and yellow's left at ~368; the flame is 80 wide on 320, so it sits exactly in
      // the gap between them. Close them up and the fire disappears behind a shoulder, which
      // is what happened the first time.
      // ⚠ AND THE ACTION STAYS IN THE PHONE'S CROP (x 156-444): the offering child, the
      // bread, the fire and the receiving hands are all inside it; only the laughing child
      // on the far right is cut, and he is the one who can afford to be.
      // ⚠ THE FAR PAIR MUST BE OFFSET IN X, NOT STACKED ABOVE THE NEAR PAIR. Sat at the same
      // x they simply disappear behind the near shoulders — the offering child was reduced
      // to a hood and the bread vanished entirely. Far seats sit BETWEEN the near ones.
      // ⚠ AND EVERY FACE STAYS ABOVE THE FLAME TIP (y 326). On the far side of a real fire
      // your lap is behind the flames and your face is above them — that is fine and true.
      // What is never allowed is a face inside the fire (see the note above).
      { t:'p', x:250, y:388, h:104, facing:1,  eye:[0.7,0.15],  mood:'joy',  cell:'sit-offer', aura:11 },
      { t:'p', x:396, y:388, h:100, facing:1,  eye:[-0.4,0.15], mood:'joy',  cell:'sit-laugh', aura:8 },
      { t:'p', x:170, y:505, h:168, facing:1,  eye:[0,0],       mood:'calm', cell:'sit-back',  aura:8 },
      { t:'p', x:452, y:505, h:168, facing:-1, eye:[-0.7,0.1],  mood:'joy',  cell:'sit-take',  aura:9 }
    ] },
    25: { fx0: 276, actors: [
      // ⚠ shiver: the dark came close. Everything else on this page holds its breath; only the
      // shadow betrays it. This is why a still page can still be alive.
      { t:'p', x:428, y:390, h:84, facing:1, eye:[0,0], mood:'joy', cell:'kneel-calm', aura:11 , shiver: 1 }
    ] },
    26: { fx0: 244, actors: [] },
    27: { fx0: 244, actors: [] },
    28: { fx0: 204, actors: [
      /* ⚠ THEY WERE SPECKS ON THEIR OWN PAGE. At h 64 and 68 the two travellers stood a
         seventh of the frame high — against h 168 and 141 on `candle` next door — on a page
         whose sentence is "Take a friend's hand." A page about two people cannot have the two
         people as detail. Half again as tall and shifted right along the road, clear of the
         poem: the joined hands are now something a child can actually see. */
      /* ⚠⚠ DRAWN CELLS NOW, NOT BUILT FIGURES. The two travellers were assembled from the
         engine's own limbs so their joined hands had to be aimed by absolute armL/armR
         coordinates — fiddly, and it never quite read as one hand IN another. Fred drew the
         gesture itself: `taken-hand` throws an arm out, `lead-hand` walks on and reaches back.
         Placed so the two reaches meet, the hold is the drawing's, not the rig's.
         ⚠ The led one is BEHIND and lower on the road (still in the cold); the guide is ahead
         and higher, already in the gold. That is the page's sentence in one arrangement. */
      /* ⚠ AND THE TWO REACHES HAVE TO ARRIVE AT THE SAME PLACE. First placement had them
         90 apart in x but only 26 in y, so along a road running up to the right the hands
         passed each other — one high, one low, 25 units of daylight between. Spaced along the
         road's own slope (the led one further back AND further down the frame) the two hands
         meet. */
      /* ⚠⚠ THE HANDS ARE SOLVED, NOT EYEBALLED. Fred: "the kid are not holding hands" — and I
         had been nudging x and y by eye across three rounds. The reaching hand is at a FIXED
         point inside each drawing (measured off the alpha: `taken-hand` 0.994w/0.256h,
         `lead-hand` 0.997w/0.690h), so where it lands on the plate is arithmetic:
             hand.x = actor.x + (px − cellW/2)·(h/cellH)      [px mirrored when the cell flips]
             hand.y = actor.y − (cellH − py)·(h/cellH)
         Set both to the same point and they hold. The leader is drawn second, so his mitten
         closes over hers — which is what taking a hand looks like. */
      { t:'p', x:258, y:493, h:122, facing:1, cell:'taken-hand', eye:[1,-0.2], mood:'wonder' },
      { t:'p', x:339, y:441, h:118, facing:1, cell:'lead-hand',  eye:[1,-0.3], mood:'joy', aura:11 }
    ] },
    29: { fx0: 248, actors: [
      /* ⚠⚠ THE FLAME IS IN THE DRAWING NOW. This page says "His light is in you now, so carry
         it into the dark" — and there was no visible light being carried: an `offer` cell with
         an empty hand, and a kneeling figure built from the engine's limbs. Fred drew the
         gesture itself. `light-give` holds a real candle in both cupped hands, lit from below;
         `light-take` reaches with both hands open and empty. The page's sentence is now the
         thing you actually see. */
      { t:'p', x:322, y:462, h:180, facing:1,  cell:'light-give', eye:[1,-0.15],  mood:'joy',    aura:15 },
      { t:'p', x:452, y:468, h:166, facing:-1, cell:'light-take', eye:[-1,-0.15], mood:'wonder' }
    ] },
    30: { fx0: 404, actors: [
      /* ⚠⚠ NOBODY IS FLYING. Fred: "why are people flying?" I had two figures caught up toward
         the rift — 1 Thess 4:17, and defensible on paper — but on the page they read as
         children floating for no reason, because nothing in the picture explains a body
         leaving the ground. A doctrine the drawing cannot carry is not worth the confusion:
         the verse this page actually quotes is "Behold, I come quickly", and what it needs is
         faces turned up, not bodies in the air.
         ⚠ FOUR FIGURES, and every one of them standing: the protagonist and three friends,
         which is what the page needs and all the distinct faces I have for it. */
      // ⚠ was at x136 — behind the poem, so the page showed three friends and I had staged
      // four. Set further back on the hill instead (smaller, higher), which also gives the
      // group some depth rather than a row.
      /* ⚠⚠ THESE FOUR STOOD IN A ROW. Same ground line, near enough the same height, evenly
         spaced, all facing front with their arms up — which is "equal masses and repetitive
         shapes", the thing every composition book tells you to avoid, and it is why the page
         read as actors at the footlights in front of a backdrop. Fred: "still not to my
         expectations."
           They are a GROUP MASS now, staged in DEPTH: the child whose story this is stands
         nearest and largest at the mouth of the diagonal, where the eye enters; the others
         fall away east up the wedge of field, smaller and higher in the frame as they go, so
         the four of them ARE the recession. Nothing left of x≈300 — the poem runs to x=200,
         and a near figure at this size would sit on it. */
      { t:'p', x:302, y:512, h:190, facing:1,  cell:'look-up-wide', eye:[0.35,-0.92], mood:'joy', aura:17 },
      { t:'p', x:452, y:462, h:112, facing:1,  cell:'look-up',      eye:[0.3,-0.9],   mood:'joy' },
      { t:'p', x:556, y:436, h:78,  facing:1,  cell:'taken-hand',   eye:[0.2,-0.9],   mood:'joy' },
      { t:'p', x:690, y:470, h:126, facing:-1, cell:'greet-wave',   eye:[-0.35,-0.82], mood:'joy' }
    ] },
    31: { fx0: 244, actors: [
      /* ⚠⚠ AND THIS PAGE MUST NOT LOOK LIKE THE ONE BEFORE IT. Fred: "nonight also is too
         similar to comes." Both had a row of children with their arms up under a great light,
         so the book's last two pages read as one page twice.
           The difference is not decoration, it is BODY LANGUAGE, and each page's own sentence
         gives it: `comes` is "the Light is coming back" — everyone standing, faces lifted,
         waiting. `nonight` is "home for good" — one arriving with his arms open, and the rest
         SAT DOWN in it. Nobody sits down in a page about waiting, and nobody stands to
         attention in a page about rest. Same four-and-no-more, entirely different picture. */
      /* ⚠ ORDER, LEFT TO RIGHT: yellow, red, blue — then green alone on the far bank.
         Fred: "in nonight, move the yellow kid to the left of the red kid." He could not
         be given that on the old plate: the left bank was ~95 units wide between the poem
         and the river, which is one child, not two — so the river was bowed east and
         narrowed (see nonight.mjs §3) and the near meadow opened up. Nobody may sit left
         of x≈300: the poem's verse line runs to x=253 and I have staged figures behind
         it twice already. */
      /* ⚠⚠ AND THESE FOUR WERE A ROW TOO — one ground line, four near-equal heights, evenly
         spaced across the middle. Same fault as `comes`, same cure: a GROUP MASS staged in
         DEPTH. The child whose story this is arrives nearest and largest, at the mouth of the
         meadow where the eye enters; the two he is coming to are further up the bank and
         smaller; the fourth sits alone across the water under the tree of life. Their four
         sizes ARE the distance to the City. Yellow still stands left of red, which is what
         Fred asked for — it is the depth that changed, not the order. */
      { t:'p', x:288, y:462, h:88,  facing:1,  cell:'light-take', eye:[0.5,-0.22], mood:'joy' },
      { t:'p', x:356, y:512, h:150, facing:1,  cell:'sit-back',   eye:[0.25,-0.2], mood:'joy' },
      { t:'p', x:486, y:534, h:200, facing:1,  cell:'run-open',   eye:[0.18,-0.3], mood:'joy', aura:20 },
      // ⚠ was `sit-take`, which is ALSO yellow — two of the four in the same hood. Four
      // people should be four colours: blue, red, green, yellow. Sat on the far bank under
      // the tree of life, which is where Rev 22:2 puts it — beside the water.
      { t:'p', x:636, y:486, h:104, facing:-1, cell:'sit-laugh',  eye:[-0.4,-0.2], mood:'joy' }
    ] },
    32: { fx0: 244, actors: [] },   // back cover — the galaxy (no figure)
  };
  var SCENE1 = {
    // ep1 living objects. Flying birds live HERE (scene.js buildBird reads sc.birds);
    // the `bird` in CRITTERS is drawBirdie — a plump PERCHED songbird — which is why
    // doves placed there never read as doves in flight.
    // ⚠ THE AVENUE NOW SWAYS. Fred: "i just want to make all the trees in the background to be
    // sprites, is that too heavy? we can remove the birds, butterfly, bee, ladybug."
    // Measured before answering: it is NOT heavy, and nothing had to be sacrificed. There are
    // two sway mechanisms and they differ by twenty times —
    //   · CRITTERS `type:'tree2'` builds a TWELVE-FRAME sprite sheet   ~3 MB per tree
    //   · SCENE `trees` -> buildSway is ONE frame + a CSS rotate       ~0.1-0.3 MB per tree
    // These 19 come to 7.3 MB all together, on a page using 67 of a 112 MB budget. The birds,
    // butterflies, bee and ladybug are far smaller still and all stay.
    // The plate no longer paints these; they are the same positions, lifted out of it.
    16: { trees: [
      { x: 362, y: 223, w: 6, h: 22, pal: LEAFPAL, seed: 400, phase: 0, light: doorGlow, sp: 'cypress' },
      { x: 437, y: 223, w: 6, h: 22, pal: LEAFPAL, seed: 407, phase: 0.7, light: doorGlow, sp: 'cypress' },
      { x: 343, y: 271, w: 11, h: 38, pal: LEAFPAL, seed: 414, phase: 1.4, light: doorGlow, sp: 'olive' },
      { x: 458, y: 271, w: 11, h: 38, pal: LEAFPAL, seed: 421, phase: 2.1, light: doorGlow, sp: 'olive' },
      { x: 134, y: 279, w: 9, h: 30, pal: LEAFPAL, seed: 428, phase: 2.8, light: doorGlow },
      { x: 744, y: 302, w: 11, h: 37, pal: LEAFPAL, seed: 435, phase: 3.5, light: doorGlow, sp: 'cypress' },
      { x: 317, y: 319, w: 18, h: 61, pal: LEAFPAL, seed: 442, phase: 0.2, light: doorGlow, sp: 'palm' },
      { x: 486, y: 319, w: 18, h: 61, pal: LEAFPAL, seed: 449, phase: 0.9, light: doorGlow, sp: 'palm' },
      { x: 534, y: 343, w: 17, h: 58, pal: LEAFPAL, seed: 456, phase: 1.6, light: doorGlow },
      { x: 284, y: 367, w: 27, h: 89, pal: LEAFPAL, seed: 463, phase: 2.3, light: doorGlow, sp: 'olive' },
      { x: 515, y: 367, w: 27, h: 89, pal: LEAFPAL, seed: 470, phase: 3, light: doorGlow, sp: 'olive' },
      { x: 108, y: 400, w: 19, h: 64, pal: LEAFPAL, seed: 477, phase: 3.7, light: doorGlow, sp: 'cypress' },
      { x: 229, y: 458, w: 30, h: 100, pal: LEAFPAL, seed: 484, phase: 0.4, light: doorGlow },
      { x: 194, y: 464, w: 47, h: 155, pal: LEAFPAL, seed: 491, phase: 1.1, light: doorGlow, sp: 'palm' },
      { x: 572, y: 464, w: 47, h: 155, pal: LEAFPAL, seed: 498, phase: 1.8, light: doorGlow, sp: 'palm' },
      { x: 664, y: 502, w: 43, h: 142, pal: LEAFPAL, seed: 505, phase: 2.5, light: doorGlow, sp: 'olive' },
      { x: 142, y: 512, w: 58, h: 194, pal: LEAFPAL, seed: 512, phase: 3.2, light: doorGlow },
      { x: 605, y: 512, w: 58, h: 194, pal: LEAFPAL, seed: 519, phase: 3.9, light: doorGlow },
      { x: 236, y: 514, w: 31, h: 105, pal: LEAFPAL, seed: 526, phase: 0.6, light: doorGlow, sp: 'olive' },
    ], birds: [   // "the voice of the turtle is heard in our land" (Song 2:12)
      { x: 318, y: 318, s: 1.25, col: '#fffdf4', range: 44, v: 0.07, phase: 0.0 },
      { x: 486, y: 348, s: 1.05, col: '#f7f2e4', range: 38, v: 0.06, phase: 1.2 },
      { x: 392, y: 286, s: 0.9,  col: '#fffefa', range: 34, v: 0.08, phase: 2.3 },
      { x: 262, y: 402, s: 1.1,  col: '#f9f5ea', range: 40, v: 0.05, phase: 0.8 },
      { x: 532, y: 424, s: 0.95, col: '#f2ece0', range: 36, v: 0.07, phase: 1.8 },
    ] },
  };

  /* ---- UNDERGROUND CRITTERS — cute, tappable life in the earth cutaways (worm,
     mole, beetle). Same soft-fill / shadow-rim / dot-eyes hand as the sheep. Drawn
     centred at (S.x, S.y), sized by S.s; S.t = a phase for the frozen pose. ---- */
  function drawWorm(ctx, S) {
    var s = S.s || 1, x = S.x, y = S.y, t = S.t || 0;
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    var PINK = '#e58fa0', PINKSH = '#c06d81', PALE = '#f7cdd6';
    var segs = 7, pts = [];
    for (var i = 0; i < segs; i++) { var u = i / (segs - 1); pts.push([x + (u - 0.5) * 24 * s, y - Math.sin(u * 6.2832 + t) * 5 * s, (4.4 - Math.abs(u - 0.5) * 2.6) * s]); }
    ctx.fillStyle = PINKSH; pts.forEach(function (p) { ctx.beginPath(); ctx.arc(p[0], p[1] + 1.2 * s, p[2] + 1 * s, 0, 6.2832); ctx.fill(); });
    ctx.fillStyle = PINK; pts.forEach(function (p) { ctx.beginPath(); ctx.arc(p[0], p[1], p[2], 0, 6.2832); ctx.fill(); });
    var band = pts[2]; ctx.fillStyle = PALE; ctx.beginPath(); ctx.arc(band[0], band[1], band[2] * 0.92, 0, 6.2832); ctx.fill();   // saddle (clitellum)
    var h = pts[segs - 1];   // the head-end
    ctx.fillStyle = '#1b1013';
    ctx.beginPath(); ctx.arc(h[0] - 1.1 * s, h[1] - 1.2 * s, 0.9 * s, 0, 6.2832); ctx.fill();
    ctx.beginPath(); ctx.arc(h[0] + 1.4 * s, h[1] - 1.2 * s, 0.9 * s, 0, 6.2832); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.beginPath(); ctx.arc(h[0] - 1.4 * s, h[1] - 1.5 * s, 0.32 * s, 0, 6.2832); ctx.fill();
    ctx.strokeStyle = '#a85566'; ctx.lineWidth = 0.8 * s; ctx.beginPath(); ctx.arc(h[0] + 0.2 * s, h[1] + 0.6 * s, 1.5 * s, 0.25, 2.9); ctx.stroke();   // little smile
  }
  function drawMole(ctx, S) {
    var s = S.s || 1, x = S.x, y = S.y;
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    var FUR = '#6d5c53', FURSH = '#4d3f38', NOSE = '#e79aa6', PAW = '#f0b2bd';
    ctx.fillStyle = FURSH; ctx.beginPath(); ctx.ellipse(x, y + 1.6 * s, 13 * s, 11 * s, 0, 0, 6.2832); ctx.fill();
    ctx.fillStyle = FUR; ctx.beginPath(); ctx.ellipse(x, y, 12.5 * s, 10.5 * s, 0, 0, 6.2832); ctx.fill();
    ctx.strokeStyle = '#7f6c62'; ctx.lineWidth = 1.1 * s;
    for (var i = 0; i < 5; i++) { var a = -1 + i * 0.5; ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * 4 * s, y + Math.sin(a) * 3 * s); ctx.lineTo(x + Math.cos(a) * 10 * s, y + Math.sin(a) * 8 * s); ctx.stroke(); }
    var nx = x - 9.5 * s, ny = y + 4.5 * s;   // snout to the lower-left
    ctx.fillStyle = FUR; ctx.beginPath(); ctx.ellipse(nx + 2.5 * s, ny - 1 * s, 6 * s, 4.6 * s, -0.5, 0, 6.2832); ctx.fill();
    ctx.fillStyle = NOSE; ctx.beginPath(); ctx.arc(nx, ny, 2.6 * s, 0, 6.2832); ctx.fill();
    ctx.fillStyle = PAW; for (var j = 0; j < 7; j++) { var b = j / 7 * 6.2832; ctx.beginPath(); ctx.arc(nx + Math.cos(b) * 2.5 * s, ny + Math.sin(b) * 2.5 * s, 0.85 * s, 0, 6.2832); ctx.fill(); }   // star-nose
    ctx.fillStyle = PAW;
    ctx.beginPath(); ctx.ellipse(x - 3 * s, y + 9 * s, 3.2 * s, 2.3 * s, 0.3, 0, 6.2832); ctx.fill();
    ctx.beginPath(); ctx.ellipse(x + 4.5 * s, y + 9.4 * s, 3.2 * s, 2.3 * s, -0.3, 0, 6.2832); ctx.fill();   // digging paws
    ctx.strokeStyle = '#1b1013'; ctx.lineWidth = 1 * s;
    ctx.beginPath(); ctx.arc(x - 1.5 * s, y - 1 * s, 1.5 * s, 0.25, 2.9, true); ctx.stroke();
    ctx.beginPath(); ctx.arc(x + 3.5 * s, y - 1.5 * s, 1.5 * s, 0.25, 2.9, true); ctx.stroke();   // happy squint eyes
    ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = 0.6 * s;
    for (var w = -1; w <= 1; w++) { ctx.beginPath(); ctx.moveTo(nx + 1 * s, ny + w * 1.2 * s); ctx.lineTo(nx - 6 * s, ny + w * 3 * s); ctx.stroke(); }
  }
  function drawBeetle(ctx, S) {
    var s = S.s || 1, x = S.x, y = S.y;
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    var SHELL = '#42606f', SHELLSH = '#2b3f4b', SHEEN = '#77a0b2';
    ctx.strokeStyle = '#2b2320'; ctx.lineWidth = 1 * s;
    for (var i = -1; i <= 1; i++) { ctx.beginPath(); ctx.moveTo(x - 5 * s, y + 1 * s + i * 2.2 * s); ctx.lineTo(x - 9 * s, y + 3 * s + i * 2.6 * s); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x + 5 * s, y + 1 * s + i * 2.2 * s); ctx.lineTo(x + 9 * s, y + 3 * s + i * 2.6 * s); ctx.stroke(); }
    ctx.fillStyle = SHELLSH; ctx.beginPath(); ctx.ellipse(x, y + 1 * s, 8 * s, 6.6 * s, 0, 0, 6.2832); ctx.fill();
    ctx.fillStyle = SHELL; ctx.beginPath(); ctx.ellipse(x, y, 7.5 * s, 6 * s, 0, 0, 6.2832); ctx.fill();
    ctx.strokeStyle = SHELLSH; ctx.lineWidth = 1 * s; ctx.beginPath(); ctx.moveTo(x, y - 5 * s); ctx.lineTo(x, y + 5 * s); ctx.stroke();
    ctx.globalAlpha = 0.5; ctx.fillStyle = SHEEN; ctx.beginPath(); ctx.ellipse(x - 2.6 * s, y - 2.2 * s, 2.6 * s, 1.6 * s, -0.4, 0, 6.2832); ctx.fill(); ctx.globalAlpha = 1;
    ctx.fillStyle = SHELLSH; ctx.beginPath(); ctx.arc(x, y - 5.6 * s, 2.7 * s, 0, 6.2832); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x - 1 * s, y - 6 * s, 0.75 * s, 0, 6.2832); ctx.fill(); ctx.beginPath(); ctx.arc(x + 1 * s, y - 6 * s, 0.75 * s, 0, 6.2832); ctx.fill();
    ctx.fillStyle = '#1b1013'; ctx.beginPath(); ctx.arc(x - 1 * s, y - 5.9 * s, 0.36 * s, 0, 6.2832); ctx.fill(); ctx.beginPath(); ctx.arc(x + 1 * s, y - 5.9 * s, 0.36 * s, 0, 6.2832); ctx.fill();
  }

  // a FIREFLY — mostly a soft glowing abdomen (the light IS the firefly), a tiny
  // dark body + faint wings above it. For the night that is turning to light.
  function drawFirefly(ctx, S) {
    var s = S.s || 1, x = S.x, y = S.y;
    var cols = [[11 * s, 'rgba(190,235,110,0.10)'], [7 * s, 'rgba(225,250,150,0.24)'], [4 * s, 'rgba(250,255,200,0.6)'], [2.1 * s, '#ffffe8']];
    cols.forEach(function (c) { ctx.fillStyle = c[1]; ctx.beginPath(); ctx.arc(x, y + 2 * s, c[0], 0, 6.2832); ctx.fill(); });   // the glow
    ctx.fillStyle = 'rgba(255,255,255,0.28)';   // faint wings
    ctx.beginPath(); ctx.ellipse(x - 2 * s, y - 2 * s, 2.3 * s, 1.2 * s, -0.5, 0, 6.2832); ctx.fill();
    ctx.beginPath(); ctx.ellipse(x + 2 * s, y - 2 * s, 2.3 * s, 1.2 * s, 0.5, 0, 6.2832); ctx.fill();
    ctx.fillStyle = '#37301f'; ctx.beginPath(); ctx.ellipse(x, y - 1.5 * s, 1.6 * s, 2.6 * s, 0, 0, 6.2832); ctx.fill();   // body
    ctx.beginPath(); ctx.arc(x, y - 4 * s, 1.3 * s, 0, 6.2832); ctx.fill();   // head
  }
  // a cute little FISH — for the river of living water. Soft koi body, round eye.
  /* ---- A SWIMMER IN THE PLATE'S OWN HAND (Fred: "your fish is not in the style of our
     painting... the fish that is emoji style") ----
     drawFish is a cartoon: smooth ellipses, a big eye, a flat orange. The plate paints its
     sea-life as the blade-fish lesson says to — a BOLD DARK SILHOUETTE with the morning's
     gold along its back and no small detail at all, because tiny detail mushes at this
     size. So this rig copies the plate's own fish exactly: navy crescent, forked tail,
     one gold rim stroke, laid down in short overlapping marks so it is made of brushwork
     rather than of vector curves. `kind:'whale'` is the same animal, larger, with a fluke
     and a spout — the great whale of Gen 1:21, which the plate used to paint frozen. */
  /* ---- AN OVERHANGING BOUGH — the frame, not the furniture (Fred, Aug 6) ----
     "you can place the trees in such a form like this to make it artistic", with a
     reference of a tree whose trunk climbs the RIGHT EDGE and whose branches reach clear
     across the TOP of the picture, leaving the whole landscape open underneath.
     That is repoussoir: the near thing is not IN the view, it FRAMES the view. Everything
     I built before was an upright tree standing in the middle of the sea, which is
     furniture. This draws the other thing:
       · a trunk entering at the box's side edge and leaning inward, rooted OFF-FRAME
       · two to four boughs sweeping across the top, thinning as they go
       · leaves in separate CLUMPS along them, with sky between — a solid green mass is a
         cut-out; gaps are what make a canopy read as a canopy
       · the light of the page along the top of every clump, shadow beneath it
       · and a sway that is a BEND: the base cannot move, the tips move most, the leaves
         answer a beat later than the wood.
     Painted in short marks like everything else on these plates, never a filled outline. */
  function drawBough(ctx, S) {
    var W = S.w, H = S.h, beat = S.beat == null ? 0 : S.beat;
    var side = S.side === 'left' ? 1 : -1;             // +1 enters left and sweeps right
    var seed = ((S.seed || 3) * 2246822519) & 0x7fffffff;
    var wn = function () { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
    var lit = S.lit == null ? 0.6 : S.lit;
    var BARK = ['#4a3222', '#5d4029', '#3a2618'], BARK_LIT = '#8a6440';
    var LEAF = S.leaf || ['#2f6b3a', '#3f8842', '#57a552', '#7cc063'];
    var RIM = S.rim || '#ffe9a8', UNDER = '#1d4429';
    var sway = (S.sway == null ? 7 : S.sway) * Math.sin(beat * 6.2832);
    // ⚠ EVERY MARK ITS OWN COLOUR, and every mark small. The first version filled flat
    // brown and flat green and it read as a vector cut-out pasted on an oil painting —
    // which is what it was. The plate never lays a flat area: it lays many small marks
    // that each miss the average slightly (jig()). So does this now.
    var jig = function (hex, amt) {
      var n = parseInt(hex.slice(1), 16);
      var r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
      var j = (wn() - 0.5) * amt, k = (wn() - 0.5) * amt * 0.6;
      r = Math.max(0, Math.min(255, r + j + k)); g = Math.max(0, Math.min(255, g + j));
      b = Math.max(0, Math.min(255, b + j - k));
      return 'rgb(' + (r | 0) + ',' + (g | 0) + ',' + (b | 0) + ')';
    };
    // ⚠ AND FADE AT THE BOX EDGE, or the canopy ends in a straight vertical cut where the
    // sprite's rectangle stops — the old sky-seam fault, and it was plainly visible.
    var edge = function (x, y) {
      var m = Math.min(x / (W * 0.14), (W - x) / (W * 0.14), (H - y) / (H * 0.16), 1.4);
      return Math.max(0, Math.min(1, m));
    };
    // ⚠ FLUFFY MEANS ROUND AND SOFT. Fred: "the leaves are cut and square and ugly. it has
    // to be fluffy." I was drawing foliage with the same short thick STROKE the trunk uses
    // — a round-capped line reads as a little rectangle, and a thousand of them read as
    // gravel. Leaves get their own primitive: a soft round dab, many of them, overlapping,
    // with the cluster's own silhouette made lumpy by angular noise so its edge is never
    // a circle and never a cut.
    var dab = function (x, y, r, c, al) {
      var e = edge(x, y);
      if (e <= 0.02 || r <= 0.2) return;
      ctx.fillStyle = c; ctx.globalAlpha = (al == null ? 1 : al) * e;
      ctx.beginPath(); ctx.arc(x, y, r, 0, 6.2832); ctx.fill();
      ctx.globalAlpha = 1;
    };
    var mark = function (x, y, a, L, w2, c, al) {
      var e = edge(x, y);
      if (e <= 0.02) return;
      ctx.strokeStyle = c; ctx.lineWidth = w2; ctx.lineCap = 'round';
      ctx.globalAlpha = (al == null ? 1 : al) * e;
      ctx.beginPath();
      ctx.moveTo(x - Math.cos(a) * L / 2, y - Math.sin(a) * L / 2);
      ctx.lineTo(x + Math.cos(a) * L / 2, y + Math.sin(a) * L / 2);
      ctx.stroke(); ctx.globalAlpha = 1;
    };
    // a quadratic, so a limb is one confident curve rather than a polyline
    var qp = function (p0, p1, p2, t) {
      var u = 1 - t;
      return [u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0],
              u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1]];
    };
    ctx.save(); ctx.lineJoin = 'round';
    // ⚠ THE TRUNK ENTERS SIDEWAYS AT THE FRAME'S EDGE — it does not rise out of the
    // middle of the picture. My first attempt ran it from the box's bottom corner up to
    // the top, and since this box only covers the sky, its "root" hung in mid-air as a
    // dark wedge. In the reference the trunk comes IN from the edge at about two-thirds
    // height, leans upward, and the boughs travel along the top from there.
    // ⚠ AND IT NEEDS A TRUNK. Fred: "the trees does not have a trunk." A limb entering from
    // off-frame is only half of the reference — in the photograph you can SEE the trunk
    // climbing the edge of the picture out of the ground. With `trunk:true` the box runs
    // all the way down to the shore and the tree stands on it: a thick base, tapering as
    // it climbs the frame's edge, and the limb grows out of its top.
    var hasTrunk = S.trunk !== false;
    var gy = H * (S.groundY == null ? 0.98 : S.groundY);           // where its foot stands
    var ex = side > 0 ? W * 0.055 : W * 0.945;                     // the edge it climbs
    var bx = hasTrunk ? ex : (side > 0 ? -W * 0.12 : W * 1.12);
    var by = hasTrunk ? H * 0.34 : H * 0.80;                       // the top of the trunk
    var kx = side > 0 ? W * 0.24 : W * 0.76, ky = H * 0.56;       // the elbow
    var tx = side > 0 ? W * 0.68 : W * 0.32, ty = H * 0.26;       // where the limb levels out
    // ---- THE TRUNK: from the ground up the frame's edge, thick to thin ----
    if (hasTrunk) {
      var TR = 34;
      for (var k2 = 0; k2 < TR; k2++) {
        var kt = k2 / (TR - 1);
        var lean = (side > 0 ? 1 : -1) * W * 0.045 * kt * kt;      // it leans into the frame as it climbs
        var trx = ex + lean, tryy = gy + (by - gy) * kt;
        var tw = W * 0.085 * (1 - kt * 0.55) * (0.92 + wn() * 0.18);
        mark(trx, tryy, Math.PI / 2 + (side > 0 ? 0.06 : -0.06), tw * 1.5, tw * 0.55,
             jig(BARK[(k2 * 5) % 3], 26), 0.95);
        if (wn() < 0.55)   // the morning down the lit flank, the far flank left dark
          mark(trx + (side > 0 ? tw * 0.30 : -tw * 0.30), tryy, Math.PI / 2, tw * 1.3, tw * 0.20,
               jig(BARK_LIT, 30), 0.22 + lit * 0.30);
        if (wn() < 0.35)
          mark(trx - (side > 0 ? tw * 0.34 : -tw * 0.34), tryy, Math.PI / 2, tw * 1.2, tw * 0.16,
               jig('#241a12', 20), 0.35);
      }
    }
    // ---- THE LIMB: thick where it enters, thinning as it reaches in ----
    var TN = 30;
    for (var i = 0; i < TN; i++) {
      var t = i / (TN - 1);
      var p = qp([bx, by], [kx, ky], [tx, ty], t);
      var bend = sway * 0.30 * t * t;
      var w2 = (W * 0.042) * (1 - t * 0.72) * (0.9 + wn() * 0.22);
      var pn = qp([bx, by], [kx, ky], [tx, ty], Math.min(1, t + 0.05));
      var a = Math.atan2(pn[1] - p[1], pn[0] - p[0]);
      mark(p[0] + bend, p[1], a, w2 * 1.8, w2 * 0.62, jig(BARK[(i * 7) % 3], 26), 0.95);
      if (wn() < 0.5) mark(p[0] + bend - Math.sin(a) * w2 * 0.32, p[1] + Math.cos(a) * w2 * 0.32,
                           a, w2 * 1.5, w2 * 0.26, jig(BARK_LIT, 30), 0.26 + lit * 0.32);
    }
    // ⚠ AND LEAVES ON THE LIMB ITSELF. Without them the limb's inner end is a bare brown
    // stick hanging in the sky — which is exactly what it looked like: two dark dashes
    // floating mid-frame. A branch is clothed along its length; only the thick part near
    // the trunk shows bare wood.
    var LIMB_CLUMPS = [0.42, 0.58, 0.72, 0.86, 0.98];
    for (var lc = 0; lc < LIMB_CLUMPS.length; lc++) {
      var lt = LIMB_CLUMPS[lc];
      var lq = qp([bx, by], [kx, ky], [tx, ty], lt);
      var lbend = sway * 0.30 * lt * lt;
      var lr = W * (0.085 + 0.05 * lt) * (0.85 + wn() * 0.35);
      var lcy = lq[1] - lr * 0.10;
      var llump = [wn() * 6.28, wn() * 6.28];
      var lN = 110 + ((lr / W) * 460 | 0);
      for (var ld = 0; ld < lN; ld++) {
        var lda = wn() * 6.2832;
        var lwob = 1 + 0.28 * Math.sin(lda * 3 + llump[0]) + 0.16 * Math.sin(lda * 6 + llump[1]);
        var ldr = Math.pow(wn(), 0.42) * lr * lwob;
        var llx = lq[0] + lbend + Math.cos(lda) * ldr * 1.18;
        var lly = lcy + Math.sin(lda) * ldr * 0.76;
        var lup = (lcy - lly) / (lr + 1e-6);
        var lcol = lup > 0.35 ? LEAF[3] : lup > -0.1 ? LEAF[2] : (wn() < 0.5 ? LEAF[1] : LEAF[0]);
        var lrad = lr * (0.10 + 0.10 * wn()) * (1 - 0.35 * Math.min(1, ldr / lr));
        dab(llx, lly, lrad, jig(lcol, 26), 0.42 + wn() * 0.30);
        if (lup > 0.42 && wn() < 0.30 * (0.4 + lit))
          dab(llx, lly - lrad * 0.35, lrad * 0.62, jig(RIM, 20), 0.34 * lit);
      }
    }
    // ---- THE BOUGHS: up and along the TOP of the frame, thinning as they go ----
    var NB = S.boughs || 3;
    for (var b = 0; b < NB; b++) {
      var f = NB === 1 ? 0.5 : b / (NB - 1);
      var start = qp([bx, by], [kx, ky], [tx, ty], 0.22 + f * 0.62);
      var reach = 0.55 + f * 0.55;                                  // the high ones reach furthest
      var endX = side > 0 ? W * (0.30 + reach * 0.72) : W * (0.70 - reach * 0.72);
      var endY = H * (0.30 - f * 0.20);                             // they climb toward the top edge
      var ctlX = side > 0 ? W * (0.24 + reach * 0.30) : W * (0.76 - reach * 0.30);
      var ctlY = H * (0.16 + f * 0.06);
      var BN = 22;
      for (var j = 0; j < BN; j++) {
        var bt = j / (BN - 1);
        var q = qp(start, [ctlX, ctlY], [endX, endY], bt);
        var bend2 = sway * (0.30 + 0.95 * bt);
        var qn = qp(start, [ctlX, ctlY], [endX, endY], Math.min(1, bt + 0.06));
        var a2 = Math.atan2(qn[1] - q[1], qn[0] - q[0]);
        var w3 = W * 0.024 * (1 - bt * 0.80) * (0.85 + wn() * 0.3);
        mark(q[0] + bend2, q[1] + bend2 * 0.20, a2, w3 * 1.8, w3 * 0.7, jig(BARK[(j * 5) % 3], 26), 0.92);
      }
      // ---- THE CANOPY: big clumps ALONG the bough, hanging a little below it ----
      var CL = 15;                                                  // a canopy is a MASS, not four tufts
      for (var c2 = 0; c2 < CL; c2++) {
        var ct = 0.06 + (c2 / CL) * 1.0;
        if (ct > 1.02) continue;
        if (wn() < 0.07) continue;                                  // sky through the leaves
        var cq = qp(start, [ctlX, ctlY], [endX, endY], Math.min(1, ct));
        var cbend = sway * (0.30 + 0.95 * ct) + sway * 0.45 * Math.sin(ct * 4 + b);
        var cr = W * (0.135 + 0.06 * Math.sin(ct * 3.1 + b * 1.7)) * (0.85 + wn() * 0.4);
        var cy2 = cq[1] + cr * 0.20 - (c2 % 2) * cr * 0.42;         // leaves hang under the wood, and a tier rides above it
        var lump = [wn() * 6.28, wn() * 6.28, wn() * 6.28];
        var nD = 120 + ((cr / W) * 520 | 0);
        for (var d = 0; d < nD; d++) {
          var da = wn() * 6.2832;
          // the cluster's own outline: never a circle, so its edge never looks cut
          var wob = 1 + 0.30 * Math.sin(da * 3 + lump[0]) + 0.18 * Math.sin(da * 5 + lump[1])
                      + 0.12 * Math.sin(da * 8 + lump[2]);
          var dr = Math.pow(wn(), 0.42) * cr * wob;
          var lx = cq[0] + cbend + Math.cos(da) * dr * 1.20;
          var ly = cy2 + cbend * 0.22 + Math.sin(da) * dr * 0.74;
          var up = (cy2 - ly) / (cr + 1e-6);
          var col = up > 0.35 ? LEAF[3] : up > -0.1 ? LEAF[2] : (wn() < 0.5 ? LEAF[1] : LEAF[0]);
          var rad = cr * (0.10 + 0.10 * wn()) * (1 - 0.35 * Math.min(1, dr / cr));
          dab(lx, ly, rad, jig(col, 26), 0.42 + wn() * 0.30);
          if (up > 0.42 && wn() < 0.30 * (0.4 + lit))
            dab(lx, ly - rad * 0.35, rad * 0.62, jig(RIM, 20), 0.34 * lit);
          if (up < -0.42 && wn() < 0.30)
            dab(lx, ly + rad * 0.25, rad * 0.70, jig(UNDER, 20), 0.30);
        }
      }
    }
    ctx.restore();
  }

  /* ---- THE SOWER'S SUN, TURNING (Fred: "make the sun rays move spirally") ----
     The plate already leans every ray 0.55 rad off true, so the sun is a spiral standing
     still. What it wants is for that spiral to TURN. A rigid spin cannot loop — rotating a
     field of random marks by anything other than its own symmetry angle jumps at the seam
     — so what turns here is a WAVE OF TWIST running outward: each mark's angle is offset
     by A·sin(2π(beat − d/λ)), so the inner rays wind while the outer ones unwind and the
     whole wheel appears to rotate, then to rotate back, for ever, seamlessly.
     Painted in the plate's own hand: the same gold ramp, the same jig, marks laid ALONG
     each ray, with a violet spark at the rays' death like the painting has. */
  function drawSunSpiral(ctx, S) {
    var beat = S.beat == null ? 0 : S.beat;
    var W = S.w, H = S.h, cx = W / 2, cy = H / 2;
    var r0 = S.r0 || 60, r1 = S.r1 || Math.min(W, H) * 0.48;
    var lean = S.lean == null ? 0.55 : S.lean;
    var amp = S.amp == null ? 0.20 : S.amp, lam = S.lam || 150;
    var seed = ((S.seed || 9) * 2246822519) & 0x7fffffff;
    var wn = function () { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
    var RAMP = [[250, 232, 170], [236, 196, 96], [198, 152, 64], [154, 132, 64], [107, 112, 96]];
    var col = function (t, a) {
      t = Math.max(0, Math.min(0.999, t)) * (RAMP.length - 1);
      var i = t | 0, f = t - i, c0 = RAMP[i], c1 = RAMP[Math.min(RAMP.length - 1, i + 1)];
      var j = (wn() - 0.5) * 26;
      return 'rgba(' + Math.max(0, Math.min(255, c0[0] + (c1[0] - c0[0]) * f + j | 0)) + ','
                     + Math.max(0, Math.min(255, c0[1] + (c1[1] - c0[1]) * f + j | 0)) + ','
                     + Math.max(0, Math.min(255, c0[2] + (c1[2] - c0[2]) * f + j * 0.6 | 0)) + ',' + a.toFixed(2) + ')';
    };
    ctx.save(); ctx.lineCap = 'round';
    var N = S.n || 430;
    for (var i = 0; i < N; i++) {
      var a0 = wn() * 6.2832;
      var d = r0 + Math.pow(wn(), 1.35) * (r1 - r0);
      var tw = amp * Math.sin(6.2832 * (beat - d / lam));      // the twist wave, travelling out
      var a = a0 + tw;
      var x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d;
      var dirA = a + lean;                                     // the plate's own lean: a spiral, not spokes
      var t = (d - r0) / (r1 - r0);
      var L = (S.len || 30) * (0.75 + wn() * 0.5), w2 = (S.lw || 3.4) * (0.8 + wn() * 0.45);
      ctx.strokeStyle = (wn() < 0.04 && t > 0.72) ? 'rgba(107,84,168,0.85)' : col(t, 0.88);
      ctx.lineWidth = w2;
      ctx.beginPath();
      ctx.moveTo(x - Math.cos(dirA) * L / 2, y - Math.sin(dirA) * L / 2);
      ctx.lineTo(x + Math.cos(dirA) * L / 2, y + Math.sin(dirA) * L / 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  /* ---- THE GREAT WHALE (Gen 1:21) — painted, and legible ----
     Fred, of the dark arc in the water: "also what is this supposed to be?" Fair question:
     it was a back, a fluke and a spout drawn as three flat shapes, and at that size the
     back is all you see — a dark banana. An animal has to be READ, so this one is built
     from the parts that say "whale" at a glance: a heavy rounded HEAD, a long arched back
     with a small dorsal, a tail that lifts clear of the water in a proper FLUKE, a pale
     belly-line where the light catches, and a spout. Painted in the same hand as the
     fish — a crowd of short jittered marks, never a fill. */
  function drawWhale(ctx, S) {
    /* ⚠ SILHOUETTE FIRST, PAINT SECOND. My first rig scattered marks around a spine and
       produced a dark cloud — Fred's "what is this supposed to be?" all over again. This
       plate's own note says it: "Simple bold silhouettes — the blade-fish lesson: tiny
       detail mushes; dark shape + gold rim + splash reads." So the whale is a real OUTLINE
       (head, arched back, tail stock, lifted fluke), filled once so the shape is
       unmistakable, and only THEN painted over with marks so it belongs to the picture. */
    var beat = S.beat == null ? 0 : S.beat;
    var L = S.len || 90, f = S.facing || 1, cx = S.cx, cy = S.cy;
    var seed = ((S.seed || 7) * 2246822519) & 0x7fffffff;
    var wn = function () { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
    var rise = Math.sin(beat * 6.2832) * L * 0.03;
    var fluke = Math.sin(beat * 6.2832 + 0.9) * 0.22;
    var X = function (u) { return cx + f * u * L; }, Y = function (v) { return cy + rise + v * L; };
    ctx.save();
    // ---- THE SILHOUETTE ----
    ctx.beginPath();
    ctx.moveTo(X(0.46), Y(0.02));                       // the nose
    ctx.bezierCurveTo(X(0.34), Y(-0.13), X(0.06), Y(-0.18), X(-0.16), Y(-0.10));   // the back
    ctx.bezierCurveTo(X(-0.28), Y(-0.06), X(-0.34), Y(-0.03), X(-0.42), Y(-0.02)); // tail stock
    ctx.lineTo(X(-0.52), Y(-0.20 + fluke * 0.10));      // the fluke, lifted clear
    ctx.lineTo(X(-0.44), Y(-0.05 + fluke * 0.04));
    ctx.lineTo(X(-0.54), Y(0.10 - fluke * 0.10));
    ctx.lineTo(X(-0.40), Y(0.045));
    ctx.bezierCurveTo(X(-0.20), Y(0.10), X(0.10), Y(0.13), X(0.30), Y(0.10));      // the belly
    ctx.bezierCurveTo(X(0.40), Y(0.085), X(0.45), Y(0.06), X(0.46), Y(0.02));
    ctx.closePath();
    ctx.fillStyle = 'rgba(38,70,104,0.95)'; ctx.fill();
    ctx.save(); ctx.clip();
    // ---- THE PAINT, inside the shape: marks that follow the body, back dark, belly pale
    for (var i = 0; i < Math.round(L * 3); i++) {
      var u = -0.55 + wn() * 1.05, v = (wn() - 0.5) * 0.30;
      var px = X(u), py = Y(v - 0.02);
      var up = -v / 0.15;
      var c = up > 0.3 ? [34, 62, 94] : up > -0.3 ? [56, 92, 128] : [130, 168, 196];
      var j = (wn() - 0.5) * 26;
      ctx.strokeStyle = 'rgba(' + (c[0] + j | 0) + ',' + (c[1] + j | 0) + ',' + (c[2] + j | 0) + ',0.85)';
      ctx.lineWidth = L * 0.035; ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(px - f * L * 0.035, py); ctx.lineTo(px + f * L * 0.035, py - L * 0.006);
      ctx.stroke();
    }
    ctx.restore();
    // ---- the morning along the back, and the eye ----
    ctx.strokeStyle = 'rgba(255,233,168,0.62)'; ctx.lineWidth = L * 0.022; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(X(0.36), Y(-0.06));
    ctx.bezierCurveTo(X(0.20), Y(-0.14), X(0.00), Y(-0.155), X(-0.18), Y(-0.09));
    ctx.stroke();
    ctx.fillStyle = 'rgba(20,16,14,0.9)';
    ctx.beginPath(); ctx.arc(X(0.33), Y(-0.015), L * 0.017, 0, 6.2832); ctx.fill();
    // ---- the spout ----
    var sp = 0.75 + 0.5 * Math.sin(beat * 6.2832 + 0.6);
    ctx.strokeStyle = 'rgba(253,244,216,0.66)'; ctx.lineWidth = L * 0.020;
    for (var q = 0; q < 3; q++) {
      var lean = (q - 1) * 0.10;
      ctx.beginPath();
      ctx.moveTo(X(0.18), Y(-0.15));
      ctx.quadraticCurveTo(X(0.18 + lean), Y(-0.15 - 0.14 * sp), X(0.18 + lean * 2.1), Y(-0.15 - 0.26 * sp));
      ctx.stroke();
    }
    ctx.restore();
  }

  /* ---- THE LITTLE FISH — the emoji's SHAPE, the plate's HAND (Fred, Aug 7) ----
     "change the fishes to the emoji type (but with our painting style) and make them swim."
     Two halves, and both matter. The SHAPE is the cheerful one a child reads instantly:
     a plump rounded body, a big triangular tail, a small fin above and below, one clear
     eye. The HAND is this book's: no smooth vector fill anywhere — the body is a crowd of
     short brush marks that each miss the average colour slightly (the plate's jig), lit
     along the back and deepened under the belly, with the morning's gold laid on top.
     That is the whole difference between an emoji pasted on a painting and a fish that
     was painted into one. */
  function drawCuteFish(ctx, S) {
    var beat = S.beat == null ? 0 : S.beat;
    var L = S.len || 40, f = S.facing || 1, cx = S.cx, cy = S.cy;
    var H = L * 0.62;
    var seed = ((S.seed || 5) * 2246822519) & 0x7fffffff;
    var wn = function () { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
    var BODY = S.col || [[214, 122, 52], [235, 152, 66], [246, 186, 96], [252, 214, 140]];
    var BELLY = [252, 226, 168], DARK = [128, 66, 30], RIM = [255, 233, 168];
    var jg = function (c, amt, a) {
      var j = (wn() - 0.5) * amt;
      return 'rgba(' + Math.max(0, Math.min(255, c[0] + j | 0)) + ','
                     + Math.max(0, Math.min(255, c[1] + j | 0)) + ','
                     + Math.max(0, Math.min(255, c[2] + j * 0.6 | 0)) + ',' + a.toFixed(2) + ')';
    };
    var mark = function (x, y, ang, len, w, col) {
      ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x - Math.cos(ang) * len / 2, y - Math.sin(ang) * len / 2);
      ctx.lineTo(x + Math.cos(ang) * len / 2, y + Math.sin(ang) * len / 2);
      ctx.stroke();
    };
    var swish = Math.sin(beat * 6.2832);                     // the tail's beat
    ctx.save(); ctx.lineJoin = 'round';
    // ---- THE TAIL: a fan of marks, hinged behind the body and sweeping ----
    var tx = cx - f * L * 0.44, ty = cy;
    for (var t = 0; t < 16; t++) {
      var u = t / 15, sp = (u - 0.5) * 1.5 + swish * 0.42;
      var ex = tx - f * L * (0.24 + wn() * 0.10) * Math.cos(sp * 0.6);
      var ey = ty + Math.sin(sp) * H * (0.52 + wn() * 0.18);
      mark((tx + ex) / 2, (ty + ey) / 2, Math.atan2(ey - ty, ex - tx),
           Math.hypot(ex - tx, ey - ty), L * 0.075,
           jg(u < 0.5 ? BODY[1] : BODY[2], 30, 0.9));
    }
    // ---- THE BODY: a plump oval laid in marks, back lit, belly pale ----
    var N = Math.round(L * 2.6);
    for (var i = 0; i < N; i++) {
      var a2 = wn() * 6.2832, dd = Math.pow(wn(), 0.42);
      var px = cx + Math.cos(a2) * L * 0.46 * dd + f * L * 0.04;
      var py = cy + Math.sin(a2) * H * 0.5 * dd;
      var up = (cy - py) / (H * 0.5);                        // +1 back .. -1 belly
      var col = up > 0.45 ? BODY[0] : up > 0 ? BODY[1] : up > -0.5 ? BODY[2] : BELLY;
      mark(px, py, 0.25 + wn() * 0.5, L * (0.14 + wn() * 0.08), L * 0.10,
           jg(col, 28, 0.92));
      if (up > 0.62 && wn() < 0.3) mark(px, py - L * 0.02, 0.2, L * 0.10, L * 0.05, jg(RIM, 20, 0.55));
      if (up < -0.62 && wn() < 0.3) mark(px, py, 0.2, L * 0.10, L * 0.05, jg(DARK, 20, 0.34));
    }
    // ---- FINS: one above, one below, each a few marks ----
    for (var fi = 0; fi < 2; fi++) {
      var sgn = fi ? 1 : -1, fx = cx - f * L * 0.02;
      for (var k = 0; k < 5; k++) {
        var kk = (k / 4 - 0.5);
        mark(fx + kk * L * 0.16, cy + sgn * (H * 0.46 + Math.abs(kk) * L * 0.05 + swish * sgn * L * 0.02),
             1.2 * sgn, L * 0.16, L * 0.07, jg(BODY[1], 26, 0.85));
      }
    }
    // ---- THE EYE: dark dab, white glint. One clear eye is what makes it read as cheerful
    var ex2 = cx + f * L * 0.28, ey2 = cy - H * 0.14;
    ctx.fillStyle = 'rgba(255,252,244,0.95)';
    ctx.beginPath(); ctx.arc(ex2, ey2, L * 0.085, 0, 6.2832); ctx.fill();
    ctx.fillStyle = 'rgba(28,20,14,0.92)';
    ctx.beginPath(); ctx.arc(ex2 + f * L * 0.015, ey2, L * 0.048, 0, 6.2832); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.beginPath(); ctx.arc(ex2 + f * L * 0.035, ey2 - L * 0.022, L * 0.018, 0, 6.2832); ctx.fill();
    // and the morning along its back, the same gold stroke the plate puts on everything
    mark(cx - f * L * 0.05, cy - H * 0.36, 0.12 * f, L * 0.5, L * 0.055, jg(RIM, 18, 0.6));
    ctx.restore();
  }

  function drawSwimmer(ctx, S) {
    var beat = S.beat == null ? 0 : S.beat;
    var s = S.s || 1, f = S.facing || 1, cx = S.cx, cy = S.cy;
    var whale = S.kind === 'whale';
    var DARK = whale ? '#28486a' : '#3a6a92', RIM = '#ffe9a8';
    var seed = ((S.seed || 5) * 2246822519) & 0x7fffffff;
    var wn = function () { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
    var tail = Math.sin(beat * 6.2832) * (whale ? 0.10 : 0.22);   // the beat of it
    ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    // the body, as a run of thick marks along its own arc — the plate never draws a
    // smooth outline, it lays paint
    var L = s * (whale ? 2.0 : 1.7), TH = s * (whale ? 0.42 : 0.52);
    var N = 11;
    for (var i = 0; i < N; i++) {
      var t = i / (N - 1);
      var px = cx + (t - 0.5) * L * f;
      var arc = Math.sin(t * Math.PI);                       // the back's curve
      var py = cy - arc * s * (whale ? 0.28 : 0.42);
      var w2 = TH * (0.35 + 0.85 * arc) * (0.85 + wn() * 0.3);
      ctx.strokeStyle = DARK;
      ctx.globalAlpha = 0.92;
      ctx.lineWidth = w2;
      ctx.beginPath();
      ctx.moveTo(px - L * 0.06 * f, py);
      ctx.lineTo(px + L * 0.06 * f, py - arc * s * 0.02);
      ctx.stroke();
    }
    // the forked tail, hinged at the body's end and beating
    var tx = cx - L * 0.52 * f, ty = cy - s * 0.10;
    var ta = tail + (whale ? 0.25 : 0.5) * f * -1;
    ctx.globalAlpha = 0.92; ctx.strokeStyle = DARK; ctx.lineWidth = TH * 0.55;
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.lineTo(tx - Math.cos(ta) * s * 0.5 * f, ty - Math.sin(ta) * s * 0.5 - s * 0.18);
    ctx.moveTo(tx, ty);
    ctx.lineTo(tx - Math.cos(ta) * s * 0.46 * f, ty - Math.sin(ta) * s * 0.46 + s * 0.20);
    ctx.stroke();
    if (whale) {   // the fluke's far blade and the spout catching the gold
      ctx.beginPath();
      ctx.moveTo(tx - s * 0.30 * f, ty - s * 0.30);
      ctx.lineTo(tx - s * 0.58 * f, ty - s * 0.46);
      ctx.lineWidth = TH * 0.34; ctx.stroke();
      ctx.strokeStyle = '#fdf4d8'; ctx.globalAlpha = 0.70; ctx.lineWidth = s * 0.09;
      var sp = 1 + 0.28 * Math.sin(beat * 6.2832 + 1.1);
      ctx.beginPath();
      ctx.moveTo(cx + L * 0.20 * f, cy - s * 0.30);
      ctx.quadraticCurveTo(cx + L * 0.26 * f, cy - s * 0.62 * sp, cx + L * 0.34 * f, cy - s * 0.78 * sp);
      ctx.stroke();
    }
    // the morning on its back: ONE gold stroke, the plate's own signature on this page
    ctx.globalAlpha = 0.9; ctx.strokeStyle = RIM; ctx.lineWidth = s * (whale ? 0.10 : 0.13);
    ctx.beginPath();
    ctx.moveTo(cx - L * 0.34 * f, cy - s * (whale ? 0.20 : 0.30));
    ctx.quadraticCurveTo(cx, cy - s * (whale ? 0.42 : 0.62), cx + L * 0.36 * f, cy - s * (whale ? 0.16 : 0.26));
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  function drawFish(ctx, S) {
    var s = S.s || 1, x = S.x, y = S.y, f = S.facing || 1;
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    var BODY = S.col || '#f0a24e', BELLY = '#f8cd92', FIN = '#e0783a', SH = '#c8692c';
    if (S.col === 'blue') { BODY = '#6fb2d8'; BELLY = '#bfe2f2'; FIN = '#4a90bc'; SH = '#3a78a2'; }
    ctx.fillStyle = FIN; ctx.beginPath(); ctx.moveTo(x - f * 7 * s, y); ctx.lineTo(x - f * 13 * s, y - 5 * s); ctx.lineTo(x - f * 13 * s, y + 5 * s); ctx.closePath(); ctx.fill();   // tail
    ctx.fillStyle = SH; ctx.beginPath(); ctx.ellipse(x, y + 0.9 * s, 8 * s, 5.3 * s, 0, 0, 6.2832); ctx.fill();
    ctx.fillStyle = BODY; ctx.beginPath(); ctx.ellipse(x, y, 7.6 * s, 4.8 * s, 0, 0, 6.2832); ctx.fill();
    ctx.fillStyle = BELLY; ctx.beginPath(); ctx.ellipse(x, y + 1.7 * s, 6 * s, 2.5 * s, 0, 0, 6.2832); ctx.fill();
    ctx.fillStyle = FIN; ctx.beginPath(); ctx.moveTo(x - 1 * s, y - 4.4 * s); ctx.quadraticCurveTo(x + 1 * s, y - 8 * s, x + 3.4 * s, y - 4 * s); ctx.fill();   // dorsal fin
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x + f * 4 * s, y - 1 * s, 1.6 * s, 0, 6.2832); ctx.fill();
    ctx.fillStyle = '#1b1013'; ctx.beginPath(); ctx.arc(x + f * 4.4 * s, y - 1 * s, 0.9 * s, 0, 6.2832); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.9)'; ctx.beginPath(); ctx.arc(x + f * 4.1 * s, y - 1.4 * s, 0.35 * s, 0, 6.2832); ctx.fill();
    ctx.strokeStyle = SH; ctx.lineWidth = 0.8 * s; ctx.beginPath(); ctx.arc(x + f * 6 * s, y + 0.6 * s, 1.7 * s, 0.4, 1.7); ctx.stroke();   // little smile
  }

  // a little TADPOLE — round head + a wiggly tail, for the washing water.
  function drawTadpole(ctx, S) {
    var s = S.s || 1, x = S.x, y = S.y, f = S.facing || 1;
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    var BODY = '#3d4c54', SH = '#2a363c', BELLY = '#61727a';
    ctx.strokeStyle = BODY; ctx.lineWidth = 2.4 * s;
    ctx.beginPath(); ctx.moveTo(x - f * 4 * s, y); ctx.quadraticCurveTo(x - f * 10 * s, y - 3.5 * s, x - f * 15 * s, y + 1 * s); ctx.stroke();   // wiggly tail
    ctx.fillStyle = SH; ctx.beginPath(); ctx.ellipse(x, y + 0.7 * s, 5.2 * s, 4.1 * s, 0, 0, 6.2832); ctx.fill();
    ctx.fillStyle = BODY; ctx.beginPath(); ctx.ellipse(x, y, 4.8 * s, 3.8 * s, 0, 0, 6.2832); ctx.fill();
    ctx.fillStyle = BELLY; ctx.beginPath(); ctx.ellipse(x, y + 1.2 * s, 3 * s, 1.7 * s, 0, 0, 6.2832); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x + f * 1.8 * s, y - 1 * s, 1.3 * s, 0, 6.2832); ctx.fill();
    ctx.fillStyle = '#1b1013'; ctx.beginPath(); ctx.arc(x + f * 2.1 * s, y - 1 * s, 0.75 * s, 0, 6.2832); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.beginPath(); ctx.arc(x + f * 1.7 * s, y - 1.4 * s, 0.3 * s, 0, 6.2832); ctx.fill();
  }
  // a cheerful BUTTERFLY — four rounded wings, a soft body + antennae. col picks the pair.
  // PAINTED, not flat (Fred, Aug 2026): the critters were clean vector ellipses with
  // white glint-dots — emoji next to a painted pilgrim. One butterfly design now, the
  // BAKED plates' design (4 lobed wings, dark body), built from broken-colour marks:
  // every mark its own hue and value, edges irregular, no glints. Deterministic per
  // position, so the paint never boils between frames.
  // THE CRITTER STYLE (settled with Fred, Aug 2026): drawn the way the CHARACTER is
  // drawn — a clean readable silhouette, cel-shaded (shade crescent below, lit crown
  // above), crisp features, no outlines, no white glint-dots. A butterfly must look
  // like a butterfly FIRST (Matt 18:3 — the child names it before the art is clever).
  // Broken-colour mark fans were tried and rejected: at 12px marks are noise.
  function celE(ctx, x, y, rx, ry, rot, BASE, SH, LT, np) {
    // one cel-shaded ellipse: fill SH, cover with BASE shifted toward the light,
    // kiss the top with LT — then PAINT IT, the way the pilgrim is painted.
    ctx.save();
    ctx.beginPath(); ctx.ellipse(x, y, rx, ry, rot, 0, 6.2832); ctx.clip();
    ctx.fillStyle = SH; ctx.fillRect(x - rx * 1.6, y - ry * 1.6, rx * 3.2, ry * 3.2);
    ctx.fillStyle = BASE;
    ctx.beginPath(); ctx.ellipse(x - Math.sin(rot) * ry * 0.22, y - Math.cos(rot) * ry * 0.22, rx * 0.96, ry * 0.92, rot, 0, 6.2832); ctx.fill();
    if (LT) { ctx.globalAlpha = 0.5; ctx.fillStyle = LT;
      ctx.beginPath(); ctx.ellipse(x - Math.sin(rot) * ry * 0.5, y - Math.cos(rot) * ry * 0.5, rx * 0.62, ry * 0.42, rot, 0, 6.2832); ctx.fill();
      ctx.globalAlpha = 1; }
    // ---- THE PAINT PASS (Fred, Aug 2026: the critters were "still emoji style"
    // while the pilgrim and the angels are painted). Same principle as the cloth on
    // the pilgrim: the cel tones give the FORM, these marks make it PAINT. They run
    // AROUND the form (tangential), take their colour from the tone beneath them,
    // and every one carries its own hue and value — broken colour, not noise.
    // ⚠ The fill stays. Marks that REPLACE the silhouette were tried and rejected:
    // at 12px a mark-fan is noise and the creature stops being nameable.
    if (np !== 0) {
      var seed = ((x * 71 + y * 37 + rx * 13) | 0) & 0x7fffffff || 21;
      var rn = function () { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
      var bA = hexA(BASE), sA = hexA(SH), lA = LT ? hexA(LT) : bA;
      var n = Math.max(5, Math.min(22, Math.round(rx * ry / 6)));
      for (var i = 0; i < n; i++) {
        var a2 = rn() * 6.2832, dd = Math.sqrt(rn()) * 0.82;
        var mx = x + Math.cos(a2) * rx * dd, my = y + Math.sin(a2) * ry * dd;
        var up = (y - my) / Math.max(1, ry);                    // +1 crown, -1 underside
        var base = up > 0.25 ? lA : up < -0.2 ? sA : bA;
        var jl = (rn() - 0.5) * 52, jw = (rn() - 0.5) * 30;     // its own value AND hue
        ctx.strokeStyle = rgbS(base[0] + jl + jw, base[1] + jl, base[2] + jl - jw);
        ctx.lineWidth = Math.max(0.9, ry * 0.26) * (0.7 + rn() * 0.5);
        ctx.lineCap = 'round';
        var tang = a2 + Math.PI / 2 + (rn() - 0.5) * 0.5;       // AROUND the form
        var L2 = rx * (0.28 + rn() * 0.3);
        ctx.globalAlpha = 0.62 + rn() * 0.33;
        ctx.beginPath();
        ctx.moveTo(mx - Math.cos(tang) * L2 / 2, my - Math.sin(tang) * L2 / 2);
        ctx.lineTo(mx + Math.cos(tang) * L2 / 2, my + Math.sin(tang) * L2 / 2);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }
    ctx.restore();
    // ---- THE EDGE. Unclipped, so these CROSS the outline — this is what stops the
    // shape reading as a vector decal with a filter on it. A brush does not stop
    // dead at a contour. (The pilgrim's edge marks do exactly this.)
    if (np !== 0) {
      var eseed = ((x * 29 + y * 91) | 0) & 0x7fffffff || 13;
      var ern = function () { eseed = (eseed * 1103515245 + 12345) & 0x7fffffff; return eseed / 0x7fffffff; };
      var eA = hexA(BASE), eN = Math.max(5, Math.min(16, Math.round(rx / 1.15)));
      for (var e = 0; e < eN; e++) {
        var ea = ern() * 6.2832;
        var er = 0.9 + ern() * 0.16;                              // some inside the edge, some past it
        var ex = x + Math.cos(ea) * rx * er, ey = y + Math.sin(ea) * ry * er;
        var jl2 = (ern() - 0.5) * 30;
        ctx.strokeStyle = rgbS(eA[0] + jl2, eA[1] + jl2, eA[2] + jl2);
        ctx.lineWidth = Math.max(0.8, ry * 0.19) * (0.7 + ern() * 0.6); ctx.lineCap = 'round';
        ctx.globalAlpha = 0.6 + ern() * 0.35;
        var et = ea + Math.PI / 2 + (ern() - 0.5) * 0.9, eL = rx * (0.26 + ern() * 0.3);
        ctx.beginPath();
        ctx.moveTo(ex - Math.cos(et) * eL / 2, ey - Math.sin(et) * eL / 2);
        ctx.lineTo(ex + Math.cos(et) * eL / 2, ey + Math.sin(et) * eL / 2);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }
  }

  // ---- A RIG, NOT A TRANSFORM (Fred, Aug 2026) ----
  // "all the butterflies are top view, all the bees are side view, you can play with
  //  it by rotating the image but it does not solve anything. how do we create objects
  //  that move like it has life?"
  // Right: squashing a finished drawing cannot make life, because the SILHOUETTE never
  // changes — one picture, distorted. A living thing changes shape as it moves.
  // So the butterfly is now drawn from physical parameters each frame, exactly the way
  // the pilgrim is drawn from lean and stride:
  //   S.beat — where it is in one wing-cycle (0..1)
  //   S.view — the CAMERA's elevation: 1 = straight overhead, 0 = level with it
  //   S.head — which way it is pointing
  // A wing tip sits at (r·cos φ, r·sin φ) in the wing plane, φ being the dihedral. The
  // camera at elevation E projects that to  x = r·cos φ,  y = -r·sin φ·cos E.
  // From overhead (cos E = 0) the wings simply narrow as they rise. From the side they
  // swing up into a real V. ONE rig, every viewpoint — so a swarm can hold butterflies
  // seen from above, from the side, and every angle between, all genuinely flapping.
  function drawButterfly(ctx, S) {
    var s = S.s || 1, x = S.x, y = S.y;
    var beat = S.beat == null ? 0 : S.beat;
    var view = S.view == null ? 1 : S.view;          // default overhead (the old look)
    var head = S.head || 0;
    var W1 = ['#ec6f9e', '#c04a72', '#f8a8c4'], W2 = ['#f6c84a', '#cf9a2e', '#fbe28e'];
    if (S.col === 'blue') { W1 = ['#8fd0ee', '#5a9cc4', '#c8ecfb']; W2 = ['#b98ce8', '#8a5ec0', '#dcc4f6']; }
    else if (S.col === 'gold') { W1 = ['#f4c84a', '#c8942e', '#fbe89a']; W2 = ['#f0985a', '#c46c38', '#f8c49a']; }
    else if (S.col === 'green') { W1 = ['#8fd0a0', '#5aa070', '#c4ecc8']; W2 = ['#f0d060', '#c0a038', '#f8e8a0']; }

    var phi = Math.sin(beat * 6.2832) * 1.16;        // the DIHEDRAL: wings sweep up and down
    var cosE = Math.sqrt(Math.max(0, 1 - view * view));   // camera elevation term
    var kx = Math.cos(phi), ky = -Math.sin(phi) * cosE;
    var bodyLen = 5.0 * s * (0.42 + 0.58 * view);    // the body foreshortens as we drop to its level

    ctx.save();
    ctx.translate(x, y); ctx.rotate(head); ctx.lineJoin = 'round'; ctx.lineCap = 'round';

    // wings, far pair first so the near pair overlaps them when seen from the side
    var wing = function (sx, up, rx, ry, C) {
      var cx2 = sx * rx * kx, cy2 = up * ry * 0.28 + rx * ky * 0.62;
      var rot = sx * (0.5 - phi * 0.42 * (1 - cosE * 0.5));
      // the wing FORESHORTENS with the dihedral — this is the shape change that reads
      // as flapping; a uniform squash of the whole sprite never could.
      celE(ctx, cx2, cy2, Math.max(0.6, rx * Math.abs(kx)) , ry * (0.72 + 0.28 * Math.abs(kx)), rot, C[0], C[1], C[2]);
      return [cx2, cy2];
    };
    var order = (phi >= 0) ? [-1, 1] : [1, -1];
    order.forEach(function (sx) {
      wing(sx, -1, 4.9 * s, 5.2 * s, W1);            // forewing
      wing(sx, 1, 3.6 * s, 3.9 * s, W2);             // hindwing
    });
    // one wing-spot per forewing, riding the same projection
    ctx.fillStyle = W1[1];
    [-1, 1].forEach(function (sx) {
      var px = sx * 5.4 * s * kx, py = -3.4 * s * 0.28 + 5.4 * s * ky * 0.62;
      if (Math.abs(kx) < 0.25) return;               // edge-on: no spot to see
      ctx.beginPath(); ctx.ellipse(px, py, 1.5 * s * Math.abs(kx), 1.2 * s, 0, 0, 6.2832); ctx.fill();
    });
    // the body — drawn LAST, crisp, and it never distorts: the wings move, not the animal
    ctx.strokeStyle = '#3a2b22'; ctx.lineWidth = 2 * s;
    ctx.beginPath(); ctx.moveTo(0, -bodyLen * 0.9); ctx.lineTo(0, bodyLen); ctx.stroke();
    ctx.fillStyle = '#3a2b22';
    ctx.beginPath(); ctx.arc(0, -bodyLen - 0.6 * s, 1.3 * s, 0, 6.2832); ctx.fill();
    ctx.strokeStyle = '#3a2b22'; ctx.lineWidth = 0.7 * s;
    ctx.beginPath(); ctx.moveTo(0, -bodyLen - 1.2 * s); ctx.quadraticCurveTo(-2 * s, -bodyLen - 4.4 * s, -3.2 * s, -bodyLen - 3.6 * s); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, -bodyLen - 1.2 * s); ctx.quadraticCurveTo(2 * s, -bodyLen - 4.4 * s, 3.2 * s, -bodyLen - 3.6 * s); ctx.stroke();
    ctx.fillStyle = '#3a2b22';
    ctx.beginPath(); ctx.arc(-3.2 * s, -bodyLen - 3.6 * s, 0.55 * s, 0, 6.2832); ctx.fill();
    ctx.beginPath(); ctx.arc(3.2 * s, -bodyLen - 3.6 * s, 0.55 * s, 0, 6.2832); ctx.fill();
    ctx.restore();
  }

  // ---- A BONFIRE, RIGGED (Fred, Aug 2026: "think of it like making a butterfly
  // but this time we are creating a big bonfire") ----
  // A fire's life is NOT one shape wobbling. It is many TONGUES, each rising and
  // dying on its OWN clock, so at any instant some are tall and some have just
  // collapsed. That disagreement between the parts is the whole effect — the same
  // reason the rabbit's two ears move on different rhythms.
  //   S.beat — position in the cycle (0..1)
  //   S.w, S.h — the fire's footprint and reach, in the caller's pixels
  // The heart is dense and the tongues go translucent toward the tip, so the night
  // shows through the edge of the flame (Fred's note on the still plate).
  // ---- THE WALKING LIGHT, ANIMATED (Fred: "make it like the old light but with
  // animations") ----
  // Not a bonfire. This is the SAME column the plate painted for a year — the same
  // pillar profile, the same gold->amber->olive->blue ramp, the same curl — drawn at
  // runtime so its strokes can STREAM upward. The only difference from the baked
  // version is that each frame samples the strokes at a different point in the flow,
  // so the light rises through itself. Every colour and dimension below is lifted
  // straight from gen/plates/garden.mjs, which is why it belongs to the same hand.
  // ---- ONE SUBJECT: A CHARRED LOG BURNING (Fred, Aug 2026) ----
  // "you need to draw the wood too. it cannot be 2 things on top of each other.
  //  because fire+log does not equal fire+log but rather a burning flame and a
  //  charred log."
  // That is the correction. The first version drew a fire, then laid a log object on
  // top of it, then some flame in front — three separate things stacked. A burning
  // log is ONE subject, painted in ONE pass from ONE palette: the same ramp runs from
  // white-hot at the heart, through gold and orange and deep red, into the char and
  // the near-black of wood that has already burned. The log is not a brown object
  // borrowed from somewhere else; it is the COLD END OF THE FIRE'S OWN PALETTE.
  //
  // Everything else that was learned stays:
  //  · painted in discrete tapered brush-marks with broken colour, never gradients
  //    (a gradient is a different medium and reads as a different artist)
  //  · few, long, fat, opaque marks — dense faint ones re-average back into a gradient
  //  · many TONGUES on their own clocks, so some are tall while others have collapsed
  //  · ⚠ the WOOD MUST NOT BOIL: `wn` is seeded from the fire's identity alone, so
  //    the log's grain is identical in every frame. Only flame, ember and the burning
  //    contact edge use `rn`, which is seeded from the BEAT and re-scatters.
  function drawBonfire(ctx, S) {
    var beat = S.beat == null ? 0 : S.beat;
    var x = S.x, y = S.y, W = S.w || 90, H = S.h || 190;
    var K = S.k || 12;
    var seed = ((S.seed || 7) * 2654435761 + Math.round(beat * 997) * 40503) & 0x7fffffff;
    var rn = function () { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
    var wseed = ((S.seed || 7) * 2246822519) & 0x7fffffff;
    var wn = function () { wseed = (wseed * 1103515245 + 12345) & 0x7fffffff; return wseed / 0x7fffffff; };

    // ONE RAMP, heart to ash. 0 = white-hot ... 1 = burnt-out char.
    var RAMP = [[255, 252, 236], [255, 233, 160], [255, 190, 78], [246, 132, 38],
                [214, 66, 26], [138, 46, 30], [74, 40, 32], [34, 24, 24]];
    var pick = function (t, a2, R) {
      R = R || rn;
      t = Math.max(0, Math.min(0.999, t)) * (RAMP.length - 1);
      var i = t | 0, f = t - i, c0 = RAMP[i], c1 = RAMP[Math.min(RAMP.length - 1, i + 1)];
      var jl = (R() - 0.5) * 44, jw = (R() - 0.5) * 24;
      return 'rgba(' + Math.max(0, Math.min(255, (c0[0] + (c1[0] - c0[0]) * f + jl + jw) | 0)) + ','
                     + Math.max(0, Math.min(255, (c0[1] + (c1[1] - c0[1]) * f + jl) | 0)) + ','
                     + Math.max(0, Math.min(255, (c0[2] + (c1[2] - c0[2]) * f + jl - jw) | 0)) + ',' + a2.toFixed(2) + ')';
    };
    var mark = function (mx, my, ang, L, w2, col) {
      ctx.strokeStyle = col; ctx.lineWidth = w2; ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(mx - Math.cos(ang) * L / 2, my - Math.sin(ang) * L / 2);
      ctx.lineTo(mx + Math.cos(ang) * L / 2, my + Math.sin(ang) * L / 2);
      ctx.stroke();
    };
    // ---- THE OPACITY LADDER (Fred) ----
    // Depth by transparency: a thing is DENSE where it is hot and solid, and thin
    // where it is dissipating into the air. The eye reads that as distance and heat
    // without any change of colour.
    //   bed / heart   0.95  — the densest thing in the picture
    //   logs          1.00  — solid matter; the only fully opaque element
    //   flame tongues 0.80  — you can already see the night faintly through them
    //   fragments     0.40  — torn scraps, half air by the time they are clear of it
    //   smoke/embers high   fading to 0 as they leave the frame
    var OP_FLAME = 0.80, OP_FRAG = 0.40, OP_BED = 0.95;
    ctx.save(); ctx.lineJoin = 'round';

    // the two logs, as GEOMETRY only — they are painted below, in the same pass as
    // the flame, from the same ramp
    // A WOODPILE, not two sticks — Fred: "you cannot get a flame this big with just 2
    // sticks." Five logs, fatter, stacked the way wood actually sits: the deep ones
    // low and behind the flame's root, the near ones crossed over them. `back:true`
    // logs are painted BEFORE the tall tongues so the fire rises out of the pile
    // rather than in front of it.
    var LOGS = [
      { lx: x - W * 0.26, ly: y - H * 0.030, ll: W * 0.62, ang: -0.10, th: Math.max(6, W * 0.150), back: true },
      { lx: x + W * 0.24, ly: y - H * 0.045, ll: W * 0.58, ang: 0.13, th: Math.max(6, W * 0.140), back: true },
      { lx: x - W * 0.02, ly: y - H * 0.115, ll: W * 0.80, ang: -0.26, th: Math.max(7, W * 0.165) },
      { lx: x + W * 0.12, ly: y - H * 0.060, ll: W * 0.86, ang: 0.19, th: Math.max(8, W * 0.185) },
      { lx: x - W * 0.16, ly: y - H * 0.015, ll: W * 0.54, ang: 0.46, th: Math.max(6, W * 0.145) },
    ];

    // one tongue's worth of marks, at a given point in its life
    var tongue = function (i, scale) {
      var ph = i / K + (i % 3) * 0.13;
      var u = (beat + ph) % 1;
      var life = Math.sin(u * Math.PI);
      if (life <= 0.04) return;
      var side = (i / (K - 1) - 0.5) * 2;
      var root = x + side * W * 0.34 * (0.6 + ((i * 41 % 9) / 9) * 0.5);
      var tall = H * scale * (0.52 + 0.48 * life) * (0.78 + ((i * 37 % 11) / 11) * 0.38);
      var lean = Math.sin((beat * 0.8 + ph) * 6.2832) * W * 0.055 + side * W * 0.18;
      var halfW = W * (0.17 + 0.15 * life) * (0.65 + ((i * 53 % 7) / 7) * 0.75);
      var nMark = Math.max(5, Math.round(tall * 0.11));
      for (var m = 0; m < nMark; m++) {
        var t2 = Math.pow(rn(), 0.72);
        var spineX = root + lean * t2 * t2, spineY = y - tall * t2;
        var wAt = halfW * (1 - t2 * 0.86);
        var off = (rn() + rn() - 1) * wAt;
        var mx = spineX + off, my = spineY + (rn() - 0.5) * tall * 0.05;
        var up = Math.PI / 2 + (lean / Math.max(1, tall)) * 0.9 + (rn() - 0.5) * 0.42;
        var L2 = (H * 0.115) * (0.6 + rn() * 0.9) * (1 - t2 * 0.35);
        // flame rides the HOT half of the ramp only (0 .. 0.55)
        var col = pick(0.12 + (t2 * 0.72 + Math.abs(off / Math.max(1, wAt)) * 0.34) * 0.52,
                       (0.62 + rn() * 0.33) * (0.5 + life * 0.5) * OP_FLAME);
        mark(mx, my, -up, L2, Math.max(2.2, W * 0.105) * (0.65 + rn() * 0.6), col);
      }
    };

    // ---- 1. THE BED: the hot heart the whole thing stands in
    var nb = Math.round(W * 0.30);
    for (var b2 = 0; b2 < nb; b2++) {
      var a3 = rn() * 6.2832, d2 = Math.pow(rn(), 0.6);
      mark(x + Math.cos(a3) * d2 * W * 0.52, y - H * 0.05 + Math.sin(a3) * d2 * H * 0.10,
           -Math.PI / 2 + (rn() - 0.5) * 1.1, H * 0.09 * (0.5 + rn()),
           Math.max(2.4, W * 0.11) * (0.6 + rn() * 0.6), pick(0.04 + d2 * 0.62 * 0.52, (0.72 + rn() * 0.28) * OP_BED));
    }

    // ---- 2. THE DEEP LOGS, then FLAME rising out of the pile
    if (S.logs !== false) LOGS.forEach(function (g) { if (g.back) paintLog(g); });
    for (var i1 = 0; i1 < K; i1 += 2) tongue(i1, 1);

    // ---- 3. THE CHARRED LOGS — same marks, same ramp, cold end.
    // A burnt log is not brown: it is the fire's own colour gone out. Its underside
    // is nearly ash-black (ramp ~0.95), its top still holds the red of the coal it is
    // becoming (~0.62), and where the flame actually licks it, it runs back up into
    // orange and white. That continuity is what makes it ONE subject.
    if (S.logs !== false) LOGS.forEach(function (g) { if (!g.back) paintLog(g); });   // logs:false = a carried light (candle/lamp): same fire, no woodpile

    function paintLog(g) {
      var ca = Math.cos(g.ang), sa = Math.sin(g.ang);
      var nL = Math.max(16, Math.round(g.ll * 0.46));
      for (var q = 0; q < nL; q++) {
        var tq = wn() - 0.5;
        var across = (wn() + wn() - 1) * g.th * 0.46;
        var mx2 = g.lx + ca * g.ll * tq - sa * across;
        var my2 = g.ly + sa * g.ll * tq + ca * across;
        var round = across / (g.th * 0.5);                 // -1 top .. +1 underside
        // top of the log = still glowing coal; underside = ash
        var tRamp = 0.62 + (round + 1) * 0.5 * 0.34 + (wn() - 0.5) * 0.10;
        ctx.strokeStyle = pick(tRamp, 0.80 + wn() * 0.2, wn);
        ctx.lineWidth = g.th * (0.17 + wn() * 0.17); ctx.lineCap = 'round';
        var gl = g.ll * (0.10 + wn() * 0.16);
        ctx.beginPath();
        ctx.moveTo(mx2 - ca * gl / 2, my2 - sa * gl / 2);
        ctx.lineTo(mx2 + ca * gl / 2, my2 + sa * gl / 2);
        ctx.stroke();
      }
      // THE BURNING EDGE — this one DOES flicker (rn), because it is the fire, not the
      // wood: the line where flame is eating into the log, running white at a few points.
      for (var h2 = 0; h2 < 14; h2++) {
        var th2 = (rn() - 0.5) * 0.92;
        var hx = g.lx + ca * g.ll * th2 - sa * g.th * 0.30;
        var hy = g.ly + sa * g.ll * th2 + ca * g.th * 0.30 - g.th * 0.16;
        var hl = g.ll * (0.05 + rn() * 0.10);
        mark(hx, hy, g.ang, hl, g.th * (0.10 + rn() * 0.15),
             pick(rn() * 0.22, 0.62 + rn() * 0.34));       // white/gold/orange: the hot end
      }
      // the CUT END — pale inner wood, the one part not yet burnt. Stable (wn).
      var ex2 = g.lx + ca * g.ll / 2, ey2 = g.ly + sa * g.ll / 2;
      for (var c2 = 0; c2 < 8; c2++) {
        var ang2 = wn() * 6.2832, dd3 = Math.sqrt(wn());
        ctx.strokeStyle = pick(0.44 + wn() * 0.14, 0.9, wn);
        ctx.lineWidth = g.th * 0.16;
        ctx.beginPath();
        ctx.moveTo(ex2 + Math.cos(ang2) * g.th * 0.26 * dd3, ey2 + Math.sin(ang2) * g.th * 0.44 * dd3);
        ctx.lineTo(ex2 - Math.cos(ang2) * g.th * 0.20 * dd3, ey2 - Math.sin(ang2) * g.th * 0.34 * dd3);
        ctx.stroke();
      }
    }

    // ---- 4. FLAME IN FRONT OF THE WOOD — lower, licking up over the bark. The
    // overlap is the difference between "wood near a fire" and "wood on fire".
    for (var i2 = 1; i2 < K; i2 += 2) tongue(i2, 0.62);

    // ---- 5. FIRE FRAGMENTS lifting off (Fred: "fire fragments flying upwards").
    // Not dots — torn scraps of burning wood, tumbling as they rise. Each has its own
    // launch phase so the stream is continuous, drifts sideways as it climbs (hot air
    // wanders), cools from white through orange to a dying red, and shrinks. The few
    // that fly highest are what carry the eye up out of the frame.
    var NF2 = 22;
    for (var e = 0; e < NF2; e++) {
      var ep = (beat * (0.7 + (e % 5) * 0.12) + e / NF2) % 1;
      var rise = Math.pow(ep, 0.8);                                   // fast off the fire, slowing as it cools
      var drift = Math.sin(ep * 4.4 + e * 1.7) * W * (0.16 + (e % 3) * 0.09);
      var ex3 = x + (((e * 29 % 13) / 13) - 0.5) * W * 0.72 + drift;
      var ey3 = y - H * (0.18 + rise * 1.35);
      var sz = Math.max(0.8, W * 0.045 * (1 - rise * 0.75)) * (0.6 + ((e * 7 % 5) / 5) * 0.9);
      var fade = Math.min(1, (1 - ep) * 2.2) * (0.35 + 0.65 * (1 - rise));
      // a fragment is a little TUMBLING flake, not a circle: a short mark that spins
      var spin = ep * 9 + e;
      mark(ex3, ey3, spin, sz * 2.2, sz * 0.95,
           pick(0.06 + rise * 0.52, Math.max(0, fade) * (0.6 + rn() * 0.4) * OP_FRAG));
      if (e % 4 === 0) {                                              // a few keep a hot core
        ctx.fillStyle = pick(0.03, Math.max(0, fade) * 0.9 * OP_FRAG * 1.6);   // the hot cores stay a little denser than the scraps around them
        ctx.beginPath(); ctx.arc(ex3, ey3, sz * 0.5, 0, 6.2832); ctx.fill();
      }
    }
    ctx.restore();
  }

  // ---- A TREE IN THE WIND (Fred: "can we try animating the trees, the skies etc?")
  // The fire's architecture, applied to wood that is alive instead of burning. This is
  // the garden's great cypress, rebuilt from the SAME construction the plate used — a
  // flame-shaped silhouette, strokes flaming up its contour, deep blue on the shadow
  // flank and green-fire on the flank facing the Light — but with the sway driven by a
  // wind phase instead of frozen.
  // ⚠ THE WHOLE TREE MUST NOT SWING AS ONE. That is a cardboard cutout wobbling. A
  // real tree is anchored: the base barely moves, the crown moves most, and the
  // response LAGS up the trunk so the tip is still travelling when the base has already
  // turned back. Amplitude here goes as t^1.8 (t = height up the tree) and the phase is
  // delayed by t — those two lines are the entire difference between wind and wobble.
  // ---- TREE PALETTES ----
  // The book turns over at the resurrection: dark ground/light objects before, light
  // ground/dark objects after. A tree drawn in the garden's night colours (navy shadow
  // flank) goes to mud on a bright post-resurrection meadow, so every tree takes a
  // `pal`. 'night' is the garden's dark anchor; 'day' is a tree in real light, still
  // modelled two-flank but in greens, with the sun warming instead of a fire.
  var TREEPAL = {
    night: { shade: [[18, 38, 84], [21, 48, 80], [24, 60, 76]],
             leaf:  [[20, 62, 62], [26, 78, 56], [34, 94, 60]],
             leaf2: [[26, 86, 58], [34, 104, 62], [44, 120, 66]],
             bark:  [96, 68, 58], rim: [240, 132, 46] },
    // ⚠ lifted after the first roll: at 38-138 the trees read as dark cut-outs on the
    // bright meadows, not as trees standing IN the light. A daylight tree is still
    // two-flank, but both flanks live in the upper half of the value range.
    day:   { shade: [[58, 122, 86], [66, 136, 84], [78, 150, 90]],
             leaf:  [[104, 178, 86], [124, 196, 96], [146, 212, 108]],
             leaf2: [[126, 196, 96], [148, 212, 108], [170, 226, 122]],
             bark:  [140, 106, 76], rim: [255, 240, 186] },
    // ⚠ `garden` — MATCHED TO THE PAINTED TREES, for pages where both kinds stand together.
    // Fred, on twoways: "the trees that are swaying are different style than the others."
    // Mark size and count were already fixed (see the note in drawBroadleaf) and the
    // crown-warm/belly-deep rule is in flank() — what was left was the PALETTE, and the
    // gap is measurable. paintTree's canopy ramp (gen/engine.mjs) runs #0d2312 → #cbd870:
    // near-black to bright yellow-green across seven stops. `day`'s darkest is (58,122,86)
    // — a MID desaturated blue-green — so beside a painted tree the sprite read as one
    // flat cool mass with no shadow in it.
    // `day` stays exactly as it is: it was lifted on purpose so trees would not read as
    // dark cut-outs on bright meadows, and other pages depend on that. This is additive.
    // The values sit low because flank() then adds the crown/belly offsets on top
    // (+74 red at the crown, -40 at the belly), which is what spreads them across the
    // painted trees' full range instead of clustering them in the middle.
    // ⚠ TUNED BY MEASURING BOTH, not by eye. Fred: "can you make the moving trees kind
    // blend in more with the background?" Sampling the sprite canopy against its painted
    // neighbours on twoways gave the whole answer:
    //     sway sprite    mean rgb (143,150,69)  warmth r-b  73  spread 51
    //     painted near   mean rgb (185,174,70)  warmth r-b 116  spread 34
    //     painted far    mean rgb (201,194,109) warmth r-b  92  spread 33
    // Three separate faults, each of which alone makes a sprite pop: it was DARKER by
    // ~45, COOLER by ~30, and carried half again the internal CONTRAST. So these values
    // are lifted and warmed toward the painted means, and their own internal range is
    // narrowed — flank() then adds the crown/belly swing on top, and that swing was most
    // of the excess spread.
    // ⚠ AND THE FIRST TUNE BARELY MOVED IT, because the sample box was mostly MEADOW, not
    // sprite. Isolating the sprite properly (diff two renders that differ only in this
    // palette — the changed pixels ARE the sprite) gave the real gap:
    //     sprite  (115,142,71) warmth  44        painted (180,169,59) warmth 121
    // The painted trees have RED EXCEEDING GREEN — they stand in the door's gold light,
    // so in this air a tree is not a green object at all. The sprite was still painting a
    // green tree. Hence red raised to meet green rather than everything lifted together.
    // ⚠ Measure the thing itself: a box drawn around a sprite is mostly the ground behind
    // it, and it will tell you your change did nothing.
    // ⚠ FINAL MATCH, ISOLATED PROPERLY. Diffing two renders INSIDE the sprite's own box
    // (so the sky boil cannot leak into the sample) gave leaves at (159,141,60) against
    // the painted neighbour's (185,168,61): blue already exact, warmth already close —
    // the whole remaining gap was BRIGHTNESS, ~26 in both red and green. Lifted here.
    garden:{ shade: [[36, 80, 42], [44, 92, 46], [52, 104, 50]],
             leaf:  [[86, 140, 64], [104, 158, 72], [122, 176, 82]],
             leaf2: [[104, 158, 72], [124, 178, 82], [146, 196, 92]],
             // ⚠ TRUNK: dark brown, from paintTree's own trunk ramp (#241408 → #a67a48,
             // mid ≈ #55341a). It had been lifted to (138,117,54) chasing a "painted
             // trunk" sample that turned out to be a LIT trunk beside the door — the
             // trunks these sprites actually stand among are dark.
             bark:  [82, 58, 40], rim: [236, 232, 150] },
  };

  function drawCypress(ctx, S) {
    var beat = S.beat == null ? 0 : S.beat;
    var x = S.x, base = S.y, span = S.h || 314, W = S.w || 46;
    var big = S.big !== false;
    var wseed = ((S.seed || 5) * 2246822519) & 0x7fffffff;
    var wn = function () { wseed = (wseed * 1103515245 + 12345) & 0x7fffffff; return wseed / 0x7fffffff; };
    // cheap value-noise stand-in for the plate's fbm — same job: break every edge
    var nz = function (a, b) { var v = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453; return v - Math.floor(v); };

    var half = function (y) {
      var t = (base - y) / span; if (t < 0 || t > 1) return 0;
      // ⚠ TAPER TO A POINT. The plate's profile bottoms out at 0.30*W, so the tree ended
      // on a BLUNT crown — fine inside a painting, but as a runtime sprite it read as a
      // flat-topped reed with a hard cut across it. The (1 - t^5) term takes the last
      // tenth of the height smoothly to nothing, which is what a cypress actually does.
      return W * (0.30 + 0.9 * Math.pow(t, 0.5) * (1 - Math.pow(t, 1.6)))
               * (1 - Math.pow(t, 2.4)) * (1 + nz(x / 26, y / 24) * 0.4);
    };
    // the WIND: amplitude climbs the tree, and the response lags behind it
    var sway = function (y) {
      var t = (base - y) / span; if (t < 0) t = 0; if (t > 1) t = 1;
      var still = Math.sin((base - y) / span * 2.1) * W * 0.16;      // the plate's own resting lean
      var gust = Math.sin((beat - t * 0.34) * 6.2832) * W * 0.30 * (S.gust == null ? 1 : S.gust) * Math.pow(t, 1.8);
      return still + gust;
    };
    ctx.save(); ctx.lineCap = 'round';
    var n = Math.round(W * span / (big ? 11 : 16));
    for (var i = 0; i < n; i++) {
      var y = base - span + wn() * span;
      var h = half(y); if (h < 1) continue;
      var cx = x + sway(y);
      var px = cx + (wn() * 2 - 1) * h;
      var t2 = nz(px / 22, y / 22);
      // ⚠ THE CYPRESS IS THE DARK ANCHOR that balances the Light — the whole page is
      // built on that contrast (chiaroscuro: the fire only blazes because this mass is
      // deep). The first runtime pass came out bright green and the balance collapsed.
      // Shadow flank stays near-navy; the lit flank is a DEEP green, not a fresh one.
      var PAL = TREEPAL[S.pal] || TREEPAL.night;
      var col;
      if (px > cx + h * 0.05) {                                       // shadow flank (most of it)
        col = PAL.shade[(t2 * 3) | 0] || PAL.shade[0];
      } else {                                                        // flank facing the light
        col = PAL.leaf[(t2 * 3) | 0] || PAL.leaf[1];
      }
      // FIRELIGHT RIM: the flank nearest the flame catches it, exactly as the baked
      // version did via column(). Without this the tree ignores the fire beside it.
      var rim = Math.max(0, 1 - Math.abs(px - (x - W * 0.55)) / (W * 1.5)) * Math.max(0, 1 - (base - y) / span * 0.7);
      // ⚠ HOW MUCH FIRELIGHT, set per tree by how far it actually stands from the flame.
      // At full strength this washed the whole left flank to pale straw — and the
      // cypress is THE DARK ANCHOR the fire blazes against, so a bright tree costs the
      // page its chiaroscuro. A tree 260px from the fire catches a rim; it does not glow.
      var lit = (S.lit == null ? 1 : S.lit) * 0.55;
      if (px < cx - h * 0.15) {
        col = [col[0] + (PAL.rim[0] - col[0]) * rim * lit,
               col[1] + (PAL.rim[1] - col[1]) * rim * lit,
               col[2] + (PAL.rim[2] - col[2]) * rim * lit];
      }
      var jl = (wn() - 0.5) * 22;
      ctx.strokeStyle = 'rgba(' + Math.max(0, Math.min(255, col[0] + jl | 0)) + ','
                                + Math.max(0, Math.min(255, col[1] + jl | 0)) + ','
                                + Math.max(0, Math.min(255, col[2] + jl | 0)) + ',' + (0.72 + wn() * 0.28).toFixed(2) + ')';
      var tipFade = Math.min(1, (1 - (base - y) / span) * 6 + 0.15);   // dissolve into the sky
      ctx.globalAlpha = Math.max(0.15, Math.min(1, tipFade));
      ctx.lineWidth = (big ? 3.4 : 2.6) * (1.1 - 0.65 * tUp) * (0.7 + wn() * 0.6);
      var ang = -Math.PI / 2 + (px - cx) * 0.016 + (nz(px / 18, y / 18) - 0.5) * 0.7;
      // ⚠ THE TIP. Fred: "the cut is too abrupt for the tree. see how it is for the
      // flame, give it a margin so the tree can have a tip." The flame tapers because
      // its marks get SHORTER and THINNER toward the point; this line did the reverse
      // — (0.7 + 0.5*t) makes a mark 1.2x LONGER at the crown than at the base, so the
      // tree ended in a blunt slab of full-length strokes. Now 1.25 -> 0.35 with height.
      var tUp = (base - y) / span;                       // 0 at the foot, 1 at the crown
      var L = (big ? 20 : 14) * (1.25 - 0.90 * tUp) * (0.7 + wn() * 0.6);
      ctx.beginPath();
      ctx.moveTo(px - Math.cos(ang) * L / 2, y - Math.sin(ang) * L / 2);
      ctx.lineTo(px + Math.cos(ang) * L / 2, y + Math.sin(ang) * L / 2);
      ctx.stroke();
    }
    // ⚠ NO TIP FAN HERE. I once drew five licking flames off the crown to answer
    // Fred's red-marker sketch; he circled them and said: "the trees now have a tip and
    // then another chopped tip like my drawing. it is not the point. the point is to
    // make the tree have one tip." Right — the drawing asked for ONE point, and the
    // profile below already tapers to it once the tree is drawn at its real height
    // (it was 314 tall in a box built for 184, which is what blunted it). A tree has
    // one tip. Anything added above the crown is a second one.
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  // ---- A BROADLEAF, THE OTHER TREE (Fred, Aug 2026) ----
  // "can these 2 trees be different artworks? having 2 of the same artwork is kind of
  //  lazy and it distracts the viewer." Two cypresses side by side were one drawing
  //  printed twice. So the far tree is a different KIND, not a reseeded copy: a trunk
  //  you can see, boughs that fork, and a crown of overlapping lobes instead of a
  //  flame column. Same hand as the cypress — same two-flank colour, same wind rig
  //  (amplitude climbing as t^1.8, response lagging behind it), same firelight rim —
  //  so it belongs to the picture while reading as another tree entirely.
  //  ⚠ Its crown stays majority GREEN: a child has to be able to name it.
  function drawBroadleaf(ctx, S) {
    var beat = S.beat == null ? 0 : S.beat;
    var x = S.x, base = S.y, span = S.h || 160, W = S.w || 34;
    var big = S.big !== false;
    var lit = (S.lit == null ? 1 : S.lit) * 0.55;
    var wseed = ((S.seed || 5) * 2246822519) & 0x7fffffff;
    var wn = function () { wseed = (wseed * 1103515245 + 12345) & 0x7fffffff; return wseed / 0x7fffffff; };
    var nz = function (a, b) { var v = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453; return v - Math.floor(v); };

    // the wind, identical in principle to the cypress: the foot barely moves, the crown
    // moves most, and the top lags behind the trunk
    var sway = function (t) {
      if (t < 0) t = 0; if (t > 1) t = 1;
      return Math.sin(t * 1.7) * W * 0.10
           + Math.sin((beat - t * 0.34) * 6.2832) * W * 0.26 * (S.gust == null ? 1 : S.gust) * Math.pow(t, 1.8);
    };
    var PAL = TREEPAL[S.pal] || TREEPAL.night;
    var flank = function (side, up, rim) {          // side: -1 lit .. +1 shadow
      var c = side > 0
        ? PAL.shade[(nz(up * 7.1, side * 3.3) * 3) | 0]
        : PAL.leaf2[(nz(up * 5.7, side * 2.9) * 3) | 0];
      if (!c) c = PAL.shade[2];
      // ⚠ FRED'S RULE, ON THE SWAYING TREES TOO: "the top part of the tree is kind of yellow,
      // and the bottom darker... there is a light source above!" `up` is already 0 at the
      // foot and 1 at the crown, so the rule costs two lines: warm and lift the crown, deepen
      // and cool the belly (red falls fastest, which is what leaves shadow blue-green rather
      // than merely dim). Same ramp the painted trees use in gen/engine.mjs paintTree.
      var _up = Math.max(0, Math.min(1, up));
      var _warm = Math.pow(_up, 2.2), _deep = Math.pow(1 - _up, 1.5);
      c = [c[0] + _warm * 74 - _deep * 40,
           c[1] + _warm * 62 - _deep * 32,
           c[2] - _warm * 8  - _deep * 14];
      if (rim > 0) c = [c[0] + (PAL.rim[0] - c[0]) * rim * lit,
                        c[1] + (PAL.rim[1] - c[1]) * rim * lit,
                        c[2] + (PAL.rim[2] - c[2]) * rim * lit];
      // ⚠ THE PAGE'S OWN LIGHT, WHICH THIS RENDERER OTHERWISE KNOWS NOTHING ABOUT.
      // Fred, still picking the swaying trees out after the palette matched: "i still can,
      // the color is different haha." He was right and the cause is structural, not a
      // tint: a PAINTED tree is built with `lightFn: gGlow`, so every leaf warms by how
      // near it stands to the door. This renderer has only a left/right flank and a `lit`
      // scalar — no idea where the page's light even is — so its leaves could never take
      // the gold that everything around them is standing in.
      // Measured on twoways: warmth (r-b) falls with distance from the door — painted at
      // d=169 reads 117, at d=371 reads 11. Interpolating, a tree at the sprite's d=235
      // should read ~82; it was reading 50. `warm` closes exactly that gap. It is a
      // per-sprite constant rather than a real light field because a sprite does not move
      // across the page: how deep it stands in the light is fixed when it is placed.
      // ⚠ WARM IT WITHOUT WHITENING IT. Mixing toward a pale cream did raise the warmth
      // number to the gradient's prediction and made the trees look MILKY — right by
      // arithmetic, wrong on the page, standing out the other way. Warmth is (r - b), so
      // lift the red and CUT THE BLUE; do not drag everything toward white. That buys the
      // same number while the leaf keeps its saturation.
      var wk = S.warm || 0;
      if (wk) c = [c[0] + (255 - c[0]) * wk * 0.62,
                   c[1] + (226 - c[1]) * wk * 0.28,
                   c[2] * (1 - wk * 0.80)];   // ⚠ blue cut harder: the leaf tell was b=81 against the painted leaves' b=62
      var jl = (wn() - 0.5) * 22;
      return 'rgba(' + Math.max(0, Math.min(255, c[0] + jl | 0)) + ','
                     + Math.max(0, Math.min(255, c[1] + jl | 0)) + ','
                     + Math.max(0, Math.min(255, c[2] + jl | 0)) + ',' + (0.74 + wn() * 0.26).toFixed(2) + ')';
    };
    ctx.save(); ctx.lineCap = 'round';

    // ---- THE TRUNK AND BOUGHS. A cypress hides its trunk; this one shows it, which is
    // most of why the two read as different trees at a glance.
    var forkT = 0.40;                                  // the trunk forks at 40% of the height
    var limb = function (t0, t1, x0, x1, w0, w1) {
      var segs = 7;
      for (var i = 0; i < segs; i++) {
        var a = i / segs, b = (i + 1) / segs;
        var ta = t0 + (t1 - t0) * a, tb = t0 + (t1 - t0) * b;
        var ax = x + x0 + (x1 - x0) * a + sway(ta), ay = base - span * ta;
        var bx = x + x0 + (x1 - x0) * b + sway(tb), by = base - span * tb;
        // warm bark with a lit left edge. At 44,36,52 the trunk vanished into the night
        // ground and the tree read as a floating bush — the visible trunk IS the thing
        // that distinguishes this species from the cypress, so it has to be seen.
        var v = 0.85 + wn() * 0.4;
        var bl = 1 + lit * 0.9 * (1 - a);
        ctx.strokeStyle = 'rgba(' + Math.min(255, PAL.bark[0] * v * bl | 0) + ',' + Math.min(255, PAL.bark[1] * v * bl | 0) + ','
                                  + Math.min(255, PAL.bark[2] * v | 0) + ',0.95)';
        var wdt = (w0 + (w1 - w0) * a) * (0.85 + wn() * 0.3);
        ctx.lineWidth = wdt;
        ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
        // ⚠ BARK, NOT A TUBE. Fred, once the canopy matched: "change the branch to be
        // similar." The painted trees run their trunk through a five-stop ramp
        // (#241408 → #a67a48 in gen/engine.mjs paintTree) with texture strokes over it;
        // this drew every segment in ONE colour times a small jitter, so it came out a
        // smooth plastic tube — the last thing giving the sprite away at a glance.
        // Three strokes per segment, off the same ramp, laid ALONG the limb and offset
        // across it: the trunk gets light and dark down its length like real bark.
        var nxq = -(by - ay), nyq = (bx - ax), nlq = Math.sqrt(nxq * nxq + nyq * nyq) || 1;
        for (var q = 0; q < 3; q++) {
          var m = [0.44, 0.68, 1.04, 1.30][(wn() * 4) | 0];
          var off = (wn() - 0.5) * wdt * 0.74;
          ctx.strokeStyle = 'rgba(' + Math.min(255, PAL.bark[0] * m * bl | 0) + ','
                                    + Math.min(255, PAL.bark[1] * m * bl | 0) + ','
                                    + Math.min(255, PAL.bark[2] * m | 0) + ',0.85)';
          ctx.lineWidth = wdt * 0.26;
          ctx.beginPath();
          ctx.moveTo(ax + nxq / nlq * off, ay + nyq / nlq * off);
          ctx.lineTo(bx + nxq / nlq * off, by + nyq / nlq * off);
          ctx.stroke();
        }
      }
    };
    var tw = Math.max(2.6, W * (big ? 0.17 : 0.13));
    limb(0, forkT, 0, W * 0.04, tw, tw * 0.62);                       // the trunk
    limb(forkT, 0.80, W * 0.04, -W * 0.52, tw * 0.58, tw * 0.20);     // left bough
    limb(forkT, 0.86, W * 0.04, W * 0.46, tw * 0.55, tw * 0.18);      // right bough
    limb(forkT + 0.12, 0.92, W * 0.10, W * 0.02, tw * 0.40, tw * 0.16); // the leader

    // ---- THE CROWN, as overlapping LOBES. ⚠ A canopy is WIDE and its marks are
    // CLUMPS, not blades. The first attempt used near-vertical strokes inside narrow
    // lobes and came out as a second spiky column — the very thing Fred asked me to
    // stop drawing twice. So: lobes ranged around a broad ellipse, dabs angled through
    // the full circle, short and fat. A single ellipse would read as a lollipop; six
    // uneven lobes, each rocking on its own beat, read as a canopy breathing.
    var CY = -span * 0.72;
    var NL = big ? 7 : 6, lobes = [];
    for (var l = 0; l < NL; l++) {
      var a2 = (l / NL) * 6.2832 + wn() * 0.7;
      lobes.push({
        ox: Math.cos(a2) * W * (0.42 + wn() * 0.26),
        oy: CY + Math.sin(a2) * span * (0.07 + wn() * 0.05),
        rx: W * (0.42 + wn() * 0.26),
        ry: span * (0.10 + wn() * 0.06),
        ph: wn(),
      });
    }
    // ⚠ THE STYLE IS JUST MORE, SMALLER MARKS. Fred, circling a swaying tree beside a
    // painted one: "dont you see the difference in style/resolution?" — and then what he
    // actually wants: "all the trees like this pink tree, it MOVES, but in the style of the
    // black ring." The painted trees lay ~800 leaf marks about 2px wide; this laid ~250 dabs
    // at 4.2px, which is why it read as smooth flat blobs. Nothing else about it was wrong.
    var n = Math.round(W * span / (big ? 2.6 : 3.4));
    for (var i2 = 0; i2 < n; i2++) {
      var L = lobes[(wn() * NL) | 0] || lobes[0];
      var ang = wn() * 6.2832, rad = Math.sqrt(wn());
      var lx = L.ox + Math.cos(ang) * L.rx * rad;
      var ly = L.oy + Math.sin(ang) * L.ry * rad;
      var up = 1 + ly / span;                                        // ~0 foot .. 1 top
      // each lobe rocks on its own beat, on top of the trunk's sway — the crown is not
      // one rigid shape being translated
      var puff = Math.sin((beat + L.ph) * 6.2832) * W * 0.045;
      var mx = x + lx + sway(-ly / span) + puff;
      var my = base + ly + Math.cos((beat + L.ph) * 6.2832) * span * 0.009;
      var side = lx / Math.max(1, W * 0.9);
      var rim = Math.max(0, 1 - Math.abs(lx + W * 0.55) / (W * 1.7)) * 0.9;
      // the underside of the crown keeps its own shadow: light falls on top of a tree
      var und = Math.max(0, (ly - CY) / Math.max(1, span * 0.16));
      ctx.strokeStyle = flank(side + und * 0.8, up, rim * (1 - und * 0.7));
      ctx.lineWidth = (big ? 1.9 : 1.6) * (0.7 + wn() * 0.7);
      var len = (big ? 4.6 : 3.8) * (0.6 + wn() * 0.9);
      var dir = wn() * 6.2832;                                       // dabs, not blades
      ctx.beginPath();
      ctx.moveTo(mx - Math.cos(dir) * len / 2, my - Math.sin(dir) * len / 2);
      ctx.lineTo(mx + Math.cos(dir) * len / 2, my + Math.sin(dir) * len / 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  // ---- THE CORD, DRAWN LIVE (Fred, Aug 2026) ----
  // "the top of the string should attach to the back of the protagonist. this is why it
  //  would be amazing if the string could animate."
  // Exactly the reason it had to leave the plate. A painted cord ends where the child
  // WAS; this one is redrawn each frame and ends where he IS — the same bezier the plate
  // used, from the same hand, but with its tip carried to wherever the whip has thrown
  // him. The belly follows the tip (a cord under tension bows toward its moving end), so
  // it never reads as a stiff wire being dragged about.
  // Painted, not stroked flat: a dark under-cord first, then the gold over it, both in
  // short jittered marks — the plate laid it down the same way, and a smooth vector line
  // beside all that brushwork would look like a different tool.
  function drawTether(ctx, S) {
    var beat = S.beat == null ? 0 : S.beat;
    var hand = S.hand, tie = S.tie, c1 = S.c1, c2 = S.c2;
    var wseed = ((S.seed || 3) * 2246822519) & 0x7fffffff;
    var wn = function () { wseed = (wseed * 1103515245 + 12345) & 0x7fffffff; return wseed / 0x7fffffff; };
    // where the tip is on this frame — the SAME displacement the child is riding
    var ph = beat * Math.PI * 2;
    var dx = Math.cos(ph) * (S.amp || 0), dy = Math.sin(ph) * (S.amp || 0) * 0.8;
    // ⚠ RUN THE TIP PAST THE TIE. Fred: "the cord's tip should always be covered by the
    // protagonist's back." A cord that stops exactly at the tie leaves its end-cap on
    // show the moment anything shifts by a pixel; carried a little way INTO him, the end
    // is always under his body and what you see is a cord disappearing behind a back.
    // ⚠ AIM THE TIP AT THE ROTATION AXIS. Fred: "i can still see the cord tip on some
    // animation frame." The cause is not length but AIM: he turns, so any point on him
    // except the axis swings away from whatever was covering it, and the tip peeks out
    // on the frames where a thin part of him is passing over it. The axis is the one
    // point on a rotating body that never moves relative to it — end there and the tip
    // can never be uncovered, at any angle. `overlap` is the reach past the tie that
    // lands on it (tie y+12 = the knot at the small of his back).
    // ⚠ EXTEND ALONG THE CORD, NOT STRAIGHT DOWN. `over` used to add to y, which only
    // buries the tip if the body happens to be BELOW the tie — and on the string page he
    // hangs above it, so every increase pushed the end further away from him. Continue
    // the cord's own incoming direction instead, and it always runs INTO whatever it is
    // tied to, whichever way that is.
    var over = S.overlap == null ? 12 : S.overlap;
    var _ix = tie[0] - c2[0], _iy = tie[1] - c2[1];
    var _il = Math.hypot(_ix, _iy) || 1;
    var TX = tie[0] + dx + (_ix / _il) * over, TY = tie[1] + dy + (_iy / _il) * over;
    var C1 = [c1[0] + dx * 0.15, c1[1] + dy * 0.15];     // the hand end barely answers
    var C2 = [c2[0] + dx * 0.62, c2[1] + dy * 0.62];     // the belly follows the tip
    // ⚠ IT MUST COME OUT OF THE HAND, not sit on top of it. Fred: "how do we make the
    // string attach to the light figure below?" A beam that simply STARTS at the grip
    // puts a round bright cap over the painted hand and reads as a separate object laid
    // there. So the curve begins a little way INSIDE the grip, and (see `endFade` below)
    // the light fades to nothing across that stretch — what you see is a cord emerging
    // out of the Light's own radiance, which is where it comes from.
    var IN = S.into == null ? 10 : S.into;
    var H0 = [hand[0], hand[1] + IN];
    var at = function (t) {
      var u = 1 - t;
      return [u * u * u * H0[0] + 3 * u * u * t * C1[0] + 3 * u * t * t * C2[0] + t * t * t * TX,
              u * u * u * H0[1] + 3 * u * u * t * C1[1] + 3 * u * t * t * C2[1] + t * t * t * TY];
    };
    // how present the light is along its length: nothing at the hand (it is being born
    // out of the glow there), full through the body, easing off as it enters his back
    var endFade = function (t) {
      var a = Math.min(1, Math.max(0, (t - 0.02) / 0.16));      // out of the hand
      var b = Math.min(1, Math.max(0, (0.995 - t) / 0.05));     // into his back
      return a * a * (3 - 2 * a) * (b * b * (3 - 2 * b));
    };
    // ⚠ AND IT MUST HAVE A MATERIAL. Fred: "how do we make the cord looks like it is
    // painted as well? it looks like an object outside of the scene, same problem we had
    // before in garden." Right — a perfectly even beam has no paint in it. Everything
    // else on this plate is a brush loaded and spent, so the light is loaded and spent
    // too: its body swells and thins along its length. Stable (no beat term), so it reads
    // as the mark's own weight rather than as flicker.
    var body = function (t) { return 0.74 + 0.26 * Math.sin(t * 9.3 + (S.seed || 3) * 1.7)
                                          + 0.10 * Math.sin(t * 21.0 + 2.1); };
    // ---- THE WAVE THAT RUNS DOWN THE LINE ----
    // ⚠ The first version had this backwards: the ripple was biggest at t=0 — THE HAND —
    // and died to nothing at the free end. A cord is pinned at the hand and pinned to his
    // back, so it cannot move at either end; it snakes hardest in the MIDDLE, like a
    // skipping rope. And the wave has to TRAVEL, or the cord just breathes in place.
    // It also has to push PERPENDICULAR to the cord — the old fixed diagonal made the
    // whole line slide sideways instead of bending.
    // ⚠ FIRM, NOT FLOPPY. Fred: "make the cord less wiggly and a bit more firm because
    // this is God's cord after all." Right, and it is the page's whole claim — "the
    // string never snaps". A rope that snakes like a loose washing line reads as slack;
    // this one is under tension. So: a much smaller amplitude, a LONG single bow rather
    // than a train of ripples, and the second harmonic nearly gone — the wind bends it,
    // it does not flap it.
    var AMP = S.wave == null ? 5.5 : S.wave;
    var pts = [];
    for (var t = 0; t <= 0.9801; t += 0.02) {   // a hair short of the axis, so the end is INSIDE his mass, not at its edge
      var p = at(t);
      var q = at(Math.min(1, t + 0.02));                      // the local tangent
      var tx = q[0] - p[0], ty = q[1] - p[1];
      var tl = Math.hypot(tx, ty) || 1;
      var nx = -ty / tl, ny = tx / tl;                         // its normal — a wave bends across
      var env = Math.sin(Math.PI * t);                         // zero at BOTH pinned ends
      var wv = Math.sin(t * 6.2832 * 1.05 - beat * 6.2832) * 1.0
             + Math.sin(t * 6.2832 * 2.2 - beat * 6.2832 * 2) * 0.16;   // barely a second kink
      // ⚠ NO PER-POINT NOISE. A hand-painted cord wants its points jittered; a BLADE
      // does not — noise here puts a ripple in the beam's own edge and it stops reading
      // as light. The path is a smooth analytic curve; all the life is in the wave.
      var w = wv * env * AMP;
      pts.push([p[0] + nx * w, p[1] + ny * w]);
    }
    // ---- A WIGGLY LIGHTSABER (Fred, Aug 2026) ----
    // "can the string have no outline and just be light? like a wiggly lightsaber."
    // That is a precise brief, and a blade of light is built the opposite way round from
    // a painted line. A painted line is a colour with an edge. A blade is a WHITE-HOT
    // CENTRE that is blown out past its own colour, wrapped in saturated glow, wrapped in
    // bloom — so what your eye finds at the middle is not gold, it is white, and the gold
    // only appears as you move away from it. Every pass is additive, so the passes SUM at
    // the centre and it goes white by arithmetic rather than by being painted white.
    //
    // ⚠ AND A BLADE IS CLEAN. The per-segment jitter that made the old cord look
    // hand-painted is gone: each pass is now ONE continuous path through every point, so
    // the edge is smooth. The wiggle stays — it is in the PATH, not in the strokes. That
    // is what "wiggly lightsaber" means: a clean beam following a bending line.
    //
    // shadowBlur does the bloom properly (a real falloff rather than a stack of fat
    // translucent lines). It is affordable because these six drawings are rendered once
    // into a frame sheet, not redrawn every tick.
    // A GLOW has no edge, so it is drawn as one continuous path — but the BODY of the
    // light is drawn mark by mark, each with its own weight, the way every other stroke
    // on this plate was made. Overlapping and round-capped, so it still reads as one
    // clean beam and not as a chain of dashes: painterly up close, a blade at a glance.
    var beam = function (col, lw, a, blur, painted) {
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      if (blur) { ctx.shadowColor = 'rgba(' + col[0] + ',' + col[1] + ',' + col[2] + ',0.9)'; ctx.shadowBlur = blur; }
      else { ctx.shadowBlur = 0; }
      if (!painted) {
        ctx.strokeStyle = 'rgba(' + col[0] + ',' + col[1] + ',' + col[2] + ',' + a + ')';
        ctx.lineWidth = lw;
        ctx.beginPath();
        ctx.moveTo(pts[0][0], pts[0][1]);
        for (var i = 1; i < pts.length; i++) {
          var f = endFade(i / (pts.length - 1));
          if (f < 0.02) { ctx.moveTo(pts[i][0], pts[i][1]); continue; }
          ctx.lineTo(pts[i][0], pts[i][1]);
        }
        ctx.stroke();
        return;
      }
      for (var k = 0; k < pts.length - 1; k++) {
        var t0 = k / (pts.length - 1);
        var fd = endFade(t0); if (fd < 0.02) continue;
        var bw = body(t0);
        ctx.strokeStyle = 'rgba(' + col[0] + ',' + col[1] + ',' + col[2] + ',' + (a * fd * (0.7 + bw * 0.3)).toFixed(3) + ')';
        ctx.lineWidth = lw * bw * fd;
        ctx.beginPath();
        ctx.moveTo(pts[k][0], pts[k][1]);
        ctx.lineTo(pts[k + 1][0], pts[k + 1][1]);
        ctx.stroke();
      }
    };
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    // ⚠ WIDTHS MATTER AS MUCH AS THE PASSES. At 1-4 units on an 800-wide plate this was
    // a glowing THREAD, and a thread does not read as a blade however well it is lit. A
    // saber is wide enough to have an inside: bloom, blade, body, hot edge, white core,
    // each visibly nested in the next.
    beam([84, 52, 8],    24, 0.11, 18, false);   // the air around it glowing
    beam([150, 98, 16],  13, 0.19, 9,  false);   // the outer blade
    beam([226, 166, 44],  6.8, 0.34, 0, true);   // its saturated body — laid down as marks
    beam([255, 232, 168], 3.4, 0.60, 0, true);   // the hot inner edge
    beam([255, 255, 255], 1.7, 0.95, 0, true);   // the white centre, blown past its own colour
    ctx.shadowBlur = 0;
    ctx.restore();
  }

  // ---- A GUST OF LEAVES (Fred, Aug 2026) ----
  // "add gust of leaves? it is a storm after all." Torn off and carried — so they do not
  // flap in place like the flock, they TRAVEL across the frame and tumble as they go.
  // Two envelopes keep it honest:
  //  · LIFE — each leaf fades up, crosses, and fades out over its own travel, so the
  //    loop's wrap-around is never seen. Nothing pops into or out of existence.
  //  · EDGE — and it fades again near the box's own bounds, because this is a wide
  //    overlay and a leaf clipped in half by an invisible rectangle is the exact seam
  //    that betrayed the old sky layer.
  // Each leaf is a lens of two curved strokes (a real leaf shape, not a dot) and spins
  // on its own axis as it goes, because a leaf in wind never travels flat.
  function drawLeafGust(ctx, S) {
    var beat = S.beat == null ? 0 : S.beat;
    var W = S.w || 800, H = S.h || 300, N = S.n || 26;
    var ang = S.dir == null ? Math.PI : S.dir;          // where the wind is taking them
    var span = S.span || W * 1.25;                      // how far one leaf travels per loop
    var seed = ((S.seed || 17) * 2246822519) & 0x7fffffff;
    var rn = function () { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
    var COLS = S.cols || [[36, 68, 40], [52, 92, 48], [86, 112, 44], [124, 116, 52], [150, 96, 44]];
    var smooth = function (t) { t = t < 0 ? 0 : t > 1 ? 1 : t; return t * t * (3 - 2 * t); };
    var cs = Math.cos(ang), sn = Math.sin(ang);
    ctx.save(); ctx.lineCap = 'round';
    for (var i = 0; i < N; i++) {
      var x0 = rn() * W, y0 = rn() * H;
      var ph = rn(), sp = 0.7 + rn() * 0.6;
      var life = (beat * sp + ph) % 1;
      var d = span * life;
      var px = x0 + cs * d, py = y0 + sn * d + Math.sin(life * 6.2832 * 2 + ph * 6.2832) * H * 0.05;
      // wrap inside the box so the field never empties out
      px = ((px % W) + W) % W; py = ((py % H) + H) % H;
      var a = Math.sin(life * Math.PI) * (0.55 + rn() * 0.45);
      a *= smooth(Math.min(px, W - px) / (W * 0.10)) * smooth(Math.min(py, H - py) / (H * 0.16));
      if (a <= 0.02) continue;
      var c = COLS[(rn() * COLS.length) | 0] || COLS[0];
      var r = (2.2 + rn() * 2.6) * (S.scale || 1);
      var spin = (ph + beat * (1.6 + rn())) * 6.2832;   // tumbling as it flies
      var ux = Math.cos(spin), uy = Math.sin(spin);
      ctx.strokeStyle = 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a.toFixed(3) + ')';
      ctx.lineWidth = r * 0.72;
      // the two curved halves of a leaf, bowed away from its spine
      for (var k = -1; k <= 1; k += 2) {
        ctx.beginPath();
        ctx.moveTo(px - ux * r, py - uy * r);
        ctx.quadraticCurveTo(px - uy * r * 0.62 * k, py + ux * r * 0.62 * k, px + ux * r, py + uy * r);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  // ---- WATER (Fred, Aug 2026) ----
  // Water is the one surface that is never still, and ours was. What moves on water is
  // not the water — it is the LIGHT ON IT: flat horizontal lenses that lengthen, slide a
  // little and go out. So the marks are strictly horizontal (a vertical mark on water
  // reads as a stick), they only ever drift ALONG the surface, and they are additive,
  // because a highlight adds light to what is under it rather than covering it.
  function drawRipple(ctx, S) {
    var beat = S.beat == null ? 0 : S.beat;
    var W = S.w || 400, H = S.h || 100, N = S.n || 26;
    var seed = ((S.seed || 23) * 2246822519) & 0x7fffffff;
    var rn = function () { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
    var COLS = S.cols || [[255, 250, 226], [232, 240, 250], [255, 236, 190]];
    var smooth = function (t) { t = t < 0 ? 0 : t > 1 ? 1 : t; return t * t * (3 - 2 * t); };
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
    for (var i = 0; i < N; i++) {
      var y = rn() * H, x0 = rn() * W, ph = rn();
      var life = (beat + ph) % 1;
      // ⚠ FARTHER UP THE BAND IS FARTHER AWAY: shorter lenses, slower drift, dimmer.
      // Without that a distant ripple is the same size as a near one and the water reads
      // as a vertical wall rather than a surface going away from you.
      var dep = y / Math.max(1, H);
      var x = x0 + Math.sin((life + ph) * 6.2832) * W * (0.010 + 0.022 * dep);
      var len = (6 + rn() * 26) * (0.35 + 0.65 * dep);
      var a = Math.sin(life * Math.PI) * (0.20 + rn() * 0.30) * (0.45 + 0.55 * dep);
      a *= smooth(Math.min(x, W - x) / (W * 0.10)) * smooth(Math.min(y, H - y) / (H * 0.22));
      if (a <= 0.02) continue;
      var c = COLS[(rn() * COLS.length) | 0] || COLS[0];
      ctx.strokeStyle = 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a.toFixed(3) + ')';
      ctx.lineWidth = (0.8 + rn() * 1.5) * (0.5 + 0.8 * dep);
      ctx.beginPath(); ctx.moveTo(x - len / 2, y); ctx.lineTo(x + len / 2, y); ctx.stroke();
    }
    ctx.restore();
  }

  // ---- THE ROAD'S OWN LIGHT, TRAVELLING (Fred, Aug 2026) ----
  // A lit road on these plates is not decoration — it is the way home, and on `garden`
  // it is the Light walking up it toward a child who is hiding. So the gleam does not
  // twinkle in place: it RUNS ALONG the path, from the near end toward the far one, and
  // the road is faintly lit the whole time so it never goes dark between passes.
  // The path is the plate's OWN control points, handed in — not a curve I invented that
  // happens to sit near the painted road.
  function drawSpine(ctx, S) {
    var beat = S.beat == null ? 0 : S.beat;
    var pts = S.pts || [];
    if (pts.length < 2) return;
    var W0 = S.w0 == null ? 7 : S.w0, W1 = S.w1 == null ? 2 : S.w1;
    var col = S.col || [255, 234, 170];
    // cumulative length, so the pulse travels at a constant SPEED rather than jumping
    // through the short segments and crawling through the long ones
    var seg = [], total = 0;
    for (var i = 1; i < pts.length; i++) {
      var d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
      seg.push(total); total += d;
    }
    seg.push(total);
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    var pass = function (mul, alpha, blur) {
      if (blur) { ctx.shadowColor = 'rgba(' + col[0] + ',' + col[1] + ',' + col[2] + ',0.9)'; ctx.shadowBlur = blur; }
      else ctx.shadowBlur = 0;
      for (var k = 0; k < pts.length - 1; k++) {
        var t = seg[k] / Math.max(1, total);
        // distance from the travelling pulse, wrapped — a gaussian so it has a soft head
        var d2 = ((t - beat) % 1 + 1) % 1; if (d2 > 0.5) d2 = 1 - d2;
        var puls = Math.exp(-(d2 * d2) / (2 * 0.055 * 0.055));
        var a = alpha * (0.28 + 0.72 * puls);          // never fully dark: it is a lit road
        ctx.strokeStyle = 'rgba(' + col[0] + ',' + col[1] + ',' + col[2] + ',' + a.toFixed(3) + ')';
        ctx.lineWidth = (W0 + (W1 - W0) * t) * mul;
        ctx.beginPath(); ctx.moveTo(pts[k][0], pts[k][1]); ctx.lineTo(pts[k + 1][0], pts[k + 1][1]); ctx.stroke();
      }
    };
    pass(2.6, 0.10, 12);   // the glow it throws on the ground
    pass(1.0, 0.26, 0);    // the lit road itself
    pass(0.42, 0.42, 0);   // the bright centre of it
    ctx.shadowBlur = 0; ctx.restore();
  }

  // ---- THE FIRST LIGHT, AS A RIG (Fred, Aug 2026) ----
  // "rather than making the background that glows, why dont you animate the amazing
  //  graphic you have made." That is the garden model stated plainly: the garden is not
  //  alive because its plate breathes, it is alive because its FIRE is a rig. Page 1's
  //  graphic is a piercing star struck in an immense dark — so the star is the thing that
  //  should move, and nothing else on the page needs to.
  //  A star does not wobble and it does not drift: it BREATHES ALONG ITS OWN SPIKES.
  //  Each spike reaches and draws back on its own beat, the long cross slower than the
  //  fine ones between, so the shape never pulses as a single unit — which would read as
  //  a blink, the fault this whole week was made of.
  //  Built the way the cord is built: no outline, additive, a white centre blown past its
  //  own colour, because it is made of light and light has no edge.
  /* ---- THE FIRST LIGHT — a RIG, not a boil (Fred, Aug 6) ----
     "i was thinking of having a static image, and then we have transparent layer on top
     with other brush strokes that animates. kind of like the fire we made."
     That is the garden's lesson said again: the painting holds still and an OBJECT lives
     on top of it. The fire works because it is a thing made of the plate's own marks —
     not scribbles laid over the art — and light is the same kind of thing.
     So: lances of brushwork that are BORN at the star and travel OUTWARD, thinning and
     cooling as they go, with the next already behind them (John 1:5, "the light
     SHINETH" — present, continuous). Each lance is a run of round-capped marks along its
     own ray, exactly the way the plate lays its strokes, from the plate's own gold ramp.
     Nothing here rotates the painting or doubles a mark: the plate underneath never moves.
     ⚠ Drawn with 'lighter' — a thing made of light ADDS to what is behind it, and that is
     also what keeps it from reading as an object sitting on the picture. */
  function drawFirstLight(ctx, S) {
    var beat = S.beat == null ? 0 : S.beat;
    var W = S.w, H = S.h, cx = W / 2, cy = H / 2;
    var K = S.k || 12;                              // lances in flight at once
    var R0 = S.r0 || 16, R1 = S.r1 || Math.min(W, H) * 0.52;
    var seed = ((S.seed || 3) * 2246822519) & 0x7fffffff;
    var wn = function () { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
    // the plate's own ladder: white-hot at the source, gold, then dying into the deep
    // ⚠ NO PURE WHITE except at a lance's very head. Additive white over painted gold
    // reads as a lens flare — a thing from another medium laid on the picture.
    var RAMP = [[255, 250, 232], [253, 238, 196], [248, 218, 142], [232, 186, 90],
                [192, 144, 60], [116, 88, 50]];
    var col = function (t, a) {
      t = Math.max(0, Math.min(0.999, t)) * (RAMP.length - 1);
      var i = t | 0, f = t - i, c0 = RAMP[i], c1 = RAMP[Math.min(RAMP.length - 1, i + 1)];
      var j = (wn() - 0.5) * 30;                    // per-mark jitter, like the plate's jig()
      return 'rgba(' + Math.max(0, Math.min(255, (c0[0] + (c1[0] - c0[0]) * f + j) | 0)) + ','
                     + Math.max(0, Math.min(255, (c0[1] + (c1[1] - c0[1]) * f + j) | 0)) + ','
                     + Math.max(0, Math.min(255, (c0[2] + (c1[2] - c0[2]) * f + j * 0.5) | 0)) + ','
                     + a.toFixed(3) + ')';
    };
    var mark = function (mx, my, ang, L, w2, c) {
      ctx.strokeStyle = c; ctx.lineWidth = w2; ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(mx - Math.cos(ang) * L / 2, my - Math.sin(ang) * L / 2);
      ctx.lineTo(mx + Math.cos(ang) * L / 2, my + Math.sin(ang) * L / 2);
      ctx.stroke();
    };
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (var i = 0; i < K; i++) {
      // a fixed angle per lance, dealt once from the seed so the fan never reshuffles;
      // the plate's fan leans down-right, so this one does too
      var a0 = (i / K) * Math.PI * 2 + wn() * 0.22 + 0.35;
      var lean = 1 + 0.10 * Math.cos(a0 * 2);       // 4-fold variation in reach: a hand's fan, with no side favoured
      var ph = (i * 0.6180339887) % 1;              // golden spacing: no two arrive together
      var u = (beat + ph) % 1;                      // 0 born at the source .. 1 gone
      var life = Math.sin(u * Math.PI);             // fades in and out, so nothing pops
      if (life <= 0.03) continue;
      var head = R0 + (R1 * lean - R0) * u;         // the head only ever travels OUTWARD
      var span = (R1 * 0.30) * (0.55 + 0.45 * life);// the lance's own length
      var nM = Math.max(3, Math.round(span / 13));   // fewer, fatter marks — the plate's are lozenges, not lines
      for (var m = 0; m < nM; m++) {
        var t = m / (nM - 1);                       // 0 head .. 1 tail
        var r = head - span * t;
        if (r < R0 * 0.7) continue;
        var wob = (wn() - 0.5) * 0.045;             // the hand's wobble, not a machine's spoke
        var ang = a0 + wob;
        // ...and set a hair off its own ray, so the run of marks reads as a painted
        // stroke rather than a ruled spoke
        var off = (wn() - 0.5) * 7;
        var mx = cx + Math.cos(ang) * r - Math.sin(ang) * off,
            my = cy + Math.sin(ang) * r + Math.cos(ang) * off;
        var far = Math.min(1, (r - R0) / (R1 - R0));
        var w2 = (5.5 + 10.5 * (1 - far)) * (0.6 + 0.7 * life) * (0.75 + wn() * 0.5);
        var a2 = 0.20 * life * (1 - t * 0.75) * (1 - far * 0.85);   // wider marks add more light, so each one gives less
        mark(mx, my, ang, 15 + 23 * (1 - far), w2, col(0.18 + far * 0.75, a2));
      }
      // a bright dab at the head — the light's leading edge, brightest thing in the lance
      var hx = cx + Math.cos(a0) * head, hy = cy + Math.sin(a0) * head;
      var hf = Math.min(1, (head - R0) / (R1 - R0));
      mark(hx, hy, a0, 13, 6.0 + 7.0 * (1 - hf), col(0.02 + hf * 0.5, 0.26 * life * (1 - hf * 0.8)));
    }
    ctx.restore();
  }

  function drawStarburst(ctx, S) {
    var beat = S.beat == null ? 0 : S.beat;
    var cx = S.w / 2, cy = S.h / 2;
    var R = S.r || 46;
    var seed = ((S.seed || 11) * 2246822519) & 0x7fffffff;
    var wn = function () { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
    var COL = S.col || [255, 246, 214];
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    // ---- THE HALO (de-baked from the plate, so it travels with the star) ----
    // Klimt gold hugging the source: four rings, each laid down as a run of short arcs of
    // wandering width and colour, never a drawn circle. Under everything else.
    if (S.halo !== false) {
      for (var hr = 0; hr < 4; hr++) {
        var rad = R * (0.52 + hr * 0.36), seg = 22 + hr * 6;
        for (var hs = 0; hs < seg; hs++) {
          if (wn() < 0.22) continue;                 // gaps: a hand does not close a ring
          var a1 = (hs / seg) * 6.2832 + (S.tilt || 0) * 0.5, a2h = ((hs + 1.1) / seg) * 6.2832 + (S.tilt || 0) * 0.5;
          ctx.strokeStyle = 'rgba(' + (232 + ((wn() * 22) | 0)) + ',' + (188 + ((wn() * 40) | 0)) + ','
                          + (96 + ((wn() * 46) | 0)) + ',' + (0.10 + wn() * 0.10).toFixed(3) + ')';
          ctx.lineWidth = 1.4 + wn() * 2.6;
          ctx.beginPath();
          ctx.arc(cx, cy, rad * (0.97 + wn() * 0.06), a1, a2h);
          ctx.stroke();
        }
      }
    }
    // ---- ⚠ IT MUST LOOK PAINTED (Fred, Aug 6: "make it seem like the starburst is also
    // painted"). The old arm was seven collinear segments of one flat colour with an 18px
    // bloom behind it — which is a lens flare, the signature of a different medium sitting
    // on top of an oil painting. The plate makes an arm out of LOZENGES: each mark its own
    // width, its own colour off a gold ramp, set a hair off the axis, overlapping its
    // neighbour. So does this now, and the bloom is a separate, much softer pass rather
    // than a halo welded to every stroke.
    var GOLD = [[255, 252, 238], [255, 244, 206], [250, 226, 152], [238, 196, 104], [206, 158, 74]];
    var gcol = function (t, a) {
      t = Math.max(0, Math.min(0.999, t)) * (GOLD.length - 1);
      var i = t | 0, f = t - i, c0 = GOLD[i], c1 = GOLD[Math.min(GOLD.length - 1, i + 1)];
      var j = (wn() - 0.5) * 26;                    // the plate's jig(): no two marks alike
      return 'rgba(' + Math.max(0, Math.min(255, (c0[0] + (c1[0] - c0[0]) * f + j) | 0)) + ','
                     + Math.max(0, Math.min(255, (c0[1] + (c1[1] - c0[1]) * f + j) | 0)) + ','
                     + Math.max(0, Math.min(255, (c0[2] + (c1[2] - c0[2]) * f + j * 0.6) | 0)) + ','
                     + a.toFixed(3) + ')';
    };
    var spike = function (ang, len, w, a, blur) {
      if (blur) { ctx.shadowColor = 'rgba(' + COL[0] + ',' + COL[1] + ',' + COL[2] + ',0.55)'; ctx.shadowBlur = blur * 0.55; }
      else ctx.shadowBlur = 0;
      var N = 9;
      for (var i = 0; i < N; i++) {
        var t0 = i / N, t1 = (i + 1.35) / N;        // marks OVERLAP, the way laid paint does
        var f = 1 - t0 * 0.86;
        var off = (wn() - 0.5) * w * 1.9;           // a hair off the axis
        var wob = (wn() - 0.5) * 0.05;              // and a hair off true
        var a2 = ang + wob;
        var nx = -Math.sin(a2) * off, ny = Math.cos(a2) * off;
        ctx.strokeStyle = gcol(0.10 + t0 * 0.85, a * f * (0.75 + wn() * 0.5));
        ctx.lineWidth = Math.max(0.6, w * f * (0.7 + wn() * 0.85));
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a2) * len * t0 + nx, cy + Math.sin(a2) * len * t0 + ny);
        ctx.lineTo(cx + Math.cos(a2) * len * t1 + nx, cy + Math.sin(a2) * len * t1 + ny);
        ctx.stroke();
      }
    };
    // ---- ⚠ THE CROSS IS HELD. It does not breathe with the rest ----
    // Fred: "make one overlay that stays there, at a higher opacity (especially the cross
    // in the middle)." So the four long arms get a STATIC pass first — same length in
    // every drawing, at a strong opacity — and the breathing pass is laid over it. The
    // cross is therefore always at full strength however the loop turns, and only the
    // reaching is animated. On this page of all pages that is the right emphasis: the
    // shape at the centre of the first light is a cross, and it should not flicker.
    var hold = S.hold == null ? 0.55 : S.hold;
    for (var hk = 0; hk < 4; hk++) {
      var ah = hk * Math.PI / 2 + (S.tilt || 0);
      spike(ah, R * 1.85, 4.2, hold * 0.42, 14);   // the glow it holds on the dark
      spike(ah, R * 1.85, 2.0, hold * 0.85, 0);    // the arm itself
      spike(ah, R * 1.85, 0.9, hold, 0);           // its bright spine
    }
    // and the breath over the top — the arms reaching a little past the held cross
    for (var k = 0; k < 4; k++) {
      var a4 = k * Math.PI / 2 + (S.tilt || 0);
      var b4 = 0.80 + 0.30 * Math.sin((beat + k * 0.13) * 6.2832);
      spike(a4, R * 1.85 * b4, 3.6, 0.30, 10);
      spike(a4, R * 1.85 * b4, 1.7, 0.55, 0);
      spike(a4, R * 1.85 * b4, 0.8, 0.85, 0);
    }
    // the finer rays between, each on its own quicker beat
    for (var j = 0; j < 12; j++) {
      var aj = (j / 12) * 6.2832 + 0.26 + (S.tilt || 0);
      var bj = 0.62 + 0.44 * Math.sin((beat * 1.7 + j * 0.31) * 6.2832);
      spike(aj, R * (0.62 + (j % 3) * 0.18) * bj, 1.5, 0.22, 6);
      spike(aj, R * (0.62 + (j % 3) * 0.18) * bj, 0.7, 0.42, 0);
    }
    // the core: a small steady heart that only just breathes, so the star has a centre
    // to be pierced FROM. Without it the spikes look like they start from nothing.
    // ⚠ AND THE HEART IS A KNOT OF DABS, not three clean discs. A perfect circle is the
    // one shape a brush never makes; the plate paints its core as a crowd of short marks
    // turning about the centre, so this does the same and only the innermost is white.
    var cb = 0.92 + 0.12 * Math.sin(beat * 6.2832);
    ctx.shadowColor = 'rgba(' + COL[0] + ',' + COL[1] + ',' + COL[2] + ',0.5)';
    ctx.shadowBlur = 10;
    for (var q = 0; q < 26; q++) {
      var qa = wn() * 6.2832, qr = Math.pow(wn(), 0.6) * R * 0.30 * cb;
      var qx = cx + Math.cos(qa) * qr, qy = cy + Math.sin(qa) * qr;
      var t3 = qr / (R * 0.30 * cb);
      ctx.strokeStyle = t3 < 0.35 ? 'rgba(255,255,255,' + (0.55 + wn() * 0.35).toFixed(2) + ')'
                                  : gcol(t3 * 0.7, 0.30 + wn() * 0.3);
      ctx.lineWidth = R * (0.10 - t3 * 0.05) * (0.7 + wn() * 0.7);
      var ta = qa + 1.5708;                          // marks turn ABOUT the heart, as the plate's do
      ctx.beginPath();
      ctx.moveTo(qx - Math.cos(ta) * R * 0.06, qy - Math.sin(ta) * R * 0.06);
      ctx.lineTo(qx + Math.cos(ta) * R * 0.06, qy + Math.sin(ta) * R * 0.06);
      ctx.stroke();
    }
    ctx.shadowBlur = 0;
    ctx.restore();
  }

  // ---- GRASS IN THE WIND (Fred: the grass slower still) ----
  // Same wind law as the tree — anchored at the root, moving most at the tip — but a
  // BANK of blades rather than one mass, and the crucial difference: each blade's
  // phase is delayed by its x, so a gust visibly TRAVELS across the bank instead of
  // every blade leaning at once. That travelling wave is the thing that reads as wind.
  function drawGrass(ctx, S) {
    var beat = S.beat == null ? 0 : S.beat;
    var W = S.w || 300, H = S.h || 40, N = S.n || 150;
    var wseed = ((S.seed || 23) * 2246822519) & 0x7fffffff;
    var wn = function () { wseed = (wseed * 1103515245 + 12345) & 0x7fffffff; return wseed / 0x7fffffff; };
    var COLS = S.cols || [[26, 74, 56], [34, 96, 62], [46, 118, 70], [72, 142, 78]];
    ctx.save(); ctx.lineCap = 'round';
    for (var i = 0; i < N; i++) {
      var bx = wn() * W;
      // ⚠ leave a GAP where something stands in the grass. A full-width band ran
      // straight through the fire, so blades sprouted out of the flame and read as
      // grass growing in front of a bonfire (Fred: "some grass become below the fire").
      if (S.gap && bx > S.gap[0] && bx < S.gap[1]) continue;
      var bh = H * (0.45 + wn() * 0.75);
      // the gust travels: phase delayed by position across the bank
      var gust = Math.sin((beat - (bx / W) * 0.55) * 6.2832) * bh * 0.30
               + Math.sin((beat * 1.7 - (bx / W) * 0.9) * 6.2832) * bh * 0.09;   // a second, quicker ripple
      var lean = (wn() - 0.5) * bh * 0.22;
      var c = COLS[(wn() * COLS.length) | 0];
      var jl = (wn() - 0.5) * 34;
      ctx.strokeStyle = 'rgba(' + Math.max(0, Math.min(255, c[0] + jl | 0)) + ','
                                + Math.max(0, Math.min(255, c[1] + jl | 0)) + ','
                                + Math.max(0, Math.min(255, c[2] + jl | 0)) + ',' + (0.6 + wn() * 0.4).toFixed(2) + ')';
      ctx.lineWidth = 1.4 + wn() * 2.4;
      // a blade is a CURVE, not a line: straight at the root, bending toward the tip
      ctx.beginPath();
      ctx.moveTo(bx, H);
      ctx.quadraticCurveTo(bx + (lean + gust) * 0.28, H - bh * 0.55, bx + lean + gust, H - bh);
      ctx.stroke();
    }
    ctx.restore();
  }

  // ---- THE SKY, FLOWING (Fred: "make the sky animate very slow") ----
  // The sky is NOT de-baked — it is the largest thing on the page and re-rendering it
  // per frame would be enormous for no gain. Instead the motion goes OVER the painted
  // sky: a fixed set of marks in the sky's own palette that TRAVEL along a curl field,
  // fading in as they set out and out as they arrive. The baked swirls stay exactly as
  // painted; what moves is a drift of paint across them, which is what a Van Gogh sky
  // looks like when it finally breathes.
  // ⚠ The marks are STABLE (wn) and only their POSITION advances with the beat. Re-
  // scattering them per frame would shimmer like static — the opposite of "very slow".
  // ---- THE SKY (Fred, Aug 2026) ----
  // "you are just adding bunnies... if there are nothing to animate try animating the
  //  sky." Right — the sky is the largest thing on nearly every plate and it has been
  //  dead the whole time. Two rules make a full-frame overlay safe, and this is why it
  //  sat unwired for two days:
  //   1. IT MUST DISSOLVE AT EVERY EDGE. Marks that stop at the sprite's bounds draw a
  //      hard rectangle across the painting — the exact seam Fred photographed on
  //      desktop. Both axes now feather over a quarter of the box with a smoothstep,
  //      so there is no line anywhere for the eye to catch.
  //   2. IT MUST BE MADE OF THE PLATE'S OWN COLOURS. A hard-coded palette suits one
  //      page and lies on all the others. The caller samples the real painting and
  //      hands the colours in (see samplePalette in scene.js) — so this one function
  //      animates a cobalt night and a peach dawn without knowing which it is on.
  //  What moves is AIR, not paint: each mark drifts a few percent of the frame along
  //  the sky's own curl, fading in and out over its travel, at very low opacity. The
  //  slowest thing on the page (24s), per the tempo ladder.
  function drawSkyDrift(ctx, S) {
    var beat = S.beat == null ? 0 : S.beat;
    var W = S.w || 800, H = S.h || 300, N = S.n || 110;
    var wseed = ((S.seed || 13) * 2246822519) & 0x7fffffff;
    var wn = function () { wseed = (wseed * 1103515245 + 12345) & 0x7fffffff; return wseed / 0x7fffffff; };
    var nz = function (a, b) { var v = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453; return v - Math.floor(v); };
    var SKYC = (S.cols && S.cols.length) ? S.cols
             : [[26, 44, 96], [34, 58, 118], [52, 62, 132], [74, 74, 140], [150, 168, 210], [214, 226, 240]];
    var smooth = function (t) { t = t < 0 ? 0 : t > 1 ? 1 : t; return t * t * (3 - 2 * t); };
    // ⚠ A DARK PLATE NEEDS A STRONGER MARK for the same perceived change. `in the
    // beginning` is nearly black, and at the bright pages' settings its sky animated at
    // 0.5% of pixels with a peak change of 7/255 — technically moving, visibly dead.
    // Measure the palette we were handed and answer it.
    var lum = 0;
    for (var q = 0; q < SKYC.length; q++) lum += (SKYC[q][0] * 0.30 + SKYC[q][1] * 0.59 + SKYC[q][2] * 0.11);
    lum /= Math.max(1, SKYC.length);
    var dark = lum < 62 ? 2 : lum < 110 ? 1 : 0;
    var aBoost = dark === 2 ? 2.1 : dark === 1 ? 1.4 : 1;
    var adAmt  = dark === 2 ? 30 : dark === 1 ? 20 : 13;
    ctx.save(); ctx.lineCap = 'round';
    for (var i = 0; i < N; i++) {
      var x0 = wn() * W, y0 = wn() * H;
      var speed = 0.5 + wn() * 0.9;
      var life = (beat * speed + wn()) % 1;              // where this mark is in its travel
      // ⚠ THE SKY GOES THE WAY THE WIND GOES. It used to drift on pure noise, which is
      // motion without meaning; now the curl it was painted with only BENDS a drift
      // that runs along the page's own wind, and a hard gust carries it further.
      var dir = S.dir == null ? 1 : S.dir;
      var ang = (nz(x0 / 90, y0 / 70) - 0.5) * 1.1 + (dir > 0 ? 0.18 : Math.PI - 0.18);
      var travel = W * 0.048 * life * (0.55 + 0.75 * (S.gust == null ? 1 : S.gust));
      var px = x0 + Math.cos(ang) * travel;
      var py = y0 + Math.sin(ang) * travel * 0.55;
      var fade = Math.sin(life * Math.PI);               // in at the start, out at the end
      // ⚠ THE EDGES. A quarter of the box on every side is a ramp to nothing.
      fade *= smooth(Math.min(py, H - py) / (H * 0.26)) * smooth(Math.min(px, W - px) / (W * 0.24));
      if (fade <= 0.004) continue;
      var ci = wn(); var c = SKYC[(ci * ci * SKYC.length) | 0] || SKYC[0];
      // ⚠ PUSH THE VALUE. Sampling the sky and painting it straight back changes
      // nothing where the sky is even — measured 1% movement on `ran` against 22% on
      // `turning`, purely because that plate's colours are uniform. Each mark now runs
      // a little lighter or darker than what it drifts over, so it reads as light
      // moving through the air while staying in the plate's own hues.
      // ⚠ ADDITIVE AS WELL AS MULTIPLICATIVE. A 0.80x/1.22x push does nothing to
      // near-black, so `in the beginning` — the darkest plate in the book — animated at
      // 0.5% of pixels, which is dead. A fixed offset in the same direction guarantees
      // the mark separates from what it drifts over on ANY ground, dark or bright.
      var up = wn() < 0.5 ? -1 : 1;
      var vp = up > 0 ? 1.22 : 0.80, ad = up * adAmt;
      c = [Math.max(0, Math.min(255, c[0] * vp + ad)),
           Math.max(0, Math.min(255, c[1] * vp + ad)),
           Math.max(0, Math.min(255, c[2] * vp + ad))];
      var jl = (wn() - 0.5) * 26;
      ctx.strokeStyle = 'rgba(' + Math.max(0, Math.min(255, c[0] + jl | 0)) + ','
                                + Math.max(0, Math.min(255, c[1] + jl | 0)) + ','
                                + Math.max(0, Math.min(255, c[2] + jl | 0)) + ',' + (Math.min(0.55, fade * (0.11 + wn() * 0.19) * aBoost)).toFixed(3) + ')';   // ⚠ raised: at 0.06 the sky animated invisibly, which is the same as not animating
      ctx.lineWidth = 4 + wn() * 9;
      var L = 22 + wn() * 38;
      ctx.beginPath();
      ctx.moveTo(px - Math.cos(ang) * L / 2, py - Math.sin(ang) * L / 2);
      ctx.lineTo(px + Math.cos(ang) * L / 2, py + Math.sin(ang) * L / 2);
      ctx.stroke();
    }
    ctx.restore();
  }


  // ---- THE CROSS-STARS, TWINKLING (Fred) ----
  // "the star twinkle is not what i mean, the sky should be calm. i was thinking of
  //  twinkling the cross shape star"
  // Right — 46 scattered dots pulsing everywhere makes a busy sky, which is the
  // opposite of calm. The plate already has NAMED stars, two of them great ones the
  // whole sky curves around. Those are what should breathe. So this draws a glint on
  // the plate's OWN star positions, each on its own slow phase, and nothing else.
  // Positions mirror `stars` in gen/plates/garden.mjs.
  function drawCrossStars(ctx, S) {
    var beat = S.beat == null ? 0 : S.beat;
    var STARS = S.stars || [];
    ctx.save(); ctx.lineCap = 'round';
    for (var i = 0; i < STARS.length; i++) {
      var st = STARS[i];
      var ph = (i * 0.37) % 1;                                  // its own rhythm
      var tw = 0.5 + 0.5 * Math.sin((beat + ph) * 6.2832);
      var big = st[2] >= 12;
      // a SLOW swell, never a blink: even at its dimmest the star is still there
      var a2 = (big ? 0.34 : 0.22) + tw * (big ? 0.44 : 0.30);
      var r = st[2] * (0.20 + tw * 0.10);
      ctx.fillStyle = 'rgba(255,252,238,' + a2.toFixed(2) + ')';
      ctx.beginPath(); ctx.arc(st[0], st[1], r, 0, 6.2832); ctx.fill();
      // the CROSS — the shape Fred means. It lengthens as the star swells.
      var gl = st[2] * (0.9 + tw * 1.5);
      ctx.strokeStyle = 'rgba(255,250,232,' + (a2 * 0.62).toFixed(2) + ')';
      ctx.lineWidth = Math.max(0.6, r * 0.5);
      ctx.beginPath();
      ctx.moveTo(st[0] - gl, st[1]); ctx.lineTo(st[0] + gl, st[1]);
      ctx.moveTo(st[0], st[1] - gl); ctx.lineTo(st[0], st[1] + gl);
      ctx.stroke();
      if (big) {                                                // the two great ones get diagonals
        var d2 = gl * 0.52;
        ctx.strokeStyle = 'rgba(255,248,222,' + (a2 * 0.34).toFixed(2) + ')';
        ctx.lineWidth = Math.max(0.5, r * 0.32);
        ctx.beginPath();
        ctx.moveTo(st[0] - d2, st[1] - d2); ctx.lineTo(st[0] + d2, st[1] + d2);
        ctx.moveTo(st[0] + d2, st[1] - d2); ctx.lineTo(st[0] - d2, st[1] + d2);
        ctx.stroke();
      }
    }
    ctx.restore();
  }


  // a fuzzy little BEE — striped body, round wings, a friendly face + antennae.
  function drawBee(ctx, S) {
    var s = S.s || 1, x = S.x, y = S.y, f = S.facing || 1;
    // the wings BLUR (too fast to read as shape) but the body BANKS — that tilt is
    // what makes a bee look like it is flying rather than being dragged along a path
    var beat = S.beat == null ? 0 : S.beat;
    ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(beat * 6.2832) * 0.30 * f); ctx.translate(-x, -y);
    var wsp = 0.55 + Math.abs(Math.cos(beat * 6.2832)) * 0.85;   // wing spread, blurring
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    ctx.fillStyle = 'rgba(255,255,255,.5)';
    ctx.beginPath(); ctx.ellipse(x - 1.5 * s, y - 4.5 * s, 3.4 * s * wsp, 2.2 * s, -0.5, 0, 6.2832); ctx.fill();
    ctx.beginPath(); ctx.ellipse(x + 2.5 * s, y - 4.5 * s, 3.4 * s * wsp, 2.2 * s, 0.5, 0, 6.2832); ctx.fill();
    ctx.fillStyle = '#c89020'; ctx.beginPath(); ctx.ellipse(x, y + 0.7 * s, 6.4 * s, 4.6 * s, 0, 0, 6.2832); ctx.fill();
    celE(ctx, x, y, 6 * s, 4.2 * s, 0, '#f2c838', '#c89020', '#fbe28e');
    ctx.fillStyle = '#33281a';
    for (var i = -1; i <= 1; i++) { ctx.beginPath(); ctx.ellipse(x + i * 2.6 * s, y, 0.85 * s, 3.6 * s, 0, 0, 6.2832); ctx.fill(); }
    ctx.beginPath(); ctx.arc(x + f * 5.6 * s, y, 2.5 * s, 0, 6.2832); ctx.fill();   // head
    ctx.fillStyle = '#1b1013'; ctx.beginPath(); ctx.arc(x + f * 6.2 * s, y - 0.6 * s, 0.7 * s, 0, 6.2832); ctx.fill();
    ctx.strokeStyle = '#33281a'; ctx.lineWidth = 0.7 * s;
    ctx.beginPath(); ctx.moveTo(x + f * 6 * s, y - 2 * s); ctx.quadraticCurveTo(x + f * 8.5 * s, y - 5 * s, x + f * 7.5 * s, y - 6.5 * s); ctx.stroke();
    ctx.restore();
  }
  // a gentle SNAIL — a spiral shell, a soft foot + head, two eye-stalks. Slow + happy.
  function drawSnail(ctx, S) {
    var s = S.s || 1, x = S.x, y = S.y, f = S.facing || 1;
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    ctx.fillStyle = '#a8875a'; ctx.beginPath(); ctx.ellipse(x, y + 1.6 * s, 10 * s, 3.4 * s, 0, 0, 6.2832); ctx.fill();
    ctx.fillStyle = '#cbaa7c';
    celE(ctx, x, y, 9.5 * s, 3.4 * s, 0, '#cbaa7c', '#a8875a', '#e8d0a8');   // foot
    ctx.beginPath(); ctx.ellipse(x + f * 8 * s, y - 3 * s, 3.2 * s, 4 * s, f * 0.3, 0, 6.2832); ctx.fill();  // head
    var scx = x - f * 2 * s, scy = y - 3.5 * s;
    ctx.fillStyle = '#a8632e'; ctx.beginPath(); ctx.arc(scx, scy, 7.4 * s, 0, 6.2832); ctx.fill();
    celE(ctx, scx, scy, 6.6 * s, 6.6 * s, 0, '#d88a44', '#a8632e', '#f0c580');
    ctx.fillStyle = '#f0c580'; ctx.beginPath(); ctx.arc(scx - 1.8 * s, scy - 1.8 * s, 2.5 * s, 0, 6.2832); ctx.fill();
    ctx.strokeStyle = '#a8632e'; ctx.lineWidth = 1.1 * s; ctx.beginPath();
    for (var a = 0.5; a < 11; a += 0.3) { var rr = 0.58 * s * a; ctx.lineTo(scx + Math.cos(a * f) * rr, scy + Math.sin(a * f) * rr); } ctx.stroke();
    var hx = x + f * 9 * s, hy = y - 5 * s;
    ctx.strokeStyle = '#cbaa7c'; ctx.lineWidth = 1.5 * s;
    ctx.beginPath(); ctx.moveTo(hx - f * 1 * s, hy); ctx.lineTo(hx - f * 1.5 * s, hy - 5 * s); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(hx + f * 1 * s, hy); ctx.lineTo(hx + f * 2 * s, hy - 4.5 * s); ctx.stroke();
    ctx.fillStyle = '#1b1013';
    ctx.beginPath(); ctx.arc(hx - f * 1.5 * s, hy - 5 * s, 1 * s, 0, 6.2832); ctx.fill();
    ctx.beginPath(); ctx.arc(hx + f * 2 * s, hy - 4.5 * s, 1 * s, 0, 6.2832); ctx.fill();
  }

  // ---- NEW TAPPABLE CRITTERS (static sprites; CSS gives idle motion, tap gives a gesture) ----
  // A PERCHED BIRD'S life is not flapping — it is STILLNESS punctuated by a flick.
  // S.beat drives a tail flick, a head turn and a small body bob; the frame sheet
  // holds mostly-identical frames so the creature sits still and then twitches.
  function drawBirdie(ctx, S) {
    var s = S.s || 1, x = S.x, y = S.y, f = S.facing || 1;
    var beat = S.beat == null ? 0 : S.beat;
    var w = beat * 6.2832;
    var bob = Math.sin(w) * 0.9 * s;                 // the body settles and lifts
    var tail = Math.sin(w + 0.9) * 0.30;             // the tail flicks
    var turn = Math.cos(w * 2) * 0.9 * s;            // the head glances about
    var B  = S.col === 'blue' ? '#5b8fd6' : S.col === 'red' ? '#e06a58' : '#f2c14e';
    var D  = S.col === 'blue' ? '#3f6fb0' : S.col === 'red' ? '#b84c40' : '#d99f2e';
    var L  = S.col === 'blue' ? '#8ab4e8' : S.col === 'red' ? '#f09484' : '#f8dc8a';
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    ctx.fillStyle = 'rgba(20,14,20,0.16)';           // the shadow stays PUT — only the bird moves
    ctx.beginPath(); ctx.ellipse(x, y + 9 * s, 8 * s, 2.2 * s, 0, 0, 6.2832); ctx.fill();
    ctx.save(); ctx.translate(0, bob);
    ctx.save(); ctx.translate(x - f * 6 * s, y); ctx.rotate(tail * f);   // tail pivots at the body
    ctx.strokeStyle = D; ctx.lineWidth = 3 * s;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-f * 7 * s, -2.5 * s); ctx.stroke();
    ctx.restore();
    celE(ctx, x, y, 8 * s, 7 * s, 0, B, D, L);                                     // body
    ctx.fillStyle = '#fff3d8'; ctx.beginPath(); ctx.ellipse(x - f * 1.5 * s, y + 2.2 * s, 4.2 * s, 4.4 * s, 0, 0, 6.2832); ctx.fill();
    celE(ctx, x + f * 2 * s, y - 0.5 * s, 5 * s, 3.8 * s, f * (0.4 + Math.max(0, Math.sin(w)) * 0.22), D,
         S.col === 'blue' ? '#2e5488' : S.col === 'red' ? '#8e3830' : '#b47e20', null);   // the wing lifts a little
    celE(ctx, x + f * 6 * s + turn, y - 5 * s, 5 * s, 4.8 * s, 0, B, D, L);        // head — it turns
    ctx.fillStyle = '#e8952e'; ctx.beginPath();
    ctx.moveTo(x + f * 10 * s + turn, y - 5.6 * s); ctx.lineTo(x + f * 14.5 * s + turn, y - 4.6 * s); ctx.lineTo(x + f * 10 * s + turn, y - 3.4 * s); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#1b1013'; ctx.beginPath(); ctx.arc(x + f * 7 * s + turn, y - 6 * s, 1.3 * s, 0, 6.2832); ctx.fill();
    ctx.restore();
  }
  // A RABBIT'S life is its EARS and its stillness. It sits, it listens, one ear
  // swivels, it dips to nibble — it does not bounce around. S.beat drives the ears
  // independently (they never move together — that is the whole tell) and a nibble dip.
  function drawRabbit(ctx, S) {
    var s = S.s || 1, x = S.x, y = S.y, f = S.facing || 1;
    var beat = S.beat == null ? 0 : S.beat, w = beat * 6.2832;
    var ear1 = Math.sin(w) * 0.34;                        // near ear swivels
    var ear2 = Math.sin(w * 2 + 1.7) * 0.22;              // far ear on its OWN rhythm
    var dip = Math.max(0, Math.sin(w - 1.2)) * 2.6 * s;   // the head dips to nibble
    var fur = S.col === 'brown' ? '#c8a878' : '#eae4d8';
    var furSH = S.col === 'brown' ? '#9a7c50' : '#c6bead', furLT = S.col === 'brown' ? '#e0c898' : '#fbf8f0';
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    ctx.fillStyle = 'rgba(20,14,20,0.16)'; ctx.beginPath(); ctx.ellipse(x, y + 10 * s, 11 * s, 2.4 * s, 0, 0, 6.2832); ctx.fill();
    celE(ctx, x, y + 1 * s, 10 * s, 8 * s, 0, fur, furSH, furLT);                 // body
    ctx.fillStyle = '#fffef8'; ctx.beginPath(); ctx.arc(x - f * 9 * s, y, 3.4 * s, 0, 6.2832); ctx.fill();   // tail puff
    var hx = x + f * 7 * s, hy = y - 5 * s + dip;
    // EARS pivot at the skull, each on its own angle
    [[5.5, 15, 2.4, 8, ear1], [10, 14, 2.4, 7.5, ear2]].forEach(function (e, i) {
      ctx.save();
      ctx.translate(x + f * e[0] * s, y - 6 * s + dip); ctx.rotate(e[4] * f);
      ctx.fillStyle = fur;
      ctx.beginPath(); ctx.ellipse(0, -(e[1] - 6) * s, e[2] * s, e[3] * s, f * 0.1, 0, 6.2832); ctx.fill();
      if (i === 0) { ctx.fillStyle = '#f0d6d0';
        ctx.beginPath(); ctx.ellipse(0, -(e[1] - 6) * s, 1.1 * s, e[3] * 0.68 * s, f * 0.1, 0, 6.2832); ctx.fill(); }
      ctx.restore();
    });
    celE(ctx, hx, hy, 5.6 * s, 5.6 * s, 0, fur, furSH, furLT);                    // head
    ctx.fillStyle = fur; ctx.beginPath(); ctx.ellipse(x + f * 4 * s, y + 8 * s, 3.4 * s, 2 * s, 0, 0, 6.2832); ctx.fill();
    ctx.fillStyle = '#1b1013'; ctx.beginPath(); ctx.arc(hx + f * 2 * s, hy - 0.5 * s, 1.3 * s, 0, 6.2832); ctx.fill();
    ctx.fillStyle = '#e69aa0'; ctx.beginPath(); ctx.arc(hx + f * 5 * s, hy + 1 * s, 1 * s, 0, 6.2832); ctx.fill();   // nose
  }
  function drawLadybug(ctx, S) {                // a round ladybird — cel dome, crisp spots
    var s = S.s || 1, x = S.x, y = S.y;
    var R  = S.col === 'gold' ? '#f0b83e' : '#e23b2e';
    var RS = S.col === 'gold' ? '#c08a24' : '#a82a20';
    var RL = S.col === 'gold' ? '#f8d883' : '#f07a64';
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    ctx.strokeStyle = '#1b1013'; ctx.lineWidth = 0.9 * s;
    for (var i = 0; i < 3; i++) { var yy = y - 3 * s + i * 3.4 * s; ctx.beginPath(); ctx.moveTo(x - 4 * s, yy); ctx.lineTo(x - 8.5 * s, yy - 1 * s); ctx.moveTo(x + 4 * s, yy); ctx.lineTo(x + 8.5 * s, yy - 1 * s); ctx.stroke(); }
    celE(ctx, x, y, 7 * s, 7 * s, 0, R, RS, RL);                                   // the dome
    ctx.strokeStyle = '#151015'; ctx.lineWidth = 1 * s;
    ctx.beginPath(); ctx.moveTo(x, y - 6.6 * s); ctx.lineTo(x, y + 6.6 * s); ctx.stroke();
    ctx.fillStyle = '#151015'; [[-3.4, -1.6], [3.4, -1.6], [-3, 3], [3, 3]].forEach(function (p2) { ctx.beginPath(); ctx.arc(x + p2[0] * s, y + p2[1] * s, 1.5 * s, 0, 6.2832); ctx.fill(); });
    ctx.beginPath(); ctx.arc(x, y - 6.5 * s, 3.2 * s, 0, 6.2832); ctx.fill();      // head
  }
  function drawDragonfly(ctx, S) {              // a hovering dragonfly, 4 gauzy wings
    var s = S.s || 1, x = S.x, y = S.y, f = S.facing || 1;
    var body = S.col === 'gold' ? '#e8b23e' : '#3fb0c0';
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    ctx.fillStyle = 'rgba(205,238,248,0.5)'; ctx.strokeStyle = 'rgba(120,170,190,0.55)'; ctx.lineWidth = 0.6 * s;
    [[-6, -3, -0.5], [6, -3, 0.5], [-5, 2, 0.45], [5, 2, -0.45]].forEach(function (w) { ctx.beginPath(); ctx.ellipse(x + w[0] * s, y + w[1] * s, 7 * s, 2.3 * s, w[2], 0, 6.2832); ctx.fill(); ctx.stroke(); });  // wings
    ctx.strokeStyle = body; ctx.lineWidth = 2.4 * s; ctx.beginPath(); ctx.moveTo(x - f * 2 * s, y - 1 * s); ctx.lineTo(x + f * 13 * s, y + 3 * s); ctx.stroke();   // long body
    ctx.fillStyle = body; ctx.beginPath(); ctx.arc(x - f * 3 * s, y - 2 * s, 2.4 * s, 0, 6.2832); ctx.fill();                                  // head
    ctx.fillStyle = '#12333a'; ctx.beginPath(); ctx.arc(x - f * 4 * s, y - 3 * s, 1 * s, 0, 6.2832); ctx.fill();                              // eye
  }

  /* ⚠ ONLY WHAT THE OPENING NEEDS, UP FRONT. Everything else follows once the book is
     built — see kidWarmAll. This one line was 1.98 MB of the first load. */
  try {
    kidPreload(kidCellsFor(0).concat(kidCellsFor(1), kidCellsFor(2)));
    /* ⚠ Sep 25 — NO LONGER THE WHOLE CAST AT LOAD. kidWarmAll ran 250 ms after load and fetched all
       41 drawings (3.0 MB) while a first-time reader was still looking at the cover — a third of the
       cold download, and wasted entirely on anyone who reads two pages and leaves. The scene engine
       now asks for the next few pages' cells every time a page settles (kidWarmAhead, below), and only
       once a reader has turned a few pages is the rest of the cast warmed in the background. */
  } catch (e) { }

  window.__charFactory = {
    drawPilgrim: drawPilgrim, drawRadiant: drawRadiant, drawHooded: drawHooded,
    drawKid: drawKid, kidPreload: kidPreload, kidCell: kidCell, kidPalFor: kidPalFor,
    drawKidBuilt: drawKidBuilt, drawKidRig: drawKidRig, drawKidMesh: drawKidMesh, onMeshReady: onMeshReady, meshReady: meshReady, onRigReady: onRigReady, rigReady: rigReady,
    kidReady: kidReady, onKidReady: onKidReady, kidCellsFor: kidCellsFor, kidWarm: kidPreload, kidWarmAhead: kidWarmAhead,
    drawTree: drawTree, drawBush: drawBush, drawCrown: drawCrown,
    drawFlower: drawFlower, drawSpout: drawSpout, drawBird: drawBird,
    drawSheep: drawSheep, drawLamp: drawLamp,
    drawWorm: drawWorm, drawMole: drawMole, drawBeetle: drawBeetle,
    drawFirefly: drawFirefly, drawFish: drawFish,
    drawTadpole: drawTadpole, drawButterfly: drawButterfly, drawBonfire: drawBonfire, drawCypress: drawCypress, drawBroadleaf: drawBroadleaf, drawTether: drawTether, drawLeafGust: drawLeafGust, drawRipple: drawRipple, drawSpine: drawSpine, drawStarburst: drawStarburst, drawFirstLight: drawFirstLight, drawSwimmer: drawSwimmer, drawCuteFish: drawCuteFish, drawWhale: drawWhale, drawSunSpiral: drawSunSpiral, drawBough: drawBough, drawSkyDrift: drawSkyDrift, drawCrossStars: drawCrossStars, drawGrass: drawGrass,
    drawBee: drawBee, drawSnail: drawSnail,
    drawBirdie: drawBirdie, drawRabbit: drawRabbit, drawLadybug: drawLadybug, drawDragonfly: drawDragonfly,
    CAST: __EP1 ? CAST1 : (/\/ep3\//.test(location.pathname) ? CAST3 : (/\/ep4\//.test(location.pathname) ? CAST4 : CAST)),
    SCENE: __EP1 ? SCENE1 : (/\/ep3\//.test(location.pathname) ? SCENE3 : (/\/ep4\//.test(location.pathname) ? SCENE4 : SCENE)), PALS: PALS,
  };
  window.__drawPilgrim = drawPilgrim; window.__drawRadiant = drawRadiant;   // (kept for the lab + debug stage)
  if (document.documentElement.hasAttribute('data-scene')) return;

  var CTX_FILTER_OK = (function () {
    try { var c = document.createElement('canvas').getContext('2d'); c.filter = 'blur(1px)'; return c.filter.indexOf('blur') !== -1; }
    catch (e) { return false; }
  })();
  var WOBX = [], WOBY = [];
  for (var wi = 0; wi < 400; wi++) {
    WOBX.push((fbm(wi * 0.31, 3.7, 401) - 0.5) * 4.6);
    WOBY.push((fbm(7.1, wi * 0.29, 409) - 0.5) * 4.2);
  }
  var TOOTH = (function () {
    var c = document.createElement('canvas'); c.width = 96; c.height = 96;
    var g = c.getContext('2d', { willReadFrequently: true });   // CPU tile — no GPU warm-up freeze
    for (var yy = 0; yy < 96; yy += 2) {
      for (var xx = 0; xx < 96; xx += 2) {
        var v = fbm(xx / 7, yy / 7, 421);
        var w = fbm(xx / 2.4, yy / 2.4, 431);
        if (w > 0.62) g.fillStyle = 'rgba(255,250,235,' + ((w - 0.62) * 0.5).toFixed(3) + ')';
        else if (w < 0.38) g.fillStyle = 'rgba(24,18,40,' + ((0.38 - w) * 0.5).toFixed(3) + ')';
        else continue;
        g.fillRect(xx + (v > 0.5 ? 1 : 0), yy, 2, 1.4);
      }
    }
    return c;
  })();
  var AMBIENT = {
    0: [22, 26, 60, 0.26], 1: [255, 240, 205, 0.09], 2: [20, 24, 56, 0.30],
    3: [16, 18, 44, 0.34], 4: [22, 26, 62, 0.22], 5: [18, 16, 48, 0.22],
    6: [255, 240, 210, 0.09], 7: [26, 26, 66, 0.24], 8: [22, 24, 62, 0.24],
    9: [46, 34, 78, 0.16], 10: [38, 30, 70, 0.24], 11: [255, 242, 200, 0.09],
    12: [16, 14, 44, 0.30], 13: [255, 238, 205, 0.10], 14: [255, 242, 205, 0.09],
  };
  var TOOTH_PAT = null;   // the tooth pattern is immutable — build it once, reuse every frame
  function unify(V, idx) {
    var ctx = V.ctx, buf = V.buf, W2 = V.cv.width, H2 = V.cv.height;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, W2, H2);
    // MELT: blur + band wobble (horizontal strips shifted, then vertical)
    if (CTX_FILTER_OK) ctx.filter = 'blur(0.45px)';
    var band = Math.max(4, Math.round(H2 / 130));
    for (var yb = 0, bi = 0; yb < H2; yb += band, bi++) {
      ctx.drawImage(buf, 0, yb, W2, band, WOBX[bi % 400], yb, W2, band);
    }
    ctx.filter = 'none';
    // (the second, vertical wobble pass was removed long ago — single-direction is
    //  enough. What it left behind was `ctx.drawImage(V.cv,0,0)` with op 'copy': the
    //  canvas copied onto ITSELF, a visual no-op that cost 61 of this function's 65 ms
    //  a frame, because a full-surface readback right after filtered blits stalls the
    //  GPU pipeline. Measured pixel-identical without it — hence deleted. Do not
    //  reintroduce a self-copy; if a vertical wobble is ever wanted, blit through a
    //  separate scratch canvas, never through V.cv.)
    // TOOTH: grain only where paint was laid
    ctx.save();
    ctx.globalCompositeOperation = 'source-atop';
    ctx.globalAlpha = 0.75;
    ctx.fillStyle = TOOTH_PAT || (TOOTH_PAT = ctx.createPattern(TOOTH, 'repeat'));   // built once, not per frame
    ctx.fillRect(0, 0, W2, H2);
    // GRADE: the page's ambient key
    var am = AMBIENT[idx];
    if (am) {
      ctx.globalAlpha = am[3];
      ctx.fillStyle = 'rgb(' + am[0] + ',' + am[1] + ',' + am[2] + ')';
      ctx.fillRect(0, 0, W2, H2);
    }
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  /* ================= views, mapping, pano-follow, the life loop ================= */
  var views = {}, raf = 0;
  var CLOSE = 60, HOLD = 55, OPEN = 85;

  function pageIndex() { return Math.round(book.scrollLeft / book.clientWidth); }

  function setupView(idx) {
    var data = CAST[idx], page = pages[idx];
    if (!data || !page) return null;
    var pic = page.querySelector('picture'), img = pic && pic.querySelector('img');
    var scrim = page.querySelector('.scrim');
    if (!img || !img.complete || !img.naturalWidth || !scrim) return null;
    var cv = page.querySelector('canvas.char');
    if (!cv) {
      cv = document.createElement('canvas');
      cv.className = 'char'; cv.setAttribute('aria-hidden', 'true');
      cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none';
      page.insertBefore(cv, scrim);
    }
    var portrait = (img.currentSrc || img.src).indexOf('-p.jpg') !== -1;
    var iw = portrait ? 1000 : 1600, ih = portrait ? 1600 : 1000;
    var vx0 = portrait ? data.fx0 : 0, vw = portrait ? 312 : 800;
    var w = page.clientWidth, h2 = page.clientHeight;
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = Math.round(w * dpr); cv.height = Math.round(h2 * dpr);
    var s = Math.max(w / iw, h2 / ih);
    var dw = iw * s, dh = ih * s;
    var buf = document.createElement('canvas');
    buf.width = cv.width; buf.height = cv.height;
    return {
      cv: cv, ctx: cv.getContext('2d'), buf: buf, bctx: buf.getContext('2d'), w: w, h: h2, page: page, dpr: dpr,
      ox: (w - dw) / 2, oy: (h2 - dh) / 2, vx0: vx0, S: dw / vw, sy: dh / 500,
      panoMode: false,
      actors: data.actors.map(function (a) {
        return {
          p: a,
          phase: Math.random() * 7,
          nextBlink: performance.now() + 1200 + Math.random() * 3800, blinkT0: 0,
          gaze: { x: 0, y: 0, tx: 0, ty: 0, next: performance.now() + 3000 + Math.random() * 4000 },
        };
      }),
      cleared: false,
    };
  }

  // adopt the pano canvas's box + camera so the characters ride the tilt
  function panoSync(V) {
    var pcv = V.page.querySelector('canvas.paint-live');
    if (!pcv || !pcv.width) return false;
    var cv = V.cv;
    if (!V.panoMode || cv.width !== pcv.width || cv.height !== pcv.height) {
      cv.width = pcv.width; cv.height = pcv.height;
      V.buf.width = pcv.width; V.buf.height = pcv.height;
      cv.style.cssText = 'position:absolute;pointer-events:none;left:' + pcv.offsetLeft + 'px;top:' + pcv.offsetTop + 'px;'
        + 'width:' + pcv.clientWidth + 'px;height:' + pcv.clientHeight + 'px;will-change:transform';
      V.panoMode = true;
    }
    cv.style.transform = pcv.style.transform || '';
    V.panoS = pcv.width / 800;
    return true;
  }

  function exitPano(V) {
    if (!V.panoMode) return;
    V.panoMode = false;
    var c = V.page.querySelector('canvas.char');
    if (c) c.remove();
    views = {}; // remap cleanly
  }

  function lidDepth(el) {
    if (el < 0) return 0;
    if (el < CLOSE) return el / CLOSE;
    if (window.__charHold) return 1;
    if (el < CLOSE + HOLD) return 1;
    if (el < CLOSE + HOLD + OPEN) return 1 - (el - CLOSE - HOLD) / OPEN;
    return -1;
  }

  var lastDraw = 0;
  function frame(now, force) {
    raf = 0;
    window.__charFrames = (window.__charFrames || 0) + 1;
    if (!force && document.visibilityState !== 'visible') return;
    if (!force && now - lastDraw < 28) { raf = requestAnimationFrame(frame); return; }   // 30fps is plenty for idle life
    lastDraw = now;
    var idx = pageIndex(), any = false;
    for (var k in views) {
      var V = views[k];
      if (!V) continue;
      if (+k !== idx) {
        if (!V.cleared) { V.ctx.setTransform(1, 0, 0, 1, 0, 0); V.ctx.clearRect(0, 0, V.cv.width, V.cv.height); V.cleared = true; }
        continue;
      }
      any = true;
      var pano = V.page.classList.contains('pano-on');
      if (pano) { if (!panoSync(V)) continue; }
      else if (V.panoMode) { exitPano(V); break; }
      var ctx = V.bctx;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, V.buf.width, V.buf.height);
      if (pano) ctx.setTransform(V.panoS, 0, 0, V.panoS, 0, 0);
      else ctx.setTransform(V.S * V.dpr, 0, 0, V.sy * V.dpr, (V.ox - V.vx0 * V.S) * V.dpr, V.oy * V.dpr);
      // the LIVING SCENE first — trees sway, birds fly — beneath the cast
      var sc = SCENE[+k];
      if (sc) {
        var st = now / 1000;
        if (sc.crowns) for (var ci = 0; ci < sc.crowns.length; ci++) drawCrown(ctx, sc.crowns[ci], st);
        if (sc.trees) for (var ti = 0; ti < sc.trees.length; ti++) drawTree(ctx, sc.trees[ti], st);
        if (sc.bushes) for (var ui = 0; ui < sc.bushes.length; ui++) drawBush(ctx, sc.bushes[ui], st);
        if (sc.flowers) for (var fi = 0; fi < sc.flowers.length; fi++) drawFlower(ctx, sc.flowers[fi], st);
        if (sc.spouts) for (var si = 0; si < sc.spouts.length; si++) drawSpout(ctx, sc.spouts[si], st);
        if (sc.birds) for (var bi = 0; bi < sc.birds.length; bi++) drawBird(ctx, sc.birds[bi], st);
      }
      for (var ai = 0; ai < V.actors.length; ai++) {
        var A = V.actors[ai], t = now / 1000 + A.phase;
        var isR = A.p.t === 'r';
        var anim = {
          breeze: Math.sin(t * 0.9) * 0.055 + Math.sin(t * 2.3) * 0.02,
          bobY: Math.sin(t * (isR ? 0.55 : 1.15)) * A.p.h * (isR ? 0.004 : 0.006),
          swayX: Math.sin(t * 0.6) * A.p.h * 0.003,
          gazeX: 0, gazeY: 0, lid: 0,
        };
        if (!isR && !A.p.back && A.p.mood !== 'joy') {
          if (now >= A.gaze.next) {
            A.gaze.tx = (Math.random() - 0.5) * (A.p.folk ? 0.2 : 0.55);
            A.gaze.ty = (Math.random() - 0.5) * 0.35;
            A.gaze.next = now + 2600 + Math.random() * 5200;
          }
          A.gaze.x += (A.gaze.tx - A.gaze.x) * 0.06;
          A.gaze.y += (A.gaze.ty - A.gaze.y) * 0.06;
          anim.gazeX = A.gaze.x; anim.gazeY = A.gaze.y;
          if (!A.blinkT0 && now >= A.nextBlink) A.blinkT0 = now;
          if (A.blinkT0) {
            var d = lidDepth(now - A.blinkT0);
            if (d < 0) { A.blinkT0 = 0; A.nextBlink = now + 2400 + Math.random() * 4400; }
            else anim.lid = d;
          }
        }
        if (isR) drawRadiant(ctx, A.p, anim);
        else {
          if (!A.p.wings) A.p.kidPal = kidPalFor(A.p, (A.p.x || 0) + (A.p.h || 0));
          if (A.p.wings || !drawKid(ctx, A.p, anim)) drawPilgrim(ctx, A.p, anim);
        }
      }
      unify(V, +k);
      V.cleared = false;
      if (REDUCED) any = false;
    }
    if (any) raf = requestAnimationFrame(frame);
    else setTimeout(start, 300);
  }

  function start() {
    var idx = pageIndex();
    if (CAST[idx] && !views[idx]) views[idx] = setupView(idx);
    if (!raf) raf = requestAnimationFrame(frame);
  }

  var rsT = 0;
  function onResize() {
    clearTimeout(rsT);
    rsT = setTimeout(function () {
      for (var k in views) if (views[k]) { var c = views[k].page.querySelector('canvas.char'); if (c) c.remove(); }
      views = {}; start();
    }, 150);
  }
  window.addEventListener('resize', onResize);
  window.addEventListener('orientationchange', onResize);
  book.addEventListener('scroll', function () { setTimeout(start, 60); }, { passive: true });
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible') start(); });

  window.__drawPilgrim = drawPilgrim; window.__drawRadiant = drawRadiant;   // debug stage
  // manual pump for headless/preview environments where rAF doesn't free-run
  // (the same reason paint-live exposes __paintTick)
  window.__charTick = function (t) {
    if (raf) { cancelAnimationFrame(raf); raf = 0; }
    frame(typeof t === 'number' ? t : performance.now(), true);
    return 'ticked';
  };
  window.__charState = function () {
    var o = { idx: pageIndex(), keys: Object.keys(views), raf: !!raf, reduced: REDUCED, frames: window.__charFrames || 0 };
    var V = views[pageIndex()];
    if (V) o.view = { cleared: V.cleared, pano: V.panoMode, S: V.S, actors: V.actors.length, w: V.cv.width };
    return JSON.stringify(o);
  };
  window.__charBlink = function () {
    var V = views[pageIndex()];
    if (!V) { start(); V = views[pageIndex()]; }
    if (!V) return 'no characters on this page';
    V.actors.forEach(function (A) { A.nextBlink = performance.now(); A.blinkT0 = 0; });
    start();
    return 'blinking';
  };

  var idle = window.requestIdleCallback || function (f) { setTimeout(f, 500); };
  if (document.readyState === 'complete') idle(start);
  else window.addEventListener('load', function () { idle(start); });
})();
