import Link from 'next/link'
import Image from 'next/image'
import { Category } from '@/types/database'

const DEFAULT_CATEGORIES = [
  { id: 'c1', name: 'Dresses', slug: 'dresses', image_url: '/assets/dresses.jpg', description: null, parent_id: null, sort_order: 0, active: true, created_at: '' },
  { id: 'c2', name: 'Bags', slug: 'bags', image_url: '/assets/bags.jpg', description: null, parent_id: null, sort_order: 1, active: true, created_at: '' },
  { id: 'c3', name: 'Shoes', slug: 'shoes', image_url: '/assets/shoes.jpg', description: null, parent_id: null, sort_order: 2, active: true, created_at: '' },
  { id: 'c4', name: 'Beauty', slug: 'beauty', image_url: '/assets/beauty.jpg', description: null, parent_id: null, sort_order: 3, active: true, created_at: '' },
  { id: 'c5', name: 'Phone Cases', slug: 'phone-cases', image_url: '/assets/cases/crystal_shell.jpg', description: null, parent_id: null, sort_order: 4, active: true, created_at: '' },
  { id: 'c6', name: 'Accessories', slug: 'accessories', image_url: '/assets/bags.jpg', description: null, parent_id: null, sort_order: 5, active: true, created_at: '' },
]

export default function CategoryGrid({ categories }: { categories: Category[] }) {
  const display = categories.length > 0 ? categories : DEFAULT_CATEGORIES

  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="section-title text-center mb-6">Shop by Category</h2>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
        {display.map(cat => (
          <Link key={cat.id} href={`/shop?category=${cat.slug}`}
            className="group flex flex-col items-center gap-2 p-3 rounded-2xl bg-vault-card border border-vault-border hover:border-gold/40 transition-all">
            <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-gold/20 group-hover:border-gold transition-colors">
              <Image src={cat.image_url || '/assets/bags.jpg'} alt={cat.name} fill className="object-cover" />
            </div>
            <span className="text-xs text-vault-muted group-hover:text-gold transition-colors font-medium text-center leading-tight">{cat.name}</span>
          </Link>
        ))}
        <Link href="/shop" className="group flex flex-col items-center gap-2 p-3 rounded-2xl bg-vault-card border border-gold/30 hover:border-gold transition-all">
          <div className="w-16 h-16 rounded-full bg-gold-gradient flex items-center justify-center">
            <span className="text-vault-bg font-bold text-lg">+</span>
          </div>
          <span className="text-xs text-gold font-medium">View All</span>
        </Link>
      </div>
    </section>
  )
}

