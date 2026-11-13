import React, { useState } from 'react';
import { GameTrack, DifficultyLevel, GameStage } from '../../types/game';
import { Layers, Save, X, Compass, Plus, Trash2, Mountain, Image as ImageIcon, Award, CheckCircle2 } from 'lucide-react';
import { LANDSCAPE_PRESETS, LandscapePreset, generateStageNodesWithLandmarks, generateStageScenesWithLandmarks } from '../../data/landmarkPresets';

interface TrackEditorModalProps {
  track: GameTrack;
  onSave: (updatedTrack: GameTrack) => void;
  onClose: () => void;
}

export const TrackEditorModal: React.FC<TrackEditorModalProps> = ({
  track,
  onSave,
  onClose,
}) => {
  const [title, setTitle] = useState(track.title);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(track.difficulty);
  const [description, setDescription] = useState(track.description);
  const [shareCode, setShareCode] = useState(track.shareCode || '');
  const [achievements, setAchievements] = useState<string[]>(() => {
    if (track.achievements && track.achievements.length > 0) {
      return [...track.achievements];
    }
    if (track.id.includes('basic') || track.title.includes('בניין 1') || track.title.includes('עבר')) {
      return [
        'שליטה מלאה בזיהוי גופים וסיומות בפועל השלם בעבר',
        'הבחנה מדויקת במשמעות בניין 1 הבסיסי ותרגום שוטף',
        'הצלחה בהתאמת צמדים מורפולוגיים ומענה נכון על שאלות המסע',
      ];
    }
    return [
      'שליטה מלאה בזיהוי גופים וזמנים בבניינים 1, 2 ו-5',
      'הבחנה בין פעולת גרימה לפעולה חוזרת ורפלקסיבית',
      'הצלחה בהתאמת צמדים מורפולוגיים ותרגום שוטף',
    ];
  });
  const [stages, setStages] = useState<GameStage[]>(
    track.stages.map((stg) => ({
      ...stg,
    }))
  );

  const handleUpdateAchievement = (idx: number, val: string) => {
    const updated = [...achievements];
    updated[idx] = val;
    setAchievements(updated);
  };

  const handleAddAchievement = () => {
    if (achievements.length < 6) {
      setAchievements([...achievements, '']);
    }
  };

  const handleRemoveAchievement = (idx: number) => {
    if (achievements.length > 1) {
      setAchievements(achievements.filter((_, i) => i !== idx));
    }
  };

  const handleStageChange = (idx: number, field: keyof GameStage, val: any) => {
    setStages((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, [field]: val } : s))
    );
  };

  const handleApplyPresetToStage = (idx: number, presetId: string) => {
    const preset = LANDSCAPE_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    setStages((prev) =>
      prev.map((s, i) => {
        if (i !== idx) return s;
        // Generate nodes keeping any existing question assignments
        const existingQuestionBindings = s.nodes
          .filter((n) => n.questionId && n.landmarkType)
          .map((n) => ({ questionId: n.questionId!, stationType: n.landmarkType! }));

        const newNodes = generateStageNodesWithLandmarks(
          preset,
          s.packageIds || track.packages.map((p) => p.id),
          existingQuestionBindings
        );

        const newScenes = generateStageScenesWithLandmarks(preset, newNodes);

        return {
          ...s,
          title: preset.title.replace('שלב 1', `שלב ${idx + 1}`).replace('שלב 2', `שלב ${idx + 1}`).replace('שלב 3', `שלב ${idx + 1}`).replace('שלב 4', `שלב ${idx + 1}`),
          landscapeName: preset.name,
          backgroundImageUrl: preset.imageUrl,
          nodes: newNodes,
          scenes: newScenes,
        };
      })
    );
  };

  const handleAddStage = () => {
    if (stages.length >= 4) {
      alert('ניתן להגדיר עד 4 שלבים במשחק.');
      return;
    }
    const nextStageNum = stages.length + 1;
    // Pick landscape preset matching the new stage (Desert for 3, Alps for 4)
    const presetIndex = Math.min(nextStageNum - 1, LANDSCAPE_PRESETS.length - 1);
    const preset = LANDSCAPE_PRESETS[presetIndex];

    const newNodes = generateStageNodesWithLandmarks(
      preset,
      track.packages.map((p) => p.id)
    );

    const newScenes = generateStageScenesWithLandmarks(preset, newNodes);

    const newStage: GameStage = {
      id: `stg-${Date.now()}-${nextStageNum}`,
      stageNumber: nextStageNum,
      title: `שלב ${nextStageNum}: ${preset.name}`,
      landscapeName: preset.name,
      backgroundImageUrl: preset.imageUrl,
      packageIds: track.packages.slice(0, 2).map((p) => p.id),
      nodes: newNodes,
      scenes: newScenes,
    };

    setStages([...stages, newStage]);
  };

  const handleRemoveStage = (idx: number) => {
    if (stages.length <= 1) {
      alert('חייב להישאר לפחות שלב אחד במשחק.');
      return;
    }
    if (confirm('האם להסיר שלב זה מהמסלול?')) {
      const filtered = stages
        .filter((_, i) => i !== idx)
        .map((s, i) => ({ ...s, stageNumber: i + 1 }));
      setStages(filtered);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const validAchievements = achievements
      .map((a) => a.trim())
      .filter((a) => a.length > 0);

    const updated: GameTrack = {
      ...track,
      title: title.trim(),
      difficulty,
      description: description.trim(),
      shareCode: shareCode.trim().toUpperCase() || track.shareCode,
      stages,
      achievements: validAchievements.length > 0 ? validAchievements : undefined,
    };

    onSave(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in select-none">
      <div className="bg-slate-900 border-2 border-purple-500/60 rounded-3xl p-5 sm:p-6 shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col justify-between overflow-y-auto text-slate-100">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-purple-600/25 border border-purple-500/40 flex items-center justify-center text-purple-300">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">עריכת רמה והרחבת שלבים (שלב 1 עד 4)</h3>
                <p className="text-[11px] text-slate-400">הגדרת נופי טבע (מדבר, הרי געש, אלפים), תחנות מסלול ומטרות למידה</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg"
              title="סגור"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-200 mb-1">
              שם הרמה / המשחק <span className="text-purple-400">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="לדוגמה: רמה 1: בניין 1 בעבר ובהווה"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-purple-400"
            />
          </div>

          {/* Difficulty & Share Code */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1">רמת קושי</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-purple-400"
              >
                <option value="basic">רמת יסוד (מתחילים)</option>
                <option value="intermediate">רמת ביניים</option>
                <option value="advanced">רמת מתקדמים</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1">קוד שיתוף לתלמידים</label>
              <input
                type="text"
                value={shareCode}
                onChange={(e) => setShareCode(e.target.value)}
                placeholder="למשל: ARB-B1-BASIC"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white font-mono uppercase focus:outline-none focus:border-purple-400"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-200 mb-1">
              תיאור פדגוגי ומטרות למידה
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="תיאור הנושאים הדקדוקיים הנלמדים ברמה זו..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-purple-400 leading-relaxed"
            />
          </div>

          {/* Level Learning Achievements (Customizable by Teacher) */}
          <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-purple-500/40 space-y-2.5 shadow-sm">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-purple-400" />
                <span>הישגי הרמה / יעדי הצלחה הנעולים במסע</span>
              </label>
              {achievements.length < 5 && (
                <button
                  type="button"
                  onClick={handleAddAchievement}
                  className="px-2.5 py-1 bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/40 text-[11px] font-bold rounded-xl flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  <span>הוסף יעד/הישג</span>
                </button>
              )}
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              הישגים אלו מוצגים לתלמיד בחלונית סיום המסלול. באפשרותכם להתאים אותם לחומר הנלמד ברמה זו (למשל: סיומות עבר, הטיית בניין 1, זיהוי שורשים וכד'):
            </p>
            <div className="space-y-2">
              {achievements.map((ach, aIdx) => (
                <div key={aIdx} className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-purple-950 border border-purple-500/50 flex items-center justify-center text-purple-300 shrink-0 text-[10px] font-bold">
                    {aIdx + 1}
                  </div>
                  <input
                    type="text"
                    value={ach}
                    onChange={(e) => handleUpdateAchievement(aIdx, e.target.value)}
                    placeholder={`הישג למידה #${aIdx + 1} (למשל: שליטה מלאה בסיומות פועל עבר)...`}
                    className="flex-1 bg-slate-900 border border-slate-700 focus:border-purple-400 rounded-xl px-3 py-1.5 text-xs text-white transition-colors"
                  />
                  {achievements.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveAchievement(aIdx)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors cursor-pointer"
                      title="הסר הישג זה"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Stages Customization & Adding Stages 3 & 4 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-purple-400" />
                <span>שלבי המסלול והנופים הטבעיים ({stages.length} שלבים פעילים)</span>
              </label>

              {stages.length < 4 && (
                <button
                  type="button"
                  onClick={handleAddStage}
                  className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-bold rounded-xl flex items-center gap-1 shadow-sm cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>הוסף שלב {stages.length + 1} (מדבר / אלפים)</span>
                </button>
              )}
            </div>

            <div className="space-y-3 bg-slate-950/70 p-3 rounded-2xl border border-slate-800 max-h-64 overflow-y-auto">
              {stages.map((stg, idx) => (
                <div key={stg.id} className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 flex flex-col gap-2.5 shadow-sm">
                  <div className="flex items-center justify-between text-xs font-bold text-purple-300">
                    <div className="flex items-center gap-2">
                      <span className="bg-purple-500/20 text-purple-200 px-2 py-0.5 rounded-lg border border-purple-500/30">
                        שלב {idx + 1}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {stg.nodes.length} תחנות (כולל אוצרות ונופים)
                      </span>
                    </div>

                    {stages.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveStage(idx)}
                        className="text-slate-400 hover:text-rose-400 p-1 transition-colors cursor-pointer"
                        title="הסר שלב זה"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Preset Landscape Selector */}
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-1">
                      בחירת תמת נוף טבעי ותחנות תואמות:
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                      {LANDSCAPE_PRESETS.map((lp) => {
                        const isSelected = stg.landscapeName === lp.name;
                        return (
                          <button
                            key={lp.id}
                            type="button"
                            onClick={() => handleApplyPresetToStage(idx, lp.id)}
                            className={`p-1.5 rounded-lg border text-right transition-all cursor-pointer flex flex-col ${
                              isSelected
                                ? 'bg-purple-600/30 border-purple-400 text-white font-bold ring-1 ring-purple-400'
                                : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            <span className="text-[10px] truncate">{lp.name}</span>
                            <span className="text-[9px] text-slate-500 truncate">{lp.stations.length} תחנות</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-slate-400 block mb-0.5">כותרת השלב:</span>
                      <input
                        type="text"
                        value={stg.title}
                        onChange={(e) => handleStageChange(idx, 'title', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-purple-400"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block mb-0.5">שם הנוף הטבעי:</span>
                      <input
                        type="text"
                        value={stg.landscapeName}
                        onChange={(e) => handleStageChange(idx, 'landscapeName', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-purple-400"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl cursor-pointer"
            >
              ביטול
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-purple-600/30 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>שמור שינויים ברמה ובשלבים</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
