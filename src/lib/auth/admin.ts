import { NextResponse } from 'next/server'
import { redirect } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

type AdminApiAccess =
  | {
      user: User
    }
  | {
      response: NextResponse
    }

function buildLoginRedirect(nextPath?: string) {
  const target = nextPath && nextPath.startsWith('/admin') ? nextPath : '/admin'
  const search = new URLSearchParams({ next: target })
  return `/admin/login?${search.toString()}`
}

export async function getAuthenticatedUser() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()

  if (error) {
    return null
  }

  return data.user ?? null
}

export async function isAdminUser(userId: string) {
  const { data, error } = await supabaseAdmin
    .from('admin_users')
    .select('id')
    .eq('user_id', userId)
    .eq('is_active', true)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  return Boolean(data)
}

export async function getAdminShopDetails(userId: string) {
  const { data, error } = await supabaseAdmin
    .from('admin_users')
    .select('shop_id, shops:shops(id, name, slug, is_active)')
    .eq('user_id', userId)
    .eq('is_active', true)
    .maybeSingle()

  if (error || !data || !data.shops) {
    return null
  }

  const shopObj = Array.isArray(data.shops) ? data.shops[0] : data.shops
  if (!shopObj || !shopObj.is_active) {
    return null
  }

  return {
    shopId: data.shop_id,
    shopName: shopObj.name,
    shopSlug: shopObj.slug
  }
}

export async function getAdminAuthState() {
  const user = await getAuthenticatedUser()

  if (!user) {
    return { user: null, isAdmin: false, shopId: null, shopSlug: null, shopName: null }
  }

  const shopDetails = await getAdminShopDetails(user.id)

  return {
    user,
    isAdmin: Boolean(shopDetails),
    shopId: shopDetails?.shopId ?? null,
    shopSlug: shopDetails?.shopSlug ?? null,
    shopName: shopDetails?.shopName ?? null,
  }
}

export async function requireAdminPage(nextPath = '/admin') {
  const user = await getAuthenticatedUser()

  if (!user) {
    redirect(buildLoginRedirect(nextPath))
  }

  const shopDetails = await getAdminShopDetails(user.id)

  if (!shopDetails) {
    redirect('/auth/forbidden')
  }

  return user
}

export async function requireAdminApiAccess() {
  const user = await getAuthenticatedUser()

  if (!user) {
    return {
      response: NextResponse.json({ error: 'لازم تسجل دخول الأول' }, { status: 401 }),
    }
  }

  const shopDetails = await getAdminShopDetails(user.id)

  if (!shopDetails) {
    return {
      response: NextResponse.json({ error: 'صلاحيات الإدارة غير صالحة أو المحل معطل' }, { status: 403 }),
    }
  }

  return {
    user,
    shopId: shopDetails.shopId,
    shopSlug: shopDetails.shopSlug,
    shopName: shopDetails.shopName
  }
}

export function sanitizeAdminNextPath(nextPath?: string) {
  if (!nextPath || !nextPath.startsWith('/admin')) {
    return '/admin'
  }

  return nextPath
}
