import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Plus, Menu, X, Heart, User, LogOut } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';

export function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false);
  const location = useLocation();
  const { wishlistCount } = useWishlist();
  const { user, logout } = useAuth();

  const navLinks = [
    { name: 'Shop', path: '/shop' },
    { name: 'Journal', path: '/blog' },
    { name: 'About', path: '/about' },
  ];

  return (
    <header className="bg-surface/90 backdrop-blur-md border-b border-outline-variant sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-12">
          <Link to="/" className="text-2xl font-headline italic font-bold text-on-surface">
            The Aesthetic Edit
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "font-label text-sm tracking-widest uppercase transition-all duration-300 relative group",
                  location.pathname === link.path 
                    ? "text-primary" 
                    : "text-on-surface-variant hover:text-primary"
                )}
              >
                {link.name}
                <span className={cn(
                  "absolute -bottom-1 left-0 h-0.5 bg-primary transition-all duration-300",
                  location.pathname === link.path ? "w-full" : "w-0 group-hover:w-full"
                )} />
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-6">
          <Link 
            to="/wishlist" 
            className="relative p-2 text-on-surface-variant hover:text-primary transition-colors"
            aria-label={`Wishlist (${wishlistCount} items)`}
          >
            <Heart size={20} className={cn(wishlistCount > 0 && "fill-primary text-primary")} />
            {wishlistCount > 0 && (
              <span className="absolute top-0 right-0 bg-primary text-white text-[9px] rounded-full min-w-[16px] h-[16px] flex items-center justify-center font-bold px-1 border-2 border-surface">
                {wishlistCount}
              </span>
            )}
          </Link>

          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4 border-l border-outline-variant/30 pl-6">
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-label uppercase tracking-widest text-outline font-bold">
                    {user.provider === 'google' ? 'Google ID,' : 'Hello,'}
                  </span>
                  <span className="text-xs font-bold text-on-surface">
                    {user.provider === 'google' ? user.id : user.name.split(' ')[0]}
                  </span>
                </div>
                <button 
                  onClick={logout}
                  className="p-2 text-on-surface-variant hover:text-primary transition-colors"
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <Link 
                to="/login" 
                className="text-on-surface-variant hover:text-primary transition-colors p-2"
                title="Login"
              >
                <User size={20} />
              </Link>
            )}
          </div>

          <Link 
            to="/free-guide" 
            className="hidden lg:block bg-primary text-on-primary px-6 py-2.5 rounded-lg font-label text-xs uppercase tracking-widest hover:bg-primary-hover transition-all shadow-lg shadow-primary/10"
          >
            Get Free Guide
          </Link>
          <button 
            className="md:hidden text-on-surface"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="md:hidden bg-surface border-b border-outline-variant px-6 py-8 flex flex-col gap-6"
          >
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "font-label text-lg tracking-widest uppercase",
                  location.pathname === link.path ? "text-primary" : "text-on-surface"
                )}
              >
                {link.name}
              </Link>
            ))}
            <Link 
              to="/wishlist" 
              onClick={() => setIsOpen(false)}
              className={cn(
                "font-label text-lg tracking-widest uppercase",
                location.pathname === '/wishlist' ? "text-primary" : "text-on-surface"
              )}
            >
              Wishlist ({wishlistCount})
            </Link>
            {user ? (
              <button 
                onClick={() => {
                  logout();
                  setIsOpen(false);
                }}
                className="font-label text-lg tracking-widest uppercase text-left text-on-surface"
              >
                Logout ({user.name})
              </button>
            ) : (
              <Link 
                to="/login" 
                onClick={() => setIsOpen(false)}
                className="font-label text-lg tracking-widest uppercase text-on-surface"
              >
                Login / Sign Up
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="bg-gradient-to-b from-[#3e2a1f] to-[#5a3b2a] text-surface pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-6 border-b border-white/10 pb-20">
        {/* Top Section: Title & Quote */}
        <div className="flex flex-col items-center text-center space-y-8 mb-20">
          <Link to="/" className="text-4xl md:text-6xl font-headline italic block text-white drop-shadow-sm">
            The Aesthetic Edit
          </Link>
          <p className="font-label text-xs md:text-sm uppercase tracking-[0.4em] text-surface/70 leading-relaxed max-w-3xl mx-auto">
            Your destination for Pinterest-inspired style, intentional living, and curated shopping.
          </p>
        </div>
        
        {/* Bottom Section: Link Grids */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-16 md:gap-24 text-center">
          <div className="space-y-8">
            <h4 className="font-headline text-xl text-white tracking-wide">Quick Links</h4>
            <ul className="space-y-5 font-label text-[11px] uppercase tracking-[0.2em] text-surface/60">
              <li><Link to="/about" className="hover:text-white transition-all duration-300">About Us</Link></li>
              <li><Link to="/blog" className="hover:text-white transition-all duration-300">Blog</Link></li>
              <li><Link to="/shop" className="hover:text-white transition-all duration-300">Shop</Link></li>
              <li><Link to="/free-guide" className="hover:text-white transition-all duration-300">Free Guide</Link></li>
            </ul>
          </div>

          <div className="space-y-8">
            <h4 className="font-headline text-xl text-white tracking-wide">Categories</h4>
            <ul className="space-y-5 font-label text-[11px] uppercase tracking-[0.2em] text-surface/60">
              <li><Link to="/blog/outfit-ideas" className="hover:text-white transition-all duration-300">Outfit Ideas</Link></li>
              <li><Link to="/blog/home-styling" className="hover:text-white transition-all duration-300">Home Styling</Link></li>
              <li><Link to="/blog/lifestyle-routines" className="hover:text-white transition-all duration-300">Lifestyle & Routines</Link></li>
              <li><Link to="/blog/productivity-wellness" className="hover:text-white transition-all duration-300">Productivity & Wellness</Link></li>
              <li><Link to="/blog/tech-setups" className="hover:text-white transition-all duration-300">Tech & Setups</Link></li>
            </ul>
          </div>

          <div className="space-y-8">
            <h4 className="font-headline text-xl text-white tracking-wide">Connect</h4>
            <ul className="space-y-5 font-label text-[11px] uppercase tracking-[0.2em] text-surface/60">
              <li><a href="#" className="hover:text-white transition-all duration-300">Pinterest</a></li>
              <li><a href="#" className="hover:text-white transition-all duration-300">Instagram</a></li>
              <li><a href="mailto:hello@thecuratededit.com" className="hover:text-white transition-all duration-300">Contact Us</a></li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-12 pt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-[11px] font-label uppercase tracking-[0.3em] text-surface/40 items-center">
        <div className="text-center md:text-left break-words">
          <p>© 2026 THE AESTHETIC EDIT. ALL RIGHTS RESERVED.</p>
        </div>
        <div className="text-center">
          <Link to="/admin" className="hover:text-surface/60 transition-colors">Admin</Link>
        </div>
        <div className="text-center md:text-right break-words">
          <p className="hover:text-surface/60 cursor-pointer transition-colors">AFFILIATE DISCLOSURE</p>
        </div>
      </div>
    </footer>
  );
}
