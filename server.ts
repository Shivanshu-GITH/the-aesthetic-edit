import dotenv from 'dotenv'; 
dotenv.config(); 

import express from 'express'; 
import path from 'path'; 
import cookieParser from 'cookie-parser'; 
import { createServer as createViteServer } from 'vite'; 
import helmet from 'helmet'; 
import cors from 'cors'; 
import morgan from 'morgan'; 
import { initDb, default as sql } from './src/server/db.js'; 
import productsRouter from './src/server/routes/products.js'; 
import blogRouter from './src/server/routes/blog.js'; 
import leadsRouter from './src/server/routes/leads.js'; 
import wishlistRouter from './src/server/routes/wishlist.js'; 
import analyticsRouter from './src/server/routes/analytics.js'; 
import authRouter from './src/server/routes/auth.js'; 
import contactRouter from './src/server/routes/contact.js'; 
import currencyRouter from './src/server/routes/currency.js'; 
import geoRouter from './src/server/routes/geo.js'; 
import homeShopRouter from './src/server/routes/home_shop.js'; 
import uploadRouter from './src/server/routes/upload.js';
 
const normalizeOrigin = (origin: string) => {
  try {
    const parsed = new URL(origin);
    return parsed.origin;
  } catch {
    return origin.replace(/\/+$/, '');
  }
};

async function startServer() { 
  // Validate required env vars at startup 
  const required = ['DATABASE_URL', 'JWT_SECRET']; 
  const missing = required.filter(k => !process.env[k]); 
  if (missing.length > 0) { 
    console.error(`Missing required environment variables: ${missing.join(', ')}`); 
    process.exit(1); 
  } 
  const hasAdminHash = Boolean(process.env.ADMIN_PASSWORD_HASH?.trim());
  const hasLegacyAdminPassword = Boolean(process.env.ADMIN_PASSWORD?.trim());
  const allowLegacyAdminPassword = process.env.ALLOW_LEGACY_ADMIN_PASSWORD === 'true';
  if (!hasAdminHash && !hasLegacyAdminPassword) {
    console.error('Missing admin credential: set ADMIN_PASSWORD_HASH.');
    process.exit(1);
  }
  if (process.env.NODE_ENV === 'production' && !hasAdminHash) {
    if (!allowLegacyAdminPassword) {
      console.error('ADMIN_PASSWORD_HASH is required in production. Set ALLOW_LEGACY_ADMIN_PASSWORD=true only for temporary migration.');
      process.exit(1);
    }
    console.warn('Using legacy ADMIN_PASSWORD in production. Migrate to ADMIN_PASSWORD_HASH as soon as possible.');
  }
  if (process.env.JWT_SECRET!.length < 32) { 
    console.error('JWT_SECRET must be at least 32 characters'); 
    process.exit(1); 
  }

  const app = express(); 
  const PORT = Number(process.env.PORT) || 3000; 
  // Required on reverse proxies (Render/Nginx) for correct client IP/rate-limit/cookie behavior.
  app.set('trust proxy', 1);
 
  // 1. Initialize DB 
  await initDb(); 
 
  // 2. Middleware 
  app.use(helmet({ 
    crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
    contentSecurityPolicy: process.env.NODE_ENV === 'production' ? { 
      directives: { 
        defaultSrc: ["'self'"], 
        scriptSrc: ["'self'", "'unsafe-inline'"], 
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"], 
        imgSrc: ["'self'", "data:", "blob:", "https://images.unsplash.com", "https://res.cloudinary.com", "https://*.amazonaws.com", "https://i.pravatar.cc", "https://lh3.googleusercontent.com"], 
        connectSrc: ["'self'", "https://ipapi.co", "https://open.er-api.com"], 
        fontSrc: ["'self'", "https://fonts.gstatic.com"], 
        objectSrc: ["'none'"], 
        upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null, 
      } 
    } : false, 
  })); 
  const envOrigins = (process.env.APP_URL || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  const allowedOrigins = new Set(
    (envOrigins.length > 0 ? envOrigins : ['http://localhost:3000', 'http://localhost:5173'])
      .map(normalizeOrigin)
  );
 
  app.use(cors({ 
    origin: (origin, callback) => {
      if (!origin) {
        if (process.env.NODE_ENV !== 'production' || process.env.ALLOW_REQUESTS_WITHOUT_ORIGIN === 'true') {
          return callback(null, true);
        }
        return callback(new Error('CORS origin required'));
      }
      const normalized = normalizeOrigin(origin);
      if (allowedOrigins.has(normalized)) {
        return callback(null, true);
      }
      return callback(new Error('CORS origin not allowed'));
    },
    credentials: true, 
  })); 
  // Admin payloads (blog markdown, product arrays) can exceed 10kb.
  app.use(express.json({ limit: '2mb' })); 
  app.use(express.urlencoded({ extended: true, limit: '2mb' }));
  app.use(cookieParser()); 
 
  if (process.env.NODE_ENV !== 'production') { 
    app.use(morgan('dev')); 
  } 
 
  // 3. Mount routes 
  app.use('/api/products', productsRouter); 
  app.use('/api/blog', blogRouter); 
  app.use('/api/leads', leadsRouter); 
  app.use('/api/wishlist', wishlistRouter); 
  app.use('/api/analytics', analyticsRouter); 
  app.use('/api/auth', authRouter); 
  app.use('/api/contact', contactRouter); 
  app.use('/api/currency', currencyRouter); 
  app.use('/api/geo', geoRouter); 
  app.use('/api/home-shop', homeShopRouter); 
  app.use('/api/upload', uploadRouter);
 
  // SEO Endpoints 
  app.get('/robots.txt', (req, res) => { 
    const APP_URL = process.env.APP_URL || `${req.protocol}://${req.get('host')}`; 
    const robots = [ 
      'User-agent: *', 
      'Allow: /', 
      'Disallow: /admin', 
      'Disallow: /api/', 
      `Sitemap: ${APP_URL}/sitemap.xml` 
    ].join('\n'); 
    res.type('text/plain').send(robots); 
  }); 
 
  app.get('/sitemap.xml', async (req, res) => { 
    const APP_URL = process.env.APP_URL || `${req.protocol}://${req.get('host')}`; 
    try { 
      const [products, posts] = await Promise.all([ 
        sql`SELECT id FROM products WHERE is_active = true`, 
        sql`SELECT slug, category_slug FROM blog_posts WHERE is_published = true` 
      ]); 
 
      const staticUrls = ['/', '/shop', '/blog', '/about', '/free-guide']; 
 
      const xml = `<?xml version="1.0" encoding="UTF-8"?> 
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"> 
  ${staticUrls.map(url => ` 
  <url> 
    <loc>${APP_URL}${url}</loc> 
    <changefreq>weekly</changefreq> 
    <priority>${url === '/' ? '1.0' : '0.8'}</priority> 
  </url>`).join('')} 
  ${products.map((p: any) => ` 
  <url> 
    <loc>${APP_URL}/shop/product/${p.id}</loc> 
    <changefreq>monthly</changefreq> 
    <priority>0.6</priority> 
  </url>`).join('')} 
  ${posts.map((post: any) => ` 
  <url> 
    <loc>${APP_URL}/blog/${post.category_slug}/${post.slug}</loc> 
    <changefreq>monthly</changefreq> 
    <priority>0.6</priority> 
  </url>`).join('')} 
</urlset>`; 
 
      res.type('application/xml').send(xml); 
    } catch (e) { 
      res.status(500).send('Failed to generate sitemap'); 
    } 
  }); 
 
  // 4. Vite middleware or Static files 
  if (process.env.NODE_ENV !== 'production') { 
    const vite = await createViteServer({ 
      server: { middlewareMode: true }, 
      appType: 'spa', 
    }); 
    app.use(vite.middlewares); 
  } else { 
    const distPath = path.join(process.cwd(), 'dist'); 
    app.use(express.static(distPath)); 
    app.get('*', (req, res) => { 
      if (req.path.startsWith('/api/')) { 
        return res.status(404).json({ success: false, error: 'Not found' }); 
      } 
      res.sendFile(path.join(distPath, 'index.html')); 
    }); 
  } 
 
  // 5. 404 handler for API 
  app.use('/api/*', (req, res) => { 
    res.status(404).json({ success: false, error: 'Not found' }); 
  }); 
 
  // 6. Error middleware 
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => { 
    console.error(err); 
    const status = err.status || 500; 
    const message = process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message; 
    res.status(status).json({ success: false, error: message }); 
  }); 
 
  app.listen(PORT, '0.0.0.0', () => { 
    console.log(`Server running on http://localhost:${PORT}`); 
  }); 
} 
 
startServer().catch(console.error); 
