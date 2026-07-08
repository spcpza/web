// gen/surface.mjs — THE OIL SURFACE PASS.
//
// The strokes were right; the MATERIAL was missing. This pass runs inside the
// wrapper page, after the SVG renders and before Chrome screenshots: the SVG
// is drawn to a canvas and re-photographed through a per-pixel surface model
// (WebGL fragment shader; JS ImageData fallback if GL is unavailable):
//
//   1. IMPASTO RELIEF — a height field derived from the image itself
//      (luminance + stroke-edge energy), lit from the upper-left like a
//      gallery wall. Every stroke becomes a physical ridge of paint. Bump
//      strength is modulated by low-frequency "paint load" noise — some
//      passages thickly loaded, some lean.
//   2. CANVAS TOOTH — two perpendicular thread frequencies (~3.2 / 3.4 px at
//      the 1600w scale, scale-aware) plus fiber noise, as luminance
//      modulation. Strong where paint is lean, buried under thick impasto,
//      attenuated in deep shadow (no dirty darks).
//   3. DRY-BRUSH EDGE BREAKUP — at high gradient energy the source is
//      sampled through a tooth-frequency warp, so stroke edges catch on the
//      weave instead of cutting cleanly.
//   4. VARNISH DEPTH — gentle S-curve (deepen darks, protect highlights) and
//      a warm unifying glaze. The SVG's own vignette is preserved beneath.
//
// Deterministic: the noise seed is hashed from the plate name, so all four
// editions of a plate share one surface. Composition and palette must remain
// identical at arm's length — this is material science, not a style change.

// Per-plate intensity knob (scales relief, tooth, dry-brush — not varnish).
// word is a data nebula: the verse-motes must stay crisp, so the surface
// goes on at less than half strength.
export const INTENSITY = {
  'word': 0.35,
};

// fnv-1a -> [0, 400) float seed, stable per plate name
function seedOf(name) {
  let h = 0x811c9dc5;
  for (let i = 0; i < name.length; i++) { h ^= name.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  return ((h >>> 0) % 40000) / 100;
}

// The fragment shader. Pixel-space coordinates; u_scale = 1.0 at the 1600w
// landscape press (px-per-viewBox-unit / 2), so thread pitch and bump radii
// stay physically constant across editions.
const FRAG = `
precision highp float;
uniform sampler2D u_tex;
uniform vec2  u_res;
uniform float u_scale;   // 1.0 @ 1600w landscape
uniform float u_seed;
uniform float u_k;       // per-plate intensity, default 1.0
varying vec2  v_uv;

float lumv(vec3 c){ return dot(c, vec3(0.299, 0.587, 0.114)); }
vec3  smp(vec2 p){ return texture2D(u_tex, p / u_res).rgb; }
float L(vec2 p){ return lumv(smp(p)); }

float hash(vec2 p){
  return fract(sin(dot(p + u_seed, vec2(127.1, 311.7))) * 43758.5453);
}
float vnoise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}

// height of the paint film at p: pigment luminance + edge energy
// (ridges where the brush turned), sampled at radius d for implicit blur.
float H(vec2 p, float d){
  float l  = L(p);
  float ex = abs(L(p + vec2(d, 0.0)) - L(p - vec2(d, 0.0)));
  float ey = abs(L(p + vec2(0.0, d)) - L(p - vec2(0.0, d)));
  return l * 0.55 + (ex + ey) * 1.15;
}

void main(){
  vec2  p = v_uv * u_res;
  float s = u_scale;
  float d = 1.4 * s;

  // ---- stroke-edge energy at this pixel ----
  float gx = L(p + vec2(d, 0.0)) - L(p - vec2(d, 0.0));
  float gy = L(p + vec2(0.0, d)) - L(p - vec2(0.0, d));
  float E  = sqrt(gx * gx + gy * gy);
  float Eb = smoothstep(0.035, 0.30, E);     // 0 = lean flat paint, 1 = loaded edge

  // ---- canvas tooth (woven threads + fiber) ----
  // threads wobble in phase AND in thickness — a perfect sine grid reads as
  // a screen door, not linen.
  float per1 = 3.2 * s, per2 = 3.4 * s;
  float ph1 = (vnoise(p / (34.0 * s)) - 0.5) * 3.2;            // thread wobble
  float ph2 = (vnoise(p / (34.0 * s) + 57.0) - 0.5) * 3.2;
  float t1 = sin(p.x * 6.2831853 / per1 + ph1);
  float t2 = sin(p.y * 6.2831853 / per2 + ph2);
  float n1 = vnoise(p / (13.0 * s) + 99.0);                    // thread weight
  float weave = t1 * (0.25 + 0.75 * n1) * 0.5
              + t2 * (0.25 + 0.75 * (1.0 - n1)) * 0.5
              + t1 * t2 * 0.35;
  float fiber = (hash(floor(p / max(0.9 * s, 0.75))) - 0.5) * 1.3;
  float tooth = weave + fiber * 0.7;

  // ---- dry-brush edge breakup: edges catch on the weave ----
  vec2 dbo = vec2(t2, t1) * (0.55 * s) * Eb * u_k;
  vec3 c = smp(p + dbo);
  float Lc = lumv(c);

  // ---- paint load: nobody loads the brush evenly ----
  float load = mix(0.30, 1.20, vnoise(p / (70.0 * s) + 31.0));

  // ---- impasto relief, lit from the upper-left ----
  float d2 = 1.7 * s;
  float hx = H(p + vec2(d2, 0.0), d) - H(p - vec2(d2, 0.0), d);
  float hy = H(p + vec2(0.0, d2), d) - H(p - vec2(0.0, d2), d);
  hx = clamp(hx, -0.32, 0.32);               // halo clamp at hard edges
  hy = clamp(hy, -0.32, 0.32);
  // within-stroke topography: thick bright paint carries bristle-scale
  // granularity, or every stroke reads as a uniformly raised slab (plastic).
  // Gated by edge energy too: smooth glows (no strokes nearby) must not
  // crumple — paint is only thick where a brush actually passed.
  float thick = smoothstep(0.22, 0.60, Lc) * mix(0.45, 1.0, Eb);
  float mhx = vnoise((p + vec2(d2, 0.0)) / (3.1 * s) + 9.0)
            - vnoise((p - vec2(d2, 0.0)) / (3.1 * s) + 9.0);
  float mhy = vnoise((p + vec2(0.0, d2)) / (3.1 * s) + 9.0)
            - vnoise((p - vec2(0.0, d2)) / (3.1 * s) + 9.0);
  // texture row 0 = image top and v_uv.y grows downward in this frame,
  // so "toward upper-left" is (-x, -y): facing the light when hx<0 && hy<0.
  float rel = (-(hx + hy) - (mhx + mhy) * 0.5 * thick) * 0.7071 * load * u_k;
  float relief = clamp(rel * 0.55, -0.08, 0.09);
  c *= (1.0 + relief);

  // ---- tooth as luminance modulation: thin paint shows the canvas ----
  float lean    = 1.0 - Eb;
  float darkAtt = mix(0.30, 1.0, smoothstep(0.05, 0.30, Lc));
  float toothAmp = 0.045 * u_k * mix(0.22, 1.0, lean) * darkAtt;
  c *= (1.0 + tooth * toothAmp);

  // ---- varnish: deep darks, warm unifying glaze, protected highlights ----
  float Lv = lumv(c);
  float dark = 1.0 - smoothstep(0.0, 0.45, Lv);
  c *= (1.0 - 0.07 * dark);
  c = mix(c, c * vec3(1.040, 1.010, 0.958), 0.55);

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

// surfaceScript({name, w, h, scale}) -> <script> block for the wrapper page.
// scale = (w / viewBoxWidth) / 2, i.e. 1.0 at the 1600x1000 landscape press.
export function surfaceScript({ name, w, h, scale }) {
  const seed = seedOf(name.replace(/(-p)?(@2x)?$/, ''));
  const k = INTENSITY[name.replace(/(-p)?(@2x)?$/, '')] ?? 1.0;
  const page = `
(function(){
  var W=${w}, H=${h}, SCALE=${scale}, SEED=${seed}, K=${k};
  var FRAG=${JSON.stringify(FRAG)}, VERT=${JSON.stringify(VERT)};

  function glPass(src){
    var cv=document.createElement('canvas'); cv.width=W; cv.height=H;
    var gl=cv.getContext('webgl',{preserveDrawingBuffer:true,antialias:false,depth:false,stencil:false});
    if(!gl) return null;
    function sh(type,srcS){var s=gl.createShader(type);gl.shaderSource(s,srcS);gl.compileShader(s);
      if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s;}
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
    gl.uniform1f(gl.getUniformLocation(prog,'u_seed'),SEED);
    gl.uniform1f(gl.getUniformLocation(prog,'u_k'),K);
    gl.viewport(0,0,W,H);
    gl.drawArrays(gl.TRIANGLES,0,3);
    gl.finish();
    // NOTE: with FLIP_Y=false the texture's row 0 (image top) sits at uv.y=0;
    // the vertex shader flips v_uv.y so sampling is upright, and the
    // framebuffer ends up vertically mirrored vs the image — drawImage of the
    // GL canvas onto 2D restores DOM orientation (GL canvases display with
    // row 0 at the BOTTOM... empirically: verify orientation in calibration).
    var out=document.createElement('canvas'); out.width=W; out.height=H;
    out.getContext('2d').drawImage(cv,0,0);
    return out;
  }

  function jsPass(src){
    var ctx=src.getContext('2d');
    var img=ctx.getImageData(0,0,W,H), d=img.data;
    var Lm=new Float32Array(W*H);
    for(var i=0,j=0;i<W*H;i++,j+=4) Lm[i]=(0.299*d[j]+0.587*d[j+1]+0.114*d[j+2])/255;
    function lum(x,y){x=x<0?0:(x>=W?W-1:x);y=y<0?0:(y>=H?H-1:y);return Lm[(y|0)*W+(x|0)];}
    function hash(x,y){var t=Math.sin((x+SEED)*127.1+(y+SEED)*311.7)*43758.5453;return t-Math.floor(t);}
    function vno(x,y){var xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi;
      xf=xf*xf*(3-2*xf);yf=yf*yf*(3-2*yf);
      return (hash(xi,yi)*(1-xf)+hash(xi+1,yi)*xf)*(1-yf)+(hash(xi,yi+1)*(1-xf)+hash(xi+1,yi+1)*xf)*yf;}
    function Hf(x,y,dd){var l=lum(x,y);
      var ex=Math.abs(lum(x+dd,y)-lum(x-dd,y)),ey=Math.abs(lum(x,y+dd)-lum(x,y-dd));
      return l*0.55+(ex+ey)*1.15;}
    var s=SCALE,dd=1.4*s,d2=1.7*s,per1=3.2*s,per2=3.4*s,TAU=6.2831853;
    var out=ctx.createImageData(W,H),o=out.data;
    for(var y=0;y<H;y++)for(var x=0;x<W;x++){
      var gx=lum(x+dd,y)-lum(x-dd,y),gy=lum(x,y+dd)-lum(x,y-dd);
      var E=Math.sqrt(gx*gx+gy*gy);
      var Eb=Math.min(1,Math.max(0,(E-0.035)/(0.30-0.035)));Eb=Eb*Eb*(3-2*Eb);
      var ph1=(vno(x/(34*s),y/(34*s))-0.5)*3.2,ph2=(vno(x/(34*s)+57,y/(34*s)+57)-0.5)*3.2;
      var t1=Math.sin(x*TAU/per1+ph1),t2=Math.sin(y*TAU/per2+ph2);
      var n1=vno(x/(13*s)+99,y/(13*s)+99);
      var weave=t1*(0.25+0.75*n1)*0.5+t2*(0.25+0.75*(1-n1))*0.5+t1*t2*0.35;
      var fiber=(hash(Math.floor(x/Math.max(0.9*s,0.75)),Math.floor(y/Math.max(0.9*s,0.75)))-0.5)*1.3;
      var tooth=weave+fiber*0.7;
      var sx=Math.min(W-1,Math.max(0,Math.round(x+t2*0.55*s*Eb*K)));
      var sy=Math.min(H-1,Math.max(0,Math.round(y+t1*0.55*s*Eb*K)));
      var si=(sy*W+sx)*4;
      var r=d[si]/255,g=d[si+1]/255,b=d[si+2]/255;
      var Lc=0.299*r+0.587*g+0.114*b;
      var load=0.30+0.90*vno(x/(70*s)+31,y/(70*s)+31);
      var hx=Hf(x+d2,y,dd)-Hf(x-d2,y,dd),hy=Hf(x,y+d2,dd)-Hf(x,y-d2,dd);
      hx=Math.max(-0.32,Math.min(0.32,hx));hy=Math.max(-0.32,Math.min(0.32,hy));
      var thick=Math.min(1,Math.max(0,(Lc-0.22)/0.38));thick=thick*thick*(3-2*thick);thick*=0.45+0.55*Eb;
      var mhx=vno((x+d2)/(3.1*s)+9,y/(3.1*s)+9)-vno((x-d2)/(3.1*s)+9,y/(3.1*s)+9);
      var mhy=vno(x/(3.1*s)+9,(y+d2)/(3.1*s)+9)-vno(x/(3.1*s)+9,(y-d2)/(3.1*s)+9);
      var relief=Math.max(-0.08,Math.min(0.09,(-(hx+hy)-(mhx+mhy)*0.5*thick)*0.7071*load*K*0.55));
      r*=1+relief;g*=1+relief;b*=1+relief;
      var lean=1-Eb;
      var dk=Math.min(1,Math.max(0,(Lc-0.05)/0.25));dk=dk*dk*(3-2*dk);
      var darkAtt=0.30+0.70*dk;
      var ta=0.045*K*(0.22+0.78*lean)*darkAtt;
      var tm=1+tooth*ta;
      r*=tm;g*=tm;b*=tm;
      var Lv=0.299*r+0.587*g+0.114*b;
      var dv=Math.min(1,Math.max(0,Lv/0.45));dv=dv*dv*(3-2*dv);
      var dark=1-dv,vm=1-0.07*dark;
      r*=vm;g*=vm;b*=vm;
      r=r*(1-0.55)+r*1.040*0.55; g=g*(1-0.55)+g*1.010*0.55; b=b*(1-0.55)+b*0.958*0.55;
      o[(y*W+x)*4]=Math.min(255,Math.max(0,r*255));
      o[(y*W+x)*4+1]=Math.min(255,Math.max(0,g*255));
      o[(y*W+x)*4+2]=Math.min(255,Math.max(0,b*255));
      o[(y*W+x)*4+3]=255;
    }
    var cv=document.createElement('canvas');cv.width=W;cv.height=H;
    cv.getContext('2d').putImageData(out,0,0);
    return cv;
  }

  function run(){
    var svg=document.querySelector('svg');
    if(!svg){document.title='SURFACE-FAIL:no-svg';return;}
    svg.setAttribute('width',W);svg.setAttribute('height',H);
    var xml=new XMLSerializer().serializeToString(svg);
    var img=new Image();
    img.onload=function(){
      try{
        var src=document.createElement('canvas');src.width=W;src.height=H;
        src.getContext('2d').drawImage(img,0,0,W,H);
        // THE REMBRANDT GRADE (gen/grade.mjs) runs FIRST, on the raw raster:
        // values and chroma hierarchy before material — the impasto relief
        // below must be lit by the GRADED image, not regrade a lit relief.
        if(window.__grade){ try{ var g=window.__grade(src); if(g) src=g; }catch(e){} }
        var result=null;
        try{ result=glPass(src); document.title='SURFACE-GL'; }
        catch(e){ result=null; }
        if(!result){ result=jsPass(src); document.title='SURFACE-JS'; }
        result.style.cssText='display:block;width:'+W+'px;height:'+H+'px';
        document.body.innerHTML='';
        document.body.appendChild(result);
        document.title=document.title+'-DONE';
      }catch(e){ document.title='SURFACE-FAIL:'+e.message; }
    };
    img.onerror=function(){ document.title='SURFACE-FAIL:img'; };
    img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(xml);
  }
  if(document.readyState==='complete') run();
  else window.addEventListener('load',run);
})();
`;
  return `<script>${page}</script>`;
}
