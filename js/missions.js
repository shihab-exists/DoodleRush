// ═══ Daily Missions ═══

var missions = null;
try {
  var _r = SG('dr_missions');
  if (_r) missions = JSON.parse(_r);
} catch (e) {}

var mDay = SG('dr_mday') || '';
var today = new Date().toISOString().slice(0, 10);

// Reset missions daily
if (mDay !== today || !missions || !missions.length) {
  var pool = [
    { d: 'Jump 80 platforms', k: 'plats', t: 80, p: 0, r: 10, c: false },
    { d: 'Kill 15 enemies',   k: 'kills', t: 15, p: 0, r: 15, c: false },
    { d: 'Reach score 200',   k: 'score', t: 200, p: 0, r: 12, c: false },
    { d: 'Survive 60 seconds', k: 'time', t: 60, p: 0, r: 10, c: false },
    { d: 'Use a spring',      k: 'springs', t: 1, p: 0, r: 5, c: false },
    { d: 'Reach score 400',   k: 'score', t: 400, p: 0, r: 20, c: false }
  ];
  pool.sort(function () { return Math.random() - 0.5; });
  missions = [pool[0], pool[1], pool[2]];
  SS('dr_mday', today);
  SS('dr_missions', JSON.stringify(missions));
}

// Track mission progress
function mTrk(k, v) {
  if (!missions) return;
  for (var i = 0; i < missions.length; i++) {
    if (missions[i].k === k) {
      missions[i].p = Math.max(missions[i].p, v);
    }
  }
  SS('dr_missions', JSON.stringify(missions));
}

// Claim mission reward
function mClm(i) {
  if (!missions || !missions[i]) return;
  if (missions[i].p < missions[i].t || missions[i].c) return;
  missions[i].c = true;
  coins += missions[i].r;
  SS('dr_coins', '' + coins);
  SS('dr_missions', JSON.stringify(missions));
  renderMissions();
}
