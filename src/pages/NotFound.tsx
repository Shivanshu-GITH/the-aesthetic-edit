import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ShoppingBag } from 'lucide-react';
import SEOMeta from '../components/SEOMeta';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-surface relative overflow-hidden flex items-center justify-center px-6">
      <SEOMeta 
        title="404 - Page Not Found"
        description="The page you are looking for has wandered off. Let's find your way back to The Aesthetic Edit."
        type="website"
      />
      
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent-blush/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent-peach/20 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>

      <div className="max-w-2xl w-full text-center relative z-10 space-y-12">
        <div className="relative">
          <span className="font-headline text-[120px] md:text-[220px] font-bold text-primary/5 leading-none select-none">
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl md:text-5xl font-headline italic text-on-surface"
            >
              This page got lost in the aesthetic...
            </motion.h1>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-10"
        >
          <p className="text-lg md:text-xl text-on-surface-variant font-serif italic max-w-md mx-auto">
            The page you're looking for has wandered off. Let's find your way back.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link 
              to="/" 
              className="w-full sm:w-auto flex items-center justify-center gap-3 bg-primary text-white px-10 py-4 rounded-2xl font-label text-sm uppercase tracking-widest font-bold hover:bg-primary-hover transition-all shadow-xl shadow-primary/20"
            >
              <ArrowLeft size={18} /> Back to Home
            </Link>
            <Link 
              to="/shop" 
              className="w-full sm:w-auto flex items-center justify-center gap-3 border-2 border-primary text-primary px-10 py-4 rounded-2xl font-label text-sm uppercase tracking-widest font-bold hover:bg-accent-blush transition-all"
            >
              <ShoppingBag size={18} /> Browse the Shop
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
