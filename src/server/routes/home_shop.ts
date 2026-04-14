import { Router } from 'express'; 
import sql from '../db.js'; 
import { v4 as uuidv4 } from 'uuid'; 
import { adminLimit, checkAdmin } from '../middleware/admin.js'; 
import { z } from 'zod';
import { sendInternalError } from '../utils/http.js';

const router = Router(); 
router.use(adminLimit); 

const shopCategorySchema = z.object({
  title: z.string().min(1).max(255),
  slug: z.string().min(1).max(255),
  icon: z.string().optional().nullable(),
  sub_categories: z.array(z.string()).optional()
});

const moodSchema = z.object({
  name: z.string().min(1).max(255),
  slug: z.string().min(1).max(255),
  vibe: z.string().optional().nullable(),
  image: z.string().url(),
  count: z.string().optional().nullable(),
  linked_shop_category_id: z.string().optional().nullable()
});

const findHereSchema = z.object({
  title: z.string().min(1).max(255),
  image: z.string().url(),
  description: z.string().max(1000).optional().nullable(),
  linked_blog_category_slug: z.string().optional().nullable()
});

// --- Shop Categories ---
router.get('/admin/shop-categories', checkAdmin, async (req, res) => { 
  try { 
    const categories = await sql`SELECT * FROM shop_categories ORDER BY created_at DESC`; 
    res.json({ success: true, data: categories }); 
  } catch (e: any) { 
    console.error('Fetch shop categories error:', e);
    sendInternalError(res, 'Failed to fetch shop categories');
  } 
}); 

router.post('/admin/shop-categories', checkAdmin, async (req, res) => { 
  const validation = shopCategorySchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ success: false, error: validation.error.issues[0].message });
  }
  const { title, slug, icon, sub_categories = [] } = validation.data; 
  try { 
    const id = uuidv4(); 
    const subJson = JSON.stringify(sub_categories); 
    await sql` 
      INSERT INTO shop_categories (id, title, slug, icon, sub_categories) 
      VALUES (${id}, ${title}, ${slug}, ${icon || null}, ${subJson}::jsonb) 
    `; 
    const rows = await sql`SELECT * FROM shop_categories WHERE id = ${id}`; 
    res.status(201).json({ success: true, data: rows[0] }); 
  } catch (e: any) { 
    if (e.code === '23505') return res.status(409).json({ success: false, error: 'Slug already exists' }); 
    res.status(500).json({ success: false, error: 'Database error' }); 
  } 
}); 

router.put('/admin/shop-categories/:id', checkAdmin, async (req, res) => { 
  const { id } = req.params; 
  const validation = shopCategorySchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ success: false, error: validation.error.issues[0].message });
  }
  const { title, slug, icon, sub_categories = [] } = validation.data; 
  try { 
    const subJson = JSON.stringify(sub_categories); 
    await sql` 
      UPDATE shop_categories SET title = ${title}, slug = ${slug}, icon = ${icon || null}, sub_categories = ${subJson}::jsonb 
      WHERE id = ${id} 
    `; 
    const rows = await sql`SELECT * FROM shop_categories WHERE id = ${id}`; 
    res.json({ success: true, data: rows[0] }); 
  } catch (e: any) { res.status(500).json({ success: false, error: 'Database error' }); } 
}); 

router.delete('/admin/shop-categories/:id', checkAdmin, async (req, res) => { 
  const { id } = req.params; 
  try { 
    await sql`DELETE FROM shop_categories WHERE id = ${id}`; 
    res.json({ success: true }); 
  } catch (e: any) { res.status(500).json({ success: false, error: 'Database error' }); } 
}); 

// Public route for shop categories
router.get('/shop-categories', async (req, res) => { 
  try { 
    const categories = await sql`SELECT * FROM shop_categories ORDER BY title ASC`; 
    res.json({ success: true, data: categories }); 
  } catch (e: any) { res.status(500).json({ success: false, error: 'Database error' }); } 
}); 

// --- Home Mood Categories ---
router.get('/admin/moods', checkAdmin, async (req, res) => { 
  try { 
    const moods = await sql`SELECT * FROM home_mood_categories ORDER BY created_at DESC`; 
    res.json({ success: true, data: moods }); 
  } catch (e: any) { 
    console.error('Fetch moods error:', e);
    sendInternalError(res, 'Failed to fetch moods');
  } 
}); 

router.post('/admin/moods', checkAdmin, async (req, res) => { 
  const validation = moodSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ success: false, error: validation.error.issues[0].message });
  }
  const { name, slug, vibe, image, count, linked_shop_category_id } = validation.data; 
  try { 
    const id = uuidv4(); 
    await sql` 
      INSERT INTO home_mood_categories (id, name, slug, vibe, image, count, linked_shop_category_id) 
      VALUES (${id}, ${name}, ${slug}, ${vibe || null}, ${image}, ${count || null}, ${linked_shop_category_id || null}) 
    `; 
    const rows = await sql`SELECT * FROM home_mood_categories WHERE id = ${id}`; 
    res.status(201).json({ success: true, data: rows[0] }); 
  } catch (e: any) { res.status(500).json({ success: false, error: 'Database error' }); } 
}); 

router.put('/admin/moods/:id', checkAdmin, async (req, res) => { 
  const { id } = req.params; 
  const validation = moodSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ success: false, error: validation.error.issues[0].message });
  }
  const { name, slug, vibe, image, count, linked_shop_category_id } = validation.data; 
  try { 
    await sql` 
      UPDATE home_mood_categories SET name = ${name}, slug = ${slug}, vibe = ${vibe || null}, 
      image = ${image}, count = ${count || null}, linked_shop_category_id = ${linked_shop_category_id || null} 
      WHERE id = ${id} 
    `; 
    const rows = await sql`SELECT * FROM home_mood_categories WHERE id = ${id}`; 
    res.json({ success: true, data: rows[0] }); 
  } catch (e: any) { res.status(500).json({ success: false, error: 'Database error' }); } 
}); 

router.delete('/admin/moods/:id', checkAdmin, async (req, res) => { 
  const { id } = req.params; 
  try { 
    await sql`DELETE FROM home_mood_categories WHERE id = ${id}`; 
    res.json({ success: true }); 
  } catch (e: any) { res.status(500).json({ success: false, error: 'Database error' }); } 
}); 

// Public route for moods
router.get('/moods', async (req, res) => { 
  try { 
    const moodsData = await sql`
      SELECT m.*, c.title as linked_category_title 
      FROM home_mood_categories m 
      LEFT JOIN shop_categories c ON m.linked_shop_category_id = c.id 
      ORDER BY m.created_at ASC
    `;
    res.json({ success: true, data: moodsData }); 
  } catch (e: any) { res.status(500).json({ success: false, error: 'Database error' }); } 
}); 

// --- Home Find Here Categories ---
router.get('/admin/find-here', checkAdmin, async (req, res) => { 
  try { 
    const items = await sql`SELECT * FROM home_find_here_categories ORDER BY created_at DESC`; 
    res.json({ success: true, data: items }); 
  } catch (e: any) { 
    console.error('Fetch find-here items error:', e);
    sendInternalError(res, 'Failed to fetch find-here items');
  } 
}); 

router.post('/admin/find-here', checkAdmin, async (req, res) => { 
  const validation = findHereSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ success: false, error: validation.error.issues[0].message });
  }
  const { title, image, description, linked_blog_category_slug } = validation.data; 
  try { 
    const id = uuidv4(); 
    await sql` 
      INSERT INTO home_find_here_categories (id, title, image, description, linked_blog_category_slug) 
      VALUES (${id}, ${title}, ${image}, ${description || null}, ${linked_blog_category_slug || null}) 
    `; 
    const rows = await sql`SELECT * FROM home_find_here_categories WHERE id = ${id}`; 
    res.status(201).json({ success: true, data: rows[0] }); 
  } catch (e: any) { res.status(500).json({ success: false, error: 'Database error' }); } 
}); 

router.put('/admin/find-here/:id', checkAdmin, async (req, res) => { 
  const { id } = req.params; 
  const validation = findHereSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ success: false, error: validation.error.issues[0].message });
  }
  const { title, image, description, linked_blog_category_slug } = validation.data; 
  try { 
    await sql` 
      UPDATE home_find_here_categories SET title = ${title}, image = ${image}, 
      description = ${description || null}, linked_blog_category_slug = ${linked_blog_category_slug || null} 
      WHERE id = ${id} 
    `; 
    const rows = await sql`SELECT * FROM home_find_here_categories WHERE id = ${id}`; 
    res.json({ success: true, data: rows[0] }); 
  } catch (e: any) { res.status(500).json({ success: false, error: 'Database error' }); } 
}); 

router.delete('/admin/find-here/:id', checkAdmin, async (req, res) => { 
  const { id } = req.params; 
  try { 
    await sql`DELETE FROM home_find_here_categories WHERE id = ${id}`; 
    res.json({ success: true }); 
  } catch (e: any) { res.status(500).json({ success: false, error: 'Database error' }); } 
}); 

// Public route for find-here
router.get('/find-here', async (req, res) => { 
  try { 
    const items = await sql`SELECT * FROM home_find_here_categories ORDER BY created_at ASC`; 
    res.json({ success: true, data: items }); 
  } catch (e: any) { res.status(500).json({ success: false, error: 'Database error' }); } 
}); 

// --- Site Config ---
router.get('/config', async (req, res) => {
  try {
    const configs = await sql`SELECT * FROM site_config`;
    const configMap: Record<string, string> = {};
    configs.forEach(c => configMap[c.key] = c.value);
    res.json({ success: true, data: configMap });
  } catch (e: any) {
    console.error('Fetch site config error:', e);
    sendInternalError(res, 'Failed to fetch site config');
  }
});

const siteConfigSchema = z.record(z.string(), z.string());

router.post('/admin/config', checkAdmin, async (req, res) => {
  const validation = siteConfigSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ success: false, error: 'Invalid configuration data' });
  }
  const configs = validation.data;
  try {
    for (const [key, value] of Object.entries(configs)) {
      await sql`
        INSERT INTO site_config (key, value)
        VALUES (${key}, ${value as string})
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
      `;
    }
    res.json({ success: true });
  } catch (e: any) { res.status(500).json({ success: false, error: 'Database error' }); }
});

export default router; 
