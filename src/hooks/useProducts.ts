import { useMemo } from 'react';
import { useFetch } from './useFetch';
import { Product, PaginationMeta } from '../types';

export function useProducts(filters?: {
  category?: string;
  subCategory?: string;
  vibe?: string;
  maxPrice?: number;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const queryParams = useMemo(() => { 
    if (!filters) return ''; 
    const params = new URLSearchParams(); 
    // Sort keys for stable cache keys 
    const sortedEntries = Object.entries(filters) 
      .filter(([, value]) => value !== undefined) 
      .sort(([a], [b]) => a.localeCompare(b)); 
    sortedEntries.forEach(([key, value]) => { 
      params.append(key, String(value)); 
    }); 
    return params.toString(); 
  }, [filters]); 

  const url = queryParams ? `/api/products?${queryParams}` : '/api/products';
  const cacheKey = `products_${queryParams || 'all'}`;

  const { data, loading, error, meta, refetch } = useFetch<Product[]>(url, cacheKey);

  return {
    products: data || [],
    loading,
    error,
    meta: meta as PaginationMeta | null,
    refetch,
  };
}

export function useProduct(id: string | undefined) {
  const url = id ? `/api/products/${id}` : null;
  const cacheKey = id ? `product_${id}` : undefined;

  const { data, loading, error } = useFetch<{ product: Product; related: Product[] }>(
    url,
    cacheKey,
    30 * 1000 // 30 seconds cache for detail page to avoid stale data during editing
  );

  return {
    product: data?.product || null,
    related: data?.related || [],
    loading,
    error,
  };
}
