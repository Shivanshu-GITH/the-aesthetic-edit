import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import {
  exchangeFirebaseSession,
  getFirebaseIdToken,
  getStoredAuthUser,
  loginWithEmailPassword,
  loginWithGooglePopup,
  logoutFirebase,
  onGoogleAuthStateChange,
  requestPasswordReset,
  signupWithEmailPassword,
} from '../services/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const storedGoogleUser = getStoredAuthUser();
    if (storedGoogleUser && isMounted) {
      setUser(storedGoogleUser as User);
    }

    const unsubscribe = onGoogleAuthStateChange((firebaseUser: User | null) => {
      if (!isMounted) return;
      if (!firebaseUser) return;
      void (async () => {
        try {
          const idToken = await getFirebaseIdToken();
          const sessionUser = await exchangeFirebaseSession(idToken);
          if (isMounted) {
            setUser(sessionUser as User);
          }
        } catch (error) {
          // Do not override existing logged-in state with transient exchange failures.
          console.error('Firebase session sync failed:', error);
        }
      })();
    });

    // Skip backend auth checks on admin pages
    if (window.location.pathname.startsWith('/admin')) {
      setLoading(false);
      return () => {
        unsubscribe();
      };
    }

    const checkUser = async () => { 
      try { 
        const res = await fetch('/api/auth/me', { credentials: 'include' }); 
        if (res.status === 401) {
          return;
        }
        const data = await res.json(); 
        if (isMounted && data.success && data.data?.user) { 
          setUser(data.data.user); 
        } 
      } catch { 
        // not logged in 
      } finally { 
        if (isMounted) {
          setLoading(false);
        }
      } 
    }; 
    void checkUser();

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const establishServerSession = async () => {
    const idToken = await getFirebaseIdToken();
    try {
      return await exchangeFirebaseSession(idToken);
    } catch {
      // One retry can recover from transient backend restarts/proxy hiccups.
      return exchangeFirebaseSession(idToken);
    }
  };

  const login = async (email: string, password: string) => {
    setError(null);
    if (!email || !email.includes('@')) throw new Error('Please enter a valid email address.'); 
    if (!password || password.length < 8) throw new Error('Password must be at least 8 characters.'); 
    try {
      await loginWithEmailPassword(email, password);
      const sessionUser = await establishServerSession();
      setUser(sessionUser as User);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    setError(null);
    if (!name || name.trim().length < 2) throw new Error('Name must be at least 2 characters.'); 
    if (!email || !email.includes('@')) throw new Error('Please enter a valid email address.'); 
    if (!password || password.length < 8) throw new Error('Password must be at least 8 characters.'); 
    try {
      await signupWithEmailPassword(name, email, password);
      const sessionUser = await establishServerSession();
      setUser(sessionUser as User);
    } catch (err: any) {
      // If the account was created but session exchange failed, recover by logging in and exchanging again.
      if (err?.code === 'auth/email-already-in-use') {
        try {
          await loginWithEmailPassword(email, password);
          const sessionUser = await establishServerSession();
          setUser(sessionUser as User);
          return;
        } catch {
          // Fall back to original error below.
        }
      }
      console.error('Signup fetch error:', err);
      setError(err.message);
      throw err;
    }
  };

  const loginWithGoogle = async () => {
    setError(null);
    try {
      await loginWithGooglePopup();
      const sessionUser = await establishServerSession();
      setUser(sessionUser as User);
    } catch (err: any) {
      setError(err?.message || 'Google login failed');
      throw err;
    }
  };

  const forgotPassword = async (email: string) => {
    setError(null);
    if (!email || !email.includes('@')) {
      throw new Error('Enter your email first, then click Forgot password.');
    }
    try {
      await requestPasswordReset(email.trim());
    } catch (err: any) {
      setError(err?.message || 'Could not send reset email');
      throw err;
    }
  };

  const logout = async () => {
    try {
      await logoutFirebase();
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithGoogle, forgotPassword, signup, logout, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
