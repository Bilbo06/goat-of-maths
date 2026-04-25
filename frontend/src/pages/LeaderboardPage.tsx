import { useNavigate } from 'react-router-dom';
import { useGame } from '../contexts/GameContext';
import { MOCK_LEADERBOARD } from '../data/constants';
import { computeGradeProgress } from '../utils/grades';

export default function LeaderboardPage() {
  const { state } = useGame();
  const navigate = useNavigate();
  const darkMode = state.darkMode;
  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const textClass = darkMode ? 'text-white' : 'text-gray-800';
  const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-600';

  const progress = computeGradeProgress(state.userData.totalXP);

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div>
      <h2 className={`text-2xl font-bold ${textClass} mb-4 text-center`}>🏆 Classement</h2>

      <div className={`${cardBg} rounded-xl shadow-xl p-4 border-2 border-amber-900 mb-4 cursor-pointer hover:scale-[1.01] transition-transform`}
        onClick={() => navigate(`/profil/${encodeURIComponent(state.userData.name)}`)}
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 theme-gradient-br rounded-full flex items-center justify-center text-xl font-bold text-white border-2 border-amber-900">
            {state.userData.avatar || state.userData.name.charAt(0)}
          </div>
          <div className="flex-1">
            <div className={`font-bold ${textClass}`}>{state.userData.name}</div>
            <div className={`text-xs ${textSecondary}`}>
              Niv. {progress.level} • Rang #4
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {MOCK_LEADERBOARD.map((entry) => {
          const medal = entry.rank <= 3 ? medals[entry.rank - 1] : '';
          const isOwn = entry.name === state.userData.name;

          return (
            <div
              key={entry.rank}
              className={`${cardBg} rounded-xl p-4 border-2 ${
                isOwn ? 'theme-border' : 'border-amber-900'
              } shadow-lg flex items-center gap-3 cursor-pointer hover:scale-[1.01] transition-transform`}
              onClick={() => navigate(`/profil/${encodeURIComponent(entry.name)}`)}
            >
              <div className="w-10 text-center text-xl font-bold">
                {medal || <span className={textSecondary}>#{entry.rank}</span>}
              </div>
              <div className="w-10 h-10 theme-gradient-br rounded-full flex items-center justify-center text-lg font-bold text-white border-2 border-amber-900">
                {entry.name.charAt(0)}
              </div>
              <div className="flex-1">
                <div className={`font-bold ${textClass}`}>
                  {entry.name} {isOwn && '(toi)'}
                </div>
                <div className={`text-xs ${textSecondary}`}>
                  Niv. {entry.level} • {entry.grade}
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold theme-text">{entry.xp.toLocaleString()}</div>
                <div className={`text-xs ${textSecondary}`}>XP</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
