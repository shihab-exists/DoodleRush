// ══════════════════════════════════════════
//  DOODLE RUSH — Highscore API Server
//  Anonymous device-based auth (UUID)
//  SQLite database (zero config)
// ══════════════════════════════════════════

const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Database Setup ──
const db = new Database(path.join(__dirname, 'doodle-rush.db'));
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS players (
    id TEXT PRIMARY KEY,
    nickname TEXT DEFAULT 'Anonymous',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_id TEXT NOT NULL,
    world TEXT NOT NULL,
    score INTEGER NOT NULL,
    skin TEXT DEFAULT 'Classic',
    survived_seconds INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (player_id) REFERENCES players(id)
  );

  CREATE INDEX IF NOT EXISTS idx_scores_world ON scores(world, score DESC);
  CREATE INDEX IF NOT EXISTS idx_scores_player ON scores(player_id, world);
`);

// ── Prepared Statements ──
const insertPlayer = db.prepare(
  'INSERT OR IGNORE INTO players (id, nickname) VALUES (?, ?)'
);
const updateNickname = db.prepare(
  'UPDATE players SET nickname = ? WHERE id = ?'
);
const insertScore = db.prepare(
  'INSERT INTO scores (player_id, world, score, skin, survived_seconds) VALUES (?, ?, ?, ?, ?)'
);
const getPlayerBests = db.prepare(`
  SELECT world, MAX(score) as best_score, COUNT(*) as total_runs
  FROM scores WHERE player_id = ?
  GROUP BY world
`);
const getPlayerWorldBest = db.prepare(`
  SELECT MAX(score) as best_score, COUNT(*) as total_runs
  FROM scores WHERE player_id = ? AND world = ?
`);
const getLeaderboard = db.prepare(`
  SELECT s.score, s.world, s.skin, s.survived_seconds, s.created_at,
         p.nickname
  FROM scores s
  JOIN players p ON s.player_id = p.id
  WHERE s.world = ?
  ORDER BY s.score DESC
  LIMIT ?
`);
const getGlobalLeaderboard = db.prepare(`
  SELECT s.score, s.world, s.skin, s.survived_seconds, s.created_at,
         p.nickname
  FROM scores s
  JOIN players p ON s.player_id = p.id
  ORDER BY s.score DESC
  LIMIT ?
`);
const getPlayerRank = db.prepare(`
  SELECT COUNT(*) + 1 as rank FROM scores
  WHERE world = ? AND score > (
    SELECT COALESCE(MAX(score), 0) FROM scores WHERE player_id = ? AND world = ?
  )
`);

// ── Middleware ──
app.use(cors());
app.use(express.json());

// Serve the game from parent directory
app.use(express.static(path.join(__dirname, '..')));

// ── Validate player ID (UUID format) ──
function validateId(id) {
  return typeof id === 'string' && /^[a-f0-9-]{36}$/.test(id);
}

// ── Routes ──

// Register / ensure player exists
app.post('/api/player', (req, res) => {
  const { id, nickname } = req.body;
  if (!validateId(id)) {
    return res.status(400).json({ error: 'Invalid player ID' });
  }
  const name = (nickname || 'Anonymous').slice(0, 20);
  insertPlayer.run(id, name);
  res.json({ ok: true, id });
});

// Update nickname
app.put('/api/player/:id/nickname', (req, res) => {
  const { id } = req.params;
  const { nickname } = req.body;
  if (!validateId(id)) return res.status(400).json({ error: 'Invalid ID' });
  if (!nickname || nickname.length < 1 || nickname.length > 20) {
    return res.status(400).json({ error: 'Nickname must be 1-20 characters' });
  }
  updateNickname.run(nickname, id);
  res.json({ ok: true });
});

// Submit a score
app.post('/api/score', (req, res) => {
  const { player_id, world, score, skin, survived_seconds } = req.body;
  if (!validateId(player_id)) return res.status(400).json({ error: 'Invalid player ID' });
  if (!['jungle', 'egypt', 'lava'].includes(world)) {
    return res.status(400).json({ error: 'Invalid world' });
  }
  if (typeof score !== 'number' || score < 0 || score > 99999) {
    return res.status(400).json({ error: 'Invalid score' });
  }

  // Ensure player exists
  insertPlayer.run(player_id, 'Anonymous');

  // Save score
  insertScore.run(player_id, world, score, skin || 'Classic', survived_seconds || 0);

  // Get updated personal best for this world
  const best = getPlayerWorldBest.get(player_id, world);
  const rank = getPlayerRank.get(world, player_id, world);

  res.json({
    ok: true,
    personal_best: best.best_score,
    total_runs: best.total_runs,
    rank: rank.rank,
    is_new_best: score >= best.best_score
  });
});

// Get personal bests (all worlds)
app.get('/api/player/:id/bests', (req, res) => {
  const { id } = req.params;
  if (!validateId(id)) return res.status(400).json({ error: 'Invalid ID' });
  const bests = getPlayerBests.all(id);
  const result = {};
  for (const row of bests) {
    result[row.world] = { best: row.best_score, runs: row.total_runs };
  }
  res.json(result);
});

// Get leaderboard for a world
app.get('/api/leaderboard/:world', (req, res) => {
  const { world } = req.params;
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  if (!['jungle', 'egypt', 'lava'].includes(world)) {
    return res.status(400).json({ error: 'Invalid world' });
  }
  const rows = getLeaderboard.all(world, limit);
  res.json(rows);
});

// Get global leaderboard (all worlds)
app.get('/api/leaderboard', (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  const rows = getGlobalLeaderboard.all(limit);
  res.json(rows);
});

// ── Start ──
app.listen(PORT, () => {
  console.log(`🏃💨 Doodle Rush server running on http://localhost:${PORT}`);
});

// bKash payment verification (stores TrxIDs for manual review)
db.exec(`
  CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_id TEXT NOT NULL,
    skin_index INTEGER NOT NULL,
    trx_id TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

const insertPayment = db.prepare(
  'INSERT INTO payments (player_id, skin_index, trx_id) VALUES (?, ?, ?)'
);

app.post('/api/bkash', (req, res) => {
  const { player_id, skin_index, trx_id } = req.body;
  if (!validateId(player_id)) return res.status(400).json({ error: 'Invalid player ID' });
  if (typeof skin_index !== 'number' || skin_index < 0 || skin_index >= 6) {
    return res.status(400).json({ error: 'Invalid skin' });
  }
  if (!trx_id || trx_id.length < 6) {
    return res.status(400).json({ error: 'Invalid TrxID' });
  }
  insertPayment.run(player_id, skin_index, trx_id);
  res.json({ ok: true });
});

// View pending payments (admin)
app.get('/api/admin/payments', (req, res) => {
  const rows = db.prepare('SELECT * FROM payments ORDER BY created_at DESC LIMIT 100').all();
  res.json(rows);
});
