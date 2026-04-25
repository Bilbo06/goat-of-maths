import { useState } from 'react';
import { useGame } from '../contexts/GameContext';

const STEPS = [
  { icon: '👋', title: 'Bienvenue !', desc: "Bienvenue dans GOAT of Maths ! L'appli pour devenir la GOAT des maths." },
  { icon: '🏋️', title: 'Entraîne-toi', desc: "Fais des sessions d'entraînement pour gagner de l'XP et monter en niveau." },
  { icon: '⚔️', title: 'Combats', desc: 'Affronte des adversaires en duel ! Réponds vite et choisis tes actions.' },
  { icon: '🛒', title: 'Boutique', desc: 'Dépense tes pièces dans la boutique : avatars, thèmes, boosts et objets.' },
  { icon: '🏰', title: 'Guildes', desc: 'Crée ou rejoins une guilde pour jouer en équipe et compléter des missions.' },
  { icon: '🎯', title: 'Missions & Badges', desc: 'Complète des missions quotidiennes et débloque des hauts faits !' },
];

export default function OnboardingModal() {
  const { state } = useGame();
  const [step, setStep] = useState(0);
  const darkMode = state.darkMode;
  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const textClass = darkMode ? 'text-white' : 'text-gray-800';
  const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-600';

  const isNewUser = state.userData.totalXP === 0 && state.duelHistory.length === 0;

  if (!isNewUser || step >= STEPS.length) return null;

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className={`${cardBg} rounded-2xl shadow-2xl p-6 border-2 border-amber-900 max-w-sm w-full text-center`}>
        <div className="text-6xl mb-4">{current.icon}</div>
        <h2 className={`text-2xl font-bold ${textClass} mb-2`}>{current.title}</h2>
        <p className={`text-sm ${textSecondary} mb-6`}>{current.desc}</p>

        <div className="flex justify-center gap-1 mb-6">
          {STEPS.map((_, i) => (
            <div key={i} className={`w-2 h-2 rounded-full ${i === step ? 'theme-bg' : darkMode ? 'bg-gray-600' : 'bg-gray-300'}`} />
          ))}
        </div>

        <div className="flex gap-3">
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 rounded-xl border-2 border-amber-900"
            >
              Précédent
            </button>
          )}
          <button
            onClick={() => setStep(step + 1)}
            className="flex-1 theme-gradient text-white font-bold py-3 rounded-xl border-2 border-amber-900"
          >
            {isLast ? "C'est parti !" : 'Suivant'}
          </button>
        </div>
      </div>
    </div>
  );
}
