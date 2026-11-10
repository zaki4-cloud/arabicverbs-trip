import React, { useState, useEffect } from 'react';
import { CheckCircle2, ArrowLeft, Volume2, Sparkles, Star } from 'lucide-react';
import { MatchingPairsQuestion } from '../../types/game';
import { soundManager } from '../../utils/audio';
import { speakArabic } from '../../utils/speech';
import { ConfettiBurst } from './CelebrationEffects';

interface MatchingPairsStationProps {
  question: MatchingPairsQuestion;
  onAnswerSubmit: (isCorrect: boolean, details: string) => void;
  onContinue: () => void;
  onClose: () => void;
}

export const MatchingPairsStation: React.FC<MatchingPairsStationProps> = ({
  question,
  onAnswerSubmit,
  onContinue,
  onClose,
}) => {
  const [selectedArabicId, setSelectedArabicId] = useState<string | null>(null);
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);
  const [matchedPairIds, setMatchedPairIds] = useState<string[]>([]);
  const [mismatchErrorIds, setMismatchErrorIds] = useState<{ arabicId: string; targetId: string } | null>(null);
  const [mistakesCount, setMistakesCount] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [canInteract, setCanInteract] = useState<boolean>(false);

  const [arabicItems, setArabicItems] = useState<{ id: string; arabic: string }[]>([]);
  const [targetItems, setTargetItems] = useState<{ id: string; target: string }[]>([]);

  useEffect(() => {
    const arabics = question.pairs.map((p) => ({ id: p.id, arabic: p.arabic }));
    const targets = question.pairs.map((p) => ({ id: p.id, target: p.target }));

    setArabicItems([...arabics].sort(() => Math.random() - 0.5));
    setTargetItems([...targets].sort(() => Math.random() - 0.5));
    setSelectedArabicId(null);
    setSelectedTargetId(null);
    setMatchedPairIds([]);
    setMismatchErrorIds(null);
    setMistakesCount(0);
    setIsCompleted(false);
    setCanInteract(false);

    // Prevent touch-through from opening tap
    const timer = setTimeout(() => {
      setCanInteract(true);
    }, 350);
    return () => clearTimeout(timer);
  }, [question.id]);

  const evaluateMatch = (arabicId: string, targetId: string) => {
    if (arabicId === targetId) {
      soundManager.playSuccess();
      const updated = [...matchedPairIds, arabicId];
      setMatchedPairIds(updated);
      setSelectedArabicId(null);
      setSelectedTargetId(null);
      setMismatchErrorIds(null);

      if (updated.length === question.pairs.length) {
        setIsCompleted(true);
        const perfect = mistakesCount === 0;
        onAnswerSubmit(perfect, `התאמה מלאה (${updated.length} צמדים)`);
      }
    } else {
      soundManager.playGentleMistake();
      setMistakesCount((prev) => prev + 1);
      setMismatchErrorIds({ arabicId, targetId });

      setTimeout(() => {
        setMismatchErrorIds(null);
        setSelectedArabicId(null);
        setSelectedTargetId(null);
      }, 650);
    }
  };

  const handleArabicClick = (id: string, text: string) => {
    if (!canInteract || isCompleted || matchedPairIds.includes(id) || mismatchErrorIds) return;
    speakArabic(text);
    setSelectedArabicId(id);
    if (selectedTargetId) {
      evaluateMatch(id, selectedTargetId);
    }
  };

  const handleTargetClick = (id: string) => {
    if (!canInteract || isCompleted || matchedPairIds.includes(id) || mismatchErrorIds) return;
    setSelectedTargetId(id);
    if (selectedArabicId) {
      evaluateMatch(selectedArabicId, id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in select-none">
      <div className="bg-slate-900 border border-slate-700/90 rounded-2xl p-5 sm:p-6 shadow-2xl max-w-xl w-full max-h-[92vh] flex flex-col justify-between overflow-y-auto">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2.5 mb-3">
            <span className="font-semibold text-teal-400">התאמת צמדים (Matching Pairs)</span>
            <div className="flex items-center gap-2">
              <span>
                הותאמו: {matchedPairIds.length} מתוך {question.pairs.length}
              </span>
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
            <h3 className="text-base font-bold text-white mb-1">
              {question.prompt}
            </h3>
            <p className="text-xs text-slate-400">
              לחצו על פועל בערבית (תושמע הגייתו) ועל הכרטיסייה המתאימה בעברית.
            </p>
          </div>

          {/* Columns Grid */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4">
            {/* Arabic Column */}
            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider block text-center mb-1">
                פעלים בערבית (ניקוד פנימי)
              </span>
              {arabicItems.map((item) => {
                const isMatched = matchedPairIds.includes(item.id);
                const isSelected = selectedArabicId === item.id;
                const isMismatch = mismatchErrorIds?.arabicId === item.id;

                let cardStyle =
                  'bg-slate-800/90 border-slate-700 hover:border-emerald-500/50 text-slate-100';

                if (isMatched) {
                  cardStyle =
                    'bg-emerald-950/40 border-emerald-500/60 text-emerald-300 opacity-60 cursor-default';
                } else if (isMismatch) {
                  cardStyle = 'bg-rose-950/40 border-rose-500 text-rose-300 animate-shake';
                } else if (isSelected) {
                  cardStyle =
                    'bg-emerald-900/40 border-emerald-400 text-white ring-2 ring-emerald-500 shadow-md shadow-emerald-500/20';
                }

                return (
                  <button
                    key={item.id}
                    onClick={() => handleArabicClick(item.id, item.arabic)}
                    disabled={isMatched || !!mismatchErrorIds}
                    className={`w-full p-2.5 sm:p-3 rounded-xl border text-center transition-all flex items-center justify-between px-3 ${cardStyle} ${
                      !isMatched ? 'cursor-pointer active:scale-98' : ''
                    }`}
                  >
                    <Volume2 className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-xl sm:text-2xl font-bold font-arabic leading-tight">
                      {item.arabic}
                    </span>
                    {isMatched ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <span className="w-4" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Hebrew Targets */}
            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-teal-400 uppercase tracking-wider block text-center mb-1">
                משמעות וגוף בעברית
              </span>
              {targetItems.map((item) => {
                const isMatched = matchedPairIds.includes(item.id);
                const isSelected = selectedTargetId === item.id;
                const isMismatch = mismatchErrorIds?.targetId === item.id;

                let cardStyle =
                  'bg-slate-800/90 border-slate-700 hover:border-teal-500/50 text-slate-100';

                if (isMatched) {
                  cardStyle =
                    'bg-emerald-950/40 border-emerald-500/60 text-emerald-300 opacity-60 cursor-default';
                } else if (isMismatch) {
                  cardStyle = 'bg-rose-950/40 border-rose-500 text-rose-300 animate-shake';
                } else if (isSelected) {
                  cardStyle =
                    'bg-teal-900/40 border-teal-400 text-white ring-2 ring-teal-500 shadow-md shadow-teal-500/20';
                }

                return (
                  <button
                    key={item.id}
                    onClick={() => handleTargetClick(item.id)}
                    disabled={isMatched || !!mismatchErrorIds}
                    className={`w-full p-2.5 sm:p-3 rounded-xl border text-center transition-all flex items-center justify-center gap-2 text-xs font-semibold ${cardStyle} ${
                      !isMatched ? 'cursor-pointer active:scale-98' : ''
                    }`}
                  >
                    <span>{item.target}</span>
                    {isMatched && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Completion Feedback with Confetti & Stars */}
          {isCompleted && (
            <div className="relative">
              <ConfettiBurst />
              <div className="p-4 rounded-2xl border border-emerald-400 bg-gradient-to-r from-emerald-950/80 via-emerald-900/60 to-teal-950/80 text-emerald-100 mb-3 animate-fade-in shadow-xl shadow-emerald-500/20 ring-2 ring-emerald-400/30">
                <div className="flex items-center gap-2 font-black text-sm sm:text-base mb-1.5">
                  <div className="w-7 h-7 rounded-full bg-emerald-500/30 border border-emerald-400 flex items-center justify-center text-emerald-300 shrink-0">
                    <Star className="w-4 h-4 text-amber-300 fill-amber-300" />
                  </div>
                  <span className="text-emerald-300 font-extrabold flex items-center gap-1.5">
                    <span>כל הכבוד! חיברתם את כל הצמדים!</span>
                    <span className="text-amber-300 font-black tabular-nums">(+150 נקודות 🌟)</span>
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed opacity-95">
                  {question.explanation}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Continue Button: "ממשיכים במסע" */}
        {isCompleted && (
          <div className="flex justify-end pt-2 border-t border-slate-800">
            <button
              onClick={onContinue}
              className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 cursor-pointer transition-all active:scale-98"
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
