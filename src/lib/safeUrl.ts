/**
 * Sanitize href values from CMS / site config before rendering in <a href>.
 * Blocks javascript:, data:, vbscript:. Allows http(s), mailto, tel, and same-site paths.
 */
export function safeUserLinkHref(raw: string | undefined | null): {
  href: string;
  external: boolean;
} {
  const t = (raw ?? '').trim();
  if (!t || t === '#') return { href: '#', external: false };

  const lower = t.toLowerCase();
  if (lower.startsWith('javascript:') || lower.startsWith('data:') || lower.startsWith('vbscript:')) {
    return { href: '#', external: false };
  }

  if (/^https?:\/\//i.test(t)) return { href: t, external: true };
  if (/^mailto:/i.test(t) || /^tel:/i.test(t)) return { href: t, external: false };
  if (t.startsWith('/')) {
    if (t.startsWith('//')) return { href: '#', external: false };
    return { href: t.slice(0, 512), external: false };
  }

  return { href: '#', external: false };
}

/** Paths for React Router <Link to={…}> — blocks scheme URLs and protocol-relative //links. */
export function safeRouterPath(p: string | undefined | null): string {
  const t = (p ?? '').trim();
  if (!t.startsWith('/') || t.startsWith('//')) return '/';
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(t)) return '/';
  return t.slice(0, 512);
}
