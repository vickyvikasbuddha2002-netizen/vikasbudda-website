/* Roam 2: sloped body, glass face with colour eyes, side wheel discs, accessory pad. */
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
    R.outputEncoding = T.sRGBEncoding; R.toneMapping = T.ACESFilmicToneMapping; R.toneMappingExposure = 1.05;
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
    var key = new T.DirectionalLight(0xffffff, .9); key.position.set(-260, 520, 420); key.castShadow = true; key.shadow.mapSize.set(1024, 1024); key.shadow.radius = 8;
    Object.assign(key.shadow.camera, { left: -180, right: 180, top: 180, bottom: -180, near: 10, far: 1600 }); S.add(key);
    var fill = new T.DirectionalLight(0xfff4e8, .35); fill.position.set(380, 160, 300); S.add(fill);
    var rim = new T.DirectionalLight(0xffffff, .9); rim.position.set(-120, 260, -520); S.add(rim); var rim2 = new T.DirectionalLight(0xdfe6ff, .6); rim2.position.set(420, 120, -300); S.add(rim2);
    var ground = new T.Mesh(new T.PlaneGeometry(1400, 1400), new T.ShadowMaterial({ opacity: .16 })); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; S.add(ground);
    var sc = document.createElement('canvas'); sc.width = sc.height = 128; var sx = sc.getContext('2d'), gr = sx.createRadialGradient(64, 64, 2, 64, 64, 64);
    gr.addColorStop(0, 'rgba(0,0,0,.5)'); gr.addColorStop(.5, 'rgba(0,0,0,.2)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); sx.fillStyle = gr; sx.fillRect(0, 0, 128, 128);
    var contact = new T.Mesh(new T.PlaneGeometry(190, 170), new T.MeshBasicMaterial({ map: new T.CanvasTexture(sc), transparent: true, depthWrite: false })); contact.rotation.x = -Math.PI / 2; contact.position.y = .3; S.add(contact);

    var mats = [];
    function M(c, r, cc, extra) { var m = new T.MeshPhysicalMaterial(Object.assign({ color: col(c), roughness: r, clearcoat: cc || 0, clearcoatRoughness: .3 }, extra || {})); m.userData.env = m.envMapIntensity = 1; mats.push(m); return m; }
    var shell = M(0xece9e3, .5, .25), base = M(0xd9d4ca, .55, .1), disc = M(0xe6e2db, .45, .3), tyre = M(0x18181a, .85), glass = M(0x050506, .04, 1, { clearcoatRoughness: .03 }), pad = M(0xf3f1ec, .38, .45), graph = M(0x2b2d31, .5, .1), dark = M(0x0c0c0e, .3, .6);

    var bot = new T.Group(); S.add(bot);
    var body = new T.Group(); bot.add(body);
    var p = new T.Shape(); p.moveTo(-46, 14); p.lineTo(53, 14); p.lineTo(53, 96); p.quadraticCurveTo(53, 111, 36, 111); p.lineTo(-12, 111); p.lineTo(-48, 42); p.quadraticCurveTo(-54, 26, -46, 14);
    var bg = new T.ExtrudeGeometry(p, { depth: 102, bevelEnabled: true, bevelThickness: 7, bevelSize: 7, bevelSegments: 8, curveSegments: 28 }); bg.translate(0, 0, -51); bg.rotateY(-Math.PI / 2);
    var hull = new T.Mesh(bg, shell); hull.castShadow = hull.receiveShadow = true; body.add(hull);
    var band = slab(112, 104, 13, 12, 3, base); band.rotation.x = -Math.PI / 2; band.position.set(0, 7.5, 5); body.add(band);
    var gl = slab(82, 60, 1.6, 15, .7, glass); gl.position.set(0, 64, 60.3); body.add(gl);
    var fc = document.createElement('canvas'); fc.width = 640; fc.height = 468; var fx = fc.getContext('2d');
    var off = document.createElement('canvas'); off.width = 640; off.height = 468; var ox = off.getContext('2d');
    var ftex = new T.CanvasTexture(fc); ftex.encoding = T.sRGBEncoding;
    var face = new T.Mesh(new T.PlaneGeometry(80, 58.5), new T.MeshBasicMaterial({ map: ftex, transparent: true, depthWrite: false, toneMapped: false })); face.position.set(0, 64, 61.3); body.add(face);
    var camR = cyl(3.4, 3.4, 1.2, graph, 32); camR.rotation.x = Math.PI / 2; camR.position.set(0, 88.5, 61.3); body.add(camR);
    var camL = cyl(2, 2, 1.4, dark, 24); camL.rotation.x = Math.PI / 2; camL.position.set(0, 88.5, 61.6); body.add(camL);
    var pill = slab(26, 9, 1.4, 4.5, .6, glass); pill.position.set(0, 23, 60.3); body.add(pill);
    [-6, 6].forEach(function (x) { var l = cyl(1.8, 1.8, 1.2, graph, 20); l.rotation.x = Math.PI / 2; l.position.set(x, 0, .8); pill.add(l); });
    var padM = slab(46, 34, 1.2, 7, .5, pad); padM.rotation.x = -Math.PI / 2; padM.position.set(0, 118.4, 11); body.add(padM);
    var led = new T.Mesh(new T.CircleGeometry(.9, 16), new T.MeshBasicMaterial({ color: 0xffffff })); led.rotation.x = -Math.PI / 2; led.position.set(0, 119.1, 24); body.add(led);
    var wheels = [];
    [-1, 1].forEach(function (s) {
      var w = new T.Group(); w.position.set(s * 60.5, 27, -24); bot.add(w);
      var t = new T.Mesh(new T.TorusGeometry(23.5, 3.5, 20, 72), tyre); t.rotation.y = Math.PI / 2; t.castShadow = true; w.add(t);
      var d = cyl(23.6, 23.6, 5.5, disc, 72); d.rotation.z = Math.PI / 2; w.add(d);
      var cap = cyl(3, 3, 5.9, base, 24); cap.rotation.z = Math.PI / 2; w.add(cap);
      wheels.push(w);
    });

    [gl, face, camR, camL, pill].forEach(function (m) { m.userData.z0 = m.position.z; });
    /* accessories */
    var acc = new T.Group(); acc.position.set(0, 119, 11); body.add(acc);
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
      light = k; hemi.intensity = .35 * k; key.intensity = .9 * k; fill.intensity = .35 * k; rim.intensity = .9 * k; rim2.intensity = .6 * k; ground.material.opacity = .16 * k; contact.material.opacity = k;
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
      wheels[0].rotation.x += dz / 27 + dy * 2.2; wheels[1].rotation.x += dz / 27 - dy * 2.2;
      var ex = pose.ex; [gl, face, camR, camL, pill].forEach(function (m) { m.position.z = m.userData.z0 + ex * 70; });
      padM.position.y = 118.4 + ex * 30; led.position.y = 119.1 + ex * 30; band.position.y = 7.5 - ex * 16; acc.visible = ex < .05;
      wheels[0].position.x = -60.5 - ex * 46; wheels[1].position.x = 60.5 + ex * 46;
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
