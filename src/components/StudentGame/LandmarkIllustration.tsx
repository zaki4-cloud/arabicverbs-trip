import React from 'react';
import { LandmarkType } from '../../types/game';

interface LandmarkIllustrationProps {
  type?: LandmarkType;
  className?: string;
}

export const LandmarkIllustration: React.FC<LandmarkIllustrationProps> = ({
  type = 'generic_landmark',
  className = 'w-14 h-14',
}) => {
  switch (type) {
    case 'stone_gate':
      // שער האבן עם ציור שער עץ (Wooden gate illustration as requested)
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Stone pillars on sides */}
          <rect x="12" y="24" width="16" height="66" rx="3" fill="#64748B" stroke="#334155" strokeWidth="2.5" />
          <rect x="72" y="24" width="16" height="66" rx="3" fill="#64748B" stroke="#334155" strokeWidth="2.5" />
          <path d="M10 24L50 14L90 24V28L50 18L10 28Z" fill="#475569" stroke="#1E293B" strokeWidth="2" />
          {/* Wooden Gate doors */}
          <rect x="28" y="28" width="21" height="58" rx="2" fill="#B45309" stroke="#78350F" strokeWidth="2" />
          <rect x="51" y="28" width="21" height="58" rx="2" fill="#92400E" stroke="#78350F" strokeWidth="2" />
          {/* Wood planks texture */}
          <line x1="28" y1="44" x2="49" y2="44" stroke="#78350F" strokeWidth="1.5" />
          <line x1="28" y1="62" x2="49" y2="62" stroke="#78350F" strokeWidth="1.5" />
          <line x1="51" y1="44" x2="72" y2="44" stroke="#78350F" strokeWidth="1.5" />
          <line x1="51" y1="62" x2="72" y2="62" stroke="#78350F" strokeWidth="1.5" />
          {/* Diagonal braces */}
          <line x1="30" y1="32" x2="47" y2="82" stroke="#451A03" strokeWidth="2" strokeDasharray="3 3" />
          <line x1="53" y1="32" x2="70" y2="82" stroke="#451A03" strokeWidth="2" strokeDasharray="3 3" />
          {/* Iron hinges and latch */}
          <circle cx="32" cy="36" r="2.5" fill="#1E293B" />
          <circle cx="32" cy="74" r="2.5" fill="#1E293B" />
          <circle cx="68" cy="36" r="2.5" fill="#1E293B" />
          <circle cx="68" cy="74" r="2.5" fill="#1E293B" />
          <circle cx="50" cy="56" r="3.5" fill="#F59E0B" stroke="#78350F" strokeWidth="1" />
        </svg>
      );

    case 'secret_waterfall':
      // מפל המערה הסודית
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Cave arch */}
          <path d="M14 90C14 42 28 20 50 20C72 20 86 42 86 90H14Z" fill="#1E293B" stroke="#0F172A" strokeWidth="2" />
          {/* Waterfall streams */}
          <path d="M40 28C40 28 42 55 38 88" stroke="#38BDF8" strokeWidth="5" strokeLinecap="round" />
          <path d="M50 26C50 26 52 58 50 88" stroke="#E0F2FE" strokeWidth="6" strokeLinecap="round" />
          <path d="M60 29C60 29 58 56 62 88" stroke="#38BDF8" strokeWidth="5" strokeLinecap="round" />
          {/* Splash pool & spray */}
          <ellipse cx="50" cy="88" rx="30" ry="8" fill="#0284C7" opacity="0.8" />
          <ellipse cx="50" cy="87" rx="20" ry="5" fill="#BAE6FD" />
          <circle cx="36" cy="76" r="2" fill="#E0F2FE" className="animate-pulse" />
          <circle cx="64" cy="78" r="2" fill="#E0F2FE" className="animate-pulse" />
        </svg>
      );

    case 'wild_horses':
      // בקתת סוסי הפרא (בקתה עם שטח פתוח בו סוסים משוטטים)
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Green pasture meadow */}
          <ellipse cx="50" cy="75" rx="44" ry="20" fill="#15803D" stroke="#166534" strokeWidth="2" />
          {/* Wooden Cabin */}
          <polygon points="18,52 38,32 58,52" fill="#92400E" stroke="#78350F" strokeWidth="2" />
          <rect x="22" y="52" width="32" height="28" fill="#B45309" stroke="#78350F" strokeWidth="2" />
          <rect x="33" y="62" width="10" height="18" fill="#451A03" />
          <rect x="42" y="56" width="7" height="7" rx="1" fill="#FEF08A" stroke="#78350F" />
          {/* Rustic Wood Fence */}
          <line x1="58" y1="68" x2="88" y2="68" stroke="#78350F" strokeWidth="2" />
          <line x1="58" y1="76" x2="88" y2="76" stroke="#78350F" strokeWidth="2" />
          <line x1="64" y1="62" x2="64" y2="84" stroke="#451A03" strokeWidth="2.5" />
          <line x1="76" y1="62" x2="76" y2="84" stroke="#451A03" strokeWidth="2.5" />
          <line x1="86" y1="62" x2="86" y2="84" stroke="#451A03" strokeWidth="2.5" />
          {/* Wild Horse silhouette grazing in open pasture */}
          <path d="M70 66C70 62 73 58 76 56L79 50L82 52L80 58C84 59 86 62 86 65L85 75H82L82 68H78L77 75H74L75 67C72 67 71 69 70 66Z" fill="#451A03" />
        </svg>
      );

    case 'hot_springs':
      // עמק המעיינות החמים
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Steaming rocky pools */}
          <path d="M12 76C12 55 24 45 42 45C55 45 60 52 70 52C82 52 90 62 90 76C90 90 78 94 50 94C22 94 12 90 12 76Z" fill="#475569" stroke="#334155" strokeWidth="2" />
          <ellipse cx="44" cy="74" rx="26" ry="12" fill="#06B6D4" />
          <ellipse cx="68" cy="70" rx="14" ry="7" fill="#22D3EE" />
          {/* Rising steam vapors */}
          <path d="M36 58C34 50 38 42 36 34" stroke="#E0F2FE" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 3" className="animate-pulse" />
          <path d="M48 56C50 46 46 38 50 28" stroke="#E0F2FE" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="3 3" className="animate-pulse" />
          <path d="M64 54C62 48 66 40 64 32" stroke="#E0F2FE" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 3" className="animate-pulse" />
          {/* Bubbles */}
          <circle cx="40" cy="72" r="2" fill="#FFF" />
          <circle cx="50" cy="76" r="1.5" fill="#FFF" />
        </svg>
      );

    case 'bridge_trail':
      // גשר השביל
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 80L35 70L65 70L90 80" stroke="#78350F" strokeWidth="6" strokeLinecap="round" />
          <path d="M12 76L88 76" stroke="#B45309" strokeWidth="4" />
          {/* Railings */}
          <line x1="20" y1="62" x2="80" y2="62" stroke="#92400E" strokeWidth="2.5" />
          <line x1="26" y1="62" x2="26" y2="76" stroke="#451A03" strokeWidth="2" />
          <line x1="42" y1="62" x2="42" y2="76" stroke="#451A03" strokeWidth="2" />
          <line x1="58" y1="62" x2="58" y2="76" stroke="#451A03" strokeWidth="2" />
          <line x1="74" y1="62" x2="74" y2="76" stroke="#451A03" strokeWidth="2" />
          {/* Mountain Stream beneath */}
          <path d="M44 78Q50 86 46 95" stroke="#38BDF8" strokeWidth="5" />
          <path d="M54 78Q60 86 56 95" stroke="#0284C7" strokeWidth="4" />
        </svg>
      );

    case 'bat_cave':
      // מערת העטלפים
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Jagged Cave */}
          <path d="M12 90L22 35L42 18L72 24L88 50L84 90H12Z" fill="#1E293B" stroke="#0F172A" strokeWidth="2.5" />
          <path d="M30 90C30 52 42 42 52 42C64 42 72 56 72 90H30Z" fill="#020617" />
          {/* Glowing eyes inside */}
          <circle cx="48" cy="62" r="1.5" fill="#FACC15" />
          <circle cx="54" cy="62" r="1.5" fill="#FACC15" />
          {/* Bats flying out */}
          <path d="M32 34Q36 28 42 32Q38 34 32 34Z" fill="#94A3B8" />
          <path d="M60 26Q65 20 72 24Q67 27 60 26Z" fill="#CBD5E1" />
          <path d="M46 16Q52 10 58 14Q54 18 46 16Z" fill="#F8FAFC" />
        </svg>
      );

    case 'black_rock':
      // מעבר הסלע השחור
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Giant obsidian/basalt monolith rocks */}
          <polygon points="10,90 28,24 46,90" fill="#0F172A" stroke="#334155" strokeWidth="2" />
          <polygon points="52,90 74,18 92,90" fill="#1E293B" stroke="#334155" strokeWidth="2" />
          {/* Center narrow pass path */}
          <polygon points="42,90 48,55 54,90" fill="#D97706" opacity="0.7" />
          <path d="M34 50L44 80" stroke="#64748B" strokeWidth="1.5" />
          <path d="M68 45L78 82" stroke="#64748B" strokeWidth="1.5" />
        </svg>
      );

    case 'white_waterfalls':
      // המפלים הלבנים
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Multi-tier foaming waterfalls */}
          <rect x="24" y="20" width="52" height="70" rx="4" fill="#0369A1" />
          <path d="M30 22V88" stroke="#FFFFFF" strokeWidth="4" strokeDasharray="6 3" />
          <path d="M42 22V88" stroke="#E0F2FE" strokeWidth="6" />
          <path d="M54 22V88" stroke="#FFFFFF" strokeWidth="5" strokeDasharray="8 4" />
          <path d="M66 22V88" stroke="#BAE6FD" strokeWidth="4" />
          <ellipse cx="50" cy="88" rx="38" ry="8" fill="#38BDF8" opacity="0.9" />
          <circle cx="34" cy="82" r="3" fill="#FFF" />
          <circle cx="58" cy="84" r="3" fill="#FFF" />
        </svg>
      );

    case 'heaven_stairs':
      // גרם המדרגות לגן עדן
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Sunbeams and clouds */}
          <path d="M50 8L30 38M50 8L70 38" stroke="#FEF08A" strokeWidth="2" strokeDasharray="3 3" />
          <ellipse cx="50" cy="20" rx="36" ry="12" fill="#E2E8F0" opacity="0.8" />
          {/* Stone stairs climbing high */}
          <rect x="36" y="76" width="28" height="12" rx="2" fill="#E2E8F0" stroke="#64748B" strokeWidth="1.5" />
          <rect x="39" y="64" width="22" height="12" rx="2" fill="#F1F5F9" stroke="#64748B" strokeWidth="1.5" />
          <rect x="42" y="52" width="16" height="12" rx="2" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="1.5" />
          <rect x="45" y="40" width="10" height="12" rx="2" fill="#FEF08A" stroke="#EAB308" strokeWidth="1.5" />
          <polygon points="50,14 54,26 50,38 46,26" fill="#FACC15" />
        </svg>
      );

    case 'rope_bridge':
      // גשר החבלים
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 44Q50 68 92 44" stroke="#78350F" strokeWidth="3" fill="none" />
          <path d="M8 58Q50 78 92 58" stroke="#B45309" strokeWidth="3.5" fill="none" />
          {/* Hanging rope cords */}
          <line x1="24" y1="52" x2="24" y2="64" stroke="#78350F" strokeWidth="1.5" />
          <line x1="38" y1="59" x2="38" y2="70" stroke="#78350F" strokeWidth="1.5" />
          <line x1="50" y1="62" x2="50" y2="72" stroke="#78350F" strokeWidth="1.5" />
          <line x1="62" y1="59" x2="62" y2="70" stroke="#78350F" strokeWidth="1.5" />
          <line x1="76" y1="52" x2="76" y2="64" stroke="#78350F" strokeWidth="1.5" />
          {/* Canyon depth below */}
          <polygon points="0,90 20,40 30,90" fill="#1E293B" />
          <polygon points="70,90 80,40 100,90" fill="#1E293B" />
        </svg>
      );

    case 'oasis':
      // נווה מדבר: איור של מעיין קטן מוקף בעצי דקל ומעט שיחים
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Golden Sand Dune */}
          <ellipse cx="50" cy="80" rx="46" ry="16" fill="#F59E0B" stroke="#D97706" strokeWidth="2" />
          {/* Blue Spring Water */}
          <ellipse cx="48" cy="78" rx="24" ry="9" fill="#06B6D4" stroke="#0891B2" strokeWidth="2" />
          <ellipse cx="46" cy="77" rx="16" ry="5" fill="#67E8F9" />
          {/* Palm Tree 1 */}
          <path d="M34 76Q30 50 36 34" stroke="#78350F" strokeWidth="3.5" strokeLinecap="round" />
          {/* Palm Fronds */}
          <path d="M36 34Q22 24 16 32" stroke="#16A34A" strokeWidth="3" strokeLinecap="round" />
          <path d="M36 34Q36 16 32 14" stroke="#15803D" strokeWidth="3" strokeLinecap="round" />
          <path d="M36 34Q50 22 56 30" stroke="#22C55E" strokeWidth="3" strokeLinecap="round" />
          {/* Palm Tree 2 (Smaller) */}
          <path d="M62 76Q66 58 64 42" stroke="#78350F" strokeWidth="3" strokeLinecap="round" />
          <path d="M64 42Q52 32 48 38" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M64 42Q76 30 82 38" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" />
          {/* Desert Shrubs */}
          <circle cx="24" cy="78" r="4" fill="#15803D" />
          <circle cx="74" cy="80" r="5" fill="#16A34A" />
        </svg>
      );

    case 'volcano':
      // טיפוס להר הגעש: איור של דרך המובילה להר געש
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Volcano mountain cone */}
          <polygon points="12,88 42,28 58,28 88,88" fill="#450A0A" stroke="#7F1D1D" strokeWidth="2" />
          {/* Crater with glowing magma & smoke */}
          <ellipse cx="50" cy="28" rx="8" ry="3" fill="#DC2626" />
          <path d="M46 25C44 14 54 8 50 2" stroke="#EF4444" strokeWidth="3" strokeLinecap="round" strokeDasharray="3 2" className="animate-pulse" />
          {/* Lava drips */}
          <path d="M44 28L42 50L46 62" stroke="#EF4444" strokeWidth="2.5" />
          <path d="M54 28L58 46L54 58" stroke="#F97316" strokeWidth="2" />
          {/* Winding climb path */}
          <path d="M22 88Q40 76 52 70Q66 64 54 48Q46 36 50 28" stroke="#FDE047" strokeWidth="2.5" strokeDasharray="3 2" />
        </svg>
      );

    case 'ancient_ruins':
      // העיר העתיקה: איור של חורבות עיר עתיקה
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Sandstone columns & ancient arch */}
          <rect x="18" y="42" width="12" height="46" rx="2" fill="#D97706" stroke="#92400E" strokeWidth="2" />
          <rect x="70" y="42" width="12" height="46" rx="2" fill="#D97706" stroke="#92400E" strokeWidth="2" />
          {/* Broken center pillar */}
          <rect x="44" y="60" width="12" height="28" rx="2" fill="#B45309" stroke="#78350F" strokeWidth="2" />
          {/* Pediment arch banner */}
          <path d="M12 42L50 22L88 42H12Z" fill="#F59E0B" stroke="#B45309" strokeWidth="2" />
          <circle cx="50" cy="34" r="3.5" fill="#FEF3C7" />
          <line x1="22" y1="52" x2="26" y2="76" stroke="#78350F" strokeWidth="1" />
          <line x1="74" y1="52" x2="78" y2="76" stroke="#78350F" strokeWidth="1" />
        </svg>
      );

    case 'sun_pyramid':
      // פירמידת השמש
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Radiant Sun in sky */}
          <circle cx="50" cy="22" r="12" fill="#FBBF24" />
          <circle cx="50" cy="22" r="8" fill="#F59E0B" />
          <line x1="50" y1="4" x2="50" y2="9" stroke="#F59E0B" strokeWidth="2" />
          <line x1="68" y1="22" x2="73" y2="22" stroke="#F59E0B" strokeWidth="2" />
          <line x1="32" y1="22" x2="27" y2="22" stroke="#F59E0B" strokeWidth="2" />
          {/* Stepped Pyramid */}
          <polygon points="10,90 26,68 74,68 90,90" fill="#D97706" stroke="#B45309" strokeWidth="1.5" />
          <polygon points="24,68 36,48 64,48 76,68" fill="#F59E0B" stroke="#B45309" strokeWidth="1.5" />
          <polygon points="34,48 42,36 58,36 66,48" fill="#FBBF24" stroke="#D97706" strokeWidth="1.5" />
          {/* Central stairway */}
          <polygon points="46,90 48,36 52,36 54,90" fill="#78350F" />
        </svg>
      );

    case 'ghost_valley':
      // עמק הרפאים: איור של ואדי עם מצוקי בזלת משני צידיו
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Flanking basalt sheer cliffs */}
          <polygon points="0,90 28,15 36,90" fill="#1E293B" stroke="#0F172A" strokeWidth="2" />
          <polygon points="64,90 72,15 100,90" fill="#1E293B" stroke="#0F172A" strokeWidth="2" />
          {/* Wadi canyon riverbed */}
          <polygon points="32,90 48,50 52,50 68,90" fill="#78350F" />
          {/* Ghostly fog layers */}
          <path d="M22 65Q50 55 78 65" stroke="#E2E8F0" strokeWidth="3" opacity="0.6" strokeLinecap="round" />
          <path d="M26 80Q50 72 74 80" stroke="#CBD5E1" strokeWidth="4" opacity="0.5" strokeLinecap="round" />
        </svg>
      );

    case 'snow_peak':
      // פסגת השלג
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Mountain base */}
          <polygon points="8,90 50,16 92,90" fill="#334155" stroke="#1E293B" strokeWidth="2" />
          {/* Pure snowcap */}
          <polygon points="34,45 50,16 66,45 58,40 50,46 42,40" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
          {/* Ridge shadows */}
          <polygon points="50,16 50,90 92,90" fill="#1E293B" opacity="0.4" />
          <circle cx="50" cy="14" r="2" fill="#E0F2FE" />
        </svg>
      );

    case 'turquoise_lake':
      // אגם הטורקיז
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Alpine mountains reflection */}
          <polygon points="15,62 35,28 55,62" fill="#475569" />
          <polygon points="45,62 65,34 85,62" fill="#64748B" />
          {/* Crystalline turquoise lake */}
          <ellipse cx="50" cy="74" rx="42" ry="18" fill="#14B8A6" stroke="#0D9488" strokeWidth="2.5" />
          <ellipse cx="50" cy="73" rx="30" ry="10" fill="#5EEAD4" />
          {/* Water ripples */}
          <path d="M38 72Q50 75 62 72" stroke="#CCFBF1" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case 'abyss_trail':
      // שביל התהום
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Sheer cliff precipice */}
          <polygon points="0,0 60,0 50,90 0,90" fill="#334155" stroke="#1E293B" strokeWidth="2" />
          {/* The deep bottomless abyss on right */}
          <rect x="52" y="0" width="48" height="100" fill="#020617" />
          {/* Narrow ledge path */}
          <path d="M10 80L48 54L42 20" stroke="#F59E0B" strokeWidth="4" strokeDasharray="4 2" />
          {/* Warning sign / flag */}
          <line x1="48" y1="44" x2="48" y2="58" stroke="#EF4444" strokeWidth="2" />
          <polygon points="48,44 56,48 48,52" fill="#EF4444" />
        </svg>
      );

    case 'dark_forest':
      // היער החשוך
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Dark enchanted pines */}
          <polygon points="24,86 34,42 44,86" fill="#064E3B" stroke="#022C22" strokeWidth="2" />
          <polygon points="56,86 66,42 76,86" fill="#064E3B" stroke="#022C22" strokeWidth="2" />
          <polygon points="38,88 50,30 62,88" fill="#047857" stroke="#065F46" strokeWidth="2" />
          {/* Glowing fireflies / mystic orbs */}
          <circle cx="34" cy="54" r="2.5" fill="#A7F3D0" className="animate-ping" />
          <circle cx="64" cy="60" r="2.5" fill="#FDE047" className="animate-pulse" />
          <circle cx="50" cy="45" r="2" fill="#6EE7B7" />
        </svg>
      );

    case 'cliff_climb':
      // טיפוס לצוק
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Vertical granite wall */}
          <rect x="20" y="10" width="60" height="80" rx="3" fill="#475569" stroke="#334155" strokeWidth="2.5" />
          {/* Ledges & cracks */}
          <line x1="24" y1="36" x2="52" y2="36" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />
          <line x1="46" y1="62" x2="74" y2="62" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />
          {/* Climbing rope */}
          <path d="M50 12V88" stroke="#F59E0B" strokeWidth="2.5" strokeDasharray="5 3" />
          {/* Anchor pitons */}
          <circle cx="50" cy="24" r="3" fill="#E2E8F0" stroke="#0F172A" strokeWidth="1" />
          <circle cx="50" cy="52" r="3" fill="#E2E8F0" stroke="#0F172A" strokeWidth="1" />
          <circle cx="50" cy="78" r="3" fill="#E2E8F0" stroke="#0F172A" strokeWidth="1" />
        </svg>
      );

    default:
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="40" fill="#3B82F6" stroke="#1D4ED8" strokeWidth="4" />
          <circle cx="50" cy="50" r="18" fill="#93C5FD" />
        </svg>
      );
  }
};
