import { Router } from 'express'; 
import sql from '../db.js'; 
import { v4 as uuidv4 } from 'uuid'; 
import { adminLimit, checkAdmin } from '../middleware/admin.js';
import { z } from 'zod';
import { rateLimit } from 'express-rate-limit';
import { formatProduct } from '../utils/formatters.js';
import { paginationQuerySchema, sendInternalError } from '../utils/http.js';

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
  isActive: z.boolean().optional(),
  isTrending: z.boolean().optional(),
  isTopRated: z.boolean().optional(),
  relatedProducts: z.array(z.string()).optional(),
  sectionHeading: z.string().max(255).optional().nullable(),
  sectionSubheading: z.string().max(255).optional().nullable(),
  sectionDescription: z.string().max(1000).optional().nullable(),
  sectionCtaText: z.string().max(100).optional().nullable()
});

const patchProductSchema = z.object({ 
  affiliateUrl: z.string().url().optional(), 
  isActive: z.boolean().optional(), 
  isTrending: z.boolean().optional(),
  isTopRated: z.boolean().optional(),
  relatedProducts: z.array(z.string()).optional()
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
    console.error('Fetch admin products error:', error); 
    sendInternalError(res, 'Failed to fetch products');
  } 
}); 

router.post('/admin/create', checkAdmin, async (req, res) => { 
  const validation = productSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ success: false, error: validation.error.issues[0].message });
  }
  
  const { 
    title, price, image, images = [], category, subCategory, vibes = [], 
    affiliateUrl, retailer, description, isActive = true, 
    isTrending = false, isTopRated = false, relatedProducts = [],
    sectionHeading, sectionSubheading, sectionDescription, sectionCtaText
  } = validation.data; 

  try { 
    const vibesJson = JSON.stringify(vibes); 
    const imagesJson = JSON.stringify(Array.isArray(images) && images.length > 0 ? images : [image]);
    const relatedProductsJson = JSON.stringify(relatedProducts || []);
    const id = uuidv4(); 
    await sql` 
      INSERT INTO products (
        id, title, price, image, images, category, sub_category, vibes, 
        affiliate_url, retailer, description, is_active, is_trending, 
        is_top_rated, related_products, section_heading, section_subheading, 
        section_description, section_cta_text
      ) 
      VALUES (
        ${id}, ${title}, ${price}, ${image}, ${imagesJson}::jsonb, ${category}, 
        ${subCategory}, ${vibesJson}::jsonb, ${affiliateUrl}, ${retailer || null}, 
        ${description || null}, ${isActive}, ${isTrending}, ${isTopRated}, 
        ${relatedProductsJson}::jsonb, ${sectionHeading || null}, 
        ${sectionSubheading || null}, ${sectionDescription || null}, 
        ${sectionCtaText || null}
      ) 
    `; 
    const rows = await sql`SELECT * FROM products WHERE id = ${id}`; 
    res.status(201).json({ success: true, data: formatProduct(rows[0]) }); 
  } catch (error: any) { 
    console.error('Create product error:', error); 
    sendInternalError(res, 'Failed to create product');
  } 
}); 

router.put('/admin/:id', checkAdmin, async (req, res) => { 
  const { id } = req.params; 
  const validation = productSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ success: false, error: validation.error.issues[0].message });
  }
  const { 
    title, price, image, images = [], category, subCategory, vibes = [], 
    affiliateUrl, retailer, description, isActive, isTrending, isTopRated, 
    relatedProducts = [], sectionHeading, sectionSubheading, 
    sectionDescription, sectionCtaText 
  } = validation.data; 
  try { 
    const existing = await sql`SELECT 1 FROM products WHERE id = ${id}`; 
    if (existing.length === 0) { 
      return res.status(404).json({ success: false, error: 'Product not found' }); 
    } 
    const vibesJson = JSON.stringify(vibes || []); 
    const imagesJson = JSON.stringify(Array.isArray(images) && images.length > 0 ? images : [image]);
    const relatedProductsJson = JSON.stringify(relatedProducts || []);
    await sql` 
      UPDATE products 
      SET title = ${title}, price = ${price}, image = ${image}, images = ${imagesJson}::jsonb, category = ${category}, 
          sub_category = ${subCategory}, vibes = ${vibesJson}::jsonb, affiliate_url = ${affiliateUrl}, 
          retailer = ${retailer || null}, description = ${description || null}, is_active = ${isActive}, 
          is_trending = ${isTrending}, is_top_rated = ${isTopRated}, related_products = ${relatedProductsJson}::jsonb,
          section_heading = ${sectionHeading || null}, section_subheading = ${sectionSubheading || null},
          section_description = ${sectionDescription || null}, section_cta_text = ${sectionCtaText || null}
       WHERE id = ${id} 
    `; 
    const rows = await sql`SELECT * FROM products WHERE id = ${id}`; 
    res.json({ success: true, data: formatProduct(rows[0]) }); 
  } catch (error: any) { 
    console.error('Update product error:', error); 
    sendInternalError(res, 'Failed to update product');
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
  const validation = patchProductSchema.safeParse(req.body); 
  if (!validation.success) { 
    return res.status(400).json({ success: false, error: validation.error.issues[0].message }); 
  } 
  const { affiliateUrl, isActive, isTrending, isTopRated } = validation.data; 
  try { 
    if (affiliateUrl !== undefined) { 
      await sql`UPDATE products SET affiliate_url = ${affiliateUrl} WHERE id = ${id}`; 
    } 
    if (isActive !== undefined) { 
      await sql`UPDATE products SET is_active = ${isActive} WHERE id = ${id}`; 
    } 
    if (isTrending !== undefined) { 
      await sql`UPDATE products SET is_trending = ${isTrending} WHERE id = ${id}`; 
    } 
    if (isTopRated !== undefined) { 
      await sql`UPDATE products SET is_top_rated = ${isTopRated} WHERE id = ${id}`; 
    } 
    const rows = await sql`SELECT * FROM products WHERE id = ${id}`; 
    if (rows.length === 0) { 
      return res.status(404).json({ success: false, error: 'Product not found' }); 
    } 
    res.json({ success: true, data: formatProduct(rows[0]) }); 
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
  const { category, subCategory, vibe, maxPrice, search, topRated, trending } = req.query;
  const paginationValidation = paginationQuerySchema.safeParse(req.query);
  if (!paginationValidation.success) {
    return res.status(400).json({ success: false, error: paginationValidation.error.issues[0].message });
  }
  const { page, limit } = paginationValidation.data;
  const offset = (page - 1) * limit;

  try { 
    const categoryFilter = category || null;
    const subCategoryFilter = subCategory || null;
    const vibeFilter = vibe ? JSON.stringify([vibe]) : null;
    const maxPriceFilter = maxPrice ? Number(maxPrice) : null;
    const searchFilter = search ? `%${search}%` : null;
    const topRatedFilter = topRated === 'true';
    const trendingFilter = trending === 'true';

    const countRows = await sql`
      SELECT COUNT(*) as total FROM products 
      WHERE is_active = true 
        AND (${categoryFilter}::text IS NULL OR category = ${categoryFilter})
        AND (${subCategoryFilter}::text IS NULL OR sub_category = ${subCategoryFilter})
        AND (${vibeFilter}::jsonb IS NULL OR vibes::jsonb @> ${vibeFilter}::jsonb)
        AND (${maxPriceFilter}::real IS NULL OR price <= ${maxPriceFilter})
        AND (${searchFilter}::text IS NULL OR (title ILIKE ${searchFilter} OR description ILIKE ${searchFilter}))
        AND (${trendingFilter}::boolean IS FALSE OR is_trending = true)
        AND (${topRatedFilter}::boolean IS FALSE OR is_top_rated = true)
    `;
    const total = Number(countRows[0].total); 

    const products = await sql`
      SELECT p.* FROM products p
      WHERE p.is_active = true 
        AND (${categoryFilter}::text IS NULL OR p.category = ${categoryFilter})
        AND (${subCategoryFilter}::text IS NULL OR p.sub_category = ${subCategoryFilter})
        AND (${vibeFilter}::jsonb IS NULL OR p.vibes::jsonb @> ${vibeFilter}::jsonb)
        AND (${maxPriceFilter}::real IS NULL OR p.price <= ${maxPriceFilter})
        AND (${searchFilter}::text IS NULL OR (p.title ILIKE ${searchFilter} OR p.description ILIKE ${searchFilter}))
        AND (${trendingFilter}::boolean IS FALSE OR p.is_trending = true)
        AND (${topRatedFilter}::boolean IS FALSE OR p.is_top_rated = true)
      ORDER BY 
        CASE WHEN ${topRatedFilter} THEN (SELECT COUNT(*) FROM affiliate_clicks ac WHERE ac.product_id = p.id) ELSE 0 END DESC,
        p.created_at DESC 
      LIMIT ${limit} OFFSET ${offset}
    `; 

    const totalPages = Math.ceil(total / limit); 
    res.json({ 
      success: true, 
      data: products.map(formatProduct), 
      meta: { total, page, limit, totalPages } 
    }); 
  } catch (error: any) { 
    console.error(error); 
    sendInternalError(res, 'Failed to fetch products');
  } 
}); 

router.get('/:id', async (req, res) => { 
  const { id } = req.params; 
  try { 
    const rows = await sql`SELECT * FROM products WHERE id = ${id} AND is_active = true`; 
    if (rows.length === 0) { 
      return res.status(404).json({ success: false, error: 'Product not found' }); 
    } 
    const product = formatProduct(rows[0]); 
    let related = [];
    if (product.relatedProducts && product.relatedProducts.length > 0) {
      const relatedRows = await sql`SELECT * FROM products WHERE id = ANY(${product.relatedProducts}) AND is_active = true`;
      related = relatedRows.map(formatProduct);
    } else {
      const relatedRows = await sql` 
        SELECT * FROM products WHERE category = ${product.category} AND id != ${id} AND is_active = true LIMIT 4 
      `; 
      related = relatedRows.map(formatProduct);
    }
    res.json({ 
      success: true, 
      data: { product, related } 
    }); 
  } catch (error: any) { 
    console.error(error); 
    sendInternalError(res, 'Failed to fetch product');
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
    sendInternalError(res, 'Failed to process affiliate click');
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
    sendInternalError(res, 'Failed to save Pinterest action');
  } 
}); 

export default router; 
