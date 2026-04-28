import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from './db.js';

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = 'goat-of-maths-secret-change-in-production';

app.use(cors({ origin: true }));
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
  if (!req.user.isAdmin) return res.status(403).json({ error: 'Admin uniquement' });
  next();
}

let seeded = false;

async function seedIfEmpty() {
  if (seeded) return;
  const snap = await db.collection('questions').limit(1).get();
  if (!snap.empty) { seeded = true; return; }

  const batch = db.batch();

  const questions = [
    { question: 'Combien font 7 x 8 ?', options: ['54', '56', '58', '64'], correctAnswer: 1, explanation: '7 × 8 = 56' },
    { question: 'Racine carrée de 144 ?', options: ['10', '11', '12', '14'], correctAnswer: 2, explanation: '√144 = 12 car 12 × 12 = 144' },
    { question: 'Combien font 15% de 200 ?', options: ['15', '20', '25', '30'], correctAnswer: 3, explanation: '15% de 200 = 30' },
    { question: 'Quel est le PGCD de 12 et 18 ?', options: ['2', '3', '6', '9'], correctAnswer: 2, explanation: 'Le PGCD de 12 et 18 est 6' },
    { question: 'Combien font 2³ ?', options: ['6', '8', '9', '12'], correctAnswer: 1, explanation: '2³ = 8' },
    { question: "L'aire d'un cercle de rayon 3 ?", options: ['9,42', '18,85', '28,27', '12,57'], correctAnswer: 2, explanation: 'Aire = π × r² ≈ 28,27' },
    { question: 'Combien font 25 × 4 ?', options: ['90', '100', '110', '125'], correctAnswer: 1, explanation: '25 × 4 = 100' },
    { question: 'Si x + 5 = 12, que vaut x ?', options: ['5', '6', '7', '8'], correctAnswer: 2, explanation: 'x = 12 − 5 = 7' },
    { question: "Combien de côtés a un hexagone ?", options: ['5', '6', '7', '8'], correctAnswer: 1, explanation: 'Hexagone = 6 côtés' },
    { question: 'Combien font 3/4 + 1/4 ?', options: ['1/2', '2/4', '1', '4/8'], correctAnswer: 2, explanation: '3/4 + 1/4 = 1' },
    { question: 'Résultat de (-3) × (-5) ?', options: ['-15', '-8', '8', '15'], correctAnswer: 3, explanation: '(-3)×(-5) = 15' },
    { question: 'Combien font 1000 - 357 ?', options: ['643', '653', '743', '753'], correctAnswer: 0, explanation: '1000 − 357 = 643' },
  ];
  for (const q of questions) batch.set(db.collection('questions').doc(), q);

  const shopItems = [
    { name: 'Avatar Einstein', icon: '👴', type: 'avatar', price: 100, description: 'Avatar du génie Einstein', themeId: null },
    { name: 'Avatar Newton', icon: '🍎', type: 'avatar', price: 100, description: 'Avatar de Isaac Newton', themeId: null },
    { name: 'Avatar Pythagore', icon: '📐', type: 'avatar', price: 100, description: 'Maître de la géométrie', themeId: null },
    { name: 'Double XP 24h', icon: '⚡', type: 'boost', price: 200, description: 'Double XP pendant 24h', themeId: null },
    { name: 'Bouclier 3 jours', icon: '🛡️', type: 'boost', price: 150, description: 'Protège ta série pendant 3 jours', themeId: null },
    { name: 'Cadre Or', icon: '🖼️', type: 'decoration', price: 300, description: 'Cadre doré pour ton profil', themeId: null },
    { name: 'Bannière Étoilée', icon: '⭐', type: 'decoration', price: 250, description: 'Bannière avec des étoiles', themeId: null },
    { name: 'Temps Bonus', icon: '⏱️', type: 'boost', price: 180, description: '+30 secondes sur les quiz', themeId: null },
    { name: 'Pansement x1', icon: '🩹', type: 'consumable', price: 30, description: 'Permet de se soigner 1 fois en duel', themeId: null },
    { name: 'Pansement x3', icon: '🩹', type: 'consumable', price: 75, description: '3 pansements pour les duels', themeId: null },
    { name: 'Pansement x5', icon: '🩹', type: 'consumable', price: 120, description: '5 pansements pour les duels', themeId: null },
    { name: "Second Souffle", icon: '🔄', type: 'consumable', price: 150, description: "Annule 1 erreur pendant l'entraînement", themeId: null },
    { name: "Second Souffle x3", icon: '🔄', type: 'consumable', price: 400, description: "3 Second Souffle pour l'entraînement", themeId: null },
    { name: 'Thème Océan', icon: '🌊', type: 'theme', price: 300, description: 'Bleu océan', themeId: 'ocean' },
    { name: 'Thème Forêt', icon: '🌲', type: 'theme', price: 300, description: 'Vert forêt', themeId: 'forest' },
    { name: 'Thème Royal', icon: '👑', type: 'theme', price: 400, description: 'Violet royal', themeId: 'royal' },
    { name: 'Thème Nuit', icon: '🌙', type: 'theme', price: 350, description: 'Bleu nuit', themeId: 'night' },
    { name: 'Thème Rose', icon: '🌸', type: 'theme', price: 300, description: 'Rose bonbon', themeId: 'pink' },
  ];
  for (const item of shopItems) batch.set(db.collection('shop_items').doc(), item);

  const badges = [
    { id: 'first_login', name: 'Premier pas', icon: '👶', description: 'Se connecter pour la première fois' },
    { id: 'first_training', name: 'Entraîné', icon: '🏋️', description: 'Compléter 1 entraînement' },
    { id: 'first_duel', name: 'Combattant', icon: '⚔️', description: 'Faire 1 duel' },
    { id: 'first_win', name: 'Vainqueur', icon: '🏆', description: 'Gagner 1 duel' },
    { id: 'streak_3', name: 'Régulier', icon: '🔥', description: 'Atteindre une série de 3 jours' },
    { id: 'streak_7', name: 'Infatigable', icon: '💪', description: 'Atteindre une série de 7 jours' },
    { id: 'level_10', name: 'Calculateur', icon: '✏️', description: 'Atteindre le niveau 10' },
    { id: 'level_50', name: 'Analyste', icon: '📈', description: 'Atteindre le niveau 50' },
    { id: 'level_100', name: 'Professeur', icon: '🎓', description: 'Atteindre le niveau 100' },
    { id: 'rich', name: 'Riche', icon: '💰', description: 'Posséder 1 000 pièces' },
    { id: 'shop_first', name: 'Acheteur', icon: '🛒', description: 'Acheter 1 objet en boutique' },
    { id: 'guild_join', name: 'Team player', icon: '🏰', description: 'Rejoindre ou créer une guilde' },
    { id: 'perfect_quiz', name: 'Parfait', icon: '💯', description: 'Obtenir 100% à un quiz' },
    { id: 'duels_10', name: 'Guerrier', icon: '🗡️', description: 'Faire 10 duels' },
    { id: 'trainings_10', name: 'Endurant', icon: '🎯', description: 'Compléter 10 entraînements' },
  ];
  for (const b of badges) batch.set(db.collection('badges').doc(b.id), b);

  await batch.commit();
  console.log('Database seeded with default data');
  seeded = true;
}

// ========== HELPERS ==========

async function getAll(collection) {
  const snap = await db.collection(collection).get();
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

async function getAllWhere(collection, field, op, value) {
  const snap = await db.collection(collection).where(field, op, value).get();
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

async function getOneWhere(collection, field, op, value) {
  const snap = await db.collection(collection).where(field, op, value).limit(1).get();
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() };
}

async function deleteWhere(collection, field, op, value) {
  const snap = await db.collection(collection).where(field, op, value).get();
  if (snap.empty) return;
  const batch = db.batch();
  snap.docs.forEach(d => batch.delete(d.ref));
  await batch.commit();
}

async function getFriends(username) {
  const all = await getAllWhere('friends', 'username', '==', username);
  return all.map(f => f.friendName);
}

async function getChatMessages() {
  const snap = await db.collection('chat_messages').orderBy('timestamp', 'desc').limit(100).get();
  return snap.docs.map(d => ({ id: d.id, ...d.data() })).reverse();
}

async function getPrivateMessages(displayName) {
  const sent = await getAllWhere('private_messages', 'fromUser', '==', displayName);
  const received = await getAllWhere('private_messages', 'to', '==', displayName);
  const map = new Map();
  [...sent, ...received].forEach(m => { if (!map.has(m.id)) map.set(m.id, m); });
  return Array.from(map.values()).sort((a, b) => (a.timestamp || '').localeCompare(b.timestamp || ''));
}

async function getGuildData() {
  const guilds = await getAll('guilds');
  const result = [];
  for (const g of guilds) {
    const members = await getAllWhere('guild_members', 'guildId', '==', g.id);
    const requests = await getAllWhere('guild_pending_requests', 'guildId', '==', g.id);
    result.push({
      id: g.id, name: g.name, emoji: g.emoji,
      memberNames: members.map(m => m.username),
      maxMembers: g.maxMembers || 10, level: g.level || 1, xp: g.xp || 0,
      chef: g.chef, chefAdjoint: g.chefAdjoint || null,
      treasury: g.treasury || 0, entryFee: g.entryFee || 50, payoutPercentage: g.payoutPercentage || 10,
      pendingRequests: requests.map(r => r.username),
      lastPayoutDate: g.lastPayoutDate || '',
      pendingChefTransfer: g.pendingChefTransfer || null,
      pendingChefTransferDate: g.pendingChefTransferDate || null,
      guildMissions: [], guildMissionsDate: '',
    });
  }
  return result;
}

async function getBackpack(username) {
  const items = await getAllWhere('user_backpack', 'username', '==', username);
  return items.map(i => ({ id: i.itemId, name: i.itemName, icon: i.itemIcon, type: i.itemType, quantity: i.quantity }));
}

async function getUserBadges(username) {
  const allBadges = await getAll('badges');
  const userBadges = await getAllWhere('user_badges', 'username', '==', username);
  const map = {};
  userBadges.forEach(b => { map[b.badgeId] = b; });
  return allBadges.map(b => {
    const ub = map[b.id];
    return { id: b.id, name: b.name, icon: b.icon, description: b.description, unlocked: !!(ub && ub.unlocked), unlockedAt: ub?.unlockedAt || null };
  });
}

// ========== AUTH ==========

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const doc = await db.collection('users').doc(username?.toLowerCase()).get();
    if (!doc.exists) return res.status(401).json({ error: 'Identifiants invalides' });
    const user = doc.data();
    if (!bcrypt.compareSync(password, user.passwordHash)) return res.status(401).json({ error: 'Identifiants invalides' });
    const token = jwt.sign({ username: doc.id, displayName: user.displayName, isAdmin: !!user.isAdmin }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { username: doc.id, displayName: user.displayName, isAdmin: !!user.isAdmin } });
  } catch (err) { res.status(500).json({ error: String(err.message || err) }); }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password, displayName, isAdmin } = req.body;
    const uname = username?.toLowerCase().trim();
    if (!uname || !password || !displayName) return res.status(400).json({ error: 'Champs requis manquants' });
    const existing = await db.collection('users').doc(uname).get();
    if (existing.exists) return res.status(409).json({ error: 'Utilisateur déjà existant' });

    await db.collection('users').doc(uname).set({
      passwordHash: bcrypt.hashSync(password, 10), displayName: displayName.trim(),
      isAdmin: isAdmin ? 1 : 0, avatar: '', theme: 'default', equippedDecoration: null,
      coins: 500, totalXp: 0, hp: 100, maxHp: 100, force: 10, statPoints: 0,
      streak: 0, lastLoginDate: '', boostXpUntil: '', shieldUntil: '',
      timeBonus: false, consultedChapters: [], purchasedItems: [],
      createdAt: new Date().toISOString(),
    });

    const rewards = [];
    for (let day = 1; day <= 7; day++) {
      rewards.push({ day, coins: day === 7 ? 100 : 10 + (day - 1) * 5, xp: day === 7 ? 100 : 10 + (day - 1) * 5, icon: day >= 6 ? '💎' : day >= 4 ? '⚡' : '🪙', claimed: false });
    }
    await db.collection('daily_rewards').doc(uname).set({ rewards });
    await db.collection('training_state').doc(uname).set({ todayCount: 0, lastResetDate: '' });

    const token = jwt.sign({ username: uname, displayName: displayName.trim(), isAdmin: !!isAdmin }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { username: uname, displayName: displayName.trim(), isAdmin: !!isAdmin } });
  } catch (err) { console.error('Register error:', err); res.status(500).json({ error: String(err.message || err) }); }
});

app.get('/api/auth/me', auth, async (req, res) => {
  try {
    const doc = await db.collection('users').doc(req.user.username).get();
    if (!doc.exists) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    const u = doc.data();
    res.json({ username: doc.id, displayName: u.displayName, isAdmin: !!u.isAdmin });
  } catch (err) { res.status(500).json({ error: String(err.message || err) }); }
});

// ========== GAME STATE ==========

app.get('/api/state', auth, async (req, res) => {
  try {
    const u = req.user.username;
    const userDoc = await db.collection('users').doc(u).get();
    if (!userDoc.exists) return res.status(404).json({ error: 'Non trouvé' });
    const user = userDoc.data();

    const [backpack, userBadges, friends, chatMessages, privateMessages, guilds] = await Promise.all([
      getBackpack(u), getUserBadges(u), getFriends(u), getChatMessages(), getPrivateMessages(user.displayName), getGuildData(),
    ]);

    const myGuildMember = await getOneWhere('guild_members', 'username', '==', u);
    const myGuildId = myGuildMember ? myGuildMember.guildId : null;

    const dailyDoc = await db.collection('daily_rewards').doc(u).get();
    const dailyRewards = dailyDoc.exists ? (dailyDoc.data().rewards || []) : [];

    const trainingDoc = await db.collection('training_state').doc(u).get();
    const training = trainingDoc.exists ? trainingDoc.data() : { todayCount: 0, lastResetDate: '' };

    res.json({
      userData: {
        name: user.displayName, hp: user.hp || 100, maxHp: user.maxHp || 100, force: user.force || 10,
        totalXP: user.totalXp || 0, coins: user.coins ?? 500, streak: user.streak || 0,
        lastLoginDate: user.lastLoginDate || '', consultedChapters: user.consultedChapters || [],
        purchasedItems: user.purchasedItems || [], statPoints: user.statPoints || 0,
        backpack, theme: user.theme || 'default', boostXPUntil: user.boostXpUntil || '',
        avatar: user.avatar || '', equippedDecoration: user.equippedDecoration || null,
        shieldUntil: user.shieldUntil || '', timeBonus: !!user.timeBonus,
      },
      missions: [], quizState: { attempts: [], todayQuizCount: 0, lastResetDate: '', lockedQuizzes: {} },
      chatMessages, privateMessages, darkMode: false,
      duelState: { phase: 'menu', opponent: null, playerHp: user.maxHp || 100, playerMaxHp: user.maxHp || 100, opponentHp: 100, rounds: [], currentRound: 0, timer: 20, baseTime: 20, result: null, todayDuels: 0, lastDuelDate: '', specialReady: false, isTraining: false, rageStreak: 0, rageTicks: 0, healsUsed: 0, consecutiveDefends: 0 },
      dailyRewards, lastRewardDate: '', trainingState: training,
      guildState: { myGuildId, guilds }, duelHistory: [], badges: userBadges, friends,
    });
  } catch (err) { console.error('State error:', err); res.status(500).json({ error: String(err.message || err) }); }
});

app.post('/api/state', auth, async (req, res) => {
  try {
    const u = req.user.username;
    const s = req.body;
    if (!s.userData) return res.status(400).json({ error: 'Données invalides' });

    const batch = db.batch();
    batch.update(db.collection('users').doc(u), {
      coins: s.userData.coins, totalXp: s.userData.totalXP, hp: s.userData.hp, maxHp: s.userData.maxHp,
      force: s.userData.force, statPoints: s.userData.statPoints, streak: s.userData.streak,
      lastLoginDate: s.userData.lastLoginDate, boostXpUntil: s.userData.boostXPUntil || '',
      shieldUntil: s.userData.shieldUntil || '', timeBonus: !!s.userData.timeBonus,
      avatar: s.userData.avatar || '', theme: s.userData.theme || 'default',
      equippedDecoration: s.userData.equippedDecoration ?? null,
      consultedChapters: s.userData.consultedChapters || [],
      purchasedItems: s.userData.purchasedItems || [],
    });

    const bpSnap = await db.collection('user_backpack').where('username', '==', u).get();
    bpSnap.docs.forEach(d => batch.delete(d.ref));
    for (const item of (s.userData.backpack || [])) {
      batch.set(db.collection('user_backpack').doc(), { username: u, itemId: item.id, itemName: item.name, itemIcon: item.icon, itemType: item.type, quantity: item.quantity });
    }

    if (s.badges) {
      for (const badge of s.badges) {
        batch.set(db.collection('user_badges').doc(`${u}_${badge.id}`), { username: u, badgeId: badge.id, unlocked: !!badge.unlocked, unlockedAt: badge.unlockedAt || null });
      }
    }

    if (s.friends) {
      const frSnap = await db.collection('friends').where('username', '==', u).get();
      frSnap.docs.forEach(d => batch.delete(d.ref));
      for (const f of s.friends) batch.set(db.collection('friends').doc(), { username: u, friendName: f });
    }

    if (s.trainingState) {
      batch.set(db.collection('training_state').doc(u), { todayCount: s.trainingState.todayCount, lastResetDate: s.trainingState.lastResetDate || '' });
    }

    await batch.commit();
    res.json({ ok: true });
  } catch (err) { console.error('State save error:', err); res.status(500).json({ error: String(err.message || err) }); }
});

// ========== QUESTIONS ==========

app.get('/api/questions', async (req, res) => {
  try { res.json(await getAll('questions')); } catch (err) { res.status(500).json({ error: String(err.message || err) }); }
});

app.post('/api/questions', auth, adminOnly, async (req, res) => {
  try {
    const { question, options, correctAnswer, explanation } = req.body;
    if (!question || !options || options.length < 2) return res.status(400).json({ error: 'Invalid' });
    const ref = await db.collection('questions').add({ question, options, correctAnswer: correctAnswer || 0, explanation: explanation || '' });
    res.json({ id: ref.id });
  } catch (err) { res.status(500).json({ error: String(err.message || err) }); }
});

app.put('/api/questions/:id', auth, adminOnly, async (req, res) => {
  try {
    const { question, options, correctAnswer, explanation } = req.body;
    await db.collection('questions').doc(req.params.id).update({ question, options, correctAnswer: correctAnswer || 0, explanation: explanation || '' });
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: String(err.message || err) }); }
});

app.delete('/api/questions/:id', auth, adminOnly, async (req, res) => {
  try { await db.collection('questions').doc(req.params.id).delete(); res.json({ ok: true }); } catch (err) { res.status(500).json({ error: String(err.message || err) }); }
});

// ========== SHOP ITEMS ==========

app.get('/api/shop', async (req, res) => {
  try { res.json(await getAll('shop_items')); } catch (err) { res.status(500).json({ error: String(err.message || err) }); }
});

app.post('/api/shop', auth, adminOnly, async (req, res) => {
  try {
    const { name, icon, type, price, description, themeId } = req.body;
    const ref = await db.collection('shop_items').add({ name, icon, type, price, description: description || '', themeId: themeId || null });
    res.json({ id: ref.id });
  } catch (err) { res.status(500).json({ error: String(err.message || err) }); }
});

app.put('/api/shop/:id', auth, adminOnly, async (req, res) => {
  try {
    const { name, icon, type, price, description, themeId } = req.body;
    await db.collection('shop_items').doc(req.params.id).update({ name, icon, type, price, description: description || '', themeId: themeId || null });
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: String(err.message || err) }); }
});

app.delete('/api/shop/:id', auth, adminOnly, async (req, res) => {
  try { await db.collection('shop_items').doc(req.params.id).delete(); res.json({ ok: true }); } catch (err) { res.status(500).json({ error: String(err.message || err) }); }
});

// ========== BADGES ==========

app.get('/api/badges', async (req, res) => {
  try { res.json(await getAll('badges')); } catch (err) { res.status(500).json({ error: String(err.message || err) }); }
});

app.post('/api/badges', auth, adminOnly, async (req, res) => {
  try {
    const { id, name, icon, description } = req.body;
    await db.collection('badges').doc(id).set({ name, icon, description: description || '' });
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: String(err.message || err) }); }
});

app.put('/api/badges/:id', auth, adminOnly, async (req, res) => {
  try {
    const { name, icon, description } = req.body;
    await db.collection('badges').doc(req.params.id).update({ name, icon, description: description || '' });
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: String(err.message || err) }); }
});

app.delete('/api/badges/:id', auth, adminOnly, async (req, res) => {
  try { await db.collection('badges').doc(req.params.id).delete(); res.json({ ok: true }); } catch (err) { res.status(500).json({ error: String(err.message || err) }); }
});

// ========== ACCOUNTS (Admin) ==========

app.get('/api/accounts', auth, adminOnly, async (req, res) => {
  try {
    const users = await getAll('users');
    res.json(users.map(u => ({ username: u.id, displayName: u.displayName, isAdmin: !!u.isAdmin })));
  } catch (err) { res.status(500).json({ error: String(err.message || err) }); }
});

app.put('/api/accounts/:username', auth, adminOnly, async (req, res) => {
  try {
    const { displayName, password, isAdmin } = req.body;
    const update = { displayName, isAdmin: isAdmin ? 1 : 0 };
    if (password) update.passwordHash = bcrypt.hashSync(password, 10);
    await db.collection('users').doc(req.params.username).update(update);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: String(err.message || err) }); }
});

app.delete('/api/accounts/:username', auth, adminOnly, async (req, res) => {
  try { await db.collection('users').doc(req.params.username).delete(); res.json({ ok: true }); } catch (err) { res.status(500).json({ error: String(err.message || err) }); }
});

// ========== LEADERBOARD ==========

app.get('/api/leaderboard', async (req, res) => {
  try {
    const users = await getAll('users');
    const ranked = users.filter(u => !u.isAdmin).sort((a, b) => (b.totalXp || 0) - (a.totalXp || 0)).slice(0, 50);
    res.json(ranked.map((u, i) => ({ rank: i + 1, name: u.displayName, xp: u.totalXp || 0, avatar: u.avatar || '👤' })));
  } catch (err) { res.status(500).json({ error: String(err.message || err) }); }
});

// ========== CHAT ==========

app.get('/api/chat', auth, async (req, res) => {
  try { res.json(await getChatMessages()); } catch (err) { res.status(500).json({ error: String(err.message || err) }); }
});

app.post('/api/chat', auth, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message?.trim()) return res.status(400).json({ error: 'Message vide' });
    const ref = await db.collection('chat_messages').add({ username: req.user.displayName, message: message.trim(), timestamp: new Date().toISOString() });
    res.json({ id: ref.id, username: req.user.displayName, message: message.trim(), timestamp: new Date().toISOString() });
  } catch (err) { res.status(500).json({ error: String(err.message || err) }); }
});

// ========== PRIVATE MESSAGES ==========

app.get('/api/messages/:friend', auth, async (req, res) => {
  try {
    const friend = req.params.friend;
    const me = req.user.displayName;
    const sent = await getAllWhere('private_messages', 'fromUser', '==', me);
    const received = await getAllWhere('private_messages', 'to', '==', me);
    const map = new Map();
    [...sent, ...received].forEach(m => { if (!map.has(m.id)) map.set(m.id, m); });
    const msgs = Array.from(map.values()).filter(m => m.fromUser === friend || m.to === friend).sort((a, b) => (a.timestamp || '').localeCompare(b.timestamp || ''));
    res.json(msgs);
  } catch (err) { res.status(500).json({ error: String(err.message || err) }); }
});

app.post('/api/messages/:friend', auth, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message?.trim()) return res.status(400).json({ error: 'Message vide' });
    const ref = await db.collection('private_messages').add({ fromUser: req.user.displayName, to: req.params.friend, message: message.trim(), timestamp: new Date().toISOString() });
    res.json({ id: ref.id });
  } catch (err) { res.status(500).json({ error: String(err.message || err) }); }
});

// ========== FRIENDS ==========

app.get('/api/friends', auth, async (req, res) => {
  try { res.json(await getFriends(req.user.username)); } catch (err) { res.status(500).json({ error: String(err.message || err) }); }
});

app.post('/api/friends/:name', auth, async (req, res) => {
  try {
    const friendName = req.params.name;
    if (friendName === req.user.username) return res.status(400).json({ error: "Impossible de s'ajouter soi-même" });
    const existing = await getOneWhere('friends', 'username', '==', req.user.username);
    const existing2 = await getAllWhere('friends', 'username', '==', req.user.username);
    if (existing2.some(f => f.friendName === friendName)) return res.json({ ok: true });
    if (existing2.length >= 50) return res.status(400).json({ error: 'Limite de 50 amis atteinte' });
    await db.collection('friends').add({ username: req.user.username, friendName });
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: String(err.message || err) }); }
});

app.delete('/api/friends/:name', auth, async (req, res) => {
  try {
    const all = await getAllWhere('friends', 'username', '==', req.user.username);
    const batch = db.batch();
    all.filter(f => f.friendName === req.params.name).forEach(f => batch.delete(db.collection('friends').doc(f.id)));
    await batch.commit();
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: String(err.message || err) }); }
});

app.get('/api/users', auth, async (req, res) => {
  try {
    const users = await getAll('users');
    res.json(users.map(u => ({ name: u.displayName, avatar: u.avatar || '👤' })));
  } catch (err) { res.status(500).json({ error: String(err.message || err) }); }
});

// ========== GUILDS ==========

app.get('/api/guilds', async (req, res) => {
  try { res.json(await getGuildData()); } catch (err) { res.status(500).json({ error: String(err.message || err) }); }
});

app.post('/api/guilds', auth, async (req, res) => {
  try {
    const { name, emoji, entryFee } = req.body;
    if (!name || !emoji) return res.status(400).json({ error: 'Nom et emoji requis' });
    const userDoc = await db.collection('users').doc(req.user.username).get();
    const user = userDoc.data();
    if (!user || (user.coins || 0) < 10000) return res.status(400).json({ error: '10 000 pièces requises' });
    const existing = await getOneWhere('guild_members', 'username', '==', req.user.username);
    if (existing) return res.status(400).json({ error: 'Déjà dans une guilde' });
    await db.collection('users').doc(req.user.username).update({ coins: (user.coins || 0) - 10000 });
    const ref = await db.collection('guilds').add({ name, emoji, chef: user.displayName, chefAdjoint: null, maxMembers: 10, level: 1, xp: 0, treasury: 0, entryFee: entryFee || 50, payoutPercentage: 10, lastPayoutDate: '', pendingChefTransfer: null, pendingChefTransferDate: null });
    await db.collection('guild_members').add({ guildId: ref.id, username: req.user.username });
    res.json({ id: ref.id });
  } catch (err) { res.status(500).json({ error: String(err.message || err) }); }
});

app.post('/api/guilds/:id/join', auth, async (req, res) => {
  try {
    const gid = req.params.id;
    const guildDoc = await db.collection('guilds').doc(gid).get();
    if (!guildDoc.exists) return res.status(404).json({ error: 'Guilde introuvable' });
    const existing = await getOneWhere('guild_members', 'username', '==', req.user.username);
    if (existing) return res.status(400).json({ error: 'Déjà dans une guilde' });
    const pending = await getAllWhere('guild_pending_requests', 'guildId', '==', gid);
    if (pending.some(r => r.username === req.user.displayName)) return res.json({ ok: true });
    await db.collection('guild_pending_requests').add({ guildId: gid, username: req.user.displayName });
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: String(err.message || err) }); }
});

app.post('/api/guilds/:id/leave', auth, async (req, res) => {
  try {
    const gid = req.params.id;
    const userDoc = await db.collection('users').doc(req.user.username).get();
    const displayName = userDoc.data()?.displayName;
    const members = await getAllWhere('guild_members', 'guildId', '==', gid);
    const me = members.find(m => m.username === req.user.username);
    if (me) await db.collection('guild_members').doc(me.id).delete();
    const remaining = members.filter(m => m.username !== req.user.username);
    if (remaining.length === 0) {
      await db.collection('guilds').doc(gid).delete();
    } else {
      const guildDoc = await db.collection('guilds').doc(gid).get();
      if (guildDoc.exists) {
        const guild = guildDoc.data();
        const updates = {};
        if (guild.chef === displayName) updates.chef = remaining[0].username;
        if (guild.chefAdjoint === displayName) updates.chefAdjoint = null;
        if (Object.keys(updates).length > 0) await db.collection('guilds').doc(gid).update(updates);
      }
    }
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: String(err.message || err) }); }
});

app.post('/api/guilds/:id/accept', auth, async (req, res) => {
  try {
    const gid = req.params.id;
    const { name } = req.body;
    const guildDoc = await db.collection('guilds').doc(gid).get();
    if (!guildDoc.exists) return res.status(404).json({ error: 'Guilde introuvable' });
    const guild = guildDoc.data();
    const userDoc = await db.collection('users').doc(req.user.username).get();
    const dn = userDoc.data()?.displayName;
    if (guild.chef !== dn && guild.chefAdjoint !== dn) return res.status(403).json({ error: 'Pas chef' });
    const pending = await getAllWhere('guild_pending_requests', 'guildId', '==', gid);
    const batch = db.batch();
    pending.filter(r => r.username === name).forEach(r => batch.delete(db.collection('guild_pending_requests').doc(r.id)));
    const target = await getOneWhere('users_displaynames', 'displayName', '==', name);
    const allUsers = await getAll('users');
    const targetUser = allUsers.find(u => u.displayName === name);
    if (targetUser) {
      batch.set(db.collection('guild_members').doc(), { guildId: gid, username: targetUser.id });
      batch.update(db.collection('guilds').doc(gid), { treasury: (guild.treasury || 0) + (guild.entryFee || 50) });
    }
    await batch.commit();
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: String(err.message || err) }); }
});

app.post('/api/guilds/:id/reject', auth, async (req, res) => {
  try {
    const gid = req.params.id;
    const { name } = req.body;
    const pending = await getAllWhere('guild_pending_requests', 'guildId', '==', gid);
    const batch = db.batch();
    pending.filter(r => r.username === name).forEach(r => batch.delete(db.collection('guild_pending_requests').doc(r.id)));
    await batch.commit();
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: String(err.message || err) }); }
});

app.post('/api/guilds/:id/kick', auth, async (req, res) => {
  try {
    const gid = req.params.id;
    const { name } = req.body;
    const guildDoc = await db.collection('guilds').doc(gid).get();
    if (!guildDoc.exists) return res.status(404).json({ error: 'Guilde introuvable' });
    const guild = guildDoc.data();
    const userDoc = await db.collection('users').doc(req.user.username).get();
    if (guild.chef !== userDoc.data()?.displayName) return res.status(403).json({ error: 'Pas chef' });
    if (name === guild.chef) return res.status(400).json({ error: 'Impossible' });
    const allUsers = await getAll('users');
    const target = allUsers.find(u => u.displayName === name);
    if (target) {
      const members = await getAllWhere('guild_members', 'guildId', '==', gid);
      const targetMember = members.find(m => m.username === target.id);
      if (targetMember) await db.collection('guild_members').doc(targetMember.id).delete();
    }
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: String(err.message || err) }); }
});

app.delete('/api/guilds/:id', auth, async (req, res) => {
  try {
    const gid = req.params.id;
    const guildDoc = await db.collection('guilds').doc(gid).get();
    if (!guildDoc.exists) return res.status(404).json({ error: 'Guilde introuvable' });
    const guild = guildDoc.data();
    const userDoc = await db.collection('users').doc(req.user.username).get();
    if (guild.chef !== userDoc.data()?.displayName) return res.status(403).json({ error: 'Pas chef' });
    const batch = db.batch();
    const members = await getAllWhere('guild_members', 'guildId', '==', gid);
    members.forEach(m => batch.delete(db.collection('guild_members').doc(m.id)));
    const requests = await getAllWhere('guild_pending_requests', 'guildId', '==', gid);
    requests.forEach(r => batch.delete(db.collection('guild_pending_requests').doc(r.id)));
    batch.delete(db.collection('guilds').doc(gid));
    await batch.commit();
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: String(err.message || err) }); }
});

app.put('/api/guilds/:id/settings', auth, async (req, res) => {
  try {
    const gid = req.params.id;
    const { entryFee, payoutPercentage, chefAdjoint } = req.body;
    const guildDoc = await db.collection('guilds').doc(gid).get();
    if (!guildDoc.exists) return res.status(404).json({ error: 'Guilde introuvable' });
    const guild = guildDoc.data();
    const userDoc = await db.collection('users').doc(req.user.username).get();
    if (guild.chef !== userDoc.data()?.displayName) return res.status(403).json({ error: 'Pas chef' });
    const updates = {};
    if (entryFee !== undefined) updates.entryFee = entryFee;
    if (payoutPercentage !== undefined) updates.payoutPercentage = payoutPercentage;
    if (chefAdjoint !== undefined) updates.chefAdjoint = chefAdjoint;
    if (Object.keys(updates).length > 0) await db.collection('guilds').doc(gid).update(updates);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: String(err.message || err) }); }
});

// ========== SHOP PURCHASE ==========

app.post('/api/shop/:id/buy', auth, async (req, res) => {
  try {
    const itemId = req.params.id;
    const itemDoc = await db.collection('shop_items').doc(itemId).get();
    if (!itemDoc.exists) return res.status(404).json({ error: 'Item introuvable' });
    const item = itemDoc.data();
    const userDoc = await db.collection('users').doc(req.user.username).get();
    const user = userDoc.data();
    if (!user || (user.coins || 0) < item.price) return res.status(400).json({ error: 'Pas assez de pièces' });
    const newCoins = (user.coins || 0) - item.price;
    const purchased = [...(user.purchasedItems || [])];
    if ((item.type === 'theme' || item.type === 'decoration' || item.type === 'avatar') && !purchased.includes(itemId)) {
      purchased.push(itemId);
    }
    await db.collection('users').doc(req.user.username).update({ coins: newCoins, purchasedItems: purchased });

    if (item.type === 'consumable' || item.type === 'boost') {
      let bpId = 'consumable-' + itemId, bpName = item.name, bpIcon = item.icon, bpType = item.type, qty = 1;
      const nl = item.name.toLowerCase();
      if (nl.includes('pansement')) { bpId = 'bandage'; bpName = 'Pansement'; bpIcon = '🩹'; bpType = 'consumable'; const m = item.name.match(/x\s*(\d+)/i); if (m) qty = parseInt(m[1]); }
      else if (nl.includes('second souffle')) { bpId = 'second-souffle'; bpName = 'Second Souffle'; bpIcon = '🔄'; bpType = 'consumable'; const m = item.name.match(/x\s*(\d+)/i); if (m) qty = parseInt(m[1]); }
      else if (item.type === 'boost') {
        const dl = (item.description || '').toLowerCase();
        if (dl.includes('série') || dl.includes('streak') || dl.includes('bouclier')) bpId = 'boost-shield';
        else if (dl.includes('temps') || dl.includes('time')) bpId = 'boost-time';
        else if (dl.includes('xp') || dl.includes('double')) bpId = 'boost-xp';
        else bpId = 'boost-' + itemId;
        bpType = 'boost';
      }
      const existing = await getAllWhere('user_backpack', 'username', '==', req.user.username);
      const match = existing.find(b => b.itemId === bpId);
      if (match) { await db.collection('user_backpack').doc(match.id).update({ quantity: (match.quantity || 0) + qty }); }
      else { await db.collection('user_backpack').add({ username: req.user.username, itemId: bpId, itemName: bpName, itemIcon: bpIcon, itemType: bpType, quantity: qty }); }
    }
    res.json({ ok: true, newCoins });
  } catch (err) { console.error('Shop buy error:', err); res.status(500).json({ error: String(err.message || err) }); }
});

// ========== START ==========

await seedIfEmpty();
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
