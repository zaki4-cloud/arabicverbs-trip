import React from 'react';
import { Lightbulb, Bookmark } from 'lucide-react';
import { parseExplanationText, ExplanationSection } from '../../utils/pedagogicalText';

interface PedagogicalExplanationViewProps {
  explanation: string;
  className?: string;
  previewOnly?: boolean;
}

/**
 * Formats inline bold text (**bold**) and highlights in strings
 */
function renderFormattedInlineText(text: string) {
  // Split on **bold** patterns
  const parts = text.split(/(\*\*.*?\*\*)/g);

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      const inner = part.slice(2, -2);
      return (
        <strong key={index} className="font-bold text-white bg-slate-800/80 px-1 py-0.5 rounded border border-slate-700/60">
          {inner}
        </strong>
      );
    }
    return <span key={index}>{part}</span>;
  });
}

export const PedagogicalExplanationView: React.FC<PedagogicalExplanationViewProps> = ({
  explanation,
  className = '',
  previewOnly = false
}) => {
  const sections: ExplanationSection[] = parseExplanationText(explanation);

  if (!sections || sections.length === 0 || !explanation.trim()) {
    return (
      <div className={`p-4 text-center text-xs text-slate-400 bg-[#0f172a]/70 rounded-xl border border-dashed border-slate-700 ${className}`}>
        טרם נרשם הסבר לחבילת ידע זו.
      </div>
    );
  }

  return (
    <div className={`space-y-4 text-[#E2E8F0] ${className}`}>
      {sections.map((section, idx) => {
        const isTip = section.type === 'tip' || section.content.startsWith('💡') || section.content.includes('דגש:');
        const lines = section.content.split('\n');

        // Check if content consists of bullet points
        const hasBullets = lines.some((l) => /^\s*([•\-\*]|\d+\.)\s+/.test(l));

        return (
          <div
            key={section.id || idx}
            className={`transition-all rounded-2xl p-4 sm:p-5 ${
              isTip
                ? 'bg-[#0f172a]/90 backdrop-blur-md border border-amber-500/40 shadow-lg'
                : 'bg-[#0f172a]/80 backdrop-blur-md border border-slate-700/60 shadow-md hover:border-slate-600 transition-colors'
            }`}
          >
            {/* Enlarged Heading in Vivid Gold without glow */}
            {section.heading && (
              <div className="flex items-center gap-2.5 pb-2.5 mb-3 border-b border-slate-700/60">
                <div className="w-7 h-7 rounded-lg bg-amber-400/10 border border-amber-400/30 flex items-center justify-center shrink-0">
                  {isTip ? (
                    <Lightbulb className="w-4 h-4 text-[#FACC15]" />
                  ) : (
                    <Bookmark className="w-4 h-4 text-[#FACC15]" />
                  )}
                </div>
                <h3 className="text-base sm:text-lg font-bold text-[#FACC15] tracking-wide">
                  {section.heading}
                </h3>
              </div>
            )}

            {/* Paragraph Body with generous line spacing & #E2E8F0 color */}
            {hasBullets ? (
              <ul className="space-y-2 text-xs sm:text-sm text-[#E2E8F0] leading-relaxed list-none">
                {lines.map((line, lIdx) => {
                  const bulletMatch = line.match(/^\s*([•\-\*]|\d+\.)\s*(.*)$/);
                  if (bulletMatch) {
                    return (
                      <li key={lIdx} className="flex items-start gap-2.5">
                        <span className="text-[#FACC15] font-black shrink-0 mt-0.5">•</span>
                        <div className="flex-1 leading-relaxed text-[#E2E8F0]">
                          {renderFormattedInlineText(bulletMatch[2])}
                        </div>
                      </li>
                    );
                  }
                  if (!line.trim()) return <div key={lIdx} className="h-1.5" />;
                  return (
                    <li key={lIdx} className="text-[#E2E8F0] leading-relaxed">
                      {renderFormattedInlineText(line)}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="space-y-2 text-xs sm:text-sm sm:text-[14.5px] leading-relaxed sm:leading-loose text-[#E2E8F0] whitespace-pre-line tracking-wide">
                {renderFormattedInlineText(section.content)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
