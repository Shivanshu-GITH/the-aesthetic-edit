import React from 'react';
import { cn } from '../lib/utils';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className }) => (
  <div className={cn("animate-pulse bg-surface-container-high rounded-md", className)} />
);

export const ProductCardSkeleton: React.FC = () => (
  <div className="group bg-white rounded-[32px] p-4 border border-outline-variant/30">
    <Skeleton className="aspect-[4/5] rounded-[24px]" />
    <div className="mt-6 space-y-3 px-2">
      <Skeleton className="h-4 w-[60%]" />
      <Skeleton className="h-4 w-[40%]" />
    </div>
  </div>
);

export const ProductCardGridSkeleton: React.FC<{ count?: number }> = ({ count = 9 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
    {Array.from({ length: count }).map((_, i) => (
      <ProductCardSkeleton key={i} />
    ))}
  </div>
);

export const BlogPostCardSkeleton: React.FC = () => (
  <div className="group bg-white rounded-[32px] p-4 border border-outline-variant/30">
    <Skeleton className="aspect-[4/5] rounded-[24px]" />
    <div className="mt-6 space-y-3 px-2">
      <Skeleton className="h-6 w-[80%]" />
      <Skeleton className="h-4 w-[60%]" />
      <Skeleton className="h-4 w-[40%]" />
    </div>
  </div>
);

export const BlogPostCardGridSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
    {Array.from({ length: count }).map((_, i) => (
      <BlogPostCardSkeleton key={i} />
    ))}
  </div>
);

export const ProductDetailSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
    <Skeleton className="aspect-[4/5] rounded-[48px]" />
    <div className="space-y-8">
      <div className="space-y-4">
        <Skeleton className="h-12 w-[80%]" />
        <Skeleton className="h-6 w-[60%]" />
      </div>
      <Skeleton className="h-10 w-32" />
      <div className="space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-[80%]" />
      </div>
      <Skeleton className="h-16 w-full rounded-2xl" />
    </div>
  </div>
);

export const BlogPostSkeleton: React.FC = () => (
  <div className="max-w-4xl mx-auto px-6 pt-24 space-y-12">
    <div className="text-center space-y-6">
      <Skeleton className="h-4 w-32 mx-auto" />
      <Skeleton className="h-16 w-[80%] mx-auto" />
      <Skeleton className="h-10 w-48 mx-auto" />
    </div>
    <Skeleton className="aspect-[21/9] rounded-[48px]" />
    <div className="max-w-3xl mx-auto space-y-6">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-[90%]" />
      <Skeleton className="h-4 w-[95%]" />
    </div>
  </div>
);
