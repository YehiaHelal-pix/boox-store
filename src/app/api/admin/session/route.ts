import { NextResponse } from 'next/server'
import { getAdminAuthState } from '@/lib/auth/admin'

export const dynamic = 'force-dynamic'

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}

export async function GET() {
  try {
    const { user, isAdmin } = await getAdminAuthState()

    if (!user) {
      return jsonError('لازم تسجل دخول الأول', 401)
    }

    if (!isAdmin) {
      return jsonError('صلاحيات الأدمن مطلوبة', 403)
    }

    return NextResponse.json({
      id: user.id,
      email: user.email ?? null,
      isAdmin: true,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'حدث خطأ غير متوقع'
    return jsonError(message, 500)
  }
}
