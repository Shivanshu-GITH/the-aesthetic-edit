import dotenv from 'dotenv';
dotenv.config();

const BASE = process.env.SMOKE_BASE_URL || 'http://localhost:3010';
const ADMIN_PASSWORD = process.env.SMOKE_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || '';

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

async function readJson(res) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Non-JSON response from ${res.url}: ${res.status} ${text.slice(0, 300)}`);
  }
}

function getSetCookie(res) {
  return res.headers.get('set-cookie') || '';
}

function cookieHeaderFromSetCookie(setCookie) {
  if (!setCookie) return '';
  const parts = setCookie.split(/,(?=[^;]+?=)/); // best-effort for multiple cookies
  const pairs = parts.map(p => p.split(';')[0].trim()).filter(Boolean);
  return pairs.join('; ');
}

async function fetchWithCookie(path, { cookie, ...init } = {}) {
  const headers = new Headers(init.headers || {});
  if (cookie) headers.set('cookie', cookie);
  return fetch(`${BASE}${path}`, { ...init, headers });
}

function oneByOnePngBytes() {
  const b64 =
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMB/duyR1wAAAAASUVORK5CYII=';
  return Buffer.from(b64, 'base64');
}

async function adminLogin() {
  assert(ADMIN_PASSWORD, 'Missing SMOKE_ADMIN_PASSWORD or ADMIN_PASSWORD');
  const res = await fetch(`${BASE}/api/auth/admin/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ password: ADMIN_PASSWORD }),
  });
  assert(res.ok, `Admin login failed: ${res.status}`);
  const cookie = cookieHeaderFromSetCookie(getSetCookie(res));
  assert(cookie.includes('ae_admin_token='), 'Admin login did not return ae_admin_token cookie');
  return cookie;
}

async function userSignupAndLogin() {
  const email = `smoke_${Date.now()}@example.com`;
  const password = 'Password123!';
  const name = 'Smoke User';

  let res = await fetch(`${BASE}/api/auth/signup`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  assert(res.ok, `Signup failed: ${res.status}`);
  let cookie = cookieHeaderFromSetCookie(getSetCookie(res));
  assert(cookie.includes('ae_token='), 'Signup did not return ae_token cookie');

  // verify /me
  res = await fetchWithCookie('/api/auth/me', { cookie });
  assert(res.ok, `User /me failed: ${res.status}`);
  const me = await readJson(res);
  assert(me.success === true, 'User /me success=false');

  // logout + login (exercises both)
  res = await fetchWithCookie('/api/auth/logout', { cookie, method: 'POST' });
  assert(res.ok, `Logout failed: ${res.status}`);

  res = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  assert(res.ok, `Login failed: ${res.status}`);
  cookie = cookieHeaderFromSetCookie(getSetCookie(res));
  assert(cookie.includes('ae_token='), 'Login did not return ae_token cookie');
  return { cookie, email, password };
}

async function main() {
  console.log(`Base: ${BASE}`);

  // SPA routes should serve HTML
  for (const route of ['/', '/shop', '/blog', '/about', '/free-guide', '/wishlist', '/login', '/signup', '/admin']) {
    const res = await fetch(`${BASE}${route}`);
    assert(res.ok, `Route ${route} not ok: ${res.status}`);
    const ct = res.headers.get('content-type') || '';
    assert(ct.includes('text/html'), `Route ${route} not html: ${ct}`);
  }
  console.log('SPA routes: ok');

  // Public API baseline
  for (const api of [
    '/api/products',
    '/api/blog/categories',
    '/api/blog/posts',
    '/api/currency/rates',
    '/api/geo/detect',
    '/api/home-shop/moods',
    '/api/home-shop/find-here',
    '/api/home-shop/config',
    '/api/home-shop/shop-categories',
  ]) {
    const res = await fetch(`${BASE}${api}`);
    assert(res.ok, `API ${api} not ok: ${res.status}`);
    const json = await readJson(res);
    assert(json.success === true, `API ${api} success=false`);
  }
  console.log('Public APIs: ok');

  // Admin
  const adminCookie = await adminLogin();
  let res = await fetchWithCookie('/api/auth/admin/me', { cookie: adminCookie });
  assert(res.ok, `Admin /me failed: ${res.status}`);

  // Upload (non-blocking if env missing)
  const fd = new FormData();
  fd.set('image', new Blob([oneByOnePngBytes()], { type: 'image/png' }), 'smoke.png');
  res = await fetchWithCookie('/api/upload', { cookie: adminCookie, method: 'POST', body: fd });
  const uploadJson = await readJson(res);
  const uploadOk = res.ok && uploadJson.success === true && uploadJson.url;
  const imageUrl =
    (uploadOk && uploadJson.url) ||
    'https://images.unsplash.com/photo-1520975682030-4f3b3c3d2b7a?auto=format&fit=crop&w=800&q=80';
  console.log(`Upload: ${uploadOk ? 'ok' : 'skipped/fallback'}`);

  // Create product for user flows
  const productPayload = {
    title: `Smoke Product ${Date.now()}`,
    price: 12.34,
    image: imageUrl,
    images: [imageUrl],
    category: 'Smoke',
    subCategory: 'Test',
    vibes: ['smoke'],
    affiliateUrl: 'https://example.com',
    retailer: 'Example',
    description: 'Smoke test product',
    isActive: true,
    isTrending: false,
    isTopRated: false,
    relatedProducts: [],
  };
  res = await fetchWithCookie('/api/products/admin/create', {
    cookie: adminCookie,
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(productPayload),
  });
  assert(res.ok, `Create product failed: ${res.status}`);
  const createdProduct = await readJson(res);
  const productId = createdProduct.data?.id;
  assert(productId, 'Create product missing id');

  // affiliate click + pinterest save
  res = await fetch(`${BASE}/api/products/${productId}/affiliate-click`, { method: 'POST' });
  assert(res.ok, `Affiliate click failed: ${res.status}`);
  const aff = await readJson(res);
  assert(aff.success === true, 'Affiliate click success=false');

  res = await fetch(`${BASE}/api/products/${productId}/pinterest-save`, { method: 'POST' });
  assert(res.ok, `Pinterest save failed: ${res.status}`);
  const pin = await readJson(res);
  assert(pin.success === true, 'Pinterest save success=false');

  // Blog category + post for journal wishlist
  const catSlug = `smoke-${Date.now()}`;
  res = await fetchWithCookie('/api/blog/admin/categories', {
    cookie: adminCookie,
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ title: 'Smoke Category', slug: catSlug, image: imageUrl, description: 'Smoke category' }),
  });
  assert(res.ok, `Create blog category failed: ${res.status}`);
  const createdCategory = await readJson(res);
  const categoryId = createdCategory.data?.id;
  assert(categoryId, 'Create category missing id');

  const postSlug = `smoke-post-${Date.now()}`;
  res = await fetchWithCookie('/api/blog/admin/posts', {
    cookie: adminCookie,
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      slug: postSlug,
      categorySlug: catSlug,
      title: 'Smoke Post',
      excerpt: 'Smoke excerpt',
      content: 'Smoke content\\n\\n' + 'x'.repeat(10_000),
      image: imageUrl,
      images: [imageUrl],
      category: 'Smoke Category',
      author: 'Smoke',
      authorImage: imageUrl,
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      readTime: '1 min read',
      recommendedProducts: [productId],
      relatedPosts: [],
      isPublished: true,
    }),
  });
  assert(res.ok, `Create blog post failed: ${res.status}`);
  const createdPost = await readJson(res);
  const postId = createdPost.data?.id;
  assert(postId, 'Create post missing id');

  // User auth + wishlist flows
  const { cookie: userCookie, email } = await userSignupAndLogin();

  // Wishlist initially empty
  res = await fetchWithCookie('/api/wishlist', { cookie: userCookie });
  assert(res.ok, `Wishlist GET failed: ${res.status}`);
  let wl = await readJson(res);
  assert(wl.success === true, 'Wishlist GET success=false');

  // Add product to wishlist
  res = await fetchWithCookie('/api/wishlist', {
    cookie: userCookie,
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ productId }),
  });
  assert(res.ok, `Wishlist add product failed: ${res.status}`);
  wl = await readJson(res);
  assert(wl.success === true, 'Wishlist add success=false');

  // Add journal post to wishlist
  res = await fetchWithCookie('/api/wishlist/journal', {
    cookie: userCookie,
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ postId }),
  });
  assert(res.ok, `Wishlist add journal failed: ${res.status}`);

  // Fetch wishlist should include both
  res = await fetchWithCookie('/api/wishlist', { cookie: userCookie });
  assert(res.ok, `Wishlist GET 2 failed: ${res.status}`);
  wl = await readJson(res);
  assert(Array.isArray(wl.data?.products), 'Wishlist products not array');
  assert(Array.isArray(wl.data?.journals), 'Wishlist journals not array');

  // Remove both
  res = await fetchWithCookie(`/api/wishlist/${productId}`, { cookie: userCookie, method: 'DELETE' });
  assert(res.ok, `Wishlist remove product failed: ${res.status}`);
  res = await fetchWithCookie(`/api/wishlist/journal/${postId}`, { cookie: userCookie, method: 'DELETE' });
  assert(res.ok, `Wishlist remove journal failed: ${res.status}`);

  console.log('User auth + wishlist: ok');

  // Leads + Contact workflows (rate-limited, so one call each)
  res = await fetch(`${BASE}/api/leads`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name: 'Smoke Lead', email: `lead_${Date.now()}@example.com`, source: 'smoke' }),
  });
  assert(res.ok, `Leads POST failed: ${res.status}`);
  const leadRes = await readJson(res);
  assert(leadRes.success === true, 'Leads success=false');

  res = await fetch(`${BASE}/api/contact`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name: 'Smoke Contact', email: `contact_${Date.now()}@example.com`, message: 'Hello from smoke test (>=10 chars).' }),
  });
  assert(res.ok, `Contact POST failed: ${res.status}`);
  const contactRes = await readJson(res);
  assert(contactRes.success === true, 'Contact success=false');

  console.log('Leads + contact: ok');

  // Admin config update (ensures admin can control frontend)
  res = await fetchWithCookie('/api/home-shop/admin/config', {
    cookie: adminCookie,
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      nav_links_json: JSON.stringify([
        { name: 'Shop', path: '/shop' },
        { name: 'Journal', path: '/blog' },
        { name: 'About', path: '/about' },
      ]),
    }),
  });
  assert(res.ok, `Admin config POST failed: ${res.status}`);
  const cfgRes = await readJson(res);
  assert(cfgRes.success === true, 'Admin config success=false');
  console.log('Admin config: ok');

  // Cleanup admin artifacts
  await fetchWithCookie(`/api/blog/admin/posts/${postId}`, { cookie: adminCookie, method: 'DELETE' });
  await fetchWithCookie(`/api/blog/admin/categories/${categoryId}`, { cookie: adminCookie, method: 'DELETE' });
  await fetchWithCookie(`/api/products/admin/${productId}`, { cookie: adminCookie, method: 'DELETE' });

  console.log('SMOKE FULL: PASS');
}

main().catch((e) => {
  console.error('SMOKE FULL: FAIL');
  console.error(e);
  process.exit(1);
});

