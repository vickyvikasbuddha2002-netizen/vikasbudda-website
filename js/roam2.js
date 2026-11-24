/* Omvi: sloped body, glass face with colour eyes, side wheel discs, accessory pad. */
(function () {
  var T = THREE;
  function col(h) { return new T.Color(h).convertSRGBToLinear(); }
  function hex2rgb(h) { var n = parseInt(h.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
  function lerp(a, b, k) { return a + (b - a) * k; }
  function rr(w, h, r) { var s = new T.Shape(), x = -w / 2, y = -h / 2; s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h); s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r); s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y); return s; }
  function slab(w, h, d, r, b, m) { b = Math.min(b, r, d / 2 - .01); var g = new T.ExtrudeGeometry(rr(w - 2 * b, h - 2 * b, Math.max(.4, r - b)), { depth: Math.max(.01, d - 2 * b), bevelEnabled: b > 0, bevelThickness: b, bevelSize: b, bevelSegments: 5, curveSegments: 16 }); g.translate(0, 0, -(d - 2 * b) / 2); var o = new T.Mesh(g, m); o.castShadow = o.receiveShadow = true; return o; }
  function cyl(r1, r2, h, m, s) { var o = new T.Mesh(new T.CylinderGeometry(r1, r2, h, s || 48), m); o.castShadow = o.receiveShadow = true; return o; }

  var MOODS = {
    calm: { c: '#ffe2b8', w: 40, h: 118 },
    happy: { c: '#ffcf6e', w: 46, h: 112, lb: .5 },
    curious: { c: '#79e2ff', w: 42, h: 122, asym: .22 },
    love: { c: '#ff6b98', w: 40, h: 118, heart: 1 },
    sleepy: { c: '#a493ff', w: 44, h: 112, lt: .8 },
    focus: { c: '#7cf2bd', w: 54, h: 96, lt: .42, lb: .16 },
    guard: { c: '#ffa24a', w: 52, h: 104, lt: .36, tilt: .24 },
    sad: { c: '#78a5ff', w: 40, h: 110, lt: .3, tilt: -.26 },
    listen: { c: '#b49bff', w: 42, h: 116, pulse: 1 },
    surprised: { c: '#f4f7ff', w: 74, h: 78 },
    plant: { c: '#a7f27c', w: 42, h: 116, lb: .3 },
    phone: { c: '#e9f1ff', w: 44, h: 110 },
    proud: { c: '#ffd88a', w: 48, h: 100, lb: .42, lt: .12 },
    shh: { c: '#9fd8ff', w: 48, h: 60 }
  };

  window.Roam2 = function (canvas, opt) {
    opt = opt || {};
    var RM = opt.reduced;
    var R = new T.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true, preserveDrawingBuffer: !!opt.keep });
    R.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    R.outputEncoding = T.sRGBEncoding; R.toneMapping = T.ACESFilmicToneMapping; R.toneMappingExposure = .88;
    R.shadowMap.enabled = true; R.shadowMap.type = T.PCFSoftShadowMap; R.setClearColor(0, 0);
    var S = new T.Scene(), C = new T.PerspectiveCamera(22, 1, 10, 5000);
    (function () {
      var es = new T.Scene();
      es.add(new T.Mesh(new T.BoxGeometry(2000, 1400, 2000), new T.MeshBasicMaterial({ color: new T.Color(.09, .09, .09), side: T.BackSide })));
      function pn(w, h, x, y, z, c, rx, ry) { var m = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ color: c, side: T.DoubleSide })); m.position.set(x, y, z); m.rotation.set(rx || 0, ry || 0, 0); es.add(m); }
      pn(1000, 800, 0, 690, 100, new T.Color(5, 5, 5), Math.PI / 2, 0);
      pn(260, 1100, -990, 200, 260, new T.Color(4, 4, 4), 0, Math.PI / 2);
      pn(260, 1100, 990, 200, 260, new T.Color(2.4, 2.4, 2.4), 0, -Math.PI / 2);
      pn(1400, 240, 0, 260, 990, new T.Color(2, 2, 2), 0, Math.PI);
      var pm = new T.PMREMGenerator(R); S.environment = pm.fromScene(es, .04).texture; pm.dispose();
    })();
    var hemi = new T.HemisphereLight(0xffffff, 0xd8d4cc, .35); S.add(hemi);
    var key = new T.DirectionalLight(0xffffff, .9); key.position.set(-260, 520, 420); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.radius = 8;
    Object.assign(key.shadow.camera, { left: -180, right: 180, top: 180, bottom: -180, near: 10, far: 1600 }); S.add(key);
    var fill = new T.DirectionalLight(0xfff4e8, .35); fill.position.set(380, 160, 300); S.add(fill);
    var rim = new T.DirectionalLight(0xffffff, .9); rim.position.set(-120, 260, -520); S.add(rim); var rim2 = new T.DirectionalLight(0xdfe6ff, .6); rim2.position.set(420, 120, -300); S.add(rim2);
    var ground = new T.Mesh(new T.PlaneGeometry(1400, 1400), new T.ShadowMaterial({ opacity: .16 })); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; S.add(ground);
    var sc = document.createElement('canvas'); sc.width = sc.height = 128; var sx = sc.getContext('2d'), gr = sx.createRadialGradient(64, 64, 2, 64, 64, 64);
    gr.addColorStop(0, 'rgba(0,0,0,.5)'); gr.addColorStop(.5, 'rgba(0,0,0,.2)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); sx.fillStyle = gr; sx.fillRect(0, 0, 128, 128);
    var contact = new T.Mesh(new T.PlaneGeometry(190, 170), new T.MeshBasicMaterial({ map: new T.CanvasTexture(sc), transparent: true, depthWrite: false })); contact.rotation.x = -Math.PI / 2; contact.position.y = .3; S.add(contact);

    var mats = [];
    function M(c, r, cc, extra) { var m = new T.MeshPhysicalMaterial(Object.assign({ color: col(c), roughness: r, clearcoat: cc || 0, clearcoatRoughness: .3 }, extra || {})); m.userData.env = m.envMapIntensity = 1; mats.push(m); return m; }
    var shell = M(0xddd3c4, .55, .1), base = M(0xbebbb6, .6, .05), disc = M(0xe0d9cd, .5, .12), tyre = M(0x18181a, .85), glass = M(0x050506, .04, 1, { clearcoatRoughness: .03 }), pad = M(0xefeae2, .42, .3), graph = M(0x2b2d31, .5, .1), dark = M(0x0c0c0e, .3, .6);

    var bot = new T.Group(); S.add(bot);
    var body = new T.Group(); bot.add(body);
    /* body: a tapered pod. Rounded-rect sections lofted from a wide base to a narrower top,
       face leaning back a little, back leaning in more, big rolled fillet into the top. */
    /* Body from the multi-view sheet: 108 W x 114 D x 120 H, 6 mm ground clearance, wheels 68 mm.
       Side profile: near-vertical lower front, face plane leaning back ~30 deg, a gentle top plane
       carrying the touch pad, rounded apex at the back, rear almost vertical. */
    var PR = [];
    function P(z, y) { PR.push([z, y]); }
    function Q(a0, c, a1, n) { for (var i = 1; i <= n; i++) { var t = i / n, u = 1 - t; P(u * u * a0[0] + 2 * u * t * c[0] + t * t * a1[0], u * u * a0[1] + 2 * u * t * c[1] + t * t * a1[1]); } }
    function L(a0, a1, n) { for (var i = 1; i <= n; i++) { var t = i / n; P(a0[0] + (a1[0] - a0[0]) * t, a0[1] + (a1[1] - a0[1]) * t); } }
    var F0 = [50, 6], F1 = [57.5, 13], F2 = [59, 32], C1 = [18.86, 100.5], A = [-51.38, 120.2];
    var g1 = [26.06, 88.27], g2 = [9.23, 103.2], a1p = [-37.9, 116.4], a2p = [-50.66, 106.2], R1 = [-56.9, 13], R0 = [-50, 6];
    P(F0[0], F0[1]); Q(F0, [57, 6], F1, 8); L(F1, F2, 8); L(F2, g1, 30); Q(g1, C1, g2, 14); L(g2, a1p, 30); Q(a1p, A, a2p, 24); L(a2p, R1, 30); Q(R1, [-57, 6], R0, 8);
    var im = 0; PR.forEach(function (q, i) { if (q[1] > PR[im][1]) im = i; });
    var FB = PR.slice(0, im + 1), RBR = PR.slice(im).reverse(), YT = PR[im][1], ZT = PR[im][0];
    function interp(arr, y) { for (var i = 0; i < arr.length - 1; i++) { var p0 = arr[i], p1 = arr[i + 1]; if (y >= p0[1] && y <= p1[1]) { var t = p1[1] === p0[1] ? 0 : (y - p0[1]) / (p1[1] - p0[1]); return p0[0] + (p1[0] - p0[0]) * t; } } return arr[y < arr[0][1] ? 0 : arr.length - 1][0]; }
    var YB = 16;
    function sec(y) {
      var hw = 54 - 5 * Math.max(0, y - 13) / 80, ins = 0;
      if (y < 13) { var e = 13 - y; ins = 7 - Math.sqrt(Math.max(0, 49 - e * e)); }
      if (y > 98) { var d = Math.min(20, y - 98); ins = 20 - Math.sqrt(Math.max(0, 400 - d * d)); }
      hw -= ins; var zf = interp(FB, y), zb = interp(RBR, y);
      return { hw: hw, zf: zf, zb: zb, r: Math.max(.02, Math.min(14, hw - .2, (zf - zb) / 2 - .02)) };
    }
    function ring(c, y, sh) {
      if (sh) c = { hw: c.hw - sh, zf: c.zf - sh, zb: c.zb + sh, r: Math.max(.02, c.r - sh) };
      var K = 12, Mn = 10, pts = [], cs = [[c.hw - c.r, c.zf - c.r, 0], [-c.hw + c.r, c.zf - c.r, 1], [-c.hw + c.r, c.zb + c.r, 2], [c.hw - c.r, c.zb + c.r, 3]];
      for (var i = 0; i < 4; i++) {
        var q = cs[i], nq = cs[(i + 1) % 4];
        for (var j = 0; j <= K; j++) { var t = (q[2] + j / K) * Math.PI / 2; pts.push(q[0] + Math.cos(t) * c.r, y, q[1] + Math.sin(t) * c.r); }
        var t1 = (q[2] + 1) * Math.PI / 2, sx = q[0] + Math.cos(t1) * c.r, sz = q[1] + Math.sin(t1) * c.r, ex2 = nq[0] + Math.cos(t1) * c.r, ez = nq[1] + Math.sin(t1) * c.r;
        for (var m = 1; m <= Mn; m++) { var f = m / (Mn + 1); pts.push(sx + (ex2 - sx) * f, y, sz + (ez - sz) * f); }
      }
      return pts;
    }
    function loft(ys, capTop, capBot, sh) {
      var pos = [], idx = [], NR = 0, a1, b1;
      ys.forEach(function (y) { var r0 = ring(sec(y), y, sh); NR = r0.length / 3; pos.push.apply(pos, r0); });
      for (a1 = 0; a1 < ys.length - 1; a1++) for (b1 = 0; b1 < NR; b1++) { var p0 = a1 * NR + b1, p1 = a1 * NR + (b1 + 1) % NR; idx.push(p0, p0 + NR, p1, p1, p0 + NR, p1 + NR); }
      if (capTop) { var ct = pos.length / 3, lr = (ys.length - 1) * NR; pos.push(0, YT, ZT); for (b1 = 0; b1 < NR; b1++) idx.push(lr + b1, ct, lr + (b1 + 1) % NR); }
      if (capBot) { var cb = pos.length / 3, c2 = sec(ys[0]); pos.push(0, ys[0], (c2.zf + c2.zb) / 2); for (b1 = 0; b1 < NR; b1++) idx.push(b1, (b1 + 1) % NR, cb); }
      var g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals(); return g;
    }
    var yall = PR.map(function (q) { return q[1]; }); for (var yy = 6; yy < YT; yy += 2) yall.push(yy); yall.push(YB, 98, 100, 102, 104, 106, 108, 110, 112, 114, 116, 117, 118);
    yall.sort(function (x, y) { return x - y; });
    var ysB = [], ysH = [], lastY = -1;
    yall.forEach(function (y) { if (y < 6 || y > YT - .05 || y - lastY < .25) return; lastY = y; if (y <= YB) ysB.push(y); if (y >= YB) ysH.push(y); });
    if (ysB[ysB.length - 1] !== YB) ysB.push(YB); if (ysH[0] !== YB) ysH.unshift(YB);
    shell.userData.env = .32; base.userData.env = .35; disc.userData.env = .38;
    var hull = new T.Mesh(loft(ysH, true, false), shell); hull.castShadow = hull.receiveShadow = true; body.add(hull);
    var band = new T.Mesh(loft(ysB, false, true, 1), base); band.castShadow = band.receiveShadow = true; body.add(band);
    [-1, 1].forEach(function (s) { var c = cyl(4.5, 4.5, 5, tyre, 24); c.rotation.z = Math.PI / 2; c.position.set(s * 26, 4.5, 38); body.add(c); });
    /* face module on the leaning face plane */
    var FU = [-.5057, .8627], FN = [.8627, .5057], LEAN = Math.atan2(.5057, .8627);
    var fg = new T.Group(); fg.position.set(0, 60.9 + FN[1] * .1, 42.06 + FN[0] * .1); fg.rotation.x = -LEAN; body.add(fg);
    var gl = slab(84, 58, 1.4, 13, .6, glass); gl.position.z = .7; fg.add(gl);
    var scr = slab(54, 38, .2, 3, 0, M(0x111214, .55)); scr.position.set(0, -3, 1.5); fg.add(scr);
    var fc = document.createElement('canvas'); fc.width = 640; fc.height = 468; var fx = fc.getContext('2d');
    var off = document.createElement('canvas'); off.width = 640; off.height = 468; var ox = off.getContext('2d');
    var ftex = new T.CanvasTexture(fc); ftex.encoding = T.sRGBEncoding;
    var face = new T.Mesh(new T.PlaneGeometry(66, 48.3), new T.MeshBasicMaterial({ map: ftex, transparent: true, depthWrite: false, toneMapped: false })); face.position.set(0, -3, 1.65); fg.add(face);
    var camR = cyl(3.4, 3.4, 1.2, graph, 32); camR.rotation.x = Math.PI / 2; camR.position.set(0, 23, 1.5); fg.add(camR);
    var camL = cyl(2, 2, 1.4, dark, 24); camL.rotation.x = Math.PI / 2; camL.position.set(0, 23, 1.8); fg.add(camL);
    var pill = slab(25, 9.5, 1.4, 4.75, .6, glass); pill.position.set(0, 24.5, 58.4 + .7); pill.rotation.x = .079; body.add(pill);
    [-6.5, 6.5].forEach(function (x) { var l = cyl(2, 2, 1.2, graph, 20); l.rotation.x = Math.PI / 2; l.position.set(x, 0, .8); pill.add(l); });
    /* touch pad on the top plane */
    var TA = Math.atan2(.27, .9628), PY = 109.8 + .9628 * .7, PZ = -14.3 + .27 * .7;
    var padM = slab(54, 44, 1.2, 9, .5, pad); padM.rotation.x = -Math.PI / 2 + TA; padM.position.set(0, PY, PZ); body.add(padM);
    var led = new T.Mesh(new T.CircleGeometry(.9, 16), new T.MeshBasicMaterial({ color: 0xffffff })); led.rotation.x = -Math.PI / 2 + TA; led.position.set(0, PY + .75, PZ + .2); body.add(led);
    /* rear: speaker grille and USB-C */
    var dotM = M(0x2a2a2c, .8), dotG = new T.CircleGeometry(.75, 10);
    for (var gx = -6; gx <= 6; gx++) for (var gy = 0; gy < 5; gy++) { var yv = 86 + gy * 3.2, dd = new T.Mesh(dotG, dotM); dd.position.set(gx * 3.2 + (gy % 2) * 1.6, yv, sec(yv).zb - .15); dd.rotation.y = Math.PI; body.add(dd); }
    var usb = slab(9, 3.4, 1, 1.7, .3, dark); usb.position.set(0, 28, sec(28).zb - .3); body.add(usb);
    /* wheels: 68 mm, toward the rear, set in arches flush with the sides */
    var wheels = [], WY = 30, WZ = -22, WX = sec(WY).hw - 3.4, TILT = Math.atan(5 / 80);
    [-1, 1].forEach(function (s) {
      var wo = new T.Group(); wo.position.set(s * WX, WY, WZ); wo.rotation.z = s * TILT; bot.add(wo);
      var w = new T.Group(); wo.add(w);
      var t = new T.Mesh(new T.TorusGeometry(26, 4, 24, 96), tyre); t.rotation.y = Math.PI / 2; t.castShadow = true; w.add(t);
      var d = cyl(26.6, 26.6, 5, disc, 96); d.rotation.z = Math.PI / 2; d.position.x = s * 1.6; w.add(d);
      wheels.push(w);
      var ag = new T.TorusGeometry(31.6, 1, 12, 120, 4.07); ag.rotateZ(-.464); ag.rotateY(Math.PI / 2);
      var arch = new T.Mesh(ag, M(0x3a3734, .9)); arch.position.set(s * (sec(WY).hw - .4), WY, WZ); arch.rotation.z = s * TILT; body.add(arch);
    });

    [fg, pill].forEach(function (m) { m.userData.z0 = m.position.z; });
    /* accessories */
    var acc = new T.Group(); acc.position.set(0, 111, -14); body.add(acc);
    var A = {};
    (function () {
      var g = new T.Group(); var pot = cyl(12, 10, 16, graph, 40); pot.position.y = 8; g.add(pot);
      var soil = cyl(11, 11, 1, M(0x3a2a20, .9), 32); soil.position.y = 15.8; g.add(soil);
      var leaf = M(0x7fa86c, .55, .2);
      for (var i = 0; i < 14; i++) { var a = i * 2.4, r = i < 6 ? 2.5 : 6, l = new T.Mesh(new T.ConeGeometry(2.8, 11 - (i < 6 ? 0 : 2), 12), leaf); l.position.set(Math.cos(a) * r, 21, Math.sin(a) * r); l.rotation.set(Math.sin(a) * (i < 6 ? .35 : .8), 0, -Math.cos(a) * (i < 6 ? .35 : .8)); l.castShadow = true; g.add(l); }
      A.plant = g;
    })();
    (function () {
      var g = new T.Group(); var mast = cyl(1.1, 1.1, 40, graph, 16); mast.position.set(16, 20, 0); g.add(mast);
      var foot = cyl(5, 6, 3, graph, 24); foot.position.set(16, 1.5, 0); g.add(foot);
      var fc2 = document.createElement('canvas'); fc2.width = 360; fc2.height = 220; var q = fc2.getContext('2d');
      q.fillStyle = '#2b2d31'; q.fillRect(0, 0, 360, 220); q.fillStyle = '#ffa24a'; q.fillRect(0, 196, 360, 24);
      q.fillStyle = '#f4f2ee'; q.font = '600 64px Geist, Arial, sans-serif'; q.textBaseline = 'middle'; q.fillText('Taken', 34, 82); q.font = '400 34px Geist, Arial, sans-serif'; q.fillStyle = '#b9b9bd'; q.fillText('Back at 2:30', 36, 146);
      var ft = new T.CanvasTexture(fc2); ft.encoding = T.sRGBEncoding;
      var fl = new T.Mesh(new T.PlaneGeometry(36, 22), new T.MeshStandardMaterial({ map: ft, side: T.DoubleSide, roughness: .7 })); fl.position.set(-2.5, 29, 0); fl.scale.setScalar(.85); fl.castShadow = true; g.add(fl);
      A.flag = g;
    })();
    (function () {
      var g = new T.Group(); var tray = slab(40, 30, 4, 4, 1.2, graph); tray.rotation.x = -Math.PI / 2; tray.position.y = 2; g.add(tray);
      var y = M(0xf4d35e, .8); for (var i = 0; i < 5; i++) { var n = new T.Mesh(new T.BoxGeometry(22, .9, 22), y); n.position.set(-6, 4.5 + i * .9, 0); n.rotation.y = i * .05 - .1; n.castShadow = true; g.add(n); }
      var pen = cyl(1.6, 1.6, 30, graph, 16); pen.rotation.z = Math.PI / 2; pen.rotation.y = .3; pen.position.set(10, 5.6, 4); g.add(pen);
      var tip = cyl(1.6, 1.6, 5, M(0xa7f27c, .4), 16); tip.rotation.z = Math.PI / 2; tip.rotation.y = .3; tip.position.set(24, 5.6, -0.3); g.add(tip);
      A.notes = g;
    })();
    (function () {
      var g = new T.Group(); var k = Math.atan2(36, 69);
      var ph = slab(40, 80, 4, 6, 1.5, M(0x1d1e22, .3, .6)); var sc2 = document.createElement('canvas'); sc2.width = 240; sc2.height = 480; var q = sc2.getContext('2d');
      var grd = q.createLinearGradient(0, 0, 0, 480); grd.addColorStop(0, '#2a3550'); grd.addColorStop(1, '#151a24'); q.fillStyle = grd; q.fillRect(0, 0, 240, 480);
      q.fillStyle = '#f4f2ee'; q.font = '600 30px Geist, Arial'; q.fillText('Priya', 28, 210); q.font = '400 22px Geist, Arial'; q.fillStyle = '#b9c2d6'; q.fillText('Incoming call', 28, 244);
      q.fillStyle = '#4bd07a'; q.beginPath(); q.arc(70, 400, 26, 0, 7); q.fill(); q.fillStyle = '#e0524a'; q.beginPath(); q.arc(170, 400, 26, 0, 7); q.fill();
      var st = new T.CanvasTexture(sc2); st.encoding = T.sRGBEncoding;
      var scr = new T.Mesh(new T.PlaneGeometry(36, 76), new T.MeshBasicMaterial({ map: st, toneMapped: false })); scr.position.z = -2.1; scr.rotation.y = Math.PI; ph.add(scr);
      ph.rotation.x = k; ph.position.set(0, 80.5 - 119, -40 - 11); g.add(ph);
      var ledge = slab(46, 8, 6, 2, 1, graph); ledge.rotation.x = k; ledge.position.set(0, -74.4, -73); g.add(ledge);
      A.phone = g;
    })();
    Object.keys(A).forEach(function (k) { A[k].visible = false; acc.add(A[k]); });

    /* face */
    var cur = Object.assign({ lt: 0, lb: 0, tilt: 0, asym: 0, heart: 0, pulse: 0 }, MOODS.calm), rgb = hex2rgb(MOODS.calm.c), tgt = MOODS.calm, trgb = rgb.slice();
    var gaze = { x: 0, y: 0, tx: 0, ty: 0 }, blink = 0, nextBlink = 2, talk = 0, wake = opt.asleep ? 1 : 0;
    function heart(c, cx, cy, s) { c.beginPath(); c.moveTo(cx, cy + s * .42); c.bezierCurveTo(cx - s * .95, cy - s * .12, cx - s * .42, cy - s * .78, cx, cy - s * .3); c.bezierCurveTo(cx + s * .42, cy - s * .78, cx + s * .95, cy - s * .12, cx, cy + s * .42); c.fill(); }
    function drawFace(t) {
      var k = RM ? 1 : .14;
      ['w', 'h', 'lt', 'lb', 'tilt', 'asym', 'heart', 'pulse'].forEach(function (n) { cur[n] = lerp(cur[n], tgt[n] || 0, k); });
      for (var i = 0; i < 3; i++) rgb[i] = lerp(rgb[i], trgb[i], k);
      gaze.x = lerp(gaze.x, gaze.tx, RM ? 1 : .12); gaze.y = lerp(gaze.y, gaze.ty, RM ? 1 : .12);
      ox.clearRect(0, 0, 640, 468); ox.globalCompositeOperation = 'source-over';
      var c = 'rgb(' + rgb.map(Math.round).join(',') + ')'; ox.fillStyle = c;
      var h0 = cur.h * (1 + cur.pulse * .1 * Math.sin(t * 6)) * (1 + talk * .1 * Math.sin(t * 22));
      [-1, 1].forEach(function (s) {
        var cx = 320 + s * 112 + gaze.x * 52, cy = 234 + gaze.y * 34, w = cur.w * 1.32, h = h0 * 1.32 * (1 + (s > 0 ? cur.asym : -cur.asym * .3));
        ox.globalCompositeOperation = 'source-over';
        if (cur.heart > .5) { heart(ox, cx, cy, h * .9); }
        else { ox.beginPath(); if (ox.roundRect) ox.roundRect(cx - w / 2, cy - h / 2, w, h, Math.min(w, h) / 2); else ox.rect(cx - w / 2, cy - h / 2, w, h); ox.fill(); }
        ox.globalCompositeOperation = 'destination-out';
        var lt = Math.max(cur.lt, blink, wake), top = cy - h / 2 + h * lt;
        ox.save(); ox.translate(cx, top); ox.rotate(cur.tilt * s * -1); ox.fillRect(-120, -300, 240, 300); ox.restore();
        if (cur.lb > .01) { var r = w * 1.7; ox.beginPath(); ox.arc(cx, cy + h / 2 + r - h * cur.lb * 1.05, r, 0, 7); ox.fill(); }
        ox.globalCompositeOperation = 'source-over';
      });
      fx.clearRect(0, 0, 640, 468);
      fx.shadowColor = 'rgba(' + rgb.map(Math.round).join(',') + ',.9)'; fx.shadowBlur = 40; fx.drawImage(off, 0, 0); fx.shadowBlur = 16; fx.drawImage(off, 0, 0); fx.shadowBlur = 0;
      ftex.needsUpdate = true;
    }

    /* pose */
    var pose = { yaw: 0, x: 0, z: 0, tilt: 0, lift: 0, ex: 0 }, ptgt = { yaw: 0, x: 0, z: 0, tilt: 0, lift: 0, ex: 0 }, bounceT = -9, wiggleT = -9, spinT = -9, light = opt.light == null ? 1 : opt.light;
    var accTgt = null, accCur = null, accK = 0;
    function setLight(k) {
      light = k; hemi.intensity = .18 * k; key.intensity = 1.6 * k; fill.intensity = .22 * k; rim.intensity = .7 * k; rim2.intensity = .22 * k; ground.material.opacity = .16 * k; contact.material.opacity = k;
      mats.forEach(function (m) { m.envMapIntensity = m.userData.env * (0.02 + .98 * k); });
      led.material.color.setScalar(.3 + .7 * k);
    }
    setLight(light);
    var api = {
      mood: function (n) { var m = MOODS[n] || MOODS.calm; tgt = m; trgb = hex2rgb(m.c); api.cur = n; },
      look: function (x, y) { gaze.tx = Math.max(-1, Math.min(1, x)); gaze.ty = Math.max(-1, Math.min(1, y)); },
      pose: function (o) { Object.keys(o).forEach(function (k) { ptgt[k] = o[k]; }); },
      talk: function (sec) { talkUntil = clock + sec; },
      bounce: function () { bounceT = clock; }, wiggle: function () { wiggleT = clock; }, spin: function () { spinT = clock; },
      wake: function () { wakeTgt = 0; }, sleep: function () { wakeTgt = 1; },
      light: setLight,
      accessory: function (n) { accTgt = n || null; },
      moods: MOODS,
      hit: function (cx, cy) { var r = canvas.getBoundingClientRect(), v = new T.Vector2((cx - r.left) / r.width * 2 - 1, -(cy - r.top) / r.height * 2 + 1), rc = new T.Raycaster(); rc.setFromCamera(v, C); return rc.intersectObject(bot, true).length > 0; },
      frame: function (f) { frameView = f; },
      exportScene: function () { return bot; },
      cur: 'calm'
    };
    var wakeTgt = wake, talkUntil = 0, clock = 0, last = performance.now(), frameView = null, vis = true, w0 = 0, h0 = 0;
    if ('IntersectionObserver' in window) new IntersectionObserver(function (e) { vis = e[0].isIntersecting; }).observe(canvas);
    var idleT = 0;
    function loop(now) {
      requestAnimationFrame(loop);
      var dt = Math.min(.05, (now - last) / 1000); last = now; clock += dt;
      if (!vis || canvas.style.opacity === '0') return;
      var w = canvas.clientWidth, h = canvas.clientHeight;
      if (w !== w0 || h !== h0) { w0 = w; h0 = h; R.setSize(w, h, false); C.aspect = w / Math.max(1, h); C.updateProjectionMatrix(); }
      var f = frameView ? frameView(C.aspect) : { d: 560, y: 60, ty: 58 };
      C.position.set(f.ox || 0, f.y + f.d * .18, f.d); C.lookAt(f.ox || 0, f.ty, 0);
      wake = lerp(wake, wakeTgt, RM ? 1 : .06);
      nextBlink -= dt; if (nextBlink < 0) { blink = 1; nextBlink = 2.4 + Math.random() * 3.5; } blink = Math.max(0, blink - dt * 7);
      talk = clock < talkUntil ? 1 : Math.max(0, talk - dt * 4);
      idleT -= dt; if (idleT < 0 && api.autoGaze !== false) { idleT = 1.2 + Math.random() * 2.4; if (!api.follow) api.look((Math.random() * 2 - 1) * .5, (Math.random() * 2 - 1) * .3); }
      var k = RM ? 1 : Math.min(1, dt * 4), px = pose.x, pz = pose.z, py = pose.yaw;
      Object.keys(pose).forEach(function (n) { pose[n] = lerp(pose[n], ptgt[n], k); });
      var b = clock - bounceT, bo = b < 1.1 ? Math.abs(Math.sin(b * Math.PI * 2.7)) * 9 * (1 - b / 1.1) : 0;
      var wg = clock - wiggleT, wo = wg < .9 ? Math.sin(wg * 26) * .14 * (1 - wg / .9) : 0;
      var sp = clock - spinT, so = sp < 1.2 ? (function (u) { return u * u * (3 - 2 * u); })(sp / 1.2) * Math.PI * 2 : 0;
      bot.position.set(pose.x, pose.lift + bo, pose.z); bot.rotation.y = pose.yaw + wo + so; body.rotation.x = pose.tilt;
      var dz = (pose.z - pz) * Math.cos(pose.yaw) + (pose.x - px) * Math.sin(pose.yaw), dy = (pose.yaw - py) + (sp < 1.2 ? 0 : 0);
      wheels[0].rotation.x += dz / 32 + dy * 2.2; wheels[1].rotation.x += dz / 32 - dy * 2.2;
      var ex = pose.ex; [fg, pill].forEach(function (m) { m.position.z = m.userData.z0 + ex * 70; });
      padM.position.y = PY + ex * 20; led.position.y = PY + .75 + ex * 20; band.position.y = -ex * 16; acc.visible = ex < .05;
      wheels[0].position.x = -ex * 46; wheels[1].position.x = ex * 46;
      contact.position.set(pose.x, .3, pose.z - 6); contact.scale.setScalar(1 + bo / 60);
      key.target = bot;
      if (accTgt !== accCur) { accK = Math.max(0, accK - dt * 6); if (accK === 0) { if (accCur) A[accCur].visible = false; accCur = accTgt; if (accCur) A[accCur].visible = true; } }
      else if (accCur) accK = Math.min(1, accK + dt * 3);
      var e = accK, s = e === 0 ? .001 : 1 + Math.sin(e * Math.PI) * .15 * (1 - e) - (1 - e) * .9; acc.scale.setScalar(Math.max(.001, s)); acc.position.y = 119 + (1 - e) * 14;
      drawFace(clock);
      R.render(S, C);
    }
    requestAnimationFrame(loop);
    api.renderOnce = function () { drawFace(clock); R.render(S, C); };
    api.scene = S;
    return api;
  };
})();
