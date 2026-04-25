import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../contexts/GameContext';
import { MOCK_LEADERBOARD } from '../data/constants';
import { computeGradeProgress } from '../utils/grades';

const MOCK_PROFILES: Record<string, { level: number; online: boolean }> = {
  'Emma Martin': { level: 15, online: true },
  'Thomas Bernard': { level: 8, online: false },
  'Léa Dubois': { level: 22, online: true },
  'Hugo Petit': { level: 12, online: false },
  'Chloé Rousseau': { level: 18, online: true },
  'Sophie Laurent': { level: 72, online: false },
  'Antoine Moreau': { level: 55, online: true },
  'Marie Fontaine': { level: 42, online: false },
  'Jules Girard': { level: 28, online: true },
};

const GRADE_NAMES = ['Novice', 'Calculateur', 'Algébriste', 'Géomètre', 'Analyste', 'Mathématicien', 'Professeur', 'GOAT'];
const GRADE_LEVELS = [1, 10, 20, 35, 50, 70, 100, 150];

function getGrade(level: number): string {
  let grade = 'Novice';
  for (let i = GRADE_LEVELS.length - 1; i >= 0; i--) {
    if (level >= GRADE_LEVELS[i]) { grade = GRADE_NAMES[i]; break; }
  }
  return grade;
}

export default function FriendsPage() {
  const { state, addFriend, removeFriend } = useGame();
  const navigate = useNavigate();
  const darkMode = state.darkMode;
  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const textClass = darkMode ? 'text-white' : 'text-gray-800';
  const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-600';
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);

  const friends = state.friends.map((name) => {
    const mock = MOCK_PROFILES[name];
    const progress = computeGradeProgress(state.userData.totalXP);
    const isOwn = name === state.userData.name;
    return {
      name,
      level: isOwn ? progress.level : mock?.level ?? 1,
      online: mock?.online ?? false,
      grade: isOwn ? GRADE_NAMES[progress.gradeIndex] : getGrade(mock?.level ?? 1),
    };
  });

  const onlineFriends = friends.filter((f) => f.online);
  const offlineFriends = friends.filter((f) => !f.online);

  const allPlayers = MOCK_LEADERBOARD.map((e) => e.name).filter(
    (n) => n !== state.userData.name && !state.friends.includes(n)
  );
  const filteredPlayers = search.trim()
    ? allPlayers.filter((n) => n.toLowerCase().includes(search.toLowerCase()))
    : [];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className={`text-2xl font-bold ${textClass}`}>👥 Mes Amis</h2>
        <button
          onClick={() => setShowAdd(!showAdd)}
          disabled={state.friends.length >= 50}
          className="theme-gradient text-white font-bold px-4 py-3 text-sm rounded-xl border-2 border-amber-900 disabled:opacity-40"
        >
          + Ajouter
        </button>
      </div>

      <div className={`p-4 rounded-xl border-2 border-amber-900 mb-4 ${cardBg} shadow-xl`}>
        <div className="flex justify-around text-center">
          <div>
            <div className="text-2xl font-bold text-green-500">{onlineFriends.length}</div>
            <div className={`text-xs font-bold ${textSecondary}`}>En ligne</div>
          </div>
          <div>
            <div className="text-2xl font-bold theme-text">{friends.length}</div>
            <div className={`text-xs font-bold ${textSecondary}`}>Total</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-500">{50 - friends.length}</div>
            <div className={`text-xs font-bold ${textSecondary}`}>Places</div>
          </div>
        </div>
      </div>

      {showAdd && (
        <div className={`${cardBg} rounded-xl shadow-xl p-4 border-2 border-amber-900 mb-4`}>
          <h3 className={`font-bold ${textClass} mb-3`}>🔍 Ajouter un ami</h3>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Chercher un joueur..."
            className={`w-full px-4 py-3 border-2 border-amber-900 rounded-xl font-bold mb-3 focus:outline-none ${darkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'}`}
          />
          {search.trim() && filteredPlayers.length === 0 && (
            <p className={`text-sm text-center ${textSecondary}`}>Aucun joueur trouvé</p>
          )}
          {filteredPlayers.length > 0 && (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {filteredPlayers.map((name) => (
                <div key={name} className={`flex items-center justify-between p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-amber-50'} border-2 border-amber-900`}>
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full theme-gradient-br flex items-center justify-center text-sm font-bold text-white border border-amber-900">
                      {name.charAt(0)}
                    </div>
                    <span className={`font-bold text-sm ${textClass}`}>{name}</span>
                  </div>
                  <button
                    onClick={() => { addFriend(name); setSearch(''); setShowAdd(false); }}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2 text-sm rounded-lg border-2 border-amber-900"
                  >
                    + Ajouter
                  </button>
                </div>
              ))}
            </div>
          )}
          <p className={`text-[10px] mt-2 text-center ${textSecondary}`}>
            {state.friends.length}/50 amis
          </p>
        </div>
      )}

      {confirmRemove && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className={`${cardBg} rounded-2xl shadow-2xl p-6 border-2 border-amber-900 max-w-sm w-full text-center`}>
            <div className="text-4xl mb-3">👋</div>
            <p className={`font-bold ${textClass} mb-4`}>Retirer {confirmRemove} de tes amis ?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmRemove(null)}
                className="flex-1 bg-gray-500 text-white font-bold py-3 rounded-xl border-2 border-amber-900"
              >
                Annuler
              </button>
              <button
                onClick={() => { removeFriend(confirmRemove); setConfirmRemove(null); }}
                className="flex-1 bg-red-600 text-white font-bold py-3 rounded-xl border-2 border-amber-900"
              >
                Retirer
              </button>
            </div>
          </div>
        </div>
      )}

      {onlineFriends.length > 0 && (
        <div className="mb-4">
          <h3 className={`text-sm font-bold mb-2 ${textSecondary}`}>🟢 En ligne ({onlineFriends.length})</h3>
          <div className="space-y-2">
            {onlineFriends.map((friend) => (
              <FriendCard key={friend.name} name={friend.name} level={friend.level} grade={friend.grade} online={true} darkMode={darkMode} onChat={() => navigate(`/chat/${encodeURIComponent(friend.name)}`)} onRemove={() => setConfirmRemove(friend.name)} />
            ))}
          </div>
        </div>
      )}

      {offlineFriends.length > 0 && (
        <div>
          <h3 className={`text-sm font-bold mb-2 ${textSecondary}`}>⚫ Hors ligne ({offlineFriends.length})</h3>
          <div className="space-y-2">
            {offlineFriends.map((friend) => (
              <FriendCard key={friend.name} name={friend.name} level={friend.level} grade={friend.grade} online={false} darkMode={darkMode} onChat={() => navigate(`/chat/${encodeURIComponent(friend.name)}`)} onRemove={() => setConfirmRemove(friend.name)} />
            ))}
          </div>
        </div>
      )}

      {friends.length === 0 && (
        <div className={`${cardBg} rounded-xl p-6 border-2 border-amber-900 text-center`}>
          <div className="text-4xl mb-2">👥</div>
          <p className={`text-sm ${textSecondary}`}>Ajoute des amis pour commencer !</p>
        </div>
      )}
    </div>
  );
}

function FriendCard({ name, level, grade, online, darkMode, onChat, onRemove }: {
  name: string; level: number; grade: string; online: boolean; darkMode: boolean; onChat: () => void; onRemove: () => void;
}) {
  const navigate = useNavigate();
  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const textClass = darkMode ? 'text-white' : 'text-gray-800';
  const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-600';

  return (
    <div
      className={`${cardBg} rounded-xl p-4 border-2 border-amber-900 shadow-lg flex items-center gap-3 cursor-pointer hover:scale-[1.01] transition-transform`}
      onClick={() => navigate(`/profil/${encodeURIComponent(name)}`)}
    >
      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold text-white border-2 border-amber-900 ${
        online ? 'bg-gradient-to-br from-green-400 to-green-600' : 'bg-gray-500'
      }`}>
        {name.charAt(0)}
      </div>
      <div className="flex-1">
        <div className={`font-bold ${textClass}`}>{name}</div>
        <div className={`text-xs ${textSecondary}`}>
          Niv. {level} • {grade}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <button
          onClick={(e) => { e.stopPropagation(); onChat(); }}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-3 text-sm rounded-lg border-2 border-amber-900 w-full"
        >
          💬 Discuter
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 text-xs rounded-lg border-2 border-amber-900 w-full"
        >
          ✗ Retirer
        </button>
      </div>
    </div>
  );
}
