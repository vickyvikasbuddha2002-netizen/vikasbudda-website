(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); }, $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var RM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var cv = $('#play3d'); if (!cv || !window.THREE || !window.RoamStage) return;
  var R = RoamStage.create(cv, { fov: 22 }); if (!R) { $('.arena .hint').textContent = 'This browser could not start 3D graphics.'; return; }
  var THREE = window.THREE;

  /* Roamish: chirps you can hear, captions you can read */
  var AC = null, sound = true;
  function ac() { if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} } return AC; }
  var SY = { bi: [880, 1180, .09], dwee: [560, 1250, .2], doo: [420, 300, .16], ki: [1500, 1700, .06], mii: [1000, 1080, .18], zip: [700, 1900, .08], oo: [380, 460, .2], wub: [220, 160, .2], tok: [1200, 900, .04], nya: [900, 640, .14], pah: [520, 420, .08], vrr: [160, 150, .22] };
  function chirp(sylls) {
    var a = ac(); if (!a || !sound) return; var t = a.currentTime + 0.02;
    sylls.forEach(function (s) {
      var p = SY[s] || SY.bi, o = a.createOscillator(), g = a.createGain();
      o.type = s === 'vrr' ? 'sawtooth' : 'sine'; o.frequency.setValueAtTime(p[0], t); o.frequency.exponentialRampToValueAtTime(p[1], t + p[2]);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.16, t + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, t + p[2]);
      o.connect(g); g.connect(a.destination); o.start(t); o.stop(t + p[2] + 0.02); t += p[2] + 0.05;
    });
  }
  var bub = $('.bubble'), bt = 0;
  function say(syl, en) {
    $('.rm', bub).textContent = syl.join('-'); $('.en', bub).textContent = en; bub.classList.add('on');
    chirp(syl); clearTimeout(bt); bt = setTimeout(function () { bub.classList.remove('on'); }, 1800 + en.length * 45);
  }
  $('.snd').addEventListener('click', function () { sound = !sound; this.textContent = sound ? 'Sound on' : 'Sound off'; this.setAttribute('aria-pressed', sound); if (sound) ac(); });

  /* motion: a little timeline of poses */
  var S = { x: 0, z: 0, yaw: 0, lift: 0, tilt: 0, bob: 0 }, Q = [], cur = null, view = 0, dragV = 0, moodName = $('.moodtag');
  var MOODS = { calm: 'Calm', happy: 'Happy', love: 'In love', sleepy: 'Sleepy', surprised: 'Surprised', angry: 'Grumpy', sad: 'Sulking', wink: 'Cheeky', dizzy: 'Dizzy', scared: 'Scared', listen: 'Listening', proud: 'Proud' };
  function mood(m) { R.setMood(m); moodName.textContent = 'Feeling: ' + (MOODS[m] || m); }
  function run(steps) { Q = steps.slice(); cur = null; }
  function ease(k) { return k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; }
  var lastX = 0, lastZ = 0;
  R.update = function (dt, t) {
    if (!cur && Q.length) { cur = Q.shift(); cur.k = 0; cur.from = {}; Object.keys(cur.to || {}).forEach(function (k) { cur.from[k] = S[k]; }); if (cur.mood) mood(cur.mood); if (cur.say) say(cur.say[0], cur.say[1]); if (cur.fn) cur.fn(); }
    if (cur) {
      cur.k = Math.min(1, cur.k + dt / (RM ? 0.05 : cur.d || 0.4)); var e = ease(cur.k);
      Object.keys(cur.to || {}).forEach(function (k) { S[k] = cur.from[k] + (cur.to[k] - cur.from[k]) * e; });
      if (cur.k >= 1) cur = null;
    }
    view += (dragV - view) * 0.12;
    var idle = !cur && !Q.length;
    R.root.position.set(S.x, -53 + S.lift, S.z);
    R.root.rotation.set(S.tilt * 0.6 - S.bob * 0.012, S.yaw + view, S.tilt);
    var dist = Math.hypot(S.x - lastX, S.z - lastZ); R.wheels.forEach(function (w) { w.rotation.x += dist / 26; }); lastX = S.x; lastZ = S.z;
    var mob = cv.clientWidth < 700;
    R.camera.position.set(0, 64, mob ? 600 : 470); R.camera.lookAt(0, -8, 0);
    if (idle) { var away = Date.now() - ptr.t > 3500; R.look.tx = away ? Math.sin(t * 0.7) * 0.15 : ptr.x; R.look.ty = away ? 0 : ptr.y; }
  };
  var ptr = { x: 0, y: 0, t: 0 };
  function track(e) { var b = cv.getBoundingClientRect(); ptr.x = Math.max(-1, Math.min(1, (e.clientX - b.left) / b.width * 2 - 1)); ptr.y = Math.max(-1, Math.min(1, (e.clientY - b.top) / b.height * 2 - 1)); ptr.t = Date.now(); }
  window.addEventListener('pointermove', track, { passive: true }); window.addEventListener('pointerdown', track, { passive: true });
  var lastAct = Date.now();
  var chat = RoamStage.chat({ api: R, gap: 2600, first: 5000, busy: function () { return !!cur || Q.length > 0 || Date.now() - lastAct < 4500; },
    say: function (L) { mood(L[0]); say(L[2], L[1]); if (L[0] === 'happy' && L[1].indexOf('Ha') === 0) run([{ d: .12, to: { bob: 4 } }, { d: .12, to: { bob: 0 } }, { d: .12, to: { bob: 4 } }, { d: .12, to: { bob: 0 } }]); }, lines: [
      ['listen', 'Still there? Try clapping on my left.', ['dwee', 'ki']],
      ['happy', 'Tap my head. I like that.', ['bi', 'mii']],
      ['listen', 'What should I call you?', ['doo', 'ki', 'bi']],
      ['scared', 'Please do not pick me up. Or do. I will complain.', ['zip', 'dwee']],
      ['proud', 'Push me to the edge. I dare you.', ['bi', 'nya', 'tok']],
      ['sad', 'You went quiet. Did I do something?', ['oo', 'doo']],
      ['love', 'How many features have you found so far?', ['mii', 'dwee']],
      ['wink', 'Want to see me on your desk? Tap View in AR.', ['zip', 'ki']],
      ['sleepy', 'Is it bedtime yet? There is a button for that.', ['oo', 'wub']]
    ] });

  /* drag to turn it, tap it to pat it */
  var down = null;
  cv.addEventListener('pointerdown', function (e) { down = { x: e.clientX, v: dragV, moved: 0 }; cv.setPointerCapture(e.pointerId); });
  cv.addEventListener('pointermove', function (e) { if (!down) return; down.moved = Math.max(down.moved, Math.abs(e.clientX - down.x)); dragV = down.v + (e.clientX - down.x) / 160; });
  cv.addEventListener('pointerup', function (e) {
    if (down && down.moved < 6) {
      var b = cv.getBoundingClientRect(), m = new THREE.Vector2((e.clientX - b.left) / b.width * 2 - 1, -(e.clientY - b.top) / b.height * 2 + 1), rc = new THREE.Raycaster();
      rc.setFromCamera(m, R.camera); if (rc.intersectObject(R.root, true).length) act('pat');
    }
    down = null;
  });

  /* what you can do to it, and what each one shows */
  var A = {
    pat: { t: 'Pat its head', f: 'Feels touch', d: 'Roam feels a touch on its head. A pat makes its day, and over time it learns that you are the one who pats it.',
      s: [{ mood: 'surprised', d: .15, to: { bob: -4 } }, { mood: 'love', say: [['mii', 'mii', 'dwee'], 'This is nice. Do it again.'], d: .25, to: { bob: 3 } }, { d: .3, to: { yaw: .25, bob: 0 } }, { d: .3, to: { yaw: -.25 } }, { d: .3, to: { yaw: 0 } }, { d: 1.2 }, { mood: 'calm', d: .1 }] },
    wave: { t: 'Wave at it', f: 'Sees you', d: 'Roam can see you. It spots a waving hand, tells your face from a stranger, and waves back with its whole body.',
      s: [{ mood: 'listen', d: .3 }, { mood: 'happy', say: [['bi', 'dwee'], 'Hello! Waving back.'], d: .22, to: { yaw: .35, tilt: .06 } }, { d: .22, to: { yaw: -.35, tilt: -.06 } }, { d: .22, to: { yaw: .35, tilt: .06 } }, { d: .22, to: { yaw: -.35, tilt: -.06 } }, { d: .3, to: { yaw: 0, tilt: 0 } }, { d: .9 }, { mood: 'calm', d: .1 }] },
    clapL: { t: 'Clap on the left', f: 'Hears direction', d: 'Roam can tell which side a sound came from. Clap and it turns to look.',
      s: [{ mood: 'surprised', d: .15, to: { bob: 4 } }, { mood: 'listen', say: [['dwee', 'ki'], 'Hm? Over there?'], d: .55, to: { yaw: -1.1, bob: 0 }, fn: function () { R.look.tx = -1; } }, { d: 1.3 }, { mood: 'calm', d: .6, to: { yaw: 0 } }] },
    clapR: { t: 'Clap on the right', f: 'Hears direction', d: 'Roam can tell which side a sound came from. Clap and it turns to look.',
      s: [{ mood: 'surprised', d: .15, to: { bob: 4 } }, { mood: 'listen', say: [['dwee', 'ki'], 'Hm? Over there?'], d: .55, to: { yaw: 1.1, bob: 0 }, fn: function () { R.look.tx = 1; } }, { d: 1.3 }, { mood: 'calm', d: .6, to: { yaw: 0 } }] },
    name: { t: 'Say "Roam"', f: 'Knows its name', d: 'Roam listens for its own name on the device itself, no internet needed. Call it and it turns to you, ready.',
      s: [{ mood: 'surprised', d: .2, to: { bob: 5 } }, { d: .2, to: { bob: 0 } }, { mood: 'listen', say: [['bi', 'zip'], 'Yes? I am here.'], d: .4, to: { yaw: 0, tilt: .08 } }, { d: 1.6 }, { mood: 'happy', d: .3, to: { tilt: 0 } }, { d: .8 }, { mood: 'calm', d: .1 }] },
    lift: { t: 'Pick it up', f: 'Knows when it is lifted', d: 'It feels the moment its wheels leave the desk, stops the motors straight away, and makes its feelings clear.',
      s: [{ mood: 'scared', say: [['zip', 'dwee', 'ki'], 'Whoa! I did not agree to this.'], d: .5, to: { lift: 90 } }, { d: .35, to: { tilt: .12 } }, { d: .35, to: { tilt: -.12 } }, { mood: 'dizzy', d: .35, to: { tilt: 0 } }, { d: .7, to: { lift: 0 } }, { mood: 'angry', say: [['vrr', 'pah', 'tok'], 'Hmph.'], d: 1.2 }, { mood: 'calm', d: .1 }] },
    edge: { t: 'Drive to the edge', f: 'Never falls off', d: 'Roam watches the desk as it drives. The moment the desk ends, it stops, backs away and remembers where the edge is.',
      s: [{ mood: 'happy', d: .3 }, { d: 1.2, to: { z: 120 } }, { mood: 'scared', say: [['vrr', 'tok', 'tok'], 'Cliff! Not going there.'], d: .12, to: { tilt: .1, bob: 3 } }, { d: .2, to: { tilt: 0, bob: 0 } }, { d: .9, to: { z: 30 } }, { mood: 'proud', d: 1 }, { mood: 'calm', d: .7, to: { z: 0 } }] },
    ignore: { t: 'Ignore it', f: 'Has feelings', d: 'Roam has moods that rise and fall. Ignore it for hours and it sulks a little, then forgives you when you come back.',
      s: [{ mood: 'sad', say: [['wub', 'doo'], 'Ignored. Again.'], d: .7, to: { yaw: 2.6 } }, { d: .5, to: { z: -40 } }, { d: 1.6 }, { mood: 'calm', d: .6, to: { yaw: 0, z: 0 } }, { mood: 'happy', d: .6 }, { mood: 'calm', d: .1 }] },
    joke: { t: 'Ask for a joke', f: 'Has a personality', d: 'It has a sense of humour, mostly bad. It tells the joke, laughs alone, then pretends it never happened.', fn: function () { lastAct = 0; chat.joke(); },
      s: [{ mood: 'proud', say: [['oo', 'ki', 'nya', 'bi'], 'I would tell you a UDP joke, but you might not get it.'], d: 2.6 }, { mood: 'happy', say: [['ki', 'bi', 'ki', 'bi'], 'Ha ha!'], d: .15, to: { bob: 4 } }, { d: .15, to: { bob: 0 } }, { d: .15, to: { bob: 4 } }, { d: .15, to: { bob: 0 } }, { mood: 'wink', d: 1 }, { mood: 'calm', d: .1 }] },
    night: { t: 'Say goodnight', f: 'Sleeps when you do', d: 'Hold the top of its head and it says goodnight, closes its eyes and powers down. A touch wakes it again.',
      s: [{ mood: 'sleepy', say: [['oo', 'wub'], 'Goodnight.'], d: 1, to: { bob: -3, tilt: .04 } }, { d: 2.6 }, { mood: 'surprised', d: .2, to: { bob: 0, tilt: 0 } }, { mood: 'happy', say: [['bi', 'dwee'], 'Morning!'], d: .8 }, { mood: 'calm', d: .1 }] }
  };
  var keys = Object.keys(A), seen = {}, pads = $('.pads'), card = $('.lcard'), found = $('.found');
  keys.forEach(function (k) {
    var b = document.createElement('button'); b.type = 'button'; b.className = 'pad'; b.dataset.k = k;
    b.innerHTML = '<b></b><span></span>'; b.firstChild.textContent = A[k].t; b.lastChild.textContent = A[k].f;
    b.addEventListener('click', function () { act(k); });
    b.addEventListener('pointermove', function (e) { var r = b.getBoundingClientRect(); b.style.setProperty('--mx', (e.clientX - r.left) + 'px'); b.style.setProperty('--my', (e.clientY - r.top) + 'px'); });
    pads.appendChild(b);
  });
  var feats = []; keys.forEach(function (k) { if (feats.indexOf(A[k].f) < 0) feats.push(A[k].f); });
  feats.forEach(function (f) { var s = document.createElement('span'); s.textContent = f; found.appendChild(s); });
  function act(k) {
    var a = A[k]; ac(); lastAct = Date.now(); if (a.fn) { Q = []; cur = null; a.fn(); } else { chat.stop(); run(a.s); }
    $$('.pad').forEach(function (p) { p.classList.toggle('on', p.dataset.k === k); });
    $('.k', card).textContent = a.t; $('h3', card).textContent = a.f; $('p', card).textContent = a.d;
    card.classList.remove('flash'); void card.offsetWidth; card.classList.add('flash');
    seen[a.f] = 1; $$('span', found).forEach(function (s) { s.classList.toggle('got', !!seen[s.textContent]); });
    $('.count').textContent = Object.keys(seen).length + ' of ' + feats.length;
  }
  $('.count').textContent = '0 of ' + feats.length;

  /* View in AR: the outside of Roam only, at real size */
  var arb = $('.arbtn'), mv = $('#roamar'), arMsg = $('.armsg'), arReady = false;
  if (arb && mv) {
    setTimeout(function () {
      R.exportGLB(function (blob) {
        if (!blob) { arb.hidden = true; return; }
        mv.addEventListener('load', function () { arReady = true; arb.classList.add('ready'); }, { once: true });
        mv.src = URL.createObjectURL(blob);
      });
    }, 1500);
    arb.addEventListener('click', function () {
      if (arReady && mv.canActivateAR) { mv.activateAR(); return; }
      arMsg.textContent = arReady ? 'AR needs a phone. Open this page in Safari on iPhone or Chrome on Android.' : 'Getting Roam ready. Try again in a second.';
      arMsg.classList.add('on'); clearTimeout(arMsg.t); arMsg.t = setTimeout(function () { arMsg.classList.remove('on'); }, 3600);
    });
  }
  setTimeout(function () { run([{ mood: 'happy', say: [['bi', 'dwee'], 'Hello! Poke me.'], d: .3, to: { bob: 4 } }, { d: .3, to: { bob: 0 } }, { d: 1.2 }, { mood: 'calm', d: .1 }]); }, 900);
})();
