import { useState, useEffect, useCallback } from 'react';
import { useGame } from '../contexts/GameContext';
import { getAdminQuestions } from '../utils/adminStorage';
import { playCorrect, playWrong, playVictory } from '../utils/sounds';

interface TrainingLevel {
  id: number;
  name: string;
  icon: string;
  questions: number;
  xp: number;
  coins: number;
  color: string;
  description: string;
}

const TRAINING_LEVELS: TrainingLevel[] = [
  { id: 1, name: 'Facile', icon: '🟢', questions: 3, xp: 30, coins: 10, color: 'from-green-500 to-green-600', description: '3 questions sans erreur' },
  { id: 2, name: 'Moyen', icon: '🟡', questions: 5, xp: 60, coins: 20, color: 'from-yellow-500 to-yellow-600', description: '5 questions sans erreur' },
  { id: 3, name: 'Difficile', icon: '🔴', questions: 10, xp: 120, coins: 40, color: 'from-red-500 to-red-700', description: '10 questions sans erreur' },
];

type Phase = 'menu' | 'playing' | 'success' | 'fail';

export default function TrainingPage() {
  const { state, addTrainingXP, getBackpackCount, consumeSecondSouffle, failTraining } = useGame();
  const darkMode = state.darkMode;
  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const textClass = darkMode ? 'text-white' : 'text-gray-800';
  const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-600';

  const [phase, setPhase] = useState<Phase>('menu');
  const [level, setLevel] = useState<TrainingLevel | null>(null);
  const [questions, setQuestions] = useState<ReturnType<typeof getAdminQuestions>>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [timeLeft, setTimeLeft] = useState(20);
  const baseTime = state.userData.timeBonus ? 50 : 20;
  const [showSecondSoufflePopup, setShowSecondSoufflePopup] = useState(false);

  const remaining = 5 - state.trainingState.todayCount;

  useEffect(() => {
    if (phase !== 'playing' || showExplanation) return;
    if (timeLeft <= 0) {
      setShowExplanation(true);
      const hasSouffle = getBackpackCount('second-souffle') > 0;
      if (hasSouffle) {
        setTimeout(() => setShowSecondSoufflePopup(true), 1500);
      } else {
        setTimeout(() => setPhase('fail'), 1500);
      }
      return;
    }
    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, phase, showExplanation]);

  const startLevel = useCallback((lvl: TrainingLevel) => {
    const allQ = getAdminQuestions();
    if (allQ.length === 0) return;
    const shuffled = [...allQ].sort(() => Math.random() - 0.5).slice(0, lvl.questions + 5);
    setLevel(lvl);
    setQuestions(shuffled.slice(0, lvl.questions));
    setCurrentQ(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setTimeLeft(baseTime);
    setPhase('playing');
  }, []);

  const handleAnswer = useCallback((idx: number) => {
    if (selectedAnswer !== null || !level) return;
    setSelectedAnswer(idx);
    setShowExplanation(true);

    const correct = idx === questions[currentQ]?.correctAnswer;

    if (correct) {
      playCorrect();
      setTimeout(() => {
        if (currentQ + 1 >= level.questions) {
          addTrainingXP(level.xp, level.coins);
          playVictory();
          setPhase('success');
        } else {
          setCurrentQ(currentQ + 1);
          setSelectedAnswer(null);
          setShowExplanation(false);
          setTimeLeft(baseTime);
        }
      }, 2000);
    } else {
      playWrong();
      const hasSouffle = getBackpackCount('second-souffle') > 0;
      if (hasSouffle) {
        setTimeout(() => setShowSecondSoufflePopup(true), 2200);
      } else {
        setTimeout(() => setPhase('fail'), 2000);
      }
    }
  }, [selectedAnswer, level, questions, currentQ, addTrainingXP, getBackpackCount]);

  useEffect(() => {
    if (phase === 'playing' && timeLeft <= 0 && selectedAnswer === null && !showExplanation && !showSecondSoufflePopup) {
      setShowExplanation(true);
      const hasSouffle = getBackpackCount('second-souffle') > 0;
      if (hasSouffle) {
        setTimeout(() => setShowSecondSoufflePopup(true), 1500);
      } else {
        setTimeout(() => setPhase('fail'), 1500);
      }
    }
  }, [timeLeft, phase, selectedAnswer, showExplanation, showSecondSoufflePopup, getBackpackCount]);

  const handleUseSecondSouffle = useCallback(() => {
    if (!level) return;
    consumeSecondSouffle();
    setShowSecondSoufflePopup(false);
    if (currentQ + 1 >= level.questions) {
      addTrainingXP(level.xp, level.coins);
      setPhase('success');
    } else {
      setCurrentQ(currentQ + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setTimeLeft(baseTime);
    }
  }, [level, currentQ, consumeSecondSouffle, addTrainingXP]);

  const handleRefuseSecondSouffle = useCallback(() => {
    setShowSecondSoufflePopup(false);
    setPhase('fail');
  }, []);

  if (phase === 'success' && level) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className={`${cardBg} rounded-xl shadow-xl p-6 border-2 border-amber-900 max-w-md w-full text-center`}>
          <div className="text-7xl mb-4">🏆</div>
          <div className="text-3xl font-bold theme-text-transparent mb-4">
            Entraînement réussi !
          </div>
          <div className={`p-4 rounded-lg mb-4 ${darkMode ? 'bg-gray-700' : 'bg-amber-50'} border-2 border-amber-900`}>
            <p className={`text-sm ${textSecondary}`}>
              +{level.xp} XP • +{level.coins} 🪙
            </p>
            <p className={`text-xs mt-1 ${textSecondary}`}>
              {level.icon} {level.name} — {level.questions}/{level.questions} correctes
            </p>
          </div>
          <button
            onClick={() => setPhase('menu')}
            className="w-full theme-gradient text-white font-bold py-3 px-6 rounded-xl border-2 border-amber-900"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'fail' && level) {
    const q = questions[currentQ];
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className={`${cardBg} rounded-xl shadow-xl p-6 border-2 border-amber-900 max-w-md w-full text-center`}>
          <div className="text-7xl mb-4">💔</div>
          <div className="text-3xl font-bold text-red-500 mb-4">Échec !</div>
          <p className={`text-sm mb-3 ${textSecondary}`}>
            Tu as répondu correctement à <strong className="theme-text">{currentQ}</strong> question{currentQ > 1 ? 's' : ''} sur {level.questions}
          </p>
          {q && (
            <div className={`p-3 rounded-lg mb-4 ${darkMode ? 'bg-gray-700' : 'bg-amber-50'} border-2 border-amber-900 text-left`}>
              <p className={`text-xs font-bold ${textSecondary} mb-1`}>💡 {q.explanation}</p>
            </div>
          )}
          <button
            onClick={() => setPhase('menu')}
            className="w-full theme-gradient text-white font-bold py-3 px-6 rounded-xl border-2 border-amber-900"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'playing' && level) {
    const q = questions[currentQ];
    if (!q) return null;
    const timePercent = (timeLeft / baseTime) * 100;
    const timeColor = timeLeft <= baseTime * 0.25 ? 'bg-red-500' : timeLeft <= baseTime * 0.5 ? 'bg-yellow-500' : 'bg-green-500';

    return (
      <div className="max-w-lg mx-auto space-y-3">
        <div className="flex items-center justify-between">
          <span className={`font-bold ${textClass}`}>
            {level.icon} {level.name} — Question {currentQ + 1}/{level.questions}
          </span>
          <div className="flex items-center gap-2">
            <span className={`font-bold text-lg ${timeLeft <= baseTime * 0.25 ? 'text-red-500 animate-pulse' : timeLeft <= baseTime * 0.5 ? 'text-yellow-500' : 'text-green-500'}`}>
              ⏱️ {timeLeft}s
            </span>
            <button
              onClick={() => { failTraining(); setPhase('menu'); }}
              className="bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-2 text-xs rounded-lg border-2 border-amber-900"
            >
              ✗ Quitter
            </button>
          </div>
        </div>

        <div className="h-3 bg-gray-300 rounded-full overflow-hidden border-2 border-black">
          <div className={`h-full ${timeColor} transition-all duration-1000`} style={{ width: `${timePercent}%` }} />
        </div>

        <div className="flex gap-1 mb-2">
          {Array.from({ length: level.questions }).map((_, i) => (
            <div
              key={i}
              className={`h-2 flex-1 rounded-full ${
                i < currentQ ? 'bg-green-500' : i === currentQ ? 'theme-bg' : darkMode ? 'bg-gray-600' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>

        <div className={`${cardBg} rounded-xl shadow-xl p-6 border-2 border-amber-900`}>
          <h3 className={`text-lg font-bold ${textClass} mb-4 text-center`}>
            {q.question}
          </h3>

          <div className="space-y-2">
            {q.options.map((opt, idx) => {
              const letter = String.fromCharCode(65 + idx);
              const isCorrect = idx === q.correctAnswer;
              const isSelected = selectedAnswer === idx;

              let btnClass = `w-full font-bold py-4 px-5 rounded-xl transition-all border-2 text-left flex items-center gap-3 `;
              if (showExplanation && isCorrect) {
                btnClass += 'bg-green-500 text-white border-green-700';
              } else if (showExplanation && isSelected && !isCorrect) {
                btnClass += 'bg-red-500 text-white border-red-700';
              } else if (showExplanation) {
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

          {showExplanation && (
            <div className={`mt-4 p-3 rounded-lg border-2 ${
              selectedAnswer === q.correctAnswer
                ? `border-green-500 ${darkMode ? 'bg-green-900/30' : 'bg-green-50'}`
                : `border-red-500 ${darkMode ? 'bg-red-900/30' : 'bg-red-50'}`
            }`}>
              <p className={`text-xs ${textSecondary}`}>
                💡 {q.explanation}
              </p>
            </div>
          )}
        </div>

        <div className={`text-center text-xs ${textSecondary}`}>
          ⚠️ Une seule erreur et c'est terminé !
        </div>
      </div>
    );
  }

  return (
    <div>
      {showSecondSoufflePopup && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className={`${cardBg} rounded-2xl shadow-2xl p-6 border-2 border-amber-900 max-w-sm w-full text-center`}>
            <div className="text-5xl mb-3">🔄</div>
            <h2 className={`text-xl font-bold ${textClass} mb-2`}>Second Souffle</h2>
            <p className={`text-sm ${textSecondary} mb-1`}>
              Tu as fait une erreur... mais tu possèdes un 🔄 <strong>Second Souffle</strong> !
            </p>
            <p className={`text-xs ${textSecondary} mb-4`}>
              L'utiliser pour annuler cette erreur et continuer ?
            </p>
            <p className={`text-xs mb-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              Il te reste <strong>{getBackpackCount('second-souffle')}</strong> Second Souffle{getBackpackCount('second-souffle') > 1 ? 's' : ''}
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleRefuseSecondSouffle}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-xl border-2 border-amber-900 transition-all"
              >
                Abandonner
              </button>
              <button
                onClick={handleUseSecondSouffle}
                className="flex-1 theme-gradient text-white font-bold py-3 px-4 rounded-xl border-2 border-amber-900 hover:scale-105 transition-transform"
              >
                🔄 Utiliser
              </button>
            </div>
          </div>
        </div>
      )}

      <h2 className={`text-2xl font-bold ${textClass} mb-2 text-center`}>🏋️ Entraînement</h2>
      <p className={`text-center text-sm mb-4 ${textSecondary}`}>
        {remaining} session{remaining > 1 ? 's' : ''} restante{remaining > 1 ? 's' : ''} aujourd'hui
      </p>

      <div className={`p-3 rounded-xl mb-4 ${darkMode ? 'bg-gray-800' : 'bg-white'} border-2 border-amber-900 shadow-xl`}>
        <div className="h-4 bg-gray-300 rounded-full overflow-hidden border-2 border-black">
          <div
            className="h-full theme-progress transition-all duration-500"
            style={{ width: `${((5 - remaining) / 5) * 100}%` }}
          />
        </div>
        <p className={`text-xs text-center mt-1 ${textSecondary}`}>{5 - remaining}/5 effectuées</p>
      </div>

      <div className="space-y-3">
        {TRAINING_LEVELS.map((lvl) => (
          <div
            key={lvl.id}
            className={`${cardBg} rounded-xl shadow-xl p-5 border-2 border-amber-900`}
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="text-4xl">{lvl.icon}</div>
              <div className="flex-1">
                <h3 className={`text-lg font-bold ${textClass}`}>{lvl.name}</h3>
                <p className={`text-xs ${textSecondary}`}>{lvl.description}</p>
                <div className="flex gap-3 mt-1">
                  <span className="text-xs theme-text font-bold">+{lvl.xp} XP</span>
                  <span className="text-xs text-yellow-500 font-bold">+{lvl.coins} 🪙</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => startLevel(lvl)}
              disabled={remaining <= 0}
              className={`w-full bg-gradient-to-r ${lvl.color} text-white font-bold py-4 rounded-xl border-2 border-amber-900 hover:scale-[1.02] transition-transform disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 text-lg`}
              >
                Go !
              </button>
          </div>
        ))}
      </div>

      <div className={`mt-4 p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-amber-50'} border-2 border-amber-900`}>
        <p className={`text-xs font-bold ${textSecondary} mb-1`}>📋 Règles :</p>
        <ul className={`text-xs ${textSecondary} space-y-1`}>
          <li>• Tu dois répondre à <strong>toutes</strong> les questions correctement</li>
          <li>• <strong>Une erreur = tentative terminée</strong></li>
          <li>• 5 sessions maximum par jour</li>
          <li>• Les XP gagnés font monter ton niveau !</li>
        </ul>
      </div>
    </div>
  );
}
