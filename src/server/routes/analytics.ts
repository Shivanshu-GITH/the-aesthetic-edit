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

router.get('/summary', (req, res) => {
  const adminPassword = req.get('ADMIN_PASSWORD');
  if (!adminPassword || adminPassword !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  const totalLeads = (db.prepare('SELECT COUNT(*) as count FROM leads').get() as any).count;
  const totalClicks = (db.prepare('SELECT COUNT(*) as count FROM affiliate_clicks').get() as any).count;
  const totalSaves = (db.prepare('SELECT COUNT(*) as count FROM pinterest_saves').get() as any).count;

  const topClickedProducts = db.prepare(`
    SELECT p.*, COUNT(c.id) as clicks
    FROM products p
    LEFT JOIN affiliate_clicks c ON p.id = c.product_id
    GROUP BY p.id
    ORDER BY clicks DESC
    LIMIT 10
  `).all();

  const topPinterestSaved = db.prepare(`
    SELECT p.*, COUNT(s.id) as saves
    FROM products p
    LEFT JOIN pinterest_saves s ON p.id = s.product_id
    GROUP BY p.id
    ORDER BY saves DESC
    LIMIT 10
  `).all();

  const allProducts = db.prepare('SELECT * FROM products ORDER BY created_at DESC').all();

  const recentLeads = db.prepare(`
    SELECT id, name, email, source, is_confirmed, created_at
    FROM leads
    ORDER BY created_at DESC
    LIMIT 10
  `).all();

  res.json({
    success: true,
    data: {
      totalLeads,
      totalClicks,
      totalSaves,
      topClickedProducts: topClickedProducts.map((p: any) => ({ ...formatProduct(p), clicks: p.clicks })),
      topPinterestSaved: topPinterestSaved.map((p: any) => ({ ...formatProduct(p), saves: p.saves })),
      recentLeads,
      allProducts: allProducts.map(formatProduct)
    }
  });
});

export default router;
