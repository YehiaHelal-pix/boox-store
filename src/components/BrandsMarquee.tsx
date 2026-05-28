'use client'

const ITEMS = [
  'Apple Authorized',
  'AppleCare',
  'iCloud',
  'iOS 18',
  'Apple Intelligence',
  'Trade-In',
  'Pay Later',
  'ضمان معتمد',
]

export default function BrandsMarquee() {
  return (
    <div
      className="overflow-hidden border-y border-white/10 py-4 relative z-10"
      dir="ltr"
      aria-label="شعارات الشركاء"
      role="marquee"
    >
      <div className="flex gap-12 animate-marquee whitespace-nowrap">
        {[...ITEMS, ...ITEMS].map((text, i) => (
          <span key={i} className="text-white/40 text-sm font-medium tracking-wide flex items-center gap-2">
            <span className="text-[var(--neon-2)] text-[8px]">◆</span> {text}
          </span>
        ))}
      </div>
    </div>
  )
}
