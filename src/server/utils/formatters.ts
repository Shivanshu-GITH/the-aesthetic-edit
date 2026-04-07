export const formatProduct = (p: any) => ({ 
  id: p.id, 
  title: p.title, 
  price: p.price, 
  image: p.image, 
  images: Array.isArray(p.images) ? p.images : [], 
  category: p.category, 
  subCategory: p.sub_category, 
  vibe: Array.isArray(p.vibes) ? p.vibes : [], 
  affiliateUrl: p.affiliate_url, 
  retailer: p.retailer, 
  description: p.description, 
  isActive: p.is_active === true || p.is_active === 1, 
  isTrending: p.is_trending === true || p.is_trending === 1, 
  isTopRated: p.is_top_rated === true || p.is_top_rated === 1, 
  relatedProducts: Array.isArray(p.related_products) ? p.related_products : [],
  sectionHeading: p.section_heading,
  sectionSubheading: p.section_subheading,
  sectionDescription: p.section_description,
  sectionCtaText: p.section_cta_text,
}); 

/** Prefer snake_case (Postgres); fall back to camelCase if the driver ever returns that shape. */
const blogSection = (b: any, snake: string, camel: string) => b[snake] ?? b[camel];

export const formatBlogPost = (b: any) => ({ 
  id: b.id, 
  slug: b.slug, 
  categorySlug: b.category_slug ?? b.categorySlug, 
  title: b.title, 
  excerpt: b.excerpt, 
  content: b.content, 
  image: b.image, 
  images: Array.isArray(b.images) ? b.images : [],
  category: b.category, 
  author: b.author, 
  authorImage: b.author_image ?? b.authorImage,
  date: b.date, 
  readTime: b.read_time ?? b.readTime, 
  recommendedProducts: Array.isArray(b.recommended_products)
    ? b.recommended_products
    : (Array.isArray(b.recommendedProducts) ? b.recommendedProducts : []),
  relatedPosts: Array.isArray(b.related_posts)
    ? b.related_posts
    : (Array.isArray(b.relatedPosts) ? b.relatedPosts : []),
  isPublished: b.is_published === true || b.is_published === 1,
  sectionHeading: blogSection(b, 'section_heading', 'sectionHeading'),
  sectionSubheading: blogSection(b, 'section_subheading', 'sectionSubheading'),
  sectionDescription: blogSection(b, 'section_description', 'sectionDescription'),
  sectionCtaText: blogSection(b, 'section_cta_text', 'sectionCtaText'),
  relatedPostsHeading: blogSection(b, 'related_posts_heading', 'relatedPostsHeading'),
  relatedPostsSubheading: blogSection(b, 'related_posts_subheading', 'relatedPostsSubheading'),
  relatedPostsDescription: blogSection(b, 'related_posts_description', 'relatedPostsDescription'),
  relatedPostsCtaText: blogSection(b, 'related_posts_cta_text', 'relatedPostsCtaText'),
}); 
