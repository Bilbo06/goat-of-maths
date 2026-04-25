import type { Chapter, Mission, ShopItem, Friend, Guild, LeaderboardEntry, DuelOpponent, DailyReward, ThemeDef } from '../types';

export const CHAPTERS: Chapter[] = [
  { id: 1, title: 'Calcul mental', icon: '🧮', difficulty: 'Facile', xp: 20, coins: 10 },
  { id: 2, title: 'Géométrie de base', icon: '📏', difficulty: 'Facile', xp: 25, coins: 10 },
  { id: 3, title: 'Fonctions affines', icon: '📈', difficulty: 'Moyen', xp: 35, coins: 10 },
  { id: 4, title: 'Probabilités', icon: '🎲', difficulty: 'Moyen', xp: 30, coins: 10 },
  { id: 5, title: 'Trigonométrie', icon: '📐', difficulty: 'Difficile', xp: 50, coins: 10 },
  { id: 6, title: 'Équations 2nd degré', icon: '🔢', difficulty: 'Difficile', xp: 45, coins: 10 },
];

export const INITIAL_MISSIONS: Mission[] = [
  { id: 'login', title: 'Première connexion', desc: "Se connecter aujourd'hui", xp: 10, coins: 10, completed: true },
  { id: 'chapter', title: 'Consulter un chapitre', desc: 'Ouvrir et lire un chapitre', xp: 20, coins: 10, completed: false },
  { id: 'quiz', title: 'Faire un quiz', desc: 'Terminer un quiz', xp: 50, coins: 20, completed: false },
  { id: 'perfect', title: 'Score parfait', desc: 'Obtenir 100% à un quiz', xp: 100, coins: 50, completed: false },
  { id: 'streak', title: 'Série active', desc: 'Maintenir sa série', xp: 30, coins: 15, completed: false },
  { id: 'training', title: 'Entraînement réussi', desc: 'Compléter 1 entraînement sans erreur', xp: 40, coins: 15, completed: false },
  { id: 'duel', title: 'Gagner un duel', desc: 'Remporter 1 duel', xp: 50, coins: 20, completed: false },
];

export const SHOP_ITEMS: ShopItem[] = [
  { id: 1, name: 'Avatar Einstein', icon: '👴', type: 'avatar', price: 100, description: 'Avatar du génie Einstein' },
  { id: 2, name: 'Avatar Newton', icon: '🍎', type: 'avatar', price: 100, description: 'Avatar de Isaac Newton' },
  { id: 3, name: 'Avatar Pythagore', icon: '📐', type: 'avatar', price: 100, description: 'Maître de la géométrie' },
  { id: 4, name: 'Double XP 24h', icon: '⚡', type: 'boost', price: 200, description: 'Double XP pendant 24h' },
  { id: 5, name: 'Bouclier 3 jours', icon: '🛡️', type: 'boost', price: 150, description: 'Protège ta série pendant 3 jours' },
  { id: 6, name: 'Cadre Or', icon: '🖼️', type: 'decoration', price: 300, description: 'Cadre doré pour ton profil' },
  { id: 7, name: 'Bannière Étoilée', icon: '⭐', type: 'decoration', price: 250, description: 'Bannière avec des étoiles' },
  { id: 8, name: 'Temps Bonus', icon: '⏱️', type: 'boost', price: 180, description: '+30 secondes sur les quiz' },
  { id: 9, name: 'Pansement x1', icon: '🩹', type: 'consumable', price: 30, description: 'Permet de se soigner 1 fois en duel' },
  { id: 10, name: 'Pansement x3', icon: '🩹', type: 'consumable', price: 75, description: '3 pansements pour les duels' },
  { id: 11, name: 'Pansement x5', icon: '🩹', type: 'consumable', price: 120, description: '5 pansements pour les duels' },
  { id: 12, name: 'Second Souffle', icon: '🔄', type: 'consumable', price: 150, description: 'Annule 1 erreur pendant l\'entraînement' },
  { id: 13, name: 'Second Souffle x3', icon: '🔄', type: 'consumable', price: 400, description: '3 Second Souffle pour l\'entraînement' },
  { id: 20, name: 'Thème Océan', icon: '🌊', type: 'theme', price: 300, description: 'Bleu océan', themeId: 'ocean' },
  { id: 21, name: 'Thème Forêt', icon: '🌲', type: 'theme', price: 300, description: 'Vert forêt', themeId: 'forest' },
  { id: 22, name: 'Thème Royal', icon: '👑', type: 'theme', price: 400, description: 'Violet royal', themeId: 'royal' },
  { id: 23, name: 'Thème Nuit', icon: '🌙', type: 'theme', price: 350, description: 'Bleu nuit', themeId: 'night' },
  { id: 24, name: 'Thème Rose', icon: '🌸', type: 'theme', price: 300, description: 'Rose bonbon', themeId: 'pink' },
];

export const GUILD_MISSION_TEMPLATES = [
  { label: "Compléter 1 entraînement", icon: "🏋️", xpReward: 30, coinsReward: 15 },
  { label: "Gagner 1 duel", icon: "⚔️", xpReward: 40, coinsReward: 20 },
  { label: "Gagner 60 XP", icon: "⭐", xpReward: 25, coinsReward: 10 },
  { label: "Répondre à 5 bonnes questions", icon: "✅", xpReward: 20, coinsReward: 10 },
  { label: "Répondre à 10 bonnes questions", icon: "📝", xpReward: 40, coinsReward: 20 },
  { label: "Visiter la boutique", icon: "🛒", xpReward: 10, coinsReward: 5 },
  { label: "Gagner 100 XP en une journée", icon: "🔥", xpReward: 50, coinsReward: 25 },
  { label: "Faire 3 entraînements", icon: "💪", xpReward: 60, coinsReward: 30 },
  { label: "Acheter 1 objet", icon: "🎒", xpReward: 15, coinsReward: 10 },
  { label: "Aider un ami au foyer", icon: "💬", xpReward: 20, coinsReward: 10 },
];

export const THEMES: ThemeDef[] = [
  { id: 'default', name: 'Orange', icon: '🧡', primary: '#FF6B00', secondary: '#D32F2F', accent: '#FF6B00' },
  { id: 'ocean', name: 'Océan', icon: '🌊', primary: '#0077B6', secondary: '#023E8A', accent: '#0096C7' },
  { id: 'forest', name: 'Forêt', icon: '🌲', primary: '#2D6A4F', secondary: '#1B4332', accent: '#40916C' },
  { id: 'royal', name: 'Royal', icon: '👑', primary: '#7B2CBF', secondary: '#5A189A', accent: '#9D4EDD' },
  { id: 'night', name: 'Nuit', icon: '🌙', primary: '#3F37C9', secondary: '#240046', accent: '#4361EE' },
  { id: 'pink', name: 'Rose', icon: '🌸', primary: '#E91E8C', secondary: '#C2185B', accent: '#F06292' },
];

export const MOCK_FRIENDS: Friend[] = [
  { id: 1, name: 'Emma Martin', level: 15, grade: 'Calculateur', online: true },
  { id: 2, name: 'Thomas Bernard', level: 8, grade: 'Novice', online: false },
  { id: 3, name: 'Léa Dubois', level: 22, grade: 'Algébriste', online: true },
  { id: 4, name: 'Hugo Petit', level: 12, grade: 'Calculateur', online: false },
  { id: 5, name: 'Chloé Rousseau', level: 18, grade: 'Calculateur', online: true },
];

export const MOCK_GUILDS: Guild[] = [
  { id: 1, name: 'Les Matheux', emoji: '🧮', memberNames: ['Emma Martin', 'Léa Dubois', 'Chloé Rousseau', 'Sophie Laurent'], maxMembers: 10, level: 5, xp: 750, chef: 'Sophie Laurent', chefAdjoint: 'Emma Martin', treasury: 2400, entryFee: 50, payoutPercentage: 30, pendingRequests: [], lastPayoutDate: '', pendingChefTransfer: null, pendingChefTransferDate: null, guildMissions: [], guildMissionsDate: '' },
  { id: 2, name: 'Équipe Pythagore', emoji: '📐', memberNames: ['Thomas Bernard', 'Hugo Petit', 'Jules Girard'], maxMembers: 10, level: 3, xp: 300, chef: 'Jules Girard', chefAdjoint: null, treasury: 800, entryFee: 30, payoutPercentage: 20, pendingRequests: [], lastPayoutDate: '', pendingChefTransfer: null, pendingChefTransferDate: null, guildMissions: [], guildMissionsDate: '' },
  { id: 3, name: 'Génies des Maths', emoji: '🧠', memberNames: ['Antoine Moreau', 'Marie Fontaine'], maxMembers: 10, level: 7, xp: 1200, chef: 'Antoine Moreau', chefAdjoint: 'Marie Fontaine', treasury: 5600, entryFee: 100, payoutPercentage: 40, pendingRequests: [], lastPayoutDate: '', pendingChefTransfer: null, pendingChefTransferDate: null, guildMissions: [], guildMissionsDate: '' },
  { id: 4, name: 'Calculateurs Fous', emoji: '🤪', memberNames: [], maxMembers: 10, level: 2, xp: 100, chef: '', chefAdjoint: null, treasury: 0, entryFee: 20, payoutPercentage: 10, pendingRequests: [], lastPayoutDate: '', pendingChefTransfer: null, pendingChefTransferDate: null, guildMissions: [], guildMissionsDate: '' },
];

export const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, name: 'Sophie Laurent', level: 72, grade: 'Mathématicien', xp: 10800 },
  { rank: 2, name: 'Antoine Moreau', level: 55, grade: 'Analyste', xp: 8250 },
  { rank: 3, name: 'Marie Fontaine', level: 42, grade: 'Géomètre', xp: 6300 },
  { rank: 4, name: 'Lucas Dubois', level: 1, grade: 'Novice', xp: 0 },
  { rank: 5, name: 'Jules Girard', level: 28, grade: 'Algébriste', xp: 4200 },
];

export const DUEL_OPPONENTS: DuelOpponent[] = [
  { id: 1, name: 'Chloé Rousseau', avatar: '🧑‍🎓', level: 12, grade: 'Calculateur', hp: 100, maxHp: 100 },
  { id: 2, name: 'Hugo Petit', avatar: '👦', level: 8, grade: 'Novice', hp: 100, maxHp: 100 },
  { id: 3, name: 'Léa Dubois', avatar: '👩‍🎓', level: 22, grade: 'Algébriste', hp: 120, maxHp: 120 },
  { id: 4, name: 'Antoine Moreau', avatar: '🧑', level: 15, grade: 'Calculateur', hp: 110, maxHp: 110 },
  { id: 5, name: 'Marie Fontaine', avatar: '👩', level: 35, grade: 'Géomètre', hp: 130, maxHp: 130 },
];

export const DUEL_QUESTIONS: { question: string; options: string[]; correctAnswer: number; explanation: string }[] = [
  { question: 'Combien font 7 x 8 ?', options: ['54', '56', '58', '64'], correctAnswer: 1, explanation: '7 × 8 = 56. Tu peux calculer 7 × 10 = 70, puis 70 − 14 = 56.' },
  { question: 'Racine carrée de 144 ?', options: ['10', '11', '12', '14'], correctAnswer: 2, explanation: '√144 = 12 car 12 × 12 = 144.' },
  { question: 'Combien font 15% de 200 ?', options: ['15', '20', '25', '30'], correctAnswer: 3, explanation: '15% de 200 = 200 × 15/100 = 200 × 0,15 = 30.' },
  { question: 'Quel est le PGCD de 12 et 18 ?', options: ['2', '3', '6', '9'], correctAnswer: 2, explanation: 'Les diviseurs de 12 : 1,2,3,4,6,12. Les diviseurs de 18 : 1,2,3,6,9,18. Le plus grand commun est 6.' },
  { question: 'Combien font 2³ ?', options: ['6', '8', '9', '12'], correctAnswer: 1, explanation: '2³ = 2 × 2 × 2 = 8.' },
  { question: "L'aire d'un cercle de rayon 3 est (approximativement) :", options: ['9,42', '18,85', '28,27', '12,57'], correctAnswer: 2, explanation: "Aire = π × r² = π × 9 ≈ 28,27." },
  { question: 'Combien font 25 × 4 ?', options: ['90', '100', '110', '125'], correctAnswer: 1, explanation: '25 × 4 = 100. Astuce : 25 × 4 = 100 est un classique !' },
  { question: 'Si x + 5 = 12, que vaut x ?', options: ['5', '6', '7', '8'], correctAnswer: 2, explanation: 'x + 5 = 12 → x = 12 − 5 = 7.' },
  { question: 'Combien de côtés a un hexagone ?', options: ['5', '6', '7', '8'], correctAnswer: 1, explanation: '"Hexa" = 6 en grec. Un hexagone a 6 côtés.' },
  { question: 'Combien font 3/4 + 1/4 ?', options: ['1/2', '2/4', '1', '4/8'], correctAnswer: 2, explanation: '3/4 + 1/4 = 4/4 = 1.' },
  { question: 'Quel est le résultat de (-3) × (-5) ?', options: ['-15', '-8', '8', '15'], correctAnswer: 3, explanation: 'Un nombre négatif × un nombre négatif = nombre positif. 3 × 5 = 15.' },
  { question: 'Combien font 1000 - 357 ?', options: ['643', '653', '743', '753'], correctAnswer: 0, explanation: '1000 − 357 = 643. Vérification : 643 + 357 = 1000.' },
];

export const BADGE_DEFS = [
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

export const DAILY_REWARDS: DailyReward[] = [
  { day: 1, coins: 10, xp: 10, icon: '🪙', claimed: false },
  { day: 2, coins: 15, xp: 15, icon: '🪙', claimed: false },
  { day: 3, coins: 20, xp: 20, icon: '⚡', claimed: false },
  { day: 4, coins: 25, xp: 25, icon: '⚡', claimed: false },
  { day: 5, coins: 30, xp: 30, icon: '💎', claimed: false },
  { day: 6, coins: 40, xp: 40, icon: '💎', claimed: false },
  { day: 7, coins: 100, xp: 100, icon: '🎁', claimed: false },
];
