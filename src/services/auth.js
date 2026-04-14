import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

const mapFirebaseUser = (firebaseUser) => {
  if (!firebaseUser) return null;

  const providers = (firebaseUser.providerData || []).map((provider) => provider.providerId);
  const provider = providers.includes('google.com') ? 'google' : 'local';

  return {
    id: firebaseUser.uid,
    uid: firebaseUser.uid,
    name: firebaseUser.displayName || 'User',
    email: firebaseUser.email || '',
    photo: firebaseUser.photoURL || '',
    provider,
  };
};

const mapFirebaseError = (error) => {
  const code = error?.code || '';
  switch (code) {
    case 'auth/popup-closed-by-user':
      return 'Google sign-in was cancelled. Please try again.';
    case 'auth/popup-blocked':
      return 'Popup was blocked by your browser. Please allow popups and try again.';
    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with this email using a different sign-in method.';
    case 'auth/invalid-credential':
      return 'Invalid credentials. Please check and try again.';
    case 'auth/user-not-found':
      return 'No account found with this email.';
    case 'auth/wrong-password':
    case 'auth/invalid-login-credentials':
      return 'Incorrect email or password.';
    case 'auth/email-already-in-use':
      return 'This email is already in use. Try logging in instead.';
    case 'auth/weak-password':
      return 'Password is too weak. Use at least 8 characters.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection and try again.';
    default:
      return error?.message || 'Authentication failed';
  }
};

export async function loginWithGooglePopup() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return mapFirebaseUser(result.user);
  } catch (error) {
    const normalized = new Error(mapFirebaseError(error));
    normalized.code = error?.code;
    throw normalized;
  }
}

export async function loginWithEmailPassword(email, password) {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return mapFirebaseUser(result.user);
  } catch (error) {
    const normalized = new Error(mapFirebaseError(error));
    normalized.code = error?.code;
    throw normalized;
  }
}

export async function signupWithEmailPassword(name, email, password) {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    if (name?.trim()) {
      await updateProfile(result.user, { displayName: name.trim() });
    }
    return mapFirebaseUser(auth.currentUser || result.user);
  } catch (error) {
    const normalized = new Error(mapFirebaseError(error));
    normalized.code = error?.code;
    throw normalized;
  }
}

export async function getFirebaseIdToken() {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('No authenticated Firebase user');
  }
  return currentUser.getIdToken(true);
}

export async function exchangeFirebaseSession(idToken) {
  const response = await fetch('/api/auth/firebase/exchange', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  });

  const rawText = await response.text();
  let data = null;
  if (rawText) {
    try {
      data = JSON.parse(rawText);
    } catch {
      data = null;
    }
  }

  if (!response.ok || !data?.success || !data?.data?.user) {
    const fallbackMessage = response.status >= 500
      ? 'Unable to complete sign in right now. Please try again.'
      : 'Sign in failed. Please try again.';
    const error = new Error(data?.error || fallbackMessage);
    error.status = response.status;
    throw error;
  }
  return data.data.user;
}

export const logoutFirebase = async () => {
  await signOut(auth);
};

export const getStoredAuthUser = () => {
  return mapFirebaseUser(auth.currentUser);
};

export const onGoogleAuthStateChange = (callback) => onAuthStateChanged(auth, (firebaseUser) => {
  callback(mapFirebaseUser(firebaseUser));
});
