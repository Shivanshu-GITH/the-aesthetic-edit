import { Router } from 'express'; 
import { z } from 'zod'; 
import sql from '../db.js'; 
import { rateLimit } from 'express-rate-limit'; 
import { v4 as uuidv4 } from 'uuid'; 
 
const router = Router(); 
 
const leadLimit = rateLimit({ 
  windowMs: 60 * 60 * 1000, 
  max: 5, 
  message: { success: false, error: 'Too many requests, please try again later' } 
}); 
 
const leadSchema = z.object({ 
  name: z.string().min(2), 
  email: z.string().email(), 
  source: z.string().optional() 
}); 
 
router.post('/', leadLimit, async (req, res) => { 
  const result = leadSchema.safeParse(req.body); 
  if (!result.success) { 
    return res.status(400).json({ success: false, error: 'Invalid input' }); 
  } 
  const { name, email, source = 'free-guide' } = result.data; 
  try { 
    const existing = await sql`SELECT 1 FROM leads WHERE email = ${email}`; 
    if (existing.length > 0) { 
      return res.status(409).json({ success: false, error: 'Email already registered' }); 
    } 
    const token = uuidv4(); 
    const id = uuidv4(); 
    await sql`INSERT INTO leads (id, name, email, source, confirmation_token) VALUES (${id}, ${name}, ${email}, ${source}, ${token})`; 
    if (process.env.NODE_ENV !== 'production') { 
      console.log(`Confirmation link for ${email}: ${process.env.APP_URL}/api/leads/confirm/${token}`); 
    } 
    res.json({ success: true, data: { message: 'Guide on its way!' } }); 
  } catch (error: any) { 
    console.error(error); 
    res.status(500).json({ success: false, error: 'Failed to register lead' }); 
  } 
}); 
 
router.get('/admin/all', async (req, res) => { 
  if (req.get('ADMIN_PASSWORD') !== process.env.ADMIN_PASSWORD) { 
    return res.status(401).json({ success: false, error: 'Unauthorized' }); 
  } 
  try { 
    const leads = await sql`SELECT * FROM leads ORDER BY created_at DESC`; 
    res.json({ success: true, data: leads }); 
  } catch (error: any) { 
    res.status(500).json({ success: false, error: 'Database error' }); 
  } 
}); 
 
router.get('/confirm/:token', async (req, res) => { 
  const { token } = req.params; 
  try { 
    const lead = await sql`SELECT 1 FROM leads WHERE confirmation_token = ${token}`; 
    if (lead.length === 0) { 
      return res.status(404).json({ success: false, error: 'Invalid or expired token' }); 
    } 
    await sql`UPDATE leads SET is_confirmed = true, confirmation_token = NULL WHERE confirmation_token = ${token}`; 
    res.json({ success: true, data: { confirmed: true } }); 
  } catch (error: any) { 
    res.status(500).json({ success: false, error: 'Database error' }); 
  } 
}); 
 
export default router; 
