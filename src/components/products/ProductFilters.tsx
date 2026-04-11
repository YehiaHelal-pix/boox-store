'use client'
import { Filter } from 'lucide-react'

const categories = [
    { id: 'all', name: 'الكل' },
    { id: 'iphone', name: 'iPhone' },
    { id: 'ipad', name: 'iPad' },
    { id: 'macbook', name: 'MacBook' },
    { id: 'airpods', name: 'AirPods' },
    { id: 'accessories', name: 'إكسسوارات' }
]

export default function ProductFilters({ activeCategory, onSelectCategory }: { activeCategory: string, onSelectCategory: (c: string) => void }) {
    return (
        <div className="flex items-center gap-2 md:gap-4 w-full overflow-x-auto pb-4 pt-2 px-1 scrollbar-hide snap-x">
            <div className="hidden md:flex items-center gap-2 text-[var(--text-muted)] px-2">
                <Filter size={18} />
                <span className="text-sm border-l border-[var(--border)] pl-4 ml-2">تصفية</span>
            </div>
            {categories.map(cat => (
                <button
                    key={cat.id}
                    onClick={() => onSelectCategory(cat.id)}
                    className={`snap-start whitespace-nowrap px-5 py-2 rounded-full text-sm font-bold transition-all border min-w-[70px] flex items-center justify-center min-h-[44px]
            ${activeCategory === cat.id
                            ? 'bg-[var(--neon)] text-white border-[var(--neon-cyan)] shadow-[0_0_10px_rgba(99,102,241,0.5)]'
                            : 'glass hover:bg-[var(--glass-hover)] border-[var(--border)] text-[var(--text-muted)]'}`}
                >
                    {cat.name}
                </button>
            ))}
        </div>
    )
}
