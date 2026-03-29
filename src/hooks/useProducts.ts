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
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
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
    10 * 60 * 1000 // 10 minutes cache
  );

  return {
    product: data?.product || null,
    related: data?.related || [],
    loading,
    error,
  };
}
