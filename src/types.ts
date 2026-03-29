export interface Product {
  id: string;
  title: string;
  price: number;
  image: string;
  category: string;
  subCategory: string;
  vibe: string[];
  affiliateUrl: string;
  retailer?: string;
  description?: string;
  isActive?: boolean;
}

export interface BlogPost {
  id: string;
  slug: string;
  categorySlug: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  category: string;
  author: string;
  date: string;
  readTime: string;
  recommendedProducts: string[]; // IDs of products
}

export interface BlogCategory {
  id: string;
  title: string;
  slug: string;
  image: string;
  description: string;
}

export interface WishlistItem {
  id: string;
  sessionId: string;
  productId: string;
  createdAt: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  source: string;
  isConfirmed: boolean;
  createdAt: string;
}

export interface AffiliateClick {
  id: string;
  productId: string;
  clickedAt: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  provider?: 'google' | 'local';
}

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error?: string;
  meta?: PaginationMeta;
}
