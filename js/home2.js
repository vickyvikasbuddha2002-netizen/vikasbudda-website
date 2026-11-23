(function () {
  var doc = document, $ = function (s, r) { return (r || doc).querySelector(s); }, $$ = function (s, r) { return [].slice.call((r || doc).querySelectorAll(s)); };
  var RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function ss(a, b, v) { var t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); }
  function mix(a, b, k) { return a.map(function (x, i) { return Math.round(x + (b[i] - x) * k); }); }
  $('#year').textContent = new Date().getFullYear();

  /* toast + copy */
  var toastT, toast = $('.toast');
  function say(t) { toast.textContent = t; toast.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(function () { toast.classList.remove('on'); }, 2200); }
  $$('[data-copy]').forEach(function (b) { b.addEventListener('click', function () { (navigator.clipboard ? navigator.clipboard.writeText(b.dataset.copy) : Promise.reject()).then(function () { say('Email copied'); }, function () { say(b.dataset.copy); }); }); });

  /* sound */
  var snd = $('.snd'), soundOn = false, ac = null;
  snd.addEventListener('click', function () { soundOn = !soundOn; snd.textContent = soundOn ? 'Sound on' : 'Sound off'; snd.setAttribute('aria-pressed', soundOn); if (soundOn) chirp(2); });
  function chirp(n) {
    if (!soundOn) return; try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; }
    var t = ac.currentTime; for (var i = 0; i < (n || 2); i++) { var o = ac.createOscillator(), g = ac.createGain(), f = 700 + Math.random() * 700; o.type = 'sine'; o.frequency.setValueAtTime(f, t + i * .11); o.frequency.exponentialRampToValueAtTime(f * (Math.random() > .5 ? 1.6 : .7), t + i * .11 + .09); g.gain.setValueAtTime(0, t + i * .11); g.gain.linearRampToValueAtTime(.06, t + i * .11 + .015); g.gain.exponentialRampToValueAtTime(.001, t + i * .11 + .1); o.connect(g); g.connect(ac.destination); o.start(t + i * .11); o.stop(t + i * .11 + .12); }
  }

  /* model viewer dialog */
  var dlg = $('#mv'), mvm = $('#mvm');
  function openModel(title, src) { $('.mvt', dlg).textContent = title; mvm.setAttribute('src', src); mvm.setAttribute('alt', '3D model of ' + title); if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', ''); }
  $('.x', dlg).addEventListener('click', function () { dlg.close ? dlg.close() : dlg.removeAttribute('open'); });
  dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });

  /* CAD rows */
  var cad = $('#cad');
  (window.DATA && DATA.practice || []).forEach(function (w) {
    var li = doc.createElement('li'), d = doc.createElement('div'), b = doc.createElement('b'), s = doc.createElement('span');
    b.textContent = w.title; s.textContent = w.tool; d.appendChild(b); d.appendChild(s); li.appendChild(d);
    if (w.model) { var bt = doc.createElement('button'); bt.type = 'button'; bt.textContent = 'View in 3D'; bt.addEventListener('click', function () { openModel(w.title, w.model); }); li.appendChild(bt); }
    else if (w.doc) { var a = doc.createElement('a'); a.className = 'lnk'; a.href = w.doc; a.target = '_blank'; a.rel = 'noopener'; a.textContent = 'Open PDF'; li.appendChild(a); }
    cad.appendChild(li);
  });

  /* robot */
  var cv = $('#roam');
  if (!window.THREE || !window.Roam2) { cv.style.display = 'none'; return; }
  var R;
  try { R = Roam2(cv, { reduced: RM, asleep: true, light: 0 }); } catch (e) { cv.style.display = 'none'; return; }
  var about = $('#about'), cue = $('#cue'), hz = $('.horizon'), heroOn = true;
  var cam = { d: 1, x: .38, y: -.04 }, camT = { d: 1, x: .38, y: -.04 };
  var VIEWS = { hero: [1, .36, -.04, .93, 0, -.55], step: [1, .42, 0, 1, 0, -.1], design: [.74, .38, .03, .82, 0, -.06], eng: [1.4, .42, 0, 1.5, 0, -.05], ctl: [1, .42, 0, 1.45, 0, .16], list: [1, .42, 0, 1.9, 0, -.66] };
  function view(n) { var v = VIEWS[n] || VIEWS.step, m = innerWidth / innerHeight < .9; camT.d = m ? v[3] : v[0]; camT.x = m ? v[4] : v[1]; camT.y = m ? v[5] : v[2]; }
  R.frame(function (a) {
    var k = RM ? 1 : .05; cam.d += (camT.d - cam.d) * k; cam.x += (camT.x - cam.x) * k; cam.y += (camT.y - cam.y) * k;
    var base = a < .9 ? 640 / a : Math.max(720, 520 / a), d = base * cam.d, hh = .194 * d;
    return { d: d, y: 64, ty: 64 - cam.y * hh, ox: -cam.x * hh * a };
  });
  view('hero');
  /* reveal: lights come up out of the dark, then it wakes */
  (function () {
    var t0 = performance.now(), dur = RM ? 1 : 2200;
    (function up(now) { var u = clamp((now - t0) / dur, 0, 1); R.light(u * u * (3 - 2 * u)); if (u < 1) requestAnimationFrame(up); })(t0);
    setTimeout(function () { R.wake(); R.mood('happy'); chirp(2); setTimeout(function () { if (heroOn) R.mood('calm'); }, 1600); }, RM ? 0 : 1500);
  })();
  R.pose({ yaw: -.45 });

  function onScroll() {
    var vh = innerHeight;
    heroOn = scrollY < vh * .5;
    if (heroOn && !active) { view('hero'); R.pose({ yaw: -.45 + scrollY / vh * .4, x: 0, z: 0, tilt: 0, ex: 0 }); }
    cue.style.opacity = 1 - ss(0, vh * .15, scrollY);
    var wt = about.getBoundingClientRect().top, o = wt < -40 ? 0 : clamp(wt / (vh * .7), 0, 1);
    cv.style.opacity = String(o); hz.style.opacity = String(o);
  }
  addEventListener('scroll', onScroll, { passive: true }); addEventListener('resize', function () { onScroll(); if (active) view(VIEW_OF[active.dataset.step] || 'step'); else view('hero'); });

  /* gaze */
  var lastMove = -9;
  addEventListener('pointermove', function (e) { if (e.pointerType === 'touch') return; lastMove = performance.now(); R.follow = true; var f = active && active.dataset.follow ? 1 : .55; R.look((e.clientX / innerWidth * 2 - 1) * f * 1.1, (e.clientY / innerHeight * 2 - 1.1) * f * .8); }, { passive: true });
  setInterval(function () { if (performance.now() - lastMove > 2500) R.follow = false; }, 500);

  /* steps */
  var active = null, capT, poses = { overview: { yaw: -.35 }, see: { yaw: -.15 }, knock: { yaw: 0 }, read: { yaw: .3 }, guard: { yaw: 0 }, talk: { yaw: -.2 }, mood: { yaw: .15 }, design: { yaw: .62 }, eng: { yaw: -.55, ex: 1 }, elec: { yaw: .35 }, spec: { yaw: .9 } }, timers = [];
  function later(f, ms) { timers.push(setTimeout(f, ms)); }
  function clearLater() { timers.forEach(clearTimeout); timers = []; }
  function cap(rm, en, el) {
    el = el || (active && $('.cap', active)); var s = rm ? '<span class="rm">' + rm + '</span>' : '';
    if (el) { el.innerHTML = s; el.appendChild(doc.createTextNode(en)); } else say(en);
    R.talk(Math.min(3, .4 + en.length * .035)); chirp(rm ? Math.min(4, rm.split('-').length + 1) : 2);
  }
  function setStep(sec) {
    if (sec === active) return; clearLater();
    if (active) { active.classList.remove('on'); }
    active = sec;
    if (!sec) { R.mood('calm'); R.pose({ ex: 0 }); onScroll(); return; }
    sec.classList.add('on', 'seen');
    var st = sec.dataset.step; R.mood(sec.dataset.mood || 'calm'); R.pose(Object.assign({ x: 0, z: 0, tilt: 0, lift: 0, ex: 0 }, poses[st] || {})); view(VIEW_OF[st] || 'step');
    $$('.pill.on', sec).forEach(function (b) { if (!b.dataset.moodSet) b.classList.remove('on'); });
    $$('.cap', sec).forEach(function (c) { c.textContent = ''; });
  }
  var VIEW_OF = { design: 'design', eng: 'eng', talk: 'ctl', read: 'ctl', mood: 'ctl', guard: 'ctl', knock: 'ctl', elec: 'list', spec: 'list' };
  var steps = $$('.step');
  function pick() { var vh = innerHeight, best = null, bd = 1e9; steps.forEach(function (s) { var r = s.getBoundingClientRect(), c = r.top + r.height / 2, d = Math.abs(c - vh / 2); if (r.top < vh * .6 && r.bottom > vh * .4 && d < bd) { bd = d; best = s; } }); setStep(best); }
  addEventListener('scroll', pick, { passive: true }); pick();

  /* continuous behaviours */
  var t0 = performance.now();
  (function tick(now) {
    requestAnimationFrame(tick); var t = (now - t0) / 1000;
    if (active && active.dataset.scan && !active.busy) R.pose({ yaw: Math.sin(t * .7) * .65 });
    if (active && active.dataset.step === 'spec' && !RM) R.pose({ yaw: .9 + t * .25 });
  })(t0);

  /* tap the robot */
  var pats = [['Bi-dwee!', 'That tickles.'], ['Mii.', 'Again. Please.'], ['Ki-ki!', 'Hello, human.'], ['Bo-bo?', 'Did you need something?']];
  var tapT = 0, tapX = 0;
  cv.addEventListener('pointerdown', function (e) {
    var now = performance.now();
    if (active && active.dataset.step === 'knock' && now - tapT < 380) { knock(e.clientX < innerWidth / 2 ? -1 : 1); tapT = 0; return; }
    tapT = now; tapX = e.clientX;
    if (R.hit(e.clientX, e.clientY)) { var prev = R.cur, p = pats[Math.floor(Math.random() * pats.length)]; R.mood('happy'); R.bounce(); cap(p[0], p[1]); later(function () { R.mood(active ? active.dataset.mood : prev); }, 1800); }
  });

  /* knock */
  function knock(side) {
    if (!active || active.dataset.step !== 'knock') return; clearLater();
    R.mood('surprised'); R.wiggle();
    later(function () { R.pose({ yaw: side * .7 }); cap('Tok-tok?', 'Knock knock. Coming!'); }, 350);
    later(function () { R.pose({ z: 60, x: side * 22 }); R.mood('happy'); }, 1100);
    later(function () { R.pose({ yaw: 0 }); R.bounce(); cap('Bi-dwee!', 'You called?'); }, 2300);
    later(function () { R.pose({ z: 0, x: 0 }); R.mood('listen'); }, 5200);
  }
  $('[data-act="knock"]').addEventListener('click', function () { knock(Math.random() > .5 ? 1 : -1); });

  /* reads the room, guard */
  var acts = {
    slouch: function () { R.mood('sad'); R.pose({ tilt: .1, lift: -2 }); cap('Oo-doo.', "You're slouching. So am I."); },
    situp: function () { R.pose({ tilt: -.04, lift: 0 }); R.mood('proud'); R.bounce(); cap('Bi-dwee!', 'Sit tall. There we go.'); later(function () { R.pose({ tilt: 0 }); }, 900); },
    loud: function () { R.pose({ tilt: 0, lift: 0 }); R.mood('shh'); R.wiggle(); cap('Shh-shh.', 'A little softer. People are working.'); },
    long: function () { R.pose({ tilt: 0, lift: 0 }); R.mood('focus'); later(function () { R.mood('curious'); cap('Ki-oo?', 'Two hours straight. Water and a stretch?'); }, 700); },
    visitor: function () {
      var a = active; a.busy = true; clearLater(); R.mood('surprised'); R.pose({ yaw: 0 });
      later(function () { R.mood('guard'); R.pose({ z: 22 }); R.wiggle(); cap('Pah!', "Not your desk. I'm watching you."); }, 500);
      later(function () { R.pose({ z: 0 }); R.mood('happy'); R.bounce(); cap('Bi-dwee!', 'Welcome back. One visitor at 2:14 pm. They looked at your snacks.'); }, 3600);
      later(function () { a.busy = false; R.mood('guard'); }, 7600);
    },
    hello: function () { R.mood('happy'); R.bounce(); cap('Om-vi!', 'Hi. Scroll down, I will show you around.'); later(function () { R.mood('calm'); }, 2200); },
    ar: function () { openModel('Omvi', 'assets/omvi.glb'); setTimeout(function () { try { if (mvm.canActivateAR) mvm.activateAR(); } catch (e) {} }, 400); }
  };
  $$('[data-act]').forEach(function (b) { var a = acts[b.dataset.act]; if (a && b.dataset.act !== 'knock') b.addEventListener('click', function () { clearLater(); a(); }); });
  doc.addEventListener('dblclick', function (e) { if (e.target.closest('button,a,input,form')) return; knock(e.clientX < innerWidth / 2 ? -1 : 1); });

  /* moods */
  $$('[data-mood-set]').forEach(function (b) { b.addEventListener('click', function () { var m = b.dataset.moodSet; $$('[data-mood-set]').forEach(function (x) { x.classList.toggle('on', x === b); }); R.mood(m); active.dataset.mood = m; if (m === 'happy' || m === 'love' || m === 'surprised') R.bounce(); else if (m === 'guard') R.wiggle(); chirp(m === 'sleepy' ? 1 : 2); }); });

  /* talk */
  var JOKES = [['Ki-ki-ki!', 'Why did the robot go on holiday? It needed to recharge.'], ['Ki-ki!', 'I told my battery a joke. It did not get the current.'], ['Bi-hi-hi!', 'I tried to catch fog yesterday. Mist.']], jk = 0;
  var REPLIES = [
    [/\b(hi|hello|hey|yo|hii+)\b/, 'happy', 'Bi-dwee!', 'Hi! I was hoping you would stop by.'],
    [/joke|funny|laugh/, 'happy', null, null],
    [/stress|tired|sad|anxious|overwhelm|bad day|upset/, 'sad', 'Oo-mm.', 'Deep breath with me. I can hold your visitors for ten minutes.'],
    [/what can you do|help|feature|abilit/, 'curious', 'Bi-bi-doo?', 'I come when you knock, guard your desk, mirror your posture and remind you to drink water.'],
    [/water|drink|thirst/, 'curious', 'Ki-oo?', 'Your bottle has not moved in an hour. Sip?'],
    [/love|cute|like you|adorable/, 'love', 'Mii-mii.', 'Stop it. My face is turning pink.'],
    [/name|who are you/, 'proud', 'Om-vi!', 'I am Omvi. I live on desks. Yours, ideally.'],
    [/vikas|made you|built you|creator/, 'proud', 'Bi-dwee!', 'Vikas built me, from the shell to the wiring.'],
    [/focus|work|busy|meeting/, 'focus', 'Tok.', 'Focus mode on. I will shush anyone who comes by.'],
    [/sleep|night|bye|goodnight/, 'sleepy', 'Mmm-zz.', 'Goodnight. I will keep the desk warm.']
  ];
  function reply(q) {
    var s = q.toLowerCase(), r = null; REPLIES.some(function (x) { if (x[0].test(s)) { r = x; return true; } return false; });
    R.mood('listen'); $('.cap', active || $('[data-step=talk]')).textContent = '...';
    later(function () {
      if (!r) { R.mood('curious'); cap('Ki-oo?', 'I only know a few things in this demo. The real me will think with an AI model.'); return; }
      R.mood(r[1]); if (r[1] === 'happy' || r[1] === 'love') R.bounce();
      if (!r[2]) { var j = JOKES[jk++ % JOKES.length]; cap(j[0], j[1]); } else cap(r[2], r[3]);
    }, 650);
  }
  $$('[data-say]').forEach(function (b) { b.addEventListener('click', function () { clearLater(); reply(b.dataset.say); }); });
  $('.ask').addEventListener('submit', function (e) { e.preventDefault(); var i = $('#q'), v = i.value.trim(); if (!v) { i.focus(); return; } clearLater(); reply(v); i.value = ''; });
})();
