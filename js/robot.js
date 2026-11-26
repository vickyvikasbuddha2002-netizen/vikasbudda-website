/* Roam, built from the packaging study (ROAMB), rendered with three.js. Two stages: hero and exploded. */
window.RoamStage = (function () {
  var THREE = window.THREE;
  function unb64(s, T) { var b = atob(s), u = new Uint8Array(b.length); for (var i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return new T(u.buffer); }
  function meshGeo(m) {
    var q = unb64(m.v, Int16Array), p = new Float32Array(q.length); for (var i = 0; i < q.length; i++) p[i] = q[i] * 0.005;
    var g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3)); g.setIndex(new THREE.BufferAttribute(unb64(m.i, m.big ? Uint32Array : Uint16Array), 1));
    if (m.uv) { var u = unb64(m.uv, Uint16Array), uv = new Float32Array(u.length); for (i = 0; i < u.length; i++) uv[i] = (u[i] - 10000) / 20000; g.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); }
    g.computeVertexNormals(); return g;
  }
  var GEO = null;
  function geos() { if (!GEO) { var M = window.ROAMB.mesh; GEO = { cover: meshGeo(M.cover), tub: meshGeo(M.tub), panel: meshGeo(M.panel) }; } return GEO; }
  function arc(cx, cy, r, a0, a1, n) { var o = []; for (var i = 0; i <= n; i++) { var a = a0 + (a1 - a0) * i / n; o.push(new THREE.Vector2(cx + r * Math.cos(a), cy + r * Math.sin(a))); } return o; }

  function create(canvas, opts) {
    opts = opts || {};
    var renderer;
    try { renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true, powerPreference: 'high-performance' }); } catch (e) { return null; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.outputEncoding = THREE.sRGBEncoding; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
    renderer.setClearColor(0x000000, 0);
    var scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(opts.fov || 24, 1, 10, 6000);
    // studio environment: dark room, one big soft top light, a cool blue side panel
    (function () {
      var es = new THREE.Scene();
      es.add(new THREE.Mesh(new THREE.BoxGeometry(2000, 1400, 2000), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.04, 0.032, 0.027), side: THREE.BackSide })));
      function panel(w, h, x, y, z, c, rx, ry) { var m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: c, side: THREE.DoubleSide })); m.position.set(x, y, z); m.rotation.set(rx || 0, ry || 0, 0); es.add(m); }
      panel(1000, 800, 0, 690, 100, new THREE.Color(6.6, 6.2, 5.8), Math.PI / 2, 0);
      panel(260, 1100, -990, 200, 260, new THREE.Color(7.4, 6.8, 6.2), 0, Math.PI / 2);
      panel(260, 1100, 990, 200, 260, new THREE.Color(4.6, 4.2, 3.9), 0, -Math.PI / 2);
      panel(500, 900, -700, 200, -900, new THREE.Color(5, 2.6, 1.2), 0, Math.PI / 4);
      panel(1400, 220, 0, 300, 990, new THREE.Color(2.4, 2.2, 2), 0, Math.PI);
      panel(2000, 2000, 0, -300, 0, new THREE.Color(0.03, 0.022, 0.018), -Math.PI / 2, 0);
      try { var pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromScene(es, 0.04).texture; pm.dispose(); } catch (e) {}
    })();
    scene.add(new THREE.HemisphereLight(0xfff0e4, 0x0a0605, 0.3));
    var key = new THREE.DirectionalLight(0xfff3e8, 0.9); key.position.set(-260, 520, 420); scene.add(key);
    var fill = new THREE.DirectionalLight(0xffe4d0, 0.32); fill.position.set(320, 200, 300); scene.add(fill);
    var rim = new THREE.PointLight(0xff9a5e, 2.6, 900, 1.5); rim.position.set(120, 140, -220); scene.add(rim);
    var rim2 = new THREE.PointLight(0xffc29a, 1.1, 700, 1.6); rim2.position.set(-200, 60, -160); scene.add(rim2);

    /* Roam v3: a faceted head on a black turntable neck, above a tapered body with big side wheels.
       Built from flat planes so every edge is a crisp chamfer. Units are millimetres, head 100 wide. */
    var PAL = { terracotta: 0xAE4B22, sage: 0xA8B596 };
    var mShell = new THREE.MeshPhysicalMaterial({ color: PAL.terracotta, roughness: 0.7, metalness: 0, clearcoat: 0.06, clearcoatRoughness: 0.7, envMapIntensity: 0.22 });
    var mTub = mShell; mShell.color.convertSRGBToLinear();
    var eye = document.createElement('canvas'); eye.width = 320; eye.height = 240; var eg = eye.getContext('2d'), eyeTex = new THREE.CanvasTexture(eye); eyeTex.encoding = THREE.sRGBEncoding;
    var mVisor = new THREE.MeshPhysicalMaterial({ color: 0x030303, roughness: 0.05, clearcoat: 1, clearcoatRoughness: 0.03, envMapIntensity: 1.1, emissive: 0xffffff, emissiveMap: eyeTex, emissiveIntensity: 1.0, toneMapped: false });
    var mDark = new THREE.MeshPhysicalMaterial({ color: 0x0e0d0d, roughness: 0.62, clearcoat: 0, envMapIntensity: 0.1, side: THREE.DoubleSide });
    var mRubber = new THREE.MeshPhysicalMaterial({ color: 0x0b0a0a, roughness: 0.72, metalness: 0, envMapIntensity: 0.1, side: THREE.DoubleSide });
    var mFace = new THREE.MeshPhysicalMaterial({ color: 0x0d0c0c, roughness: 0.5, clearcoat: 0.25, clearcoatRoughness: 0.4, envMapIntensity: 0.14, side: THREE.DoubleSide });
    var mGap = new THREE.MeshBasicMaterial({ color: 0x050403 });
    var mGlow = new THREE.MeshBasicMaterial({ color: 0xffffff });
    var root = new THREE.Group(), GR = { base: new THREE.Group(), mid: new THREE.Group(), face: new THREE.Group(), shell: new THREE.Group(), glass: new THREE.Group() };
    Object.keys(GR).forEach(function (k) { root.add(GR[k]); }); scene.add(root);
    function rrS(w, h, r) { var sh = new THREE.Shape(), x = -w / 2, y = -h / 2; r = Math.min(r, w / 2, h / 2); sh.moveTo(x + r, y); sh.lineTo(x + w - r, y); sh.absarc(x + w - r, y + r, r, -Math.PI / 2, 0, false); sh.lineTo(x + w, y + h - r); sh.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2, false); sh.lineTo(x + r, y + h); sh.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI, false); sh.lineTo(x, y + r); sh.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5, false); return sh; }
    function octS(w, h, c) { var sh = new THREE.Shape(), x = w / 2, y = h / 2; sh.moveTo(-x + c, -y); sh.lineTo(x - c, -y); sh.lineTo(x, -y + c); sh.lineTo(x, y - c); sh.lineTo(x - c, y); sh.lineTo(-x + c, y); sh.lineTo(-x, y - c); sh.lineTo(-x, -y + c); sh.closePath(); return sh; }
    function rbox(w, h, d, r, inner) { var dd = Math.max(0.01, d - 2 * r); var g = new THREE.ExtrudeGeometry(rrS(w - 2 * r, h - 2 * r, inner || r * 0.6), { depth: dd, bevelEnabled: true, bevelThickness: r, bevelSize: r, bevelSegments: 4, curveSegments: 16 }); g.translate(0, 0, -dd / 2); return g; }
    function arc(cx, cy, r, a0, a1, n) { var o = []; for (var i = 0; i <= n; i++) { var a = a0 + (a1 - a0) * i / n; o.push(new THREE.Vector2(cx + r * Math.cos(a), cy + r * Math.sin(a))); } return o; }
    /* a convex solid from half-spaces n.p <= d, drawn flat-shaded */
    function facet(planes) {
      var P = planes.map(function (q) { var l = Math.hypot(q[0], q[1], q[2]); return [q[0] / l, q[1] / l, q[2] / l, q[3] / l]; }), V = [], N = P.length, i, j, k;
      function cr(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
      for (i = 0; i < N; i++) for (j = i + 1; j < N; j++) for (k = j + 1; k < N; k++) {
        var a = P[i], b = P[j], c = P[k], bc = cr(b, c), det = a[0] * bc[0] + a[1] * bc[1] + a[2] * bc[2]; if (Math.abs(det) < 1e-9) continue;
        var ca = cr(c, a), ab = cr(a, b), p = [0, 1, 2].map(function (t) { return (a[3] * bc[t] + b[3] * ca[t] + c[3] * ab[t]) / det; });
        if (P.every(function (q) { return q[0] * p[0] + q[1] * p[1] + q[2] * p[2] <= q[3] + 1e-6; }) && !V.some(function (v) { return Math.hypot(v[0] - p[0], v[1] - p[1], v[2] - p[2]) < 1e-4; })) V.push(p);
      }
      var pos = [], nor = [];
      P.forEach(function (q) {
        var on = V.filter(function (v) { return Math.abs(q[0] * v[0] + q[1] * v[1] + q[2] * v[2] - q[3]) < 1e-4; }); if (on.length < 3) return;
        var c = [0, 1, 2].map(function (t) { return on.reduce(function (s, v) { return s + v[t]; }, 0) / on.length; });
        var u = [on[0][0] - c[0], on[0][1] - c[1], on[0][2] - c[2]], ul = Math.hypot(u[0], u[1], u[2]); u = u.map(function (x) { return x / ul; }); var w = cr(q, u);
        on.sort(function (A, B) { var da = [A[0] - c[0], A[1] - c[1], A[2] - c[2]], db = [B[0] - c[0], B[1] - c[1], B[2] - c[2]]; return Math.atan2(da[0] * w[0] + da[1] * w[1] + da[2] * w[2], da[0] * u[0] + da[1] * u[1] + da[2] * u[2]) - Math.atan2(db[0] * w[0] + db[1] * w[1] + db[2] * w[2], db[0] * u[0] + db[1] * u[1] + db[2] * u[2]); });
        for (var t = 1; t < on.length - 1; t++) [on[0], on[t], on[t + 1]].forEach(function (v) { pos.push(v[0], v[1], v[2]); nor.push(q[0], q[1], q[2]); });
      });
      var g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); return g;
    }
    /* box from faces, every edge chamfered; ch(a, b) returns the chamfer between faces a and b (e.g. 'x+', 'z-') */
    function cbox(x0, x1, y0, y1, z0, z1, ch, extra) {
      var F = { 'x+': [1, 0, 0, x1], 'x-': [-1, 0, 0, -x0], 'y+': [0, 1, 0, y1], 'y-': [0, -1, 0, -y0], 'z+': [0, 0, 1, z1], 'z-': [0, 0, -1, -z0] }, K = Object.keys(F), pl = K.map(function (k) { return F[k]; });
      for (var i = 0; i < 6; i++) for (var j = i + 1; j < 6; j++) { var a = K[i], b = K[j]; if (a[0] === b[0]) continue; var c = ch(a, b); if (c > 0) pl.push([F[a][0] + F[b][0], F[a][1] + F[b][1], F[a][2] + F[b][2], F[a][3] + F[b][3] - c]); }
      return facet(pl.concat(extra || []));
    }
    function has(a, b, s) { return a === s || b === s; }
    function onFace(mesh, x, y, z, ry, rx) { mesh.position.set(x, y, z); mesh.rotation.set(rx || 0, ry || 0, 0, 'YXZ'); return mesh; }

    /* body: wider and deeper than the head, front and back lean in 12 degrees, black base tucked underneath */
    var BX = 53, BZ = 60, BY0 = 13, BY1 = 80;
    var BF = [0, 12, 56.5], BL = Math.hypot(BF[1], BF[2]), bn = [0, BF[1] / BL, BF[2] / BL], bd = bn[1] * BY0 + bn[2] * BZ;
    function chm(A, B, c) { return [A[0] + B[0], A[1] + B[1], A[2] + B[2], A[3] + B[3] - c]; }
    function frontAt(y) { return BZ - (y - BY0) * BF[1] / BF[2]; }
    var FR = [0, bn[1], bn[2], bd], BK = [0, bn[1], -bn[2], bd], XP = [1, 0, 0, BX], XN = [-1, 0, 0, BX], TP = [0, 1, 0, BY1], BT = [0, -1, 0, -BY0];
    /* lower bevel front and back: 12 tall, 5 deep */
    var lz = frontAt(BY0 + 12) - (BZ - 5), LF = [0, -lz, 12, -lz * BY0 + 12 * (BZ - 5)], LB = [0, -lz, -12, LF[3]];
    var BP = [FR, BK, XP, XN, TP, BT, LF, LB, chm(XP, FR, 7), chm(XN, FR, 7), chm(XP, BK, 7), chm(XN, BK, 7), chm(TP, FR, 9), chm(TP, BK, 9), chm(TP, XP, 5), chm(TP, XN, 5), chm(BT, XP, 1), chm(BT, XN, 1)];
    /* wheel pockets: each side is a frame (two legs, a top band, chamfered corners) around a recess, the wheel sits inside */
    var XI = 38, WR = 35, WK = BF[1] / BF[2], W0 = WR + 2.5, PT = 2 * WR + 3, PC = 93;
    function neg(q) { return [-q[0], -q[1], -q[2], -q[3]]; }
    var PF = [0, WK, 1, W0 + WR * WK], PB = [0, WK, -1, W0 + WR * WK];
    function shellPart(extra) { var m = new THREE.Mesh(facet(BP.concat(extra)), mShell); GR.base.add(m); return m; }
    var body = shellPart([[1, 0, 0, XI], [-1, 0, 0, XI]]);
    var chB = function (a, b) { return a[0] === 'x' && b[0] === 'z' ? 9 : (has(a, b, 'y-') ? 2 : 0); };
    function baseBox(extra) { GR.base.add(new THREE.Mesh(cbox(-BX + 2, BX - 2, 2.5, BY0 + 0.3, -(BZ - 7), BZ - 7, chB, extra), mDark)); }
    baseBox([[1, 0, 0, XI], [-1, 0, 0, XI]]);
    [-1, 1].forEach(function (sd) {
      var SX = [-sd, 0, 0, -XI];
      shellPart([SX, neg(PF)]); shellPart([SX, neg(PB)]); shellPart([SX, PF, PB, [0, -1, 0, -PT]]);
      shellPart([SX, PF, PB, [0, 1, 0, PT], [0, -1, -1, -PC]]); shellPart([SX, PF, PB, [0, 1, 0, PT], [0, -1, 1, -PC]]);
      baseBox([SX, neg(PF)]); baseBox([SX, neg(PB)]);
      /* dark back wall of the pocket */
      var zl = function (y) { return W0 + (WR - y) * WK; }, yc = (PC - W0 - WR * WK) / (1 - WK), ps = new THREE.Shape();
      [[-zl(2.5), 2.5], [zl(2.5), 2.5], [zl(yc), yc], [PC - PT, PT], [PT - PC, PT], [-zl(yc), yc]].forEach(function (p, i) { if (i) ps.lineTo(p[0], p[1]); else ps.moveTo(p[0], p[1]); });
      var pw = new THREE.Mesh(new THREE.ShapeGeometry(ps), mGap); pw.position.set(sd * (XI + 0.15), 0, 0); pw.rotation.y = sd * Math.PI / 2; GR.base.add(pw);
    });
    var slope = Math.atan2(bn[1], bn[2]);
    var bar = onFace(new THREE.Mesh(new THREE.ShapeGeometry(rrS(30, 3.2, 1.6), 12), mGlow), 0, 44, frontAt(44) + 0.25, 0, -slope); GR.base.add(bar);
    var gc = document.createElement('canvas'); gc.width = 128; gc.height = 32; var gx = gc.getContext('2d'), gg = gx.createRadialGradient(64, 16, 2, 64, 16, 64); gg.addColorStop(0, 'rgba(255,250,246,.16)'); gg.addColorStop(.25, 'rgba(255,236,224,.04)'); gg.addColorStop(1, 'rgba(255,200,170,0)'); gx.fillStyle = gg; gx.fillRect(0, 0, 128, 32);
    var barGlow = onFace(new THREE.Mesh(new THREE.PlaneGeometry(38, 7), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(gc), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })), 0, 44, frontAt(44) + 0.4, 0, -slope); GR.base.add(barGlow);
    // USB-C on the back, low down in a dark pocket
    var usbY = 33, usbZ = -frontAt(usbY);
    var pocketS = rrS(46, 15, 5); pocketS.holes.push(rrS(44.4, 13.4, 4.2)); GR.base.add(onFace(new THREE.Mesh(new THREE.ShapeGeometry(pocketS, 12), mGap), 0, usbY, usbZ - 0.2, Math.PI, -slope));
    GR.base.add(onFace(new THREE.Mesh(new THREE.ShapeGeometry(rrS(9.4, 3.4, 1.7), 10), new THREE.MeshPhysicalMaterial({ color: 0x8a8582, roughness: 0.3, metalness: 0.8 })), 0, usbY, usbZ - 0.35, Math.PI, -slope));
    GR.base.add(onFace(new THREE.Mesh(new THREE.ShapeGeometry(rrS(7.6, 1.8, 0.9), 10), mGap), 0, usbY, usbZ - 0.45, Math.PI, -slope));
    var wheels = [];
    [-1, 1].forEach(function (sd) {
      var g = new THREE.Group(); g.position.set(sd * (BX + 6 - 9), 0, 0); GR.base.add(g);
      var piv = new THREE.Group(); piv.position.set(0, WR, 0); g.add(piv); wheels.push(piv);
      var R = WR, Wd = 18, tp = [new THREE.Vector2(20, -Wd / 2)].concat(arc(R - 3.2, -Wd / 2 + 3.2, 3.2, -Math.PI / 2, 0, 6), arc(R - 3.2, Wd / 2 - 3.2, 3.2, 0, Math.PI / 2, 6), [new THREE.Vector2(20, Wd / 2)]);
      var ty = new THREE.Mesh(new THREE.LatheGeometry(tp, 72), mRubber); ty.rotation.z = Math.PI / 2; piv.add(ty);
      var fp = [new THREE.Vector2(0, Wd / 2 + 0.9), new THREE.Vector2(20, Wd / 2 + 0.5), new THREE.Vector2(28, Wd / 2 - 0.2), new THREE.Vector2(30, Wd / 2 - 1.2)];
      var fo = new THREE.Mesh(new THREE.LatheGeometry(fp, 72), mFace); fo.rotation.z = sd > 0 ? -Math.PI / 2 : Math.PI / 2; piv.add(fo);
      var fi = new THREE.Mesh(new THREE.CylinderGeometry(29, 29, Wd - 2, 48), mRubber); fi.rotation.z = Math.PI / 2; piv.add(fi);
      var ring = new THREE.Mesh(new THREE.TorusGeometry(27.8, 0.35, 6, 72), mGap); ring.rotation.y = Math.PI / 2; ring.position.x = sd * (Wd / 2 - 0.15); piv.add(ring);
      [-1, 1].forEach(function (q) { var tk = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.9, 5), new THREE.MeshBasicMaterial({ color: 0x8c8784 })); tk.position.set(sd * (Wd / 2 + 0.7), 0, q * 21); piv.add(tk); });
      var hub = new THREE.Mesh(new THREE.CylinderGeometry(4, 4, 0.6, 24), mDark); hub.rotation.z = Math.PI / 2; hub.position.x = sd * (Wd / 2 + 0.95); piv.add(hub);
      var axle = new THREE.Mesh(new THREE.CylinderGeometry(3, 3, 4, 12), mDark); axle.rotation.z = Math.PI / 2; axle.position.x = -sd * 7; piv.add(axle);
    });
    // neck: black turntable in a dark collar
    function lathe(pts, m) { return new THREE.Mesh(new THREE.LatheGeometry(pts.map(function (p) { return new THREE.Vector2(p[0], p[1]); }), 72), m); }
    GR.mid.add(lathe([[0, 79.9], [39, 79.9], [39, 80.4], [0, 80.4]], mGap));
    GR.mid.add(lathe([[0, 80], [36.5, 80], [37, 80.5], [37, 86.6], [36.4, 87.2], [0, 87.2]], mDark));
    GR.mid.add(lathe([[0, 87], [35.2, 87], [35.2, 89.4], [34.6, 90], [0, 90]], mDark));
    // head: wide faceted box; big chamfers on the edges that run front to back
    function pivot(grp) { var hp = new THREE.Group(); hp.name = 'hp'; hp.position.set(0, 90, 0); grp.add(hp); return hp; }
    var hpS = pivot(GR.shell), hpG = pivot(GR.glass), hpF = pivot(GR.face);
    var headG = cbox(-50, 50, 0, 82, -46, 46, function (a, b) { var ax = a[0] + b[0]; if (ax === 'xy') return 11; if (has(a, b, 'z+')) return 4; return 9; });
    var head = new THREE.Mesh(headG, mShell); hpS.add(head);
    var HY = 41, SW = 86, SH = 68;
    hpS.add(onFace(new THREE.Mesh(new THREE.ShapeGeometry(octS(SW + 2.6, SH + 2.6, 11.6)), mGap), 0, HY, 46.04));
    var vg = new THREE.ExtrudeGeometry(octS(SW, SH, 11), { depth: 0.5, bevelEnabled: true, bevelThickness: 0.45, bevelSize: 0.45, bevelSegments: 2 });
    var uv = vg.attributes.uv, vp = vg.attributes.position; for (var i = 0; i < uv.count; i++) uv.setXY(i, 0.5 + vp.getX(i) / (SH * 4 / 3), 0.5 + vp.getY(i) / SH);
    var vis = new THREE.Mesh(vg, [mVisor, mFace]); vis.position.set(0, HY, 46.1 + 0.45); hpG.add(vis);
    // side action button with its light line (robot's right side), mic slots on the left, vents at the back
    var btn = new THREE.Mesh(new THREE.ExtrudeGeometry(rrS(20, 20, 3.4), { depth: 1.4, bevelEnabled: true, bevelThickness: 0.6, bevelSize: 0.6, bevelSegments: 2 }), mDark);
    btn.rotation.y = -Math.PI / 2; btn.position.set(-50.6, 44, 4); hpF.add(btn);
    var led = new THREE.Mesh(new THREE.ShapeGeometry(rrS(9, 1.3, 0.65), 8), mGlow); led.rotation.y = -Math.PI / 2; led.position.set(-52.7, 40, 4); hpF.add(led);
    [0, 1, 2].forEach(function (q) { var s = new THREE.Mesh(new THREE.ShapeGeometry(rrS(1.4, 7, 0.7), 6), mGap); s.rotation.y = Math.PI / 2; s.position.set(50.04, 41, 32 + q * 3.4); hpF.add(s); });
    [0, 1, 2, 3, 4].forEach(function (q) { var s = new THREE.Mesh(new THREE.ShapeGeometry(rrS(38, 2.6, 1.3), 8), mGap); s.rotation.y = Math.PI; s.position.set(0, 51 - q * 5.2, -46.04); hpS.add(s); });
    root.position.y = -53; Object.keys(GR).forEach(function (k) { GR[k].scale.setScalar(0.6); });
    var HP = [hpS, hpG, hpF];
    function outside(g) {
      g.mid.visible = false; g.face.visible = false;
      ['base', 'shell'].forEach(function (k) { g[k].children.forEach(function (c, i) { if (i === 0) return; var keep = false; c.traverse(function (o) { if (o.isGroup && o !== c && o.children.length > 6) keep = true; }); c.visible = keep; }); });
    }
    var sc = document.createElement('canvas'); sc.width = sc.height = 128; var sx = sc.getContext('2d'), sgr = sx.createRadialGradient(64, 64, 4, 64, 64, 64);
    sgr.addColorStop(0, 'rgba(0,0,0,0.75)'); sgr.addColorStop(0.45, 'rgba(0,0,0,0.42)'); sgr.addColorStop(1, 'rgba(0,0,0,0)'); sx.fillStyle = sgr; sx.fillRect(0, 0, 128, 128);
    var shadow = new THREE.Mesh(new THREE.PlaneGeometry(190, 170), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sc), transparent: true, depthWrite: false, opacity: 0.9 }));
    shadow.rotation.x = -Math.PI / 2; shadow.renderOrder = 2; scene.add(shadow);
    var mirror = null, mirGR = null, mirWheels = [];
    if (opts.mirror !== false) {
      mirror = root.clone(true); mirror.traverse(function (o) { if (o.isMesh) { var fade = function (m0) { var m = m0.clone(); m.transparent = true; m.opacity = 0.22; m.depthWrite = false; m.side = THREE.DoubleSide; if (m.emissiveIntensity) m.emissiveIntensity *= 0.7; return m; }; o.material = Array.isArray(o.material) ? o.material.map(fade) : fade(o.material); o.renderOrder = -1; } });
      mirror.scale.y = -1; scene.add(mirror);
      mirGR = {}; ['base', 'mid', 'face', 'shell', 'glass'].forEach(function (k, i) { mirGR[k] = mirror.children[i]; });
      outside(mirGR);
      var wi = 0; mirror.traverse(function (o) { if (o.isGroup && o.parent && o.parent.parent && o.parent.parent.parent === mirror && o.children.length > 6 && wi < 2) { mirWheels.push(o); wi++; } });
    }

    // eyes: one face engine, many moods
    var look = { x: 0, y: 0, tx: 0, ty: 0 }, blink = 0, nextBlink = 2, MOOD = { m: 'calm', t: 0 };
    var EYEG = [[0, '#BCDAF0'], [0.25, '#E2ECF7'], [0.5, '#EEEAF7'], [0.75, '#E6DCF2'], [1, '#D3C3E5']];
    var COL = { calm: '#eee9ff', happy: '#eee9ff', love: '#ff7aa8', sleepy: '#6f86c9', surprised: '#eee9ff', angry: '#ff6a4a', sad: '#7ea2ff', wink: '#eee9ff', dizzy: '#c39bff', scared: '#eee9ff', listen: '#eee9ff', proud: '#ffd36b', excited: '#ffd36b', amazed: '#ffd36b', laughing: '#eee9ff', curious: '#eee9ff', cheeky: '#eee9ff', tired: '#6f86c9', bored: '#7a86a8', focused: '#eee9ff', sick: '#8fe39a', overheated: '#ff5a4a', embarrassed: '#ff9ab8', grateful: '#eee9ff', heartbroken: '#ff7aa8', oops: '#eee9ff', scanning: '#eee9ff', attention: '#eee9ff', celebration: '#ffd36b', thinking: '#eee9ff', processing: '#eee9ff', loading: '#eee9ff', charging: '#7dff9a', lowbattery: '#ff5a4a', connected: '#7dff9a' };
    /* gestures: hands drawn on the face screen, plus a mouth when it talks */
    var G = null, TALK = 0, FX = [], lastT = 0, DT = 1 / 60, HA = 1;
    var GD = { victory: 2, fistpump: 2, hug: 2.4, dthumbs: 2, wave: 2.2, clap: 1.8, peek: 2.6, facepalm: 2.2, thumbs: 1.8, heart: 2.4, shrug: 1.8, think: 2.4, rub: 2.2, pointL: 1.8, pointR: 1.8, cheer: 2, yawn: 2.2, cover: 2, laugh: 2, dance: 2.4 };
    function ease(p) { var e = Math.min(1, p / 0.16, (1 - p) / 0.16); e = Math.max(0, e); return e * e * (3 - 2 * e); }
    function rrp(x, y, w, h, r) { r = Math.min(r, h / 2, w / 2); eg.moveTo(x + r, y); eg.arcTo(x + w, y, x + w, y + h, r); eg.arcTo(x + w, y + h, x, y + h, r); eg.arcTo(x, y + h, x, y, r); eg.arcTo(x, y, x + w, y, r); eg.closePath(); }
    function cap(x1, y1, x2, y2, w) { eg.lineWidth = w; eg.beginPath(); eg.moveTo(x1, y1); eg.lineTo(x2, y2); eg.stroke(); }
    function seam(pts) { eg.beginPath(); for (var i = 0; i < pts.length; i += 4) { eg.moveTo(pts[i], pts[i + 1]); eg.lineTo(pts[i + 2], pts[i + 3]); } eg.stroke(); }
    // solid glowing hands, origin at the wrist, fingers pointing up
    function hand(x, y, rot, pose, flip, col) {
      eg.save(); eg.translate(x, y); eg.rotate(rot); eg.scale(flip ? -1 : 1, 1);
      eg.fillStyle = col; eg.strokeStyle = col; eg.lineCap = 'round'; eg.lineJoin = 'round'; eg.shadowColor = col; eg.shadowBlur = 14;
      if (pose === 'open') {
        eg.beginPath(); rrp(-14, -30, 28, 30, 9); eg.fill();
        cap(-10.5, -26, -11.5, -45, 6.2); cap(-3.5, -26, -3.8, -50, 6.2); cap(3.5, -26, 3.8, -49, 6.2); cap(10.5, -26, 11.5, -43, 6.2); cap(12, -10, 24, -24, 7);
        eg.shadowBlur = 0; eg.strokeStyle = '#000'; eg.lineWidth = 1.6; seam([-7, -50, -7, -31, 0, -52, 0, -31, 7, -50, 7, -31]);
      } else if (pose === 'thumb') {
        eg.beginPath(); rrp(-14, -28, 30, 28, 9); eg.fill(); cap(-8, -24, -11, -50, 9);
        eg.shadowBlur = 0; eg.strokeStyle = '#000'; eg.lineWidth = 2; seam([-2, -26, -2, -6, 0, -20, 15, -20, 0, -13, 15, -13, 0, -6, 15, -6]);
      } else if (pose === 'point') {
        eg.beginPath(); rrp(-14, -26, 26, 26, 8); eg.fill(); cap(6, -20, 32, -20, 7); cap(-6, -24, 4, -27, 6);
        eg.shadowBlur = 0; eg.strokeStyle = '#000'; eg.lineWidth = 2; seam([-10, -15, 10, -15, -10, -8, 10, -8, 6, -24, 6, -16]);
      } else if (pose === 'peace') {
        eg.beginPath(); rrp(-12, -24, 24, 24, 8); eg.fill(); cap(-5, -22, -12, -50, 6.5); cap(5, -22, 12, -50, 6.5);
        eg.shadowBlur = 0; eg.strokeStyle = '#000'; eg.lineWidth = 2; seam([-10, -12, 6, -14, 0, -22, 0, -15]);
      } else {
        eg.beginPath(); rrp(-15, -28, 30, 28, 10); eg.fill();
        eg.shadowBlur = 0; eg.strokeStyle = '#000'; eg.lineWidth = 2; seam([-12, -20, 12, -20, -12, -12, 12, -12, -12, -12, 4, -6, -4, -28, -4, -20, 4, -28, 4, -20]);
      }
      eg.restore();
    }
    function gest(W, H, t, ex) {
      if (!G) return null; G.t += DT; var p = G.t / G.d; if (p >= 1) { G = null; return null; }
      var e = ease(p), off = (1 - e) * 36; HA = e; var L = [], o = { ox: 0, oy: 0, mouth: null, hide: [] }, n = G.n, ty;
      if (n === 'wave') { L.push([W * 0.8, H * 0.9 + off, Math.sin(G.t * 11) * 0.45, 'open', 0]); o.mouth = 'smile'; }
      if (n === 'clap') { var c = Math.abs(Math.sin(G.t * 9)); L.push([W / 2 - 24 - c * 40, H * 0.97 + off, 0.5, 'open', 1]); L.push([W / 2 + 24 + c * 40, H * 0.97 + off, -0.5, 'open', 0]); o.mouth = 'open'; }
      if (n === 'peek') { var sp = p > 0.5 ? Math.min(1, (p - 0.5) * 5) * 46 : 0; L.push([ex[0] - sp, H * 0.62 + off, 0, 'open', 1]); L.push([ex[1] + sp, H * 0.62 + off, 0, 'open', 0]); if (sp < 30) o.hide = [0, 1]; o.mouth = 'smile'; }
      if (n === 'facepalm') { L.push([ex[1] + 4, H * 0.66 + off + Math.sin(G.t * 3) * 3, -0.25, 'open', 0]); o.hide = [1]; o.mouth = 'flat'; }
      if (n === 'thumbs') { L.push([W * 0.8, H * 0.95 + off - Math.abs(Math.sin(G.t * 6)) * 8, -0.1, 'thumb', 1]); o.mouth = 'smile'; }
      if (n === 'heart') { L.push([W * 0.2, H * 0.92 + off, 0.35, 'open', 1]); L.push([W * 0.8, H * 0.92 + off, -0.35, 'open', 0]); o.mouth = 'small'; if (Math.random() < DT * 5) FX.push({ k: 'h', x: W / 2 + (Math.random() - 0.5) * 120, y: H * 0.95, v: 0 }); }
      if (n === 'shrug') { ty = Math.abs(Math.sin(G.t * 4)) * 10; L.push([W * 0.17, H * 0.86 + off - ty, 0.9, 'open', 1]); L.push([W * 0.83, H * 0.86 + off - ty, -0.9, 'open', 0]); o.mouth = 'flat'; o.oy = -0.3; }
      if (n === 'think') { L.push([W / 2 + 44, H * 0.97 + off + Math.abs(Math.sin(G.t * 5)) * 4, -0.2, 'fist', 0]); o.ox = -0.6; o.oy = -0.6; o.mouth = 'side'; }
      if (n === 'rub') { L.push([ex[0] + Math.sin(G.t * 12) * 8, H * 0.6 + off + Math.cos(G.t * 12) * 5, 0.2, 'fist', 1]); L.push([ex[1] - Math.sin(G.t * 12) * 8, H * 0.6 + off - Math.cos(G.t * 12) * 5, -0.2, 'fist', 0]); o.hide = [0, 1]; }
      if (n === 'pointL' || n === 'pointR') { var d = n === 'pointR' ? 1 : -1, j = Math.sin(G.t * 10) * 4; L.push([W / 2 + d * 92 + d * j, H * 0.9 + off, 0, 'point', d < 0]); o.ox = d; o.mouth = 'o'; }
      if (n === 'cheer') { ty = Math.sin(G.t * 12) * 6; L.push([W * 0.15, H * 0.5 + off + ty, -0.35, 'open', 1]); L.push([W * 0.85, H * 0.5 + off - ty, 0.35, 'open', 0]); o.mouth = 'open'; o.oy = -0.2; }
      if (n === 'dance') { var dd = Math.sin(G.t * 8); L.push([W * 0.18 + dd * 8, H * 0.62 + off + dd * 16, -0.4 + dd * 0.3, 'open', 1]); L.push([W * 0.82 + dd * 8, H * 0.8 + off - dd * 16, 0.4 + dd * 0.3, 'open', 0]); o.ox = dd * 0.5; o.mouth = 'open'; }
      if (n === 'yawn') { L.push([W / 2 + 6, H * 0.97 + off, 0.1, 'open', 0]); o.mouth = 'yawn'; }
      if (n === 'cover') { ty = Math.sin(G.t * 40) * 2; L.push([W / 2 - 40 + ty, H * 0.97 + off, 0.25, 'open', 1]); L.push([W / 2 + 40 + ty, H * 0.97 + off, -0.25, 'open', 0]); }
      if (n === 'laugh') { ty = Math.abs(Math.sin(G.t * 14)) * 7; L.push([W / 2 - 70, H * 0.97 + off - ty, 0.3, 'fist', 1]); L.push([W / 2 + 70, H * 0.97 + off - ty, -0.3, 'fist', 0]); o.mouth = 'laugh'; o.oy = -ty / 30; }
      if (n === 'victory') { L.push([W * 0.8, H * 0.92 + off, Math.sin(G.t * 6) * 0.15, 'peace', 0]); o.mouth = 'smile'; }
      if (n === 'fistpump') { ty = Math.abs(Math.sin(G.t * 9)) * 22; L.push([W * 0.82, H * 0.9 + off - ty, -0.15, 'fist', 0]); o.mouth = 'open'; }
      if (n === 'hug') { var hx = 92 - Math.min(1, p * 3) * 26; L.push([W / 2 - hx, H * 0.95 + off, 0.75, 'open', 0]); L.push([W / 2 + hx, H * 0.95 + off, -0.75, 'open', 1]); o.mouth = 'small'; if (Math.random() < DT * 4) FX.push({ k: 'h', x: W / 2 + (Math.random() - 0.5) * 60, y: H * 0.8, v: 0 }); }
      if (n === 'dthumbs') { ty = Math.abs(Math.sin(G.t * 6)) * 8; L.push([W * 0.18, H * 0.95 + off - ty, 0.1, 'thumb', 1]); L.push([W * 0.82, H * 0.95 + off - ty, -0.1, 'thumb', 0]); o.mouth = 'smile'; }
      o.hands = L; return o;
    }
    function mouth(kind, x, y, t, col) {
      eg.save(); eg.lineWidth = 8; eg.strokeStyle = col; eg.fillStyle = col; eg.beginPath();
      if (kind === 'talk') { var h = 4 + Math.abs(Math.sin(t * 17) * Math.sin(t * 6.3 + 1)) * 16; eg.ellipse(x, y, 15, h / 2 + 2, 0, 0, 6.283); eg.fill(); }
      else if (kind === 'smile') { eg.arc(x, y - 12, 18, 0.25 * Math.PI, 0.75 * Math.PI); eg.stroke(); }
      else if (kind === 'tongue') { eg.arc(x, y - 12, 18, 0.25 * Math.PI, 0.75 * Math.PI); eg.stroke(); eg.beginPath(); eg.fillStyle = '#ff7aa8'; eg.arc(x + 6, y + 6, 7, 0, Math.PI); eg.fill(); }
      else if (kind === 'small') { eg.arc(x, y - 6, 9, 0.2 * Math.PI, 0.8 * Math.PI); eg.stroke(); }
      else if (kind === 'side') { eg.moveTo(x - 4, y + 2); eg.quadraticCurveTo(x + 8, y + 6, x + 18, y - 4); eg.stroke(); }
      else if (kind === 'frown') { eg.arc(x, y + 14, 16, 1.25 * Math.PI, 1.75 * Math.PI); eg.stroke(); }
      else if (kind === 'flat') { eg.moveTo(x - 14, y); eg.lineTo(x + 14, y); eg.stroke(); }
      else if (kind === 'o') { eg.lineWidth = 6; eg.ellipse(x, y, 8, 10, 0, 0, 6.283); eg.stroke(); }
      else if (kind === 'open' || kind === 'laugh') { eg.moveTo(x - 20, y - 6); eg.quadraticCurveTo(x, y - 8, x + 20, y - 6); eg.quadraticCurveTo(x, y + 26 + (kind === 'laugh' ? Math.sin(t * 28) * 4 : 0), x - 20, y - 6); eg.fill(); }
      else if (kind === 'yawn') { var k = 0.7 + 0.3 * Math.sin(t * 3); eg.ellipse(x, y + 2, 13 * k, 17 * k, 0, 0, 6.283); eg.fill(); }
      else if (kind === 'wavy') { eg.lineWidth = 6; for (var i = 0; i <= 24; i++) { var xx = x - 18 + i * 1.5; eg[i ? 'lineTo' : 'moveTo'](xx, y + Math.sin(i * 0.8 + t * 10) * 3.5); } eg.stroke(); }
      eg.restore();
    }
    var MOUTH = { happy: 'smile', proud: 'side', wink: 'side', love: 'small', surprised: 'o', sad: 'frown', angry: 'flat', scared: 'wavy', dizzy: 'wavy', laughing: 'laugh', excited: 'open', amazed: 'o', curious: 'side', cheeky: 'tongue', tired: 'flat', bored: 'flat', sick: 'wavy', overheated: 'flat', embarrassed: 'small', grateful: 'smile', heartbroken: 'frown', oops: 'wavy', celebration: 'open', thinking: 'side' };
    function drawEyes(t) {
      var W = 320, H = 240, m = MOOD.m, col = COL[m] || COL.calm; DT = Math.min(0.05, Math.max(0, t - lastT)) || 1 / 60; lastT = t; MOOD.t += DT; if (TALK > 0) TALK -= DT; HA = 1;
      eg.fillStyle = '#000'; eg.fillRect(0, 0, W, H);
      look.x += (look.tx - look.x) * 0.08; look.y += (look.ty - look.y) * 0.08;
      var ex = [W / 2 - 58 + look.x * 24, W / 2 + 58 + look.x * 24], gs = gest(W, H, t, ex) || { ox: 0, oy: 0, hide: [], hands: [] };
      var gx = gs.ox * 22, gy = gs.oy * 16;
      var b = (blink > 0 && m !== 'sleepy' && m !== 'happy') ? Math.abs(Math.cos(blink * Math.PI)) : 1;
      eg.save(); eg.shadowColor = col; eg.shadowBlur = 16; eg.fillStyle = col; eg.strokeStyle = col; eg.lineCap = 'round'; eg.lineJoin = 'round';
      var ICON = { processing: 1, loading: 1, charging: 1, lowbattery: 1, connected: 1 };
      if (ICON[m]) { icon(m, W, H, t, col); }
      var GRAD = col === COL.calm;
      [-1, 1].forEach(function (s, si) {
        if (ICON[m] || gs.hide.indexOf(si) >= 0) return;
        var cx = W / 2 + s * 58 + look.x * 24 + gx, cy = H * 0.46 + look.y * 16 + gy, ew = 52, eh = 52 * b;
        if (GRAD) { var gq = eg.createLinearGradient(cx + s * 34, cy - 36, cx - s * 34, cy + 36); EYEG.forEach(function (st) { gq.addColorStop(st[0], st[1]); }); eg.fillStyle = gq; eg.strokeStyle = gq; eg.shadowColor = 'rgba(205,195,250,.8)'; }
        if (m === 'scared') { cx += Math.sin(t * 60) * 2; ew = 40; eh = 44 * b; }
        if (m === 'excited' || m === 'amazed') { var ks = 1 + 0.1 * Math.sin(t * (m === 'amazed' ? 6 : 10)); star(cx, cy, 36 * ks, 12 * ks, m === 'amazed' ? t : 0); eg.fill(); return; }
        if (m === 'laughing' || (m === 'cheeky' && s < 0)) { eg.lineWidth = 14; eg.beginPath(); eg.moveTo(cx + s * 16, cy - 20); eg.lineTo(cx - s * 16, cy); eg.lineTo(cx + s * 16, cy + 20); eg.stroke(); return; }
        if (m === 'cheeky' || m === 'grateful' || m === 'embarrassed' || m === 'celebration') { eg.lineWidth = 18; eg.beginPath(); eg.arc(cx, cy + 14, 26, Math.PI * 1.1, Math.PI * 1.9); eg.stroke(); return; }
        if (m === 'bored') { eg.lineWidth = 12; cap(cx - 22, cy + 6, cx + 22, cy + 6, 12); return; }
        if (m === 'tired' || m === 'sick') { eg.save(); rr(cx - 24, cy - 4, 48, 34, 16); eg.fill(); eg.fillStyle = '#000'; eg.shadowBlur = 0; eg.fillRect(cx - 30, cy - 6, 60, 12 + (m === 'sick' ? Math.sin(t * 3 + s) * 3 : 0)); eg.restore(); return; }
        if (m === 'heartbroken') { eg.save(); eg.translate(cx, cy); heart(0, 0, 32); eg.fill(); eg.strokeStyle = '#000'; eg.shadowBlur = 0; eg.lineWidth = 5; eg.beginPath(); eg.moveTo(0, -12); eg.lineTo(-7, 0); eg.lineTo(5, 8); eg.lineTo(-2, 22); eg.stroke(); eg.restore(); return; }
        if (m === 'scanning') { eg.lineWidth = 9; eg.beginPath(); eg.arc(cx, cy, 30, t * 4 * s, t * 4 * s + 1.6); eg.stroke(); eg.beginPath(); eg.arc(cx, cy, 30, t * 4 * s + 3.14, t * 4 * s + 4.7); eg.stroke(); return; }
        if (m === 'curious') { if (s > 0) { ew = 68; eh = 70 * b; } else { ew = 50; eh = 52 * b; } }
        if (m === 'oops') { ew = 50; eh = 52 * b; }
        if (m === 'focused' || m === 'overheated' || m === 'thinking') { eh = (m === 'thinking' ? 36 : 42) * b; cy += m === 'thinking' ? 14 : 8; }
        if (m === 'happy' || (m === 'wink' && s > 0) || m === 'proud') { eg.lineWidth = 18; eg.beginPath(); eg.arc(cx, cy + 14, 26, Math.PI * 1.1, Math.PI * 1.9); eg.stroke(); return; }
        if (m === 'love') { var k = 1 + 0.08 * Math.sin(t * 8); eg.save(); eg.translate(cx, cy); eg.scale(k, k); heart(0, 0, 32); eg.fill(); eg.restore(); return; }
        if (m === 'sleepy') { eg.lineWidth = 14; eg.beginPath(); eg.moveTo(cx - 24, cy + 10); eg.quadraticCurveTo(cx, cy + 22, cx + 24, cy + 10); eg.stroke(); return; }
        if (m === 'surprised') { eg.beginPath(); eg.arc(cx, cy, 34 * Math.max(0.2, b), 0, 6.283); eg.fill(); return; }
        if (m === 'dizzy') { eg.lineWidth = 8; eg.beginPath(); for (var i = 0; i < 60; i++) { var a = i / 60 * 12 + t * 6 * s, r = i / 60 * 30; eg[i ? 'lineTo' : 'moveTo'](cx + Math.cos(a) * r, cy + Math.sin(a) * r); } eg.stroke(); return; }
        rr(cx - ew / 2, cy - eh / 2, ew, Math.max(4, eh), Math.min(9, eh / 2)); eg.fill();
        if (m === 'focused' || m === 'overheated') { eg.save(); eg.shadowBlur = 0; eg.fillStyle = '#000'; eg.beginPath(); var dr = s * 0.6; eg.moveTo(cx - 40, cy - 52 + dr * 20); eg.lineTo(cx + 40, cy - 52 - dr * 20); eg.lineTo(cx + 40, cy - 22 - dr * 20); eg.lineTo(cx - 40, cy - 22 + dr * 20); eg.fill(); eg.restore(); }
        if (m === 'thinking') { eg.save(); eg.shadowBlur = 0; eg.fillStyle = '#000'; eg.fillRect(cx - 30, cy - 50, 60, 42); eg.restore(); }
        if (m === 'angry' || m === 'sad') { eg.save(); eg.shadowBlur = 0; eg.fillStyle = '#000'; eg.beginPath(); var dir = (m === 'angry' ? 1 : -1) * s; eg.moveTo(cx - 40, cy - 66 + dir * 24); eg.lineTo(cx + 40, cy - 66 - dir * 24); eg.lineTo(cx + 40, cy - 28 - dir * 24); eg.lineTo(cx - 40, cy - 28 + dir * 24); eg.fill(); eg.restore(); }
      });
      eg.fillStyle = col; eg.strokeStyle = col; eg.shadowColor = col;
      // little extras that make it feel alive
      var mx = W / 2 + look.x * 18 + gx * 0.6, my = H * 0.8 + look.y * 6;
      if (m === 'love' || (G && G.n === 'peek')) { eg.save(); eg.shadowBlur = 20; eg.shadowColor = '#ff7aa8'; eg.fillStyle = 'rgba(255,122,168,.38)'; [-1, 1].forEach(function (s) { eg.beginPath(); eg.ellipse(W / 2 + s * 104 + look.x * 24, H * 0.68, 22, 11, 0, 0, 6.283); eg.fill(); }); eg.restore(); }
      if (m === 'sad' && MOOD.t % 2.2 < 1.4) { var tp = (MOOD.t % 2.2) / 1.4; eg.save(); eg.globalAlpha = 1 - tp; eg.beginPath(); var tx = ex[0] + gx - 10, tyy = H * 0.58 + tp * 60; eg.moveTo(tx, tyy - 12); eg.quadraticCurveTo(tx + 9, tyy + 2, tx, tyy + 6); eg.quadraticCurveTo(tx - 9, tyy + 2, tx, tyy - 12); eg.fill(); eg.restore(); }
      if (m === 'scared' || m === 'surprised') { eg.save(); eg.globalAlpha = 0.85; var sy = H * 0.12 + (MOOD.t * 22) % 30; eg.beginPath(); eg.moveTo(W * 0.86, sy - 12); eg.quadraticCurveTo(W * 0.86 + 9, sy + 2, W * 0.86, sy + 6); eg.quadraticCurveTo(W * 0.86 - 9, sy + 2, W * 0.86, sy - 12); eg.fill(); eg.restore(); }
      if (m === 'proud') { eg.save(); eg.lineWidth = 4; [[W * 0.12, H * 0.2, 0], [W * 0.88, H * 0.26, 1.7], [W * 0.82, H * 0.08, 3.1]].forEach(function (q) { var k = 6 + 5 * Math.abs(Math.sin(t * 3 + q[2])); eg.beginPath(); eg.moveTo(q[0] - k, q[1]); eg.lineTo(q[0] + k, q[1]); eg.moveTo(q[0], q[1] - k); eg.lineTo(q[0], q[1] + k); eg.stroke(); }); eg.restore(); }
      if (m === 'angry') { eg.save(); eg.lineWidth = 5; var a2 = Math.sin(t * 10) * 0.1; eg.translate(W * 0.88, H * 0.12); eg.rotate(a2); [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(function (q) { eg.beginPath(); eg.moveTo(q[0] * 4, q[1] * 12); eg.quadraticCurveTo(q[0] * 4, q[1] * 4, q[0] * 12, q[1] * 4); eg.stroke(); }); eg.restore(); }
      if (m === 'embarrassed' || m === 'grateful') { eg.save(); eg.shadowColor = '#ff7aa8'; eg.strokeStyle = '#ff7aa8'; eg.lineWidth = 4; [-1, 1].forEach(function (s) { var bx = W / 2 + s * 100 + look.x * 24, by = H * 0.66; for (var q = -1; q <= 1; q++) cap(bx + q * 10 - 4, by + 7, bx + q * 10 + 4, by - 7, 4); }); eg.restore(); }
      if (m === 'curious' || m === 'oops' || m === 'attention') { eg.save(); eg.font = '800 38px sans-serif'; eg.fillText(m === 'curious' ? '?' : '!', W * 0.8, H * 0.24 + Math.sin(t * 4) * 3); eg.restore(); }
      if (m === 'oops') { eg.save(); var oy = H * 0.2; eg.beginPath(); eg.moveTo(W * 0.72, oy - 14); eg.quadraticCurveTo(W * 0.72 + 11, oy + 3, W * 0.72, oy + 8); eg.quadraticCurveTo(W * 0.72 - 11, oy + 3, W * 0.72, oy - 14); eg.fill(); eg.restore(); }
      if (m === 'amazed' || m === 'attention') { eg.save(); eg.lineWidth = 4; [-1, 1].forEach(function (s) { var rx = W / 2 + s * 112; for (var q = -1; q <= 1; q++) { var a3 = q * 0.5, r1 = 10 + 3 * Math.sin(t * 8); cap(rx + s * Math.cos(a3) * r1, H * 0.42 + Math.sin(a3) * r1, rx + s * Math.cos(a3) * (r1 + 12), H * 0.42 + Math.sin(a3) * (r1 + 12), 4); } }); eg.restore(); }
      if (m === 'overheated') { eg.save(); eg.lineWidth = 4; eg.globalAlpha = 0.8; for (var q = -1; q <= 1; q++) { eg.beginPath(); for (var i2 = 0; i2 <= 10; i2++) { var sx = W / 2 + q * 30 + Math.sin(i2 * 0.9 + t * 8) * 4, sy = H * 0.14 - i2 * 2 + 10; eg[i2 ? 'lineTo' : 'moveTo'](sx, sy); } eg.stroke(); } eg.restore(); }
      if (m === 'sick') { eg.save(); eg.globalAlpha = 0.85; var wy = H * 0.18; eg.beginPath(); eg.moveTo(W * 0.84, wy - 12); eg.quadraticCurveTo(W * 0.84 + 9, wy + 2, W * 0.84, wy + 6); eg.quadraticCurveTo(W * 0.84 - 9, wy + 2, W * 0.84, wy - 12); eg.fill(); eg.restore(); }
      if (m === 'heartbroken' && Math.random() < DT * 2) FX.push({ k: 't', x: ex[0] + 10, y: H * 0.6, v: 0 });
      if (m === 'celebration' && Math.random() < DT * 14) FX.push({ k: 'c', x: 12 + Math.random() * (W - 24), y: 10, v: 0, c: ['#ffd36b', '#ff7aa8', '#8fe8ff', '#7dff9a'][Math.floor(Math.random() * 4)], r: Math.random() * 6 });
      if (m === 'listen') { eg.save(); [-1, 1].forEach(function (s) { for (var q = 0; q < 3; q++) { var hh = 8 + Math.abs(Math.sin(t * 9 + q * 1.3 + s)) * 26, bx = W / 2 + s * (100 + q * 12); cap(bx, H * 0.42 - hh / 2, bx, H * 0.42 + hh / 2, 5); } }); eg.restore(); }
      FX = FX.filter(function (f) {
        if (f.k === 'c') { f.y += 90 * DT; f.v += DT; f.r += DT * 6; if (f.y > H - 8) return false; eg.save(); eg.fillStyle = f.c; eg.shadowColor = f.c; eg.translate(f.x, f.y); eg.rotate(f.r); eg.fillRect(-4, -2, 8, 4); eg.restore(); return true; }
        if (f.k === 't') { f.y += 50 * DT; f.v += DT; if (f.v > 1.2) return false; eg.save(); eg.globalAlpha = 1 - f.v / 1.2; eg.beginPath(); eg.moveTo(f.x, f.y - 10); eg.quadraticCurveTo(f.x + 8, f.y + 2, f.x, f.y + 6); eg.quadraticCurveTo(f.x - 8, f.y + 2, f.x, f.y - 10); eg.fill(); eg.restore(); return true; } f.y -= 84 * DT; f.v += DT; if (f.v > 1.6) return false; eg.save(); eg.globalAlpha = 1 - f.v / 1.6; eg.fillStyle = '#ff7aa8'; eg.shadowColor = '#ff7aa8'; heart(f.x + Math.sin(f.v * 6) * 6, f.y, 10); eg.fill(); eg.restore(); return true; });
      var mk = TALK > 0 ? 'talk' : (gs.mouth || MOUTH[m]); if (mk && !(G && G.n === 'yawn' && false)) mouth(mk, mx, my, t, col);
      eg.save(); eg.globalAlpha = HA; gs.hands.forEach(function (h) { hand(h[0], h[1], h[2], h[3], h[4], col); }); eg.restore();
      if (m === 'sleepy') { eg.shadowBlur = 12; eg.font = '700 28px sans-serif'; var z = (t * 0.6) % 1; eg.globalAlpha = 1 - z; eg.fillText('z', W * 0.78 + z * 20, H * 0.3 - z * 40); eg.globalAlpha = 1; }
      eg.restore();
      // keep the edges black: the screen texture stretches its border pixels
      eg.fillStyle = '#000'; eg.fillRect(0, 0, W, 4); eg.fillRect(0, H - 4, W, 4); eg.fillRect(0, 0, 4, H); eg.fillRect(W - 4, 0, 4, H);
      eyeTex.needsUpdate = true;
    }
    function star(x, y, R, r, rot) { eg.beginPath(); for (var i = 0; i < 8; i++) { var a = rot + i * Math.PI / 4 - Math.PI / 2, rad = i % 2 ? r : R; eg[i ? 'lineTo' : 'moveTo'](x + Math.cos(a) * rad, y + Math.sin(a) * rad); } eg.closePath(); }
    function icon(m, W, H, t, col) {
      var x = W / 2, y = H * 0.46; eg.save(); eg.lineWidth = 9;
      if (m === 'processing') { for (var i = 0; i < 3; i++) { eg.beginPath(); eg.arc(x + (i - 1) * 34, y + Math.min(0, Math.sin(t * 6 - i * 0.8)) * 14, 9, 0, 6.283); eg.fill(); } }
      if (m === 'loading') { eg.beginPath(); eg.arc(x, y, 40, t * 5, t * 5 + 4.4); eg.stroke(); }
      if (m === 'connected') { eg.beginPath(); eg.arc(x, y, 42, 0, 6.283); eg.stroke(); eg.beginPath(); eg.moveTo(x - 18, y + 2); eg.lineTo(x - 4, y + 16); eg.lineTo(x + 20, y - 14); eg.stroke(); }
      if (m === 'charging' || m === 'lowbattery') {
        eg.lineWidth = 7; rr(x - 54, y - 28, 100, 56, 10); eg.stroke(); eg.fillRect(x + 48, y - 11, 9, 22);
        if (m === 'lowbattery') { eg.globalAlpha = 0.5 + 0.5 * Math.abs(Math.sin(t * 4)); eg.fillRect(x - 44, y - 18, 16, 36); }
        else { var lv = (t * 0.5) % 1; eg.globalAlpha = 0.35; eg.fillRect(x - 44, y - 18, 80 * lv, 36); eg.globalAlpha = 1; eg.beginPath(); eg.moveTo(x + 4, y - 22); eg.lineTo(x - 14, y + 4); eg.lineTo(x - 1, y + 4); eg.lineTo(x - 6, y + 22); eg.lineTo(x + 14, y - 4); eg.lineTo(x + 1, y - 4); eg.closePath(); eg.fill(); }
      }
      eg.restore();
    }
    function heart(x, y, s) { eg.beginPath(); eg.moveTo(x, y + s * 0.75); eg.bezierCurveTo(x - s * 1.3, y - s * 0.1, x - s * 0.6, y - s * 1.1, x, y - s * 0.35); eg.bezierCurveTo(x + s * 0.6, y - s * 1.1, x + s * 1.3, y - s * 0.1, x, y + s * 0.75); eg.closePath(); }
    function rr(x, y, w, h, r) { r = Math.min(r, h / 2, w / 2); eg.beginPath(); eg.moveTo(x + r, y); eg.arcTo(x + w, y, x + w, y + h, r); eg.arcTo(x + w, y + h, x, y + h, r); eg.arcTo(x, y + h, x, y, r); eg.arcTo(x, y, x + w, y, r); eg.closePath(); }

    var api0 = { setColor: function (n) { if (PAL[n]) { mShell.color.setHex(PAL[n]); mShell.color.convertSRGBToLinear(); } } };
    var api = { setColor: api0.setColor, setMood: function (m) { MOOD.m = m; MOOD.t = 0; }, gesture: function (n) { if (GD[n]) G = { n: n, t: 0, d: GD[n] }; }, talk: function (sec) { TALK = sec; }, gesturing: function () { return !!G; }, mood: function () { return MOOD.m; }, scene: scene, camera: camera, root: root, GR: GR, look: look, wheels: wheels, explode: 0, renderer: renderer, visible: true, t: 0 };
    function resize() {
      var w = canvas.clientWidth, h = canvas.clientHeight; if (!w || !h) return;
      renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
    }
    window.addEventListener('resize', resize); resize();
    var last = performance.now();
    function frame(now) {
      requestAnimationFrame(frame);
      if (!api.visible) { last = now; return; }
      var dt = Math.min(0.05, (now - last) / 1000); last = now; api.t += dt;
      nextBlink -= dt; if (nextBlink < 0) { blink += dt * 5; if (blink >= 1) { blink = 0; nextBlink = 2 + Math.random() * 3; } }
      var e = api.explode;
      GR.shell.position.y = 190 * e; GR.glass.position.set(0, 150 * e, 120 * e); GR.face.position.set(0, 108 * e, 64 * e); GR.mid.position.y = 54 * e;
      if (api.update) api.update(dt, api.t);
      var yawT = (api.headYaw != null ? api.headYaw : look.x * 0.45), pitT = (api.headTilt != null ? api.headTilt : -look.y * 0.22);
      HP.forEach(function (h) { h.rotation.y += (yawT - h.rotation.y) * 0.08; h.rotation.x += (pitT - h.rotation.x) * 0.08; });
      if (mirror) mirror.traverse(function (o) { if (o.name === 'hp') { o.rotation.y = HP[0].rotation.y; o.rotation.x = HP[0].rotation.x; } });
      var lift = Math.max(0, root.position.y + 53); shadow.position.set(root.position.x, -52.8, root.position.z); shadow.material.opacity = 0.9 * Math.max(0.15, 1 - lift / 70); shadow.scale.setScalar(1 + lift / 160);
      if (mirror) {
        mirror.position.set(root.position.x, -106 - root.position.y, root.position.z);
        mirror.rotation.set(-root.rotation.x, root.rotation.y, -root.rotation.z);
        Object.keys(GR).forEach(function (k) { mirGR[k].position.copy(GR[k].position); });
        mirWheels.forEach(function (w, i) { if (wheels[i]) w.rotation.x = wheels[i].rotation.x; });
      }
      drawEyes(api.t);
      renderer.render(scene, camera);
    }
    requestAnimationFrame(frame);
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { api.visible = es[0].isIntersecting; }, { rootMargin: '100px' }).observe(canvas);
    api.resize = resize;
    api.exportGLB = function (cb) {
      if (!THREE.GLTFExporter) return cb(null);
      var keep = { m: MOOD.m, b: blink, x: look.x, y: look.y }; MOOD.m = 'calm'; blink = 0; look.x = look.y = 0; drawEyes(api.t);
      var c = root.clone(true), g = {}; ['base', 'mid', 'face', 'shell', 'glass'].forEach(function (k, i) { g[k] = c.children[i]; g[k].position.set(0, 0, 0); });
      c.traverse(function (o) { if (o.isMesh && o.material && o.material.blending === THREE.AdditiveBlending) o.visible = false; }); c.position.set(0, 0, 0); c.rotation.set(0, 0, 0);
      var dead = []; c.traverse(function (o) { if (!o.visible) dead.push(o); }); dead.forEach(function (o) { if (o.parent) o.parent.remove(o); });
      var w = new THREE.Group(); c.scale.setScalar(0.0016); /* head 96 mm wide */ w.add(c); w.updateMatrixWorld(true);
      var bb = new THREE.Box3().setFromObject(c); c.position.y = -bb.min.y;
      try {
        new THREE.GLTFExporter().parse(w, function (r) { MOOD.m = keep.m; blink = keep.b; cb(new Blob([r], { type: 'model/gltf-binary' })); }, { binary: true });
      } catch (e) { MOOD.m = keep.m; cb(null); }
    };
    return api;
  }
  /* always-on small talk: Roam keeps watching you, asking things and telling bad jokes */
  var JOKES = [
    [['listen', 'Why did the robot go on holiday?', ['bi', 'oo', 'ki']], ['proud', 'It needed to recharge.', ['zip', 'nya']]],
    [['proud', 'I tried to eat a clock once.', ['oo', 'nya', 'bi']], ['wink', 'Very time consuming.', ['ki', 'tok', 'tok']]],
    [['listen', 'Guess my favourite music.', ['dwee', 'ki']], ['proud', 'Heavy metal. Obviously.', ['vrr', 'bi']]],
    [['listen', 'Why was the robot tired after the road trip?', ['bi', 'oo', 'dwee']], ['wink', 'It had a hard drive.', ['zip', 'ki']]],
    [['happy', 'I told my wheels a joke.', ['bi', 'nya']], ['proud', 'They are still rolling.', ['ki', 'bi', 'ki']]],
    [['love', 'I asked the desk lamp out.', ['mii', 'dwee']], ['sad', 'It turned me down. Then it turned off.', ['oo', 'doo']]],
    [['listen', 'Why did the CAD model break up with the sketch?', ['bi', 'oo', 'ki', 'nya']], ['wink', 'It felt too constrained.', ['zip', 'ki']]],
    [['listen', 'Why do robots never panic?', ['dwee', 'ki']], ['proud', 'Nerves of steel.', ['bi', 'tok']]],
    [['sleepy', 'My battery and I have a lot in common.', ['oo', 'wub']], ['sleepy', 'We both need a nap at four percent.', ['oo', 'doo']]],
    [['listen', 'Parallel lines have so much in common.', ['bi', 'oo']], ['sad', 'Shame they will never meet.', ['doo', 'oo']]],
    [['proud', 'I would tell you a UDP joke.', ['oo', 'ki', 'nya']], ['wink', 'But you might not get it.', ['zip', 'ki']]],
    [['listen', 'What do you call a robot that takes the long way?', ['bi', 'dwee', 'ki']], ['happy', 'R2 detour.', ['ki', 'bi']]]
  ];
  var LAUGH = [['laughing', 'Ha ha ha!', ['ki', 'bi', 'ki', 'bi'], 'laugh'], ['cheeky', 'Get it?', ['zip', 'ki'], 'thumbs'], ['proud', 'I am here all week.', ['bi', 'nya', 'bi'], 'victory'], ['excited', 'Heh. Good one, me.', ['ki', 'ki'], 'clap'], ['sad', 'Nobody laughed. Tough crowd.', ['oo', 'doo'], 'facepalm']];
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function joke() { var j = pick(JOKES); return [['thinking'].concat(j[0].slice(1, 3), ['think']), j[1].slice(0, 3).concat([pick(['shrug', 'pointR', 'thumbs'])]), pick(LAUGH)]; }
  function dur(L) { return 1500 + L[1].length * 48; }
  function chat(o) {
    var i = Math.floor(Math.random() * o.lines.length), seq = [], timer = 0, alive = 0, n = 0;
    function play(items) {
      clearTimeout(timer); seq = items.slice(); var id = ++alive;
      (function step() {
        if (id !== alive) return;
        var L = seq.shift(); if (!L) { o.api.setMood('calm'); schedule(); return; }
        o.say(L); if (o.api.talk) o.api.talk(0.5 + L[1].length * 0.045); if (L[3] && o.api.gesture) o.api.gesture(L[3]);
        timer = setTimeout(step, dur(L) + (seq.length ? 500 : 0));
      })();
    }
    function next() {
      if (!o.api.visible || document.hidden || (o.busy && o.busy())) return schedule();
      n++; play(o.jokes !== false && n % 2 === 0 ? joke() : [o.lines[i++ % o.lines.length]]);
    }
    function schedule(f) { clearTimeout(timer); timer = setTimeout(next, f || (o.gap || 3200) + Math.random() * 2400); }
    schedule(o.first || 1200);
    return { play: play, joke: function () { play(joke()); }, stop: function () { alive++; clearTimeout(timer); schedule(); }, talking: function () { return seq.length > 0; } };
  }
  function bubble(el) {
    var t = 0;
    return function (L) {
      el.querySelector('.rm').textContent = (L[2] || ['bi', 'dwee']).join('-');
      el.querySelector('.en').textContent = L[1]; el.classList.remove('on'); void el.offsetWidth; el.classList.add('on');
      clearTimeout(t); t = setTimeout(function () { el.classList.remove('on'); }, dur(L) + 300);
    };
  }
  return { create: create, chat: chat, bubble: bubble, joke: joke };
})();
