import { useEffect, useState } from 'react';
import { useGame } from '../contexts/GameContext';
import { playBadgeUnlock } from '../utils/sounds';

export default function BadgeUnlockNotification() {
  const { state } = useGame();
  const [prevCount, setPrevCount] = useState(state.badges.filter((b) => b.unlocked).length);
  const [showPopup, setShowPopup] = useState(false);
  const [newBadge, setNewBadge] = useState<typeof state.badges[0] | null>(null);

  useEffect(() => {
    const currentCount = state.badges.filter((b) => b.unlocked).length;
    if (currentCount > prevCount) {
      const newlyUnlocked = state.badges.find((b) => b.unlocked && b.unlockedAt && new Date(b.unlockedAt).getTime() > Date.now() - 5000);
      if (newlyUnlocked) {
        playBadgeUnlock();
        setNewBadge(newlyUnlocked);
        setShowPopup(true);
        const timer = setTimeout(() => setShowPopup(false), 4000);
        setPrevCount(currentCount);
        return () => clearTimeout(timer);
      }
    }
    setPrevCount(currentCount);
  }, [state.badges, prevCount]);

  if (!showPopup || !newBadge) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={() => setShowPopup(false)}>
      <div className="bg-gradient-to-br from-purple-500 via-indigo-600 to-blue-700 rounded-2xl shadow-2xl p-6 border-2 border-purple-300 max-w-sm w-full text-center text-white" onClick={(e) => e.stopPropagation()}>
        <div className="text-6xl mb-3 animate-bounce">{newBadge.icon}</div>
        <h2 className="text-xl font-bold mb-1">🏅 Badge débloqué !</h2>
        <p className="text-2xl font-black mb-2">{newBadge.name}</p>
        <p className="text-sm opacity-90">{newBadge.description}</p>
      </div>
    </div>
  );
}
