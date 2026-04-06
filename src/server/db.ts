import { neon } from '@neondatabase/serverless'; 
import { neonConfig } from '@neondatabase/serverless'; 
import ws from 'ws'; 
import dotenv from 'dotenv'; 
 
dotenv.config(); 
 
neonConfig.webSocketConstructor = ws; 
 
const connectionString = process.env.DATABASE_URL; 
if (!connectionString) { 
  throw new Error('DATABASE_URL is not set in environment variables'); 
} 
 
const sql = neon(connectionString); 
 
export const initDb = async () => { 
  // Users table 
  await sql` 
    CREATE TABLE IF NOT EXISTS users ( 
      id TEXT PRIMARY KEY, 
      email TEXT UNIQUE NOT NULL, 
      password TEXT NOT NULL, 
      name TEXT NOT NULL, 
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
      date TEXT NOT NULL, 
      read_time TEXT NOT NULL, 
      recommended_products JSONB DEFAULT '[]', 
      related_posts JSONB DEFAULT '[]',
      is_published BOOLEAN DEFAULT TRUE, 
      created_at TIMESTAMPTZ DEFAULT NOW() 
    ) 
  `; 
 
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
      clicked_at TIMESTAMPTZ DEFAULT NOW() 
    ) 
  `; 
 
  // Pinterest Saves table 
  await sql` 
    CREATE TABLE IF NOT EXISTS pinterest_saves ( 
      id TEXT PRIMARY KEY, 
      product_id TEXT REFERENCES products(id) ON DELETE CASCADE, 
      user_id TEXT REFERENCES users(id) ON DELETE SET NULL, 
      saved_at TIMESTAMPTZ DEFAULT NOW() 
    ) 
  `; 
 
  // Leads table 
  await sql` 
    CREATE TABLE IF NOT EXISTS leads ( 
      id TEXT PRIMARY KEY, 
      email TEXT NOT NULL, 
      source TEXT, 
      created_at TIMESTAMPTZ DEFAULT NOW() 
    ) 
  `; 
 
  // Contact table 
  await sql` 
    CREATE TABLE IF NOT EXISTS contact_submissions ( 
      id TEXT PRIMARY KEY, 
      name TEXT NOT NULL, 
      email TEXT NOT NULL, 
      message TEXT NOT NULL, 
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
