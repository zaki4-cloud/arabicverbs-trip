import React from 'react';
import { Volume2, VolumeX, Sparkles, Trophy, User, Edit3, LogOut, Compass, ChevronRight, ChevronLeft } from 'lucide-react';
import { soundManager } from '../../utils/audio';

interface GameHudProps {
  score: number;
  gemsCount: number;
  currentStageNumber: number;
  totalStages: number;
  stageTitle: string;
  landscapeName: string;
  isMuted: boolean;
  onToggleMute: () => void;
  studentName?: string;
  onEditStudentName?: () => void;
  onExitGame?: () => void;
  isGameCompleted?: boolean;
  onSelectStage?: (stageIndex: number) => void;
  trackTitle?: string;
  onChangeTrack?: () => void;
}

export const GameHud: React.FC<GameHudProps> = ({
  score,
  gemsCount,
  currentStageNumber,
  totalStages,
  stageTitle,
  landscapeName,
  isMuted,
  onToggleMute,
  studentName,
  onEditStudentName,
  onExitGame,
  isGameCompleted,
  onSelectStage,
  trackTitle,
  onChangeTrack,
}) => {
  return (
    <div className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-3 sm:px-4 py-2 text-slate-100 shadow-md select-none shrink-0 z-30">
      <div className="max-w-md mx-auto flex items-center justify-between gap-1.5 sm:gap-2">
        {/* Score & Gems */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-lg">
            <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="text-xs sm:text-sm font-bold text-amber-400 tabular-nums">
              {score.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center gap-1 bg-purple-500/15 border border-purple-500/35 px-2 py-0.5 rounded-lg">
            <Sparkles className="w-3.5 h-3.5 text-purple-300 shrink-0" />
            <span className="text-xs sm:text-sm font-bold text-purple-300 tabular-nums">
              {gemsCount} 💎
            </span>
          </div>
        </div>

        {/* Student Nickname / Topic Selector */}
        <div className="flex items-center gap-1 min-w-0">
          {studentName && (
            <button
              onClick={onEditStudentName}
              className="flex items-center gap-1 text-[11px] bg-slate-800 hover:bg-slate-700/80 border border-slate-700 px-2 py-0.5 rounded-lg text-slate-200 hover:text-white transition-colors cursor-pointer max-w-[95px] sm:max-w-[120px] truncate"
              title="לחצו לשינוי שם/כינוי או החלפת נושא משחק"
            >
              <User className="w-3 h-3 text-purple-400 shrink-0" />
              <span className="font-semibold truncate">{studentName}</span>
              <Edit3 className="w-2.5 h-2.5 text-slate-400 shrink-0" />
            </button>
          )}

          {trackTitle && onChangeTrack && (
            <button
              onClick={onChangeTrack}
              className="hidden sm:flex items-center gap-1 text-[10px] bg-purple-950/60 hover:bg-purple-900/60 border border-purple-500/40 px-2 py-0.5 rounded-lg text-purple-200 hover:text-white transition-colors cursor-pointer max-w-[110px] truncate"
              title="נושא / סוג המשחק הנבחר - לחצו להחלפה"
            >
              <Compass className="w-2.5 h-2.5 text-purple-300 shrink-0" />
              <span className="truncate">{trackTitle.split(':')[0]}</span>
            </button>
          )}
        </div>

        {/* Stage Badge, Audio & Exit */}
        <div className="flex items-center gap-1.5 shrink-0">
          {onSelectStage && totalStages > 1 ? (
            <div className="flex items-center gap-0.5 bg-purple-950/80 border border-purple-500/40 px-1 py-0.5 rounded-full shadow-inner">
              {/* Previous Stage Button */}
              <button
                type="button"
                onClick={() => onSelectStage(currentStageNumber - 2)}
                disabled={currentStageNumber <= 1}
                className={`p-1 rounded-full transition-colors flex items-center justify-center ${
                  currentStageNumber > 1
                    ? 'text-purple-300 hover:text-white hover:bg-purple-800/80 cursor-pointer active:scale-95'
                    : 'text-purple-600/30 cursor-not-allowed'
                }`}
                title="חזרה לשלב הקודם"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <select
                value={currentStageNumber - 1}
                onChange={(e) => onSelectStage(Number(e.target.value))}
                className="text-xs font-bold text-purple-200 bg-transparent px-1 py-0.5 cursor-pointer hover:text-white transition-colors focus:outline-none text-center"
                title="בחירת שלב במסלול הנוכחי"
              >
                {Array.from({ length: totalStages }).map((_, i) => (
                  <option key={i} value={i} className="bg-slate-900 text-white">
                    שלב {i + 1}/{totalStages}
                  </option>
                ))}
              </select>

              {/* Next Stage Button */}
              <button
                type="button"
                onClick={() => onSelectStage(currentStageNumber)}
                disabled={currentStageNumber >= totalStages}
                className={`p-1 rounded-full transition-colors flex items-center justify-center ${
                  currentStageNumber < totalStages
                    ? 'text-purple-300 hover:text-white hover:bg-purple-800/80 cursor-pointer active:scale-95'
                    : 'text-purple-600/30 cursor-not-allowed'
                }`}
                title="מעבר לשלב הבא"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <span className="text-xs font-bold text-purple-200 bg-purple-950/70 border border-purple-500/40 px-2.5 py-0.5 rounded-full">
              שלב {currentStageNumber}/{totalStages}
            </span>
          )}

          {/* Audio Mute Button */}
          <button
            onClick={() => {
              onToggleMute();
              soundManager.setMuted(!isMuted);
            }}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              isMuted
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
            }`}
            title={isMuted ? 'הפעל צלילים' : 'השתק צלילים'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Exit Game Button */}
          {onExitGame && (
            <button
              onClick={onExitGame}
              className="p-1.5 rounded-lg border border-rose-500/40 bg-rose-950/40 hover:bg-rose-900/60 text-rose-200 hover:text-white transition-colors cursor-pointer flex items-center gap-1 shadow-sm active:scale-95"
              title="יציאה מהמסע"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span className="text-[10px] hidden sm:inline font-bold">יציאה</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
