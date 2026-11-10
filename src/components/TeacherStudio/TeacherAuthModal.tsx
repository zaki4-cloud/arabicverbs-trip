import React, { useState } from 'react';
import { Lock, KeyRound, Eye, EyeOff, X, ArrowLeft } from 'lucide-react';
import { soundManager } from '../../utils/audio';

interface TeacherAuthModalProps {
  onSuccess: () => void;
  onClose: () => void;
}

export const TeacherAuthModal: React.FC<TeacherAuthModalProps> = ({
  onSuccess,
  onClose,
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim() === 'Z0404') {
      soundManager.playSuccess();
      onSuccess();
    } else {
      soundManager.playGentleMistake();
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in select-none">
      <div className="bg-slate-900 border-2 border-teal-500/60 rounded-3xl max-w-sm w-full p-6 text-slate-100 shadow-2xl relative overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-4 left-4 text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          title="ביטול"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center mb-5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-teal-500/20 to-sky-500/30 border border-teal-400/40 flex items-center justify-center mb-2.5 shadow-inner">
            <Lock className="w-7 h-7 text-teal-400" />
          </div>

          <h2 className="text-lg font-black text-white">כניסה לממשק המורה</h2>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            האזור מיועד למורים בלבד לעריכת חבילות ידע, רמות ומעקב הישגים.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 text-right">
              סיסמת מורה:
            </label>
            <div className={`relative ${error ? 'animate-shake' : ''}`}>
              <input
                type={showPassword ? 'text' : 'password'}
                autoFocus
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(false);
                }}
                placeholder="הקלידו סיסמה..."
                className={`w-full bg-slate-800 border-2 rounded-xl py-2.5 px-3.5 pr-9 text-sm text-white placeholder-slate-500 focus:outline-none transition-colors text-right font-mono ${
                  error
                    ? 'border-rose-500 bg-rose-950/20'
                    : 'border-slate-700 focus:border-teal-400'
                }`}
              />
              <KeyRound className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                title={showPassword ? 'הסתר סיסמה' : 'הצג סיסמה'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {error && (
              <p className="text-[11px] text-rose-400 mt-1.5 text-right font-semibold">
                סיסמה שגויה. נסו שוב.
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl cursor-pointer"
            >
              ביטול
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-teal-600/30 cursor-pointer transition-all active:scale-98"
            >
              <span>אישור כניסה</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
