import React, { useState, useEffect } from 'react';
import {
  Layers,
  HelpCircle,
  Plus,
  Edit2,
  Trash2,
  Download,
  Upload,
  BookOpen,
  Eye,
  ArrowRight,
  Share2,
  Users,
  Check,
  Sparkles,
  Trophy,
  Filter,
  Lock,
  Cloud,
  RefreshCw,
  LogIn,
  LogOut,
  UserCheck,
  MapPin,
  Cpu,
} from 'lucide-react';
import {
  GameTrack,
  KnowledgePackage,
  Question,
  StudentProgressRecord,
  DifficultyLevel,
} from '../../types/game';
import { PackageEditorModal } from './PackageEditorModal';
import { QuestionEditorModal } from './QuestionEditorModal';
import { TrackEditorModal } from './TrackEditorModal';
import { PedagogicalExplanationView } from '../Common/PedagogicalExplanationView';
import { resolveImageUrl } from '../../utils/imageUrl';
import { formatDurationHebrew, cleanTenseLabel, cleanPersonLabel } from '../../utils/grammarLabels';
import { auth, googleProvider } from '../../firebase/config';
import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import {
  subscribeToStudentRecords,
  saveAllGameTracksToFirestore,
  deleteGameTrackFromFirestore,
} from '../../firebase/firestoreService';
import {
  LANDSCAPE_PRESETS,
  generateStageScenesWithLandmarks,
} from '../../data/landmarkPresets';

interface TeacherStudioViewProps {
  tracks: GameTrack[];
  activeTrackId: string;
  onSelectTrack: (trackId: string) => void;
  onUpdateTracks: (tracks: GameTrack[]) => Promise<boolean> | void;
  onReturnToGame: () => void;
  onLockStudio?: () => void;
  onOpenGDevelopSpec?: () => void;
}

export const TeacherStudioView: React.FC<TeacherStudioViewProps> = ({
  tracks,
  activeTrackId,
  onSelectTrack,
  onUpdateTracks,
  onReturnToGame,
  onLockStudio,
  onOpenGDevelopSpec,
}) => {
  const [activeTab, setActiveTab] = useState<'tracks' | 'packages' | 'questions' | 'analytics' | 'export_import'>('tracks');
  const [copiedLink, setCopiedLink] = useState(false);
  const [cloudSyncLoading, setCloudSyncLoading] = useState(false);
  const [cloudMessage, setCloudMessage] = useState<{
    text: string;
    isError?: boolean;
    isSyncing?: boolean;
  } | null>(null);
  const noticeTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const showNotice = (text: string, isError = false, isSyncing = false) => {
    if (noticeTimerRef.current) {
      clearTimeout(noticeTimerRef.current);
      noticeTimerRef.current = null;
    }
    setCloudMessage({ text, isError, isSyncing });
    if (!isSyncing) {
      noticeTimerRef.current = setTimeout(() => {
        setCloudMessage(null);
        noticeTimerRef.current = null;
      }, 5000);
    }
  };

  // Auth state for teacher
  const [teacherUser, setTeacherUser] = useState<User | null>(() => auth.currentUser);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setTeacherUser(user);
    });
    return () => unsubscribeAuth();
  }, []);

  const handleTeacherGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error('Google teacher sign-in failed:', err);
    }
  };

  const handleTeacherSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Sign out failed:', err);
    }
  };

  const handleManualCloudSync = async () => {
    setCloudSyncLoading(true);
    setCloudMessage(null);
    try {
      await saveAllGameTracksToFirestore(tracks);
      showNotice('כל המשחקים והשלבים נשמרו בענן בהצלחה! ☁️');
    } catch (err) {
      console.error('Manual cloud sync failed:', err);
      const reason = err instanceof Error ? err.message : '';
      showNotice(`שגיאה בסנכרון לענן Firebase${reason ? ` (${reason})` : ''}.`, true);
    } finally {
      setCloudSyncLoading(false);
    }
  };

  // Active track
  const currentTrack = tracks.find((t) => t.id === activeTrackId) || tracks[0];

  // Student progress records loaded from storage & real-time Firestore
  const [studentRecords, setStudentRecords] = useState<StudentProgressRecord[]>([]);

  useEffect(() => {
    // 1. Initial cached records
    try {
      const recordsJson = localStorage.getItem('arabic_adventure_student_records');
      if (recordsJson) {
        setStudentRecords(JSON.parse(recordsJson));
      }
    } catch {
      // Ignore
    }

    // 2. Real-time sync from Firestore across devices
    const unsubscribe = subscribeToStudentRecords((liveRecords) => {
      if (liveRecords && liveRecords.length > 0) {
        setStudentRecords(liveRecords);
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Modals state
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<KnowledgePackage | null>(null);

  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [previewPackage, setPreviewPackage] = useState<KnowledgePackage | null>(null);

  // Edit Track modal
  const [isEditTrackModalOpen, setIsEditTrackModalOpen] = useState(false);
  const [editingTrackForModal, setEditingTrackForModal] = useState<GameTrack | null>(null);

  const syncTracksAndNotify = async (updatedTracks: GameTrack[], successText: string) => {
    showNotice('שומר ומסנכרן שינויים לענן Firebase...', false, true);
    const res = await onUpdateTracks(updatedTracks);
    if (res === false) {
      showNotice('השינוי נשמר מקומית, אך הסנכרון לענן Firebase נכשל. בדקו חיבור לאינטרנט ונסו שוב.', true);
    } else {
      showNotice(successText);
    }
  };

  const handleSaveEditedTrack = async (updatedTrack: GameTrack) => {
    const updated = tracks.map((t) => (t.id === updatedTrack.id ? updatedTrack : t));
    setIsEditTrackModalOpen(false);
    setEditingTrackForModal(null);
    await syncTracksAndNotify(updated, 'פרטי הרמה נשמרו וסונכרנו לענן (Firebase) ☁️');
  };

  // New Track creation inline modal
  const [isCreatingTrack, setIsCreatingTrack] = useState(false);
  const [newTrackTitle, setNewTrackTitle] = useState('');
  const [newTrackDifficulty, setNewTrackDifficulty] = useState<DifficultyLevel>('basic');
  const [newTrackDesc, setNewTrackDesc] = useState('');

  // Handle Track Save
  const handleCreateTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTrackTitle.trim()) return;

    const newTrack: GameTrack = {
      id: `track-${Date.now()}`,
      title: newTrackTitle.trim(),
      difficulty: newTrackDifficulty,
      description: newTrackDesc.trim() || 'מסלול מותאם אישית לדקדוק ערבי',
      shareCode: `ARB-${Date.now().toString().slice(-4)}`,
      packages: [...currentTrack.packages],
      questions: [...currentTrack.questions],
      stages: [...currentTrack.stages],
    };

    const updated = [...tracks, newTrack];
    onSelectTrack(newTrack.id);
    setIsCreatingTrack(false);
    setNewTrackTitle('');
    setNewTrackDesc('');
    await syncTracksAndNotify(updated, 'המשחק החדש נוצר וסונכרן לענן (Firebase) ☁️');
  };

  const handleDeleteTrack = (trackId: string) => {
    if (tracks.length <= 1) {
      showNotice('חייב להישאר לפחות משחק אחד פעיל במערכת.', true);
      return;
    }
    setConfirmAction({
      message: 'האם אתם בטוחים שברצונכם למחוק משחק זה?',
      onConfirm: async () => {
        const updated = tracks.filter((t) => t.id !== trackId);
        onSelectTrack(updated[0].id);
        await syncTracksAndNotify(updated, 'המשחק נמחק ועודכן בענן ☁️');
        deleteGameTrackFromFirestore(trackId).catch((err) => {
          console.error('Failed to delete track from Firestore:', err);
        });
      },
    });
  };

  // Packages within active track with stage and station placement
  const handleSavePackage = async (
    pkg: KnowledgePackage,
    targetStageId?: string,
    targetNodeId?: string
  ) => {
    const existing = currentTrack.packages.find((p) => p.id === pkg.id);
    const updatedPackages = existing
      ? currentTrack.packages.map((p) => (p.id === pkg.id ? pkg : p))
      : [...currentTrack.packages, pkg];

    let updatedStages = currentTrack.stages;
    if (targetStageId) {
      updatedStages = currentTrack.stages.map((stg, sIdx) => {
        const preset =
          LANDSCAPE_PRESETS.find((p) => p.name === stg.landscapeName || p.id === stg.id) ||
          LANDSCAPE_PRESETS[sIdx] ||
          LANDSCAPE_PRESETS[0];

        // If this stage is NOT targetStageId, remove pkg.id from its packageIds and nodes
        if (stg.id !== targetStageId) {
          const newPackageIds = (stg.packageIds || []).filter((id) => id !== pkg.id);
          const nodes = stg.nodes
            .filter((n) => !(n.type === 'treasure' && n.packageId === pkg.id))
            .map((n) => (n.packageId === pkg.id ? { ...n, packageId: undefined } : n));
          const scenes = generateStageScenesWithLandmarks(preset, nodes);
          return {
            ...stg,
            packageIds: newPackageIds,
            nodes,
            scenes,
          };
        }

        // In the target stage:
        const existingPkgIds = stg.packageIds || [];
        const newPkgIds = existingPkgIds.includes(pkg.id)
          ? existingPkgIds
          : [...existingPkgIds, pkg.id];

        // Clean any previous placement of this package in the target stage
        let nodes = stg.nodes
          .filter((n) => !(n.type === 'treasure' && n.packageId === pkg.id))
          .map((n) => (n.packageId === pkg.id ? { ...n, packageId: undefined } : n));

        if (targetNodeId && !targetNodeId.startsWith('treasure-')) {
          // Attached to a specific landmark station node: ONLY if it's NOT a question node!
          const targetNode = nodes.find((n) => n.id === targetNodeId);
          if (targetNode && !targetNode.questionId && targetNode.type !== 'question') {
            nodes = nodes.map((n) => {
              if (n.id === targetNodeId) {
                return {
                  ...n,
                  packageId: pkg.id,
                };
              }
              return n;
            });
          } else {
            // Target node is already a question or unavailable: place as dedicated treasure node
            nodes.unshift({
              id: `treasure-${stg.id}-${pkg.id}`,
              type: 'treasure',
              title: `אוצר: ${pkg.title}`,
              packageId: pkg.id,
              scoreReward: 50,
              position: { x: 24, y: 72 },
            });
          }
        } else {
          // Dedicated themed treasure chest
          const pos = targetNodeId?.endsWith('-mid')
            ? { x: 50, y: 70 }
            : targetNodeId?.endsWith('-end')
            ? { x: 74, y: 74 }
            : { x: 24, y: 72 };

          let themedTitle = 'אוצר שביל האבנים';
          if (stg.landscapeName?.includes('מדבר') || stg.title?.includes('מדבר')) {
            themedTitle = targetNodeId?.endsWith('-mid')
              ? 'יהלום המים והמעיין הצלול'
              : targetNodeId?.endsWith('-end')
              ? 'אוצר הידע הדקדוקי של פירמידת השמש'
              : 'אוצר נווה המדבר';
          } else if (stg.landscapeName?.includes('שלג') || stg.title?.includes('שלג') || stg.title?.includes('אלפים')) {
            themedTitle = targetNodeId?.endsWith('-mid')
              ? 'יהלום המעבר הארקטי'
              : targetNodeId?.endsWith('-end')
              ? 'אוצר הידע הדקדוקי של פסגת השלג'
              : 'אוצר אגם הטורקיז';
          } else if (stg.landscapeName?.includes('קניון') || stg.title?.includes('קניון')) {
            themedTitle = targetNodeId?.endsWith('-mid')
              ? 'יהלום המפל והמערה'
              : targetNodeId?.endsWith('-end')
              ? 'אוצר הידע של שער האבן'
              : 'אוצר קניון הנהר';
          } else {
            themedTitle = targetNodeId?.endsWith('-mid')
              ? 'יהלום המים והמפל הסודי'
              : targetNodeId?.endsWith('-end')
              ? 'אוצר הידע הדקדוקי של שער העץ'
              : 'אוצר שביל האבנים';
          }

          nodes.unshift({
            id: targetNodeId || `treasure-${stg.id}-${pkg.id}`,
            type: 'treasure',
            title: `${themedTitle}: ${pkg.title}`,
            packageId: pkg.id,
            scoreReward: 50,
            position: pos,
          });
        }

        const scenes = generateStageScenesWithLandmarks(preset, nodes);

        return {
          ...stg,
          packageIds: newPkgIds,
          nodes,
          scenes,
        };
      });
    }

    const updatedTrack: GameTrack = {
      ...currentTrack,
      packages: updatedPackages,
      stages: updatedStages,
    };
    setIsPackageModalOpen(false);
    setEditingPackage(null);
    await syncTracksAndNotify(
      tracks.map((t) => (t.id === updatedTrack.id ? updatedTrack : t)),
      'חבילת הידע נשמרה וסונכרנה לענן (Firebase) ☁️'
    );
  };

  const handleDeletePackage = (pkgId: string) => {
    setConfirmAction({
      message: 'האם למחוק חבילת ידע זו מהמשחק?',
      onConfirm: async () => {
        const updatedPackages = currentTrack.packages.filter((p) => p.id !== pkgId);
        const updatedStages = currentTrack.stages.map((stg, sIdx) => {
          const preset =
            LANDSCAPE_PRESETS.find((p) => p.name === stg.landscapeName || p.id === stg.id) ||
            LANDSCAPE_PRESETS[sIdx] ||
            LANDSCAPE_PRESETS[0];
          const nodes = stg.nodes
            .filter((n) => !(n.type === 'treasure' && n.packageId === pkgId))
            .map((n) => (n.packageId === pkgId ? { ...n, packageId: undefined } : n));
          const packageIds = (stg.packageIds || []).filter((id) => id !== pkgId);
          const scenes = generateStageScenesWithLandmarks(preset, nodes);
          return { ...stg, packageIds, nodes, scenes };
        });
        const updatedTrack: GameTrack = {
          ...currentTrack,
          packages: updatedPackages,
          stages: updatedStages,
        };
        await syncTracksAndNotify(
          tracks.map((t) => (t.id === updatedTrack.id ? updatedTrack : t)),
          'חבילת הידע נמחקה והשינוי סונכרן לענן ☁️'
        );
      },
    });
  };

  // Questions within active track with stage and station placement
  const handleSaveQuestion = async (q: Question, targetStageId?: string, targetNodeId?: string) => {
    const existing = currentTrack.questions.find((item) => item.id === q.id);
    const updatedQuestions = existing
      ? currentTrack.questions.map((item) => (item.id === q.id ? q : item))
      : [...currentTrack.questions, q];

    // If targetStageId and targetNodeId are supplied, update the stages
    let updatedStages = currentTrack.stages;
    if (targetStageId && targetNodeId) {
      updatedStages = currentTrack.stages.map((stg, sIdx) => {
        const preset =
          LANDSCAPE_PRESETS.find((p) => p.name === stg.landscapeName || p.id === stg.id) ||
          LANDSCAPE_PRESETS[sIdx] ||
          LANDSCAPE_PRESETS[0];

        // Remove q.id from other nodes
        let nodes = stg.nodes.map((node) => {
          if (node.questionId === q.id && (stg.id !== targetStageId || node.id !== targetNodeId)) {
            return {
              ...node,
              questionId: undefined,
              type: 'landmark' as const,
            };
          }
          return node;
        });

        // Assign to the target node
        if (stg.id === targetStageId) {
          let displacedPkgId: string | undefined;

          nodes = nodes.map((node) => {
            if (node.id === targetNodeId) {
              if (node.packageId) {
                displacedPkgId = node.packageId;
              }
              return {
                ...node,
                questionId: q.id,
                type: 'question' as const,
                packageId: undefined, // Clear any stuck packageId!
              };
            }
            return node;
          });

          // If a package was displaced from this station, ensure it has its own dedicated treasure node in the stage
          if (displacedPkgId && !nodes.some((n) => n.type === 'treasure' && n.packageId === displacedPkgId)) {
            nodes.unshift({
              id: `treasure-${stg.id}-${displacedPkgId}`,
              type: 'treasure',
              title: 'אוצר ידע דקדוקי',
              packageId: displacedPkgId,
              scoreReward: 50,
              position: { x: 24, y: 72 },
            });
          }
        }

        const scenes = generateStageScenesWithLandmarks(preset, nodes);

        return { ...stg, nodes, scenes };
      });
    }

    const updatedTrack: GameTrack = {
      ...currentTrack,
      questions: updatedQuestions,
      stages: updatedStages,
    };
    setIsQuestionModalOpen(false);
    setEditingQuestion(null);
    await syncTracksAndNotify(
      tracks.map((t) => (t.id === updatedTrack.id ? updatedTrack : t)),
      'השאלה נשמרה וסונכרנה לענן (Firebase) ☁️'
    );
  };

  const handleDeleteQuestion = (qId: string) => {
    setConfirmAction({
      message: 'האם למחוק שאלה זו מהמשחק?',
      onConfirm: async () => {
        const updatedQuestions = currentTrack.questions.filter((item) => item.id !== qId);
        const updatedStages = currentTrack.stages.map((stg, sIdx) => {
          const preset =
            LANDSCAPE_PRESETS.find((p) => p.name === stg.landscapeName || p.id === stg.id) ||
            LANDSCAPE_PRESETS[sIdx] ||
            LANDSCAPE_PRESETS[0];
          const nodes = stg.nodes.map((n) =>
            n.questionId === qId ? { ...n, questionId: undefined, type: 'landmark' as const } : n
          );
          const scenes = generateStageScenesWithLandmarks(preset, nodes);
          return { ...stg, nodes, scenes };
        });
        const updatedTrack: GameTrack = { ...currentTrack, questions: updatedQuestions, stages: updatedStages };
        await syncTracksAndNotify(
          tracks.map((t) => (t.id === updatedTrack.id ? updatedTrack : t)),
          'השאלה נמחקה והשינוי סונכרן לענן ☁️'
        );
      },
    });
  };

  // Share Link Generation - strictly fixed to https://arabicverbs-trip.vercel.app/ as requested
  const handleCopyShareLink = () => {
    const shareUrl = 'https://arabicverbs-trip.vercel.app/';
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // JSON Export / Import
  const handleExportJson = () => {
    const exportData = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      activeTrackId: currentTrack.id,
      tracks,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `arabic_grammar_games_database_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.tracks && Array.isArray(parsed.tracks)) {
          if (parsed.tracks.length > 0) {
            onSelectTrack(parsed.tracks[0].id);
          }
          await syncTracksAndNotify(parsed.tracks, 'מאגר המשחקים יובא בהצלחה לענן ולמכשיר! ☁️');
        } else {
          showNotice('מבנה קובץ ה-JSON אינו תקין.', true);
        }
      } catch {
        showNotice('שגיאה בקריאת הקובץ.', true);
      }
    };
    reader.readAsText(file);
  };

  const handleClearStudentRecords = () => {
    setConfirmAction({
      message: 'האם לאפס את נתוני המעקב של כל התלמידים?',
      onConfirm: () => {
        localStorage.removeItem('arabic_adventure_student_records');
        setStudentRecords([]);
        showNotice('נתוני המעקב המקומיים אופסו.');
      },
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col select-none">
      {/* Top Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-white">
              ממשק המורה וניהול מאגר המשחקים
            </h1>
            <p className="text-xs text-slate-400">
              ניהול רמות קושי, חבילות ידע, בנק שאלות ומעקב אחר התקדמות תלמידים
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Manual Force Cloud Sync */}
          <button
            onClick={handleManualCloudSync}
            disabled={cloudSyncLoading}
            className="px-3 py-2 bg-purple-900/40 hover:bg-purple-800/50 text-purple-200 border border-purple-500/40 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            title="סנכרן ושמור את כל המשחקים והשלבים בענן Firebase"
          >
            {cloudSyncLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin text-purple-300" />
            ) : (
              <Cloud className="w-4 h-4 text-purple-400" />
            )}
            <span>{cloudSyncLoading ? 'מסנכרן...' : 'סנכרון ענן (Firebase)'}</span>
          </button>

          {/* Teacher Google Login / Account Info */}
          {teacherUser ? (
            <div className="flex items-center gap-1.5 bg-slate-800/90 border border-slate-700 px-2.5 py-1.5 rounded-xl text-xs text-slate-300">
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="max-w-[120px] truncate text-[11px] font-mono text-emerald-300">
                {teacherUser.email || 'מורה מחובר'}
              </span>
              <button
                onClick={handleTeacherSignOut}
                className="text-slate-400 hover:text-rose-400 p-0.5 rounded cursor-pointer"
                title="התנתק"
              >
                <LogOut className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleTeacherGoogleSignIn}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:border-slate-600 text-xs font-medium rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              title="התחבר עם חשבון Google כמורה (mailforint@gmail.com)"
            >
              <LogIn className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">התחברות מורה</span>
            </button>
          )}

          <button
            onClick={handleCopyShareLink}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-teal-300 border border-teal-500/30 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            title="העתק קישור ישיר למשחק התלמידים: https://arabicverbs-trip.vercel.app/"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            <span>{copiedLink ? 'הקישור הועתק!' : 'העתק קישור לתלמידים'}</span>
          </button>

          {onOpenGDevelopSpec && (
            <button
              onClick={onOpenGDevelopSpec}
              className="px-3 py-2 bg-indigo-950/70 hover:bg-indigo-900/80 text-indigo-200 border border-indigo-500/40 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              title="פתח מפרט טכני, ארכיטקטורה וגיליונות אירועים מלאים ל-GDevelop 5"
            >
              <Cpu className="w-4 h-4 text-indigo-400" />
              <span>מפרט GDevelop 5</span>
            </button>
          )}

          <button
            onClick={onReturnToGame}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold rounded-xl flex items-center gap-2 transition-all active:scale-98 cursor-pointer shadow-md shadow-emerald-600/25"
          >
            <ArrowRight className="w-4 h-4" />
            <span>הרץ משחק בסימולטור</span>
          </button>

          {onLockStudio && (
            <button
              onClick={onLockStudio}
              className="px-3 py-2 bg-slate-800 hover:bg-rose-950/40 text-slate-300 hover:text-rose-400 border border-slate-700 hover:border-rose-500/30 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              title="נעילת ממשק המורה"
            >
              <Lock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">נעילה</span>
            </button>
          )}
        </div>
      </header>

      {/* Floating Cloud Notification Toast (always visible regardless of scroll position) */}
      {cloudMessage && (
        <div
          className={`fixed top-16 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md p-3.5 border rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2.5 shadow-2xl backdrop-blur-md animate-fade-in ${
            cloudMessage.isError
              ? 'bg-rose-950/95 border-rose-500/70 text-rose-100'
              : cloudMessage.isSyncing
              ? 'bg-amber-950/95 border-amber-500/70 text-amber-100'
              : 'bg-emerald-950/95 border-emerald-500/70 text-emerald-100'
          }`}
        >
          {cloudMessage.isSyncing ? (
            <RefreshCw className="w-4 h-4 shrink-0 text-amber-400 animate-spin" />
          ) : (
            <Cloud className={`w-4 h-4 shrink-0 ${cloudMessage.isError ? 'text-rose-400' : 'text-emerald-400'}`} />
          )}
          <span className="flex-1">{cloudMessage.text}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-6xl mx-auto w-full p-4 sm:p-6 flex-1 flex flex-col">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3 mb-6">
          <button
            onClick={() => setActiveTab('tracks')}
            className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'tracks'
                ? 'bg-amber-600/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-white bg-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>מאגר משחקים ורמות ({tracks.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('packages')}
            className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'packages'
                ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-white bg-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>חבילות ידע ({currentTrack.packages.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('questions')}
            className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'questions'
                ? 'bg-teal-600/20 text-teal-300 border border-teal-500/40'
                : 'text-slate-400 hover:text-white bg-slate-900'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>בנק שאלות ({currentTrack.questions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'analytics'
                ? 'bg-sky-600/20 text-sky-300 border border-sky-500/40'
                : 'text-slate-400 hover:text-white bg-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>מעקב התקדמות תלמידים ({studentRecords.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('export_import')}
            className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'export_import'
                ? 'bg-purple-600/20 text-purple-300 border border-purple-500/40'
                : 'text-slate-400 hover:text-white bg-slate-900'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>ייצוא וייבוא JSON</span>
          </button>
        </div>

        {/* Tab 1: Game Tracks & Levels (מאגר משחקים) */}
        {activeTab === 'tracks' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">
                  מאגר משחקים ומסלולי לימוד לפי רמת קושי
                </h2>
                <p className="text-xs text-slate-400">
                  כל משחק מכיל חבילות ידע, שאלות ושלבים מותאמים. בחרו משחק פעיל או צרו רמה חדשה.
                </p>
              </div>

              <button
                onClick={() => setIsCreatingTrack(true)}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs sm:text-sm font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-md active:scale-98 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>יצירת משחק / רמה חדשה</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {tracks.map((track) => {
                const isActive = track.id === currentTrack.id;

                return (
                  <div
                    key={track.id}
                    className={`bg-slate-900 border rounded-2xl p-5 flex flex-col justify-between transition-all ${
                      isActive
                        ? 'border-amber-400/80 ring-2 ring-amber-400/20 bg-slate-900/90 shadow-xl'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            track.difficulty === 'basic'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : track.difficulty === 'intermediate'
                              ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                              : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          }`}
                        >
                          {track.difficulty === 'basic'
                            ? 'רמת יסוד'
                            : track.difficulty === 'intermediate'
                            ? 'רמת ביניים'
                            : 'רמת מתקדמים'}
                        </span>

                        {isActive && (
                          <span className="text-[10px] text-amber-300 font-bold bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30">
                            משחק פעיל לתלמיד ✓
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-white mb-2">{track.title}</h3>
                      <p className="text-xs text-slate-300 leading-relaxed mb-4 line-clamp-3">
                        {track.description}
                      </p>

                      <div className="space-y-1 text-xs text-slate-400 border-t border-slate-800/80 pt-3">
                        <div className="flex justify-between">
                          <span>חבילות ידע:</span>
                          <strong className="text-slate-200">{track.packages.length}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>בנק שאלות:</span>
                          <strong className="text-slate-200">{track.questions.length}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>שלבים במסלול:</span>
                          <strong className="text-slate-200">{track.stages.length} שלבי נוף</strong>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between gap-2">
                      <button
                        onClick={() => onSelectTrack(track.id)}
                        className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isActive
                            ? 'bg-amber-500 text-slate-950 shadow-md'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                        }`}
                      >
                        {isActive ? 'פעיל כעת' : 'בחר כמשחק פעיל'}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setEditingTrackForModal(track);
                          setIsEditTrackModalOpen(true);
                        }}
                        className="py-2 px-2.5 bg-slate-800 hover:bg-amber-950/40 text-slate-300 hover:text-amber-300 border border-slate-700 hover:border-amber-500/40 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                        title="ערוך פרטי רמה ומטרות"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-amber-400" />
                        <span>עריכת רמה</span>
                      </button>

                      <button
                        onClick={() => handleDeleteTrack(track.id)}
                        disabled={tracks.length <= 1}
                        className="p-2 text-slate-400 hover:text-rose-400 rounded-lg transition-colors disabled:opacity-30 cursor-pointer"
                        title="מחק משחק"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Packages for current track */}
        {activeTab === 'packages' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">
                  חבילות ידע פדגוגיות עבור: {currentTrack.title}
                </h2>
                <p className="text-xs text-slate-400">
                  נפתחות לתלמיד בגילוי אוצרות ויהלומים (פתיחה ברשות התלמיד)
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingPackage(null);
                  setIsPackageModalOpen(true);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-md active:scale-98 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>יצירת חבילת ידע</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentTrack.packages.map((pkg) => {
                // Find placement in stages
                let placementInfo = {
                  stageNum: 1,
                  stageTitle: currentTrack.stages[0]?.title || 'שלב 1',
                  stationTitle: 'תיבת אוצר ייעודית',
                };
                for (let sIdx = 0; sIdx < currentTrack.stages.length; sIdx++) {
                  const stg = currentTrack.stages[sIdx];
                  const node = stg.nodes.find(
                    (n) => n.packageId === pkg.id && !n.questionId && n.type !== 'question'
                  );
                  if (node) {
                    placementInfo = {
                      stageNum: sIdx + 1,
                      stageTitle: stg.title,
                      stationTitle: node.type === 'treasure' ? 'תיבת אוצר ייעודית' : node.title,
                    };
                    break;
                  }
                  if (stg.packageIds?.includes(pkg.id)) {
                    placementInfo = {
                      stageNum: sIdx + 1,
                      stageTitle: stg.title,
                      stationTitle: 'תיבת אוצר ייעודית',
                    };
                    break;
                  }
                }

                return (
                  <div
                    key={pkg.id}
                    className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between transition-all"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h3 className="text-base font-bold text-white">{pkg.title}</h3>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => setPreviewPackage(pkg)}
                            className="p-1.5 text-slate-400 hover:text-teal-300 rounded-lg transition-colors cursor-pointer"
                            title="תצוגה מקדימה כפי שמופיעה לתלמיד"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingPackage(pkg);
                              setIsPackageModalOpen(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                            title="ערוך חבילה ושיבוץ במסלול"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeletePackage(pkg.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                            title="מחק חבילה"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Stage & Station Placement Badge */}
                      <div className="flex items-center gap-1.5 text-xs text-purple-300 bg-purple-950/60 border border-purple-500/40 px-3 py-1.5 rounded-xl mb-3 shadow-xs">
                        <MapPin className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                        <span className="font-bold text-white">מיקום במשחק:</span>
                        <span className="font-semibold text-purple-200">
                          שלב {placementInfo.stageNum} ({placementInfo.stageTitle.split(':')[0]})
                        </span>
                        <span className="text-purple-400">·</span>
                        <span className="text-emerald-300 font-bold">{placementInfo.stationTitle}</span>
                      </div>

                    <div className="flex flex-wrap gap-1.5 text-[11px] mb-3">
                      <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded">
                        {pkg.binyanim.join(', ')}
                      </span>
                      <span className="bg-teal-500/10 border border-teal-500/20 text-teal-300 px-2 py-0.5 rounded">
                        {(pkg.tenses || []).map(cleanTenseLabel).join(', ')}
                      </span>
                      {pkg.persons && pkg.persons.length > 0 && (
                        <span className="bg-sky-500/10 border border-sky-500/20 text-sky-300 px-2 py-0.5 rounded">
                          גוף: {pkg.persons.map(cleanPersonLabel).join(', ')}
                        </span>
                      )}
                    </div>

                    {pkg.imageUrl && (
                      <div className="mb-3 rounded-xl overflow-hidden border border-slate-800 bg-slate-950 h-28 relative group">
                        <img
                          src={resolveImageUrl(pkg.imageUrl)}
                          alt={pkg.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {pkg.imageUrl.startsWith('data:') && (
                          <span className="absolute bottom-1.5 right-1.5 bg-slate-950/85 text-[10px] text-emerald-300 px-2 py-0.5 rounded-md border border-emerald-500/40 backdrop-blur-xs flex items-center gap-1 font-medium">
                            <span>תמונה שהועלתה מהמכשיר</span>
                          </span>
                        )}
                      </div>
                    )}

                    <p className="text-xs text-slate-300 leading-relaxed line-clamp-3 mb-3">
                      {pkg.explanation}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                    <span className="font-arabic text-emerald-400 font-bold text-sm">
                      {pkg.examples.map((e) => e.arabic).slice(0, 3).join(' · ')}
                    </span>
                    <span className="text-[11px]">{pkg.examples.length} דוגמאות מומחשות</span>
                  </div>
                </div>
              );
            })}
            </div>
          </div>
        )}

        {/* Tab 3: Questions for current track */}
        {activeTab === 'questions' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">
                  בנק שאלות עבור: {currentTrack.title}
                </h2>
                <p className="text-xs text-slate-400">
                  מענה על כל השאלות בשלב מהווה תנאי מעבר לשלב הבא
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingQuestion(null);
                  setIsQuestionModalOpen(true);
                }}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs sm:text-sm font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-md active:scale-98 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>יצירת שאלה חדשה</span>
              </button>
            </div>

            <div className="space-y-3">
              {currentTrack.questions.map((q) => (
                <div
                  key={q.id}
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 text-xs">
                      <span
                        className={`px-2 py-0.5 rounded font-semibold text-[10px] ${
                          q.type === 'multiple_choice'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                        }`}
                      >
                        {q.type === 'multiple_choice' ? 'שאלה אמריקאית' : 'התאמת צמדים'}
                      </span>
                      <span className="text-slate-400">{q.topic}</span>
                    </div>

                    <h3 className="text-sm sm:text-base font-semibold text-white mb-2">
                      {q.prompt}
                    </h3>

                    {q.type === 'multiple_choice' ? (
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        {q.arabicSample && (
                          <span className="text-xl font-arabic font-bold text-emerald-400 bg-slate-950 px-3 py-1 rounded border border-slate-800 leading-relaxed">
                            {q.arabicSample}
                          </span>
                        )}
                        <span className="text-emerald-300 bg-emerald-950/40 px-2.5 py-1 rounded border border-emerald-500/20">
                          תשובה נכונה: {q.correctAnswer}
                        </span>
                        <span className="text-slate-500">
                          + {q.distractors.length} מסיחים
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="text-teal-300">
                          {q.pairs.length} צמדי מילים ומשמעות
                        </span>
                        <span className="text-slate-500 font-arabic">
                          {q.pairs.map((p) => p.arabic).join(' · ')}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => {
                        setEditingQuestion(q);
                        setIsQuestionModalOpen(true);
                      }}
                      className="p-2 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                      title="ערוך שאלה"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteQuestion(q.id)}
                      className="p-2 text-slate-400 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                      title="מחק שאלה"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Student Progress Analytics (מעקב התקדמות תלמידים - שירות חינמי) */}
        {activeTab === 'analytics' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-sky-400" />
                  <span>מעקב התקדמות תלמידים בזמן אמת (חינמי ומובנה)</span>
                </h2>
                <p className="text-xs text-slate-400">
                  משדר ומציג את השלבים שהתלמיד עבר, ניקוד מצטבר, דיוק ומשוב ללא צורך בהרשמה בתשלום.
                </p>
              </div>

              {studentRecords.length > 0 && (
                <button
                  onClick={handleClearStudentRecords}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-700 text-xs rounded-xl transition-colors cursor-pointer"
                >
                  איפוס נתוני מעקב
                </button>
              )}
            </div>

            {studentRecords.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
                <Users className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-300">עדיין לא נרשמו פעילויות תלמידים</p>
                <p className="text-xs text-slate-500 mt-1">
                  כאשר תלמיד ישחק ויענה על שאלות או יעבור שלב, ההתקדמות תשודר לכאן מיד.
                </p>
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-semibold">
                      <tr>
                        <th className="p-3">שם התלמיד</th>
                        <th className="p-3">משחק / רמה</th>
                        <th className="p-3">שלב שהושג</th>
                        <th className="p-3">ניקוד מצטבר</th>
                        <th className="p-3">אוצרות</th>
                        <th className="p-3">דיוק בשאלות</th>
                        <th className="p-3">זמן פעילות</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300">
                      {studentRecords.map((rec) => {
                        const acc = rec.totalQuestions > 0 ? Math.round((rec.correctAnswers / rec.totalQuestions) * 100) : 100;
                        return (
                          <tr key={rec.id} className="hover:bg-slate-800/40 transition-colors">
                            <td className="p-3 font-bold text-white">{rec.studentName}</td>
                            <td className="p-3 text-slate-300">{rec.gameTrackTitle.split(':')[0]}</td>
                            <td className="p-3 font-semibold text-emerald-400">
                              שלב {rec.currentStageNumber} מתוך {rec.totalStages}
                            </td>
                            <td className="p-3 font-bold text-amber-400 tabular-nums">
                              {rec.score.toLocaleString()}
                            </td>
                            <td className="p-3 text-teal-300 tabular-nums">{rec.gemsCount} 💎</td>
                            <td className="p-3 font-semibold text-emerald-400 tabular-nums">{acc}%</td>
                            <td className="p-3">
                              <span className="font-bold text-teal-300 block">
                                {formatDurationHebrew(rec.timeSpentSeconds || (rec.totalQuestions > 0 ? rec.totalQuestions * 90 : 120))}
                              </span>
                              <span className="text-[10px] text-slate-500 block">
                                עודכן: {new Date(rec.completedAt).toLocaleTimeString('he-IL', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 5: Export & Import JSON */}
        {activeTab === 'export_import' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 max-w-2xl mx-auto w-full">
            <div>
              <h2 className="text-base font-bold text-white mb-1">
                ייצוא וייבוא מאגר המשחקים (JSON)
              </h2>
              <p className="text-xs text-slate-400">
                שומר אוטומטית בענן הדפדפן, ומאפשר הורדת קובץ לגיבוי מלא ושיתוף עם מורים עמיתים או GDevelop.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-800/60 border border-slate-700 p-5 rounded-xl flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3">
                    <Download className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1">ייצוא כל המשחקים לקובץ</h3>
                  <p className="text-xs text-slate-400 mb-4">
                    הורידו קובץ JSON הכולל את כל הרמות, השלבים, החבילות והשאלות.
                  </p>
                </div>
                <button
                  onClick={handleExportJson}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  הורד קובץ JSON
                </button>
              </div>

              <div className="bg-slate-800/60 border border-slate-700 p-5 rounded-xl flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center mb-3">
                    <Upload className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1">ייבוא מאגר משחקים</h3>
                  <p className="text-xs text-slate-400 mb-4">
                    טענו קובץ JSON שנשמר בעבר כדי לעדכן את המשחקים והרמות.
                  </p>
                </div>
                <label className="w-full py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer text-center block">
                  <span>בחר קובץ להעלאה</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportJson}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* New Track Inline Modal */}
      {isCreatingTrack && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 text-slate-100 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-3">יצירת משחק / רמת קושי חדשה</h3>
            <form onSubmit={handleCreateTrack} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">שם המשחק / הרמה:</label>
                <input
                  type="text"
                  required
                  value={newTrackTitle}
                  onChange={(e) => setNewTrackTitle(e.target.value)}
                  placeholder="למשל: רמה 4 - גזרות פעלים נחים ועתיד מנצוב"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">רמת קושי:</label>
                <select
                  value={newTrackDifficulty}
                  onChange={(e) => setNewTrackDifficulty(e.target.value as DifficultyLevel)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="basic">רמת יסוד (בניין 1 / עבר)</option>
                  <option value="intermediate">רמת ביניים (בניינים 2 ו-5)</option>
                  <option value="advanced">רמת מתקדמים לבגרות (5 יח"ל)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">תיאור קצר ומטרות למידה:</label>
                <textarea
                  rows={2}
                  value={newTrackDesc}
                  onChange={(e) => setNewTrackDesc(e.target.value)}
                  placeholder="מטרות דקדוקיות ותרגול ממוקד..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreatingTrack(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-xl"
                >
                  ביטול
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl"
                >
                  צור משחק
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Package Editor Modal */}
      {isPackageModalOpen && (
        <PackageEditorModal
          existingPackage={editingPackage}
          stages={currentTrack.stages}
          onSave={handleSavePackage}
          onClose={() => {
            setIsPackageModalOpen(false);
            setEditingPackage(null);
          }}
        />
      )}

      {/* Question Editor Modal */}
      {isQuestionModalOpen && (
        <QuestionEditorModal
          existingQuestion={editingQuestion}
          stages={currentTrack.stages}
          packageTopics={currentTrack.packages.map((p) => ({ id: p.id, title: p.title }))}
          onSave={handleSaveQuestion}
          onClose={() => {
            setIsQuestionModalOpen(false);
            setEditingQuestion(null);
          }}
        />
      )}

      {/* Preview Package Modal */}
      {previewPackage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
          <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl max-w-xl w-full p-5 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs text-emerald-400 font-bold">
                תצוגה מקדימה כפי שמוצגת לתלמיד בחלון האוצר:
              </span>
              <button
                onClick={() => setPreviewPackage(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <h2 className="text-base font-bold text-white mb-3 pb-2 border-b border-slate-700/80">{previewPackage.title}</h2>
            <div className="mb-4">
              <PedagogicalExplanationView explanation={previewPackage.explanation} />
            </div>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {previewPackage.examples.map((eg, i) => (
                <div key={i} className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
                  <span className="text-xl font-bold font-arabic text-emerald-400 block mb-0.5">
                    {eg.arabic}
                  </span>
                  <span className="text-xs text-white block">{eg.hebrew}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => setPreviewPackage(null)}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl"
            >
              סגור תצוגה
            </button>
          </div>
        </div>
      )}

      {/* Edit Level / Track Modal */}
      {isEditTrackModalOpen && editingTrackForModal && (
        <TrackEditorModal
          track={editingTrackForModal}
          onSave={handleSaveEditedTrack}
          onClose={() => {
            setIsEditTrackModalOpen(false);
            setEditingTrackForModal(null);
          }}
        />
      )}

      {/* Safe In-App Confirmation Dialog (no blocked window.confirm) */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-rose-500/40 rounded-2xl max-w-sm w-full p-5 text-slate-100 shadow-2xl text-center space-y-4">
            <p className="text-sm font-bold text-white leading-relaxed">{confirmAction.message}</p>
            <div className="flex flex-row-reverse gap-2">
              <button
                type="button"
                onClick={() => {
                  confirmAction.onConfirm();
                  setConfirmAction(null);
                }}
                className="flex-1 py-2 px-4 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                אישור
              </button>
              <button
                type="button"
                onClick={() => setConfirmAction(null)}
                className="flex-1 py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl cursor-pointer"
              >
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
