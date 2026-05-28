import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('leads')
      .insert([{
        product_id: body.product_id || null,
        product_name: body.product_name || null,
        customer_name: body.customer_name || null,
        customer_phone: body.customer_phone || null,
        customer_message: body.customer_message || null,
        source: body.source || 'ask_boox',
      }])
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
