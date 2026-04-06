import { Router } from 'express'; 
import sql from '../db.js'; 
import { v4 as uuidv4 } from 'uuid'; 
import { adminLimit, checkAdmin } from '../middleware/admin.js';
import { z } from 'zod';

const router = Router(); 
router.use(adminLimit); 

const blogPostSchema = z.object({
  slug: z.string().min(1).max(255),
  categorySlug: z.string().min(1),
  title: z.string().min(1).max(255),
  excerpt: z.string().min(1).max(1000),
  content: z.string().min(1),
  image: z.string().url(),
  images: z.array(z.string().url()).optional(),
  category: z.string().min(1),
  author: z.string().min(1).max(100),
  date: z.string(),
  readTime: z.string(),
  recommendedProducts: z.array(z.string()).optional(),
  relatedPosts: z.array(z.string()).optional(),
  isPublished: z.boolean().optional()
});

const blogCategorySchema = z.object({
  title: z.string().min(1).max(255),
  slug: z.string().min(1).max(255),
  image: z.string().url(),
  description: z.string().max(2000).optional().nullable()
});

const formatProduct = (p: any) => ({ 
  id: p.id, title: p.title, price: p.price, image: p.image, category: p.category, 
  subCategory: p.sub_category, vibe: Array.isArray(p.vibes) ? p.vibes : [], 
  affiliateUrl: p.affiliate_url, retailer: p.retailer, description: p.description, 
  isActive: p.is_active === true || p.is_active === 1 
}); 

const formatBlogPost = (b: any) => ({ 
  id: b.id, slug: b.slug, categorySlug: b.category_slug, title: b.title, 
  excerpt: b.excerpt, content: b.content, image: b.image, 
  images: Array.isArray(b.images) ? b.images : [],
  category: b.category, 
  author: b.author, date: b.date, readTime: b.read_time, 
  recommendedProducts: Array.isArray(b.recommended_products) ? b.recommended_products : [], 
  relatedPosts: Array.isArray(b.related_posts) ? b.related_posts : [],
  isPublished: b.is_published === true || b.is_published === 1 
}); 

let categoriesCache: any = null; 
let cacheTimestamp = 0; 
const CACHE_TTL = 5 * 60 * 1000; 

router.get('/admin/posts', checkAdmin, async (req, res) => { 
  try { 
    const posts = await sql`SELECT * FROM blog_posts ORDER BY created_at DESC`; 
    res.json({ success: true, data: posts.map(formatBlogPost) }); 
  } catch (e: any) { res.status(500).json({ success: false, error: 'Database error' }); } 
}); 

router.post('/admin/posts', checkAdmin, async (req, res) => { 
  const validation = blogPostSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ success: false, error: validation.error.issues[0].message });
  }
  const { slug, categorySlug, title, excerpt, content, image, images = [], category, author, date, readTime, recommendedProducts = [], relatedPosts = [], isPublished = true } = validation.data; 
  try { 
    const id = uuidv4(); 
    const finalImages = Array.isArray(images) && images.length > 0 ? images : [image];
    const imagesJson = JSON.stringify(finalImages);
    const recommendedProductsJson = JSON.stringify(recommendedProducts || []);
    const relatedPostsJson = JSON.stringify(relatedPosts || []);

    await sql` 
      INSERT INTO blog_posts (id, slug, category_slug, title, excerpt, content, image, images, category, author, date, read_time, recommended_products, related_posts, is_published) 
      VALUES (
        ${id}, ${slug}, ${categorySlug}, ${title}, ${excerpt}, ${content}, ${image}, 
        ${imagesJson}::jsonb, ${category}, ${author}, ${date}, ${readTime}, 
        ${recommendedProductsJson}::jsonb, ${relatedPostsJson}::jsonb, ${isPublished ?? true}
      ) 
    `; 
    const rows = await sql`SELECT * FROM blog_posts WHERE id = ${id}`; 
    res.status(201).json({ success: true, data: formatBlogPost(rows[0]) }); 
  } catch (e: any) { 
    console.error('Error creating blog post:', e);
    if (e.code === '23505') return res.status(409).json({ success: false, error: 'Slug already exists' }); 
    res.status(500).json({ success: false, error: 'Database error: ' + e.message }); 
  } 
}); 

router.put('/admin/posts/:id', checkAdmin, async (req, res) => { 
  const { id } = req.params; 
  const validation = blogPostSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ success: false, error: validation.error.issues[0].message });
  }
  const { slug, categorySlug, title, excerpt, content, image, images = [], category, author, date, readTime, recommendedProducts = [], relatedPosts = [], isPublished } = validation.data; 
  try { 
    const existing = await sql`SELECT 1 FROM blog_posts WHERE id = ${id}`; 
    if (existing.length === 0) return res.status(404).json({ success: false, error: 'Post not found' }); 
    const finalImages = Array.isArray(images) && images.length > 0 ? images : [image];
    const imagesJson = JSON.stringify(finalImages);
    const recommendedProductsJson = JSON.stringify(recommendedProducts || []);
    const relatedPostsJson = JSON.stringify(relatedPosts || []);
 
    await sql` 
      UPDATE blog_posts SET slug = ${slug}, category_slug = ${categorySlug}, title = ${title}, excerpt = ${excerpt}, 
      content = ${content}, image = ${image}, images = ${imagesJson}::jsonb, category = ${category}, author = ${author}, date = ${date}, 
      read_time = ${readTime}, recommended_products = ${recommendedProductsJson}::jsonb, related_posts = ${relatedPostsJson}::jsonb, is_published = ${isPublished ?? true} 
      WHERE id = ${id} 
    `; 
    const rows = await sql`SELECT * FROM blog_posts WHERE id = ${id}`; 
    res.json({ success: true, data: formatBlogPost(rows[0]) }); 
  } catch (e: any) { 
    console.error('Error updating blog post:', e);
    res.status(500).json({ success: false, error: 'Database error: ' + e.message }); 
  } 
}); 

router.delete('/admin/posts/:id', checkAdmin, async (req, res) => { 
  const { id } = req.params; 
  try { 
    await sql`DELETE FROM blog_posts WHERE id = ${id}`; 
    res.json({ success: true }); 
  } catch (e: any) { res.status(500).json({ success: false, error: 'Database error' }); } 
}); 

router.get('/admin/categories', checkAdmin, async (req, res) => { 
  try { 
    const categories = await sql`SELECT * FROM blog_categories ORDER BY title ASC`; 
    res.json({ success: true, data: categories }); 
  } catch (e: any) { res.status(500).json({ success: false, error: 'Database error' }); } 
}); 

router.post('/admin/categories', checkAdmin, async (req, res) => { 
  const validation = blogCategorySchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ success: false, error: validation.error.issues[0].message });
  }
  const { title, slug, image, description } = validation.data; 
  try { 
    const id = uuidv4(); 
    await sql`INSERT INTO blog_categories (id, title, slug, image, description) VALUES (${id}, ${title}, ${slug}, ${image}, ${description || null})`; 
    const rows = await sql`SELECT * FROM blog_categories WHERE id = ${id}`; 
    res.status(201).json({ success: true, data: rows[0] }); 
  } catch (e: any) { 
    if (e.code === '23505') return res.status(409).json({ success: false, error: 'Slug already exists' }); 
    res.status(500).json({ success: false, error: 'Database error' }); 
  } 
}); 

router.put('/admin/categories/:id', checkAdmin, async (req, res) => { 
  const { id } = req.params; 
  const validation = blogCategorySchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ success: false, error: validation.error.issues[0].message });
  }
  const { title, slug, image, description } = validation.data; 
  try { 
    await sql`UPDATE blog_categories SET title = ${title}, slug = ${slug}, image = ${image}, description = ${description || null} WHERE id = ${id}`;
    const rows = await sql`SELECT * FROM blog_categories WHERE id = ${id}`; 
    res.json({ success: true, data: rows[0] }); 
  } catch (e: any) { res.status(500).json({ success: false, error: 'Database error' }); } 
}); 

router.delete('/admin/categories/:id', checkAdmin, async (req, res) => { 
  const { id } = req.params; 
  try { 
    await sql`DELETE FROM blog_categories WHERE id = ${id}`; 
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
    
    const relatedIds: string[] = Array.isArray(post.related_posts) ? post.related_posts : [];
    let relatedPosts: any[] = [];
    if (relatedIds.length > 0) {
      relatedPosts = await sql`SELECT * FROM blog_posts WHERE id = ANY(${relatedIds}::text[]) AND is_published = true`;
    } else {
      // Fallback to existing category-based related posts if none explicitly linked
      relatedPosts = await sql` 
        SELECT * FROM blog_posts WHERE category_slug = ${post.category_slug} AND slug != ${slug} AND is_published = true LIMIT 3 
      `; 
    }

    res.json({ 
      success: true, 
      data: { post: formatBlogPost(post), recommendedProducts: recommendedProducts.map(formatProduct), relatedPosts: relatedPosts.map(formatBlogPost) } 
    }); 
  } catch (e: any) { res.status(500).json({ success: false, error: 'Database error' }); } 
}); 

export default router; 
