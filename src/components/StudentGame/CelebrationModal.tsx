import React, { useEffect } from 'react';
import {
  Trophy,
  Sparkles,
  CheckCircle2,
  RotateCcw,
  Award,
  FlagTriangleRight,
  LogOut,
  Compass,
} from 'lucide-react';
import { soundManager } from '../../utils/audio';

interface CelebrationModalProps {
  score: number;
  gemsCount: number;
  totalQuestions: number;
  correctAnswersCount: number;
  onRestart: () => void;
  onExit?: () => void;
  onExploreTrail?: () => void;
}

export const CelebrationModal: React.FC<CelebrationModalProps> = ({
  score,
  gemsCount,
  totalQuestions,
  correctAnswersCount,
  onRestart,
  onExit,
  onExploreTrail,
}) => {
  useEffect(() => {
    soundManager.playVictory();
  }, []);

  const accuracy = totalQuestions > 0 ? Math.round((correctAnswersCount / totalQuestions) * 100) : 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in select-none">
      <div className="bg-slate-900 border-2 border-purple-500/60 rounded-3xl max-w-xl w-full p-6 sm:p-7 text-center shadow-2xl text-slate-100 relative overflow-hidden">
        {/* Glow ambient background in purple */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-purple-600/25 rounded-full blur-3xl pointer-events-none" />

        {/* Finish Line & Trophy Icon */}
        <div className="relative mx-auto w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500/20 via-purple-600/30 to-violet-500/30 border border-purple-400/50 flex items-center justify-center mb-4 shadow-xl">
          <Trophy className="w-10 h-10 text-amber-400 animate-bounce" />
          <div className="absolute -top-2 -right-2 bg-purple-600 border border-purple-300 p-1.5 rounded-full shadow-lg">
            <FlagTriangleRight className="w-4 h-4 text-white" />
          </div>
          <Sparkles className="w-5 h-5 text-purple-300 absolute -bottom-1 -left-1" />
        </div>

        {/* Title & Subtitle */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/40 text-purple-300 text-xs font-bold mb-2">
          <FlagTriangleRight className="w-3.5 h-3.5" />
          <span>קו הסיום של המסע</span>
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-white mb-1.5">
          אלופי הפועל! הגעתם לקו הסיום!
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 mb-5 max-w-md mx-auto leading-relaxed">
          עברתם בהצלחה את כל מעברי ההרים, חציתם את קניון הנהר, חקרתם את מרחבי המדבר והאלפים, ושלטתם בהטיות הפעלים והבניינים!
        </p>

        {/* Statistics Grid */}
        <div className="grid grid-cols-3 gap-2.5 mb-5">
          <div className="bg-slate-800/80 border border-slate-700 p-2.5 rounded-2xl">
            <span className="text-[11px] text-slate-400 block mb-0.5">ניקוד סופי</span>
            <span className="text-xl font-black text-amber-400 tabular-nums">
              {score.toLocaleString()}
            </span>
          </div>

          <div className="bg-slate-800/80 border border-slate-700 p-2.5 rounded-2xl">
            <span className="text-[11px] text-slate-400 block mb-0.5">דיוק בתשובות</span>
            <span className="text-xl font-black text-purple-300 tabular-nums">
              {accuracy}%
            </span>
          </div>

          <div className="bg-slate-800/80 border border-slate-700 p-2.5 rounded-2xl">
            <span className="text-[11px] text-slate-400 block mb-0.5">אוצרות שנאספו</span>
            <span className="text-xl font-black text-teal-400 tabular-nums">
              {gemsCount} 💎
            </span>
          </div>
        </div>

        {/* Achievement Badges Showcase */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 text-right mb-5">
          <span className="text-xs font-bold text-slate-200 block mb-2 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-purple-400" />
            <span>הישגים שננעלו במסע:</span>
          </span>
          <div className="space-y-1.5 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span>שליטה מלאה בזיהוי גופים וזמנים בפועל השלם בערבית</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span>הבחנה בין פעולת גרימה לפעולה חוזרת ורפלקסיבית</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span>הצלחה בהתאמת צמדים מורפולוגיים ותרגום שוטף</span>
            </div>
          </div>
        </div>

        {/* Action Buttons: Play Again, Explore Map, and Exit */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-1">
          <button
            onClick={onRestart}
            className="w-full sm:flex-1 py-3 px-4 bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-purple-600/35 transition-all active:scale-98 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>שחקו שוב מההתחלה</span>
          </button>

          {onExploreTrail && (
            <button
              onClick={onExploreTrail}
              className="w-full sm:flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-purple-200 border border-purple-500/30 hover:border-purple-500/50 font-bold text-sm rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
            >
              <Compass className="w-4 h-4 text-purple-400" />
              <span>סקירת המפה והאוצרות</span>
            </button>
          )}

          {onExit && (
            <button
              onClick={onExit}
              className="w-full sm:w-auto py-3 px-5 bg-slate-800/90 hover:bg-rose-950/40 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-500/40 font-bold text-sm rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
              title="יציאה מהמסע וסיום המשחק"
            >
              <LogOut className="w-4 h-4 text-rose-400" />
              <span>יציאה מהמסע</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
