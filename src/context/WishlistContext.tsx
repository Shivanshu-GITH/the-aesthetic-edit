import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';

interface WishlistContextType {
  wishlistIds: string[];
  journalWishlistIds: string[];
  wishlistCount: number;
  isWishlisted: (productId: string) => boolean;
  isJournalWishlisted: (postId: string) => boolean;
  toggleWishlist: (productId: string) => Promise<void>;
  toggleJournalWishlist: (postId: string) => Promise<void>;
  isLoading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [journalWishlistIds, setJournalWishlistIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();
  const { user } = useAuth();

  const fetchWishlist = useCallback(async () => {
    if (!user) {
      setWishlistIds([]);
      setJournalWishlistIds([]);
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/wishlist');
      const result = await response.json();
      if (result.success && result.data) {
        setWishlistIds((result.data.products || []).map((p: any) => p.id));
        setJournalWishlistIds((result.data.journals || []).map((p: any) => p.id));
      }
    } catch (error) {
      console.error('Failed to fetch wishlist:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  useEffect(() => {
    const handleCacheCleared = () => fetchWishlist();
    window.addEventListener('ae_cache_cleared', handleCacheCleared);
    return () => window.removeEventListener('ae_cache_cleared', handleCacheCleared);
  }, [fetchWishlist]);

  const isWishlisted = useCallback((productId: string) => {
    return wishlistIds.includes(productId);
  }, [wishlistIds]);

  const isJournalWishlisted = useCallback((postId: string) => {
    return journalWishlistIds.includes(postId);
  }, [journalWishlistIds]);

  const toggleWishlist = useCallback(async (productId: string) => {
    if (!user) return;

    const alreadyWishlisted = wishlistIds.includes(productId);
    
    setWishlistIds(prev => 
      alreadyWishlisted 
        ? prev.filter(id => id !== productId) 
        : [...prev, productId]
    );

    try {
      if (alreadyWishlisted) {
        const response = await fetch(`/api/wishlist/${productId}`, {
          method: 'DELETE'
        });
        const result = await response.json();
        if (!result.success) throw new Error(result.error);
        showToast('Removed from wishlist');
      } else {
        const response = await fetch('/api/wishlist', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ productId })
        });
        const result = await response.json();
        if (!result.success) throw new Error(result.error);
        showToast('Added to wishlist ♡');
      }
    } catch (error) {
      setWishlistIds(prev => 
        alreadyWishlisted 
          ? [...prev, productId] 
          : prev.filter(id => id !== productId)
      );
      showToast('Something went wrong', 'error');
    }
  }, [user, wishlistIds, showToast]);

  const toggleJournalWishlist = useCallback(async (postId: string) => {
    if (!user) return;

    const alreadyWishlisted = journalWishlistIds.includes(postId);
    
    setJournalWishlistIds(prev => 
      alreadyWishlisted 
        ? prev.filter(id => id !== postId) 
        : [...prev, postId]
    );

    try {
      if (alreadyWishlisted) {
        const response = await fetch(`/api/wishlist/journal/${postId}`, {
          method: 'DELETE'
        });
        const result = await response.json();
        if (!result.success) throw new Error(result.error);
        showToast('Removed from saved journals');
      } else {
        const response = await fetch('/api/wishlist/journal', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ postId })
        });
        const result = await response.json();
        if (!result.success) throw new Error(result.error);
        showToast('Journal saved ♡');
      }
    } catch (error) {
      setJournalWishlistIds(prev => 
        alreadyWishlisted 
          ? [...prev, postId] 
          : prev.filter(id => id !== postId)
      );
      showToast('Something went wrong', 'error');
    }
  }, [user, journalWishlistIds, showToast]);

  const wishlistCount = wishlistIds.length + journalWishlistIds.length;

  return (
    <WishlistContext.Provider value={{ 
      wishlistIds, 
      journalWishlistIds,
      wishlistCount, 
      isWishlisted, 
      isJournalWishlisted,
      toggleWishlist, 
      toggleJournalWishlist,
      isLoading 
    }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
