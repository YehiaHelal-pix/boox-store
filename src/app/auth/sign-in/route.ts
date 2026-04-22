import { NextResponse } from 'next/server'
import { isAdminUser, sanitizeAdminNextPath } from '@/lib/auth/admin'
import { createClient } from '@/lib/supabase/server'

function buildLoginUrl(request: Request, errorCode: 'invalid_credentials' | 'not_admin', nextPath: string) {
  const url = new URL('/auth/login', request.url)
  url.searchParams.set('error', errorCode)
  url.searchParams.set('next', nextPath)
  return url
}

export async function POST(request: Request) {
  const formData = await request.formData()
  const email = typeof formData.get('email') === 'string' ? formData.get('email')!.toString().trim().toLowerCase() : ''
  const password = typeof formData.get('password') === 'string' ? formData.get('password')!.toString() : ''
  const nextValue = typeof formData.get('next') === 'string' ? formData.get('next')!.toString() : undefined
  const nextPath = sanitizeAdminNextPath(nextValue)

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
