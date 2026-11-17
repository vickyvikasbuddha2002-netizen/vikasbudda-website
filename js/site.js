(function () {
  var D = window.DATA, doc = document, $ = function (s, r) { return (r || doc).querySelector(s); }, $$ = function (s, r) { return Array.prototype.slice.call((r || doc).querySelectorAll(s)); };
  var RM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches, FINE = window.matchMedia && matchMedia('(hover:hover) and (pointer:fine)').matches;
  function el(t, c, x) { var e = doc.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function ss(a, b, v) { var t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); }

  /* loader */
  var ld = $('.loader'), pct = 0;
  function setL(p) { pct = Math.max(pct, p); if (ld) { $('.bar i', ld).style.width = pct + '%'; $('.nm span:last-child', ld).textContent = Math.round(pct) + '%'; } }
  var ramp = setInterval(function () { setL(Math.min(90, pct + 4 + Math.random() * 8)); }, 90);
  function done() { clearInterval(ramp); setL(100); setTimeout(function () { doc.documentElement.classList.add('ready'); kick(); }, 260); }
  if (doc.readyState === 'complete') done(); else window.addEventListener('load', done);
  setTimeout(done, 4500);
  var kicked = false;
  function kick() { if (kicked) return; kicked = true; $$('.hero [data-r], .hero .split').forEach(function (e) { e.classList.add('in'); }); }

  /* split words */
  $$('.split').forEach(function (h) {
    var words = h.textContent.trim().split(/\s+/), base = parseFloat(h.dataset.dl || 0); h.textContent = '';
    words.forEach(function (w, i) { var o = el('span', 'w'), s = el('span', '', w); s.style.setProperty('--dl', (base + i * 0.08) + 's'); o.appendChild(s); h.appendChild(o); if (i < words.length - 1) h.appendChild(doc.createTextNode(' ')); });
  });
  $$('[data-stagger]').forEach(function (p) { var st = parseFloat(p.dataset.stagger) || 0.08; Array.prototype.forEach.call(p.children, function (c, i) { if (!c.hasAttribute('data-r')) c.setAttribute('data-r', ''); c.style.setProperty('--dl', (i * st) + 's'); }); });

  /* reveal on scroll */
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }) : null;
  function watch(root) { $$('[data-r]:not(.in), .split:not(.in)', root).forEach(function (e) { if (e.closest('.hero')) return; if (io) io.observe(e); else e.classList.add('in'); }); }

  /* nav, progress, active link, menu */
  var bar = $('.progress'), links = $$('.links a[href^="#"]');
  var secs = links.map(function (a) { return $(a.getAttribute('href')); });
  function onScroll() {
    var y = window.scrollY, h = doc.documentElement.scrollHeight - innerHeight;
    doc.documentElement.classList.toggle('scrolled', y > 30);
    if (bar) bar.style.transform = 'scaleX(' + (h > 0 ? y / h : 0) + ')';
    var cur = -1; secs.forEach(function (s, i) { if (s && s.getBoundingClientRect().top < innerHeight * 0.45) cur = i; });
    links.forEach(function (a, i) { a.classList.toggle('on', i === cur); });
  }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  var mb = $('.menu-btn');
  if (mb) { mb.addEventListener('click', function () { var o = doc.documentElement.classList.toggle('menu-open'); mb.textContent = o ? 'Close' : 'Menu'; mb.setAttribute('aria-expanded', o); });
    $$('.menu a').forEach(function (a) { a.addEventListener('click', function () { doc.documentElement.classList.remove('menu-open'); mb.textContent = 'Menu'; mb.setAttribute('aria-expanded', 'false'); }); }); }

  /* cursor glow, magnetic buttons, spotlight cards */
  var mouse = { x: innerWidth / 2, y: innerHeight / 2, nx: 0, ny: 0 };
  window.addEventListener('pointermove', function (e) { mouse.x = e.clientX; mouse.y = e.clientY; mouse.nx = e.clientX / innerWidth * 2 - 1; mouse.ny = e.clientY / innerHeight * 2 - 1; }, { passive: true });
  var cg = $('.cglow');
  if (cg && FINE && !RM) { cg.classList.add('on'); var gx = mouse.x, gy = mouse.y; (function loop() { gx += (mouse.x - gx) * 0.12; gy += (mouse.y - gy) * 0.12; cg.style.transform = 'translate(' + gx + 'px,' + gy + 'px)'; requestAnimationFrame(loop); })(); }
  if (FINE && !RM) $$('.btn').forEach(function (b) {
    b.addEventListener('pointermove', function (e) { var r = b.getBoundingClientRect(); b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.18) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.28) + 'px)'; });
    b.addEventListener('pointerleave', function () { b.style.transform = ''; });
  });
  function spot(c) {
    c.addEventListener('pointermove', function (e) {
      var r = c.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      c.style.setProperty('--mx', x + 'px'); c.style.setProperty('--my', y + 'px');
      if (FINE && !RM && c.classList.contains('tilt')) c.style.transform = 'translateY(-6px) perspective(900px) rotateX(' + ((y / r.height - 0.5) * -6) + 'deg) rotateY(' + ((x / r.width - 0.5) * 8) + 'deg)';
    });
    c.addEventListener('pointerleave', function () { c.style.transform = ''; });
  }

  /* counters */
  function count(e) {
    var to = parseFloat(e.dataset.count), dec = (e.dataset.count.split('.')[1] || '').length, t0 = null, dur = 1600;
    if (RM) { e.textContent = to.toFixed(dec); return; }
    (function step(t) { if (!t0) t0 = t; var k = Math.min(1, (t - t0) / dur), v = to * (1 - Math.pow(1 - k, 4)); e.textContent = v.toFixed(dec); if (k < 1) requestAnimationFrame(step); })(performance.now());
  }
  var cio = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) { es.forEach(function (x) { if (x.isIntersecting) { count(x.target); cio.unobserve(x.target); } }); }, { threshold: 0.6 }) : null;
  $$('[data-count]').forEach(function (e) { if (cio) cio.observe(e); else count(e); });

  /* model dialog */
  var dlg = $('#viewer');
  function openModel(title, src) {
    if (!dlg) return; $('h3', dlg).textContent = title; var mv = $('model-viewer', dlg); mv.setAttribute('src', src); mv.setAttribute('alt', '3D model of ' + title);
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', ''); requestAnimationFrame(function () { dlg.classList.add('show'); });
  }
  function closeModel() { dlg.classList.remove('show'); setTimeout(function () { if (dlg.close) dlg.close(); else dlg.removeAttribute('open'); }, 300); }
  if (dlg) { $('.close', dlg).addEventListener('click', closeModel); dlg.addEventListener('click', function (e) { if (e.target === dlg) closeModel(); }); }
  $$('[data-open-model]').forEach(function (b) { b.addEventListener('click', function () { openModel(b.dataset.title, b.dataset.openModel); }); });

  /* CAD practice track */
  var track = $('#track');
  if (track) {
    D.practice.forEach(function (w) {
      var c = el('article', 'card tilt'), v = el('div', 'v');
      if (w.model) {
        var mv = doc.createElement('model-viewer');
        [['src', w.model], ['alt', '3D model of ' + w.title], ['loading', 'lazy'], ['reveal', 'auto'], ['auto-rotate', ''], ['rotation-per-second', '16deg'], ['interaction-prompt', 'none'], ['environment-image', 'neutral'], ['exposure', '1.1'], ['shadow-intensity', '0.8'], ['camera-orbit', '35deg 68deg auto']].forEach(function (a) { mv.setAttribute(a[0], a[1]); });
        v.appendChild(mv);
        var o = el('button', 'open', 'Open in 3D'); o.type = 'button'; o.addEventListener('click', function () { openModel(w.title, w.model); }); c.appendChild(o);
      } else { var d = el('div', 'doc', 'PDF'); v.appendChild(d); var a = el('a', 'open', 'Open PDF'); a.href = w.doc; a.target = '_blank'; a.rel = 'noopener'; c.appendChild(a); }
      c.appendChild(v);
      var m = el('div', 'm'); m.appendChild(el('h3', '', w.title)); m.appendChild(el('p', '', w.tool + '. ' + w.sub)); c.appendChild(m);
      c.setAttribute('data-r', ''); track.appendChild(c); spot(c);
    });
    $$('.card', track).forEach(function (c, i) { c.style.setProperty('--dl', (i * 0.07) + 's'); });
    var tb = $('.trackbar i');
    function tbar() { var max = track.scrollWidth - track.clientWidth, f = track.clientWidth / track.scrollWidth; if (tb) { tb.style.width = (f * 100) + '%'; tb.style.transform = 'translateX(' + (max > 0 ? track.scrollLeft / max * (1 / f - 1) * 100 : 0) + '%)'; } }
    track.addEventListener('scroll', tbar, { passive: true }); window.addEventListener('resize', tbar); tbar();
    var down = false, sx = 0, sl = 0, moved = 0;
    track.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse' || e.target.closest('button,a')) return; down = true; moved = 0; sx = e.clientX; sl = track.scrollLeft; track.classList.add('drag'); });
    window.addEventListener('pointermove', function (e) { if (!down) return; moved = Math.abs(e.clientX - sx); track.scrollLeft = sl - (e.clientX - sx); });
    window.addEventListener('pointerup', function () { down = false; track.classList.remove('drag'); });
  }

  /* notes */
  var notes = D.notes.slice().sort(function (a, b) { return b.createdAt.localeCompare(a.createdAt); });
  function ncard(n, i) {
    var a = el('a', 'ncard'); a.href = 'note.html#' + n.id;
    a.appendChild(el('span', 'num', String(i + 1).padStart(2, '0')));
    a.appendChild(el('span', 'tp', n.topic)); a.appendChild(el('h3', '', n.title)); a.appendChild(el('p', '', n.summary));
    var f = el('div', 'ft'); f.appendChild(el('span', '', n.readTime + ' read')); f.appendChild(el('b', '', 'Read')); a.appendChild(f);
    a.setAttribute('data-r', ''); a.style.setProperty('--dl', (i % 3 * 0.1) + 's'); spot(a); return a;
  }
  var ng = $('#ngrid');
  if (ng) {
    var lim = +(ng.dataset.limit || 0), tabs = $('#tabs'), topic = 'All';
    function drawN() { ng.innerHTML = ''; notes.filter(function (n) { return topic === 'All' || n.topic === topic; }).slice(0, lim || 99).forEach(function (n, i) { ng.appendChild(ncard(n, i)); }); watch(ng); if (tabs) $$('button', tabs).forEach(function (b) { b.setAttribute('aria-pressed', b.textContent === topic); }); }
    if (tabs) ['All'].concat(Array.from(new Set(notes.map(function (n) { return n.topic; })))).forEach(function (t) { var b = el('button', '', t); b.type = 'button'; b.addEventListener('click', function () { topic = t; drawN(); }); tabs.appendChild(b); });
    drawN();
  }

  /* certificates */
  var cl = $('#certs');
  if (cl) D.certs.forEach(function (c) {
    var li = el('li'), l = el('span'); l.appendChild(doc.createTextNode(c.title + ', ' + c.issuer + ' '));
    if (c.file) { var a = el('a', '', 'View'); a.href = c.file; a.target = '_blank'; a.rel = 'noopener'; l.appendChild(a); }
    li.appendChild(l); li.appendChild(el('span', '', c.date)); cl.appendChild(li);
  });

  /* experience timeline fill */
  var tl = $('.tl');
  function tlUpdate() {
    if (!tl) return; var r = tl.getBoundingClientRect(), p = clamp((innerHeight * 0.7 - r.top) / r.height, 0, 1);
    $('.fill', tl).style.height = 'calc(' + (p * 100) + '% - 16px)';
    $$('.job', tl).forEach(function (j) { j.classList.toggle('lit', j.getBoundingClientRect().top < innerHeight * 0.7); });
  }

  /* hydration puck: turn with scroll */
  var pmv = $('#puckmv'), puck = pmv ? pmv.closest('section') : null;
  function puckUpdate() {
    if (!pmv || !puck || RM) return; var r = puck.getBoundingClientRect(), p = clamp(1 - (r.top + r.height / 2) / (innerHeight + r.height / 2), 0, 1);
    pmv.setAttribute('camera-orbit', (-60 + p * 160).toFixed(1) + 'deg ' + (62 + p * 10).toFixed(1) + 'deg auto');
  }

  /* 3D: hero and the exploded Roam */
  var heroApi = null, roamApi = null, roamSec = $('.roam');
  if (window.THREE && window.ROAMB && window.RoamStage) {
    var hc = $('#hero3d');
    if (hc) {
      heroApi = RoamStage.create(hc, { fov: 22 });
      if (heroApi) {
        var hrot = 0;
        heroApi.update = function (dt, t) {
          var sy = window.scrollY / innerHeight;
          var tr = (RM ? 0.5 : Math.sin(t * 0.45) * 0.38 + 0.35) + mouse.nx * 0.35;
          hrot += (tr - hrot) * 0.05; heroApi.root.rotation.y = hrot;
          heroApi.root.position.y = -53;
          var d = innerWidth < 700 ? 480 : 400;
          heroApi.camera.position.set(0, 40 + sy * 60, d + sy * 120); heroApi.camera.lookAt(0, -14 + sy * 30, 0);
          heroApi.look.tx = mouse.nx * 0.9; heroApi.look.ty = mouse.ny * 0.7;
        };
        var hb = $('.stage .bubble');
        if (hb) RoamStage.chat({ api: heroApi, say: function (L) { heroApi.setMood(L[0]); RoamStage.bubble(hb)(L); }, first: 2600, lines: [
          ['happy', 'Hi there. What brings you here?', ['bi', 'dwee']],
          ['listen', 'Are you hiring? I know a good engineer.', ['ki', 'bi', 'oo']],
          ['wink', 'Scroll down. I have a page where you can play with me.', ['zip', 'ki']],
          ['love', 'You have a nice face. I can tell.', ['mii', 'mii']],
          ['listen', 'What are you building these days?', ['dwee', 'ki']],
          ['proud', 'Vikas designed me from scratch. Want to see?', ['bi', 'nya', 'bi']],
          ['surprised', 'Wait, did you just smile?', ['zip', 'dwee']],
          ['happy', 'Is it day or night where you are?', ['oo', 'ki']],
          ['sleepy', 'If you stop moving, I might take a nap.', ['oo', 'wub']],
          ['listen', 'Cats or robots? Think carefully.', ['ki', 'tok', 'ki']]
        ] });
      }
    }
    var rc = $('#roam3d');
    if (rc) {
      roamApi = RoamStage.create(rc, { fov: 22 });
      if (roamApi) {
        var rsec = rc.closest('section'), rr0 = 0;
        roamApi.update = function (dt, t) {
          var r = rsec.getBoundingClientRect(), p = clamp(1 - (r.top + r.height / 2) / (innerHeight + r.height / 2), 0, 1);
          rr0 += ((RM ? 0.4 : -0.9 + p * 1.9) - rr0) * 0.08;
          roamApi.root.rotation.y = rr0 + Math.sin(t * 0.6) * 0.04;
          roamApi.root.position.y = -53;
          roamApi.camera.position.set(0, 52, 430); roamApi.camera.lookAt(0, -12, 0);
          var b = rc.getBoundingClientRect(); roamApi.look.tx = clamp((mouse.x - b.left - b.width / 2) / b.width * 2, -1, 1); roamApi.look.ty = clamp((mouse.y - b.top - b.height / 2) / b.height * 2, -1, 1);
          roamApi.wheels.forEach(function (w) { w.rotation.x = p * 9; });
        };
        var rb = rc.parentNode.querySelector('.bubble'), rbusy = false;
        if (rb) RoamStage.chat({ api: roamApi, busy: function () { return rbusy; }, say: function (L) { roamApi.setMood(L[0]); RoamStage.bubble(rb)(L); }, first: 1500, lines: [
          ['happy', 'Hey, you. Want to play?', ['bi', 'dwee']],
          ['listen', 'Tap me. I will show you what I can do.', ['ki', 'bi']],
          ['wink', 'I can hear which side you clap from. Try me.', ['zip', 'ki']],
          ['proud', 'I never fall off a desk. Ever.', ['bi', 'nya']],
          ['love', 'Do you have a desk I could live on?', ['mii', 'dwee']],
          ['listen', 'Do you know my name yet? It is Roam.', ['doo', 'ki']]
        ] });
        rc.parentNode.addEventListener('pointerenter', function () { rbusy = true; roamApi.setMood('happy'); });
        rc.parentNode.addEventListener('pointerleave', function () { rbusy = false; roamApi.setMood('calm'); });
      }
    }
  }
  if (!heroApi) { var hs = $('#hero3d'); if (hs) hs.parentNode.classList.add('nogl'); }

  function tick() { tlUpdate(); puckUpdate(); }
  window.addEventListener('scroll', tick, { passive: true }); window.addEventListener('resize', tick); tick();
  watch(doc);

  /* single note */
  var art = $('#note');
  if (art) {
    function show() {
      var id = location.hash.slice(1), n = notes.filter(function (x) { return x.id === id; })[0] || notes[0];
      doc.title = n.title + ' | Vikas Budda';
      $('.tp', art).textContent = n.topic; $('h1', art).textContent = n.title; $('.by', art).textContent = new Date(n.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) + ', ' + n.readTime + ' read';
      var b = $('.body', art); b.innerHTML = ''; renderBody(n.body, b);
      var i = notes.indexOf(n), nx = notes[(i + 1) % notes.length], a = $('.nextn', art); a.href = 'note.html#' + nx.id; $('b', a).textContent = nx.title;
      window.scrollTo(0, 0);
    }
    window.addEventListener('hashchange', show); show();
  }
  function fig(key) { var f = (window.FIGS || {})[key]; if (!f) return null; var e = el('figure', 'fig'), s = el('div', 'fig-scroll'); s.innerHTML = f.svg; e.appendChild(s); var c = el('figcaption'); c.appendChild(el('b', '', f.caption[0])); c.appendChild(doc.createTextNode(f.caption[1] || '')); e.appendChild(c); return e; }
  function inl(t, n) { String(t).split(/(`[^`]+`)/).forEach(function (p) { if (p.length > 2 && p[0] === '`' && p[p.length - 1] === '`') n.appendChild(el('code', '', p.slice(1, -1))); else if (p) n.appendChild(doc.createTextNode(p)); }); }
  function renderBody(text, T) {
    String(text || '').replace(/\r\n/g, '\n').split(/\n{2,}/).forEach(function (blk) {
      var L = blk.split('\n').filter(function (l) { return l.trim(); }); if (!L.length) return;
      var fm = L.length === 1 && L[0].trim().match(/^\[fig:([a-z0-9-]+)\]$/); if (fm) { var f = fig(fm[1]); if (f) T.appendChild(f); return; }
      if (L.length > 1 && L.every(function (l) { return l.trim()[0] === '|'; })) {
        var rows = L.map(function (l) { return l.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map(function (c) { return c.trim(); }); }).filter(function (c) { return !c.every(function (x) { return /^:?-{2,}:?$/.test(x); }); });
        var w = el('div', 'table-wrap'), tb = el('table', 'data-table'), th = el('thead'), hr = el('tr'); rows[0].forEach(function (c) { var h = el('th'); inl(c, h); hr.appendChild(h); }); th.appendChild(hr); tb.appendChild(th);
        var bd = el('tbody'); rows.slice(1).forEach(function (r) { var tr = el('tr'); r.forEach(function (c) { var td = el('td'); inl(c, td); tr.appendChild(td); }); bd.appendChild(tr); }); tb.appendChild(bd); w.appendChild(tb); T.appendChild(w); return;
      }
      if (L.every(function (l) { return /^\s*[-*]\s+/.test(l); })) { var ul = el('ul'); L.forEach(function (l) { var li = el('li'); inl(l.replace(/^\s*[-*]\s+/, ''), li); ul.appendChild(li); }); T.appendChild(ul); return; }
      if (/^\s*#{2,3}\s+/.test(L[0])) { T.appendChild(el('h3', '', L[0].replace(/^\s*#{2,3}\s+/, ''))); L.slice(1).forEach(function (l) { var p = el('p'); inl(l, p); T.appendChild(p); }); return; }
      var p = el('p'); inl(L.join(' '), p); T.appendChild(p);
    });
  }
  var y = $('#year'); if (y) y.textContent = new Date().getFullYear();
})();
