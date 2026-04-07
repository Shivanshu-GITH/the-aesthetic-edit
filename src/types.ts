export interface Product {
  id: string;
  title: string;
  price: number;
  image: string;
  images: string[];
  category: string;
  subCategory: string;
  vibe: string[];
  affiliateUrl: string;
  retailer?: string;
  description?: string;
  isActive?: boolean;
  isTrending?: boolean;
  isTopRated?: boolean;
  relatedProducts?: string[]; // IDs of products for "Complete the Look"
  sectionHeading?: string;
  sectionSubheading?: string;
  sectionDescription?: string;
  sectionCtaText?: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  categorySlug: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  images: string[];
  category: string;
  author: string;
  authorImage?: string; // ADD THIS
  date: string;
  readTime: string;
  recommendedProducts: string[]; // IDs of products
  relatedPosts: string[];
  isPublished?: boolean;
  sectionHeading?: string;
  sectionSubheading?: string;
  sectionDescription?: string;
  sectionCtaText?: string;
  relatedPostsHeading?: string;
  relatedPostsSubheading?: string;
  relatedPostsDescription?: string;
  relatedPostsCtaText?: string;
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
  userId: string;
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
