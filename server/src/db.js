const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

let db;
const dbPath = path.resolve(process.env.DATABASE_PATH || './data/store.db');
const dbDir = path.dirname(dbPath);

function saveDb() {
  if (!db) return;
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(dbPath, buffer);
}

function dbAll(sql, params = []) {
  const stmt = db.prepare(sql);
  if (params.length) stmt.bind(params);
  const results = [];
  while (stmt.step()) results.push(stmt.getAsObject());
  stmt.free();
  return results;
}

function dbGet(sql, params = []) {
  const results = dbAll(sql, params);
  return results[0] || null;
}

function dbRun(sql, params = []) {
  db.run(sql, params);
  const lastIdResult = db.exec("SELECT last_insert_rowid() as id");
  const lastId = lastIdResult[0] && lastIdResult[0].values && lastIdResult[0].values[0] ? lastIdResult[0].values[0][0] : 0;
  const changes = db.getRowsModified();
  saveDb();
  return { lastInsertRowid: lastId, changes };
}

function dbTransaction(fn) {
  db.run('BEGIN TRANSACTION');
  try {
    const result = fn();
    db.run('COMMIT');
    saveDb();
    return result;
  } catch (err) {
    db.run('ROLLBACK');
    throw err;
  }
}

async function initDb() {
  const SQL = await initSqlJs();

  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  // Enable foreign keys
  db.run('PRAGMA foreign_keys = ON');

  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      phone TEXT,
      role TEXT DEFAULT 'customer' CHECK(role IN ('admin','customer')),
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      image TEXT,
      sort_order INTEGER DEFAULT 0,
      is_visible INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      sku TEXT UNIQUE,
      barcode TEXT,
      description TEXT,
      ingredients TEXT,
      manufacturer TEXT,
      product_size TEXT,
      category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
      price REAL NOT NULL,
      sale_price REAL,
      stock INTEGER DEFAULT 0,
      low_stock_threshold INTEGER DEFAULT 5,
      status TEXT DEFAULT 'draft' CHECK(status IN ('draft','published','unavailable')),
      is_featured INTEGER DEFAULT 0,
      usage_instructions TEXT,
      storage_info TEXT,
      warnings TEXT,
      delivery_info TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS product_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      image_path TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS customer_addresses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      country TEXT,
      city TEXT,
      area TEXT,
      street TEXT,
      house_number TEXT,
      landmark TEXT,
      postal_code TEXT,
      delivery_instructions TEXT,
      is_default INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_number TEXT UNIQUE NOT NULL,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      guest_token TEXT,
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      customer_email TEXT,
      shipping_country TEXT,
      shipping_city TEXT,
      shipping_area TEXT,
      shipping_street TEXT,
      shipping_house TEXT,
      shipping_landmark TEXT,
      shipping_postal_code TEXT,
      shipping_instructions TEXT,
      subtotal REAL NOT NULL,
      delivery_charge REAL DEFAULT 0,
      discount REAL DEFAULT 0,
      tax REAL DEFAULT 0,
      total REAL NOT NULL,
      coupon_code TEXT,
      order_status TEXT DEFAULT 'pending' CHECK(order_status IN ('pending','confirmed','processing','ready_for_pickup','shipped','delivered','cancelled','returned')),
      payment_status TEXT DEFAULT 'unpaid' CHECK(payment_status IN ('unpaid','awaiting_verification','paid','refunded','failed')),
      payment_method TEXT CHECK(payment_method IN ('online','bank_transfer','cash_on_delivery','store_pickup')),
      fulfilment_type TEXT DEFAULT 'delivery' CHECK(fulfilment_type IN ('delivery','pickup')),
      tracking_number TEXT,
      courier_name TEXT,
      order_notes TEXT,
      admin_notes TEXT,
      cancellation_reason TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
      product_name TEXT NOT NULL,
      product_sku TEXT,
      product_image TEXT,
      quantity INTEGER NOT NULL,
      unit_price REAL NOT NULL,
      total_price REAL NOT NULL
    );

    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      amount REAL NOT NULL,
      method TEXT NOT NULL,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending','completed','failed','refunded')),
      transaction_id TEXT,
      receipt_image TEXT,
      gateway_response TEXT,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS carts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      session_id TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS cart_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cart_id INTEGER NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      quantity INTEGER NOT NULL DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS inventory_movements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      quantity_change INTEGER NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('order','cancellation','manual','return','adjustment')),
      reference_id TEXT,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS store_settings (
      key TEXT PRIMARY KEY,
      value TEXT,
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS coupons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('percentage','fixed')),
      value REAL NOT NULL,
      min_order REAL DEFAULT 0,
      max_uses INTEGER,
      used_count INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      expires_at TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      action TEXT NOT NULL,
      entity_type TEXT,
      entity_id INTEGER,
      details TEXT,
      ip_address TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS banners (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      subtitle TEXT,
      image TEXT,
      link TEXT,
      sort_order INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);

  // Create indexes
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
    CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
    CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
    CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
    CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
    CREATE INDEX IF NOT EXISTS idx_orders_guest_token ON orders(guest_token);
    CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON cart_items(cart_id);
    CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
  `);

  // Insert default store settings
  const defaultSettings = {
    store_name: 'AL SHAFI HOMEO STORE',
    store_slogan: 'Your Trusted Homeopathy Partner',
    store_email: 'info@alshafihomeo.com',
    store_phone: '+92 300 0000000',
    store_address: 'Lahore, Pakistan',
    currency: 'PKR',
    currency_symbol: 'Rs.',
    min_order_amount: '0',
    free_delivery_threshold: '3000',
    delivery_charge: '200',
    enable_cod: 'true',
    enable_bank_transfer: 'true',
    enable_online_payment: 'false',
    enable_store_pickup: 'true',
    store_pickup_address: 'Main Branch, Lahore, Pakistan',
    store_pickup_hours: 'Mon-Sat: 9AM-9PM, Sun: 10AM-6PM',
    bank_details: 'Bank: HBL\nAccount Title: AL SHAFI HOMEO STORE\nAccount No: 1234567890\nIBAN: PK00HABB0001234567890',
    tax_rate: '0',
    tax_name: 'Sales Tax',
    enable_tax: 'false'
  };

  for (const [key, value] of Object.entries(defaultSettings)) {
    db.run('INSERT OR IGNORE INTO store_settings (key, value) VALUES (?, ?)', [key, value]);
  }

  saveDb();
  return db;
}

function prepare(sql) {
  return {
    get: (...args) => {
      const params = args.length === 1 && Array.isArray(args[0]) ? args[0] : args;
      return dbGet(sql, params);
    },
    all: (...args) => {
      const params = args.length === 1 && Array.isArray(args[0]) ? args[0] : args;
      return dbAll(sql, params);
    },
    run: (...args) => {
      const params = args.length === 1 && Array.isArray(args[0]) ? args[0] : args;
      return dbRun(sql, params);
    }
  };
}

module.exports = { 
  initDb, 
  getDb: () => db, 
  dbAll, 
  dbGet, 
  dbRun, 
  dbTransaction, 
  saveDb,
  prepare,
  transaction: (fn) => (...args) => dbTransaction(() => fn(...args))
};
