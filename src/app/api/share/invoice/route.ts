import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return jsonError('رقم المستند غير موجود', 400)
    }

    // جلب البيانات الأساسية من جدول smart_invoice_data بناءً على معامل المحل
    let shopId = 1;
    const shopSlug = searchParams.get('shop');
    if (shopSlug) {
      const { data: shopData } = await supabaseAdmin
        .from('shops')
        .select('id')
        .eq('slug', shopSlug)
        .eq('is_active', true)
        .maybeSingle();
        
      if (shopData) {
        shopId = shopData.id;
      }
    }

    const { data: dbData, error } = await supabaseAdmin
      .from('smart_invoice_data')
      .select('*')
      .eq('id', shopId)
      .single()

    if (error || !dbData) {
      return jsonError('فشل جلب قاعدة البيانات للمحل المطلوب', 500)
    }

    const invoices = (dbData.invoices || []) as any[]
    const settings = (dbData.settings || {}) as any
    const maintenanceJobs = (settings.maintenanceJobs || []) as any[]
    const contracts = (settings.contracts || []) as any[]

    // 1. البحث في فواتير المبيعات (Sales Invoices)
    const salesInv = invoices.find(i => i.id === id)
    if (salesInv) {
      // نسخ نظيف واستبعاد البيانات السرية
      const sanitized = JSON.parse(JSON.stringify(salesInv))
      
      // إزالة التكاليف والأرباح من الفاتورة والقطع
      delete sanitized.cost
      delete sanitized.margin
      delete sanitized.profit
      delete sanitized.expectedProfit
      delete sanitized.purchaseCost
      
      if (sanitized.items && Array.isArray(sanitized.items)) {
        sanitized.items.forEach((item: any) => {
          delete item.cost
          delete item.purchaseCost
          delete item.profit
        })
      }
      
      return NextResponse.json({ type: 'sales', data: sanitized })
    }

    // 2. البحث في الصيانة والوساطة (Maintenance Jobs)
    const mntJob = maintenanceJobs.find(j => j.id === id)
    if (mntJob) {
      const sanitized = JSON.parse(JSON.stringify(mntJob))
      
      // إزالة حقول مراكز الصيانة الخارجية والتكلفة والعمولات
      delete sanitized.repairCenter
      delete sanitized.centerCost
      delete sanitized.paidToCenter
      delete sanitized.expectedCommission
      delete sanitized.commission
      
      return NextResponse.json({ type: 'maintenance', data: sanitized })
    }

    // 3. البحث في عقود المبايعة (BOS Contracts)
    const contract = contracts.find(c => c.id === id)
    if (contract) {
      const sanitized = JSON.parse(JSON.stringify(contract))
      // عقود المبايعة لا تحتوي على تكاليف سرية لكن للتأكيد
      return NextResponse.json({ type: 'contract', data: sanitized })
    }

    return jsonError('لم يتم العثور على الفاتورة أو المستند المطلوب', 404)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'حدث خطأ غير متوقع'
    return jsonError(message, 500)
  }
}
