/* VIX's face: 224 eye animations and 10 scenes, drawn on a 320 x 240 canvas.
   The same engine as the expression library; every robot on the site uses it for its screen. */
(function () {
'use strict';
function create(cv, scale) {
const ctx = cv.getContext('2d');
const TAU = Math.PI * 2, sin = Math.sin, cos = Math.cos, abs = Math.abs;
const dpr = scale || 2;
const oc = document.createElement('canvas'), octx = oc.getContext('2d');
cv.width = oc.width = Math.round(320 * dpr); cv.height = oc.height = Math.round(240 * dpr);
const LK = { x: 0, y: 0 };
/* ---------- eye model ---------- */
const STOPS=[[0,[140,242,250]],[.14,[171,238,250]],[.29,[200,234,250]],[.43,[220,228,250]],[.57,[229,220,249]],[.71,[228,205,248]],[.86,[223,186,246]],[1,[216,171,243]]];
const DEF={x:0,y:0,w:72,h:70,r:9,rot:0,sx:1,sy:1,s:1,lid:0,slant:0,bot:0,a:1,tint:0,lw:11,ph:0,shape:'r',tc:'#ff9ec4'};
const NUM=['x','y','w','h','r','rot','sx','sy','s','lid','slant','bot','a','tint','lw','ph'];
const E={neutral:{},happy:{bot:.55},joy:{bot:.62,w:78},content:{bot:.42,lid:.18},sad:{lid:.22,slant:-.62,y:6,h:64},angry:{lid:.3,slant:.8},mad:{lid:.38,slant:1,w:76},annoyed:{lid:.44,slant:.25},
 surprised:{w:66,h:84,r:28},shocked:{w:58,h:92,r:28},sleepy:{lid:.58},drowsy:{lid:.46,slant:-.2},closed:{shape:'line',h:10,y:8},squint:{lid:.36,bot:.32},worried:{lid:.2,slant:-.6,w:66,h:64},
 suspicious:{L:{lid:.5,slant:.3},R:{lid:.12}},skeptical:{L:{lid:.42},R:{h:78,y:-6}},focused:{lid:.26,h:58},unimpressed:{lid:.55,bot:.12},smug:{lid:.45,bot:.32,slant:-.3},
 love:{shape:'heart',w:78,h:72},star:{shape:'star',w:80,h:80},dizzy:{shape:'spiral',w:64,h:64,lw:8},xx:{shape:'x',w:60,h:60},big:{w:80,h:88,r:22},small:{w:46,h:46,r:12},dot:{shape:'o',w:26,h:26},
 uwu:{shape:'u',w:58,h:40,lw:10},carets:{shape:'arc',w:64,h:44,lw:11},gtlt:{shape:'chev',w:54,h:56,lw:11},flat:{shape:'line',w:70,h:12}};
function res(spec){const L={...DEF},R={...DEF};const add=s=>{if(!s)return;if(Array.isArray(s)){s.forEach(add);return}if(typeof s==='string'){add(E[s]);return}const {L:l,R:r,...b}=s;Object.assign(L,b,l||{});Object.assign(R,b,r||{})};add(spec);return{L,R}}
const ease=k=>k<.5?4*k*k*k:1-Math.pow(-2*k+2,3)/2;
const back=k=>1+2.70158*Math.pow(k-1,3)+1.70158*Math.pow(k-1,2);
function mix(a,b,k){const o={};for(const n of NUM)o[n]=a[n]+(b[n]-a[n])*k;o.shape=k<.5?a.shape:b.shape;o.tc=k<.5?a.tc:b.tc;if(a.shape!==b.shape)o.s*=1-.9*sin(Math.PI*k);return o}
function kf(fr){const isF=Array.isArray(fr)&&Array.isArray(fr[0])&&typeof fr[0][0]==='number';
 if(!isF){const p=res(fr);return()=>({L:{...p.L},R:{...p.R}})}
 const F=fr.map(([t,s,e])=>({t,p:res(s),e:e||ease}));
 return u=>{if(u<=F[0].t)return{L:{...F[0].p.L},R:{...F[0].p.R}};let i=0;while(i<F.length-1&&u>F[i+1].t)i++;if(i>=F.length-1)return{L:{...F[i].p.L},R:{...F[i].p.R}};
  const a=F[i],b=F[i+1],k=b.e(Math.min(1,(u-a.t)/(b.t-a.t)));return{L:mix(a.p.L,b.p.L,k),R:mix(a.p.R,b.p.R,k)}}}
const AN=[];
function A(c,n,d,fr,...mods){AN.push({c,n,d,f:kf(fr),mods})}
function state(an,t){const u=(t/an.d)%1,p=an.f(u),st={L:p.L,R:p.R,g:{x:0,y:0,rot:0,s:1,sx:1,dim:1,glitch:0},fx:[],u,t};for(const m of an.mods)m(st,u,t);return st}

/* ---------- motion modifiers ---------- */
const bob=(a,f=1,ph=0)=>(s,u)=>{s.g.y+=a*sin(TAU*f*u+ph)};
const bounce=(a,f=1)=>(s,u)=>{s.g.y-=a*abs(sin(Math.PI*f*u))};
const sway=(a,f=1,ph=0)=>(s,u)=>{s.g.x+=a*sin(TAU*f*u+ph)};
const shake=(a,f=6)=>(s,u)=>{s.g.x+=a*sin(TAU*f*u)};
const tilt=(a,f=1,ph=0)=>(s,u)=>{s.g.rot+=a*sin(TAU*f*u+ph)};
const pulse=(a,f=1)=>(s,u)=>{s.g.s*=1+a*sin(TAU*f*u)};
const tremble=a=>(s,u,t)=>{s.g.x+=a*sin(t*61)*cos(t*17);s.g.y+=a*cos(t*53)*sin(t*23)};
const spin=(n=1)=>(s,u)=>{s.g.rot+=TAU*n*ease(u)};
const blink=(times,len=.06,which='LR')=>(s,u)=>{let k=1;for(const b of times){const d=abs(u-b);if(d<len)k=Math.min(k,Math.max(.06,d/len))}if(which.includes('L'))s.L.sy*=k;if(which.includes('R'))s.R.sy*=k};
const look=fn=>(s,u,t)=>{const [x,y]=fn(u,t);s.L.x+=x;s.R.x+=x;s.L.y+=y;s.R.y+=y};
const fx=(n,o={})=>s=>{s.fx.push([n,o])};
const dim=v=>s=>{s.g.dim*=v};
const glitch=v=>s=>{s.g.glitch=Math.max(s.g.glitch,v)};
const eyeBob=(a,f)=>(s,u)=>{s.L.y+=a*sin(TAU*f*u);s.R.y+=a*sin(TAU*f*u+Math.PI)};
const squash=(a,f)=>(s,u)=>{const k=sin(TAU*f*u);s.L.sx*=1+a*k;s.R.sx*=1+a*k;s.L.sy*=1-a*k;s.R.sy*=1-a*k};
const each=fn=>fn;
const wander=(ax=34,ay=14,sp=1)=>(u,t)=>[ax*(.6*sin(t*.9*sp)+.4*sin(t*2.3*sp+1)),ay*(.6*sin(t*.7*sp+2)+.4*sin(t*1.9*sp))];
const circle=(r=30,f=1)=>u=>[r*cos(TAU*f*u),r*.55*sin(TAU*f*u)];
const lissa=(ax,ay,fx_,fy)=>u=>[ax*sin(TAU*fx_*u),ay*sin(TAU*fy*u)];
const dart=pts=>u=>{const n=pts.length,f=u*n,i=Math.floor(f)%n,k=Math.min(1,(f-Math.floor(f))/.18),a=pts[(i+n-1)%n],b=pts[i],e=ease(k);return[a[0]+(b[0]-a[0])*e,a[1]+(b[1]-a[1])*e]};

/* ================= THE LIBRARY ================= */
// Idle
A('Idle','Idle look-around',7,'neutral',look(wander(34,14,1)),blink([.18,.62]));
A('Idle','Calm breathing',4,'neutral',each((s,u)=>{const k=1+.035*sin(TAU*u);s.L.sy*=k;s.R.sy*=k}),blink([.8]));
A('Idle','Slow blink',3,'neutral',blink([.5],.16));
A('Idle','Double blink',2.4,'neutral',blink([.4,.53],.05));
A('Idle','Triple blink',2.6,'neutral',blink([.3,.41,.52],.045));
A('Idle','Flutter blink',1.8,'neutral',blink([.2,.28,.36,.44,.52],.03));
A('Idle','Lazy blink',3.2,[[0,'neutral'],[.35,'neutral'],[.55,'sleepy'],[.75,'neutral'],[1,'neutral']]);
A('Idle','Wink left',2.2,[[0,'neutral'],[.3,{R:{bot:.3}}],[.7,{R:{bot:.3}}],[1,'neutral']],blink([.5],.12,'L'));
A('Idle','Wink right',2.2,[[0,'neutral'],[.3,{L:{bot:.3}}],[.7,{L:{bot:.3}}],[1,'neutral']],blink([.5],.12,'R'));
A('Idle','Half blink',2.4,[[0,'neutral'],[.45,'neutral'],[.52,{lid:.5}],[.6,'neutral'],[1,'neutral']]);
A('Idle','Glance left',2.6,[[0,'neutral'],[.2,{x:-40}],[.65,{x:-40}],[.85,'neutral'],[1,'neutral']]);
A('Idle','Glance right',2.6,[[0,'neutral'],[.2,{x:40}],[.65,{x:40}],[.85,'neutral'],[1,'neutral']]);
A('Idle','Glance up',2.6,[[0,'neutral'],[.2,{y:-24}],[.65,{y:-24}],[.85,'neutral'],[1,'neutral']]);
A('Idle','Glance down',2.6,[[0,'neutral'],[.2,{y:22,lid:.15}],[.65,{y:22,lid:.15}],[.85,'neutral'],[1,'neutral']]);
A('Idle','Side-eye left',3,[[0,'neutral'],[.25,{x:-36,lid:.42}],[.75,{x:-36,lid:.42}],[1,'neutral']]);
A('Idle','Side-eye right',3,[[0,'neutral'],[.25,{x:36,lid:.42}],[.75,{x:36,lid:.42}],[1,'neutral']]);
A('Idle','Blink and look left',2.6,[[0,'neutral'],[.3,'neutral'],[.42,{x:-38}],[.85,{x:-38}],[1,'neutral']],blink([.33],.07));
A('Idle','Blink and look right',2.6,[[0,'neutral'],[.3,'neutral'],[.42,{x:38}],[.85,{x:38}],[1,'neutral']],blink([.33],.07));
A('Idle','Daydream',6,[[0,'neutral'],[.3,{x:26,y:-18,lid:.22}],[.8,{x:30,y:-20,lid:.22}],[1,'neutral']],blink([.55],.08));
A('Idle','Attentive',3,[[0,'neutral'],[.25,{s:1.1}],[.8,{s:1.1}],[1,'neutral']],blink([.5],.05),fx('glint'));
// Looking
[['Look left',-42,0],['Look right',42,0],['Look up',0,-26],['Look down',0,24],['Look up-left',-36,-22],['Look up-right',36,-22],['Look down-left',-36,20],['Look down-right',36,20]]
 .forEach(([n,x,y])=>A('Looking',n,2.4,[[0,'neutral'],[.18,{x,y}],[.75,{x,y}],[.92,'neutral'],[1,'neutral']],blink([.5],.05)));
A('Looking','Scan left to right',3,'neutral',look(u=>[44*sin(TAU*u),0]));
A('Looking','Scan up and down',3,'neutral',look(u=>[0,24*sin(TAU*u)]));
A('Looking','Look in a circle',3,'neutral',look(circle(34)));
A('Looking','Figure eight',4,'neutral',look(lissa(40,20,1,2)));
A('Looking','Quick darts',2.4,'neutral',look(dart([[0,0],[-40,-10],[36,8],[-20,18],[42,-16],[0,0]])));
A('Looking','Peek from the left',3.6,[[0,{x:-170}],[.3,{x:-112}],[.45,{x:-112}],[.55,{x:-125}],[.7,{x:-108}],[1,{x:-170}]]);
A('Looking','Peek from the right',3.6,[[0,{x:170}],[.3,{x:112}],[.45,{x:112}],[.55,{x:125}],[.7,{x:108}],[1,{x:170}]]);
A('Looking','Follow the fly',4,['small',{w:54,h:54}],look((u,t)=>[38*sin(t*3.1)*cos(t*1.3),18*sin(t*4.7)]));
A('Looking','Look at you',3,[[0,'neutral'],[.2,{s:1.12}],[.85,{s:1.12}],[1,'neutral']],fx('glint'),blink([.6],.05));
A('Looking','Eye roll',2.8,[[0,'neutral'],[.15,{x:-30,y:-6,lid:.2}],[.4,{x:0,y:-26,lid:.25}],[.65,{x:30,y:-6,lid:.2}],[.85,{lid:.35}],[1,'neutral']]);
A('Looking','Cross-eyed',2.6,[[0,'neutral'],[.25,{L:{x:22},R:{x:-22}}],[.75,{L:{x:22},R:{x:-22}}],[1,'neutral']],tilt(.05,2));
A('Looking','Wall-eyed',2.6,[[0,'neutral'],[.25,{L:{x:-22},R:{x:22}}],[.75,{L:{x:-22},R:{x:22}}],[1,'neutral']]);
// Happy
A('Happy','Happy',3,'happy',blink([.6],.05),bob(2,1));
A('Happy','Very happy',2,'joy',bounce(8,2));
A('Happy','Joy bounce',1.2,'joy',bounce(14,2),squash(.06,2));
A('Happy','Giggle',1.2,'happy',bob(3,6));
A('Happy','Laugh',1,'carets',bob(4,5),tilt(.04,1));
A('Happy','Content',4,'content',pulse(.03,1));
A('Happy','Proud',3,['happy',{y:-12,lid:.1}],tilt(.04,1));
A('Happy','Excited',1.2,[[0,'happy'],[.5,['big',{bot:.45}]],[1,'happy']],fx('sparkle'));
A('Happy','Cheerful wink',2.4,'happy',blink([.5],.14,'R'),bob(3,1));
A('Happy','Beaming',3,['joy',{w:84,h:74}],fx('sparkle'),pulse(.03,2));
A('Happy','Smile squint',3,['squint',{bot:.42}],bob(2,2));
A('Happy','Grin wiggle',1.6,'happy',sway(6,4));
A('Happy','Delighted hop',1.4,'joy',bounce(20,1),squash(.1,1));
A('Happy','Happy sway',3,'happy',tilt(.12,1),sway(8,1));
A('Happy','Happy nod',1.6,'happy',each((s,u)=>{s.g.y+=8*Math.max(0,sin(TAU*2*u))}));
A('Happy','Sparkle eyes',3,'star',each((s,u)=>{s.L.rot+=TAU*u*.2;s.R.rot+=TAU*u*.2}),fx('sparkle'));
A('Happy','Starstruck',1.4,['star',{w:84,h:84}],pulse(.12,2),fx('sparkle'));
A('Happy','Love eyes',1.6,'love',pulse(.08,2),fx('hearts'));
A('Happy','Heartbeat',1.2,'love',each((s,u)=>{const b=Math.exp(-Math.pow((u-.1)/.05,2))+.7*Math.exp(-Math.pow((u-.3)/.05,2));s.g.s*=1+.14*b}));
A('Happy','Blushing smile',3,'happy',fx('blush'),bob(2,1));
// Sad
A('Sad','Sad',3,'sad',blink([.6],.07));
A('Sad','Very sad',3.5,['sad',{lid:.34,y:12,h:60}],bob(2,1));
A('Sad','Teary',3,'sad',fx('tearform'));
A('Sad','Crying',2,['sad',{lid:.32}],fx('tears'));
A('Sad','Sobbing',1.4,['sad',{lid:.38,y:8}],each((s,u)=>{s.g.y+=4*abs(sin(TAU*3*u))}),fx('tears',{fast:1}));
A('Sad','Lonely',5,'sad',look(u=>[-26+8*sin(TAU*u),18]),blink([.5],.1));
A('Sad','Disappointed',3.6,[[0,'neutral'],[.5,['sad',{lid:.3,y:10}]],[.85,['sad',{lid:.3,y:10}]],[1,'neutral']]);
A('Sad','Pout',3,['sad',{w:58,h:52,y:14}],sway(3,1));
A('Sad','Sulk',4,['sad',{x:34,lid:.36}],bob(2,.5));
A('Sad','Gloomy',4,'sad',dim(.7),fx('cloud'));
A('Sad','Heartbroken',2.6,['love',{y:10}],fx('crack'),bob(3,1));
A('Sad','Sniffle',1.6,'sad',each((s,u)=>{const k=u<.1?sin(u/.1*Math.PI):(u>.25&&u<.35?sin((u-.25)/.1*Math.PI):0);s.g.y-=6*k}));
A('Sad','Sigh',3,[[0,'neutral'],[.3,{sy:1.06,y:-4}],[.6,{sy:.85,y:10,lid:.3}],[1,'neutral']]);
A('Sad','Puppy eyes',2.4,['big',{shape:'o',w:78,h:80,lid:.12,slant:-.6}],tremble(1.2),fx('glint'));
// Angry
A('Angry','Annoyed',3,'annoyed',blink([.7],.06));
A('Angry','Angry',2,'angry',tremble(.8));
A('Angry','Furious',1,['mad',{tint:.35,tc:'#ff6b6b'}],shake(3,8));
A('Angry','Grumpy',4,['annoyed',{y:10}],sway(4,.5));
A('Angry','Glare left',3,[[0,'angry'],[.25,['angry',{x:-34}]],[.8,['angry',{x:-34}]],[1,'angry']]);
A('Angry','Glare right',3,[[0,'angry'],[.25,['angry',{x:34}]],[.8,['angry',{x:34}]],[1,'angry']]);
A('Angry','Side-eye glare',4,['angry',{lid:.45}],look(u=>[36*sin(TAU*u),0]));
A('Angry','Steaming',2,'angry',fx('steam'),tremble(.6));
A('Angry','Frustrated',1.2,'angry',squash(.08,3));
A('Angry','Determined',3,['focused',{slant:.5,lid:.3}],pulse(.03,1),fx('glint'));
A('Angry','Suspicious',4,'suspicious',look(u=>[30*sin(TAU*u),0]));
A('Angry','Skeptical',3,[[0,'neutral'],[.3,'skeptical'],[.8,'skeptical'],[1,'neutral']]);
A('Angry','Huff',1.8,'angry',each((s,u)=>{const k=u<.2?sin(u/.2*Math.PI):0;s.L.sx*=1+.12*k;s.R.sx*=1+.12*k;s.L.sy*=1-.1*k;s.R.sy*=1-.1*k}),fx('steam'));
A('Angry','Rage tremble',1,['mad',{tint:.5,tc:'#ff5a5a',w:78}],tremble(2.5));
// Surprise
A('Surprise','Surprised',2.6,[[0,'neutral'],[.12,'surprised'],[.8,'surprised'],[1,'neutral']]);
A('Surprise','Shocked',2,[[0,'neutral'],[.08,'shocked'],[.9,'shocked'],[1,'neutral']],tremble(.8));
A('Surprise','Startled jump',1.6,[[0,'neutral'],[.1,'surprised'],[.7,'surprised'],[1,'neutral']],each((s,u)=>{s.g.y-=30*Math.max(0,sin(Math.min(1,u/.35)*Math.PI))}));
A('Surprise','Gasp',2.4,[[0,'neutral'],[.1,'surprised'],[.8,'surprised'],[1,'neutral']],fx('ex',{from:.1,to:.8}));
A('Surprise','Wide eyes',3,'big',blink([.85],.05));
A('Surprise','Amazed',2.6,'surprised',fx('sparkle'),pulse(.04,2));
A('Surprise','Double take',2.8,[[0,'neutral'],[.12,{x:-38}],[.25,'neutral'],[.38,'neutral'],[.45,['surprised',{x:-40}]],[.85,['surprised',{x:-40}]],[1,'neutral']]);
A('Surprise','Eye pop',1.6,[[0,'neutral'],[.15,{s:1.35},back],[.8,{s:1.35}],[1,'neutral']]);
A('Surprise','Jaw drop',2.6,[[0,'neutral'],[.2,['surprised',{y:28,sy:1.15}]],[.8,['surprised',{y:28,sy:1.15}]],[1,'neutral']]);
A('Surprise','Alert',1.4,'big',fx('ex'),each((s,u)=>{const k=.75+.25*cos(TAU*2*u);s.L.a*=k;s.R.a*=k}));
A('Surprise','Wow',1.8,{shape:'ring',w:74,h:74,lw:12},pulse(.08,2));
A('Surprise','Flinch',2,[[0,'neutral'],[.08,['squint',{x:14}]],[.35,['squint',{x:14}]],[.6,'neutral'],[1,'neutral']]);
A('Surprise','Perk up',2.6,[[0,'sleepy'],[.35,'sleepy'],[.45,'big'],[.85,'big'],[1,'sleepy']]);
A('Surprise','Mind blown',2.6,[[0,'neutral'],[.2,{s:1.25}],[.3,{s:.01}],[.6,{s:.01}],[.8,'neutral'],[1,'neutral']],fx('burst',{at:.3}));
// Thinking
A('Thinking','Thinking',4,['neutral',{x:30,y:-20,lid:.15}],fx('dots'),blink([.6],.06));
A('Thinking','Pondering',5,['neutral',{lid:.18}],look(u=>[34*sin(TAU*u),-18+4*cos(TAU*u)]));
A('Thinking','Confused',3,[[0,'neutral'],[.25,{L:{w:56,h:54,y:6},R:{w:82,h:82}}],[.8,{L:{w:56,h:54,y:6},R:{w:82,h:82}}],[1,'neutral']],fx('qm'));
A('Thinking','Puzzled',3,['neutral',{L:{lid:.3}}],tilt(.12,1),fx('qm'));
A('Thinking','Curious',3,['neutral',{R:{w:80,h:80}}],each((s,u)=>{s.g.rot+=.14*Math.min(1,sin(Math.PI*u)*2)}));
A('Thinking','Hmm',3.6,'squint',look(u=>[22*sin(TAU*u),0]));
A('Thinking','Calculating',1.6,{shape:'spin',w:64,h:64,lw:11},each((s,u)=>{s.L.ph=TAU*u*2;s.R.ph=TAU*u*2+Math.PI}));
A('Thinking','Processing',2,['small',{w:50,h:50,y:-10}],fx('dots'));
A('Thinking','Idea',2.4,[[0,{y:-18,lid:.12}],[.4,{y:-18,lid:.12}],[.5,['big',{y:-6}]],[.9,['big',{y:-6}]],[1,{y:-18,lid:.12}]],fx('bulb'));
A('Thinking','Remembering',4,['neutral',{x:-30,y:-20}],blink([.5],.12));
A('Thinking','Uncertain',3,['worried',{w:62,h:62}],tilt(.08,2));
A('Thinking','Dizzy',2,'dizzy',each((s,u)=>{s.L.rot=TAU*u*2;s.R.rot=-TAU*u*2}),sway(8,1),fx('orbit'));
A('Thinking','Lost',6,['small',{w:56,h:56}],look(wander(40,18,.6)),blink([.3],.06));
A('Thinking','Deep focus',3,['focused',{lid:.32,bot:.15}],pulse(.025,2));
// Sleepy
A('Sleepy','Drowsy',4,'drowsy',each((s,u)=>{const k=.08*sin(TAU*u);s.L.lid+=k;s.R.lid+=k}));
A('Sleepy','Yawn',3.4,[[0,'neutral'],[.25,{lid:.55,sy:1.05}],[.45,['closed',{sx:1.15}]],[.7,'sleepy'],[1,'neutral']]);
A('Sleepy','Dozing off',4,[[0,'sleepy'],[.6,'closed'],[.75,'closed'],[.8,'surprised'],[.9,'sleepy'],[1,'sleepy']],each((s,u)=>{s.g.y+=u<.75?14*u/.75:Math.max(0,14*(1-(u-.75)/.05))}));
A('Sleepy','Asleep',4,'closed',fx('zzz'),each((s,u)=>{const k=1+.12*sin(TAU*u);s.L.sx*=k;s.R.sx*=k}));
A('Sleepy','Deep sleep',5,['closed',{y:10}],bob(3,1),fx('zzz'),dim(.75));
A('Sleepy','Wake up',3.6,[[0,'closed'],[.25,'closed'],[.35,'sleepy'],[.45,'closed'],[.6,'drowsy'],[.85,'neutral'],[1,'neutral']]);
A('Sleepy','Stretch awake',3,[[0,'closed'],[.3,['closed',{sx:1.35}]],[.5,['big',{sy:1.1}]],[.8,'happy'],[1,'closed']]);
A('Sleepy','Startled awake',2.6,[[0,'closed'],[.4,'closed'],[.45,'shocked'],[.85,'shocked'],[1,'closed']],fx('ex',{from:.44,to:.85}));
A('Sleepy','Sleepwalking',6,['sleepy',{lid:.65}],look(wander(40,10,.4)),bob(3,2));
A('Sleepy','Power nap',3,[[0,'closed'],[.6,'closed'],[.7,'joy'],[.95,'joy'],[1,'closed']],fx('zzz',{to:.6}));
A('Sleepy','Sweet dreams',5,'closed',fx('hearts',{slow:1}),bob(2,1));
A('Sleepy','Snoring',2.6,'closed',each((s,u)=>{const k=1+.25*Math.max(0,sin(TAU*u));s.L.sy*=k;s.R.sy*=k;s.L.sx*=1.1/k;s.R.sx*=1.1/k}),fx('zzz',{big:1}));
// Love
A('Love','Smitten',3,'happy',fx('hearts'),tilt(.06,1));
A('Love','Crush',4,['happy',{x:-30,y:14,w:60,h:58}],fx('blush'),sway(3,1));
A('Love','Shy',4,['squint',{y:18,x:20,bot:.3}],fx('blush'),tilt(.06,1));
A('Love','Adoring',3,['big',{shape:'o',w:80,h:82}],fx('glint'),pulse(.04,1));
A('Love','Flirty wink',2.4,'happy',blink([.45],.15,'R'),fx('hearts',{from:.4,to:.95}));
A('Love','Blow a kiss',2.6,'happy',blink([.35],.12,'R'),fx('kiss',{from:.35}));
A('Love','Cute squish',1.6,'happy',squash(.14,2));
A('Love','UwU',3,'uwu',fx('blush'),bob(2,2));
A('Love','Aww',3,['big',{shape:'o',w:84,h:84}],fx('glint'),tilt(.1,1));
A('Love','Spinning hearts',2,'love',each((s,u)=>{const k=cos(TAU*u);s.L.sx*=k;s.R.sx*=k}));
A('Love','Warm glow',3,['happy',{tc:'#ff9ec4'}],each((s,u)=>{const k=.25+.2*sin(TAU*u);s.L.tint=k;s.R.tint=k}));
A('Love','Hug me',2.4,[[0,'happy'],[.35,['happy',{L:{x:-30},R:{x:30}}]],[.55,['happy',{L:{x:12},R:{x:-12},s:1.05}]],[.8,'happy'],[1,'happy']]);
// Playful
A('Playful','Mischievous',3,'smug',look(u=>[24*sin(TAU*u),0]));
A('Playful','Smirk',3,{L:{lid:.45,bot:.3},R:{bot:.2}},tilt(.05,1));
A('Playful','Cheeky wink',2,'happy',blink([.5],.14,'L'),tilt(.1,1));
A('Playful','Silly',2,{L:{x:20,w:64},R:{x:-20,w:80,h:80}},tilt(.1,2),bob(4,2));
A('Playful','Goofy wobble',1.6,'neutral',eyeBob(10,2));
A('Playful','Dance',1.6,'happy',each((s,u)=>{const v=sin(TAU*2*u);s.g.x+=18*Math.sign(v)*Math.min(1,abs(v)*3);s.g.y-=8*abs(sin(TAU*4*u))}));
A('Playful','Head bop',.8,'happy',each((s,u)=>{s.g.y+=10*Math.pow(abs(sin(Math.PI*2*u)),3)}));
A('Playful','Wiggle',1,'neutral',tilt(.12,4));
A('Playful','Spin',2,'happy',spin(1));
A('Playful','Barrel roll',2,'neutral',each((s,u)=>{s.g.sx*=cos(TAU*u)}));
A('Playful','Peekaboo',3,[[0,'closed'],[.35,'closed'],[.45,['joy',{s:1.1}]],[.85,'joy'],[1,'closed']],each((s,u)=>{if(u<.35)s.g.y+=110;else if(u<.45)s.g.y+=110*(1-(u-.35)/.1);else if(u>.9)s.g.y+=110*((u-.9)/.1)}));
A('Playful','Tease',3,[[0,'neutral'],[.2,{x:34}],[.45,{x:34}],[.6,'happy'],[1,'happy']],blink([.75],.12,'R'));
A('Playful','Jitterbug',1.2,'happy',tremble(2.2));
A('Playful','Boing',1.4,'neutral',each((s,u)=>{const k=Math.exp(-4*u)*sin(TAU*4*u);s.L.sy*=1+.3*k;s.R.sy*=1+.3*k;s.L.sx*=1-.2*k;s.R.sx*=1-.2*k}));
A('Playful','Hide and seek',5,[[0,{x:-160}],[.15,{x:-110}],[.3,{x:-110}],[.4,{x:-160}],[.5,{x:160}],[.65,{x:110}],[.8,{x:110}],[.9,{x:160}],[1,{x:-160}]]);
A('Playful','Gotcha',1.4,'gtlt',shake(4,4));
// Scared
A('Scared','Scared',1.6,['worried',{w:56,h:58}],tremble(1.5));
A('Scared','Nervous',2.6,'worried',look(dart([[0,0],[-30,0],[28,4],[-22,-6],[0,0]])),fx('sweat'));
A('Scared','Anxious',2,['worried',{w:58,h:56}],look(dart([[-20,0],[22,0],[-14,6],[18,-4]])),tremble(.6));
A('Scared','Terrified',1,['dot',{w:30,h:30}],tremble(3));
A('Scared','Hiding',4,[[0,{y:90}],[.3,{y:58,lid:.2}],[.7,{y:58,lid:.2}],[1,{y:90}]],look(u=>[18*sin(TAU*2*u),0]));
A('Scared','Shiver',.8,['worried',{w:60,h:60}],each((s,u,t)=>{s.g.x+=2*sin(t*80)}));
A('Scared','Gulp',2,[[0,'worried'],[.3,['worried',{sy:.75,y:8}]],[.4,['worried',{sy:1.1,y:-4}]],[.6,'worried'],[1,'worried']]);
A('Scared','Worried',4,'worried',look(wander(20,8,.8)));
A('Scared','Panic',1.2,['worried',{w:54,h:60}],look(dart([[-36,0],[36,0],[-30,10],[34,-10],[0,0]])),fx('sweat'));
A('Scared','Relieved',3.6,[[0,'worried'],[.35,'worried'],[.6,['content',{y:6}]],[.9,'content'],[1,'worried']]);
// System
A('System','Boot up',3,[[0,{shape:'line',h:4,w:4,a:0}],[.15,{shape:'line',h:4,w:4}],[.35,{shape:'line',h:6,w:150,L:{x:30},R:{x:-30}}],[.55,{h:70,w:72}],[1,'neutral']],blink([.75],.05));
A('System','Shut down',2.6,[[0,'neutral'],[.3,'neutral'],[.5,{sy:.04,sx:1.6}],[.7,{sy:.04,sx:.05}],[.8,{a:0,sy:.04,sx:.05}],[1,{a:0,sy:.04,sx:.05}]]);
A('System','Loading spinner',1.4,{shape:'spin',w:60,h:60,lw:10},each((s,u)=>{s.L.ph=TAU*u;s.R.ph=TAU*u}));
A('System','Loading dots',2,['small',{w:48,h:48}],fx('dots'));
A('System','Battery low',2.4,['sleepy',{lid:.5}],dim(.75),fx('battery',{lvl:.12}));
A('System','Charging',3,'content',fx('battery',{charge:1}));
A('System','Searching Wi-Fi',2.4,['small',{w:52,h:52}],look(u=>[24*sin(TAU*u),-6]),fx('wifi'));
A('System','Connected',2,[[0,'neutral'],[.2,{shape:'check',w:60,h:56,lw:11}],[.8,{shape:'check',w:60,h:56,lw:11}],[1,'neutral']],bob(3,2));
A('System','Error',1.6,{shape:'x',w:58,h:58},shake(4,3));
A('System','Glitch',2,'neutral',glitch(1),each((s,u,t)=>{if(sin(t*13)>.7){s.L.x+=8;s.R.x-=6}}));
A('System','Reboot',4,[[0,'neutral'],[.15,{sy:.04,sx:1.5}],[.25,{sy:.04,sx:.05,a:0}],[.45,{a:0,shape:'line',h:4,w:4}],[.6,{shape:'line',h:6,w:140,L:{x:30},R:{x:-30}}],[.75,'neutral'],[1,'neutral']]);
A('System','Updating',3,'focused',fx('progress'));
A('System','Low power',4,['sleepy',{lid:.55}],dim(.45),bob(2,.5));
A('System','Notification',1.6,'surprised',fx('ex'),bounce(10,2));
A('System','Listening',1.6,'neutral',each((s,u,t)=>{const k=1+.06*abs(sin(t*7))*abs(sin(t*3.1));s.L.s*=k;s.R.s*=k}),fx('bars',{quiet:1}));
A('System','Speaking',1.6,'happy',fx('bars'),bob(2,4));
A('System','Typing',2,['neutral',{y:16,lid:.2}],fx('dots'),look(u=>[16*sin(TAU*2*u),0]));
A('System','OK',2,{shape:'check',w:62,h:58,lw:12},pulse(.06,2));
A('System','Yes',1.6,'happy',each((s,u)=>{s.g.y+=10*sin(TAU*2*u)}));
A('System','No',1.6,'annoyed',each((s,u)=>{s.g.x+=16*sin(TAU*2*u)}));
A('System','Alarm',1,'big',fx('ex'),each((s,u)=>{const k=u<.5?1:.35;s.L.a*=k;s.R.a*=k}),shake(3,6));
A('System','Timer',5,'neutral',each((s,u)=>{const k=1-u*.85;s.L.sx*=k;s.R.sx*=k}),fx('progress'));
A('System','Music playing',2,'happy',fx('notes'),tilt(.1,2),bob(3,4));
A('System','Recording',2,'focused',fx('rec'));
// Reactions
A('Reactions','Unimpressed',3,'flat',blink([.7],.05));
A('Reactions','Deadpan',4,'unimpressed',blink([.5],.2));
A('Reactions','Judging you',4,['suspicious',{s:1.05}],each((s,u)=>{s.L.lid+=.08*sin(TAU*u)}));
A('Reactions','Smug',3,'smug',bob(2,1),tilt(.05,1));
A('Reactions','Cool',3,['neutral',{lid:.4,bot:.08,slant:.15}],sway(3,.5),blink([.7],.04));
A('Reactions','Knocked out',2.4,'xx',tilt(.12,1),fx('orbit'));
A('Reactions','Seeing stars',2,['star',{w:56,h:56}],each((s,u)=>{s.L.rot=TAU*u;s.R.rot=TAU*u}),fx('orbit',{stars:1}));
A('Reactions','Sweat drop',3,['neutral',{bot:.15}],fx('sweat'));
A('Reactions','Embarrassed',3,['squint',{y:12,bot:.35}],fx('blush'),fx('sweat'));
A('Reactions','Awkward',3,['neutral',{x:28,bot:.2}],fx('sweat'),each((s,u)=>{s.g.x+=3*sin(TAU*3*u)}));
A('Reactions','Jealous',4,['annoyed',{x:-30,lid:.48,slant:.4}],look(u=>[0,4*sin(TAU*u)]));
A('Reactions','Facepalm',2.6,[[0,'neutral'],[.25,['closed',{y:30}]],[.8,['closed',{y:30}]],[1,'neutral']]);
A('Reactions','Speechless',3,['neutral',{lid:.1}],fx('dots',{flat:1}));
A('Reactions','Triggered',1.2,'mad',glitch(.8),tremble(2));
A('Reactions','Bruh',3,[[0,'flat'],[.5,['flat',{y:14}]],[1,'flat']]);
A('Reactions','Oh no',2.4,['worried',{w:72,h:76}],fx('sweat'),tremble(.6));
// Shapes
A('Shapes','Pixel eyes',3,{shape:'pixel',w:72,h:72,r:12},blink([.5],.06),look(wander(20,8,1)));
A('Shapes','Square to circle',3,[[0,{r:2}],[.4,{r:36,w:72,h:72}],[.6,{r:36,w:72,h:72}],[1,{r:2}]]);
A('Shapes','Diamond eyes',2.4,{shape:'diamond',w:70,h:80},pulse(.05,2));
A('Shapes','Twinkling stars',2,{shape:'star',w:78,h:78},each((s,u,t)=>{const k=.65+.35*sin(t*9);s.L.a=k;s.R.a=.65+.35*sin(t*9+2)}));
A('Shapes','Moon eyes',4,{shape:'moon',w:70,h:70},tilt(.08,1));
A('Shapes','Plus eyes',2,{shape:'plus',w:64,h:64},each((s,u)=>{s.L.rot=Math.PI/2*ease(u);s.R.rot=Math.PI/2*ease(u)}));
A('Shapes','Scanner',2,{L:{a:0},R:{w:24,h:70,r:12}},each((s,u)=>{s.R.x=40+240*(.5-.5*cos(TAU*u))-226}));
A('Shapes','Vertical bars',3,{w:22,h:80,r:11},blink([.6],.06),look(wander(26,6,1)));
A('Shapes','Horizontal bars',3,{w:80,h:22,r:11},bob(3,1));
A('Shapes','Cat eyes',3,{shape:'o',w:26,h:76},each((s,u)=>{const k=.5+.5*sin(TAU*u);s.L.w=26+40*k;s.R.w=26+40*k}));
A('Shapes','Cyclops',3,[[0,'neutral'],[.3,{L:{x:66,a:0},R:{x:-66,w:96,h:96,r:30}}],[.8,{L:{x:66,a:0},R:{x:-66,w:96,h:96,r:30}}],[1,'neutral']]);
A('Shapes','Tiny dots',3,'dot',look(wander(36,18,1.4)));
A('Shapes','Rings',2,{shape:'ring',w:70,h:70,lw:12},pulse(.06,2));
A('Shapes','Radar',2.4,{shape:'ring',w:72,h:72,lw:8},fx('radar'));
// Greetings
A('Greetings','Hello',2.4,'happy',blink([.4],.12,'R'),bounce(8,2));
A('Greetings','Goodbye',3.6,[[0,'happy'],[.4,'happy'],[.8,'closed'],[1,'closed']],sway(6,1));
A('Greetings','Welcome back',2.6,[[0,'neutral'],[.2,['joy',{s:1.15}]],[.8,'joy'],[1,'neutral']],fx('sparkle'));
A('Greetings','Good morning',4,[[0,'closed'],[.25,'closed'],[.45,['closed',{sx:1.3}]],[.6,'sleepy'],[.8,'happy'],[1,'happy']],fx('sparkle',{from:.7}));
A('Greetings','Good night',4,[[0,'happy'],[.3,'sleepy'],[.55,'closed'],[1,'closed']],fx('zzz',{from:.6}));
A('Greetings','Thank you',2,'happy',each((s,u)=>{s.g.y+=12*Math.max(0,sin(TAU*u))}),fx('glint'));
A('Greetings','Sorry',2.6,['sad',{lid:.3}],each((s,u)=>{s.g.y+=10*Math.max(0,sin(TAU*u))}));
A('Greetings','Maybe',2.4,'neutral',each((s,u)=>{const k=sin(TAU*u);s.g.rot+=.12*k;s.L.lid=Math.max(0,.3*k);s.R.lid=Math.max(0,-.3*k)}));
A('Greetings','Celebrate',2,'joy',bounce(14,2),fx('confetti'));
A('Greetings','High energy',.9,['big',{bot:.35}],bounce(12,2),fx('sparkle'));
A('Greetings','Hey, look!',2.6,[[0,'neutral'],[.15,['surprised',{x:38}]],[.6,['surprised',{x:38}]],[.75,'neutral'],[1,'neutral']],fx('ex',{from:.12,to:.6}));
A('Greetings','Missed you',4,[[0,'sad'],[.35,'sad'],[.5,'love'],[.9,'love'],[1,'sad']],fx('hearts',{from:.5,to:.92}));

/* ---------- drawing ---------- */
const hex=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
function grad(c,w,h,tint,tc){const g=c.createLinearGradient(0,-h/2,0,h/2),T=hex(tc);for(const [p,c] of STOPS)g.addColorStop(p,`rgb(${c.map((v,i)=>Math.round(v+(T[i]-v)*tint)).join(',')})`);return g}
function rrp(p,x,y,w,h,r){r=Math.max(0,Math.min(r,w/2,h/2));p.moveTo(x+r,y);p.arcTo(x+w,y,x+w,y+h,r);p.arcTo(x+w,y+h,x,y+h,r);p.arcTo(x,y+h,x,y,r);p.arcTo(x,y,x+w,y,r);p.closePath()}
function heartP(p,cx,cy,w,h){const s=w/2,t=h/2;p.moveTo(cx,cy+t);p.bezierCurveTo(cx-s*1.1,cy+t*.15,cx-s*1.05,cy-t*1.05,cx-s*.45,cy-t*.95);p.bezierCurveTo(cx-s*.12,cy-t*.9,cx,cy-t*.55,cx,cy-t*.4);p.bezierCurveTo(cx,cy-t*.55,cx+s*.12,cy-t*.9,cx+s*.45,cy-t*.95);p.bezierCurveTo(cx+s*1.05,cy-t*1.05,cx+s*1.1,cy+t*.15,cx,cy+t);p.closePath()}
function shapeOf(e){const w=e.w,h=e.h,p=new Path2D();switch(e.shape){
 case 'r':rrp(p,-w/2,-h/2,w,h,e.r);return{p};
 case 'line':rrp(p,-w/2,-h/2,w,h,h/2);return{p};
 case 'o':p.ellipse(0,0,w/2,h/2,0,0,TAU);return{p};
 case 'ring':p.ellipse(0,0,w/2,h/2,0,0,TAU);p.ellipse(0,0,Math.max(1,w/2-e.lw),Math.max(1,h/2-e.lw),0,0,TAU);return{p,rule:'evenodd'};
 case 'heart':heartP(p,0,0,w,h);return{p};
 case 'star':{const R=Math.min(w,h)/2,ri=R*.46;for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,q=i%2?ri:R;i?p.lineTo(q*cos(a),q*sin(a)):p.moveTo(q*cos(a),q*sin(a))}p.closePath();return{p}}
 case 'diamond':p.moveTo(0,-h/2);p.lineTo(w/2,0);p.lineTo(0,h/2);p.lineTo(-w/2,0);p.closePath();return{p};
 case 'x':case 'plus':{const t=Math.min(w,h)*.24,L=Math.min(w,h)*.55,a0=e.shape==='x'?Math.PI/4:0;for(const a of [a0,a0+Math.PI/2]){const c=cos(a),s=sin(a);const q=[[-L,-t/2],[L,-t/2],[L,t/2],[-L,t/2]].map(([x,y])=>[x*c-y*s,x*s+y*c]);p.moveTo(...q[0]);q.slice(1).forEach(z=>p.lineTo(...z));p.closePath()}return{p}}
 case 'moon':p.ellipse(0,0,w/2,h/2,0,0,TAU);p.ellipse(w*.22,-h*.12,w*.4,h*.4,0,0,TAU);return{p,rule:'evenodd'};
 case 'pixel':{const c=8,g=1.6;for(let y=-h/2;y<h/2-1;y+=c)for(let x=-w/2;x<w/2-1;x+=c){const cx=x+c/2,cy=y+c/2,dx=Math.max(abs(cx)-(w/2-e.r),0),dy=Math.max(abs(cy)-(h/2-e.r),0);if(dx*dx+dy*dy<=e.r*e.r)p.rect(x+g/2,y+g/2,c-g,c-g)}return{p}}
 case 'arc':p.arc(0,h*.45,w*.46,Math.PI+.55,TAU-.55);return{p,stroke:1};
 case 'u':p.arc(0,-h*.35,w*.44,.6,Math.PI-.6);return{p,stroke:1};
 case 'chev':p.moveTo(-w*.32,-h*.42);p.lineTo(w*.3,0);p.lineTo(-w*.32,h*.42);return{p,stroke:1};
 case 'check':p.moveTo(-w*.4,0);p.lineTo(-w*.1,h*.32);p.lineTo(w*.42,-h*.34);return{p,stroke:1};
 case 'spiral':{for(let i=0;i<=90;i++){const k=i/90,a=k*TAU*2.6,q=k*Math.min(w,h)/2;i?p.lineTo(q*cos(a),q*sin(a)):p.moveTo(0,0)}return{p,stroke:1}}
 case 'spin':p.arc(0,0,Math.min(w,h)/2-e.lw/2,e.ph,e.ph+Math.PI*1.4);return{p,stroke:1};
 default:return{glyph:e.shape}}}
const CX=[94,226],CXK=[105.6,214.4];let EK=.69;
const EX=(side,x)=>EK<1?CXK[side]+x*EK:CX[side]+x;
let DOTS=null;const PITCH=4;
function dots(){if(DOTS&&DOTS.width===oc.width&&DOTS.height===oc.height)return DOTS;DOTS=document.createElement('canvas');DOTS.width=oc.width;DOTS.height=oc.height;const d=DOTS.getContext('2d'),r=PITCH*.26*dpr;
 for(let y=PITCH/2;y<240;y+=PITCH)for(let x=PITCH/2;x<320;x+=PITCH){const X=x*dpr,Y=y*dpr,g=d.createRadialGradient(X,Y,0,X,Y,r*1.45);g.addColorStop(0,'rgba(255,255,255,.95)');g.addColorStop(.55,'rgba(255,255,255,.72)');g.addColorStop(1,'rgba(255,255,255,0)');d.fillStyle=g;d.fillRect(X-r*2,Y-r*2,r*4,r*4)}
 return DOTS}
function drawEye(e,side){if(e.a<=.01)return;const sx=e.sx*e.s,sy=e.sy*e.s;if(abs(sy)<.003||abs(sx)<.003)return;
 const c=octx,m=ctx.getTransform();c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,oc.width,oc.height);c.setTransform(m);
 c.save();c.translate(EX(side,e.x),120+e.y*EK);c.rotate(e.rot);c.scale(EK,EK);if(side===1&&e.shape!=='check')c.scale(-1,1);c.scale(sx,sy);
 const S=shapeOf(e),G=grad(c,e.w,e.h,e.tint,e.tc);
 if(S.glyph){if(side===1)c.scale(-1,1);c.fillStyle=G;c.font=`700 ${e.h}px Outfit,system-ui,sans-serif`;c.textAlign='center';c.textBaseline='middle';c.fillText(S.glyph,0,0)}
 else if(S.stroke){c.strokeStyle=G;c.lineWidth=e.lw;c.lineCap='round';c.lineJoin='round';c.stroke(S.p)}
 else{c.fillStyle=G;c.fill(S.p,S.rule||'nonzero');
  if(e.lid>.001||e.bot>.001){c.globalCompositeOperation='destination-out';c.fillStyle='#000';const w=e.w,h=e.h;
   if(e.lid>.001){const y0=-h/2+e.lid*h,dy=e.slant*h*.32;c.beginPath();c.moveTo(-w,-h);c.lineTo(w,-h);c.lineTo(w,y0+2*dy);c.lineTo(-w,y0-2*dy);c.closePath();c.fill()}
   if(e.bot>.001){const ry=h*.58,cy=h/2+ry-e.bot*h*.82;c.beginPath();c.ellipse(0,cy,w*.62,ry,0,0,TAU);c.fill()}
   c.globalCompositeOperation='source-over'}}
 c.restore();
 c.save();c.setTransform(1,0,0,1,0,0);c.globalCompositeOperation='source-atop';c.drawImage(dots(),0,0);c.restore();
 ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=Math.min(1,e.a);ctx.shadowColor='rgba(190,215,250,.45)';ctx.shadowBlur=9*dpr;ctx.drawImage(oc,0,0);ctx.restore()}
/* ---------- effects ---------- */
const TEAR=a=>`rgba(169,214,247,${a})`,LAV=a=>`rgba(238,234,247,${a})`;
function star4(x,y,r,c){ctx.fillStyle=c;ctx.beginPath();ctx.moveTo(x,y-r);ctx.quadraticCurveTo(x,y,x+r,y);ctx.quadraticCurveTo(x,y,x,y+r);ctx.quadraticCurveTo(x,y,x-r,y);ctx.quadraticCurveTo(x,y,x,y-r);ctx.fill()}
function drop(x,y,s,c){ctx.fillStyle=c;ctx.beginPath();ctx.moveTo(x,y-s*1.5);ctx.bezierCurveTo(x+s*.9,y-s*.2,x+s,y+s,x,y+s);ctx.bezierCurveTo(x-s,y+s,x-s*.9,y-s*.2,x,y-s*1.5);ctx.fill()}
function heartAt(x,y,s,c){const p=new Path2D();heartP(p,x,y,s*2,s*1.85);ctx.fillStyle=c;ctx.fill(p)}
function glyph(g,x,y,sz,c){ctx.fillStyle=c;ctx.font=`700 ${sz}px Outfit,system-ui,sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(g,x,y)}
const eyeSz=e=>[abs(e.w*e.sx*e.s*EK),abs(e.h*e.sy*e.s*EK)];
const FX={
 sparkle(st,u,t){[[44,60],[276,52],[160,34],[56,192],[282,186],[160,212]].forEach(([x,y],i)=>{const k=(sin(t*4.2+i*1.9)+1)/2;star4(x,y,2+7*k,LAV(.25+.75*k))})},
 glint(st){[[st.c.L,st.L,-1],[st.c.R,st.R,1]].forEach(([c,e,sd])=>{if(e.a<.2||e.shape==='line')return;const [w,h]=eyeSz(e);if(h<20)return;ctx.fillStyle='rgba(255,255,255,.95)';ctx.beginPath();ctx.arc(c[0]+sd*w*.2,c[1]-h*.2,5*e.s,0,TAU);ctx.fill();ctx.beginPath();ctx.arc(c[0]-sd*w*.12,c[1]+h*.18,2.4*e.s,0,TAU);ctx.fill()})},
 tearform(st,u,t){const k=(t*.6)%1;[[st.c.L,st.L,1],[st.c.R,st.R,-1]].forEach(([c,e,sd])=>{const [w,h]=eyeSz(e);drop(c[0]+sd*w*.28,c[1]+h/2+4+4*k,3+3*k,TEAR(.95))})},
 tears(st,u,t,o){[[st.c.L,st.L,1],[st.c.R,st.R,-1]].forEach(([c,e,sd])=>{const [w,h]=eyeSz(e);for(let i=0;i<3;i++){const ph=(t*(o.fast?1.3:.8)+i/3)%1;{const y0=c[1]+h/2+6;drop(c[0]+sd*w*.28,y0+ph*Math.max(20,Math.min(80,192-y0)),4.5,TEAR(1-ph))}}})},
 zzz(st,u,t,o){for(let i=0;i<3;i++){const ph=(t*.33+i/3)%1;glyph('Z',236+ph*44,74-ph*56,(o.big?16:11)+ph*16,LAV(sin(Math.PI*ph)))}},
 sweat(st,u,t){const ph=(t*.45)%1;drop(st.c.R[0]+46,st.c.R[1]-38+ph*16,6,TEAR(.9-.5*ph))},
 blush(st){ctx.fillStyle='rgba(255,140,185,.38)';[[st.c.L,st.L],[st.c.R,st.R]].forEach(([c,e])=>{const [,h]=eyeSz(e);ctx.beginPath();ctx.ellipse(c[0],c[1]+Math.max(h/2,20)+10,19,7,0,0,TAU);ctx.fill()})},
 hearts(st,u,t,o){for(let i=0;i<6;i++){const ph=(t*(o.slow?.25:.45)+i/6)%1;heartAt(160+((i%3)-1)*70+sin(ph*6+i)*10,228-ph*200,5+5*sin(Math.PI*ph),`rgba(255,170,205,${sin(Math.PI*ph)})`)}},
 steam(st,u,t){for(const sd of [-1,1])for(let i=0;i<3;i++){const ph=(t*.9+i/3)%1;ctx.fillStyle=`rgba(232,230,242,${(1-ph)*.55})`;ctx.beginPath();ctx.arc(160+sd*(118+ph*14),58-ph*46,4+ph*11,0,TAU);ctx.fill()}},
 notes(st,u,t){for(let i=0;i<3;i++){const ph=(t*.5+i/3)%1;glyph(i%2?'♪':'♫',262+sin(ph*5+i)*12,200-ph*170,22,LAV(sin(Math.PI*ph)))}},
 qm(st,u,t){glyph('?',st.c.R[0]+52,st.c.R[1]-56+3*sin(t*4),36,LAV(1))},
 ex(st,u,t){glyph('!',st.c.R[0]+50,st.c.R[1]-56+3*sin(t*6),38,LAV(1))},
 dots(st,u,t,o){for(let i=0;i<3;i++){ctx.fillStyle=LAV(.9);ctx.beginPath();ctx.arc(142+i*18,208-(o.flat?0:6*Math.max(0,sin(t*6-i*.9))),5,0,TAU);ctx.fill()}},
 bars(st,u,t,o){ctx.fillStyle=LAV(.9);for(let i=0;i<9;i++){const v=abs(sin(t*(o.quiet?5:9)+i*.9))*abs(sin(t*3.3+i*1.7)),hh=4+(o.quiet?10:22)*v,p=new Path2D();rrp(p,160+(i-4)*10-3,210-hh/2,6,hh,3);ctx.fill(p)}},
 progress(st,u){const p=new Path2D();rrp(p,96,204,128,10,5);ctx.strokeStyle=LAV(.5);ctx.lineWidth=1.5;ctx.stroke(p);const q=new Path2D();rrp(q,98,206,124*u,6,3);ctx.fillStyle=LAV(.95);ctx.fill(q)},
 battery(st,u,t,o){const lvl=o.charge?u:o.lvl,b=new Path2D();rrp(b,136,196,44,20,4);ctx.strokeStyle=LAV(.8);ctx.lineWidth=2;ctx.stroke(b);ctx.fillStyle=LAV(.8);ctx.fillRect(181,202,3,8);
  const f=new Path2D();rrp(f,139,199,38*lvl,14,2);ctx.fillStyle=lvl<.25?(sin(t*8)>0?'#ff7a7a':'#7a3030'):LAV(.95);ctx.fill(f);
  if(o.charge){ctx.fillStyle='#000';ctx.beginPath();ctx.moveTo(160,199);ctx.lineTo(153,207);ctx.lineTo(159,207);ctx.lineTo(156,214);ctx.lineTo(164,205);ctx.lineTo(158,205);ctx.closePath();ctx.fill()}},
 wifi(st,u){const k=Math.floor(u*4.999);ctx.strokeStyle=LAV(.9);ctx.lineWidth=3;ctx.lineCap='round';ctx.fillStyle=LAV(.9);ctx.beginPath();ctx.arc(160,216,3,0,TAU);ctx.fill();for(let i=1;i<=3;i++){if(k<i)break;ctx.beginPath();ctx.arc(160,216,i*9,-Math.PI*.75,-Math.PI*.25);ctx.stroke()}},
 bulb(st,u){const on=u>.45&&u<.92;ctx.fillStyle=`rgba(255,240,190,${on?.28:.06})`;ctx.beginPath();ctx.arc(160,34,24,0,TAU);ctx.fill();ctx.fillStyle=on?'#fff6d8':LAV(.35);ctx.beginPath();ctx.arc(160,32,11,0,TAU);ctx.fill();ctx.fillRect(155,42,10,7)},
 cloud(st,u,t){ctx.fillStyle='#8d8aa0';[[146,30,11],[160,24,14],[175,30,10],[160,34,12]].forEach(([x,y,r])=>{ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill()});ctx.strokeStyle=TEAR(.8);ctx.lineWidth=2;for(let i=0;i<6;i++){const ph=(t*1.2+i/6)%1;ctx.beginPath();ctx.moveTo(140+i*8,46+ph*30);ctx.lineTo(138+i*8,52+ph*30);ctx.stroke()}},
 crack(st){ctx.strokeStyle='#000';ctx.lineWidth=4;ctx.lineJoin='round';[st.c.L,st.c.R].forEach(c=>{ctx.beginPath();ctx.moveTo(c[0],c[1]-30);ctx.lineTo(c[0]-6,c[1]-12);ctx.lineTo(c[0]+6,c[1]);ctx.lineTo(c[0]-4,c[1]+14);ctx.lineTo(c[0]+2,c[1]+32);ctx.stroke()})},
 orbit(st,u,t,o){[st.c.L,st.c.R].forEach(c=>{for(let i=0;i<3;i++){const a=t*4+i*TAU/3;star4(c[0]+cos(a)*46,c[1]-44+sin(a)*10,5,o.stars?'#ffe9a8':LAV(.95))}})},
 burst(st,u,t,o){if(u<o.at)return;const k=(u-o.at)/(1-o.at),cols=['#bcdaf0','#d3c3e5','#ffb0cf','#ffe9a8','#eeeaf7'];for(let i=0;i<18;i++){const a=i*TAU/18,r=20+k*170;ctx.fillStyle=cols[i%5];ctx.globalAlpha=Math.max(0,1-k);ctx.beginPath();ctx.arc(160+cos(a)*r,120+sin(a)*r*.75,5*(1-k)+1,0,TAU);ctx.fill()}ctx.globalAlpha=1},
 confetti(st,u,t){const cols=['#bcdaf0','#d3c3e5','#ffb0cf','#ffe9a8','#b8f0d6'];for(let i=0;i<26;i++){const x=(i*53)%320+sin(t*2+i)*8,y=((t*70+i*37)%280)-20;ctx.save();ctx.translate(x,y);ctx.rotate(t*3+i);ctx.fillStyle=cols[i%5];ctx.fillRect(-2,-4,4,8);ctx.restore()}},
 kiss(st,u,t,o){const f=o.from||0;if(u<f)return;const k=(u-f)/(1-f);heartAt(Math.min(st.c.R[0]+20+k*44,262),Math.max(st.c.R[1]-10-k*44,44)+sin(k*8)*4,7+4*k,`rgba(255,170,205,${1-k})`)},
 rec(st,u,t){ctx.fillStyle=`rgba(255,90,90,${.5+.5*sin(t*5)})`;ctx.beginPath();ctx.arc(296,24,6,0,TAU);ctx.fill()},
 radar(st,u,t){ctx.strokeStyle=LAV(.95);ctx.lineWidth=3;ctx.lineCap='round';[st.c.L,st.c.R].forEach(c=>{const a=t*3;ctx.beginPath();ctx.moveTo(c[0],c[1]);ctx.lineTo(c[0]+cos(a)*26,c[1]+sin(a)*26);ctx.stroke()})}
};
const h1=x=>{const s=sin(x)*43758.5453;return s-Math.floor(s)};
function render(st){ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='#000';ctx.fillRect(0,0,cv.width,cv.height);ctx.setTransform(dpr,0,0,dpr,0,0);ctx.translate(LK.x,LK.y);
 ctx.save();ctx.translate(160,120);ctx.rotate(st.g.rot);ctx.scale(st.g.s*st.g.sx,st.g.s);ctx.translate(-160+st.g.x,-120+st.g.y);
 st.c={L:[EX(0,st.L.x),120+st.L.y*EK],R:[EX(1,st.R.x),120+st.R.y*EK]};
 drawEye(st.L,0);drawEye(st.R,1);
 for(const [n,o] of st.fx){if(o.from!==undefined&&st.u<o.from)continue;if(o.to!==undefined&&st.u>o.to)continue;ctx.save();if(FXS[n]){ctx.translate(160,120);ctx.scale(.8,.8);ctx.translate(-160,-120)}FX[n]&&FX[n](st,st.u,st.t,o);ctx.restore()}
 ctx.restore();ctx.setTransform(1,0,0,1,0,0);
 if(st.g.glitch>0){const b=Math.floor(st.t*12);for(let i=0;i<6;i++){if(h1(b*7.1+i*3.3)>st.g.glitch*.75+.15)continue;const y=Math.floor(h1(b+i*9.7)*220),hh=4+Math.floor(h1(b*3+i)*14),dx=(h1(b*5+i*1.3)-.5)*40*st.g.glitch;ctx.drawImage(cv,0,y*dpr,cv.width,hh*dpr,dx*dpr,y*dpr,cv.width,hh*dpr)}}
 if(st.g.dim<1){ctx.fillStyle=`rgba(0,0,0,${1-st.g.dim})`;ctx.fillRect(0,0,cv.width,cv.height)}}

/* ================= SCENES ================= */
/* One material for everything: props are lit in the same gradient and glow as the eyes,
   details are cut out of the light, and each scene may add a single accent colour. */
E.shut={lid:.86};
const SCN=[];function SC(c,n,d,f){SCN.push({c,n,d,f,scene:1})}
const cl=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),seg=(u,a,b)=>cl((u-a)/(b-a)),lerp=(a,b,k)=>a+(b-a)*k;
const eout=k=>1-Math.pow(1-cl(k),3),ein=k=>Math.pow(cl(k),3),eio=k=>ease(cl(k)),eback=k=>back(cl(k));
const damp=(k,f=2.5,z=5)=>k<=0?0:Math.exp(-z*k)*Math.cos(f*TAU*k);
const nz=x=>{const i=Math.floor(x),f=x-i,s=f*f*(3-2*f);return lerp(h1(i*1.7),h1((i+1)*1.7),s)*2-1};
const AC={amber:'#ffb066',rose:'#f59ac0',mint:'#8fe3bf',sky:'#8cc4ff'};
const GLOW='rgba(205,195,250,.42)';
const tone=(tint,tc)=>{const T=hex(tc),m=STOPS[2][1];return`rgb(${m.map((v,i)=>Math.round(v+(T[i]-v)*tint)).join(',')})`};
const lc=document.createElement('canvas'),lx=lc.getContext('2d');
function lum(c,x0,y0,x1,y1,tint=0,tc=AC.amber){const g=c.createLinearGradient(x0,y0,x1,y1),T=hex(tc);for(const[p,col]of STOPS)g.addColorStop(p,`rgb(${col.map((v,i)=>Math.round(v+(T[i]-v)*tint)).join(',')})`);return g}
function LAYER(draw,o={}){if(lc.width!==cv.width||lc.height!==cv.height){lc.width=cv.width;lc.height=cv.height}
 lx.setTransform(1,0,0,1,0,0);lx.globalAlpha=1;lx.globalCompositeOperation='source-over';lx.clearRect(0,0,lc.width,lc.height);lx.setTransform(ctx.getTransform());lx.lineCap='round';lx.lineJoin='round';lx.setLineDash([]);
 draw(lx);
 ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=o.a===undefined?1:cl(o.a);if(o.glow!==0){ctx.shadowColor=o.gc||GLOW;ctx.shadowBlur=(o.glow||9)*dpr}ctx.drawImage(lc,0,0);ctx.restore()}
function cut(c,fn,w=2.6){c.save();c.globalCompositeOperation='destination-out';c.strokeStyle='#000';c.fillStyle='#000';c.lineWidth=w;c.lineCap='round';c.lineJoin='round';c.setLineDash([]);c.beginPath();fn(c);w>0?c.stroke():c.fill();c.restore()}
function atop(c,col,fn){c.save();c.globalCompositeOperation='source-atop';c.fillStyle=col;c.beginPath();fn(c);c.fill();c.restore()}
function amb(x,y,r,col,a){const[R,G,B]=hex(col),g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,`rgba(${R},${G},${B},${a})`);g.addColorStop(1,`rgba(${R},${G},${B},0)`);ctx.fillStyle=g;ctx.fillRect(-40,-40,400,320)}
function dropC(c,x,y,s){c.beginPath();c.moveTo(x,y-s*1.5);c.bezierCurveTo(x+s*.9,y-s*.2,x+s,y+s,x,y+s);c.bezierCurveTo(x-s,y+s,x-s*.9,y-s*.2,x,y-s*1.5);c.fill()}
function txt(s,x,y,sz,c,wt=700){ctx.fillStyle=c;ctx.font=`${wt} ${sz}px Outfit,system-ui,sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(s,x,y)}
function spark(c,x,y,r){c.beginPath();c.moveTo(x,y-r);c.quadraticCurveTo(x,y,x+r,y);c.quadraticCurveTo(x,y,x,y+r);c.quadraticCurveTo(x,y,x-r,y);c.quadraticCurveTo(x,y,x,y-r);c.fill()}
function fillRR(c,x,y,w,h,r){const p=new Path2D();rrp(p,x,y,w,h,r);c.fill(p)}
function taper(c,pts,w0,w1){for(let i=1;i<pts.length;i++){c.lineWidth=lerp(w0,w1,i/(pts.length-1));c.beginPath();c.moveTo(pts[i-1][0],pts[i-1][1]);c.lineTo(pts[i][0],pts[i][1]);c.stroke()}}
/* soft out-of-focus lights and drifting dust, both drawn straight onto the screen */
function bokeh(t,n,seed,cols,a){for(let i=0;i<n;i++){const dir=i%2?1:-1,x=((h1(i*3.1+seed)*360+dir*t*(3+6*h1(i+seed)))%360+360)%360-20,y=h1(i*7.7+seed)*240+Math.sin(t*.3+i)*6,r=10+h1(i*5.3+seed)*20,[R,G,B]=hex(cols[i%cols.length]),k=a*(.6+.4*Math.sin(t*.7+i*2));
 const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,`rgba(${R},${G},${B},${k})`);g.addColorStop(.75,`rgba(${R},${G},${B},${k*.55})`);g.addColorStop(1,`rgba(${R},${G},${B},0)`);ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill()}}
function motes(t,n,seed,a,box=[0,0,320,240]){ctx.fillStyle='#eeeaf7';for(let i=0;i<n;i++){const x=box[0]+((h1(i*2.7+seed)*box[2]+t*(3+4*h1(i)))%box[2]),y=box[1]+((h1(i*6.1+seed)*box[3]-t*(2+3*h1(i*3)))%box[3]+box[3])%box[3];ctx.globalAlpha=a*(.4+.6*Math.sin(t*1.3+i*2)**2);ctx.beginPath();ctx.arc(x,y,.7+h1(i*4.4)*1.1,0,TAU);ctx.fill()}ctx.globalAlpha=1}
function cloudSil(c,x,y,s){c.beginPath();[[-20,4,12],[-6,-5,15],[11,-1,13],[23,5,9]].forEach(([dx,dy,r])=>{c.moveTo(x+(dx+r)*s,y+dy*s);c.arc(x+dx*s,y+dy*s,r*s,0,TAU)});c.fill();fillRR(c,x-32*s,y+1*s,64*s,13*s,6.5*s)}
/* travel with drag k and gravity g after time a (seconds) */
const fly=(v,a,k,g=0)=>{const e=Math.exp(-k*a);return v/k*(1-e)+g/k*(a-(1-e)/k)};
function EYP(p,o={}){const s=o.s??.7,gap=o.gap??132*s,x=o.x??160,y=o.y??112,lk=o.look||[0,0],sq=o.sq||0,bk=o.blink??1;
 [[p.L,0,x-gap/2,o.L],[p.R,1,x+gap/2,o.R]].forEach(([e0,side,cx,ov])=>{const e={...e0,...(ov||{})};e.x=cx-CX[side]+e.x*s+lk[0];e.y=y-120+e.y*s+lk[1];e.s*=s;e.sx*=1+sq;e.sy*=(1-sq)*bk;if(o.a!==undefined)e.a*=o.a;drawEye(e,side)})}
const EY=(spec,o)=>EYP(res(spec),o);
const blinks=(u,ts,len=.03)=>{let k=1;for(const b of ts){const d=abs(u-b);if(d<len)k=Math.min(k,.06+.94*ease(d/len))}return k};
function tiltA(x,y,r,fn){ctx.save();ctx.translate(x,y);ctx.rotate(r);ctx.translate(-x,-y);fn();ctx.restore()}
/* VIX's hands: soft mittens in the eye material. gap cuts a clean outline so the hand reads in front of a prop */
function MITT(c,x,y,o={}){const pose=o.pose||'open',s=o.s||1;c.save();c.translate(x,y);c.rotate(o.r||0);c.scale(o.flip?-s:s,s);
 const G=lum(c,-16,-20,16,18,o.tint||0,o.tc);
 if(pose==='open'){if(o.gap)cut(c,k=>{rrp(k,-14.6,-20.6,30.2,39.2,13.5);k.ellipse(-14.5,5,8.4,12.4,-.55,0,TAU)},0);c.fillStyle=G;fillRR(c,-12,-18,25,34,11);cut(c,k=>{k.moveTo(-3.6,-19);k.lineTo(-3.6,-8);k.moveTo(4.6,-19);k.lineTo(4.6,-8)},2.3);
  cut(c,k=>k.ellipse(-14.5,5,7.8,11.8,-.55,0,TAU),0);c.fillStyle=G;c.beginPath();c.ellipse(-14.5,5,5.2,9.2,-.55,0,TAU);c.fill();cut(c,k=>{k.moveTo(6,4);k.quadraticCurveTo(2,10,-3,11)},1.6)}
 else{if(o.gap)cut(c,k=>{rrp(k,-14.6,-15.6,30.2,32.2,12.5);rrp(k,-19,-3,26,17.5,8.7)},0);c.fillStyle=G;fillRR(c,-12,-13,25,27,10);cut(c,k=>{k.moveTo(-4,-14);k.lineTo(-4,-6);k.moveTo(4.5,-14);k.lineTo(4.5,-6)},2.3);
  cut(c,k=>rrp(k,-16.5,-.5,21,12.5,6.2),0);c.fillStyle=G;fillRR(c,-15,1,18,9.5,4.7)}
 c.restore()}

/* ---------- Morning coffee ---------- */
const tCof=kf([[0,'sleepy'],[.18,'sleepy'],[.26,['sleepy',{lid:.5}]],[.36,{lid:.28}],[.44,'content'],[.57,['content',{lid:.3,bot:.5}]],[.63,'big',back],[.82,'neutral'],[.94,'sleepy'],[1,'sleepy']]);
function steam(c,x,y,t,o={}){const n=o.n||3,H=o.h||42,a=o.a??.7,w=o.w||3.4;c.strokeStyle=lum(c,x-12,y-H,x+12,y);
 for(let i=0;i<n;i++){const ph=(t*.42+i/n+(o.o||0))%1;c.globalAlpha=a*Math.sin(Math.PI*ph);const pts=[];for(let k=0;k<=12;k++){const q=k/12;pts.push([x+(i-(n-1)/2)*9+Math.sin(q*4.6+t*2.1+i*2.1)*4*(.35+q),y-ph*H*.45-q*H*.55])}taper(c,pts,w,w*.2)}c.globalAlpha=1}
function mug(c,x,y,r){c.save();c.translate(x,y);c.rotate(r);const G=lum(c,-26,-30,30,28,.12,AC.amber);c.fillStyle=c.strokeStyle=G;
 fillRR(c,-22,-24,44,50,11);c.beginPath();c.ellipse(0,-24,22,6,0,0,TAU);c.fill();c.lineWidth=7;c.beginPath();c.arc(23,1,11.5,-1.2,1.2);c.stroke();
 cut(c,k=>k.ellipse(0,-24,18.6,4.3,0,0,TAU),0);c.fillStyle=lum(c,-17,-28,17,-20,.85,'#c98a5a');c.beginPath();c.ellipse(0,-23.3,16.6,3.3,0,0,TAU);c.fill();
 cut(c,k=>k.ellipse(0,-24,22,6,0,.25,Math.PI-.25),2.2);cut(c,k=>heartP(k,1,7,15,13.5),0);cut(c,k=>{k.moveTo(-15.5,-11);k.lineTo(-15.5,4)},2);
 MITT(c,36,8,{pose:'hold',s:1.02,gap:1});c.restore()}
function beams(a){ctx.save();for(let i=0;i<3;i++){const x=-34+i*50,w=18+i*7,g=ctx.createLinearGradient(x,0,x+110,240);g.addColorStop(0,`rgba(255,214,170,${.1*a})`);g.addColorStop(1,'rgba(255,214,170,0)');ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(x,-10);ctx.lineTo(x+w,-10);ctx.lineTo(x+w+120,250);ctx.lineTo(x+120,250);ctx.closePath();ctx.fill()}ctx.restore()}
SC('Daily life','Morning coffee',7,(u,t)=>{
 const awake=seg(u,.6,.75)*(1-seg(u,.86,.98));
 amb(160,290,210,AC.amber,.10+.05*awake);beams(.35+.65*awake);motes(t,14,3,.35+.35*awake,[0,0,220,240]);
 const rise=eback(seg(u,.12,.28))*(1-eio(seg(u,.82,.95))),sip=eio(seg(u,.42,.5))-eio(seg(u,.56,.64));
 const nod=u<.12?(u<.085?eio(seg(u,.01,.085)):1-eout(seg(u,.085,.12))):0;
 const mx=154,my=lerp(310,188,rise)-22*sip,lookX=u>.66&&u<.84?13*Math.sin(seg(u,.66,.82)*TAU):0,lookY=lerp(2,11,rise)*(1-sip)-3*sip-6*(u>.6&&u<.84?1:0);
 EYP(tCof(u),{y:90+2*Math.sin(t*1.4)+9*nod-4*sip,look:[lookX,lookY],blink:blinks(u,[.75]),sq:-.05*(u>.11&&u<.14?Math.sin(seg(u,.11,.14)*Math.PI):0)});
 if(rise>.01)LAYER(c=>{steam(c,mx-3,my-33,t,{a:.65*(1-sip)});mug(c,mx,my,-.34*sip)});
 const pop=seg(u,.6,.7);if(pop>0&&pop<1)LAYER(c=>{c.fillStyle=lum(c,40,40,280,140);for(let k=0;k<6;k++){const a=-2.75+k*1.1,R=eout(pop);spark(c,160+Math.cos(a)*(78+26*R),90+Math.sin(a)*(42+16*R),7*Math.sin(Math.PI*pop))}},{glow:8})});

/* ---------- Rainy day ---------- */
const tRain=kf([[0,'neutral'],[.205,'neutral'],[.235,{L:{lid:.42,bot:.3},R:{lid:.08}}],[.3,'annoyed'],[.4,'annoyed'],[.5,'content'],[.86,'content'],[.95,'neutral'],[1,'neutral']]);
SC('Daily life','Rainy day',7,(u,t)=>{
 amb(160,-40,260,AC.sky,.10);
 {const g=ctx.createLinearGradient(0,0,320,0);g.addColorStop(0,'rgba(140,196,255,0)');g.addColorStop(.5,'rgba(140,196,255,.16)');g.addColorStop(1,'rgba(140,196,255,0)');ctx.fillStyle=g;ctx.fillRect(0,225,320,1.6)}
 const enter=eout(seg(u,.3,.4)),leave=ein(seg(u,.9,.98)),open=eback(seg(u,.38,.48))*(1-eio(seg(u,.84,.91)));
 const ux=160,uy=60+(1-enter)*210+leave*210+1.5*Math.sin(t*1.6),W=104*lerp(.1,1,open),H=40*lerp(.55,1,open),GY=226;
 const surf=x=>{const d=(x-ux)/W;return abs(d)<1?uy+H*.15-H*Math.sqrt(1-d*d):1e3};
 const sheltered=open>.6&&enter>.99&&leave<.01;
 LAYER(c=>{for(let i=0;i<54;i++){const z=[.35,.6,1][i%3],sp=170+200*z,len=6+10*z,y=((t*sp+h1(i*3.3)*300)%300)-30,x=h1(i*7.1)*370-10-y*.12;const ys=Math.min(sheltered?surf(x):1e3,GY);
   c.strokeStyle=LAV(1);if(y+len<ys){c.globalAlpha=.16+.5*z;c.lineWidth=.9+1.3*z;c.beginPath();c.moveTo(x,y);c.lineTo(x-len*.12,y+len);c.stroke()}
   else if(ys<GY&&y-ys<16&&z>.5){const k=(y-ys)/16;c.globalAlpha=.7*(1-k);c.fillStyle=LAV(1);for(const d of[-1,1]){c.beginPath();c.arc(x+d*(3+7*k),ys-1-7*Math.sin(Math.PI*k),1.3,0,TAU);c.fill()}}}
  c.globalAlpha=1;c.strokeStyle=LAV(1);c.lineWidth=1.3;for(let i=0;i<9;i++){const r0=t*.8+h1(i*2.2),ph=r0%1,x=h1(i*5.5+Math.floor(r0)*.37)*300+10;c.globalAlpha=.55*(1-ph);c.beginPath();c.ellipse(x,GY+3+(i%3)*3,3+17*ph,(3+17*ph)*.25,0,0,TAU);c.stroke()}c.globalAlpha=1;
  if(u>.15&&u<.3){const k=seg(u,.16,.225),ex=113.8,et=94;if(k<1){c.fillStyle=lum(c,ex-4,0,ex+4,et);dropC(c,ex,lerp(-14,et-4,k*k),3.6)}
   else{const q=seg(u,.225,.29);c.fillStyle=LAV(1-q);for(let j=0;j<5;j++){const a=-Math.PI*(.15+.7*j/4);c.beginPath();c.arc(ex+Math.cos(a)*16*eout(q),et+Math.sin(a)*12*eout(q)+10*q*q,1.8,0,TAU);c.fill()}}}},{glow:4});
 EYP(tRain(u),{y:122,look:[sheltered?3*Math.sin(t*.9):0,u<.36?-7:u<.5?-7*(1-seg(u,.42,.5)):0],blink:blinks(u,[.09,.66])});
 if(enter>0&&leave<1)LAYER(c=>{c.save();c.translate(ux,uy);const G=lum(c,-W,-H,W,H*.5,.3,AC.sky);c.fillStyle=c.strokeStyle=G;
  const n=6,base=H*.15,tip=-H*.82;c.beginPath();c.moveTo(-W,base);c.ellipse(0,base,W,H,0,Math.PI,TAU);for(let i=n;i>0;i--){const x1=-W+2*W*(i-1)/n,x2=-W+2*W*i/n;c.quadraticCurveTo((x1+x2)/2,base-H*.2,x1,base)}c.closePath();c.fill();
  for(let i=0;i<n;i+=2){const x1=-W+2*W*i/n,x2=-W+2*W*(i+1)/n;atop(c,'rgba(70,60,130,.17)',k=>{k.moveTo(0,tip);k.quadraticCurveTo(x1*.55,-H*.62,x1,base+2);k.lineTo(x2,base+2);k.quadraticCurveTo(x2*.55,-H*.62,0,tip)})}
  cut(c,k=>{for(let i=1;i<n;i++){const xb=-W+2*W*i/n;k.moveTo(0,tip);k.quadraticCurveTo(xb*.55,-H*.62,xb,base-H*.06)}},2);cut(c,k=>k.ellipse(0,base-H*.62,W*.72,H*.5,0,Math.PI+.5,Math.PI+1.05),1.8);
  c.fillStyle=G;c.beginPath();c.arc(0,tip-4,3.4,0,TAU);c.fill();c.lineWidth=4;c.beginPath();c.moveTo(0,base-2);c.lineTo(0,142);c.arc(-8,142,8,0,Math.PI);c.stroke();cut(c,k=>{k.moveTo(-3,96);k.lineTo(3,96)},1.6);
  if(sheltered){c.fillStyle=LAV(1);for(let i=0;i<=n;i++){const ph=(t*.9+h1(i*4.4))%1,x=-W+2*W*i/n;c.globalAlpha=1-ph;dropC(c,x,base+3+ph*ph*70,2.2)}c.globalAlpha=1}
  MITT(c,0,130,{pose:'hold',s:1.3,gap:1});c.restore()})});

/* ---------- Goodnight ---------- */
const tNight=kf([[0,'shut'],[.1,'shut'],[.16,{L:{lid:.86},R:{lid:.55}}],[.26,{L:{lid:.86},R:{lid:.55}}],[.31,'shut'],[1,'shut']]);
SC('Daily life','Goodnight',8,(u,t)=>{
 amb(70,40,210,'#7f8cf0',.13);amb(160,250,200,'#3a3f8a',.12);
 LAYER(c=>{c.fillStyle=LAV(1);for(let i=0;i<26;i++){const x=h1(i*5.7+1)*320,y=h1(i*9.1+2)*170,z=.3+.7*h1(i*3.3),tw=.5+.5*Math.sin(t*(.8+h1(i)*1.4)+i*2);if(Math.hypot(x-70,y-50)<34)continue;c.globalAlpha=(.2+.6*tw)*z;spark(c,x,y,(1.6+2.6*z)*(.6+.4*tw))}
  c.strokeStyle=LAV(1);[[168,26],[236,74],[292,22]].forEach(([x,y],i)=>{const tw=.5+.5*Math.sin(t*1.1+i*2.3);c.globalAlpha=.5+.5*tw;spark(c,x,y,3+2.4*tw);c.globalAlpha=.35*tw;c.lineWidth=1.1;c.beginPath();c.moveTo(x-11*tw,y);c.lineTo(x+11*tw,y);c.moveTo(x,y-11*tw);c.lineTo(x,y+11*tw);c.stroke()});c.globalAlpha=1;
  const k=seg(u,.55,.63);if(k>0&&k<1){const e=eio(k),hx=lerp(186,312,e),hy=lerp(14,62,e),dx=126,dy=48,L=Math.hypot(dx,dy),pts=[...Array(8)].map((_,j)=>[hx-dx/L*j*7*(.4+.6*Math.sin(Math.PI*k)),hy-dy/L*j*7*(.4+.6*Math.sin(Math.PI*k))]);c.globalAlpha=Math.sin(Math.PI*k);c.strokeStyle=LAV(1);taper(c,pts,2.6,0);spark(c,hx,hy,3.4);c.globalAlpha=1}},{glow:6});
 LAYER(c=>{const mx=70,my=50+3*Math.sin(t*.5);c.fillStyle=lum(c,mx-22,my-22,mx+22,my+22);c.beginPath();c.arc(mx,my,21,0,TAU);c.fill();cut(c,k=>k.arc(mx-11,my-8,17.5,0,TAU),0);
  cut(c,k=>{k.moveTo(mx+15.5,my+4);k.arc(mx+12.5,my+4,3,0,TAU);k.moveTo(mx+8.2,my+14);k.arc(mx+6,my+14,2.2,0,TAU);k.moveTo(mx+17.6,my-5);k.arc(mx+16,my-5,1.6,0,TAU)},1.3)},{glow:16,gc:'rgba(200,205,255,.55)'});
 LAYER(c=>{c.fillStyle=lum(c,0,40,320,120);cloudSil(c,((t*5)%440)-70,34,.8);cloudSil(c,((t*3.2+250)%460)-80,80,1)},{a:.12,glow:0});
 const br=Math.sin(t*TAU/4),pk=eio(seg(u,.14,.18))*(1-eio(seg(u,.26,.3)));
 EYP(tNight(u),{y:124+2.5*br,look:[-10*pk,-6*pk],sq:.03*br});
 const env=seg(u,.32,.4)*(1-seg(u,.92,.995));
 if(env>0)LAYER(c=>{c.strokeStyle=lum(c,210,20,290,100);for(let i=0;i<3;i++){const ph=(t/2.6+i/3)%1,x=224+ph*42+Math.sin(ph*6+i)*5,y=100-ph*72,s=6+ph*10;c.lineWidth=1.8+ph*1.6;c.globalAlpha=env*Math.sin(Math.PI*ph);c.beginPath();c.moveTo(x-s/2,y-s/2);c.lineTo(x+s/2,y-s/2);c.lineTo(x-s/2,y+s/2);c.lineTo(x+s/2,y+s/2);c.stroke()}c.globalAlpha=1},{glow:6})});

/* ---------- Charging ---------- */
SC('Daily life','Charging',6,(u,t)=>{
 amb(160,210,190,AC.mint,.09);
 const ch=lerp(.18,1,eio(seg(u,.06,.78))),full=seg(u,.78,.84),show=seg(u,0,.05)*(1-seg(u,.94,1)),pct=Math.round(ch*100);
 const p=u<.8?res('content'):u<.92?res('joy'):res('content');
 EYP(p,{y:84,s:.64,blink:blinks(u,[.28,.58]),look:[0,4],sq:-.06*damp((u-.8)/.1,1.6,4)});
 LAYER(c=>{const G=lum(c,96,150,224,206);c.strokeStyle=c.fillStyle=G;
  c.lineWidth=4;c.beginPath();c.moveTo(34,250);c.bezierCurveTo(34,196,64,180,84,180);c.stroke();fillRR(c,80,171,16,18,4);cut(c,k=>{k.moveTo(85,175);k.lineTo(85,185);k.moveTo(89.5,175);k.lineTo(89.5,185)},1.6);fillRR(c,96,175,6,3,1.2);fillRR(c,96,182,6,3,1.2);
  for(let i=0;i<3;i++){const q=(t*.7+i/3)%1,mt=1-q,bx=mt*mt*mt*34+3*mt*mt*q*34+3*mt*q*q*64+q*q*q*84,by=mt*mt*mt*250+3*mt*mt*q*196+3*mt*q*q*180+q*q*q*180;c.globalAlpha=Math.sin(Math.PI*q)*(1-full*.8);c.fillStyle='#ffffff';c.beginPath();c.arc(bx,by,2.6,0,TAU);c.fill()}
  c.globalAlpha=1;c.fillStyle=G;c.lineWidth=4.5;const o=new Path2D();rrp(o,102,158,112,44,13);c.stroke(o);fillRR(c,218,171,7,18,3);
  c.globalAlpha=show;c.fillStyle=lum(c,108,164,210,196,.65*(1-.6*Math.sin(Math.PI*full)),AC.mint);fillRR(c,109,165,98*ch,30,8);c.globalAlpha=1;
  cut(c,k=>{for(let i=0;i<7;i++){const ph=(t*.55+h1(i*1.3))%1,bx=112+h1(i*9.2)*Math.max(0,98*ch-8),by=192-ph*24,r=1.5*Math.sin(Math.PI*ph);if(r>.2&&bx<104+98*ch){k.moveTo(bx+r,by);k.arc(bx,by,r,0,TAU)}}},0);
  {const ph=(t/2.4)%1,x=lerp(70,250,ph);atop(c,'rgba(255,255,255,.28)',k=>{k.moveTo(x,150);k.lineTo(x+13,150);k.lineTo(x-5,210);k.lineTo(x-18,210)})}
  const bs=(1-eio(seg(u,.78,.82)))*(1+.06*Math.exp(-((t*2)%1)*5));if(bs>.01){const B=[[4,-15],[-8,2],[-1,2],[-4,15],[8,-2],[1,-2]].map(([x,y])=>[158+x*bs,180+y*bs]);
   cut(c,k=>{B.forEach(([x,y],i)=>i?k.lineTo(x,y):k.moveTo(x,y));k.closePath()},5);c.fillStyle=G;c.beginPath();B.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill()}
  if(u>.8){const k=eout(seg(u,.8,.87));cut(c,k2=>{k2.moveTo(144,181);k2.lineTo(154,190);k2.lineTo(172,170)},8*k);c.strokeStyle='#ffffff';c.lineWidth=4;c.setLineDash([46*k,99]);c.beginPath();c.moveTo(144,181);c.lineTo(154,190);c.lineTo(172,170);c.stroke();c.setLineDash([]);
   const r=seg(u,.8,.9);if(r<1){c.globalAlpha=1-r;c.strokeStyle=lum(c,90,140,230,220,.6,AC.mint);c.lineWidth=2.4;const q=new Path2D();rrp(q,102-14*r,158-10*r,112+28*r,44+20*r,13+8*r);c.stroke(q);c.globalAlpha=1}}});
 txt(pct+'%',160,222,15,LAV(.8*Math.max(.25,show)),600);
 const pop=seg(u,.8,.9);if(pop>0&&pop<1)LAYER(c=>{c.fillStyle=lum(c,60,40,260,140,.4,AC.mint);for(let k=0;k<5;k++){const a=-2.6+k*1.3;spark(c,160+Math.cos(a)*(72+24*eout(pop)),84+Math.sin(a)*(40+14*eout(pop)),6.5*Math.sin(Math.PI*pop))}},{glow:8})});

/* ---------- Hello ---------- */
const tHi=kf([[0,'neutral'],[.04,'neutral'],[.08,['neutral',{lid:.12}]],[.14,'happy',back],[.38,'happy'],[.42,{L:{lid:.86},R:{bot:.55}}],[.5,{L:{lid:.86},R:{bot:.55}}],[.55,'happy'],[.8,'happy'],[.9,'neutral'],[1,'neutral']]);
const hiWave=u=>{const wk=seg(u,.18,.72);return(wk>0&&wk<1?1:0)*.42*Math.sin(wk*TAU*2.5)*(1-.4*wk)};
SC('Daily life','Hello wave',4,(u,t)=>{
 amb(250,240,160,'#b9a8ff',.08);
 const up=eback(seg(u,.06,.2))*(1-eio(seg(u,.74,.86))),wk=seg(u,.18,.72),on=wk>0&&wk<1?1:0,sw=Math.sin(wk*TAU*2.5),wave=hiWave(u),antic=u>.03&&u<.09?Math.sin(seg(u,.03,.09)*Math.PI):0;
 tiltA(160,110,.05*up,()=>EYP(tHi(u),{y:106-3*abs(sw)*on+4*antic,sq:.1*antic,blink:blinks(u,[.93])}));
 const px=262,py=lerp(330,214,up);
 if(up>.01&&on)LAYER(c=>{[.028,.014].forEach((d,j)=>{c.save();c.globalAlpha=j?.35:.18;c.translate(px,py);c.rotate(-.18+hiWave(u-d));MITT(c,0,-32,{s:1.5});c.restore()})},{glow:0});
 if(up>.01)LAYER(c=>{c.save();c.translate(px,py);c.rotate(-.18+wave);MITT(c,0,-32,{s:1.5});c.restore();
  const m=cl((abs(sw)-.55)/.45)*on;if(m>0){c.strokeStyle=LAV(m*.8);c.lineWidth=2.4;const a0=-Math.PI/2-.18+wave,d=sw>0?1:-1;for(const r of[60,68]){c.beginPath();c.arc(px,py,r,a0+d*.28,a0+d*.5,d<0);c.stroke()}}
  const sp=seg(u,.2,.3);if(sp>0&&sp<1){c.fillStyle=lum(c,220,100,300,180);spark(c,px-38,py-62-6*sp,5*Math.sin(Math.PI*sp));spark(c,px+24,py-74-8*sp,3.6*Math.sin(Math.PI*sp))}})});

/* ---------- Headphones ---------- */
function note(c,x,y,s,two){c.save();c.translate(x,y);c.scale(s,s);c.beginPath();c.ellipse(0,0,5,3.8,-.35,0,TAU);c.fill();c.lineWidth=2.2;c.beginPath();c.moveTo(4.2,-1);c.lineTo(4.2,-18);
 if(two){c.lineTo(15.2,-21);c.lineTo(15.2,-4);c.stroke();c.lineWidth=4;c.beginPath();c.moveTo(4.2,-17);c.lineTo(15.2,-20);c.stroke();c.beginPath();c.ellipse(11,-3,5,3.8,-.35,0,TAU);c.fill()}
 else{c.quadraticCurveTo(13,-14,10.5,-6);c.stroke()}c.restore()}
SC('Moments','Headphones',4,(u,t)=>{
 const b=(t*2)%1,pu=Math.exp(-b*7),sway=Math.sin(t*Math.PI);
 amb(160,260,230,AC.rose,.07+.07*pu);
 LAYER(c=>{c.fillStyle=lum(c,0,196,0,236,.6,AC.rose);for(let i=0;i<15;i++){const env=1-abs(i-7)/10,h=4+28*env*(.35+.65*abs(nz(t*2.6+i*.9)))*(.65+.35*pu);fillRR(c,160+(i-7)*10-2.75,232-h,5.5,h,2.75)}},{a:.5,glow:5,gc:'rgba(245,154,192,.4)'});
 ctx.save();ctx.translate(0,-5*pu);tiltA(160,118,.05*sway,()=>{
  EY('carets',{y:122,s:.8,sq:.07*pu});
  LAYER(c=>{const G=lum(c,40,24,280,160);c.strokeStyle=c.fillStyle=G;c.lineWidth=10;c.beginPath();c.ellipse(160,124,99,94,0,Math.PI+.26,TAU-.26);c.stroke();
   cut(c,k=>k.ellipse(160,124,99,94,0,Math.PI+.33,TAU-.33),2.4);
   for(const sx of[-1,1]){const x=160+sx*97,y=130;c.fillStyle=G;fillRR(c,x-4,92,8,14,3);cut(c,k=>{k.moveTo(x-6,101.5);k.lineTo(x+6,101.5);k.moveTo(x-6,105.5);k.lineTo(x+6,105.5)},1.6);
    fillRR(c,x-13,y-24,26,50,12);cut(c,k=>rrp(k,x-6.5,y-16,13,34,6),2.2);cut(c,k=>{for(let i=0;i<3;i++){k.moveTo(x+1.4,y-7+i*7);k.arc(x,y-7+i*7,1.4,0,TAU)}},0)}
   c.strokeStyle=lum(c,0,80,320,180,.55,AC.rose);for(const sx of[-1,1])for(const lag of[0,.3]){const q=((t*2)%1+1-lag)%1,x=160+sx*97;c.globalAlpha=(1-q)*.75;c.lineWidth=2.4*(1-q)+.6;c.beginPath();const a0=sx>0?0:Math.PI;c.arc(x,130,20+26*q,a0-.55,a0+.55);c.stroke()}c.globalAlpha=1})});
 ctx.restore();
 LAYER(c=>{c.fillStyle=c.strokeStyle=lum(c,0,0,320,200,.6,AC.rose);for(let i=0;i<6;i++){const n=Math.floor(t*2)-i,age=t-n/2;if(age<0||age>3)continue;const sd=n%2?1:-1;
  c.globalAlpha=Math.min(1,age*5)*(1-age/3);note(c,160+sd*(92+12*age)+Math.sin(age*3+n)*5,82-24*age,.9+.15*h1(n),h1(n*3.1)>.6)}c.globalAlpha=1},{glow:7,gc:'rgba(245,154,192,.45)'})});

/* ---------- Birthday ---------- */
const tBd=kf([[0,'big'],[.3,'big'],[.36,['focused',{h:78}]],[.42,['focused',{h:80}]],[.45,['squint',{lid:.4,bot:.36}]],[.5,['squint',{lid:.4,bot:.36}]],[.56,'joy',back],[.88,'joy'],[.95,'big'],[1,'big']]);
const CONF=[...Array(46)].map((_,i)=>{const a=-Math.PI/2+(h1(i*2.3)-.5)*2.3,v=150+h1(i*5.1)*170;return{vx:Math.cos(a)*v,vy:Math.sin(a)*v,sp:(h1(i*7.7)-.5)*14,ph:h1(i*1.9)*6,col:[tone(0,AC.amber),tone(.7,AC.amber),tone(.65,AC.rose),tone(.6,AC.mint)][i%4],w:5+h1(i*3.7)*3,rib:i%6===0}});
const CANDLES=[142,160,178];
SC('Moments','Birthday cake',7,(u,t)=>{
 const out=seg(u,.44,.5)*(1-seg(u,.92,1));
 bokeh(t,9,4,[AC.amber,AC.rose,'#b9a8ff'],.10*(1-.5*out));
 amb(160,120,170,AC.amber,.13*(1-out));
 const inh=eio(seg(u,.32,.42)),blow=seg(u,.42,.47),rel=1-eio(seg(u,.47,.6));
 EYP(tBd(u),{y:70-6*inh+8*blow*rel,s:.6,sq:-.08*inh*(1-blow)+.12*blow*rel,blink:blinks(u,[.14,.8]),look:[0,u<.3?6:0]});
 if(u>.42&&u<.54)LAYER(c=>{const k=seg(u,.42,.54);c.strokeStyle=LAV(Math.sin(Math.PI*k)*.8);c.lineWidth=2.4;for(let i=0;i<3;i++){const x=144+i*16,y=96+k*16;c.beginPath();c.moveTo(x-6,y);c.quadraticCurveTo(x,y+6,x+6,y);c.stroke()}});
 LAYER(c=>{const G=lum(c,96,120,224,230);c.fillStyle=c.strokeStyle=G;
  c.beginPath();c.ellipse(160,226,84,6.5,0,0,TAU);c.fill();
  CANDLES.forEach(x=>{fillRR(c,x-3.5,126,7,28,3);c.lineWidth=1.8;c.beginPath();c.moveTo(x,126);c.lineTo(x,121);c.stroke();cut(c,k=>{for(let j=0;j<3;j++){k.moveTo(x-3.5,134+j*7);k.lineTo(x+3.5,130+j*7)}},1.5)});
  c.fillStyle=G;cut(c,k=>rrp(k,99,177,122,47,14),0);fillRR(c,101,179,118,43,12);cut(c,k=>{k.moveTo(104,221.4);k.lineTo(216,221.4)},2.4);
  cut(c,k=>{k.moveTo(102,191);for(let j=0;j<6;j++){const xa=102+j*19.3,yb=191+(j%2?11:6);k.quadraticCurveTo(xa+4,yb,xa+9.6,yb);k.quadraticCurveTo(xa+15,yb,xa+19.3,191)}},2.3);
  cut(c,k=>{[[118,206,.5],[140,212,-.6],[162,203,.2],[184,211,.9],[204,204,-.3],[128,214,1.2],[196,214,-1],[150,206,1.4]].forEach(([x,y,a])=>{k.moveTo(x-2.6*Math.cos(a),y-2.6*Math.sin(a));k.lineTo(x+2.6*Math.cos(a),y+2.6*Math.sin(a))})},2.1);
  c.fillStyle=G;cut(c,k=>rrp(k,121.5,147.5,77,33,11.5),0);fillRR(c,124,150,72,29,9.5);
  cut(c,k=>{k.moveTo(125,160);for(let j=0;j<4;j++){const xa=125+j*17.5,yb=160+(j%2?8:5);k.quadraticCurveTo(xa+3.5,yb,xa+8.75,yb);k.quadraticCurveTo(xa+14,yb,xa+17.5,160)}},2.1);
  c.fillStyle=G;for(let j=0;j<5;j++){c.beginPath();c.arc(130+j*15,149,3.6,0,TAU);c.fill()}cut(c,k=>{for(let j=0;j<5;j++){k.moveTo(126.4+j*15,151.6);k.quadraticCurveTo(130+j*15,154,133.6+j*15,151.6)}},1.4)});
 const fl=(1-eio(seg(u,.43,.49)))+eback(seg(u,.92,1));if(fl>.01)LAYER(c=>{CANDLES.forEach((x,i)=>{const lean=(i-1)*.5*blow+.12*nz(t*6+i*5),sy=fl*(1+.12*nz(t*9+i*3));c.save();c.translate(x,121);c.rotate(lean);c.scale(fl,sy);c.fillStyle=lum(c,-5,-16,5,2,.78,AC.amber);c.beginPath();c.moveTo(0,-16);c.bezierCurveTo(5.5,-7,6,-1,0,2);c.bezierCurveTo(-6,-1,-5.5,-7,0,-16);c.fill();cut(c,k=>k.ellipse(0,-3.4,2.3,4,0,0,TAU),0);c.fillStyle='#fff6e6';c.beginPath();c.ellipse(0,-2.6,1.2,2.4,0,0,TAU);c.fill();c.restore()})},{glow:14,gc:'rgba(255,170,90,.75)'});
 if(u>.47&&u<.75)LAYER(c=>{CANDLES.forEach((x,i)=>steam(c,x,120,t+i,{n:1,h:46,a:.5*(1-seg(u,.62,.75)),w:2.6,o:i*.33}))},{glow:3});
 const age=(u-.52)*7;if(age>0&&age<2.6)LAYER(c=>{CONF.forEach(p=>{const x=160+fly(p.vx,age,1.6),y=140+fly(p.vy,age,1.6,240),r=p.ph+p.sp*age;c.globalAlpha=1-seg(age,1.9,2.6);c.save();c.translate(x,y);c.rotate(r);
  if(p.rib){c.strokeStyle=p.col;c.lineWidth=2.2;c.beginPath();for(let j=0;j<=8;j++){const q=j/8;j?c.lineTo(-9+18*q,Math.sin(q*TAU*1.2+age*8)*3):c.moveTo(-9,Math.sin(age*8)*3)}c.stroke()}
  else{c.fillStyle=p.col;c.scale(1,Math.cos(r*1.7));c.fillRect(-p.w/2,-1.8,p.w,3.6)}c.restore()});c.globalAlpha=1},{glow:5})});

/* ---------- Butterfly ---------- */
const tBf=kf([[0,'neutral'],[.1,'big'],[.46,'big'],[.53,{L:{bot:.5},R:{bot:.3}}],[.76,{L:{bot:.5},R:{bot:.3}}],[.83,'happy'],[.95,'neutral'],[1,'neutral']]);
function crm(P,k){const n=P.length-1,f=cl(k)*n,i=Math.min(n-1,Math.floor(f)),q=f-i,p0=P[Math.max(0,i-1)],p1=P[i],p2=P[i+1],p3=P[Math.min(n,i+2)];
 return[0,1].map(j=>.5*(2*p1[j]+(-p0[j]+p2[j])*q+(2*p0[j]-5*p1[j]+4*p2[j]-p3[j])*q*q+(-p0[j]+3*p1[j]-3*p2[j]+p3[j])*q*q*q))}
const BIN=[[-30,70],[60,36],[118,74],[196,34],[262,58],[206,84]],BOUT=[[206,84],[238,58],[214,30],[282,22],[352,48]];
function bfly(c,x,y,f,bank){c.save();c.translate(x,y);c.rotate(bank);c.scale(1.2,1.2);const G=lum(c,-22,-18,22,16,.55,AC.rose);
 for(const sx of[-1,1]){c.save();c.scale(sx*(.16+.84*f),1);c.fillStyle=G;c.beginPath();c.ellipse(10,-6,11,9,-.5,0,TAU);c.fill();c.beginPath();c.ellipse(7.5,7,7.5,6.5,.5,0,TAU);c.fill();
  cut(c,k=>{k.moveTo(3,-2);k.lineTo(15,-11);k.moveTo(3,3);k.lineTo(10,10)},1.6);cut(c,k=>{k.moveTo(15.6,-5);k.arc(13.6,-5,2,0,TAU);k.moveTo(10.4,8.5);k.arc(9.2,8.5,1.2,0,TAU)},0);cut(c,k=>k.ellipse(10,-6,11,9,-.5,-1.9,.5),1.2);c.restore()}
 cut(c,k=>rrp(k,-3.6,-11.5,7.2,24,3.6),0);c.fillStyle=lum(c,-3,-11,3,12);fillRR(c,-2.1,-10,4.2,21,2.1);cut(c,k=>{k.moveTo(-2,3);k.lineTo(2,3);k.moveTo(-2,6.5);k.lineTo(2,6.5)},1);
 c.strokeStyle=c.fillStyle;c.lineWidth=1.7;c.beginPath();c.moveTo(-1,-9);c.quadraticCurveTo(-3,-16,-7,-19);c.moveTo(1,-9);c.quadraticCurveTo(3,-16,7,-19);c.stroke();c.beginPath();c.arc(-7,-19,1.4,0,TAU);c.arc(7,-19,1.4,0,TAU);c.fill();c.restore()}
function flower(c,x,y,s,t,i){const tx=x+Math.sin(t*1.1+i*1.7)*3*s,G=c.fillStyle;c.lineWidth=2.2*s;c.beginPath();c.moveTo(x,246);c.quadraticCurveTo(x,y+(246-y)*.5,tx,y);c.stroke();c.beginPath();c.ellipse(lerp(x,tx,.4)+5*s,y+(246-y)*.55,6*s,2.6*s,-.6,0,TAU);c.fill();
 for(let k=0;k<5;k++){const a=k*TAU/5+i;c.beginPath();c.ellipse(tx+Math.cos(a)*5.2*s,y+Math.sin(a)*5.2*s,4.6*s,3.2*s,a,0,TAU);c.fill()}cut(c,k=>k.arc(tx,y,2.6*s,0,TAU),0);c.fillStyle=G}
SC('Moments','Butterfly',8,(u,t)=>{
 amb(160,120,220,AC.rose,.06);amb(160,260,200,AC.mint,.06);
 LAYER(c=>{c.fillStyle=c.strokeStyle=lum(c,0,180,320,240,.3,AC.rose);[[22,206,.8],[70,220,.6],[262,200,.9],[300,222,.65],[128,228,.5],[226,230,.5]].forEach(([x,y,s],i)=>flower(c,x,y,s,t,i));
  c.lineWidth=1.8;for(let i=0;i<22;i++){const x=h1(i*3.9)*320,hgt=8+h1(i*5.2)*14,sw=Math.sin(t*1.3+i)*2.5;c.beginPath();c.moveTo(x,242);c.quadraticCurveTo(x+1,242-hgt*.6,x+sw,242-hgt);c.stroke()}},{a:.55,glow:4});
 let bx,by,f,bank=0,path=null,kk=0;if(u<.5){kk=eio(u/.5);path=BIN;[bx,by]=crm(BIN,kk);const[qx]=crm(BIN,Math.min(1,kk+.01));bank=cl((qx-bx)*.08,-.35,.35);f=abs(Math.cos(t*TAU*6))*(1-seg(u,.46,.5)*.5)}
 else if(u<.78){bx=206;by=84;f=.55+.45*Math.cos((u-.5)*8*TAU*.55)}
 else{kk=eio(seg(u,.78,1));path=BOUT;[bx,by]=crm(BOUT,kk);const[qx]=crm(BOUT,Math.min(1,kk+.01));bank=cl((qx-bx)*.08,-.35,.35);f=abs(Math.cos(t*TAU*6))}
 const imp=damp((u-.5)/.12,1.5,4);
 EYP(tBf(u),{y:124,look:[cl((bx-160)*.1,-14,14),cl((by-124)*.12,-12,8)],R:{sy:1-.1*imp},blink:blinks(u,[.35,.9])});
 if(path)LAYER(c=>{c.fillStyle=lum(c,0,0,320,160,.4,AC.rose);for(let j=1;j<10;j++){const k2=kk-j*.011;if(k2<0)break;const[x,y]=crm(path,k2);c.globalAlpha=.8*(1-j/10);spark(c,x+Math.sin(j*2.3+t*3)*3,y+6+j*1.2,2.6*(1-j/10))}c.globalAlpha=1},{glow:5,gc:'rgba(245,154,192,.4)'});
 LAYER(c=>bfly(c,bx,by,f,bank),{glow:8,gc:'rgba(245,154,192,.45)'})});

/* ---------- Sneeze ---------- */
const tSn=kf([[0,'neutral'],[.1,'neutral'],[.14,['neutral',{h:76}]],[.17,{lid:.16}],[.2,{lid:.16}],[.24,{lid:.3,bot:.06}],[.3,{lid:.3,bot:.06}],[.34,{lid:.44,bot:.12}],[.44,{lid:.5,bot:.14}],[.465,['squint',{lid:.6,bot:.42}]],[.56,['squint',{lid:.6,bot:.42}]],[.64,'neutral'],[.76,'neutral'],[.8,'suspicious'],[.9,'suspicious'],[.97,'neutral'],[1,'neutral']]);
const DROPS=[...Array(30)].map((_,i)=>{const a=Math.PI*(.06+.88*h1(i*4.7)),v=110+h1(i*2.9)*190;return{vx:Math.cos(a)*v*1.25,vy:Math.sin(a)*v-40,r:1.8+h1(i*6.1)*2}});
function pollen(c,x,y,r,rot){c.save();c.translate(x,y);c.rotate(rot);c.fillStyle=c.strokeStyle=lum(c,-6,-6,6,6,.5,AC.amber);c.beginPath();c.arc(0,0,r,0,TAU);c.fill();c.lineWidth=1.3;c.beginPath();for(let i=0;i<10;i++){const a=i*TAU/10;c.moveTo(Math.cos(a)*r,Math.sin(a)*r);c.lineTo(Math.cos(a)*(r+3.6),Math.sin(a)*(r+3.6))}c.stroke();c.restore()}
SC('Moments','Sneeze',5,(u,t)=>{
 const inh=eio(seg(u,.12,.44)),step=[.17,.24,.34].reduce((s,b)=>s+3*eout(seg(u,b,b+.02)),0),snap=u>.45?damp((u-.45)/.2,1.3,3.2):0,post=u>.45;
 let px,py,pr=t*1.5,pa=1;if(u<.12){const k=eio(seg(u,0,.12));px=lerp(-14,160,k);py=lerp(58,104,k)+Math.sin(k*9)*9}else if(u<.455){px=160+2*Math.sin(t*3);py=104+2*Math.sin(t*2.3)}else{const a=(u-.455)*5;px=160+fly(320,a,1.2);py=104+fly(-260,a,1.2,120);pr=t*1.5+a*12;pa=1-seg(a,.3,.8)}
 const conv=eio(seg(u,.1,.16))*(1-seg(u,.44,.46)),lkx=u<.12?cl((px-160)*.06,-12,0):0,tr=u>.37&&u<.45?1.2*Math.sin(t*70):0,lx_=u>.78&&u<.92?-14*Math.sin(seg(u,.78,.92)*Math.PI*2):0;
 const sh=post?1-seg(u,.46,.58):0;ctx.save();if(sh>0)ctx.translate(nz(t*38)*5*sh,nz(t*38+9)*4*sh);
 EYP(tSn(u),{y:post?116+16*snap:116-8*inh-step,sq:post?.24*snap:-.1*inh,look:[tr+lx_+lkx,u<.16?-6*conv-(u<.12?6*(1-seg(u,0,.12)):0):-4*conv],L:{x:10*conv},R:{x:-10*conv},blink:blinks(u,[.66,.71],.022)});
 if(pa>0)LAYER(c=>pollen(c,px,py,2.6,pr),{a:pa,glow:6,gc:'rgba(255,176,102,.5)'});
 if(u>.455&&u<.58)LAYER(c=>{const k=seg(u,.455,.58);c.strokeStyle=LAV(.9*(1-k));c.lineWidth=3.2;for(let i=0;i<10;i++){const a=i*TAU/10+.3,r0=62+40*eout(k),r1=r0+14*(1-k);c.beginPath();c.moveTo(160+Math.cos(a)*r0*1.35,124+Math.sin(a)*r0*.8);c.lineTo(160+Math.cos(a)*r1*1.35,124+Math.sin(a)*r1*.8);c.stroke()}},{glow:6});
 const age=(u-.455)*5;if(age>0&&age<1.3)LAYER(c=>{c.fillStyle=LAV(1);DROPS.forEach(p=>{c.globalAlpha=1-seg(age,.7,1.3);c.beginPath();c.arc(160+fly(p.vx,age,3),140+fly(p.vy,age,3,260),p.r*(1-.4*seg(age,0,1.3)),0,TAU);c.fill()});c.globalAlpha=1},{glow:5});
 ctx.restore()});

/* ---------- Bright idea ---------- */
const tIdea=kf([[0,['focused',{L:{lid:.38,slant:.15}}]],[.34,['focused',{L:{lid:.38,slant:.15}}]],[.4,'big',back],[.5,'big'],[.56,'joy'],[.86,'joy'],[.94,['focused',{L:{lid:.38,slant:.15}}]],[1,['focused',{L:{lid:.38,slant:.15}}]]]);
SC('Moments','Bright idea',6,(u,t)=>{
 const bs=eback(seg(u,.36,.44))*(1-eio(seg(u,.88,.96))),lit=seg(u,.44,.46)*(u<.5?(.75+.25*Math.sign(Math.sin(t*90))):1)*(1-seg(u,.86,.9)),wob=.22*damp((u-.38)/.2,1.6,3.5);
 amb(160,50,150,AC.amber,.16*lit);motes(t,10,7,.25*lit,[60,0,200,120]);
 const lk=u<.34?[-12+2*nz(t*.8),-10]:u<.88?[0,-12*(1-seg(u,.56,.62))-6*seg(u,.56,.62)]:[-12*seg(u,.9,.98),-10*seg(u,.9,.98)];
 EYP(tIdea(u),{y:140,s:.66,look:lk,blink:blinks(u,[.2,.72])});
 if(u<.4)LAYER(c=>{c.fillStyle=lum(c,226,30,272,66);[[232,64],[248,50],[266,40]].forEach(([x,y],i)=>{const a=seg(u,.06+i*.07,.1+i*.07),m=seg(u,.34,.39),px=lerp(x,160,eio(m)),py=lerp(y,52,eio(m)),r=(3.2+i*1.2)*eback(a)*(1+.12*Math.sin(t*5+i))*(1-m);if(r>.1){c.beginPath();c.arc(px,py,r,0,TAU);c.fill()}})},{glow:6});
 if(bs>.01){if(lit>0)LAYER(c=>{c.strokeStyle=lum(c,110,0,210,100,.45,AC.amber);const g=eout(seg(u,.45,.55));for(let i=0;i<10;i++){const a=i*TAU/10+t*.3,L=(i%2?8:13)*g*(1+.12*Math.sin(t*4+i));c.lineWidth=i%2?2.2:3;c.beginPath();c.moveTo(160+Math.cos(a)*29*bs,50+Math.sin(a)*29*bs);c.lineTo(160+Math.cos(a)*(29+L)*bs,50+Math.sin(a)*(29+L)*bs);c.stroke()}
   c.fillStyle=lum(c,100,0,220,100,.3,AC.amber);[[112,30,0],[214,72,2],[204,20,4]].forEach(([x,y,o])=>{const tw=Math.sin(t*2.2+o);if(tw>0)spark(c,x,y,4.5*tw)})},{a:lit,glow:8,gc:'rgba(255,176,102,.6)'});
  LAYER(c=>{c.save();c.translate(160,50);c.rotate(wob);c.scale(bs,bs);const G=lum(c,-18,-18,18,30,.7*lit,AC.amber);c.fillStyle=G;c.beginPath();c.arc(0,-2,17,0,TAU);c.fill();c.beginPath();c.moveTo(-10,10);c.lineTo(10,10);c.lineTo(7,21);c.lineTo(-7,21);c.closePath();c.fill();
   const fil=k=>{k.moveTo(-6,7);k.lineTo(-4,-3);k.lineTo(-1.3,2);k.lineTo(1.3,-3);k.lineTo(4,2);k.lineTo(6,7)};
   if(lit>.5){cut(c,fil,4.2);c.strokeStyle='#fffaf0';c.lineWidth=1.8;c.beginPath();fil(c);c.stroke()}else cut(c,fil,2.2);
   cut(c,k=>k.arc(0,-2,12.5,3.55,4.45),2.2);cut(c,k=>{k.moveTo(-9,22.5);k.lineTo(9,22.5)},2.4);
   c.fillStyle=lum(c,-8,23,8,32);fillRR(c,-7.5,23.5,15,9,3);cut(c,k=>{k.moveTo(-8,26.5);k.lineTo(8,28);k.moveTo(-8,29.5);k.lineTo(8,31)},1.5);c.beginPath();c.arc(0,33,2.6,0,Math.PI);c.fill();c.restore()},{glow:lit>0?16:9,gc:lit>0?`rgba(255,176,102,${.35+.4*lit})`:GLOW})}});

function renderScene(it,tt){const u=(tt/it.d)%1;ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=1;ctx.shadowBlur=0;ctx.setLineDash([]);ctx.globalCompositeOperation='source-over';ctx.fillStyle='#000';ctx.fillRect(0,0,cv.width,cv.height);ctx.setTransform(dpr,0,0,dpr,0,0);ctx.save();it.f(u,tt);ctx.restore();ctx.shadowBlur=0;ctx.globalAlpha=1}
/* ================= SAFE AREA ================= */
/* Nothing may start at, touch or glow onto the screen edge, so the panel's size never shows.
   Items that came in from the edges are gone; effects that drifted outwards are pulled in;
   a soft black frame removes any stray light near the border. */
const DITCH_EYES=new Set(['Peek from the left','Peek from the right','Hide and seek','Peekaboo','Celebrate','Recording','Mind blown']);
for(let i=AN.length-1;i>=0;i--)if(DITCH_EYES.has(AN[i].n))AN.splice(i,1);
SCN.length=0;
const FXS={sparkle:1,zzz:1,hearts:1,steam:1,notes:1,dots:1,bars:1,progress:1,battery:1,wifi:1,bulb:1,cloud:1};
let EFR=null;
function edgeFrame(){if(EFR&&EFR.width===cv.width&&EFR.height===cv.height)return EFR;
 EFR=document.createElement('canvas');EFR.width=cv.width;EFR.height=cv.height;const fx=EFR.getContext('2d'),im=fx.createImageData(cv.width,cv.height),k=cv.width/320,C=34,A=6,B=18;
 for(let py=0;py<cv.height;py++)for(let px=0;px<cv.width;px++){const x=(px+.5)/k,y=(py+.5)/k,
  d=Math.min(x,320-x,y,240-y,(x+y-C)/Math.SQRT2,(320-x+y-C)/Math.SQRT2,(x+240-y-C)/Math.SQRT2,(560-x-y-C)/Math.SQRT2),q=Math.max(0,Math.min(1,(d-A)/(B-A)));
  im.data[(py*cv.width+px)*4+3]=Math.round((1-q*q*(3-2*q))*255)}
 fx.putImageData(im,0,0);return EFR}
function applyFrame(){ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=1;ctx.shadowBlur=0;ctx.globalCompositeOperation='source-over';ctx.drawImage(edgeFrame(),0,0);ctx.restore()}

/* ================= COLOURFUL SCENES ================= */
/* Every prop, glow and particle stays inside x 30-290, y 26-214. */
const PC={red:'#ff5d73',orange:'#ff9f43',yellow:'#ffd93d',lime:'#a3e635',green:'#34d399',teal:'#2dd4bf',cyan:'#38bdf8',blue:'#60a5fa',violet:'#a78bfa',pink:'#f472b6',white:'#f8fafc'};
const RGBA=(h,a)=>{const[r,g,b]=hex(h);return`rgba(${r},${g},${b},${a})`};
const LT=(h,k)=>`rgb(${hex(h).map(v=>Math.round(v+(255-v)*k)).join(',')})`;
const DK=(h,k)=>`rgb(${hex(h).map(v=>Math.round(v*(1-k))).join(',')})`;
const fadeIO=(u,a=.06,b=.08)=>seg(u,0,a)*(1-seg(u,1-b,1));
const popIn=k=>k<=0?0:k>=1?1:back(k);
function ball(c,x,y,r,col){const g=c.createRadialGradient(x-r*.35,y-r*.45,r*.08,x,y,r*1.05);g.addColorStop(0,LT(col,.65));g.addColorStop(.45,col);g.addColorStop(1,DK(col,.25));c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,TAU);c.fill()}
function star5(c,x,y,r){c.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,rr=i%2?r*.45:r;c.lineTo(x+cos(a)*rr,y+sin(a)*rr)}c.closePath();c.fill()}
function smooth(c,pts){const n=pts.length,m=(a,b)=>[(a[0]+b[0])/2,(a[1]+b[1])/2];let p=m(pts[n-1],pts[0]);c.beginPath();c.moveTo(p[0],p[1]);for(let i=0;i<n;i++){const q=m(pts[i],pts[(i+1)%n]);c.quadraticCurveTo(pts[i][0],pts[i][1],q[0],q[1])}c.closePath();c.fill()}

/* ---------- Rainbow ---------- */
const RBW=[PC.red,PC.orange,PC.yellow,PC.lime,PC.cyan,PC.blue,PC.violet];
const tRbw=kf([[0,'neutral'],[.1,'neutral'],[.16,'big'],[.3,'happy'],[.78,'happy'],[.9,'neutral'],[1,'neutral']]);
SC('Colour','Rainbow',8,(u,t)=>{
 const k=eio(seg(u,.14,.5)),f=1-seg(u,.82,.95),c1=popIn(seg(u,.08,.2))*f,c2=popIn(seg(u,.46,.58))*f;
 if(k>0&&f>0)LAYER(c=>{c.lineCap='butt';RBW.forEach((col,i)=>{c.strokeStyle=col;c.lineWidth=7.6;c.beginPath();c.arc(160,150,112-i*7.4,Math.PI,Math.PI+Math.PI*k);c.stroke()})},{a:f,glow:10,gc:'rgba(255,220,200,.35)'});
 LAYER(c=>{c.fillStyle='#f8fafc';[[66,150,c1],[254,150,c2]].forEach(([x,y,s])=>{if(s<=0)return;c.save();c.translate(x,y);c.scale(s,s);cloudSil(c,0,0,1);c.restore()})},{glow:8,gc:'rgba(220,235,255,.5)'});
 if(k>.7)LAYER(c=>{[[-120,PC.yellow],[-90,PC.pink],[-60,PC.cyan]].forEach(([d,col],i)=>{const a=d*Math.PI/180;c.fillStyle=col;spark(c,160+cos(a)*50,150+sin(a)*50,3+3*abs(sin(t*3+i*1.7)))})},{a:f*seg(k,.7,1),glow:6,gc:'rgba(255,255,255,.4)'});
 EYP(tRbw(u),{y:146+2*sin(t*1.5),gap:84,s:.56,look:[0,k>0&&k<1?-6:0],blink:blinks(u,[.6])});
});

/* ---------- Fireworks ---------- */
const FWK=[{at:.06,x:98,y:86,r:38,c:PC.pink,c2:PC.yellow},{at:.24,x:222,y:80,r:38,c:PC.cyan,c2:PC.white},{at:.42,x:160,y:72,r:34,c:PC.yellow,c2:PC.orange},{at:.58,x:118,y:98,r:30,c:PC.lime,c2:PC.cyan},{at:.7,x:206,y:100,r:32,c:PC.violet,c2:PC.pink}];
const tFw=kf([[0,'neutral'],[.08,'big'],[.2,'joy'],[.3,'big'],[.44,'big'],[.48,'star'],[.62,'star'],[.66,'joy'],[.86,'happy'],[.95,'neutral'],[1,'neutral']]);
SC('Colour','Fireworks',9,(u,t)=>{
 let lx=0,ly=-6;
 FWK.forEach((f,i)=>{const L=.07,B=.2,ka=(u-f.at)/L,kb=(u-f.at-L)/B;
  if(ka>0&&ka<1){const y=lerp(196,f.y,eout(ka));LAYER(c=>{c.strokeStyle=f.c;c.lineWidth=2;c.beginPath();c.moveTo(f.x,Math.min(196,y+26));c.lineTo(f.x,y);c.stroke();c.fillStyle='#fff';c.beginPath();c.arc(f.x,y,2.2,0,TAU);c.fill()},{glow:8,gc:RGBA(f.c,.6)});lx=(f.x-160)*.08;ly=-6-(196-y)*.03}
  if(kb>0&&kb<1){amb(f.x,f.y,Math.min(56,f.y-22,f.x-22,298-f.x),f.c,.2*(1-kb));if(kb<.12)LAYER(c=>{c.fillStyle='#fff';c.beginPath();c.arc(f.x,f.y,6*(1-kb/.12),0,TAU);c.fill()},{glow:12,gc:RGBA(f.c,.8)});
   LAYER(c=>{for(let j=0;j<28;j++){const a=j*TAU/28+i,rr=f.r*eout(kb)*(j%3?1:.62),dy=18*kb*kb,x=f.x+cos(a)*rr,y=f.y+sin(a)*rr+dy;c.fillStyle=c.strokeStyle=j%2?f.c:f.c2;c.globalAlpha=1-kb*kb;c.beginPath();c.arc(x,y,3*(1-.5*kb),0,TAU);c.fill();c.lineWidth=1.8;c.globalAlpha=(1-kb)*.7;c.beginPath();c.moveTo(f.x+cos(a)*rr*.6,f.y+sin(a)*rr*.6+dy*.6);c.lineTo(x,y);c.stroke()}c.globalAlpha=1},{glow:9,gc:RGBA(f.c,.55)});
   if(kb<.5){lx=(f.x-160)*.08;ly=(f.y-150)*.06}}});
 EYP(tFw(u),{y:158,gap:100,s:.58,look:[lx,ly],blink:blinks(u,[.9])});
});

/* ---------- Aquarium ---------- */
const FISH=[{c:PC.orange,c2:PC.white,ph:0,sp:.13,rx:100,ry:50,cy:118,s:1},{c:PC.blue,c2:PC.yellow,ph:.4,sp:-.1,rx:92,ry:60,cy:126,s:.85},{c:PC.pink,c2:PC.violet,ph:.75,sp:.16,rx:104,ry:38,cy:112,s:.7}];
function fishD(c,x,y,s,dir,col,col2,w){c.save();c.translate(x,y);c.scale(dir*s,s);
 const g=c.createLinearGradient(0,-10,0,10);g.addColorStop(0,LT(col,.35));g.addColorStop(1,DK(col,.15));c.fillStyle=g;
 c.beginPath();c.moveTo(-12,0);c.lineTo(-23,-8+w*2);c.lineTo(-20,0);c.lineTo(-23,8+w*2);c.closePath();c.fill();
 c.beginPath();c.ellipse(0,0,15,9.5,0,0,TAU);c.fill();
 c.save();c.beginPath();c.ellipse(0,0,15,9.5,0,0,TAU);c.clip();c.fillStyle=col2;c.globalAlpha=.9;c.fillRect(-3.4,-10,3.4,20);c.fillRect(5,-10,2.2,20);c.restore();
 c.fillStyle=col2;c.beginPath();c.moveTo(-4,-8);c.quadraticCurveTo(2,-16,8,-7.6);c.closePath();c.fill();
 c.fillStyle='#0b0b12';c.beginPath();c.arc(9,-2,2,0,TAU);c.fill();c.fillStyle='#fff';c.beginPath();c.arc(9.6,-2.6,.7,0,TAU);c.fill();c.restore()}
const tFsh=kf([[0,'neutral'],[.1,'big'],[.3,'happy'],[.5,'big'],[.7,'content'],[.9,'neutral'],[1,'neutral']]);
SC('Colour','Aquarium',10,(u,t)=>{
 const f=fadeIO(u,.08,.1);amb(160,120,96,PC.cyan,.12*f);amb(160,150,66,PC.blue,.08*f);
 const P=FISH.map((F,i)=>{const a=TAU*(F.ph+F.sp*t);return{F,a,x:160+cos(a)*F.rx,y:F.cy+sin(a)*F.ry+3*sin(t*2+i),dir:Math.sign(-sin(a)*F.sp)||1,front:sin(a)>0}});
 LAYER(c=>{c.strokeStyle='rgba(200,240,255,.9)';c.lineWidth=1.2;for(let i=0;i<14;i++){const ph=(t*.35+h1(i*3.3))%1,x=62+h1(i*7.1)*196+sin(t*2+i)*4,y=192-ph*130,r=1.5+3*h1(i*2.2)*(.5+ph*.5);c.globalAlpha=sin(Math.PI*ph)*f;c.beginPath();c.arc(x,y,r,0,TAU);c.stroke()}c.globalAlpha=1},{glow:4,gc:'rgba(150,220,255,.5)'});
 const drawF=p=>LAYER(c=>fishD(c,p.x,p.y,p.F.s*(p.front?1:.82),p.dir,p.F.c,p.F.c2,sin(t*10+p.a)),{a:f*(p.front?1:.6),glow:6,gc:RGBA(p.F.c,.5)});
 P.filter(p=>!p.front).forEach(drawF);
 const near=P.filter(p=>p.front).sort((a,b)=>abs(a.x-160)-abs(b.x-160))[0];
 EYP(tFsh(u),{y:120,gap:100,s:.58,look:near?[cl((near.x-160)*.08,-12,12),cl((near.y-120)*.1,-8,8)]:[0,0],blink:blinks(u,[.4,.85])});
 P.filter(p=>p.front).forEach(drawF);
});

/* ---------- Balloons ---------- */
const BAL=[{x:86,y:92,c:PC.red},{x:122,y:68,c:PC.yellow},{x:160,y:58,c:PC.cyan},{x:198,y:68,c:PC.lime},{x:234,y:92,c:PC.violet}];
const tBal=kf([[0,'neutral'],[.12,'big'],[.25,'joy'],[.7,'happy'],[.88,'content'],[1,'neutral']]);
SC('Colour','Balloons',8,(u,t)=>{
 const KX=160,KY=200,f=1-seg(u,.86,.97);
 const P=BAL.map((b,i)=>{const k=eout(seg(u,.06+i*.06,.3+i*.06));return{...b,k,i,r:lerp(5,18,k),bx:lerp(KX,b.x,k)+3*sin(t*1.3+i*1.7),by:lerp(KY-20,b.y,k)+3*sin(t*1.7+i)-10*seg(u,.8,.97)}});
 LAYER(c=>{c.lineWidth=1;c.strokeStyle='rgba(255,255,255,.55)';P.forEach(p=>{if(p.k<=0)return;c.beginPath();c.moveTo(p.bx,p.by+p.r*1.12);c.quadraticCurveTo((p.bx+KX)/2+6*sin(t*2+p.i),(p.by+KY)/2,KX,KY);c.stroke()})},{a:f,glow:0});
 EYP(tBal(u),{y:150,gap:96,s:.56,look:[0,-6],blink:blinks(u,[.5])});
 LAYER(c=>{P.forEach(p=>{if(p.k<=0)return;c.save();c.translate(p.bx,p.by);c.scale(1,1.12);ball(c,0,0,p.r,p.c);c.restore();c.fillStyle=DK(p.c,.2);c.beginPath();c.moveTo(p.bx-2.5,p.by+p.r*1.12+3);c.lineTo(p.bx+2.5,p.by+p.r*1.12+3);c.lineTo(p.bx,p.by+p.r*1.12-1);c.fill()});
  if(P[0].k>0){c.fillStyle=PC.pink;c.beginPath();c.ellipse(KX-5,KY,5,3,-.4,0,TAU);c.ellipse(KX+5,KY,5,3,.4,0,TAU);c.fill()}},{a:f,glow:7,gc:'rgba(255,240,220,.35)'});
});

/* ---------- Ice cream ---------- */
const tIce=kf([[0,'neutral'],[.1,'neutral'],[.18,'big'],[.3,'big'],[.34,'love'],[.62,'love'],[.67,'joy'],[.88,'happy'],[1,'neutral']]);
function scoop(c,x,y,r,col){ball(c,x,y,r,col);c.fillStyle=DK(col,.08);for(let i=0;i<5;i++){c.beginPath();c.arc(x-r*.8+i*r*.4,y+r*.62,r*.26,0,TAU);c.fill()}}
SC('Colour','Ice cream',8,(u,t)=>{
 const X=222,f=1-seg(u,.88,.98),k0=popIn(seg(u,.04,.14)),s1=popIn(seg(u,.16,.26)),s2=popIn(seg(u,.28,.38)),s3=popIn(seg(u,.4,.5)),ch=popIn(seg(u,.52,.6)),sp=seg(u,.6,.7);
 LAYER(c=>{
  if(k0>0){c.save();c.translate(X,150);c.scale(k0,k0);const g=c.createLinearGradient(-20,0,20,0);g.addColorStop(0,'#f0b56a');g.addColorStop(1,'#c98a3e');c.fillStyle=g;c.beginPath();c.moveTo(-21,0);c.lineTo(21,0);c.lineTo(0,52);c.closePath();c.fill();
   c.save();c.clip();c.strokeStyle='rgba(120,70,20,.45)';c.lineWidth=1.2;for(let i=-4;i<=4;i++){c.beginPath();c.moveTo(i*8-8,0);c.lineTo(i*8+16,48);c.moveTo(i*8+8,0);c.lineTo(i*8-16,48);c.stroke()}c.restore();c.restore()}
  [[s1,142,21,'#6ee7b7'],[s2,118,19,'#f9a8d4'],[s3,97,17,'#fcd34d']].forEach(([s,y,r,col])=>{if(s<=0)return;c.save();c.translate(X,y);c.scale(s,s);scoop(c,0,0,r,col);c.restore()});
  if(ch>0){c.save();c.translate(X,78);c.scale(ch,ch);c.strokeStyle='#4d7c0f';c.lineWidth=1.6;c.beginPath();c.moveTo(0,-4);c.quadraticCurveTo(3,-12,8,-14);c.stroke();ball(c,0,0,6,'#ef4444');c.restore()}
  if(sp>0){const cols=[PC.pink,PC.cyan,PC.lime,PC.violet,PC.red,PC.blue];for(let i=0;i<12;i++){const a=h1(i*3.1)*Math.PI*1.1+Math.PI*1.95,d=4+h1(i*7.3)*11;c.save();c.translate(X+cos(a)*d,97-3+sin(a)*d*.7);c.rotate(h1(i*9.1)*TAU);c.globalAlpha=seg(sp,i/14,i/14+.2);c.fillStyle=cols[i%6];fillRR(c,-2.4,-.9,4.8,1.8,.9);c.restore()}c.globalAlpha=1}
 },{a:f,glow:7,gc:'rgba(255,220,200,.35)'});
 EYP(tIce(u),{x:112,y:118,gap:84,s:.54,look:[12,4],blink:blinks(u,[.3,.8])});
});

/* ---------- Planets ---------- */
const PLN=[{rx:116,ry:30,tl:-.12,sp:.09,r:9,c:PC.orange,ph:.1},{rx:84,ry:52,tl:.18,sp:-.13,r:7,c:PC.teal,ph:.6},{rx:102,ry:44,tl:.05,sp:.06,r:12,c:PC.pink,ph:.35,ring:1}];
const tPl=kf([[0,'neutral'],[.15,'big'],[.35,'content'],[.6,'big'],[.8,'happy'],[1,'neutral']]);
SC('Colour','Planets',10,(u,t)=>{
 const f=fadeIO(u,.06,.08),SC4=[PC.white,PC.cyan,PC.yellow,PC.pink];
 for(let i=0;i<34;i++){const a=h1(i*5.1)*TAU,rr=Math.sqrt(h1(i*9.3)),x=160+cos(a)*rr*116,y=120+sin(a)*rr*82,b=(.35+.65*abs(sin(t*1.6+i*2.1)))*f;ctx.fillStyle=RGBA(SC4[i%4],b);ctx.beginPath();ctx.arc(x,y,.8+h1(i*3.7)*1.2,0,TAU);ctx.fill()}
 amb(160,120,96,PC.violet,.07*f);
 const P=PLN.map(p=>{const a=TAU*(p.ph+p.sp*t),x0=cos(a)*p.rx,y0=sin(a)*p.ry;return{...p,x:160+x0*cos(p.tl)-y0*sin(p.tl),y:120+x0*sin(p.tl)+y0*cos(p.tl),front:sin(a)>0}});
 const drawP=p=>LAYER(c=>{const s=p.front?1:.8,r=p.r*s;if(p.ring){c.strokeStyle=RGBA(PC.yellow,.9);c.lineWidth=2.2*s;c.beginPath();c.ellipse(p.x,p.y,r*1.9,r*.55,-.3,Math.PI,TAU);c.stroke()}
   ball(c,p.x,p.y,r,p.c);if(p.ring){c.beginPath();c.ellipse(p.x,p.y,r*1.9,r*.55,-.3,0,Math.PI);c.stroke()}},{a:f*(p.front?1:.7),glow:8,gc:RGBA(p.c,.5)});
 P.filter(p=>!p.front).forEach(drawP);
 const ss=seg(u,.52,.6);if(ss>0&&ss<1)LAYER(c=>{const x=232-60*ss,y=52+24*ss;c.strokeStyle='#fff';c.lineWidth=2;c.globalAlpha=sin(Math.PI*ss);c.beginPath();c.moveTo(x,y);c.lineTo(x+22,y-9);c.stroke();c.globalAlpha=1},{glow:6,gc:'rgba(255,255,255,.6)'});
 EYP(tPl(u),{y:120,gap:96,s:.56,look:[cl((P[0].x-160)*.06,-10,10),cl((P[0].y-120)*.08,-6,6)],blink:blinks(u,[.3,.75])});
 P.filter(p=>p.front).forEach(drawP);
});

/* ---------- Sunset ---------- */
const tSun=kf([[0,'neutral'],[.15,'content'],[.7,'content'],[.8,['content',{lid:.3}]],[.9,'happy'],[1,'neutral']]);
SC('Colour','Sunset',10,(u,t)=>{
 const f=fadeIO(u,.06,.08),k=eio(seg(u,.08,.82)),sy=lerp(80,176,k),ga=(1-.6*k)*f;
 const gr=Math.max(30,Math.min(96,sy-22,214-sy));amb(160,sy,gr+20,PC.orange,.22*ga);amb(160,Math.min(sy+14,190),Math.max(24,gr-10),PC.pink,.18*ga);amb(160,96,74,PC.violet,.10*f);
 LAYER(c=>{const g=c.createLinearGradient(0,sy-30,0,sy+30);g.addColorStop(0,'#ffe16b');g.addColorStop(.55,'#ff9f43');g.addColorStop(1,'#ff5d8f');c.fillStyle=g;c.beginPath();c.arc(160,sy,28,0,TAU);c.fill()},{a:f*(1-seg(sy,160,178)),glow:16,gc:'rgba(255,170,90,.6)'});
 LAYER(c=>{c.strokeStyle='#ffe9d6';c.lineWidth=2;for(let i=0;i<2;i++){const bu=seg(u,.2+i*.12,.6+i*.12);if(bu<=0||bu>=1)continue;const x=90+140*bu,y=78-10*i+6*sin(bu*9),w=4*sin(t*9+i*2);c.globalAlpha=sin(Math.PI*bu);c.beginPath();c.moveTo(x-7,y-w);c.quadraticCurveTo(x-3,y-3,x,y);c.quadraticCurveTo(x+3,y-3,x+7,y-w);c.stroke()}c.globalAlpha=1},{glow:4,gc:'rgba(255,220,200,.4)'});
 LAYER(c=>{const g=c.createLinearGradient(0,166,0,208);g.addColorStop(0,'#3ec9a7');g.addColorStop(1,'#1d6f8a');c.fillStyle=g;c.beginPath();c.moveTo(52,184);c.quadraticCurveTo(160,158,268,184);c.quadraticCurveTo(232,196,206,200);c.quadraticCurveTo(160,212,114,200);c.quadraticCurveTo(88,196,52,184);c.fill();
  c.strokeStyle='#9a6b4c';c.lineWidth=3;c.beginPath();c.moveTo(214,176);c.quadraticCurveTo(220,156,212,140);c.stroke();c.fillStyle='#4ade80';[[-1,-.2],[1,.1],[-.4,-.9],[.6,-.7]].forEach(([dx,dy])=>{c.beginPath();c.ellipse(212+dx*10,140+dy*6,12,3.4,Math.atan2(dy,dx),0,TAU);c.fill()})},{a:f,glow:6,gc:'rgba(80,220,180,.35)'});
 EYP(tSun(u),{y:118,gap:100,s:.54,blink:blinks(u,[.4,.7])});
});

/* ---------- Flower pot ---------- */
const FLW=[{x:126,y:120,c:PC.red,c2:PC.yellow,at:.2},{x:160,y:102,c:PC.violet,c2:PC.yellow,at:.3},{x:194,y:122,c:PC.yellow,c2:PC.orange,at:.4}];
const tFlw=kf([[0,'neutral'],[.1,'neutral'],[.2,['neutral',{y:6}]],[.45,'big'],[.55,'joy'],[.8,'happy'],[.92,'neutral'],[1,'neutral']]);
SC('Colour','Flower pot',9,(u,t)=>{
 const f=1-seg(u,.88,.98),pk=popIn(seg(u,.04,.14));
 LAYER(c=>{
  FLW.forEach((F,i)=>{const g=eio(seg(u,F.at-.1,F.at+.1)),b=popIn(seg(u,F.at+.06,F.at+.18));if(g<=0)return;const sx=160+(F.x-160)*.35,sy=176,tx=lerp(sx,F.x,g)+2*sin(t*1.3+i),ty=lerp(sy,F.y,g),sd=i===0?-1:1;
   c.strokeStyle='#34d399';c.lineWidth=2.6;c.beginPath();c.moveTo(sx,sy);c.quadraticCurveTo(sx,(sy+ty)/2,tx,ty);c.stroke();
   c.fillStyle='#22c55e';c.beginPath();c.ellipse(lerp(sx,tx,.5)+sd*6,lerp(sy,ty,.55),7*g,2.8*g,-sd*.6,0,TAU);c.fill();
   if(b>0){c.save();c.translate(tx,ty);c.scale(b,b);c.rotate(t*.3*(i%2?1:-1));for(let p=0;p<6;p++){const a=p*TAU/6;c.fillStyle=p%2?F.c:LT(F.c,.25);c.beginPath();c.ellipse(cos(a)*8,sin(a)*8,7,4.6,a,0,TAU);c.fill()}c.fillStyle=F.c2;c.beginPath();c.arc(0,0,4.6,0,TAU);c.fill();c.restore()}});
  if(pk>0){c.save();c.translate(160,190);c.scale(pk,pk);const g=c.createLinearGradient(0,-14,0,18);g.addColorStop(0,'#ff8a5b');g.addColorStop(1,'#c2410c');c.fillStyle=g;c.beginPath();c.moveTo(-22,-10);c.lineTo(22,-10);c.lineTo(17,16);c.lineTo(-17,16);c.closePath();c.fill();c.fillStyle='#ff9f6e';fillRR(c,-25,-16,50,8,3);c.restore()}
 },{a:f,glow:7,gc:'rgba(255,200,150,.35)'});
 const bu=seg(u,.5,.9);if(bu>0&&bu<1)LAYER(c=>{const a=bu*TAU*1.5,x=160+70*sin(a),y=104+22*sin(2*a),dir=cos(a)>0?1:-1;c.save();c.translate(x,y);c.scale(dir,1);c.fillStyle='rgba(220,240,255,.8)';c.beginPath();c.ellipse(-1,-6,4,6+2*sin(t*40),-.4,0,TAU);c.fill();c.fillStyle=PC.yellow;c.beginPath();c.ellipse(0,0,7,5,0,0,TAU);c.fill();c.fillStyle='#1f1f1f';c.fillRect(-2.5,-5,2,10);c.fillRect(1.5,-5,2,10);c.restore()},{a:sin(Math.PI*bu),glow:4,gc:'rgba(255,220,120,.5)'});
 EYP(tFlw(u),{y:62,gap:88,s:.46,look:[0,6],blink:blinks(u,[.35,.75])});
});

/* ---------- Disco ---------- */
const tDsc=kf([[0,'neutral'],[.1,'big'],[.2,'joy'],[.36,'joy'],[.4,'carets'],[.5,'carets'],[.54,'joy'],[.66,'joy'],[.7,'carets'],[.8,'carets'],[.84,'happy'],[.94,'neutral'],[1,'neutral']]);
SC('Colour','Disco',8,(u,t)=>{
 const f=fadeIO(u,.05,.08),bp=popIn(seg(u,.03,.13)),beat=abs(sin(t*Math.PI*2)),cols=[PC.pink,PC.cyan,PC.yellow,PC.lime,PC.violet,PC.orange];
 for(let i=0;i<10;i++){const a=t*(.6+.15*(i%3))+i*TAU/10,x=160+cos(a)*110,y=150+sin(a*1.3)*42,r=10+4*sin(t*3+i),g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,RGBA(cols[i%6],.5*f));g.addColorStop(1,RGBA(cols[i%6],0));ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill()}
 LAYER(c=>{c.save();c.translate(160,62);c.scale(bp,bp);ball(c,0,0,22,'#9aa7c7');c.beginPath();c.arc(0,0,22,0,TAU);c.clip();
  for(let yy=-22;yy<22;yy+=5)for(let xx=-22;xx<22;xx+=5){const lit=h1(Math.floor(xx/5)*13.1+Math.floor(yy/5)*7.7+Math.floor(t*6))>.78;c.fillStyle=lit?cols[((Math.floor(xx+yy+t*10)%6)+6)%6]:'rgba(20,24,40,.35)';c.fillRect(xx+.6,yy+.6,3.8,3.8)}c.restore()},{a:f,glow:10,gc:'rgba(200,200,255,.5)'});
 LAYER(c=>{c.textAlign='center';c.textBaseline='middle';c.font='700 18px Outfit,system-ui,sans-serif';for(let i=0;i<4;i++){const ph=(t*.5+i/4)%1,sd=i%2?1:-1;c.globalAlpha=sin(Math.PI*ph);c.fillStyle=cols[i];c.fillText(i%2?'\u266A':'\u266B',160+sd*(70+ph*28),150-ph*58)}c.globalAlpha=1},{a:f,glow:6,gc:'rgba(255,255,255,.35)'});
 EYP(tDsc(u),{y:146-6*beat,gap:96,s:.56,sq:.06*beat});
});

/* ---------- Paint splash ---------- */
const SPL=[{x:92,y:80,r:17,c:PC.pink,at:.12},{x:232,y:72,r:16,c:PC.cyan,at:.22},{x:112,y:176,r:15,c:PC.yellow,at:.32},{x:214,y:174,r:16,c:PC.lime,at:.42},{x:160,y:58,r:12,c:PC.violet,at:.52},{x:160,y:184,r:11,c:PC.orange,at:.6}];
function splat(c,x,y,r,col,k,seed){c.fillStyle=col;const pts=[];for(let i=0;i<10;i++){const a=i*TAU/10,rr=r*(.82+.3*h1(seed+i*1.9))*k;pts.push([x+cos(a)*rr,y+sin(a)*rr])}smooth(c,pts);
 for(let i=0;i<7;i++){const a=h1(seed*2+i)*TAU,d=r*(1.25+.45*h1(seed+i*3.1))*k,s=(1.6+2.4*h1(seed+i*5.7))*k;c.beginPath();c.arc(x+cos(a)*d,y+sin(a)*d,s,0,TAU);c.fill()}}
const tSpl=kf([[0,'neutral'],[.1,'neutral'],[.13,'surprised'],[.3,'surprised'],[.45,'big'],[.6,'joy'],[.85,'happy'],[1,'neutral']]);
SC('Colour','Paint splash',7,(u,t)=>{
 const f=1-seg(u,.86,.98);
 LAYER(c=>SPL.forEach((S,i)=>{const k=popIn(seg(u,S.at,S.at+.06));if(k>0)splat(c,S.x,S.y,S.r,S.c,k,i*17.3+3)}),{a:f,glow:8,gc:'rgba(255,255,255,.25)'});
 EYP(tSpl(u),{y:124,gap:100,s:.58,sq:-.08*damp((u-.13)/.1,1.6,4),blink:blinks(u,[.75])});
});

/* ---------- Hello ---------- */
const tHel=kf([[0,'neutral'],[.08,'big'],[.18,'joy'],[.7,'joy'],[.78,['happy',{R:{lid:.86}}]],[.86,'happy'],[1,'neutral']]);
SC('Colour','Hello',6,(u,t)=>{
 const cols=[PC.red,PC.orange,PC.yellow,PC.green,PC.cyan],f=1-seg(u,.86,.97);
 LAYER(c=>{c.font='800 34px Outfit,system-ui,sans-serif';c.textAlign='center';c.textBaseline='middle';
  for(let i=0;i<5;i++){const k=popIn(seg(u,.12+i*.06,.22+i*.06));if(k<=0)continue;c.save();c.translate(160+(i-2)*30,178-6*abs(sin(t*4+i*.7))*seg(u,.45,.5));c.scale(k,k);c.rotate(.12*sin(t*3+i));c.fillStyle=cols[i];c.fillText('HELLO'[i],0,0);c.restore()}},{a:f,glow:9,gc:'rgba(255,230,200,.4)'});
 const sp=seg(u,.48,.62);if(sp>0&&sp<1)LAYER(c=>{[[84,170,PC.yellow],[236,166,PC.pink],[208,146,PC.cyan]].forEach(([x,y,col])=>{c.fillStyle=col;spark(c,x,y,7*sin(Math.PI*sp))})},{glow:6});
 EYP(tHel(u),{y:104,gap:100,s:.6,look:[0,4]});
});

/* ---------- Sweet dreams ---------- */
const tDrm=kf([[0,'neutral'],[.1,'drowsy'],[.25,'sleepy'],[.35,'closed'],[.9,'closed'],[1,'neutral']]);
SC('Colour','Sweet dreams',9,(u,t)=>{
 const f=fadeIO(u,.06,.08),m=eout(seg(u,.06,.25)),cols=[PC.pink,PC.cyan,PC.violet,PC.yellow,PC.lime];
 amb(206,78,52,PC.yellow,.12*f*m);
 LAYER(c=>{c.fillStyle='#ffe58a';c.beginPath();c.arc(206,74,20,0,TAU);c.fill();c.globalCompositeOperation='destination-out';c.beginPath();c.arc(216,66,17,0,TAU);c.fill();c.globalCompositeOperation='source-over'},{a:f*m,glow:12,gc:'rgba(255,220,120,.55)'});
 LAYER(c=>{[[92,68],[128,50],[244,120],[78,120],[156,62],[262,72]].forEach(([x,y],i)=>{const b=.4+.6*abs(sin(t*1.4+i*1.3));c.globalAlpha=b;c.fillStyle=cols[i%5];star5(c,x,y,4+2*b)});c.globalAlpha=1},{a:f*m,glow:7,gc:'rgba(255,255,255,.4)'});
 if(u>.35)LAYER(c=>{c.textAlign='center';c.textBaseline='middle';for(let i=0;i<3;i++){const ph=(t*.35+i/3)%1;c.globalAlpha=sin(Math.PI*ph);c.fillStyle=[PC.cyan,PC.violet,PC.pink][i];c.font=`800 ${12+ph*10}px Outfit,system-ui,sans-serif`;c.fillText('Z',196+ph*30,150-ph*50)}c.globalAlpha=1},{a:f*seg(u,.35,.42),glow:6,gc:'rgba(200,220,255,.4)'});
 EYP(tDrm(u),{y:150+2*sin(t*1.2),gap:96,s:.56});
});

let frameOn = true;
const ALL = [...AN.map(a => ({ ...a, g: 'Eyes' })), ...SCN.map(a => ({ ...a, g: 'Scenes' }))];
const byName = {}; ALL.forEach(a => { byName[a.n] = a; });
return {
  list: ALL,
  get: n => byName[n],
  setFrame: function (on) { frameOn = on; },
  draw: function (it, t, lx, ly) { LK.x = lx || 0; LK.y = ly || 0; try { if (it.scene) { EK = 1; renderScene(it, t); } else { EK = .69; render(state(it, t)); } } catch (e) { } if (frameOn) applyFrame(); }
};
}
window.RoamFace = { create: create };
})();
