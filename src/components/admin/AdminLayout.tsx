import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart3, 
  ShoppingBag, 
  FileText, 
  Settings, 
  Mail, 
  LogOut, 
  Plus, 
  Layout, 
  Sparkles, 
  Tag, 
  Menu, 
  X,
  RefreshCw,
  Lock
} from 'lucide-react';
import { useAdminContext } from './AdminContext';
import { TabType } from './hooks/useAdmin';

export const AdminLayout: React.FC<{ children: React.ReactNode; onTabIntent?: (tab: TabType) => void }> = ({ children, onTabIntent }) => {
  const { 
    isAuthenticated, 
    isLoading, 
    error, 
    password, 
    setPassword, 
    login, 
    logout, 
    activeTab, 
    setActiveTab,
    data
  } = useAdminContext();

  const [isMobileNavOpen, setIsMobileNavOpen] = React.useState(false);

  const navItems: { id: TabType; label: string; icon: any }[] = [
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'products', label: 'Products', icon: ShoppingBag },
    { id: 'blogs', label: 'Blog Posts', icon: FileText },
    { id: 'categories', label: 'Blog Categories', icon: Tag },
    { id: 'shop-categories', label: 'Shop Categories', icon: Layout },
    { id: 'home-config', label: 'Home Config', icon: Sparkles },
    { id: 'site-config', label: 'Site Config', icon: Settings },
    { id: 'leads', label: 'Leads', icon: Mail },
  ];

  if (!isAuthenticated) {
    return (
      <div className="h-screen bg-surface flex items-center justify-center p-6 relative overflow-hidden">
        {/* Background Accents */}
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-accent-blush/20 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-primary/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2" />

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white p-12 rounded-[48px] border border-outline-variant/30 shadow-2xl relative z-10"
        >
          <div className="flex flex-col items-center text-center space-y-8">
            <div className="w-20 h-20 bg-accent-blush rounded-[32px] flex items-center justify-center text-primary shadow-xl shadow-primary/10">
              <Lock size={32} />
            </div>
            
            <div className="space-y-3">
              <h1 className="text-3xl font-headline font-bold text-on-surface">Admin Access</h1>
              <p className="text-sm text-outline font-medium">Please enter your password to continue.</p>
            </div>

            <form onSubmit={login} className="w-full space-y-6">
              <div className="space-y-2">
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full px-6 py-4 rounded-2xl bg-surface-container/50 border border-outline-variant/30 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-center text-lg tracking-widest"
                  autoFocus
                />
                {error && (
                  <motion.p 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="text-[10px] text-red-500 font-bold uppercase tracking-widest text-center"
                  >
                    {error}
                  </motion.p>
                )}
              </div>
              
              <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-white py-4 rounded-2xl font-label text-xs uppercase tracking-[0.2em] font-bold hover:bg-primary-hover transition-all flex items-center justify-center gap-3 shadow-xl shadow-primary/20 disabled:opacity-50"
              >
                {isLoading ? <RefreshCw className="animate-spin" size={18} /> : 'Unlock Dashboard'}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-surface flex flex-col md:flex-row overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-80 bg-white border-r border-outline-variant/20 flex-col p-8 h-full sticky top-0">
        <div className="mb-12 px-4">
          <h1 className="text-2xl font-headline font-bold text-primary tracking-tight">The Aesthetic Edit</h1>
          <p className="text-[10px] font-label uppercase tracking-[0.2em] text-outline font-bold mt-1">Management Portal</p>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto pr-2 custom-scrollbar">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              onMouseEnter={() => onTabIntent?.(item.id)}
              onFocus={() => onTabIntent?.(item.id)}
              className={`flex items-center gap-4 w-full px-5 py-4 rounded-2xl transition-all font-label text-xs uppercase tracking-widest font-bold ${
                activeTab === item.id 
                  ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                  : 'text-outline hover:bg-surface-container hover:text-primary'
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-outline-variant/20">
          <button 
            onClick={logout}
            className="flex items-center gap-4 w-full px-5 py-4 rounded-2xl text-outline hover:text-primary hover:bg-red-50 transition-all font-label text-xs uppercase tracking-widest font-bold"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden bg-white border-b border-outline-variant/20 p-6 sticky top-0 z-40 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-headline font-bold text-primary">The Aesthetic Edit</h1>
          <p className="text-[8px] font-label uppercase tracking-widest text-outline font-bold">{activeTab}</p>
        </div>
        <button 
          onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
          className="p-2 bg-surface-container rounded-xl text-primary"
        >
          {isMobileNavOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* Mobile Nav Overlay */}
      <AnimatePresence>
        {isMobileNavOpen && (
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="fixed inset-0 z-50 bg-white p-8 md:hidden flex flex-col"
          >
            <div className="flex justify-between items-center mb-12">
              <h1 className="text-2xl font-headline font-bold text-primary">Admin Menu</h1>
              <button onClick={() => setIsMobileNavOpen(false)} className="p-2"><X size={24} /></button>
            </div>
            <nav className="flex-1 space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onMouseEnter={() => onTabIntent?.(item.id)}
                  onFocus={() => onTabIntent?.(item.id)}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileNavOpen(false);
                  }}
                  className={`flex items-center gap-4 w-full px-6 py-5 rounded-2xl font-label text-sm uppercase tracking-widest font-bold ${
                    activeTab === item.id ? 'bg-primary text-white' : 'text-outline'
                  }`}
                >
                  <item.icon size={20} />
                  {item.label}
                </button>
              ))}
            </nav>
            <button 
              onClick={logout}
              className="mt-auto flex items-center gap-4 w-full px-6 py-5 rounded-2xl text-red-500 font-label text-sm uppercase tracking-widest font-bold border border-red-100"
            >
              <LogOut size={20} />
              Logout
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 p-8 md:p-16 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {isLoading && !data && (
            <div className="flex items-center justify-center h-64">
              <RefreshCw className="animate-spin text-primary" size={32} />
            </div>
          )}
          {children}
        </div>
      </main>
    </div>
  );
};
