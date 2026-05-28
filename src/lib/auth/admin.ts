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

export async function getAdminAuthState() {
  const user = await getAuthenticatedUser()

  if (!user) {
    return { user: null, isAdmin: false }
  }

  return {
    user,
    isAdmin: await isAdminUser(user.id),
  }
}

export async function requireAdminPage(nextPath = '/admin') {
  const user = await getAuthenticatedUser()

  if (!user) {
    redirect(buildLoginRedirect(nextPath))
  }

  const isAdmin = await isAdminUser(user.id)

  if (!isAdmin) {
    redirect('/auth/forbidden')
  }

  return user
}

export async function requireAdminApiAccess(): Promise<AdminApiAccess> {
  const user = await getAuthenticatedUser()

  if (!user) {
    return {
      response: NextResponse.json({ error: 'لازم تسجل دخول الأول' }, { status: 401 }),
    }
  }

  const isAdmin = await isAdminUser(user.id)

  if (!isAdmin) {
    return {
      response: NextResponse.json({ error: 'صلاحيات الأدمن مطلوبة' }, { status: 403 }),
    }
  }

  return { user }
}

export function sanitizeAdminNextPath(nextPath?: string) {
  if (!nextPath || !nextPath.startsWith('/admin')) {
    return '/admin'
  }

  return nextPath
}
