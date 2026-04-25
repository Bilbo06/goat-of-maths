import { useEffect, useRef } from 'react';
import { useGame } from '../contexts/GameContext';
import { playLevelUp } from '../utils/sounds';

export default function LevelUpModal() {
  const { state, allocateStat } = useGame();
  const darkMode = state.darkMode;
  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const textClass = darkMode ? 'text-white' : 'text-gray-800';
  const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-600';
  const playedRef = useRef(false);

  useEffect(() => {
    if (state.userData.statPoints > 0 && !playedRef.current) {
      playLevelUp();
      playedRef.current = true;
    }
    if (state.userData.statPoints <= 0) {
      playedRef.current = false;
    }
  }, [state.userData.statPoints]);

  if (state.userData.statPoints <= 0) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className={`${cardBg} rounded-2xl shadow-2xl p-6 border-2 border-amber-900 max-w-sm w-full`}>
        <div className="text-center mb-4">
          <div className="text-5xl mb-2">⬆️</div>
          <h2 className={`text-2xl font-bold ${textClass}`}>Niveau supérieur !</h2>
          <p className={`text-sm ${textSecondary}`}>
            Tu as <strong className="theme-text">{state.userData.statPoints}</strong> point{state.userData.statPoints > 1 ? 's' : ''} à répartir
          </p>
        </div>

        <div className="space-y-3 mb-4">
          <div className={`${darkMode ? 'bg-gray-700' : 'bg-amber-50'} rounded-xl p-3 border-2 border-amber-900`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`font-bold ${textClass}`}>❤️ Vie max</span>
              <span className="text-sm font-bold theme-text">{state.userData.maxHp} HP</span>
            </div>
            <button
              onClick={() => allocateStat('hp')}
              className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white font-bold py-3 px-4 rounded-xl border-2 border-amber-900 hover:scale-105 transition-transform"
            >
              +15 HP max ❤️
            </button>
          </div>

          <div className={`${darkMode ? 'bg-gray-700' : 'bg-amber-50'} rounded-xl p-3 border-2 border-amber-900`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`font-bold ${textClass}`}>⚔️ Force</span>
              <span className="text-sm font-bold theme-text">{state.userData.force} F</span>
            </div>
            <button
              onClick={() => allocateStat('force')}
              className="theme-gradient text-white font-bold py-3 px-4 rounded-xl border-2 border-amber-900 hover:scale-105 transition-transform"
            >
              +3 Force ⚔️
            </button>
          </div>
        </div>

        <div className={`text-center text-xs ${textSecondary}`}>
          💡 La force augmente tes dégâts en duel
        </div>
      </div>
    </div>
  );
}
