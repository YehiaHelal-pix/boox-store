import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const { data, error } = await supabaseAdmin
            .from('maintenance_requests')
            .select('*')
            .order('created_at', { ascending: false })
        if (error) return NextResponse.json({ error: error.message }, { status: 500 })
        return NextResponse.json(data)
    } catch {
        return NextResponse.json({ error: 'Internal error' }, { status: 500 })
    }
}

export async function PUT(req: NextRequest) {
    try {
        const body = await req.json()
        const { id, status, admin_notes } = body
        if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
        const updates: Record<string, string> = {}
        if (status) updates.status = status
        if (admin_notes !== undefined) updates.admin_notes = admin_notes
        const { data, error } = await supabaseAdmin.from('maintenance_requests').update(updates).eq('id', id).select().single()
        if (error) return NextResponse.json({ error: error.message }, { status: 500 })
        await supabaseAdmin.from('audit_logs').insert([{
            admin_email: 'admin',
            action: 'UPDATE_MAINTENANCE',
            table_name: 'maintenance_requests',
            record_id: id,
            new_data: data,
        }])
        return NextResponse.json(data)
    } catch {
        return NextResponse.json({ error: 'Internal error' }, { status: 500 })
    }
}
