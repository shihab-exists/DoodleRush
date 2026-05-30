// ═══ Game Objects ═══

var sprite = document.getElementById('sprite');
var platformCount = 10;
var position = 0;
var gravity = 0.2;
var broken = 0;

// ─── Base ───
function Base() {
  this.height = 5;
  this.width = W;
  this.cx = 0; this.cy = 614;
  this.cwidth = 100; this.cheight = 5;
  this.x = 0; this.y = H - this.height;

  this.draw = function () {
    try {
      ctx.drawImage(sprite, this.cx, this.cy, this.cwidth, this.cheight, this.x, this.y, this.width, this.height);
    } catch (e) {}
  };
}

// ─── Skin Accessory Drawing ───
function drawAccessory(skinName, ox, oy, w, h, d) {
  var cx = ox + w / 2;
  var topY = oy + h * 0.08;

  if (skinName === 'Fire') {
    // Flame hair — 3 flame tips on top
    ctx.fillStyle = '#FF4400';
    ctx.beginPath(); ctx.ellipse(cx - 6, topY - 2, 4, 8, -0.2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(cx + 2, topY - 5, 3, 10, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(cx + 8, topY - 1, 3, 7, 0.3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#FFAA00';
    ctx.beginPath(); ctx.ellipse(cx + 2, topY - 2, 2, 6, 0, 0, Math.PI * 2); ctx.fill();
  }

  else if (skinName === 'Ice') {
    // Ice crown — small crystal tiara
    ctx.fillStyle = '#88DDFF';
    ctx.beginPath();
    ctx.moveTo(cx - 10, topY + 4);
    ctx.lineTo(cx - 6, topY - 6);
    ctx.lineTo(cx - 2, topY + 2);
    ctx.lineTo(cx + 2, topY - 8);
    ctx.lineTo(cx + 6, topY + 2);
    ctx.lineTo(cx + 10, topY - 4);
    ctx.lineTo(cx + 12, topY + 4);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#BBFFFF';
    ctx.beginPath(); ctx.ellipse(cx + 2, topY - 4, 2, 2, 0, 0, Math.PI * 2); ctx.fill();
  }

  else if (skinName === 'Gold') {
    // Gold crown
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.moveTo(cx - 12, topY + 5);
    ctx.lineTo(cx - 10, topY - 4);
    ctx.lineTo(cx - 4, topY + 1);
    ctx.lineTo(cx, topY - 7);
    ctx.lineTo(cx + 4, topY + 1);
    ctx.lineTo(cx + 10, topY - 4);
    ctx.lineTo(cx + 12, topY + 5);
    ctx.closePath();
    ctx.fill();
    // Gems
    ctx.fillStyle = '#FF0044';
    ctx.beginPath(); ctx.arc(cx, topY - 3, 2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#44FF44';
    ctx.beginPath(); ctx.arc(cx - 7, topY, 1.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx + 7, topY, 1.5, 0, Math.PI * 2); ctx.fill();
  }

  else if (skinName === 'Samurai') {
    // Headband (hachimaki)
    ctx.fillStyle = '#CC0000';
    ctx.fillRect(ox + w * 0.12, oy + h * 0.15, w * 0.76, 5);
    // Knot trailing behind
    ctx.strokeStyle = '#CC0000';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(ox + w * 0.12 + (-d > 0 ? 0 : w * 0.76), oy + h * 0.17);
    ctx.quadraticCurveTo(
      ox + w * 0.12 + (-d > 0 ? -12 : w * 0.76 + 12), oy + h * 0.22,
      ox + w * 0.12 + (-d > 0 ? -8 : w * 0.76 + 8), oy + h * 0.32
    );
    ctx.stroke();
    // Katana on back
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx + d * 8, oy + h * 0.3);
    ctx.lineTo(cx + d * 12, oy - 8);
    ctx.stroke();
    ctx.fillStyle = '#DAA520';
    ctx.fillRect(cx + d * 6, oy + h * 0.28, d * 8, 4);
  }

  else if (skinName === 'Cyber') {
    // Visor / goggles
    ctx.fillStyle = 'rgba(0,255,255,0.4)';
    ctx.fillRect(ox + w * 0.15, oy + h * 0.22, w * 0.7, 8);
    ctx.strokeStyle = '#00FFFF';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(ox + w * 0.15, oy + h * 0.22, w * 0.7, 8);
    // Antenna
    ctx.strokeStyle = '#00DDDD';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx + 4, topY + 2);
    ctx.lineTo(cx + 6, topY - 10);
    ctx.stroke();
    ctx.fillStyle = '#00FFFF';
    ctx.beginPath(); ctx.arc(cx + 6, topY - 11, 2.5, 0, Math.PI * 2); ctx.fill();
  }

  else if (skinName === 'Astro') {
    // Helmet dome
    ctx.strokeStyle = 'rgba(200,200,220,0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, oy + h * 0.32, w * 0.38, Math.PI, 0);
    ctx.stroke();
    // Visor reflection
    ctx.fillStyle = 'rgba(100,150,255,0.2)';
    ctx.beginPath();
    ctx.arc(cx, oy + h * 0.32, w * 0.35, Math.PI + 0.3, -0.3);
    ctx.fill();
    // Helmet rim
    ctx.fillStyle = 'rgba(180,180,200,0.5)';
    ctx.fillRect(ox + w * 0.14, oy + h * 0.3, w * 0.72, 3);
  }

  else if (skinName === 'Shadow') {
    // Dark cape flowing behind
    ctx.fillStyle = 'rgba(10,10,10,0.6)';
    ctx.beginPath();
    ctx.moveTo(cx - d * 2, oy + h * 0.25);
    ctx.quadraticCurveTo(cx - d * 18, oy + h * 0.5, cx - d * 14, oy + h * 1.05);
    ctx.lineTo(cx - d * 6, oy + h * 0.9);
    ctx.quadraticCurveTo(cx - d * 10, oy + h * 0.5, cx - d * 2, oy + h * 0.35);
    ctx.closePath();
    ctx.fill();
    // Glowing red eyes (override normal eyes)
    var ebx2 = ox + w / 2 + d * w * 0.06;
    var ey2 = oy + h * 0.28;
    ctx.fillStyle = '#FF0000';
    ctx.beginPath(); ctx.ellipse(ebx2 - 6 + d * 2, ey2, 3, 3, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(ebx2 + 8 + d * 2, ey2, 3, 3, 0, 0, Math.PI * 2); ctx.fill();
    // Red glow
    ctx.fillStyle = 'rgba(255,0,0,0.15)';
    ctx.beginPath(); ctx.ellipse(ebx2 + d * 2, ey2, 14, 8, 0, 0, Math.PI * 2); ctx.fill();
  }
}

// ─── Player (Code-Drawn Doodler) ───
function Player() {
  this.vy = 11;
  this.vx = 0;
  this.isMovingLeft = false;
  this.isMovingRight = false;
  this.isDead = false;
  this.width = 55; this.height = 50;
  this.dir = 'left';
  this.x = W / 2 - this.width / 2;
  this.y = H;

  // Shield
  this.shielded = false;
  this.shieldTimer = 0;

  // Animation
  this.squash = 1;
  this.mouthOpen = 0;

  this.draw = function () {
    var s = SKINS[skinI];
    var col = s.b || [123,191,58];
    var blCol = s.bl || [162,217,78];
    var fCol = s.f || [90,158,47];
    var d = (this.dir === 'right' || this.dir === 'right_land') ? 1 : -1;
    var sq = this.squash;
    var w = this.width * (2 - sq);
    var h = this.height * sq;
    var ox = this.x + this.width / 2 - w / 2;
    var oy = this.y + this.height - h;

    ctx.save();

    // Invincibility blink
    if (this.shielded && Math.floor(Date.now() / 100) % 2) {
      ctx.globalAlpha = 0.7;
    }

    // Shield bubble
    if (this.shielded) {
      ctx.strokeStyle = 'rgba(72,184,232,0.5)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(ox + w / 2, oy + h * 0.5, w * 0.55 + 4, h * 0.55 + 4, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Shadow cape (draw behind body)
    if (s.n === 'Shadow') {
      drawAccessory('Shadow', ox, oy, w, h, d);
    }

    // Body
    ctx.fillStyle = 'rgb(' + col[0] + ',' + col[1] + ',' + col[2] + ')';
    ctx.beginPath();
    ctx.ellipse(ox + w / 2, oy + h * 0.55, w * 0.4, h * 0.42, 0, 0, Math.PI * 2);
    ctx.fill();

    // Belly
    ctx.fillStyle = 'rgb(' + blCol[0] + ',' + blCol[1] + ',' + blCol[2] + ')';
    ctx.beginPath();
    ctx.ellipse(ox + w / 2, oy + h * 0.55, w * 0.25, h * 0.28, 0, 0, Math.PI * 2);
    ctx.fill();

    // Nose / snout
    ctx.fillStyle = 'rgb(' + col[0] + ',' + col[1] + ',' + col[2] + ')';
    ctx.beginPath();
    ctx.ellipse(ox + w / 2 + d * w * 0.35, oy + h * 0.35, w * 0.2, h * 0.17, d * 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Mouth (shooting)
    if (this.mouthOpen > 0) {
      ctx.fillStyle = '#FF4444';
      ctx.beginPath();
      ctx.ellipse(ox + w / 2 + d * w * 0.38, oy + h * 0.42, 4, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      this.mouthOpen--;
    }

    // Eyes
    var ebx = ox + w / 2 + d * w * 0.06;
    var ey = oy + h * 0.28;
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.ellipse(ebx - 6, ey, 7, 9, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(ebx + 8, ey, 7, 9, 0, 0, Math.PI * 2); ctx.fill();
    // Pupils
    ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.ellipse(ebx - 6 + d * 2, ey, 3, 4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(ebx + 8 + d * 2, ey, 3, 4, 0, 0, Math.PI * 2); ctx.fill();

    // Feet
    ctx.fillStyle = 'rgb(' + fCol[0] + ',' + fCol[1] + ',' + fCol[2] + ')';
    ctx.beginPath(); ctx.ellipse(ox + w * 0.32, oy + h * 0.92, 8, 5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(ox + w * 0.68, oy + h * 0.92, 8, 5, 0, 0, Math.PI * 2); ctx.fill();

    // Accessories (drawn on top of body, except Shadow cape which is behind)
    if (s.n !== 'Classic' && s.n !== 'Shadow') {
      drawAccessory(s.n, ox, oy, w, h, d);
    }

    ctx.restore();

    // Squash recovery
    this.squash += (1 - this.squash) * 0.15;
  };

  this.jump = function () {
    this.vy = -8;
    this.squash = 0.7;
  };

  this.jumpHigh = function () {
    this.vy = -16;
    this.squash = 0.6;
    mTrk('springs', 1);
  };

  this.useShield = function () {
    if (!this.shielded) return false;
    this.shielded = false;
    this.shieldTimer = 0;
    return true;
  };
}

// ─── Platform (Sprite-based) ───
function PlatformObj() {
  this.width = 70; this.height = 17;
  this.x = Math.random() * (W - this.width);
  this.y = position;
  position += (H / platformCount);
  this.flag = 0; this.state = 0;
  this.cx = 0; this.cy = 0;
  this.cwidth = 105; this.cheight = 31;

  this.draw = function () {
    try {
      if (this.type == 1) this.cy = 0;
      else if (this.type == 2) this.cy = 61;
      else if (this.type == 3 && this.flag === 0) this.cy = 31;
      else if (this.type == 3 && this.flag == 1) this.cy = 1000;
      else if (this.type == 4 && this.state === 0) this.cy = 90;
      else if (this.type == 4 && this.state == 1) this.cy = 1000;
      ctx.drawImage(sprite, this.cx, this.cy, this.cwidth, this.cheight, this.x, this.y, this.width, this.height);
    } catch (e) {}
  };

  // Platform type probability based on score
  if (score >= 5000) this.types = [2,3,3,3,4,4,4,4];
  else if (score >= 2000) this.types = [2,2,2,3,3,3,3,4,4,4,4];
  else if (score >= 1000) this.types = [2,2,2,3,3,3,3,3];
  else if (score >= 500) this.types = [1,1,1,1,1,2,2,2,2,3,3,3,3];
  else if (score >= 100) this.types = [1,1,1,1,2,2];
  else this.types = [1];

  this.type = this.types[Math.floor(Math.random() * this.types.length)];

  if (this.type == 3 && broken < 1) { broken++; }
  else if (this.type == 3 && broken >= 1) { this.type = 1; broken = 0; }

  this.moved = 0;
  this.vx = 1;
}

// ─── Broken Platform Substitute (Sprite) ───
function PlatformBrokenSub() {
  this.height = 30; this.width = 70;
  this.x = 0; this.y = 0;
  this.cx = 0; this.cy = 554;
  this.cwidth = 105; this.cheight = 60;
  this.appearance = false;

  this.draw = function () {
    try {
      if (this.appearance) ctx.drawImage(sprite, this.cx, this.cy, this.cwidth, this.cheight, this.x, this.y, this.width, this.height);
    } catch (e) {}
  };
}

// ─── Spring (Sprite) ───
function SpringObj() {
  this.x = 0; this.y = 0;
  this.width = 26; this.height = 30;
  this.cx = 0; this.cy = 0;
  this.cwidth = 45; this.cheight = 53;
  this.state = 0;

  this.draw = function () {
    try {
      if (this.state === 0) this.cy = 445;
      else if (this.state == 1) this.cy = 501;
      ctx.drawImage(sprite, this.cx, this.cy, this.cwidth, this.cheight, this.x, this.y, this.width, this.height);
    } catch (e) {}
  };
}

// ─── Shield Pickup (Code-Drawn) ───
function ShieldPickup(x, y) {
  this.x = x; this.y = y;
  this.t = 0; this.got = false;
}
ShieldPickup.prototype.draw = function () {
  if (this.got) return;
  this.t += 0.05;
  var b = Math.sin(this.t) * 3;
  ctx.fillStyle = 'rgba(72,184,232,0.3)';
  ctx.beginPath(); ctx.arc(this.x + 13, this.y + b, 16, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#48B8E8';
  ctx.beginPath(); ctx.arc(this.x + 13, this.y + b, 10, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 9px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('★', this.x + 13, this.y + b + 3);
};
