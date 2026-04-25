import type { Grade, GradeProgress } from '../types';

export const GRADES: Grade[] = [
  { name: 'Novice', emoji: '📚', levelReq: 1 },
  { name: 'Calculateur', emoji: '✏️', levelReq: 10 },
  { name: 'Algébriste', emoji: '📊', levelReq: 20 },
  { name: 'Géomètre', emoji: '📐', levelReq: 35 },
  { name: 'Analyste', emoji: '📈', levelReq: 50 },
  { name: 'Mathématicien', emoji: '🧮', levelReq: 70 },
  { name: 'Professeur', emoji: '🎓', levelReq: 100 },
  { name: 'GOAT', emoji: '🐐', levelReq: 150 },
];

export const XP_PER_LEVEL = 150;

export function computeGradeProgress(totalXP: number): GradeProgress {
  const level = Math.floor(totalXP / XP_PER_LEVEL) + 1;
  const xpInCurrentLevel = totalXP % XP_PER_LEVEL;

  let gradeIndex = 0;
  for (let i = GRADES.length - 1; i >= 0; i--) {
    if (level >= GRADES[i].levelReq) {
      gradeIndex = i;
      break;
    }
  }

  return {
    gradeIndex,
    level,
    xpInCurrentLevel,
    xpForNextLevel: XP_PER_LEVEL,
  };
}

export function getCurrentGrade(totalXP: number): Grade {
  return GRADES[computeGradeProgress(totalXP).gradeIndex];
}
