import { NextRequest, NextResponse } from 'next/server'
import { requireAdminApiAccess } from '@/lib/auth/admin'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const access = await requireAdminApiAccess()
  if ('response' in access) return access.response

  try {
    const body = await request.json()
    const { data, error } = await supabaseAdmin
      .from('leads')
      .update(body)
      .eq('id', id)
      .select('*')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
