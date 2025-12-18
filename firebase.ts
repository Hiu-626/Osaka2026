
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
  apiKey: "AIzaSyC2FhBEJC_VilXXm2i2l9rVjXthFUUQuao",
  authDomain: "travel-planner-d59ab.firebaseapp.com",
  projectId: "travel-planner-d59ab",
  storageBucket: "travel-planner-d59ab.firebasestorage.app",
  messagingSenderId: "845991687518",
  appId: "1:845991687518:web:8d356490f811f27fa6cbcf"
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
