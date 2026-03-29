import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, ApiResponse } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const storedUser = localStorage.getItem('ae_user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setError(null);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const res: ApiResponse<{ user: User }> = await response.json();
      if (res.success && res.data) {
        setUser(res.data.user);
        localStorage.setItem('ae_user', JSON.stringify(res.data.user));
      } else {
        throw new Error(res.error || 'Login failed');
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    setError(null);
    console.log('Attempting signup...', { name, email });
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      console.log('Signup response received:', response.status);
      const res: ApiResponse<{ user: User }> = await response.json();
      console.log('Signup result:', res);
      if (res.success && res.data) {
        setUser(res.data.user);
        localStorage.setItem('ae_user', JSON.stringify(res.data.user));
      } else {
        throw new Error(res.error || 'Signup failed');
      }
    } catch (err: any) {
      console.error('Signup fetch error:', err);
      setError(err.message);
      throw err;
    }
  };

  const loginWithGoogle = async () => {
    setError(null);
    try {
      // For demo, we simulate a successful Google auth
      // In a real app, this would use window.google.accounts.id.prompt() or a redirect
      const mockGoogleUser = {
        name: 'Shivanshu Tiwari',
        email: 'shivanshu.um@gmail.com',
        id: 'google-123456789'
      };

      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockGoogleUser),
      });

      const res: ApiResponse<{ user: User }> = await response.json();
      if (res.success && res.data) {
        setUser(res.data.user);
        localStorage.setItem('ae_user', JSON.stringify(res.data.user));
      } else {
        throw new Error(res.error || 'Google login failed');
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('ae_user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, loginWithGoogle, logout, error }}>
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
