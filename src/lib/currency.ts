/** 
 * Currency utility — stores product prices in INR and converts
 * to user's local currency via IP geolocation + live rates.
 * 
 * IP geolocation: ipapi.co/json (free, no key) 
 * Exchange rates: open.er-api.com/v6/latest/USD (free, no key, updates daily)
 */ 
 
const SUPPORTED_CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD', 'AUD', 'SGD', 'AED', 'MYR'] as const; 
type SupportedCurrency = typeof SUPPORTED_CURRENCIES[number]; 
 
const FALLBACK_RATES: Record<SupportedCurrency, number> = { 
  USD: 1, 
  EUR: 0.92, 
  GBP: 0.79, 
  INR: 83.5, 
  JPY: 154.2, 
  CAD: 1.37, 
  AUD: 1.54, 
  SGD: 1.35, 
  AED: 3.67, 
  MYR: 4.72, 
}; 
 
const CURRENCY_LOCALE_MAP: Record<SupportedCurrency, string> = { 
  USD: 'en-US', 
  EUR: 'de-DE', 
  GBP: 'en-GB', 
  INR: 'en-IN', 
  JPY: 'ja-JP', 
  CAD: 'en-CA', 
  AUD: 'en-AU', 
  SGD: 'en-SG', 
  AED: 'ar-AE', 
  MYR: 'ms-MY', 
}; 
 
// In-memory cache with TTL 
interface CurrencyCache { 
  currency: SupportedCurrency; 
  rates: Record<string, number>; 
  fetchedAt: number; 
} 
 
let cache: CurrencyCache | null = null; 
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours 
 
async function detectCurrencyFromIP(): Promise<SupportedCurrency> { 
  try { 
    const res = await fetch('/api/geo/detect', { 
      signal: AbortSignal.timeout(3000), 
    }); 
    if (!res.ok) throw new Error('geo proxy failed'); 
    const body = await res.json(); 
    const data = body.data;
    const currency = data.currency as string; 
    if (currency && SUPPORTED_CURRENCIES.includes(currency as SupportedCurrency)) { 
      return currency as SupportedCurrency; 
    } 
    // Map country to currency if currency field not in supported list 
    return mapCountryToCurrency(data.country_code); 
  } catch { 
    return detectCurrencyFromBrowser(); 
  } 
} 
 
function mapCountryToCurrency(countryCode: string): SupportedCurrency { 
  const map: Record<string, SupportedCurrency> = { 
    US: 'USD', GB: 'GBP', AU: 'AUD', CA: 'CAD', JP: 'JPY', 
    IN: 'INR', SG: 'SGD', AE: 'AED', MY: 'MYR', 
    DE: 'EUR', FR: 'EUR', IT: 'EUR', ES: 'EUR', NL: 'EUR', 
    PT: 'EUR', AT: 'EUR', BE: 'EUR', FI: 'EUR', IE: 'EUR', 
    GR: 'EUR', LU: 'EUR', MT: 'EUR', CY: 'EUR', SK: 'EUR', 
    SI: 'EUR', EE: 'EUR', LV: 'EUR', LT: 'EUR', HR: 'EUR', 
  }; 
  return map[countryCode] || 'INR'; 
} 
 
function detectCurrencyFromBrowser(): SupportedCurrency { 
  try { 
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone; 
    if (tz === 'Asia/Kolkata' || tz === 'Asia/Calcutta') return 'INR'; 
    if (tz === 'Asia/Tokyo') return 'JPY'; 
    if (tz === 'Asia/Singapore') return 'SGD'; 
    if (tz === 'Asia/Dubai') return 'AED'; 
    if (tz === 'Asia/Kuala_Lumpur') return 'MYR'; 
    if (tz === 'Europe/London') return 'GBP'; 
    if (tz.startsWith('Europe/')) return 'EUR'; 
    if (tz.startsWith('Australia/')) return 'AUD'; 
    if (tz.startsWith('America/Toronto') || tz === 'Canada/Eastern') return 'CAD'; 
  } catch {} 
  return 'INR'; 
} 
 
async function fetchLiveRates(): Promise<Record<string, number>> { 
  // Try own backend first (avoids rate limits, server does the caching) 
  const endpoints = [ 
    '/api/currency/rates', 
    'https://open.er-api.com/v6/latest/USD', 
  ]; 
   
  for (const endpoint of endpoints) { 
    try { 
      const res = await fetch(endpoint, { signal: AbortSignal.timeout(4000) }); 
      if (!res.ok) continue; 
      const data = await res.json(); 
      // Own backend returns { success, data: rates } 
      // External API returns { result, rates } 
      const rates = data.data || data.rates; 
      if (rates && typeof rates === 'object') return rates; 
    } catch { 
      continue; 
    } 
  } 
   
  console.warn('[currency] All rate sources failed — using fallback'); 
  return { ...FALLBACK_RATES }; 
} 
 
async function initCurrency(): Promise<CurrencyCache> { 
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) { 
    return cache; 
  } 
 
  const [currency, rates] = await Promise.all([ 
    detectCurrencyFromIP(), 
    fetchLiveRates(), 
  ]); 
 
  cache = { currency, rates, fetchedAt: Date.now() }; 
  return cache; 
} 
 
// Initialise eagerly on module load (non-blocking) 
let initPromise: Promise<CurrencyCache> | null = null; 
function ensureInit() { 
  if (!initPromise) { 
    initPromise = initCurrency(); 
  } 
  return initPromise; 
} 
 
if (typeof window !== 'undefined') { 
  ensureInit(); 
} 
 
/** 
 * Returns the user's detected currency code (e.g. "INR", "USD"). 
 * Falls back to USD if detection is still in progress. 
 */ 
export async function getUserCurrencyAsync(): Promise<SupportedCurrency> { 
  const c = await ensureInit(); 
  return c.currency; 
} 
 
/** 
 * Synchronous getter — returns cached value or USD if not yet loaded. 
 * Use this for initial renders; the async version for accurate display. 
 */ 
export function getUserCurrencySync(): SupportedCurrency { 
  return cache?.currency ?? 'INR'; 
} 
 
/** 
 * Formats an INR price into the user's local currency.
 * Uses live rates when available, fallback rates otherwise. 
 * @param priceInINR - Price in Indian Rupees
 */ 
export async function formatPriceAsync(priceInINR: number): Promise<string> { 
  const { currency, rates } = await ensureInit(); 
  return applyFormat(priceInINR, currency, rates); 
} 
 
/** 
 * Synchronous price formatter — uses cached rates. 
 * Returns USD format if rates not yet loaded. 
 * @param priceInINR - Price in Indian Rupees
 */ 
export function formatPrice(priceInINR: number): string {
  if (!cache) return applyFormat(priceInINR, 'INR', FALLBACK_RATES);
  return applyFormat(priceInINR, cache.currency, cache.rates); 
} 
 
function applyFormat(priceInINR: number, currency: SupportedCurrency, rates: Record<string, number>): string {
  const safePrice = Number(priceInINR);
  const normalizedPrice = Number.isFinite(safePrice) ? safePrice : 0;

  const inrRateRaw = Number(rates.INR ?? FALLBACK_RATES.INR);
  const targetRateRaw = Number(rates[currency] ?? FALLBACK_RATES[currency] ?? 1);
  const inrRate = Number.isFinite(inrRateRaw) && inrRateRaw > 0 ? inrRateRaw : FALLBACK_RATES.INR;
  const targetRate = Number.isFinite(targetRateRaw) && targetRateRaw > 0 ? targetRateRaw : 1;

  const baseInUSD = normalizedPrice / inrRate;
  const converted = baseInUSD * targetRate;
  const locale = CURRENCY_LOCALE_MAP[currency] ?? 'en-US';

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      maximumFractionDigits: currency === 'JPY' ? 0 : 0,
    }).format(converted);
  } catch {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(normalizedPrice);
  }
} 
 
/** 
 * Prefetch currency data — call this early in the app lifecycle. 
 * e.g. in main.tsx or App.tsx useEffect 
 */ 
export function prefetchCurrency() { 
  ensureInit(); 
} 
