-- Create categories table (income/expense types)
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
  icon TEXT NOT NULL DEFAULT 'mdi-help-circle',
  color TEXT NOT NULL DEFAULT '#808080',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  amount REAL NOT NULL CHECK(amount > 0),
  type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
  category_id TEXT NOT NULL,
  note TEXT NOT NULL DEFAULT '',
  date TEXT NOT NULL DEFAULT (date('now')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
);

-- Indexes
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_category_id ON transactions(category_id);
CREATE INDEX idx_categories_type ON categories(type);

-- Seed default categories
INSERT INTO categories (id, name, type, icon, color) VALUES
  ('a0000001-0001-4000-8000-000000000001', 'เงินเดือน', 'income', 'mdi-briefcase', '#4CAF50'),
  ('a0000001-0001-4000-8000-000000000002', 'รายรับอื่นๆ', 'income', 'mdi-plus-circle', '#8BC34A'),
  ('a0000001-0001-4000-8000-000000000003', 'ค่าอาหาร', 'expense', 'mdi-food', '#FF5722'),
  ('a0000001-0001-4000-8000-000000000004', 'ค่าเดินทาง', 'expense', 'mdi-car', '#FF9800'),
  ('a0000001-0001-4000-8000-000000000005', 'ค่าที่พัก', 'expense', 'mdi-home', '#9C27B0'),
  ('a0000001-0001-4000-8000-000000000006', 'ค่าสาธารณูปโภค', 'expense', 'mdi-lightning-bolt', '#F44336'),
  ('a0000001-0001-4000-8000-000000000007', 'ค่าใช้จ่ายอื่นๆ', 'expense', 'mdi-cart', '#607D8B'),
  ('a0000001-0001-4000-8000-000000000008', 'บันเทิง', 'expense', 'mdi-movie', '#E91E63'),
  ('a0000001-0001-4000-8000-000000000009', 'สุขภาพ', 'expense', 'mdi-heart', '#00BCD4');
