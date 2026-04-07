import { useState, useEffect, useCallback } from 'react';
import { ApiResponse } from '../types';

interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  meta: any | null;
  refetch: () => void;
}

interface CacheItem<T> {
  data: T;
  meta?: any;
  timestamp: number;
}

export function useFetch<T>(
  url: string | null, 
  cacheKey?: string, 
  ttl: number = 5 * 60 * 1000 // default 5 minutes
): FetchState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<any | null>(null);

  const fetchData = useCallback(async (isRefetch = false) => {
    if (!url) return;

    const CACHE_VERSION = 'v2'; // Bumped version to force refresh
    const versionedCacheKey = cacheKey ? `${CACHE_VERSION}_${cacheKey}` : null;

    const NEVER_CACHE_PATTERNS = ['/api/auth/', '/api/wishlist']; 
    const shouldCache = versionedCacheKey && !NEVER_CACHE_PATTERNS.some(p => url.includes(p)); 

    if (!isRefetch && shouldCache) {
      const cached = sessionStorage.getItem(`ae_cache_${versionedCacheKey}`);
      if (cached) {
        const parsed: CacheItem<T> = JSON.parse(cached);
        if (Date.now() - parsed.timestamp < ttl) {
          setData(parsed.data);
          setMeta(parsed.meta || null);
          setLoading(false);
          setError(null);
          return;
        }
      }
    }

    setLoading(true);
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      const result: ApiResponse<T> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Something went wrong');
      }

      setData(result.data);
      setMeta(result.meta || null);
      setError(null);

      if (shouldCache && result.data) {
        const cacheItem: CacheItem<T> = {
          data: result.data,
          meta: result.meta,
          timestamp: Date.now(),
        };
        sessionStorage.setItem(`ae_cache_${versionedCacheKey}`, JSON.stringify(cacheItem));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [url, cacheKey, ttl]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onCacheCleared = () => {
      if (url) fetchData(true);
    };
    window.addEventListener('ae_cache_cleared', onCacheCleared);
    return () => window.removeEventListener('ae_cache_cleared', onCacheCleared);
  }, [url, fetchData]);

  return { data, loading, error, meta, refetch: () => fetchData(true) };
}

export function clearFetchCache() {
  if (typeof window === 'undefined') return;
  
  const keysToRemove: string[] = [];
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key && key.startsWith('ae_cache_')) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(key => sessionStorage.removeItem(key));
  window.dispatchEvent(new CustomEvent('ae_cache_cleared'));
}
