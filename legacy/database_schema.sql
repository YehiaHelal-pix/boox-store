-- 1. products
CREATE TABLE IF NOT EXISTS products (
  id             UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  name           TEXT    NOT NULL,
  description    TEXT,
  price          DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  category       TEXT    NOT NULL DEFAULT 'other'
                 CHECK (category IN ('iphone','ipad','macbook','airpods','accessories','other')),
  image_url      TEXT,
  in_stock       BOOLEAN DEFAULT true,
  stock_count    INTEGER DEFAULT 0,
  is_featured    BOOLEAN DEFAULT false,
  sort_order     INTEGER DEFAULT 0,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- 2. site_settings
CREATE TABLE IF NOT EXISTS site_settings (
  key        TEXT PRIMARY KEY,
  value      JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
INSERT INTO site_settings (key, value) VALUES
  ('hero_title',      '"أجهزة Apple الأصلية بأفضل الأسعار"'),
  ('hero_subtitle',   '"جودة موثوقة | ضمان رسمي | توصيل لكل مصر"'),
  ('promo_text',      '"🍎 ضمان سنة | 📦 توصيل سريع | 🔧 صيانة معتمدة"'),
  ('promo_enabled',   'true'),
  ('whatsapp_number', '"201113614021"'),
  ('store_address',   '"القاهرة، مصر"'),
  ('working_hours',   '"السبت - الخميس: 10ص - 10م"')
ON CONFLICT (key) DO NOTHING;

-- 3. audit_logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_email TEXT NOT NULL,
  action      TEXT NOT NULL,
  table_name  TEXT,
  record_id   TEXT,
  old_data    JSONB,
  new_data    JSONB,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 4. maintenance_requests
CREATE TABLE IF NOT EXISTS maintenance_requests (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  phone         TEXT NOT NULL,
  device_type   TEXT NOT NULL,
  device_model  TEXT NOT NULL,
  issue         TEXT NOT NULL,
  status        TEXT DEFAULT 'pending'
                CHECK (status IN ('pending','in_progress','completed','cancelled')),
  admin_notes   TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 5. trade_requests
CREATE TABLE IF NOT EXISTS trade_requests (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name  TEXT NOT NULL,
  phone          TEXT NOT NULL,
  old_device     TEXT NOT NULL,
  old_condition  TEXT NOT NULL,
  desired_device TEXT NOT NULL,
  status         TEXT DEFAULT 'pending'
                 CHECK (status IN ('pending','reviewing','approved','rejected')),
  admin_notes    TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Realtime
ALTER TABLE products REPLICA IDENTITY FULL;
-- Note: You may need to create the publication first if it doesn't exist
DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime;
ALTER PUBLICATION supabase_realtime ADD TABLE products;
ALTER PUBLICATION supabase_realtime ADD TABLE maintenance_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE trade_requests;

-- RLS
ALTER TABLE products             ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings        ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs           ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE trade_requests       ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_products"   ON products FOR SELECT USING (true);
CREATE POLICY "admin_write_products"   ON products FOR ALL   USING (auth.role()='service_role');
CREATE POLICY "public_read_settings"   ON site_settings FOR SELECT USING (true);
CREATE POLICY "admin_write_settings"   ON site_settings FOR ALL   USING (auth.role()='service_role');
CREATE POLICY "admin_all_logs"         ON audit_logs    FOR ALL   USING (auth.role()='service_role');
CREATE POLICY "public_insert_maint"    ON maintenance_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "admin_all_maint"        ON maintenance_requests FOR ALL   USING (auth.role()='service_role');
CREATE POLICY "public_insert_trade"    ON trade_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "admin_all_trade"        ON trade_requests FOR ALL   USING (auth.role()='service_role');

-- updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;
CREATE TRIGGER trg_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Storage
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('product-images','product-images',true,5242880,
        ARRAY['image/jpeg','image/png','image/webp','image/avif'])
ON CONFLICT (id) DO NOTHING;
CREATE POLICY "public_read_images"  ON storage.objects FOR SELECT USING (bucket_id='product-images');
CREATE POLICY "admin_upload_images" ON storage.objects FOR INSERT WITH CHECK (bucket_id='product-images' AND auth.role()='service_role');
CREATE POLICY "admin_delete_images" ON storage.objects FOR DELETE USING (bucket_id='product-images' AND auth.role()='service_role');
