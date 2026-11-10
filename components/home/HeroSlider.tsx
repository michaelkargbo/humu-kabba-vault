'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Banner } from '@/types/database'

const DEFAULT_BANNERS = [
  { id: '1', title: 'Fashion, Beauty & Lifestyle', body: 'Discover the latest trends at Humu Kabba Variety Vault', image_url: '/assets/dresses.jpg', link_url: '/shop', active: true, sort_order: 0, created_at: '' },
  { id: '2', title: 'New Arrivals Every Week', body: 'Fresh styles just for you — Shop the new collection', image_url: '/assets/bags.jpg', link_url: '/shop?sort=newest', active: true, sort_order: 1, created_at: '' },
  { id: '3', title: 'Beauty & Skincare', body: 'Premium cosmetics and fragrances at great prices', image_url: '/assets/beauty.jpg', link_url: '/shop?category=beauty', active: true, sort_order: 2, created_at: '' },
]

export default function HeroSlider({ banners }: { banners: Banner[] }) {
  const slides = banners.length > 0 ? banners : DEFAULT_BANNERS
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setCurrent(c => (c + 1) % slides.length), 5000)
    return () => clearInterval(timer)
  }, [slides.length])

  const prev = () => setCurrent(c => (c - 1 + slides.length) % slides.length)
  const next = () => setCurrent(c => (c + 1) % slides.length)

  return (
    <section className="relative h-[55vw] min-h-[280px] max-h-[560px] overflow-hidden bg-vault-surface" aria-label="Promotional banner">
      {slides.map((slide, i) => (
        <div key={slide.id} className={`absolute inset-0 transition-opacity duration-700 ${i === current ? 'opacity-100' : 'opacity-0'}`}>
          <Image src={slide.image_url || '/assets/dresses.jpg'} alt={slide.title} fill className="object-cover" priority={i === 0} />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
          <div className="absolute inset-0 flex items-center">
            <div className="max-w-7xl mx-auto px-6 md:px-12">
              <div className="max-w-lg animate-fade-in">
                <h1 className="font-heading text-3xl md:text-5xl font-bold text-white mb-3 leading-tight">{slide.title}</h1>
                {slide.body && <p className="text-white/80 text-base md:text-lg mb-6">{slide.body}</p>}
                <div className="flex gap-3">
                  <Link href={slide.link_url || '/shop'} className="btn-gold text-sm md:text-base">Shop Now</Link>
                  <a href="https://wa.me/23277416008" target="_blank" rel="noopener noreferrer" className="btn-outline-gold text-sm md:text-base border-white text-white hover:bg-white hover:text-vault-bg">
                    💬 WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Arrows */}
      <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition-all" aria-label="Previous">
        <ChevronLeft size={20} />
      </button>
      <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition-all" aria-label="Next">
        <ChevronRight size={20} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)}
            className={`w-2 h-2 rounded-full transition-all ${i === current ? 'bg-gold w-6' : 'bg-white/50'}`}
            aria-label={`Slide ${i + 1}`} />
        ))}
      </div>
    </section>
  )
}

