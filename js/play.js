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
    if (R && R.talk) R.talk(0.5 + (en || '').length * 0.045);
    $('.rm', bub).textContent = syl.join('-'); $('.en', bub).textContent = en; bub.classList.add('on');
    chirp(syl); clearTimeout(bt); bt = setTimeout(function () { bub.classList.remove('on'); }, 1800 + en.length * 45);
  }
  $('.snd').addEventListener('click', function () { sound = !sound; this.textContent = sound ? 'Sound on' : 'Sound off'; this.setAttribute('aria-pressed', sound); if (sound) ac(); });

  /* motion: a little timeline of poses */
  var S = { x: 0, z: 0, yaw: 0, lift: 0, tilt: 0, bob: 0 }, Q = [], cur = null, view = 0, dragV = 0, moodName = $('.moodtag');
  var MOODS = { calm: 'Calm', happy: 'Happy', love: 'In love', sleepy: 'Sleepy', surprised: 'Surprised', angry: 'Grumpy', sad: 'Sulking', wink: 'Cheeky', dizzy: 'Dizzy', scared: 'Scared', listen: 'Listening', proud: 'Proud', excited: 'Excited', amazed: 'Amazed', laughing: 'Laughing', curious: 'Curious', cheeky: 'Cheeky', tired: 'Tired', bored: 'Bored', focused: 'Focused', sick: 'Unwell', overheated: 'Overheated', embarrassed: 'Shy', grateful: 'Grateful', heartbroken: 'Heartbroken', oops: 'Oops', scanning: 'Looking around', attention: 'Alert', celebration: 'Celebrating', thinking: 'Thinking', processing: 'Thinking', loading: 'Waking up', charging: 'Charging', lowbattery: 'Hungry', connected: 'Connected' };
  function mood(m) { R.setMood(m); moodName.textContent = 'Feeling: ' + (MOODS[m] || m); }
  function run(steps) { Q = steps.slice(); cur = null; }
  function ease(k) { return k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; }
  var lastX = 0, lastZ = 0;
  R.update = function (dt, t) {
    if (!cur && Q.length) { cur = Q.shift(); cur.k = 0; cur.from = {}; Object.keys(cur.to || {}).forEach(function (k) { cur.from[k] = S[k]; }); if (cur.mood) mood(cur.mood); if (cur.g) R.gesture(cur.g); if (cur.say) say(cur.say[0], cur.say[1]); if (cur.fn) cur.fn(); }
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
      ['listen', 'Still there? Try clapping on my left.', ['dwee', 'ki'], 'pointL'],
      ['happy', 'Tap my head. I like that.', ['bi', 'mii'], 'thumbs'],
      ['listen', 'What should I call you?', ['doo', 'ki', 'bi'], 'think'],
      ['scared', 'Please do not pick me up. Or do. I will complain.', ['zip', 'dwee'], 'cover'],
      ['proud', 'Push me to the edge. I dare you.', ['bi', 'nya', 'tok'], 'shrug'],
      ['sad', 'You went quiet. Did I do something?', ['oo', 'doo'], 'facepalm'],
      ['love', 'How many features have you found so far?', ['mii', 'dwee'], 'heart'],
      ['wink', 'Want to see me on your desk? Tap View in AR.', ['zip', 'ki'], 'pointL'],
      ['sleepy', 'Is it bedtime yet? There is a button for that.', ['oo', 'wub'], 'rub']
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
      s: [{ mood: 'surprised', d: .15, to: { bob: -4 } }, { mood: 'love', g: 'heart', say: [['mii', 'mii', 'dwee'], 'This is nice. Do it again.'], d: .25, to: { bob: 3 } }, { d: .3, to: { yaw: .25, bob: 0 } }, { d: .3, to: { yaw: -.25 } }, { d: .3, to: { yaw: 0 } }, { d: 1.2 }, { mood: 'calm', d: .1 }] },
    home: { t: 'Come home', f: 'Knows its owner', d: 'Roam recognises your face with its camera. It greets you, rolls over to meet you, and acts a little hurt if you were gone all day.',
      s: [{ mood: 'scanning', d: .8 }, { mood: 'excited', g: 'cheer', say: [['bi', 'dwee', 'bi'], 'There you are!'], d: .6, to: { z: 60 } }, { d: .2, to: { bob: 4 } }, { d: .2, to: { bob: 0 } }, { mood: 'sad', say: [['oo', 'doo'], 'You were gone all day.'], d: 1.8, to: { yaw: .5 } }, { mood: 'love', g: 'hug', say: [['mii', 'dwee'], 'Fine. I missed you.'], d: 1.4, to: { yaw: 0 } }, { mood: 'calm', d: .6, to: { z: 0 } }] },
    wave: { t: 'Wave at it', f: 'Sees you', d: 'Roam can see you. It spots a waving hand, tells your face from a stranger, and waves back with its whole body.',
      s: [{ mood: 'listen', d: .3 }, { mood: 'happy', g: 'wave', say: [['bi', 'dwee'], 'Hello! Waving back.'], d: .22, to: { yaw: .35, tilt: .06 } }, { d: .22, to: { yaw: -.35, tilt: -.06 } }, { d: .22, to: { yaw: .35, tilt: .06 } }, { d: .22, to: { yaw: -.35, tilt: -.06 } }, { d: .3, to: { yaw: 0, tilt: 0 } }, { d: .9 }, { mood: 'calm', d: .1 }] },
    clapL: { t: 'Clap on the left', f: 'Hears direction', d: 'Roam can tell which side a sound came from. Clap and it turns to look.',
      s: [{ mood: 'surprised', d: .15, to: { bob: 4 } }, { mood: 'listen', g: 'pointL', say: [['dwee', 'ki'], 'Hm? Over there?'], d: .55, to: { yaw: -1.1, bob: 0 }, fn: function () { R.look.tx = -1; } }, { d: 1.3 }, { mood: 'calm', d: .6, to: { yaw: 0 } }] },
    clapR: { t: 'Clap on the right', f: 'Hears direction', d: 'Roam can tell which side a sound came from. Clap and it turns to look.',
      s: [{ mood: 'surprised', d: .15, to: { bob: 4 } }, { mood: 'listen', g: 'pointR', say: [['dwee', 'ki'], 'Hm? Over there?'], d: .55, to: { yaw: 1.1, bob: 0 }, fn: function () { R.look.tx = 1; } }, { d: 1.3 }, { mood: 'calm', d: .6, to: { yaw: 0 } }] },
    name: { t: 'Say "Roam"', f: 'Knows its name', d: 'Roam listens for its own name on the device itself, no internet needed. Call it and it turns to you, ready.',
      s: [{ mood: 'surprised', d: .2, to: { bob: 5 } }, { d: .2, to: { bob: 0 } }, { mood: 'listen', g: 'wave', say: [['bi', 'zip'], 'Yes? I am here.'], d: .4, to: { yaw: 0, tilt: .08 } }, { d: 1.6 }, { mood: 'happy', d: .3, to: { tilt: 0 } }, { d: .8 }, { mood: 'calm', d: .1 }] },
    lift: { t: 'Pick it up', f: 'Knows when it is lifted', d: 'It feels the moment its wheels leave the desk, stops the motors straight away, and makes its feelings clear.',
      s: [{ mood: 'scared', g: 'cover', say: [['zip', 'dwee', 'ki'], 'Whoa! I did not agree to this.'], d: .5, to: { lift: 90 } }, { d: .35, to: { tilt: .12 } }, { d: .35, to: { tilt: -.12 } }, { mood: 'dizzy', d: .35, to: { tilt: 0 } }, { d: .7, to: { lift: 0 } }, { mood: 'angry', g: 'shrug', say: [['vrr', 'pah', 'tok'], 'Hmph.'], d: 1.2 }, { mood: 'calm', d: .1 }] },
    edge: { t: 'Drive to the edge', f: 'Never falls off', d: 'Roam watches the desk as it drives. The moment the desk ends, it stops, backs away and remembers where the edge is.',
      s: [{ mood: 'happy', d: .3 }, { d: 1.2, to: { z: 120 } }, { mood: 'scared', g: 'cover', say: [['vrr', 'tok', 'tok'], 'Cliff! Not going there.'], d: .12, to: { tilt: .1, bob: 3 } }, { d: .2, to: { tilt: 0, bob: 0 } }, { d: .9, to: { z: 30 } }, { mood: 'proud', g: 'dthumbs', d: 1 }, { mood: 'calm', d: .7, to: { z: 0 } }] },
    ignore: { t: 'Ignore it', f: 'Has feelings', d: 'Roam has moods that rise and fall. Ignore it for hours and it sulks a little, then forgives you when you come back.',
      s: [{ mood: 'heartbroken', say: [['wub', 'doo'], 'Ignored. Again.'], d: .7, to: { yaw: 2.6 } }, { d: .5, to: { z: -40 } }, { d: 1.6 }, { mood: 'calm', d: .6, to: { yaw: 0, z: 0 } }, { mood: 'excited', g: 'hug', say: [['bi', 'dwee'], 'Oh, you are back!'], d: .6 }, { d: 1.2 }, { mood: 'calm', d: .1 }] },
    guard: { t: 'Step away from your desk', f: 'Guards your desk', d: 'When you leave for a meeting, Roam turns to face your chair and keeps watch. Anyone who walks up gets a stare, and when you are back it tells you who came by. It keeps only counts and times, never photos.',
      s: [{ mood: 'focused', say: [['tok', 'tok'], 'Guard mode. Go, I have this.'], d: 1.6 }, { mood: 'scanning', d: 1.1, to: { yaw: .6 } }, { d: 1.1, to: { yaw: -.6 } }, { mood: 'angry', g: 'pointR', say: [['vrr', 'pah'], 'Not your desk. I am watching you.'], d: 2.2, to: { yaw: 0, tilt: .06 } }, { mood: 'excited', g: 'cheer', say: [['bi', 'dwee', 'ki'], 'You are back! Two visitors. One looked at your snacks.'], d: 3.2, to: { tilt: 0 } }, { mood: 'proud', g: 'dthumbs', d: 1.2 }, { mood: 'calm', d: .1 }] },
    focus: { t: 'Turn on focus mode', f: 'Shields your focus', d: 'Hold its head and Roam guards your focus. It turns to face the aisle with a do not disturb face, and anyone who walks up is asked, politely, to come back later or leave a message.',
      s: [{ mood: 'focused', g: 'think', say: [['tok', 'bi'], 'Focus mode. I will handle visitors.'], d: 1.8 }, { mood: 'scanning', d: 1, to: { yaw: 2.4 } }, { mood: 'attention', g: 'cover', say: [['pah', 'tok'], 'Shh. My human is focusing. Come back at four?'], d: 2.8 }, { mood: 'calm', d: .8, to: { yaw: 0 } }, { mood: 'proud', g: 'dthumbs', d: 1 }, { mood: 'calm', d: .1 }] },
    message: { t: 'Stop by while they are out', f: 'Takes messages', d: 'If someone visits while you are away, Roam offers to take a short voice message and plays it back the moment you return.',
      s: [{ mood: 'listen', say: [['bi', 'doo'], 'They are out. Want to leave a message?'], d: 2.2 }, { mood: 'processing', d: 1.4, to: { tilt: .05 } }, { mood: 'happy', g: 'thumbs', say: [['bi', 'dwee'], 'Got it. I will tell them.'], d: 1.8, to: { tilt: 0 } }, { mood: 'excited', g: 'wave', say: [['bi', 'ki', 'bi'], 'Welcome back! You have one message.'], d: 2.4 }, { mood: 'calm', d: .1 }] },
    work: { t: 'Work for two hours', f: 'Checks on you', d: 'Roam keeps an eye on you while you work. After a long stretch it rolls over, peeks at you and suggests a break.',
      s: [{ mood: 'focused', d: 1.2 }, { mood: 'curious', d: .9, to: { z: 50, tilt: .06 } }, { g: 'peek', say: [['ki', 'doo', 'ki'], 'Still working? Take a break.'], d: 2.4 }, { mood: 'happy', g: 'thumbs', say: [['bi', 'dwee'], 'Water first. Then me.'], d: 1.6, to: { tilt: 0 } }, { mood: 'calm', d: .6, to: { z: 0 } }] },
    water: { t: 'Forget to drink water', f: 'Works with the Puck', d: 'Roam talks to the Hydration Puck, my other project. If your bottle has not moved in an hour, Roam rolls over and reminds you to drink.',
      s: [{ mood: 'thinking', d: 1 }, { mood: 'curious', d: .8, to: { z: 50 } }, { g: 'pointR', say: [['ki', 'oo', 'ki'], 'Your bottle has not moved in an hour.'], d: 2.4 }, { mood: 'happy', g: 'thumbs', say: [['bi', 'dwee'], 'Drink some water. I will wait.'], d: 2 }, { mood: 'calm', d: .6, to: { z: 0 } }] },
    laugh: { t: 'Laugh out loud', f: 'Laughs with you', d: 'Roam hears you laugh and joins in, even when it has no idea what was funny.',
      s: [{ mood: 'surprised', d: .2 }, { mood: 'laughing', g: 'laugh', say: [['ki', 'bi', 'ki', 'bi', 'ki'], 'Ha ha! What are we laughing at?'], d: .15, to: { bob: 4 } }, { d: .15, to: { bob: 0 } }, { d: .15, to: { bob: 4 } }, { d: .15, to: { bob: 0 } }, { d: 1.4 }, { mood: 'calm', d: .1 }] },
    joke: { t: 'Ask for a joke', f: 'Has a personality', d: 'It has a sense of humour, mostly bad. It tells the joke, laughs alone, then pretends it never happened.', fn: function () { lastAct = 0; chat.joke(); },
      s: [{ mood: 'proud', say: [['oo', 'ki', 'nya', 'bi'], 'I would tell you a UDP joke, but you might not get it.'], d: 2.6 }, { mood: 'happy', say: [['ki', 'bi', 'ki', 'bi'], 'Ha ha!'], d: .15, to: { bob: 4 } }, { d: .15, to: { bob: 0 } }, { d: .15, to: { bob: 4 } }, { d: .15, to: { bob: 0 } }, { mood: 'wink', d: 1 }, { mood: 'calm', d: .1 }] },
    nice: { t: 'Say something nice', f: 'Gets shy', d: 'Roam blushes, hides behind its hands, then peeks out. Compliments go straight to its memory.',
      s: [{ mood: 'embarrassed', g: 'peek', say: [['mii', 'mii'], 'Stop it. You are making me blush.'], d: .4, to: { tilt: .06 } }, { d: 2.2 }, { mood: 'happy', d: .4, to: { tilt: 0 } }, { mood: 'calm', d: .1 }] },
    music: { t: 'Play some music', f: 'Dances to a beat', d: 'Roam hears the beat through its microphone and moves to it, wheels and all.',
      s: [{ mood: 'surprised', d: .3 }, { mood: 'celebration', g: 'dance', say: [['bi', 'bi', 'dwee'], 'Is that music? I have moves.'], d: .25, to: { yaw: .4, tilt: .05 } }, { d: .25, to: { yaw: -.4, tilt: -.05 } }, { d: .25, to: { yaw: .4, tilt: .05 } }, { d: .25, to: { yaw: -.4, tilt: -.05 } }, { d: .25, to: { yaw: .4, tilt: .05 } }, { d: .25, to: { yaw: -.4, tilt: -.05 } }, { d: .3, to: { yaw: 0, tilt: 0 } }, { mood: 'excited', g: 'fistpump', d: 1.2 }, { mood: 'calm', d: .1 }] },
    battery: { t: 'Let the battery run low', f: 'Asks for a charge', d: 'When its battery runs low, Roam shows it on its face and asks for a charge. On the charger it watches itself fill up.',
      s: [{ mood: 'lowbattery', say: [['oo', 'doo'], 'Running low. Feed me?'], d: 2.2, to: { tilt: .04 } }, { mood: 'charging', say: [['bi', 'dwee'], 'Ahh. Charging.'], d: 2.4, to: { tilt: 0 } }, { mood: 'excited', g: 'fistpump', say: [['bi', 'bi', 'dwee'], 'Full power!'], d: 1.6 }, { mood: 'calm', d: .1 }] },
    night: { t: 'Say goodnight', f: 'Sleeps when you do', d: 'Hold the top of its head and it says goodnight, closes its eyes and powers down. A touch wakes it again.',
      s: [{ mood: 'sleepy', g: 'yawn', say: [['oo', 'wub'], 'Goodnight.'], d: 1, to: { bob: -3, tilt: .04 } }, { d: 2.6 }, { mood: 'loading', d: 1.2, to: { bob: 0, tilt: 0 } }, { mood: 'happy', g: 'cheer', say: [['bi', 'dwee'], 'Morning!'], d: .8 }, { mood: 'calm', d: .1 }] },
    posture: { t: 'Slouch at your desk', f: 'Posture mirror', d: 'Roam copies how you sit. Slouch and it droops with you; sit up and it perks up. A gentle nudge that never nags.',
      s: [{ mood: 'sad', say: [['oo', 'doo'], 'You are slouching. So am I.'], d: 2.2, to: { tilt: -.08, bob: -3 } }, { mood: 'proud', g: 'cheer', say: [['bi', 'dwee'], 'Sit tall. There we go.'], d: 2, to: { tilt: 0, bob: 2 } }, { mood: 'calm', d: .4, to: { bob: 0 } }] },
    tap: { t: 'Knock twice on the desk', f: 'Comes when you knock', d: 'No talking needed in a quiet office. Knock twice anywhere on your desk and Roam turns toward the sound and rolls over.',
      s: [{ mood: 'listen', d: .7 }, { mood: 'attention', say: [['tok', 'tok'], 'Knock knock? Coming!'], d: 1.3, to: { yaw: .6 } }, { mood: 'excited', d: 1, to: { z: 60, yaw: 0 } }, { mood: 'happy', g: 'wave', say: [['bi', 'dwee'], 'You called?'], d: 1.6 }, { mood: 'calm', d: .6, to: { z: 0 } }] },
    shh: { t: 'Get loud on a call', f: 'Keeps the office calm', d: 'In an open office, Roam notices when your voice gets loud and shows a small, polite reminder to bring it down.',
      s: [{ mood: 'surprised', d: .4 }, { mood: 'focused', g: 'cover', say: [['shh'], 'A little softer. People are working.'], d: 2.4 }, { mood: 'happy', g: 'thumbs', d: 1.2 }, { mood: 'calm', d: .1 }] },
    duck: { t: 'Explain a bug out loud', f: 'Rubber-duck mode', d: 'The classic engineering trick. Explain your problem to Roam; it listens, nods and asks why. Saying it out loud often solves it.',
      s: [{ mood: 'listen', say: [['mm', 'hm'], 'Tell me the problem.'], d: 2 }, { mood: 'thinking', g: 'think', d: 1.4 }, { mood: 'curious', say: [['ki', 'oo'], 'Why does it do that?'], d: 2 }, { mood: 'amazed', g: 'victory', say: [['bi', 'wee'], 'You solved it. I helped.'], d: 2.2 }, { mood: 'calm', d: .1 }] },
    plant: { t: 'Snap on the plant pod', f: 'Plant-sitter', d: 'With the plant pod on, Roam looks after a tiny succulent. It finds the brightest spot on your desk, parks there, and reminds you to water it.',
      s: [{ mood: 'scanning', say: [['oo', 'bi'], 'A plant! It needs sunlight.'], d: 2, to: { yaw: .7 } }, { mood: 'focused', d: 1, to: { z: 50, yaw: -.4 } }, { mood: 'proud', say: [['bi', 'dwee'], 'Brightest spot on the desk.'], d: 2, to: { yaw: 0 } }, { mood: 'sad', say: [['oo'], 'It looks thirsty. Water it today.'], d: 2 }, { mood: 'calm', d: .6, to: { z: 0 } }] },
    phone: { t: 'Dock your phone', f: 'Reads your notifications', d: 'Your phone rests on Roam\'s sloped back. Calls and messages come through as expressions: important ones get its attention, spam gets a bored look.',
      s: [{ mood: 'attention', say: [['bi', 'bi'], 'Your manager is calling.'], d: 2, to: { z: 40 } }, { mood: 'bored', say: [['meh'], 'That one is spam.'], d: 2, to: { yaw: -.6 } }, { mood: 'calm', d: .6, to: { z: 0, yaw: 0 } }] },
    flag: { t: 'Clip on the desk flag', f: 'Holds your desk', d: 'For shared offices. While you are away, Roam parks in the middle of your desk and shows when you will be back.',
      s: [{ mood: 'focused', say: [['tok'], 'Desk taken. Back at 2:30.'], d: 2.4, to: { z: 30 } }, { mood: 'angry', g: 'pointR', say: [['pah'], 'This seat is reserved.'], d: 2 }, { mood: 'calm', d: .6, to: { z: 0 } }] },
    notes: { t: 'Leave a note on Roam', f: 'Keeps notes', d: 'Colleagues can leave a sticky note on Roam\'s tray. When you sit down, it tells you there is something waiting.',
      s: [{ mood: 'curious', say: [['ki', 'bi'], 'Someone left you a note.'], d: 2 }, { mood: 'happy', g: 'pointL', say: [['bi', 'dwee'], 'It is on my tray. Read it.'], d: 2 }, { mood: 'calm', d: .1 }] },
    recap: { t: 'Pack up for the day', f: 'Sums up your day', d: 'When you pack up, Roam gives you a short recap of your day, from focus time to visitors, messages and water, then says goodnight.',
      s: [{ mood: 'proud', say: [['bi', 'nya', 'bi'], 'Today: three hours of focus.'], d: 2.2 }, { mood: 'happy', say: [['ki', 'bi'], 'Two visitors, one message, six sips of water.'], d: 2.4 }, { mood: 'love', g: 'wave', say: [['mii', 'dwee'], 'Good day. See you tomorrow.'], d: 2.2 }, { mood: 'sleepy', g: 'yawn', d: 1.6, to: { bob: -3 } }, { mood: 'calm', d: .4, to: { bob: 0 } }] }
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
  $$('[data-pad]').forEach(function (li) {
    function go() { var a = $('.arena'); a.scrollIntoView({ behavior: RM ? 'auto' : 'smooth', block: 'center' }); setTimeout(function () { act(li.dataset.pad); }, RM ? 0 : 650); }
    li.addEventListener('click', go); li.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
  });

  /* View in AR: the outside of Roam only, at real size */
  var arb = $('.arbtn'), mv = $('#roamar'), arMsg = $('.armsg'), arReady = false;
  if (arb && mv) {
    mv.addEventListener('load', function () { arReady = true; arb.classList.add('ready'); });
    if (mv.loaded) { arReady = true; arb.classList.add('ready'); }
    arb.addEventListener('click', function () {
      if (arReady && mv.canActivateAR) { mv.activateAR(); return; }
      arMsg.textContent = arReady ? 'AR needs a phone. Open this page in Safari on iPhone or Chrome on Android.' : 'Getting Roam ready. Try again in a second.';
      arMsg.classList.add('on'); clearTimeout(arMsg.t); arMsg.t = setTimeout(function () { arMsg.classList.remove('on'); }, 3600);
    });
  }
  setTimeout(function () { run([{ mood: 'happy', say: [['bi', 'dwee'], 'Hello! Poke me.'], d: .3, to: { bob: 4 } }, { d: .3, to: { bob: 0 } }, { d: 1.2 }, { mood: 'calm', d: .1 }]); }, 900);
})();
