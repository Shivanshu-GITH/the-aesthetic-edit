import { useMemo } from 'react';
import { useFetch } from './useFetch';
import { BlogPost, BlogCategory, Product, PaginationMeta } from '../types';

export function useBlogCategories() {
  const { data, loading, error } = useFetch<BlogCategory[]>(
    '/api/blog/categories', 
    'blog_categories',
    30 * 60 * 1000 // 30 minutes cache
  );

  return {
    categories: data || [],
    loading,
    error,
  };
}

export function useBlogPosts(categorySlug?: string, page: number = 1, limit: number = 3) {
  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    if (categorySlug) params.append('categorySlug', categorySlug);
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    return params.toString();
  }, [categorySlug, page, limit]);

  const url = `/api/blog/posts?${queryParams}`;
  const cacheKey = `blog_posts_${queryParams}`;

  const { data, loading, error, meta } = useFetch<BlogPost[]>(url, cacheKey);

  return {
    posts: data || [],
    loading,
    error,
    meta: meta as PaginationMeta | null,
  };
}

export function useBlogPost(slug: string | undefined) {
  const url = slug ? `/api/blog/posts/${slug}` : null;
  const cacheKey = slug ? `blog_post_${slug}` : undefined;

  const { data, loading, error } = useFetch<{ 
    post: BlogPost; 
    recommendedProducts: Product[]; 
    relatedPosts: BlogPost[] 
  }>(url, cacheKey, 30 * 1000); // 30 seconds cache for detail page to avoid stale data during editing

  return {
    post: data?.post || null,
    recommendedProducts: data?.recommendedProducts || [],
    relatedPosts: data?.relatedPosts || [],
    loading,
    error,
  };
}
