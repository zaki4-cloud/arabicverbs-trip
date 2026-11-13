import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, ArrowLeft, Volume2, BookOpen } from 'lucide-react';
import { MultipleChoiceQuestion } from '../../types/game';
import { soundManager } from '../../utils/audio';
import { speakArabic } from '../../utils/speech';
import { ConfettiBurst } from './CelebrationEffects';

interface MultipleChoiceStationProps {
  question: MultipleChoiceQuestion;
  onAnswerSubmit: (isCorrect: boolean, userAnswer: string) => void;
  onContinue: () => void;
  onClose: () => void;
}

export const MultipleChoiceStation: React.FC<MultipleChoiceStationProps> = ({
  question,
  onAnswerSubmit,
  onContinue,
  onClose,
}) => {
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [canInteract, setCanInteract] = useState<boolean>(false);

  useEffect(() => {
    const all = [question.correctAnswer, ...question.distractors];
    const shuffled = [...all].sort(() => Math.random() - 0.5);
    setShuffledOptions(shuffled);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setIsCorrect(false);
    setCanInteract(false);

    // Prevent ghost clicks or touch-through from opening tap
    const timer = setTimeout(() => {
      setCanInteract(true);
    }, 350);
    return () => clearTimeout(timer);
  }, [question.id]);

  const handleSelectOption = (option: string) => {
    if (!canInteract || isAnswered) return;
    setSelectedAnswer(option);
    const correct = option === question.correctAnswer;
    setIsCorrect(correct);
    setIsAnswered(true);

    if (correct) {
      soundManager.playSuccess();
    } else {
      soundManager.playGentleMistake();
    }

    onAnswerSubmit(correct, option);
  };

  const handlePronounce = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (question.arabicSample) {
      speakArabic(question.arabicSample);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in select-none">
      <div className="bg-slate-900 border border-slate-700/90 rounded-2xl shadow-2xl max-w-xl w-full max-h-[88vh] flex flex-col overflow-hidden">
        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">

          <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2.5 mb-3">
            <span className="font-semibold text-emerald-400">שאלה אמריקאית (רב-ברירה)</span>
            <div className="flex items-center gap-2">
              <span>נושא: {question.topic}</span>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white p-1 rounded"
                title="סגור חלון"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Prompt */}
          <div className="mb-4">
            <h3 className="text-base sm:text-lg font-bold text-white mb-2">
              {question.prompt}
            </h3>

            {/* Arabic Sample with Pronunciation Button */}
            {question.arabicSample && (
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 sm:p-4 text-center my-2 shadow-inner flex items-center justify-center gap-3">
                <span className="text-3xl sm:text-4xl font-bold font-arabic text-emerald-400 block tracking-wide leading-normal">
                  {question.arabicSample}
                </span>
                <button
                  type="button"
                  onClick={handlePronounce}
                  className="p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-colors cursor-pointer"
                  title="השמע הגייה אותנטית בערבית"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Answer Options - Significantly enlarged font for high readability */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            {shuffledOptions.map((option, idx) => {
              const optionLetters = ['א', 'ב', 'ג', 'ד'];
              const isArabicOption = /[\u0600-\u06FF]/.test(option);

              let btnStyle =
                'bg-slate-850/90 border-slate-700 hover:border-purple-400/60 hover:bg-slate-800 text-slate-100 shadow-md';

              if (isAnswered) {
                if (option === question.correctAnswer) {
                  btnStyle =
                    'bg-emerald-600/30 border-emerald-500 text-emerald-100 font-bold ring-2 ring-emerald-500/80 shadow-emerald-500/20';
                } else if (option === selectedAnswer) {
                  btnStyle =
                    'bg-rose-600/25 border-rose-500 text-rose-200 ring-2 ring-rose-500/80 shadow-rose-500/20';
                } else {
                  btnStyle = 'bg-slate-900/60 border-slate-800 text-slate-500 opacity-50';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(option)}
                  disabled={isAnswered}
                  className={`p-3.5 sm:p-4 rounded-2xl border text-right transition-all flex items-center justify-between gap-3 min-h-[62px] sm:min-h-[68px] ${btnStyle} ${
                    !isAnswered ? 'cursor-pointer active:scale-98 hover:shadow-lg' : 'cursor-default'
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-slate-800/90 border border-slate-700/80 flex items-center justify-center font-bold text-xs sm:text-sm text-purple-300 shrink-0 shadow-inner">
                      {optionLetters[idx] || idx + 1}
                    </span>
                    <span
                      className={`flex-1 text-right ${
                        isArabicOption
                          ? 'font-arabic text-xl sm:text-2xl font-bold leading-normal text-amber-300 tracking-wide'
                          : 'text-base sm:text-lg font-bold leading-snug text-white'
                      }`}
                    >
                      {option}
                    </span>
                  </div>

                  {isAnswered && option === question.correctAnswer && (
                    <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400 shrink-0 animate-bounce" />
                  )}
                  {isAnswered && option === selectedAnswer && option !== question.correctAnswer && (
                    <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-rose-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Real-Time Feedback Overlay without mention of repeating questions */}
          {/* Real-Time Feedback Overlay with Confetti & Stars on Correct Answer */}
          {isAnswered && (
            <div className="relative">
              {isCorrect && <ConfettiBurst />}

              <div
                className={`p-4 rounded-2xl border mb-3 animate-fade-in relative z-10 ${
                  isCorrect
                    ? 'bg-gradient-to-r from-emerald-950/80 via-emerald-900/60 to-teal-950/80 border-emerald-400 shadow-xl shadow-emerald-500/20 text-emerald-100 ring-2 ring-emerald-400/30'
                    : 'bg-amber-950/50 border-amber-500/40 text-amber-200'
                }`}
              >
                <div className="flex items-center gap-2 font-black text-sm sm:text-base mb-1.5">
                  {isCorrect ? (
                    <>
                      <div className="w-7 h-7 rounded-full bg-emerald-500/30 border border-emerald-400 flex items-center justify-center text-emerald-300 shrink-0">
                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                      </div>
                      <span className="text-emerald-300 font-extrabold flex items-center gap-1.5">
                        <span>כל הכבוד! צדקתם!</span>
                        <span className="text-amber-300 font-black tabular-nums">(+100 נקודות 🌟)</span>
                      </span>
                    </>
                  ) : (
                    <>
                      <BookOpen className="w-4 h-4 text-amber-400" />
                      <span>תשובה לא מדויקת. שימו לב להסבר:</span>
                    </>
                  )}
                </div>

                <div className="text-xs sm:text-sm leading-relaxed opacity-95">
                  <strong className="block text-white mb-1">
                    התשובה הנכונה:{' '}
                    <span className="text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/40">
                      {question.correctAnswer}
                    </span>
                  </strong>
                  {question.explanation &&
                    !question.explanation.startsWith('הסבר לתלמיד מדוע') &&
                    question.explanation.trim().length > 0 && (
                      <p className="mt-1 text-slate-200">{question.explanation}</p>
                    )}
                </div>
              </div>
            </div>
          )}
        </div>
        {/* End of Scrollable Body */}

        {/* Pinned Bottom Action Footer: "ממשיכים במסע" - Immediately accessible without scrolling */}
        {isAnswered && (
          <div className="p-3 sm:p-4 bg-slate-900/95 border-t border-slate-800 shrink-0 sticky bottom-0 z-20 flex justify-end">
            <button
              onClick={onContinue}
              className="w-full sm:w-auto px-7 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-sm rounded-xl flex items-center justify-center gap-2 shadow-xl shadow-purple-600/35 cursor-pointer transition-all active:scale-98"
            >
              <span>ממשיכים במסע</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
