import { useState, useCallback } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useGame } from '../contexts/GameContext';
import { THEMES } from '../data/constants';
import { GRADES } from '../utils/grades';
import { isSoundEnabled, setSoundEnabled, playClick } from '../utils/sounds';
import LevelUpModal from './LevelUpModal';
import GradeUpNotification from './GradeUpNotification';
import OnboardingModal from './OnboardingModal';
import BadgeUnlockNotification from './BadgeUnlockNotification';

const NAV_ITEMS = [
  { to: '/', label: '🏠 Home', end: true },
  { to: '/entrainement', label: '🏋️ Train' },
  { to: '/missions', label: '🎯 Missions' },
  { to: '/boutique', label: '🛒 Shop' },
  { to: '/foyer', label: '💬 Chat' },
  { to: '/amis', label: '👥 Amis' },
  { to: '/duels', label: '⚔️ Duels' },
  { to: '/guildes', label: '🏰 Guildes' },
  { to: '/classement', label: '🏆 Top' },
  { to: '/grades', label: '📊 Grades' },
  { to: '/badges', label: '🏅 Badges' },
];

export default function Layout({ isAdmin }: { isAdmin?: boolean }) {
  const { logout } = useAuth();
  const { state, gradeProgress, toggleDarkMode } = useGame();
  const darkMode = state.darkMode;
  const grade = GRADES[gradeProgress.gradeIndex];
  const theme = THEMES.find((t) => t.id === state.userData.theme) || THEMES[0];
  const gradient = `linear-gradient(to right, ${theme.primary}, ${theme.secondary})`;
  const [soundOn, setSoundOn] = useState(() => isSoundEnabled());

  const toggleSound = useCallback(() => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
    if (next) playClick();
  }, [soundOn]);

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-amber-50'}`} data-theme={theme.id !== 'default' ? theme.id : undefined}>
      <header className="shadow-lg border-b-2 border-amber-900" style={{ background: gradient }}>
        <div className="px-3 py-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className={`text-3xl ${state.userData.equippedDecoration === 6 ? 'drop-shadow-[0_0_6px_rgba(234,179,8,0.8)]' : ''}`}>{state.userData.avatar || '🐐'}</span>
              <h1 className="text-xl font-bold text-white">GOAT OF MATHS</h1>
            </div>
            <div className="flex items-center space-x-2">
              <div className="bg-white/20 backdrop-blur px-2 py-1 rounded-lg">
                <span className="text-white font-bold text-xs">
                  {grade.emoji} {grade.name} — Niv.{gradeProgress.level}
                </span>
              </div>
              <div className="bg-white/20 backdrop-blur px-2 py-1 rounded-lg">
                <span className="text-white font-bold text-xs">🪙 {state.userData.coins}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end space-x-2">
            <button
              onClick={toggleSound}
              className="bg-white/20 backdrop-blur p-2 rounded-lg hover:bg-white/30 transition-colors"
            >
              <span className="text-xl">{soundOn ? '🔊' : '🔇'}</span>
            </button>
            <button
              onClick={toggleDarkMode}
              className="bg-white/20 backdrop-blur p-2 rounded-lg hover:bg-white/30 transition-colors"
            >
              <span className="text-xl">{darkMode ? '☀️' : '🌙'}</span>
            </button>
            <button
              onClick={logout}
              className="bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-2 text-sm rounded-lg transition-colors"
            >
              Déconnexion
            </button>
            {isAdmin && (
              <NavLink
                to="/admin"
                className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-3 py-2 text-sm rounded-lg transition-colors"
              >
                Admin
              </NavLink>
            )}
          </div>
          {state.userData.boostXPUntil && new Date(state.userData.boostXPUntil) > new Date() && (
            <div className="mt-2 bg-yellow-400/90 text-yellow-900 font-bold text-xs text-center py-1 rounded-lg animate-pulse">
              ⚡ DOUBLE XP ACTIF — jusqu'à {new Date(state.userData.boostXPUntil).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            </div>
          )}
        </div>
      </header>

      <nav className={`overflow-x-auto border-b-2 border-amber-900 ${darkMode ? 'bg-gray-800' : 'bg-amber-50'}`}>
        <div className="px-2 py-2">
          <div className="flex gap-2 min-w-max">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `px-4 py-3 font-bold text-sm rounded-lg transition-all whitespace-nowrap ${
                    isActive
                      ? 'text-white shadow-lg'
                      : `${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`
                  }`
                }
                style={({ isActive }) => isActive ? { background: gradient } : undefined}
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
      </nav>

      <main className="px-3 py-4">
        <Outlet />
      </main>

      <LevelUpModal />
      <GradeUpNotification />
      <OnboardingModal />
      <BadgeUnlockNotification />
    </div>
  );
}
