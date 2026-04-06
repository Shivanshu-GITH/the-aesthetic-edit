import { Router } from 'express'; 
import sql from '../db.js'; 
import { v4 as uuidv4 } from 'uuid'; 
import { requireAuth, optionalAuth, AuthenticatedRequest } from '../middleware/auth.js'; 

const router = Router(); 

router.post('/journal', requireAuth, async (req: AuthenticatedRequest, res) => { 
  const userId = req.userId; 
  const { postId } = req.body; 
  if (!postId) return res.status(400).json({ success: false, error: 'Post ID required' }); 
  try { 
    const postExists = await sql`SELECT 1 FROM blog_posts WHERE id = ${postId}`; 
    if (postExists.length === 0) return res.status(404).json({ success: false, error: 'Blog post not found' }); 
    await sql`INSERT INTO wishlist_journals (id, user_id, post_id) VALUES (${uuidv4()}, ${userId}, ${postId}) ON CONFLICT DO NOTHING`; 
    res.json({ success: true, data: { added: true } }); 
  } catch (error: any) { 
    console.error('Wishlist journal error:', error); 
    res.status(500).json({ success: false, error: error.message }); 
  } 
}); 

router.delete('/journal/:postId', requireAuth, async (req: AuthenticatedRequest, res) => { 
  const userId = req.userId; 
  const { postId } = req.params; 
  try { 
    await sql`DELETE FROM wishlist_journals WHERE user_id = ${userId} AND post_id = ${postId}`; 
    res.json({ success: true, data: { removed: true } }); 
  } catch (error: any) { 
    res.status(500).json({ success: false, error: error.message }); 
  } 
}); 

router.get('/', optionalAuth, async (req: AuthenticatedRequest, res) => { 
  const userId = req.userId; 
  if (!userId) return res.status(200).json({ success: true, data: { products: [], journals: [] } }); 
  try { 
    const [products, journals] = await Promise.all([ 
      sql`SELECT p.* FROM products p JOIN wishlist_items w ON p.id = w.product_id WHERE w.user_id = ${userId} AND p.is_active = true`, 
      sql`SELECT b.id, b.slug, b.category_slug AS "categorySlug", b.title, b.excerpt, b.image, b.category, b.author, b.date, b.read_time AS "readTime" FROM blog_posts b JOIN wishlist_journals w ON b.id = w.post_id WHERE w.user_id = ${userId} AND b.is_published = true` 
    ]); 
    res.json({ success: true, data: { products, journals } }); 
  } catch (error: any) { 
    console.error('Wishlist fetch error:', error); 
    res.status(500).json({ success: false, error: error.message }); 
  } 
}); 

router.post('/', requireAuth, async (req: AuthenticatedRequest, res) => { 
  const userId = req.userId; 
  const { productId } = req.body; 
  if (!productId) return res.status(400).json({ success: false, error: 'Product ID required' }); 
  try { 
    const productExists = await sql`SELECT 1 FROM products WHERE id = ${productId}`; 
    if (productExists.length === 0) return res.status(404).json({ success: false, error: 'Product not found' }); 
    await sql`INSERT INTO wishlist_items (id, user_id, product_id) VALUES (${uuidv4()}, ${userId}, ${productId}) ON CONFLICT DO NOTHING`; 
    res.json({ success: true, data: { added: true } }); 
  } catch (error: any) { 
    res.status(500).json({ success: false, error: error.message }); 
  } 
}); 

router.delete('/:productId', requireAuth, async (req: AuthenticatedRequest, res) => { 
  const userId = req.userId; 
  const { productId } = req.params; 
  try { 
    await sql`DELETE FROM wishlist_items WHERE user_id = ${userId} AND product_id = ${productId}`; 
    res.json({ success: true, data: { removed: true } }); 
  } catch (error: any) { 
    res.status(500).json({ success: false, error: error.message }); 
  } 
}); 

export default router; 
