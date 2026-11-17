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
    renderer.outputEncoding = THREE.sRGBEncoding; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.3;
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

    var G = geos();
    var mShell = new THREE.MeshPhysicalMaterial({ color: 0xf3f3f5, roughness: 0.2, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.05, reflectivity: 0.6, side: THREE.DoubleSide, envMapIntensity: 1.7 });
    var mTub = new THREE.MeshPhysicalMaterial({ color: 0xe6e6e9, roughness: 0.24, clearcoat: 1, clearcoatRoughness: 0.08, side: THREE.DoubleSide, envMapIntensity: 1.6 });
    var eye = document.createElement('canvas'); eye.width = 320; eye.height = 240; var eg = eye.getContext('2d'), eyeTex = new THREE.CanvasTexture(eye); eyeTex.encoding = THREE.sRGBEncoding;
    var mVisor = new THREE.MeshPhysicalMaterial({ color: 0x030304, roughness: 0.02, clearcoat: 1, clearcoatRoughness: 0.0, envMapIntensity: 2.2, emissive: 0xffffff, emissiveMap: eyeTex, emissiveIntensity: 1.6, side: THREE.DoubleSide });
    var root = new THREE.Group(), GR = { base: new THREE.Group(), mid: new THREE.Group(), face: new THREE.Group(), shell: new THREE.Group(), glass: new THREE.Group() };
    Object.keys(GR).forEach(function (k) { root.add(GR[k]); }); scene.add(root);
    GR.shell.add(new THREE.Mesh(G.cover, mShell)); GR.base.add(new THREE.Mesh(G.tub, mTub)); GR.glass.add(new THREE.Mesh(G.panel, mVisor));
    var mc = {};
    function mat(col) {
      if (!mc[col]) { var metal = [0xb9bdc4, 0xd4d6da, 0xb08d3c, 0xc9a24a, 0xc98a4b].indexOf(col) >= 0; mc[col] = new THREE.MeshPhysicalMaterial({ color: col, roughness: metal ? 0.22 : (col < 0x303030 ? 0.6 : 0.3), metalness: metal ? 0.95 : 0, clearcoat: metal || col < 0x303030 ? 0 : 0.6, clearcoatRoughness: 0.15, envMapIntensity: 1.4 }); }
      return mc[col];
    }
    var wheels = [], WH = window.ROAMB.wheel;
    window.ROAMB.parts.forEach(function (p) {
      var g = new THREE.Group(); g.position.fromArray(p.o); g.rotation.x = -(p.tilt || 0) * Math.PI / 180; GR[p.grp].add(g);
      var piv = g; if (p.spin) { piv = new THREE.Group(); piv.position.set(p.prims[0].c[0], WH.y, WH.z); g.add(piv); wheels.push(piv); }
      p.prims.forEach(function (q) {
        var geo;
        if (q.t === 'box') geo = new THREE.BoxGeometry(q.s[0], q.s[1], q.s[2]);
        else if (q.t === 'sph') geo = new THREE.SphereGeometry(q.r, 24, 16);
        else if (q.tyre) { var tp = arc(q.r - 2, -q.h / 2 + 2, 2, -Math.PI / 2, 0, 6).concat(arc(q.r - 2, q.h / 2 - 2, 2, 0, Math.PI / 2, 6)); tp.unshift(new THREE.Vector2(q.r - 3.4, -q.h / 2)); tp.push(new THREE.Vector2(q.r - 3.4, q.h / 2)); geo = new THREE.LatheGeometry(tp, 56); }
        else geo = new THREE.CylinderGeometry(q.cone ? q.r * 0.55 : q.r, q.r, q.h, 36);
        var m = new THREE.Mesh(geo, mat(q.col));
        if (q.t === 'cyl') { if (q.ax === 'x') m.rotation.z = -Math.PI / 2; if (q.ax === 'z') m.rotation.x = Math.PI / 2; }
        m.position.fromArray(q.c); if (p.spin) m.position.sub(piv.position); piv.add(m);
      });
    });
    root.position.y = -53;
    var mirror = null, mirGR = null, mirWheels = [];
    if (opts.mirror !== false) {
      mirror = root.clone(true); mirror.traverse(function (o) { if (o.isMesh) { var m = o.material.clone(); m.transparent = true; m.opacity = 0.22; m.depthWrite = false; m.side = THREE.DoubleSide; if (m.emissiveIntensity) m.emissiveIntensity *= 0.7; o.material = m; o.renderOrder = -1; } });
      mirror.scale.y = -1; scene.add(mirror);
      mirGR = {}; ['base', 'mid', 'face', 'shell', 'glass'].forEach(function (k, i) { mirGR[k] = mirror.children[i]; });
      mirGR.mid.visible = false; mirGR.face.visible = false;
      ['base', 'shell'].forEach(function (k) { mirGR[k].children.forEach(function (c, i) { if (i === 0) return; var keep = false; c.traverse(function (o) { if (o.isGroup && o !== c && o.children.length > 6) keep = true; }); c.visible = keep; }); });
      var wi = 0; mirror.traverse(function (o) { if (o.isGroup && o.parent && o.parent.parent && o.parent.parent.parent === mirror && o.children.length > 6 && wi < 2) { mirWheels.push(o); wi++; } });
    }

    // eyes: one face engine, many moods
    var look = { x: 0, y: 0, tx: 0, ty: 0 }, blink = 0, nextBlink = 2, MOOD = { m: 'calm', t: 0 };
    var COL = { calm: '#8fb4ff', happy: '#8fb4ff', love: '#ff7aa8', sleepy: '#6f86c9', surprised: '#a9c4ff', angry: '#ff6a4a', sad: '#7ea2ff', wink: '#8fb4ff', dizzy: '#c39bff', scared: '#a9c4ff', listen: '#8fe8ff', proud: '#ffd36b' };
    function drawEyes(t) {
      var W = 320, H = 240, m = MOOD.m, col = COL[m] || COL.calm; MOOD.t += 1 / 60;
      eg.fillStyle = '#000'; eg.fillRect(0, 0, W, H);
      look.x += (look.tx - look.x) * 0.08; look.y += (look.ty - look.y) * 0.08;
      var b = (blink > 0 && m !== 'sleepy' && m !== 'happy') ? Math.abs(Math.cos(blink * Math.PI)) : 1;
      eg.save(); eg.shadowColor = col; eg.shadowBlur = 30; eg.fillStyle = col; eg.strokeStyle = col; eg.lineCap = 'round'; eg.lineJoin = 'round';
      [-1, 1].forEach(function (s) {
        var cx = W / 2 + s * 58 + look.x * 24, cy = H * 0.47 + look.y * 16, ew = 50, eh = 104 * b;
        if (m === 'scared') { cx += Math.sin(t * 60) * 2; ew = 36; eh = 70 * b; }
        if (m === 'happy' || (m === 'wink' && s > 0) || m === 'proud') { eg.lineWidth = 18; eg.beginPath(); eg.arc(cx, cy + 14, 26, Math.PI * 1.1, Math.PI * 1.9); eg.stroke(); return; }
        if (m === 'love') { var k = 1 + 0.08 * Math.sin(t * 8); eg.save(); eg.translate(cx, cy); eg.scale(k, k); heart(0, 0, 34); eg.fill(); eg.restore(); return; }
        if (m === 'sleepy') { eg.lineWidth = 14; eg.beginPath(); eg.moveTo(cx - 24, cy + 10); eg.quadraticCurveTo(cx, cy + 22, cx + 24, cy + 10); eg.stroke(); return; }
        if (m === 'surprised') { eg.beginPath(); eg.arc(cx, cy, 34 * Math.max(0.2, b), 0, 6.283); eg.fill(); return; }
        if (m === 'dizzy') { eg.lineWidth = 8; eg.beginPath(); for (var i = 0; i < 60; i++) { var a = i / 60 * 12 + t * 6 * s, r = i / 60 * 32; eg[i ? 'lineTo' : 'moveTo'](cx + Math.cos(a) * r, cy + Math.sin(a) * r); } eg.stroke(); return; }
        rr(cx - ew / 2, cy - eh / 2, ew, Math.max(4, eh), ew / 2); eg.fill();
        if (m === 'angry' || m === 'sad') { eg.save(); eg.shadowBlur = 0; eg.fillStyle = '#000'; eg.beginPath(); var dir = (m === 'angry' ? 1 : -1) * s; eg.moveTo(cx - 40, cy - 70 + dir * 26); eg.lineTo(cx + 40, cy - 70 - dir * 26); eg.lineTo(cx + 40, cy - 30 - dir * 26); eg.lineTo(cx - 40, cy - 30 + dir * 26); eg.fill(); eg.restore(); }
        if (m === 'calm' || m === 'listen') { eg.save(); eg.shadowBlur = 0; eg.fillStyle = 'rgba(255,255,255,.75)'; rr(cx - ew / 2 + 8, cy - eh / 2 + 8, 12, Math.max(2, eh * 0.28), 6); eg.fill(); eg.restore(); }
      });
      if (m === 'sleepy') { eg.shadowBlur = 12; eg.font = '700 28px sans-serif'; var z = (t * 0.6) % 1; eg.globalAlpha = 1 - z; eg.fillText('z', W * 0.78 + z * 20, H * 0.3 - z * 40); eg.globalAlpha = 1; }
      eg.restore(); eyeTex.needsUpdate = true;
    }
    function heart(x, y, s) { eg.beginPath(); eg.moveTo(x, y + s * 0.75); eg.bezierCurveTo(x - s * 1.3, y - s * 0.1, x - s * 0.6, y - s * 1.1, x, y - s * 0.35); eg.bezierCurveTo(x + s * 0.6, y - s * 1.1, x + s * 1.3, y - s * 0.1, x, y + s * 0.75); eg.closePath(); }
    function rr(x, y, w, h, r) { r = Math.min(r, h / 2, w / 2); eg.beginPath(); eg.moveTo(x + r, y); eg.arcTo(x + w, y, x + w, y + h, r); eg.arcTo(x + w, y + h, x, y + h, r); eg.arcTo(x, y + h, x, y, r); eg.arcTo(x, y, x + w, y, r); eg.closePath(); }

    var api = { setMood: function (m) { MOOD.m = m; MOOD.t = 0; }, mood: function () { return MOOD.m; }, scene: scene, camera: camera, root: root, GR: GR, look: look, wheels: wheels, explode: 0, renderer: renderer, visible: true, t: 0 };
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
    return api;
  }
  /* always-on small talk: Roam keeps watching you and asking things */
  function chat(o) {
    var i = Math.floor(Math.random() * o.lines.length), timer = 0, last = Date.now();
    function next() {
      timer = setTimeout(function () {
        if (o.api.visible && !document.hidden && !(o.busy && o.busy())) {
          var L = o.lines[i % o.lines.length]; i++;
          o.say(L); last = Date.now();
          setTimeout(function () { if (!(o.busy && o.busy()) && o.api.mood() === L[0]) o.api.setMood('calm'); }, 2600 + L[1].length * 40);
        }
        next();
      }, (o.gap || 5200) + Math.random() * 2400);
    }
    setTimeout(next, o.first || 1200);
    return { poke: function () { last = Date.now(); } };
  }
  function bubble(el) {
    var t = 0;
    return function (L) {
      el.querySelector('.rm').textContent = (L[2] || ['bi', 'dwee']).join('-');
      el.querySelector('.en').textContent = L[1]; el.classList.add('on');
      clearTimeout(t); t = setTimeout(function () { el.classList.remove('on'); }, 2400 + L[1].length * 45);
    };
  }
  return { create: create, chat: chat, bubble: bubble };
})();
