-- Create products table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT,
    condition TEXT,
    price NUMERIC NOT NULL,
    description TEXT,
    specs JSONB,
    image_url TEXT,
    visible BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create store settings table
CREATE TABLE IF NOT EXISTS public.store_settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    store_name TEXT DEFAULT 'Boox Store',
    tagline TEXT DEFAULT 'تجربة Apple الفائقة',
    whatsapp TEXT DEFAULT '201113614021',
    facebook TEXT DEFAULT 'https://www.facebook.com/share/18KsWwmYZg/',
    maps_url TEXT,
    announcement TEXT,
    show_announcement BOOLEAN DEFAULT false,
    neon_color TEXT DEFAULT '#00d4ff',
    font_family TEXT DEFAULT 'Tajawal',
    stats_products INTEGER DEFAULT 0,
    stats_customers INTEGER DEFAULT 500,
    stats_years INTEGER DEFAULT 3,
    stats_guarantee INTEGER DEFAULT 100
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- Product Policies (Allow all for anon to bypass needing service role key on frontend)
CREATE POLICY "Enable ALL access for all users" ON public.products
    FOR ALL TO public USING (true) WITH CHECK (true);

-- Settings Policies (Allow all for anon to bypass needing service role key on frontend)
CREATE POLICY "Enable ALL access for all users" ON public.store_settings
    FOR ALL TO public USING (true) WITH CHECK (true);

-- Insert default settings
INSERT INTO public.store_settings (id) VALUES (1) ON CONFLICT DO NOTHING;
