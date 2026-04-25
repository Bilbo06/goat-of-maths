import type { Mission } from '../types';

interface MissionCardProps {
  mission: Mission;
  darkMode: boolean;
}

export default function MissionCard({ mission, darkMode }: MissionCardProps) {
  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const textClass = darkMode ? 'text-white' : 'text-gray-800';
  const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-600';

  return (
    <div className={`${cardBg} rounded-xl shadow-xl p-4 border-2 border-amber-900 ${mission.completed ? 'opacity-70' : ''}`}>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${
          mission.completed
            ? 'bg-green-500 text-white'
            : darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-500'
        }`}>
          {mission.completed ? '✓' : '⏳'}
        </div>
        <div className="flex-1">
          <h3 className={`font-bold text-sm ${textClass}`}>{mission.title}</h3>
          <p className={`text-xs ${textSecondary}`}>{mission.desc}</p>
        </div>
        <div className="text-right">
          <div className="text-xs theme-text font-bold">+{mission.xp} XP</div>
          <div className="text-xs text-yellow-500 font-bold">+{mission.coins} 🪙</div>
        </div>
      </div>
    </div>
  );
}
