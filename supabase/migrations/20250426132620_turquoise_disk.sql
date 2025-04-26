/*
  # Shop Schema Setup

  1. New Tables
    - product_categories (categories for shop items)
    - products (shop items with inventory management)
    - orders (user purchases with BNPL support)
    - order_items (items in each order)
    - bnpl_payments (installment payments for orders)

  2. Security
    - RLS enabled on all tables
    - Public read access for products and categories
    - Write access restricted to admins for products
    - Users can only access their own orders and payments

  3. Changes
    - Added BNPL eligibility fields to applications table
    - Added indexes for performance optimization
    - Added triggers for timestamp updates
*/

-- Product Categories
CREATE TABLE IF NOT EXISTS product_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public users can view product categories" ON product_categories;
CREATE POLICY "Public users can view product categories"
  ON product_categories
  FOR SELECT
  TO authenticated
  USING (true);

-- Products
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES product_categories(id),
  name text NOT NULL,
  description text,
  price numeric(10,2) NOT NULL,
  stock_quantity integer NOT NULL DEFAULT 0,
  image_url text,
  specifications jsonb,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT valid_status CHECK (status IN ('active', 'inactive', 'out_of_stock'))
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public users can view products" ON products;
CREATE POLICY "Public users can view products"
  ON products
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Only admins can modify products" ON products;
CREATE POLICY "Only admins can modify products"
  ON products
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  application_id uuid REFERENCES applications(id),
  status text NOT NULL DEFAULT 'pending',
  total_amount numeric(10,2) NOT NULL,
  down_payment numeric(10,2),
  interest_rate numeric(5,2) NOT NULL DEFAULT 28.00,
  payment_term integer NOT NULL,
  monthly_payment numeric(10,2) NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT valid_order_status CHECK (status IN ('pending', 'approved', 'rejected', 'processing', 'completed', 'cancelled'))
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own orders" ON orders;
CREATE POLICY "Users can view own orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can create orders" ON orders;
CREATE POLICY "Users can create orders"
  ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Order Items
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id),
  quantity integer NOT NULL,
  unit_price numeric(10,2) NOT NULL,
  total_price numeric(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own order items" ON order_items;
CREATE POLICY "Users can view own order items"
  ON order_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create order items" ON order_items;
CREATE POLICY "Users can create order items"
  ON order_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- BNPL Payments
CREATE TABLE IF NOT EXISTS bnpl_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  amount numeric(10,2) NOT NULL,
  due_date date NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  paid_date timestamptz,
  payment_method text,
  transaction_id text,
  late_fee numeric(10,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT valid_payment_status CHECK (status IN ('pending', 'completed', 'failed', 'cancelled'))
);

ALTER TABLE bnpl_payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own BNPL payments" ON bnpl_payments;
CREATE POLICY "Users can view own BNPL payments"
  ON bnpl_payments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = bnpl_payments.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Add BNPL eligibility fields to applications
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'applications' AND column_name = 'bnpl_eligible'
  ) THEN
    ALTER TABLE applications 
    ADD COLUMN bnpl_eligible boolean DEFAULT false,
    ADD COLUMN bnpl_credit_limit numeric(10,2);
  END IF;
END $$;

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_application ON orders(application_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_bnpl_payments_order ON bnpl_payments(order_id);

-- Trigger to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_bnpl_payments_updated_at ON bnpl_payments;
CREATE TRIGGER update_bnpl_payments_updated_at
  BEFORE UPDATE ON bnpl_payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();