import { useNavigate } from 'react-router-dom';
import { useGame } from '../contexts/GameContext';
import StatCard from '../components/StatCard';
import DailyRewardPopup from '../components/DailyRewardPopup';
import BackpackSection from '../components/BackpackSection';
import { THEMES } from '../data/constants';
import { GRADES } from '../utils/grades';

export default function DashboardPage() {
  const { state, gradeProgress } = useGame();
  const navigate = useNavigate();
  const darkMode = state.darkMode;
  const grade = GRADES[gradeProgress.gradeIndex];
  const xpPercent = Math.round((gradeProgress.xpInCurrentLevel / gradeProgress.xpForNextLevel) * 100);
  const theme = THEMES.find((t) => t.id === state.userData.theme) || THEMES[0];

  const nextGrade = GRADES[gradeProgress.gradeIndex + 1];
  const gradeLevelReq = grade.levelReq;
  const nextGradeLevelReq = nextGrade ? nextGrade.levelReq : gradeLevelReq;
  const levelsInGrade = nextGradeLevelReq - gradeLevelReq;
  const levelsDone = gradeProgress.level - gradeLevelReq;
  const gradeProgressPercent = levelsInGrade > 0 ? Math.min(Math.round((levelsDone / levelsInGrade) * 100), 100) : 100;

  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const textClass = darkMode ? 'text-white' : 'text-gray-800';
  const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-600';

  return (
    <div className="space-y-4">
      <DailyRewardPopup />

      <div className={`${cardBg} rounded-xl shadow-xl p-4 border-2 border-amber-900`}>
        <div className="flex items-center space-x-4 mb-4">
          <div className="relative">
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white border-2 cursor-pointer hover:scale-110 transition-transform ${
                state.userData.equippedDecoration === 6 ? 'border-yellow-400 shadow-[0_0_12px_2px_rgba(234,179,8,0.6)]' : 'border-amber-900'
              }`}
              style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})` }}
              onClick={() => navigate(`/profil/${encodeURIComponent(state.userData.name)}`)}
            >
              {state.userData.avatar || state.userData.name.charAt(0)}
            </div>
          </div>
          <div className="flex-1">
            <h2 className={`text-xl font-bold ${textClass}`}>
              {state.userData.name}
              {state.userData.equippedDecoration === 7 && <span className="text-yellow-400 ml-1">⭐</span>}
            </h2>
            <div className="flex items-center space-x-2 mt-1 cursor-pointer hover:opacity-80" onClick={() => navigate('/grades')}>
              <span className="text-2xl">{grade.emoji}</span>
              <span className="text-sm font-bold" style={{ color: theme.primary }}>
                {grade.name} — Niv. {gradeProgress.level}
              </span>
              <span className="text-xs text-gray-400">▸</span>
            </div>
          </div>
        </div>

        <div>
          <div className="flex justify-between mb-1">
            <span className={`font-bold text-xs ${textSecondary}`}>Progression</span>
            <span className="font-bold text-xs" style={{ color: theme.primary }}>
              {gradeProgress.xpInCurrentLevel}/{gradeProgress.xpForNextLevel} XP
            </span>
          </div>
          <div className="h-6 bg-gray-300 rounded-full overflow-hidden border-2 border-black">
            <div
              className="h-full transition-all duration-500 flex items-center justify-center"
              style={{ width: `${xpPercent}%`, background: `linear-gradient(to right, ${theme.primary}, ${theme.secondary})` }}
            >
              {xpPercent > 10 && <span className="text-white font-bold text-xs">{xpPercent}%</span>}
            </div>
          </div>
        </div>

        {nextGrade && (
          <div className={`mt-3 ${darkMode ? 'bg-gray-700' : 'bg-amber-50'} rounded-lg p-3 border-2 border-amber-900`}>
            <div className="flex items-center justify-between mb-1">
              <span className={`text-xs font-bold ${textSecondary}`}>
                Prochain grade : {nextGrade.emoji} {nextGrade.name}
              </span>
              <span className="text-xs font-bold" style={{ color: theme.primary }}>
                Niv. {gradeProgress.level}/{nextGradeLevelReq}
              </span>
            </div>
            <div className="h-3 bg-gray-300 rounded-full overflow-hidden border border-black">
              <div
                className="h-full transition-all duration-500"
                style={{ width: `${gradeProgressPercent}%`, background: `linear-gradient(to right, ${theme.primary}, ${theme.secondary})` }}
              />
            </div>
            <p className={`text-[10px] mt-1 text-center ${textSecondary}`}>
              {levelsDone}/{levelsInGrade} niveaux dans ce grade • {gradeProgressPercent}%
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatCard icon="❤️" label="HP" value={state.userData.hp} max={state.userData.maxHp} color="red" darkMode={darkMode} theme={theme} />
        <StatCard icon="⚔️" label="Force" value={state.userData.force} color="orange" darkMode={darkMode} theme={theme} />
        <StatCard icon="🪙" label="Coins" value={state.userData.coins} color="yellow" darkMode={darkMode} theme={theme} />
        <StatCard icon="🔥" label="Série" value={state.userData.streak} unit="j" color="orange" darkMode={darkMode} theme={theme} />
      </div>

      {state.badges.filter((b) => b.unlocked).length > 0 && (
        <div className={`${cardBg} rounded-xl shadow-xl p-4 border-2 border-amber-900`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className={`font-bold ${textClass}`}>🏅 Badges</h3>
            <button onClick={() => navigate('/badges')} className={`text-xs ${textSecondary} hover:underline`}>
              Tout voir →
            </button>
          </div>
          <div className="flex gap-2 flex-wrap">
            {state.badges.filter((b) => b.unlocked).slice(0, 6).map((badge) => (
              <span key={badge.id} className="text-2xl" title={`${badge.name}: ${badge.description}`}>
                {badge.icon}
              </span>
            ))}
          </div>
        </div>
      )}

      {state.userData.statPoints > 0 && (
        <div className={`${cardBg} rounded-xl shadow-xl p-4 border-2 text-center`} style={{ borderColor: theme.primary }}>
          <p className="font-bold" style={{ color: theme.primary }}>⬆️ {state.userData.statPoints} point{state.userData.statPoints > 1 ? 's' : ''} de stat à répartir !</p>
        </div>
      )}

      <div className={`${cardBg} rounded-xl shadow-xl p-4 border-2 border-amber-900`}>
        <h3 className={`text-lg font-bold ${textClass} mb-3 text-center`}>📊 Stats du jour</h3>
          <div className="grid grid-cols-3 gap-3 text-center">
          <div className={`${darkMode ? 'bg-gray-700' : 'bg-amber-50'} rounded-lg p-3 border-2 border-amber-900`}>
            <div className="text-2xl font-bold" style={{ color: theme.primary }}>{state.trainingState.todayCount}/5</div>
            <div className={`text-xs font-bold ${textSecondary}`}>Training</div>
          </div>
          <div className={`${darkMode ? 'bg-gray-700' : 'bg-amber-50'} rounded-lg p-3 border-2 border-amber-900`}>
            <div className="text-2xl font-bold" style={{ color: theme.primary }}>{state.duelState.todayDuels}</div>
            <div className={`text-xs font-bold ${textSecondary}`}>Duels</div>
          </div>
          <div className={`${darkMode ? 'bg-gray-700' : 'bg-amber-50'} rounded-lg p-3 border-2 border-amber-900`}>
            <div className="text-2xl font-bold" style={{ color: theme.primary }}>
              {state.missions.filter((m) => m.completed).length}/{state.missions.length}
            </div>
            <div className={`text-xs font-bold ${textSecondary}`}>Missions</div>
          </div>
        </div>
      </div>

      {state.guildState.myGuildId && (() => {
        const g = state.guildState.guilds.find((gg) => gg.id === state.guildState.myGuildId);
        if (!g) return null;
        const role = g.chef === state.userData.name ? '👑 Chef' : g.chefAdjoint === state.userData.name ? '⭐ Adjoint' : '👥 Membre';
        return (
          <div
            className={`${cardBg} rounded-xl shadow-xl p-4 border-2 border-amber-900 cursor-pointer hover:scale-[1.01] transition-transform`}
            onClick={() => navigate('/guildes')}
          >
            <div className="flex items-center gap-3">
              <div className="text-4xl">{g.emoji}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className={`font-bold ${textClass}`}>{g.name}</h3>
                  <span className="text-xs font-bold" style={{ color: theme.primary }}>{role}</span>
                </div>
                <div className={`text-xs ${textSecondary}`}>
                  👥 {g.memberNames.length}/{g.maxMembers} • Trésor : {g.treasury.toLocaleString()} 🪙
                </div>
                <div className="mt-2 h-2 bg-gray-300 rounded-full overflow-hidden border border-black">
                  <div className="h-full theme-progress" style={{ width: `${(g.memberNames.length / g.maxMembers) * 100}%` }} />
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      <BackpackSection />
    </div>
  );
}
