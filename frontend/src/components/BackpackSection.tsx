import { useGame } from '../contexts/GameContext';

export default function BackpackSection() {
  const { state, useItem } = useGame();
  const darkMode = state.darkMode;
  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const textClass = darkMode ? 'text-white' : 'text-gray-800';
  const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-600';
  const backpack = state.userData.backpack.filter((item) => item.type === 'consumable' || item.type === 'boost');

  if (backpack.length === 0) {
    return (
      <div className={`${cardBg} rounded-xl shadow-xl p-4 border-2 border-amber-900`}>
        <h3 className={`text-lg font-bold ${textClass} mb-2 text-center`}>🎒 Sac à dos</h3>
        <p className={`text-center text-sm ${textSecondary}`}>Ton sac est vide ! Va à la boutique.</p>
      </div>
    );
  }

  const applyItem = useItem;

  return (
    <div className={`${cardBg} rounded-xl shadow-xl p-4 border-2 border-amber-900`}>
      <h3 className={`text-lg font-bold ${textClass} mb-3 text-center`}>🎒 Sac à dos</h3>
      <div className="space-y-2">
        {backpack.map((item) => (
          <div
            key={item.id}
            className={`flex items-center gap-3 p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-amber-50'} border-2 border-amber-900`}
          >
            <div className="text-3xl">{item.icon}</div>
            <div className="flex-1">
              <div className={`font-bold text-sm ${textClass}`}>{item.name}</div>
              <div className={`text-xs ${textSecondary}`}>
                {item.type === 'consumable' && `Quantité : ${item.quantity}`}
                {item.type === 'boost' && `Quantité : ${item.quantity}`}
              </div>
            </div>
            {item.type === 'boost' && (
              <button
                onClick={() => applyItem(item.id)}
                className="text-white font-bold text-sm px-4 py-3 rounded-lg border-2 border-amber-900 hover:scale-105 transition-transform"
                style={{ background: `linear-gradient(to right, var(--color-primary), var(--color-secondary))` }}
              >
                Utiliser
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
