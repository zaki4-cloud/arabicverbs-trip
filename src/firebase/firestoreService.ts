import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocFromServer,
  getDocs,
  getDocsFromServer,
  deleteDoc,
  onSnapshot,
  query,
  limit,
} from 'firebase/firestore';
import { db, auth } from './config';
import { DifficultyLevel, GameTrack, StudentProgressRecord } from '../types/game';
import { INITIAL_GAME_TRACKS } from '../data/initialPackages';
import { migrateTrackMapImages } from '../utils/trackMigration';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): void {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.warn('Firestore Warning (non-fatal):', JSON.stringify(errInfo));
}

const TRACKS_COLLECTION = 'game_tracks';
const STUDENT_RECORDS_COLLECTION = 'student_records';

/**
 * Recursively remove undefined properties so Firestore setDoc never throws on unsupported undefined values.
 */
function stripUndefined<T>(value: T): T {
  if (Array.isArray(value)) {
    return value
      .filter((item) => item !== undefined)
      .map((item) => stripUndefined(item)) as unknown as T;
  }
  if (value !== null && typeof value === 'object') {
    const cleanObj: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      if (val !== undefined) {
        cleanObj[key] = stripUndefined(val);
      }
    }
    return cleanObj as T;
  }
  return value;
}

function sanitizeFirestoreId(rawId: string, prefix: string): string {
  const cleaned = String(rawId || '')
    .replace(/[^a-zA-Z0-9_-]/g, '-')
    .slice(0, 128);
  return cleaned.length > 0 ? cleaned : `${prefix}-${Date.now()}`;
}

function normalizeTrackForDiff(track: GameTrack): string {
  const { revision: _r, updatedAt: _u, ...rest } = track;
  return JSON.stringify(stripUndefined(rest));
}

/**
 * Save or update a single game track to Firestore with monotonic revision & server read-back verification.
 */
export async function saveGameTrackToFirestore(
  track: GameTrack,
  options: { isTeacherEdit?: boolean; verifyFromServer?: boolean } = {}
): Promise<GameTrack> {
  const { isTeacherEdit = true, verifyFromServer = true } = options;
  const safeId = sanitizeFirestoreId(track.id, 'track');
  const path = `${TRACKS_COLLECTION}/${safeId}`;
  try {
    const trackDocRef = doc(db, TRACKS_COLLECTION, safeId);

    // Check current server revision so we monotonically advance it and never fail revision guard
    let serverRevision = 0;
    try {
      const currentServerSnap = await getDocFromServer(trackDocRef);
      if (currentServerSnap.exists()) {
        const sRev = currentServerSnap.data()?.revision;
        if (typeof sRev === 'number' && Number.isFinite(sRev)) {
          serverRevision = sRev;
        }
      }
    } catch {
      // If offline or new doc, continue with local revision
    }

    const baseRevision = Math.max(Number(track.revision) || 0, serverRevision);
    const nextRevision = isTeacherEdit ? baseRevision + 1 : baseRevision;
    const updatedAt = new Date().toISOString();

    const cleanedTrack = stripUndefined({
      ...track,
      id: safeId,
      title: String(track.title || 'משחק דקדוק').slice(0, 300),
      difficulty: (['basic', 'intermediate', 'advanced'].includes(String(track.difficulty))
        ? track.difficulty
        : 'basic') as DifficultyLevel,
      stages: Array.isArray(track.stages) ? track.stages.slice(0, 50) : [],
      packages: Array.isArray(track.packages) ? track.packages : [],
      questions: Array.isArray(track.questions) ? track.questions : [],
      revision: nextRevision,
      updatedAt,
    });

    const payload = {
      ...cleanedTrack,
      isPublished: true,
    };

    await setDoc(trackDocRef, payload);

    if (verifyFromServer) {
      const verifySnap = await getDocFromServer(trackDocRef);
      const savedData = verifySnap.data();
      if (!verifySnap.exists() || savedData?.updatedAt !== updatedAt || savedData?.revision !== nextRevision) {
        throw new Error('Server verification mismatch after saving track');
      }
    }

    return cleanedTrack;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

/**
 * Save only changed tracks (or all tracks when forceAll is true) and return tracks with confirmed server revisions.
 */
export async function saveChangedTracksToFirestore(
  prevTracks: GameTrack[],
  nextTracks: GameTrack[],
  forceAll = false
): Promise<GameTrack[]> {
  const prevMap = new Map(prevTracks.map((t) => [t.id, normalizeTrackForDiff(t)]));

  const savedTracks = await Promise.all(
    nextTracks.map(async (track) => {
      const prevNorm = prevMap.get(track.id);
      const nextNorm = normalizeTrackForDiff(track);
      if (!forceAll && prevNorm === nextNorm) {
        return track;
      }
      return saveGameTrackToFirestore(track, { isTeacherEdit: true, verifyFromServer: true });
    })
  );

  return savedTracks;
}

/**
 * Save multiple game tracks to Firestore (batch save)
 */
export async function saveAllGameTracksToFirestore(tracks: GameTrack[]): Promise<GameTrack[]> {
  return Promise.all(tracks.map((track) => saveGameTrackToFirestore(track, { isTeacherEdit: true, verifyFromServer: true })));
}

/**
 * Delete a game track from Firestore
 */
export async function deleteGameTrackFromFirestore(trackId: string): Promise<void> {
  const safeId = sanitizeFirestoreId(trackId, 'track');
  const path = `${TRACKS_COLLECTION}/${safeId}`;
  try {
    const trackDocRef = doc(db, TRACKS_COLLECTION, safeId);
    await deleteDoc(trackDocRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
    throw error;
  }
}

/**
 * Listen in real-time to all game tracks from Firestore.
 * Verifies directly with server before seeding so transient empty snapshots never reset existing cloud data.
 */
export function subscribeToGameTracks(
  onTracksUpdated: (tracks: GameTrack[]) => void,
  onError?: (err: Error) => void
) {
  const colRef = collection(db, TRACKS_COLLECTION);

  return onSnapshot(
    colRef,
    async (snapshot) => {
      try {
        if (snapshot.empty) {
          // Double-check directly against the server before ever considering seeding
          const serverSnap = await getDocsFromServer(colRef);
          if (!serverSnap.empty) {
            const serverTracks: GameTrack[] = [];
            serverSnap.forEach((docSnap) => {
              serverTracks.push(docSnap.data() as GameTrack);
            });
            if (serverTracks.length > 0) {
              onTracksUpdated(migrateTrackMapImages(serverTracks));
            }
            return;
          }

          console.log('Firestore tracks collection truly empty on server. Seeding initial tracks (revision 0)...');
          const seeded = await Promise.all(
            INITIAL_GAME_TRACKS.map((t) =>
              saveGameTrackToFirestore({ ...t, revision: 0 }, { isTeacherEdit: false, verifyFromServer: false })
            )
          );
          onTracksUpdated(seeded);
          return;
        }

        const loadedTracks: GameTrack[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as GameTrack;
          loadedTracks.push(data);
        });

        if (loadedTracks.length > 0) {
          const upgraded = migrateTrackMapImages(loadedTracks);
          onTracksUpdated(upgraded);
        }
      } catch (err) {
        if (onError) onError(err as Error);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, TRACKS_COLLECTION);
      if (onError) onError(error);
    }
  );
}

/**
 * Save student progress to Firestore
 */
export async function saveStudentRecordToFirestore(record: StudentProgressRecord): Promise<void> {
  const safeId = sanitizeFirestoreId(record.id, 'prog');
  const path = `${STUDENT_RECORDS_COLLECTION}/${safeId}`;
  try {
    const recordDocRef = doc(db, STUDENT_RECORDS_COLLECTION, safeId);
    const cleanedRecord = stripUndefined({
      ...record,
      id: safeId,
    });
    const payload = {
      id: safeId,
      studentName: String(record.studentName || 'תלמיד אנונימי').slice(0, 150),
      trackId: sanitizeFirestoreId(record.gameTrackId || 'track-basic-binyan1', 'track'),
      trackTitle: String(record.gameTrackTitle || '').slice(0, 300),
      currentStageIndex: Math.max(0, Number(record.currentStageNumber) || 1),
      score: Math.max(0, Number(record.score) || 0),
      correctAnswers: Math.max(0, Number(record.correctAnswers) || 0),
      totalQuestionsAnswered: Math.max(0, Number(record.totalQuestions) || 0),
      completed: (Number(record.currentStageNumber) || 1) >= (Number(record.totalStages) || 1),
      updatedAt: new Date().toISOString(),
      rawRecord: cleanedRecord,
    };
    await setDoc(recordDocRef, payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

/**
 * Subscribe to student records from Firestore (ordered by recent)
 */
export function subscribeToStudentRecords(
  onRecordsUpdated: (records: StudentProgressRecord[]) => void
) {
  const colRef = collection(db, STUDENT_RECORDS_COLLECTION);
  const q = query(colRef, limit(60));

  return onSnapshot(
    q,
    (snapshot) => {
      const records: StudentProgressRecord[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.rawRecord) {
          records.push(data.rawRecord as StudentProgressRecord);
        } else {
          // Map back if rawRecord missing
          records.push({
            id: docSnap.id,
            studentName: data.studentName || 'תלמיד',
            gameTrackId: data.trackId || '',
            gameTrackTitle: data.trackTitle || '',
            currentStageNumber: data.currentStageIndex || 1,
            totalStages: 4,
            score: data.score || 0,
            gemsCount: 0,
            correctAnswers: data.correctAnswers || 0,
            totalQuestions: data.totalQuestionsAnswered || 0,
            completedAt: Date.now(),
          });
        }
      });
      // Sort by latest completedAt
      records.sort((a, b) => b.completedAt - a.completedAt);
      onRecordsUpdated(records);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, STUDENT_RECORDS_COLLECTION);
    }
  );
}
