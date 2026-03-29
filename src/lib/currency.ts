/**
 * Simple currency utility to detect user's locale and format prices accordingly.
 * In a real app, this would use a conversion API.
 */

const EXCHANGE_RATES: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  INR: 83.12,
  JPY: 151.45,
  CAD: 1.36,
  AUD: 1.53,
};

const LOCALE_TO_CURRENCY: Record<string, string> = {
  'en-US': 'USD',
  'en-GB': 'GBP',
  'de-DE': 'EUR',
  'fr-FR': 'EUR',
  'it-IT': 'EUR',
  'es-ES': 'EUR',
  'ja-JP': 'JPY',
  'en-IN': 'INR',
  'hi-IN': 'INR',
  'en-CA': 'CAD',
  'fr-CA': 'CAD',
  'en-AU': 'AUD',
};

/**
 * Detects the user's currency based on their locale or timezone.
 * Defaults to USD if not found.
 */
export function getUserCurrency(): string {
  if (typeof navigator === 'undefined') return 'USD';
  
  const locale = navigator.language;
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  // Try timezone match first (more reliable for region than language)
  if (timezone === 'Asia/Kolkata' || timezone === 'Asia/Calcutta') return 'INR';
  if (timezone.startsWith('Europe/')) return 'EUR';
  if (timezone.startsWith('Asia/Tokyo')) return 'JPY';
  if (timezone.startsWith('Australia/')) return 'AUD';
  if (timezone.startsWith('America/Toronto') || timezone.startsWith('Canada/')) return 'CAD';
  if (timezone === 'Europe/London') return 'GBP';
  
  // Try exact locale match
  if (LOCALE_TO_CURRENCY[locale]) return LOCALE_TO_CURRENCY[locale];
  
  // Try language match (e.g., 'en' -> 'USD', 'fr' -> 'EUR')
  const lang = locale.split('-')[0];
  if (lang === 'en') return 'USD';
  if (['fr', 'de', 'it', 'es'].includes(lang)) return 'EUR';
  if (lang === 'ja') return 'JPY';
  if (lang === 'hi') return 'INR';
  
  return 'USD';
}

/**
 * Formats a price in USD to the user's local currency.
 */
export function formatPrice(priceInUSD: number): string {
  const currency = getUserCurrency();
  const rate = EXCHANGE_RATES[currency] || 1;
  const convertedPrice = priceInUSD * rate;
  
  // Map currency to a standard locale for better formatting
  const CURRENCY_TO_LOCALE: Record<string, string> = {
    USD: 'en-US',
    INR: 'en-IN',
    EUR: 'de-DE',
    GBP: 'en-GB',
    JPY: 'ja-JP',
    CAD: 'en-CA',
    AUD: 'en-AU',
  };

  const locale = CURRENCY_TO_LOCALE[currency] || navigator.language || 'en-US';
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0, // Keep it clean for the aesthetic
  }).format(convertedPrice);
}
