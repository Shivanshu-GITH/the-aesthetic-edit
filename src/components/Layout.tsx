import React, { useEffect, useState } from 'react';
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
  const [siteConfigs, setSiteConfigs] = React.useState<Record<string, string>>({});

  useEffect(() => {
    fetch('/api/home-shop/config')
      .then(res => res.json())
      .then(data => {
        if (data.success) setSiteConfigs(data.data);
      })
      .catch(() => {});
  }, []);

  const navLinks = React.useMemo(() => {
    const fallback = [
      { name: 'Shop', path: '/shop' },
      { name: 'Journal', path: '/blog' },
      { name: 'About', path: '/about' },
    ];
    const raw = siteConfigs.nav_links_json;
    if (!raw) return fallback;
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return fallback;
      const sanitized = parsed
        .filter((l: any) => l && typeof l.name === 'string' && typeof l.path === 'string')
        .map((l: any) => ({ name: l.name.slice(0, 40), path: l.path.startsWith('/') ? l.path : `/${l.path}` }));
      return sanitized.length > 0 ? sanitized : fallback;
    } catch {
      return fallback;
    }
  }, [siteConfigs.nav_links_json]);

  return (
    <header className="bg-surface/90 backdrop-blur-md border-b border-outline-variant sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4 flex justify-between items-center">
        <div className="flex items-center gap-6 md:gap-12">
          <Link to="/" className="text-xl md:text-2xl font-headline italic font-bold text-on-surface whitespace-nowrap">
            The Aesthetic Edit
          </Link>
          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "font-label text-[10px] lg:text-sm tracking-widest uppercase transition-all duration-300 relative group",
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

        <div className="flex items-center gap-2 md:gap-6">
          <Link 
            to="/wishlist" 
            className="relative p-2 text-on-surface-variant hover:text-primary transition-colors"
            aria-label={`Wishlist (${wishlistCount} items)`}
          >
            <Heart className={cn("w-4.5 h-4.5 md:w-5 md:h-5", wishlistCount > 0 && "fill-primary text-primary")} />
            {wishlistCount > 0 && (
              <span className="absolute top-0 right-0 bg-primary text-white text-[8px] md:text-[9px] rounded-full min-w-3.5 md:min-w-4 h-3.5 md:h-4 flex items-center justify-center font-bold px-1 border-2 border-surface">
                {wishlistCount}
              </span>
            )}
          </Link>

          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4 border-l border-outline-variant/30 pl-4 lg:pl-6">
                <div className="flex flex-col items-end">
                  <span className="text-[8px] lg:text-[10px] font-label uppercase tracking-widest text-outline font-bold">
                    Hello,
                  </span>
                  <span className="text-[10px] lg:text-xs font-bold text-on-surface">
                    {user.name.split(' ')[0]}
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
            className="hidden lg:block bg-primary text-on-primary px-5 py-2 rounded-lg font-label text-[10px] uppercase tracking-widest hover:bg-primary-hover transition-all shadow-lg shadow-primary/10 font-bold"
          >
            Free Guide
          </Link>
          <button 
            className="md:hidden p-2 text-on-surface"
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
  const [siteConfigs, setSiteConfigs] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch('/api/home-shop/config')
      .then(res => res.json())
      .then(data => {
        if (data.success) setSiteConfigs(data.data);
      })
      .catch(err => console.error('Failed to fetch site config', err));
  }, []);

  const quickLinks = React.useMemo(() => {
    const fallback = [
      { name: 'About Us', path: '/about' },
      { name: 'Blog', path: '/blog' },
      { name: 'Shop', path: '/shop' },
      { name: 'Free Guide', path: '/free-guide' },
    ];
    const raw = siteConfigs.footer_quick_links_json;
    if (!raw) return fallback;
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return fallback;
      const sanitized = parsed
        .filter((l: any) => l && typeof l.name === 'string' && typeof l.path === 'string')
        .map((l: any) => ({ name: l.name.slice(0, 60), path: l.path.startsWith('/') ? l.path : `/${l.path}` }));
      return sanitized.length > 0 ? sanitized : fallback;
    } catch {
      return fallback;
    }
  }, [siteConfigs.footer_quick_links_json]);

  const blogCategoryLinks = React.useMemo(() => {
    const fallback = [
      { name: 'Outfit Ideas', path: '/blog/outfit-ideas' },
      { name: 'Home Styling', path: '/blog/home-styling' },
      { name: 'Lifestyle & Routines', path: '/blog/lifestyle-routines' },
      { name: 'Productivity & Wellness', path: '/blog/productivity-wellness' },
      { name: 'Tech & Setups', path: '/blog/tech-setups' },
    ];
    const raw = siteConfigs.footer_blog_category_links_json;
    if (!raw) return fallback;
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return fallback;
      const sanitized = parsed
        .filter((l: any) => l && typeof l.name === 'string' && typeof l.path === 'string')
        .map((l: any) => ({ name: l.name.slice(0, 60), path: l.path.startsWith('/') ? l.path : `/${l.path}` }));
      return sanitized.length > 0 ? sanitized : fallback;
    } catch {
      return fallback;
    }
  }, [siteConfigs.footer_blog_category_links_json]);

  const socialLinks = React.useMemo(() => {
    const fallback = [
      { name: 'Pinterest', url: '#' },
      { name: 'Instagram', url: '#' },
      { name: 'Contact Us', url: 'mailto:hello@thecuratededit.com' },
    ];
    const raw = siteConfigs.footer_social_links_json;
    if (!raw) return fallback;
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return fallback;
      const sanitized = parsed
        .filter((l: any) => l && typeof l.name === 'string' && typeof l.url === 'string')
        .map((l: any) => ({ name: l.name.slice(0, 40), url: l.url }));
      return sanitized.length > 0 ? sanitized : fallback;
    } catch {
      return fallback;
    }
  }, [siteConfigs.footer_social_links_json]);

  return (
    <footer className="bg-linear-to-b from-[#3e2a1f] to-[#5a3b2a] text-surface pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-6 border-b border-white/10 pb-20">
        {/* Top Section: Title & Quote */}
        <div className="flex flex-col items-center text-center space-y-8 mb-20">
          <Link to="/" className="text-4xl md:text-6xl font-headline italic block text-white drop-shadow-sm">
            {siteConfigs.home_hero_title || 'The Aesthetic Edit'}
          </Link>
          <p className="font-label text-xs md:text-sm uppercase tracking-[0.4em] text-surface/70 leading-relaxed max-w-3xl mx-auto">
            {siteConfigs.footer_about || 'Your destination for Pinterest-inspired style, intentional living, and curated shopping.'}
          </p>
        </div>
        
        {/* Bottom Section: Link Grids */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-16 md:gap-24 text-center">
          <div className="space-y-8">
            <h4 className="font-headline text-xl text-white tracking-wide">Quick Links</h4>
            <ul className="space-y-5 font-label text-[11px] uppercase tracking-[0.2em] text-surface/60">
              {quickLinks.map((l) => (
                <li key={l.path}><Link to={l.path} className="hover:text-white transition-all duration-300">{l.name}</Link></li>
              ))}
            </ul>
          </div>

          <div className="space-y-8">
            <h4 className="font-headline text-xl text-white tracking-wide">Categories</h4>
            <ul className="space-y-5 font-label text-[11px] uppercase tracking-[0.2em] text-surface/60">
              {blogCategoryLinks.map((l) => (
                <li key={l.path}><Link to={l.path} className="hover:text-white transition-all duration-300">{l.name}</Link></li>
              ))}
            </ul>
          </div>

          <div className="space-y-8">
            <h4 className="font-headline text-xl text-white tracking-wide">Connect</h4>
            <ul className="space-y-5 font-label text-[11px] uppercase tracking-[0.2em] text-surface/60">
              {socialLinks.map((l) => (
                <li key={l.name}><a href={l.url} className="hover:text-white transition-all duration-300" rel={l.url.startsWith('http') ? 'noopener noreferrer' : undefined} target={l.url.startsWith('http') ? '_blank' : undefined}>{l.name}</a></li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-12 pt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-[11px] font-label uppercase tracking-[0.3em] text-surface/40 items-center">
        <div className="text-center md:text-left wrap-break-word">
          <p>{siteConfigs.footer_copyright || '© 2026 THE AESTHETIC EDIT. ALL RIGHTS RESERVED.'}</p>
        </div>
        <div className="text-center">
          <Link to="/admin" className="hover:text-surface/60 transition-colors">Admin</Link>
        </div>
        <div className="text-center md:text-right wrap-break-word">
          <p className="hover:text-surface/60 cursor-pointer transition-colors">AFFILIATE DISCLOSURE</p>
        </div>
      </div>
    </footer>
  );
}
