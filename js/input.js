// ═══ Keyboard & Touch Input ═══

document.onkeydown = function (e) {
  if (e.keyCode == 37 || e.keyCode == 65) { dir = 'left'; if (player) player.isMovingLeft = true; }
  if (e.keyCode == 39 || e.keyCode == 68) { dir = 'right'; if (player) player.isMovingRight = true; }
  if (e.keyCode == 32) { e.preventDefault(); if (!playing) startGame(); }
};

document.onkeyup = function (e) {
  if (e.keyCode == 37 || e.keyCode == 65) { if (player) player.isMovingLeft = false; }
  if (e.keyCode == 39 || e.keyCode == 68) { if (player) player.isMovingRight = false; }
};

// ─── Mobile Touch Controls ───
var mobLBtn = document.getElementById('mobL');
var mobRBtn = document.getElementById('mobR');

mobLBtn.addEventListener('touchstart', function (e) {
  e.preventDefault();
  if (player) { player.isMovingLeft = true; dir = 'left'; }
}, { passive: false });

mobLBtn.addEventListener('touchend', function (e) {
  e.preventDefault();
  if (player) player.isMovingLeft = false;
}, { passive: false });

mobRBtn.addEventListener('touchstart', function (e) {
  e.preventDefault();
  if (player) { player.isMovingRight = true; dir = 'right'; }
}, { passive: false });

mobRBtn.addEventListener('touchend', function (e) {
  e.preventDefault();
  if (player) player.isMovingRight = false;
}, { passive: false });
