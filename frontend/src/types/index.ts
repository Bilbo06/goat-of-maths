export interface UserData {
  name: string;
  hp: number;
  maxHp: number;
  force: number;
  totalXP: number;
  coins: number;
  streak: number;
  lastLoginDate: string;
  consultedChapters: number[];
  purchasedItems: number[];
  statPoints: number;
  backpack: BackpackItem[];
  theme: string;
  boostXPUntil: string;
  avatar: string;
  equippedDecoration: number | null;
  shieldUntil: string;
  timeBonus: boolean;
}

export interface Grade {
  name: string;
  emoji: string;
  levelReq: number;
}

export interface GradeProgress {
  gradeIndex: number;
  level: number;
  xpInCurrentLevel: number;
  xpForNextLevel: number;
}

export interface Chapter {
  id: number;
  title: string;
  icon: string;
  difficulty: 'Facile' | 'Moyen' | 'Difficile';
  xp: number;
  coins: number;
}

export interface Mission {
  id: string;
  title: string;
  desc: string;
  xp: number;
  coins: number;
  completed: boolean;
}

export interface ShopItem {
  id: number;
  name: string;
  icon: string;
  type: 'avatar' | 'boost' | 'decoration' | 'consumable' | 'theme';
  price: number;
  description: string;
  themeId?: string;
}

export interface ChatMessage {
  id: number;
  username: string;
  message: string;
  timestamp: string;
}

export interface PrivateMessage {
  id: number;
  from: string;
  to: string;
  message: string;
  timestamp: string;
}

export interface Friend {
  id: number;
  name: string;
  level: number;
  grade: string;
  online: boolean;
}

export interface GuildMission {
  id: string;
  label: string;
  icon: string;
  xpReward: number;
  coinsReward: number;
  completedBy: string[];
  rewarded: boolean;
}

export interface Guild {
  id: number;
  name: string;
  emoji: string;
  memberNames: string[];
  maxMembers: number;
  level: number;
  xp: number;
  chef: string;
  chefAdjoint: string | null;
  treasury: number;
  entryFee: number;
  payoutPercentage: number;
  pendingRequests: string[];
  lastPayoutDate: string;
  pendingChefTransfer: string | null;
  pendingChefTransferDate: string | null;
  guildMissions: GuildMission[];
  guildMissionsDate: string;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  level: number;
  grade: string;
  xp: number;
}

export type QuizQuestionType = 'mcq' | 'tf';

export interface QuizQuestion {
  id: number;
  chapterId: number;
  question: string;
  type: QuizQuestionType;
  options: string[];
  correctAnswer: number;
  timeSeconds: number;
  explanation?: string;
}

export type QuizStatus = 'available' | 'in_progress' | 'passed' | 'mastered';

export interface QuizAttempt {
  chapterId: number;
  score: number;
  totalQuestions: number;
  completedAt: string;
  status: QuizStatus;
}

export interface QuizState {
  attempts: QuizAttempt[];
  todayQuizCount: number;
  lastResetDate: string;
  lockedQuizzes: Record<number, string>;
}

export type DuelAction = 'attack' | 'defend' | 'heal' | 'special';

export interface DuelOpponent {
  id: number;
  name: string;
  avatar: string;
  level: number;
  grade: string;
  hp: number;
  maxHp: number;
}

export interface DuelQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  unlocked: boolean;
  unlockedAt: string | null;
}

export interface DuelHistoryEntry {
  id: number;
  opponent: string;
  opponentAvatar: string;
  result: 'win' | 'lose';
  date: string;
  xpGained: number;
  coinsGained: number;
}

export type DuelPhase = 'menu' | 'playing' | 'result';

export interface DuelRound {
  question: DuelQuestion;
  playerAnswer: number | null;
  opponentAnswer: number | null;
  playerCorrect: boolean;
  opponentCorrect: boolean;
  playerAction: DuelAction | null;
  opponentAction: DuelAction | null;
  playerDmgDealt: number;
  opponentDmgDealt: number;
}

export interface DuelState {
  phase: DuelPhase;
  opponent: DuelOpponent | null;
  playerHp: number;
  playerMaxHp: number;
  opponentHp: number;
  rounds: DuelRound[];
  currentRound: number;
  timer: number;
  baseTime: number;
  result: 'win' | 'lose' | null;
  todayDuels: number;
  lastDuelDate: string;
  specialReady: boolean;
  isTraining: boolean;
  rageStreak: number;
  rageTicks: number;
  healsUsed: number;
  consecutiveDefends: number;
}

export interface BackpackItem {
  id: string;
  name: string;
  icon: string;
  type: 'consumable' | 'theme' | 'boost' | 'avatar';
  quantity: number;
  themeId?: string;
}

export interface ThemeDef {
  id: string;
  name: string;
  icon: string;
  primary: string;
  secondary: string;
  accent: string;
}

export interface DailyReward {
  day: number;
  coins: number;
  xp: number;
  icon: string;
  claimed: boolean;
}

export interface TrainingState {
  todayCount: number;
  lastResetDate: string;
}

export interface GuildState {
  guilds: Guild[];
  myGuildId: number | null;
}

export interface GameAppState {
  userData: UserData;
  missions: Mission[];
  quizState: QuizState;
  chatMessages: ChatMessage[];
  privateMessages: PrivateMessage[];
  darkMode: boolean;
  duelState: DuelState;
  dailyRewards: DailyReward[];
  lastRewardDate: string;
  trainingState: TrainingState;
  guildState: GuildState;
  duelHistory: DuelHistoryEntry[];
  badges: Badge[];
  friends: string[];
}
