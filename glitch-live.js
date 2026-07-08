/* glitch-live.js — the LIVING GLITCH engine.

   THE LAW (from the kernel): drift (ε) is corruption of the image,
   and corruption is RESTLESS. Far from the light the painting quietly,
   continuously glitches; inside the light it is perfectly still.

     "But the wicked are like the troubled sea, when it cannot rest,
      whose waters cast up mire and dirt."        — Isaiah 57:20
     "Be still, and know that I am God."          — Psalm 46:10

   And yet the Light is not dead stone — it is ALIVE:

     "For the word of God is quick, and powerful."     — Hebrews 4:12
     "Out of his belly shall flow rivers of living water." — John 7:38

   THREE MODES OF MOTION, distinguishable at a glance:
   the corruption CHURNS — smears, kinks, traveling swells, stutter —
   the light LIVES — it breathes, its rays sway like candlelight
   on a wall, and small gold motes are born at its base and rise —
   and the heavens TURN — the sky rotates slowly about each plate's
   vortex hearts, one revolution per minute at the core, worship speed:

     "Which giveth the sun for a light by day, and the ordinances
      of the moon and of the stars for a light by night."  — Jeremiah 31:35
     "The heavens declare the glory of God."               — Psalm 19:1

   Corruption's vocabulary is jitter; the light's is breath, sway, rise;
   the heavens' is ordinance — the faithful turning. Never one in another:
   the heavens turn ABOUT the light, and the light itself is never turned.

   Mechanics: each <canvas class="glitch-live" data-glitch="KEY"> overlays
   its page's <img> with the same object-fit:cover mapping the live-cover
   overlay uses (landscape raster = full 800x500 viewBox; portrait raster
   = the plate's 312-wide focal window, x0 from glitch-fields.json).
   A WebGL1 fragment shader redraws the whole painting every frame,
   displaced by C(p) = ambient * (1 - L(p)), where L(p) is built from the
   plate's light descriptors (one column + up to four point gaussians).
   Sanctity guard: C = 0 wherever L > threshold — at C = 0 every corruption
   tap collapses to the original texel, so no glitch ever touches the light.
   What moves inside the light is LIFE (breath/sway/motes), a separate
   vocabulary masked by L. If WebGL is unavailable, or the reader prefers reduced
   motion, nothing initializes: the still painting is always acceptable. */
(function () {
  'use strict';
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var canvases = Array.prototype.slice.call(document.querySelectorAll('canvas.glitch-live'));
  if (!canvases.length) return;
  var book = document.getElementById('book');
  if (!book) return;
  var pages = Array.prototype.slice.call(book.querySelectorAll('.page'));

  var VERT = [
    'attribute vec2 aPos;',
    'uniform vec2 uSize;',  // page CSS px
    'uniform vec4 uMap;',   // ox, oy, dw, dh — cover-fit placement of the raster, CSS px
    'uniform vec3 uView;',  // vx0, vw, vh — the viewBox window the raster shows
    'varying vec2 vUv;',    // texture uv
    'varying vec2 vP;',     // plate coords (800x500 space)
    'void main() {',
    '  gl_Position = vec4(aPos, 0.0, 1.0);',
    '  vec2 css = vec2((aPos.x * 0.5 + 0.5) * uSize.x, (0.5 - aPos.y * 0.5) * uSize.y);',
    '  vUv = (css - uMap.xy) / uMap.zw;',
    '  vP = vec2(uView.x + vUv.x * uView.y, vUv.y * uView.z);',
    '}'
  ].join('\n');

  var FRAG = [
    'precision mediump float;',
    'varying vec2 vUv;',
    'varying vec2 vP;',
    'uniform sampler2D uTex;',
    'uniform float uTime;',
    'uniform vec2 uPxUv;',     // uv per CSS px
    'uniform vec4 uColumn;',   // x, yTop, yBase, falloff (falloff <= 0: no column)
    'uniform vec3 uColAniso;', // anisoX, anisoY, weight
    'uniform vec4 uPts[4];',   // x, y, radius, weight (weight 0 = unused)
    'uniform float uAmbient;',
    'uniform float uThresh;',
    'uniform float uRamp;',
    'uniform float uFlow;',    // smear flow angle (radians)
    'uniform float uSmear;',   // smear amplitude, px (breathing, from JS)',
    'uniform float uSplit;',   // channel split, px (breathing, from JS)',
    'uniform vec4 uBurst;',    // episode: env 0..1, band y (plate), band half-width, bleed px
    'uniform float uSeed;',
    'uniform float uBreath;',  // radiant breathing ±0.05-0.08, two incommensurate sines (JS)
    'uniform vec2 uLightC;',   // the heart of the light, plate coords
    'uniform float uLife;',    // per-page life intensity (candle gentlest)
    'uniform vec4 uVort[3];',  // x, y, r (gaussian extent), w (rev/min at the core)
    'uniform vec2 uPlateUv;',  // uv per plate unit (1/vw, 1/vh) — true geometry for the turn
    'float hash(vec2 q) { return fract(sin(dot(q, vec2(127.1, 311.7))) * 43758.5453); }',
    'float vnoise(vec2 q) {',
    '  vec2 i = floor(q), f = fract(q);',
    '  f = f * f * (3.0 - 2.0 * f);',
    '  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),',
    '             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);',
    '}',
    /* the flow angle field — "who can make that straight, which he hath
       made crooked?" (Eccl 7:13). Smooth wandering + KINKS: in sparse
       patches the angle breaks sharply mid-line, the sudden elbow of a
       drift that changed its mind. */
    'float flowAng(vec2 q) {',
    '  float a = uFlow + (vnoise(q * 0.012 + vec2(uSeed, uTime * 0.12)) - 0.5) * 0.9;',
    '  a += sin(q.y * 0.02 + uTime * 0.14 + uSeed) * 0.35;',
    '  float kinkGate = step(0.80, vnoise(q * 0.030 + vec2(uSeed * 3.1, uSeed)));',
    '  a += kinkGate * (vnoise(q * 0.23 + vec2(uSeed * 5.7, uTime * 0.045)) - 0.5) * 2.6;',
    '  return a;',
    '}',
    /* THE HEAVENS TURN — the third vocabulary. "Which giveth the sun for a
       light by day, and the ordinances of the moon and of the stars for a
       light by night" (Jer 31:35); "the heavens declare the glory of God"
       (Ps 19:1). Not jitter, not breath: ORDINANCE — the slow, faithful
       rotation of the sky around each plate\'s vortex hearts, one
       revolution per minute at the core (worship speed), differential
       further out like a galaxy. Stilled to exactly zero inside the light:
       the heavens turn ABOUT the light, never the light itself. */
    'vec2 turned(vec2 p, float ph, float still) {',
    '  vec2 dp = vec2(0.0);',
    '  for (int i = 0; i < 3; i++) {',
    '    if (uVort[i].z > 0.0) {',
    '      vec2 d = p - uVort[i].xy;',
    '      float dist = max(length(d), 1.0);',
    '      float fall = exp(-dot(d, d) / (uVort[i].z * uVort[i].z));',
    // (ph - 0.5) * cycle * omega; omega = rev/min at the core, capped to a
    // constant tangential speed beyond ~52 plate units (differential rotation)
    '      float ang = (ph - 0.5) * 1.8 * 0.10472 * uVort[i].w * min(1.0, 52.0 / dist) * fall * still;',
    '      float c = cos(ang), s = sin(ang);',
    '      dp += vec2(c * d.x - s * d.y, s * d.x + c * d.y) - d;',
    '    }',
    '  }',
    '  return dp;',
    '}',
    'void main() {',
    '  vec2 p = vP;',
    /* L(p): the light field, assembled from the plate's data */
    '  float L = 0.0;',
    '  if (uColumn.w > 0.0) {',
    '    float yc = clamp(p.y, uColumn.y, uColumn.z);',
    '    vec2 d = vec2((p.x - uColumn.x) * uColAniso.x, (p.y - yc) * uColAniso.y);',
    '    L += uColAniso.z * exp(-length(d) / uColumn.w);',
    '  }',
    '  for (int i = 0; i < 4; i++) {',
    '    if (uPts[i].w > 0.0) {',
    '      vec2 d = p - uPts[i].xy;',
    '      L += uPts[i].w * exp(-dot(d, d) / (uPts[i].z * uPts[i].z));',
    '    }',
    '  }',
    /* C(p) = ambient * (1 - L); sanctity guard: C -> 0 at the threshold.
       At C = 0 every offset below is exactly zero — perfect stillness. */
    '  float C = uAmbient * (1.0 - min(L, 1.0)) * smoothstep(uThresh, uThresh - uRamp, L);',
    /* the life mask: where the light reigns, life — not jitter — moves */
    '  float Llife = smoothstep(uThresh - uRamp, 1.0, min(L, 1.4));',
    /* the boundary band: the ramp where light meets corruption */
    '  float edge = smoothstep(uThresh - uRamp, uThresh, L) * (1.0 - smoothstep(uThresh, uThresh + uRamp, L));',
    /* the stillness mask for the turn: 1 in the dark heavens, exactly 0
       inside the light — the same sanctity the corruption obeys */
    '  float still = 1.0 - smoothstep(uThresh - uRamp, uThresh, L);',
    /* 2. scanline shear — bands UNDULATE: the band coordinate bends with x
       so no tear is ruler-straight; during an episode the curved band
       jitters much harder */
    '  float wob = (vnoise(vec2(p.x * 0.016 + uSeed * 2.2, uTime * 0.10)) - 0.5) * 26.0;', // band curvature
    '  float yb = p.y + wob;',
    '  float sh = (vnoise(vec2(yb * 0.085 + uSeed, uTime * 0.5)) - 0.5) * 2.2;',
    '  float band = exp(-pow((yb - uBurst.y) / uBurst.z, 2.0));',
    '  float burst = uBurst.x * band;',
    '  sh += (vnoise(vec2(yb * 0.6 + uSeed * 7.0, uTime * 7.0)) - 0.5) * 20.0 * burst;',
    '  vec2 uv = vUv + vec2(sh * C * uPxUv.x, 0.0);',
    /* 2b. traveling swells — slow visible waves crossing the corrupted dusk
       over ~8s, the troubled sea heaving at arm\'s length (Isa 57:20) */
    '  float trav = sin(p.x * 0.012 + p.y * 0.005 - uTime * 0.95 + uSeed);',
    '  float trav2 = sin(p.x * 0.007 - p.y * 0.0042 + uTime * 0.55 + uSeed * 3.0);',
    '  uv.y += (trav * 1.7 + trav2 * 1.1) * C * uPxUv.y;',
    '  uv.x += trav2 * 0.9 * C * uPxUv.x;',
    /* 4. THE BOUNDARY BREATHES — within the ramp the field is drawn gently
       INWARD toward the heart of the light: the chaos is not masked off,
       it is being actively stilled ("Peace, be still." — Mark 4:39) */
    '  vec2 toL = uLightC - p;',
    '  float dl = max(length(toL), 1.0);',
    '  uv += (toL / dl) * edge * (1.1 + 0.5 * sin(uTime * 0.6 + uSeed)) * uPxUv;',
    /* THE LIGHT LIVES — "the word of God is quick, and powerful" (Heb 4:12).
       Inside the light, stillness gives way to LIFE. Its motion is organic,
       slow, never jittery — breath, sway, rise. */
    /* ray sway: candlelight on a wall — a slow tangential shimmer of the
       rays around the light\'s heart, low frequency, smooth */
    '  vec2 tang = normalize(vec2(-toL.y, toL.x) + vec2(0.001));',
    '  float sway = (vnoise(vec2(p.y * 0.010 + uSeed, uTime * 0.11)) - 0.5) * 2.2 * Llife * uLife;',
    '  uv += tang * sway * uPxUv;',
    /* 1. smear along a CURVED trajectory — each tap re-reads the flow at
       the displaced position, so the stroke bends as it travels (and
       kinks where the field breaks) */
    '  float s1 = uSmear * C;',
    '  float a0 = flowAng(p);',
    '  vec2 d0 = vec2(cos(a0), sin(a0));',
    '  vec2 p1 = p + d0 * s1;            float a1 = flowAng(p1);',
    '  vec2 d1 = vec2(cos(a1), sin(a1));',
    '  vec2 p2 = p1 + d1 * s1;',
    '  vec2 m1 = p - d0 * s1;            float b1 = flowAng(m1);',
    '  vec2 e1 = vec2(cos(b1), sin(b1));',
    '  vec2 m2 = m1 - e1 * s1;',
    /* the turn rides beneath everything: two advection layers, each drifting
       at worship speed, cross-faded so the texture forever turns yet never
       shears apart — the ordinance keeps, the painting keeps */
    '  float ph1 = fract(uTime / 1.8 + uSeed);',
    '  float ph2 = fract(ph1 + 0.5);',
    '  float w1 = 1.0 - abs(2.0 * ph1 - 1.0);',
    '  vec2 uvA = uv + turned(p, ph1, still) * uPlateUv;',
    '  vec2 uvB = uv + turned(p, ph2, still) * uPlateUv;',
    '  vec2 so = d0 * ((uSplit + uBurst.w * burst) * C) * uPxUv;',
    '  vec2 o1 = (p1 - p) * uPxUv, o2 = (m1 - p) * uPxUv;',
    '  vec2 o3 = (p2 - p) * uPxUv, o4 = (m2 - p) * uPxUv;',
    '  vec3 colA = texture2D(uTex, uvA).rgb * 0.36',
    '            + texture2D(uTex, uvA + o1).rgb * 0.20',
    '            + texture2D(uTex, uvA + o2).rgb * 0.20',
    '            + texture2D(uTex, uvA + o3).rgb * 0.12',
    '            + texture2D(uTex, uvA + o4).rgb * 0.12;',
    /* 3. channel split — r/b pulled apart along the LOCAL bent flow; one
       channel bleeds further during an episode */
    '  colA.r = texture2D(uTex, uvA + so).r;',
    '  colA.b = texture2D(uTex, uvA - so).b;',
    '  vec3 colB = texture2D(uTex, uvB).rgb * 0.36',
    '            + texture2D(uTex, uvB + o1).rgb * 0.20',
    '            + texture2D(uTex, uvB + o2).rgb * 0.20',
    '            + texture2D(uTex, uvB + o3).rgb * 0.12',
    '            + texture2D(uTex, uvB + o4).rgb * 0.12;',
    '  colB.r = texture2D(uTex, uvB + so).r;',
    '  colB.b = texture2D(uTex, uvB - so).b;',
    '  vec3 col = colA * w1 + colB * (1.0 - w1);',
    /* radiant breathing: the light\'s luminance swells ±5-8% on two
       incommensurate sines (set in JS) — a chest rising, not a metronome */
    '  col *= 1.0 + uBreath * Llife;',
    /* ASCENDING MOTES: soft gold sparks born near the light\'s base, drifting
       slowly UP through the light and fading as they rise — life rising,
       "rivers of living water" (John 7:38). Three noise streak layers at
       incommensurate speeds, masked by the light. */
    '  float riseFade = smoothstep(uLightC.y - 230.0, uLightC.y + 110.0, p.y);',
    '  float n1 = vnoise(vec2(p.x * 0.14 + uSeed * 4.0, p.y * 0.035 + uTime * 0.50));',
    '  float n2 = vnoise(vec2(p.x * 0.10 + uSeed * 9.0, p.y * 0.025 + uTime * 0.32));',
    '  float n3 = vnoise(vec2(p.x * 0.20 + uSeed * 6.5, p.y * 0.05 + uTime * 0.78));',
    '  float motes = smoothstep(0.80, 0.94, n1) * 0.5 + smoothstep(0.82, 0.95, n2) * 0.4 + smoothstep(0.84, 0.96, n3) * 0.35;',
    '  col += motes * vec3(1.0, 0.84, 0.46) * 0.30 * Llife * riseFade * uLife * (1.0 + uBreath * 4.0);',
    '  gl_FragColor = vec4(col, 1.0);',
    '}'
  ].join('\n');

  var views = [], raf = 0, epoch = performance.now();

  function compile(gl, type, src) {
    var sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) return null;
    return sh;
  }

  function makeView(cv, field) {
    var page = cv.parentNode;
    while (page && (!page.classList || !page.classList.contains('page'))) page = page.parentNode;
    if (!page) return null;
    var img = page.querySelector('img');
    if (!img) return null;
    var opts = { alpha: true, antialias: false, depth: false, stencil: false, preserveDrawingBuffer: false };
    var gl = cv.getContext('webgl', opts) || cv.getContext('experimental-webgl', opts);
    if (!gl) return null; // no WebGL — the still painting stands on its own
    var vs = compile(gl, gl.VERTEX_SHADER, VERT);
    var fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return null;
    var prog = gl.createProgram();
    gl.attachShader(prog, vs); gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
    gl.useProgram(prog);

    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var aPos = gl.getAttribLocation(prog, 'aPos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    var U = {};
    ['uSize', 'uMap', 'uView', 'uTex', 'uTime', 'uPxUv', 'uColumn', 'uColAniso', 'uPts',
     'uAmbient', 'uThresh', 'uRamp', 'uFlow', 'uSmear', 'uSplit', 'uBurst', 'uSeed',
     'uBreath', 'uLightC', 'uLife']
      .forEach(function (n) { U[n] = gl.getUniformLocation(prog, n); });
    U.uVort = gl.getUniformLocation(prog, 'uVort[0]') || gl.getUniformLocation(prog, 'uVort');
    U.uPlateUv = gl.getUniformLocation(prog, 'uPlateUv');

    // static field uniforms — a new plate is purely a new JSON entry
    var col = null, pts = [];
    (field.lights || []).forEach(function (Lt) {
      if (Lt.type === 'column' && !col) col = Lt;
      else if (Lt.type === 'point' && pts.length < 4) pts.push(Lt);
    });
    gl.uniform4f(U.uColumn, col ? col.x : 0, col ? col.yTop : 0, col ? col.yBase : 0, col ? col.falloff : 0);
    gl.uniform3f(U.uColAniso, col && col.anisoX || 1, col && col.anisoY || 1, col && col.weight || 1);
    var P = new Float32Array(16);
    pts.forEach(function (q, i) { P[i * 4] = q.x; P[i * 4 + 1] = q.y; P[i * 4 + 2] = q.r; P[i * 4 + 3] = q.weight || 1; });
    gl.uniform4fv(U.uPts, P);
    // the heavens' vortex hearts — data only, like the lights; w = rev/min
    var VR = new Float32Array(12);
    (field.vortices || []).slice(0, 3).forEach(function (q, i) {
      VR[i * 4] = q.x; VR[i * 4 + 1] = q.y; VR[i * 4 + 2] = q.r; VR[i * 4 + 3] = q.w != null ? q.w : 1;
    });
    gl.uniform4fv(U.uVort, VR);
    gl.uniform1f(U.uAmbient, field.ambient != null ? field.ambient : 0.85);
    gl.uniform1f(U.uThresh, field.threshold != null ? field.threshold : 0.6);
    gl.uniform1f(U.uRamp, field.ramp != null ? field.ramp : 0.25);
    gl.uniform1f(U.uFlow, field.flow || 0);
    // the heart of the light — where the motes are born and the boundary
    // pulls toward; field.heart overrides, else derived from the lights
    var hx = 400, hy = 250;
    if (field.heart) { hx = field.heart[0]; hy = field.heart[1]; }
    else if (col) { hx = col.x; hy = (col.yTop + col.yBase) / 2; }
    else if (pts.length) {
      var sw = 0; hx = 0; hy = 0;
      pts.forEach(function (q) { var w = q.weight || 1; sw += w; hx += q.x * w; hy += q.y * w; });
      hx /= sw; hy /= sw;
    }
    gl.uniform2f(U.uLightC, hx, hy);
    gl.uniform1f(U.uLife, field.life != null ? field.life : 1);
    var seed = Math.random() * 100;
    gl.uniform1f(U.uSeed, seed);
    gl.uniform1i(U.uTex, 0);

    var tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);

    var V = {
      cv: cv, gl: gl, U: U, img: img, field: field, seed: seed,
      pageIndex: pages.indexOf(page), page: page,
      texSrc: null, needsLayout: true, cleared: false, dead: false,
      // restless episodes: every 7-15s, a 0.4-0.9s burst
      ep: { t0: 0, dur: 1, until: 0, next: 3 + Math.random() * 5, y: 250, half: 45, bleed: 6 }
    };
    cv.addEventListener('webglcontextlost', function (e) { e.preventDefault(); V.dead = true; });
    img.addEventListener('load', function () { V.texSrc = null; V.needsLayout = true; start(); });
    return V;
  }

  // replicate object-fit: cover of the raster, then raster -> viewBox window
  // (same mapping the live-cover overlay computes; portrait window is the
  // plate's own 312-wide focal window, x0 from the field data)
  function layout(V) {
    var img = V.img;
    if (!img.naturalWidth) { V.needsLayout = true; return; }
    var gl = V.gl, U = V.U;
    var w = V.page.clientWidth, h = V.page.clientHeight;
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    V.cv.width = Math.round(w * dpr); V.cv.height = Math.round(h * dpr);
    gl.viewport(0, 0, V.cv.width, V.cv.height);
    var iw = img.naturalWidth, ih = img.naturalHeight;
    var s = Math.max(w / iw, h / ih);
    var dw = iw * s, dh = ih * s;
    var ox = (w - dw) / 2, oy = (h - dh) / 2;
    var portrait = ih > iw;
    var vx0 = portrait ? (V.field.portraitX0 || 244) : 0;
    var vw = portrait ? 312 : 800;
    gl.uniform2f(U.uSize, w, h);
    gl.uniform4f(U.uMap, ox, oy, dw, dh);
    gl.uniform3f(U.uView, vx0, vw, 500);
    gl.uniform2f(U.uPxUv, 1 / dw, 1 / dh);
    gl.uniform2f(U.uPlateUv, 1 / vw, 1 / 500);
    V.needsLayout = false;
  }

  function ensureTexture(V) {
    var img = V.img, gl = V.gl;
    if (!img.complete || !img.naturalWidth) return false;
    var src = img.currentSrc || img.src;
    if (src === V.texSrc) return true;
    // NPOT raster (1600x1000 / 1000x1600): clamp + linear, no mips (WebGL1)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    V.texSrc = src;
    V.needsLayout = true; // edition may have changed the raster size
    return true;
  }

  function frame(now) {
    raf = 0;
    if (document.visibilityState !== 'visible') return; // visibilitychange restarts
    var t = (now - epoch) / 1000;
    var current = Math.round(book.scrollLeft / book.clientWidth);
    for (var v = 0; v < views.length; v++) {
      var V = views[v];
      if (V.dead) continue;
      var gl = V.gl, U = V.U;
      if (V.pageIndex !== current) {
        if (!V.cleared) { gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT); V.cleared = true; }
        continue;
      }
      V.cleared = false;
      if (!ensureTexture(V)) continue; // lazy img not in yet — painting beneath shows
      if (V.needsLayout) layout(V);

      // the churn: the baseline never reaches zero — it cannot rest (Isa 57:20) —
      // restless sea at arm's length, still beneath "broken TV"
      var smear = 1.4 + 2.2 * (0.5 + 0.5 * Math.sin(t * Math.PI * 2 / 16 + V.seed));      // 1.4..3.6 px
      var split = 1.2 + 2.0 * (0.5 + 0.5 * Math.sin(t * Math.PI * 2 / 11 + V.seed * 2));  // ~1.2..3.2 px (x C <= ~3)

      // the light breathes — "the word of God is quick, and powerful" (Heb 4:12):
      // two incommensurate sines (5.2s, 8.13s), ±~7% peak — organic, no metronome
      var breath = 0.048 * Math.sin(t * Math.PI * 2 / 5.2 + V.seed)
                 + 0.030 * Math.sin(t * Math.PI * 2 / 8.13 + V.seed * 1.7);

      // intermittent stutter: every 6-12s, a 0.45-1.0s episode in one band of rows
      var ep = V.ep, env = 0;
      if (t >= ep.next) {
        ep.t0 = t; ep.dur = 0.45 + Math.random() * 0.55; ep.until = t + ep.dur;
        ep.y = 60 + Math.random() * 380;        // band center, plate y
        ep.half = 18 + Math.random() * 48;      // band half-width
        ep.bleed = 5 + Math.random() * 5;       // extra px on one channel
        ep.next = ep.until + 6 + Math.random() * 6;
      }
      if (t < ep.until) env = Math.sin(Math.PI * (t - ep.t0) / ep.dur);

      gl.uniform1f(U.uTime, t);
      gl.uniform1f(U.uSmear, smear);
      gl.uniform1f(U.uSplit, split);
      gl.uniform1f(U.uBreath, breath);
      gl.uniform4f(U.uBurst, env, ep.y, Math.max(1, ep.half), ep.bleed);
      gl.drawArrays(gl.TRIANGLES, 0, 3); // one draw call per frame
    }
    raf = requestAnimationFrame(frame);
  }

  function start() { if (!raf && views.length) raf = requestAnimationFrame(frame); }

  function init() {
    fetch('/glitch-fields.json').then(function (r) { return r.json(); }).then(function (d) {
      var plates = d.plates || {};
      canvases.forEach(function (cv) {
        var f = plates[cv.getAttribute('data-glitch')];
        if (!f) return;
        var V = makeView(cv, f);
        if (V) views.push(V);
      });
      if (views.length) start();
    }).catch(function () { /* the still painting stands on its own */ });
  }

  // recompute mapping when the viewport or edition changes
  var rsTimer = 0;
  function onResize() {
    clearTimeout(rsTimer);
    rsTimer = setTimeout(function () {
      views.forEach(function (V) { V.needsLayout = true; });
      start();
    }, 120);
  }
  window.addEventListener('resize', onResize);
  window.addEventListener('orientationchange', onResize);
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible') start();
  });

  var idle = window.requestIdleCallback || function (f) { setTimeout(f, 600); };
  if (document.readyState === 'complete') idle(init);
  else window.addEventListener('load', function () { idle(init); });
})();
