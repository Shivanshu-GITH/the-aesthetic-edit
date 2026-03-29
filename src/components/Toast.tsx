import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { useToast, ToastType } from '../context/ToastContext';
import { cn } from '../lib/utils';

const ToastItem: React.FC<{ id: string; message: string; type: ToastType }> = ({ id, message, type }) => {
  const { hideToast } = useToast();

  const typeStyles = {
    success: 'border-primary',
    error: 'border-red-400',
    info: 'border-accent-peach',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      className={cn(
        'w-[280px] bg-white border-l-4 p-4 shadow-2xl flex items-center justify-between pointer-events-auto',
        typeStyles[type]
      )}
    >
      <span className="font-label text-[10px] uppercase tracking-widest font-bold text-on-surface leading-tight">
        {message}
      </span>
      <button
        onClick={() => hideToast(id)}
        className="text-outline hover:text-on-surface transition-colors p-1"
        aria-label="Dismiss"
      >
        <X size={14} />
      </button>
    </motion.div>
  );
};

export const ToastStack: React.FC = () => {
  const { toasts } = useToast();

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} {...toast} />
        ))}
      </AnimatePresence>
    </div>
  );
};
