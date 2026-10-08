// gen/plates/library.mjs — "the library" — the site's bookshelf (balthazar.sh/index)
//
// JOHN 21:25 "…even the world itself could not contain the books that should
// be written." A lamplit wooden cabinet in a dark room. Two books are ALIVE —
// episode one (crimson, a gold sun) and episode two (violet, a ruby) — flanking
// the little lamp. Around them stand dim, half-real spines: the books not yet
// written. Tap a living book (HTML hotspots) to open its story.
//
// Munch's law: the cabinet is a MADE thing — straight lines; the lamp's light
// and the room's darkness are natural — curved. Chiaroscuro: one warm source,
// deep shadow everywhere else, the two hero spines brightest of all the books.
export const name = 'library';
export const title = 'the library';
export const caption = 'even the world itself could not contain the books.';
export const seed = 20260719;
export const focal = { x: 400, y: 268 };
// Fred's signature hides on the lamplit top rail — warm on warm, a whisper
export const sig = { x: 540, y: 79, h: 15, stroke: '#b98a4a', op: 0.32 };
// The index is a single STATIC plate — no depth planes (Fred: "you don't need to
// make it pannable, this is just an index"). The layer-tagging below is left in
// place (harmless) but no `layers` export means the build emits only the flat plate.

export function paint(E, opts = {}) {
  const {
    mulberry32, fbm, curlV, goldenSpiralV, lightRadial, setReliefLight, mix, ramp, jig,
    strokes, rej, inscriptionText, svgWrap, R1, W, H,
    GOLD, GOLD_PALE, GOLD_DEEP, GOLD_HOT, CHILD_RED,
  } = E;
  const paintPath = E.paintPath;

  const rng = mulberry32(seed);
  if (E.setManifold) E.setManifold(0.01);
  const out = [];
  const counter = { n: 0 };
  const LAYER = opts.layer || 'full';   // 'room' | 'cabinet' | 'books' | 'full'

  /* ====================== THE BONES ====================== */
  const LX = 418, LY = 180;                       // the lamp flame — on the TOP shelf, beside the living books
  const glow = lightRadial(LX, LY, 330);
  setReliefLight({ x: LX, y: LY });               // every wood-grain + spine mark shadows away from the lamp flame
  // cabinet frame
  // narrowed to fit the PORTRAIT window (244-556) so the phone sees the whole
  // cabinet, side planks and all — the books lean on the walls like real books
  const CAB = { x0: 246, x1: 554, y0: 70, y1: 460 };
  const SHELF = [210, 320, 430];                  // shelf board tops (bays above each)
  const inCab = (x, y) => x > CAB.x0 && x < CAB.x1 && y > CAB.y0 && y < CAB.y1;

  out.push(`<rect width="${W}" height="${H}" fill="#100c20"/>`);

  /* ====================== 1. THE DARK ROOM — night air curling about the lamp ====================== */
  strokes(out, counter, {
    rng, n: 850, sample: rej(-14, -14, 814, 514, (x, y) => !inCab(x, y)),
    dir: (x, y) => {
      let vx = 0, vy = 0;
      { const [a, b] = goldenSpiralV(x, y, LX, LY, 22, 260); vx += a; vy += b; }
      const [c, d] = curlV(x, y, 61, 130); vx += c * 26; vy += d * 26;
      return Math.atan2(vy, vx + 18);
    },
    col: (x, y, r) => {
      let c = ramp(['#0c0a1a', '#161226', '#221a34', '#2c2240'], fbm(x / 90, y / 70, 71) * 0.7 + 0.15);
      c = mix(c, '#8a5c2c', Math.pow(glow(x, y), 1.7) * 0.55);      // warm breath of the lamp on the dark
      return jig(c, r, 7);
    },
    len: 34, lw: 6.5, steps: 4, follow: 0.93, wild: 0.04, lenJ: 0.45, impasto: 0.45, relief: 0.4,
  });
  // floor — dark boards catching a little lamp-spill
  strokes(out, counter, {
    rng, n: 260, sample: rej(-14, 462, 814, 514),
    dir: () => 0.02,
    col: (x, y, r) => jig(mix(ramp(['#140c06', '#241408', '#38200c'], fbm(x / 60, y / 20, 77)), '#a06a30', glow(x, y) * 0.5), r, 6),
    len: 30, lw: 5, steps: 3, follow: 0.97, lenJ: 0.4, impasto: 0.4, relief: 0.45,
  });
  const roomEnd = out.length;   // ROOM plane: bg + night air + floor (backmost, opaque)

  /* ====================== 2. THE CABINET — a made thing, straight and true ====================== */
  const WOOD = ['#1c1008', '#3a2412', '#6a4522', '#9a6a38'];
  const woodCol = (x, y, r, boost = 0) => {
    let c = ramp(WOOD, fbm(x / 26, y / 90, 83) * 0.55 + 0.2 + boost);
    c = mix(c, '#f0c070', Math.pow(glow(x, y), 1.4) * 0.75);
    return jig(c, r, 6);
  };
  // back panel of the bays — a calm dark plane (solid fill + the faintest grain)
  out.push(`<rect x="${CAB.x0 + 10}" y="${CAB.y0 + 8}" width="${CAB.x1 - CAB.x0 - 20}" height="${CAB.y1 - CAB.y0 - 14}" fill="#1c1208"/>`); counter.n++;
  strokes(out, counter, {
    rng, n: 300, sample: rej(CAB.x0 + 10, CAB.y0 + 8, CAB.x1 - 10, CAB.y1 - 6),
    dir: () => Math.PI / 2,
    col: (x, y, r) => jig(mix(ramp(['#160c04', '#241608', '#2c1c0a'], fbm(x / 34, y / 70, 87)), '#6a4420', glow(x, y) * 0.45), r, 4),
    len: 30, lw: 6, steps: 3, follow: 0.99, wild: 0, aJ: 0.02, lenJ: 0.35, impasto: 0.2, relief: 0.15, op: 0.6,
  });
  // side planks (vertical)
  [[CAB.x0, CAB.x0 + 16], [CAB.x1 - 16, CAB.x1]].forEach(([a, b]) => {
    strokes(out, counter, {
      rng, n: 130, sample: rej(a, CAB.y0, b, CAB.y1),
      dir: () => Math.PI / 2,
      col: (x, y, r) => woodCol(x, y, r, 0.12),
      len: 30, lw: 5.5, steps: 3, follow: 0.99, wild: 0, aJ: 0.02, lenJ: 0.3, impasto: 0.5, relief: 0.55,
    });
  });
  // top + bottom rails and shelf boards (horizontal)
  const rails = [[CAB.y0, CAB.y0 + 14], [CAB.y1 - 12, CAB.y1]].concat(SHELF.map(sy => [sy, sy + 12]));
  rails.forEach(([a, b]) => {
    strokes(out, counter, {
      rng, n: 150, sample: rej(CAB.x0, a, CAB.x1, b),
      dir: () => 0.005,
      col: (x, y, r) => woodCol(x, y, r, 0.16),
      len: 34, lw: 5, steps: 3, follow: 0.99, wild: 0, aJ: 0.02, lenJ: 0.3, impasto: 0.55, relief: 0.6,
    });
  });

  /* ---- carpentry detail: cornice, feet, grain, lit edges, a knot ---- */
  // cornice — a wider crowning slab with a molding highlight
  strokes(out, counter, {
    rng, n: 120, sample: rej(CAB.x0 - 12, CAB.y0 - 14, CAB.x1 + 12, CAB.y0 - 2),
    dir: () => 0.004,
    col: (x, y, r) => woodCol(x, y, r, 0.2),
    len: 36, lw: 5, steps: 3, follow: 0.99, wild: 0, aJ: 0.02, lenJ: 0.3, impasto: 0.6, relief: 0.65,
  });
  out.push(`<rect x="${CAB.x0 - 12}" y="${CAB.y0 - 3}" width="${CAB.x1 - CAB.x0 + 24}" height="1.6" fill="${mix('#c89050', GOLD_PALE, 0.3)}" opacity="0.5"/>`); counter.n++;
  // little feet
  [[CAB.x0 - 6, CAB.x0 + 26], [CAB.x1 - 26, CAB.x1 + 6]].forEach(([a, b]) => {
    strokes(out, counter, {
      rng, n: 26, sample: rej(a, CAB.y1, b, CAB.y1 + 14),
      dir: () => Math.PI / 2,
      col: (x, y, r) => woodCol(x, y, r, 0.04),
      len: 10, lw: 4.5, steps: 2, follow: 0.99, lenJ: 0.3, impasto: 0.5, relief: 0.5,
    });
  });
  // wood grain — long wavering dark threads along each rail + the cornice
  const grainOn = (y0g, y1g, nLines) => {
    for (let gi = 0; gi < nLines; gi++) {
      const gy = y0g + (gi + 0.6) / (nLines + 0.2) * (y1g - y0g);
      const pts = [];
      for (let gx = CAB.x0 + 6; gx <= CAB.x1 - 6; gx += 22) pts.push([gx, gy + Math.sin(gx / 37 + gi * 2.1) * 1.7 + (rng() - 0.5)]);
      paintPath(out, counter, rng, pts, (x, y, r) => jig(mix('#170d05', '#5a3a18', glow(x, y) * 0.5), r, 4), { lw: 1.1, len: 9, density: 0.5, jitter: 0.5 });
    }
  };
  rails.forEach(([a, b]) => grainOn(a + 1, b - 1, 2));
  grainOn(CAB.y0 - 13, CAB.y0 - 3, 2);
  // a dark knot on the left side plank
  out.push(`<ellipse cx="${CAB.x0 + 8}" cy="196" rx="3.4" ry="5.2" fill="#170d05" opacity="0.8"/>`); counter.n++;
  out.push(`<ellipse cx="${CAB.x0 + 8}" cy="196" rx="1.6" ry="2.6" fill="#3a2410" opacity="0.9"/>`); counter.n++;
  // lamplit front edges under each shelf board — thin warm lines, brightest near the lamp
  SHELF.forEach(sy => {
    strokes(out, counter, {
      rng, n: 44, sample: rej(CAB.x0 + 4, sy + 10, CAB.x1 - 4, sy + 13),
      dir: () => 0.004,
      col: (x, y, r) => jig(mix('#6a4522', GOLD_PALE, Math.pow(glow(x, y), 1.2) * 0.85), r, 5),
      len: 18, lw: 1.8, steps: 2, follow: 0.99, lenJ: 0.3, relief: 0.3, op: 0.85,
    });
  });

  const cabFrameEnd = out.length;   // CABINET frame ends here; the lit books come next (nearer plane)

  /* ====================== 3. THE BOOKS ====================== */
  // a standing spine — DRAWN first (a solid committed shape: base fill, shaded
  // edge, lit edge), then a light stroke pass for tooth. Texture never replaces
  // the drawing.
  function spine(x0, x1, yBase, hgt, cols, o = {}) {
    const yTop = yBase - hgt, wd = x1 - x0;
    const lean = (o.leanA || 0) * hgt;            // top edge shifts by lean
    const gl = glow((x0 + x1) / 2, yBase - hgt / 2);
    const base = ramp(cols, 0.55), dk = ramp(cols, 0.12), lt = ramp(cols, 0.9);
    // WORN, not rigid: old books round at the corners, dome at the head, sag at
    // the tail, and bow along the spine — soft curves instead of ruler edges.
    // The warp is deterministic per book (from x0) so the body/shadow/lit strips
    // that share an edge stay glued together.
    const cr = Math.min(5, wd * 0.2);                    // rounded, bumped corners
    const dome = 2.6, sag = 2.0;                         // head bulges up, tail sags down
    const bowS = ((Math.round(x0) % 9) / 9 - 0.5) * 3.0; // the spine bows (warped with age), sign varies per book
    const P = (dx0, dx1, fill, op2) => {
      const LtX = x0 + dx0 + lean, RtX = x0 + dx1 + lean;   // top corners (with lean)
      const LbX = x0 + dx0, RbX = x0 + dx1;                 // bottom corners
      const midY = (yTop + yBase) / 2;
      const c = Math.min(cr, (dx1 - dx0) * 0.4);
      const d = `M ${R1(LtX + c)} ${R1(yTop)} `
        + `Q ${R1((LtX + RtX) / 2)} ${R1(yTop - dome)} ${R1(RtX - c)} ${R1(yTop)} `        // domed head
        + `Q ${R1(RtX)} ${R1(yTop)} ${R1(RtX + bowS * 0.35)} ${R1(yTop + c)} `             // top-right corner
        + `Q ${R1(RbX + bowS)} ${R1(midY)} ${R1(RbX)} ${R1(yBase - c)} `                   // right spine bows
        + `Q ${R1(RbX)} ${R1(yBase)} ${R1(RbX - c)} ${R1(yBase)} `                         // bottom-right corner
        + `Q ${R1((LbX + RbX) / 2)} ${R1(yBase + sag)} ${R1(LbX + c)} ${R1(yBase)} `       // sagging tail
        + `Q ${R1(LbX)} ${R1(yBase)} ${R1(LbX - bowS)} ${R1(yBase - c)} `                  // bottom-left corner
        + `Q ${R1(LbX - bowS)} ${R1(midY)} ${R1(LtX - bowS * 0.35)} ${R1(yTop + c)} `      // left spine bows
        + `Q ${R1(LtX)} ${R1(yTop)} ${R1(LtX + c)} ${R1(yTop)} Z`;                         // top-left corner
      out.push(`<path d="${d}" fill="${fill}"${op2 ? ` opacity="${op2}"` : ''}/>`); counter.n++;
    };
    P(0, wd, mix(base, '#ffe9b0', gl * (o.lit == null ? 0.28 : o.lit * 0.5)), o.op);   // the body, committed
    P(0, wd * 0.26, dk, o.op);                                                          // shadow edge (away from the lamp handled simply: left)
    P(wd * 0.78, wd, mix(lt, '#fff2c8', gl * 0.4), (o.op || 1) * 0.85);                 // lit edge
    // a DENSE tooth of vertical brushstrokes over the shape — broken colour so the
    // spine reads as painted cloth/leather, not a flat fill (matches the book's style)
    strokes(out, counter, {
      rng, n: Math.round(wd * hgt / 32),
      sample: rej(Math.min(x0, x0 + lean), yTop, Math.max(x1, x1 + lean), yBase),
      dir: () => Math.PI / 2 + (o.leanA || 0),
      col: (x, y, r) => jig(mix(ramp(cols, fbm(x / 11, y / 34, o.fs || 91) * 0.72 + 0.16), '#ffe9b0', Math.pow(glow(x, y), 1.8) * 0.28), r, o.jig == null ? 5 : o.jig),
      len: 12, lw: 3.0, steps: 2, follow: 0.96, wild: 0.06, aJ: 0.05, lenJ: 0.4,
      impasto: o.imp == null ? 0.4 : o.imp, relief: o.rel == null ? 0.45 : o.rel,
      op: (o.op || 1) * 0.72,
    });
    if (o.bands) {   // clean gold bands near head and tail
      [yTop + hgt * 0.14, yTop + hgt * 0.86].forEach(by => {
        out.push(`<rect x="${R1(x0 + 1.5)}" y="${R1(by - 1.8)}" width="${R1(wd - 3)}" height="3.6" rx="1.8" fill="${mix(GOLD_DEEP, GOLD_PALE, gl)}" opacity="0.92"/>`); counter.n++;
      });
    }
  }

  const BAY1 = SHELF[0], BAY2 = SHELF[1], BAY3 = SHELF[2];

  // NO filler books — the shelves stand honestly: two stories written, two
  // papers, and EMPTY ROOM waiting for every book still to come (John 21:25).

  // -- TOP bay: THE LAW OF THE SHELF — every spine's thickness is the book's
  //    REAL length (storybooks: w = 14 + pages). The row leans on the left
  //    plank, each new book added here with its true page count as it is
  //    written; the shelf grows only as the writing does, like a real library.
  //    (Keep positions in sync with the hotspots in /index/index.html.)
  const STORIES = [
    { pages: 33, h: 92, cols: CHILD_RED, fs: 111, emblem: 'sun' },                          // episode one
    { pages: 15, h: 78, cols: ['#38205a', '#4a2a6e', '#5c3a84'], fs: 115, emblem: 'ruby' }, // episode two
    { pages: 15, h: 84, cols: ['#1e3a6a', '#2a4e88', '#3a66a8'], fs: 171, emblem: 'stones' },// episode three
    { pages: 15, h: 70, cols: ['#242440', '#32325a', '#44447a'], fs: 175, emblem: 'star' }, // episode four
  ];
  let sxRow = CAB.x0 + 16;
  for (const b of STORIES) {
    const wd = 14 + b.pages;
    spine(sxRow, sxRow + wd, BAY1, b.h, b.cols, { fs: b.fs, bands: 1, lit: 0.7 });
    b.cx = sxRow + wd / 2; b.cy = BAY1 - b.h * 0.55;
    sxRow += wd;                                    // touching — no gap
  }
  // emblems, each centred on its own spine
  const EMB = {
    sun(cx, cy) {
      for (let k = 0; k < 10; k++) {
        const a = (k / 10) * Math.PI * 2;
        out.push(`<line x1="${R1(cx + Math.cos(a) * 7)}" y1="${R1(cy + Math.sin(a) * 7)}" x2="${R1(cx + Math.cos(a) * 12)}" y2="${R1(cy + Math.sin(a) * 12)}" stroke="${GOLD_DEEP}" stroke-width="2" stroke-linecap="round"/>`); counter.n++;
      }
      out.push(`<circle cx="${R1(cx)}" cy="${R1(cy)}" r="5.4" fill="${GOLD_PALE}"/>`); counter.n++;
      out.push(`<circle cx="${R1(cx)}" cy="${R1(cy)}" r="2.6" fill="${GOLD_HOT}"/>`); counter.n++;
    },
    ruby(cx, cy) {
      out.push(`<path d="M ${cx} ${cy - 8} L ${cx + 7} ${cy} L ${cx} ${cy + 8} L ${cx - 7} ${cy} Z" fill="#c03048" stroke="#6a1626" stroke-width="1.4"/>`); counter.n++;
      out.push(`<path d="M ${cx} ${cy - 6} L ${cx + 4.5} ${cy} L ${cx} ${cy + 2} L ${cx - 4} ${cy - 1} Z" fill="#f28a9a" opacity="0.85"/>`); counter.n++;
    },
    stones(cx, cy) {
      [[0, -8], [-7, 0], [7, 0], [-3, 8], [3, 8]].forEach(([dx, dy]) => {
        out.push(`<circle cx="${R1(cx + dx)}" cy="${R1(cy + dy)}" r="3" fill="#d8d2c0" stroke="#101c30" stroke-width="0.8"/>`); counter.n++;
        out.push(`<circle cx="${R1(cx + dx - 0.8)}" cy="${R1(cy + dy - 0.9)}" r="0.9" fill="#fff6dc" opacity="0.8"/>`); counter.n++;
      });
    },
    star(cx, cy) {
      let d = '';
      for (let i = 0; i < 10; i++) {
        const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? 3.4 : 8;
        d += (i ? 'L' : 'M') + ` ${R1(cx + Math.cos(a) * rr)} ${R1(cy + Math.sin(a) * rr)} `;
      }
      out.push(`<path d="${d}Z" fill="${GOLD_PALE}" stroke="${GOLD_DEEP}" stroke-width="1"/>`); counter.n++;
      out.push(`<circle cx="${R1(cx)}" cy="${R1(cy)}" r="1.6" fill="${GOLD_HOT}"/>`); counter.n++;
    },
  };
  for (const b of STORIES) EMB[b.emblem](b.cx, b.cy);

  // -- the LAMP on the top shelf, lighting its neighbours --
  out.push(`<path d="M 404 ${BAY1} L 432 ${BAY1} L 428 ${BAY1 - 12} L 408 ${BAY1 - 12} Z" fill="#3a2412" stroke="#1c1008" stroke-width="1.5"/>`); counter.n++;
  out.push(`<path d="M 410 ${BAY1 - 12} L 426 ${BAY1 - 12} L 423 ${BAY1 - 24} L 413 ${BAY1 - 24} Z" fill="#8a5c2c"/>`); counter.n++;
  strokes(out, counter, {   // flame — curved, natural
    rng, n: 60,
    sample: r => { const a = r() * Math.PI * 2, d = Math.pow(r(), 0.6) * 9; return [LX + Math.cos(a) * d * 0.55, 182 + Math.sin(a) * d]; },
    dir: (x, y) => Math.atan2(176 - y, (LX - x) * 0.3) + 0.2,
    col: (x, y, r) => jig(ramp([GOLD_HOT, GOLD_PALE, GOLD_DEEP, '#e06a20'], Math.hypot(x - LX, y - 182) / 11), r, 6),
    len: 7, lw: 2.6, steps: 3, follow: 0.9, lenJ: 0.4, relief: 0.2,
  });
  out.push(`<ellipse cx="${LX}" cy="178" rx="3.4" ry="6.2" fill="${GOLD_HOT}" opacity="0.95"/>`); counter.n++;

  // the open book — two pale pages, faint light of their own (yet to be written)
  out.push(`<path d="M 444 ${BAY1 - 4} Q 459 ${BAY1 - 18} 474 ${BAY1 - 4} L 474 ${BAY1 - 2} Q 459 ${BAY1 - 14} 444 ${BAY1 - 2} Z" fill="#d8ccae" opacity="0.9"/>`); counter.n++;
  out.push(`<path d="M 474 ${BAY1 - 4} Q 489 ${BAY1 - 18} 504 ${BAY1 - 4} L 504 ${BAY1 - 2} Q 489 ${BAY1 - 14} 474 ${BAY1 - 2} Z" fill="#e6dcc0" opacity="0.9"/>`); counter.n++;
  out.push(`<line x1="474" y1="${BAY1 - 13}" x2="474" y2="${BAY1 - 2}" stroke="#8a7a58" stroke-width="1.2" opacity="0.7"/>`); counter.n++;
  // an inkwell and quill beside it (stories are written here)
  out.push(`<path d="M 514 ${BAY1 - 2} L 528 ${BAY1 - 2} L 526 ${BAY1 - 11} L 516 ${BAY1 - 11} Z" fill="#14100a"/>`); counter.n++;
  out.push(`<ellipse cx="521" cy="${BAY1 - 11}" rx="5.4" ry="1.8" fill="#060606"/>`); counter.n++;
  out.push(`<path d="M 520 ${BAY1 - 12} Q 511 ${BAY1 - 33} 501 ${BAY1 - 39} Q 509 ${BAY1 - 29} 516 ${BAY1 - 12} Z" fill="${mix('#d8d2c0', GOLD_PALE, 0.3)}" opacity="0.9"/>`); counter.n++;

  const booksEnd = out.length;   // BOOKS plane (lit hero row + lamp + open book) ends here

  // -- BOTTOM bay, RIGHT: THE MATH under cobwebs (the rest of the bay waits) --
  // The Law of the Shelf holds here too, in the tome's own units: the black
  // tome = 14 + its 27 chapters wide; the grey explanation = 14 + half its
  // 39 kids-cards (little half-thoughts weigh half a page). They stand
  // touching, leaning on the right plank.
  const MATH_W = 14 + 27, EXPL_W = 14 + Math.round(39 * 0.5);   // 41 and 34
  const EX1 = CAB.x1 - 16;                          // right plank inner edge (538)
  const EX0 = EX1 - EXPL_W, MX0 = EX0 - MATH_W;     // explanation 504-538, math 463-504
  spine(MX0, EX0, BAY3, 72, ['#0a0a10', '#14141c', '#20202c'], { fs: 161, lit: 0.22, jig: 3, imp: 0.3, rel: 0.35 });
  spine(EX0, EX1, BAY3, 58, ['#242430', '#32323e', '#444450'], { fs: 163, lit: 0.2, jig: 3, imp: 0.3, rel: 0.35 });
  // rim-light — a black book on near-black only reads by its edge (chiaroscuro)
  const rim = (x0r, x1r, yTopR, col, op2) => {
    // trace the SAME worn outline as the spine body (domed head + bowed sides +
    // rounded corners), open at the tail where the tome sits on the shelf
    const wd = x1r - x0r, cr = Math.min(5, wd * 0.2), dome = 2.6;
    const bowS = ((Math.round(x0r) % 9) / 9 - 0.5) * 3.0;
    const midY = (yTopR + BAY3) / 2, midX = (x0r + x1r) / 2;
    const d = `M ${R1(x0r)} ${R1(BAY3 - cr)} `
      + `Q ${R1(x0r - bowS)} ${R1(midY)} ${R1(x0r - bowS * 0.35)} ${R1(yTopR + cr)} `   // left spine bows
      + `Q ${R1(x0r)} ${R1(yTopR)} ${R1(x0r + cr)} ${R1(yTopR)} `                        // top-left corner
      + `Q ${R1(midX)} ${R1(yTopR - dome)} ${R1(x1r - cr)} ${R1(yTopR)} `                // domed head
      + `Q ${R1(x1r)} ${R1(yTopR)} ${R1(x1r + bowS * 0.35)} ${R1(yTopR + cr)} `          // top-right corner
      + `Q ${R1(x1r + bowS)} ${R1(midY)} ${R1(x1r)} ${R1(BAY3 - cr)}`;                   // right spine bows
    out.push(`<path d="${d}" fill="none" stroke="${col}" stroke-width="1.3" opacity="${op2}" stroke-linejoin="round" stroke-linecap="round"/>`); counter.n++;
    // the lit right edge — a thicker soft stroke hugging the right bowed side
    out.push(`<path d="M ${R1(x1r + bowS * 0.35)} ${R1(yTopR + cr)} Q ${R1(x1r + bowS)} ${R1(midY)} ${R1(x1r)} ${R1(BAY3 - cr)}" fill="none" stroke="${col}" stroke-width="2.2" opacity="${(op2 * 0.55).toFixed(3)}" stroke-linecap="round"/>`); counter.n++;
  };
  rim(MX0, EX0, BAY3 - 72, '#9a97b4', 0.6);
  rim(EX0, EX1, BAY3 - 58, '#8a8aa0', 0.55);
  inscriptionText(out, 'α·ω', { x: (MX0 + EX0) / 2, y: 386, h: 11, body: '#a8a8bc', edge: '#08080c', op: 0.9, edgeOp: 0.5 });   // the full math
  inscriptionText(out, '?', { x: (EX0 + EX1) / 2, y: 394, h: 11, body: '#b0b0c2', edge: '#101016', op: 0.85, edgeOp: 0.5 });    // the explanation
  // cobwebs — a web hanging from the shelf above them + sagging strands
  const webCol = (x, y, r) => jig(mix('#6a6880', '#a8a4bc', 0.4), r, 3);   // dusty grey, not bright white
  const webPath = (pts, lw2) => paintPath(out, counter, rng, pts, webCol, { lw: lw2 || 0.55, len: 6, density: 0.3, jitter: 0.3 });
  const sag = (x0s, y0s, x1s, y1s, drop) => {
    const pts = [];
    for (let t = 0; t <= 1.001; t += 0.125) pts.push([x0s + (x1s - x0s) * t, y0s + (y1s - y0s) * t + Math.sin(t * Math.PI) * drop]);
    return pts;
  };
  const WX = 536, WY = 336;                        // the true corner: right plank meets the shelf above
  [[-0.95, 30], [-0.6, 36], [-0.25, 34], [0, 26]].forEach(([k, ln]) => {
    webPath([[WX, WY], [WX + k * ln * 0.8, WY + ln]], 0.5);
  });
  [12, 22, 32].forEach(rr => webPath(sag(WX - rr * 0.95, WY + rr * 0.5, WX, WY + rr * 0.85, rr * 0.12), 0.5));
  webPath(sag(MX0 + 3, BAY3 - 72, EX0 + 2, BAY3 - 58, 4));    // one strand draped tome to tome
  webPath(sag(EX0 + 2, BAY3 - 58, EX1, BAY3 - 34, 4), 0.5);   // and up to the plank

  /* ====================== 4. THE SECRET ====================== */
  // John 21:25 cut into the bottom rail — the world could not contain the books
  inscriptionText(out, 'John 21·25', { x: 400, y: 452, h: 10, body: '#160e06', edge: '#c8a060', op: 0.55, edgeOp: 0.3 });

  const ALT = 'A dark, quiet room. A tall wooden book cabinet stands lamplit at its middle shelf: a small oil lamp burns between two bright books — one crimson with a small gold sun on its spine, one deep violet with a ruby — while rows of dim, half-real spines stand around them and fill the shelf below: books not yet written. On the top shelf lie a few flat dim books and one open book whose blank pages faintly glow. The lamp light breathes warm on the wood; the rest of the room falls into deep blue-brown shadow.';

  // DEPTH PLANES — the room is the opaque backdrop (keeps its oil finish); the
  // cabinet + dim tomes and the lit books ride transparent cels the page slides
  // on tilt. seg() concatenates out[] ranges.
  const seg = (...rs) => rs.map(([a, b]) => out.slice(a, b).join('\n')).join('\n');
  // transparent cels render CRISP (no melt/turbulence) — HD strokes, no wobble
  // or grain; the painterly quality comes from the brushwork + relief itself.
  const CEL = { undercoat: 0, weave: 0, varnish: 0, oil: 0 };
  if (LAYER === 'room') return svgWrap(ALT, seg([0, roomEnd]), { oil: 0.45, weave: 0 });          // opaque back — clean (no canvas-weave grain)
  if (LAYER === 'cabinet') return svgWrap(ALT, seg([roomEnd, cabFrameEnd], [booksEnd, out.length]), CEL);   // frame + dim tomes + webs + cut verse
  if (LAYER === 'books') return svgWrap(ALT, seg([cabFrameEnd, booksEnd]), CEL);                 // the lit hero books + lamp (nearest)
  return svgWrap(ALT, out.join('\n'), { oil: 0.35, weave: 0 });   // the full flat plate — clean HD, no canvas grain (the index is a single static image)
}
