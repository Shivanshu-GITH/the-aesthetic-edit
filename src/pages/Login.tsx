import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import SEOMeta from '../components/SEOMeta';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, error } = useAuth();
  const { showToast } = useToast();
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

  return (
    <div className="relative min-h-screen bg-surface flex items-center justify-center px-4 sm:px-6 pt-20 pb-32 overflow-x-clip">
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
