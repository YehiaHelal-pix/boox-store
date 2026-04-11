import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const { data, error } = await supabaseAdmin
            .from('products')
            .select('*')
            .order('sort_order')
            .order('created_at', { ascending: false })
        if (error) return NextResponse.json({ error: error.message }, { status: 500 })
        return NextResponse.json(data)
    } catch {
        return NextResponse.json({ error: 'Internal error' }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { data, error } = await supabaseAdmin.from('products').insert([body]).select().single()
        if (error) return NextResponse.json({ error: error.message }, { status: 500 })
        await supabaseAdmin.from('audit_logs').insert([{
            admin_email: 'admin',
            action: 'CREATE_PRODUCT',
            table_name: 'products',
            record_id: data.id,
            new_data: data,
        }])
        return NextResponse.json(data, { status: 201 })
    } catch {
        return NextResponse.json({ error: 'Internal error' }, { status: 500 })
    }
}

export async function PUT(req: NextRequest) {
    try {
        const body = await req.json()
        const { id, ...updates } = body
        if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
        const { data: old } = await supabaseAdmin.from('products').select('*').eq('id', id).single()
        const { data, error } = await supabaseAdmin.from('products').update(updates).eq('id', id).select().single()
        if (error) return NextResponse.json({ error: error.message }, { status: 500 })
        await supabaseAdmin.from('audit_logs').insert([{
            admin_email: 'admin',
            action: 'UPDATE_PRODUCT',
            table_name: 'products',
            record_id: id,
            old_data: old,
            new_data: data,
        }])
        return NextResponse.json(data)
    } catch {
        return NextResponse.json({ error: 'Internal error' }, { status: 500 })
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const body = await req.json()
        const { id } = body
        if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
        const { data: old } = await supabaseAdmin.from('products').select('*').eq('id', id).single()
        const { error } = await supabaseAdmin.from('products').delete().eq('id', id)
        if (error) return NextResponse.json({ error: error.message }, { status: 500 })
        await supabaseAdmin.from('audit_logs').insert([{
            admin_email: 'admin',
            action: 'DELETE_PRODUCT',
            table_name: 'products',
            record_id: id,
            old_data: old,
        }])
        return NextResponse.json({ success: true })
    } catch {
        return NextResponse.json({ error: 'Internal error' }, { status: 500 })
    }
}
