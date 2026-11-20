/* Hydration Puck stage: same studio light and floor reflection as Roam.
   Reads its camera from the canvas's camera-orbit attribute ("θdeg φdeg auto"), so the story scroll drives it. */
(function () {
  var cv = document.getElementById('puckmv');
  if (!cv || !window.THREE || !THREE.GLTFLoader) return;
  var renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true }); } catch (e) { return; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.outputEncoding = THREE.sRGBEncoding; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.25;
  renderer.setClearColor(0x000000, 0);
  var scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(26, 1, 5, 5000);
  (function () {
    var es = new THREE.Scene();
    es.add(new THREE.Mesh(new THREE.BoxGeometry(2000, 1400, 2000), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.03, 0.03, 0.04), side: THREE.BackSide })));
    function panel(w, h, x, y, z, c, rx, ry) { var m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: c, side: THREE.DoubleSide })); m.position.set(x, y, z); m.rotation.set(rx || 0, ry || 0, 0); es.add(m); }
    panel(1000, 800, 0, 690, 100, new THREE.Color(9, 9, 9.5), Math.PI / 2, 0);
    panel(260, 1100, -990, 200, 260, new THREE.Color(7, 7, 7.4), 0, Math.PI / 2);
    panel(260, 1100, 990, 200, 260, new THREE.Color(5, 5, 5.4), 0, -Math.PI / 2);
    panel(500, 900, -700, 200, -900, new THREE.Color(0.8, 1.2, 6), 0, Math.PI / 4);
    panel(1400, 220, 0, 300, 990, new THREE.Color(2.2, 2.2, 2.4), 0, Math.PI);
    try { var pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromScene(es, 0.04).texture; pm.dispose(); } catch (e) {}
  })();
  scene.add(new THREE.HemisphereLight(0xdfe6ff, 0x05060a, 0.3));
  var key = new THREE.DirectionalLight(0xffffff, 1.4); key.position.set(-240, 520, 420); scene.add(key);
  var rim = new THREE.PointLight(0x4a68ff, 2.4, 900, 1.5); rim.position.set(120, 140, -220); scene.add(rim);

  var model = null, mirror = null, R = 70, H = 0;
  var cur = { th: -60, ph: 62 }, tgt = { th: -60, ph: 62 }, drag = null, userTh = 0;
  function readOrbit() { var a = (cv.getAttribute('camera-orbit') || '').match(/(-?[\d.]+)deg\s+(-?[\d.]+)deg/); if (a) { tgt.th = +a[1]; tgt.ph = +a[2]; } }
  readOrbit(); cur.th = tgt.th; cur.ph = tgt.ph;
  new MutationObserver(readOrbit).observe(cv, { attributes: true, attributeFilter: ['camera-orbit'] });

  new THREE.GLTFLoader().load(cv.getAttribute('data-src'), function (g) {
    model = g.scene;
    var b = new THREE.Box3().setFromObject(model), c = b.getCenter(new THREE.Vector3()), s = b.getSize(new THREE.Vector3());
    model.position.set(-c.x, -b.min.y, -c.z);
    var wrap = new THREE.Group(); wrap.add(model); model = wrap; scene.add(model);
    R = Math.max(s.x, s.z) / 2; H = s.y;
    model.traverse(function (o) { if (o.isMesh && o.material) { o.material.envMapIntensity = 1.4; } });
    mirror = model.clone(true);
    mirror.traverse(function (o) { if (o.isMesh) { var m = o.material.clone(); m.transparent = true; m.opacity = 0.2; m.depthWrite = false; m.side = THREE.DoubleSide; o.material = m; o.renderOrder = -1; } });
    mirror.scale.y = -1; scene.add(mirror);
    cv.classList.add('ready');
  });

  cv.addEventListener('pointerdown', function (e) { drag = { x: e.clientX, th: userTh }; cv.setPointerCapture(e.pointerId); });
  cv.addEventListener('pointermove', function (e) { if (drag) userTh = drag.th - (e.clientX - drag.x) * 0.45; });
  cv.addEventListener('pointerup', function () { drag = null; });

  var vis = true;
  if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { vis = es[0].isIntersecting; }, { rootMargin: '200px' }).observe(cv);
  var w0 = 0, h0 = 0;
  function frame() {
    requestAnimationFrame(frame);
    if (!vis) return;
    var w = cv.clientWidth, h = cv.clientHeight;
    if (w !== w0 || h !== h0) { w0 = w; h0 = h; renderer.setSize(w, h, false); camera.aspect = w / Math.max(1, h); camera.updateProjectionMatrix(); }
    cur.th += (tgt.th + userTh - cur.th) * 0.06; cur.ph += (tgt.ph - cur.ph) * 0.06;
    var th = cur.th * Math.PI / 180, ph = Math.min(84, Math.max(30, cur.ph)) * Math.PI / 180;
    var d = (R * 2.0) / Math.tan(13 * Math.PI / 180) / Math.min(1, camera.aspect), cy = H * 0.05;
    camera.position.set(Math.sin(th) * Math.sin(ph) * d, cy + Math.cos(ph) * d, Math.cos(th) * Math.sin(ph) * d);
    camera.lookAt(0, cy, 0);
    renderer.render(scene, camera);
  }
  frame();
})();
