import { Router } from 'express'; 
import sql from '../db.js'; 
import { adminLimit, checkAdmin } from '../middleware/admin.js'; 

const router = Router(); 
router.use(adminLimit); 

const formatProduct = (p: any) => ({ 
  id: p.id, title: p.title, price: p.price, image: p.image, category: p.category, 
  subCategory: p.sub_category, vibe: Array.isArray(p.vibes) ? p.vibes : [], 
  affiliateUrl: p.affiliate_url, retailer: p.retailer, description: p.description, 
  isActive: p.is_active === true || p.is_active === 1 
}); 

router.get('/summary', checkAdmin, async (req, res) => { 
  try { 
    const [leadsRows, clicksRows, savesRows] = await Promise.all([ 
      sql`SELECT COUNT(*) as count FROM leads`, 
      sql`SELECT COUNT(*) as count FROM affiliate_clicks`, 
      sql`SELECT COUNT(*) as count FROM pinterest_saves`, 
    ]); 
    const totalLeads = Number(leadsRows[0].count); 
    const totalClicks = Number(clicksRows[0].count); 
    const totalSaves = Number(savesRows[0].count); 

    const [topClickedProducts, topPinterestSaved, allProducts, recentLeads] = await Promise.all([ 
      sql`SELECT p.*, COUNT(c.id) as clicks FROM products p LEFT JOIN affiliate_clicks c ON p.id = c.product_id GROUP BY p.id ORDER BY clicks DESC LIMIT 10`, 
      sql`SELECT p.*, COUNT(s.id) as saves FROM products p LEFT JOIN pinterest_saves s ON p.id = s.product_id GROUP BY p.id ORDER BY saves DESC LIMIT 10`, 
      sql`SELECT * FROM products ORDER BY created_at DESC`, 
      sql`SELECT id, name, email, source, is_confirmed, created_at FROM leads ORDER BY created_at DESC LIMIT 10`, 
    ]); 

    res.json({ 
      success: true, 
      data: { 
        totalLeads, totalClicks, totalSaves, 
        topClickedProducts: topClickedProducts.map((p: any) => ({ ...formatProduct(p), clicks: Number(p.clicks) })), 
        topPinterestSaved: topPinterestSaved.map((p: any) => ({ ...formatProduct(p), saves: Number(p.saves) })), 
        recentLeads, 
        allProducts: allProducts.map(formatProduct) 
      } 
    }); 
  } catch (e: any) { 
    console.error(e); 
    res.status(500).json({ success: false, error: 'Database error' }); 
  } 
}); 

export default router; 
