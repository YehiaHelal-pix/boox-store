import { BadgeCheck, Headphones, ShieldCheck, Sparkles, Truck, Wrench } from 'lucide-react'

const trustCards = [
  {
    title: 'منتجات أصلية ومراجعة',
    text: 'كل جهاز ظاهر في الموقع مرتبط ببياناته الحقيقية من قاعدة البيانات مع حالة وسعة ولون واضحين.',
    icon: ShieldCheck,
  },
  {
    title: 'شراء سريع عبر واتساب',
    text: 'زر استفسار مباشر لكل منتج بدون تغيير رقم التواصل الحالي أو روابط السوشيال.',
    icon: Headphones,
  },
  {
    title: 'توصيل ومتابعة طلبات',
    text: 'لوحة الإدارة تعرض الطلبات والصيانة والاستبدال لتسهيل المتابعة اليومية.',
    icon: Truck,
  },
  {
    title: 'استبدال وصيانة',
    text: 'تجربة موحدة للبيع والاستبدال والصيانة مثل المتاجر الكبيرة وبثيم داكن احترافي.',
    icon: Wrench,
  },
]

const marketBadges = ['iPhone', 'iPad', 'MacBook', 'Accessories', 'Trade-in', 'Maintenance']

export default function CommerceHighlights() {
  return (
    <section className="commerce-section" aria-label="مميزات Boox Store">
      <div className="commerce-hero-card anim-reveal">
        <div className="commerce-hero-copy">
          <span className="commerce-eyebrow">
            <Sparkles size={16} />
            متجر Apple متكامل
          </span>
          <h2>تجربة تسوق داكنة واحترافية تنافس أكبر المتاجر</h2>
          <p>
            واجهة واضحة للعميل، بطاقات منتجات قوية، وبيانات متزامنة من Supabase للمنتجات والطلبات والصيانة
            والاستبدال.
          </p>
        </div>
        <div className="commerce-badges" aria-label="أقسام وخدمات المتجر">
          {marketBadges.map((badge) => (
            <span key={badge}>{badge}</span>
          ))}
        </div>
      </div>

      <div className="commerce-trust-grid">
        {trustCards.map((card, index) => {
          const Icon = card.icon
          return (
            <div key={card.title} className="commerce-trust-card anim-reveal" style={{ animationDelay: `${index * 0.05}s` }}>
              <div className="commerce-trust-icon">
                <Icon size={24} />
              </div>
              <div>
                <h3>{card.title}</h3>
                <p>{card.text}</p>
              </div>
              <BadgeCheck className="commerce-check" size={18} />
            </div>
          )
        })}
      </div>
    </section>
  )
}
