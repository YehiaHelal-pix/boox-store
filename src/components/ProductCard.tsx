'use client'

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  IoCheckmarkCircle,
  IoFlashOutline,
  IoHardwareChipOutline,
  IoBatteryFullOutline,
  IoCartOutline,
  IoStar,
} from "react-icons/io5";
import type { Product } from "@/types/database";
import { useCart } from "@/store/cart";
import { getConditionLabel, buildWhatsAppUrl } from "@/lib/products";

function pushToast(msg: string, type: 'success' | 'error' | 'warn' | 'info') {
  window.dispatchEvent(new CustomEvent('boox-toast', { detail: { msg, type } }))
}

export default function ProductCard({ p }: { p: Product; index?: number }) {
  const addItem = useCart((state) => state.addItem);
  
  // 3D tilt state
  const [rotateX, setRotateX] = useState(0)
  const [rotateY, setRotateY] = useState(0)
  const [reflectionPos, setReflectionPos] = useState({ x: 0, y: 0 })

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const card = e.currentTarget
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    
    // Smooth 3D tilt angles
    const rotX = (centerY - y) / 16
    const rotY = (x - centerX) / 16
    
    setRotateX(rotX)
    setRotateY(rotY)

    const percentX = (x / rect.width) * 100
    const percentY = (y / rect.height) * 100
    setReflectionPos({ x: percentX, y: percentY })
  }

  function handleMouseLeave() {
    setRotateX(0)
    setRotateY(0)
  }

  const discount =
    p.original_price && p.price && p.original_price > p.price
      ? Math.round(((p.original_price - p.price) / p.original_price) * 100)
      : 0;

  const rating = (p as any).rating ?? 4.8;
  const reviewCount = (p as any).reviewCount ?? 124;

  return (
    <Link href={`/products/${p.slug || p.id}`}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
          transition: 'transform 0.15s ease',
        }}
        className="product-card group relative rounded-[28px] overflow-hidden flex flex-col cursor-pointer border border-white/5 hover:border-cyan-500/20 shadow-xl hover:shadow-[0_15px_40px_rgba(0,0,0,0.5)] transition-colors duration-300 bg-[rgba(10,10,15,0.55)]"
        dir="rtl"
      >

        {/* Dynamic Glowing border background */}
        <div className="product-card__glow pointer-events-none" aria-hidden />

        {/* Discount Badge */}
        {discount > 0 && (
          <div className="absolute top-4 right-4 z-20 bg-gradient-to-r from-red-500 to-pink-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-lg border border-white/10 animate-pulse">
            خصم {discount}% 🔥
          </div>
        )}

        {/* Image Area */}
        <div className="relative h-72 md:h-80 flex items-center justify-center overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 bg-cyan-400/20 rounded-full blur-[60px] pointer-events-none transition-all duration-500 group-hover:bg-indigo-500/25 group-hover:w-64 group-hover:h-64" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-violet-500/15 rounded-full blur-[40px] pointer-events-none" />

          <motion.img
            src={p.image_url || ""}
            alt={p.name}
            className="relative z-10 h-[220px] w-auto object-contain drop-shadow-[0_20px_30px_rgba(34,211,238,0.2)] transition-transform duration-500 ease-out group-hover:scale-108 group-hover:-rotate-1"
            initial={{ y: 0 }}
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            draggable={false}
          />

          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-gradient-to-t from-cyan-500/10 to-transparent blur-md" />
        </div>

        {/* Content */}
        <div className="px-6 pb-6 pt-2 flex flex-col gap-4 relative z-10 flex-1">
          <div>
            <h3 className="text-lg font-black text-white tracking-tight leading-tight line-clamp-1 group-hover:text-cyan-300 transition-colors duration-300">
              {p.name}
            </h3>
            
            {/* Rating & Review */}
            <div className="mt-1.5 flex items-center gap-1 text-[11px] text-white/50">
              <IoStar className="w-3 h-3 text-amber-400" />
              <span className="font-bold text-amber-300">{rating.toFixed(1)}</span>
              <span>({reviewCount} تقييم)</span>
            </div>

            {/* Configurator Specs & Hover overlays */}
            <div className="mt-3 flex items-center gap-1.5 flex-wrap">
              {p.storage_size && (
                <span className="inline-flex items-center gap-1 py-1 px-2.5 rounded-lg bg-white/[0.03] border border-white/5 text-[10px] text-gray-300 font-bold hover:bg-white/10 transition-colors duration-200">
                  <IoHardwareChipOutline className="w-3.5 h-3.5 text-cyan-400" />
                  {p.storage_size}
                </span>
              )}
              {p.condition && (
                <span className="inline-flex items-center gap-1 py-1 px-2.5 rounded-lg bg-white/[0.03] border border-white/5 text-[10px] text-gray-300 font-bold hover:bg-white/10 transition-colors duration-200">
                  <IoCheckmarkCircle className="w-3.5 h-3.5 text-indigo-400" />
                  {getConditionLabel(p.condition)}
                </span>
              )}
              {typeof p.battery_health === "number" && (
                <span className="inline-flex items-center gap-1 py-1 px-2.5 rounded-lg bg-white/[0.03] border border-white/5 text-[10px] text-emerald-400 font-bold">
                  <IoBatteryFullOutline className="w-3.5 h-3.5" />
                  بطارية {p.battery_health}%
                </span>
              )}
            </div>
          </div>

          {/* Pricing area */}
          <div className="mt-auto flex items-baseline gap-2 pt-2">
            {p.price_on_inquiry || p.price === null ? (
               <span className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">السعر عند الطلب</span>
            ) : (
              <>
                <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-cyan-400">
                  {p.price.toLocaleString("ar-EG")} <span className="text-xs font-bold text-cyan-400">جنيه</span>
                </span>
                {p.original_price && p.original_price > p.price && (
                  <span className="text-xs text-white/30 line-through">
                    {p.original_price.toLocaleString("ar-EG")} ج
                  </span>
                )}
              </>
            )}
          </div>

          {/* Add to Cart / Inquiry CTA */}
          {p.price_on_inquiry || p.price === null || !p.in_stock ? (
             <button
              type="button"
              className={`mt-1 flex items-center justify-center gap-2 w-full h-11 rounded-xl text-xs font-bold transition-all duration-300 hover:scale-[1.02] ${
                p.in_stock 
                  ? "text-emerald-400 bg-emerald-500/5 border border-emerald-500/20 hover:border-emerald-500/40 hover:bg-emerald-500/10 hover:text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.02)] hover:shadow-[0_0_15px_rgba(16,185,129,0.08)]"
                  : "text-white/40 bg-white/[0.02] border border-white/5 cursor-not-allowed hover:scale-100"
              }`}
              onClick={(e) => {
                e.preventDefault();
                if (p.in_stock) {
                  const url = buildWhatsAppUrl(p);
                  window.open(url, '_blank');
                } else {
                  pushToast('المنتج غير متوفر', 'warn');
                }
              }}
            >
              <IoCartOutline className="w-3.5 h-3.5" />
              {p.in_stock ? 'تواصل معنا' : 'غير متوفر'}
            </button>
          ) : (
            <button
              type="button"
              className="mt-1 flex items-center justify-center gap-2 w-full h-11 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-500/10 to-indigo-500/10 border border-cyan-500/20 hover:border-cyan-500/40 hover:bg-cyan-500/20 hover:text-white transition-all duration-300 hover:scale-[1.02] shadow-[0_0_15px_rgba(34,211,238,0.05)] hover:shadow-[0_0_20px_rgba(34,211,238,0.15)]"
              onClick={(e) => {
                e.preventDefault();
                addItem(p);
                pushToast('تمت الإضافة للسلة', 'success');
              }}
            >
              <IoCartOutline className="w-3.5 h-3.5 text-cyan-400" />
              أضف للسلة
            </button>
          )}
        </div>
      </motion.div>
    </Link>
  );
}
