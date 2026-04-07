import { Router } from 'express'; 
import { z } from 'zod'; 
import sql from '../db.js'; 
import { rateLimit } from 'express-rate-limit'; 
import { v4 as uuidv4 } from 'uuid'; 
import { checkAdmin } from '../middleware/admin.js';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
 
const router = Router(); 

dotenv.config({ path: path.join(process.cwd(), '.env') });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});
 
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
    const hasGuide = Boolean(guideConfig[0]?.value);
    const guideUrl = hasGuide ? '/api/leads/guide-download' : null;
    res.json({ success: true, data: { message: 'Guide on its way!', guideUrl } }); 
  } catch (error: any) { 
    console.error(error); 
    res.status(500).json({ success: false, error: 'Failed to register lead' }); 
  } 
}); 

function parseCloudinaryAssetInfo(rawUrl: string) {
  try {
    const u = new URL(rawUrl);
    const parts = u.pathname.split('/').filter(Boolean);
    const uploadIndex = parts.findIndex((p) => p === 'upload');
    if (uploadIndex <= 0) return null;

    const resourceType = parts[uploadIndex - 1] || 'raw';
    const type = 'upload';

    let tail = parts.slice(uploadIndex + 1);
    if (tail[0] && /^v\d+$/.test(tail[0])) tail = tail.slice(1);
    if (tail.length === 0) return null;

    const last = tail[tail.length - 1];
    const dot = last.lastIndexOf('.');
    const format = dot > -1 ? last.slice(dot + 1).toLowerCase() : 'pdf';
    tail[tail.length - 1] = dot > -1 ? last.slice(0, dot) : last;
    const publicId = tail.join('/');
    if (!publicId) return null;

    return { publicId, format, resourceType, type };
  } catch {
    return null;
  }
}

router.get('/guide-download', async (req, res) => {
  try {
    const guideConfig = await sql`SELECT value FROM site_config WHERE key = 'free_guide_file_url' LIMIT 1`;
    const rawUrl = guideConfig[0]?.value;
    if (!rawUrl) {
      return res.status(404).json({ success: false, error: 'Guide file not configured' });
    }

    if (rawUrl.startsWith('/api/leads/guide-file/')) {
      return res.redirect(rawUrl);
    }

    const parsed = parseCloudinaryAssetInfo(rawUrl);
    if (!parsed) {
      return res.redirect(rawUrl);
    }

    const expiresAt = Math.floor(Date.now() / 1000) + 60 * 10;
    const signedUrl = cloudinary.utils.private_download_url(parsed.publicId, parsed.format, {
      resource_type: parsed.resourceType as 'image' | 'raw' | 'video',
      type: parsed.type,
      attachment: true,
      expires_at: expiresAt,
    });
    return res.redirect(signedUrl);
  } catch (error: any) {
    console.error('Guide download error:', error);
    return res.status(500).json({ success: false, error: 'Failed to prepare guide download' });
  }
});

router.get('/guide-file/:fileName', async (req, res) => {
  try {
    const fileName = req.params.fileName || '';
    if (!/^[a-zA-Z0-9-]+\.pdf$/.test(fileName)) {
      return res.status(400).json({ success: false, error: 'Invalid file name' });
    }

    const guidesDir = path.join(process.cwd(), 'uploads', 'guides');
    const filePath = path.join(guidesDir, fileName);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, error: 'Guide file not found' });
    }

    return res.download(filePath, 'The-Aesthetic-Edit-Guide.pdf');
  } catch (error: any) {
    console.error('Guide file download error:', error);
    return res.status(500).json({ success: false, error: 'Failed to download guide file' });
  }
});
 
router.get('/admin/all', checkAdmin, async (req, res) => { 
  try { 
    const leads = await sql`SELECT * FROM leads ORDER BY created_at DESC`; 
    res.json({ success: true, data: leads }); 
  } catch (error: any) { 
    console.error('Fetch leads error:', error);
    res.status(500).json({ success: false, error: 'Database error: ' + error.message }); 
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
    res.status(500).json({ success: false, error: error.message || 'Database error' });
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
    res.status(500).json({ success: false, error: error.message || 'Database error' });
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
