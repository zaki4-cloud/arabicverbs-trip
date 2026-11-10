import React, { useState } from 'react';
import { UserCheck, Sparkles, X, Footprints, BookOpen, CheckCircle2, Compass, Layers } from 'lucide-react';
import { soundManager } from '../../utils/audio';
import { GameTrack } from '../../types/game';

interface StudentNameModalProps {
  currentName: string;
  onSaveName: (name: string, trackId?: string, isFreshStart?: boolean) => void;
  canCloseWithoutSaving?: boolean;
  onClose?: () => void;
  tracks?: GameTrack[];
  selectedTrackId?: string;
  onSelectTrack?: (trackId: string) => void;
}

export const StudentNameModal: React.FC<StudentNameModalProps> = ({
  currentName,
  onSaveName,
  canCloseWithoutSaving = false,
  onClose,
  tracks = [],
  selectedTrackId,
  onSelectTrack,
}) => {
  const [name, setName] = useState(currentName || '');
  const [chosenTrackId, setChosenTrackId] = useState<string>(
    selectedTrackId || (tracks.length > 0 ? tracks[0].id : '')
  );
  const [isFreshStart, setIsFreshStart] = useState<boolean>(!currentName);
  const [error, setError] = useState('');

  const handleTrackClick = (tId: string) => {
    setChosenTrackId(tId);
    if (onSelectTrack) {
      onSelectTrack(tId);
    }
    soundManager.playStep();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('נא להקליד שם או כינוי כדי שנוכל להציג את התקדמותך למורה.');
      return;
    }
    soundManager.playStep();
    onSaveName(trimmed, chosenTrackId, isFreshStart);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in select-none overflow-y-auto">
      <div className="bg-slate-900 border-2 border-purple-500/60 rounded-3xl max-w-lg w-full p-5 sm:p-6 text-slate-100 shadow-2xl relative overflow-hidden my-auto max-h-[94vh] flex flex-col justify-between">
        {/* Glow ambient background in purple */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 bg-purple-600/25 rounded-full blur-3xl pointer-events-none" />

        {canCloseWithoutSaving && onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 left-4 text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer z-10"
            title="סגור חלון"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="overflow-y-auto pr-1">
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600/30 to-violet-500/30 border border-purple-400/40 flex items-center justify-center mb-2 shadow-inner">
              <Footprints className="w-7 h-7 text-purple-300 animate-pulse" />
            </div>

            <span className="text-xs font-bold text-purple-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>אסתכשאף | הדרך שלך אל הפועל</span>
            </span>

            <h2 className="text-xl sm:text-2xl font-black text-white">
              ברוכים הבאים למסע!
            </h2>

            <p className="text-xs text-slate-300 mt-1 max-w-sm leading-relaxed">
              הזינו את שמכם ובחרו את נושא המשחק מתוך רשימת המשחקים הקיימים כדי להתחיל בהרפתקה.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Student Name Input */}
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1.5 text-right">
                איך לקרוא לך במסע? <span className="text-purple-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  autoFocus
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="למשל: יובל כהן / שירה / מוחמד / נועם..."
                  className="w-full bg-slate-800 border-2 border-slate-700 focus:border-purple-400 rounded-2xl py-2.5 px-4 text-sm sm:text-base font-semibold text-white placeholder-slate-500 focus:outline-none transition-all text-right shadow-inner"
                />
              </div>
              {error && <p className="text-[11px] text-rose-400 mt-1.5 text-right font-medium">{error}</p>}
            </div>

            {/* Game Topic Selection Section - Strict Zero "רמה" rule */}
            {tracks.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-purple-400" />
                    <span>בחירת נושא / סוג המשחק</span>
                  </span>
                  <span className="text-[11px] text-purple-300">
                    {tracks.length} משחקים זמינים
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 mb-2.5 text-right leading-tight">
                  בחרו מתוך רשימת המשחקים הקיימים את הנושא בו תרצו להתקדם:
                </p>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {tracks.map((track) => {
                    const isSelected = track.id === chosenTrackId;
                    const stageCount = track.stages ? track.stages.length : 0;
                    const questionCount = track.questions ? track.questions.length : 0;

                    return (
                      <div
                        key={track.id}
                        onClick={() => handleTrackClick(track.id)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer text-right flex items-start gap-3 ${
                          isSelected
                            ? 'bg-purple-950/40 border-purple-500 ring-2 ring-purple-400/60 shadow-lg shadow-purple-900/30'
                            : 'bg-slate-800/80 border-slate-700/80 hover:bg-slate-800 hover:border-slate-600'
                        }`}
                      >
                        <div className="mt-0.5 shrink-0">
                          {isSelected ? (
                            <CheckCircle2 className="w-5 h-5 text-purple-400" />
                          ) : (
                            <div className="w-5 h-5 rounded-full border-2 border-slate-600 flex items-center justify-center" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className={`text-xs sm:text-sm font-bold truncate ${isSelected ? 'text-purple-200' : 'text-slate-200'}`}>
                              {track.title}
                            </h4>
                            <span className="text-[10px] bg-slate-900/90 text-slate-300 border border-slate-700/80 px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1">
                              <Layers className="w-2.5 h-2.5 text-purple-400" />
                              <span>{stageCount} שלבים</span>
                            </span>
                          </div>

                          {track.description && (
                            <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                              {track.description}
                            </p>
                          )}

                          <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-400">
                            <span className="flex items-center gap-1">
                              <BookOpen className="w-3 h-3 text-purple-400" />
                              <span>{track.packages?.length || 0} כרטיסיות לימוד</span>
                            </span>
                            <span>•</span>
                            <span>{questionCount} משימות ואתגרים</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Fresh Start / Reset Session Checkbox */}
            <label className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-800/60 border border-slate-700/80 cursor-pointer hover:bg-slate-800 transition-colors">
              <input
                type="checkbox"
                checked={isFreshStart}
                onChange={(e) => setIsFreshStart(e.target.checked)}
                className="w-4 h-4 rounded border-slate-600 text-purple-600 focus:ring-purple-500 bg-slate-900 cursor-pointer"
              />
              <span className="text-xs text-slate-200 font-semibold select-none">
                התחלת מסע חדש מהשלב הראשון (איפוס שאלות וניקוד קודם)
              </span>
            </label>

            <button
              type="submit"
              className="w-full py-3 mt-2 bg-gradient-to-r from-purple-700 via-purple-600 to-indigo-600 hover:from-purple-600 hover:to-indigo-500 text-white font-extrabold text-sm sm:text-base rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-purple-600/35 transition-all active:scale-98 cursor-pointer"
            >
              <UserCheck className="w-5 h-5" />
              <span>יוצאים לדרך 🚀</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
