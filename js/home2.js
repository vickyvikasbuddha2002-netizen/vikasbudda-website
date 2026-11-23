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
  if (!window.THREE || !window.Roam2) { cv.style.display = 'none'; doc.body.classList.remove('dark'); return; }
  var R;
  try { R = Roam2(cv, { reduced: RM, asleep: true, light: 0 }); } catch (e) { cv.style.display = 'none'; doc.body.classList.remove('dark'); return; }
  var intro = $('.intro'), t1 = $('#t1'), t2 = $('#t2'), cue = $('#cue'), work = $('#work');
  var introP = 0, D0 = [11, 11, 12], D1 = [242, 241, 238];
  R.frame(function (a) { var d = Math.max(1120, 660 / a), u = 1 - ss(.25, .9, introP); return { d: d * (1 - .22 * u), y: 64, ty: 60 + 30 * u }; });
  setTimeout(function () { R.wake(); chirp(2); }, 900);

  function onScroll() {
    var vh = innerHeight, h = intro.offsetHeight - vh;
    introP = clamp(scrollY / Math.max(1, h), 0, 1);
    var k = ss(.28, .72, introP);
    R.light(ss(.22, .7, introP));
    doc.body.style.backgroundColor = 'rgb(' + mix(D0, D1, k).join(',') + ')';
    doc.body.classList.toggle('dark', k < .5);
    t1.style.opacity = 1 - ss(.12, .38, introP); t1.style.transform = 'translateY(' + (-introP * 60) + 'px)';
    t2.style.opacity = ss(.55, .8, introP); t2.style.transform = 'translateY(' + (20 - 20 * ss(.55, .8, introP)) + 'px)'; t2.style.color = 'var(--ink)';
    cue.style.opacity = 1 - ss(0, .12, introP);
    if (!active) R.pose({ yaw: -.5 * ss(.3, .9, introP), z: 0, x: 0, tilt: 0 });
    var wt = work.getBoundingClientRect().top;
    cv.style.opacity = wt < -40 ? '0' : String(clamp(wt / (vh * .7), 0, 1));
  }
  addEventListener('scroll', onScroll, { passive: true }); addEventListener('resize', onScroll); onScroll();

  /* gaze */
  var lastMove = -9;
  addEventListener('pointermove', function (e) { if (e.pointerType === 'touch') return; lastMove = performance.now(); R.follow = true; var f = active && active.dataset.follow ? 1 : .55; R.look((e.clientX / innerWidth * 2 - 1) * f * 1.1, (e.clientY / innerHeight * 2 - 1.1) * f * .8); }, { passive: true });
  setInterval(function () { if (performance.now() - lastMove > 2500) R.follow = false; }, 500);

  /* steps */
  var active = null, capT, poses = { see: { yaw: -.25 }, knock: { yaw: 0 }, read: { yaw: .35 }, guard: { yaw: 0 }, talk: { yaw: -.2 }, acc: { yaw: -.55 }, mood: { yaw: .2 }, spec: { yaw: .9 } }, timers = [];
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
    if (!sec) { R.mood('calm'); R.accessory(null); return; }
    sec.classList.add('on', 'seen');
    var st = sec.dataset.step; R.mood(sec.dataset.mood || 'calm'); R.pose(Object.assign({ x: 0, z: 0, tilt: 0, lift: 0 }, poses[st] || {}));
    if (st !== 'acc') { R.accessory(null); $$('[data-acc]').forEach(function (b) { b.classList.remove('on'); }); }
    $$('.pill.on', sec).forEach(function (b) { if (!b.dataset.acc && !b.dataset.moodSet) b.classList.remove('on'); });
    $$('.cap', sec).forEach(function (c) { c.textContent = ''; });
  }
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
    ar: function () { openModel('Roam', 'assets/roam.glb'); setTimeout(function () { try { if (mvm.canActivateAR) mvm.activateAR(); } catch (e) {} }, 400); }
  };
  $$('[data-act]').forEach(function (b) { var a = acts[b.dataset.act]; if (a && b.dataset.act !== 'knock') b.addEventListener('click', function () { clearLater(); a(); }); });
  doc.addEventListener('dblclick', function (e) { if (e.target.closest('button,a,input,form')) return; knock(e.clientX < innerWidth / 2 ? -1 : 1); });

  /* accessories */
  var ACC = { plant: ['plant', -.5, 'Wee!', "A plant! I'll find it the sunniest spot on your desk."], phone: ['phone', -2.35, 'Bi-bi!', "Priya is calling. I'll turn the screen toward you."], flag: ['guard', -.35, 'Tok.', 'Desk taken. Back at 2:30.'], notes: ['curious', -.6, 'Ki-bi?', 'Someone left you a note on my tray.'], '': ['calm', -.55, 'Mm.', 'Back to plain Roam.'] };
  $$('[data-acc]').forEach(function (b) { b.addEventListener('click', function () { var k = b.dataset.acc, a = ACC[k]; $$('[data-acc]').forEach(function (x) { x.classList.toggle('on', x === b && !!k); }); R.accessory(k || null); R.mood(a[0]); R.pose({ yaw: a[1] }); if (k) R.bounce(); cap(a[2], a[3]); }); });

  /* moods */
  $$('[data-mood-set]').forEach(function (b) { b.addEventListener('click', function () { var m = b.dataset.moodSet; $$('[data-mood-set]').forEach(function (x) { x.classList.toggle('on', x === b); }); R.mood(m); active.dataset.mood = m; if (m === 'happy' || m === 'love' || m === 'surprised') R.bounce(); else if (m === 'guard') R.wiggle(); chirp(m === 'sleepy' ? 1 : 2); }); });

  /* talk */
  var JOKES = [['Ki-ki-ki!', 'Why did the robot go on holiday? It needed to recharge.'], ['Ki-ki!', 'I told my battery a joke. It did not get the current.'], ['Bi-hi-hi!', 'I tried to catch fog yesterday. Mist.']], jk = 0;
  var REPLIES = [
    [/\b(hi|hello|hey|yo|hii+)\b/, 'happy', 'Bi-dwee!', 'Hi! I was hoping you would stop by.'],
    [/joke|funny|laugh/, 'happy', null, null],
    [/stress|tired|sad|anxious|overwhelm|bad day|upset/, 'sad', 'Oo-mm.', 'Deep breath with me. I can hold your visitors for ten minutes.'],
    [/what can you do|help|feature|abilit/, 'curious', 'Bi-bi-doo?', 'I come when you knock, guard your desk, keep notes, mirror your posture and remind you to drink water.'],
    [/water|drink|thirst/, 'curious', 'Ki-oo?', 'Your bottle has not moved in an hour. Sip?'],
    [/love|cute|like you|adorable/, 'love', 'Mii-mii.', 'Stop it. My face is turning pink.'],
    [/name|who are you/, 'proud', 'Ro-am!', 'I am Roam. I live on desks. Yours, ideally.'],
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
