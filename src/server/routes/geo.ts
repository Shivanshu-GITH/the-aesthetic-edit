import { Router } from 'express'; 
import { rateLimit } from 'express-rate-limit'; 
 
const router = Router(); 
 
const geoLimit = rateLimit({ 
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: { success: false, error: 'Rate limited' }, 
}); 

const isLikelyPublicIp = (ip: string) => {
  if (!ip) return false;
  const normalized = ip.replace('::ffff:', '').trim();
  if (normalized === '127.0.0.1' || normalized === '::1') return false;
  if (/^10\./.test(normalized)) return false;
  if (/^192\.168\./.test(normalized)) return false;
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(normalized)) return false;
  return true;
};

const getClientIp = (req: any) => {
  const forwardedFor = String(req.headers['x-forwarded-for'] || '')
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);

  const headerCandidates = [
    forwardedFor[0],
    req.headers['cf-connecting-ip'],
    req.headers['x-real-ip'],
    req.ip,
  ]
    .map((v) => String(v || '').trim())
    .filter(Boolean);

  const publicIp = headerCandidates.find(isLikelyPublicIp);
  return publicIp || '';
};
 
router.get('/detect', geoLimit, async (req, res) => { 
  try { 
    const clientIp = getClientIp(req);
    const ipapiUrl = clientIp ? `https://ipapi.co/${encodeURIComponent(clientIp)}/json/` : 'https://ipapi.co/json/';

    // Primary: ipapi.co
    const response = await fetch(ipapiUrl, {
      headers: { 'User-Agent': 'TheAestheticEdit/1.0' }
    }); 
    if (response.ok) {
      const data = await response.json(); 
      return res.json({ success: true, data }); 
    }

    // Fallback: ip-api.com
    const ipApiUrl = clientIp
      ? `https://ip-api.com/json/${encodeURIComponent(clientIp)}`
      : 'https://ip-api.com/json/';
    const fbResponse = await fetch(ipApiUrl);
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
      data: { country_code: 'IN', country_name: 'India', city: 'Mumbai', currency: 'INR' } 
    }); 
  } 
}); 
 
export default router; 
