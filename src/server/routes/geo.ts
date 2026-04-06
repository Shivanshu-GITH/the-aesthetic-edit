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
    // Primary: ipapi.co
    const response = await fetch('https://ipapi.co/json/', {
      headers: { 'User-Agent': 'TheAestheticEdit/1.0' }
    }); 
    if (response.ok) {
      const data = await response.json(); 
      return res.json({ success: true, data }); 
    }

    // Fallback: ip-api.com
    const fbResponse = await fetch('http://ip-api.com/json/');
    if (fbResponse.ok) {
      const fbData = await fbResponse.json();
      return res.json({ 
        success: true, 
        data: { 
          country_code: fbData.countryCode,
          country_name: fbData.country,
          city: fbData.city,
          currency: null // ip-api doesn't provide currency in free tier
        } 
      });
    }

    throw new Error('All geo services failed');
  } catch (err) { 
    console.error('Geo detection error:', err);
    res.status(200).json({ 
      success: true, 
      data: { country_code: 'US', country_name: 'United States', city: 'New York', currency: 'USD' } 
    }); 
  } 
}); 
 
export default router; 
