import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from './db.js';

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = 'goat-of-maths-secret-change-in-production';

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json({ limit: '10mb' }));

function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'Token manquant' });
  try {
    req.user = jwt.verify(header.replace('Bearer ', ''), JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Token invalide' });
  }
}

function adminOnly(req, res, next) {
  if (!req.user.is_admin) return res.status(403).json({ error: 'Admin uniquement' });
  next();
}

// ========== AUTH ==========

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username?.toLowerCase());
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Identifiants invalides' });
  }
  const token = jwt.sign({ username: user.username, displayName: user.display_name, isAdmin: !!user.is_admin }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { username: user.username, displayName: user.display_name, isAdmin: !!user.is_admin } });
});

app.post('/api/auth/register', (req, res) => {
  const { username, password, displayName, isAdmin, classe, dateNaissance } = req.body;
  const uname = username?.toLowerCase().trim();
  if (!uname || !password || !displayName) return res.status(400).json({ error: 'Champs requis manquants' });
  if (db.prepare('SELECT 1 FROM users WHERE username = ?').get(uname)) {
    return res.status(409).json({ error: 'Utilisateur déjà existant' });
  }
  const hash = bcrypt.hashSync(password, 10);
  db.prepare(`INSERT INTO users (username, password_hash, display_name, is_admin, classe, date_naissance) VALUES (?, ?, ?, ?, ?, ?)`)
    .run(uname, hash, displayName.trim(), isAdmin ? 1 : 0, classe || '', dateNaissance || '');

  for (let day = 1; day <= 7; day++) {
    const coins = day === 7 ? 100 : 10 + (day - 1) * 5;
    const xp = day === 7 ? 100 : 10 + (day - 1) * 5;
    const icon = day >= 6 ? '💎' : day >= 4 ? '⚡' : '🪙';
    db.prepare('INSERT OR IGNORE INTO daily_rewards (username, day, coins, xp, icon) VALUES (?, ?, ?, ?, ?)').run(uname, day, coins, xp, icon);
  }

  db.prepare('INSERT OR IGNORE INTO training_state (username) VALUES (?)').run(uname);

  const token = jwt.sign({ username: uname, displayName: displayName.trim(), isAdmin: !!isAdmin }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { username: uname, displayName: displayName.trim(), isAdmin: !!isAdmin } });
});

app.get('/api/auth/me', auth, (req, res) => {
  const user = db.prepare('SELECT username, display_name, is_admin, classe, date_naissance FROM users WHERE username = ?').get(req.user.username);
  if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
  res.json({ username: user.username, displayName: user.display_name, isAdmin: !!user.is_admin, classe: user.classe, dateNaissance: user.date_naissance });
});

// ========== GAME STATE ==========

app.get('/api/state', auth, (req, res) => {
  try {
    const u = req.user.username;
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(u);
    if (!user) return res.status(404).json({ error: 'Non trouvé' });

    const backpack = db.prepare('SELECT item_id as id, item_name as name, item_icon as icon, item_type as type, quantity FROM user_backpack WHERE username = ?').all(u);
    const userBadges = db.prepare('SELECT b.id, b.name, b.icon, b.description, ub.unlocked, ub.unlocked_at FROM badges b LEFT JOIN user_badges ub ON b.id = ub.badge_id AND ub.username = ?').all(u);
    const friends = db.prepare('SELECT friend_name FROM friends WHERE username = ?').all(u).map(r => r.friend_name);
    const chatMessages = db.prepare('SELECT id, username, message, timestamp FROM chat_messages ORDER BY id DESC LIMIT 100').all().reverse();
    const privateMessages = db.prepare('SELECT id, from_user, "to", message, timestamp FROM private_messages WHERE from_user = ? OR "to" = ? ORDER BY id').all(u, u);
    const duelHistory = db.prepare('SELECT id, opponent, opponent_avatar, result, date, xp_gained, coins_gained FROM duel_history WHERE username = ? ORDER BY id DESC LIMIT 20').all(u);
    const dailyRewards = db.prepare('SELECT day, coins, xp, icon, claimed FROM daily_rewards WHERE username = ? ORDER BY day').all(u);
    const training = db.prepare('SELECT today_count, last_reset_date FROM training_state WHERE username = ?').get(u);

    const guildMember = db.prepare('SELECT guild_id FROM guild_members WHERE username = ?').get(u);
    let guildState = { myGuildId: null, guilds: [] };
    const allGuilds = db.prepare(`
      SELECT g.*, GROUP_CONCAT(gm.username) as member_names
      FROM guilds g LEFT JOIN guild_members gm ON g.id = gm.guild_id
      GROUP BY g.id
    `).all();
    guildState.guilds = allGuilds.map(g => ({
      id: g.id, name: g.name, emoji: g.emoji, memberNames: g.member_names ? g.member_names.split(',') : [],
      maxMembers: g.max_members, level: g.level, xp: g.xp, chef: g.chef, chefAdjoint: g.chef_adjoint,
      treasury: g.treasury, entryFee: g.entry_fee, payoutPercentage: g.payout_percentage,
      pendingRequests: db.prepare('SELECT username FROM guild_pending_requests WHERE guild_id = ?').all(g.id).map(r => r.username),
      lastPayoutDate: g.last_payout_date, pendingChefTransfer: g.pending_chef_transfer,
      pendingChefTransferDate: g.pending_chef_transfer_date,
      guildMissions: [],
      guildMissionsDate: ''
    }));
    if (guildMember) guildState.myGuildId = guildMember.guild_id;

    res.json({
      userData: {
        name: user.display_name, hp: user.hp, maxHp: user.max_hp, force: user.force,
        totalXP: user.total_xp, coins: user.coins, streak: user.streak,
        lastLoginDate: user.last_login_date, consultedChapters: JSON.parse(user.consulted_chapters || '[]'),
        purchasedItems: JSON.parse(user.purchased_items || '[]'), statPoints: user.stat_points,
        backpack, theme: user.theme || 'default', boostXPUntil: user.boost_xp_until || '',
        avatar: user.avatar || '', equippedDecoration: user.equipped_decoration,
        shieldUntil: user.shield_until || '', timeBonus: !!user.time_bonus
      },
      missions: [], quizState: { attempts: [], todayQuizCount: 0, lastResetDate: '', lockedQuizzes: {} },
      chatMessages, privateMessages, darkMode: false,
      duelState: { phase: 'menu', opponent: null, playerHp: user.max_hp, playerMaxHp: user.max_hp, opponentHp: 100, rounds: [], currentRound: 0, timer: 20, baseTime: 20, result: null, todayDuels: 0, lastDuelDate: '', specialReady: false, isTraining: false, rageStreak: 0, rageTicks: 0, healsUsed: 0, consecutiveDefends: 0 },
      dailyRewards, lastRewardDate: '', trainingState: training || { todayCount: 0, lastResetDate: '' },
      guildState, duelHistory, badges: userBadges.map(b => ({ ...b, unlocked: !!b.unlocked })), friends
    });
  } catch (err) {
    console.error('State error:', err);
    res.status(500).json({ error: String(err.message || err) });
  }
});

app.post('/api/state', auth, (req, res) => {
  const u = req.user.username;
  const s = req.body;
  if (!s.userData) return res.status(400).json({ error: 'Données invalides' });

  db.prepare(`UPDATE users SET coins=?, total_xp=?, hp=?, max_hp=?, force=?, stat_points=?, streak=?,
    last_login_date=?, boost_xp_until=?, shield_until=?, time_bonus=?, avatar=?, theme=?,
    equipped_decoration=?, consulted_chapters=?, purchased_items=? WHERE username=?`)
    .run(s.userData.coins, s.userData.totalXP, s.userData.hp, s.userData.maxHp, s.userData.force,
      s.userData.statPoints, s.userData.streak, s.userData.lastLoginDate, s.userData.boostXPUntil || '',
      s.userData.shieldUntil || '', s.userData.timeBonus ? 1 : 0, s.userData.avatar || '',
      s.userData.theme || 'default', s.userData.equippedDecoration ?? null,
      JSON.stringify(s.userData.consultedChapters || []), JSON.stringify(s.userData.purchasedItems || []), u);

  db.prepare('DELETE FROM user_backpack WHERE username = ?').run(u);
  const insertBp = db.prepare('INSERT INTO user_backpack (username, item_id, item_name, item_icon, item_type, quantity) VALUES (?, ?, ?, ?, ?, ?)');
  for (const item of (s.userData.backpack || [])) {
    insertBp.run(u, item.id, item.name, item.icon, item.type, item.quantity);
  }

  if (s.badges) {
    for (const badge of s.badges) {
      db.prepare('INSERT OR REPLACE INTO user_badges (username, badge_id, unlocked, unlocked_at) VALUES (?, ?, ?, ?)')
        .run(u, badge.id, badge.unlocked ? 1 : 0, badge.unlockedAt || null);
    }
  }

  if (s.friends) {
    db.prepare('DELETE FROM friends WHERE username = ?').run(u);
    const insertFriend = db.prepare('INSERT OR IGNORE INTO friends (username, friend_name) VALUES (?, ?)');
    for (const f of s.friends) insertFriend.run(u, f);
  }

  if (s.trainingState) {
    db.prepare('INSERT OR REPLACE INTO training_state (username, today_count, last_reset_date) VALUES (?, ?, ?)')
      .run(u, s.trainingState.todayCount, s.trainingState.lastResetDate || '');
  }

  res.json({ ok: true });
});

// ========== QUESTIONS ==========

app.get('/api/questions', (req, res) => {
  const questions = db.prepare('SELECT id, question, option_a, option_b, option_c, option_d, correct_answer, explanation FROM questions').all();
  res.json(questions.map(q => ({ id: q.id, question: q.question, options: [q.option_a, q.option_b, q.option_c, q.option_d], correctAnswer: q.correct_answer, explanation: q.explanation })));
});

app.post('/api/questions', auth, adminOnly, (req, res) => {
  const { question, options, correctAnswer, explanation } = req.body;
  if (!question || !options || options.length < 2) return res.status(400).json({ error: 'Invalid' });
  const r = db.prepare('INSERT INTO questions (question, option_a, option_b, option_c, option_d, correct_answer, explanation) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(question, options[0] || '', options[1] || '', options[2] || '', options[3] || '', correctAnswer || 0, explanation || '');
  res.json({ id: r.lastInsertRowid });
});

app.put('/api/questions/:id', auth, adminOnly, (req, res) => {
  const { question, options, correctAnswer, explanation } = req.body;
  db.prepare('UPDATE questions SET question=?, option_a=?, option_b=?, option_c=?, option_d=?, correct_answer=?, explanation=? WHERE id=?')
    .run(question, options?.[0] || '', options?.[1] || '', options?.[2] || '', options?.[3] || '', correctAnswer || 0, explanation || '', req.params.id);
  res.json({ ok: true });
});

app.delete('/api/questions/:id', auth, adminOnly, (req, res) => {
  db.prepare('DELETE FROM questions WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

// ========== SHOP ITEMS ==========

app.get('/api/shop', (req, res) => {
  res.json(db.prepare('SELECT * FROM shop_items').all());
});

app.post('/api/shop', auth, adminOnly, (req, res) => {
  const { name, icon, type, price, description, themeId } = req.body;
  const r = db.prepare('INSERT INTO shop_items (name, icon, type, price, description, theme_id) VALUES (?, ?, ?, ?, ?, ?)')
    .run(name, icon, type, price, description || '', themeId || null);
  res.json({ id: r.lastInsertRowid });
});

app.put('/api/shop/:id', auth, adminOnly, (req, res) => {
  const { name, icon, type, price, description, themeId } = req.body;
  db.prepare('UPDATE shop_items SET name=?, icon=?, type=?, price=?, description=?, theme_id=? WHERE id=?')
    .run(name, icon, type, price, description || '', themeId || null, req.params.id);
  res.json({ ok: true });
});

app.delete('/api/shop/:id', auth, adminOnly, (req, res) => {
  db.prepare('DELETE FROM shop_items WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

// ========== BADGES ==========

app.get('/api/badges', (req, res) => {
  res.json(db.prepare('SELECT * FROM badges').all());
});

app.post('/api/badges', auth, adminOnly, (req, res) => {
  const { id, name, icon, description } = req.body;
  db.prepare('INSERT OR REPLACE INTO badges (id, name, icon, description) VALUES (?, ?, ?, ?)').run(id, name, icon, description || '');
  res.json({ ok: true });
});

app.put('/api/badges/:id', auth, adminOnly, (req, res) => {
  const { name, icon, description } = req.body;
  db.prepare('UPDATE badges SET name=?, icon=?, description=? WHERE id=?').run(name, icon, description || '', req.params.id);
  res.json({ ok: true });
});

app.delete('/api/badges/:id', auth, adminOnly, (req, res) => {
  db.prepare('DELETE FROM badges WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

// ========== ACCOUNTS (Admin) ==========

app.get('/api/accounts', auth, adminOnly, (req, res) => {
  const users = db.prepare('SELECT username, display_name, is_admin, classe, date_naissance FROM users').all();
  res.json(users.map(u => ({ username: u.username, displayName: u.display_name, isAdmin: !!u.is_admin, classe: u.classe, dateNaissance: u.date_naissance })));
});

app.put('/api/accounts/:username', auth, adminOnly, (req, res) => {
  const { displayName, password, isAdmin, classe, dateNaissance } = req.body;
  if (password) {
    const hash = bcrypt.hashSync(password, 10);
    db.prepare('UPDATE users SET display_name=?, password_hash=?, is_admin=?, classe=?, date_naissance=? WHERE username=?')
      .run(displayName, hash, isAdmin ? 1 : 0, classe || '', dateNaissance || '', req.params.username);
  } else {
    db.prepare('UPDATE users SET display_name=?, is_admin=?, classe=?, date_naissance=? WHERE username=?')
      .run(displayName, isAdmin ? 1 : 0, classe || '', dateNaissance || '', req.params.username);
  }
  res.json({ ok: true });
});

app.delete('/api/accounts/:username', auth, adminOnly, (req, res) => {
  db.prepare('DELETE FROM users WHERE username = ?').run(req.params.username);
  res.json({ ok: true });
});

// ========== LEADERBOARD ==========

app.get('/api/leaderboard', (req, res) => {
  const users = db.prepare('SELECT username, display_name, total_xp, avatar FROM users WHERE is_admin = 0 ORDER BY total_xp DESC LIMIT 50').all();
  res.json(users.map((u, i) => ({ rank: i + 1, name: u.display_name, xp: u.total_xp, avatar: u.avatar || '👤' })));
});

// ========== CHAT ==========

app.get('/api/chat', auth, (req, res) => {
  const msgs = db.prepare('SELECT id, username, message, timestamp FROM chat_messages ORDER BY id DESC LIMIT 100').all().reverse();
  res.json(msgs);
});

app.post('/api/chat', auth, (req, res) => {
  const { message } = req.body;
  if (!message?.trim()) return res.status(400).json({ error: 'Message vide' });
  const r = db.prepare('INSERT INTO chat_messages (username, message) VALUES (?, ?)').run(req.user.username, message.trim());
  res.json({ id: r.lastInsertRowid, username: req.user.username, message: message.trim(), timestamp: new Date().toISOString() });
});

// ========== PRIVATE MESSAGES ==========

app.get('/api/messages/:friend', auth, (req, res) => {
  const msgs = db.prepare('SELECT id, from_user, "to", message, timestamp FROM private_messages WHERE (from_user=? AND "to"=?) OR (from_user=? AND "to"=?) ORDER BY id').all(req.user.username, req.params.friend, req.params.friend, req.user.username);
  res.json(msgs);
});

app.post('/api/messages/:friend', auth, (req, res) => {
  const { message } = req.body;
  if (!message?.trim()) return res.status(400).json({ error: 'Message vide' });
  const r = db.prepare('INSERT INTO private_messages (from_user, "to", message) VALUES (?, ?, ?)').run(req.user.username, req.params.friend, message.trim());
  res.json({ id: r.lastInsertRowid });
});

// ========== SEED ==========

function seed() {
  const count = db.prepare('SELECT COUNT(*) as c FROM questions').get().c;
  if (count > 0) return;

  const questions = [
    ['Combien font 7 x 8 ?', '54', '56', '58', '64', 1, '7 × 8 = 56'],
    ['Racine carrée de 144 ?', '10', '11', '12', '14', 2, '√144 = 12 car 12 × 12 = 144'],
    ['Combien font 15% de 200 ?', '15', '20', '25', '30', 3, '15% de 200 = 30'],
    ['Quel est le PGCD de 12 et 18 ?', '2', '3', '6', '9', 2, 'Le PGCD de 12 et 18 est 6'],
    ['Combien font 2³ ?', '6', '8', '9', '12', 1, '2³ = 8'],
    ["L'aire d'un cercle de rayon 3 ?", '9,42', '18,85', '28,27', '12,57', 2, 'Aire = π × r² ≈ 28,27'],
    ['Combien font 25 × 4 ?', '90', '100', '110', '125', 1, '25 × 4 = 100'],
    ['Si x + 5 = 12, que vaut x ?', '5', '6', '7', '8', 2, 'x = 12 − 5 = 7'],
    ["Combien de côtés a un hexagone ?", '5', '6', '7', '8', 1, 'Hexagone = 6 côtés'],
    ['Combien font 3/4 + 1/4 ?', '1/2', '2/4', '1', '4/8', 2, '3/4 + 1/4 = 1'],
    ['Résultat de (-3) × (-5) ?', '-15', '-8', '8', '15', 3, '(-3)×(-5) = 15'],
    ['Combien font 1000 - 357 ?', '643', '653', '743', '753', 0, '1000 − 357 = 643'],
  ];
  const insertQ = db.prepare('INSERT INTO questions (question, option_a, option_b, option_c, option_d, correct_answer, explanation) VALUES (?, ?, ?, ?, ?, ?, ?)');
  for (const q of questions) insertQ.run(...q);

  const shopItems = [
    ['Avatar Einstein', '👴', 'avatar', 100, 'Avatar du génie Einstein', null],
    ['Avatar Newton', '🍎', 'avatar', 100, 'Avatar de Isaac Newton', null],
    ['Avatar Pythagore', '📐', 'avatar', 100, 'Maître de la géométrie', null],
    ['Double XP 24h', '⚡', 'boost', 200, 'Double XP pendant 24h', null],
    ['Bouclier 3 jours', '🛡️', 'boost', 150, 'Protège ta série pendant 3 jours', null],
    ['Cadre Or', '🖼️', 'decoration', 300, 'Cadre doré pour ton profil', null],
    ['Bannière Étoilée', '⭐', 'decoration', 250, 'Bannière avec des étoiles', null],
    ['Temps Bonus', '⏱️', 'boost', 180, '+30 secondes sur les quiz', null],
    ['Pansement x1', '🩹', 'consumable', 30, 'Permet de se soigner 1 fois en duel', null],
    ['Pansement x3', '🩹', 'consumable', 75, '3 pansements pour les duels', null],
    ['Pansement x5', '🩹', 'consumable', 120, '5 pansements pour les duels', null],
    ["Second Souffle", '🔄', 'consumable', 150, "Annule 1 erreur pendant l'entraînement", null],
    ["Second Souffle x3", '🔄', 'consumable', 400, "3 Second Souffle pour l'entraînement", null],
    ['Thème Océan', '🌊', 'theme', 300, 'Bleu océan', 'ocean'],
    ['Thème Forêt', '🌲', 'theme', 300, 'Vert forêt', 'forest'],
    ['Thème Royal', '👑', 'theme', 400, 'Violet royal', 'royal'],
    ['Thème Nuit', '🌙', 'theme', 350, 'Bleu nuit', 'night'],
    ['Thème Rose', '🌸', 'theme', 300, 'Rose bonbon', 'pink'],
  ];
  const insertShop = db.prepare('INSERT INTO shop_items (name, icon, type, price, description, theme_id) VALUES (?, ?, ?, ?, ?, ?)');
  for (const item of shopItems) insertShop.run(...item);

  const badges = [
    ['first_login', 'Premier pas', '👶', 'Se connecter pour la première fois'],
    ['first_training', 'Entraîné', '🏋️', 'Compléter 1 entraînement'],
    ['first_duel', 'Combattant', '⚔️', 'Faire 1 duel'],
    ['first_win', 'Vainqueur', '🏆', 'Gagner 1 duel'],
    ['streak_3', 'Régulier', '🔥', 'Atteindre une série de 3 jours'],
    ['streak_7', 'Infatigable', '💪', 'Atteindre une série de 7 jours'],
    ['level_10', 'Calculateur', '✏️', 'Atteindre le niveau 10'],
    ['level_50', 'Analyste', '📈', 'Atteindre le niveau 50'],
    ['level_100', 'Professeur', '🎓', 'Atteindre le niveau 100'],
    ['rich', 'Riche', '💰', 'Posséder 1 000 pièces'],
    ['shop_first', 'Acheteur', '🛒', 'Acheter 1 objet en boutique'],
    ['guild_join', 'Team player', '🏰', 'Rejoindre ou créer une guilde'],
    ['perfect_quiz', 'Parfait', '💯', 'Obtenir 100% à un quiz'],
    ['duels_10', 'Guerrier', '🗡️', 'Faire 10 duels'],
    ['trainings_10', 'Endurant', '🎯', 'Compléter 10 entraînements'],
  ];
  const insertBadge = db.prepare('INSERT INTO badges (id, name, icon, description) VALUES (?, ?, ?, ?)');
  for (const b of badges) insertBadge.run(...b);

  const hash = bcrypt.hashSync('mdp123', 10);
  db.prepare('INSERT INTO users (username, password_hash, display_name, is_admin) VALUES (?, ?, ?, ?)').run('lucas', hash, 'Lucas Dubois', 1);
  db.prepare('INSERT INTO users (username, password_hash, display_name, is_admin) VALUES (?, ?, ?, ?)').run('emma', hash, 'Emma Martin', 0);
  db.prepare('INSERT INTO users (username, password_hash, display_name, is_admin) VALUES (?, ?, ?, ?)').run('thomas', hash, 'Thomas Bernard', 0);

  console.log('Database seeded with default data');
}

seed();

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
