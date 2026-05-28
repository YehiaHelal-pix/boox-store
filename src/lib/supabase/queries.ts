import { createClient } from '@/lib/supabase/server';
import type { Product, Category, FilterDefinition, HomepageSection, Lead } from '@/types/database';

export async function getProducts(filters?: Record<string, string | string[]>) {
  const supabase = await createClient();
  let query = supabase.from('products').select('*, product_images(*)');

  if (filters) {
    if (filters.category) {
      query = query.eq('category', filters.category);
    }
    if (filters.condition) {
      query = query.eq('condition', filters.condition);
    }
    // Add more filters as needed
  }

  query = query.eq('is_available', true).order('display_order', { ascending: true });
  
  const { data, error } = await query;
  if (error) throw error;
  return data as any[];
}

export async function getProductBySlug(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select('*, product_images(*)')
    .eq('slug', slug)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data as any | null;
}

export async function getCategories() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (error) throw error;
  return data as Category[];
}

export async function getFilterDefinitions(categoryId?: string) {
  const supabase = await createClient();
  let query = supabase.from('filter_definitions').select('*').eq('is_active', true);

  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }

  const { data, error } = await query.order('display_order', { ascending: true });
  if (error) throw error;
  return data as FilterDefinition[];
}

export async function getHomepageSections() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('homepage_sections')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (error) throw error;
  return data as HomepageSection[];
}

export async function createLead(data: Partial<Lead>) {
  const supabase = await createClient();
  const { data: result, error } = await supabase
    .from('leads')
    .insert([data])
    .select()
    .single();

  if (error) throw error;
  return result as Lead;
}

export async function getFeaturedProducts() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select('*, product_images(*)')
    .eq('is_featured', true)
    .eq('is_available', true)
    .order('display_order', { ascending: true });

  if (error) throw error;
  return data as any[];
}

export async function getNewArrivals() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select('*, product_images(*)')
    .eq('is_new_arrival', true)
    .eq('is_available', true)
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) throw error;
  return data as any[];
}
