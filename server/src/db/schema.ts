import db from "./database.js";

// --- Tabla: categories ---
db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

// --- Tabla: products ---
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    name         TEXT NOT NULL,
    description  TEXT,
    sku          TEXT UNIQUE,
    price        REAL NOT NULL DEFAULT 0 CHECK (price >= 0),
    stock        INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    image        TEXT,
    category_id  INTEGER,
    created_at   TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    updated_at   TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (category_id)
      REFERENCES categories(id)
      ON DELETE SET NULL
      ON UPDATE CASCADE
  );
`);

// --- Tabla: sales ---
db.exec(`
  CREATE TABLE IF NOT EXISTS sales (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    total       REAL NOT NULL CHECK (total >= 0),
    created_at  TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
  );
`);

// --- Tabla: sale_items ---
db.exec(`
  CREATE TABLE IF NOT EXISTS sale_items (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    sale_id     INTEGER NOT NULL,
    product_id  INTEGER,
    product_name TEXT NOT NULL,
    quantity    INTEGER NOT NULL CHECK (quantity > 0),
    unit_price  REAL NOT NULL CHECK (unit_price >= 0),

    FOREIGN KEY (sale_id)
      REFERENCES sales(id)
      ON DELETE CASCADE,

    FOREIGN KEY (product_id)
      REFERENCES products(id)
      ON DELETE SET NULL
  );
`);

// --- Índices ---
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_products_category_id
    ON products(category_id);
`);

db.exec(`
  CREATE INDEX IF NOT EXISTS idx_products_name
    ON products(name);
`);

db.exec(`
  CREATE INDEX IF NOT EXISTS idx_sales_created_at
    ON sales(created_at);
`);

db.exec(`
  CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id
    ON sale_items(sale_id);
`);

db.exec(`
  CREATE INDEX IF NOT EXISTS idx_sale_items_product_id
    ON sale_items(product_id);
`);

// --- Triggers: mantener updated_at sincronizado automáticamente ---
db.exec(`
  CREATE TRIGGER IF NOT EXISTS trg_categories_updated_at
  AFTER UPDATE ON categories
  FOR EACH ROW
  BEGIN
    UPDATE categories SET updated_at = datetime('now') WHERE id = OLD.id;
  END;
`);

db.exec(`
  CREATE TRIGGER IF NOT EXISTS trg_products_updated_at
  AFTER UPDATE ON products
  FOR EACH ROW
  BEGIN
    UPDATE products SET updated_at = datetime('now') WHERE id = OLD.id;
  END;
`);

console.log("Esquema de base de datos verificado/creado correctamente");
