import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, ApiResponse } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
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
      try { 
        const res = await fetch('/api/auth/me'); 
        const data = await res.json(); 
        if (data.success && data.data?.user) { 
          setUser(data.data.user); 
        } 
      } catch { 
        // not logged in 
      } finally { 
        setLoading(false); 
      } 
    }; 
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setError(null);
    if (!email || !email.includes('@')) throw new Error('Please enter a valid email address.'); 
    if (!password || password.length < 6) throw new Error('Password must be at least 6 characters.'); 
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const res: ApiResponse<{ user: User }> = await response.json();
      if (res.success && res.data) {
        setUser(res.data.user);
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
    if (!name || name.trim().length < 2) throw new Error('Name must be at least 2 characters.'); 
    if (!email || !email.includes('@')) throw new Error('Please enter a valid email address.'); 
    if (!password || password.length < 8) throw new Error('Password must be at least 8 characters.'); 
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
      } else {
        throw new Error(res.error || 'Signup failed');
      }
    } catch (err: any) {
      console.error('Signup fetch error:', err);
      setError(err.message);
      throw err;
    }
  };

  const logout = async () => { 
    await fetch('/api/auth/logout', { method: 'POST' }); 
    setUser(null); 
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, error }}>
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
