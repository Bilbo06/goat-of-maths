import { useGame } from '../contexts/GameContext';
import MissionCard from '../components/MissionCard';

export default function MissionsPage() {
  const { state } = useGame();
  const darkMode = state.darkMode;
  const textClass = darkMode ? 'text-white' : 'text-gray-800';
  const completedCount = state.missions.filter((m) => m.completed).length;
  const totalXP = state.missions.filter((m) => m.completed).reduce((sum, m) => sum + m.xp, 0);
  const totalCoins = state.missions.filter((m) => m.completed).reduce((sum, m) => sum + m.coins, 0);

  return (
    <div>
      <h2 className={`text-2xl font-bold ${textClass} mb-2 text-center`}>🎯 Missions du jour</h2>
      <p className={`text-center text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        {completedCount}/{state.missions.length} terminées • +{totalXP} XP • +{totalCoins} 🪙
      </p>

      <div className={`p-4 rounded-xl border-2 border-amber-900 mb-4 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-xl`}>
        <div className="h-4 bg-gray-300 rounded-full overflow-hidden border-2 border-black">
          <div
            className="h-full theme-progress transition-all duration-500"
            style={{ width: `${(completedCount / state.missions.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="space-y-3">
        {state.missions.map((mission) => (
          <MissionCard
            key={mission.id}
            mission={mission}
            darkMode={darkMode}
          />
        ))}
      </div>
    </div>
  );
}
