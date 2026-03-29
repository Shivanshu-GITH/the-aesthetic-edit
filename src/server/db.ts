import { neon } from '@neondatabase/serverless'; 
import dotenv from 'dotenv'; 
dotenv.config(); 

if (!process.env.DATABASE_URL) { 
  throw new Error('DATABASE_URL environment variable is not set'); 
} 

const sql = neon(process.env.DATABASE_URL); 

export async function initDb() { 
  await sql` 
    CREATE TABLE IF NOT EXISTS schema_migrations ( 
      id SERIAL PRIMARY KEY, 
      name TEXT NOT NULL UNIQUE, 
      applied_at TIMESTAMPTZ DEFAULT NOW() 
    ) 
  `; 

  await sql` 
    CREATE TABLE IF NOT EXISTS products ( 
      id TEXT PRIMARY KEY, 
      title TEXT NOT NULL, 
      price REAL NOT NULL, 
      image TEXT NOT NULL, 
      category TEXT NOT NULL, 
      sub_category TEXT NOT NULL, 
      vibes JSONB NOT NULL DEFAULT '[]', 
      affiliate_url TEXT NOT NULL, 
      retailer TEXT, 
      description TEXT, 
      is_active BOOLEAN DEFAULT TRUE, 
      created_at TIMESTAMPTZ DEFAULT NOW() 
    ) 
  `; 

  await sql` 
    CREATE TABLE IF NOT EXISTS blog_categories ( 
      id TEXT PRIMARY KEY, 
      title TEXT NOT NULL, 
      slug TEXT NOT NULL UNIQUE, 
      image TEXT NOT NULL, 
      description TEXT 
    ) 
  `; 

  await sql` 
    CREATE TABLE IF NOT EXISTS blog_posts ( 
      id TEXT PRIMARY KEY, 
      slug TEXT NOT NULL UNIQUE, 
      category_slug TEXT NOT NULL, 
      title TEXT NOT NULL, 
      excerpt TEXT NOT NULL, 
      content TEXT NOT NULL, 
      image TEXT NOT NULL, 
      category TEXT NOT NULL, 
      author TEXT NOT NULL, 
      date TEXT NOT NULL, 
      read_time TEXT NOT NULL, 
      recommended_products JSONB DEFAULT '[]', 
      is_published BOOLEAN DEFAULT TRUE, 
      created_at TIMESTAMPTZ DEFAULT NOW() 
    ) 
  `; 

  await sql` 
    CREATE TABLE IF NOT EXISTS leads ( 
      id TEXT PRIMARY KEY, 
      name TEXT NOT NULL, 
      email TEXT NOT NULL UNIQUE, 
      source TEXT DEFAULT 'free-guide', 
      confirmation_token TEXT, 
      is_confirmed BOOLEAN DEFAULT FALSE, 
      created_at TIMESTAMPTZ DEFAULT NOW() 
    ) 
  `; 

  await sql` 
    CREATE TABLE IF NOT EXISTS affiliate_clicks ( 
      id TEXT PRIMARY KEY, 
      product_id TEXT NOT NULL, 
      affiliate_url TEXT NOT NULL, 
      clicked_at TIMESTAMPTZ DEFAULT NOW(), 
      user_agent TEXT, 
      referrer TEXT, 
      CONSTRAINT fk_affiliate_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE 
    ) 
  `; 

  await sql` 
    CREATE TABLE IF NOT EXISTS pinterest_saves ( 
      id TEXT PRIMARY KEY, 
      product_id TEXT NOT NULL, 
      saved_at TIMESTAMPTZ DEFAULT NOW(), 
      user_agent TEXT, 
      CONSTRAINT fk_pinterest_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE 
    ) 
  `; 

  await sql` 
    CREATE TABLE IF NOT EXISTS users ( 
      id TEXT PRIMARY KEY, 
      name TEXT NOT NULL, 
      email TEXT NOT NULL UNIQUE, 
      password TEXT, 
      provider TEXT DEFAULT 'local', 
      created_at TIMESTAMPTZ DEFAULT NOW() 
    ) 
  `; 

  await sql` 
    CREATE TABLE IF NOT EXISTS wishlist_journals ( 
      id TEXT PRIMARY KEY, 
      user_id TEXT NOT NULL, 
      post_id TEXT NOT NULL, 
      created_at TIMESTAMPTZ DEFAULT NOW(), 
      UNIQUE(user_id, post_id), 
      CONSTRAINT fk_journal_post FOREIGN KEY (post_id) REFERENCES blog_posts(id) ON DELETE CASCADE, 
      CONSTRAINT fk_journal_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE 
    ) 
  `; 

  await sql` 
    CREATE TABLE IF NOT EXISTS wishlist_items ( 
      id TEXT PRIMARY KEY, 
      user_id TEXT, 
      session_id TEXT, 
      product_id TEXT NOT NULL, 
      created_at TIMESTAMPTZ DEFAULT NOW(), 
      UNIQUE(user_id, product_id), 
      CONSTRAINT fk_wishlist_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE, 
      CONSTRAINT fk_wishlist_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE 
    ) 
  `; 

  await sql` 
    CREATE TABLE IF NOT EXISTS contact_messages ( 
      id TEXT PRIMARY KEY, 
      name TEXT NOT NULL, 
      email TEXT NOT NULL, 
      message TEXT NOT NULL, 
      created_at TIMESTAMPTZ DEFAULT NOW() 
    ) 
  `; 

  // Indexes 
  await sql`CREATE INDEX IF NOT EXISTS idx_wishlist_user ON wishlist_items(user_id)`; 
  await sql`CREATE INDEX IF NOT EXISTS idx_wishlist_product ON wishlist_items(product_id)`; 
  await sql`CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_product ON affiliate_clicks(product_id)`; 
  await sql`CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category_slug)`; 
  await sql`CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug)`; 
  await sql`CREATE INDEX IF NOT EXISTS idx_products_category ON products(category)`; 
  await sql`CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active)`; 

  console.log('Database initialized successfully'); 
} 

export default sql; 
