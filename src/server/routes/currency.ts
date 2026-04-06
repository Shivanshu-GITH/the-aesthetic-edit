import { Router } from 'express'; 
import { rateLimit } from 'express-rate-limit'; 
 
const router = Router(); 
 
const currencyLimit = rateLimit({ 
  windowMs: 60 * 1000, 
  max: 30, 
  message: { success: false, error: 'Rate limited' }, 
}); 
 
// NOTE: In-memory cache for currency rates. This resets on server restart and doesn't scale horizontally. 
// For long-term production use, consider moving this to Redis or Postgres.
let ratesCache: { rates: Record<string, number>; fetchedAt: number } | null = null; 
const CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours 
 
router.get('/rates', currencyLimit, async (req, res) => { 
  if (ratesCache && Date.now() - ratesCache.fetchedAt < CACHE_TTL) { 
    return res.json({ success: true, data: ratesCache.rates, cached: true }); 
  } 
 
  try { 
    const response = await fetch('https://open.er-api.com/v6/latest/USD'); 
    if (!response.ok) throw new Error('Upstream failed'); 
    const data = await response.json(); 
    if (data.result !== 'success') throw new Error('Bad response'); 
     
    ratesCache = { rates: data.rates, fetchedAt: Date.now() }; 
    res.json({ success: true, data: data.rates, cached: false }); 
  } catch (err) { 
    res.status(503).json({ success: false, error: 'Could not fetch rates' }); 
  } 
}); 
 
export default router; 
