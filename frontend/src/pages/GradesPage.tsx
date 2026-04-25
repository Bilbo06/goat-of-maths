import { useGame } from '../contexts/GameContext';
import { useNavigate } from 'react-router-dom';
import { THEMES } from '../data/constants';
import { GRADES, XP_PER_LEVEL } from '../utils/grades';

export default function GradesPage() {
  const { state } = useGame();
  const navigate = useNavigate();
  const darkMode = state.darkMode;
  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const textClass = darkMode ? 'text-white' : 'text-gray-800';
  const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-600';
  const theme = THEMES.find((t) => t.id === state.userData.theme) || THEMES[0];

  const currentLevel = Math.floor(state.userData.totalXP / XP_PER_LEVEL) + 1;
  const currentGradeIndex = GRADES.reduce((acc, g, i) => (currentLevel >= g.levelReq ? i : acc), 0);

  return (
    <div>
      <button onClick={() => navigate(-1)} className={`text-sm font-bold ${textSecondary} hover:underline mb-4`}>
        ← Retour
      </button>

      <div className={`${cardBg} rounded-xl shadow-xl p-5 border-2 border-amber-900 mb-4`}>
        <h2 className={`text-xl font-bold ${textClass} text-center mb-1`}>🏆 Grades & Niveaux</h2>
        <p className={`text-xs text-center ${textSecondary} mb-4`}>
          Niveau actuel : <strong className={textClass}>{currentLevel}</strong> — {XP_PER_LEVEL} XP par niveau
        </p>

        <div className="space-y-2">
          {GRADES.map((grade, i) => {
            const reached = currentLevel >= grade.levelReq;
            const isCurrent = i === currentGradeIndex;
            const nextGrade = GRADES[i + 1];
            const levelsInGrade = nextGrade ? nextGrade.levelReq - grade.levelReq : '∞';

            return (
              <div
                key={grade.name}
                className={`flex items-center gap-3 p-3 rounded-lg border-2 ${
                  isCurrent
                    ? 'border-green-500 bg-green-500/10'
                    : reached
                    ? 'border-amber-900 ' + (darkMode ? 'bg-gray-700' : 'bg-amber-50')
                    : 'border-amber-900/40 ' + (darkMode ? 'bg-gray-700/40' : 'bg-gray-50')
                }`}
              >
                <span className={`text-3xl ${!reached ? 'grayscale opacity-40' : ''}`}>{grade.emoji}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`font-bold text-sm ${reached ? textClass : textSecondary}`}>
                      {grade.name}
                    </span>
                    {isCurrent && (
                      <span className="text-[10px] bg-green-500 text-white font-bold px-2 py-0.5 rounded-full">
                        Actuel
                      </span>
                    )}
                    {!reached && (
                      <span className="text-[10px] bg-gray-500 text-white font-bold px-2 py-0.5 rounded-full">
                        🔒
                      </span>
                    )}
                  </div>
                  <div className={`text-[11px] ${textSecondary}`}>
                    Niv. {grade.levelReq}{typeof levelsInGrade === 'number' ? ` → ${nextGrade!.levelReq - 1}` : '+'} ({typeof levelsInGrade === 'number' ? `${levelsInGrade} niveaux` : 'illimité'})
                  </div>
                  <div className={`text-[10px] ${textSecondary}`}>
                    {(grade.levelReq - 1) * XP_PER_LEVEL} XP requis
                  </div>
                </div>
                {isCurrent && (
                  <div className="text-right">
                    <div className="text-sm font-bold theme-text">{currentLevel}</div>
                    <div className={`text-[10px] ${textSecondary}`}>Niv. actuel</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className={`${cardBg} rounded-xl shadow-xl p-5 border-2 border-amber-900`}>
        <h3 className={`font-bold ${textClass} mb-3 text-center`}>📊 Progression</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className={`text-xs ${textSecondary}`}>XP total</span>
            <span className={`text-xs font-bold ${textClass}`}>{state.userData.totalXP.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className={`text-xs ${textSecondary}`}>Niveau</span>
            <span className={`text-xs font-bold ${textClass}`}>{currentLevel}</span>
          </div>
          <div className="flex justify-between">
            <span className={`text-xs ${textSecondary}`}>XP prochain niveau</span>
            <span className={`text-xs font-bold ${textClass}`}>
              {state.userData.totalXP % XP_PER_LEVEL}/{XP_PER_LEVEL}
            </span>
          </div>
          {(() => {
            const nextG = GRADES[currentGradeIndex + 1];
            if (!nextG) return null;
            const xpForNext = (nextG.levelReq - 1) * XP_PER_LEVEL;
            const remaining = xpForNext - state.userData.totalXP;
            return (
              <div className="flex justify-between">
                <span className={`text-xs ${textSecondary}`}>Prochain grade ({nextG.emoji} {nextG.name})</span>
                <span className="text-xs font-bold" style={{ color: theme.primary }}>
                  {remaining.toLocaleString()} XP restants
                </span>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
