import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, '../../data/aesthetic_edit.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations ( 
      id INTEGER PRIMARY KEY AUTOINCREMENT, 
      name TEXT NOT NULL UNIQUE, 
      applied_at TEXT DEFAULT CURRENT_TIMESTAMP 
    ); 

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      price REAL NOT NULL,
      image TEXT NOT NULL,
      category TEXT NOT NULL,
      sub_category TEXT NOT NULL,
      vibes TEXT NOT NULL,          -- JSON array stored as text
      affiliate_url TEXT NOT NULL,
      retailer TEXT,
      description TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS blog_categories (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      image TEXT NOT NULL,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS blog_posts (
      id TEXT PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      category_slug TEXT NOT NULL,
      title TEXT NOT NULL,
      excerpt TEXT NOT NULL,
      content TEXT NOT NULL,        -- Full article body (rich text, stored as markdown)
      image TEXT NOT NULL,
      category TEXT NOT NULL,
      author TEXT NOT NULL,
      date TEXT NOT NULL,
      read_time TEXT NOT NULL,
      recommended_products TEXT,    -- JSON array of product IDs
      is_published INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS leads (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      source TEXT DEFAULT 'free-guide',
      confirmation_token TEXT,
      is_confirmed INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS affiliate_clicks (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      affiliate_url TEXT NOT NULL,
      clicked_at TEXT DEFAULT CURRENT_TIMESTAMP,
      user_agent TEXT,
      referrer TEXT,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS pinterest_saves (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      saved_at TEXT DEFAULT CURRENT_TIMESTAMP,
      user_agent TEXT,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT,
      provider TEXT DEFAULT 'local',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS wishlist_journals (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      post_id TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, post_id),
      FOREIGN KEY (post_id) REFERENCES blog_posts(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS wishlist_items ( 
      id TEXT PRIMARY KEY, 
      user_id TEXT, 
      session_id TEXT, 
      product_id TEXT NOT NULL, 
      created_at TEXT DEFAULT CURRENT_TIMESTAMP, 
      UNIQUE(user_id, product_id), 
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE, 
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE 
    ); 

    CREATE TABLE IF NOT EXISTS contact_messages (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create indexes for performance 
  try { 
    db.exec(` 
      CREATE INDEX IF NOT EXISTS idx_wishlist_user ON wishlist_items(user_id); 
      CREATE INDEX IF NOT EXISTS idx_wishlist_product ON wishlist_items(product_id); 
      CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_product ON affiliate_clicks(product_id); 
      CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category_slug); 
      CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug); 
      CREATE INDEX IF NOT EXISTS idx_products_category ON products(category); 
      CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active); 
    `); 
  } catch (e) { 
    console.error('Index creation error:', e); 
  } 
}

export default db;
