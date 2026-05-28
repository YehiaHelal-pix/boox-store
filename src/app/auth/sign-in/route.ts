import { NextResponse } from 'next/server'
import { isAdminUser, sanitizeAdminNextPath } from '@/lib/auth/admin'
import { createClient } from '@/lib/supabase/server'

const DEFAULT_ADMIN_USERNAME = 'box2026'

function buildLoginUrl(request: Request, errorCode: 'invalid_credentials' | 'not_admin', nextPath: string) {
  const url = new URL('/admin', request.url)
  url.searchParams.set('error', errorCode)
  url.searchParams.set('next', nextPath)
  return url
}

function getConfiguredAdminIdentity() {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase() ?? ''
  const adminUsername = process.env.ADMIN_USERNAME?.trim().toLowerCase() || DEFAULT_ADMIN_USERNAME

  return { adminEmail, adminUsername }
}

function resolveAdminEmail(rawUsername: string) {
  const normalizedUsername = rawUsername.trim().toLowerCase()
  const { adminEmail, adminUsername } = getConfiguredAdminIdentity()

  if (!normalizedUsername || !adminEmail) {
    return ''
  }

  if (normalizedUsername === adminUsername) {
    return adminEmail
  }

  return ''
}

function resolveSubmittedEmail(formData: FormData) {
  const email = typeof formData.get('email') === 'string' ? formData.get('email')!.toString().trim().toLowerCase() : ''
  if (email) {
    return email
  }

  const username = typeof formData.get('username') === 'string' ? formData.get('username')!.toString() : ''
  if (username.includes('@')) {
    return username.trim().toLowerCase()
  }

  return resolveAdminEmail(username)
}

export async function POST(request: Request) {
  const formData = await request.formData()
  const password = typeof formData.get('password') === 'string' ? formData.get('password')!.toString() : ''
  const nextValue = typeof formData.get('next') === 'string' ? formData.get('next')!.toString() : undefined
  const nextPath = sanitizeAdminNextPath(nextValue)
  const email = resolveSubmittedEmail(formData)

  if (!email || !password) {
    return NextResponse.redirect(buildLoginUrl(request, 'invalid_credentials', nextPath), { status: 303 })
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error || !data.user) {
    return NextResponse.redirect(buildLoginUrl(request, 'invalid_credentials', nextPath), { status: 303 })
  }

  const isAdmin = await isAdminUser(data.user.id)

  if (!isAdmin) {
    await supabase.auth.signOut()
    return NextResponse.redirect(buildLoginUrl(request, 'not_admin', nextPath), { status: 303 })
  }

  return NextResponse.redirect(new URL(nextPath, request.url), { status: 303 })
}
