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
import dotenv from 'dotenv'; 
 
dotenv.config(); 
 
async function startServer() { 
  const app = express(); 
  const PORT = Number(process.env.PORT) || 3000; 
 
  // 1. Initialize DB 
  await initDb(); 
 
  // 2. Middleware 
  app.use(helmet({ 
    contentSecurityPolicy: process.env.NODE_ENV === 'production' ? { 
      directives: { 
        defaultSrc: ["'self'"], 
        scriptSrc: ["'self'", "'unsafe-inline'"], 
        styleSrc: ["'self'", "'unsafe-inline'"], 
        imgSrc: ["'self'", "data:", "https://images.unsplash.com", "https://res.cloudinary.com", "https://*.amazonaws.com"], 
        connectSrc: ["'self'", "https://ipapi.co", "https://open.er-api.com"], 
        fontSrc: ["'self'"], 
        objectSrc: ["'none'"], 
        upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null, 
      } 
    } : false, 
  })); 
  app.use(cors({ origin: process.env.APP_URL || '*' })); 
  app.use(express.json({ limit: '10kb' })); 
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
