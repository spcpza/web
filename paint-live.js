/* paint-live.js — the LIVING PAINT engine for the whole storybook.
 *
 * Every plate is reconstituted as a field of organic impasto brushstrokes and
 * lit by its OWN light source (found automatically from where the painting is
 * brightest — the flame, the candle, the open tomb: the scriptural light in
 * each scene). The relief is a real accumulated paint-height field raked by
 * that source; the dark falls away from it; the night's own cool light keeps
 * the far forms readable. The paint breathes and flows — it never freezes.
 *
 *   "And the light shineth in darkness; and the darkness comprehended it not."
 *                                                            — John 1:5
 *
 * Architecture: ONE offscreen WebGL renderer (so we never exhaust GL
 * contexts), blitted each frame onto a cheap 2D <canvas> over each page. Only
 * the current page animates; neighbours hold their last painted frame. If
 * WebGL is unavailable or the reader prefers reduced motion, nothing draws and
 * the pressed painting stands on its own. */
(function () {
  'use strict';
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var book = document.getElementById('book');
  if (!book) return;
  // PILOT: the LIVING PAINT shader engine, scoped to the front cover only, so the
  // last page (flat) stays as an A/B reference. Opt in per page via [data-paintlive].
  var pages = Array.prototype.slice.call(book.querySelectorAll('.page[data-paintlive]'));
  if (!pages.length) return;

  // the Word that shapes the variation — no two strokes alike, because no two
  // letters are (a plate may override via data-word)
  var WORD = 'And the light shineth in darkness and the darkness comprehended it not. In the beginning was the Word and the Word was with God and the Word was God. In him was life and the life was the light of men.';

  // ---------- offscreen GL ----------
  var glcv = document.createElement('canvas');
  var glOpts = { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, preserveDrawingBuffer: true };
  var gl = glcv.getContext('webgl', glOpts) || glcv.getContext('experimental-webgl', glOpts);
  if (!gl) return;

  var VERT = [
    'attribute vec2 aPos; attribute vec2 aAnchor; attribute float aAcross; attribute float aAlong;',
    'attribute vec3 aCol; attribute float aImp;',
    'uniform float uTime; uniform vec2 uVB; uniform vec2 uLayerOff;',   // uLayerOff: per-layer parallax shift (viewBox px) for composite-once multiplane
    // DIORAMA (true one-point perspective): uPlane 0 = affine (classic offset is
    // the uSc=1 case), 1 = GROUND — an exact ground-plane reprojection under a
    // camera truck (uGnd.z) + dolly (uGnd.w). uGnd = (v0 horizon-y, k depth
    // constant, tx, tz); uCx = the vanishing point x. Depth of a ground row:
    // Z = k/(y - v0), Z = 1 at the canvas bottom. Crisp by construction — a
    // plane under camera motion is a homography, not a smear.
    'uniform float uPlane; uniform float uSc; uniform vec4 uGnd; uniform float uCx; uniform float uTy;',
    'varying float vAcross; varying float vAlong; varying vec3 vCol; varying float vImp;',
    'void main(){',
    '  vec2 off = vec2(0.0);',
    '  float ph = aAnchor.x*0.05 + aAnchor.y*0.04;',
    // the whole surface is wet — every mark wanders slowly on its own phase
    '  off += vec2(sin(uTime*0.7 + ph*1.7), cos(uTime*0.55 + ph*2.3)) * 2.0;',
    '  off += vec2(cos(uTime*0.40 + ph*0.9), sin(uTime*0.33 + ph*1.3)) * 1.3;',   // a second slow drift — more alive
    '  vec2 pos = aPos + off;',
    '  if(uPlane>0.5){',
    '    float Z  = uGnd.y / max(pos.y - uGnd.x, 0.001);',
    '    float Zp = max(Z - uGnd.w, 0.05);',
    '    vec2 g = vec2(uCx + ((pos.x-uCx)*Z - uGnd.z)/Zp, uGnd.x + (uGnd.y + uTy)/Zp);',   // + uTy: the camera RISES — the ground drops away beneath you
    '    float below = clamp((pos.y - uGnd.x)/24.0, 0.0, 1.0);',   // blend to identity just above the horizon (fringe tips)
    '    pos = mix(pos, g, below) + uLayerOff;',                   // + the reference-depth anchor shift
    '  } else { pos = pos*uSc + uLayerOff; }',
    '  gl_Position = vec4(pos.x/uVB.x*2.0-1.0, 1.0-pos.y/uVB.y*2.0, 0.0, 1.0);',
    '  vAcross=aAcross; vAlong=aAlong; vCol=aCol; vImp=aImp;',
    '}'
  ].join('\n');

  // dual mode: 0 = albedo, 1 = paint-height (additive)
  var FRAG = [
    'precision mediump float;',
    'varying float vAcross; varying float vAlong; varying vec3 vCol; varying float vImp;',
    'uniform float uMode;',
    'void main(){',
    '  float ax=abs(vAcross);',
    '  float cap=smoothstep(0.0,0.16,vAlong)*smoothstep(1.0,0.84,vAlong);',   // longer fade at the ends = rounder caps
    '  float a=(1.0-smoothstep(0.66,1.0,ax))*cap;',                            // wider side feather = softer, rounder edges (was 0.86)
    '  if(a<=0.01) discard;',
    '  if(uMode<0.5){ gl_FragColor=vec4(vCol,a); }',
    '  else {',
    '    float dome=1.0-ax*ax;',
    '    float along=0.28+0.95*smoothstep(0.72,0.0,vAlong);',          // glob -> dry streak
    '    float bristle=0.82+0.18*sin(vAcross*22.0);',   // gentle bristle — subtle, not a hatching texture on top
    '    float h=vImp*dome*along*bristle*a;',
    '    gl_FragColor=vec4(vec3(h*0.17),1.0);',
    '  }',
    '}'
  ].join('\n');

  var FIN_VERT = 'attribute vec2 p; varying vec2 uv; void main(){ uv=p*0.5+0.5; gl_Position=vec4(p,0.0,1.0); }';
  // light the accumulated height field from the scene's OWN sources (up to 3
  // auto-detected bright points), falling to dark; a faint cool skyfill keeps
  // far forms readable; the brightest pigment is self-luminous.
  var FIN_FRAG = [
    'precision highp float;',
    'varying vec2 uv;',
    'uniform sampler2D uCol; uniform sampler2D uHt; uniform sampler2D uRaster; uniform vec2 uTexel; uniform float uTime;',
    'uniform vec2 uRes; uniform vec4 uL0; uniform vec4 uL1; uniform vec4 uL2;',   // xy=pos(px), z=reach, w=weight
    'uniform float uCover;',   // 1 on the galaxy covers: keep the REAL painting, add only the living glow/relief on top
    'uniform float uAlphaOut;', // 3D LAYERS: 1 ⇒ output the layer\'s own alpha (transparent where the layer is), so each layer can be filtered on its own and stacked
    'uniform float uMatte;',    // 1 on moving diorama pages: no relief sheen / spec / emissive — the "plastic laminate" comes off, parallax carries the life
    'void main(){',
    // ENHANCE WHAT IS UNDERNEATH — never override it. The old filter lit every
    // scene as if it were dark (one bright source, the rest pushed into a blue
    // shadow floor). That sang on night plates but DISTORTED the bright ones:
    // it imposed fake shadow on a sunlit sky and bloomed the brights to mush.
    // This pass instead: trusts the real painting, adds living impasto relief +
    // a gentle source-glow, and deepens ONLY the pixels that are ALREADY dark.
    // Dark plates keep their chiaroscuro; light plates simply come alive.
    '  vec3 strokeAlb=texture2D(uCol,uv).rgb;',
    '  vec3 rasterAlb=texture2D(uRaster,uv).rgb;',
    // FIDELITY, ADAPTIVE: the PLATES ARE ALREADY PAINTERLY (the generator bakes
    // fine Van Gogh strokes into the jpg). So put the filter\'s own coarse strokes
    // ONLY where they sing — the dark, lit against the source. On bright + vivid
    // areas, trust the raster (its own brushwork is finer than ours), so pale
    // skies and small figures stay crisp instead of turning to milky noise.
    '  float rc=max(max(rasterAlb.r,rasterAlb.g),rasterAlb.b)-min(min(rasterAlb.r,rasterAlb.g),rasterAlb.b);',
    '  float rla=dot(rasterAlb,vec3(0.299,0.587,0.114));',
    '  float chromaTerm=mix(0.55,0.96,smoothstep(0.20,0.48,rc));',   // vivid message colours stay sharp
    '  float lumaTerm=smoothstep(0.44,0.84,rla);',                   // bright areas stay sharp (no stroke noise)
    '  float blend=clamp(max(chromaTerm,lumaTerm),0.55,0.97);',
    '  blend=max(blend, uCover*0.95);',
    '  vec3 alb=mix(strokeAlb, rasterAlb, blend);',
    // the scene\'s own light (auto-found bright points) — used ONLY to ADD glow
    // and to spare true-dark pixels near it; it never subtracts brightness.
    '  vec2 P=vec2(uv.x*uRes.x,(1.0-uv.y)*uRes.y);',
    '  float r=0.0; vec2 src=P; float bestw=0.0;',
    '  vec4 Ls[3]; Ls[0]=uL0; Ls[1]=uL1; Ls[2]=uL2;',
    '  for(int i=0;i<3;i++){ if(Ls[i].w>0.0){ float d=length(P-Ls[i].xy); float c=Ls[i].w*exp(-d/Ls[i].z); r+=c; if(c>bestw){bestw=c; src=Ls[i].xy;} } }',
    '  float pulse=1.0+0.05*sin(uTime*0.9 - length(P-src)*0.015);',
    '  float lit=clamp(r*pulse,0.0,1.0);',
    // impasto relief from the moving paint-height field — THIS is the living feel
    '  float e=1.6;',
    '  float hL=texture2D(uHt,uv-vec2(uTexel.x*e,0.0)).r, hR=texture2D(uHt,uv+vec2(uTexel.x*e,0.0)).r;',
    '  float hD=texture2D(uHt,uv-vec2(0.0,uTexel.y*e)).r, hU=texture2D(uHt,uv+vec2(0.0,uTexel.y*e)).r;',
    '  float thick=texture2D(uHt,uv).r;',
    '  vec3 N=normalize(vec3((hL-hR)*5.0,(hU-hD)*5.0,1.0));',   // soft relief — a gentle sheen, not an overlay texture
    '  vec2 toL=normalize(src-P+vec2(0.001));',
    '  vec3 Ldir=normalize(vec3(toL*0.85,0.6));',
    '  vec3 H=normalize(Ldir+vec3(0.0,0.0,1.0));',
    '  float relief=max(dot(N,Ldir),0.0);',
    '  float spec=pow(max(dot(N,H),0.0),22.0)*smoothstep(0.08,0.5,thick);',
    // the image\'s OWN tones drive the look
    '  float la=dot(alb,vec3(0.299,0.587,0.114));',
    '  float mx=max(max(alb.r,alb.g),alb.b), mn=min(min(alb.r,alb.g),alb.b);',
    '  float chroma=mx-mn;',
    // MATTE (uMatte=1 on the moving diorama pages): the relief sheen + specular
    // gloss read as a PLASTIC LAMINATE over the art and flatten the depth —
    // there, the parallax IS the living feel, so the coating comes off and the
    // paint shows matte and true. Desktop + covers keep the full oil light.
    // 1) MATTE = FLAT, no relief emboss. The raised-stroke relief sheen is exactly
    //    what reads as "plastic" — so in matte it comes fully off (factor 1.0). The
    //    painting's richness comes from the baked strokes + colour, never from a
    //    lighting emboss. (Dynamism = more MARKS, not more sheen.)
    '  vec3 col=alb*mix(0.95+0.11*relief, 1.0, uMatte);',
    // 2) deepen ONLY pixels that are already dark AND out of the light\'s reach.
    //    bright scenes have almost no \'dark\', so they are left untouched — no
    //    blue wash on a sunlit field. (dark*dark = only the genuine shadows fall)
    '  float dark=1.0-la;',
    '  float shade=dark*dark*(1.0-lit);',
    '  vec3 shadowTint=vec3(0.60,0.69,0.96);',   // shadows read as deep blue-violet, never black
    '  col=mix(col, col*shadowTint, shade*mix(0.5, 0.2, uMatte));',
    '  col += vec3(0.045,0.045,0.10)*shade*(1.0-uMatte*0.7);',
    // 3) the source adds a warm glow, strongest where light meets the dark
    '  col += vec3(1.0,0.96,0.86)*lit*0.20*(0.45+0.55*dark)*mix(1.0, 0.5, uMatte);',
    // 4) self-luminous pigment — TAMED: only the very brightest / most vivid
    //    paint glows on its own, so bright plates no longer bloom into mush
    '  float emA=smoothstep(0.86,1.0,la)*0.4 + smoothstep(0.46,0.70,chroma)*0.4;',
    '  col += alb*emA*0.14*(1.0-uMatte);',
    // 5) impasto highlight — ONLY where the scene light rakes the paint (near a
    //    source); no all-over white sparkle that turns a pale sky milky
    '  col += spec*lit*vec3(1.0,0.95,0.82)*0.30*(1.0-uMatte);',
    // gentle vibrance for kids\' eyes — eased so brights do not oversaturate
    '  float g=dot(col,vec3(0.299,0.587,0.114)); col=mix(vec3(g),col,mix(1.16, 1.05, uMatte));',
    '  float oa=mix(1.0, texture2D(uRaster,uv).a, uAlphaOut);',   // layer coverage (1 for opaque background)
    '  gl_FragColor=vec4(clamp(col,0.0,1.0)*oa, oa);',            // premultiplied — composites cleanly when stacked
    '}'
  ].join('\n');

  function sh(t, s) { var o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) { return null; } return o; }
  function prog(v, f) { var vs = sh(gl.VERTEX_SHADER, v), fs = sh(gl.FRAGMENT_SHADER, f); if (!vs || !fs) return null; var p = gl.createProgram(); gl.attachShader(p, vs); gl.attachShader(p, fs); gl.linkProgram(p); if (!gl.getProgramParameter(p, gl.LINK_STATUS)) return null; return p; }
  // BLIT: composite one layer's sharp raster into the shared raster buffer at a
  // parallax offset (composite-once multiplane: many layers, ONE lighting pass).
  var BLIT_VERT = 'attribute vec2 p; uniform vec2 uOffClip; varying vec2 uv; void main(){ uv=p*0.5+0.5; gl_Position=vec4(p+uOffClip,0.0,1.0); }';
  var BLIT_FRAG = 'precision mediump float; varying vec2 uv; uniform sampler2D uTex; void main(){ gl_FragColor=texture2D(uTex,uv); }';
  // DIORAMA BLIT: composite a plane's sharp raster through the same camera the
  // strokes use — per-pixel INVERSE mapping (target → source), exact for a
  // plane, transparent outside the cel (no clamp-smear at the edges).
  var BLIT2_VERT = 'attribute vec2 p; varying vec2 uv; void main(){ uv=p*0.5+0.5; gl_Position=vec4(p,0.0,1.0); }';
  var BLIT2_FRAG = [
    'precision highp float; varying vec2 uv; uniform sampler2D uTex;',
    'uniform float uPlane; uniform float uSc; uniform vec2 uOff2; uniform vec4 uGnd; uniform float uCx; uniform vec2 uWH; uniform float uTy;',
    'void main(){',
    '  vec2 px = vec2(uv.x*uWH.x, (1.0-uv.y)*uWH.y);',
    '  vec2 sp;',
    '  if(uPlane>0.5){',
    '    px -= uOff2;',                                     // undo the reference-depth anchor shift first
    '    float Zp = (uGnd.y + uTy) / max(px.y - uGnd.x, 0.001);',   // Z at the TARGET row (risen camera)
    '    float Z  = Zp + uGnd.w;',                          // source row is one dolly-step farther
    '    vec2 g = vec2(uCx + ((px.x-uCx)*Zp + uGnd.z)/Z, uGnd.x + uGnd.y/Z);',
    '    float below = clamp((px.y - uGnd.x)/24.0, 0.0, 1.0);',
    '    sp = mix(px, g, below);',
    '  } else { sp = (px - uOff2)/max(uSc, 0.001); }',
    '  vec2 suv = vec2(sp.x/uWH.x, 1.0-sp.y/uWH.y);',
    '  if(suv.x<0.0||suv.x>1.0||suv.y<0.0||suv.y>1.0){ gl_FragColor=vec4(0.0); return; }',
    '  gl_FragColor = texture2D(uTex, suv);',
    '}'
  ].join('\n');
  var P = prog(VERT, FRAG), FP = prog(FIN_VERT, FIN_FRAG), BP = prog(BLIT_VERT, BLIT_FRAG), BP2 = prog(BLIT2_VERT, BLIT2_FRAG);
  if (!P || !FP || !BP || !BP2) return;

  var quad = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, quad); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  var U = { uTime: gl.getUniformLocation(P, 'uTime'), uVB: gl.getUniformLocation(P, 'uVB'), uMode: gl.getUniformLocation(P, 'uMode'), uLayerOff: gl.getUniformLocation(P, 'uLayerOff'),
    uPlane: gl.getUniformLocation(P, 'uPlane'), uSc: gl.getUniformLocation(P, 'uSc'), uGnd: gl.getUniformLocation(P, 'uGnd'), uCx: gl.getUniformLocation(P, 'uCx'), uTy: gl.getUniformLocation(P, 'uTy') };
  var BU = { p: gl.getAttribLocation(BP, 'p'), uOffClip: gl.getUniformLocation(BP, 'uOffClip'), uTex: gl.getUniformLocation(BP, 'uTex') };
  var B2 = { p: gl.getAttribLocation(BP2, 'p'), uTex: gl.getUniformLocation(BP2, 'uTex'), uPlane: gl.getUniformLocation(BP2, 'uPlane'), uSc: gl.getUniformLocation(BP2, 'uSc'),
    uOff2: gl.getUniformLocation(BP2, 'uOff2'), uGnd: gl.getUniformLocation(BP2, 'uGnd'), uCx: gl.getUniformLocation(BP2, 'uCx'), uWH: gl.getUniformLocation(BP2, 'uWH'), uTy: gl.getUniformLocation(BP2, 'uTy') };
  var FU = {};
  ['uCol', 'uHt', 'uRaster', 'uTexel', 'uTime', 'uRes', 'uL0', 'uL1', 'uL2', 'uCover', 'uAlphaOut', 'uMatte', 'p'].forEach(function (n) { FU[n] = (n === 'p') ? gl.getAttribLocation(FP, n) : gl.getUniformLocation(FP, n); });
  var aP = { aPos: gl.getAttribLocation(P, 'aPos'), aAnchor: gl.getAttribLocation(P, 'aAnchor'), aAcross: gl.getAttribLocation(P, 'aAcross'), aAlong: gl.getAttribLocation(P, 'aAlong'), aCol: gl.getAttribLocation(P, 'aCol'), aImp: gl.getAttribLocation(P, 'aImp') };

  var colFBO = null, htFBO = null, rasFBO = null, fboW = 0, fboH = 0;
  function makeFBO(w, h) {
    var tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    var fb = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, fb); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    return { fb: fb, tex: tex };
  }
  function sizeFBOs(w, h) {
    if (w === fboW && h === fboH && colFBO) return;
    fboW = w; fboH = h; colFBO = makeFBO(w, h); htFBO = makeFBO(w, h); rasFBO = makeFBO(w, h);
  }

  // ---------- geometry build from a plate's raster ----------
  function hashf(x) { var s = Math.sin(x) * 43758.5453; return s - Math.floor(s); }
  function profileAt(t, seed) {
    var glob = 0.16 + 0.12 * hashf(seed * 1.7);
    var base = (t < glob) ? (0.5 + 0.5 * (t / glob)) : (1.0 - 0.80 * ((t - glob) / (1.0 - glob)));
    var wob = 0.84 + 0.32 * hashf(seed * 3.1 + t * 9.0);
    return Math.max(0.12, base * wob);
  }

  function buildView(view, opts) {
    // TIME-SLICED: never blocks a frame for more than ~5ms. Returns true only
    // when the geometry is complete; callers render the static <picture> until
    // then. (The old synchronous build froze the main thread 150-900ms at every
    // page landing — the whole book felt laggy while the paint itself was cheap.)
    opts = opts || {};
    var img = opts.img || ((view.panoActive && view.landImg) ? view.landImg : view.img);
    var store = opts.store || view;
    if (store.built) return true;
    var W = view.w, H = view.h;
    var deadline = opts.deadline || (performance.now() + 5);
    if (!store.bld) {
      var sw0 = 256, shh0 = Math.max(1, Math.round(256 * H / W));
      var bld0 = { phase: 0, sbmp: null, fbmp: null, fail: false };
      store.bld = bld0;
      if (window.createImageBitmap) {
        // decode + resize OFF the main thread — the whole reason the old build froze
        createImageBitmap(img, { resizeWidth: sw0, resizeHeight: shh0, resizeQuality: 'medium' })
          .then(function (b) { bld0.sbmp = b; }, function (e) { bld0.fail = true; console.warn('CIB-S-FAIL', e && e.message); });
        createImageBitmap(img)
          .then(function (b) { bld0.fbmp = b; }, function (e) { bld0.fail = true; console.warn('CIB-F-FAIL', e && e.message); });
      } else { bld0.fail = true; }   // old Safari: fall back to the sync path below
      return false;
    }
    var bld = store.bld;
    if (bld.phase === 0) {
      if (!bld.fail && (!bld.sbmp || !bld.fbmp)) return false;   // decodes still in flight
      bld.phase = 1;
    }
    if (bld.phase >= 6) return buildSlice(view, opts, store, deadline);
    if (bld.phase >= 2 && bld.phase < 5) {          // one light-centroid pass per frame
      if (!bld.lightPass()) bld.phase = 5; else bld.phase++;
      if (bld.phase >= 5) { bld.lightsDone(); bld.phase = 6; }
      return false;
    }
    if (bld.phase === 5) { bld.lightsDone(); bld.phase = 6; return false; }
    bld.phase = 2;
    // sample the displayed painting into a small offscreen for colour + light
    var sw = 256, shh = Math.max(1, Math.round(256 * H / W));
    var oc = document.createElement('canvas'); oc.width = sw; oc.height = shh;
    var octx = oc.getContext('2d', { willReadFrequently: true });   // CPU canvas: getImageData must never sync the GPU queue
    octx.clearRect(0, 0, sw, shh); octx.drawImage(bld.sbmp || img, 0, 0, sw, shh);
    var id; try { id = octx.getImageData(0, 0, sw, shh).data; } catch (e) { store.bld = null; return false; }
    function sample(x, y) { var sx = Math.max(0, Math.min(sw - 1, x / W * sw | 0)), sy = Math.max(0, Math.min(shh - 1, y / H * shh | 0)); var i = (sy * sw + sx) * 4; return [id[i], id[i + 1], id[i + 2]]; }
    function alphaAt(x, y) { var sx = Math.max(0, Math.min(sw - 1, x / W * sw | 0)), sy = Math.max(0, Math.min(shh - 1, y / H * shh | 0)); return id[(sy * sw + sx) * 4 + 3]; }
    function lum(x, y) { var c = sample(x, y); return (c[0] * 0.299 + c[1] * 0.587 + c[2] * 0.114) / 255; }

    // FIND THE LIGHT in the scene: brightest-weighted centroids — ONE pass per
    // frame (each pass sweeps the whole sample twice; three at once broke budget)
    bld.lightPass = function () {
      var lights = bld._lights || (bld._lights = []);
      var used = bld._used || (bld._used = new Float32Array(sw * shh));
      var sx = 0, sy = 0, swgt = 0, peak = 0;
      for (var yy = 0; yy < shh; yy++) for (var xx = 0; xx < sw; xx++) {
        var i = (yy * sw + xx); var c = (id[i * 4] * 0.299 + id[i * 4 + 1] * 0.587 + id[i * 4 + 2] * 0.114) / 255;
        var wv = Math.max(0, c - 0.55); wv = wv * wv * (1 - used[i]);
        if (wv > 0) { sx += xx * wv; sy += yy * wv; swgt += wv; if (c > peak) peak = c; }
      }
      if (swgt < 0.5) return false;   // no further source
      var lx = sx / swgt, ly = sy / swgt;
      lights.push({ x: lx / sw * W, y: ly / shh * H, w: lights.length === 0 ? 1.0 : 0.6, peak: peak });
      var rr = sw * 0.22;
      for (var yy2 = 0; yy2 < shh; yy2++) for (var xx2 = 0; xx2 < sw; xx2++) { var d = Math.hypot(xx2 - lx, yy2 - ly); used[yy2 * sw + xx2] = Math.min(1, used[yy2 * sw + xx2] + Math.exp(-d * d / (rr * rr))); }
      return true;
    };
    bld.lightsDone = function () {
      var lights = bld._lights || [];
      if (!lights.length) lights.push({ x: W * 0.5, y: H * 0.45, w: 1.0 });
      store.lights = lights;
      store.reach = Math.hypot(W, H) * 0.30;
    };

    // generate the brushwork: dense ground coat + mid + fine, all from the raster
    var V = [];
    var rng = 12345; function rnd() { rng = (rng * 1103515245 + 12345) & 0x7fffffff; return rng / 0x7fffffff; }
    var sidx = 0;
    function emit(cx, cy, ln, baseW) {
      if (opts.skipTransparent && alphaAt(cx, cy) < 110) return;   // foreground: no strokes where the layer is transparent
      var rgb = sample(cx, cy);
      // orient along the form (perp to the luminance gradient), hand-wobbled
      var gx = lum(cx + 5, cy) - lum(cx - 5, cy), gy = lum(cx, cy + 5) - lum(cx, cy - 5);
      var ang = Math.atan2(gx, -gy); if (Math.hypot(gx, gy) < 0.01) ang = (rnd() - 0.5) * 0.8; ang += (rnd() - 0.5) * 0.5;
      var k = sidx++; var a = WORD.charCodeAt(k % WORD.length), va = (Math.sin(a * 12.9898 + k * 0.137) * 43758.5453); va = va - Math.floor(va);
      var b = WORD.charCodeAt((k * 7 + 3) % WORD.length), vb = (Math.sin(b * 7.13 + k * 0.21) * 9234.1); vb = vb - Math.floor(vb);
      var L = ln * (0.58 + va * va * 1.4), w = baseW * (0.6 + vb * 1.05);
      var imp = 0.45 + hashf(k * 2.3) * 1.05;
      var dx = Math.cos(ang), dy = Math.sin(ang), nx = -dy, ny = dx;
      var c1 = (rnd() - 0.5) * L * 0.5, c2 = (rnd() - 0.5) * L * 0.5;
      var pts = [[cx - dx * L * 0.5, cy - dy * L * 0.5], [cx - dx * L * 0.16 + nx * c1, cy - dy * L * 0.16 + ny * c1], [cx + dx * L * 0.16 + nx * c2, cy + dy * L * 0.16 + ny * c2], [cx + dx * L * 0.5, cy + dy * L * 0.5]];
      var n = pts.length, seed = k * 1.7 + va;
      var Lt = [], Rt = [];
      for (var ii = 0; ii < n; ii++) {
        var pa = pts[Math.max(0, ii - 1)], pb = pts[Math.min(n - 1, ii + 1)];
        var tx = pb[0] - pa[0], ty = pb[1] - pa[1], tl = Math.hypot(tx, ty) || 1; tx /= tl; ty /= tl;
        var hw = 0.5 * w * profileAt(n > 1 ? ii / (n - 1) : 0.5, seed);
        Lt.push([pts[ii][0] - ty * hw, pts[ii][1] + tx * hw]); Rt.push([pts[ii][0] + ty * hw, pts[ii][1] - tx * hw]);
      }
      var r0 = rgb[0] / 255, g0 = rgb[1] / 255, b0 = rgb[2] / 255;
      function vert(p, across, along) { V.push(p[0], p[1], cx, cy, across, along, r0, g0, b0, imp); }
      for (var s2 = 0; s2 < n - 1; s2++) { var a0 = s2 / (n - 1), a1 = (s2 + 1) / (n - 1); vert(Lt[s2], 1, a0); vert(Rt[s2], -1, a0); vert(Rt[s2 + 1], -1, a1); vert(Lt[s2], 1, a0); vert(Rt[s2 + 1], -1, a1); vert(Lt[s2 + 1], 1, a1); }
    }
    var u = Math.min(W, H) / (isMobile ? 38 : 50);   // bigger, fewer strokes on phones
    // FOUR scales of mark (Van Gogh's whole vocabulary); cel layers skip the
    // accent dabs — the oil bake already carries their flecks.
    bld.grids = [
      [u * 0.92, u * 2.0, u * 1.15, u * 2.7, u * 1.2, 1.0],   // 1 · BIG sweeping strokes
      [u * 1.2, u * 1.1, u * 0.8, u * 1.3, u * 0.7, 1.4],     // 2 · medium body
      [u * 1.7, u * 0.7, u * 0.6, u * 0.7, u * 0.5, 1.7],     // 3 · fine detail
    ];
    if (!opts.rgba) bld.grids.push([u * 1.5, u * 0.4, u * 0.4, u * 0.4, u * 0.34, 2.2]);   // 4 · tiny accent dabs
    bld.gi = 0; bld.gy = -bld.grids[0][0];
    bld.V = V; bld.emit = emit; bld.rnd = rnd; bld.img = bld.fbmp || img;
    return false;   // grids start on the next slice — this frame already paid for sampling
  }

  // one budgeted slice of grid emission; the last slice does the GPU uploads
  function buildSlice(view, opts, store, deadline) {
    var bld = store.bld, W = view.w, H = view.h;
    var V = bld.V, emit = bld.emit, rnd = bld.rnd;
    while (bld.up === undefined && bld.gi < bld.grids.length) {
      var g = bld.grids[bld.gi], step = g[0];
      while (bld.gy < H + step) {
        var gy = bld.gy;
        for (var gx = -step; gx < W + step; gx += step) {
          emit(gx + (rnd() - 0.5) * step * g[5], gy + (rnd() - 0.5) * step * g[5], g[1] + rnd() * rnd() * g[2] * 1.6, g[3] + rnd() * g[4]);
        }
        bld.gy += step;
        if (performance.now() > deadline) return false;   // out of budget — resume next frame
      }
      bld.gi++;
      if (bld.gi < bld.grids.length) bld.gy = -bld.grids[bld.gi][0];
    }
    // the two GPU uploads each get their own slice — no single frame carries both
    if (bld.up === undefined) { bld.up = 0; return false; }
    if (bld.up === 0) {
      var arr = new Float32Array(V);
      if (!store.buf) store.buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, store.buf); gl.bufferData(gl.ARRAY_BUFFER, arr, gl.STATIC_DRAW);
      bld.up = 1; return false;
    }
    // the sharp painting, so the message reads through the brushwork (RGBA so a
    // foreground layer keeps its transparency for the alpha-aware filter)
    var fmt = opts.rgba ? gl.RGBA : gl.RGB;
    if (!store.rasterTex) store.rasterTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, store.rasterTex);
    // UNPACK_FLIP_Y_WEBGL is spec-IGNORED for ImageBitmap sources — modern
    // Chrome/Safari follow the spec, so uploading the bitmap directly renders
    // the whole painting upside down (older builds honored the flag, which is
    // why this ever worked). Route the bitmap through a 2D canvas: the flip
    // flag applies to canvas sources on every browser, past and present.
    var up = bld.img;
    if (window.ImageBitmap && up instanceof ImageBitmap) {
      var flipC = document.createElement('canvas');
      flipC.width = up.width; flipC.height = up.height;
      flipC.getContext('2d').drawImage(up, 0, 0);
      up = flipC;
    }
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, fmt, fmt, gl.UNSIGNED_BYTE, up);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    store.nVerts = V.length / 10; store.built = true;
    if (bld.sbmp && bld.sbmp.close) bld.sbmp.close();
    if (bld.fbmp && bld.fbmp.close) bld.fbmp.close();
    store.bld = null;
    return true;
  }

  // ---------- per-page views ----------
  // most readers are on phones: detect, and keep the heavy GL pass cheap
  var isMobile = Math.min(screen.width, screen.height) < 560 || window.matchMedia('(pointer: coarse)').matches;
  var dpr = Math.min(isMobile ? 2 : 2.5, window.devicePixelRatio || 1);
  var GLCAP = isMobile ? 1500 : 2800;   // cap the offscreen render long-side; the 2D blit upscales
  var views = [];
  pages.forEach(function (page, idx) {
    var img = page.querySelector('img'); if (!img) return;
    var cv = document.createElement('canvas'); cv.className = 'paint-live'; cv.setAttribute('aria-hidden', 'true');
    cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none';
    var pic = page.querySelector('picture') || img;
    // the galaxy covers carry their own verse-mote sparkle overlay (canvas.live);
    // the living filter goes BELOW it (real painting + glow under crisp motes).
    // On the covers the filter holds the painting (uCover) and renders full-res,
    // so it MATCHES the masterpiece — alive, but never a blurry re-paint.
    var motes = page.querySelector('canvas.live');
    if (motes) page.insertBefore(cv, motes);
    else pic.parentNode.insertBefore(cv, pic.nextSibling);  // above the painting, below the text
    var fX = parseFloat(page.getAttribute('data-focal-x'));
    var imgSrc = img.getAttribute('src');
    var layered = page.hasAttribute('data-layers');   // MULTIPLANE depth planes exist
    var base = imgSrc.replace(/\.jpg(\?.*)?$/, '');
    /* ⚠ KEEP THE VERSION QUERY. `base` strips `.jpg?p=NN`, and every plane path was then
       built WITHOUT it — so this filter fetched `/plates-vg/<name>-bg.jpg` bare while
       scene.js fetched `...-bg.jpg?p=91`. The browser happily served its old cached copy
       for the bare URL, and once the filter finished building (a few seconds in) it
       painted THAT over the page. Which is exactly what Fred saw: the new picture on
       load, the old one a minute later, on phone and desktop alike, surviving every
       rebuild, every deploy and every cache-bust I could think of. */
    var ver = (imgSrc.match(/\?[^"']*$/) || [''])[0];
    // depth planes, FAR → NEAR. depth drives parallax (0 = far, 1 = near); a plane
    // at depth 0.5 (REF) is the ANCHOR — it does not slide, so it never reveals an
    // edge. data-layers is a comma list of band NAMES; a name may carry an EXPLICIT
    // depth as "name@0.5" (decouples parallax-depth from draw order — needed once a
    // plate has >5 layers, e.g. to keep the ground plane anchored while many
    // background layers sit behind it). Otherwise the standard ladder / even spacing
    // is used. The FIRST band is the opaque backmost (.jpg); the rest are cels (.png).
    var LADDER = { sky: 0.0, far: 0.26, mid: 0.5, near: 0.74, fg: 1.0 };
    var planes = null;
    if (layered) {
      var spec = (page.getAttribute('data-layers') || '').trim();
      if (spec) {
        var names = spec.split(',').map(function (s) { return s.trim(); }).filter(Boolean);
        planes = names.map(function (tok, i) {
          var at = tok.indexOf('@');
          var nm = at >= 0 ? tok.slice(0, at) : tok;
          var ed = at >= 0 ? parseFloat(tok.slice(at + 1)) : NaN;   // explicit depth, if given
          var opaque = (i === 0);
          var d = !isNaN(ed) ? ed : (LADDER[nm] !== undefined ? LADDER[nm] : (names.length > 1 ? i / (names.length - 1) : 0));
          return { src: base + '-' + nm + (opaque ? '.jpg' : '.png') + ver, nm: nm, depth: d, rgba: !opaque, img: null, store: {} };
        });
      } else {
        planes = [
          { src: base + '-sky.jpg' + ver, depth: 0.0, rgba: false, img: null, store: {} },
          { src: base + '-ground.png' + ver, depth: 0.45, rgba: true, img: null, store: {} },
          { src: base + '-fg.png' + ver, depth: 1.0, rgba: true, img: null, store: {} },
        ];
      }
    }
    // DIORAMA: true one-point perspective. JSON attr, all coords as FRACTIONS of
    // the plate: {"vp":[x,y] vanishing point/horizon, "objects":{planeName:[x,y]
    // ground-anchor of that billboard}}. The plane named "ground" is reprojected
    // as a real receding plane; object planes scale with true distance about
    // their mapped anchor (planted by construction); the first (opaque) plane is
    // the static sky. Tilt X = camera truck; tilt UP = dolly INTO the painting.
    var dio = null;
    if (page.hasAttribute('data-diorama')) { try { dio = JSON.parse(page.getAttribute('data-diorama')); } catch (e) { dio = null; } }
    views.push({ page: page, img: img, cv: cv, ctx: cv.getContext('2d'), idx: idx, built: false, w: 0, h: 0, painted: false, cover: !!motes,
      pano: page.hasAttribute('data-panorama'), focalX: isNaN(fX) ? 0.5 : fX,   // MOBILE PANORAMA (multiplane depth)
      dio: dio,
      landSrc: imgSrc, planes: planes,
      landImg: null, panoActive: false, panCurX: 0, panCurY: 0, panVelX: 0, panVelY: 0, panInit: false });
  });
  if (!views.length) return;

  // MOBILE PANORAMA: in portrait, a landscape page becomes a wide canvas (full
  // height) that the living filter renders onto and that pans with device tilt.
  function portraitNow() { return window.innerHeight >= window.innerWidth; }

  function layout(v) {
    // WINDOWING (memory): keep a full-size canvas ONLY for the page in view and its
    // immediate neighbours. Far pages hold a 1×1 canvas — otherwise all 33 full
    // 4K-class buffers (~20 MB each) are allocated at once and phones run out of GPU
    // memory → the context is lost → the page crashes. Re-sizes on approach (the
    // frame loop calls layout the instant a page comes within reach).
    var posNow = book.scrollLeft / book.clientWidth;
    if (Math.abs(v.idx - posNow) > 1.6) {
      if (v.cv.width > 1) { v.cv.width = 1; v.cv.height = 1; }
      v.w = 0; v.h = 0; v.built = false; v.painted = false; v.panInit = false; v.panStart = null; v.bld = null;
      if (v.planes) for (var rbi = 0; rbi < v.planes.length; rbi++) v.planes[rbi].store.bld = null;
      v.page.classList.remove('pano-on');
      return;
    }
    var pano = v.pano && portraitNow();
    if (pano && !v.landImg) {                                  // full landscape (aspect + non-layered raster)
      v.landImg = new Image(); v.landImg.decoding = 'async';
      v.landImg.onload = function () { v.built = false; v.bld = null; start(); };
      v.landImg.src = v.landSrc;
    }
    if (pano && v.planes) {                                    // load each depth plane once; rebuild strokes at new size
      for (var pi = 0; pi < v.planes.length; pi++) {
        var pl = v.planes[pi];
        if (!pl.img) { pl.img = new Image(); pl.img.decoding = 'async'; (function (s) { pl.img.onload = function () { s.built = false; s.bld = null; start(); }; })(pl.store); pl.img.src = pl.src; }
        pl.store.built = false; pl.store.bld = null;
      }
    }
    var w, h;
    if (pano) {
      // size the canvas LARGER than the viewport in BOTH axes (ZOOM), so it can
      // pan horizontally AND vertically — the phone becomes a window you look
      // AROUND through (2-axis tilt), not just left/right.
      var ZOOM = 1.18;
      h = Math.round(v.page.clientHeight * ZOOM);
      var asp = (v.landImg && v.landImg.naturalWidth) ? (v.landImg.naturalWidth / v.landImg.naturalHeight) : 1.6;
      w = Math.round(h * asp);                                  // wider AND taller than the screen
      v.cv.style.inset = 'auto'; v.cv.style.left = '0'; v.cv.style.top = '0';
      v.cv.style.width = 'auto'; v.cv.style.height = (ZOOM * 100).toFixed(2) + '%';
      var rr = Math.max(0, w - v.page.clientWidth);
      v.panCurX = Math.max(rr * 0.13, Math.min(rr * 0.87, v.focalX * w - v.page.clientWidth / 2));   // OPEN already framed on the focal subject (no slide-in from the edge)
      v.panCurY = Math.max(0, h - v.page.clientHeight) / 2;
      v.panVelX = 0; v.panVelY = 0; v.panInit = true; v.panStart = null;
      v.page.classList.add('pano-on');
    } else {
      w = v.page.clientWidth; h = v.page.clientHeight;
      v.cv.style.inset = '0'; v.cv.style.left = ''; v.cv.style.top = '';
      v.cv.style.width = '100%'; v.cv.style.height = '100%'; v.cv.style.transform = '';
      v.panInit = false; v.page.classList.remove('pano-on');
    }
    v.panoActive = pano;
    v.w = w; v.h = h; v.cv.width = Math.round(w * dpr); v.cv.height = Math.round(h * dpr);
    v.built = false; v.painted = false; v.bld = null;
  }
  views.forEach(layout);

  function renderView(v, t) {
    var rimg = (v.panoActive && v.landImg) ? v.landImg : v.img;
    if (!rimg || !rimg.complete || !rimg.naturalWidth) return false;
    var dGW = Math.round(v.w * dpr), dGH = Math.round(v.h * dpr);     // display-canvas size
    var cap = (v.cover && !v.panoActive) ? 4096 : GLCAP;              // covers render full-res (crisp, the hero); but a panned cover uses the cheaper cap (it stacks several depth planes per frame)
    var rs = Math.min(1, cap / Math.max(dGW, dGH));                   // cap the heavy offscreen render
    var GW = Math.max(2, Math.round(dGW * rs)), GH = Math.max(2, Math.round(dGH * rs));
    if (glcv.width !== GW || glcv.height !== GH) { glcv.width = GW; glcv.height = GH; }
    sizeFBOs(GW, GH);
    var multiplane = v.panoActive && v.planes;
    if (!multiplane && !v.built) { if (!buildView(v)) return false; }   // single-layer builds v.buf

    var stride = 10 * 4, sc = dpr * rs;
    function pt(loc, size, off) { if (loc < 0) return; gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, size, gl.FLOAT, false, stride, off * 4); }
    // render ONE layer's 3 passes (albedo, height, lit) into glcv. alphaOut=1 ⇒
    // the layer keeps its transparency, so it can be composited over another.
    function passes(buf, nVerts, rasterTex, lights, reach, alphaOut) {
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      pt(aP.aPos, 2, 0); pt(aP.aAnchor, 2, 2); pt(aP.aAcross, 1, 4); pt(aP.aAlong, 1, 5); pt(aP.aCol, 3, 6); pt(aP.aImp, 1, 9);
      gl.useProgram(P);
      gl.uniform1f(U.uTime, t); gl.uniform2f(U.uVB, v.w, v.h); gl.uniform2f(U.uLayerOff, 0, 0);
      gl.uniform1f(U.uPlane, 0); gl.uniform1f(U.uSc, 1); gl.uniform1f(U.uTy, 0);   // identity — unset uniforms default to 0 and uSc=0 would collapse the strokes; uTy persists per program so reset it
      gl.viewport(0, 0, GW, GH); gl.enable(gl.BLEND);
      gl.bindFramebuffer(gl.FRAMEBUFFER, colFBO.fb); gl.clearColor(0.06, 0.09, 0.20, 1); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(U.uMode, 0); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); gl.drawArrays(gl.TRIANGLES, 0, nVerts);
      gl.bindFramebuffer(gl.FRAMEBUFFER, htFBO.fb); gl.clearColor(0, 0, 0, 1); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(U.uMode, 1); gl.blendFunc(gl.ONE, gl.ONE); gl.drawArrays(gl.TRIANGLES, 0, nVerts);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, GW, GH); gl.disable(gl.BLEND);
      gl.useProgram(FP);
      gl.bindBuffer(gl.ARRAY_BUFFER, quad); gl.enableVertexAttribArray(FU.p); gl.vertexAttribPointer(FU.p, 2, gl.FLOAT, false, 0, 0);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, colFBO.tex); gl.uniform1i(FU.uCol, 0);
      gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, htFBO.tex); gl.uniform1i(FU.uHt, 1);
      gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, rasterTex); gl.uniform1i(FU.uRaster, 2);
      gl.uniform2f(FU.uTexel, 1 / GW, 1 / GH); gl.uniform1f(FU.uTime, t); gl.uniform2f(FU.uRes, GW, GH);
      gl.uniform1f(FU.uCover, v.cover ? 1 : 0); gl.uniform1f(FU.uAlphaOut, alphaOut);
      gl.uniform1f(FU.uMatte, 1);   // matte EVERYWHERE — story pages AND the covers (no plastic gloss anywhere)
      function setL(slot, i) { if (i < lights.length) gl.uniform4f(slot, lights[i].x * sc, lights[i].y * sc, reach * sc, lights[i].w); else gl.uniform4f(slot, 0, 0, 1, 0); }
      setL(FU.uL0, 0); setL(FU.uL1, 1); setL(FU.uL2, 2);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    if (multiplane) {
      // COMPOSITE-ONCE MULTIPLANE: every depth plane draws its strokes + its sharp
      // raster into SHARED buffers at its own parallax offset (cheap geometry), and
      // the expensive lighting/relief pass runs EXACTLY ONCE over the whole stack.
      // Cost is ~constant in the number of layers, so we can stack many depth shells
      // — bg → layer → layer → … → filter on top (Fred's pipeline; the path to 1M
      // layers). Far lags, near leads; the ref plane rides the base pan.
      for (var pi = 0; pi < v.planes.length; pi++) { var pl = v.planes[pi]; if (!pl.img || !pl.img.complete || !pl.img.naturalWidth) return false; }
      var neuMX = Math.max(0, v.w - v.page.clientWidth) / 2, neuMY = Math.max(0, v.h - v.page.clientHeight) / 2, REF = 0.5, GAIN = 0.45;   // gentler layer-distance: phone stays closer to the desktop image, depth still reads
      // DIORAMA CAMERA: a real one-point-perspective camera instead of card-slides.
      // Depth unit: Z = 1 at the canvas bottom row of the ground. Tilt X → truck
      // (tx, px at Z=1). Tilt UP → dolly INTO the painting (tz, toward the
      // vanishing point); dolly-out is nearly clamped (it would reveal beyond the
      // painted frame). The idle auto-sway breathes the camera gently by itself.
      var dioP = null;
      if (v.dio && v.dio.vp) {
        var dv0 = v.dio.vp[1] * v.h, dk = Math.max(1, v.h - dv0), dcx = v.dio.vp[0] * v.w;
        var dtx0 = (v.panCurX - neuMX) * 0.28;   // gentle TILT-truck — depth leads, the pan follows
        var uZ = Math.min(1, Math.max(0, (v.tzCur || 0) / (v.dio.tzMax || 1)));
        // ORBIT ARC + RISE (per-page, fractions): the drone move — sideways and
        // up with depth. These deliberately BYPASS the anchor compensation below:
        // leaving the window is their whole purpose.
        var dtx = dtx0 + (v.dio.arc ? v.dio.arc * v.w * uZ : 0);
        var dty = (v.dio.rise || 0) * v.h * uZ;
        var dtz = v.tzCur || 0;
        // anchor ONLY the tilt-truck at reference depth Z=2 (computing this from
        // the arc-inclusive tx shoved the opaque backdrop off-frame → black)
        var dox = dtx0 / Math.max(0.05, 2.0 - dtz);
        dioP = { v0: dv0, k: dk, cx: dcx, tx: dtx, tz: dtz, ox: dox, ty: dty };
      }
      // build every plane's stroke field + raster texture (time-sliced, cached)
      var mpDeadline = performance.now() + 5, mpReady = true;
      for (var pj = 0; pj < v.planes.length; pj++) {
        var p = v.planes[pj];
        if (!p.store.built && !buildView(v, { img: p.img, store: p.store, rgba: p.rgba, skipTransparent: p.rgba, deadline: mpDeadline })) mpReady = false;
      }
      if (!mpReady) return false;   // the static picture holds until the strokes are ready
      // composite lights: merge every plane's auto-found sources, keep the brightest
      var allL = [];
      for (var li = 0; li < v.planes.length; li++) { var ls = v.planes[li].store.lights || []; for (var lj = 0; lj < ls.length; lj++) allL.push(ls[lj]); }
      allL.sort(function (a, b) { return (b.peak || 0) - (a.peak || 0); });
      var cLights = allL.slice(0, 3).map(function (L, k) { return { x: L.x, y: L.y, w: k === 0 ? 1.0 : 0.6 }; });
      if (!cLights.length) cLights = [{ x: v.w * 0.5, y: v.h * 0.45, w: 1.0 }];
      var cReach = v.planes[0].store.reach;
      // bind the stroke attribute layout once
      function bindStroke(buf) { gl.bindBuffer(gl.ARRAY_BUFFER, buf); pt(aP.aPos, 2, 0); pt(aP.aAnchor, 2, 2); pt(aP.aAcross, 1, 4); pt(aP.aAlong, 1, 5); pt(aP.aCol, 3, 6); pt(aP.aImp, 1, 9); }
      // 1) accumulate every plane's strokes (colFBO) + height (htFBO) + sharp
      //    raster (rasFBO), each shifted by its own parallax offset
      gl.viewport(0, 0, GW, GH); gl.enable(gl.BLEND);
      for (var pk = 0; pk < v.planes.length; pk++) {
        var pp = v.planes[pk];
        var mode = 0, sc = 1, offX, offY;
        if (dioP) {
          // ONE projection for every billboard: scale sc = Zb/(Zb−tz) about the
          // camera axis (vp). amx trucks by 1/Z; amy = v0 + (ay−v0)·sc — for a
          // ground-anchored object this IS the ground map of its anchor (feet
          // planted by construction); for an explicit-Z band it is the same
          // motion about the vanishing point. Depth is declared, not painted.
          var bb = function (ax, ay, Zb) {
            var Zp2 = Math.max(0.05, Zb - dioP.tz), sc2 = Zb / Zp2;
            var amx = dioP.ox + dioP.cx + ((ax - dioP.cx) * Zb - dioP.tx) / Zp2;
            var amy = dioP.v0 + ((ay - dioP.v0) * Zb + dioP.ty) / Zp2;   // + ty: billboards drop away as you rise, each by its own depth
            return { sc: sc2, ox: amx - ax * sc2, oy: amy - ay * sc2 };
          };
          if (pp.nm === (v.dio.ground || 'ground')) { mode = 1; offX = dioP.ox; offY = 0; }   // a plate may name ANY band as its receding ground (or none)
          else if (v.dio.objects && v.dio.objects[pp.nm]) {
            var an = v.dio.objects[pp.nm], ax = an[0] * v.w, ay = an[1] * v.h;
            var Zb = an.length > 2 ? an[2] : dioP.k / Math.max(0.001, ay - dioP.v0);   // [fx,fy] = ground-anchored; [fx,fy,Z] = declared depth
            var r = bb(ax, ay, Zb);
            sc = r.sc; offX = r.ox; offY = r.oy;
          } else if (v.dio.zauto) {
            // Z-AUTO: every unlisted band gets a declared depth from its ladder
            // position — far shells breathe, near shells fly past. This is how a
            // radial page becomes a tunnel you dolly into.
            // nonlinear ladder: near bands crowd the camera, far bands hang back —
            // the depth GRADIENT across the stack is what reads as a one-point cone
            var rz = bb(dioP.cx, dioP.v0, 1.15 + Math.pow(1 - pp.depth, 1.6) * 10);
            sc = rz.sc; offX = rz.ox; offY = rz.oy;
          } else { offX = dioP.ox; offY = 0; }   // the far sky drifts gently WITH the window
        } else {
          offX = (REF - pp.depth) * (v.panCurX - neuMX) * GAIN;
          offY = (REF - pp.depth) * (v.panCurY - neuMY) * GAIN;
          if (!pp.rgba) { offX = 0; offY = 0; }   // the OPAQUE backdrop never slides → never reveals a dark edge (fixes e.g. flame's far-left/right cut-off)
        }
        var first = (pk === 0);
        // strokes → colFBO (over) + htFBO (additive)
        bindStroke(pp.store.buf);
        gl.useProgram(P); gl.uniform1f(U.uTime, t); gl.uniform2f(U.uVB, v.w, v.h); gl.uniform2f(U.uLayerOff, offX, offY);
        gl.uniform1f(U.uPlane, mode); gl.uniform1f(U.uSc, sc);
        gl.uniform1f(U.uTy, dioP ? dioP.ty : 0);
        if (dioP) { gl.uniform4f(U.uGnd, dioP.v0, dioP.k, dioP.tx, dioP.tz); gl.uniform1f(U.uCx, dioP.cx); }
        gl.bindFramebuffer(gl.FRAMEBUFFER, colFBO.fb);
        if (first) { gl.clearColor(0.06, 0.09, 0.20, 1); gl.clear(gl.COLOR_BUFFER_BIT); }
        gl.uniform1f(U.uMode, 0); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); gl.drawArrays(gl.TRIANGLES, 0, pp.store.nVerts);
        gl.bindFramebuffer(gl.FRAMEBUFFER, htFBO.fb);
        if (first) { gl.clearColor(0, 0, 0, 1); gl.clear(gl.COLOR_BUFFER_BIT); }
        gl.uniform1f(U.uMode, 1); gl.blendFunc(gl.ONE, gl.ONE); gl.drawArrays(gl.TRIANGLES, 0, pp.store.nVerts);
        // sharp raster → rasFBO (alpha over), moved through the SAME camera
        gl.bindFramebuffer(gl.FRAMEBUFFER, rasFBO.fb);
        if (first) { gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT); }
        if (dioP) {
          gl.useProgram(BP2); gl.bindBuffer(gl.ARRAY_BUFFER, quad); gl.enableVertexAttribArray(B2.p); gl.vertexAttribPointer(B2.p, 2, gl.FLOAT, false, 0, 0);
          gl.uniform1f(B2.uPlane, mode); gl.uniform1f(B2.uSc, sc); gl.uniform2f(B2.uOff2, offX, offY);
          gl.uniform4f(B2.uGnd, dioP.v0, dioP.k, dioP.tx, dioP.tz); gl.uniform1f(B2.uCx, dioP.cx); gl.uniform2f(B2.uWH, v.w, v.h); gl.uniform1f(B2.uTy, dioP.ty);
          gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, pp.store.rasterTex); gl.uniform1i(B2.uTex, 0);
        } else {
          gl.useProgram(BP); gl.bindBuffer(gl.ARRAY_BUFFER, quad); gl.enableVertexAttribArray(BU.p); gl.vertexAttribPointer(BU.p, 2, gl.FLOAT, false, 0, 0);
          gl.uniform2f(BU.uOffClip, 2 * offX / v.w, -2 * offY / v.h);
          gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, pp.store.rasterTex); gl.uniform1i(BU.uTex, 0);
        }
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); gl.drawArrays(gl.TRIANGLES, 0, 3);
      }
      // 2) ONE lighting pass over the whole composited stack → glcv
      gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, GW, GH); gl.disable(gl.BLEND);
      gl.useProgram(FP);
      gl.bindBuffer(gl.ARRAY_BUFFER, quad); gl.enableVertexAttribArray(FU.p); gl.vertexAttribPointer(FU.p, 2, gl.FLOAT, false, 0, 0);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, colFBO.tex); gl.uniform1i(FU.uCol, 0);
      gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, htFBO.tex); gl.uniform1i(FU.uHt, 1);
      gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, rasFBO.tex); gl.uniform1i(FU.uRaster, 2);
      gl.uniform2f(FU.uTexel, 1 / GW, 1 / GH); gl.uniform1f(FU.uTime, t); gl.uniform2f(FU.uRes, GW, GH);
      gl.uniform1f(FU.uCover, v.cover ? 1 : 0); gl.uniform1f(FU.uAlphaOut, 0);   // composite is opaque (the back plane fills)
      gl.uniform1f(FU.uMatte, 1);   // matte EVERYWHERE — story pages AND the covers (no plastic gloss anywhere)
      (function () { function setL(slot, i) { if (i < cLights.length) gl.uniform4f(slot, cLights[i].x * sc, cLights[i].y * sc, cReach * sc, cLights[i].w); else gl.uniform4f(slot, 0, 0, 1, 0); } setL(FU.uL0, 0); setL(FU.uL1, 1); setL(FU.uL2, 2); })();
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      v.ctx.clearRect(0, 0, v.cv.width, v.cv.height);
      v.ctx.drawImage(glcv, 0, 0, GW, GH, 0, 0, v.cv.width, v.cv.height);
    } else {
      passes(v.buf, v.nVerts, v.rasterTex, v.lights, v.reach, 0);
      v.ctx.clearRect(0, 0, v.cv.width, v.cv.height);
      v.ctx.drawImage(glcv, 0, 0, GW, GH, 0, 0, v.cv.width, v.cv.height);
    }
    v.painted = true;
    // MOBILE PANORAMA: the phone is a window you look AROUND through — pan the
    // canvas horizontally with left/right tilt (gamma) AND vertically with
    // forward/back tilt (beta). Tilt LEFT → picture moves LEFT; tilt the top
    // toward you → look UP. (Or a gentle 2-axis auto-drift when no sensor.)
    if (v.panoActive) {
      var rangeX = Math.max(0, v.w - v.page.clientWidth), rangeY = Math.max(0, v.h - v.page.clientHeight);
      var mX = rangeX * 0.13, mY = rangeY * 0.16, leftX = mX, rightX = rangeX - mX;
      // REST FRAMES THE FOCAL SUBJECT, not the raw geometric centre of the wide
      // canvas — so a held-still phone shows exactly the designed portrait crop
      // (which is centred on data-focal-x). Pages whose subject sits off-centre
      // (e.g. bread focal 0.525) no longer rest slightly to one side.
      var neutralX = Math.max(mX, Math.min(rangeX - mX, v.focalX * v.w - v.page.clientWidth / 2)), neutralY = rangeY / 2;
      var MAXT = 18, DEAD = 0.7, span = MAXT - DEAD;   // low sensitivity = precise (a deliberate tilt spans the painting); dead-zone holds still at rest
      function gate(v0) { return v0 > DEAD ? v0 - DEAD : v0 < -DEAD ? v0 + DEAD : 0; }
      var cur = Math.round(book.scrollLeft / book.clientWidth);
      if ((v.idx === cur && !v.wasCurrent) || v.panStart == null) v.panStart = t;   // each time this page BECOMES the active one, restart the auto-pan from the LEFT
      v.wasCurrent = (v.idx === cur);
      var lt = t - v.panStart;
      var rawG = window.__panoTilt, rawB = window.__panoTiltY, tgtX, tgtY;
      var haveG = rawG !== null && rawG !== undefined;
      // gentle auto-pan targets — used when there is NO sensor, OR when the phone is
      // held still, so the painting always reads even if the reader never tilts.
      var autoX = leftX + (rightX - leftX) * (0.5 - 0.5 * Math.cos(lt * 0.18));   // left→right→left sweep, unhurried
      var autoY = neutralY + Math.sin(lt * 0.13) * (rangeY * 0.26);               // slow breathing — on diorama pages this IS the walk in and out
      // X — follow the tilt when the reader is actively moving the phone, else auto-pan.
      var tiltX = neutralX;
      if (haveG) {
        var pe = tiltEMA;
        if (tiltEMA === null) tiltEMA = rawG;
        else { var dG = rawG - tiltEMA; if (dG < 55 && dG > -55) tiltEMA += dG * 0.18; }   // heavier smoothing — hand tremor never reaches the paint; ignore orientation-flip glitches (the "jump")
        if (pe !== null && Math.abs(tiltEMA - pe) > 0.22) tiltIdle = 0; else tiltIdle++;   // moved meaningfully? → exploring
        // CALIBRATED CENTRE: the first reading lands mid-tap (the pill press
        // wobbles the hand) — keep re-centering for the first ~35 frames so the
        // resting grip, not the tap, becomes zero. No more jump on enable.
        if (gammaBase === null || calibN < 35) { gammaBase = tiltEMA; calibN++; }
        var gx = Math.max(-span, Math.min(span, gate(tiltEMA - gammaBase)));
        tiltX = neutralX - (gx / span) * (rangeX / 2);
      } else { tiltEMA = null; tiltIdle = 9999; gammaBase = null; }
      // HOLD STILL ⇒ STAY STILL. With a live sensor the reader's tilt is the ONLY
      // motion — no idle auto-sweep (it read as the picture drifting on its own).
      // The gentle auto-pan survives ONLY as the no-sensor fallback (pre-tap iOS /
      // denied permission / no gyro), where there is no other way to reveal the
      // whole panorama. (The living-paint stroke shimmer keeps the art alive; only
      // the camera rests.)
      var autoMix = haveG ? 0 : 1;
      tgtX = tiltX + (autoX - tiltX) * autoMix;
      // Y — same blend, driven by the same idle state
      var tiltY = neutralY;
      if (rawB !== null && rawB !== undefined) {
        var pb = betaEMA;
        if (betaEMA === null) betaEMA = rawB;
        else { var dB = rawB - betaEMA; if (dB < 55 && dB > -55) betaEMA += dB * 0.18; }
        if (pb !== null && Math.abs(betaEMA - pb) > 0.18) tiltIdle = 0;   // vertical tilt counts as exploring too — never fight the hand on EITHER axis
        if (betaBase === null || calibNB < 35) { betaBase = betaEMA; calibNB++; }   // settle-calibrated vertical centre too
        var gy = Math.max(-span, Math.min(span, gate(betaEMA - betaBase)));
        tiltY = neutralY - (gy / span) * (rangeY / 2);   // tilt top toward you → look UP
      } else { betaEMA = null; betaBase = null; }
      tgtY = tiltY + (autoY - tiltY) * autoMix;
      // DIORAMA DOLLY — a first-class control through its own slightly-
      // underdamped spring (the whisper of overshoot is what makes a game
      // camera feel alive). PINCH drives it (squeeze/expand = travel out/in,
      // like the infinite-zoom artists); tilt is the pure 2-axis look-around.
      // Idle = deep slow cinematic breathing.
      if (v.dio) {
        var tzMaxP = v.dio.tzMax || 1.0;
        if (window.__pinchT && (performance.now() - window.__pinchT) < 6000) tiltIdle = 0;   // pinching counts as exploring — the auto-pan yields
        var fracZ = Math.max(-1, Math.min(1, window.__pinchZ || 0));
        var groundy = false;
        if (v.planes) { var gnm = v.dio.ground || 'ground'; for (var gi = 0; gi < v.planes.length; gi++) if (v.planes[gi].nm === gnm) { groundy = true; break; } }
        // THE KNOB CURVE: scale = Z/(Z−tz) is HYPERBOLIC in tz — a linear tz feels
        // like a switch (nothing… nothing… BANG). Constant perceived zoom-rate
        // needs the near-shell scale to grow EXPONENTIALLY with the swipe, so tz
        // follows a geometric approach to the reference shell at Z*=1.5:
        var ZS = 1.5, tzTilt;
        if (fracZ > 0) tzTilt = ZS * (1 - Math.pow(Math.max(0.02, 1 - tzMaxP / ZS), fracZ));
        else tzTilt = fracZ * (groundy ? 0.06 : 0.15);
        var tzAuto = 0;   // ZOOM RETIRED — no idle dolly-breathe on ANY device (the zoom feature was removed; this guarantees zero auto-zoom everywhere, even before the first sensor reading). Tilt pans; nothing zooms.
        // a SET knob is respected: the idle breathing only takes over when the
        // reader has left the zoom at rest — never yanks a held position back
        var tzTgt = (Math.abs(fracZ) < 0.04) ? (tzTilt + (tzAuto - tzTilt) * autoMix) : tzTilt;
        if (v.tzCur === undefined) { v.tzCur = 0; v.tzVel = 0; }
        var KZ = 34, DZ = 2 * Math.sqrt(34);   // critically damped, tighter — tracks the thumb like a dimmer knob: no lag bump, no overshoot snap
        v.tzVel += ((tzTgt - v.tzCur) * KZ - v.tzVel * DZ) / 60;
        v.tzCur += v.tzVel / 60;
        if (v.tzCur > tzMaxP) { v.tzCur = tzMaxP; v.tzVel = 0; }
        if (v.tzCur < -0.2) { v.tzCur = -0.2; v.tzVel = 0; }
      }
      // keep a margin off the absolute edges: at full tilt the foreground planes
      // parallax-shift and would expose the backdrop in the corners. Stopping short
      // keeps every corner covered.
      if (tgtX < mX) tgtX = mX; else if (tgtX > rangeX - mX) tgtX = rangeX - mX;
      if (tgtY < mY) tgtY = mY; else if (tgtY > rangeY - mY) tgtY = rangeY - mY;
      if (!v.panInit) { v.panCurX = tgtX; v.panCurY = tgtY; v.panVelX = 0; v.panVelY = 0; v.panInit = true; }
      // CRITICALLY-DAMPED SPRING: light, prompt response that also DECELERATES
      // smoothly into a gentle stop — no abrupt halt, no floaty lag, no overshoot.
      var STIFF = 48, DAMP = 2 * Math.sqrt(48), DT = 1 / 60;   // softer glide — the window floats, never darts
      v.panVelX += ((tgtX - v.panCurX) * STIFF - v.panVelX * DAMP) * DT; v.panCurX += v.panVelX * DT;
      v.panVelY += ((tgtY - v.panCurY) * STIFF - v.panVelY * DAMP) * DT; v.panCurY += v.panVelY * DT;
      if (Math.abs(tgtX - v.panCurX) < 0.05 && Math.abs(v.panVelX) < 0.6) { v.panCurX = tgtX; v.panVelX = 0; }
      if (Math.abs(tgtY - v.panCurY) < 0.05 && Math.abs(v.panVelY) < 0.6) { v.panCurY = tgtY; v.panVelY = 0; }
      // full 2-axis look-around on every page (the pinch owns the depth now)
      v.cv.style.transform = 'translate3d(' + (-v.panCurX).toFixed(2) + 'px,' + (-v.panCurY).toFixed(2) + 'px,0)';
    }
    return true;
  }

  var raf = 0, epoch = performance.now(), ctxLost = false, tiltEMA = null, betaEMA = null, betaBase = null, gammaBase = null, tiltIdle = 9999, calibN = 0, calibNB = 0;
  function current() { return Math.round(book.scrollLeft / book.clientWidth); }
  // free a page's GPU memory once it is far from view. Otherwise every page you
  // visit keeps a full-resolution texture + vertex buffer alive forever; on a
  // phone the GPU runs out, the context is lost, and later pages blank out.
  // Keeping only the pages near the viewport bounds memory to a constant.
  function disposeView(v) {
    var freed = false;
    if (v.buf) { gl.deleteBuffer(v.buf); v.buf = null; freed = true; }
    if (v.rasterTex) { gl.deleteTexture(v.rasterTex); v.rasterTex = null; freed = true; }
    // MULTIPLANE pages keep a buffer + texture PER PLANE in plane.store — these
    // must be freed too, or every multiplane page visited leaks N textures and
    // the GPU context is eventually lost on the later pages. (rebuilds on re-entry)
    if (v.planes) {
      for (var i = 0; i < v.planes.length; i++) {
        var st = v.planes[i].store;
        if (st && (st.buf || st.rasterTex)) {
          if (st.buf) { gl.deleteBuffer(st.buf); st.buf = null; }
          if (st.rasterTex) { gl.deleteTexture(st.rasterTex); st.rasterTex = null; }
          st.built = false; st.bld = null; freed = true;
        }
      }
    }
    // release the big 2D backing store too — the real memory hog (~20 MB/page)
    if (v.cv.width > 1) { v.cv.width = 1; v.cv.height = 1; v.w = 0; v.h = 0; v.panInit = false; v.panStart = null; v.page.classList.remove('pano-on'); freed = true; }
    if (!freed) return;
    v.built = false; v.painted = false; v.nVerts = 0; v.bld = null;
    if (v.planes) for (var dpi = 0; dpi < v.planes.length; dpi++) v.planes[dpi].store.bld = null;
  }
  var lastPos = null, MAXLIVE = 3;
  function frame(now) {
    raf = 0;
    if (ctxLost || document.visibilityState !== 'visible') return;
    var t = (now - epoch) / 1000;
    var pos = book.scrollLeft / book.clientWidth;
    var moving = (lastPos !== null) && Math.abs(pos - lastPos) > 0.06;   // a fast swipe / fling
    lastPos = pos;
    var lo = Math.floor(pos + 0.0001), hi = Math.ceil(pos - 0.0001), i, v;
    // always release pages we've left behind — frees memory as you fly past
    for (i = 0; i < views.length; i++) { if (Math.abs(views[i].idx - pos) > 2.2) disposeView(views[i]); }
    // HARD CAP: never hold more than MAXLIVE full-size canvases at once (even mid-
    // fling) — evict the furthest. This is the real guard against a fast-swipe spike.
    var live = [];
    for (i = 0; i < views.length; i++) if (views[i].cv.width > 2) live.push(views[i]);
    if (live.length > MAXLIVE) {
      live.sort(function (a, b) { return Math.abs(b.idx - pos) - Math.abs(a.idx - pos); });
      for (i = 0; i < live.length - MAXLIVE; i++) disposeView(live[i]);
    }
    // only SIZE + paint when the scroll has calmed — during a fast fling the static
    // <picture> shows instead (no canvas allocations = no memory spike = no crash)
    frameNo++;
    var building = false;
    for (i = 0; i < views.length; i++) { v = views[i]; if ((v.idx === lo || v.idx === hi) && !v.painted) { building = true; break; } }
    var fast = moving || building || window.__panoTilt !== null || window.__pinchZ;   // full rate while driven OR while the live page is still building
    if (!moving) {
      for (i = 0; i < views.length; i++) {
        v = views[i]; var dist = Math.abs(v.idx - pos);
        if (v.idx === lo || v.idx === hi) { if (!v.w) layout(v); if (fast || (frameNo & 1)) renderView(v, t); }   // live page (30fps at rest)
        else if (dist <= 1.6) { if (!v.w) layout(v); if (!v.painted) renderView(v, t); }    // prime the neighbour
      }
    }
    raf = requestAnimationFrame(frame);
  }
  var frameNo = 0;
  function start() { if (!raf && !ctxLost) raf = requestAnimationFrame(frame); }
  // if the GPU drops the context anyway (memory pressure on phones), stop and
  // let the finished paintings stand — never leave a blank or black page.
  glcv.addEventListener('webglcontextlost', function (e) {
    e.preventDefault(); ctxLost = true;
    if (raf) { cancelAnimationFrame(raf); raf = 0; }
    views.forEach(function (v) { if (v.ctx) v.ctx.clearRect(0, 0, v.cv.width, v.cv.height); });
  }, false);
  // debug hook (headless preview can't fire rAF): render current page at time t
  window.__paintTick = function (sec) { var v = views.filter(function (x) { return x.idx === current(); })[0]; if (v) renderView(v, sec); };

  var rT = 0, snapPage = 0, restoring = false;
  // remember the reader's page from settled scrolls (ignore the clamp-scroll the
  // browser fires while it re-flows during a resize/rotation)
  book.addEventListener('scroll', function () { if (!restoring) { var w = book.clientWidth || 1; snapPage = Math.min(views.length - 1, Math.max(0, Math.round(book.scrollLeft / w))); } start(); }, { passive: true });
  // ROTATION FIX: on rotate/resize the page WIDTH changes, so the old scrollLeft
  // (pixels) points at a different page — the browser clamps it and JUMPS to the
  // last page with the camera shoved to the edge. Restore the reader's page first,
  // THEN re-layout (so layout's windowing sees the right page and re-centres the
  // camera on the focal subject).
  function reflow() {
    restoring = true;                              // block the clamp-scroll from corrupting snapPage
    clearTimeout(rT);
    rT = setTimeout(function () {
      var sb = book.style.scrollBehavior; book.style.scrollBehavior = 'auto';
      book.scrollLeft = snapPage * book.clientWidth;   // keep the reader on their page
      book.style.scrollBehavior = sb;
      dpr = Math.min(2, window.devicePixelRatio || 1);
      views.forEach(layout);
      restoring = false;
      start();
    }, 180);
  }
  window.addEventListener('orientationchange', reflow);   // fires before the reflow on mobile → snapPage still clean
  window.addEventListener('resize', reflow);
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible') start(); });

  var idle = window.requestIdleCallback || function (f) { setTimeout(f, 300); };
  function init() { views.forEach(function (v) { if (v.img.complete) return; v.img.addEventListener('load', function () { v.built = false; v.painted = false; v.bld = null; start(); }); }); start(); }
  if (document.readyState === 'complete') idle(init); else window.addEventListener('load', function () { idle(init); });
})();
