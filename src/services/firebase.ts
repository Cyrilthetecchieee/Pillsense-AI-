import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyD21gjTJpp7DlKH6nU4hLMGleH1I1YdCcs",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "pillsense-ai.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "pillsense-ai",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "pillsense-ai.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "781117897533",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:781117897533:web:a82e69a3d4df8b6f156354",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-NT7FK5Q9BB"
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

// Initialize Firebase Analytics if supported in the current environment
export let analytics: any = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

// Connect to local emulators only when explicitly enabled
const useEmulators = import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true';

if (useEmulators && typeof window !== 'undefined') {
  try {
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
    connectFirestoreEmulator(db, '127.0.0.1', 8080);
    connectStorageEmulator(storage, '127.0.0.1', 9199);
    connectFunctionsEmulator(functions, '127.0.0.1', 5001);
  } catch {
    // Emulator connection errors
  }
}

export default app;
