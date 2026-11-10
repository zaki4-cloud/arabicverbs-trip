import React, { useEffect, useState } from 'react';
import { Sparkles, Trophy, ArrowLeft, Mountain } from 'lucide-react';
import { soundManager } from '../../utils/audio';

interface StagePassModalProps {
  completedStageNumber: number;
  nextStageTitle: string;
  nextStageLandscape: string;
  onProceed: () => void;
}

export const StagePassModal: React.FC<StagePassModalProps> = ({
  completedStageNumber,
  nextStageTitle,
  nextStageLandscape,
  onProceed,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(10);

  useEffect(() => {
    soundManager.playSuccess();

    // 10-second timer (extra 5+ seconds as requested so it won't disappear quickly)
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onProceed();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onProceed]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in select-none">
      <div className="bg-slate-900 border-2 border-purple-500/60 rounded-3xl max-w-md w-full p-6 text-center shadow-2xl text-slate-100 relative overflow-hidden">
        {/* Glow backdrop in purple */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-48 h-48 bg-purple-600/25 rounded-full blur-3xl pointer-events-none" />

        <div className="relative mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-purple-500/30 border border-purple-400/40 flex items-center justify-center mb-4 shadow-inner">
          <Trophy className="w-8 h-8 text-amber-400 animate-bounce" />
          <Sparkles className="w-4 h-4 text-purple-300 absolute -top-1 -right-1" />
        </div>

        <span className="text-xs font-bold text-purple-400 uppercase tracking-widest block mb-1">
          הישג חדש במסע!
        </span>

        <h2 className="text-xl sm:text-2xl font-extrabold text-white mb-2">
          כל הכבוד! עברתם לשלב הבא!
        </h2>

        <p className="text-xs sm:text-sm text-slate-300 mb-5 leading-relaxed">
          סיימתם בהצלחה את כל שאלות שלב {completedStageNumber}! הנוף סביבכם משתנה וכעת ממשיכים אל:
        </p>

        {/* Next Stage Teaser Card */}
        <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-2xl mb-6 text-right flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300 shrink-0">
            <Mountain className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[11px] text-purple-400 block font-medium">היעד הבא:</span>
            <span className="text-sm font-bold text-white block truncate">
              {nextStageTitle}
            </span>
            <span className="text-xs text-slate-400 block truncate">
              {nextStageLandscape}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <button
            onClick={onProceed}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-sm sm:text-base rounded-2xl shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
          >
            <span>ממשיכים במסע</span>
            <ArrowLeft className="w-4 h-4" />
          </button>

          <span className="text-[11px] text-slate-400 block">
            החלון יישאר פתוח {secondsRemaining} שניות נוספות לבחירתכם
          </span>
        </div>
      </div>
    </div>
  );
};
