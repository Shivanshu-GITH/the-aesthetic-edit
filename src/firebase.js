import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { GoogleAuthProvider, browserLocalPersistence, getAuth, setPersistence } from 'firebase/auth';

const envConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const requiredFirebaseEnvKeys = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
const missingRequiredEnvKeys = requiredFirebaseEnvKeys.filter((key) => !envConfig[key]);

if (missingRequiredEnvKeys.length > 0) {
  throw new Error(`Missing Firebase env values: ${missingRequiredEnvKeys.join(', ')}`);
}

const firebaseConfig = envConfig;

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

void setPersistence(auth, browserLocalPersistence).catch(() => {
  // Persistence fallback is handled by Firebase defaults.
});

void isSupported().then((supported) => {
  if (supported) {
    getAnalytics(app);
  }
});
