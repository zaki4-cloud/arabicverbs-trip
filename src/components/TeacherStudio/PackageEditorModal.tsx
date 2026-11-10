import React, { useState, useRef } from 'react';
import {
  X,
  Plus,
  Trash2,
  Image as ImageIcon,
  Layers,
  Sparkles,
  Upload,
  FolderOpen,
  RefreshCw,
  CheckCircle2,
  Heading,
  Type,
  List,
  Bold,
  Eye,
  EyeOff,
  MoveUp,
  MoveDown,
  LayoutList,
  Lightbulb,
  FileText,
  MapPin,
} from 'lucide-react';
import { KnowledgePackage, ArabicExample, GameStage } from '../../types/game';
import { optimizeImageFile } from '../../utils/imageUpload';
import {
  parseExplanationText,
  serializeSectionsToText,
  ExplanationSection,
} from '../../utils/pedagogicalText';
import { PedagogicalExplanationView } from '../Common/PedagogicalExplanationView';
import { resolveImageUrl } from '../../utils/imageUrl';

interface PackageEditorModalProps {
  existingPackage?: KnowledgePackage | null;
  stages?: GameStage[];
  onSave: (pkg: KnowledgePackage, targetStageId?: string, targetNodeId?: string) => void;
  onClose: () => void;
}

const ALL_BINYANIM = [
  'בניין 1 (فَعَلَ)',
  'בניין 2 (فَعَّלَ)',
  'בניין 3 (فَاعَلَ)',
  'בניין 4 (أَفْعَلَ)',
  'בניין 5 (تَفَعَّלَ)',
  'בניין 6 (تَفَاعَلَ)',
  'בניין 7 (اِنْفَعَلَ)',
  'בניין 8 (اِفْتَعَلَ)',
  'בניין 9 (اِفْعَلَّ)',
  'בניין 10 (اِسْتَفْعَلَ)'
];

const ALL_TENSES = [
  'עבר (الماضي)',
  'עתיד (المضارع)',
  'ציווי (الأמר)',
  'בינוני פועל (اسم الفاعل)',
  'בינוני פעול (اسم المفعول)'
];

const ALL_PERSONS = [
  'מדבר (أَنَا - אני)',
  'מדברים (نَحْنُ - אנחנו)',
  'נוכח (أَنْتَ - אתה)',
  'נוכחת (أَنْتِ - את)',
  'נוכחים (أَنْتُمْ - אתם)',
  'נוכחות (أَنْتُنَّ - אתן)',
  'נסתר (هُوَ - הוא)',
  'נסתרת (هِيَ - היא)',
  'נסתרים (هُمْ - הם)',
  'נסתרות (هُنَّ - הן)',
  'זוגי (أَنْتُمَا / هُمَا)'
];

const SAMPLE_IMAGES = [
  { label: 'מגילת דקדוק מהודרת', url: '/assets/images/arabic_grammar_scroll_1793466159684.jpg' },
  { label: 'אוצר יהלומים בטבע', url: '/assets/images/treasure_gem_chest_1793466160391.jpg' },
  { label: 'שביל הרפתקה בהרים', url: '/assets/images/nature_adventure_trail_1793466158399.jpg' }
];

export const PackageEditorModal: React.FC<PackageEditorModalProps> = ({
  existingPackage,
  stages = [],
  onSave,
  onClose,
}) => {
  // Stage & Station placement in game view
  const foundPlacement = React.useMemo(() => {
    if (!existingPackage?.id || !stages || stages.length === 0) return null;
    for (const stg of stages) {
      // 1. Check if a non-question node in this stage has this packageId
      const node = stg.nodes.find(
        (n) => n.packageId === existingPackage.id && !n.questionId && n.type !== 'question'
      );
      if (node) {
        return { stageId: stg.id, nodeId: node.id };
      }
      // 2. Check if stage packageIds contains this package
      if (stg.packageIds?.includes(existingPackage.id)) {
        const trNode = stg.nodes.find(
          (n) => n.type === 'treasure' && (!n.packageId || n.packageId === existingPackage.id)
        );
        return { stageId: stg.id, nodeId: trNode?.id || `treasure-${stg.id}-start` };
      }
    }
    return null;
  }, [existingPackage, stages]);

  const [selectedStageId, setSelectedStageId] = useState<string>(
    foundPlacement?.stageId || stages[0]?.id || ''
  );

  const currentSelectedStage = stages.find((s) => s.id === selectedStageId) || stages[0];

  const availableStations = React.useMemo(() => {
    const themedSlots = (() => {
      const stageId = currentSelectedStage.id || '';
      const title = currentSelectedStage.title || '';
      const landscape = currentSelectedStage.landscapeName || '';

      if (stageId.includes('river') || stageId.includes('canyon') || title.includes('קניון') || landscape.includes('קניון') || landscape.includes('נהר')) {
        return [
          { id: `treasure-${currentSelectedStage.id}-start`, title: 'אוצר קניון הנהר (תיבת עץ לצד הנחל)' },
          { id: `treasure-${currentSelectedStage.id}-mid`, title: 'יהלום המים של המפלים הלבנים (אוצר קסום)' },
          { id: `treasure-${currentSelectedStage.id}-end`, title: 'אוצר הידע הדקדוקי של מעבר הבזלת' },
        ];
      }
      if (stageId.includes('desert') || stageId.includes('volcano') || title.includes('מדבר') || landscape.includes('מדבר') || title.includes('געש')) {
        return [
          { id: `treasure-${currentSelectedStage.id}-start`, title: 'אוצר נווה המדבר (תיבת עץ בין הדקלים)' },
          { id: `treasure-${currentSelectedStage.id}-mid`, title: 'יהלום המים והמעיין הצלול (אוצר זוהר)' },
          { id: `treasure-${currentSelectedStage.id}-end`, title: 'אוצר הידע הדקדוקי של פירמידת השמש' },
        ];
      }
      if (stageId.includes('alps') || stageId.includes('snow') || title.includes('שלג') || landscape.includes('שלג') || title.includes('אלפים')) {
        return [
          { id: `treasure-${currentSelectedStage.id}-start`, title: 'אוצר אגם הטורקיז (תיבת עץ ביער)' },
          { id: `treasure-${currentSelectedStage.id}-mid`, title: 'יהלום המעבר הארקטי (אוצר זוהר)' },
          { id: `treasure-${currentSelectedStage.id}-end`, title: 'אוצר הידע הדקדוקי של פסגת השלג' },
        ];
      }
      return [
        { id: `treasure-${currentSelectedStage.id}-start`, title: 'אוצר שביל האבנים (תיבת עץ לצד השביל)' },
        { id: `treasure-${currentSelectedStage.id}-mid`, title: 'יהלום המים והמפל הסודי (אוצר קסום)' },
        { id: `treasure-${currentSelectedStage.id}-end`, title: 'אוצר הידע הדקדוקי של שער העץ העתיק' },
      ];
    })();

    const items = themedSlots.map((slot, sIdx) => ({
      id: slot.id,
      title: slot.title,
      type: 'treasure',
      isCurrent:
        currentSelectedStage.nodes.some(
          (n) => n.type === 'treasure' && n.packageId === existingPackage?.id
        ) && sIdx === 0,
    }));

    // Only allow free landmark stations that do NOT have a question
    currentSelectedStage.nodes
      .filter((n) => n.type !== 'treasure' && !n.questionId && n.type !== 'question')
      .forEach((n) => {
        items.push({
          id: n.id,
          title: `תחנת נוף פנויה: ${n.title}`,
          type: n.type,
          isCurrent: n.packageId === existingPackage?.id,
        });
      });

    return items;
  }, [currentSelectedStage, existingPackage]);

  const [selectedNodeId, setSelectedNodeId] = useState<string>(() => {
    if (foundPlacement?.nodeId) return foundPlacement.nodeId;
    return availableStations[0]?.id || '';
  });

  const [title, setTitle] = useState(existingPackage?.title || '');
  const [selectedBinyanim, setSelectedBinyanim] = useState<string[]>(
    existingPackage?.binyanim || [ALL_BINYANIM[0]]
  );
  const [selectedTenses, setSelectedTenses] = useState<string[]>(
    existingPackage?.tenses || [ALL_TENSES[0], ALL_TENSES[1]]
  );
  const [selectedPersons, setSelectedPersons] = useState<string[]>(
    existingPackage?.persons || [ALL_PERSONS[0], ALL_PERSONS[2], ALL_PERSONS[6]]
  );
  const [explanation, setExplanation] = useState(existingPackage?.explanation || '');
  const [sections, setSections] = useState<ExplanationSection[]>(() =>
    parseExplanationText(existingPackage?.explanation || '')
  );
  const [editorMode, setEditorMode] = useState<'structured' | 'word'>('structured');
  const [showLivePreview, setShowLivePreview] = useState<boolean>(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [imageUrl, setImageUrl] = useState(
    existingPackage?.imageUrl || '/src/assets/images/arabic_grammar_scroll_1793466159684.jpg'
  );
  const [examples, setExamples] = useState<ArabicExample[]>(
    existingPackage?.examples || [
      { arabic: 'كَتَبَ', transliteration: 'כַּתַבַּ', hebrew: 'הוא כתב (עבר)', note: 'בניין 1 פשוט' }
    ]
  );

  // File upload state for phone/computer folder uploads
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState<string | null>(null);

  const processFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setUploadError('אנא בחרו קובץ תמונה בלבד (JPG, PNG, WEBP, GIF).');
      return;
    }
    setUploadError(null);
    setIsUploading(true);
    try {
      const optimizedDataUrl = await optimizeImageFile(file, 1200, 1200, 0.84);
      setImageUrl(optimizedDataUrl);
      setUploadSuccessMsg(`התמונה "${file.name}" הועלתה בהצלחה!`);
      setTimeout(() => setUploadSuccessMsg(null), 4000);
    } catch (err: any) {
      setUploadError(err.message || 'שגיאה בעת עיבוד התמונה מהמכשיר.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  // Multi-select helpers
  const toggleItem = (list: string[], setList: (val: string[]) => void, item: string) => {
    if (list.includes(item)) {
      if (list.length > 1) {
        setList(list.filter((x) => x !== item));
      }
    } else {
      setList([...list, item]);
    }
  };

  const selectAll = (allList: string[], setList: (val: string[]) => void) => {
    setList([...allList]);
  };

  const handleAddExample = () => {
    setExamples([
      ...examples,
      { arabic: '', transliteration: '', hebrew: '', note: '' }
    ]);
  };

  const handleUpdateExample = (idx: number, field: keyof ArabicExample, val: string) => {
    const updated = [...examples];
    updated[idx] = { ...updated[idx], [field]: val };
    setExamples(updated);
  };

  const handleRemoveExample = (idx: number) => {
    if (examples.length > 1) {
      setExamples(examples.filter((_, i) => i !== idx));
    }
  };

  // Section manipulation methods for pedagogical explanation
  const handleSwitchToStructured = () => {
    setSections(parseExplanationText(explanation));
    setEditorMode('structured');
  };

  const handleSwitchToWord = () => {
    const text = serializeSectionsToText(sections);
    setExplanation(text);
    setEditorMode('word');
  };

  const handleAddSectionWithHeading = () => {
    const newSec: ExplanationSection = {
      id: `sec-${Date.now()}`,
      heading: '',
      content: '',
      type: 'normal',
    };
    const updated = [...sections, newSec];
    setSections(updated);
    setExplanation(serializeSectionsToText(updated));
  };

  const handleAddHeadingOnly = () => {
    const newSec: ExplanationSection = {
      id: `sec-${Date.now()}`,
      heading: 'כותרת מוגדלת',
      content: '',
      type: 'normal',
    };
    const updated = [...sections, newSec];
    setSections(updated);
    setExplanation(serializeSectionsToText(updated));
  };

  const handleAddParagraphOnly = () => {
    const newSec: ExplanationSection = {
      id: `sec-${Date.now()}`,
      heading: '',
      content: '',
      type: 'normal',
    };
    const updated = [...sections, newSec];
    setSections(updated);
    setExplanation(serializeSectionsToText(updated));
  };

  const handleAddTipSection = () => {
    const newSec: ExplanationSection = {
      id: `sec-${Date.now()}`,
      heading: '💡 דגש חשוב',
      content: '',
      type: 'tip',
    };
    const updated = [...sections, newSec];
    setSections(updated);
    setExplanation(serializeSectionsToText(updated));
  };

  const handleUpdateSection = (id: string, field: keyof ExplanationSection, value: any) => {
    const updated = sections.map((sec) =>
      sec.id === id ? { ...sec, [field]: value } : sec
    );
    setSections(updated);
    setExplanation(serializeSectionsToText(updated));
  };

  const handleRemoveSection = (id: string) => {
    if (sections.length <= 1) {
      const reset: ExplanationSection[] = [{ id: `sec-${Date.now()}`, heading: '', content: '', type: 'normal' }];
      setSections(reset);
      setExplanation('');
      return;
    }
    const updated = sections.filter((s) => s.id !== id);
    setSections(updated);
    setExplanation(serializeSectionsToText(updated));
  };

  const handleMoveSection = (idx: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= sections.length) return;
    const updated = [...sections];
    const temp = updated[idx];
    updated[idx] = updated[targetIdx];
    updated[targetIdx] = temp;
    setSections(updated);
    setExplanation(serializeSectionsToText(updated));
  };

  const insertWordFormatting = (prefix: string, suffix: string = '', defaultText: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = explanation.substring(start, end) || defaultText;
    const replacement = `${prefix}${selectedText}${suffix}`;

    const newText =
      explanation.substring(0, start) +
      replacement +
      explanation.substring(end);

    setExplanation(newText);
    setSections(parseExplanationText(newText));

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + selectedText.length
      );
    }, 50);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalExplanation =
      editorMode === 'structured'
        ? serializeSectionsToText(sections)
        : explanation;

    if (!title.trim() || !finalExplanation.trim()) return;

    const newPkg: KnowledgePackage = {
      id: existingPackage?.id || `pkg-${Date.now()}`,
      title: title.trim(),
      binyanim: selectedBinyanim,
      tenses: selectedTenses,
      persons: selectedPersons,
      explanation: finalExplanation.trim(),
      examples: examples.filter((eg) => eg.arabic.trim() && eg.hebrew.trim()),
      imageUrl: imageUrl.trim() || '/src/assets/images/arabic_grammar_scroll_1793466159684.jpg',
      createdAt: existingPackage?.createdAt || Date.now()
    };

    onSave(newPkg, selectedStageId, selectedNodeId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base sm:text-lg font-bold text-white">
              {existingPackage ? 'עריכת חבילת ידע ושיבוץ במסלול' : 'יצירת חבילת ידע פדגוגית חדשה ושיבוץ במסלול'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Stage & Station Placement in Game View */}
          {stages.length > 0 && (
            <div className="bg-purple-950/40 border-2 border-purple-500/50 p-4 rounded-2xl space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-bold text-purple-200 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-purple-400" />
                  <span>מיקום מאגר הידע בתצוגת המשחק (בחירת שלב ותחנה):</span>
                </span>
                <span className="text-[10px] text-purple-300 bg-purple-900/70 border border-purple-500/40 px-2.5 py-0.5 rounded-full font-semibold">
                  הצבה במסלול המשחק
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                בחרו באיזה שלב ובאיזו תחנה במסלול יוצב מאגר הידע (בתיבת אוצר ייעודית או בתחנת מסלול קיימת), כך שהתלמידים יוכלו לפתוח אותו וללמוד במהלך המסע.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1.5 text-right">
                    באיזה שלב להציב את המאגר? <span className="text-purple-400">*</span>
                  </label>
                  <select
                    value={selectedStageId}
                    onChange={(e) => {
                      const newStageId = e.target.value;
                      setSelectedStageId(newStageId);
                      const stg = stages.find((s) => s.id === newStageId);
                      if (stg) {
                        setSelectedNodeId(`treasure-${stg.id}`);
                      }
                    }}
                    className="w-full bg-slate-800 border-2 border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-purple-400 transition-colors"
                  >
                    {stages.map((stg, sIdx) => (
                      <option key={stg.id} value={stg.id}>
                        שלב {sIdx + 1}: {stg.title} ({stg.landscapeName})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1.5 text-right">
                    באיזו תחנה במסלול? <span className="text-purple-400">*</span>
                  </label>
                  <select
                    value={selectedNodeId}
                    onChange={(e) => setSelectedNodeId(e.target.value)}
                    className="w-full bg-slate-800 border-2 border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-purple-400 transition-colors"
                  >
                    {availableStations.map((station) => (
                      <option key={station.id} value={station.id}>
                        {station.title} {station.isCurrent ? '(המיקום הנוכחי)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Package Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              כותרת חבילת הידע (נושא השיעור):
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="למשל: בניין 2 (فَعَّلَ) - פעלים גורמים והטיה בעבר ועתיד"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* 1. Multi-Select: Binyanim */}
          <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-emerald-400">
                1. בחירת בניינים רלוונטיים (ערך יחיד, כמה ערכים, או הכל):
              </span>
              <button
                type="button"
                onClick={() => selectAll(ALL_BINYANIM, setSelectedBinyanim)}
                className="text-[11px] text-teal-400 hover:underline cursor-pointer"
              >
                בחר את כל 10 הבניינים
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {ALL_BINYANIM.map((b) => {
                const active = selectedBinyanim.includes(b);
                return (
                  <button
                    key={b}
                    type="button"
                    onClick={() => toggleItem(selectedBinyanim, setSelectedBinyanim, b)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      active
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700'
                    }`}
                  >
                    {b}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Multi-Select: Tenses */}
          <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-teal-400">
                2. בחירת הזמנים:
              </span>
              <button
                type="button"
                onClick={() => selectAll(ALL_TENSES, setSelectedTenses)}
                className="text-[11px] text-teal-400 hover:underline cursor-pointer"
              >
                בחר את כל הזמנים
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {ALL_TENSES.map((t) => {
                const active = selectedTenses.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleItem(selectedTenses, setSelectedTenses, t)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      active
                        ? 'bg-teal-600 text-white shadow-sm'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700'
                    }`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Multi-Select: Persons */}
          <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-sky-400">
                3. בחירת גופים רלוונטיים:
              </span>
              <button
                type="button"
                onClick={() => selectAll(ALL_PERSONS, setSelectedPersons)}
                className="text-[11px] text-sky-400 hover:underline cursor-pointer"
              >
                בחר את כל הגופים
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {ALL_PERSONS.map((p) => {
                const active = selectedPersons.includes(p);
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => toggleItem(selectedPersons, setSelectedPersons, p)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      active
                        ? 'bg-sky-600 text-white shadow-sm'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Pedagogical Explanation Editor with Headings, Paragraphs & Word-like Toolbar */}
          <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-700/60">
              <div>
                <label className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <span>4. הסבר פדגוגי מפורט לתלמיד (פסקאות מרווחות וכותרות מוגדלות):</span>
                </label>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  הטקסט יופיע בחלון האוצר לתלמיד עם כותרות מוגדלות, ריווח פסקאות נעים ואפשרות גלילה חלקה.
                </p>
              </div>

              {/* Mode switch tabs & Preview toggle */}
              <div className="flex items-center gap-1.5 self-start sm:self-auto shrink-0">
                <div className="flex bg-slate-900 border border-slate-700 p-0.5 rounded-xl text-xs">
                  <button
                    type="button"
                    onClick={handleSwitchToStructured}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                      editorMode === 'structured'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                    title="עריכה מובנית לפי כרטיסיות פסקה וכותרת"
                  >
                    <LayoutList className="w-3.5 h-3.5" />
                    <span>פסקאות וכותרות</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSwitchToWord}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                      editorMode === 'word'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                    title="עורך טקסט חופשי עם סרגל כלים דמוי וורד"
                  >
                    <Type className="w-3.5 h-3.5" />
                    <span>עורך וורד (Word)</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setShowLivePreview(!showLivePreview)}
                  className={`p-1.5 rounded-xl border text-xs flex items-center gap-1 cursor-pointer transition-colors ${
                    showLivePreview
                      ? 'bg-purple-950/60 border-purple-500/50 text-purple-300'
                      : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                  title={showLivePreview ? 'הסתר תצוגה מקדימה' : 'הצג תצוגה מקדימה'}
                >
                  {showLivePreview ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Mode 1: Structured Section Blocks */}
            {editorMode === 'structured' && (
              <div className="space-y-3.5">
                {sections.map((sec, idx) => (
                  <div
                    key={sec.id}
                    className={`p-4 rounded-xl border transition-all ${
                      sec.type === 'tip'
                        ? 'bg-emerald-950/30 border-emerald-500/40'
                        : 'bg-slate-900/80 border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 flex items-center justify-center text-[11px] font-bold">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-semibold text-slate-300">
                          {sec.type === 'tip' ? '💡 תיבת דגש / טיפ' : 'פסקה והסבר פדגוגי'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateSection(sec.id, 'type', sec.type === 'tip' ? 'normal' : 'tip')
                          }
                          className={`px-2 py-0.5 rounded text-[11px] border transition-colors cursor-pointer flex items-center gap-1 ${
                            sec.type === 'tip'
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                          }`}
                          title="הפוך לתיבת דגש מודגשת"
                        >
                          <Lightbulb className="w-3 h-3 text-amber-400" />
                          <span>{sec.type === 'tip' ? 'דגש מופעל' : 'סמן כדגש'}</span>
                        </button>
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMoveSection(idx, 'up')}
                          className="p-1 text-slate-400 hover:text-white disabled:opacity-20 cursor-pointer"
                          title="הזז למעלה"
                        >
                          <MoveUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === sections.length - 1}
                          onClick={() => handleMoveSection(idx, 'down')}
                          className="p-1 text-slate-400 hover:text-white disabled:opacity-20 cursor-pointer"
                          title="הזז למטה"
                        >
                          <MoveDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveSection(sec.id)}
                          className="p-1 text-slate-400 hover:text-rose-400 cursor-pointer"
                          title="מחק פסקה זו"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Enlarged Heading Input */}
                    <div className="mb-2.5">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-semibold text-amber-400 flex items-center gap-1">
                          <Heading className="w-3 h-3" />
                          <span>כותרת מוגדלת לפסקה (אופציונלי):</span>
                        </span>
                        <span className="text-[10px] text-slate-400">תופיע בפונט גדול ומובלט</span>
                      </div>
                      <input
                        type="text"
                        value={sec.heading || ''}
                        onChange={(e) => handleUpdateSection(sec.id, 'heading', e.target.value)}
                        placeholder="למשל: מאפייני הבניין והדגש, תנועות אותיות האיתן..."
                        className="w-full bg-slate-800 border border-slate-700 focus:border-amber-400 text-amber-300 font-bold rounded-lg px-3 py-1.5 text-sm focus:outline-none"
                      />
                    </div>

                    {/* Paragraph Content Textarea */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-semibold text-slate-300">
                          תוכן הפסקה וההסבר:
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              const addition = sec.content ? '\n• ' : '• ';
                              handleUpdateSection(sec.id, 'content', sec.content + addition);
                            }}
                            className="text-[10px] bg-slate-800 hover:bg-slate-700 text-teal-300 px-1.5 py-0.5 rounded border border-slate-700 cursor-pointer"
                          >
                            + נקודה/בולט
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              handleUpdateSection(sec.id, 'content', sec.content + ' **טקסט מודגש**');
                            }}
                            className="text-[10px] bg-slate-800 hover:bg-slate-700 text-sky-300 px-1.5 py-0.5 rounded border border-slate-700 cursor-pointer"
                          >
                            ** הדגש
                          </button>
                        </div>
                      </div>
                      <textarea
                        rows={3}
                        value={sec.content}
                        onChange={(e) => handleUpdateSection(sec.id, 'content', e.target.value)}
                        placeholder="רשמו כאן את תוכן הפסקה..."
                        className="w-full bg-slate-800 border border-slate-700 focus:border-emerald-500 text-slate-100 rounded-lg p-2.5 text-sm focus:outline-none leading-relaxed"
                      />
                    </div>
                  </div>
                ))}

                {/* Add Section Action Buttons (Directly answering user's request!) */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleAddSectionWithHeading}
                    className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>הוסף פסקה עם כותרת מוגדלת</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleAddParagraphOnly}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-emerald-400" />
                    <span>הוסף פסקת טקסט</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleAddHeadingOnly}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Heading className="w-3.5 h-3.5 text-amber-400" />
                    <span>הוסף כותרת מוגדלת בלבד</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleAddTipSection}
                    className="px-3 py-2 bg-slate-800 hover:bg-emerald-950/50 text-emerald-300 border border-emerald-500/30 text-xs font-medium rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Lightbulb className="w-3.5 h-3.5 text-amber-300" />
                    <span>הוסף תיבת דגש / טיפ</span>
                  </button>
                </div>
              </div>
            )}

            {/* Mode 2: Word-like Rich Text Editor with Formatting Toolbar */}
            {editorMode === 'word' && (
              <div className="space-y-2">
                {/* Word Toolbar */}
                <div className="bg-slate-900 border border-slate-700 rounded-xl p-2 flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => insertWordFormatting('\n\n### ', '\n', 'כותרת ראשית מוגדלת')}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg text-xs font-bold border border-slate-700 flex items-center gap-1 cursor-pointer"
                    title="הוספת כותרת ראשית מוגדלת (H1)"
                  >
                    <Heading className="w-3.5 h-3.5" />
                    <span>כותרת H1</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => insertWordFormatting('\n\n#### ', '\n', 'כותרת משנית')}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-lg text-xs font-semibold border border-slate-700 flex items-center gap-1 cursor-pointer"
                    title="הוספת כותרת משנית (H2)"
                  >
                    <Heading className="w-3 h-3" />
                    <span>כותרת H2</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => insertWordFormatting('**', '**', 'טקסט מודגש')}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold border border-slate-700 flex items-center gap-1 cursor-pointer"
                    title="הדגשת טקסט (Bold)"
                  >
                    <Bold className="w-3.5 h-3.5" />
                    <span>מודגש</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => insertWordFormatting('\n• ', '', 'פריט ברשימה')}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-teal-300 rounded-lg text-xs border border-slate-700 flex items-center gap-1 cursor-pointer"
                    title="הוספת פריט תבליט (רשימת נקודות)"
                  >
                    <List className="w-3.5 h-3.5" />
                    <span>נקודת תבליט</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => insertWordFormatting('\n\n💡 דגש חשוב:\n', '', 'שימו לב לכלל הדקדוקי')}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-emerald-950 text-emerald-300 rounded-lg text-xs border border-emerald-500/40 flex items-center gap-1 cursor-pointer"
                    title="הוספת תיבת דגש וטיפ"
                  >
                    <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                    <span>דגש / טיפ</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => insertWordFormatting('\n\n', '', '')}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs border border-slate-700 cursor-pointer"
                    title="מעבר לפסקה חדשה"
                  >
                    <span>¶ פסקה חדשה</span>
                  </button>
                </div>

                <textarea
                  ref={textareaRef}
                  required
                  rows={7}
                  value={explanation}
                  onChange={(e) => {
                    setExplanation(e.target.value);
                    setSections(parseExplanationText(e.target.value));
                  }}
                  placeholder="הקלידו כאן את ההסבר הפדגוגי. השתמשו בסרגל הכלים למעלה להוספת כותרות מוגדלות (###), פסקאות מרווחות (אנטר כפול) ונקודות תבליט..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3.5 text-sm text-white focus:outline-none focus:border-emerald-500 leading-relaxed font-sans"
                />
              </div>
            )}

            {/* Live Student Preview Box */}
            {showLivePreview && (
              <div className="mt-4 pt-3 border-t border-slate-700/60">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-purple-400" />
                    <span>תצוגה מקדימה חיה של ההסבר לתלמיד (בחלון האוצר):</span>
                  </span>
                  <span className="text-[10px] text-slate-400">
                    מוצג עם כותרות מוגדלות, ריווח פסקאות וצבעי הדגשה
                  </span>
                </div>

                <div className="max-h-56 overflow-y-auto rounded-xl p-3.5 bg-slate-950/70 border border-slate-700/80">
                  <PedagogicalExplanationView
                    explanation={
                      editorMode === 'structured'
                        ? serializeSectionsToText(sections)
                        : explanation
                    }
                  />
                </div>
              </div>
            )}
          </div>

          {/* 5. Illustrated Examples */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300">
                5. דוגמאות מומחשות (מנוקדות בערבית + פירוש):
              </label>
              <button
                type="button"
                onClick={handleAddExample}
                className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer font-medium"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>הוסף דוגמה</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {examples.map((eg, idx) => (
                <div
                  key={idx}
                  className="bg-slate-800/80 border border-slate-700 p-3 rounded-xl grid grid-cols-1 sm:grid-cols-4 gap-2 items-center"
                >
                  <div>
                    <input
                      type="text"
                      placeholder="ערבית (כגון عَلَّمَ)"
                      value={eg.arabic}
                      onChange={(e) => handleUpdateExample(idx, 'arabic', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-base font-arabic font-bold text-emerald-400 focus:outline-none focus:border-emerald-500 text-right"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="תעתיק (עַלַּםַ)"
                      value={eg.transliteration || ''}
                      onChange={(e) => handleUpdateExample(idx, 'transliteration', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="תרגום (הוא לימד)"
                      value={eg.hebrew}
                      onChange={(e) => handleUpdateExample(idx, 'hebrew', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      placeholder="הערה (בניין 2 עבר)"
                      value={eg.note || ''}
                      onChange={(e) => handleUpdateExample(idx, 'note', e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-teal-300 focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveExample(idx)}
                      disabled={examples.length <= 1}
                      className="p-1.5 text-slate-400 hover:text-rose-400 disabled:opacity-30 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 6. Image Selection & Direct File Upload */}
          <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-4 space-y-3.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-emerald-400" />
                <span>6. תמונה נלווית לחבילת הידע:</span>
              </label>
              {imageUrl.startsWith('data:') && (
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>קובץ מהמכשיר נטען בהצלחה</span>
                </span>
              )}
            </div>

            {/* Hidden native file input supporting files/gallery on phone and computer */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleFileInputChange}
            />

            {/* Prominent Upload & Drag Drop Zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-4 sm:p-5 text-center cursor-pointer transition-all ${
                isDragOver
                  ? 'border-emerald-400 bg-emerald-950/30 ring-4 ring-emerald-500/20'
                  : 'border-slate-700 hover:border-emerald-500/60 bg-slate-900/60 hover:bg-slate-900/90'
              }`}
            >
              <div className="flex flex-col items-center justify-center gap-2">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 transition-transform shadow-inner">
                  {isUploading ? (
                    <RefreshCw className="w-6 h-6 animate-spin text-emerald-400" />
                  ) : (
                    <FolderOpen className="w-6 h-6 text-emerald-400" />
                  )}
                </div>

                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white mb-0.5">
                    {isUploading
                      ? 'מעבד ומייעל תמונה מהמכשיר...'
                      : 'העלאת תמונה מתיקייה בפלאפון או במחשב'}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    לחצו לבחירת תמונה מגלריית התמונות או מתיקיות הקבצים (JPG, PNG, WEBP)
                  </p>
                </div>

                <button
                  type="button"
                  disabled={isUploading}
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="mt-1 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>בחירת תמונה מהמכשיר</span>
                </button>
              </div>
            </div>

            {/* Error or Success notification */}
            {uploadError && (
              <p className="text-xs text-rose-400 bg-rose-950/40 border border-rose-500/40 p-2.5 rounded-xl">
                {uploadError}
              </p>
            )}
            {uploadSuccessMsg && (
              <p className="text-xs text-emerald-300 bg-emerald-950/40 border border-emerald-500/40 p-2.5 rounded-xl flex items-center gap-1.5 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{uploadSuccessMsg}</span>
              </p>
            )}

            {/* Live Image Preview Card */}
            {imageUrl && (
              <div className="rounded-xl overflow-hidden border border-slate-700 bg-slate-950 p-2.5 flex flex-col sm:flex-row items-center gap-3">
                <div className="w-full sm:w-36 h-28 rounded-lg overflow-hidden border border-slate-800 bg-slate-900 shrink-0 shadow-md">
                  <img
                    src={resolveImageUrl(imageUrl)}
                    alt="תצוגה מקדימה"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 w-full space-y-1.5 text-right">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">
                      תצוגה מקדימה של התמונה שנבחרה לחבילה:
                    </span>
                    <button
                      type="button"
                      onClick={() => setImageUrl('/src/assets/images/arabic_grammar_scroll_1793466159684.jpg')}
                      className="text-[11px] text-slate-400 hover:text-rose-400 p-1 rounded cursor-pointer"
                      title="איפוס לתמונת ברירת מחדל"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-1 break-all">
                    {imageUrl.startsWith('data:') ? 'קובץ תמונה מקומי מעובד (Data URL)' : imageUrl}
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold rounded-lg border border-slate-700 flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3 text-emerald-400" />
                      <span>החלף תמונה מהמכשיר</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Alternative: Preset Samples */}
            <div className="pt-2 border-t border-slate-800/80 space-y-2">
              <span className="text-[11px] text-slate-400 block">
                או בחרו מתוך מאגר תמונות ההרפתקה המוכנות:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {SAMPLE_IMAGES.map((img) => (
                  <button
                    key={img.url}
                    type="button"
                    onClick={() => setImageUrl(img.url)}
                    className={`text-xs px-2.5 py-1 rounded-lg border transition-colors cursor-pointer flex items-center gap-1 ${
                      imageUrl === img.url
                        ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300 font-bold'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>{img.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-xl transition-colors cursor-pointer"
            >
              ביטול
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl shadow-md transition-colors cursor-pointer"
            >
              שמור חבילת ידע
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
