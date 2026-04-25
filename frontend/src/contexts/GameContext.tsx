/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from 'react';
import type { GameAppState, ChatMessage, Chapter, DuelQuestion, DuelAction, PrivateMessage } from '../types';
import { computeGradeProgress } from '../utils/grades';
import { checkBadges } from '../utils/storage';
import { useAuth } from './AuthContext';
import {
  loadGameState,
  saveGameState,
  getDefaultGameState,
  processDailyReset,
  canTakeQuiz as checkCanTakeQuiz,
  processQuizResult,
  processDuelResult,
  claimDailyReward as claimReward,
  allocateStat as allocStat,
  checkLevelUp,
  applyGuildTax,
} from '../utils/storage';
import { DUEL_OPPONENTS } from '../data/constants';
import { getAdminQuestions, getAdminShopItems, getAdminQuestionsAsync, getAdminShopItemsAsync } from '../utils/adminStorage';
import { getTodayDateString } from '../utils/storage';
import { api } from '../utils/api';

interface GameContextType {
  state: GameAppState;
  gradeProgress: ReturnType<typeof computeGradeProgress>;
  toggleDarkMode: () => void;
  consultChapter: (chapter: Chapter) => void;
  completeMission: (missionId: string) => void;
  buyItem: (itemId: number, price: number) => void;
  sendMessage: (message: string) => void;
  canTakeQuiz: (chapterId: number) => { allowed: boolean; reason?: string };
  submitQuiz: (chapterId: number, score: number, totalQuestions: number) => void;
  getQuizStatus: (chapterId: number) => string;
  getTodayQuizCount: () => number;
  startDuel: (isTraining: boolean) => void;
  answerDuelQuestion: (answerIdx: number, action: DuelAction) => void;
  duelTimerTick: () => void;
  resetDuel: () => void;
  claimDailyReward: (day: number) => void;
  allocateStat: (stat: 'hp' | 'force') => void;
  addTrainingXP: (xp: number, coins: number) => void;
  failTraining: () => void;
  useItem: (itemId: string) => void;
  getBackpackCount: (itemId: string) => number;
  consumeBandage: () => void;
  applyTheme: (themeId: string) => void;
  applyAvatar: (avatar: string) => void;
  applyDecoration: (itemId: number | null) => void;
  consumeSecondSouffle: () => void;
  createGuild: (name: string, emoji: string) => void;
  joinGuild: (guildId: number) => void;
  leaveGuild: () => void;
  setGuildEntryFee: (fee: number) => void;
  setGuildChefAdjoint: (name: string) => void;
  acceptGuildRequest: (guildId: number, name: string) => void;
  rejectGuildRequest: (guildId: number, name: string) => void;
  setGuildPayoutPercentage: (pct: number) => void;
  payoutGuildTreasury: () => void;
  deleteGuild: () => void;
  transferChef: (newChef: string) => void;
  cancelTransfer: () => void;
  kickMember: (name: string) => void;
  completeGuildMission: (missionId: string) => void;
  claimGuildMissionRewards: (missionId: string) => void;
  sendPrivateMessage: (to: string, message: string) => void;
  addFriend: (name: string) => void;
  removeFriend: (name: string) => void;
}

const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const { username, displayName } = useAuth();
  const [state, setState] = useState<GameAppState>(() => {
    const saved = loadGameState(username, displayName);
    const initial = saved || getDefaultGameState(displayName);
    return processDailyReset(initial);
  });

  const [apiReady, setApiReady] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!username) return;
    let cancelled = false;
    (async () => {
      try {
        const apiState = await api.state.get();
        await Promise.all([getAdminQuestionsAsync(), getAdminShopItemsAsync()]);
        if (cancelled) return;
        if (apiState && apiState.userData) {
          const defaults = getDefaultGameState(displayName);
          const merged: GameAppState = {
            ...defaults,
            ...apiState as Partial<GameAppState>,
            userData: { ...defaults.userData, ...(apiState.userData as Record<string, unknown>) },
            duelState: { ...defaults.duelState, ...((apiState.duelState as Record<string, unknown>) || {}) },
            trainingState: { ...defaults.trainingState, ...((apiState.trainingState as Record<string, unknown>) || {}) },
            guildState: (apiState.guildState as GameAppState['guildState']) || defaults.guildState,
            badges: (apiState.badges as GameAppState['badges']) || defaults.badges,
          } as GameAppState;
          setState(processDailyReset(merged));
        }
        setApiReady(true);
      } catch {
        setApiReady(true);
      }
    })();
    return () => { cancelled = true; };
  }, [username, displayName]);

  const gradeProgress = computeGradeProgress(state.userData.totalXP);

  useEffect(() => {
    const checked = checkBadges(state);
    if (checked !== state) {
      setState(checked);
    }
    saveGameState(state, username);

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    if (apiReady) {
      saveTimerRef.current = setTimeout(() => {
        api.state.save(state as unknown as Record<string, unknown>).catch(() => {});
      }, 1000);
    }
  }, [state, username, apiReady]);

  useEffect(() => {
    if (!apiReady) return;
    const interval = setInterval(async () => {
      try {
        const [chatMsgs, apiState] = await Promise.all([
          api.chat.get(),
          api.state.get(),
        ]);
        if (chatMsgs && chatMsgs.length > 0) {
          setState((prev) => {
            const maxId = Math.max(...prev.chatMessages.map((m) => m.id), 0);
            const newMsgs = chatMsgs.filter((m) => m.id > maxId);
            if (newMsgs.length === 0) return prev;
            return { ...prev, chatMessages: [...prev.chatMessages, ...newMsgs] };
          });
        }
        if (apiState?.privateMessages) {
          const pms = apiState.privateMessages as PrivateMessage[];
          setState((prev) => {
            const maxId = Math.max(...prev.privateMessages.map((m) => m.id), 0);
            const newMsgs = pms.filter((m) => m.id > maxId);
            if (newMsgs.length === 0) return prev;
            return { ...prev, privateMessages: [...prev.privateMessages, ...newMsgs] };
          });
        }
      } catch {}
    }, 3000);
    return () => clearInterval(interval);
  }, [apiReady]);

  useEffect(() => {
    const now = new Date();
    let hasPending = false;
    for (const g of state.guildState.guilds) {
      if (g.pendingChefTransfer && g.pendingChefTransferDate && new Date(g.pendingChefTransferDate) <= now) {
        hasPending = true;
        break;
      }
    }
    if (!hasPending) return;
    setState((prev) => {
      const guilds = prev.guildState.guilds.map((g) => {
        if (!g.pendingChefTransfer || !g.pendingChefTransferDate) return g;
        if (new Date(g.pendingChefTransferDate) > new Date()) return g;
        const newChef = g.pendingChefTransfer;
        return {
          ...g,
          chef: newChef,
          chefAdjoint: g.chefAdjoint === newChef ? null : g.chefAdjoint,
          pendingChefTransfer: null,
          pendingChefTransferDate: null,
        };
      });
      return { ...prev, guildState: { ...prev.guildState, guilds } };
    });
  }, [state.guildState.guilds]);

  const toggleDarkMode = useCallback(() => {
    setState((prev) => ({ ...prev, darkMode: !prev.darkMode }));
  }, []);

  const consultChapter = useCallback((chapter: Chapter) => {
    setState((prev) => {
      if (prev.userData.consultedChapters.includes(chapter.id)) return prev;
      const { coins, guildState } = applyGuildTax(prev, chapter.coins);
      return {
        ...prev,
        userData: {
          ...prev.userData,
          totalXP: prev.userData.totalXP + chapter.xp,
          coins: prev.userData.coins + coins,
          consultedChapters: [...prev.userData.consultedChapters, chapter.id],
        },
        guildState,
        missions: prev.missions.map((m) =>
          m.id === 'chapter' ? { ...m, completed: true } : m
        ),
      };
    });
  }, []);

  const completeMission = useCallback((missionId: string) => {
    setState((prev) => {
      const mission = prev.missions.find((m) => m.id === missionId);
      if (!mission || mission.completed) return prev;
      const { coins, guildState } = applyGuildTax(prev, mission.coins);
      return {
        ...prev,
        userData: {
          ...prev.userData,
          totalXP: prev.userData.totalXP + mission.xp,
          coins: prev.userData.coins + coins,
        },
        guildState,
        missions: prev.missions.map((m) =>
          m.id === missionId ? { ...m, completed: true } : m
        ),
      };
    });
  }, []);

  const buyItem = useCallback((itemId: number, price: number) => {
    setState((prev) => {
      if (prev.userData.coins < price) return prev;
      const item = getAdminShopItems().find((i) => i.id === itemId);
      if (!item) return prev;

      const badges = [...prev.badges];
      const shopBadge = badges.find((b) => b.id === 'shop_first');
      if (shopBadge && !shopBadge.unlocked) {
        shopBadge.unlocked = true;
        shopBadge.unlockedAt = new Date().toISOString();
      }

      if (item.type === 'consumable') {
        const bp = [...prev.userData.backpack];
        const nameLower = item.name.toLowerCase();
        const descLower = item.description.toLowerCase();
        let bpId = 'consumable-' + item.id;
        let bpName = item.name;
        let bpIcon = item.icon;
        let qty = 1;

        if (nameLower.includes('pansement') || descLower.includes('pansement') || descLower.includes('soigner')) {
          bpId = 'bandage';
          bpName = item.name.includes('x') ? 'Pansement' : item.name;
          bpIcon = '🩹';
          const match = item.name.match(/x\s*(\d+)/i);
          if (match) qty = parseInt(match[1]);
        } else if (nameLower.includes('second souffle') || descLower.includes('erreur') || descLower.includes('souffle')) {
          bpId = 'second-souffle';
          bpName = 'Second Souffle';
          bpIcon = '🔄';
          const match = item.name.match(/x\s*(\d+)/i);
          if (match) qty = parseInt(match[1]);
        }

        const existing = bp.find((b) => b.id === bpId);
        if (existing) {
          existing.quantity += qty;
        } else {
          bp.push({ id: bpId, name: bpName, icon: bpIcon, type: 'consumable', quantity: qty });
        }
        api.shopBuy(itemId).catch(() => {});
        return {
          ...prev,
          userData: { ...prev.userData, coins: prev.userData.coins - price, backpack: bp },
          badges,
        };
      }

      if (item.type === 'boost') {
        const bp = [...prev.userData.backpack];
        let boostId = 'boost-' + item.id;
        const descLower = item.description.toLowerCase();
        if (descLower.includes('série') || descLower.includes('streak') || descLower.includes('bouclier') || descLower.includes('shield')) {
          boostId = 'boost-shield';
        } else if (descLower.includes('temps') || descLower.includes('time') || descLower.includes('seconde')) {
          boostId = 'boost-time';
        } else if (descLower.includes('xp') || descLower.includes('double') || descLower.includes('expérience')) {
          boostId = 'boost-xp';
        }
        const existing = bp.find((b) => b.id === boostId);
        if (existing) {
          existing.quantity += 1;
        } else {
          bp.push({ id: boostId, name: item.name, icon: item.icon, type: 'boost', quantity: 1 });
        }
        api.shopBuy(itemId).catch(() => {});
        return {
          ...prev,
          userData: { ...prev.userData, coins: prev.userData.coins - price, backpack: bp },
        };
      }

      if (item.type === 'theme' || item.type === 'decoration' || item.type === 'avatar') {
        if (prev.userData.purchasedItems.includes(itemId)) return prev;
        api.shopBuy(itemId).catch(() => {});
        return {
          ...prev,
          userData: { ...prev.userData, coins: prev.userData.coins - price, purchasedItems: [...prev.userData.purchasedItems, itemId] },
          badges,
        };
      }

      return prev;
    });
  }, []);

  const sendMessage = useCallback((message: string) => {
    if (!message.trim()) return;
    const msg = message.trim();
    setState((prev) => {
      const newMsg: ChatMessage = {
        id: prev.chatMessages.length + 1,
        username: prev.userData.name.split(' ')[0],
        message: msg,
        timestamp: new Date().toISOString(),
      };
      return { ...prev, chatMessages: [...prev.chatMessages, newMsg] };
    });
    api.chat.send(msg).catch(() => {});
  }, []);

  const canTakeQuizFn = useCallback(
    (chapterId: number) => checkCanTakeQuiz(state.quizState, chapterId),
    [state.quizState]
  );

  const submitQuiz = useCallback((chapterId: number, score: number, totalQuestions: number) => {
    setState((prev) => processQuizResult(prev, chapterId, score, totalQuestions));
  }, []);

  const getQuizStatus = useCallback(
    (chapterId: number): string => {
      const attempt = state.quizState.attempts.find((a) => a.chapterId === chapterId);
      if (!attempt) return 'available';
      return attempt.status;
    },
    [state.quizState.attempts]
  );

  const getTodayQuizCount = useCallback(
    () => state.quizState.todayQuizCount,
    [state.quizState.todayQuizCount]
  );

  const startDuel = useCallback((isTraining: boolean) => {
    setState((prev) => {
      const opponent = DUEL_OPPONENTS[Math.floor(Math.random() * DUEL_OPPONENTS.length)];
      const allQuestions = getAdminQuestions();
      if (allQuestions.length === 0) return prev;
      const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
      const duelQuestions: DuelQuestion[] = shuffled.map((q) => ({
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
      }));
      const duelBaseTime = prev.userData.timeBonus ? 50 : 20;

      return {
        ...prev,
        duelState: {
          ...prev.duelState,
          phase: 'playing',
          opponent: { ...opponent, hp: opponent.maxHp },
          playerHp: prev.userData.maxHp,
          playerMaxHp: prev.userData.maxHp,
          opponentHp: opponent.maxHp,
          rounds: [],
          currentRound: 0,
          timer: duelBaseTime,
          baseTime: duelBaseTime,
          result: null,
          specialReady: false,
          isTraining,
          rageStreak: 0,
          rageTicks: 0,
          healsUsed: 0,
          consecutiveDefends: 0,
          _questions: duelQuestions,
          _playerForce: prev.userData.force,
        } as typeof prev.duelState & { _questions?: DuelQuestion[]; _playerForce?: number },
      };
    });
  }, []);

  const answerDuelQuestion = useCallback((answerIdx: number, action: DuelAction) => {
    setState((prev) => {
      const ds = prev.duelState;
      const extended = ds as typeof ds & { _questions?: DuelQuestion[]; _playerForce?: number };
      const questions = extended._questions || [];
      const playerForce = extended._playerForce || 10;
      const q = questions[ds.currentRound % questions.length];
      if (!q) return prev;

      const effectiveAction: DuelAction = action === 'defend' && ds.consecutiveDefends >= 3 ? 'attack' : action;

      let forceMultiplier = playerForce / 10;
      let rageStreak = ds.rageStreak;
      let rageTicks = ds.rageTicks;
      let consecutiveDefends = ds.consecutiveDefends;

      if (rageTicks > 0 && effectiveAction !== 'defend') {
        forceMultiplier *= 2;
        rageTicks -= 1;
      }

      const isCritical = ds.playerHp < ds.playerMaxHp * 0.15;

      const playerCorrect = answerIdx === q.correctAnswer;
      const opponentCorrect = Math.random() > 0.35;
      let opponentConsecDefends = 0;
      for (let i = ds.rounds.length - 1; i >= 0; i--) {
        if (ds.rounds[i].opponentAction === 'defend') opponentConsecDefends++;
        else break;
      }
      let opponentAction: DuelAction;
      if (opponentConsecDefends >= 3) {
        const choices: DuelAction[] = ['attack', 'heal'];
        opponentAction = choices[Math.floor(Math.random() * choices.length)];
      } else {
        opponentAction = ['attack', 'defend', 'heal'][Math.floor(Math.random() * 3)] as DuelAction;
      }

      let playerDmgDealt = 0;
      let opponentDmgDealt = 0;
      let newPlayerHp = ds.playerHp;
      let newOpponentHp = ds.opponentHp;
      let specialReady = ds.specialReady;

      if (playerCorrect) {
        rageStreak += 1;

        if (isCritical && rageStreak >= 3 && rageTicks === 0) {
          rageTicks = 3;
          rageStreak = 0;
          forceMultiplier *= 2;
          rageTicks -= 1;
        }

        if (effectiveAction === 'defend') {
          consecutiveDefends += 1;
        } else {
          consecutiveDefends = 0;
        }

        if (effectiveAction === 'attack') {
          const baseDmg = 20;
          playerDmgDealt = opponentAction === 'defend' ? Math.round(baseDmg * forceMultiplier * 0.15) : Math.round(baseDmg * forceMultiplier);
        } else if (effectiveAction === 'defend') {
          const baseDmg = 12;
          playerDmgDealt = opponentAction === 'defend' ? Math.round(baseDmg * forceMultiplier * 0.15) : Math.round(baseDmg * forceMultiplier);
        } else if (effectiveAction === 'heal') {
          const bp = [...prev.userData.backpack];
          const bandage = bp.find((b) => b.id === 'bandage');
          if (bandage && bandage.quantity > 0 && ds.healsUsed < 3) {
            const healAmount = Math.round(10 + playerForce * 0.5);
            newPlayerHp = Math.min(ds.playerMaxHp, newPlayerHp + healAmount);
            bandage.quantity -= 1;
            if (bandage.quantity <= 0) {
              const idx = bp.indexOf(bandage);
              bp.splice(idx, 1);
            }
            prev = { ...prev, userData: { ...prev.userData, backpack: bp } };
          }
          playerDmgDealt = 0;
        } else if (effectiveAction === 'special' && specialReady) {
          const baseDmg = 35;
          playerDmgDealt = opponentAction === 'defend' ? Math.round(baseDmg * forceMultiplier * 0.15) : Math.round(baseDmg * forceMultiplier);
          specialReady = false;
        }
        if (effectiveAction !== 'defend' || opponentAction === 'attack') {
          specialReady = true;
        }
      } else {
        rageStreak = 0;
        consecutiveDefends = 0;
        playerDmgDealt = 0;
        opponentDmgDealt = Math.round(10 * (1 + (ds.opponent?.level || 1) * 0.05));
      }

      if (opponentCorrect && opponentAction === 'attack') {
        const oppBaseDmg = 20;
        const oppForceMultiplier = 1 + (ds.opponent?.level || 1) * 0.05;
        const oppFullDmg = Math.round(oppBaseDmg * oppForceMultiplier);
        if (!playerCorrect) {
          opponentDmgDealt = effectiveAction === 'defend' ? Math.round(oppFullDmg * 0.15) : oppFullDmg;
        } else {
          opponentDmgDealt = effectiveAction === 'defend' ? Math.round(oppFullDmg * 0.15) : 0;
        }
      } else if (opponentCorrect && opponentAction === 'defend') {
        const oppForceMultiplier = 1 + (ds.opponent?.level || 1) * 0.05;
        const oppBaseDmg = 12;
        const oppFullDmg = Math.round(oppBaseDmg * oppForceMultiplier);
        if (!playerCorrect) {
          opponentDmgDealt = effectiveAction === 'defend' ? Math.round(oppFullDmg * 0.15) : oppFullDmg;
        } else {
          opponentDmgDealt = effectiveAction === 'defend' ? Math.round(oppFullDmg * 0.15) : 0;
        }
      } else if (opponentCorrect && opponentAction === 'heal') {
        newOpponentHp = Math.min(ds.opponent?.maxHp || 100, newOpponentHp + 15);
      }

      newOpponentHp = Math.max(0, newOpponentHp - playerDmgDealt);
      newPlayerHp = Math.max(0, newPlayerHp - opponentDmgDealt);

      const round = {
        question: q,
        playerAnswer: answerIdx,
        opponentAnswer: opponentCorrect ? q.correctAnswer : (q.correctAnswer + 1) % q.options.length,
        playerCorrect,
        opponentCorrect,
        playerAction: effectiveAction,
        opponentAction,
        playerDmgDealt,
        opponentDmgDealt,
      };

      const newRounds = [...ds.rounds, round];
      const nextRound = ds.currentRound + 1;
      const duelOver = newPlayerHp <= 0 || newOpponentHp <= 0;

      if (duelOver) {
        const result: 'win' | 'lose' =
          newOpponentHp <= 0 ? 'win' : 'lose';
        return processDuelResult(
          { ...prev, duelState: { ...ds, playerHp: newPlayerHp, opponentHp: newOpponentHp, rounds: newRounds, currentRound: nextRound } },
          result,
          ds.isTraining
        );
      }

      return {
        ...prev,
        duelState: {
          ...ds,
          playerHp: newPlayerHp,
          opponentHp: newOpponentHp,
          rounds: newRounds,
          currentRound: nextRound,
          timer: ds.baseTime || 20,
          specialReady,
          rageStreak,
          rageTicks,
          healsUsed: effectiveAction === 'heal' && playerCorrect ? ds.healsUsed + 1 : ds.healsUsed,
          consecutiveDefends,
        },
      };
    });
  }, []);

  const duelTimerTick = useCallback(() => {
    setState((prev) => {
      const ds = prev.duelState;
      if (ds.phase !== 'playing' || ds.timer <= 0) return prev;
      const newTimer = ds.timer - 1;
      if (newTimer <= 0) {
        const questions = (ds as typeof ds & { _questions?: DuelQuestion[] })._questions || [];
      const q = questions[ds.currentRound % questions.length];
        if (!q) return { ...prev, duelState: { ...ds, timer: 0 } };
        const round = {
          question: q,
          playerAnswer: null,
          opponentAnswer: Math.random() > 0.35 ? q.correctAnswer : (q.correctAnswer + 1) % q.options.length,
          playerCorrect: false,
          opponentCorrect: Math.random() > 0.35,
          playerAction: null,
          opponentAction: 'attack' as DuelAction,
          playerDmgDealt: 0,
          opponentDmgDealt: 15,
        };
        const newRounds = [...ds.rounds, round];
        const newPlayerHp = Math.max(0, ds.playerHp - 15);
        const nextRound = ds.currentRound + 1;
        const duelOver = newPlayerHp <= 0;

        if (duelOver) {
          const result: 'lose' = 'lose';
          return processDuelResult(
            { ...prev, duelState: { ...ds, playerHp: newPlayerHp, rounds: newRounds, currentRound: nextRound, timer: 0 } },
            result,
            ds.isTraining
          );
        }

        return {
          ...prev,
          duelState: { ...ds, playerHp: newPlayerHp, rounds: newRounds, currentRound: nextRound, timer: ds.baseTime || 20 },
        };
      }
      return { ...prev, duelState: { ...ds, timer: newTimer } };
    });
  }, []);

  const resetDuel = useCallback(() => {
    setState((prev) => ({
      ...prev,
      duelState: {
        ...prev.duelState,
        phase: 'menu',
        opponent: null,
        playerHp: prev.userData.maxHp,
        playerMaxHp: prev.userData.maxHp,
        opponentHp: 100,
        rounds: [],
        currentRound: 0,
        timer: 20,
        baseTime: 20,
        result: null,
        specialReady: false,
        isTraining: false,
        rageStreak: 0,
        rageTicks: 0,
        healsUsed: 0,
        consecutiveDefends: 0,
      },
    }));
  }, []);

  const claimDailyRewardFn = useCallback((day: number) => {
    setState((prev) => claimReward(prev, day));
  }, []);

  const allocateStatFn = useCallback((stat: 'hp' | 'force') => {
    setState((prev) => allocStat(prev, stat));
  }, []);

  const addTrainingXP = useCallback((xp: number, coins: number) => {
    setState((prev) => {
      if (prev.trainingState.todayCount >= 5) return prev;
      const prevXP = prev.userData.totalXP;
      const boostActive = prev.userData.boostXPUntil && new Date(prev.userData.boostXPUntil) > new Date();
      const finalXP = boostActive ? xp * 2 : xp;
      const taxed = applyGuildTax(prev, coins);
      const newState: typeof prev = {
        ...prev,
        userData: {
          ...prev.userData,
          totalXP: prev.userData.totalXP + finalXP,
          coins: prev.userData.coins + taxed.coins,
        },
        guildState: {
          ...taxed.guildState,
          guilds: taxed.guildState.guilds.map((g) =>
            g.id === prev.guildState.myGuildId ? { ...g, xp: g.xp + finalXP } : g
          ),
        },
        trainingState: {
          ...prev.trainingState,
          todayCount: prev.trainingState.todayCount + 1,
        },
        missions: prev.missions.map((m) =>
          m.id === 'training' ? { ...m, completed: true } : m
        ),
      };
      return checkLevelUp(newState, prevXP);
    });
  }, []);

  const failTraining = useCallback(() => {
    setState((prev) => ({
      ...prev,
      trainingState: {
        ...prev.trainingState,
        todayCount: prev.trainingState.todayCount + 1,
      },
    }));
  }, []);

  const useItem = useCallback((itemId: string) => {
    setState((prev) => {
      const bp = [...prev.userData.backpack];
      const item = bp.find((b) => b.id === itemId);
      if (!item || item.quantity <= 0) return prev;

      if (item.type === 'theme' && item.themeId) {
        return {
          ...prev,
          userData: { ...prev.userData, theme: item.themeId },
        };
      }

      if (item.type === 'boost' && itemId === 'boost-xp') {
        const until = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
        item.quantity -= 1;
        if (item.quantity <= 0) {
          const idx = bp.indexOf(item);
          bp.splice(idx, 1);
        }
        return {
          ...prev,
          userData: { ...prev.userData, backpack: bp, boostXPUntil: until },
        };
      }

      if (item.type === 'boost' && itemId === 'boost-shield') {
        const until = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
        item.quantity -= 1;
        if (item.quantity <= 0) {
          const idx = bp.indexOf(item);
          bp.splice(idx, 1);
        }
        return {
          ...prev,
          userData: { ...prev.userData, backpack: bp, shieldUntil: until },
        };
      }

      if (item.type === 'boost' && itemId === 'boost-time') {
        item.quantity -= 1;
        if (item.quantity <= 0) {
          const idx = bp.indexOf(item);
          bp.splice(idx, 1);
        }
        return {
          ...prev,
          userData: { ...prev.userData, backpack: bp, timeBonus: true },
        };
      }

      return prev;
    });
  }, []);

  const getBackpackCount = useCallback((itemId: string) => {
    const item = state.userData.backpack.find((b) => b.id === itemId);
    return item?.quantity || 0;
  }, [state.userData.backpack]);

  const consumeBandage = useCallback(() => {
    setState((prev) => {
      const bp = [...prev.userData.backpack];
      const item = bp.find((b) => b.id === 'bandage');
      if (!item || item.quantity <= 0) return prev;
      item.quantity -= 1;
      if (item.quantity <= 0) {
        const idx = bp.indexOf(item);
        bp.splice(idx, 1);
      }
      return {
        ...prev,
        userData: { ...prev.userData, backpack: bp },
      };
    });
  }, []);

  const applyTheme = useCallback((themeId: string) => {
    setState((prev) => ({
      ...prev,
      userData: { ...prev.userData, theme: themeId },
    }));
  }, []);

  const applyAvatar = useCallback((avatar: string) => {
    setState((prev) => ({
      ...prev,
      userData: { ...prev.userData, avatar },
    }));
  }, []);

  const applyDecoration = useCallback((itemId: number | null) => {
    setState((prev) => ({
      ...prev,
      userData: { ...prev.userData, equippedDecoration: itemId },
    }));
  }, []);

  const consumeSecondSouffle = useCallback(() => {
    setState((prev) => {
      const bp = [...prev.userData.backpack];
      const item = bp.find((b) => b.id === 'second-souffle');
      if (!item || item.quantity <= 0) return prev;
      item.quantity -= 1;
      if (item.quantity <= 0) {
        const idx = bp.indexOf(item);
        bp.splice(idx, 1);
      }
      return {
        ...prev,
        userData: { ...prev.userData, backpack: bp },
      };
    });
  }, []);

  const createGuild = useCallback((name: string, emoji: string) => {
    setState((prev) => {
      if (prev.userData.coins < 10000 || prev.guildState.myGuildId !== null) return prev;
      const newId = Math.max(...prev.guildState.guilds.map((g) => g.id), 0) + 1;
      const newGuild = {
        id: newId,
        name,
        emoji,
        memberNames: [prev.userData.name],
        maxMembers: 10,
        level: 1,
        xp: 0,
        chef: prev.userData.name,
        chefAdjoint: null as string | null,
        treasury: 0,
        entryFee: 50,
        payoutPercentage: 10,
        pendingRequests: [] as string[],
        lastPayoutDate: '',
        pendingChefTransfer: null as string | null,
        pendingChefTransferDate: null as string | null,
        guildMissions: [] as import('../types').GuildMission[],
        guildMissionsDate: '',
      };
      api.guilds.create({ name, emoji }).then((r) => {
        setState((p) => ({ ...p, guildState: { ...p.guildState, myGuildId: r.id } }));
      }).catch(() => {});
      return {
        ...prev,
        userData: { ...prev.userData, coins: prev.userData.coins - 10000 },
        guildState: {
          guilds: [...prev.guildState.guilds, newGuild],
          myGuildId: newId,
        },
      };
    });
  }, []);

  const joinGuild = useCallback((guildId: number) => {
    setState((prev) => {
      if (prev.guildState.myGuildId !== null) return prev;
      const guilds = prev.guildState.guilds.map((g) => {
        if (g.id !== guildId) return g;
        if (g.memberNames.includes(prev.userData.name) || g.pendingRequests.includes(prev.userData.name)) return g;
        if (prev.userData.coins < g.entryFee) return g;
        return { ...g, pendingRequests: [...g.pendingRequests, prev.userData.name] };
      });
      api.guilds.join(guildId).catch(() => {});
      return { ...prev, guildState: { ...prev.guildState, guilds } };
    });
  }, []);

  const leaveGuild = useCallback(() => {
    setState((prev) => {
      const guildId = prev.guildState.myGuildId;
      if (guildId === null) return prev;
      const guilds = prev.guildState.guilds.map((g) => {
        if (g.id !== guildId) return g;
        const members = g.memberNames.filter((n) => n !== prev.userData.name);
        if (members.length === 0) return { ...g, memberNames: [], chef: '', chefAdjoint: g.chefAdjoint === prev.userData.name ? null : g.chefAdjoint };
        const newChef = g.chef === prev.userData.name ? members[0] : g.chef;
        const newAdjoint = g.chefAdjoint === prev.userData.name ? null : g.chefAdjoint;
        return { ...g, memberNames: members, chef: newChef, chefAdjoint: newAdjoint };
      });
      api.guilds.leave(guildId).catch(() => {});
      return { ...prev, guildState: { ...prev.guildState, guilds, myGuildId: null } };
    });
  }, []);

  const setGuildEntryFee = useCallback((fee: number) => {
    setState((prev) => {
      const guilds = prev.guildState.guilds.map((g) => {
        if (g.id !== prev.guildState.myGuildId) return g;
        if (g.chef !== prev.userData.name) return g;
        return { ...g, entryFee: fee };
      });
      return { ...prev, guildState: { ...prev.guildState, guilds } };
    });
  }, []);

  const setGuildChefAdjoint = useCallback((name: string) => {
    setState((prev) => {
      const guilds = prev.guildState.guilds.map((g) => {
        if (g.id !== prev.guildState.myGuildId || g.chef !== prev.userData.name) return g;
        return { ...g, chefAdjoint: name };
      });
      return { ...prev, guildState: { ...prev.guildState, guilds } };
    });
  }, []);

  const acceptGuildRequest = useCallback((guildId: number, name: string) => {
    setState((prev) => {
      const guilds = prev.guildState.guilds.map((g) => {
        if (g.id !== guildId) return g;
        if (g.chef !== prev.userData.name && g.chefAdjoint !== prev.userData.name) return g;
        if (!g.pendingRequests.includes(name)) return g;
        const fee = g.entryFee;
        return {
          ...g,
          memberNames: [...g.memberNames, name],
          pendingRequests: g.pendingRequests.filter((n) => n !== name),
          treasury: g.treasury + fee,
        };
      });
      api.guilds.accept(guildId, name).catch(() => {});
      return { ...prev, guildState: { ...prev.guildState, guilds } };
    });
  }, []);

  const rejectGuildRequest = useCallback((guildId: number, name: string) => {
    setState((prev) => {
      const guilds = prev.guildState.guilds.map((g) => {
        if (g.id !== guildId) return g;
        if (g.chef !== prev.userData.name && g.chefAdjoint !== prev.userData.name) return g;
        return { ...g, pendingRequests: g.pendingRequests.filter((n) => n !== name) };
      });
      api.guilds.reject(guildId, name).catch(() => {});
      return { ...prev, guildState: { ...prev.guildState, guilds } };
    });
  }, []);

  const setGuildPayoutPercentage = useCallback((pct: number) => {
    setState((prev) => {
      const guilds = prev.guildState.guilds.map((g) => {
        if (g.id !== prev.guildState.myGuildId) return g;
        if (g.chef !== prev.userData.name && g.chefAdjoint !== prev.userData.name) return g;
        return { ...g, payoutPercentage: pct };
      });
      return { ...prev, guildState: { ...prev.guildState, guilds } };
    });
  }, []);

  const payoutGuildTreasury = useCallback(() => {
    setState((prev) => {
      const guild = prev.guildState.guilds.find((g) => g.id === prev.guildState.myGuildId);
      if (!guild || guild.memberNames.length === 0) return prev;
      if (guild.chef !== prev.userData.name && guild.chefAdjoint !== prev.userData.name) return prev;
      if (guild.treasury <= 0) return prev;

      const pct = guild.payoutPercentage / 100;
      const totalToPayout = Math.floor(guild.treasury * pct);
      const perMember = Math.floor(totalToPayout / guild.memberNames.length);
      const isMember = guild.memberNames.includes(prev.userData.name);
      const bonus = isMember ? perMember : 0;

      const guilds = prev.guildState.guilds.map((g) => {
        if (g.id !== guild.id) return g;
        return { ...g, treasury: g.treasury - totalToPayout, lastPayoutDate: getTodayDateString() };
      });

      return {
        ...prev,
        userData: { ...prev.userData, coins: prev.userData.coins + bonus },
        guildState: { ...prev.guildState, guilds },
      };
    });
  }, []);

  const deleteGuild = useCallback(() => {
    setState((prev) => {
      const guild = prev.guildState.guilds.find((g) => g.id === prev.guildState.myGuildId);
      if (!guild || guild.chef !== prev.userData.name) return prev;
      api.guilds.delete(prev.guildState.myGuildId).catch(() => {});
      return {
        ...prev,
        guildState: {
          guilds: prev.guildState.guilds.filter((g) => g.id !== prev.guildState.myGuildId),
          myGuildId: null,
        },
      };
    });
  }, []);

  const transferChef = useCallback((newChef: string) => {
    setState((prev) => {
      const guilds = prev.guildState.guilds.map((g) => {
        if (g.id !== prev.guildState.myGuildId || g.chef !== prev.userData.name) return g;
        if (!g.memberNames.includes(newChef) || newChef === prev.userData.name) return g;
        return {
          ...g,
          pendingChefTransfer: newChef,
          pendingChefTransferDate: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        };
      });
      return { ...prev, guildState: { ...prev.guildState, guilds } };
    });
  }, []);

  const cancelTransfer = useCallback(() => {
    setState((prev) => {
      const guilds = prev.guildState.guilds.map((g) => {
        if (g.id !== prev.guildState.myGuildId || g.chef !== prev.userData.name) return g;
        return { ...g, pendingChefTransfer: null, pendingChefTransferDate: null };
      });
      return { ...prev, guildState: { ...prev.guildState, guilds } };
    });
  }, []);

  const kickMember = useCallback((name: string) => {
    setState((prev) => {
      const guilds = prev.guildState.guilds.map((g) => {
        if (g.id !== prev.guildState.myGuildId || g.chef !== prev.userData.name) return g;
        if (name === g.chef || name === prev.userData.name) return g;
        api.guilds.kick(g.id, name).catch(() => {});
        return {
          ...g,
          memberNames: g.memberNames.filter((n) => n !== name),
          chefAdjoint: g.chefAdjoint === name ? null : g.chefAdjoint,
        };
      });
      return { ...prev, guildState: { ...prev.guildState, guilds } };
    });
  }, []);

  const completeGuildMission = useCallback((missionId: string) => {
    setState((prev) => {
      if (!prev.guildState.myGuildId) return prev;
      const guilds = prev.guildState.guilds.map((g) => {
        if (g.id !== prev.guildState.myGuildId) return g;
        const missions = g.guildMissions.map((m) => {
          if (m.id !== missionId || m.completedBy.includes(prev.userData.name)) return m;
          return { ...m, completedBy: [...m.completedBy, prev.userData.name] };
        });
        return { ...g, guildMissions: missions };
      });
      return { ...prev, guildState: { ...prev.guildState, guilds } };
    });
  }, []);

  const claimGuildMissionRewards = useCallback((missionId: string) => {
    setState((prev) => {
      const guild = prev.guildState.guilds.find((g) => g.id === prev.guildState.myGuildId);
      if (!guild) return prev;
      const mission = guild.guildMissions.find((m) => m.id === missionId);
      if (!mission || mission.rewarded) return prev;
      const threshold = Math.ceil(guild.memberNames.length / 2);
      if (mission.completedBy.length < threshold) return prev;
      if (!guild.memberNames.includes(prev.userData.name)) return prev;

      const taxed = applyGuildTax(prev, mission.coinsReward);
      const guilds = prev.guildState.guilds.map((g) => {
        if (g.id !== prev.guildState.myGuildId) return g;
        return {
          ...g,
          guildMissions: g.guildMissions.map((m) =>
            m.id === missionId ? { ...m, rewarded: true } : m
          ),
        };
      });

      return {
        ...prev,
        userData: {
          ...prev.userData,
          totalXP: prev.userData.totalXP + mission.xpReward,
          coins: prev.userData.coins + taxed.coins,
        },
        guildState: { ...prev.guildState, guilds },
      };
    });
  }, [applyGuildTax]);

  const sendPrivateMessage = useCallback((to: string, message: string) => {
    if (!message.trim()) return;
    const msg = message.trim();
    setState((prev) => ({
      ...prev,
      privateMessages: [
        ...prev.privateMessages,
        {
          id: prev.privateMessages.length + 1,
          from: prev.userData.name,
          to,
          message: msg,
          timestamp: new Date().toISOString(),
        },
      ],
    }));
    api.messages.send(to, msg).catch(() => {});
  }, []);

  const addFriend = useCallback((name: string) => {
    setState((prev) => {
      if (prev.friends.length >= 50) return prev;
      if (prev.friends.includes(name) || name === prev.userData.name) return prev;
      return { ...prev, friends: [...prev.friends, name] };
    });
    api.friends.add(name).catch(() => {});
  }, []);

  const removeFriend = useCallback((name: string) => {
    setState((prev) => ({
      ...prev,
      friends: prev.friends.filter((n) => n !== name),
    }));
    api.friends.remove(name).catch(() => {});
  }, []);

  return (
    <GameContext.Provider
      value={{
        state,
        gradeProgress,
        toggleDarkMode,
        consultChapter,
        completeMission,
        buyItem,
        sendMessage,
        canTakeQuiz: canTakeQuizFn,
        submitQuiz,
        getQuizStatus,
        getTodayQuizCount,
        startDuel,
        answerDuelQuestion,
        duelTimerTick,
        resetDuel,
        claimDailyReward: claimDailyRewardFn,
        allocateStat: allocateStatFn,
        addTrainingXP,
        failTraining,
        useItem,
        getBackpackCount,
        consumeBandage,
        applyTheme,
        applyAvatar,
        applyDecoration,
        consumeSecondSouffle,
        createGuild,
        joinGuild,
        leaveGuild,
        setGuildEntryFee,
        setGuildChefAdjoint,
        acceptGuildRequest,
        rejectGuildRequest,
        setGuildPayoutPercentage,
        payoutGuildTreasury,
        deleteGuild,
        transferChef,
        cancelTransfer,
        kickMember,
        completeGuildMission,
        claimGuildMissionRewards,
        sendPrivateMessage,
        addFriend,
        removeFriend,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame(): GameContextType {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
