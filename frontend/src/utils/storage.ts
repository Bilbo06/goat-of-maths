import type { GameAppState, QuizAttempt, QuizState, DuelState, PrivateMessage } from '../types';
import { INITIAL_MISSIONS, DAILY_REWARDS, MOCK_GUILDS, GUILD_MISSION_TEMPLATES } from '../data/constants';
import { getAdminBadges } from './adminStorage';
import { computeGradeProgress } from './grades';

const STORAGE_KEY_PREFIX = 'goat-state-';

function getStorageKey(username: string): string {
  return `${STORAGE_KEY_PREFIX}${username}`;
}

export function applyGuildTax(state: GameAppState, rawCoins: number): { coins: number; guildState: GameAppState['guildState'] } {
  if (!state.guildState.myGuildId) return { coins: rawCoins, guildState: state.guildState };
  const tax = Math.floor(rawCoins * 0.15);
  if (tax <= 0) return { coins: rawCoins, guildState: state.guildState };
  const guilds = state.guildState.guilds.map((g) =>
    g.id === state.guildState.myGuildId ? { ...g, treasury: g.treasury + tax } : g
  );
  return { coins: rawCoins - tax, guildState: { ...state.guildState, guilds } };
}

function addGuildXP(state: GameAppState, xp: number): GameAppState['guildState'] {
  if (!state.guildState.myGuildId) return state.guildState;
  const guilds = state.guildState.guilds.map((g) => {
    if (g.id !== state.guildState.myGuildId) return g;
    const newXp = g.xp + xp;
    const xpPerLevel = 200;
    const newLevel = Math.floor(newXp / xpPerLevel) + 1;
    return { ...g, xp: newXp, level: newLevel };
  });
  return { ...state.guildState, guilds };
}

function generateGuildMissions(today: string) {
  const shuffled = [...GUILD_MISSION_TEMPLATES].sort(() => Math.random() - 0.5).slice(0, 3);
  return shuffled.map((t, i) => ({
    id: `guild-${today}-${i}`,
    label: t.label,
    icon: t.icon,
    xpReward: t.xpReward,
    coinsReward: t.coinsReward,
    completedBy: [] as string[],
    rewarded: false,
  }));
}

export function getTodayDateString(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function loadGameState(username: string, displayName: string): GameAppState | null {
  try {
    const raw = localStorage.getItem(getStorageKey(username));
    if (!raw) return null;
    const saved = JSON.parse(raw) as GameAppState;
    const defaults = getDefaultGameState(displayName);
    const newState = {
      ...defaults,
      ...saved,
      userData: { ...defaults.userData, ...saved.userData },
      quizState: { ...defaults.quizState, ...saved.quizState },
      duelState: { ...defaults.duelState, ...(saved.duelState || {}) },
      dailyRewards: saved.dailyRewards || defaults.dailyRewards,
      trainingState: { ...defaults.trainingState, ...(saved.trainingState || {}) },
      guildState: saved.guildState || defaults.guildState,
      privateMessages: saved.privateMessages || defaults.privateMessages,
      duelHistory: saved.duelHistory || defaults.duelHistory,
      badges: saved.badges || defaults.badges,
      friends: saved.friends || defaults.friends,
    };

    newState.userData.backpack = newState.userData.backpack.filter(
      (item: { type: string }) => item.type === 'consumable' || item.type === 'boost'
    );

    newState.guildState.guilds = newState.guildState.guilds.map((g) => ({
      ...g,
      pendingChefTransfer: g.pendingChefTransfer ?? null,
      pendingChefTransferDate: g.pendingChefTransferDate ?? null,
      guildMissions: g.guildMissions ?? [],
      guildMissionsDate: g.guildMissionsDate ?? '',
      xp: g.xp ?? 0,
    }));

    const adminBadges = getAdminBadges();
    const existingBadgeMap = new Map(newState.badges.map((b) => [b.id, b]));
    newState.badges = adminBadges.map((def) => {
      const existing = existingBadgeMap.get(def.id);
      if (existing) return existing;
      return { ...def, unlocked: false, unlockedAt: null };
    });

    if (!newState.duelState.baseTime) (newState.duelState as Record<string, unknown>).baseTime = 20;
    if (newState.duelState.consecutiveDefends === undefined) (newState.duelState as Record<string, unknown>).consecutiveDefends = 0;

    return newState;
  } catch {
    return null;
  }
}

export function saveGameState(state: GameAppState, username: string): void {
  try {
    localStorage.setItem(getStorageKey(username), JSON.stringify(state));
  } catch {
    // silently fail
  }
}

export function getDefaultGameState(displayName: string = 'Joueur'): GameAppState {
  return {
    userData: {
      name: displayName,
      hp: 100,
      maxHp: 100,
      force: 10,
      totalXP: 0,
      coins: 500,
      streak: 0,
      lastLoginDate: '',
      consultedChapters: [],
      purchasedItems: [],
      statPoints: 0,
      backpack: [
        { id: 'bandage', name: 'Pansement', icon: '🩹', type: 'consumable', quantity: 3 },
      ],
      theme: 'default',
      boostXPUntil: '',
      avatar: '',
      equippedDecoration: null,
      shieldUntil: '',
      timeBonus: false,
    },
    missions: INITIAL_MISSIONS.map((m) => ({ ...m, completed: false })),
    quizState: {
      attempts: [],
      todayQuizCount: 0,
      lastResetDate: getTodayDateString(),
      lockedQuizzes: {},
    },
    chatMessages: [
      {
        id: 1,
        username: 'Emma',
        message: 'Salut tout le monde ! 👋',
        timestamp: new Date(Date.now() - 300000).toISOString(),
      },
      {
        id: 2,
        username: 'Thomas',
        message: "Quelqu'un peut m'aider sur les équations ?",
        timestamp: new Date(Date.now() - 180000).toISOString(),
      },
      {
        id: 3,
        username: 'Léa',
        message: 'Oui, dis-moi !',
        timestamp: new Date(Date.now() - 60000).toISOString(),
      },
    ],
    privateMessages: [
      { id: 1, from: 'Emma Martin', to: 'Lucas Dubois', message: 'Salut Lucas ! Tu veux faire un duel ? ⚔️', timestamp: new Date(Date.now() - 600000).toISOString() },
      { id: 2, from: 'Lucas Dubois', to: 'Emma Martin', message: 'Ok go ! 😎', timestamp: new Date(Date.now() - 500000).toISOString() },
    ] as PrivateMessage[],
    darkMode: false,
    duelState: {
      phase: 'menu',
      opponent: null,
      playerHp: 100,
      playerMaxHp: 100,
      opponentHp: 100,
      rounds: [],
      currentRound: 0,
      timer: 20,
      baseTime: 20,
      result: null,
      todayDuels: 0,
      lastDuelDate: '',
      specialReady: false,
      isTraining: false,
      rageStreak: 0,
      rageTicks: 0,
      healsUsed: 0,
      consecutiveDefends: 0,
    },
    dailyRewards: DAILY_REWARDS.map((r) => ({ ...r })),
    lastRewardDate: '',
    trainingState: {
      todayCount: 0,
      lastResetDate: getTodayDateString(),
    },
    guildState: {
      guilds: INITIAL_GUILDS.map((g) => ({ ...g, memberNames: [...g.memberNames], pendingRequests: [], pendingChefTransfer: null, pendingChefTransferDate: null, guildMissions: [], guildMissionsDate: '' })),
      myGuildId: null,
    },
    duelHistory: [],
    badges: getAdminBadges().map((b) => ({ ...b, unlocked: false, unlockedAt: null })),
    friends: ['Emma Martin', 'Thomas Bernard', 'Léa Dubois'],
  };
}

export const INITIAL_GUILDS = MOCK_GUILDS;

export function processDailyReset(state: GameAppState): GameAppState {
  const today = getTodayDateString();

  if (state.quizState.lastResetDate !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yyyy = yesterday.getFullYear();
    const mm = String(yesterday.getMonth() + 1).padStart(2, '0');
    const dd = String(yesterday.getDate()).padStart(2, '0');
    const yesterdayStr = `${yyyy}-${mm}-${dd}`;

    const shieldActive = state.userData.shieldUntil && new Date(state.userData.shieldUntil) > new Date();

    const streakKept =
      state.userData.lastLoginDate === yesterdayStr ||
      state.userData.lastLoginDate === today ||
      (shieldActive && state.userData.streak > 0);

    const newStreak = streakKept ? state.userData.streak + 1 : 1;
    const streakBonus = newStreak >= 7 ? 50 : newStreak >= 3 ? 20 : 10;
    const rewardDay = ((newStreak - 1) % 7) + 1;

    const streakTaxed = applyGuildTax(state, streakBonus);

    return {
      ...state,
      userData: {
        ...state.userData,
        streak: newStreak,
        lastLoginDate: today,
        coins: state.userData.coins + streakTaxed.coins,
      },
      guildState: {
        ...streakTaxed.guildState,
        guilds: streakTaxed.guildState.guilds.map((g) => {
          if (g.guildMissionsDate === today) return g;
          return { ...g, guildMissions: generateGuildMissions(today), guildMissionsDate: today };
        }),
      },
      missions: INITIAL_MISSIONS.map((m) => {
        if (m.id === 'login') return { ...m, completed: true };
        if (m.id === 'streak' && newStreak >= 2) return { ...m, completed: true };
        return { ...m, completed: false };
      }),
      quizState: {
        ...state.quizState,
        todayQuizCount: 0,
        lastResetDate: today,
        lockedQuizzes: {},
      },
      duelState: {
        ...state.duelState,
        todayDuels: 0,
        lastDuelDate: today,
      },
      dailyRewards: DAILY_REWARDS.map((r) => ({
        ...r,
        claimed: r.day === rewardDay ? false : r.claimed,
      })),
      lastRewardDate: today,
      trainingState: {
        todayCount: 0,
        lastResetDate: today,
      },
    };
  }

  if (!state.userData.lastLoginDate) {
    return {
      ...state,
      userData: {
        ...state.userData,
        lastLoginDate: today,
        streak: 1,
      },
      missions: state.missions.map((m) => {
        if (m.id === 'login') return { ...m, completed: true };
        return m;
      }),
    };
  }

  return state;
}

export function canTakeQuiz(quizState: QuizState, chapterId: number): {
  allowed: boolean;
  reason?: string;
} {
  if (quizState.todayQuizCount >= 5) {
    return { allowed: false, reason: 'Limite de 5 quiz/jour atteinte ! Reviens demain.' };
  }

  if (quizState.lockedQuizzes[chapterId]) {
    return { allowed: false, reason: 'Quiz verrouillé 24h. Réessaie demain !' };
  }

  const attempt = quizState.attempts.find((a) => a.chapterId === chapterId);
  if (attempt && attempt.status === 'mastered') {
    return { allowed: false, reason: 'Tu as déjà maîtrisé ce quiz ! ⭐' };
  }

  return { allowed: true };
}

export function processQuizResult(
  state: GameAppState,
  chapterId: number,
  score: number,
  totalQuestions: number
): GameAppState {
  const percentage = (score / totalQuestions) * 100;
  const today = getTodayDateString();

  let status: QuizAttempt['status'];
  let xpReward: number;
  let coinReward: number;

  if (percentage === 100) {
    status = 'mastered';
    xpReward = 100;
    coinReward = 20;
  } else if (percentage >= 80) {
    status = 'passed';
    xpReward = 50;
    coinReward = 20;
  } else {
    status = 'in_progress';
    xpReward = 50;
    coinReward = 20;
  }

  const prevAttempt = state.quizState.attempts.find(
    (a) => a.chapterId === chapterId
  );

  if (prevAttempt && prevAttempt.status === 'passed' && status === 'mastered') {
    xpReward = 50;
    coinReward = 0;
  }

  const newAttempt: QuizAttempt = {
    chapterId,
    score,
    totalQuestions,
    completedAt: new Date().toISOString(),
    status,
  };

  let newAttempts: QuizAttempt[];
  if (prevAttempt) {
    newAttempts = state.quizState.attempts.map((a) =>
      a.chapterId === chapterId ? newAttempt : a
    );
  } else {
    newAttempts = [...state.quizState.attempts, newAttempt];
  }

  const newLockedQuizzes = { ...state.quizState.lockedQuizzes };
  if (percentage < 100) {
    newLockedQuizzes[chapterId] = today;
  }

  const newMissions = [...state.missions];
  const quizMission = newMissions.find((m) => m.id === 'quiz');
  if (quizMission && !quizMission.completed) {
    quizMission.completed = true;
  }
  if (percentage === 100) {
    const perfectMission = newMissions.find((m) => m.id === 'perfect');
    if (perfectMission && !perfectMission.completed) {
      perfectMission.completed = true;
    }
  }

  const progress = computeGradeProgress(state.userData.totalXP);
  const prevLevel = progress.level;

  const coinTaxed = applyGuildTax(state, coinReward);

  const newState = {
    ...state,
    userData: {
      ...state.userData,
      totalXP: state.userData.totalXP + xpReward,
      coins: state.userData.coins + coinTaxed.coins,
    },
    guildState: coinTaxed.guildState,
    missions: newMissions,
    quizState: {
      ...state.quizState,
      attempts: newAttempts,
      todayQuizCount:
        state.quizState.lastResetDate === today
          ? state.quizState.todayQuizCount + 1
          : 1,
      lockedQuizzes: newLockedQuizzes,
    },
  };

  const newProgress = computeGradeProgress(newState.userData.totalXP);
  const newLevel = newProgress.level;
  const levelsGained = Math.max(0, newLevel - prevLevel);

  return {
    ...newState,
    userData: {
      ...newState.userData,
      statPoints: newState.userData.statPoints + levelsGained,
    },
    guildState: addGuildXP(newState, xpReward),
  } as GameAppState;
}

export function getDefaultDuelState(): DuelState {
  return {
    phase: 'menu',
    opponent: null,
    playerHp: 100,
    playerMaxHp: 100,
    opponentHp: 100,
    rounds: [],
    currentRound: 0,
    timer: 20,
    baseTime: 20,
    result: null,
    todayDuels: 0,
    lastDuelDate: getTodayDateString(),
    specialReady: false,
    isTraining: false,
    rageStreak: 0,
    rageTicks: 0,
    healsUsed: 0,
    consecutiveDefends: 0,
  };
}

export function processDuelResult(
  state: GameAppState,
  result: 'win' | 'lose',
  isTraining: boolean
): GameAppState {
  if (isTraining) {
    return {
      ...state,
      duelState: { ...state.duelState, phase: 'result', result },
    };
  }

  const xpReward = result === 'win' ? 60 : 10;
  const coinReward = result === 'win' ? 30 : 5;

  const duelTaxed = applyGuildTax(state, coinReward);

  const newState: GameAppState = {
    ...state,
    userData: {
      ...state.userData,
      totalXP: state.userData.totalXP + xpReward,
      coins: state.userData.coins + duelTaxed.coins,
    },
    guildState: duelTaxed.guildState,
    duelState: {
      ...state.duelState,
      phase: 'result' as const,
      result,
      todayDuels: state.duelState.todayDuels + 1,
    },
    missions: state.missions.map((m) =>
      m.id === 'duel' && result === 'win' ? { ...m, completed: true } : m
    ),
    duelHistory: [
      {
        id: state.duelHistory.length + 1,
        opponent: state.duelState.opponent?.name || '???',
        opponentAvatar: state.duelState.opponent?.avatar || '❓',
        result,
        date: new Date().toISOString(),
        xpGained: xpReward,
        coinsGained: duelTaxed.coins,
      },
      ...state.duelHistory,
    ].slice(0, 20),
  };

  return checkLevelUp({
    ...newState,
    guildState: addGuildXP(newState, xpReward),
  }, state.userData.totalXP);
}

export function claimDailyReward(
  state: GameAppState,
  day: number
): GameAppState {
  const rewards = state.dailyRewards.map((r) =>
    r.day === day ? { ...r, claimed: true } : r
  );
  const reward = state.dailyRewards.find((r) => r.day === day);
  if (!reward || reward.claimed) return state;

  const prevXP = state.userData.totalXP;
  const dailyTaxed = applyGuildTax(state, reward.coins);

  return checkLevelUp({
    ...state,
    userData: {
      ...state.userData,
      totalXP: state.userData.totalXP + reward.xp,
      coins: state.userData.coins + dailyTaxed.coins,
    },
    guildState: dailyTaxed.guildState,
    dailyRewards: rewards,
  }, prevXP);
}

export function checkLevelUp(newState: GameAppState, prevXP: number): GameAppState {
  const prevProgress = computeGradeProgress(prevXP);
  const newProgress = computeGradeProgress(newState.userData.totalXP);

  const prevGlobalLevel = prevProgress.level;
  const newGlobalLevel = newProgress.level;

  if (newGlobalLevel > prevGlobalLevel) {
    const levelsGained = newGlobalLevel - prevGlobalLevel;
    return {
      ...newState,
      userData: {
        ...newState.userData,
        statPoints: newState.userData.statPoints + levelsGained,
      },
    };
  }

  return newState as GameAppState;
}

export function allocateStat(
  state: GameAppState,
  stat: 'hp' | 'force'
): GameAppState {
  if (state.userData.statPoints <= 0) return state;

  if (stat === 'hp') {
    return {
      ...state,
      userData: {
        ...state.userData,
        maxHp: state.userData.maxHp + 15,
        hp: state.userData.hp + 15,
        statPoints: state.userData.statPoints - 1,
      },
    };
  }

  return {
    ...state,
    userData: {
      ...state.userData,
      force: state.userData.force + 3,
      statPoints: state.userData.statPoints - 1,
    },
  };
}

export function checkBadges(state: GameAppState): GameAppState {
  const today = new Date().toISOString();
  const level = Math.floor(state.userData.totalXP / 150) + 1;
  const duelCount = state.duelHistory.length;
  const trainingCount = state.trainingState.todayCount;

  const checks: Record<string, boolean> = {
    first_login: true,
    first_training: trainingCount >= 1 || state.missions.find((m) => m.id === 'training')?.completed || false,
    first_duel: duelCount >= 1,
    first_win: state.duelHistory.some((d) => d.result === 'win'),
    streak_3: state.userData.streak >= 3,
    streak_7: state.userData.streak >= 7,
    level_10: level >= 10,
    level_50: level >= 50,
    level_100: level >= 100,
    rich: state.userData.coins >= 1000,
    guild_join: state.guildState.myGuildId !== null,
  };

  let badges = [...state.badges];
  let changed = false;
  for (const badge of badges) {
    if (!badge.unlocked && checks[badge.id]) {
      badge.unlocked = true;
      badge.unlockedAt = today;
      changed = true;
    }
  }

  if (!changed) return state;
  return { ...state, badges };
}
