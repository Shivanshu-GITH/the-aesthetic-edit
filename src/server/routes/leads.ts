import { Router } from 'express';
import { z } from 'zod';
import db from '../db.js';
import { rateLimit } from 'express-rate-limit';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

const leadLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: { success: false, error: 'Too many requests, please try again later' }
});

const leadSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  source: z.string().optional()
});

router.post('/', leadLimit, (req, res) => {
  const result = leadSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ success: false, error: 'Invalid input' });
  }

  const { name, email, source = 'free-guide' } = result.data;

  const existing = db.prepare('SELECT 1 FROM leads WHERE email = ?').get(email);
  if (existing) {
    return res.status(409).json({ success: false, error: 'Email already registered' });
  }

  const token = uuidv4();
  const id = uuidv4();

  db.prepare(`
    INSERT INTO leads (id, name, email, source, confirmation_token)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, name, email, source, token);

  // In dev: console.log confirmation details
  if (process.env.NODE_ENV !== 'production') {
    console.log(`Confirmation link for ${email}: ${process.env.APP_URL}/api/leads/confirm/${token}`);
  }

  res.json({
    success: true,
    data: { message: "Guide on its way!" }
  });
});

router.get('/admin/all', (req, res) => {
  const adminPassword = req.get('ADMIN_PASSWORD');
  if (!adminPassword || adminPassword !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  const leads = db.prepare('SELECT * FROM leads ORDER BY created_at DESC').all();
  res.json({ success: true, data: leads });
});

router.get('/confirm/:token', (req, res) => {
  const { token } = req.params;
  const lead = db.prepare('SELECT 1 FROM leads WHERE confirmation_token = ?').get(token);

  if (!lead) {
    return res.status(404).json({ success: false, error: 'Invalid or expired token' });
  }

  db.prepare('UPDATE leads SET is_confirmed = 1, confirmation_token = NULL WHERE confirmation_token = ?').run(token);

  res.json({
    success: true,
    data: { confirmed: true }
  });
});

export default router;
