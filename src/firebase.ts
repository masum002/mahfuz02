/// <reference types="vite/client" />
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../firebase-applet-config.json';

const isConfigured = !!firebaseConfig.apiKey && firebaseConfig.apiKey !== "dummy-api-key-for-build";

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId); /* CRITICAL: The app will break without this line */
export const auth = getAuth(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
export { isConfigured };

// Pre-configured Google Auth provider parameters for polished UX
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Simple connection test as required by Firestore integration guidelines
export async function testConnection() {
  try {
    if (!isConfigured) {
      console.log("Firebase is not fully configured yet. Running in secure offline/fallback mode.");
      return;
    }
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firebase connection established successfully.");
  } catch (error: any) {
    const isOfflineMsg = error instanceof Error && (
      error.message.toLowerCase().includes('offline') || 
      error.message.toLowerCase().includes('unavailable')
    );
    if (isOfflineMsg) {
      console.log("ℹ️ [Firebase Connection Status]: the client is offline or database is not yet initialized.");
      console.log("👉 Troubleshooting steps for custom Firebase project 'mahfuz002-b0b26':");
      console.log("1. Go to Firebase Console: https://console.firebase.google.com/project/mahfuz002-b0b26/firestore");
      console.log("2. Click on 'Create Database' and select your preferred location/region (e.g. Standard/Enterprise mode).");
      console.log("3. Select 'Test Mode' or 'Production Mode' (rules can be deployed from this project using deploy_firebase).");
      console.log("Once created, standard data mutations will automatically start syncing with your remote database.");
    } else {
      console.log("First connection test complete (authenticated status checks evaluated).");
    }
  }
}

// Error handling according to Firebase integration guidelines
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

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
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
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Inspect status
testConnection().catch(() => {});
