import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db, auth } from './config';
import { GameTrack, StudentProgressRecord } from '../types/game';
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

/**
 * Save or update a single game track to Firestore
 */
export async function saveGameTrackToFirestore(track: GameTrack): Promise<void> {
  const safeId = sanitizeFirestoreId(track.id, 'track');
  const path = `${TRACKS_COLLECTION}/${safeId}`;
  try {
    const trackDocRef = doc(db, TRACKS_COLLECTION, safeId);
    const cleanedTrack = stripUndefined({
      ...track,
      id: safeId,
      title: String(track.title || 'משחק דקדוק').slice(0, 300),
      difficulty: String(track.difficulty || 'basic').slice(0, 60),
      stages: Array.isArray(track.stages) ? track.stages.slice(0, 50) : [],
      packages: Array.isArray(track.packages) ? track.packages : [],
      questions: Array.isArray(track.questions) ? track.questions : [],
    });
    const payload = {
      ...cleanedTrack,
      isPublished: true,
      updatedAt: new Date().toISOString(),
    };
    await setDoc(trackDocRef, payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

/**
 * Save multiple game tracks to Firestore (batch save)
 */
export async function saveAllGameTracksToFirestore(tracks: GameTrack[]): Promise<void> {
  await Promise.all(tracks.map((track) => saveGameTrackToFirestore(track)));
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
 * Automatically seeds the initial tracks if the collection is empty.
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
          console.log('Firestore tracks collection empty. Seeding initial tracks...');
          // Seed the initial default tracks to Firestore so all clients have them in sync
          await saveAllGameTracksToFirestore(INITIAL_GAME_TRACKS);
          onTracksUpdated(INITIAL_GAME_TRACKS);
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
