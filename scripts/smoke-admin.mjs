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
    throw new Error(`Non-JSON response from ${res.url}: ${res.status} ${text.slice(0, 200)}`);
  }
}

function getSetCookie(res) {
  // Node fetch exposes Set-Cookie as a combined header string in many environments.
  const raw = res.headers.get('set-cookie');
  return raw || '';
}

function cookieHeaderFromSetCookie(setCookie) {
  if (!setCookie) return '';
  // Keep only cookie pairs; drop attributes.
  // If multiple cookies are present, they're usually comma-separated; but Expires contains commas.
  // This heuristic works for our 1-cookie admin login flow.
  const first = setCookie.split(/,(?=[^;]+?=)/)[0];
  return first.split(';')[0].trim();
}

async function fetchWithCookie(path, { cookie, ...init } = {}) {
  const headers = new Headers(init.headers || {});
  if (cookie) headers.set('cookie', cookie);
  return fetch(`${BASE}${path}`, { ...init, headers });
}

function oneByOnePngBytes() {
  // 1x1 transparent PNG
  const b64 =
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMB/duyR1wAAAAASUVORK5CYII=';
  return Buffer.from(b64, 'base64');
}

async function main() {
  console.log(`Base: ${BASE}`);

  // SPA routes should serve HTML (dev middleware)
  for (const route of ['/', '/shop', '/blog', '/about', '/admin']) {
    const res = await fetch(`${BASE}${route}`);
    assert(res.ok, `Route ${route} not ok: ${res.status}`);
    const ct = res.headers.get('content-type') || '';
    assert(ct.includes('text/html'), `Route ${route} not html: ${ct}`);
  }
  console.log('SPA routes: ok');

  // Public API
  for (const api of ['/api/products', '/api/blog/categories', '/api/blog/posts']) {
    const res = await fetch(`${BASE}${api}`);
    assert(res.ok, `API ${api} not ok: ${res.status}`);
    const json = await readJson(res);
    assert(json.success === true, `API ${api} success=false`);
  }
  console.log('Public API: ok');

  // Admin auth
  let res = await fetch(`${BASE}/api/auth/admin/me`);
  assert(res.status === 401, `Expected 401 for /api/auth/admin/me before login, got ${res.status}`);

  assert(ADMIN_PASSWORD, 'Missing SMOKE_ADMIN_PASSWORD or ADMIN_PASSWORD');
  res = await fetch(`${BASE}/api/auth/admin/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ password: ADMIN_PASSWORD }),
  });
  assert(res.ok, `Admin login failed: ${res.status}`);
  const setCookie = getSetCookie(res);
  const cookie = cookieHeaderFromSetCookie(setCookie);
  assert(cookie.includes('ae_admin_token='), 'Admin login did not return ae_admin_token cookie');

  res = await fetchWithCookie('/api/auth/admin/me', { cookie });
  assert(res.ok, `Expected 200 for /api/auth/admin/me after login, got ${res.status}`);
  console.log('Admin auth: ok');

  // Upload (if Cloudinary configured)
  const fd = new FormData();
  const png = oneByOnePngBytes();
  fd.set('image', new Blob([png], { type: 'image/png' }), 'smoke.png');

  res = await fetchWithCookie('/api/upload', { cookie, method: 'POST', body: fd });
  const uploadJson = await readJson(res);
  if (!res.ok || uploadJson.success !== true || !uploadJson.url) {
    console.warn('Upload: failed (will not block), response:', res.status, uploadJson);
  } else {
    console.log('Upload: ok');
  }

  const imageUrl =
    (uploadJson && uploadJson.success && uploadJson.url) ||
    'https://images.unsplash.com/photo-1520975682030-4f3b3c3d2b7a?auto=format&fit=crop&w=800&q=80';

  // Product create -> update -> fetch -> delete
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
    cookie,
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(productPayload),
  });
  assert(res.ok, `Create product failed: ${res.status}`);
  const createdProduct = await readJson(res);
  assert(createdProduct.success === true, 'Create product success=false');
  const productId = createdProduct.data?.id;
  assert(productId, 'Create product missing id');

  const updatedPayload = { ...productPayload, title: productPayload.title + ' Updated' };
  res = await fetchWithCookie(`/api/products/admin/${productId}`, {
    cookie,
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(updatedPayload),
  });
  assert(res.ok, `Update product failed: ${res.status}`);

  res = await fetch(`${BASE}/api/products/${productId}`);
  assert(res.ok, `Public product fetch failed: ${res.status}`);
  const productDetail = await readJson(res);
  assert(productDetail.success === true, 'Public product success=false');
  assert(productDetail.data?.product?.id === productId, 'Public product id mismatch');

  res = await fetchWithCookie(`/api/products/admin/${productId}`, { cookie, method: 'DELETE' });
  assert(res.ok, `Delete product failed: ${res.status}`);
  console.log('Products CRUD: ok');

  // Blog category create -> blog post create -> fetch -> delete post -> delete category
  const catSlug = `smoke-${Date.now()}`;
  res = await fetchWithCookie('/api/blog/admin/categories', {
    cookie,
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      title: 'Smoke Category',
      slug: catSlug,
      image: imageUrl,
      description: 'Smoke category',
    }),
  });
  assert(res.ok, `Create blog category failed: ${res.status}`);
  const createdCategory = await readJson(res);
  assert(createdCategory.success === true, 'Create category success=false');
  const categoryId = createdCategory.data?.id;
  assert(categoryId, 'Create category missing id');

  const postSlug = `smoke-post-${Date.now()}`;
  const longContent = 'Smoke content\\n\\n' + 'x'.repeat(60_000);
  res = await fetchWithCookie('/api/blog/admin/posts', {
    cookie,
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      slug: postSlug,
      categorySlug: catSlug,
      title: 'Smoke Post',
      excerpt: 'Smoke excerpt',
      content: longContent,
      image: imageUrl,
      images: [imageUrl],
      category: 'Smoke Category',
      author: 'Smoke',
      authorImage: imageUrl,
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      readTime: '1 min read',
      recommendedProducts: [],
      relatedPosts: [],
      isPublished: true,
    }),
  });
  assert(res.ok, `Create blog post failed: ${res.status}`);
  const createdPost = await readJson(res);
  assert(createdPost.success === true, 'Create post success=false');
  const postId = createdPost.data?.id;
  assert(postId, 'Create post missing id');

  res = await fetch(`${BASE}/api/blog/posts/${postSlug}`);
  assert(res.ok, `Public blog post fetch failed: ${res.status}`);
  const postDetail = await readJson(res);
  assert(postDetail.success === true, 'Public blog post success=false');
  assert(postDetail.data?.post?.slug === postSlug, 'Public blog post slug mismatch');

  res = await fetchWithCookie(`/api/blog/admin/posts/${postId}`, { cookie, method: 'DELETE' });
  assert(res.ok, `Delete blog post failed: ${res.status}`);

  res = await fetchWithCookie(`/api/blog/admin/categories/${categoryId}`, { cookie, method: 'DELETE' });
  assert(res.ok, `Delete blog category failed: ${res.status}`);

  console.log('Blog CRUD: ok');
  console.log('SMOKE: PASS');
}

main().catch((e) => {
  console.error('SMOKE: FAIL');
  console.error(e);
  process.exit(1);
});

