import { Router } from 'express';
import db from '../db.js';
import { v4 as uuidv4 } from 'uuid';
import { rateLimit } from 'express-rate-limit'; 

const adminLimit = rateLimit({ 
  windowMs: 15 * 60 * 1000, // 15 minutes 
  max: 1000, 
  message: { success: false, error: 'Too many requests, please try again later' }, 
  standardHeaders: true, 
  legacyHeaders: false, 
}); 

const router = Router();
router.use(adminLimit);

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

const formatBlogPost = (b: any) => ({
  id: b.id,
  slug: b.slug,
  categorySlug: b.category_slug,
  title: b.title,
  excerpt: b.excerpt,
  content: b.content,
  image: b.image,
  category: b.category,
  author: b.author,
  date: b.date,
  readTime: b.read_time,
  recommendedProducts: Array.isArray(b.recommended_products) ? b.recommended_products : (typeof b.recommended_products === 'string' ? JSON.parse(b.recommended_products) : []),
  isPublished: b.is_published === 1
});

// Simple in-memory cache for blog categories
let categoriesCache: any = null;
let cacheTimestamp = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Admin Blog Post Routes
router.get('/admin/posts', (req, res) => {
  const adminPassword = req.get('ADMIN_PASSWORD');
  if (!adminPassword || adminPassword !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  const posts = db.prepare('SELECT * FROM blog_posts ORDER BY created_at DESC').all();
  res.json({ success: true, data: posts.map(formatBlogPost) });
});

router.post('/admin/posts', (req, res) => {
  const adminPassword = req.get('ADMIN_PASSWORD');
  if (!adminPassword || adminPassword !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  const { slug, categorySlug, title, excerpt, content, image, category, author, date, readTime, recommendedProducts = [], isPublished = true } = req.body;

  if (!slug || !categorySlug || !title || !excerpt || !content || !image || !category || !author || !date || !readTime) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }

  const id = uuidv4();
  db.prepare(`
    INSERT INTO blog_posts (id, slug, category_slug, title, excerpt, content, image, category, author, date, read_time, recommended_products, is_published)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, slug, categorySlug, title, excerpt, content, image, category, author, date, readTime, JSON.stringify(recommendedProducts), isPublished ? 1 : 0
  );

  const created = db.prepare('SELECT * FROM blog_posts WHERE id = ?').get(id);
  res.status(201).json({ success: true, data: formatBlogPost(created) });
});

router.put('/admin/posts/:id', (req, res) => {
  const adminPassword = req.get('ADMIN_PASSWORD');
  if (!adminPassword || adminPassword !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  const { id } = req.params;
  const { slug, categorySlug, title, excerpt, content, image, category, author, date, readTime, recommendedProducts = [], isPublished } = req.body;

  const postExists = db.prepare('SELECT 1 FROM blog_posts WHERE id = ?').get(id);
  if (!postExists) {
    return res.status(404).json({ success: false, error: 'Post not found' });
  }

  db.prepare(`
    UPDATE blog_posts 
    SET slug = ?, category_slug = ?, title = ?, excerpt = ?, content = ?, image = ?, category = ?, author = ?, date = ?, read_time = ?, recommended_products = ?, is_published = ?
    WHERE id = ?
  `).run(
    slug, categorySlug, title, excerpt, content, image, category, author, date, readTime, JSON.stringify(recommendedProducts), isPublished ? 1 : 0, id
  );

  const updated = db.prepare('SELECT * FROM blog_posts WHERE id = ?').get(id);
  res.json({ success: true, data: formatBlogPost(updated) });
});

router.delete('/admin/posts/:id', (req, res) => {
  const adminPassword = req.get('ADMIN_PASSWORD');
  if (!adminPassword || adminPassword !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  const { id } = req.params;
  const result = db.prepare('DELETE FROM blog_posts WHERE id = ?').run(id);

  if (result.changes === 0) {
    return res.status(404).json({ success: false, error: 'Post not found' });
  }

  res.json({ success: true });
});

// Admin Blog Category Routes
router.get('/admin/categories', (req, res) => {
  const adminPassword = req.get('ADMIN_PASSWORD');
  if (!adminPassword || adminPassword !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  const categories = db.prepare('SELECT * FROM blog_categories').all();
  res.json({ success: true, data: categories });
});

router.post('/admin/categories', (req, res) => {
  const adminPassword = req.get('ADMIN_PASSWORD');
  if (!adminPassword || adminPassword !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  const { title, slug, image, description } = req.body;

  if (!title || !slug || !image || !description) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }

  const id = uuidv4();
  db.prepare(`
    INSERT INTO blog_categories (id, title, slug, image, description)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, title, slug, image, description);

  // Invalidate categories cache
  categoriesCache = null;

  const created = db.prepare('SELECT * FROM blog_categories WHERE id = ?').get(id);
  res.status(201).json({ success: true, data: created });
});

router.put('/admin/categories/:id', (req, res) => {
  const adminPassword = req.get('ADMIN_PASSWORD');
  if (!adminPassword || adminPassword !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  const { id } = req.params;
  const { title, slug, image, description } = req.body;

  const categoryExists = db.prepare('SELECT 1 FROM blog_categories WHERE id = ?').get(id);
  if (!categoryExists) {
    return res.status(404).json({ success: false, error: 'Category not found' });
  }

  db.prepare(`
    UPDATE blog_categories 
    SET title = ?, slug = ?, image = ?, description = ?
    WHERE id = ?
  `).run(title, slug, image, description, id);

  // Invalidate categories cache
  categoriesCache = null;

  const updated = db.prepare('SELECT * FROM blog_categories WHERE id = ?').get(id);
  res.json({ success: true, data: updated });
});

router.delete('/admin/categories/:id', (req, res) => {
  const adminPassword = req.get('ADMIN_PASSWORD');
  if (!adminPassword || adminPassword !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  const { id } = req.params;
  const result = db.prepare('DELETE FROM blog_categories WHERE id = ?').run(id);

  if (result.changes === 0) {
    return res.status(404).json({ success: false, error: 'Category not found' });
  }

  // Invalidate categories cache
  categoriesCache = null;

  res.json({ success: true });
});

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
    data: posts.map(formatBlogPost),
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

  let recommendedIds: string[] = []; 
  try { 
    recommendedIds = JSON.parse(post.recommended_products || '[]'); 
    if (!Array.isArray(recommendedIds)) recommendedIds = []; 
  } catch { 
    recommendedIds = []; 
  } 

  let recommendedProducts: any[] = [];
  if (recommendedIds.length > 0) {
    const placeholders = recommendedIds.map(() => '?').join(',');
    recommendedProducts = db.prepare(`SELECT * FROM products WHERE id IN (${placeholders}) AND is_active = 1`).all(...recommendedIds);
  }

  const relatedPosts = db.prepare(`
    SELECT *
    FROM blog_posts 
    WHERE category_slug = ? AND slug != ? AND is_published = 1 
    LIMIT 3
  `).all(post.category_slug, slug);

  res.json({
    success: true,
    data: {
      post: formatBlogPost(post),
      recommendedProducts: recommendedProducts.map(formatProduct),
      relatedPosts: relatedPosts.map(formatBlogPost)
    }
  });
});

export default router;
