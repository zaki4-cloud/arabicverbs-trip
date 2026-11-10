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
 * Save or update a single game track to Firestore
 */
export async function saveGameTrackToFirestore(track: GameTrack): Promise<void> {
  const path = `${TRACKS_COLLECTION}/${track.id}`;
  try {
    const trackDocRef = doc(db, TRACKS_COLLECTION, track.id);
    const payload = {
      ...track,
      isPublished: true,
      updatedAt: new Date().toISOString(),
    };
    await setDoc(trackDocRef, payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Save multiple game tracks to Firestore (batch save)
 */
export async function saveAllGameTracksToFirestore(tracks: GameTrack[]): Promise<void> {
  for (const track of tracks) {
    await saveGameTrackToFirestore(track);
  }
}

/**
 * Delete a game track from Firestore
 */
export async function deleteGameTrackFromFirestore(trackId: string): Promise<void> {
  const path = `${TRACKS_COLLECTION}/${trackId}`;
  try {
    const trackDocRef = doc(db, TRACKS_COLLECTION, trackId);
    await deleteDoc(trackDocRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
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
    }
  );
}

/**
 * Save student progress to Firestore
 */
export async function saveStudentRecordToFirestore(record: StudentProgressRecord): Promise<void> {
  const path = `${STUDENT_RECORDS_COLLECTION}/${record.id}`;
  try {
    const recordDocRef = doc(db, STUDENT_RECORDS_COLLECTION, record.id);
    const payload = {
      id: record.id,
      studentName: record.studentName || 'תלמיד אנונימי',
      trackId: record.gameTrackId,
      trackTitle: record.gameTrackTitle,
      currentStageIndex: record.currentStageNumber,
      score: record.score,
      correctAnswers: record.correctAnswers,
      totalQuestionsAnswered: record.totalQuestions,
      completed: record.currentStageNumber >= record.totalStages,
      updatedAt: new Date().toISOString(),
      rawRecord: record,
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
