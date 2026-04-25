import { useEffect, useState } from 'react';
import { useGame } from '../contexts/GameContext';
import { GRADES } from '../utils/grades';
import { playLevelUp } from '../utils/sounds';

export default function GradeUpNotification() {
  const { gradeProgress } = useGame();
  const [prevGradeIndex, setPrevGradeIndex] = useState(gradeProgress.gradeIndex);
  const [showPopup, setShowPopup] = useState(false);
  const [newGradeIdx, setNewGradeIdx] = useState(gradeProgress.gradeIndex);

  useEffect(() => {
    const current = gradeProgress.gradeIndex;
    if (current > prevGradeIndex) {
      playLevelUp();
      setNewGradeIdx(current);
      setShowPopup(true);
      const timer = setTimeout(() => setShowPopup(false), 5000);
      setPrevGradeIndex(current);
      return () => clearTimeout(timer);
    }
    setPrevGradeIndex(current);
  }, [gradeProgress.gradeIndex, prevGradeIndex]);

  if (!showPopup) return null;

  const grade = GRADES[newGradeIdx];

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={() => setShowPopup(false)}>
      <div className="bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-600 rounded-2xl shadow-2xl p-6 border-2 border-yellow-300 max-w-sm w-full text-center text-white" onClick={(e) => e.stopPropagation()}>
        <div className="text-6xl mb-3 animate-bounce">{grade.emoji}</div>
        <h2 className="text-2xl font-bold mb-1">Nouveau Grade !</h2>
        <p className="text-3xl font-black mb-2 drop-shadow-lg">{grade.name}</p>
        <p className="text-sm opacity-90 mb-4">Niveau {gradeProgress.level} atteint</p>
        <div className="bg-white/20 rounded-lg p-2 text-xs">
          Félicitations ! Continue comme ça 🎉
        </div>
      </div>
    </div>
  );
}
