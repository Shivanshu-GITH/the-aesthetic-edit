import { Router } from 'express'; 
import sql from '../db.js'; 
import { v4 as uuidv4 } from 'uuid'; 
import { adminLimit, checkAdmin } from '../middleware/admin.js';
import { z } from 'zod';
import { rateLimit } from 'express-rate-limit';

const router = Router(); 
router.use(adminLimit); 

const productSchema = z.object({
  title: z.string().min(1).max(255),
  price: z.number().min(0),
  image: z.string().url(),
  images: z.array(z.string().url()).optional(),
  category: z.string().min(1),
  subCategory: z.string().min(1),
  vibes: z.array(z.string()).min(1),
  affiliateUrl: z.string().url(),
  retailer: z.string().max(100).optional().nullable(),
  description: z.string().max(5000).optional().nullable(),
  isActive: z.boolean().optional()
});

const formatProduct = (p: any) => ({ 
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
  isActive: p.is_active === true || p.is_active === 1 
}); 

const affiliateClickLimit = rateLimit({ 
  windowMs: 1 * 60 * 1000, 
  max: 20, 
  message: { success: false, error: 'Too many clicks, please try again later' } 
}); 

router.get('/admin/all', checkAdmin, async (req, res) => { 
  try { 
    const products = await sql`SELECT * FROM products ORDER BY created_at DESC`; 
    res.json({ success: true, data: products.map(formatProduct) }); 
  } catch (error: any) { 
    console.error(error); 
    res.status(500).json({ success: false, error: 'Database error' }); 
  } 
}); 

router.post('/admin/create', checkAdmin, async (req, res) => { 
  const validation = productSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ success: false, error: validation.error.issues[0].message });
  }
  const { title, price, image, images = [], category, subCategory, vibes, affiliateUrl, retailer, description, isActive = true } = validation.data; 
  try { 
    const id = uuidv4(); 
    const vibesJson = JSON.stringify(vibes); 
    const imagesJson = JSON.stringify(images.length > 0 ? images : [image]);
    await sql` 
      INSERT INTO products (id, title, price, image, images, category, sub_category, vibes, affiliate_url, retailer, description, is_active) 
      VALUES (${id}, ${title}, ${price}, ${image}, ${imagesJson}::jsonb, ${category}, ${subCategory}, ${vibesJson}::jsonb, ${affiliateUrl}, ${retailer || null}, ${description || null}, ${isActive}) 
    `; 
    const rows = await sql`SELECT * FROM products WHERE id = ${id}`; 
    res.status(201).json({ success: true, data: formatProduct(rows[0]) }); 
  } catch (error: any) { 
    console.error(error); 
    res.status(500).json({ success: false, error: 'Failed to create product' }); 
  } 
}); 

router.put('/admin/:id', checkAdmin, async (req, res) => { 
  const { id } = req.params; 
  const validation = productSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ success: false, error: validation.error.issues[0].message });
  }
  const { title, price, image, images = [], category, subCategory, vibes, affiliateUrl, retailer, description, isActive } = validation.data; 
  try { 
    const existing = await sql`SELECT 1 FROM products WHERE id = ${id}`; 
    if (existing.length === 0) { 
      return res.status(404).json({ success: false, error: 'Product not found' }); 
    } 
    const vibesJson = JSON.stringify(vibes); 
    const imagesJson = JSON.stringify(images.length > 0 ? images : [image]);
    await sql` 
      UPDATE products 
      SET title = ${title}, price = ${price}, image = ${image}, images = ${imagesJson}::jsonb, category = ${category}, 
          sub_category = ${subCategory}, vibes = ${vibesJson}::jsonb, affiliate_url = ${affiliateUrl}, 
          retailer = ${retailer || null}, description = ${description || null}, is_active = ${isActive} 
       WHERE id = ${id} 
    `; 
    const rows = await sql`SELECT * FROM products WHERE id = ${id}`; 
    res.json({ success: true, data: formatProduct(rows[0]) }); 
  } catch (error: any) { 
    console.error(error); 
    res.status(500).json({ success: false, error: 'Failed to update product' }); 
  } 
}); 

router.delete('/admin/:id', checkAdmin, async (req, res) => { 
  const { id } = req.params; 
  try { 
    await sql`DELETE FROM products WHERE id = ${id}`; 
    res.json({ success: true }); 
  } catch (error: any) { 
    console.error(error); 
    res.status(500).json({ success: false, error: 'Failed to delete product' }); 
  } 
}); 

router.patch('/:id', checkAdmin, async (req, res) => { 
  const { id } = req.params; 
  const { affiliateUrl } = req.body; 
  try { 
    if (affiliateUrl !== undefined) { 
      await sql`UPDATE products SET affiliate_url = ${affiliateUrl} WHERE id = ${id}`; 
    } 
    const rows = await sql`SELECT * FROM products WHERE id = ${id}`; 
    res.json({ success: true, data: rows[0] }); 
  } catch (error: any) { 
    console.error(error); 
    res.status(500).json({ success: false, error: 'Database error' }); 
  } 
}); 

router.patch('/:id/toggle-active', checkAdmin, async (req, res) => { 
  const { id } = req.params; 
  try { 
    const rows = await sql`SELECT is_active FROM products WHERE id = ${id}`; 
    if (rows.length === 0) { 
      return res.status(404).json({ success: false, error: 'Product not found' }); 
    } 
    const newStatus = !rows[0].is_active; 
    await sql`UPDATE products SET is_active = ${newStatus} WHERE id = ${id}`; 
    res.json({ success: true, data: { isActive: newStatus } }); 
  } catch (error: any) { 
    console.error(error); 
    res.status(500).json({ success: false, error: 'Database error' }); 
  } 
}); 

router.get('/', async (req, res) => { 
  const { category, subCategory, vibe, maxPrice, search, page = '1', limit = '12' } = req.query; 
  const offset = (Number(page) - 1) * Number(limit); 

  try { 
    const categoryFilter = category || null;
    const subCategoryFilter = subCategory || null;
    const vibeFilter = vibe ? JSON.stringify([vibe]) : null;
    const maxPriceFilter = maxPrice ? Number(maxPrice) : null;
    const searchFilter = search ? `%${search}%` : null;

    const countRows = await sql`
      SELECT COUNT(*) as total FROM products 
      WHERE is_active = true 
        AND (${categoryFilter}::text IS NULL OR category = ${categoryFilter})
        AND (${subCategoryFilter}::text IS NULL OR sub_category = ${subCategoryFilter})
        AND (${vibeFilter}::jsonb IS NULL OR vibes::jsonb @> ${vibeFilter}::jsonb)
        AND (${maxPriceFilter}::real IS NULL OR price <= ${maxPriceFilter})
        AND (${searchFilter}::text IS NULL OR (title ILIKE ${searchFilter} OR description ILIKE ${searchFilter}))
    `;
    const total = Number(countRows[0].total); 

    const products = await sql`
      SELECT * FROM products 
      WHERE is_active = true 
        AND (${categoryFilter}::text IS NULL OR category = ${categoryFilter})
        AND (${subCategoryFilter}::text IS NULL OR sub_category = ${subCategoryFilter})
        AND (${vibeFilter}::jsonb IS NULL OR vibes::jsonb @> ${vibeFilter}::jsonb)
        AND (${maxPriceFilter}::real IS NULL OR price <= ${maxPriceFilter})
        AND (${searchFilter}::text IS NULL OR (title ILIKE ${searchFilter} OR description ILIKE ${searchFilter}))
      ORDER BY created_at DESC 
      LIMIT ${Number(limit)} OFFSET ${offset}
    `; 

    const totalPages = Math.ceil(total / Number(limit)); 
    res.json({ 
      success: true, 
      data: products.map(formatProduct), 
      meta: { total, page: Number(page), limit: Number(limit), totalPages } 
    }); 
  } catch (error: any) { 
    console.error(error); 
    res.status(500).json({ success: false, error: 'Database error' }); 
  } 
}); 

router.get('/:id', async (req, res) => { 
  const { id } = req.params; 
  try { 
    const rows = await sql`SELECT * FROM products WHERE id = ${id} AND is_active = true`; 
    if (rows.length === 0) { 
      return res.status(404).json({ success: false, error: 'Product not found' }); 
    } 
    const product = rows[0]; 
    const related = await sql` 
      SELECT * FROM products WHERE category = ${product.category} AND id != ${id} AND is_active = true LIMIT 4 
    `; 
    res.json({ 
      success: true, 
      data: { product: formatProduct(product), related: related.map(formatProduct) } 
    }); 
  } catch (error: any) { 
    console.error(error); 
    res.status(500).json({ success: false, error: 'Database error' }); 
  } 
}); 

router.post('/:id/affiliate-click', affiliateClickLimit, async (req, res) => { 
  const { id } = req.params; 
  try { 
    const rows = await sql`SELECT affiliate_url FROM products WHERE id = ${id}`; 
    if (rows.length === 0) { 
      return res.status(404).json({ success: false, error: 'Product not found' }); 
    } 
    await sql` 
      INSERT INTO affiliate_clicks (id, product_id, affiliate_url, user_agent, referrer) 
      VALUES (${uuidv4()}, ${id}, ${rows[0].affiliate_url}, ${req.get('user-agent') || null}, ${req.get('referrer') || null}) 
    `; 
    res.json({ success: true, data: { affiliateUrl: rows[0].affiliate_url } }); 
  } catch (error: any) { 
    console.error(error); 
    res.status(500).json({ success: false, error: 'Database error' }); 
  } 
}); 

router.post('/:id/pinterest-save', async (req, res) => { 
  const { id } = req.params; 
  try { 
    const exists = await sql`SELECT 1 FROM products WHERE id = ${id}`; 
    if (exists.length === 0) { 
      return res.status(404).json({ success: false, error: 'Product not found' }); 
    } 
    await sql` 
      INSERT INTO pinterest_saves (id, product_id, user_agent) 
      VALUES (${uuidv4()}, ${id}, ${req.get('user-agent') || null}) 
    `; 
    res.json({ success: true, data: { success: true } }); 
  } catch (error: any) { 
    console.error(error); 
    res.status(500).json({ success: false, error: 'Database error' }); 
  } 
}); 

export default router; 
