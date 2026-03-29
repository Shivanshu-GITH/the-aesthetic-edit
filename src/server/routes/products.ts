import { Router } from 'express';
import db from '../db.js';
import { rateLimit } from 'express-rate-limit';
import { v4 as uuidv4 } from 'uuid';

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

const affiliateClickLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20,
  message: { success: false, error: 'Too many clicks, please try again later' }
});

// Admin management routes
router.get('/admin/all', (req, res) => {
  const adminPassword = req.get('ADMIN_PASSWORD');
  if (!adminPassword || adminPassword !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  const products = db.prepare('SELECT * FROM products ORDER BY created_at DESC').all();
  res.json({
    success: true,
    data: products.map(formatProduct)
  });
});

router.post('/admin/create', (req, res) => {
  const adminPassword = req.get('ADMIN_PASSWORD');
  if (!adminPassword || adminPassword !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  const { title, price, image, category, subCategory, vibes, affiliateUrl, retailer, description, isActive = true } = req.body;
  
  if (!title || !price || !image || !category || !subCategory || !vibes || !affiliateUrl) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }

  const id = uuidv4();
  db.prepare(`
    INSERT INTO products (id, title, price, image, category, sub_category, vibes, affiliate_url, retailer, description, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, 
    title, 
    price, 
    image, 
    category, 
    subCategory, 
    JSON.stringify(vibes), 
    affiliateUrl, 
    retailer || null, 
    description || null, 
    isActive ? 1 : 0
  );

  const created = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
  res.status(201).json({ success: true, data: formatProduct(created) });
});

router.put('/admin/:id', (req, res) => {
  const adminPassword = req.get('ADMIN_PASSWORD');
  if (!adminPassword || adminPassword !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  const { id } = req.params;
  const { title, price, image, category, subCategory, vibes, affiliateUrl, retailer, description, isActive } = req.body;

  const productExists = db.prepare('SELECT 1 FROM products WHERE id = ?').get(id);
  if (!productExists) {
    return res.status(404).json({ success: false, error: 'Product not found' });
  }

  db.prepare(`
    UPDATE products 
    SET title = ?, price = ?, image = ?, category = ?, sub_category = ?, vibes = ?, affiliate_url = ?, retailer = ?, description = ?, is_active = ?
    WHERE id = ?
  `).run(
    title,
    price,
    image,
    category,
    subCategory,
    JSON.stringify(vibes),
    affiliateUrl,
    retailer || null,
    description || null,
    isActive ? 1 : 0,
    id
  );

  const updated = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
  res.json({ success: true, data: formatProduct(updated) });
});

router.delete('/admin/:id', (req, res) => {
  const adminPassword = req.get('ADMIN_PASSWORD');
  if (!adminPassword || adminPassword !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  const { id } = req.params;
  const result = db.prepare('DELETE FROM products WHERE id = ?').run(id);

  if (result.changes === 0) {
    return res.status(404).json({ success: false, error: 'Product not found' });
  }

  res.json({ success: true });
});

// Existing Admin routes
router.patch('/:id', (req, res) => {
  const adminPassword = req.get('ADMIN_PASSWORD');
  if (!adminPassword || adminPassword !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  const { id } = req.params;
  const { affiliateUrl } = req.body;

  if (affiliateUrl !== undefined) {
    db.prepare('UPDATE products SET affiliate_url = ? WHERE id = ?').run(affiliateUrl, id);
  }

  const updated = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
  res.json({ success: true, data: updated });
});

router.patch('/:id/toggle-active', (req, res) => {
  const adminPassword = req.get('ADMIN_PASSWORD');
  if (!adminPassword || adminPassword !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  const { id } = req.params;
  const product = db.prepare('SELECT is_active FROM products WHERE id = ?').get(id) as any;

  if (!product) {
    return res.status(404).json({ success: false, error: 'Product not found' });
  }

  const newStatus = product.is_active === 1 ? 0 : 1;
  db.prepare('UPDATE products SET is_active = ? WHERE id = ?').run(newStatus, id);

  res.json({ success: true, data: { isActive: newStatus === 1 } });
});

router.get('/', (req, res) => {
  const { category, subCategory, vibe, maxPrice, search, page = '1', limit = '12' } = req.query;
  const offset = (Number(page) - 1) * Number(limit);
  
  let query = 'SELECT * FROM products WHERE is_active = 1';
  const params: any[] = [];

  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }
  if (subCategory) {
    query += ' AND sub_category = ?';
    params.push(subCategory);
  }
  if (vibe) {
    query += ' AND vibes LIKE ?';
    params.push(`%${vibe}%`);
  }
  if (maxPrice) {
    query += ' AND price <= ?';
    params.push(Number(maxPrice));
  }
  if (search) {
    query += ' AND (title LIKE ? OR description LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
  const total = (db.prepare(countQuery).get(...params) as any).total;

  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(Number(limit), offset);

  const products = db.prepare(query).all(...params);
  const totalPages = Math.ceil(total / Number(limit));

  res.json({
    success: true,
    data: products.map(formatProduct),
    meta: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages
    }
  });
});

router.get('/:id', (req, res) => {
  const { id } = req.params;
  const product = db.prepare('SELECT * FROM products WHERE id = ? AND is_active = 1').get(id);

  if (!product) {
    return res.status(404).json({ success: false, error: 'Product not found' });
  }

  const related = db.prepare(`
    SELECT * FROM products 
    WHERE category = ? AND id != ? AND is_active = 1 
    LIMIT 4
  `).all((product as any).category, id);

  res.json({
    success: true,
    data: {
      product: formatProduct(product),
      related: related.map(formatProduct)
    }
  });
});

router.post('/:id/affiliate-click', affiliateClickLimit, (req, res) => {
  const { id } = req.params;
  const product = db.prepare('SELECT affiliate_url FROM products WHERE id = ?').get(id) as any;

  if (!product) {
    return res.status(404).json({ success: false, error: 'Product not found' });
  }

  db.prepare(`
    INSERT INTO affiliate_clicks (id, product_id, affiliate_url, user_agent, referrer)
    VALUES (?, ?, ?, ?, ?)
  `).run(uuidv4(), id, product.affiliate_url, req.get('user-agent'), req.get('referrer'));

  res.json({
    success: true,
    data: { affiliateUrl: product.affiliate_url }
  });
});

router.post('/:id/pinterest-save', (req, res) => {
  const { id } = req.params;
  const productExists = db.prepare('SELECT 1 FROM products WHERE id = ?').get(id);

  if (!productExists) {
    return res.status(404).json({ success: false, error: 'Product not found' });
  }

  db.prepare(`
    INSERT INTO pinterest_saves (id, product_id, user_agent)
    VALUES (?, ?, ?)
  `).run(uuidv4(), id, req.get('user-agent'));

  res.json({
    success: true,
    data: { success: true }
  });
});

export default router;
