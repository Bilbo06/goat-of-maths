import { useNavigate } from 'react-router-dom';
import { useGame } from '../contexts/GameContext';

export default function BadgesPage() {
  const { state } = useGame();
  const navigate = useNavigate();
  const darkMode = state.darkMode;
  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const textClass = darkMode ? 'text-white' : 'text-gray-800';
  const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-600';

  const unlocked = state.badges.filter((b) => b.unlocked);
  const locked = state.badges.filter((b) => !b.unlocked);

  return (
    <div>
      <button onClick={() => navigate(-1)} className={`text-sm font-bold ${textSecondary} hover:underline mb-4`}>
        ← Retour
      </button>

      <h2 className={`text-2xl font-bold ${textClass} mb-2 text-center`}>🏅 Hauts Faits</h2>
      <p className={`text-center text-sm mb-4 ${textSecondary}`}>
        {unlocked.length}/{state.badges.length} débloqués
      </p>

      <div className={`p-3 rounded-xl mb-4 ${cardBg} border-2 border-amber-900`}>
        <div className="h-3 bg-gray-300 rounded-full overflow-hidden border border-black">
          <div
            className="h-full theme-progress transition-all duration-500"
            style={{ width: `${(unlocked.length / state.badges.length) * 100}%` }}
          />
        </div>
      </div>

      {unlocked.length > 0 && (
        <div className="mb-4">
          <h3 className={`text-sm font-bold mb-3 ${textSecondary}`}>✅ Débloqués ({unlocked.length})</h3>
          <div className="grid grid-cols-2 gap-3">
            {unlocked.map((badge) => (
              <div key={badge.id} className={`${cardBg} rounded-xl p-4 border-2 border-green-500 shadow-lg text-center`}>
                <div className="text-4xl mb-2">{badge.icon}</div>
                <div className={`font-bold text-sm ${textClass}`}>{badge.name}</div>
                <div className={`text-[10px] ${textSecondary} mt-1`}>{badge.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {locked.length > 0 && (
        <div>
          <h3 className={`text-sm font-bold mb-3 ${textSecondary}`}>🔒 Verrouillés ({locked.length})</h3>
          <div className="grid grid-cols-2 gap-3">
            {locked.map((badge) => (
              <div key={badge.id} className={`${cardBg} rounded-xl p-4 border-2 border-amber-900 shadow-lg text-center opacity-50`}>
                <div className="text-4xl mb-2 grayscale">{badge.icon}</div>
                <div className={`font-bold text-sm ${textSecondary}`}>{badge.name}</div>
                <div className={`text-[10px] ${textSecondary} mt-1`}>{badge.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
