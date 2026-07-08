// gen/grade.mjs — THE REMBRANDT GRADE.
//
// THE PRINCIPLE: Rembrandt's light is precious because darkness pays for it.
// On his canvases roughly 75-85% of the surface lives in deep, rich,
// low-chroma shadow so that the one lit subject BURNS. Our plates spend
// brightness everywhere — every wheat stroke as loud as the running father —
// so nothing pops. This pass re-imposes the hierarchy at print time, per
// plate, from each plate's own light data:
//
//   1. VALUE COMPRESSION — luminance is remapped by a wide, smooth focal
//      light field F(p) in [0..1]. Periphery (F→0): max luminance pulled to
//      ~52-55% of current, mids pushed further by a gamma lean — a rich dark
//      band, NEVER crushed black: a small umber-blue fill keeps ~8-10% of
//      texture alive in the shadows (Rembrandt's shadows are transparent).
//      Focal zone (F→1): top values kept and lifted +4-6%.
//   2. CHROMA HIERARCHY — periphery desaturated 25-35% and pulled toward a
//      cool neutral-umber; the lit zone warmed slightly (the golden envelope).
//   3. EDGE/FOCUS HIERARCHY — gentle peripheral softening (~0.9px at the
//      1600w press, scale-aware) growing with (1-F); micro-contrast (local
//      clarity) added INSIDE the focal zone only. Sharp where it matters,
//      lost where it doesn't — lost-and-found edges.
//   4. THE POP — a gentle final S-curve, plus a white ceiling: the brightest
//      1-2% of pixels must live inside the light. If the periphery still
//      holds peak whites after grading, they are pulled under ~0.80.
//
// ORDER: the grade runs FIRST, on the raw SVG raster, and the oil surface
// pass (gen/surface.mjs) runs after it — so the impasto relief lighting,
// canvas tooth and varnish ride the GRADED values. Paint physics on top of
// composition, never the reverse: regrading an already-lit relief would
// flatten the ridges the surface pass just raised. surface.mjs calls
// window.__grade(srcCanvas) right after rasterizing the SVG.
//
// LIGHT DATA, in priority order (all coordinates in the 800x500 viewBox):
//   a. gen/grade-fields.json  — per-plate overrides: { lights, intensity }
//   b. glitch-fields.json     — the living-glitch light descriptors
//                               (column + point gaussians), widened to
//                               composition scale (the glitch mask is tight)
//   c. the module's focal {x,y} — one wide elliptical gaussian
//
// Deterministic, data-driven, per-plate intensity knob (default 1.0).

import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = dirname(fileURLToPath(import.meta.url));
const SITE = dirname(DIR);

// Per-plate intensity. word is a galaxy that already has perfect value
// hierarchy (one bright word-nebula in a void) — do not crush its rim motes.
// candle is already a nocturne; it needs only a nudge.
export const GRADE_INTENSITY = {
  'word': 0.3,
  'candle': 0.7,
};

const MAXL = 12;

function loadJson(p) {
  try { return existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : null; } catch { return null; }
}
const glitchFields = loadJson(join(SITE, 'glitch-fields.json'))?.plates ?? {};
const gradeFields = loadJson(join(DIR, 'grade-fields.json'))?.plates ?? {};

const clampN = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

// Widen glitch lights to composition scale. Points: r -> sigma in [90, 260].
// Columns: sampled as 4 overlapping gaussians along the spine.
function fromGlitch(entry) {
  const out = [];
  for (const l of entry.lights ?? []) {
    if (l.type === 'point') {
      const s = clampN(l.r * 2.6, 90, 260);
      out.push({ x: l.x, y: l.y, sx: s, sy: s, w: l.weight ?? 1 });
    } else if (l.type === 'column') {
      const n = 4;
      const sx = clampN(l.falloff * (l.anisoX ?? 1) * 0.85, 80, 260);
      const sy = clampN(Math.max((l.yBase - l.yTop) / 3, l.falloff * (l.anisoY ?? 1) * 0.85), 80, 260);
      for (let i = 0; i < n; i++) {
        const y = l.yTop + (l.yBase - l.yTop) * (i + 0.5) / n;
        out.push({ x: l.x, y, sx, sy, w: (l.weight ?? 1) * 0.9 });
      }
    }
  }
  return out;
}

// resolveLights(name, focal) -> [{x, y, sx, sy, w}] (plate units, <= MAXL)
export function resolveLights(name, focal) {
  const g = gradeFields[name];
  if (g?.lights?.length) {
    return g.lights.map(l => ({
      x: l.x, y: l.y, sx: l.sx ?? 175, sy: l.sy ?? l.sx ?? 150, w: l.w ?? 1,
    })).slice(0, MAXL);
  }
  const gl = glitchFields[name];
  if (gl?.lights?.length) return fromGlitch(gl).slice(0, MAXL);
  const fx = focal && Number.isFinite(focal.x) ? focal.x : 400;
  const fy = focal && Number.isFinite(focal.y) ? focal.y : 270;
  return [{ x: fx, y: fy, sx: 175, sy: 150, w: 1 }];
}

export function intensityOf(name) {
  const g = gradeFields[name];
  if (g && Number.isFinite(g.intensity)) return g.intensity;
  return GRADE_INTENSITY[name] ?? 1.0;
}

// The grade shader. Same orientation conventions as surface.mjs (FLIP_Y
// false, v_uv.y flipped in the vertex stage, GL canvas drawn back onto 2D).
const FRAG = `
precision highp float;
uniform sampler2D u_tex;
uniform vec2  u_res;
uniform float u_scale;   // 1.0 @ 1600w landscape press
uniform float u_k;       // per-plate intensity
uniform vec4  u_map;     // viewX0, viewW/W, 0, 500/H  (pixel -> plate units)
uniform float u_n;
uniform vec4  u_l[${MAXL}];   // x, y, sigmaX, sigmaY (plate units)
uniform float u_lw[${MAXL}];  // weight
varying vec2  v_uv;

float lumv(vec3 c){ return dot(c, vec3(0.299, 0.587, 0.114)); }
vec3  smp(vec2 p){ return texture2D(u_tex, p / u_res).rgb; }

// F(p): the focal light field — soft union of wide gaussians.
float field(vec2 p){
  vec2 q = vec2(u_map.x + p.x * u_map.y, p.y * u_map.w);
  float keep = 1.0;
  for (int i = 0; i < ${MAXL}; i++) {
    if (float(i) >= u_n) break;
    vec2 d = (q - u_l[i].xy) / u_l[i].zw;
    keep *= 1.0 - clamp(exp(-0.5 * dot(d, d)) * u_lw[i], 0.0, 1.0);
  }
  // shape: tighten the lit core, widen the dark plateau (Rembrandt spends
  // most of the canvas on shadow; the transition ring must not glow)
  return pow(clamp(1.0 - keep, 0.0, 1.0), 1.25);
}

void main(){
  vec2  p = v_uv * u_res;
  float F = field(p);
  float k = u_k;
  float per = (1.0 - F) * k;           // periphery-ness, knob-scaled

  vec3 c0 = smp(p);

  // ---- 3. edge hierarchy: one 9-tap blur serves both sides of it ----
  float r = 0.9 * u_scale;
  vec3 B = c0 * 0.25
    + (smp(p+vec2(r,0.0)) + smp(p-vec2(r,0.0)) + smp(p+vec2(0.0,r)) + smp(p-vec2(0.0,r))) * 0.125
    + (smp(p+vec2(r,r)) + smp(p+vec2(r,-r)) + smp(p+vec2(-r,r)) + smp(p-vec2(r,r))) * 0.0625;
  float clar = 0.30 * smoothstep(0.55, 0.95, F) * k;   // clarity inside the light only
  vec3 c = mix(c0, B, per * 0.70) + (c0 - B) * clar;

  // ---- 1. value compression: darkness pays for the light ----
  float L  = lumv(c);
  float gv = mix(1.0, 0.52, per);          // periphery whites -> ~52%
  float gm = mix(1.0, 1.22, per);          // mids lean further down
  float Ln = pow(max(L, 1e-4), gm) * gv;
  c *= Ln / max(L, 1e-4);
  // transparent shadow: umber-blue fill keeps the darks alive, never dead
  c += vec3(0.026, 0.022, 0.030) * per * (1.0 - smoothstep(0.0, 0.30, Ln));
  // the lit subject gets MORE: +4-6% on its top values
  c *= 1.0 + 0.06 * F * k * smoothstep(0.40, 0.95, L);

  // ---- 2. chroma hierarchy ----
  float L2 = lumv(c);
  c = mix(vec3(L2), c, mix(1.0, 0.70, per));                  // periphery desat ~30%
  c *= mix(vec3(1.0), vec3(0.962, 0.976, 1.014), per);        // cool neutral-umber shadow
  c *= mix(vec3(1.0), vec3(1.034, 1.012, 0.966), F * k);      // the golden envelope

  // ---- 4. the pop ----
  vec3 sc = c * c * (3.0 - 2.0 * c);                          // gentle S
  c = mix(c, sc, 0.20 * k);
  float Lf = lumv(c);                                         // white ceiling:
  float ceilv = mix(0.80, 1.0, smoothstep(0.30, 0.75, F));    // peak whites belong
  float sg = min(1.0, ceilv / max(Lf, 1e-4));                 // to the light
  c *= mix(1.0, sg, 0.85 * k);

  gl_FragColor = vec4(clamp(c, 0.0, 1.0), 1.0);
}
`;

const VERT = `
attribute vec2 a_pos;
varying vec2 v_uv;
void main(){
  v_uv = a_pos * 0.5 + 0.5;
  v_uv.y = 1.0 - v_uv.y;   // row 0 = image top in v_uv space
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

// gradeScript({name, w, h, scale, viewX0, viewW, focal}) -> <script> block.
// Defines window.__grade(srcCanvas) -> graded 2D canvas; surface.mjs calls it
// on the raw SVG raster BEFORE its own pass (grade values, then paint them).
export function gradeScript({ name, w, h, scale, viewX0 = 0, viewW = 800, focal = null }) {
  const base = name.replace(/(-p)?(@2x)?$/, '');
  const lights = resolveLights(base, focal);
  const k = intensityOf(base);
  const map = [viewX0, viewW / w, 0, 500 / h];
  const L4 = lights.map(l => [l.x, l.y, l.sx, l.sy]);
  const LW = lights.map(l => l.w);
  const page = `
(function(){
  var W=${w}, H=${h}, SCALE=${scale}, K=${k}, N=${lights.length};
  var MAP=${JSON.stringify(map)};
  var L4=${JSON.stringify(L4)}, LW=${JSON.stringify(LW)};
  var FRAG=${JSON.stringify(FRAG)}, VERT=${JSON.stringify(VERT)};

  function glPass(src){
    var cv=document.createElement('canvas'); cv.width=W; cv.height=H;
    var gl=cv.getContext('webgl',{preserveDrawingBuffer:true,antialias:false,depth:false,stencil:false});
    if(!gl) return null;
    function sh(type,s){var o=gl.createShader(type);gl.shaderSource(o,s);gl.compileShader(o);
      if(!gl.getShaderParameter(o,gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o)); return o;}
    var prog=gl.createProgram();
    gl.attachShader(prog,sh(gl.VERTEX_SHADER,VERT));
    gl.attachShader(prog,sh(gl.FRAGMENT_SHADER,FRAG));
    gl.linkProgram(prog);
    if(!gl.getProgramParameter(prog,gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
    gl.useProgram(prog);
    var buf=gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,buf);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1, 3,-1, -1,3]),gl.STATIC_DRAW);
    var loc=gl.getAttribLocation(prog,'a_pos');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
    var tex=gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D,tex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,src);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
    gl.uniform2f(gl.getUniformLocation(prog,'u_res'),W,H);
    gl.uniform1f(gl.getUniformLocation(prog,'u_scale'),SCALE);
    gl.uniform1f(gl.getUniformLocation(prog,'u_k'),K);
    gl.uniform4fv(gl.getUniformLocation(prog,'u_map'),MAP);
    gl.uniform1f(gl.getUniformLocation(prog,'u_n'),N);
    var flat=[]; for(var i=0;i<${MAXL};i++){var l=L4[i]||[0,0,1,1];flat.push(l[0],l[1],l[2],l[3]);}
    gl.uniform4fv(gl.getUniformLocation(prog,'u_l[0]'),new Float32Array(flat));
    var ws=[]; for(var i2=0;i2<${MAXL};i2++) ws.push(LW[i2]||0.0);
    gl.uniform1fv(gl.getUniformLocation(prog,'u_lw[0]'),new Float32Array(ws));
    gl.viewport(0,0,W,H);
    gl.drawArrays(gl.TRIANGLES,0,3);
    gl.finish();
    var out=document.createElement('canvas'); out.width=W; out.height=H;
    out.getContext('2d').drawImage(cv,0,0);
    return out;
  }

  function jsPass(src){
    var ctx=src.getContext('2d');
    var img=ctx.getImageData(0,0,W,H), d=img.data;
    var out=ctx.createImageData(W,H), o=out.data;
    var r=0.9*SCALE;
    function px(x,y,ch){x=x<0?0:(x>=W?W-1:x);y=y<0?0:(y>=H?H-1:y);return d[((y|0)*W+(x|0))*4+ch]/255;}
    var ss=function(a,b,x){var t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t);};
    for(var y=0;y<H;y++)for(var x=0;x<W;x++){
      var qx=MAP[0]+x*MAP[1], qy=y*MAP[3], keep=1.0;
      for(var i=0;i<N;i++){var l=L4[i];
        var dx=(qx-l[0])/l[2], dy=(qy-l[1])/l[3];
        keep*=1-Math.min(1,Math.exp(-0.5*(dx*dx+dy*dy))*LW[i]);}
      var F=Math.pow(Math.min(1,Math.max(0,1-keep)),1.25), per=(1-F)*K;
      var c=[0,0,0], B=[0,0,0];
      for(var ch=0;ch<3;ch++){
        var c0=px(x,y,ch);
        var bv=c0*0.25
          +(px(x+r,y,ch)+px(x-r,y,ch)+px(x,y+r,ch)+px(x,y-r,ch))*0.125
          +(px(x+r,y+r,ch)+px(x+r,y-r,ch)+px(x-r,y+r,ch)+px(x-r,y-r,ch))*0.0625;
        var clar=0.30*ss(0.55,0.95,F)*K;
        c[ch]=c0*(1-per*0.70)+bv*per*0.70+(c0-bv)*clar; B[ch]=bv;
      }
      var L=0.299*c[0]+0.587*c[1]+0.114*c[2];
      var Ln=Math.pow(Math.max(L,1e-4),1+(0.22*per))*(1-0.48*per);
      var m=Ln/Math.max(L,1e-4);
      var fill=(1-ss(0,0.30,Ln))*per;
      var lift=1+0.06*F*K*ss(0.40,0.95,L);
      c[0]=(c[0]*m+0.026*fill)*lift; c[1]=(c[1]*m+0.022*fill)*lift; c[2]=(c[2]*m+0.030*fill)*lift;
      var L2=0.299*c[0]+0.587*c[1]+0.114*c[2], sat=1-0.30*per;
      var cools=[0.962,0.976,1.014], warms=[1.034,1.012,0.966];
      for(var ch2=0;ch2<3;ch2++){
        var v=L2+(c[ch2]-L2)*sat;
        v*=1+(cools[ch2]-1)*per;
        v*=1+(warms[ch2]-1)*F*K;
        var s2=v*v*(3-2*v);
        c[ch2]=v*(1-0.20*K)+s2*0.20*K;
      }
      var Lf=0.299*c[0]+0.587*c[1]+0.114*c[2];
      var ceilv=0.80+0.20*ss(0.30,0.75,F);
      var sg=Math.min(1,ceilv/Math.max(Lf,1e-4));
      var gmix=1*(1-0.85*K)+sg*0.85*K;
      var oi=(y*W+x)*4;
      o[oi]  =Math.min(255,Math.max(0,c[0]*gmix*255));
      o[oi+1]=Math.min(255,Math.max(0,c[1]*gmix*255));
      o[oi+2]=Math.min(255,Math.max(0,c[2]*gmix*255));
      o[oi+3]=255;
    }
    var cv=document.createElement('canvas');cv.width=W;cv.height=H;
    cv.getContext('2d').putImageData(out,0,0);
    return cv;
  }

  window.__grade=function(src){
    if(K<=0||N<=0) return src;
    var out=null;
    try{ out=glPass(src); document.title='GRADE-GL '+document.title; }catch(e){ out=null; }
    if(!out){ out=jsPass(src); document.title='GRADE-JS '+document.title; }
    return out;
  };
})();
`;
  return `<script>${page}</script>`;
}
