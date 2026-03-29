import { Router } from 'express';
import db from '../db.js';

const router = Router();

const formatProduct = (p: any) => ({
  id: p.id,
  title: p.title,
  price: p.price,
  image: p.image,
  category: p.category,
  subCategory: p.sub_category,
  vibe: Array.isArray(p.vibes) ? p.vibes : (typeof p.vibes === 'string' ? JSON.parse(p.vibes) : []),
  affiliateUrl: p.affiliate_url,
  retailer: p.retailer,
  description: p.description,
  isActive: p.is_active === 1
});

// Simple in-memory cache for blog categories
let categoriesCache: any = null;
let cacheTimestamp = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

router.get('/categories', (req, res) => {
  const now = Date.now();
  if (categoriesCache && (now - cacheTimestamp < CACHE_TTL)) {
    return res.json({ success: true, data: categoriesCache });
  }

  const categories = db.prepare('SELECT * FROM blog_categories').all();
  categoriesCache = categories;
  cacheTimestamp = now;

  res.json({ success: true, data: categories });
});

router.get('/posts', (req, res) => {
  const { categorySlug, page = '1', limit = '9' } = req.query;
  const offset = (Number(page) - 1) * Number(limit);

  let query = 'SELECT id, slug, category_slug, title, excerpt, image, category, author, date, read_time FROM blog_posts WHERE is_published = 1';
  const params: any[] = [];

  if (categorySlug) {
    query += ' AND category_slug = ?';
    params.push(categorySlug);
  }

  const countQuery = query.replace('SELECT id, slug, category_slug, title, excerpt, image, category, author, date, read_time', 'SELECT COUNT(*) as total');
  const total = (db.prepare(countQuery).get(...params) as any).total;

  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(Number(limit), offset);

  const posts = db.prepare(query).all(...params);
  const totalPages = Math.ceil(total / Number(limit));

  res.json({
    success: true,
    data: posts,
    meta: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages
    }
  });
});

router.get('/posts/:slug', (req, res) => {
  const { slug } = req.params;
  const post = db.prepare('SELECT * FROM blog_posts WHERE slug = ? AND is_published = 1').get(slug) as any;

  if (!post) {
    return res.status(404).json({ success: false, error: 'Post not found' });
  }

  const recommendedIds = JSON.parse(post.recommended_products || '[]');
  let recommendedProducts: any[] = [];
  if (recommendedIds.length > 0) {
    const placeholders = recommendedIds.map(() => '?').join(',');
    recommendedProducts = db.prepare(`SELECT * FROM products WHERE id IN (${placeholders}) AND is_active = 1`).all(...recommendedIds);
  }

  const relatedPosts = db.prepare(`
    SELECT id, slug, category_slug, title, excerpt, image, category, author, date, read_time 
    FROM blog_posts 
    WHERE category_slug = ? AND slug != ? AND is_published = 1 
    LIMIT 3
  `).all(post.category_slug, slug);

  res.json({
    success: true,
    data: {
      post,
      recommendedProducts: recommendedProducts.map(formatProduct),
      relatedPosts
    }
  });
});

export default router;
