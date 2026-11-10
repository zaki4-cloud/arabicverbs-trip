import React, { useState } from 'react';
import {
  Layers,
  Code2,
  Smartphone,
  Cpu,
  Copy,
  Check,
  Download,
  BookOpen,
  ArrowRight,
  Sparkles,
  GitBranch,
  Volume2
} from 'lucide-react';

interface GDevelopSpecHubProps {
  onReturnToGame: () => void;
}

export const GDevelopSpecHub: React.FC<GDevelopSpecHubProps> = ({ onReturnToGame }) => {
  const [copied, setCopied] = useState(false);
  const [activeSection, setActiveSection] = useState<'architecture' | 'events' | 'variables' | 'pedagogy'>('architecture');

  const gdevelopJsonStructure = {
    gdevelopVersion: '5.4.x',
    projectName: 'ArabicGrammarAdventure',
    gameResolution: { width: 720, height: 1280, orientation: 'portrait' },
    globalVariables: [
      { name: 'CurrentScore', type: 'number', value: 0 },
      { name: 'GemsCollected', type: 'number', value: 0 },
      { name: 'CurrentStageIndex', type: 'number', value: 0 },
      { name: 'TotalStages', type: 'number', value: 4 },
      { name: 'SoundMuted', type: 'boolean', value: false },
      { name: 'StageQuestionsCompleted', type: 'number', value: 0 },
      { name: 'TotalStageQuestions', type: 'number', value: 2 }
    ],
    layers: [
      { name: 'BackgroundNature', cameraLocked: false, isUi: false },
      { name: 'AdventurePath', cameraLocked: false, isUi: false },
      { name: 'GameEntities', cameraLocked: false, isUi: false },
      { name: 'HUD_Layer', cameraLocked: true, isUi: true },
      { name: 'Modal_Dialogue_Layer', cameraLocked: true, isUi: true }
    ],
    objects: [
      { name: 'PlayerCharacter', type: 'Sprite', behaviors: ['Draggable', 'TopDownMovement'] },
      { name: 'TreasureChest', type: 'Sprite', behaviors: ['Tween'] },
      { name: 'QuestionStationTotem', type: 'Sprite', behaviors: ['Tween'] },
      { name: 'KnowledgeDialogueBox', type: 'PanelSprite', layer: 'Modal_Dialogue_Layer' },
      { name: 'ArabicTextDisplay', type: 'BBCodeText', font: 'Amiri-Bold.ttf', layer: 'Modal_Dialogue_Layer' },
      { name: 'UnderstoodButton', type: 'Button', layer: 'Modal_Dialogue_Layer' },
      { name: 'MultipleChoiceCard', type: 'PanelSprite', layer: 'Modal_Dialogue_Layer' },
      { name: 'MatchingPairTile', type: 'PanelSprite', behaviors: ['Draggable'], layer: 'Modal_Dialogue_Layer' }
    ]
  };

  const fullMarkdownSpec = `# מפרט טכני, ארכיטקטורה ומתודולוגיה פדגוגית מלאה להקמת המשחק ב-GDevelop 5
## משחק מובייל: "הרפתקת הדקדוק בערבית" (תרגול בניינים והטיות פעלים לחטיבה העליונה)

### 1. מטרת המשחק ורציונל פדגוגי
- **קהל יעד**: תלמידי תיכון הלומדים לבחינת הבגרות בערבית (3, 4 ו-5 יח"ל).
- **דיסציפלינה**: דקדוק ותחביר ערבי (אלקואעד) בדגש על הטיות פעלים, זיהוי בניינים (I-X), זמנים (עבר, עתיד), גופים ותרגום.
- **פלטפורמת פיתוח**: GDevelop 5 (מנוע 2D מבוסס אירועים ללא שורות קוד).
- **חוויית משתמש (UX)**: 
  * **אוריינטציה אנכית טבעית למובייל (Portrait 720x1280)**: המסלול מטפס מלמטה למעלה בצורה מושלמת לאחיזת סמארטפון ביד אחת.
  * **הזזת דמות רציפה (Continuous Touch Drag)**: הלומד נוגע בדמות או במסך וגורר אותה באופן חלק ורציף לאורך השביל. ללא חסימת מסך ע"י פדים.
  * **חלוקה לשלבים (Stages)**: מעבר לשלב הבא מותנה במענה על כל שאלות השלב (אך אינו מותנה בפתיחת אוצרות הידע).
  * **נוף דינמי משתנה**: עם המעבר בין שלבים, תמונת הרקע מתחלפת בצורה חלקה (מעבר הרים אנכי -> קניון נהר גועש -> צוקי טיפוס -> פסגת ההר המוזהבת).
  * **משוב שוויוני ומכבד**: פנייה בלשון טבעית ומשלבת ("כל הכבוד!", "עניתם נכון!", "ממשיכים בהרפתקה").
  * **הגייה קולית אותנטית**: כפתור שמע המשמיע את הפועל בערבית עם ניקוד פנימי מדויק.

---

### 2. ארכיטקטורת שכבות ועצמים (Scene & Object Hierarchy) ב-GDevelop
1. **BackgroundNature (Layer 0)**:
   - רקע נוף דינמי המשתנה לפי שלב (Change image of Sprite object BackgroundImage to "StageBackground_" + ToString(GlobalVariable(CurrentStageIndex))).
2. **AdventurePath (Layer 1)**:
   - שביל טבע, גשרי עץ ואבני מדרך לחציית מים.
3. **GameEntities (Layer 2)**:
   - \`PlayerCharacter\`: ספרייט דמות הרפתקן הנע לעבר מיקום לחיצת המגע (X, Y) באמצעות פעולת Tween Position או Top-down movement.
   - \`TreasureGem\`: אובייקט יהלום/תיבה (רשות) הפותח חלון ידע ומעניק 50 נקודות בונוס.
   - \`QuestionGate\`: תחנת שאלה (חובה למעבר שלב) המסומנת בסימן שאלה או וי מוזהב בסיום.
4. **HUD_Layer (Layer 3 - Camera Locked)**:
   - מד ניקוד, מונה יהלומים, מונה שאלות שנותרו בשלב וכפתור השתקת שמע.
5. **Modal_Dialogue_Layer (Layer 4 - Hidden by default)**:
   - \`OverlayBackdrop\`: חסימת לחיצות ברקע.
   - \`ArabicCalligraphyText\`: אובייקט טקסט BBCode בגופן Amiri עם ניקוד פנימי מלא.
   - \`PronounceButton\`: כפתור המפעיל את הרחבת Text-to-Speech של GDevelop (או השמעת קובץ Audio ייעודי).
   - \`UnderstoodBtn\`: כפתור "הבנתי! ממשיכים בהרפתקה".

---

### 3. מבנה המשתנים (Variables Architecture)
- **Global Variables**:
  * \`GlobalVariable(CurrentScore)\` (Number)
  * \`GlobalVariable(GemsCount)\` (Number)
  * \`GlobalVariable(CurrentStageIndex)\` (Number, 0)
  * \`GlobalVariable(SoundEnabled)\` (Boolean, true)
  * \`GlobalVariable(StageQuestionsAnswered)\` (Number, 0)
  * \`GlobalVariable(StageTotalQuestions)\` (Number, 2)
- **Scene Variables**:
  * \`SceneVariable(IsDialogueActive)\` (Boolean) - חוסם תנועת דמות כשיש חלון קופץ.
  * \`SceneVariable(SelectedLeftCard)\` (String) - מזהה כרטיסיית ערבית שנבחרה.
  * \`SceneVariable(SelectedRightCard)\` (String) - מזהה כרטיסיית עברית שנבחרה.

---

### 4. גיליונות האירועים (Event Sheet Logic) ב-GDevelop
#### אירוע א': תנועת הדמות בלחיצה חופשית על המסך
- **תנאים (Conditions)**:
  * Mouse button or Touch released
  * Cursor/Touch is NOT on any UI button
  * \`SceneVariable(IsDialogueActive)\` == false
- **פעולות (Actions)**:
  * Tween Position of \`PlayerCharacter\` to \`MouseX()\` and \`MouseY()\` with duration 0.4s (EaseOutQuad)
  * Play sound "Footstep.wav"

#### אירוע ב': פתיחת אוצר ידע (רשות בלבד)
- **תנאים (Conditions)**:
  * Cursor/Touch is on \`TreasureGem\`
  * Mouse button or Touch released
- **פעולות (Actions)**:
  * Set \`SceneVariable(IsDialogueActive)\` = true
  * Show layer "Modal_Dialogue_Layer"
  * Populate explanation and play "TreasureChime.wav"

#### אירוע ג': סגירת אוצר בלחיצה על "הבנתי! ממשיכים בהרפתקה"
- **תנאים (Conditions)**:
  * Cursor/Touch on \`UnderstoodBtn\`
  * Mouse button or Touch released
- **פעולות (Actions)**:
  * Add 50 to \`GlobalVariable(CurrentScore)\`
  * Add 1 to \`GlobalVariable(GemsCount)\`
  * Hide layer "Modal_Dialogue_Layer"
  * Set \`SceneVariable(IsDialogueActive)\` = false
  * Delete \`TreasureGem\`

#### אירוע ד': מעבר שלב אוטומטי במענה על כל השאלות
- **תנאים (Conditions)**:
  * \`GlobalVariable(StageQuestionsAnswered)\` >= \`GlobalVariable(StageTotalQuestions)\`
  * Trigger once while true
- **פעולות (Actions)**:
  * Show \`StagePassModal\` with text: "כל הכבוד! עברתם לשלב הבא!"
  * Play sound "VictoryFanfare.wav"
  * On Click "ממשיכים לשלב הבא":
    - Add 1 to \`GlobalVariable(CurrentStageIndex)\`
    - Change Background sprite animation to next landscape
    - Reset \`PlayerCharacter\` position to stage entrance
    - Reset \`GlobalVariable(StageQuestionsAnswered)\` = 0


#### אירוע ד': שאלת התאמת צמדים (Matching Pairs)
- **תנאים (Conditions)**:
  * User taps/clicks on a card in column 1 (Arabic) -> Set \`SelectedLeftCard\` = card.Variable(ID), glow outline
  * User taps/clicks on a card in column 2 (Hebrew) -> Set \`SelectedRightCard\` = card.Variable(ID)
- **בדיקת התאמה**:
  * If \`SelectedLeftCard\` == \`SelectedRightCard\`:
    - Play match sound
    - Lock both cards in Green state (Tween to dim/done)
    - Increment \`MatchedPairsCount\`
    - If \`MatchedPairsCount\` == \`TotalPairs\`: Add 150 points, celebrate and advance!
  * Else:
    - Play gentle shake Tween on both cards
    - Reset \`SelectedLeftCard\` and \`SelectedRightCard\` to empty string.

---

### 5. שיקולים טכניים מיוחדים למובייל ב-GDevelop
1. **עיבוד טקסט בערבית (RTL & Harakat)**:
   - ב-GDevelop, מומלץ להשתמש ב-BBCode Text Object ולהטמיע קובץ פונט TTF תומך מלא (כגון Amiri או Scheherazade New).
   - תמיכה בכיווניות מימין לשמאל: הגדרת Text Alignment ל-"Right".
2. **ניהול מגע (Mobile Touch Input)**:
   - הפעלת הרחבת "Multitouch" כדי למנוע נעילת מסך או בעיות גרירה במסכי מגע סלולריים.
   - מינימום אזור מגע (Touch Target) לכפתורים: לפחות 48x48 פיקסלים.
3. **אופטימיזציית ביצועים**:
   - שמירת תמונות בפורמט WebP דחוס.
   - איחוד אובייקטים חוזרים באמצעות Families (למשל: \`Family_Cards\` עבור כרטיסיות המשחק).
`;

  const handleCopySpec = () => {
    navigator.clipboard.writeText(fullMarkdownSpec);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSpec = () => {
    const blob = new Blob([fullMarkdownSpec], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'GDevelop_Arabic_Grammar_Game_Specification.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadJsonBlueprint = () => {
    const blob = new Blob([JSON.stringify(gdevelopJsonStructure, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'GDevelop_Arabic_Game_Blueprint.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-white">
              מפרט טכני וארכיטקטורה מלאה ל-GDevelop 5
            </h1>
            <p className="text-xs text-slate-400">
              המדריך המלא לבניית המשחק ללא קוד: עצמים, משתנים, שכבות וגיליונות אירועים
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopySpec}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'הועתק ללוח!' : 'העתק מפרט מלא'}</span>
          </button>

          <button
            onClick={handleDownloadSpec}
            className="px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all shadow-md active:scale-98 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>הורד Markdown</span>
          </button>

          <button
            onClick={onReturnToGame}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold rounded-xl flex items-center gap-1.5 transition-all active:scale-98 cursor-pointer"
          >
            <ArrowRight className="w-4 h-4" />
            <span>חזרה למשחק</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto w-full p-4 sm:p-6 flex-1 flex flex-col">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3 mb-6">
          <button
            onClick={() => setActiveSection('architecture')}
            className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer ${
              activeSection === 'architecture'
                ? 'bg-purple-600/20 text-purple-300 border border-purple-500/40'
                : 'text-slate-400 hover:text-white bg-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>שכבות ועצמים (Objects)</span>
          </button>

          <button
            onClick={() => setActiveSection('events')}
            className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer ${
              activeSection === 'events'
                ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-white bg-slate-900'
            }`}
          >
            <GitBranch className="w-4 h-4" />
            <span>גיליונות אירועים (Event Sheets)</span>
          </button>

          <button
            onClick={() => setActiveSection('variables')}
            className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer ${
              activeSection === 'variables'
                ? 'bg-teal-600/20 text-teal-300 border border-teal-500/40'
                : 'text-slate-400 hover:text-white bg-slate-900'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>משתנים ו-JSON לפרויקט</span>
          </button>

          <button
            onClick={() => setActiveSection('pedagogy')}
            className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer ${
              activeSection === 'pedagogy'
                ? 'bg-amber-600/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-white bg-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>מתודולוגיה פדגוגית לתיכון</span>
          </button>
        </div>

        {/* Section 1: Architecture & Objects */}
        {activeSection === 'architecture' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <h2 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-purple-400" />
                <span>הגדרות פרויקט מובייל מומלצות ב-GDevelop</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                  <span className="text-slate-400 block mb-1">רזולוציה אופטימלית</span>
                  <strong className="text-white text-sm">720x1280 (Portrait)</strong>
                  <span className="text-slate-400 block mt-1">או 1280x720 עם התאמת רוחב</span>
                </div>
                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                  <span className="text-slate-400 block mb-1">מצב שינוי גודל (Scaling)</span>
                  <strong className="text-emerald-400 text-sm">Change width or height</strong>
                  <span className="text-slate-400 block mt-1">שומר על יחס ומונע פסים שחורים</span>
                </div>
                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                  <span className="text-slate-400 block mb-1">תמיכה במסכי מגע</span>
                  <strong className="text-teal-400 text-sm">Multitouch + Smooth Drag</strong>
                  <span className="text-slate-400 block mt-1">הרחבה מובנית חינמית</span>
                </div>
              </div>
            </div>

            {/* Layers & Objects Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-purple-400" />
                  <span>5 שכבות המשחק (Scene Layers)</span>
                </h3>
                <ul className="space-y-2 text-xs text-slate-300">
                  <li className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700">
                    <strong className="text-purple-300">Layer 0 (BackgroundNature):</strong> רקע נוף הררי נגלל, מפלי מים וצוקים (Parallax Tiled Sprite).
                  </li>
                  <li className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700">
                    <strong className="text-purple-300">Layer 1 (AdventurePath):</strong> מסלול שביל הרפתקאות, אבני מדרך לחציית הנהר ונקודות ציון.
                  </li>
                  <li className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700">
                    <strong className="text-purple-300">Layer 2 (GameEntities):</strong> דמות השחקן, יהלומים מנצנצים, שערי מעבר וסמני תחנה.
                  </li>
                  <li className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700">
                    <strong className="text-purple-300">Layer 3 (HUD_Layer):</strong> נעול למצלמה (Camera Locked): מד ניקוד, מונה יהלומים וסרגל שלב.
                  </li>
                  <li className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700">
                    <strong className="text-purple-300">Layer 4 (Modal_Dialogue_Layer):</strong> מוסתר כברירת מחדל. נפתח לחלון ידע או שאלה עם רקע מוצלל.
                  </li>
                </ul>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-teal-400" />
                  <span>עצמי המשחק והתנהגויות (Objects & Behaviors)</span>
                </h3>
                <ul className="space-y-2 text-xs text-slate-300">
                  <li className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700">
                    <strong className="text-teal-300">PlayerCharacter (Sprite):</strong> התנהגות \`Pathfinding\` או תנועה אוטומטית מבוססת \`Tween\` מנקודה לנקודה.
                  </li>
                  <li className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700">
                    <strong className="text-teal-300">TreasureGem (Sprite):</strong> התנהגות \`Tween\` (מחזורי עליה/ירידה והארה).
                  </li>
                  <li className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700">
                    <strong className="text-teal-300">ArabicTextDisplay (BBCode Text):</strong> תומך גופן Amiri, כיווניות RTL ותשכיל מלא.
                  </li>
                  <li className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700">
                    <strong className="text-teal-300">ChoiceCard (Panel Sprite):</strong> כרטיסיית רב-ברירה אלסטית המותאמת לאורך הטקסט.
                  </li>
                  <li className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700">
                    <strong className="text-teal-300">MatchingTile (Panel Sprite):</strong> התנהגות \`Draggable\` או לחיצה-להתאמה עם משתנה מזהה צמד.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Section 2: Event Sheets */}
        {activeSection === 'events' && (
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <h2 className="text-base font-bold text-white mb-2">
                תרגום מכניקות המשחק לגיליונות אירועים ב-GDevelop (Event Sheets)
              </h2>
              <p className="text-xs text-slate-400 mb-4">
                כל האירועים מבוססים על מודל תנאי-פעולה (Conditions & Actions) של GDevelop, ללא צורך בכתיבת קוד.
              </p>

              <div className="space-y-4 text-xs">
                {/* Event 1 */}
                <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
                  <div className="flex items-center gap-2 font-bold text-emerald-400 text-sm mb-2">
                    <Sparkles className="w-4 h-4" />
                    <span>אירוע 1: התנגשות באוצר ופתיחת "חלון הידע" הפדגוגי</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                      <span className="text-[11px] text-slate-400 block font-semibold mb-1">תנאים (Conditions):</span>
                      <p className="text-slate-300">1. התנגשות בין PlayerCharacter ל-TreasureGem</p>
                      <p className="text-slate-300">2. Trigger once while true</p>
                    </div>
                    <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                      <span className="text-[11px] text-slate-400 block font-semibold mb-1">פעולות (Actions):</span>
                      <p className="text-slate-300">1. עצור תנועת דמות (Set speed to 0)</p>
                      <p className="text-slate-300">2. שנה שכבה Modal_Dialogue_Layer לנראית (Show)</p>
                      <p className="text-slate-300">3. נגן צליל "TreasureChime.wav"</p>
                      <p className="text-slate-300">4. טען את נתוני חבילת הידע לאובייקט הטקסט בערבית</p>
                    </div>
                  </div>
                </div>

                {/* Event 2 */}
                <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
                  <div className="flex items-center gap-2 font-bold text-teal-400 text-sm mb-2">
                    <Check className="w-4 h-4" />
                    <span>אירוע 2: לחיצה על כפתור "הבנתי!" ותגמול מיידי</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                      <span className="text-[11px] text-slate-400 block font-semibold mb-1">תנאים (Conditions):</span>
                      <p className="text-slate-300">1. מגע/עכבר על כפתור UnderstoodBtn</p>
                      <p className="text-slate-300">2. שחרור לחיצה (Touch/Mouse released)</p>
                    </div>
                    <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                      <span className="text-[11px] text-slate-400 block font-semibold mb-1">פעולות (Actions):</span>
                      <p className="text-slate-300">1. הוסף 50 ל-GlobalVariable(CurrentScore)</p>
                      <p className="text-slate-300">2. הוסף 1 ל-GlobalVariable(GemsCount)</p>
                      <p className="text-slate-300">3. הסתר את שכבת הדיאלוג (Hide layer)</p>
                      <p className="text-slate-300">4. הנע את הדמות לעבר שער השאלה הבא במסלול</p>
                    </div>
                  </div>
                </div>

                {/* Event 3 */}
                <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
                  <div className="flex items-center gap-2 font-bold text-sky-400 text-sm mb-2">
                    <GitBranch className="w-4 h-4" />
                    <span>אירוע 3: מנגנון שאלות שגויות ותור חזרות (Spaced Repetition)</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                      <span className="text-[11px] text-slate-400 block font-semibold mb-1">תנאים (Conditions):</span>
                      <p className="text-slate-300">לחיצה על כרטיסיית תשובה שאינה שווה ל-CorrectAnswer</p>
                    </div>
                    <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                      <span className="text-[11px] text-slate-400 block font-semibold mb-1">פעולות (Actions):</span>
                      <p className="text-slate-300">1. נגן צליל שגיאה עדין "GentleMistake.wav"</p>
                      <p className="text-slate-300">2. הצג חלונית משוב פדגוגי עם התשובה הנכונה והסבר</p>
                      <p className="text-slate-300">3. הוסף את QuestionID למערך GlobalVariable(MistakesQueue)</p>
                      <p className="text-slate-300">4. צור תחנת תרגול נוספת בשביל לפני קו הסיום!</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Section 3: Variables & JSON Export */}
        {activeSection === 'variables' && (
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-base font-bold text-white">
                    משתנים גלובליים וקובץ Blueprint מוכן ל-GDevelop 5
                  </h2>
                  <p className="text-xs text-slate-400">
                    ניתן להוריד את קובץ ה-JSON ולייבאו ישירות להגדרות הפרויקט ב-GDevelop
                  </p>
                </div>
                <button
                  onClick={handleDownloadJsonBlueprint}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>הורד JSON Blueprint</span>
                </button>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-emerald-400 overflow-x-auto max-h-96">
                <pre>{JSON.stringify(gdevelopJsonStructure, null, 2)}</pre>
              </div>
            </div>
          </div>
        )}

        {/* Section 4: Pedagogy for Israeli High School */}
        {activeSection === 'pedagogy' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 text-xs sm:text-sm text-slate-300 leading-relaxed">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-400" />
              <span>מתודולוגיה פדגוגית לתוכנית הלימודים בערבית (בגרות 3-5 יח"ל)</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700">
                <h3 className="font-bold text-amber-300 text-sm mb-2">
                  1. פירוק מורפולוגי הדרגתי (Scaffolding):
                </h3>
                <p>
                  תלמידי תיכון מתקשים במעבר בין שלד השורש (3 אותיות) לבין אותיות התבנית של הבניינים הנגזרים.
                  המשחק מציג תחילה את בניין 1 השלם (فَعَلَ), מדגיש את פתחה-פתחה-פתחה בעבר, ואז חושף את בניין 2 (فَعَّلَ) עם הדגשת ע' הפועל ומשמעות הגרימה.
                </p>
              </div>

              <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700">
                <h3 className="font-bold text-amber-300 text-sm mb-2">
                  2. התאמת צמדים לעיגון סמנטי ותרגום:
                </h3>
                <p>
                  שאלות התאמת הצמדים מקשרות בין צורת הפועל בערבית לבין הגוף והפירוש המדויק בעברית.
                  החיבור הפיזי (בקו או בלחיצה) מפחית עומס קוגניטיבי ומחזק את הזיכרון החזותי של תחיליות וסיומות הגופים.
                </p>
              </div>

              <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700">
                <h3 className="font-bold text-amber-300 text-sm mb-2">
                  3. מודל למידה מטעויות ללא תסכול:
                </h3>
                <p>
                  שגיאה בשאלה אינה גורמת ל-Game Over או לעונש צורם, אלא לחשיפה ברורה של התשובה הנכונה,
                  ותזמון מחודש (Spaced Repetition) של השאלה בהמשך המסלול בטבע, המאפשר לתלמיד לתקן ולהצליח.
                </p>
              </div>

              <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700">
                <h3 className="font-bold text-amber-300 text-sm mb-2">
                  4. שוויון ורגישות מגדרית:
                </h3>
                <p>
                  המשחק מאפשר מעבר חופשי בין פנייה בלשון זכר, נקבה או לשון שוויונית משולבת ("צדקת! כל הכבוד! / אלופה! / אלוף!"),
                  דבר המעודד תחושת שייכות והעצמה לכל תלמידה ותלמיד.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
