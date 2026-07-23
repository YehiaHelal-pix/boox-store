import React from 'react'
import { RegisterForm } from './RegisterForm'

export const metadata = {
  title: 'تسجيل متجر جديد - نظام الفواتير الذكي',
  description: 'سجل متجرك الآن واحصل على لوحة تحكم كاملة وفواتير ذكية مخصصة لمتجرك بالكامل.',
}

export default function RegisterPage() {
  return (
    <main className="relative min-h-screen bg-[#070a13] font-sans flex items-center justify-center p-4 md:p-8 overflow-hidden">
      {/* الخلفيات الفنية والمؤثرات الضوئية */}
      <div className="absolute top-[-10%] right-[-10%] w-[300px] md:w-[600px] h-[300px] md:h-[600px] rounded-full bg-[var(--neon-cyan)]/10 blur-[80px] md:blur-[150px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[300px] md:w-[600px] h-[300px] md:h-[600px] rounded-full bg-[var(--neon-cyan)]/5 blur-[80px] md:blur-[150px] pointer-events-none"></div>

      <div className="w-full max-w-4xl relative z-10 grid md:grid-cols-5 gap-8 items-center">
        {/* الجانب التعريفي الأيسر */}
        <div className="md:col-span-2 text-right text-gray-300 space-y-6 pr-0 md:pr-4">
          <div className="inline-block px-3 py-1 rounded-full border border-[var(--neon-cyan)]/30 bg-[var(--neon-cyan)]/10 text-xs font-bold text-[var(--neon-cyan)]">
            نظام المتاجر المتعددة (SaaS)
          </div>
          <h1 className="text-3xl font-black text-white leading-tight">
            ابنِ لوحة تحكم وفواتير مخصصة لمتجرك
          </h1>
          <p className="text-xs leading-relaxed text-gray-400">
            احصل على نظام متكامل لإدارة المبيعات، الصيانة، الأقساط، والعملاء يحمل شعار متجرك، رقم هاتفك، وعنوانك بالكامل، مع إمكانية طباعة إيصالات الطابعة الحرارية وتنزيل ملف الكمبيوتر المحلي للعمل بدون إنترنت.
          </p>
          <ul className="space-y-3 text-xs">
            <li className="flex items-center gap-2 justify-start dir-rtl">
              <span className="text-[var(--neon-cyan)] font-bold">✓</span>
              <span>عزل كامل وآمن لبيانات فواتيرك ومنتجاتك</span>
            </li>
            <li className="flex items-center gap-2 justify-start dir-rtl">
              <span className="text-[var(--neon-cyan)] font-bold">✓</span>
              <span>إرسال فواتير أونلاين وتوليد QR Codes باسم متجرك</span>
            </li>
            <li className="flex items-center gap-2 justify-start dir-rtl">
              <span className="text-[var(--neon-cyan)] font-bold">✓</span>
              <span>تحميل ملف محلي ذكي يعمل بدون إنترنت نهائياً</span>
            </li>
          </ul>
        </div>

        {/* نموذج التسجيل الأيمن */}
        <div className="md:col-span-3 w-full flex justify-center">
          <RegisterForm />
        </div>
      </div>
    </main>
  )
}
