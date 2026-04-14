import { Router } from 'express'; 
import sql from '../db.js'; 
import { adminLimit, checkAdmin } from '../middleware/admin.js'; 
import { formatProduct } from '../utils/formatters.js';
import { sendInternalError } from '../utils/http.js';

const router = Router(); 
router.use(adminLimit); 

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

    const productsWithStats = await sql`
      SELECT 
          p.*, 
          COALESCE(c.clicks, 0) as clicks, 
          COALESCE(s.saves, 0) as saves
      FROM products p
      LEFT JOIN (
          SELECT product_id, COUNT(*) as clicks 
          FROM affiliate_clicks 
          GROUP BY product_id
      ) c ON p.id = c.product_id
      LEFT JOIN (
          SELECT product_id, COUNT(*) as saves 
          FROM pinterest_saves 
          GROUP BY product_id
      ) s ON p.id = s.product_id
    `;

    const recentLeads = await sql`SELECT id, name, email, source, is_confirmed, created_at FROM leads ORDER BY created_at DESC LIMIT 10`; 

    const formattedProducts = productsWithStats.map((p: any) => ({
      ...formatProduct(p),
      clicks: Number(p.clicks),
      saves: Number(p.saves)
    }));

    const topClickedProducts = [...formattedProducts].sort((a, b) => b.clicks - a.clicks || b.saves - a.saves);
    const topPinterestSaved = [...formattedProducts].sort((a, b) => b.saves - a.saves || b.clicks - a.clicks);

    res.json({ 
      success: true, 
      data: { 
        totalLeads, totalClicks, totalSaves, 
        topClickedProducts, 
        topPinterestSaved, 
        recentLeads, 
        allProducts: formattedProducts 
      } 
    }); 
  } catch (e: any) { 
    console.error('Analytics summary error:', e); 
    sendInternalError(res, 'Failed to fetch analytics summary');
  } 
}); 

export default router; 
