import { useState, useEffect, useCallback } from 'react';
import { useGame } from '../contexts/GameContext';
import type { DuelAction, DuelQuestion } from '../types';
import { playCorrect, playWrong, playHit, playHeal, playVictory, playDefeat, playDefend } from '../utils/sounds';

export default function DuelsPage() {
  const { state, startDuel, answerDuelQuestion, duelTimerTick, resetDuel, getBackpackCount } = useGame();
  const darkMode = state.darkMode;
  const ds = state.duelState;
  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const textClass = darkMode ? 'text-white' : 'text-gray-800';
  const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-600';

  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [selectedAction, setSelectedAction] = useState<DuelAction | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [lastCorrect, setLastCorrect] = useState(false);
  const [lastExplanation, setLastExplanation] = useState('');
  const [isFirst, setIsFirst] = useState(false);
  const [waitingAction, setWaitingAction] = useState(false);

  const questions = (ds as typeof ds & { _questions?: DuelQuestion[]; _playerForce?: number })._questions || [];
  const playerForce = (ds as typeof ds & { _playerForce?: number })._playerForce || 10;
  const forceMultiplier = playerForce / 10;
  const currentQuestion = questions[ds.currentRound % questions.length];

  useEffect(() => {
    if (ds.phase !== 'playing' || showFeedback) return;
    if (ds.timer <= 0) return;
    const interval = setInterval(() => {
      duelTimerTick();
    }, 1000);
    return () => clearInterval(interval);
  }, [ds.phase, ds.timer, showFeedback, duelTimerTick]);

  useEffect(() => {
    if (ds.phase === 'playing') {
      setSelectedAnswer(null);
      setSelectedAction(null);
      setShowFeedback(false);
      setWaitingAction(false);
      setIsFirst(false);
    }
  }, [ds.phase, ds.currentRound]);

  const handleAnswer = useCallback((idx: number) => {
    if (selectedAnswer !== null || waitingAction) return;
    setSelectedAnswer(idx);
    const correct = idx === currentQuestion?.correctAnswer;
    setLastCorrect(correct);
    setLastExplanation(currentQuestion?.explanation || '');

    if (correct) {
      playCorrect();
      const first = Math.random() > 0.4;
      setIsFirst(first);
      setWaitingAction(true);
    } else {
      playWrong();
      setShowFeedback(true);
      setTimeout(() => {
        answerDuelQuestion(idx, 'attack');
        setShowFeedback(false);
        setSelectedAnswer(null);
      }, 2000);
    }
  }, [selectedAnswer, waitingAction, currentQuestion, answerDuelQuestion]);

  const handleAction = useCallback((action: DuelAction) => {
    if (!waitingAction || selectedAnswer === null) return;
    setSelectedAction(action);
    setShowFeedback(true);
    setWaitingAction(false);

    if (action === 'attack' || action === 'special') playHit();
    else if (action === 'heal') playHeal();
    else if (action === 'defend') playDefend();

    setTimeout(() => {
      answerDuelQuestion(selectedAnswer, action);
      setShowFeedback(false);
      setSelectedAnswer(null);
      setSelectedAction(null);
    }, 1500);
  }, [waitingAction, selectedAnswer, answerDuelQuestion]);

  const handleTimeUpAnswer = useCallback(() => {
    if (selectedAnswer !== null || showFeedback) return;
    setLastCorrect(false);
    setLastExplanation(currentQuestion?.explanation || '');
    setShowFeedback(true);
    setTimeout(() => {
      answerDuelQuestion(-1, 'attack');
      setShowFeedback(false);
      setSelectedAnswer(null);
    }, 2000);
  }, [selectedAnswer, showFeedback, currentQuestion, answerDuelQuestion]);

  useEffect(() => {
    if (ds.phase === 'playing' && ds.timer <= 0 && selectedAnswer === null && !showFeedback) {
      handleTimeUpAnswer();
    }
  }, [ds.timer, ds.phase, selectedAnswer, showFeedback, handleTimeUpAnswer]);

  useEffect(() => {
    if (ds.phase === 'result') {
      if (ds.result === 'win') playVictory();
      else if (ds.result === 'lose') playDefeat();
    }
  }, [ds.phase, ds.result]);

  if (ds.phase === 'menu') {
    return (
      <div>
        <h2 className={`text-2xl font-bold ${textClass} mb-4 text-center`}>⚔️ Duels</h2>

        <div className={`${cardBg} rounded-xl shadow-xl p-6 border-2 border-amber-900 mb-4`}>
          <div className="text-center">
            <div className="text-6xl mb-4">⚔️</div>
            <h3 className={`text-xl font-bold ${textClass} mb-2`}>Duels Classés</h3>
            <p className={`${textSecondary} text-sm mb-4`}>
              Affronte un adversaire ! Le duel se termine quand un joueur n'a plus de HP.
            </p>
            <div className={`p-3 rounded-lg mb-4 ${darkMode ? 'bg-gray-700' : 'bg-amber-50'} border-2 border-amber-900`}>
              <div className="text-2xl font-bold theme-text">{ds.todayDuels}</div>
              <div className={`text-xs font-bold ${textSecondary}`}>Duels aujourd'hui</div>
            </div>
            <div className={`p-3 rounded-lg mb-4 ${darkMode ? 'bg-gray-700' : 'bg-amber-50'} border-2 border-amber-900`}>
              <p className={`text-xs font-bold ${textSecondary} mb-2`}>🎮 Comment ça marche :</p>
              <ul className={`text-xs ${textSecondary} space-y-1 text-left`}>
                <li>• Réponds correctement → choisis une action</li>
                <li>• 🛡️ Défense (12 dmg, subit 15% — max 3 fois de suite)</li>
                <li>• 💚 Soin (+15 HP) — nécessite un 🩹 pansement (max 3/duel)</li>
                <li>• ⚡ Spécial (35 dmg) — si tu es le 1er à répondre !</li>
                <li>• ❌ Mauvaise réponse → tu perds 10 HP</li>
                <li>• ⏱️ Temps écoulé → tu perds 15 HP</li>
                <li>• 🔥 &lt;15% HP + 3 bonnes réponses = RAGE x2 (3 actions)</li>
              </ul>
            </div>
            <button
              onClick={() => startDuel(false)}
              className="w-full theme-gradient text-white font-bold py-3 px-6 rounded-xl border-2 border-amber-900 text-lg hover:scale-105 transition-transform"
            >
              🎯 Trouver un adversaire
            </button>
          </div>
        </div>

        <div className={`${cardBg} rounded-xl shadow-xl p-6 border-2 border-amber-900`}>
          <div className="text-center">
            <div className="text-4xl mb-2">🤝</div>
            <h3 className={`text-lg font-bold ${textClass} mb-2`}>Défi d'entraînement</h3>
            <p className={`${textSecondary} text-sm mb-4`}>
              Entraîne-toi sans enjeu ! Pas de limite, pas de récompense.
            </p>
            <button
              onClick={() => startDuel(true)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl border-2 border-amber-900"
            >
              Défier un ami
            </button>
          </div>
        </div>

        {state.duelHistory.length > 0 && (
          <div className={`${cardBg} rounded-xl shadow-xl p-4 border-2 border-amber-900 mt-4`}>
            <h3 className={`font-bold ${textClass} mb-3 text-center`}>📜 Historique des duels</h3>
            <div className="space-y-2">
              {state.duelHistory.slice(0, 10).map((h) => {
                const resultColors = { win: 'text-green-500', lose: 'text-red-500' };
                const resultLabels = { win: 'Victoire', lose: 'Défaite' };
                const date = new Date(h.date);
                const timeStr = date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) + ' ' + date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
                return (
                  <div key={h.id} className={`flex items-center gap-3 p-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-amber-50'} border border-amber-900`}>
                    <span className="text-xl">{h.opponentAvatar}</span>
                    <div className="flex-1">
                      <div className={`text-xs font-bold ${textClass}`}>{h.opponent}</div>
                      <div className={`text-[10px] ${textSecondary}`}>{timeStr}</div>
                    </div>
                    <div className="text-right">
                      <div className={`text-xs font-bold ${resultColors[h.result]}`}>{resultLabels[h.result]}</div>
                      <div className={`text-[10px] ${textSecondary}`}>+{h.xpGained} XP • +{h.coinsGained} 🪙</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (ds.phase === 'result') {
    const resultConfig = {
      win: { emoji: '🏆', title: 'VICTOIRE !', color: 'from-yellow-400 to-yellow-600' },
      lose: { emoji: '💀', title: 'DÉFAITE', color: 'from-red-400 to-red-600' },
    };
    const config = resultConfig[ds.result || 'lose'];

    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className={`${cardBg} rounded-xl shadow-xl p-6 border-2 border-amber-900 max-w-md w-full text-center animate-fade-in`}>
          <div className="text-8xl mb-4 animate-bounce">{config.emoji}</div>
          <div className={`text-4xl font-black mb-4`} style={{
            background: `linear-gradient(to right, ${ds.result === 'win' ? '#F59E0B, #EF4444' : ds.result === 'lose' ? '#EF4444, #991B1B' : '#3B82F6, #6366F1'})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            {config.title}
          </div>
          {ds.opponent && (
            <p className={`text-sm ${textSecondary} mb-3`}>
              Contre {ds.opponent.avatar} {ds.opponent.name}
            </p>
          )}

          <div className={`p-4 rounded-lg mb-4 ${darkMode ? 'bg-gray-700' : 'bg-amber-50'} border-2 border-amber-900`}>
            <p className={`text-sm ${textSecondary}`}>
              {ds.result === 'win' ? '+60 XP • +30 🪙' : '+10 XP • +5 🪙'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-green-50'} border-2 border-green-500`}>
              <div className="text-sm font-bold text-green-600">Tes HP</div>
              <div className="text-2xl font-bold">{ds.playerHp}</div>
            </div>
            <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-red-50'} border-2 border-red-500`}>
              <div className="text-sm font-bold text-red-600">Adversaire</div>
              <div className="text-2xl font-bold">{ds.opponentHp}</div>
            </div>
          </div>

          <div className={`text-left space-y-1 mb-4 ${darkMode ? 'bg-gray-700' : 'bg-amber-50'} rounded-lg p-3 border-2 border-amber-900 max-h-40 overflow-y-auto`}>
            {ds.rounds.map((r, i) => (
              <div key={i} className={`text-xs ${textSecondary}`}>
                <span className={r.playerCorrect ? 'text-green-500' : 'text-red-500'}>
                  {r.playerCorrect ? '✓' : '✗'}
                </span>
                {' '}Round {i + 1} — 
                <span className="theme-text"> {r.playerDmgDealt} dmg</span>
                {' | '}
                <span className="text-red-500">{r.opponentDmgDealt} dmg subi</span>
              </div>
            ))}
          </div>

          <button
            onClick={resetDuel}
            className="w-full theme-gradient text-white font-bold py-3 px-6 rounded-xl border-2 border-amber-900"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  if (ds.phase === 'playing' && currentQuestion) {
    const baseTime = ds.baseTime || 20;
    const timePercent = (ds.timer / baseTime) * 100;
    const timeColor = ds.timer <= 5 ? 'bg-red-500' : ds.timer <= 10 ? 'bg-yellow-500' : 'bg-green-500';

    const actionsUnlocked = waitingAction && lastCorrect;
    const specialUnlocked = actionsUnlocked && isFirst;

    const isCritical = ds.playerHp < ds.playerMaxHp * 0.15;
    const rageActive = ds.rageTicks > 0;
    const rageReady = isCritical && ds.rageStreak >= 2 && ds.rageTicks === 0;

    const bandageCount = getBackpackCount('bandage');
    const healAvailable = bandageCount > 0 && ds.healsUsed < 3;

    const effectiveMultiplier = rageActive ? forceMultiplier * 2 : forceMultiplier;
    const actionButtons: { action: DuelAction; icon: string; label: string; dmg: string; color: string; disabledColor: string }[] = [
      { action: 'attack', icon: '⚔️', label: 'Attaque', dmg: `${Math.round(20 * effectiveMultiplier)} dmg`, color: 'bg-red-600 hover:bg-red-700', disabledColor: 'bg-red-900/40' },
      { action: 'defend', icon: '🛡️', label: 'Défense', dmg: `15% subi`, color: 'bg-blue-600 hover:bg-blue-700', disabledColor: 'bg-blue-900/40' },
      { action: 'heal', icon: '💚', label: 'Soin', dmg: `🩹${bandageCount} (${3 - ds.healsUsed} max)`, color: 'bg-green-600 hover:bg-green-700', disabledColor: 'bg-green-900/40' },
      { action: 'special', icon: '⚡', label: 'Spécial', dmg: `${Math.round(35 * effectiveMultiplier)} dmg`, color: 'bg-purple-600 hover:bg-purple-700', disabledColor: 'bg-purple-900/40' },
    ];

    return (
      <div className="max-w-lg mx-auto space-y-3">
        <div className={`${cardBg} rounded-xl p-3 border-2 border-amber-900 shadow-xl`}>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-1 mb-1">
                <span className="text-sm font-bold theme-text">Toi</span>
                <span className="text-xs">{ds.playerHp}/{ds.playerMaxHp} HP</span>
                {rageActive && <span className="text-xs font-bold text-red-500 animate-pulse ml-1">🔥 RAGE x2 ({ds.rageTicks})</span>}
              </div>
              <div className="h-4 bg-gray-300 rounded-full overflow-hidden border-2 border-black">
                <div
                  className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-500"
                  style={{ width: `${(ds.playerHp / ds.playerMaxHp) * 100}%` }}
                />
              </div>
            </div>
            <div className="text-2xl font-bold theme-text px-3">VS</div>
            <div className="flex-1 text-right">
              <div className="flex items-center justify-end gap-1 mb-1">
                <span className="text-xs">{ds.opponentHp}/{ds.opponent?.maxHp} HP</span>
                <span className="text-sm font-bold text-red-600">{ds.opponent?.name}</span>
              </div>
              <div className="h-4 bg-gray-300 rounded-full overflow-hidden border-2 border-black">
                <div
                  className="h-full bg-gradient-to-r from-red-400 to-red-600 transition-all duration-500 ml-auto"
                  style={{ width: `${(ds.opponentHp / (ds.opponent?.maxHp || 100)) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className={`font-bold text-sm ${textSecondary}`}>
            Round {ds.currentRound + 1}
          </span>
          <div className="flex items-center gap-2">
            <span className={`font-bold text-lg ${ds.timer <= 5 ? 'text-red-500 animate-pulse' : ds.timer <= 10 ? 'text-yellow-500' : 'text-green-500'}`}>
              ⏱️ {ds.timer}s
            </span>
            <button
              onClick={resetDuel}
              className="bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-2 text-xs rounded-lg border-2 border-amber-900"
            >
              ✗ Quitter
            </button>
          </div>
        </div>

        <div className="h-3 bg-gray-300 rounded-full overflow-hidden border-2 border-black">
          <div className={`h-full ${timeColor} transition-all duration-1000`} style={{ width: `${timePercent}%` }} />
        </div>

        {showFeedback && !waitingAction ? (
          <div className={`${cardBg} rounded-xl shadow-xl p-6 border-2 ${lastCorrect ? 'border-green-500' : 'border-red-500'}`}>
            <div className="text-center">
              <div className="text-4xl mb-2">{lastCorrect ? '✅' : '❌'}</div>
              <div className={`text-xl font-bold mb-2 ${lastCorrect ? 'text-green-500' : 'text-red-500'}`}>
                {lastCorrect ? 'Bonne réponse !' : 'Mauvaise réponse...'}
              </div>
              {lastCorrect && selectedAction && (
                <div className={`text-sm font-bold mb-2 theme-text`}>
                  {selectedAction === 'attack' ? '⚔️ Attaque !' : selectedAction === 'defend' ? '🛡️ Défense !' : selectedAction === 'heal' ? '💚 Soin !' : '⚡ Attaque spéciale !'}
                </div>
              )}
              {!lastCorrect && (
                <div className={`text-sm ${textSecondary} mb-3`}>
                  La bonne réponse était : <strong>{currentQuestion.options[currentQuestion.correctAnswer]}</strong>
                </div>
              )}
              <div className={`${darkMode ? 'bg-gray-700' : 'bg-amber-50'} rounded-lg p-3 border-2 border-amber-900`}>
                <p className={`text-xs ${textSecondary}`}>
                  💡 {lastExplanation}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className={`${cardBg} rounded-xl shadow-xl p-6 border-2 border-amber-900`}>
              <h3 className={`text-lg font-bold ${textClass} mb-4 text-center`}>
                {currentQuestion.question}
              </h3>

              <div className="space-y-2">
                {currentQuestion.options.map((opt, idx) => {
                  const letter = String.fromCharCode(65 + idx);

                  let btnClass = `w-full font-bold py-4 px-5 rounded-xl transition-all border-2 text-left flex items-center gap-3 `;
                  if (waitingAction || selectedAnswer !== null) {
                    btnClass += `${darkMode ? 'bg-gray-700 text-gray-500 border-gray-600' : 'bg-gray-100 text-gray-400 border-gray-300'} cursor-default`;
                  } else {
                    btnClass += `${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white border-gray-600' : 'bg-amber-50 hover:bg-amber-100 text-gray-800 border-amber-900'}`;
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleAnswer(idx)}
                      disabled={selectedAnswer !== null}
                      className={btnClass}
                    >
                      <span className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm flex-shrink-0">
                        {letter}
                      </span>
                      <span className="text-base">{opt}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className={`${cardBg} rounded-xl p-3 border-2 border-amber-900 shadow-xl`}>
              {rageActive && (
                <div className="text-center mb-2">
                  <span className="text-xs font-bold text-red-500 animate-pulse bg-red-500/10 px-3 py-1 rounded-full">
                    🔥 RAGE ACTIVE x2 — {ds.rageTicks} action{ds.rageTicks > 1 ? 's' : ''} restante{ds.rageTicks > 1 ? 's' : ''}
                  </span>
                </div>
              )}
              {rageReady && !rageActive && (
                <div className="text-center mb-2">
                  <span className="text-xs font-bold text-yellow-500 animate-pulse bg-yellow-500/10 px-3 py-1 rounded-full">
                    ⚡ Encore 1 bonne réponse pour déclencher la RAGE !
                  </span>
                </div>
              )}
              {!actionsUnlocked ? (
                <p className={`text-xs font-bold text-center ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  🔒 Réponds correctement pour débloquer les actions
                </p>
              ) : (
                <p className={`text-xs font-bold text-center text-green-500 mb-2`}>
                  ✅ Bonne réponse ! {isFirst ? '🏆 Tu es le 1er ! Spécial dispo !' : 'Choisis ton action :'}
                </p>
              )}
              <div className="grid grid-cols-4 gap-2">
                {actionButtons.map(({ action, icon, label, dmg, color, disabledColor }) => {
                  const isSpecial = action === 'special';
                  const isHeal = action === 'heal';
                  const isDefend = action === 'defend';
                  const defendLocked = isDefend && ds.consecutiveDefends >= 3;
                  const disabled = isSpecial ? !specialUnlocked : isHeal ? !actionsUnlocked || !healAvailable : isDefend ? !actionsUnlocked || defendLocked : !actionsUnlocked;

                  return (
                    <button
                      key={action}
                      onClick={() => !disabled && handleAction(action)}
                      disabled={disabled}
                      className={`p-3 rounded-lg border-2 text-center transition-all ${
                        disabled
                          ? `${disabledColor} border-gray-600 opacity-40 cursor-not-allowed text-gray-500`
                          : `${color} border-amber-900 text-white font-bold hover:scale-105 active:scale-95`
                      }`}
                    >
                      <div className="text-xl">{icon}</div>
                      <div className="text-[10px] mt-1">{label}</div>
                      <div className="text-[8px] opacity-70">{defendLocked ? 'Bloqué (attaque !)' : dmg}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {ds.rounds.length > 0 && (
          <div className={`${cardBg} rounded-xl p-3 border-2 border-amber-900 shadow-xl`}>
            <p className={`text-xs font-bold ${textSecondary} mb-2 text-center`}>📜 Historique</p>
            <div className="space-y-1 max-h-36 overflow-y-auto">
              {[...ds.rounds].reverse().map((r, i) => {
                const roundNum = ds.rounds.length - i;
                const actionLabels: Record<string, { icon: string; text: string }> = {
                  attack: { icon: '⚔️', text: 'Attaque' },
                  defend: { icon: '🛡️', text: 'Défense' },
                  heal: { icon: '💚', text: 'Soin' },
                  special: { icon: '⚡', text: 'Spécial' },
                };
                const oppActionKey = r.opponentAction ?? 'attack';
                const oppAction = actionLabels[oppActionKey] || { icon: '❓', text: '?' };

                return (
                  <div
                    key={i}
                    className={`text-[11px] p-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-amber-50'} border-2 border-amber-900`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`font-bold ${textSecondary}`}>R{roundNum}</span>
                      <span className={r.playerCorrect ? 'text-green-500' : 'text-red-500'}>
                        {r.playerCorrect ? '✓ Correct' : '✗ Faux'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <div>
                        {r.playerCorrect && r.playerAction && actionLabels[r.playerAction] ? (
                          <span className="theme-text">
                            {actionLabels[r.playerAction].icon} {actionLabels[r.playerAction].text}
                            {r.playerDmgDealt > 0 && <span className="ml-1">→ -{r.playerDmgDealt} HP</span>}
                          </span>
                        ) : (
                          <span className="text-red-500">💤 Pas d'action</span>
                        )}
                      </div>
                      <div className="text-right">
                        {r.opponentCorrect ? (
                          <span className="text-red-400">
                            {oppAction.icon} Adv.
                            {r.opponentDmgDealt > 0 && <span className="ml-1">→ -{r.opponentDmgDealt} HP</span>}
                          </span>
                        ) : (
                          <span className="text-gray-500">Adv. ✗</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className={`text-center text-xs ${textSecondary}`}>
          ✓ {ds.rounds.filter(r => r.playerCorrect).length} correctes • ✗ {ds.rounds.filter(r => !r.playerCorrect).length} fausses
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className={`${cardBg} rounded-xl shadow-xl p-6 border-2 border-amber-900 text-center`}>
        <div className="text-4xl mb-4">🔄</div>
        <p className={`font-bold ${textClass}`}>Recherche d'adversaire...</p>
      </div>
    </div>
  );
}
