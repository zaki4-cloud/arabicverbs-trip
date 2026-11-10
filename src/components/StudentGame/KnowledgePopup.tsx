import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, CheckCircle2, BookOpen, Layers, Clock, Users, Volume2, ChevronDown } from 'lucide-react';
import { KnowledgePackage } from '../../types/game';
import { soundManager } from '../../utils/audio';
import { speakArabic } from '../../utils/speech';
import { PedagogicalExplanationView } from '../Common/PedagogicalExplanationView';
import { resolveImageUrl } from '../../utils/imageUrl';

interface KnowledgePopupProps {
  pkg: KnowledgePackage;
  onUnderstood: (bonusPoints: number) => void;
  onClose: () => void;
}

export const KnowledgePopup: React.FC<KnowledgePopupProps> = ({
  pkg,
  onUnderstood,
  onClose,
}) => {
  const [isCollecting, setIsCollecting] = useState(false);
  const [canScrollMore, setCanScrollMore] = useState(false);
  const scrollBodyRef = useRef<HTMLDivElement>(null);

  const checkScroll = () => {
    if (!scrollBodyRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollBodyRef.current;
    // Show prompt if there are more than 40px left to scroll
    setCanScrollMore(scrollHeight - (scrollTop + clientHeight) > 40);
  };

  useEffect(() => {
    // Check initial scrollability after render
    const timer = setTimeout(checkScroll, 100);
    const el = scrollBodyRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll);
    }
    window.addEventListener('resize', checkScroll);

    return () => {
      clearTimeout(timer);
      if (el) {
        el.removeEventListener('scroll', checkScroll);
      }
      window.removeEventListener('resize', checkScroll);
    };
  }, [pkg]);

  const handleUnderstoodClick = () => {
    if (isCollecting) return;
    setIsCollecting(true);
    soundManager.playCoinPickup();

    setTimeout(() => {
      onUnderstood(50); // 50 bonus points
    }, 450);
  };

  const handlePronounce = (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    speakArabic(text);
  };

  const handleScrollDown = () => {
    if (scrollBodyRef.current) {
      scrollBodyRef.current.scrollBy({ top: 220, behavior: 'smooth' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in select-none">
      <div className="relative bg-[#0B1120] border border-slate-700/80 rounded-2xl max-w-2xl w-full max-h-[92vh] sm:max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header Banner - Dark Navy with Vivid Gold Accent */}
        <div className="relative bg-[#0B1120] p-4 sm:p-5 border-b border-slate-800/80 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center shrink-0 shadow-sm">
              <Sparkles className="w-6 h-6 text-[#FACC15]" />
            </div>
            <div>
              <span className="text-xs font-bold text-[#FACC15] block tracking-wide">
                גילוי אוצר הידע · תחנת למידה
              </span>
              <h2 className="text-base sm:text-lg font-extrabold text-white truncate max-w-md">
                {pkg.title}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg text-sm cursor-pointer transition-colors"
            title="סגור חלון"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Content Body with smooth scrolling and generous room */}
        <div
          ref={scrollBodyRef}
          className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 text-[#E2E8F0] scrollbar-thin scrollbar-thumb-slate-700 overscroll-contain"
        >
          {/* Metadata badges - Dark Glassmorphism chips */}
          <div className="flex flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-1.5 bg-[#0f172a]/90 backdrop-blur-sm border border-slate-700/80 px-2.5 py-1 rounded-lg text-[#E2E8F0]">
              <Layers className="w-3.5 h-3.5 text-[#FACC15]" />
              <span>{pkg.binyanim.join(', ')}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-[#0f172a]/90 backdrop-blur-sm border border-slate-700/80 px-2.5 py-1 rounded-lg text-[#E2E8F0]">
              <Clock className="w-3.5 h-3.5 text-[#FACC15]" />
              <span>{pkg.tenses.join(', ')}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-[#0f172a]/90 backdrop-blur-sm border border-slate-700/80 px-2.5 py-1 rounded-lg text-[#E2E8F0]">
              <Users className="w-3.5 h-3.5 text-[#FACC15]" />
              <span>{pkg.persons.join(', ')}</span>
            </div>
          </div>

          {/* Explanation Section - Dark Glassmorphism Card */}
          <div className="bg-[#0f172a]/80 backdrop-blur-md border border-slate-700/60 rounded-2xl p-4 sm:p-5 shadow-lg">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-[#FACC15] mb-3 border-b border-slate-700/60 pb-2">
              <BookOpen className="w-4 h-4 text-[#FACC15]" />
              <span>הסבר וכלל דקדוקי:</span>
            </div>
            <PedagogicalExplanationView explanation={pkg.explanation} />
          </div>

          {/* Illustrated Examples with Speech Audio Pronunciation */}
          <div className="bg-[#0f172a]/80 backdrop-blur-md border border-slate-700/60 rounded-2xl p-4 sm:p-5 shadow-lg space-y-3">
            <div className="flex items-center justify-between border-b border-slate-700/60 pb-2.5">
              <h3 className="text-xs sm:text-sm font-bold text-[#FACC15]">
                דוגמאות מומחשות עם ניקוד פנימי והגייה קולית:
              </h3>
              <span className="text-[11px] text-[#FACC15] flex items-center gap-1">
                <Volume2 className="w-3.5 h-3.5" />
                <span>לחצו להשמעה</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {pkg.examples.map((eg, idx) => (
                <div
                  key={idx}
                  className="bg-[#0b1220]/90 border border-slate-700/70 hover:border-amber-400/40 transition-colors p-3.5 rounded-xl flex flex-col justify-between shadow-sm"
                >
                  <div className="flex items-center justify-between gap-2 border-b border-slate-700/60 pb-2 mb-2">
                    <button
                      onClick={(e) => handlePronounce(eg.arabic, e)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[#FACC15] border border-amber-500/30 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold"
                      title="השמע הגייה אותנטית בערבית"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>השמע</span>
                    </button>

                    <div className="text-right">
                      <span className="text-2xl font-bold font-arabic text-[#FACC15] block leading-normal">
                        {eg.arabic}
                      </span>
                      {eg.transliteration && (
                        <span className="text-[11px] text-slate-400 font-mono">
                          ({eg.transliteration})
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="text-xs sm:text-sm font-semibold text-[#E2E8F0] block">
                      {eg.hebrew}
                    </span>
                    {eg.note && (
                      <span className="text-[11px] text-amber-300/90 block mt-1">
                        💡 {eg.note}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Accompanying Visual Card / Image */}
          {pkg.imageUrl && (
            <div className="rounded-2xl overflow-hidden border border-slate-700/70 bg-[#0b1220] shadow-md">
              <img
                src={resolveImageUrl(pkg.imageUrl)}
                alt={pkg.title}
                referrerPolicy="no-referrer"
                className="w-full max-h-56 sm:max-h-64 object-contain mx-auto opacity-95 hover:opacity-100 transition-opacity"
              />
            </div>
          )}
        </div>

        {/* Floating Scroll Indicator if user can scroll down */}
        {canScrollMore && (
          <button
            type="button"
            onClick={handleScrollDown}
            className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-[#0B1120]/95 hover:bg-[#0f172a] text-[#FACC15] border border-amber-400/40 px-4 py-1.5 rounded-full text-xs font-bold shadow-2xl flex items-center gap-1.5 animate-bounce z-20 cursor-pointer backdrop-blur-sm transition-all"
          >
            <span>גללו למטה לעוד תוכן ודוגמאות</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#FACC15]" />
          </button>
        )}

        {/* Footer Action: The Mandatory Prominent "הבנתי!" Button in Vibrant Purple */}
        <div className="p-4 bg-[#0B1120] border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#FACC15] shrink-0" />
            <span>סגירה תעניק לכם 50 נקודות בונוס בתרמיל המסע!</span>
          </div>

          <button
            onClick={handleUnderstoodClick}
            disabled={isCollecting}
            className={`relative overflow-hidden w-full sm:w-auto px-7 py-2.5 bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-500 hover:from-purple-500 hover:to-indigo-400 text-white font-black text-sm rounded-xl shadow-lg shadow-purple-600/35 flex items-center justify-center gap-2 transform active:scale-95 transition-all cursor-pointer ${
              isCollecting ? 'ring-4 ring-amber-300 scale-105' : ''
            }`}
          >
            {isCollecting ? (
              <span className="flex items-center gap-1.5 animate-bounce font-black text-white text-base">
                <span>+50 נקודות בונוס!</span>
                <span className="text-xl">💎</span>
              </span>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>הבנתי! ממשיכים במסע</span>
              </>
            )}
            {isCollecting && (
              <span className="absolute inset-0 bg-white/30 animate-ping rounded-xl pointer-events-none" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
