import { MapPin, Phone, Mail, Clock } from 'lucide-react'

export default function LocationSection() {
    return (
        <section className="py-24 px-4 lg:px-[var(--container)] max-w-7xl mx-auto">
            <div className="text-center mb-16">
                <h2 className="text-4xl font-black text-white mb-4">يسعدنا تواصلك</h2>
                <p className="text-[var(--text-muted)] text-lg">نحن أقرب إليك دائماً.. تواصل مع خدمة العملاء أو تفضل بزيارة الفرع</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="glass rounded-[2rem] overflow-hidden min-h-[400px] relative w-full border-[var(--border)] h-full">
                    <div className="absolute inset-0 bg-gradient-to-tr from-[#1a1a24] to-black flex items-center justify-center flex-col gap-6 group hover:bg-[#111] transition-colors">
                        <div className="w-24 h-24 rounded-full glass border-[var(--border)] flex items-center justify-center group-hover:scale-110 transition-transform shadow-[0_0_30px_rgba(34,211,238,0.2)] group-hover:shadow-[0_0_50px_rgba(34,211,238,0.4)]">
                            <MapPin size={40} className="text-[var(--neon-cyan)]" />
                        </div>
                        <div className="text-center">
                            <span className="text-2xl font-bold block mb-2 text-white">فرع مدينة نصر</span>
                            <span className="text-sm text-[var(--text-muted)] font-medium">هنا تضاف خريطة Google التفاعلية لاحقاً</span>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col gap-5">
                    <div className="glass p-8 rounded-[2rem] flex items-start gap-5 hover:border-[var(--neon-cyan)] transition-colors group">
                        <div className="p-3 bg-[var(--bg)] rounded-2xl group-hover:bg-[var(--neon-cyan)]/10 transition-colors">
                            <MapPin className="text-[var(--neon-cyan)]" size={28} />
                        </div>
                        <div>
                            <h4 className="text-xl font-bold text-white mb-2">العنوان الرسمي</h4>
                            <p className="text-[var(--text-muted)] leading-relaxed text-lg">القاهرة، مصر (نسخة تجريبية)</p>
                        </div>
                    </div>
                    <div className="glass p-8 rounded-[2rem] flex items-start gap-5 hover:border-[var(--neon-cyan)] transition-colors group">
                        <div className="p-3 bg-[var(--bg)] rounded-2xl group-hover:bg-[var(--neon-cyan)]/10 transition-colors">
                            <Clock className="text-[var(--neon-cyan)]" size={28} />
                        </div>
                        <div>
                            <h4 className="text-xl font-bold text-white mb-2">أوقات العمل</h4>
                            <p className="text-[var(--text-muted)] leading-relaxed text-lg">السبت - الخميس: 10:00 صباحاً حتى 10:00 مساءً<br /><span className="text-red-400">الجمعة مغلق</span></p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-2">
                        <a href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP}`} target="_blank" rel="noopener noreferrer" className="glass p-8 rounded-[2rem] flex flex-col items-center text-center gap-4 hover:bg-[#25D366] hover:text-white transition-all group hover:border-[#25D366] hover:scale-[1.02]">
                            <Phone className="text-[#25D366] group-hover:text-white group-hover:scale-110 transition-transform" size={40} />
                            <span className="font-bold text-lg">واتساب المبيعات</span>
                        </a>
                        <a href="mailto:admin@gmail.com" className="glass p-8 rounded-[2rem] flex flex-col items-center text-center gap-4 hover:bg-[var(--neon)] hover:text-white transition-all group hover:border-[var(--neon)] hover:scale-[1.02]">
                            <Mail className="text-[var(--neon-cyan)] group-hover:text-white group-hover:scale-110 transition-transform" size={40} />
                            <span className="font-bold text-lg">البريد الإلكتروني</span>
                        </a>
                    </div>
                </div>
            </div>
        </section>
    )
}
