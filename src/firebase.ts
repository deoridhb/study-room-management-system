import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  collection,
  onSnapshot,
  setDoc,
  deleteDoc,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import {
  Student,
  Seat,
  AttendanceSession,
  PaymentRecord,
  ExpenseRecord,
  ReminderLog,
  ActivityLog,
  SystemSettings,
} from './types';

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// Initialize Firestore with custom database ID from config
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId); /* CRITICAL: The app will break without this line */

// Initialize Authentication
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Standard Error Handler per Firebase Skill instructions
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

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test Connection on application boot per Firebase Skill requirement
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.info('Firestore connection validated successfully.');
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore is currently offline or connecting in background.');
    }
    return false;
  }
}

// Authentication Helpers
export async function loginWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Google sign-in error:', error);
    throw error;
  }
}

export async function logoutUser() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Sign-out error:', error);
    throw error;
  }
}

export function subscribeToAuth(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

// Firestore Collection Helpers with Real-time Snapshots
export function subscribeToStudents(
  onData: (students: Student[]) => void,
  onError?: (err: unknown) => void
) {
  const path = 'students';
  return onSnapshot(
    collection(db, path),
    snapshot => {
      const list: Student[] = [];
      snapshot.forEach(docSnap => {
        list.push(docSnap.data() as Student);
      });
      onData(list);
    },
    error => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export function subscribeToSeats(
  onData: (seats: Seat[]) => void,
  onError?: (err: unknown) => void
) {
  const path = 'seats';
  return onSnapshot(
    collection(db, path),
    snapshot => {
      const list: Seat[] = [];
      snapshot.forEach(docSnap => {
        list.push(docSnap.data() as Seat);
      });
      onData(list);
    },
    error => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export function subscribeToSessions(
  onData: (sessions: AttendanceSession[]) => void,
  onError?: (err: unknown) => void
) {
  const path = 'sessions';
  return onSnapshot(
    collection(db, path),
    snapshot => {
      const list: AttendanceSession[] = [];
      snapshot.forEach(docSnap => {
        list.push(docSnap.data() as AttendanceSession);
      });
      onData(list);
    },
    error => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export function subscribeToPayments(
  onData: (payments: PaymentRecord[]) => void,
  onError?: (err: unknown) => void
) {
  const path = 'payments';
  return onSnapshot(
    collection(db, path),
    snapshot => {
      const list: PaymentRecord[] = [];
      snapshot.forEach(docSnap => {
        list.push(docSnap.data() as PaymentRecord);
      });
      onData(list);
    },
    error => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export function subscribeToExpenses(
  onData: (expenses: ExpenseRecord[]) => void,
  onError?: (err: unknown) => void
) {
  const path = 'expenses';
  return onSnapshot(
    collection(db, path),
    snapshot => {
      const list: ExpenseRecord[] = [];
      snapshot.forEach(docSnap => {
        list.push(docSnap.data() as ExpenseRecord);
      });
      onData(list);
    },
    error => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export function subscribeToReminders(
  onData: (reminders: ReminderLog[]) => void,
  onError?: (err: unknown) => void
) {
  const path = 'reminders';
  return onSnapshot(
    collection(db, path),
    snapshot => {
      const list: ReminderLog[] = [];
      snapshot.forEach(docSnap => {
        list.push(docSnap.data() as ReminderLog);
      });
      onData(list);
    },
    error => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export function subscribeToActivityLogs(
  onData: (logs: ActivityLog[]) => void,
  onError?: (err: unknown) => void
) {
  const path = 'activityLogs';
  return onSnapshot(
    collection(db, path),
    snapshot => {
      const list: ActivityLog[] = [];
      snapshot.forEach(docSnap => {
        list.push(docSnap.data() as ActivityLog);
      });
      onData(list);
    },
    error => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export function subscribeToSettings(
  onData: (settings: SystemSettings) => void,
  onError?: (err: unknown) => void
) {
  const path = 'settings';
  return onSnapshot(
    collection(db, path),
    snapshot => {
      if (!snapshot.empty) {
        const firstDoc = snapshot.docs[0].data() as SystemSettings;
        onData(firstDoc);
      }
    },
    error => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

// Single Document Writers
export async function saveStudentDoc(student: Student) {
  const path = `students/${student.id}`;
  try {
    await setDoc(doc(db, 'students', student.id), student);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteStudentDoc(studentId: string) {
  const path = `students/${studentId}`;
  try {
    await deleteDoc(doc(db, 'students', studentId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveSeatDoc(seat: Seat) {
  const path = `seats/${seat.id}`;
  try {
    await setDoc(doc(db, 'seats', seat.id), seat);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function saveSessionDoc(session: AttendanceSession) {
  const path = `sessions/${session.id}`;
  try {
    await setDoc(doc(db, 'sessions', session.id), session);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function savePaymentDoc(payment: PaymentRecord) {
  const path = `payments/${payment.id}`;
  try {
    await setDoc(doc(db, 'payments', payment.id), payment);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function saveExpenseDoc(expense: ExpenseRecord) {
  const path = `expenses/${expense.id}`;
  try {
    await setDoc(doc(db, 'expenses', expense.id), expense);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function saveReminderDoc(reminder: ReminderLog) {
  const path = `reminders/${reminder.id}`;
  try {
    await setDoc(doc(db, 'reminders', reminder.id), reminder);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function saveActivityLogDoc(log: ActivityLog) {
  const path = `activityLogs/${log.id}`;
  try {
    await setDoc(doc(db, 'activityLogs', log.id), log);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function saveSettingsDoc(settings: SystemSettings) {
  const path = 'settings/default';
  try {
    await setDoc(doc(db, 'settings', 'default'), settings);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Bulk Sync / Seed function for initializing Firestore with initial data
export async function seedFirestoreIfEmpty(
  initialStudents: Student[],
  initialSeats: Seat[],
  initialSessions: AttendanceSession[],
  initialPayments: PaymentRecord[],
  initialExpenses: ExpenseRecord[],
  initialSettings: SystemSettings
) {
  try {
    const studentCheck = await getDocs(collection(db, 'students'));
    if (studentCheck.empty) {
      console.info('Firestore is empty. Seeding initial study room collection data...');
      const batch = writeBatch(db);

      initialStudents.forEach(s => {
        batch.set(doc(db, 'students', s.id), s);
      });
      initialSeats.forEach(s => {
        batch.set(doc(db, 'seats', s.id), s);
      });
      initialSessions.forEach(s => {
        batch.set(doc(db, 'sessions', s.id), s);
      });
      initialPayments.forEach(p => {
        batch.set(doc(db, 'payments', p.id), p);
      });
      initialExpenses.forEach(e => {
        batch.set(doc(db, 'expenses', e.id), e);
      });
      batch.set(doc(db, 'settings', 'default'), initialSettings);

      await batch.commit();
      console.info('Firestore initial seed completed successfully.');
    }
  } catch (err) {
    console.warn('Seed check or execution note (may be awaiting auth):', err);
  }
}
