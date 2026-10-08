/* ══════════════════════════════════════════════════════════════════════════
   THE KID IN 3D — a real model with joints, so he can be posed however a page
   needs him.

   Fred, after days of 2D rigs that kept breaking at the seams: "i want a full
   3d model of the character and then we can add joints and then move the kid
   however we wanted."  Right.  A cut-out can only ever slide flat pieces around
   in the plane it was drawn in; it can never turn a shoulder, never show an arm
   from a new angle, and every fix trades one seam for another.

   Built from HIS measurements (fractions of height, off his own front figure):
     hood widest 0.230 at 0.34 from the top;  shoulder pinch to 0.151 at 0.46
     body bell 0.185 → 0.212, hem 0.196 at 0.88;  cuffs around 0.70–0.76
     face top 0.19, chin 0.40, cheeks widest ±0.118 at 0.30 (BELOW the eyes)
   Here y runs UP: his 0.34-from-the-top is y = 0.66.

   The one thing geometry must not try to fake is his face — that is the part he
   drew and the part a viewer reads.  So the head WEARS it: cast/rig/face.webp,
   his own painted face and hair, texture-mapped onto the front of the skull.
   ══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  // ── palette, measured off his sheet ──────────────────────────────────────
  var C = {
    cloth: ['#d2ecff', '#a6d8ff', '#72bdff', '#5aa9f5', '#4a97e6', '#3d86d1', '#3174b8', '#265f9b', '#1c4a7d'],
    skin:  ['#9c9395', '#877e80', '#776e70', '#6a6264', '#5d5658', '#544e50', '#484244', '#3b3637', '#2e2a2b'],
    hair:  '#16171d',
    line:  '#0e2f52'
  };
  var LIGHT = norm([-0.42, 0.62, 0.66]);
  var HEAD_Y = 0.724, HEAD_Z = 0.052, HEAD_R = 0.156, FW = 256, FH = 283;          // over his left shoulder, front

  function norm(v) { var d = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0]/d, v[1]/d, v[2]/d]; }
  function shade(ramp, n) {
    var d = n[0]*LIGHT[0] + n[1]*LIGHT[1] + n[2]*LIGHT[2];
    // cel bands, not a smooth gradient — his art has flat lit areas with edges
    var t = Math.round((1 - d) * 4.4);
    return ramp[Math.max(0, Math.min(t, ramp.length - 1))];
  }

  // ── mesh building ────────────────────────────────────────────────────────
  function Mesh(ramp) { this.v = []; this.n = []; this.f = []; this.ramp = ramp; this.uv = null; }
  Mesh.prototype.add = function (x, y, z) { this.v.push(x, y, z); return this.v.length/3 - 1; };

  // a surface of revolution: his hood and his body are both one of these
  function lathe(profile, seg, zk, ramp, joint) {
    var m = new Mesh(ramp), rings = [];
    zk = zk == null ? 1 : zk;
    for (var i = 0; i < profile.length; i++) {
      var y = profile[i][0], r = profile[i][1], ring = [];
      if (r < 0.004) { ring.push(m.add(0, y, 0)); }
      else for (var a = 0; a < seg; a++) {
        var t = a / seg * Math.PI * 2;
        ring.push(m.add(Math.cos(t) * r, y, Math.sin(t) * r * zk));
      }
      rings.push(ring);
    }
    for (var i2 = 0; i2 < rings.length - 1; i2++) {
      var A = rings[i2], B = rings[i2 + 1];
      for (var a2 = 0; a2 < seg; a2++) {
        var a3 = (a2 + 1) % seg;
        var p0 = A[A.length === 1 ? 0 : a2], p1 = A[A.length === 1 ? 0 : a3];
        var q0 = B[B.length === 1 ? 0 : a2], q1 = B[B.length === 1 ? 0 : a3];
        if (A.length > 1) m.f.push([p0, p1, q0]);
        if (B.length > 1) m.f.push([p1, q1, q0]);
      }
    }
    m.joint = joint;
    return m;
  }

  // a limb: a tube swept down a chain of joints, each vertex bound to the two
  // joints it lies between — this is what lets an elbow bend without a crease
  function tube(pts, radii, seg, ramp, joints) {
    // CLOSE BOTH ENDS.  An open tube shows its own inside as a pale band across
    // the shoulder — which is exactly what the first sleeves did.
    pts = [[pts[0][0], pts[0][1] + (pts[0][1]-pts[1][1])*0.12, pts[0][2]]].concat(pts)
            .concat([[pts[pts.length-1][0],
                      pts[pts.length-1][1] - Math.abs(pts[pts.length-1][1]-pts[pts.length-2][1])*0.35,
                      pts[pts.length-1][2]]]);
    radii = [radii[0]*0.18].concat(radii).concat([radii[radii.length-1]*0.22]);
    joints = [joints[0]].concat(joints).concat([joints[joints.length-1]]);
    var m = new Mesh(ramp); m.bind = [];
    for (var i = 0; i < pts.length; i++) {
      var p = pts[i], r = radii[i];
      for (var a = 0; a < seg; a++) {
        var t = a / seg * Math.PI * 2;
        m.add(p[0] + Math.cos(t) * r, p[1], p[2] + Math.sin(t) * r);
        m.bind.push(joints[i]);
      }
    }
    for (var i2 = 0; i2 < pts.length - 1; i2++)
      for (var a2 = 0; a2 < seg; a2++) {
        var a3 = (a2 + 1) % seg, o = i2 * seg, o2 = (i2 + 1) * seg;
        m.f.push([o + a2, o + a3, o2 + a2]);
        m.f.push([o + a3, o2 + a3, o2 + a2]);
      }
    return m;
  }

  function sphere(cx, cy, cz, r, zk, seg, ramp, joint) {
    var m = new Mesh(ramp), rings = [], rows = Math.round(seg * 0.6);
    for (var i = 0; i <= rows; i++) {
      var ph = i / rows * Math.PI, ring = [];
      var rr = Math.sin(ph) * r, yy = cy + Math.cos(ph) * r;
      if (rr < 0.004) ring.push(m.add(cx, yy, cz));
      else for (var a = 0; a < seg; a++) {
        var t = a / seg * Math.PI * 2;
        ring.push(m.add(cx + Math.cos(t) * rr, yy, cz + Math.sin(t) * rr * zk));
      }
      rings.push(ring);
    }
    for (var i2 = 0; i2 < rings.length - 1; i2++) {
      var A = rings[i2], B = rings[i2 + 1];
      for (var a2 = 0; a2 < seg; a2++) {
        var a3 = (a2 + 1) % seg;
        var p0 = A[A.length === 1 ? 0 : a2], p1 = A[A.length === 1 ? 0 : a3];
        var q0 = B[B.length === 1 ? 0 : a2], q1 = B[B.length === 1 ? 0 : a3];
        if (A.length > 1) m.f.push([p0, p1, q0]);
        if (B.length > 1) m.f.push([p1, q1, q0]);
      }
    }
    m.joint = joint;
    return m;
  }

  // ── THE SKELETON ─────────────────────────────────────────────────────────
  var J = {
    root:     { p: null, o: [0, 0, 0] },
    hips:     { p: 'root',  o: [0, 0.16, 0] },
    chest:    { p: 'hips',  o: [0, 0.34, 0] },
    neck:     { p: 'chest', o: [0, 0.06, 0] },
    head:     { p: 'neck',  o: [0, 0.04, 0] },
    shoulderL:{ p: 'chest', o: [-0.132, 0.02, 0] },
    elbowL:   { p: 'shoulderL', o: [-0.038, -0.145, 0.008] },
    wristL:   { p: 'elbowL',    o: [-0.026, -0.118, 0.012] },
    shoulderR:{ p: 'chest', o: [0.132, 0.02, 0] },
    elbowR:   { p: 'shoulderR', o: [0.038, -0.145, 0.008] },
    wristR:   { p: 'elbowR',    o: [0.026, -0.118, 0.012] },
    hipL:     { p: 'hips',  o: [-0.086, -0.03, 0] },
    footL:    { p: 'hipL',  o: [0, -0.10, 0.012] },
    hipR:     { p: 'hips',  o: [0.086, -0.03, 0] },
    footR:    { p: 'hipR',  o: [0, -0.10, 0.012] }
  };
  var JN = Object.keys(J);
  JN.forEach(function (n, i) { J[n].i = i; J[n].n = n; });

  // ── THE MODEL ────────────────────────────────────────────────────────────
  var PARTS = null;
  function build() {
    if (PARTS) return PARTS;
    var SEG = 44, P = [];

    // BODY — his bell, pinched hard where the hood ends.  That pinch (halfwidth
    // 0.151 at 0.46 from the top) is the single most characteristic line in his
    // drawing, and the first 3D pass lost it entirely.
    var body = lathe([
      [0.545, 0.000], [0.543, 0.080], [0.538, 0.120], [0.526, 0.142],
      [0.498, 0.163], [0.436, 0.181], [0.356, 0.194], [0.276, 0.204],
      [0.196, 0.212], [0.148, 0.211], [0.124, 0.204], [0.112, 0.160], [0.108, 0.000]
    ], SEG, 0.80, C.cloth, 'chest');
    body.tag = 'body'; P.push(body);

    // HEAD
    var head = sphere(0, HEAD_Y, HEAD_Z, HEAD_R, 0.94, SEG,
                      [C.hair, C.hair, C.hair, C.hair, C.hair, C.hair], 'head');
    for (var hv = 0; hv < head.v.length; hv += 3) {
      var lz = head.v[hv+2] - HEAD_Z;
      if (lz > 0) head.v[hv+2] = HEAD_Z + lz * 0.30 + HEAD_R * 0.42;
      head.v[hv] *= 1.02;
      head.v[hv+1] = HEAD_Y + (head.v[hv+1] - HEAD_Y) * 1.06;
    }
    head.face = true; head.tag = 'head';

    // HOOD — an egg that tapers at the crown, not a blunt helmet
    var prof = [
      [0.992, 0.026], [0.978, 0.070], [0.955, 0.112], [0.925, 0.146],
      [0.885, 0.174], [0.840, 0.196], [0.786, 0.213], [0.726, 0.226],
      [0.668, 0.231], [0.622, 0.224], [0.585, 0.204], [0.558, 0.176], [0.545, 0.150]
    ];
    var hood = lathe(prof, SEG, 0.95, C.cloth, 'head');
    var inner = lathe(prof.map(function (q) { return [q[0] - 0.005, q[1] * 0.88]; }), SEG, 0.95,
                      [C.cloth[3], C.cloth[3], C.cloth[4], C.cloth[4], C.cloth[5], C.cloth[5]], 'head');
    inner.f.forEach(function (f) { var t = f[1]; f[1] = f[2]; f[2] = t; });
    // THE OPENING IS A ROUNDED HOLE, not a cone: cutting by angle alone leaves a
    // rectangular port with stepped sides.  Cut against an ellipse aimed forward
    // from the middle of the skull and the cowl frames his face the way it should.
    function openFace(m, ax, ay, push) {
      m.f = m.f.filter(function (f) {
        var x = (m.v[f[0]*3] + m.v[f[1]*3] + m.v[f[2]*3]) / 3;
        var y = (m.v[f[0]*3+1] + m.v[f[1]*3+1] + m.v[f[2]*3+1]) / 3;
        var z = (m.v[f[0]*3+2] + m.v[f[1]*3+2] + m.v[f[2]*3+2]) / 3;
        var dx = x, dy = y - (HEAD_Y + 0.012), dz = z - HEAD_Z;
        var d = Math.hypot(dx, dy, dz) || 1;
        if (dz / d < 0.12) return true;                       // only the front
        var u = (dx / d) / ax, v = (dy / d) / ay;
        return (u*u + v*v) > push;
      });
    }
    openFace(hood, 0.44, 0.55, 1.0);
    openFace(inner, 0.575, 0.700, 1.0);
    function halve(m) {
      var back = new Mesh(m.ramp), front = new Mesh(m.ramp);
      back.v = m.v; front.v = m.v; back.joint = front.joint = m.joint;
      back.tag = front.tag = m.tag;
      m.f.forEach(function (f) {
        var z = (m.v[f[0]*3+2] + m.v[f[1]*3+2] + m.v[f[2]*3+2]) / 3;
        (z < 0 ? back : front).f.push(f);
      });
      return [back, front];
    }
    // THE DROOP.  His hood is not a ball — the crown tapers to a soft point that
    // flops BACKWARD, and it is one of the first things you recognise him by.
    // Bend the upper rings back and shrink them as they go.
    [hood, inner].forEach(function (m) {
      for (var i = 0; i < m.v.length; i += 3) {
        var y = m.v[i+1];
        var t = Math.max(0, Math.min(1, (y - 0.735) / 0.257));
        var e = t * t;
        m.v[i+2] -= e * 0.115;                       // fall back
        m.v[i]   *= 1 - e * 0.16;                    // and narrow as it falls
        m.v[i+1] -= e * 0.026;
      }
    });
    var hh = halve(hood), ii = halve(inner);
    hh[0].tag = hh[1].tag = 'hood'; ii[0].tag = ii[1].tag = 'hood';
    P.push(hh[0], ii[0]);
    P.push(head);
    P.push(ii[1], hh[1]);

    // ARMS — his sleeves reach ±0.256 at 0.74 down, which puts the tube's centre
    // at ±0.20; they hang close to the body, not out from it
    ['L', 'R'].forEach(function (s) {
      var k = s === 'L' ? -1 : 1;
      var sh = [k * 0.140, 0.520, 0], el = [k * 0.176, 0.392, 0.010], wr = [k * 0.200, 0.264, 0.020];
      var arm = tube(
        [[sh[0]*0.44, 0.508, sh[2]], [sh[0]*0.75, 0.492, sh[2]], [(sh[0]+el[0])/2, (sh[1]+el[1])/2, 0.004], el,
         [(el[0]+wr[0])/2, (el[1]+wr[1])/2, 0.014], [wr[0], wr[1]+0.014, wr[2]], wr,
         [wr[0], wr[1] - 0.016, wr[2]]],
        [0.066, 0.062, 0.059, 0.056, 0.054, 0.052, 0.056, 0.054], SEG, C.cloth,
        ['shoulder'+s, 'shoulder'+s, 'shoulder'+s, 'elbow'+s, 'elbow'+s, 'wrist'+s, 'wrist'+s, 'wrist'+s]);
      arm.tag = 'arm'; P.push(arm);
      // the paw: flattened front to back, with short finger ridges — his glove
      var paw = sphere(wr[0], wr[1] - 0.044, wr[2] + 0.006, 0.042, 1.05, 20, C.skin, 'wrist'+s);
      for (var i = 0; i < paw.v.length; i += 3) {
        paw.v[i] = wr[0] + (paw.v[i] - wr[0]) * 0.90;
        paw.v[i+1] = (wr[1]-0.046) + (paw.v[i+1] - (wr[1]-0.046)) * 1.10;
      }
      paw.tag = 'paw'; P.push(paw);
      for (var f = 0; f < 3; f++) {
        var fx = wr[0] + (f - 1) * 0.024, fz = wr[2] + 0.022 - Math.abs(f - 1) * 0.006;
        var nub = sphere(fx, wr[1] - 0.078, fz, 0.015, 1.3, 10, C.skin, 'wrist'+s);
        nub.tag = 'paw'; P.push(nub);
      }
    });

    // LEGS AND FEET
    ['L', 'R'].forEach(function (s) {
      var k = s === 'L' ? -1 : 1;

      var foot = sphere(k * 0.086, 0.050, 0.014, 0.049, 1.42, 22, C.skin, 'foot'+s);
      for (var i = 0; i < foot.v.length; i += 3) {
        foot.v[i] = k*0.086 + (foot.v[i] - k*0.086) * 0.94;
        foot.v[i+1] = 0.050 + (foot.v[i+1] - 0.050) * 0.80;
      }
      P.push(foot);
      for (var f = 0; f < 3; f++)
        P.push(sphere(k*0.086 + (f-1)*0.025, 0.028, 0.052, 0.014, 1.2, 12, C.skin, 'foot'+s));
    });

    P.forEach(function (m) {
      m.norms = new Float32Array(m.v.length);
      m.f.forEach(function (f) {
        var ax=m.v[f[0]*3],ay=m.v[f[0]*3+1],az=m.v[f[0]*3+2];
        var bx=m.v[f[1]*3],by=m.v[f[1]*3+1],bz=m.v[f[1]*3+2];
        var cx=m.v[f[2]*3],cy=m.v[f[2]*3+1],cz=m.v[f[2]*3+2];
        var ux=bx-ax,uy=by-ay,uz=bz-az, vx=cx-ax,vy=cy-ay,vz=cz-az;
        var nx=uy*vz-uz*vy, ny=uz*vx-ux*vz, nz=ux*vy-uy*vx;
        for (var j=0;j<3;j++){ m.norms[f[j]*3]+=nx; m.norms[f[j]*3+1]+=ny; m.norms[f[j]*3+2]+=nz; }
      });
      for (var i=0;i<m.norms.length;i+=3){
        var d=Math.hypot(m.norms[i],m.norms[i+1],m.norms[i+2])||1;
        m.norms[i]/=d; m.norms[i+1]/=d; m.norms[i+2]/=d;
      }
    });
    PARTS = P;
    return P;
  }

  // ── the face texture ─────────────────────────────────────────────────────
  var FACE = null, FACE_OK = false, WAIT = [];
  function loadFace() {
    if (FACE) return;
    FACE = new Image();
    FACE.onload = function () { FACE_OK = true; WAIT.splice(0).forEach(function (f) { f(); }); };
    FACE.onerror = function () { FACE_OK = false; WAIT.splice(0).forEach(function (f) { f(); }); };
    FACE.src = (window.__castBase || '/cast/') + 'rig/face.webp?v=1';
  }
  function ready() { return !!FACE_OK; }
  function onReady(cb) { loadFace(); if (FACE_OK) cb(); else WAIT.push(cb); }

  function triTex(ctx, im, x0,y0,x1,y1,x2,y2, u0,v0,u1,v1,u2,v2) {
    var det = u0*(v1-v2) - u1*(v0-v2) + u2*(v0-v1);
    if (!det) return;
    var cx=(x0+x1+x2)/3, cy=(y0+y1+y2)/3, G=0.7;
    function g(x,y){ var d=Math.hypot(x-cx,y-cy)||1; return [x+(x-cx)/d*G, y+(y-cy)/d*G]; }
    var p0=g(x0,y0), p1=g(x1,y1), p2=g(x2,y2);
    ctx.save();
    ctx.beginPath(); ctx.moveTo(p0[0],p0[1]); ctx.lineTo(p1[0],p1[1]); ctx.lineTo(p2[0],p2[1]); ctx.closePath(); ctx.clip();
    ctx.transform(
      (x0*(v1-v2) - x1*(v0-v2) + x2*(v0-v1))/det,
      (y0*(v1-v2) - y1*(v0-v2) + y2*(v0-v1))/det,
      (u0*(x1-x2) - u1*(x0-x2) + u2*(x0-x1))/det,
      (u0*(y1-y2) - u1*(y0-y2) + u2*(y0-y1))/det,
      (u0*(v1*x2-v2*x1) - u1*(v0*x2-v2*x0) + u2*(v0*x1-v1*x0))/det,
      (u0*(v1*y2-v2*y1) - u1*(v0*y2-v2*y0) + u2*(v0*y1-v1*y0))/det);
    ctx.drawImage(im, 0, 0);
    ctx.restore();
  }

  // ── posing ───────────────────────────────────────────────────────────────
  function eul(rx, ry, rz) {
    var cx=Math.cos(rx),sx=Math.sin(rx),cy=Math.cos(ry),sy=Math.sin(ry),cz=Math.cos(rz),sz=Math.sin(rz);
    return [cy*cz+sy*sx*sz, -cy*sz+sy*sx*cz, sy*cx,
            cx*sz,           cx*cz,          -sx,
            -sy*cz+cy*sx*sz, sy*sz+cy*sx*cz, cy*cx];
  }
  function mul(a, b) {                      // 3x3 * 3x3
    var o = new Array(9);
    for (var r=0;r<3;r++) for (var c=0;c<3;c++)
      o[r*3+c] = a[r*3]*b[c] + a[r*3+1]*b[3+c] + a[r*3+2]*b[6+c];
    return o;
  }
  function ap(m, v) {
    return [m[0]*v[0]+m[1]*v[1]+m[2]*v[2], m[3]*v[0]+m[4]*v[1]+m[5]*v[2], m[6]*v[0]+m[7]*v[1]+m[8]*v[2]];
  }
  function solvePose(pose) {
    var R = {}, T = {}, rest = {};
    // rest world position of each joint
    JN.forEach(function (n) {
      var j = J[n];
      rest[n] = j.p ? [rest[j.p][0]+j.o[0], rest[j.p][1]+j.o[1], rest[j.p][2]+j.o[2]] : j.o.slice();
    });
    var rot = pose.rot || {}, mats = pose.mat || {};
    JN.forEach(function (n) {
      var j = J[n], r = rot[n] || [0,0,0];
      var local = mats[n] || eul(r[0], r[1], r[2]);
      if (j.p) {
        R[n] = mul(R[j.p], local);
        var off = ap(R[j.p], j.o);
        T[n] = [T[j.p][0]+off[0], T[j.p][1]+off[1], T[j.p][2]+off[2]];
      } else { R[n] = local; T[n] = j.o.slice(); }
    });
    return { R: R, T: T, rest: rest };
  }
  function skin(pose, joint, v) {
    var R = pose.R[joint], T = pose.T[joint], r = pose.rest[joint];
    var d = [v[0]-r[0], v[1]-r[1], v[2]-r[2]], o = ap(R, d);
    return [T[0]+o[0], T[1]+o[1], T[2]+o[2]];
  }

  // ── draw ─────────────────────────────────────────────────────────────────
  //  Parts are drawn back to front, each one OUTLINED then filled.  The outline
  //  is not a per-triangle push along normals — that saws the silhouette into
  //  spikes, which is exactly how the first pass looked.  Instead every triangle
  //  of the part is filled AND stroked thickly in the line colour: the triangles
  //  tile the part, so their union is the part's own silhouette, grown evenly.
  function draw(ctx, p) {
    var parts = build();
    var h = p.h, X = p.x, Y = p.y;
    var yaw = (p.yaw || 0) * Math.PI/180, pitch = (p.pitch || 0) * Math.PI/180;
    var cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
    var pose = solvePose(p);
    var baked = parts.map(function (m) {
      var n = m.v.length/3, W = new Float32Array(n*3), NW = new Float32Array(n*3), zsum = 0;
      for (var i=0;i<n;i++) {
        var jn = m.bind ? m.bind[i] : m.joint;
        var w = skin(pose, jn, [m.v[i*3], m.v[i*3+1], m.v[i*3+2]]);
        var x1 = w[0]*cy + w[2]*sy, z1 = -w[0]*sy + w[2]*cy, y1 = w[1];
        W[i*3]=x1; W[i*3+1]=y1*cp - z1*sp; W[i*3+2]=y1*sp + z1*cp;
        zsum += W[i*3+2];
        var R = pose.R[jn];
        var nn = ap(R, [m.norms[i*3], m.norms[i*3+1], m.norms[i*3+2]]);
        var nx1 = nn[0]*cy + nn[2]*sy, nz1 = -nn[0]*sy + nn[2]*cy, ny1 = nn[1];
        NW[i*3]=nx1; NW[i*3+1]=ny1*cp - nz1*sp; NW[i*3+2]=ny1*sp + nz1*cp;
      }
      return { m: m, W: W, N: NW, z: zsum/n };
    });
    baked.sort(function (a2, b2) { return a2.z - b2.z; });
    if (p.only) baked = baked.filter(function (bk) { return bk.m.tag === p.only; });

    var O = h * 0.011;
    baked.forEach(function (bk) {
      var m = bk.m, W = bk.W, N = bk.N;
      function px(i) { return X + W[i*3] * h; }
      function py(i) { return Y - W[i*3+1] * h; }
      // depth-sort this part's own faces
      var order = m.f.map(function (f, i) { return i; }).sort(function (i, j) {
        return (W[m.f[i][0]*3+2]+W[m.f[i][1]*3+2]+W[m.f[i][2]*3+2])
             - (W[m.f[j][0]*3+2]+W[m.f[j][1]*3+2]+W[m.f[j][2]*3+2]); });
      // 1. the contour
      ctx.save();
      ctx.fillStyle = C.line; ctx.strokeStyle = C.line;
      ctx.lineWidth = O * 2; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
      order.forEach(function (i) {
        var f = m.f[i];
        ctx.beginPath();
        ctx.moveTo(px(f[0]),py(f[0])); ctx.lineTo(px(f[1]),py(f[1])); ctx.lineTo(px(f[2]),py(f[2]));
        ctx.closePath(); ctx.fill(); ctx.stroke();
      });
      ctx.restore();
      // 2. the surface — back faces first so a hollow hood shows its inside
      order.forEach(function (i) {
        var f = m.f[i];
        var ax=px(f[0]),ay=py(f[0]),bx=px(f[1]),by=py(f[1]),cx2=px(f[2]),cy2=py(f[2]);
        var nx=(N[f[0]*3]+N[f[1]*3]+N[f[2]*3])/3;
        var ny=(N[f[0]*3+1]+N[f[1]*3+1]+N[f[2]*3+1])/3;
        var nz=(N[f[0]*3+2]+N[f[1]*3+2]+N[f[2]*3+2])/3;
        var facing = (bx-ax)*(cy2-ay)-(by-ay)*(cx2-ax) < 0;
        if (!facing) { nx=-nx; ny=-ny; nz=-nz; }
        ctx.fillStyle = shade(m.ramp, norm([nx,ny,nz]));
        ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = 1.15;
        ctx.beginPath(); ctx.moveTo(ax,ay); ctx.lineTo(bx,by); ctx.lineTo(cx2,cy2); ctx.closePath();
        ctx.fill(); ctx.stroke();
      });
      // 3. and if this is the skull, it wears his face — drawn HERE, in the part
      //    order, so the hood can pass in front of it
      if (m.face && FACE_OK) drawFace(ctx, m, W, X, Y, h);
    });
    return true;
  }

  // the face is mapped by where a vertex sits on the skull, so it turns with his
  // head instead of sliding across it
  function drawFace(ctx, m, W, X, Y, h) {
    var cxm = 0, cym = HEAD_Y, czm = HEAD_Z, rad = HEAD_R;
    var n = m.v.length/3, U = new Float32Array(n*2), vis = new Uint8Array(n);
    for (var i=0;i<n;i++) {
      var lx=m.v[i*3]-cxm, ly=m.v[i*3+1]-cym, lz=m.v[i*3+2]-czm;
      U[i*2]   = (lx/rad*0.375 + 0.5) * FW;
      U[i*2+1] = (0.50 - ly/rad*0.362) * FH;
      vis[i] = lz > HEAD_R * 0.30 ? 1 : 0;
    }
    m.f.forEach(function (f) {
      if (!vis[f[0]] || !vis[f[1]] || !vis[f[2]]) return;
      var ax=X+W[f[0]*3]*h, ay=Y-W[f[0]*3+1]*h;
      var bx=X+W[f[1]*3]*h, by=Y-W[f[1]*3+1]*h;
      var cx2=X+W[f[2]*3]*h, cy2=Y-W[f[2]*3+1]*h;
      if ((bx-ax)*(cy2-ay)-(by-ay)*(cx2-ax) >= 0) return;
      triTex(ctx, FACE, ax,ay,bx,by,cx2,cy2,
             U[f[0]*2],U[f[0]*2+1], U[f[1]*2],U[f[1]*2+1], U[f[2]*2],U[f[2]*2+1]);
    });
  }

  // ── two-bone IK, done properly ───────────────────────────────────────────
  //  The first version guessed at Euler angles from a yaw and a pitch and got
  //  arms that folded across his chest when told to reach up.  This solves the
  //  real thing: put the wrist at the target, place the elbow on the circle of
  //  valid positions using a pole vector, then build each joint's rotation as
  //  the rotation that carries its REST direction onto its new one.
  function sub(a2,b2){return [a2[0]-b2[0],a2[1]-b2[1],a2[2]-b2[2]];}
  function add(a2,b2){return [a2[0]+b2[0],a2[1]+b2[1],a2[2]+b2[2]];}
  function scl(a2,k){return [a2[0]*k,a2[1]*k,a2[2]*k];}
  function dot(a2,b2){return a2[0]*b2[0]+a2[1]*b2[1]+a2[2]*b2[2];}
  function crs(a2,b2){return [a2[1]*b2[2]-a2[2]*b2[1], a2[2]*b2[0]-a2[0]*b2[2], a2[0]*b2[1]-a2[1]*b2[0]];}
  function axisAngle(ax, ang) {
    var c = Math.cos(ang), s2 = Math.sin(ang), t = 1 - c, x = ax[0], y = ax[1], z = ax[2];
    return [t*x*x+c,   t*x*y-s2*z, t*x*z+s2*y,
            t*x*y+s2*z, t*y*y+c,   t*y*z-s2*x,
            t*x*z-s2*y, t*y*z+s2*x, t*z*z+c];
  }
  function fromTo(a2, b2) {
    var d = Math.max(-1, Math.min(1, dot(a2, b2)));
    if (d > 0.99999) return [1,0,0, 0,1,0, 0,0,1];
    var ax = crs(a2, b2), L = Math.hypot(ax[0], ax[1], ax[2]);
    if (L < 1e-7) {                                   // exactly opposite
      var t = Math.abs(a2[0]) < 0.9 ? [1,0,0] : [0,1,0];
      ax = crs(a2, t); L = Math.hypot(ax[0], ax[1], ax[2]);
      return axisAngle([ax[0]/L, ax[1]/L, ax[2]/L], Math.PI);
    }
    return axisAngle([ax[0]/L, ax[1]/L, ax[2]/L], Math.acos(d));
  }
  function tpose(m) { return [m[0],m[3],m[6], m[1],m[4],m[7], m[2],m[5],m[8]]; }
  function restOf(name) {
    var j = J[name];
    return j.p ? add(restOf(j.p), j.o) : j.o.slice();
  }
  // target is in model space: x right, y up (0 = ground, 1 = crown), z toward you
  //
  //  The pole — which way the elbow points — is taken from HIS OWN REST ARM, not
  //  from a guessed vector.  Ask this solver for the rest position and it returns
  //  exactly the rest pose; a hand-picked pole was leaving the elbow 16° out even
  //  when nothing was supposed to move.  `twist` rotates the elbow around the
  //  shoulder-to-hand line when a page wants it carried differently.
  function reachTo(out, side, target, twist) {
    var S = restOf('shoulder'+side), E = restOf('elbow'+side), Wp = restOf('wrist'+side);
    var dU = norm(sub(E, S)), dF = norm(sub(Wp, E));
    var L1 = Math.hypot.apply(null, sub(E, S)), L2 = Math.hypot.apply(null, sub(Wp, E));
    var restU = norm(sub(Wp, S));
    // HIS REST ARM IS STRAIGHT — shoulder to wrist is 0.2714 against an arm of
    // 0.2715 — so it carries no bend plane to read.  State it instead: the elbow
    // goes BACK and slightly out, which is where a child's elbow goes.
    var k = side === 'L' ? -1 : 1;
    var want = [k * 0.34, -0.05, -1];
    var pole0 = norm(sub(want, scl(restU, dot(want, restU))));
    var d = sub(target, S), len = Math.hypot(d[0], d[1], d[2]) || 1e-5;
    len = Math.max(Math.abs(L1 - L2) + 0.006, Math.min((L1 + L2) * 0.999, len));
    var u = scl(d, 1 / Math.hypot(d[0], d[1], d[2]));
    // carry the rest pole around with the arm as it swings
    var Rt = fromTo(restU, u);
    var pole = [Rt[0]*pole0[0]+Rt[1]*pole0[1]+Rt[2]*pole0[2],
                Rt[3]*pole0[0]+Rt[4]*pole0[1]+Rt[5]*pole0[2],
                Rt[6]*pole0[0]+Rt[7]*pole0[1]+Rt[8]*pole0[2]];
    if (twist) {
      var Rw = axisAngle(u, twist);
      pole = [Rw[0]*pole[0]+Rw[1]*pole[1]+Rw[2]*pole[2],
              Rw[3]*pole[0]+Rw[4]*pole[1]+Rw[5]*pole[2],
              Rw[6]*pole[0]+Rw[7]*pole[1]+Rw[8]*pole[2]];
    }
    pole = norm(sub(pole, scl(u, dot(pole, u))));        // keep it square to the arm
    var A = Math.acos(Math.max(-1, Math.min(1, (L1*L1 + len*len - L2*L2) / (2*L1*len))));
    var uw = add(scl(u, Math.cos(A)), scl(pole, Math.sin(A)));
    var Rs = fromTo(dU, uw);
    var Ew = add(S, scl(uw, L1));
    var fw = sub(target, Ew), fl = Math.hypot(fw[0], fw[1], fw[2]) || 1;
    out['shoulder'+side] = Rs;
    out['elbow'+side] = mul(tpose(Rs), fromTo(dF, scl(fw, 1/fl)));
  }

  window.__kid3d = { draw: draw, ready: ready, onReady: onReady, reachTo: reachTo, J: J };
})();
