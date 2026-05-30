// ═══ Game Logic ═══

var playing = false, gameOverFlag = false;
var player, base, spring, platformBrokenSub;
var platforms = [], shieldPickups = [];
var dir = 'left', flag = 0;
var animloop;
var runPlats = 0, runTime = 0;
var isMob = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;

// ─── Start Game ───
function startGame() {
  var divs = document.querySelectorAll('#ui > div');
  for (var i = 0; i < divs.length; i++) divs[i].classList.remove('show');

  playing = true;
  gameOverFlag = false;
  score = 0; flag = 0; position = 0; broken = 0; dir = 'left';
  runPlats = 0; runTime = 0;
  shieldPickups = [];

  gravity = 0.2;
  if (settings.diff === 'easy') gravity *= 0.85;
  else if (settings.diff === 'hard') gravity *= 1.2;

  base = new Base();
  player = new Player();
  spring = new SpringObj();
  platformBrokenSub = new PlatformBrokenSub();
  platforms = [];
  for (var i = 0; i < platformCount; i++) {
    platforms.push(new PlatformObj());
  }

  document.getElementById('hud').classList.add('show');
  if (isMob) {
    document.getElementById('mobL').classList.add('show');
    document.getElementById('mobR').classList.add('show');
  }

  if (animloop) cancelAnimationFrame(animloop);
  gameLoop();
}

// ─── Game Loop ───
function gameLoop() {
  if (!playing) return;
  runTime++;
  mTrk('time', Math.floor(runTime / 60));

  ctx.clearRect(0, 0, W, H);

  // Background — clean notebook paper
  ctx.fillStyle = '#f0f0e0';
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = 'rgba(180,200,220,0.3)';
  ctx.lineWidth = 1;
  for (var y = 0; y < H; y += 22) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(200,80,80,0.15)';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(35, 0); ctx.lineTo(35, H); ctx.stroke();

  platformCalc();
  springCalc();
  playerCalc();

  // Shield pickups
  for (var i = shieldPickups.length - 1; i >= 0; i--) {
    var sp = shieldPickups[i];
    sp.draw();
    if (!sp.got &&
      player.x + 15 < sp.x + 26 &&
      player.x + player.width - 15 > sp.x &&
      player.y + player.height > sp.y - 5 &&
      player.y < sp.y + 20) {
      sp.got = true;
      player.shielded = true;
      player.shieldTimer = 480;
    }
    if (sp.got || sp.y > H + 50) shieldPickups.splice(i, 1);
  }

  if (player.shielded) {
    player.shieldTimer--;
    if (player.shieldTimer <= 0) player.shielded = false;
  }

  player.draw();
  base.draw();

  // HUD
  document.getElementById('hudScore').textContent = '⭐ ' + score;
  document.getElementById('hudCoins').textContent = '🪙 ' + coins;
  var shieldEl = document.getElementById('hudShield');
  if (player.shielded) {
    shieldEl.style.display = 'inline';
    shieldEl.textContent = '🛡️ ' + Math.ceil(player.shieldTimer / 60) + 's';
  } else {
    shieldEl.style.display = 'none';
  }

  if (!gameOverFlag) animloop = requestAnimationFrame(gameLoop);
}

// ─── Player Logic ───
function playerCalc() {
  if (dir == 'left') {
    player.dir = 'left';
    if (player.vy < -7 && player.vy > -15) player.dir = 'left_land';
  } else if (dir == 'right') {
    player.dir = 'right';
    if (player.vy < -7 && player.vy > -15) player.dir = 'right_land';
  }

  // Movement — increased horizontal acceleration + speed to match vertical feel
  if (player.isMovingLeft) { player.x += player.vx; player.vx -= 0.25; }
  else { player.x += player.vx; if (player.vx < 0) player.vx += 0.15; }
  if (player.isMovingRight) { player.x += player.vx; player.vx += 0.25; }
  else { player.x += player.vx; if (player.vx > 0) player.vx -= 0.15; }
  if (player.vx > 10) player.vx = 10;
  if (player.vx < -10) player.vx = -10;

  // Base bounce
  if ((player.y + player.height) > base.y && base.y < H) player.jump();

  // Death
  if (base.y > H && (player.y + player.height) > H && player.isDead !== 'lol') {
    if (player.shielded) {
      player.useShield();
      player.jump();
      player.vy = -12;
    } else {
      player.isDead = true;
    }
  }

  // Screen wrapping
  if (player.x > W) player.x = 0 - player.width;
  else if (player.x < 0 - player.width) player.x = W;

  // Gravity & scrolling
  if (player.y >= (H / 2) - (player.height / 2)) {
    player.y += player.vy;
    player.vy += gravity;
  } else {
    platforms.forEach(function (p, i) {
      if (player.vy < 0) p.y -= player.vy;
      if (p.y > H) {
        platforms[i] = new PlatformObj();
        platforms[i].y = p.y - H;
        if (score > 100 && Math.random() < 0.04) {
          shieldPickups.push(new ShieldPickup(platforms[i].x + 20, platforms[i].y - 25));
        }
      }
    });
    base.y -= player.vy;
    player.vy += gravity;
    if (player.vy >= 0) { player.y += player.vy; player.vy += gravity; }
    score++;
    coins++;
    runPlats++;
    mTrk('score', score);
    mTrk('plats', runPlats);
  }

  collides();
  if (player.isDead === true) doGameOver();
}

// ─── Spring Logic ───
function springCalc() {
  var s = spring, p = platforms[0];
  if (p.type == 1 || p.type == 2) {
    s.x = p.x + p.width / 2 - s.width / 2;
    s.y = p.y - p.height - 10;
    if (s.y > H / 1.1) s.state = 0;
    s.draw();
  } else {
    s.x = 0 - s.width;
    s.y = 0 - s.height;
  }
}

// ─── Platform Logic ───
function platformCalc() {
  var subs = platformBrokenSub;
  platforms.forEach(function (p, i) {
    if (p.type == 2) {
      if (p.x < 0 || p.x + p.width > W) p.vx *= -1;
      p.x += p.vx;
    }
    if (p.flag == 1 && subs.appearance === false) {
      subs.x = p.x; subs.y = p.y;
      subs.appearance = true;
    }
    p.draw();
  });
  if (subs.appearance) { subs.draw(); subs.y += 8; }
  if (subs.y > H) subs.appearance = false;
}

// ─── Collision Detection ───
function collides() {
  platforms.forEach(function (p) {
    if (player.vy > 0 && p.state === 0 &&
      (player.x + 15 < p.x + p.width) &&
      (player.x + player.width - 15 > p.x) &&
      (player.y + player.height > p.y) &&
      (player.y + player.height < p.y + p.height)) {
      if (p.type == 3 && p.flag === 0) { p.flag = 1; return; }
      else if (p.type == 4 && p.state === 0) { player.jump(); p.state = 1; }
      else if (p.flag == 1) return;
      else player.jump();
    }
  });

  var s = spring;
  if (player.vy > 0 && s.state === 0 &&
    (player.x + 15 < s.x + s.width) &&
    (player.x + player.width - 15 > s.x) &&
    (player.y + player.height > s.y) &&
    (player.y + player.height < s.y + s.height)) {
    s.state = 1;
    player.jumpHigh();
  }
}

// ─── Game Over ───
function doGameOver() {
  gameOverFlag = true;
  playing = false;

  if (score > best) {
    best = score;
    SS('dr_best', '' + best);
    chkUnlocks();
  }
  SS('dr_coins', '' + coins);

  document.getElementById('hud').classList.remove('show');
  document.getElementById('mobL').classList.remove('show');
  document.getElementById('mobR').classList.remove('show');

  showScreen('overScreen');
}
