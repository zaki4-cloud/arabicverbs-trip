import { DifficultyLevel, GameTrack, Question } from '../types/game';
import { INITIAL_GAME_TRACKS } from '../data/initialPackages';
import { migrateTrackMapImages } from './trackMigration';
import { compressDataUrl, getUtf8ByteLength } from './imageUpload';

export interface ParsedJsonImportResult {
  tracks: GameTrack[];
  importedTracksCount: number;
  importedQuestionsCount: number;
  importedPackagesCount: number;
  preferredActiveTrackId: string;
  perTrackSummary: {
    id: string;
    title: string;
    questionsCount: number;
    packagesCount: number;
  }[];
}

function sanitizeTrackId(rawId: unknown, fallbackIndex: number): string {
  const cleaned = String(rawId || '')
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 128);
  return cleaned.length > 0 ? cleaned : `track-imported-${Date.now()}-${fallbackIndex + 1}`;
}

function normalizeDifficulty(raw: unknown): DifficultyLevel {
  const val = String(raw || '').toLowerCase();
  if (val === 'basic' || val === 'intermediate' || val === 'advanced') {
    return val;
  }
  return 'basic';
}

function normalizeQuestion(raw: unknown, idx: number, fallbackPackageId: string): Question | null {
  if (!raw || typeof raw !== 'object') return null;
  const q = raw as Record<string, unknown>;
  const id = String(q.id || `q-imp-${Date.now()}-${idx}`).trim();
  const topic = String(q.topic || 'דקדוק ערבי').trim() || 'דקדוק ערבי';
  const prompt = String(q.prompt || '').trim();
  const explanation = String(q.explanation || '').trim();
  const packageId = String(q.packageId || fallbackPackageId).trim();

  if (q.type === 'matching_pairs' || Array.isArray(q.pairs)) {
    const rawPairs = Array.isArray(q.pairs) ? q.pairs : [];
    const pairs = rawPairs
      .filter((p): p is Record<string, unknown> => Boolean(p && typeof p === 'object'))
      .map((p, pIdx) => ({
        id: String(p.id || `pair-${idx}-${pIdx}`),
        arabic: String(p.arabic || ''),
        target: String(p.target || ''),
      }))
      .filter((p) => p.arabic.trim() && p.target.trim());

    return {
      id,
      packageId,
      topic,
      type: 'matching_pairs',
      prompt: prompt || 'התאם את הזוגות הבאים',
      pairs,
      explanation,
    };
  }

  const distractors = Array.isArray(q.distractors)
    ? q.distractors.map((d) => String(d ?? '').trim()).filter(Boolean)
    : [];

  return {
    id,
    packageId,
    topic,
    type: 'multiple_choice',
    prompt: prompt || 'בחר את התשובה הנכונה',
    arabicSample: typeof q.arabicSample === 'string' && q.arabicSample.trim() ? q.arabicSample.trim() : undefined,
    correctAnswer: String(q.correctAnswer || '').trim(),
    distractors,
    explanation,
  };
}

function normalizeSingleTrack(raw: unknown, idx: number, currentActiveTrack?: GameTrack): GameTrack {
  const fallbackTemplate = currentActiveTrack || INITIAL_GAME_TRACKS[0];
  const obj = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const packages = Array.isArray(obj.packages) ? obj.packages : [];
  const firstPkgId =
    packages.length > 0 && packages[0] && typeof packages[0] === 'object' && 'id' in packages[0]
      ? String((packages[0] as { id?: unknown }).id || 'pkg-t1-p1')
      : fallbackTemplate.packages[0]?.id || 'pkg-t1-p1';

  const rawQuestions = Array.isArray(obj.questions) ? obj.questions : [];
  const normalizedQuestions = rawQuestions
    .map((q, qIdx) => normalizeQuestion(q, qIdx, firstPkgId))
    .filter((q): q is Question => q !== null);

  const rawTitle = String(obj.title || '').trim();
  const title = (rawTitle || fallbackTemplate.title || 'משחק דקדוק ערבי').slice(0, 300);

  return {
    ...(obj as Partial<GameTrack>),
    id: sanitizeTrackId(obj.id || fallbackTemplate.id, idx),
    title,
    difficulty: normalizeDifficulty(obj.difficulty || fallbackTemplate.difficulty),
    description: String(obj.description ?? fallbackTemplate.description ?? ''),
    shareCode: typeof obj.shareCode === 'string' && obj.shareCode.trim() ? obj.shareCode.trim() : fallbackTemplate.shareCode,
    packages: packages as GameTrack['packages'],
    questions: normalizedQuestions,
    stages: Array.isArray(obj.stages) && obj.stages.length > 0 ? (obj.stages as GameTrack['stages']) : fallbackTemplate.stages,
    achievements: Array.isArray(obj.achievements) ? (obj.achievements as string[]) : undefined,
    isPublished: true,
  } as GameTrack & { isPublished?: boolean };
}

function looksLikeTrack(obj: unknown): obj is Record<string, unknown> {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return false;
  const rec = obj as Record<string, unknown>;
  return Array.isArray(rec.questions) || Array.isArray(rec.packages) || (typeof rec.id === 'string' && Array.isArray(rec.stages));
}

export async function optimizeTracksForFirestoreSize(tracks: GameTrack[]): Promise<GameTrack[]> {
  const FIRESTORE_SAFE_LIMIT = 920_000;
  const result: GameTrack[] = [];

  for (const track of tracks) {
    let workingTrack = track;
    const rawSize = getUtf8ByteLength(JSON.stringify(workingTrack));
    if (rawSize > FIRESTORE_SAFE_LIMIT && Array.isArray(workingTrack.packages)) {
      const compressedPackages = await Promise.all(
        workingTrack.packages.map(async (pkg) => {
          if (pkg.imageUrl && pkg.imageUrl.startsWith('data:image/')) {
            const smaller = await compressDataUrl(pkg.imageUrl, 760, 760, 0.68);
            return { ...pkg, imageUrl: smaller };
          }
          return pkg;
        })
      );
      workingTrack = { ...workingTrack, packages: compressedPackages };

      // Second pass if still too big
      if (getUtf8ByteLength(JSON.stringify(workingTrack)) > FIRESTORE_SAFE_LIMIT) {
        const ultraCompressedPackages = await Promise.all(
          workingTrack.packages.map(async (pkg) => {
            if (pkg.imageUrl && pkg.imageUrl.startsWith('data:image/')) {
              const tiny = await compressDataUrl(pkg.imageUrl, 520, 520, 0.55);
              return { ...pkg, imageUrl: tiny };
            }
            return pkg;
          })
        );
        workingTrack = { ...workingTrack, packages: ultraCompressedPackages };
      }
    }

    const finalSize = getUtf8ByteLength(JSON.stringify(workingTrack));
    if (finalSize > 1_020_000) {
      const kb = Math.round(finalSize / 1024);
      throw new Error(
        `המסלול "${workingTrack.title}" גדול מדי לשמירה בענן (${kb}KB מתוך מגבלת 1024KB). יש להסיר או להקטין תמונות מוטמעות בחבילות הידע.`
      );
    }

    result.push(workingTrack);
  }

  return result;
}

export function parseImportedGameTracksJson(
  rawText: string,
  existingTracks: GameTrack[],
  currentActiveTrackId: string
): ParsedJsonImportResult {
  const cleanText = rawText.replace(/^\uFEFF/, '').trim();
  if (!cleanText) {
    throw new Error('הקובץ שנבחר ריק.');
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleanText);
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    throw new Error(`קובץ ה-JSON אינו תקין תחבירית (${detail}).`);
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('מבנה קובץ ה-JSON אינו תקין — מצופה אובייקט או מערך משחקים.');
  }

  const rec = parsed as Record<string, unknown>;

  if ('gdevelopVersion' in rec || 'globalVariables' in rec) {
    throw new Error('זהו קובץ מפרט GDevelop 5 ולא קובץ מאגר משחקים ושאלות.');
  }

  let rawTracks: unknown[] | null = null;
  let isSingleTrackImport = false;
  let fileActiveTrackId: string | undefined =
    typeof rec.activeTrackId === 'string' && rec.activeTrackId.trim() ? rec.activeTrackId.trim() : undefined;

  if (Array.isArray(parsed)) {
    rawTracks = parsed;
  } else if (Array.isArray(rec.tracks)) {
    rawTracks = rec.tracks;
  } else if (Array.isArray(rec.gameTracks)) {
    rawTracks = rec.gameTracks;
  } else if (rec.data && typeof rec.data === 'object' && Array.isArray((rec.data as Record<string, unknown>).tracks)) {
    rawTracks = (rec.data as Record<string, unknown>).tracks as unknown[];
  } else if (rec.track && looksLikeTrack(rec.track)) {
    rawTracks = [rec.track];
    isSingleTrackImport = true;
  } else if (looksLikeTrack(parsed)) {
    rawTracks = [parsed];
    isSingleTrackImport = true;
  }

  if (!rawTracks || rawTracks.length === 0) {
    throw new Error('לא נמצאו משחקים או שאלות בתוך קובץ ה-JSON שנבחר.');
  }

  const currentActiveTrack = existingTracks.find((t) => t.id === currentActiveTrackId) || existingTracks[0];
  const normalizedImported = rawTracks
    .filter((item) => item && typeof item === 'object')
    .map((item, idx) => normalizeSingleTrack(item, idx, isSingleTrackImport ? currentActiveTrack : undefined));

  if (normalizedImported.length === 0) {
    throw new Error('הקובץ אינו מכיל רשומות משחק תקינות.');
  }

  const migratedImported = migrateTrackMapImages(normalizedImported);

  // Merge imported tracks into existingTracks if this was a single-track file OR preserve all non-colliding existing tracks
  // while replacing every imported track ID cleanly so nothing gets orphaned
  const importedIds = new Set(migratedImported.map((t) => t.id));
  const mergedTracksRaw: GameTrack[] = isSingleTrackImport
    ? [
        ...existingTracks.filter((t) => !importedIds.has(t.id)),
        ...migratedImported,
      ]
    : [
        ...migratedImported,
        ...existingTracks.filter((t) => !importedIds.has(t.id)),
      ];

  const finalTracks = migrateTrackMapImages(mergedTracksRaw);

  // Pick the best active track so the user immediately sees the newly loaded questions
  const existingMap = new Map(existingTracks.map((t) => [t.id, t]));
  const trackWithMostQuestions = [...migratedImported].sort(
    (a, b) => (b.questions?.length || 0) - (a.questions?.length || 0)
  )[0];
  const trackWithLargestGain = [...migratedImported].sort((a, b) => {
    const gainA = (a.questions?.length || 0) - (existingMap.get(a.id)?.questions?.length || 0);
    const gainB = (b.questions?.length || 0) - (existingMap.get(b.id)?.questions?.length || 0);
    if (gainB !== gainA) return gainB - gainA;
    return (b.questions?.length || 0) - (a.questions?.length || 0);
  })[0];

  const gainOfBest =
    (trackWithLargestGain.questions?.length || 0) -
    (existingMap.get(trackWithLargestGain.id)?.questions?.length || 0);

  let preferredActiveTrackId = trackWithMostQuestions.id;
  if (gainOfBest > 0) {
    preferredActiveTrackId = trackWithLargestGain.id;
  } else if (fileActiveTrackId && importedIds.has(fileActiveTrackId)) {
    preferredActiveTrackId = fileActiveTrackId;
  } else if (importedIds.has(currentActiveTrackId)) {
    preferredActiveTrackId = currentActiveTrackId;
  }

  const importedQuestionsCount = migratedImported.reduce((sum, t) => sum + (t.questions?.length || 0), 0);
  const importedPackagesCount = migratedImported.reduce((sum, t) => sum + (t.packages?.length || 0), 0);

  return {
    tracks: finalTracks,
    importedTracksCount: migratedImported.length,
    importedQuestionsCount,
    importedPackagesCount,
    preferredActiveTrackId,
    perTrackSummary: migratedImported.map((t) => ({
      id: t.id,
      title: t.title,
      questionsCount: t.questions?.length || 0,
      packagesCount: t.packages?.length || 0,
    })),
  };
}
