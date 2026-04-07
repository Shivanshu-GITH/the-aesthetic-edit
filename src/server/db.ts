import { neon } from '@neondatabase/serverless'; 
import { neonConfig } from '@neondatabase/serverless'; 
import ws from 'ws'; 
import dotenv from 'dotenv'; 
 
dotenv.config(); 
 
neonConfig.webSocketConstructor = ws; 
 
const connectionString = process.env.DATABASE_URL || ''; 
 
const sql = neon(connectionString); 
 
export const initDb = async () => { 
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set in environment variables');
  }
  // Users table 
  await sql` 
    CREATE TABLE IF NOT EXISTS users ( 
      id TEXT PRIMARY KEY, 
      email TEXT UNIQUE NOT NULL, 
      password TEXT NOT NULL, 
      name TEXT NOT NULL, 
      provider TEXT DEFAULT 'local', 
      is_admin BOOLEAN DEFAULT FALSE, 
      created_at TIMESTAMPTZ DEFAULT NOW() 
    ) 
  `; 
 
  // Products table 
  await sql` 
    CREATE TABLE IF NOT EXISTS products ( 
      id TEXT PRIMARY KEY, 
      title TEXT NOT NULL, 
      price NUMERIC NOT NULL, 
      image TEXT NOT NULL, 
      images JSONB DEFAULT '[]',
      category TEXT NOT NULL, 
      sub_category TEXT, 
      vibes JSONB DEFAULT '[]', 
      affiliate_url TEXT NOT NULL, 
      retailer TEXT, 
      description TEXT, 
      is_active BOOLEAN DEFAULT TRUE, 
      is_trending BOOLEAN DEFAULT FALSE, 
      is_top_rated BOOLEAN DEFAULT FALSE, 
      related_products JSONB DEFAULT '[]'::jsonb,
      section_heading TEXT,
      section_subheading TEXT,
      section_description TEXT,
      section_cta_text TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW() 
    ) 
  `; 
 
  // Blog Categories table 
  await sql` 
    CREATE TABLE IF NOT EXISTS blog_categories ( 
      id TEXT PRIMARY KEY, 
      title TEXT NOT NULL, 
      slug TEXT UNIQUE NOT NULL, 
      image TEXT NOT NULL, 
      description TEXT, 
      created_at TIMESTAMPTZ DEFAULT NOW() 
    ) 
  `; 
 
  // Blog Posts table 
  await sql` 
    CREATE TABLE IF NOT EXISTS blog_posts ( 
      id TEXT PRIMARY KEY, 
      slug TEXT UNIQUE NOT NULL, 
      category_slug TEXT NOT NULL, 
      title TEXT NOT NULL, 
      excerpt TEXT NOT NULL, 
      content TEXT NOT NULL, 
      image TEXT NOT NULL, 
      images JSONB DEFAULT '[]',
      category TEXT NOT NULL, 
      author TEXT NOT NULL, 
      author_image TEXT,
      date TEXT NOT NULL, 
      read_time TEXT NOT NULL, 
      recommended_products JSONB DEFAULT '[]', 
      related_posts JSONB DEFAULT '[]',
      section_heading TEXT,
      section_subheading TEXT,
      section_description TEXT,
      section_cta_text TEXT,
      related_posts_heading TEXT,
      related_posts_subheading TEXT,
      related_posts_description TEXT,
      related_posts_cta_text TEXT,
      is_published BOOLEAN DEFAULT TRUE, 
      created_at TIMESTAMPTZ DEFAULT NOW() 
    ) 
  `; 

  // Add columns if they don't exist (Migration)
  try {
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS section_heading TEXT`;
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS section_subheading TEXT`;
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS section_description TEXT`;
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS section_cta_text TEXT`;

    await sql`ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS section_heading TEXT`;
    await sql`ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS section_subheading TEXT`;
    await sql`ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS section_description TEXT`;
    await sql`ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS section_cta_text TEXT`;

    await sql`ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS related_posts_heading TEXT`;
    await sql`ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS related_posts_subheading TEXT`;
    await sql`ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS related_posts_description TEXT`;
    await sql`ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS related_posts_cta_text TEXT`;
  } catch (err) {
    console.error('Migration error:', err);
  } 
  // Wishlist table 
  await sql` 
    CREATE TABLE IF NOT EXISTS wishlist_items ( 
      id TEXT PRIMARY KEY, 
      user_id TEXT REFERENCES users(id) ON DELETE CASCADE, 
      product_id TEXT REFERENCES products(id) ON DELETE CASCADE, 
      created_at TIMESTAMPTZ DEFAULT NOW(), 
      UNIQUE(user_id, product_id) 
    ) 
  `; 
 
  // Affiliate Clicks table 
  await sql` 
    CREATE TABLE IF NOT EXISTS affiliate_clicks ( 
      id TEXT PRIMARY KEY, 
      product_id TEXT REFERENCES products(id) ON DELETE CASCADE, 
      user_id TEXT REFERENCES users(id) ON DELETE SET NULL, 
      affiliate_url TEXT, 
      user_agent TEXT, 
      referrer TEXT, 
      clicked_at TIMESTAMPTZ DEFAULT NOW() 
    ) 
  `; 
 
  // Pinterest Saves table 
  await sql` 
    CREATE TABLE IF NOT EXISTS pinterest_saves ( 
      id TEXT PRIMARY KEY, 
      product_id TEXT REFERENCES products(id) ON DELETE CASCADE, 
      user_id TEXT REFERENCES users(id) ON DELETE SET NULL, 
      user_agent TEXT, 
      saved_at TIMESTAMPTZ DEFAULT NOW() 
    ) 
  `; 
 
  // Leads table 
  await sql` 
    CREATE TABLE IF NOT EXISTS leads ( 
      id TEXT PRIMARY KEY, 
      name TEXT NOT NULL, 
      email TEXT UNIQUE NOT NULL, 
      source TEXT, 
      confirmation_token TEXT, 
      is_confirmed BOOLEAN DEFAULT FALSE, 
      created_at TIMESTAMPTZ DEFAULT NOW() 
    ) 
  `; 
 
  // Contact table 
  await sql` 
    CREATE TABLE IF NOT EXISTS contact_messages ( 
      id TEXT PRIMARY KEY, 
      name TEXT NOT NULL, 
      email TEXT NOT NULL, 
      message TEXT NOT NULL, 
      created_at TIMESTAMPTZ DEFAULT NOW() 
    ) 
  `; 

  // Wishlist Journals table 
  await sql` 
    CREATE TABLE IF NOT EXISTS wishlist_journals ( 
      id TEXT PRIMARY KEY, 
      user_id TEXT REFERENCES users(id) ON DELETE CASCADE, 
      post_id TEXT REFERENCES blog_posts(id) ON DELETE CASCADE, 
      created_at TIMESTAMPTZ DEFAULT NOW(), 
      UNIQUE(user_id, post_id) 
    ) 
  `; 

  // Shop Categories table 
  await sql` 
    CREATE TABLE IF NOT EXISTS shop_categories ( 
      id TEXT PRIMARY KEY, 
      title TEXT NOT NULL, 
      slug TEXT UNIQUE NOT NULL, 
      icon TEXT, 
      sub_categories JSONB DEFAULT '[]', 
      created_at TIMESTAMPTZ DEFAULT NOW() 
    ) 
  `; 

  // Home Mood Categories table 
  await sql` 
    CREATE TABLE IF NOT EXISTS home_mood_categories ( 
      id TEXT PRIMARY KEY, 
      name TEXT NOT NULL, 
      slug TEXT UNIQUE NOT NULL, 
      vibe TEXT, 
      image TEXT NOT NULL, 
      count TEXT, 
      linked_shop_category_id TEXT REFERENCES shop_categories(id) ON DELETE SET NULL, 
      created_at TIMESTAMPTZ DEFAULT NOW() 
    ) 
  `; 

  // Home Find Here Categories table 
  await sql` 
    CREATE TABLE IF NOT EXISTS home_find_here_categories ( 
      id TEXT PRIMARY KEY, 
      title TEXT NOT NULL, 
      image TEXT NOT NULL, 
      description TEXT, 
      linked_blog_category_slug TEXT, 
      created_at TIMESTAMPTZ DEFAULT NOW() 
    ) 
  `; 

  // Site Config table 
  await sql` 
    CREATE TABLE IF NOT EXISTS site_config ( 
      key TEXT PRIMARY KEY, 
      value TEXT NOT NULL, 
      updated_at TIMESTAMPTZ DEFAULT NOW() 
    ) 
  `; 

  try {
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS is_trending BOOLEAN DEFAULT FALSE`;
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS is_top_rated BOOLEAN DEFAULT FALSE`;
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS related_products JSONB DEFAULT '[]'::jsonb`;
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb`;
    await sql`ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS author_image TEXT`;
    console.log('Migration: Checked products and blog_posts columns');
  } catch (err) {
    console.error('Migration Error (products flags):', err);
  }

  // Seed default site config if empty
  const configCheck = await sql`SELECT COUNT(*) FROM site_config`;
  if (configCheck[0].count === '0') {
    const defaultConfigs = [
      { key: 'home_hero_title', value: 'The Aesthetic Edit' },
      { key: 'home_hero_subtitle', value: 'Turn your saved inspiration into a life you actually live.' },
      { key: 'home_hero_description', value: 'Curated finds, cozy spaces, and effortless style — everything you need to romanticize your life and create a world that feels uniquely yours.' },
      { key: 'footer_about', value: 'Your destination for Pinterest-inspired style, intentional living, and curated shopping.' },
      { key: 'footer_copyright', value: '© 2026 THE AESTHETIC EDIT. ALL RIGHTS RESERVED.' },
      { key: 'about_hero_title', value: 'Hi, I’m Anjali.' },
      { key: 'about_hero_subtitle', value: 'Creating a life that feels as beautiful as it looks.' },
      { key: 'about_hero_description', value: 'I’ve always believed that beauty isn’t just something you see — it’s something you feel. My journey began with a simple love for creating beauty in the everyday.' },
      { key: 'about_hero_signature', value: 'Anjali' },
      { key: 'about_cta_title', value: 'Ready to elevate your aesthetic?' },
      { key: 'about_cta_subtitle', value: 'Explore my curated collection of home, style, and lifestyle finds.' },
      { key: 'about_cta_button', value: 'Shop the Collection' },
      { key: 'shop_empty_message', value: 'No products found matching your criteria.' },
      { key: 'shop_sidebar_title', value: 'Categories' }
    ];
    for (const config of defaultConfigs) {
      await sql`
        INSERT INTO site_config (key, value)
        VALUES (${config.key}, ${config.value})
      `;
    }
  }

  // Indexes 
  await sql`CREATE INDEX IF NOT EXISTS idx_wishlist_user ON wishlist_items(user_id)`; 
  await sql`CREATE INDEX IF NOT EXISTS idx_wishlist_product ON wishlist_items(product_id)`; 
  await sql`CREATE INDEX IF NOT EXISTS idx_wishlist_journals_user ON wishlist_journals(user_id)`; 
  await sql`CREATE INDEX IF NOT EXISTS idx_wishlist_journals_post ON wishlist_journals(post_id)`; 
  await sql`CREATE INDEX IF NOT EXISTS idx_shop_categories_slug ON shop_categories(slug)`; 
  await sql`CREATE INDEX IF NOT EXISTS idx_home_mood_categories_slug ON home_mood_categories(slug)`; 
  await sql`CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_product ON affiliate_clicks(product_id)`; 
  await sql`CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category_slug)`; 
  await sql`CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug)`; 
  await sql`CREATE INDEX IF NOT EXISTS idx_products_category ON products(category)`; 
  await sql`CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active)`; 

  console.log('Database initialized successfully'); 

  try {
    await sql`ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'`;
    console.log('Migration: Checked images column in blog_posts');
  } catch (err) {
    console.error('Migration Error (images):', err);
  }

  try {
    await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS name TEXT NOT NULL DEFAULT ''`;
    await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS confirmation_token TEXT`;
    await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS is_confirmed BOOLEAN DEFAULT FALSE`;
    // Postgres does not support `ADD CONSTRAINT IF NOT EXISTS`.
    // Ensure the unique constraint exists in a safe, idempotent way.
    const leadEmailConstraint = await sql`
      SELECT 1
      FROM pg_constraint c
      JOIN pg_class t ON c.conrelid = t.oid
      WHERE t.relname = 'leads' AND c.conname = 'leads_email_unique'
      LIMIT 1
    `;
    if (leadEmailConstraint.length === 0) {
      await sql`ALTER TABLE leads ADD CONSTRAINT leads_email_unique UNIQUE (email)`;
    }
    console.log('Migration: Leads table columns verified');
  } catch (err) {
    console.error('Migration Error (leads):', err);
  }

  try { 
    await sql`ALTER TABLE affiliate_clicks ADD COLUMN IF NOT EXISTS affiliate_url TEXT`; 
    await sql`ALTER TABLE affiliate_clicks ADD COLUMN IF NOT EXISTS user_agent TEXT`; 
    await sql`ALTER TABLE affiliate_clicks ADD COLUMN IF NOT EXISTS referrer TEXT`; 
    console.log('Migration: affiliate_clicks columns verified'); 
  } catch (err) { 
    console.error('Migration Error (affiliate_clicks):', err); 
  } 

  try { 
    await sql`ALTER TABLE pinterest_saves ADD COLUMN IF NOT EXISTS user_agent TEXT`; 
    console.log('Migration: pinterest_saves columns verified'); 
  } catch (err) { 
    console.error('Migration Error (pinterest_saves):', err); 
  } 

  try { 
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS provider TEXT DEFAULT 'local'`; 
    console.log('Migration: users provider column verified'); 
  } catch (err) { 
    console.error('Migration Error (users provider):', err); 
  } 

  try {
    await sql`ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS related_posts JSONB DEFAULT '[]'`;
    console.log('Migration: Checked related_posts column in blog_posts');
  } catch (err) {
    console.error('Migration Error (related_posts):', err);
  }

  try {
    await sql`ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS recommended_products JSONB DEFAULT '[]'`;
    console.log('Migration: Checked recommended_products column in blog_posts');
  } catch (err) {
    console.error('Migration Error (recommended_products):', err);
  }
}; 
 
export default sql; 
