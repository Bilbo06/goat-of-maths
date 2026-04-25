import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGame } from '../contexts/GameContext';
import { parseQuizCSV } from '../utils/csvParser';
import type { QuizQuestion } from '../types';
import quizData from '../data/quizzes/example.csv?raw';

export default function QuizPage() {
  const { chapterId } = useParams<{ chapterId: string }>();
  const navigate = useNavigate();
  const { state, canTakeQuiz, submitQuiz, getQuizStatus } = useGame();
  const darkMode = state.darkMode;
  const cid = parseInt(chapterId || '0', 10);

  const questions: QuizQuestion[] = parseQuizCSV(quizData, cid);
  const quizCheck = canTakeQuiz(cid);
  const existingStatus = getQuizStatus(cid);

  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [started, setStarted] = useState(false);

  const currentQuestion = questions[currentQ];
  const isLastQuestion = currentQ === questions.length - 1;

  const handleTimeUp = useCallback(() => {
    const newAnswers = [...answers, -1];
    setAnswers(newAnswers);
    if (isLastQuestion) {
      finishQuiz(newAnswers);
    } else {
      setCurrentQ(currentQ + 1);
      setSelectedAnswer(null);
      setTimeLeft(questions[currentQ + 1]?.timeSeconds || 30);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers, currentQ, isLastQuestion, questions]);

  useEffect(() => {
    if (!started || showResult || !currentQuestion) return;
    if (timeLeft <= 0) {
      handleTimeUp();
      return;
    }
    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, started, showResult, currentQuestion, handleTimeUp]);

  if (!quizCheck.allowed && existingStatus !== 'in_progress') {
    return (
      <div className={`min-h-[60vh] flex items-center justify-center ${darkMode ? 'text-white' : 'text-gray-800'}`}>
        <div className={`text-center p-8 rounded-xl border-2 border-amber-900 shadow-xl ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="text-6xl mb-4">🔒</div>
          <p className="text-xl font-bold mb-4">{quizCheck.reason}</p>
          <button
            onClick={() => navigate('/entrainement')}
            className="theme-gradient text-white font-bold px-6 py-3 rounded-xl border-2 border-amber-900"
          >
            ← Retour
          </button>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className={`min-h-[60vh] flex items-center justify-center ${darkMode ? 'text-white' : 'text-gray-800'}`}>
        <div className={`text-center p-8 rounded-xl border-2 border-amber-900 shadow-xl ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="text-6xl mb-4">🚧</div>
          <p className="text-xl font-bold mb-4">Aucune question disponible pour ce chapitre</p>
          <button
            onClick={() => navigate('/entrainement')}
            className="theme-gradient text-white font-bold px-6 py-3 rounded-xl border-2 border-amber-900"
          >
            ← Retour
          </button>
        </div>
      </div>
    );
  }

  if (!started) {
    return (
      <div className={`min-h-[60vh] flex items-center justify-center ${darkMode ? 'text-white' : 'text-gray-800'}`}>
        <div className={`text-center p-8 rounded-xl border-2 border-amber-900 shadow-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} max-w-md w-full`}>
          <div className="text-6xl mb-4">📝</div>
          <h2 className="text-2xl font-bold mb-2">Quiz prêt !</h2>
          <p className={`mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {questions.length} questions • ⏱️ Temps limité par question
          </p>
          <div className={`mb-4 p-3 rounded-lg border-2 border-amber-900 ${darkMode ? 'bg-gray-700' : 'bg-amber-50'}`}>
            <p className="text-sm font-bold">🎯 Objectif : 100% pour maîtriser</p>
            <p className="text-xs mt-1">Score {'>'}= 80% = Réussi • Score {'<'} 80% = Verrouillé 24h</p>
          </div>
          <div className="text-xs mb-4">Quiz aujourd'hui : {state.quizState.todayQuizCount}/5</div>
          <button
            onClick={() => {
              setStarted(true);
              setTimeLeft(questions[0].timeSeconds);
            }}
            className="w-full theme-gradient text-white font-bold py-4 px-6 rounded-xl border-2 border-amber-900 text-lg hover:scale-105 transition-transform"
          >
            Commencer !
          </button>
        </div>
      </div>
    );
  }

  if (showResult) {
    const score = answers.filter((a, i) => a === questions[i]?.correctAnswer).length;
    const percentage = Math.round((score / questions.length) * 100);
    const status = percentage === 100 ? '⭐ Maîtrisé !' : percentage >= 80 ? '✅ Réussi' : '🔄 Continue !';
    const statusColor = percentage === 100 ? 'from-yellow-400 to-yellow-600' : percentage >= 80 ? 'from-green-400 to-green-600' : 'from-red-400 to-red-600';

    return (
      <div className={`min-h-[60vh] flex items-center justify-center ${darkMode ? 'text-white' : 'text-gray-800'}`}>
        <div className={`text-center p-8 rounded-xl border-2 border-amber-900 shadow-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} max-w-md w-full`}>
          <div className="text-6xl mb-4">{percentage === 100 ? '🐐' : percentage >= 80 ? '🎉' : '💪'}</div>
          <div className={`text-3xl font-bold bg-gradient-to-r ${statusColor} bg-clip-text text-transparent mb-2`}>
            {status}
          </div>
          <div className="text-4xl font-bold mb-2">{percentage}%</div>
          <p className={`mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {score}/{questions.length} bonnes réponses
          </p>

          <div className={`text-left space-y-2 mb-6 ${darkMode ? 'bg-gray-700' : 'bg-amber-50'} rounded-lg p-4 border-2 border-amber-900 max-h-64 overflow-y-auto`}>
            {questions.map((q, i) => {
              const isCorrect = answers[i] === q.correctAnswer;
              return (
                <div key={q.id} className={`${darkMode ? 'bg-gray-600' : 'bg-white'} rounded-lg p-2 border-2 border-amber-900`}>
                  <div className="flex items-center gap-2 text-sm">
                    <span className={isCorrect ? 'text-green-500' : 'text-red-500'}>
                      {isCorrect ? '✓' : '✗'}
                    </span>
                    <span className={`flex-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {q.question.length > 50 ? q.question.slice(0, 50) + '...' : q.question}
                    </span>
                  </div>
                  {!isCorrect && q.explanation && (
                    <p className={`text-xs mt-1 ml-6 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      💡 {q.explanation}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <div className="space-y-2">
            <button
              onClick={() => navigate('/entrainement')}
              className="w-full theme-gradient text-white font-bold py-3 px-6 rounded-xl border-2 border-amber-900"
              >
                ← Retour
            </button>
        </div>

        {showExplanation && selectedAnswer !== null && currentQuestion && (
          <div className={`mt-4 p-4 rounded-xl border-2 ${
            selectedAnswer === currentQuestion.correctAnswer
              ? 'border-green-500 ' + (darkMode ? 'bg-green-900/30' : 'bg-green-50')
              : 'border-red-500 ' + (darkMode ? 'bg-red-900/30' : 'bg-red-50')
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{selectedAnswer === currentQuestion.correctAnswer ? '✅' : '❌'}</span>
              <span className={`font-bold ${selectedAnswer === currentQuestion.correctAnswer ? 'text-green-600' : 'text-red-600'}`}>
                {selectedAnswer === currentQuestion.correctAnswer ? 'Correct !' : 'Incorrect'}
              </span>
            </div>
            {selectedAnswer !== currentQuestion.correctAnswer && (
              <p className={`text-sm mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                La bonne réponse était : <strong>{currentQuestion.options[currentQuestion.correctAnswer]}</strong>
              </p>
            )}
            {currentQuestion.explanation && (
              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                💡 {currentQuestion.explanation}
              </p>
            )}
          </div>
        )}
      </div>
      </div>
    );
  }

  function handleAnswer(idx: number) {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(idx);
    setShowExplanation(true);
    const newAnswers = [...answers, idx];
    setAnswers(newAnswers);

    setTimeout(() => {
      setShowExplanation(false);
      if (isLastQuestion) {
        finishQuiz(newAnswers);
      } else {
        setCurrentQ(currentQ + 1);
        setSelectedAnswer(null);
        setTimeLeft(questions[currentQ + 1]?.timeSeconds || 30);
      }
    }, 2500);
  }

  function finishQuiz(finalAnswers: number[]) {
    const score = finalAnswers.filter((a, i) => a === questions[i]?.correctAnswer).length;
    submitQuiz(cid, score, questions.length);
    setShowResult(true);
  }

  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const textClass = darkMode ? 'text-white' : 'text-gray-800';
  const timePercent = currentQuestion ? (timeLeft / currentQuestion.timeSeconds) * 100 : 0;
  const timeColor = timeLeft <= 5 ? 'bg-red-500' : timeLeft <= 10 ? 'bg-yellow-500' : 'bg-green-500';

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <span className={`font-bold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          Question {currentQ + 1}/{questions.length}
        </span>
        <span className={`font-bold text-lg ${timeLeft <= 5 ? 'text-red-500' : timeLeft <= 10 ? 'text-yellow-500' : 'text-green-500'}`}>
          ⏱️ {timeLeft}s
        </span>
      </div>

      <div className="h-3 bg-gray-300 rounded-full overflow-hidden border-2 border-black">
        <div className={`h-full ${timeColor} transition-all duration-1000`} style={{ width: `${timePercent}%` }} />
      </div>

      <div className={`${cardBg} rounded-xl shadow-xl p-6 border-2 border-amber-900`}>
        <h3 className={`text-xl font-bold ${textClass} mb-6 text-center`}>
          {currentQuestion?.question}
        </h3>

        <div className="space-y-3">
          {currentQuestion?.options.map((opt, idx) => {
            const letter = String.fromCharCode(65 + idx);
            const isSelected = selectedAnswer === idx;
            const isCorrect = idx === currentQuestion?.correctAnswer;
            const showCorrect = selectedAnswer !== null;

            let btnClass = `w-full font-bold py-3 px-4 rounded-xl transition-all border-2 text-left flex items-center gap-3 `;
            if (showCorrect && isCorrect) {
              btnClass += 'bg-green-500 text-white border-green-700';
            } else if (showCorrect && isSelected && !isCorrect) {
              btnClass += 'bg-red-500 text-white border-red-700';
            } else if (showCorrect) {
              btnClass += `${darkMode ? 'bg-gray-700 text-gray-500 border-gray-600' : 'bg-gray-100 text-gray-400 border-gray-300'} cursor-default`;
            } else {
              btnClass += `${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white border-gray-600' : 'bg-amber-50 hover:bg-amber-100 text-gray-800 border-amber-900'}`;
            }

            return (
              <button
                key={idx}
                onClick={() => handleAnswer(idx)}
                disabled={selectedAnswer !== null}
                className={btnClass}
              >
                <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm flex-shrink-0">
                  {letter}
                </span>
                <span>{opt}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex gap-1 justify-center">
        {questions.map((_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full ${
              i < answers.length
                ? answers[i] === questions[i]?.correctAnswer
                  ? 'bg-green-500'
                  : 'bg-red-500'
                : i === currentQ
                  ? 'theme-bg'
                  : darkMode ? 'bg-gray-600' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
