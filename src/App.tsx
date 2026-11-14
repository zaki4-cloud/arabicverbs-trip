import React, { useState, useEffect, useRef } from 'react';
import { Gamepad2, BookOpen, Cpu, Sparkles, Lock, Footprints, Cloud, CloudCheck, RefreshCw } from 'lucide-react';
import { StudentGameView } from './components/StudentGame/StudentGameView';
import { TeacherStudioView } from './components/TeacherStudio/TeacherStudioView';
import { GDevelopSpecHub } from './components/GDevelopSpec/GDevelopSpecHub';
import { TeacherAuthModal } from './components/TeacherStudio/TeacherAuthModal';
import { ErrorBoundary } from './components/Common/ErrorBoundary';
import { INITIAL_GAME_TRACKS } from './data/initialPackages';
import { GameTrack } from './types/game';
import {
  subscribeToGameTracks,
  saveChangedTracksToFirestore,
} from './firebase/firestoreService';
import { migrateTrackMapImages } from './utils/trackMigration';

type AppViewMode = 'game' | 'teacher' | 'gdevelop_spec';

export default function App() {
  const [viewMode, setViewMode] = useState<AppViewMode>(() => {
    try {
      const saved = localStorage.getItem('arabic_adventure_view_mode') as AppViewMode;
      if (saved && ['game', 'teacher', 'gdevelop_spec'].includes(saved)) {
        return saved;
      }
    } catch {
      // Ignore
    }
    return 'game';
  });

  const [isTeacherUnlocked, setIsTeacherUnlocked] = useState<boolean>(() => {
    try {
      return localStorage.getItem('arabic_adventure_teacher_unlocked') === 'true';
    } catch {
      return false;
    }
  });

  const [showTeacherAuthModal, setShowTeacherAuthModal] = useState<boolean>(false);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<'syncing' | 'synced' | 'local'>('syncing');
  const [hasLoadedFromCloud, setHasLoadedFromCloud] = useState<boolean>(false);

  // Persist viewMode
  useEffect(() => {
    try {
      localStorage.setItem('arabic_adventure_view_mode', viewMode);
    } catch {
      // Ignore
    }
  }, [viewMode]);

  // Persist teacher unlocked
  useEffect(() => {
    try {
      localStorage.setItem('arabic_adventure_teacher_unlocked', isTeacherUnlocked ? 'true' : 'false');
    } catch {
      // Ignore
    }
  }, [isTeacherUnlocked]);

  const [tracks, setTracks] = useState<GameTrack[]>(() => {
    try {
      const saved = localStorage.getItem('arabic_adventure_tracks');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const migrated = migrateTrackMapImages(parsed);
          if (migrated.length > 0) {
            return migrated;
          }
        }
      }
    } catch {
      // Ignore
    }
    return INITIAL_GAME_TRACKS;
  });

  const tracksRef = useRef<GameTrack[]>(tracks);
  useEffect(() => {
    tracksRef.current = tracks;
  }, [tracks]);

  const pendingSavesRef = useRef<number>(0);

  const [activeTrackId, setActiveTrackId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const trackParam = params.get('track');
      if (trackParam) {
        return trackParam;
      }
      try {
        const savedTrackId = localStorage.getItem('arabic_adventure_active_track_id');
        if (savedTrackId) {
          return savedTrackId;
        }
      } catch {
        // Ignore
      }
    }
    return INITIAL_GAME_TRACKS[0].id;
  });

  useEffect(() => {
    try {
      if (activeTrackId) {
        localStorage.setItem('arabic_adventure_active_track_id', activeTrackId);
      }
    } catch {
      // Ignore
    }
  }, [activeTrackId]);

  // Subscribe to real-time updates from Firebase Firestore
  useEffect(() => {
    setCloudSyncStatus('syncing');
    const unsubscribe = subscribeToGameTracks(
      (firestoreTracks) => {
        setHasLoadedFromCloud(true);
        setCloudSyncStatus('synced');

        // Never let an intermediate snapshot clobber an in-flight teacher save
        if (pendingSavesRef.current > 0) {
          return;
        }

        if (firestoreTracks && firestoreTracks.length > 0) {
          const upgraded = migrateTrackMapImages(firestoreTracks);
          if (upgraded.length > 0) {
            setTracks((prev) => {
              if (JSON.stringify(prev) === JSON.stringify(upgraded)) {
                return prev;
              }
              return upgraded;
            });

            // Update localStorage cache
            try {
              localStorage.setItem('arabic_adventure_tracks', JSON.stringify(upgraded));
            } catch {
              // Ignore
            }
          }
        }
      },
      (error) => {
        console.warn('Firestore tracks subscription error or offline:', error);
        setCloudSyncStatus('local');
      }
    );

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Update tracks handler that writes ONLY changed tracks, verifies server confirmation, and rolls back on error
  const handleUpdateTracks = async (
    updatedTracks: GameTrack[],
    forceAll = false,
    options?: { allowBeforeInitialLoad?: boolean }
  ): Promise<{ ok: boolean; error?: string; tracks?: GameTrack[] }> => {
    if (!hasLoadedFromCloud && !options?.allowBeforeInitialLoad) {
      console.warn('Blocked track overwrite before initial cloud sync completed.');
      return {
        ok: false,
        error: 'ממתין לסנכרון ראשוני משרת הענן לפני שמירה.',
      };
    }

    const previousTracks = tracksRef.current;
    setTracks(updatedTracks);
    tracksRef.current = updatedTracks;

    setCloudSyncStatus('syncing');
    pendingSavesRef.current += 1;
    try {
      const confirmedTracks = await saveChangedTracksToFirestore(previousTracks, updatedTracks, forceAll);
      setTracks(confirmedTracks);
      tracksRef.current = confirmedTracks;
      setHasLoadedFromCloud(true);
      try {
        localStorage.setItem('arabic_adventure_tracks', JSON.stringify(confirmedTracks));
      } catch {
        // Ignore
      }
      setCloudSyncStatus('synced');
      return { ok: true, tracks: confirmedTracks };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error('Failed to sync tracks to Firestore:', err);
      // Roll back optimistic state so local cache never diverges from server truth
      setTracks(previousTracks);
      tracksRef.current = previousTracks;
      try {
        localStorage.setItem('arabic_adventure_tracks', JSON.stringify(previousTracks));
      } catch {
        // Ignore
      }
      setCloudSyncStatus('local');
      return { ok: false, error: errorMsg };
    } finally {
      pendingSavesRef.current = Math.max(0, pendingSavesRef.current - 1);
    }
  };

  const activeTrack = tracks.find((t) => t.id === activeTrackId) || tracks[0] || INITIAL_GAME_TRACKS[0];

  const handleOpenTeacherStudio = () => {
    if (isTeacherUnlocked) {
      setViewMode('teacher');
    } else {
      setShowTeacherAuthModal(true);
    }
  };

  const handleTeacherAuthSuccess = () => {
    setIsTeacherUnlocked(true);
    setShowTeacherAuthModal(false);
    setViewMode('teacher');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-purple-600 selection:text-white">
      {/* Top Application Navigation Bar */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-2 sm:px-6 py-2 w-full max-w-full overflow-hidden">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          {/* Zone 1: Single Wordmark with 2 footprints icon - Expanded so full title is clearly visible */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-purple-600/25 border border-purple-500/40 flex items-center justify-center text-purple-300 shadow-inner shrink-0">
              <Footprints className="w-4 h-4 sm:w-5 sm:h-5 text-purple-300 animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm sm:text-base font-black text-white tracking-tight whitespace-nowrap">
                אסתכשאף | הדרך אל הפועל
              </span>
              <span className="text-[9px] sm:text-[10px] text-purple-300 font-arabic hidden sm:inline whitespace-nowrap">
                اِسْتِكْشَاف | رِحْلَتُكَ נَحْوَ الفِعْلِ
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium shrink-0">
            <button
              onClick={() => setViewMode('game')}
              className={`px-2 sm:px-3 py-1.5 rounded-xl transition-colors whitespace-nowrap flex items-center gap-1 sm:gap-1.5 cursor-pointer ${
                viewMode === 'game'
                  ? 'bg-purple-600/30 text-purple-200 border border-purple-500/50 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Gamepad2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>תלמיד</span>
            </button>

            <button
              onClick={handleOpenTeacherStudio}
              className={`px-2 sm:px-3 py-1.5 rounded-xl transition-colors whitespace-nowrap flex items-center gap-1 sm:gap-1.5 cursor-pointer ${
                viewMode === 'teacher'
                  ? 'bg-purple-600/30 text-purple-200 border border-purple-500/50 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>מורה</span>
              {!isTeacherUnlocked && <Lock className="w-3 h-3 text-slate-500 ml-0.5" />}
            </button>

            {/* Show GDevelop button ONLY in teacher interface mode */}
            {(viewMode === 'teacher' || viewMode === 'gdevelop_spec') && (
              <button
                onClick={() => setViewMode('gdevelop_spec')}
                className={`px-2 sm:px-3 py-1.5 rounded-xl transition-colors whitespace-nowrap flex items-center gap-1 sm:gap-1.5 cursor-pointer ${
                  viewMode === 'gdevelop_spec'
                    ? 'bg-indigo-600/30 text-indigo-200 border border-indigo-500/50 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Cpu className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">מפרט GDevelop 5</span>
                <span className="sm:hidden">GDevelop</span>
              </button>
            )}
          </nav>

          {/* Zone 3: Cloud status and Quick Action */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Cloud Sync Status Indicator */}
            <div
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10px] font-medium border ${
                cloudSyncStatus === 'synced'
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30'
                  : cloudSyncStatus === 'syncing'
                  ? 'bg-amber-950/60 text-amber-300 border-amber-500/30 animate-pulse'
                  : 'bg-slate-800 text-slate-300 border-slate-700'
              }`}
              title={
                cloudSyncStatus === 'synced'
                  ? 'הנתונים מסונכרנים בזמן אמת עם ענן Firebase'
                  : cloudSyncStatus === 'syncing'
                  ? 'מסנכרן שינויים לענן...'
                  : 'שמירה מקומית פעילה'
              }
            >
              {cloudSyncStatus === 'synced' && <Cloud className="w-3 h-3 text-emerald-400" />}
              {cloudSyncStatus === 'syncing' && <RefreshCw className="w-3 h-3 text-amber-400 animate-spin" />}
              {cloudSyncStatus === 'local' && <Cloud className="w-3 h-3 text-slate-400" />}
              <span className="hidden sm:inline">
                {cloudSyncStatus === 'synced' ? 'ענן מחובר' : cloudSyncStatus === 'syncing' ? 'מסנכרן...' : 'ענן'}
              </span>
            </div>

            {viewMode !== 'game' ? (
              <button
                onClick={() => setViewMode('game')}
                className="hidden lg:flex px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-xl shadow-md shadow-purple-600/30 transition-all whitespace-nowrap shrink-0 cursor-pointer items-center gap-1.5"
              >
                <Gamepad2 className="w-3.5 h-3.5" />
                <span>שחק עכשיו</span>
              </button>
            ) : (
              <div className="hidden lg:block text-[11px] text-slate-300 bg-slate-800/80 border border-slate-700 px-2.5 py-1 rounded-xl">
                משחק: <span className="text-purple-300 font-bold">{activeTrack.title.split(':')[0]}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Mode View */}
      <ErrorBoundary fallbackTitle="חלה שגיאה בלתי צפויה בתצוגה">
        <div className="flex-1 flex flex-col">
          {viewMode === 'game' && (
            <StudentGameView
              activeTrack={activeTrack}
              tracks={tracks}
              onSelectTrack={(id) => setActiveTrackId(id)}
              onOpenTeacherStudio={handleOpenTeacherStudio}
              onOpenGDevelopSpec={() => setViewMode('gdevelop_spec')}
            />
          )}

          {viewMode === 'teacher' && (
            <TeacherStudioView
              tracks={tracks}
              activeTrackId={activeTrackId}
              hasLoadedFromCloud={hasLoadedFromCloud}
              cloudSyncStatus={cloudSyncStatus}
              onSelectTrack={(id) => {
                setActiveTrackId(id);
              }}
              onUpdateTracks={handleUpdateTracks}
              onReturnToGame={() => setViewMode('game')}
              onLockStudio={() => {
                setIsTeacherUnlocked(false);
                setViewMode('game');
              }}
              onOpenGDevelopSpec={() => setViewMode('gdevelop_spec')}
            />
          )}

          {viewMode === 'gdevelop_spec' && (
            <GDevelopSpecHub onReturnToGame={() => setViewMode('game')} />
          )}
        </div>
      </ErrorBoundary>

      {/* Teacher Password Auth Modal (Password: Z0404) */}
      {showTeacherAuthModal && (
        <TeacherAuthModal
          onSuccess={handleTeacherAuthSuccess}
          onClose={() => setShowTeacherAuthModal(false)}
        />
      )}
    </div>
  );
}
