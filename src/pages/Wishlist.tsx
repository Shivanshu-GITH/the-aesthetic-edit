import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { Product, BlogPost } from '../types';
import ProductCard from '../components/ProductCard';
import SEOMeta from '../components/SEOMeta';
import { cn } from '../lib/utils';

type WishlistTab = 'products' | 'journals';

export default function Wishlist() {
  const { wishlistCount, toggleWishlist, toggleJournalWishlist } = useWishlist();
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [journals, setJournals] = useState<BlogPost[]>([]);
  const [activeTab, setActiveTab] = useState<WishlistTab>('products');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWishlistItems = async () => {
      if (!user) {
        setProducts([]);
        setJournals([]);
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      try {
        const response = await fetch('/api/wishlist');
        const result = await response.json();
        if (result.success) {
          setProducts(result.data.products);
          setJournals(result.data.journals);
        }
      } catch (error) {
        console.error('Failed to fetch wishlist items:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWishlistItems();
  }, [user, wishlistCount]);

  useEffect(() => {
    const handleCacheCleared = () => {
      if (user) {
        fetch('/api/wishlist')
          .then(res => res.json())
          .then(result => {
            if (result.success) {
              setProducts(result.data.products);
              setJournals(result.data.journals);
            }
          });
      }
    };
    window.addEventListener('ae_cache_cleared', handleCacheCleared);
    return () => window.removeEventListener('ae_cache_cleared', handleCacheCleared);
  }, [user]);

  const handleClearAll = async () => {
    if (window.confirm(`Are you sure you want to clear your entire ${activeTab === 'products' ? 'product wishlist' : 'saved journals'}?`)) {
      if (activeTab === 'products') {
        for (const product of products) {
          await toggleWishlist(product.id);
        }
      } else {
        for (const journal of journals) {
          await toggleJournalWishlist(journal.id);
        }
      }
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-24 space-y-12">
        <div className="space-y-4 animate-pulse">
          <div className="h-10 w-48 bg-surface-container rounded-lg"></div>
          <div className="h-4 w-32 bg-surface-container rounded-lg"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="aspect-[4/5] bg-surface-container rounded-[32px] animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  const isEmpty = (activeTab === 'products' ? products.length : journals.length) === 0;

  if (isEmpty) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-32">
        <SEOMeta 
          title="Your Wishlist"
          description="Your saved aesthetic picks and journals from The Aesthetic Edit."
          type="website"
        />
        
        <div className="flex flex-col items-center space-y-12">
          {/* Tabs */}
          <div className="flex bg-surface-container/50 p-1.5 rounded-2xl border border-outline-variant/30">
            <button 
              onClick={() => setActiveTab('products')}
              className={cn(
                "px-8 py-2.5 rounded-xl font-label text-[10px] uppercase tracking-widest font-bold transition-all",
                activeTab === 'products' ? "bg-white text-primary shadow-sm" : "text-outline hover:text-primary"
              )}
            >
              Products ({products.length})
            </button>
            <button 
              onClick={() => setActiveTab('journals')}
              className={cn(
                "px-8 py-2.5 rounded-xl font-label text-[10px] uppercase tracking-widest font-bold transition-all",
                activeTab === 'journals' ? "bg-white text-primary shadow-sm" : "text-outline hover:text-primary"
              )}
            >
              Journals ({journals.length})
            </button>
          </div>

          <div className="text-center space-y-6">
            <div className="text-6xl text-primary/30">♡</div>
            <h2 className="text-3xl font-headline font-bold text-on-surface">
              {user ? `Your ${activeTab} list is empty` : 'Join us to save your wishlist'}
            </h2>
            <p className="font-serif italic text-on-surface-variant max-w-md mx-auto">
              {user 
                ? `Save ${activeTab} that speak to you while browsing. They'll be waiting for you here.`
                : "Create an account or login to start saving your favorite aesthetic finds across devices."}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                to={activeTab === 'products' ? "/shop" : "/blog"} 
                className="inline-block bg-primary text-on-primary px-8 py-3 rounded-xl font-label text-xs uppercase tracking-widest hover:bg-primary-hover transition-all"
              >
                Browse {activeTab === 'products' ? 'the Shop' : 'the Journal'}
              </Link>
              {!user && (
                <Link 
                  to="/login" 
                  className="inline-block border-2 border-primary text-primary px-8 py-3 rounded-xl font-label text-xs uppercase tracking-widest hover:bg-accent-blush transition-all"
                >
                  Login / Sign Up
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-24 space-y-12">
      <SEOMeta 
        title="Your Wishlist"
        description="Your saved aesthetic picks and journals from The Aesthetic Edit."
        type="website"
      />
      
      <div className="flex flex-col items-center text-center border-b border-outline-variant/30 pb-12 space-y-8 relative">
        <div className="space-y-6 w-full flex flex-col items-center">
          <h1 className="text-4xl md:text-5xl font-headline font-bold text-on-surface">Your Wishlist</h1>
          
          {/* Tabs */}
          <div className="flex bg-surface-container/50 p-1.5 rounded-2xl border border-outline-variant/30 w-fit mx-auto">
            <button 
              onClick={() => setActiveTab('products')}
              className={cn(
                "px-8 py-2.5 rounded-xl font-label text-[10px] uppercase tracking-widest font-bold transition-all",
                activeTab === 'products' ? "bg-white text-primary shadow-sm" : "text-outline hover:text-primary"
              )}
            >
              Products ({products.length})
            </button>
            <button 
              onClick={() => setActiveTab('journals')}
              className={cn(
                "px-8 py-2.5 rounded-xl font-label text-[10px] uppercase tracking-widest font-bold transition-all",
                activeTab === 'journals' ? "bg-white text-primary shadow-sm" : "text-outline hover:text-primary"
              )}
            >
              Journals ({journals.length})
            </button>
          </div>
        </div>

        <button 
          onClick={handleClearAll}
          className="md:absolute md:bottom-12 md:right-0 text-primary font-label text-[10px] uppercase tracking-widest font-bold border-b border-primary hover:text-primary-hover hover:border-primary-hover transition-all"
        >
          Clear All {activeTab}
        </button>
      </div>

      {activeTab === 'products' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {journals.map((journal, index) => (
            <motion.div 
              key={journal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group bg-white p-4 rounded-[32px] border border-outline-variant/30 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
            >
              <Link to={`/blog/${journal.categorySlug}/${journal.slug}`}>
                <div className="aspect-[4/3] rounded-[24px] overflow-hidden mb-6 bg-surface-container">
                  <img 
                    src={journal.image} 
                    alt={journal.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                  />
                </div>
                <div className="px-2 space-y-4">
                  <div className="flex items-center gap-3 font-label text-[9px] uppercase tracking-widest text-primary font-bold">
                    <span>{journal.category}</span>
                    <span className="w-1 h-1 bg-accent-peach rounded-full"></span>
                    <span className="text-outline">{journal.date}</span>
                  </div>
                  <h3 className="text-xl font-headline font-bold text-on-surface group-hover:text-primary transition-colors line-clamp-2">
                    {journal.title}
                  </h3>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
