import { useParams, useNavigate } from 'react-router-dom';
import { useGame } from '../contexts/GameContext';
import { MOCK_LEADERBOARD, MOCK_GUILDS, THEMES } from '../data/constants';
import { GRADES, computeGradeProgress } from '../utils/grades';

const MOCK_PROFILES: Record<string, { level: number; totalXP: number; hp: number; maxHp: number; force: number; avatar: string; online: boolean }> = {
  'Emma Martin': { level: 15, totalXP: 4500, hp: 110, maxHp: 110, force: 12, avatar: '👩‍🎓', online: true },
  'Thomas Bernard': { level: 8, totalXP: 1200, hp: 100, maxHp: 100, force: 10, avatar: '👦', online: false },
  'Léa Dubois': { level: 22, totalXP: 8200, hp: 120, maxHp: 120, force: 15, avatar: '👩‍🎓', online: true },
  'Hugo Petit': { level: 12, totalXP: 3000, hp: 105, maxHp: 105, force: 11, avatar: '👦', online: false },
  'Chloé Rousseau': { level: 18, totalXP: 6100, hp: 115, maxHp: 115, force: 13, avatar: '🧑‍🎓', online: true },
  'Sophie Laurent': { level: 45, totalXP: 18500, hp: 150, maxHp: 150, force: 20, avatar: '👩‍🔬', online: true },
  'Antoine Moreau': { level: 42, totalXP: 17200, hp: 145, maxHp: 145, force: 19, avatar: '🧑‍💼', online: false },
  'Marie Fontaine': { level: 38, totalXP: 15800, hp: 140, maxHp: 140, force: 17, avatar: '👩‍🏫', online: true },
  'Jules Girard': { level: 30, totalXP: 12500, hp: 130, maxHp: 130, force: 15, avatar: '🧑', online: false },
};

export default function ProfilePage() {
  const { name } = useParams<{ name: string }>();
  const navigate = useNavigate();
  const { state } = useGame();
  const darkMode = state.darkMode;
  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const textClass = darkMode ? 'text-white' : 'text-gray-800';
  const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-600';
  const decodedName = decodeURIComponent(name || '');

  const isOwn = decodedName === state.userData.name;
  const theme = THEMES.find((t) => t.id === state.userData.theme) || THEMES[0];

  let profileData: {
    name: string;
    avatar: string;
    level: number;
    totalXP: number;
    hp: number;
    maxHp: number;
    force: number;
    online: boolean;
    grade: string;
    gradeEmoji: string;
  };

  if (isOwn) {
    const gp = computeGradeProgress(state.userData.totalXP);
    const grade = GRADES[gp.gradeIndex];
    profileData = {
      name: state.userData.name,
      avatar: state.userData.avatar || state.userData.name.charAt(0),
      level: gp.level,
      totalXP: state.userData.totalXP,
      hp: state.userData.hp,
      maxHp: state.userData.maxHp,
      force: state.userData.force,
      online: true,
      grade: grade.name,
      gradeEmoji: grade.emoji,
    };
  } else {
    const mock = MOCK_PROFILES[decodedName];
    const lbEntry = MOCK_LEADERBOARD.find((e) => e.name === decodedName);
    const gp = mock ? computeGradeProgress(mock.totalXP) : computeGradeProgress(lbEntry?.xp || 500);
    const grade = GRADES[gp.gradeIndex];
    profileData = {
      name: decodedName,
      avatar: mock?.avatar || decodedName.charAt(0),
      level: mock?.level || lbEntry?.level || 1,
      totalXP: mock?.totalXP || lbEntry?.xp || 500,
      hp: mock?.hp || 100,
      maxHp: mock?.maxHp || 100,
      force: mock?.force || 10,
      online: mock?.online ?? true,
      grade: grade.name,
      gradeEmoji: grade.emoji,
    };
  }

  const realGuild = isOwn
    ? state.guildState.guilds.find((g) => g.id === state.guildState.myGuildId) || null
    : state.guildState.guilds.find((g) => g.memberNames.includes(decodedName)) || null;

  const mockGuild = !realGuild ? MOCK_GUILDS.find((g) =>
    g.name.includes('Matheux') ? ['Emma Martin', 'Léa Dubois', 'Chloé Rousseau', 'Sophie Laurent'].includes(decodedName) :
    g.name.includes('Pythagore') ? ['Thomas Bernard', 'Hugo Petit', 'Jules Girard'].includes(decodedName) :
    g.name.includes('Génies') ? ['Antoine Moreau', 'Marie Fontaine'].includes(decodedName) :
    false
  ) : null;

  const displayGuild = realGuild || mockGuild || null;

  const gp = computeGradeProgress(profileData.totalXP);
  const xpPercent = Math.round((gp.xpInCurrentLevel / gp.xpForNextLevel) * 100);
  const nextGrade = GRADES[gp.gradeIndex + 1];

  return (
    <div>
      <button
        onClick={() => navigate(-1)}
        className={`flex items-center gap-1 mb-4 font-bold text-sm ${textSecondary} hover:underline`}
      >
        ← Retour
      </button>

      <div className={`${cardBg} rounded-xl shadow-xl p-5 border-2 border-amber-900 mb-4`}>
        <div className="flex items-center space-x-4 mb-4">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold text-white border-2 border-amber-900"
            style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})` }}
          >
            {profileData.avatar}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className={`text-xl font-bold ${textClass}`}>{profileData.name}</h2>
              {isOwn && <span className="text-xs bg-green-500 text-white font-bold px-2 py-0.5 rounded-full">Toi</span>}
            </div>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-2xl">{profileData.gradeEmoji}</span>
              <span className="text-sm font-bold" style={{ color: theme.primary }}>
                {profileData.grade} — Niv. {gp.level}
              </span>
            </div>
            <div className="flex items-center gap-1 mt-1">
              <span className={`w-2 h-2 rounded-full ${profileData.online ? 'bg-green-500' : 'bg-gray-400'}`} />
              <span className={`text-xs ${profileData.online ? 'text-green-500' : textSecondary}`}>
                {profileData.online ? 'En ligne' : 'Hors ligne'}
              </span>
            </div>
          </div>
        </div>

        <div>
          <div className="flex justify-between mb-1">
            <span className={`font-bold text-xs ${textSecondary}`}>Progression</span>
            <span className="font-bold text-xs" style={{ color: theme.primary }}>
              {gp.xpInCurrentLevel}/{gp.xpForNextLevel} XP
            </span>
          </div>
          <div className="h-5 bg-gray-300 rounded-full overflow-hidden border-2 border-black">
            <div
              className="h-full transition-all duration-500 flex items-center justify-center"
              style={{ width: `${xpPercent}%`, background: `linear-gradient(to right, ${theme.primary}, ${theme.secondary})` }}
            >
              {xpPercent > 10 && <span className="text-white font-bold text-[10px]">{xpPercent}%</span>}
            </div>
          </div>
          {nextGrade && (
            <div className={`mt-2 text-center text-xs ${textSecondary}`}>
              Prochain : {nextGrade.emoji} {nextGrade.name}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className={`${cardBg} rounded-xl shadow-xl p-4 border-2 border-amber-900 text-center`}>
          <div className="text-3xl mb-1">❤️</div>
          <div className={`text-lg font-bold ${textClass}`}>{profileData.hp}/{profileData.maxHp}</div>
          <div className={`text-xs font-bold ${textSecondary}`}>HP</div>
        </div>
        <div className={`${cardBg} rounded-xl shadow-xl p-4 border-2 border-amber-900 text-center`}>
          <div className="text-3xl mb-1">⚔️</div>
          <div className={`text-lg font-bold ${textClass}`}>{profileData.force}</div>
          <div className={`text-xs font-bold ${textSecondary}`}>Force</div>
        </div>
        <div className={`${cardBg} rounded-xl shadow-xl p-4 border-2 border-amber-900 text-center`}>
          <div className="text-3xl mb-1">⭐</div>
          <div className={`text-lg font-bold ${textClass}`}>{profileData.totalXP.toLocaleString()}</div>
          <div className={`text-xs font-bold ${textSecondary}`}>XP total</div>
        </div>
      </div>

      {isOwn && state.badges.filter((b) => b.unlocked).length > 0 && (
        <div className={`${cardBg} rounded-xl shadow-xl p-4 border-2 border-amber-900 mb-4`}>
          <h3 className={`font-bold ${textClass} mb-2 text-center`}>🏅 Badges ({state.badges.filter((b) => b.unlocked).length}/{state.badges.length})</h3>
          <div className="flex gap-2 flex-wrap justify-center">
            {state.badges.filter((b) => b.unlocked).map((badge) => (
              <span key={badge.id} className="text-2xl" title={`${badge.name}: ${badge.description}`}>
                {badge.icon}
              </span>
            ))}
          </div>
        </div>
      )}

      {displayGuild ? (
        <div className={`${cardBg} rounded-xl shadow-xl p-4 border-2 border-amber-900`}>
          <h3 className={`font-bold ${textClass} mb-3 text-center`}>🏰 Guilde</h3>
          <div className="flex items-center gap-3">
            <div className="text-4xl">{displayGuild.emoji}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className={`font-bold ${textClass}`}>{displayGuild.name}</span>
                {(() => {
                  const role = displayGuild.chef === decodedName ? '👑 Chef' : displayGuild.chefAdjoint === decodedName ? '⭐ Adjoint' : '';
                  return role ? <span className="text-xs font-bold" style={{ color: theme.primary }}>{role}</span> : null;
                })()}
              </div>
              <div className={`text-xs ${textSecondary}`}>
                👥 {displayGuild.memberNames.length}/{displayGuild.maxMembers} • Niv. {displayGuild.level} • Trésor : {displayGuild.treasury.toLocaleString()} 🪙
              </div>
              <div className="mt-2 h-2 bg-gray-300 rounded-full overflow-hidden border border-black">
                <div
                  className="h-full theme-progress"
                  style={{ width: `${(displayGuild.memberNames.length / displayGuild.maxMembers) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className={`${cardBg} rounded-xl shadow-xl p-4 border-2 border-amber-900 text-center`}>
          <div className="text-3xl mb-2">🏰</div>
          <p className={`text-sm ${textSecondary}`}>Pas encore dans une guilde</p>
        </div>
      )}
    </div>
  );
}
