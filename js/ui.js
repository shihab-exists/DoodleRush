// ═══ UI Screen Management ═══

function showScreen(id) {
  var divs = document.querySelectorAll('#ui > div');
  for (var i = 0; i < divs.length; i++) divs[i].classList.remove('show');

  var el = document.getElementById(id);
  if (el) el.classList.add('show');

  if (id === 'menuScreen') refreshMenu();
  if (id === 'skinScreen') renderSkins();
  if (id === 'missionScreen') renderMissions();
  if (id === 'overScreen') refreshOver();

  // Hide game elements when in menus
  if (id !== 'menuScreen' && id !== 'overScreen') {
    document.getElementById('hud').classList.remove('show');
  }
}

// ─── Menu ───
function refreshMenu() {
  document.getElementById('menuBest').textContent = 'Best: ' + best + ' · 🪙 ' + coins;
}


// ─── Skins ───
function renderSkins() {
  var h = '';
  for (var i = 0; i < SKINS.length; i++) {
    var s = SKINS[i], sel = (i === skinI), ok = skinOK(i);
    h += '<div class="skin-card' + (sel ? ' sel' : '') + (ok ? '' : ' locked') + '" onclick="pickSkin(' + i + ')">';
    h += s.n;
    if (!ok) {
      if (s.lock === 1) h += '<br><span style="color:#DAA520;font-size:8px">🔒 ' + s.req + 'pts</span>';

    } else if (sel) {
      h += '<br>✓';
    }
    h += '</div>';
  }
  document.getElementById('skinList').innerHTML = h;
  document.getElementById('skinCoins').textContent = '🪙 ' + coins;
}

function pickSkin(i) {
  if (skinOK(i)) { skinI = i; renderSkins(); }
}







// ─── Missions ───
function renderMissions() {
  document.getElementById('mDate').textContent = 'Resets daily · ' + today;
  if (!missions || !missions.length) {
    document.getElementById('missionList').innerHTML = '<p>No missions</p>';
    return;
  }
  var h = '';
  for (var i = 0; i < missions.length; i++) {
    var m = missions[i], done = (m.p >= m.t);
    h += '<div class="mission-card' + (done ? ' done' : '') + '">';
    h += '<strong>' + m.d + '</strong>';
    h += '<div class="pbar"><div style="width:' + Math.min(m.p / m.t * 100, 100) + '%"></div></div>';
    h += '<span>' + Math.min(m.p, m.t) + '/' + m.t + '</span>';
    h += ' <span style="float:right">🪙 ' + m.r + '</span><br>';
    if (done && !m.c) h += '<button class="gbtn sm" onclick="mClm(' + i + ')">🪙 Claim</button>';
    else if (m.c) h += '<span style="color:#7BBF3A">✓ Claimed</span>';
    else h += '<span style="color:#999">In progress...</span>';
    h += '</div>';
  }
  document.getElementById('missionList').innerHTML = h;
}

// ─── Settings ───
function togSet(k, el) {
  settings[k] = !settings[k];
  el.classList.toggle('on');
}

function setDiff(d, el) {
  settings.diff = d;
  var btns = el.parentElement.querySelectorAll('.diff-btn');
  for (var i = 0; i < btns.length; i++) btns[i].classList.remove('sel');
  el.classList.add('sel');
}

// ─── Game Over ───
function refreshOver() {
  document.getElementById('overScore').textContent = 'Score: ' + score;
  document.getElementById('overBest').textContent = (score >= best) ? '🏆 New Best!' : 'Best: ' + best;
  document.getElementById('overBest').style.color = (score >= best) ? '#FF6B35' : '#7BBF3A';
  document.getElementById('overStats').textContent = '🪙 ' + coins;
}
