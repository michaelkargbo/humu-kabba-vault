import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import ProductCard from '@/components/shop/ProductCard'
import { Product } from '@/types/database'

interface ProductSectionProps {
  title: string
  subtitle?: string
  products: Product[]
  viewAllHref: string
}

export default function ProductSection({ title, subtitle, products, viewAllHref }: ProductSectionProps) {
  if (products.length === 0) return null

  return (
    <section>
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="section-title">{title}</h2>
          {subtitle && <p className="text-vault-muted text-sm mt-1">{subtitle}</p>}
          <div className="gold-divider w-16 mt-2" />
        </div>
        <Link href={viewAllHref} className="flex items-center gap-1 text-sm text-gold hover:text-gold-light transition-colors font-medium">
          View All <ArrowRight size={14} />
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
        {products.slice(0, 8).map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}

