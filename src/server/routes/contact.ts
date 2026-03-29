import { Router } from 'express'; 
import sql from '../db.js'; 
import { v4 as uuidv4 } from 'uuid'; 
import { z } from 'zod'; 
import { rateLimit } from 'express-rate-limit'; 
 
const contactLimit = rateLimit({ 
  windowMs: 60 * 60 * 1000, 
  max: 5, 
  message: { success: false, error: 'Too many messages, please try again later' }, 
}); 
 
const contactSchema = z.object({ 
  name: z.string().min(2).max(100), 
  email: z.string().email().max(200), 
  message: z.string().min(10).max(2000), 
}); 
 
const router = Router(); 
 
router.post('/', contactLimit, async (req, res) => { 
  const result = contactSchema.safeParse(req.body); 
  if (!result.success) { 
    return res.status(400).json({ success: false, error: 'Invalid input. Name (2+ chars), valid email, and message (10+ chars) required.' }); 
  } 
  const { name, email, message } = result.data; 
  try { 
    const id = uuidv4(); 
    await sql`INSERT INTO contact_messages (id, name, email, message) VALUES (${id}, ${name}, ${email}, ${message})`; 
    res.json({ success: true, message: 'Message sent successfully' }); 
  } catch (error: any) { 
    console.error('Contact form error:', error); 
    res.status(500).json({ success: false, error: 'Failed to send message' }); 
  } 
}); 
 
export default router; 
