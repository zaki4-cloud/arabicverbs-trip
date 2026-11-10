import React, { useState } from 'react';
import { X, Plus, Trash2, HelpCircle, Volume2, MapPin } from 'lucide-react';
import { Question, QuestionType, MultipleChoiceQuestion, MatchingPairsQuestion, MatchingPairItem, GameStage } from '../../types/game';
import { speakArabic } from '../../utils/speech';

interface QuestionEditorModalProps {
  existingQuestion?: Question | null;
  packageTopics: { id: string; title: string }[];
  stages?: GameStage[];
  onSave: (question: Question, targetStageId?: string, targetNodeId?: string) => void;
  onClose: () => void;
}

export const QuestionEditorModal: React.FC<QuestionEditorModalProps> = ({
  existingQuestion,
  packageTopics,
  stages = [],
  onSave,
  onClose,
}) => {
  const [type, setType] = useState<QuestionType>(existingQuestion?.type || 'multiple_choice');
  const [packageId, setPackageId] = useState(
    existingQuestion?.packageId || (packageTopics[0]?.id || 'pkg-t1-p1')
  );
  const [topic, setTopic] = useState(existingQuestion?.topic || 'בניין 1 (فَعَلَ)');
  const [prompt, setPrompt] = useState(existingQuestion?.prompt || '');
  const [explanation, setExplanation] = useState(
    existingQuestion?.explanation || 'הסבר לתלמיד מדוע תשובה זו נכונה ומה הכלל הדקדוקי...'
  );

  // Stage & Station placement
  // Find which stage and station currently contains this question, if any
  const foundPlacement = React.useMemo(() => {
    if (!existingQuestion?.id) return null;
    for (const stg of stages) {
      const node = stg.nodes.find((n) => n.questionId === existingQuestion.id);
      if (node) return { stageId: stg.id, nodeId: node.id };
    }
    return null;
  }, [existingQuestion, stages]);

  const [selectedStageId, setSelectedStageId] = useState<string>(
    foundPlacement?.stageId || stages[0]?.id || ''
  );

  const currentSelectedStage = stages.find((s) => s.id === selectedStageId) || stages[0];
  const stationNodes = currentSelectedStage ? currentSelectedStage.nodes.filter((n) => n.type !== 'treasure') : [];

  const [selectedNodeId, setSelectedNodeId] = useState<string>(
    foundPlacement?.nodeId || stationNodes[0]?.id || ''
  );

  // Multiple Choice Specific State
  const initialMC = existingQuestion?.type === 'multiple_choice' ? (existingQuestion as MultipleChoiceQuestion) : null;
  const [arabicSample, setArabicSample] = useState(initialMC?.arabicSample || '');
  const [correctAnswer, setCorrectAnswer] = useState(initialMC?.correctAnswer || '');
  const [distractors, setDistractors] = useState<string[]>(
    initialMC?.distractors || ['מסיח 1 שגוי', 'מסיח 2 שגוי', 'מסיח 3 שגוי']
  );

  // Matching Pairs Specific State
  const initialMatch = existingQuestion?.type === 'matching_pairs' ? (existingQuestion as MatchingPairsQuestion) : null;
  const [pairs, setPairs] = useState<MatchingPairItem[]>(
    initialMatch?.pairs || [
      { id: 'p1', arabic: 'كَتَبَ', target: 'הוא כתב (נסתר, עבר)' },
      { id: 'p2', arabic: 'يَكْتُبُ', target: 'הוא יכתוב (נסתר, עתיד)' },
      { id: 'p3', arabic: 'كَتَبْتُ', target: 'אני כתבתי (מדבר/ת, עבר)' }
    ]
  );

  const handleAddDistractor = () => {
    if (distractors.length < 5) {
      setDistractors([...distractors, '']);
    }
  };

  const handleUpdateDistractor = (idx: number, val: string) => {
    const updated = [...distractors];
    updated[idx] = val;
    setDistractors(updated);
  };

  const handleRemoveDistractor = (idx: number) => {
    if (distractors.length > 1) {
      setDistractors(distractors.filter((_, i) => i !== idx));
    }
  };

  const handleAddPair = () => {
    setPairs([...pairs, { id: `p-${Date.now()}-${pairs.length}`, arabic: '', target: '' }]);
  };

  const handleUpdatePair = (idx: number, field: 'arabic' | 'target', val: string) => {
    const updated = [...pairs];
    updated[idx] = { ...updated[idx], [field]: val };
    setPairs(updated);
  };

  const handleRemovePair = (idx: number) => {
    if (pairs.length > 2) {
      setPairs(pairs.filter((_, i) => i !== idx));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    if (type === 'multiple_choice') {
      if (!correctAnswer.trim()) return;
      const validDistractors = distractors.filter((d) => d.trim().length > 0);
      if (validDistractors.length === 0) return;

      const newQ: MultipleChoiceQuestion = {
        id: existingQuestion?.id || `q-mc-${Date.now()}`,
        packageId,
        topic,
        type: 'multiple_choice',
        prompt: prompt.trim(),
        arabicSample: arabicSample.trim() || undefined,
        correctAnswer: correctAnswer.trim(),
        distractors: validDistractors,
        explanation: explanation.trim()
      };
      onSave(newQ, selectedStageId, selectedNodeId);
    } else {
      const validPairs = pairs.filter((p) => p.arabic.trim() && p.target.trim());
      if (validPairs.length < 2) return;

      const newQ: MatchingPairsQuestion = {
        id: existingQuestion?.id || `q-match-${Date.now()}`,
        packageId,
        topic,
        type: 'matching_pairs',
        prompt: prompt.trim(),
        pairs: validPairs,
        explanation: explanation.trim()
      };
      onSave(newQ, selectedStageId, selectedNodeId);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-sm animate-fade-in select-none">
      <div className="bg-slate-900 border-2 border-purple-500/60 rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-purple-400" />
            <h2 className="text-base sm:text-lg font-bold text-white">
              {existingQuestion ? 'עריכת שאלה ומיקום במסלול' : 'יצירת שאלה מותאמת אישית ושיבוץ במסלול'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* Stage & Station Placement Selector */}
          {stages.length > 0 && (
            <div className="bg-purple-950/40 border border-purple-500/40 p-3.5 rounded-2xl space-y-2.5">
              <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                <span>מיקום השאלה במסלול (בחירת שלב ותחנה):</span>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    באיזה שלב למקם את השאלה?
                  </label>
                  <select
                    value={selectedStageId}
                    onChange={(e) => {
                      const newStageId = e.target.value;
                      setSelectedStageId(newStageId);
                      const stg = stages.find((s) => s.id === newStageId);
                      const stations = stg ? stg.nodes.filter((n) => n.type !== 'treasure') : [];
                      if (stations.length > 0) {
                        setSelectedNodeId(stations[0].id);
                      }
                    }}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-400"
                  >
                    {stages.map((stg) => (
                      <option key={stg.id} value={stg.id}>
                        {stg.title} ({stg.landscapeName})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    באיזו תחנה במסלול?
                  </label>
                  <select
                    value={selectedNodeId}
                    onChange={(e) => setSelectedNodeId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-400"
                  >
                    {stationNodes.map((node) => (
                      <option key={node.id} value={node.id}>
                        {node.title} {node.questionId && node.questionId !== existingQuestion?.id ? '(יש שאלה)' : '(פנוי)'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* 1. Topic & Package selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                שדה 1: שיוך לחבילת ידע:
              </label>
              <select
                value={packageId}
                onChange={(e) => {
                  setPackageId(e.target.value);
                  const selectedPkg = packageTopics.find((p) => p.id === e.target.value);
                  if (selectedPkg) setTopic(selectedPkg.title.split(' - ')[0]);
                }}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-400"
              >
                {packageTopics.map((pkg) => (
                  <option key={pkg.id} value={pkg.id}>
                    {pkg.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                הבניין / הנושא הדקדוקי:
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="בניין 1 / בניין 2 וכו'"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-400"
              />
            </div>
          </div>

          {/* 2. Question Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              שדה 2: סוג השאלה:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType('multiple_choice')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                  type === 'multiple_choice'
                    ? 'bg-purple-600/30 border-purple-400 text-purple-200 ring-1 ring-purple-400'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                <span>שאלה אמריקאית (רב-ברירה)</span>
              </button>
              <button
                type="button"
                onClick={() => setType('matching_pairs')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                  type === 'matching_pairs'
                    ? 'bg-purple-600/30 border-purple-400 text-purple-200 ring-1 ring-purple-400'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                <span>התאמת צמדים (Matching Pairs)</span>
              </button>
            </div>
          </div>

          {/* 3. Question Prompt */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              שדה 3: ניסוח השאלה:
            </label>
            <input
              type="text"
              required
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="למשל: באיזה גוף וזמן מנוטה הפועל שלפניכם? או התאימו בין הפעלים למשמעותם:"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-purple-400"
            />
          </div>

          {/* Type A: Multiple Choice Fields */}
          {type === 'multiple_choice' && (
            <div className="space-y-3 bg-slate-950/40 p-4 rounded-xl border border-slate-800">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  דוגמה פועלית בערבית (אופציונלי):
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={arabicSample}
                    onChange={(e) => setArabicSample(e.target.value)}
                    placeholder="كَتَبْتُمْ / عَلَّمَ"
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm font-arabic text-emerald-400 focus:outline-none focus:border-purple-400"
                  />
                  {arabicSample && (
                    <button
                      type="button"
                      onClick={() => speakArabic(arabicSample)}
                      className="p-2 bg-slate-800 hover:bg-slate-700 text-purple-300 rounded-xl border border-slate-700"
                      title="השמע הגייה"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-emerald-400 mb-1">
                  התשובה הנכונה: *
                </label>
                <input
                  type="text"
                  required
                  value={correctAnswer}
                  onChange={(e) => setCorrectAnswer(e.target.value)}
                  placeholder="התשובה הנכונה שהתלמיד צריך לבחור"
                  className="w-full bg-slate-800 border border-emerald-500/50 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-rose-400">
                    מסיחים (תשובות שגויות):
                  </label>
                  {distractors.length < 5 && (
                    <button
                      type="button"
                      onClick={handleAddDistractor}
                      className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>הוסף מסיח</span>
                    </button>
                  )}
                </div>
                <div className="space-y-2">
                  {distractors.map((dist, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input
                        type="text"
                        value={dist}
                        onChange={(e) => handleUpdateDistractor(idx, e.target.value)}
                        placeholder={`מסיח שגוי #${idx + 1}`}
                        className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-400"
                      />
                      {distractors.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveDistractor(idx)}
                          className="p-2 text-slate-400 hover:text-rose-400 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Type B: Matching Pairs Fields */}
          {type === 'matching_pairs' && (
            <div className="space-y-3 bg-slate-950/40 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-purple-300">
                  צמדים להתאמה (פועל בערבית ↔ משמעות/גוף בעברית):
                </span>
                <button
                  type="button"
                  onClick={handleAddPair}
                  className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>הוסף צמד</span>
                </button>
              </div>

              <div className="space-y-2">
                {pairs.map((pair, idx) => (
                  <div key={pair.id} className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="פועל בערבית (كَتَبَ)"
                      value={pair.arabic}
                      onChange={(e) => handleUpdatePair(idx, 'arabic', e.target.value)}
                      className="w-1/2 bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-2 text-xs font-arabic text-emerald-400 focus:outline-none focus:border-purple-400"
                    />
                    <input
                      type="text"
                      placeholder="משמעות (הוא כתב)"
                      value={pair.target}
                      onChange={(e) => handleUpdatePair(idx, 'target', e.target.value)}
                      className="w-1/2 bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:border-purple-400"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemovePair(idx)}
                      disabled={pairs.length <= 2}
                      className="p-1.5 text-slate-400 hover:text-rose-400 disabled:opacity-30 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. Pedagogical Feedback Explanation */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              הסבר פדגוגי מפורט (יוצג במשוב בזמן אמת, במיוחד בלמידה מטעויות):
            </label>
            <textarea
              required
              rows={2}
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="הסבר קצר על הכלל הדקדוקי כדי לאפשר למידה מיידית מהטעות..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-purple-400 leading-relaxed"
            />
          </div>

          {/* Submit */}
          <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              ביטול
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
            >
              שמור שאלה ושבץ במסלול
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
