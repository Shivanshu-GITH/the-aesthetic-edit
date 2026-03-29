import { Router } from 'express'; 
import { rateLimit } from 'express-rate-limit'; 
 
const router = Router(); 
 
const geoLimit = rateLimit({ 
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: { success: false, error: 'Rate limited' }, 
}); 
 
router.get('/detect', geoLimit, async (req, res) => { 
  try { 
    const response = await fetch('https://ipapi.co/json/', {
      headers: {
        'User-Agent': 'TheAestheticEdit/1.0'
      }
    }); 
    if (!response.ok) throw new Error('Upstream failed'); 
    const data = await response.json(); 
    res.json({ success: true, data }); 
  } catch (err) { 
    res.status(503).json({ success: false, error: 'Could not detect location' }); 
  } 
}); 
 
export default router; 
