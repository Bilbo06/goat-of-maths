import type { QuizQuestion } from '../types';

export function parseQuizCSV(csv: string, chapterId: number): QuizQuestion[] {
  const lines = csv.trim().split('\n');
  if (lines.length < 2) return [];

  const header = lines[0].split(',').map((h) => h.trim().toLowerCase());
  const questions: QuizQuestion[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length < 6) continue;

    const question = getValue(values, header, 'question');
    const type = getValue(values, header, 'type') as 'mcq' | 'tf';
    const optionA = getValue(values, header, 'option_a');
    const optionB = getValue(values, header, 'option_b');
    const optionC = getValue(values, header, 'option_c') || '';
    const optionD = getValue(values, header, 'option_d') || '';
    const correctStr = getValue(values, header, 'correct_answer').toUpperCase();
    const timeStr = getValue(values, header, 'time_seconds') || '30';
    const explanation = getValue(values, header, 'explanation') || '';

    const options = type === 'tf' ? [optionA, optionB] : [optionA, optionB, optionC, optionD].filter(Boolean);
    const correctMap: Record<string, number> = { A: 0, B: 1, C: 2, D: 3 };
    const correctAnswer = correctMap[correctStr] ?? 0;

    questions.push({
      id: i,
      chapterId,
      question,
      type,
      options,
      correctAnswer,
      timeSeconds: parseInt(timeStr, 10) || 30,
      explanation,
    });
  }

  return questions;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function getValue(values: string[], header: string[], key: string): string {
  const idx = header.indexOf(key);
  return idx >= 0 ? values[idx] || '' : '';
}
