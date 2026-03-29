import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import SEOMeta from '../components/SEOMeta';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, loginWithGoogle, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      // Error handled by AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await loginWithGoogle();
      navigate(from, { replace: true });
    } catch (err) {
      // Error handled by AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-6 pt-20 pb-32">
      <SEOMeta 
        title="Login"
        description="Login to your account on The Aesthetic Edit to manage your wishlist and curated finds."
        type="website"
      />
      
      {/* Decorative orbs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent-blush/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-peach/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white p-10 rounded-[40px] border border-outline-variant/30 shadow-2xl relative z-10"
      >
        <div className="text-center space-y-4 mb-10">
          <div className="w-16 h-16 bg-accent-blush rounded-2xl flex items-center justify-center mx-auto text-primary">
            <Sparkles size={32} />
          </div>
          <h1 className="text-4xl font-headline font-bold text-on-surface">Welcome Back</h1>
          <p className="text-on-surface-variant font-serif italic">Login to save your favorite aesthetic finds.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="font-label text-[10px] uppercase tracking-widest font-bold text-outline ml-1">Email Address</label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="hello@aesthetic.com"
                  className="w-full pl-12 pr-6 py-4 rounded-2xl bg-surface-container/50 border border-outline-variant/30 focus:outline-none focus:border-primary transition-all font-body"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="font-label text-[10px] uppercase tracking-widest font-bold text-outline ml-1">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-6 py-4 rounded-2xl bg-surface-container/50 border border-outline-variant/30 focus:outline-none focus:border-primary transition-all font-body"
                />
              </div>
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-500 font-label uppercase tracking-widest text-center">{error}</p>
          )}

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-white py-5 rounded-2xl font-label text-sm uppercase tracking-widest font-bold hover:bg-primary-hover transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-xl shadow-primary/20"
          >
            {isLoading ? <Loader2 size={20} className="animate-spin" /> : 'Login'}
          </button>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-outline-variant/30"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-bold">
              <span className="px-4 bg-white text-outline">Or continue with</span>
            </div>
          </div>

          <button 
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full bg-white text-on-surface py-4 rounded-2xl font-label text-sm font-bold border border-outline-variant/30 hover:bg-surface transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              <path d="M0 0h24v24H0z" fill="none"/>
            </svg>
            Sign in with Google
          </button>
        </form>

        <div className="mt-10 text-center space-y-4">
          <p className="text-sm text-on-surface-variant font-body">
            Don't have an account?{' '}
            <Link to="/signup" state={{ from: location.state?.from }} className="text-primary font-bold hover:underline">Sign up</Link>
          </p>
          <Link to="/" className="inline-flex items-center gap-2 text-[10px] font-label uppercase tracking-widest text-outline hover:text-primary transition-colors">
            Back to Home <ArrowRight size={12} />
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
