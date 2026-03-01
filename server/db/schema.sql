-- SpesaMax Database Schema
-- Full production schema for the AI-powered grocery savings platform

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  surname TEXT NOT NULL,
  cap TEXT DEFAULT '20100',
  city TEXT DEFAULT 'Milano',
  latitude REAL DEFAULT 45.4642,
  longitude REAL DEFAULT 9.1900,
  avatar_url TEXT,
  plan TEXT DEFAULT 'free' CHECK(plan IN ('free', 'premium')),
  plan_expires_at TEXT,
  reputation REAL DEFAULT 4.0,
  contributions_count INTEGER DEFAULT 0,
  total_savings REAL DEFAULT 0,
  monthly_savings REAL DEFAULT 0,
  preferences TEXT DEFAULT '{}',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS stores (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  chain TEXT NOT NULL,
  address TEXT,
  city TEXT DEFAULT 'Milano',
  cap TEXT,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  phone TEXT,
  logo TEXT,
  color TEXT DEFAULT '#10b981',
  rating REAL DEFAULT 4.0,
  opening_hours TEXT DEFAULT '{}',
  categories TEXT DEFAULT '[]',
  is_active INTEGER DEFAULT 1,
  last_scraped_at TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,
  weight TEXT,
  unit TEXT DEFAULT 'kg',
  unit_price_label TEXT,
  barcode TEXT UNIQUE,
  image_url TEXT,
  is_bio INTEGER DEFAULT 0,
  is_gluten_free INTEGER DEFAULT 0,
  is_vegan INTEGER DEFAULT 0,
  allergens TEXT DEFAULT '[]',
  normalized_name TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS prices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id TEXT NOT NULL REFERENCES products(id),
  store_id TEXT NOT NULL REFERENCES stores(id),
  price REAL NOT NULL,
  offer_price REAL,
  offer_label TEXT,
  offer_start TEXT,
  offer_end TEXT,
  price_per_unit REAL,
  source TEXT DEFAULT 'scraper' CHECK(source IN ('scraper', 'community', 'manual', 'api')),
  confidence REAL DEFAULT 1.0,
  scraped_at TEXT DEFAULT (datetime('now')),
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(product_id, store_id, scraped_at)
);

CREATE TABLE IF NOT EXISTS price_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id TEXT NOT NULL REFERENCES products(id),
  store_id TEXT REFERENCES stores(id),
  avg_price REAL NOT NULL,
  min_price REAL,
  max_price REAL,
  date TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS shopping_lists (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#10b981',
  icon TEXT DEFAULT 'shopping-cart',
  is_active INTEGER DEFAULT 1,
  is_optimized INTEGER DEFAULT 0,
  budget REAL,
  estimated_total REAL,
  actual_total REAL,
  estimated_savings REAL,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS list_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  list_id TEXT NOT NULL REFERENCES shopping_lists(id) ON DELETE CASCADE,
  product_id TEXT REFERENCES products(id),
  custom_name TEXT,
  quantity REAL DEFAULT 1,
  unit TEXT DEFAULT 'pz',
  is_checked INTEGER DEFAULT 0,
  best_store_id TEXT REFERENCES stores(id),
  best_price REAL,
  notes TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS optimized_carts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  list_id TEXT REFERENCES shopping_lists(id),
  total_original REAL,
  total_optimized REAL,
  total_savings REAL,
  stores_count INTEGER,
  total_distance_km REAL,
  estimated_time_min INTEGER,
  route_data TEXT DEFAULT '{}',
  store_groups TEXT DEFAULT '[]',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS community_reports (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  product_id TEXT REFERENCES products(id),
  store_id TEXT NOT NULL REFERENCES stores(id),
  product_name TEXT NOT NULL,
  reported_price REAL NOT NULL,
  normal_price REAL,
  has_receipt INTEGER DEFAULT 0,
  receipt_image_url TEXT,
  is_verified INTEGER DEFAULT 0,
  verified_by TEXT,
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK(status IN ('active', 'expired', 'flagged', 'removed')),
  expires_at TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS report_votes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  report_id TEXT NOT NULL REFERENCES community_reports(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id),
  vote INTEGER NOT NULL CHECK(vote IN (-1, 1)),
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(report_id, user_id)
);

CREATE TABLE IF NOT EXISTS ai_conversations (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  title TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS ai_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  conversation_id TEXT NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK(role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  savings_amount REAL,
  metadata TEXT DEFAULT '{}',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS price_alerts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  product_id TEXT NOT NULL REFERENCES products(id),
  target_price REAL,
  alert_type TEXT DEFAULT 'any_drop' CHECK(alert_type IN ('any_drop', 'target_price', 'offer')),
  is_active INTEGER DEFAULT 1,
  last_triggered_at TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data TEXT DEFAULT '{}',
  is_read INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS scrape_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  store_id TEXT REFERENCES stores(id),
  chain TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('running', 'success', 'partial', 'failed')),
  products_found INTEGER DEFAULT 0,
  prices_updated INTEGER DEFAULT 0,
  errors TEXT,
  duration_ms INTEGER,
  started_at TEXT DEFAULT (datetime('now')),
  completed_at TEXT
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_prices_product ON prices(product_id);
CREATE INDEX IF NOT EXISTS idx_prices_store ON prices(store_id);
CREATE INDEX IF NOT EXISTS idx_prices_scraped ON prices(scraped_at);
CREATE INDEX IF NOT EXISTS idx_price_history_product ON price_history(product_id);
CREATE INDEX IF NOT EXISTS idx_price_history_date ON price_history(date);
CREATE INDEX IF NOT EXISTS idx_list_items_list ON list_items(list_id);
CREATE INDEX IF NOT EXISTS idx_community_reports_store ON community_reports(store_id);
CREATE INDEX IF NOT EXISTS idx_community_reports_user ON community_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_alerts_user ON price_alerts(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_products_normalized ON products(normalized_name);
