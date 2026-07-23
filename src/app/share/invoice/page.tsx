'use client'

import React, { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

interface InvoiceData {
  type: 'sales' | 'maintenance' | 'contract'
  data: any
}

function formatQuantityForPrint(name: string, qty: any) {
  const qtyNum = parseInt(qty) || 0;
  if (qtyNum <= 0) return qty;
  const nameLower = (name || '').toLowerCase().trim();
  
  const accessoryKeywords = [
    'جراب', 'شاحن', 'إسكرينة', 'اسكرينه', 'اسكرينة', 'شواحن', 'جرابات', 'اسكرينات',
    'سماعة', 'سماعه', 'سماعات', 'سلك', 'وصلة', 'وصله', 'كابل', 'كبل', 'راس', 'رأس',
    'لاصقة', 'لاصقه', 'حماية', 'حمايه', 'ستاند', 'حامل', 'قاعدة', 'قاعده', 'رنج',
    'case', 'cover', 'charger', 'screen', 'protector', 'cable', 'headphone', 'earphone',
    'earbuds', 'powerbank', 'power bank', 'adapter', 'holder', 'stand', 'ring'
  ];
  
  const isAccessory = accessoryKeywords.some(keyword => nameLower.includes(keyword));
  if (isAccessory) {
    return qtyNum.toString();
  }
  
  switch (qtyNum) {
    case 1: return 'جهاز';
    case 2: return 'جهازين';
    case 3: return 'ثلاثة أجهزة';
    case 4: return 'أربعة أجهزة';
    case 5: return 'خمسة أجهزة';
    case 6: return 'ستة أجهزة';
    case 7: return 'سبعة أجهزة';
    case 8: return 'ثمانية أجهزة';
    case 9: return 'تسعة أجهزة';
    case 10: return 'عشرة أجهزة';
    default: return `${qtyNum} جهاز`;
  }
}

function InvoiceViewerContent() {
  const searchParams = useSearchParams()
  const id = searchParams.get('id')
  const shop = searchParams.get('shop')
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<InvoiceData | null>(null)

  useEffect(() => {
    if (!id) {
      setError('رقم المستند غير موجود بالرابط')
      setLoading(false)
      return
    }

    let url = `/api/share/invoice?id=${encodeURIComponent(id)}`
    if (shop) {
      url += `&shop=${encodeURIComponent(shop)}`
    }

    fetch(url)
      .then(res => {
        if (!res.ok) {
          if (res.status === 404) throw new Error('المستند المطلوب غير موجود أو تم حذفه')
          throw new Error('فشل جلب بيانات الفاتورة')
        }
        return res.json()
      })
      .then((data: InvoiceData) => {
        setResult(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [id, shop])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-4">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400 font-medium text-xs">جاري جلب الفاتورة من السحابة...</p>
      </div>
    )
  }

  if (error || !result) {
    return (
      <div className="text-center p-6 bg-rose-950/20 border border-rose-500/30 rounded-xl max-w-md mx-auto my-10 font-sans">
        <div className="text-rose-500 text-3xl mb-3">⚠️</div>
        <h3 className="text-sm font-bold text-rose-400 mb-2">حدث خطأ ما</h3>
        <p className="text-gray-300 text-xs mb-4">{error || 'تعذر تحميل المستند'}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-rose-600 hover:bg-rose-500 transition-colors text-white rounded-lg text-[10px] font-bold"
        >
          إعادة المحاولة
        </button>
      </div>
    )
  }

  const { type, data } = result
  const formattedDate = data.date || data.dateReceived ? new Date(data.date || data.dateReceived).toLocaleString('ar-EG', { dateStyle: 'long', timeStyle: 'short' }) : '-'

  const formatCurrency = (val: any) => {
    const num = parseFloat(val) || 0
    return num.toLocaleString('ar-EG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/40 rounded-2xl p-5 md:p-8 shadow-2xl w-full max-w-xl mx-auto my-4 transition-all duration-300 font-sans" style={{ direction: 'rtl' }}>
      {/* رأس الفاتورة */}
      <div className="text-center border-b border-slate-700/50 pb-5 mb-5">
        <div className="w-14 h-14 mx-auto mb-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center shadow-lg">
          <span className="text-emerald-400 font-black text-2xl tracking-tighter">B</span>
        </div>
        <h1 className="text-xl font-black text-white tracking-wide">Boox Store</h1>
        <p className="text-[10px] text-gray-400 mt-1">مبيعات - صيانة - إكسسوارات</p>
        <p className="text-[10px] text-emerald-400/80 font-mono mt-1">boox-store.vercel.app</p>
      </div>

      {/* معلومات المستند الأساسية */}
      <div className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-4 mb-6 grid grid-cols-2 gap-4 text-xs md:text-sm text-right">
        <div>
          <span className="text-gray-400 block mb-1">نوع المستند:</span>
          <span className="font-bold text-emerald-400">
            {type === 'sales' && (data.paymentMethod === 'installment' ? 'فاتورة مبيعات وتقسيط 📊' : 'فاتورة مبيعات نقدية 🧾')}
            {type === 'maintenance' && 'طلب استلام صيانة 🛠️'}
            {type === 'contract' && 'عقد مبايعة هاتف مستعمل 🤝'}
          </span>
        </div>
        <div>
          <span className="text-gray-400 block mb-1">رقم المستند:</span>
          <span className="font-mono font-bold text-white tracking-wider">{data.id}</span>
        </div>
        <div>
          <span className="text-gray-400 block mb-1">تاريخ الإصدار:</span>
          <span className="font-medium text-white">{formattedDate}</span>
        </div>
        <div>
          <span className="text-gray-400 block mb-1">العميل:</span>
          <span className="font-bold text-white">{data.customerName || data.sellerName}</span>
        </div>
        <div className="col-span-2 border-t border-slate-800 pt-3">
          <span className="text-gray-400 block mb-1">رقم الهاتف:</span>
          <span className="font-mono font-bold text-white" dir="ltr">{data.customerPhone || data.sellerPhone || '-'}</span>
        </div>
      </div>

      {/* تفاصيل المبيعات */}
      {type === 'sales' && (
        <div className="space-y-6">
          <h3 className="text-xs font-bold text-white border-r-4 border-emerald-500 pr-2">المنتجات والخدمات</h3>
          <div className="space-y-3">
            {data.items && data.items.map((item: any, idx: number) => (
              <div key={idx} className="bg-slate-800/10 border border-slate-800/80 rounded-xl p-3 flex justify-between items-start gap-4 text-xs md:text-sm">
                <div>
                  <h4 className="font-bold text-white">{item.name}</h4>
                  <p className="text-[10px] text-gray-400 mt-1">الكمية: {formatQuantityForPrint(item.name, item.quantity)} &times; {formatCurrency(item.price)} ج.م</p>
                  {item.returnedQty > 0 && (
                    <p className="text-[10px] text-rose-400 font-semibold mt-1">تم إرجاع {item.returnedQty} قطع</p>
                  )}
                </div>
                <div className="font-bold text-emerald-400">{formatCurrency(item.total)} ج.م</div>
              </div>
            ))}
          </div>

          {/* الإجماليات */}
          <div className="bg-emerald-950/10 border border-emerald-500/20 rounded-xl p-4 space-y-2 text-xs md:text-sm">
            <div className="flex justify-between text-gray-300">
              <span>الإجمالي الفرعي:</span>
              <span className="font-semibold text-white">{formatCurrency(data.items?.reduce((acc: number, item: any) => acc + (item.total || 0), 0))} ج.م</span>
            </div>
            {data.discount > 0 && (
              <div className="flex justify-between text-rose-400">
                <span>خصم خاص:</span>
                <span>-{formatCurrency(data.discount)} ج.م</span>
              </div>
            )}
            {data.applyInterest && data.interestAmount > 0 && (
              <div className="flex justify-between text-amber-400">
                <span>فوائد التقسيط المضافة ({data.interestRate}%):</span>
                <span>+{formatCurrency(data.interestAmount)} ج.م</span>
              </div>
            )}
            {data.taxAmount > 0 && (
              <div className="flex justify-between text-gray-300">
                <span>الضريبة:</span>
                <span>+{formatCurrency(data.taxAmount)} ج.م</span>
              </div>
            )}
            <hr className="border-emerald-500/20 my-2" />
            <div className="flex justify-between text-sm md:text-base font-black text-emerald-400">
              <span>الصافي النهائي:</span>
              <span>{formatCurrency(data.total)} ج.م</span>
            </div>
            <div className="flex justify-between text-xs text-gray-300 pt-1">
              <span>المدفوع:</span>
              <span className="text-emerald-400 font-bold">{formatCurrency(data.paid)} ج.م</span>
            </div>
            <div className="flex justify-between text-xs text-gray-300">
              <span>المتبقي:</span>
              <span className="text-rose-400 font-bold">{formatCurrency(data.remaining)} ج.م</span>
            </div>
          </div>

          {/* جدول الأقساط */}
          {data.paymentMethod === 'installment' && data.installments && data.installments.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-white border-r-4 border-amber-500 pr-2">جدول الأقساط الشهرية</h3>
              <div className="border border-slate-700/30 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-right border-collapse">
                  <thead>
                    <tr className="bg-slate-800/40 text-gray-300 border-b border-slate-700/50">
                      <th className="p-3">م</th>
                      <th className="p-3">تاريخ الاستحقاق</th>
                      <th className="p-3 text-left">قيمة القسط</th>
                      <th className="p-3 text-center">حالة السداد</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.installments.map((inst: any, idx: number) => (
                      <tr key={idx} className="border-b border-slate-800/60 hover:bg-slate-800/10">
                        <td className="p-3 text-gray-400">{idx + 1}</td>
                        <td className="p-3 text-white font-medium">{new Date(inst.dueDate).toLocaleDateString('ar-EG')}</td>
                        <td className="p-3 text-amber-400 font-bold text-left">{formatCurrency(inst.amount)} ج.م</td>
                        <td className="p-3 text-center">
                          {inst.paid ? (
                            <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-bold text-[9px]">مُسدد ✅</span>
                          ) : (
                            <span className="bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded-full font-bold text-[9px]">مستحق ⏳</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* تفاصيل الصيانة وتتبع الحالة */}
      {type === 'maintenance' && (
        <div className="space-y-6">
          <h3 className="text-xs font-bold text-white border-r-4 border-emerald-500 pr-2">تتبع حالة الجهاز فوراً</h3>

          {/* متتبع الحالة البصري */}
          <div className="bg-slate-800/20 border border-slate-800/50 rounded-xl p-5 flex flex-col md:flex-row justify-between items-center gap-6 md:gap-2 text-[10px] md:text-xs relative overflow-hidden">
            <div className="absolute right-1/2 top-0 bottom-0 w-1 bg-slate-700/40 md:right-4 md:left-4 md:top-1/2 md:bottom-auto md:h-1 z-0"></div>
            
            {/* تم الاستلام */}
            <div className="flex flex-row md:flex-col items-center gap-3 md:gap-2 z-10 w-full md:w-auto">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold border-2 ${
                ['received', 'sent_to_center', 'repaired', 'delivered'].includes(data.status)
                  ? 'bg-amber-500 border-amber-400 text-slate-900 shadow-lg shadow-amber-500/20'
                  : 'bg-slate-800 border-slate-700 text-gray-400'
              }`}>📥</div>
              <span className="font-bold text-white">استلام الجهاز</span>
            </div>

            {/* عند مركز الصيانة */}
            <div className="flex flex-row md:flex-col items-center gap-3 md:gap-2 z-10 w-full md:w-auto">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold border-2 ${
                ['sent_to_center', 'repaired', 'delivered'].includes(data.status)
                  ? 'bg-cyan-500 border-cyan-400 text-slate-900 shadow-lg shadow-cyan-500/20'
                  : 'bg-slate-800 border-slate-700 text-gray-400'
              }`}>🛠️</div>
              <span className="font-bold text-white">فحص وتصليح</span>
            </div>

            {/* تم الإصلاح وجاهز */}
            <div className="flex flex-row md:flex-col items-center gap-3 md:gap-2 z-10 w-full md:w-auto">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold border-2 ${
                ['repaired', 'delivered'].includes(data.status)
                  ? 'bg-emerald-500 border-emerald-400 text-slate-900 shadow-lg shadow-emerald-500/20'
                  : 'bg-slate-800 border-slate-700 text-gray-400'
              }`}>🟢</div>
              <span className="font-bold text-white">جاهز للاستلام</span>
            </div>

            {/* تم التسليم */}
            <div className="flex flex-row md:flex-col items-center gap-3 md:gap-2 z-10 w-full md:w-auto">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold border-2 ${
                data.status === 'delivered'
                  ? 'bg-emerald-600 border-emerald-500 text-slate-900 shadow-lg shadow-emerald-600/20'
                  : 'bg-slate-800 border-slate-700 text-gray-400'
              }`}>🤝</div>
              <span className="font-bold text-white">تم التسليم</span>
            </div>
          </div>

          {/* معلومات الجهاز الفنية */}
          <div className="bg-slate-800/10 border border-slate-800 rounded-xl p-4 space-y-3 text-xs md:text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">الجهاز المطلوب صيانته:</span>
              <strong className="text-white">{data.deviceModel}</strong>
            </div>
            {data.deviceSerial && (
              <div className="flex justify-between">
                <span className="text-gray-400">S/N / IMEI:</span>
                <span className="font-mono text-white">{data.deviceSerial}</span>
              </div>
            )}
            <div className="flex flex-col gap-1 border-t border-slate-800/80 pt-3">
              <span className="text-gray-400">العطل / المشكلة بالتفصيل:</span>
              <p className="text-amber-400 font-bold bg-amber-500/5 border border-amber-500/10 rounded-lg p-2.5 mt-1">{data.problemDescription}</p>
            </div>
            {data.notes && (
              <div className="flex flex-col gap-1 border-t border-slate-800/80 pt-3">
                <span className="text-gray-400">ملاحظات وإكسسوارات مرفقة:</span>
                <p className="text-white bg-slate-800/40 rounded-lg p-2 mt-1">{data.notes}</p>
              </div>
            )}
            <div className="flex justify-between border-t border-slate-800/80 pt-3 text-gray-300">
              <span>تاريخ التسليم المتوقع:</span>
              <span className="font-bold text-white">{new Date(data.expectedDate).toLocaleDateString('ar-EG')}</span>
            </div>
          </div>

          {/* حسابات التكلفة والمدفوع */}
          <div className="bg-emerald-950/10 border border-emerald-500/20 rounded-xl p-4 space-y-2 text-xs md:text-sm">
            <div className="flex justify-between text-gray-300">
              <span>مقدم الصيانة المدفوع:</span>
              <span className="font-bold text-emerald-400">{formatCurrency(data.depositPaid)} ج.م</span>
            </div>
            {data.customerPrice > 0 && (
              <>
                <div className="flex justify-between text-gray-300">
                  <span>سعر الصيانة النهائي:</span>
                  <span className="font-bold text-white">{formatCurrency(data.customerPrice)} ج.م</span>
                </div>
                <hr className="border-emerald-500/20 my-2" />
                <div className="flex justify-between text-sm font-black text-rose-400">
                  <span>المتبقي عند الاستلام:</span>
                  <span>{formatCurrency(Math.max(0, data.customerPrice - data.depositPaid))} ج.م</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* تفاصيل عقد المبايعة */}
      {type === 'contract' && (
        <div className="space-y-6">
          <h3 className="text-xs font-bold text-white border-r-4 border-emerald-500 pr-2">عقد المبايعة القانوني</h3>
          
          <div className="bg-slate-800/20 border border-slate-800 rounded-xl p-4 space-y-3 text-xs md:text-sm leading-relaxed text-gray-300">
            <p>
              أقر أنا السيد/ <strong>{data.sellerName}</strong> المقيم في العنوان {data.sellerAddress || '-'} وحامل البطاقة الشخصية رقم <strong className="font-mono text-white">{data.sellerId || '-'}</strong>، بأنني قد بعت وتنازلت نهائياً عن الهاتف الخاص بي والموضح بياناته أدناه إلى متجر <strong>Boox Store</strong>.
            </p>
            <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-800 space-y-2 font-medium">
              <div>• موديل الجهاز: <span className="text-white font-bold">{data.deviceModel}</span></div>
              <div>• الرقم المسلسل/IMEI: <span className="text-white font-bold font-mono">{data.deviceImei || '-'}</span></div>
              {data.deviceSim && <div>• منفذ الشريحة: <span className="text-white font-bold">{data.deviceSim}</span></div>}
            </div>
            <p>
              وذلك لقاء مبلغ وقدره <strong className="text-emerald-400">{formatCurrency(data.price)} ج.م</strong> تم استلامه عداً ونقداً بالكامل بمجلس هذا العقد. وأقر بأن الهاتف ملكي الشخصي وخالٍ من أي عيوب قانونية أو سرقات أو شبهات أمنية وأتحمل المسؤولية الجنائية والمدنية كاملة في حال ثبوت خلاف ذلك.
            </p>
          </div>
        </div>
      )}

      {/* تذييل الصفحة الفني */}
      <div className="text-center border-t border-slate-700/50 pt-5 mt-6 text-[10px] text-gray-400 space-y-1 font-medium">
        <p>هذه الفاتورة تم توليدها سحابياً لعملاء Boox Store</p>
        <p>كورنيش النيل - المناشي البلد | هاتف: 01113614021</p>
        <p className="text-[9px] text-gray-500 mt-2">حقوق النشر &copy; {new Date().getFullYear()} Boox Store. جميع الحقوق محفوظة.</p>
      </div>
    </div>
  )
}

export default function InvoiceViewerPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-right p-4 flex items-center justify-center antialiased">
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center min-h-[300px] gap-4">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 font-medium text-xs">جاري تحميل المعاينة...</p>
        </div>
      }>
        <InvoiceViewerContent />
      </Suspense>
    </main>
  )
}
