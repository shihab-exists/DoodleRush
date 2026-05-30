// ═══ Game Configuration ═══

var W = 422, H = 552;
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

// ─── Responsive Scaling ───
var scaleX = 1, scaleY = 1;
function resizeCanvas() {
  var maxW = window.innerWidth;
  var maxH = window.innerHeight;
  var scale = Math.min(maxW / W, maxH / H, 1.5);
  canvas.style.width = (W * scale) + 'px';
  canvas.style.height = (H * scale) + 'px';
  // Update wrapper too
  var wrap = document.querySelector('.wrap');
  if (wrap) {
    wrap.style.width = (W * scale) + 'px';
    wrap.style.height = (H * scale) + 'px';
  }
  scaleX = W / (W * scale);
  scaleY = H / (H * scale);
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

var best = parseInt(SG('dr_best')) || 0;
var coins = parseInt(SG('dr_coins')) || 0;
var score = 0;



// ─── Skins ───
// lock: 0 = free, 1 = score unlock
var SKINS = [
  { n: 'Classic',  b: [123,191,58],  bl: [162,217,78],  f: [90,158,47],   lock: 0 },
  { n: 'Fire',     b: [255,107,53],  bl: [255,209,102], f: [204,68,0],    lock: 0 },
  { n: 'Ice',      b: [72,202,228],  bl: [173,232,244], f: [0,150,199],   lock: 0 },
  { n: 'Gold',     b: [255,215,0],   bl: [255,248,220], f: [218,165,32],  lock: 0 },
  { n: 'Samurai',  b: [204,34,0],    bl: [255,68,68],   f: [136,0,0],     lock: 0 },
  { n: 'Cyber',    b: [0,255,255],   bl: [136,255,255], f: [0,136,136],   lock: 0 },
  { n: 'Astro',    b: [232,232,240], bl: [255,255,255], f: [136,136,170], lock: 1, req: 200 },
  { n: 'Shadow',   b: [51,51,51],    bl: [85,85,85],    f: [17,17,17],    lock: 1, req: 200 }
];
var skinI = 0;
var skinUnlocks = {};
try { skinUnlocks = JSON.parse(SG('dr_skins')) || {}; } catch (e) { skinUnlocks = {}; }

function skinOK(i) {
  var s = SKINS[i];
  if (s.lock === 0) return true;
  if (s.lock === 1) return best >= s.req || skinUnlocks['s' + i];
  return true;
}

function unlockSkin(i) {
  skinUnlocks['s' + i] = true;
  SS('dr_skins', JSON.stringify(skinUnlocks));
}

function chkUnlocks() {
  for (var i = 0; i < SKINS.length; i++) {
    if (SKINS[i].lock === 1 && best >= SKINS[i].req) unlockSkin(i);
  }
}

// ─── Settings ───
var settings = { sfx: true, music: true, tilt: false, diff: 'normal' };

