import { Router } from 'express'; 
import sql from '../db.js'; 
import { v4 as uuidv4 } from 'uuid'; 
import { rateLimit } from 'express-rate-limit'; 

const adminLimit = rateLimit({ 
  windowMs: 15 * 60 * 1000, 
  max: 1000, 
  message: { success: false, error: 'Too many requests, please try again later' }, 
  standardHeaders: true, 
  legacyHeaders: false, 
}); 

const router = Router(); 
router.use(adminLimit); 

const formatProduct = (p: any) => ({ 
  id: p.id, title: p.title, price: p.price, image: p.image, category: p.category, 
  subCategory: p.sub_category, vibe: Array.isArray(p.vibes) ? p.vibes : [], 
  affiliateUrl: p.affiliate_url, retailer: p.retailer, description: p.description, 
  isActive: p.is_active === true || p.is_active === 1 
}); 

const formatBlogPost = (b: any) => ({ 
  id: b.id, slug: b.slug, categorySlug: b.category_slug, title: b.title, 
  excerpt: b.excerpt, content: b.content, image: b.image, category: b.category, 
  author: b.author, date: b.date, readTime: b.read_time, 
  recommendedProducts: Array.isArray(b.recommended_products) ? b.recommended_products : [], 
  isPublished: b.is_published === true || b.is_published === 1 
}); 

let categoriesCache: any = null; 
let cacheTimestamp = 0; 
const CACHE_TTL = 5 * 60 * 1000; 

router.get('/admin/posts', async (req, res) => { 
  if (req.get('ADMIN_PASSWORD') !== process.env.ADMIN_PASSWORD) { 
    return res.status(401).json({ success: false, error: 'Unauthorized' }); 
  } 
  try { 
    const posts = await sql`SELECT * FROM blog_posts ORDER BY created_at DESC`; 
    res.json({ success: true, data: posts.map(formatBlogPost) }); 
  } catch (e: any) { res.status(500).json({ success: false, error: 'Database error' }); } 
}); 

router.post('/admin/posts', async (req, res) => { 
  if (req.get('ADMIN_PASSWORD') !== process.env.ADMIN_PASSWORD) { 
    return res.status(401).json({ success: false, error: 'Unauthorized' }); 
  } 
  const { slug, categorySlug, title, excerpt, content, image, category, author, date, readTime, recommendedProducts = [], isPublished = true } = req.body; 
  if (!slug || !categorySlug || !title || !excerpt || !content || !image || !category || !author || !date || !readTime) { 
    return res.status(400).json({ success: false, error: 'Missing required fields' }); 
  } 
  try { 
    const id = uuidv4(); 
    const rpJson = JSON.stringify(Array.isArray(recommendedProducts) ? recommendedProducts : []); 
    await sql` 
      INSERT INTO blog_posts (id, slug, category_slug, title, excerpt, content, image, category, author, date, read_time, recommended_products, is_published) 
      VALUES (${id}, ${slug}, ${categorySlug}, ${title}, ${excerpt}, ${content}, ${image}, ${category}, ${author}, ${date}, ${readTime}, ${rpJson}::jsonb, ${isPublished}) 
    `; 
    const rows = await sql`SELECT * FROM blog_posts WHERE id = ${id}`; 
    res.status(201).json({ success: true, data: formatBlogPost(rows[0]) }); 
  } catch (e: any) { 
    if (e.code === '23505') return res.status(409).json({ success: false, error: 'Slug already exists' }); 
    res.status(500).json({ success: false, error: 'Database error' }); 
  } 
}); 

router.put('/admin/posts/:id', async (req, res) => { 
  if (req.get('ADMIN_PASSWORD') !== process.env.ADMIN_PASSWORD) { 
    return res.status(401).json({ success: false, error: 'Unauthorized' }); 
  } 
  const { id } = req.params; 
  const { slug, categorySlug, title, excerpt, content, image, category, author, date, readTime, recommendedProducts = [], isPublished } = req.body; 
  try { 
    const existing = await sql`SELECT 1 FROM blog_posts WHERE id = ${id}`; 
    if (existing.length === 0) return res.status(404).json({ success: false, error: 'Post not found' }); 
    const rpJson = JSON.stringify(Array.isArray(recommendedProducts) ? recommendedProducts : []); 
    await sql` 
      UPDATE blog_posts SET slug = ${slug}, category_slug = ${categorySlug}, title = ${title}, excerpt = ${excerpt}, 
      content = ${content}, image = ${image}, category = ${category}, author = ${author}, date = ${date}, 
      read_time = ${readTime}, recommended_products = ${rpJson}::jsonb, is_published = ${isPublished} 
      WHERE id = ${id} 
    `; 
    const rows = await sql`SELECT * FROM blog_posts WHERE id = ${id}`; 
    res.json({ success: true, data: formatBlogPost(rows[0]) }); 
  } catch (e: any) { res.status(500).json({ success: false, error: 'Database error' }); } 
}); 

router.delete('/admin/posts/:id', async (req, res) => { 
  if (req.get('ADMIN_PASSWORD') !== process.env.ADMIN_PASSWORD) { 
    return res.status(401).json({ success: false, error: 'Unauthorized' }); 
  } 
  const { id } = req.params; 
  try { 
    const result = await sql`DELETE FROM blog_posts WHERE id = ${id} RETURNING id`; 
    if (result.length === 0) return res.status(404).json({ success: false, error: 'Post not found' }); 
    res.json({ success: true }); 
  } catch (e: any) { res.status(500).json({ success: false, error: 'Database error' }); } 
}); 

router.get('/admin/categories', async (req, res) => { 
  if (req.get('ADMIN_PASSWORD') !== process.env.ADMIN_PASSWORD) { 
    return res.status(401).json({ success: false, error: 'Unauthorized' }); 
  } 
  try { 
    const categories = await sql`SELECT * FROM blog_categories`; 
    res.json({ success: true, data: categories }); 
  } catch (e: any) { res.status(500).json({ success: false, error: 'Database error' }); } 
}); 

router.post('/admin/categories', async (req, res) => { 
  if (req.get('ADMIN_PASSWORD') !== process.env.ADMIN_PASSWORD) { 
    return res.status(401).json({ success: false, error: 'Unauthorized' }); 
  } 
  const { title, slug, image, description } = req.body; 
  if (!title || !slug || !image || !description) { 
    return res.status(400).json({ success: false, error: 'Missing required fields' }); 
  } 
  try { 
    const id = uuidv4(); 
    await sql`INSERT INTO blog_categories (id, title, slug, image, description) VALUES (${id}, ${title}, ${slug}, ${image}, ${description})`; 
    categoriesCache = null; 
    const rows = await sql`SELECT * FROM blog_categories WHERE id = ${id}`; 
    res.status(201).json({ success: true, data: rows[0] }); 
  } catch (e: any) { 
    if (e.code === '23505') return res.status(409).json({ success: false, error: 'Slug already exists' }); 
    res.status(500).json({ success: false, error: 'Database error' }); 
  } 
}); 

router.put('/admin/categories/:id', async (req, res) => { 
  if (req.get('ADMIN_PASSWORD') !== process.env.ADMIN_PASSWORD) { 
    return res.status(401).json({ success: false, error: 'Unauthorized' }); 
  } 
  const { id } = req.params; 
  const { title, slug, image, description } = req.body; 
  try { 
    const existing = await sql`SELECT 1 FROM blog_categories WHERE id = ${id}`; 
    if (existing.length === 0) return res.status(404).json({ success: false, error: 'Category not found' }); 
    await sql`UPDATE blog_categories SET title = ${title}, slug = ${slug}, image = ${image}, description = ${description} WHERE id = ${id}`; 
    categoriesCache = null; 
    const rows = await sql`SELECT * FROM blog_categories WHERE id = ${id}`; 
    res.json({ success: true, data: rows[0] }); 
  } catch (e: any) { res.status(500).json({ success: false, error: 'Database error' }); } 
}); 

router.delete('/admin/categories/:id', async (req, res) => { 
  if (req.get('ADMIN_PASSWORD') !== process.env.ADMIN_PASSWORD) { 
    return res.status(401).json({ success: false, error: 'Unauthorized' }); 
  } 
  const { id } = req.params; 
  try { 
    const result = await sql`DELETE FROM blog_categories WHERE id = ${id} RETURNING id`; 
    if (result.length === 0) return res.status(404).json({ success: false, error: 'Category not found' }); 
    categoriesCache = null; 
    res.json({ success: true }); 
  } catch (e: any) { res.status(500).json({ success: false, error: 'Database error' }); } 
}); 

router.get('/categories', async (req, res) => { 
  const now = Date.now(); 
  if (categoriesCache && (now - cacheTimestamp < CACHE_TTL)) { 
    return res.json({ success: true, data: categoriesCache }); 
  } 
  try { 
    const categories = await sql`SELECT * FROM blog_categories`; 
    categoriesCache = categories; 
    cacheTimestamp = now; 
    res.json({ success: true, data: categories }); 
  } catch (e: any) { res.status(500).json({ success: false, error: 'Database error' }); } 
}); 

router.get('/posts', async (req, res) => { 
  const { categorySlug, page = '1', limit = '9' } = req.query; 
  const offset = (Number(page) - 1) * Number(limit); 
  try { 
    const categorySlugFilter = categorySlug || null; 
    const countRows = await sql`
      SELECT COUNT(*) as total FROM blog_posts 
      WHERE is_published = true 
        AND (${categorySlugFilter}::text IS NULL OR category_slug = ${categorySlugFilter})
    `;
    const total = Number(countRows[0].total); 
    const posts = await sql`
      SELECT id, slug, category_slug, title, excerpt, image, category, author, date, read_time 
      FROM blog_posts 
      WHERE is_published = true 
        AND (${categorySlugFilter}::text IS NULL OR category_slug = ${categorySlugFilter})
      ORDER BY created_at DESC 
      LIMIT ${Number(limit)} OFFSET ${offset}
    `; 
    res.json({ success: true, data: posts.map(formatBlogPost), meta: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) } }); 
  } catch (e: any) { res.status(500).json({ success: false, error: 'Database error' }); } 
}); 

router.get('/posts/:slug', async (req, res) => { 
  const { slug } = req.params; 
  try { 
    const rows = await sql`SELECT * FROM blog_posts WHERE slug = ${slug} AND is_published = true`; 
    if (rows.length === 0) return res.status(404).json({ success: false, error: 'Post not found' }); 
    const post = rows[0]; 
    const recommendedIds: string[] = Array.isArray(post.recommended_products) ? post.recommended_products : []; 
    let recommendedProducts: any[] = []; 
    if (recommendedIds.length > 0) { 
      recommendedProducts = await sql`SELECT * FROM products WHERE id = ANY(${recommendedIds}::text[]) AND is_active = true`; 
    } 
    const relatedPosts = await sql` 
      SELECT * FROM blog_posts WHERE category_slug = ${post.category_slug} AND slug != ${slug} AND is_published = true LIMIT 3 
    `; 
    res.json({ 
      success: true, 
      data: { post: formatBlogPost(post), recommendedProducts: recommendedProducts.map(formatProduct), relatedPosts: relatedPosts.map(formatBlogPost) } 
    }); 
  } catch (e: any) { res.status(500).json({ success: false, error: 'Database error' }); } 
}); 

export default router; 
