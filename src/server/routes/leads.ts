import { Router } from 'express'; 
import { z } from 'zod'; 
import sql from '../db.js'; 
import { rateLimit } from 'express-rate-limit'; 
import { v4 as uuidv4 } from 'uuid'; 
import { checkAdmin } from '../middleware/admin.js';
import { sendInternalError } from '../utils/http.js';
 
const router = Router(); 
 
const leadLimit = rateLimit({ 
  windowMs: 60 * 60 * 1000, 
  max: 5, 
  message: { success: false, error: 'Too many requests, please try again later' } 
}); 
 
const leadSchema = z.object({ 
  name: z.string().min(2).max(200), 
  email: z.string().email().max(200), 
  source: z.string().max(100).optional() 
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
    const guideConfig = await sql`SELECT value FROM site_config WHERE key = 'free_guide_file_url' LIMIT 1`;
    const configuredGuideUrl = guideConfig[0]?.value || null;
    const guideUrl =
      configuredGuideUrl && /^https?:\/\//i.test(configuredGuideUrl)
        ? configuredGuideUrl
        : null;
    res.json({ success: true, data: { message: 'Guide on its way!', guideUrl } }); 
  } catch (error: any) { 
    console.error(error); 
    res.status(500).json({ success: false, error: 'Failed to register lead' }); 
  } 
}); 

router.get('/guide-download', async (req, res) => {
  try {
    const guideConfig = await sql`SELECT value FROM site_config WHERE key = 'free_guide_file_url' LIMIT 1`;
    const guideUrl = guideConfig[0]?.value;
    if (!guideUrl || !/^https?:\/\//i.test(guideUrl)) {
      return res.status(404).json({ success: false, error: 'Guide URL not configured. Please set a public PDF URL in Admin > Site Config.' });
    }
    return res.redirect(guideUrl);
  } catch (error: any) {
    console.error('Guide download error:', error);
    return res.status(500).json({ success: false, error: 'Failed to prepare guide download' });
  }
});
 
router.get('/admin/all', checkAdmin, async (req, res) => { 
  try { 
    const leads = await sql`SELECT * FROM leads ORDER BY created_at DESC`; 
    res.json({ success: true, data: leads }); 
  } catch (error: any) { 
    console.error('Fetch leads error:', error);
    sendInternalError(res, 'Failed to fetch leads');
  } 
}); 

router.patch('/admin/:id/status', checkAdmin, async (req, res) => {
  const { id } = req.params;
  const { is_confirmed } = req.body;
  
  if (typeof is_confirmed === 'undefined') {
    return res.status(400).json({ success: false, error: 'is_confirmed is required' });
  }

  try {
    const result = await sql`UPDATE leads SET is_confirmed = ${is_confirmed === true || is_confirmed === 'true' || is_confirmed === 1} WHERE id = ${id} RETURNING *`;
    if (result.length === 0) {
      return res.status(404).json({ success: false, error: 'Lead not found' });
    }
    res.json({ success: true, data: result[0] });
  } catch (error: any) {
    console.error('Update lead status error:', error);
    sendInternalError(res, 'Failed to update lead');
  }
});

router.delete('/admin/:id', checkAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await sql`DELETE FROM leads WHERE id = ${id} RETURNING id`;
    if (result.length === 0) {
      return res.status(404).json({ success: false, error: 'Lead not found' });
    }
    res.json({ success: true, data: { message: 'Lead deleted successfully' } });
  } catch (error: any) {
    console.error('Delete lead error:', error);
    sendInternalError(res, 'Failed to delete lead');
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
