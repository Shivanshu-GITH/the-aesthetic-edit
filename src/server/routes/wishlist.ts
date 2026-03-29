import { Router } from 'express';
import db from '../db.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

router.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

// Journal wishlist routes FIRST
router.post('/journal', (req, res) => {
  console.log('POST /api/wishlist/journal', req.body);
  const userId = req.headers['user-id'];
  const { postId } = req.body;

  if (!userId || userId === 'undefined') {
    return res.status(401).json({ success: false, error: 'Not authenticated' });
  }
  if (!postId) {
    return res.status(400).json({ success: false, error: 'Post ID required' });
  }

  try {
    const postExists = db.prepare('SELECT 1 FROM blog_posts WHERE id = ?').get(postId);
    if (!postExists) {
      return res.status(404).json({ success: false, error: 'Blog post not found' });
    }

    db.prepare(`
      INSERT OR IGNORE INTO wishlist_journals (id, user_id, post_id)
      VALUES (?, ?, ?)
    `).run(uuidv4(), userId, postId);

    res.json({
      success: true,
      data: { added: true }
    });
  } catch (error: any) {
    console.error('Wishlist journal error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/journal/:postId', (req, res) => {
  console.log('DELETE /api/wishlist/journal/' + req.params.postId);
  const userId = req.headers['user-id'];
  const { postId } = req.params;

  if (!userId || userId === 'undefined') {
    return res.status(401).json({ success: false, error: 'Not authenticated' });
  }

  db.prepare('DELETE FROM wishlist_journals WHERE user_id = ? AND post_id = ?').run(userId, postId);

  res.json({
    success: true,
    data: { removed: true }
  });
});

router.get('/', (req, res) => {
  const userId = req.headers['user-id'];
  if (!userId || userId === 'undefined') {
    return res.status(200).json({ success: true, data: { products: [], journals: [] } });
  }

  try {
    const products = db.prepare(`
      SELECT p.* FROM products p
      JOIN wishlist_items w ON p.id = w.product_id
      WHERE w.user_id = ? AND p.is_active = 1
    `).all(userId);

    const journals = db.prepare(`
      SELECT b.* FROM blog_posts b
      JOIN wishlist_journals w ON b.id = w.post_id
      WHERE w.user_id = ? AND b.is_published = 1
    `).all(userId);

    res.json({
      success: true,
      data: {
        products,
        journals
      }
    });
  } catch (error: any) {
    console.error('Wishlist fetch error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/', (req, res) => {
  const userId = req.headers['user-id'];
  const { productId } = req.body;

  if (!userId || userId === 'undefined') {
    return res.status(401).json({ success: false, error: 'Not authenticated' });
  }
  if (!productId) {
    return res.status(400).json({ success: false, error: 'Product ID required' });
  }

  const productExists = db.prepare('SELECT 1 FROM products WHERE id = ?').get(productId);
  if (!productExists) {
    return res.status(404).json({ success: false, error: 'Product not found' });
  }

  db.prepare(`
    INSERT OR IGNORE INTO wishlist_items (id, user_id, product_id)
    VALUES (?, ?, ?)
  `).run(uuidv4(), userId, productId);

  res.json({
    success: true,
    data: { added: true }
  });
});

router.delete('/:productId', (req, res) => {
  const userId = req.headers['user-id'];
  const { productId } = req.params;

  if (!userId || userId === 'undefined') {
    return res.status(401).json({ success: false, error: 'Not authenticated' });
  }

  db.prepare('DELETE FROM wishlist_items WHERE user_id = ? AND product_id = ?').run(userId, productId);

  res.json({
    success: true,
    data: { removed: true }
  });
});

export default router;
