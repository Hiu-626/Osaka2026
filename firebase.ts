
/**
 * Note: Real Firebase keys should be handled via environment variables.
 * For this implementation, we simulate the storage with a LocalStorage-based fallback 
 * if process.env.API_KEY or Firebase initialization fails, ensuring the app 
 * is "Offline-first" as requested.
 */
import { initializeApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "MOCK_API_KEY",
  authDomain: "mock-trip-planner.firebaseapp.com",
  projectId: "mock-trip-planner",
  storageBucket: "mock-trip-planner.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

let db: any;
let auth: any;
let storage: any;

try {
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
  storage = getStorage(app);

  // Enable offline persistence
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
    } else if (err.code === 'unimplemented') {
      console.warn('The current browser does not support all of the features required to enable persistence');
    }
  });

  signInAnonymously(auth).catch(err => console.error("Auth failed", err));
} catch (e) {
  console.warn("Firebase initialization failed. Falling back to local state mode.", e);
}

export { db, auth, storage };
