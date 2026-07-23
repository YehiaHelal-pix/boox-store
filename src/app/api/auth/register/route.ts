import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}

export async function POST(request: NextRequest) {
  let createdUserId: string | null = null
  let createdShopId: number | null = null

  try {
    const body = await request.json()
    const { email, password, shopName, shopSlug, shopPhone, shopAddress, shopLogo } = body

    // 1. التحقق من المدخلات
    if (!email || !password || !shopName || !shopSlug || !shopPhone || !shopAddress) {
      return jsonError('برجاء كتابة جميع البيانات الأساسية المطلوبة', 400)
    }

    const trimmedSlug = shopSlug.trim().toLowerCase()
    // تحقق من الـ slug (أحرف، أرقام وشرطة فقط)
    if (!/^[a-z0-9-]+$/.test(trimmedSlug)) {
      return jsonError('رابط المحل غير صالح. يجب أن يحتوي فقط على أحرف إنجليزية صغيرة، أرقام، وشرطة (-)', 400)
    }

    // 2. التحقق من فرادة الـ slug في قاعدة البيانات
    const { data: existingShop, error: slugCheckError } = await supabaseAdmin
      .from('shops')
      .select('id')
      .eq('slug', trimmedSlug)
      .maybeSingle()

    if (slugCheckError) {
      return jsonError('حدث خطأ أثناء التحقق من توفر رابط المحل', 500)
    }

    if (existingShop) {
      return jsonError('رابط المحل هذا محجوز مسبقاً، يرجى اختيار رابط آخر', 400)
    }

    // 3. إنشاء المستخدم في Supabase Auth باستخدام Service Role لكي يفعل الحساب فوراً
    const { data: userData, error: userCreationError } = await supabaseAdmin.auth.admin.createUser({
      email: email.trim().toLowerCase(),
      password: password,
      email_confirm: true,
    })

    if (userCreationError || !userData.user) {
      return jsonError(userCreationError?.message || 'فشل إنشاء حساب المستخدم الصلاحي', 500)
    }

    createdUserId = userData.user.id

    // 4. إدراج المحل الجديد في جدول shops
    const { data: shopData, error: shopInsertionError } = await supabaseAdmin
      .from('shops')
      .insert({
        name: shopName.trim(),
        slug: trimmedSlug,
        owner_email: email.trim().toLowerCase(),
        is_active: true,
      })
      .select('id')
      .single()

    if (shopInsertionError || !shopData) {
      // Rollback: حذف حساب المستخدم إذا فشلت هذه الخطوة
      await supabaseAdmin.auth.admin.deleteUser(createdUserId)
      return jsonError(shopInsertionError?.message || 'فشل تسجيل بيانات المحل الجديد', 500)
    }

    createdShopId = shopData.id

    // 5. ربط مستخدم الأدمن بالمحل الجديد في جدول admin_users
    const { error: adminUserLinkError } = await supabaseAdmin
      .from('admin_users')
      .insert({
        user_id: createdUserId,
        email: email.trim().toLowerCase(),
        shop_id: createdShopId,
        is_active: true,
      })

    if (adminUserLinkError) {
      // Rollback: حذف المحل والمستخدم إذا فشلت هذه الخطوة
      await supabaseAdmin.from('shops').delete().eq('id', createdShopId)
      await supabaseAdmin.auth.admin.deleteUser(createdUserId)
      return jsonError(adminUserLinkError.message || 'فشل ربط المستخدم بالمحل', 500)
    }

    // 6. تهيئة إعدادات المحل وقاعدة البيانات الافتراضية له في smart_invoice_data
    const defaultSettings = {
      shopName: shopName.trim(),
      shopAddress: shopAddress.trim(),
      shopPhone: shopPhone.trim(),
      shopLogo: shopLogo?.trim() || '/assets/boox-logo.jpg',
      last_updated: new Date().getTime(),
      purchaseInvoices: [],
      suppliers: [],
      maintenanceJobs: [],
    }

    // منتجات افتراضية لمساعدة المحل على البدء فوراً
    const defaultProducts = [
      { sku: "IPH16PM", name: "iPhone 16 Pro Max", cost: 0, price: 0, stock: 0, colors: ["بدون لون", "تيتانيوم صحراوي", "تيتانيوم طبيعي", "تيتانيوم أبيض", "تيتانيوم أسود"], capacities: ["بدون سعة", "256GB", "512GB", "1TB"] },
      { sku: "IPH16P", name: "iPhone 16 Pro", cost: 0, price: 0, stock: 0, colors: ["بدون لون", "تيتانيوم صحراوي", "تيتانيوم طبيعي", "تيتانيوم أبيض", "تيتانيوم أسود"], capacities: ["بدون سعة", "128GB", "256GB", "512GB", "1TB"] },
      { sku: "IPH15PM", name: "iPhone 15 Pro Max", cost: 0, price: 0, stock: 0, colors: ["بدون لون", "تيتانيوم طبيعي", "تيتانيوم أزرق", "تيتانيوم أبيض", "تيتانيوم أسود"], capacities: ["بدون سعة", "256GB", "512GB", "1TB"] }
    ]

    const { error: seedError } = await supabaseAdmin
      .from('smart_invoice_data')
      .insert({
        id: createdShopId,
        invoices: [],
        customers: [],
        settings: defaultSettings,
      })

    if (seedError) {
      // Rollback: تنظيف كامل البيانات لضمان عدم حدوث تعليق
      await supabaseAdmin.from('admin_users').delete().eq('user_id', createdUserId)
      await supabaseAdmin.from('shops').delete().eq('id', createdShopId)
      await supabaseAdmin.auth.admin.deleteUser(createdUserId)
      return jsonError('فشل تهيئة قاعدة البيانات الافتراضية للمحل الجديد: ' + seedError.message, 500)
    }

    // 7. الرد بنجاح التسجيل
    return NextResponse.json({
      success: true,
      message: 'تم تسجيل المحل وتهيئة النظام بالكامل بنجاح!',
      shopSlug: trimmedSlug,
    })

  } catch (error) {
    // معالجة استثنائية عامة
    const message = error instanceof Error ? error.message : 'حدث خطأ غير متوقع أثناء المعالجة'
    return jsonError(message, 500)
  }
}
