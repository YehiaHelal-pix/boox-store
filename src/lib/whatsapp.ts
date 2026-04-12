export function buildWhatsAppMessage(type: 'trade' | 'maintenance', data: any): string {
    const date = new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })

    if (type === 'trade') {
        const { customer_name, customer_phone, device_model, device_condition, battery_health, desired_model, tax_exempt, tax_value, has_warranty, warranty_months } = data
        const taxStr = tax_exempt ? 'معفي' : `غير معفي — ${tax_value} جنيه`
        const warStr = has_warranty ? `يوجد — ${warranty_months} شهر` : 'لا يوجد'

        return `🔄 *طلب استبدال جديد — Boox Store*
━━━━━━━━━━━━━━━━━
👤 الاسم: ${customer_name}
📞 الهاتف: ${customer_phone}
📱 الجهاز المراد استبداله: ${device_model}
🔋 صحة البطارية: ${battery_health || 'غير محدد'}%
✅ الحالة: ${device_condition}
🎯 الجهاز المطلوب: ${desired_model}
🧾 الضريبة: ${taxStr}
🛡️ الضمان: ${warStr}
━━━━━━━━━━━━━━━━━
📅 التاريخ: ${date}
🔗 رابط الإدارة: https://boox-store.vercel.app/admin/trade`
    }

    if (type === 'maintenance') {
        const { customer_name, customer_phone, device_model, issue_description } = data

        return `🔧 *طلب صيانة جديد — Boox Store*
━━━━━━━━━━━━━━━━━
👤 الاسم: ${customer_name}
📞 الهاتف: ${customer_phone}
📱 الجهاز: ${device_model}
🔨 المشكلة: ${issue_description}
━━━━━━━━━━━━━━━━━
📅 التاريخ: ${date}`
    }

    return ''
}
