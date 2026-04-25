import { useGame } from '../contexts/GameContext';

export default function DailyRewardPopup() {
  const { state, claimDailyReward } = useGame();
  const darkMode = state.darkMode;
  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const textClass = darkMode ? 'text-white' : 'text-gray-800';
  const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-600';

  const streakDay = ((state.userData.streak - 1) % 7) + 1;
  const currentReward = state.dailyRewards.find((r) => r.day === streakDay);
  const isClaimed = currentReward?.claimed ?? true;

  if (isClaimed) return null;

  return (
    <div className={`${cardBg} rounded-xl shadow-xl p-4 border-2 border-amber-900 mb-4`}>
      <div className="text-center mb-3">
        <div className="text-3xl mb-1">🎁</div>
        <h3 className={`text-lg font-bold ${textClass}`}>Récompense du jour !</h3>
        <p className={`text-xs ${textSecondary}`}>
          Série de {state.userData.streak} jour{state.userData.streak > 1 ? 's' : ''} • Jour {streakDay}/7
        </p>
      </div>

      <div className="flex gap-2 justify-center mb-3">
        {state.dailyRewards.map((r) => (
          <div
            key={r.day}
            className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center border-2 text-xs font-bold ${
              r.day === streakDay
                ? 'theme-border ' + (darkMode ? 'bg-orange-900/30' : 'bg-orange-50')
                : r.claimed
                  ? 'border-green-500 ' + (darkMode ? 'bg-green-900/30' : 'bg-green-50')
                  : 'border-gray-300 ' + (darkMode ? 'bg-gray-700' : 'bg-gray-100')
            }`}
          >
            <span className="text-sm">{r.day === streakDay ? '🎁' : r.claimed ? '✓' : r.icon}</span>
            <span className={`text-[8px] ${textSecondary}`}>J{r.day}</span>
          </div>
        ))}
      </div>

      {currentReward && (
        <div className={`flex items-center justify-between ${darkMode ? 'bg-gray-700' : 'bg-amber-50'} rounded-lg p-3 border-2 border-amber-900 mb-3`}>
          <div>
            <div className={`font-bold ${textClass}`}>{currentReward.icon} Jour {currentReward.day}</div>
            <div className={`text-xs ${textSecondary}`}>
              +{currentReward.xp} XP • +{currentReward.coins} 🪙
            </div>
          </div>
          <button
            onClick={() => claimDailyReward(streakDay)}
            className="theme-gradient text-white font-bold px-4 py-2 rounded-xl border-2 border-amber-900 hover:scale-105 transition-transform text-sm"
          >
            Récupérer
          </button>
        </div>
      )}

      <div className={`text-center text-xs ${textSecondary}`}>
        {state.userData.streak >= 7 ? '🔥 Bonus streak 7j+ actif ! (+50 🪙/jour)' : `🔥 Encore ${7 - state.userData.streak % 7} jours pour le bonus max !`}
      </div>
    </div>
  );
}
