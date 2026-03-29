import * as React from 'react';
import { motion } from 'motion/react';
import { RefreshCw, Home, AlertTriangle } from 'lucide-react';

interface Props {
  children?: React.ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public override render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-surface relative overflow-hidden flex items-center justify-center px-6">
          {/* Decorative Background Elements */}
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent-blush/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent-peach/20 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>

          <div className="max-w-2xl w-full text-center relative z-10 space-y-12">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-24 h-24 bg-red-50 text-red-500 rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-sm"
            >
              <AlertTriangle size={48} />
            </motion.div>

            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-headline font-bold text-on-surface">
                Something broke <span className="italic font-normal text-primary">beautifully</span>.
              </h1>
              <p className="text-lg md:text-xl text-on-surface-variant font-serif italic max-w-md mx-auto leading-relaxed">
                An unexpected error occurred. Refresh the page or head back home.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <button 
                onClick={() => window.location.reload()}
                className="w-full sm:w-auto flex items-center justify-center gap-3 bg-primary text-white px-10 py-4 rounded-2xl font-label text-sm uppercase tracking-widest font-bold hover:bg-primary-hover transition-all shadow-xl shadow-primary/20"
              >
                <RefreshCw size={18} /> Refresh Page
              </button>
              <a 
                href="/" 
                className="w-full sm:w-auto flex items-center justify-center gap-3 border-2 border-primary text-primary px-10 py-4 rounded-2xl font-label text-sm uppercase tracking-widest font-bold hover:bg-accent-blush transition-all"
              >
                <Home size={18} /> Go Home
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
