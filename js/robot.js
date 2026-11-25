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
      es.add(new THREE.Mesh(new THREE.BoxGeometry(2000, 1400, 2000), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.03, 0.03, 0.04), side: THREE.BackSide })));
      function panel(w, h, x, y, z, c, rx, ry) { var m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: c, side: THREE.DoubleSide })); m.position.set(x, y, z); m.rotation.set(rx || 0, ry || 0, 0); es.add(m); }
      panel(1000, 800, 0, 690, 100, new THREE.Color(9, 9, 9.5), Math.PI / 2, 0);
      panel(260, 1100, -990, 200, 260, new THREE.Color(7, 7, 7.4), 0, Math.PI / 2);
      panel(260, 1100, 990, 200, 260, new THREE.Color(5, 5, 5.4), 0, -Math.PI / 2);
      panel(500, 900, -700, 200, -900, new THREE.Color(0.8, 1.2, 6), 0, Math.PI / 4);
      panel(1400, 220, 0, 300, 990, new THREE.Color(2.2, 2.2, 2.4), 0, Math.PI);
      panel(2000, 2000, 0, -300, 0, new THREE.Color(0.02, 0.02, 0.03), -Math.PI / 2, 0);
      try { var pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromScene(es, 0.04).texture; pm.dispose(); } catch (e) {}
    })();
    scene.add(new THREE.HemisphereLight(0xdfe6ff, 0x05060a, 0.25));
    var key = new THREE.DirectionalLight(0xffffff, 1.5); key.position.set(-240, 520, 420); scene.add(key);
    var fill = new THREE.DirectionalLight(0xdfe6ff, 0.5); fill.position.set(320, 200, 300); scene.add(fill);
    var rim = new THREE.PointLight(0x4a68ff, 3.2, 900, 1.5); rim.position.set(120, 140, -220); scene.add(rim);
    var rim2 = new THREE.PointLight(0x6f86ff, 1.2, 700, 1.6); rim2.position.set(-200, 60, -160); scene.add(rim2);

    /* Roam v2: a rounded head on a turning, tilting neck, above a soft wheeled body (terracotta or sage) */
    var PAL = { terracotta: 0xC9764A, sage: 0xA8B596 };
    var mShell = new THREE.MeshPhysicalMaterial({ color: PAL.terracotta, roughness: 0.72, metalness: 0, clearcoat: 0.05, clearcoatRoughness: 0.6, envMapIntensity: 0.22 });
    var mTub = mShell; mShell.color.convertSRGBToLinear();
    var eye = document.createElement('canvas'); eye.width = 320; eye.height = 240; var eg = eye.getContext('2d'), eyeTex = new THREE.CanvasTexture(eye); eyeTex.encoding = THREE.sRGBEncoding;
    var mVisor = new THREE.MeshPhysicalMaterial({ color: 0x030304, roughness: 0.04, clearcoat: 1, clearcoatRoughness: 0.02, envMapIntensity: 1.2, emissive: 0xffffff, emissiveMap: eyeTex, emissiveIntensity: 1.4 });
    var mDark = new THREE.MeshPhysicalMaterial({ color: 0x0b0b0c, roughness: 0.6, clearcoat: 0, envMapIntensity: 0.12 });
    var mRubber = new THREE.MeshPhysicalMaterial({ color: 0x0c0c0d, roughness: 0.8, metalness: 0, envMapIntensity: 0.35 });
    var root = new THREE.Group(), GR = { base: new THREE.Group(), mid: new THREE.Group(), face: new THREE.Group(), shell: new THREE.Group(), glass: new THREE.Group() };
    Object.keys(GR).forEach(function (k) { root.add(GR[k]); }); scene.add(root);
    function rrS(w, h, r) { var sh = new THREE.Shape(), x = -w / 2, y = -h / 2; r = Math.min(r, w / 2, h / 2); sh.moveTo(x + r, y); sh.lineTo(x + w - r, y); sh.absarc(x + w - r, y + r, r, -Math.PI / 2, 0, false); sh.lineTo(x + w, y + h - r); sh.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2, false); sh.lineTo(x + r, y + h); sh.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI, false); sh.lineTo(x, y + r); sh.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5, false); return sh; }
    function rbox(w, h, d, r, inner) { var dd = Math.max(0.01, d - 2 * r); var g = new THREE.ExtrudeGeometry(rrS(w - 2 * r, h - 2 * r, inner || r * 0.6), { depth: dd, bevelEnabled: true, bevelThickness: r, bevelSize: r, bevelSegments: 14, curveSegments: 24 }); g.translate(0, 0, -dd / 2); smooth(g); return g; }
    function smooth(g) { var P = g.attributes.position, n = P.count, acc = {}, N = new Float32Array(n * 3), a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3(), f = new THREE.Vector3(); var key = function (i) { return Math.round(P.getX(i) * 50) + ',' + Math.round(P.getY(i) * 50) + ',' + Math.round(P.getZ(i) * 50); };
      for (var i = 0; i < n; i += 3) { a.fromBufferAttribute(P, i); b.fromBufferAttribute(P, i + 1); c.fromBufferAttribute(P, i + 2); f.subVectors(c, b).cross(a.clone().sub(b)); for (var j = 0; j < 3; j++) { var k = key(i + j); if (!acc[k]) acc[k] = new THREE.Vector3(); acc[k].add(f); } }
      for (i = 0; i < n; i++) { var v = acc[key(i)].clone().normalize(); N[i * 3] = v.x; N[i * 3 + 1] = v.y; N[i * 3 + 2] = v.z; } g.setAttribute('normal', new THREE.BufferAttribute(N, 3)); }
    function arc(cx, cy, r, a0, a1, n) { var o = []; for (var i = 0; i <= n; i++) { var a = a0 + (a1 - a0) * i / n; o.push(new THREE.Vector2(cx + r * Math.cos(a), cy + r * Math.sin(a))); } return o; }
    function tread(m, q) { var tg = new THREE.BoxGeometry(0.5, q.h * 0.7, 1); for (var i = 0; i < 64; i++) { var a = i / 64 * Math.PI * 2, b = new THREE.Mesh(tg, mRubber); b.position.set(Math.cos(a) * (q.r + 0.12), 0, Math.sin(a) * (q.r + 0.12)); b.rotation.y = -a; m.add(b); } }
    // body: soft rounded tub, slightly wider at the bottom
    var bodyG = rbox(80, 44, 66, 15); var bp = bodyG.attributes.position;
    for (var i = 0; i < bp.count; i++) { var yy = bp.getY(i), k = 1 + 0.06 * (-yy / 22); bp.setX(i, bp.getX(i) * k); bp.setZ(i, bp.getZ(i) * (1 + 0.04 * (-yy / 22))); }
    smooth(bodyG);
    var body = new THREE.Mesh(bodyG, mShell); body.position.y = 27; GR.base.add(body);
    var bar = new THREE.Mesh(new THREE.ExtrudeGeometry(rrS(15, 2.6, 1.3), { depth: 0.6, bevelEnabled: false }), new THREE.MeshBasicMaterial({ color: 0xffffff })); bar.position.set(0, 24, 35.4); GR.base.add(bar);
    var wheels = [];
    [-1, 1].forEach(function (sd) {
      var g = new THREE.Group(); g.position.set(sd * 40, 0, 10); GR.base.add(g);
      var piv = new THREE.Group(); piv.position.set(0, 19, 0); g.add(piv); wheels.push(piv);
      var q = { r: 19, h: 12 };
      var tp = arc(q.r - 3, -q.h / 2 + 3, 3, -Math.PI / 2, 0, 6).concat(arc(q.r - 3, q.h / 2 - 3, 3, 0, Math.PI / 2, 6)); tp.unshift(new THREE.Vector2(q.r - 5, -q.h / 2)); tp.push(new THREE.Vector2(q.r - 5, q.h / 2));
      var ty = new THREE.Mesh(new THREE.LatheGeometry(tp, 56), mRubber); ty.rotation.z = Math.PI / 2; tread(ty, q); piv.add(ty);
      var hub = new THREE.Mesh(new THREE.CylinderGeometry(q.r - 4.5, q.r - 4.5, q.h - 1, 48), mDark); hub.rotation.z = Math.PI / 2; piv.add(hub);
      var cap = new THREE.Mesh(new THREE.CylinderGeometry(q.r - 7, q.r - 7, 1, 48), new THREE.MeshPhysicalMaterial({ color: 0x1c1c1f, roughness: 0.3, clearcoat: 0.8, envMapIntensity: 0.8 })); cap.rotation.z = Math.PI / 2; cap.position.x = sd * (q.h / 2); piv.add(cap);
    });
    // neck: rotating base ring + tilt joint (dark graphite)
    var neck = new THREE.Mesh(new THREE.CylinderGeometry(15, 17, 7, 48), mDark); neck.position.y = 52.5; GR.mid.add(neck);
    var ringT = new THREE.Mesh(new THREE.CylinderGeometry(18, 18, 2, 48), mDark); ringT.position.y = 49.5; GR.mid.add(ringT);
    // head (shell, glass and face details share one pivot each so the head can turn and tilt as one)
    function pivot(grp) { var hp = new THREE.Group(); hp.name = 'hp'; hp.position.set(0, 56, 2); grp.add(hp); return hp; }
    var hpS = pivot(GR.shell), hpG = pivot(GR.glass), hpF = pivot(GR.face);
    var head = new THREE.Mesh(rbox(84, 66, 64, 17), mShell); head.position.set(0, 34, -2); hpS.add(head);
    var bez = new THREE.Mesh(new THREE.ExtrudeGeometry(rrS(70, 54, 13), { depth: 1.2, bevelEnabled: true, bevelThickness: 1.2, bevelSize: 1.2, bevelSegments: 4, curveSegments: 12 }), mDark); bez.position.set(0, 34, 29.2); hpS.add(bez);
    var vg = new THREE.ShapeGeometry(rrS(66, 50, 11), 16); var uv = vg.attributes.uv, vp = vg.attributes.position; for (i = 0; i < uv.count; i++) uv.setXY(i, vp.getX(i) / 66 + 0.5, vp.getY(i) / 50 + 0.5);
    var vis = new THREE.Mesh(vg, mVisor); vis.position.set(0, 34, 31.8); hpG.add(vis);
    var camd = new THREE.Mesh(new THREE.CircleGeometry(1.4, 24), new THREE.MeshPhysicalMaterial({ color: 0x1a1d24, roughness: 0.1, clearcoat: 1 })); camd.position.set(0, 55.5, 31.9); hpF.add(camd);
    var btn = new THREE.Mesh(rbox(4, 13, 11, 1.6), mDark); btn.position.set(-42.6, 40, -6); hpF.add(btn);
    root.position.y = -53; Object.keys(GR).forEach(function (k) { GR[k].scale.setScalar(0.8); });
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
      mirror = root.clone(true); mirror.traverse(function (o) { if (o.isMesh) { var m = o.material.clone(); m.transparent = true; m.opacity = 0.22; m.depthWrite = false; m.side = THREE.DoubleSide; if (m.emissiveIntensity) m.emissiveIntensity *= 0.7; o.material = m; o.renderOrder = -1; } });
      mirror.scale.y = -1; scene.add(mirror);
      mirGR = {}; ['base', 'mid', 'face', 'shell', 'glass'].forEach(function (k, i) { mirGR[k] = mirror.children[i]; });
      outside(mirGR);
      var wi = 0; mirror.traverse(function (o) { if (o.isGroup && o.parent && o.parent.parent && o.parent.parent.parent === mirror && o.children.length > 6 && wi < 2) { mirWheels.push(o); wi++; } });
    }

    // eyes: one face engine, many moods
    var look = { x: 0, y: 0, tx: 0, ty: 0 }, blink = 0, nextBlink = 2, MOOD = { m: 'calm', t: 0 };
    var COL = { calm: '#eee9ff', happy: '#eee9ff', love: '#ff7aa8', sleepy: '#6f86c9', surprised: '#a9c4ff', angry: '#ff6a4a', sad: '#7ea2ff', wink: '#eee9ff', dizzy: '#c39bff', scared: '#a9c4ff', listen: '#8fe8ff', proud: '#ffd36b', excited: '#ffd36b', amazed: '#ffd36b', laughing: '#eee9ff', curious: '#8fe8ff', cheeky: '#eee9ff', tired: '#6f86c9', bored: '#7a86a8', focused: '#8fe8ff', sick: '#8fe39a', overheated: '#ff5a4a', embarrassed: '#ff9ab8', grateful: '#eee9ff', heartbroken: '#ff7aa8', oops: '#a9c4ff', scanning: '#8fe8ff', attention: '#eee9ff', celebration: '#ffd36b', thinking: '#8fe8ff', processing: '#eee9ff', loading: '#eee9ff', charging: '#7dff9a', lowbattery: '#ff5a4a', connected: '#7dff9a' };
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
      [-1, 1].forEach(function (s, si) {
        if (ICON[m] || gs.hide.indexOf(si) >= 0) return;
        var cx = W / 2 + s * 58 + look.x * 24 + gx, cy = H * 0.46 + look.y * 16 + gy, ew = 60, eh = 62 * b;
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
        rr(cx - ew / 2, cy - eh / 2, ew, Math.max(4, eh), Math.min(12, eh / 2)); eg.fill();
        if (m === 'focused' || m === 'overheated') { eg.save(); eg.shadowBlur = 0; eg.fillStyle = '#000'; eg.beginPath(); var dr = s * 0.6; eg.moveTo(cx - 40, cy - 52 + dr * 20); eg.lineTo(cx + 40, cy - 52 - dr * 20); eg.lineTo(cx + 40, cy - 22 - dr * 20); eg.lineTo(cx - 40, cy - 22 + dr * 20); eg.fill(); eg.restore(); }
        if (m === 'thinking') { eg.save(); eg.shadowBlur = 0; eg.fillStyle = '#000'; eg.fillRect(cx - 30, cy - 50, 60, 42); eg.restore(); }
        if (m === 'angry' || m === 'sad') { eg.save(); eg.shadowBlur = 0; eg.fillStyle = '#000'; eg.beginPath(); var dir = (m === 'angry' ? 1 : -1) * s; eg.moveTo(cx - 40, cy - 66 + dir * 24); eg.lineTo(cx + 40, cy - 66 - dir * 24); eg.lineTo(cx + 40, cy - 28 - dir * 24); eg.lineTo(cx - 40, cy - 28 + dir * 24); eg.fill(); eg.restore(); }
        if (m === 'calm' || m === 'listen' || m === 'curious' || m === 'attention' || m === 'oops') { eg.save(); eg.shadowBlur = 0; eg.fillStyle = 'rgba(255,255,255,.75)'; rr(cx - ew / 2 + 8, cy - eh / 2 + 8, 12, Math.max(2, eh * 0.28), 6); eg.fill(); eg.restore(); }
      });
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
      var keep = { m: MOOD.m, b: blink, x: look.x, y: look.y }; MOOD.m = 'happy'; blink = 0; look.x = look.y = 0; drawEyes(api.t);
      var c = root.clone(true), g = {}; ['base', 'mid', 'face', 'shell', 'glass'].forEach(function (k, i) { g[k] = c.children[i]; g[k].position.set(0, 0, 0); });
      outside(g); c.position.set(0, 0, 0); c.rotation.set(0, 0, 0);
      var dead = []; c.traverse(function (o) { if (!o.visible) dead.push(o); }); dead.forEach(function (o) { if (o.parent) o.parent.remove(o); });
      var w = new THREE.Group(); c.scale.setScalar(0.001); w.add(c); w.updateMatrixWorld(true);
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
